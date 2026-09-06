(function(root){
  'use strict';
  var current=null;
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  async function load(student,round,ox,slot,record,preview){
    current={student:student,exam:'final'+round,slot:slot,canEdit:false,comment:'',commentUpdatedAt:null,snapshot:null,error:false,preview:preview};
    var target=current;
    if(preview)return target;
    try{
      var data=await root.GFIELD_AUTH.functionCall('hs-final-population',{action:record?'record-report':'read-report',exam:target.exam,student:student},slot);
      if(current!==target)return null;
      target.canEdit=data.canEdit===true;target.comment=typeof data.comment==='string'?data.comment:'';
      target.commentUpdatedAt=data.commentUpdatedAt||null;
      if(data.resultOx===ox&&data.snapshot)target.snapshot=data.snapshot;
    }catch(e){target.error=true;}
    return target;
  }
  function render(){
    if(!current)return '';
    var edit=current.canEdit;
    if(!edit&&!current.comment&&!current.preview&&current.slot!=='admin')return '';
    return '<section class="report-docssam-note" aria-labelledby="docssam-note-title"><h2 id="docssam-note-title">docssam 코멘트</h2><div class="docssam-saved-comment"'+(!current.comment?' hidden':'')+'>'+esc(current.comment).replace(/\n/g,'<br>')+'</div>'+(edit?'<div class="docssam-editor no-print"><label for="docssam-comment">수업에서 살펴본 모습과 다음 학습 조언</label><textarea id="docssam-comment" maxlength="3000" rows="4" placeholder="풀이 습관, 잘한 점, 다음에 함께 연습할 내용을 적어 주세요.">'+esc(current.comment)+'</textarea><button type="button" id="docssam-comment-save">코멘트 저장</button><span id="docssam-comment-status" role="status" aria-live="polite"></span></div>':(!current.comment?'<p class="lead no-print">'+(current.preview?'미리보기에서는 코멘트를 저장하지 않습니다.':'코멘트를 불러오지 못했습니다. 관리자 로그인을 확인해 주세요.')+'</p>':''))+'</section>';
  }
  function wire(container){
    var button=container.querySelector('#docssam-comment-save');if(!button||!current||!current.canEdit)return;
    var target=current,input=container.querySelector('#docssam-comment'),status=container.querySelector('#docssam-comment-status');
    button.onclick=async function(){
      if(current!==target)return;
      button.disabled=true;status.textContent='저장 중…';
      try{
        var response=await root.GFIELD_AUTH.functionCall('hs-final-population',{action:'save-comment',exam:target.exam,student:target.student,comment:input.value,expectedUpdatedAt:target.commentUpdatedAt},target.slot);
        if(current!==target)return;
        target.comment=response.comment;target.commentUpdatedAt=response.updatedAt;
        var saved=container.querySelector('.docssam-saved-comment');saved.textContent=response.comment;saved.hidden=!response.comment;
        status.textContent='저장했습니다.';
      }catch(e){status.textContent=e.code==='COMMENT_CONFLICT'?'다른 곳에서 수정된 코멘트가 있습니다. 입력 내용을 복사해 두고 다시 열어 주세요.':'저장하지 못했습니다. 입력 내용은 그대로 두었습니다.';}
      finally{button.disabled=false;}
    };
  }
  root.GFIELD_FINAL_REPORT_STATE={load:load,render:render,wire:wire};
})(window);
