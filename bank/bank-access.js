(function(root){
  'use strict';

  var PRODUCT_KEY='question-bank';
  var PORTAL_HANDOFF_KEY='gfield_question_bank_handoff_v1';
  var PORTAL_LAUNCH_KEY='gfield_question_bank_launch_v1';
  var PORTAL_HANDOFF_MAX_AGE=12*60*60*1000;
  var PORTAL_LAUNCH_MAX_AGE=10*60*1000;
  var ACCESS_TIMEOUT_MS=Number(root.__GFIELD_BANK_ACCESS_TIMEOUT_MS__)||8000;
  var localHost=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var forceGate=root.__GFIELD_BANK_ACCESS_FORCE__===true;
  var resolveReady;
  var ready=new Promise(function(resolve){resolveReady=resolve});

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function registeredStudents(){
    var students=(root.GFIELD_DATA||{}).students;
    return Array.isArray(students)?students:[];
  }
  function registeredStudent(student){
    return !!student&&registeredStudents().indexOf(student)>=0;
  }
  function scopedProductKey(){
    var query=new URLSearchParams(location.search),bank=String(query.get('bank')||'');
    var source=String(query.get('source')||'').split('|');
    if(bank==='final7')return 'mock-final-7';
    if(query.get('practice')==='wrong'&&source[0]==='final'&&source[1]==='7')return 'mock-final-7';
    return '';
  }
  function scopedPermissionList(){
    var key=scopedProductKey();if(!key)return [];
    var data=root.GFIELD_DATA||{},products=data.archiveProductAccess||{};
    return Array.isArray(products[key])?products[key]:[];
  }
  function listed(list,student){return list.indexOf('*')>=0||list.indexOf(student)>=0;}
  function allowed(account){
    if(!account||account.active!==true)return false;
    if(account.role==='admin'||account.role==='teacher')return true;
    if(account.role!=='student'||!account.student)return false;
    /* 일반 문제은행은 자료실 등록 학생 전체, 회차 자료는 해당 회차 승인만 허용한다. */
    if(scopedProductKey())return listed(scopedPermissionList(),account.student);
    return registeredStudent(account.student);
  }
  function localIdentity(){
    var name='';
    try{name=(localStorage.getItem('gfield_student')||'').trim()}catch(error){}
    return {role:'tester',student:name,active:true};
  }
  function handoffIdentity(raw,maxAge,source){
    if(!raw)return null;
    try{
      var handoff=JSON.parse(raw),student=String(handoff&&handoff.student||'').trim();
      var savedStudent=String(localStorage.getItem('gfield_student')||'').trim();
      var issuedAt=Number(handoff&&handoff.issuedAt||0),age=Date.now()-issuedAt;
      var scoped=scopedProductKey();
      if((handoff.product!==PRODUCT_KEY||!student||student!==savedStudent||age<0||age>maxAge)&&
         (handoff.product!==scoped||!scoped||!student||student!==savedStudent||age<0||age>maxAge))return null;
      return {role:'student',student:student,active:true,source:source};
    }catch(error){return null}
  }
  function portalIdentity(){
    var sessionRaw='',launchRaw='';
    try{sessionRaw=sessionStorage.getItem(PORTAL_HANDOFF_KEY)||''}catch(error){}
    try{
      launchRaw=localStorage.getItem(PORTAL_LAUNCH_KEY)||'';
      if(launchRaw)localStorage.removeItem(PORTAL_LAUNCH_KEY);
    }catch(error){}
    return handoffIdentity(sessionRaw,PORTAL_HANDOFF_MAX_AGE,'portal-handoff')||
      handoffIdentity(launchRaw,PORTAL_LAUNCH_MAX_AGE,'portal-launch')||portalQueryIdentity()||savedPortalIdentity();
  }
  function savedPortalIdentity(){
    var student='';
    try{student=String(localStorage.getItem('gfield_student')||'').trim()}catch(error){}
    if(!registeredStudent(student))return null;
    return {role:'student',student:student,active:true,source:'saved-archive'};
  }
  function portalQueryIdentity(){
    var query=new URLSearchParams(location.search);
    var student=String(query.get('name')||'').trim();
    if(query.get('from')!=='archive'||!registeredStudent(student))return null;
    return {role:'student',student:student,active:true,source:'portal-query'};
  }
  function bankReturnTarget(){
    var query=new URLSearchParams(location.search);
    query.delete('from');query.delete('name');
    var page=/\/catalog\.html$/i.test(location.pathname)?'bank/catalog.html':'bank/index.html';
    var search=query.toString();
    return page+(search?'?'+search:'')+location.hash;
  }
  function archiveLoginUrl(){
    return '../index.html?next='+encodeURIComponent(bankReturnTarget());
  }
  function injectStyle(){
    if(document.getElementById('bankAccessStyle'))return;
    var style=document.createElement('style');
    style.id='bankAccessStyle';
    style.textContent='body.bank-access-pending{overflow:hidden;background:#f5f7fb}body.bank-access-pending>:not(.bank-access-gate){visibility:hidden}.bank-access-gate[hidden]{display:none}.bank-access-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:#17345f;color:#182230;visibility:visible}.bank-access-card{width:min(100%,390px);padding:30px;border:1px solid rgba(255,255,255,.24);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(4,20,46,.34)}.bank-access-brand{color:#2456c4;font-size:12px;font-weight:900;letter-spacing:.18em}.bank-access-card h1{margin:8px 0 6px;color:#17345f;font:900 25px/1.3 Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif}.bank-access-lead{margin:0;color:#566274;font-size:13px;line-height:1.6}.bank-access-status{min-height:20px;margin:14px 0;color:#566274;font-size:12px;line-height:1.5}.bank-access-status.error{color:#b42318;font-weight:800}.bank-access-card>a{display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:10px;background:#2456c4;color:#fff;font-size:14px;font-weight:900;text-decoration:none}@media(max-width:430px){.bank-access-card{padding:24px 20px;border-radius:16px}}';
    document.head.appendChild(style);
  }
  function shell(){
    var node=document.getElementById('bankAccessGate');
    if(node)return node;
    node=document.createElement('section');
    node.id='bankAccessGate';
    node.className='bank-access-gate';
    node.setAttribute('aria-live','polite');
    node.innerHTML='<div class="bank-access-card"><div class="bank-access-brand">G·FIELD</div><h1>자료실 로그인으로 연결 중</h1><p class="bank-access-lead">등록된 학생 이름으로 로그인하면 승인번호 없이 문제은행을 이용할 수 있습니다.</p><p class="bank-access-status" id="bankAccessStatus">학생 정보를 확인하고 있습니다.</p><a id="bankArchiveLogin" href="'+esc(archiveLoginUrl())+'">자료실에서 로그인하기</a></div>';
    document.body.appendChild(node);
    return node;
  }
  function setStatus(message,isError){
    var target=document.getElementById('bankAccessStatus');
    if(target){target.textContent=message||'';target.classList.toggle('error',!!isError)}
  }
  function withinAccessTime(promise){
    var timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise(function(_,reject){
        timer=setTimeout(function(){
          var error=new Error('ACCESS_TIMEOUT');error.code='ACCESS_TIMEOUT';reject(error);
        },ACCESS_TIMEOUT_MS);
      })
    ]).finally(function(){clearTimeout(timer)});
  }
  function reveal(account){
    var node=shell();
    node.hidden=true;
    document.body.classList.remove('bank-access-pending');
    document.body.classList.add('bank-access-granted');
    document.body.dataset.bankStudent=account.student||'';
    if(account.student){
      try{localStorage.setItem('gfield_student',account.student)}catch(error){}
    }
    resolveReady(account);
  }
  function accountPath(user){
    return 'hs_accounts?select=role,active,student&user_id=eq.'+encodeURIComponent(user.id)+'&limit=1';
  }
  async function verifiedAccount(slot){
    var auth=root.GFIELD_AUTH;
    if(!auth)return null;
    var user=await auth.getUser(slot);
    if(!user||!user.id)return null;
    var response=await auth.rest(accountPath(user),{headers:{Accept:'application/json'}},slot);
    if(!response.ok)throw new Error('ACCOUNT_LOOKUP_FAILED');
    var rows=await response.json();
    return Array.isArray(rows)&&rows.length===1?rows[0]:null;
  }
  async function restore(){
    var account=await verifiedAccount('admin');
    if(!account)account=await verifiedAccount('student');
    if(!account)return null;
    if(!allowed(account))throw Object.assign(new Error('ACCESS_DENIED'),{code:'ACCESS_DENIED'});
    return account;
  }
  function message(error){
    if(error&&error.code==='ACCESS_DENIED')return scopedProductKey()?'이 회차의 열람 권한이 없습니다. 원장님께 문의해 주세요.':'등록 학생 정보를 확인할 수 없습니다.';
    if(error&&error.code==='ACCESS_TIMEOUT')return '연결이 늦어져 자료실 로그인 화면으로 이동합니다.';
    return '자료실에서 학생 이름으로 로그인해 주세요.';
  }
  async function start(){
    injectStyle();shell();
    if(localHost&&!forceGate){reveal(localIdentity());return}
    try{
      var portal=portalIdentity();
      if(portal){
        if(!allowed(portal))throw Object.assign(new Error('ACCESS_DENIED'),{code:'ACCESS_DENIED'});
        reveal(portal);return;
      }
      var account=await withinAccessTime(restore());
      if(account){reveal(account);return}
      setStatus('자료실 로그인 화면으로 이동합니다.',false);
      location.replace(archiveLoginUrl());
    }catch(error){
      setStatus(message(error),!!(error&&error.code==='ACCESS_DENIED'));
      if(!(error&&error.code==='ACCESS_DENIED'))location.replace(archiveLoginUrl());
    }
  }

  root.GFIELD_BANK_ACCESS={ready:ready,allowed:allowed,registeredStudents:registeredStudents,scopedProductKey:scopedProductKey,portalIdentity:portalIdentity,archiveLoginUrl:archiveLoginUrl,start:start};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
