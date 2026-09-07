'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js'),root=path.resolve(__dirname,'..');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'supabase/functions/hs-final-population/baseline.private.json'),'utf8'));
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 try{
  let offline=true,teacher=false,comment='',version=null,savedRead=false,repeatResults=false;const requests=[],resultWrites=[],externalWrites=[],errors=[];
  const resultOx=Array.from({length:30},(_,i)=>i===23?'X':'O').join('');
  const attemptOxs=[resultOx,'X'+'O'.repeat(29),'O'.repeat(30)];
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(()=>{
   const session={access_token:'qa-only-token',refresh_token:'qa-only-refresh',expires_at:Math.floor(Date.now()/1000)+3600,login_name:'docssam'};
   localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify(session));localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify(session));
  });
  await context.route(/^https?:\/\//,async route=>{const req=route.request(),url=new URL(req.url());
   if(url.hostname==='127.0.0.1'){
    if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
    return route.continue();
   }
   if(url.pathname.endsWith('/hs-final-population')){
    const body=req.postDataJSON();requests.push(body);assert.equal(req.headers().authorization,'Bearer qa-only-token','real hs-auth sends stored token');
    if(offline&&!(savedRead&&body.action))return route.fulfill({status:503,json:{error:'OFFLINE'}});
    if(body.action==='read-report'||body.action==='record-report')return route.fulfill({json:{canEdit:teacher,comment,commentUpdatedAt:version,snapshot:savedRead?core.createResponse(baseline,[95.8]):null,resultOx:savedRead?resultOx:null}});
    if(body.action==='save-comment'){comment=body.comment;version='2026-09-06T00:00:00.000Z';return route.fulfill({json:{comment,updatedAt:version}});}
    if(body.action==='apply-percentiles')return route.fulfill({json:{applied:true,incomplete:false}});
    return route.fulfill({json:core.createResponse(baseline,body.scores)});
   }
   if(url.pathname==='/rest/v1/mock_results'&&savedRead){if(!['GET','HEAD'].includes(req.method()))resultWrites.push(req.postDataJSON());return route.fulfill({json:(repeatResults?attemptOxs:[resultOx]).map((ox,i)=>({student:'docssam',round:i?'final1@'+(i+1):'final1',ox,score:core.scoreOf(ox),wrong:[...ox].filter(v=>v==='X').length,source:i?'practice-admin':'admin'}))});}
   if(!['GET','HEAD'].includes(req.method()))externalWrites.push(url.pathname);
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const address=`http://127.0.0.1:${server.address().port}/final.html?round=1&name=docssam&go=answer&preview=1`;
  async function grade(url=address){await page.goto(url);await page.locator('#agrid').waitFor();for(let n=1;n<=30;n++)if(n!==24)await page.locator('.abtn').nth(n-1).click();await page.locator('#btnGrade').click();await page.locator('.report-item-section').waitFor();}
  await grade();
  assert.equal(await page.locator('.report-docssam-note').count(),0,'sample preview hides the entire comment section');
  assert.ok(!requests.some(r=>r.action),'sample preview never reads or writes student comments/snapshots');
  assert.equal(await page.evaluate(()=>typeof GFIELD_AUTH.functionCall),'function','auth module actually loaded; not injected');
  assert.equal(await page.locator('#detailWrap td.rt .bar').count(),30,'offline still shows all fixed rates');
  assert.match(await page.locator('.report-expected-grade').innerText(),/경시/);
  assert.match(await page.locator('.cut-reference').innerText(),/92\.9%/);
  assert.match(await page.locator('#detailWrap').innerText(),/★ 꼭 다시 맞히기/);
  assert.equal(await page.evaluate(()=>document.querySelector('.report-tier-section').nextElementSibling.className),'report-item-section');
  const text=await page.locator('.final-report-package').innerText();assert.deepEqual(text.match(/.{0,30}(?:원본 통계|로그인과 연결|점수만으로 원인|원문|출처·표본|응시 인원|null%|NaN).{0,60}/g),null);
  const rateText=await page.locator('#detailWrap td.rt').allTextContents();
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.GFIELD_REPORT_UI_DIR){fs.mkdirSync(process.env.GFIELD_REPORT_UI_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GFIELD_REPORT_UI_DIR,'report-mobile.png')});}
  offline=false;await page.setViewportSize({width:1280,height:900});await grade();assert.deepEqual(await page.locator('#detailWrap td.rt').allTextContents(),rateText,'online and offline rates are identical');
  teacher=true;
  await page.evaluate(async()=>{await GFIELD_FINAL_REPORT_STATE.load('docssam',1,'O'.repeat(30),'admin',false,false);const host=document.createElement('div');host.id='qa-note-host';host.className='final-report-package';host.innerHTML=GFIELD_FINAL_REPORT_STATE.render();document.body.appendChild(host);GFIELD_FINAL_REPORT_STATE.wire(host);});
  await page.locator('#docssam-comment').fill('조건을 잘 표시했어요. <img src=x onerror=alert(1)>\n다음에는 계산을 한 번 더 확인해 봅시다.');await page.locator('#docssam-comment-save').click();await page.locator('#docssam-comment-status').filter({hasText:'저장했습니다.'}).waitFor();assert.equal(await page.locator('#qa-note-host img').count(),0);
  await page.locator('#docssam-comment').fill('조건을 잘 표시했어요.\n다음에는 계산을 한 번 더 확인해 봅시다.');await page.locator('#docssam-comment-save').click();await page.waitForFunction(()=>document.querySelector('#docssam-comment-status').textContent==='저장했습니다.');
  teacher=false;
  await page.evaluate(async()=>{await GFIELD_FINAL_REPORT_STATE.load('docssam',1,'O'.repeat(30),'student',false,false);document.querySelector('#qa-note-host').innerHTML=GFIELD_FINAL_REPORT_STATE.render();});
  assert.equal(await page.locator('#docssam-comment-save').count(),0,'student cannot edit');assert.match(await page.locator('#qa-note-host .docssam-saved-comment').innerText(),/조건을 잘 표시/);
  await page.evaluate(()=>{const note=document.querySelector('#qa-note-host .report-docssam-note');document.querySelector('.doc .report-docssam-note')?.remove();document.querySelector('.report-screen-header').after(note);document.querySelector('#qa-note-host').remove();});
  if(process.env.GFIELD_REPORT_UI_DIR){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.GFIELD_REPORT_UI_DIR,'report-desktop.png')});await page.pdf({path:path.join(process.env.GFIELD_REPORT_UI_DIR,'report-review.pdf'),format:'A4',printBackground:true});}
  assert.ok(requests.some(r=>r.action==='save-comment'));
  savedRead=true;offline=true;teacher=true;
  const reportRequestsStart=requests.length;
  await page.goto(address.replace('go=answer&preview=1','go=report&entry=teacher'));await page.locator('.report-item-section').waitFor();
  assert.match(await page.locator('.report-screen-header').innerText(),/석차 백분율/,'persisted snapshot works if live lookup unavailable');
  assert.match(await page.locator('.docssam-saved-comment').innerText(),/조건을 잘 표시/);
  assert.equal(await page.locator('#detailWrap td.rt .bar').count(),30);
  assert.equal(await page.locator('#docssam-comment-save').count(),1,'saved student report has the teacher editor');
  assert.ok(!(await page.locator('.banner').allTextContents()).some(t=>t.includes('읽기 전용')),'score-only read mode does not imply comments are read-only');
  await page.locator('#docssam-comment').fill('학생 성적표에서 직접 저장한 학습 조언입니다.');
  await page.locator('#docssam-comment-save').click();
  await page.waitForFunction(()=>document.querySelector('#docssam-comment-status').textContent==='저장했습니다.');
  const reportActions=requests.slice(reportRequestsStart).filter(r=>r.action);
  assert.deepEqual(reportActions.map(r=>r.action),['read-report','save-comment'],'opening report and saving comment never writes a score or percentile snapshot');
  assert.equal(reportActions[1].exam,'final1');assert.equal(reportActions[1].student,'docssam');
  assert.ok(!('ox' in reportActions[1])&&!('score' in reportActions[1]));
  assert.equal(resultWrites.length,0,'comment save leaves original grades untouched');
  const practiceRequestsStart=requests.length;
  await grade(address.replace('preview=1','entry=teacher'));
  assert.match(await page.locator('.banner.practice').innerText(),/2회차/);
  assert.equal(await page.locator('#docssam-comment-save').count(),1,'teacher can comment on a real practice result');
  assert.match(await page.locator('.docssam-saved-comment').innerText(),/직접 저장한 학습 조언/);
  assert.deepEqual(requests.slice(practiceRequestsStart).filter(r=>r.action).map(r=>r.action),['read-report'],'practice only reads the existing per-round comment, not percentile writes');
  assert.equal(resultWrites.length,1);assert.equal(resultWrites[0].round,'final1@2','practice grade never overwrites first grade');
  repeatResults=true;offline=false;
  const attemptsStart=requests.length;
  await page.goto(address.replace('go=answer&preview=1','go=report&entry=teacher'));await page.locator('.attempt-progress').waitFor();
  const scores=attemptOxs.map(ox=>core.scoreOf(ox));
  const attemptLookups=requests.slice(attemptsStart).filter(r=>!r.action);
  assert.equal(attemptLookups.length,2);
  attemptLookups.forEach(r=>scores.forEach(score=>assert.ok(r.scores.includes(score),'every saved attempt score is requested')));
  const expectedAttempts=core.createResponse(baseline,scores).percentiles;
  const attemptRows=page.locator('.attempt-progress > table tr');
  for(let i=0;i<3;i++)assert.equal(await attemptRows.nth(i+1).locator('td').nth(3).innerText(),expectedAttempts[String(Math.round(scores[i]*10))]+'%');
  assert.doesNotMatch(await page.locator('.attempt-progress').innerText(),/null%|NaN|undefined/);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'three-attempt report fits mobile');
  await page.setViewportSize({width:1280,height:900});
  offline=true;
  await page.goto(address.replace('go=answer&preview=1','go=report&entry=teacher'));await page.locator('.attempt-progress').waitFor();
  assert.equal(await page.locator('.attempt-progress [aria-label="백분율 자료 없음"]').count(),2,'first-score-only fallback does not invent practice percentiles');
  assert.doesNotMatch(await page.locator('.attempt-progress').innerText(),/null%|NaN|undefined/);
  assert.equal(await page.locator('#detailWrap td.rt .bar').count(),30,'attempt lookup failure never removes fixed item rates');
  assert.equal(resultWrites.length,1,'viewing attempt history never updates grades');
  const finalHTML=fs.readFileSync(path.join(root,'final.html'),'utf8');
  assert.match(finalHTML,/!!saved&&attemptNo===1,preview\)/,'practice attempts are not treated as sample previews');
  const adminHTML=fs.readFileSync(path.join(root,'admin.html'),'utf8');
  assert.match(adminHTML,/<h3[^>]*>⑩ 모의고사 결과<\/h3>\s*<button[^>]*id="apply-final-percentiles"/);
  const adminJS=fs.readFileSync(path.join(root,'admin-mock-v2.js'),'utf8');
  const action=adminJS.slice(adminJS.indexOf('  window.applyFinalPercentiles='),adminJS.indexOf('  async function resetSlot('));
  await page.setContent('<h3>모의고사 결과</h3>'+adminHTML.match(/<button[^>]*id="apply-final-percentiles"[^>]*>[^<]*<\/button>/)[0]+'<span id="mock-status"></span>');
  await page.evaluate(code=>{window.renderMock=()=>{};(0,eval)(code);},action);
  const appliedBefore=requests.filter(r=>r.action==='apply-percentiles').length;
  page.once('dialog',d=>d.dismiss());await page.locator('#apply-final-percentiles').click();assert.equal(requests.filter(r=>r.action==='apply-percentiles').length,appliedBefore);
  offline=false;page.once('dialog',d=>d.accept());await page.locator('#apply-final-percentiles').click();await page.locator('#mock-status').filter({hasText:'백분율을 저장했습니다'}).waitFor();
  assert.equal(requests.filter(r=>r.action==='apply-percentiles').length,appliedBefore+1);
  offline=true;savedRead=false;page.once('dialog',d=>d.accept());await page.locator('#apply-final-percentiles').click();await page.locator('#mock-status').filter({hasText:'저장하지 못했습니다'}).waitFor();
  assert.equal(await page.locator('#apply-final-percentiles').isEnabled(),true);
  assert.equal(externalWrites.length,0);assert.deepEqual(errors,[]);
  console.log('PASS real auth loader/transport, offline fixed rates/cuts/grade/priority, item order, identical online rates, teacher comment save/student read/XSS, mobile, zero external writes');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
