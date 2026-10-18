'use strict';
// Real PostgreSQL-compatible local DB + production Edge Function handler, no cloud/SMTP writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto');
const {PGlite}=require(process.env.GFIELD_PIN_PGLITE||'@electric-sql/pglite');
const root=path.resolve(__dirname,'..'),id='00000000-0000-0000-0000-000000000001',name='접속번호검수';
const account={user_id:id,student:name,login_email:'qa@auth.gfieldacademy.net',role:'student',active:true};
const parent={student_user_id:id,parent_email:'qa@example.com',first_verified_at:new Date().toISOString(),last_seen_at:new Date().toISOString()};
let handler,pepper='qa-only-private-pepper-that-is-never-deployed',deviceRecords=[],sessionCount=0,otpCount=0;
async function run(){
 const db=new PGlite();await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create table public.hs_parent_links(student_user_id uuid primary key);');
 await db.query('insert into public.hs_parent_links values ($1)',[id]);
 await db.exec(fs.readFileSync(path.join(root,'supabase/parent-pin-schema.sql'),'utf8'));
 const service={auth:{admin:{signOut:async()=>({}),generateLink:async()=>{sessionCount++;return {data:{properties:{hashed_token:'qa-token'}}};}},getUser:async()=>({data:{user:{id}}})},rpc:async(method,args)=>{
  if(method==='consume_hs_rate_limit')return {data:[{allowed:true}]};
  const r=await db.query('select public.check_hs_student_pin($1,$2,$3) as result',[args.p_student,args.p_digest,args.p_salt]);return {data:r.rows[0].result};
 },from(table){
  let operation='select',value,filters=[];
  const q={select(){return q},eq(k,v){filters.push([k,v]);return q},update(v){operation='update';value=v;return q},insert(v){operation='insert';value=v;return q},upsert(v){operation='upsert';value=v;return q},async maybeSingle(){return execute(true)},then(ok,fail){return execute(false).then(ok,fail)}};
  async function execute(single){
   if(table==='hs_accounts')return {data:account};
   if(table==='hs_parent_links'){if(operation==='update')Object.assign(parent,value);return {data:parent};}
   if(table==='hs_student_pins'){
    if(operation==='upsert')await db.query('insert into hs_student_pins(student_user_id,pin_hash,pin_salt,failed_attempts) values($1,$2,$3,0) on conflict(student_user_id) do update set pin_hash=excluded.pin_hash,pin_salt=excluded.pin_salt,failed_attempts=0',[value.student_user_id,value.pin_hash,value.pin_salt]);
    const result=await db.query('select * from hs_student_pins where student_user_id=$1',[id]);return {data:single?result.rows[0]||null:result.rows};
   }
   if(table==='hs_student_devices'){
    if(operation==='insert')deviceRecords.push({...value,id:String(deviceRecords.length)});
    if(operation==='update'){const d=deviceRecords.find(d=>filters.every(([k,v])=>d[k]===v));if(d)Object.assign(d,value);}
    const found=deviceRecords.filter(d=>filters.every(([k,v])=>d[k]===v));
    return {data:single?found[0]||null:found};
   }
   throw new Error('Unexpected table: '+table);
  }return q;
 }};
 const publicAuth={auth:{verifyOtp:async body=>{
  if(body.email){otpCount++;return body.token==='12345678'?{data:{session:{access_token:'parent-token'},user:{id:'parent-id',email:body.email}}}:{error:{}};}
  return {data:{session:{access_token:'student-token',refresh_token:'student-refresh',expires_in:3600},user:{id}}};
 },signInWithOtp:async()=>({})}};
 const context=vm.createContext({crypto:webcrypto,TextEncoder,Request,Response,atob,btoa,console,fetch:async()=>({ok:true,text:async()=>JSON.stringify({students:[name],studentTypes:{[name]:account.active?'resident':'withdrawn'}})}),createClient:(_url,key)=>key==='service'?service:publicAuth,Deno:{env:{get:key=>({SUPABASE_URL:'https://qa.invalid',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',HS_PARENT_PIN_PEPPER:pepper})[key]},serve:fn=>{handler=fn}}});
 const helper=fs.readFileSync(path.join(root,'supabase/functions/hs-parent-auth/pin-security.ts'),'utf8').replace(/^export /gm,'');
 const source=fs.readFileSync(path.join(root,'supabase/functions/hs-parent-auth/index.ts'),'utf8').replace(/^import .*;\r?\n/gm,'');
 vm.runInContext(stripTypeScriptTypes(helper+'\n'+source),context);
 async function call(action,body={}){const r=await handler(new Request('https://qa.invalid',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://hs.gfieldacademy.net'},body:JSON.stringify({action,name,deviceToken:'A'.repeat(32),...body})}));return {status:r.status,body:await r.json()};}
 async function fails(action,body,status,code){const r=await call(action,body);assert.equal(r.status,status);assert.equal(r.body.error,code);}
 try{
  await fails('pin',{pin:'0472'},401,'PIN_NOT_READY');
  await fails('verify',{email:'qa@example.com',code:'00000000',pin:'0472'},401,'INVALID_CODE');
  assert.equal((await db.query('select count(*) as n from hs_student_pins')).rows[0].n,0);
  const verified=await call('verify',{email:'qa@example.com',code:'12345678',pin:'0472'});assert.equal(verified.status,200);assert.equal(verified.body.pinReady,true);
  let row=(await db.query('select * from hs_student_pins')).rows[0];assert.notEqual(row.pin_hash,'0472');assert.equal(row.pin_hash.length,64);
  assert.equal((await call('pin',{pin:'0472'})).status,200);
  for(let i=0;i<4;i++)await fails('pin',{pin:'9999'},401,'INVALID_PIN');
  await fails('pin',{pin:'9999'},403,'PIN_LOCKED');
  const lockedSessions=sessionCount;await fails('pin',{pin:'0472'},403,'PIN_LOCKED');assert.equal(sessionCount,lockedSessions);
  await fails('verify',{email:'other@example.com',code:'12345678',pin:'0826'},409,'LINKED_TO_OTHER_EMAIL');
  assert.equal((await db.query('select failed_attempts from hs_student_pins')).rows[0].failed_attempts,5);
  assert.equal((await call('verify',{email:'qa@example.com',code:'12345678',pin:'0826'})).status,200);
  await fails('pin',{pin:'0472'},401,'INVALID_PIN');assert.equal((await call('pin',{pin:'0826'})).status,200);
  row=(await db.query('select * from hs_student_pins')).rows[0];assert.equal(row.failed_attempts,0);
  const race=await db.query('select check_hs_student_pin($1,$2,$3) as status',[id,row.pin_hash,'0'.repeat(32)]);assert.equal(race.rows[0].status,'PIN_CHANGED');
  account.active=false;await fails('pin',{pin:'0826'},403,'STUDENT_INACTIVE');account.active=true;
  deviceRecords=[0,1,2].map(i=>({id:String(i),student_user_id:id,device_hash:'different-'+i,last_seen_at:null}));
  assert.equal((await call('start',{email:'qa@example.com'})).status,200,'email setup may begin on a fourth browser');
  assert.equal((await call('pin',{pin:'0826'})).status,200,'PIN login registers a fourth browser');
  assert.equal(deviceRecords.length,4);
  await fails('pin',{pin:'12345'},400,'INVALID_PIN_FORMAT');
  pepper='';await fails('pin',{pin:'0826'},503,'PIN_NOT_CONFIGURED');pepper='qa-only-private-pepper-that-is-never-deployed';
  const deniedTouch=await call('touch');assert.equal(deniedTouch.status,401);
  await db.exec('set role service_role');
  const permitted=await db.query('select check_hs_student_pin($1,$2,$3) as result',[id,row.pin_hash,row.pin_salt]);assert.equal(permitted.rows[0].result,'OK');
  await db.exec('reset role');
  for(const role of ['anon','authenticated']){
   await db.exec('set role '+role);await assert.rejects(db.query('select * from hs_student_pins'),/permission denied/);
   await assert.rejects(db.query('select check_hs_student_pin($1,$2,$3)',[id,row.pin_hash,row.pin_salt]),/permission denied/);await db.exec('reset role');
  }
  const before=otpCount;assert.equal(before,3);console.log('PASS real local SQL + Edge handler: OTP-only setup/reset, leading zero PIN, permanent fifth-failure lock, no session on failure, wrong email/inactive, fourth browser allowed, salt race, anon/auth denied');
 }finally{await db.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
