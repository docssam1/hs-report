'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'bank/data/applied2-balanced15.json')));
const adapter=require('../bank/adapters/applied2-balanced15-adapter.js');
const index=require('../bank/balanced-practice-index.js');
const locked=[13,15,22];
assert.deepEqual(data.pendingSourceNos,locked);
assert.equal(data.items.length,405);
assert.equal(data.availableSourceNos.length,27);
adapter.useData(data);
assert.equal(adapter.listTypes().length,27);
for(const no of locked){
  assert.equal(data.items.filter(x=>x.sourceNo===no).length,0);
  assert.equal(index.get('applied',2,no),null);
  assert.equal(index.url('applied',2,[no]),'');
  assert.throws(()=>adapter.select([no],9),/검수 대기/);
}
assert.equal(adapter.select([12],9).length,9);
assert.equal(adapter.select([14],9).length,9);

const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);return res.end();
  }
  res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch();
  const context=await browser.newContext();
  const writes=[];
  await context.route(/^https?:\/\//,route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===base)return route.continue();
    if(!['GET','HEAD'].includes(request.method()))writes.push(request.method()+' '+url.pathname);
    return route.abort();
  });
  const page=await context.newPage();
  try{
    await page.goto(base+'/bank/pool.html?bank=applied2-balanced15&count=9');
    await page.waitForFunction(()=>window.__POOL_QA__?.ready===true);
    assert.equal(await page.locator('.type-choice').count(),27);
    assert.equal(await page.locator('.question').count(),243);
    assert.equal(await page.locator('.solution').count(),243);
    for(const no of locked)assert.equal(await page.locator(`.type-choice input[value="${no}"]`).count(),0);
    await page.goto(base+'/bank/pool.html?bank=applied2-balanced15&nos=13&count=9');
    await page.waitForFunction(()=>document.querySelector('#poolStatus')?.classList.contains('error'));
    assert.match(await page.locator('#poolStatus').textContent(),/검수 대기/);
    assert.equal(await page.locator('.question').count(),0);
    assert.deepEqual(writes,[]);
    console.log('PASS Applied2 balanced bank: 27 visible types/243 default questions; Q13, Q15, Q22 and direct links locked; external writes 0');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
