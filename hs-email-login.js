/* 학부모 이메일 인증 입장 (이름 → 학부모 이메일 → 인증번호).
 * - 인증한 같은 브라우저: 저장된 학생 세션 + 서버 확인(활성·이메일 연결)으로 바로 입장.
 * - 새 브라우저: 이름 + 학부모가 설정한 4자리 PIN. 처음/분실/5회 오류: 이메일 인증으로 설정.
 * - 이메일 인증은 접속 확인일 뿐 구매·회차·자료실 승인을 대신하지 않는다.
 * - 이메일 주소·인증번호는 브라우저에 저장하지 않는다.
 */
(function(global){
  'use strict';

  var AUTH=function(){return global.GFIELD_AUTH};
  var RESEND_SECONDS=60;

  var MESSAGES={
    INVALID_PIN_FORMAT:'접속번호는 숫자 4자리로 입력해 주세요.',
    INVALID_PIN:'접속번호가 맞지 않아요. 5회 틀리면 이메일로 재설정해야 해요.',
    PIN_CHANGED:'접속번호가 변경됐어요. 다시 입력해 주세요.',
    PIN_LOCKED:'접속번호를 5회 잘못 입력했어요. 이메일 인증으로 번호를 재설정해 주세요.',
    PIN_NOT_READY:'아직 접속번호를 설정하지 않았어요. 이메일 인증으로 설정해 주세요.',
    PIN_NOT_CONFIGURED:'접속번호 기능을 준비 중입니다. 잠시 후 다시 시도해 주세요.',
    PIN_SAVE_FAILED:'접속번호를 저장하지 못했어요. 다시 인증해 주세요.',
    INVALID_EMAIL:'이메일 주소를 확인해 주세요.',
    STUDENT_NOT_FOUND:'등록된 학생만 입장할 수 있어요. 이름을 정확히 입력해 주세요.',
    STUDENT_INACTIVE:'접속이 정지된 회원입니다. 학원에 문의해 주세요.',
    LINKED_TO_OTHER_EMAIL:'이 학생은 이미 다른 학부모 이메일로 등록되어 있어요. 처음 인증한 이메일을 입력하거나 학원에 문의해 주세요.',
    TOO_MANY_ATTEMPTS:'요청이 많아요. 잠시 후 다시 시도해 주세요.',
    EMAIL_SEND_FAILED:'인증 메일을 보내지 못했어요. 이메일 주소를 확인하거나 잠시 후 다시 시도해 주세요.',
    INVALID_CODE:'인증번호가 맞지 않거나 만료되었어요. 메일의 가장 최근 번호를 입력하거나 다시 받아 주세요.',
    STORAGE_UNAVAILABLE:'이 브라우저가 로그인 정보 저장을 막고 있어요. 일반 창에서 다시 시도해 주세요.',
    DEVICE_LIMIT:'이 학생은 이미 3대의 기기가 승인되어 있어요. 새 기기를 쓰려면 학원에 기기 초기화를 요청해 주세요.',
    DEVICE_REQUIRED:'이 브라우저가 로그인 정보 저장을 막고 있어요. 일반 창에서 다시 시도해 주세요.',
    ROSTER_UNAVAILABLE:'학생 명단을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
  };

  function messageFor(error){
    var code=error&&(error.code||error.message);
    if(code&&MESSAGES[code])return MESSAGES[code];
    return '잠시 후 다시 시도해 주세요.';
  }

  function same(a,b){
    var auth=AUTH();
    if(!auth)return String(a||'').trim()===String(b||'').trim();
    return auth.normalizeName(a)===auth.normalizeName(b);
  }

  /* 이 브라우저가 해당 학생으로 인증되어 있는지 서버에서 확인한다.
   * 결과: {ok:true} | {ok:false, reason:'NO_SESSION'|'OTHER_STUDENT'|'INACTIVE'|'NOT_VERIFIED'} */
  async function check(name){
    var auth=AUTH();
    if(!auth)return {ok:false,reason:'NO_SESSION'};
    var session=await auth.getSession('student');
    if(!session)return {ok:false,reason:'NO_SESSION'};
    if(!same(session.login_name,name))return {ok:false,reason:'OTHER_STUDENT'};
    try{
      var result=await auth.touchStudent();
      if(result&&result.ok&&same(result.student,name))return {ok:true};
      return {ok:false,reason:'OTHER_STUDENT'};
    }catch(error){
      var status=Number(error&&error.status||0);
      if(status===403){
        auth.clear('student');
        return {ok:false,reason:error.code==='STUDENT_INACTIVE'?'INACTIVE':'NOT_VERIFIED'};
      }
      if(status===401){auth.clear('student');return {ok:false,reason:'NO_SESSION'}}
      /* 일시적 연결 오류: 아직 만료되지 않은 서버 발급 세션이면 입장(데이터 권한은 서버 RLS가 다시 확인). */
      var saved=await auth.getSession('student');
      if(saved&&same(saved.login_name,name))return {ok:true,offline:true};
      return {ok:false,reason:'NO_SESSION'};
    }
  }

  async function signOut(){
    var auth=AUTH();
    if(auth)await auth.signOut('student');
  }

  /* index.html 로그인 상자 안의 이메일 인증 단계 */
  function el(id){return document.getElementById(id)}
  var state={name:'',email:'',resolve:null,reject:null,timer:null,busy:false};

  function show(step){
    var nameStep=el('name-step'),box=el('email-login');
    if(!box)return;
    if(nameStep)nameStep.classList.toggle('hidden',step!=='name');
    box.classList.toggle('hidden',step==='name');
    el('el-step-email').classList.toggle('hidden',step!=='email');
    el('el-step-code').classList.toggle('hidden',step!=='code');
    el('el-step-pin').classList.toggle('hidden',step!=='pin');
    setError('');
  }

  function setError(text){
    var box=el('el-error');if(!box)return;
    box.textContent=text||'';box.classList.toggle('hidden',!text);
  }

  function setBusy(busy){
    state.busy=busy;
    ['el-send','el-verify','el-pin-enter','el-pin-reset','el-back','el-change'].forEach(function(id){var b=el(id);if(b)b.disabled=busy});
    var resend=el('el-resend');if(resend&&busy)resend.disabled=true;
  }

  function startCooldown(){
    var button=el('el-resend');if(!button)return;
    var left=RESEND_SECONDS;
    clearInterval(state.timer);
    button.disabled=true;button.textContent='다시 받기 ('+left+'초)';
    state.timer=setInterval(function(){
      left-=1;
      if(left<=0){clearInterval(state.timer);button.disabled=false;button.textContent='인증번호 다시 받기';return}
      button.textContent='다시 받기 ('+left+'초)';
    },1000);
  }

  async function send(){
    if(state.busy)return;
    var email=String(el('el-email').value||'').trim();
    if(!email||email.indexOf('@')<1){setError(MESSAGES.INVALID_EMAIL);el('el-email').focus();return}
    setBusy(true);setError('');
    try{
      await AUTH().startEmailLogin(state.name,email);
      state.email=email;
      el('el-sent-to').textContent=email;
      el('el-code').value='';
      show('code');
      startCooldown();
      setTimeout(function(){el('el-code').focus()},50);
    }catch(error){
      setError(messageFor(error));
      if(error&&error.code==='STUDENT_INACTIVE'&&state.reject){var r=state.reject;state.reject=null;r(error)}
    }finally{setBusy(false)}
  }

  async function verify(){
    if(state.busy)return;
    var code=String(el('el-code').value||'').replace(/\s+/g,'');
    if(!/^\d{6,10}$/.test(code)){setError('메일로 받은 숫자 인증번호를 입력해 주세요.');el('el-code').focus();return}
    var pin=String(el('el-new-pin').value||'');
    if(!/^\d{4}$/.test(pin)){setError(MESSAGES.INVALID_PIN_FORMAT);el('el-new-pin').focus();return}
    if(pin!==el('el-confirm-pin').value){setError('접속번호 두 칸을 똑같이 입력해 주세요.');el('el-confirm-pin').focus();return}
    setBusy(true);setError('');
    try{
      var result=await AUTH().verifyEmailLogin(state.name,state.email,code,pin);
      clearInterval(state.timer);
      el('el-code').value='';
      el('el-new-pin').value='';el('el-confirm-pin').value='';el('el-pin').value='';
      show('name');
      var done=state.resolve;state.resolve=null;state.reject=null;
      if(done)done(result);
    }catch(error){
      setError(messageFor(error));
    }finally{setBusy(false)}
  }

  async function enterPin(){
    if(state.busy)return;
    var pin=String(el('el-pin').value||'');
    if(!/^\d{4}$/.test(pin)){setError(MESSAGES.INVALID_PIN_FORMAT);el('el-pin').focus();return}
    setBusy(true);setError('');
    try{
      var result=await AUTH().pinLogin(state.name,pin);
      el('el-pin').value='';show('name');
      var done=state.resolve;state.resolve=null;state.reject=null;if(done)done(result);
    }catch(error){
      if(error&&['PIN_LOCKED','PIN_NOT_READY'].indexOf(error.code)>=0)show('email');
      setError(messageFor(error));
    }finally{setBusy(false)}
  }

  function back(){
    clearInterval(state.timer);
    el('el-pin').value='';el('el-code').value='';el('el-new-pin').value='';el('el-confirm-pin').value='';
    show('name');
    var cancel=state.reject;state.resolve=null;state.reject=null;
    if(cancel){var e=new Error('CANCELLED');e.code='CANCELLED';cancel(e)}
  }

  var wired=false;
  function wire(){
    if(wired||!el('email-login'))return;
    wired=true;
    el('el-send').addEventListener('click',send);
    el('el-pin-enter').addEventListener('click',enterPin);
    el('el-pin-reset').addEventListener('click',function(){show('email');el('el-email').focus()});
    el('el-pin').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();enterPin()}});
    el('el-verify').addEventListener('click',verify);
    el('el-resend').addEventListener('click',function(){if(!el('el-resend').disabled){el('el-email').value=state.email;send()}});
    el('el-change').addEventListener('click',function(){clearInterval(state.timer);show('email');el('el-email').focus()});
    el('el-back').addEventListener('click',back);
    el('el-email').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();send()}});
    el('el-code').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();verify()}});
  }

  /* 이메일 인증 단계를 띄우고, 인증이 끝나면 resolve 한다. */
  function prompt(name){
    wire();
    if(state.reject){var old=state.reject;state.reject=null;var c=new Error('CANCELLED');c.code='CANCELLED';old(c)}
    state.name=name;state.email='';
    el('el-who').textContent=name;
    el('el-email').value='';
    el('el-pin').value='';el('el-code').value='';el('el-new-pin').value='';el('el-confirm-pin').value='';
    show('pin');
    setTimeout(function(){el('el-pin').focus()},50);
    return new Promise(function(resolve,reject){state.resolve=resolve;state.reject=reject});
  }

  global.GFIELD_EMAIL_LOGIN={
    REQUIRED:true,
    check:check,
    prompt:prompt,
    signOut:signOut,
    messageFor:messageFor
  };
})(window);
