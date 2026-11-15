'use strict';
// 타이머 안내가 가리키는 녹음 파일이 실제로 있고 MP3인지, 설정과 파일 이름이 맞는지 확인한다.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function mp3(name,max=200000){
  const f=path.join(root,'voice',name+'.mp3');assert.ok(fs.existsSync(f),name+'.mp3 is missing');
  const b=fs.readFileSync(f);assert.ok(b.length>5000&&b.length<max,name+'.mp3 size');
  const head=b.slice(0,3).toString('latin1'),sync=b[0]===0xff&&(b[1]&0xe0)===0xe0;
  assert.ok(head==='ID3'||sync,name+'.mp3 is not an MP3');
}
// 최종 모의고사: 녹음을 쓰고, 안내마다 파일 이름을 가진다
const ctx=vm.createContext({window:{},console});ctx.window=ctx;
vm.runInContext(fs.readFileSync(path.join(root,'mock-data-last.js'),'utf8'),ctx,{filename:'mock-data-last.js'});
const M=ctx.GFIELD_MOCK_LAST||ctx.GFIELD_MOCK||Object.values(ctx).find(v=>v&&v.exam&&v.exam.cues);
assert.ok(M&&M.exam,'last-set exam config');
assert.equal(M.exam.useRecordedCues,true);
assert.equal(M.exam.cues.length,5);
const times=[0,300,2100,4500,5400];
M.exam.cues.forEach((c,i)=>{assert.equal(c.at,times[i]);assert.equal(c.voice,'last-cue-'+i);mp3(c.voice);assert.ok(c.msg.length>5);});
// 80분 타이머
const html=fs.readFileSync(path.join(root,'exam-timer-voice.html'),'utf8');
for(const name of ['t80-cue-5','t80-cue-7']){assert.ok(html.includes('voice: "'+name+'"'),name+' wired');mp3(name);}
assert.ok(!/audio:\s*false/.test(html.split('const TOTAL')[0]),'no cue falls back to device speech');
// 기존 90분 타이머 녹음은 그대로
for(let i=0;i<8;i++)mp3('cue-'+i,1e6);
// final.html은 문자열 key를 파일 이름으로, 숫자는 기존 cue-N으로 재생한다
const fin=fs.readFileSync(path.join(root,'final.html'),'utf8');
assert.ok(fin.includes("typeof key==='string'?key:'cue-'+key"));assert.ok(fin.includes('say(c.msg,c.voice!=null?c.voice:i)'));
console.log(JSON.stringify({pass:true,lastCues:5,t80Cues:2,legacyCues:8,files:7}));
