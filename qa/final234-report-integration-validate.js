'use strict';
// Synthetic records only. All off-site traffic is intercepted; no learner writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='회차연결검수학생';
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const ox='O'.repeat(20)+'X'.repeat(10),score=core.scoreOf(ox);
const PRIOR_FINAL2_NOS=[1,3,4,6,7,8,10,11,12,15,18,19,20,21,22,23,24,25,26,27,28,29,30];
const FINAL2_DIAGRAM_SVG_COUNTS={2:1,5:1,9:9,12:1,13:2,16:4,28:1};
const records=[1,2,3,4].map(n=>({student,round:'final'+n,ox,score,wrong:10,source:'admin'}));
records.push({student,round:'last1',ox,score,wrong:10,source:'admin'});
records.push({student,round:'final2@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin'});
const source=JSON.stringify(records),writes=[],calls=[],errors=[];
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['파이널 모의고사']=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||'')).map(x=>x.id);})();`;
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
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
   if(n===2){
    const leadBoundary=await page.evaluate(()=>{
     const makeItems=count=>Array.from({length:30},(_,index)=>({
      no:index+1,
      answer:String(index+1),
      detailedSolution:index<count,
      comment:index<count?'검수된 풀이':''
     }));
     return {
      full:GF_TEST.detailedAnswersSectionHTML({roundNum:3,items:makeItems(30)}),
      partial:GF_TEST.detailedAnswersSectionHTML({roundNum:3,items:makeItems(29)})
     };
    });
    assert.match(leadBoundary.full,/30문제의 상세 풀이를 볼 수 있습니다\./,'full coverage lead is truthful');
    assert.doesNotMatch(leadBoundary.full,/나머지 풀이는 준비/,'full coverage lead has no false pending copy');
    assert.match(leadBoundary.partial,/29문제의 풀이를 볼 수 있습니다\. 나머지 풀이는 준비하고 있습니다\./,'partial coverage keeps pending copy');
    await page.setViewportSize({width:390,height:900});
    const mobileTables=await page.locator('#final2DetailedSolutions .final1-data-table').evaluateAll(tables=>tables.map(table=>({
     no:Number(table.closest('[data-detailed-solution-no]').dataset.detailedSolutionNo),
     fits:table.scrollWidth<=table.clientWidth+1,
     fontSize:parseFloat(getComputedStyle(table).fontSize),
     wrapped:[...table.querySelectorAll('th,td')].every(cell=>getComputedStyle(cell).whiteSpace==='normal'&&getComputedStyle(cell).overflowWrap==='anywhere')
    })));
    assert.deepEqual(mobileTables.map(table=>table.no),[2,4,5,7,9,13,15,16,17,18,19,20,21,22,23,24,26,27,28,29],'all 20 integrated solution tables are audited at 390px');
    assert.ok(mobileTables.every(table=>table.fits&&table.fontSize>=12&&table.wrapped),'every Final2 table is fully visible, wrapped, and at least 12px on mobile');
    await page.setViewportSize({width:1280,height:900});
   }
   if(n===2&&process.env.GFIELD_QA_ARTIFACT_DIR){
    const dir=process.env.GFIELD_QA_ARTIFACT_DIR;fs.mkdirSync(dir,{recursive:true});
    const detailCoverage=await page.evaluate(priorNos=>{
     const data=window.GFIELD_FINAL2_DETAILED;
     const approvedNos=data.contract.expectedNos.slice();
     return {
      approvedNos,
      expectedCount:data.contract.expectedCount,
      totalQuestions:data.contract.totalQuestions,
      newNos:approvedNos.filter(no=>!priorNos.includes(no)),
      diagramNos:data.items.filter(item=>item.diagram).map(item=>item.no)
     };
    },PRIOR_FINAL2_NOS);
    assert.equal(await page.locator('#final2DetailedSolutions .is-ready').count(),detailCoverage.expectedCount,'exact reviewed details are publicly available after the answer boundary');
    assert.equal(await page.locator('#final2DetailedSolutions .is-pending').count(),detailCoverage.totalQuestions-detailCoverage.expectedCount,'no reviewed detail remains pending');
    for(const no of detailCoverage.diagramNos){
     const expectedSvgCount=FINAL2_DIAGRAM_SVG_COUNTS[no];
     assert.ok(Number.isInteger(expectedSvgCount),`Q${no} has an exact SVG-count contract`);
     assert.equal(await page.locator(`#final2-solution-${no} .gfield-final2-solution-diagram svg`).count(),expectedSvgCount,`Q${no} exact registered SVG set included`);
     assert.equal(await page.locator(`#final2-solution-${no} .gfield-final2-solution-diagram`).count(),1,`Q${no} has one registered figure wrapper`);
    }
    assert.ok(await page.locator('#final2DetailedSolutions .final1-data-table').count()>=2,'structured solution tables included');
    for(const width of [1280,390]){
     await page.setViewportSize({width,height:900});
     await page.locator('#final2DetailedSolutions .final1-solutions-head').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(dir,'final2-detail-'+width+'.png')});
     for(const no of detailCoverage.newNos){
      const card=page.locator(`#final2-solution-${no}`);
      await card.screenshot({path:path.join(dir,`final2-card-${no}-${width}.png`)});
      assert.ok(await card.evaluate(node=>node.scrollWidth<=node.clientWidth+1),`Q${no} card fits at ${width}px`);
     }
     for(const no of detailCoverage.diagramNos){
      const diagram=page.locator(`#final2-solution-${no} .gfield-final2-solution-diagram`);
      await diagram.screenshot({path:path.join(dir,`final2-diagram-${no}-${width}.png`)});
      assert.ok(await diagram.evaluate(node=>node.scrollWidth<=node.clientWidth+1),`Q${no} diagram fits at ${width}px`);
     }
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
