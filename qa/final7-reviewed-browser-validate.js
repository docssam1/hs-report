'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = process.env.GFIELD_WORKSHEET_REVIEW_DIR || '';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const filename = path.resolve(ROOT, '.' + pathname);
    if (!filename.startsWith(ROOT + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    const mime = ({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'})[path.extname(filename)] || 'application/octet-stream';
    response.writeHead(200, {'content-type': mime, 'cache-control': 'no-store'});
    fs.createReadStream(filename).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({headless: true, ...(BROWSER_EXECUTABLE ? {executablePath: BROWSER_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 1000}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text());
    });
    await page.route('https://**/*', (route) => route.abort());
    await page.addInitScript(() => localStorage.setItem('gfield_student', '최종7검수학생'));
    const base = `http://127.0.0.1:${server.address().port}/bank/index.html`;
    const allNos=Array.from({length:30},(_,index)=>index+1);
    const allGens=allNos.map((no)=>'final7-q'+String(no).padStart(2,'0')).join(',');
    await page.goto(base + '?bank=final7&practice=wrong&gens='+encodeURIComponent(allGens)+'&per=3&points=all&source=final%7C7&sourceNos='+encodeURIComponent(allNos.join(','))+'&printMode=both#student=%EC%B5%9C%EC%A2%857%EA%B2%80%EC%88%98%ED%95%99%EC%83%9D', {waitUntil: 'networkidle'});
    await page.waitForFunction(() => {
      const button = document.querySelector('#final1Worksheet #btnPrint');
      return button && !button.disabled;
    });

    assert.match(await page.locator('.f1-title').textContent(), /최종 7회 약점 유형/);
    assert.match(await page.locator('.cover-page h1').textContent(), /최종 7회/);
    assert.equal(await page.locator('.qcard').count(), 90, 'ninety reviewed variants render');
    for (const no of allNos) assert.equal(await page.locator(`.qcard[data-source-no="${no}"]`).count(), 3, `Q${no} variants`);
    assert.ok(await page.locator('.qcard[data-source-no="5"],.qcard[data-source-no="6"],.qcard[data-source-no="12"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'true')), 'reviewed Final 7 diagrams use wide rows');
    assert.ok(await page.locator('.qcard[data-source-no="7"],.qcard[data-source-no="8"],.qcard[data-source-no="9"],.qcard[data-source-no="10"],.qcard[data-source-no="11"],.qcard[data-source-no="13"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'false')), 'short text-only items use the regular page grid');
    assert.ok(await page.locator('.qcard[data-source-no="14"],.qcard[data-source-no="15"],.qcard[data-source-no="17"],.qcard[data-source-no="29"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'false')), 'Q14, Q15, Q17, and Q29 stay in the regular grid to preserve writing space without one-item pages');
    const pageCardCounts = await page.locator('.question-page').evaluateAll((pages) => pages.map((sheet) => sheet.querySelectorAll('.qcard').length));
    assert.ok(pageCardCounts.every((count) => count>=2&&count<=4), 'question pages avoid one-item pages while preserving wide figures: ' + JSON.stringify(pageCardCounts));
    assert.equal(await page.locator('.question-page img').count(), 36, 'one prompt figure for every visual question');
    assert.ok(await page.locator('.qcard[data-source-no="1"] img').evaluateAll((images) => images.every((image) => /쏟아져.*교차한 샤프심/.test(image.alt))), 'Q1 keeps the spilled overlapping pencil-lead picture identity');
    assert.doesNotMatch(await page.locator('.qcard[data-source-no="1"]').allTextContents().then((values) => values.join(' ')), /색연필|성냥개비|나무 막대/, 'Q1 does not replace pencil leads with generic sticks');
    assert.equal(await page.locator('.solution-card').count(), 90, 'ninety detailed answers');
    assert.equal(await page.locator('.solution-card ol li').count(), 270, 'three concise steps per answer');
    assert.equal(await page.locator('.f1-coach-launch,.gfield-step-coach,.f7ot-launch').count(), 0, 'similar-problem answers do not receive an original-question tutor');
    assert.equal(await page.locator('.qconditions,.f1-qgiven').count(), 0, 'no repeated conditions or hint boxes');
    assert.equal(await page.locator('.question-page .ans').count(), 0, 'no answer leakage on question pages');
    assert.ok(await page.locator('.qcard[data-source-no="6"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 540)), 'fishing-line diagrams stay wide and readable');
    assert.ok(await page.locator('.qcard[data-source-no="12"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 300)), 'recursive-area diagrams stay wide and readable');
    assert.ok(await page.locator('.qcard[data-source-no="15"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 250)), 'arrow-grid diagrams stay readable in the regular grid');
    assert.ok(await page.locator('.qcard[data-source-no="17"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 250)), 'stage-growth diagrams stay readable in the regular grid');
    assert.ok(await page.locator('.qcard[data-source-no="21"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 250)), 'masked-number diagrams stay readable in the regular grid');
    const q28Widths = await page.locator('.qcard[data-source-no="28"] img').evaluateAll((images) => images.map((image) => image.getBoundingClientRect().width));
    assert.ok(q28Widths.every((width) => width > 380), 'triangular-array diagrams and original examples stay wide and readable: ' + JSON.stringify(q28Widths));
    const q29Widths = await page.locator('.qcard[data-source-no="29"] img').evaluateAll((images) => images.map((image) => image.getBoundingClientRect().width));
    assert.ok(q29Widths.every((width) => width > 250), 'different-size cross arrays stay readable: ' + JSON.stringify(q29Widths));
    const q5InkBounds = await page.locator('.qcard[data-source-no="5"] img').evaluateAll(async (images) => Promise.all(images.map(async (image) => {
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', {willReadFrequently: true});
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const offset = (y * canvas.width + x) * 4;
          if (pixels[offset + 3] > 10 && (pixels[offset] < 245 || pixels[offset + 1] < 245 || pixels[offset + 2] < 245)) {
            minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          }
        }
      }
      return {width: canvas.width, height: canvas.height, minX, minY, maxX, maxY};
    })));
    assert.ok(q5InkBounds.every((box) => box.minX >= 8 && box.minY >= 8 && box.maxX <= box.width - 9 && box.maxY <= box.height - 9), 'all Q5 hexagon strokes keep visible outer margins and are not cropped: ' + JSON.stringify(q5InkBounds));
    assert.deepEqual(await page.locator('#f1Pages img').evaluateAll((images) => images.filter((image) => !image.complete || !image.naturalWidth || !image.naturalHeight).map((image) => image.alt)), [], 'all figures decode');
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => cards.filter((card) => card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2).map((card) => card.dataset.index)), [], 'desktop cards do not clip');
    assert.deepEqual(await page.locator('.question-page').evaluateAll((pages) => pages.flatMap((sheet, pageIndex) => {
      const pageBox = sheet.getBoundingClientRect();
      return [...sheet.querySelectorAll('.qcard')].flatMap((card) => {
        const box = card.getBoundingClientRect();
        return box.bottom > pageBox.bottom + 2 || box.right > pageBox.right + 2 ? [[pageIndex + 1, card.dataset.index, 'outside page']] : [];
      });
    })), [], 'every problem card stays inside its A4 page');
    await page.emulateMedia({media:'print'});
    const answerHeaderMetrics = await page.locator('.f1-answer-page').evaluateAll((pages) => pages.map((sheet, index) => {
      const heading = sheet.querySelector('h2');
      const first = sheet.querySelector('.solution-card');
      const h = heading && heading.getBoundingClientRect();
      const f = first && first.getBoundingClientRect();
      return {page:index+1, headingTop:h&&h.top, headingBottom:h&&h.bottom, firstTop:f&&f.top, clientHeight:sheet.clientHeight, scrollHeight:sheet.scrollHeight, overlap:!!(h&&f&&f.top<h.bottom-1)};
    }));
    assert.deepEqual(answerHeaderMetrics.filter((row) => row.overlap), [], 'answer page headings do not overlap their first solution card: ' + JSON.stringify(answerHeaderMetrics));
    assert.deepEqual(answerHeaderMetrics.filter((row) => row.scrollHeight > row.clientHeight + 2), [], 'answer pages do not overflow their print sheet: ' + JSON.stringify(answerHeaderMetrics));
    await page.emulateMedia({media:null});
    assert.doesNotMatch(await page.locator('#final1Worksheet').innerText(), /undefined|NaN|\[object Object\]/);
    assert.deepEqual(errors, [], 'browser errors');

    if (OUTPUT) {
      fs.mkdirSync(OUTPUT, {recursive: true});
      await page.screenshot({path: path.join(OUTPUT, 'final7-reviewed-pc.png'), fullPage: true});
      await page.pdf({path: path.join(OUTPUT, 'final7-reviewed-both.pdf'), preferCSSPageSize: true, printBackground: true});
    }

    await page.setViewportSize({width: 390, height: 844});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, '390px has no horizontal overflow');
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => cards.filter((card) => card.scrollWidth > card.clientWidth + 2).map((card) => card.dataset.index)), [], 'mobile cards have no horizontal clipping');
    if (OUTPUT) await page.screenshot({path: path.join(OUTPUT, 'final7-reviewed-mobile.png'), fullPage: true});

    await page.setViewportSize({width: 1280, height: 1000});
    await page.goto(base + '?bank=final7&practice=wrong&gens=final7-q31&per=3&points=all&source=final%7C7&sourceNos=31&printMode=both#student=%EA%B2%80%EC%88%98', {waitUntil: 'networkidle'});
    await page.locator('#f1Status').waitFor();
    assert.match(await page.locator('#f1Status').textContent(), /학습할 최종 7회 문항을 선택해 주세요/);
    assert.equal(await page.locator('#btnPrint').isDisabled(), true, 'item outside the reviewed Final 7 range cannot print');

    await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=7&name=docssam&go=answer&preview=1`, {waitUntil: 'domcontentloaded'});
    await page.locator('.abtn').first().waitFor();
    await page.locator('.abtn').nth(4).click();
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();
    assert.doesNotMatch(await page.locator('.diagnostic-coaching').innerText(),/유형 확인 중/,'reviewed Final 7 types remain visible in the diagnostic coaching section');
    await page.locator('#detailedAnswersSection summary').click();
    const originalTutors=page.locator('#detailedAnswersSection .f7ot-card');
    const q6Tutor=page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="6"]');
    const q11Tutor=page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="11"]');
    const q12Tutor=page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="12"]');
    const q13Tutor=page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="13"]');
    assert.equal(await originalTutors.count(),30,'reviewed original Q1-Q30 receive source-specific tutors');
    assert.equal(await page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="5"]').count(),1,'corrected original Q5 receives its verified tutor');
    assert.equal(await q6Tutor.count(),1,'original Q6 receives one tutor');
    assert.equal(await q11Tutor.count(),1,'original Q11 receives one tutor');
    assert.equal(await q12Tutor.count(),1,'original Q12 receives one tutor');
    assert.equal(await q13Tutor.count(),1,'original Q13 receives one tutor');
    for(let no=14;no<=30;no+=1)assert.equal(await page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="'+no+'"]').count(),1,'original Q'+no+' receives one tutor');
    assert.equal(await q6Tutor.locator('.f7ot-source--problem image').getAttribute('href'),'materials/final_7/002.jpg','Q6 tutor reuses the exact original page image');
    assert.equal(await q11Tutor.locator('.f7ot-source--q11 image').getAttribute('href'),'materials/final_7/003.jpg','Q11 tutor reuses the exact original page image');
    assert.equal(await q12Tutor.locator('.f7ot-source--q12 image').getAttribute('href'),'materials/final_7/003.jpg','Q12 tutor reuses the exact original page image');
    assert.equal(await q13Tutor.locator('.f7ot-source--q13 image').getAttribute('href'),'materials/final_7/004.jpg','Q13 tutor reuses the exact original page image');
    const scriptedSources={1:'001.jpg',2:'001.jpg',3:'001.jpg',4:'001.jpg',5:'002.jpg',7:'002.jpg',8:'002.jpg',9:'003.jpg',10:'003.jpg',14:'004.jpg',15:'004.jpg',16:'004.jpg',17:'005.jpg',18:'005.jpg',19:'005.jpg',20:'005.jpg',21:'006.jpg',22:'006.jpg',23:'006.jpg',24:'006.jpg',25:'007.jpg',26:'007.jpg',27:'007.jpg',28:'007.jpg',29:'008.jpg',30:'008.jpg'};
    for(const [no,file] of Object.entries(scriptedSources))assert.equal(await page.locator('#detailedAnswersSection .f7ot-card[data-solution-no="'+no+'"] .f7ot-source--scripted image').getAttribute('href'),'materials/final_7/'+file,'Q'+no+' reuses the exact original page image');
    await q6Tutor.locator('.f7ot-launch').click();
    await page.getByRole('button',{name:'6번 풀이 시작'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/앞 물고기의 꼬리와 다음 물고기의 머리/,'the lesson starts with the teacher transcript criterion');
    await page.getByRole('button',{name:'모르겠어요 · 선을 이어서 보여 주세요'}).click();
    await page.locator('.f7ot-guide.is-playing').waitFor();
    assert.equal(await page.locator('.f7ot-guide.is-playing').count(),1,'not understood reveals the source-specific fishing-line guide');
    if(OUTPUT){await page.waitForTimeout(5200);await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q06-original-tutor-guide.png')});}
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.locator('#final7OriginalTutor').evaluate((node)=>node.scrollWidth<=node.clientWidth+1),'Q6 tutor does not overflow at 390px');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q06-original-tutor-mobile.png')});
    await page.setViewportSize({width:1280,height:1000});
    await page.getByRole('button',{name:'이해되었어요 · 물고기를 셀게요'}).click();
    assert.match(await page.locator('.f7ot-answer').innerText(),/6마리/,'the original lesson ends with the verified Q6 answer');
    await page.locator('.f7ot-close').click();
    await q11Tutor.locator('.f7ot-launch').click();
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q11-original-tutor-source.png')});
    await page.getByRole('button',{name:'11번 풀이 시작'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/가득 찬 의자는 40개/,'Q11 separates the incomplete last chair first');
    assert.match(await page.locator('.f7ot-teacher').innerText(),/122명/,'Q11 subtracts the last three people before assuming chair types');
    await page.getByRole('button',{name:'이해했어요 · 첫 번째 차이 보기'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/첫 번째 차이를 계산/,'Q11 follows the teacher transcript order');
    assert.match(await page.locator('.f7ot-teacher').innerText(),/차이는 3자리/,'Q11 shows the five-seat versus two-seat difference');
    await page.getByRole('button',{name:'기억나요 · 모두 2인용으로 우겨 볼게요'}).click();
    assert.match(await page.locator('.f7ot-math-scene').innerText(),/40 × 2 = 80명/,'Q11 assumes all forty full chairs are two-seat chairs');
    assert.match(await page.locator('.f7ot-math-scene').innerText(),/122 − 80 = 42명/,'Q11 calculates the remaining forty-two people');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q11-original-tutor.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.locator('#final7OriginalTutor').evaluate((node)=>node.scrollWidth<=node.clientWidth+1),'Q11 tutor does not overflow at 390px');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q11-original-tutor-mobile.png')});
    await page.setViewportSize({width:1280,height:1000});
    await page.getByRole('button',{name:'이해했어요 · 5인용 수 구하기'}).click();
    assert.match(await page.locator('.f7ot-answer').innerText(),/15개/,'Q11 adds the last incomplete five-seat chair to fourteen full ones');
    await page.locator('.f7ot-close').click();
    await q12Tutor.locator('.f7ot-launch').click();
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q12-original-tutor-source.png')});
    await page.getByRole('button',{name:'12번 풀이 시작'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/4칸 중 2칸/,'Q12 starts by turning the source diagram into fractions');
    assert.match(await page.locator('.f7ot-q12-equation').innerText(),/2\/16 = 1\/8/,'Q12 verifies the second newly shaded area');
    await page.getByRole('button',{name:'이해했어요 · 넓이 규칙 보기'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/앞 단계의 1\/4/,'Q12 follows the teacher-script shrinking rule');
    assert.match(await page.locator('.f7ot-q12-sequence').innerText(),/1\/2[\s\S]*1\/8[\s\S]*1\/32/,'Q12 exposes the verified fraction sequence without the final answer');
    assert.doesNotMatch(await page.locator('#final7OriginalTutor').innerText(),/1\/128/,'Q12 does not reveal the answer before the final beat');
    await page.getByRole('button',{name:'이해했어요 · 세 번째 확인하기'}).click();
    assert.match(await page.locator('.f7ot-q12-equation').innerText(),/2\/64 = 1\/32/,'Q12 independently verifies the third increment');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q12-original-tutor.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.locator('#final7OriginalTutor').evaluate((node)=>node.scrollWidth<=node.clientWidth+1),'Q12 tutor does not overflow at 390px');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q12-original-tutor-mobile.png')});
    await page.setViewportSize({width:1280,height:1000});
    await page.getByRole('button',{name:'알겠어요 · 네 번째 구하기'}).click();
    assert.match(await page.locator('.f7ot-q12-equation').innerText(),/2\/256 = 1\/128/,'Q12 calculates only the fourth newly shaded area');
    assert.match(await page.locator('.f7ot-answer').innerText(),/1\/128/,'Q12 ends at the verified single answer');
    await page.locator('.f7ot-close').click();
    await q13Tutor.locator('.f7ot-launch').click();
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q13-original-tutor-source.png')});
    await page.getByRole('button',{name:'13번 풀이 시작'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/1개, 2개, 3개, 4개, 5개/,'Q13 starts from the increasing group lengths');
    await page.getByRole('button',{name:'이해했어요 · 300개 경계 찾기'}).click();
    assert.match(await page.locator('.f7ot-q13-boundary').innerText(),/210[\s\S]*90[\s\S]*300/,'Q13 follows the teacher transcript to locate the 24th group boundary');
    await page.getByRole('button',{name:'이해했어요 · 1과 2 비교하기'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/매 쌍마다 2가 딱 한 개 더/,'Q13 pairs each odd group with the next even group');
    assert.doesNotMatch(await page.locator('#final7OriginalTutor').innerText(),/2가 12개 더 많습니다/,'Q13 does not reveal the final answer before the answer beat');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q13-original-tutor.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.locator('#final7OriginalTutor').evaluate((node)=>node.scrollWidth<=node.clientWidth+1),'Q13 tutor does not overflow at 390px');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q13-original-tutor-mobile.png')});
    await page.setViewportSize({width:1280,height:1000});
    await page.getByRole('button',{name:'12쌍이에요 · 답 확인하기'}).click();
    assert.match(await page.locator('.f7ot-answer').innerText(),/2가 12개 더 많음/,'Q13 ends at the verified number and difference');
    await page.locator('.f7ot-close').click();
    const scriptedAnswers={1:'37개',2:'95분',3:'67개',4:'102개',5:'11가지',7:'136페이지',8:'425',9:'40',10:'50',14:'101, 148, 145',15:'(3, 50)',16:'165',17:'210개',18:'병 16살',19:'382개',20:'216g',21:'62',22:'75명',23:'169',24:'4명',25:'3마리',26:'2014년',27:'5주일',28:'30',29:'192가지',30:'128'};
    for(const [no,answer] of Object.entries(scriptedAnswers)){
      await page.evaluate((value)=>window.GFIELD_FINAL7_ORIGINAL_TUTOR.openScripted(Number(value)),no);
      assert.match(await page.locator('.f7ot-head').innerText(),new RegExp('최종 7회 '+no+'번'));
      assert.equal(await page.locator('.f7ot-answer').count(),0,'Q'+no+' does not expose an answer on the source stage');
      await page.getByRole('button',{name:no+'번 풀이 시작'}).click();
      assert.equal(await page.getByRole('button',{name:'모르겠어요 · 더 자세히 보여 주세요'}).count(),1,'Q'+no+' provides a not-understood branch');
      await page.getByRole('button',{name:'모르겠어요 · 더 자세히 보여 주세요'}).click();
      assert.notEqual((await page.locator('.f7ot-teacher').innerText()).trim(),'','Q'+no+' provides deeper teacher guidance');
      for(let step=1;step<4;step+=1)await page.getByRole('button',{name:'이해했어요 · 다음 단계'}).click();
      assert.match(await page.locator('.f7ot-answer').innerText(),new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),'Q'+no+' ends at its independently verified answer');
      await page.locator('.f7ot-close').click();
    }
    await page.evaluate(()=>window.GFIELD_FINAL7_ORIGINAL_TUTOR.openScripted(29));
    await page.getByRole('button',{name:'29번 풀이 시작'}).click();
    await page.getByRole('button',{name:'이해했어요 · 다음 단계'}).click();
    await page.getByRole('button',{name:'이해했어요 · 다음 단계'}).click();
    assert.match(await page.locator('.f7ot-teacher').innerText(),/4×3×2×1가지/,'Q29 explains the four distinct horizontal positions omitted by the official solution');
    assert.doesNotMatch(await page.locator('.f7ot-teacher').innerText(),/64가지/,'Q29 never teaches the incorrect official count');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q29-original-tutor.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.locator('#final7OriginalTutor').evaluate((node)=>node.scrollWidth<=node.clientWidth+1),'scripted tutor does not overflow at 390px');
    if(OUTPUT)await page.locator('#final7OriginalTutor').screenshot({path:path.join(OUTPUT,'final7-q29-original-tutor-mobile.png')});
    await page.setViewportSize({width:1280,height:1000});
    await page.locator('.f7ot-close').click();
    await page.emulateMedia({media:'print'});
    assert.deepEqual(await originalTutors.evaluateAll((nodes)=>nodes.map((node)=>getComputedStyle(node).display)),Array(30).fill('none'),'original tutors are excluded from print and PDF');
    await page.emulateMedia({media:null});
    const wrongNos=allNos.filter((no)=>no!==5);
    assert.deepEqual(await page.locator('.wp-item').evaluateAll((rows) => rows.map((row) => Number(row.dataset.wpNo))), wrongNos, 'report exposes every reviewed wrong item');
    assert.equal(await page.locator('.wp-pending').count(), 0, 'approved Q29-Q30 do not remain pending');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice = await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl = new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('bank'), 'final7');
    assert.equal(practiceUrl.searchParams.get('source'), 'final|7');
    assert.equal(practiceUrl.searchParams.get('gens'), wrongNos.map((no)=>'final7-q'+String(no).padStart(2,'0')).join(','));
    assert.equal(await practice.locator('.qcard').count(), 87, 'real Final 7 report opens three variants for every selected wrong item');
    await practice.close();
    assert.deepEqual(errors, [], 'browser errors after report-to-bank navigation');

    console.log('PASS Final 7 Q1-Q30 browser: reviewed figures and text items, no tutor on variants, verified original tutors, ninety detailed answers, desktop/390px/PDF readiness, adapter loading, and report-to-bank navigation');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
