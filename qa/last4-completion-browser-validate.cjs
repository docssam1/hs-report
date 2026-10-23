'use strict';
require('./last4-completion-validate.cjs');
// Local approved-content connection QA; no real accounts, results, or network writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'E:/Codex/tooling/elementary-playwright/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_LAST4_CONNECTION_QA_DIR||path.join(root,'.private-work/last4-reuse-20261022/qa-integration');
const approved=JSON.parse(fs.readFileSync(path.join(root,'bank/data/last4-reviewed.json'),'utf8'));
const bank=require('../bank/personal-mock.js'),registry=require('../bank/bank-registry.js');
for(let no=1;no<=30;no++){
  const link=registry.sourceItemGenerator('last|4|'+no);
  assert.equal(link.generatorId,'last4-q'+String(no).padStart(2,'0'));assert.equal(link.studentWrongPracticeReady,true);
}
const att={attendance:{A:['oct-5'],B:['oct-26']},archiveAccess:{'최종 모의고사':['C']}};
assert.equal(bank.isAllowed('last4','A',att),false);assert.equal(bank.isAllowed('last4','B',att),true);assert.equal(bank.isAllowed('last4','C',att),true);
assert.equal(bank.isAllowed('last1','B',att),false);
for(const [scope,ox,n] of [['all','O'.repeat(30),30],['wrong','X'.repeat(5)+'O'.repeat(25),10],['correct','O'.repeat(5)+'X'.repeat(25),10]]){
  const p=bank.buildPool([{key:'last4',score:{ox}}],{last4:approved},scope,scope==='all'?'all':'2.7',n);
  assert.equal(p.questions.length,n);assert.ok(p.questions.every(x=>x.code==='last4'));
  if(scope!=='all')assert.ok(p.questions.every(x=>x.item.sourceNo<=5));
}
const results={cases:[],screens:[],pdfs:[],errors:[],externalRequests:[],writes:[]};
const server=http.createServer((req,res)=>{
  if(req.method!=='GET'){results.writes.push(req.method);res.writeHead(405);return res.end();}
  const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
async function measure(page){return page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#f1Pages .qcard')];
  return {cards:cards.length,ids:cards.map(c=>c.querySelector('[data-item-id]').dataset.itemId),pages:document.querySelectorAll('.question-page').length,
    problems:cards.flatMap(c=>{
      const r=c.getBoundingClientRect();if(c.scrollHeight>c.clientHeight+2)return [{id:c.querySelector('[data-item-id]').dataset.itemId,part:'card',h:c.clientHeight,scroll:c.scrollHeight}];return [...c.querySelectorAll('.qtext,.qmeta,.qfigure img,.answerline')].filter(e=>{const x=e.getBoundingClientRect();return x.height>0&&(x.bottom>r.bottom+2||x.right>r.right+2||e.scrollHeight>e.clientHeight+2);}).map(e=>({id:c.querySelector('[data-item-id]').dataset.itemId,part:e.className,w:e.clientWidth,h:e.clientHeight}));
    }),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
    imgs:cards.filter(c=>c.querySelector('img')).map(c=>{const i=c.querySelector('img'),r=i.getBoundingClientRect();return {id:c.querySelector('[data-item-id]').dataset.itemId,w:r.width,h:r.height};}),
    back:document.querySelector('.f1-back').getAttribute('href'),bank:document.querySelector('#final1Worksheet').dataset.bankCode};
});}
(async()=>{
  fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.GFIELD_LAST4_QA_BASE||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());if(url.origin===base)return route.continue();
      if(req.method()==='GET'&&['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))return route.continue();
      results.externalRequests.push({method:req.method(),host:url.hostname});
      if(!['GET','HEAD','OPTIONS'].includes(req.method()))results.writes.push(req.method()+' '+url.pathname);
      return route.fulfill({contentType:/css/.test(url.pathname)?'text/css':'application/json',body:/css/.test(url.pathname)?'':'[]'});
    });
    const page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message));
    for(const layout of ['editorial','compact']){
      await page.goto(base+'/bank/index.html?bank=last4&layout='+layout+'&printMode=both&view=grouped');
      await page.waitForFunction(()=>document.querySelector('#f1Status')?.textContent.includes('90문항')&&!document.querySelector('#btnPrint').disabled,{},{timeout:30000});
      await page.evaluate(()=>document.fonts.ready);const m=await measure(page);
      assert.equal(m.cards,90);assert.equal(new Set(m.ids).size,90);assert.equal(m.bank,'last4');assert.equal(m.broken,0);
      results.cases.push({layout,...m});
      await page.emulateMedia({media:'print'});
      const printMetrics=await measure(page);assert.deepEqual(printMetrics.problems,[],'A4 clipping');assert.equal(printMetrics.broken,0);
      results.cases.push({layout,media:'print',...printMetrics});
      await page.emulateMedia({media:'screen'});
      for(const no of [1,12,15,18,19,24,26,28,30]){
        const card=page.locator('.qcard').filter({has:page.locator('[data-item-id="last4-q'+String(no).padStart(2,'0')+'-v1"]')});
        const p=path.join(out,layout+'-q'+no+'.png');await card.screenshot({path:p});results.screens.push(p);
      }
      if(process.env.GFIELD_LAST4_EXPORT_PDF==='1'){
        await page.selectOption('#printMode','questions');await page.waitForFunction(()=>!document.querySelector('#btnPrint').disabled&&document.querySelectorAll('.qcard').length===90);
        await page.emulateMedia({media:'print'});
        const p=path.join(out,'최종4회_유사문제90_'+layout+'.pdf');await page.pdf({path:p,format:'A4',preferCSSPageSize:true,printBackground:true});results.pdfs.push(p);
        await page.emulateMedia({media:'screen'});
      }
      await page.setViewportSize({width:390,height:844});
      assert.equal((await measure(page)).cards,90);await page.screenshot({path:path.join(out,layout+'-390.png')});await page.setViewportSize({width:1280,height:900});
    }
    await page.goto(base+'/bank/index.html?practice=wrong&source=last%7C4&gens=last4-q01,last4-q06,last4-q30&view=grouped&printMode=both');
    await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===9&&!document.querySelector('#btnPrint').disabled);
    const selected=await measure(page);assert.match(selected.back,/set=last&round=4/);assert.ok(selected.ids.every(id=>/^last4-q(?:01|06|30)-v[123]$/.test(id)));results.cases.push({selected:true,...selected});
    // Verify all four modes, exact answer coverage, duplex boundary and full export.
    await page.goto(base+'/bank/index.html?bank=last4&printMode=both&view=grouped');
    await page.waitForFunction(()=>document.querySelectorAll('.solution-card').length===90&&!document.querySelector('#btnPrint').disabled);
    assert.equal(await page.locator('#pageLayout').inputValue(),'compact');
    const full=await page.evaluate(()=>{const pages=[...document.querySelectorAll('#f1Pages>.page')],answers=[...document.querySelectorAll('.solution-card')];return {questionIds:[...document.querySelectorAll('.qcard [data-item-id]')].map(x=>x.dataset.itemId),answerIds:answers.map(x=>x.dataset.answerId),answerStart:pages.findIndex(p=>p.classList.contains('answer-page'))+1,answerOverflow:answers.filter(x=>x.scrollHeight>x.clientHeight+2).map(x=>x.dataset.answerId),rows:[...document.querySelectorAll('.qpage')].map(x=>Number(x.dataset.reportRows))};});
    assert.deepEqual(full.questionIds,full.answerIds);assert.equal(full.answerStart%2,1);assert.deepEqual(full.answerOverflow,[]);assert.ok(full.rows.every(x=>x===3));results.cases.push({full});
    if(process.env.GFIELD_LAST4_EXPORT_PDF==='1'){await page.emulateMedia({media:'print'});const p=path.join(out,'최종4회_90문제와풀이.pdf');await page.pdf({path:p,format:'A4',preferCSSPageSize:true,printBackground:true});results.pdfs.push(p);await page.emulateMedia({media:'screen'});}
    for(const mode of ['answers','quick','questions']){await page.selectOption('#printMode',mode);await page.waitForFunction(()=>!document.querySelector('#btnPrint').disabled);const count=mode==='questions'?await page.locator('.qcard').count():await page.locator('[data-answer-id]').count();assert.equal(count,90);}
    assert.equal(results.errors.length,0);assert.equal(results.writes.length,0);
    assert.ok(results.cases.every(x=>!x.problems||x.problems.length===0),'worksheet clipped elements: '+JSON.stringify(results.cases.flatMap(x=>x.problems||[])));
    console.log('PASS approved Last4 registry, permissions, generator scopes, 90-item desktop/mobile/editorial/compact and 9-item exact-source worksheet');
  }finally{fs.writeFileSync(path.join(out,'connection-results.json'),JSON.stringify(results,null,2));await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
