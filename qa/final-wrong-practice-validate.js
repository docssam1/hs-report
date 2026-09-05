'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const draftLayout = process.argv.includes('--draft-layout');

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
  let mockRows = [];
  const writeMethods = [];
  await context.route(/^https?:\/\//, async (route) => {
    const url = new URL(route.request().url());
    if(draftLayout && url.hostname === '127.0.0.1' && url.pathname.endsWith('/final1-fixed90.json')) {
      const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,'bank/data/final1-fixed90.json'),'utf8'));
      fixture.items.forEach(item=>{item.reviewStatus='verified';});
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});
    }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    if (url.hostname.endsWith('supabase.co')) {
      if (!['GET', 'HEAD'].includes(route.request().method())) writeMethods.push(route.request().method());
      const body = url.pathname.includes('/mock_results') ? JSON.stringify(mockRows) : '[]';
      return route.fulfill({ status: 200, contentType: 'application/json', body });
    }
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
    assert.equal(practiceUrl.searchParams.get('gens'), 'final1-q04,final1-q13,final1-q18,final1-q23,final1-q26');
    assert.equal(practiceUrl.searchParams.get('sourceNos'), '4,13,18,23,26');
    assert.equal(new URLSearchParams(practiceUrl.hash.slice(1)).get('student'), 'docssam');
    assert.equal(await practice.locator('.qcard').count(), 6, '오답 유형마다 정확히 3문제');
    assert.equal(await practice.locator('.qcard[data-source-no="13"]').count(), 3, '13번 유사문제 3개');
    assert.equal(await practice.locator('.qcard[data-source-no="18"]').count(), 3, '18번 유사문제 3개');
    assert.equal(await practice.locator('.question-page').count(), 1, '6문제를 한 페이지에 배치');
    assert.equal(await practice.locator('.solution-card').count(), 6, '문제 뒤 별도 문항별 풀이');
    assert.equal(await practice.locator('.cover-page').count(), 1, '학생 이름과 셀프 체크 표지');
    assert.equal(await practice.locator('.question-page .anstable').count(), 0, '문제 페이지에 정답표 없음');
    assert.match(await practice.locator('.qcard[data-source-no="18"]').first().textContent(), /같은 방법을 한 번 더 반복/);
    assert.match((await practice.locator('.answer-page').allTextContents()).join(' '), /색종이 접기 개념이 아니라/);
    const pageOrder = await practice.locator('.page').evaluateAll((nodes) => nodes.map((node) => node.classList.contains('question-page') ? 'question' : node.classList.contains('answer-page') ? 'answer' : 'other'));
    assert.equal(pageOrder[0], 'other', '표지 먼저');
    assert.equal(pageOrder[1], 'question');
    assert.ok(pageOrder.slice(2).every(kind=>kind==='answer'), '모든 문제 뒤에 답안 배치');
    await practice.locator('#final1Worksheet [data-role="points"][data-val="all"]').click();
    await practice.waitForFunction(()=>document.querySelectorAll('.qcard').length===15);
    assert.deepEqual(await practice.locator('.qcard').evaluateAll(ns=>[...new Set(ns.map(n=>Number(n.dataset.sourceNo)))].sort((a,b)=>a-b)),[4,13,18,23,26], '배점 전환은 전체 오답으로 복귀하며 정답 문항을 추가하지 않음');

    await practice.setViewportSize({ width: 390, height: 844 });
    const overflow = await practice.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `모바일 가로 넘침 없음: ${overflow}px`);

    await page.evaluate(() => localStorage.setItem('gfield_student', 'docssam'));
    mockRows = [];
    await page.goto(`http://127.0.0.1:${port}/final.html?round=1&name=docssam&go=report`, { waitUntil: 'domcontentloaded' });
    await page.getByText('파이널 1회 성적표가 아직 등록되지 않았습니다.', { exact: true }).waitFor();
    assert.equal(await page.locator('.kpi').count(), 0, '미등록 성적에는 빈 분석표를 표시하지 않음');

    const ox = Array(30).fill('O'); ox[3] = 'X'; ox[17] = 'X';
    mockRows = [{ student: 'docssam', round: 'final1', ox: ox.join(''), score: 93.9, wrong: 2, source: 'admin', updated_at: '2026-09-05T00:00:00.000Z' }];
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText(/docssam 학생의 공식 1차 성적표 · 읽기 전용/).waitFor();
    assert.equal(await page.locator('.wp-item').count(), 2, '공식 오답 두 문항의 유사문제만 연결');
    assert.match(await page.locator('#wpSummary').textContent(), /유사문제 6문제/);
    assert.deepEqual(writeMethods, [], '개인 성적표 열람은 성적을 다시 저장하지 않음');

    await page.goto(`http://127.0.0.1:${port}/final.html?round=1&name=another-student&go=report`, { waitUntil: 'domcontentloaded' });
    await page.getByText('내 성적표 전용 화면입니다', { exact: true }).waitFor();
    assert.equal(await page.locator('.kpi').count(), 0, '로그인 이름과 다른 학생 성적은 표시하지 않음');
    assert.deepEqual(errors, [], '브라우저 오류 없음');
    console.log((draftLayout?'DRAFT LAYOUT ONLY; ':'')+'PASS final wrong-practice and personal report: exact wrong items, point filters, 3 per type, read-only own-name report, missing-score notice');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
