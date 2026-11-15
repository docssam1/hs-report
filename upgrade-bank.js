/* '승급과정 문제은행' 자료실 폴더
   1) 시험지를 전체 / 단원별 / 회차별로 골라 보고, 고른 시험지를 한 번에 인쇄한다.
   2) 고른 시험지의 문제마다 낮춰서 / 같은 수준 / 높여서 유사문제를 규칙으로 새로 만들어(무한 생성) 풀고, 정답·풀이는 따로 열어 보며, 문제지와 답안을 따로 인쇄한다.
   폴더 열람 권한은 기존 자료실 권한(archiveAccess·학생별 폴더 승인)을 그대로 따른다.
   책장 기본 목록은 pdf·영상·링크가 있는 교재만 올리므로, 이미지 쪽으로만 이루어진 이 폴더는 여기서 직접 그린다. */
(function () {
  'use strict';
  var FOLDER = '승급과정 문제은행';
  var DATA_URL = 'upgrade-bank/data/upgrade41.json';
  var GEN_URL = 'upgrade-bank/generators.js?v=20261115-gen1';
  var MAX_TOTAL = 60;
  if (typeof renderArchive !== 'function') return;

  var style = document.createElement('style');
  style.textContent =
    '.ub-bar{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px;}' +
    '.ub-mode,.ub-chip{min-height:44px;padding:9px 16px;border-radius:999px;border:1px solid var(--line2);background:var(--card);' +
    'color:var(--ink2);font-size:14px;font-weight:700;}' +
    '.ub-mode[aria-pressed="true"]{background:var(--orange);border-color:var(--orange-d);color:#fff;}' +
    '.ub-chip[aria-pressed="true"]{background:#edf3ff;border-color:#2456c4;color:#1f3f8f;}' +
    '.ub-mode:focus-visible,.ub-chip:focus-visible,.ub-print:focus-visible,.ub-btn:focus-visible,.ub-sel:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.ub-sum{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:4px 0 12px;font-size:13.5px;color:var(--ink2);}' +
    '.ub-print,.ub-btn{min-height:44px;padding:9px 16px;border-radius:12px;border:1px solid #2456c4;background:#2456c4;color:#fff;font-size:14px;font-weight:700;}' +
    '.ub-btn.ghost{background:#fff;color:#1f3f8f;}' +
    '.ub-print:disabled,.ub-btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '.ub-prac{margin:22px 0 10px;padding:16px 16px 18px;background:#fff;border:1px solid var(--line);border-radius:16px;}' +
    '.ub-prac h4{font-size:17px;margin:0 0 4px;color:var(--ink);}' +
    '.ub-note{font-size:12.5px;color:var(--ink2);line-height:1.6;margin:2px 0 10px;}' +
    '.ub-lab{font-size:13px;font-weight:700;color:var(--ink2);margin:12px 0 4px;}' +
    '.ub-sel{min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--line2);background:#fff;font-size:14px;}' +
    '.ub-q{margin:12px 0;padding:14px;border:1px solid var(--line);border-radius:12px;background:#fffdf9;}' +
    '.ub-q-h{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px;color:var(--ink2);margin-bottom:6px;}' +
    '.ub-q-n{font-weight:800;color:var(--ink);font-size:15px;}' +
    '.ub-tag{padding:2px 9px;border-radius:999px;background:#fff3e6;border:1px solid #fcdcb8;color:var(--accent);font-weight:700;}' +
    '.ub-q-t{white-space:pre-wrap;line-height:1.75;font-size:15px;color:var(--ink);}' +
    '.ub-ans{margin-top:10px;padding:10px 12px;border-radius:10px;background:#edf3ff;border:1px solid #cbd8ec;font-size:14px;line-height:1.7;}' +
    '.ub-ans b{color:#1f3f8f;}' +
    '.ub-draft{font-size:12px;color:#8a5a00;background:#fff7e0;border:1px solid #f0d58a;border-radius:8px;padding:6px 10px;margin:8px 0;}';
  document.head.appendChild(style);

  function sheets() {
    return (D.books || []).filter(function (b) { return b && b.folder === FOLDER && b.imgdir && b.pages && canSeeBook(b); })
      .sort(function (a, b) { return (a.unit - b.unit) || (parseInt(a.session, 10) - parseInt(b.session, 10)); });
  }
  function uniq(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }
  function nl2br(s) { return escHtml(s).replace(/\n/g, '<br>'); }

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

  var genPromise = null;
  function loadGen() {
    if (root_gen()) return Promise.resolve(root_gen());
    if (!genPromise) {
      genPromise = new Promise(function (resolve, reject) {
        var sc = document.createElement('script');
        sc.src = GEN_URL; sc.onload = function () { resolve(root_gen()); };
        sc.onerror = function () { genPromise = null; reject(new Error('generator')); };
        document.head.appendChild(sc);
      });
    }
    return genPromise;
  }
  function root_gen() { return window.UPGRADE41_GEN || null; }

  /* ---------- 유사문제 학습 ---------- */
  function practice(host, getSheets) {
    var st = { src: [], lv: ['same'], count: 3, picked: null, shown: {}, seed: 0, short: [], capped: false, seedText: '' };
    var data = null, failed = false;

    function sourcesNow() {
      if (!data) return [];
      var titles = getSheets().map(function (b) { return b.title; });
      return data.sources.filter(function (s) { return titles.indexOf(s.sheet) >= 0; });
    }
    function norm() {
      var ids = sourcesNow().map(function (s) { return s.id; });
      st.src = st.src.filter(function (id) { return ids.indexOf(id) >= 0; });
      if (!st.src.length && ids.length) st.src = [ids[0]];
    }
    function ruleOf(id) { var l = data.levels.find(function (x) { return x.id === id; }); return l ? l : { label: id, rule: '' }; }

    function newSeed() { return Math.floor(Math.random() * 900000) + 100000; }
    function pick(seed) {
      var srcIds = sourcesNow().filter(function (x) { return st.src.indexOf(x.id) >= 0; }).map(function (x) { return x.id; });
      var combos = srcIds.length * st.lv.length, per = st.count;
      st.capped = false;
      if (combos * per > MAX_TOTAL) { per = Math.max(1, Math.floor(MAX_TOTAL / combos)); st.capped = true; }
      var requests = [];
      srcIds.forEach(function (id) { data.levels.forEach(function (lv) { if (st.lv.indexOf(lv.id) >= 0) requests.push({ source: id, level: lv.id, count: per }); }); });
      st.seed = seed || newSeed();
      var list = window.UPGRADE41_GEN.generateSet(requests, st.seed);
      st.short = list.short || [];
      st.picked = list.map(function (it) { it.solutionSteps = it.steps; return it; });
      st.shown = {};
    }

    function head() {
      return '<h4>유사문제 학습</h4><div class="ub-note">시험지 문제를 고른 뒤 난이도를 정하면 같은 유형의 유사문제가 새로 만들어집니다. 누를 때마다 다른 문제가 나옵니다. 먼저 풀어 본 다음 정답·풀이를 확인하세요.</div>';
    }
    function render() {
      if (failed) { host.innerHTML = '<div class="ub-prac">' + head() + '<div class="empty-note" style="text-align:left">유사문제를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.</div></div>'; return; }
      if (!data) { host.innerHTML = '<div class="ub-prac">' + head() + '<div class="ub-note">불러오는 중…</div></div>'; return; }
      norm();
      var srcs = sourcesNow();
      var h = '<div class="ub-prac">' + head();
      h += '<div class="ub-lab">시험지 문제</div><div class="ub-bar" role="group" aria-label="시험지 문제 선택">' + srcs.map(function (s) {
        return '<button type="button" class="ub-chip" data-src="' + escAttr(s.id) + '" aria-pressed="' + (st.src.indexOf(s.id) >= 0) + '">' +
          escHtml(s.session + ' ' + s.no + '번 · ' + s.name) + '</button>';
      }).join('') + '</div>';
      h += '<div class="ub-lab">난이도</div><div class="ub-bar" role="group" aria-label="난이도 선택">' + data.levels.map(function (l) {
        return '<button type="button" class="ub-chip" data-lv="' + l.id + '" aria-pressed="' + (st.lv.indexOf(l.id) >= 0) + '">' + escHtml(l.label) + '</button>';
      }).join('') + '</div>';
      h += '<div class="ub-note">' + data.levels.map(function (l) { return '<b>' + escHtml(l.label) + '</b>: ' + escHtml(l.rule); }).join(' · ') + '</div>';
      h += '<div class="ub-lab">한 가지 조합에서 나올 문항 수</div><select class="ub-sel" aria-label="문항 수">' +
        [1, 2, 3, 4, 5, 6, 8, 10].map(function (n) { return '<option value="' + n + '"' + (st.count === n ? ' selected' : '') + '>' + n + '개</option>'; }).join('') + '</select>' +
        '<div class="ub-note">한 번에 최대 ' + MAX_TOTAL + '문항까지 만듭니다.</div>';
      h += '<div class="ub-bar" style="margin-top:12px"><button type="button" class="ub-btn" data-act="make"' + (st.src.length && st.lv.length ? '' : ' disabled') + '>' +
        (st.picked ? '다시 만들기' : '유사문제 만들기') + '</button>' +
        '<input class="ub-sel ub-seed" inputmode="numeric" maxlength="9" placeholder="생성 번호" aria-label="생성 번호" value="' + escAttr(st.seedText) + '" style="width:130px">' +
        '<button type="button" class="ub-btn ghost" data-act="seed">이 번호로 만들기</button></div>';
      if (st.picked) {
        if (!st.picked.length) h += '<div class="empty-note" style="text-align:left">조건에 맞는 문제가 없습니다.</div>';
        else {
          h += '<div class="ub-draft">' + escHtml(data.reviewNote) + '</div>';
          h += '<div class="ub-note">생성 번호 <b>' + st.seed + '</b> · 같은 번호를 입력하면 같은 문제를 다시 만들 수 있습니다.</div>';
          if (st.capped) h += '<div class="ub-note">문항이 너무 많아 조합마다 개수를 줄였습니다.</div>';
          if (st.short.length) h += '<div class="ub-note">' + st.short.map(function (x) { var s2 = data.sources.find(function (y) { return y.id === x.source; }); return escHtml(s2.session + ' ' + s2.no + '번 ' + ruleOf(x.level).label) + '은(는) 서로 다른 문제를 ' + x.made + '개까지만 만들 수 있습니다.'; }).join('<br>') + '</div>';
          h += '<div class="ub-bar"><button type="button" class="ub-btn" data-act="print-q">🖨 문제지 인쇄</button>' +
            '<button type="button" class="ub-btn ghost" data-act="print-a">🖨 정답·풀이 인쇄</button></div>';
          h += st.picked.map(function (it, n) {
            var s = data.sources.find(function (x) { return x.id === it.source; });
            var open = !!st.shown[it.id];
            return '<div class="ub-q"><div class="ub-q-h"><span class="ub-q-n">' + (n + 1) + '번</span><span class="ub-tag">' + escHtml(ruleOf(it.level).label) +
              '</span><span>' + escHtml(s.session + ' ' + s.no + '번 · ' + s.name) + '</span></div>' +
              '<div class="ub-q-t">' + nl2br(it.text) + '</div>' +
              '<div class="ub-bar" style="margin:10px 0 0"><button type="button" class="ub-btn ghost" data-ans="' + escAttr(it.id) + '">' + (open ? '정답·풀이 닫기' : '정답·풀이 보기') + '</button></div>' +
              (open ? '<div class="ub-ans"><div><b>정답</b> ' + escHtml(it.answer) + '</div><div style="margin-top:6px">' +
                it.solutionSteps.map(function (t, i) { return '<div>' + (i + 1) + '. ' + escHtml(t) + '</div>'; }).join('') + '</div></div>' : '') + '</div>';
          }).join('');
        }
      }
      host.innerHTML = h + '</div>';
    }

    function printWin(kind) {
      if (!currentStudent) { toast('로그인이 필요합니다'); return; }
      var w = window.open('', '_blank'); if (!w) { toast('팝업을 허용해 주세요'); return; }
      var name = escHtml(currentStudent + ' · 지필드 영재교육');
      var rows = st.picked.map(function (it, n) {
        var s = data.sources.find(function (x) { return x.id === it.source; });
        var meta = escHtml(ruleOf(it.level).label + ' · ' + s.session + ' ' + s.no + '번');
        if (kind === 'q') {
          return '<div class="q"><div class="qh"><b>' + (n + 1) + '.</b> <span>' + meta + '</span></div><div class="qt">' + nl2br(it.text) + '</div><div class="sp"></div></div>';
        }
        return '<div class="q"><div class="qh"><b>' + (n + 1) + '.</b> <span>' + meta + '</span></div><div class="qt"><b>정답</b> ' + escHtml(it.answer) + '</div>' +
          '<div class="qt sm">' + it.solutionSteps.map(function (t, i) { return (i + 1) + '. ' + escHtml(t); }).join('<br>') + '</div></div>';
      }).join('');
      var css = '*{box-sizing:border-box}body{margin:0;font-family:"Noto Sans KR",sans-serif;color:#222;background:#fff}' +
        '.pg{position:relative;padding:18mm 16mm}h1{font-size:18pt;margin:0 0 4mm}.sub{font-size:10pt;color:#555;margin-bottom:8mm}' +
        '.q{break-inside:avoid;margin:0 0 7mm;padding-bottom:3mm;border-bottom:1px dotted #aaa}.qh{font-size:10pt;color:#555;margin-bottom:2mm}.qh b{font-size:13pt;color:#000}' +
        '.qt{font-size:12pt;line-height:1.75}.qt.sm{font-size:10.5pt;color:#333;margin-top:2mm}.sp{height:38mm}' +
        '.wm{position:fixed;inset:0;pointer-events:none;display:flex;flex-direction:column;justify-content:space-around;align-items:center;overflow:hidden}' +
        '.wm span{font-size:22pt;font-weight:800;color:rgba(70,70,70,.13);transform:rotate(-24deg);white-space:nowrap}' +
        '@page{size:A4;margin:0}@media print{.bar{display:none}}.bar{position:sticky;top:0;background:#1e3c72;color:#fff;padding:10px;text-align:center;font-weight:700}';
      var title = kind === 'q' ? '승급과정 문제은행 · 유사문제' : '승급과정 문제은행 · 정답과 풀이';
      w.document.write('<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>' + escHtml(title) + '</title><style>' + css + '</style></head><body>' +
        '<div class="bar">인쇄 창이 열립니다. 인쇄가 되지 않으면 Ctrl(⌘)+P를 눌러 주세요.</div><div class="wm"><span>' + name + '</span><span>' + name + '</span><span>' + name + '</span><span>' + name + '</span></div>' +
        '<div class="pg"><h1>' + escHtml(title) + '</h1><div class="sub">이름: ' + escHtml(currentStudent) + ' · ' + escHtml(data.grade) + ' ' + escHtml(data.course) + ' · 생성 번호 ' + st.seed + '</div>' + rows + '</div>' +
        '<scr' + 'ipt>setTimeout(function(){window.print()},400)</scr' + 'ipt></body></html>');
      w.document.close();
    }

    host.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('button');
      if (!t || !host.contains(t) || !data) return;
      function toggle(list, v) { var at = list.indexOf(v); if (at >= 0) { if (list.length > 1) list.splice(at, 1); } else list.push(v); }
      if (t.dataset.src) { toggle(st.src, t.dataset.src); st.picked = null; render(); return; }
      if (t.dataset.lv) { toggle(st.lv, t.dataset.lv); st.picked = null; render(); return; }
      if (t.dataset.ans) { st.shown[t.dataset.ans] = !st.shown[t.dataset.ans]; render(); return; }
      if (t.dataset.act === 'make') { pick(); render(); return; }
      if (t.dataset.act === 'seed') {
        var inp = host.querySelector('.ub-seed'), n2 = Number((inp.value || '').replace(/\D/g, ''));
        st.seedText = inp.value;
        if (!n2) { toast('생성 번호를 숫자로 입력해 주세요'); return; }
        pick(n2); render(); return;
      }
      if (t.dataset.act === 'print-q') { printWin('q'); return; }
      if (t.dataset.act === 'print-a') { printWin('a'); return; }
    });
    host.addEventListener('change', function (e) {
      if (e.target.classList && e.target.classList.contains('ub-sel') && e.target.tagName === 'SELECT') { st.count = Number(e.target.value); st.picked = null; render(); }
    });

    render();
    Promise.all([loadData(), loadGen()]).then(function (r) { data = r[0]; render(); }).catch(function () { failed = true; render(); });
    return { refresh: function () { st.picked = null; render(); } };
  }

  /* ---------- 폴더 화면 ---------- */
  function draw(sec) {
    var all = sheets();
    var units = uniq(all.map(function (b) { return b.unit; }));
    var sessions = uniq(all.map(function (b) { return b.session; }));
    var state = { mode: 'all', units: units.slice(0, 1), sessions: sessions.slice(0, 1) };
    var head = '<div class="shelf-h disp">📚 ' + escHtml(FOLDER) + '<span class="c">' + all.length + '권</span></div>';
    if (!all.length) { sec.innerHTML = head + '<div class="empty-note" style="text-align:left;padding:8px 0">등록된 시험지가 없습니다.</div>'; return; }
    sec.innerHTML = head + '<div class="ub-top"></div><div class="ub-practice"></div>';
    var top = sec.querySelector('.ub-top'), host = sec.querySelector('.ub-practice');

    function selected() {
      if (state.mode === 'unit') return all.filter(function (b) { return state.units.indexOf(b.unit) >= 0; });
      if (state.mode === 'session') return all.filter(function (b) { return state.sessions.indexOf(b.session) >= 0; });
      return all;
    }
    var prac = practice(host, selected);

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
      h += '<div class="ub-sum"><span>선택한 시험지 <b>' + pick.length + '</b>장</span>' +
        '<button type="button" class="ub-print"' + (pick.length ? '' : ' disabled') + '>🖨 선택한 시험지 한 번에 인쇄</button></div>';
      h += '<div class="shelf">' + pick.map(function (b) {
        var i = (D.books || []).indexOf(b);
        var cover = b.cover ? '<span class="cover"><img loading="lazy" src="' + escAttr(b.cover) + '" alt="' + escAttr(b.title) + '"></span>'
          : '<span class="cover noimg"><span class="cv-title">' + escHtml(b.title) + '</span></span>';
        return '<button class="book" data-ub="' + i + '">' + cover + '<span class="label">' + escHtml(b.title) + '</span><span class="pages">📄 시험지</span></button>';
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
      if (t.dataset.mode) { state.mode = t.dataset.mode; render(); prac.refresh(); return; }
      if (t.dataset.unit) { toggle(state.units, Number(t.dataset.unit)); render(); prac.refresh(); return; }
      if (t.dataset.session) { toggle(state.sessions, t.dataset.session); render(); prac.refresh(); return; }
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
  }

  var original = renderArchive;
  renderArchive = function () {
    var r = original.apply(this, arguments);
    var wrap = document.getElementById('archive-list');
    if (!wrap || (typeof isDemo !== 'undefined' && isDemo)) return r;
    Array.prototype.slice.call(wrap.querySelectorAll('.shelf-sec')).forEach(function (sec) {
      var head = sec.querySelector('.shelf-h');
      if (head && head.textContent.indexOf(FOLDER) >= 0) {
        var fresh = sec.cloneNode(false);            // 이전 이벤트 연결을 버리고 새로 그린다
        sec.parentNode.replaceChild(fresh, sec);
        draw(fresh);
      }
    });
    return r;
  };
})();
