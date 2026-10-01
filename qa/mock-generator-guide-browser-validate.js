'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const root = path.resolve(__dirname, '..');
const student = '검수학생';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.mp4': 'video/mp4' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
});

async function routeData(page) {
  await page.route('**/data.js*', route => {
    const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
    const injection = `\n;(function(){var d=window.GFIELD_DATA,n=${JSON.stringify(student)};if(!d.students.includes(n))d.students.push(n);})();`;
    return route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: source + injection });
  });
  await page.route('**/rest/v1/mock_results*', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
}

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.addInitScript(() => { window.__GFIELD_BANK_ACCESS_FORCE__ = true; });
    await routeData(mobile);
    await mobile.goto(base + '/mock-generator-guide.html');
    assert.match(await mobile.title(), /모의고사 생성기 사용 안내/);
    assert.equal(await mobile.locator('video source').getAttribute('src'), 'mock-generator-guide.mp4');
    assert.equal(await mobile.locator('.primary').getAttribute('href'), 'bank/personal-mock.html');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await mobile.locator('.primary').click();
    await mobile.waitForURL(/index\.html\?next=bank%2Fpersonal-mock\.html/, { timeout: 15000 });
    await mobile.locator('#name-input').fill(student);
    await mobile.locator('#login .enter').click();
    await mobile.waitForURL(/\/bank\/personal-mock\.html/, { timeout: 15000 });
    await mobile.locator('body.bank-access-granted').waitFor({ timeout: 15000 });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);

    const returning = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await returning.addInitScript(() => {
      window.__GFIELD_BANK_ACCESS_FORCE__ = true;
      try { localStorage.setItem('gfield_student', '검수학생'); } catch (_) { }
    });
    await routeData(returning);
    await returning.goto(base + '/mock-generator-guide.html');
    await returning.locator('.primary').click();
    await returning.locator('body.bank-access-granted').waitFor({ timeout: 15000 });
    assert.match(returning.url(), /\/bank\/personal-mock\.html$/);
    await returning.goto(base + '/index.html');
    await returning.locator('#dashboard:not(.hidden)').waitFor({ timeout: 15000 });
    await returning.locator('.nav-btn[data-v="archive"]').click();
    await returning.locator('a[href="mock-generator-guide.html"]').waitFor({ timeout: 15000 });

    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await desktop.goto(base + '/mock-generator-guide.html');
    assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    if (process.env.GFIELD_QA_SCREENSHOT_DIR) {
      const dir = path.resolve(process.env.GFIELD_QA_SCREENSHOT_DIR);
      fs.mkdirSync(dir, { recursive: true });
      await desktop.screenshot({ path: path.join(dir, 'mock-generator-guide-desktop.png'), fullPage: true });
      await returning.goto(base + '/mock-generator-guide.html');
      await returning.screenshot({ path: path.join(dir, 'mock-generator-guide-mobile.png'), fullPage: true });
    }
    console.log('guide HTML, archive link, mobile layout, fresh login return, saved-phone direct access: PASS');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
