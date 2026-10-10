'use strict';

// Synthetic students and remote files only. GitHub PUTs are captured and never sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');
const ROOT = path.resolve(__dirname, '..');
let BASE_URL = process.env.GFIELD_QA_BASE_URL || '';
const ARTIFACTS = process.env.GFIELD_QA_ARTIFACT_DIR || path.join(ROOT, '.private-work', 'docssam-columns-20261010');
const STUDENTS = ['칼럼검수A', '칼럼검수B'];
const clone = value => JSON.parse(JSON.stringify(value));
const backupContext = { window: {}, TextDecoder, TextEncoder,
  atob: value => Buffer.from(value, 'base64').toString('binary'), btoa: value => Buffer.from(value, 'binary').toString('base64') };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'docssam-columns.js'), 'utf8'), backupContext);
const backupData = { vip: { columns: [] } };
backupContext.window.GFIELD_DOCSSAM_COLUMNS.ensure(backupData);
const ORIGINALS = clone(backupData.vip.columns);
assert.equal(ORIGINALS.length, 5, 'backup contains exactly five original columns');
assert.equal(new Set(ORIGINALS.map(column => JSON.stringify(column))).size, 5, 'same-title original articles remain separate entries');
ORIGINALS.forEach(column => { assert.ok(column.title); assert.ok(String(column.html || column.body || '').trim()); });

function fixture(columns) {
  return {
    meta: { academy: '합성 검수', title: '칼럼 보존 검수', currentWeekId: '', year: '2026', examDate: '2026-11-01', lat: 37.5, lng: 127.0 },
    nodes: [], students: STUDENTS.slice(), studentTypes: {},
    attendance: Object.fromEntries(STUDENTS.map(student => [student, []])), specialStudents: [], content: {},
    reports: { [STUDENTS[0]]: [{ title: '합성 성적', score: '77', total: '100', comment: '검수 전용', files: [] }] },
    pins: {}, archiveFolders: ['추가 모의고사'], archiveAccess: { '추가 모의고사': [STUDENTS[1]] },
    archiveProductAccess: { 'mock-signature-1': [STUDENTS[0]], 'mock-signature-2': [], 'mock-final-7': [STUDENTS[1]], 'mock-final-8': [] },
    vipAccess: { report: STUDENTS.slice(), col: STUDENTS.slice(), ses: [], cou: [], clinic: [], mag: [] },
    vip: { columns: clone(columns), sessions: [], courses: [], clinic: { notice: '', url: '' }, magazine: [] },
    books: [], info: [], examSets: [],
  };
}

function scriptFor(data) { return 'window.GFIELD_DATA = ' + JSON.stringify(data) + ';\n'; }
function remoteFile(data, sha = 'qa-remote-sha') {
  return { encoding: 'base64', sha, content: Buffer.from(scriptFor(data), 'utf8').toString('base64') };
}
function omitColumns(data) {
  const copy = clone(data);
  if (copy.vip) delete copy.vip.columns;
  return copy;
}
function decodeSaved(put) {
  const source = Buffer.from(put.content, 'base64').toString('utf8');
  const match = /window\.GFIELD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/.exec(source);
  assert.ok(match, 'mock PUT contains a complete JSON data.js assignment');
  return JSON.parse(match[1]);
}

async function newPage(browser, width, data, role = 'admin') {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const state = { errors: [], blockedWrites: [], mockTelemetry: 0, puts: [], gets: 0,
    remote: remoteFile(data), readMode: 'success', putMode: 'success', releasePut: null, signalPut: null };
  await context.addInitScript(({ role, students }) => {
    const session = { access_token: 'qa-access', refresh_token: 'qa-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600 };
    localStorage.setItem('gfield_hs_' + role + '_session_v1', JSON.stringify(session));
    if (role === 'admin') localStorage.setItem('gfield_gh_token', 'qa-captured-token');
  }, { role, students: STUDENTS });
  await context.route(/^https?:\/\//, route => {
    const request = route.request(), url = new URL(request.url());
    const isGitHubFile = url.hostname === 'api.github.com' && url.pathname === '/repos/docssam1/hs-report/contents/data.js';
    if (isGitHubFile && request.method() === 'GET') {
      state.gets++;
      if (state.readMode === 'network-failure') return route.abort('failed');
      if (state.readMode === 'http-failure') return route.fulfill({ status: 503, json: { message: 'QA remote read failure' } });
      return route.fulfill({ json: state.remote });
    }
    if (isGitHubFile && request.method() === 'PUT') {
      state.puts.push(request.postDataJSON());
      const response = { json: { content: { sha: 'qa-saved-sha-' + state.puts.length }, commit: { sha: 'qa-captured-commit' } } };
      if (state.putMode === 'http-failure') return route.fulfill({ status: 500, json: { message: 'QA PUT failure' } });
      if (state.putMode === 'deferred') return new Promise(resolve => {
        state.releasePut = async () => { await route.fulfill(response); resolve(); };
        if (state.signalPut) state.signalPut();
      });
      return route.fulfill(response);
    }
    if (!['GET', 'HEAD'].includes(request.method())) {
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co' && url.pathname === '/rest/v1/access_log') {
        state.mockTelemetry++;
        return route.fulfill({ status: 204, body: '' });
      }
      state.blockedWrites.push(request.method() + ' ' + url.pathname);
      return route.abort();
    }
    if (url.origin === new URL(BASE_URL).origin) {
      if (url.pathname === '/data.js') return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: scriptFor(data) });
      if (/\/(?:mock-data(?:-hw|-final|-original)?|last-score-data)\.js$/.test(url.pathname)) {
        return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body:
          'window.GFIELD_MOCK={rounds:{}};window.GFIELD_MOCK_HW={rounds:{}};window.GFIELD_MOCK_FINAL={rounds:{}};' +
          'window.GFIELD_MOCK_ORIGINAL={rounds:{}};window.GFIELD_LAST_SCORE_DATA={rounds:{}};' });
      }
      if (/\.(?:mp4|webm)$/.test(url.pathname)) return route.fulfill({ status: 404, body: '' });
      return route.continue();
    }
    if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co') {
      const body = url.pathname === '/auth/v1/user' ? { id: 'qa-' + role, app_metadata: role === 'admin' ?
        { role: 'admin', admin_id: 'DOCSSAM' } : { role: 'student', student: STUDENTS[0] } } :
        url.pathname === '/rest/v1/hs_accounts' ? [{ role, active: true, student: role === 'student' ? STUDENTS[0] : null }] : [];
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

async function verifyStudent(browser, width, empty) {
  const data = fixture(empty ? [] : ORIGINALS);
  const { context, page, state } = await newPage(browser, width, data, 'student');
  try {
    await page.evaluate(() => { if (typeof skipIntro === 'function') skipIntro(); });
    await page.locator('#name-input').fill(STUDENTS[0]);
    await page.locator('button.enter').click();
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.locator('button.nav-btn[data-v="vip"]').click();
    const menu = page.locator('.vip-mbtn[data-k="col"]');
    assert.match(await menu.innerText(), /5편/);
    await menu.click();
    assert.deepEqual(await page.locator('.col-card .cc-t').allTextContents(), ORIGINALS.map(column => column.title));
    assert.deepEqual(await page.evaluate(() => D.vip.columns), ORIGINALS, 'original or backup columns are exact');
    assert.deepEqual(await page.evaluate(() => ({ students: D.students, reports: D.reports, archiveProductAccess: D.archiveProductAccess })),
      { students: data.students, reports: data.reports, archiveProductAccess: data.archiveProductAccess }, 'student scores and approvals are preserved');
    const listMeasured = await page.locator('#vip-list').evaluate(el => ({ clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
    assert.ok(listMeasured.scrollWidth <= listMeasured.clientWidth + 1, 'column list does not overflow');
    await page.locator('#view-vip').screenshot({ path: path.join(ARTIFACTS, 'student-columns-' + (empty ? 'backup-' : '') + width + '.png') });
    const bodies = [];
    for (let index = 0; index < ORIGINALS.length; index++) {
      await page.locator('.col-card[data-col="' + index + '"]').click();
      await page.locator('#reader.open').waitFor();
      assert.equal(await page.locator('#rd-name').innerText(), ORIGINALS[index].title);
      const content = await page.evaluate(column => {
        const expected = document.createElement('div'); expected.innerHTML = column.html || column.body || '';
        const normalize = text => String(text).replace(/\s+/g, ' ').trim();
        const body = document.getElementById('rd-body');
        return { actual: normalize(body.textContent), expected: normalize(expected.textContent),
          clientWidth: body.clientWidth, scrollWidth: body.scrollWidth,
          clientHeight: body.clientHeight, scrollHeight: body.scrollHeight, overflowY: getComputedStyle(body).overflowY };
      }, ORIGINALS[index]);
      assert.equal(content.actual, content.expected, 'column ' + (index + 1) + ' full body is rendered');
      assert.ok(content.actual.length > 50, 'body is not an empty placeholder');
      assert.ok(content.scrollWidth <= content.clientWidth + 1, 'reader body fits viewport');
      bodies.push({ title: ORIGINALS[index].title, characters: content.actual.length, clientWidth: content.clientWidth, scrollWidth: content.scrollWidth });
      if (!empty) await page.locator('#reader').screenshot({ path: path.join(ARTIFACTS, 'student-column-' + (index + 1) + '-' + width + '.png') });
      if (content.scrollHeight > content.clientHeight + 1) {
        assert.ok(['auto', 'scroll'].includes(content.overflowY), 'long article supports scrolling');
        const reachedEnd = await page.locator('#rd-body').evaluate(el => {
          el.scrollTop = el.scrollHeight;
          return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        });
        assert.equal(reachedEnd, true, 'last paragraph is reachable');
        if (!empty) await page.locator('#reader').screenshot({ path: path.join(ARTIFACTS, 'student-column-' + (index + 1) + '-end-' + width + '.png') });
      }
      await page.locator('.rd-back').click();
      assert.equal(await page.locator('#reader').evaluate(el => el.classList.contains('open')), false);
    }
    assertSafe(state);
    return { width, scenario: empty ? 'student-empty-list-backup' : 'student-original-five', columns: bodies.length, bodies,
      mockedTelemetry: state.mockTelemetry, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function currentState(page) { return page.evaluate(() => JSON.parse(JSON.stringify(S))); }
async function save(page) { await page.evaluate(async () => { await saveToGitHub(); }); }

async function verifyUntouchedColumnsSave(browser, width) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    const before = await currentState(page);
    const remote = fixture(ORIGINALS);
    const extra = { title: '합성 최신 원격 칼럼', category: '검수', date: '2026-10-10', html: '<p>원격에서 새로 추가한 합성 칼럼입니다.</p>' };
    remote.vip.columns.push(extra);
    remote.reports[STUDENTS[0]][0].score = '91';
    state.remote = remoteFile(remote);
    await save(page);
    assert.equal(state.gets, 1); assert.equal(state.puts.length, 1, 'one successful mock PUT');
    assert.equal(state.puts[0].sha, 'qa-remote-sha'); assert.equal(state.puts[0].branch, 'main');
    const sent = decodeSaved(state.puts[0]);
    assert.deepEqual(sent.vip.columns, remote.vip.columns, 'unedited local columns retain the newest remote column');
    assert.deepEqual(omitColumns(sent), omitColumns(before), 'only columns change; local student scores and approvals are preserved');
    assert.deepEqual((await currentState(page)).vip.columns, remote.vip.columns);
    assert.match(await page.locator('#save-status').innerText(), /저장 완료/);

    // A second save proves that the successful save advanced the local edit baseline.
    state.remote = remoteFile(sent, 'qa-saved-sha-1');
    await page.evaluate(() => { S.vip.columns[0].title += ' · 합성 로컬 수정'; renderMag(); });
    const edited = await currentState(page);
    await save(page);
    assert.equal(state.puts.length, 2, 'updated baseline permits the next local column edit');
    assert.equal(state.puts[1].sha, 'qa-saved-sha-1');
    assert.deepEqual(decodeSaved(state.puts[1]).vip.columns, edited.vip.columns);
    assert.deepEqual(omitColumns(decodeSaved(state.puts[1])), omitColumns(edited));
    assertSafe(state);
    return { width, scenario: 'remote-column-preserved-and-baseline-advanced', mockPuts: state.puts.length, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function verifyBlockedSave(browser, width, scenario) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    const remote = fixture(ORIGINALS);
    if (scenario === 'concurrent-column-edits') {
      remote.vip.columns[0].title += ' · 합성 원격 수정';
      state.remote = remoteFile(remote);
      await page.evaluate(() => { S.vip.columns[0].title += ' · 합성 로컬 수정'; });
    } else if (scenario === 'remote-http-failure') state.readMode = 'http-failure';
    else if (scenario === 'remote-network-failure') state.readMode = 'network-failure';
    else if (scenario === 'remote-parse-failure') {
      state.remote = { sha: 'qa-malformed-sha', encoding: 'base64', content: Buffer.from(
        'window.GFIELD_DATA = {"vip":{"columns":[]}}; globalThis.__QA_REMOTE_CODE_EXECUTED = true;', 'utf8').toString('base64') };
    } else if (scenario === 'local-empty-columns') await page.evaluate(() => { S.vip.columns = []; });
    const before = await currentState(page);
    await save(page);
    assert.equal(state.gets, 1, scenario + ' attempted one remote read');
    assert.equal(state.puts.length, 0, scenario + ' never sends PUT');
    assert.deepEqual(await currentState(page), before, scenario + ' does not mutate local scores, approvals or columns');
    assert.equal(await page.evaluate(() => typeof globalThis.__QA_REMOTE_CODE_EXECUTED), 'undefined', 'remote source is never evaluated');
    const status = await page.locator('#save-status').innerText();
    assert.match(status, /실패|오류|중단|차단/, scenario + ' reports why saving stopped');
    assertSafe(state);
    return { width, scenario, mockPuts: 0, status, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function verifyEmptyRemoteRecovery(browser, width) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    const before = await currentState(page);
    state.remote = remoteFile(fixture([]));
    await save(page);
    assert.equal(state.puts.length, 1, 'empty remote columns are recovered through one synthetic PUT');
    const sent = decodeSaved(state.puts[0]);
    assert.deepEqual(sent.vip.columns, ORIGINALS, 'empty remote columns recover all five original entries');
    assert.deepEqual(omitColumns(sent), omitColumns(before));
    assert.deepEqual(await currentState(page), before, 'recovery does not change local scores or approvals');
    assertSafe(state);
    return { width, scenario: 'empty-remote-original-recovery', recoveredColumns: 5, mockPuts: 1, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function verifyFailedPutRetry(browser, width) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    await page.locator('button[data-tab="vip"]').click();
    const before = await currentState(page);
    const baseline = await page.evaluate(() => JSON.parse(JSON.stringify(columnSaveBaseline)));
    const remote = fixture(ORIGINALS);
    remote.vip.columns.push({ title: '합성 원격 추가글', html: '<p>실패 후 재시도로 보존할 합성 원격 추가글입니다.</p>' });
    state.remote = remoteFile(remote);
    state.putMode = 'http-failure';
    await save(page);
    assert.equal(state.puts.length, 1, 'failed mock PUT is captured');
    assert.deepEqual(await currentState(page), before, 'failed PUT does not merge remote columns into local state');
    assert.deepEqual(await page.evaluate(() => columnSaveBaseline), baseline, 'failed PUT keeps the original baseline');
    assert.equal(await page.locator('#col-items > .content-week').count(), 5, 'failed PUT keeps the original five-column editor');
    assert.match(await page.locator('#save-status').innerText(), /실패/);
    state.putMode = 'success';
    await save(page);
    assert.equal(state.puts.length, 2, 'retry succeeds after the failed PUT');
    assert.deepEqual((await currentState(page)).vip.columns, remote.vip.columns);
    assert.deepEqual(await page.evaluate(() => columnSaveBaseline), remote.vip.columns);
    assert.equal(await page.locator('#col-items > .content-week').count(), 6);
    assert.deepEqual(omitColumns(await currentState(page)), omitColumns(before));
    assertSafe(state);
    return { width, scenario: 'failed-put-preserves-state-and-retry', mockPuts: 2, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function beginDeferredSave(page, state) {
  const captured = new Promise(resolve => { state.signalPut = resolve; });
  state.putMode = 'deferred';
  await page.evaluate(() => { window.__QA_PENDING_SAVE = saveToGitHub(); });
  let timer;
  try {
    await Promise.race([captured, new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('deferred mock PUT did not arrive')), 10000);
    })]);
  } finally { clearTimeout(timer); }
}

async function verifyPendingColumnEdit(browser, width, remoteAdded) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    const before = await currentState(page);
    const remote = fixture(ORIGINALS);
    if (remoteAdded) remote.vip.columns.push({ title: '합성 대기중 원격 추가글', html: '<p>로컬 편집과 동시에 들어온 합성 원격 새 칼럼입니다.</p>' });
    state.remote = remoteFile(remote);
    await beginDeferredSave(page, state);
    assert.equal(state.puts.length, 1);
    await save(page);
    assert.equal(state.puts.length, 1, 'duplicate save is blocked while the first PUT is pending');
    assert.equal(state.gets, 1, 'duplicate save does not read remote data again');
    const sent = decodeSaved(state.puts[0]);
    assert.deepEqual(sent.vip.columns, remote.vip.columns, 'captured payload is a snapshot of the reconciled columns');
    await page.evaluate(() => { S.vip.columns[0].title += ' · PUT 대기중 합성 수정'; renderMag(); dirty(); });
    const edited = await currentState(page);
    await state.releasePut();
    await page.evaluate(async () => { await window.__QA_PENDING_SAVE; });
    assert.deepEqual((await currentState(page)).vip.columns, edited.vip.columns, 'late local column edits survive PUT completion');
    assert.deepEqual(await page.evaluate(() => columnSaveBaseline), sent.vip.columns, 'baseline is the exact columns that were actually sent');
    assert.deepEqual(omitColumns(await currentState(page)), omitColumns(before));
    state.remote = remoteFile(sent, 'qa-saved-sha-1');
    state.putMode = 'success';
    await save(page);
    if (remoteAdded) {
      assert.equal(state.puts.length, 1, 'remote additions plus late local edits cause an explicit conflict before a second PUT');
      assert.deepEqual((await currentState(page)).vip.columns, edited.vip.columns);
      assert.equal(await page.evaluate(() => columnSaveConflict), true);
      assert.match(await page.locator('#toast').innerText(), /함께 변경|복사|새로고침/);
    } else {
      assert.equal(state.puts.length, 2, 'late local edits are saved on the next attempt');
      assert.deepEqual(decodeSaved(state.puts[1]).vip.columns, edited.vip.columns);
      assert.deepEqual(await page.evaluate(() => columnSaveBaseline), edited.vip.columns);
    }
    assertSafe(state);
    return { width, scenario: remoteAdded ? 'remote-addition-and-pending-edit-conflict' : 'pending-column-edit-preserved-and-saved',
      mockPuts: state.puts.length, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

async function verifyLastColumnDeletion(browser, width) {
  const { context, page, state } = await newPage(browser, width, fixture(ORIGINALS));
  try {
    await page.locator('button[data-tab="vip"]').click();
    const before = await currentState(page);
    for (let index = 0; index < 4; index++) await page.evaluate(() => delCol(0));
    assert.equal((await currentState(page)).vip.columns.length, 1);
    const remaining = clone((await currentState(page)).vip.columns);
    await page.evaluate(() => delCol(0));
    assert.deepEqual((await currentState(page)).vip.columns, remaining, 'last column cannot be deleted');
    assert.deepEqual(omitColumns(await currentState(page)), omitColumns(before), 'column deletion does not change other fields');
    assert.equal(state.puts.length, 0);
    assertSafe(state);
    return { width, scenario: 'last-column-deletion-protected', remainingColumns: 1, mockPuts: 0, actualExternalWrites: 0 };
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const server = BASE_URL ? null : http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/data.js' && request.method === 'GET') {
      response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return response.end(scriptFor(fixture(ORIGINALS)));
    }
    const file = path.resolve(ROOT, '.' + pathname);
    if (request.method !== 'GET' || !file.startsWith(ROOT + path.sep) || file.includes('.private') ||
        !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); return response.end(); }
    response.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
      '.jpg': 'image/jpeg', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  if (server) { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); BASE_URL = 'http://127.0.0.1:' + server.address().port; }
  const browser = await chromium.launch({ headless: true,
    ...(process.env.GFIELD_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.GFIELD_QA_BROWSER_EXECUTABLE } : {}) });
  try {
    const results = [];
    for (const width of [1280, 390]) {
      results.push(await verifyStudent(browser, width, false));
      results.push(await verifyStudent(browser, width, true));
      results.push(await verifyUntouchedColumnsSave(browser, width));
      for (const scenario of ['concurrent-column-edits', 'remote-http-failure', 'remote-network-failure', 'remote-parse-failure', 'local-empty-columns']) {
        results.push(await verifyBlockedSave(browser, width, scenario));
      }
      results.push(await verifyEmptyRemoteRecovery(browser, width));
      results.push(await verifyFailedPutRetry(browser, width));
      results.push(await verifyPendingColumnEdit(browser, width, false));
      results.push(await verifyPendingColumnEdit(browser, width, true));
      results.push(await verifyLastColumnDeletion(browser, width));
    }
    const result = { pass: true, syntheticStudentsOnly: true, originalColumns: ORIGINALS.length,
      scenarios: results.length, actualExternalWrites: 0, results };
    fs.writeFileSync(path.join(ARTIFACTS, 'docssam-columns-browser-result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally { await browser.close(); if (server) server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
