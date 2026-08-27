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
    await page.waitForFunction(() => document.querySelector('#stat-questions')?.textContent === '810');
    assert.deepEqual(await page.locator('.stat strong').allTextContents(), ['810', '706', '125', '60', '750', '8'], '산출된 전체 현황 수치');
    assert.equal(await page.locator('.area-section').count(), 4, '대영역 4개');
    assert.equal(await page.locator('.type-card').count(), 125, '통합 유형·후보 묶음 125개');
    assert.equal(await page.locator('#candidate-notice-title').textContent(), '검토 후보는 확정 분류가 아닙니다.', '후보 비확정 안내');
    assert.equal(await page.locator('label[for="search"],label[for="area-filter"],label[for="status-filter"],label[for="source-filter"],label[for="dev-filter"]').count(), 5, '모든 필터에 접근 가능한 레이블');
    assert.equal(await page.locator('#result-status[role="status"][aria-live="polite"]').count(), 1, '필터 결과 라이브 상태');

    await page.selectOption('#status-filter', 'candidate');
    assert.equal(await page.locator('.type-card').count(), 66, '후보 유형군 필터');
    assert.equal(await page.locator('#result-status').textContent(), '현재 표시: 66유형 · 750문항', '후보 문항은 750문항으로 별도 표시');
    assert.equal(await page.locator('.type-card:not(.candidate)').count(), 0, '후보 필터에서 확정 전용 카드를 섞지 않음');

    await page.click('#reset-filter');
    await page.selectOption('#source-filter', 'original');
    assert.equal(await page.locator('#result-status').textContent(), '현재 표시: 59유형 · 60문항', '원본형 출처 60문항');
    assert.equal(await page.locator('.type-card.candidate').count(), 0, '원본형 출처 소영역은 모두 확정');

    await page.fill('#search', '크고 작은 직사각형');
    assert.equal(await page.locator('.type-card').count(), 1, '유형명 검색');
    assert.equal(await page.locator('.badge.practice').count(), 1, '연습형 검증 배지');
    assert.equal(await page.locator('.badge.pending').count(), 1, '연습형 검증과 별도로 원본 대조 대기 표시');

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      typeColumns: getComputedStyle(document.querySelector('.type-grid')).gridTemplateColumns.split(' ').length,
      filterColumns: getComputedStyle(document.querySelector('.filter-grid')).gridTemplateColumns.split(' ').length,
    }));
    assert.ok(mobile.documentWidth <= mobile.viewport + 1, '모바일 가로 넘침 없음');
    assert.equal(mobile.typeColumns, 1, '모바일 유형 카드 한 열');
    assert.equal(mobile.filterColumns, 1, '좁은 모바일 필터 한 열');
    assert.deepEqual(errors, [], '브라우저 오류 없음');

    console.log('PASS bank catalog browser: hierarchy, search, filters, candidate separation, development gates, accessibility labels, mobile overflow');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
