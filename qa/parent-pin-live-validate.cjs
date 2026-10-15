'use strict';
// Production negative/readiness probes only. No OTP sending, student writes or credentials printed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','hs-auth.js'),'utf8');
const base=source.match(/var SUPABASE_URL='([^']+)'/)[1],key=source.match(/var PUBLISHABLE_KEY='([^']+)'/)[1];
const headers={apikey:key,'Content-Type':'application/json',origin:'https://hs.gfieldacademy.net'};
async function call(body){const r=await fetch(base+'/functions/v1/hs-parent-auth',{method:'POST',headers,body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
(async()=>{
 // verify checks server PIN pepper before email validation; invalid email then stops before OTP or DB writes.
 let r=await call({action:'verify',pin:'0000',email:'invalid'});assert.equal(r.status,400);assert.equal(r.body.error,'INVALID_EMAIL','server pepper is configured');
 r=await call({action:'verify',email:'invalid'});assert.equal(r.status,400);assert.equal(r.body.error,'INVALID_EMAIL','legacy email flow remains available');
 r=await call({action:'pin',pin:'12345'});assert.equal(r.status,400);assert.equal(r.body.error,'INVALID_PIN_FORMAT');
 r=await call({action:'pin',name:'접속번호배포검수_미등록',pin:'0000',deviceToken:'P'.repeat(32)});assert.equal(r.status,404);assert.equal(r.body.error,'STUDENT_NOT_FOUND');
 r=await call({action:'touch',deviceToken:'P'.repeat(32)});assert.equal(r.status,401);assert.equal(r.body.error,'UNAUTHORIZED');
 const table=await fetch(base+'/rest/v1/hs_student_pins?select=student_user_id&limit=0',{headers:{apikey:key}});assert.equal(table.status,401);
 const rpc=await fetch(base+'/rest/v1/rpc/check_hs_student_pin',{method:'POST',headers,body:JSON.stringify({p_student:'00000000-0000-0000-0000-000000000000',p_digest:'0'.repeat(64),p_salt:'0'.repeat(32)})});assert.equal(rpc.status,401);
 console.log('PASS live: PIN pepper present, legacy email flow, invalid PIN/unknown student/no session denied, anonymous PIN table/RPC denied. OTP sent=0; student writes=0.');
})().catch(e=>{console.error(e);process.exitCode=1});
