'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');

const root=path.join(__dirname,'..');
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'),{window});
vm.runInNewContext(fs.readFileSync(path.join(root,'last-score-data.js'),'utf8'),{window});
vm.runInNewContext(fs.readFileSync(path.join(root,'final7-benchmark.js'),'utf8'),{window});
const model=window.GFIELD_MOCK_FINAL;
const round=model.rounds['7'];
assert(round,'Final 7 round must exist');
assert.equal(round.standalone,true,'Final 7 must be standalone');
assert.equal(round.cumulative,false,'Final 7 must opt out of cumulative reporting');
assert.equal(round.minutes,80,'source paper states 80 minutes');
assert.equal(round.items.length,30,'source paper has 30 questions');
assert.equal(round.items.filter(item=>item.taxonomyReviewStatus==='verified-source-bound').length,30,'all Final 7 report types must use the reviewed source-bound taxonomy');
assert.equal(round.items.every(item=>item.area&&item.subarea&&item.detailType),true,'all Final 7 report types must have an explicit area, subarea, and detail type');
assert.equal(round.paper.imagePages,8,'source paper has 8 pages');
assert.equal(round.ready,true,'reviewed Final 7 is released to students with the dedicated round approval');
assert.deepEqual(Array.from(round.lockedQuestions),[],'no Final 7 source question remains in the review lock');
assert.equal(round.stats.rankEvidence.status,'verified-source-rank','Final 7 must use a verified process benchmark for rank percentile');
assert.equal(round.stats.percentileTable.length>100,true,'process percentile table must cover score changes without coarse guessing');
assert.equal(round.stats.cuts.length,6,'process grade cuts must contain the five shared levels and the floor');
assert.equal(Object.prototype.hasOwnProperty.call(round.stats,'rate'),false,'other exams item rates must not be copied onto Final 7 questions');

const expected=['37','95분','67개','102개','9가지','6마리','136','425','40','50','15개','$\\frac{1}{128}$','2가 12개','101, 148, 145','(3, 50)','165','210','병 16살','382개','216g','62','75명','169','4명','3마리','2014년','5주일','30','64가지','128'];
assert.deepEqual(Array.from(round.items,item=>item.officialAnswer||item.answer),expected,'all official answers must remain traceable to the answer PDF');
const q10=round.items.find(item=>item.no===10);
assert.equal(q10.answer,'50');
assert.equal(88*5-(99+98+97+96),50,'Q10 video clarification independently verifies the answer');
assert(q10.caution.includes('곱이 880인 문제가 아닙니다.'));
assert.equal(round.video,'https://youtu.be/NpGefamVXp8','provided solution video must be linked');
assert.equal(round.items.every(item=>Number.isInteger(item.t)&&item.t>=0),true,'all 30 video timestamps must be present');
const q29=round.items.find(item=>item.no===29);
assert.equal(q29.answerStatus,'verified-correction','Q29 must carry the independently verified correction');
assert.equal(q29.answer,'192가지','Q29 learner-facing answer must use the independently verified count');
assert.equal(q29.officialAnswer,'64가지','Q29 source answer must remain traceable');
assert.equal(q29.detailedSolution,true,'Q29 independently reviewed explanation must be available in the detailed-answer section');
assert.equal(q29.reviewStatus,'verified','Q29 detailed solution must be explicitly review-gated');
const nums=[1,3,5,7,9,11,13];
let validQ29=0;
function permute(prefix,rest){
  if(!rest.length){if(prefix.slice(0,5).reduce((x,y)=>x+y,0)===prefix[5]+prefix[2]+prefix[6])validQ29++;return;}
  rest.forEach((value,index)=>permute(prefix.concat(value),rest.slice(0,index).concat(rest.slice(index+1))));
}
permute([],nums);
assert.equal(validQ29,192,'Q29 literal position-distinct count is 192, not the official 64');
assert(q29.comment.includes('4×3×2×1=24가지'),'Q29 explanation must enumerate all four distinct horizontal positions');
assert(q29.comment.includes('4×2×24=192가지'),'Q29 explanation must show the corrected total');
assert(q29.comment.includes('7!=5040가지 전체'),'Q29 explanation must record the independent exhaustive check');
assert(q29.caution.startsWith('✓ 필기 해설 정정:'),'Q29 must visibly distinguish the correction from the source answer');

const exam=path.join(root,'materials','초등과정 대비 최종 모의고사 7회.pdf');
assert(fs.existsSync(exam),'public source exam PDF missing');
const hash=crypto.createHash('sha256').update(fs.readFileSync(exam)).digest('hex').toUpperCase();
assert.equal(hash,'BFE893C3C3DF1C159CCA3D659DA679A7A6005BA93C53E467AFF043F6BDB73C5F','exam PDF must remain byte-identical to source');
for(let n=1;n<=8;n++)assert(fs.existsSync(path.join(root,'materials','final_7',String(n).padStart(3,'0')+'.jpg')),'rendered page '+n+' missing');

const routesWindow={location:{href:'https://hs.gfieldacademy.net/index.html',origin:'https://hs.gfieldacademy.net'}};
vm.runInNewContext(fs.readFileSync(path.join(root,'final-last-routes.js'),'utf8'),{window:routesWindow,URL});
const R=routesWindow.GFIELD_FINAL_LAST_ROUTES;
assert.deepEqual(JSON.parse(JSON.stringify(R.canonicalSeriesRound('final',7))),{series:'final',round:7},'Final 7 must not alias Last 2');
assert.equal(R.normalizeUrl('mock.html?set=final&round=7'),'final.html?round=7');
assert.equal(R.normalizeUrl('answer.html?set=final&round=7'),'answer.html?set=final&round=7');

const accessData={
  students:['파이널3출석학생','최종7승인학생','미승인학생'],
  attendance:{'파이널3출석학생':['sep-21'],'최종7승인학생':[],'미승인학생':[]},
  archiveAccess:{'파이널 모의고사':[]},
  archiveProductAccess:{'mock-final-7':['최종7승인학생']}
};
assert.equal(R.accessAllowed(accessData,'파이널3출석학생','final',3),true,'Final 3 keeps attendance-based access');
assert.equal(R.accessAllowed(accessData,'파이널3출석학생','final',7),false,'Final 3 attendance cannot open Final 7');
assert.equal(R.accessAllowed(accessData,'최종7승인학생','final',7),true,'Final 7 uses its own round approval');
assert.equal(R.accessAllowed(accessData,'최종7승인학생','final',3),false,'Final 7 approval cannot open Final 3');
assert.equal(R.accessAllowed(accessData,'미승인학생','final',7),false,'unapproved students cannot open Final 7');

const html=fs.readFileSync(path.join(root,'final.html'),'utf8');
assert(html.includes('isStandaloneRound?[]:computePersonalAttempts'),'standalone round must exclude prior personal attempts');
assert(html.includes('isStandaloneRound?[]:computeCumulativeConsidered'),'standalone round must exclude prior percentile records');
assert(html.includes('M.rounds[String(roundNum)].standalone) return;'),'standalone round must skip Final population lookups');
assert.match(html,/archiveProductAccess\|\|\{\}\)\['mock-final-'\+roundNum\]/,'Final report must enforce round product approval');
const answerHtml=fs.readFileSync(path.join(root,'answer.html'),'utf8');
assert.match(answerHtml,/GFIELD_FINAL_LAST_ROUTES\.accessAllowed\(D,name,'final',RD\)/,'Final answer sheet must share the round approval guard');
const adminHtml=fs.readFileSync(path.join(root,'admin.html'),'utf8');
assert.match(adminHtml,/id="final7-acc-matrix"/,'admin must expose a clear Final 7 round approval table');
assert.match(adminHtml,/const FINAL7_ACCESS_KEY='mock-final-7'/,'admin Final 7 control must use the same product key');

console.log('PASS Final 7 source identity, answers, independent route, round-only approval, and no-cumulative guards');
