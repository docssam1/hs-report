'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),window={};
function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window});}
['mock-data-final.js','mock-data-original.js','signature-forecast.js','last-score-data.js'].forEach(load);
const untouched=JSON.stringify([window.GFIELD_MOCK_FINAL,window.GFIELD_MOCK_ORIGINAL,window.GFIELD_LAST_SCORE_DATA]);
['final8-benchmark.js','final7-benchmark.js'].forEach(load);
assert.equal(JSON.stringify([window.GFIELD_MOCK_FINAL,window.GFIELD_MOCK_ORIGINAL,window.GFIELD_LAST_SCORE_DATA]),untouched,'no questions, O/X, cuts or distributions mutate');
const api=window.GFIELD_SIGNATURE_FORECAST,model=window.GFIELD_MOCK_ORIGINAL,cuts=model.rounds['1'].stats.cuts;
assert.equal(window.GFIELD_FINAL7_BENCHMARK,window.GFIELD_FINAL8_BENCHMARK);
const sets=[[],[{score:15,cuts:window.GFIELD_MOCK_FINAL.rounds['1'].stats.cuts}],
  [1,2,3,4].map(n=>({score:10+n,cuts:window.GFIELD_MOCK_FINAL.rounds[String(n)].stats.cuts}))];
let checks=0;
for(const raw of [0,20.6,25,30,30.5,35,38,40,45,46.8,55,100])for(const finals of sets){
  const got=window.GFIELD_FINAL8_BENCHMARK.project(raw,finals),forecast=api.estimate([raw],finals,cuts);
  assert.equal(got.actualScore,raw);
  assert.equal(got.adjustedScore,forecast.expected);
  assert.equal(got.topPercent,model.estimatedPosition(raw).topPercent,'raw percentile, not forecast percentile');
  assert.equal(got.tier,api.levelPlacement(forecast.expected,cuts,model.estimatedPosition).label);
  assert.equal(got.status,'signature-formula-historical-estimate');
  checks++;
}
for(const raw of [null,undefined,'',NaN,-1,101])assert.equal(window.GFIELD_FINAL8_BENCHMARK.project(raw),null);
const example=window.GFIELD_FINAL8_BENCHMARK.project(45);
assert.equal(example.adjustedScore,40.5);
assert.equal(example.topPercent,2.5);
assert.equal(example.tier,'심화 가능 예상');
delete window.GFIELD_SIGNATURE_FORECAST;
assert.equal(window.GFIELD_FINAL8_BENCHMARK.project(45),null,'missing dependencies fail closed');
console.log('PASS '+checks+' Final7/8 Signature formula parity cases; 45 → 40.5 / 2.5% / 심화 가능 예상 without personal Final evidence');
