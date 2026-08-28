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
assert.match(renderer, /gpt-island-boundary-connected-r2-v1\.png/);

assert.match(q(5).prompt, /세모 4개, 네모 3개, 동그라미 1개/);
assert.equal(q(5).answer, '6');
assert.match(renderer, /original-r1-q05-blackboard-imagegen-v3\.png/);

const digits = JSON.parse(fs.readFileSync(path.join(PRIVATE, 'overlap-digits-bold-pile-v4.meta.json'), 'utf8'));
assert.equal(digits.inventory.total, 18);
assert.equal(digits.inventory.counts['6'], 0);
assert.equal(digits.inventory.digits.reduce((sum, value) => sum + value, 0), 78);
assert.equal(q(7).answer, '78');
assert.match(q(7).prompt, /숫자 6은 없습니다/);

assert.match(q(9).prompt, /둥근 연못/);
assert.equal(q(9).answer, 'A-B-D-E-C');
assert.match(renderer, /original-r1-q09-pond-imagegen-v4\.png/);

assert.equal(q(10).answer, '가 20개, 나 20개, 다 20개');
assert.match(renderer, /slice\(0,9\)/);
assert.doesNotMatch(renderer, /const rows=patterns\.map\(\(p\)=>p\.repeat\(7\)\.slice\(0,20\)\)/);

assert.equal(q(12).answer, '3m');
assert.match(renderer, /gap\('4m',4\).*gap\('2m',2\).*gap\('6m',6\)/s);
assert.match(renderer, /fish-rule fish-only/);
assert.equal(q(14).answer, '7마리');
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

const cells = [];
for (let column = 0; column < 4; column += 1) {
  for (let row = 0; row < 3; row += 1) cells.push(`${column},${row}`);
}
const set = new Set(cells);
let shared = 0;
for (const cell of cells) {
  const [column, row] = cell.split(',').map(Number);
  for (const [dc, dr] of [[1, 0], [0, 1], [1, -1]]) {
    if (set.has(`${column + dc},${row + dr}`)) shared += 1;
  }
}
assert.equal(shared, 23);
assert.equal(12 * 6 - shared, 49);
assert.equal(q(29).answer, '49개');

assert.equal(q(30).answer, 'H1');
assert.match(renderer, /original-r1-q30-maze-stacked-source-v3\.png/);
assert.match(renderer, /justify-content:flex-start/);
assert.doesNotMatch(renderer, /if\(pageNo===6\)/);

console.log('원본형 1회 사용자 교정 3·4·5·7·9·10·12·14·15·19·20·24·25·27·28·29·30 의미 QA 통과');
