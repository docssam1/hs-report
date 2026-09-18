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
    await page.goto(base + '?bank=final7&practice=wrong&gens=final7-q05%2Cfinal7-q06%2Cfinal7-q07%2Cfinal7-q08%2Cfinal7-q09%2Cfinal7-q10%2Cfinal7-q11%2Cfinal7-q12%2Cfinal7-q13%2Cfinal7-q14&per=3&points=all&source=final%7C7&sourceNos=5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14&printMode=both#student=%EC%B5%9C%EC%A2%857%EA%B2%80%EC%88%98%ED%95%99%EC%83%9D', {waitUntil: 'networkidle'});
    await page.waitForFunction(() => {
      const button = document.querySelector('#final1Worksheet #btnPrint');
      return button && !button.disabled;
    });

    assert.match(await page.locator('.f1-title').textContent(), /최종 7회 약점 유형/);
    assert.match(await page.locator('.cover-page h1').textContent(), /최종 7회/);
    assert.equal(await page.locator('.qcard').count(), 30, 'thirty reviewed variants render');
    for (const no of [5,6,7,8,9,10,11,12,13,14]) assert.equal(await page.locator(`.qcard[data-source-no="${no}"]`).count(), 3, `Q${no} variants`);
    assert.equal(await page.locator('.question-page').count(), 11, 'eleven balanced question pages render');
    assert.ok(await page.locator('.qcard[data-source-no="5"],.qcard[data-source-no="6"],.qcard[data-source-no="12"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'true')), 'reviewed Final 7 diagrams use wide rows');
    assert.ok(await page.locator('.qcard[data-source-no="7"],.qcard[data-source-no="8"],.qcard[data-source-no="9"],.qcard[data-source-no="10"],.qcard[data-source-no="11"],.qcard[data-source-no="13"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'false')), 'short text-only items use the regular page grid');
    assert.ok(await page.locator('.qcard[data-source-no="14"]').evaluateAll((cards) => cards.every((card) => card.dataset.wide === 'false')), 'repeated-transfer items stay in the regular grid to preserve writing space without one-item pages');
    assert.deepEqual(await page.locator('.question-page').evaluateAll((pages) => pages.map((sheet) => sheet.querySelectorAll('.qcard').length)), [2,3,3,3,3,3,3,2,3,3,2], 'question pages avoid one-item pages while preserving wide figures');
    assert.equal(await page.locator('.question-page img').count(), 9, 'one prompt figure for every visual question');
    assert.equal(await page.locator('.solution-card').count(), 30, 'thirty detailed answers');
    assert.equal(await page.locator('.solution-card ol li').count(), 90, 'three concise steps per answer');
    assert.equal(await page.locator('.duplex-blank').count(), 0, 'answer bundle already starts on an odd-numbered page');
    assert.equal(await page.locator('.qconditions,.f1-qgiven').count(), 0, 'no repeated conditions or hint boxes');
    assert.equal(await page.locator('.question-page .ans').count(), 0, 'no answer leakage on question pages');
    assert.ok(await page.locator('.qcard[data-source-no="6"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 540)), 'fishing-line diagrams stay wide and readable');
    assert.ok(await page.locator('.qcard[data-source-no="12"] img').evaluateAll((images) => images.every((image) => image.getBoundingClientRect().width > 300)), 'recursive-area diagrams stay wide and readable');
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
    await page.goto(base + '?bank=final7&practice=wrong&gens=final7-q15&per=3&points=all&source=final%7C7&sourceNos=15&printMode=both#student=%EA%B2%80%EC%88%98', {waitUntil: 'networkidle'});
    await page.locator('#f1Status').waitFor();
    assert.match(await page.locator('#f1Status').textContent(), /15번 유사문제는 아직 검수 중입니다/);
    assert.equal(await page.locator('#btnPrint').isDisabled(), true, 'unreviewed Final 7 item cannot print');

    await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=7&name=docssam&go=answer&preview=1`, {waitUntil: 'domcontentloaded'});
    await page.locator('.abtn').first().waitFor();
    for (let no = 1; no <= 30; no += 1) {
      if (![5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(no)) await page.locator('.abtn').nth(no - 1).click();
    }
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();
    assert.deepEqual(await page.locator('.wp-item').evaluateAll((rows) => rows.map((row) => Number(row.dataset.wpNo))), [5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 'report exposes only reviewed Q5-Q14 practice');
    assert.match(await page.locator('.wp-pending').textContent(), /15번/, 'unreviewed wrong answer stays visibly pending');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice = await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl = new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('bank'), 'final7');
    assert.equal(practiceUrl.searchParams.get('source'), 'final|7');
    assert.equal(practiceUrl.searchParams.get('gens'), 'final7-q05,final7-q06,final7-q07,final7-q08,final7-q09,final7-q10,final7-q11,final7-q12,final7-q13,final7-q14');
    assert.equal(await practice.locator('.qcard').count(), 30, 'real Final 7 report opens exactly the thirty reviewed variants');
    await practice.close();
    assert.deepEqual(errors, [], 'browser errors after report-to-bank navigation');

    console.log('PASS Final 7 Q5-Q14 browser: reviewed figures and text items, thirty detailed answers, desktop/390px/PDF readiness, adapter loading, and unreviewed fail-closed behavior');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
