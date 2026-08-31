'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'assets', 'original-form');
const PRIVATE = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const renderer = fs.readFileSync(path.join(PRIVATE, 'render-original-form-two-rounds.js'), 'utf8');

const historicalCoreAssets = [
  'gpt-pencil-leads-exact-raster-v6.png',
  'gpt-slippers-left-right-exact-v7.png',
  'original-r1-q04-island-source-faithful-imagegen-v3.png',
  'original-r1-q06-leash-loose-imagegen-v5.png',
  'gpt-leash-tangle-cross-r2-v1.png',
  'gpt-overlap-digits-bold-pile-v8.png',
  'original-r1-q09-pond-imagegen-v4.png',
  'original-r1-q11-figure-v4.png',
  'original-r1-q13-figure-v4.png',
  'original-r1-q15-figure-v4.png',
  'original-r1-q16-figure-v7.png',
  'original-r1-q19-figure-v4.png',
  'original-r1-q20-figure-v4.png',
  'original-r1-q21-figure-v4.png',
  'original-r1-q24-cuboid-source-v3.png',
  'original-r1-q25-recursive-source-v4.png',
  'original-r1-q28-hollow-rings-imagegen-v4.png',
  'original-r1-q30-maze-stacked-source-v3.png',
  'gpt-hero-imps-battle-mono-v1.png',
  'gpt-hero-demon-swarm-mono-v1.png',
  'gpt-clock-pair-realistic-noon-v1.png',
  'original-r1-q05-blackboard-imagegen-v3.png',
  'rigor-r1-q14-fish-relations-v1.png',
  'rigor-r1-q29-triangle-complete-21-imagegen-v2.png',
  'rigor-r2-q01-paper-chain-v1.png',
  'rigor-r2-q03-scale-stack-v1.png',
  'rigor-r2-q05-mirror-810-v1.png',
  'rigor-r2-q07-stars-102-v1.png',
  'rigor-r2-q09-zigzag-eight-v1.png',
  'rigor-r2-q10-island-37-v1.png',
  'rigor-r2-q13-classroom-corridors-v1.png',
  'rigor-r2-q17-triangle-variant-14-v1.png',
  'rigor-r2-q20-pattern-preview-v1.png',
  'rigor-r2-q24-recursive-32cm-v1.png',
  'rigor-r2-q26-six-chairs-v1.png',
  'rigor-r2-q28-cuboid-5x5-pattern-v1.png',
  'rigor-digital-display-7-four-bars-v1.png',
  'round2-exact-q14-cryptarithm-double-v2.png',
  'round2-exact-q16-five-empty-chairs-v2.png',
  'round2-exact-q18-blank-calendar-v2.png',
  'round2-exact-q25-cryptarithm-reverse-v2.png',
  'original-r2-q11-figure-v4.png',
  'original-r2-q19-figure-v4.png',
  'original-r2-q29-figure-v4.png',
  'original-r2-q30-figure-v4.png',
];
const coreAssets = historicalCoreAssets.filter((name) => renderer.includes(name));

function pngInfo(name) {
  const file = path.join(ASSET_DIR, name);
  assert.ok(fs.existsSync(file), `${name}: 파일 존재`);
  const buffer = fs.readFileSync(file);
  assert.ok(buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${name}: PNG 형식`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const name of coreAssets) {
  const { width, height } = pngInfo(name);
  assert.ok(width >= 1000, `${name}: 인쇄 폭 1000px 이상`);
  assert.ok(height >= 250, `${name}: 인쇄 높이 250px 이상`);
}

for (const name of coreAssets) {
  assert.ok(renderer.includes(name), `${name}: 렌더러 사용`);
}
assert.match(renderer, /blue-car-side\.jpg/, '2회 자동차는 실제 자동차 JPG 사용');
assert.match(renderer, /q11-fish-path\.png/, '2회 11번은 사용자 제공 실제 기출 물고기 그림 사용');
assert.match(renderer, /cssDigitalSegments = \{[^}]*7:'abcf'/, '2회 26번 숫자 7은 가운데 가로칸 대신 왼쪽 위 세로칸을 켠 네 칸 표시');
assert.match(renderer, /사용자 제공 실제 기출 이미지 구조 변형 · 디지털 숫자'[\s\S]*?digitalDisplayCssFigure\(\)[\s\S]*?'tall'/, '2회 26번은 같은 7칸 틀의 CSS 디지털 숫자를 사용');
assert.match(renderer, /function round2MazeStackedFigure\(\)[\s\S]*?round2-maze-crop map[\s\S]*?round2-maze-crop view/, '2회 30번 미로와 통로를 원본 래스터에서 나눠 세로로 크게 배치');
assert.match(renderer, /사용자 제공 실제 기출 이미지 구조 변형 · 미로'[\s\S]*?round2MazeStackedFigure\(\)[\s\S]*?'maze-column'/, '2회 30번은 전체 세로 지면을 사용하는 큰 미로 배치');

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
  if (roundNumber === 2) assert.equal((html.match(/<svg\b/gi) || []).length, 0, '2회 인라인 SVG 없음');
  assert.equal((html.match(/<article class="question/g) || []).length, 30, `${roundNumber}회 문항 30개`);
  assert.ok((html.match(/<img\b/gi) || []).length >= (roundNumber === 1 ? 23 : 18), `${roundNumber}회 핵심 그림은 래스터 이미지`);
  const referenced = [...html.matchAll(/src="\.\.\/\.\.\/assets\/original-form\/([^"?#]+)"/g)]
    .map((match) => match[1]);
  assert.ok(referenced.length > 0, `${roundNumber}회 로컬 래스터 자산 사용`);
  for (const name of new Set(referenced)) {
    const file = path.join(ASSET_DIR, name);
    assert.ok(fs.existsSync(file), `${roundNumber}회 ${name}: 렌더러가 가리키는 파일 존재`);
    assert.ok(fs.statSync(file).size >= 1_000, `${roundNumber}회 ${name}: 비어 있지 않은 인쇄용 파일`);
  }
  assert.doesNotMatch(html, /(?:alt|aria-label)="[^"]*(?:샤프심\s*18개|다섯\s*번\s*교차|아홉\s*꼭짓점|별\s*80개|아래쪽\s*강아지)[^"]*"/i, `${roundNumber}회 대체문구 정답 노출 없음`);
  assert.doesNotMatch(html, /(?:src|data-[\w:-]+)="[^"]*(?:answer|solution|정답)[^"]*"/i, `${roundNumber}회 그림 경로 정답 노출 없음`);
}

const round1 = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'original-form-round1-data.json'), 'utf8'));
const round2 = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'original-form-round2-data.json'), 'utf8'));
assert.match(round1.questions[2].prompt, /왼쪽 발에 신는 슬리퍼/, '1회 3번은 원문형 왼발 판별 문제');
assert.doesNotMatch(round1.questions[2].prompt, /밑창[^.]*몇 개/, '1회 3번은 밑창 개수 문제가 아님');
assert.deepEqual(
  [round1.questions[1].answer, round1.questions[2].answer, round1.questions[3].answer, round1.questions[5].answer, round1.questions[6].answer],
  ['18개', '7개', '9마리', '5곳', '55'],
  '1회 핵심 관찰 그림 정답',
);
assert.deepEqual(
  [round2.questions[0].answer, round2.questions[6].answer, round2.questions[7].answer, round2.questions[9].answer],
  ['151개', '102개', '11마리', '2번'],
  '2회 핵심 관찰 그림 정답',
);

console.log(`원본형 최종 GPT·정밀 PNG ${coreAssets.length}개 및 HTML 참조 자산 QA 통과`);
