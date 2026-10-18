'use strict';

// Synthetic students only; every external request is fulfilled locally or blocked.
// GitHub saves are captured, never transmitted. Production data.js is never served.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
require('./email-login-test-stub'); // QA only: round approval tests reuse authenticated-browser fixtures.
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');
const ROOT = path.resolve(__dirname, '..');
let BASE_URL = process.env.GFIELD_QA_BASE_URL || '';
const ARTIFACTS = process.env.GFIELD_QA_ARTIFACT_DIR || path.join(ROOT, '.private-work', 'middle7-additional-approval-20261011');
const STUDENTS = ['추가회차검수A', '추가회차검수B'];
const MID7 = 'mock-mid-7';
const ROUND_KEYS = [MID7, 'mock-final-7', 'mock-final-8'];
const LABELS = ['중급 7회', '최종 7회', '최종 8회'];
const clone = value => JSON.parse(JSON.stringify(value));
const INITIAL_PERMISSIONS = {
  'concept-basic': [STUDENTS[0]], 'question-bank': [STUDENTS[1]],
  'mock-mid-6': [STUDENTS[1]], [MID7]: [], 'mock-mid-8': ['*'],
  'mock-final-5': [], 'mock-final-6': [], 'mock-final-7': [STUDENTS[1]],
  'mock-final-8': [STUDENTS[0]], 'mock-final-9': STUDENTS.slice(),
  'mock-signature-1': [STUDENTS[0]], 'mock-signature-2': [STUDENTS[1]],
};
function book(key) {
  return { folder: '추가 모의고사', title: key === MID7 ? '중급 모의고사 7회 · 합성 교재' : '합성 교재 ' + key,
    accessKey: key, pdf: '', cover: '', video: '', date: '', links: [] };
}
function fixture(includeMiddleBook = true) {
  return {
    meta: { academy: '합성 검수', title: '추가 모의고사 승인 검수', currentWeekId: 'qa-week',
      year: '2026', examDate: '2026-11-01', lat: 37.5, lng: 127.0 },
    nodes: [{ id: 'qa-week', type: 'week', track: 'exam', date: '검수 주차', title: '합성 학습', desc: '', focus: '' }],
    students: STUDENTS.slice(), studentTypes: {},
    attendance: Object.fromEntries(STUDENTS.map(student => [student, ['qa-week']])),
    specialStudents: [], content: { 'qa-week': { notice: '합성 내용', homework: '', textbooks: [] } },
    reports: { [STUDENTS[0]]: [{ title: '합성 성적', score: '77', total: '100', comment: '검수 전용', files: [] }] },
    pins: {}, archiveFolders: ['추가 모의고사'], archiveAccess: { '추가 모의고사': [] },
    archiveProductAccess: clone(INITIAL_PERMISSIONS),
    vipAccess: { report: [], col: [], ses: [], cou: [], clinic: [], mag: [] },
    vip: { columns: [{ title: '합성 칼럼', body: '<p>검수용 내용 보존</p>', date: '2026-10-11' }],
      sessions: [], courses: [], clinic: { notice: '', url: '' }, magazine: [] },
    books: Object.keys(INITIAL_PERMISSIONS).filter(key => includeMiddleBook || key !== MID7).map(book),
    info: [], examSets: [],
  };
}
const scriptFor = data => 'window.GFIELD_DATA = ' + JSON.stringify(data) + ';\n';
const SCORE_FIXTURE = 'window.GFIELD_MOCK={rounds:{}};window.GFIELD_MOCK_HW={rounds:{}};' +
  'window.GFIELD_MOCK_FINAL={rounds:{}};window.GFIELD_MOCK_ORIGINAL={rounds:{}};window.GFIELD_LAST_SCORE_DATA={rounds:{}};';

async function newPage(browser, width, data, role = 'admin', student = STUDENTS[0]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const state = { errors: [], blockedWrites: [], puts: [], mockedTelemetry: 0, mockedExternalReads: 0, mockedAuthReads: 0 };
  await context.addInitScript(({ role }) => {
    localStorage.setItem('gfield_hs_' + role + '_session_v1', JSON.stringify({ access_token: 'qa-access',
      refresh_token: 'qa-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600 }));
    if (role === 'admin') localStorage.setItem('gfield_gh_token', 'qa-mocked-token');
  }, { role });
  await context.route(/^https?:\/\//, route => {
    const request = route.request(), url = new URL(request.url());
    if (url.hostname === 'api.github.com' && url.pathname === '/repos/docssam1/hs-report/contents/data.js') {
      if (request.method() === 'GET') return route.fulfill({ json: { encoding: 'base64', sha: 'qa-remote-sha',
        content: Buffer.from(scriptFor(data), 'utf8').toString('base64') } });
      if (request.method() === 'PUT') {
        state.puts.push(request.postDataJSON());
        return route.fulfill({ json: { content: { sha: 'qa-saved-sha' }, commit: { sha: 'qa-captured-commit' } } });
      }
    }
    if (!['GET', 'HEAD'].includes(request.method())) {
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co' && url.pathname === '/rest/v1/access_log') {
        state.mockedTelemetry++; return route.fulfill({ status: 204, body: '' });
      }
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co' && url.pathname === '/functions/v1/hs-approval-admin' && request.postDataJSON().action === 'list') {
        state.mockedAuthReads++;
        return route.fulfill({ json: { accounts: [], resultStudents: [], unownedStudents: [], emailLinksAvailable: true,
          emailLinks: [{ student: STUDENTS[0], email: 'qa-parent@example.com', firstVerifiedAt: '2026-10-11T01:00:00Z', lastSeenAt: '2026-10-11T02:00:00Z' }],
          studentDevices: [{ student: STUDENTS[0], devices: [1, 2, 3].map(number => ({ label: '합성 기기' + number, lastSeenAt: '2026-10-11T02:00:00Z' })) }], deviceLimit: null } });
      }
      state.blockedWrites.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    if (url.origin === new URL(BASE_URL).origin) {
      if (url.pathname === '/data.js') return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: scriptFor(data) });
      if (/\/(?:mock-data(?:-hw|-final|-original)?|last-score-data)\.js$/.test(url.pathname)) {
        return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: SCORE_FIXTURE });
      }
      return route.continue();
    }
    state.mockedExternalReads++;
    if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co') {
      const body = url.pathname === '/auth/v1/user' ? { id: 'qa-' + role, app_metadata: role === 'admin' ?
        { role: 'admin', admin_id: 'DOCSSAM' } : { role: 'student', student } } :
        url.pathname === '/rest/v1/hs_accounts' ? [{ role, active: true, student: role === 'student' ? student : null }] : [];
      return route.fulfill({ json: body });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => state.errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(BASE_URL + (role === 'admin' ? '/admin.html' : '/index.html'), { waitUntil: 'domcontentloaded' });
  if (role === 'admin') await page.waitForSelector('#app:not(.hidden)');
  return { context, page, state };
}
function assertSafe(state) {
  assert.deepEqual(state.errors, [], 'no browser errors');
  assert.deepEqual(state.blockedWrites, [], 'no unexpected write attempts');
}
const approvals = page => page.evaluate(() => JSON.parse(JSON.stringify(S.archiveProductAccess)));
const roundRow = (page, key) => page.locator('#final7-acc-matrix tbody tr[data-access-key="' + key + '"]');
async function bookCard(page, key) {
  const index = await page.evaluate(key => S.books.findIndex(item => item.accessKey === key), key);
  assert.ok(index >= 0, key + ' has a synthetic book');
  const card = page.locator('#book-items > .content-week').nth(index);
  await card.locator('.cw-head').waitFor();
  if (await card.evaluate(el => el.classList.contains('acc-collapsed'))) await card.locator('.cw-head').click();
  return card;
}
async function unrelated(page) {
  return page.evaluate(() => JSON.parse(JSON.stringify({ students: S.students, studentTypes: S.studentTypes,
    attendance: S.attendance, specialStudents: S.specialStudents, reports: S.reports, pins: S.pins,
    archiveAccess: S.archiveAccess, vipAccess: S.vipAccess, vip: S.vip, content: S.content })));
}
async function verifyOnlyKey(page, key, expected, before, protectedState, signatureHTML) {
  const after = await approvals(page);
  assert.deepEqual(after[key], expected, key + ' exact approvals');
  assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort(), 'no other approval keys added or removed');
  for (const other of Object.keys(before).filter(other => other !== key)) assert.deepEqual(after[other], before[other], other + ' unchanged');
  assert.deepEqual(await unrelated(page), protectedState, 'student data, scores, folder permissions and columns unchanged');
  assert.equal(await page.locator('#signature-acc-matrix').innerHTML(), signatureHTML, 'signature approvals remain separate');
  const row = roundRow(page, key), open = expected.includes('*');
  assert.equal(await row.locator('td').first().getAttribute('aria-pressed'), String(open));
  for (let index = 0; index < STUDENTS.length; index++) {
    assert.equal(await row.locator('td').nth(index + 2).getAttribute('aria-pressed'), String(!open && expected.includes(STUDENTS[index])));
  }
}

async function verifyAdmin(browser, width) {
  const data = fixture(false);
  const { context, page, state } = await newPage(browser, width, data);
  let checkGroups = 0;
  try {
    await page.locator('#student-email-auth').getByText('qa-parent@example.com', { exact: true }).waitFor({ state: 'attached' });
    assert.equal(await page.locator('#student-email-auth tbody tr').count(), STUDENTS.length, 'existing email authentication table is preserved');
    assert.equal(await page.locator('#student-email-auth').getByText('3개', { exact: true }).count(), 1, 'registered browser count is shown without a cap');
    assert.equal(await page.locator('#student-email-auth').getByText('0개', { exact: true }).count(), 1);
    assert.equal(await page.locator('#student-email-auth').getByText('등록 브라우저 수에는 제한이 없습니다.', { exact: false }).count(), 1);
    assert.equal(await page.locator('#student-email-auth .email-auth-badge.full').count(), 0);
    assert.equal(await page.locator('#student-email-auth [data-reset-devices]').count(), 1, 'existing device-reset control is preserved, never activated');
    assert.equal(await page.locator('#student-email-auth [data-reset-devices]').innerText(), '전체 로그아웃');
    assert.equal(state.mockedAuthReads, 1, 'authentication records are read through the existing endpoint');
    checkGroups++;
    await page.locator('button[data-tab="archive"]').click();
    assert.deepEqual(await page.locator('#final7-acc-matrix tbody tr > th').allTextContents(), LABELS);
    assert.deepEqual(await page.locator('#final7-acc-matrix tbody tr').evaluateAll(rows => rows.map(row => row.dataset.accessKey)), ROUND_KEYS);
    assert.equal(await page.locator('.additional-round-approvals').count(), 1);
    assert.equal(await page.locator('.additional-round-approvals').locator('..').locator('h3').innerText(), '추가 모의고사 회차 승인');
    assert.deepEqual(await page.locator('#signature-acc-matrix tbody tr > th').allTextContents(), ['시그니처 1회', '시그니처 2회']);
    assert.equal(await roundRow(page, 'mock-mid-8').count(), 0, 'Middle 8 is not added');
    assert.deepEqual(await approvals(page), INITIAL_PERMISSIONS, 'rendering grants no approvals');
    checkGroups++;

    const initial = await approvals(page);
    await page.locator('#acc-matrix tbody tr button').click();
    assert.deepEqual(await approvals(page), initial, 'folder-only approval cannot grant rounds');
    await page.evaluate(() => { S.archiveAccess['추가 모의고사'] = []; renderAccMatrix(); });
    const protectedState = await unrelated(page);
    const signatureHTML = await page.locator('#signature-acc-matrix').innerHTML();
    checkGroups++;

    // A missing library item must not prevent the existing approval matrix from working.
    await roundRow(page, MID7).locator('td').nth(2).click();
    await verifyOnlyKey(page, MID7, [STUDENTS[0]], initial, protectedState, signatureHTML);
    await page.evaluate(item => { S.books.push(item); renderBooks(); }, book(MID7));
    assert.equal(await (await bookCard(page, MID7)).locator('input[type=checkbox]').first().isChecked(), true);
    checkGroups++;

    for (const key of ROUND_KEYS) {
      await page.evaluate(key => { S.archiveProductAccess[key] = []; renderFinal7AccessMatrix(); renderBooks(); }, key);
      const before = await approvals(page);
      const check = async expected => { await verifyOnlyKey(page, key, expected, before, protectedState, signatureHTML); checkGroups++; };
      const cell = index => roundRow(page, key).locator('td').nth(index);
      await cell(2).click(); await check([STUDENTS[0]]);
      let card = await bookCard(page, key);
      assert.equal(await card.locator('input[type=checkbox]').first().isChecked(), true, 'matrix updates book');
      await card.locator('input[type=checkbox]').nth(1).check(); await check(STUDENTS);
      assert.equal(await cell(3).evaluate(el => el.classList.contains('on')), true, 'book updates matrix');
      card = await bookCard(page, key);
      await card.locator('input[type=checkbox]').first().uncheck(); await check([STUDENTS[1]]);
      await cell(3).click(); await check([]);
      await cell(0).click(); await check(['*']);
      card = await bookCard(page, key);
      assert.equal(await card.locator('input[type=checkbox]:disabled').count(), STUDENTS.length, 'public reflected in book');
      await cell(3).click(); await check([STUDENTS[1]]);
      await roundRow(page, key).getByRole('button', { name: '☑' }).click(); await check(STUDENTS);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '전체 공개', exact: true }).click(); await check(['*']);
      await cell(0).focus(); await cell(0).press('Enter'); await check([]);
      await cell(2).focus(); await cell(2).press('Space'); await check([STUDENTS[0]]);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '학생 모두 선택', exact: true }).click(); await check(STUDENTS);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '전체 공개', exact: true }).click(); await check(['*']);
      card = await bookCard(page, key);
      await card.getByRole('button', { name: '🔓 전체 공개 중', exact: true }).click(); await check([]);
    }

    // Missing approval information is private; merely rendering or opening a book cannot approve anyone.
    await page.evaluate(key => { delete S.archiveProductAccess[key]; renderFinal7AccessMatrix(); renderBooks(); }, MID7);
    const missing = await approvals(page);
    assert.ok(!Object.hasOwn(missing, MID7) || (Array.isArray(missing[MID7]) && missing[MID7].length === 0));
    assert.equal(await roundRow(page, MID7).locator('td.cell.on').count(), 0);
    const emptyCard = await bookCard(page, MID7);
    assert.equal(await emptyCard.locator('input[type=checkbox]:checked').count(), 0);
    checkGroups++;
    await roundRow(page, MID7).locator('td').nth(2).click();
    const savedBefore = await page.evaluate(() => JSON.parse(JSON.stringify(S)));
    await page.evaluate(async () => { await saveToGitHub(); });
    assert.equal(state.puts.length, 1, 'existing save uses exactly one locally captured PUT');
    const savedSource = Buffer.from(state.puts[0].content, 'base64').toString('utf8');
    const savedMatch = /window\.GFIELD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/.exec(savedSource);
    assert.ok(savedMatch, 'existing save serializes a JSON assignment');
    const saved = JSON.parse(savedMatch[1]);
    assert.deepEqual(saved.archiveProductAccess, savedBefore.archiveProductAccess, 'save keeps independent round keys');
    for (const field of ['students', 'reports', 'attendance', 'archiveAccess', 'vip', 'content']) {
      assert.deepEqual(saved[field], savedBefore[field], 'save preserves ' + field);
    }
    checkGroups++;

    const measured = await page.evaluate(() => {
      const table = document.getElementById('final7-acc-matrix');
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        scrollable: getComputedStyle(table.parentElement).overflowX === 'auto',
        cells: [...table.querySelectorAll('td.cell')].map(cell => ({ role: cell.getAttribute('role'),
          tabIndex: cell.tabIndex, label: cell.getAttribute('aria-label') })) };
    });
    assert.ok(measured.scrollWidth <= width + 1, 'admin page fits viewport');
    assert.equal(measured.scrollable, true, 'wide table has a local horizontal scroller');
    measured.cells.forEach(cell => { assert.equal(cell.role, 'button'); assert.equal(cell.tabIndex, 0); assert.ok(cell.label); });
    const additionalCard = page.locator('.additional-round-approvals').locator('..');
    await additionalCard.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.locator('.additional-round-approvals').evaluate(el => { el.scrollLeft = 0; });
    await additionalCard.screenshot({ path: path.join(ARTIFACTS, 'admin-additional-approvals-' + width + '.png') });
    await page.locator('.signature-round-approvals').evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.locator('.signature-round-approvals').screenshot({ path: path.join(ARTIFACTS, 'admin-signature-preserved-' + width + '.png') });
    assertSafe(state); checkGroups++;
    return { width, scenario: 'admin-additional-rounds', rows: 3, checkGroups,
      mockPuts: state.puts.length, actualExternalWrites: 0, errors: state.errors.length, measured };
  } finally { await context.close(); }
}

async function verifyStudent(browser, width, scenario) {
  const data = fixture();
  // Admin-matrix fixture grants Final 8 to student A; isolate Middle 7 scenarios from the now-connected Final 7/8 roadmap keys.
  data.archiveProductAccess['mock-final-7'] = [];
  data.archiveProductAccess['mock-final-8'] = [];
  const allowed = scenario === 'approved' || scenario === 'public';
  data.archiveProductAccess[MID7] = scenario === 'public' ? ['*'] : scenario === 'approved' ? [STUDENTS[0]] : [];
  if (scenario === 'missing-key') delete data.archiveProductAccess[MID7];
  if (scenario === 'folder-only' || scenario === 'missing-key') data.archiveAccess['추가 모의고사'] = ['*'];
  if (scenario === 'other-extra-only') data.archiveProductAccess['mock-final-5'] = [STUDENTS[0]];
  const originalApprovals = clone(data.archiveProductAccess);
  const { context, page, state } = await newPage(browser, width, data, 'student');
  try {
    await page.evaluate(() => { if (typeof skipIntro === 'function') skipIntro(); });
    await page.locator('#name-input').fill(STUDENTS[0]);
    await page.locator('button.enter').click();
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.locator('button.nav-btn[data-v="roadmap"]').click();
    const entries = await page.evaluate(() => D.content['extra-mocks'].textbooks.map(item => item.accessKey));
    assert.equal(entries.filter(key => key === 'mock-mid-7').length, 1, 'Middle 7 is connected once');
    assert.equal(entries.includes('mock-mid-8'), false, 'Middle 8 is not added to the extra node');
    assert.ok(entries.includes('mock-final-5'), 'existing extra Final 5 is preserved');
    const unlocked = allowed || scenario === 'other-extra-only';
    const node = page.locator('#timeline .special-branch .node').filter({ has: page.locator('h3').filter({ hasText: '[선택] 추가 모의고사' }) });
    assert.equal(await node.count(), 1);
    assert.equal(await node.evaluate(el => el.classList.contains('locked')), !unlocked, 'node follows product-round approvals');
    await node.click();
    if (unlocked) {
      await page.waitForSelector('#overlay:not(.hidden)');
      assert.equal(await page.locator('#modal-body .tb-btn[data-book-key="mock-mid-7"]').count(), allowed ? 1 : 0,
        'only approved Middle 7 appears inside the extra node');
      if (allowed) {
        await page.locator('#overlay').screenshot({ path: path.join(ARTIFACTS, 'student-middle7-' + scenario + '-' + width + '.png') });
        await page.locator('#modal-body .tb-btn[data-book-key="mock-mid-7"]').click();
        await page.locator('#bookviewer.open').waitFor();
        assert.equal(await page.locator('#bv-name').innerText(), book(MID7).title, 'extra-node button opens the same Middle 7 book');
        await page.locator('#bookviewer').screenshot({ path: path.join(ARTIFACTS, 'student-middle7-viewer-' + scenario + '-' + width + '.png') });
      }
    } else {
      assert.equal(await page.locator('#overlay:not(.hidden)').count(), 0, 'denied student cannot open the extra node');
      assert.equal(await page.locator('#modal-body .tb-btn[data-book-key="mock-mid-7"]').count(), 0);
    }
    if (!allowed) {
      await page.evaluate(() => openBook(D.books.find(item => item.accessKey === 'mock-mid-7')));
      assert.equal(await page.locator('#bookviewer.open').count(), 0, 'unapproved Middle 7 book stays closed');
    }
    assert.deepEqual(await page.evaluate(() => D.archiveProductAccess), originalApprovals, 'student rendering grants no approvals');
    assert.deepEqual(await page.evaluate(() => ({ students: D.students, reports: D.reports, attendance: D.attendance })),
      { students: data.students, reports: data.reports, attendance: data.attendance }, 'student data and scores unchanged');
    if (!allowed) await page.locator('#timeline').screenshot({ path: path.join(ARTIFACTS, 'student-middle7-' + scenario + '-' + width + '.png') });
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(pageWidth <= width + 1, 'student page fits viewport');
    assertSafe(state);
    return { width, scenario: 'student-' + scenario, visibleMiddle7: allowed, extraNodeUnlocked: unlocked,
      actualExternalWrites: 0, mockedTelemetry: state.mockedTelemetry, errors: state.errors.length };
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const server = BASE_URL ? null : http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/data.js') { response.setHeader('Content-Type', 'application/javascript; charset=utf-8'); return response.end(scriptFor(fixture())); }
    const file = path.resolve(ROOT, '.' + pathname);
    if (request.method !== 'GET' || !file.startsWith(ROOT + path.sep) || file.includes('.private') ||
      !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); return response.end(); }
    response.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  if (server) { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); BASE_URL = 'http://127.0.0.1:' + server.address().port; }
  const browser = await chromium.launch({ headless: true,
    ...(process.env.GFIELD_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.GFIELD_QA_BROWSER_EXECUTABLE } : {}) });
  try {
    const results = [];
    for (const width of [1280, 390]) {
      results.push(await verifyAdmin(browser, width));
      for (const scenario of ['approved', 'public', 'folder-only', 'no-approval', 'missing-key', 'other-extra-only']) {
        results.push(await verifyStudent(browser, width, scenario));
      }
    }
    const result = { pass: true, syntheticStudentsOnly: true, scenarios: results.length, actualExternalWrites: 0, results };
    fs.writeFileSync(path.join(ARTIFACTS, 'middle7-additional-approval-browser-result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally { await browser.close(); if (server) server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
