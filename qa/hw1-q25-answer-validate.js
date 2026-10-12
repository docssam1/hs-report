'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process'),root=path.resolve(__dirname,'..');
function read(source){const ctx={window:{}};vm.runInNewContext(source,ctx);return JSON.parse(JSON.stringify(ctx.window.GFIELD_MOCK_HW));}
const file='mock-data-hw.js',data=read(fs.readFileSync(path.join(root,file),'utf8')),item=data.rounds['1'].items.find(i=>i.no===25);
const expected=['60189','60289','60589','90186','90286','90586'];
assert.deepEqual(item.answer.split(',').map(s=>s.trim()),expected);
// The original seven-segment glyphs: rotation maps a<->d, b<->e, c<->f, g->g.
const segments={0:'abcdef',1:'bc',2:'abdeg',5:'acdfg',6:'acdefg',8:'abcdefg',9:'abcdfg'};
const turn={a:'d',b:'e',c:'f',d:'a',e:'b',f:'c',g:'g'},lookup=new Map(Object.entries(segments).map(([d,s])=>[[...s].sort().join(''),d]));
const rotateDigit=d=>lookup.get([...segments[d]].map(s=>turn[s]).sort().join(''));
// The source's centered 1 is unchanged by a half turn; standard right-side 1 is not.
const rotateNumber=s=>[...s].reverse().map(d=>d==='1'?'1':rotateDigit(d)).join('');
assert.equal(rotateDigit('2'),'2');assert.equal(rotateDigit('5'),'5');
const answers=[];
function scan(s){if(s.length===5){if(s[0]!=='0'&&Number(rotateNumber(s))-Number(s)===7920)answers.push(s);return;}for(const d of Object.keys(segments))if(!s.includes(d))scan(s+d);}
scan('');assert.deepEqual(answers.sort(),expected);
for(const s of expected){assert.equal(new Set(s).size,5);assert.equal(Number(rotateNumber(s))-Number(s),7920);}
assert.ok(!answers.includes('20185')&&!answers.includes('50182'));
assert.equal(new Set('20182').size,4);assert.equal(new Set('50185').size,4);
assert.match(item.comment,/2·5·8은 그대로/);assert.match(item.comment,/총 6개/);
const before=read(execFileSync('git',['show','3097cea:'+file],{cwd:root,encoding:'utf8'}));
const previous=before.rounds['1'].items.find(i=>i.no===25);previous.answer=item.answer;previous.comment=item.comment;
assert.deepEqual(data,before,'only the requested answer and explanation change');
for(const file of ['mock.html','mock-rx.js','admin.html','bank/catalog.html'])assert.match(fs.readFileSync(path.join(root,file),'utf8'),/mock-data-hw\.js\?v=20261012-hw1-q25/);
console.log('PASS HW1 Q25: six complete card-distinct answers, original half-turn glyphs, explanations/cache and other data preserved');
