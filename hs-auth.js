(function(global){
  'use strict';

  var SUPABASE_URL='https://fgahqumaldheqettmvqg.supabase.co';
  var PUBLISHABLE_KEY='sb_publishable_OsjJG92BLMaZrc2jTClt0g_ecdTtf_I';
  var SESSION_KEYS={student:'gfield_hs_student_session_v1',admin:'gfield_hs_admin_session_v1'};
  var LOCK_PREFIX='gfield_hs_refresh_lock_v1_';
  var ADMIN_DEVICE_KEY='gfield_hs_admin_device_v1';
  var refreshPromises={student:null,admin:null};

  function normalizeName(value){
    var name=String(value==null?'':value).trim();
    try{name=name.normalize('NFKC');}catch(e){}
    return name;
  }

  function normalizeLoginName(value){
    return normalizeName(value).replace(/\s+/g,'').toLocaleLowerCase('ko-KR');
  }

  function slotName(value){return value==='admin'?'admin':'student'}
  function sessionKey(slot){return SESSION_KEYS[slotName(slot)]}
  function delay(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}

  function bytesToHex(bytes){
    return Array.prototype.map.call(bytes,function(byte){return byte.toString(16).padStart(2,'0')}).join('');
  }

  async function loginEmail(name){
    var normalized=normalizeLoginName(name);
    if(!normalized)throw new Error('이름을 입력해 주세요.');
    var digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized));
    return 'hs-'+bytesToHex(new Uint8Array(digest)).slice(0,32)+'@auth.gfieldacademy.net';
  }

  function readStored(slot){
    try{
      var raw=localStorage.getItem(sessionKey(slot));
      if(!raw)return null;
      var value=JSON.parse(raw);
      return value&&value.access_token&&value.refresh_token?value:null;
    }catch(e){return null}
  }

  function store(session,name,slot){
    if(!session||!session.access_token||!session.refresh_token)throw new Error('로그인 정보를 받지 못했습니다.');
    var saved=Object.assign({},session,{
      login_name:normalizeName(name||session.login_name||''),
      expires_at:session.expires_at||Math.floor(Date.now()/1000)+Number(session.expires_in||3600)
    });
    try{localStorage.setItem(sessionKey(slot),JSON.stringify(saved))}catch(e){}
    return saved;
  }

  function clear(slot){
    try{localStorage.removeItem(sessionKey(slot))}catch(e){}
  }

  function readAdminDevice(){
    try{return localStorage.getItem(ADMIN_DEVICE_KEY)||''}catch(e){return ''}
  }

  function storeAdminDevice(value){
    if(!value)return false;
    try{
      localStorage.setItem(ADMIN_DEVICE_KEY,String(value));
      return localStorage.getItem(ADMIN_DEVICE_KEY)===String(value);
    }catch(e){return false}
  }

  function forgetAdminDevice(){
    try{localStorage.removeItem(ADMIN_DEVICE_KEY)}catch(e){}
  }

  async function authRequest(path,options){
    var opt=options||{};
    var headers=Object.assign({apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'},opt.headers||{});
    var response=await fetch(SUPABASE_URL+'/auth/v1'+path,Object.assign({},opt,{headers:headers}));
    var body=null;
    try{body=await response.json()}catch(e){}
    if(!response.ok){
      var message=(body&&(body.msg||body.message||body.error_description||body.error))||'승인번호를 확인해 주세요.';
      var error=new Error(String(message));error.status=response.status;error.code=body&&body.code;throw error;
    }
    return body;
  }

  async function acquireRefreshLock(slot){
    var key=LOCK_PREFIX+slotName(slot);
    var owner=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
    for(var i=0;i<24;i++){
      var now=Date.now();var lock=null;
      try{lock=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
      if(!lock||Number(lock.expires||0)<now){
        try{
          localStorage.setItem(key,JSON.stringify({owner:owner,expires:now+8000}));
          var confirmed=JSON.parse(localStorage.getItem(key)||'null');
          if(confirmed&&confirmed.owner===owner)return {key:key,owner:owner};
        }catch(e){return {key:'',owner:owner}}
      }
      await delay(120+Math.floor(Math.random()*80));
    }
    return null;
  }

  function releaseRefreshLock(lock){
    if(!lock||!lock.key)return;
    try{
      var current=JSON.parse(localStorage.getItem(lock.key)||'null');
      if(current&&current.owner===lock.owner)localStorage.removeItem(lock.key);
    }catch(e){}
  }

  async function refresh(slot,force){
    var target=slotName(slot);
    if(refreshPromises[target])return refreshPromises[target];
    refreshPromises[target]=(async function(){
      var initial=readStored(target);
      if(!initial||!initial.refresh_token)return null;
      if(!force&&Number(initial.expires_at||0)-Math.floor(Date.now()/1000)>=90)return initial;
      var lock=await acquireRefreshLock(target);
      if(!lock){
        var latest=readStored(target);
        if(latest&&latest.refresh_token!==initial.refresh_token)return latest;
        throw new Error('로그인 정보를 갱신하는 중입니다. 잠시 후 다시 시도해 주세요.');
      }
      try{
        var current=readStored(target)||initial;
        if(current.refresh_token!==initial.refresh_token)return current;
        var next=await authRequest('/token?grant_type=refresh_token',{
          method:'POST',body:JSON.stringify({refresh_token:current.refresh_token})
        });
        return store(next,current.login_name||'',target);
      }catch(error){
        if(error&&(error.status===400||error.status===401))clear(target);
        throw error;
      }finally{releaseRefreshLock(lock)}
    })();
    try{return await refreshPromises[target]}finally{refreshPromises[target]=null}
  }

  async function getSession(slot){
    var target=slotName(slot);var session=readStored(target);
    if(!session)return null;
    if(Number(session.expires_at||0)-Math.floor(Date.now()/1000)>=90)return session;
    try{return await refresh(target,true)}catch(error){
      var saved=readStored(target);
      return saved&&Number(saved.expires_at||0)>Math.floor(Date.now()/1000)?saved:null;
    }
  }

  async function signInStudent(name,approvalCode){
    var normalized=normalizeName(name);
    var code=String(approvalCode==null?'':approvalCode).replace(/\D/g,'');
    if(!normalized||!code)throw new Error('이름과 승인번호를 모두 입력해 주세요.');
    var email=await loginEmail(normalized);
    var session=await authRequest('/token?grant_type=password',{
      method:'POST',body:JSON.stringify({email:email,password:code})
    });
    return store(session,normalized,'student');
  }

  function storeAdminResult(result,name){
    var session=result&&result.session;
    var role=session&&session.user&&session.user.app_metadata&&session.user.app_metadata.role;
    if(role!=='admin'&&role!=='teacher'){
      var forbidden=new Error('관리자 권한을 확인하지 못했습니다.');
      forbidden.code='FORBIDDEN';throw forbidden;
    }
    var issuedDevice=result&&result.deviceToken?String(result.deviceToken):'';
    var deviceToken=issuedDevice||readAdminDevice();
    if(deviceToken.length<32){
      var missing=new Error('관리자 기기 정보를 받지 못했습니다.');
      missing.code='DEVICE_NOT_ENROLLED';throw missing;
    }
    try{
      if(issuedDevice&&!storeAdminDevice(issuedDevice))throw new Error('device-storage');
      var saved=store(session,normalizeName(name),'admin');
      var verified=readStored('admin');
      if(!verified||verified.access_token!==saved.access_token||readAdminDevice()!==deviceToken)throw new Error('session-storage');
      return saved;
    }catch(error){
      clear('admin');
      if(issuedDevice)forgetAdminDevice();
      var storageError=new Error('이 브라우저가 로그인 정보 저장을 차단했습니다. 일반 창에서 다시 등록해 주세요.');
      storageError.code='STORAGE_UNAVAILABLE';throw storageError;
    }
  }

  async function adminSessionRequest(name,approvalCode,enrollmentToken){
    var deviceToken=readAdminDevice();
    var action=enrollmentToken?'enroll':'login';
    var headers={apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'};
    if(enrollmentToken)headers['X-Bootstrap-Token']=String(enrollmentToken);
    var response=await fetch(SUPABASE_URL+'/functions/v1/hs-admin-session',{
      method:'POST',headers:headers,
      body:JSON.stringify({action:action,name:normalizeName(name),approvalCode:String(approvalCode==null?'':approvalCode).trim(),deviceToken:deviceToken})
    });
    var result=null;try{result=await response.json()}catch(e){}
    if(!response.ok){
      var error=new Error((result&&(result.message||result.error))||'관리자 로그인을 확인해 주세요.');
      error.status=response.status;error.code=result&&result.error;throw error;
    }
    return storeAdminResult(result,name);
  }

  async function redeemAdminEnrollment(enrollmentToken){
    var token=String(enrollmentToken||'');
    if(token.length<24)throw new Error('관리자 기기 등록 링크가 올바르지 않습니다.');
    var response=await fetch(SUPABASE_URL+'/functions/v1/hs-admin-session',{
      method:'POST',
      headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json','X-Bootstrap-Token':token},
      body:JSON.stringify({action:'redeem'})
    });
    var result=null;try{result=await response.json()}catch(e){}
    if(!response.ok){
      var error=new Error((result&&(result.message||result.error))||'관리자 기기를 등록하지 못했습니다.');
      error.status=response.status;error.code=result&&result.error;throw error;
    }
    return storeAdminResult(result,'DOCSSAM');
  }

  async function signIn(name,approvalCode,options){
    if(normalizeLoginName(name)==='docssam')return adminSessionRequest(name,approvalCode,options&&options.enrollmentToken);
    return signInStudent(name,approvalCode);
  }

  async function getUser(slot){
    var target=slotName(slot);var session=await getSession(target);
    if(!session)return null;
    try{return await authRequest('/user',{headers:{Authorization:'Bearer '+session.access_token}})}
    catch(error){if(error&&error.status===401)clear(target);return null}
  }

  async function signOut(slot,forgetDevice){
    var target=slotName(slot);var session=readStored(target);clear(target);
    if(target==='admin'&&forgetDevice)forgetAdminDevice();
    if(!session)return;
    try{await authRequest('/logout',{method:'POST',headers:{Authorization:'Bearer '+session.access_token},body:'{}'})}catch(e){}
  }

  async function functionCall(slug,body,slot){
    var target=slotName(slot);
    async function send(session){
      var response=await fetch(SUPABASE_URL+'/functions/v1/'+encodeURIComponent(slug),{
        method:'POST',
        headers:{apikey:PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
        body:JSON.stringify(body||{})
      });
      var result=null;try{result=await response.json()}catch(e){}
      return {response:response,result:result};
    }
    var session=await getSession(target);if(!session)throw new Error('다시 로그인해 주세요.');
    var sent=await send(session);
    if(sent.response.status===401){
      session=await refresh(target,true);if(session)sent=await send(session);
    }
    if(!sent.response.ok){
      var message=(sent.result&&(sent.result.message||sent.result.error))||('요청 실패 ('+sent.response.status+')');
      var error=new Error(String(message));error.status=sent.response.status;error.code=sent.result&&sent.result.error;throw error;
    }
    return sent.result;
  }

  async function rest(path,options,slot){
    var target=slotName(slot);var opt=options||{};
    async function send(session){
      var headers=Object.assign({apikey:PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token},opt.headers||{});
      return fetch(SUPABASE_URL+'/rest/v1/'+path,Object.assign({},opt,{headers:headers}));
    }
    var session=await getSession(target);if(!session)throw new Error('다시 로그인해 주세요.');
    var response=await send(session);
    if(response.status===401){session=await refresh(target,true);if(session)response=await send(session)}
    return response;
  }

  /* 승인 기기 식별값: 이 브라우저에서 만든 임의 값(학생·이메일 정보 없음). 서버에는 해시만 저장된다.
     로그아웃해도 유지되고, 브라우저 저장내용을 지우면 새 기기로 취급된다. */
  var DEVICE_KEY='gfield_hs_device_v1';
  function deviceToken(){
    try{
      var saved=localStorage.getItem(DEVICE_KEY);
      if(saved&&/^[A-Za-z0-9_-]{32,64}$/.test(saved))return saved;
      var bytes=crypto.getRandomValues(new Uint8Array(24));
      var token=btoa(String.fromCharCode.apply(null,bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      localStorage.setItem(DEVICE_KEY,token);
      return localStorage.getItem(DEVICE_KEY)===token?token:'';
    }catch(e){return ''}
  }

  /* 학부모 이메일 인증(hs-parent-auth). 학부모 세션은 서버에서 끝내고 학생 세션만 받는다. */
  async function parentAuth(action,body){
    var response=await fetch(SUPABASE_URL+'/functions/v1/hs-parent-auth',{
      method:'POST',
      headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify(Object.assign({},body||{},{action:action}))
    });
    var result=null;try{result=await response.json()}catch(e){}
    if(!response.ok){
      var error=new Error((result&&result.error)||'REQUEST_FAILED');
      error.status=response.status;error.code=result&&result.error;
      error.retryAfter=Number(response.headers.get('Retry-After')||0);
      throw error;
    }
    return result;
  }

  function requireDevice(){
    var token=deviceToken();
    if(!token){var e=new Error('STORAGE_UNAVAILABLE');e.code='STORAGE_UNAVAILABLE';throw e}
    return token;
  }

  async function startEmailLogin(name,email){
    return parentAuth('start',{name:normalizeName(name),email:String(email||'').trim(),deviceToken:requireDevice()});
  }

  async function verifyEmailLogin(name,email,code,pin){
    var body={name:normalizeName(name),email:String(email||'').trim(),code:String(code||'').replace(/\s+/g,''),deviceToken:requireDevice()};
    if(pin!==undefined)body.pin=String(pin);
    var result=await parentAuth('verify',body);
    if(pin!==undefined&&!result.pinReady){var notReady=new Error('PIN_NOT_CONFIGURED');notReady.code='PIN_NOT_CONFIGURED';throw notReady;}
    var saved=store(result&&result.session,result&&result.student||name,'student');
    var verified=readStored('student');
    if(!verified||verified.access_token!==saved.access_token){
      var storageError=new Error('STORAGE_UNAVAILABLE');storageError.code='STORAGE_UNAVAILABLE';throw storageError;
    }
    return {student:result.student,firstLink:!!result.firstLink};
  }

  async function pinLogin(name,pin){
    var result=await parentAuth('pin',{name:normalizeName(name),pin:String(pin),deviceToken:requireDevice()});
    var saved=store(result&&result.session,result&&result.student||name,'student');
    var verified=readStored('student');
    if(!verified||verified.access_token!==saved.access_token){var e=new Error('STORAGE_UNAVAILABLE');e.code='STORAGE_UNAVAILABLE';throw e;}
    return {student:result.student};
  }

  /* 같은 브라우저 재입장: 서버에서 활성 학생·이메일 연결을 확인하고 최근 접속을 남긴다. */
  async function touchStudent(){
    return functionCall('hs-parent-auth',{action:'touch',deviceToken:deviceToken()},'student');
  }

  global.GFIELD_AUTH={
    SUPABASE_URL:SUPABASE_URL,
    PUBLISHABLE_KEY:PUBLISHABLE_KEY,
    normalizeName:normalizeName,
    normalizeLoginName:normalizeLoginName,
    loginEmail:loginEmail,
    signIn:signIn,
    redeemAdminEnrollment:redeemAdminEnrollment,
    signOut:signOut,
    getSession:getSession,
    getUser:getUser,
    functionCall:functionCall,
    rest:rest,
    clear:clear,
    startEmailLogin:startEmailLogin,
    verifyEmailLogin:verifyEmailLogin,
    pinLogin:pinLogin,
    touchStudent:touchStudent,
    hasAdminDevice:function(){return !!readAdminDevice()},
    forgetAdminDevice:forgetAdminDevice
  };
})(window);
