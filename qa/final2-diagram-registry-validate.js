'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const box={window:{}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root,'final2-solution-diagrams.js'),'utf8'),box,{filename:'final2-solution-diagrams.js'});

const registry=box.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS;
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const count=(value,pattern)=>(value.match(pattern)||[]).length;
const plain=value=>JSON.parse(JSON.stringify(value));

assert.ok(registry&&typeof registry.calculate==='function'&&typeof registry.render==='function');
assert.ok(Object.isFrozen(registry)&&Object.isFrozen(registry.model),'diagram registry is immutable');

// Q12 remains byte-for-byte equivalent. Q28's reviewed model and calculation stay
// frozen while the visual amendment adds line styling and a model-derived route view.
const preserved={
  12:{
    model:'9a61f2238d0e0f42d3f42bfd483e2e777287dd433a1ba2c8c5ea183f86850880',
    calculated:'46723c818f37667752dc4ac79883f211eb9dae50f83dc1a505f77f46fadbe0c1',
    rendered:'93f4c2cfd3fa4fb77343552d765850a4f4dfc962478575c64eeea0876b305c69'
  },
  28:{
    model:'b9ed3df2764f1fda64587ea1d106a0046505f5c6435c21a884ede297630eaa86',
    calculated:'4e9da6e3fa46879983651b6f3a3d598fb423541536fdce6abe61c0ccc6717480'
  }
};
for(const no of [12]){
  assert.equal(sha256(JSON.stringify(registry.model[`q${no}`])),preserved[no].model,`Q${no} model is unchanged`);
  assert.equal(sha256(JSON.stringify(registry.calculate(no))),preserved[no].calculated,`Q${no} calculation is unchanged`);
  assert.equal(sha256(registry.render(no)),preserved[no].rendered,`Q${no} renderer is unchanged`);
}
assert.equal(sha256(JSON.stringify(registry.model.q28)),preserved[28].model,'Q28 reviewed graph model is unchanged');
assert.equal(sha256(JSON.stringify(registry.calculate(28))),preserved[28].calculated,'Q28 reviewed graph calculation is unchanged');

const visualAmendment={
  reviewId:'final2-original-visual-amendment-20260912',
  nos:[23,27,28],
  rendered:{
    23:'8251b51b4767ae2617ffb213fdaa1f59225bf8a7bba0cc7425c0416508304593',
    27:'894826da4795b58dbaa2179c42c81c532389d02c593eed029d4b6a59ee7febfb',
    28:'bc54c1a27c75e22a724249dbb57f93a4e64c9eb1bfe55997b3cd49cf5f24fb31'
  }
};
for(const no of visualAmendment.nos){
  assert.equal(sha256(registry.render(no)),visualAmendment.rendered[no],visualAmendment.reviewId+' Q'+no+' exact rendered projection');
}

const q12Html=registry.render(12);
assert.match(q12Html,/gfield-final2-solution-diagram--q12/,'existing Q12 projection remains registered');
assert.match(q12Html,/gfield-final2-q12-answer/,'existing Q12 answer path remains present');

const q23Model=registry.model.q23;
assert.equal(q23Model.id,'final2-q23-desert-helper-schedule-v1');
assert.equal(q23Model.crossingDays,6);
assert.equal(q23Model.capacity,4);
assert.deepEqual(plain(q23Model.people.map(person=>person.id)),['T','H1','H2']);
const q23=registry.calculate(23);
assert.equal(q23.valid,true);
assert.deepEqual(plain(q23.stages.map(stage=>stage.day)),[0,1,2,6]);
assert.deepEqual(plain(q23.stages.map(stage=>stage.supplies)),[
  {T:4,H1:4,H2:4},{T:4,H1:1,H2:4},{T:4,H1:0,H2:2},{T:0,H1:0,H2:0}
]);
assert.deepEqual(plain(q23.returnTrips),[
  {helper:'H1',turnDay:1,returnSupply:1,arrivalDay:2},
  {helper:'H2',turnDay:2,returnSupply:2,arrivalDay:4}
]);
assert.deepEqual(plain(q23.oneHelper),{earliestTurn:2,latestTurn:1,initialSupply:8,crossingConsumption:6,possible:false});
const q23Html=registry.render(23);
assert.match(q23Html,/gfield-final2-solution-diagram--q23/);
assert.equal(count(q23Html,/data-person-route=/g),3);
assert.equal(count(q23Html,/data-return-route=/g),2);
assert.equal(count(q23Html,/data-supply-stage=/g),4);
assert.match(q23Html,/T=탐험가 · H1=도우미 1 · H2=도우미 2/);
assert.match(q23Html,/data-one-helper-proof="two-days-needed-one-day-possible"/);
assert.doesNotMatch(q23Html,/6\+2x|x≥|x≤/,'Q23 one-helper proof is written in child-readable words');

const q27Model=registry.model.q27;
assert.equal(q27Model.id,'final2-q27-six-sisters-call-flow-v1');
assert.deepEqual(plain(q27Model.calls),[
  ['A','B'],['A','C'],['A','D'],['E','F'],['A','E'],['A','B'],['A','C'],['D','F']
]);
const q27=registry.calculate(27);
assert.equal(q27.valid,true);
assert.equal(q27.firstFullCall,5);
assert.equal(q27.allFullCall,8);
assert.deepEqual(plain(q27.steps.map(step=>step.completed.length)),[0,0,0,0,2,3,4,6]);
assert.deepEqual(plain(q27.steps.map(step=>q27Model.people.map(person=>step.knowledge[person]))),[
  ['AB','AB','C','D','E','F'],
  ['ABC','AB','ABC','D','E','F'],
  ['ABCD','AB','ABC','ABCD','E','F'],
  ['ABCD','AB','ABC','ABCD','EF','EF'],
  ['ABCDEF','AB','ABC','ABCD','ABCDEF','EF'],
  ['ABCDEF','ABCDEF','ABC','ABCD','ABCDEF','EF'],
  ['ABCDEF','ABCDEF','ABCDEF','ABCD','ABCDEF','EF'],
  ['ABCDEF','ABCDEF','ABCDEF','ABCDEF','ABCDEF','ABCDEF']
]);
const q27Html=registry.render(27);
assert.match(q27Html,/gfield-final2-solution-diagram--q27/);
assert.equal(count(q27Html,/data-call-step=/g),8);
assert.match(q27Html,/A~F: 여섯 자매 · AB: A와 B의 소식/);
assert.match(q27Html,/함께 안 소식 ABCDEF/);
assert.match(q27Html,/data-minimum-proof="seven-calls-impossible"/);

const q28Model=registry.model.q28;
assert.equal(q28Model.id,'q28-weighted-road-graph-v1');
assert.equal(q28Model.nodes.length,9);
assert.equal(q28Model.edges.length,18);
assert.equal(new Set(q28Model.edges.map(edge=>edge.id)).size,18);
assert.deepEqual(Array.from(q28Model.duplicateEdgeIds),['AG','CH','EI']);

const q28=registry.calculate(28);
assert.equal(q28.baseLength,201);
assert.equal(q28.addedLength,15);
assert.equal(q28.routeLength,216);
assert.deepEqual(Array.from(q28.oddVertices),['A','C','E','G','H','I']);

const q28Html=registry.render(28);
assert.match(q28Html,/gfield-final2-solution-diagram--q28/);
assert.equal(count(q28Html,/<svg\b/g),2,'Q28 has one exact road map and one actual return-route diagram');
assert.equal(count(q28Html,/role="img"/g),2);
assert.match(q28Html,/두 번 지남 · AG, CH, EI/);
assert.equal(count(q28Html,/data-edge-id=/g),18,'all reviewed roads render exactly once');
assert.equal(count(q28Html,/class="gfield-final2-q28-edge is-repeated"/g),3,'the three minimum repeated roads are marked');
assert.equal(count(q28Html,/class="gfield-final2-q28-edge is-repeated"[^>]*stroke-width="6"[^>]*stroke-dasharray="10 6"/g),3,'repeated roads differ by both weight and dash');
assert.equal(count(q28Html,/data-node-id=/g),9,'all villages render exactly once');
assert.equal(count(q28Html,/data-route-row=/g),3,'the 21-step route is split into three readable rows');
assert.equal(count(q28Html,/data-route-step=/g),21,'every traversal step is visible');
assert.equal(count(q28Html,/class="gfield-final2-q28-route-leg is-repeated"/g),6,'AG, CH, and EI each appear twice in the actual route');
for(const edge of q28Model.edges){
  assert.equal(count(q28Html,new RegExp('data-route-edge-id="'+edge.id+'"','g')),q28Model.duplicateEdgeIds.includes(edge.id)?2:1,edge.id+' route multiplicity is visible');
}
assert.match(q28Html,/실제로 출발점으로 돌아오는 순서/);
assert.match(q28Html,/A에서 출발 · 모든 18개 도로 포함 · A로 도착/);

const q2Model=registry.model.q2;
assert.equal(q2Model.id,'final2-q2-alternating-square-chain-v1');
assert.equal(q2Model.cells.length,20);
assert.equal(q2Model.sharedSidePairs.length,19);
assert.equal(q2Model.largePairsFirstSlope.length,10);
assert.equal(q2Model.largePairsSecondSlope.length,9);
assert.equal(new Set(q2Model.cells.map(cell=>`${cell[1]},${cell[2]}`)).size,20,'Q2 cells are unique');
const q2=registry.calculate(2);
assert.equal(q2.valid,true);
assert.deepEqual(plain({small:q2.smallCount,first:q2.firstPairCount,second:q2.secondPairCount,large:q2.largeCount,total:q2.total}),{small:20,first:10,second:9,large:19,total:39});
const q2Html=registry.render(2);
assert.match(q2Html,/gfield-final2-solution-diagram--q2/);
assert.match(q2Html,/role="img"/);
assert.match(q2Html,/작은 정사각형 20개 \+ 맞닿은 두 칸 19개 = 39개/);
assert.equal(count(q2Html,/data-cell-id=/g),20,'Q2 renders all 20 source cells');
assert.equal(count(q2Html,/data-pair=/g),19,'Q2 renders every shared side');
assert.equal(count(q2Html,/data-group="first"/g),10,'Q2 first alternating group has 10 shared sides');
assert.equal(count(q2Html,/data-group="second"/g),9,'Q2 second alternating group has 9 shared sides');
assert.equal(count(q2Html,/font-size="18"/g),21,'Q2 uses mobile-readable 18-unit labels for 20 cells and the legend');

const q5Model=registry.model.q5;
assert.equal(q5Model.id,'final2-q5-cloud-coloring-v3');
assert.equal(q5Model.countries.length,6);
assert.equal(q5Model.meetingPairs.length,10);
assert.equal(q5Model.centerCountry,'라');
assert.deepEqual(plain(q5Model.outerCycle),['나','가','다','마','바']);
assert.match(q5Model.outlinePath,/C/);
assert.match(q5Model.outlinePath,/Z$/);
assert.match(q5Model.centerPath,/C/);
assert.equal(q5Model.dividerPaths.length,5);
assert.ok(q5Model.dividerPaths.every(path=>/C/.test(path)&&!/[LHZ]/.test(path)),'Q5 uses five curved dividers without straight rays');
const q5=registry.calculate(5);
assert.equal(q5.valid,true);
assert.equal(q5.chromaticNumber,4);
assert.equal(q5.contactPairCount,10);
assert.equal(q5.centerPairCount,5);
assert.equal(q5.outerPairCount,5);
assert.deepEqual(plain(q5.assignment),{'나':1,'다':1,'가':2,'마':2,'바':3,'라':4});
const q5Html=registry.render(5);
assert.match(q5Html,/gfield-final2-solution-diagram--q5/);
assert.equal(count(q5Html,/<svg\b/g),1);
assert.equal(count(q5Html,/class="gfield-final2-q5-country"/g),6,'Q5 labels all six countries');
assert.equal(count(q5Html,/class="gfield-final2-q5-divider"/g),5,'Q5 renders five curved dividers');
assert.equal(count(q5Html,/class="gfield-final2-q5-outline"/g),1,'Q5 renders one cloud outline');
assert.equal(count(q5Html,/data-boundary-ray=/g),0);
assert.equal(count(q5Html,/gfield-final2-q5-central-point/g),0);
assert.equal(count(q5Html,/class="gfield-final2-q5-color-card"/g),4,'Q5 shows the complete four-color assignment');
assert.match(q5Html,/점이 아니라, 두 나라가 함께 쓰는 굽은 경계선/);
assert.doesNotMatch(q5Html,/K4|그래프|3가지/,'Q5 learner diagram avoids audit-only terminology and the superseded alternative answer');

const q9Model=registry.model.q9;
assert.equal(q9Model.id,'final2-q9-five-edge-cuboid-paths-v1');
assert.equal(Object.keys(q9Model.vertices).length,8);
assert.equal(q9Model.edges.length,12);
assert.equal(q9Model.edgeCount,5);
assert.equal(q9Model.revisitAllowed,false);
const expectedQ9Paths=[
  ['K','U0','U1','F1','D1','N'],
  ['K','U0','F0','F1','D1','N'],
  ['K','U0','F0','F1','U1','N'],
  ['K','U0','F0','D0','D1','N'],
  ['K','D0','D1','F1','U1','N'],
  ['K','D0','F0','F1','D1','N'],
  ['K','D0','F0','F1','U1','N'],
  ['K','D0','F0','U0','U1','N']
];
const q9=registry.calculate(9);
assert.equal(q9.valid,true);
assert.deepEqual(plain(q9.paths),expectedQ9Paths,'Q9 exact eight paths are independently enumerated');
assert.deepEqual(plain(q9.firstStepCounts),{U0:4,D0:4});
assert.ok(q9.paths.every(route=>route.length===6&&new Set(route).size===6),'Q9 routes use five edges without revisiting a vertex');
assert.deepEqual(plain(q9.screenVertices),{
  K:{x:64,y:30},N:{x:176,y:30},U0:{x:24,y:64},U1:{x:136,y:64},
  D0:{x:64,y:82},D1:{x:176,y:82},F0:{x:24,y:116},F1:{x:136,y:116}
},'Q9 projection keeps K-N on the top back edge, U above/front, D below/back, and F below/front');
const q9Html=registry.render(9);
assert.match(q9Html,/gfield-final2-solution-diagram--q9/);
assert.match(q9Html,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'Q9 eight routes use a readable two-column grid');
assert.equal(count(q9Html,/data-route-index=/g),8,'Q9 renders all eight paths');
assert.equal(count(q9Html,/class="gfield-final2-q9-route"/g),8,'Q9 route cards are explicit');
assert.equal(count(q9Html,/role="img"/g),9,'Q9 has one spatial key and eight route diagrams');
assert.match(q9Html,/F=아래 앞쪽/,'Q9 spatial key matches the source-facing projection');
for(const id of Object.keys(q9Model.vertices)) assert.equal(count(q9Html,new RegExp(`data-vertex-id="${id}"`,'g')),9,`Q9 vertex ${id} appears in the key and all paths`);
for(const [index,route] of expectedQ9Paths.entries()){
  assert.match(q9Html,new RegExp(`data-route-index="${index+1}"[^>]*data-route="${route.join('-')}"`),`Q9 path ${index+1} is bound to its SVG card`);
}

const q13Model=registry.model.q13;
assert.equal(q13Model.id,'final2-q13-road-network-v1');
assert.equal(q13Model.horizontalSegments.length,8);
assert.equal(q13Model.verticalSegments.length,7);
assert.ok(q13Model.horizontalSegments.some(segment=>segment.y==='Y4'&&segment.from==='X0'&&segment.to==='X1'),'Q13 preserves the source left-short Y4 segment');
assert.deepEqual(plain(q13Model.points),{A:{x:'X0',y:'Y0'},B:{x:'X2',y:'Y2'},C:{x:'X3',y:'Y5'},D:{x:'X5',y:'Y7'}});
const q13=registry.calculate(13);
assert.equal(q13.valid,true);
assert.equal(q13.first.pathCount,4);
assert.equal(q13.second.pathCount,4);
assert.equal(q13.total,16);
assert.equal(q13.first.counts.find(point=>point.label==='A').count,1);
assert.equal(q13.first.counts.find(point=>point.label==='B').count,4);
assert.equal(q13.second.counts.find(point=>point.label==='B').count,1);
assert.equal(q13.second.counts.find(point=>point.label==='D').count,4);
assert.ok(!q13.second.counts.some(point=>point.label==='C'),'Q13 C is excluded from the second cumulative count');
assert.ok(q13.first.counts.length>=9&&q13.second.counts.length>=13,'Q13 retains intersection-by-intersection cumulative counts');
const q13Html=registry.render(13);
assert.match(q13Html,/gfield-final2-solution-diagram--q13/);
assert.equal(count(q13Html,/data-leg=/g),2,'Q13 renders A→B and B→D separately');
assert.equal(count(q13Html,/data-road-horizontal=/g),16,'Q13 exact eight horizontal source segments render in each panel');
assert.equal(count(q13Html,/data-road-vertical=/g),14,'Q13 exact seven vertical source segments render in each panel');
assert.equal(count(q13Html,/data-count-node=/g),q13.first.counts.length+q13.second.counts.length,'Q13 every computed intersection count is visible');
assert.match(q13Html,/data-point-label="C"/);
assert.match(q13Html,/C ×/,'Q13 marks the banned point C in the second diagram');
assert.match(q13Html,/4 × 4 = 16가지/);

const q16Model=registry.model.q16;
assert.equal(q16Model.id,'final2-q16-l-tromino-orbits-v1');
assert.deepEqual(plain(q16Model.pieces),[{kind:'L-tromino',count:2,cells:3},{kind:'monomino',count:3,cells:1}]);
assert.equal(q16Model.representatives.length,4);
const q16=registry.calculate(16);
assert.equal(q16.valid,true);
assert.deepEqual(plain({placements:q16.placementCount,pairs:q16.disjointPairCount,orbits:q16.orbitCount}),{placements:16,pairs:22,orbits:4});
assert.ok(q16.representatives.every(representative=>representative.A.length===3&&representative.B.length===3&&representative.single.length===3),'Q16 each representative has two L trominoes and three single cells');
assert.equal(new Set(q16.representatives.map(representative=>representative.orbitKey)).size,4,'Q16 representatives occupy four distinct rotation/reflection classes');
const q16Html=registry.render(16);
assert.match(q16Html,/gfield-final2-solution-diagram--q16/);
assert.match(q16Html,/돌리기 · ↔ 뒤집기로 같아지는 배치는 하나로 묶기/);
assert.equal(count(q16Html,/data-representative=/g),4,'Q16 renders four representative boards');
assert.equal(count(q16Html,/data-piece=/g),36,'Q16 renders every cell of four 3×3 boards');
assert.equal(count(q16Html,/data-piece="A"/g),12);
assert.equal(count(q16Html,/data-piece="B"/g),12);
assert.equal(count(q16Html,/data-piece="single"/g),12);
assert.equal(count(q16Html,/role="img"/g),4);

for(const no of [2,5,9,12,13,16,23,27,28]){
  assert.notEqual(registry.calculate(no),null,`Q${no} has a calculation contract`);
  assert.ok(registry.render(no).length>0,`Q${no} has a fail-closed renderer implementation`);
  assert.doesNotMatch(registry.render(no),/<image\b|\bhref=|https?:\/\//i,`Q${no} uses only local model-derived SVG shapes`);
}

for(const unknown of [0,1,3,8,10,11,14,15,17,29,31,'unknown',null,undefined]){
  assert.equal(registry.calculate(unknown),null,`unknown model ${String(unknown)} does not calculate`);
  assert.equal(registry.render(unknown),'',`unknown model ${String(unknown)} fails closed`);
}

console.log('PASS Final2 diagram registry: Q23=2 helpers, Q27=8 calls, Q28=201+15=216 with 21-step return route; prior reviewed cores preserved; unknown models fail closed');
