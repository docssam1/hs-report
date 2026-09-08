'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const base='e089b7701e64a686ca09b5a7d2d02c08faf42dd4';
const old=file=>execFileSync('git',['show',base+':'+file],{cwd:root,maxBuffer:32*1024*1024});
const protectedFiles=['mock-data-final.js','final1-detailed-data.js','data.js','final-population.js','final-report-state.js','admin-mock-v2.js',...Array.from({length:6},(_,i)=>'materials/final_2/'+String(i+1).padStart(3,'0')+'.jpg')];
for(const file of protectedFiles){
  const now=fs.readFileSync(path.join(root,file));
  const was=old(file);
  if(file.endsWith('.jpg'))assert.ok(now.equals(was),'Source image preserved: '+file);
  else assert.equal(now.toString('utf8').replace(/\r\n/g,'\n'),was.toString('utf8').replace(/\r\n/g,'\n'),'Protected source preserved: '+file);
}
function load(source){const box={window:{}};vm.createContext(box);vm.runInContext(source,box);return JSON.parse(JSON.stringify(box.window.GFIELD_FINAL2_DETAILED));}
const before=load(old('final2-detailed-data.js').toString('utf8'));
const after=load(fs.readFileSync(path.join(root,'final2-detailed-data.js'),'utf8'));
for(const item of before.items){
  const current=after.items.find(x=>x.no===item.no);
  assert.ok(current,'Existing verified detail remains: '+item.no);
  for(const key of ['no','title','answer','sourceLocator','read','method','steps','check','caution','comment','diagram']){
    assert.deepEqual(current[key],item[key],'Existing verified detail unchanged: '+item.no+' '+key);
  }
}
assert.equal(new Set(after.items.map(x=>x.no)).size,after.items.length,'No duplicate solutions');
assert.ok(after.items.every(x=>x.no>=1&&x.no<=30),'No cross-round item');
console.log('PASS unchanged original pages, canonical answers/statistics/student data, Final1 and prior 12 Final2 explanations');
