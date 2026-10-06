'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vmScript=require('node:vm').Script;
const trend=require('../final-score-trend.js');
const bands=[['경시 가능',23.1],['심화안정권',39],['노력요함',100]];
const vm=trend.model([
  {key:'final1',score:40,average:25,percentile:20,grade:'심화안정권'},
  {key:'last2',score:30,average:28,percentile:40,grade:'실력안정권'},
  {key:'last2',score:99,average:28,percentile:1,grade:'중복'},
  {key:'final3',score:35,average:null,percentile:null,grade:null},
  {key:'original1',score:100,average:20,percentile:1,grade:'특강'}
],bands);
assert.deepEqual(vm.rows.map(row=>row.key),['final1','final3','last2']);
assert.equal(vm.scoreAverage,30,'approved Last 2+ judgement excludes Final scores');
assert.equal(vm.percentileAverage,40);
assert.equal(vm.cumulativeGrade,null,'missing Last-specific bands cannot use Final bands');
assert.equal(vm.rankedCount,1);
assert.equal(vm.slots[1],null,'not attended is a gap, not zero');
const html=trend.render(vm);
assert.match(html,/원점수와 회차 평균/);
assert.match(html,/예상 석차 백분율/);
assert.match(html,/누적 판정 · 최종 1~2회 \(1회\)/);
assert.match(html,/평균\(1\/1회\)/);
assert.equal((html.match(/class="trend-round-label"/g)||[]).length,16,'both charts identify all eight rounds');
assert.match(html,/aria-label="파이널 1회"/);
assert.match(html,/aria-label="최종 4회"/);
assert.doesNotMatch(html,/original1|특강<\/td>/);
const page=fs.readFileSync(require('node:path').join(__dirname,'../final.html'),'utf8');
let inlineScripts=0;
for(const match of page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(match[1].trim()){new vmScript(match[1],{filename:'final-inline-'+(++inlineScripts)});}
}
assert.ok(inlineScripts>1,'all inline report scripts parse');
assert.match(page,/finalLastTrendModel\(priorRows,attemptNo,fk,state\.oxArr,includeCurrent\)/);
assert.match(page,/trendHTML\+\s*parentAPI\.summaryHTML/);
assert.match(page,/\(!isLast&&roundNum>4\)\?null:finalLastTrendModel/,'additional Final mocks remain separate');
assert.match(page,/if\(!api\) return;\s*for\(var lastBaseRound=1;lastBaseRound<=4/);
console.log('PASS Final 1-4 + Last 1-4 first-attempt trend and first-page integration');
