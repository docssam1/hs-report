const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const SCREENSHOT_DIR = process.env.GFIELD_QA_SCREENSHOT_DIR || '';

function pageMonitor(page) {
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  return failures;
}

async function waitForPaperImages(page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('.paper-image-page img'));
    return images.length === 6 && images.every(image => image.complete && image.naturalWidth > 0);
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  try {
    for (const [round, expectedCorrections] of Object.entries({ '3': [8, 11], '4': [19] })) {
      const page = await context.newPage();
      const failures = pageMonitor(page);
      const paperUrl = `${BASE_URL}/final.html?set=last&round=${round}&name=${encodeURIComponent('검수학생')}&go=paper`;
      await page.goto(paperUrl, { waitUntil: 'networkidle' });
      await page.waitForSelector('.paper-correction-page');
      await waitForPaperImages(page);

      const structure = await page.$$eval('.paper-stack > section', nodes => nodes.map(node => ({
        className: node.className,
        page: node.getAttribute('data-page'),
      })));
      assert.equal(structure.length, 7, `round ${round} total printed pages`);
      assert.match(structure[0].className, /paper-correction-page/);
      assert.equal(structure[0].page, 'corrections');
      assert.deepEqual(structure.slice(1).map(item => item.page), ['1', '2', '3', '4', '5', '6']);

      const correctionNumbers = await page.$$eval('[data-correction-qno]', nodes => nodes.map(node => Number(node.dataset.correctionQno)));
      assert.deepEqual(correctionNumbers, expectedCorrections, `round ${round} correction numbers`);
      assert.equal(await page.locator('.paper-name').first().textContent(), '검수학생');
      assert.equal(await page.locator('.paper-image-page').count(), 6);
      assert.equal(await page.locator('.paper-lock').count(), 0);

      if (SCREENSHOT_DIR) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        await page.locator('.paper-correction-page').screenshot({
          path: path.join(SCREENSHOT_DIR, `last-${round}-correction-desktop.png`),
        });
      }

      await page.emulateMedia({ media: 'print' });
      const printStyle = await page.locator('.paper-correction-page').evaluate(node => {
        const style = getComputedStyle(node);
        return {
          width: parseFloat(style.width),
          height: parseFloat(style.height),
          breakAfter: style.breakAfter,
          pageBreakAfter: style.pageBreakAfter,
        };
      });
      assert.ok(printStyle.width >= 792 && printStyle.width <= 795, `round ${round} A4 width`);
      assert.ok(printStyle.height >= 1121 && printStyle.height <= 1124, `round ${round} A4 height`);
      assert.ok(printStyle.breakAfter === 'page' || printStyle.pageBreakAfter === 'always', `round ${round} page break`);

      await page.emulateMedia({ media: 'screen' });
      await page.setViewportSize({ width: 390, height: 844 });
      const mobile = await page.evaluate(() => ({
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        correctionRight: document.querySelector('.paper-correction-page').getBoundingClientRect().right,
      }));
      assert.ok(mobile.documentWidth <= mobile.viewport + 1, `round ${round} mobile horizontal overflow`);
      assert.ok(mobile.correctionRight <= mobile.viewport + 1, `round ${round} correction mobile width`);
      if (SCREENSHOT_DIR) {
        await page.locator('.paper-correction-page').screenshot({
          path: path.join(SCREENSHOT_DIR, `last-${round}-correction-mobile.png`),
        });
      }
      assert.deepEqual(failures, [], `round ${round} browser errors`);
      await page.close();
    }

    const timerPage = await context.newPage();
    const timerFailures = pageMonitor(timerPage);
    await timerPage.goto(`${BASE_URL}/final.html?set=last&round=4&name=${encodeURIComponent('검수학생')}`, { waitUntil: 'networkidle' });
    await timerPage.waitForSelector('#btnTimer');
    assert.match(await timerPage.locator('.examinfo').innerText(), /90분/);
    await timerPage.click('#btnTimer');
    await timerPage.waitForSelector('#tm');
    assert.equal(await timerPage.locator('#tm').textContent(), '90:00');
    assert.deepEqual(timerFailures, [], 'timer browser errors');
    await timerPage.close();

    for (const [round, answers] of Object.entries({
      '3': { 8: '오후 3시 20분', 11: '546알' },
      '4': { 19: '㉠ 8 · ㉡ 7 · ㉢ 1 · ㉣ 5 · ㉤ 6 · ㉥ 3 · ㉦ 2 · ㉧ 4' },
    })) {
      const page = await context.newPage();
      const failures = pageMonitor(page);
      await page.goto(`${BASE_URL}/last-answer.html?round=${round}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#rows tr');
      assert.equal(await page.locator('#rows tr').count(), 30, `round ${round} answer rows`);
      assert.equal(await page.locator('.lock').count(), 0, `round ${round} pending locks`);
      for (const [questionNo, answer] of Object.entries(answers)) {
        assert.equal(await page.locator(`#rows tr:nth-child(${questionNo}) .ans`).textContent(), answer);
      }
      assert.deepEqual(failures, [], `round ${round} answer browser errors`);
      await page.close();
    }

    console.log('PASS final rounds 3-4 desktop/mobile/print/timer/answers');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
