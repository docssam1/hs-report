'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={location:{href:'https://hs.gfieldacademy.net/index.html',origin:'https://hs.gfieldacademy.net'}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../final-last-routes.js'),'utf8'),{window,URL});
const R=window.GFIELD_FINAL_LAST_ROUTES;
const U=x=>new URL(x,window.location.href);
for(let n=1;n<=9;n++){
 assert.equal(R.reportUrl('final',n,'sample'),R.withStudent(R.route(n>5?'last':'final',n>5?n-5:n,'report'),'sample'),'shared report helper handles legacy aliases');
}
for(const [series,n] of [['last',5],['final',10],['mid',1],['final',0],['final',1.5]]){
 assert.equal(R.reportUrl(series,n,'sample'),'','invalid report round is not guessed');
}
for(let n=1;n<=9;n++){
 const u=U(R.normalizeUrl('mock.html?set=final&round='+n+'&name=sample&go=timer&preview=1'));
 assert.equal(u.pathname,'/final.html');assert.equal(u.searchParams.get('round'),String(n>5?n-5:n));
 assert.equal(u.searchParams.get('name'),'sample');assert.equal(u.searchParams.get('preview'),'1');
 assert.equal(u.searchParams.get('set'),n>5?'last':null);
}
for(let n=1;n<=4;n++){
 const u=U(R.normalizeUrl('final.html?set=last&round='+n+'&go=report&name=sample'));
 assert.equal(u.pathname,'/final.html');assert.equal(u.searchParams.get('set'),'last');assert.equal(u.searchParams.get('go'),'report');assert.equal(u.searchParams.get('round'),String(n));
 assert.equal(u.searchParams.get('name'),'sample');
}
assert.equal(U(R.normalizeUrl('answer.html?round=1',{title:'파이널 모의고사 1회 답안·교재 연결표'})).searchParams.get('set'),'final','explicit material title repairs missing series');
for(const s of ['mid','hw'])assert.equal(R.normalizeUrl('mock.html?set='+s+'&round=1',{title:'파이널 모의고사'}),'mock.html?set='+s+'&round=1','explicit non-Final series preserved');
assert.equal(R.normalizeUrl('mock.html?round=1'),'mock.html?round=1','generic middle link preserved');
for(const external of ['https://example.org/answer.html?set=final&round=6','//example.org/answer.html?set=final&round=6','javascript:alert(1)']){
 assert.equal(R.normalizeUrl(external),external);assert.equal(R.withStudent(external,'private-name'),external);assert.equal(R.isKnownHtml(external),false);
}
for(const f of ['last1-entry.html?round=1','last1-result.html?round=2','last1-answer.html','last-answer.html?round=4'])assert.equal(R.isKnownHtml(f),true,'canonical Last HTML recognised');
const data={students:['assigned','archive','other','online'],attendance:{assigned:['sep-w1'],other:[],online:[]},studentTypes:{online:'online'},archiveAccess:{'파이널 모의고사':['archive']},archiveProductAccess:{'mock-final-5':['archive']}};
const before=JSON.stringify(data);
assert.equal(R.accessAllowed(data,'assigned','final',1),true);
assert.equal(R.accessAllowed(data,'assigned','final',2),false,'assignment remains round scoped');
assert.equal(R.accessAllowed(data,'assigned','final',5),false,'Final5 retains separate product approval');
assert.equal(R.accessAllowed(data,'archive','final',4),true);
assert.equal(R.accessAllowed(data,'archive','final',5),true);
assert.equal(R.accessAllowed(data,'other','final',1),false);
assert.equal(R.accessAllowed(data,'online','final',1),false);
assert.equal(R.accessAllowed(data,'not-registered','final',1),false);
assert.equal(JSON.stringify(data),before,'authorization check cannot mutate approvals');
console.log('PASS route matrix, explicit-series precedence, external URL privacy, per-round access and approval immutability');
