'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8897';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const APPROVED = '최종7승인검수';
const FINAL3_ONLY = '파이널3출석검수';

async function installRoundFixture(page) {
  await page.route('**/data.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: SOURCE + `\n;(function(){var D=window.GFIELD_DATA,a=${JSON.stringify(APPROVED)},f=${JSON.stringify(FINAL3_ONLY)};` +
      `if(!D.students.includes(a))D.students.push(a);if(!D.students.includes(f))D.students.push(f);` +
      `D.attendance[a]=[];D.attendance[f]=['sep-21'];D.archiveAccess['파이널 모의고사']=[];` +
      `D.archiveProductAccess['mock-final-7']=[a];})();`,
  }));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const approved = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await installRoundFixture(approved);
    await approved.goto(`${BASE_URL}/final.html?round=7&name=${encodeURIComponent(APPROVED)}`, { waitUntil: 'domcontentloaded' });
    await approved.waitForSelector('.start-doc');
    assert.equal(await approved.locator('#gname').count(), 0, 'approved student passes the Final 7 name gate');
    assert.equal(await approved.locator('.paper-lock').count(), 0, 'approved student is not stopped by the old review lock');
    assert.match(await approved.locator('.start-doc').innerText(), /최종 실전 모의고사 7회/);

    const denied = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installRoundFixture(denied);
    await denied.goto(`${BASE_URL}/final.html?round=7&name=${encodeURIComponent(FINAL3_ONLY)}`, { waitUntil: 'domcontentloaded' });
    await denied.waitForSelector('#gname');
    assert.equal(await denied.locator('.start-doc').count(), 0, 'Final 3 attendance must not open Final 7');

    const answer = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await installRoundFixture(answer);
    await answer.goto(`${BASE_URL}/answer.html?set=final&round=7&name=${encodeURIComponent(APPROVED)}`, { waitUntil: 'domcontentloaded' });
    await answer.waitForSelector('#content:not(.hidden)');
    assert.equal(await answer.locator('#body tr').count(), 30, 'approved student sees the Final 7 answer table');

    const answerDenied = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installRoundFixture(answerDenied);
    await answerDenied.goto(`${BASE_URL}/answer.html?set=final&round=7&name=${encodeURIComponent(FINAL3_ONLY)}`, { waitUntil: 'domcontentloaded' });
    await answerDenied.waitForSelector('#gate:not(.hidden)');
    assert.equal(await answerDenied.locator('#content:not(.hidden)').count(), 0, 'Final 3 attendance cannot open Final 7 answers');

    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const admin = await adminContext.newPage();
    await admin.addInitScript(() => {
      localStorage.setItem('gfield_hs_admin_session_v1', JSON.stringify({
        access_token: 'qa-admin-access',
        refresh_token: 'qa-admin-refresh',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'qa-admin', app_metadata: { role: 'admin', admin_id: 'DOCSSAM' } },
      }));
    });
    await admin.route('https://fgahqumaldheqettmvqg.supabase.co/**', route => {
      if (route.request().url().includes('/auth/v1/user')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'qa-admin', app_metadata: { role: 'admin', admin_id: 'DOCSSAM' } }) });
      }
      return route.abort();
    });
    await admin.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
    await admin.waitForSelector('#app:not(.hidden)');
    await admin.click('button[data-tab="archive"]');
    await admin.evaluate(() => {
      S.students = ['회차승인검수A', '회차승인검수B'];
      S.archiveProductAccess['mock-final-7'] = [];
      renderFinal7AccessMatrix();
      renderBooks();
    });
    await admin.waitForSelector('#final7-acc-matrix tbody tr');
    assert.match(await admin.locator('#final7-acc-matrix').innerText(), /최종 7회/);
    const cells = admin.locator('#final7-acc-matrix tbody tr td');
    await cells.nth(2).click();
    assert.deepEqual(await admin.evaluate(() => Array.from(S.archiveProductAccess['mock-final-7'])), ['회차승인검수A']);
    const final7BookIndex = await admin.evaluate(() => S.books.findIndex(book => book && book.accessKey === 'mock-final-7'));
    assert.ok(final7BookIndex >= 0, 'Final 7 library card uses the same approval key');
    await adminContext.close();

    console.log('PASS Final 7 round approval blocks Final 3 attendance and stays editable in admin');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
