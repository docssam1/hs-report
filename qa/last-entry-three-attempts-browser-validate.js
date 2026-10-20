'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
require('./email-login-test-stub');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const student = '최종재입력검수학생';
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const fixture = source + '\n;(()=>{const d=window.GFIELD_DATA,n=' + JSON.stringify(student) + ';' +
  'if(!d.students.includes(n))d.students.push(n);d.studentTypes[n]="resident";' +
  'd.attendance[n]=["oct-5","oct-12","oct-19","oct-26"];})();';

const server = http.createServer((request, response) => {
  const filename = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
    response.writeHead(404); response.end(); return;
  }
  response.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript' })[path.extname(filename)] || 'application/octet-stream');
  fs.createReadStream(filename).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const saved = new Map();
  const writes = [];
  await context.addInitScript(name => localStorage.setItem('gfield_student', name), student);
  await context.route(/^https?:\/\//, async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === base) {
      if (url.pathname === '/data.js') return route.fulfill({ contentType: 'application/javascript', body: fixture });
      return route.continue();
    }
    if (url.pathname === '/rest/v1/mock_results') {
      if (request.method() === 'GET') {
        const key = (url.searchParams.get('round') || '').replace(/^eq\./, '');
        return route.fulfill({ json: saved.has(key) ? [saved.get(key)] : [] });
      }
      const payload = request.postDataJSON();
      writes.push({ method: request.method(), round: payload.round });
      if (saved.has(payload.round)) return route.fulfill({ status: 409, json: { code: '23505' } });
      saved.set(payload.round, payload);
      return route.fulfill({ status: 201, json: [] });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  const page = await context.newPage();
  page.on('dialog', dialog => dialog.accept());
  try {
    for (let round = 1; round <= 4; round += 1) {
      const originalKey = 'last' + round;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        await page.goto(base + '/last1-entry.html?round=' + round + '&name=' + encodeURIComponent(student));
        await page.locator('#entry:not(.hide)').waitFor();
        assert.match(await page.locator('#pageTitle').innerText(), attempt === 1 ? /최초 성적 입력/ : new RegExp(attempt + '차 연습 입력'));
        await page.locator('#grid .q').nth(attempt - 1).click();
        await page.locator('#saveBtn').click();
        await page.locator('#blocked:not(.hide)').waitFor();
        const key = attempt === 1 ? originalKey : originalKey + '@' + attempt;
        assert.equal(saved.get(key).source, attempt === 1 ? 'parent' : 'practice');
        assert.equal(saved.get(originalKey).ox[0], 'X', '최초 점수는 이후 연습에서 바뀌지 않음');
        assert.match(await page.locator('#blocked .link').getAttribute('href'), new RegExp('attempt=' + attempt));
      }
      await page.goto(base + '/last1-entry.html?round=' + round + '&name=' + encodeURIComponent(student));
      await page.locator('#blocked:not(.hide)').waitFor();
      assert.match(await page.locator('#blocked').innerText(), /2·3차 연습까지 모두 기록/);
      assert.equal(await page.locator('#entry:not(.hide)').count(), 0);
    }
    assert.deepEqual(writes.map(row => row.round), [1, 2, 3, 4].flatMap(round => ['last' + round, 'last' + round + '@2', 'last' + round + '@3']));
    const teacherFirst = { ...saved.get('last4'), source: 'admin' };
    saved.set('last4', teacherFirst); saved.delete('last4@2'); saved.delete('last4@3');
    await page.goto(base + '/last1-entry.html?round=4&name=' + encodeURIComponent(student));
    await page.locator('#entry:not(.hide)').waitFor();
    assert.match(await page.locator('#pageTitle').innerText(), /2차 연습 입력/, '교사가 기록한 최초 성적 다음은 2차 연습');
    await page.locator('#grid .q').nth(1).click();
    await page.locator('#saveBtn').click();
    await page.locator('#blocked:not(.hide)').waitFor();
    assert.deepEqual(saved.get('last4'), teacherFirst, '교사 최초 기록은 학생 연습으로 바뀌지 않음');
    assert.equal(saved.get('last4@2').source, 'practice');
    console.log(JSON.stringify({ pass: true, rounds: 4, attemptsPerRound: 3, preservedOriginal: true, preservedTeacherFirst: true, productionWrites: 0 }));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
