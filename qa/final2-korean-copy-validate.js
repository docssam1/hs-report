'use strict';
// Validate learner-facing explanation copy without reading learner records.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const box = {window:{}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root, 'final2-detailed-data.js'), 'utf8'), box);
const unexpectedKana = /[\u3040-\u30ff]/u;
function checkCopy(value, location) {
  if (typeof value === 'string') {
    assert.ok(!unexpectedKana.test(value), 'Unexpected Japanese copy: '+location);
  } else if (Array.isArray(value)) {
    value.forEach((entry, index) => checkCopy(entry, location+'['+index+']'));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => checkCopy(entry, location+'.'+key));
  }
}
const items = box.window.GFIELD_FINAL2_DETAILED.items;
assert.ok(items.length > 0, 'No explanations loaded');
for (const item of items) {
  for (const key of ['title','answer','read','method','steps','check','caution','comment']) {
    checkCopy(item[key], 'q'+item.no+'.'+key);
  }
}
vm.runInContext(fs.readFileSync(path.join(root, 'final2-solution-diagrams.js'), 'utf8'), box);
for (let no=1; no<=30; no++) {
  checkCopy(box.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS.render(no), 'diagram'+no);
}
assert.throws(() => checkCopy(String.fromCodePoint(0x3042), 'negative-control'));
console.log('PASS Korean explanation copy: '+items.length+' items; unexpected Japanese-script control rejected');
