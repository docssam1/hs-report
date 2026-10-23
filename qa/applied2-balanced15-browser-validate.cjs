'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/balanced15-20261024/round2-batch3/output-qa');
fs.mkdirSync(out,{recursive:true});
const file=path.join(root,'bank/data/applied2-balanced15.json'),raw=JSON.parse(fs.readFileSync(file)),preview=structuredClone(raw);
preview.items.forEach(x=>x.reviewStatus='verified');
const adapter=require('../bank/adapters/applied2-balanced15-adapter.js');
adapter.useData(raw);
assert.equal(adapter.listTypes().length,raw.availableSourceNos.filter(no=>raw.items.filter(x=>x.sourceNo===no).every(x=>x.reviewStatus==='verified')).length);
adapter.useData(preview);assert.equal(adapter.listTypes().length,18);assert.equal(adapter.select(raw.availableSourceNos,15).length,270);
for(const no of raw.availableSourceNos){
 for(const count of [3,6,9,15])for(const level of ['low','middle','high'])assert.equal(adapter.select([no],count).filter(x=>x.practiceLevel===level).length,count/3);
 for(const difficulty of ['하','중','상'])assert.equal(adapter.select([no],15,{difficulty}).length,5);
}
assert.throws(()=>adapter.select([19],15));assert.throws(()=>adapter.select([1,1],15));assert.throws(()=>adapter.select([1],12));
const corrupt=structuredClone(preview);corrupt.items.find(x=>x.sourceNo===3).reviewStatus='pending';adapter.useData(corrupt);assert.equal(adapter.listTypes().length,17);assert.throws(()=>adapter.select([3],15));
const missing=structuredClone(preview);missing.items.pop();assert.throws(()=>adapter.useData(missing));
assert.throws(()=>adapter.useData(JSON.parse(fs.readFileSync(path.join(root,'bank/data/applied1-balanced15.json')))));adapter.useData(preview);
const server=http.createServer((req,res)=>{
 const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),c=await browser.newContext({acceptDownloads:true}),errors=[],writes=[];
 await c.route(/^https?:\/\//,route=>{
  const q=route.request(),u=new URL(q.url());
  if(u.origin!==base){if(!['GET','HEAD'].includes(q.method()))writes.push(q.method()+' '+u.pathname);return route.abort();}
  if(u.pathname==='/bank/data/applied2-balanced15.json'&&process.env.GFIELD_BALANCED15_RELEASED!=='1')return route.fulfill({json:preview});
  return route.continue();
 });
 const preserved=raw.items.find(x=>x.id==='applied2-q01-v1');
 await c.addInitScript(item=>{localStorage.setItem('gfield_mock_hw_hw:local-tester','{"2":[{"score":81,"by":"teacher"}]}');localStorage.setItem('gfield_practice_pool_v2:local-tester:'+encodeURIComponent(item.practiceStorageVersion)+':'+item.id,JSON.stringify([{correct:false,values:['0']},{correct:true,values:item.answerParts.map(String)},{correct:true,values:item.answerParts.map(String)}]));},preserved);
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 async function open(query){await p.goto(base+'/bank/pool.html?bank=applied2-balanced15&'+query);await p.waitForFunction(()=>window.__POOL_QA__?.ready===true,null,{timeout:30000});}
 try{
  await p.setViewportSize({width:1440,height:1200});await open('count=15');
  assert.equal(await p.locator('.question').count(),270);assert.equal(await p.locator('.solution').count(),270);
  assert.equal(await p.locator('.q-figure img').count(),180);assert.equal(await p.locator('.vertical-calc').count(),15);assert.equal(await p.locator('.given-table').count(),20);assert.equal(await p.locator('[data-answer-row="'+preserved.id+'"] input').isDisabled(),true);
  assert.equal(await p.locator('.solution-figure img').count(),45);assert.equal(await p.locator('.question .solution-figure').count(),0);assert.equal(await p.locator('.given-table[aria-label="정사각형 종이의 가격"]').count(),5);assert.ok(await p.locator('.solution-figure img').evaluateAll(nodes=>nodes.every(n=>n.complete&&n.naturalWidth>0&&n.naturalHeight>0)));
  assert.match(await p.locator('#poolTitle').textContent(),/활용 2회.*하·중·상 각각 5문제/);
  assert.match(await p.locator('#originalExamLink').getAttribute('href'),/round=2/);
  const original=await p.evaluate(()=>localStorage.getItem('gfield_mock_hw_hw:local-tester'));
  const overflows=await p.locator('.question,.answers-page .page-body').evaluateAll(nodes=>nodes.filter(n=>n.scrollHeight>n.clientHeight+1).map(n=>({id:n.dataset.itemId||'answer',client:n.clientHeight,scroll:n.scrollHeight})));
  if(overflows.length){console.log(overflows);await p.locator('[data-item-id="'+overflows[0].id+'"]').locator('xpath=ancestor::section[contains(@class,"page")]').screenshot({path:path.join(out,'overflow.png')});}
  assert.deepEqual(overflows,[]);
  assert.ok((await p.locator('.q-text').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).fontFamily.includes('GFIELD Print Serif')&&getComputedStyle(n).fontWeight==='400'))).every(Boolean));
  const figures=await p.locator('.q-figure img').evaluateAll(nodes=>nodes.map(n=>({src:n.getAttribute('src'),loaded:n.complete,w:n.naturalWidth,h:n.naturalHeight,displayHeight:n.getBoundingClientRect().height})));
  for(const [src,w,h,n]of [['triangle-chain.png',330,130,5],['triangle-chain-original.png',340,138,10],['projections-original.png',420,165,15],['balances-original.png',264,243,15],['alternating-triangle.png',493,153,15],['coops-original.png',373,248,15],['plates-original.png',589,397,15],['checker-frames.png',597,171,15],['hinged-tool-original.png',605,124,15],['beads-original.png',686,349,15],['fold-cut-original.png',584,197,15],['projections4-original.png',465,170,15],['square-cover-original.png',302,255,15]])assert.equal(figures.filter(x=>x.loaded&&x.src.endsWith('/'+src)&&x.w===w&&x.h===h).length,n);
  assert.ok(figures.filter(x=>x.src.endsWith('balances-original.png')).every(x=>x.displayHeight===200));
  for(const level of ['하','중','상']){await p.selectOption('#difficulty',level);await p.click('#build');assert.equal(await p.locator('.question').count(),90);assert.ok((await p.locator('.q-head small').allTextContents()).every(x=>x.includes(level)));}
  await p.selectOption('#difficulty','all');await p.click('#build');
  for(const page of await p.locator('.questions-page').all()){
   const cells=await page.locator('.question').evaluateAll(nodes=>nodes.map(n=>[Number(n.style.gridColumn),Number(n.style.gridRow)]));
   const n=await page.locator('.question-grid').evaluate(n=>n.classList.contains('two')?2:n.classList.contains('four')?4:6);
   assert.deepEqual(cells,cells.map((_,i)=>[Math.floor(i/(n/2))+1,i%(n/2)+1]));
  }
  const qpages=await p.locator('.questions-page').count(),apages=await p.locator('.answers-page').count();assert.equal(await p.locator('.duplex-blank').count(),qpages%2);
  for(const no of raw.availableSourceNos.filter(n=>n>=13))for(const level of ['low','middle','high']){
   const item=preview.items.find(x=>x.sourceNo===no&&x.practiceLevel===level);
   await p.locator('[data-item-id="'+item.id+'"]').locator('xpath=ancestor::section[contains(@class,"page")]').screenshot({path:path.join(out,`source${no}-${level}.png`)});
  }
  for(const no of [13,14,15,16,17,18]){
   const item=preview.items.find(x=>x.sourceNo===no&&x.practiceLevel==='high');
   await p.locator('[data-answer-id="'+item.id+'"].solution').locator('xpath=ancestor::section[contains(@class,"page")]').screenshot({path:path.join(out,`solution-source${no}-high.png`)});
  }
  await p.selectOption('#printMode','questions');await p.pdf({path:path.join(out,'balanced270-questions.pdf'),preferCSSPageSize:true,printBackground:true});
  await p.selectOption('#printMode','answers');await p.pdf({path:path.join(out,'balanced270-solutions.pdf'),preferCSSPageSize:true,printBackground:true});
  // Fill actual inputs, including zero in the cryptarithm, ordered pairs and triples.
  const target=preview.items.find(x=>x.sourceNo===3&&x.practiceLevel==='low');
  const targetInputs=p.locator('[data-answer-row="'+target.id+'"] input');
  for(let i=0;i<target.answerParts.length;i++)await targetInputs.nth(i).fill('999');await p.click('#grade');
  const selected=await p.evaluate(()=>window.__POOL_QA__.selectedIds);
  for(const id of selected){
   const item=preview.items.find(x=>x.id===id),inputs=p.locator('[data-answer-row="'+id+'"] input');assert.equal(await inputs.count(),item.answerParts.length);
   assert.equal(await p.evaluate(x=>window.__POOL_QA__.checkAnswer(x,x.answerParts.map(String)),item),true);
   assert.equal(await p.evaluate(x=>window.__POOL_QA__.checkAnswer(x,x.answerParts.map(()=>"999999")),item),false);
   if(item.answerParts.length>1&&item.answerParts[0]!==item.answerParts.at(-1))assert.equal(await p.evaluate(x=>window.__POOL_QA__.checkAnswer(x,x.answerParts.slice().reverse().map(String)),item),false);
   if(item.id!==preserved.id)for(let i=0;i<item.answerParts.length;i++)await inputs.nth(i).fill(String(item.answerParts[i]));
  }
  await p.click('#grade');assert.equal(await p.locator('#diagnosis [data-diagnosis]').count(),270);
  for(const no of raw.availableSourceNos){
   const item=preview.items.find(x=>x.sourceNo===no&&x.practiceLevel==='high'),diag=p.locator('[data-diagnosis="'+item.id+'"]');
   assert.match(await diag.textContent(),/학습 포인트/);const href=await diag.locator('a').first().getAttribute('href');assert.match(decodeURIComponent(href),new RegExp('활용 2회.pdf#page='+item.verification.sourceExamPage));
   assert.equal(await p.locator(await diag.locator('a').nth(1).getAttribute('href')).count(),1);
   assert.match(await diag.locator('a').last().getAttribute('href'),new RegExp('bank=applied2-balanced15.*nos='+no+'.*count=15'));
  }
  const key='gfield_practice_pool_v2:local-tester:'+encodeURIComponent(target.practiceStorageVersion)+':'+target.id;
  let history=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(history.length,2);assert.equal(history[0].correct,false);assert.equal(history[1].correct,true);
  await p.click('#grade');assert.equal(await targetInputs.first().isDisabled(),true);await p.click('#grade');history=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(history.length,3);
  assert.match(await p.locator('[data-diagnosis="'+target.id+'"]').textContent(),/최초 연습 오답/);
  assert.equal(await p.evaluate(()=>localStorage.getItem('gfield_mock_hw_hw:local-tester')),original);
  for(const no of raw.availableSourceNos){await p.setViewportSize({width:375,height:812});await open('nos='+no+'&count=15');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);if(no>=13)await p.screenshot({path:path.join(out,`source${no}-375.png`)});}
  await open('nos=3&count=15');assert.equal(await p.locator('[data-answer-row="'+target.id+'"] input').first().isDisabled(),true);
  await p.setViewportSize({width:1440,height:1200});await open('count=15');
  const reuse=process.env.GFIELD_BALANCED15_REUSE_EXACT_ZIP==='1';
  if(reuse){assert.equal(process.env.GFIELD_BALANCED15_RELEASED,'1');assert.ok(fs.existsSync(path.join(out,'balanced270.zip')));}
  else{const event=p.waitForEvent('download',{timeout:600000});await p.click('#downloadZip');await(await event).saveAs(path.join(out,'balanced270.zip'));assert.match(await p.locator('#exportStatus').textContent(),/270문항을 빠짐없이/);}
  assert.equal(await p.locator('.export-stage').count(),0);assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  fs.writeFileSync(path.join(out,'browser-evidence.json'),JSON.stringify({dataSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),count:270,sourceTypes:18,perType:{low:5,middle:5,high:5},questionPdfPages:qpages,solutionPdfPages:apages,originalDrawings:180,verticalCalculations:15,essentialRankTables:15,essentialPriceTables:5,solutionFigures:45,prior180StoragePreserved:true,overflow:0,viewports:[1440,375],answerInput:true,maxAttempts:3,firstAttemptPreserved:true,sourceGradesWritten:false,externalWrites:writes,actualZip:'balanced270.zip',actualZipExportedThisRun:!reuse,requiresExactReleasedZipComparison:reuse},null,2));
  console.log('PASS Applied2 eighteen5/5/5 groups;270input/solution pairs;180 original figures/15aligned sums/15rank tables;prior180 storage preserved;two columns;375px;3attempts/first preserved;actualZIP;writes0');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
