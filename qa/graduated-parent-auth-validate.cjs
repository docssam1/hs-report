'use strict';
// Exercise the actual Edge handler against synthetic services, never live accounts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..'),name='졸업검수학생',id='00000000-0000-0000-0000-000000000001';
const helper=fs.readFileSync(path.join(root,'supabase/functions/hs-parent-auth/pin-security.ts'),'utf8').replace(/^export /gm,'');
const source=fs.readFileSync(path.join(root,'supabase/functions/hs-parent-auth/index.ts'),'utf8').replace(/^import .*;\r?\n/gm,'');
async function scenario(type,hasAccount=true,active=true){
 let handler,privilegedCalls=0;
 const account=hasAccount?{user_id:id,student:name,login_email:'qa@example.invalid',role:'student',active}:null;
 const service={auth:{getUser:async()=>({data:{user:{id}}}),admin:new Proxy({}, {get:()=>async()=>{privilegedCalls++;throw new Error('No account mutation is allowed');}})},rpc:async()=>({data:[{allowed:true}]}),from(table){
  assert.equal(table,'hs_accounts');const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:account})};return q;
 }};
 const context=vm.createContext({crypto:webcrypto,TextEncoder,Request,Response,atob,btoa,console,
  fetch:async()=>({ok:true,text:async()=>JSON.stringify({students:[name],studentTypes:{[name]:type}})}),
  createClient:(_url,key)=>key==='service'?service:{auth:new Proxy({}, {get:()=>async()=>{privilegedCalls++;throw new Error('No email or session may be issued');}})},
  Deno:{env:{get:key=>({SUPABASE_URL:'https://qa.invalid',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',HS_PARENT_PIN_PEPPER:'qa-only-private-pepper-that-is-never-deployed'})[key]},serve:fn=>{handler=fn}}
 });
 vm.runInContext(stripTypeScriptTypes(helper+'\n'+source),context);
 if(['resident','online'].includes(type)&&active){
  const resolved=await vm.runInContext('resolveStudent('+JSON.stringify(name)+')',context);assert.equal(resolved.name,name);assert.equal(resolved.account.active,true);
  return {type,restored:true,loginResolutionAllowed:true};
 }
 for(const action of hasAccount?['start','verify','pin','touch']:['start','verify','pin']){
  const response=await handler(new Request('https://qa.invalid',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://hs.gfieldacademy.net',authorization:'Bearer qa-only-token'},body:JSON.stringify({action,name,email:'qa@example.com',code:'12345678',pin:'0472',deviceToken:'A'.repeat(32)})}));
  assert.equal(response.status,403,action+' '+type);assert.equal((await response.json()).error,type==='graduated'?'STUDENT_GRADUATED':'STUDENT_INACTIVE');
 }
 assert.equal(privilegedCalls,0);return {type,hasAccount,active,denied:true,noEmailOrSession:true};
}
(async()=>{
 const cases=[];for(const args of [['graduated',true,true],['graduated',true,false],['graduated',false,true],['withdrawn',true,true],['resident',true,false],['resident',true,true],['online',true,true]])cases.push(await scenario(...args));
 console.log(JSON.stringify({pass:true,cases,productionWrites:0}));
})().catch(error=>{console.error(error);process.exitCode=1});
