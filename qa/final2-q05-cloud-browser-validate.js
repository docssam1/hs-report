'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'bank','data','final2-fixed90.json'),'utf8'));
const output=process.env.GFIELD_Q5_REVIEW_IMAGE;

(async()=>{
  const items=data.items.filter(item=>item.sourceNo===5).sort((a,b)=>a.variantNo-b.variantNo);
  assert.equal(items.length,3);
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:960,height:760},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><html lang="ko"><style>
      *{box-sizing:border-box}body{margin:0;padding:28px;font-family:"Noto Sans KR",Arial,sans-serif;color:#182230;background:#f7f9fc}
      .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.card{border:1px solid #c8d2e1;border-radius:12px;padding:18px;background:#fff}
      .number{font-size:24px;font-weight:900;color:#2456c4}.question{font-size:17px;line-height:1.55;min-height:112px}.card img{display:block;width:220px;height:220px;object-fit:contain;margin:10px auto 0}
      #solution{width:620px;margin:24px auto 0;padding:18px;border:1px solid #c8d2e1;border-radius:12px;background:#fff}
    </style><div class="grid">${items.map(item=>`<article class="card" data-variant="${item.variantNo}"><div class="number">${item.variantNo}</div><p class="question">${item.text}</p><img src="${item.asset.src}" alt="${item.asset.description}"></article>`).join('')}</div><section id="solution"></section></html>`);
    await page.locator('img').first().waitFor();
    await page.addScriptTag({path:path.join(root,'final2-solution-diagrams.js')});
    const solutionHtml=await page.evaluate(()=>{
      const html=window.GFIELD_FINAL2_SOLUTION_DIAGRAMS.render(5);
      document.querySelector('#solution').innerHTML=html;
      return html;
    });
    assert.equal(await page.locator('[data-variant]').count(),3);
    for(const item of items){
      assert.equal(item.asset.width,220);
      assert.equal(item.asset.height,220);
      assert.equal(item.assetSpec.kind,'cloud-region-map');
      assert.equal(item.assetSpec.dividerPaths.length,5);
      assert.equal(item.assetSpec.labels.length,6);
      assert.equal(item.assetSpec.labels.filter(label=>label.id==='라').length,1);
      assert.ok(item.assetSpec.outlinePath.split(' C').length>=10,'outer boundary stays irregular rather than circular');
      assert.ok(item.assetSpec.centerPath.split(' C').length>=7,'center country stays asymmetrical rather than circular');
    }
    assert.equal(new Set(items.map(item=>item.assetSpec.outlinePath)).size,3,'each variation uses its own map outline');
    assert.equal(new Set(items.map(item=>item.assetSpec.centerPath)).size,3,'each variation uses its own center-country boundary');
    assert.equal((solutionHtml.match(/class="gfield-final2-q5-divider"/g)||[]).length,5);
    assert.equal((solutionHtml.match(/<circle\b/g)||[]).length,0,'solution map also avoids point markers');
    if(output){
      fs.mkdirSync(path.dirname(output),{recursive:true});
      await page.screenshot({path:output,fullPage:true});
    }
    console.log('PASS Final2 Q5: three irregular Europe-like maps, one outer boundary, five curved dividers, six labels, no point marker');
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
