'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const outputDir=process.env.GFIELD_PRACTICE_REPORT_DIR||'';
const student='docssam';
const rows=[
  {student,round:'final1',ox:'O'.repeat(30),score:100,wrong:0,source:'online',updated_at:'2026-09-14T00:00:00.000Z'},
  {student,round:'final2',ox:'X'.repeat(30),score:0,wrong:30,source:'online',updated_at:'2026-09-15T00:00:00.000Z'},
  {student,round:'final2@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin',updated_at:'2026-09-15T01:00:00.000Z'}
];

const contentTypes={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end();return;
  }
  res.setHeader('Content-Type',contentTypes[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch(executablePath?{executablePath}:{});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(()=>{
      const session={access_token:'qa-token',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,login_name:'docssam'};
      localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify(session));
    });
    await context.route(/^https?:\/\//,async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.pathname==='/rest/v1/mock_results')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});
      if(url.pathname.endsWith('/hs-final-population'))return route.fulfill({status:503,contentType:'application/json',body:'{"error":"QA offline"}'});
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const base=`http://127.0.0.1:${server.address().port}`;
    await page.goto(`${base}/final.html?round=2&go=report&attempt=2&entry=teacher&name=${encodeURIComponent(student)}`,{waitUntil:'domcontentloaded'});
    await page.locator('.report-item-section').waitFor();

    assert.match(await page.locator('.banner').first().innerText(),/2차 연습 성적표/);
    assert.match(await page.locator('.report-print-cover').innerText(),/파이널 2회 · 2차 연습/);
    assert.match(await page.locator('.report-screen-header').innerText(),/2차 연습/);
    assert.equal(await page.locator('.report-screen-header dd').first().innerText(),'100/100');
    assert.match(await page.locator('#report-summary').innerText(),/이번 연습 결과/);
    assert.match(await page.locator('#report-summary').innerText(),/회차 평균 점수\s*50점/,'cumulative average keeps official Final1=100 and Final2=0');
    assert.match(await page.locator('#report-summary').innerText(),/누적은 저장된 최초 응시 기록을 유지/);
    assert.equal(await page.locator('.attempt-progress a[href*="attempt=1"]').count(),1);
    assert.equal(await page.locator('.attempt-progress [aria-current="page"]').textContent(),'현재 성적표');

    const prepared=await page.evaluate(async()=>{
      const job=GFIELD_FINAL_REPORT_PRINT.createPreparation({source:document.querySelector('.final-report-package'),requiredFontFamilies:[],timeoutMs:45000});
      try{
        const result=await job.promise;
        const metrics=result.metrics;
        result.cleanup();
        return metrics;
      }catch(error){return {errorCode:error.code||'',errorMessage:error.message||''};}
    });
    assert.equal(prepared.errorCode,undefined,prepared.errorCode+': '+prepared.errorMessage);
    assert.equal(prepared.round,2);
    assert.equal(prepared.detailItems.length,30);
    assert.equal(prepared.detailStartPage%2,1);

    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'practice report fits 390px');
    if(outputDir){
      fs.mkdirSync(outputDir,{recursive:true});
      await page.setViewportSize({width:1280,height:900});
      await page.emulateMedia({media:'print'});
      await page.pdf({path:path.join(outputDir,'final2-practice-attempt-2.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:true,attempt:2,currentScore:100,cumulativeOfficialAverage:50,detailItems:prepared.detailItems.length,detailStartPage:prepared.detailStartPage}));
  }finally{
    await browser.close();server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
