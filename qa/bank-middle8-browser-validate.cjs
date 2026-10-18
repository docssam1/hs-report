'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_QA_ARTIFACT_DIR||path.join(root,'.private-work/bank-existing-links-20261016/qa-middle8');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const fixture='window.GFIELD_DATA={students:["검수학생"],studentTypes:{},archiveAccess:{"최종 모의고사":["검수학생"]},archiveProductAccess:{"mock-mid-8":["검수학생"]},attendance:{}};';
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.GFIELD_MIDDLE_BANK_PUBLIC_BASE_URL||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1280,height:960}}),errors=[],writes=[],report=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('gfield_student','검수학생'));
  await page.route('**/*',route=>{const req=route.request(),u=new URL(req.url());
    if(u.origin===base){if(req.method()!=='GET'){writes.push(u.pathname);return route.abort();}
      if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:fixture});return route.continue();}
    if(u.pathname.endsWith('/rest/v1/mock_results'))return route.fulfill({contentType:'application/json',body:JSON.stringify([{student:'검수학생',round:'8',ox:'O'.repeat(30),score:100,wrong:0,source:'teacher',updated_at:'2026-10-10T00:00:00Z'}])});
    if(/\/rest\/v1\/bank_print_history/.test(u.pathname))return route.fulfill({contentType:'application/json',body:'[]'});
    if(req.method()!=='GET')writes.push(u.pathname);return route.abort();
  });
  const measure=()=>page.locator('#final1Worksheet .qcard').evaluateAll(cards=>cards.map(c=>{
    const b=c.getBoundingClientRect(),last=c.lastElementChild.getBoundingClientRect(),img=c.querySelector('img');
    return {id:c.querySelector('[data-item-id]').dataset.itemId,overflow:c.scrollHeight-c.clientHeight,
      lastOverflow:last.bottom-b.bottom,img:img?{width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,broken:!img.complete||!img.naturalWidth}:null};
  }));
  try{
    for(const layout of ['editorial','compact']){
      await page.setViewportSize({width:1280,height:960});await page.emulateMedia({media:'screen'});
      await page.goto(base+'/bank/index.html?bank=middle8&layout='+layout+'&view=grouped&printMode=both');
      try{await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')?.disabled===false,{timeout:30000});}
      catch(error){throw new Error('Middle 8 worksheet load: '+JSON.stringify({status:await page.locator('#f1Status').allTextContents(),errors,body:(await page.locator('body').innerText()).slice(0,500)}));}
      assert.equal(await page.locator('#final1Worksheet .qcard').count(),90);
      assert.equal(await page.locator('#final1Worksheet [data-answer-id]').count(),90);
      const q02Cards=page.locator('#final1Worksheet .qcard[data-source-no="2"]');
      assert.deepEqual(await q02Cards.locator('.f1-qtype').allTextContents(),Array(3).fill('[9로 나눈 나머지 조건(두 자리 수)]'));
      assert.deepEqual((await q02Cards.locator('.f1-qtext').allTextContents()).map(x=>x.match(/나머지가 (\d+)/)[1]),['4','5','6']);
      const q10Cards=page.locator('#final1Worksheet .qcard[data-source-no="10"]');
      assert.deepEqual(await q10Cards.locator('.f1-qtype').allTextContents(),Array(3).fill('[순서쌍 배열의 규칙]'));
      assert.deepEqual((await q10Cards.locator('.f1-qtext').allTextContents()).map(x=>x.match(/\d+번째/)[0]),['42번째','59번째','72번째']);
      assert.equal(await page.locator('#stage .question-page').count(),0);
      const pc=await measure();await page.emulateMedia({media:'print'});const print=await measure();
      report.push({bank:'middle8',layout,pc,print});
      const problems=pc.concat(print).filter(x=>x.overflow>2||x.lastOverflow>2||x.img?.broken);
      if(problems.length)throw Error('Clipped cards: '+JSON.stringify(problems));
      await page.pdf({path:path.join(out,'middle8-'+layout+'.pdf'),preferCSSPageSize:true,printBackground:true});
      const answerOverflow=await page.locator('.f1-answer-page .solution-card').evaluateAll(cards=>cards.filter(card=>{
        const page=card.closest('.f1-answer-page');return card.getBoundingClientRect().bottom>page.getBoundingClientRect().bottom+2||card.scrollHeight>card.clientHeight+2;
      }).map(card=>card.dataset.answerId));assert.deepEqual(answerOverflow,[],'Answer pagination must fit.');
      await page.locator('.solution-card[data-source-no="13"]').first().screenshot({path:path.join(out,'middle8-'+layout+'-q13-solution.png')});
      for(const no of [3,13,14,16,17,20,25,26,27,30])await page.locator('#final1Worksheet .qcard[data-source-no="'+no+'"]').first().screenshot({path:path.join(out,'middle8-'+layout+'-q'+no+'.png')});
      const sanitization=await page.evaluate(()=>({safe:window.BANK_CORE.reviewedMathText('<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>'),bad:window.BANK_CORE.reviewedMathText('<math><mtext onclick="alert(1)">1</mtext></math>')}));
      assert.ok(sanitization.safe.startsWith('<math>'));assert.ok(sanitization.bad.startsWith('&lt;math&gt;'));
      await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});const mobile=await measure();
      assert.ok(mobile.every(x=>!x.img?.broken&&x.lastOverflow<=2));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
      await page.locator('#final1Worksheet .qcard[data-source-no="13"]').first().screenshot({path:path.join(out,'middle8-'+layout+'-q13-mobile.png')});
    }
    await page.goto(base+'/bank/index.html?bank=middle8&layout=compact&view=grouped&printMode=both');
    await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')?.disabled===false);
    await page.emulateMedia({media:'print'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const mobilePrint=await measure();assert.ok(mobilePrint.every(x=>x.overflow<=2&&x.lastOverflow<=2),'Mobile-first print preserves full-size cards.');
    await page.emulateMedia({media:'screen'});await page.setViewportSize({width:1280,height:960});
    await page.goto(base+'/bank/index.html?practice=wrong&source=middle%7C8%7C13&gen=mid8-q13&printMode=questions');
    await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')?.disabled===false,{timeout:30000});
    assert.equal(await page.locator('#final1Worksheet .qcard').count(),3);
    assert.ok((await page.locator('.f1-back').getAttribute('href')).includes('mock.html?round=8'));
    await page.goto(base+'/bank/personal-mock.html');
    await page.waitForFunction(()=>document.querySelector('#pmPrint')?.disabled===false,{timeout:30000});
    assert.equal(await page.locator('.pm-q').count(),30);
    assert.ok((await page.locator('#pmStatus').textContent()).includes('30문항 준비 완료'));
    assert.ok((await page.locator('.pm-answer').first().textContent()).includes('중급 모의고사 8회'));
    for(const count of [10,20]){await page.locator('[data-count="'+count+'"]').click();await page.waitForFunction(n=>document.querySelectorAll('.pm-q').length===n,count);}
    assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
    fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({passed:true,baseUrl:base,sourceMode:process.env.GFIELD_MIDDLE_BANK_PUBLIC_BASE_URL?'public-static-with-synthetic-access':'local-static-with-synthetic-access',report,errors,productionWrites:0},null,2));
    console.log(JSON.stringify({passed:true,baseUrl:base,middle8:90,reusedApproval:true,layouts:['editorial','compact'],personalMock:[10,20,30],productionWrites:0,out}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
