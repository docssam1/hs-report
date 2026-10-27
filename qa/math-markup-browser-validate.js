'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const OUTPUT=path.join(ROOT,'.private-work','math-markup-review');
const server=http.createServer((request,response)=>{
  const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'};
  response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(file).pipe(response);
});

(async()=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1200}});
    await context.addInitScript(()=>localStorage.setItem('gfield_student','분수표기검수'));
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/bank/pool.html?bank=applied1&nos=15&count=3`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__POOL_QA__?.ready===true,null,{timeout:30000});
    const fractions=page.locator('.question .given math mfrac');
    const fractionCount=await fractions.count();
    assert.ok(fractionCount>=45,'활용 분수 자료는 브라우저 MathML로 표시됩니다.');
    assert.equal(await page.locator('.question .given .frac, .question .given .f1-frac').count(),0);
    assert.ok(await fractions.first().evaluate(node=>{
      const numerator=node.firstElementChild.getBoundingClientRect();
      const denominator=node.lastElementChild.getBoundingClientRect();
      return node.namespaceURI==='http://www.w3.org/1998/Math/MathML'&&numerator.bottom<denominator.top;
    }));
    const samples=await page.evaluate(()=>{
      const safe=GFIELD_MATH_MARKUP.render('분수 1/4 <script>alert(1)</script>');
      const probe=document.createElement('div');probe.innerHTML=safe;
      return {fractionCount:probe.querySelectorAll('math mfrac').length,scriptCount:probe.querySelectorAll('script').length,escaped:probe.innerHTML.includes('&lt;script&gt;')};
    });
    assert.deepEqual(samples,{fractionCount:1,scriptCount:0,escaped:true});
    const downloadEvent=page.waitForEvent('download',{timeout:240000});
    await page.locator('#downloadZip').click();
    const download=await downloadEvent;
    const zipPath=path.join(OUTPUT,'applied1-q15-3-mathml.zip');
    await download.saveAs(zipPath);
    assert.ok(fs.statSync(zipPath).size>10000);
    await page.goto(`http://127.0.0.1:${server.address().port}/bank/index.html?bank=final2&gens=final2-q26&printMode=questions`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#final1Worksheet #btnPrint')&&!document.querySelector('#final1Worksheet #btnPrint').disabled);
    assert.equal(await page.locator('.qcard[data-source-no="26"] math mfrac').count(),6,'파이널 학습지도 공통 MathML을 사용합니다.');
    assert.equal(await page.locator('.qcard[data-source-no="26"] .f1-frac').count(),0);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pass:true,fractions:fractionCount,zip:zipPath}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
