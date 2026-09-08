'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const sandbox={window:{},console};
vm.createContext(sandbox);
for(const file of ['mock-data-final.js','final2-solution-diagrams.js','final2-detailed-data.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,file),'utf8'),sandbox,{filename:file});
}

const detail=sandbox.window.GFIELD_FINAL2_DETAILED;
const byNo=new Map(detail.items.map(item=>[item.no,item]));
const answers=new Map(detail.items.map(item=>[item.no,item.answer]));

// Q1: x high-score results and 12-x low-score results total 40.
const q1=[...Array(13)].map((_,x)=>x).filter(x=>6*x+2*(12-x)===40);
assert.deepEqual(q1,[4]);
assert.equal(answers.get(1),`${q1[0]}번`);

// Q3: total wins in a six-team round robin; class 5 has two more wins.
const totalLeagueGames=6*5/2;
const remainingWins=totalLeagueGames-(5+3+0+1);
const q3=[];
for(let class5=0;class5<=5;class5++){
  for(let class6=0;class6<=5;class6++){
    if(class5+class6===remainingWins&&class5-class6===2) q3.push([class5,5-class5]);
  }
}
assert.deepEqual(q3,[[4,1]]);
assert.equal(answers.get(3),`${q3[0][0]}승 ${q3[0][1]}패`);
const leaguePairs=[];
for(let first=0;first<6;first++) for(let second=first+1;second<6;second++) leaguePairs.push([first,second]);
const feasibleClass5Records=new Set();
for(let outcomes=0;outcomes<2**leaguePairs.length;outcomes++){
  const wins=Array(6).fill(0);
  leaguePairs.forEach(([first,second],index)=>wins[(outcomes>>index)&1?first:second]++);
  if(wins.slice(0,4).join(',')==='5,3,0,1'&&wins[4]-wins[5]===2){
    feasibleClass5Records.add(`${wins[4]},${5-wins[4]}`);
  }
}
assert.deepEqual([...feasibleClass5Records],['4,1'],'the stated league records are jointly realizable');

// Q4: unordered choice with repetition; then independently deduplicate sums.
const money=[10,50,100,500,1000];
const q4Sums=new Set();
for(let i=0;i<money.length;i++) for(let j=i;j<money.length;j++) q4Sums.add(money[i]+money[j]);
assert.equal(q4Sums.size,15);
assert.equal(answers.get(4),`${q4Sums.size}가지`);
const q4TableRows=[];
for(let i=0;i<money.length;i++){
  for(let j=i+1;j<money.length;j++) q4TableRows.push([`${money[i]}+${money[j]}`,String(money[i]+money[j])]);
}
assert.deepEqual(
  JSON.parse(JSON.stringify(byNo.get(4).steps[1].table.rows)),
  q4TableRows,
  'Q4 printed different-type sums match all unordered distinct pairs'
);

// Q6: enumerate every integer in the stated range, excluding one-digit values.
const q6=[];
for(let n=10;n<500;n++){
  const digits=String(n).split('').map(Number);
  if(digits.every((digit,index)=>index===0||digits[index-1]>digit)) q6.push(n);
}
assert.equal(q6.length,55);
assert.equal(q6.filter(n=>n<100).length,45);
assert.equal(q6.filter(n=>n>=100).length,10);
assert.equal(answers.get(6),`${q6.length}개`);

// Q7: independently compute v2(101*...*500), then distinguish complete divisions from first failure.
function v2(n){
  let count=0;
  while(n%2===0){n/=2;count++;}
  return count;
}
let twos=0;
for(let n=101;n<=500;n++) twos+=v2(n);
assert.equal(twos,397);
const q7LayerRows=[];
for(let power=2;power<=500;power*=2){
  const through500=Math.floor(500/power);
  const through100=Math.floor(100/power);
  q7LayerRows.push([
    String(power),
    String(through500),
    String(through100),
    String(through500-through100)
  ]);
}
assert.deepEqual(
  JSON.parse(JSON.stringify(byNo.get(7).steps[0].table.rows)),
  q7LayerRows,
  'Q7 printed layer table matches floor(500/power)-floor(100/power)'
);
assert.equal(q7LayerRows.reduce((sum,row)=>sum+Number(row[3]),0),twos);
const completeDivisions=Math.floor(twos/2);
const firstRemainder=completeDivisions+1;
assert.equal(completeDivisions,198);
assert.equal(answers.get(7),`${firstRemainder}번째`);

// Q8: one weighing yields a distinct shortfall for each possible fake bundle.
const q8Outcomes=[1,2,3,4,5,6].map(bundle=>210-bundle);
assert.equal(new Set(q8Outcomes).size,6);
assert.equal(answers.get(8),'1번');
assert.match(byNo.get(8).check,/209g, 208g, 207g, 206g, 205g, 204g/);

// Q10: relative drift is 3 minutes/hour; verify both displayed clocks and rewind.
const elapsedHours=60/(1+2);
assert.equal(elapsedHours,20);
const observedActualMinutes=6*60+40;
assert.equal(observedActualMinutes+elapsedHours,7*60,'blue clock reads 7:00');
assert.equal(observedActualMinutes-2*elapsedHours,6*60,'red clock reads 6:00');
const dayMinutes=24*60;
const initialMinutes=(observedActualMinutes-elapsedHours*60+dayMinutes)%dayMinutes;
assert.equal(initialMinutes,10*60+40);
assert.equal(answers.get(10),'오전 10시 40분');

// Q11: all unordered pairs, divided into perfect-match rounds of 12 pairs.
const handshakes=24*23/2;
const batches=handshakes/12;
const elapsedSeconds=batches*30;
assert.equal(handshakes,276);
assert.equal(batches,23);
assert.equal(elapsedSeconds,11*60+30);
assert.equal(answers.get(11),'9시 11분 30초');

// Q15: generate the tuple recurrence instead of using the closed form in the explanation.
const tuples=[[1,2,1]];
for(let n=2;n<=20;n++){
  const previous=tuples.at(-1);
  tuples.push([n,previous[1]+n,previous[1]]);
}
assert.deepEqual(tuples.at(-1),[20,211,191]);
assert.equal(tuples.at(-1).reduce((sum,n)=>sum+n,0),422);
assert.equal(answers.get(15),'422');
const q15TableRows=tuples.slice(0,6).map((tuple,index)=>[
  `${index+1}번째`,...tuple.map(String)
]);
q15TableRows.push(['20번째',...tuples.at(-1).map(String)]);
assert.deepEqual(
  JSON.parse(JSON.stringify(byNo.get(15).steps.at(-1).table.rows)),
  q15TableRows,
  'Q15 printed tuple table matches the independent recurrence'
);

// Q25: source pattern decomposes into a 2n+1 top band and an (n+1)^2 lower triangle.
const jewel=n=>(2*n+1)+(n+1)**2;
assert.deepEqual([1,2,3].map(jewel),[7,14,23]);
assert.equal(jewel(7),79);
assert.equal(answers.get(25),`${jewel(7)}개`);

// Q26: enumerate the entire allowed current-uncle-age range.
const q26=[];
for(let uncleNow=21;uncleNow<80;uncleNow++){
  if((uncleNow-1)%5===0&&(uncleNow+2)%8===0){
    const yujunNow=(uncleNow-1)/5+1;
    const yubinNow=(uncleNow+2)/8-2;
    q26.push({uncleNow,yujunNow,yubinNow,sum:yujunNow+yubinNow});
  }
}
assert.deepEqual(q26,[{uncleNow:46,yujunNow:10,yubinNow:4,sum:14}]);
assert.equal(answers.get(26),`${q26[0].sum}살`);
assert.deepEqual(
  JSON.parse(JSON.stringify(byNo.get(26).steps[2].table.rows)),
  [
    ['1년 전','45','9','2'],
    ['현재','46','10','4'],
    ['2년 후','48','12','6']
  ],
  'Q26 printed age table keeps all three time points aligned'
);

// Q18: enumerate the open integer range for the computer-pass count.
const q18Values=[];
for(let computerPass=229;computerPass<=300;computerPass++) q18Values.push(780-computerPass);
assert.equal(Math.min(...q18Values),480);
assert.equal(Math.max(...q18Values),551);
assert.equal(answers.get(18),'480, 551');
assert.deepEqual(
  JSON.parse(JSON.stringify(byNo.get(18).steps.at(-1).table.rows)),
  [
    ['최솟값','300명','780−300','480명'],
    ['최댓값','229명','780−229','551명']
  ]
);

// Q19: recompute all three tournament/league formats.
const formatOne=(120-32)+32*31/2;
const formatTwo=(5*4/2)*24+(24-1);
const formatThree=120*119/2;
assert.deepEqual([formatOne,formatTwo,formatThree],[584,263,7140]);
assert.equal(Math.max(formatOne,formatTwo,formatThree)-Math.min(formatOne,formatTwo,formatThree),6877);
assert.equal(answers.get(19),'6877');

// Q20: exhaust every ordered pair in the two stated ranges.
const q20Pairs=[];
for(let a=1;a<=10;a++){
  for(let b=11;b<=30;b++) if((a*b)%10===3) q20Pairs.push([a,b]);
}
assert.deepEqual(q20Pairs,[[1,13],[1,23],[3,11],[3,21],[7,19],[7,29],[9,17],[9,27]]);
assert.equal(answers.get(20),`${q20Pairs.length}가지`);

// Q21: the travel-time difference determines the common distance.
const q21Distance=2/(1/36-1/54);
assert.equal(q21Distance,216);
assert.equal(q21Distance/36,6);
assert.equal(q21Distance/54,4);
assert.equal(q21Distance/5,43.2);
assert.equal(answers.get(21),'43.2km/h');

// Q22: enumerate positive counts of all three coin types.
const q22Solutions=[];
for(let z=1;16*z<74;z++){
  for(let y=1;4*y+16*z<74;y++){
    const x=74-4*y-16*z;
    if(x>=1) q22Solutions.push({x,y,z});
  }
}
assert.equal(q22Solutions.length,32);
assert.deepEqual([1,2,3,4].map(z=>q22Solutions.filter(solution=>solution.z===z).length),[14,10,6,2]);
assert.equal(answers.get(22),'32');

// Q23: verify the two-helper schedule and an algebraic one-helper lower bound.
const capacities=[];
let explorer=4,helperOne=4,helperTwo=4;
capacities.push([explorer,helperOne,helperTwo]);
explorer--; helperOne--; helperTwo--;
explorer++; helperOne-=2; helperTwo++;
capacities.push([explorer,helperOne,helperTwo]);
assert.deepEqual([explorer,helperOne,helperTwo],[4,1,4]);
helperOne-=1;
explorer--; helperTwo--;
explorer++; helperTwo--;
capacities.push([explorer,helperOne,helperTwo]);
assert.deepEqual([explorer,helperOne,helperTwo],[4,0,2]);
helperTwo-=2;
explorer-=4;
assert.deepEqual([explorer,helperOne,helperTwo],[0,0,0]);
assert.ok(capacities.flat().every(food=>food>=0&&food<=4),'no traveler carries over four days of supply');
const earliestTurnForExplorerCapacity=6-4;
const latestTurnForTotalSupply=(8-6)/2;
assert.equal(earliestTurnForExplorerCapacity,2);
assert.equal(latestTurnForTotalSupply,1);
assert.ok(earliestTurnForExplorerCapacity>latestTurnForTotalSupply,'one helper cannot satisfy both remaining trip and return requirements');
assert.equal(answers.get(23),'2명');

// Q24: enumerate every nondecreasing multiset of teen ages whose product is fixed.
const q24Target=10584000;
const q24AgeSets=[];
function enumerateTeenAges(start,remaining,ages){
  if(remaining===1){q24AgeSets.push(ages.slice());return;}
  for(let age=start;age<=19;age++){
    if(remaining%age===0) enumerateTeenAges(age,remaining/age,ages.concat(age));
  }
}
enumerateTeenAges(10,q24Target,[]);
assert.deepEqual(q24AgeSets,[[14,14,15,15,15,16]]);
assert.equal(q24AgeSets[0].length,6);
assert.equal(q24AgeSets[0].reduce((sum,age)=>sum+age,0),89);
assert.equal(answers.get(24),'6명, 89');

// Q27: exhaust every distinct news state through seven calls, then verify an eight-call construction.
const q27Calls=[];
for(let first=0;first<6;first++) for(let second=first+1;second<6;second++) q27Calls.push([first,second]);
const q27Full=(1<<6)-1;
let q27Frontier=[[1,2,4,8,16,32]];
const q27Seen=new Set([q27Frontier[0].join(',')]);
const q27FrontierCounts=[];
for(let depth=0;depth<=7;depth++){
  q27FrontierCounts.push(q27Frontier.length);
  assert.ok(q27Frontier.every(state=>state.some(knowledge=>knowledge!==q27Full)),`no solution exists after ${depth} calls`);
  if(depth===7) break;
  const next=[];
  for(const state of q27Frontier){
    for(const [first,second] of q27Calls){
      const union=state[first]|state[second];
      if(union===state[first]&&union===state[second]) continue;
      const changed=state.slice();
      changed[first]=union; changed[second]=union;
      const key=changed.join(',');
      if(!q27Seen.has(key)){q27Seen.add(key);next.push(changed);}
    }
  }
  q27Frontier=next;
}
assert.deepEqual(q27FrontierCounts,[1,15,165,1475,10605,59145,229816,477990]);
const q27Schedule=[[0,1],[0,2],[0,3],[4,5],[0,4],[0,1],[0,2],[3,5]];
const q27State=[1,2,4,8,16,32];
for(const [first,second] of q27Schedule){
  const union=q27State[first]|q27State[second];
  q27State[first]=union; q27State[second]=union;
}
assert.deepEqual(q27State,Array(6).fill(q27Full));
assert.equal(answers.get(27),'8번');

// Q28: recompute the road total, odd vertices, minimum pairing, and displayed closed walk.
const q28Model=sandbox.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS.model.q28;
const q28=sandbox.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS.calculate(28);
assert.equal(q28.baseLength,201);
assert.deepEqual(JSON.parse(JSON.stringify(q28.oddVertices)),['A','C','E','G','H','I']);
const q28Ids=q28Model.nodes.map(node=>node.id);
const q28Distances=Object.fromEntries(q28Ids.map(from=>[from,Object.fromEntries(q28Ids.map(to=>[to,from===to?0:Infinity]))]));
const q28Edges=new Map();
for(const edge of q28Model.edges){
  q28Distances[edge.from][edge.to]=Math.min(q28Distances[edge.from][edge.to],edge.weight);
  q28Distances[edge.to][edge.from]=Math.min(q28Distances[edge.to][edge.from],edge.weight);
  q28Edges.set([edge.from,edge.to].sort().join('-'),edge);
}
for(const middle of q28Ids) for(const from of q28Ids) for(const to of q28Ids){
  q28Distances[from][to]=Math.min(q28Distances[from][to],q28Distances[from][middle]+q28Distances[middle][to]);
}
function minimumOddPairing(vertices){
  if(vertices.length===0) return 0;
  const first=vertices[0];
  let best=Infinity;
  for(let index=1;index<vertices.length;index++){
    const rest=vertices.slice(1,index).concat(vertices.slice(index+1));
    best=Math.min(best,q28Distances[first][vertices[index]]+minimumOddPairing(rest));
  }
  return best;
}
assert.equal(minimumOddPairing(q28.oddVertices.slice()),15);
const q28UseCounts=Object.fromEntries(q28Model.edges.map(edge=>[edge.id,0]));
let q28RouteLength=0;
for(let index=0;index<q28Model.route.length-1;index++){
  const edge=q28Edges.get([q28Model.route[index],q28Model.route[index+1]].sort().join('-'));
  assert.ok(edge,'every displayed route segment is a given road');
  q28UseCounts[edge.id]++;
  q28RouteLength+=edge.weight;
}
assert.equal(q28RouteLength,216);
for(const edge of q28Model.edges){
  assert.equal(q28UseCounts[edge.id],q28Model.duplicateEdgeIds.includes(edge.id)?2:1,`${edge.id} use count`);
}
assert.equal(answers.get(28),'216');

// Q29: perform all one hundred players' state changes from initially closed doors.
const q29Doors=Array(101).fill(false);
for(let player=1;player<=100;player++){
  for(let door=player;door<=100;door+=player) q29Doors[door]=!q29Doors[door];
}
const q29Open=[];
for(let door=1;door<=100;door++) if(q29Doors[door]) q29Open.push(door);
assert.deepEqual(q29Open,[1,4,9,16,25,36,49,64,81,100]);
assert.equal(answers.get(29),`${q29Open.length}개`);

// Q30: enumerate every consecutive-positive-integer representation of 90.
const q30Representations=[];
for(let start=1;start<=90;start++){
  let sum=0;
  for(let end=start;end<=90&&sum<90;end++){
    sum+=end;
    if(sum===90) q30Representations.push({start,end,count:end-start+1});
  }
}
const q30MaxCount=Math.max(...q30Representations.map(entry=>entry.count));
assert.equal(q30MaxCount,12);
assert.deepEqual(q30Representations.filter(entry=>entry.count===q30MaxCount),[{start:2,end:13,count:12}]);
assert.ok(13*14/2>90,'thirteen positive consecutive integers are impossible');
assert.equal(answers.get(30),'2');

// Q12 is a drawing answer and is verified by the independent projection validator.
assert.equal(answers.get(12),'(그림 답안)');
assert.equal(byNo.get(12).diagram,'top-projection');

assert.deepEqual([...answers.keys()].filter(no=>no!==12),[1,3,4,6,7,8,10,11,15,18,19,20,21,22,23,24,25,26,27,28,29,30]);
console.log('PASS Final2 public math checks for 22 non-drawing answers; Q12 is delegated to the source-topology projection validator');
