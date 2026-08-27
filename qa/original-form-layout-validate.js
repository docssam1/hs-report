'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const EXPECTED_RANGES = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24], [25, 26, 27, 28], [29, 30]];

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'mock-data-original.js'), 'utf8'), sandbox);
const model = JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_ORIGINAL));

assert.equal(model.exam.minutes, 80, '원본형 제한시간');
assert.equal(model.roundCount, 2, '원본형 회차 수');

const prompts = [];
for (const roundNumber of [1, 2]) {
  const roundKey = String(roundNumber);
  const round = model.rounds[roundKey];
  assert.equal(round.items.length, 30, `${roundNumber}회 문항 수`);
  assert.equal(round.items.reduce((sum, item) => sum + item.pts, 0).toFixed(1), '100.0', `${roundNumber}회 총점`);
  assert.deepEqual(round.paper.pageRanges, [[1,6],[7,12],[13,18],[19,24],[25,28],[29,30]], `${roundNumber}회 공개 쪽 범위`);

  const htmlPath = path.join(PRIVATE, `original-form-round${roundNumber}-exam.html`);
  const dataPath = path.join(PRIVATE, `original-form-round${roundNumber}-data.json`);
  assert.ok(fs.existsSync(htmlPath), `${roundNumber}회 시험 HTML`);
  assert.ok(fs.existsSync(dataPath), `${roundNumber}회 문항 데이터`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.equal(data.minutes, 80, `${roundNumber}회 생성 데이터 제한시간`);
  assert.equal(data.questions.length, 30, `${roundNumber}회 생성 데이터 문항 수`);
  prompts.push(...data.questions.map((item) => String(item.prompt).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));

  const pages = [...html.matchAll(/<section class="page[^>]*>([\s\S]*?)<\/section>/g)].map((match) => match[1]);
  assert.equal(pages.length, 6, `${roundNumber}회 시험 6쪽`);
  pages.forEach((page, index) => {
    const numbers = [...page.matchAll(/<h2>(\d+)\.<\/h2>/g)].map((match) => Number(match[1]));
    assert.deepEqual(numbers, EXPECTED_RANGES[index], `${roundNumber}회 ${index + 1}쪽 문항 범위`);
  });
  assert.equal((html.match(/<article class="question/g) || []).length, 30, `${roundNumber}회 학생 문항 30개`);
  assert.equal((html.match(/<svg\b/gi) || []).length, 0, `${roundNumber}회 학생 시험에 인라인 SVG 없음`);
  assert.doesNotMatch(html, /class="answer"|정답\s*(?:18개|5개|64|D6|H1)/, `${roundNumber}회 학생 시험에 정답 영역 없음`);
  assert.match(html, /제한시간\s*:\s*80분/, `${roundNumber}회 첫 장 80분 표기`);
}

assert.equal(prompts.length, 60, '두 회차 전체 문항 수');
assert.equal(new Set(prompts).size, 60, '두 회차 문항 지문 중복 없음');

console.log('원본형 60문항·80분·6쪽·래스터 배치 QA 통과');
