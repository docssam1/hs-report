'use strict';
// Browser-only admin QA. Every non-loopback request is intercepted below.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const students = ['QA칠회학생', 'QA팔회학생'];
const exams = ['last1', 'last2', 'last3', 'last4', 'final8'];
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const fixture = source + `\n;(() => {
  const d = window.GFIELD_DATA;
  d.students = ${JSON.stringify(students)};
  d.archiveProductAccess['mock-final-7'] = [${JSON.stringify(students[0])}];
  d.archiveProductAccess['mock-final-8'] = [${JSON.stringify(students[1])}];
})();`;
const score = ox => Math.round([...ox].reduce((sum, mark, i) =>
  sum + (mark === 'O' ? (i < 12 ? 2.7 : i < 22 ? 3.4 : 4.2) : 0), 0) * 10) / 10;
const rows = [{ student: students[0], exam: 'last2', round: 'last2', ox: 'O'.repeat(30), score: 100, wrong: 0, source: 'online' }];
const calls = [];
const unexpectedWrites = [];
let failGet = false;

const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.writeHead(405); return response.end(); }
  const url = new URL(request.url, 'http://127.0.0.1');
  let name;
  try { name = decodeURIComponent(url.pathname); } catch { response.writeHead(400); return response.end(); }
  const file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404); return response.end();
  }
  const type = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.woff': 'font/woff', '.woff2': 'font/woff2' }[path.extname(file)] || 'application/octet-stream';
  response.setHeader('Content-Type', type);
  if (name === '/data.js') return response.end(fixture);
  fs.createReadStream(file).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('gfield_hs_admin_session_v1', JSON.stringify({
      access_token: 'qa-admin', refresh_token: 'qa-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600,
    })));
    await context.route(/^https?:\/\//, async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
          url.pathname !== '/functions/v1/hs-admin-mock-result') {
        unexpectedWrites.push(`${request.method()} ${url.host}${url.pathname}`);
      }
      if (url.hostname !== 'fgahqumaldheqettmvqg.supabase.co') {
        if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        return route.abort();
      }
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: { id: 'qa-admin', app_metadata: { role: 'admin' } } });
      if (url.pathname === '/functions/v1/hs-admin-mock-result') {
        const body = request.postDataJSON();
        calls.push(structuredClone(body));
        assert.deepEqual(body.exams || exams, exams, 'get requests only the five reviewed exam keys');
        if (body.action === 'get') {
          if (failGet) return route.fulfill({ status: 503, json: { error: 'QA_GET_UNAVAILABLE' } });
          return route.fulfill({ json: { rows: rows.filter(row => row.student === body.student && body.exams.includes(row.exam)) } });
        }
        if (body.action === 'save-first') {
          assert.ok(exams.includes(body.exam));
          assert.match(body.ox, /^[OX]{30}$/);
          if (rows.some(row => row.student === body.student && row.exam === body.exam)) {
            return route.fulfill({ status: 409, json: { error: 'FIRST_RESULT_EXISTS' } });
          }
          const saved = { student: body.student, exam: body.exam, round: body.exam, ox: body.ox,
            score: score(body.ox), wrong: [...body.ox].filter(mark => mark === 'X').length, source: 'admin' };
          rows.push(saved);
          return route.fulfill({ json: { ...saved, saved: true } });
        }
        unexpectedWrites.push(`unknown result action ${body.action}`);
        return route.fulfill({ status: 400, json: { error: 'QA_UNEXPECTED_ACTION' } });
      }
      if (url.pathname === '/rest/v1/mock_results') return route.fulfill({ json: rows });
      if (url.pathname === '/rest/v1/weak_types') return route.fulfill({ json: [] });
      if (url.pathname.startsWith('/functions/v1/')) return route.fulfill({ json: { canEdit: false, snapshot: null } });
      return route.fulfill({ json: [] });
    });

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/admin.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#app:not(.hidden)').waitFor();
    await page.locator('[data-tab="mock"]').click();
    await page.locator('#admin-last-grid button').first().waitFor();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('저장된 최초 성적이 없습니다'));
    assert.deepEqual(await page.locator('#admin-last-round option').evaluateAll(options => options.map(option => option.value)), exams);
    assert.equal(await page.locator('#admin-last-grid button').count(), 30);
    assert.equal(await page.locator('#admin-last-save').isEnabled(), true);
    assert.equal(await page.locator('#admin-last-summary').innerText(), '점수 0.0점 · 정답 0/30 · 오답 30/30');

    for (const no of [1, 13, 23]) await page.locator(`#admin-last-grid button[data-no="${no}"]`).click();
    assert.equal(await page.locator('#admin-last-summary').innerText(), '점수 10.3점 · 정답 3/30 · 오답 27/30');
    assert.equal(await page.locator('#admin-last-grid button[data-no="23"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#admin-last-correct-nos').fill('2, 12, 13, 22, 23, 30');
    await page.locator('#admin-last-apply').click();
    assert.equal(await page.locator('#admin-last-summary').innerText(), '점수 20.6점 · 정답 6/30 · 오답 24/30');
    await page.locator('#admin-last-correct-nos').fill('0, 31');
    await page.locator('#admin-last-apply').click();
    assert.match(await page.locator('#admin-last-status').innerText(), /1~30/);
    assert.equal(await page.locator('#admin-last-summary').innerText(), '점수 20.6점 · 정답 6/30 · 오답 24/30');

    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#admin-last-save').click();
    assert.equal(calls.filter(call => call.action === 'save-first').length, 0, 'cancelled confirmation does not save');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#admin-last-save').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.dataset.state === 'saved');
    const first = calls.find(call => call.action === 'save-first');
    assert.deepEqual(first, { action: 'save-first', student: students[0], exam: 'last1',
      ox: Array.from({ length: 30 }, (_, index) => [2, 12, 13, 22, 23, 30].includes(index + 1) ? 'O' : 'X').join('') });
    assert.equal(await page.locator('#admin-last-save').isDisabled(), true, 'first attempt is locked after save');
    await page.locator('#admin-last-reload').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('이미 저장'));
    assert.equal(await page.locator('#admin-last-grid button[data-no="2"]').isDisabled(), true);

    for (const exam of ['last2', 'last3', 'last4']) {
      await page.locator('#admin-last-round').selectOption(exam);
      await page.waitForFunction(value => document.querySelector('#admin-last-round')?.value === value &&
        /이미 저장|저장된 최초 성적이 없습니다/.test(document.querySelector('#admin-last-status')?.textContent || ''), exam);
      assert.equal(await page.locator('#admin-last-grid button').count(), 30);
      assert.equal(await page.locator('#admin-last-save').isDisabled(), exam === 'last2');
    }
    await page.locator('#admin-last-round').selectOption('final8');
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('저장된 최초 성적이 없습니다'));
    await page.locator('#admin-last-correct-nos').fill('1, 13, 23');
    await page.locator('#admin-last-apply').click();
    page.once('dialog', dialog => { assert.match(dialog.message(), /8회 정답·진단 자료의 공개 검수는 별도/); dialog.accept(); });
    await page.locator('#admin-last-save').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.dataset.state === 'saved');
    assert.equal(calls.filter(call => call.action === 'save-first').at(-1).exam, 'final8');
    assert.deepEqual(rows.filter(row => row.student === students[0]).map(row => row.exam), ['last2', 'last1', 'final8']);
    assert.equal(rows.some(row => row.exam === 'last3'), false, 'Final 8 never aliases Last 3');

    await page.locator('#admin-last-round').selectOption('last4');
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('저장된 최초 성적이 없습니다'));
    failGet = true;
    await page.locator('#admin-last-reload').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.dataset.state === 'error');
    assert.equal(await page.locator('#admin-last-save').isDisabled(), true, 'failed first-record check blocks saving');
    failGet = false;
    await page.locator('#admin-last-reload').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('저장된 최초 성적이 없습니다'));

    await page.locator('[data-tab="archive"]').click();
    const matrix = page.locator('#final7-acc-matrix');
    assert.equal(await matrix.locator('tbody tr').count(), 2);
    assert.match(await matrix.locator('tbody tr').nth(1).innerText(), /학생용 자료 보류/);
    const approval = (round, name) => matrix.getByRole('button', { name: `최종 ${round}회 ${name} 승인`, exact: true });
    const revocation = (round, name) => matrix.getByRole('button', { name: `최종 ${round}회 ${name} 승인 해제`, exact: true });
    assert.equal(await revocation(7, students[0]).count(), 1);
    assert.equal(await approval(7, students[1]).count(), 1);
    assert.equal(await approval(8, students[0]).count(), 1);
    assert.equal(await revocation(8, students[1]).count(), 1);
    await approval(8, students[0]).click();
    assert.equal(await revocation(8, students[0]).count(), 1);
    assert.equal(await revocation(7, students[0]).count(), 1, 'Final 8 approval does not alter Final 7');
    await approval(7, students[1]).click();
    assert.equal(await revocation(7, students[1]).count(), 1);
    assert.equal(await revocation(8, students[1]).count(), 1, 'Final 7 approval does not alter Final 8');
    const access = await page.evaluate(() => ({
      final7: [...S.archiveProductAccess['mock-final-7']].sort(), final8: [...S.archiveProductAccess['mock-final-8']].sort(),
    }));
    assert.deepEqual(access, { final7: [...students].sort(), final8: [...students].sort() });
    await matrix.getByRole('button', { name: '최종 8회 전체공개 설정' }).click();
    assert.deepEqual(await page.evaluate(() => ({
      final7: [...S.archiveProductAccess['mock-final-7']].sort(), final8: [...S.archiveProductAccess['mock-final-8']],
    })), { final7: [...students].sort(), final8: ['*'] }, 'Final 8 open state does not change Final 7');
    assert.match(await page.locator('#save-status').innerText(), /저장되지 않은 변경/);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'approval matrix scrolls inside the 390px viewport');
    await page.locator('[data-tab="mock"]').click();
    await page.waitForFunction(() => document.querySelector('#admin-last-status')?.textContent.includes('저장된 최초 성적이 없습니다'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'O/X controls fit the 390px viewport');
    assert.equal(await page.locator('#admin-last-grid').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length), 5);
    assert.deepEqual(errors, [], 'admin page has no JavaScript errors');
    assert.deepEqual(unexpectedWrites, [], 'no unexpected external write was attempted');
    assert.equal(calls.filter(call => call.action === 'save-first').length, 2, 'only two mocked first-result writes');
    console.log('PASS admin Last 1-4/Final 8 O/X browser QA: 30 marks, score bands, first-result lock, failure lock, 390px, independent 7/8 approvals; real writes 0');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
