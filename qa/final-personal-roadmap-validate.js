'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const STUDENT = '검수학생';

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const requested = pathname === '/' ? '/index.html' : pathname;
    const filename = path.resolve(ROOT, `.${requested}`);
    if (!filename.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(filename).toLowerCase();
    const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'application/javascript; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

(async () => {
  const { server, port } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.route('https://**/*', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('**/data.js*', async (route) => {
    const source = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
    const addition = `\n;(function(){var D=window.GFIELD_DATA,n=${JSON.stringify(STUDENT)};if(!D.students.includes(n))D.students.push(n);D.studentTypes[n]='resident';D.attendance[n]=['sep-w1'];})();`;
    await route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: source + addition });
  });
  try {
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    if (await page.locator('#skipBtn').count()) await page.locator('#skipBtn').click();
    await page.locator('#name-input').fill(STUDENT);
    await page.locator('#login .enter').click();
    await page.locator('#dashboard:not(.hidden)').waitFor();
    await page.evaluate(() => nav('roadmap'));
    const button = page.getByRole('button', { name: new RegExp(`${STUDENT} 학생 파이널 성적표`) });
    assert.equal(await button.count(), 1, '현재 로그인 학생 이름의 파이널 1회 성적표 버튼');
    assert.equal(await page.getByRole('button', { name: /다른 학생.*성적표/ }).count(), 0, '다른 학생 성적표 버튼 없음');
    assert.equal(await page.evaluate(() => localStorage.getItem('gfield_student')), STUDENT, '개인 성적표와 비교할 로그인 이름 보존');
    const popupPromise = page.waitForEvent('popup');
    await button.click();
    const popup = await popupPromise;
    assert.match(decodeURIComponent(popup.url()), new RegExp(`final\\.html\\?round=1&go=report&name=${STUDENT}$`), '현재 학생 이름으로만 성적표 연결');
    await popup.close();
    console.log('PASS personal Final roadmap: current student name only, read-only report URL');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
