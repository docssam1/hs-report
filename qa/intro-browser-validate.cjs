'use strict';
// Isolated frontend sessions only: no real authentication, mail, grades or access-log writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='인트로검수학생',out=path.join(root,'.private-work/intro-test-week-20261023/v2-final');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.mp4':'video/mp4','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
 const size=fs.statSync(file).size,range=req.headers.range;
 res.setHeader('accept-ranges','bytes');
 if(range){const m=/bytes=(\d+)-(\d*)/.exec(range);if(!m){res.writeHead(416);return res.end();}const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'content-range':`bytes ${start}-${end}/${size}`,'content-length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
 else {res.setHeader('content-length',size);fs.createReadStream(file).pipe(res);}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.GFIELD_INTRO_QA_BASE||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({args:['--autoplay-policy=user-gesture-required']}),writes=[],errors=[];
 async function setup(saved=false,blocked=false,viewport={width:390,height:844}){
  const c=await browser.newContext({viewport});
  await c.addInitScript(({saved,blocked,student})=>{
   if(!/^https?:$/.test(location.protocol))return;
   if(saved){localStorage.setItem('gfield_student',student);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'qa-intro',refresh_token:'qa-refresh',login_name:student,expires_at:Math.floor(Date.now()/1000)+3600}));}
   if(blocked){const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return window.qaAllowPlay?play.call(this):Promise.reject(new DOMException('Blocked for isolated QA','NotAllowedError'));};}
  },{saved,blocked,student});
  await c.route(/^https?:\/\//,async route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.origin===base){
    if(u.pathname==='/data.js'){const resp=await route.fetch();return route.fulfill({response:resp,body:await resp.text()+`\n;(()=>{const d=window.GFIELD_DATA;d.students.push(${JSON.stringify(student)});d.studentTypes[${JSON.stringify(student)}]='resident';})();`});}
    if(u.pathname==='/final.html')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>QA destination</title>Destination'});
    return route.continue();
   }
   if(u.hostname.endsWith('supabase.co')){
    if(u.pathname==='/functions/v1/hs-parent-auth')return route.fulfill({json:{ok:true,student}});
    if(u.pathname==='/rest/v1/access_log')return route.fulfill({status:204,body:''});
    if(req.method()!=='GET'){writes.push(req.method()+' '+u.pathname);return route.abort();}
    return route.fulfill({json:u.pathname==='/auth/v1/user'?{id:'qa-intro'}:[]});
   }
   return route.abort();
  });
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));return c;
 }
 async function waitVideo(p){await p.locator('#introVideo').waitFor();await p.waitForFunction(()=>document.querySelector('#introVideo')?.readyState>=2);}
 try{
  const c=await setup(),p=await c.newPage();await p.goto(base+'/');await waitVideo(p);
  await p.waitForFunction(()=>document.querySelector('#introVideo').currentTime>.15);
  assert.equal(await p.locator('#login').isVisible(),true);
  for(const [time,name] of [[17,'encouragement'],[21,'parents'],[24.5,'ending']]){
   await p.evaluate(t=>{const v=document.querySelector('#introVideo');v.pause();v.currentTime=t;},time);
   await p.waitForFunction(t=>Math.abs(document.querySelector('#introVideo').currentTime-t)<.1,time);await p.waitForTimeout(150);
   await p.screenshot({path:path.join(out,'browser-mobile-'+name+'.png')});
  }
  await p.getByRole('button',{name:'건너뛰기'}).click();assert.equal(await p.locator('#video-intro').count(),0);assert.equal(await p.locator('#login').isVisible(),true);
  await p.reload();await waitVideo(p);assert.equal(await p.locator('#video-intro').isVisible(),true,'re-entry replays');await c.close();
  const saved=await setup(true),s=await saved.newPage();await s.goto(base+'/');await waitVideo(s);await s.locator('#dashboard:not(.hidden)').waitFor();
  assert.equal(await s.locator('#cheer').isVisible(),false,'auto-login cheer cannot cover video');
  assert.equal(await s.evaluate(()=>document.elementFromPoint(innerWidth/2,innerHeight/2).id),'introVideo');
  assert.equal(await s.evaluate(()=>localStorage.getItem('gfield_student')),student);
  await s.screenshot({path:path.join(out,'browser-saved-login.png')});
  await s.evaluate(()=>document.querySelector('#introVideo').dispatchEvent(new Event('ended')));await s.locator('#cheer:not(.hidden)').waitFor();assert.equal(await s.locator('#video-intro').count(),0);await saved.close();
  for(const event of ['ended','error','skip']){
   const q=await setup(true),page=await q.newPage();await page.goto(base+'/?next='+encodeURIComponent('final.html?set=last&round=4&go=report'));await waitVideo(page);await page.locator('#dashboard:not(.hidden)').waitFor();
   assert.equal(new URL(page.url()).pathname,'/','QR navigation waits for intro');
   if(event==='skip')await page.getByRole('button',{name:'건너뛰기'}).click();else await page.evaluate(e=>document.querySelector('#introVideo').dispatchEvent(new Event(e)),event);
   await page.waitForURL(u=>u.pathname==='/final.html');const u=new URL(page.url());assert.equal(u.searchParams.get('name'),student);assert.equal(u.searchParams.get('round'),'4');await q.close();
  }
  const blocked=await setup(false,true,{width:1280,height:800}),b=await blocked.newPage();await b.goto(base+'/');await waitVideo(b);await b.locator('#unmuteHint:not(.hidden)').waitFor();await b.waitForFunction(()=>document.querySelector('#unmuteHint').textContent.includes('영상 재생'));
  await b.evaluate(()=>window.qaAllowPlay=true);await b.locator('#unmuteHint').focus();await b.keyboard.press('Enter');await b.locator('#unmuteHint').waitFor({state:'hidden'});
  assert.equal(await b.evaluate(()=>document.querySelector('#introVideo').muted),false);await b.waitForFunction(()=>document.querySelector('#introVideo').currentTime>.15);
  await b.evaluate(()=>{const v=document.querySelector('#introVideo');v.pause();v.currentTime=21;});await b.waitForTimeout(200);await b.screenshot({path:path.join(out,'browser-desktop-parents.png')});
  await b.locator('#skipBtn').focus();await b.keyboard.press('Enter');assert.equal(await b.locator('#video-intro').count(),0);await blocked.close();
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log('PASS intro: actual media playback, mobile captions, saved login visibility, replay, ended/error/skip handoff, QR identity, blocked autoplay recovery, keyboard controls; no real writes');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
