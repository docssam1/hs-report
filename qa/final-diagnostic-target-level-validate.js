'use strict';

const assert=require('node:assert/strict');
const diagnostic=require('../final-diagnostic-comment.js');

// A fixed teaching scenario: three 2.7-point recovery questions move the
// student's review target from 32.9 to 41.0. The percentile lookup and cutoff
// label are supplied independently so the report wording cannot silently drift.
const items=[
  {no:1,pts:16.4,area:'수와 연산',subarea:'규칙',type:'규칙 찾기'},
  {no:2,pts:16.5,area:'수와 연산',subarea:'규칙',type:'규칙 찾기'},
  {no:3,pts:2.7,area:'수와 연산',subarea:'규칙',type:'규칙 찾기'},
  {no:4,pts:2.7,area:'수와 연산',subarea:'규칙',type:'규칙 찾기'},
  {no:5,pts:2.7,area:'수와 연산',subarea:'규칙',type:'규칙 찾기'},
  {no:6,pts:59,area:'도형',subarea:'공간',type:'공간 추론'}
];
const cuts=[
  ['경시 가능',48.5],
  ['경시컷 · 심화안정권',39.4],
  ['심화컷 · 실력안정권',28.6],
  ['실력컷 · 일품안정권',19.9],
  ['일품컷',12.8],
  ['노력요함',0]
];
const ctx={
  name:'학생',roundNum:1,items,oxArr:['O','O','X','X','X','X'],score:32.9,
  ratesVerified:true,
  S:{cuts,rate:{3:.9,4:.85,5:.8,6:.2}}
};
const html=diagnostic.render(ctx,{
  points:no=>items.find(item=>item.no===no).pts,
  taxonomy:(_round,item)=>({area:item.area,subarea:item.subarea,detailType:item.type,reviewRequired:false}),
  verifyPopulation:()=>true,
  percentile:score=>score===32.9?38.7:(score===41?19.4:null),
  books:()=>[]
});
const text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

assert.match(text,/3번 · 4번 · 5번 을 모두 맞히고 다른 답안이 그대로라면 32\.9 \+ 8\.1 = 41점 입니다/);
assert.match(text,/현재 위치는 38\.7%에서 19\.4%로 달라집니다/);
assert.match(text,/복습 목표 기준은 19\.4% · 심화 가능 입니다/);
assert.match(text,/다음 시험 결과를 미리 말해 주는 수치는 아닙니다/);
console.log('PASS diagnostic target score, percentile and study-level label');
