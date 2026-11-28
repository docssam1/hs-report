'use strict';
// 4-1-1 큰수 단원테스트 12문항의 유사문제(초등 문제은행 4학년 생성기) 검사.
// 생성기가 알려 주는 정답을 믿지 않고, 화면에 보이는 문제 글(과 수직선 눈금)만 읽어 정답을 다시 계산해 비교한다.
const assert=require('node:assert/strict'),path=require('node:path');
const ROOT=path.join(__dirname,'..');
global.window={};
require(path.join(ROOT,'elementary4/source-inventory-4-1.js'));require(path.join(ROOT,'elementary4/generators.js'));
const API=window.HSE_GENERATORS,ITEMS=window.HSE_SOURCE_INVENTORY_41.items;
const data=require(path.join(ROOT,'upgrade-bank/data/upgrade41.json'));
const sources=data.sources.filter(s=>s.engine==='elem4'&&s.sheet==='4-1-1 큰수 단원테스트 12문항');
assert.equal(sources.length,12);assert.deepEqual(sources.map(s=>s.no),[1,2,3,4,5,6,7,8,9,10,11,12]);
const text=h=>h.replace(/<span hidden[^>]*><\/span>/g,'').replace(/<span class="math-digit-slot[^>]*><\/span>/g,'□').replace(/<\/(div|li|br)>|<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const int=s=>BigInt(String(s).replace(/,/g,''));
const BIG={'경':10n**16n,'조':10n**12n,'억':10n**8n,'만':10n**4n};
function amount(s){let total=0n,rest=s.replace(/[,\s]/g,'');for(const u of ['경','조','억','만']){const m=new RegExp('^(\\d+)'+u).exec(rest);if(m){total+=BigInt(m[1])*BIG[u];rest=rest.slice(m[0].length);}}if(rest){assert.match(rest,/^\d+$/,'수 읽기 '+s);total+=BigInt(rest);}return total;}
function placeExp(name){const small={'':0,'십':1,'백':2,'천':3},big={'만':4,'억':8,'조':12,'경':16};if(name==='일')return 0;const last=name.slice(-1);if(big[last]!==undefined){const head=name.slice(0,-1);assert.ok(small[head]!==undefined,name);return big[last]+small[head];}assert.ok(small[name]!==undefined,name);return small[name];}
const digitAt=(n,e)=>Number((n/10n**BigInt(e))%10n);
const solvers={
 1(h){const nums=[];const re=/(첫째|둘째) 수 ([\s\S]*?)을 (?:1\/)?([\d,]+)(배|분의 1로|로)/g;/* 2026-11-29: 초등 문제은행은 'n분의 1로'를 분수 표기 '1/n로'로 쓴다(화면에서는 math-notation.js가 분수로 그림). 둘 다 읽는다. */let m;while((m=re.exec(h))){const parts=m[2].split(/<span class="marked-digit">/);assert.equal(parts.length,2);const mm=/<u>(\d)<\/u><small>[㉠㉡]<\/small><\/span>([\d,]*)$/.exec(parts[1]);const after=mm[2].replace(/,/g,'').length;nums.push({v:BigInt(mm[1])*10n**BigInt(after),k:int(m[3]),up:m[4]==='배'});}
   assert.equal(nums.length,2);const a=nums[0].up?nums[0].v*nums[0].k:nums[0].v/nums[0].k,b=nums[1].up?nums[1].v*nums[1].k:nums[1].v/nums[1].k;assert.equal(a%b,0n);return a/b;},
 2(h){const t=text(h);let n=0n,c=0;for(const m of t.matchAll(/([\d,]+)이 ([\d,]+)개/g)){n+=int(m[1])*int(m[2]);c++;}assert.ok(c>=3);n*=int(/인 수를 ([\d,]+)배/.exec(t)[1]);assert.ok(n<10n**16n,'4학년 범위(천조 자리까지)를 넘음 '+n);const m=/이 수의 (\S+?)의 자리 숫자와 (\S+?)의 자리 숫자의 합/.exec(t);return BigInt(digitAt(n,placeExp(m[1]))+digitAt(n,placeExp(m[2])));},
 3(h){const rows=[...text(h).matchAll(/([\d,□]+) ([<>]) ([\d,□]+)/g)];assert.equal(rows.length,2);let sum=0n,found=0;for(let d=0;d<10;d++){if(rows.every(r=>{const a=int(r[1].replace('□',d)),b=int(r[3].replace('□',d));return r[2]==='<'?a<b:a>b;})){sum+=BigInt(d);found++;}}assert.ok(found>0);return sum;},
 4(h){const rows=[...h.matchAll(/<li><b>([㉠-㉣])<\/b>([\s\S]*?)<\/li>/g)].map(m=>{const p=text(m[2]).trim();return{k:m[1],lo:int(p.replace(/□/g,'0')),hi:int(p.replace(/□/g,'9'))};});assert.equal(rows.length,4);rows.sort((a,b)=>a.lo>b.lo?-1:1);for(let i=0;i<3;i++)assert.ok(rows[i].lo>rows[i+1].hi,'순서가 하나로 정해지지 않음');return rows.map(r=>r.k).join(', ');},
 5(h){return line(h);},6(h){return line(h);},
 7(h){const t=text(h),m=/어떤 수에서 (.+?)씩 (\d+)번 크게 뛰어 세어야 하는데, 잘못하여 (.+?)씩 (\d+)번 크게 뛰어 세었더니 (.+?)(?:이|가) 되었습니다/.exec(t);const start=amount(m[5])-amount(m[3])*BigInt(m[4]);assert.ok(start>0n);return {value:start+amount(m[1])*BigInt(m[2])};},
 8(h){const m=/([\d,]+)원짜리 지폐 ([\d,]+)장을 쌓은 두께는 ([\d,]+) ?cm입니다.*?지폐만으로 (.+?) 원을 쌓는다면/.exec(text(h));return km(amount(m[4]),int(m[1]),int(m[2]),int(m[3]));},
 9(h){const m=/1에서 ([\d,]+)까지[\s\S]*?숫자 (\d)(?:은|는) 숫자 (\d)보다 몇 번 더/.exec(text(h));const n=Number(int(m[1]));let a=0,b=0;for(let x=1;x<=n;x++)for(const c of String(x)){if(c===m[2])a++;if(c===m[3])b++;}assert.ok(a>b);return BigInt(a-b);},
 10(h){const m=/([\d,]+)원짜리 동전 ([\d,]+)개를 쌓은 높이는 ([\d,]+) ?cm입니다\. (.+?) 원을 모두/.exec(text(h));return km(amount(m[4]),int(m[1]),int(m[2]),int(m[3]));},
 11(h){const t=text(h),m=/(\S+?)의 자리 숫자 가와 (\S+?)의 자리 숫자 나를 서로 바꾸었더니 처음 수보다 ([\d,]+)만큼 (작아|커)졌습니다.*?합은 (\d+)입니다/.exec(t);const cells=[...h.matchAll(/<span class="is-(symbol|digit)">([^<]+)<\/span>/g)].map(x=>x[2]);assert.deepEqual(cells.slice(0,2),['가','나']);const tail=cells.slice(2).join(''),L=cells.length;assert.equal(placeExp(m[1]),L-1);assert.equal(placeExp(m[2]),L-2);const found=[];for(let g=1;g<10;g++)for(let n=0;n<10;n++){if(g+n!==+m[5])continue;const a=BigInt(''+g+n+tail),b=BigInt(''+n+g+tail),diff=m[4]==='작아'?a-b:b-a;if(diff===int(m[3]))found.push(a);}assert.equal(found.length,1);return found[0];},
 12(h){const m=/모두 다른 (\d+)자리 자연수에서 (.+?) 숫자의 합이 (\d+)입니다.*?가장 큰 수/.exec(text(h));const L=+m[1],pos=m[2].split(', ').map(s=>L-1-placeExp(s.replace(/의 자리.*$/,'')));const target=+m[3];const used=Array(10).fill(false),out=[];const dfs=(i,sum)=>{if(i===L)return sum===target;for(let d=9;d>=(i===0?1:0);d--){if(used[d])continue;const s=sum+(pos.includes(i)?d:0);if(s>target)continue;used[d]=true;out[i]=d;if(dfs(i+1,s))return true;used[d]=false;}return false;};assert.ok(dfs(0,0));return BigInt(out.join(''));}
};
function km(won,unit,group,cm){assert.equal(won%unit,0n);const count=won/unit;assert.equal(count%group,0n);const total=count/group*cm;assert.equal(total%100000n,0n,'km로 나누어 떨어지지 않음');return total/100000n;}
function line(h){const marks=[...h.matchAll(/data-marker-index="(\d+)"[^>]*>[\s\S]*?<text[^>]*>([^<]*)<\/text>/g)].map(m=>({i:BigInt(m[1]),t:m[2]}));const known=marks.filter(m=>/\d/.test(m.t)),unknown=marks.filter(m=>!/\d/.test(m.t));assert.equal(known.length,2);assert.ok(unknown.length>=1);
  // 그림의 점 위치가 눈금 번호 간격과 같은지 확인
  const xs=[...h.matchAll(/data-marker-index="(\d+)"[^>]*><circle cx="([\d.]+)"/g)].map(m=>[+m[1],+m[2]]);const unit=(xs[1][1]-xs[0][1])/(xs[1][0]-xs[0][0]);for(const [i,x] of xs)assert.ok(Math.abs(x-xs[0][1]-(i-xs[0][0])*unit)<0.05,'눈금 위치');
  const a=amount(known[0].t),b=amount(known[1].t),gap=known[1].i-known[0].i;assert.equal((b-a)%gap,0n);const step=(b-a)/gap;return{values:unknown.map(u=>({label:u.t,value:a+(u.i-known[0].i)*step}))};}
function same(no,expected,answer,prompt){
  if(no===4)return assert.equal(answer.replace(/\s/g,''),expected.replace(/\s/g,''),prompt);
  if(no===5){const got=[...answer.matchAll(/\((가|나)\) ([^()]+?)(?=, \(|$)/g)].map(m=>['('+m[1]+')',amount(m[2])]);return assert.deepEqual(got,expected.values.map(v=>[v.label,v.value]),prompt);}
  if(no===6)return assert.equal(amount(answer),expected.values[0].value,prompt);
  if(no===7)return assert.equal(amount(answer),expected.value,prompt);
  assert.equal(int(answer),expected,prompt);
}
const OFFSET={lower:-1,same:0,higher:1};const stats={};let total=0;const SEEDS=Number(process.env.SEEDS||300);const failures=[];
for(const s of sources){const item=ITEMS.find(x=>x.sourceItemId===s.item);assert.ok(item,s.item);assert.equal(item.typeLabel,s.name,'유형 이름이 시험지와 같아야 함');assert.ok(!item.reviewLocked);
  for(const [lv,off] of Object.entries(OFFSET)){const seen=new Set();for(let k=0;k<SEEDS;k++){let r;try{r=API.generate(item,2,off,(k*2654435761+s.no*97)>>>0,item.variant);assert.ok(r&&r.prompt&&r.answer&&r.solution);assert.ok(!/undefined|NaN|Infinity|\[object/.test(r.prompt+r.answer+r.solution));same(s.no,solvers[s.no](r.prompt),r.answer,text(r.prompt));}catch(e){failures.push({q:s.no,lv,k,msg:String(e.message).slice(0,300),prompt:r&&text(r.prompt).slice(0,300),answer:r&&r.answer});if(failures.length>12)break;continue;}seen.add(r.prompt);total++;}stats[s.no+'-'+lv]=seen.size;}}
if(failures.length){console.log(JSON.stringify(failures,null,1));process.exit(1);}
console.log(JSON.stringify({pass:true,checked:total,distinct:stats}));
