'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const PDF_DIR = process.env.GFIELD_QA_SOURCE_PDF_DIR || '';
const IDS = ['overlap-range-sum'];

function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const filename = path.resolve(ROOT, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(filename);
    const contentType = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'application/javascript; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

(async () => {
  const { server, port } = await startServer();
  const browser = await chromium.launch({ headless: true, ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(String(error)));

  try {
    await page.route('https://**/*', (route) => route.abort());
    const typeName = encodeURIComponent('겹치는 두 모임의 최솟값과 최댓값');
    const difficulty = encodeURIComponent('최하');
    await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=overlap-range-sum&level=1&n=8&seed=SRC1&review=1&type=${typeName}&points=2.7&difficulty=${difficulty}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.qcard.text-only');

    const audit = await page.evaluate((ids) => {
      const core = window.BANK_CORE;
      const failures = [];
      const stats = {};
      const fail = (message) => { if (failures.length < 30) failures.push(message); };
      const same = (a, b) => String(a) === String(b);

      ids.forEach((id) => {
        const generator = window.BANK_GENS.find((row) => row.id === id);
        if (!generator) { fail(`${id}: missing generator`); return; }
        stats[id] = {};
        for (let level = 1; level <= 5; level++) {
          const prompts = new Set();
          const answers = new Set();
          for (let seed = 0; seed < 1000; seed++) {
            const rng = core.mulberry32(core.hashString(`${id}:${level}:${seed}`));
            let question;
            try { question = generator.gen(level, rng); }
            catch (error) { fail(`${id} L${level} S${seed}: ${error.message}`); continue; }
            prompts.add(question.text);
            answers.add(String(question.answer));
            if (question.asset) fail(`${id} L${level} S${seed}: text-only source gained an invented figure`);
            const proof = question.verification || {};
            if (!proof.primary || !proof.independent || !same(proof.primary.answer, question.answer) ||
                !same(proof.independent.answer, question.answer) || proof.unique !== true ||
                Number(proof.validAnswerCount) !== 1 || proof.primary.method === proof.independent.method) {
              fail(`${id} L${level} S${seed}: verification contract`);
            }
            let external;
            const values = [];
            for (let first = 0; first <= question.meta.boys; first++) {
              const second = question.meta.propertyCount - first;
              if (second >= 0 && second <= question.meta.girls) values.push(first);
            }
            external = Math.min(...values) + Math.max(...values);
            if (question.meta.boys === 21 && question.meta.girls === 15 && question.meta.propertyCount === 19) fail(`${id}: copied source values`);
            if (!same(external, question.answer)) fail(`${id} L${level} S${seed}: external answer mismatch`);
            if (/[A-Za-z]/.test(`${question.text} ${question.solution}`)) fail(`${id} L${level} S${seed}: Latin student text`);
          }
          stats[id][level] = { generated: 1000, uniquePrompts: prompts.size, uniqueAnswers: answers.size };
          if (prompts.size < 150) fail(`${id} L${level}: too few distinct prompts (${prompts.size})`);
          if (answers.size < 8) fail(`${id} L${level}: too few distinct answers (${answers.size})`);
        }
      });

      const papers = ids.map((id) => core.buildPaper({ genId: id, level: 1, n: 5, seedStr: id === ids[0] ? 'SRC1' : 'SRC2' }));
      papers.forEach((paper) => paper.questions.forEach((question) => {
        if (!question.diagnosis || !question.diagnosis.typeId || !question.diagnosis.errorTags.length) fail(`${question.genId}: diagnosis missing`);
      }));
      const mixed = core.buildPaper({ genId: 'mix', level: 'all', n: 100, seedStr: 'MIX1' });
      if (mixed.questions.some((question) => ids.includes(question.genId))) fail('review-only generator leaked into normal mix');
      return { failures, stats, paperTypeIds: papers.map((paper) => paper.questions[0].diagnosis.typeId) };
    }, IDS);

    assert.deepEqual(audit.failures, [], audit.failures.join('\n'));
    assert.deepEqual(audit.paperTypeIds, ['type-1eytvqn']);
    assert.equal(await page.locator('#reviewNote').isVisible(), true, 'review lock notice visible');
    assert.match(await page.locator('#reviewNote').textContent(), /아직 공개 승인 전/, 'review release lock copy');
    assert.equal(await page.locator('.qcard').count(), 8, 'eight review questions rendered');
    assert.equal(await page.locator('.qpage').count(), 2, 'four questions per page');
    assert.equal(await page.locator('.qfigure, .qcard table').count(), 0, 'text-only source has no invented figure or table');
    assert.deepEqual(browserErrors, [], 'no browser errors');
    if (PDF_DIR) {
      fs.mkdirSync(PDF_DIR, { recursive: true });
      for (const [id, seed, type] of [
        ['overlap-range-sum', 'SRC1', '겹치는 두 모임의 최솟값과 최댓값'],
      ]) {
        await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=${id}&level=1&n=8&seed=${seed}&review=1&type=${encodeURIComponent(type)}&points=2.7&difficulty=${difficulty}`, { waitUntil: 'networkidle' });
        await page.pdf({ path: path.join(PDF_DIR, `${id}-review.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
      }
    }
    console.log('PASS source-linked review generator: 1 actual-source type x 5 levels x 1000 seeds = 5000 independently checked variants');
    console.log(JSON.stringify(audit.stats));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
