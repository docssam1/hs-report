(function(root){
  'use strict';

  var PRODUCT_KEY='question-bank';
  var FALLBACK_FOLDER='약점 유형';
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
  function permissionList(){
    var data=root.GFIELD_DATA||{},products=data.archiveProductAccess||{};
    if(Array.isArray(products[PRODUCT_KEY]))return products[PRODUCT_KEY];
    var folders=data.archiveAccess||{};
    return Array.isArray(folders[FALLBACK_FOLDER])?folders[FALLBACK_FOLDER]:[];
  }
  function allowed(account){
    if(!account||account.active!==true)return false;
    if(account.role==='admin'||account.role==='teacher')return true;
    if(account.role!=='student'||!account.student)return false;
    var list=permissionList();
    return list.indexOf('*')>=0||list.indexOf(account.student)>=0;
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
      if(handoff.product!==PRODUCT_KEY||!student||student!==savedStudent||age<0||age>maxAge)return null;
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
      handoffIdentity(launchRaw,PORTAL_LAUNCH_MAX_AGE,'portal-launch');
  }
  function injectStyle(){
    if(document.getElementById('bankAccessStyle'))return;
    var style=document.createElement('style');
    style.id='bankAccessStyle';
    style.textContent='body.bank-access-pending{overflow:hidden;background:#f5f7fb}body.bank-access-pending>:not(.bank-access-gate){visibility:hidden}.bank-access-gate[hidden]{display:none}.bank-access-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:#17345f;color:#182230;visibility:visible}.bank-access-card{width:min(100%,390px);padding:30px;border:1px solid rgba(255,255,255,.24);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(4,20,46,.34)}.bank-access-brand{color:#2456c4;font-size:12px;font-weight:900;letter-spacing:.18em}.bank-access-card h1{margin:8px 0 6px;color:#17345f;font:900 25px/1.3 Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif}.bank-access-lead{margin:0 0 20px;color:#566274;font-size:13px;line-height:1.6}.bank-access-card form{display:grid;gap:12px}.bank-access-card label{display:grid;gap:6px;color:#344054;font-size:12px;font-weight:800}.bank-access-card input{width:100%;min-height:46px;padding:10px 12px;border:1px solid #c5d1e4;border-radius:10px;background:#fff;color:#182230;font:500 16px Pretendard,"Noto Sans KR",sans-serif}.bank-access-card input:focus{border-color:#2456c4;outline:3px solid #e5edff}.bank-access-card button{min-height:46px;border:0;border-radius:10px;background:#2456c4;color:#fff;font-size:14px;font-weight:900;cursor:pointer}.bank-access-card button:disabled{opacity:.55;cursor:wait}.bank-access-status{min-height:20px;margin:14px 0 8px;color:#566274;font-size:12px;line-height:1.5}.bank-access-status.error{color:#b42318;font-weight:800}.bank-access-card>a{color:#2456c4;font-size:12px;font-weight:800;text-decoration:none}@media(max-width:430px){.bank-access-card{padding:24px 20px;border-radius:16px}}';
    document.head.appendChild(style);
  }
  function shell(){
    var node=document.getElementById('bankAccessGate');
    if(node)return node;
    node=document.createElement('section');
    node.id='bankAccessGate';
    node.className='bank-access-gate';
    node.setAttribute('aria-live','polite');
    node.innerHTML='<div class="bank-access-card"><div class="bank-access-brand">G·FIELD</div><h1>문제은행 열람</h1><p class="bank-access-lead">승인된 학생만 문제와 풀이를 볼 수 있습니다.</p><form id="bankAccessForm"><label>학생 이름<input id="bankAccessName" autocomplete="username" required></label><label>승인번호<input id="bankAccessCode" type="password" inputmode="numeric" autocomplete="current-password" required></label><button type="submit">확인</button></form><p class="bank-access-status" id="bankAccessStatus">로그인 정보를 확인하고 있습니다.</p><a href="../index.html">자료실로 돌아가기</a></div>';
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
  async function signIn(name,code){
    await root.GFIELD_AUTH.signIn(name,code);
    var slot=String(name||'').trim().toLowerCase()==='docssam'?'admin':'student';
    var account=await verifiedAccount(slot);
    if(!allowed(account))throw Object.assign(new Error('ACCESS_DENIED'),{code:'ACCESS_DENIED'});
    return account;
  }
  function message(error){
    if(error&&error.code==='ACCESS_DENIED')return '이 학생에게는 문제은행 열람 권한이 없습니다. 원장님께 문의해 주세요.';
    if(error&&error.code==='ACCESS_TIMEOUT')return '연결이 늦어지고 있습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.';
    return '이름과 승인번호를 확인해 주세요.';
  }
  function bindForm(){
    var form=document.getElementById('bankAccessForm');
    if(!form||form.dataset.bound)return;
    form.dataset.bound='1';
    form.addEventListener('submit',async function(event){
      event.preventDefault();
      var button=form.querySelector('button'),name=document.getElementById('bankAccessName').value.trim(),code=document.getElementById('bankAccessCode').value;
      button.disabled=true;setStatus('권한을 확인하고 있습니다.',false);
      try{reveal(await withinAccessTime(signIn(name,code)))}
      catch(error){setStatus(message(error),true);button.disabled=false}
    });
  }
  async function start(){
    injectStyle();shell();bindForm();
    if(localHost&&!forceGate){reveal(localIdentity());return}
    try{
      var portal=portalIdentity();
      if(portal){
        if(!allowed(portal))throw Object.assign(new Error('ACCESS_DENIED'),{code:'ACCESS_DENIED'});
        reveal(portal);return;
      }
      var account=await withinAccessTime(restore());
      if(account){reveal(account);return}
      setStatus('자료실에서 학생 이름으로 들어오면 바로 이용할 수 있습니다.',false);
    }catch(error){setStatus(message(error),true)}
  }

  root.GFIELD_BANK_ACCESS={ready:ready,allowed:allowed,permissionList:permissionList,portalIdentity:portalIdentity,start:start};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
