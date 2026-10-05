'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={location:{href:'https://hs.gfieldacademy.net/index.html',origin:'https://hs.gfieldacademy.net'}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../final-last-routes.js'),'utf8'),{window,URL});
const R=window.GFIELD_FINAL_LAST_ROUTES;
const U=x=>new URL(x,window.location.href);
for(let n=1;n<=9;n++){
 const independent=n===7||n===8;
 assert.equal(R.reportUrl('final',n,'sample'),R.withStudent(R.route(n>5&&!independent?'last':'final',n>5&&!independent?n-5:n,'report'),'sample'),'shared report helper handles independent Final 7/8 and remaining legacy aliases');
}
for(const [series,n] of [['last',5],['final',10],['mid',1],['final',0],['final',1.5]]){
 assert.equal(R.reportUrl(series,n,'sample'),'','invalid report round is not guessed');
}
for(let n=1;n<=9;n++){
 const u=U(R.normalizeUrl('mock.html?set=final&round='+n+'&name=sample&go=timer&preview=1'));
 const independent=n===7||n===8;
 assert.equal(u.pathname,'/final.html');assert.equal(u.searchParams.get('round'),String(n>5&&!independent?n-5:n));
 assert.equal(u.searchParams.get('name'),'sample');assert.equal(u.searchParams.get('preview'),'1');
 assert.equal(u.searchParams.get('set'),n>5&&!independent?'last':null);
}
assert.equal(R.canonicalSeriesRound('final',8).series,'final','Final 8 is an independent pending product');
for(const oldUrl of ['mock.html?set=final&round=8']){
 const u=U(R.normalizeUrl(oldUrl));
 assert.equal(u.pathname,'/final.html','old Final 8 links go to the pending page');
 assert.equal(u.searchParams.get('round'),'8','old Final 8 links keep their own round');
 assert.equal(u.searchParams.get('set'),null,'old Final 8 links never become Last 3');
}
assert.equal(R.route('final',8,'answer-page'),'answer.html?set=final&round=8','Final 8 answer sheet is distinct from O/X entry');
assert.equal(R.normalizeUrl('answer.html?set=final&round=8'),'answer.html?set=final&round=8','Final 8 answer sheet is not redirected to input or Last 3');
assert.equal(R.route('final',6,'report'),'final.html?set=last&round=1&go=report','Final 6 keeps its Last 1 alias');
assert.equal(R.route('final',9,'report'),'final.html?set=last&round=4&go=report','Final 9 keeps its Last 4 alias');
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
const data={students:['assigned','archive','other','online','final8'],attendance:{assigned:['sep-w1'],other:[],online:[]},studentTypes:{online:'online'},archiveAccess:{'파이널 모의고사':['archive'],'최종 모의고사':['other']},archiveProductAccess:{'mock-final-5':['archive'],'mock-final-7':['archive'],'mock-final-8':['final8']}};
const before=JSON.stringify(data);
assert.equal(R.accessAllowed(data,'assigned','final',1),true);
assert.equal(R.accessAllowed(data,'assigned','final',2),false,'assignment remains round scoped');
assert.equal(R.accessAllowed(data,'assigned','final',5),false,'Final5 retains separate product approval');
assert.equal(R.accessAllowed(data,'archive','final',4),true);
assert.equal(R.accessAllowed(data,'archive','final',5),true);
assert.equal(R.accessAllowed(data,'archive','final',7),true,'Final 7 uses its own product approval');
assert.equal(R.accessAllowed(data,'final8','final',8),true,'Final 8 uses only its own product approval');
assert.equal(R.accessAllowed(data,'other','final',8),false,'Last 3 archive access cannot approve Final 8');
assert.equal(R.accessAllowed(data,'other','final',1),false);
assert.equal(R.accessAllowed(data,'online','final',1),false);
assert.equal(R.accessAllowed(data,'not-registered','final',1),false);
assert.equal(JSON.stringify(data),before,'authorization check cannot mutate approvals');
const published={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),published);
const final8=published.window.GFIELD_DATA.books.find(book=>book&&book.accessKey==='mock-final-8');
assert.ok(Array.isArray(published.window.GFIELD_DATA.archiveProductAccess['mock-final-8']),'Final 8 keeps its existing separate approval list');
assert.equal(final8.links.length,3,'Final 8 keeps timer, answer-entry, and answer-sheet routes');
assert.match(final8.links[0].label,/타이머/);
assert.match(final8.links[1].label,/분석/);
assert.match(final8.links[2].label,/답안/);
for(const link of final8.links){const u=U(R.normalizeUrl(link.url));assert.equal(u.searchParams.get('round'),'8','Final 8 links stay on round 8');}
for(const page of ['final.html?round=8&go=report','final.html?round=8&go=answer','answer.html?set=final&round=8']){
 const normalized=R.normalizeUrl(page);assert.match(normalized,/round=8/,'Final 8 canonical link remains distinct');assert.doesNotMatch(normalized,/set=last|round=3/,'Final 8 never becomes Last 3');
}
console.log('PASS route matrix, explicit-series precedence, external URL privacy, per-round access and approval immutability');
