/* 2월 과정 학생에게 "현재 주차까지" 자료 권한을 더하는 제공자.
   student-access-policy.js의 GFIELD_COHORT_ACCESS 자리에 연결되며, 권한을 더하기만 한다.
   draft 상태, 명단 밖 학생, 졸업·정지 학생에게는 아무것도 주지 않는다. */
(function (root) {
  'use strict';
  var NOV_ID = { final: ['sep-w1', 'sep-14', 'sep-21', 'sep-28'], last: ['oct-5', 'oct-12', 'oct-19', 'oct-26'] };
  var NONE = {};

  function grants(data, name) {
    var R = root.GFIELD_ROADMAP_FEB;
    name = String(name || '').trim();
    if (!R || !R.meta || R.meta.status !== 'published' || !name) return NONE;
    var cfg = (data && data.febRoadmap) || {};   /* 어드민 설정이 있으면 파일 기본값보다 우선 */
    var members = Array.isArray(cfg.members) ? cfg.members : R.meta.members;
    var currentId = cfg.currentWeekId || R.meta.currentWeekId;
    if (!Array.isArray(members) || members.indexOf(name) < 0) return NONE;
    var type = ((data && data.studentTypes) || {})[name];
    if (type === 'withdrawn' || type === 'graduated') return NONE;
    var weeks = (R.nodes || []).filter(function (n) { return n.type === 'week'; });
    var current = weeks.findIndex(function (n) { return n.id === currentId; });
    if (current < 0) return NONE;
    var out = { attendance: [], products: [], folders: [] };
    weeks.slice(0, current + 1).forEach(function (node) {
      var s = node.source || {};
      out.attendance.push(node.id);
      if (s.final) out.attendance.push(NOV_ID.final[s.final - 1]);
      if (s.last) out.attendance.push(NOV_ID.last[s.last - 1]);
      if (s.mid) out.products.push('mock-mid-' + s.mid);
    });
    return out;
  }
  root.GFIELD_COHORT_ACCESS = Object.freeze({ grants: grants });
})(window);
