'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const STUDENT = '검수학생';

function expectedHref(locator, pattern, label) {
  return locator.getAttribute('href').then((href) => {
    assert.ok(href, `${label} href 누락`);
    assert.match(href, pattern, `${label} 경로`);
    assert.match(decodeURIComponent(href), /name=검수학생/, `${label} 학생명 전달`);
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => { window.print = () => {}; });
  const page = await context.newPage();

  try {
    await page.route('https://**/*', (route) => route.abort());
    await page.route('**/data.js*', async (route) => {
      const source = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
      const qaData = `\n;(function(){var D=window.GFIELD_DATA;var n=${JSON.stringify(STUDENT)};`+
        `if(!D.students.includes(n))D.students.push(n);D.studentTypes[n]='online';`+
        `['파이널 모의고사','최종 모의고사'].forEach(function(f){if(!Array.isArray(D.archiveAccess[f]))D.archiveAccess[f]=[];if(!D.archiveAccess[f].includes(n))D.archiveAccess[f].push(n);});})();`;
      await route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: source + qaData });
    });

    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    if (await page.locator('#skipBtn').count()) await page.click('#skipBtn');
    await page.fill('#name-input', STUDENT);
    await page.click('#login .enter');
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.click('.nav-btn[data-v="archive"]');
    await page.waitForSelector('#view-archive:not(.hidden)');

    await page.getByRole('button', { name: /파이널 실전 모의고사 1회/ }).click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 8, '파이널 1회 서재 이미지 쪽수');
    assert.equal(await page.locator('#bookviewer .wm3 span').count(), 24, '파이널 1회 워터마크 수');
    assert.equal(await page.locator('#bookviewer .bv-copyright').count(), 6, '파이널 1회 누락 꼬리말 보정 수');
    assert.equal(await page.getByRole('button', { name: /인쇄/ }).count(), 1, '파이널 1회 서재 인쇄 버튼');
    await expectedHref(page.getByRole('link', { name: /시험지 보기·인쇄/ }), /final\.html\?round=1&go=paper/, '파이널 시험지');
    await expectedHref(page.getByRole('link', { name: /오답 입력·진단/ }), /final\.html\?round=1&go=answer/, '파이널 진단');
    await expectedHref(page.getByRole('link', { name: /답안·교재 연결표/ }), /answer\.html\?set=final&round=1/, '파이널 답안');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /인쇄/ }).click();
    const printPage = await popupPromise;
    await printPage.waitForSelector('.pg', { state: 'attached' });
    assert.equal(await printPage.locator('.pg').count(), 8, '파이널 1회 인쇄 창 쪽수');
    assert.equal(await printPage.locator('.wm span').count(), 24, '파이널 1회 인쇄 워터마크 수');
    assert.equal(await printPage.locator('.copy').count(), 6, '파이널 1회 인쇄 누락 꼬리말 보정 수');
    assert.equal(await printPage.locator('.wm span').first().textContent(), `${STUDENT} · 지필드 영재교육`, '파이널 인쇄 학생 워터마크');
    assert.ok(Number(await printPage.locator('.wm span').first().evaluate((node) => getComputedStyle(node).opacity)) >= 0.12, '파이널 인쇄 워터마크 가시성');
    await printPage.close();
    await page.click('#bookviewer .bv-back');

    await page.getByRole('button', { name: /최종 실전 모의고사 1회/ }).click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 6, '최종 1회 서재 이미지 쪽수');
    assert.equal(await page.locator('#bookviewer .wm3 span').count(), 18, '최종 1회 워터마크 수');
    assert.equal(await page.locator('#bookviewer .bv-copyright').count(), 0, '최종 1회 원본 꼬리말 중복 방지');
    assert.equal(await page.getByRole('button', { name: /인쇄/ }).count(), 1, '최종 1회 서재 인쇄 버튼');
    await expectedHref(page.getByRole('link', { name: /시험지 보기·인쇄/ }), /final\.html\?set=last&round=1&go=paper/, '최종 시험지');
    await expectedHref(page.getByRole('link', { name: /답안·해설/ }), /final\.html\?set=last&round=1&go=answer/, '최종 답안');
    await expectedHref(page.getByRole('link', { name: /성적 입력/ }), /last1-entry\.html\?round=1/, '최종 성적 입력');
    await expectedHref(page.getByRole('link', { name: /성적 확인·진단/ }), /last1-result\.html\?round=1/, '최종 성적 진단');

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewerRight: document.querySelector('#bookviewer').getBoundingClientRect().right,
    }));
    assert.ok(mobile.documentWidth <= mobile.viewport + 1, '서재 모바일 가로 넘침');
    assert.ok(mobile.viewerRight <= mobile.viewport + 1, '서재 뷰어 모바일 너비');

    console.log('PASS library final/last viewer, watermark, print, diagnosis, online result links');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
