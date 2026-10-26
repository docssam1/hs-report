'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/hw-expansion-20261023/hw3/q16-viewport-fix-review');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),context=await browser.newContext({acceptDownloads:true}),errors=[],writes=[];
await context.route(/^https?:\/\//,route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==base){if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+u.pathname);return route.abort();}return route.continue();});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
async function open(q){await page.goto(base+'/bank/pool.html?bank=applied3&'+q);await page.waitForFunction(()=>window.__POOL_QA__?.ready===true,null,{timeout:30000});}
try{
 await page.setViewportSize({width:1440,height:1200});await open('nos=16&count=9');
 assert.equal(await page.locator('[data-item-id^="applied3-q16-v"]').count(),9);
 const figures=await page.locator('[data-item-id^="applied3-q16-v"] .q-figure img').evaluateAll(ns=>ns.map(n=>({loaded:n.complete,naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
 assert.equal(figures.length,9);assert.ok(figures.every(x=>x.loaded&&x.naturalWidth===520&&x.naturalHeight===530&&x.height<=250.1&&x.width>230));
 assert.deepEqual(await page.locator('.question,.answers-page .page-body').evaluateAll(ns=>ns.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).map(n=>n.dataset.itemId||'answer')),[]);
 await page.locator('[data-item-id="applied3-q16-v1"]').locator('xpath=ancestor::section[contains(@class,"page")]').screenshot({path:path.join(out,'question-page.png')});
 let download=page.waitForEvent('download',{timeout:600000});await page.click('#downloadZip');await(await download).saveAs(path.join(out,'q16-selected-9.zip'));
 await open('count=9');assert.equal(await page.locator('.question').count(),270);assert.equal(await page.locator('.solution').count(),270);
 assert.deepEqual(await page.locator('.question,.answers-page .page-body').evaluateAll(ns=>ns.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).map(n=>n.dataset.itemId||'answer')),[]);
 download=page.waitForEvent('download',{timeout:600000});await page.click('#downloadZip');await(await download).saveAs(path.join(out,'applied3-270-fixed.zip'));
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 fs.writeFileSync(path.join(out,'browser-evidence.json'),JSON.stringify({selected:9,full:270,figures,questionOverflow:0,solutionOverflow:0,externalWrites:writes,browserErrors:errors},null,2));
 console.log('PASS Applied3 Q16: nine full 520×530 diagrams, 270 questions and solutions, selected/full ZIP, overflow 0, external writes 0');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
