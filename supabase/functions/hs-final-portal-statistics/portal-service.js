(function(root){
  'use strict';
  function fail(code,status){const error=new Error(code);error.status=status;throw error;}
  function baselineFor(source,exam){return source&&source[exam]||null;}
  function validResult(row,core){
    if(!row||row.source==='reset'||typeof row.ox!=='string'||!/^[OX]{30}$/.test(row.ox)||row.score==null||row.score==='')return false;
    return Math.abs(core.scoreOf(row.ox)-Number(row.score))<1e-7&&Number(row.wrong)===[...row.ox].filter(v=>v==='X').length;
  }
  async function handle(service,body,core,baselines){
    const keys=['exam','student','resultOx'];
    if(!body||Object.keys(body).some(key=>!keys.includes(key))||Object.keys(body).length!==keys.length||!/^final[1-4]$/.test(body.exam||''))fail('INVALID_REQUEST',400);
    if(typeof body.student!=='string'||!body.student.trim()||body.student.length>120||typeof body.resultOx!=='string'||!/^[OX]{30}$/.test(body.resultOx))fail('INVALID_REQUEST',400);
    const baseline=baselineFor(baselines,body.exam);
    if(!baseline)fail('REFERENCE_NOT_READY',409);
    const {data:result,error}=await service.from('mock_results').select('student,round,ox,score,wrong,source').eq('student',body.student).eq('round',body.exam).maybeSingle();
    if(error)fail('READ_FAILED',503);
    if(!validResult(result,core)||result.ox!==body.resultOx)fail('RESULT_NOT_FOUND',404);
    return {snapshot:core.createResponse(baseline,[core.scoreOf(result.ox)])};
  }
  const api={handle,validResult};root.GFIELD_PORTAL_STATISTICS=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
