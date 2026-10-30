'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
require('./email-login-test-stub');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(SOURCE, dataContext, { filename: 'data.js' });

async function verifyTopSecretFinishTwo(browser) {
  const approved = '시크릿승인검수';
  const denied = '시크릿미승인검수';
  const key = 'mock-top-secret-finish-2';
  const book = dataContext.window.GFIELD_DATA.books.find(item => item && item.accessKey === key);
  assert.equal(book?.title, '시크릿 마무리 모의고사 2회');
  assert.equal(book?.pdf, '', '시험지는 페이지별 이미지로만 연결');
  assert.equal(book?.pages, 7);
  assert.equal(book?.video, '', '강의는 아직 연결하지 않음');
  assert.equal(book?.links?.length, 3, '정답·유사문제·유사문제 풀이 PDF 링크');
  for (const link of book.links) {
    assert.match(link.url, /^materials\/top-secret-finish-2-(?:solutions|similar-questions|similar-solutions)\.pdf$/);
    assert.ok(link.download, '다운로드 파일명');
    assert.ok(fs.existsSync(path.join(ROOT, link.url)), '다운로드 PDF 파일');
  }
  assert.equal(dataContext.window.GFIELD_DATA.archiveProductAccess[key].length, 0, '새 승인 명단은 비어 있음');
  assert.ok(fs.existsSync(path.join(ROOT, 'materials/top-secret-finish-2-questions.pdf')));
  for (let i = 1; i <= 7; i += 1) {
    assert.ok(fs.existsSync(path.join(ROOT, 'materials/top-secret-finish-2', String(i).padStart(3, '0') + '.jpg')));
  }
  for (const [name, allowed] of [[approved, true], [denied, false]]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    await page.route('https://**/*', route => route.abort());
    await page.route('**/data.js*', route => route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: SOURCE + `\n;(function(){var D=window.GFIELD_DATA,n=${JSON.stringify(name)};` +
        `D.students.push(n);D.archiveProductAccess[${JSON.stringify(key)}]=${allowed ? '[n]' : '[]'};})();`,
    }));
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    if (await page.locator('#skipBtn').count()) await page.click('#skipBtn');
    await page.fill('#name-input', name);
    await page.click('#login .enter');
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.click('.nav-btn[data-v="archive"]');
    const entry = page.getByRole('button', { name: /시크릿 마무리 모의고사 2회/ });
    assert.equal(await entry.count(), allowed ? 1 : 0, `${name} 자료실 승인 범위`);
    if (allowed) {
      await entry.click();
      await page.waitForSelector('#bookviewer.open');
      assert.equal(await page.locator('#bookviewer .bv-pg img').count(), 7, '시험지 7쪽 미리보기');
      await page.waitForFunction(() => [...document.querySelectorAll('#bookviewer .bv-pg img')].every(img => img.complete && img.naturalWidth > 0));
      assert.equal(await page.locator('#bv-actions a[download]').count(), 3, '풀이·유사문제 바로 다운로드');
      for (let i = 0; i < book.links.length; i += 1) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.locator('#bv-actions a[download]').nth(i).click(),
        ]);
        assert.equal(download.suggestedFilename(), book.links[i].download);
        assert.ok((await fs.promises.stat(await download.path())).size > 1000, '다운로드 PDF 바이트');
      }
    }
    await context.close();
  }
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
  await admin.evaluate(accessKey => {
    S.students = ['시크릿검수A', '시크릿검수B'];
    S.archiveProductAccess[accessKey] = [];
    renderFinal7AccessMatrix();
    renderBooks();
  }, key);
  const row = admin.locator(`#final7-acc-matrix tbody tr[data-access-key="${key}"]`);
  assert.equal(await row.count(), 1, '관리자 승인표에 독립 회차가 표시됨');
  await row.locator('td').nth(2).click();
  assert.deepEqual(await admin.evaluate(accessKey => Array.from(S.archiveProductAccess[accessKey]), key), ['시크릿검수A']);
  await adminContext.close();
}


(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  try {
    await verifyTopSecretFinishTwo(browser);
    console.log('PASS 시크릿 마무리 2회 자료실 승인·미승인 분리, PDF 3개 다운로드, 7쪽 열람, 관리자 회차 승인표');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
