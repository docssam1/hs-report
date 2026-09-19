'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),output=process.env.GFIELD_PACKAGE_REVIEW_DIR,reviewRound=Number(process.env.GFIELD_PACKAGE_REVIEW_ROUND||0);
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
    for(const round of [1,2,3,4]){
      await page.goto(base+`/final.html?round=${round}&name=docssam&go=answer&preview=1`);
      assert.equal(await page.locator('.personal-study-plan').count(),0,'no plan before result');
      for(let no=1;no<=30;no++)if(![1,4,7,13,18,22,26].includes(no))await page.locator('.abtn').nth(no-1).click();
      await page.locator('#btnGrade').click();await page.locator('.personal-study-plan').waitFor();
      assert.equal(await page.locator('.personal-plan-stage').count(),3);
      assert.equal(await page.locator('.report-print-cover').isVisible(),false,'no screen cover');
      assert.equal(await page.locator('.report-screen-header').isVisible(),true);
      assert.equal(await page.locator('#printBtn').evaluate(el=>el.tagName==='BUTTON'&&el.classList.contains('gfield-final-report-print-button')),true,'every Final round uses the reviewed print controller');
      assert.equal(await page.locator('#printBtn').evaluate(el=>getComputedStyle(el).position),'static','toolbar never covers reading content');
      assert.equal(await page.locator('.personal-plan-grid .personal-plan-stage').count(),3);
      assert.match(await page.locator('#report-plan').innerText(),/이번 주 학습/);
      assert.equal(await page.locator('.report-wrong-summary tbody tr').count(),7,'compact screen lists only wrong questions');
      assert.equal(await page.locator('.report-resource-details').count(),2,'curriculum and detailed solutions stay available on demand');
      assert.equal(await page.locator('.report-resource-details[open]').count(),0,'long learning resources start collapsed');
      const comment=await page.locator('.diagnostic-coaching,.personal-study-plan').evaluateAll(nodes=>nodes.map(n=>n.textContent).join(' '));
      assert.match(comment,/이번 주 학습 계획|오답 다시 풀기/);assert.doesNotMatch(comment,/\d+명 중|응시 인원|석차 백분율\([0-9]/);
      assert.match(comment,/각 차수의 완료 기준을 통과하면/);
      const analysis=page.locator('.report-analysis-section');
      assert.equal(await analysis.locator('#report-strengths>h2').innerText(),'강점과 보완점');
      assert.equal(await analysis.locator('.report-tier-section>h2').innerText(),'배점대별 결과');
      assert.equal(await analysis.locator('.report-tier-section').evaluate(el=>el.nextElementSibling.classList.contains('report-item-section')),true,'item diagnosis follows the point-tier section');
      const order=await page.evaluate(()=>Array.from(document.querySelector('#report-materials').children).map(el=>el.className));
      assert.ok(order.findIndex(x=>x.includes('curriculum'))<order.findIndex(x=>x.includes('report-detailed-section')));
      assert.equal(await page.locator('.final1-detailed-card.is-ready').count(),30,`Final${round} keeps all 30 reviewed solutions`);
      assert.equal(await page.locator('.final1-detailed-card.is-pending').count(),0,`Final${round} has no pending solution cards`);
      const preparedMetrics=await page.evaluate(async()=>{
        const job=window.GFIELD_FINAL_REPORT_PRINT.createPreparation({
          source:document.querySelector('.final-report-package'),
          mode:'summary',
          requiredFontFamilies:[],
          timeoutMs:30000
        });
        const prepared=await job.promise;
        const metrics=prepared.metrics;
        prepared.cleanup();
        return metrics;
      });
      assert.equal(preparedMetrics.round,round,`Final${round} print preparation keeps the correct round`);
      assert.equal(preparedMetrics.mode,'summary',`Final${round} defaults to a concise diagnosis`);
      assert.equal(preparedMetrics.detailItems.length,0,`Final${round} summary excludes 30 detailed answers`);
      assert.equal(preparedMetrics.detailStartPage,null,`Final${round} summary has no appended answer section`);
      assert.ok(preparedMetrics.preludePages<=8,`Final${round} summary stays compact: ${preparedMetrics.preludePages} pages`);
      const fullMetrics=await page.evaluate(async()=>{
        const job=window.GFIELD_FINAL_REPORT_PRINT.createPreparation({source:document.querySelector('.final-report-package'),mode:'full',requiredFontFamilies:[],timeoutMs:30000});
        const prepared=await job.promise,metrics=prepared.metrics;prepared.cleanup();return metrics;
      });
      assert.equal(fullMetrics.detailItems.length,30,`Final${round} detailed answers remain separately available`);
      assert.equal(fullMetrics.detailStartPage%2,1,`Final${round} detailed answers keep duplex parity`);
      if(round===2){
        assert.equal(await page.locator('#final2DetailedSolutions .final1-detailed-card.is-ready').count(),30,'Final2 keeps all 30 reviewed solutions');
        assert.equal(await page.locator('#final2DetailedSolutions .final1-detailed-card.is-pending').count(),0,'Final2 has no fallback pending card');
        assert.match(await page.locator('#final2DetailedSolutions .final1-solutions-head').textContent(),/30문항 \/ 전체 30문항/);
        assert.equal(await page.locator('#detailedAnswersSection>.lead,#detailedAnswersSection>.detailed-solutions').count(),0,'legacy generic four-solution fallback is absent');
        assert.doesNotMatch(await page.locator('#detailedAnswersSection').innerText(),/4문제의 풀이를 볼 수 있습니다/);
        assert.match(await page.locator('#final2-solution-1').textContent(),/모두 낮은 점수라고 가정하여 높은 점수 횟수 찾기[\s\S]*정답 · 4번/);
        assert.match(await page.locator('#final2-solution-30').textContent(),/연속한 자연수의 개수를 가장 크게 만드는 시작 수 찾기[\s\S]*정답 · 2/);
      }
      for(const width of [1280,390]){
        await page.setViewportSize({width,height:900});
        for(const selector of ['.personal-study-plan','.diagnostic-coaching','.report-screen-header']){
          assert.ok(await page.locator(selector).evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${selector} at ${width}`);
        }
        if(output&&(!reviewRound||reviewRound===round)){fs.mkdirSync(output,{recursive:true});await page.locator('.personal-study-plan').screenshot({path:path.join(output,`plan-r${round}-${width}.png`)});}
      }
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.report-print-cover').isVisible(),false,'native print uses the concise diagnosis instead of the full cover package');
      assert.equal(await page.locator('.report-compact-print-header').isVisible(),true,'native print shows the concise student header');
      assert.equal(await page.locator('.report-detailed-section').isVisible(),false,'native print does not expand the 30-source-item solution appendix');
      assert.equal(await page.locator('.report-screen-header').isVisible(),false);
      if(output&&(!reviewRound||reviewRound===round)){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,`package-r${round}.pdf`),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});}
      await page.emulateMedia({media:'screen'});
    }
    assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
    console.log('PASS personalised three stages, graphs, print-only cover, package order, no cohort counts, no guessed history, desktop/mobile, zero writes');
  }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err);server.close();process.exitCode=1;});
