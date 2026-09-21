'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const WORK=path.join(ROOT,'.private-work','final4-coach');
const FIXTURE=path.join(WORK,'fixture.html');
const PROOF=path.join(WORK,'proof');

function server(){
  return new Promise(resolve=>{
    const instance=http.createServer((request,response)=>{
      const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
      if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
      const filename=path.resolve(ROOT,'.'+pathname);
      if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)){response.writeHead(404);response.end('not found');return;}
      const ext=path.extname(filename);
      response.writeHead(200,{'content-type':ext==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});
      fs.createReadStream(filename).pipe(response);
    });
    instance.listen(0,'127.0.0.1',()=>resolve(instance));
  });
}

function fixture(){
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#f5f6f8;font-family:Arial,sans-serif}.doc{max-width:920px;margin:auto;padding:24px;overflow:hidden}.final1-detailed-card{position:relative;margin:0 0 18px;padding:22px;overflow:hidden;background:#fff;border:1px solid #d8dee8}.final1-solution-heading{display:flex;gap:12px}.final1-solution-heading h4{margin:0}.final1-step{margin:12px 0}.final1-solution-block p,.final1-step p{font:400 16px/1.85 Arial,sans-serif}.final-math-frac{display:inline-grid;grid-template-rows:auto auto;vertical-align:middle;min-width:1.2em;margin:0 .1em;color:inherit;font-family:inherit;font-size:.78em;font-weight:inherit;line-height:.82;text-align:center;white-space:nowrap}.final-math-frac>span:first-child{width:100%;padding:0 .12em .1em;border-bottom:1px solid currentColor;text-align:center}.final-math-frac>span:last-child{padding:.1em .12em 0;text-align:center}svg,img,table{max-width:100%}.final1-watermark,.final1-print-watermark{display:none}@media(max-width:560px){.doc{padding:10px}.final1-detailed-card{padding:14px}}</style><script src="/final4-detailed-data.js"></script><script src="/final-detailed-solutions.js"></script><script src="/final4-question-coach.js"></script></head><body><main class="doc" id="app"></main><script>var data=window.GFIELD_FINAL4_DETAILED;var items=data.answerBindings.map(function(binding){return {no:binding.no,answer:binding.canonicalExact};});document.getElementById("app").innerHTML=window.GFIELD_FINAL1_DETAILED_RENDERER.render({round:4,data:data,roundItems:items,resolve:function(item){return window.GFIELD_FINAL4_RESOLVE_SOLUTION(item);}});window.GFIELD_FINAL4_QUESTION_COACH.wire(document.getElementById("app"));</script></body></html>';
}

(async()=>{
  const finalHtml=fs.readFileSync(path.join(ROOT,'final.html'),'utf8');
  assert.match(finalHtml,/final4-question-coach\.js/,'파이널 4회 전용 도우미 스크립트 로드');
  assert.match(finalHtml,/GFIELD_FINAL4_QUESTION_COACH\.wire\(app\)/,'실제 진단 결과 렌더 뒤 도우미 연결');
  assert.match(finalHtml,/\.final-math-frac\{[^}]*vertical-align:middle[^}]*font-family:inherit[^}]*font-size:\.78em[^}]*font-weight:inherit[^}]*white-space:nowrap/,'분수는 본문 중앙선·글꼴·굵기를 이어받고 한 덩어리로 유지');
  new vm.Script(fs.readFileSync(path.join(ROOT,'final4-question-coach.js'),'utf8'),{filename:'final4-question-coach.js'});
  fs.mkdirSync(WORK,{recursive:true});
  fs.writeFileSync(FIXTURE,fixture());
  fs.mkdirSync(PROOF,{recursive:true});
  const host=await server();
  const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];
    const external=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1'))external.push(request.url());});
    const url=`http://127.0.0.1:${host.address().port}/.private-work/final4-coach/fixture.html`;
    await page.goto(url,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.final1-detailed-card.is-ready').count(),30,'검수된 상세 풀이 30문항');
    assert.equal(await page.locator('.final4-coach-launch').count(),30,'원문 상세 풀이마다 도우미 버튼');
    assert.equal(await page.locator('.qcard .final4-coach-launch').count(),0,'유사문제에는 도우미를 붙이지 않음');
    const q14=page.locator('#final4-solution-14');
    const fraction=q14.locator('.final-math-frac');
    assert.equal(await fraction.count(),1,'14번 4분의 1은 위아래 분수로 렌더');
    const fractionStyle=await fraction.evaluate(node=>{const parent=getComputedStyle(node.parentElement);const own=getComputedStyle(node);const rect=node.getBoundingClientRect();return {fontFamilySame:own.fontFamily===parent.fontFamily,fontWeightSame:own.fontWeight===parent.fontWeight,colorSame:own.color===parent.color,height:rect.height,lineHeight:parseFloat(parent.lineHeight),nowrap:own.whiteSpace,verticalAlign:own.verticalAlign};});
    assert.equal(fractionStyle.fontFamilySame,true,'분수와 본문 글꼴 일치');
    assert.equal(fractionStyle.fontWeightSame,true,'분수와 본문 굵기 일치');
    assert.equal(fractionStyle.colorSame,true,'분수와 본문 색상 일치');
    assert.equal(fractionStyle.nowrap,'nowrap','분자·분모 줄분리 금지');
    assert.equal(fractionStyle.verticalAlign,'middle','분수를 본문 중앙선에 맞춤');
    assert.ok(fractionStyle.height<=fractionStyle.lineHeight*1.05,'분수가 본문 한 줄 높이를 넘지 않음');
    const q1=page.locator('#final4-solution-1');
    await q1.locator('.final4-coach-launch').click();
    assert.equal(await page.locator('.final4-coach-faq').count(),4,'FAQ 버튼 4개');
    assert.match(await page.locator('.final4-coach-context').innerText(),/파이널 4회 1번/);
    assert.match(await page.locator('.final4-coach-log').innerText(),/답을 보아도 이해되지 않는 부분/);
    await page.getByRole('button',{name:'개념이 잘 모르겠어요'}).click();
    assert.match(await page.locator('.final4-coach-log').innerText(),/주어진 것과 구할 것/);
    await page.getByRole('button',{name:'이해했어요 · 시작 방법 보기'}).click();
    assert.match(await page.locator('.final4-coach-log').innerText(),/선생님 풀이의 시작/);
    await page.getByRole('button',{name:'이해했어요 · 1단계 보기'}).click();
    assert.match(await page.locator('.final4-coach-log').innerText(),/1단계/);
    await page.getByRole('button',{name:'이 부분이 어려워요'}).click();
    assert.match(await page.locator('.final4-coach-log').innerText(),/더 자세히 설명할게요/);
    await page.screenshot({path:path.join(PROOF,'desktop-q1.png')});
    await page.locator('.final4-coach-close').click();
    await q14.locator('.final4-coach-launch').click();
    await page.getByRole('button',{name:'개념이 잘 모르겠어요'}).click();
    assert.match(await page.locator('.final4-coach-log').innerText(),/¼/,'질문 도우미도 빗금 문자열 대신 분수 글자 사용');
    assert.doesNotMatch(await page.locator('.final4-coach-log').innerText(),/1\/4/,'질문 도우미 1/4 문자열 금지');
    await page.locator('.final4-coach-close').click();
    await page.setViewportSize({width:390,height:844});
    await q1.locator('.final4-coach-launch').click();
    assert.ok(await page.locator('.final4-coach-dialog').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'390px 대화창 가로 넘침 없음');
    assert.ok(await page.locator('.final4-coach-action,.final4-coach-faq').evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().height>=40)),'모바일 선택 버튼 높이 확보');
    assert.ok(await q14.evaluate(node=>node.scrollWidth<=node.clientWidth+1),'390px 14번 분수 포함 가로 넘침 없음');
    await page.screenshot({path:path.join(PROOF,'mobile-q1.png')});
    await page.emulateMedia({media:'print'});
    assert.equal(await q1.locator('.final4-coach-launch').evaluate(node=>getComputedStyle(node).display),'none','인쇄에서 도우미 버튼 숨김');
    assert.deepEqual(errors,[],'브라우저 오류 없음');
    assert.deepEqual(external,[],'외부 요청 없음');
    console.log('PASS Final4 question coach: 30 originals, staged help, FAQ, 390px and print gate');
  }finally{
    await browser.close();
    await new Promise(resolve=>host.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
