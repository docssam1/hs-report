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
    if (cfg.weeks && typeof cfg.weeks === 'object') R.meta.openWeeks = cfg.weeks;
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
    if (R.meta.openWeeks && isMember()) return (R.meta.openWeeks[student()] || []).indexOf(node.id) >= 0;
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
  function reviewContent(n) {
    var book = bookList().find(function (b) { return b && b.folder === '중급 모의고사' && new RegExp('모의고사\\s*' + n + '회\\s*중급$').test(b.title || ''); });
    var lec = '';
    ((book && book.links) || []).forEach(function (l) { if (l && /리뷰\s*강의/.test(l.label || '')) lec = l.url; });
    var re = new RegExp('모의고사\\s*' + n + '회\\s*중급\\s*리뷰$');
    var paper = novTextbooks().find(function (t) { return re.test(t.title || '') && (t.folder || t.url); });
    var lines = ['중급 모의고사 ' + n + '회 리뷰 · 유사문제'];
    if (lec) lines.push('리뷰 강의) ' + lec);
    return { notice: lines.join('\n'), textbooks: paper ? [paper] : [] };
  }
  function build(node) {
    var s = node.source || {}, c;
    if (s.core) {
      var a = coreContent(s.core), m = midContent(s.mid);
      c = { notice: a.notice, homework: m.homework, textbooks: a.textbooks.concat(m.textbooks) };
      if (s.review) {   // 수업 시간에 다시 푸는 중급 모의고사 리뷰(유사문제) 교재와 리뷰 강의
        var rv = reviewContent(s.review);
        if (rv.notice) c.notice += '\n\n' + rv.notice;
        c.textbooks = c.textbooks.concat(rv.textbooks);
      }
    } else if (s.final) c = roundContent('final', s.final);
    else if (s.last) c = roundContent('last', s.last);
    else c = { notice: '', homework: '', textbooks: [] };
    var saved = (D.febRoadmap && D.febRoadmap.comments) ? D.febRoadmap.comments[node.id] : '';   // 어드민에서 쓴 코멘트가 우선
    var note = String(saved || node.comment || '').trim();   // 선생님 코멘트는 학습 내용 맨 앞
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
  var I = window.GFIELD_ILLUST || null;
  var style = document.createElement('style');
  /* 로드맵 탭(11월·2월·승급)과 2월 화면. 색: 남색 #141b5d · 2월 파랑 #3f6fe0 · 승급 라일락 #7b55c7, 외곽선 #1b2340 */
  style.textContent =
    '.rm-tabs{display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 14px;}' +
    '.rm-tab{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:5px 16px 5px 5px;border-radius:999px;border:2px solid #1b2340;' +
    'background:#fff;color:#1b2340;font-size:14.5px;font-weight:700;box-shadow:0 3px 0 #1b2340;}' +
    '.rm-tab .rm-dot{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:2px solid #1b2340;background:#eef2fa;}' +
    '.rm-tab .hs-li{width:17px;height:17px;}' +
    '#rm-tab-feb .rm-dot{background:#dfe9ff}#rm-tab-upg .rm-dot{background:#ece3fb}' +
    '.rm-tab[aria-selected="true"]{background:#141b5d;color:#fff;}' +
    '#rm-tab-feb[aria-selected="true"]{background:#3f6fe0;}#rm-tab-upg[aria-selected="true"]{background:#7b55c7;}' +
    '.rm-tab[aria-selected="true"] .rm-dot{border-color:#fff;color:#1b2340;}' +
    '.rm-tab:active{transform:translateY(2px);box-shadow:0 1px 0 #1b2340;}' +
    '.rm-tab:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.rm-feb-note{margin:6px 0 12px;padding:12px 14px;border-radius:12px;background:#fff;border:2px dashed #8d99b8;color:#1b2340;font-size:13.5px;line-height:1.6;}' +
    '.rm-feb-nov{display:flex;align-items:center;gap:8px;min-height:44px;margin:14px 0 0;padding:10px 14px;border-radius:14px;' +
    'background:#fff;border:2px solid #1b2340;color:#1b2340;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 3px 0 #1b2340;}' +
    '.rm-feb-nov .hs-li{width:18px;height:18px;flex:none;color:#3f6fe0;}' +
    '.rm-feb-nov:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.rm-feb-empty{padding:28px 18px;text-align:center;color:#1b2340;font-size:14.5px;line-height:1.7;background:#fff;border:2px solid #1b2340;border-radius:20px;}' +
    /* 큰 그림 */
    '.fb-hero{position:relative;border:2.5px solid #1b2340;border-radius:24px;overflow:hidden;background:#cfe2ff;box-shadow:0 5px 0 #1b2340;}' +
    '.fb-hero .hs-scene{display:block;width:100%;height:auto;}' +
    '.fb-copy{position:absolute;left:22px;top:18px;max-width:48%;}' +
    '.fb-copy h2{font-size:27px;line-height:1.2;color:#1b2340;font-weight:400;}' +
    '.fb-copy p{margin-top:6px;font-size:13.5px;font-weight:500;line-height:1.6;color:#27304f;}' +
    '.fb-dday{display:inline-flex;align-items:baseline;gap:6px;margin-top:10px;background:#fff;border:2px solid #1b2340;border-radius:12px;' +
    'padding:5px 11px;box-shadow:0 3px 0 #1b2340;font-weight:700;font-size:13px;color:#1b2340;}' +
    '.fb-dday b{font-family:Jua,sans-serif;font-weight:400;font-size:22px;color:#3f6fe0;}' +
    /* 단계 카드 */
    '.fb-phase{margin-top:18px;background:#fff;border:2.5px solid #1b2340;border-radius:22px;overflow:hidden;}' +
    '.fb-ph-top{display:flex;align-items:stretch;border-bottom:2.5px solid #1b2340;}' +
    '.fb-ph-top .hs-ph-art{display:block;width:180px;height:80px;flex:none;border-right:2.5px solid #1b2340;}' +
    '.fb-ph-h{padding:12px 16px;align-self:center;}' +
    '.fb-ph-h h3{font-size:19px;font-weight:400;color:#1b2340;}' +
    '.fb-ph-h p{font-size:12.5px;color:#4e5878;font-weight:500;margin-top:2px;}' +
    '.fb-steps{list-style:none;display:grid;grid-template-columns:repeat(var(--cols,4),1fr);margin:0;padding:16px 10px 14px;position:relative;}' +
    '.fb-steps::before{content:"";position:absolute;left:calc(48% / var(--cols,4));right:calc(48% / var(--cols,4));top:32px;border-top:2.5px dashed #9fb2d8;}' +
    '.fb-step{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;width:100%;padding:0 4px 4px;' +
    'background:none;border:0;border-radius:14px;color:#1b2340;cursor:pointer;font-family:inherit;}' +
    '.fb-step:focus-visible{outline:3px solid #2456c4;outline-offset:2px;}' +
    '.fb-num{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:2.5px solid #1b2340;background:#fff;' +
    'font-family:Jua,sans-serif;font-size:16px;position:relative;z-index:1;margin-bottom:4px;}' +
    '.fb-t{font-size:13px;font-weight:700;line-height:1.3;word-break:keep-all;}' +
    '.fb-d{font-size:11.5px;color:#4e5878;font-weight:500;}' +
    '.fb-st{display:inline-flex;align-items:center;gap:3px;margin-top:3px;font-size:11.5px;font-weight:700;border-radius:8px;padding:2px 7px;}' +
    '.fb-st .hs-li{width:12px;height:12px;}' +
    '.fb-step.done .fb-num{background:#4fb884;color:#fff;}' +
    '.fb-step.done .fb-st{color:#1d6b46;background:#e0f4ea;}' +
    '.fb-step.open .fb-num{background:#dfe9ff;}' +
    '.fb-step.open .fb-st{color:#1f3f8f;background:#e8efff;}' +
    '.fb-step.now .fb-num{background:#f6cf47;}' +
    '.fb-step.now .fb-st{background:#1b2340;color:#fff;}' +
    '.fb-step.locked{color:#5d6683;cursor:not-allowed;}' +
    '.fb-step.locked .fb-num{background:#eef2fa;color:#5d6683;border-color:#8d99b8;}' +
    '.fb-step.locked .fb-st{color:#5d6683;}' +
    '.fb-step:not(.locked):hover .fb-num{transform:translateY(-2px);}' +
    '@media (max-width:600px){' +
    '.fb-copy{position:static;max-width:none;padding:14px 16px 16px;background:#cfe2ff;border-top:2.5px solid #1b2340;}' +
    '.fb-hero .hs-scene{height:auto;}' +
    '.fb-copy h2{font-size:24px;}' +
    '.fb-ph-top .hs-ph-art{width:110px;}' +
    '.fb-steps{grid-template-columns:1fr;padding:10px 14px 12px;}' +
    '.fb-steps::before{left:31px;right:auto;top:24px;bottom:24px;border-top:0;border-left:2.5px dashed #9fb2d8;}' +
    '.fb-step{flex-direction:row;text-align:left;gap:10px;padding:6px 0;}' +
    '.fb-num{margin:0;flex:none;}' +
    '.fb-step .fb-txt{flex:1;min-width:0;}' +
    '.fb-st{margin:0 0 0 auto;flex:none;}}' +
    '@media (prefers-reduced-motion: reduce){.fb-step:not(.locked):hover .fb-num{transform:none;}}';
  document.head.appendChild(style);

  var tabs = document.createElement('div');
  tabs.className = 'rm-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', '로드맵 선택');
  tabs.innerHTML =
    '<button type="button" class="rm-tab" role="tab" id="rm-tab-nov" aria-selected="true" aria-controls="timeline"><span class="rm-dot">' + (I ? I.LINE.map : '') + '</span>11월 로드맵</button>' +
    '<button type="button" class="rm-tab" role="tab" id="rm-tab-feb" aria-selected="false" aria-controls="rm-feb"><span class="rm-dot">' + (I ? I.LINE.flag : '') + '</span>2월 로드맵</button>';
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
    var cur = currentIndex(), name = student();
    var goal = R.nodes.find(function (n) { return n.type === 'goal'; });
    var dd = dday(goal);
    html += '<section class="fb-hero">' + (I ? I.febScene('남학생과 여학생이 언덕길을 따라 2월 시험 깃발이 꽂힌 산 정상으로 올라가는 그림') : '') +
      '<div class="fb-copy"><h2 class="disp">' + (name && !demo() ? esc(name) + '의 2월 대비 로드맵' : '2월 대비 로드맵') + '</h2>' +
      '<p>' + weeks.length + '주를 세 단계로 나눠 산 정상까지 올라가요.<br>선생님이 출석을 확인하면 그 주 길이 열려요.</p>' +
      (goal ? '<div class="fb-dday">' + esc(goal.title) + (dd != null ? ' <b>D-' + dd + '</b>' : ' · ' + esc(goal.date)) + '</div>' : '') +
      '</div></section>';
    var phases = [], ph = null;
    R.nodes.forEach(function (n) {
      if (n.type === 'divider') { ph = { label: n.label, list: [] }; phases.push(ph); }
      else if (n.type === 'week') { if (!ph) { ph = { label: '', list: [] }; phases.push(ph); } ph.list.push(n); }
    });
    var NAMES = ['생각 힘 기르기', '파이널 실전', '최종 실전'];
    phases.forEach(function (p, pi) {
      var sub = String(p.label || '').replace(/^Phase\s*\d+\s*·\s*/i, '');
      html += '<section class="fb-phase"><div class="fb-ph-top">' + (I ? I.phaseArt(Math.min(pi, 2)) : '') +
        '<div class="fb-ph-h"><h3 class="disp">' + (pi + 1) + '단계 · ' + esc(NAMES[pi] || sub) + '</h3><p>' + esc(sub) + '</p></div></div><ol class="fb-steps" style="--cols:' + Math.max(4, p.list.length) + '">';
      p.list.forEach(function (n) {
        var i = weeks.indexOf(n), open = isOpen(n), now = i === cur;
        var st = now ? 'now' : (!open ? 'locked' : (i < cur ? 'done' : 'open'));
        var tag = now ? '이번 주' : st === 'done' ? (I ? I.LINE.check : '') + '지난 주' : st === 'open' ? '열림' : (I ? I.LINE.lock : '') + '잠김';
        html += '<li><button type="button" class="fb-step ' + st + '" data-feb-node="' + esc(n.id) + '" aria-disabled="' + (open ? 'false' : 'true') + '"' +
          ' aria-label="' + esc((i + 1) + '주차 ' + n.title + ' · ' + n.date + ' · ' + (open ? '열림' : '잠김')) + (now ? ' · 이번 주' : '') + '">' +
          '<span class="fb-num" aria-hidden="true">' + (i + 1) + '</span><span class="fb-txt"><span class="fb-t">' + esc(n.title) + '</span><br><span class="fb-d">' + esc(n.date) + '</span></span>' +
          '<span class="fb-st" aria-hidden="true">' + tag + '</span></button></li>';
      });
      html += '</ol></section>';
    });
    if (R.meta.novMaterials) {
      html += '<a class="rm-feb-nov" href="' + esc(R.meta.novMaterials.url) + '">' + (I ? I.LINE.clip : '') + esc(R.meta.novMaterials.label) + ' 보기</a>';
    }
    panel.innerHTML = html;
    if (I) I.placeWalker(panel.querySelector('.hs-scene'), cur < 0 ? 0.03 : 0.03 + 0.82 * cur / Math.max(1, weeks.length - 1),   /* 정상(시험)은 깃발 자리로 남겨 둔다 */
       cur < 0 ? '' : '지금 ' + (cur + 1) + '주차!');
  }
  /* "2027년 2월 7일" 같은 날짜까지 남은 날 */
  function dday(goal) {
    var m = goal && /(\d{4})년\s*(\d+)월\s*(\d+)일/.exec(goal.date || '');
    if (!m) return null;
    var t = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date();
    var d = Math.round((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    return d >= 0 ? d : null;
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
    if (demo()) { if (typeof toast === 'function') toast('데모에서는 열람할 수 없습니다'); return; }
    if (!isOpen(node)) { if (typeof toast === 'function') toast('아직 열리지 않은 주차입니다'); return; }
    contentFor(node);
    openModal(node, true);
  }

  /* ---------- 2월 과정 학생: 탭 표시, 이번 주 카드, 첫 화면 ---------- */
  function febHome() {
    var card = document.getElementById('home-card');
    var node = weeks[currentIndex()];
    if (!card || !node) return false;
    var c = contentFor(node);
    var h = '<div class="home-head"><div class="hh-tag">이번 주 · ' + esc(node.date) + '</div><h2 class="disp">' + esc(node.title) + '</h2>' +
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
  /* ---------- 2월 과정 학생: 상태 카드(현재 주차·진행률·D-day)와 브리핑도 2월 로드맵 기준 ---------- */
  function febGoalDays() {   // 시험일까지 남은 날(지나면 음수). 날짜가 없으면 null
    var goal = R.nodes.find(function (n) { return n.type === 'goal'; });
    var m = goal && /(\d{4})년\s*(\d+)월\s*(\d+)일/.exec(goal.date || '');
    if (!m) return null;
    var t = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date();
    return Math.round((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  }
  function febDone() {   // 선생님이 체크해 연 주차 수(체크 표가 없으면 현재 주차까지)
    var open = R.meta.openWeeks ? (R.meta.openWeeks[student()] || []) : null;
    if (open) return weeks.filter(function (n) { return open.indexOf(n.id) >= 0; }).length;
    return Math.max(0, currentIndex() + 1);
  }
  function febStatus() {
    var cur = weeks[currentIndex()], total = weeks.length, done = febDone(), pct = total ? Math.round(done / total * 100) : 0;
    var now = document.getElementById('now-text'), bar = document.getElementById('progressbar'), lab = document.getElementById('progress-label'), dd = document.getElementById('dday');
    if (now) now.textContent = cur ? '현재 학습: ' + cur.date + ' · ' + cur.title : '진행 중인 주차 정보 없음';
    if (bar) bar.style.width = pct + '%';
    if (lab) lab.textContent = '2월 대비 전체 ' + total + '주차 중 ' + done + '주차 진행 (' + pct + '%)';
    var d = febGoalDays(), goal = R.nodes.find(function (n) { return n.type === 'goal'; });
    if (dd && d != null) {
      dd.textContent = d > 0 ? '시험 D-' + d : (d === 0 ? '시험 D-DAY' : '시험 종료');
      dd.title = (goal ? goal.title : '시험') + ' · ' + (goal ? goal.date : '');
    }
  }
  if (typeof renderStatus === 'function') {
    var origStatus = renderStatus;
    renderStatus = function () { var r = origStatus.apply(this, arguments); if (isMember()) febStatus(); return r; };
  }
  if (typeof daysToExam === 'function') {   // 브리핑의 D-day 문구
    var origDays = daysToExam;
    daysToExam = function () { if (isMember()) { var d = febGoalDays(); if (d != null) return d; } return origDays.apply(this, arguments); };
  }
  /* 브리핑 인사말(index-enhancements.js)이 지금 주차를 물을 때 2월 학생에게는 2월 주차를 준다 */
  window.GFIELD_FEB_CURRENT = function () { return isMember() ? (weeks[currentIndex()] || null) : null; };

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
