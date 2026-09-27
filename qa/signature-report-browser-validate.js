'use strict';

// Synthetic, private-data-free browser and print gate for the Signature report.
// learner-fit: learner_stage=초등 2학년 선발 대비; language=short action phrases;
// representations=score cards and seven-day list; prerequisites=read a question;
// reasoning-load=one exam action at a time; response-mode=teacher-authored note.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.GFIELD_QA_OUTPUT_DIR||'';
const student='QA 검증학생';
const records=[
  {student,round:'original1',ox:'O'.repeat(30),score:100,wrong:0,source:'admin'},
  {student,round:'original2',ox:'O'.repeat(29)+'X',score:95.8,wrong:1,source:'admin'},
  {student,round:'original2@2',ox:'X'.repeat(30),score:0,wrong:30,source:'practice-admin'},
];
const makeSession=role=>({access_token:'qa-'+role,refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'qa-'+role,app_metadata:{role}}});
const comments={original1:'',original2:''};
const writes=[];
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
  const filename=path.resolve(ROOT,'.'+pathname);
  if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
  if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}
  const ext=path.extname(filename);
  const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf'}[ext]||'application/octet-stream';
  response.writeHead(200,{'content-type':mime+'; charset=utf-8','cache-control':'no-store'});
  fs.createReadStream(filename).pipe(response);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    async function contextFor(role,width){
      const context=await browser.newContext({viewport:{width,height:900}});
      const session=makeSession(role);
      await context.addInitScript(({role,session,student})=>{
        localStorage.setItem(role==='admin'?'gfield_hs_admin_session_v1':'gfield_hs_student_session_v1',JSON.stringify(session));
        localStorage.setItem('gfield_student',student);
      },{role,session,student});
      await context.route('**/data.js*',route=>{
        const source=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
        route.fulfill({status:200,contentType:'text/javascript',body:source+'\nwindow.GFIELD_DATA.students.push('+JSON.stringify(student)+');window.GFIELD_DATA.archiveProductAccess["mock-signature-1"].push('+JSON.stringify(student)+');window.GFIELD_DATA.archiveProductAccess["mock-signature-2"].push('+JSON.stringify(student)+');'});
      });
      await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
      await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
      await context.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/woff2',body:''}));
      await context.route('https://fgahqumaldheqettmvqg.supabase.co/**',async route=>{
        const request=route.request(),url=request.url();
        let body={};try{body=request.postDataJSON()||{};}catch{}
        if(url.includes('/auth/v1/user'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session.user)});
        if(url.includes('/rest/v1/mock_results')){
          if(request.method()!=='GET'){
            writes.push({kind:'grade',method:request.method(),body});
            if(request.method()==='POST'&&body.round==='original2@3')records.push(body);
          }
          return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(records)});
        }
        if(url.includes('/rest/v1/weak_types'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
        if(url.includes('/functions/v1/hs-final-population')){
          if(body.action==='read-report')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({canEdit:role==='admin',comment:comments[body.exam]||'',commentUpdatedAt:comments[body.exam]?'qa-version':null,snapshot:null,resultOx:null})});
          if(body.action==='save-comment'){
            assert.equal(role,'admin');assert.ok(body.exam==='original1'||body.exam==='original2');
            writes.push({kind:'comment',exam:body.exam});comments[body.exam]=body.comment;
            return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({comment:comments[body.exam],updatedAt:'qa-version'})});
          }
        }
        return route.abort();
      });
      return context;
    }
    const base='http://127.0.0.1:'+server.address().port+'/final.html?set=original&round=2&go=report&attempt=1&name='+encodeURIComponent(student);
    const teacher=await contextFor('admin',1280),page=await teacher.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await page.locator('.original-summary .cumulative-grid').waitFor();
    assert.match(await page.locator('.cumulative-grid').innerText(),/1회 성적[\s\S]*100점[\s\S]*2회 성적[\s\S]*95\.8점[\s\S]*누적 성적[\s\S]*97\.9점/);
    assert.match(await page.locator('.exam-skill-tips').innerText(),/타이머는 현재 속도를 살피는 신호/);
    assert.equal(await page.locator('[data-docssam-field]').count(),7);
    await page.locator('[data-docssam-field="strength"]').fill('문제 조건을 끝까지 읽고 식으로 옮긴다.');
    await page.locator('[data-docssam-field="recommendation"]').fill('막히면 번호를 표시하고 다음 문제 뒤 다시 돌아온다.');
    await page.locator('[data-docssam-field="examStrategy"]').fill('타이머는 속도 확인용으로만 활용한다.');
    await page.locator('#docssam-comment-save').click();
    await page.locator('#docssam-comment-status').getByText('저장했습니다.').waitFor();
    assert.match(await page.locator('.docssam-summary').innerText(),/타이머는 속도 확인용/);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.docssam-summary').waitFor();
    assert.match(await page.locator('[data-docssam-field="strength"]').inputValue(),/문제 조건을 끝까지/);
    if(OUT){fs.mkdirSync(OUT,{recursive:true});await page.screenshot({path:path.join(OUT,'signature-round2-desktop.png'),fullPage:true});}
    await page.goto(base.replace('round=2','round=1')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await page.locator('[data-docssam-field="strength"]').waitFor();
    assert.equal(await page.locator('[data-docssam-field="strength"]').inputValue(),'','1회 코멘트는 2회 코멘트와 분리된다');
    await page.locator('[data-docssam-field="strength"]').fill('1회에서 확인한 장점');
    await page.locator('#docssam-comment-save').click();
    await page.locator('#docssam-comment-status').getByText('저장했습니다.').waitFor();
    assert.match(await page.locator('.docssam-summary').innerText(),/1회에서 확인한 장점/);
    assert.deepEqual(errors,[]);
    await teacher.close();

    const mobile=await contextFor('student',390),phone=await mobile.newPage(),mobileErrors=[];
    phone.on('pageerror',e=>mobileErrors.push(e.message));
    await phone.goto(base,{waitUntil:'domcontentloaded'});
    await phone.locator('.docssam-summary').waitFor();
    assert.equal(await phone.locator('[data-docssam-field]').count(),0,'student cannot edit teacher comment');
    assert.match(await phone.locator('.report-docssam-note').innerText(),/풀이 습관|장점/);
    assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px report does not overflow horizontally');
    if(OUT){
      fs.mkdirSync(OUT,{recursive:true});
      await phone.screenshot({path:path.join(OUT,'signature-round2-mobile.png'),fullPage:true});
      await phone.evaluate(()=>document.body.classList.add('print-original-summary'));
      const pdf=await phone.pdf({format:'A4',printBackground:true});
      assert.ok(pdf.length>10000,'summary A4 PDF is non-empty');
      fs.writeFileSync(path.join(OUT,'signature-round2-summary.pdf'),pdf);
      await phone.evaluate(()=>document.body.classList.remove('print-original-summary'));
    }
    assert.deepEqual(mobileErrors,[]);
    assert.deepEqual(writes,[{kind:'comment',exam:'original2'},{kind:'comment',exam:'original1'}],'viewing and printing do not write grades');
    await mobile.close();
    const entryContext=await contextFor('admin',390),entry=await entryContext.newPage();
    await entry.goto(base.replace('go=report','go=answer')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await entry.locator('#signatureStateGrid select').first().waitFor();
    assert.equal(await entry.locator('#signatureStateGrid select').count(),30);
    assert.match(await entry.locator('#signatureCount').innerText(),/선택 전 30/);
    await entry.locator('#btnGrade').click();
    assert.match(await entry.locator('#signatureCount').innerText(),/선택 전 30개/);
    assert.equal(writes.filter(x=>x.kind==='grade').length,0,'unentered answers cannot save');
    await entry.evaluate(()=>document.querySelectorAll('#signatureStateGrid select').forEach(select=>{select.value='O';select.dispatchEvent(new Event('change',{bubbles:true}));}));
    await entry.locator('#signatureStateGrid select').nth(0).selectOption('X');
    await entry.locator('#signatureStateGrid select').nth(1).selectOption('-');
    await entry.locator('#signatureStateGrid select').nth(2).selectOption('?');
    await entry.locator('#btnGrade').click();
    assert.equal(writes.filter(x=>x.kind==='grade').length,0,'uncertain answers cannot save');
    await entry.locator('#signatureStateGrid select').nth(2).selectOption('O');
    await entry.locator('#btnGrade').click();
    await entry.locator('.original-summary').waitFor();
    const gradeWrites=writes.filter(x=>x.kind==='grade');
    assert.equal(gradeWrites.length,1);
    assert.equal(gradeWrites[0].body.answer_states,'X-'+'O'.repeat(28));
    assert.equal(gradeWrites[0].body.ox,'XX'+'O'.repeat(28));
    assert.match(await entry.locator('.original-summary').innerText(),/틀림 1개 · 미응답 1개/);
    assert.ok(await entry.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px answer and report do not overflow');
    await entry.goto(base.replace('attempt=1','attempt=3')+'&entry=teacher',{waitUntil:'domcontentloaded'});
    await entry.locator('.original-summary').waitFor();
    assert.match(await entry.locator('.original-summary').innerText(),/틀림 1개 · 미응답 1개/,'saved blank status survives reload');
    assert.match(await entry.locator('.original-report').innerText(),/2번[\s\S]*미응답/,'detail table separates blank from wrong');
    await entryContext.close();
    console.log('PASS Signature 1/2/cumulative report, separate Docssam comments/save/reload/student view, 390px, A4 summary PDF, grade-write zero, learner-fit 초등 2학년 선발 대비');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
