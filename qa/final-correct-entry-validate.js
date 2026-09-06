'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext(),writes=[],errors=[];
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(!['GET','HEAD'].includes(req.method()))writes.push(req.method());
      if(url.hostname==='127.0.0.1'){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/final.html?round=1&name=docssam&go=answer&preview=1`;
    await page.goto(url);await page.locator('#agrid').waitFor();
    assert.equal(await page.locator('.abtn').count(),30);
    assert.equal(await page.locator('.abtn[aria-pressed="true"]').count(),0);
    assert.equal(await page.locator('#ccount').innerText(),'0');
    assert.equal(await page.locator('#wcount').innerText(),'30');
    assert.equal(await page.locator('#entryScore').innerText(),'0');
    page.once('dialog',d=>d.dismiss());await page.locator('#btnGrade').click();
    assert.equal(await page.locator('#agrid').count(),1,'zero score requires explicit confirmation');
    const first=page.locator('.abtn').first();await first.focus();await page.keyboard.press('Space');
    assert.equal(await first.getAttribute('aria-pressed'),'true');
    assert.equal(await first.evaluate(el=>document.activeElement===el),true,'focus preserved after toggle');
    await page.keyboard.press('Enter');assert.equal(await first.getAttribute('aria-pressed'),'false');
    for(const no of [1,13,23])await page.locator('.abtn').nth(no-1).click();
    assert.equal(await page.locator('#ccount').innerText(),'3');
    assert.equal(await page.locator('#wcount').innerText(),'27');
    assert.equal(await page.locator('#entryScore').innerText(),'10.3');
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const box=await first.boundingBox();assert.ok(box.width>=44&&box.height>=44,'touch target');
      if(process.env.GFIELD_ENTRY_REVIEW_DIR){fs.mkdirSync(process.env.GFIELD_ENTRY_REVIEW_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GFIELD_ENTRY_REVIEW_DIR,`correct-entry-${width}.png`),fullPage:true});}
    }
    await page.locator('#btnGrade').click();await page.locator('.report-screen-header').waitFor();
    assert.match(await page.locator('.report-screen-header').innerText(),/10\.3/);
    assert.equal(await page.locator('#detailWrap tr.r-ok:not(.cau)').count(),3);
    const marks=await page.locator('#detailWrap tr:not(.cau) td:nth-child(2)').allTextContents();
    assert.deepEqual(marks,Array.from({length:30},(_,i)=>[1,13,23].includes(i+1)?'○':'✕'));
    await page.goto(url);await page.locator('#agrid').waitFor();
    for(let no=1;no<=30;no++)await page.locator('.abtn').nth(no-1).click();
    assert.equal(await page.locator('#entryScore').innerText(),'100');
    await page.locator('#btnClear').click();assert.equal(await page.locator('#entryScore').innerText(),'0');
    assert.equal(await page.locator('.abtn.correct').count(),0);
    page.once('dialog',d=>d.accept());await page.locator('#btnGrade').click();
    await page.locator('.report-screen-header').waitFor();
    assert.deepEqual(await page.locator('#detailWrap tr:not(.cau) td:nth-child(2)').allTextContents(),Array(30).fill('✕'),'explicit zero remains possible');
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log('PASS correct-only selection, unselected X, keyboard/focus, score10.3/100/0, clear, zero confirmation, desktop/mobile, zero writes');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
