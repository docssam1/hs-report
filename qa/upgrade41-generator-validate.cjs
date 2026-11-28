'use strict';
// 승급과정 4-1 유사문제 생성기 검사: ① 27개 조합마다 수백 문제를 만들어 검산 불일치·중복·표기 오류가 없는지,
// ② 같은 생성 번호가 같은 문제를 만드는지, ③ 이어 붙인 수·자리 조건 개수·수 카드·단위 개수·단위 환산은 문제 글에서 정답을 다시 계산한다.
const assert=require('node:assert/strict'),path=require('node:path');
const G=require(path.join(__dirname,'..','upgrade-bank','generators.js'));
const data=require(path.join(__dirname,'..','upgrade-bank','data','upgrade41.json'));
const ruleSources=data.sources.filter(s=>!s.engine);   // 문제은행 유형(engine)은 upgrade41-unit-test-validate.cjs가 검사한다
assert.equal(ruleSources.length,9);assert.deepEqual(G.sources.slice().sort(),ruleSources.map(s=>s.id).sort());assert.deepEqual(G.levels,['lower','same','higher']);
let total=0,mismatches=0,rechecked=0;
const UNIT={'1조':1e12,'1000억':1e11,'100억':1e10,'10억':1e9,'1억':1e8,'1000만':1e7,'100만':1e6,'10만':1e5,'1만':1e4,'1000':1000,'100':100,'10':10,'1':1};
const permsDesc=cards=>{const seen=new Set();const rec=(rest,cur)=>{if(!rest.length){if(cur[0]!==0)seen.add(cur.join(''));return;}rest.forEach((d,i)=>{if(rest.indexOf(d)!==i)return;rec(rest.filter((_,j)=>j!==i),cur.concat(d));});};rec(cards.slice().sort((a,b)=>a-b),[]);return [...seen].sort().reverse();};
for(const src of G.sources)for(const lv of G.levels){
  const R=G.makeRng(31+total),seen={};let n=0;
  for(let i=0;i<150;i++){
    let it;try{it=G.generateOne(src,lv,R,seen);}catch(e){assert.ok(e.exhausted,'생성 오류 '+src+' '+lv+': '+e.message);break;}
    n++;total++;mismatches+=it.mismatches;
    assert.ok(it.text.length>20&&it.answer&&it.steps.length>=3,src+lv);
    assert.ok(!/은\(는\)|과\(와\)|이\(가\)|undefined|NaN|Infinity/.test(it.text+it.steps.join(' ')),'표기 '+it.text);
    assert.ok(!it.text.includes('정답'));
    // 문제 글에서 정답을 다시 계산
    let t=it.text;
    if(src==='u1-3-q1'){const k=Number(/(\d+)자리 수를 만든/.exec(t)[1]);let s='';for(let x=1;s.length<k+10;x++)s+=x;assert.equal(s.slice(0,k).slice(-3),it.answer);rechecked++;}
    else if(src==='u1-3-q2'){const m=/^(\d+)보다 크고 (\d+)보다 작은/.exec(t),a=+m[1],b=+m[2];const gt=t.includes('일의 자리 수가 십의 자리 수보다 큰'),lt=t.includes('일의 자리 수가 십의 자리 수보다 작은');let c=0;for(let x=a+1;x<b;x++){const tt=Math.floor(x/10)%10,h=Math.floor(x/100)%10,o=x%10;if(tt===h&&(!gt&&!lt||gt&&o>tt||lt&&o<tt))c++;}assert.equal(String(c),it.answer);rechecked++;}
    else if(src==='u1-3-q3'){const k=+/(\d+)번째로 큰 수/.exec(t)[1],cards=t.split('\n').pop().trim().split(/\s+/).map(Number);assert.equal(permsDesc(cards.flatMap(d=>[d,d]))[k-1],it.answer);rechecked++;}
    else if(src==='u1-1-q1'){const m=/^(\d+)(?:은|는) (.+)인 수입니다\./.exec(t);let known=0,hid=0;m[2].split(', ').forEach(part=>{const mm=/^(\S+?)(?:이|가) (\(\s*\)|\d+)개$/.exec(part);const u=UNIT[mm[1]];if(mm[2].startsWith('('))hid=u;else known+=u*Number(mm[2]);});assert.equal(String((Number(m[1])-known)/hid),it.answer);rechecked++;}
    else if(src==='u1-1-q2'){const m=/약 (\d+)m를 갑니다\. (\d+)초 동안.*숫자 (\d)(?:이|가) 나타내는 값(을 모두 더하면|은)/.exec(t);const km=m[1]*m[2]/1000,s=String(km);let vals=[];for(let x=0;x<s.length;x++)if(s[x]===m[3])vals.push(Number(m[3])*Math.pow(10,s.length-1-x));const exp=m[4].includes('모두')?vals.reduce((x,y)=>x+y,0):vals[0];assert.equal(String(exp),it.answer);rechecked++;}
  }
  assert.ok(n>=60,`${src} ${lv}: 서로 다른 문제 ${n}개`);
}
assert.equal(mismatches,0,'검산이 어긋난 후보가 있었음(버려졌지만 생성기를 점검해야 함)');
// 같은 번호 → 같은 문제, 다른 번호 → 다른 문제
const rq=G.sources.flatMap(s=>G.levels.map(l=>({source:s,level:l,count:2})));
const a=G.generateSet(rq,123456).map(x=>x.text),b=G.generateSet(rq,123456).map(x=>x.text),c=G.generateSet(rq,654321).map(x=>x.text);
assert.deepEqual(a,b);assert.notDeepEqual(a,c);assert.equal(new Set(a).size,a.length,'한 번의 생성 안에서 같은 문제 없음');
// 범위가 좁은 조합은 부족분을 알려 준다
const small=G.generateSet([{source:'u1-3-q5',level:'lower',count:500}],1);assert.ok(small.short.length===1&&small.length<500);
console.log(JSON.stringify({pass:true,generated:total,recomputedFromText:rechecked,mismatchCandidates:mismatches,combos:27}));
