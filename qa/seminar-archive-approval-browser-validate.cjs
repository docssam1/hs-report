'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/seminar-access-20261108');
const source=fs.readFileSync(path.join(root,'data.js'),'utf8'),key='seminar-hwangso-2026',name='설명회검수학생',other='다른검수학생';
const evidence={cases:[],errors:[],writes:[],interceptedAuthChecks:0};
const server=http.createServer((req,res)=>{if(req.method!=='GET'){evidence.writes.push(req.method);res.writeHead(405);return res.end();}let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel.endsWith('/'))rel+='index.html';const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+path.sep)||f.includes('.private-work')){res.writeHead(403);return res.end();}fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.pdf':'application/pdf','.woff2':'font/woff2','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream'});res.end(e?'missing fixture':b);});});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
 async function setup({grant=true,session=true,offline=false,withdrawn=false,rounds=true,admin=false,width=1440,missingAccess=false}={}){
  const state={grant,session,offline,withdrawn,rounds,badRoster:false,configLoads:0,pdfLoads:0,driveLoads:0};
  const ctx=await browser.newContext({viewport:{width,height:1000}});
  await ctx.addInitScript(({name})=>{localStorage.setItem('gfield_student',name);window.print=()=>{};},{name});
  await ctx.route(/^https?:\/\//,async route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.origin!==base){if(u.hostname==='drive.google.com'){state.driveLoads++;return route.fulfill({contentType:'text/html',body:'<p>QA video iframe</p>'});}return route.fulfill({contentType:'application/json',body:'[]'});}
   if(req.method()!=='GET'){evidence.writes.push(req.method()+' '+u.pathname);return route.fulfill({status:405,body:''});}
   if(missingAccess&&u.pathname.endsWith('/2026-video/access.js'))return route.fulfill({status:503,body:''});
   if(u.pathname==='/hs-auth.js')return route.fulfill({contentType:'application/javascript',body:`window.GFIELD_AUTH={getSession:async()=>(${JSON.stringify(state.session?{login_name:name}:null)}),getUser:async()=>(${JSON.stringify(admin?{app_metadata:{role:'admin'}}:null)}),normalizeName:x=>String(x||'').trim(),normalizeLoginName:x=>String(x||'').trim(),rest:async()=>({ok:true,json:async()=>[]}),functionCall:async()=>({}),hasAdminDevice:()=>false};`});
   if(u.pathname==='/hs-email-login.js')return route.fulfill({contentType:'application/javascript',body:`window.GFIELD_EMAIL_LOGIN={check:async()=>(${JSON.stringify({ok:true,offline:state.offline})}),prompt:async()=>({}),signOut:async()=>{}};`});
   if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:state.badRoster?'/* malformed source: no roster */':source+`\n;(()=>{const d=window.GFIELD_DATA;d.students=${JSON.stringify([name,other])};d.studentTypes={${JSON.stringify(name)}:${JSON.stringify(state.withdrawn?'withdrawn':'resident')},${JSON.stringify(other)}:'online'};d.archiveProductAccess[${JSON.stringify(key)}]=${JSON.stringify(state.grant?[name]:[])};d.archiveProductAccess['mock-top-secret-finish-1']=${JSON.stringify(state.rounds?[name]:[])};d.archiveProductAccess['mock-top-secret-finish-2']=${JSON.stringify(state.rounds?[name]:[])};})();`});
   if(u.pathname.endsWith('/video-config.js'))state.configLoads++;
   if(u.pathname.endsWith('.pdf'))state.pdfLoads++;
   return route.continue();
  });
  const page=await ctx.newPage();page.on('pageerror',e=>evidence.errors.push(e.message));return {state,ctx,page};
 }
 try{
  for(const options of [{grant:false},{session:false},{withdrawn:true},{offline:true},{missingAccess:true}]){
   const {page,ctx,state}=await setup(options);await page.goto(base+'/seminar/2026-video/?name='+name+'&teacher=1');
   await page.waitForFunction(()=>!document.querySelector('#access-status').textContent.includes('승인 확인 중'));
   assert.equal(await page.locator('#play').isDisabled(),true);assert.equal(await page.locator('.exam-print:disabled').count(),6);assert.equal(await page.locator('iframe').count(),0);assert.equal(state.configLoads+state.pdfLoads+state.driveLoads,0);assert.equal(await page.locator('#slides-link').getAttribute('href'),null);
   evidence.cases.push({options,denied:true,noProtectedLoads:true});await ctx.close();
  }
  for(const width of [1440,390]){
   const {page,ctx,state}=await setup({width});await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>!document.querySelector('#play').disabled);
   assert.equal(state.configLoads,0);assert.equal(await page.locator('#drive-link').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const box=await page.locator('#player').boundingBox(),side=await page.locator('.papers').boundingBox();assert.ok(width>900?side.x>box.x:side.y>box.y+box.height);
   for(const type of ['copy','contextmenu','dragstart'])assert.equal(await page.locator('main').evaluate((e,type)=>e.dispatchEvent(new Event(type,{bubbles:true,cancelable:true})),type),false);
   await page.screenshot({path:path.join(out,'approved-'+width+'.png'),fullPage:true});await page.locator('#play').click();await page.waitForSelector('#player iframe');assert.equal(state.configLoads,1);assert.equal(await page.locator('#player iframe').getAttribute('sandbox'),'allow-scripts allow-same-origin allow-presentation');
   state.grant=false;await page.evaluate(()=>dispatchEvent(new Event('focus')));await page.waitForFunction(()=>!document.querySelector('#player iframe'));await page.waitForFunction(()=>[...document.querySelectorAll('.exam-print')].every(b=>b.disabled));
   evidence.cases.push({width,approvedPlayback:true,copyRestricted:true,revokeStopsFrame:true});await ctx.close();
  }
  {
   const {page,ctx,state}=await setup();await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>!document.querySelector('#play').disabled);state.badRoster=true;
   await page.evaluate(()=>dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('#play').disabled&&document.querySelector('#access-status').textContent.includes('승인'));
   assert.equal(await page.locator('iframe').count(),0);assert.equal(state.configLoads,0);evidence.cases.push({malformedRosterCannotReuseOldApproval:true});await ctx.close();
  }
  {
   const {page,ctx}=await setup({rounds:false});await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>!document.querySelector('#play').disabled);
   assert.equal(await page.locator('.exam-print[data-round="recall"]:enabled').count(),2);assert.equal(await page.locator('.exam-print[data-round="1"]:disabled,.exam-print[data-round="2"]:disabled').count(),4);
   evidence.cases.push({seminarDoesNotGrantSecretRounds:true});await ctx.close();
  }
  {
   const {page,ctx,state}=await setup();await page.goto(base+'/seminar/2026-video/');await page.waitForFunction(()=>!document.querySelector('.exam-print[data-round="1"]').disabled);
   await page.route('**/materials/top-secret-finish-1-questions.pdf',route=>{state.grant=false;return route.continue();});
   const popup=page.waitForEvent('popup');await page.locator('.exam-print[data-round="1"][data-kind="questions"]').click();const print=await popup;
   await print.waitForFunction(()=>document.querySelector('#progress')?.textContent.includes('승인이 필요'),null,{timeout:30000});
   assert.equal(await print.locator('.sheet').count(),0);assert.notEqual(await print.locator('html').getAttribute('data-print-ready'),'true');
   evidence.cases.push({approvalRevokedDuringPdfPreparationBlocksPrint:true});await ctx.close();
  }
  {
   const {page,ctx}=await setup({grant:false,admin:true});await page.goto(base+'/admin.html');await page.waitForFunction(()=>!document.querySelector('#app').classList.contains('hidden'));await page.locator('[data-tab="archive"]').click();
   await page.locator('#seminar-approval-panel').scrollIntoViewIfNeeded();assert.equal(await page.locator('#seminar-acc-matrix input:checked').count(),0);
   const before=await page.evaluate(()=>JSON.parse(JSON.stringify(S.archiveProductAccess)));
   await page.getByRole('checkbox',{name:name+' 설명회 승인',exact:true}).check();assert.deepEqual(await page.evaluate(key=>S.archiveProductAccess[key],key),[name]);
   assert.deepEqual(await page.evaluate(key=>{const exported={};new Function('window',buildFile())(exported);return exported.GFIELD_DATA.archiveProductAccess[key];},key),[name]);
   const after=await page.evaluate(()=>JSON.parse(JSON.stringify(S.archiveProductAccess)));delete before[key];delete after[key];assert.deepEqual(after,before);
   await page.getByRole('checkbox',{name:name+' 설명회 승인',exact:true}).uncheck();assert.deepEqual(await page.evaluate(key=>S.archiveProductAccess[key],key),[]);
   await page.locator('#seminar-acc-matrix button').filter({hasText:'모두 선택'}).click();assert.equal(await page.locator('#seminar-acc-matrix input:checked').count(),2);
   await page.locator('#seminar-acc-matrix button').filter({hasText:'선택 비우기'}).click();assert.equal(await page.locator('#seminar-acc-matrix input:checked').count(),0);
   await page.screenshot({path:path.join(out,'admin-approval.png'),fullPage:false});evidence.cases.push({adminCheckboxes:true,startsEmpty:true,otherGrantsUnchanged:true});await ctx.close();
  }
  for(const grant of [false,true]){
   const {page,ctx}=await setup({grant});await page.goto(base+'/index.html');if(await page.locator('#skipBtn').count())await page.locator('#skipBtn').click();
   if(await page.locator('#name-input').isVisible()){await page.locator('#name-input').fill(name);await page.locator('.enter').click();}
   await page.locator('[data-v="archive"]').click();await page.waitForFunction(()=>!!document.querySelector('#archive-list').children.length);assert.equal(await page.locator('.archive-seminar-video').count(),grant?1:0);
   evidence.cases.push({archiveCardVisibleOnlyWhenApproved:grant});await ctx.close();
  }
  assert.deepEqual(evidence.errors,[]);assert.deepEqual(evidence.writes,[]);console.log('PASS seminar admin grant isolation, archive card, sessions, denial, revoke, PC/390, copy restrictions; no production writes');
 }finally{fs.writeFileSync(path.join(out,'browser-review.json'),JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
