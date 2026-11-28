/* 4학년 유사문제(편입·승급 자료실) 입장 확인.
   자료실에서 로그인한 학생 중 '승급·편입 자료실' 폴더가 열린 학생만 화면을 연다.
   규칙은 학생 화면의 canSeeArchiveFolder와 같다(student-access-policy.js).
   정적 사이트라 파일 자체를 숨기지는 못한다. 다른 자료실 자료와 같은 수준의 화면 잠금이다. */
(function (root) {
  'use strict';
  var FOLDER = root.GFIELD_GATE_FOLDER || '승급·편입 자료실';   // 테스트 문제은행(testbank/)은 '승급과정 문제은행'
  var HANDOFF_KEY = 'gfield_elem4_handoff';
  var HANDOFF_MAX_AGE = 12 * 60 * 60 * 1000;
  var localHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && root.__GFIELD_ELEM4_FORCE__ !== true;

  document.documentElement.classList.add('elem4-pending');
  var st = document.createElement('style');
  st.textContent = 'html.elem4-pending body>:not(#elem4Gate){visibility:hidden}' +
    '#elem4Gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:#eaf3ff;font-family:"Noto Sans KR",sans-serif}' +
    '#elem4Gate[hidden]{display:none}' +
    '#elem4Gate .card{width:min(100%,400px);padding:28px;border:2.5px solid #1b2340;border-radius:22px;background:#fff;box-shadow:0 6px 0 #1b2340;color:#1b2340;text-align:center}' +
    '#elem4Gate h1{font-size:21px;margin:0 0 8px}#elem4Gate p{font-size:14px;line-height:1.6;color:#4e5878;margin:0 0 16px}' +
    '#elem4Gate a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:12px;background:#141b5d;color:#fff;font-weight:800;text-decoration:none;box-shadow:0 3px 0 #070b33}';
  document.head.appendChild(st);

  function gate() {
    var g = document.getElementById('elem4Gate');
    if (g) return g;
    g = document.createElement('section');
    g.id = 'elem4Gate'; g.setAttribute('aria-live', 'polite');
    g.innerHTML = '<div class="card"><h1>학생 확인 중</h1><p id="elem4Msg">자료실 로그인 정보를 확인하고 있습니다.</p><a href="../index.html">자료실로 가기</a></div>';
    document.body.appendChild(g);
    return g;
  }
  function deny(msg) {
    gate();
    var m = document.getElementById('elem4Msg'); if (m) m.textContent = msg;
    var h = document.querySelector('#elem4Gate h1'); if (h) h.textContent = '열 수 없습니다';
  }
  function allow(name) {
    var g = gate(); g.hidden = true;
    document.documentElement.classList.remove('elem4-pending');
    /* 문제지·인쇄의 이름 칸에 학생 이름을 넣는다 */
    var input = document.getElementById('studentNameInput');
    if (input && name) { input.value = name; input.readOnly = true; }
  }
  function studentName() {
    var saved = '';
    try { saved = String(localStorage.getItem('gfield_student') || '').trim(); } catch (e) {}
    if (!saved) return '';
    try {   // 자료실 카드에서 들어온 표시가 있으면 같은 학생인지 확인
      var h = JSON.parse(sessionStorage.getItem(HANDOFF_KEY) || 'null');
      if (h && (h.student !== saved || Date.now() - Number(h.issuedAt || 0) > HANDOFF_MAX_AGE)) return '';
    } catch (e) {}
    return saved;
  }
  function permitted(name) {
    var D = root.GFIELD_DATA || {}, P = root.GFIELD_STUDENT_ACCESS;
    if (!name || !Array.isArray(D.students) || D.students.indexOf(name) < 0) return false;
    var type = (D.studentTypes || {})[name];
    if (type === 'withdrawn' || type === 'graduated') return false;
    var acc = (D.archiveAccess || {})[FOLDER];
    var legacy = Array.isArray(acc) && (acc.indexOf('*') >= 0 || acc.indexOf(name) >= 0);
    return P ? P.allows(D, name, 'folders', FOLDER, legacy) : legacy;
  }
  function start() {
    gate();
    if (localHost) { allow(studentName() || '검수'); return; }
    var name = studentName();
    if (!name) { deny('자료실에서 학생 이름으로 로그인한 뒤 「' + FOLDER + '」에서 열어 주세요.'); return; }
    if (!permitted(name)) { deny(name + ' 학생은 아직 ' + FOLDER + ' 권한이 열리지 않았습니다. 선생님께 문의해 주세요.'); return; }
    allow(name);
  }
  root.GFIELD_ELEM4_GATE = { permitted: permitted, studentName: studentName, start: start };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})(window);
