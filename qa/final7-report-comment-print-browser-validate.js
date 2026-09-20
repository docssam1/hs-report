'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');

const ROOT=path.resolve(__dirname,'..');
const BASE_URL=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:8897';
const STUDENT='최종7교사인쇄검수';
const OX=Array.from({length:30},(_,index)=>[0,1,2,12,13,14,22].includes(index)?'O':'X').join('');
const SCORE=core.scoreOf(OX);
assert.equal(SCORE,22.5,'fixture reproduces the 7-correct, 22.5-point report shown by the user');
const SOURCE=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const writes=[];
  const errors=[];
  try{
    await context.addInitScript(()=>{
      localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({
        access_token:'qa-admin-access',refresh_token:'qa-admin-refresh',
        expires_at:Math.floor(Date.now()/1000)+3600,
        user:{id:'qa-admin',app_metadata:{role:'admin',admin_id:'DOCSSAM'}}
      }));
    });
    await context.route(/^https?:\/\//,route=>{
      const request=route.request();
      const url=new URL(request.url());
      if(url.origin===new URL(BASE_URL).origin){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:SOURCE+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(STUDENT)};if(!d.students.includes(n))d.students.push(n);d.attendance[n]=[];d.archiveAccess['파이널 모의고사']=[];d.archiveProductAccess['mock-final-7']=[];})();`});
        return route.continue();
      }
      if(url.pathname.includes('/auth/v1/user'))return route.fulfill({json:{id:'qa-admin',app_metadata:{role:'admin',admin_id:'DOCSSAM'}}});
      if(url.pathname==='/rest/v1/mock_results'){
        if(request.method()!=='GET')writes.push(request.method()+' '+url.pathname);
        return route.fulfill({json:[{student:STUDENT,round:'final7',ox:OX,score:SCORE,wrong:23,source:'admin'}]});
      }
      if(url.pathname.endsWith('/hs-final-population')){
        const body=request.postDataJSON();
        if(body.action&&body.action!=='read-report')writes.push(body.action);
        return route.fulfill({json:{canEdit:true,comment:'끝까지 조건을 확인한 점이 좋습니다.',commentUpdatedAt:'2026-09-20T00:00:00Z',snapshot:null,resultOx:null}});
      }
      if(!['GET','HEAD','OPTIONS'].includes(request.method())&&!url.pathname.endsWith('/access_log'))writes.push(request.method()+' '+url.pathname);
      if(url.hostname==='fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:''});
      return route.fulfill({json:[]});
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${BASE_URL}/final.html?round=7&go=report&entry=teacher&name=${encodeURIComponent(STUDENT)}`,{waitUntil:'domcontentloaded'});
    await page.locator('.final-report-package').waitFor();
    assert.match((await page.locator('.banner.preview').allTextContents()).join(' '),/선생님 대리 입력/);
    assert.equal(await page.locator('#docssam-comment').count(),1,'verified admin receives the Final 7 comment editor');
    assert.doesNotMatch(await page.locator('.report-docssam-note').innerText(),/코멘트를 불러오지 못했습니다/);
    const prepared=await page.evaluate(async()=>{
      try{
        const job=GFIELD_FINAL_REPORT_PRINT.createPreparation({source:document.querySelector('.final-report-package'),mode:'summary',requiredFontFamilies:[],timeoutMs:30000});
        const result=await job.promise;
        const doc=result.frame.contentDocument;
        const value={
          metrics:result.metrics,
          pages:doc.querySelectorAll('.pagedjs_pages > .pagedjs_page').length,
          priorityWrongRows:doc.querySelectorAll('.report-wrong-summary tbody tr').length,
          curriculumRows:doc.querySelectorAll('.curriculum-table tbody tr').length,
          verbosePriorityLists:[...doc.querySelectorAll('.curriculum-books,.curriculum-points')].filter(list=>list.querySelectorAll(':scope > li').length>1).length,
        };
        result.cleanup();
        return value;
      }catch(error){
        return {error:{code:error&&error.code||'',message:error&&error.message||String(error)}};
      }
    });
    assert.equal(prepared.error,undefined,'Final 7 summary print prepares: '+JSON.stringify(prepared.error));
    assert.equal(prepared.metrics.round,7);
    assert.equal(prepared.metrics.mode,'summary');
    assert.ok(prepared.pages>=1&&prepared.pages<=7,'low-score diagnosis remains a concise PDF');
    assert.equal(prepared.priorityWrongRows,3,'summary PDF keeps only the three this-week wrong items');
    assert.ok(prepared.curriculumRows>0&&prepared.curriculumRows<=3,'summary PDF keeps only this-week curriculum rows');
    assert.equal(prepared.verbosePriorityLists,0,'each printed curriculum row keeps one book and one learning point');
    assert.deepEqual(writes,[],'read-only report and print validation performs no production writes');
    assert.deepEqual(errors,[],'Final 7 report has no browser errors');
    console.log('PASS Final 7 verified-admin comment editor and summary print preparation');
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
