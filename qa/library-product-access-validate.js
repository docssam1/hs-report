const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), context, { filename: 'data.js' });

const data = context.window.GFIELD_DATA;
const basic = data.books.find(book => book && /THINKING BASIC/i.test(String(book.title || '')));
const core = data.books.find(book => book && /Thinking Core/i.test(String(book.title || '')));

assert.ok(basic, 'THINKING BASIC 교재가 있어야 함');
assert.ok(core, 'Thinking Core 교재가 있어야 함');
assert.equal(basic.accessKey, 'concept-basic', 'BASIC은 독립 승인 키를 사용');
assert.equal(core.accessKey, 'concept-core', 'CORE는 독립 승인 키를 사용');
assert.notEqual(basic.accessKey, core.accessKey, 'BASIC과 CORE 승인 키는 달라야 함');

const products = data.archiveProductAccess || {};
assert.ok(Array.isArray(products['concept-basic']), 'BASIC 승인 명단 필요');
assert.ok(Array.isArray(products['concept-core']), 'CORE 승인 명단 필요');
assert.notStrictEqual(products['concept-basic'], products['concept-core'], '두 승인 명단은 독립 배열이어야 함');

assert.ok(products['concept-basic'].includes('노관호'), '기존 BASIC 승인 명단은 유지');
assert.ok(products['concept-core'].includes('노관호'), '기존 CORE 승인 명단은 유지');

const mockItems = [
  ['중급 모의고사 7회', 'mock-mid-7'],
  ['중급 모의고사 8회', 'mock-mid-8'],
  ['최종 실전 모의고사 5회', 'mock-final-5'],
  ['최종 실전 모의고사 6회', 'mock-final-6'],
  ['최종 실전 모의고사 7회', 'mock-final-7'],
  ['최종 실전 모의고사 8회', 'mock-final-8'],
  ['최종 실전 모의고사 9회', 'mock-final-9'],
];
for (const [title, key] of mockItems) {
  const book = data.books.find(item => item && item.title === title);
  assert.ok(book, `${title} 항목이 있어야 함`);
  assert.equal(book.accessKey, key, `${title}은 독립 승인 키를 사용`);
  assert.deepEqual(Array.from(products[key] || []), [], `${title}은 선생님이 승인하기 전 비공개`);
}

const mockKeys = mockItems.map(([, key]) => key).concat('mock-signature-1', 'mock-signature-2');
assert.equal(new Set(mockKeys).size, 9, '9개 모의고사 승인 키는 모두 달라야 함');
for (const key of mockKeys) assert.ok(Array.isArray(products[key]), `${key} 승인 명단 필요`);

const final5 = data.books.find(book => book && book.title === '최종 실전 모의고사 5회');
assert.equal(final5.imgdir, 'final_5', '최종 5회 이미지 폴더 연결');
assert.equal(final5.pages, 7, '최종 5회는 7쪽');
assert.match(final5.pdf, /초등|%EC%B4%88/, '최종 5회 PDF 연결');
assert.deepEqual(Array.from(final5.links || []).map(link => link.label), ['실전 타이머', '오답 입력·분석', '답안·교재 연결표'], '최종 5회 학습 흐름 연결');
assert.match(final5.video, /1uhIx_l04EA/, '최종 5회 풀이 영상 연결');
assert.ok(fs.existsSync(path.join(ROOT, 'materials', '초등과정 대비 최종 모의고사 5회.pdf')), '최종 5회 PDF 파일 필요');
for (let page = 1; page <= 7; page += 1) {
  assert.ok(fs.existsSync(path.join(ROOT, 'materials', 'final_5', `${String(page).padStart(3, '0')}.jpg`)), `최종 5회 ${page}쪽 이미지 필요`);
}

function canSeeBook(book, student, productAccess, folderAccess) {
  const key = String(book.accessKey || '');
  if (!key) return (folderAccess[book.folder] || []).includes(student);
  const access = productAccess[key];
  return Array.isArray(access) && (access.includes('*') || access.includes(student));
}

const splitAccess = {
  'concept-basic': ['BASIC학생'],
  'concept-core': ['CORE학생'],
  'mock-final-5': ['5회학생'],
  'mock-final-6': ['6회학생'],
};
assert.equal(canSeeBook(basic, 'BASIC학생', splitAccess, {}), true);
assert.equal(canSeeBook(core, 'BASIC학생', splitAccess, {}), false);
assert.equal(canSeeBook(basic, 'CORE학생', splitAccess, {}), false);
assert.equal(canSeeBook(core, 'CORE학생', splitAccess, {}), true);
const final6 = data.books.find(book => book && book.title === '최종 실전 모의고사 6회');
assert.equal(canSeeBook(final5, '5회학생', splitAccess, {}), true);
assert.equal(canSeeBook(final6, '5회학생', splitAccess, {}), false);

const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const admin = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');
const enhancements = fs.readFileSync(path.join(ROOT, 'index-enhancements.js'), 'utf8');
assert.match(index, /function canSeeBook\(book\)/, '학생 서재에 교재별 게이트가 있어야 함');
assert.match(index, /filter\(b=>b&&b\.folder===folder&&canSeeBook\(b\)/, '렌더 전에 교재별 승인을 검사');
assert.match(index, /if\(b\.accessKey&&!canSeeBook\(b\)\)/, '직접 열기에도 승인 검사를 적용');
assert.match(admin, /id="product-acc-matrix"/, '관리자에 별도 판매 승인표가 있어야 함');
assert.match(admin, /\['concept-basic','개념 과정 BASIC'\]/, 'BASIC 승인 행이 있어야 함');
assert.match(admin, /\['concept-core','개념 과정 CORE'\]/, 'CORE 승인 행이 있어야 함');
for (const [title, key] of mockItems) {
  assert.match(admin, new RegExp(`\\['${key}','${title}'\\]`), `${title} 관리자 승인 행이 있어야 함`);
}
assert.match(admin, /\['mock-signature-1','초등선발 대비 시그니처 실전 모의고사 1회'\]/, '시그니처 1회 관리자 승인 행');
assert.match(admin, /\['mock-signature-2','초등선발 대비 시그니처 실전 모의고사 2회'\]/, '시그니처 2회 관리자 승인 행');
assert.match(enhancements, /title:'초등선발 대비 시그니처 실전 모의고사 1회',[\s\S]*?accessKey:'mock-signature-1'/, '시그니처 1회 독립 승인 키');
assert.match(enhancements, /title:'초등선발 대비 시그니처 실전 모의고사 2회',[\s\S]*?accessKey:'mock-signature-2'/, '시그니처 2회 독립 승인 키');
assert.match(admin, /Object\.keys\(S\.archiveProductAccess\)/, '학생 삭제 시 상품 승인도 정리');

console.log('PASS independent approvals and final round 5 library assets');
