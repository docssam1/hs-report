'use strict';
// 생성기가 만든 문제를 파일로 내보낸다. 파이썬 교차 검사(qa/upgrade41-crosscheck.py)의 입력이다.
const path=require('node:path');const G=require(path.join(__dirname,'..','upgrade-bank','generators.js'));const N=Number(process.argv[2]||40);const out=[];let seed=900;
for(const src of G.sources)for(const lv of G.levels){
  const set=G.generateSet([{source:src,level:lv,count:N}],seed++);
  for(const it of set)out.push({source:src,level:lv,text:it.text,answer:it.answer});
}
require('fs').writeFileSync(process.argv[3],JSON.stringify(out));console.log('내보낸 문제',out.length);
