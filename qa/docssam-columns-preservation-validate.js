'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const sourceRef='27848e08b21e9ef702e04c6b1f9467b3875aca3b';
const clone=value=>JSON.parse(JSON.stringify(value));
function readData(source){const ctx={window:{}};vm.runInNewContext(source,ctx,{timeout:2000});return clone(ctx.window.GFIELD_DATA);}
const current=readData(fs.readFileSync(path.join(root,'data.js'),'utf8'));
const original=readData(cp.execFileSync('git',['show',sourceRef+':data.js'],{cwd:root,encoding:'utf8'})).vip.columns;
const ctx={window:{GFIELD_DATA:clone(current)},TextDecoder,Uint8Array,atob};
vm.runInNewContext(fs.readFileSync(path.join(root,'docssam-columns.js'),'utf8'),ctx,{timeout:2000});
const guard=ctx.window.GFIELD_DOCSSAM_COLUMNS;
let checks=0;
function test(name,fn){fn();checks++;}
function outsideColumns(data){const d=clone(data);if(d.vip)delete d.vip.columns;return d;}
const sample={meta:{label:'QA'},students:['합성학생'],attendance:{'합성학생':['QA']},archiveProductAccess:{'mock-signature-1':['합성학생']},reports:{'합성학생':[{score:27.9}]},vip:{magazine:[{title:'현재뉴스'}],columns:clone(original)}};
test('original count and source',()=>{assert.equal(guard.originalCount,5);assert.equal(guard.sourceCommit,sourceRef);assert.equal(original.length,5);});
test('live data has usable columns',()=>{guard.assertPreserved(current);});
test('module preserves original HTML and order exactly',()=>{
  const value={vip:{columns:[]}};guard.ensure(value);assert.deepEqual(clone(value.vip.columns),original);
  assert.equal(value.vip.columns[0].title,value.vip.columns[2].title);assert.notEqual(value.vip.columns[0].html,value.vip.columns[2].html);
});
for(const value of [[],null,{},undefined])test('empty or malformed columns recover without touching other data',()=>{
  const data=clone(sample);data.vip.columns=value;const before=outsideColumns(data);guard.ensure(data);
  assert.deepEqual(outsideColumns(data),before);assert.deepEqual(clone(data.vip.columns),original);
});
test('valid columns remain untouched',()=>{
  const data=clone(sample);data.vip.columns=[{title:'새로운 글',html:'<p>현재 원문</p>'}];const before=clone(data);guard.ensure(data);assert.deepEqual(data,before);
});
test('recovery source cannot be mutated through restored data',()=>{
  const first={vip:{columns:[]}};guard.ensure(first);first.vip.columns[0].html='변경';const second={vip:{columns:[]}};guard.ensure(second);assert.deepEqual(clone(second.vip.columns),original);
});
test('latest remote columns win for non-column edits',()=>{
  const local=clone(sample),latest=clone(sample);local.meta.label='로컬변경';latest.vip.columns.unshift({title:'다른 창의 새 글',html:'<p>원격 원문</p>'});
  const before=outsideColumns(local);guard.reconcileForSave(local,latest,clone(original));assert.deepEqual(outsideColumns(local),before);assert.deepEqual(clone(local.vip.columns),latest.vip.columns);
});
test('explicit local edits survive when remote columns are unchanged',()=>{
  const local=clone(sample),latest=clone(sample);local.vip.columns[0].html+='<p>수정 내용</p>';latest.vip.magazine=[];const expected=clone(local);
  guard.reconcileForSave(local,latest,clone(original));assert.deepEqual(clone(local),expected);
});
test('simultaneous column edits abort without mutation',()=>{
  const local=clone(sample),latest=clone(sample);local.vip.columns[0].html='로컬 수정';latest.vip.columns[0].html='원격 수정';const before=clone(local);
  assert.throws(()=>guard.reconcileForSave(local,latest,clone(original)),/다른 창/);assert.deepEqual(local,before);
});
test('empty local save aborts without mutation',()=>{
  const local=clone(sample);local.vip.columns=[];const before=clone(local);
  assert.throws(()=>guard.reconcileForSave(local,clone(sample),clone(original)),/비어/);assert.deepEqual(local,before);
});
test('blank drafts cannot replace all published articles',()=>{
  const local=clone(sample);local.vip.columns=[{title:'',html:''}];assert.throws(()=>guard.reconcileForSave(local,clone(sample),clone(original)),/비어/);
});
test('remote news overwrite cannot erase backup columns',()=>{
  const local=clone(sample),latest=clone(sample);latest.vip.columns=[];latest.vip.magazine=[{title:'새 뉴스'}];const before=outsideColumns(local);
  guard.reconcileForSave(local,latest,clone(original));assert.deepEqual(outsideColumns(local),before);assert.deepEqual(clone(local.vip.columns),original);
});
test('successful save baseline can be refreshed',()=>{
  const local=clone(sample),latest=clone(sample);latest.vip.columns.unshift({title:'추가',html:'<p>추가 본문</p>'});
  guard.reconcileForSave(local,latest,clone(original));const baseline=clone(local.vip.columns);local.vip.columns[0].html='두 번째 편집';const expected=clone(local);
  guard.reconcileForSave(local,latest,baseline);assert.deepEqual(clone(local),expected);
});
function fileOf(data){return{encoding:'base64',content:Buffer.from('/* header */\nwindow.GFIELD_DATA = '+JSON.stringify(data)+';\n','utf8').toString('base64'),sha:'synthetic'};}
test('UTF8 remote JSON is parsed without evaluation',()=>{assert.deepEqual(clone(guard.parseGitHubFile(fileOf(sample))),sample);});
for(const file of [{},{encoding:'base64',content:Buffer.from('window.GFIELD_DATA = {}; alert("never run");').toString('base64')},{encoding:'base64',content:Buffer.from('window.GFIELD_DATA = {oops};').toString('base64')}])test('malformed remote file is rejected',()=>{assert.throws(()=>guard.parseGitHubFile(file));});
test('scripts precede both existing data consumers',()=>{
  for(const name of ['admin.html','index.html']){
    const source=fs.readFileSync(path.join(root,name),'utf8'),at=source.indexOf('src="docssam-columns.js');
    assert.ok(at>source.indexOf('src="data.js'));assert.ok(at<source.indexOf(name==='admin.html'?'let S =':'const D ='));
    for(const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(match[1].trim())new vm.Script(match[1]);}
  }
});
if(process.env.GFIELD_DATA_BASE_REF)test('only vip.columns changed from release base',()=>{
  const base=readData(cp.execFileSync('git',['show',process.env.GFIELD_DATA_BASE_REF+':data.js'],{cwd:root,encoding:'utf8'}));
  assert.deepEqual(outsideColumns(current),outsideColumns(base));assert.deepEqual(current.vip.columns,original);
});
console.log(JSON.stringify({pass:true,checks,originals:original.length,currentColumns:current.vip.columns.length,productionWrites:0}));
