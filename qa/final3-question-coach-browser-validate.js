'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const FIXTURE=path.join(ROOT,'.private-work','final3-similar','final3-question-coach-fixture.html');
const PROOF=path.join(ROOT,'.private-work','final3-similar','question-coach-proof');

function server(){return new Promise(resolve=>{const instance=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}const filename=path.resolve(ROOT,'.'+pathname);if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)){response.writeHead(404);response.end('not found');return;}const ext=path.extname(filename);response.writeHead(200,{'content-type':ext==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});fs.createReadStream(filename).pipe(response);});instance.listen(0,'127.0.0.1',()=>resolve(instance));});}

function fixture(){return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#f5f6f8;font-family:Arial,sans-serif}.doc{max-width:920px;margin:auto;padding:24px;overflow:hidden}.final1-detailed-card{position:relative;margin:0 0 18px;padding:22px;overflow:hidden;background:#fff;border:1px solid #d8dee8}.final1-solution-heading{display:flex;gap:12px}.final1-solution-heading h4{margin:0}.final1-step{margin:12px 0}svg,img,table{max-width:100%}.final1-watermark,.final1-print-watermark{display:none}@media(max-width:560px){.doc{padding:10px}.final1-detailed-card{padding:14px}}</style><script src="/final3-solution-diagrams.js"></script><script src="/final3-backhalf-solution-diagrams.js"></script><script src="/final3-detailed-data.js"></script><script src="/final-detailed-solutions.js"></script><script src="/final3-question-coach.js"></script></head><body><main class="doc" id="app"></main><script>var data=window.GFIELD_FINAL3_DETAILED;var items=data.answerBindings.map(function(binding){return {no:binding.no,answer:binding.canonicalExact};});document.getElementById("app").innerHTML=window.GFIELD_FINAL1_DETAILED_RENDERER.render({round:3,data:data,roundItems:items,resolve:function(item){return window.GFIELD_FINAL3_RESOLVE_SOLUTION(item);},renderDiagram:function(solution){var list=[window.GFIELD_FINAL3_SOLUTION_DIAGRAMS,window.GFIELD_FINAL3_BACKHALF_SOLUTION_DIAGRAMS];var found=list.find(function(api){return api&&api.modelFor&&api.modelFor(solution.no);});return solution.diagram&&found?found.render(solution.no):"";}});window.GFIELD_FINAL3_QUESTION_COACH.wire(document.getElementById("app"));</script></body></html>';}

(async()=>{
  const finalHtml=fs.readFileSync(path.join(ROOT,'final.html'),'utf8');
  assert.match(finalHtml,/final3-question-coach\.js/,'파이널 3회 전용 도우미 스크립트 로드');
  assert.match(finalHtml,/GFIELD_FINAL3_QUESTION_COACH\.wire\(app\)/,'실제 진단 결과 렌더 뒤 도우미 연결');
  new vm.Script(fs.readFileSync(path.join(ROOT,'final3-question-coach.js'),'utf8'),{filename:'final3-question-coach.js'});
  fs.mkdirSync(path.dirname(FIXTURE),{recursive:true});fs.writeFileSync(FIXTURE,fixture());fs.mkdirSync(PROOF,{recursive:true});
  const host=await server();const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];const external=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1'))external.push(request.url());});
    const url=`http://127.0.0.1:${host.address().port}/.private-work/final3-similar/final3-question-coach-fixture.html`;
    await page.goto(url,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.final1-detailed-card.is-ready').count(),30,'검수된 상세 풀이 30문항');
    assert.equal(await page.locator('.final3-coach-launch').count(),30,'원문 상세 풀이마다 도우미 버튼');
    assert.equal(await page.locator('.qcard .final3-coach-launch').count(),0,'유사문제에는 도우미를 붙이지 않음');
    const q8=page.locator('#final3-solution-8');await q8.locator('.final3-coach-launch').click();
    assert.equal(await page.locator('.final3-coach-faq').count(),4,'FAQ 버튼 4개');
    assert.match(await page.locator('.final3-coach-context').innerText(),/파이널 3회 8번/);
    assert.match(await page.locator('.final3-coach-log').innerText(),/답을 보아도 이해되지 않는 부분/);
    await page.getByRole('button',{name:'개념이 잘 모르겠어요'}).click();
    assert.match(await page.locator('.final3-coach-log').innerText(),/그림 전체를 한꺼번에 보지 말고/);
    await page.getByRole('button',{name:'이해했어요 · 시작 방법 보기'}).click();
    assert.match(await page.locator('.final3-coach-log').innerText(),/선생님 풀이의 시작/);
    await page.getByRole('button',{name:'이해했어요 · 1단계 보기'}).click();
    assert.match(await page.locator('.final3-coach-log').innerText(),/1단계/);
    await page.getByRole('button',{name:'이 부분이 어려워요'}).click();
    assert.match(await page.locator('.final3-coach-log').innerText(),/더 자세히 설명할게요/);
    await page.screenshot({path:path.join(PROOF,'desktop-q8.png')});
    await page.locator('.final3-coach-close').click();
    await page.setViewportSize({width:390,height:844});await q8.locator('.final3-coach-launch').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px 가로 넘침 없음');
    await page.screenshot({path:path.join(PROOF,'mobile-q8.png')});
    await page.emulateMedia({media:'print'});
    assert.equal(await q8.locator('.final3-coach-launch').evaluate(node=>getComputedStyle(node).display),'none','인쇄에서 도우미 버튼 숨김');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[],'외부 API·네트워크 호출 없음');
  }finally{await browser.close();host.close();}
  console.log(JSON.stringify({pass:true,questions:30,proof:PROOF}));
})().catch(error=>{console.error(error);process.exitCode=1;});
