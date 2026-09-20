'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const student='성적검수학생';
const actualData=fs.readFileSync(path.join(root,'data.js'),'utf8');
const dataAddon=`\n;(function(){
  var d=window.GFIELD_DATA;
  d.students=d.students||[];if(d.students.indexOf(${JSON.stringify(student)})<0)d.students.push(${JSON.stringify(student)});
  d.archiveAccess=d.archiveAccess||{};
  ['중급 모의고사','파이널 모의고사','최종 모의고사'].forEach(function(key){d.archiveAccess[key]=d.archiveAccess[key]||[];if(d.archiveAccess[key].indexOf(${JSON.stringify(student)})<0)d.archiveAccess[key].push(${JSON.stringify(student)});});
  d.archiveProductAccess=d.archiveProductAccess||{};d.archiveProductAccess['mock-final-7']=[${JSON.stringify(student)}];
  d.studentTypes=d.studentTypes||{};d.studentTypes[${JSON.stringify(student)}]='online';
})();`;

function ox(correct){return 'O'.repeat(correct)+'X'.repeat(30-correct);}
function scoreOf(value){
  let score=0,wrong=0;
  [...value].forEach((answer,index)=>{if(answer==='X')wrong++;else score+=index<12?2.7:(index<22?3.4:4.2);});
  return {score:Math.round(score*10)/10,wrong};
}
function row(round,correct,updated){const value=ox(correct),score=scoreOf(value);return {student,round,ox:value,score:score.score,wrong:score.wrong,source:'admin',updated_at:updated};}
const records=[
  row('1',11,'2026-07-01T00:00:00Z'),
  row('8',30,'2026-07-02T00:00:00Z'),
  row('hw1',13,'2026-07-08T00:00:00Z'),
  row('final1',15,'2026-09-01T00:00:00Z'),
  row('final2',18,'2026-09-08T00:00:00Z'),
  row('final7',7,'2026-09-20T00:00:00Z'),
  row('last2',20,'2026-10-08T00:00:00Z'),
  row('original1',17,'2026-11-01T00:00:00Z'),
  Object.assign(row('final1@2',30,'2026-09-02T00:00:00Z'),{source:'practice-student'}),
  {student,round:'final3',ox:'RESET',score:0,wrong:0,source:'reset',updated_at:'2026-09-15T00:00:00Z'},
  Object.assign(row('final4',5,'2026-09-22T00:00:00Z'),{score:99})
];

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  const type={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',type);
  if(url.pathname==='/data.js')return res.end(actualData+dataAddon);
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch(executablePath?{executablePath}:{});
  const mockResultMethods=[],errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.route(/^https?:\/\//,async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'&&url.pathname==='/rest/v1/mock_results'){
        mockResultMethods.push(request.method());
        assert.equal(url.searchParams.get('student'),'eq.'+student,"only the logged-in student's rows are requested");
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(records)});
      }
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'&&url.pathname==='/rest/v1/access_log')return route.fulfill({status:204,body:''});
      return route.abort();
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    if(await page.locator('#skipBtn').count())await page.locator('#skipBtn').click();
    await page.locator('#name-input').fill(student);await page.locator('.enter').click();
    const hub=page.locator('#student-result-hub');await hub.locator('.srh-summary').filter({hasText:'응시 7회'}).waitFor();
    assert.equal(await hub.locator('.srh-banner').getAttribute('aria-expanded'),'false','result table starts collapsed');
    assert.equal(await hub.locator('tbody tr').count(),7,'all seven valid first attempts, including Final 7, are shown');
    assert.deepEqual(mockResultMethods,['GET'],'the result hub never writes grades');
    await hub.locator('.srh-banner').click();
    assert.equal(await hub.locator('.srh-banner').getAttribute('aria-expanded'),'true');
    assert.ok(await hub.locator('.srh-panel').isVisible());
    const final1=hub.locator('tbody tr',{hasText:'파이널 모의고사 1회'});
    const final1Score=scoreOf(ox(15)).score;
    const expectedFinal1=await page.evaluate(score=>window.GFIELD_STUDENT_RESULT_HUB._test.percentileFromTable(score,window.GFIELD_MOCK_FINAL.rounds['1'].stats.percentileTable),final1Score);
    assert.match(await final1.innerText(),new RegExp(expectedFinal1.toFixed(1)+'%'));
    assert.match(await final1.locator('a').getAttribute('href'),/^final\.html\?round=1&go=report&name=/);
    assert.equal(await final1.locator('a').innerText(),'상세 분석·유사문제');
    const middle1=hub.locator('tbody tr',{hasText:'중급 모의고사 1회'});
    assert.match(await middle1.locator('a').getAttribute('href'),/^mock\.html\?round=1&go=report&name=/);
    assert.equal(await middle1.locator('a').innerText(),'상세 분석·복습문제');
    assert.equal(await hub.locator('tbody tr',{hasText:'중급 모의고사 8회'}).count(),0,'구매하지 않은 중급 회차는 기존 기록이 있어도 숨긴다');
    const last2=hub.locator('tbody tr',{hasText:'최종 모의고사 2회'});
    assert.match(await last2.innerText(),/\d+\.\d%/);
    assert.match(await last2.locator('a').getAttribute('href'),/^final\.html\?set=last&round=2&go=report&name=/);
    const final7=hub.locator('tbody tr',{hasText:'최종 실전 모의고사 7회'});
    assert.equal(await final7.count(),1,'Final 7 appears in this-week result hub');
    assert.match(await final7.innerText(),/\d+\.\d%/,'Final 7 uses the verified process percentile');
    assert.match(await final7.locator('a').getAttribute('href'),/^final\.html\?round=7&go=report&name=.*&v=20260920b$/,'Final 7 opens its own cache-safe report, not Last 2');
    for(const title of ['중급 모의고사 1회','활용 모의고사 1회','시그니처 실전 1회']){
      assert.match(await hub.locator('tbody tr',{hasText:title}).innerText(),/자료 없음/,'unsupported rank data is not invented');
    }
    assert.doesNotMatch(await hub.innerText(),/응시\s*인원|전체\s*\d+명|\d+명\s*중|null%|NaN|undefined/);
    if(process.env.GFIELD_RESULT_HUB_QA_DIR){
      fs.mkdirSync(process.env.GFIELD_RESULT_HUB_QA_DIR,{recursive:true});
      await hub.screenshot({path:path.join(process.env.GFIELD_RESULT_HUB_QA_DIR,'student-result-hub-desktop.png')});
    }
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'result hub fits 390px without horizontal overflow');
    assert.equal(await hub.locator('.srh-detail').count(),7);
    if(process.env.GFIELD_RESULT_HUB_QA_DIR){
      await hub.screenshot({path:path.join(process.env.GFIELD_RESULT_HUB_QA_DIR,'student-result-hub-390.png')});
    }
    assert.deepEqual(errors,[],'student result hub has no browser errors');
    console.log('student result hub browser validation passed: 7 official first attempts including Final 7, score/percentile/grade, routes, 390px, zero result writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
