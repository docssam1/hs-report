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
    '.up-sec{margin:0 0 22px;padding:16px 16px 18px;background:var(--card);border:1px solid var(--line);border-radius:16px;}' +
    '.up-h{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:800;color:var(--ink);margin:0 0 4px;}' +
    '.up-d{font-size:13px;color:var(--ink2);line-height:1.6;margin:0 0 12px;}' +
    '.up-empty{padding:14px;border:1px dashed var(--line2);border-radius:12px;color:var(--ink2);font-size:13.5px;line-height:1.6;}' +
    '.up-course{font-size:14.5px;font-weight:800;color:#1f3f8f;margin:14px 0 6px;}' +
    '.up-lock{padding:28px 18px;text-align:center;color:var(--ink2);font-size:14.5px;line-height:1.7;background:var(--card);border:1px solid var(--line);border-radius:16px;}' +
    '.up-bank .shelf-h{display:none;}' +
    /* 책넘김 뷰어 */
    '.ufb{position:fixed;inset:0;z-index:2000;background:#2b2d31;display:none;flex-direction:column;color:#fff;}' +
    '.ufb.open{display:flex;}' +
    '.ufb-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#1e3c72;}' +
    '.ufb-t{flex:1;min-width:0;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.ufb-pg{font-size:13px;opacity:.9;white-space:nowrap;}' +
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
  btn.textContent = '승급과정';
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
      : '<span class="cover noimg"><span class="cv-title">' + esc(b.title || '교재') + '</span></span>';
    return '<button class="book" data-up="' + i + '">' + cover + '<span class="label">' + esc(b.title || '교재') + '</span>' +
      (b.desc ? '<span class="desc">' + esc(b.desc) + '</span>' : '') + '<span class="pages">' + tag + '</span></button>';
  }
  function lecHtml() {
    var list = booksOf(F.lec);
    var h = '<section class="up-sec" aria-labelledby="up-h-lec"><h3 class="up-h disp" id="up-h-lec">🎬 복습용 강의</h3>' +
      '<p class="up-d">수업한 교재와 복습 영상을 함께 봅니다. 영상과 교재가 나란히 열립니다.</p>';
    if (!list.length) return h + '<div class="up-empty">아직 올라온 복습 강의가 없습니다.</div></section>';
    var courses = [];
    list.forEach(function (b) { var c = String(b.course || '').trim() || '기타'; if (courses.indexOf(c) < 0) courses.push(c); });
    courses.forEach(function (c) {
      h += '<div class="up-course">' + esc(c) + '</div><div class="shelf">' + list.filter(function (b) { return (String(b.course || '').trim() || '기타') === c; })
        .map(function (b) { return cardHtml(b, b.video ? '🎬 교재 + 복습영상' : (b.links && b.links.length ? '▶ 영상 링크' : '📄 교재')); }).join('') + '</div>';
    });
    return h + '</section>';
  }
  function bookHtml() {
    var list = booksOf(F.book);
    var h = '<section class="up-sec" aria-labelledby="up-h-book"><h3 class="up-h disp" id="up-h-book">📖 승급·편입 자료실</h3>' +
      '<p class="up-d">책을 넘기듯 양쪽으로 펼쳐 봅니다. 화면과 인쇄물 모두 ' + esc(student()) + ' 님의 이름이 워터마크로 들어갑니다.</p>';
    if (!list.length) return h + '<div class="up-empty">아직 올라온 교재가 없습니다.</div></section>';
    return h + '<div class="shelf">' + list.map(function (b) { return cardHtml(b, b.imgdir && b.pages ? '📖 ' + b.pages + '쪽 · 책넘김' : '📄 교재'); }).join('') + '</div></section>';
  }
  function render() {
    if (!allowed()) {
      panel.innerHTML = '<div class="up-lock"><b>승급과정 학생에게 열리는 공간입니다.</b><br>선생님이 열어 주시면 이곳에서 볼 수 있습니다.</div>';
      return;
    }
    var h = '';
    if (canFolder(F.lec)) h += lecHtml();
    if (canFolder(F.bank)) h += '<section class="up-sec up-bank" aria-labelledby="up-h-bank"><h3 class="up-h disp" id="up-h-bank">📝 Test 문제은행</h3>' +
      '<p class="up-d">시험지를 열면 답안과 해설강의(있는 경우)가 함께 나옵니다. 아래에서 유사문제를 낮춰서·같은 수준·높여서 만들어 풀 수 있습니다.</p><div class="up-bank-host"></div></section>';
    if (canFolder(F.book)) h += bookHtml();
    panel.innerHTML = h;
    var host = panel.querySelector('.up-bank-host');
    if (host) {
      if (window.GFIELD_UPGRADE_BANK) window.GFIELD_UPGRADE_BANK.draw(host);
      else host.innerHTML = '<div class="up-empty">문제은행을 불러오지 못했습니다. 새로고침해 주세요.</div>';
    }
  }
  panel.addEventListener('click', function (e) {
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
    '<button type="button" class="ufb-b" data-act="print">🖨 인쇄</button><button type="button" class="ufb-b" data-act="close" aria-label="닫기">✕</button></div>' +
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
        box.innerHTML = '<div class="shelf-h disp">🎓 승급과정</div><div class="up-empty" style="border-style:solid;background:#edf3ff;border-color:#cbd8ec">' +
          '복습용 강의 · Test 문제은행 · 승급·편입 자료실은 <b>로드맵 → 승급과정</b> 탭에 모여 있습니다. ' +
          '<button type="button" class="ub-btn" data-go-upg style="margin-top:8px">승급과정으로 가기</button></div>';
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
