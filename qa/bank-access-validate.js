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
const access=data.archiveProductAccess&&data.archiveProductAccess['question-bank'];
assert.ok(Array.isArray(access)&&access.length>0,'question-bank product permission list exists');
assert.ok(access.every(name=>(data.students||[]).includes(name)||name==='DEMO'),'only known students are carried into initial access');

const gate=read('bank/bank-access.js');
assert.match(gate,/PRODUCT_KEY='question-bank'/);
assert.match(gate,/hs_accounts\?select=role,active,student&user_id=eq\./,'verified self account is read through RLS');
assert.match(gate,/account\.role==='admin'\|\|account\.role==='teacher'/,'staff access remains available');
assert.match(gate,/account\.role!=='student'/,'unknown roles fail closed');
assert.match(gate,/list\.indexOf\(account\.student\)/,'permission is bound to the verified account student');
assert.match(gate,/gfield_question_bank_handoff_v1/,'named portal and bank use a session-scoped handoff');
assert.match(gate,/student!==savedStudent/,'portal handoff must match the selected student name');
assert.doesNotMatch(gate,/URLSearchParams\([^)]*student|location\.(?:search|hash).*student/,'URL student display data is never authority');

const home=read('index.html');
assert.match(home,/sessionStorage\.setItem\(QUESTION_BANK_HANDOFF_KEY/,'authorized archive entry creates the bank handoff');
assert.match(home,/sessionStorage\.removeItem\(QUESTION_BANK_HANDOFF_KEY/,'leaving the student dashboard clears the handoff');

const index=read('bank/index.html'),catalog=read('bank/catalog.html'),admin=read('admin.html');
[index,catalog].forEach((html,i)=>{
  assert.match(html,/<body class="bank-access-pending">/,`${i?'catalog':'worksheet'} hides content before access`);
  assert.match(html,/\.\.\/hs-auth\.js/,`${i?'catalog':'worksheet'} loads approval authentication`);
  assert.match(html,/bank-access\.js/,`${i?'catalog':'worksheet'} loads the shared access gate`);
  assert.match(html,/GFIELD_BANK_ACCESS\.ready/,`${i?'catalog':'worksheet'} waits for access before rendering`);
});
assert.match(admin,/id="bank-acc-matrix"/,'admin console exposes a dedicated question-bank matrix');
assert.match(admin,/QUESTION_BANK_ACCESS_KEY='question-bank'/,'admin and learner pages use the same product key');
assert.match(admin,/bankAccessToggleStudent/,'admin can grant or remove one student');
assert.match(admin,/bankAccessToggleOpen/,'admin can explicitly open or close the bank');

console.log('PASS question-bank permission contract: named portal handoff, dedicated admin key, approval fallback, RLS self identity, direct page gate, fail-closed render');
