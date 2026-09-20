'use strict';

// Synthetic pupil only. Every external request is intercepted.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..'),student='상단기능검수학생';
const output=process.env.GFIELD_REPORT_ACTIONS_REVIEW_DIR||'';
const ox=Array.from({length:30},(_,i)=>[3,6,8,12,15,17,20,21,24,27].includes(i)?'X':'O').join('');
const records=['final2','final7'].map(round=>({student,round,ox,score:core.scoreOf(ox),wrong:[...ox].filter(v=>v==='X').length,source:'admin'}));
const baseline={schemaVersion:1,exam:'final2',scope:'provided-original-records',approved:true,version:'final2-'+'2'.repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]};
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["파이널 모의고사"]=[n];d.archiveProductAccess=d.archiveProductAccess||{};d.archiveProductAccess["mock-final-7"]=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||"")).map(x=>x.id);})();';
const server=http.createServer((req,res)=>{
  const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!f.startsWith(root+path.sep)||f.includes('.private')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1280,height:900}}),writes=[],errors=[];
  await context.addInitScript(name=>{localStorage.setItem('gfield_student',name);localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));},student);
  await context.route(/^https?:\/\//,route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===base){if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
    if(url.pathname==='/rest/v1/mock_results'){if(request.method()!=='GET')writes.push(request.method());return route.fulfill({json:records});}
    if(url.pathname.endsWith('/hs-final-population')){
      const body=request.postDataJSON();
      if(body.action)return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
      const population=Object.assign({},baseline,{exam:body.exam,version:String(body.exam)+'-'+'2'.repeat(64)});
      return route.fulfill({json:core.createResponse(population,body.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(request.method())&&!url.pathname.endsWith('/access_log'))writes.push(url.pathname);
    return route.fulfill({json:[]});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(base+'/final.html?round=2&go=report&name='+encodeURIComponent(student));
    await page.locator('.report-screen-header').waitFor();
    const details=page.locator('.final-report-package details.parent-report-details, .final-report-package details.report-resource-details');
    const detailCount=await details.count();
    assert.ok(detailCount>=7,'report has the compact detail groups');
    const toggle=page.locator('.report-detail-toggle');
    assert.equal(await toggle.innerText(),'상세 전체보기');
    await toggle.click();
    assert.equal(await details.evaluateAll(nodes=>nodes.filter(node=>node.open).length),detailCount,'one action opens all details');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await details.first().evaluate(detail=>{detail.open=false;});
    await page.waitForFunction(()=>document.querySelector('.report-detail-toggle').textContent==='상세 전체보기');
    await toggle.click();
    assert.equal(await details.evaluateAll(nodes=>nodes.filter(node=>node.open).length),detailCount,'action reopens all after an individual close');
    await toggle.click();
    assert.equal(await details.evaluateAll(nodes=>nodes.filter(node=>node.open).length),0,'action closes all details');
    const lecture=page.locator('.report-lecture-link');
    assert.equal(await lecture.count(),1,'round lecture is visible in the report header');
    assert.match(await lecture.getAttribute('href'),/^https:\/\//);
    assert.equal(await lecture.getAttribute('target'),'_blank');
    await page.goto(base+'/final.html?round=7&go=report&name='+encodeURIComponent(student));
    await page.locator('.report-screen-header').waitFor();
    assert.equal(await page.locator('.report-detail-toggle').count(),1,'Final 7 also exposes the full detail action');
    assert.match(await page.locator('.report-lecture-link').getAttribute('href'),/NpGefamVXp8/,'Final 7 lecture action uses its reviewed video');
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'header actions fit '+width+'px');
      assert.ok(await toggle.isVisible(),'detail action remains visible at '+width+'px');
      assert.ok(await lecture.isVisible(),'lecture action remains visible at '+width+'px');
      if(output){fs.mkdirSync(output,{recursive:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,'report-header-actions-'+width+'.png')});}
    }
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.report-screen-actions').isVisible(),false,'screen actions stay out of print');
    assert.deepEqual(writes,[],'no production data writes');
    assert.deepEqual(errors,[],'no browser errors');
    console.log('PASS report header actions: open/close all details, lecture link, desktop, 390px, print-hidden');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
