const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
require('./email-login-test-stub'); // QA 전용: 학부모 이메일 인증 단계를 인증된 브라우저로 취급
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const mockBank=require('../bank/personal-mock.js');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  fs.readFile(file,(error,data)=>{if(error){response.writeHead(404);response.end();return;}response.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});response.end(data);});
});
function record(student,round,ox){return {student,round,ox,score:Math.round([...ox].reduce((sum,v,index)=>sum+(v==='O'?(index<12?2.7:index<22?3.4:4.2):0),0)*10)/10,wrong:[...ox].filter(v=>v==='X').length,source:'teacher',updated_at:'2026-09-30T00:00:00Z'};}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.GFIELD_QA_BROWSER?{executablePath:process.env.GFIELD_QA_BROWSER}:{})});
  try{
    const approvedOnly=await browser.newPage({viewport:{width:1440,height:900}});
    await approvedOnly.addInitScript(()=>localStorage.setItem('gfield_student','박서진'));
    await approvedOnly.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await approvedOnly.goto(base+'/bank/personal-mock.html?source=applied1');
    const onlineStudent=await approvedOnly.evaluate(()=>{
      const name=GFIELD_DATA.students.find(student=>GFIELD_DATA.studentTypes?.[student]==='online');
      return name&&GFIELD_BANK_ACCESS.allowed({role:'student',student:name,active:true})?name:'';
    });
    assert.ok(onlineStudent,'온라인 회원도 공통 문제은행 접근 자격');
    const onlinePage=await browser.newPage();
    await onlinePage.addInitScript(name=>localStorage.setItem('gfield_student',name),onlineStudent);
    await onlinePage.goto(base+'/bank/personal-mock.html');
    await onlinePage.locator('#pmTitle').waitFor({state:'visible',timeout:30000});
    assert.equal(await onlinePage.locator('#pmTitle').inputValue(),'지필드 맞춤 모의고사','온라인 회원 제목 입력 공통 제공');
    await onlinePage.close();
    assert.ok(await approvedOnly.locator('html').evaluate(el=>getComputedStyle(el).fontFamily.includes('GF Print Sans')),'생성기 화면 Pretendard 글꼴');
    await approvedOnly.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000}).catch(async error=>{console.error('APPLIED STATUS',await approvedOnly.locator('#pmStatus').innerText());throw error;});
    assert.equal(await approvedOnly.locator('#pmSourceList input[value="applied1"]').isChecked(),true);
    assert.equal(await approvedOnly.locator('#pmSourceList input:checked').count(),1,'URL로 지정한 회차만 선택');
    assert.ok(await approvedOnly.locator('#pmSourceList input[value="applied1"]').evaluate(input=>{const box=input.closest('label').getBoundingClientRect(),list=input.closest('#pmSourceList').getBoundingClientRect();return box.top>=list.top-1&&box.bottom<=list.bottom+1;}),'지정 회차가 목록 안에 보임');
    assert.equal(await approvedOnly.locator('.pm-q').count(),30,'승인된 회차는 정오답 입력 없이 출제');
    assert.equal(await approvedOnly.locator('.pm-q[data-item-id^="applied1-"]').count(),30);
    await approvedOnly.waitForFunction(()=>!document.getElementById('pmPrint').disabled,{timeout:30000});
    assert.equal(await approvedOnly.locator('#pmPrint').isDisabled(),false);
    assert.equal(await approvedOnly.locator('.pm-score-table td').allTextContents().then(rows=>rows.join(',')),'2.7점,3.4점,4.2점,12,10,8,30');
    assert.match(await approvedOnly.locator('.pm-exam-cover').first().innerText(),/맞춤 모의고사[\s\S]*박서진/);
    assert.match(await approvedOnly.locator('.pm-exam-cover').first().innerText(),/30문항 · 100점/);
    await approvedOnly.locator('#pmTitle').fill('우리 반 도전 모의고사');
    assert.equal(await approvedOnly.locator('.pm-question-page .pm-exam-cover h2').innerText(),'우리 반 도전 모의고사');
    assert.equal(await approvedOnly.locator('.pm-answer-page .pm-exam-cover h2').innerText(),'우리 반 도전 모의고사 · 정답과 풀이');
    assert.equal(await approvedOnly.title(),'우리 반 도전 모의고사 | 지필드 영재교육');
    await approvedOnly.locator('#pmTitle').fill('');
    await approvedOnly.locator('#pmTitle').blur();
    assert.equal(await approvedOnly.locator('#pmTitle').inputValue(),'지필드 맞춤 모의고사');
    const layout=await approvedOnly.evaluate(()=>({filter:document.querySelector('.pm-filter-panel').getBoundingClientRect().x,paper:document.querySelector('.pm-page').getBoundingClientRect().x}));
    assert.ok(layout.filter<layout.paper,'넓은 화면 왼쪽에 필터 배치');
    const firstIds=await approvedOnly.locator('.pm-q').evaluateAll(cards=>cards.map(card=>card.dataset.itemId));
    await approvedOnly.locator('.pm-q .pm-replace').first().click();
    await approvedOnly.locator('#pmStatus').getByText('1번 문제 교체 완료').waitFor();
    const replacedIds=await approvedOnly.locator('.pm-q').evaluateAll(cards=>cards.map(card=>card.dataset.itemId));
    assert.notEqual(replacedIds[0],firstIds[0]);
    assert.deepEqual(replacedIds.slice(1),firstIds.slice(1),'클릭한 한 문항 외에는 보존');
    assert.equal(await approvedOnly.locator('.pm-answer[data-answer-id="'+replacedIds[0]+'"]').count(),1,'교체 문항의 풀이 동시 변경');
    await approvedOnly.locator('#pmFresh').click();
    await approvedOnly.waitForFunction(before=>JSON.stringify([...document.querySelectorAll('.pm-q')].map(card=>card.dataset.itemId))!==before,JSON.stringify(replacedIds));
    assert.equal(await approvedOnly.locator('.pm-q').count(),30,'한 회차에서 다른 검수 변형으로 교체');
    await approvedOnly.locator('#pmSourceList input[value="applied2"]').check();
    await approvedOnly.waitForFunction(()=>document.querySelectorAll('.pm-q[data-item-id^="applied1-"]').length>0&&document.querySelectorAll('.pm-q[data-item-id^="applied2-"]').length>0);
    assert.equal(await approvedOnly.locator('#pmSourceList input:checked').count(),2,'출제 회차 복수 선택');
    await approvedOnly.locator('#pmSourceList input[value="applied2"]').uncheck();
    await approvedOnly.locator('#pmStatus').getByText('30문항 준비 완료').waitFor();
    const scores=[];
    for(const mode of ['easy','normal','hard']){
      await approvedOnly.locator('[data-priority="'+mode+'"]').click();
      await approvedOnly.locator('#pmStatus').getByText(({easy:'쉬운 모의고사',normal:'보통 모의고사',hard:'어려운 모의고사'})[mode]).waitFor();
      scores.push(Number((await approvedOnly.locator('.pm-exam-count').first().innerText()).match(/· ([\d.]+)점/)?.[1]));
    }
    assert.ok(scores[0]<scores[1]&&scores[1]<scores[2],`쉬움·보통·어려움 총점 ${scores.join(',')}`);
    await approvedOnly.locator('[data-priority="balanced"]').click();
    await approvedOnly.locator('[data-page-density="6"]').click();
    await approvedOnly.waitForFunction(()=>document.querySelector('[data-page-density="6"]')?.getAttribute('aria-pressed')==='true');
    await approvedOnly.emulateMedia({media:'print'});
    assert.deepEqual(await approvedOnly.evaluate(()=>[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>card.dataset.itemId||card.dataset.answerId)),[],'6문항 배치 A4 잘림 없음');
    await approvedOnly.emulateMedia({media:'screen'});
    await approvedOnly.locator('[data-page-density="4"]').click();
    assert.ok(await approvedOnly.locator('.pm-q p').first().evaluate(el=>getComputedStyle(el).fontFamily.includes('GF Print Serif')));
    const taxonomyCoverage=await approvedOnly.evaluate(async()=>{
      const result={};
      for(const code of ['final8','last1']){
        const data=await BANK_FIXED.load(code);
        result[code]=data.items.filter(item=>item.variantNo===1).filter(item=>{
          const meta=GFIELD_PERSONAL_MOCK.profileOf(item);
          return meta.area==='미분류'||meta.subarea==='세부 분류 확인'||!meta.type;
        }).map(item=>item.sourceNo);
      }
      return result;
    });
    assert.deepEqual(taxonomyCoverage,{final8:[],last1:[]},'어댑터를 거친 승인 문항의 영역·유형 분류');
    await approvedOnly.emulateMedia({media:'print'});
    const columnPositions=await approvedOnly.locator('.pm-four-grid.pm-question-page').first().locator('.pm-q').evaluateAll(cards=>cards.map(card=>({x:card.getBoundingClientRect().x,y:card.getBoundingClientRect().y})));
    assert.equal(columnPositions.length,4);
    assert.equal(columnPositions[0].x,columnPositions[1].x,'왼쪽에 2문항');
    assert.ok(columnPositions[0].y<columnPositions[1].y);
    assert.equal(columnPositions[2].x,columnPositions[3].x,'오른쪽에 2문항');
    assert.ok(columnPositions[2].x>columnPositions[0].x&&columnPositions[2].y<columnPositions[3].y);
    assert.deepEqual(await approvedOnly.evaluate(()=>[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>({id:card.dataset.itemId||card.dataset.answerId,scroll:card.scrollHeight,client:card.clientHeight,parts:[...card.children].map(el=>({tag:el.tagName,height:Math.round(el.getBoundingClientRect().height)}))}))),[],'활용 1회 A4 잘림 없음');
    const appliedPdf=path.join(os.tmpdir(),'gfield-personal-mock-applied1-qa.pdf');
    await approvedOnly.pdf({path:appliedPdf,format:'A4',printBackground:true,preferCSSPageSize:true});
    assert.ok(fs.statSync(appliedPdf).size>10000);
    await approvedOnly.emulateMedia({media:'screen'});
    await approvedOnly.locator('[data-filter-clear="area"]').click();
    await approvedOnly.locator('#pmAreaList input[value="도형"]').check();
    await approvedOnly.locator('#pmDifficulty').selectOption('low');
    assert.ok(await approvedOnly.locator('#pmTypeList input').count()>0);
    await approvedOnly.locator('#pmTypeList button[data-preview-key]').first().click();
    assert.ok(await approvedOnly.locator('#pmPreview h3').isVisible(),'세부 유형 대표 문항 미리보기');
    assert.equal(await approvedOnly.locator('#pmPreview').getByText(/^답 /).count(),0,'대표 문항에는 답을 표시하지 않음');
    await approvedOnly.locator('#pmTypeList input').first().check();
    await approvedOnly.waitForFunction(()=>document.querySelector('#pmStatus')?.textContent.includes('문항 확보')&&document.querySelector('#pmPrint')?.disabled===false);
    const filtered=await approvedOnly.locator('.pm-q').count();
    assert.ok(filtered>0&&filtered<=9,'한 세부 유형의 검수된 변형만 출제');
    assert.match(await approvedOnly.locator('#pmTypeSummary').innerText(),/선택 1개/);
    await approvedOnly.locator('#pmClearTypes').click();
    await approvedOnly.locator('[data-filter-all="area"]').click();
    await approvedOnly.locator('#pmDifficulty').selectOption('all');
    await approvedOnly.locator('[data-filter-clear="area"]').click();
    await approvedOnly.locator('#pmAreaList input[value="도형"]').check();
    await approvedOnly.locator('#pmAreaList input[value="수와 식"]').check();
    assert.match(await approvedOnly.locator('#pmAreaSummary').innerText(),/^2 \/ /,'대영역 복수 선택');
    await approvedOnly.locator('[data-filter-clear="subarea"]').click();
    await approvedOnly.locator('#pmSubareaList input').first().check();
    await approvedOnly.locator('#pmSubareaList input').nth(1).check();
    assert.match(await approvedOnly.locator('#pmSubareaSummary').innerText(),/^2 \/ /,'소영역 복수 선택');
    await approvedOnly.locator('[data-filter-all="area"]').click();
    await approvedOnly.locator('[data-filter-all="subarea"]').click();
    for(let round=2;round<=9;round++){
      await approvedOnly.locator('[data-filter-clear="source"]').click();
      await approvedOnly.locator('#pmSourceList input[value="applied'+round+'"]').check();
      await approvedOnly.waitForFunction(n=>document.querySelector('#pmStatus')?.textContent.includes('활용 모의고사 '+n+'회')&&document.querySelector('#pmPrint')?.disabled===false,round,{timeout:30000});
      assert.equal(await approvedOnly.locator('.pm-q[data-item-id^="applied'+round+'-"]').count(),30,'활용 '+round+'회 승인 출제');
      assert.equal(await approvedOnly.locator('#pmPrint').isDisabled(),false);
    }
    await approvedOnly.locator('[data-page-density="6"]').click();
    await approvedOnly.locator('.pm-six-grid.pm-question-page').first().waitFor();
    await approvedOnly.emulateMedia({media:'print'});
    assert.ok(await approvedOnly.locator('.pm-six-grid.pm-question-page').count()>0,'짧은 문항은 한 쪽 6문항');
    const sixPositions=await approvedOnly.locator('.pm-six-grid.pm-question-page').first().locator('.pm-q').evaluateAll(cards=>cards.map(card=>({x:card.getBoundingClientRect().x,y:card.getBoundingClientRect().y})));
    assert.ok(sixPositions.length>=5&&sixPositions.length<=6,'6칸에서 긴 문항 앞의 마지막 칸은 비울 수 있음');
    assert.equal(sixPositions[0].x,sixPositions[1].x);
    assert.equal(sixPositions[1].x,sixPositions[2].x);
    assert.ok(sixPositions[0].y<sixPositions[1].y&&sixPositions[1].y<sixPositions[2].y,'왼쪽에 고른 간격의 3문항');
    assert.equal(sixPositions[3].x,sixPositions[4].x);
    if(sixPositions[5])assert.equal(sixPositions[4].x,sixPositions[5].x);
    assert.ok(sixPositions[3].x>sixPositions[0].x&&sixPositions[3].y<sixPositions[4].y&&(!sixPositions[5]||sixPositions[4].y<sixPositions[5].y),'오른쪽에도 고른 간격으로 배치');
    await approvedOnly.emulateMedia({media:'screen'});
    await approvedOnly.locator('[data-page-density="4"]').click();
    await approvedOnly.locator('[data-scope="wrong"]').click();
    await approvedOnly.locator('#pmStatus').getByText('선택한 조건의 검수 유사문제가 없습니다.').waitFor();
    assert.equal(await approvedOnly.locator('#pmPrint').isDisabled(),true);
    await approvedOnly.close();
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',error=>console.error('PAGE ERROR',error.message));
    await page.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await page.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('김서연','original1','O'.repeat(30))])}));
    await page.goto(base+'/bank/personal-mock.html');
    assert.equal(await page.evaluate(()=>typeof GFIELD_MATH_MARKUP.render),'function');
    await page.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await page.locator('[data-band="4.2"]').click();
    await page.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await page.waitForFunction(()=>!document.getElementById('pmPrint').disabled);
    assert.equal(await page.locator('.pm-q').count(),30);
    assert.equal(await page.locator('.pm-answer').count(),30);
    await page.locator('#pmFresh').click();
    await page.locator('#pmStatus').getByText('새 문제 9문항').waitFor({timeout:30000});
    assert.equal(await page.locator('.pm-q').count(),30);
    assert.equal(await page.locator('.pm-q').filter({hasText:'새 문제'}).count(),9);
    assert.equal(await page.locator('.pm-answer').filter({hasText:'자료실 공개 생성형'}).count(),9);
    assert.equal(await page.locator('.pm-q strong').count(),0);
    const freshIds=await page.locator('.pm-q').filter({hasText:'새 문제'}).evaluateAll(cards=>cards.map(card=>card.dataset.itemId));
    await page.locator('#pmFresh').click();
    await page.locator('#pmStatus').getByText('새 문제 9문항').waitFor({timeout:30000});
    const nextFreshIds=await page.locator('.pm-q').filter({hasText:'새 문제'}).evaluateAll(cards=>cards.map(card=>card.dataset.itemId));
    assert.notDeepEqual(nextFreshIds,freshIds,'fresh button must change generated variants');
    await page.emulateMedia({media:'print'});
    const pageOrder=await page.evaluate(()=>({questions:document.querySelectorAll('.pm-question-page').length,blanks:document.querySelectorAll('.pm-duplex-blank').length,firstAnswer:[...document.querySelectorAll('.pm-page')].findIndex(node=>node.classList.contains('pm-answer-page'))+1}));
    assert.equal(pageOrder.firstAnswer%2,1,'the answer section must start on a front-facing odd page');
    assert.equal(pageOrder.blanks,pageOrder.questions%2);
    assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>card.getAttribute('data-item-id')||card.getAttribute('data-answer-id'))),[],'supplemented A4 cards must not clip');
    const supplementPdf=path.join(os.tmpdir(),'gfield-personal-mock-supplement-qa.pdf');
    await page.pdf({path:supplementPdf,format:'A4',printBackground:true,preferCSSPageSize:true});
    assert.ok(fs.statSync(supplementPdf).size>10000);
    await page.emulateMedia({media:'screen'});
    await page.locator('[data-count="20"]').click();
    await page.locator('#pmStatus').getByText('20문항 준비 완료').waitFor({timeout:30000});
    assert.equal(await page.locator('.pm-q').count(),20);
    await page.close();
    const later=await browser.newPage({viewport:{width:1280,height:900}});
    await later.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await later.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([
      record('김서연','final3','O'.repeat(30)),record('김서연','final4','O'.repeat(30))])}));
    await later.goto(base+'/bank/personal-mock.html');
    await later.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await later.locator('#pmFresh').click();
    await later.locator('#pmStatus').getByText(/새 문제 [1-9]/).waitFor({timeout:30000});
    const laterGenerated=await later.locator('.pm-q').filter({hasText:'새 문제'}).evaluateAll(cards=>cards.map(card=>card.dataset.itemId));
    assert.ok(laterGenerated.length>0);
    assert.equal(laterGenerated.filter(id=>/^final[34]-q(?:02|07|09|10)-g\d+$/.test(id)).length,4,JSON.stringify(laterGenerated));
    assert.equal(await later.locator('.pm-q').count(),30);
    await later.close();
    const ready=await browser.newPage({viewport:{width:1440,height:900}});
    await ready.addInitScript(()=>localStorage.setItem('gfield_student','박서진'));
    await ready.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('박서진','original1','O'.repeat(30)),record('박서진','original2','O'.repeat(30))])}));
    await ready.goto(base+'/bank/personal-mock.html');
    await ready.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await ready.locator('[data-band="4.2"]').click();
    await ready.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    assert.equal(await ready.locator('.pm-q').count(),30);
    assert.equal(await ready.locator('.pm-answer').count(),30);
    await ready.locator('#pmPrint').waitFor({state:'visible'});
    await ready.waitForFunction(()=>!document.getElementById('pmPrint').disabled,{timeout:30000}).catch(async error=>{console.error('READY STATUS',await ready.locator('#pmStatus').innerText());throw error;});
    assert.equal(await ready.locator('#pmPrint').isDisabled(),false);
    assert.equal(await ready.locator('.pm-q strong').count(),0);
    assert.ok(await ready.locator('.wm-tile').count()>0);
    await ready.emulateMedia({media:'print'});
    const printLayout=await ready.evaluate(()=>({
      columns:getComputedStyle(document.querySelector('.pm-question-grid')).gridTemplateColumns.split(' ').length,
      clipped:[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>({id:card.getAttribute('data-item-id')||card.getAttribute('data-answer-id'),scroll:card.scrollHeight,client:card.clientHeight}))
    }));
    assert.equal(printLayout.columns,2,'A4 print must use two columns');
    assert.deepEqual(printLayout.clipped,[],'A4 cards must not clip content');
    for(const code of ['original1','original2','final1','final2','final3','final4','final7']){
      const dataset=JSON.parse(fs.readFileSync(path.join(root,'bank/data',code==='final7'?'final7-reviewed.json':code+'-fixed90.json'),'utf8'));
      const paper=mockBank.buildPool([{key:code,score:{ox:'O'.repeat(30)}}],{[code]:dataset},'all','all',30);
      if(!paper.questions.length)continue;
      await ready.locator('#pmPages').evaluate((el,html)=>{el.innerHTML=html;},mockBank.renderPaper(paper,'all','all','테스트'));
      const clipped=await ready.evaluate(()=>[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>({id:card.getAttribute('data-item-id')||card.getAttribute('data-answer-id'),scroll:card.scrollHeight,client:card.clientHeight,parts:[...card.children].map(el=>({tag:el.tagName,height:el.getBoundingClientRect().height,scroll:el.scrollHeight}))})));
      assert.deepEqual(clipped,[],code+' A4 print card clipping');
      await ready.locator('#pmPages').evaluate((el,html)=>{el.innerHTML=html;},mockBank.renderPaper(paper,'all','all','테스트','',6));
      const clippedSix=await ready.evaluate(()=>[...document.querySelectorAll('.pm-q,.pm-answer')].filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>card.getAttribute('data-item-id')||card.getAttribute('data-answer-id')));
      assert.deepEqual(clippedSix,[],code+' A4 6칸 선택 시 잘림');
    }
    for(const code of ['final8','last1','last2','last3','last4','middle7','middle8',...Array.from({length:9},(_,i)=>'applied'+(i+1))]){
      const clipped=await ready.evaluate(async source=>{
        const data=source.startsWith('applied')?await QUESTION_BANK_ADAPTERS.get('gfield-'+source+'-expanded').load():await BANK_FIXED.load(source);
        const paper=GFIELD_PERSONAL_MOCK.buildPool([{key:source,score:{ox:'O'.repeat(30)}}],{[source]:data},'all','all',30);
        const root=document.getElementById('pmPages'),errors=[];
        for(const density of [4,6]){
          root.innerHTML=GFIELD_PERSONAL_MOCK.renderPaper(paper,'all','all','검수','',density);
          await Promise.all([document.fonts.ready,...Array.from(root.querySelectorAll('img')).map(img=>img.decode())]);
          errors.push(...Array.from(root.querySelectorAll('.pm-q,.pm-answer,.pm-page-content')).filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>({density,id:card.dataset.itemId||card.dataset.answerId||card.className,scroll:card.scrollHeight,client:card.clientHeight})));
          errors.push(...Array.from(root.querySelectorAll('.pm-q')).filter(card=>card.getBoundingClientRect().width>card.closest('.pm-question-grid').getBoundingClientRect().width/2+12).map(card=>({density,id:card.dataset.itemId,reason:'질문이 두 칼럼을 차지함'})));
        }
        if(source==='final8'){
          const figures=data.items.filter(item=>item.sourceNo===15);
          if(figures.length!==3||figures.some(item=>item.asset?.src!=='assets/final8/q15-four-stages.svg'))errors.push({reason:'파이널8 15번 네 단계 그림 누락'});
        }
        return errors;
      },code);
      assert.deepEqual(clipped,[],code+' 모의고사 시험지/답안 A4 잘림');
    }
    await ready.emulateMedia({media:'screen'});
    await ready.locator('[data-scope="wrong"]').click();
    await ready.locator('#pmStatus').getByText('선택한 조건의 검수 유사문제가 없습니다.').waitFor();
    assert.equal(await ready.locator('#pmPrint').isDisabled(),true);
    assert.equal(await ready.locator('#pmFresh').isDisabled(),true);
    await ready.locator('[data-scope="correct"]').click();
    await ready.locator('#pmStatus').getByText('30문항 준비 완료').waitFor();
    await ready.waitForFunction(()=>!document.getElementById('pmPrint').disabled);
    assert.equal(await ready.locator('.pm-q').count(),30);
    const wrongByType=await browser.newPage({viewport:{width:1280,height:900}});
    await wrongByType.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await wrongByType.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('김서연','original1','XXXX'+'O'.repeat(26))])}));
    await wrongByType.goto(base+'/bank/personal-mock.html?source=original1&scope=wrong');
    await wrongByType.locator('#pmStatus').getByText('문항 확보').waitFor({timeout:30000});
    assert.equal(await wrongByType.locator('.pm-q').count(),12);
    await wrongByType.locator('#pmDifficulty').selectOption('high');
    await wrongByType.waitForFunction(()=>document.querySelector('#pmTypeSummary')?.textContent.includes('원문'));
    const highRows=await wrongByType.locator('.pm-q').count();
    assert.ok(highRows<=12,'오답과 난이도 조건 교집합');
    assert.ok(await wrongByType.locator('.pm-q').evaluateAll(cards=>cards.every(card=>Number(card.dataset.itemId.match(/q(\d+)/)?.[1])<=4)),'오답 원문 1~4번만 남음');
    await wrongByType.close();
    const mobile=await browser.newPage({viewport:{width:390,height:844}});
    await mobile.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await mobile.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('김서연','original1','O'.repeat(30))])}));
    await mobile.goto(base+'/bank/personal-mock.html');
    await mobile.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await mobile.locator('[data-band="4.2"]').click();
    await mobile.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'390px horizontal overflow');
    const output=path.join(os.tmpdir(),'gfield-personal-mock-qa.pdf');
    await ready.emulateMedia({media:'print'});
    await ready.pdf({path:output,format:'A4',printBackground:true,preferCSSPageSize:true});
    assert.ok(fs.statSync(output).size>10000);
    console.log(JSON.stringify({desktopQuestions:30,answers:30,mobileNoOverflow:true,pdf:output,expectedPages:await ready.locator('.pm-page').count()}));
    await mobile.close();await ready.close();
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
