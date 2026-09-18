'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'bank', 'data', 'final7-fixed6.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function key(point) {
  return point.join(',');
}

function simplePaths(cells, start, end) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
  const allowed = new Set(cells.map(key));
  const firstCounts = new Map();
  let total = 0;
  function visit(point, seen, first) {
    if (key(point) === key(end)) {
      total += 1;
      firstCounts.set(key(first), (firstCounts.get(key(first)) || 0) + 1);
      return;
    }
    dirs.forEach(([dx, dy]) => {
      const next = [point[0] + dx, point[1] + dy];
      const nextKey = key(next);
      if (!allowed.has(nextKey) || seen.has(nextKey)) return;
      const nextSeen = new Set(seen);
      nextSeen.add(nextKey);
      visit(next, nextSeen, first || next);
    });
  }
  visit(start, new Set([key(start)]), null);
  return {total, firstCounts: [...firstCounts.values()].sort((a, b) => a - b)};
}

function segmentIntersection(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]];
  const s = [d[0] - c[0], d[1] - c[1]];
  const delta = [c[0] - a[0], c[1] - a[1]];
  const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-9) return null;
  const t = cross(delta, s) / denominator;
  const u = cross(delta, r) / denominator;
  if (t <= 1e-7 || t >= 1 - 1e-7 || u <= 1e-7 || u >= 1 - 1e-7) return null;
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}

function ropeCrossings(points) {
  const hits = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = i + 2; j < points.length - 1; j += 1) {
      if (j === i + 1) continue;
      const hit = segmentIntersection(points[i], points[i + 1], points[j], points[j + 1]);
      if (!hit) continue;
      if (!hits.some((known) => Math.hypot(known[0] - hit[0], known[1] - hit[1]) < 1)) hits.push(hit);
    }
  }
  return hits.sort((a, b) => a[0] - b[0]);
}

assert.equal(data.sourceSet, 'final');
assert.equal(data.sourceRound, 7);
assert.equal(data.freezePolicy.runtimeGeneration, false);
assert.equal(data.freezePolicy.partialRelease, true);
assert.equal(data.freezePolicy.fixedItemCount, 6);
assert.equal(data.freezePolicy.variantsPerSourceQuestion, 3);
assert.deepEqual(data.freezePolicy.availableSourceNos, [5, 6]);
assert.deepEqual(data.reviewSummary, {verified: 6, pending: 0, unavailableSourceQuestions: 28});
assert.equal(data.items.length, 6);
assert.equal(new Set(data.items.map((item) => item.id)).size, 6);

for (const [relativePath, expected] of Object.entries(data.sourceFingerprints)) {
  assert.equal(hash(fs.readFileSync(path.join(ROOT, relativePath))), expected, relativePath + ': source fingerprint');
}

const sandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'mock-data-final.js'), 'utf8'), sandbox);
const sourceRound = sandbox.window.GFIELD_MOCK_FINAL.rounds['7'];
assert.equal(sourceRound.items.find((item) => item.no === 5).answer, '9가지', 'source Q5 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 6).answer, '6마리', 'source Q6 remains traceable');

for (const no of [5, 6]) {
  const group = data.items.filter((item) => item.sourceNo === no).sort((a, b) => a.variantNo - b.variantNo);
  assert.equal(group.length, 3, no + ': exactly three reviewed variants');
  assert.deepEqual(group.map((item) => item.variantNo), [1, 2, 3]);
  assert.equal(new Set(group.map((item) => item.itemContentHash)).size, 3, no + ': three distinct question records');
  const link = registry.sourceItemGenerator('final|7|' + no);
  assert.ok(link, no + ': registry link');
  assert.equal(link.generatorId, 'final7-q' + String(no).padStart(2, '0'));
  assert.equal(link.studentWrongPracticeReady, true);
  assert.equal(link.qaEvidence.suite, 'qa/final7-fixed6-validate.js');
}
assert.equal(registry.sourceItemGenerator('final|7|7'), null, 'unreviewed Final 7 items remain locked');

for (const item of data.items) {
  assert.equal(item.reviewStatus, 'verified', item.id + ': review status');
  assert.equal(item.releaseStatus, 'verified-student-wrong-practice', item.id + ': narrow release scope');
  assert.equal(item.answerPolicy, 'single', item.id + ': single answer');
  assert.equal(item.verification.unique, true, item.id + ': unique answer verified');
  assert.equal(item.verification.validAnswerCount, 1, item.id + ': one valid answer');
  assert.equal(item.verification.visibleEvidence.passed, true, item.id + ': visible evidence');
  assert.ok(Array.isArray(item.solutionSteps) && item.solutionSteps.length === 3, item.id + ': detailed three-step solution');
  assert.equal(item.conditionLines, undefined, item.id + ': no repeated condition list');
  assert.equal(item.promptDataLines, undefined, item.id + ': no helper or hint box');
  assert.doesNotMatch(item.text, /①|②|③|힌트|풀이 순서/, item.id + ': no answer-leading helper copy');
  assert.equal(item.asset.kind, 'raster', item.id + ': approved raster prompt asset');
  assert.match(item.asset.src, /^data:image\/png;base64,/, item.id + ': embedded PNG');
  const bytes = Buffer.from(item.asset.src.split(',')[1], 'base64');
  assert.equal(hash(bytes), item.assetSha256, item.id + ': asset hash');
  assert.ok(item.asset.width >= 720 && item.asset.height >= 300, item.id + ': readable source dimensions');
  assert.equal(bytes.readUInt32BE(16), item.asset.width, item.id + ': PNG width');
  assert.equal(bytes.readUInt32BE(20), item.asset.height, item.id + ': PNG height');
}

for (const item of data.items.filter((item) => item.sourceNo === 5)) {
  const result = simplePaths(item.meta.cells, item.meta.start, item.meta.end);
  assert.equal(result.total, item.meta.simplePathCount, item.id + ': exhaustive simple-path count');
  assert.equal(item.answer, result.total + '가지', item.id + ': path answer');
  assert.deepEqual(result.firstCounts, item.meta.firstBranchCounts.slice().sort((a, b) => a - b), item.id + ': first-branch counts');
  assert.equal(item.assetSpec.renderRules.showAnswerPath, false, item.id + ': no answer path in prompt figure');
  assert.equal(item.assetSpec.renderRules.showCounts, false, item.id + ': no counts in prompt figure');
}

for (const item of data.items.filter((item) => item.sourceNo === 6)) {
  const crossings = ropeCrossings(item.meta.ropePoints);
  assert.equal(item.meta.ropeContinuous, true, item.id + ': one continuous fishing line');
  assert.equal(crossings.length, item.meta.crossingCount, item.id + ': independent crossing count');
  assert.equal(crossings.length, 3, item.id + ': three crossings');
  assert.ok(crossings[1][0] - crossings[0][0] > 120, item.id + ': left and middle crossings are spread apart');
  assert.ok(crossings[2][0] - crossings[1][0] > 120, item.id + ': middle and right crossings are spread apart');
  assert.ok(crossings[2][0] - crossings[0][0] > 380, item.id + ': crossings span the page rather than clustering');
  const front = item.meta.facingFront.map((value, index) => value ? index + 1 : null).filter(Boolean);
  assert.deepEqual(front, item.meta.facingFrontNos, item.id + ': front-facing fish order');
  assert.equal(item.answer, front.length + '마리', item.id + ': fish answer');
  assert.equal(item.assetSpec.renderRules.showAnswerMarks, false, item.id + ': no answer marks in prompt figure');
  assert.equal(item.assetSpec.renderRules.spreadCrossings, true, item.id + ': wide crossing layout contract');
}

console.log('PASS Final 7 Q5/Q6: six reviewed variants, independent path/crossing/answer checks, visible single-answer evidence, and fail-closed partial release');
