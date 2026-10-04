'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'bank', 'data', 'final8-reviewed.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));

/* ── Top-level schema ── */
assert.equal(data.version, '8.1.0');
assert.equal(data.sourceSet, 'final');
assert.equal(data.sourceRound, 8);
assert.equal(data.freezePolicy.runtimeGeneration, false);
assert.equal(data.freezePolicy.partialRelease, false);
assert.equal(data.freezePolicy.fixedItemCount, 90);
assert.equal(data.freezePolicy.variantsPerSourceQuestion, 3);
assert.deepEqual(data.freezePolicy.availableSourceNos, Array.from({length:30}, (_, i) => i + 1));
assert.equal(data.items.length, 90);
assert.equal(new Set(data.items.map((item) => item.id)).size, 90);

/* ── Per-item schema ── */
for (const item of data.items) {
  assert.equal(item.sourceSet, 'final', item.id + ': sourceSet');
  assert.equal(item.sourceRound, 8, item.id + ': sourceRound');
  assert.ok(item.sourceNo >= 1 && item.sourceNo <= 30, item.id + ': sourceNo in range');
  assert.ok(item.variantNo >= 1 && item.variantNo <= 3, item.id + ': variantNo in range');
  assert.equal(item.id, item.genId + '-v' + item.variantNo, item.id + ': id format');
  assert.equal(item.reviewStatus, 'verified', item.id + ': all items verified');
  assert.equal(item.releaseStatus, 'verified-student-wrong-practice', item.id + ': release status');
  assert.ok(typeof item.text === 'string' && item.text.length > 0, item.id + ': text present');
  assert.ok(typeof item.answer === 'string' && item.answer.length > 0, item.id + ': answer present');
  assert.ok(Array.isArray(item.solutionSteps) && item.solutionSteps.length >= 1, item.id + ': solution steps');
  assert.ok(typeof item.area === 'string', item.id + ': area');
  assert.ok(typeof item.subarea === 'string', item.id + ': subarea');
  assert.ok(typeof item.detailType === 'string', item.id + ': detailType');
  assert.ok(['2.7','3.4','4.2'].includes(item.pointBand), item.id + ': valid pointBand');
  if (item.sourceNo <= 12) assert.equal(item.pointBand, '2.7', item.id + ': 2.7 band');
  else if (item.sourceNo <= 22) assert.equal(item.pointBand, '3.4', item.id + ': 3.4 band');
  else assert.equal(item.pointBand, '4.2', item.id + ': 4.2 band');
}

/* ── Three variants per question ── */
for (let no = 1; no <= 30; no++) {
  const group = data.items.filter((item) => item.sourceNo === no).sort((a, b) => a.variantNo - b.variantNo);
  assert.equal(group.length, 3, no + ': exactly three reviewed variants');
  assert.deepEqual(group.map((item) => item.variantNo), [1, 2, 3]);
  assert.equal(new Set(group.map((item) => item.id)).size, 3, no + ': three distinct item ids');
}

/* ── Registry links ── */
for (let no = 1; no <= 30; no++) {
  const link = registry.sourceItemGenerator('final|8|' + no);
  assert.ok(link, no + ': registry link exists');
  assert.equal(link.generatorId, 'final8-q' + String(no).padStart(2, '0'));
  assert.equal(link.studentWrongPracticeReady, true);
  assert.equal(link.qaEvidence.suite, 'qa/final8-variant-review-validate.js');
}
assert.equal(registry.sourceItemGenerator('final|8|31'), null, 'items outside Final 8 range are locked');

/* ── Independently verified answer spot-checks ── */
/* Q6 serpentine grid: v1=215, v2=272, v3=178 */
const q6 = data.items.filter((i) => i.sourceNo === 6).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q6[0].answer, '215', 'Q6 v1 answer');
assert.equal(q6[1].answer, '272', 'Q6 v2 answer');
assert.equal(q6[2].answer, '178', 'Q6 v3 answer');

/* Q7 triangle count: v1=17개, v2=11개, v3=22개 */
const q7 = data.items.filter((i) => i.sourceNo === 7).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q7[0].answer, '17개', 'Q7 v1 answer');
assert.equal(q7[1].answer, '11개', 'Q7 v2 answer');
assert.equal(q7[2].answer, '22개', 'Q7 v3 answer');

/* Q19 group sequence position: v1=89번째, v2=63번째, v3=55번째 */
const q19 = data.items.filter((i) => i.sourceNo === 19).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q19[0].answer, '89번째', 'Q19 v1 answer');
assert.equal(q19[1].answer, '63번째', 'Q19 v2 answer');
assert.equal(q19[2].answer, '55번째', 'Q19 v3 answer');

/* Q21 stair ring sum: v1=2100개, v2=3440개, v3=1600개 */
const q21 = data.items.filter((i) => i.sourceNo === 21).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q21[0].answer, '2100개', 'Q21 v1 answer');
assert.equal(q21[1].answer, '3440개', 'Q21 v2 answer');
assert.equal(q21[2].answer, '1600개', 'Q21 v3 answer');

/* Q29 alphametics: v1=2개, v2=3개, v3=2개 */
const q29 = data.items.filter((i) => i.sourceNo === 29).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q29[0].answer, '2개', 'Q29 v1 answer');
assert.equal(q29[1].answer, '3개', 'Q29 v2 answer');
assert.equal(q29[2].answer, '2개', 'Q29 v3 answer');

/* Q30 cube matchstick edge count: v1=57개, v2=68개, v3=67개 */
const q30 = data.items.filter((i) => i.sourceNo === 30).sort((a,b) => a.variantNo - b.variantNo);
assert.equal(q30[0].answer, '57개', 'Q30 v1 answer');
assert.equal(q30[1].answer, '68개', 'Q30 v2 answer');
assert.equal(q30[2].answer, '67개', 'Q30 v3 answer');

console.log('PASS Final 8 Q1-Q30: ninety reviewed variants, all verified, registry links, and confirmed rework answers');
