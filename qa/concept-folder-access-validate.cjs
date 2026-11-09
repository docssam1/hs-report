'use strict';
// Execute production helpers/renderers with synthetic students only. No network or persistence.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const admin=fs.readFileSync(path.join(root,'admin.html'),'utf8');
function fn(source,name){const start=source.indexOf('  function '+name+'(');assert.ok(start>=0,name);const next=source.indexOf('\n  function ',start+1);return source.slice(start,next<0?undefined:next).split('\n  /*')[0];}
const basic={title:'THINKING BASIC',folder:'개념 교재',accessKey:'concept-basic'},core={title:'Thinking Core',folder:'개념 교재',accessKey:'concept-core'},mock={title:'mock',folder:'개념 교재',accessKey:'mock-final-5'};
const D={students:['승인','미승인','복귀'],archiveAccess:{'개념 교재':['승인']},archiveProductAccess:{'concept-basic':['*'],'concept-core':['*'],'mock-final-5':['승인']},books:[basic,core,mock],studentAccessProfiles:{'복귀':{folders:[],products:['concept-basic','concept-core']}}};
const c=vm.createContext({D,S:D,currentStudent:'승인',isDemo:false});c.window=c;
vm.runInContext(fs.readFileSync(path.join(root,'student-access-policy.js'),'utf8'),c);
for(const n of ['canSeeFolder','canSeeProduct','canSeeBook','canSeeTB'])vm.runInContext(fn(index,n),c);
const before=JSON.stringify(D);let checks=0;
function verify(student,want){c.currentStudent=student;for(const b of [basic,core]){assert.equal(c.canSeeBook(b),want);assert.equal(c.canSeeTB(b),want);assert.equal(c.GFIELD_STUDENT_ACCESS.textbook(D,student,b,true),want);checks+=3;}}
verify('승인',true);verify('미승인',false);verify('복귀',false);
D.archiveAccess['개념 교재']=['*'];verify('미승인',true);verify('복귀',false);
D.studentAccessProfiles['복귀'].folders=['개념 교재'];verify('복귀',true);
D.studentAccessProfiles['복귀'].folders=[];verify('복귀',false);
D.archiveAccess['개념 교재']=[];verify('승인',false);c.currentStudent='승인';assert.equal(c.canSeeBook(mock),true);checks++;
D.archiveAccess['개념 교재']=['승인'];assert.equal(JSON.stringify(D),before,'checks preserve permission data');
c.esc=x=>String(x);c.accessOn=()=>false;c.scopedStudent=()=>false;c.isSignatureAccessKey=()=>false;
for(const n of ['productArr','bookApprovalHtml','bookAccessKey'])vm.runInContext(fn(admin,n),c);
for(const b of [basic,core]){const html=c.bookApprovalHtml(0,b);assert.match(html,/따로 승인할 필요가 없습니다/);assert.doesNotMatch(html,/checkbox|bookToggleStudent|bookToggleOpen|학생 모두 선택/);checks+=2;}
assert.match(c.bookApprovalHtml(2,mock),/checkbox/);assert.equal(c.bookAccessKey(0),false);assert.equal(c.bookAccessKey(1),false);assert.equal(c.bookAccessKey(2),'mock-final-5');checks+=4;
assert.equal(JSON.stringify(D),before,'rendering does not mutate any student or approval list');
// All inline scripts remain parseable after the template change.
for(const file of [index,admin])for(const match of file.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
console.log(JSON.stringify({pass:true,checks,conceptFolderOnly:true,legacyProductWildcardIgnored:true,returnedStudentScoped:true,mockApprovalsUnchanged:true,adminDuplicateControlsRemoved:true,productionWrites:0}));
