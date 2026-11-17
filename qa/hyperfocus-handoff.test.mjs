import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHandler,allowsDiagnosis,hash} from '../supabase/functions/hs-parent-auth/report-handoff.ts';
const id='10000000-0000-4000-8000-000000000001';
const sid='20000000-0000-4000-8000-000000000002';
const did='30000000-0000-4000-8000-000000000003';
const name='테스트학생';
const device='d'.repeat(32);
const roster=()=>({students:[name],studentTypes:{},archiveAccess:{'GFIELD APPLICATION':[name]}});
function fixture(overrides={}){
  let saved=null;let used=false;let sessionHash=null;let revoked=false;let data=roster();let inserts=0;
  const jwt='x.'+Buffer.from(JSON.stringify({sub:id,session_id:sid,exp:Math.floor(Date.now()/1000)+7200})).toString('base64url')+'.x';
  const service={auth:{getUser:async()=>({data:{user:{id}}})},rpc:async(method,args)=>{
    if(method==='hs_hyperfocus_context')return {data:[{user_id:id,student:name,device_id:did}]};
    if(method==='consume_hs_rate_limit')return {data:[{allowed:true}]};
    if(method==='hs_consume_hyperfocus_handoff'){
      if(!saved||saved.token_hash!==args.p_token_hash||used||revoked)return {data:[]};used=true;sessionHash=args.p_session_token_hash;
      return {data:[{user_id:id,student:name,access_expires_at:saved.access_expires_at}]};
    }
    if(method==='hs_resume_hyperfocus_session'){
      if(!used||revoked||sessionHash!==args.p_session_token_hash)return {data:[]};
      return {data:[{user_id:id,student:name,access_expires_at:saved.access_expires_at}]};
    }throw Error('unexpected rpc');
  },from:table=>{assert.equal(table,'hs_hyperfocus_handoffs');return {insert:async(value)=>{inserts++;saved=value;return {};}}},...overrides};
  const handle=createHandler(service,async()=>new Response('window.D='+JSON.stringify(data)+';'));
  const call=(body,headers={})=>handle(new Request('https://example.test',{method:'POST',headers:{origin:'https://hs.gfieldacademy.net',authorization:'Bearer '+jwt,...headers},body:JSON.stringify(body)}));
  return {call,service,get saved(){return saved},get inserts(){return inserts},setRoster:r=>data=r,revoke:()=>revoked=true,jwt};
}
for(const [label,modify] of [
  ['no roster',r=>r.students=[]],['withdrawn',r=>r.studentTypes[name]='withdrawn'],
  ['graduated',r=>r.studentTypes[name]='graduated'],['no folder',r=>r.archiveAccess={}],
  ['restricted empty',r=>r.studentAccessProfiles={[name]:{folders:[]}}]
])test('deny '+label,()=>{let r=roster();modify(r);assert.equal(allowsDiagnosis(r,name),false)});
test('restricted exact grant overrides old lists',()=>{const r=roster();r.archiveAccess={};r.studentAccessProfiles={[name]:{folders:['GFIELD APPLICATION']}};assert.equal(allowsDiagnosis(r,name),true)});
test('restricted wildcard is not a grant',()=>{const r=roster();r.studentAccessProfiles={[name]:{folders:['*']}};assert.equal(allowsDiagnosis(r,name),false)});
test('legacy wildcard grant',()=>{const r=roster();r.archiveAccess['GFIELD APPLICATION']=['*'];assert.equal(allowsDiagnosis(r,name),true)});
test('issue opaque hashed 60sec credential and consume once with diagnosis only',async()=>{
  const f=fixture();const response=await f.call({action:'issue',deviceToken:device});assert.equal(response.status,200);
  const result=await response.json();assert.match(result.token,/^[A-Za-z0-9_-]{43}$/);assert.equal(f.saved.token_hash,await hash(result.token));
  assert.equal(JSON.stringify(f.saved).includes(result.token),false);assert.ok(Date.parse(result.expiresAt)-Date.now()<=60000);
  assert.ok(Date.parse(f.saved.access_expires_at)-Date.now()<=3600000);
  const consumed=await f.call({action:'consume',token:result.token});assert.equal(consumed.status,200);
  const body=await consumed.json();assert.deepEqual(Object.keys(body).sort(),['session','sessionToken']);assert.deepEqual(body.session.permissions,['hyperfocus']);assert.equal(body.session.backend,'hs-report');assert.equal(body.session.userId,id);assert.match(body.sessionToken,/^[A-Za-z0-9_-]{43}$/);assert.notEqual(body.sessionToken,result.token);
  assert.equal((await f.call({action:'consume',token:result.token})).status,401);
});
test('current folder revoked after issue burns handoff and denies',async()=>{
  const f=fixture();const {token}=await (await f.call({action:'issue',deviceToken:device})).json();f.setRoster({...roster(),archiveAccess:{}});
  assert.equal((await f.call({action:'consume',token})).status,403);assert.equal((await f.call({action:'consume',token})).status,401);
});
test('forged token never creates handoff',async()=>{const f=fixture({auth:{getUser:async()=>({error:{message:'bad'}})}});assert.equal((await f.call({action:'issue',deviceToken:device})).status,401);assert.equal(f.inserts,0)});
test('revoked session/device/link denies via context',async()=>{const f=fixture({rpc:async()=>({data:[]})});assert.equal((await f.call({action:'issue',deviceToken:device})).status,403);assert.equal(f.inserts,0)});
test('fail closed on roster failure',async()=>{const f=fixture();f.setRoster({});assert.equal((await f.call({action:'issue',deviceToken:device})).status,503);assert.equal(f.inserts,0)});
for(const payload of [{action:'issue',deviceToken:device,name:'other'},{action:'issue',deviceToken:'bad'},{action:'consume',token:'bad'},{action:'consume',token:'x'.repeat(43),permission:'*'},{action:'issue',deviceToken:device,permission:'mock'}])test('reject extra or malformed input '+JSON.stringify(payload),async()=>{const f=fixture();assert.equal((await f.call(payload)).status,400);assert.equal(f.inserts,0)});
test('deny wrong origin',async()=>{const f=fixture();assert.equal((await f.call({action:'issue',deviceToken:device},{origin:'https://evil.test'})).status,403)});
test('deny missing bearer',async()=>{const f=fixture();assert.equal((await f.call({action:'issue',deviceToken:device},{authorization:''})).status,401)});
test('deny streaming oversized payload',async()=>{const f=fixture();assert.equal((await f.call({action:'issue',deviceToken:device,padding:'x'.repeat(5000)})).status,413)});
test('bounded expiry respects source JWT expiration',async()=>{const f=fixture();const exp=Math.floor(Date.now()/1000)+120;const jwt='x.'+Buffer.from(JSON.stringify({sub:id,session_id:sid,exp})).toString('base64url')+'.x';assert.equal((await f.call({action:'issue',deviceToken:device},{authorization:'Bearer '+jwt})).status,200);assert.equal(Date.parse(f.saved.access_expires_at),exp*1000)});
for(const [label,payload] of [['expired',{sub:id,session_id:sid,exp:1}],['wrong subject',{sub:did,session_id:sid,exp:9999999999}],['missing session',{sub:id,exp:9999999999}]])test('reject '+label,async()=>{const f=fixture();const jwt='x.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.x';assert.equal((await f.call({action:'issue',deviceToken:device},{authorization:'Bearer '+jwt})).status,401)});
test('SQL is service-only, atomic, and checks session/device/link',()=>{const s=fs.readFileSync(new URL('../supabase/hyperfocus-handoff-schema.sql',import.meta.url),'utf8');assert.match(s,/enable row level security/);assert.match(s,/revoke all.*from public, anon, authenticated/);assert.match(s,/h.consumed_at is null/);assert.match(s,/update public.hs_hyperfocus_handoffs/);assert.match(s,/s.id=h.session_id/);assert.match(s,/d.id=h.device_id/);assert.match(s,/exists\(select 1 from public.hs_parent_links/);assert.equal(/create policy/i.test(s),false)});
function frontend(){const win={location:{href:'https://hs.gfieldacademy.net/',assign:url=>win.assigned=url},document:{addEventListener:()=>{}},open:()=>({opener:{},document:{body:{}},location:{replace:url=>win.navigated=url},close:()=>{win.closed=true}}),alert:message=>win.alerted=message,GFIELD_AUTH:{issueHyperfocusLink:async()=>({token:'a'.repeat(43),expiresAt:new Date(Date.now()+60000).toISOString()})}};vm.runInNewContext(fs.readFileSync(new URL('../hs-hyperfocus-link.js',import.meta.url),'utf8'),{window:win,URL,Date,Object,encodeURIComponent});return win;}
test('frontend only exact approved folder/HF root target',()=>{const w=frontend();assert.equal(w.GFIELD_HF_LINK.isBook({folder:'GFIELD APPLICATION'},'https://lete-on.gfieldacademy.net/hyper-focus/?gname=wrong'),true);for(const url of ['https://evil.test/hyper-focus/','https://lete-on.gfieldacademy.net/hyper-focus/mock/','https://evil.test@lete-on.gfieldacademy.net/hyper-focus/'])assert.equal(w.GFIELD_HF_LINK.isBook({folder:'GFIELD APPLICATION'},url),false);assert.equal(w.GFIELD_HF_LINK.isBook({folder:'other'},w.GFIELD_HF_LINK.target),false)});
test('frontend sends only fragment and prevents repeat clicks',async()=>{const w=frontend();let count=0;w.GFIELD_AUTH.issueHyperfocusLink=async()=>{count++;return {token:'a'.repeat(43),expiresAt:new Date(Date.now()+60000).toISOString()}};w.GFIELD_HF_LINK.launchBook({folder:'GFIELD APPLICATION'},w.GFIELD_HF_LINK.target);w.GFIELD_HF_LINK.launchBook({folder:'GFIELD APPLICATION'},w.GFIELD_HF_LINK.target);await new Promise(r=>setTimeout(r,0));assert.equal(count,1);assert.equal(w.navigated,w.GFIELD_HF_LINK.target+'#hs_handoff='+'a'.repeat(43))});
test('frontend closes placeholder on denied grant',async()=>{const w=frontend();w.GFIELD_AUTH.issueHyperfocusLink=async()=>{throw Error('ARCHIVE_NOT_APPROVED')};w.GFIELD_HF_LINK.launchBook({folder:'GFIELD APPLICATION'},w.GFIELD_HF_LINK.target);await new Promise(r=>setTimeout(r,0));assert.equal(w.closed,true);assert.equal(w.navigated,undefined);assert.match(w.alerted,/이용 승인/)});

test('rotated session resumes, handoff cannot resume, session cannot consume',async()=>{
  const f=fixture();const {token}=await (await f.call({action:'issue',deviceToken:device})).json();
  assert.equal((await f.call({action:'resume',token})).status,401);
  const {sessionToken,session}=await (await f.call({action:'consume',token})).json();
  const resumed=await f.call({action:'resume',token:sessionToken});assert.equal(resumed.status,200);
  assert.deepEqual(await resumed.json(),{session});
  assert.equal((await f.call({action:'resume',token})).status,401);
  assert.equal((await f.call({action:'consume',token:sessionToken})).status,401);
});
test('resume immediately denies source revoked or folder removed',async()=>{
  const f=fixture();const {token}=await (await f.call({action:'issue',deviceToken:device})).json();
  const {sessionToken}=await (await f.call({action:'consume',token})).json();
  f.setRoster({...roster(),archiveAccess:{}});
  assert.equal((await f.call({action:'resume',token:sessionToken})).status,403);
  f.setRoster(roster());f.revoke();assert.equal((await f.call({action:'resume',token:sessionToken})).status,401);
});
test('resume null, malformed and unknown credentials denied',async()=>{
  const f=fixture();for(const token of [null,'','bad'])assert.equal((await f.call({action:'resume',token})).status,400);
  assert.equal((await f.call({action:'resume',token:'a'.repeat(43)})).status,401);
});
test('SQL resume checks live session, lease, device and parent without user creation',()=>{
  const sql=fs.readFileSync(new URL('../supabase/hyperfocus-handoff-schema.sql',import.meta.url),'utf8');
  assert.match(sql,/session_token_hash text unique/);assert.match(sql,/hs_resume_hyperfocus_session/);
  assert.match(sql,/h.session_token_hash=p_session_token_hash/);assert.match(sql,/h.access_expires_at>now\(\)/);
  assert.equal(/insert into (?:auth.users|public.hs_accounts)/i.test(sql),false);
});

test('live parent auth router preserves ordinary actions and scopes CORS',async()=>{
  let handler;
  const source=fs.readFileSync(new URL('../supabase/functions/hs-parent-auth/index.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
  const {stripTypeScriptTypes}=await import('node:module');
  const context=vm.createContext({Request,Response,URL,TextEncoder,atob,btoa,crypto,
    createReportHandoffHandler:createHandler,createClient:()=>({}),
    Deno:{env:{get:key=>({SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test',SUPABASE_ANON_KEY:'test'})[key]},serve:fn=>handler=fn}});
  vm.runInContext(stripTypeScriptTypes(source),context);
  const send=(query,origin,method='POST')=>handler(new Request('https://test.invalid/functions/v1/hs-parent-auth'+query,{method,headers:{origin},...(method==='POST'?{body:JSON.stringify({action:'unknown'})}:{})}));
  let res=await send('','https://hs.gfieldacademy.net');assert.equal(res.status,400);assert.equal((await res.json()).error,'INVALID_ACTION');
  res=await send('','https://lete-on.gfieldacademy.net');assert.equal(res.status,403);
  res=await send('?scope=hyperfocus','https://lete-on.gfieldacademy.net','OPTIONS');assert.equal(res.status,204);assert.equal(res.headers.get('access-control-allow-origin'),'https://lete-on.gfieldacademy.net');
  res=await send('?scope=hyperfocus','https://evil.invalid','OPTIONS');assert.equal(res.status,403);
  res=await send('?scope=anything','https://lete-on.gfieldacademy.net','OPTIONS');assert.equal(res.status,403);
  res=await send('?scope=hyperfocus','https://hs.gfieldacademy.net');assert.equal(res.status,400);assert.equal((await res.json()).error,'INVALID_ACTION');
});
test('parent legacy source is byte-identical after removing only import/router (LF checkout normalized)',async()=>{
  const {createHash}=await import('node:crypto');
  const source=fs.readFileSync(new URL('../supabase/functions/hs-parent-auth/index.ts',import.meta.url),'utf8')
    .replace('import { createHandler as createReportHandoffHandler } from "./report-handoff.ts";\n','')
    .replace('  if (new URL(req.url).searchParams.get("scope") === "hyperfocus") return createReportHandoffHandler(service)(req);\n','');
  assert.equal(createHash('sha256').update(source.replace(/\n/g,'\r\n')).digest('hex'),'6f5480094098d9ff46a5e0beaa9f98989d67b83e409fce686a3c42008602acfa');
});
