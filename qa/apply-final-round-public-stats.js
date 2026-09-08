'use strict';

// Publishes only approved aggregate fields from server-private Final2-4 baselines.
// Raw rows, identities and participant counts never enter the public data file.
const fs=require('node:fs');
const path=require('node:path');
const core=require('../supabase/functions/hs-final-population/population-core.js');

if(process.env.GFIELD_PRIVATE_POPULATION_AUDIT!=='1') throw new Error('PRIVATE_AUDIT_REQUIRED');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'mock-data-final.js');
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
for(const round of [2,3,4]){
  const exam='final'+round;
  const privatePath=path.join(root,'supabase/functions/hs-final-population/baseline-final'+round+'.private.json');
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
  const next={
    protectedReference:exam+'-source-v1',
    mean:response.mean,
    rate:rate,
    cuts:current.cuts,
    rateEvidence:{status:'verified-source-aggregate',scope:response.scope,version:response.version}
  };
  const formatted=JSON.stringify(next,null,2).split('\n').map((line,index)=>index?'      '+line:line).join('\n');
  replacements.push({start:objectStart,end:objectEnd,value:formatted});
}

replacements.sort((a,b)=>b.start-a.start).forEach(change=>{
  source=source.slice(0,change.start)+change.value+source.slice(change.end);
});
fs.writeFileSync(target,source,'utf8');
console.log('PASS published approved Final2-4 aggregate references only');
