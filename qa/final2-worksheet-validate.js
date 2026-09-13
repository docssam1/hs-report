'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank/data/final2-fixed90.json'), 'utf8'));
const OUTPUT = process.env.GFIELD_WORKSHEET_REVIEW_DIR || '';
const PDF_PATH = OUTPUT ? path.join(OUTPUT, 'final2-fixed90-both.pdf') : '';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const filename = path.resolve(ROOT, '.' + pathname);
    if (!filename.startsWith(ROOT + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    const mime = ({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[path.extname(filename)] || 'application/octet-stream';
    response.writeHead(200, {'content-type': mime, 'cache-control': 'no-store'});
    fs.createReadStream(filename).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function assertWatermarks(page) {
  for (const media of ['screen', 'print']) {
    await page.emulateMedia({media});
    const missing = await page.locator('#f1Pages .page:not(.duplex-blank)').evaluateAll((pages) => pages.flatMap((sheet, index) => {
      const layer = sheet.querySelector('.wm-layer.wm-active');
      if (!layer || layer.querySelectorAll('.wm-tile').length !== 32 || !layer.textContent.includes('지필드 영재교육')) return [index];
      return Number(getComputedStyle(layer).opacity) < 0.1 ? [index] : [];
    }));
    assert.deepEqual(missing, [], media + ': every content page has a watermark');
  }
  await page.emulateMedia({media: null});
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({headless: true, ...(BROWSER_EXECUTABLE ? {executablePath: BROWSER_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 1100}});
    const errors = [];
    const failedRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Failed to load resource: net::ERR_FAILED/.test(message.text())) errors.push(message.text());
    });
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    await page.route('https://**/*', (route) => route.abort());
    await page.addInitScript(() => localStorage.setItem('gfield_student', '검수용가상학생'));
    const base = `http://127.0.0.1:${server.address().port}/bank/index.html`;
    const ready = () => page.waitForFunction(() => {
      const button = document.querySelector('#final1Worksheet #btnPrint');
      return button && !button.disabled;
    });

    await page.goto(base + '?bank=final2&printMode=both#student=검수용가상학생', {waitUntil: 'networkidle'});
    await ready();
    const expected = DATA.items.slice().sort((a, b) => a.variantNo - b.variantNo || a.sourceNo - b.sourceNo);
    assert.match(await page.locator('.f1-title').textContent(), /파이널 2회 약점 유형/);
    assert.match(await page.locator('.cover-page h1').textContent(), /파이널 2회/);
    assert.match(await page.locator('.cover-page').textContent(), /검수용가상학생/);
    assert.equal(await page.locator('.cover-page input[type=checkbox]').count(), 30);
    assert.equal(await page.locator('.qcard').count(), 90);
    assert.equal(await page.locator('.question-page').count(), 15);
    assert.equal(await page.locator('.solution-card').count(), 90);
    assert.ok(await page.locator('.answer-page').count() <= 30, 'student-readable detailed answers remain compact without fixed writing-space slots');
    assert.equal(await page.locator('.duplex-blank').count(), 0, 'cover and 15 question pages already make an even number');
    assert.deepEqual(
      await page.locator('.qmeta.fixed-item').evaluateAll((nodes) => nodes.map((node) => node.dataset.itemId)),
      expected.map((item) => item.id),
      'fixed items keep the approved variant-first order'
    );
    assert.deepEqual(await page.locator('.question-page').evaluateAll((pages) => pages.map((sheet) => sheet.querySelectorAll('.qcard').length)), Array(15).fill(6));
    assert.equal(await page.locator('.question-page .ans').count(), 0, 'answers are not shown on question pages');
    assert.equal(await page.locator('.question-page img').count(), 27, 'one prompt figure for each visual item');
    assert.equal(await page.locator('.solution-card img').count(), 6, 'three top-view answers and three road explanations have solution figures');
    assert.equal(await page.locator('.solution-card[data-source-no="28"] img').count(),3);
    assert.ok(await page.locator('.solution-card[data-source-no="28"] img').evaluateAll(images=>images.every(image=>image.getBoundingClientRect().width>=350)),'road solution maps are legible');
    assert.ok(await page.locator('.solution-card[data-source-no="28"]').evaluateAll(cards=>cards.every(card=>card.querySelector('ol').children.length===3&&card.querySelector('ol[start="4"]'))),'road image sits between explanation and minimum proof');
    assert.equal(await page.locator('.qcard').evaluateAll((cards) => cards.filter((card) => card.querySelectorAll('img').length > 1).length), 0, 'a prompt never repeats its figure');
    assert.equal(await page.locator('.qconditions').count(), 0, 'numbered restatement and hint lists are never printed below a problem');
    assert.equal(await page.locator('.f1-qgiven').count(), 6, 'only Q15 and Q19 keep indispensable source data for three variants each');
    assert.deepEqual(await page.locator('.f1-qgiven').evaluateAll((blocks) => [...new Set(blocks.map((block) => Number(block.closest('.qcard').dataset.sourceNo)))].sort((a, b) => a - b)), [15, 19], 'separate data blocks belong only to Q15 and Q19');
    assert.equal(await page.locator('.qcard[data-source-no="16"] .qfigure').evaluateAll((figures) => figures.filter((figure) => /×\s*(2|10)/.test(figure.textContent || '')).length), 0, 'Q16 drawings do not repeat quantities already stated in the prompt');
    assert.ok(await page.locator('.qcard[data-source-no="28"] .qfigure img').first().evaluate((image) => image.getBoundingClientRect().height > 140), 'Q28 graph is large enough to read');
    assert.ok(await page.locator('.qcard[data-source-no="28"] .qtext').first().evaluate((text) => parseFloat(getComputedStyle(text).fontSize) >= 15.5), 'Q28 prompt stays enlarged while its graph remains readable');
    const typeRules = await page.evaluate(() => {
      const style = (selector) => getComputedStyle(document.querySelector(selector));
      const body = style('body');
      const prompt = style('.qtext');
      const meta = style('.qmeta');
      const solution = style('.f1-solution p');
      const primary = style('#btnPrint');
      const cover = style('.cover-page');
      return {
        fontFamily: body.fontFamily,
        promptSize: parseFloat(prompt.fontSize),
        promptLineHeight: parseFloat(prompt.lineHeight) / parseFloat(prompt.fontSize),
        metaSize: parseFloat(meta.fontSize),
        solutionSize: parseFloat(solution.fontSize),
        solutionLineHeight: parseFloat(solution.lineHeight) / parseFloat(solution.fontSize),
        primaryBackground: primary.backgroundColor,
        coverBackground: cover.backgroundColor
      };
    });
    assert.match(typeRules.fontFamily, /Pretendard.*Noto Sans KR.*Malgun Gothic/, 'one approved Korean font chain is shared by the fixed worksheet');
    assert.ok(typeRules.promptSize >= 16 && typeRules.promptLineHeight >= 1.6, 'problem text meets the elementary reading profile');
    assert.ok(typeRules.metaSize >= 10, 'source and score metadata remain legible');
    assert.ok(typeRules.solutionSize >= 14 && typeRules.solutionLineHeight >= 1.6, 'student-facing solutions use the student reading size');
    assert.equal(typeRules.primaryBackground, 'rgb(36, 86, 196)', 'the single primary action uses GFIELD blue');
    assert.equal(typeRules.coverBackground, 'rgb(255, 255, 255)', 'the cover stays white, not yellow or beige');
    assert.deepEqual(await page.locator('#f1Pages img').evaluateAll((images) => images.filter((image) => !image.complete || !image.naturalWidth || !image.naturalHeight).map((image) => image.alt)), [], 'all figures decode');
    assert.match(await page.locator('.solution-card[data-answer-id="final2-q13-v3"]').textContent(), /15가지/);
    assert.match(await page.locator('.solution-card[data-answer-id="final2-q13-v3"]').textContent(), /3가지.*5가지.*3×5=15가지/s);
    assert.doesNotMatch(await page.locator('#final1Worksheet').innerText(), /undefined|NaN|\[object Object\]/);

    const geometry = await page.locator('.question-page').evaluateAll((pages) => pages.flatMap((sheet, pageIndex) => {
      const cards = [...sheet.querySelectorAll('.qcard')];
      const rects = cards.map((card) => card.getBoundingClientRect());
      return cards.flatMap((card, index) => {
        const rect = rects[index];
        const answerLine = card.querySelector('.answerline').getBoundingClientRect();
        const problems = [];
        if (card.scrollWidth > card.clientWidth + 2 || answerLine.bottom > rect.bottom + 2) problems.push([pageIndex, index, card.querySelector('.qmeta').dataset.itemId, 'overflow', card.scrollHeight - card.clientHeight, Math.round(answerLine.bottom - rect.bottom)]);
        if (index % 2 && Math.abs(rect.top - rects[index - 1].top) > 1) problems.push([pageIndex, index, 'row alignment']);
        if (Math.abs(rect.height - rects[0].height) > 2) problems.push([pageIndex, index, 'unequal cell']);
        return problems;
      });
    }));
    assert.deepEqual(geometry, [], 'six equal solving cells fit each page');
    const answerGeometry = await page.locator('.answer-page:not(.quick-page)').evaluateAll((pages) => pages.flatMap((sheet, pageIndex) => {
      const cards = [...sheet.querySelectorAll('.solution-card')];
      if (!cards.length) return [[pageIndex, 'empty answer page']];
      const sheetRect = sheet.getBoundingClientRect();
      const bottomPadding = parseFloat(getComputedStyle(sheet).paddingBottom) || 0;
      const lastRect = cards[cards.length - 1].getBoundingClientRect();
      return lastRect.bottom > sheetRect.bottom - bottomPadding + 2 ? [[pageIndex, 'answer overflow', Math.round(lastRect.bottom - sheetRect.bottom + bottomPadding)]] : [];
    }));
    assert.deepEqual(answerGeometry, [], 'detailed answers stay inside their compact pages');
    await assertWatermarks(page);

    if (OUTPUT) {
      fs.mkdirSync(OUTPUT, {recursive: true});
      await page.screenshot({path: path.join(OUTPUT, 'final2-fixed90-screen.png'), fullPage: true});
      await page.pdf({path: PDF_PATH, preferCSSPageSize: true, printBackground: true});
    }

    for (const [band, count] of [['2.7', 36], ['3.4', 30], ['4.2', 24]]) {
      await page.locator(`#final1Worksheet [data-role="points"][data-val="${band}"]`).click();
      await ready();
      assert.equal(await page.locator('.qcard').count(), count, band + ': filtered problem count');
      assert.equal(await page.locator(`.qcard:not([data-points="${band}"])`).count(), 0, band + ': no other band');
    }

    const subset = 'final2-q05,final2-q13,final2-q28';
    await page.goto(base + '?bank=final2&practice=wrong&source=final%7C2&gens=' + subset + '&points=all&printMode=both#student=검수학생', {waitUntil: 'networkidle'});
    await ready();
    assert.equal(await page.locator('.qcard').count(), 9, 'three variants for each selected wrong answer');
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => [...new Set(cards.map((card) => Number(card.dataset.sourceNo)))].sort((a, b) => a - b)), [5, 13, 28]);
    assert.equal(await page.locator('.question-page').count(), 2);
    assert.equal(await page.locator('.duplex-blank').count(), 1, 'answers begin on a new front side after an odd page count');
    for (const mode of ['questions', 'answers', 'both', 'quick']) {
      await page.locator('#printMode').selectOption(mode);
      await ready();
      assert.equal(await page.locator('.question-page').count(), ['questions', 'both'].includes(mode) ? 2 : 0, mode + ': question pages');
      assert.equal(await page.locator('.solution-card').count(), ['answers', 'both'].includes(mode) ? 9 : 0, mode + ': solution count');
      assert.equal(await page.locator('.quick-page').count(), mode === 'quick' ? 1 : 0, mode + ': quick answer page');
    }

    await page.locator('#printMode').selectOption('both');
    await ready();
    await page.setViewportSize({width: 390, height: 844});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, '390px has no horizontal overflow');
    assert.deepEqual(await page.locator('.qcard').evaluateAll((cards) => cards.filter((card) => card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2).map((card) => card.dataset.index)), [], 'mobile cards do not hide content');

    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=2&go=answer&preview=1`, {waitUntil: 'domcontentloaded'});
    await page.locator('.abtn').first().waitFor();
    for (let no = 1; no <= 30; no += 1) {
      if (![5, 13, 28].includes(no)) await page.locator('.abtn').nth(no - 1).click();
    }
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();
    assert.equal(await page.locator('.wp-item').count(), 3, 'the report offers only the three wrong source items');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice = await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl = new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('bank'), 'final2');
    assert.equal(practiceUrl.searchParams.get('source'), 'final|2');
    assert.equal(practiceUrl.searchParams.get('gens'), 'final2-q05,final2-q13,final2-q28');
    assert.equal(await practice.locator('.qcard').count(), 9, 'the real report link opens exactly three variants per wrong item');
    await practice.close();

    await page.goto(base + '?bank=final2&gens=final1-q01', {waitUntil: 'networkidle'});
    assert.equal(await page.locator('.qcard').count(), 0, 'a Final1 id cannot enter the Final2 bank');
    assert.equal(await page.locator('#btnPrint').isDisabled(), true, 'invalid scope cannot print');
    assert.ok(failedRequests.every((url) => /^https:\/\//.test(url)), 'only deliberately blocked external requests may fail');
    assert.deepEqual(errors, [], 'browser errors');
    console.log('PASS Final2 worksheet: fixed 90, no numbered helper summaries, only indispensable Q15/Q19 data blocks, 6 per page, 4 print modes, duplex answer start, 27 prompt figures once each, detailed answers, watermark, 390px, fail-closed round scope' + (PDF_PATH ? '; PDF=' + PDF_PATH : ''));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
