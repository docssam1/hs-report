'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const output=process.env.GFIELD_FINAL2_REVIEW_DIR;
const expected={7:'199번째',15:'422',25:'79개',26:'14살'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const writes=[];
    await context.route(/^https?:\/\//,route=>{
      const request=route.request(),url=new URL(request.url());
      if(!['GET','HEAD'].includes(request.method())) writes.push(request.method()+' '+url.pathname);
      if(url.hostname==='127.0.0.1') {
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      if(url.hostname.endsWith('supabase.co'))return route.fulfill({contentType:'application/json',body:'[]'});
      return route.fulfill({status:204,body:''});
    });
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const base=`http://127.0.0.1:${server.address().port}`;
    await page.goto(base+'/final.html?round=2&name=docssam&go=answer&preview=1',{waitUntil:'domcontentloaded'});
    await page.locator('#btnGrade').waitFor();
    assert.equal(await page.locator('.detailed-solution').count(),0,'no worked answer before grading');
    for(let no=1;no<=30;no++)if(!Object.hasOwn(expected,no))await page.locator('.abtn').nth(no-1).click();
    await page.locator('#btnGrade').click();
    await page.locator('.detailed-solution').first().waitFor();
    assert.equal(await page.locator('.detailed-solution').count(),4);
    for(const [no,answer] of Object.entries(expected)){
      const card=page.locator(`[data-solution-no="${no}"]`);
      assert.match(await card.locator('h3').innerText(),new RegExp(answer));
      assert.ok((await card.innerText()).length>240,'substantive worked steps');
      assert.equal(await card.locator('.solution-watermark span').count(),3);
    }
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      for(const no of Object.keys(expected)){
        const card=page.locator(`[data-solution-no="${no}"]`);
        const bounds=await card.evaluate(el=>({w:el.clientWidth,sw:el.scrollWidth,right:el.getBoundingClientRect().right}));
        assert.ok(bounds.sw<=bounds.w+1&&bounds.right<=width+1,`${no} readable at ${width}px`);
        if(output){fs.mkdirSync(output,{recursive:true});await card.screenshot({path:path.join(output,`q${no}-${width}.png`)});}
      }
    }
    if(output){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,'final2-report.pdf'),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});}
    await page.goto(base+'/answer.html?set=final&round=2&name=docssam',{waitUntil:'domcontentloaded'});
    await page.locator('#body tr').first().waitFor();
    assert.equal(await page.locator('#body tr').count(),30);
    for(const [no,answer] of Object.entries(expected))assert.equal(await page.locator('#body tr').nth(Number(no)-1).locator('.ans').innerText(),answer);
    assert.deepEqual(writes,[],'preview/read-back must never write student results');
    assert.deepEqual(errors,[]);
    console.log('PASS Final2 detailed solutions, answer table, desktop/mobile, pre-attempt boundary, zero student writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
