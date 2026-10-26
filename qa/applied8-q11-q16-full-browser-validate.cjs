'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_QA_OUT||path.join(root,'.private-work/hw-expansion-20261023/hw8/q11-q16-final-review');fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(root,'bank/data/applied8-expanded.json')));assert.equal(data.itemCount,270);assert.deepEqual(data.pendingSourceNos,[]);
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),context=await browser.newContext({acceptDownloads:true}),errors=[],writes=[];await context.route(/^https?:\/\//,route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==base){if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+u.pathname);return route.abort();}return route.continue();});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
try{
 await p.setViewportSize({width:1440,height:1200});await p.goto(base+'/bank/pool.html?bank=applied8&count=9');await p.waitForFunction(()=>window.__POOL_QA__?.ready===true,null,{timeout:30000});
 assert.equal(await p.locator('.question').count(),270);assert.equal(await p.locator('.solution').count(),270);
 assert.equal(await p.locator('[data-item-id^="applied8-q11-v"] .q-figure img').count(),9);
 assert.equal(await p.locator('[data-item-id^="applied8-q16-v"] .q-figure img').count(),9);
 assert.equal(await p.locator('.solution-figure img').count()>=18,true);
 assert.deepEqual(await p.locator('.question,.answers-page .page-body').evaluateAll(ns=>ns.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).map(n=>n.dataset.itemId||'solution')),[]);
 const event=p.waitForEvent('download',{timeout:600000});await p.click('#downloadZip');await(await event).saveAs(path.join(out,'applied8-270.zip'));assert.match(await p.locator('#exportStatus').textContent(),/270문항을 빠짐없이/);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 fs.writeFileSync(path.join(out,'full-browser-evidence.json'),JSON.stringify({count:270,sourceTypes:30,pending:[],fullZip:path.join(out,'applied8-270.zip'),externalWrites:writes,pageErrors:errors},null,2));
 console.log('PASS Applied8 Q11/Q16 full pool: 270 questions and solutions, figures, no overflow, full ZIP, external writes 0');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
