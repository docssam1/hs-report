'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'bank', 'data', 'final7-reviewed.json');
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

function permutations(number) {
  const digits = String(number).split('');
  const results = new Set();
  function visit(prefix, remaining) {
    if (!remaining.length) { results.add(Number(prefix)); return; }
    remaining.forEach((digit, index) => visit(prefix + digit, remaining.filter((_, i) => i !== index)));
  }
  visit('', digits);
  return [...results].sort((a, b) => a - b);
}

function minimumSelected(max, count, target) {
  for (let smallest = 1; smallest <= max; smallest += 1) {
    let sums = new Set(['0:0']);
    for (let value = smallest + 1; value <= max; value += 1) {
      const next = new Set(sums);
      for (const state of sums) {
        const [used, sum] = String(state).split(':').map(Number);
        if (used < count - 1) next.add((used + 1) + ':' + (sum + value));
      }
      sums = next;
    }
    if (sums.has((count - 1) + ':' + (target - smallest))) return smallest;
  }
  return null;
}

assert.equal(data.sourceSet, 'final');
assert.equal(data.sourceRound, 7);
assert.equal(data.freezePolicy.runtimeGeneration, false);
assert.equal(data.freezePolicy.partialRelease, false);
assert.equal(data.freezePolicy.fixedItemCount, 90);
assert.equal(data.freezePolicy.variantsPerSourceQuestion, 3);
assert.deepEqual(data.freezePolicy.availableSourceNos, Array.from({length:30}, (_, index) => index + 1));
assert.deepEqual(data.reviewSummary, {verified: 90, pending: 0, unavailableSourceQuestions: 0});
assert.equal(data.items.length, 90);
assert.equal(new Set(data.items.map((item) => item.id)).size, 90);

for (const [relativePath, expected] of Object.entries(data.sourceFingerprints)) {
  assert.equal(hash(fs.readFileSync(path.join(ROOT, relativePath))), expected, relativePath + ': source fingerprint');
}

const sandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'mock-data-final.js'), 'utf8'), sandbox);
const sourceRound = sandbox.window.GFIELD_MOCK_FINAL.rounds['7'];
const tutorSandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'final7-original-tutor.js'), 'utf8'), tutorSandbox);
const q28Tutor = tutorSandbox.window.GFIELD_FINAL7_ORIGINAL_TUTOR.scriptedTutors[28];
const q21Tutor = tutorSandbox.window.GFIELD_FINAL7_ORIGINAL_TUTOR.scriptedTutors[21];
const q22Tutor = tutorSandbox.window.GFIELD_FINAL7_ORIGINAL_TUTOR.scriptedTutors[22];
const q5Tutor = tutorSandbox.window.GFIELD_FINAL7_ORIGINAL_TUTOR.scriptedTutors[5];
assert.equal(q5Tutor.answer, '11가지', 'Q5 tutor uses the independently enumerated correction');
assert.match(q5Tutor.steps[0].speech, /한 번 지난 칸은 다시 지나지 않고/, 'Q5 states the user-confirmed no-revisit rule');
assert.match(q5Tutor.steps[1].speech, /4가지/, 'Q5 counts the center-first branch');
assert.match(q5Tutor.steps[2].speech, /3가지.*4가지.*7가지/, 'Q5 counts all right-lower-first branches');
assert.match(q21Tutor.steps[1].speech, /56×58×60=194880/, 'Q21 proves that candidates below 58 cannot reach 200000');
assert.match(q21Tutor.steps[2].speech, /58×60×62=215760.*60×62×64=238080.*62×64×66=261888/, 'Q21 checks every candidate from 58 through the first match');
assert.match(q22Tutor.steps[0].speech, /모든 학생을 한 묶음 R/, 'Q22 keeps every non-4th/non-6th grade in one remainder group');
assert.doesNotMatch(q22Tutor.steps.map((step) => step.speech + ' ' + (step.deep || '')).join(' '), /4·5·6학년만|5학년만/, 'Q22 does not invent a three-grade-only source condition');
assert.match(q28Tutor.steps[1].speech, /8\+10=18.*5\+14=19.*6\+13=19/, 'Q28 starts from the visible sample and pairs opposite neighbors');
assert.match(q28Tutor.steps[1].deep, /2○, 2○\+1, 2○\+1/, 'Q28 generalizes the three opposite-pair sums without a row variable');
assert.doesNotMatch(q28Tutor.steps[1].speech, /○−4/, 'Q28 does not reuse the sample number 9 offsets for the unknown target');
assert.doesNotMatch(q28Tutor.steps.map((step) => step.speech + ' ' + (step.deep || '')).join(' '), /r번째 줄|○−r/, 'Q28 avoids an age-inappropriate row variable');
assert.match(q28Tutor.steps[3].speech, /22, 23, 29, 31, 38, 39/, 'Q28 verifies the actual six neighbors of 30');
assert.equal(sourceRound.items.find((item) => item.no === 5).officialAnswer, '9가지', 'source Q5 official answer remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 5).answer, '11가지', 'source Q5 learner answer uses the independently verified correction');
assert.equal(sourceRound.items.find((item) => item.no === 6).answer, '6마리', 'source Q6 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 7).answer, '136', 'source Q7 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 8).answer, '425', 'source Q8 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 9).answer, '40', 'source Q9 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 10).answer, '50', 'source Q10 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 11).answer, '15개', 'source Q11 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 12).answer, '$\\frac{1}{128}$', 'source Q12 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 13).answer, '2가 12개', 'source Q13 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 14).answer, '101, 148, 145', 'source Q14 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 15).answer, '(3, 50)', 'source Q15 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 16).answer, '165', 'source Q16 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 17).answer, '210', 'source Q17 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 18).answer, '병 16살', 'source Q18 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 19).answer, '382개', 'source Q19 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 20).answer, '216g', 'source Q20 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 21).answer, '62', 'source Q21 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 22).answer, '75명', 'source Q22 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 23).answer, '169', 'source Q23 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 24).answer, '4명', 'source Q24 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 25).answer, '3마리', 'source Q25 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 25).subarea, '배수 관계와 합', 'source Q25 is not mislabeled as a remainder problem');
assert.equal(sourceRound.items.find((item) => item.no === 26).answer, '2014년', 'source Q26 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 27).answer, '5주일', 'source Q27 remains traceable');
assert.match(sourceRound.items.find((item) => item.no === 27).type, /51배/, 'source Q27 includes the existing infected person in the weekly multiplier');
assert.equal(sourceRound.items.find((item) => item.no === 28).answer, '30', 'source Q28 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 29).answer, '192가지', 'corrected source Q29 remains traceable');
assert.equal(sourceRound.items.find((item) => item.no === 30).answer, '128', 'source Q30 remains traceable');

for (const no of Array.from({length:30}, (_, index) => index + 1)) {
  const group = data.items.filter((item) => item.sourceNo === no).sort((a, b) => a.variantNo - b.variantNo);
  assert.equal(group.length, 3, no + ': exactly three reviewed variants');
  assert.deepEqual(group.map((item) => item.variantNo), [1, 2, 3]);
  assert.equal(new Set(group.map((item) => item.itemContentHash)).size, 3, no + ': three distinct question records');
  const link = registry.sourceItemGenerator('final|7|' + no);
  assert.ok(link, no + ': registry link');
  assert.equal(link.generatorId, 'final7-q' + String(no).padStart(2, '0'));
  assert.equal(link.studentWrongPracticeReady, true);
  assert.equal(link.qaEvidence.suite, 'qa/final7-reviewed-validate.js');
}
assert.equal(registry.sourceItemGenerator('final|7|31'), null, 'items outside the Final 7 source range remain locked');

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
  if (item.sourceNo <= 6 || item.sourceNo === 12 || item.sourceNo === 15 || item.sourceNo === 17 || item.sourceNo === 21 || item.sourceNo === 28 || item.sourceNo === 29) {
    assert.equal(item.asset.kind, 'raster', item.id + ': approved raster prompt asset');
    assert.match(item.asset.src, /^data:image\/png;base64,/, item.id + ': embedded PNG');
    const bytes = Buffer.from(item.asset.src.split(',')[1], 'base64');
    assert.equal(hash(bytes), item.assetSha256, item.id + ': asset hash');
    if (item.sourceNo === 12) assert.ok(item.asset.width >= 300 && item.asset.height >= 100, item.id + ': readable recursive-area dimensions');
    else if (item.sourceNo === 15) assert.ok(item.asset.width >= 800 && item.asset.height >= 180, item.id + ': readable arrow-grid dimensions');
    else if (item.sourceNo === 17) assert.ok(item.asset.width >= 650 && item.asset.height >= 200, item.id + ': readable stage-growth dimensions');
    else if (item.sourceNo === 21) assert.ok(item.asset.width >= 650 && item.asset.height >= 60, item.id + ': readable masked-number dimensions');
    else if (item.sourceNo === 28) assert.ok(item.asset.width >= 650 && item.asset.height >= 380, item.id + ': readable horizontal triangular-array dimensions');
    else if (item.sourceNo === 29) assert.ok(item.asset.width >= 650 && item.asset.height >= 250, item.id + ': readable cross-array dimensions');
    else assert.ok(item.asset.width >= 720 && item.asset.height >= 300, item.id + ': readable source dimensions');
    assert.equal(bytes.readUInt32BE(16), item.asset.width, item.id + ': PNG width');
    assert.equal(bytes.readUInt32BE(20), item.asset.height, item.id + ': PNG height');
  } else {
    assert.equal(item.asset, undefined, item.id + ': text-only item has no decorative image');
    assert.equal(item.assetSpec, null, item.id + ': text-only renderer contract');
  }
}

for (const item of data.items.filter((item) => item.sourceNo === 1)) {
  const m = item.meta;
  assert.equal(m.totalCount - m.pictureCount - m.separateCount, m.hiddenCount, item.id + ': hidden remainder');
  assert.equal(item.answer, m.hiddenCount + '개', item.id + ': hidden remainder answer');
  assert.equal(item.assetSpec.objectCount, m.pictureCount, item.id + ': picture object count contract');
  assert.equal(item.assetSpec.renderRules.allowOverlap, false, item.id + ': every object remains countable');
}

for (const item of data.items.filter((item) => item.sourceNo === 2)) {
  const read = (value) => { const match=String(value).match(/(\d+)시(?:\s*(\d+)분)?/); return (Number(match[1])%12)*60+Number(match[2]||0); };
  const actual = (720 - read(item.meta.mirrorTime)) % 720;
  const wake = read(item.meta.wakeTime);
  assert.equal(read(item.meta.actualTime), actual, item.id + ': reflected analog-clock time');
  assert.equal(item.meta.elapsedMinutes, (wake - actual + 720) % 720, item.id + ': elapsed minutes');
  assert.equal(item.answer, item.meta.elapsedMinutes + '분', item.id + ': elapsed-time answer');
  assert.equal(item.assetSpec.renderRules.showActualTime, false, item.id + ': prompt image hides actual time');
}

for (const item of data.items.filter((item) => item.sourceNo === 3)) {
  const n=item.meta.stage;
  const occupied=new Set();
  for(let level=0;level<n;level+=1){const width=2*(n-level)-1;for(let x=level;x<level+width;x+=1)occupied.add(x+','+(n-level-1));}
  const counts=[];
  for(let size=1;size<=n;size+=1){let count=0;for(let y=0;y<=n-size;y+=1)for(let x=0;x<=2*n-1-size;x+=1){let full=true;for(let dy=0;dy<size&&full;dy+=1)for(let dx=0;dx<size;dx+=1)if(!occupied.has((x+dx)+','+(y+dy))){full=false;break;}if(full)count+=1;}if(count)counts.push(count);}
  assert.deepEqual(counts, item.meta.countsBySide, item.id + ': exhaustive square counts by side');
  assert.equal(counts.reduce((sum,value)=>sum+value,0), item.meta.totalSquareCount, item.id + ': all square sizes total');
  assert.equal(item.answer, item.meta.totalSquareCount + '개', item.id + ': square-count answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 4)) {
  const m=item.meta;
  assert.equal(m.totalPositions, m.rows*m.columns, item.id + ': rectangular total');
  assert.equal(m.visibleStars, m.totalPositions-m.missingPositions, item.id + ': occupied positions');
  assert.equal(item.answer, m.visibleStars + '개', item.id + ': visible-star answer');
  assert.equal(item.assetSpec.renderRules.showMissingCount, false, item.id + ': no missing-count hint in picture');
  assert.equal(item.assetSpec.renderRules.showGroupingMarks, false, item.id + ': no grouping hint in picture');
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

for (const item of data.items.filter((item) => item.sourceNo === 7)) {
  const validEnds = permutations(item.meta.start).filter((end) => end > item.meta.start && end - item.meta.start + 1 <= item.meta.limit);
  assert.deepEqual(validEnds, [item.meta.validEnd], item.id + ': exactly one later permutation fits the page limit');
  assert.equal(item.meta.validEnd - item.meta.start + 1, item.meta.inclusiveCount, item.id + ': inclusive page count');
  assert.equal(item.answer, item.meta.inclusiveCount + '페이지', item.id + ': page answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 8)) {
  const values = [];
  for (let number = item.meta.from; number <= item.meta.to; number += 1) if (number % item.meta.divisor === item.meta.remainder) values.push(number);
  assert.deepEqual(values, item.meta.matchingValues, item.id + ': exhaustive remainder-class values');
  assert.equal(item.answer, String(values.reduce((sum, number) => sum + number, 0)), item.id + ': remainder-class sum');
}

for (const item of data.items.filter((item) => item.sourceNo === 9)) {
  const east = (item.meta.moves.east || 0) - (item.meta.moves.west || 0);
  const north = (item.meta.moves.north || 0) - (item.meta.moves.south || 0);
  const expected = {};
  if (east > 0) expected.west = east; else expected.east = -east;
  if (north > 0) expected.south = north; else expected.north = -north;
  assert.deepEqual(item.meta.returnMoves, expected, item.id + ': inverse displacement');
  assert.equal(item.answer, String(Object.values(expected).reduce((sum, value) => sum + value, 0)), item.id + ': return-distance sum');
}

for (const item of data.items.filter((item) => item.sourceNo === 10)) {
  const minimum = minimumSelected(item.meta.maximum, item.meta.selectedCount, item.meta.targetSum);
  assert.equal(minimum, Number(item.answer), item.id + ': dynamic-programming minimum selected number');
  assert.equal(item.meta.targetSum, item.meta.selectedCount * item.meta.quotient, item.id + ': quotient condition');
}

for (const item of data.items.filter((item) => item.sourceNo === 11)) {
  const m = item.meta;
  const matches = [];
  for (let largeCount = 1; largeCount <= m.totalFurniture; largeCount += 1) {
    const smallCount = m.totalFurniture - largeCount;
    const seated = smallCount * m.smallCapacity + (largeCount - 1) * m.largeCapacity + m.lastOccupancy;
    if (seated === m.totalPeople) matches.push(largeCount);
  }
  assert.deepEqual(matches, [m.largeCount], item.id + ': exactly one larger-furniture count');
  assert.equal(item.answer, m.largeCount + '개', item.id + ': larger-furniture answer');
  assert.ok(m.lastOccupancy > 0 && m.lastOccupancy < m.largeCapacity, item.id + ': last larger unit is partially occupied');
}

function fractionDifference(fromStage, toStage) {
  const denominator = 4 ** toStage;
  let numerator = 0;
  for (let stage = fromStage + 1; stage <= toStage; stage += 1) numerator += 2 * (4 ** (toStage - stage));
  const divisor = (a, b) => b ? divisor(b, a % b) : a;
  const common = divisor(numerator, denominator);
  return [numerator / common, denominator / common];
}
for (const item of data.items.filter((item) => item.sourceNo === 12)) {
  const expected = fractionDifference(item.meta.fromStage, item.meta.toStage);
  assert.deepEqual(item.meta.answerFraction, expected, item.id + ': independent colored-area difference');
  assert.equal(item.answer, expected[0] + '/' + expected[1], item.id + ': reduced fraction answer');
  assert.equal(item.assetSpec.renderRules.showAnswerFraction, false, item.id + ': prompt figure has no answer fraction');
  assert.equal(item.assetSpec.renderRules.showOnlyFirstThreeStages, true, item.id + ': prompt shows only the first three stages');
  assert.equal(new Set(item.meta.shadedCorners).size, 2, item.id + ': exactly two newly shaded quarters');
  assert.ok(!item.meta.shadedCorners.includes(item.meta.activeCorner), item.id + ': next active quarter remains unshaded and visible');
}

function generatedBlockCounts(item) {
  const counts = new Map([[item.meta.firstNumber, 0], [item.meta.secondNumber, 0]]);
  let produced = 0;
  for (let block = 1; produced < item.meta.totalTerms; block += 1) {
    const value = block % 2 ? item.meta.firstNumber : item.meta.secondNumber;
    for (let index = 0; index < block && produced < item.meta.totalTerms; index += 1) {
      counts.set(value, counts.get(value) + 1);
      produced += 1;
    }
  }
  return counts;
}
for (const item of data.items.filter((item) => item.sourceNo === 13)) {
  const counts = generatedBlockCounts(item);
  assert.equal(item.meta.lastCompleteBlock * (item.meta.lastCompleteBlock + 1) / 2, item.meta.totalTerms, item.id + ': total ends at one complete block');
  assert.equal(counts.get(item.meta.firstNumber), item.meta.firstNumberCount, item.id + ': first-number exhaustive count');
  assert.equal(counts.get(item.meta.secondNumber), item.meta.secondNumberCount, item.id + ': second-number exhaustive count');
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  assert.equal(winner[0], item.meta.answerNumber, item.id + ': more frequent number');
  assert.equal(Math.abs(item.meta.firstNumberCount - item.meta.secondNumberCount), item.meta.difference, item.id + ': count difference');
  assert.match(item.answer, new RegExp('^' + item.meta.answerNumber + '[이가] ' + item.meta.difference + '개$'), item.id + ': number-and-count answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 14)) {
  const counts = item.meta.initialCounts.slice();
  const [moveAB, moveBC, moveCA] = item.meta.transfers;
  for (let turn = 0; turn < item.meta.repeatCount; turn += 1) {
    counts[0] -= moveAB; counts[1] += moveAB;
    counts[1] -= moveBC; counts[2] += moveBC;
    counts[2] -= moveCA; counts[0] += moveCA;
    assert.ok(counts.every((value) => value >= 0), item.id + ': every simulated container count stays nonnegative');
  }
  assert.deepEqual(counts, item.meta.finalCounts, item.id + ': independent repeated-transfer simulation');
  assert.equal(item.meta.initialCounts[0] - item.meta.initialCounts[1], item.meta.initialGaps[0], item.id + ': first initial gap');
  assert.equal(item.meta.initialCounts[1] - item.meta.initialCounts[2], item.meta.initialGaps[1], item.id + ': second initial gap');
  assert.equal(item.answer, item.meta.initialCounts[0] + '개, ' + item.meta.finalCounts[1] + '개, ' + item.meta.finalCounts[2] + '개', item.id + ': ordered triple answer');
}

function arrowPosition(item, position) {
  const period = item.meta.path.length;
  const block = Math.floor((position - 1) / period);
  const step = (position - 1) % period;
  const [row, column] = item.meta.path[step];
  return [row, block * item.meta.columnsPerBlock + column];
}
for (const item of data.items.filter((item) => item.sourceNo === 15)) {
  const path = item.meta.path;
  assert.equal(path.length, item.meta.rows * item.meta.columnsPerBlock, item.id + ': visits every square in one block');
  assert.equal(new Set(path.map(key)).size, path.length, item.id + ': never returns to a square inside the block');
  for (let index = 0; index < path.length - 1; index += 1) {
    assert.equal(Math.abs(path[index][0] - path[index + 1][0]) + Math.abs(path[index][1] - path[index + 1][1]), 1, item.id + ': adjacent arrow step ' + (index + 1));
  }
  const nextBlockFirst = [path[0][0], path[0][1] + item.meta.columnsPerBlock];
  assert.equal(Math.abs(path.at(-1)[0] - nextBlockFirst[0]) + Math.abs(path.at(-1)[1] - nextBlockFirst[1]), 1, item.id + ': final arrow continues to the next block instead of returning');
  assert.deepEqual(arrowPosition(item, 1), item.meta.firstPosition, item.id + ': first position');
  assert.deepEqual(arrowPosition(item, 6), item.meta.sixthPosition, item.id + ': sixth position');
  assert.deepEqual(arrowPosition(item, item.meta.targetPosition), item.meta.answerPosition, item.id + ': independently repeated target position');
  assert.equal(item.answer, '(' + item.meta.answerPosition[0] + ', ' + item.meta.answerPosition[1] + ')', item.id + ': ordered-pair answer');
  assert.equal(item.assetSpec.renderRules.showAnswerPosition, false, item.id + ': prompt image has no answer mark');
  assert.equal(item.assetSpec.renderRules.revisitWithinBlock, false, item.id + ': no return-to-original-cell contract');
}

function simulateCards(cardCount) {
  const queue = Array.from({length:cardCount}, (_, index) => index + 1);
  let lastFour = [];
  while (queue.length > 2) {
    queue.shift(); queue.shift();
    if (queue.length > 2) queue.push(queue.shift());
    if (queue.length === 4) lastFour = queue.slice();
  }
  return {lastFour,lastTwo:queue.slice()};
}
for (const item of data.items.filter((item) => item.sourceNo === 16)) {
  const result = simulateCards(item.meta.cardCount);
  assert.deepEqual(result.lastFour, item.meta.lastFour, item.id + ': independently simulated last four cards');
  assert.deepEqual(result.lastTwo, item.meta.lastTwo, item.id + ': independently simulated last two cards');
  assert.equal(item.answer, String(result.lastTwo[0] + result.lastTwo[1]), item.id + ': final two-card sum');
}

for (const item of data.items.filter((item) => item.sourceNo === 17)) {
  const stage = item.meta.stage;
  assert.ok(Number.isInteger(stage) && stage > 0, item.id + ': integral stage');
  assert.equal(item.meta.lightCount, stage * stage, item.id + ': center square count');
  assert.equal(item.meta.darkCount, stage * (stage - 1), item.id + ': two outer stair groups count');
  assert.equal(item.meta.totalCount, item.meta.lightCount + item.meta.darkCount, item.id + ': total count');
  const expected = item.meta.mode === 'reverse' ? item.meta.lightCount : item.meta.mode === 'total' ? item.meta.totalCount : item.meta.darkCount;
  assert.equal(item.answer, expected + '개', item.id + ': requested quantity answer');
  assert.equal(item.assetSpec.renderRules.showAnswerCounts, false, item.id + ': prompt figure does not leak counts');
  assert.equal(item.assetSpec.renderRules.preserveStageCounts, true, item.id + ': transformed figure preserves stage counts');
}

for (const item of data.items.filter((item) => item.sourceNo === 18)) {
  const [ab, bc, ac] = item.meta.pairSums;
  const total = (ab + bc + ac) / 2;
  const values = [total - bc, total - ac, total - ab];
  assert.equal(Number.isInteger(total), true, item.id + ': integral total');
  assert.deepEqual(values, item.meta.values, item.id + ': independently recovered three values');
  assert.equal(values[0] + values[1], ab, item.id + ': first pair sum');
  assert.equal(values[1] + values[2], bc, item.id + ': second pair sum');
  assert.equal(values[0] + values[2], ac, item.id + ': third pair sum');
  assert.equal(item.meta.maximum, Math.max(...values), item.id + ': largest value');
  assert.equal(item.verification.answerContract, 'entity-and-number', item.id + ': target label and value answer contract');
}

for (const item of data.items.filter((item) => item.sourceNo === 19)) {
  let current = item.meta.initialAmount;
  const forwardValues = [current];
  for (let turn = 0; turn < item.meta.recipientCount; turn += 1) {
    current = current / 2 - item.meta.extraEachTime;
    forwardValues.push(current);
  }
  assert.deepEqual(forwardValues, item.meta.forwardValues, item.id + ': independent forward sharing sequence');
  assert.equal(current, item.meta.finalRemainder, item.id + ': final remainder');
  assert.ok(forwardValues.every(Number.isInteger), item.id + ': every forward amount is integral');
}

for (const item of data.items.filter((item) => item.sourceNo === 20)) {
  assert.equal(item.meta.equalShare, item.meta.totalAmount / item.meta.recipientCount, item.id + ': equal-share plan');
  let remainder = item.meta.totalAmount;
  const actualShares = [];
  for (let turn = 0; turn < item.meta.recipientCount; turn += 1) {
    const share = remainder / 2;
    actualShares.push(share);
    remainder -= share;
  }
  assert.deepEqual(actualShares, item.meta.actualShares, item.id + ': independently simulated successive halves');
  assert.equal(item.meta.difference, item.meta.equalShare - item.meta.targetShare, item.id + ': planned versus actual difference');
  assert.equal(item.answer, item.meta.difference + item.meta.unit, item.id + ': difference answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 21)) {
  const matches = [];
  for (let number = 2; number <= 998; number += 2) {
    const product = number * (number + 2) * (number + 4);
    const digits = String(product);
    if (digits.length === item.meta.digits && digits[0] === item.meta.firstDigit && digits.at(-1) === item.meta.lastDigit) matches.push({number,product});
  }
  assert.deepEqual(matches, item.meta.validMatches, item.id + ': exhaustive consecutive-even matches');
  assert.equal(matches.length, 1, item.id + ': exactly one valid factor triple');
  assert.equal(item.answer, String(matches[0].number), item.id + ': smallest factor answer');
  assert.equal(item.assetSpec.renderRules.showHiddenDigits, false, item.id + ': hidden digits are not leaked');
}

for (const item of data.items.filter((item) => item.sourceNo === 22)) {
  const [notA,notB] = item.meta.notCounts;
  assert.equal(item.meta.aCount, item.meta.total - notA, item.id + ': first group from complement');
  assert.equal(item.meta.bCount, item.meta.total - notB, item.id + ': second group from complement');
  assert.equal(item.meta.aCount + item.meta.bCount, item.meta.groupSum, item.id + ': two-group sum');
  assert.equal(item.meta.neither, item.meta.total - item.meta.groupSum, item.id + ': neither group count');
  assert.equal(item.answer, item.meta.neither + '명', item.id + ': outside both groups answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 23)) {
  const matches = [];
  const digitSum = (number) => String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
  for (let number = item.meta.lowerExclusive + 1; number <= item.meta.upperInclusive; number += 1) {
    if (digitSum(number) % item.meta.divisor === 0 && digitSum(number + 1) % item.meta.divisor === 0) matches.push(number);
  }
  assert.deepEqual(matches, item.meta.validMatches, item.id + ': exhaustive before-and-after digit-sum matches');
  assert.equal(matches[0], item.meta.answer, item.id + ': least valid number');
  assert.equal(item.answer, String(matches[0]), item.id + ': digit-sum answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 24)) {
  const n = item.meta.totalWorkers;
  assert.equal(item.meta.largeWork, 2 * item.meta.smallWork, item.id + ': larger job is twice smaller job');
  assert.equal(item.meta.largeRemainderAfterDay1, item.meta.largeWork - n, item.id + ': day-one larger-job remainder');
  assert.equal(item.meta.largeRemainderAfterDay2, item.meta.largeRemainderAfterDay1 - n / 2, item.id + ': day-two larger job completed');
  assert.equal(item.meta.smallRemainderAfterDay2, item.meta.smallWork - n / 2, item.id + ': day-two smaller-job remainder');
  assert.equal(item.meta.smallRemainderAfterDay2, item.meta.thirdDayWorkers, item.id + ': third-day workers finish smaller job');
  assert.equal(item.answer, n + '명', item.id + ': total workforce answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 25)) {
  const [first,second,third,fourth] = item.meta.counts;
  assert.equal(second, first * item.meta.secondMultiplier, item.id + ': second is twice first');
  assert.equal(third, second * item.meta.thirdToSecondMultiplier, item.id + ': third is twice second');
  assert.equal(fourth, first + second + third + item.meta.fourthExtra, item.id + ': fourth exceeds the other three combined');
  assert.equal(first + second + third + fourth, item.meta.total, item.id + ': total count');
  assert.equal(item.answer, first + '개', item.id + ': first count answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 26)) {
  const leap = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const weekday = (year) => new Date(Date.UTC(year,0,1)).getUTCDay();
  const same = (year) => leap(year) === leap(item.meta.referenceYear) && weekday(year) === weekday(item.meta.referenceYear);
  const matches = [];
  if (item.meta.direction === 'past') for (let year=1900;year<item.meta.cutoffYear;year+=1) { if (same(year)) matches.push(year); }
  else for (let year=item.meta.cutoffYear+1;year<=2100;year+=1) { if (same(year)) matches.push(year); }
  const answer = item.meta.direction === 'past' ? matches.at(-1) : matches[0];
  assert.deepEqual(matches, item.meta.matchingYears, item.id + ': exhaustive matching calendar years');
  assert.equal(answer, item.meta.answerYear, item.id + ': nearest calendar on requested side');
  assert.equal(item.answer, answer + '년', item.id + ': calendar year answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 27)) {
  let week = 0;
  let count = item.meta.start;
  let previous = count;
  while (count < item.meta.targetThreshold) {
    previous = count;
    count *= item.meta.weeklyMultiplier;
    week += 1;
  }
  assert.equal(week, item.meta.firstWeek, item.id + ': first threshold week');
  assert.equal(previous, item.meta.previousCount, item.id + ': previous week remains below threshold');
  assert.equal(count, item.meta.firstReachedCount, item.id + ': first reached count');
  assert.ok(previous < item.meta.targetThreshold && count >= item.meta.targetThreshold, item.id + ': threshold boundary');
  assert.equal(item.answer, week + '주일', item.id + ': week answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 28)) {
  const triangular = (n) => n * (n + 1) / 2;
  const valueAt = (row,column) => triangular(row - 1) + column;
  const locate = (number) => { let row=1; while (triangular(row)<number) row+=1; return [row,number-triangular(row-1)]; };
  const neighbors = (row,column) => [[row,column-1],[row,column+1],[row-1,column-1],[row-1,column],[row+1,column],[row+1,column+1]].filter(([r,c]) => r>=1&&c>=1&&c<=r).map(([r,c]) => valueAt(r,c));
  const sum = (number) => { const [row,column]=locate(number); return neighbors(row,column).reduce((total,value)=>total+value,0); };
  const matches=[];
  for (let number=1;number<=item.meta.searchMax;number+=1) if (sum(number)===item.meta.targetNeighborSum) matches.push(number);
  assert.deepEqual(matches, item.meta.validMatches, item.id + ': exhaustive triangular-array matches');
  assert.equal(matches.length, 1, item.id + ': exactly one hidden number');
  assert.deepEqual(neighbors(item.meta.answerRow,item.meta.answerColumn), item.meta.adjacentValues, item.id + ': visible edge neighbors');
  assert.equal(item.meta.excludeSelectedCell, true, item.id + ': selected cell excluded from sum');
  assert.equal(item.assetSpec.renderRules.showAnswerCell, false, item.id + ': answer cell is not marked');
  assert.equal(item.assetSpec.renderRules.showOriginalExamples, true, item.id + ': approved original example is visible');
  assert.equal(item.answer, String(matches[0]), item.id + ': triangular-array answer');
}

for (const item of data.items.filter((item) => item.sourceNo === 29)) {
  const {horizontalCells,verticalCells,numbers} = item.meta;
  assert.equal(horizontalCells + verticalCells - 1, item.meta.totalCells, item.id + ': cross cell count');
  assert.equal(numbers.length, item.meta.totalCells, item.id + ': one number per cell');
  assert.equal(new Set(numbers).size, numbers.length, item.id + ': distinct numbers');
  const centerIndex = Math.floor(horizontalCells / 2);
  let count = 0;
  function visit(prefix, remaining) {
    if (!remaining.length) {
      const horizontalSum = prefix.slice(0,horizontalCells).reduce((sum,value)=>sum+value,0);
      const verticalSum = prefix[centerIndex] + prefix.slice(horizontalCells).reduce((sum,value)=>sum+value,0);
      if (horizontalSum === verticalSum) count += 1;
      return;
    }
    remaining.forEach((value,index)=>visit(prefix.concat(value),remaining.slice(0,index).concat(remaining.slice(index+1))));
  }
  visit([],numbers);
  assert.equal(count, item.meta.exhaustiveCount, item.id + ': independent exhaustive equal-line count');
  assert.equal(count, item.meta.combinationCount, item.id + ': exhaustive and combinatorial counts agree');
  assert.equal(item.answer, count + '가지', item.id + ': arrangement answer');
  assert.equal(item.assetSpec.renderRules.showNumbers, false, item.id + ': prompt cells remain empty');
  assert.equal(item.assetSpec.renderRules.showAnswerArrangement, false, item.id + ': prompt does not leak one arrangement');
}

for (const item of data.items.filter((item) => item.sourceNo === 30)) {
  let remaining = Array.from({length:item.meta.initialStudents},(_,index)=>index+1);
  const counts=[remaining.length];
  while(remaining.length>1){
    remaining=remaining.filter((_,index)=>(index+1)%2===0);
    counts.push(remaining.length);
  }
  let power=1;
  while(power*2<=item.meta.initialStudents)power*=2;
  assert.deepEqual(counts,item.meta.roundCounts,item.id + ': independent repeated renumbering counts');
  assert.equal(remaining[0],item.meta.lastOriginalNumber,item.id + ': simulated last original number');
  assert.equal(power,item.meta.largestPowerOfTwo,item.id + ': largest power-of-two check');
  assert.equal(item.answer,String(remaining[0]),item.id + ': last student answer');
}

console.log('PASS Final 7 Q1-Q30: ninety reviewed variants, independent answer checks, visible single-answer evidence, and fail-closed reviewed range');
