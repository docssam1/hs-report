'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SCREENSHOT_DIR = process.env.GFIELD_QA_SCREENSHOT_DIR || '';
const STUDENT = '검수학생';

async function capture(page, filename) {
  if (!SCREENSHOT_DIR) return;
  const directory = path.resolve(ROOT, SCREENSHOT_DIR);
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, filename), fullPage: false });
}

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
  await context.addInitScript(() => {
    window.print = () => {};
    window.__qaLoadedVideos = [];
    window.YT = {
      PlayerState: { ENDED: 0 },
      Player: function Player(_id, config) {
        const instance = {
          loadVideoById(payload) { window.__qaLoadedVideos.push(payload); },
          getCurrentTime() { return 0; },
          destroy() {},
        };
        window.__qaEndVideo = () => config.events.onStateChange({ data: window.YT.PlayerState.ENDED, target: instance });
        setTimeout(() => config.events.onReady({ target: instance }), 0);
        return instance;
      },
    };
  });
  const page = await context.newPage();

  try {
    await page.route('https://**/*', (route) => route.abort());
    await page.route('**/data.js*', async (route) => {
      const source = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
      const qaData = `\n;(function(){var D=window.GFIELD_DATA;var n=${JSON.stringify(STUDENT)};`+
        `if(!D.students.includes(n))D.students.push(n);D.studentTypes[n]='online';`+
        `['파이널 모의고사','최종 모의고사','추가 모의고사','약점 유형','개념 교재'].forEach(function(f){if(!Array.isArray(D.archiveAccess[f]))D.archiveAccess[f]=[];if(!D.archiveAccess[f].includes(n))D.archiveAccess[f].push(n);});`+
        `D.archiveProductAccess=D.archiveProductAccess||{};['concept-basic','concept-core'].forEach(function(k){if(!Array.isArray(D.archiveProductAccess[k]))D.archiveProductAccess[k]=[];if(!D.archiveProductAccess[k].includes(n))D.archiveProductAccess[k].push(n);});})();`;
      await route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: source + qaData });
    });

    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    if (await page.locator('#skipBtn').count()) await page.click('#skipBtn');
    await page.fill('#name-input', STUDENT);
    await page.click('#login .enter');
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.click('.nav-btn[data-v="archive"]');
    await page.waitForSelector('#view-archive:not(.hidden)');

    const originalRound1Card = page.getByRole('button', { name: /초등선발 대비 원본형 모의고사 1회/ });
    const originalRound2Card = page.getByRole('button', { name: /초등선발 대비 원본형 모의고사 2회/ });
    assert.equal(await originalRound1Card.locator('.desc').textContent(), '80분 · 30문항 · 100점', '원본형 1회 카드 시험 정보');
    assert.equal(await originalRound2Card.locator('.desc').textContent(), '80분 · 30문항 · 100점', '원본형 2회 카드 시험 정보');

    await page.getByRole('button', { name: /파이널 실전 모의고사 1회/ }).click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 8, '파이널 1회 서재 이미지 쪽수');
    assert.equal(await page.locator('#bookviewer .wm3 span').count(), 24, '파이널 1회 워터마크 수');
    assert.equal(await page.locator('#bookviewer .wm3 span').evaluateAll(nodes => nodes.filter(node => Number(getComputedStyle(node).opacity) > 0).length), 8, '파이널 화면은 쪽마다 흐린 워터마크 한 줄');
    assert.equal(await page.locator('#bookviewer .bv-copyright').count(), 6, '파이널 1회 누락 꼬리말 보정 수');
    assert.equal(await page.getByRole('button', { name: /인쇄/ }).count(), 1, '파이널 1회 서재 인쇄 버튼');
    assert.equal(await page.getByRole('link', { name: /시험지 보기·인쇄/ }).count(), 0, '파이널 중복 시험지 링크 제거');
    assert.equal(await page.locator('#bookviewer .bv-stage.split .bv-vid iframe').count(), 1, '파이널 시험지·영상 결합 뷰어');
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
    assert.equal(await page.locator('#bookviewer .wm3 span').evaluateAll(nodes => nodes.filter(node => Number(getComputedStyle(node).opacity) > 0).length), 6, '최종 화면은 쪽마다 흐린 워터마크 한 줄');
    assert.equal(await page.locator('#bookviewer .bv-copyright').count(), 0, '최종 1회 원본 꼬리말 중복 방지');
    assert.equal(await page.getByRole('button', { name: /인쇄/ }).count(), 1, '최종 1회 서재 인쇄 버튼');
    assert.equal(await page.getByRole('link', { name: /시험지 보기·인쇄/ }).count(), 0, '최종 중복 시험지 링크 제거');
    const lastVideo = page.locator('#bookviewer .bv-stage.split .bv-vid iframe');
    assert.equal(await lastVideo.count(), 1, '최종 시험지·영상 결합 뷰어');
    assert.match(await lastVideo.getAttribute('src'), /youtube\.com\/embed\/T9LbJLG2BRQ/, '최종 1회 전체 풀이 영상');
    await expectedHref(page.getByRole('link', { name: /답안·해설/ }), /final\.html\?set=last&round=1&go=answer/, '최종 답안');
    await expectedHref(page.getByRole('link', { name: /성적 입력/ }), /last1-entry\.html\?round=1/, '최종 성적 입력');
    await expectedHref(page.getByRole('link', { name: /성적 확인·진단/ }), /last1-result\.html\?round=1/, '최종 성적 진단');

    await page.click('#bookviewer .bv-back');
    await originalRound1Card.click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 6, '원본형 1회 서재 이미지 쪽수');
    assert.equal(await page.locator('#bookviewer .wm3 span').count(), 18, '원본형 1회 워터마크 수');
    assert.equal(await page.locator('#bookviewer .wm3 span').evaluateAll(nodes => nodes.filter(node => Number(getComputedStyle(node).opacity) > 0).length), 6, '원본형 화면은 쪽마다 흐린 워터마크 한 줄');
    assert.equal(await page.getByRole('link', { name: /정답지 PDF/ }).getAttribute('href'), 'output/pdf/hwangso-original-form-mock-01-rebuilt-answer.pdf', '원본형 1회 정답 링크');
    await capture(page, 'original-form-viewer-desktop.png');
    const originalPopupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /인쇄/ }).click();
    const originalPrintPage = await originalPopupPromise;
    await originalPrintPage.waitForSelector('.pg', { state: 'attached' });
    assert.equal(await originalPrintPage.locator('.pg').count(), 6, '원본형 1회 인쇄 창 쪽수');
    assert.equal(await originalPrintPage.locator('.wm span').count(), 18, '원본형 1회 인쇄 워터마크 수');
    assert.equal(await originalPrintPage.locator('.wm span').first().textContent(), `${STUDENT} · 지필드 영재교육`, '원본형 인쇄 학생 워터마크');
    await originalPrintPage.close();

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewerRight: document.querySelector('#bookviewer').getBoundingClientRect().right,
    }));
    assert.ok(mobile.documentWidth <= mobile.viewport + 1, '서재 모바일 가로 넘침');
    assert.ok(mobile.viewerRight <= mobile.viewport + 1, '서재 뷰어 모바일 너비');
    await capture(page, 'original-form-viewer-mobile.png');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.click('#bookviewer .bv-back');
    await originalRound2Card.click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 6, '원본형 2회 서재 이미지 쪽수');
    assert.equal(await page.locator('#bookviewer .wm3 span').count(), 18, '원본형 2회 워터마크 수');
    assert.equal(await page.getByRole('link', { name: /정답지 PDF/ }).getAttribute('href'), 'output/pdf/hwangso-original-form-mock-02-rebuilt-answer.pdf', '원본형 2회 정답 링크');
    const originalRound2PopupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /인쇄/ }).click();
    const originalRound2PrintPage = await originalRound2PopupPromise;
    await originalRound2PrintPage.waitForSelector('.pg', { state: 'attached' });
    assert.equal(await originalRound2PrintPage.locator('.pg').count(), 6, '원본형 2회 인쇄 창 쪽수');
    await originalRound2PrintPage.close();
    await page.click('#bookviewer .bv-back');

    await page.getByRole('button', { name: /Thinking Core · 생각하는 황소 대비 심화 개념/ }).click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-pg').count(), 96, 'Thinking Core 영상 순서 수정본 쪽수');
    await page.waitForFunction(() => document.querySelectorAll('#bv-actions button.bv-act').length === 11);
    const thinkingCoreLabels = await page.locator('#bv-actions button.bv-act').allTextContents();
    assert.ok(thinkingCoreLabels.some((label) => label.includes('CH2 학습영상')), 'CH2 학습영상 통합 버튼 표시');
    assert.ok(!thinkingCoreLabels.some((label) => label.includes('CH2 학습영상 2')), 'CH2 학습영상 2 별도 버튼 제거');
    assert.ok(!thinkingCoreLabels.some((label) => label.includes('14·15·16번')), 'CH2 Semi 14·15·16번 별도 버튼 제거');
    await page.evaluate(() => { window.__qaLoadedVideos = []; });
    await page.getByRole('button', { name: /CH2 학습영상$/ }).click();
    await page.evaluate(() => window.__qaEndVideo());
    await page.waitForFunction(() => window.__qaLoadedVideos.some((video) => video.videoId === 'jYu8jXkawrA'));
    assert.deepEqual(
      await page.evaluate(() => window.__qaLoadedVideos.map((video) => video.videoId)),
      ['TxEkE7zNu8I', 'jYu8jXkawrA'],
      'CH2 학습영상 1 종료 후 2 자동 연결',
    );
    await page.evaluate(() => { window.__qaLoadedVideos = []; });
    await page.getByRole('button', { name: /CH2 Semi 2회$/ }).click();
    await page.evaluate(() => window.__qaEndVideo());
    await page.waitForFunction(() => window.__qaLoadedVideos.some((video) => video.videoId === 'AT5xxcA0DSU'));
    assert.deepEqual(
      await page.evaluate(() => window.__qaLoadedVideos.map((video) => video.videoId)),
      ['W6GnRtzez24', 'AT5xxcA0DSU'],
      'CH2 Semi 1~13 종료 후 14~16 자동 연결',
    );
    const desktopToolbar = await page.evaluate(() => {
      const actions = document.querySelector('#bv-actions');
      const buttons = [...actions.querySelectorAll('.bv-act')];
      const rects = buttons.map((node) => node.getBoundingClientRect());
      const rowTops = [];
      for (const rect of rects) {
        if (!rowTops.some((top) => Math.abs(top - rect.top) <= 3)) rowTops.push(rect.top);
      }
      return {
        count: buttons.length,
        rows: rowTops.length,
        viewport: innerWidth,
        minLeft: Math.min(...rects.map((rect) => rect.left)),
        maxRight: Math.max(...rects.map((rect) => rect.right)),
        actionClientWidth: actions.clientWidth,
        actionScrollWidth: actions.scrollWidth,
      };
    });
    assert.equal(desktopToolbar.count, 11, '개념 교재 통합 버튼 수');
    assert.equal(desktopToolbar.rows, 2, '1440px 다중 버튼은 정확히 두 줄');
    assert.ok(desktopToolbar.minLeft >= -1 && desktopToolbar.maxRight <= desktopToolbar.viewport + 1, '1440px 버튼이 화면 안에 표시됨');
    assert.ok(desktopToolbar.actionScrollWidth <= desktopToolbar.actionClientWidth + 1, '1440px 버튼 영역 가로 넘침 없음');
    await capture(page, 'thinking-core-toolbar-desktop.png');

    await page.setViewportSize({ width: 390, height: 844 });
    const compactToolbar = await page.evaluate(() => {
      const actions = document.querySelector('#bv-actions');
      const buttons = [...actions.querySelectorAll('.bv-act')];
      const rects = buttons.map((node) => node.getBoundingClientRect());
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewerRight: document.querySelector('#bookviewer').getBoundingClientRect().right,
        nameDisplay: getComputedStyle(document.querySelector('.bv-name')).display,
        minLeft: Math.min(...rects.map((rect) => rect.left)),
        maxRight: Math.max(...rects.map((rect) => rect.right)),
        maxHeight: Math.max(...rects.map((rect) => rect.height)),
        maxFontSize: Math.max(...buttons.map((node) => parseFloat(getComputedStyle(node).fontSize))),
        actionClientWidth: actions.clientWidth,
        actionScrollWidth: actions.scrollWidth,
      };
    });
    assert.ok(compactToolbar.minLeft >= -1 && compactToolbar.maxRight <= compactToolbar.viewport + 1, '모바일 모든 버튼이 화면 안에 표시됨');
    assert.ok(compactToolbar.documentWidth <= compactToolbar.viewport + 1 && compactToolbar.viewerRight <= compactToolbar.viewport + 1, '모바일 뷰어 가로 넘침 없음');
    assert.ok(compactToolbar.actionScrollWidth <= compactToolbar.actionClientWidth + 1, '모바일 버튼 영역 가로 넘침 없음');
    assert.ok(compactToolbar.maxFontSize <= 10 && compactToolbar.maxHeight <= 24, '모바일 버튼 크기 축소');
    assert.equal(compactToolbar.nameDisplay, 'none', '모바일에서 교재명 숨김');
    await capture(page, 'thinking-core-toolbar-mobile.png');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.click('#bookviewer .bv-back');
    await page.getByRole('button', { name: /필즈 중급 상 CH2 수와 숫자의 개수/ }).click();
    await page.waitForSelector('#bookviewer.open');
    assert.equal(await page.locator('#bookviewer .bv-stage.split .bv-vid iframe').count(), 1, 'PDF 교재 영상 결합 뷰어');
    assert.equal(await page.locator('#bookviewer .bv-doc iframe').count(), 1, 'PDF 교재 iframe');
    assert.equal(await page.locator('#bookviewer .bv-doc .bv-wm span').count(), 3, 'PDF 교재 워터마크 세 줄 구성');
    assert.equal(await page.locator('#bookviewer .bv-doc .bv-wm span').evaluateAll(nodes => nodes.filter(node => Number(getComputedStyle(node).opacity) > 0).length), 1, 'PDF 교재 화면은 흐린 워터마크 한 줄');

    console.log('PASS library final/last/original-form-1·2/PDF viewer, watermark, print, diagnosis, online result links');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
