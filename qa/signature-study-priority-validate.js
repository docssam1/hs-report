'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['mock-data-original.js','signature-study-priority.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const model=sandbox.window.GFIELD_MOCK_ORIGINAL;
const priority=sandbox.window.GFIELD_SIGNATURE_STUDY_PRIORITY;
const pairs=[[5,4],[10,20],[13,22],[18,19],[19,9],[25,23],[26,26],[27,28],[29,24],[30,30]];
function ox(correct){return Array.from({length:30},(_,i)=>correct.includes(i+1)?'O':'X');}
function pick(round,correct,firstCorrect,states){
  const current=ox(correct),first=ox(firstCorrect||[]);
  return priority.select({round,wrongItems:model.rounds[String(round)].items.filter(item=>current[item.no-1]==='X'),
    answerStates:states||null,attempts:[{n:1,oxArr:first}],priorItems:model.rounds['1'].items,pairs});
}
const byeon=pick(2,[1,2,4,6,7,8,13,14,23,25,29],[5,7,8,9,10,11,12,14,16,17,20,23,26]);
assert.deepEqual(Array.from(byeon,row=>row.no),[3,5,12]);
assert.ok(byeon.every(row=>row.point===2.7&&row.reason==='미정답(오답·미응답 미구분)'));
assert.ok(byeon.every(row=>row.type===model.rounds['2'].items[row.no-1].type));
assert.deepEqual(Array.from(pick(2,[4],[]),row=>row.no),[2,3,5]);
const repeated=pick(2,Array.from({length:30},(_,i)=>i+1).filter(no=>no!==4&&no!==20),[]);
assert.deepEqual(Array.from(repeated,row=>row.no),[4]);
assert.equal(repeated[0].repeated,true);
const later=pick(2,Array.from({length:30},(_,i)=>i+1).filter(no=>no!==18&&no!==20),[]);
assert.deepEqual(Array.from(later,row=>row.no),[20,18]);
const highOnly=pick(2,Array.from({length:22},(_,i)=>i+1),[]);
assert.deepEqual(Array.from(highOnly,row=>row.no),[]);
const lowButHard=pick(2,Array.from({length:30},(_,i)=>i+1).filter(no=>no!==11&&no!==15),[]);
assert.deepEqual(Array.from(lowButHard,row=>row.no),[]);
const states=ox([1,2,4,6,7,8,13,14,23,25,29]);states[2]='-';
assert.equal(pick(2,[1,2,4,6,7,8,13,14,23,25,29],[],states)[0].reason,'미응답');
console.log('PASS Signature-only study priority: Byeon 3·5·12, foundation before 20·18, no 4.2 or D4/5, unknown response remains unknown');
