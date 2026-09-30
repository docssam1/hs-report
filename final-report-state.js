(function(root){
  'use strict';
  var current=null;
  var reportReadCache=new Map();
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var signatureFields=[['lesson','수업에서 확인한 모습'],['habit','풀이 습관'],['strength','장점'],['growth','보완할 점'],['caution','주의 사항'],['recommendation','추천 지도'],['examStrategy','시험 중 행동·운영'],['timerUse','타이머 활용'],['paperEvidence','시험지에서 확인한 풀이']];
  var signatureProfiles=[
    {id:'mock-practice',title:'모의고사 실전량 보강',advice:'짧은 유형 연습과 실전 한 회를 번갈아 하며, 문제 선택·복귀 과정을 점검합니다.',check:'다음 실전에서 처음 표시한 문항과 다시 돌아온 문항을 기록합니다.'},
    {id:'condition-practice',title:'조건 바꿔 적용하는 연습',advice:'구할 것과 달라진 조건을 표시한 뒤 같은 유형의 새 조건에 풀이를 적용합니다.'},
    {id:'mental-only',title:'눈으로만 풀지 않고 흔적 남기기',advice:'답을 쓰기 전 기준·식·그림 중 한 가지를 시험지에 남기는 연습을 합니다.'},
    {id:'calculation-check',title:'식은 잘 쓰지만 계산 점검 필요',advice:'맞게 세운 식의 숫자·자리·연산을 다시 계산하고 답과 비교합니다.'},
    {id:'answer-format',title:'합·개수·단위 등 답 형식 확인',advice:'합·개수·단위 등 무엇을 쓰라는 물음인지 마지막 줄과 대조합니다.'},
    {id:'puzzle-strength',title:'퍼즐형 풀이 강점',advice:'잘 푼 규칙·배치 방법을 말이나 그림으로 설명하고 조건이 바뀐 문제에 적용합니다.',check:'다음 퍼즐형 문항에서 찾은 규칙을 한 줄로 설명할 수 있는지 확인합니다.',strength:true},
    {id:'start-delay',title:'시작을 오래 망설임',advice:'구할 것에 밑줄을 긋고 첫 그림이나 식 한 줄을 적는 짧은 시작 연습을 합니다.',check:'다음 시험에서 첫 풀이 흔적까지 걸린 시간을 기록합니다.'},
    {id:'answer-indecision',title:'답을 결정·제출하기 어려움',advice:'현재 풀이의 근거를 한 줄로 확인하고 답을 정한 뒤 표시하고 넘어갑니다.',check:'풀고도 답을 못 쓴 문항 수를 다음 시험지에서 확인합니다.'},
    {id:'skip-return',title:'건너뛴 문제 표시·복귀 훈련',advice:'건너뛴 번호에 표시하고 남은 시간에 표시한 번호부터 다시 확인합니다.',check:'표시 없이 건너뛴 문항과 표시 후 돌아온 문항을 구분해 셉니다.'},
    {id:'stamina-context',title:'후반 집중·주변 상황 점검',advice:'짧은 집중 구간부터 늘리고, 다른 학생의 진도보다 자신의 표시·풀이 순서를 따릅니다.',check:'다음 연습에서 후반 오답·미응답과 주변을 본 순간을 따로 기록합니다.'},
    {id:'transfer-repeat',title:'1·2회 공통 유형 전이 확인',advice:'같은 구조에서 바뀐 조건을 표시하고 처음부터 다시 풀어 봅니다.',check:'두 회차 공통 유형의 재풀이에서 조건·식·답이 모두 맞는지 확인합니다.'}
  ];
  var profileSuggestionPatterns={
    'mental-only':/식 없이|눈으로만|암산으로만/,
    'calculation-check':/계산.{0,8}(실수|오류|틀)|식.{0,8}(맞|정확).{0,8}계산/,
    'answer-format':/합.{0,8}각각|단위.{0,8}(틀|잘못)|답.{0,3}형식/,
    'puzzle-strength':/퍼즐.{0,8}(잘|강점)|규칙.{0,8}(잘|강점)/,
    'start-delay':/시작.{0,8}(오래|못|늦)|첫.{0,6}(시작|풀이).{0,8}오래/,
    'answer-indecision':/불확실|결정.{0,5}못|답.{0,8}망설/,
    'skip-return':/건너.{0,8}표시|넘어.{0,8}표시|돌아.{0,5}풀|복귀/,
    'stamina-context':/지침|피로|주변 상황|다른 친구|후반.{0,6}집중/,
    'transfer-repeat':/1회.{0,30}2회|반복.{0,8}(오답|유형)|같은 유형/
  };
  var signatureHints={
    paperEvidence:'원문 번호와 시험지에 실제 남은 식·그림·수정 흔적을 적어 주세요. 식이 없거나 글씨 판독이 어려운 경우도 확인한 문항만 기록합니다.',
    habit:'식 없이 답만 쓴 문항, 시작을 오래 망설인 문항 등 반복해서 관찰한 행동과 번호를 적어 주세요.',
    growth:'실수가 시작된 단계(조건 읽기·기준 선택·식·계산·답 형식)를 확인한 문항과 함께 적어 주세요.',
    caution:'숫자·부호가 불명확해 풀이를 다시 읽기 어려운 위험은 실제 시험지에서 확인한 경우에만 적어 주세요.',
    recommendation:'그림과 문장의 기준, 순서·예외·누적 변화, 검산 중 필요한 연습을 구체적인 원문 번호와 연결해 주세요.',
    examStrategy:'시작 5분에 풀 수 있는 문항 번호를 연필 ★·○·✓로 표시했는지, 건너뛴 문항을 표시하고 돌아왔는지 등 실제 시험지·관찰 근거와 번호를 적어 주세요. 타이머 이야기는 별도 칸에 적습니다.',
    timerUse:'타이머를 보고 실제로 달라진 행동이나 도움이 된 점·방해된 점이 확인된 경우에만 적어 주세요.'
  };
  var cacheKey=function(student,round,slot,series){return [student,(series||'final')+round,slot].join('\n');};
  async function readNamedSignatureComment(student,exam){
    var config=root.GFIELD_AUTH;
    var url=config.SUPABASE_URL+'/rest/v1/hs_final_report_comments?select=comment,updated_at&student=eq.'+encodeURIComponent(student)+'&round=eq.'+encodeURIComponent(exam);
    var response=await fetch(url,{headers:{apikey:config.PUBLISHABLE_KEY,Authorization:'Bearer '+config.PUBLISHABLE_KEY,'x-gfield-student':btoa(unescape(encodeURIComponent(student)))}});
    if(!response.ok)throw new Error('코멘트 조회 실패');
    var rows=await response.json();
    return {canEdit:false,comment:rows[0]&&rows[0].comment||'',commentUpdatedAt:rows[0]&&rows[0].updated_at||null,snapshot:null,resultOx:null};
  }
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
        :kind==='original'&&slot!=='admin'
          ?await readNamedSignatureComment(student,target.exam)
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
      if(parsed&&parsed.schema==='signature-teacher-comment-v1'&&parsed.fields&&typeof parsed.fields==='object'){
        var fields=Object.assign({},parsed.fields);
        if(!fields.timerUse&&typeof fields.examStrategy==='string'&&/타이머/.test(fields.examStrategy)&&!/문항|문제|건너|넘기|되돌|복귀|검산|답안|시험지|주변|풀이/.test(fields.examStrategy)){
          fields.timerUse=fields.examStrategy;fields.examStrategy='';
        }
        return fields;
      }
    }catch(e){}
    return typeof comment==='string'&&comment.trim()?{lesson:comment.trim()}:{};
  }
  function profileRows(fields){
    var saved=Array.isArray(fields.profileSignals)?fields.profileSignals:[];
    return signatureProfiles.map(function(profile){
      var record=saved.find(function(row){return row&&row.id===profile.id&&typeof row.evidence==='string'&&row.evidence.trim();});
      return record?{id:profile.id,title:profile.title,advice:profile.advice,check:profile.check||'다음 풀이에서 같은 실수가 반복되는지 시험지로 확인합니다.',strength:profile.strength===true,evidence:record.evidence.trim()}:null;
    }).filter(Boolean);
  }
  function profilePriorityRows(fields){
    var rows=profileRows(fields),priority=fields.profilePriority;
    return rows.sort(function(a,b){return Number(b.id===priority)-Number(a.id===priority);});
  }
  function profileSummaryRows(fields){
    var rows=profilePriorityRows(fields),strength=rows.find(function(row){return row.strength;});
    var result=rows.filter(function(row){return !row.strength;}).slice(0,strength?2:3);
    if(strength)result.push(strength);
    return result;
  }
  function suggestedEvidence(fields,id){
    var pattern=profileSuggestionPatterns[id];if(!pattern)return '';
    var keys=id==='puzzle-strength'?['strength','lesson']:['paperEvidence','examStrategy','habit','growth','caution','lesson'];
    for(var i=0;i<keys.length;i++){
      var lines=String(fields[keys[i]]||'').split(/[\n。]/);
      var match=lines.find(function(line){return pattern.test(line);});
      if(match)return match.trim().slice(0,150);
    }
    return '';
  }
  function profilePlan(){
    if(!current||!/^original[12]$/.test(current.exam))return null;
    var fields=signatureParts(current.comment),rows=profilePriorityRows(fields);
    if(!rows.length)return null;
    var priority=rows[0],numbers=[];
    rows.forEach(function(row){var matches=row.evidence.matchAll(/(?:^|\D)([1-9]|[12]\d|30)\s*번/g);for(var match of matches){var no=Number(match[1]);if(numbers.indexOf(no)<0)numbers.push(no);}});
    return {priority:priority,rows:rows,numbers:numbers,needsMock:rows.some(function(row){return row.id==='mock-practice'||row.id==='skip-return';}),needsShortBlocks:rows.some(function(row){return row.id==='stamina-context'||row.id==='start-delay';})};
  }
  function profileResults(fields,summary){
    var rows=profileRows(fields);
    if(!rows.length)return '';
    if(summary)rows=profileSummaryRows(fields);
    return '<div class="signature-profile-results"><h3>확인된 풀이 경향'+(fields.profilePriority?' · 교사 지정 우선 항목 포함':'')+'</h3>'+rows.map(function(row){return '<p><b>'+(row.id===fields.profilePriority?'이번 주 우선 · ':'')+esc(row.title)+'</b> · '+esc(row.evidence).replace(/\n/g,'<br>')+'<br><span>추천 연습 · '+esc(row.advice)+'</span>'+(summary?'<br><span>다음 확인 · '+esc(row.check)+'</span>':'')+'</p>';}).join('')+'<small>교사가 시험지·수업에서 직접 확인한 기록입니다. 정오나 점수만으로 판별한 성격·능력 유형이 아닙니다.</small></div>';
  }
  function signatureSaved(comment){
    if(!comment)return '';
    var fields=signatureParts(comment);
    var rows=signatureFields.filter(function(pair){return typeof fields[pair[0]]==='string'&&fields[pair[0]].trim();});
    if(!rows.length&&!profileRows(fields).length)return comment.includes('"signature-teacher-comment-v1"')?'':'<p>'+esc(comment)+'</p>';
    return '<div class="docssam-field-grid">'+rows.map(function(pair){return '<div class="docssam-field"><h3>'+pair[1]+'</h3><p>'+esc(fields[pair[0]]).replace(/\n/g,'<br>')+'</p></div>';}).join('')+'</div>'+profileResults(fields,false);
  }
  function renderSignature(){
    var edit=current.canEdit,fields=signatureParts(current.comment);
    if(!edit&&!current.comment&&current.slot!=='admin')return '';
    var profiles=profileRows(fields);
    var profileEditor='<fieldset class="signature-profile-editor"><legend>확인된 풀이 경향 선택</legend><p class="lead">실제 시험지나 수업 관찰에서 확인한 것만 선택하세요. 이번 주 우선 항목을 하나 지정할 수 있습니다. 기존 코멘트에서 찾은 문장은 선택 전 참고일 뿐 자동 진단이 아닙니다.</p><div class="signature-profile-options">'+signatureProfiles.map(function(profile){var saved=profiles.find(function(row){return row.id===profile.id;}),suggestion=!saved?suggestedEvidence(fields,profile.id):'';return '<div class="signature-profile-option"><label><input type="checkbox" data-signature-profile="'+profile.id+'"'+(saved?' checked':'')+'> '+esc(profile.title)+'</label><label class="signature-priority-label"><input type="radio" name="signature-profile-priority" value="'+profile.id+'"'+(fields.profilePriority===profile.id?' checked':'')+'> 이번 주 우선</label><textarea data-signature-profile-evidence="'+profile.id+'" maxlength="150" rows="2" placeholder="확인한 원문 번호 또는 관찰 상황">'+esc(saved?saved.evidence:suggestion)+'</textarea>'+(suggestion?'<small>기존 코멘트에서 찾은 문장 · 확인 후 선택</small>':'')+'</div>';}).join('')+'</div></fieldset>';
    var editor=edit?'<div class="docssam-editor no-print"><p class="lead">시험 중 행동은 실제 관찰과 시험지 근거로 기록하고, 타이머 사용은 별도 칸에 적으세요. 확인하지 못한 항목은 비워 둡니다.</p><div class="docssam-field-grid">'+signatureFields.map(function(pair){return '<label class="docssam-field">'+pair[1]+'<textarea data-docssam-field="'+pair[0]+'" maxlength="380" rows="3" placeholder="'+esc(signatureHints[pair[0]]||'관찰한 사실 또는 지도할 내용을 적어 주세요.')+'">'+esc(fields[pair[0]]||'')+'</textarea></label>';}).join('')+'</div>'+profileEditor+'<button type="button" id="docssam-comment-save">코멘트 저장</button><span id="docssam-comment-status" role="status" aria-live="polite"></span></div>':'';
    return '<section class="report-docssam-note report-docssam-signature" aria-labelledby="docssam-note-title"><h2 id="docssam-note-title">독샘 코멘트</h2><div class="docssam-saved-comment"'+(!current.comment?' hidden':'')+'>'+signatureSaved(current.comment)+'</div>'+editor+(current.error?'<p class="lead no-print">코멘트를 불러오지 못했습니다. 로그인과 연결 상태를 확인해 주세요.</p>':'')+'</section>';
  }
  function signatureSummary(){
    if(!current||current.preview||!/^original[12]$/.test(current.exam)||!current.comment)return '';
    var fields=signatureParts(current.comment);
    var keys=['paperEvidence','habit','growth','caution','recommendation','examStrategy','strength','lesson'];
    var selected=keys.map(function(key){return signatureFields.find(function(pair){return pair[0]===key;});}).filter(function(pair){return pair&&typeof fields[pair[0]]==='string'&&fields[pair[0]].trim();}).slice(0,4);
    if(!selected.length&&!profileRows(fields).length)return '';
    return '<div class="docssam-summary"><h2>독샘의 시험지·수업 관찰</h2>'+selected.map(function(pair){return '<p><b>'+pair[1]+'</b> · '+esc(fields[pair[0]]).replace(/\n/g,'<br>')+'</p>';}).join('')+profileResults(fields,true)+'</div>';
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
      if(fields){
        var missingEvidence=false;
        fields.profileSignals=signatureProfiles.map(function(profile){
          var selected=container.querySelector('[data-signature-profile="'+profile.id+'"]');
          if(!selected||!selected.checked)return null;
          var evidenceNode=container.querySelector('[data-signature-profile-evidence="'+profile.id+'"]');
          var evidence=evidenceNode?evidenceNode.value.trim():'';
          if(!evidence)missingEvidence=true;
          return evidence?{id:profile.id,evidence:evidence}:null;
        }).filter(Boolean);
        if(missingEvidence){status.textContent='선택한 풀이 경향마다 확인한 문항 번호나 관찰 상황을 적어 주세요.';return;}
        var priorityNode=container.querySelector('[name="signature-profile-priority"]:checked');
        fields.profilePriority=priorityNode?priorityNode.value:'';
        if(fields.profilePriority&&!fields.profileSignals.some(function(row){return row.id===fields.profilePriority;})){status.textContent='이번 주 우선 항목은 선택한 풀이 경향 중에서 지정해 주세요.';return;}
      }
      var comment=input?input.value:(Object.values(fields).some(function(value){return Array.isArray(value)?value.length:!!value;})?JSON.stringify({schema:'signature-teacher-comment-v1',fields:fields}):'');
      if(comment.length>3000){status.textContent='코멘트가 너무 깁니다. 각 항목을 조금 줄여 주세요.';return;}
      button.disabled=true;status.textContent='저장 중…';
      try{
        var response=await root.GFIELD_AUTH.functionCall('hs-final-population',{action:'save-comment',exam:target.exam,student:target.student,comment:comment,expectedUpdatedAt:target.commentUpdatedAt},target.slot);
        if(current!==target)return;
        target.comment=response.comment;target.commentUpdatedAt=response.updatedAt;
        var saved=container.querySelector('.docssam-saved-comment');
        if(input)saved.textContent=response.comment;else saved.innerHTML=signatureSaved(response.comment);
        saved.hidden=!response.comment;
        if(!input){var summary=container.querySelector('[data-docssam-summary]');if(summary)summary.innerHTML=signatureSummary();if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('gfield-signature-comment-saved',{detail:{exam:target.exam,student:target.student}}));}
        status.textContent='저장했습니다.';
      }catch(e){status.textContent=e.code==='COMMENT_CONFLICT'?'다른 곳에서 수정된 코멘트가 있습니다. 입력 내용을 복사해 두고 다시 열어 주세요.':'저장하지 못했습니다. 입력 내용은 그대로 두었습니다.';}
      finally{button.disabled=false;}
    };
  }
  root.GFIELD_FINAL_REPORT_STATE={load:load,loadSnapshot:loadSnapshot,render:render,summary:signatureSummary,plan:profilePlan,wire:wire};
})(window);
