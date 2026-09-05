'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = { window: {} };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'mock-data-final.js'), 'utf8'), context, { filename: 'mock-data-final.js' });

const items = context.GFIELD_MOCK_FINAL.rounds['1'].items;
const byNo = Object.fromEntries(items.map((item) => [item.no, item]));

assert.equal(byNo[17].answer, '37', '현재 등록된 17번 답 확인');
const nonParallelMaximum = 1 + 7 * 8 / 2;
const nonParallelMinimum = 2 * 7;
assert.equal(nonParallelMaximum, 29, '일반 위치 최대 영역 수');
assert.equal(nonParallelMinimum, 14, '서로 평행하지 않고 한 점에 모이는 최소 영역 수');
assert.equal(nonParallelMaximum + nonParallelMinimum, 43, '원문 조건을 그대로 적용한 합');
assert.notEqual(String(nonParallelMaximum + nonParallelMinimum), byNo[17].answer, '17번 등록 답과 원문 조건 계산은 불일치');

assert.equal(byNo[26].answer, '84, 48, 12', '현재 등록된 26번 답 확인');
const ageMatches = [];
for (let grandfather = 20; grandfather <= 99; grandfather++) {
  const father = (grandfather % 10) * 10 + Math.floor(grandfather / 10);
  if (father < 20 || grandfather % 7 !== 0) continue;
  const child = grandfather / 7;
  if (grandfather - father !== 3 * child) continue;
  if (grandfather - father < 20 || father - child < 20) continue;
  ageMatches.push([grandfather, father, child]);
}
assert.deepEqual(ageMatches, [[63, 36, 9], [84, 48, 12]], '26번 조건을 만족하는 나이 조합이 두 개');

console.log('PASS Final 1 source-answer gate: q17 registered answer conflict and q26 two-solution ambiguity remain locked');
