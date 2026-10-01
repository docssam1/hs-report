const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const mockBank=require('../bank/personal-mock.js');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
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
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',error=>console.error('PAGE ERROR',error.message));
    await page.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await page.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('김서연','original1','O'.repeat(30))])}));
    await page.goto(base+'/bank/personal-mock.html');
    await page.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await page.locator('[data-band="4.2"]').click();
    await page.locator('#pmStatus').getByText('자료실 공개 보충 6문항').waitFor({timeout:30000});
    await page.waitForFunction(()=>!document.getElementById('pmPrint').disabled);
    assert.equal(await page.locator('.pm-q').count(),30);
    assert.equal(await page.locator('.pm-q').filter({hasText:'자료실 보충'}).count(),6);
    assert.equal(await page.locator('.pm-answer').filter({hasText:'자료실 공개 보충'}).count(),6);
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
    const mobile=await browser.newPage({viewport:{width:390,height:844}});
    await mobile.addInitScript(()=>localStorage.setItem('gfield_student','김서연'));
    await mobile.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record('김서연','original1','O'.repeat(30))])}));
    await mobile.goto(base+'/bank/personal-mock.html');
    await mobile.locator('#pmStatus').getByText('30문항 준비 완료').waitFor({timeout:30000});
    await mobile.locator('[data-band="4.2"]').click();
    await mobile.locator('#pmStatus').getByText('자료실 공개 보충 6문항').waitFor({timeout:30000});
    assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'390px horizontal overflow');
    const output=path.join(os.tmpdir(),'gfield-personal-mock-qa.pdf');
    await ready.emulateMedia({media:'print'});
    await ready.pdf({path:output,format:'A4',printBackground:true,preferCSSPageSize:true});
    assert.ok(fs.statSync(output).size>10000);
    console.log(JSON.stringify({desktopQuestions:30,answers:30,mobileNoOverflow:true,pdf:output,expectedPages:await ready.locator('.pm-page').count()}));
    await mobile.close();await ready.close();
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
