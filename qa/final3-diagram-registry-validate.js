'use strict';

const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'final3-solution-diagrams.js'),'utf8');
const backSource=fs.readFileSync(path.join(root,'final3-backhalf-solution-diagrams.js'),'utf8');
const box={window:{}};
vm.createContext(box);
vm.runInContext(source,box,{filename:'final3-solution-diagrams.js'});
vm.runInContext(backSource,box,{filename:'final3-backhalf-solution-diagrams.js'});
const api=box.window.GFIELD_FINAL3_SOLUTION_DIAGRAMS;
const backApi=box.window.GFIELD_FINAL3_BACKHALF_SOLUTION_DIAGRAMS;
const nos=[1,3,4,6,7,8,13];
const ids=[
  'final3-q1-fruit-branch-recurrence-v1','final3-q3-alternating-tile-rings-v1','final3-q4-finger-cycle-v1',
  'final3-q6-folded-paper-five-layers-v1','final3-q7-balance-equations-v1','final3-q8-stepped-mountain-paths-v1',
  'final3-q13-honeycomb-forward-paths-v1'
];

assert.deepEqual(Array.from(api.supportedIds),ids);
assert.deepEqual(Array.from(api.contract.expectedNos),nos);
assert.equal(api.contract.releaseStatus,'locked');
for(const [index,no] of nos.entries()){
  assert.equal(api.modelFor(no).id,ids[index]);
  assert.equal(api.calculate(no).valid,true);
  const html=api.render(no);
  assert.match(html,new RegExp('data-diagram-id="'+ids[index]+'"'));
  assert.match(html,/<svg\b/);
  assert.doesNotMatch(html,/비공개|프로토타입|검수 전|표현 검수 대기/);
}

assert.deepEqual(JSON.parse(JSON.stringify(api.calculate(1).targetCounts)),{B:144,A:233});
assert.deepEqual(JSON.parse(JSON.stringify(api.calculate(3).target)),{round:48,color:'black',addedCount:188});
assert.equal(api.calculate(4).position,'오른손 중지');
assert.equal(api.calculate(6).unfoldedCompleteCircles,21);
assert.deepEqual(JSON.parse(JSON.stringify(api.calculate(7).targetAddition)),{side:'left',shape:'circle',count:1});
assert.equal(api.calculate(8).first.total,42);
assert.equal(api.calculate(8).second.total,132);
assert.equal(api.calculate(8).first.total*api.calculate(8).second.total,5544);
assert.equal(api.calculate(13).pathCounts.at(-1),377);
assert.equal(api.modelFor(13).nodes.top[0],'별');

function pairKey(a,b){return [a,b].sort().join('|');}
function pointKey(point){return point.map(n=>Number(n).toFixed(5)).join(',');}
function segmentKey(a,b){return [pointKey(a),pointKey(b)].sort().join('~');}

const honey=api.render(13);
const polygonPattern=/<g data-honey-node="([^"]+)"[^>]*><polygon points="([^"]+)"/g;
const segments=new Map();
let match;
while((match=polygonPattern.exec(honey))){
  const node=match[1];
  const points=match[2].trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
  assert.equal(points.length,6,'each honey cell is a hexagon');
  for(let i=0;i<6;i++){
    const key=segmentKey(points[i],points[(i+1)%6]);
    if(!segments.has(key)) segments.set(key,[]);
    segments.get(key).push(node);
  }
}
const shownShared=new Set([...segments.values()].filter(nodes=>nodes.length===2).map(nodes=>pairKey(nodes[0],nodes[1])));
const expectedShared=new Set(Object.values(api.modelFor(13).edges).flat().map(edge=>pairKey(edge[0],edge[1])));
assert.equal(shownShared.size,25);
assert.deepEqual([...shownShared].sort(),[...expectedShared].sort(),'drawn shared sides exactly match source-bound graph edges');
assert.equal([...segments.values()].filter(nodes=>nodes.length>2).length,0,'no polygon edge is multiply overlapped');
assert.equal((honey.match(/data-passage-edge=/g)||[]).length,25,'one passage mark per shared edge');
assert.equal((honey.match(/data-honey-node=/g)||[]).length,14);
assert.match(honey,/>별<\/text>/);
assert.match(honey,/>377<\/text>/);

const frozenModel=api.modelFor(13);
assert.equal(Object.isFrozen(frozenModel),true);
assert.throws(()=>{(function(){'use strict';frozenModel.nodes.top[0]='벌';})();},TypeError);
assert.equal(api.modelFor(2),null);
assert.equal(api.render(2),'');

const backNos=[17,18,19,24,25,26,30];
const backIds=[
  'final3-q17-fixed-rectangles-v1','final3-q18-river-rods-v1','final3-q19-seven-cells-squares-v1',
  'final3-q24-cryptarithm-layout-v1','final3-q25-seven-segment-mirror-v1',
  'final3-q26-seven-hex-fold-patterns-v1','final3-q30-map-four-colors-v1'
];
assert.deepEqual(Array.from(backApi.supportedIds),backIds);
assert.deepEqual(Array.from(backApi.contract.expectedNos),backNos);
assert.equal(backApi.contract.releaseStatus,'locked');
for(const [index,no] of backNos.entries()){
  assert.equal(backApi.modelFor(no).id,backIds[index]);
  assert.equal(backApi.calculate(no).valid,true);
  const html=backApi.render(no);
  assert.match(html,new RegExp('data-diagram-id="'+backIds[index]+'"'));
  assert.match(html,/<svg\b/);
  assert.doesNotMatch(html,/비공개|프로토타입|검수 전|표현 검수 대기/);
}
assert.equal(backApi.calculate(17).product,240);
assert.equal(backApi.calculate(18).depthMeters,4);
assert.equal(backApi.calculate(19).kept,14);
assert.equal(backApi.calculate(24).assignments.length,1);
assert.deepEqual(JSON.parse(JSON.stringify(backApi.calculate(24).assignments[0])),{'ㄱ':6,'ㄴ':1,'ㄷ':4,'ㄹ':2,'ㅁ':5,'ㅂ':3,'ㅅ':8,'ㅇ':9});
assert.equal(backApi.calculate(25).count,19);
assert.equal(backApi.calculate(26).accepted.length,5);
assert.equal(backApi.calculate(30).regionCount,20);
assert.equal(backApi.calculate(30).edgeCount,42);
assert.equal(backApi.calculate(30).threeColorable,false);
assert.equal(backApi.calculate(30).fourColorable,true);
assert.deepEqual(Array.from(backApi.calculate(30).witnessConflicts),[]);
assert.match(backApi.render(17),/8=8/);
assert.match(backApi.render(30),/최소 개수 = 4색/);
assert.equal(backApi.modelFor(30).sourceCoordinateSpace,undefined);
assert.doesNotMatch(backSource,/\.private-work|sha256|비공개|프로토타입|검수 전|표현 검수 대기/i);

console.log('Final3 diagram registry QA: PASS (14 models, exact math, front honeycomb and back map topology)');
