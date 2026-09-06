'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const output = process.env.GFIELD_WATERMARK_REVIEW_DIR;
const server = http.createServer((req, res) => {
  const file = path.resolve(ROOT, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); return res.end();
  }
  res.setHeader('Content-Type', ({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json'})[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
async function checkPages(page, expected) {
  for (const media of ['screen', 'print']) {
    await page.emulateMedia({media});
    const rows = await page.locator('.page').evaluateAll(pages => pages.map(p => {
      const w = p.querySelector('.wm-layer');
      let visible = !!w;
      for (let n = w; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) visible = false;
      }
      const clip = w?.parentElement;
      const bounded = !!clip && clip.classList.contains('bank-watermark-clip') && getComputedStyle(clip).overflow === 'hidden';
      return {visible, bounded, count:w?.querySelectorAll('.wm-tile').length, label:w?.querySelector('.wm-tile')?.textContent};
    }));
    assert.ok(rows.length >= 3, 'cover, question and answer pages are present');
    for (const row of rows) assert.deepEqual(row, {visible:true, bounded:true, count:32, label:expected}, media);
  }
  await page.emulateMedia({media:null});
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch();
  try {
    for (const scenario of ['anonymous', 'named', 'storage-denied']) {
      const page = await browser.newPage({viewport:{width:1280,height:1000}});
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**/*', route => route.abort());
      await page.addInitScript(mode => {
        if (mode === 'named') localStorage.setItem('gfield_student', '검수용학생');
        if (mode === 'storage-denied') Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('blocked', 'SecurityError');}});
      }, scenario);
      await page.goto(`http://127.0.0.1:${server.address().port}/bank/index.html?gen=tri&n=8&seed=WMQA`, {waitUntil:'networkidle'});
      await page.waitForFunction(() => document.querySelector('.qcard') && !document.querySelector('#btnPrint').disabled);
      const label = (scenario === 'named' ? '검수용학생' : '학습 자료') + ' · 지필드 영재교육';
      await checkPages(page, label);
      // Rebuilding must not duplicate tiles or retain a previous student's name.
      const isolated = await page.evaluate(() => {
        const layer = document.createElement('div');
        BANK_CORE.buildWatermarkTiles(layer, '이전학생');
        BANK_CORE.buildWatermarkTiles(layer, '  ');
        const fallback = {count:layer.children.length, text:layer.children[0].textContent};
        BANK_CORE.buildWatermarkTiles(layer, '<img src=x onerror=alert(1)>');
        return {fallback, injected:layer.querySelectorAll('img').length, literal:layer.children[0].textContent};
      });
      assert.deepEqual(isolated.fallback, {count:32,text:'학습 자료 · 지필드 영재교육'});
      assert.equal(isolated.injected, 0);
      assert.match(isolated.literal, /^<img/);
      if (output) {
        fs.mkdirSync(output, {recursive:true});
        await page.screenshot({path:path.join(output, scenario + '.png')});
        await page.pdf({path:path.join(output, scenario + '.pdf'), preferCSSPageSize:true, printBackground:true});
      }
      if (scenario === 'anonymous') {
        await page.goto(`http://127.0.0.1:${server.address().port}/bank/index.html?gen=tri&n=20&seed=WMQA`, {waitUntil:'networkidle'});
        await page.waitForFunction(() => document.querySelectorAll('.qcard').length === 20 && !document.querySelector('#btnPrint').disabled);
        assert.equal(await page.locator('.answer-page').count(), 2, 'both answer chunks retain page boundaries');
        await checkPages(page, label);
      }
      await page.setViewportSize({width:390,height:844});
      await checkPages(page, label);
      // Negative control: the visibility check must detect a hidden watermark.
      await page.locator('.wm-layer').first().evaluate(n => {n.style.display='none';});
      await assert.rejects(checkPages(page, label), 'hidden watermark is rejected');
      assert.deepEqual(errors, []);
      await page.close();
      console.log('PASS watermark', scenario, 'screen/print/mobile, all pages, safe text, no stale name');
    }
  } finally {await browser.close(); server.close();}
})().catch(error => {console.error(error);server.close();process.exitCode=1;});
