'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');

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
    assert.equal(await page.getByRole('link', { name: /오답 입력|답안·교재 연결표/ }).count(), 0, '준비되지 않은 진단 링크는 표시하지 않음');
  }
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  try {
    await verifyCase(browser, 'BASIC전용검수', true, false, false, false);
    await verifyCase(browser, 'CORE전용검수', false, true, false, false);
    await verifyCase(browser, '최종5회전용검수', false, false, true, false);
    await verifyCase(browser, '시그니처1회전용검수', false, false, false, true);
    await verifyCase(browser, '미승인검수', false, false, false, false);
    console.log('PASS browser library gate keeps textbook and mock-exam approvals independent');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
