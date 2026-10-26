'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.private-work/hw-expansion-20261023/hw4/q01-output-qa-r2');
fs.mkdirSync(work, { recursive: true });
const rawPath = path.join(root, 'bank/data/applied4-expanded.json');
const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
assert.equal(data.version, '20261025-applied4-expansion-q01-q04-r3');
const items = data.items.filter(x => x.sourceNo === 1);
assert.equal(items.length, 9);
const storageVersion = x => x.sourceNo === 1 ? '20261025-applied4-expansion-q01-r2'
  : x.sourceNo === 4 ? '20261025-applied4-expansion-q01-q04-r3' : '20261024-applied4-expansion-r1';
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json',
    '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const errors = [], writes = [];
  await context.route(/^https?:\/\//, route => {
    const req = route.request();
    if (new URL(req.url()).origin !== base) {
      if (!['GET', 'HEAD'].includes(req.method())) writes.push(req.method());
      return route.abort();
    }
    return route.continue();
  });
  const priorKeys = data.items.filter(x => x.sourceNo !== 1).map(x => ({
    key: 'gfield_practice_pool_v2:local-tester:' + encodeURIComponent(storageVersion(x)) + ':' + x.id,
    value: JSON.stringify([{ correct: false, values: ['preserve'] }])
  }));
  await context.addInitScript(({ priorKeys }) => {
    localStorage.setItem('gfield_mock_hw_hw:local-tester', JSON.stringify({ '4': [{ score: 81 }] }));
    priorKeys.forEach(x => localStorage.setItem(x.key, x.value));
  }, { priorKeys });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(base + '/bank/pool.html?bank=applied4&nos=1&count=9');
  await page.waitForFunction(() => window.__POOL_QA__ && window.__POOL_QA__.ready === true, null, { timeout: 30000 });
  assert.equal(await page.locator('.question').count(), 9);
  assert.equal(await page.locator('.solution').count(), 9);
  assert.equal(await page.locator('.q-figure img').count(), 9);
  const images = await page.locator('.q-figure img').evaluateAll(xs => xs.map(x => [x.complete, x.naturalWidth, x.naturalHeight]));
  images.forEach(x => assert.ok(x[0] && x[1] > 0 && x[2] > 0));
  const pageLayout = await page.locator('.questions-page .page-body').evaluateAll(xs => xs.map(x => ({
    columns: getComputedStyle(x).gridTemplateColumns.split(' ').length, children: x.children.length
  })));
  assert.ok(pageLayout.length > 0 && pageLayout.every(x => x.columns === 2));
  const overflow = await page.locator('.question,.answers-page .page-body').evaluateAll(xs => xs
    .filter(x => x.scrollHeight > x.clientHeight + 1 || x.scrollWidth > x.clientWidth + 1)
    .map(x => x.dataset.itemId || 'answer-page'));
  assert.deepEqual(overflow, []);
  await page.screenshot({ path: path.join(work, 'pool-1440.png'), fullPage: true });

  const sourceScore = await page.evaluate(() => localStorage.getItem('gfield_mock_hw_hw:local-tester'));
  const before = await page.evaluate(keys => keys.map(k => [k, localStorage.getItem(k)]), priorKeys.map(x => x.key));
  const target = items[0];
  assert.equal(await page.evaluate(x => window.__POOL_QA__.checkAnswer(x, x.answerParts.map(String)), target), true);
  assert.equal(await page.evaluate(x => window.__POOL_QA__.checkAnswer(x, ['0', '0', '0']), target), false);
  const row = page.locator('[data-answer-row="' + target.id + '"]');
  assert.equal(await row.locator('input').count(), 3);
  for (const input of await row.locator('input').all()) await input.fill('0');
  await page.click('#grade');
  for (const x of items) {
    const inputs = page.locator('[data-answer-row="' + x.id + '"] input');
    for (let i = 0; i < x.answerParts.length; i++) await inputs.nth(i).fill(String(x.answerParts[i]));
  }
  await page.click('#grade');
  assert.equal(await page.locator('#diagnosis [data-diagnosis]').count(), 9);
  const diagnosis = page.locator('[data-diagnosis="' + target.id + '"]');
  assert.match(decodeURIComponent(await diagnosis.locator('a').first().getAttribute('href')), /활용 4회\.pdf#page=1$/);
  assert.match(await page.locator('#originalExamLink').getAttribute('href'), /mock\.html\?set=hw&round=4/);
  assert.match(await diagnosis.locator('a').last().getAttribute('href'), /count=9$/);
  assert.ok(await page.locator(await diagnosis.locator('a').nth(1).getAttribute('href')).count() >= 1);
  await page.click('#grade');
  const historyKey = 'gfield_practice_pool_v2:local-tester:' + encodeURIComponent(storageVersion(target)) + ':' + target.id;
  const history = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), historyKey);
  assert.equal(history.length, 3);
  assert.equal(history[0].correct, false);
  assert.equal(history[1].correct, true);
  assert.ok(await page.locator('[data-answer-row="' + target.id + '"] input').first().isDisabled());
  assert.equal(await page.evaluate(() => localStorage.getItem('gfield_mock_hw_hw:local-tester')), sourceScore);
  for (const [key, value] of before) assert.equal(await page.evaluate(k => localStorage.getItem(k), key), value);

  await page.setViewportSize({ width: 375, height: 812 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  await page.screenshot({ path: path.join(work, 'pool-375.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1200 });
  const downloadWait = page.waitForEvent('download', { timeout: 600000 });
  await page.click('#downloadZip');
  const download = await downloadWait;
  const zipPath = path.join(work, 'applied4-q01-nine.zip');
  await download.saveAs(zipPath);
  assert.match(await page.locator('#exportStatus').textContent(), /9문항을 빠짐없이/);
  assert.deepEqual(writes, []);
  assert.deepEqual(errors, []);
  const report = {
    dataSha256: crypto.createHash('sha256').update(fs.readFileSync(rawPath)).digest('hex'),
    count: 9, sourceNo: 1, itemIds: items.map(x => x.id),
    questionPages: await page.locator('.questions-page').count(), answerPages: await page.locator('.answers-page').count(),
    pageLayout, images, overflow, desktop375NoHorizontalScroll: true, diagnosisCount: 9, attempts: 3,
    firstAttemptPreserved: true, priorItemAttemptKeysPreserved: true, originalExamScoreUnchanged: true,
    actualZip: true, zipBytes: fs.statSync(zipPath).size, externalWrites: writes
  };
  fs.writeFileSync(path.join(work, 'browser-evidence.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('PASS Applied4 Q1: 9 questions/solutions/figures, two-column print layout, diagnosis links, three attempts, prior histories and original score preserved, actual ZIP created, external writes 0');
  await browser.close(); server.close();
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
