/* 학생 직접 주소(QR·북마크·이름 붙은 링크) 보호.
 * 페이지가 쓰려는 학생 이름과 이 브라우저의 이메일 인증 학생 세션이 서버 확인으로 일치할 때만 화면을 연다.
 * 일치하지 않으면 index.html 로 보내 이메일 인증 후 같은 주소로 돌아온다.
 * 관리자(선생님) 모드, 체험, 이름 없는 진입은 각 페이지의 기존 검사에 맡긴다.
 * 화면 확인용 보호이며, 공개 정적 자료·기존 익명 API 자체를 비공개로 바꾸지는 않는다.
 */
(function(global){
  'use strict';
  var doc=global.document;
  var script=doc.currentScript;
  var base=script&&script.src?script.src.replace(/[^\/?#]*(?:[?#].*)?$/,''):'';
  var VERSION='20261011-email-login-1';
  var HANDOFF_KEY='gfield_question_bank_handoff_v1';

  function param(name){try{return new URLSearchParams(global.location.search).get(name)||''}catch(e){return ''}}
  function readJson(store,key){try{return JSON.parse(store.getItem(key)||'null')}catch(e){return null}}

  function requestedStudent(){
    var name=param('name')||param('student');
    if(!name){var handoff=readJson(global.sessionStorage,HANDOFF_KEY);if(handoff&&handoff.student)name=String(handoff.student)}
    if(!name){try{name=global.localStorage.getItem('gfield_student')||''}catch(e){}}
    return String(name||'').trim();
  }

  var teacherMode=param('entry')==='teacher'||param('reportPrint')==='teacher';
  var name=requestedStudent();
  var lower=name.toLowerCase();
  if(teacherMode||!name||name==='체험'||lower==='demo'||lower==='docssam')return;

  var style=doc.createElement('style');
  style.id='gfield-student-guard-style';
  style.textContent='html.gfield-guard-pending body{visibility:hidden!important}';
  (doc.head||doc.documentElement).appendChild(style);
  doc.documentElement.classList.add('gfield-guard-pending');

  function reveal(){doc.documentElement.classList.remove('gfield-guard-pending')}

  function loginUrl(){
    var here=global.location.pathname.replace(/^\/+/,'')+global.location.search+global.location.hash;
    return base+'index.html?next='+encodeURIComponent(here);
  }

  function load(src){
    return new Promise(function(resolve,reject){
      var s=doc.createElement('script');s.src=base+src+'?v='+VERSION;s.async=false;
      s.onload=resolve;s.onerror=reject;(doc.head||doc.documentElement).appendChild(s);
    });
  }

  async function ensureDeps(){
    if(!global.GFIELD_AUTH)await load('hs-auth.js');
    if(!global.GFIELD_EMAIL_LOGIN)await load('hs-email-login.js');
  }

  async function run(){
    try{await ensureDeps()}catch(e){reveal();return}
    var EL=global.GFIELD_EMAIL_LOGIN,A=global.GFIELD_AUTH;
    if(!EL||!EL.REQUIRED||!A){reveal();return}
    try{
      var admin=await A.getSession('admin');
      if(admin){var user=await A.getUser('admin');var role=user&&user.app_metadata&&user.app_metadata.role;if(role==='admin'||role==='teacher'){reveal();return}}
    }catch(e){}
    var result=await EL.check(name);
    if(result.ok){reveal();return}
    global.location.replace(loginUrl());
  }

  global.GFIELD_STUDENT_GUARD={student:name,ready:run()};
})(window);
