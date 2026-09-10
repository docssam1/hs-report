'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const window={location:{search:'?set=last&round=2'}};window.window=window;
const context=vm.createContext({window,URLSearchParams});
for(const file of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last2-detailed-data.js','last-report-data.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const data=window.GFIELD_LAST2_DETAILED,model=window.GFIELD_MOCK_LAST,items=data.items,round=model.rounds['2'];
assert.equal(items.length,30);assert.equal(new Set(items.map(x=>x.no)).size,30);
items.forEach((item,index)=>{
  assert.equal(item.no,index+1);assert.equal(item.reviewStatus,'verified');
  for(const key of ['title','answer','read','method','check','caution'])assert.ok(String(item[key]||'').trim(),`${item.no} ${key}`);
  assert.ok(Array.isArray(item.steps)&&item.steps.length>=3,`${item.no} 단계별 풀이`);
  item.steps.forEach(s=>assert.ok(s.title&&s.body,`${item.no} 빈 단계`));
});
assert.deepEqual(round.items.map(x=>x.answer),items.map(x=>x.answer));
assert.equal(round.items.filter(x=>x.subarea).length,30);
assert.equal(round.items.filter(x=>x.taxonomyReviewStatus==='verified-source-bound').length,30);
assert.equal(round.items.filter(x=>x.detailedSolution).length,30);
assert.equal(round.items[11].subarea,'자리 수 범위가 없는 두 수의 곱의 최대·최소');
assert.equal(round.items[11].prescriptionOverride.label,'자리 수 범위가 없는 두 수의 곱의 최대·최소');

const ans=n=>items[n-1].answer;
assert.equal(2*5*8+2*4*8,144);assert.equal(ans(2),'144개');
assert.equal((31+30+31+30+21)%7,3);assert.equal(ans(3),'월요일');
assert.match(items[5].steps.map(x=>x.body).join(' '),/90\+18=108/);
assert.equal(2*15+1,31);assert.equal(ans(7),'31번째');
assert.equal(25*221/85,65);assert.equal(ans(8),'65분');
assert.equal(2023%14,7);assert.equal(ans(9),'시');
assert.equal(100*100*100,1000000);assert.equal(ans(11),'1,000,000');

function perms(values,length,prefix,out){
  if(prefix.length===length){out.push(prefix.slice());return;}
  values.forEach((v,i)=>perms(values.slice(0,i).concat(values.slice(i+1)),length,prefix.concat(v),out));
}
const four=[];perms([4,6,8,7,9],4,[],four);
const products=[];
for(const p of four)for(let split=1;split<4;split++)products.push(Number(p.slice(0,split).join(''))*Number(p.slice(split).join('')));
assert.equal(Math.max(...products),8352);assert.equal(Math.min(...products),2712);assert.equal(Math.max(...products)+Math.min(...products),11064);assert.equal(ans(12),'11,064');
assert.match(items[11].caution,/두 자리 수×두 자리 수/);
assert.equal(ans(13),'5시 10분, 6시 50분');assert.match(items[14].steps[2].body,/3\+4\+5−8=4/);
assert.equal(26-4+1,23);assert.equal(ans(16),'23개');assert.equal(17*17-14,275);assert.equal(ans(17),'275');
assert.equal(239-200,39);assert.equal(2*39-1,77);assert.equal(ans(18),'77');
assert.equal(63*64/2,2016);assert.equal(ans(19),'7번째 줄 58번째');
assert.match(items[19].steps.map(x=>x.body).join(' '),/①=33.*②=99\+106=205.*③=318\+21=339.*④=63/);
assert.equal(372-268,104);assert.equal(ans(20),'104L');
assert.equal(ans(21),'갑 36개 · 을 12개 · 병 24개');
let zeros=0;for(let n=1;n<=999;n++){const s=String(n).padStart(3,'0');if(s[2]!=='0')zeros+=(s[0]==='0')+(s[1]==='0');}
assert.equal(zeros,180);assert.equal(ans(22),'180번');
assert.equal(5*50,250);assert.equal(ans(23),'250문제');

let adjacent=0;
for(let len=2;len<=4;len++){
  const rows=[];perms([0,1,2,4,8,9],len,[],rows);
  adjacent+=rows.filter(p=>p[0]!==0&&(/48|84/.test(p.join('')))).length;
}
assert.equal(adjacent,76);assert.equal(ans(24),'76개');
assert.equal(100*101*201/6+100*101/2,343400);assert.equal(ans(25),'343,400');
const students=['OXXXOOOXXO','XXOXOXXOOO','OXOOXXOXOX','OXOXOXOOOO'];let keys=[];
for(let mask=0;mask<1024;mask++){
  const key=Array.from({length:10},(_,i)=>(mask>>i)&1?'O':'X').join('');
  const scores=students.map(row=>[...row].reduce((sum,c,i)=>sum+(c===key[i]),0));
  if(scores.slice(0,3).every(x=>x===7))keys.push({key,score:scores[3]});
}
assert.deepEqual(keys,[{key:'OXOXOXOXOO',score:9}]);assert.equal(ans(26),'9문제');
assert.equal(new Date(2017,0,1).getDay(),new Date(2023,0,1).getDay());assert.equal(ans(27),'2017년');
assert.equal(ans(28),'4명');assert.equal(20+9*8+2*5,102);assert.equal(ans(29),'102개');assert.match(items[28].caution,/영상.*100개.*합산 오류/);
assert.equal(600/20,30);assert.equal((400-(100/20)*30)/(100/20),50);assert.equal(100/(400/50),12.5);assert.equal(ans(30),'12.5초');
console.log('PASS Last2 30 detailed solutions, exact taxonomy, independent calculation locks and video-error note');
