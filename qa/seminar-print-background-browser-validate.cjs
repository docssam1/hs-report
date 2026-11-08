'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright'),root=path.resolve(__dirname,'..'),baseline=process.argv.includes('--baseline'),out=path.join(root,'.private-work/seminar-print-performance-20261108');
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.pdf':'application/pdf','.css':'text/css','.json':'application/json','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();const errors=[];
 try{
  const ctx=await browser.newContext();await ctx.addInitScript(()=>{if(window.top!==window)return;window.print=()=>{};const native=window.open;window.open=function(...args){const p=native.apply(this,args);if(p)p.print=()=>{p.__printCalls=(p.__printCalls||0)+1;};return p;};});
  await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(u.pathname==='/hs-auth.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_AUTH={getSession:async()=>({login_name:"노관호"})};'});if(u.pathname==='/hs-email-login.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_EMAIL_LOGIN={check:async()=>({ok:true})};'});return route.continue();});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>!document.querySelector('.exam-print[data-round="recall"]').disabled);
  // Opening an active popup can suspend animation frames in the original tab.
  await page.evaluate(()=>{window.__blockedRaf=0;window.requestAnimationFrame=()=>{window.__blockedRaf++;return 0;};});
  const popup=page.waitForEvent('popup'),started=Date.now();await page.evaluate(()=>document.querySelector('.exam-print[data-round="recall"][data-kind="questions"]').click());const print=await popup;
  let result;
  if(baseline){await page.waitForFunction(()=>window.__blockedRaf>0,null,{polling:50,timeout:5000});assert.notEqual(await print.evaluate(()=>document.documentElement.dataset.printReady),'true');result={baselineBlocked:true,suppressedAnimationFrames:await page.evaluate(()=>window.__blockedRaf),progress:await print.locator('#progress').innerText()};}
  else{
   await print.waitForFunction(()=>document.documentElement.dataset.printReady==='true',null,{timeout:15000});assert.equal(await print.locator('.sheet').count(),23);assert.equal(await print.locator('.watermark span').count(),69);assert.equal(await print.evaluate(()=>window.__printCalls),1);
   result={pass:true,readyMs:Date.now()-started,suppressedAnimationFrames:await page.evaluate(()=>window.__blockedRaf),pages:23,watermarks:69,automaticPrintCalls:1};await print.screenshot({path:path.join(out,'background-print-ready.png')});
   await print.close();await page.waitForFunction(()=>!document.querySelector('.exam-print[data-round="recall"]').disabled,null,{polling:50});
   // A stalled PDF download must end in a recoverable error, never a partial print.
   await page.evaluate(()=>{window.pdfjsLib={...window.pdfjsLib,getDocument:()=>({promise:new Promise(()=>{}),destroy:async()=>{window.__loadingDestroyed=true;}})};const native=window.setTimeout;window.setTimeout=(fn,ms,...args)=>native(fn,ms===45000?80:ms,...args);});
   const pending=page.waitForEvent('popup');await page.evaluate(()=>document.querySelector('.exam-print[data-round="recall"][data-kind="questions"]').click());const failed=await pending;await failed.waitForFunction(()=>document.querySelector('#progress').textContent.includes('오래'));
   assert.equal(await failed.locator('.sheet').count(),0);assert.equal(await failed.evaluate(()=>window.__printCalls||0),0);await page.waitForFunction(()=>window.__loadingDestroyed===true,null,{polling:50});result.stalledDownloadTimesOut=true;result.partialPrintBlocked=true;
  }
  assert.deepEqual(errors,[]);result.errors=errors;result.productionWrites=0;fs.writeFileSync(path.join(out,baseline?'baseline.json':'background-review.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await ctx.close();
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
