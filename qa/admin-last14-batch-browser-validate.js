'use strict';
// Synthetic records only; every external request is intercepted, and writes fail.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='최종일괄합성검수학생';
const out=process.env.GFIELD_LAST_BATCH_QA_DIR;
assert.ok(out&&path.isAbsolute(out),'an explicit E: evidence directory is required');
fs.mkdirSync(out,{recursive:true});
const ox='O'.repeat(27)+'XXX';
const records=['final1','last1','last2','last3','last4'].map(round=>({student,round,ox,score:core.scoreOf(ox),wrong:3,source:'admin'}));
const last1Ox='XOOXOXOOXXOOOOXXOOOXOXOXXXOOOX';
Object.assign(records[1],{ox:last1Ox,score:core.scoreOf(last1Ox),wrong:13});
records.push({...records[0],round:'last1@2'},{...records[0],round:'last2',student:'잘못된점수',score:0},{...records[0],round:'last3',student:'초기화기록',source:'reset'});
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['최종 모의고사']=[n];})();`;
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(req.method!=='GET'){res.writeHead(405);return res.end();}
  const file=path.resolve(root,'.'+decodeURIComponent(pathname));
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  if(pathname==='/data.js')return res.end(data);
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.GFIELD_LAST_BATCH_BASE||'http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  const errors=[],writes=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(()=>localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'qa-admin',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600})));
    await context.route(/^https?:\/\//,async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'){
        // This pre-existing POST is a read-only percentile lookup, not a result write.
        if(url.pathname==='/functions/v1/hs-final-population')return route.fulfill({status:503,contentType:'application/json',body:'{}'});
        if(req.method()!=='GET'){writes.push(req.method()+' '+url.pathname);return route.abort();}
        const body=url.pathname==='/auth/v1/user'?{id:'qa-admin',app_metadata:{role:'admin'}}:url.pathname==='/rest/v1/mock_results'?records:[];
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
      }
      if(url.origin===new URL(base).origin){if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
      return route.abort();
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/admin.html');
    await page.waitForFunction(()=>window.GFIELD_ADMIN_FINAL_BATCH&&window.GFIELD_ADMIN_MOCK_V2);
    await page.evaluate(()=>loadMockResults());
    await page.evaluate(()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('app').classList.remove('hidden');document.getElementById('tab-mock').classList.remove('hidden');});
    assert.equal(await page.locator('#final-batch-rounds input[data-exam-set]').count(),8);
    assert.equal(await page.evaluate(()=>GFIELD_ADMIN_MOCK_V2.lastOfficialEntries().length),4);
    assert.doesNotMatch(await page.locator('#final-batch-students').innerText(),/잘못된점수|초기화기록/);
    await page.locator('#final-batch-details').check();
    await page.evaluate(()=>GFIELD_ADMIN_FINAL_BATCH.refresh());
    assert.equal(await page.locator('#final-batch-details').isChecked(),true,'refresh preserves appendix selection');
    await page.locator('#final-batch-details').uncheck();await page.locator('#final-batch-similar').uncheck();
    await page.locator('#final-batch-select-all').click();
    assert.equal(await page.locator('#final-batch-count').innerText(),'선택 5건');
    await page.evaluate(()=>{document.querySelectorAll('#final-batch-rounds input[data-exam-set]').forEach(input=>{input.checked=input.value==='last1';input.dispatchEvent(new Event('change',{bubbles:true}));});});
    assert.deepEqual(await page.evaluate(()=>GFIELD_ADMIN_FINAL_BATCH._test.taskList().map(x=>x.set+':'+x.round)),['last:1']);
    const report=await page.evaluate(()=>GFIELD_ADMIN_MOCK_V2.reportUrl(GFIELD_ADMIN_FINAL_BATCH._test.taskList()[0]));
    assert.match(report,/set=last&round=1&go=report&attempt=1&entry=teacher/);
    await page.evaluate(()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('app').classList.remove('hidden');document.getElementById('tab-mock').classList.remove('hidden');});
    await page.locator('#final-batch-panel').screenshot({path:path.join(out,'admin-last14-desktop.png')});
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('#final-batch-panel').screenshot({path:path.join(out,'admin-last14-mobile.png')});await page.setViewportSize({width:1280,height:900});
    const folders=await page.evaluate(async()=>{
      const names=[],dir={getDirectoryHandle:async name=>{names.push(name);return {getFileHandle:async file=>{names.push(file);return {createWritable:async()=>({write:async()=>{},close:async()=>{}})};}};}};
      for(const set of ['final','last'])await GFIELD_ADMIN_FINAL_BATCH._test.writeFile(dir,{student:'同名',set,round:1},new Blob(['PDF']));return names;
    });
    assert.deepEqual(folders,['파이널 1회','同名_파이널_1회_진단과복습.pdf','최종 1회','同名_최종_1회_진단과복습.pdf']);
    for(const round of (process.env.GFIELD_BATCH_PRIORITY_ONLY==='1'?[]:[1,2,3,4])){
      const result=await page.evaluate(async({student,round})=>{
        const task=GFIELD_ADMIN_MOCK_V2.lastOfficialEntries().find(x=>x.round===round);
        const frame=await GFIELD_ADMIN_FINAL_BATCH._test.loadFrame(GFIELD_ADMIN_MOCK_V2.reportUrl(task),'합성 검수');
        const doc=frame.contentDocument,win=frame.contentWindow;
        for(let i=0;i<300&&!doc.querySelector('.final-report-package');i++)await new Promise(r=>setTimeout(r,100));
        const source=doc.querySelector('.final-report-package');
        if(!source)throw new Error('Last '+round+' report unavailable: '+doc.body.innerText.slice(0,200));
        if(source.querySelector('#report-summary .parent-summary-column.current').textContent.includes('파이널 '+round+'회'))throw new Error('Last report incorrectly labelled Final');
        const qr=source.querySelectorAll('.report-qr-card svg').length;
        const correctSet=source.getAttribute('data-set'),correctRound=source.getAttribute('data-report-round');
        const job=win.GFIELD_FINAL_REPORT_PRINT.createPreparation({document:doc,source,mode:'summary',requiredFontFamilies:[]});
        const prepared=await job.promise;
        const pages=prepared.frame.contentDocument.querySelectorAll('.pagedjs_page').length;
        prepared.cleanup();GFIELD_ADMIN_FINAL_BATCH._test.cleanupFrame(frame);
        const blob=await GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);
        return {qr,correctSet,correctRound,pages,base64:await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);})};
      },{student,round});
      assert.equal(result.correctSet,'last');assert.equal(result.correctRound,String(round));assert.ok(result.qr>=1);assert.ok(result.pages>=2);
      const bytes=Buffer.from(result.base64,'base64');assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>40000);
      fs.writeFileSync(path.join(out,'last'+round+'-batch-summary.pdf'),bytes);
      console.log('PASS Last '+round+' summary, QR, actual batch PDF ('+bytes.length+' bytes)');
    }
    if(process.env.GFIELD_BATCH_PRIORITY_ONLY!=='1'){
    await page.locator('#final-batch-details').check();
    const detailed=await page.evaluate(async()=>{const task=GFIELD_ADMIN_MOCK_V2.lastOfficialEntries().find(x=>x.round===2);const blob=await GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);return {size:blob.size,base64:await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob);})};});
    fs.writeFileSync(path.join(out,'last2-batch-with-details.pdf'),Buffer.from(detailed.base64,'base64'));
    assert.ok(detailed.size>400000,'Last2 full original detailed appendix is rendered');
    }
    await page.locator('#final-batch-details').uncheck();await page.locator('#final-batch-similar').check();
    const practice=await page.evaluate(async()=>{window.__GFIELD_BATCH_QA_CAPTURE__={};const task=GFIELD_ADMIN_MOCK_V2.lastOfficialEntries().find(x=>x.round===1);const blob=await GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);return {size:blob.size,practice:window.__GFIELD_BATCH_QA_CAPTURE__.practice,base64:await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob);})};});
    fs.writeFileSync(path.join(out,'last1-batch-with-practice.pdf'),Buffer.from(practice.base64,'base64'));
    assert.ok(practice.size>400000,'Last1 reviewed practice appendix is rendered');
    assert.deepEqual(practice.practice.sourceNos,[20,15,22]);
    assert.equal(practice.practice.questions,9);assert.equal(practice.practice.answers,9);
    assert.deepEqual(practice.practice.questionIds,practice.practice.answerIds);
    assert.ok(practice.practice.questionIds.every(id=>/^last1-q(20|15|22)-v[123]$/.test(id)));
    console.log('PASS 13 wrong items -> same 3 priority types, 9 actual questions + 9 solutions');
    const finishFailure=await page.evaluate(async()=>{
      await GFIELD_ADMIN_FINAL_BATCH._test.runTasks([{student:'합성',set:'last',round:1}],async()=>{},'완료',async()=>{throw new Error('QA ZIP failure');},async()=>new Blob(['PDF']));
      return {status:document.getElementById('final-batch-status').textContent,busy:document.getElementById('final-batch-zip').disabled};
    });
    assert.match(finishFailure.status,/ZIP 파일을 만들지 못해 PDF가 다운로드되지 않았습니다/);assert.match(finishFailure.status,/QA ZIP failure/);assert.equal(finishFailure.busy,false);
    const brokenImage=await page.evaluate(async()=>{
      const doc=document.implementation.createHTMLDocument('broken'),image=doc.createElement('img');doc.body.appendChild(image);
      try{await GFIELD_ADMIN_FINAL_BATCH._test.waitImages(doc.body);return 'incorrect success';}catch(error){return error.message;}
    });
    assert.match(brokenImage,/PDF 그림을 불러오지 못했습니다/);
    await page.evaluate(()=>{document.querySelectorAll('#final-batch-rounds input[data-exam-set]').forEach(input=>{input.checked=input.value==='last1';input.dispatchEvent(new Event('change',{bubbles:true}));});});
    const priorityDownloadPromise=page.waitForEvent('download',{timeout:180000});await page.locator('#final-batch-zip').click();
    const priorityDownload=await priorityDownloadPromise,priorityZipPath=path.join(out,'last1-priority-batch.zip');await priorityDownload.saveAs(priorityZipPath);
    const priorityZip=await page.evaluate(async bytes=>{
      const archive=await JSZip.loadAsync(bytes,{base64:true}),file=Object.values(archive.files).find(entry=>!entry.dir);
      return {names:Object.keys(archive.files),bytes:await file.async('base64'),practice:window.__GFIELD_BATCH_QA_CAPTURE__.practice};
    },fs.readFileSync(priorityZipPath).toString('base64'));
    assert.deepEqual(priorityZip.names,['최종 1회/','최종 1회/'+student+'_최종_1회_진단과복습.pdf']);
    assert.equal(priorityZip.practice.questions,9);assert.equal(priorityZip.practice.answers,9);
    fs.writeFileSync(path.join(out,'last1-priority-from-zip.pdf'),Buffer.from(priorityZip.bytes,'base64'));
    await page.waitForFunction(()=>document.getElementById('final-batch-status').dataset.state==='done');
    console.log('PASS actual ZIP download includes priority questions and solutions; compression failure/broken-image errors are visible');
    await page.evaluate(()=>{document.querySelectorAll('#final-batch-rounds input[data-exam-set]').forEach(input=>{input.checked=input.value==='last4';input.dispatchEvent(new Event('change',{bubbles:true}));});});
    const downloadPromise=page.waitForEvent('download',{timeout:120000});await page.locator('#final-batch-zip').click();
    const download=await downloadPromise,zipPath=path.join(out,'last4-batch.zip');await download.saveAs(zipPath);
    const zipEntries=await page.evaluate(async bytes=>Object.keys((await JSZip.loadAsync(bytes,{base64:true})).files),fs.readFileSync(zipPath).toString('base64'));
    assert.deepEqual(zipEntries,['최종 4회/','최종 4회/'+student+'_최종_4회_진단과복습.pdf']);
    assert.match(await page.locator('#final-batch-status').innerText(),/준비 중인 부록은 제외했습니다: 최종 4회/);
    const finalPractice=await page.evaluate(async()=>{window.__GFIELD_BATCH_QA_CAPTURE__={};const task=GFIELD_ADMIN_MOCK_V2.finalOfficialEntries()[0];const blob=await GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);return {practice:window.__GFIELD_BATCH_QA_CAPTURE__.practice,base64:await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob);})};});
    assert.equal(finalPractice.practice.questions,9);assert.equal(finalPractice.practice.answers,9);assert.deepEqual(finalPractice.practice.questionIds,finalPractice.practice.answerIds);
    fs.writeFileSync(path.join(out,'final1-priority-batch.pdf'),Buffer.from(finalPractice.base64,'base64'));
    console.log('PASS existing Final recommendation printer is reused by the batch PDF');
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log('PASS mixed-series selection, folders, option state, desktop/mobile; production writes: 0');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
