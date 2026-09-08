(function(root){
  'use strict';
  const points=Array.from({length:30},(_,i)=>i<12?27:i<22?34:42);
  const cutScoresByExam=Object.freeze({
    final1:Object.freeze([48.5,39.4,28.6,19.9,12.8,0]),
    final2:Object.freeze([39.6,24.4,21.1,12.2,0.1]),
    final3:Object.freeze([45,36.7,28.6,19.1,11.5,0]),
    final4:Object.freeze([43.2,37.9,37.2,27.2,15.7,11.5,0])
  });
  const round=x=>Math.round(x*10)/10;
  function scoreOf(ox){
    if(typeof ox!=='string'||!/^[OX]{30}$/.test(ox))throw new Error('INVALID_BASELINE');
    return [...ox].reduce((s,v,i)=>s+(v==='O'?points[i]:0),0)/10;
  }
  function createResponse(baseline,requestedScores){
    const exam=baseline&&baseline.exam;
    const cutScores=/^final[1-4]$/.test(String(exam||''))?cutScoresByExam[exam]:null;
    if(!baseline||baseline.schemaVersion!==1||!cutScores||baseline.scope!=='provided-original-records'||baseline.approved!==true||!new RegExp('^'+exam+'-[a-f0-9]{64}$').test(baseline.version)||!Array.isArray(baseline.rows)||!baseline.rows.length)throw new Error('INVALID_BASELINE');
    const ids=new Set(),rows=baseline.rows;
    rows.forEach(row=>{
      if(!row||typeof row.id!=='string'||!row.id||ids.has(row.id)||typeof row.score!=='number'||!Number.isFinite(row.score)||scoreOf(row.ox)!==row.score)throw new Error('INVALID_BASELINE');
      ids.add(row.id);
    });
    if(!Array.isArray(requestedScores)||!requestedScores.length||requestedScores.length>16||requestedScores.some(s=>typeof s!=='number'||!Number.isFinite(s)||s<0||s>100||Math.abs(s*10-Math.round(s*10))>1e-8))throw new Error('INVALID_SCORES');
    const scores=[...new Set(requestedScores.concat(cutScores))],percentiles={};
    scores.forEach(score=>{percentiles[String(Math.round(score*10))]=round(Math.min(rows.length,rows.filter(r=>r.score>score).length+1)/rows.length*100);});
    const rate={};points.forEach((_,i)=>{rate[i+1]=rows.filter(r=>r.ox[i]==='O').length/rows.length;});
    // Only derived rates and requested percentiles leave the server. No source
    // location, participant count, raw score list, identities, ranks or flags.
    return {schemaVersion:1,exam,status:'verified-snapshot',scope:baseline.scope,version:baseline.version,
      mean:round(rows.reduce((s,r)=>s+Math.round(r.score*10),0)/rows.length/10),rate,percentiles};
  }
  const api={createResponse,scoreOf,cutScoresByExam};root.GFIELD_POPULATION_CORE=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
