'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = { window: {} };
vm.createContext(data);
vm.runInContext(fs.readFileSync(path.join(root, 'mock-data-original.js'), 'utf8'), data);
const model = data.window.GFIELD_MOCK_ORIGINAL;
const html = fs.readFileSync(path.join(root, 'final.html'), 'utf8');
const marker = html.indexOf('지필드 영재교육 · 파이널 모의고사 진단 LMS (final.html)');
assert.ok(marker > 0);
const start = html.lastIndexOf('<script>', marker) + '<script>'.length;
const end = html.indexOf('</script>', marker);
const app = { innerHTML: '' };
const sandbox = {
  window: null, URL, URLSearchParams,
  location: { search: '?set=original&round=2', protocol: 'file:', hostname: '', href: '' },
  document: { readyState: 'loading', addEventListener() {}, getElementById(id) { return id === 'app' ? app : { style: {} }; } },
  localStorage: { getItem() { return ''; } },
  setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {},
  GFIELD_MOCK_ORIGINAL: model, GFIELD_DATA: { students: [] },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(html.slice(start, end), sandbox, { filename: 'final.html', timeout: 3000 });
const core = sandbox.GF_TEST;
assert.deepEqual(Array.from(model.cutBasis.rows, row => row.threshold2025), [46.8, 38, 30, 20.6]);
assert.equal(model.cutBasis.normalization.status, 'approximate-merged-distribution');
assert.deepEqual(Array.from(model.cutBasis.rows, row => row.targetTopPct), [2, 5.1, 12.1, 32.3]);
assert.deepEqual(JSON.parse(JSON.stringify(model.estimatedPosition(46.8))), {
  topPercent: 2, rank: 83, cohortSize: 4129, status: 'historical-distribution-estimate',
});
assert.ok(model.estimatedPosition(38).rank > model.estimatedPosition(46.8).rank);
assert.equal(model.estimatedPosition(101), null);
assert.equal(core.publicCutVerified(model.rounds['2'].stats), true);
assert.equal(core.cutInfo(46.8, model.rounds['2'].stats.cuts).grade, '경시 가능');
assert.equal(core.cutInfo(46.7, model.rounds['2'].stats.cuts).grade, '경시컷 · 심화안정권');
assert.equal(core.cutInfo(20.6, model.rounds['2'].stats.cuts).grade, '실력컷 · 일품안정권');
assert.equal(core.cutInfo(20.5, model.rounds['2'].stats.cuts).grade, '노력요함');
assert.equal(core.cutInfo(30, model.rounds['2'].stats.cuts).grade, '심화컷 · 실력안정권');
const ctx = {
  name: '검증학생', roundNum: 2, attemptNo: 1, score: 60, ncorr: 20, wrong: 10,
  grade: '실력', R: model.rounds['2'], wrongList: [], cutVerified: true,
};
const attempts = [{ n: 1, score: 40 }, { n: 2, score: 60 }];
const combined = core.originalSummaryHTML(ctx, [], attempts, []);
assert.match(combined, /1회 성적 · 최초 응시[\s\S]*40점/);
assert.match(combined, /2회 성적 · 최초 응시[\s\S]*60점/);
assert.match(combined, /누적 성적 · 1·2회 평균[\s\S]*50점/);
assert.match(combined, /2회 성적 · 최초 응시[\s\S]*60점[\s\S]*상위 약 0\.3%/);
assert.match(combined, /누적 성적 · 1·2회 평균[\s\S]*50점[\s\S]*명 기준 약 \d+등/);
assert.match(combined, /회차별 난이도 차이는 미보정/);
assert.equal(((combined.match(/<ol class="week-plan">([\s\S]*?)<\/ol>/) || [,''])[1].match(/<li>/g) || []).length, 7);
assert.match(combined, /이것만은 꼭 하고[\s\S]*특정 번호를 배정하지 않습니다/);
assert.doesNotMatch(combined, /data-week-no=/);
const reviewItems = model.rounds['2'].items.filter(item => [2, 5, 16, 30].includes(item.no));
const reviewStates = Array(30).fill('O');
for (const item of reviewItems) reviewStates[item.no - 1] = 'X';
reviewStates[1] = '-';
const reviewCtx = { ...ctx, wrongList: reviewItems, wrong: 4, answerStates: reviewStates };
const review = core.originalSummaryHTML(reviewCtx, [], attempts, [{ k: model.rounds['2'].items[4].subarea }]);
assert.deepEqual(Array.from(review.matchAll(/data-week-no="(\d+)"/g), match => Number(match[1])), [5, 2, 30]);
assert.match(review, /원문 5번[\s\S]*반복 유형 · 오답/);
assert.match(review, /원문 2번[\s\S]*미응답/);
assert.match(review, /2일[\s\S]*원문 5번[\s\S]*4일[\s\S]*원문 2번[\s\S]*6일[\s\S]*원문 30번/);
assert.doesNotMatch(review, /data-week-no="16"/);
const legacyReview = core.originalSummaryHTML({ ...reviewCtx, answerStates: null }, [], attempts, []);
assert.match(legacyReview, /원문 30번[\s\S]*미정답/);
assert.doesNotMatch(legacyReview, /<small>미응답<\/small>/);
assert.match(combined, /타이머는 현재 속도를 살피는 신호/);
const allCorrect = Array(30).fill('O');
const lastWrong = allCorrect.slice(); lastWrong[29] = 'X';
const actualAttempts = [
  { n: 1, oxArr: allCorrect, score: core.computeScore(allCorrect).score },
  { n: 2, oxArr: lastWrong, score: core.computeScore(lastWrong).score },
];
const comparison = core.originalComparisonHTML(actualAttempts);
assert.match(comparison, /1·2회 변화와 누적 분석/);
assert.match(comparison, /최초 응시 기록만 비교/);
assert.match(comparison, /대영역[\s\S]*배점대/);
assert.match(comparison, /도형<\/b><\/td><td class="c">100%<\/td><td class="c">81\.1%<\/td><td class="c"><b>91\.3%<\/b><\/td><td class="c delta-down">-18\.9%p/);
assert.match(core.originalComparisonHTML([actualAttempts[1]]), /없는 회차를 0점으로 계산하지 않습니다/);
const itemStates = allCorrect.slice(); itemStates[1] = 'X'; itemStates[29] = '-';
const allItems = core.originalAllItemHTML({ ...ctx, oxArr: lastWrong, answerStates: itemStates });
assert.equal((allItems.match(/<tr><td class="c">\d+<\/td>/g) || []).length, 30);
assert.match(allItems, /original-status x">오답/);
assert.match(allItems, /original-status blank">미응답/);
const legacyItems = core.originalAllItemHTML({ ...ctx, oxArr: lastWrong, answerStates: null });
assert.match(legacyItems, /original-status x">미정답/);
assert.doesNotMatch(legacyItems, /original-status blank/);
assert.match(html, /안내 시각은 참고 기준이며, 그 번호까지 풀어야 정답인 것은 아닙니다/);
assert.doesNotMatch(JSON.stringify(model.exam.cues), /지금쯤 6번을 넘어가면 좋아/);
const missing = core.originalSummaryHTML(ctx, [], [attempts[1]], []);
assert.match(missing, /1회 성적 · 최초 응시[\s\S]*기록 없음/);
assert.match(missing, /누적 성적 · 1·2회 평균[\s\S]*산출 대기/);
ctx.attemptNo = 2;
const practice = core.originalSummaryHTML(ctx, [], attempts, []);
assert.match(practice, /2차 연습 기록/);
assert.match(practice, /누적 성적 · 1·2회 평균[\s\S]*50점/);
const resources = core.originalResourcesHTML(ctx);
assert.match(resources, /data-original-paper/);
assert.match(resources, /youtube-nocookie\.com\/embed\/R5NN1K29__4/);
assert.match(html, /2025 환산 예상 레벨/);
assert.match(html, /시그니처 기출 점수를 2024·2025년 초2 성적분포와 비교/);
assert.doesNotMatch(html, /2024 최저점|2025 최저점|2개년 평균 컷|확인 자료:/);
console.log('PASS Signature summary: separate round scores, original-only cumulative average, 7-day guidance, paper/video viewer');
