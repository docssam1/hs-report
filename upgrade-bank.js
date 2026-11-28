/* '승급과정 문제은행' 시험지 목록: 시험지를 전체 / 단원별 / 회차별로 골라 보고, 고른 시험지를 한 번에 인쇄한다.
   시험지를 열면(openBook) 링크 버튼(답안)과 영상(해설강의)이 함께 나온다. 폴더 열람 권한은 기존 자료실 권한을 그대로 따른다.
   유사문제는 testbank/(테스트 문제은행)에서 만든다. 책장 기본 목록은 이미지 쪽으로만 이루어진 이 폴더를 올리지 않아 여기서 직접 그린다. */
(function () {
  'use strict';
  var FOLDER = '승급과정 문제은행';
  var DATA_URL = 'upgrade-bank/data/upgrade41.json';
  if (typeof renderArchive !== 'function') return;

  var style = document.createElement('style');
  style.textContent =
    '.ub-bar{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px;}' +
    '.ub-mode,.ub-chip{min-height:44px;padding:9px 16px;border-radius:999px;border:2px solid #1b2340;background:#fff;' +
    'color:var(--ink2);font-size:14px;font-weight:700;}' +
    '.ub-mode[aria-pressed="true"]{background:#141b5d;border-color:#141b5d;color:#fff;}' +
    '.ub-chip[aria-pressed="true"]{background:#ece3fb;border-color:#1b2340;color:#1b2340;}' +
    '.ub-mode:focus-visible,.ub-chip:focus-visible,.ub-print:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.ub-sum{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:4px 0 12px;font-size:13.5px;color:var(--ink2);}' +
    '.ub-print{min-height:44px;padding:9px 16px;border-radius:12px;border:2px solid #141b5d;background:#141b5d;color:#fff;font-size:14px;font-weight:700;box-shadow:0 3px 0 #070b33;}' +
    '.ub-print:disabled{opacity:.45;cursor:not-allowed;}';
  document.head.appendChild(style);

  function sheets() {
    return (D.books || []).filter(function (b) { return b && b.folder === FOLDER && b.imgdir && b.pages && canSeeBook(b); })
      .sort(function (a, b) { return ((a.unit || 99) - (b.unit || 99)) || ((parseInt(a.session, 10) || 99) - (parseInt(b.session, 10) || 99)); });
  }
  function uniq(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }
  function nl2br(s) { return escHtml(s).replace(/\n/g, '<br>'); }

  function sheetLabel(b) { return b.unit + '단원 ' + b.session; }
  var dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('data ' + r.status);
        return r.json();
      }).catch(function (e) { dataPromise = null; throw e; });
    }
    return dataPromise;
  }

  /* ---------- 폴더 화면 ---------- */
  function draw(sec) {
    var all = sheets();
    var units = uniq(all.map(function (b) { return b.unit; }));
    function sessionKey(b) { return sheetLabel(b); }
    var sessions = uniq(all.map(sessionKey));
    var counts = {};
    var state = { mode: 'all', units: units.slice(0, 1), sessions: sessions.slice(0, 1) };
    var head = '';
    if (!all.length) { sec.innerHTML = head + '<div class="empty-note" style="text-align:left;padding:8px 0">등록된 시험지가 없습니다.</div>'; return; }
    sec.innerHTML = head + '<div class="ub-top"></div>';
    var top = sec.querySelector('.ub-top');

    function selected() {
      if (state.mode === 'unit') return all.filter(function (b) { return state.units.indexOf(b.unit) >= 0; });
      if (state.mode === 'session') return all.filter(function (b) { return state.sessions.indexOf(sessionKey(b)) >= 0; });
      return all;
    }

    function render() {
      var pick = selected();
      var h = '<div class="ub-bar" role="group" aria-label="시험지 선택 방식">' +
        [['all', '전체'], ['unit', '단원별'], ['session', '회차별']].map(function (m) {
          return '<button type="button" class="ub-mode" data-mode="' + m[0] + '" aria-pressed="' + (state.mode === m[0]) + '">' + m[1] + '</button>';
        }).join('') + '</div>';
      if (state.mode === 'unit') {
        h += '<div class="ub-bar" role="group" aria-label="단원 선택">' + units.map(function (u) {
          return '<button type="button" class="ub-chip" data-unit="' + u + '" aria-pressed="' + (state.units.indexOf(u) >= 0) + '">' + u + '단원</button>';
        }).join('') + '</div>';
      } else if (state.mode === 'session') {
        h += '<div class="ub-bar" role="group" aria-label="회차 선택">' + sessions.map(function (s) {
          return '<button type="button" class="ub-chip" data-session="' + escAttr(s) + '" aria-pressed="' + (state.sessions.indexOf(s) >= 0) + '">' + escHtml(s) + '</button>';
        }).join('') + '</div>';
      }
      var asked = pick.reduce(function (n, b) { return n + (counts[b.title] || 0); }, 0);
      h += '<div class="ub-sum"><span>선택한 시험지 <b>' + pick.length + '</b>장' + (asked ? ' · <b>' + asked + '</b>문항' : '') + '</span>' +
        '<button type="button" class="ub-print"' + (pick.length ? '' : ' disabled') + '>선택한 시험지 한 번에 인쇄</button></div>';
      h += '<div class="shelf">' + pick.map(function (b) {
        var i = (D.books || []).indexOf(b);
        var cover = b.cover ? '<span class="cover"><img loading="lazy" src="' + escAttr(b.cover) + '" alt="' + escAttr(b.title) + '"></span>'
          : window.GFIELD_ILLUST ? '<span class="cover drawn">' + window.GFIELD_ILLUST.cover(b.title) + '</span>'
          : '<span class="cover noimg"><span class="cv-title">' + escHtml(b.title) + '</span></span>';
        return '<button class="book" data-ub="' + i + '">' + cover + '<span class="label">' + escHtml(b.title) + '</span><span class="pages">시험지' + (counts[b.title] ? ' · ' + counts[b.title] + '문항' : '') + '</span></button>';
      }).join('') + '</div>';
      top.innerHTML = h;
    }
    function toggle(list, value) {
      var at = list.indexOf(value);
      if (at >= 0) { if (list.length > 1) list.splice(at, 1); } else list.push(value);   // 한 개는 항상 선택
    }
    top.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('button');
      if (!t || !top.contains(t)) return;
      if (t.dataset.mode) { state.mode = t.dataset.mode; render(); return; }
      if (t.dataset.unit) { toggle(state.units, Number(t.dataset.unit)); render(); return; }
      if (t.dataset.session) { toggle(state.sessions, t.dataset.session); render(); return; }
      if (t.classList.contains('ub-print')) {
        var pick = selected();
        if (!pick.length) return;
        var rest = pick.slice(1).map(function (b) { return { dir: b.imgdir, pages: b.pages }; });
        printMaterial(pick[0].imgdir, pick[0].pages, FOLDER + ' ' + pick.length + '장', [], rest);
        return;
      }
      if (t.dataset.ub) openBook((D.books || [])[Number(t.dataset.ub)]);
    });
    render();
    loadData().then(function (d) {
      counts = {};
      d.sources.forEach(function (x) { counts[x.sheet] = (counts[x.sheet] || 0) + 1; });
      render();
    }).catch(function () {});
  }

  /* 로드맵 > 편입·승급과정의 「문제은행 program」 아래 시험지 목록을 그린다. 유사문제는 테스트 문제은행(testbank/)에서 만든다. */
  window.GFIELD_UPGRADE_BANK = { draw: draw };
})();
