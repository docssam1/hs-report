'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SCREENSHOT = process.env.GFIELD_QA_SCREENSHOT || '';
const NEW_PREVIEW_SCREENSHOT = process.env.GFIELD_QA_NEW_PREVIEW_SCREENSHOT || '';
const POINT_BANDS = { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' };
const NEW_GENERATOR_IDS = ['repeat', 'weekday', 'inclusion', 'remainder'];

function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
  })[ext] || 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const requested = pathname === '/' ? '/index.html' : pathname;
    const filename = path.resolve(ROOT, `.${requested}`);
    if (!filename.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': mimeType(filename), 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function countRect(meta) {
  let count = 0;
  for (let width = 1; width <= meta.cols; width++) {
    for (let height = 1; height <= meta.rows; height++) {
      if (meta.squareOnly && width !== height) continue;
      for (let left = 0; left + width <= meta.cols; left++) {
        for (let top = 0; top + height <= meta.rows; top++) {
          const contains = ([x, y]) => left <= x && x < left + width && top <= y && y < top + height;
          if (meta.include.every(contains) && !meta.exclude.some(contains)) count++;
        }
      }
    }
  }
  return count;
}

function triangular(n) { return n > 0 ? n * (n + 1) / 2 : 0; }
function countTriangles(meta) {
  let up = 0;
  let down = 0;
  for (let side = 1; side <= meta.n; side++) {
    up += triangular(meta.n - side + 1);
    down += triangular(meta.n - 2 * side + 1);
  }
  return meta.variant === 'up' ? up : meta.variant === 'down' ? down : up + down;
}

function countPaths(meta) {
  const blocked = new Set(meta.blocked.map(([x, y]) => `${x},${y}`));
  let count = 0;
  function walk(x, y) {
    if (blocked.has(`${x},${y}`)) return;
    if (x === meta.gridW - 1 && y === meta.gridH - 1) { count++; return; }
    if (x + 1 < meta.gridW) walk(x + 1, y);
    if (y + 1 < meta.gridH) walk(x, y + 1);
  }
  walk(0, 0);
  return count;
}

function paintedFormula(n, k) {
  if (k === 3) return 8;
  if (k === 2) return 12 * (n - 2);
  if (k === 1) return 6 * (n - 2) ** 2;
  return (n - 2) ** 3;
}

function minMaxViews(top, front, side) {
  const cells = [];
  for (let x = 0; x < front.length; x++) {
    for (let y = 0; y < side.length; y++) {
      if (!top[x][y]) cells.push({ x, y, values: [0] });
      else {
        const cap = Math.min(front[x], side[y]);
        cells.push({ x, y, values: Array.from({ length: cap }, (_, index) => index + 1) });
      }
    }
  }
  let states = new Map([['0|0', { front: Array(front.length).fill(0), side: Array(side.length).fill(0), min: 0, max: 0 }]]);
  for (const cell of cells) {
    const next = new Map();
    for (const state of states.values()) {
      for (const value of cell.values) {
        const frontMax = state.front.slice();
        const sideMax = state.side.slice();
        frontMax[cell.x] = Math.max(frontMax[cell.x], value);
        sideMax[cell.y] = Math.max(sideMax[cell.y], value);
        const key = `${frontMax.join(',')}|${sideMax.join(',')}`;
        const prior = next.get(key);
        const min = state.min + value;
        const max = state.max + value;
        if (!prior) next.set(key, { front: frontMax, side: sideMax, min, max });
        else { prior.min = Math.min(prior.min, min); prior.max = Math.max(prior.max, max); }
      }
    }
    states = next;
  }
  const target = states.get(`${front.join(',')}|${side.join(',')}`);
  return target ? { min: target.min, max: target.max } : { min: Infinity, max: -Infinity };
}

function repeatByEnumeration(meta) {
  let answer = '';
  for (let position = 1; position <= meta.target; position++) {
    answer = meta.pattern[(position - 1) % meta.pattern.length];
  }
  return answer;
}

function weekdayByDayWalk(meta) {
  let month = meta.startMonth;
  let day = meta.startDay;
  let weekday = meta.startWeekdayIndex;
  for (let step = 0; step < meta.delta; step++) {
    day += meta.direction;
    weekday = (weekday + meta.direction + 7) % 7;
    if (day > meta.monthLengths[month - 1]) { month++; day = 1; }
    else if (day < 1) { month--; day = meta.monthLengths[month - 1]; }
  }
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${month}월 ${day}일 ${weekdays[weekday]}`;
}

function inclusionByEnumeration(meta) {
  const candidates = [];
  for (let overlap = 0; overlap <= Math.min(meta.firstCount, meta.secondCount); overlap++) {
    const union = meta.firstCount + meta.secondCount - overlap;
    if (union > meta.total) continue;
    if (meta.mode === 'exact' && meta.total - union !== meta.neitherCount) continue;
    candidates.push(overlap);
  }
  if (meta.mode === 'minimum') return Math.min(...candidates);
  assert.equal(candidates.length, 1, 'exact inclusion has one matching overlap');
  return candidates[0];
}

function remainderByFullRange(meta) {
  const candidates = [];
  for (let value = meta.minimum; value <= meta.maximum; value++) {
    if (meta.conditions.every((condition) => value % condition.divisor === condition.remainder)) candidates.push(value);
  }
  assert.equal(candidates.length, 1, 'remainder conditions have one candidate');
  return candidates[0];
}

function independentAnswer(question) {
  if (question.genId === 'rect') return countRect(question.meta);
  if (question.genId === 'tri') return countTriangles(question.meta);
  if (question.genId === 'path') return countPaths(question.meta);
  if (question.genId === 'repeat') return repeatByEnumeration(question.meta);
  if (question.genId === 'weekday') return weekdayByDayWalk(question.meta);
  if (question.genId === 'inclusion') return inclusionByEnumeration(question.meta);
  if (question.genId === 'remainder') return remainderByFullRange(question.meta);
  if (question.level <= 2) {
    return question.meta.heights.flat().reduce((sum, height) => (
      sum + (question.meta.variant === 'layer' ? Number(height >= question.meta.k) : height)
    ), 0);
  }
  if (question.level <= 4) return paintedFormula(question.meta.n, question.meta.k);
  const mm = minMaxViews(question.meta.views.top, question.meta.views.front, question.meta.views.side);
  assert.deepEqual(mm, { min: question.meta.min, max: question.meta.max }, 'cube Lv5 independent min/max');
  return mm.max - mm.min;
}

(async () => {
  const { server, port } = await startStaticServer();
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(String(error)));

  try {
    await page.route('https://**/*', (route) => route.abort());
    await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=mix&level=all&n=20&seed=PNG1`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.qfigure img');

    const domAudit = await page.evaluate(async () => {
      const images = [...document.querySelectorAll('.qcard .qfigure img')];
      await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      })));
      return {
        questions: document.querySelectorAll('.qcard').length,
        figures: document.querySelectorAll('.qcard .qfigure').length,
        images: images.length,
        svg: document.querySelectorAll('.qcard svg').length,
        badSource: images.filter((img) => !img.src.startsWith('data:image/png;base64,')).length,
        badNaturalSize: images.filter((img) => img.naturalWidth < 300 || img.naturalHeight < 180).length,
        scriptSources: [...document.scripts].map((script) => script.src),
      };
    });
    assert.equal(domAudit.questions, 20, '20 generated question cards');
    assert.equal(domAudit.figures, 20, 'one raster figure per question');
    assert.equal(domAudit.images, 20, 'all generated figures render as img');
    assert.equal(domAudit.svg, 0, 'no generated inline SVG in DOM');
    assert.equal(domAudit.badSource, 0, 'all img sources are PNG data URLs');
    assert.equal(domAudit.badNaturalSize, 0, 'PNG figures have print-usable raster dimensions');
    assert.equal(domAudit.scriptSources.some((src) => /bank-svg\.js/.test(src)), false, 'legacy SVG helper is not loaded');
    for (const [id, label] of [
      ['repeat', '반복 문자 규칙'], ['weekday', '날짜·요일 이동'],
      ['inclusion', '두 모임 겹침'], ['remainder', '나머지 조건 수'],
    ]) {
      await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=${id}&points=all&n=20&seed=PNG1`, { waitUntil: 'networkidle' });
      const chip = page.locator(`.chip[data-role="type"][data-val="${id}"]`);
      assert.equal(await chip.count(), 1, `${id} generator button`);
      assert.equal(await chip.getAttribute('aria-pressed'), 'true', `${id} generator selected`);
      assert.equal(await page.locator('.cover .genname').textContent(), label, `${id} targeted paper cover`);
      assert.equal(new URL(page.url()).searchParams.get('gen'), id, `${id} query state`);
      assert.equal(await page.locator('.qcard').count(), 20, `${id} targeted paper question count`);
    }
    await page.goto(`http://127.0.0.1:${port}/bank/index.html?gen=rect&points=2.7&n=20&seed=MULT`, { waitUntil: 'networkidle' });
    await page.locator('.chip[data-role="type"][data-val="tri"]').click();
    assert.equal(await page.locator('.chip[data-role="type"][aria-pressed="true"]').count(), 2, 'two generator types selected together');
    assert.deepEqual(new URL(page.url()).searchParams.get('gens').split(',').sort(), ['rect', 'tri'], 'multiple type query state');
    assert.deepEqual((await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => card.dataset.gen))])).sort(), ['rect', 'tri'], 'both selected types appear');
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => card.dataset.points))]), ['2.7'], '2-point band only');
    await page.locator('.chip[data-role="tune"][data-val="easy"]').click();
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => Number(card.dataset.level)))]), [1], '2-point easier mode uses the lowest source profile');
    await page.locator('.chip[data-role="tune"][data-val="hard"]').click();
    assert.ok((await page.locator('.qcard').evaluateAll((cards) => cards.every((card) => [2, 3].includes(Number(card.dataset.level))))), '2-point harder mode raises the source profile');
    await page.locator('.chip[data-role="tune"][data-val="standard"]').click();
    await page.locator('.chip[data-role="points"][data-val="3.4"]').click();
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => card.dataset.points))]), ['3.4'], '3-point band only');
    await page.locator('.chip[data-role="points"][data-val="4.2"]').click();
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => card.dataset.points))]), ['4.2'], '4-point band only');
    const standardScores = await page.locator('.qcard').evaluateAll((cards) => cards.map((card) => Number(card.dataset.score)));
    await page.locator('.chip[data-role="tune"][data-val="hard"]').click();
    const hardScores = await page.locator('.qcard').evaluateAll((cards) => cards.map((card) => Number(card.dataset.score)));
    assert.ok(hardScores.reduce((sum, score) => sum + score, 0) > standardScores.reduce((sum, score) => sum + score, 0), '4-point harder mode raises total paper complexity');
    assert.ok(hardScores.some((score, index) => score > standardScores[index]), '4-point harder mode materially increases at least one question');
    await page.locator('.chip[data-role="ratio"][data-val="balanced"]').click();
    assert.deepEqual(
      await page.locator('.qcard').evaluateAll((cards) => cards.reduce((counts, card) => {
        counts[card.dataset.tune] = (counts[card.dataset.tune] || 0) + 1;
        return counts;
      }, {})),
      { easy: 5, standard: 10, hard: 5 },
      '20-question balanced paper uses the requested 25/50/25 ratio'
    );
    assert.equal(new URL(page.url()).searchParams.get('ratio'), 'balanced', 'difficulty ratio persists in the paper URL');
    await page.locator('.chip[data-role="area"][data-val="도형"]').click();
    assert.equal(await page.locator('#typeSelectionSummary').textContent(), '3개 유형 선택', 'area selects every available type in that area');
    assert.deepEqual((await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => card.dataset.gen))])).sort(), ['cube', 'rect', 'tri'], 'geometry area paper uses geometry types only');
    if (SCREENSHOT) await page.screenshot({ path: SCREENSHOT, fullPage: true });

    for (const [id, filename] of [
      ['repeat', 'g-repeat.js'], ['weekday', 'g-weekday.js'],
      ['inclusion', 'g-inclusion.js'], ['remainder', 'g-remainder.js'],
    ]) {
      const loaded = await page.evaluate((generatorId) => window.BANK_GENS.some((row) => row.id === generatorId), id);
      if (!loaded) await page.addScriptTag({ url: `http://127.0.0.1:${port}/bank/gens/${filename}` });
    }

    const samples = await page.evaluate(() => {
      const output = [];
      const core = window.BANK_CORE;
      for (const generator of window.BANK_GENS.filter((row) => row.reviewOnly !== true)) {
        for (let level = 1; level <= 5; level++) {
          for (let seed = 0; seed < 8; seed++) {
            const rng = core.mulberry32(core.hashString(`${generator.id}:${level}:${seed}`));
            const question = generator.gen(level, rng);
            const replayRng = core.mulberry32(core.hashString(`${generator.id}:${level}:${seed}`));
            const replay = generator.gen(level, replayRng);
            output.push({
              genId: generator.id,
              genVersion: generator.version || null,
              gradeBand: generator.gradeBand || null,
              contentConstraints: generator.contentConstraints || null,
              level,
              pointBand: question.pointBand,
              answer: question.answer,
              text: question.text,
              solution: question.solution,
              meta: question.meta,
              verification: question.verification,
              asset: {
                kind: question.asset && question.asset.kind,
                mimeType: question.asset && question.asset.mimeType,
                prefix: question.asset && question.asset.src.slice(0, 22),
                length: question.asset && question.asset.src.length,
                width: question.asset && question.asset.width,
                height: question.asset && question.asset.height,
                renderer: question.asset && question.asset.renderer,
                description: question.asset && question.asset.description,
              },
              reproducible: question.text === replay.text &&
                question.answer === replay.answer &&
                JSON.stringify(question.meta) === JSON.stringify(replay.meta) &&
                question.asset.src === replay.asset.src,
              hasSvgField: Object.prototype.hasOwnProperty.call(question, 'svg'),
              containsSvgMarkup: JSON.stringify(question).toLowerCase().includes('<svg'),
            });
          }
        }
      }
      const cube = window.BANK_GENS.find((generator) => generator.id === 'cube');
      return {
        output,
        cubeCounterexample: cube._minMaxFromViews(
          [[true, true], [true, true]],
          [1, 1],
          [1, 1],
        ),
        cubeCounterexampleIndependent: cube._minMaxFromViewsIndependent(
          [[true, true], [true, true]],
          [1, 1],
          [1, 1],
        ),
        generatorBands: Object.fromEntries(window.BANK_GENS.map((generator) => [generator.id, generator.pointBands])),
        generatorProfiles: Object.fromEntries(window.BANK_GENS.filter((generator) => generator.levelProfiles)
          .map((generator) => [generator.id, generator.levelProfiles])),
        generatorIds: window.BANK_GENS.map((generator) => generator.id),
        coreBands: core.POINT_BAND_BY_LEVEL,
      };
    });

    assert.equal(samples.output.length, 8 * 5 * 8, '8 public practice families × 5 levels × 8 seeds');
    assert.deepEqual(samples.generatorIds.filter((id) => !id.startsWith('final1-')).sort(), ['cube', 'inclusion', 'overlap-range-sum', 'path', 'rect', 'remainder', 'remainder-yes-no', 'repeat', 'tri', 'weekday']);
    assert.equal(samples.generatorIds.filter((id) => id.startsWith('final1-')).length, 28, '파이널 1회 검토 생성기는 별도 대량 검산에서 다룸');
    for (const question of samples.output) {
      assert.equal(question.asset.kind, 'raster', `${question.genId} raster kind`);
      assert.equal(question.asset.mimeType, 'image/png', `${question.genId} PNG MIME`);
      assert.equal(question.asset.prefix, 'data:image/png;base64,', `${question.genId} PNG data URL`);
      assert.ok(question.asset.length > 1000, `${question.genId} non-empty PNG`);
      assert.ok(question.asset.width >= 300 && question.asset.height >= 180, `${question.genId} raster dimensions`);
      assert.equal(question.asset.renderer, 'canvas-2d', `${question.genId} Canvas renderer`);
      assert.equal(question.hasSvgField, false, `${question.genId} no svg field`);
      assert.equal(question.containsSvgMarkup, false, `${question.genId} no SVG markup`);
      assert.equal(question.pointBand, POINT_BANDS[question.level], `${question.genId} Lv${question.level} point band`);
      assert.equal(question.verification.primary.answer, question.answer, `${question.genId} primary answer`);
      assert.equal(question.verification.independent.answer, question.answer, `${question.genId} independent answer`);
      assert.equal(question.verification.unique, true, `${question.genId} unique answer`);
      assert.equal(question.verification.validAnswerCount, 1, `${question.genId} one valid answer`);
      assert.equal(question.verification.visibleEvidence.passed, true, `${question.genId} visible evidence`);
      assert.equal(independentAnswer(question), question.answer, `${question.genId} external independent answer`);
      if (NEW_GENERATOR_IDS.includes(question.genId)) {
        assert.equal(question.genVersion, '1.0.0', `${question.genId} generator version`);
        assert.equal(question.gradeBand, '초2~초3', `${question.genId} elementary grade band`);
        assert.deepEqual(question.contentConstraints, { latinVariables: false, powers: false }, `${question.genId} content constraints`);
        assert.equal(question.reproducible, true, `${question.genId} fixed-seed reproduction`);
        assert.notEqual(question.verification.primary.method, question.verification.independent.method, `${question.genId} distinct proof methods`);
        assert.doesNotMatch(`${question.text} ${question.solution}`, /[A-Za-z]/, `${question.genId} no Latin variable in student text`);
        assert.doesNotMatch(`${question.text} ${question.solution}`, /제곱|[\^\u00b2\u00b3]/, `${question.genId} no powers in student text`);
        assert.doesNotMatch(question.asset.description || '', /[A-Za-z]/, `${question.genId} Korean figure description`);
      }
    }
    for (const [id, bands] of Object.entries(samples.generatorBands)) {
      if (!id.startsWith('final1-')) assert.deepEqual(bands, POINT_BANDS);
    }
    assert.deepEqual(samples.coreBands, POINT_BANDS);
    assert.deepEqual(samples.cubeCounterexample, { min: 4, max: 4 }, 'occupied top cells cannot have height zero');
    assert.deepEqual(samples.cubeCounterexampleIndependent, { min: 4, max: 4 }, 'independent cube solver agrees');
    const profiles = samples.generatorProfiles;
    for (let level = 2; level <= 5; level++) {
      assert.ok(profiles.repeat[level].patternMin > profiles.repeat[level - 1].patternMin, 'repeat block length rises');
      assert.ok(profiles.repeat[level].targetMin >= profiles.repeat[level - 1].targetMax, 'repeat target range rises');
      assert.ok(profiles.weekday[level].deltaMin > profiles.weekday[level - 1].deltaMin, 'weekday movement range rises');
      assert.ok(profiles.weekday[level].minMonthSpan >= profiles.weekday[level - 1].minMonthSpan, 'weekday boundary count does not fall');
      assert.ok(profiles.inclusion[level].totalMin > profiles.inclusion[level - 1].totalMin, 'inclusion number range rises');
      assert.ok(profiles.inclusion[level].extraConditionCount >= profiles.inclusion[level - 1].extraConditionCount, 'inclusion condition count does not fall');
      assert.ok(profiles.remainder[level].answerMin > profiles.remainder[level - 1].answerMin, 'remainder number range rises');
      assert.ok(profiles.remainder[level].conditionCount >= profiles.remainder[level - 1].conditionCount, 'remainder condition count does not fall');
    }
    assert.deepEqual(browserErrors, [], 'no browser runtime errors');

    if (NEW_PREVIEW_SCREENSHOT) {
      await page.evaluate(() => {
        document.head.innerHTML = '<meta charset="utf-8"><style>body{margin:0;padding:24px;background:#f3f4f6;font-family:"Malgun Gothic",sans-serif}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:#fff;border:1px solid #cbd5e1;border-radius:14px;padding:16px}.card h2{font-size:18px;margin:0 0 10px}.card p{font-size:13px;line-height:1.55}.card img{display:block;width:100%;height:auto;margin-top:10px}</style>';
        document.body.innerHTML = '<div class="grid" id="preview"></div>';
        const root = document.querySelector('#preview');
        ['repeat', 'weekday', 'inclusion', 'remainder'].forEach((id) => {
          const generator = window.BANK_GENS.find((row) => row.id === id);
          const rng = window.BANK_CORE.mulberry32(window.BANK_CORE.hashString(`${id}:5:preview`));
          const question = generator.gen(5, rng);
          const card = document.createElement('article');
          card.className = 'card';
          const heading = document.createElement('h2');
          heading.textContent = generator.name + ' · 5단계';
          const prompt = document.createElement('p');
          prompt.textContent = question.text;
          const image = document.createElement('img');
          image.src = question.asset.src;
          image.alt = question.asset.description;
          card.append(heading, prompt, image);
          root.appendChild(card);
        });
      });
      await page.screenshot({ path: NEW_PREVIEW_SCREENSHOT, fullPage: true });
    }

    console.log('PASS bank raster QA: 320 generated samples, PNG-only assets, independent answers, fixed-seed replay, cube Lv5 counterexample fixed');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
