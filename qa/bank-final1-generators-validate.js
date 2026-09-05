'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SCREENSHOT_DIR = process.env.GFIELD_QA_FINAL1_SCREENSHOT_DIR || '';
const PDF_PATH = process.env.GFIELD_QA_FINAL1_PDF_PATH || '';
const IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 21, 22, 23, 24, 25, 27, 28, 29, 30]
  .map((no) => `final1-q${String(no).padStart(2, '0')}`);
const VISUAL_IDS = new Set([2, 5, 7, 9, 10, 11, 13, 15, 21, 22, 29, 30].map((no) => `final1-q${String(no).padStart(2, '0')}`));

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
    await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=final1-q01&n=8&seed=F101&review=1&points=2.7`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.qcard.text-only');

    const audit = await page.evaluate(({ ids, visualIds }) => {
      const core = window.BANK_CORE;
      const failures = [];
      const stats = {};
      const fail = (message) => { if (failures.length < 40) failures.push(message); };
      const same = (a, b) => String(a) === String(b);
      const digitSum = (number) => String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
      const visualIdSet = new Set(visualIds);

      visualIds.forEach((id) => {
        const generator = window.BANK_GENS.find((row) => row.id === id);
        const sample = generator.gen(3, core.mulberry32(core.hashString(`${id}:real-raster`)));
        if (!sample.asset || sample.asset.kind !== 'raster' || !/^data:image\/png;base64,/.test(sample.asset.src || '') ||
            !(sample.asset.width > 0) || !(sample.asset.height > 0) || !sample.asset.description) {
          fail(`${id}: real Canvas PNG inspection sample missing`);
        }
      });
      const fastAsset = () => ({ kind: 'raster', mimeType: 'image/png', src: 'data:image/png;base64,AA==', width: 2, height: 2, displayWidth: 1, displayHeight: 1, description: 'bulk math audit placeholder' });
      ['drawIsoStackWithHeightMap', 'drawTriangleChain', 'drawDistanceTable', 'drawRingPattern', 'drawNumberPyramid', 'drawMagicStar', 'drawSumGrid', 'drawCubeColumn', 'drawShapeValueGrid', 'drawMarkedRectGrid', 'drawDigitCards', 'drawCircleRule']
        .forEach((name) => { window.BANK_RASTER[name] = fastAsset; });

      function externalAnswer(id, q) {
        const m = q.meta;
        if (id === 'final1-q01') {
          let count = 0; for (let n = 10; n <= 99; n++) if (digitSum(n) < m.threshold) count++; return count;
        }
        if (id === 'final1-q02') return m.counts.zero + m.counts.two;
        if (id === 'final1-q03') {
          let count = 0; for (let k = 0; k <= 40; k++) if (12 * k > 11 * m.startHour && 12 * k < 11 * m.endHour) count++; return count;
        }
        if (id === 'final1-q04') {
          const values = [];
          for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 4; c++) for (let d = 0; d < 4; d++) {
            if (new Set([a, b, c, d]).size === 4) values.push((10 * m.digits[a] + m.digits[b]) * (10 * m.digits[c] + m.digits[d]));
          }
          return Math.max(...values) - Math.min(...values);
        }
        if (id === 'final1-q05') return m.count * m.base + 2 * m.side;
        if (id === 'final1-q06') {
          for (let day = 1; day <= 720; day++) if ((day * m.dailyGainMinutes) % 720 === 0) return day;
        }
        if (id === 'final1-q07') return m.positions[4] - m.positions[1];
        if (id === 'final1-q08') {
          const values = [];
          for (let delivered = 0; delivered <= m.total; delivered++) if (delivered * m.reward - (m.total - delivered) * m.penalty === m.received) values.push(delivered);
          if (values.length !== 1) return `not-unique:${values.length}`; return values[0];
        }
        if (id === 'final1-q09') return m.stageCounts.reduce((sum, value) => sum + value, 0);
        if (id === 'final1-q10') {
          let value = 1, sum = 0;
          for (let row = 1; row <= m.row; row++) for (let col = 0; col < row; col++) { if (row === m.row) sum += value; value++; }
          return sum;
        }
        if (id === 'final1-q11') {
          const b = m.pairSums;
          const first = (b[0] - b[1] + b[2] - b[3] + b[4]) / 2;
          const inner = [first]; for (let i = 0; i < 4; i++) inner.push(b[i] - inner[i]);
          return Number(String(inner[0]) + inner[1] + inner[2]) + Number(String(inner[3]) + inner[4]);
        }
        if (id === 'final1-q12') {
          const values = [];
          for (let cc = 1; cc < m.total; cc++) {
            const aa = cc + m.difference, bb = m.firstPair - aa, dd = m.total - aa - bb - cc;
            if (aa > 0 && bb > 0 && dd > 0 && cc + 2 * dd === m.weighted) values.push([aa, bb, cc, dd].join(', '));
          }
          if (values.length !== 1) return `not-unique:${values.length}`; return values[0];
        }
        if (id === 'final1-q13') return m.grid[0][2] + m.grid[1][2] + m.grid[2][2];
        if (id === 'final1-q14') {
          const values = [];
          for (let r = 1; r <= m.total; r++) if (r + (r + 2) + 2 * r + (r - 2) + (r + 1) === m.total) values.push(r);
          if (values.length !== 1) return `not-unique:${values.length}`; return values[0];
        }
        if (id === 'final1-q15') {
          let valid = 0;
          function visit(last, remaining, used) {
            if (used === m.height) { valid++; return; }
            for (let color = 0; color < 3; color++) if (remaining[color] && color !== last) {
              remaining[color]--; visit(color, remaining, used + 1); remaining[color]++;
            }
          }
          visit(-1, m.counts.slice(), 0); return valid;
        }
        if (id === 'final1-q16') return (m.remainders[0] + m.remainders[1]) % m.divisor;
        if (id === 'final1-q19') return Math.pow(2, m.disks) - 1;
        if (id === 'final1-q21') {
          const row = m.grid[3].reduce((sum, symbol) => sum + m.solvedValues[symbol], 0);
          const col = m.grid.reduce((sum, gridRow) => sum + m.solvedValues[gridRow[3]], 0);
          return `${row}, ${col}`;
        }
        if (id === 'final1-q22') {
          let count = 0;
          for (let left = 0; left < m.cols; left++) for (let right = left + 1; right <= m.cols; right++) {
            for (let top = 0; top < m.rows; top++) for (let bottom = top + 1; bottom <= m.rows; bottom++) {
              const inside = (p) => left <= p[0] && p[0] < right && top <= p[1] && p[1] < bottom;
              if (!inside(m.markers[0]) && !inside(m.markers[1])) count++;
            }
          }
          return count;
        }
        if (id === 'final1-q23') return m.matches.length === 1 ? m.matches[0] : `not-unique:${m.matches.length}`;
        if (id === 'final1-q24') {
          let units = 1; for (let i = 0; i < m.exponent; i++) units = (units * m.base) % 10; return units;
        }
        if (id === 'final1-q25') {
          let count = 0; for (let n = 100; n <= 999; n++) if (n % m.divisor > Math.floor(n / m.divisor)) count++; return count;
        }
        if (id === 'final1-q27') return m.trainLength / (m.carSpeed + m.trainSpeed);
        if (id === 'final1-q28') {
          const minuteSpeed = 360 / m.hourMinutes;
          const matches = [];
          for (let halfDay = 3; halfDay <= 24; halfDay++) {
            const angle = (minuteSpeed - 360 / (halfDay * m.hourMinutes)) * m.chaseMinutes;
            if (Math.abs(angle - m.chaseAngle) < 1e-9) matches.push(halfDay * 2);
          }
          if (matches.length !== 1) return `not-unique:${matches.length}`; return matches[0];
        }
        if (id === 'final1-q29') {
          let sum = 0;
          function build(prefix) {
            if (prefix.length === m.length) { sum += Number(prefix.join('')); return; }
            m.digits.forEach((digit) => { if (prefix.length || digit !== 0) build(prefix.concat(digit)); });
          }
          build([]); return sum;
        }
        if (id === 'final1-q30') return Math.floor(m.target.left / 10) * 1000 + m.target.difference * 10 + m.target.right % 10;
        return 'unsupported';
      }

      ids.forEach((id) => {
        const generator = window.BANK_GENS.find((row) => row.id === id);
        if (!generator) { fail(`${id}: missing generator`); return; }
        if (!generator.sourceLinked || !generator.reviewOnly || generator.sourceSet !== 'final' || generator.sourceRound !== 1) fail(`${id}: source lock metadata`);
        stats[id] = {};
        for (let level = 1; level <= 5; level++) {
          const prompts = new Set(), answers = new Set();
          for (let seed = 0; seed < 1000; seed++) {
            const rng = core.mulberry32(core.hashString(`${id}:${level}:${seed}`));
            let question;
            try { question = generator.gen(level, rng); }
            catch (error) { fail(`${id} L${level} S${seed}: ${error.message}`); continue; }
            prompts.add(question.text + '|' + (question.conditionLines || []).join('|') + '|' + (question.variantKey || ''));
            answers.add(String(question.answer));
            if (visualIdSet.has(id)) {
              if (!question.asset || question.asset.kind !== 'raster' || !/^data:image\/png;base64,/.test(question.asset.src || '') ||
                  !(question.asset.width > 0) || !(question.asset.height > 0)) fail(`${id} L${level} S${seed}: verified PNG asset missing`);
            } else if (question.asset) fail(`${id} L${level} S${seed}: text source gained an invented asset`);
            const proof = question.verification || {};
            if (!proof.primary || !proof.independent || !same(proof.primary.answer, question.answer) ||
                !same(proof.independent.answer, question.answer) || proof.unique !== true ||
                Number(proof.validAnswerCount) !== 1 || proof.primary.method === proof.independent.method) {
              fail(`${id} L${level} S${seed}: verification contract`);
            }
            const external = externalAnswer(id, question);
            if (!same(external, question.answer)) fail(`${id} L${level} S${seed}: external ${external} != ${question.answer}`);
            if (!question.learnerFit || question.learnerFit.learnerStage !== '초등 선발 대비 사고력 수학') fail(`${id}: learner fit missing`);
            if (/[A-Za-z]/.test(`${question.text} ${(question.conditionLines || []).join(' ')} ${question.solution}`)) fail(`${id} L${level} S${seed}: Latin student text`);
          }
          stats[id][level] = { generated: 1000, uniquePrompts: prompts.size, uniqueAnswers: answers.size };
          const minimumPromptVariants = id === 'final1-q19' ? 2 : 4;
          if (prompts.size < minimumPromptVariants) fail(`${id} L${level}: too few prompt variants`);
        }
      });

      const papers = ids.map((id) => core.buildPaper({ genId: id, n: 8, seedStr: id.slice(-4) }));
      papers.forEach((paper) => {
        if (paper.questions.length !== 8) fail(`${paper.genId}: paper count ${paper.questions.length}`);
        paper.questions.forEach((question) => {
          if (!question.diagnosis || !question.diagnosis.typeId || !question.diagnosis.errorTags.length) fail(`${question.genId}: diagnosis missing`);
        });
      });
      const mixed = core.buildPaper({ genId: 'mix', n: 100, seedStr: 'FMIX' });
      if (mixed.questions.some((question) => ids.includes(question.genId))) fail('Final 1 review generator leaked into normal mix');
      if (window.BANK_FINAL1_REVIEW.readyQuestionNos.length !== 26 || window.BANK_FINAL1_REVIEW.blockedQuestionNos.join(',') !== '17,18,20,26') fail('Final 1 release gate inventory mismatch');
      return { failures, stats };
    }, { ids: IDS, visualIds: [...VISUAL_IDS] });

    assert.deepEqual(audit.failures, [], audit.failures.join('\n'));
    assert.equal(await page.locator('#reviewNote').isVisible(), true, 'Final 1 review lock notice visible');
    assert.match(await page.locator('#reviewNote').textContent(), /아직 공개 승인 전/, 'review gate stays closed');
    assert.equal(await page.locator('.qcard').count(), 8, 'eight review questions rendered');
    assert.deepEqual(await page.locator('.qpage').evaluateAll((pages) => pages.map((item) => item.querySelectorAll('.qcard').length)), [6, 2], 'six questions per page');
    assert.equal(await page.locator('.answer-page').count(), 1, 'answer page isolated');
    assert.equal(await page.locator('.question-page + .answer-page').count(), 1, 'answer starts after all question pages');
    assert.equal(await page.locator('.chip[data-role="type"][data-val^="final1-"]').count(), 26, 'Final 1 review type chips registered');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=final1-q11&n=4&seed=MOB1&review=1`, { waitUntil: 'networkidle' });
    const mobile = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth }));
    assert.ok(mobile.documentWidth <= mobile.viewport + 1, 'Final 1 mobile review has no horizontal overflow');
    assert.ok((await page.locator('.qfigure img').first().boundingBox()).width <= 350, 'Final 1 figure fits 390px mobile');
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.deepEqual(browserErrors, [], 'no browser errors');
    if (SCREENSHOT_DIR) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      for (const id of VISUAL_IDS) {
        await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=${id}&n=4&seed=V${id.slice(-2)}1&review=1`, { waitUntil: 'networkidle' });
        await page.locator('.qcard[data-index="1"]').screenshot({ path: path.join(SCREENSHOT_DIR, `${id}.png`) });
      }
    }
    if (PDF_PATH) {
      fs.mkdirSync(path.dirname(PDF_PATH), { recursive: true });
      await page.goto(`http://127.0.0.1:${port}/bank/index.html?gens=${IDS.join(',')}&n=20&seed=F1PV&review=1&points=all`, { waitUntil: 'networkidle' });
      await page.pdf({ path: PDF_PATH, format: 'A4', printBackground: true, preferCSSPageSize: true });
    }
    console.log('PASS Final 1 source-linked review generators: 26 types x 5 levels x 1000 seeds = 130000 independently checked variants');
    console.log(JSON.stringify(audit.stats));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
