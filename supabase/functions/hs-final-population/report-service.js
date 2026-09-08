(function(root){
  'use strict';
  const allowed=new Set(['read-report','record-report','apply-percentiles','save-comment']);
  function fail(code,status){const error=new Error(code);error.status=status;throw error;}
  function validResult(row,core){
    if(!row||row.source==='reset'||typeof row.ox!=='string'||!/^[OX]{30}$/.test(row.ox)||row.score==null||row.score==='')return false;
    return Math.abs(core.scoreOf(row.ox)-Number(row.score))<1e-7&&Number(row.wrong)===[...row.ox].filter(v=>v==='X').length;
  }
  function frozenSnapshot(core,baseline,score){
    const value=core.createResponse(baseline,[score]);
    Object.keys(value.rate).forEach(k=>{value.rate[k]=Math.round(value.rate[k]*1000)/1000;});
    return value;
  }
  function baselineFor(source,exam){
    if(source&&source.exam) return source.exam===exam?source:null;
    return source&&source[exam]||null;
  }
  async function handle(service,account,user,body,core,baselines){
    const action=body.action;
    if(!allowed.has(action))fail('INVALID_REQUEST',400);
    const keys=action==='apply-percentiles'?['action','exam']:action==='save-comment'?['action','exam','student','comment','expectedUpdatedAt']:['action','exam','student'];
    if(Object.keys(body).some(k=>!keys.includes(k))||!/^final[1-5]$/.test(body.exam||''))fail('INVALID_REQUEST',400);
    const baseline=baselineFor(baselines,body.exam);
    const teacher=['admin','teacher'].includes(account.role);
    if((action==='apply-percentiles'||action==='save-comment')&&!teacher)fail('ACCESS_DENIED',403);
    if(action==='apply-percentiles'){
      if(!baseline)fail('REFERENCE_NOT_READY',409);
      // Freeze the approved reference once. Applying results cannot update rates.
      const reference=frozenSnapshot(core,baseline,0);
      const {error:refError}=await service.from('hs_final_report_references').upsert({exam:body.exam,version:baseline.version,reference},{onConflict:'exam',ignoreDuplicates:true});
      if(refError)fail('SAVE_FAILED',503);
      const {data:ref,error:readError}=await service.from('hs_final_report_references').select('version').eq('exam',body.exam).single();
      if(readError||ref.version!==baseline.version)fail('REFERENCE_CHANGED',409);
      let incomplete=false;
      for(let start=0;;start+=500){
        const {data:rows,error}=await service.from('mock_results').select('student,round,ox,score,wrong,source').eq('round',body.exam).order('student').range(start,start+499);
        if(error)fail('SAVE_FAILED',503);
        const snapshots=[];
        for(const row of rows||[]){
          if(!validResult(row,core)){if(row.source!=='reset')incomplete=true;continue;}
          snapshots.push({student:row.student,round:body.exam,result_ox:row.ox,result_score:core.scoreOf(row.ox),snapshot:frozenSnapshot(core,baseline,core.scoreOf(row.ox)),applied_at:new Date().toISOString()});
        }
        if(snapshots.length){const {error:saveError}=await service.from('hs_final_report_snapshots').upsert(snapshots,{onConflict:'student,round'});if(saveError)fail('SAVE_FAILED',503);}
        if(!rows||rows.length<500)break;
      }
      return {applied:true,incomplete};
    }
    if(typeof body.student!=='string'||!body.student.trim()||body.student.length>120)fail('INVALID_REQUEST',400);
    // Identity comes from the verified account, never URL/name alone.
    if(!teacher&&body.student!==account.student)fail('ACCESS_DENIED',403);
    const {data:result,error:resultError}=await service.from('mock_results').select('student,round,ox,score,wrong,source,owner_id').eq('student',body.student).eq('round',body.exam).maybeSingle();
    if(resultError)fail('READ_FAILED',503);
    if(result&&!teacher&&result.owner_id&&result.owner_id!==user.id)fail('ACCESS_DENIED',403);
    const hasResult=result&&result.source!=='reset'&&/^[OX]{30}$/.test(result.ox||'');
    if(action==='save-comment'){
      if(!hasResult)fail('RESULT_NOT_FOUND',409);
      if(typeof body.comment!=='string'||body.comment.length>3000||!(body.expectedUpdatedAt===null||typeof body.expectedUpdatedAt==='string'))fail('INVALID_REQUEST',400);
      const row={student:body.student,round:body.exam,comment:body.comment.trim(),updated_by:user.id,updated_at:new Date().toISOString()};
      const q=service.from('hs_final_report_comments');
      const saved=body.expectedUpdatedAt===null?await q.insert(row).select('comment,updated_at').single():await q.update(row).eq('student',body.student).eq('round',body.exam).eq('updated_at',body.expectedUpdatedAt).select('comment,updated_at').maybeSingle();
      if(saved.error||!saved.data)fail('COMMENT_CONFLICT',409);
      return {comment:saved.data.comment,updatedAt:saved.data.updated_at};
    }
    const {data:comment,error:commentError}=await service.from('hs_final_report_comments').select('comment,updated_at').eq('student',body.student).eq('round',body.exam).maybeSingle();
    if(commentError)fail('READ_FAILED',503);
    const response={canEdit:teacher,comment:hasResult?comment?.comment||'':'',commentUpdatedAt:hasResult?comment?.updated_at||null:null,snapshot:null,resultOx:null};
    if(!baseline||!validResult(result,core))return response;
    if(action==='record-report'){
      const snapshot=frozenSnapshot(core,baseline,core.scoreOf(result.ox));
      const {error}=await service.from('hs_final_report_snapshots').upsert({student:body.student,round:body.exam,result_ox:result.ox,result_score:core.scoreOf(result.ox),snapshot,applied_at:new Date().toISOString()},{onConflict:'student,round'});
      if(error)fail('SAVE_FAILED',503);
    }
    const {data:saved,error}=await service.from('hs_final_report_snapshots').select('result_ox,result_score,snapshot').eq('student',body.student).eq('round',body.exam).maybeSingle();
    if(error)fail('READ_FAILED',503);
    // Ignore a snapshot when a result was reset/replaced while applying.
    if(saved&&saved.result_ox===result.ox&&Number(saved.result_score)===core.scoreOf(result.ox)&&saved.snapshot?.version===baseline.version){response.snapshot=saved.snapshot;response.resultOx=result.ox;}
    return response;
  }
  const api={handle,validResult,frozenSnapshot};root.GFIELD_REPORT_SERVICE=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
