/* 편입·승급 자료실: 초등 문제은행 중 4학년만 쓴다(curriculum.js 다음, app.js 앞에 불러온다) */
(function () {
  var C = window.HSE_CURRICULUM;
  if (C && Array.isArray(C.semesters)) C.semesters = C.semesters.filter(function (x) { return x.grade === 4; });
})();
