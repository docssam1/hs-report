/* 관리자 콘솔 ② 학생 명단: 학부모 이메일 인증 기록(읽기 전용).
 * hs-approval-admin list 의 emailLinks 만 표시한다. 연결 변경·삭제·승인 기능은 없다.
 * 인증번호·접속 토큰은 서버에도 저장하지 않으므로 표시하지 않는다.
 */
(function(root){
  'use strict';
  var state={loaded:false,loading:false,error:'',links:{},students:[]};

  function esc(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function when(value){
    if(!value)return '-';
    var d=new Date(value);if(isNaN(d))return '-';
    function p(n){return String(n).padStart(2,'0')}
    return (d.getMonth()+1)+'/'+d.getDate()+' '+p(d.getHours())+':'+p(d.getMinutes());
  }

  function draw(){
    var box=document.getElementById('student-email-auth');if(!box)return;
    var students=state.students.filter(function(n){var l=String(n).toLowerCase();return l!=='demo'&&l!=='docssam'});
    var verified=students.filter(function(n){return !!state.links[n]}).length;
    var head='<div class="email-auth-head"><h3 style="margin:0">학부모 이메일 인증</h3>'+
      '<button type="button" class="btn" id="email-auth-refresh" style="padding:6px 10px;font-size:12px">새로고침</button></div>'+
      '<div class="hint" style="margin:6px 0 10px">인증 '+verified+'명 / 전체 '+students.length+'명 · 학부모가 처음 인증한 이메일이 학생에게 연결됩니다. 여기서 연결을 바꾸거나 지울 수는 없습니다.</div>';
    var body;
    if(state.loading&&!state.loaded)body='<div class="hint">인증 기록을 불러오는 중…</div>';
    else if(state.error)body='<div class="hint" style="color:#b42318">'+esc(state.error)+'</div>';
    else body='<div style="overflow-x:auto"><table class="email-auth-table"><thead><tr><th>학생</th><th>인증 이메일</th><th>이메일 인증</th><th>최초 인증</th><th>최근 접속</th></tr></thead><tbody>'+
      students.map(function(name){
        var link=state.links[name];
        return '<tr><td><b>'+esc(name)+'</b></td>'+
          '<td>'+(link?esc(link.email):'-')+'</td>'+
          '<td>'+(link?'<span class="email-auth-badge ok">인증됨</span>':'<span class="email-auth-badge">미인증</span>')+'</td>'+
          '<td>'+esc(link?when(link.firstVerifiedAt):'-')+'</td>'+
          '<td>'+esc(link?when(link.lastSeenAt):'-')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
    box.innerHTML=head+body;
    var refresh=document.getElementById('email-auth-refresh');
    if(refresh)refresh.onclick=function(){load(true)};
  }

  async function load(force){
    var auth=root.GFIELD_AUTH;
    if(!auth||state.loading||(state.loaded&&!force))return;
    state.loading=true;state.error='';draw();
    try{
      if(!(await auth.getSession('admin'))){state.loading=false;state.error='관리자 로그인 후 새로고침을 눌러 주세요.';draw();return}
      var result=await auth.functionCall('hs-approval-admin',{action:'list'},'admin');
      if(result&&result.emailLinksAvailable===false)throw new Error('인증 기록을 불러오지 못했습니다.');
      var links={};
      (result&&result.emailLinks||[]).forEach(function(row){if(row&&row.student)links[row.student]=row});
      state.links=links;state.loaded=true;
    }catch(error){
      state.error=(error&&error.status===401)?'관리자 로그인이 필요합니다.':'인증 기록을 불러오지 못했습니다. 새로고침을 눌러 주세요.';
    }finally{state.loading=false;draw()}
  }

  function render(students){
    state.students=Array.isArray(students)?students.slice():[];
    draw();
    if(!state.loaded&&!state.loading&&!state.error)load(false);
  }

  root.GFIELD_EMAIL_AUTH_VIEW=Object.freeze({render:render,load:load});
})(window);
