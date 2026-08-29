'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), sandbox);
const data = sandbox.window.GFIELD_DATA;

assert.ok(data && Array.isArray(data.nodes) && data.content, '로드맵 데이터 로드');

function week(date) {
  const node = data.nodes.find((item) => item.type === 'week' && item.date === date);
  assert.ok(node, `${date} 주차 노드`);
  return node;
}

function contentFor(date) {
  const node = week(date);
  return { node, content: data.content[node.id] || {} };
}

const august = contentFor('8월 5주차');
assert.equal(august.node.title, 'THINKING CORE CH4', '8월 5주차 제목 유지');
assert.equal(august.node.desc, '', '8월 5주차 설명 비움');
assert.equal(august.node.focus, '', '8월 5주차 핵심훈련 비움');
assert.equal(String(august.content.notice || '').trim(), '', '8월 5주차 학습 내용 비움');
assert.equal(String(august.content.homework || '').trim(), '', '8월 5주차 과제 비움');
assert.deepEqual(Array.from(august.content.textbooks || []), [], '8월 5주차 교재 비움');

const finalWeeks = [
  ['9월 1주차', 1],
  ['9월 2주차', 2],
  ['9월 3주차', 3],
  ['9월 4주차', 4],
];

for (const [date, round] of finalWeeks) {
  const { node, content } = contentFor(date);
  assert.equal(node.title, `파이널 실전 모의고사 ${round}회`, `${date} 제목`);
  assert.match(String(content.notice || ''), new RegExp(`파이널\\s*모의고사\\s*${round}회`), `${date} 상세 내용 회차`);
  const textbooks = Array.from(content.textbooks || []);
  assert.equal(textbooks.length, 3, `${date} 파이널 ${round}회 연결 자료 3개`);
  for (const textbook of textbooks) {
    assert.match(String(textbook.title || ''), new RegExp(`파이널\\s*모의고사\\s*${round}회`), `${date} 교재 제목 회차`);
    assert.match(String(textbook.url || ''), new RegExp(`[?&]round=${round}(?:&|$)`), `${date} 교재 링크 회차`);
  }
}

for (const filename of ['index-enhancements.js', 'admin-mock-v2.js']) {
  const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
  assert.match(
    source,
    /8\\s\*월\\s\*5\\s\*주차\/[^]*?title:'THINKING CORE CH4',[^]*?desc:'',\s*focus:''/,
    `${filename} 8월 5주차 빈 내용 덮어쓰기`,
  );
  assert.match(source, /hasOwnProperty\.call\(o,'desc'\)/, `${filename} 빈 설명 적용 가능`);
  assert.match(source, /hasOwnProperty\.call\(o,'focus'\)/, `${filename} 빈 핵심훈련 적용 가능`);
}

console.log('로드맵 주차 콘텐츠 QA 통과: 8월 5주차 제목만 유지, 파이널 1~4회 상세 내용은 9월 1~4주차에 일치');
