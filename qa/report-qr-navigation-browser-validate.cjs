'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='QR연결검수',ox='O'.repeat(10)+'X'.repeat(20);
const records=['final7','final8','last1','original1'].map(round=>({student,round,ox,score:27,wrong:20,source:'admin'}));
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.attendance[n]=['oct-5'];for(const key of ['mock-final-7','mock-final-8','mock-signature-1'])d.archiveProductAccess[key]=[n];})();`;
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
const session={access_token:'qa-student',refresh_token:'qa-refresh',login_name:student,expires_at:Math.floor(Date.now()/1000)+3600};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.GFIELD_QR_QA_BASE||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),writes=[],errors=[];
 async function context(verified){
  const c=await browser.newContext({viewport:{width:390,height:844}});
  if(verified)await c.addInitScript(({name,s})=>{if(!/^https?:$/.test(location.protocol))return;localStorage.setItem('gfield_student',name);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify(s));}, {name:student,s:session});
  await c.route(/^https?:\/\//,route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.origin===base){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
   if(u.hostname==='fgahqumaldheqettmvqg.supabase.co'){
    if(u.pathname==='/functions/v1/hs-parent-auth'){
     const body=req.postDataJSON();
     if(body.action==='touch')return route.fulfill({json:{ok:true,student}});
     if(body.action==='start')return route.fulfill({json:{ok:true}});
     if(body.action==='verify'){assert.equal(body.pin,'0472','email verification includes the newly selected PIN');return route.fulfill({json:{student,firstLink:true,pinReady:true,session:Object.assign({},session,{expires_in:3600,user:{id:'qa-student'}})}});}
    }
    if(u.pathname==='/functions/v1/hs-final-population')return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
    if(u.pathname==='/rest/v1/access_log')return route.fulfill({status:204,body:''});
    if(req.method()!=='GET'){writes.push(req.method()+' '+u.pathname);return route.abort();}
    return route.fulfill({json:u.pathname==='/auth/v1/user'?{id:'qa-student',app_metadata:{role:'student'}}:u.pathname==='/rest/v1/mock_results'?records:[]});
   }
   return route.abort();
  });
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));return c;
 }
 try{
  const c=await context(true),p=await c.newPage(),links=[];
  for(const query of ['round=7','round=8','set=last&round=1','set=original&round=1']){
   await p.goto(base+'/final.html?'+query+'&go=report&name='+encodeURIComponent(student),{waitUntil:'networkidle'});
   await p.locator('.report-qr-code[data-qr-url] svg').first().waitFor({state:'attached'});
   const urls=[...new Set(await p.locator('.report-qr-code[data-qr-url]').evaluateAll(ns=>ns.map(n=>n.dataset.qrUrl)))];
   assert.equal(urls.length,2,'report and practice QR exist for '+query);
   for(const qr of urls){const outer=new URL(qr);assert.equal(outer.searchParams.get('v'),'20261013-report-qr');assert.equal(outer.searchParams.has('name'),false,'no student identity in QR');links.push(outer.pathname+outer.search);}
  }
  const legacyLinks=links.slice(0,2).map(link=>{const u=new URL(link,base),next=new URL(u.searchParams.get('next'),base);u.searchParams.delete('v');next.searchParams.delete('v');u.searchParams.set('next',next.pathname.replace(/^\//,'')+next.search);return u.pathname+u.search;});
  for(const link of links.concat(legacyLinks)){
   await p.goto(base+link,{waitUntil:'networkidle'});
   await p.evaluate(()=>{if(typeof skipIntro==='function')skipIntro();});
   const target=new URL(new URL(link,base).searchParams.get('next'),base);
   await p.waitForURL(u=>u.pathname===target.pathname&&u.searchParams.get('name')===student);
   if(target.pathname.endsWith('final.html'))await p.locator('.report-qr-code svg').first().waitFor({state:'attached'});
   else await p.locator('#f1Pages .page').first().waitFor();
  }
  await c.close();
  // A new mobile browser completes the real frontend email flow with a synthetic server.
  for(const link of links.slice(2,4)){
   const fresh=await context(false),page=await fresh.newPage();
   await page.goto(base+link,{waitUntil:'networkidle'});await page.evaluate(()=>document.getElementById('video-intro')?.remove());
   await page.fill('#name-input',student);await page.click('#name-enter');
   await page.locator('#email-login:not(.hidden)').waitFor();
   await page.click('#el-pin-reset');await page.locator('#el-step-email:not(.hidden)').waitFor();
   await page.fill('#el-email','qa-parent@example.com');await page.click('#el-send');
   await page.locator('#el-step-code:not(.hidden)').waitFor();await page.fill('#el-code','12345678');await page.fill('#el-new-pin','0472');await page.fill('#el-confirm-pin','0472');await page.click('#el-verify');
   const target=new URL(new URL(link,base).searchParams.get('next'),base);
   await page.waitForURL(u=>u.pathname===target.pathname&&u.searchParams.get('name')===student);
   if(target.pathname.endsWith('final.html'))await page.locator('.report-qr-code svg').first().waitFor({state:'attached'});else await page.locator('#f1Pages .page').first().waitFor();
   await fresh.close();
  }
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log('PASS 8 new + 2 legacy QR targets (Final7/8, Last1, Signature1 report/practice), authenticated mobile navigation and new-browser email/PIN setup handoff; no real mail/result/permission writes');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
