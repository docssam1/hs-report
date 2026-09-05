'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'bank/data/final1-fixed90.json'),'utf8'));
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'),sourceContext);
const sourceQuestions=sourceContext.window.GFIELD_MOCK_FINAL.rounds['1'].items;
assert.equal(sourceQuestions.find(q=>q.no===12).answer,'20, 40, 30, 10','source Q12 must satisfy the total of 100');
assert.match(sourceQuestions.find(q=>q.no===7).comment,/408−22−51=335/,'source Q7 station distances');
assert.match(sourceQuestions.find(q=>q.no===27).caution,/기차 길이−자동차 길이/,'source Q27 full-occlusion interval');
// Reuse the existing independent reference calculations, never the generator.
const reference=fs.readFileSync(path.join(root,'qa/bank-final1-generators-validate.js'),'utf8');
const from=reference.indexOf('function externalAnswer(id, q) {');
const to=reference.indexOf('\n\n      ids.forEach',from);
assert.ok(from>0&&to>from);
const external=vm.runInNewContext('(function(){const digitSum=n=>String(n).split(\'\').reduce((s,d)=>s+Number(d),0);'+reference.slice(from,to)+';return externalAnswer;})()');
function foldRegions(pattern){
  const unit=pattern==='mid-cross'?[[[0,.5],[1,.5]],[[.5,0],[.5,1]]]:pattern==='single-diagonal'?[[[0,0],[1,1]]]:[[[0,0],[1,1]],[[1,0],[0,1]]];
  const lines=[];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)unit.forEach(seg=>lines.push(seg.map(([x,y])=>[c+(c%2?1-x:x),r+(r%2?1-y:y)])));
  lines.push([[0,0],[4,0]],[[4,0],[4,4]],[[4,4],[0,4]],[[0,4],[0,0]]);
  const eps=1e-8,cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
  const key=p=>p.map(v=>Math.round(v*1e8)/1e8).join(',');
  const points=lines.map(seg=>seg.slice());
  for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){
    const [p,p2]=lines[i],[q,q2]=lines[j],r=sub(p2,p),s=sub(q2,q),den=cross(r,s),qp=sub(q,p);
    if(Math.abs(den)>eps){
      const t=cross(qp,s)/den,u=cross(qp,r)/den;
      if(t>=-eps&&t<=1+eps&&u>=-eps&&u<=1+eps){const v=[p[0]+t*r[0],p[1]+t*r[1]];points[i].push(v);points[j].push(v);}
    }else if(Math.abs(cross(qp,r))<eps){
      for(const v of [p,p2,q,q2]){
        const on=(a,b)=>v[0]>=Math.min(a[0],b[0])-eps&&v[0]<=Math.max(a[0],b[0])+eps&&v[1]>=Math.min(a[1],b[1])-eps&&v[1]<=Math.max(a[1],b[1])+eps;
        if(on(p,p2)&&on(q,q2)){points[i].push(v);points[j].push(v);}
      }
    }
  }
  const vertices=new Map(),edges=new Set();
  points.forEach((ps,i)=>{
    const [p,p2]=lines[i],direction=sub(p2,p);
    const ordered=[...new Map(ps.map(v=>[key(v),v])).values()].sort((a,b)=>(a[0]-b[0])*direction[0]+(a[1]-b[1])*direction[1]);
    for(let n=0;n<ordered.length;n++){
      const k=key(ordered[n]);if(!vertices.has(k))vertices.set(k,new Set());
      if(n){const prev=key(ordered[n-1]);edges.add([prev,k].sort().join('|'));vertices.get(prev).add(k);vertices.get(k).add(prev);}
    }
  });
  const visited=new Set();let components=0;
  for(const k of vertices.keys())if(!visited.has(k)){
    components++;const todo=[k];while(todo.length){const p=todo.pop();if(visited.has(p))continue;visited.add(p);todo.push(...vertices.get(p));}
  }
  return edges.size-vertices.size+components;
}
function solveVisibleShapes(m){
  const rows=[];
  const counts=ids=>[0,1,2,3].map(symbol=>ids.filter(id=>id===symbol).length);
  for(let i=0;i<3;i++)rows.push(counts(m.grid[i]).concat(m.rowSums[i]));
  for(let i=0;i<3;i++)rows.push(counts(m.grid.map(r=>r[i])).concat(m.columnSums[i]));
  let pivot=0;const columns=[];
  for(let col=0;col<4;col++){
    const found=rows.findIndex((r,i)=>i>=pivot&&Math.abs(r[col])>1e-9);
    assert.ok(found>=0,'visible shape equations must uniquely determine all symbols');
    [rows[pivot],rows[found]]=[rows[found],rows[pivot]];
    const divisor=rows[pivot][col];rows[pivot]=rows[pivot].map(v=>v/divisor);
    rows.forEach((row,i)=>{if(i!==pivot){const factor=row[col];rows[i]=row.map((v,c)=>v-factor*rows[pivot][c]);}});
    columns.push(col);pivot++;
  }
  const values=columns.map((col,i)=>rows[i][4]);
  return [m.grid[3].reduce((s,c)=>s+values[c],0),m.grid.reduce((s,r)=>s+values[r[3]],0)].map(v=>Math.round(v*1e8)/1e8).join(', ');
}
function independent(q){
  const m=q.meta;
  if(q.sourceNo===2){
    let count=0;const occupied=(x,y,z)=>z>=0&&!!m.heights[y]&&z<(m.heights[y][x]||0);
    m.heights.forEach((row,y)=>row.forEach((h,x)=>{for(let z=0;z<h;z++){
      const exposed=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1]].filter(([dx,dy,dz])=>!occupied(x+dx,y+dy,z+dz)).length;
      if(exposed===0||exposed===2)count++;
    }}));return count;
  }
  if(q.sourceNo===11){
    const b=m.outer.map((v,i)=>m.targetSum-v-m.outer[(i+2)%5]);
    const first=(b[0]-b[1]+b[2]-b[3]+b[4])/2,inside=[first];
    for(let i=0;i<4;i++)inside.push(b[i]-inside[i]);
    return Number(inside.slice(0,3).join(''))+Number(inside.slice(3).join(''));
  }
  if(q.sourceNo===18)return foldRegions(m.cutPattern);
  if(q.sourceNo===20){
    const signs=new Set();
    for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++)for(let z=-4;z<=4;z++){
      const planes=[x-y,x+y,y-z,y+z,x-z,x+z].slice(0,m.activeCuts||6);
      if(planes.every(v=>v!==0))signs.add(planes.map(Math.sign).join(','));
    }
    return signs.size;
  }
  if(q.sourceNo===21)return solveVisibleShapes(m);
  if(q.sourceNo===23){
    const permute=a=>a.length?a.flatMap((v,i)=>permute(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
    const answers=[];
    for(const people of permute(m.people))for(const sports of permute(m.sports)){
      const valid=m.constraints.every(c=>{
        if(c.kind==='person-day')return people.indexOf(c.person)===c.dayIndex;
        if(c.kind==='person-before-person')return people.indexOf(c.first)<people.indexOf(c.second);
        if(c.kind==='person-immediately-before-person')return people.indexOf(c.first)+1===people.indexOf(c.second);
        if(c.kind==='person-immediately-after-person')return people.indexOf(c.first)===people.indexOf(c.second)+1;
        if(c.kind==='sport-day')return sports.indexOf(c.sport)===c.dayIndex;
        if(c.kind==='sport-not-day')return !c.excludedDayIndexes.includes(sports.indexOf(c.sport));
        if(c.kind==='sport-immediately-after-sport')return sports.indexOf(c.first)===sports.indexOf(c.second)+1;
        throw new Error('unknown schedule constraint');
      });
      if(valid){const day=people.indexOf(m.target);answers.push([m.target,['월요일','화요일','수요일','목요일','금요일'][day],sports[day]].join(', '));}
    }
    assert.equal(answers.length,1,q.id+': unique complete schedule');return answers[0];
  }
  return external(q.genId,q);
}
assert.equal(data.items.length,90);
assert.equal(new Set(data.items.map(q=>q.id)).size,90);
for(let no=1;no<=30;no++)assert.equal(data.items.filter(q=>q.sourceNo===no).length,3);
for(const q of data.items)assert.equal(String(independent(q)),String(q.answer),`${q.id}: independent frozen-record answer`);
assert.deepEqual(['diagonals','single-diagonal','mid-cross'].map(foldRegions),[40,12,25]);
console.log('PASS fixed90 independent answers: 90 frozen records; occupancy, visible equations, reflected cut-line planar graph, arithmetic and enumeration');
