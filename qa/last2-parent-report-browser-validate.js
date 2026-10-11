'use strict';

// Last2 integration QA only. Synthetic pupils, intercepted requests, no live writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..');
const output=path.resolve(process.env.GFIELD_LAST2_REVIEW_DIR||'E:\\Codex\\hs-admin-unify-20261004\\qa');
const student='최종2합성검수학생';
const allO='O'.repeat(30),allX='X'.repeat(30);
const makeOx=wrong=>Array.from({length:30},(_,i)=>wrong.includes(i+1)?'X':'O').join('');
const mixed=makeOx([2,5,8,12,15,19,22,25,28]);
const first=makeOx([1,3,6,12,17,21,26]);
function scoreOf(ox){return Math.round([...ox].reduce((sum,x,i)=>sum+(x==='O'?(i<12?2.7:i<22?3.4:4.2):0),0)*10)/10;}
function row(round,ox){return {student,round,ox,score:scoreOf(ox),wrong:[...ox].filter(x=>x==='X').length,source:round.includes('@')?'practice-student':'admin',updated_at:'2026-10-11T00:00:00Z'};}
const finals=[row('final1',allO),row('final2',allX),row('final3',first),row('final4',mixed)];
let records=[],commentFail=false,snapshotPoison=false;
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["파이널 모의고사"]=[n];d.archiveAccess["최종 모의고사"]=[n];d.archiveProductAccess=d.archiveProductAccess||{};d.archiveProductAccess["mock-final-8"]=[n];d.attendance[n]=d.nodes.filter(x=>/파이널|최종/.test(x.title||"")).map(x=>x.id);})();';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(p==='/qa-last2-print-blank'){res.setHeader('Content-Type',types['.html']);return res.end('<!doctype html><html><head></head><body></body></html>');}
  const f=path.resolve(root,'.'+decodeURIComponent(p));
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');
  if(p==='/data.js')return res.end(data);
  fs.createReadStream(f).pipe(res);
});
const evidence={cases:[],failures:[],pdfs:[],writes:[],requests:[],browserErrors:[],externalActualWrites:0};
if(process.env.GFIELD_LAST2_SKIP_PDF){
  const saved=path.join(output,'last2-parent-report-browser-results.json');
  if(fs.existsSync(saved))evidence.pdfs=JSON.parse(fs.readFileSync(saved,'utf8')).pdfs||[];
}
async function check(label,fn){try{const detail=await fn();evidence.cases.push({label,pass:true,detail});console.log('PASS '+label+' '+JSON.stringify(detail||{}));}catch(e){evidence.failures.push({label,message:e.message});evidence.cases.push({label,pass:false});console.error('FAIL '+label+' '+e.message);}}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(n=>{
    localStorage.setItem('gfield_student',n);
    localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:n}));
    window.print=()=>{window.__qaPrintCalls=(window.__qaPrintCalls||0)+1;};
    let parent;
    Object.defineProperty(window,'GFIELD_FINAL_PARENT_REPORT',{configurable:true,get:()=>parent,set:api=>{
      parent=Object.assign({},api,{model:(ctx,options)=>{const vm=api.model(ctx,options);window.__qaParentVM=vm;window.__qaCtx=ctx;window.__qaParentOptions=options;return vm;}});
    }});
    let printer;
    let similar;
    Object.defineProperty(window,'GFIELD_FINAL_SUMMARY_PRACTICE_PRINT',{configurable:true,get:()=>similar,set:api=>{similar=Object.assign({},api,{attach:options=>{const controller=api.attach(Object.assign({},options,{openPrint:false}));window.__qaSimilarController=controller;return controller;}});}});
    Object.defineProperty(window,'GFIELD_FINAL_REPORT_PRINT',{configurable:true,get:()=>printer,set:api=>{
      printer=Object.assign({},api,{
        createPreparation:options=>{const job=api.createPreparation(options);window.__qaPrintJob=job;return job;},
        // Exercise the real attached preparation button without a native dialog.
        attach:options=>api.attach(Object.assign({},options,{openPrint:false,onStateChange:value=>{window.__qaButtonPrintState=value;if(options.onStateChange)options.onStateChange(value);}}))
      });
    }});
  },student);
  await context.route(/^https?:\/\//,route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin===base){if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
    if(url.pathname==='/rest/v1/mock_results'){
      evidence.requests.push({method:req.method(),path:url.pathname,student:url.searchParams.get('student')});
      if(req.method()!=='GET')evidence.writes.push(req.method()+' '+url.pathname);
      return route.fulfill({json:records});
    }
    if(url.pathname.endsWith('/hs-final-population')){
      const b=req.postDataJSON();evidence.requests.push({path:url.pathname,body:b});
      if(b.action){
        if(b.action!=='read-report')evidence.writes.push(b.action);
        if(commentFail)return route.fulfill({status:503,json:{error:'SYNTHETIC_COMMENT_UNAVAILABLE'}});
        const found=records.find(r=>r.round===b.exam);
        const snapshot=snapshotPoison?{exam:'final2',version:'POISON-FINAL2',percentile:99.9}:null;
        return route.fulfill({json:{canEdit:false,comment:'합성 코멘트 '+b.student+' '+b.exam,snapshot,resultOx:found&&found.ox}});
      }
      const baseline={schemaVersion:1,exam:b.exam,scope:'provided-original-records',approved:true,version:b.exam+'-'+'2'.repeat(64),rows:[{id:'a',ox:allO,score:100},{id:'b',ox:allX,score:0}]};
      return route.fulfill({json:core.createResponse(baseline,b.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(req.method())&&!url.pathname.endsWith('/access_log'))evidence.writes.push(req.method()+' '+url.pathname);
    if(/fonts\.googleapis\.com|cdn\.jsdelivr\.net/.test(url.hostname))return route.fulfill({contentType:'text/css',body:''});
    return route.fulfill({json:[]});
  });
  const page=await context.newPage();page.on('pageerror',e=>evidence.browserErrors.push(e.message));
  async function open(round=2,set='last',attempt=1){
    await page.goto(base+'/final.html?'+(set==='last'?'set=last&':'')+'round='+round+'&go=report&attempt='+attempt+'&name='+encodeURIComponent(student));
    await page.locator('#report-summary').waitFor();
    await page.waitForFunction(()=>!!window.__qaParentVM);
  }
  async function view(){return page.evaluate(()=>{
    const numbers=selector=>[...document.querySelectorAll(selector)].map(el=>Number(el.textContent.match(/(\d+)번/)?.[1])).filter(Number.isFinite);
    return {
      vm:window.__qaParentVM,
      ctx:{score:window.__qaCtx.score,ncorr:window.__qaCtx.ncorr,wrong:window.__qaCtx.wrong,miss:window.__qaCtx.miss,rates:window.__qaCtx.rate,items:window.__qaCtx.items,wrongList:window.__qaCtx.wrongList},
      summary:document.querySelector('#report-summary').innerText,
      trend:document.querySelector('.score-trend-cumulative')?.innerText||'',
      comment:document.querySelector('.docssam-saved-comment')?.innerText||'',
      priority:numbers('.parent-priority-list li b'),
      table:numbers('#report-items .report-wrong-summary tr.report-print-priority td:first-child'),
      curriculum:numbers('#curriculumConnection tr.report-print-priority td:first-child'),
      coaching:numbers('.coaching-priority tbody tr td:first-child'),
      planText:document.querySelector('#report-plan .personal-study-plan')?.innerText||'',
      resources:performance.getEntriesByType('resource').map(x=>x.name)
    };
  });}
  function assertPriority(v,expected){
    assert.deepEqual(v.vm.priorityItems.map(x=>x.no),expected,'actual parent VM priority');
    assert.deepEqual(v.priority,expected,'visible parent priority list');
    assert.deepEqual(v.table.slice().sort((a,b)=>a-b),expected.slice().sort((a,b)=>a-b),'highlighted wrong summary');
    assert.deepEqual(v.coaching,expected,'automatic coaching priority order');
    assert.deepEqual(v.curriculum.slice().sort((a,b)=>a-b),expected.slice().sort((a,b)=>a-b),'curriculum table highlights the same actual priority list');
    // The compact three-stage plan refers to the adjacent ordered list rather
    // than repeating each number. Check its count/target, not invented labels.
    if(expected.length)assert.match(v.planText,new RegExp('이번 주 우선 '+expected.length+'문항'),'three-stage plan agrees with actual priority count');
    if(expected.length)assert.ok(v.planText.includes(v.ctx.score+'점 → '+v.vm.targetScore+'점'),'three-stage plan agrees with actual priority target');
  }
  function genericExpected(v){return (v.ctx.miss.length?v.ctx.miss:v.ctx.wrongList.map(x=>x.no)).slice(0,3);}
  async function pdf(tag){
    await page.evaluate(async()=>{window.__qaPrepared=await window.GFIELD_FINAL_REPORT_PRINT.createPreparation({source:document.querySelector('.final-report-package'),mode:'summary'}).promise;});
    if(tag==='zero'){
      await page.evaluate(()=>{window.__qaPrepared.frame.style.cssText='position:fixed!important;left:0!important;top:0!important;width:800px!important;height:1200px!important;opacity:1!important;visibility:visible!important;z-index:99999!important';});
      for(const n of [2,3])await page.frameLocator('iframe.gfield-final-report-print-frame').locator('.pagedjs_pages > .pagedjs_page').nth(n).screenshot({path:path.join(output,'last2-zero-original-page-'+(n+1)+'.png')});
    }
    const rendered=await page.evaluate(()=>{
      const p=window.__qaPrepared,doc=p.frame.contentDocument,copy=doc.documentElement.cloneNode(true);
      copy.querySelectorAll('script').forEach(s=>s.remove());
      const base=document.createElement('base');base.href=new URL('/',location.href).href;copy.querySelector('head').prepend(base);
      const pages=[...doc.querySelectorAll('.pagedjs_pages > .pagedjs_page')];
      const summaryPages=pages.map((node,index)=>({page:index+1,heading:!!node.querySelector('#report-summary h2'),cards:node.querySelectorAll('#report-summary .parent-summary-column').length}));
      return {html:'<!doctype html>'+copy.outerHTML,metrics:p.metrics,text:doc.body.innerText,practice:doc.querySelectorAll('.gfield-summary-practice-page').length,pages:pages.length,summaryPages};
    });
    assert.equal(rendered.metrics.mode,'summary');assert.equal(rendered.metrics.detailItems.length,0);assert.equal(rendered.practice,0);
    assert.doesNotMatch(rendered.text,/last1-q|30문항 상세 풀이/,'no wrong-source or full-answer fallback');
    const summary=rendered.summaryPages.find(x=>x.heading);
    assert.ok(summary&&summary.cards===2,'Last2 summary heading and both result cards share a page');
    assert.equal(rendered.summaryPages.reduce((s,x)=>s+x.cards,0),2,'summary cards are not split/duplicated across pages');
    const exportPage=await context.newPage();
    try{
      await exportPage.goto(base+'/qa-last2-print-blank');await exportPage.setContent(rendered.html,{waitUntil:'load'});
      await exportPage.waitForFunction(()=>[...document.images].every(x=>x.complete&&x.naturalWidth>0));await exportPage.evaluate(()=>document.fonts.ready);
      await exportPage.emulateMedia({media:'print'});
      const sectionLayout=await exportPage.evaluate(()=>{
        return [...document.querySelectorAll('.pagedjs_pages #report-strengths')].map(el=>{
          const r=el.getBoundingClientRect(),p=el.closest('.pagedjs_page'),pr=p.getBoundingClientRect();
          let node=el,parents=[];while(node&&node!==p){const s=getComputedStyle(node);parents.push({tag:node.tagName,id:node.id,classes:node.className,display:s.display,visibility:s.visibility,overflow:s.overflow});node=node.parentElement;}
          return {text:el.innerText,pageNumber:p.dataset.pageNumber,pageIndex:[...document.querySelectorAll('.pagedjs_pages > .pagedjs_page')].indexOf(p),relativeTop:r.top-pr.top,relativeBottom:r.bottom-pr.top,height:r.height,pageHeight:pr.height,parents};
        });
      });
      console.log('PDF '+tag+' strengths layout '+JSON.stringify(sectionLayout.map(x=>({pageNumber:x.pageNumber,pageIndex:x.pageIndex,top:x.relativeTop,bottom:x.relativeBottom,height:x.height}))));
      if(tag==='zero')for(const n of [2,3])await exportPage.locator('.pagedjs_pages > .pagedjs_page').nth(n).screenshot({path:path.join(output,'last2-zero-export-page-'+(n+1)+'.png')});
      const target=path.join(output,'last2-'+tag+'-summary-a4.pdf');
      await exportPage.pdf({path:target,format:'A4',preferCSSPageSize:true,printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
      const python=process.env.GFIELD_QA_PDF_PYTHON||'C:\\Users\\user\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
      const readback=JSON.parse(execFileSync(python,['-X','utf8','-c','from pypdf import PdfReader; import json,sys; r=PdfReader(sys.argv[1]); print(json.dumps({"pages":len(r.pages),"texts":[p.extract_text() or "" for p in r.pages]},ensure_ascii=True))',target],{encoding:'utf8',timeout:10000}));
      const text=readback.texts.join('').replace(/\s/g,'');
      const required=['성적 요약','이번 주 학습','강점과 보완점','오답 요약'];
      const sections=Object.fromEntries(required.map(title=>[title,text.includes(title.replace(/\s/g,''))]));
      evidence.pdfs.push({path:target,pages:readback.pages,metrics:rendered.metrics,summaryPages:rendered.summaryPages,sectionLayout,physicalSections:sections});
      await check('actual A4 '+tag+' PDF retains all required summary sections',async()=>{assert.equal(readback.pages,rendered.pages);assert.ok(Object.values(sections).every(Boolean),'physical PDF section loss: '+JSON.stringify(sections));return {pages:readback.pages,sections};});
    }finally{await exportPage.close();await page.evaluate(()=>window.__qaPrepared.cleanup());}
    return {pages:rendered.pages,metrics:rendered.metrics};
  }
  try{
    if(process.env.GFIELD_LAST2_PRINT_ONLY){
      const tags=process.env.GFIELD_LAST2_PRINT_ONLY==='all'?['zero','perfect','mixed']:[process.env.GFIELD_LAST2_PRINT_ONLY];
      for(const tag of tags){
        assert.ok(['zero','perfect','mixed'].includes(tag),'known synthetic print case');
        await check('focused Last2 '+tag+' summary preparation',async()=>{
          const ox=tag==='zero'?allX:tag==='perfect'?allO:mixed;
          records=[...finals,row('last1',first),row('last2',ox)];await open();const v=await view();assertPriority(v,genericExpected(v));
          return pdf(tag);
        });
      }
      await check('focused print has no production writes or browser errors',async()=>{assert.deepEqual(evidence.writes,[]);assert.deepEqual(evidence.browserErrors,[]);return {writes:0,browserErrors:0};});
    }else{
    await check('Last2 only and priorities 0/1/2/3',async()=>{
      const details=[];
      for(const wrong of [[],[1],[1,2],Array.from({length:30},(_,i)=>i+1)]){
        const ox=makeOx(wrong);records=[row('last2',ox)];await open();const v=await view();
        assert.equal(v.vm.current.score,scoreOf(ox));assert.equal(v.vm.cumulative.scoreAverage,scoreOf(ox));assert.deepEqual(v.vm.cumulative.personalRounds,[2]);
        assert.equal(v.vm.overallTrend.judgeCount,1);assert.equal(v.vm.overallTrend.lastRound,2);assert.match(v.summary,/최종 1~2회 누적[\s\S]*1\/2회/);
        const expected=genericExpected(v);assertPriority(v,expected);assert.equal(expected.length,Math.min(wrong.length,3));
        assert.equal(v.vm.targetScore,expected.length?Math.min(100,Math.round((scoreOf(ox)+expected.reduce((s,n)=>s+(n<=12?2.7:n<=22?3.4:4.2),0))*10)/10):null);
        assert.match(v.comment,/합성 코멘트 .*last2/);assert.ok(v.resources.some(x=>x.includes('final-summary-practice-print.js')),'approved Last2 variants use the shared printer');
        details.push({wrong:wrong.length,priority:expected,score:v.ctx.score});
      }
      return details;
    });
    await check('Last1+2 cumulative plus Final full-history and future/retake exclusion',async()=>{
      records=[...finals,row('last1',first),row('last2',mixed),row('last3',allO),row('last4',allO),row('last1@2',allO),row('last2@2',allO)];
      await open();const v=await view(),expected=Math.round((scoreOf(first)+scoreOf(mixed))/2*10)/10;
      assert.equal(v.vm.cumulative.scoreAverage,expected);assert.deepEqual(v.vm.cumulative.personalRounds,[1,2]);assert.equal(v.vm.overallTrend.scoreAverage,expected);
      assert.deepEqual(v.vm.overallTrend.rows.map(x=>x.key),['final1','final2','final3','final4','last1','last2']);assert.equal(v.vm.overallTrend.judgeCount,2);
      const pct=Math.round(v.vm.overallTrend.rows.filter(x=>x.key.startsWith('last')).reduce((s,x)=>s+x.percentile,0)/2*10)/10;
      assert.equal(v.vm.overallTrend.percentileAverage,pct);assert.equal(v.vm.cumulative.percentileAverage,pct);assert.match(v.summary,/2\/2회/);assert.match(v.trend,/최종 1~2회 \(2회\)/);
      assertPriority(v,genericExpected(v));return {scoreAverage:expected,percentileAverage:pct,grade:v.vm.overallTrend.cumulativeGrade,history:v.vm.overallTrend.rows.map(x=>x.key),priority:genericExpected(v)};
    });
    await check('Last2 retake current score changes; first official cumulative stays',async()=>{
      await open(2,'last',2);const v=await view();assert.equal(v.vm.current.score,100);assert.equal(v.vm.isPractice,true);assert.equal(v.vm.overallTrend.scoreAverage,Math.round((scoreOf(first)+scoreOf(mixed))/2*10)/10);assertPriority(v,[]);assert.match(v.summary,/최초 응시 성적을 유지/);return {current:100,cumulative:v.vm.overallTrend.scoreAverage};
    });
    await check('Last2 comment isolation, failure recovery, no Final snapshot statistics',async()=>{
      records=[row('last1',first),row('last2',mixed),row('final2',allX)];snapshotPoison=true;
      let offset=evidence.requests.length;await open();const good=await view();
      assert.deepEqual(evidence.requests.slice(offset).filter(x=>x.body?.action).map(x=>x.body.exam),['last2']);assert.notEqual(good.vm.current.percentile,99.9);
      await open(1);assert.match((await view()).comment,/last1/);assert.doesNotMatch((await view()).comment,/last2/);
      commentFail=true;await open();assert.doesNotMatch((await view()).comment,/last1|final2/);
      commentFail=false;await open();assert.match((await view()).comment,/last2/);assert.equal((await view()).vm.current.percentile,good.vm.current.percentile);snapshotPoison=false;
      const split=await page.evaluate(async ({name,ox})=>{
        const other=name+'B';
        const b=await window.GFIELD_FINAL_REPORT_STATE.load(other,2,ox,'student',false,false,'last');
        const a=await window.GFIELD_FINAL_REPORT_STATE.load(name,2,ox,'student',false,false,'last');
        return {b:{student:b.student,exam:b.exam,comment:b.comment},a:{student:a.student,exam:a.exam,comment:a.comment}};
      },{name:student,ox:mixed});
      assert.equal(split.b.student,student+'B');assert.equal(split.b.exam,'last2');assert.ok(split.b.comment.includes(student+'B last2'));assert.ok(split.a.comment.includes(student+' last2'));assert.ok(!split.a.comment.includes(student+'B'));
      assert.equal(await page.locator('[data-docssam-save],.docssam-comment-editor textarea').count(),0,'student cannot edit teacher comment');return {last2Percentile:good.vm.current.percentile,commentReadOnly:true};
    });
    await check('Last1 and Final8 retained special priority policies',async()=>{
      records=[...finals,row('last1',mixed),row('final8',mixed)];await open(1);let v=await view();
      const ordered=v.ctx.wrongList.slice().sort((a,b)=>v.ctx.rates[b.no]-v.ctx.rates[a.no]||a.no-b.no).slice(0,3).map(x=>x.no);
      assertPriority(v,ordered);assert.match(v.summary,/파이널 1~4회 \+ 최종 1회 누적[\s\S]*5\/5회/);
      await open(8,'final');v=await view();const basic=v.ctx.wrongList.filter(x=>x.no<=22).sort((a,b)=>a.no-b.no).slice(0,3).map(x=>x.no);
      assert.deepEqual(v.vm.priorityItems.map(x=>x.no),basic);assert.deepEqual(v.priority,basic);assert.match(v.summary,/최종 실전 모의고사 8회/);return {last1:ordered,final8:basic};
    });
    await check('Main hub cumulative values equal Last2 report; all history rows retained',async()=>{
      records=[...finals,row('last1',first),row('last2',mixed),row('last2@2',allO)];await open();const report=await view();
      await page.goto(base+'/index.html');if(await page.locator('#skipBtn').count())await page.locator('#skipBtn').click();
      if(await page.locator('#name-input').isVisible()){await page.locator('#name-input').fill(student);await page.locator('.enter').click();}
      const hub=page.locator('#student-result-hub');await hub.locator('.srh-summary').filter({hasText:'응시'}).waitFor();await hub.locator('.srh-banner').click();
      const cumulative=await hub.locator('.srh-cumulative').innerText();assert.equal(await hub.locator('tbody tr').count(),6);
      assert.match(await hub.locator('.srh-summary').innerText(),/최종 1~2회 누적 2\/2회/);assert.doesNotMatch(cumulative,/6\/8회/);assert.match(cumulative,/최종 1~2회 누적 2\/2회/);
      assert.equal(await hub.locator('.srh-cumulative').getAttribute('data-final-last-count'),'6','history data attribute retains all six official attempts');
      assert.ok(cumulative.includes('원점수 평균 '+report.vm.overallTrend.scoreAverage.toFixed(1)+'점'));assert.ok(cumulative.includes(report.vm.overallTrend.percentileAverage.toFixed(1)+'%'));assert.ok(cumulative.includes(report.vm.overallTrend.cumulativeGrade));
      await page.screenshot({path:path.join(output,'last2-main-1280.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(output,'last2-main-390.png')});
      await page.locator('[data-v="roadmap"]').click();assert.ok(await page.locator('#view-roadmap').isVisible());await page.screenshot({path:path.join(output,'last2-roadmap-390.png')});
      return {mainBanner:await hub.locator('.srh-summary').innerText(),cumulative,reportAverage:report.vm.overallTrend.scoreAverage,reportPercentile:report.vm.overallTrend.percentileAverage,roadmapVisible:true};
    });
    await check('Main hub Last2-only caption is 1/2 while missing Last1 is not zero',async()=>{
      records=[row('last2',mixed)];await open();const report=await view();await page.goto(base+'/index.html');
      if(await page.locator('#skipBtn').count())await page.locator('#skipBtn').click();
      if(await page.locator('#name-input').isVisible()){await page.locator('#name-input').fill(student);await page.locator('.enter').click();}
      const hub=page.locator('#student-result-hub');await hub.locator('.srh-summary').filter({hasText:'최종 1~2회 누적 1/2회'}).waitFor();
      const cumulative=await hub.locator('.srh-cumulative').innerText();assert.match(cumulative,/최종 1~2회 누적 1\/2회/);assert.ok(cumulative.includes('원점수 평균 '+report.vm.overallTrend.scoreAverage.toFixed(1)+'점'));assert.ok(cumulative.includes(report.vm.overallTrend.percentileAverage.toFixed(1)+'%'));assert.ok(cumulative.includes(report.vm.overallTrend.cumulativeGrade));assert.equal(await hub.locator('tbody tr').count(),1);
      return {banner:await hub.locator('.srh-summary').innerText(),score:report.vm.overallTrend.scoreAverage,percentile:report.vm.overallTrend.percentileAverage};
    });
    await check('actual Last2 summary button includes the same three priority types and nine variants',async()=>{
      records=[row('last2',mixed)];await open();
      const prepared=await page.evaluate(async()=>{
        const prep=await window.__qaSimilarController.prepareAndPrint(),doc=prep.frame.contentDocument;
        const summaryPages=[...doc.querySelectorAll('.pagedjs_pages > .pagedjs_page')].map((node,index)=>({page:index+1,heading:!!node.querySelector('#report-summary h2'),cards:node.querySelectorAll('#report-summary .parent-summary-column').length}));
        return {metrics:prep.metrics,frames:prep.frame.isConnected?1:0,practice:doc.querySelectorAll('.gfield-summary-practice-page').length,priority:window.__qaParentVM.priorityItems.map(x=>x.no),curriculum:[...doc.querySelectorAll('.pagedjs_pages [data-curriculum-no]')].map(x=>Number(x.dataset.curriculumNo)),summaryPages};
      });
      assert.equal(prepared.frames,1);assert.ok(prepared.practice>0);assert.equal(prepared.metrics.practiceQuestions,prepared.priority.length*3);assert.equal(prepared.metrics.practiceAnswers,prepared.priority.length*3);assert.deepEqual(prepared.metrics.practiceSourceNos,prepared.priority);assert.deepEqual(prepared.curriculum,prepared.priority);assert.ok(prepared.summaryPages.some(x=>x.heading&&x.cards===2));assert.match(await page.locator('#printBtn').innerText(),/추천 유사문제/);return prepared;
    });
    await check('Last2 desktop/mobile and actual A4 summary PDFs 0/100/mixed',async()=>{
      const details=[];
      for(const [tag,ox] of [['zero',allX],['perfect',allO],['mixed',mixed]]){
        records=[...finals,row('last1',first),row('last2',ox)];await open();const v=await view();assertPriority(v,genericExpected(v));
        for(const width of [1280,390]){
          await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'viewport fits '+width);
          assert.ok(await page.locator('#report-plan .personal-study-plan').isVisible());
          await page.screenshot({path:path.join(output,'last2-'+tag+'-'+width+'.png')});
          await page.locator('.parent-report-index a[href="#report-plan"]').click();await page.screenshot({path:path.join(output,'last2-'+tag+'-plan-'+width+'.png')});
        }
        await page.setViewportSize({width:1280,height:900});
        assert.match(await page.locator('#printBtn').innerText(),tag==='perfect'?/진단 요약만/:/추천 유사문제/);
        if(!process.env.GFIELD_LAST2_SKIP_PDF)details.push({tag,...await pdf(tag)});
        else{
          const saved=evidence.pdfs.find(x=>path.basename(x.path)==='last2-'+tag+'-summary-a4.pdf');
          assert.ok(saved&&fs.existsSync(saved.path),'previously rendered A4 artifact is preserved');
          assert.equal(saved.metrics.mode,'summary');assert.deepEqual(saved.metrics.detailItems,[]);
          details.push({tag,pages:saved.pages,path:saved.path,reusedArtifact:true});
        }
      }
      return details;
    });
    await check('all synthetic checks perform no production writes or browser errors',async()=>{assert.deepEqual(evidence.writes,[]);assert.deepEqual(evidence.browserErrors,[]);return {writes:0,browserErrors:0,requests:evidence.requests.length};});
    }
  }finally{
    fs.writeFileSync(path.join(output,process.env.GFIELD_LAST2_PRINT_ONLY?'last2-parent-report-print-results.json':'last2-parent-report-browser-results.json'),JSON.stringify(evidence,null,2));
    await browser.close();await new Promise(r=>server.close(r));
  }
  if(evidence.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
