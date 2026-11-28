/* 편입·승급 자료실의 4학년 유사문제 은행(elementary4/)·테스트 문제은행(testbank/)용.
   황소 초등 문제은행 app.js는 학년·학기 승인 모듈(HSE_BANK_ACCESS, lete-on bank-access.js)을 쓴다.
   이 자료실은 입장 확인을 gate.js(자료실 로그인·폴더 권한)가 맡으므로, 불러온 학기(4-1·4-2)를 모두 연다. */
(function (root) {
  'use strict';
  function allowedPairs() {
    var semesters = (root.HSE_CURRICULUM && root.HSE_CURRICULUM.semesters) || [];
    return semesters.map(function (s) { return { grade: Number(s.grade), term: Number(s.term) }; });
  }
  root.HSE_BANK_ACCESS = {
    permissionKey: function (grade, term) { return grade + '-' + term; },
    allowedPairs: allowedPairs,
    canAccess: function (grade, term) {
      return allowedPairs().some(function (p) { return p.grade === Number(grade) && p.term === Number(term); });
    },
    firstAllowedPair: function () { return allowedPairs()[0] || null; },
    refresh: function () {}
  };
})(window);
