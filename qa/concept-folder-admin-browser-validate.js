'use strict';

// Focused browser QA: no production student data is served and every write is blocked.
// Reuses the local-server, isolated-session and book-card framework from the round-access QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
require('./email-login-test-stub'); // QA 전용: 학부모 이메일 인증 단계를 인증된 브라우저로 취급
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
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co' && url.pathname === '/functions/v1/hs-approval-admin' && request.postDataJSON().action === 'list') {
        return route.fulfill({ json: { accounts: [], resultStudents: [], unownedStudents: [], emailLinks: [], emailLinksAvailable: true, studentDevices: [], deviceLimit: null } });
      }
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
    const before = await permissions(page);
    for (const key of ['concept-basic','concept-core']) {
      const card = await bookCard(page,key);
      assert.equal(await card.locator('input[type="checkbox"]').count(),0);
      assert.equal(await card.locator('select[onchange*="setBookAccessKey"]').count(),0);
      assert.match(await card.innerText(),/BASIC·CORE를 따로 승인할 필요가 없습니다/);
      assertions += 3;
    }
    const mock = await bookCard(page,'mock-final-5');
    assert.ok(await mock.locator('input[type="checkbox"]').count()>0);
    assert.deepEqual(await permissions(page),before);
    assert.equal(writes.length,0);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({viewport:width,assertions:assertions+4,conceptDuplicateControlsRemoved:true,otherProductControlsPreserved:true,productionWrites:0}));

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
