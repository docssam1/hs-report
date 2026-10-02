'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), sandbox);
const data = sandbox.window.GFIELD_DATA;
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const start = index.indexOf('  function sectionsHTML(c, node){');
const end = index.indexOf('  function wireSections(scope, target){', start);
assert.ok(start > 0 && end > start, '로드맵 자료 표시 함수');
const render = vm.runInNewContext(`${index.slice(start, end)}\nsectionsHTML`, {
  currentStudent: '검수',
  canSeeTB: () => true,
  escHtml: (value) => String(value || ''),
  escAttr: (value) => String(value || ''),
  linkify: (value) => String(value || ''),
});

for (let round = 1; round <= 4; round += 1) {
  const week = data.nodes.find((node) => node.date === `10월 ${round}주차`);
  const book = data.books.find((item) => item.title === `최종 실전 모의고사 ${round}회`);
  assert.ok(week && book, `최종 ${round}회 로드맵·자료실 원본`);

  const content = data.content[week.id];
  assert.ok(content, `10월 ${round}주차 상세 내용`);
  assert.ok(String(content.notice || '').includes(book.video), `최종 ${round}회 풀이 영상 일치`);
  assert.equal(String(content.homework || ''), '', `최종 ${round}회 과제 임의 추가 금지`);

  const materials = Array.from(content.textbooks || []);
  const exam = materials.find((item) => item.folder === book.imgdir && item.pages === book.pages);
  assert.ok(exam, `최종 ${round}회 원본 시험지 연결`);
  for (let page = 1; page <= book.pages; page += 1) {
    assert.ok(fs.existsSync(path.join(root, 'materials', book.imgdir, `${String(page).padStart(3, '0')}.jpg`)),
      `최종 ${round}회 시험지 ${page}쪽`);
  }

  for (const label of ['답안·해설', '성적 확인·진단']) {
    const sourceLink = Array.from(book.links || []).find((link) => link.label === label);
    assert.ok(sourceLink, `최종 ${round}회 자료실 ${label}`);
    assert.ok(materials.some((item) => item.url === sourceLink.url), `최종 ${round}회 로드맵 ${label} 일치`);
  }

  const markup = render(content, week);
  assert.ok(markup.includes(`data-tbf="${book.imgdir}"`), `최종 ${round}회 원본 시험지 인쇄 버튼`);
  assert.ok(markup.includes(`href="${book.links.find((link) => link.label === '답안·해설').url}"`),
    `최종 ${round}회 답안 링크는 PDF 인쇄가 아닌 화면 이동`);
}

console.log('최종 1~4회 10월 로드맵 영상·시험지·답안·진단 연결 검증 통과');
