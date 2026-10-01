const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('../bank/final-source-generators.js');

const generators = globalThis.BANK_FINAL_SOURCE_GENERATORS;
const specs = [
  { round: 3, no: 9, page: '002.jpg' }, { round: 3, no: 10, page: '003.jpg' },
  { round: 4, no: 2, page: '001.jpg' }, { round: 4, no: 7, page: '002.jpg' }
];
let checked = 0;

for (const spec of specs) {
  const originalPath = path.join(__dirname, '..', 'materials', `final_${spec.round}`,spec.page);
  assert.ok(fs.existsSync(originalPath), `source page missing: ${originalPath}`);
  const fixed = require(`../bank/data/final${spec.round}-fixed90.json`);
  const group = fixed.items.filter(item => item.sourceNo === spec.no);
  assert.equal(group.length, 3);
  assert.ok(group.every(item => item.reviewStatus === 'verified' && item.pointBand === '2.7'));
  const anchor = group.find(item => item.variantNo === 1);
  const rows = [];
  for (let serial = 4; serial <= 43; serial++) {
    const item = generators.generate(anchor.genId, serial, anchor);
    assert.equal(item.id, `${anchor.genId}-g${serial}`);
    assert.equal(item.sourceRound, spec.round);
    assert.equal(item.sourceNo, spec.no);
    assert.equal(item.pointBand, anchor.pointBand);
    assert.equal(item.reviewStatus, 'runtime-verified');
    assert.equal(item.answerPolicy, 'single');
    assert.deepEqual(item.acceptedAnswers, [item.answer]);
    assert.equal(item.verification.primary.answer, item.answer);
    assert.equal(item.verification.independent.answer, item.answer);
    assert.equal(item.verification.visibleEvidence.passed, true);
    assert.ok(item.text && item.solution && item.solutionSteps.length >= 2);
    if (spec.round === 3 && spec.no === 9) {
      const { base, operator, total, values } = item.meta;
      assert.equal(values.length, 4);
      assert.deepEqual(values, [base + operator, base - operator, base * operator, base / operator]);
      const possible = [];
      for (let candidate = 1; candidate <= 250; candidate++) {
        if (candidate % operator === 0 &&
            candidate + operator + candidate - operator + candidate * operator + candidate / operator === total) {
          possible.push(candidate);
        }
      }
      assert.deepEqual(possible, [base], 'four-number source must have one natural base');
      assert.equal(item.answer, values.join(', '));
      assert.ok(!/[36]를|[36]로 나눈/.test(item.text), 'numeric Korean particles');
    } else if(spec.round===3){
      const { rounds,initial,winGain,loss,wins,loses,firstFinal,secondFinal }=item.meta;
      const possible=[];
      for(let candidate=0;candidate<=rounds;candidate++){
        if(initial+winGain*candidate-loss*(rounds-candidate)===firstFinal)possible.push(candidate);
      }
      assert.deepEqual(possible,[wins],'candy source must have one win count');
      assert.equal(wins+loses,rounds);
      assert.equal(secondFinal,initial+winGain*loses-loss*wins);
      assert.equal(firstFinal+secondFinal,2*initial+(winGain-loss)*rounds);
      assert.equal(item.answer,secondFinal+'개');
    } else if(spec.no===2) {
      const { people, lowEach, highEach, targetEach, leftover, shortage, supplies, signedRemainder } = item.meta;
      const possible = [];
      for (let candidate = 1; candidate <= 100; candidate++) {
        if (lowEach * candidate + leftover === highEach * candidate - shortage) possible.push(candidate);
      }
      assert.deepEqual(possible, [people], 'distribution source must have one student count');
      assert.equal(supplies, lowEach * people + leftover);
      assert.equal(signedRemainder, supplies - targetEach * people);
      assert.notEqual(signedRemainder, 0);
      assert.ok(item.answer.endsWith(signedRemainder > 0 ? '남는다' : '모자란다'));
      assert.ok(!/스티커을|지우개을/.test(item.text), 'noun particles');
    } else {
      const {vehicles,firstTrips,capacity,extra,targetTrips,firstLoad,targetLoad}=item.meta;
      const possible=[];
      for(let candidate=1;candidate<=40;candidate++){
        if(candidate*targetTrips*firstLoad===targetLoad*vehicles*firstTrips)possible.push(candidate);
      }
      assert.deepEqual(possible,[vehicles+extra],'truck source must have one required vehicle count');
      assert.equal(firstLoad,vehicles*firstTrips*capacity);
      assert.equal(targetLoad,(vehicles+extra)*targetTrips*capacity);
      assert.equal(item.answer,extra+'대');
    }
    rows.push(item);
    checked++;
  }
  assert.equal(new Set(rows.map(item => item.text)).size, 40, `${anchor.genId} must make 40 different prompts`);
  assert.equal(new Set(rows.map(item => item.id)).size, 40);
}
assert.equal(generators.has('final3-q09'), true);
assert.equal(generators.has('final3-q10'), true);
assert.equal(generators.has('final4-q02'), true);
assert.equal(generators.has('final4-q07'), true);
assert.equal(generators.has('final3-q08'), false);
assert.throws(() => generators.generate('final3-q08', 4, {}));
assert.throws(() => generators.generate('final3-q09', 44, specs[0]));
console.log(`PASS Final 3 Q9/Q10 and Final 4 Q2/Q7: ${checked} source-linked variants, 40 distinct prompts per type, independent exhaustive answers`);
