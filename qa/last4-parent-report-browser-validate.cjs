'use strict';

// Last4 integration QA only. Synthetic pupils, intercepted requests, no live writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'E:/Codex/tooling/elementary-playwright/node_modules/playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const approved=require('../bank/data/last4-reviewed.json');
const root=path.resolve(__dirname,'..');
const output=process.env.GFIELD_LAST4_QA_OUTPUT||path.join(root,'.private-work/last4-reuse-20261022/qa-report');
const student='최종4합성검수학생';
const allO='O'.repeat(30),allX='X'.repeat(30);
const makeOx=wrong=>Array.from({length:30},(_,i)=>wrong.includes(i+1)?'X':'O').join('');
const mixed=makeOx([2,5,8,12,15,19,22,25,28]);
const first=makeOx([1,3,6,12,17,21,26]);
function scoreOf(ox){return Math.round([...ox].reduce((sum,x,i)=>sum+(x==='O'?(i<12?2.7:i<22?3.4:4.2):0),0)*10)/10;}
function row(round,ox){return {student,round,ox,score:scoreOf(ox),wrong:[...ox].filter(x=>x==='X').length,source:round.includes('@')?'practice-student':'admin',updated_at:'2026-10-15T00:00:00Z'};}
const finals=[row('final1',allO),row('final2',allX),row('final3',first),row('final4',mixed)];
let records=[],commentFail=false,snapshotPoison=false;
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["파이널 모의고사"]=[n];d.archiveAccess["최종 모의고사"]=[n];d.archiveProductAccess=d.archiveProductAccess||{};d.archiveProductAccess["mock-final-8"]=[n];d.attendance[n]=d.nodes.filter(x=>/파이널|최종/.test(x.title||"")).map(x=>x.id);})();';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(p==='/qa-last4-print-blank'){res.setHeader('Content-Type',types['.html']);return res.end('<!doctype html><html><head></head><body></body></html>');}
  const f=path.resolve(root,'.'+decodeURIComponent(p));
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');
  if(p==='/data.js')return res.end(data);
  fs.createReadStream(f).pipe(res);
});
const evidence={cases:[],failures:[],pdfs:[],writes:[],requests:[],browserErrors:[],externalActualWrites:0};
if(process.env.GFIELD_LAST4_SKIP_PDF){
  const saved=path.join(output,'last4-parent-report-browser-results.json');
  if(fs.existsSync(saved))evidence.pdfs=JSON.parse(fs.readFileSync(saved,'utf8')).pdfs||[];
}
async function check(label,fn){try{const detail=await fn();evidence.cases.push({label,pass:true,detail});console.log('PASS '+label+' '+JSON.stringify(detail||{}));}catch(e){evidence.failures.push({label,message:e.message,stack:e.stack});evidence.cases.push({label,pass:false});console.error('FAIL '+label+' '+e.stack);}}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.GFIELD_LAST4_PUBLIC_BASE_URL||'http://127.0.0.1:'+server.address().port;
  evidence.testBaseUrl=base;
  evidence.sourceMode=process.env.GFIELD_LAST4_PUBLIC_BASE_URL?'public-static-with-synthetic-records':'local-static-with-synthetic-records';
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
  async function open(round=4,set='last',attempt=1){
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
      practiceIds:[...document.querySelectorAll('#last4PriorityProblems .last3-practice-question')].map(x=>x.dataset.itemId),
      practiceLocation:document.querySelector('#last4PriorityProblems')?.parentElement?.id||'',
      practiceHeading:document.querySelector('#last4PriorityProblems > h3')?.textContent||'',
      studyRows:[...document.querySelectorAll('#curriculumConnection tbody tr')].map(row=>({no:Number(row.dataset.curriculumNo),books:row.querySelectorAll('.curriculum-books li').length,points:row.querySelectorAll('.curriculum-points li').length,text:row.textContent})),
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
  function genericExpected(v){const expected=v.ctx.miss.slice();for(const x of v.ctx.wrongList)if(!expected.includes(x.no))expected.push(x.no);return expected.slice(0,3);}

  try{
    await check('Last4 priority list, study plan, wrong table and taxonomy stay aligned',async()=>{
      const cases=[];
      for(const wrong of [[],[12],[12,28],[1,2,5,8,12,15,19,23,26,28,30]]){
        records=[row('last4',makeOx(wrong))];await open();const v=await view();
        assertPriority(v,genericExpected(v));
        assert.equal(v.ctx.items.length,30);assert.equal(v.ctx.items[25].type,approved.items.find(x=>x.sourceNo===26).detailType);
        assert.ok(v.ctx.items.every(x=>x.subarea&&x.taxonomyReviewStatus==='verified-source-bound'));
        if(wrong.length)await page.waitForFunction(expected=>document.querySelectorAll('#last4PriorityProblems .last3-practice-question').length===expected,Math.min(3,wrong.length)*3);
        const ready=await view();
        assert.deepEqual(ready.practiceIds,ready.priority.flatMap(no=>[1,2,3].map(variant=>'last4-q'+String(no).padStart(2,'0')+'-v'+variant)));
        assert.equal(ready.practiceLocation,'report-plan','the nine questions belong to this week’s priority diagnosis');
        if(wrong.length)assert.match(ready.practiceHeading,new RegExp('총 '+Math.min(3,wrong.length)*3+'문제'));
        assert.equal(ready.studyRows.length,wrong.length);
        assert.ok(ready.studyRows.every(x=>x.books>0&&x.points>0&&!/확인 중/.test(x.text)),'every wrong item has a real learning location and a source-specific point');
        assert.ok(v.resources.some(x=>x.includes('final-summary-practice-print.js')));
        assert.ok(v.resources.some(x=>x.includes('final-diagnostic-comment.js')));
        assert.ok(!v.resources.some(x=>x.includes('final3-detailed-data.js')));
        const links=await page.locator('[data-qr-url]').evaluateAll(nodes=>nodes.map(x=>x.dataset.qrUrl));
        const practice=links.filter(x=>new URL(x).searchParams.get('next')?.includes('bank/'));
        if(wrong.length){
          assert.ok(practice.length);for(const link of practice){const url=new URL(new URL(link).searchParams.get('next'),'https://hs.gfieldacademy.net/');assert.equal(url.searchParams.get('bank'),'last4');assert.equal(url.searchParams.get('source'),'last|4');}
        }else assert.equal(practice.length,0);
        if(wrong.length===1){
          const singlePrint=await page.evaluate(async()=>{
            const prep=await window.__qaSimilarController.prepareAndPrint(),doc=prep.frame.contentDocument;
            const result={ids:JSON.parse(doc.body.dataset.practicePromptFingerprints||'[]').map(x=>x.id),answers:JSON.parse(doc.body.dataset.practiceAnswerFingerprints||'[]').map(x=>x.id),view:new URL(doc.body.dataset.practiceBankUrl,location.href).searchParams.get('view')};
            prep.cleanup();return result;
          });
          const expected=[1,2,3].map(variant=>'last4-q12-v'+variant);
          assert.deepEqual(singlePrint.ids,expected);assert.deepEqual(singlePrint.answers,expected);assert.equal(singlePrint.view,'grouped');
        }
        cases.push({wrong:wrong.length,priority:v.priority,qr:practice.length,visibleProblems:ready.practiceIds.length,studyRows:ready.studyRows.length});
      }
      records=[row('last4',makeOx(Array.from({length:30},(_,index)=>index+1)))];await open();
      const all=await view();
      assert.equal(all.studyRows.length,30);
      assert.ok(all.studyRows.every(x=>x.books>0&&x.points>0&&!/확인 중/.test(x.text)),'all 30 Last4 source types need linked learning locations and points');
      assert.match(all.studyRows.find(x=>x.no===3).text,/높이/);
      assert.match(all.studyRows.find(x=>x.no===26).text,/풀/);
      await page.waitForFunction(()=>document.querySelectorAll('#last4PriorityProblems .last3-practice-question').length===9);
      const preview=await page.locator('#last4PriorityProblems .last3-practice-question').evaluateAll(cards=>cards.map(card=>({id:card.dataset.itemId,prompt:card.querySelector('.last3-practice-prompt').textContent,answerVisible:!!card.querySelector('.ans,.solution'),imageBroken:[...card.querySelectorAll('img')].some(img=>img.complete&&img.naturalWidth===0)})));
      assert.equal(preview.length,9);
      for(const item of preview){assert.equal(item.prompt,approved.items.find(row=>row.id===item.id).text);assert.equal(item.answerVisible,false);assert.equal(item.imageBroken,false);}
      await page.locator('#last4PriorityProblems').screenshot({path:path.join(output,'last4-priority-problems-1280.png')});
      await page.setViewportSize({width:390,height:844});
      await page.locator('#last4PriorityProblems').screenshot({path:path.join(output,'last4-priority-problems-390.png')});
      await page.setViewportSize({width:1280,height:900});
      await page.screenshot({path:path.join(output,'last4-report-1280.png'),fullPage:true});
      await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(output,'last4-report-390.png'),fullPage:true});await page.setViewportSize({width:1280,height:900});
      return cases;
    });
    await check('Last4 summary print embeds the same approved variants and answers',async()=>{
      records=[row('last4',makeOx([12,15,28]))];await open();
      try{
        await page.waitForFunction(()=>document.querySelectorAll('#last4PriorityProblems .last3-practice-question').length===9,undefined,{timeout:45000});
      }catch(error){
        const state=await page.evaluate(()=>({summary:document.querySelector('#report-summary')?.innerText,practice:document.querySelector('#last4PriorityProblems')?.innerText,priority:window.__qaParentVM?.priorityItems?.map(x=>x.no),resources:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/last4|practice|bank/.test(x))}));
        throw new Error(error.message+'; state='+JSON.stringify(state));
      }
      const screen=await page.locator('#last4PriorityProblems').evaluate(host=>({ids:[...host.querySelectorAll('.last3-practice-question')].map(x=>x.dataset.itemId),given:host.querySelectorAll('.last3-practice-given').length,figures:host.querySelectorAll('.last3-practice-figure').length,drawing:host.querySelectorAll('.last3-practice-draw').length}));
      assert.equal(screen.given,0);assert.equal(screen.figures,9);assert.equal(screen.drawing,0);
      const prepared=await page.evaluate(async()=>{
        const prep=await window.__qaSimilarController.prepareAndPrint().catch(error=>{throw new Error((error.code||error.name)+': '+error.message);}),doc=prep.frame.contentDocument;
        window.__qaPrepared=prep;
        return {metrics:prep.metrics,practice:doc.querySelectorAll('.gfield-summary-practice-page').length,priority:window.__qaParentVM.priorityItems.map(x=>x.no),text:doc.body.innerText,frames:prep.frame.isConnected,
          printIds:JSON.parse(doc.body.dataset.practicePromptFingerprints||'[]').map(x=>x.id),answerIds:JSON.parse(doc.body.dataset.practiceAnswerFingerprints||'[]').map(x=>x.id),bankUrl:doc.body.dataset.practiceBankUrl};
      });
      assert.equal(prepared.frames,true);assert.ok(prepared.practice>0);
      assert.equal(prepared.metrics.practiceQuestions,9);assert.equal(prepared.metrics.practiceAnswers,9);assert.deepEqual(prepared.metrics.practiceSourceNos,prepared.priority);
      assert.deepEqual(screen.ids,prepared.metrics.practiceSourceNos.flatMap(no=>[1,2,3].map(variant=>'last4-q'+String(no).padStart(2,'0')+'-v'+variant)));
      const mixedIds=[1,2,3].flatMap(variant=>prepared.priority.map(no=>'last4-q'+String(no).padStart(2,'0')+'-v'+variant));
      assert.deepEqual(prepared.printIds,mixedIds,'printed questions interleave the three priority types');
      assert.deepEqual(prepared.answerIds,mixedIds,'printed answers follow the same numbers');
      assert.equal(new URL(prepared.bankUrl,'https://hs.gfieldacademy.net/').searchParams.get('view'),'mixed');
      assert.doesNotMatch(prepared.text,/파이널 3회|last2-q|final3-q/);
      if(process.env.GFIELD_LAST4_EXPORT_PDF==='1'){
        const html=await page.evaluate(()=>{
          const copy=window.__qaPrepared.frame.contentDocument.documentElement.cloneNode(true);
          copy.querySelectorAll('script').forEach(x=>x.remove());const base=document.createElement('base');base.href=new URL('/',location.href).href;copy.querySelector('head').prepend(base);
          return '<!doctype html>'+copy.outerHTML;
        });
        const exportPage=await context.newPage();
        try{
          await exportPage.goto(base+(process.env.GFIELD_LAST4_PUBLIC_BASE_URL?'/final.html':'/qa-last4-print-blank'));await exportPage.setContent(html,{waitUntil:'load'});
          try{await exportPage.waitForFunction(()=>[...document.images].every(x=>x.complete&&x.naturalWidth),undefined,{timeout:15000});}
          catch(error){const broken=await exportPage.evaluate(()=>[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>({src:x.src,complete:x.complete,naturalWidth:x.naturalWidth})));throw new Error(error.message+'; brokenImages='+JSON.stringify(broken));}
          await exportPage.evaluate(()=>document.fonts.ready);
          await exportPage.emulateMedia({media:'print'});const file=path.join(output,'최종4회_합성학생_진단과복습.pdf');
          await exportPage.pdf({path:file,format:'A4',preferCSSPageSize:true,printBackground:true});evidence.pdfs.push(file);
        }finally{await exportPage.close();}
      }
      await page.evaluate(()=>window.__qaPrepared.cleanup());
      return {priority:prepared.priority,questions:9,answers:9,practicePages:prepared.practice,printIds:prepared.printIds};
    });
    await check('Last4 personal mock generator uses actual Last4 correct or wrong item scopes',async()=>{
      records=[row('last4',makeOx([1,12,15,18,19,24,26,28,30]))];
      const cases=[];
      for(const scope of ['all','wrong','correct']){
        await page.goto(base+'/bank/personal-mock.html?scope='+scope+'&count=30');
        await page.waitForFunction(()=>!document.querySelector('#pmPrint').disabled);
        await page.emulateMedia({media:'print'});
        const state=await page.evaluate(()=>({status:document.querySelector('#pmStatus').innerText,ids:[...document.querySelectorAll('.pm-q')].map(x=>x.dataset.itemId),broken:[...document.images].filter(x=>!x.complete||!x.naturalWidth).length,problems:[...document.querySelectorAll('.pm-q')].filter(x=>x.scrollHeight>x.clientHeight+2||[...x.querySelectorAll('p,img,.pm-given,.pm-answerline')].some(n=>n.getBoundingClientRect().bottom>x.getBoundingClientRect().bottom+2)).map(x=>x.dataset.itemId)}));
        await page.emulateMedia({media:'screen'});
        assert.ok(state.ids.length>0);assert.equal(state.broken,0);assert.ok(state.ids.every(x=>x.startsWith('last4-q')));assert.deepEqual(state.problems,[]);
        for(const id of state.ids){const no=Number(id.match(/q(\d+)/)[1]);if(scope==='wrong')assert.ok([1,12,15,18,19,24,26,28,30].includes(no));if(scope==='correct')assert.ok(![1,12,15,18,19,24,26,28,30].includes(no));}
        // The 30-question preset preserves the 12/10/8 point-band quotas:
        // these wrong types provide 6 low + 9 middle + 8 high = 23 items.
        if(scope==='wrong')assert.match(state.status,/23문항 확보.*7문항 부족/);
        await page.screenshot({path:path.join(output,'last4-generator-'+scope+'.png'),fullPage:true});
        cases.push({scope,count:state.ids.length,status:state.status});
      }
      return cases;
    });
    await check('Source catalog exposes all 30 Last4 types through exact fixed-bank links',async()=>{
      await page.goto(base+'/bank/catalog.html');await page.waitForFunction(()=>!!window.__BANK_CATALOG_QA__?.unified);
      await page.selectOption('#source-filter','last');await page.selectOption('#round-filter','last|4');
      const state=await page.evaluate(()=>{
        const q=window.__BANK_CATALOG_QA__,rows=q.unified.items.filter(x=>x.sourceRef.set==='last'&&Number(x.sourceRef.round)===4);
        const ids=[...new Set([...document.querySelectorAll('a[href*="bank=last4"]')].flatMap(a=>(new URL(a.href).searchParams.get('gens')||'').split(',')))];
        return {count:rows.length,ready:rows.filter(x=>x.generator?.studentWrongPracticeReady).length,ids,type26:rows.find(x=>Number(x.sourceRef.no)===26).detailType};
      });
      assert.equal(state.count,30);assert.equal(state.ready,30);assert.equal(state.ids.length,30);assert.ok(state.ids.every(x=>/^last4-q\d{2}$/.test(x)));assert.equal(state.type26,approved.items.find(x=>x.sourceNo===26).detailType);
      return {sourceQuestions:30,approvedLinks:30,type26:state.type26};
    });
    await check('No production writes or browser errors',async()=>{assert.deepEqual(evidence.writes,[]);assert.deepEqual(evidence.browserErrors,[]);return {writes:0,errors:0};});
  }finally{
    fs.writeFileSync(path.join(output,'last4-report-results.json'),JSON.stringify(evidence,null,2));
    await browser.close();await new Promise(r=>server.close(r));
  }
  if(evidence.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
