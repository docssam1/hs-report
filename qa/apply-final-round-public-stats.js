'use strict';

// Publishes only approved aggregate fields from server-private Final1-4 baselines.
// Raw rows, identities and participant counts never enter the public data file.
const fs=require('node:fs');
const path=require('node:path');
const core=require('../supabase/functions/hs-final-population/population-core.js');

if(process.env.GFIELD_PRIVATE_POPULATION_AUDIT!=='1') throw new Error('PRIVATE_AUDIT_REQUIRED');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'mock-data-final.js');
const privateRoot=process.env.GFIELD_PRIVATE_POPULATION_ROOT||path.join(root,'supabase/functions/hs-final-population');
let source=fs.readFileSync(target,'utf8');

function matchingBrace(text,start){
  let depth=0,string=false,escape=false;
  for(let index=start;index<text.length;index++){
    const char=text[index];
    if(string){
      if(escape) escape=false;
      else if(char==='\\') escape=true;
      else if(char==='"') string=false;
      continue;
    }
    if(char==='"'){string=true;continue;}
    if(char==='{') depth++;
    if(char==='}'&&--depth===0) return index;
  }
  throw new Error('STATS_OBJECT_NOT_CLOSED');
}

const replacements=[];
for(const round of [1,2,3,4]){
  const exam='final'+round;
  const privatePath=path.join(privateRoot,round===1?'baseline.private.json':'baseline-final'+round+'.private.json');
  const baseline=JSON.parse(fs.readFileSync(privatePath,'utf8'));
  if(baseline.approved!==true||baseline.exam!==exam) throw new Error(exam.toUpperCase()+'_NOT_APPROVED');
  const response=core.createResponse(baseline,[0]);
  const roundAt=source.indexOf('\n    "'+round+'": {',source.indexOf('"rounds": {'));
  const statsAt=source.indexOf('\n      "stats": {',roundAt);
  if(roundAt<0||statsAt<0) throw new Error(exam.toUpperCase()+'_STATS_NOT_FOUND');
  const objectStart=source.indexOf('{',statsAt);
  const objectEnd=matchingBrace(source,objectStart)+1;
  const current=Function('return ('+source.slice(objectStart,objectEnd)+')')();
  if(!Array.isArray(current.cuts)||!current.cuts.length) throw new Error(exam.toUpperCase()+'_CUTS_NOT_FOUND');
  const rate={};
  for(let question=1;question<=30;question++) rate[question]=Math.round(response.rate[question]*1000)/1000;
  const percentileTable=[];
  for(let high=1000;high>=0;high-=16){
    const low=Math.max(0,high-15),scores=Array.from({length:high-low+1},(_,index)=>(high-index)/10);
    const lookup=core.createResponse(baseline,scores).percentiles;
    scores.forEach(score=>percentileTable.push([score,lookup[String(Math.round(score*10))]]));
  }
  const tableToken='__GFIELD_PERCENTILE_TABLE__';
  const next={
    protectedReference:exam+'-source-v1',
    mean:response.mean,
    rate:rate,
    cuts:current.cuts,
    rateEvidence:{status:'verified-source-aggregate',scope:response.scope,version:response.version},
    percentileTable:tableToken,
    rankEvidence:{status:'verified-source-rank',scope:response.scope,sourceId:exam+'-approved-aggregate-v1',sourceRef:'approved Final aggregate reference',verifiedAt:'2026-09-14'}
  };
  const serialized=JSON.stringify(next,null,2).replace(JSON.stringify(tableToken),JSON.stringify(percentileTable));
  const formatted=serialized.split('\n').map((line,index)=>index?'      '+line:line).join('\n');
  replacements.push({start:objectStart,end:objectEnd,value:formatted});
}

replacements.sort((a,b)=>b.start-a.start).forEach(change=>{
  source=source.slice(0,change.start)+change.value+source.slice(change.end);
});
// The cumulative level cut is public, but its source row count and raw
// percentile values are not needed by the report and must stay private.
source=source.replace(/\r?\n    "n": \d+,\r?\n    "through":/,'\n    "through":');
source=source.replace(/\r?\n    "refValues": \[[\s\S]*?\r?\n    \],(?=\r?\n    "label":)/,'');
fs.writeFileSync(target,source,'utf8');
console.log('PASS published approved Final1-4 rates and score-percentile lookup only; no records or participant counts');
