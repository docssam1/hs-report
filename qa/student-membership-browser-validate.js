'use strict';
// Every external request is intercepted. Only synthetic accounts are changed.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='회원상태검수학생',out=process.env.GFIELD_QA_ARTIFACT_DIR;
const source=fs.readFileSync(path.join(root,'data.js'),'utf8'),sandbox={window:{}};
vm.runInNewContext(source,sandbox);
const initial=JSON.parse(JSON.stringify(sandbox.window.GFIELD_DATA));
initial.students.push(student);initial.studentTypes[student]='resident';
initial.attendance[student]=['sep-w4'];initial.reports[student]={comment:'보존할 코멘트'};
initial.archiveProductAccess['mock-final-8']=['*'];initial.archiveProductAccess['mock-signature-2']=['*'];
initial.archiveAccess['파이널 모의고사']=['*'];initial.archiveAccess['최종 모의고사']=['*'];
let published=JSON.parse(JSON.stringify(initial)),account={student,active:true},hasAccount=true,failSave=false,actions=[],puts=0,externalWrites=0;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(req.method!=='GET'||!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
  const errors=[];
  async function context(options={}){
    const c=await browser.newContext({viewport:options.mobile?{width:390,height:844}:{width:1365,height:900}});
    await c.addInitScript(({student,staff})=>{
      window.__GFIELD_BANK_ACCESS_FORCE__=true;
      if(location.origin==='null')return;
      localStorage.setItem('gfield_student',student);
      localStorage.setItem('gfield_question_bank_launch_v1',JSON.stringify({product:'question-bank',student,issuedAt:Date.now()}));
      sessionStorage.setItem('gfield_question_bank_handoff_v1',JSON.stringify({product:'question-bank',student,issuedAt:Date.now()}));
      if(staff){localStorage.setItem('gfield_gh_token','synthetic-token');localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'synthetic',refresh_token:'synthetic',expires_at:Math.floor(Date.now()/1000)+3600}));}
    },{student,staff:!!options.staff});
    await c.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===base){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA = '+JSON.stringify(published)+';'});
        return route.continue();
      }
      if(url.hostname==='api.github.com'){
        if(req.method()==='GET')return route.fulfill({json:{sha:'synthetic-sha',content:Buffer.from('window.GFIELD_DATA = '+JSON.stringify(published)+';').toString('base64')}});
        if(req.method()==='PUT'){
          if(failSave)return route.fulfill({status:503,json:{error:'synthetic failure'}});
          const body=JSON.parse(req.postData()),scope={window:{}};
          assert.equal(body.sha,'synthetic-sha');vm.runInNewContext(Buffer.from(body.content,'base64').toString('utf8'),scope);
          const next=JSON.parse(JSON.stringify(scope.window.GFIELD_DATA));
          const before=JSON.parse(JSON.stringify(published));before.studentTypes=next.studentTypes;
          assert.deepEqual(next,before,'only studentTypes changes in latest remote file');published=next;puts++;
          return route.fulfill({json:{commit:{sha:'synthetic-new-sha'}}});
        }
      }
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'){
        if(url.pathname==='/auth/v1/user')return route.fulfill({json:{id:'synthetic-admin',app_metadata:{role:'admin'}}});
        if(url.pathname==='/functions/v1/hs-approval-admin'){
          const body=JSON.parse(req.postData());assert.equal(body.student||student,student);
          if(body.action==='list')return route.fulfill({json:{accounts:hasAccount?[account]:[]}});
          assert.equal(body.action,'setAccess');actions.push(body.active);account.active=body.active;
          return route.fulfill({json:{account}});
        }
        return route.fulfill({json:[]});
      }
      if(req.method()!=='GET')externalWrites++;
      return route.abort();
    });
    c.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));
    return c;
  }
  try{
    const adminContext=await context({staff:true}),page=await adminContext.newPage();
    await page.goto(base+'/admin.html');await page.waitForFunction(()=>!document.getElementById('app').classList.contains('hidden'));
    await page.evaluate(()=>tab('students'));
    const toggle=page.locator('#student-chips .chip').filter({hasText:student}).locator('.membership-toggle');
    await toggle.click();assert.equal(await toggle.textContent(),'온라인');assert.equal(puts,0);
    page.once('dialog',d=>d.dismiss());await toggle.click();assert.equal(await toggle.textContent(),'온라인');assert.equal(actions.length,0);
    // Unsaved form edits must never hitch a ride on the membership save.
    await page.evaluate(()=>{S.meta.title='저장하면 안 되는 임시 제목';dirty();});
    published.meta.remoteSentinel='다른 관리자의 최신 내용';
    const before=JSON.parse(JSON.stringify(published));
    page.once('dialog',d=>d.accept());await toggle.click();await page.waitForFunction(()=>!membershipBusy);
    assert.equal(await toggle.textContent(),'퇴원생');assert.equal(published.studentTypes[student],'withdrawn');assert.equal(account.active,false);
    assert.equal(published.meta.title,before.meta.title);assert.equal(published.meta.remoteSentinel,before.meta.remoteSentinel);
    assert.deepEqual(published.reports,before.reports);assert.deepEqual(published.attendance,before.attendance);
    assert.deepEqual(published.archiveProductAccess,before.archiveProductAccess);
    assert.match(await page.locator('#matrix').innerText(),/퇴원생 1명/);
    assert.match(await page.locator('#save-status').innerText(),/저장되지 않은/);
    if(out){fs.mkdirSync(out,{recursive:true});await page.locator('#tab-students').screenshot({path:path.join(out,'withdrawn-desktop.png')});await page.setViewportSize({width:390,height:844});await page.locator('#tab-students').screenshot({path:path.join(out,'withdrawn-mobile.png')});}
    page.once('dialog',d=>d.accept());await toggle.click();await page.waitForFunction(()=>!membershipBusy);
    assert.equal(await toggle.textContent(),'재원생');assert.equal(account.active,true);assert.equal(published.studentTypes[student],undefined);
    assert.deepEqual(actions,[false,true]);
    await toggle.click();failSave=true;let dialogs=0;
    page.on('dialog',async d=>{dialogs++;await d.accept();});await toggle.click();await page.waitForFunction(()=>!membershipBusy);
    assert.equal(await toggle.textContent(),'온라인');assert.equal(account.active,true);assert.equal(published.studentTypes[student],undefined);assert.equal(dialogs,2);
    assert.deepEqual(actions,[false,true,false,true]);
    failSave=false;hasAccount=false;await toggle.click();await page.waitForFunction(()=>!membershipBusy);
    assert.equal(await toggle.textContent(),'퇴원생');assert.deepEqual(actions,[false,true,false,true]);
    // Old stored login, direct report/answer and problem-bank entry must all deny.
    const studentContext=await context(),home=await studentContext.newPage();await home.goto(base+'/index.html');
    await home.waitForFunction(()=>document.getElementById('toast').textContent.includes('접속이 정지'));
    assert.equal(await home.locator('#dashboard').isVisible(),false);
    assert.equal(await home.evaluate(()=>localStorage.getItem('gfield_student')),null);
    assert.equal(await home.evaluate(()=>sessionStorage.getItem('gfield_question_bank_handoff_v1')),null);
    await home.locator('#name-input').fill(student);await home.evaluate(()=>doLogin());assert.equal(await home.locator('#dashboard').isVisible(),false);
    const report=await studentContext.newPage();await report.goto(base+'/final.html?set=original&round=2&name='+encodeURIComponent(student));
    await report.locator('#gname').waitFor();await report.locator('#gname').fill(student);await report.locator('#genter').click();assert.match(await report.locator('#gerr').innerText(),/열람 권한이 없습니다/);
    const answer=await studentContext.newPage();await answer.goto(base+'/answer.html?set=final&round=8&name='+encodeURIComponent(student));
    await answer.waitForFunction(()=>typeof allowed==='function');assert.equal(await answer.evaluate(n=>allowed(n),student),false);assert.equal(await answer.locator('#content').isVisible(),false);
    const mock=await studentContext.newPage();await mock.goto(base+'/mock.html?name='+encodeURIComponent(student));
    await mock.waitForFunction(()=>typeof enter==='function');await mock.locator('#pw').fill(student);await mock.evaluate(()=>enter());assert.match(await mock.locator('#gate-err').innerText(),/접속이 정지/);assert.equal(await mock.locator('#app').isVisible(),false);
    const bank=await studentContext.newPage();await bank.goto(base+'/bank/index.html?bank=original2&from=archive&name='+encodeURIComponent(student));
    await bank.waitForFunction(()=>window.GFIELD_BANK_ACCESS);assert.equal(await bank.evaluate(n=>GFIELD_BANK_ACCESS.allowed({student:n,role:'student',active:true}),student),false);
    assert.equal(await bank.evaluate(()=>GFIELD_BANK_ACCESS.allowed({student:null,role:'admin',active:true})),true);
    assert.equal(await home.evaluate(n=>GFIELD_FINAL_LAST_ROUTES.accessAllowed(D,n,'final',8),student),false);
    assert.equal(await home.evaluate(n=>GFIELD_MIDDLE_ACCESS.allowsRound(D,n,1,{rounds:{1:{}}}),student),false);
    await bank.locator('#bankAccessStatus.error').waitFor();
    assert.equal(externalWrites,0);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:true,cycle:true,cancel:true,rollback:true,noAccount:true,recordsPreserved:true,narrowSave:true,nameAndSavedLoginBlocked:true,reportAnswerBankBlocked:true,staffAccessPreserved:true,productionWrites:0,syntheticSaves:puts}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
