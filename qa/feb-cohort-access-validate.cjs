'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({console,URL,URLSearchParams,Date,location:{href:'https://example.test/',hostname:'example.test',search:''}});context.window=context;
function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});}
load('student-access-policy.js');load('final-last-routes.js');load('middle-access.js');
const api=context.GFIELD_STUDENT_ACCESS,routes=context.GFIELD_FINAL_LAST_ROUTES,middle=context.GFIELD_MIDDLE_ACCESS;
const scoped='신규A',onlineOld='온라인B',outsider='명단밖C',graduated='졸업D';
const book={title:'교재',url:'x.pdf',folder:'f',pages:1};
const data={students:[scoped,onlineOld,outsider,graduated],studentTypes:{[scoped]:'online',[onlineOld]:'online',[graduated]:'graduated'},
  attendance:{[onlineOld]:['sep-w1']},specialStudents:[],archiveAccess:{},archiveProductAccess:{},vipAccess:{},
  content:{'feb-w05':{textbooks:[book]}},books:[{folder:'중급 모의고사',title:'초등과정 선발 대비 모의고사 1회 중급'},{folder:'중급 모의고사',title:'중급 모의고사 6회'}]};
api.reset(data,scoped);                      // scoped profile with empty permissions
const model={rounds:{'1':{},'2':{},'6':{}}};
// 1) without the provider nothing changes
assert.equal(routes.accessAllowed(data,scoped,'final',1),false);assert.equal(middle.allowsRound(data,scoped,1,model),false);
assert.equal(routes.accessAllowed(data,outsider,'final',1),false);
// 2) provider loaded but draft => still nothing
const members=[scoped,onlineOld,graduated];
const R=context.GFIELD_ROADMAP_FEB={meta:{status:'draft',currentWeekId:'feb-w05',members},nodes:[
 ...[1,2,3,4].map(i=>({id:'feb-w0'+i,type:'week',source:{core:i,mid:i}})),
 ...[1,2,3,4].map(i=>({id:'feb-w0'+(4+i),type:'week',source:{final:i}})),
 ...[1,2,3,4].map(i=>({id:i===1?'feb-w09':'feb-w1'+(i-2),type:'week',source:{last:i}}))]};
load('roadmap-feb-access.js');
assert.equal(routes.accessAllowed(data,scoped,'final',1),false);
// 3) published, current week = feb-w05 (final 1): weeks 1..5 are open, later weeks stay closed
R.meta.status='published';
for(const n of [scoped,onlineOld]){
  assert.equal(routes.accessAllowed(data,n,'final',1),true,n+' final1');
  assert.equal(routes.accessAllowed(data,n,'final',2),false,n+' final2 stays closed');
  assert.equal(routes.accessAllowed(data,n,'last',1),false,n+' last1 stays closed');
  for(const r of [1,2,3,4])assert.equal(middle.allowsRound(data,n,r,model)||r>2,true,n+' mid '+r);
}
assert.equal(middle.allowsRound(data,scoped,6,model),false,'round 6 is not part of the Feb plan');
assert.equal(api.textbook(data,scoped,book,true),true,'feb-w05 textbook opens via attendance identity');
// 4) outsiders and graduates get nothing
assert.equal(routes.accessAllowed(data,outsider,'last',1),false);assert.equal(middle.allowsRound(data,graduated,1,model),false);assert.equal(routes.accessAllowed(data,graduated,'final',1),false);
// 5) advancing the current week opens more, never the future
R.meta.currentWeekId='feb-w08';assert.equal(routes.accessAllowed(data,scoped,'final',4),true);assert.equal(routes.accessAllowed(data,scoped,'last',1),false);
R.meta.currentWeekId='feb-w09';assert.equal(routes.accessAllowed(data,scoped,'last',1),true);assert.equal(routes.accessAllowed(data,scoped,'last',2),false);
// 6) records untouched
assert.equal(JSON.stringify(data.studentAccessProfiles[scoped].attendance),'[]');
console.log(JSON.stringify({pass:true,inertWithoutProvider:true,draftGrantsNothing:true,currentWeekOnly:true,outsidersAndGraduatesDenied:true,profileUntouched:true}));
