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
assert.equal(items.length, 30, '파이널 1회 답안 30문항 연결');
assert.ok(items.every((item) => item.answer && item.comment && item.caution), '30문항 모두 정답·풀이·주의점 연결');

const cards = [2, 3, 4, 5];
const products = [];
function permute(prefix, rest) {
  if (!rest.length) {
    for (let split = 1; split <= 3; split++) products.push(Number(prefix.slice(0, split).join('')) * Number(prefix.slice(split).join('')));
    return;
  }
  rest.forEach((digit, index) => permute(prefix.concat(digit), rest.slice(0, index).concat(rest.slice(index + 1))));
}
permute([], cards);
assert.equal(Math.min(...products), 690, '4번은 한 자리 수×세 자리 수를 포함한 최솟값');
assert.equal(Math.max(...products), 2236, '4번 전체 자리 나누기의 최댓값');
assert.equal(Math.max(...products) - Math.min(...products), Number(byNo[4].answer), '4번 등록 답은 두 자연수의 자리 수를 제한하지 않은 계산과 일치');
assert.match(byNo[4].caution, /두 자리 수×두 자리 수라는 조건이 없습니다/, '4번 지문 조건 주의가 진단에 명시됨');
assert.match(byNo[7].comment, /수직선을 그리세요/, '7번 수직선 풀이 지침');
assert.match(byNo[13].comment, /양쪽 묶음의 합이 같/, '13번 가로·세로 전체 합 불변 풀이');
assert.equal(byNo[18].answer, '40', '18번 연결 답안');
assert.match(byNo[18].comment, /두 번 반복/, '18번 반복 횟수 지문 이해');
assert.equal(18 * 2 + 4, Number(byNo[18].answer), '18번 필기 풀이의 바깥 조각과 가운데 조각 계산');
assert.equal(byNo[20].answer, '24', '20번 연결 답안');
assert.equal(6 * 4, Number(byNo[20].answer), '20번 필기 풀이의 여섯 사각뿔별 네 조각 계산');
assert.match(byNo[22].caution, /자료실의 「도형의 개수」/, '22번 자료실 후속 학습 연결');

assert.equal(byNo[17].answer, '37', '현재 등록된 17번 답 확인');
const boundedMaximum = 1 + 7 * 8 / 2;
const boundedMinimumWithOutsideIntersections = 7 + 1;
assert.equal(boundedMaximum, 29, '판 안에서 모든 교점이 서로 다를 때 최대 영역 수');
assert.equal(boundedMinimumWithOutsideIntersections, 8, '서로 평행하지 않아도 모든 교점이 판 밖이면 판 안의 최소 영역 수');
assert.equal(String(boundedMaximum + boundedMinimumWithOutsideIntersections), byNo[17].answer, '17번은 세는 범위를 판 안으로 명시하면 등록 답과 일치');

assert.equal(byNo[26].answer, '63, 36, 9 또는 84, 48, 12 (둘 중 하나)', '26번은 두 답 중 한 가지를 허용');
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
assert.match(byNo[26].caution, /가운데 한 가지만/, '26번 답안의 한 가지 답 허용 지침');

console.log('PASS Final 1 source-answer gate: 30 answers/solutions linked; q17 bounded-domain and q26 any-one-of-two contracts verified');
