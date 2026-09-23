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
  let resetRound = '';
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    failures.push(`console: ${message.text()}${location.url ? ` @ ${location.url}` : ''}`);
  });

  await page.addInitScript(() => {
    localStorage.setItem('gfield_hs_student_session_v1', JSON.stringify({
      access_token: 'student-access',
      refresh_token: 'student-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }));
  });

  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.route('https://fgahqumaldheqettmvqg.supabase.co/**', async route => {
    const request = route.request();
    const url = request.url();
    let body = {};
    try { body = request.postDataJSON() || {}; } catch {}

    if (url.includes('/functions/v1/hs-admin-session') && body.action === 'login') {
      assert.equal(body.name, 'DOCSSAM');
      assert.equal(body.approvalCode, '01020837265');
      assert.equal(body.deviceToken, '', 'a browser without a device key must be allowed to request automatic enrollment');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ session: adminSession, deviceToken: 'D'.repeat(48) }) });
    }
    if (url.includes('/functions/v1/hs-admin-session') && body.action === 'createEnrollment') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ enrollmentToken: 'A'.repeat(48), expiresAt: '2026-08-26T12:00:00.000Z' }) });
    }
    if (url.includes('/functions/v1/hs-approval-admin') && body.action === 'list') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accounts: [], resultStudents: [], unownedStudents: [] }) });
    }
    if (url.includes('/functions/v1/hs-approval-admin') && body.action === 'issue') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ student: body.student, approvalCode: '1234-5678-9012', canSelfEnter: false }) });
    }
    if (url.includes('/rest/v1/mock_results')) {
      if (request.method() === 'POST') {
        resetRound = body.round || '';
        return route.fulfill({ status: 201, contentType: 'application/json', body: '' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { student: '허유민', round: 'original1', ox: `X${'O'.repeat(29)}`, score: 97.3, wrong: 1, source: 'admin', updated_at: '2026-08-26T10:00:00.000Z' },
        { student: '허유민', round: 'original1@2', ox: `XX${'O'.repeat(28)}`, score: 94.6, wrong: 2, source: 'practice-admin', updated_at: '2026-08-26T11:00:00.000Z' },
        { student: '허유민', round: 'original1@3', ox: `X${'O'.repeat(29)}`, score: 97.3, wrong: 1, source: 'practice-admin', updated_at: '2026-08-26T12:00:00.000Z' },
        { student: '온라인테스트', round: 'original2', ox: `${'O'.repeat(29)}X`, score: 95.8, wrong: 1, source: 'online', updated_at: '2026-08-26T13:00:00.000Z' },
        { student: '허유민', round: 'final1', ox: `X${'O'.repeat(29)}`, score: 97.3, wrong: 1, source: 'admin', updated_at: '2026-08-26T09:00:00.000Z' },
      ]) });
    }
    if (url.includes('/rest/v1/weak_types')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
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
    assert.equal(stored.gfield_hs_admin_device_v1, 'D'.repeat(48), 'automatically issued device key stored');
    assert.ok(stored.gfield_hs_student_session_v1, 'student session remains separate');
    assert.equal(JSON.stringify(stored).includes('01020837265'), false, 'raw admin approval number not stored');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(await page.locator('#loginPanel.hidden').count(), 1, 'saved session restores without another login');

    await page.click('#enrollmentBtn');
    await page.waitForSelector('#codeModal:not(.hidden)');
    assert.equal(
      await page.locator('#codeValue').textContent(),
      `${BASE_URL}/admin-activate.html#activate=${'A'.repeat(48)}`,
      'new-device link points to the dedicated one-time activation page',
    );
    await page.click('#closeModalBtn');

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

    await page.getByRole('button', { name: '⑩ 모의고사 결과' }).click();
    await page.waitForSelector('#mock-body select');
    await page.getByRole('button', { name: '파이널 모의고사' }).click();
    assert.match(await page.locator('#mock-body').textContent(), /92%/, 'existing final-set area classification stays on the shared blueprint');
    await page.getByRole('button', { name: '시그니처 실전 모의고사' }).click();
    const mockBody = page.locator('#mock-body');
    await mockBody.locator('select').selectOption({ label: '허유민' });
    await mockBody.getByText('초등선발 대비 시그니처 실전 모의고사 1회').first().waitFor();
    const originalAdminText = await mockBody.textContent();
    assert.match(originalAdminText, /97\.3/, 'saved original-form score rendered in the admin result table');
    assert.match(originalAdminText, /100%/, 'original-form item areas drive nonzero admin performance rates');
    assert.match(originalAdminText, /공식 누적 기준은 회차별 1차 기록/, 'official first attempt and latest practice statistics are labelled separately');
    assert.ok(await mockBody.locator('select option', { hasText: '온라인테스트' }).count(), 'online submitter outside data.js can be selected in admin results');
    const originalOfficialEntries = await page.evaluate(() => window.GFIELD_ADMIN_MOCK_V2.originalOfficialEntries());
    assert.deepEqual(originalOfficialEntries.map(entry => [entry.student, entry.round, entry.score, entry.wrong]), [
      ['온라인테스트', 2, 95.8, 1],
      ['허유민', 1, 97.3, 1],
    ], 'original-form official entry list includes only validated first attempts across both rounds');
    assert.equal(
      await page.evaluate(entry => window.GFIELD_ADMIN_MOCK_V2.reportUrl(entry), originalOfficialEntries[1]),
      'final.html?set=original&round=1&go=report&attempt=1&entry=teacher&name=%ED%97%88%EC%9C%A0%EB%AF%BC',
      'batch report route opens the saved original-form official result',
    );
    const originalOneReport = mockBody.getByRole('link', { name: '시그니처 실전 1회 공식 진단지' });
    assert.equal(
      await originalOneReport.getAttribute('href'),
      'final.html?set=original&round=1&go=report&attempt=1&entry=teacher&name=%ED%97%88%EC%9C%A0%EB%AF%BC',
      'saved original-form first attempt opens the official diagnosis without making another attempt',
    );
    assert.equal(
      await mockBody.getByRole('link', { name: '시그니처 실전 2회 맞은 문제 체크' }).getAttribute('href'),
      'final.html?set=original&round=2&go=answer&entry=teacher&name=%ED%97%88%EC%9C%A0%EB%AF%BC',
      'unrecorded original-form second round keeps teacher entry',
    );
    const originalOneRows = mockBody.locator('tr').filter({ hasText: '초등선발 대비 시그니처 실전 모의고사 1회' });
    for (const [slot, label] of [[1, '공식 1차 성적표'], [2, '연습 2차 성적표'], [3, '연습 3차 성적표']]) {
      assert.equal(
        await originalOneRows.getByRole('link', { name: label }).getAttribute('href'),
        `final.html?set=original&round=1&go=report&attempt=${slot}&entry=teacher&name=%ED%97%88%EC%9C%A0%EB%AF%BC`,
        `original-form attempt ${slot} opens its own saved report`,
      );
    }
    const teacherEntry = originalOneRows.getByRole('link', { name: /맞은 문제 체크/ }).first();
    assert.equal(
      await teacherEntry.getAttribute('href'),
      'final.html?set=original&round=1&go=answer&entry=teacher&name=%ED%97%88%EC%9C%A0%EB%AF%BC',
      'original-form teacher entry keeps set, round, and selected student',
    );

    const teacherPage = await context.newPage();
    const teacherFailures = [];
    teacherPage.on('pageerror', error => teacherFailures.push(`pageerror: ${error.message}`));
    teacherPage.on('console', message => { if (message.type() === 'error') teacherFailures.push(`console: ${message.text()}`); });
    await teacherPage.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await teacherPage.route('https://fonts.gstatic.com/**', route => route.fulfill({ status: 200, contentType: 'font/woff2', body: '' }));
    let teacherSavedRows = [];
    await teacherPage.route('https://fgahqumaldheqettmvqg.supabase.co/**', async route => {
      const request = route.request();
      if (request.url().includes('/rest/v1/mock_results')) {
        return route.fulfill({ status: request.method() === 'POST' ? 201 : 200, contentType: 'application/json', body: request.method() === 'POST' ? '' : JSON.stringify(teacherSavedRows) });
      }
      if (request.url().includes('/rest/v1/weak_types')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
      if (request.url().includes('/auth/v1/user')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(adminSession.user) });
      }
      return route.abort();
    });
    await teacherPage.goto(`${BASE_URL}/${await teacherEntry.getAttribute('href')}`, { waitUntil: 'domcontentloaded' });
    await teacherPage.waitForSelector('.agrid').catch(async error => { throw new Error(`${error.message}\nTeacher screen: ${(await teacherPage.locator('body').innerText()).slice(0, 1000)}`); });
    assert.equal(await teacherPage.locator('.agrid .abtn').count(), 30, 'teacher entry opens all 30 original-form answer buttons');
    for(let no=1;no<=30;no++)await teacherPage.locator('.abtn').nth(no-1).click();
    await teacherPage.click('#btnGrade');
    await teacherPage.getByRole('heading', { name: '시그니처 실전 모의고사 성적·약점 진단' }).waitFor();
    assert.equal(await teacherPage.locator('.who b').textContent(), '허유민', 'selected admin student carries into the original-form report');
    teacherSavedRows = [
      { student: '허유민', round: 'original1', ox: `X${'O'.repeat(29)}`, score: 97.3, wrong: 1, source: 'admin' },
      { student: '허유민', round: 'original1@2', ox: `XX${'O'.repeat(28)}`, score: 94.6, wrong: 2, source: 'practice-admin' },
    ];
    await teacherPage.goto(`${BASE_URL}/${await originalOneReport.getAttribute('href')}`, { waitUntil: 'domcontentloaded' });
    await teacherPage.getByRole('heading', { name: '시그니처 실전 모의고사 성적·약점 진단' }).waitFor();
    assert.match(await teacherPage.locator('.doc').textContent(), /97\.3/, 'official report reads the saved first attempt');
    await teacherPage.goto(`${BASE_URL}/${await originalOneRows.getByRole('link', { name: '연습 2차 성적표' }).getAttribute('href')}`, { waitUntil: 'domcontentloaded' });
    await teacherPage.getByRole('heading', { name: '시그니처 실전 모의고사 성적·약점 진단' }).waitFor();
    assert.match(await teacherPage.locator('.doc').textContent(), /94\.6/, 'practice report reads the saved second attempt');
    assert.match(await teacherPage.locator('body').textContent(), /연습 응시 2차/, 'practice report is visibly labelled and does not replace the official result');
    assert.equal(teacherFailures.length, 0, teacherFailures.join('\n'));
    await teacherPage.close();

    if (process.env.GFIELD_QA_SCREENSHOT) await page.screenshot({ path: process.env.GFIELD_QA_SCREENSHOT, fullPage: true });
    const resetButton = mockBody.getByRole('button', { name: '2차 초기화' }).first();
    page.once('dialog', dialog => dialog.accept());
    await resetButton.click();
    await page.waitForFunction(() => !document.querySelector('#mock-body')?.textContent?.includes('2차 초기화'));
    assert.equal(resetRound, 'original1@2', 'original-form reset uses the selected retry round key');
    assert.match(await mockBody.textContent(), /1차 초기화/, 'resetting attempt 2 keeps attempt 1');
    assert.match(await mockBody.textContent(), /3차 초기화/, 'resetting attempt 2 keeps attempt 3');

    const activationContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      const activationPage = await activationContext.newPage();
      const activationFailures = [];
      const activationToken = 'A'.repeat(48);
      activationPage.on('pageerror', error => activationFailures.push(`pageerror: ${error.message}`));
      activationPage.on('console', message => { if (message.type() === 'error') activationFailures.push(`console: ${message.text()}`); });
      await activationPage.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
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
    console.log('PASS auth admin browser persistence, one-time activation, main console restore, session separation, roster, issue modal, original-form result management');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
