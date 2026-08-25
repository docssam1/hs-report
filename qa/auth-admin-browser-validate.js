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
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ session: adminSession, deviceToken: 'D'.repeat(48) }) });
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
    const pdfPages = await page.evaluate(async () => {
      if (!window.pdfjsLib) return 0;
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/3.11.174/pdf.worker.min.js';
      const response = await fetch('books/1787223229518_0138_1031____C_CH5_____.pdf');
      const bytes = await response.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      const count = pdf.numPages;
      await pdf.destroy();
      return count;
    });
    assert.ok(pdfPages > 0, 'self-hosted PDF.js and worker parse an existing admin PDF');

    const activationContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      const activationPage = await activationContext.newPage();
      const activationFailures = [];
      const activationToken = 'A'.repeat(48);
      activationPage.on('pageerror', error => activationFailures.push(`pageerror: ${error.message}`));
      activationPage.on('console', message => { if (message.type() === 'error') activationFailures.push(`console: ${message.text()}`); });
      await activationPage.route('https://fgahqumaldheqettmvqg.supabase.co/**', async route => {
        const request = route.request();
        const url = request.url();
        let body = {};
        try { body = request.postDataJSON() || {}; } catch {}
        if (url.includes('/functions/v1/hs-admin-session') && body.action === 'redeem') {
          assert.equal(request.headers()['x-bootstrap-token'], activationToken);
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ session: adminSession, deviceToken: 'E'.repeat(48) }) });
        }
        if (url.includes('/auth/v1/user')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(adminSession.user) });
        }
        return route.abort();
      });

      await activationPage.goto(`${BASE_URL}/admin-activate.html#activate=${activationToken}`, { waitUntil: 'domcontentloaded' });
      await activationPage.waitForSelector('#app:not(.hidden)');
      assert.ok(activationPage.url().endsWith('/admin.html'), 'dedicated activation page redirects to the admin console');
      assert.equal(activationPage.url().includes('#activate='), false, 'activation token removed from the address immediately');
      const activatedStored = await activationPage.evaluate(() => ({ ...localStorage }));
      assert.ok(activatedStored.gfield_hs_admin_session_v1, 'activation stores admin session');
      assert.ok(activatedStored.gfield_hs_admin_device_v1, 'activation stores device key');
      assert.equal(JSON.stringify(activatedStored).includes(activationToken), false, 'activation token is never stored');

      await activationPage.reload({ waitUntil: 'domcontentloaded' });
      await activationPage.waitForSelector('#app:not(.hidden)');
      assert.equal(await activationPage.locator('#gate.hidden').count(), 1, 'activated admin session restores after reload');
      assert.equal(activationFailures.length, 0, activationFailures.join('\n'));
    } finally {
      await activationContext.close();
    }

    const expiredContext = await browser.newContext({ viewport: { width: 800, height: 700 } });
    try {
      const expiredPage = await expiredContext.newPage();
      const expiredToken = 'F'.repeat(48);
      await expiredPage.route('https://fgahqumaldheqettmvqg.supabase.co/**', async route => {
        const request = route.request();
        let body = {};
        try { body = request.postDataJSON() || {}; } catch {}
        if (body.action === 'redeem') {
          return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'INVALID_CREDENTIALS' }) });
        }
        return route.abort();
      });
      await expiredPage.goto(`${BASE_URL}/admin-activate.html#activate=${expiredToken}`, { waitUntil: 'domcontentloaded' });
      await expiredPage.waitForSelector('#state.error');
      assert.equal(expiredPage.url().includes('#activate='), false, 'expired activation token is removed from the address');
      assert.equal(await expiredPage.locator('#adminLink').isVisible(), true, 'expired activation keeps normal admin login available');
    } finally {
      await expiredContext.close();
    }

    assert.equal(failures.length, 0, failures.join('\n'));
    console.log('PASS auth admin browser persistence, one-time activation, main console restore, session separation, roster, issue modal');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
