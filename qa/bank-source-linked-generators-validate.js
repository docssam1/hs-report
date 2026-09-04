'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const PDF_DIR = process.env.GFIELD_QA_SOURCE_PDF_DIR || '';
const IDS = ['overlap-range-sum', 'remainder-yes-no'];

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
            prompts.add(question.text + '|' + (question.conditionLines || []).join('|'));
            answers.add(String(question.answer));
            if (question.asset) fail(`${id} L${level} S${seed}: text-only source gained an invented figure`);
            const proof = question.verification || {};
            if (!proof.primary || !proof.independent || !same(proof.primary.answer, question.answer) ||
                !same(proof.independent.answer, question.answer) || proof.unique !== true ||
                Number(proof.validAnswerCount) !== 1 || proof.primary.method === proof.independent.method) {
              fail(`${id} L${level} S${seed}: verification contract`);
            }
            let external;
            if (id === 'overlap-range-sum') {
              const values = [];
              for (let first = 0; first <= question.meta.boys; first++) {
                const second = question.meta.propertyCount - first;
                if (second >= 0 && second <= question.meta.girls) values.push(first);
              }
              external = Math.min(...values) + Math.max(...values);
              if (question.meta.boys === 21 && question.meta.girls === 15 && question.meta.propertyCount === 19) fail(`${id}: copied source values`);
            } else if (id === 'remainder-yes-no') {
              const matches = [];
              for (let number = question.meta.rangeMin; number <= question.meta.rangeMax; number++) {
                const passes = question.meta.conditions.every((condition) => {
                  const remainder = number % condition.divisor;
                  const result = condition.kind === 'equals' ? remainder === condition.value : remainder > condition.value;
                  return result === condition.expected;
                });
                if (passes) matches.push(number);
              }
              if (matches.length !== 1) fail(`${id} L${level} S${seed}: external uniqueness mismatch`);
              external = matches[0];
              if (question.meta.rangeMax === 7) fail(`${id}: copied source divisor range`);
            }
            if (!same(external, question.answer)) fail(`${id} L${level} S${seed}: external answer mismatch`);
            if (/[A-Za-z]/.test(`${question.text} ${(question.conditionLines || []).join(' ')} ${question.solution}`)) fail(`${id} L${level} S${seed}: Latin student text`);
          }
          stats[id][level] = { generated: 1000, uniquePrompts: prompts.size, uniqueAnswers: answers.size };
          if (prompts.size < 150) fail(`${id} L${level}: too few distinct prompts (${prompts.size})`);
          if (answers.size < 8) fail(`${id} L${level}: too few distinct answers (${answers.size})`);
        }
      });

      const papers = ids.map((id) => core.buildPaper({ genId: id, level: 1, n: 8, seedStr: id === ids[0] ? 'SRC1' : 'SRC2' }));
      papers.forEach((paper) => paper.questions.forEach((question) => {
        if (!question.diagnosis || !question.diagnosis.typeId || !question.diagnosis.errorTags.length) fail(`${question.genId}: diagnosis missing`);
      }));
      papers.forEach((paper) => {
        if (paper.questions.length !== 8) fail(`${paper.genId}: review paper did not produce eight questions`);
        if (new Set(paper.questions.map((question) => String(question.answer))).size !== 8) fail(`${paper.genId}: repeated answers in one review paper`);
      });
      const mixed = core.buildPaper({ genId: 'mix', level: 'all', n: 100, seedStr: 'MIX1' });
      if (mixed.questions.some((question) => ids.includes(question.genId))) fail('review-only generator leaked into normal mix');
      return {
        failures,
        stats,
        paperTypeIds: papers.map((paper) => paper.questions[0].diagnosis.typeId),
        generatorTypeIds: ids.map((id) => window.BANK_GENS.find((row) => row.id === id).typeId)
      };
    }, IDS);

    assert.deepEqual(audit.failures, [], audit.failures.join('\n'));
    assert.deepEqual(audit.paperTypeIds, audit.generatorTypeIds, 'diagnosis uses each source-linked type id');
    assert.equal(await page.locator('#reviewNote').isVisible(), true, 'review lock notice visible');
    assert.match(await page.locator('#reviewNote').textContent(), /아직 공개 승인 전/, 'review release lock copy');
    assert.equal(await page.locator('.qcard').count(), 8, 'eight review questions rendered');
    assert.equal(await page.locator('.qpage').count(), 2, 'six questions per page with the remainder on the next page');
    assert.deepEqual(await page.locator('.qpage').evaluateAll((pages) => pages.map((item) => item.querySelectorAll('.qcard').length)), [6, 2], '8 questions paginate as 6 plus 2');
    const cardBoxes = await page.locator('.qpage').first().locator('.qcard').evaluateAll((cards) => cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { x: box.x, y: box.y };
    }));
    assert.ok(cardBoxes[1].x > cardBoxes[0].x + 200 && Math.abs(cardBoxes[1].y - cardBoxes[0].y) < 2, 'questions 1 and 2 share the first row');
    assert.ok(Math.abs(cardBoxes[2].x - cardBoxes[0].x) < 2 && cardBoxes[2].y > cardBoxes[0].y + 150, 'question 3 is lowered into the second row');
    assert.ok(cardBoxes[3].x > cardBoxes[2].x + 200 && Math.abs(cardBoxes[3].y - cardBoxes[2].y) < 2, 'questions 3 and 4 share the lowered second row');
    assert.ok(Math.abs(cardBoxes[4].x - cardBoxes[0].x) < 2 && cardBoxes[4].y > cardBoxes[2].y + 150, 'question 5 starts the third row');
    assert.ok(cardBoxes[5].x > cardBoxes[4].x + 200 && cardBoxes[5].y > cardBoxes[4].y + 10, 'question 6 is lowered in the third row');
    const secondPageBoxes = await page.locator('.qpage').nth(1).locator('.qcard').evaluateAll((cards) => cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { index: card.dataset.index, x: box.x, y: box.y };
    }));
    assert.ok(secondPageBoxes.find((card) => card.index === '8').x > secondPageBoxes.find((card) => card.index === '7').x + 200, 'questions 7 and 8 use separate columns');
    assert.ok(secondPageBoxes.find((card) => card.index === '8').y > secondPageBoxes.find((card) => card.index === '7').y + 30, 'question 8 is lowered');
    assert.equal(await page.locator('.qfigure, .qcard table').count(), 0, 'text-only source has no invented figure or table');
    assert.equal(await page.locator('.answer-page').count(), 1, 'answer key is isolated on its own page');
    assert.equal(await page.locator('.question-page + .answer-page').count(), 1, 'answer key starts only after the final question page');
    assert.deepEqual(browserErrors, [], 'no browser errors');
    if (PDF_DIR) {
      fs.mkdirSync(PDF_DIR, { recursive: true });
      for (const [id, seed, type] of [
        ['overlap-range-sum', 'SRC1', '겹치는 두 모임의 최솟값과 최댓값'],
        ['remainder-yes-no', 'SRC2', '서로 다른 세 조건의 교집합'],
      ]) {
        await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=${id}&level=1&n=8&seed=${seed}&review=1&type=${encodeURIComponent(type)}&points=2.7&difficulty=${difficulty}`, { waitUntil: 'networkidle' });
        await page.pdf({ path: path.join(PDF_DIR, `${id}-review.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
      }
    }
    console.log('PASS source-linked review generators: 2 actual-source types x 5 levels x 1000 seeds = 10000 independently checked variants');
    console.log(JSON.stringify(audit.stats));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
