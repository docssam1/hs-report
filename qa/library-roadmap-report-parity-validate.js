'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='연결검수학생';
const baseline={schemaVersion:1,exam:'final1',scope:'provided-original-records',approved:true,version:'final1-'+'a'.repeat(64),rows:[{id:'one',ox:'O'.repeat(30),score:100},{id:'two',ox:'X'.repeat(30),score:0}]};
const ox='O'.repeat(20)+'X'.repeat(10),score=core.scoreOf(ox);
const rows=['final1','final2','last1','last2'].map(round=>({student,round,ox,score,wrong:10,source:'admin',updated_at:'2026-09-01T00:00:00Z'}));
rows.push({student,round:'final1@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin',updated_at:'2026-09-02T00:00:00Z'});
rows.push({student,round:'last1@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice',updated_at:'2026-09-02T00:00:00Z'});
const originalRows=JSON.stringify(rows);
const dataSource=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(student)},online='교체검수학생';d.students.push(n,online);d.studentTypes[n]='resident';d.studentTypes[online]='online';d.attendance[n]=d.nodes.filter(x=>/파이널|최종/.test(x.title||'')).map(x=>x.id);d.attendance[online]=d.attendance[n].slice();d.archiveAccess['파이널 모의고사']=[n,online];d.archiveAccess['최종 모의고사']=[n,online];d.archiveAccess['추가 모의고사']=[n,online];d.archiveProductAccess['mock-final-5']=[n,online];})();`;
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port,origin=new URL(base).origin;
 const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900}}),writes=[],actions=[];
 let empty=false;
 await context.addInitScript(n=>{localStorage.setItem('gfield_student',n);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:n}));},student);
 await context.route(/^https?:\/\//,route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin===origin){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:dataSource});return route.continue();}
  if(u.pathname==='/rest/v1/mock_results'){
   if(req.method()!=='GET')writes.push({path:u.pathname,method:req.method()});
   return route.fulfill({json:empty?[]:rows});
  }
  if(u.pathname.endsWith('/hs-final-population')){
   const b=req.postDataJSON();if(b.action){actions.push(b.action);if(b.action!=='read-report')writes.push(b);return route.fulfill({json:{canEdit:false,comment:'조건을 표시하고 풀이를 확인해 보세요.',snapshot:null,resultOx:ox}});}
   return route.fulfill({json:core.createResponse(baseline,b.scores)});
  }
  if(!['GET','HEAD','OPTIONS'].includes(req.method())&&!u.pathname.endsWith('/access_log'))writes.push({path:u.pathname,method:req.method()});
  return route.fulfill({json:[]});
 });
 const page=await context.newPage();
 try{
  await page.goto(base+'/index.html');if(await page.locator('#skipBtn').isVisible())await page.locator('#skipBtn').click();
  await page.locator('#dashboard:not(.hidden)').waitFor();await page.evaluate(()=>{nav('roadmap');renderArchive();});
  const catalog=await page.evaluate(()=>D.books.filter(b=>/파이널|최종/.test(b.title||'')).map(b=>({title:b.title,folder:b.folder,links:b.links})));
  let covered=0;
  for(const b of catalog){
   const n=Number((b.title.match(/(\d+)\s*회/)||[])[1]);if(!n)continue;
   let series=b.folder==='파이널 모의고사'?'final':b.folder==='최종 모의고사'?'last':n===5?'final':'last';
   const round=b.folder==='추가 모의고사'&&n>=6?n-5:n;
   const reports=(b.links||[]).filter(l=>{const u=new URL(l.url,base);return u.pathname.endsWith('/last1-result.html')||u.searchParams.get('go')==='report';});
   assert.equal(reports.length,1,b.title+' exactly one report action');
   const expected=await page.evaluate(({series,round,student})=>GFIELD_FINAL_LAST_ROUTES.withStudent(GFIELD_FINAL_LAST_ROUTES.route(series,round,'report'),student),{series,round,student});
   assert.equal(new URL(reports[0].url,base).href,new URL(expected,base).href,b.title+' canonical personal report');
   assert.ok(!(b.links||[]).some(l=>/go=answer|last1-entry/.test(l.url)),b.title+' resident not prompted to reenter scores');covered++;
  }
  assert.equal(covered,13,'Final1-4, Last1-4, additional Final5 and four Last aliases');
  async function openRoadmap(pattern){
   await page.evaluate(()=>nav('roadmap'));
   const card=page.locator('#timeline .node').filter({has:page.locator('h3',{hasText:pattern})}).first();
   const promise=page.waitForEvent('popup');await card.locator('.last1-node-actions button').filter({hasText:/성적|진단/}).last().click();
   const popup=await promise;await popup.waitForLoadState('domcontentloaded');return popup;
  }
  async function openLibrary(title){
   await page.evaluate(title=>{const b=D.books.find(b=>b.title===title);openBook(b);},title);
   const link=page.locator('#bookviewer a.bv-act').filter({hasText:/성적표|진단 분석지|성적 확인/}).first();
   const promise=page.waitForEvent('popup');await link.click();const popup=await promise;await popup.waitForLoadState('domcontentloaded');return popup;
  }
  const snapshots=[];
  for(const [pattern,title,selector] of [[/파이널.*모의고사\s*1\s*회/,'파이널 실전 모의고사 1회','.final-report-package'],[/파이널.*모의고사\s*2\s*회/,'파이널 실전 모의고사 2회','.final-report-package'],[/최종.*모의고사\s*1\s*회/,'최종 실전 모의고사 1회','#res:not(.hide)'],[/최종.*모의고사\s*2\s*회/,'최종 실전 모의고사 2회','#res:not(.hide)']]){
   const rp=await openRoadmap(pattern);await rp.locator(selector).waitFor({timeout:15000});const url=rp.url(),body=await rp.locator(selector).innerText();
   assert.match(body,/누적|통합 석차/,'existing cumulative results visible');assert.ok(!body.includes('null%')&&!body.includes('NaN'));
   const summary=(await rp.locator('.report-screen-header,.cut-reference,.data-proof').allTextContents()).join(' ');
   assert.doesNotMatch(summary,/\d[\d,]*\s*명|응시\s*인원/,'report summaries do not disclose participant counts (problem conditions may contain people)');
   if(title==='파이널 실전 모의고사 1회')assert.equal(await rp.locator('.final1-detailed-card.is-ready').count(),30,'approved Final1 detailed solutions kept');
   if(title==='파이널 실전 모의고사 2회'){
    const count=await rp.evaluate(()=>GF_TEST.computeCumulativeConsidered(2,{final1:{ox:'O'.repeat(20)+'X'.repeat(10)},'final1@2':{ox:'O'.repeat(30)}},1,'final2',('O'.repeat(20)+'X'.repeat(10)).split(''),true).length);
    // The current production model has a verified Final1 reference only.
    // Do not turn missing Final2 evidence into an approved cohort in a routing repair.
    assert.equal(count,1,'only verified first records enter cumulative; retries and unverified references stay excluded');
   }
   const lp=await openLibrary(title);await lp.locator(selector).waitFor({timeout:15000});assert.equal(lp.url(),url,'both entry points use exactly same report');
   assert.equal(await lp.locator(selector).innerText(),body,'same score, percentile, diagnosis, cumulative results and solutions');
   snapshots.push({title,url:new URL(url).pathname});
   await lp.setViewportSize({width:390,height:844});assert.ok(await lp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile report fits');
   if(process.env.GFIELD_QA_ARTIFACT_DIR){fs.mkdirSync(process.env.GFIELD_QA_ARTIFACT_DIR,{recursive:true});await lp.screenshot({path:path.join(process.env.GFIELD_QA_ARTIFACT_DIR,'same-'+(title.startsWith('파이널')?'final':'last')+title.match(/(\d+)회/)[1]+'-report.png')});}
   await rp.close();await lp.close();await page.evaluate(()=>closeBook());
  }
  empty=true;const missing=await openRoadmap(/파이널.*모의고사\s*1\s*회/);await missing.getByText('파이널 1회 성적표가 아직 등록되지 않았습니다.',{exact:true}).waitFor();await missing.close();
  await page.evaluate(()=>logout());await page.locator('#name-input').fill('교체검수학생');await page.locator('#login .enter').click();await page.locator('#dashboard:not(.hidden)').waitFor();
  await page.evaluate(()=>{renderArchive();renderArchive();});
  const switched=await page.evaluate(()=>D.books.filter(b=>/파이널|최종/.test(b.title||'')).map(b=>({title:b.title,links:b.links})));
  for(const b of switched){if(!/\d+\s*회/.test(b.title))continue;
   const reports=b.links.filter(l=>/go=report|last1-result/.test(l.url));assert.equal(reports.length,1,'rerender does not duplicate reports');
   assert.equal(new URL(reports[0].url,base).searchParams.get('name'),'교체검수학생','logout/login replaces old student name');
   assert.equal(b.links.filter(l=>/go=answer|last1-entry/.test(l.url)).length,1,'online input stays separate from report');
  }
  assert.equal(JSON.stringify(rows),originalRows,'first records and retries unchanged');assert.deepEqual(writes,[],'no result, percentile, comment or other writes');
  assert.ok(actions.every(a=>a==='read-report'));
  console.log(JSON.stringify({pass:true,catalogReportLinks:covered,reportParity:snapshots,final1Detailed:30,missingNotZero:true,productionWrites:0,knownLimitation:'Final2-4 population evidence is absent in the current public model; this test does not certify complete cumulative coverage'}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
