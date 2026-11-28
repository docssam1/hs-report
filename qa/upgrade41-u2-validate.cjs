'use strict';
// 승급과정 4-1 2단원 일일테스트 유사문제 검사. 생성기의 계산식을 쓰지 않는다.
// 새로 만든 9유형: 그려진 좌표를 재서 ① 그림에 적힌 각도가 맞는지 ② 정답이 맞는지 확인한다.
// 문제은행 3유형: 화면에 보이는 문제 글에서 정답을 다시 계산한다.
const assert=require('node:assert/strict'),path=require('node:path');const ROOT=path.join(__dirname,'..');
const G=require(path.join(ROOT,'upgrade-bank/generators-u2.js'));
global.window={};require(path.join(ROOT,'elementary4/source-inventory-4-1.js'));require(path.join(ROOT,'elementary4/generators.js'));
const data=require(path.join(ROOT,'upgrade-bank/data/upgrade41.json'));
const SHEETS=['초등과정 4-1 일일테스트 2단원 1,2차시','초등과정 4-1 일일테스트 2단원 3,4차시'];
const mine=data.sources.filter(s=>SHEETS.includes(s.sheet));
assert.equal(mine.length,12);for(const sh of SHEETS)assert.deepEqual(mine.filter(s=>s.sheet===sh).map(s=>s.no),[1,2,3,4,5,6]);
assert.deepEqual(mine.filter(s=>s.engine==='u2').map(s=>s.id).sort(),G.keys.slice().sort());
const text=h=>h.replace(/<svg[\s\S]*?<\/svg>/g,' ').replace(/<span hidden[^>]*><\/span>/g,'').replace(/<\/(div|li|br|button|p)>/g,'\n').replace(/<[a-zA-Z/!][^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function parse(html){const pts={};for(const m of html.matchAll(/<g data-p="([^"]+)" data-x="([-\d.]+)" data-y="([-\d.]+)">/g))pts[m[1]]={x:+m[2],y:+m[3]};
  const arcs=[...html.matchAll(/<path [^>]*data-angle="([^"]+)"([^>]*)\/>/g)].map(m=>{const [v,a,b]=m[1].split(',');const reflex=/data-reflex/.test(m[2]);const dir=p=>Math.atan2(pts[p].y-pts[v].y,pts[p].x-pts[v].x)*180/Math.PI;let x=Math.abs(dir(a)-dir(b))%360;if(x>180)x=360-x;return{v,a,b,value:reflex?360-x:x,given:(/data-given="([\d.]+)"/.exec(m[2])||[])[1],target:(/data-target="([^"]+)"/.exec(m[2])||[])[1]}});
  const lines=[...html.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"([^>]*)\/>/g)].map(m=>({a:{x:+m[1],y:+m[2]},b:{x:+m[3],y:+m[4]},rest:m[5]}));
  return{pts,arcs,lines,texts:[...html.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map(m=>m[1])};}
const near=(a,b,msg,tol=0.06)=>assert.ok(Math.abs(a-b)<tol,msg+' '+a+' ≠ '+b);
const num=a=>Number(String(a).replace(/[^\d.]/g,''));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ang=(P,v,a,b)=>{let x=Math.abs(Math.atan2(P[a].y-P[v].y,P[a].x-P[v].x)-Math.atan2(P[b].y-P[v].y,P[b].x-P[v].x))*180/Math.PI%360;return x>180?360-x:x;};
const clockwise=(P,k)=>(90-Math.atan2(P[k].y-P.O.y,P[k].x-P.O.x)*180/Math.PI+720)%360;
const circ=(a,b)=>{const x=Math.abs(a-b)%360;return Math.min(x,360-x);};
const target=(f,t)=>{const hit=f.arcs.filter(a=>a.target===t);assert.equal(hit.length,1,'기호 '+t);return hit[0].value;};
// 선 그림의 각 세기: 교점에서 선을 잘라 점마다 이웃 방향을 모은다(생성기와 다른 방법)
function countAngles(segs){const E=1e-2,nodes=[];const idx=p=>{let i=nodes.findIndex(q=>dist(p,q)<E*3);if(i<0){nodes.push(p);i=nodes.length-1;}return i;};
  const cuts=segs.map(()=>[0,1]);for(let i=0;i<segs.length;i++)for(let j=0;j<segs.length;j++){if(i===j)continue;const p=segs[i].a,r={x:segs[i].b.x-p.x,y:segs[i].b.y-p.y},q=segs[j].a,s={x:segs[j].b.x-q.x,y:segs[j].b.y-q.y},den=r.x*s.y-r.y*s.x;if(Math.abs(den)<1e-6)continue;const t=((q.x-p.x)*s.y-(q.y-p.y)*s.x)/den,u=((q.x-p.x)*r.y-(q.y-p.y)*r.x)/den;const et=E/Math.hypot(r.x,r.y),eu=E/Math.hypot(s.x,s.y);if(t>-et&&t<1+et&&u>-eu&&u<1+eu)cuts[i].push(Math.min(1,Math.max(0,t)));}
  const nb=new Map();segs.forEach((g,i)=>{const at=t=>({x:g.a.x+(g.b.x-g.a.x)*t,y:g.a.y+(g.b.y-g.a.y)*t});const ids=cuts[i].sort((a,b)=>a-b).map(t=>idx(at(t))).filter((v,k,a)=>k===0||v!==a[k-1]);for(let k=1;k<ids.length;k++){for(const [x,y] of [[ids[k-1],ids[k]],[ids[k],ids[k-1]]]){if(!nb.has(x))nb.set(x,new Set());nb.get(x).add(y);}}});
  let total=0;for(const [v,set] of nb){const dirs=[];for(const w of set){const d=Math.atan2(nodes[w].y-nodes[v].y,nodes[w].x-nodes[v].x)*180/Math.PI;if(!dirs.some(e=>circ(e,d)<0.3))dirs.push(d);}for(let a=0;a<dirs.length;a++)for(let b=a+1;b<dirs.length;b++)if(circ(dirs[a],dirs[b])<179.5)total++;}return total;}
const check={
 'u2-12-q1'(f,r){const segs=f.lines.filter(l=>/u2-seg/.test(l.rest));assert.ok(segs.length>=4);assert.equal(countAngles(segs),num(r.answer));},
 'u2-12-q4'(f,r,lv){const P=f.pts;near(dist(P.N,P.G),dist(P.N,P.D),'합동 1');near(dist(P.N,P.S),dist(P.N,P.E),'합동 2');near(dist(P.G,P.S),dist(P.D,P.E),'합동 3');const turn=ang(P,'N','G','D');near(turn,ang(P,'N','S','E'),'돌린 각 일치');near(num(r.answer),lv==='higher'?ang(P,'N','D','S'):turn,'정답');},
 'u2-12-q5'(f,r){const P=f.pts,t=f.arcs.filter(a=>a.target);const n=Object.keys(P).filter(k=>/^q0_/.test(k)).length+1;assert.equal(t.length,4*(n-1));const last=n-2;for(const [x,y] of [['q0_0','q2_0'],['q0_'+last,'q2_'+last],['q1_0','q3_0'],['q1_'+last,'q3_'+last]])near(ang(P,'O',x,y),180,'마주 보는 변은 한 직선',0.05);near(t.reduce((s,a)=>s+a.value,0),num(r.answer),'정답',0.2);},
 'u2-12-q6'(f,r,lv){const P=f.pts;for(const [v,a,b] of [['T','J','U'],['U','T','E'],['K','J','F']])near(ang(P,v,a,b),90,'직각');near(ang(P,'J','G','K'),90,'직각');near(ang(P,'K','F','Z'),0,'아래 직선',0.05);near(ang(P,'J','E','F'),0,'비스듬한 직선',0.05);const sum=['㉠','㉡','㉢','㉣'].reduce((s,k)=>s+target(f,k),0);if(lv==='higher'){near(sum,Number(/합이 (\d+)°/.exec(text(r.html))[1]),'문제의 합',0.2);near(target(f,'㉤'),num(r.answer),'정답');}else near(sum,num(r.answer),'정답',0.2);},
 'u2-34-q1'(f,r){const P=f.pts;near(P.C0&&dist(P.C0,P.C1),dist(P.T,{x:P.T.x,y:P.U.y}),'테이프 폭',0.05);near(dist(P.R0,P.R1),dist(P.C0,P.C1),'테이프 폭 2',0.05);near(ang(P,'C0','V','C1'),90,'끝 직각');near(ang(P,'C1','C0','Z'),90,'끝 직각');near(dist(P.U,P.R0),dist(P.U,P.W),'접은 길이',0.05);const Q={...P,left:{x:P.T.x-50,y:P.T.y},right:{x:P.V.x+50,y:P.V.y}};near(ang(Q,'T','left','U'),ang(Q,'T','U','V'),'첫 번째 접기: 두 각이 같음',0.05);near(ang(Q,'V','right','Z'),ang(Q,'V','Z','C0'),'두 번째 접기: 두 각이 같음',0.05);near(target(f,'㉠'),num(r.answer),'정답');},
 'u2-34-q3'(f,r){near(target(f,'㉡'),target(f,'㉢'),'㉡=㉢');near(target(f,'㉣'),target(f,'㉤'),'㉣=㉤');near(target(f,'㉠'),num(r.answer),'정답');},
 'u2-34-q4'(f,r){const m=/오후 (\d+)시 (?:(\d+)분|정각)입니다\. 긴바늘이 (\d+)° (움직인 후|움직이기 전)/.exec(text(r.html));assert.ok(m,text(r.html));let t=(+m[1]%12)*60+Number(m[2]||0);const step=m[4]==='움직인 후'?1:-1;assert.equal(+m[3]%6,0);for(let i=0;i<+m[3]/6;i++)t=(t+step+720)%720;const a=Math.abs(30*Math.floor(t/60)-5.5*(t%60));near(Math.min(a,360-a),num(r.answer),'정답');},
 'u2-34-q5'(f,r,lv){const H=clockwise(f.pts,'H'),M=clockwise(f.pts,'M'),K=clockwise(f.pts,'K');const sols=[];for(let t=0;t<720;t++)for(let k=0;k<12;k++)if(circ(t/2+30*k,H)<0.05&&circ((t%60)*6+30*k,M)<0.05)sols.push({t,k});assert.equal(sols.length,1,'시각이 하나로 정해져야 함 '+sols.length);const {t,k}=sols[0];const off=((K-30*k)%30+30)%30;near(Math.min(off,30-off),0,'점선은 숫자 자리',0.05);near(circ(H,K),f.arcs[0].value,'점선까지 각');const say=x=>(Math.floor(x/60)||12)+'시 '+(x%60)+'분';if(lv==='higher'){const later=+/(\d+)분 뒤에/.exec(text(r.html))[1],u=(t+later)%720,a=Math.abs(30*Math.floor(u/60)-5.5*(u%60));near(Math.min(a,360-a),num(r.answer),'정답');}else assert.equal(r.answer,say(t));},
 'u2-34-q6'(f,r){const N=Number(/짧은바늘은 (\d+)시간에/.exec(text(r.html))[1]);assert.deepEqual(f.texts.filter(x=>/^\d+$/.test(x)).map(Number),Array.from({length:N},(_,i)=>i+1));const m=/그림은 (\d+)시 (?:(\d+)분|정각)/.exec(text(r.html)),h=+m[1],mm=Number(m[2]||0);near(circ(clockwise(f.pts,'H'),(h*60+mm)*6/N),0,'짧은바늘 위치',0.05);near(circ(clockwise(f.pts,'M'),mm*6),0,'긴바늘 위치',0.05);near(circ(clockwise(f.pts,'H'),clockwise(f.pts,'M')),num(r.answer),'정답');}
};
const SEEDS=Number(process.env.SEEDS||300);let total=0;const stats={},failures=[];
for(const s of mine.filter(x=>x.engine==='u2'))for(const lv of ['lower','same','higher']){const seen=new Set();for(let k=0;k<SEEDS;k++){let r;try{r=G.generate(s.id,lv,(k*2654435761+s.no)>>>0);assert.ok(r,'생성 실패');assert.ok(!/undefined|NaN|Infinity/.test(r.html+r.answer+r.solution),'이상한 값');const f=parse(r.html);for(const a of f.arcs)if(a.given!=null)near(a.value,+a.given,'그림에 적힌 각도');check[s.id](f,r,lv);seen.add(r.html);total++;}catch(e){failures.push({q:s.id,lv,k,msg:String(e.message).slice(0,200)});if(failures.length>15)break;}}stats[s.id+'-'+lv]=seen.size;}
// 원본 그림 구조 확인: 1번은 원본(41개)과 같은 구조에서 41이 나온다
assert.ok(Array.from({length:60},(_,i)=>G.generate('u2-12-q1','same',i)).some(r=>r.answer==='41개'),'원본 구조의 답 41');
// 문제은행 3유형
const bank={
 'u2-12-q2'(h){const n=+/직선 (\d+)개가 만납니다/.exec(text(h))[1];return a=>assert.equal(num(a),n*(n-1));},
 'u2-12-q3'(h){const items=[...text(h).matchAll(/\((직각|예각|둔각|평각)\)\s*([+\-−])\s*\((직각|예각|둔각|평각)\)\s*([=<>])\s*\((직각|예각|둔각|평각)\)/g)];assert.ok(items.length>=6&&items.length<=12,"보기 수 "+items.length);assert.equal(items.length,(text(h).match(/\((직각|예각|둔각|평각)\)\s*[=<>]/g)||[]).length,"읽지 못한 보기");const range={직각:[90],예각:[1,2,30,44,45,46,60,88,89],둔각:[91,92,120,135,150,178,179],평각:[180]};const kind=v=>v===90?'직각':v===180?'평각':v>0&&v<90?'예각':v>90&&v<180?'둔각':'없음';const bad=[];items.forEach((m,i)=>{const always=range[m[1]].every(x=>range[m[3]].every(y=>{if(m[2]!=='+'&&x<=y)return true;const v=m[2]==='+'?x+y:x-y;return m[4]==='='?kind(v)===m[5]:m[4]==='>'?v>range[m[5]][0]:v<range[m[5]][0];}));if(!always)bad.push('①②③④⑤⑥⑦⑧⑨⑩⑪⑫'[i]);});return a=>assert.deepEqual(a.match(/[①-⑫]/g),bad,text(h));},
 'u2-34-q2'(h){const m=/각각 (\d+)°이고, 오른쪽 밑각은 (\d+)°/.exec(text(h));assert.ok(m,text(h));return a=>assert.equal(num(a),+m[1]+ +m[2]);}
};
for(const s of mine.filter(x=>x.engine==='elem4')){const item=window.HSE_SOURCE_INVENTORY_41.items.find(x=>x.sourceItemId===s.item);assert.ok(item&&!item.reviewLocked,s.item);for(const [lv,off] of [['lower',-1],['same',0],['higher',1]]){const seen=new Set();for(let k=0;k<SEEDS;k++){let r;try{r=window.HSE_GENERATORS.generate(item,2,off,(k*2654435761+s.no)>>>0,item.variant);bank[s.id](r.prompt)(String(r.answer));seen.add(r.prompt);total++;}catch(e){failures.push({q:s.id,lv,k,msg:String(e.message).slice(0,400),answer:r&&r.answer});if(failures.length>15)break;}}stats[s.id+'-'+lv]=seen.size;}}
if(failures.length){console.log(JSON.stringify(failures.slice(0,14),null,1));process.exit(1);}
console.log(JSON.stringify({pass:true,checked:total,distinct:stats}));
