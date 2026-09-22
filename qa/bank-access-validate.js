'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const dataContext={window:{}};
vm.createContext(dataContext);
vm.runInContext(read('data.js'),dataContext);
const data=dataContext.window.GFIELD_DATA;
assert.ok(Array.isArray(data.students)&&data.students.length>0,'registered student list exists');

const gate=read('bank/bank-access.js');
assert.match(gate,/PRODUCT_KEY='question-bank'/);
assert.match(gate,/hs_accounts\?select=role,active,student&user_id=eq\./,'verified self account is read through RLS');
assert.match(gate,/account\.role==='admin'\|\|account\.role==='teacher'/,'staff access remains available');
assert.match(gate,/account\.role!=='student'/,'unknown roles fail closed');
assert.match(gate,/return registeredStudent\(account\.student\)/,'general question-bank permission follows the registered student list');
assert.match(gate,/gfield_question_bank_handoff_v1/,'named portal and bank use a session-scoped handoff');
assert.match(gate,/gfield_question_bank_launch_v1/,'named portal and bank share a short-lived cross-tab launch');
assert.match(gate,/mock-final-7/,'Final7 approval has a narrow practice-bank scope');
assert.match(gate,/scopedPermissionList/,'Final7 practice permission is checked separately from the general bank');
assert.match(gate,/if\(scopedProductKey\(\)\)return listed\(scopedPermissionList\(\),account\.student\)/,'round-scoped permission cannot be bypassed by general bank access');
assert.match(gate,/localStorage\.removeItem\(PORTAL_LAUNCH_KEY\)/,'cross-tab launch is consumed after one read');
assert.match(gate,/student!==savedStudent/,'portal handoff must match the selected student name');
assert.match(gate,/query\.get\('from'\)!=='archive'\|\|!registeredStudent\(student\)/,'URL fallback is accepted only from the archive flow for a registered student');
assert.match(gate,/source:'saved-archive'/,'a previously selected registered archive student can reopen without another login');
assert.match(gate,/location\.replace\(archiveLoginUrl\(\)\)/,'direct entry returns to the archive name login');
assert.doesNotMatch(gate,/bankAccessForm|bankAccessCode|승인번호<input|async function signIn/,'approval-number form and fallback login are removed');

function gateApi(search,students,final7Access,storedStudent){
  const store={gfield_student:storedStudent||''};
  const storage={getItem:key=>store[key]||null,setItem:(key,value)=>{store[key]=String(value)},removeItem:key=>{delete store[key]}};
  const window={
    GFIELD_DATA:{students,archiveProductAccess:{'mock-final-7':final7Access||[]}},
    __GFIELD_BANK_ACCESS_FORCE__:true
  };
  const context={
    window,location:{hostname:'example.test',pathname:'/bank/index.html',search:search||'',hash:'',replace(){}},
    localStorage:storage,sessionStorage:storage,URLSearchParams,Promise,setTimeout,clearTimeout,
    document:{readyState:'loading',addEventListener(){},getElementById(){return null},createElement(){return {setAttribute(){},classList:{toggle(){}}}},head:{appendChild(){}},body:{appendChild(){},classList:{add(){},remove(){}},dataset:{}}}
  };
  window.window=window;
  vm.createContext(context);
  vm.runInContext(gate,context);
  return context.window.GFIELD_BANK_ACCESS;
}
const generalApi=gateApi('?bank=final2',['등록학생'],[],'등록학생');
assert.equal(generalApi.allowed({role:'student',student:'등록학생',active:true}),true,'registered student opens the general bank without a product grant');
assert.equal(generalApi.allowed({role:'student',student:'미등록학생',active:true}),false,'unregistered student remains blocked');
assert.equal(generalApi.portalIdentity().student,'등록학생','saved registered archive identity reopens the bank directly');
const deniedFinal7Api=gateApi('?bank=final7',['등록학생'],[],'등록학생');
assert.equal(deniedFinal7Api.allowed({role:'student',student:'등록학생',active:true}),false,'general registration does not bypass Final7 approval');
const grantedFinal7Api=gateApi('?bank=final7',['등록학생'],['등록학생'],'등록학생');
assert.equal(grantedFinal7Api.allowed({role:'student',student:'등록학생',active:true}),true,'Final7 approval opens only the scoped bank');
const queryApi=gateApi('?bank=final2&from=archive&name=%EB%93%B1%EB%A1%9D%ED%95%99%EC%83%9D',['등록학생'],[],'');
assert.equal(queryApi.portalIdentity().student,'등록학생','archive query fallback survives unavailable handoff storage');

const home=read('index.html');
assert.match(home,/!\(\(D\.students\|\|\[\]\)\.includes\(name\)\)/,'the named portal still rejects unregistered student names');
assert.match(home,/sessionStorage\.setItem\(QUESTION_BANK_HANDOFF_KEY/,'authorized archive entry creates the bank handoff');
assert.match(home,/localStorage\.setItem\(QUESTION_BANK_LAUNCH_KEY/,'authorized archive entry creates the short-lived cross-tab launch');
assert.match(home,/if\(key==='question-bank'\) return !isDemo&&Array\.isArray\(D\.students\)&&D\.students\.includes\(currentStudent\)/,'all registered archive students can see the general bank');
assert.match(home,/url\.searchParams\.set\('from','archive'\)/,'archive navigation carries a storage-independent return marker');
assert.match(home,/link\.addEventListener\('click',issueQuestionBankHandoff\)/,'the bank launch is refreshed at the actual click');
assert.match(home,/sessionStorage\.removeItem\(QUESTION_BANK_HANDOFF_KEY/,'leaving the student dashboard clears the handoff');
assert.match(home,/localStorage\.removeItem\(QUESTION_BANK_LAUNCH_KEY/,'leaving the student dashboard clears the cross-tab launch');

const report=read('final.html');
assert.match(report,/product:'mock-final-7'/,'Final7 report issues a round-scoped practice handoff');
assert.match(report,/issueWrongPracticeHandoff\(ctx\)/,'Final7 practice launch refreshes the scoped handoff');

const index=read('bank/index.html'),catalog=read('bank/catalog.html'),admin=read('admin.html');
[index,catalog].forEach((html,i)=>{
  assert.match(html,/<body class="bank-access-pending">/,`${i?'catalog':'worksheet'} hides content before access`);
  assert.match(html,/\.\.\/hs-auth\.js/,`${i?'catalog':'worksheet'} loads approval authentication`);
  assert.match(html,/bank-access\.js/,`${i?'catalog':'worksheet'} loads the shared access gate`);
  assert.match(html,/GFIELD_BANK_ACCESS\.ready/,`${i?'catalog':'worksheet'} waits for access before rendering`);
});
assert.match(admin,/등록된 학생 전체가 승인번호 없이/,'admin console explains automatic registered-student access');
assert.match(admin,/등록 학생 '\+S\.students\.length\+'명 자동 허용/,'admin console reports the automatic registered-student count');

console.log('PASS question-bank permission contract: registered-student access without approval number, same-tab/cross-tab/query archive handoff, scoped Final7 approval, RLS self identity, direct-page archive return, fail-closed render');
