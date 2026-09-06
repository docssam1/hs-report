'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const root=path.resolve(__dirname,'..');
const baseline=process.env.GFIELD_PRIVATE_POPULATION_AUDIT==='1'?JSON.parse(fs.readFileSync(path.join(root,'supabase/functions/hs-final-population/baseline.private.json'),'utf8')):{schemaVersion:1,exam:'final1',scope:'provided-original-records',approved:true,version:'final1-'+'a'.repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]};
const output=process.env.GFIELD_POPULATION_REVIEW_DIR;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch();
  try{
    let fail=false;const writes=[],requests=[],errors=[];
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+url.pathname);
      if(url.hostname==='127.0.0.1'){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.exposeFunction('qaPopulation',body=>{requests.push(body);if(fail)throw new Error('offline');return core.createResponse(baseline,body.scores);});
    async function openAndGrade(wrong){
      await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=1&name=docssam&go=answer&preview=1`);
      await page.evaluate(()=>{window.GFIELD_AUTH={functionCall:(_slug,body)=>window.qaPopulation(body)};});
      for(let no=1;no<=30;no++)if(!wrong.includes(no))await page.locator('.abtn').nth(no-1).click();
      if(wrong.length===30)page.once('dialog',dialog=>dialog.accept());
      await page.locator('#btnGrade').click();await page.locator('.personal-study-plan').waitFor();
    }
    const wrong=[1,4,7,13,18,22,26];await openAndGrade(wrong);
    assert.equal(requests.length,2);assert.deepEqual(Object.keys(requests[0]).sort(),['exam','scores']);
    let text=await page.locator('#app').innerText();
    assert.ok(!/null%|NaN|undefined|응시 인원/.test(text),'no invalid statistics: '+JSON.stringify(text.match(/null%|NaN|undefined|응시 인원/g)));
    assert.doesNotMatch(await page.locator('.cut-reference').innerText(),/\d+명/);
    assert.doesNotMatch(text,/자동 합산/);assert.equal(await page.locator('#detailWrap .bar').count(),30,'all fixed item rates remain visible');
    const current=core.scoreOf(Array.from({length:30},(_,i)=>wrong.includes(i+1)?'X':'O').join(''));
    const expected=core.createResponse(baseline,[current]);
    assert.match(text,new RegExp(expected.percentiles[String(Math.round(current*10))]+'%'));
    assert.equal(await page.locator('.cut-reference .cut-number').filter({hasText:'확인 중'}).count(),0);
    assert.equal(await page.locator('.cut-reference .cut-number').filter({hasText:'%'}).count(),5,'all fixed cutoff percentiles remain visible');
    assert.match(text,/현재 위치는 .*%에서 .*%로 달라집니다/);
    assert.match(await page.locator('.report-screen-header').innerText(),/평균.*석차 백분율/s);
    assert.match(await page.locator('.report-cover-student').innerText(),/석차 백분율/);
    const labelsInside=await page.locator('.radar').evaluate(svg=>{const v=svg.viewBox.baseVal;return [...svg.querySelectorAll('.lb text')].every(t=>{const b=t.getBBox();return b.x>=v.x&&b.x+b.width<=v.x+v.width&&b.y>=v.y&&b.y+b.height<=v.y+v.height;});});
    assert.equal(labelsInside,true,'all radar labels inside viewport');
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'statistics-'+width+'.png'),fullPage:false});}
    }
    if(output){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,'statistics-report.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});}
    fail=true;await openAndGrade(wrong);text=await page.locator('#app').innerText();
    assert.equal(await page.locator('#detailWrap .bar').count(),30,'offline keeps all fixed item rates');
    assert.equal(await page.locator('.cut-reference .cut-number').filter({hasText:'%'}).count(),5,'offline keeps all fixed cutoff percentiles');
    assert.doesNotMatch(await page.locator('.report-screen-header').innerText(),/석차 백분율/);
    assert.doesNotMatch(await page.locator('.diagnostic-coaching').innerText(),/현재 위치는 .*%에서 .*%로/);
    assert.doesNotMatch(text,/null%|NaN|자동 합산/);
    fail=false;await openAndGrade([]);text=await page.locator('#app').innerText();assert.doesNotMatch(text,/null%|NaN/);
    await openAndGrade(Array.from({length:30},(_,i)=>i+1));text=await page.locator('#app').innerText();assert.doesNotMatch(text,/null%|NaN|1\d\d\.\d%/);assert.match(text,/100%/);
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log('PASS secure report/cuts/target percentiles, offline fail-closed, zero/full score, mobile, no learner writes');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close();});
