'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'bank/data/final1-fixed90.json'),'utf8'));
const draft=process.argv.includes('--draft-layout');
const output=process.env.GFIELD_WORKSHEET_REVIEW_DIR;
const pdf=process.argv.includes('--pdf');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('content-type',({'.css':'text/css','.js':'application/javascript','.html':'text/html','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1100}});
    await page.addInitScript(()=>localStorage.setItem('gfield_student','검수용가상학생'));
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',r=>r.abort());
    if(draft){const fixture=structuredClone(data);fixture.items.forEach(q=>q.reviewStatus='verified');await page.route('**/final1-fixed90.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(fixture)}));}
    await page.route('**/bank-core.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'bank/bank-core.js'),'utf8')+';BANK_CORE.buildPaper=function(){throw Error("RANDOM_ASSEMBLY_FORBIDDEN")};'}));
    const base=`http://127.0.0.1:${server.address().port}/bank/index.html`;
    const paperIds=()=>page.locator('.qmeta.fixed-item[data-item-id]').evaluateAll(ns=>ns.map(n=>n.dataset.itemId));
    const ready=()=>page.waitForFunction(()=>{const b=document.querySelector('#final1Worksheet #btnPrint');return b&&!b.disabled;});
    const watermarks=async(target=page)=>{
      for(const media of ['screen','print']){
        await target.emulateMedia({media});
        const missing=await target.locator('#f1Pages .page:not(.duplex-blank)').evaluateAll(pages=>pages.flatMap((p,i)=>{
          const layer=p.querySelector('.wm-layer.wm-active');
          if(!layer||layer.querySelectorAll('.wm-tile').length!==32||!layer.textContent.includes('지필드 영재교육'))return [i];
          for(let n=layer;n;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return [i];}
          return Number(getComputedStyle(layer).opacity)<.1?[i]:[];
        }));
        assert.deepEqual(missing,[],media+' mandatory watermark on every nonblank sheet including cover');
      }
      await target.emulateMedia({media:null});
    };
    const save=async name=>{
      await watermarks();
      if(!output)return;
      fs.mkdirSync(output,{recursive:true});
      await page.screenshot({path:path.join(output,name+'-screen.png')});
      if(pdf)await page.pdf({path:path.join(output,name+'.pdf'),preferCSSPageSize:true,printBackground:true});
    };
    await page.goto(base+'?bank=final1&gen=mix&n=8&seed=BAD&review=1#student=검수용가상학생',{waitUntil:'networkidle'});await ready();
    const expected=data.items.slice().sort((a,b)=>a.variantNo-b.variantNo||a.sourceNo-b.sourceNo);
    assert.deepEqual(await paperIds(),expected.map(q=>q.id));
    assert.deepEqual(await page.locator('.qtext').allTextContents(),expected.map(q=>q.text));
    assert.deepEqual(await page.locator('.question-page').evaluateAll(ns=>ns.map(n=>n.querySelectorAll('.qcard').length)),Array(15).fill(6));
    assert.equal(await page.locator('.cover-page').count(),1);
    assert.equal(await page.locator('.cover-page input[type=checkbox]').count(),30);
    assert.match(await page.locator('.cover-page').innerText(),/검수용가상학생/);
    assert.equal(await page.locator('.duplex-blank').count(),0,'cover + 15 question pages is even');
    assert.equal(await page.locator('.solution-card').count(),90);
    assert.deepEqual(await page.locator('.solution-card').evaluateAll(ns=>ns.map(n=>n.dataset.answerId)),expected.map(q=>q.id));
    assert.doesNotMatch(await page.locator('#final1Worksheet').innerText(),/undefined|NaN|\[object Object\]/);
    assert.equal(await page.locator('#btnPrint').count(),1,'unique print action');
    assert.equal(await page.locator('[data-role=tune]').first().isVisible(),false);
    assert.equal(await page.locator('[data-role=type]').first().isVisible(),false);
    assert.equal(new URL(page.url()).searchParams.has('seed'),false);
    assert.equal(await page.locator('[data-role=points][aria-pressed=true]:visible').textContent(),'전체문제');
    const geometry=await page.locator('.question-page').evaluateAll(pages=>pages.flatMap((p,pi)=>{
      const cards=[...p.querySelectorAll('.qcard')],rects=cards.map(c=>c.getBoundingClientRect());
      return cards.flatMap((c,i)=>{
        const r=rects[i],a=c.querySelector('.answerline').getBoundingClientRect();
        const problems=[];
        if(c.scrollWidth>c.clientWidth+2||c.scrollHeight>c.clientHeight+2||a.bottom>r.bottom+2)problems.push([pi,i,'overflow']);
        if(i%2&&Math.abs(r.top-rects[i-1].top)>1)problems.push([pi,i,'unaligned']);
        if(Math.abs(r.height-rects[0].height)>2)problems.push([pi,i,'unequal']);
        if(getComputedStyle(c).transform!=='none')problems.push([pi,i,'transform']);
        return problems;
      });
    }));assert.deepEqual(geometry,[],'all six solving cells have equal height and top alignment');
    const clipped=await page.locator('.page').evaluateAll(ns=>ns.flatMap((p,i)=>{
      const r=p.getBoundingClientRect(),s=getComputedStyle(p),bottom=r.bottom-parseFloat(s.paddingBottom);
      return [...p.children].filter(c=>!c.classList.contains('wm-layer')&&!c.classList.contains('f1-watermark-clip')&&c.getBoundingClientRect().bottom>bottom+2).map(c=>[i,c.className,'outside page']);
    }));assert.deepEqual(clipped,[],'no clipped cover types or solution blocks');
    await save('full90-both');
    for(const [band,count] of [['2.7',36],['3.4',30],['4.2',24]]){
      await page.locator(`#final1Worksheet [data-role=points][data-val="${band}"]`).click();await ready();
      assert.equal(await page.locator('.qcard').count(),count);
      assert.equal(await page.locator(`.qcard:not([data-points="${band}"])`).count(),0);
      const before=1+Math.ceil(count/6);
      assert.equal(await page.locator('.duplex-blank').count(),before%2);
      if(band==='2.7')await save('points2-both');
    }
    await page.goto(base+'?practice=wrong&per=3&source=final%7C1&gens=final1-q07,final1-q23#student=검수학생',{waitUntil:'networkidle'});await ready();
    const subset=expected.filter(q=>[7,23].includes(q.sourceNo));
    assert.deepEqual(await paperIds(),subset.map(q=>q.id));
    await page.reload({waitUntil:'networkidle'});await ready();
    assert.deepEqual(await paperIds(),subset.map(q=>q.id),'reload preserves exact questions and order');
    await page.locator('.cover-page input[type=checkbox]').first().check();
    await page.locator('#final1Worksheet [data-val="2.7"]').click();await ready();assert.equal(await page.locator('.qcard').count(),3);
    await page.locator('#final1Worksheet [data-val="all"]').click();await ready();assert.deepEqual(await paperIds(),subset.map(q=>q.id));
    assert.equal(await page.locator('.cover-page input[type=checkbox]').first().isChecked(),true,'self check survives band changes');
    for(const mode of ['questions','answers','both','quick']){
      await page.locator('#printMode').selectOption(mode);await ready();
      assert.equal(await page.locator('.question-page').count(),['questions','both'].includes(mode)?1:0);
      assert.equal(await page.locator('.cover-page').count(),['questions','both'].includes(mode)?1:0);
      assert.equal(await page.locator('.solution-card').count(),['answers','both'].includes(mode)?6:0);
      assert.equal(await page.locator('.duplex-blank').count(),0,'2 preceding pages / answer-only modes have no blank');
      await save('subset6-'+mode);
    }
    await page.locator('#printMode').selectOption('both');await ready();
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'390px has no horizontal overflow');
    assert.deepEqual(await page.locator('.qcard').evaluateAll(ns=>ns.filter(n=>n.scrollHeight>n.clientHeight+2||n.scrollWidth>n.clientWidth+2).map(n=>n.dataset.index)),[],'mobile long question content is not hidden');
    if(output)await page.screenshot({path:path.join(output,'mobile390.png')});
    await page.setViewportSize({width:1280,height:1100});
    await page.goto(base+'?bank=final1&gens=final1-q17,final1-q18,final1-q19',{waitUntil:'networkidle'});await ready();
    assert.equal(await page.locator('.duplex-blank').count(),1,'cover + 2 questions = 3 before answers');await save('subset9-both');
    await page.locator('#final1Worksheet [data-val="2.7"]').click();await page.waitForTimeout(100);
    assert.equal(await page.locator('.qcard').count(),0);assert.equal(await page.locator('#btnPrint').isDisabled(),true);
    for(const query of ['bank=final1&gens=final1-q01,missing','practice=wrong&per=3&source=final%7C1','bank=final1&gens=final1-q01,final1-q01']){
      await page.goto(base+'?'+query,{waitUntil:'networkidle'});
      assert.equal(await page.locator('.qcard').count(),0,'invalid scope fails closed: '+query);
      assert.equal(await page.locator('#btnPrint').isDisabled(),true);
    }
    const pending=await page.evaluate(async()=>{
      const d=structuredClone(await BANK_FIXED.load());d.items.find(q=>q.genId==='final1-q01').reviewStatus='pending';
      try{BANK_FIXED.select(d,{genIds:['final1-q01'],pointBand:'all'});return 'NOT_BLOCKED';}catch(e){return e.message;}
    });assert.match(pending,/검수 중/,'one pending variant blocks its complete source group');
    // Negative control: a non-PNG asset must be rejected, not silently omitted.
    const broken=structuredClone(data);broken.items.forEach(q=>q.reviewStatus='verified');broken.items.find(q=>q.genId==='final1-q02').asset={kind:'svg',src:'data:image/svg+xml,bad'};
    await page.route('**/final1-fixed90.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(broken)}));
    await page.goto(base+'?bank=final1&gens=final1-q02',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.qcard').count(),0);assert.equal(await page.locator('#btnPrint').isDisabled(),true);
    assert.match(await page.locator('#f1Status').textContent(),/그림을 확인/);
    const anonymous=await browser.newPage();
    await anonymous.route('https://**/*',r=>r.abort());
    await anonymous.goto(base+'?bank=final1&gens=final1-q01',{waitUntil:'networkidle'});
    await anonymous.waitForFunction(()=>{const b=document.querySelector('#final1Worksheet #btnPrint');return b&&!b.disabled;});
    await watermarks(anonymous);
    assert.match(await anonymous.locator('.cover-page .wm-layer').textContent(),/학습 자료 · 지필드 영재교육/,'no student name still has mandatory branding');
    await anonymous.close();
    assert.deepEqual(errors,[]);
    console.log((draft?'DRAFT LAYOUT ONLY; ':'')+'PASS fixed worksheet: 90 exact items, mixed types, 6 equal cells/page, cover30, identity display, all 4 modes, duplex parity, self-check, mobile, fail-closed scope, no random assembly');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
