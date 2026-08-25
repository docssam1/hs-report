(function(){
  'use strict';

  var state=document.getElementById('state');
  var adminLink=document.getElementById('adminLink');
  var token='';
  if(location.hash.indexOf('#activate=')===0){
    try{token=decodeURIComponent(location.hash.slice(10))}catch(_){token=''}
  }
  try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}

  function show(message,kind){
    state.textContent=message;
    state.className='state '+(kind||'');
    if(kind==='error')adminLink.style.display='inline-block';
  }

  function isAdmin(user){
    var role=user&&user.app_metadata&&user.app_metadata.role;
    return role==='admin'||role==='teacher';
  }

  async function openExistingSession(){
    try{
      var user=await window.GFIELD_AUTH.getUser('admin');
      if(isAdmin(user)){location.replace('admin.html');return true}
    }catch(_){}
    return false;
  }

  async function activate(){
    if(token.length<24){
      if(await openExistingSession())return;
      show('등록 링크가 올바르지 않습니다. 관리자 로그인에서 다시 시도해 주세요.','error');return;
    }
    try{
      await window.GFIELD_AUTH.redeemAdminEnrollment(token);
      token='';
      show('등록되었습니다. 관리자 화면으로 이동합니다.','done');
      location.replace('admin.html');
    }catch(error){
      token='';
      if(await openExistingSession())return;
      if(error&&error.code==='STORAGE_UNAVAILABLE')show(error.message,'error');
      else if(error&&error.status===429)show('등록 시도가 잠시 제한되었습니다. 잠시 후 새 등록 링크로 다시 시도해 주세요.','error');
      else if(error&&error.status===401)show('등록 링크가 만료되었거나 이미 사용되었습니다.','error');
      else show('등록 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.','error');
    }
  }

  activate();
})();
