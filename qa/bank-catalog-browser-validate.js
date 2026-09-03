'use strict';

const assert = require('node:assert/strict');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  try {
    await page.goto(`${BASE_URL}/bank/catalog.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => /270문항$/.test(document.querySelector('#result-status')?.textContent || ''));
    assert.equal(await page.getByRole('tab', { name: '시험지로 찾기' }).count(), 1, '시험지 찾기 탭');
    assert.equal(await page.getByRole('tab', { name: '유형으로 찾기' }).count(), 1, '유형 찾기 탭');
    assert.equal(await page.locator('.stat').count(), 0, '개발 현황 통계 카드 제거');
    assert.equal(await page.locator('#candidate-notice-title').count(), 0, '검토 현황 안내 제거');
    assert.equal(await page.locator('.area-section').count(), 4, '대영역 4개');
    assert.equal(await page.locator('#result-status[role="status"][aria-live="polite"]').count(), 1, '필터 결과 라이브 상태');

    await page.selectOption('#source-filter', 'final');
    await page.selectOption('#round-filter', 'final|1');
    assert.match(await page.locator('#result-status').textContent(), /30문항$/, '파이널 1회 30문항');
    assert.match(await page.locator('#paper-context').textContent(), /점수대 우선 판단/, '회차 점수대를 1차 판단으로 표시');
    assert.match(await page.locator('#paper-context').textContent(), /평균 .*점/, '회차 평균 표시');
    assert.match(await page.locator('#paper-context').textContent(), /경시/, '회차별 실제 점수 구간 표시');

    await page.getByRole('tab', { name: '유형으로 찾기' }).click();
    assert.equal(await page.locator('#type-panel').isVisible(), true, '유형 검색 화면 표시');
    assert.equal(await page.locator('#paper-panel').isHidden(), true, '시험지 선택 화면 숨김');
    assert.equal(await page.locator('#paper-context').isHidden(), true, '유형 검색에서는 시험지 점수대 숨김');
    assert.match(await page.locator('#result-status').textContent(), /570문항$/, '유형 찾기 기본 범위 570문항');

    await page.fill('#search', '숫자 3이 적혀 있는 쪽');
    assert.ok(await page.getByText('특정 숫자가 들어 있는 수의 개수', { exact: true }).count() > 0, '실제 지문 일부로 관련 유형 검색');
    await page.fill('#search', '쌓기나무');
    assert.ok(await page.locator('.type-card').count() > 0, '유형명으로 관련 유형 검색');

    await page.click('#reset-type');
    await page.locator('.area-pick[data-area="도형"]').click();
    assert.equal(await page.locator('.area-section').count(), 1, '영역별 전체 유형은 한 영역만 표시');
    assert.equal(await page.locator('.area-head h2').textContent(), '도형', '도형 영역 전체 유형');
    assert.match(await page.locator('#result-status').textContent(), /119문항$/, '도형 영역 119문항');

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      typeColumns: getComputedStyle(document.querySelector('.type-grid')).gridTemplateColumns.split(' ').length,
      finderColumns: getComputedStyle(document.querySelector('.finder-tabs')).gridTemplateColumns.split(' ').length,
    }));
    assert.ok(mobile.documentWidth <= mobile.viewport + 1, '모바일 가로 넘침 없음');
    assert.equal(mobile.typeColumns, 1, '모바일 유형 카드 한 열');
    assert.equal(mobile.finderColumns, 2, '모바일에서도 두 찾기 방식 유지');
    assert.deepEqual(errors, [], '브라우저 오류 없음');

    console.log('PASS bank finder browser: paper mode, prompt/type search, area browse, score context, mobile overflow');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
