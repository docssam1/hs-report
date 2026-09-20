'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const root = path.resolve(__dirname, '..');
const student = '최종7회뷰어검수';
const dataSource = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const dataAddon = `
;(function(){
  var d=window.GFIELD_DATA,n=${JSON.stringify(student)};
  if(!d.students.includes(n))d.students.push(n);
  d.archiveProductAccess=d.archiveProductAccess||{};
  d.archiveProductAccess['mock-final-7']=[n];
})();`;

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404);
    response.end();
    return;
  }
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
  }[path.extname(file)] || 'application/octet-stream';
  response.setHeader('Content-Type', type);
  if (url.pathname === '/data.js') {
    response.end(dataSource + dataAddon);
    return;
  }
  fs.createReadStream(file).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.route(/^https?:\/\//, route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1') return route.continue();
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co') {
        if (url.pathname === '/rest/v1/mock_results') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        return route.fulfill({ status: 204, body: '' });
      }
      return route.abort();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    if (await page.locator('#skipBtn').count()) await page.locator('#skipBtn').click();
    await page.locator('#name-input').fill(student);
    await page.locator('.enter').click();
    await page.locator('.nav-btn[data-v="archive"]').click();

    const book = page.getByRole('button', { name: /최종 실전 모의고사 7회/ });
    assert.equal(await book.count(), 1, 'approved Final 7 appears in the additional mock library');
    await book.click();
    await page.locator('#bookviewer.open').waitFor();
    assert.equal(await page.locator('#bookviewer .bv-pg img').count(), 8, 'Final 7 viewer shows all eight paper pages');
    await page.waitForFunction(() => [...document.querySelectorAll('#bookviewer .bv-pg img')].every(img => img.complete && img.naturalWidth > 0));

    const video = page.locator('#bookviewer .bv-stage.split .bv-vid iframe');
    assert.equal(await video.count(), 1, 'Final 7 opens paper and video in one viewer');
    assert.match(await video.getAttribute('src'), /youtube\.com\/embed\/NpGefamVXp8/, 'Final 7 viewer uses the reviewed solution video');

    const report = page.getByRole('link', { name: new RegExp(student + ' 학생 진단 분석지') });
    assert.equal(await report.count(), 1, 'Final 7 viewer exposes the student report');
    const reportUrl = await report.getAttribute('href');
    assert.match(reportUrl, /^final\.html\?round=7&go=report&name=/, 'Final 7 report keeps its independent round');
    assert.doesNotMatch(reportUrl, /set=last|round=2/, 'Final 7 is not rewritten to Last 2');

    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Final 7 viewer has no 390px page overflow');
    console.log('PASS Final 7 appears in the additional mock library with its 8-page paper, solution video, own report route, and 390px fit');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
