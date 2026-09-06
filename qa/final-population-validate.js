'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const baseline={schemaVersion:1,exam:'final1',scope:'provided-original-records',approved:true,version:'final1-'+ 'a'.repeat(64),rows:[
  {id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'O'+'X'.repeat(29),score:2.7},{id:'c',ox:'O'+'X'.repeat(29),score:2.7},{id:'d',ox:'X'.repeat(30),score:0}
]};
const cuts=[['경시 가능',48.5],['경시컷 · 심화안정권',39.4],['심화컷 · 실력안정권',28.6],['실력컷 · 일품안정권',19.9],['일품컷',12.8],['노력요함',0]];
const requested=[0,2.7,5.4,100];
const before=JSON.stringify(baseline),response=core.createResponse(baseline,requested);
assert.equal(response.mean,26.4);assert.equal(response.percentiles['27'],50);assert.equal(response.percentiles['0'],100);assert.equal(response.percentiles['1000'],25);
assert.equal(response.rate[1],.75);assert.equal(response.rate[30],.25);assert.equal(JSON.stringify(baseline),before);
assert.doesNotMatch(JSON.stringify(response),/"(?:n|size|count|denominator|dist|rows|student|sourceRow|id|ox|rank)"/);
for(const invalid of [[],Array(17).fill(0),['10'],[true],[NaN],[-1],[101],[1.23]])assert.throws(()=>core.createResponse(baseline,invalid));
for(const mutate of [b=>b.approved=false,b=>b.rows[0].score=0,b=>b.rows[1].id='a',b=>b.rows[2].ox='?',b=>b.rows=[]]){const b=structuredClone(baseline);mutate(b);assert.throws(()=>core.createResponse(b,requested));}

(async()=>{
  let handler,authUser={id:'qa-user'},account={role:'student',active:true},accountFailure=false;
  const service={auth:{getUser:async token=>({data:{user:token==='valid'?authUser:null},error:token==='valid'?null:{message:'denied'}})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:account,error:accountFailure?{message:'offline'}:null})})})})};
  const runtime={Request,Response,Set,JSON,Error,baseline,createClient:()=>service,GFIELD_POPULATION_CORE:core,Deno:{env:{get:()=>''},serve:fn=>{handler=fn;}}};
  vm.createContext(runtime);
  const source=fs.readFileSync(path.join(root,'supabase/functions/hs-final-population/index.ts'),'utf8').replace(/^import .*\r?\n/gm,'');
  const javascript=require('node:module').stripTypeScriptTypes(source);
  vm.runInContext(javascript,runtime);
  const request=(token='valid',body={exam:'final1',scores:requested},origin='https://hs.gfieldacademy.net')=>new Request('https://example.invalid/statistics',{method:'POST',headers:{authorization:'Bearer '+token,origin},body:JSON.stringify(body)});
  assert.equal((await handler(request('bad'))).status,401);
  assert.equal((await handler(request('valid',undefined,'https://untrusted.invalid'))).status,403);
  account.active=false;assert.equal((await handler(request())).status,403);account.active=true;
  accountFailure=true;assert.equal((await handler(request())).status,503);accountFailure=false;
  assert.equal((await handler(request('valid',{exam:'final1',scores:requested,student:'another-user'}))).status,400);
  assert.equal((await handler(request('valid',{exam:'final1',scores:[true]}))).status,400);
  const served=await handler(request());assert.equal(served.status,200);assert.equal(served.headers.get('cache-control'),'no-store');
  assert.deepEqual(await served.json(),response);
  console.log('PASS endpoint authentication, inactive account denial, CORS, malformed input and safe response');
  let next=response;
  const ctx={GFIELD_AUTH:{functionCall:async(slug,body)=>{assert.equal(slug,'hs-final-population');assert.deepEqual(Object.keys(body).sort(),['exam','scores']);return next;}}};ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root,'final-population.js'),'utf8'),ctx);
  const api=ctx.GFIELD_FINAL_POPULATION,valid=await api.load(requested,cuts,'student');
  assert.equal(api.isVerified(valid),true);assert.equal(api.isVerified({...valid}),false);assert.equal(api.percentile(2.7,valid),50);assert.equal(api.percentile(1,valid),null);assert.equal(Object.isFrozen(valid),true);
  for(const mutate of [r=>r.n=4,r=>r.rate[1]=1.1,r=>r.mean=1,r=>delete r.percentiles['27'],r=>r.percentiles['0']=null,r=>r.percentiles['1000']=100,r=>r.version='bad']){
    next=structuredClone(response);mutate(next);await assert.rejects(api.load(requested,cuts,'student'));
  }
  next=response;
  // No participant data is bundled in the public data file.
  const pub={window:{}};vm.createContext(pub);vm.runInContext(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'),pub);
  const publicStats=pub.window.GFIELD_MOCK_FINAL.rounds['1'].stats;
  assert.deepEqual(Object.keys(publicStats).sort(),['cuts','mean','protectedReference','rate','rateEvidence']);
  const file=path.join(root,'supabase/functions/hs-final-population/baseline.private.json');
  if(process.env.GFIELD_PRIVATE_POPULATION_AUDIT==='1'){
    const privateBaseline=JSON.parse(fs.readFileSync(file,'utf8'));
    const original=JSON.parse(fs.readFileSync(path.join(root,'.private-work/final1-population/source-candidate.json'),'utf8'));
    assert.equal(privateBaseline.version,'final1-'+crypto.createHash('sha256').update(JSON.stringify(original)).digest('hex'));
    const actual=core.createResponse(privateBaseline,requested);
    assert.equal(actual.mean,31.6);
    assert.equal(publicStats.rateEvidence.version,privateBaseline.version);
    for(let no=1;no<=30;no++)assert.equal(publicStats.rate[no],Math.round(actual.rate[no]*1000)/1000,'public question-bank aggregate matches approved source');
    assert.deepEqual(privateBaseline.rows,original.rows.filter(r=>r.score!=null&&r.score!=='').map(r=>({id:'source-row-'+r.sourceRow,ox:r.flags.map(v=>v===1||v==='1'?'O':'X').join(''),score:Math.round(Number(r.score)*10)/10})));
    const scoreValues=privateBaseline.rows.map(r=>r.score);
    for(let lo=0;lo<=1000;lo+=16){
      const batch=Array.from({length:Math.min(16,1001-lo)},(_,i)=>(lo+i)/10),out=core.createResponse(privateBaseline,batch);
      for(const s of batch){const sorted=scoreValues.slice().sort((a,b)=>b-a),idx=sorted.findIndex(v=>v<=s),rank=idx<0?sorted.length:idx+1;
        assert.equal(out.percentiles[String(Math.round(s*10))],Math.round(rank/sorted.length*1000)/10);
      }
    }
    console.log('PASS private source binding, all score lookups and original-record mean; no counts printed');
  }
  console.log('PASS ties/bounds, OX scoring, no raw records/counts, immutable trusted responses, tampering rejected');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
