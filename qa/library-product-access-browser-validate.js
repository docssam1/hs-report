'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
require('./email-login-test-stub'); // QA 전용: 학부모 이메일 인증 단계를 인증된 브라우저로 취급
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(SOURCE, dataContext, { filename: 'data.js' });
const appliedBooks = dataContext.window.GFIELD_DATA.books.filter(book => book && book.folder === '활용 모의고사');

async function verifyCase(browser, student, basicAllowed, coreAllowed, final5Allowed, signature1Allowed) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.route('https://**/*', route => route.abort());
  await page.route('**/data.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: SOURCE + `\n;(function(){var D=window.GFIELD_DATA,n=${JSON.stringify(student)};` +
      `if(!D.students.includes(n))D.students.push(n);D.archiveAccess['개념 교재']=[n];` +
      `D.archiveProductAccess['concept-basic']=${basicAllowed ? '[n]' : '[]'};` +
      `D.archiveProductAccess['concept-core']=${coreAllowed ? '[n]' : '[]'};` +
      `D.archiveProductAccess['mock-final-5']=${final5Allowed ? '[n]' : '[]'};` +
      `D.archiveProductAccess['mock-signature-1']=${signature1Allowed ? '[n]' : '[]'};})();`,
  }));

  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
  if (await page.locator('#skipBtn').count()) await page.click('#skipBtn');
  await page.fill('#name-input', student);
  await page.click('#login .enter');
  await page.waitForSelector('#dashboard:not(.hidden)');
  await page.click('.nav-btn[data-v="archive"]');

  const basic = page.getByRole('button', { name: /THINKING BASIC/i });
  const core = page.getByRole('button', { name: /Thinking Core/i });
  const final5 = page.getByRole('button', { name: /최종 실전 모의고사 5회/ });
  const signature1 = page.getByRole('button', { name: /초등선발 대비 시그니처 실전 모의고사 1회/ });
  assert.equal(await basic.count(), basicAllowed ? 1 : 0, `${student} BASIC 표시`);
  assert.equal(await core.count(), coreAllowed ? 1 : 0, `${student} CORE 표시`);
  assert.equal(await final5.count(), final5Allowed ? 1 : 0, `${student} 최종 5회 표시`);
  assert.equal(await signature1.count(), signature1Allowed ? 1 : 0, `${student} 시그니처 1회 표시`);
  if (final5Allowed) {
    await final5.click();
    await page.waitForSelector('#bookviewer.open');
    const images = page.locator('#bookviewer .bv-pg img');
    assert.equal(await images.count(), 7, '최종 5회 뷰어는 7쪽을 표시');
    await page.waitForFunction(() => [...document.querySelectorAll('#bookviewer .bv-pg img')].every(img => img.complete && img.naturalWidth > 0));
    const video = page.locator('#bookviewer .bv-stage.split .bv-vid iframe');
    assert.equal(await video.count(), 1, '최종 5회 시험지·영상 결합 뷰어');
    assert.match(await video.getAttribute('src'), /youtube\.com\/embed\/1uhIx_l04EA/, '최종 5회 풀이 영상');
    assert.equal(await page.getByRole('link', { name: /실전 타이머/ }).count(), 1, '최종 5회 타이머 연결');
    assert.equal(await page.getByRole('link', { name: /오답 입력·분석/ }).count(), 1, '최종 5회 진단 연결');
    assert.equal(await page.getByRole('link', { name: /답안·교재 연결표/ }).count(), 1, '최종 5회 답안 연결');
    await page.evaluate(() => closeBook());
  }

  await page.click('.nav-btn[data-v="roadmap"]');
  const extraMock = page.locator('.special-branch .node:visible').filter({ hasText: '추가 모의고사' });
  assert.equal(await extraMock.count(), 1, `${student} 로드맵 추가 모의고사 항목`);
  assert.equal(await extraMock.evaluate(el => el.classList.contains('locked')), !final5Allowed, `${student} 서재 승인과 로드맵 잠금 연동`);
  await extraMock.click();
  if (final5Allowed) {
    await page.waitForSelector('#overlay:not(.hidden)');
    const roadmapFinal5 = page.getByRole('button', { name: /최종 실전 모의고사 5회.*열기/ });
    assert.equal(await roadmapFinal5.count(), 1, '로드맵에 승인된 최종 5회 표시');
    await roadmapFinal5.click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg img').count(), 7, '로드맵에서도 같은 최종 5회 뷰어 연결');
  } else {
    assert.equal(await page.locator('#overlay:not(.hidden)').count(), 0, `${student} 미승인 로드맵 자료 차단`);
  }
  await context.close();
}

async function verifyAppliedAnswerAccess(browser) {
  const approved = '활용답안승인검수';
  const denied = '활용답안미승인검수';
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.route('https://**/*', route => route.abort());
  await page.route('**/hs-student-guard.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'window.GFIELD_STUDENT_GUARD={ready:Promise.resolve()};',
  }));
  await page.route('**/data.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: SOURCE + `\n;(function(){var D=window.GFIELD_DATA;` +
      `D.students.push(${JSON.stringify(approved)},${JSON.stringify(denied)});` +
      `D.studentTypes[${JSON.stringify(approved)}]='resident';D.studentTypes[${JSON.stringify(denied)}]='resident';` +
      `D.archiveAccess['활용 모의고사']=[${JSON.stringify(approved)}];})();`,
  }));

  assert.equal(appliedBooks.length, 9, '자료실 활용 모의고사 1~9회가 등록되어 있음');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  for (let round = 1; round <= 9; round += 1) {
    const book = appliedBooks.find(item => item.title === `활용 모의고사 ${round}회`);
    assert.ok(book, `활용 모의고사 ${round}회 자료실 항목`);
    const answerLink = (book.links || []).find(link => link.label === '답안·교재 연결표');
    assert.match(answerLink?.url || '', new RegExp(`answer\\.html\\?set=hw&round=${round}$`), `${round}회 답안 연결 URL`);

    const localAnswerUrl = new URL(answerLink.url);
    localAnswerUrl.host = new URL(BASE_URL).host;
    localAnswerUrl.protocol = new URL(BASE_URL).protocol;
    await page.evaluate(name => localStorage.setItem('gfield_student', name), approved);
    await page.goto(localAnswerUrl.href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#content')?.classList.contains('hidden') === false);
    assert.equal(await page.locator('#gate').isHidden(), true, `자료실에서 승인된 재원생은 ${round}회 연결표 자동 열람`);
    assert.match(await page.locator('#ttl').textContent(), new RegExp(`활용 모의고사 ${round}회`));

    await page.evaluate(name => localStorage.setItem('gfield_student', name), denied);
    await page.goto(localAnswerUrl.href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#gate')?.classList.contains('hidden') === false);
    assert.equal(await page.locator('#gate').isVisible(), true, `자료실 미승인 학생은 ${round}회 연결표 접근 차단`);
  }
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  try {
    if (process.env.GFIELD_QA_APPLIED5_ONLY !== '1') {
      await verifyCase(browser, 'BASIC전용검수', true, false, false, false);
      await verifyCase(browser, 'CORE전용검수', false, true, false, false);
      await verifyCase(browser, '최종5회전용검수', false, false, true, false);
      await verifyCase(browser, '시그니처1회전용검수', false, false, false, true);
      await verifyCase(browser, '미승인검수', false, false, false, false);
    }
    await verifyAppliedAnswerAccess(browser);
    console.log('PASS browser library gate keeps textbook and mock-exam approvals independent; applied rounds 1–9 answer gates follow library access');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
