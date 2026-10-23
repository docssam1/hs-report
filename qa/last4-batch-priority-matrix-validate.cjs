'use strict';

// Synthetic student records only. Every external request is intercepted and
// unexpected writes fail before they reach the network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
require('./email-login-test-stub');
const { chromium } = require('playwright');
const core = require('../supabase/functions/hs-final-population/population-core.js');

const root = path.resolve(__dirname, '..');
const out = process.env.GFIELD_LAST4_MATRIX_OUTPUT || path.join(root, '.private-work', 'last4-priority-matrix-20261019');
const student = '최종4매트릭스합성검수학생';
const all30 = process.env.GFIELD_LAST4_ALL30_ZIP === '1';
const cases = process.env.GFIELD_LAST4_MATRIX_CASES ? JSON.parse(process.env.GFIELD_LAST4_MATRIX_CASES) : all30 ? Array.from({ length: 30 }, (_, index) => [index + 1]) : [[], [12], [3, 26], [7, 23, 28], [1, 2, 3, 4, 5, 6]];
const data = fs.readFileSync(path.join(root, 'data.js'), 'utf8') +
  '\n;(()=>{const d=window.GFIELD_DATA,n=' + JSON.stringify(student) +
  ';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["최종 모의고사"]=[n];})();';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  const file = path.resolve(root, '.' + decodeURIComponent(pathname));
  if (!file.startsWith(root + path.sep) || file.includes('.private') || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if (pathname === '/data.js') return res.end(data);
  fs.createReadStream(file).pipe(res);
});
const oxFor = wrong => Array.from({ length: 30 }, (_, i) => wrong.includes(i + 1) ? 'X' : 'O').join('');
const rowFor = wrong => { const ox = oxFor(wrong); return { student, round: 'last4', ox, score: core.scoreOf(ox), wrong: wrong.length, source: 'admin' }; };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.GFIELD_LAST4_MATRIX_BASE_URL || 'http://127.0.0.1:' + server.address().port;
  const evidence = { base, mode: process.env.GFIELD_LAST4_MATRIX_BASE_URL ? 'public-static-synthetic-records' : 'local-static-synthetic-records', caseMode: all30 ? 'all-30-single-wrong-sources' : 'priority-count-matrix', cases: [], writes: [], browserErrors: [] };
  let record = rowFor([]);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(() => {
      window.__GFIELD_BANK_ACCESS_FORCE__ = true;
      localStorage.setItem('gfield_hs_admin_session_v1', JSON.stringify({ access_token: 'qa-admin', refresh_token: 'qa-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600 }));
    });
    await context.route(/^https?:\/\//, async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.pathname === '/data.js' && url.origin === new URL(base).origin) return route.fulfill({ contentType: 'application/javascript', body: data });
      if (url.hostname === 'fgahqumaldheqettmvqg.supabase.co') {
        if (url.pathname === '/functions/v1/hs-final-population') return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
        if (url.pathname === '/functions/v1/hs-approval-admin' && request.postDataJSON()?.action === 'list') return route.fulfill({ json: { accounts: [], parentSessions: [] } });
        if (request.method() !== 'GET') { evidence.writes.push(request.method() + ' ' + url.pathname); return route.abort(); }
        const body = url.pathname === '/auth/v1/user' ? { id: 'qa-admin', app_metadata: { role: 'admin' } } : url.pathname === '/rest/v1/hs_accounts' ? [{ role: 'admin', active: true, student: null }] : url.pathname === '/rest/v1/mock_results' ? [record] : [];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      }
      if (url.origin === new URL(base).origin) return route.continue();
      // Match production typography: fallback-only QA can miss a wrapped line
      // that pushes an illustrated question beyond a fixed two-column cell.
      if (request.method() === 'GET' && ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => evidence.browserErrors.push(error.message));
    await page.goto(base + '/admin.html');
    await page.waitForFunction(() => window.GFIELD_ADMIN_FINAL_BATCH && window.GFIELD_ADMIN_MOCK_V2);
    await page.evaluate(() => { document.getElementById('gate').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); document.getElementById('tab-mock').classList.remove('hidden'); });
    assert.equal(await page.locator('#final-batch-similar').isChecked(), true);
    assert.equal(await page.locator('#final-batch-details').isChecked(), false);
    for (const wrong of cases) {
      record = rowFor(wrong);
      await page.evaluate(() => loadMockResults());
      const result = await page.evaluate(async savePdf => {
        window.__GFIELD_BATCH_QA_CAPTURE__ = {};
        const task = GFIELD_ADMIN_MOCK_V2.lastOfficialEntries().find(item => item.round === 4);
        if (!task) throw new Error('Synthetic Last4 record is missing');
        const blob = await GFIELD_ADMIN_FINAL_BATCH._test.buildPackage(task, 0, 1).catch(e=>{throw new Error((e.code||e.name)+': '+e.message);});
        const signature = new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer());
        const practice = window.__GFIELD_BATCH_QA_CAPTURE__.practice;
        const pdfBase64 = savePdf ? await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(blob); }) : null;
        return { signature, bytes: blob.size, practice, pdfBase64 };
      }, wrong.length === 3);
      assert.equal(result.signature, '%PDF-');
      assert.ok(result.bytes > 40000);
      const expectedCount = Math.min(3, wrong.length) * 3;
      assert.equal(result.practice.questions, expectedCount);
      assert.equal(result.practice.answers, expectedCount);
      assert.equal(result.practice.sourceNos.length, Math.min(3, wrong.length));
      assert.ok(result.practice.sourceNos.every(no => wrong.includes(no)));
      const expectedIds = [1, 2, 3].flatMap(variant => result.practice.sourceNos.map(no => 'last4-q' + String(no).padStart(2, '0') + '-v' + variant));
      assert.deepEqual(result.practice.questionIds, expectedIds);
      assert.deepEqual(result.practice.answerIds, expectedIds);
      if (result.pdfBase64) fs.writeFileSync(path.join(out, 'last4-three-priority.pdf'), Buffer.from(result.pdfBase64, 'base64'));
      await page.locator('#final-batch-select-all').click();
      await page.evaluate(() => {
        document.querySelectorAll('#final-batch-rounds input[data-exam-set]').forEach(input => {
          input.checked = input.value === 'last4';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        window.__GFIELD_BATCH_QA_CAPTURE__ = {};
      });
      assert.equal(await page.evaluate(() => GFIELD_ADMIN_FINAL_BATCH._test.taskList().length), 1);
      const zipDownload = page.waitForEvent('download', { timeout: 180000 });
      await page.locator('#final-batch-zip').click();
      const zipPath = path.join(out, 'last4-wrong-' + (wrong.join('-') || 'none') + '.zip');
      await (await zipDownload).saveAs(zipPath);
      await page.waitForFunction(() => document.getElementById('final-batch-status').dataset.state === 'done');
      const zipCheck = await page.evaluate(async bytes => {
        const archive = await JSZip.loadAsync(bytes, { base64: true });
        const names = Object.keys(archive.files);
        const pdfFile = Object.values(archive.files).find(entry => !entry.dir);
        const pdf = await pdfFile.async('uint8array');
        return {
          names,
          pdfSignature: new TextDecoder().decode(pdf.subarray(0, 5)),
          pdfBytes: pdf.length,
          practice: window.__GFIELD_BATCH_QA_CAPTURE__.practice,
          status: document.getElementById('final-batch-status').textContent
        };
      }, fs.readFileSync(zipPath).toString('base64'));
      assert.deepEqual(zipCheck.names, ['최종 4회/', '최종 4회/' + student + '_최종_4회_진단과복습.pdf']);
      assert.equal(zipCheck.pdfSignature, '%PDF-');
      assert.ok(zipCheck.pdfBytes > 40000);
      assert.deepEqual(zipCheck.practice.sourceNos, result.practice.sourceNos);
      assert.deepEqual(zipCheck.practice.questionIds, expectedIds);
      assert.deepEqual(zipCheck.practice.answerIds, expectedIds);
      assert.equal(zipCheck.practice.questions, expectedCount);
      assert.equal(zipCheck.practice.answers, expectedCount);
      assert.doesNotMatch(zipCheck.status, /준비 중인 부록/);
      evidence.cases.push({ wrong, sourceNos: result.practice.sourceNos, questions: result.practice.questions, answers: result.practice.answers, questionIds: result.practice.questionIds, bytes: result.bytes, zip: { file: path.basename(zipPath), bytes: fs.statSync(zipPath).size, pdfBytes: zipCheck.pdfBytes, status: zipCheck.status } });
      console.log('PASS Last4 ZIP wrong ' + wrong.join(',') + ': ' + expectedCount + ' questions + ' + expectedCount + ' answers');
    }
    assert.deepEqual(evidence.writes, []);
    assert.deepEqual(evidence.browserErrors, []);
    fs.writeFileSync(path.join(out, 'last4-priority-matrix.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log('PASS Last4 priority matrix; external writes 0; browser errors 0');
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
