const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read('last-score-data.js'), context, { filename: 'last-score-data.js' });
vm.runInContext(read('last-answer-data.js'), context, { filename: 'last-answer-data.js' });

const scoreModel = context.window.GFIELD_LAST_SCORE_DATA;
const answerModel = context.window.GFIELD_LAST_ANSWER_DATA;
const page = read('last-answer.html');
let passed = 0;

function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}

check('답안 데이터는 최종 2~4회 각각 30문항', () => {
  assert.deepEqual(Object.keys(answerModel.rounds), ['2', '3', '4']);
  for (const no of ['2', '3', '4']) {
    assert.equal(answerModel.rounds[no].length, 30, `round ${no}`);
    assert.equal(scoreModel.rounds[no].items.length, 30, `score round ${no}`);
  }
});

check('검수 대기 문항은 정답 값을 저장하지 않음', () => {
  const expected = { '2': [], '3': [6, 8, 11, 25], '4': [19] };
  for (const no of ['2', '3', '4']) {
    const pending = [];
    answerModel.rounds[no].forEach((item, index) => {
      assert.ok(item.status === 'verified' || item.status === 'pending');
      assert.equal(typeof item.explanation, 'string');
      assert.ok(item.explanation.trim().length > 0);
      if (item.status === 'pending') {
        pending.push(index + 1);
        assert.equal(item.answer, null);
      } else {
        assert.equal(typeof item.answer, 'string');
        assert.ok(item.answer.trim().length > 0);
      }
    });
    assert.deepEqual(pending, expected[no], `round ${no} pending`);
  }
});

check('확정 교정값과 단일 답 표시가 보존됨', () => {
  assert.equal(answerModel.rounds['2'][18].answer, '7번째 줄 58번째');
  assert.equal(answerModel.rounds['2'][25].answer, '9문제');
  assert.equal(answerModel.rounds['3'][5].answer, null);
  assert.equal(answerModel.rounds['3'][7].answer, null);
  assert.equal(answerModel.rounds['3'][9].answer, '목요일');
  assert.equal(answerModel.rounds['3'][25].answer, '0');
  assert.equal(answerModel.rounds['4'][1].answer, '539−468=71');
  assert.equal(answerModel.rounds['4'][9].answer, '진미가 2초 먼저');
  assert.equal(answerModel.rounds['4'][18].answer, null);
  assert.equal(answerModel.rounds['4'][26].answer, '120명');
});

check('답안 화면은 엄격한 회차와 90분 규격을 사용', () => {
  assert.match(page, /\^\[234\]\$/);
  assert.doesNotMatch(page, /\|\|\s*['"]2['"]/);
  assert.match(page, /제한시간 90분/);
  assert.match(page, /scoreRoot\.minutes/);
  assert.match(page, /mock-data-last3\.js/);
  assert.match(page, /mock-data-last4\.js/);
  assert.match(page, /paperRound\.ready!==true/);
  assert.match(page, /status==='pending'/);
  assert.match(page, /🔒 검수 대기/);
});

check('정답률과 문항별 영상 링크는 성적 기준을 단일 원천으로 사용', () => {
  assert.match(page, /scoreData\.rates\[index\]/);
  assert.match(page, /scoreData\.videoTimes\[index\]/);
  assert.match(page, /scoreData\.video/);
  for (const no of ['2', '3', '4']) {
    const round = scoreModel.rounds[no];
    assert.equal(round.rates.length, 30);
    assert.equal(round.videoTimes.length, 30);
    assert.ok(round.videoTimes.every((value, index, all) => !index || value >= all[index - 1]));
  }
});

check('학생 화면에 응시 인원·절대 등수를 노출하지 않음', () => {
  assert.doesNotMatch(page, /\d+\s*명\s*(?:중|응시)|절대\s*등수|전체\s*인원/);
});

console.log(`\n${passed} checks passed`);
