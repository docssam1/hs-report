'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const ROOT=path.resolve(__dirname,'..');
const output=process.env.GFIELD_FINAL2_REVIEW_DIR;
const expected={7:'199번째',15:'422',25:'79개',26:'14살'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const writes=[];
    await context.route(/^https?:\/\//,route=>{
      const request=route.request(),url=new URL(request.url());
      if(!['GET','HEAD'].includes(request.method())) writes.push(request.method()+' '+url.pathname);
      if(url.hostname==='127.0.0.1') {
        if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_DATA={students:[],archiveAccess:{},archiveProductAccess:{}};'});
        return route.continue();
      }
      if(url.hostname.endsWith('supabase.co'))return route.fulfill({contentType:'application/json',body:'[]'});
      return route.fulfill({status:204,body:''});
    });
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const base=`http://127.0.0.1:${server.address().port}`;
    await page.goto(base+'/final.html?round=2&name=docssam&go=answer&preview=1',{waitUntil:'domcontentloaded'});
    await page.locator('#btnGrade').waitFor();
    assert.equal(await page.locator('#final2DetailedSolutions .final1-detailed-card').count(),0,'no worked answer before grading');
    for(let no=1;no<=30;no++)if(!Object.hasOwn(expected,no))await page.locator('.abtn').nth(no-1).click();
    await page.locator('#btnGrade').click();
    await page.locator('#final2DetailedSolutions .final1-detailed-card.is-ready').first().waitFor();
    assert.equal(await page.locator('#final2DetailedSolutions .final1-detailed-card.is-ready').count(),30,'all reviewed Final2 solutions render');
    assert.equal(await page.locator('#final2DetailedSolutions .final1-detailed-card.is-pending').count(),0,'no reviewed solution falls back to pending');
    assert.match(await page.locator('#final2-solution-7').innerText(),/397=2×198\+1/);
    assert.match(await page.locator('#final2-solution-7').innerText(),/200번째로 세면 안 됩니다/);
    for(const [no,answer] of Object.entries(expected)){
      const card=page.locator(`#final2-solution-${no}`);
      assert.match(await card.locator('.final1-answer').innerText(),new RegExp(answer));
      assert.ok((await card.innerText()).length>240,'substantive worked steps');
      assert.equal(await card.locator('.final1-watermark span').count(),3);
    }
    for(const no of [23,27,28])assert.equal(await page.locator(`#final2-solution-${no} .gfield-final2-solution-diagram`).count(),1,`Q${no} includes its teaching diagram`);
    const roadmapCurriculum=await page.evaluate(()=>{const display=value=>String(value||'').replace(/−/g,'-').replace(/\s+/g,' ').trim();return GF_TEST.M.rounds['2'].items.map(item=>{
      const rx=GF_TEST.curriculumPrescriptionForItem({roundNum:2},item),categories=['시중교재','소마','필즈더클래식','지필드'];
      return {
        no:item.no,label:display(rx&&rx.label||'—'),
        books:categories.map(category=>(rx&&rx.books&&rx.books[category]||[]).map(book=>display(book.b+' '+book.u))),
        points:(rx&&rx.pts||[]).map(display)
      };
    });});
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      for(const no of Object.keys(expected)){
        const card=page.locator(`#final2-solution-${no}`);
        const bounds=await card.evaluate(el=>({w:el.clientWidth,sw:el.scrollWidth,right:el.getBoundingClientRect().right}));
        assert.ok(bounds.sw<=bounds.w+1&&bounds.right<=width+1,`${no} readable at ${width}px`);
        if(output){fs.mkdirSync(output,{recursive:true});await card.screenshot({path:path.join(output,`q${no}-${width}.png`)});}
      }
    }
    if(output){await page.setViewportSize({width:1280,height:900});await page.pdf({path:path.join(output,'final2-report.pdf'),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});}
    await page.goto(base+'/answer.html?set=final&round=2&name=docssam',{waitUntil:'domcontentloaded'});
    await page.locator('#body tr').first().waitFor();
    assert.equal(await page.locator('#body tr').count(),30);
    assert.equal(await page.locator('.answer-correction').count(),1);
    assert.equal(await page.locator('#body tr').nth(6).locator('.answer-correction').innerText(),'✓ 필기 해설 정정: 200번째 → 199번째');
    for(const [no,answer] of Object.entries(expected))assert.equal(await page.locator('#body tr').nth(Number(no)-1).locator('.ans').innerText(),answer);
    const answerCurriculum=await page.evaluate(()=>[...document.querySelectorAll('#body tr')].map((row,index)=>({
      no:index+1,label:row.cells[4].innerText.trim(),
      books:[5,6,7,8].map(cellIndex=>[...row.cells[cellIndex].querySelectorAll('b')].map(book=>book.innerText.trim()+' '+book.nextElementSibling.innerText.trim())),
      points:[...row.cells[9].querySelectorAll('li')].map(point=>point.innerText.trim())
    })));
    assert.deepEqual(answerCurriculum,roadmapCurriculum,'자료실 30문항과 로드맵 30문항의 유형·교재·학습 포인트가 같은 원자료를 사용');
    const reviewedLinks=await page.evaluate(()=>[9,16,19,25,28].map(no=>{
      const cells=document.querySelectorAll('#body tr')[no-1].cells;
      return {no,label:cells[4].innerText.trim(),books:[...cells].slice(5,9).flatMap(cell=>[...cell.querySelectorAll('b')].map(book=>book.innerText.trim())),points:[...cells[9].querySelectorAll('li')].map(point=>point.innerText.trim())};
    }));
    assert.deepEqual(reviewedLinks.map(row=>[row.no,row.label,row.books.length,row.points.length]),[
      [9,'먼저 익힐 내용',1,1],[16,'먼저 익힐 내용',2,2],[19,'먼저 익힐 내용',2,2],[25,'먼저 익힐 내용',1,1],[28,'먼저 익힐 내용',2,2]
    ],'자료실 답안표도 로드맵과 같은 문항별 검수 연결을 사용');
    if(output){
      await page.locator('#body tr').nth(6).screenshot({path:path.join(output,'answer-q7.png')});
      await page.pdf({path:path.join(output,'final2-answer-table.pdf'),format:'A4',printBackground:true});
    }
    assert.deepEqual(writes,[],'preview/read-back must never write student results');
    assert.deepEqual(errors,[]);
    console.log('PASS Final2 30 detailed solutions, Q23/Q27/Q28 teaching diagrams, answer table, desktop/mobile, pre-attempt boundary, zero student writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
