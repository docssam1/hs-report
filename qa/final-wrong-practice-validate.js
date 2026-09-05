'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';

function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  })[ext] || 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const requested = pathname === '/' ? '/index.html' : pathname;
    const filename = path.resolve(ROOT, `.${requested}`);
    if (!filename.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': mimeType(filename), 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const { server, port } = await startStaticServer();
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route(/^https?:\/\//, async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    if (url.hostname.endsWith('supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.fulfill({ status: 204, body: '' });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  try {
    await page.goto(`http://127.0.0.1:${port}/final.html?round=1&name=docssam&go=answer&preview=1`, { waitUntil: 'domcontentloaded' });
    await page.locator('.abtn').first().waitFor();
    for (const no of [4, 13, 18, 23, 26]) await page.locator('.abtn').nth(no - 1).click();
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();

    assert.equal(await page.locator('.wp-item').count(), 5, '실제 오답 5개만 유사문제 대상으로 표시');
    assert.deepEqual(await page.locator('.wp-chip').allTextContents(), ['전체문제', '2점대', '3점대', '4점대']);
    assert.match(await page.locator('#wpSummary').textContent(), /오답 5개 유형 · 유사문제 15문제/);
    assert.match(await page.locator('.wp-item[data-wp-no="4"]').textContent(), /범위가 주어지지 않은 두 수의 곱의 최댓값·최솟값/);
    assert.match(await page.locator('.wp-item[data-wp-no="18"]').textContent(), /보기의 접기 방법을 두 번 반복한 뒤 자르기/);
    assert.match(await page.locator('.wp-item[data-wp-no="18"]').textContent(), /도형 › 접기·자르기/);

    await page.getByRole('button', { name: '3점대' }).click();
    assert.match(await page.locator('#wpSummary').textContent(), /오답 2개 유형 · 유사문제 6문제/);
    assert.equal(await page.locator('.wp-item:visible').count(), 2, '3점대 오답만 표시');

    const popupPromise = page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice = await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl = new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('practice'), 'wrong');
    assert.equal(practiceUrl.searchParams.get('per'), '3');
    assert.equal(practiceUrl.searchParams.get('gens'), 'final1-q13,final1-q18');
    assert.equal(practiceUrl.searchParams.get('sourceNos'), '13,18');
    assert.equal(await practice.locator('.qcard').count(), 6, '오답 유형마다 정확히 3문제');
    assert.equal(await practice.locator('.qcard[data-source-no="13"]').count(), 3, '13번 유사문제 3개');
    assert.equal(await practice.locator('.qcard[data-source-no="18"]').count(), 3, '18번 유사문제 3개');
    assert.equal(await practice.locator('.question-page').count(), 1, '6문제를 한 페이지에 배치');
    assert.equal(await practice.locator('.answer-page').count(), 1, '문제 뒤 별도 답안 페이지');
    assert.equal(await practice.locator('.question-page .anstable').count(), 0, '문제 페이지에 정답표 없음');
    assert.match(await practice.locator('.qcard[data-source-no="18"]').first().textContent(), /같은 방법을 한 번 더 반복/);
    assert.match(await practice.locator('.answer-page').textContent(), /색종이 접기 개념이 아니라/);
    assert.match(await practice.locator('.qmeta').first().textContent(), /대영역|›/);
    const pageOrder = await practice.locator('.page').evaluateAll((nodes) => nodes.map((node) => node.classList.contains('question-page') ? 'question' : node.classList.contains('answer-page') ? 'answer' : 'other'));
    assert.deepEqual(pageOrder, ['question', 'answer'], '모든 문제 뒤에 답안 배치');

    await practice.setViewportSize({ width: 390, height: 844 });
    const overflow = await practice.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `모바일 가로 넘침 없음: ${overflow}px`);
    assert.deepEqual(errors, [], '브라우저 오류 없음');
    console.log('PASS final wrong-practice flow: exact wrong items, point filters, 3 per type, 6/page, answers after questions, mobile');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
