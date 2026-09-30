'use strict';

// Synthetic, private-data-free browser and print gate for the Signature report.
// learner-fit: learner_stage=초등 2학년 선발 대비; language=short action phrases;
// representations=score cards and seven-day list; prerequisites=read a question;
// reasoning-load=one exam action at a time; response-mode=teacher-authored note.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.GFIELD_QA_OUTPUT_DIR||'';
const student='QA 검증학생';
const records=[
  {student,round:'original1',ox:'O'.repeat(30),score:100,wrong:0,source:'admin'},
  {student,round:'original2',ox:'O'.repeat(29)+'X',score:95.8,wrong:1,source:'admin'},
  {student,round:'original2@2',ox:'X'.repeat(30),score:0,wrong:30,source:'practice-admin'},
];
const makeSession=role=>({access_token:'qa-'+role,refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'qa-'+role,app_metadata:{role}}});
const comments={original1:'',original2:''};
const writes=[];
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
  const filename=path.resolve(ROOT,'.'+pathname);
  if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}
  const ext=path.extname(filename);
  const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf'}[ext]||'application/octet-stream';
  response.writeHead(200,{'content-type':mime+'; charset=utf-8','cache-control':'no-store'});
  fs.createReadStream(filename).pipe(response);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    async function contextFor(role,width){
      const context=await browser.newContext({viewport:{width,height:900}});
      const session=makeSession(role);
      await context.addInitScript(({role,session,student})=>{
        localStorage.setItem(role==='admin'?'gfield_hs_admin_session_v1':'gfield_hs_student_session_v1',JSON.stringify(session));
        localStorage.setItem('gfield_student',student);
      },{role,session,student});
      await context.route('**/data.js*',route=>{
        const source=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
        route.fulfill({status:200,contentType:'text/javascript',body:source+'\nwindow.GFIELD_DATA.students.push('+JSON.stringify(student)+');window.GFIELD_DATA.archiveProductAccess["mock-signature-1"].push('+JSON.stringify(student)+');window.GFIELD_DATA.archiveProductAccess["mock-signature-2"].push('+JSON.stringify(student)+');'});
      });
      await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
      await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
      await context.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/woff2',body:''}));
      await context.route('https://fgahqumaldheqettmvqg.supabase.co/**',async route=>{
        const request=route.request(),url=request.url();
        let body={};try{body=request.postDataJSON()||{};}catch{}
        if(url.includes('/auth/v1/user'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session.user)});
        if(url.includes('/rest/v1/mock_results')){
          if(request.method()!=='GET'){
            writes.push({kind:'grade',method:request.method(),body});
            if(request.method()==='POST'&&body.round==='original2@3')records.push(body);
          }
          return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(records)});
        }
        if(url.includes('/rest/v1/weak_types'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
        if(url.includes('/rest/v1/hs_final_report_comments'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{comment:comments[url.includes('original1')?'original1':'original2'],updated_at:'qa-version'}])});
        if(url.includes('/functions/v1/hs-final-population')){
          if(body.action==='read-report')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({canEdit:role==='admin',comment:comments[body.exam]||'',commentUpdatedAt:comments[body.exam]?'qa-version':null,snapshot:null,resultOx:null})});
          if(body.action==='save-comment'){
            assert.equal(role,'admin');assert.ok(body.exam==='original1'||body.exam==='original2');
            writes.push({kind:'comment',exam:body.exam});comments[body.exam]=body.comment;
            return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({comment:comments[body.exam],updatedAt:'qa-version'})});
          }
        }
        return route.abort();
      });
      return context;
    }
    const base='http://127.0.0.1:'+server.address().port+'/final.html?set=original&round=2&go=report&attempt=1&name='+encodeURIComponent(student);
    const unsigned=await browser.newContext();
    await unsigned.addInitScript(name=>localStorage.setItem('gfield_student',name),student);
    await unsigned.route('**/data.js*',route=>{
      const source=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
      route.fulfill({status:200,contentType:'text/javascript',body:source+'\nwindow.GFIELD_DATA.students.push('+JSON.stringify(student)+');window.GFIELD_DATA.archiveProductAccess["mock-signature-2"].push('+JSON.stringify(student)+');'});
    });
    await unsigned.route('https://fgahqumaldheqettmvqg.supabase.co/**',async route=>{
      const request=route.request(),url=request.url();
      if(url.includes('/auth/v1/token'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(makeSession('student'))});
      if(url.includes('/auth/v1/user'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(makeSession('student').user)});
      if(url.includes('/rest/v1/mock_results'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(records)});
      if(url.includes('/rest/v1/weak_types'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
      if(url.includes('/rest/v1/hs_final_report_comments'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
      if(url.includes('/functions/v1/hs-final-population'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({canEdit:false,comment:'',commentUpdatedAt:null,snapshot:null,resultOx:null})});
      return route.abort();
    });
    const unsignedPage=await unsigned.newPage();
    await unsignedPage.goto(base,{waitUntil:'domcontentloaded'});
    await unsignedPage.locator('.original-summary').waitFor();
    assert.equal(await unsignedPage.locator('#signatureApprovalCode').count(),0,'이름 입장 후 추가 승인번호를 묻지 않음');
    assert.match(await unsignedPage.locator('.cumulative-grid').innerText(),/1회 실제 점수[\s\S]*100점[\s\S]*2회 실제 점수[\s\S]*95\.8점/,'이름 입장 후 저장된 진단지 확인');
    await unsigned.close();
    const teacher=await contextFor('admin',1280),page=await teacher.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await page.locator('.original-summary .cumulative-grid').waitFor();
    assert.equal(await page.locator('.original-summary .signature-distribution').count(),1,'컷과 학생 위치를 성적 아래 표시');
    assert.match(await page.locator('.signature-distribution').innerText(),/실제 95\.8점[\s\S]*실전 예상/);
    assert.match(await page.locator('.signature-distribution svg').getAttribute('aria-labelledby'),/signatureCurveTitle signatureCurveDesc/);
    assert.equal(await page.locator('.week-must-do-items [data-week-no]').count(),0,'4.2점 단독 미정답은 필수에서 제외');
    assert.equal(await page.locator('#signatureMustStudy [data-signature-study-id]').count(),0,'4.2점 유사문제를 필수에 자동 배정하지 않음');
    assert.equal(await page.locator('[data-original-summary-print]').isDisabled(),false,'문제 로딩 후 요약 인쇄 가능');
    const threeTypes=await page.evaluate(async()=>{
      const root=document.createElement('div');root.innerHTML='<div class="signature-study-list"></div>';document.body.appendChild(root);
      const items=window.GFIELD_MOCK_ORIGINAL.rounds['2'].items;
      await window.GFIELD_SIGNATURE_MUST_STUDY.mount(root,{round:2,student:'QA 검증학생',ready:[1,2,3].map(no=>({no,type:items[no-1].type,point:items[no-1].pts,generatorId:'original2-q'+String(no).padStart(2,'0')})),preferred:[3,2,1],hasWrong:true});
      const ids=Array.from(root.querySelectorAll('[data-signature-study-id]'),node=>node.getAttribute('data-signature-study-id'));
      root.remove();return ids;
    });
    assert.deepEqual(threeTypes,['original2-q03-v1','original2-q02-v1','original2-q01-v1'],'세 유형이 있으면 유형마다 승인된 한 문제씩 우선 추천');
    assert.doesNotMatch(await page.locator('.week-plan').innerText(),/원문 30번/);
    assert.match(await page.locator('.original-summary').innerText(),/시험 한 달 전 · 첫 주 복습[\s\S]*이후 3주 연결/);
    assert.equal(await page.locator('.month-plan li').count(),4);
    assert.match(await page.locator('.cumulative-grid').innerText(),/1회 실제 점수[\s\S]*100점[\s\S]*2회 실제 점수[\s\S]*95\.8점[\s\S]*누적 실제 점수[\s\S]*97\.9점/);
    assert.match(await page.locator('.original-summary table').first().innerText(),/실제 점수[\s\S]*실전 예상 점수[\s\S]*예상 반/);
    assert.match(await page.locator('.signature-pair-insights').innerText(),/이전에 맞혔지만 이번에 미정답[\s\S]*미로의 시야 대응/);
    assert.equal(await page.locator('.signature-first-five').count(),0,'legacy O/X cannot prove blank count or missing pencil marks');
    assert.match(await page.locator('.exam-skill-tips').innerText(),/시작 5분간 전체 문항을 훑고/);
    assert.equal(await page.locator('#wrongPractice .wp-item').count(),1,'2회 오답 30번은 검수된 고정 유사문항으로 연결됨');
    assert.equal(await page.locator('#wrongPractice .wp-item').getAttribute('data-wp-gen'),'original2-q30');
    assert.match(await page.locator('#signatureAllPractice').innerText(),/2회 전체 유형/);
    assert.match(await page.locator('#originalComparison').innerText(),/대영역[\s\S]*도형[\s\S]*81\.1%[\s\S]*배점대/);
    assert.equal(await page.locator('#originalComparison .original-pair-table [data-original-pair]').count(),10);
    assert.match(await page.locator('[data-original-pair="30-30"]').innerText(),/30번 O → 30번 X[\s\S]*이번 회차 미정답/);
    assert.equal(await page.locator('#originalItemDetail tbody tr').count(),30);
    assert.equal(await page.locator('#originalItemDetail .original-status').last().innerText(),'미정답');
    assert.equal(await page.locator('#originalTeacherComment').count(),1);
    assert.match(await page.locator('.exam-skill-tips').innerText(),/타이머는 속도 확인용/);
    assert.equal(await page.locator('[data-docssam-field]').count(),9);
    assert.equal(await page.locator('[data-signature-profile]').count(),11);
    await page.locator('[data-signature-profile="calculation-check"]').check();
    await page.locator('[name="signature-profile-priority"][value="calculation-check"]').check();
    await page.locator('[data-signature-profile-evidence="calculation-check"]').fill('4번: 식은 맞고 계산에서 오류를 확인함.');
    await page.locator('[data-docssam-field="strength"]').fill('문제 조건을 끝까지 읽고 식으로 옮긴다.');
    await page.locator('[data-docssam-field="recommendation"]').fill('막히면 번호를 표시하고 다음 문제 뒤 다시 돌아온다.');
    await page.locator('[data-docssam-field="examStrategy"]').fill('막힌 문항은 표시하고 다른 문항 뒤에 돌아왔다.');
    await page.locator('[data-docssam-field="timerUse"]').fill('타이머는 속도 확인용으로만 활용한다.');
    await page.locator('[data-docssam-field="paperEvidence"]').fill('시험지에 1+1=2를 적었다.');
    await page.locator('#docssam-comment-save').click();
    await page.locator('#docssam-comment-status').getByText('저장했습니다.').waitFor();
    assert.match(await page.locator('.docssam-summary').innerText(),/시험 중 행동·운영[\s\S]*막힌 문항은 표시/);
    assert.doesNotMatch(await page.locator('.docssam-summary').innerText(),/타이머는 속도 확인용/);
    assert.match(await page.locator('.report-docssam-note').innerText(),/타이머 활용[\s\S]*타이머는 속도 확인용/);
    assert.match(await page.locator('.original-summary .docssam-summary').innerText(),/시험지에서 확인한 풀이[\s\S]*1\+1=2/,'시험지 근거가 성적 아래 요약에 표시');
    assert.match(await page.locator('.original-summary .signature-profile-results').innerText(),/식은 잘 쓰지만 계산 점검 필요[\s\S]*4번/);
    assert.match(await page.locator('[data-signature-action-plan]').innerText(),/교사 관찰 · 별도 지도[\s\S]*4번[\s\S]*다음 응시에서 확인/,'saved teacher observation refreshes without altering must-study choices');
    assert.match(await page.locator('.original-summary .signature-profile-results').innerText(),/이번 주 우선 · 식은 잘 쓰지만/);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.docssam-summary').waitFor();
    assert.match(await page.locator('[data-docssam-field="strength"]').inputValue(),/문제 조건을 끝까지/);
    assert.match(await page.locator('.report-docssam-note').innerText(),/시험지에서 확인한 풀이[\s\S]*1\+1=2/);
    assert.equal(await page.locator('[data-signature-profile="calculation-check"]').isChecked(),true);
    assert.equal(await page.locator('[name="signature-profile-priority"][value="calculation-check"]').isChecked(),true);
    if(OUT){fs.mkdirSync(OUT,{recursive:true});await page.screenshot({path:path.join(OUT,'signature-round2-desktop.png'),fullPage:true});}
    await page.goto(base.replace('round=2','round=1')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await page.locator('[data-docssam-field="strength"]').waitFor();
    assert.equal(await page.locator('#originalComparison').count(),0,'round 1 stays a separate single-round report');
    assert.match(await page.locator('#signatureAllPractice').innerText(),/1회 전체 유형/);
    assert.match(await page.locator('.week-must-do').innerText(),/특정 번호를 필수로 배정하지 않습니다/);
    assert.equal(await page.locator('#signatureMustStudy [data-signature-study-id]').count(),0,'미정답이 없는 회차에 문제를 임의 배정하지 않음');
    assert.equal(await page.locator('[data-docssam-field="strength"]').inputValue(),'','1회 코멘트는 2회 코멘트와 분리된다');
    await page.locator('[data-docssam-field="strength"]').fill('1회에서 확인한 장점');
    await page.locator('#docssam-comment-save').click();
    await page.locator('#docssam-comment-status').getByText('저장했습니다.').waitFor();
    assert.match(await page.locator('.docssam-summary').innerText(),/1회에서 확인한 장점/);
    const byeonPage=await teacher.newPage();
    function correctOx(numbers){return Array.from({length:30},(_,i)=>numbers.includes(i+1)?'O':'X').join('');}
    function rawScore(ox){return Math.round([...ox].reduce((sum,value,i)=>sum+(value==='O'?(i<12?2.7:i<22?3.4:4.2):0),0)*10)/10;}
    const byeonFirst=correctOx([5,7,8,9,10,11,12,14,16,17,20,23,26]);
    const byeonSecond=correctOx([1,2,4,6,7,8,13,14,23,25,29]);
    const byeonRecords=[{student,round:'original1',ox:byeonFirst,score:rawScore(byeonFirst),wrong:17,source:'admin'},
      {student,round:'original2',ox:byeonSecond,score:rawScore(byeonSecond),wrong:19,source:'admin'}];
    await byeonPage.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(byeonRecords)}));
    await byeonPage.goto(base+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await byeonPage.locator('.week-must-do-items [data-week-no]').first().waitFor();
    assert.deepEqual(await byeonPage.locator('.week-must-do-items [data-week-no]').evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-week-no')))),[3,5,12],'변서진 2회 정오 사례는 저배점 기본 유형을 우선 선정');
    const selectedTypes=await byeonPage.evaluate(()=>[3,5,12].map(no=>window.GFIELD_MOCK_ORIGINAL.rounds['2'].items[no-1].type));
    assert.deepEqual(await byeonPage.locator('.week-must-do-items [data-week-type]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-week-type'))),selectedTypes);
    const weekText=await byeonPage.locator('.week-plan').innerText();
    for(const no of [3,5,12])assert.match(weekText,new RegExp('원문 '+no+'번\\('+selectedTypes[[3,5,12].indexOf(no)]+'\\)'));
    assert.doesNotMatch(weekText,/원문 (24|28|30)번/);
    await byeonPage.locator('#signatureMustStudy [data-signature-study-id]').nth(2).waitFor();
    assert.deepEqual(await byeonPage.locator('#signatureMustStudy [data-signature-study-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-signature-study-id'))),['original2-q03-v1','original2-q05-v1','original2-q12-v1']);
    const studyHeads=await byeonPage.locator('#signatureMustStudy h4').allInnerTexts();
    for(let i=0;i<3;i++)assert.ok(studyHeads[i].includes('원문 '+[3,5,12][i]+'번 유형 · '+selectedTypes[i]));
    const studyLink=new URL(await byeonPage.locator('#signatureMustStudy .signature-study-link').getAttribute('href'),base);
    assert.equal(studyLink.searchParams.get('sourceNos'),'3,5,12');
    await byeonPage.emulateMedia({media:'print'});
    assert.equal(await byeonPage.locator('#signatureMustStudy [data-signature-study-id]').count(),3,'인쇄 화면도 같은 추천 세 문항');
    const byeonPdf=await byeonPage.pdf({format:'A4',printBackground:true});
    assert.ok(byeonPdf.length>10000);
    await byeonPage.evaluate(()=>document.body.classList.add('print-original-summary'));
    assert.equal(await byeonPage.locator('#signatureMustStudy [data-signature-study-id]').count(),3,'요약 인쇄본도 같은 추천 세 문항');
    const byeonSummaryPdf=await byeonPage.pdf({format:'A4',printBackground:true});
    assert.ok(byeonSummaryPdf.length>10000);
    fs.writeFileSync(path.join(os.tmpdir(),'gfield-signature-study-priority-qa.pdf'),byeonSummaryPdf);
    await byeonPage.close();
    assert.deepEqual(errors,[]);
    await teacher.close();

    const mobile=await contextFor('student',390),phone=await mobile.newPage(),mobileErrors=[];
    phone.on('pageerror',e=>mobileErrors.push(e.message));
    await phone.goto(base,{waitUntil:'domcontentloaded'});
    await phone.locator('.docssam-summary').waitFor();
    await phone.locator('#signatureMustStudy').waitFor();
    assert.equal(await phone.locator('[data-docssam-field]').count(),0,'student cannot edit teacher comment');
    assert.equal(await phone.locator('[data-signature-profile]').count(),0,'student cannot edit learning profile');
    assert.match(await phone.locator('.original-summary .signature-profile-results').innerText(),/식은 잘 쓰지만 계산 점검 필요/);
    assert.match(await phone.locator('.report-docssam-note').innerText(),/풀이 습관|장점/);
    assert.equal(await phone.locator('#originalComparison .original-pair-table [data-original-pair]').count(),10);
    assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px report does not overflow horizontally');
    if(OUT){
      fs.mkdirSync(OUT,{recursive:true});
      await phone.locator('.signature-distribution').screenshot({path:path.join(OUT,'signature-round2-distribution-mobile.png')});
      await phone.locator('.original-summary').screenshot({path:path.join(OUT,'signature-round2-summary-mobile.png')});
      await phone.screenshot({path:path.join(OUT,'signature-round2-mobile.png'),fullPage:true});
      const detailedPdf=await phone.pdf({format:'A4',printBackground:true});
      assert.ok(detailedPdf.length>10000,'detailed A4 PDF is non-empty');
      fs.writeFileSync(path.join(OUT,'signature-round2-detailed.pdf'),detailedPdf);
      await phone.evaluate(()=>document.body.classList.add('print-original-summary'));
      const pdf=await phone.pdf({format:'A4',printBackground:true});
      assert.ok(pdf.length>10000,'summary A4 PDF is non-empty');
      fs.writeFileSync(path.join(OUT,'signature-round2-summary.pdf'),pdf);
      await phone.evaluate(()=>document.body.classList.remove('print-original-summary'));
    }
    assert.deepEqual(mobileErrors,[]);
    assert.deepEqual(writes,[{kind:'comment',exam:'original2'},{kind:'comment',exam:'original1'}],'viewing and printing do not write grades');
    await mobile.close();
    const secondRecord=records.splice(1,1)[0];
    const singleContext=await contextFor('student',390),singlePage=await singleContext.newPage();
    await singlePage.goto(base.replace('round=2','round=1'),{waitUntil:'domcontentloaded'});
    await singlePage.locator('.original-summary').waitFor();
    assert.match(await singlePage.locator('.original-summary table').first().innerText(),/실제 점수[\s\S]*실전 예상 점수[\s\S]*예상 반[\s\S]*100점[\s\S]*90점[\s\S]*경시 가능 예상/,'한 회차 응시도 실제·예상·반을 표시');
    assert.equal(await singlePage.locator('.cumulative-grid').count(),0,'한 회차 응시는 누적을 만들지 않음');
    records.push({student,round:'final1',ox:'X'.repeat(30),score:0,wrong:30,source:'admin'});
    await singlePage.reload({waitUntil:'domcontentloaded'});
    await singlePage.locator('.original-summary').waitFor();
    assert.match(await singlePage.locator('.original-summary table').first().innerText(),/100점[\s\S]*81점[\s\S]*경시 가능 예상/,'파이널이 낮으면 예상치만 보수적으로 조정');
    assert.ok(await singlePage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px 단독 응시 성적표 가로 넘침 없음');
    if(OUT)await singlePage.screenshot({path:path.join(OUT,'signature-single-round-mobile.png'),fullPage:true});
    await singleContext.close();
    records.pop();records.splice(1,0,secondRecord);
    const entryContext=await contextFor('admin',390),entry=await entryContext.newPage();
    await entry.goto(base.replace('go=report','go=answer')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await entry.locator('#signatureStateGrid button').first().waitFor();
    assert.equal(await entry.locator('#signatureStateGrid button').count(),30);
    assert.match(await entry.locator('#signatureCount').innerText(),/맞은 문제 0개 · 오답 30개/);
    entry.once('dialog',dialog=>dialog.dismiss());
    await entry.locator('#btnGrade').click();
    assert.equal(writes.filter(x=>x.kind==='grade').length,0,'zero-score confirmation can be cancelled');
    await entry.locator('#signatureStateGrid button').nth(2).focus();
    await entry.keyboard.press('Enter');
    assert.equal(await entry.locator('#signatureStateGrid button').nth(2).getAttribute('aria-pressed'),'true','keyboard checks a correct answer');
    await entry.evaluate(()=>document.querySelectorAll('#signatureStateGrid button').forEach((button,i)=>{if(i>=3)button.click();}));
    assert.equal(await entry.locator('#signatureStateGrid button[aria-pressed="true"]').count(),28);
    assert.match(await entry.locator('#signatureCount').innerText(),/맞은 문제 28개 · 오답 2개/);
    if(OUT)await entry.screenshot({path:path.join(OUT,'signature-answer-mobile.png'),fullPage:true});
    await entry.locator('#btnGrade').click();
    await entry.locator('.original-summary').waitFor();
    const gradeWrites=writes.filter(x=>x.kind==='grade');
    assert.equal(gradeWrites.length,1);
    assert.equal(gradeWrites[0].body.answer_states,'XX'+'O'.repeat(28));
    assert.equal(gradeWrites[0].body.ox,'XX'+'O'.repeat(28));
    assert.match(await entry.locator('.original-summary').innerText(),/틀림 2개 · 미응답 0개/);
    assert.deepEqual(await entry.locator('.week-must-do-items [data-week-no]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-week-no'))),['2','1']);
    assert.match(await entry.locator('.week-must-do').innerText(),/원문 2번 · 같은 전체 길이[\s\S]*오답[\s\S]*원문 1번 · 연속 확장과 공유 꼭짓점[\s\S]*오답/);
    assert.match(await entry.locator('.week-must-do').innerText(),/2\.7·3\.4점의 기본 미정답 유형/);
    assert.match(await entry.locator('.week-must-do').innerText(),/미응답·오답 구분이 없는 기록은 원인을 추정하지 않습니다/);
    assert.ok(await entry.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px answer and report do not overflow');
    await entry.goto(base.replace('attempt=1','attempt=3')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await entry.locator('.original-summary').waitFor();
    assert.match(await entry.locator('.original-summary').innerText(),/틀림 2개 · 미응답 0개/,'unchecked questions remain wrong after reload');
    assert.match(await entry.locator('.original-report').innerText(),/2번[\s\S]*오답/,'detail table keeps unchecked question wrong');
    Object.assign(records[0],{ox:'XX'+'O'.repeat(28),score:94.6,wrong:2});
    await entry.goto(base.replace('round=2','round=1')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await entry.locator('.week-must-do-items [data-week-no]').first().waitFor();
    assert.deepEqual(await entry.locator('.week-must-do-items [data-week-no]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-week-no'))),['1']);
    assert.match(await entry.locator('.week-must-do').innerText(),/2\.7·3\.4점의 기본 미정답 유형/,'round 1 answer-only record still receives targeted practice advice');
    assert.match(await entry.locator('.week-must-do').innerText(),/미응답·오답 구분이 없는 기록은 원인을 추정하지 않습니다/,'recommendation does not assert unobserved paper habits');
    await entryContext.close();
    console.log('PASS Signature 1/2/cumulative report, separate Docssam comments/save/reload/student view, 390px, A4 summary PDF, grade-write zero, learner-fit 초등 2학년 선발 대비');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
