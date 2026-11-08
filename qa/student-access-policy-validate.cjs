'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),name='복귀검수',other='기존검수';
const context=vm.createContext({console,URL,URLSearchParams,Date,location:{href:'https://example.test/',hostname:'example.test',search:''}});context.window=context;
function load(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});}
load('student-access-policy.js');load('final-last-routes.js');load('middle-access.js');load('bank/personal-mock.js');
const api=context.GFIELD_STUDENT_ACCESS,routes=context.GFIELD_FINAL_LAST_ROUTES,middle=context.GFIELD_MIDDLE_ACCESS,bank=context.GFIELD_PERSONAL_MOCK;
const weekly={title:'주차 교재',url:'week.pdf'},specialBook={title:'활용 모의고사 1회',url:'hw.pdf',access:['*']};
const data={students:[name,other],studentTypes:{},attendance:{[name]:['oct-5','sep-w1'],[other]:['oct-5']},specialStudents:[name,other],
  archiveAccess:{'최종 모의고사':['*'],'파이널 모의고사':['*'],'중급 모의고사':['*'],'활용 모의고사':['*']},
  archiveProductAccess:{'mock-signature-2':['*'],'mock-final-8':['*'],'mock-mid-8':['*'],'seminar-hwangso-2026':['*']},vipAccess:{col:['*']},
  content:{'oct-5':{textbooks:[weekly]},'special-summer':{textbooks:[specialBook]}},books:[{folder:'중급 모의고사',title:'중급 모의고사 8회',accessKey:'mock-mid-8'}],reports:{[name]:{comment:'보존'}}};
const model={rounds:{'1':{},'8':{}}},raw=JSON.stringify(data);
assert.equal(routes.accessAllowed(data,name,'last',1),true);assert.equal(api.allows(data,name,'products','question-bank',true),true);
api.reset(data,name);
const before=JSON.parse(raw),after=JSON.parse(JSON.stringify(data));delete after.studentAccessProfiles;delete after.studentAccessHistory;assert.deepEqual(after,before);
assert.equal(data.studentAccessHistory[name][0].permissions.attendance.join(','),'oct-5,sep-w1');
for(const type of ['online','resident']){
 data.studentTypes[name]=type;
 for(const series of ['last','final'])for(const r of [1,2,3,4,8])assert.equal(routes.accessAllowed(data,name,series,r),false);
 for(const code of ['final1','last1','final8','original2','middle8','applied1'])assert.equal(bank.isAllowed(code,name,data),false,code+' old source denied');
 assert.equal(middle.rounds(data,name,model).length,0);assert.equal(api.attendance(data,name).length,0);assert.equal(api.special(data,name),false);
 assert.equal(api.textbook(data,name,weekly,true),false);assert.equal(api.textbook(data,name,specialBook,true),false);
 for(const [kind,key] of [['folders','최종 모의고사'],['products','question-bank'],['products','seminar-hwangso-2026'],['vip','col']])assert.equal(api.allows(data,name,kind,key,true),false);
}
assert.equal(routes.accessAllowed(data,other,'last',1),true);assert.equal(middle.rounds(data,other,model).length,2);
api.grant(data,name,'products','mock-signature-2',true);assert.equal(bank.isAllowed('original2',name,data),true);assert.equal(bank.isAllowed('final8',name,data),false);
api.grant(data,name,'products','mock-mid-8',true);assert.equal(middle.allowsRound(data,name,8,model),true);assert.equal(middle.allowsRound(data,name,1,model),false);
api.grant(data,name,'attendance','oct-5',true);assert.equal(routes.accessAllowed(data,name,'last',1),true);assert.equal(routes.accessAllowed(data,name,'last',2),false);assert.equal(api.textbook(data,name,weekly,true),true);
api.grant(data,name,'folders','활용 모의고사',true);assert.equal(api.appliedRound(data,name,1),true);api.grant(data,name,'folders','활용 모의고사',false);assert.equal(api.appliedRound(data,name,1),false);
data.studentAccessProfiles[name].special=true;api.grant(data,name,'textbooks',api.textbookKey(specialBook),true);assert.equal(api.appliedRound(data,name,1),true);
api.reset(data,name);assert.equal(data.studentAccessHistory[name].length,2);assert.equal(api.appliedRound(data,name,1),false);assert.equal(bank.isAllowed('original2',name,data),false);
// Bank entry checks, including global wildcard, staff bypass, and missing helper.
context.document={readyState:'loading',addEventListener(){}};context.GFIELD_DATA=data;load('bank/bank-access.js');
const entry=context.GFIELD_BANK_ACCESS,user={role:'student',student:name,active:true};
assert.equal(entry.allowed(user),false);api.grant(data,name,'products','question-bank',true);assert.equal(entry.allowed(user),true);
context.location.search='?bank=original2';assert.equal(entry.allowed(user),false);api.grant(data,name,'products','mock-signature-2',true);assert.equal(entry.allowed(user),true);
assert.equal(entry.allowed({role:'admin',active:true}),true);data.studentTypes[name]='graduated';assert.equal(entry.allowed(user),false);data.studentTypes[name]='resident';
context.GFIELD_STUDENT_ACCESS=undefined;assert.equal(entry.allowed(user),false);assert.equal(routes.accessAllowed(data,name,'last',1),false);
data.studentAccessProfiles[name]=null;assert.equal(entry.allowed(user),false);assert.equal(routes.accessAllowed(data,name,'last',1),false);
console.log(JSON.stringify({pass:true,rawRecordsPreserved:true,wildcardAndImplicitDefaultsDenied:true,onlineAndResident:true,newApprovalsOnly:true,otherStudentsUnchanged:true,repeatGraduation:true,missingHelperDenied:true,productionWrites:0}));
