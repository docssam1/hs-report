'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const student='일괄저장검수학생';
const qaDir=process.env.GFIELD_FINAL_BATCH_QA_DIR||path.join(root,'tmp','admin-final-batch-qa');
const pdfPath=path.join(qaDir,'final2-batch-package.pdf');
const actualData=fs.readFileSync(path.join(root,'data.js'),'utf8');
const dataAddon=`\n;(function(){var d=window.GFIELD_DATA;d.students=d.students||[];if(!d.students.includes(${JSON.stringify(student)}))d.students.push(${JSON.stringify(student)});})();`;
const ox='O'.repeat(27)+'XXX';
const record={student,round:'final2',ox,score:87.4,wrong:3,source:'admin',updated_at:'2026-09-15T00:00:00Z'};

fs.mkdirSync(qaDir,{recursive:true});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='POST'&&url.pathname==='/__qa_pdf'){
    const chunks=[];req.on('data',chunk=>chunks.push(chunk));req.on('end',()=>{fs.writeFileSync(pdfPath,Buffer.concat(chunks));res.writeHead(204);res.end();});return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  const type={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',type);
  if(url.pathname==='/data.js')return res.end(actualData+dataAddon);
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.route(/^https?:\/\//,async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'&&url.pathname==='/rest/v1/mock_results')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record])});
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'&&url.pathname.startsWith('/rest/v1/'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'&&url.pathname.includes('/functions/v1/'))return route.fulfill({status:503,contentType:'application/json',body:'{}'});
      return route.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/admin.html`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.GFIELD_ADMIN_FINAL_BATCH&&window.GFIELD_ADMIN_MOCK_V2);
    await page.evaluate(()=>loadMockResults());
    await page.waitForFunction(name=>document.querySelector(`[data-student="${name}"]`),student);
    assert.match(await page.locator('#final-batch-panel').innerText(),/파이널 진단·유사문제 한 번에 저장/);
    assert.match(await page.locator('#final-batch-students').innerText(),/일괄저장검수학생/);
    assert.match(await page.locator('#final-batch-students').innerText(),/2회 87\.4점/);
    await page.evaluate(name=>{
      const studentInput=document.querySelector(`[data-student="${name}"]`);studentInput.checked=true;studentInput.dispatchEvent(new Event('change',{bubbles:true}));
      ['1','3','4'].forEach(value=>{const input=document.querySelector(`#final-batch-rounds input[value="${value}"]`);input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));});
    },student);
    assert.equal(await page.locator('#final-batch-count').innerText(),'선택 1건');
    await page.evaluate(()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('app').classList.remove('hidden');document.getElementById('tab-mock').classList.remove('hidden');});
    await page.locator('#final-batch-panel').screenshot({path:path.join(qaDir,'admin-final-batch-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'batch controls fit 390px');
    await page.locator('#final-batch-panel').screenshot({path:path.join(qaDir,'admin-final-batch-390.png')});
    await page.setViewportSize({width:1280,height:900});
    const folderContract=await page.evaluate(async()=>{
      const calls=[];
      const directory={getDirectoryHandle:async(name,options)=>{calls.push(['folder',name,options.create]);return {getFileHandle:async(fileName,fileOptions)=>{calls.push(['file',fileName,fileOptions.create]);return {createWritable:async()=>({write:async blob=>calls.push(['write',blob.size]),close:async()=>calls.push(['close'])})};}};}};
      await window.GFIELD_ADMIN_FINAL_BATCH._test.writeFile(directory,{student:'검수:학생',round:2},new Blob(['PDF']));
      return calls;
    });
    assert.deepEqual(folderContract,[['folder','파이널 2회',true],['file','검수_학생_파이널_2회_진단과복습.pdf',true],['write',3],['close']]);
    if(process.env.GFIELD_FINAL_BATCH_UI_ONLY==='1'){
      assert.deepEqual(errors,[],'batch selection UI has no page errors');
      console.log('admin final batch UI validation passed: official first attempt, selection count, desktop, 390px');
      return;
    }
    const bankProbe=await context.newPage();
    await bankProbe.goto(`http://127.0.0.1:${server.address().port}/bank/index.html?practice=wrong&gens=final2-q28%2Cfinal2-q29%2Cfinal2-q30&per=3&points=all&source=final%7C2&sourceNos=28%2C29%2C30&seed=batch-qa&bank=final2`);
    try{await bankProbe.waitForFunction(()=>document.querySelectorAll('#final1Worksheet #f1Pages .page, #stage .page').length>0,{timeout:15000});}
    catch(error){throw new Error('유사문제 직접 준비 실패: '+(await bankProbe.locator('body').innerText()).slice(0,500));}
    assert.equal(await bankProbe.locator('#final1Worksheet .question-page .qcard, #stage .question-page .qcard').count(),9,'three similar questions per wrong item');
    await bankProbe.close();
    const result=await page.evaluate(async()=>{
      const task=window.GFIELD_ADMIN_FINAL_BATCH._test.taskList()[0];
      const blob=await window.GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);
      const response=await fetch('/__qa_pdf',{method:'POST',body:blob});
      return {ok:response.ok,size:blob.size,type:blob.type};
    });
    assert.equal(result.ok,true);assert.ok(result.size>100000,'generated PDF is non-trivial');
    const bytes=fs.readFileSync(pdfPath);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
    assert.deepEqual(errors,[],'batch generation has no page errors');
    console.log(`admin final batch browser validation passed: one official Final 2 package, ${result.size} bytes, report + detailed answers + similar questions`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
