'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'E:/Codex/tooling/elementary-playwright/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/bank-existing-links-20261016/qa-status'),student='유사문제연결검수학생';
const codes=['final1','final2','final3','final4','final7','final8','last1','last2','last3','last4','original1','original2','7','8'];
let attempts=[],denySignature=false,failFinal4=false;
const evidence={cases:[],browserErrors:[],writes:[],externalActualWrites:0};
const fixture=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";for(const k of ["파이널 모의고사","최종 모의고사","중급 모의고사","활용 모의고사"])d.archiveAccess[k]=[n];for(const k of ["mock-final-7","mock-final-8","mock-mid-7","mock-mid-8","mock-signature-1","mock-signature-2"])d.archiveProductAccess[k]=[n];})();';
const server=http.createServer((req,res)=>{
  if(req.method!=='GET'){evidence.writes.push(req.method);res.writeHead(405);return res.end();}
  const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
function row(round){return {student,round,ox:'O'.repeat(30),score:100,wrong:0,source:'admin',updated_at:'2026-10-16T00:00:00Z'};}
(async()=>{
  fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:960}});
  await context.addInitScript(n=>localStorage.setItem('gfield_student',n),student);
  await context.route(/^https?:\/\//,route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin===base){
      if(req.method()!=='GET'){evidence.writes.push(req.method()+' '+url.pathname);return route.fulfill({status:405,body:''});}
      if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:fixture+(denySignature?'\nwindow.GFIELD_DATA.archiveProductAccess["mock-signature-1"]=[];':'')});
      if(failFinal4&&url.pathname==='/bank/data/final4-fixed90.json')return route.fulfill({status:503,body:'synthetic load failure'});
      return route.continue();
    }
    if(url.pathname==='/rest/v1/mock_results')return route.fulfill({json:attempts.map(row)});
    if(url.pathname==='/rest/v1/access_log'){evidence.analyticsIntercepted=(evidence.analyticsIntercepted||0)+1;return route.fulfill({json:[]});}
    if(!['GET','HEAD','OPTIONS'].includes(req.method()))evidence.writes.push(req.method()+' '+url.pathname);
    return route.fulfill({contentType:/css/.test(url.pathname)?'text/css':'application/json',body:/css/.test(url.pathname)?'':'[]'});
  });
  const page=await context.newPage();page.on('pageerror',e=>evidence.browserErrors.push(e.message));
  const loaded=[];page.on('response',r=>{const m=/\/bank\/data\/((?:final|last|original|middle)\d+)-(?:fixed90|reviewed)\.json/.exec(r.url());if(m&&r.ok())loaded.push(m[1]);});
  async function open(){await page.goto(base+'/bank/personal-mock.html');await page.waitForFunction(()=>document.querySelector('#pmPrint')?.disabled===false);return page.locator('#pmStatus').innerText();}
  try{
    attempts=['hw1','6','4','3','2','1','last3','7'];const status=await open();
    assert.match(status,/유사문제 준비 중:.*중급 모의고사 6회/);assert.doesNotMatch(status,/권한|hw1|미등록\//);
    assert.equal(await page.locator('#pmSource option[value="applied1"]').count(),1);
    assert.ok(loaded.includes('middle7')&&loaded.includes('last3'));await page.screenshot({path:path.join(out,'all-rights-preparing-1280.png')});
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'all-rights-preparing-390.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    evidence.cases.push({name:'approved applied one is ready; unsupported middle keys remain preparing',pass:true,status});await page.setViewportSize({width:1280,height:960});
    attempts=codes;loaded.length=0;const ready=await open();
    assert.match(ready,/30문항 준비 완료/);assert.doesNotMatch(ready,/준비 중|권한|실패/);assert.deepEqual([...new Set(loaded)].sort(),codes.map(c=>/^[78]$/.test(c)?'middle'+c:c).sort());
    evidence.cases.push({name:'all fourteen stored banks actually load in the generator',pass:true,banks:[...new Set(loaded)].sort()});
    denySignature=true;const denied=await open();assert.match(denied,/열람 권한 없음: 시그니처 1회/);assert.doesNotMatch(denied,/유사문제 준비 중/);denySignature=false;
    evidence.cases.push({name:'real grant denial remains isolated',pass:true,status:denied});
    failFinal4=true;const failed=await open();assert.match(failed,/자료 불러오기 실패: 파이널 4회/);assert.doesNotMatch(failed,/권한|유사문제 준비 중/);failFinal4=false;
    evidence.cases.push({name:'load failure is not mislabeled as permission denial',pass:true,status:failed});
    await page.goto(base+'/bank/catalog.html');await page.waitForFunction(()=>!!window.__BANK_CATALOG_QA__?.fixedIndexLoaded);
    for(const code of codes){
      const set=/^[78]$/.test(code)?'middle':code.replace(/\d+$/,''),round=code.match(/\d+$/)[0],bank=/^[78]$/.test(code)?'middle'+code:code,prefix=/^[78]$/.test(code)?'mid'+code+'-q':bank+'-q';
      await page.selectOption('#source-filter',set);await page.selectOption('#round-filter',set+'|'+round);
      const refs=await page.locator('a[href*="bank='+bank+'"]:not(.back)').evaluateAll(nodes=>nodes.map(a=>({bank:new URL(a.href).searchParams.get('bank'),gens:(new URL(a.href).searchParams.get('gens')||'').split(',')})));
      assert.ok(refs.length,bank);assert.ok(refs.every(x=>x.bank===bank));assert.deepEqual([...new Set(refs.flatMap(x=>x.gens))].sort(),Array.from({length:30},(_,i)=>prefix+String(i+1).padStart(2,'0')));
    }
    evidence.cases.push({name:'all fourteen catalog filters link exactly thirty approved source types',pass:true,banks:14,sourceTypes:420});
    await page.goto(base+'/index.html');if(await page.locator('#skipBtn').count())await page.locator('#skipBtn').click();
    if(await page.locator('#name-input').isVisible()){await page.locator('#name-input').fill(student);await page.locator('.enter').click();}
    await page.locator('[data-v="archive"]').click();const link=page.locator('.bank-catalog-link');await link.waitFor();
    assert.ok((await link.getAttribute('href')).includes('bank/catalog.html'));assert.equal(await page.locator('.bank-type-btn').count(),15);
    await link.click();await page.waitForFunction(()=>!!window.__BANK_CATALOG_QA__?.unified);
    evidence.cases.push({name:'archive catalog entry opens using the existing identity handoff and keeps fifteen important types',pass:true});
    assert.deepEqual(evidence.writes,[]);assert.deepEqual(evidence.browserErrors,[]);
    console.log('PASS availability labels, 14 actual bank loads, 420 catalog source links, archive entry, PC/mobile, no production writes');
  }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
