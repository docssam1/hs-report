'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'assets', 'original-form');
const PRIVATE = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const renderer = fs.readFileSync(path.join(PRIVATE, 'render-original-form-two-rounds.js'), 'utf8');

const coreAssets = [
  'gpt-pencil-leads-exact-raster-v6.png',
  'gpt-slippers-left-right-exact-v7.png',
  'gpt-island-boundary-connected-r2-v2.png',
  'gpt-leash-two-curves-exact-v4.png',
  'gpt-leash-tangle-cross-r2-v1.png',
  'gpt-overlap-digits-bold-pile-v4.png',
  'original-r1-q05-blackboard-imagegen-v3.png',
  'original-r1-q09-pond-imagegen-v4.png',
  'original-r1-q24-cuboid-source-v3.png',
  'original-r1-q25-recursive-source-v4.png',
  'original-r1-q28-hollow-rings-imagegen-v4.png',
  'original-r1-q29-honeycomb-v3.png',
  'original-r1-q30-maze-stacked-source-v3.png',
  'gpt-hero-imps-battle-mono-v1.png',
  'gpt-hero-demon-swarm-mono-v1.png',
  'gpt-clock-pair-realistic-noon-v1.png',
];

const exactRound2Assets = [
  'round2-exact-q01-thumbtacks-v2.png',
  'round2-exact-q03-two-balances-v2.png',
  'round2-exact-q05-mirror-clock-v3.png',
  'round2-exact-q06-date-cards-v2.png',
  'round2-exact-q07-star-rows-v3.png',
  'round2-exact-q13-classroom-sums-v2.png',
  'round2-exact-q14-cryptarithm-double-v2.png',
  'round2-exact-q15-age-timeline-v2.png',
  'round2-exact-q16-five-empty-chairs-v2.png',
  'round2-exact-q17-triangle-grid-v3.png',
  'round2-exact-q18-blank-calendar-v2.png',
  'round2-exact-q23-staircase-grid-v2.png',
  'round2-exact-q24-four-by-three-grid-v2.png',
  'round2-exact-q25-cryptarithm-reverse-v2.png',
  'round2-exact-q26-five-chairs-jiwoo-v3.png',
  'round2-exact-q27-age-table-v2.png',
  'round2-exact-q28-three-fruit-scales-v2.png',
];

const rasterizedRound1 = [10,11,12,13,14,15,17,19,20,21,26]
  .map((number) => `original-r1-q${String(number).padStart(2, '0')}-figure-v6.png`);
const rasterizedRound2 = [2,9,11,19,20,29,30]
  .map((number) => `original-r2-q${String(number).padStart(2, '0')}-figure-v6.png`);

function pngInfo(name) {
  const file = path.join(ASSET_DIR, name);
  assert.ok(fs.existsSync(file), `${name}: 파일 존재`);
  const buffer = fs.readFileSync(file);
  assert.ok(buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${name}: PNG 형식`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const name of [...coreAssets, ...exactRound2Assets, ...rasterizedRound1, ...rasterizedRound2]) {
  const { width, height } = pngInfo(name);
  assert.ok(width >= 1000, `${name}: 인쇄 폭 1000px 이상`);
  assert.ok(height >= 250, `${name}: 인쇄 높이 250px 이상`);
}

for (const name of [...coreAssets, ...exactRound2Assets]) {
  assert.ok(renderer.includes(name), `${name}: 렌더러 사용`);
}
assert.match(renderer, /blue-car-side\.jpg/, '2회 자동차는 실제 자동차 JPG 사용');
assert.match(renderer, /gpt-hero-imps-battle-mono-v1\.png[\s\S]*gpt-hero-demon-swarm-mono-v1\.png/, '두 악마 문항은 서로 다른 GPT 장면 사용');
assert.match(renderer, /partialOrderFigure\(\)/, '2회 11번은 전용 부분순서 그림 사용');

const slipperComposite = fs.readFileSync(path.join(PRIVATE, 'slipper-composite-v7.html'), 'utf8');
const slipperTags = [...slipperComposite.matchAll(/<img class="shoe"[^>]+>/g)].map((match) => match[0]);
assert.equal(slipperTags.length, 22, '슬리퍼는 정확히 22개');
assert.equal(slipperTags.filter((tag) => /data-foot="L"/.test(tag)).length, 7, '왼발용 슬리퍼 7개');
assert.equal(slipperTags.filter((tag) => /data-foot="R"/.test(tag)).length, 15, '오른발용 슬리퍼 15개');
assert.equal(slipperTags.filter((tag) => /data-face="sole"/.test(tag)).length, 7, '뒤집힌 슬리퍼 7개');
assert.equal(slipperTags.filter((tag) => /data-face="top"/.test(tag)).length, 15, '윗면 슬리퍼 15개');
for (const tag of slipperTags) {
  if (/data-foot="L"/.test(tag)) assert.match(tag, /--flip:1(?:;|\")/, '왼발용은 원래 비대칭 실루엣');
  if (/data-foot="R"/.test(tag)) assert.match(tag, /--flip:-1(?:;|\")/, '오른발용은 정확한 좌우 반전 실루엣');
}

for (const roundNumber of [1, 2]) {
  const html = fs.readFileSync(path.join(PRIVATE, `original-form-round${roundNumber}-exam.html`), 'utf8');
  assert.equal((html.match(/<svg\b/gi) || []).length, 0, `${roundNumber}회 인라인 SVG 없음`);
  assert.equal((html.match(/<article class="question/g) || []).length, 30, `${roundNumber}회 문항 30개`);
  assert.ok((html.match(/<img\b/gi) || []).length >= 25, `${roundNumber}회 핵심 그림은 래스터 이미지`);
  assert.doesNotMatch(html, /(?:alt|aria-label)="[^"]*(?:샤프심\s*18개|다섯\s*번\s*교차|아홉\s*꼭짓점|별\s*80개|아래쪽\s*강아지)[^"]*"/i, `${roundNumber}회 대체문구 정답 노출 없음`);
  assert.doesNotMatch(html, /(?:src|data-[\w:-]+)="[^"]*(?:answer|solution|정답)[^"]*"/i, `${roundNumber}회 그림 경로 정답 노출 없음`);
}

const round1 = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'original-form-round1-data.json'), 'utf8'));
const round2 = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'original-form-round2-data.json'), 'utf8'));
assert.match(round1.questions[2].prompt, /왼쪽 발에 신는 슬리퍼/, '1회 3번은 원문형 왼발 판별 문제');
assert.doesNotMatch(round1.questions[2].prompt, /밑창[^.]*몇 개/, '1회 3번은 밑창 개수 문제가 아님');
assert.deepEqual(
  [round1.questions[1].answer, round1.questions[2].answer, round1.questions[3].answer, round1.questions[5].answer, round1.questions[6].answer],
  ['18개', '7개', '7마리', '5곳', '78'],
  '1회 핵심 관찰 그림 정답',
);
assert.deepEqual(
  [round2.questions[0].answer, round2.questions[6].answer, round2.questions[7].answer, round2.questions[9].answer],
  ['9개', '80개', '아래쪽 강아지', '7마리'],
  '2회 핵심 관찰 그림 정답',
);

console.log(`원본형 최종 GPT·정밀 PNG ${coreAssets.length + exactRound2Assets.length + rasterizedRound1.length + rasterizedRound2.length}개 QA 통과`);
