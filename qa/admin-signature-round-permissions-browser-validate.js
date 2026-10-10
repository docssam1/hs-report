'use strict';

// Focused browser QA: no production student data is served and every write is blocked.
// Reuses the local-server, isolated-session and book-card framework from the round-access QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
let BASE_URL = process.env.GFIELD_QA_BASE_URL || '';
const STUDENTS = ['시그니처검수A', '시그니처검수B'];
const SIGNATURE_KEYS = ['mock-signature-1', 'mock-signature-2'];
const LABELS = { 'mock-signature-1': '시그니처 1회', 'mock-signature-2': '시그니처 2회' };
const INITIAL_PERMISSIONS = {
  'concept-basic': [STUDENTS[0]],
  'concept-core': [],
  'question-bank': [STUDENTS[1]],
  'mock-mid-7': [STUDENTS[1]],
  'mock-mid-8': ['*'],
  'mock-final-5': [STUDENTS[0]],
  'mock-final-6': [],
  'mock-final-7': [STUDENTS[1]],
  'mock-final-8': [STUDENTS[0]],
  'mock-final-9': [STUDENTS[0], STUDENTS[1]],
  'mock-signature-1': [],
  'mock-signature-2': [STUDENTS[1]],
};
const DATA_FIXTURE = 'window.GFIELD_DATA = ' + JSON.stringify({
  meta: { academy: '검수 전용', title: '합성 학생 승인 검수', currentWeekId: '', year: '2026', examDate: '2026-11-01' },
  nodes: [], students: STUDENTS, studentTypes: {},
  attendance: Object.fromEntries(STUDENTS.map(student => [student, []])),
  specialStudents: [], content: {}, reports: {}, pins: {},
  archiveFolders: ['추가 모의고사'], archiveAccess: { '추가 모의고사': [] },
  archiveProductAccess: INITIAL_PERMISSIONS,
  vipAccess: {}, vip: {}, info: [], examSets: [],
  books: Object.keys(INITIAL_PERMISSIONS).filter(key => !SIGNATURE_KEYS.includes(key)).map(key => ({
    folder: '추가 모의고사', title: '합성 교재 ' + key, accessKey: key,
    pdf: '', cover: '', video: '', date: '', links: [],
  })),
}) + ';';
const SCORE_FIXTURE = 'window.GFIELD_MOCK={rounds:{}};window.GFIELD_MOCK_HW={rounds:{}};' +
  'window.GFIELD_MOCK_FINAL={rounds:{}};window.GFIELD_MOCK_ORIGINAL={rounds:{}};' +
  'window.GFIELD_LAST_SCORE_DATA={rounds:{}};';

async function permissions(page) {
  return page.evaluate(() => JSON.parse(JSON.stringify(S.archiveProductAccess)));
}

function signatureRow(page, key) {
  return page.locator('#signature-acc-matrix tbody tr').filter({
    has: page.locator('th').filter({ hasText: new RegExp('^' + LABELS[key] + '$') }),
  });
}

async function bookCard(page, key) {
  const index = await page.evaluate(key => S.books.findIndex(book => book.accessKey === key), key);
  assert.ok(index >= 0, key + ' has a synthetic library item');
  const card = page.locator('#book-items > .content-week').nth(index);
  await card.locator('.cw-head').waitFor();
  if (await card.evaluate(el => el.classList.contains('acc-collapsed'))) await card.locator('.cw-head').click();
  return card;
}

async function unrelatedState(page) {
  return page.evaluate(() => JSON.parse(JSON.stringify({
    students: S.students, studentTypes: S.studentTypes, attendance: S.attendance,
    specialStudents: S.specialStudents, archiveAccess: S.archiveAccess,
    vipAccess: S.vipAccess, pins: S.pins, reports: S.reports,
  })));
}

async function verifySignatureState(page, key, expected, before, protectedState, finalHTML) {
  const after = await permissions(page);
  assert.deepEqual(after[key], expected, key + ' has the exact intended approvals');
  assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort(), 'no approval group is added or removed');
  for (const otherKey of Object.keys(before).filter(otherKey => otherKey !== key)) {
    assert.deepEqual(after[otherKey], before[otherKey], key + ' must not change ' + otherKey);
  }
  assert.deepEqual(await unrelatedState(page), protectedState, 'student, attendance and other approval data are unchanged');
  assert.equal(await page.locator('#final7-acc-matrix').innerHTML(), finalHTML, 'existing Final 7/8 table is preserved');
}

async function verifyViewport(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const errors = [], writes = [], externalRequests = [];
  await context.addInitScript(() => {
    localStorage.setItem('gfield_hs_admin_session_v1', JSON.stringify({
      access_token: 'qa-admin-access', refresh_token: 'qa-admin-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }));
  });
  await context.route(/^https?:\/\//, route => {
    const request = route.request(), url = new URL(request.url());
    if (!['GET', 'HEAD'].includes(request.method())) {
      writes.push(request.method() + ' ' + url.pathname);
      return route.abort();
    }
    if (url.origin === new URL(BASE_URL).origin) {
      if (url.pathname === '/data.js') return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: DATA_FIXTURE });
      if (/\/(?:mock-data(?:-hw|-final|-original)?|last-score-data)\.js$/.test(url.pathname)) {
        return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: SCORE_FIXTURE });
      }
      return route.continue();
    }
    externalRequests.push(request.method() + ' ' + url.pathname);
    if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co') {
      const body = url.pathname === '/auth/v1/user' ? { id: 'qa-admin', app_metadata: { role: 'admin', admin_id: 'DOCSSAM' } } :
        url.pathname === '/rest/v1/hs_accounts' ? [{ role: 'admin', active: true, student: null }] : [];
      return route.fulfill({ json: body });
    }
    return route.fulfill({ status: 200, body: '' });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(10000);
  let assertions = 0;
  try {
    await page.goto(BASE_URL + '/admin.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app:not(.hidden)');
    await page.click('button[data-tab="archive"]');
    assert.deepEqual(await page.locator('#signature-acc-matrix tbody tr > th').allTextContents(), ['시그니처 1회', '시그니처 2회']);
    assert.deepEqual(await page.locator('#final7-acc-matrix tbody tr > th').allTextContents(), ['최종 7회', '최종 8회']);
    assert.equal(await page.locator('#mid-acc-matrix').count(), 0, 'focused release does not add an unrelated Mid table');
    assert.deepEqual(await permissions(page), INITIAL_PERMISSIONS, 'rendering does not change synthetic approval lists');
    assert.equal(await page.evaluate(() => S.books.some(book => String(book.accessKey).includes('signature'))), false);
    assertions += 5;

    const initial = await permissions(page);
    await page.locator('#acc-matrix tbody tr button').click();
    assert.deepEqual(await permissions(page), initial, 'folder approval does not grant product-round approvals');
    await page.evaluate(() => { S.archiveAccess['추가 모의고사'] = []; renderAccMatrix(); });
    const protectedState = await unrelatedState(page);
    const finalHTML = await page.locator('#final7-acc-matrix').innerHTML();
    assertions++;

    // Approval is possible before a signature book exists, including student-side repaired books.
    await signatureRow(page, SIGNATURE_KEYS[0]).locator('td').nth(2).click();
    await verifySignatureState(page, SIGNATURE_KEYS[0], [STUDENTS[0]], initial, protectedState, finalHTML);
    await page.evaluate(keys => {
      keys.forEach(key => S.books.push({ folder: '추가 모의고사', title: '합성 교재 ' + key, accessKey: key,
        pdf: '', cover: '', video: '', date: '', links: [] }));
      renderBooks();
    }, SIGNATURE_KEYS);
    assert.equal(await (await bookCard(page, SIGNATURE_KEYS[0])).locator('input[type=checkbox]').first().isChecked(), true);
    assert.equal(await (await bookCard(page, SIGNATURE_KEYS[1])).locator('input[type=checkbox]').nth(1).isChecked(), true);
    assertions += 3;

    for (const key of SIGNATURE_KEYS) {
      await page.evaluate(key => { S.archiveProductAccess[key] = []; renderSignatureAccessMatrix(); renderBooks(); }, key);
      const before = await permissions(page);
      const check = async expected => {
        await verifySignatureState(page, key, expected, before, protectedState, finalHTML);
        assertions++;
      };
      await signatureRow(page, key).locator('td').nth(2).click();
      await check([STUDENTS[0]]);
      let card = await bookCard(page, key);
      assert.equal(await card.locator('input[type=checkbox]').first().isChecked(), true, key + ' matrix updates book');
      await card.locator('input[type=checkbox]').nth(1).check();
      await check(STUDENTS);
      assert.equal(await signatureRow(page, key).locator('td').nth(3).evaluate(el => el.classList.contains('on')), true, key + ' book updates matrix');
      card = await bookCard(page, key);
      await card.locator('input[type=checkbox]').first().uncheck();
      await check([STUDENTS[1]]);
      assert.equal(await signatureRow(page, key).locator('td').nth(2).evaluate(el => el.classList.contains('off')), true, key + ' book revokes A in matrix');
      await signatureRow(page, key).locator('td').nth(3).click();
      await check([]);
      await signatureRow(page, key).locator('td').first().click();
      await check(['*']);
      card = await bookCard(page, key);
      assert.equal(await card.locator('input[type=checkbox]:disabled').count(), STUDENTS.length, key + ' public access is reflected in book');
      await signatureRow(page, key).locator('td').nth(3).click();
      await check([STUDENTS[1]]);
      await signatureRow(page, key).getByRole('button', { name: '☑' }).click();
      await check(STUDENTS);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '전체 공개', exact: true }).click();
      await check(['*']);
      assert.equal(await signatureRow(page, key).locator('td').first().evaluate(el => el.classList.contains('on')), true);
      await signatureRow(page, key).locator('td').first().focus();
      await signatureRow(page, key).locator('td').first().press('Enter');
      await check([]);
      const studentCell = signatureRow(page, key).locator('td').nth(2);
      await studentCell.focus();
      const focus = await studentCell.evaluate(el => ({ style: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
      assert.ok(focus.style !== 'none' && focus.width >= 1, key + ' has visible keyboard focus');
      await studentCell.press('Space');
      await check([STUDENTS[0]]);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '학생 모두 선택', exact: true }).click();
      await check(STUDENTS);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '전체 공개', exact: true }).click();
      await check(['*']);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '🔓 전체 공개 중', exact: true }).click();
      await check([]);
      assertions += 6;
    }

    // Existing Final 7/8 entry points, row order and bidirectional book synchronization remain intact.
    const beforeFinal = await permissions(page);
    await page.evaluate(() => { finalRoundAccessAll(7); finalRoundAccessAll(8); });
    assert.deepEqual((await permissions(page))['mock-final-7'], STUDENTS);
    assert.deepEqual((await permissions(page))['mock-final-8'], STUDENTS);
    assert.equal(await page.locator('#final7-acc-matrix tbody tr').first().locator('td').nth(2).evaluate(el => el.classList.contains('on')), true);
    let finalBook = await bookCard(page, 'mock-final-7');
    assert.equal(await finalBook.locator('input[type=checkbox]').first().isChecked(), true);
    await finalBook.locator('input[type=checkbox]').first().uncheck();
    assert.deepEqual((await permissions(page))['mock-final-7'], [STUDENTS[1]]);
    assert.equal(await page.locator('#final7-acc-matrix tbody tr').first().locator('td').nth(2).evaluate(el => el.classList.contains('off')), true);
    for (const key of Object.keys(beforeFinal).filter(key => !['mock-final-7', 'mock-final-8'].includes(key))) {
      assert.deepEqual((await permissions(page))[key], beforeFinal[key], 'Final controls must not change ' + key);
    }
    assert.deepEqual(await unrelatedState(page), protectedState);
    assert.deepEqual(await page.locator('#final7-acc-matrix tbody tr > th').allTextContents(), ['최종 7회', '최종 8회']);
    assertions += 8;

    const measured = await page.evaluate(() => {
      const table = document.getElementById('signature-acc-matrix');
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        scrollable: getComputedStyle(table.parentElement).overflowX === 'auto',
        minimumCellHeight: Math.min(...[...table.querySelectorAll('td.cell')].map(cell => cell.getBoundingClientRect().height)),
        cells: [...table.querySelectorAll('td.cell')].map(cell => ({
          role: cell.getAttribute('role'), tabIndex: cell.tabIndex, label: cell.getAttribute('aria-label'),
        })),
      };
    });
    assert.ok(measured.scrollWidth <= measured.width + 1, JSON.stringify(measured));
    assert.equal(measured.scrollable, true);
    assert.ok(measured.minimumCellHeight >= 44, 'signature touch targets are at least 44px tall');
    measured.cells.forEach(cell => { assert.equal(cell.role, 'button'); assert.equal(cell.tabIndex, 0); assert.ok(cell.label); });
    assertions += 4;
    if (process.env.GFIELD_QA_ARTIFACT_DIR) {
      fs.mkdirSync(process.env.GFIELD_QA_ARTIFACT_DIR, { recursive: true });
      for (const id of ['signature-acc-matrix', 'final7-acc-matrix']) {
        await page.locator('#' + id).locator('..').locator('..').screenshot({
          path: path.join(process.env.GFIELD_QA_ARTIFACT_DIR, 'admin-' + id + '-' + width + '.png'),
        });
      }
    }
    assert.deepEqual(errors, [], 'browser errors');
    assert.deepEqual(writes, [], 'no external or production write attempts');
    return { width, signatureRows: 2, assertions, productionWrites: writes.length, errors: errors.length,
      mockedExternalReads: externalRequests.length, measured };
  } finally {
    await context.close();
  }
}

(async () => {
  const server = BASE_URL ? null : http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/data.js' && request.method === 'GET') {
      response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return response.end(DATA_FIXTURE);
    }
    const file = path.resolve(ROOT, '.' + pathname);
    if (request.method !== 'GET' || !file.startsWith(ROOT + path.sep) || file.includes('.private') ||
        !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); return response.end();
    }
    response.setHeader('Content-Type', ({
      '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css',
      '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
    })[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  if (server) {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    BASE_URL = 'http://127.0.0.1:' + server.address().port;
  }
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.GFIELD_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.GFIELD_QA_BROWSER_EXECUTABLE } : {}),
  });
  try {
    const viewports = [];
    for (const width of [1280, 390]) viewports.push(await verifyViewport(browser, width));
    const result = { pass: true, viewports, syntheticOnly: true, productionWrites: 0 };
    if (process.env.GFIELD_QA_ARTIFACT_DIR) {
      fs.writeFileSync(path.join(process.env.GFIELD_QA_ARTIFACT_DIR, 'signature-approval-browser-result.json'), JSON.stringify(result, null, 2) + '\n');
    }
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
    if (server) server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
