'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'data', 'final3-fixed90-index.json'), 'utf8'));

const context = { window: {} };
vm.createContext(context);
['mock-data.js', 'mock-data-hw.js', 'mock-data-final.js', 'last-score-data.js', 'mock-data-original.js'].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file, timeout: 3000 });
});

const unified = registry.buildUnifiedCatalog({
  middle: context.window.GFIELD_MOCK,
  applied: context.window.GFIELD_MOCK_HW,
  final: context.window.GFIELD_MOCK_FINAL,
  last: context.window.GFIELD_LAST_SCORE_DATA,
  original: context.window.GFIELD_MOCK_ORIGINAL,
});

assert.equal(index.sourceSet, 'final');
assert.equal(index.sourceRound, 3);
assert.equal(index.items.length, 90, 'Final3 has exactly ninety approved variants');

const overrides = registry.reviewedTaxonomyOverrides.filter((row) => /^final\|3\|/.test(row.sourceKey));
assert.equal(overrides.length, 30, 'Final3 has one reviewed taxonomy decision per source item');
assert.deepEqual(
  overrides.map((row) => row.sourceKey),
  Array.from({ length: 30 }, (_, indexNo) => `final|3|${indexNo + 1}`),
  'Final3 taxonomy decisions are bound only to Q1-Q30 exact source keys',
);

const sourceItems = unified.items.filter((item) => item.sourceRef.set === 'final' && item.sourceRef.round === 3);
assert.equal(sourceItems.length, 30);
assert.ok(sourceItems.every((item) => item.reviewStatus === 'confirmed' && item.reviewRequired === false));

for (let sourceNo = 1; sourceNo <= 30; sourceNo += 1) {
  const source = sourceItems.find((item) => item.sourceRef.no === sourceNo);
  const variants = index.items.filter((item) => item.sourceNo === sourceNo);
  assert.ok(source, `Final3 source Q${sourceNo} exists`);
  assert.equal(variants.length, 3, `Final3 Q${sourceNo} has exactly three variants`);
  assert.deepEqual(variants.map((item) => item.variantNo), [1, 2, 3]);
  assert.ok(variants.every((item) => item.reviewStatus === 'verified'));
  assert.ok(variants.every((item) => item.genId === `final3-q${String(sourceNo).padStart(2, '0')}`));
  assert.ok(variants.every((item) => item.area === source.area));
  assert.ok(variants.every((item) => item.subarea === source.subarea));
  assert.ok(variants.every((item) => item.detailType === source.detailType));
  assert.equal(source.generator.generatorId, `final3-q${String(sourceNo).padStart(2, '0')}`);
  assert.equal(source.generator.studentWrongPracticeReady, true);
  assert.equal(source.generator.qaEvidence.suite, 'qa/final3-fixed90-validate.js');
  assert.equal(source.generator.qaEvidence.generatedQuestions, 3);
}

assert.equal(new Set(index.items.map((item) => item.id)).size, 90, 'variant ids are unique');
assert.equal(new Set(sourceItems.map((item) => item.sourceKey)).size, 30, 'source keys are unique');

console.log('PASS Final3 taxonomy integration: 30 approved source types, 90 verified variants, exact 1:3 links, and student wrong-practice routing');
