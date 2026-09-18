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
assert.equal(types.length, 6, 'six normalized reviewed types');
assert.equal(sourceItems.length, 6, 'six normalized reviewed source items');
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
assert.equal(generated, 18, 'all eighteen approved variants are reachable through adapter capabilities');
assert.equal(data.reviewSummary.unavailableSourceQuestions, 24, 'unreviewed source questions remain outside the adapter release');

console.log('PASS source adapter contract: 6 types, 6 verified sources, 18 variants, 24 locked sources, 0 duplicate keys, 0 missing type/generator/renderer references, 0 private paths or official source answers');
