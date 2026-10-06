'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_QA_ARTIFACT_DIR,probe=process.argv.includes('--probe');
const reviewed=JSON.parse(fs.readFileSync(path.join(root,'bank/data/final8-reviewed.json'),'utf8'));
for(const item of reviewed.items.filter(x=>[16,25].includes(x.sourceNo)))assert.match(item.asset,/^data:image\/png;base64,/);
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const local='http://127.0.0.1:'+server.address().port,base=process.env.GFIELD_QA_BASE_URL||local;
  const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[],writes=[];
  await page.addInitScript(()=>{window.__GFIELD_BANK_ACCESS_FORCE__=false;window.print=()=>{window.qaPrinted=true};});
  await page.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.origin===new URL(base).origin){
      if(base!==local&&u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:["그림검수학생"],studentTypes:{},archiveProductAccess:{"mock-final-8":["*"]}};'});
      return route.continue();
    }
    if(route.request().method()!=='GET')writes.push(u.pathname);
    return route.abort();
  });
  if(base!==local)await page.addInitScript(()=>{if(location.origin!=='null')localStorage.setItem('gfield_student','그림검수학생');});
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(base+'/bank/index.html?bank=final8&gens=final8-q16,final8-q20,final8-q25&view=grouped&layout=compact&printMode=questions&n=20');
    await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')&&!document.querySelector('#final1Worksheet #btnPrint').disabled);
    await page.locator('.question-page .f1-qfigure img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
    assert.equal(await page.locator('.question-page .f1-qfigure img').count(),9);
    const measure=()=>page.locator('.question-page .f1-qcard').evaluateAll(cards=>cards.map(c=>{
      const box=c.getBoundingClientRect(),text=c.querySelector('.f1-qtext').getBoundingClientRect(),image=c.querySelector('img'),figure=image.getBoundingClientRect(),last=c.lastElementChild.getBoundingClientRect();
      return {sourceNo:+c.dataset.sourceNo,id:c.querySelector('[data-item-id]').dataset.itemId,cardH:Math.round(box.height),textH:Math.round(text.height),figureH:Math.round(figure.height),overflow:Math.round(Math.max(last.bottom,figure.bottom,text.bottom)-box.bottom),horizontalOverflow:Math.round(figure.right-box.right),decoded:image.naturalWidth>0,figureWidth:Math.round(figure.width)};
    }));
    const desktop=await measure();
    await page.emulateMedia({media:'print'});await page.setViewportSize({width:703,height:1123});const print=await measure();
    const check=rows=>{for(const row of rows){assert.ok(row.decoded);assert.ok(row.overflow<=1,JSON.stringify(row));assert.ok(row.horizontalOverflow<=1,JSON.stringify(row));}};
    if(!probe){check(desktop);check(print);}
    assert.equal(await page.locator('#stage .question-page').count(),0,'Final8 must not also print the legacy unrelated generator');
    assert.equal(await page.locator('#final1Worksheet .question-page').first().locator('.f1-qcard').count(),6);
    assert.equal(await page.locator('#final1Worksheet .f1-large-figure').count(),3);
    if(out){fs.mkdirSync(out,{recursive:true});await page.pdf({path:path.join(out,'final8-six-questions.pdf'),preferCSSPageSize:true,printBackground:true});await page.locator('#final1Worksheet .question-page').first().screenshot({path:path.join(out,'final8-six-questions-page1.png')});await page.locator('#final1Worksheet .f1-large-figure').first().screenshot({path:path.join(out,'final8-route-a4.png')});}
    await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});const mobile=await measure();if(!probe)check(mobile);
    if(out)await page.locator('.qcard[data-source-no="25"]').first().screenshot({path:path.join(out,'final8-route-mobile.png')});
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:!probe,base,images:9,desktop,print,mobile,productionWrites:0}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
