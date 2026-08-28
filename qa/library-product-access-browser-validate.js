'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');

async function verifyCase(browser, student, basicAllowed, coreAllowed) {
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
      `D.archiveProductAccess['concept-core']=${coreAllowed ? '[n]' : '[]'};})();`,
  }));

  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
  if (await page.locator('#skipBtn').count()) await page.click('#skipBtn');
  await page.fill('#name-input', student);
  await page.click('#login .enter');
  await page.waitForSelector('#dashboard:not(.hidden)');
  await page.click('.nav-btn[data-v="archive"]');

  const basic = page.getByRole('button', { name: /THINKING BASIC/i });
  const core = page.getByRole('button', { name: /Thinking Core/i });
  assert.equal(await basic.count(), basicAllowed ? 1 : 0, `${student} BASIC 표시`);
  assert.equal(await core.count(), coreAllowed ? 1 : 0, `${student} CORE 표시`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  try {
    await verifyCase(browser, 'BASIC전용검수', true, false);
    await verifyCase(browser, 'CORE전용검수', false, true);
    await verifyCase(browser, '미승인검수', false, false);
    console.log('PASS browser library gate keeps BASIC and CORE approvals independent');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
