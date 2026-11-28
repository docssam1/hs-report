/* PC에서 유형 위에 마우스를 올리면 예시 문제를 옆에 띄운다. 누르면 열리는 오른쪽 미리보기(app.js)는 그대로 둔다. */
(function () {
  'use strict';
  var list = document.getElementById('typeList'), C = window.HSE_CURRICULUM;
  if (!list || !C) return;
  var types = {};
  C.semesters.forEach(function (s) { s.units.forEach(function (u) { u.subunits.forEach(function (g) { g.types.forEach(function (t) { types[t.id] = { t: t, unit: u }; }); }); }); });
  var card = document.createElement('aside');
  card.className = 'tb-hover'; card.hidden = true; card.setAttribute('aria-hidden', 'true');
  document.body.appendChild(card);
  var timer = 0, current = null;
  function difficulty() {
    var b = document.querySelector('#difficultyFilter button.is-active');
    return b ? Number(b.dataset.difficulty) : 0;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hide() { clearTimeout(timer); current = null; card.hidden = true; }
  function show(row) {
    var found = types[row.getAttribute('data-preview-type-id')];
    if (!found || !row.isConnected) return;
    var off = difficulty();
    var q = window.GFIELD_TESTBANK.make(found.t.source, off, 20261128);
    if (!q) return;
    card.innerHTML = '<header><small>' + esc(found.unit.number + '단원 ' + found.unit.name + ' · ' + found.t.rowNote + ' · ' + C.difficultyLabels[String(off)]) + '</small><b>' + esc(found.t.name) +
      '</b></header><div class="question-prompt">' + q.prompt + '</div>';
    card.hidden = false;
    /* 줄의 오른쪽 빈 곳에 두고, 화면 밖으로 나가지 않게 한다 */
    var r = row.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight, gap = 12;
    var left = Math.min(innerWidth - w - gap, r.left + Math.min(r.width * 0.5, 430));
    var top = Math.max(gap, Math.min(innerHeight - h - gap, r.top + r.height / 2 - h / 2));
    card.style.left = Math.max(gap, left) + 'px'; card.style.top = top + 'px';
  }
  list.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var row = e.target.closest && e.target.closest('[data-preview-type-id]');
    if (!row || row === current) return;
    hide(); current = row;
    timer = setTimeout(function () { show(row); }, 150);
  });
  list.addEventListener('pointerout', function (e) {
    if (!current || (e.relatedTarget && current.contains(e.relatedTarget))) return;
    hide();
  });
  list.addEventListener('click', hide);
  addEventListener('scroll', hide, true);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();
