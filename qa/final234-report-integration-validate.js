'use strict';
// Synthetic records only. All off-site traffic is intercepted; no learner writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='회차연결검수학생';
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const ox='O'.repeat(20)+'X'.repeat(10),score=core.scoreOf(ox);
const records=[1,2,3,4].map(n=>({student,round:'final'+n,ox,score,wrong:10,source:'admin'}));
records.push({student,round:'last1',ox,score,wrong:10,source:'admin'});
records.push({student,round:'final2@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin'});
const source=JSON.stringify(records),writes=[],calls=[],errors=[];
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['파이널 모의고사']=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||'')).map(x=>x.id);})();`;
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port,origin=new URL(base).origin;
 const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900}});
 let failedExam=null;
 await context.addInitScript(n=>{localStorage.setItem('gfield_student',n);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:n}));},student);
 await context.route(/^https?:\/\//,route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin===origin){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
  if(u.pathname==='/rest/v1/mock_results'){if(req.method()!=='GET')writes.push(req.method());return route.fulfill({json:records});}
  if(u.pathname.endsWith('/hs-final-population')){
   const body=req.postDataJSON();calls.push(body);
   if(body.action){if(body.action!=='read-report')writes.push(body.action);return route.fulfill({json:{canEdit:false,comment:'조건을 표시하며 차근차근 풀어 보세요.',snapshot:null,resultOx:ox}});}
   if(body.exam===failedExam)return route.fulfill({status:503,json:{error:'STATISTICS_UNAVAILABLE'}});
   return route.fulfill({json:core.createResponse(baselines[body.exam],body.scores)});
  }
  if(!['GET','HEAD','OPTIONS'].includes(req.method())&&!u.pathname.endsWith('/access_log'))writes.push(u.pathname);
  return route.fulfill({json:[]});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 try{
  const results=[];
  for(const n of [2,3,4]){
   await page.goto(base+'/final.html?round='+n+'&go=report&name='+encodeURIComponent(student));
   await page.locator('.final-report-package').waitFor();
   const checked=await page.evaluate(({n,ox,records})=>{
    const map=Object.fromEntries(records.map(r=>[r.round,r]));
    const out=GF_TEST.computeCumulativeConsidered(n,map,1,'final'+n,ox.split(''),false);
    return {rounds:out.map(r=>r.n),ox:out.map(r=>r.oxArr.join('')),ctx:GF_TEST.buildContext('검수',n,ox.split('')).populationVerified};
   },{n,ox,records});
   assert.equal(checked.ctx,true,'current round uses a trusted reference');
   assert.deepEqual(checked.rounds,[1,2,3,4],'all saved first rounds included once');
   assert.ok(checked.ox.every(s=>s===ox),'perfect-score retry never replaces first result');
   const text=await page.locator('.report-screen-header,.cut-reference').allTextContents();
   assert.doesNotMatch(text.join(' '),/null%|NaN|undefined|응시\s*인원|\d[\d,]*\s*명/);
   assert.equal(await page.locator('#detailWrap .bar').count(),30,'all item answer rates visible');
   for(const width of [1280,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');}
   if(n===2&&process.env.GFIELD_QA_ARTIFACT_DIR){
    const dir=process.env.GFIELD_QA_ARTIFACT_DIR;fs.mkdirSync(dir,{recursive:true});
    assert.equal(await page.locator('#final2DetailedSolutions .is-ready').count(),12,'independently reviewed details visible');
    assert.equal(await page.locator('#final2DetailedSolutions .is-pending').count(),18,'remaining details are not claimed complete');
    assert.equal(await page.locator('#final2DetailedSolutions .gfield-final2-solution-diagram--q12').count(),1,'source projection included');
    assert.ok(await page.locator('#final2DetailedSolutions .final1-data-table').count()>=2,'structured solution tables included');
    for(const width of [1280,390]){
     await page.setViewportSize({width,height:900});
     await page.locator('#final2DetailedSolutions .final1-solutions-head').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(dir,'final2-detail-'+width+'.png')});
     await page.locator('#final2-solution-12').screenshot({path:path.join(dir,'final2-projection-'+width+'.png')});
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'details fit mobile');
    }
    await page.setViewportSize({width:1280,height:900});
    await page.emulateMedia({media:'print'});
    fs.writeFileSync(path.join(dir,'print-layout.json'),JSON.stringify(await page.locator('#final2DetailedSolutions .is-ready').evaluateAll(cards=>cards.map(card=>({no:card.dataset.detailedSolutionNo,width:card.getBoundingClientRect().width,height:card.getBoundingClientRect().height,children:[...card.querySelector('.final1-card-content').children].map(x=>({class:x.className,height:x.getBoundingClientRect().height}))}))),null,2));
    await page.pdf({path:path.join(dir,'final2-report-package.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>{window.print=()=>{window.qaPrintRequested=true;};});
    await page.locator('#printFinal2Solutions').click();
    assert.ok(await page.evaluate(()=>window.qaPrintRequested&&document.body.classList.contains('print-final1-solutions')),'actual detail-print control');
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(dir,'final2-details-only.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    await page.emulateMedia({media:'screen'});
    assert.equal(await page.evaluate(()=>document.body.classList.contains('print-final1-solutions')),false,'print mode cleaned up');
   }
   results.push({round:n,cumulativeRounds:checked.rounds.length,answerRates:30});
  }
  await page.goto(base+'/last1-result.html?round=1&name='+encodeURIComponent(student));
  await page.locator('#res:not(.hide) .cum-card').waitFor();
  assert.match(await page.locator('.cum-head').innerText(),/최초 성적 5회/,'Last1 includes all four Final first records plus Last1');
  for(const n of [1,2,3,4])assert.match(await page.locator('.cum-trend').innerText(),new RegExp('파이널 '+n+'회'));
  failedExam='final3';
  await page.goto(base+'/final.html?round=3&go=report&name='+encodeURIComponent(student));await page.locator('.final-report-package').waitFor();
  assert.equal(await page.evaluate(()=>GF_TEST.buildContext('검수',3,('O'.repeat(20)+'X'.repeat(10)).split('')).populationVerified),false,'failed reference never becomes trusted');
  assert.equal(await page.locator('#detailWrap .bar').count(),30,'fixed answer rates survive offline reference');
  assert.doesNotMatch(await page.locator('.report-screen-header').innerText(),/석차 백분율/);
  assert.equal(JSON.stringify(records),source);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({pass:true,results,offlineFailsClosed:true,productionWrites:0}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
