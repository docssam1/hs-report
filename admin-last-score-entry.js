/* Teacher-only manual O/X entry for the four October Last rounds and independent Final 8. */
(function(root){
  'use strict';
  var EXAMS=['last1','last2','last3','last4','final8'];
  var state={mounted:false,student:'',exam:'last1',correct:new Set(),loaded:false,existing:false,request:0};
  function node(id){return document.getElementById(id)}
  function points(no){return no<=12?2.7:(no<=22?3.4:4.2)}
  function totals(){var score=0;state.correct.forEach(function(no){score+=points(no)});return {score:Math.round(score*10)/10,correct:state.correct.size,wrong:30-state.correct.size}}
  function status(message,kind){var el=node('admin-last-status');if(el){el.textContent=message;el.dataset.state=kind||''}}
  function selection(){var student=node('admin-last-student'),exam=node('admin-last-round');state.student=student&&student.value||'';state.exam=exam&&exam.value||'last1'}
  function paint(){
    var grid=node('admin-last-grid'),summary=node('admin-last-summary'),quick=node('admin-last-correct-nos'),save=node('admin-last-save');
    if(!grid)return;
    grid.innerHTML='';
    for(var no=1;no<=30;no++){
      var button=document.createElement('button'),isCorrect=state.correct.has(no);
      button.type='button';button.dataset.no=String(no);button.dataset.mark=isCorrect?'O':'X';
      button.setAttribute('aria-label',no+'번 '+(isCorrect?'정답 O':'오답 X')+' · '+points(no).toFixed(1)+'점');
      button.setAttribute('aria-pressed',isCorrect?'true':'false');
      button.textContent=no+' '+(isCorrect?'O':'X');button.disabled=!state.loaded||state.existing;
      grid.appendChild(button);
    }
    var total=totals();
    if(summary)summary.textContent=state.loaded?('점수 '+total.score.toFixed(1)+'점 · 정답 '+total.correct+'/30 · 오답 '+total.wrong+'/30'):'기록을 불러오는 중입니다.';
    if(quick){quick.value=Array.from(state.correct).sort(function(a,b){return a-b}).join(', ');quick.disabled=!state.loaded||state.existing}
    if(save)save.disabled=!state.loaded||state.existing||!state.student;
    var apply=node('admin-last-apply');if(apply)apply.disabled=!state.loaded||state.existing;
  }
  function parseNumbers(raw){
    raw=String(raw||'').trim();if(!raw)return new Set();
    var result=new Set(),tokens=raw.split(/[\s,，、]+/).filter(Boolean);
    tokens.forEach(function(token){
      if(!/^\d{1,2}$/.test(token))throw new Error('번호는 쉼표나 띄어쓰기로 구분해 주세요.');
      var no=Number(token);if(no<1||no>30)throw new Error('문항 번호는 1~30입니다.');
      result.add(no);
    });
    return result;
  }
  async function load(){
    selection();var request=++state.request,student=state.student,exam=state.exam;
    state.correct=new Set();state.loaded=false;state.existing=false;paint();
    if(!student){status('학생을 먼저 선택해 주세요.','error');return}
    status(student+' · '+node('admin-last-round').selectedOptions[0].textContent+' 최초 기록 확인 중…');
    try{
      var result=await root.GFIELD_AUTH.functionCall('hs-admin-mock-result',{action:'get',student:student,exams:EXAMS},'admin');
      if(request!==state.request)return;
      var row=(result&&Array.isArray(result.rows)?result.rows:[]).find(function(item){return item.exam===exam});
      if(row){
        state.correct=new Set(String(row.ox||'').split('').map(function(mark,index){return mark==='O'?index+1:0}).filter(Boolean));
        state.existing=true;state.loaded=true;paint();
        status('최초 성적 '+Number(row.score).toFixed(1)+'점이 이미 저장되어 있습니다. 기존 기록을 덮어쓰지 않습니다.','saved');
      }else{state.loaded=true;paint();status('저장된 최초 성적이 없습니다. 맞은 번호만 O로 선택해 주세요.');}
    }catch(error){
      if(request!==state.request)return;
      state.loaded=false;paint();status('성적 기록을 확인하지 못했습니다. 다시 로그인하거나 새로고침해 주세요. ('+(error&&error.message||'연결 오류')+')','error');
    }
  }
  async function save(){
    if(!state.loaded||state.existing||!state.student)return;
    var student=state.student,exam=state.exam,total=totals();
    var warning=exam==='final8'?'\n최종 8회 정답·진단 자료의 공개 검수는 별도입니다. 지금은 선생님이 확인한 O/X만 기록합니다.':'';
    if(!root.confirm(student+' · '+node('admin-last-round').selectedOptions[0].textContent+' 최초 성적을 저장할까요?\n'+total.score.toFixed(1)+'점 · 정답 '+total.correct+'개 · 오답/미응답 '+total.wrong+'개\n최초 성적은 일반 저장으로 덮어쓰지 않습니다.'+warning))return;
    var ox=Array.from({length:30},function(_,index){return state.correct.has(index+1)?'O':'X'}).join('');
    var saveButton=node('admin-last-save');saveButton.disabled=true;status('최초 성적을 저장하고 있습니다…');
    try{
      var result=await root.GFIELD_AUTH.functionCall('hs-admin-mock-result',{action:'save-first',student:student,exam:exam,ox:ox},'admin');
      if(!result||result.saved!==true||result.exam!==exam||result.student!==student||result.ox!==ox||Math.abs(Number(result.score)-total.score)>.001)throw new Error('저장 결과가 입력과 일치하지 않습니다.');
      state.existing=true;paint();status('최초 성적 '+total.score.toFixed(1)+'점이 저장되었습니다. 학생 메인 상단에서 확인할 수 있습니다.','saved');
      if(typeof root.loadMockResults==='function')root.loadMockResults();
    }catch(error){
      if(error&&error.status===409){state.existing=true;status('다른 최초 기록이 먼저 저장되었습니다. 원본을 확인하려면 기록 새로고침을 눌러 주세요.','error');}
      else status('성적을 저장하지 못했습니다. 입력한 O는 유지됩니다. ('+(error&&error.message||'연결 오류')+')','error');
      paint();
    }
  }
  function mount(students){
    var select=node('admin-last-student');if(!select)return;
    var names=Array.from(new Set((Array.isArray(students)?students:[]).map(function(name){return String(name||'').trim()}).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'ko')});
    var current=state.student&&names.includes(state.student)?state.student:(names[0]||'');
    select.innerHTML='';names.forEach(function(name){var option=document.createElement('option');option.value=name;option.textContent=name;select.appendChild(option)});select.value=current;
    if(!state.mounted){
      state.mounted=true;
      select.addEventListener('change',load);
      node('admin-last-round').addEventListener('change',load);
      node('admin-last-reload').addEventListener('click',load);
      node('admin-last-grid').addEventListener('click',function(event){var button=event.target.closest('button[data-no]');if(!button||!state.loaded||state.existing)return;var no=Number(button.dataset.no);if(state.correct.has(no))state.correct.delete(no);else state.correct.add(no);paint()});
      node('admin-last-apply').addEventListener('click',function(){if(!state.loaded||state.existing)return;try{state.correct=parseNumbers(node('admin-last-correct-nos').value);paint();status('맞은 번호를 적용했습니다. 점수와 문항을 확인한 뒤 저장해 주세요.')}catch(error){status(error.message,'error')}});
      node('admin-last-save').addEventListener('click',save);
    }
    load();
  }
  root.GFIELD_ADMIN_LAST_ENTRY={mount:mount,_test:{parseNumbers:parseNumbers,points:points,totals:totals}};
})(window);
