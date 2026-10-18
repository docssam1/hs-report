'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='잠금표시검수',before=process.argv.includes('--before'),out=process.env.GFIELD_ROADMAP_QA_DIR;
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.attendance[n]=[];for(const key of ['mock-final-5','mock-final-7','mock-final-8','mock-mid-7','mock-mid-8'])d.archiveProductAccess[key]=[];})();`;
const host=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>host.listen(0,'127.0.0.1',r));const base=process.env.GFIELD_ROADMAP_QA_BASE||'http://127.0.0.1:'+host.address().port,browser=await chromium.launch(),writes=[],errors=[];
 try{
  const c=await browser.newContext({viewport:{width:1280,height:900}});
  await c.route(/^https?:\/\//,route=>{const req=route.request(),u=new URL(req.url());if(u.origin===base){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}if(u.pathname==='/rest/v1/access_log')return route.fulfill({status:204,body:''});if(!['GET','HEAD','OPTIONS'].includes(req.method())){writes.push(u.pathname);return route.abort();}return route.fulfill({json:[]});});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/index.html',{waitUntil:'domcontentloaded'});await p.locator('#name-input').waitFor();
  await p.evaluate(()=>document.getElementById('video-intro')?.remove());await p.fill('#name-input',student);await p.click('#name-enter');
  await p.locator('#dashboard:not(.hidden)').waitFor();await p.click('.nav-btn[data-v="roadmap"]');
  const extra=p.locator('#timeline .node').filter({has:p.locator('h3',{hasText:'[선택] 추가 모의고사'})});
  for(const key of ['mock-final-7','mock-final-8','mock-final-5','mock-mid-7','mock-mid-8']){
   await p.evaluate(({key,name})=>{const d=window.GFIELD_DATA;for(const k of ['mock-final-5','mock-final-7','mock-final-8','mock-mid-7','mock-mid-8'])d.archiveProductAccess[k]=[];d.archiveProductAccess[key]=[name];renderTimeline();},{key,name:student});
   const state=await p.evaluate(key=>({archive:canSeeProduct(key),roadmap:isUnlocked(window.GFIELD_DATA.nodes.find(n=>n.id==='extra-mocks'))}),key);
   if(before&&['mock-final-7','mock-final-8'].includes(key)){assert.equal(state.archive,true);assert.equal(state.roadmap,false);console.log('REPRO '+key+': archive approved / roadmap locked');continue;}
   assert.equal(state.archive,true);assert.equal(state.roadmap,true,'approved '+key+' is reflected in the roadmap');
   assert.equal(await extra.evaluate(el=>el.classList.contains('locked')),false);
   await extra.click();await p.locator('#overlay:not(.hidden)').waitFor();
   assert.deepEqual(await p.locator('#modal-body [data-book-key]').evaluateAll(ns=>ns.map(n=>n.dataset.bookKey)),[key],'unapproved sibling exams do not appear');
   await p.evaluate(()=>closeModal());
   if(!before){assert.equal(await extra.locator('.icon-status').innerText(),'🔓');assert.equal(await extra.locator('.icon-status').getAttribute('aria-label'),'열림 · 이용 가능');}
  }
  if(!before){
   // Normal weekly attendance rules stay unchanged even when an exam is approved.
   await p.evaluate(name=>{window.GFIELD_DATA.attendance[name]=['sep-w1'];renderTimeline();document.getElementById('toast').classList.remove('show');},student);
   const week=p.locator('#timeline .node').filter({has:p.locator('h3',{hasText:'파이널 실전 모의고사 1회'})});
   assert.equal(await week.locator('.icon-status').innerText(),'🔓');
   const future=p.locator('#timeline .node').filter({has:p.locator('h3',{hasText:'최종 실전 모의고사 3회'})});
   assert.equal(await future.locator('.icon-status').innerText(),'🔒');
   // Regular residents: check every week against the same gate used by clicking.
   const weeks=await p.evaluate(()=>window.GFIELD_DATA.nodes.filter(n=>n.type==='week').map(n=>({id:n.id,title:n.title})));
   for(const approved of [true,false]){
    await p.evaluate(({name,ids})=>{window.GFIELD_DATA.attendance[name]=ids;renderTimeline();},{name:student,ids:approved?weeks.map(n=>n.id):[]});
    for(const node of weeks){
     const exact=p.locator('#timeline .node').filter({has:p.getByRole('heading',{name:node.title,exact:true})});
     assert.equal(await exact.locator('.icon-status').innerText(),approved?'🔓':'🔒',node.id+' icon');
     assert.equal(await exact.evaluate(el=>el.classList.contains('locked')),!approved,node.id+' locked class');
     await exact.click();assert.equal(await p.locator('#overlay').isVisible(),approved,node.id+' actual access');
     if(approved)await p.evaluate(()=>closeModal());
    }
   }
   await p.evaluate(name=>{window.GFIELD_DATA.attendance[name]=['sep-w1'];renderTimeline();},student);
   for(const width of [1280,390]){await p.setViewportSize({width,height:900});await week.scrollIntoViewIfNeeded();assert.ok((await week.locator('.icon-status').boundingBox()).x>=0);if(out)await p.screenshot({path:path.join(out,'regular-week-'+width+'.png')});}
   for(const width of [1280,390]){await p.setViewportSize({width,height:900});await extra.scrollIntoViewIfNeeded();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok((await extra.locator('.icon-status').boundingBox()).x>=0,'approval marker stays inside the viewport');if(out){fs.mkdirSync(out,{recursive:true});await p.screenshot({path:path.join(out,'approved-extra-'+width+'.png')});}}
   await p.evaluate(()=>{for(const key of ['mock-final-5','mock-final-7','mock-final-8','mock-mid-7','mock-mid-8'])window.GFIELD_DATA.archiveProductAccess[key]=[];renderTimeline();});
   assert.equal(await extra.locator('.icon-status').innerText(),'🔒');await extra.click();assert.equal(await p.locator('#overlay').isVisible(),false);
  }
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);console.log(before?'PASS baseline approval mismatch reproduced':'PASS approved roadmap icons, per-exam child filtering, normal/future weeks, revoked access, PC/390px, zero writes');
 }finally{await browser.close();host.close();}
})().catch(e=>{console.error(e);host.close();process.exitCode=1;});
