// 황소 4-2 3단원 소수의 덧셈과 뺄셈(개념탐구 1~4) 잠금 원문 유형. ITEMS의 키는 앱 유형 id, sourceItemId는 원장 id입니다.
// 변형 0은 원문 수치를 보존하고, 변형 1·2는 같은 구조에서 수만 바꾼 고정 검증 풀(fixed-verified-pool)입니다.
(function(root){'use strict';
const GROUP='4-2-u3';
const ff=(n,d)=>`<span class="math-fraction" role="img" aria-label="${d}분의 ${n}"><span>${n}</span><span>${d}</span></span>`; // 분수
const mx=(w,n,d)=>`<span class="math-mixed-number" role="img" aria-label="${w}과 ${d}분의 ${n}"><span>${w}</span>${ff(n,d)}</span>`; // 대분수
const wrap=(id,i,body)=>`<div class="source6-original" data-source-item-id="${id}" data-pool-index="${i}">${body}</div>`;
const ol=steps=>'<ol>'+steps.map(s=>`<li>${s}</li>`).join('')+'</ol>';
// 천분의 1 단위 정수 n을 소수 문자열로(끝의 0은 지움)
const fd=n=>{const ip=Math.floor(n/1000),fp=n%1000;const f=String(fp).padStart(3,'0').replace(/0+$/,'');return ip+(f?'.'+f:'');};
const f3=n=>`${Math.floor(n/1000)}.${String(n%1000).padStart(3,'0')}`; // 소수 세 자리 그대로
const hm=m=>{const h=Math.floor(m/60),r=m%60;return r?(h?`${h}시간 ${r}분`:`${r}분`):`${h}시간`;};
const bat=s=>{const d=String(s).slice(-1);return '013678'.includes(d);}; // 숫자를 읽을 때 받침 여부
const eun=s=>bat(s)?'은':'는', wa=s=>bat(s)?'과':'와', yeot=s=>bat(s)?'이었':'였', ga=s=>bat(s)?'이':'가', eul=s=>bat(s)?'을':'를';
const C=s=>`<p style="text-align:center">${s}</p>`;
const card=s=>`<span style="display:inline-block;min-width:1.1em;text-align:center;border:1.4px solid #222;border-radius:3px;padding:1px 7px;margin:0 3px">${s}</span>`;
const SVGS='width:100%;height:auto;display:block;margin:6px auto;font-family:inherit';

// 예제 1-1: 복명수를 소수로
function e11(p){const a1=p.kg*1000+p.g,a2=p.km*1000+p.m,a3=p.h*1000+p.mi*1000/60,q=p.mi/15;
 return {prompt:`<p>다음 □ 안에 알맞은 수를 써넣으세요.</p><p>(1) ${p.kg} kg ${p.g} g = □ kg<br>(2) ${p.km} km ${p.m} m = □ km<br>(3) ${p.h}시간 ${p.mi}분 = □시간</p>`,
 answer:`(1) ${fd(a1)} (2) ${fd(a2)} (3) ${fd(a3)}`,
 solution:ol([`(1) 1 g = 0.001 kg이므로 ${p.g} g = ${fd(p.g)} kg입니다. 따라서 ${p.kg} kg ${p.g} g = ${p.kg} + ${fd(p.g)} = ${fd(a1)} (kg)입니다.`,
  `(2) 1 m = 0.001 km이므로 ${p.m} m = ${fd(p.m)} km입니다. 따라서 ${p.km} km ${p.m} m = ${p.km} + ${fd(p.m)} = ${fd(a2)} (km)입니다.`,
  `(3) 1시간 = 60분을 똑같이 4로 나눈 하나는 15분이고, 1을 똑같이 4로 나눈 하나는 0.25이므로 15분 = 0.25시간입니다.`,
  (q>1?`${p.mi}분은 15분을 ${q}번 더한 시간이므로 ${fd(q*250)}시간이고, `:'')+`${p.h}시간 ${p.mi}분 = ${p.h} + ${fd(q*250)} = ${fd(a3)} (시간)입니다.`])};}

// 예제 1-2: 두 소수 사이를 등분한 눈금
function e12(p){const s=(p.b-p.a)/p.n,A=fd(p.a),B=fd(p.b);
 return {prompt:`<p>두 수 ${A}${wa(A)} ${B}${eul(B)} 수직선에 나타내고, 두 수 사이를 ${p.n}등분하였습니다. 두 수 사이에서 가장 작은 소수와 가장 큰 소수를 구하세요.</p><p>※ 조건 보충: ${p.n}등분한 눈금이 나타내는 소수 중에서 찾습니다. ${A}${wa(A)} ${B}${eun(B)} 넣지 않습니다.</p>`,
 answer:`${fd(p.a+s)}, ${fd(p.b-s)}`,
 solution:ol([`두 수의 차는 ${B} − ${A} = ${fd(p.b-p.a)}이고, 이것은 0.001이 ${p.b-p.a}개인 수입니다.`,
  `${p.n}등분하면 한 칸의 크기는 0.001이 ${p.b-p.a}÷${p.n}=${s}개인 수, 곧 ${fd(s)}입니다.`,
  `가장 작은 소수는 ${A}보다 한 칸 큰 ${A} + ${fd(s)} = ${fd(p.a+s)}입니다.`,
  `가장 큰 소수는 ${B}보다 한 칸 작은 ${B} − ${fd(s)} = ${fd(p.b-s)}입니다.`])};}

// 예제 1-3: 수직선 위에서 굴린 정사각형
function svg13(p){const W=540,H=114,x0=24,y=82,pp=490/p.total,side=p.sideT*pp;let t='';
 t+=`<line x1="${x0-6}" y1="${y}" x2="${(x0+p.total*pp+10).toFixed(1)}" y2="${y}" style="stroke:#222;stroke-width:1.4px"/>`;
 for(let k=0;k<=p.total;k++){const x=(x0+k*pp).toFixed(1);t+=`<line x1="${x}" y1="${y-4}" x2="${x}" y2="${y+4}" style="stroke:#222;stroke-width:1.2px"/>`;
  if(k%5===0)t+=`<text x="${x}" y="${y+22}" text-anchor="middle" style="font-size:13px;fill:#222">${fd(k*p.u)}</text>`;}
 t+=`<rect x="${x0}" y="${(y-side).toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" style="fill:none;stroke:#222;stroke-width:1.4px"/>`;
 t+=`<circle cx="${(x0+side).toFixed(1)}" cy="${(y-side).toFixed(1)}" r="3" style="fill:#222"/>`;
 t+=`<text x="${(x0+side+2).toFixed(1)}" y="${(y-side-8).toFixed(1)}" text-anchor="middle" style="font-size:14px;fill:#222">㉠</text>`;
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="수직선 위에 놓인 정사각형과 점 ㉠" style="${SVGS};max-width:520px">${t}</svg>`;}
function e13(p){const s=p.u*p.sideT;
 return {prompt:`<p>수직선 위에 정사각형을 올려놓고, 수직선을 따라 시계 방향으로 굴려서 움직였습니다. 정사각형을 두 바퀴 반 굴렸을 때, 점 ㉠이 놓이는 곳의 수는 무엇인가요?</p>${svg13(p)}`,
 answer:fd(10*s),
 solution:ol([`작은 눈금 5칸이 ${fd(5*p.u)}이므로 작은 눈금 한 칸은 ${fd(p.u)}입니다. 정사각형의 한 변은 작은 눈금 ${p.sideT}칸이므로 ${fd(s)}입니다.`,
  `정사각형은 한 번(${ff(1,4)}바퀴) 구를 때마다 한 변의 길이 ${fd(s)}만큼 오른쪽으로 갑니다. 한 바퀴는 4번 구르는 것이므로 두 바퀴 반은 10번 구르는 것입니다.`,
  `첫 번째로 구르면 점 ㉠은 수직선에 닿아 ${fd(s)} + ${fd(s)} = ${fd(2*s)}에 놓이고, 두 번째로 구를 때는 이 점을 중심으로 돌기 때문에 그대로 ${fd(2*s)}에 있습니다.`,
  `남은 8번은 두 바퀴입니다. 한 바퀴(4번)를 더 구를 때마다 점 ㉠은 다시 수직선 위에 놓이며, ${fd(s)}의 4배인 ${fd(4*s)}만큼 오른쪽으로 옮겨 갑니다.`,
  `따라서 점 ㉠이 놓이는 곳은 ${fd(2*s)} + ${fd(4*s)} + ${fd(4*s)} = ${fd(10*s)}입니다.`])};}

// 예제 1-4: 일정하게 타는 양초
function e14(p){const b=p.L-p.R;let u=p.t,w=b;const st=[`${p.t}분 동안 탄 길이는 ${fd(p.L)} − ${fd(p.R)} = ${fd(b)} (cm)입니다.`];
 if(p.L%b!==0){u=p.t/2;w=b/2;st.push(`${p.t}분 동안 ${fd(b)} cm가 타므로 그 절반인 ${u}분 동안에는 ${fd(w)} cm씩 탑니다.`);}
 const k=p.L/w,T=u*k;
 st.push(`${fd(w)}${eul(fd(w))} ${k}번 더하면 ${fd(p.L)}이므로, 양초가 모두 타는 데는 ${u}분씩 ${k}번인 ${T}분이 걸립니다.`);
 st.push(`${T}분 = ${hm(T)}입니다.`);
 return {prompt:`<p>길이가 ${fd(p.L)} cm인 양초에 불을 붙이고 ${p.t}분 뒤에 양초의 길이를 재었더니 ${fd(p.R)} cm가 되었습니다. 이 양초 하나가 모두 타는 데 몇 시간 몇 분이 걸릴까요?</p><p>※ 조건 보충: 양초는 처음부터 끝까지 같은 빠르기로 탑니다.</p>`,
 answer:hm(T),solution:ol(st)};}

// 개념탐구 2: 서로 다른 빠르기의 200 m 달리기
function x2(p){const k=2*p.a,y=4*p.b;
 return {prompt:`<p>경희는 100 m를 ${fd(p.a)}초에 달리고, 영진이는 50 m를 ${fd(p.b)}초에 달립니다. 두 사람이 각각 이와 같은 빠르기로 200 m 달리기 시합을 한다면, 경희는 영진이보다 몇 초 더 빨리 도착할까요?</p>`,
 answer:`${fd(y-k)}초`,
 solution:ol([`200 m는 100 m의 2배이므로 경희가 200 m를 달리는 데 걸리는 시간은 ${fd(p.a)} + ${fd(p.a)} = ${fd(k)} (초)입니다.`,
  `200 m는 50 m의 4배이므로 영진이가 200 m를 달리는 데 걸리는 시간은 ${fd(p.b)} + ${fd(p.b)} + ${fd(p.b)} + ${fd(p.b)} = ${fd(y)} (초)입니다.`,
  `따라서 경희는 영진이보다 ${fd(y)} − ${fd(k)} = ${fd(y-k)} (초) 더 빨리 도착합니다.`])};}

// 예제 2-1: 두 계산 결과 사이의 소수 한 자리 수
function e21(p){const A=p.a1-p.a2+p.a3,B=p.b1+p.b2-p.b3,list=[];
 for(let k=Math.floor(A/100)+1;k*100<B;k++)if(k%10)list.push(fd(k*100));
 return {prompt:`<p>㉠보다 크고 ㉡보다 작은 소수 한 자리 수는 모두 몇 개인가요?</p>${C(`㉠ = ${fd(p.a1)} − ${fd(p.a2)} + ${fd(p.a3)}&emsp;&emsp;㉡ = ${fd(p.b1)} + ${fd(p.b2)} − ${fd(p.b3)}`)}`,
 answer:`${list.length}개`,
 solution:ol([`㉠ = ${fd(p.a1)} − ${fd(p.a2)} + ${fd(p.a3)} = ${fd(p.a1-p.a2)} + ${fd(p.a3)} = ${fd(A)}입니다.`,
  `㉡ = ${fd(p.b1)} + ${fd(p.b2)} − ${fd(p.b3)} = ${fd(p.b1+p.b2)} − ${fd(p.b3)} = ${fd(B)}입니다.`,
  `${fd(A)}보다 크고 ${fd(B)}보다 작은 소수 한 자리 수는 ${list.join(', ')}입니다.`,
  `따라서 모두 ${list.length}개입니다.`])};}

// 예제 2-2: 가려진 계산식
function e22(p){const S=p.a+p.b,D=p.c-S;
 return {prompt:`<p>종이에 물감이 묻어 계산식의 일부가 보이지 않습니다. 보이지 않는 부분(■)에 들어갈 수 있는 가장 작은 소수 두 자리 수를 구하세요.</p>${C(`${fd(p.a)} + ${fd(p.b)} &gt; ${fd(p.c)} − ■`)}`,
 answer:fd(D+10),
 solution:ol([`왼쪽을 계산하면 ${fd(p.a)} + ${fd(p.b)} = ${fd(S)}이므로 ${fd(S)} &gt; ${fd(p.c)} − ■입니다.`,
  `${fd(p.c)} − ■ = ${fd(S)}${ga(fd(S))} 되는 ■는 ${fd(p.c)} − ${fd(S)} = ${fd(D)}입니다. ■가 ${fd(D)}보다 커야 ${fd(p.c)} − ■가 ${fd(S)}보다 작아집니다.`,
  `${fd(D)}보다 큰 소수 두 자리 수 중에서 가장 작은 수는 ${fd(D)} + 0.01 = ${fd(D+10)}입니다.`])};}

// 예제 2-3: 직선 위 네 사람
function e23(p){const d=p.ma-p.hm,ans=p.tm-d;
 return {prompt:`<p>민성, 태준, 민아, 혜주 네 명이 직선으로 된 길 위에 같은 방향을 보고 서 있습니다. 네 명 사이의 거리를 조사한 것이 다음과 같을 때, 태준이와 민아 사이의 거리는 몇 km인가요?</p><ul><li>태준이는 민성이보다 ${fd(p.tm)} km 앞에 있습니다.</li><li>민아는 혜주보다 ${p.ma} m 앞에 있습니다.</li><li>혜주는 민성이보다 ${fd(p.hm)} km 뒤에 있습니다.</li></ul>`,
 answer:`${fd(ans)} km`,
 solution:ol([`1 m = 0.001 km이므로 ${p.ma} m = ${fd(p.ma)} km입니다.`,
  `혜주는 민성이보다 ${fd(p.hm)} km 뒤에 있고, 민아는 혜주보다 ${fd(p.ma)} km 앞에 있으므로 민아는 민성이보다 ${fd(p.ma)} − ${fd(p.hm)} = ${fd(d)} (km) 앞에 있습니다.`,
  `태준이는 민성이보다 ${fd(p.tm)} km 앞에 있으므로 태준이와 민아 사이의 거리는 ${fd(p.tm)} − ${fd(d)} = ${fd(ans)} (km)입니다.`])};}

// 예제 2-4: 규칙에 따라 늘어놓은 소수 9개의 합
function e24(p){const f=p.f;
 return {prompt:`<p>다음과 같은 규칙에 따라 소수를 9개 늘어놓았습니다. 늘어놓은 소수 9개의 합을 구하세요.</p>${C(`${fd(f)}&emsp;${fd(2*f)}&emsp;${fd(3*f)}&emsp;${fd(4*f)}&emsp;…`)}`,
 answer:fd(45*f),
 solution:ol([`${fd(f)}부터 ${fd(f)}씩 커지는 규칙이므로 늘어놓은 수는 ${[1,2,3,4,5,6,7,8,9].map(k=>fd(k*f)).join(', ')}입니다.`,
  `첫째와 아홉째, 둘째와 여덟째, 셋째와 일곱째, 넷째와 여섯째 수를 짝 지으면 각 짝의 합은 모두 ${fd(10*f)}이고, 가운데 다섯째 수 ${fd(5*f)}${ga(fd(5*f))} 남습니다.`,
  `${fd(10*f)}${eul(fd(10*f))} 4번 더하면 ${fd(40*f)}이므로 9개의 합은 ${fd(40*f)} + ${fd(5*f)} = ${fd(45*f)}입니다.`])};}

// 개념탐구 3: 0부터 뛰어 센 수의 100번째 수
function x3(p){const d=p.d,t=fd(3*d);
 return {prompt:`<p>0부터 같은 수만큼씩 커지는 규칙으로 뛰어 세기를 하였습니다. 뛰어 센 수 중에서 이어지는 5개의 수를 골라 가장 작은 수와 둘째로 큰 수의 차를 구했더니 ${t}${yeot(t)}습니다. 0을 포함하여 작은 수부터 셀 때 100번째에 놓인 수를 구하세요.</p>`,
 answer:fd(99*d),
 solution:ol([`이어지는 5개의 수에서 가장 작은 수는 첫째 수, 둘째로 큰 수는 넷째 수이므로 두 수의 차는 3번 뛴 만큼입니다.`,
  `${t}${eun(t)} 0.001이 ${3*d}개인 수이고, ${3*d}÷3=${d}이므로 한 번에 뛰는 수는 ${fd(d)}입니다.`,
  `0이 1번째 수이므로 100번째 수는 0에서 99번 뛴 수, 곧 ${fd(d)}${eul(fd(d))} 99번 더한 수입니다.`,
  `${fd(d)}${eul(fd(d))} 100번 더하면 ${fd(d)}의 100배인 ${fd(100*d)}이므로, 99번 더한 수는 ${fd(100*d)} − ${fd(d)} = ${fd(99*d)}입니다.`])};}

// 예제 3-1: 두 사람씩 잰 몸무게의 합
function e31(p){const s1=p.j+p.s,s2=p.s+p.u,s3=p.u+p.j;
 return {prompt:`<p>지희, 정수, 승유의 몸무게를 재었더니 지희와 정수의 몸무게의 합은 ${fd(s1)} kg, 정수와 승유의 몸무게의 합은 ${fd(s2)} kg, 승유와 지희의 몸무게의 합은 ${fd(s3)} kg이었습니다. 가장 무거운 사람과 가장 가벼운 사람의 몸무게의 차는 몇 kg인지 구하세요.</p>`,
 answer:`${fd(s2-s3)} kg`,
 solution:ol([`(지희+정수)와 (정수+승유)에는 정수가 함께 들어 있으므로, 승유는 지희보다 ${fd(s2)} − ${fd(s1)} = ${fd(s2-s1)} (kg) 무겁습니다.`,
  `(정수+승유)와 (승유+지희)에는 승유가 함께 들어 있으므로, 정수는 지희보다 ${fd(s2)} − ${fd(s3)} = ${fd(s2-s3)} (kg) 무겁습니다.`,
  `(지희+정수)와 (승유+지희)에는 지희가 함께 들어 있으므로, 정수는 승유보다 ${fd(s1)} − ${fd(s3)} = ${fd(s1-s3)} (kg) 무겁습니다.`,
  `따라서 가장 무거운 사람은 정수, 가장 가벼운 사람은 지희이고 두 사람의 몸무게의 차는 ${fd(s2-s3)} kg입니다.`])};}

// 예제 3-2: 책상 위에 쌓은 책
function e32(p){const two=2*p.b,all=20*p.b;
 return {prompt:`<p>높이가 ${fd(p.h)} cm인 책상 위에 한 권의 두께가 ${fd(p.b)} cm인 책을 위로 20권 쌓았습니다. 바닥부터 가장 위에 놓인 책까지의 높이는 몇 cm인가요?</p>`,
 answer:`${fd(p.h+all)} cm`,
 solution:ol([`책 2권의 두께는 ${fd(p.b)} + ${fd(p.b)} = ${fd(two)} (cm)입니다.`,
  `20권은 2권의 10배이므로 책 20권의 두께는 ${fd(two)}의 10배인 ${fd(all)} cm입니다.`,
  `바닥부터 가장 위에 놓인 책까지의 높이는 ${fd(p.h)} + ${fd(all)} = ${fd(p.h+all)} (cm)입니다.`])};}

// 예제 3-3: 거리표
const LB=['㉮','㉯','㉰','㉱','㉲'];
function svg33(p){const cw=58,ch=30,x0=6,y0=6;let t='';
 const val={'1,0':fd(p.ab),'2,0':'★','2,1':fd(p.bc),'3,0':fd(p.ac),'4,2':fd(p.cm)};
 for(let r=0;r<5;r++)for(let c=0;c<=r;c++){const x=x0+c*cw,y=y0+r*ch,k=`${r},${c}`,lab=c===r,v=lab?LB[r]:(val[k]||'');
  t+=`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" style="fill:${(lab||v)?'#d9d6cf':'#fff'};stroke:#222;stroke-width:1.2px"/>`;
  if(v)t+=`<text x="${x+cw/2}" y="${y+20}" text-anchor="middle" style="font-size:14px;fill:#222">${v}</text>`;}
 t+=`<text x="${x0+5*cw}" y="${y0+5*ch+20}" text-anchor="end" style="font-size:13px;fill:#222">(단위: km)</text>`;
 return `<svg viewBox="0 0 ${x0*2+5*cw} ${y0+5*ch+28}" role="img" aria-label="다섯 지점 사이의 거리표" style="${SVGS};max-width:320px">${t}</svg>`;}
function e33(p){const ac2=p.ab+p.bc,cd=p.ac-ac2,de=p.cm-cd;
 return {prompt:`<p>다음은 한 직선 위에 있는 ㉮, ㉯, ㉰, ㉱, ㉲ 사이의 거리를 나타낸 표입니다. ㉱에서 ㉲까지의 거리는 몇 km인가요? (단, ★은 ㉮에서 ㉰까지의 거리로 ★ = ${fd(p.ab)} + ${fd(p.bc)}이고, ㉮에서 ㉱까지의 거리는 ${fd(p.ac)} km입니다.)</p>${svg33(p)}<p>※ 조건 보충: 다섯 지점은 직선 위에 ㉮, ㉯, ㉰, ㉱, ㉲의 순서로 놓여 있습니다.</p>`,
 answer:`${fd(de)} km`,
 solution:ol([`★ = ${fd(p.ab)} + ${fd(p.bc)} = ${fd(ac2)}이므로 ㉮에서 ㉰까지의 거리는 ${fd(ac2)} km입니다.`,
  `㉮에서 ㉱까지의 거리가 ${fd(p.ac)} km이므로 ㉰에서 ㉱까지의 거리는 ${fd(p.ac)} − ${fd(ac2)} = ${fd(cd)} (km)입니다.`,
  `표에서 ㉰에서 ㉲까지의 거리는 ${fd(p.cm)} km이므로 ㉱에서 ㉲까지의 거리는 ${fd(p.cm)} − ${fd(cd)} = ${fd(de)} (km)입니다.`])};}

// 예제 3-4: 세 막대의 합과 차
function e34(p){const big=(p.S+p.q)/2,sm=(p.S-p.q)/2,alt=sm+p.p,c=big+p.p;
 return {prompt:`<p>길이가 서로 다른 막대 ㉮, ㉯, ㉰가 있습니다. ㉮ 막대와 ㉯ 막대의 길이의 합은 ${fd(p.S)} m이고, ㉯ 막대와 ㉰ 막대의 길이의 차는 ${fd(p.p)} m이며, ㉯ 막대와 ㉮ 막대의 길이의 차는 ${fd(p.q)} m입니다. ㉰ 막대의 길이가 가장 길다고 할 때, ㉰ 막대와 가장 짧은 막대의 길이의 차를 구하세요.</p>`,
 answer:`${fd(c-sm)} m`,
 solution:ol([`㉮와 ㉯의 합이 ${fd(p.S)} m, 차가 ${fd(p.q)} m이므로 긴 쪽은 (${fd(p.S)} + ${fd(p.q)})의 반인 ${fd(big)} m, 짧은 쪽은 ${fd(p.S)} − ${fd(big)} = ${fd(sm)} (m)입니다.`,
  `㉰가 가장 길기 때문에 ㉰는 ㉯보다 ${fd(p.p)} m 깁니다.`,
  `㉯가 ${fd(sm)} m이면 ㉰는 ${fd(sm)} + ${fd(p.p)} = ${fd(alt)} (m)가 되어 ㉮(${fd(big)} m)보다 짧으므로 맞지 않습니다.`,
  `따라서 ㉯ = ${fd(big)} m, ㉮ = ${fd(sm)} m, ㉰ = ${fd(big)} + ${fd(p.p)} = ${fd(c)} (m)이고, 가장 짧은 막대는 ㉮입니다.`,
  `㉰와 ㉮의 길이의 차는 ${fd(c)} − ${fd(sm)} = ${fd(c-sm)} (m)입니다.`])};}

// 예제 4-1: □의 1/100과 1/1000의 차
function e41(p){const N=p.N,D=9*N;
 return {prompt:`<p>어떤 네 자리 자연수 □가 있습니다. □의 ${ff(1,100)}인 수와 □의 ${ff(1,1000)}인 수의 차가 ${fd(D)}일 때, □를 구하세요.</p>`,
 answer:String(N),
 solution:ol([`□의 ${ff(1,100)}인 수는 □의 ${ff(1,1000)}인 수의 10배입니다.`,
  `그러므로 두 수의 차는 □의 ${ff(1,1000)}인 수의 9배이고, ${fd(D)}${eun(fd(D))} □의 ${ff(1,1000)}인 수를 9번 더한 수입니다.`,
  `${fd(D)}${eun(fd(D))} 0.001이 ${D}개인 수이고, ${D}÷9=${N}이므로 □의 ${ff(1,1000)}인 수는 0.001이 ${N}개인 ${fd(N)}입니다.`,
  `따라서 □ = ${N}입니다.`])};}

// 예제 4-2: 1~6의 서로 다른 숫자로 만든 소수식
function e42(p){const T=p.T,X=Math.floor(T/100),Y=Math.floor(T/10)%10;
 return {prompt:`<p>㉠, ㉡, ㉢, ㉣, ㉤, ㉥은 1부터 6까지의 서로 다른 숫자입니다. 다음을 만족하는 ㉠.㉡㉢ 중에서 가장 큰 수를 구하세요.</p>${C(`${fd(T*10)} − ㉠.㉡㉢ = ㉣.㉤㉥`)}`,
 answer:p.ans,
 solution:ol([`식을 바꾸면 ㉠.㉡㉢ + ㉣.㉤㉥ = ${fd(T*10)}입니다.`,
  `소수 둘째 자리: 1부터 6까지의 서로 다른 두 숫자의 합은 3부터 11까지이므로, 일의 자리 숫자가 1이 되려면 ㉢ + ㉥ = 11입니다. ㉢, ㉥은 5와 6이고 소수 첫째 자리로 1을 받아올립니다.`,
  `소수 첫째 자리: 남은 숫자 1, 2, 3, 4 중 두 숫자의 합은 3부터 7까지이므로 ㉡ + ㉤ + 1 = ${Y}, 곧 ㉡ + ㉤ = ${Y-1}이고 받아올림이 없습니다. 일의 자리: ㉠ + ㉣ = ${X}입니다.`,
  p.split,
  `㉠.㉡㉢이 가장 크려면 ㉠, ㉡, ㉢이 각각 가장 커야 하므로 ${p.pick} 가장 큰 수는 ${p.ans}입니다.`])};}

// 예제 4-3: 수 카드로 만든 소수 세 자리 수의 넷째로 큰 수와 넷째로 작은 수
function e43(p){const all=new Set(),cs=p.cards;
 for(const a of cs)for(const b of cs)for(const c of cs)for(const d of cs){if(new Set([a,b,c,d]).size<4)continue;all.add(a*1000+b*100+c*10+d);}
 const arr=[...all].sort((x,y)=>x-y),ok=arr.filter(v=>v%10),big=ok.slice(-4).reverse(),small=ok.slice(0,4);
 const zb=arr.filter(v=>v%10===0&&v>big[3]),zs=arr.filter(v=>v%10===0&&v<small[3]);
 return {prompt:`<p>5장의 수 카드 중에서 4장을 뽑아 한 번씩 사용하여 소수 세 자리 수를 만들려고 합니다. 만들 수 있는 소수 세 자리 수 중에서 넷째로 큰 수와 넷째로 작은 수의 차를 구하세요.</p>${C(cs.map(card).join(''))}<p>※ 조건 보충: 소수 셋째 자리 숫자가 0인 수(예: ${f3(zb[0])})는 소수 두 자리 수와 같으므로 소수 세 자리 수로 보지 않습니다. 일의 자리 숫자가 0인 수(예: ${f3(small[0])})는 소수 세 자리 수로 봅니다.</p>`,
 answer:fd(big[3]-small[3]),
 solution:ol([`큰 수부터 차례로 쓰면 ${big.map(f3).join(', ')}입니다(${zb.map(f3).join(', ')}처럼 소수 셋째 자리 숫자가 0인 수는 빼고 셉니다). 넷째로 큰 수는 ${f3(big[3])}입니다.`,
  `작은 수부터 차례로 쓰면 ${small.map(f3).join(', ')}입니다${zs.length?`(${zs.map(f3).join(', ')}은 빼고 셉니다)`:''}. 넷째로 작은 수는 ${f3(small[3])}입니다.`,
  `두 수의 차는 ${f3(big[3])} − ${f3(small[3])} = ${fd(big[3]-small[3])}입니다.`])};}

// 예제 4-4: 카드 ㉠이 될 수 있는 숫자
function e44(p){const rows=[],ok=[];
 for(let g=1;g<=9;g++){if(p.d.includes(g))continue;const ds=[...p.d,g].sort((a,b)=>a-b);
  const sm=(ds[0]*1000+ds[1]*100+ds[2]*10+ds[3])*10,lg=ds[3]*1000+ds[2]*100+ds[1]*10+ds[0],df=sm-lg;
  rows.push(`㉠ = ${g}: ${fd(sm)} − ${fd(lg)} = ${fd(df)}`);if(df===p.T)ok.push(g);}
 const cand=[1,2,3,4,5,6,7,8,9].filter(g=>!p.d.includes(g));
 return {prompt:`<p>서로 다른 5장의 카드를 한 번씩 모두 사용하여 만들 수 있는 가장 작은 소수 두 자리 수와 가장 큰 소수 세 자리 수의 차가 ${fd(p.T)}일 때, ㉠이 될 수 있는 숫자를 모두 구하세요. (단, 숫자 카드 4장의 숫자는 1부터 9까지의 숫자입니다.)</p>${C([...p.d,'㉠','.'].map(card).join(' '))}`,
 answer:ok.join(', '),
 solution:ol([`카드는 서로 다르므로 ㉠은 ${p.d.join(', ')}${wa(p.d[2])} 다른 숫자 ${cand.join(', ')} 중 하나입니다.`,
  `가장 작은 소수 두 자리 수는 네 숫자를 작은 것부터 차례로 놓아 □□.□□로, 가장 큰 소수 세 자리 수는 큰 것부터 차례로 놓아 □.□□□로 만듭니다.`,
  `㉠에 따라 차를 구하면 ${rows.join(', ')}입니다.`,
  `차가 ${fd(p.T)}인 경우는 ㉠이 ${ok.join(', ')}일 때입니다.`])};}

const P=(f,list)=>list.map(f);
const ITEMS={
 '4-2-u3-t1-8':{sourceItemId:'4-2-decimal-1-example-1',key:'orig42U3E1Example1',resultContract:'multi-value',pool:P(e11,[
   {kg:5,g:640,km:4,m:78,h:4,mi:45},{kg:8,g:260,km:6,m:35,h:2,mi:15},{kg:2,g:790,km:9,m:47,h:5,mi:30}])},
 '4-2-u3-t1-9':{sourceItemId:'4-2-decimal-1-example-2',key:'orig42U3E1Example2',resultContract:'multi-value',
   answerAssumption:'두 수 사이를 등분한 눈금이 나타내는 소수(두 수 자신 제외) 중에서 찾는다.',pool:P(e12,[
   {a:32500,b:32700,n:100},{a:5300,b:5700,n:100},{a:7400,b:7900,n:100}])},
 '4-2-u3-t1-10':{sourceItemId:'4-2-decimal-1-example-3',key:'orig42U3E1Example3',resultContract:'single-value',pool:P(e13,[
   {u:30,sideT:4,total:49},{u:20,sideT:4,total:49},{u:50,sideT:3,total:39}])},
 '4-2-u3-t1-11':{sourceItemId:'4-2-decimal-1-example-4',key:'orig42U3E1Example4',resultContract:'single-value',
   answerAssumption:'양초는 처음부터 끝까지 같은 빠르기로 탄다.',pool:P(e14,[
   {L:24200,t:20,R:19800},{L:18600,t:15,R:15500},{L:30400,t:20,R:26600}])},
 '4-2-u3-t2-7':{sourceItemId:'4-2-decimal-2-exploration',key:'orig42U3E2Exploration',resultContract:'single-value',pool:P(x2,[
   {a:16080,b:8480},{a:15370,b:8120},{a:17250,b:9140}])},
 '4-2-u3-t2-8':{sourceItemId:'4-2-decimal-2-example-1',key:'orig42U3E2Example1',resultContract:'single-value',pool:P(e21,[
   {a1:7000,a2:5600,a3:1730,b1:1800,b2:4750,b3:2790},{a1:8000,a2:4700,a3:960,b1:2400,b2:3850,b3:1480},{a1:10000,a2:7200,a3:2350,b1:3600,b2:4920,b3:2640}])},
 '4-2-u3-t2-9':{sourceItemId:'4-2-decimal-2-example-2',key:'orig42U3E2Example2',resultContract:'single-value',pool:P(e22,[
   {a:9430,b:5190,c:17660},{a:8270,b:4560,c:15400},{a:6380,b:7850,c:19010}])},
 '4-2-u3-t2-10':{sourceItemId:'4-2-decimal-2-example-3',key:'orig42U3E2Example3',resultContract:'single-value',pool:P(e23,[
   {tm:523,ma:312,hm:270},{tm:648,ma:405,hm:360},{tm:735,ma:287,hm:190}])},
 '4-2-u3-t2-11':{sourceItemId:'4-2-decimal-2-example-4',key:'orig42U3E2Example4',resultContract:'single-value',pool:P(e24,[
   {f:1110},{f:120},{f:2030}])},
 '4-2-u3-t3-7':{sourceItemId:'4-2-decimal-3-exploration',key:'orig42U3E3Exploration',resultContract:'single-value',pool:P(x3,[
   {d:223},{d:142},{d:319}])},
 '4-2-u3-t3-8':{sourceItemId:'4-2-decimal-3-example-1',key:'orig42U3E3Example1',resultContract:'single-value',pool:P(e31,[
   {j:33500,s:40700,u:37900},{j:31600,s:38500,u:35200},{j:28400,s:35700,u:33900}])},
 '4-2-u3-t3-9':{sourceItemId:'4-2-decimal-3-example-2',key:'orig42U3E3Example2',resultContract:'single-value',pool:P(e32,[
   {h:78600,b:2680},{h:72500,b:3140},{h:80400,b:2450}])},
 '4-2-u3-t3-10':{sourceItemId:'4-2-decimal-3-example-3',key:'orig42U3E3Example3',resultContract:'single-value',
   answerAssumption:'다섯 지점은 직선 위에 ㉮, ㉯, ㉰, ㉱, ㉲의 순서로 놓여 있다.',pool:P(e33,[
   {ab:850,bc:740,ac:2030,cm:1070},{ab:920,bc:680,ac:2110,cm:1240},{ab:760,bc:890,ac:2240,cm:1350}])},
 '4-2-u3-t3-11':{sourceItemId:'4-2-decimal-3-example-4',key:'orig42U3E3Example4',resultContract:'single-value',pool:P(e34,[
   {S:1300,p:600,q:700},{S:1700,p:500,q:900},{S:2100,p:800,q:1100}])},
 '4-2-u3-t4-8':{sourceItemId:'4-2-decimal-4-example-1',key:'orig42U3E4Example1',resultContract:'single-value',pool:P(e41,[
   {N:5421},{N:3762},{N:7834}])},
 '4-2-u3-t4-9':{sourceItemId:'4-2-decimal-4-example-2',key:'orig42U3E4Example2',resultContract:'single-value',pool:P(e42,[
   {T:471,ans:'3.46',split:'남은 숫자 1, 2, 3, 4 중 합이 6인 두 숫자는 2와 4뿐이므로 ㉡, ㉤은 2와 4이고, ㉠, ㉣은 1과 3(합 4)입니다.',pick:'㉠ = 3, ㉡ = 4, ㉢ = 6일 때'},
   {T:561,ans:'4.36',split:'남은 숫자 1, 2, 3, 4 중 합이 5인 두 숫자는 1과 4, 2와 3입니다. ㉡, ㉤이 1과 4이면 ㉠, ㉣은 2와 3이고, ㉡, ㉤이 2와 3이면 ㉠, ㉣은 1과 4입니다(어느 쪽이든 ㉠ + ㉣ = 5).',pick:'㉠이 가장 큰 4가 되려면 ㉠, ㉣이 1과 4이고 ㉡, ㉤이 2와 3이어야 합니다. 따라서 ㉠ = 4, ㉡ = 3, ㉢ = 6일 때'},
   {T:741,ans:'4.26',split:'남은 숫자 1, 2, 3, 4 중 합이 3인 두 숫자는 1과 2뿐이므로 ㉡, ㉤은 1과 2이고, ㉠, ㉣은 3과 4(합 7)입니다.',pick:'㉠ = 4, ㉡ = 2, ㉢ = 6일 때'}])},
 '4-2-u3-t4-10':{sourceItemId:'4-2-decimal-4-example-3',key:'orig42U3E4Example3',resultContract:'single-value',
   answerAssumption:'소수 셋째 자리 숫자가 0인 수는 소수 세 자리 수로 보지 않고, 일의 자리 숫자가 0인 수는 소수 세 자리 수로 본다.',pool:P(e43,[
   {cards:[0,6,4,5,3]},{cards:[0,7,2,8,5]},{cards:[0,8,1,5,4]}])},
 '4-2-u3-t4-11':{sourceItemId:'4-2-decimal-4-example-4',key:'orig42U3E4Example4',resultContract:'multi-value',pool:P(e44,[
   {d:[8,2,5],T:17028},{d:[7,3,4],T:27027},{d:[7,2,6],T:18018}])},
};
function build(id,variant){const it=ITEMS[id],sid=it.sourceItemId,i=((variant|0)%it.pool.length+it.pool.length)%it.pool.length,p=it.pool[i];
 return {prompt:wrap(sid,i,p.prompt),answer:p.answer,solution:wrap(sid,i,p.solution),...(p.answerVisual?{answerVisual:p.answerVisual,answerKeyVisual:true}:{}),
  automaticGrading:false,resultContract:it.resultContract||'single-value',sourceItemId:sid,typeId:id,generator:it.key,generationMode:'fixed-verified-pool',
  verifiedPoolIndex:i,variant:i,verifiedVariantCount:it.pool.length,verifiedVariantTarget:3,sourceStructurePreserved:true,sourceExact:false,
  publisherAnswerVerified:false,officialAnswerVerified:false,answerVisualRequired:!!it.answerVisualRequired,...(it.answerAssumption?{answerAssumption:it.answerAssumption}:{})};}
function install(target){const api=target&&target.HSE_GENERATORS;if(!api||typeof api.generatorKey!=='function'||typeof api.generate!=='function')return false;
 const flag='__orig45_'+GROUP.replace(/-/g,'_');if(api[flag])return true;
 const pk=api.generatorKey.bind(api),pg=api.generate.bind(api),keys=new Set(Object.values(ITEMS).map(x=>x.key));
 const owns=t=>t&&(ITEMS[t.id]||keys.has(t.generatorKey));
 const ok=t=>{const it=t&&ITEMS[t.id];return !!it&&t.sourceItemId===it.sourceItemId&&t.generatorKey===it.key&&t.reviewLocked===false&&t.sourceVerified===true;};
 api.generatorKey=function(t){return owns(t)?(ok(t)?ITEMS[t.id].key:''):pk(t);};
 api.generate=function(t,rank,difficulty,seed,variant){return owns(t)?(ok(t)?build(t.id,variant===undefined?0:variant):null):pg(t,rank,difficulty,seed,variant);};
 if(Array.isArray(api.names))keys.forEach(k=>{if(!api.names.includes(k))api.names.push(k);});
 Object.defineProperty(api,flag,{value:true});return true;}
const exported=Object.freeze({GROUP,ITEMS,build,install});
root['HSE_ORIG45_'+GROUP.replace(/-/g,'_')]=exported;install(root);
})(typeof window!=='undefined'?window:globalThis);
