'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.GFIELD_QA_BASE_URL || 'http://127.0.0.1:8765';
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const SOURCE = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');

async function installAccess(page, approvedName) {
  await page.route('**/data.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: SOURCE + `\n;(function(){var D=window.GFIELD_DATA,n=${JSON.stringify(approvedName)};if(!D.students.includes(n))D.students.push(n);D.archiveProductAccess['mock-final-5']=[n];})();`,
  }));
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {}),
  });
  try {
    const approved = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await installAccess(approved, '5회승인학생');
    await approved.goto(`${BASE_URL}/final.html?round=5&name=${encodeURIComponent('5회승인학생')}`, { waitUntil: 'domcontentloaded' });
    await approved.waitForSelector('.start-doc');
    assert.match(await approved.locator('.start-doc').innerText(), /최종 실전 모의고사 5회/);
    await approved.click('#btnPaper');
    await approved.waitForSelector('.paper-screen');
    assert.equal(await approved.locator('.paper-image-page img').count(), 7, '5회 진단 뷰어 시험지 7쪽');
    await approved.goto(`${BASE_URL}/final.html?round=5&name=docssam&preview=1&go=answer`, { waitUntil: 'domcontentloaded' });
    await approved.waitForSelector('#btnGrade');
    await approved.locator('.abtn').nth(0).click();
    await approved.locator('.abtn').nth(5).click();
    await approved.click('#btnGrade');
    await approved.waitForSelector('#cmtBody');
    assert.match(await approved.locator('#cmtBody').innerText(), /가장 어려웠던 해의 지문 이해가 필요한 시험/);
    assert.match(await approved.locator('#cmtBody').innerText(), /43점 이상.*경시반 가능성이 큼/);
    assert.match(await approved.locator('.kpi').innerText(), /제공 평균\s*27점/);
    assert.equal(await approved.locator('#detailWrap a[href*="1uhIx_l04EA"]').count(), 30, '문항별 영상 시점 30개');

    const denied = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installAccess(denied, '5회승인학생');
    await denied.goto(`${BASE_URL}/final.html?round=5&name=${encodeURIComponent('미승인학생')}`, { waitUntil: 'domcontentloaded' });
    await denied.waitForSelector('#gname');
    await denied.fill('#gname', '미승인학생');
    await denied.click('#genter');
    assert.match(await denied.locator('#gerr').innerText(), /열람 권한이 없습니다/);

    const answer = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await installAccess(answer, '5회승인학생');
    await answer.goto(`${BASE_URL}/answer.html?set=final&round=5&name=${encodeURIComponent('5회승인학생')}`, { waitUntil: 'domcontentloaded' });
    await answer.waitForSelector('#content:not(.hidden)');
    assert.equal(await answer.locator('#body tr').count(), 30, '5회 답안·교재 연결표 30문항');
    assert.match(await answer.locator('#ttl').innerText(), /최종 실전 모의고사 5회/);

    const answerDenied = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installAccess(answerDenied, '5회승인학생');
    await answerDenied.goto(`${BASE_URL}/answer.html?set=final&round=5&name=${encodeURIComponent('미승인학생')}`, { waitUntil: 'domcontentloaded' });
    await answerDenied.waitForSelector('#gate:not(.hidden)');
    assert.equal(await answerDenied.locator('#content:not(.hidden)').count(), 0, '미승인 학생 답안 차단');

    console.log('PASS final 5 direct access, seven-page paper, and 30-row answer viewer');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
