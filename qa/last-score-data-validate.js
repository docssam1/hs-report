const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read('last-score-data.js'), context, { filename: 'last-score-data.js' });
const model = context.window.GFIELD_LAST_SCORE_DATA;

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
function r1(value) { return Math.round(value * 10) / 10; }
function percentile(round, score) {
  if (round.percentileTable) {
    const row = round.percentileTable.find(item => score >= item[0]);
    return row ? row[1] : round.percentileTable.at(-1)[1];
  }
  return r1((round.scoreDist.filter(value => value > score).length + 1) / round.cohortSize * 100);
}

check('공통 시험 규격은 90분·30문항·100점', () => {
  assert.equal(model.minutes, 90);
  for (const no of ['1', '2', '3', '4']) {
    const round = model.rounds[no];
    assert.equal(round.items.length, 30, `round ${no} items`);
    assert.equal(round.rates.length, 30, `round ${no} rates`);
    assert.equal(round.videoTimes.length, 30, `round ${no} videoTimes`);
    assert.equal(r1(round.items.reduce((sum, item) => sum + item.pts, 0)), 100);
    assert.deepEqual(Array.from(round.items.slice(0, 12), item => item.pts), Array(12).fill(2.7));
    assert.deepEqual(Array.from(round.items.slice(12, 22), item => item.pts), Array(10).fill(3.4));
    assert.deepEqual(Array.from(round.items.slice(22), item => item.pts), Array(8).fill(4.2));
    assert.ok(round.rates.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
    assert.ok(round.videoTimes.every((value, index, all) => Number.isInteger(value) && value >= 0 && (!index || value >= all[index - 1])));
  }
});

check('사용자 제공 정답률의 경계값이 보존됨', () => {
  assert.equal(model.rounds['1'].rates[0], 0.323809524);
  assert.equal(model.rounds['1'].rates[23], 0);
  assert.equal(model.rounds['2'].rates[5], 0.03030303);
  assert.equal(model.rounds['3'].rates[24], 0.011494253);
  assert.equal(model.rounds['4'].rates[28], 0.020408163);
});

check('회차별 점수 백분율 예시가 원자료와 일치', () => {
  assert.equal(percentile(model.rounds['1'], 31.9), 44.5);
  assert.equal(percentile(model.rounds['2'], 53.9), 5.7);
  assert.equal(percentile(model.rounds['3'], 11.1), 78.6);
  assert.equal(percentile(model.rounds['4'], 66.4), 0.8);
  assert.equal(percentile(model.rounds['4'], 6.8), 81.7);
});

check('누적 판정표가 회차별 독립 기준으로 등록됨', () => {
  assert.deepEqual(Array.from(model.rounds['1'].cumulativeBands, row => Array.from(row)), [[19.1,'경시 가능'],[36.1,'경시컷,심화안정권'],[46.2,'심화컷,실력안정권'],[53.3,'실력컷,일품안정권'],[60,'일품 가능'],[76.4,'일품컷'],[101,'노력요함']]);
  assert.deepEqual(Array.from(model.rounds['2'].cumulativeBands, row => Array.from(row)), [[18.9,'경시 가능'],[28.7,'경시컷,심화안정권'],[41.2,'심화컷,실력안정권'],[46.5,'실력컷,일품안정권'],[58,'일품 가능'],[84.6,'일품컷'],[101,'노력요함']]);
  assert.deepEqual(Array.from(model.rounds['3'].cumulativeBands, row => Array.from(row)), [[22.5,'경시 가능'],[35.3,'경시컷,심화안정권'],[47.8,'심화컷,실력안정권'],[67.3,'실력컷,일품안정권'],[77.3,'일품컷'],[101,'노력요함']]);
  assert.deepEqual(Array.from(model.rounds['4'].cumulativeBands, row => Array.from(row)), [[23.9,'경시 가능'],[32.4,'경시컷,심화안정권'],[46,'심화컷,실력안정권'],[63.7,'실력컷,일품안정권'],[75.6,'일품컷'],[101,'노력요함']]);
});

check('학생·교사 입력과 결과 화면은 동일한 lastN 키를 사용', () => {
  const analysis = read('last1-analysis.html');
  const entry = read('last1-entry.html');
  const result = read('last1-result.html');
  assert.match(analysis, /const ROUND_KEY=ROUND_DATA\.key/);
  assert.match(entry, /var ROUND=round&&round\.key/);
  assert.match(result, /const ROUND=ROUND_DATA&&ROUND_DATA\.key/);
  assert.match(analysis, /order=updated_at\.asc/);
  assert.match(result, /order=updated_at\.asc/);
  assert.match(entry, /source:'online'/);
  assert.match(analysis, /source:'admin'/);
});

check('최종 1회와 최종 2회 이후의 누적 원천이 분리됨', () => {
  const analysis = read('last1-analysis.html');
  const result = read('last1-result.html');
  assert.match(analysis, /roundNo===1\?4:roundNo-1/);
  assert.match(analysis, /key:'final'\+k/);
  assert.match(analysis, /key:'last'\+k/);
  assert.match(result, /if\(roundNo===1\)/);
  assert.match(result, /for\(let lastNo=1;lastNo<=roundNo;lastNo\+\+\)/);
});

check('홈페이지 설명 문구와 4개 회차 진입 링크가 반영됨', () => {
  assert.equal(model.dataProof, '400명 이상의 학생들의 문항과 성적 그리고 실제 결과를 반영한 데이터');
  const analysis = read('last1-analysis.html');
  const result = read('last1-result.html');
  const student = read('index-enhancements.js');
  const admin = read('admin-mock-v2.js');
  assert.match(analysis, /SCORE_MODEL\.dataProof/);
  assert.match(result, /SCORE_MODEL\.dataProof/);
  assert.match(student, /\(\[1-4\]\)/);
  assert.match(student, /\?round='\+round/);
  assert.match(admin, /\[1,2,3,4\]\.map/);
  assert.doesNotMatch(analysis, /대치\s*10등|\d+명\s*(?:중|응시)/);
  assert.doesNotMatch(result, /대치\s*10등|\d+명\s*(?:중|응시)/);
});

console.log(`\n${passed} checks passed`);
