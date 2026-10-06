'use strict';
// Existing eight-round fixture; no real student records or external writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const url=process.env.GFIELD_TREND_QA_BASE
  ?process.env.GFIELD_TREND_QA_BASE.replace(/\/$/,'')+'/qa/final-score-trend-preview.html'
  :pathToFileURL(path.join(__dirname,'final-score-trend-preview.html')).href;
const dir=path.join(root,'.private-work','ignored','score-trend-readability');
async function chartMetrics(page,minimum){
  const charts=await page.locator('.score-trend-chart svg').evaluateAll(items=>items.map(svg=>{
    const transform=svg.getScreenCTM(),box=svg.viewBox.baseVal;
    const labels=[...svg.querySelectorAll('.trend-round-label')];
    return {width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height,
      font:parseFloat(getComputedStyle(labels[0]).fontSize)*transform.a,
      labels:labels.map(label=>({name:label.getAttribute('aria-label'),box:JSON.parse(JSON.stringify({x:label.getBBox().x,y:label.getBBox().y,width:label.getBBox().width,height:label.getBBox().height}))})),
      viewWidth:box.width,viewHeight:box.height};
  }));
  for(const chart of charts){
    assert.equal(chart.labels.length,8);
    assert.ok(chart.font>=minimum,'round label size '+chart.font+' below '+minimum);
    for(let i=0;i<chart.labels.length;i++){
      const current=chart.labels[i].box;
      assert.ok(current.x>=0&&current.x+current.width<=chart.viewWidth,'round text stays inside SVG');
      assert.ok(current.y>=0&&current.y+current.height<=chart.viewHeight,'round text not clipped below SVG');
      if(i)assert.ok(chart.labels[i-1].box.x+chart.labels[i-1].box.width<=current.x,'round labels do not overlap');
    }
  }
  return charts.map(({font,width,height})=>({font,width,height}));
}
(async()=>{
  fs.mkdirSync(dir,{recursive:true});
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1100,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);await page.evaluate(()=>document.fonts.ready);
    console.log('PASS desktop',await chartMetrics(page,14));
    assert.equal(await page.locator('.score-trend-table-wrap tbody tr').count(),8);
    assert.ok(await page.locator('.score-trend-table-wrap table').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=14));
    await page.screenshot({path:path.join(dir,'desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:1000});
    console.log('PASS mobile',await chartMetrics(page,14));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page-wide horizontal overflow');
    await page.locator('.score-trend-plot').first().evaluate(e=>{e.scrollLeft=e.scrollWidth;});
    assert.ok(await page.locator('.score-trend-plot').first().evaluate(e=>e.scrollLeft>0),'last round accessible by scrolling chart');
    await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
    await page.setViewportSize({width:794,height:1123});await page.emulateMedia({media:'print'});
    console.log('PASS print',await chartMetrics(page,12));
    assert.ok(await page.locator('.score-trend-table-wrap table').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=12));
    await page.pdf({path:path.join(dir,'eight-round-trend.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true});
    // Keep missing records as gaps, not zero; render a lone attendance without inventing a line.
    await page.evaluate(()=>{
      document.querySelector('#preview').innerHTML=GFIELD_FINAL_SCORE_TREND.render(GFIELD_FINAL_SCORE_TREND.model([{key:'last1',score:56.1,average:32.4,percentile:10.9,grade:'경시컷'}],[]));
    });
    assert.equal(await page.locator('.trend-personal circle').count(),2);
    assert.equal(await page.locator('.trend-personal polyline').count(),0);
    assert.equal(await page.locator('.score-trend-table-wrap tbody tr').count(),1);
    assert.deepEqual(errors,[]);
    console.log('PASS one attendance, preserved gaps, zero browser errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
