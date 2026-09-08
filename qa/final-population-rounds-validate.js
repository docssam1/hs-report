'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const core=require('../supabase/functions/hs-final-population/population-core.js');
const cuts={
  final1:[48.5,39.4,28.6,19.9,12.8,0],
  final2:[39.6,24.4,21.1,12.2,0.1],
  final3:[45,36.7,28.6,19.1,11.5,0],
  final4:[43.2,37.9,37.2,27.2,15.7,11.5,0]
};
const baselines={};
for(let n=1;n<=4;n++){
  const exam='final'+n;
  baselines[exam]={schemaVersion:1,exam,scope:'provided-original-records',approved:true,version:exam+'-'+String(n).repeat(64),rows:[
    {id:exam+'-a',ox:'O'.repeat(30),score:100},
    {id:exam+'-b',ox:'X'.repeat(30),score:0}
  ]};
}
const cutRows=exam=>cuts[exam].map(score=>['cut',score]);

for(let n=1;n<=4;n++){
  const exam='final'+n,response=core.createResponse(baselines[exam],[50]);
  assert.equal(response.exam,exam);assert.equal(response.mean,50);
  assert.deepEqual(Object.keys(response.percentiles).sort(),[50,...cuts[exam]].map(v=>String(Math.round(v*10))).sort());
  assert.doesNotMatch(JSON.stringify(response),/"(?:n|size|count|denominator|dist|rows|student|sourceRow|id|ox|rank)"/);
}
for(const invalid of [
  {...baselines.final2,exam:'final5',version:'final5-'+'5'.repeat(64)},
  {...baselines.final2,version:'final1-'+'1'.repeat(64)},
  {...baselines.final2,approved:false}
])assert.throws(()=>core.createResponse(invalid,[50]),/INVALID_BASELINE/);

(async()=>{
  let requested=[];
  const context={GFIELD_AUTH:{functionCall:async(_slug,body)=>{requested.push(structuredClone(body));return core.createResponse(baselines[body.exam],body.scores);}}};
  context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'final-population.js'),'utf8'),context);
  const api=context.GFIELD_FINAL_POPULATION;
  const defaultFinal1=await api.load([50],cutRows('final1'),'student');
  assert.equal(defaultFinal1.protectedReference,'final1-source-v1');assert.equal(requested[0].exam,'final1');
  for(let n=2;n<=4;n++){
    const exam='final'+n,value=await api.load([50],cutRows(exam),'student',exam);
    assert.equal(value.protectedReference,exam+'-source-v1');assert.equal(api.isVerified(value),true);assert.equal(api.percentile(50,value),100);
    assert.equal(api.cutPercentile(cuts[exam][0],value),null,'Final1 cut fallback must not cross rounds');
    const saved=api.fromSaved(core.createResponse(baselines[exam],[50]),50,cutRows(exam),exam);
    assert.equal(saved.version,baselines[exam].version);
  }
  await assert.rejects(api.load([50],cutRows('final1'),'student','final5'),/시험 회차/);
  context.GFIELD_AUTH.functionCall=async()=>core.createResponse(baselines.final2,[50]);
  await assert.rejects(api.load([50],cutRows('final1'),'student'),/통계 응답/,'cross-round response rejected');

  let handler;
  const account={role:'student',active:true,student:'qa'},user={id:'qa-id'};
  const authService={auth:{getUser:async()=>({data:{user},error:null})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:account,error:null})})})})};
  const runtime={Request,Response,Set,JSON,Error,baseline:baselines.final1,final2Baseline:baselines.final2,final3Baseline:baselines.final3,final4Baseline:baselines.final4,createClient:()=>authService,GFIELD_POPULATION_CORE:core,GFIELD_REPORT_SERVICE:{handle:async()=>({})},Deno:{env:{get:()=>''},serve:fn=>{handler=fn;}}};
  vm.createContext(runtime);
  const edgeSource=require('node:module').stripTypeScriptTypes(fs.readFileSync(path.join(root,'supabase/functions/hs-final-population/index.ts'),'utf8').replace(/^import .*\r?\n/gm,''));
  vm.runInContext(edgeSource,runtime);
  const request=body=>new Request('https://example.invalid/statistics',{method:'POST',headers:{authorization:'Bearer valid',origin:'https://hs.gfieldacademy.net'},body:JSON.stringify(body)});
  const served=await handler(request({exam:'final3',scores:[50]}));assert.equal(served.status,200);assert.equal((await served.json()).exam,'final3');
  assert.equal((await handler(request({exam:'final5',scores:[50]}))).status,400);
  assert.equal((await handler(request({exam:'final2',scores:[50],round:2}))).status,400);

  const reports=require('../supabase/functions/hs-final-population/report-service.js');
  const result={student:'qa',round:'final2',ox:'O'.repeat(30),score:100,wrong:0,source:'online',owner_id:'qa-id'};
  let saved=null;
  const reportService={from(table){const q={select(){return q;},eq(){return q;},upsert(value){saved=structuredClone(value);return Promise.resolve({error:null});},maybeSingle:async()=>({data:table==='mock_results'?result:table==='hs_final_report_snapshots'?saved:null,error:null})};return q;;}};
  const report=await reports.handle(reportService,account,user,{action:'record-report',exam:'final2',student:'qa'},core,baselines);
  assert.equal(saved.round,'final2');assert.equal(report.snapshot.exam,'final2');assert.equal(report.resultOx,result.ox);
  assert.doesNotMatch(JSON.stringify(report),/"(?:n|count|denominator|dist|rows|owner_id)"/);

  const schema=fs.readFileSync(path.join(root,'supabase/report-state-schema.sql'),'utf8');
  const ddl=fs.readFileSync(path.join(root,'supabase/report-state-final1-4-constraints.sql'),'utf8');
  for(const source of [schema,ddl]){assert.match(source,/round\s*~\s*'\^final\[1-4\]\$'/);assert.match(source,/exam\s*~\s*'\^final\[1-4\]\$'/);}
  console.log('PASS Final1 default and verified Final1-4 baselines, per-round cuts, endpoint selection, persisted snapshot isolation and private response');
})().catch(error=>{console.error(error);process.exitCode=1;});
