'use strict';

const assert = require('node:assert/strict');
global.window = {};
require('../mock-data-original.js');

const firstRound = window.GFIELD_MOCK_ORIGINAL.rounds['1'].items;
assert.equal(firstRound[2].answer, '8개', '1회 3번: 왼발 슬리퍼 개수');
assert.equal(firstRound[5].answer, '7곳', '1회 6번: 줄 교차점 수');
assert.equal(firstRound[8].answer, 'D-A-B-C-E', '1회 9번: 구슬 도착 순서');
assert.equal(firstRound[20].answer, '31가지', '1회 21번: 금지 선분을 피하는 최단거리');
let cardCount = 0;
for (let value = 7306; value < 8035; value++) {
  const remaining = {0: 1, 3: 1, 4: 2, 7: 3, 8: 3, 9: 2};
  if ([...String(value)].every(digit => --remaining[digit] >= 0)) cardCount++;
}
assert.equal(cardCount, 157, '1회 19번: 카드별 사용 횟수에 맞는 수를 독립 열거');
assert.equal(firstRound[18].answer, '157개');

const items = window.GFIELD_MOCK_ORIGINAL.rounds['2'].items;
assert.equal(items[6].answer, '76개', '2회 7번: 손필기 답안의 별 개수');
assert.equal(items[10].answer, '6마리', '2회 11번: 손필기 답안의 낚싯줄 방향 기준');
assert.equal(items[23].answer, '21개', '2회 24번: 손필기 답안의 삼각형 개수');
const validSums = [];
for (let tens = 1; tens <= 9; tens++) {
  for (let ones = 0; ones <= 9; ones++) {
    const addend = 10 * tens + ones;
    const total = 3 * addend;
    if (tens === ones || total < 100 || total > 999) continue;
    const digits = String(total).split('').map(Number);
    if (digits[0] === digits[1] && digits[1] === digits[2] && digits[0] !== tens && digits[0] !== ones) {
      validSums.push(tens + ones + digits[0]);
    }
  }
}
assert.deepEqual(validSums, [11, 13], '2회 14번에는 서로 다른 두 답이 있다');
assert.match(items[13].answer, /11 또는 13/);
assert.match(items[13].answer, /둘 중 하나/);
assert.match(items[17].answer, /다른 배치도 정답/, '2회 18번은 복수 배치를 인정한다');

console.log('Signature answer variants OK');
