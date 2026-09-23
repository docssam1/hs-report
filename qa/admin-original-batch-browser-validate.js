'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const vm=require('node:vm');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const root=path.resolve(__dirname,'..');
const qaDir=process.env.GFIELD_ORIGINAL_BATCH_QA_DIR||path.join(root,'.private-work','admin-original-batch-qa');
const targetRound=process.env.GFIELD_ORIGINAL_BATCH_ROUND==='2'?2:1;
const pdfPath=path.join(qaDir,`original${targetRound}-official-batch.pdf`);
const student='원본형일괄검수';
const mockSource=fs.readFileSync(path.join(root,'mock-data-original.js'),'utf8');
const mockWindow={};vm.runInNewContext(mockSource,{window:mockWindow});
const original=mockWindow.GFIELD_MOCK_ORIGINAL;
const pointMap=Object.fromEntries(original.blueprint.map(item=>[Number(item.no),Number(item.pts)]));
const score=ox=>Math.round([...ox].reduce((sum,mark,index)=>sum+(mark==='O'?pointMap[index+1]:0),0)*10)/10;
const first1=process.env.GFIELD_ORIGINAL_BATCH_LOW_SCORE==='1'?'X'.repeat(30):'X'+'O'.repeat(29),first2='O'.repeat(28)+'XX';
const rows=[
  {student,round:'original1',ox:first1,score:score(first1),wrong:[...first1].filter(mark=>mark==='X').length,source:'admin',updated_at:'2026-09-20T10:00:00Z'},
  {student,round:'original1@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin',updated_at:'2026-09-20T11:00:00Z'},
  {student,round:'original2',ox:first2,score:score(first2),wrong:2,source:'online',updated_at:'2026-09-20T12:00:00Z'},
  {student:'무결성제외',round:'original2',ox:'O'.repeat(30),score:0,wrong:0,source:'admin',updated_at:'2026-09-20T12:00:00Z'},
];
const dataSource=fs.readFileSync(path.join(root,'data.js'),'utf8');
const dataAddon=`\n;(function(){var d=window.GFIELD_DATA;d.students=d.students||[];if(!d.students.includes(${JSON.stringify(student)}))d.students.push(${JSON.stringify(student)});})();`;
fs.mkdirSync(qaDir,{recursive:true});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='POST'&&url.pathname==='/__qa_pdf'){
    const chunks=[];req.on('data',chunk=>chunks.push(chunk));req.on('end',()=>{fs.writeFileSync(pdfPath,Buffer.concat(chunks));res.writeHead(204);res.end();});return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',{'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream');
  if(url.pathname==='/data.js'){res.end(dataSource+dataAddon);return;}
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
  const errors=[],writes=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(()=>localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'qa-admin',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'qa-admin',app_metadata:{role:'admin'}}})));
    await context.route(/^https?:\/\//,async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'){
        if(request.method()!=='GET')writes.push(request.method()+' '+url.pathname);
        if(url.pathname==='/auth/v1/user')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'qa-admin',app_metadata:{role:'admin'}})});
        if(url.pathname==='/rest/v1/mock_results')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});
        if(url.pathname==='/rest/v1/weak_types')return route.fulfill({status:200,contentType:'application/json',body:'[]'});
        return route.fulfill({status:200,contentType:'application/json',body:'[]'});
      }
      if(url.hostname==='cdn.jsdelivr.net'||url.hostname==='fonts.googleapis.com')return route.fulfill({status:200,contentType:'text/css',body:''});
      return route.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/admin.html`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.GFIELD_ADMIN_ORIGINAL_BATCH&&window.GFIELD_ADMIN_MOCK_V2);
    await page.evaluate(()=>loadMockResults());
    await page.waitForFunction(name=>document.querySelector(`#original-batch-students [data-student="${name}"]`),student);
    const official=await page.evaluate(()=>window.GFIELD_ADMIN_MOCK_V2.originalOfficialEntries());
    assert.equal(official.length,2,'only verified official first attempts are eligible');
    assert.deepEqual(official.map(row=>row.round),[1,2]);
    assert.match(await page.evaluate(row=>window.GFIELD_ADMIN_MOCK_V2.reportUrl(row),official[1]),/^final\.html\?set=original&round=2&go=report&attempt=1&entry=teacher&name=/);
    assert.equal(await page.locator('#original-batch-students [data-student="무결성제외"]').count(),0);
    await page.evaluate(name=>{var node=document.querySelector(`#original-batch-students [data-student="${name}"]`);node.checked=true;node.dispatchEvent(new Event('change',{bubbles:true}));},student);
    assert.equal(await page.locator('#original-batch-count').textContent(),'선택 2건');
    await page.evaluate(()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('app').classList.remove('hidden');document.getElementById('tab-mock').classList.remove('hidden');});
    await page.locator('#original-batch-panel').screenshot({path:path.join(qaDir,'original-batch-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>{var node=document.getElementById('original-batch-panel');return node.scrollWidth<=node.clientWidth+1;}),'original batch panel fits 390px');
    await page.locator('#original-batch-panel').screenshot({path:path.join(qaDir,'original-batch-390.png')});
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(round=>{var node=document.querySelector(`#original-batch-rounds input[value="${round===1?2:1}"]`);node.checked=false;node.dispatchEvent(new Event('change',{bubbles:true}));},targetRound);
    assert.equal(await page.locator('#original-batch-count').textContent(),'선택 1건');
    const task=await page.evaluate(()=>window.GFIELD_ADMIN_ORIGINAL_BATCH._test.taskList()[0]);
    assert.equal(task.round,targetRound);assert.equal(task.student,student);
    const linked=await page.evaluate(()=>{
      const doc=document.implementation.createHTMLDocument('approved practice');
      doc.body.innerHTML='<div id="wrongPractice"><article class="wp-item" data-wp-gen="original1-q8" data-wp-no="8"></article></div>';
      const rows=window.GFIELD_ADMIN_ORIGINAL_BATCH._test.similarRows(doc);
      return {rows,url:window.GFIELD_ADMIN_ORIGINAL_BATCH._test.similarUrl({student:'검수',round:1},rows)};
    });
    assert.deepEqual(linked.rows,[{generator:'original1-q8',no:8}]);
    assert.match(linked.url,/source=original%7C1/);assert.match(linked.url,/bank=original1/);assert.match(linked.url,/printMode=both/);
    const collision=await page.evaluate(async()=>{
      const calls=[];
      const result={blob:new Blob(['PDF'],{type:'application/pdf'}),similarCount:0};
      const folder={getFileHandle:async(name,opt)=>{calls.push([name,opt.create]);if(!opt.create){if(/_2\.pdf$/.test(name))throw new DOMException('not found','NotFoundError');return {name};}return {createWritable:async()=>({write:async blob=>calls.push(['write',blob.size]),close:async()=>calls.push(['close'])})};}};
      const dir={getDirectoryHandle:async(name,opt)=>{calls.push(['folder',name,opt.create]);return folder;}};
      await window.GFIELD_ADMIN_ORIGINAL_BATCH._test.writeFile(dir,{student:'검수:학생',round:1},result);
      return calls;
    });
    assert.deepEqual(collision,[['folder','시그니처 실전 1회',true],['검수_학생_시그니처_실전_1회_진단.pdf',false],['검수_학생_시그니처_실전_1회_진단_2.pdf',false],['검수_학생_시그니처_실전_1회_진단_2.pdf',true],['write',3],['close']]);
    const result=await page.evaluate(async()=>{var task=window.GFIELD_ADMIN_ORIGINAL_BATCH._test.taskList()[0];var result=await window.GFIELD_ADMIN_ORIGINAL_BATCH._test.buildPackage(task,0,1);var response=await fetch('/__qa_pdf',{method:'POST',body:result.blob});return {size:result.blob.size,type:result.blob.type,similarCount:result.similarCount,reportPages:result.reportPages,bankPages:result.bankPages,fileName:window.GFIELD_ADMIN_ORIGINAL_BATCH._test.fileName(task,result),ok:response.ok};});
    assert.equal(result.ok,true);assert.ok(result.size>30000);assert.equal(result.type,'application/pdf');
    assert.equal(result.similarCount,0,'no unapproved original-form variants are exported');
    assert.equal(result.bankPages,0);assert.ok(result.reportPages>=1);
    assert.match(result.fileName,new RegExp(`시그니처_실전_${targetRound}회_진단\\.pdf$`));
    assert.equal(fs.readFileSync(pdfPath).subarray(0,5).toString(),'%PDF-');
    assert.ok(result.reportPages>=2,'area chart must be present on a second printable page');
    const secondPagePath=path.join(qaDir,`original${targetRound}-page-2.png`);
    execFileSync('pdftoppm',['-f','2','-l','2','-scale-to','1200','-png','-singlefile',pdfPath,secondPagePath.slice(0,-4)],{stdio:'pipe'});
    assert.ok(fs.statSync(secondPagePath).size>20000,'the current PDF second page must render for visual inspection');
    const downloadPromise=page.waitForEvent('download',{timeout:120000});
    await page.locator('#original-batch-zip').click();
    const download=await downloadPromise,zipPath=path.join(qaDir,`original${targetRound}-batch.zip`);
    await download.saveAs(zipPath);
    assert.match(download.suggestedFilename(),/^지필드_시그니처_실전_진단_/);
    assert.equal(fs.readFileSync(zipPath).subarray(0,4).toString('binary'),'PK\x03\x04','ZIP action downloads the selected official report');
    await page.waitForFunction(()=>document.getElementById('original-batch-status')?.dataset.state==='done');
    const cancellation=await page.evaluate(async()=>{
      const processed=[],saved=[];
      await window.GFIELD_ADMIN_ORIGINAL_BATCH._test.runTasks([{student:'첫째',round:1},{student:'둘째',round:2}],async task=>saved.push(task.student),async()=>{},async(task,index)=>{
        processed.push(task.student);
        if(index===0)document.getElementById('original-batch-cancel').click();
        return {similarCount:0};
      });
      return {processed,saved,status:document.getElementById('original-batch-status').textContent,busy:document.getElementById('original-batch-zip').disabled};
    });
    assert.deepEqual(cancellation.processed,['첫째']);
    assert.deepEqual(cancellation.saved,['첫째']);
    assert.match(cancellation.status,/1건 저장했습니다.*현재 파일 뒤에 중단했습니다/s);
    assert.equal(cancellation.busy,false);
    const finishFailure=await page.evaluate(async()=>{
      await window.GFIELD_ADMIN_ORIGINAL_BATCH._test.runTasks([{student:'첫째',round:1}],async()=>{},async()=>{throw new Error('QA ZIP failure');},async()=>({similarCount:0}));
      return {status:document.getElementById('original-batch-status').textContent,busy:document.getElementById('original-batch-zip').disabled};
    });
    assert.match(finishFailure.status,/ZIP를 만들지 못해 PDF가 다운로드되지 않았습니다/);
    assert.match(finishFailure.status,/QA ZIP failure/);
    assert.equal(finishFailure.busy,false);
    assert.deepEqual(writes,[],'batch export never writes a student grade or approval');
    assert.deepEqual(errors,[],'no browser page errors');
    console.log(`original ${targetRound} batch validation passed: 2 verified first attempts, 390px panel, ${result.reportPages} A4 pages, ${result.size} bytes, ZIP/folder/cancel/error, no unapproved practice`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
