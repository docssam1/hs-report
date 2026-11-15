/* 로드맵 화면에 "11월 로드맵 / 2월 로드맵" 선택을 추가하고, 2월 과정 학생에게 "이번 주" 카드와 주차별 자료를 보여 준다.
   11월 로드맵(#timeline, .legend)은 그대로 두고 숨기거나 보이기만 한다.
   자료 권한은 roadmap-feb-access.js(제공자)가 정책에 더하며, 이 파일은 화면만 다룬다. */
(function () {
  'use strict';
  var view = document.getElementById('view-roadmap');
  var R = window.GFIELD_ROADMAP_FEB;
  var D = window.GFIELD_DATA || {};
  if (!view || !R || !R.meta || !Array.isArray(R.nodes)) return;

  var CORE_NAMES = { 1: 'NUMBERS', 2: 'Algebra', 3: 'Numbers & Case', 4: 'Geometry' };
  var NOV_IDS = { final: ['sep-w1', 'sep-14', 'sep-21', 'sep-28'], last: ['oct-5', 'oct-12', 'oct-19', 'oct-26'] };
  var preview = false;
  try { preview = new URLSearchParams(location.search).get('feb') === 'preview'; } catch (e) {}
  var published = R.meta.status === 'published';
  /* 어드민(data.js의 febRoadmap)에서 정한 명단·현재 주차가 있으면 파일 기본값 대신 쓴다. */
  (function () {
    var cfg = (window.GFIELD_DATA || {}).febRoadmap;
    if (!cfg) return;
    if (Array.isArray(cfg.members)) R.meta.members = cfg.members;
    if (cfg.currentWeekId) R.meta.currentWeekId = cfg.currentWeekId;
  })();
  var weeks = R.nodes.filter(function (n) { return n.type === 'week'; });

  function student() { return typeof currentStudent !== 'undefined' && currentStudent ? currentStudent : ''; }
  function demo() { return typeof isDemo !== 'undefined' && isDemo; }
  function isMember() {
    return published && !demo() && Array.isArray(R.meta.members) && R.meta.members.indexOf(student()) >= 0;
  }
  function currentIndex() {
    return weeks.findIndex(function (n) { return n.id === R.meta.currentWeekId; });
  }
  function isOpen(node) {
    var i = weeks.indexOf(node), cur = currentIndex();
    if (i < 0 || cur < 0 || i > cur) return false;
    return isMember() || (!published && preview && !demo());
  }

  /* ---------- 자료 만들기: 11월 교재 항목은 복사하지 않고 원본을 그대로 가리킨다(권한 검사가 같은 항목인지 확인한다). ---------- */
  function bookList() { return Array.isArray(D.books) ? D.books : []; }
  function novTextbooks() {
    var out = [];
    Object.keys(D.content || {}).forEach(function (k) {
      if (k.indexOf('feb-') === 0) return;
      ((D.content[k] && D.content[k].textbooks) || []).forEach(function (t) { if (t) out.push(t); });
    });
    return out;
  }
  function findBook(folder, title) {
    return bookList().find(function (b) { return b && b.folder === folder && b.title === title; }) || null;
  }
  function linkOf(book, label) {
    var l = ((book && book.links) || []).find(function (x) { return x && x.label === label; });
    return l ? l.url : '';
  }

  function coreContent(n) {
    var core = bookList().find(function (b) { return b && b.accessKey === 'concept-core'; });
    var lines = ['THINKING CORE CH' + n + ' · ' + CORE_NAMES[n]];
    var lec = linkOf(core, 'CH' + n + ' 학습영상'), semi = linkOf(core, 'CH' + n + ' Semi ' + n + '회');
    if (lec) lines.push('학습영상) ' + lec);
    if (semi) lines.push('SEMI 테스트 영상) ' + semi);
    var tb = novTextbooks().find(function (t) { return /Thinking Core/i.test(t.title || '') && t.folder && t.pages; });
    return { notice: lines.join('\n'), homework: '', textbooks: tb ? [tb] : [] };
  }
  function midContent(n) {
    var book = bookList().find(function (b) { return b && b.folder === '중급 모의고사' && b.pdf && new RegExp('모의고사\\s*' + n + '회').test(b.title || ''); });
    var hw = '[[hlp:황소 대비 모의고사 중급 ' + n + '회]]' + (book && book.video ? '\n학습영상) ' + book.video : '');
    var paperRe = new RegExp('(모의고사\\s*' + n + '회\\s*중급$)|(^중급\\s*모의고사\\s*' + n + '회$)');
    var paper = novTextbooks().find(function (t) { return paperRe.test(t.title || '') && (t.folder || t.url); });
    var tbs = [];
    if (paper) tbs.push(paper); else if (book) tbs.push({ title: book.title, url: book.pdf });
    tbs.push({ title: '중급 모의고사 ' + n + '회 · 답안·교재 연결표', url: 'https://hs.gfieldacademy.net/answer.html?round=' + n });
    return { homework: hw, textbooks: tbs };
  }
  function roundContent(kind, n) {
    var title = (kind === 'final' ? '파이널' : '최종') + ' 실전 모의고사 ' + n + '회';
    var book = findBook(kind === 'final' ? '파이널 모의고사' : '최종 모의고사', title);
    var src = (D.content || {})[NOV_IDS[kind][n - 1]] || {};
    var tbs = (src.textbooks || []).slice();
    if (kind === 'last') {
      tbs.push({ title: title + ' · 실전 타이머', url: 'final.html?set=last&round=' + n + '&go=timer', febName: true });
      tbs.push({ title: title + ' · 오답 입력·분석', url: 'last1-entry.html?round=' + n, febName: true });
    }
    return { notice: book && book.video ? '학습영상) ' + book.video : '', homework: '', textbooks: tbs };
  }
  function build(node) {
    var s = node.source || {}, c;
    if (s.core) {
      var a = coreContent(s.core), m = midContent(s.mid);
      c = { notice: a.notice, homework: m.homework, textbooks: a.textbooks.concat(m.textbooks) };
    } else if (s.final) c = roundContent('final', s.final);
    else if (s.last) c = roundContent('last', s.last);
    else c = { notice: '', homework: '', textbooks: [] };
    var note = String(node.comment || '').trim();   // 선생님 코멘트는 학습 내용 맨 앞
    if (note) c.notice = note + (c.notice ? '\n\n' + c.notice : '');
    return c;
  }
  /* 칸마다 한 번만 만들어 D.content에 둔다. 권한 정책이 이 목록 안의 같은 항목인지 확인하기 때문이다. */
  function contentFor(node) {
    if (!D.content) D.content = {};
    if (!D.content[node.id]) D.content[node.id] = build(node);
    var c = D.content[node.id], who = encodeURIComponent(student());
    c.textbooks.forEach(function (t) {
      if (t.febName) t.url = t.url.replace(/&name=[^&]*/, '') + '&name=' + who;
    });
    return c;
  }

  /* ---------- 화면 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var style = document.createElement('style');
  style.textContent =
    '.rm-tabs{display:flex;gap:8px;padding:4px 0 10px;}' +
    '.rm-tab{flex:1;min-height:44px;padding:10px 14px;border-radius:999px;border:1px solid var(--line2);' +
    'background:var(--card);color:var(--ink2);font-size:14px;font-weight:700;}' +
    '.rm-tab[aria-selected="true"]{background:var(--orange);border-color:var(--orange-d);color:#fff;}' +
    '.rm-tab:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.rm-feb-note{margin:6px 0 12px;padding:12px 14px;border-radius:12px;background:#fff7ec;border:1px solid #fcdcb8;' +
    'color:var(--ink2);font-size:13.5px;line-height:1.6;}' +
    '.rm-feb-nov{display:flex;align-items:center;min-height:44px;margin:0 0 10px;padding:10px 14px;border-radius:12px;' +
    'background:#edf3ff;border:1px solid #cbd8e8;color:#1f3f8f;font-size:14px;font-weight:700;text-decoration:none;}' +
    '.rm-feb-nov:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.rm-feb-empty{padding:28px 18px;text-align:center;color:var(--ink2);font-size:14.5px;line-height:1.7;' +
    'background:var(--card);border:1px solid var(--line);border-radius:16px;}';
  document.head.appendChild(style);

  var tabs = document.createElement('div');
  tabs.className = 'rm-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', '로드맵 선택');
  tabs.innerHTML =
    '<button type="button" class="rm-tab" role="tab" id="rm-tab-nov" aria-selected="true" aria-controls="timeline">11월 로드맵</button>' +
    '<button type="button" class="rm-tab" role="tab" id="rm-tab-feb" aria-selected="false" aria-controls="rm-feb">2월 로드맵</button>';
  view.insertBefore(tabs, view.firstChild);

  var panel = document.createElement('div');
  panel.id = 'rm-feb';
  panel.className = 'hidden';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'rm-tab-feb');
  view.appendChild(panel);

  function render() {
    if (!published && !preview) {
      panel.innerHTML = '<div class="rm-feb-empty"><b>2월 시험 로드맵을 준비하고 있습니다.</b><br>일정이 확정되면 이곳에서 확인할 수 있습니다.</div>';
      return;
    }
    var html = '';
    if (!published) html += '<div class="rm-feb-note">미리보기입니다. 학생에게는 아직 공개되지 않은 초안입니다.</div>';
    if (R.meta.novMaterials) {
      html += '<a class="rm-feb-nov" href="' + esc(R.meta.novMaterials.url) + '">📎 ' + esc(R.meta.novMaterials.label) + ' 보기</a>';
    }
    html += '<div class="legend">' +
      '<span><i style="background:var(--exam)"></i>Thinking Core + 과제</span>' +
      '<span><i style="background:var(--final)"></i>파이널·최종 모의고사</span></div>';
    html += '<div class="timeline" id="timeline-feb">';
    R.nodes.forEach(function (n) {
      if (n.type === 'divider') {
        html += '<div class="divider"><span>' + esc(n.label) + '</span></div>';
      } else if (n.type === 'goal') {
        html += '<div class="node goal"><div class="date">' + esc(n.date) + '</div><h3 class="disp">' +
          esc(n.title) + '</h3><div class="desc">' + esc(n.desc) + '</div></div>';
      } else {
        var open = isOpen(n), cur = R.meta.currentWeekId && n.id === R.meta.currentWeekId;
        html += '<div class="node ' + esc(n.track) + (open ? '' : ' locked') + (cur ? ' current' : '') + '" data-feb-node="' + esc(n.id) +
          '" tabindex="0" role="button" aria-disabled="' + (open ? 'false' : 'true') + '">' +
          '<div class="icon-status" role="img" aria-label="' + (open ? '열림 · 이용 가능' : '잠김 · 이용 불가') + '">' + (open ? '🔓' : '🔒') + '</div>' +
          '<div class="date">' + esc(n.date) + (cur ? ' · 현재 진행 중' : '') + '</div><h3 class="disp">' + esc(n.title) + '</h3><div class="desc">' + esc(n.desc) + '</div>' +
          (n.focus ? '<div class="focus">' + esc(n.focus) + '</div>' : '') + '</div>';
      }
    });
    html += '</div>';
    panel.innerHTML = html;
  }

  function select(which) {
    var feb = which === 'feb';
    if (feb) render();   // 로그인 뒤 열림·잠금 상태를 다시 계산한다
    [view.querySelector('.legend'), document.getElementById('timeline')].forEach(function (el) { if (el) el.classList.toggle('hidden', feb); });
    panel.classList.toggle('hidden', !feb);
    document.getElementById('rm-tab-nov').setAttribute('aria-selected', String(!feb));
    document.getElementById('rm-tab-feb').setAttribute('aria-selected', String(feb));
  }

  function openNode(id) {
    var node = R.nodes.find(function (n) { return n.id === id; });
    if (!node || node.type !== 'week') return;
    if (demo()) { if (typeof toast === 'function') toast('🔎 데모에서는 열람할 수 없습니다'); return; }
    if (!isOpen(node)) { if (typeof toast === 'function') toast('🔒 아직 열리지 않은 주차입니다'); return; }
    contentFor(node);
    openModal(node, true);
  }

  /* ---------- 2월 과정 학생: 탭 표시, 이번 주 카드, 첫 화면 ---------- */
  function febHome() {
    var card = document.getElementById('home-card');
    var node = weeks[currentIndex()];
    if (!card || !node) return false;
    var c = contentFor(node);
    var h = '<div class="home-head"><div class="hh-tag">📍 이번 주 · ' + esc(node.date) + '</div><h2 class="disp">' + esc(node.title) + '</h2>' +
      '<div class="hh-desc">' + esc(node.desc || '') + '</div>' + (node.focus ? '<div class="focus">' + esc(node.focus) + '</div>' : '') + '</div>';
    h += '<div class="videoframe" id="home-videoframe"><iframe id="home-iframe" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>';
    h += '<div class="content-card">' + sectionsHTML(c, node) + '</div>';
    card.innerHTML = h;
    wireSections(card, { frame: document.getElementById('home-videoframe'), iframe: document.getElementById('home-iframe') });
    return true;
  }
  if (typeof renderHome === 'function') {
    var origHome = renderHome;
    renderHome = function () { if (isMember() && febHome()) return; return origHome.apply(this, arguments); };
  }
  if (typeof applyMemberTabs === 'function') {
    var origTabs = applyMemberTabs;
    applyMemberTabs = function () {
      var r = origTabs.apply(this, arguments);
      if (isMember()) document.querySelectorAll('.nav-btn').forEach(function (b) {
        if (b.dataset.v === 'home' || b.dataset.v === 'roadmap') b.style.display = '';
      });
      return r;
    };
  }
  var landed = false, openedFeb = false;
  if (typeof nav === 'function') {
    var origNav = nav;
    nav = function (v) {
      if (!landed && isMember()) { landed = true; if (v === 'archive') v = 'home'; }
      var r = origNav.call(this, v);
      if (v === 'roadmap' && isMember() && !openedFeb) { openedFeb = true; select('feb'); }
      return r;
    };
  }

  render();
  document.getElementById('rm-tab-nov').addEventListener('click', function () { select('nov'); });
  document.getElementById('rm-tab-feb').addEventListener('click', function () { select('feb'); });
  panel.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-feb-node]');
    if (el) openNode(el.getAttribute('data-feb-node'));
  });
  panel.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-feb-node]');
    if (el) { e.preventDefault(); openNode(el.getAttribute('data-feb-node')); }
  });
})();
