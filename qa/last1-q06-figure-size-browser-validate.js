'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_QA_ARTIFACT_DIR,probe=process.argv.includes('--probe');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(location.origin!=='null')localStorage.setItem('gfield_student','검수용가상학생');});
  await page.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.origin===new URL(base).origin){
      if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:["검수용가상학생"],studentTypes:{},archiveAccess:{"최종 모의고사":["*"]},attendance:{}};'});
      return route.continue();
    }
    if(route.request().method()!=='GET')writes.push(u.pathname);
    return route.abort();
  });
  const layout=process.env.GFIELD_QA_LAYOUT||'editorial';
  const url=base+'/bank/index.html?bank=last1&gens=last1-q06&view=grouped&layout='+layout+'&printMode=both';
  try{
    await page.goto(url);await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')&&!document.querySelector('#final1Worksheet #btnPrint').disabled);
    await page.locator('#final1Worksheet .qcard img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
    assert.equal(await page.locator('#final1Worksheet .qcard').count(),3);
    assert.equal(await page.locator('#final1Worksheet [data-answer-id]').count(),3);
    if(!probe)assert.equal(await page.locator('#stage .question-page').count(),0,'Only selected last1 questions may print');
    const measure=()=>page.locator('#final1Worksheet .qcard').evaluateAll(cards=>cards.map(c=>{
      const box=c.getBoundingClientRect(),img=c.querySelector('img'),image=img.getBoundingClientRect(),last=c.lastElementChild.getBoundingClientRect();
      return {id:c.querySelector('[data-item-id]').dataset.itemId,width:Math.round(image.width),height:Math.round(image.height),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,overflow:Math.round(Math.max(last.bottom,image.bottom)-box.bottom),horizontalOverflow:Math.round(image.right-box.right)};
    }));
    const desktop=await measure();
    await page.emulateMedia({media:'print'});await page.setViewportSize({width:703,height:1123});const print=await measure();
    if(out){fs.mkdirSync(out,{recursive:true});await page.pdf({path:path.join(out,'last1-q06.pdf'),preferCSSPageSize:true,printBackground:true});await page.locator('#final1Worksheet .qcard').nth(1).screenshot({path:path.join(out,'variant2-a4.png')});await page.locator('#final1Worksheet .qcard').nth(2).screenshot({path:path.join(out,'variant3-a4.png')});}
    await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});const mobile=await measure();
    if(out)await page.locator('#final1Worksheet .qcard').nth(1).screenshot({path:path.join(out,'variant2-mobile.png')});
    if(!probe){for(const rows of [desktop,print,mobile])for(const row of rows){assert.ok(row.overflow<=1,JSON.stringify(row));assert.ok(row.horizontalOverflow<=1,JSON.stringify(row));}for(const row of desktop.slice(1).concat(print.slice(1)))assert.ok(row.width>=600,JSON.stringify(row));for(const row of mobile.slice(1))assert.ok(row.width>=290,JSON.stringify(row));}
    assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
    console.log(JSON.stringify({pass:!probe,base,layout,desktop,print,mobile,productionWrites:0}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
