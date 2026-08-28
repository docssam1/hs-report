'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const renderer = fs.readFileSync(path.join(PRIVATE, 'render-original-form-two-rounds.js'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'original-form-round1-data.json'), 'utf8'));
const q = (number) => data.questions[number - 1];

const slippers = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'slipper-composite-v7.meta.json'), 'utf8'));
assert.deepEqual(slippers.inventory, {
  total: 22, left: 7, right: 15, leftTop: 4, leftSole: 3, top: 15, sole: 7,
});
assert.equal(q(3).answer, '7개');

assert.match(q(4).prompt, /위와 아래.*섬과 바다.*경계/s);
assert.match(q(4).prompt, /바다에 있는 개구리/);
assert.equal(q(4).answer, '7마리');
assert.match(renderer, /gpt-island-boundary-connected-r2-v2\.png/);

assert.match(q(5).prompt, /1부터 9까지.*세모 3개의 합은 14.*네모 3개의 합은 13.*연속한 세 수/s);
assert.equal(q(5).answer, '7');
assert.match(renderer, /rigor-r1-q05-shape-partition-v1\.png/);

const digits = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'overlap-digits-bold-pile-v4.meta.json'), 'utf8'));
assert.equal(digits.inventory.total, 18);
assert.equal(digits.inventory.counts['6'], 0);
assert.equal(digits.inventory.digits.reduce((sum, value) => sum + value, 0), 78);
assert.equal(q(7).answer, '78');
assert.match(q(7).prompt, /숫자 6은 없습니다/);

assert.match(q(9).prompt, /둥근 연못/);
assert.equal(q(9).answer, 'A-B-D-E-C');
assert.match(renderer, /original-r1-q09-pond-imagegen-v4\.png/);

assert.match(q(10).prompt, /19글자.*20글자.*22글자.*‘나’/s);
assert.equal(q(10).answer, '20개');
assert.match(renderer, /slice\(0,9\)/);
assert.doesNotMatch(renderer, /const rows=patterns\.map\(\(p\)=>p\.repeat\(7\)\.slice\(0,20\)\)/);

assert.match(q(12).prompt, /거북이는 2분 동안 1m.*토끼는 10초 동안 2m.*30m.*3분 늦게/s);
assert.equal(q(12).answer, '60분 30초');
assert.match(q(14).prompt, /네 어항.*모두 31마리.*2마리 많고.*3마리 많으며.*1마리 적습니다/s);
assert.equal(q(14).answer, '9마리');
assert.match(renderer, /rigor-r1-q14-fish-relations-v1\.png/);
assert.equal(q(15).answer, '4번');

assert.equal(q(19).answer, '157개');
const cardFunction = renderer.match(/function digitCardsFigure[\s\S]*?\n}\n\nfunction hexChainFigure/)?.[0] || '';
assert.doesNotMatch(cardFunction, />\$\{c\}장</);

assert.equal(q(20).answer, '4번');
assert.match(q(20).prompt, /나는 몇 번 이겼습니까/);
assert.equal(3 * 4 - 3 * (10 - 4), -6);

assert.equal(q(24).answer, '18개');
assert.match(q(24).prompt, /가로 6칸, 세로 5칸, 깊이 5칸/);
const totalBlocks = 6 * 5 * 5;
const blackBlocks = 30 + 30 + 30 - 10 - 4 - 10;
assert.equal(totalBlocks, 150);
assert.equal(blackBlocks, 66);
assert.equal((totalBlocks - blackBlocks) - blackBlocks, 18);
assert.match(renderer, /original-r1-q24-cuboid-source-v3\.png/);

assert.equal(q(25).answer, '126cm');
assert.equal(64 + 32 + 16 + 8 + 4 + 2, 126);
assert.match(renderer, /original-r1-q25-recursive-source-v4\.png/);

assert.equal(q(26).answer, '9711');
assert.match(q(26).prompt, /불이 켜지는 칸이 모두 14개/);
assert.match(renderer, /rigor-digital-display-7-four-bars-v1\.png/);

const terms = Array.from({ length: 20 }, (_, i) => BigInt('9'.repeat(i + 1)));
const longSum = terms.reduce((sum, value) => sum + value, 0n).toString();
assert.equal(longSum, '111111111111111111090');
assert.equal([...longSum].filter((digit) => digit === '1').length, 18);
assert.equal(q(27).answer, '18개');
assert.match(q(27).prompt, /formula long-sum/);
assert.doesNotMatch(q(27).prompt, /<br>/);

assert.equal(q(28).answer, '9801개');
assert.match(q(28).prompt, /가운데가 빈/);
assert.match(q(28).prompt, /첫 번째부터 50번째/);
assert.equal(1 + 8 * (49 * 50 / 2), 9801);
assert.match(renderer, /original-r1-q28-hollow-rings-imagegen-v4\.png/);

assert.equal(q(29).answer, '18개');
assert.match(q(29).prompt, /크고 작은 삼각형/);
assert.match(renderer, /rigor-r1-q29-triangle-original-18-v1\.png/);

assert.equal(q(30).answer, 'H1');
assert.match(renderer, /original-r1-q30-maze-stacked-source-v3\.png/);
assert.match(renderer, /justify-content:space-evenly/);
assert.doesNotMatch(renderer, /if\(pageNo===6\)/);

console.log('원본형 1회 사용자 교정 및 고난도 재설계 3·4·5·7·9·10·12·14·15·19·20·24·25·26·27·28·29·30 의미 QA 통과');
