'use strict';
// Synthetic records and auth only. Never write production student data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='8회관리자연결검수학생';
const out=process.env.GFIELD_QA_ARTIFACT_DIR;
const ox='OOX'.repeat(10),score=require('../supabase/functions/hs-final-population/population-core.js').scoreOf(ox);
const records=[1,2].map(slot=>({student,round:'final8'+(slot===1?'':'@2'),ox,score,wrong:10,source:'admin'}));
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveProductAccess['mock-final-8']=[n];})();`;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(req.method!=='GET'||!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true}),errors=[],writes=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(name=>{
      if(!/^https?:$/.test(location.protocol))return;
      localStorage.setItem('gfield_student',name);
      localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'qa-admin',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600}));
    },student);
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===new URL(base).origin){if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'){
        if(url.pathname==='/functions/v1/hs-final-population')return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
        if(req.method()!=='GET'){writes.push(req.method()+' '+url.pathname);return route.abort();}
        const body=url.pathname==='/auth/v1/user'?{id:'qa-admin',app_metadata:{role:'admin'}}:url.pathname==='/rest/v1/hs_accounts'?[{role:'admin',active:true,student:null}]:url.pathname==='/rest/v1/mock_results'?records:[];
        return route.fulfill({json:body});
      }
      return route.abort();
    });
    context.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));
    const page=await context.newPage();
    await page.goto(base+'/admin.html');
    await page.waitForFunction(()=>window.GFIELD_ADMIN_MOCK_V2);
    await page.evaluate(name=>{loadMockResults();mkSel=name;},student);
    await page.waitForFunction(()=>typeof MK_ROWS!=='undefined'&&Array.isArray(MK_ROWS)&&MK_ROWS.some(row=>row.round==='final8'));
    await page.evaluate(()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('app').classList.remove('hidden');document.getElementById('tab-mock').classList.remove('hidden');setMockSetV2('extra');});
    await page.evaluate(()=>renderFinal7AccessMatrix());
    assert.deepEqual(await page.locator('#final7-acc-matrix tbody tr > th').allTextContents(),['최종 7회','최종 8회'],'round approvals have no obsolete hold label');
    assert.doesNotMatch(await page.locator('body').innerText(),/학생용 자료 보류|정답 충돌과 학생용 유사문제 승인이 남아/);
    assert.deepEqual(await page.evaluate(()=>window.GFIELD_DATA.archiveProductAccess['mock-final-8']),[student],'cleanup does not change approval list');
    const official=page.locator('#mock-body a').filter({hasText:'공식 1차 성적표'});
    await official.waitFor();
    const href=new URL(await official.getAttribute('href'),base);
    assert.equal(href.pathname,'/final.html');assert.equal(href.searchParams.get('round'),'8');assert.equal(href.searchParams.get('go'),'report');assert.equal(href.searchParams.get('entry'),'teacher');assert.equal(href.searchParams.get('attempt'),'1');assert.equal(href.searchParams.get('name'),student);
    const practice=page.locator('#mock-body a').filter({hasText:'연습 2차 성적표'});
    assert.equal(new URL(await practice.getAttribute('href'),base).searchParams.get('attempt'),'2');
    assert.doesNotMatch(await page.locator('#mock-body').innerText(),/상세 분석 준비 중/);
    assert.match(await page.locator('#mock-body').innerText(),/추가 모의고사6회 \(준비 중\)|추가 모의고사 6회 \(준비 중\)/);
    if(out){fs.mkdirSync(out,{recursive:true});await page.locator('#mock-body').screenshot({path:path.join(out,'admin-final8-linked.png')});}
    const reportWait=page.waitForEvent('popup');await official.click();const report=await reportWait;
    await report.locator('#wrongPractice .wp-item').first().waitFor({timeout:30000});
    assert.equal(await report.locator('#wrongPractice .wp-item').count(),10);
    assert.deepEqual(await report.locator('#wrongPractice .wp-item').evaluateAll(rows=>rows.map(row=>Number(row.dataset.wpNo))),[3,6,9,12,15,18,21,24,27,30]);
    const bankWait=report.waitForEvent('popup');await report.locator('#wpStart').click();const bank=await bankWait;
    const bankUrl=new URL(bank.url());assert.equal(bankUrl.searchParams.get('bank'),'final8');assert.equal(bankUrl.searchParams.get('source'),'final|8');
    await bank.locator('#final1Worksheet #f1Pages .page').first().waitFor({timeout:30000});
    await bank.waitForFunction(()=>document.getElementById('btnPrint')&&!document.getElementById('btnPrint').disabled);
    assert.ok(await bank.locator('#final1Worksheet #f1Pages .page').count()>0);
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:true,base,officialAndPractice:true,wrongTypes:10,bank:'final8',productionWrites:0}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
