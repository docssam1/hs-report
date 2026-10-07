'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='관리자회차검수학생';
const ox='O'.repeat(20)+'X'.repeat(10),score=core.scoreOf(ox),scoreKey=String(Math.round(score*10));
const rows=[1,2,3,4].map(round=>({student,round:'final'+round,ox,score,wrong:10,source:'admin',updated_at:'2026-09-09T0'+round+':00:00.000Z'}));
rows.push(...[1,2,3,4].map(round=>({student,round:'last'+round,ox,score,wrong:10,source:'admin'})));
rows.push({student,round:'last1@2',ox,score,wrong:10,source:'online'});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port,origin=new URL(base).origin;
  const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900}});
  const calls=[],writes=[],errors=[],confirmations=[];
  await context.addInitScript(()=>localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'synthetic-admin',refresh_token:'synthetic-admin',expires_at:Math.floor(Date.now()/1000)+3600,login_name:'DOCSSAM'})));
  await context.route(/^https?:\/\//,route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin===origin)return route.continue();
    if(url.pathname==='/auth/v1/user')return route.fulfill({json:{id:'synthetic-admin',app_metadata:{role:'admin'}}});
    if(url.pathname==='/rest/v1/mock_results'){
      if(req.method()!=='GET')writes.push(req.method()+' '+url.pathname);
      return route.fulfill({json:rows});
    }
    if(url.pathname==='/rest/v1/weak_types')return route.fulfill({json:[]});
    if(url.pathname.endsWith('/hs-final-population')){
      const body=req.postDataJSON();calls.push(structuredClone(body));
      if(body.action==='read-report')return route.fulfill({json:{canEdit:true,comment:'',commentUpdatedAt:null,resultOx:ox,snapshot:{exam:body.exam,version:body.exam+'-'+'a'.repeat(64),percentiles:{[scoreKey]:20+Number(body.exam.slice(5))}}}});
      if(body.action==='apply-percentiles')return route.fulfill({json:{applied:true,incomplete:body.exam==='final2'}});
      return route.fulfill({status:400,json:{error:'INVALID_REQUEST'}});
    }
    return route.fulfill({status:200,contentType:url.hostname==='cdn.jsdelivr.net'?'text/css':'application/json',body:url.hostname==='cdn.jsdelivr.net'?'':'[]'});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',async dialog=>{confirmations.push(dialog.message());await dialog.accept();});
  try{
    await page.goto(base+'/admin.html');
    await page.locator('#app:not(.hidden)').waitFor();
    await page.getByRole('button',{name:'⑩ 모의고사 결과'}).click();
    await page.locator('#mock-body select').waitFor();
    await page.getByRole('button',{name:'파이널 모의고사'}).click();
    await page.locator('#mock-body select').selectOption({label:student});
    await page.locator('[data-final-percentile]').nth(3).waitFor({state:'attached'});
    await page.waitForFunction(()=>[...document.querySelectorAll('[data-final-percentile]')].every(cell=>cell.textContent!=='백분율 미반영'));
    assert.equal(await page.locator('[data-final-percentile]').count(),4,'Final1-4 first results each get one saved-percentile cell');
    for(let round=1;round<=4;round++){
      assert.equal(await page.locator('[data-final-percentile="'+round+'"]').innerText(),'백분율 '+(20+round).toFixed(1)+'%');
    }
    assert.deepEqual(calls.filter(call=>call.action==='read-report').slice(0,4).map(call=>call.exam),['final1','final2','final3','final4']);
    const picker=page.locator('#apply-final-round');
    assert.deepEqual(await picker.locator('option').allTextContents(),['파이널 1회','파이널 2회','파이널 3회','파이널 4회','최종 1회','최종 2회','최종 3회','최종 4회']);assert.equal(await picker.inputValue(),'1');
    for(let round=1;round<=4;round++){
      await picker.selectOption(String(round));
      const appliedBefore=calls.filter(call=>call.action==='apply-percentiles').length;
      await page.locator('#apply-final-percentiles').click();
      await page.waitForTimeout(100);
      assert.equal(calls.filter(call=>call.action==='apply-percentiles').length,appliedBefore+1);
      assert.match(await page.locator('#mock-status').innerText(),new RegExp('파이널 '+round+'회 백분율을 저장했습니다\\.'));
    }
    const applied=calls.filter(call=>call.action==='apply-percentiles');
    assert.deepEqual(applied.map(call=>call.exam),['final1','final2','final3','final4']);
    assert.ok(applied.every(call=>Object.keys(call).sort().join('|')==='action|exam'));
    for(let round=1;round<=4;round++)assert.match(confirmations[round-1],new RegExp('파이널 '+round+'회'));
    await page.getByRole('button',{name:'최종 모의고사',exact:true}).click();
    await page.locator('#mock-body select').selectOption({label:student});
    assert.equal(await page.locator('[data-last-percentile]').count(),4,'retakes do not enter official percentile cells');
    const expected=await page.evaluate(score=>Object.values(window.GFIELD_LAST_SCORE_DATA.rounds).map(round=>{
      if(round.percentileTable){const row=round.percentileTable.find(row=>score>=row[0])||round.percentileTable.at(-1);return row[1];}
      return Math.min(100,Math.round((round.scoreDist.filter(value=>value>score).length+1)/round.cohortSize*1000)/10);
    }),score);
    for(let round=1;round<=4;round++){
      assert.equal(await page.locator('[data-last-percentile="'+round+'"]').innerText(),'백분율 '+expected[round-1].toFixed(1)+'%');
      await picker.selectOption('last'+round);
      await page.locator('#apply-final-percentiles').click();
      assert.match(await page.locator('#mock-status').innerText(),new RegExp('최종 '+round+'회 백분율 기준을 적용했습니다'));
    }
    assert.deepEqual(calls.filter(call=>call.action==='apply-percentiles').map(call=>call.exam),['final1','final2','final3','final4'],'Last uses its existing automatic reference, not the Final-only snapshot service');
    for(let round=1;round<=4;round++)assert.match(confirmations[round+3],new RegExp('최종 '+round+'회'));
    await page.setViewportSize({width:390,height:844});
    await page.locator('#apply-final-round').scrollIntoViewIfNeeded();
    assert.ok(await page.locator('#apply-final-round').isVisible());
    assert.ok(await page.locator('#apply-final-percentiles').isVisible());
    for(const selector of ['#apply-final-round','#apply-final-percentiles']){
      const box=await page.locator(selector).boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390,'mobile control stays in viewport');
    }
    await page.evaluate(()=>{window.GFIELD_LAST_SCORE_DATA=null;});
    await page.locator('#apply-final-percentiles').click();
    assert.match(await page.locator('#mock-status').innerText(),/백분율 기준을 불러오지 못했습니다/);
    assert.deepEqual(writes,[],'no result-table write is attempted');
    assert.deepEqual(errors,[]);
    console.log('PASS Final1-4 snapshot apply, Last1-4 existing reference display, confirmations, retake exclusion, missing reference and zero learner writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
