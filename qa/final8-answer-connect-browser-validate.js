'use strict';
// Synthetic student; all external data calls are mocked. No production writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),student='답안연결검수학생',denied='미승인검수학생';
const artifactDir=process.env.GFIELD_QA_ARTIFACT_DIR||'';
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+',z='+JSON.stringify(denied)+';d.students.push(n,z);d.studentTypes[n]="resident";d.studentTypes[z]="resident";d.archiveProductAccess["mock-final-8"]=[n];d.attendance[n]=[];d.attendance[z]=[];})();';
const model={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'),model);
const answers=model.window.GFIELD_MOCK_FINAL.rounds['8'].items;
const ox=Array.from({length:30},(_,i)=>i%3?'O':'X').join('');
const record={student,round:'final8',ox,score:require('../supabase/functions/hs-final-population/population-core.js').scoreOf(ox),wrong:10,source:'admin'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900}}),writes=[],errors=[];
  await context.addInitScript(name=>{localStorage.setItem('gfield_student',name);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));window.print=()=>{window.__qaPrintCalls=(window.__qaPrintCalls||0)+1;window.__qaPrintAnswerRows=[...document.querySelectorAll('[data-answer-no]')].filter(row=>row.getClientRects().length&&getComputedStyle(row).visibility!=='hidden').length;};},student);
  await context.route(/^https?:\/\//,route=>{
    const request=route.request(),u=new URL(request.url());
    if(u.origin===new URL(base).origin){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
    if(u.pathname==='/rest/v1/mock_results'){if(request.method()!=='GET')writes.push(request.method()+' '+u.pathname);return route.fulfill({json:[record]});}
    if(u.pathname.endsWith('/hs-final-population'))return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
    if(!['GET','HEAD','OPTIONS'].includes(request.method())&&u.pathname!=='/rest/v1/access_log')writes.push(request.method()+' '+u.pathname);
    if(/fonts\.googleapis\.com|cdn\.jsdelivr\.net/.test(u.hostname))return route.fulfill({contentType:'text/css',body:''});
    return route.fulfill({json:[]});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  try{
    const suffix='&name='+encodeURIComponent(student);
    await page.goto(base+'/final.html?round=8&go=report'+suffix);
    await page.locator('.report-screen-header').waitFor({timeout:30000});
    const answerLink=page.locator('.report-answer-link');
    assert.equal(await answerLink.isVisible(),true);
    const href=new URL(await answerLink.getAttribute('href'),base);
    assert.equal(href.pathname,'/answer.html');assert.equal(href.searchParams.get('set'),'final');assert.equal(href.searchParams.get('round'),'8');assert.equal(href.searchParams.get('name'),student);
    const section=page.locator('#detailedAnswersSection');
    assert.equal(await section.locator('[data-answer-no]').count(),30);
    await section.locator('summary').click();
    for(const item of answers)assert.equal(await section.locator('[data-answer-no="'+item.no+'"] td').nth(2).innerText(),item.answer);
    assert.equal(await section.locator('[data-answer-no="20"]').isVisible(),true);
    assert.match(await section.locator('[data-solution-no="20"]').innerText(),/병호에게 4개.*태영에게 3개/);
    assert.equal(await page.locator('#printBtn').isVisible(),true,'summary print button survives answer action');
    if(artifactDir){fs.mkdirSync(artifactDir,{recursive:true});await section.screenshot({path:path.join(artifactDir,'final8-report-answers-desktop.png')});}
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'report has no mobile document overflow');
    if(artifactDir)await section.screenshot({path:path.join(artifactDir,'final8-report-answers-mobile.png')});
    await page.emulateMedia({media:'print'});
    assert.equal(await section.locator('[data-answer-no="20"]').isVisible(),false,'concise diagnostic print remains distinct from the separate answer sheet');
    await page.emulateMedia({media:'screen'});
    await page.locator('#gfield-full-print-btn').click();
    await page.emulateMedia({media:'print'});
    await page.waitForFunction(()=>window.__qaPrintCalls===1);
    assert.equal(await page.evaluate(()=>window.__qaPrintAnswerRows),30,'full diagnostic print includes all thirty canonical answers');
    await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
    await page.emulateMedia({media:'screen'});
    await answerLink.click();await page.locator('#content:not(.hidden)').waitFor();
    assert.equal(new URL(page.url()).pathname,'/answer.html');assert.equal(await page.locator('#body tr').count(),30);
    for(const item of answers)assert.equal(await page.locator('#body tr').nth(item.no-1).locator('.ans').innerText(),item.answer.replace(/−/g,'-'));
    assert.match(await page.locator('#ttl').innerText(),/최종 실전.*8회/);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'answer sheet has no mobile document overflow');
    assert.ok(await page.locator('.answer-table-scroll').evaluate(el=>el.scrollWidth>el.clientWidth),'mobile answer table can scroll');
    await page.getByRole('button',{name:/인쇄/}).click();assert.equal(await page.evaluate(()=>window.__qaPrintCalls),1);
    if(artifactDir){await page.screenshot({path:path.join(artifactDir,'final8-answer-mobile.png')});await page.setViewportSize({width:1280,height:900});await page.screenshot({path:path.join(artifactDir,'final8-answer-desktop.png'),fullPage:true});await page.pdf({path:path.join(artifactDir,'final8-answers.pdf'),preferCSSPageSize:true,printBackground:true});}
    await page.goto(base+'/answer.html?set=final&round=8&name='+encodeURIComponent(denied));
    await page.locator('#gate:not(.hidden)').waitFor();assert.equal(await page.locator('#content:not(.hidden)').count(),0);
    await page.goto(base+'/final.html?round=8&go=answer'+suffix);
    await page.locator('#app').waitFor();await page.waitForFunction(()=>document.getElementById('app').innerText.includes('8회'));
    assert.equal(await page.locator('.report-answer-table').count(),0,'O/X entry does not expose the answer table');
    await page.goto(base+'/index.html');
    if(await page.locator('#skipBtn').isVisible())await page.locator('#skipBtn').click();
    await page.locator('#dashboard:not(.hidden)').waitFor();
    await page.evaluate(()=>{nav('archive');openBook(window.GFIELD_DATA.books.find(book=>book.accessKey==='mock-final-8'));});
    const libraryAnswer=page.locator('#bv-actions a[href*="answer.html"][href*="round=8"]');
    await libraryAnswer.waitFor();
    const popupWait=page.waitForEvent('popup');await libraryAnswer.click();const popup=await popupWait;
    await popup.locator('#content:not(.hidden)').waitFor();
    assert.equal(new URL(popup.url()).pathname,'/answer.html');assert.equal(await popup.locator('#body tr').count(),30,'actual library answer action opens the answer sheet');
    await popup.close();
    assert.equal(writes.length,0,'no external writes');assert.deepEqual(errors,[],'no browser errors');
    console.log(JSON.stringify({pass:true,base,answerRows:30,q20:'4/3',reportAndSheet:true,mobile:true,print:true,deniedBlocked:true,productionWrites:0}));
  }catch(error){console.error('Synthetic view:',(await page.locator('#app').innerText().catch(()=>'')).slice(0,800));console.error('Browser errors:',errors);throw error;}
  finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
