/* 테스트 문제은행: 4학년 유사문제 은행(elementary4/app.js)과 같은 화면에 "수업 시험지 → 단원 → 번호별 유형"을 담는다.
   목록은 upgrade-bank/data/upgrade41.json, 시험지 공개 여부는 data.js의 '승급과정 문제은행' 교재를 따른다.
   문제는 세 곳에서 만든다: 일일테스트 규칙 생성기(upgrade-bank/generators.js), 2단원 그림 생성기(generators-u2.js),
   황소 초등 문제은행 4학년 생성기(elementary4/generators.js). */
(function (root) {
  'use strict';
  var FOLDER = '승급과정 문제은행';
  var UNIT_NAMES = { 1: '큰 수', 2: '각도', 3: '곱셈과 나눗셈', 4: '평면도형의 이동', 5: '막대그래프', 6: '규칙 찾기' };
  var LEVEL = { '-1': 'lower', '0': 'same', '1': 'higher' };
  var elem = root.HSE_GENERATORS;   // 아래에서 같은 이름을 바꿔 달기 전에 4학년 생성기를 잡아 둔다
  var inventory = (root.HSE_SOURCE_INVENTORY_41 || {}).items || [];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function br(s) { return esc(s).replace(/\n/g, '<br>'); }

  function make(source, offset, seed) {
    var level = LEVEL[String(offset)] || 'same', prompt, answer, steps;
    if (source.engine === 'u2') {
      var u = root.UPGRADE41_U2.generate(source.id, level, seed >>> 0);
      if (!u) return null;
      prompt = u.html; answer = u.answer; steps = esc(u.solution);
    } else if (source.engine === 'elem4') {
      var item = inventory.find(function (x) { return x.sourceItemId === source.item; });
      var g = item && elem.generate(item, 2, offset, seed >>> 0, item.variant);
      if (!g) return null;
      prompt = String(g.prompt).replace(/<span hidden[^>]*><\/span>/g, ''); answer = g.answer; steps = esc(g.solution);
    } else {
      var r = root.UPGRADE41_GEN.generateSet([{ source: source.id, level: level, count: 1 }], seed % 900000 + 100000)[0];
      if (!r) return null;
      prompt = '<div>' + br(r.text) + '</div>'; answer = r.answer;
      steps = r.steps.map(function (t, i) { return (i + 1) + '. ' + esc(t); }).join('<br>');
    }
    var solution = (source.hideSolution ? '' : steps) + (source.how ? (source.hideSolution ? '' : '<br>') + '<b>푸는 순서</b> ' + esc(source.how) : '');
    return { prompt: prompt, answer: String(answer), solution: solution, difficultyLevel: offset + 1 };
  }

  function curriculumFrom(data, books) {
    var titles = books.map(function (b) { return b.title; });
    var units = [];
    data.sources.filter(function (s) { return titles.indexOf(s.sheet) >= 0; }).forEach(function (s) {
      var unit = units.find(function (u) { return u.number === s.unit; });
      if (!unit) { unit = { id: 'tb-u' + s.unit, number: s.unit, name: UNIT_NAMES[s.unit] || s.unit + '단원', subunits: [] }; units.push(unit); }
      var sheet = unit.subunits.find(function (x) { return x.name === s.sheet; });
      if (!sheet) { sheet = { id: 'tb-s' + s.unit + '-' + s.session, name: s.sheet, session: s.session, types: [] }; unit.subunits.push(sheet); }
      sheet.types.push({ id: s.id, name: s.name, label: s.name, number: s.no, typeNumber: s.no, difficultyBand: 0, generatorKey: s.id,
        source: s, rowNote: s.unit + '단원 ' + s.session + ' · ' + s.no + '번 문제' });
    });
    units.sort(function (a, b) { return a.number - b.number; });
    units.forEach(function (u) {
      u.subunits.sort(function (a, b) { return (parseInt(a.session, 10) || 99) - (parseInt(b.session, 10) || 99); });
      u.subunits.forEach(function (x, i) { x.number = i + 1; x.types.sort(function (a, b) { return a.number - b.number; }); });
    });
    return {
      version: data.version, levels: [{ id: 'simwha', label: '같은 수준', rank: 1 }],
      startCollapsed: true,
      difficultyLabels: { '-1': '낮춰서', '0': '같은 수준', '1': '높여서' }, bankName: '테스트 문제은행', subunitCaption: '시험지', showBand: false,
      emptySelection: '왼쪽 시험지 목록에서 번호(유형)를 선택하세요.',
      semesters: [{ id: '4-1', label: '4학년 1학기', grade: 4, term: 1, units: units }]
    };
  }

  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error(src)); };
      document.body.appendChild(s);
    });
  }
  function fail() {
    var el = document.getElementById('typeList');
    if (el) el.innerHTML = '<p class="tb-load-fail">문제은행을 불러오지 못했습니다. 새로고침해 주세요.</p>';
  }

  root.GFIELD_TESTBANK = { make: make, curriculumFrom: curriculumFrom };
  fetch('../upgrade-bank/data/upgrade41.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('data'); return r.json(); }).then(function (data) {
    var D = root.GFIELD_DATA || {};
    var books = (D.books || []).filter(function (b) { return b && b.folder === FOLDER && b.imgdir && b.pages; });
    root.HSE_CURRICULUM = curriculumFrom(data, books);
    root.HSE_GENERATORS = {
      generatorKey: function (type) { return type.generatorKey || ''; },
      generate: function (type, rank, offset, seed) { return make(type.source, offset, seed); }
    };
    return load('../elementary4/app.js?v=20261129-sync').then(function () {
      /* app.js가 이름 칸을 채운 뒤에 자료실 로그인 이름을 다시 넣는다 */
      if (root.GFIELD_ELEM4_GATE) root.GFIELD_ELEM4_GATE.start();
      return load('./hover.js?v=20261128a');
    });
  }).catch(fail);
})(window);
