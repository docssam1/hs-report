/* 로드맵 화면의 세 번째 탭 "승급과정".
   세 영역은 각각 자료실 폴더 하나를 그대로 쓴다(어드민 교재 편집기로 넣고, 폴더 권한으로 연다).
   1) 복습용 강의  : 폴더 '승급 복습강의'   · 교재의 course(예: 4-1 Level Up 심화)로 묶고, 교재+복습영상을 함께 연다.
   2) Test 문제은행: 폴더 '승급과정 문제은행' · 시험지·답안(링크)·해설강의(영상) + 유사문제 생성(upgrade-bank.js).
   3) 승급·편입 자료실(ebook): 폴더 '승급·편입 자료실' · 워터마크가 들어간 양면 책넘김 뷰어, 인쇄도 워터마크.
   세 폴더는 일반 자료실 목록에서는 빼고, 자료실에는 이 탭으로 가는 안내만 남긴다. */
(function () {
  'use strict';
  var view = document.getElementById('view-roadmap');
  var tabs = view && view.querySelector('.rm-tabs');
  if (!view || !tabs) return;
  var D = window.GFIELD_DATA || {};
  var I = window.GFIELD_ILLUST || null;
  var F = { lec: '승급 복습강의', bank: '승급과정 문제은행', book: '승급·편입 자료실' };
  var FOLDERS = [F.lec, F.bank, F.book];
  window.GFIELD_UPGRADE_FOLDERS = FOLDERS.slice();

  function student() { return typeof currentStudent !== 'undefined' && currentStudent ? currentStudent : ''; }
  function demo() { return typeof isDemo !== 'undefined' && isDemo; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function canFolder(f) { return !!student() && !demo() && typeof canSeeArchiveFolder === 'function' && canSeeArchiveFolder(f); }
  function allowed() { return FOLDERS.some(canFolder); }
  function booksOf(f) {
    return (D.books || []).filter(function (b) {
      return b && b.folder === f && (typeof canSeeBook !== 'function' || canSeeBook(b)) && (b.pdf || b.video || (b.imgdir && b.pages) || (b.links && b.links.length));
    });
  }

  var style = document.createElement('style');
  style.textContent =
    /* 승급과정: 외곽선 #1b2340 · 라일락 #7b55c7 · 남색 #141b5d (그림은 hs-illust.js) */
    '.up-hero{position:relative;border:2.5px solid #1b2340;border-radius:24px;overflow:hidden;background:#e9e0fb;box-shadow:0 5px 0 #1b2340;margin:0 0 20px;}' +
    '.up-hero .hs-scene{display:block;width:100%;height:auto;}' +
    '.up-hero-c{position:absolute;left:22px;top:18px;max-width:46%;}' +
    '.up-hero-c h2{font-size:27px;font-weight:400;color:#1b2340;line-height:1.2;}' +
    '.up-manual{display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:10px;padding:0 14px;border:2px solid #1b2340;border-radius:12px;background:#fff;color:#1b2340;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 3px 0 #1b2340;}' +
    '.up-manual:hover{background:#f7f3ff;}' +
    '.up-manual:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.up-manual .hs-li{width:18px;height:18px;}' +
    '.up-hero-c p{margin-top:6px;font-size:13.5px;font-weight:500;line-height:1.6;color:#2e2850;}' +
    '.up-sec{margin:0 0 20px;padding:16px 16px 18px;background:#fff;border:2.5px solid #1b2340;border-radius:22px;}' +
    '.up-top{display:flex;align-items:center;gap:12px;margin:0 0 12px;}' +
    '.up-top .hs-ic{flex:none;width:50px;height:50px;}' +
    '.up-h{font-size:20px;font-weight:400;color:#1b2340;margin:0;}' +
    '.up-d{font-size:13px;color:#4e5878;line-height:1.55;margin:2px 0 0;font-weight:500;}' +
    '.up-empty{padding:14px;border:2px dashed #8d99b8;border-radius:14px;color:#4e5878;font-size:13.5px;line-height:1.6;}' +
    '.up-course{display:inline-block;font-size:13px;font-weight:700;color:#1b2340;margin:12px 0 4px;padding:3px 10px;border-radius:8px;border:1.5px solid #1b2340;background:#ece3fb;}' +
    '.up-lock{padding:28px 18px;text-align:center;color:#1b2340;font-size:14.5px;line-height:1.7;background:#fff;border:2.5px solid #1b2340;border-radius:20px;}' +
    '.up-bank .shelf-h{display:none;}' +
    '.up-e4{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:12px 14px;border:2px solid #1b2340;border-radius:18px;background:#dfe9ff;color:#1b2340;text-decoration:none;box-shadow:0 3px 0 #1b2340;}' +
    '.up-e4:hover{background:#d3e2ff;}' +
    '.up-e4:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}' +
    '.up-e4-ic{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:2px solid #1b2340;background:#fff;flex:none;}' +
    '.up-e4-ic .hs-li{width:24px;height:24px;}' +
    '.up-e4-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}' +
    '.up-e4-t b{font-size:17px;font-weight:400;}' +
    '.up-e4-t small{font-size:12.5px;color:#4e5878;font-weight:500;line-height:1.45;}' +
    '.up-e4-go{flex:none;font-weight:800;font-size:13.5px;background:#141b5d;color:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 2px 0 #070b33;}' +
    '.up-fold,.arc-fold{border:2px solid #1b2340;border-radius:18px;background:#fff;overflow:hidden;}' +
    '.up-fold-sum,.arc-fold-sum{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;list-style:none;min-height:56px;}' +
    '.up-fold-sum::-webkit-details-marker,.arc-fold-sum::-webkit-details-marker{display:none;}' +
    '.up-fold-sum:focus-visible,.arc-fold-sum:focus-visible{outline:3px solid #2456c4;outline-offset:-3px;border-radius:16px;}' +
    '.up-fold-ic,.arc-fold-ic{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;border:2px solid #1b2340;background:#ece3fb;color:#1b2340;flex:none;}' +
    '.arc-fold-ic{background:#dfe9ff;}' +
    '.up-fold-ic .hs-li,.arc-fold-ic .hs-li{width:22px;height:22px;}' +
    '.up-fold-t,.arc-fold-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}' +
    '.up-fold-t b,.arc-fold-t b{font-size:17px;font-weight:400;color:#1b2340;}' +
    '.up-fold-t small,.arc-fold-t small{font-size:12.5px;color:#4e5878;font-weight:500;line-height:1.45;}' +
    '.up-fold-chev,.arc-fold-chev{flex:none;color:#1b2340;transition:transform .2s;display:grid;}' +
    '.up-fold-chev .hs-li,.arc-fold-chev .hs-li{width:22px;height:22px;}' +
    '.up-fold[open] .up-fold-chev,.arc-fold[open] .arc-fold-chev{transform:rotate(180deg);}' +
    '.up-fold[open] .up-fold-sum{border-bottom:2px solid #d6e2f5;background:#f7f3ff;}' +
    '.arc-fold[open] .arc-fold-sum{border-bottom:2px solid #d6e2f5;background:#f3f7ff;}' +
    '.up-fold-body,.arc-fold-body{padding:12px 14px 14px;}' +
    '.arc-fold{margin:0 0 22px;}' +
    '.arc-fold .bank-launch{margin:0 0 14px;border:0;box-shadow:none;padding:0;border-radius:0;}' +
    '.arc-gen{border-top:2px dashed #d6e2f5;padding-top:14px;}' +
    '.arc-gen-h{font-family:Jua,sans-serif;font-weight:400;font-size:17px;color:#1b2340;margin:0 0 6px;}' +
    '.arc-gen-b p{font-size:13px;line-height:1.6;margin:0 0 10px;color:#4e5878;}' +
    '.arc-gen-go{display:inline-flex;align-items:center;min-height:44px;background:#141b5d;color:#fff;padding:10px 15px;border-radius:12px;text-decoration:none;font-size:13.5px;font-weight:800;margin-right:12px;box-shadow:0 3px 0 #070b33;}' +
    '.arc-gen-guide{display:inline-flex;align-items:center;min-height:44px;color:#243184;text-decoration:underline;text-underline-offset:3px;font-size:13.5px;font-weight:800;}' +
    '@media (prefers-reduced-motion: reduce){.up-fold-chev,.arc-fold-chev{transition:none;}}' +
    /* 강의: 한 줄 카드(썸네일 + 제목) */
    '#rm-upg .up-rows{display:grid;gap:10px;margin-top:6px;}' +
    '#rm-upg .book.up-row{flex-direction:row;align-items:center;gap:12px;width:100%;padding:10px;border:2px solid #d6e2f5;border-radius:16px;background:#fff;text-align:left;}' +
    '#rm-upg .book.up-row:hover{border-color:#1b2340;}' +
    '#rm-upg .up-row .hs-thumb,#rm-upg .up-row .up-thumb{flex:none;width:96px;height:64px;border:2px solid #1b2340;border-radius:10px;overflow:hidden;display:block;object-fit:cover;}' +
    '#rm-upg .up-row .up-rt{display:flex;flex-direction:column;gap:2px;min-width:0;}' +
    '#rm-upg .up-row .label{text-align:left;font-size:14.5px;}' +
    '#rm-upg .up-row .desc{text-align:left;font-size:12px;color:#4e5878;}' +
    '#rm-upg .book .pages{color:#5b3ea3;font-size:11.5px;font-weight:700;}' +
    /* 책장: 그린 표지 */
    '#rm-upg .shelf{grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:18px 14px;}' +
    '#rm-upg .book .cover.drawn{transform:none;box-shadow:none;aspect-ratio:120/160;width:100%;}' +
    '#rm-upg .book .cover.drawn::before,#rm-upg .book .cover.drawn::after{display:none;}' +
    '#rm-upg .book .cover.drawn svg{display:block;width:100%;height:100%;}' +
    '#rm-upg .book:hover .cover.drawn{transform:translateY(-4px);}' +
    '#rm-upg .book .label{color:#1b2340;}' +
    '#rm-upg .book:focus-visible{outline:3px solid #2456c4;outline-offset:3px;border-radius:12px;}' +
    '@media (max-width:600px){.up-hero-c{position:static;max-width:none;padding:14px 16px 16px;background:#e9e0fb;border-top:2.5px solid #1b2340;}' +
    '.up-hero .hs-scene{height:190px;}.up-hero-c h2{font-size:24px;}}' +
    '@media (prefers-reduced-motion: reduce){#rm-upg .book:hover .cover.drawn{transform:none;}}' +
    /* 책넘김 뷰어 */
    '.ufb{position:fixed;inset:0;z-index:2000;background:#2b2d31;display:none;flex-direction:column;color:#fff;}' +
    '.ufb.open{display:flex;}' +
    '.ufb-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#141b5d;}' +
    '.ufb-t{flex:1;min-width:0;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.ufb-pg{font-size:13px;opacity:.9;white-space:nowrap;}' +
    '.ufb-b .hs-li{width:16px;height:16px;vertical-align:-3px;margin-right:4px;}' +
    '.ufb-b{min-height:44px;min-width:44px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;font-size:14px;font-weight:700;}' +
    '.ufb-b:disabled{opacity:.35;}' +
    '.ufb-b:focus-visible{outline:3px solid #ffd27a;outline-offset:2px;}' +
    '.ufb-stage{flex:1;display:flex;align-items:center;justify-content:center;padding:14px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;}' +
    '.ufb-book{position:relative;display:flex;height:100%;max-height:100%;max-width:100%;perspective:2400px;}' +
    '.ufb-p{position:relative;height:100%;aspect-ratio:var(--ufb-ar,0.707);background:#fff;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.45);}' +
    '.ufb-p.blank{background:transparent;box-shadow:none;}' +
    '.ufb-book.spread .ufb-p.l{box-shadow:-4px 4px 18px rgba(0,0,0,.45),inset -18px 0 24px -18px rgba(0,0,0,.35);}' +
    '.ufb-book.spread .ufb-p.r{box-shadow:4px 4px 18px rgba(0,0,0,.45),inset 18px 0 24px -18px rgba(0,0,0,.35);}' +
    '.ufb-p img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none;}' +
    '.ufb-wm{position:absolute;inset:0;pointer-events:none;overflow:hidden;}' +
    '.ufb-wm span{position:absolute;left:-15%;width:130%;text-align:center;color:#000;opacity:.07;font-size:clamp(12px,2.2vh,24px);font-weight:800;white-space:nowrap;transform:rotate(-30deg);}' +
    '.ufb-wm span:nth-child(1){top:20%}.ufb-wm span:nth-child(2){top:48%}.ufb-wm span:nth-child(3){top:76%}' +
    '.ufb-leaf{position:absolute;top:0;height:100%;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.3,.1,.25,1);z-index:5;}' +
    '.ufb-leaf .ufb-p{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;}' +
    '.ufb-leaf .back{transform:rotateY(180deg);}' +
    '.ufb-nav{display:flex;justify-content:center;align-items:center;gap:12px;padding:10px 14px 14px;}' +
    '.ufb-range{flex:1;max-width:420px;}' +
    '@media (prefers-reduced-motion: reduce){.ufb-leaf{transition:none;}}';
  document.head.appendChild(style);

  /* ---------- 탭과 패널 ---------- */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'rm-tab'; btn.id = 'rm-tab-upg';
  btn.setAttribute('role', 'tab'); btn.setAttribute('aria-selected', 'false'); btn.setAttribute('aria-controls', 'rm-upg');
  btn.innerHTML = '<span class="rm-dot">' + (I ? I.LINE.stairs : '') + '</span>편입·승급과정';
  btn.style.display = 'none';
  tabs.appendChild(btn);
  var panel = document.createElement('div');
  panel.id = 'rm-upg'; panel.className = 'hidden';
  panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'rm-tab-upg');
  view.appendChild(panel);

  function select(on) {
    var others = [view.querySelector('.legend'), document.getElementById('timeline'), document.getElementById('rm-feb')];
    if (on) {
      others.forEach(function (el) { if (el) el.classList.add('hidden'); });
      tabs.querySelectorAll('.rm-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === btn)); });
      render();
    } else {
      btn.setAttribute('aria-selected', 'false');
    }
    panel.classList.toggle('hidden', !on);
  }
  btn.addEventListener('click', function () { select(true); });
  ['rm-tab-nov', 'rm-tab-feb'].forEach(function (id) {
    var t = document.getElementById(id);
    if (t) t.addEventListener('click', function () { select(false); });
  });

  function cardHtml(b, tag) {
    var i = (D.books || []).indexOf(b);
    var cover = b.cover ? '<span class="cover"><img loading="lazy" src="' + esc(b.cover) + '" alt="' + esc(b.title || '교재') + '"></span>'
      : I ? '<span class="cover drawn">' + I.cover(b.title) + '</span>'
      : '<span class="cover noimg"><span class="cv-title">' + esc(b.title || '교재') + '</span></span>';
    return '<button class="book" data-up="' + i + '">' + cover + '<span class="label">' + esc(b.title || '교재') + '</span>' +
      (b.desc ? '<span class="desc">' + esc(b.desc) + '</span>' : '') + '<span class="pages">' + tag + '</span></button>';
  }
  function rowHtml(b, tag) {
    var i = (D.books || []).indexOf(b);
    var th = b.cover ? '<img class="up-thumb" loading="lazy" src="' + esc(b.cover) + '" alt="">' : (I ? I.lecThumb(b.title) : '');
    return '<button class="book up-row" data-up="' + i + '">' + th + '<span class="up-rt"><span class="label">' + esc(b.title || '교재') + '</span>' +
      (b.desc ? '<span class="desc">' + esc(b.desc) + '</span>' : '') + '<span class="pages">' + tag + '</span></span></button>';
  }
  function head(key, id, title, desc) {
    return '<div class="up-top">' + (I ? I.ICON[key] : '') + '<div><h3 class="up-h disp" id="' + id + '">' + title + '</h3><p class="up-d">' + desc + '</p></div></div>';
  }
  function lecHtml() {
    var list = booksOf(F.lec);
    var h = '<section class="up-sec" aria-labelledby="up-h-lec">' + head('lec', 'up-h-lec', '복습용 강의', '교재를 옆에 펴 놓고 영상으로 다시 봐요. 영상과 교재가 나란히 열립니다.');
    if (!list.length) return h + '<div class="up-empty">아직 올라온 복습 강의가 없습니다.</div></section>';
    var courses = [];
    list.forEach(function (b) { var c = String(b.course || '').trim() || '기타'; if (courses.indexOf(c) < 0) courses.push(c); });
    courses.forEach(function (c) {
      h += '<div class="up-course">' + esc(c) + '</div><div class="up-rows">' + list.filter(function (b) { return (String(b.course || '').trim() || '기타') === c; })
        .map(function (b) { return rowHtml(b, b.video ? '교재 + 복습영상' : (b.links && b.links.length ? '영상 링크' : '교재')); }).join('') + '</div>';
    });
    return h + '</section>';
  }
  function bookHtml() {
    var list = booksOf(F.book);
    var h = '<section class="up-sec" aria-labelledby="up-h-book">' + head('book', 'up-h-book', '승급·편입 자료실', '책처럼 양쪽으로 넘겨 봐요. 화면과 인쇄물에 ' + esc(student()) + ' 님의 이름이 워터마크로 들어갑니다.');
    h += elem4Card();
    if (!list.length) return h + '<div class="up-empty">아직 올라온 교재가 없습니다.</div></section>';
    return h + '<div class="shelf">' + list.map(function (b) { return cardHtml(b, b.imgdir && b.pages ? b.pages + '쪽 · 책넘김' : '교재'); }).join('') + '</div></section>';
  }
  /* 4학년 유사문제 은행(elementary4/): 승급·편입 자료실이 열린 학생에게만 보인다 */
  function elem4Card() {
    return '<a class="up-e4" href="elementary4/index.html" target="_blank" rel="noopener" data-e4>' +
      '<span class="up-e4-ic">' + (I ? I.icon('pencil') : '') + '</span>' +
      '<span class="up-e4-t"><b class="disp">4학년 유사문제 은행</b><small>4-1·4-2 단원과 유형을 골라 심화 유사문제를 만들고, 이름 워터마크로 인쇄해요.</small></span>' +
      '<span class="up-e4-go">열기 ›</span></a>';
  }
  /* 데일리 테스트(시험지·유사문제)는 길어서 접히는 상자 하나에 넣는다. 열림 상태는 기기에 기억 */
  function dailyBox() {
    var n = booksOf(F.bank).length, open = false;
    try { open = localStorage.getItem('gfield_upg_daily_open') === '1'; } catch (e) {}
    return '<details class="up-fold" id="up-daily"' + (open ? ' open' : '') + '><summary class="up-fold-sum">' +
      '<span class="up-fold-ic">' + (I ? I.icon('calendar') : '') + '</span><span class="up-fold-t"><b class="disp">데일리 테스트</b>' +
      '<small>시험지 ' + n + '장 · 답안 · 비슷한 문제 만들기</small></span><span class="up-fold-chev">' + (I ? I.icon('chevron') : '') + '</span></summary>' +
      '<div class="up-fold-body"><div class="up-bank-host"></div></div></details>';
  }
  function render() {
    if (!allowed()) {
      panel.innerHTML = '<div class="up-lock"><b>편입·승급과정 학생에게 열리는 공간입니다.</b><br>선생님이 열어 주시면 이곳에서 볼 수 있습니다.</div>';
      return;
    }
    var h = '<section class="up-hero">' + (I ? I.upgScene('남학생과 여학생이 복습 강의, Test 문제은행, 편입 자료실 계단을 차례로 올라가는 그림') : '') +
      '<div class="up-hero-c"><h2 class="disp">' + (student() ? esc(student()) + '의 ' : '') + '편입·승급과정</h2><p>강의로 복습하고, 시험지로 확인하고,<br>자료실 책으로 다져서 한 칸씩 올라가요.</p>' +
        '<a class="up-manual" href="manual-upg.html" target="_blank" rel="noopener">' + (I ? I.icon('clipboard') : '') + '사용법 보기</a></div></section>';
    if (canFolder(F.lec)) h += lecHtml();
    if (canFolder(F.bank)) h += '<section class="up-sec up-bank" aria-labelledby="up-h-bank">' + head('bank', 'up-h-bank', 'Test 문제은행', '시험지를 열면 답안과 해설강의(있는 경우)가 함께 나와요. 아래에서 비슷한 문제를 낮춰서·같은 수준·높여서 만들어 풀 수 있어요.') + dailyBox() + '</section>';
    if (canFolder(F.book)) h += bookHtml();
    panel.innerHTML = h;
    var fold = panel.querySelector('#up-daily');
    if (fold) fold.addEventListener('toggle', function () { try { localStorage.setItem('gfield_upg_daily_open', fold.open ? '1' : '0'); } catch (e) {} });
    var host = panel.querySelector('.up-bank-host');
    if (host) {
      if (window.GFIELD_UPGRADE_BANK) window.GFIELD_UPGRADE_BANK.draw(host);
      else host.innerHTML = '<div class="up-empty">문제은행을 불러오지 못했습니다. 새로고침해 주세요.</div>';
    }
  }
  panel.addEventListener('click', function (e) {
    var e4 = e.target.closest && e.target.closest('[data-e4]');
    if (e4) {   // 새 탭의 입장 확인용 표시(같은 학생·12시간)
      try { sessionStorage.setItem('gfield_elem4_handoff', JSON.stringify({ student: student(), issuedAt: Date.now() })); } catch (err) {}
      return;
    }
    var el = e.target.closest && e.target.closest('[data-up]');
    if (!el || !panel.contains(el)) return;
    var b = (D.books || [])[Number(el.getAttribute('data-up'))];
    if (!b) return;
    if (b.folder === F.book && b.imgdir && b.pages) openFlip(b);
    else if (typeof openBook === 'function') openBook(b);
  });

  /* ---------- 양면 책넘김 뷰어 ---------- */
  var fb = document.createElement('div');
  fb.className = 'ufb'; fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-modal', 'true'); fb.setAttribute('aria-labelledby', 'ufb-t');
  fb.innerHTML = '<div class="ufb-bar"><span class="ufb-t" id="ufb-t"></span><span class="ufb-pg" aria-live="polite"></span>' +
    '<button type="button" class="ufb-b" data-act="print">' + (I ? I.LINE.print : '') + '인쇄</button><button type="button" class="ufb-b" data-act="close" aria-label="닫기">✕</button></div>' +
    '<div class="ufb-stage"><div class="ufb-book"></div></div>' +
    '<div class="ufb-nav"><button type="button" class="ufb-b" data-act="prev" aria-label="이전 쪽">‹ 이전</button>' +
    '<input type="range" class="ufb-range" min="0" value="0" aria-label="쪽 이동"><button type="button" class="ufb-b" data-act="next" aria-label="다음 쪽">다음 ›</button></div>';
  document.body.appendChild(fb);
  fb.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  fb.addEventListener('dragstart', function (e) { e.preventDefault(); });
  var stage = fb.querySelector('.ufb-stage'), bookEl = fb.querySelector('.ufb-book'), range = fb.querySelector('.ufb-range');
  var cur = { b: null, idx: 0, busy: false, spread: true, lastFocus: null, ar: 0.707 };
  /* 화면 안에 쪽 전체가 들어가도록 높이를 정한다(넓이와 높이 중 작은 쪽 기준) */
  function size() {
    var cs = getComputedStyle(stage), w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var across = cur.spread ? 2 : 1;
    bookEl.style.height = Math.max(120, Math.floor(Math.min(h, w / (across * cur.ar)))) + 'px';
    bookEl.style.setProperty('--ufb-ar', String(cur.ar));
  }

  function src(n) { return 'materials/' + cur.b.imgdir + '/' + String(n).padStart(3, '0') + '.jpg'; }
  function wm() { var t = esc(student() + ' · 지필드 영재교육'); return '<div class="ufb-wm"><span>' + t + '</span><span>' + t + '</span><span>' + t + '</span></div>'; }
  function pageHtml(n, cls) {
    if (!n) return '<div class="ufb-p blank ' + cls + '"></div>';
    return '<div class="ufb-p ' + cls + '"><img src="' + src(n) + '" alt="' + n + '쪽" draggable="false">' + wm() + '</div>';
  }
  /* 펼침면: 1쪽은 오른쪽 혼자(표지), 그다음은 2-3, 4-5 … 좁은 화면은 한 쪽씩 */
  function views() {
    var n = cur.b.pages, out = [];
    if (!cur.spread) { for (var i = 1; i <= n; i++) out.push([i]); return out; }
    out.push([0, 1]);
    for (var p = 2; p <= n; p += 2) out.push([p, p + 1 <= n ? p + 1 : 0]);
    return out;
  }
  function draw() {
    var v = views()[cur.idx];
    bookEl.classList.toggle('spread', cur.spread);
    size();
    bookEl.innerHTML = cur.spread ? pageHtml(v[0], 'l') + pageHtml(v[1], 'r') : pageHtml(v[0], 'one');
    var shown = v.filter(Boolean);
    fb.querySelector('.ufb-pg').textContent = shown.join('–') + ' / ' + cur.b.pages + '쪽';
    range.max = String(views().length - 1); range.value = String(cur.idx);
    fb.querySelector('[data-act="prev"]').disabled = cur.idx <= 0;
    fb.querySelector('[data-act="next"]').disabled = cur.idx >= views().length - 1;
    var nx = views()[cur.idx + 1] || [];
    nx.forEach(function (p) { if (p) { var im = new Image(); im.src = src(p); } });
  }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function go(step) {
    var list = views(), to = cur.idx + step;
    if (cur.busy || to < 0 || to >= list.length) return;
    if (!cur.spread || reduced()) { cur.idx = to; draw(); return; }
    var from = list[cur.idx], next = list[to];
    var pages = bookEl.querySelectorAll(':scope > .ufb-p'), half = pages[0].getBoundingClientRect().width;
    var leaf = document.createElement('div');
    leaf.className = 'ufb-leaf';
    leaf.style.width = half + 'px';
    if (step > 0) {
      leaf.style.left = half + 'px'; leaf.style.transformOrigin = 'left center';
      leaf.innerHTML = pageHtml(from[1], 'r front') + pageHtml(next[0], 'l back');
      pages[1].outerHTML = pageHtml(next[1], 'r');
    } else {
      leaf.style.left = '0px'; leaf.style.transformOrigin = 'right center';
      leaf.innerHTML = pageHtml(from[0], 'l front') + pageHtml(next[1], 'r back');
      pages[0].outerHTML = pageHtml(next[0], 'l');
    }
    bookEl.appendChild(leaf);
    cur.busy = true;
    void leaf.offsetWidth;
    leaf.style.transform = 'rotateY(' + (step > 0 ? -180 : 180) + 'deg)';
    var done = false;
    function end() { if (done) return; done = true; cur.idx = to; cur.busy = false; draw(); }
    leaf.addEventListener('transitionend', end);
    setTimeout(end, 900);
  }
  function fit() {
    var page = cur.b && cur.spread != null ? ((views()[cur.idx] || []).filter(Boolean)[0] || 1) : 1;   // 같은 쪽을 계속 보이게
    cur.spread = stage.clientWidth >= 760 && stage.clientWidth > stage.clientHeight * cur.ar * 1.3;
    if (!cur.b) return;
    var t = views().findIndex(function (v) { return v.indexOf(page) >= 0; });
    cur.idx = t < 0 ? 0 : t;
    draw();
  }
  function openFlip(b) {
    if (!student()) { if (typeof toast === 'function') toast('로그인이 필요합니다'); return; }
    cur.b = b; cur.idx = 0; cur.busy = false; cur.lastFocus = document.activeElement;
    fb.querySelector('.ufb-t').textContent = b.title || '교재';
    fb.classList.add('open');
    document.body.style.overflow = 'hidden';
    var probe = new Image();
    probe.onload = function () { if (probe.naturalWidth && probe.naturalHeight && cur.b) { cur.ar = probe.naturalWidth / probe.naturalHeight; fit(); } };
    probe.src = src(1);
    cur.spread = null; fit();
    fb.querySelector('[data-act="close"]').focus();
  }
  function closeFlip() {
    fb.classList.remove('open'); bookEl.innerHTML = ''; cur.b = null;
    document.body.style.overflow = '';
    if (cur.lastFocus && cur.lastFocus.focus) cur.lastFocus.focus();
  }
  fb.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-act]');
    if (!t) return;
    var a = t.getAttribute('data-act');
    if (a === 'close') closeFlip();
    else if (a === 'prev') go(-1);
    else if (a === 'next') go(1);
    else if (a === 'print' && cur.b && typeof printMaterial === 'function') printMaterial(cur.b.imgdir, cur.b.pages, cur.b.title || '교재', cur.b.copyrightMissingPages || []);
  });
  range.addEventListener('input', function () { if (!cur.busy) { cur.idx = Number(range.value); draw(); } });
  document.addEventListener('keydown', function (e) {
    if (!fb.classList.contains('open')) return;
    if (e.key === 'Escape') { e.stopPropagation(); closeFlip(); }
    else if (e.key === 'ArrowRight' && e.target !== range) go(1);
    else if (e.key === 'ArrowLeft' && e.target !== range) go(-1);
    else if (e.key === 'Tab') {   // 대화상자 안에서만 초점 이동
      var f = Array.prototype.filter.call(fb.querySelectorAll('button,input'), function (x) { return !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
  var sx = null;
  stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  stage.addEventListener('pointerup', function (e) {
    if (sx == null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    else {   // 짧게 누르면 누른 쪽으로 넘긴다
      var r = stage.getBoundingClientRect();
      go(e.clientX > r.left + r.width / 2 ? 1 : -1);
    }
  });
  window.addEventListener('resize', function () { if (fb.classList.contains('open')) fit(); });
  window.GFIELD_UPGRADE_FLIP = { open: openFlip, close: closeFlip };

  /* ---------- 자료실: 세 폴더는 빼고 안내만 ---------- */
  if (typeof renderArchive === 'function') {
    var origArchive = renderArchive;
    renderArchive = function () {
      var r = origArchive.apply(this, arguments);
      var wrap = document.getElementById('archive-list');
      if (!wrap || demo()) return r;
      var removed = false;
      Array.prototype.slice.call(wrap.querySelectorAll('.shelf-sec')).forEach(function (sec) {
        var head = sec.querySelector('.shelf-h');
        var txt = head ? head.textContent : '';
        if (FOLDERS.some(function (f) { return txt.indexOf(f) >= 0; })) { sec.parentNode.removeChild(sec); removed = true; }
      });
      if (removed || allowed()) {
        var box = document.createElement('div');
        box.className = 'shelf-sec';
        box.innerHTML = '<div class="shelf-h disp">' + (I ? '<span style="display:inline-flex;width:20px;height:20px">' + I.LINE.stairs + '</span>' : '') + '편입·승급과정</div><div class="up-empty" style="border:2px solid #1b2340;background:#ece3fb;color:#1b2340">' +
          '복습용 강의 · Test 문제은행 · 승급·편입 자료실은 <b>로드맵 → 편입·승급과정</b> 탭에 모여 있습니다. ' +
          '<button type="button" class="ub-btn" data-go-upg style="margin-top:8px">편입·승급과정으로 가기</button></div>';
        wrap.insertBefore(box, wrap.firstChild);
        box.querySelector('[data-go-upg]').addEventListener('click', function () { if (typeof nav === 'function') nav('roadmap'); select(true); });
        var empty = wrap.querySelector(':scope > .empty-note');
        if (empty) empty.parentNode.removeChild(empty);
      }
      return r;
    };
  }

  /* ---------- 탭 표시: 승급과정 학생에게만, 온라인 학생도 로드맵 메뉴가 보이게 ---------- */
  function refreshTab() {
    var ok = allowed();
    btn.style.display = ok ? '' : 'none';
    if (ok) document.querySelectorAll('.nav-btn').forEach(function (b) { if (b.dataset.v === 'roadmap') b.style.display = ''; });
    if (!ok && !panel.classList.contains('hidden')) { select(false); var nov = document.getElementById('rm-tab-nov'); if (nov) nov.click(); }
  }
  if (typeof applyMemberTabs === 'function') {
    var origTabs = applyMemberTabs;
    applyMemberTabs = function () { var r = origTabs.apply(this, arguments); refreshTab(); return r; };
  }
  function febMember() {
    var R = window.GFIELD_ROADMAP_FEB, cfg = D.febRoadmap || {};
    var m = Array.isArray(cfg.members) ? cfg.members : (R && R.meta && R.meta.members) || [];
    return !!(R && R.meta && R.meta.status === 'published' && m.indexOf(student()) >= 0);
  }
  var opened = false;
  if (typeof nav === 'function') {
    var origNav = nav;
    nav = function (v) {
      var r = origNav.apply(this, arguments);
      if (v === 'roadmap') {
        refreshTab();
        if (!opened && allowed() && !febMember()) { opened = true; select(true); }
        else if (!panel.classList.contains('hidden')) render();
      }
      return r;
    };
  }
  refreshTab();
})();
