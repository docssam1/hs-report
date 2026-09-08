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

// Q12 is a drawing answer and is verified by the independent projection validator.
assert.equal(answers.get(12),'(그림 답안)');
assert.equal(byNo.get(12).diagram,'top-projection');

console.log('PASS Final2 independent answer checks for 11 scalar items; Q12 is delegated to the source-topology projection validator');
