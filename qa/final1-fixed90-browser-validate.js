'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'bank/data/final1-fixed90.json'), 'utf8'));
const output = process.env.GFIELD_FIXED90_REVIEW_DIR;
const draftLayout = process.argv.includes('--draft-layout');
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
  res.setHeader('content-type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'application/javascript; charset=utf-8' : 'application/json');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:1100}});
    const errors = [];
    page.on('pageerror', e=>errors.push(e.message));
    await page.route('https://**/*', route=>route.abort());
    if(draftLayout){
      const fixture=JSON.parse(JSON.stringify(data));fixture.items.forEach(q=>{q.reviewStatus='verified';});
      await page.route('**/final1-fixed90.json*',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(fixture)}));
    }
    // Prove that the student path can work with all random assembly disabled.
    await page.route('**/bank-core.js*', route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'bank/bank-core.js'),'utf8')+';window.BANK_CORE.buildPaper=function(){throw new Error("RANDOM_ASSEMBLY_FORBIDDEN")};'}));
    const base = `http://127.0.0.1:${server.address().port}/bank/index.html`;
    await page.goto(base+'?bank=final1', {waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===90);
    const expectedIds = data.items.slice().sort((a,b)=>a.sourceNo-b.sourceNo||a.variantNo-b.variantNo).map(q=>q.id);
    assert.deepEqual(await page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.itemId)), expectedIds);
    assert.equal(await page.locator('.question-page').count(),15);
    assert.deepEqual(await page.locator('.question-page').evaluateAll(nodes=>nodes.map(n=>n.querySelectorAll('.qcard').length)),Array(15).fill(6));
    const rendered = await page.locator('.qtext').allTextContents();
    assert.deepEqual(rendered,data.items.slice().sort((a,b)=>a.sourceNo-b.sourceNo||a.variantNo-b.variantNo).map(q=>q.text));
    assert.doesNotMatch(await page.locator('#stage').innerText(),/undefined|NaN|\[object Object\]/,'no broken condition labels or values');
    assert.equal(await page.locator('.answer-page .anstable tbody tr').count(),90);
    assert.equal(await page.locator('#btnNew').isVisible(),false);
    assert.equal(await page.locator('[data-role="tune"]').first().isVisible(),false);
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('.qfigure img')).every(i=>i.complete&&i.naturalWidth>10));
    const clipped=await page.locator('.qcard').evaluateAll(cards=>cards.filter(c=>{
      const answer=c.querySelector('.answerline').getBoundingClientRect();
      const content=c.querySelector('.qfigure')||c.querySelector('.qmeta:last-of-type');
      return c.scrollWidth>c.clientWidth+1 || c.scrollHeight>c.clientHeight+2 || (content && content.getBoundingClientRect().bottom>answer.top+1);
    }).map(c=>c.dataset.index));
    assert.deepEqual(clipped,[], 'content fits each solving cell');
    const oversized=await page.locator('.page').evaluateAll(pages=>pages.map((p,i)=>({page:i+1,height:p.getBoundingClientRect().height})).filter(p=>p.height>297*96/25.4+2));
    if(output){
      fs.mkdirSync(output,{recursive:true});
      const pages=page.locator('.page');
      for(let i=0;i<await pages.count();i++)await pages.nth(i).screenshot({path:path.join(output,`page-${String(i+1).padStart(2,'0')}.png`)});
    }
    assert.deepEqual(oversized,[], 'questions and answer explanations fit an A4 preview page');
    await page.setViewportSize({width:703,height:1100});
    await page.emulateMedia({media:'print'});
    // The intentionally rotated watermark extends beyond the sheet; measure learning content.
    const printOverflow=await page.locator('.page').evaluateAll(pages=>pages.map((p,i)=>({page:i+1,height:p.getBoundingClientRect().height,width:(p.querySelector('.qpage')||p.querySelector('.anstable')).scrollWidth})).filter(p=>p.height>(297-24)*96/25.4+2||p.width>704));
    assert.deepEqual(printOverflow,[], 'A4 with 12mm print margins fits all question and answer pages');
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:1280,height:1100});
    for(const [band,count] of [['2.7',36],['3.4',30],['4.2',24]]){
      await page.locator(`[data-role="points"][data-val="${band}"]`).click();
      await page.waitForFunction(count=>document.querySelectorAll('.qcard').length===count,count);
      assert.equal(await page.locator(`.qcard:not([data-points="${band}"])`).count(),0);
    }
    await page.goto(base+'?bank=final1&gens=final1-q07,final1-q23&seed=ZZZZ',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===6);
    const subset=await page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.itemId));
    assert.deepEqual(subset,expectedIds.filter(id=>/^final1-q(07|23)-/.test(id)));
    await page.reload({waitUntil:'networkidle'});
    assert.deepEqual(await page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.itemId)),subset);
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
    await page.goto(base+'?bank=final1&gens=final1-q01,missing',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.qcard').count(),0);
    assert.equal(await page.locator('#btnPrint').isDisabled(),true);
    await page.goto(base+'?bank=final1&gens=final1-q01',{waitUntil:'networkidle'});
    const pendingMessage=await page.evaluate(async()=>{
      const d=JSON.parse(JSON.stringify(await BANK_FIXED.load()));d.items.find(q=>q.genId==='final1-q01').reviewStatus='pending';
      try{BANK_FIXED.select(d,{genIds:['final1-q01']});return 'NOT_BLOCKED';}catch(e){return e.message;}
    });
    assert.match(pendingMessage,/검수 중/);
    assert.deepEqual(errors,[]);
    console.log((draftLayout?'DRAFT LAYOUT ONLY (not content approval): ':'PASS fixed bank: ')+'90 stored records, 3/source, no random assembly, exact IDs and text, 6/page, answers after questions, filters, reload stability, invalid/pending blocked, mobile');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
