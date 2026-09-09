'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const ARTIFACT_DIR = process.env.GFIELD_QA_ARTIFACT_DIR || '';

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
    assert.ok(await page.locator('.subarea').count() > 0, '대영역 아래 소영역과 세부유형을 계층으로 표시');
    assert.equal(await page.locator('#result-status[role="status"][aria-live="polite"]').count(), 1, '필터 결과 라이브 상태');

    await page.selectOption('#source-filter', 'final');
    await page.selectOption('#round-filter', 'final|1');
    assert.match(await page.locator('#result-status').textContent(), /30문항$/, '파이널 1회 30문항');
    assert.match(await page.locator('#paper-context').textContent(), /점수대 우선 판단/, '회차 점수대를 1차 판단으로 표시');
    assert.match(await page.locator('#paper-context').textContent(), /평균 .*점/, '회차 평균 표시');
    assert.match(await page.locator('#paper-context').textContent(), /경시/, '회차별 실제 점수 구간 표시');
    assert.equal(await page.getByRole('link', { name: '문항별 유사문제 3개 공부하기' }).count(), 30, '파이널 1회 30개 원문별 고정 문항 연결');
    const unrestrictedProduct = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '범위가 주어지지 않은 두 수의 곱의 최댓값·최솟값', exact: true }) });
    assert.equal(await unrestrictedProduct.count(), 1, '4번 세부유형은 범위가 없는 곱 조건까지 표시');
    const finalCube = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '바닥을 제외해 색칠한 쌓기나무의 개수', exact: true }) });
    assert.match(await finalCube.getByRole('link', { name: '문항별 유사문제 3개 공부하기' }).getAttribute('href'), /bank=final1&gens=final1-q02/, '정답률 근거는 유지하며 확정 문항 3개로 연결');
    const finalRegions = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '평행하지 않은 직선의 경계 안 최대·최소 영역 수', exact: true }) });
    assert.match(await finalRegions.getByRole('link', { name: '문항별 유사문제 3개 공부하기' }).getAttribute('href'), /gens=final1-q17/, '17번은 범위 밖 교점 조건을 명시한 고정 유사문제로 연결');
    assert.equal(
      await page.locator('.badge.difficulty').count(),
      await page.locator('.type-card').count(),
      '각 이원목적표 유형 카드에 난이도 한 개 표시',
    );
    const paperFold = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '보기의 접기 방법을 두 번 반복한 뒤 자르기', exact: true }) });
    assert.match(await paperFold.textContent(), /난이도 최상/, '정답률 3.6% 유형은 최상');
    assert.match(await paperFold.textContent(), /기준 정답률 3.6%/, '실제 정답률 근거 표시');

    await page.selectOption('#round-filter', 'final|2');
    assert.match(await page.locator('#result-status').textContent(), /30문항$/, '파이널 2회 30문항');
    const final2Assumption = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '두 가지 점수의 총점에서 높은 점수 횟수 구하기', exact: true }) });
    assert.equal(await final2Assumption.count(), 1, '파이널 2회 검수된 학생 표시명을 카드 제목으로 사용');
    assert.match(await final2Assumption.textContent(), /기존 유형명 · 우기기/, '기존 이원목적 유형명은 별도로 보존');
    assert.equal(await page.getByRole('heading', { name: '여러 수 묶음의 누적·앞 묶음 연결 규칙으로 묶음의 합 구하기', exact: true }).count(), 1, '15번은 묶음 전체 합 응답을 표시');
    assert.equal(await page.getByRole('heading', { name: '모든 도로를 지나 출발점으로 돌아오는 가장 짧은 길 찾기', exact: true }).count(), 1, '28번은 모든 도로와 출발점 복귀 조건을 표시');
    assert.equal(await page.locator('.type-card').count(), 30, '파이널 2회 승인 문항을 안정 유형별 카드 30개로 분리');

    async function inspectFinal2Cards(width, height, screenshotName) {
      await page.setViewportSize({ width, height });
      const observed = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        cards: Array.from(document.querySelectorAll('.type-card')).map((card) => {
          const heading = card.querySelector('h4');
          const cardBox = card.getBoundingClientRect();
          const headingBox = heading.getBoundingClientRect();
          const style = getComputedStyle(heading);
          return {
            cardLeft: cardBox.left,
            cardRight: cardBox.right,
            headingLeft: headingBox.left,
            headingRight: headingBox.right,
            headingHeight: headingBox.height,
            fontSize: parseFloat(style.fontSize),
            overflowX: heading.scrollWidth - heading.clientWidth,
            overflowY: heading.scrollHeight - heading.clientHeight,
          };
        }),
      }));
      assert.equal(observed.cards.length, 30, `${width}px Final2 카드 30개`);
      assert.ok(observed.documentWidth <= observed.viewport + 1, `${width}px Final2 문서 가로 넘침 없음`);
      assert.ok(observed.cards.every((card) => card.cardLeft >= -1 && card.cardRight <= observed.viewport + 1), `${width}px Final2 카드가 화면 안에 있음`);
      assert.ok(observed.cards.every((card) => card.headingLeft >= -1 && card.headingRight <= observed.viewport + 1), `${width}px Final2 제목이 화면 안에 있음`);
      assert.ok(observed.cards.every((card) => card.fontSize >= 14), `${width}px Final2 제목 글자 14px 이상`);
      assert.ok(observed.cards.every((card) => card.headingHeight >= card.fontSize && card.overflowX <= 1 && card.overflowY <= 1), `${width}px Final2 긴 제목 가림 없음`);
      if (ARTIFACT_DIR) {
        fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshotName), fullPage: true });
      }
    }
    await inspectFinal2Cards(1280, 900, 'catalog-final2-1280.png');
    await inspectFinal2Cards(390, 844, 'catalog-final2-390.png');
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.selectOption('#round-filter', 'final|3');
    assert.match(await page.locator('#result-status').textContent(), /30문항$/, '파이널 3회 30문항');
    assert.equal(await page.getByRole('heading', { name: '우기기', exact: true }).count(), 1, '같은 기존 유형명의 미승인 타회차는 기존 제목 유지');
    assert.equal(await page.getByRole('heading', { name: '두 가지 점수의 총점에서 높은 점수 횟수 구하기', exact: true }).count(), 0, 'Final2 학생 표시명이 타회차에 전파되지 않음');
    assert.equal(await page.getByRole('heading', { name: '점 접촉을 포함한 지도 최소 색칠', exact: true }).count(), 0, 'Final2 지도 조건명이 타회차 4색정리에 전파되지 않음');

    await page.selectOption('#source-filter', 'original');
    await page.selectOption('#round-filter', 'original|1');
    assert.match(await page.locator('#result-status').textContent(), /30문항$/, '시그니처 1회 30문항');
    const highPoint = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '사용 횟수 제한이 있는 최소합', exact: true }) });
    assert.match(await highPoint.textContent(), /난이도 최상/, '정답률 없는 4.2점 유형은 최상');
    assert.match(await highPoint.textContent(), /4.2점 기준/, '정답률 없는 유형은 배점 근거 표시');
    const lowPoint = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '두 상황의 높이', exact: true }) });
    assert.match(await lowPoint.textContent(), /난이도 최하/, '정답률 없는 2.7점 유형은 최하');
    const overlapReview = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '겹치는 두 모임의 최솟값과 최댓값', exact: true }) });
    const overlapHref = await overlapReview.getByRole('link', { name: '이 유형 유사문제 검토하기' }).getAttribute('href');
    assert.match(overlapHref, /gen=overlap-range-sum/, '출처 구조 기반 겹침 유사문제 생성기 연결');
    assert.match(overlapHref, /level=1/, '정답률 없는 2.7점 원문은 최하 난이도 생성 레벨로 연결');
    await page.selectOption('#round-filter', 'original|2');
    const remainderReview = page.locator('.type-card').filter({ has: page.getByRole('heading', { name: '서로 다른 세 조건의 교집합', exact: true }) });
    const remainderHref = await remainderReview.getByRole('link', { name: '이 유형 유사문제 검토하기' }).getAttribute('href');
    assert.match(remainderHref, /gen=remainder-yes-no/, '원본 예·아니요 나머지 조건 생성기 연결');
    assert.match(remainderHref, /level=1/, '나머지 원문 2.7점은 최하 난이도 생성 레벨로 연결');

    await page.getByRole('tab', { name: '유형으로 찾기' }).click();
    assert.equal(await page.locator('#type-panel').isVisible(), true, '유형 검색 화면 표시');
    assert.equal(await page.locator('#paper-panel').isHidden(), true, '시험지 선택 화면 숨김');
    assert.equal(await page.locator('#paper-context').isHidden(), true, '유형 검색에서는 시험지 점수대 숨김');
    assert.match(await page.locator('#result-status').textContent(), /600문항$/, '유형 찾기 기본 범위 600문항');

    await page.fill('#search', '숫자 3이 적혀 있는 쪽');
    assert.ok(await page.getByText('특정 숫자가 들어 있는 수의 개수', { exact: true }).count() > 0, '실제 지문 일부로 관련 유형 검색');
    await page.fill('#search', '쌓기나무');
    assert.ok(await page.locator('.type-card').count() > 0, '유형명으로 관련 유형 검색');

    await page.click('#reset-type');
    await page.locator('.area-pick[data-area="도형"]').click();
    assert.equal(await page.locator('.area-section').count(), 1, '영역별 전체 유형은 한 영역만 표시');
    assert.equal(await page.locator('.area-head h2').textContent(), '도형', '도형 영역 전체 유형');
    assert.match(await page.locator('#result-status').textContent(), /123문항$/, '도형 영역 123문항');

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

    console.log('PASS bank finder browser: objective-table types, five difficulty levels, rate/points evidence, search, area browse, mobile overflow');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
