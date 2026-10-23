'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),P=require('../bank/learning-profile.js');
assert.deepEqual(P.areas,['도형','수와 식','경우의 수','지문 이해']);
for(const set of ['hw','applied'])for(const [points,label] of [[2.7,'하'],[3.4,'중'],[4.2,'상']])for(const rate of [null,0,.5,1])for(const local of ['low','middle','high']){
 const row=P.difficulty({sourceSet:set,points,responseRate:rate,pointBandDifficulty:local});assert.equal(row.label,label);assert.equal(row.basis,'applied-point-band');assert.equal(row.responseRate,null);assert.equal(row.withinBandDifficulty,null);
}
for(const [rate,label] of [[0,'상'],[.399999,'상'],[.4,'중'],[.599999,'중'],[.6,'하'],[1,'하'],[40,'중'],[60,'하'],[100,'하']]){
 const row=P.difficulty({sourceSet:'final',points:4.2,responseRate:rate,pointBandDifficulty:'high'});assert.equal(row.label,label);assert.equal(row.basis,'response-rate');
}
for(const [points,local,label] of [[2.7,'high','중'],[2.7,'middle','하'],[3.4,'high','상'],[3.4,'low','하'],[4.2,'low','중']])assert.equal(P.difficulty({sourceSet:'last',points,pointBandDifficulty:local}).label,label);
assert.equal(P.difficulty({sourceSet:'original',points:2.7,difficultyClass:'D5'}).label,'하','do not reinterpret absolute D level as within-band evidence');
assert.equal(P.difficulty({}).id,'unclassified');assert.equal(P.difficulty({points:3.1}).id,'unclassified');
for(const [item,area] of [[{area:'도형',type:'정사각형의 개수'},'도형'],[{area:'수·규칙찾기',type:'달력의 요일'},'수와 식'],[{area:'식의 계산',type:'나이 구하기'},'수와 식'],[{area:'경우의 수',type:'숫자카드 배열'},'경우의 수'],[{area:'경우의 수',subarea:'논리추리',type:'진실과 거짓'},'지문 이해']]){
 const before=JSON.stringify(item),row=P.taxonomy(item);assert.equal(row.area,area);assert.equal(JSON.stringify(item),before);assert.ok(row.detailType);
}
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../mock-data-hw.js'),'utf8'),c);
const source=c.window.GFIELD_MOCK_HW,before=JSON.stringify(source);let count=0,by={};
for(const round of Object.values(source.rounds))for(const item of round.items){const pts=source.blueprint.find(x=>x.no===item.no).pts;const row=P.difficulty({...item,points:pts,sourceSet:'applied'});const tax=P.taxonomy(item);assert.ok(P.areas.includes(tax.area));by[row.label]=(by[row.label]||0)+1;count++;}
assert.equal(count,270);assert.deepEqual(by,{'하':108,'중':90,'상':72});assert.equal(JSON.stringify(source),before);
console.log('PASS bank profile: 270 applied items by points; rate boundaries, within-band calibration, 4-area hierarchy, no source mutations');
