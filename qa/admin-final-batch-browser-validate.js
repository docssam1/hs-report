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
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
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
    assert.equal(await page.locator('#final-batch-similar').isChecked(),true,'similar questions and solutions are included by default');
    assert.equal(await page.locator('#final-batch-details').isChecked(),false,'the optional 30-source-item solution appendix is excluded by default');
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
    const similarUrl=await page.evaluate(()=>window.GFIELD_ADMIN_FINAL_BATCH._test.wrongBankUrl({querySelectorAll:()=>[
      {dataset:{wpGen:'final2-q28',wpNo:'28'}},{dataset:{wpGen:'final2-q29',wpNo:'29'}},{dataset:{wpGen:'final2-q30',wpNo:'30'}}
    ]},{student:'일괄저장검수학생',round:2}));
    assert.match(similarUrl,/printMode=both/,'batch URL explicitly requests both similar questions and their solutions');
    const pageSelection=await page.evaluate(()=>{
      const doc=document.implementation.createHTMLDocument('bank');
      doc.body.innerHTML='<main id="final1Worksheet"><div id="f1Pages"><section class="page" data-kind="reviewed"></section></div></main><div id="stage"><section class="page" data-kind="legacy"></section></div>';
      return {ready:window.GFIELD_ADMIN_FINAL_BATCH._test.reviewedBankPages(doc).map(node=>node.dataset.kind),waiting:window.GFIELD_ADMIN_FINAL_BATCH._test.reviewedBankPages(doc,true).map(node=>node.dataset.kind)};
    });
    assert.deepEqual(pageSelection.ready,['reviewed'],'batch export never mixes the reviewed worksheet with the legacy stage');
    assert.deepEqual(pageSelection.waiting,['reviewed'],'reviewed-bank selection remains pinned once ready');
    const batchPageSelection=await page.evaluate(()=>{
      const doc=document.implementation.createHTMLDocument('bank');
      doc.body.innerHTML='<main id="final1Worksheet"><div id="f1Pages"><section class="page cover-page"></section><section class="page question-page"></section><section class="page answer-page"></section></div></main>';
      return window.GFIELD_ADMIN_FINAL_BATCH._test.reviewedBankPages(doc,true,true).map(node=>node.className);
    });
    assert.equal(batchPageSelection.length,2,'batch package omits the redundant worksheet cover');
    await page.evaluate(async url=>{window.__qaBankFrame=await window.GFIELD_ADMIN_FINAL_BATCH._test.loadFrame(url,'유사문제 검수');},similarUrl);
    const hiddenBank=page.frames().find(frame=>/\/bank\/index\.html/.test(new URL(frame.url()).pathname));
    await hiddenBank.waitForFunction(()=>document.querySelectorAll('#final1Worksheet #f1Pages .page').length>0&&!(document.getElementById('btnPrint')||{}).disabled);
    const hiddenLayout=await hiddenBank.evaluate(()=>{const root=document.querySelector('#final1Worksheet'),wide=root.querySelector('.qcard[data-source-no="28"]');return {innerWidth,layout:root.dataset.layout,fixed:root.querySelectorAll('#f1Pages .page').length,legacy:document.querySelectorAll('#stage .page').length,column:getComputedStyle(wide).gridColumn,row:getComputedStyle(wide).gridRow};});
    assert.ok(hiddenLayout.innerWidth>=990,'hidden batch frame stays above the worksheet mobile breakpoint');
    assert.equal(hiddenLayout.layout,'editorial');
    assert.equal(hiddenLayout.fixed,7,'reviewed browser package contains one cover, three question pages, and three compact solution pages');
    assert.equal(hiddenLayout.legacy,0,'legacy stage contributes no pages');
    assert.equal(hiddenLayout.column,'1 / -1');assert.equal(hiddenLayout.row,'2','wide diagram occupies the first full-width row');
    await hiddenBank.locator('.question-page').first().screenshot({path:path.join(qaDir,'final2-hidden-batch-question-page.png')});
    await hiddenBank.addScriptTag({url:`http://127.0.0.1:${server.address().port}/vendor/html2canvas/1.4.1/html2canvas.min.js`});
    const hiddenCanvas=await hiddenBank.evaluate(async()=>{const canvas=await html2canvas(document.querySelector('.question-page'),{backgroundColor:'#fff',scale:1.45,useCORS:true,logging:false});return canvas.toDataURL('image/png');});
    fs.writeFileSync(path.join(qaDir,'final2-hidden-batch-question-canvas.png'),Buffer.from(hiddenCanvas.split(',')[1],'base64'));
    await page.evaluate(()=>{window.GFIELD_ADMIN_FINAL_BATCH._test.cleanupFrame(window.__qaBankFrame);delete window.__qaBankFrame;});
    const launchPage=await context.newPage();
    await launchPage.goto(`http://127.0.0.1:${server.address().port}/index.html?next=${encodeURIComponent('final.html?round=2&go=report')}`,{waitUntil:'domcontentloaded'});
    await launchPage.locator('#name-input').fill(student);
    await launchPage.evaluate(()=>doLogin());
    await launchPage.waitForURL(url=>url.pathname.endsWith('/final.html')&&url.searchParams.get('round')==='2'&&url.searchParams.get('go')==='report'&&url.searchParams.get('name')===student);
    await launchPage.locator('.final-report-package').waitFor();
    const qrLinks=await launchPage.locator('.report-compact-print-header .report-qr-card').evaluateAll(nodes=>nodes.map(node=>({href:node.href,svg:!!node.querySelector('svg')})));
    assert.equal(qrLinks.length,2,'concise diagnosis includes diagnosis and personal similar-question QR links');
    assert.ok(qrLinks.every(row=>row.svg),'both QR links are rendered as self-contained SVG');
    assert.match(qrLinks[0].href,/\/index\.html\?next=/,'diagnosis QR starts at the mobile student login');
    assert.doesNotMatch(qrLinks[0].href,new RegExp(encodeURIComponent(student)+'|'+student),'diagnosis QR contains no student name');
    assert.match(qrLinks[1].href,/\/index\.html\?next=/,'personal similar-question QR starts at the mobile student login');
    assert.doesNotMatch(qrLinks[1].href,new RegExp(encodeURIComponent(student)+'|'+student),'practice QR contains no student name');
    const practiceNext=new URL(qrLinks[1].href).searchParams.get('next');
    assert.match(practiceNext,/^bank\/index\.html\?practice=wrong/,'personal similar-question QR keeps the wrong-type practice destination');
    await launchPage.close();
    const practiceLaunch=await context.newPage();
    await practiceLaunch.addInitScript(()=>{localStorage.removeItem('gfield_student');sessionStorage.clear();});
    const practicePublic=new URL(qrLinks[1].href);
    await practiceLaunch.goto(`http://127.0.0.1:${server.address().port}${practicePublic.pathname}${practicePublic.search}`,{waitUntil:'domcontentloaded'});
    await practiceLaunch.locator('#name-input').fill(student);
    await practiceLaunch.evaluate(()=>doLogin());
    await practiceLaunch.waitForURL(url=>url.pathname.endsWith('/bank/index.html')&&url.searchParams.get('practice')==='wrong');
    await practiceLaunch.waitForFunction(()=>document.body.classList.contains('bank-access-granted')&&document.querySelectorAll('#final1Worksheet .qcard').length>0);
    assert.equal(await practiceLaunch.locator('#bankAccessGate').isHidden(),true,'QR login hands the student into the personal practice set without an approval-code stop');
    await practiceLaunch.close();
    if(process.env.GFIELD_FINAL_BATCH_UI_ONLY==='1'){
      assert.deepEqual(errors,[],'batch selection UI has no page errors');
      console.log('admin final batch UI validation passed: official first attempt, selection count, desktop, 390px');
      return;
    }
    const bankProbe=await context.newPage();
    await bankProbe.goto(`http://127.0.0.1:${server.address().port}/bank/index.html?practice=wrong&gens=final2-q28%2Cfinal2-q29%2Cfinal2-q30&per=3&points=all&printMode=both&source=final%7C2&sourceNos=28%2C29%2C30&seed=batch-qa&bank=final2`);
    try{await bankProbe.waitForFunction(()=>document.querySelectorAll('#final1Worksheet #f1Pages .page, #stage .page').length>0,{timeout:15000});}
    catch(error){throw new Error('유사문제 직접 준비 실패: '+(await bankProbe.locator('body').innerText()).slice(0,500));}
    assert.equal(await bankProbe.locator('#final1Worksheet .question-page .qcard, #stage .question-page .qcard').count(),9,'three similar questions per wrong item');
    assert.equal(await bankProbe.locator('#final1Worksheet .answer-page .f1-solution, #stage .answer-page .f1-solution').count(),9,'every similar question has a detailed solution in the same package');
    assert.equal(await bankProbe.locator('#final1Worksheet[data-layout="editorial"] .qcard[data-source-no="28"][data-wide="true"]').count(),3,'all route-diagram variants span the full editorial page width');
    assert.equal(await bankProbe.locator('#final1Worksheet[data-layout="editorial"] .qcard[data-source-no="28"][data-wide="true"]').evaluateAll(cards=>cards.every(card=>getComputedStyle(card).gridColumnStart==='1'&&getComputedStyle(card).gridColumnEnd==='-1')),true,'wide route-diagram cards use both editorial columns');
    assert.equal(await bankProbe.locator('#final1Worksheet[data-layout="editorial"] .f1-qpage[data-wide-lead="true"]').evaluateAll(pages=>pages.every(page=>{const cards=page.querySelectorAll('.f1-qcard');return cards.length===3&&getComputedStyle(cards[0]).gridRowStart==='2'&&getComputedStyle(cards[1]).gridRowStart==='3'&&getComputedStyle(cards[2]).gridRowStart==='3';})),true,'wide-first pages keep the two text questions in the next row');
    assert.equal(await bankProbe.locator('.answer-page').evaluateAll(pages=>pages.every(page=>page.scrollWidth<=page.clientWidth+1)),true,'solution pages never overflow or crop wide diagrams');
    await bankProbe.locator('.question-page').first().screenshot({path:path.join(qaDir,'final2-similar-question-page.png')});
    await bankProbe.addScriptTag({url:`http://127.0.0.1:${server.address().port}/vendor/html2canvas/1.4.1/html2canvas.min.js`});
    const renderedQuestion=await bankProbe.evaluate(async()=>{
      const canvas=await html2canvas(document.querySelector('.question-page'),{backgroundColor:'#ffffff',scale:1.45,useCORS:true,allowTaint:false,logging:false,imageTimeout:20000,removeContainer:true});
      return canvas.toDataURL('image/png');
    });
    fs.writeFileSync(path.join(qaDir,'final2-similar-question-canvas.png'),Buffer.from(renderedQuestion.split(',')[1],'base64'));
    await bankProbe.close();
    const result=await page.evaluate(async()=>{
      window.__GFIELD_BATCH_QA_CAPTURE__={};
      const task=window.GFIELD_ADMIN_FINAL_BATCH._test.taskList()[0];
      const blob=await window.GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task,0,1);
      const response=await fetch('/__qa_pdf',{method:'POST',body:blob});
      return {ok:response.ok,size:blob.size,type:blob.type,question:window.__GFIELD_BATCH_QA_CAPTURE__.question||'',meta:window.__GFIELD_BATCH_QA_CAPTURE__.meta||null};
    });
    assert.match(result.question,/^data:image\/png;base64,/,'actual batch build captured a question page');
    fs.writeFileSync(path.join(qaDir,'final2-actual-batch-question-canvas.png'),Buffer.from(result.question.split(',')[1],'base64'));
    fs.writeFileSync(path.join(qaDir,'final2-actual-batch-question-meta.json'),JSON.stringify(result.meta,null,2));
    assert.equal(result.ok,true);assert.ok(result.size>100000,'generated PDF is non-trivial');
    const bytes=fs.readFileSync(pdfPath);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
    assert.deepEqual(errors,[],'batch generation has no page errors');
    console.log(`admin final batch browser validation passed: one official Final 2 package, ${result.size} bytes, concise report + similar questions + solutions`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
