(function(root){
  'use strict';
  var TARGET='https://lete-on.gfieldacademy.net/hyper-focus/';
  var busy=false;
  function isTarget(raw){try{var u=new URL(raw,root.location.href);return u.origin==='https://lete-on.gfieldacademy.net'&&(u.pathname==='/hyper-focus/'||u.pathname==='/hyper-focus')&&!u.username&&!u.password;}catch(e){return false;}}
  function isBook(book,url){return !!book&&book.folder==='GFIELD APPLICATION'&&isTarget(url);}
  function explain(error){
    var code=String(error&&error.message||'');
    if(/ARCHIVE_NOT_APPROVED|ACCESS_DENIED/.test(code))return '자료실의 GFIELD APPLICATION 이용 승인을 확인해 주세요.';
    if(/UNAUTHORIZED|다시 로그인|DEVICE/.test(code))return '황소 리포트에 다시 로그인한 뒤 열어 주세요.';
    return '하이퍼포커스 연결을 완료하지 못했습니다. 잠시 후 다시 눌러 주세요.';
  }
  async function launch(){
    if(busy)return;
    busy=true;
    // Open synchronously to avoid mobile popup blocking; credentials stay out of
    // query strings, storage and logs. Only the fixed first-party destination.
    var child=root.open('about:blank','_blank');
    if(child){child.opener=null;try{child.document.body.textContent='하이퍼포커스 연결 중…';}catch(e){}}
    try{
      if(!root.GFIELD_AUTH||typeof root.GFIELD_AUTH.issueHyperfocusLink!=='function')throw new Error('UNAUTHORIZED');
      var result=await root.GFIELD_AUTH.issueHyperfocusLink();
      if(!result||!/^[A-Za-z0-9_-]{43}$/.test(result.token)||Date.parse(result.expiresAt)<=Date.now())throw new Error('HANDOFF_EXPIRED');
      var target=TARGET+'#hs_handoff='+encodeURIComponent(result.token);
      if(child){if(child.closed)return;child.location.replace(target);}else root.location.assign(target);
    }catch(error){
      if(child&&!child.closed)child.close();
      root.alert(explain(error));
    }finally{busy=false;}
  }
  function launchBook(book,url){if(!isBook(book,url))return false;void launch();return true;}
  root.document.addEventListener('click',function(event){
    var anchor=event.target.closest&&event.target.closest('a[data-hf-report-link="1"]');
    if(!anchor||!isTarget(anchor.href))return;
    event.preventDefault();void launch();
  });
  root.GFIELD_HF_LINK=Object.freeze({target:TARGET,isBook:isBook,launchBook:launchBook});
})(window);
