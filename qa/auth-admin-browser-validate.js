'use strict';

const assert = require('node:assert/strict');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';

const adminSession = {
  access_token: 'qa-admin-access',
  refresh_token: 'qa-admin-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'qa-admin', app_metadata: { role: 'admin', admin_id: 'DOCSSAM' } },
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') failures.push(`console: ${message.text()}`); });

  await page.addInitScript(() => {
    localStorage.setItem('gfield_hs_student_session_v1', JSON.stringify({
      access_token: 'student-access',
      refresh_token: 'student-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }));
  });

  await page.route('https://fgahqumaldheqettmvqg.supabase.co/**', async route => {
    const request = route.request();
    const url = request.url();
    let body = {};
    try { body = request.postDataJSON() || {}; } catch {}

    if (url.includes('/functions/v1/hs-admin-session') && body.action === 'login') {
      assert.equal(body.name, 'DOCSSAM');
      assert.equal(body.approvalCode, '01020837265');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ session: adminSession, deviceToken: 'qa-device-token' }) });
    }
    if (url.includes('/functions/v1/hs-approval-admin') && body.action === 'list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accounts: [], resultStudents: [], unownedStudents: [] }) });
    }
    if (url.includes('/functions/v1/hs-approval-admin') && body.action === 'issue') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ student: body.student, approvalCode: '1234-5678-9012', canSelfEnter: false }) });
    }
    if (url.includes('/auth/v1/user')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(adminSession.user) });
    }
    if (url.includes('/auth/v1/logout')) {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.abort();
  });

  try {
    await page.goto(`${BASE_URL}/auth-admin.html`, { waitUntil: 'domcontentloaded' });
    await page.fill('#adminCode', '01020837265');
    await page.click('#loginBtn');
    await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(await page.locator('#loginPanel.hidden').count(), 1, 'login panel hidden after login');
    assert.ok(await page.locator('#rows tr').count() >= 20, 'student roster rendered');

    const stored = await page.evaluate(() => ({ ...localStorage }));
    assert.ok(stored.gfield_hs_admin_session_v1, 'admin session stored');
    assert.ok(stored.gfield_hs_student_session_v1, 'student session remains separate');
    assert.equal(JSON.stringify(stored).includes('01020837265'), false, 'raw admin approval number not stored');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(await page.locator('#loginPanel.hidden').count(), 1, 'saved session restores without another login');

    const firstIssue = page.locator('[data-issue]').first();
    await firstIssue.click();
    await page.waitForSelector('#codeModal:not(.hidden)');
    assert.equal(await page.locator('#codeValue').textContent(), '1234-5678-9012');

    await page.goto(`${BASE_URL}/admin.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app:not(.hidden)');
    assert.equal(await page.locator('#gate.hidden').count(), 1, 'main admin console restores the same saved session');
    assert.equal(failures.length, 0, failures.join('\n'));
    console.log('PASS auth admin browser persistence, main console restore, session separation, roster, issue modal');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
