'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),output=process.env.GFIELD_PACKAGE_REVIEW_DIR;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}}),writes=[];
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(!['GET','HEAD'].includes(req.method()))writes.push(req.method());
      if(url.hostname==='127.0.0.1'){
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',err=>errors.push(err.message));
    const base=`http://127.0.0.1:${server.address().port}`;
    for(const round of [1,2]){
      await page.goto(base+`/final.html?round=${round}&name=docssam&go=answer&preview=1`);
      assert.equal(await page.locator('.personal-study-plan').count(),0,'no plan before result');
      for(let no=1;no<=30;no++)if(![1,4,7,13,18,22,26].includes(no))await page.locator('.abtn').nth(no-1).click();
      await page.locator('#btnGrade').click();await page.locator('.personal-study-plan').waitFor();
      assert.equal(await page.locator('.personal-plan-stage').count(),3);
      assert.equal(await page.locator('.report-print-cover').isVisible(),false,'no screen cover');
      assert.equal(await page.locator('.report-screen-header').isVisible(),true);
      await page.evaluate(()=>{window.__printCalls=0;window.print=()=>{window.__printCalls++;};});
      await page.locator('#printBtn').focus();await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>window.__printCalls),1,'keyboard print action');
      assert.equal(await page.locator('#printBtn').evaluate(el=>getComputedStyle(el).position),'static','toolbar never covers reading content');
      assert.ok(await page.locator('.coaching-chart svg').count()>=2);
      const comment=await page.locator('.diagnostic-coaching').innerText();
      assert.match(comment,/반복 약점|되찾을 점수/);assert.doesNotMatch(comment,/\d+명 중|응시 인원|석차 백분율\([0-9]/);
      assert.match(comment,/이전 회차의 비교 가능한 기록이 없어/);
      const order=await page.evaluate(()=>Array.from(document.querySelector('.final-report-package').children).map(el=>el.className));
      assert.ok(order.findIndex(x=>x.includes('curriculum'))<order.findIndex(x=>x.includes('report-detailed-section')));
      if(round===1){assert.equal(await page.locator('.final1-detailed-card.is-ready').count(),30);assert.equal(await page.locator('.final1-detailed-card.is-pending').count(),0);}
      if(round===2)assert.match(await page.locator('#detailedAnswersSection>.lead').innerText(),/검수가 끝난 4문항만/);
      for(const width of [1280,390]){
        await page.setViewportSize({width,height:900});
        for(const selector of ['.personal-study-plan','.diagnostic-coaching','.report-screen-header']){
          assert.ok(await page.locator(selector).evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${selector} at ${width}`);
        }
        if(output){fs.mkdirSync(output,{recursive:true});await page.locator('.personal-study-plan').screenshot({path:path.join(output,`plan-r${round}-${width}.png`)});}
      }
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.report-print-cover').isVisible(),true);
      assert.equal(await page.locator('.report-screen-header').isVisible(),false);
      if(output){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,`package-r${round}.pdf`),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});}
      await page.emulateMedia({media:'screen'});
    }
    assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
    console.log('PASS personalised three stages, graphs, print-only cover, package order, no cohort counts, no guessed history, desktop/mobile, zero writes');
  }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err);server.close();process.exitCode=1;});
