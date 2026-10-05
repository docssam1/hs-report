'use strict';
// Synthetic records only. All off-site traffic is intercepted; no learner writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='회차연결검수학생';
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const ox='O'.repeat(20)+'X'.repeat(10),score=core.scoreOf(ox);
const PRIOR_FINAL2_NOS=[1,3,4,6,7,8,10,11,12,15,18,19,20,21,22,23,24,25,26,27,28,29,30];
const FINAL2_DIAGRAM_SVG_COUNTS={2:1,5:1,9:9,12:1,13:2,16:4,23:1,27:1,28:2};
const FINAL3_DIAGRAM_SVG_COUNTS={1:1,3:4,4:2,6:5,7:3,8:2,13:1};
const records=[1,2,3,4].map(n=>({student,round:'final'+n,ox,score,wrong:10,source:'admin'}));
records.push({student,round:'last1',ox,score,wrong:10,source:'admin'});
const final8Ox='O'.repeat(8)+'X'.repeat(22),final8Score=core.scoreOf(final8Ox);
records.push({student,round:'final8',ox:final8Ox,score:final8Score,wrong:22,source:'admin'});
records.push({student,round:'final2@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin'});
const source=JSON.stringify(records),writes=[],calls=[],errors=[];
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['파이널 모의고사']=[n];d.archiveProductAccess['mock-final-8']=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||'')).map(x=>x.id);})();`;
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port,origin=new URL(base).origin;
 const browser=await chromium.launch(process.env.GFIELD_QA_BROWSER_EXECUTABLE?{executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE}:{}),context=await browser.newContext({viewport:{width:1280,height:900}});
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
  const final8Page=await context.newPage();
  await final8Page.goto(base+'/final.html?round=8&go=report&name='+encodeURIComponent(student));
  await final8Page.locator('.final-report-package').waitFor();
  const final8Summary=await final8Page.locator('#report-summary').innerText();
  assert.match(final8Summary,/최종 실전 모의고사 8회/,'Final8 is connected as its own standalone result');
  assert.ok(await final8Page.locator('.report-compact-print-header .report-qr-code svg').count()>=1,'Final8 summary renders its report QR');
  assert.match(decodeURIComponent(await final8Page.locator('.report-compact-print-header .report-qr-code').first().getAttribute('data-qr-url')),/round=8&go=report/,'Final8 QR remains in its own series and round');
  assert.equal(final8Summary.includes('최종 1~4회'),false,'Final8 is not added to the Final1-4 cumulative group');
  assert.equal(await final8Page.locator('.final8-benchmark').count(),1,'Final8 shows the Signature-based difficulty-adjusted estimate');
  assert.match(await final8Page.locator('.final8-benchmark').innerText(),/실제 원점수[\s\S]*실전 예상점수[\s\S]*예상 반[\s\S]*예상 석차 백분율/,'Final8 shows all requested actual and expected measures');
  const final8Priorities=await final8Page.locator('#report-plan .parent-priority-list li').evaluateAll(nodes=>nodes.map(node=>node.innerText));
  assert.ok(final8Priorities.length<=3,'Final8 recommends at most three questions');
  assert.ok(final8Priorities.every(text=>/2\.7점|3\.4점/.test(text)),'Final8 priority set excludes 4.2-point difficult questions');
  assert.match(await final8Page.locator('#report-plan').innerText(),/시그니처와 같은 기준.*틀린 2·3점대/,'Final8 explains its Signature-aligned basic-question rule');
  for(const n of [2,3,4]){
   await page.goto(base+'/final.html?round='+n+'&go=report&name='+encodeURIComponent(student));
   await page.locator('.final-report-package').waitFor();
   const checked=await page.evaluate(({n,ox,records})=>{
    const map=Object.fromEntries(records.map(r=>[r.round,r]));
    const out=GF_TEST.computeCumulativeConsidered(n,map,1,'final'+n,ox.split(''),false);
    return {rounds:out.map(r=>r.n),ox:out.map(r=>r.oxArr.join('')),ctx:GF_TEST.buildContext('검수',n,ox.split('')).populationVerified};
   },{n,ox,records});
   assert.equal(checked.ctx,true,'current round uses a trusted reference');
   assert.deepEqual(checked.rounds,Array.from({length:n},(_,i)=>i+1),'only first results from round 1 through the report round are included once');
   assert.ok(checked.ox.every(s=>s===ox),'perfect-score retry never replaces first result');
   const text=await page.locator('.report-screen-header,.cut-reference').allTextContents();
   assert.doesNotMatch(text.join(' '),/null%|NaN|undefined|응시\s*인원|\d[\d,]*\s*명/);
   assert.equal(await page.locator('#detailWrap .bar').count(),30,'all item answer rates visible');
   for(const width of [1280,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');}
   if(n===2){
    assert.equal(await page.locator('#curriculumConnection tbody tr').count(),10,'Final2 실제 오답 10문항의 교재 연결 상태 표시');
    assert.ok(await page.locator('#curriculumConnection .curriculum-books li').count()>3,'답안·교재 연결표의 공용 처방을 Final2 오답에도 표시');
    assert.ok(await page.locator('#curriculumConnection .curriculum-points li').count()>3,'공용 처방의 학습 포인트를 Final2 오답에도 표시');
    const sharedPending=await page.evaluate(()=>GF_TEST.M.rounds['2'].items.slice(20).filter(item=>!GF_TEST.curriculumPrescriptionForItem({roundNum:2},item)).length);
    assert.equal(await page.locator('#curriculumConnection td:nth-child(3) .curriculum-pending').count(),sharedPending,'진단지의 미연결 수가 공용 답안·교재 연결표와 같음');
    assert.equal(await page.locator('#curriculumConnection td:nth-child(4) .curriculum-pending').count(),sharedPending,'진단지의 미등록 학습 포인트 수가 공용 답안·교재 연결표와 같음');
    assert.equal(await page.locator('#curriculumConnection tr[data-curriculum-no="25"] .curriculum-books li').count(),1,'25번 승인 연결 한 건');
    assert.equal(await page.locator('#curriculumConnection tr[data-curriculum-no="28"] .curriculum-books li').count(),2,'28번 승인 연결 두 건');
    const publicCurriculum=await page.evaluate(()=>[9,16,19,25,28].map(no=>{
     const item=GF_TEST.M.rounds['2'].items.find(row=>Number(row.no)===no);
     const rx=GF_TEST.curriculumPrescriptionForItem({roundNum:2},item);
     return {no,label:rx&&rx.label,kind:rx&&rx.connectionKind,books:rx&&Object.values(rx.books).flat().map(book=>book.b+' · '+book.u),points:rx&&rx.pts};
    }));
    assert.deepEqual(publicCurriculum.map(row=>[row.no,row.label,row.kind,row.books.length,row.points.length]),[
     [9,'먼저 익힐 내용','prerequisite',1,1],
     [16,'먼저 익힐 내용','prerequisite',2,2],
     [19,'먼저 익힐 내용','prerequisite',2,2],
     [25,'먼저 익힐 내용','prerequisite',1,1],
     [28,'먼저 익힐 내용','prerequisite',2,2]
    ],'독립 검수된 Final2 다섯 문항의 선행 교재 연결과 복수 학습 위치를 보존');
    const curriculumGate=await page.evaluate(()=>{
     const item=GF_TEST.M.rounds['2'].items.find(row=>Number(row.no)===1);
     const tx=BANK_TYPE_REGISTRY.buildUnifiedCatalog({final:GF_TEST.M}).items.find(row=>row.sourceKey==='final|2|1');
     const approved={
      sourceKey:'final|2|1',area:item.area,displayType:item.type,
      canonicalTypeId:tx.canonicalTypeId,studentLabel:'두 점수 가정법 복습',
      connectionKind:'same-type',books:{지필드:[{b:'검수 교재',u:'검수 단원'}]},
      points:['두 점수 차이를 한 문제당 점수 차이로 나누기'],
      independentReviewStatus:'verified',releaseStatus:'eligible'
     };
     const label=rows=>{
      const rx=GF_TEST.curriculumPrescriptionForItem({roundNum:2},item,rows);
      return rx&&rx.label||null;
     };
     const final1Item=GF_TEST.M.rounds['1'].items.find(row=>Number(row.no)===3);
     const final1Rx=GF_TEST.curriculumPrescriptionForItem({roundNum:1},final1Item);
     const isolated=GF_TEST.curriculumPrescriptionForItem({roundNum:2},item,[approved]);
     return {
      publicLabel:label(undefined),approvedLabel:label([approved]),
      wrongSource:label([{...approved,sourceKey:'final|2|2'}]),
      wrongRawType:label([{...approved,displayType:'다른 유형'}]),
      wrongCanonical:label([{...approved,canonicalTypeId:'type-other'}]),
      wrongKind:label([{...approved,connectionKind:'keyword-match'}]),
      emptyPoints:label([{...approved,points:[]}]),
      duplicateBook:label([{...approved,books:{지필드:[approved.books.지필드[0],approved.books.지필드[0]]}}]),
      locked:label([{...approved,releaseStatus:'locked'}]),
      duplicate:label([approved,approved]),
      approvedBook:isolated&&isolated.books.지필드[0].b,
      approvedPoint:isolated&&isolated.pts[0],
      final1Label:final1Rx&&final1Rx.label||null
     };
    });
    assert.deepEqual(curriculumGate,{
     publicLabel:'우기기/가정하여 풀기',approvedLabel:'두 점수 가정법 복습',wrongSource:null,
     wrongRawType:null,wrongCanonical:null,wrongKind:null,emptyPoints:null,
     duplicateBook:null,locked:null,duplicate:null,
     approvedBook:'검수 교재',approvedPoint:'두 점수 차이를 한 문제당 점수 차이로 나누기',
     final1Label:'달력·요일(시계)'
    },'Final2 공용 답안표 처방을 기본으로 쓰고 명시적 문항 승인 payload 검증은 보존');
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
     for(const no of [...new Set(detailCoverage.newNos.concat([23,27,28]))]){
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
   if(n===3){
    assert.equal(await page.locator('#final3DetailedSolutions .is-ready').count(),30,'all reviewed Final3 solutions are public without a preview flag');
    assert.equal(await page.locator('#final3DetailedSolutions .is-pending').count(),0,'no reviewed Final3 item remains pending on the public report');
    await page.goto(base+'/final.html?round=3&go=report&preview=1&name='+encodeURIComponent(student));
    await page.locator('.final-report-package').waitFor();
    assert.equal(await page.locator('#final3DetailedSolutions .is-ready').count(),30,'local preview uses the same reviewed 30-item set');
    assert.equal(await page.locator('#final3DetailedSolutions .is-pending').count(),0,'no reviewed Final3 item remains pending on screen');
    assert.match(await page.locator('#final3DetailedSolutions .final1-solutions-head').textContent(),/30문항 \/ 전체 30문항/);
    assert.ok(await page.locator('#final3DetailedSolutions .final1-data-table').count()>=25,'all reviewed Final3 teaching tables render');
    assert.equal(await page.locator('#final3DetailedSolutions .f3-back-diagram').count(),7,'seven reviewed back-half diagrams render');
    for(const [no,svgCount] of Object.entries(FINAL3_DIAGRAM_SVG_COUNTS)){
     const figure=page.locator('#final3-solution-'+no+' .gfield-final3-solution-diagram');
     assert.equal(await figure.count(),1,'Q'+no+' has one source-bound diagram wrapper');
     assert.equal(await figure.locator('svg').count(),svgCount,'Q'+no+' has its exact SVG set');
    }
    const shownAnswers=await page.locator('#final3DetailedSolutions .is-ready .final1-answer').allTextContents();
    assert.match(shownAnswers[0],/바나나 144개, 사과 233개/);
    assert.match(shownAnswers[2],/검은 타일 188개/);
    assert.match(shownAnswers[6],/동그라미 1개/);
    assert.match(shownAnswers[13],/관호 35살, 주연 21살/);
    await page.setViewportSize({width:390,height:900});
    const mobile=await page.locator('#final3DetailedSolutions').evaluate(node=>({
     fits:node.scrollWidth<=node.clientWidth+1,
     cards:[...node.querySelectorAll('.is-ready')].every(card=>card.scrollWidth<=card.clientWidth+1),
     diagrams:[...node.querySelectorAll('.gfield-final3-solution-diagram')].every(figure=>figure.scrollWidth<=figure.clientWidth+1),
     tables:[...node.querySelectorAll('.final1-data-table')].every(table=>table.scrollWidth<=table.parentElement.clientWidth+1)
    }));
    assert.deepEqual(mobile,{fits:true,cards:true,diagrams:true,tables:true},'Final3 reviewed cards fit at 390px');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#final3DetailedSolutions .is-pending').count(),0,'no pending Final3 placeholders enter print');
    assert.equal(await page.locator('#final3DetailedSolutions .is-ready').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).display!=='none')),true,'Q1-Q30 remain printable');
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:1280,height:900});
   }
   if(n===4){
    assert.equal(await page.locator('#final4DetailedSolutions .is-ready').count(),30,'all source-linked Final4 solutions are public');
    assert.equal(await page.locator('#final4DetailedSolutions .is-pending').count(),0,'no Final4 item remains pending');
    assert.match(await page.locator('#final4DetailedSolutions .final1-solutions-head').textContent(),/30문항 \/ 전체 30문항/);
    assert.ok(await page.locator('#final4DetailedSolutions .final1-data-table').count()>=9,'complex Final4 items keep teaching tables where useful');
    assert.equal(await page.locator('#final4-solution-9').evaluate(node=>node.classList.contains('is-ready')),true,'Q9 supplied answer condition is connected');
    assert.match(await page.locator('#final4-solution-21').textContent(),/10이.*100/,'Q21 Korean particle reread is explained');
    assert.match(await page.locator('#final4-solution-27').textContent(),/8450이며/,'Q27 Korean particle reread is explained');
    await page.setViewportSize({width:390,height:900});
    assert.ok(await page.locator('#final4DetailedSolutions').evaluate(node=>node.scrollWidth<=node.clientWidth+1&&[...node.querySelectorAll('.is-ready')].every(card=>card.scrollWidth<=card.clientWidth+1)),'Final4 released cards fit at 390px');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#final4DetailedSolutions .is-ready').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).display!=='none')),true,'all Final4 solutions remain printable');
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:1280,height:900});
   }
   results.push({round:n,cumulativeRounds:checked.rounds.length,answerRates:30});
  }
  await page.goto(base+'/last1-result.html?round=1&name='+encodeURIComponent(student));
  await page.locator('.final-report-package').waitFor();
  const lastCumulative=await page.evaluate(({records,ox})=>{
   const map=Object.fromEntries(records.map(row=>[row.round,row]));
   return GF_TEST.computeCumulativeConsidered(1,map,2,'last1',ox.split(''),false).map(row=>row.label);
  },{records,ox});
  assert.deepEqual(lastCumulative,['파이널 1회','파이널 2회','파이널 3회','파이널 4회','최종 1회'],'Last1 includes all four Final first records plus Last1');
  assert.equal(lastCumulative.length,5,'Last1 cumulative source still contains the four Final and one Last results');
  await page.goto(base+'/final.html?set=last&round=1&go=report&name='+encodeURIComponent(student));
  await page.locator('.final-report-package').waitFor();
  assert.equal(await page.locator('#report-summary').count(),1,'Last1 uses the shared parent report summary');
  assert.match(await page.locator('#report-summary').innerText(),/최종 1회/);
  assert.match(await page.locator('#report-summary').innerText(),/파이널 1~4회.*최종 1회/,'Last1 cumulative label keeps the distinct Final+Last scope');
  assert.ok(await page.locator('.report-compact-print-header .report-qr-code svg').count()>=1,'Last1 print summary renders its report QR');
  assert.match(decodeURIComponent(await page.locator('.report-compact-print-header .report-qr-code').first().getAttribute('data-qr-url')),/round=1&go=report&set=last/,'Last1 QR keeps its own series and round');
  assert.match(await page.locator('#report-plan').innerText(),/문항 정답률이 내 전체 정답률보다 높은/,'Last1 priority note explains its personal-vs-item accuracy rule');
  const last1Priorities=await page.locator('#report-plan .parent-priority-list li').evaluateAll(nodes=>nodes.map(node=>({text:node.innerText,no:Number((node.innerText.match(/^\s*\d+/)||[])[0])})));
  assert.ok(last1Priorities.length<=3,'Last1 recommends at most three qualifying questions');
  const last1Rates=await page.evaluate(()=>{const ctx=GF_TEST.buildContext('검수',1,('O'.repeat(20)+'X'.repeat(10)).split(''));return {own:ctx.ncorr/ctx.items.length,rates:ctx.rate,wrong:ctx.wrongList.map(item=>item.no)};});
  assert.ok(last1Priorities.every(row=>last1Rates.wrong.includes(row.no)&&Number(last1Rates.rates[row.no])>last1Rates.own),'Last1 priorities are wrong answers with question accuracy above the student accuracy');
  for(const selector of ['#report-plan','#report-strengths','#report-tiers','#report-items','#report-review','#report-materials'])assert.equal(await page.locator(selector).count(),1,'Last1 parent section '+selector);
  assert.equal(await page.locator('#detailWrap .bar').count(),30,'Last1 keeps its own verified 30-item rates');
  assert.equal(await page.locator('.final1-detailed-card.is-ready').count(),30,'Last1 retains its own reviewed solutions');
  assert.equal(await page.locator('#wrongPractice .wp-item').count(),10,'Last1 practice lists only missed items');
  const practicePopup=page.waitForEvent('popup');
  await page.locator('#wpStart').click();
  await practicePopup.then(async popup=>{await popup.waitForLoadState('domcontentloaded');assert.match(popup.url(),/bank=last1/);assert.match(popup.url(),/source=last%7C1/);await popup.close();});
  for(const width of [1280,390]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Last1 report fits '+width+'px');
   if(process.env.GFIELD_LAST1_QA_ARTIFACT_DIR){const dir=process.env.GFIELD_LAST1_QA_ARTIFACT_DIR;fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'last1-report-'+width+'.png'),fullPage:true});}
  }
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.report-fixed-watermark').count(),1,'Last1 native print keeps the student watermark');
  assert.ok(await page.locator('#report-materials .report-resource-details[open]').count()>=1,'Last1 expands learning material details in print');
  assert.notEqual(await page.locator('#report-materials .final1-detailed-card.is-ready').first().evaluate(node=>getComputedStyle(node).display),'none','Last1 detailed solutions remain printable');
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  if(process.env.GFIELD_LAST1_QA_ARTIFACT_DIR){const dir=process.env.GFIELD_LAST1_QA_ARTIFACT_DIR;await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(dir,'last1-report-print.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});}
  await page.emulateMedia({media:'screen'});
  assert.ok(calls.some(call=>call.action==='read-report'&&call.exam==='last1'),'Last1 reads its isolated comment key');
  failedExam='final3';
  await page.goto(base+'/final.html?round=3&go=report&name='+encodeURIComponent(student));await page.locator('.final-report-package').waitFor();
  assert.equal(await page.evaluate(()=>GF_TEST.buildContext('검수',3,('O'.repeat(20)+'X'.repeat(10)).split('')).populationVerified),true,'approved public aggregate remains trusted when the authenticated lookup is unavailable');
  assert.equal(await page.locator('#detailWrap .bar').count(),30,'fixed answer rates survive offline reference');
  assert.match(await page.locator('.report-screen-header').innerText(),/석차 백분율/,'saved student score uses the approved public score-percentile lookup');
  assert.equal(JSON.stringify(records),source);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({pass:true,results,offlinePublicAggregate:true,productionWrites:0}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
