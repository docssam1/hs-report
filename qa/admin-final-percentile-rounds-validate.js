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
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,origin=new URL(base).origin;
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
    assert.equal(await picker.locator('option').count(),4);assert.equal(await picker.inputValue(),'1');
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
    assert.deepEqual(writes,[],'no result-table write is attempted');
    assert.deepEqual(errors,[]);
    console.log('PASS admin Final1-4 picker, per-round confirmations/apply calls/status, saved official percentiles and no learner writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
