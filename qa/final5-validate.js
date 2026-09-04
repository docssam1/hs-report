'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = { window: {} };
context.window = context;
vm.createContext(context);
for (const file of ['data.js', 'mock-data-final.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));
const model = context.GFIELD_MOCK_FINAL;
const round = model.rounds['5'];

assert.equal(model.roundCount, 5);
assert.equal(round.ready, true);
assert.equal(round.items.length, 30);
assert.deepEqual(Array.from(round.items, item => item.no), Array.from({ length: 30 }, (_, i) => i + 1));
assert.ok(round.items.every(item => item.answer && item.type && item.area && item.subarea && item.comment && item.caution));
assert.ok(round.items.every((item, index, all) => Number.isInteger(item.t) && item.t >= 0 && (!index || item.t >= all[index - 1].t)));
assert.match(round.video, /1uhIx_l04EA/);
assert.equal(round.reportedAverage, 27);
assert.match(round.teacherComment, /일품 컷은 16점/);
assert.match(round.teacherComment, /실력은 24점/);
assert.equal(round.paper.imagePages, 7);
assert.ok(Math.abs(model.blueprint.reduce((sum, row) => sum + row.pts, 0) - 100) < 1e-9);

const byNo = Object.fromEntries(round.items.map(item => [item.no, item]));
assert.equal(byNo[6].answer, '5가지');
assert.match(byNo[6].comment, /\(0,0,17\).*\(2,4,1\)/);
assert.equal(byNo[20].answer, '50번');
assert.match(byNo[20].comment, /1·3·5번째/);
assert.equal(byNo[30].answer, '99999785960');

// 6번: 모든 비음수 해를 열거하고 홀수 발사 횟수만 남긴다.
const scoreWays = [];
for (let a = 0; a <= 5; a += 1) for (let b = 0; b <= 7; b += 1) for (let c = 0; c <= 17; c += 1) {
  if (10 * a + 7 * b + 3 * c === 51 && (a + b + c) % 2 === 1) scoreWays.push([a, b, c]);
}
assert.deepEqual(scoreWays, [[0, 0, 17], [0, 3, 10], [0, 6, 3], [2, 1, 8], [2, 4, 1]]);

// 17번: 높이 h(i,j)=max(i,j)인 7×7 계단 쌓기의 내부 맞닿은 면.
const heights = Array.from({ length: 7 }, (_, y) => Array.from({ length: 7 }, (_, x) => Math.max(x + 1, y + 1)));
const cubes = heights.flat().reduce((sum, h) => sum + h, 0);
let verticalPairs = heights.flat().reduce((sum, h) => sum + h - 1, 0);
let horizontalPairs = 0;
for (let y = 0; y < 7; y += 1) for (let x = 0; x < 7; x += 1) {
  if (x < 6) horizontalPairs += Math.min(heights[y][x], heights[y][x + 1]);
  if (y < 6) horizontalPairs += Math.min(heights[y][x], heights[y + 1][x]);
}
assert.equal(cubes, 252);
assert.equal(2 * (verticalPairs + horizontalPairs), 1218);

// 20번: 왕복 열 위치를 100번 직접 모의 계산한다.
const plane = [1, 3, 3];
const helicopter = [4, 3, 2, 1, 2, 3];
let sameColumn = 0;
for (let move = 1; move <= 100; move += 1) {
  if (plane[move % 3] === helicopter[move % 6]) sameColumn += 1;
}
assert.equal(sameColumn, 50);

// 27번: 세 재료 제한을 모두 만족하는 자연수 해를 완전 탐색한다.
let maxProducts = -1;
let best = [];
for (let car = 0; car <= 15; car += 1) for (let truck = 0; truck <= 15; truck += 1) {
  if (4 * car + 2 * truck <= 30 && 2 * car + 7 * truck <= 30 && 8 * car + 6 * truck <= 50) {
    if (car + truck > maxProducts) { maxProducts = car + truck; best = [[car, truck]]; }
    else if (car + truck === maxProducts) best.push([car, truck]);
  }
}
assert.equal(maxProducts, 7);
assert.deepEqual(best, [[4, 3]]);

// 30번: 111자리에서 100자리를 지우는 최대 부분수열을 탐욕법으로 검산한다.
const digits = Array.from({ length: 60 }, (_, i) => String(i + 1)).join('');
let drop = 100;
const stack = [];
for (const digit of digits) {
  while (drop && stack.length && stack[stack.length - 1] < digit) { stack.pop(); drop -= 1; }
  stack.push(digit);
}
if (drop) stack.splice(stack.length - drop, drop);
assert.equal(digits.length, 111);
assert.equal(stack.slice(0, 11).join(''), '99999785960');

const unified = registry.buildUnifiedCatalog({ final: model });
const bankItems = unified.items.filter(item => item.sourceRef.set === 'final' && item.sourceRef.round === 5);
assert.equal(bankItems.length, 30, '5회 30문항이 문제은행 DB에 모두 등록');
assert.ok(bankItems.every(item => item.reviewStatus === 'confirmed' && !item.reviewRequired));
assert.ok(bankItems.every(item => item.responseRateStatus === 'unmeasured' && item.bankDifficulty.basis === 'source-points'));
assert.deepEqual(
  bankItems.reduce((counts, item) => { counts[item.bankDifficulty.label] = (counts[item.bankDifficulty.label] || 0) + 1; return counts; }, {}),
  { '최하': 12, '중간': 10, '최상': 8 },
);

const card = context.GFIELD_DATA.books.find(book => book && book.accessKey === 'mock-final-5');
assert.ok(card);
assert.match(card.video, /1uhIx_l04EA/);
assert.equal(card.links.length, 3);

const finalPage = fs.readFileSync(path.join(ROOT, 'final.html'), 'utf8');
const answerPage = fs.readFileSync(path.join(ROOT, 'answer.html'), 'utf8');
assert.match(finalPage, /mock-final-'\+roundNum/);
assert.match(finalPage, /이 회차의 열람 권한이 없습니다/);
assert.match(answerPage, /mock-final-'\+RD/);

console.log('PASS final 5 answers, independent checks, diagnosis, access, video, and 30 DB records');
