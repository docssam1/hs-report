'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'final.html'),'utf8');
const part=html.slice(html.indexOf('  function percentileOf('),html.indexOf('  /* 전체 평균·분포·문항 정답률'));
const sandbox={round1:x=>Math.round(x*10)/10,esc:s=>String(s).replace(/[<>&"]/g,'?'),populationStatsVerified:s=>s.testVerified===true};
vm.createContext(sandbox);vm.runInContext(part,sandbox);
const sample={testVerified:true,n:5,dist:[90,70,70,40,20],cuts:[['위',70],['중',40],['하',10],['노력요함',0]]};
let result=sandbox.cutReferenceHTML({S:sample});
assert.match(result,/40\.0%/);assert.match(result,/80\.0%/);assert.match(result,/100\.0%/);
assert.doesNotMatch(result,/120\.0%|5명|응시 인원|노력요함/);
sample.testVerified=false;
result=sandbox.cutReferenceHTML({S:sample});
assert.doesNotMatch(result,/\d+(?:\.\d+)?%/);assert.equal((result.match(/확인 중/g)||[]).length,3);
assert.equal(sandbox.cutReferenceHTML({S:{}}),'');
const output=process.env.GFIELD_CUT_REVIEW_DIR;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext();const writes=[];
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(!['GET','HEAD'].includes(req.method()))writes.push(req.method());
      if(url.hostname==='127.0.0.1'){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    const page=await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=1&name=docssam&go=answer&preview=1`);
    for(let no=1;no<=30;no++)await page.locator('.abtn').nth(no-1).click();
    await page.locator('#btnGrade').click();
    const table=page.locator('.cut-reference');await table.waitFor();
    assert.equal(await table.locator('tbody tr').count(),5);
    assert.match(await table.innerText(),/12\.8점/);
    assert.doesNotMatch(await table.innerText(),/\d+명|\d+등|\d+(?:\.\d+)?%/);
    assert.equal(await table.locator('.cut-watermark').count(),1);
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      assert.ok(await table.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      if(output){fs.mkdirSync(output,{recursive:true});await table.screenshot({path:path.join(output,`cut-${width}.png`)});}
    }
    if(output){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,'cut-report.pdf'),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});}
    assert.deepEqual(writes,[]);
    console.log('PASS cutoff math/ties/bounds, unverified withheld, Final1 12.8, count privacy, desktop/mobile, watermark, zero writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
