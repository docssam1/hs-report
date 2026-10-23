'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/balanced15-20261024/output-qa');fs.mkdirSync(out,{recursive:true});
const file=path.join(root,'bank/data/applied1-balanced15.json'),raw=JSON.parse(fs.readFileSync(file,'utf8')),preview=structuredClone(raw);preview.items.forEach(x=>x.reviewStatus='verified');
const adapter=require('../bank/adapters/applied1-balanced15-adapter.js');
adapter.useData(raw);if(raw.items.some(x=>x.reviewStatus!=='verified'))assert.equal(adapter.listTypes().length,0);
adapter.useData(preview);assert.equal(adapter.listTypes().length,3);assert.equal(adapter.select([1,2,3],15).length,45);
for(const no of [1,2,3]){for(const count of [3,6,9,15]){const chosen=adapter.select([no],count);for(const level of ['low','middle','high'])assert.equal(chosen.filter(x=>x.practiceLevel===level).length,count/3);}assert.throws(()=>adapter.select([no],15,{difficulty:'中'}));assert.equal(adapter.select([no],15,{difficulty:'중'}).length,5);}
assert.throws(()=>adapter.select([4],15));assert.throws(()=>adapter.select([1,1],15));assert.throws(()=>adapter.select([1],12));
const corrupt=structuredClone(preview);corrupt.items.find(x=>x.practiceLevel==='middle').reviewStatus='pending';adapter.useData(corrupt);assert.equal(adapter.listTypes().length,2);assert.throws(()=>adapter.select([1],15));adapter.useData(preview);
const missing=structuredClone(preview);missing.items.pop();assert.throws(()=>adapter.useData(missing));adapter.useData(preview);
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.png':'image/png'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),c=await browser.newContext({acceptDownloads:true}),errors=[],writes=[];
await c.route(/^https?:\/\//,route=>{const q=route.request(),u=new URL(q.url());if(u.origin!==base){if(!['GET','HEAD'].includes(q.method()))writes.push(q.method()+' '+u.pathname);return route.abort();}if(u.pathname==='/bank/data/applied1-balanced15.json'&&process.env.GFIELD_BALANCED15_RELEASED!=='1')return route.fulfill({json:preview});return route.continue();});
const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
async function open(query){await p.goto(base+'/bank/pool.html?bank=applied1-balanced15&'+query);await p.waitForFunction(()=>window.__POOL_QA__?.ready===true,null,{timeout:30000});}
try{
 await p.setViewportSize({width:1440,height:1200});await open('count=15');
 assert.equal(await p.locator('.question').count(),45);assert.equal(await p.locator('.solution').count(),45);assert.equal(await p.locator('.q-figure img').count(),15);
 assert.match(await p.locator('#poolTitle').textContent(),/하·중·상 각각 5문제/);
 const baseline=await p.evaluate(()=>JSON.stringify(localStorage));
 const overflows=await p.locator('.question,.answers-page .page-body').evaluateAll(nodes=>nodes.filter(n=>n.scrollHeight>n.clientHeight+1).map(n=>n.dataset.itemId||'answers'));assert.deepEqual(overflows,[]);
 for(const level of ['하','중','상']){await p.selectOption('#difficulty',level);await p.click('#build');assert.equal(await p.locator('.question').count(),15);assert.ok((await p.locator('.q-head small').allTextContents()).every(x=>x.includes(level)));}
 await p.selectOption('#difficulty','all');await p.click('#build');assert.equal(await p.locator('.question').count(),45);
 const positions=await p.locator('.questions-page').first().locator('.question').evaluateAll(nodes=>nodes.map(n=>[n.style.gridColumn,n.style.gridRow]));assert.deepEqual(positions,[['1','1'],['1','2'],['2','1'],['2','2']]);
 const qpages=await p.locator('.questions-page').count(),apages=await p.locator('.answers-page').count();assert.equal(await p.locator('.duplex-blank').count(),qpages%2);
 for(const id of ['applied1-q01-middle-v1','applied1-q01-high-v1','applied1-q02-high-v1','applied1-q03-high-v1'])await p.locator('[data-item-id="'+id+'"]').locator('xpath=ancestor::section[contains(@class,"page")]').screenshot({path:path.join(out,id+'.png')});
 await p.selectOption('#printMode','questions');await p.pdf({path:path.join(out,'balanced45-questions.pdf'),preferCSSPageSize:true,printBackground:true});await p.selectOption('#printMode','answers');await p.pdf({path:path.join(out,'balanced45-solutions.pdf'),preferCSSPageSize:true,printBackground:true});
 await p.setViewportSize({width:375,height:812});await open('nos=1&count=15');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:path.join(out,'practice-375.png')});
 const target=preview.items.find(x=>x.id==='applied1-q01-middle-v1');for(const label of target.answerLabels)await p.getByLabel('6번 '+label,{exact:true}).fill('0');await p.click('#grade');
 for(let i=0;i<target.answerLabels.length;i++)await p.getByLabel('6번 '+target.answerLabels[i],{exact:true}).fill(String(target.answerParts[i]));await p.click('#grade');
 const key='gfield_practice_pool_v2:local-tester:'+encodeURIComponent(raw.version)+':'+target.id;let h=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(h.length,2);assert.equal(h[0].correct,false);assert.equal(h[1].correct,true);await p.click('#grade');assert.equal(await p.getByLabel('6번 첫 번째 수',{exact:true}).isDisabled(),true);await p.click('#grade');h=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(h.length,3);
 const diagnosis=p.locator('[data-diagnosis="'+target.id+'"]');assert.match(await diagnosis.textContent(),/최초 연습 오답/);assert.match(await diagnosis.locator('a').last().getAttribute('href'),/bank=applied1-balanced15.*nos=1.*count=15/);assert.match(await diagnosis.locator('a').first().getAttribute('href'),/#page=1/);
 // Actual ZIP for all three sources, including questions and detailed solutions.
 await p.setViewportSize({width:1440,height:1200});await open('count=15');const event=p.waitForEvent('download',{timeout:180000});await p.click('#downloadZip');const download=await event;await download.saveAs(path.join(out,'balanced45.zip'));assert.match(await p.locator('#exportStatus').textContent(),/45문항을 빠짐없이/);assert.equal(await p.locator('.export-stage').count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 fs.writeFileSync(path.join(out,'browser-evidence.json'),JSON.stringify({dataSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),count:45,sourceTypes:3,perType:{low:5,middle:5,high:5},questionPdfPages:qpages,solutionPdfPages:apages,originalDrawings:15,overflow:0,viewports:[1440,375],answerInput:true,maxAttempts:3,firstAttemptPreserved:true,sourceGradesWritten:false,externalWrites:writes,actualZip:'balanced45.zip'},null,2));
 console.log('PASS three 5/5/5 groups, 45 question/solution pairs, 15 original figures, level filters, two-column order, 375px, three-part grading, 3 attempts/first score, exact practice links, actual 7-entry ZIP, external writes 0');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
