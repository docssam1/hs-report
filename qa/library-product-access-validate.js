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

const legacy = data.archiveAccess['개념 교재'];
assert.deepEqual(Array.from(products['concept-basic']), Array.from(legacy), '기존 BASIC 이용자는 유지');
assert.deepEqual(Array.from(products['concept-core']), Array.from(legacy), '기존 CORE 이용자는 유지');

function canSeeBook(book, student, productAccess, folderAccess) {
  const key = String(book.accessKey || '');
  if (!key) return (folderAccess[book.folder] || []).includes(student);
  const access = productAccess[key];
  return Array.isArray(access) && (access.includes('*') || access.includes(student));
}

const splitAccess = {
  'concept-basic': ['BASIC학생'],
  'concept-core': ['CORE학생'],
};
assert.equal(canSeeBook(basic, 'BASIC학생', splitAccess, {}), true);
assert.equal(canSeeBook(core, 'BASIC학생', splitAccess, {}), false);
assert.equal(canSeeBook(basic, 'CORE학생', splitAccess, {}), false);
assert.equal(canSeeBook(core, 'CORE학생', splitAccess, {}), true);

const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const admin = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');
assert.match(index, /function canSeeBook\(book\)/, '학생 서재에 교재별 게이트가 있어야 함');
assert.match(index, /filter\(b=>b&&b\.folder===folder&&canSeeBook\(b\)/, '렌더 전에 교재별 승인을 검사');
assert.match(index, /if\(b\.accessKey&&!canSeeBook\(b\)\)/, '직접 열기에도 승인 검사를 적용');
assert.match(admin, /id="product-acc-matrix"/, '관리자에 별도 판매 승인표가 있어야 함');
assert.match(admin, /\['concept-basic','개념 과정 BASIC'\]/, 'BASIC 승인 행이 있어야 함');
assert.match(admin, /\['concept-core','개념 과정 CORE'\]/, 'CORE 승인 행이 있어야 함');
assert.match(admin, /Object\.keys\(S\.archiveProductAccess\)/, '학생 삭제 시 상품 승인도 정리');

console.log('PASS independent BASIC/CORE library product approvals with legacy access compatibility');
