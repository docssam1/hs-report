(function(root){
  'use strict';
  var current=null;
  var reportReadCache=new Map();
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var signatureFields=[['lesson','수업에서 확인한 모습'],['habit','풀이 습관'],['strength','장점'],['growth','보완할 점'],['caution','주의 사항'],['recommendation','추천 지도'],['examStrategy','시험 운영·타이머 활용']];
  var cacheKey=function(student,round,slot,series){return [student,(series||'final')+round,slot].join('\n');};
  async function load(student,round,ox,slot,record,preview,series){
    var kind=series==='original'?'original':'final';
    current={student:student,exam:kind+round,slot:slot,canEdit:false,comment:'',commentUpdatedAt:null,snapshot:null,error:false,preview:preview};
    var target=current;
    if(preview)return target;
    try{
      var key=cacheKey(student,round,slot,kind);
      var cached=!record&&reportReadCache.has(key)?reportReadCache.get(key):null;
      reportReadCache.delete(key);
      var data=cached
        ?cached
        :await root.GFIELD_AUTH.functionCall('hs-final-population',{action:record?'record-report':'read-report',exam:target.exam,student:student},slot);
      if(current!==target)return null;
      target.canEdit=data.canEdit===true;target.comment=typeof data.comment==='string'?data.comment:'';
      target.commentUpdatedAt=data.commentUpdatedAt||null;
      if(data.resultOx===ox&&data.snapshot)target.snapshot=data.snapshot;
    }catch(e){target.error=true;}
    return target;
  }
  async function loadSnapshot(student,round,ox,slot){
    try{
      var data=await root.GFIELD_AUTH.functionCall('hs-final-population',{action:'read-report',exam:'final'+round,student:student},slot);
      reportReadCache.set(cacheKey(student,round,slot),data);
      return data&&data.resultOx===ox&&data.snapshot?data.snapshot:null;
    }catch(e){return null;}
  }
  function signatureParts(comment){
    try{
      var parsed=JSON.parse(comment);
      if(parsed&&parsed.schema==='signature-teacher-comment-v1'&&parsed.fields&&typeof parsed.fields==='object')return parsed.fields;
    }catch(e){}
    return {};
  }
  function signatureSaved(comment){
    if(!comment)return '';
    var fields=signatureParts(comment);
    var rows=signatureFields.filter(function(pair){return typeof fields[pair[0]]==='string'&&fields[pair[0]].trim();});
    if(!rows.length)return comment.includes('"signature-teacher-comment-v1"')?'':'<p>'+esc(comment)+'</p>';
    return '<div class="docssam-field-grid">'+rows.map(function(pair){return '<div class="docssam-field"><h3>'+pair[1]+'</h3><p>'+esc(fields[pair[0]]).replace(/\n/g,'<br>')+'</p></div>';}).join('')+'</div>';
  }
  function renderSignature(){
    var edit=current.canEdit,fields=signatureParts(current.comment);
    if(!edit&&!current.comment&&current.slot!=='admin')return '';
    var editor=edit?'<div class="docssam-editor no-print"><p class="lead">수업·시험지에서 확인한 사실만 적으세요. 확인하지 못한 항목은 비워 두고, 타이머는 정답 기준이 아닌 흔들림을 줄이는 참고 도구로 안내하세요.</p><div class="docssam-field-grid">'+signatureFields.map(function(pair){return '<label class="docssam-field">'+pair[1]+'<textarea data-docssam-field="'+pair[0]+'" maxlength="380" rows="3" placeholder="관찰한 사실 또는 지도할 내용을 적어 주세요.">'+esc(fields[pair[0]]||'')+'</textarea></label>';}).join('')+'</div><button type="button" id="docssam-comment-save">코멘트 저장</button><span id="docssam-comment-status" role="status" aria-live="polite"></span></div>':'';
    return '<section class="report-docssam-note report-docssam-signature" aria-labelledby="docssam-note-title"><h2 id="docssam-note-title">독샘 코멘트</h2><div class="docssam-saved-comment"'+(!current.comment?' hidden':'')+'>'+signatureSaved(current.comment)+'</div>'+editor+(current.error?'<p class="lead no-print">코멘트를 불러오지 못했습니다. 로그인과 연결 상태를 확인해 주세요.</p>':'')+'</section>';
  }
  function signatureSummary(){
    if(!current||current.preview||!/^original[12]$/.test(current.exam)||!current.comment)return '';
    var fields=signatureParts(current.comment);
    var keys=['strength','recommendation','examStrategy'];
    var selected=keys.map(function(key){return signatureFields.find(function(pair){return pair[0]===key;});}).filter(function(pair){return pair&&typeof fields[pair[0]]==='string'&&fields[pair[0]].trim();});
    if(!selected.length)selected=signatureFields.filter(function(pair){return typeof fields[pair[0]]==='string'&&fields[pair[0]].trim();}).slice(0,2);
    if(!selected.length)return '';
    return '<div class="docssam-summary"><h2>독샘 한눈에 보기</h2>'+selected.map(function(pair){return '<p><b>'+pair[1]+'</b> · '+esc(fields[pair[0]]).replace(/\n/g,'<br>')+'</p>';}).join('')+'</div>';
  }
  function render(){
    if(!current||current.preview)return '';
    if(/^original[12]$/.test(current.exam))return renderSignature();
    var edit=current.canEdit;
    if(!edit&&!current.comment&&current.slot!=='admin')return '';
    return '<section class="report-docssam-note" aria-labelledby="docssam-note-title"><h2 id="docssam-note-title">docssam 코멘트</h2><div class="docssam-saved-comment"'+(!current.comment?' hidden':'')+'>'+esc(current.comment).replace(/\n/g,'<br>')+'</div>'+(edit?'<div class="docssam-editor no-print"><label for="docssam-comment">수업에서 살펴본 모습과 다음 학습 조언</label><textarea id="docssam-comment" maxlength="3000" rows="4" placeholder="풀이 습관, 잘한 점, 다음에 함께 연습할 내용을 적어 주세요.">'+esc(current.comment)+'</textarea><button type="button" id="docssam-comment-save">코멘트 저장</button><span id="docssam-comment-status" role="status" aria-live="polite"></span></div>':(!current.comment?'<p class="lead no-print">코멘트를 불러오지 못했습니다. 관리자 로그인을 확인해 주세요.</p>':''))+'</section>';
  }
  function wire(container){
    var button=container.querySelector('#docssam-comment-save');if(!button||!current||!current.canEdit)return;
    var target=current,input=container.querySelector('#docssam-comment'),status=container.querySelector('#docssam-comment-status');
    button.onclick=async function(){
      if(current!==target)return;
      var fields=input?null:Object.fromEntries(signatureFields.map(function(pair){var node=container.querySelector('[data-docssam-field="'+pair[0]+'"]');return [pair[0],node?node.value.trim():''];}));
      var comment=input?input.value:(Object.values(fields).some(Boolean)?JSON.stringify({schema:'signature-teacher-comment-v1',fields:fields}):'');
      if(comment.length>3000){status.textContent='코멘트가 너무 깁니다. 각 항목을 조금 줄여 주세요.';return;}
      button.disabled=true;status.textContent='저장 중…';
      try{
        var response=await root.GFIELD_AUTH.functionCall('hs-final-population',{action:'save-comment',exam:target.exam,student:target.student,comment:comment,expectedUpdatedAt:target.commentUpdatedAt},target.slot);
        if(current!==target)return;
        target.comment=response.comment;target.commentUpdatedAt=response.updatedAt;
        var saved=container.querySelector('.docssam-saved-comment');
        if(input)saved.textContent=response.comment;else saved.innerHTML=signatureSaved(response.comment);
        saved.hidden=!response.comment;
        if(!input){var summary=container.querySelector('[data-docssam-summary]');if(summary)summary.innerHTML=signatureSummary();}
        status.textContent='저장했습니다.';
      }catch(e){status.textContent=e.code==='COMMENT_CONFLICT'?'다른 곳에서 수정된 코멘트가 있습니다. 입력 내용을 복사해 두고 다시 열어 주세요.':'저장하지 못했습니다. 입력 내용은 그대로 두었습니다.';}
      finally{button.disabled=false;}
    };
  }
  root.GFIELD_FINAL_REPORT_STATE={load:load,loadSnapshot:loadSnapshot,render:render,summary:signatureSummary,wire:wire};
})(window);
