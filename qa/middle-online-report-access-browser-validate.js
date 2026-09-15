'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const student='온라인중급검수학생';
const outputDir=process.env.GFIELD_MIDDLE_QA_DIR?path.resolve(root,process.env.GFIELD_MIDDLE_QA_DIR):'';
if(outputDir)fs.mkdirSync(outputDir,{recursive:true});
const actualData=fs.readFileSync(path.join(root,'data.js'),'utf8');
const dataAddon=`\n;(function(){
  var d=window.GFIELD_DATA;
  d.students=d.students||[];d.students.push(${JSON.stringify(student)});
  d.studentTypes=d.studentTypes||{};d.studentTypes[${JSON.stringify(student)}]='online';
  d.archiveAccess=d.archiveAccess||{};d.archiveAccess['중급 모의고사']=[${JSON.stringify(student)}];
})();`;
const records=[
  {student,round:'2',ox:'O'.repeat(30),score:100,wrong:0,source:'online',updated_at:'2026-09-15T00:00:00.000Z'},
  {student,round:'8',ox:'X'.repeat(30),score:0,wrong:30,source:'online',updated_at:'2026-09-15T01:00:00.000Z'}
];
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  if(url.pathname==='/data.js')return res.end(actualData+dataAddon);
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch(executablePath?{executablePath}:{});
  const methods=[],queries=[],errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.route(/^https?:\/\//,async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.pathname==='/rest/v1/mock_results'){
        methods.push(request.method());queries.push(url.searchParams.get('student'));
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(records)});
      }
      return route.abort();
    });
    const base=`http://127.0.0.1:${server.address().port}`;
    const report=await context.newPage();report.on('pageerror',error=>errors.push(error.message));
    await report.goto(`${base}/mock.html?round=2&go=report&name=${encodeURIComponent(student)}`);
    await report.locator('.card',{hasText:'분석 결과'}).first().waitFor();
    assert.match(await report.locator('#main').innerText(),/2회.*분석 결과/);
    assert.match(await report.locator('#main').innerText(),/100\s*점 \/ 100점/);
    assert.equal(await report.locator('.qgrid').count(),0,'saved report does not reopen answer input');
    assert.equal(await report.locator('.middle-review-practice').count(),1,'purchased round report includes its review practice material');
    assert.equal(await report.locator('.middle-review-practice a',{hasText:'인쇄용 복습 문제'}).count(),1);
    if(outputDir)await report.screenshot({path:path.join(outputDir,'middle-round2-report-desktop.png'),fullPage:true});

    const picker=await context.newPage();picker.on('pageerror',error=>errors.push(error.message));
    await picker.goto(`${base}/mock.html?name=${encodeURIComponent(student)}`);
    await picker.locator('.round-card').first().waitFor();
    assert.equal(await picker.locator('.round-card').count(),4,'online 1-4 product shows four purchased rounds');
    assert.deepEqual(await picker.locator('.round-card .rn').allTextContents(),['1회','2회','3회','4회']);
    assert.doesNotMatch(await picker.locator('#main').innerText(),/중급 8회/);
    await picker.setViewportSize({width:390,height:844});
    assert.ok(await picker.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(outputDir)await picker.screenshot({path:path.join(outputDir,'middle-purchased-rounds-mobile.png'),fullPage:true});

    const denied=await context.newPage();denied.on('pageerror',error=>errors.push(error.message));
    await denied.goto(`${base}/mock.html?round=8&go=report&name=${encodeURIComponent(student)}`);
    await denied.getByText('이용할 수 없는 회차입니다',{exact:true}).waitFor();
    assert.equal(await denied.locator('.qgrid').count(),0,'unowned direct round never opens answer input');
    assert.deepEqual(Array.from(new Set(methods)),['GET'],'student report flow never writes grades');
    assert.ok(queries.every(value=>value==='eq.'+student),'only the current student result is requested');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:true,visibleRounds:[1,2,3,4],savedRound2Report:true,directRound8Blocked:true,resultWrites:0}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
