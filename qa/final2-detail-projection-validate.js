'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(ROOT,'final2-solution-diagrams.js'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox,{filename:'final2-solution-diagrams.js'});
const plain=value=>JSON.parse(JSON.stringify(value));

const api=sandbox.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS;
assert.ok(api&&typeof api.render==='function','diagram renderer is registered');
assert.equal(typeof api.calculate,'function','projection calculation is exposed for audit');
assert.equal(typeof api.projectTop,'function','top-projection operation is exposed for audit');

const model=api.model.q12;
assert.equal(model.no,12);
assert.equal(model.reviewId,'final2-detailed-review-20260909');
assert.equal(model.sourceLocator,'materials/final_2/002.jpg#q12');
assert.ok(fs.existsSync(path.join(ROOT,model.sourceLocator.split('#')[0])),'reviewed source render exists');
assert.deepEqual(plain(model.axes),{x:'left-right',y:'front-back',z:'height'});
assert.deepEqual(plain(model.answerOrientation),{back:'top',front:'bottom'});
assert.equal(model.projection,'drop-z');
assert.equal(model.answerKind,'drawing');
assert.equal(model.parameters.role,'diagram-only-representative');
assert.equal(model.parameters.exactMidpointClaim,false,'interior drawing positions are not midpoint claims');
for(const key of ['t','a','b']){
  assert.ok(model.parameters[key]>0&&model.parameters[key]<1,`${key} stays inside the relevant edge`);
}

const symbolicPath=model.spatialPath.map(point=>[point.x,point.y,point.z]);
assert.deepEqual(plain(symbolicPath),[
  [1,1,1],[0,'t',1],[0,0,1],['a',0,0],['a','b',0],[1,'b',0],[1,1,0]
]);

const calculated=api.calculate(12);
const p=model.parameters;
assert.deepEqual(plain(calculated.projected.map(point=>({x:point.x,y:point.y}))),[
  {x:1,y:1},{x:0,y:p.t},{x:0,y:0},{x:p.a,y:0},
  {x:p.a,y:p.b},{x:1,y:p.b},{x:1,y:1}
]);
assert.deepEqual(
  plain(calculated.projected.map(point=>({x:point.x,y:point.y}))),
  plain(calculated.spatial.map(({x,y})=>({x,y}))),
  'the answer path is calculated by dropping only z'
);
assert.deepEqual(
  plain(api.projectTop({x:0.3,y:0.7,z:999})),
  plain(api.projectTop({x:0.3,y:0.7,z:-999})),
  'height cannot change a top projection'
);

const points=calculated.projected;
assert.deepEqual(plain({x:points[0].x,y:points[0].y}),plain({x:points.at(-1).x,y:points.at(-1).y}),'the source vertical closing edge collapses to one point');
assert.equal(points[1].x,0,'upper-left interior point lies on the left edge');
assert.deepEqual(plain({x:points[2].x,y:points[2].y}),{x:0,y:0},'path reaches the front-left corner');
assert.equal(points[3].y,0,'next point lies on the front edge');
assert.equal(points[4].x,points[3].x,'interior segment preserves left-right position');
assert.equal(points[4].y,points[5].y,'next segment preserves front-back position');
assert.equal(points[5].x,1,'right interior point lies on the right edge');

// Negative control: changing height alone never changes any projected vertex.
const lifted=calculated.spatial.map((point,index)=>api.projectTop({
  x:point.x,
  y:point.y,
  z:index%2===0?100:-100,
  role:point.role
}));
assert.deepEqual(plain(lifted),plain(calculated.projected));

// The topology remains valid for other interior positions, so the SVG values
// cannot be mistaken for source-asserted midpoints.
function resolveSymbolic(parameters){
  return model.spatialPath.map(point=>({
    x:typeof point.x==='number'?point.x:parameters[point.x],
    y:typeof point.y==='number'?point.y:parameters[point.y]
  }));
}
for(const parameters of [{t:0.31,a:0.42,b:0.63},{t:0.72,a:0.61,b:0.36}]){
  const variant=resolveSymbolic(parameters);
  assert.deepEqual(variant[0],variant.at(-1));
  assert.equal(variant[1].x,0);
  assert.equal(variant[2].x,0);
  assert.equal(variant[2].y,0);
  assert.equal(variant[3].y,0);
  assert.equal(variant[3].x,variant[4].x);
  assert.equal(variant[4].y,variant[5].y);
  assert.equal(variant[5].x,1);
}

const html=api.render(12);
assert.match(html,/^<figure class="gfield-final2-solution-diagram/);
assert.match(html,/<svg viewBox="0 0 320 340" role="img"/);
assert.match(html,/preserveAspectRatio="xMidYMid meet"/);
assert.match(html,/width:100%;height:auto/);
assert.match(html,/vector-effect="non-scaling-stroke"/);
assert.match(html,/gfield-final2-q12-answer/);
assert.doesNotMatch(html,/midpoint|중점| id=/i,'render does not claim midpoints or create duplicate-prone ids');
assert.equal(api.render(11),'','renderer rejects unrelated questions');
assert.equal(api.calculate(11),null,'calculator rejects unrelated questions');

console.log('PASS Final2 Q12 source-topology projection: direction, drop-z path, vertical collapse, representative-position boundary, and responsive SVG');
