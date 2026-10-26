'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const evidencePath = path.join(root, '.private-work/hw-expansion-20261023/applied1-9-current-grading-browser-r1.json');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const rounds = [];
  const externalWrites = [];
  try {
    for (let round = 1; round <= 9; round++) {
      const file = path.join(root, `bank/data/applied${round}-expanded.json`);
      const bytes = fs.readFileSync(file);
      const data = JSON.parse(bytes);
      const items = data.items.filter(item => item.sourceNo === 1).slice(0, 3);
      assert.equal(items.length, 3, `applied${round}: source 1 missing`);
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const originalGradeKey = `gfield_mock_hw:qa-student-${round}`;
      const originalGradeValue = JSON.stringify({ source: 'original-exam', score: 37, attempts: 1 });
      await context.addInitScript(({ student, key, value }) => {
        if (!localStorage.getItem('gfield_student')) localStorage.setItem('gfield_student', student);
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      }, { student: `qa-student-${round}`, key: originalGradeKey, value: originalGradeValue });
      const errors = [];
      await context.route(/^https?:\/\//, route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== base) {
          if (!['GET', 'HEAD'].includes(request.method())) externalWrites.push(`${round}: ${request.method()} ${url.pathname}`);
          return route.abort();
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(`${base}/bank/pool.html?bank=applied${round}&nos=1&count=3`);
        await page.waitForFunction(() => window.__POOL_QA__?.ready === true, null, { timeout: 30000 });
        assert.equal(await page.locator('.question').count(), 3);
        assert.equal(await page.locator('.solution').count(), 3);
        assert.equal(await page.locator('#answerInputs input').count(), items.reduce((sum, item) => sum + item.answerParts.length, 0));
        assert.equal(await page.locator('#originalExamLink').getAttribute('href'), `../mock.html?set=hw&round=${round}`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `applied${round}: mobile overflow`);
        await page.evaluate(current => {
          for (const item of current) item.answerParts.forEach((part, index) => {
            document.getElementById(`a-${item.id}-${index}`).value = String(part);
          });
        }, items);
        await page.click('#grade');
        assert.match(await page.locator('#diagnosis').textContent(), /3 \/ 3문항 정답/);
        assert.equal(await page.locator('#diagnosis [data-diagnosis]').count(), 3);
        assert.equal(await page.locator(`#diagnosis a[href*="bank=applied${round}"]`).count(), 3);
        assert.match(await page.locator('#diagnosis').textContent(), /권장 학습 위치/);
        assert.match(await page.locator('#diagnosis').textContent(), /학습 포인트/);
        const first = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
        const keys = Object.keys(first).filter(key => key.startsWith('gfield_practice_pool_v2:'));
        assert.equal(keys.length, 3);
        for (const key of keys) {
          const history = JSON.parse(first[key]);
          assert.equal(history.length, 1);
          assert.equal(history[0].correct, true);
        }
        await page.locator(`#a-${items[0].id}-0`).fill('__WRONG__');
        await page.click('#grade');
        assert.match(await page.locator('#diagnosis').textContent(), /2 \/ 3문항 정답/);
        await page.click('#grade');
        const last = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
        assert.deepEqual(Object.keys(last).sort(), Object.keys(first).sort());
        assert.equal(first[originalGradeKey], originalGradeValue);
        assert.equal(last[originalGradeKey], originalGradeValue);
        for (const key of keys) {
          const history = JSON.parse(last[key]);
          assert.equal(history.length, 3);
          assert.deepEqual(history[0], JSON.parse(first[key])[0]);
        }
        assert.equal(await page.locator('#answerInputs input').evaluateAll(inputs => inputs.every(input => input.disabled)), true);
        await page.click('#grade');
        assert.deepEqual(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))), last);
        await page.reload();
        await page.waitForFunction(() => window.__POOL_QA__?.ready === true, null, { timeout: 30000 });
        assert.equal(await page.locator('#answerInputs input').evaluateAll(inputs => inputs.every(input => input.disabled)), true);
        assert.deepEqual(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))), last);
        assert.deepEqual(errors, []);
        rounds.push({ round, dataSha256: crypto.createHash('sha256').update(bytes).digest('hex'), sourceNo: 1, checkedVariants: 3, answerInputs: items.reduce((sum, item) => sum + item.answerParts.length, 0), firstScorePreserved: true, attemptsCappedAtThree: true, originalGradeUnchanged: true, diagnosisLinks: 3, mobileOverflow: false, browserErrors: errors });
      } finally {
        await context.close();
      }
    }
    assert.deepEqual(externalWrites, []);
    fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
    fs.writeFileSync(evidencePath, JSON.stringify({ result: 'PASS', scope: 'current Applied 1–9 source 1, variants 1–3; isolated local browser; no ZIP or production grade write', rounds, externalWrites }, null, 2) + '\n');
    console.log('PASS Applied 1–9 current grading: 27 answers, diagnoses, 3 attempts, first result and original grade preserved, 375px, external writes 0');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
