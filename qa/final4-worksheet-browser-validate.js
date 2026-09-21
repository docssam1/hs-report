'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const OUTPUT=process.env.GFIELD_WORKSHEET_REVIEW_DIR||path.join(ROOT,'.private-work','final4-similar','worksheet-proof');
const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined;
function server(){
  const instance=http.createServer((request,response)=>{
    const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname));
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
    const mime=({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'})[path.extname(file)]||'application/octet-stream';
    response.writeHead(200,{'content-type':mime,'cache-control':'no-store'});fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve=>instance.listen(0,'127.0.0.1',()=>resolve(instance)));
}
(async()=>{
  const host=await server();fs.mkdirSync(OUTPUT,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>localStorage.setItem('gfield_student','파이널4검수학생'));
    const url=`http://127.0.0.1:${host.address().port}/bank/index.html?bank=final4&printMode=both&view=grouped#student=파이널4검수학생`;
    await page.goto(url,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#btnPrint')&&!document.querySelector('#btnPrint').disabled);
    assert.match(await page.locator('.f1-title').innerText(),/파이널 4회 약점 유형/);
    assert.equal(await page.locator('.cover-page input').count(),30);
    assert.equal(await page.locator('.qcard').count(),90);
    assert.equal(await page.locator('.solution-card').count(),90);
    assert.equal(await page.locator('.question-page img').count(),12);
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>cards.slice(0,6).map(card=>Number(card.dataset.sourceNo))),[1,1,1,2,2,2]);
    assert.equal(await page.locator('[data-role="view"][data-val="grouped"]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-role="view"][data-val="mixed"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-role="view"][data-val="mixed"]')?.getAttribute('aria-pressed')==='true'&&document.querySelector('.qcard')?.dataset.sourceNo==='1');
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>cards.slice(0,6).map(card=>Number(card.dataset.sourceNo))),[1,2,3,4,5,6]);
    await page.locator('[data-role="view"][data-val="grouped"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-role="view"][data-val="grouped"]')?.getAttribute('aria-pressed')==='true'&&[...document.querySelectorAll('.qcard')].slice(0,3).every(card=>card.dataset.sourceNo==='1'));
    assert.equal(await page.locator('[class*="coach"], [id*="coach"]').count(),0,'유사문제에는 질문 도우미가 없습니다.');
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>cards.filter(card=>card.scrollWidth>card.clientWidth+2).map(card=>card.dataset.index)),[]);
    assert.deepEqual(await page.locator('#f1Pages img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth).map(image=>image.alt)),[]);
    await page.emulateMedia({media:'print'});
    const answerOverflow=await page.locator('.answer-page:not(.quick-page)').evaluateAll(pages=>pages.flatMap((sheet,pageIndex)=>{
      const cards=[...sheet.querySelectorAll('.solution-card')];
      if(!cards.length)return [[pageIndex,'empty']];
      const sheetRect=sheet.getBoundingClientRect(),style=getComputedStyle(sheet);
      const top=sheetRect.top+(parseFloat(style.paddingTop)||0),bottom=sheetRect.bottom-(parseFloat(style.paddingBottom)||0);
      return cards.flatMap(card=>{const rect=card.getBoundingClientRect();return rect.top<top-2||rect.bottom>bottom+2?[[pageIndex,card.dataset.answerId,Math.round(rect.top-top),Math.round(rect.bottom-bottom)]]:[];});
    }));
    assert.deepEqual(answerOverflow,[],'상세 풀이 카드가 답안 페이지를 넘지 않습니다.');
    await page.emulateMedia({media:null});
    await page.screenshot({path:path.join(OUTPUT,'final4-fixed90-desktop.png'),fullPage:true});
    await page.pdf({path:path.join(OUTPUT,'final4-fixed90-both.pdf'),preferCSSPageSize:true,printBackground:true});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>cards.filter(card=>card.scrollWidth>card.clientWidth+2).map(card=>card.dataset.index)),[]);
    await page.screenshot({path:path.join(OUTPUT,'final4-fixed90-mobile-390.png'),fullPage:true});

    await page.setViewportSize({width:1280,height:900});
    await page.goto(`http://127.0.0.1:${host.address().port}/final.html?round=4&go=answer&preview=1`,{waitUntil:'domcontentloaded'});
    await page.locator('.abtn').first().waitFor();
    const wrongNos=[8,12,26,30];
    for(let no=1;no<=30;no++)if(!wrongNos.includes(no))await page.locator('.abtn').nth(no-1).click();
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();
    assert.equal(await page.locator('.wp-item').count(),4);
    const popupPromise=page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice=await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl=new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('bank'),'final4');
    assert.equal(practiceUrl.searchParams.get('source'),'final|4');
    assert.equal(practiceUrl.searchParams.get('view'),'grouped');
    assert.equal(await practice.locator('.qcard').count(),12);
    assert.deepEqual(await practice.locator('.qcard').evaluateAll(cards=>cards.slice(0,6).map(card=>Number(card.dataset.sourceNo))),[8,8,8,12,12,12]);
    assert.equal(await practice.locator('[class*="coach"], [id*="coach"]').count(),0);
    await practice.close();
    const mixedPopupPromise=page.waitForEvent('popup');
    await page.locator('[data-wp-view="mixed"]').click();
    const mixedPractice=await mixedPopupPromise;
    await mixedPractice.waitForLoadState('domcontentloaded');
    await mixedPractice.locator('.qcard').first().waitFor();
    assert.equal(new URL(mixedPractice.url()).searchParams.get('view'),'mixed');
    assert.deepEqual(await mixedPractice.locator('.qcard').evaluateAll(cards=>cards.slice(0,4).map(card=>Number(card.dataset.sourceNo))),[8,12,26,30]);
    await mixedPractice.close();
    assert.deepEqual(errors,[]);
  }finally{await browser.close();host.close();}
  console.log(JSON.stringify({pass:true,items:90,figures:12,pdf:path.join(OUTPUT,'final4-fixed90-both.pdf')}));
})().catch(error=>{console.error(error);process.exitCode=1;});
