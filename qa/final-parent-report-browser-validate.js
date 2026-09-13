'use strict';

// Synthetic pupils only. Every external request is intercepted.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='학부모화면검수학생';
const output=process.env.GFIELD_PARENT_REVIEW_DIR||'';
const ox1=Array.from({length:30},(_,i)=>[0,3,6,12,17,21,25].includes(i)?'X':'O').join('');
const ox2=Array.from({length:30},(_,i)=>[3,6,8,12,15,17,20,21,24,27].includes(i)?'X':'O').join('');
let records=[1,2,3,4].map(n=>({student,round:'final'+n,ox:n===1?ox1:n===2?ox2:'O'.repeat(30),source:'admin'}));
records.forEach(r=>{r.score=core.scoreOf(r.ox);r.wrong=[...r.ox].filter(v=>v==='X').length;});
records.push({student,round:'final2@2',ox:'O'.repeat(30),score:100,wrong:0,source:'practice-admin'});
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const teacherComment='잘하는 영역의 풀이를 이어 가며, 이번에 놓친 조건을 함께 확인해 주세요.';
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["파이널 모의고사"]=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||"")).map(x=>x.id);})();';
const server=http.createServer((req,res)=>{
  const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1280,height:900}}),writes=[],errors=[];
  let failPopulation=false;
  await context.addInitScript(n=>{localStorage.setItem('gfield_student',n);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:n}));},student);
  await context.route(/^https?:\/\//,route=>{
    const req=route.request(),u=new URL(req.url());
    if(u.origin===base){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
    if(u.pathname==='/rest/v1/mock_results'){if(req.method()!=='GET')writes.push(req.method());return route.fulfill({json:records});}
    if(u.pathname.endsWith('/hs-final-population')){
      const b=req.postDataJSON();
      if(b.action){if(b.action!=='read-report')writes.push(b.action);return route.fulfill({json:{canEdit:false,comment:teacherComment,snapshot:null,resultOx:ox2}});}
      if(failPopulation)return route.fulfill({status:503,json:{error:'STATISTICS_UNAVAILABLE'}});
      return route.fulfill({json:core.createResponse(baselines[b.exam],b.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(req.method())&&!u.pathname.endsWith('/access_log'))writes.push(u.pathname);
    return route.fulfill({json:[]});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const open=async n=>{await page.goto(base+'/final.html?round='+n+'&go=report&name='+encodeURIComponent(student));await page.locator('#report-summary').waitFor();};
  try{
    await open(2);
    assert.equal(await page.locator('.parent-report-index a').count(),7,'seven parent navigation destinations');
    const targets=await page.locator('.parent-report-index a').evaluateAll(links=>links.map(a=>({href:a.getAttribute('href'),exists:!!document.getElementById(a.hash.slice(1))})));
    assert.ok(targets.every(t=>t.exists),'every index link resolves');
    assert.match(await page.locator('.docssam-saved-comment').innerText(),/잘하는 영역/);
    assert.equal(await page.locator('#detailWrap td.rt .bar').count(),30,'fixed item response rates remain available');
    assert.ok(await page.locator('.report-tier-section').evaluate(el=>el.nextElementSibling.classList.contains('report-item-section')),'item diagnosis immediately follows point-band results');
    assert.ok(await page.locator('.personal-study-plan').isVisible(),'personal study plan remains directly accessible');
    assert.doesNotMatch(await page.locator('#report-summary').innerText(),/null|NaN|undefined|응시\s*인원|합격\s*확률/);
    assert.ok(await page.locator('details.parent-report-details:not([open])').count()>0,'long explanations are collapsed initially');
    const source=await page.locator('.final-report-package').textContent();
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page fits '+width+'px');
      await page.locator('.parent-report-index a[href="#report-items"]').click();
      assert.ok(await page.locator('#report-items').isVisible(),'index shows the target at '+width+'px');
      await page.locator('.parent-report-index a[href="#report-summary"]').click();
      if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'parent-report-'+width+'.png')});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,'parent-report-top-'+width+'.png')});}
    }
    await page.setViewportSize({width:1280,height:900});
    await page.locator('.parent-report-index a[href="#report-review"]').focus();await page.keyboard.press('Enter');
    assert.ok(await page.locator('#report-review').isVisible(),'index works with keyboard');
    // First-round reports do not claim a two-round history.
    await open(1);assert.match(await page.locator('#report-summary').innerText(),/2회부터/);
    // Missing intermediate round must remain missing, not become a zero.
    const fullRecords=records;records=records.filter(r=>r.round!=='final2');await open(4);
    assert.match(await page.locator('#report-summary').innerText(),/미등록|미반영|2회/);
    records=fullRecords;failPopulation=true;await open(2);
    assert.equal(await page.locator('#detailWrap td.rt .bar').count(),30,'offline population lookup does not remove fixed rates');
    assert.doesNotMatch(await page.locator('#report-summary').innerText(),/null%|NaN|undefined/);
    failPopulation=false;await open(2);
    assert.equal(await page.locator('.final-report-package').textContent(),source,'returning to the same result restores identical content');
    if(output){
      await page.evaluate(()=>{document.querySelectorAll('details.parent-report-details').forEach(d=>d.open=true);});
      await page.screenshot({path:path.join(output,'parent-report-full.png'),fullPage:true});
      await page.evaluate(()=>{document.querySelectorAll('details.parent-report-details').forEach(d=>d.open=false);});
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      assert.equal(await page.locator('details.parent-report-details:not([open])').count(),0,'native print expands all report details');
      await page.pdf({path:path.join(output,'parent-report-package.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      assert.ok(await page.locator('details.parent-report-details:not([open])').count()>0,'native print restores compact screen state');
    }
    assert.deepEqual(writes,[],'no production data writes');assert.deepEqual(errors,[],'no browser errors');
    console.log('PASS parent report browser: index, compact explanations, retained plan/rates, history boundaries, offline, desktop/mobile, no data writes');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
