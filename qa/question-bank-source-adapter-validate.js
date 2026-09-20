'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const registry = require(path.join(ROOT, 'bank', 'core', 'adapter-registry.js'));
const adapter = require(path.join(ROOT, 'bank', 'adapters', 'final7-reviewed-adapter.js'));
const data = require(path.join(ROOT, 'bank', 'data', 'final7-reviewed.json'));

assert.deepEqual(registry.validateAdapter(adapter), [], 'adapter interface contract');
adapter.useData(data);

const types = adapter.listTypes();
const sourceItems = adapter.listSourceItems();
assert.equal(types.length, 30, 'thirty normalized reviewed types');
assert.equal(sourceItems.length, 30, 'thirty normalized reviewed source items');
assert.equal(new Set(types.map((type) => type.id)).size, types.length, 'unique type ids');
assert.equal(new Set(sourceItems.map((item) => item.sourceKey)).size, sourceItems.length, 'duplicate sourceKey count is zero');

const requiredTypeFields = ['id','domain','middle','label','gradeBand','solvingModel','visualModel','answerContract','generatorId','rendererId','searchAliases'];
for (const type of types) {
  for (const field of requiredTypeFields) assert.notEqual(type[field], undefined, type.id + ': ' + field);
  assert.ok(adapter.getGenerator(type.generatorId), type.id + ': generator reference');
  assert.ok(adapter.getRenderer(type.rendererId), type.id + ': renderer reference');
}

for (const item of sourceItems) {
  assert.deepEqual(adapter.validateSourceItem(item), [], item.sourceKey + ': normalized source item');
  assert.equal(item.verificationStatus, 'verified');
  assert.equal(item.rights, 'private-source-derived-variant');
  assert.equal(item.answer, undefined, item.sourceKey + ': no official answer in normalized public metadata');
  assert.equal(item.officialAnswer, undefined, item.sourceKey + ': no official answer field');
}

const publicMetadata = JSON.stringify({types,sourceItems});
assert.doesNotMatch(publicMetadata, /[A-Z]:[\\/]|Users[\\/]|AppData|OneDrive/, 'no personal absolute path');
assert.doesNotMatch(publicMetadata, /materials[\\/]final_7|\.pdf|\.jpg/i, 'no private original locator');

const generated = sourceItems.reduce((sum, item) => sum + adapter.getGenerator(types.find((type) => type.id === item.typeIds[0]).generatorId).items.length, 0);
assert.equal(generated, 90, 'all ninety approved variants are reachable through adapter capabilities');
assert.equal(data.reviewSummary.unavailableSourceQuestions, 0, 'no source question remains locked inside the reviewed Q1-Q30 range');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 13).answerContract, 'number-and-count', 'Q13 keeps its number-and-count answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 14).answerContract, 'ordered-triple', 'Q14 keeps its ordered-triple answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 15).answerContract, 'ordered-pair', 'Q15 keeps its ordered-pair answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 16).answerContract, 'single-number', 'Q16 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 17).answerContract, 'single-number', 'Q17 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 18).answerContract, 'entity-and-number', 'Q18 keeps its entity-and-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 19).answerContract, 'single-number', 'Q19 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 20).answerContract, 'single-number', 'Q20 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 21).answerContract, 'single-number', 'Q21 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 22).answerContract, 'single-number', 'Q22 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 23).answerContract, 'single-number', 'Q23 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 24).answerContract, 'single-number', 'Q24 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 25).answerContract, 'single-number', 'Q25 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 26).answerContract, 'single-number', 'Q26 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 27).answerContract, 'single-number', 'Q27 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 28).answerContract, 'single-number', 'Q28 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 29).answerContract, 'single-number', 'Q29 keeps its single-number answer contract');
assert.equal(sourceItems.find((item) => item.sourceLocator.questionNo === 30).answerContract, 'single-number', 'Q30 keeps its single-number answer contract');

console.log('PASS source adapter contract: 30 types, 30 verified sources, 90 variants, 0 locked sources in reviewed range, 0 duplicate keys, 0 missing type/generator/renderer references, 0 private paths or official source answers');
