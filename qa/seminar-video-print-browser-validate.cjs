'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),pw=process.env.GFIELD_QA_PLAYWRIGHT||'playwright';
process.env.GFIELD_QA_PLAYWRIGHT=pw;require(path.join(ROOT,'qa/email-login-test-stub'));const {chromium}=require(pw);
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';const file=path.join(ROOT,name);if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(e?'Not found':b);});});
const OUTPUT=path.join(ROOT,'.private-work/seminar-video-20261108');fs.mkdirSync(OUTPUT,{recursive:true});
const NAME='검수학생',SOURCE=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
(async()=>{
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r)});const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.GFIELD_QA_BROWSER_EXECUTABLE?{executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE}:{})});
 const report={outputs:[],layouts:[],denied:[],blockedRemoteRequests:0,productionWrites:0};
 async function context({name=NAME,rounds=[1,2],width=1440}={}){
  const ctx=await browser.newContext({viewport:{width,height:1100}});
  await ctx.route('https://**/*',r=>{report.blockedRemoteRequests++;return r.abort();});
  await ctx.addInitScript(({name})=>{window.print=()=>{window.__printCalls=(window.__printCalls||0)+1};const nativeOpen=window.open;window.open=function(...args){const w=nativeOpen.apply(this,args);if(w)w.print=()=>{w.__printCalls=(w.__printCalls||0)+1};return w};localStorage.setItem('gfield_student','다른이름');if(name)localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'qa-token',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));},{name});
  await ctx.route('**/data.js*',r=>r.fulfill({contentType:'application/javascript',body:SOURCE+`\nwindow.GFIELD_DATA.students.push(${JSON.stringify(NAME)});window.GFIELD_DATA.archiveProductAccess['mock-top-secret-finish-1']=${JSON.stringify(rounds.includes(1)?[NAME]:[])};window.GFIELD_DATA.archiveProductAccess['mock-top-secret-finish-2']=${JSON.stringify(rounds.includes(2)?[NAME]:[])};`}));
  return ctx;
 }
 try{
  for(const width of [1440,390]){
   const ctx=await context({width});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>[...document.querySelectorAll('.exam-print')].every(b=>!b.disabled));
   assert.equal(await page.locator('iframe').count(),0);await page.locator('.play img').evaluate(i=>i.decode());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const video=await page.locator('#player').boundingBox(),panel=await page.locator('.papers').boundingBox();
   assert.ok(width>900?panel.x>video.x+video.width-1:panel.y>video.y+video.height,'side on PC; below on phone');
   await page.screenshot({path:path.join(OUTPUT,`watch-print-${width}.png`),fullPage:true});
   report.layouts.push({width,overflow:false,placement:width>900?'beside video':'below video'});
   if(width===1440){
    for(const round of [1,2,'recall'])for(const kind of ['questions','solutions']){
     const opened=page.waitForEvent('popup');await page.locator(`.exam-print[data-round="${round}"][data-kind="${kind}"]`).click();const print=await opened;
     await print.waitForFunction(()=>document.documentElement.dataset.printReady==='true',null,{timeout:60000}).catch(async e=>{console.error(await print.locator('body').innerText());throw e;});await print.waitForFunction(()=>window.__printCalls===1);
     const pages=await print.locator('.sheet').count();assert.ok(pages>0);
     assert.equal(await print.locator('.watermark span').count(),pages*3);assert.equal(await print.locator('.watermark span').filter({hasText:NAME+' · 지필드 영재교육'}).count(),pages*3);
     assert.equal(await print.locator('.watermark span').filter({hasText:'다른이름'}).count(),0);
     if(round==='recall'&&kind==='questions')assert.equal(await print.locator('.sheet.landscape').count(),23);
     assert.equal(await print.locator('.sheet>img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>1000)),true);
     assert.equal(await print.evaluate(()=>document.fonts.check('600 22pt sans-serif')),true);
     const output=path.join(OUTPUT,`print-${round}-${kind}.pdf`);await print.pdf({path:output,preferCSSPageSize:true,printBackground:true});
     if(round===1&&kind==='questions')await print.screenshot({path:path.join(OUTPUT,'named-print-preview.png'),fullPage:false});
     report.outputs.push({round,kind,pages,marks:pages*3,file:output,printCalls:1});await print.close();
     await page.waitForFunction(()=>[...document.querySelectorAll('.exam-print')].every(b=>!b.disabled));
    }
    // Failed document load must not expose an unmarked original or partially print.
    await page.route('**/materials/top-secret-finish-1-solutions.pdf',r=>r.fulfill({status:503,body:'QA unavailable'}));
    const opened=page.waitForEvent('popup');await page.locator('.exam-print[data-round="1"][data-kind="solutions"]').click();const failed=await opened;
    await failed.waitForFunction(()=>document.querySelector('#progress').textContent.includes('인쇄 준비에 실패')||document.querySelector('#progress').textContent.includes('503'));
    assert.equal(await failed.locator('.sheet').count(),0);assert.equal(await failed.evaluate(()=>window.__printCalls||0),0);await failed.close();report.failedPdfBlocked=true;
   }
   await page.locator('#play').focus();await page.keyboard.press('Enter');assert.match(await page.locator('#player iframe').getAttribute('src'),/1s35OFUfGl9iR4BXoGA_Siz7F1Nq2P0Ve\/preview$/);assert.equal(await page.locator('#play').count(),0);
   assert.deepEqual(errors,[]);await ctx.close();
  }
  for(const item of [{name:null,rounds:[1,2],label:'unsigned name URL'},{name:NAME,rounds:[1],label:'round 2 not approved'}]){
   const ctx=await context(item);const page=await ctx.newPage();await page.goto(base+'/seminar/2026-video/?name=다른이름');
   if(!item.name){await page.waitForFunction(()=>document.querySelector('#print-status').textContent.includes('로그인하면'));assert.equal(await page.locator('.exam-print:disabled').count(),6);}
   else{await page.waitForFunction(()=>!document.querySelector('.exam-print[data-round="1"]').disabled);assert.equal(await page.locator('.exam-print[data-round="2"]:disabled').count(),2);}
   report.denied.push(item.label);await ctx.close();
  }
  fs.writeFileSync(path.join(OUTPUT,'print-browser-review.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
