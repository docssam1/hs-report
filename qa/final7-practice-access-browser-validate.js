'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const root=path.resolve(__dirname,'..');
const student='최종7회승인학생';
const source=fs.readFileSync(path.join(root,'data.js'),'utf8');
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);return response.end('not found');}
  const mime=({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'})[path.extname(file)]||'application/octet-stream';
  response.writeHead(200,{'content-type':mime,'cache-control':'no-store'});fs.createReadStream(file).pipe(response);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    async function open(url,product){
      const context=await browser.newContext({viewport:{width:390,height:844}});
      await context.addInitScript(({student,product})=>{
        window.__GFIELD_BANK_ACCESS_FORCE__=true;
        localStorage.setItem('gfield_student',student);
        sessionStorage.setItem('gfield_question_bank_handoff_v1',JSON.stringify({product,student,issuedAt:Date.now()}));
      },{student,product});
      await context.route(base+'/data.js*',route=>route.fulfill({contentType:'application/javascript',body:source+'\n;window.GFIELD_DATA.archiveProductAccess["question-bank"]=[];window.GFIELD_DATA.archiveProductAccess["mock-final-7"]=["'+student+'"];'}));
      await context.route('https://**/*',route=>route.abort());
      const page=await context.newPage();await page.goto(base+url,{waitUntil:'networkidle'});return {context,page};
    }
    const approved=await open('/bank/index.html?bank=final7&practice=wrong&gens=final7-q05%2Cfinal7-q06&per=3&points=all&source=final%7C7','mock-final-7');
    await approved.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===6);
    assert.equal(await approved.page.locator('#bankAccessGate').isHidden(),true,'Final7 approval opens its reviewed practice without the global bank permission');
    assert.equal(await approved.page.locator('.qcard[data-source-no="5"]').count(),3,'Q5 keeps exactly three reviewed variants');
    assert.equal(await approved.page.locator('.qcard[data-source-no="6"]').count(),3,'Q6 keeps exactly three reviewed variants');
    assert.equal(await approved.page.locator('.f1-coach-launch').count(),6,'each approved Final7 variant includes the detailed coach');
    await approved.page.goto(base+'/bank/index.html?bank=final7',{waitUntil:'networkidle'});
    await approved.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===78);
    assert.equal(await approved.page.locator('.qcard[data-source-no="29"]').count(),3,'direct Final7 entry includes all three Q29 variants');
    assert.equal(await approved.page.locator('.qcard[data-source-no="30"]').count(),3,'direct Final7 entry includes all three Q30 variants');
    await approved.context.close();

    const wrongProduct=await open('/bank/index.html?bank=final2','mock-final-7');
    assert.equal(await wrongProduct.page.locator('#bankAccessGate').isVisible(),true,'Final7 approval cannot open another round or the general bank');
    assert.equal(await wrongProduct.page.locator('.qcard').count(),0,'no other-round questions render through the scoped approval');
    await wrongProduct.context.close();
    console.log('PASS Final7 scoped practice access: 3 reviewed variants per source, detailed coach, no global bank or other-round grant');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
