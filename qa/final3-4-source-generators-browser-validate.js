'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const ROOT=path.resolve(__dirname,'..');
function server(){
  const host=http.createServer((request,response)=>{
    const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname));
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
      response.writeHead(404);response.end();return;
    }
    const mime=({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'})[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'content-type':mime,'cache-control':'no-store'});fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve=>host.listen(0,'127.0.0.1',()=>resolve(host)));
}
(async()=>{
  const host=await server(),browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>localStorage.setItem('gfield_student','문항검수학생'));
    for(const [bank,no] of [['final3',9],['final3',10],['final4',2],['final4',7]]){
      const key=bank+'-q'+String(no).padStart(2,'0');
      await page.goto(`http://127.0.0.1:${host.address().port}/bank/index.html?bank=${bank}&gens=${key}&view=grouped&printMode=both`,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>document.querySelector('#btnPrint')&&!document.querySelector('#btnPrint').disabled);
      assert.equal(await page.locator('.qcard').count(),3);
      assert.equal(await page.locator('.solution-card').count(),3);
      assert.equal(await page.locator('[data-role="fresh"]').count(),1);
      assert.equal(await page.locator('#final1Worksheet .f1-counts').isHidden(),true);
      await page.locator('#final1Worksheet [data-role="points"][data-val="3.4"]').click();
      await page.waitForFunction(()=>document.querySelector('#f1Status')?.textContent.includes('없습니다'));
      assert.equal(await page.locator('[data-role="fresh"]').isDisabled(),true);
      await page.locator('#final1Worksheet [data-role="points"][data-val="all"]').click();
      await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===3&&!document.querySelector('#btnPrint').disabled);
      await page.locator('[data-role="fresh"]').click();
      await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===20&&!document.querySelector('#btnPrint').disabled);
      assert.equal(await page.locator('#final1Worksheet .f1-counts').isVisible(),true);
      assert.equal(await page.locator('.solution-card').count(),20);
      assert.equal(await page.locator('.qcard [data-item-id$="-g4"]').count(),1);
      assert.equal(new URL(page.url()).searchParams.get('fresh'),'1');
      assert.equal(await page.locator('.qcard').evaluateAll((cards,sourceNo)=>cards.filter(card=>card.dataset.sourceNo!==String(sourceNo)).length,no),0);
      assert.equal(await page.locator('.qcard .ans, .qcard .solution-card').count(),0);
      const IDs=await page.locator('.qcard').evaluateAll(cards=>cards.map(card=>card.querySelector('[data-item-id]').dataset.itemId));
      const answerIDs=await page.locator('.solution-card').evaluateAll(cards=>cards.map(card=>card.dataset.answerId));
      assert.deepEqual(IDs,answerIDs);
      await page.locator('[data-role="count"][data-val="40"]').click();
      await page.waitForFunction(()=>document.querySelectorAll('.qcard').length===40&&!document.querySelector('#btnPrint').disabled);
      assert.equal(await page.locator('.solution-card').count(),40);
      assert.equal(await page.locator('.wm-layer').count()>0,true);
      await page.emulateMedia({media:'print'});
      const overflow=await page.locator('.question-page, .answer-page').evaluateAll(sheets=>sheets.flatMap((sheet,pageIndex)=>{
        const css=getComputedStyle(sheet),bottom=sheet.getBoundingClientRect().bottom-(parseFloat(css.paddingBottom)||0);
        const cards=[...sheet.querySelectorAll('.qcard, .solution-card')];
        return cards.filter(card=>card.getBoundingClientRect().bottom>bottom+2).map(card=>[pageIndex,card.dataset.index||card.dataset.answerId]);
      }));
      assert.deepEqual(overflow,[],`${bank}: 인쇄 페이지 카드 넘침`);
      await page.emulateMedia({media:null});
      await page.setViewportSize({width:390,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      await page.setViewportSize({width:1280,height:900});
    }
    await page.goto(`http://127.0.0.1:${host.address().port}/bank/index.html?bank=final3&gens=final3-q08&fresh=1`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#btnPrint')&&!document.querySelector('#btnPrint').disabled);
    assert.equal(await page.locator('.qcard').count(),3);
    assert.equal(await page.locator('[data-role="fresh"]').count(),0);
    assert.equal(new URL(page.url()).searchParams.get('fresh'),null);
    assert.deepEqual(errors,[]);
  }finally{await browser.close();host.close();}
  console.log('PASS Final 3/4 four fresh source types: default 3, opt-in 20/40, source/answer pairing, access, mobile, fail-closed');
})().catch(error=>{console.error(error);process.exitCode=1;});
