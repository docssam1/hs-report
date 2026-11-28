/* 승급과정 4-1 2단원(각도) 일일테스트 유사문제 생성기 (브라우저·Node 공용)
   황소 초등 문제은행에 원본과 같은 모양이 없는 9문항을 원본 그림의 구조 그대로 새로 만든다.
   그림은 문제의 각도대로 좌표를 계산해 그린다. qa/upgrade41-u2-validate.cjs가 그려진 좌표를 재서
   그림에 적힌 각도와 정답을 따로 확인한다. 난이도: 낮춰서 / 같은 수준 / 높여서. */
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    var f = mulberry32(seed >>> 0);
    var R = {
      int: function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); },
      step: function (lo, hi, s) { return lo + s * Math.floor(f() * (Math.floor((hi - lo) / s) + 1)); },
      pick: function (a) { return a[Math.floor(f() * a.length)]; },
      float: f
    };
    return R;
  }

  /* ---------------------------------------------------------------- 좌표(위가 +y)와 그림 */
  var RAD = Math.PI / 180;
  function P(x, y) { return { x: x, y: y }; }
  function add(a, b) { return P(a.x + b.x, a.y + b.y); }
  function sub(a, b) { return P(a.x - b.x, a.y - b.y); }
  function mul(a, k) { return P(a.x * k, a.y * k); }
  function len(a) { return Math.hypot(a.x, a.y); }
  function unit(a) { var l = len(a); return P(a.x / l, a.y / l); }
  function polar(deg, r) { return P(r * Math.cos(deg * RAD), r * Math.sin(deg * RAD)); }
  function dirOf(a) { var d = Math.atan2(a.y, a.x) / RAD; return (d + 360) % 360; }
  function cross(a, b) { return a.x * b.y - a.y * b.x; }
  function meet(p, d, q, e) {   // 직선 p+t·d 와 q+s·e 의 교점
    var den = cross(d, e); if (Math.abs(den) < 1e-9) return null;
    var w = sub(q, p), t = cross(w, e) / den, s = cross(w, d) / den;
    return { p: add(p, mul(d, t)), t: t, s: s };
  }
  function reflect(p, a, b) { var d = unit(sub(b, a)), w = sub(p, a), k = w.x * d.x + w.y * d.y; return add(a, sub(mul(d, 2 * k), w)); }
  function between(a, b) { var x = Math.abs(dirOf(a) - dirOf(b)); return x > 180 ? 360 - x : x; }

  var INK = '#24435d', MARK = '#8a5a00';
  function Figure(width) {
    var items = [], pts = [], box = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }, named = {};
    function see(p, pad) { pad = pad || 0; box.x0 = Math.min(box.x0, p.x - pad); box.x1 = Math.max(box.x1, p.x + pad); box.y0 = Math.min(box.y0, p.y - pad); box.y1 = Math.max(box.y1, p.y + pad); }
    function n(v) { return (Math.round(v * 1000) / 1000).toString(); }
    var F = {
      point: function (key, p) { named[key] = p; pts.push([key, p]); see(p); return p; },
      line: function (a, b, o) {
        o = o || {}; see(a); see(b);
        items.push('<line x1="' + n(a.x) + '" y1="' + n(-a.y) + '" x2="' + n(b.x) + '" y2="' + n(-b.y) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 1.5) + '" stroke-linecap="round"' +
          (o.dash ? ' stroke-dasharray="5 4"' : '') + (o.cls ? ' class="' + o.cls + '"' : '') + '/>');
      },
      poly: function (list, o) { list.forEach(function (p, i) { F.line(p, list[(i + 1) % list.length], o); }); },
      text: function (p, s, o) {
        o = o || {}; see(p, String(s).length * 4 + 7);
        items.push('<text x="' + n(p.x) + '" y="' + n(-p.y) + '" font-size="' + (o.size || 13) + '" font-weight="700" fill="' + (o.color || INK) + '" text-anchor="middle" dominant-baseline="central">' + s + '</text>');
      },
      circle: function (c, r, o) { o = o || {}; see(c, r); items.push('<circle cx="' + n(c.x) + '" cy="' + n(-c.y) + '" r="' + r + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 1.5) + '"/>'); },
      /* 꼭짓점 v에서 a·b 쪽 사이의 각 표시. reflex면 180°보다 큰 쪽. given: 적힌 수, target: 구하는 기호 */
      angle: function (v, a, b, o) {
        var va = sub(named[a], named[v]), vb = sub(named[b], named[v]);
        var da = dirOf(va), sweep = (dirOf(vb) - da + 360) % 360, start = da;
        if ((sweep > 180) !== !!o.reflex) { start = dirOf(vb); sweep = 360 - sweep; }
        var r = o.r || 16, c = named[v], s = add(c, polar(start, r)), e = add(c, polar(start + sweep, r));
        var color = o.target ? MARK : INK;
        items.push('<path d="M' + n(s.x) + ' ' + n(-s.y) + ' A' + r + ' ' + r + ' 0 ' + (sweep > 180 ? 1 : 0) + ' 0 ' + n(e.x) + ' ' + n(-e.y) + '" fill="none" stroke="' + color + '" stroke-width="1.2"' +
          ' data-angle="' + [v, a, b].join(',') + '"' + (o.reflex ? ' data-reflex="1"' : '') + (o.given != null ? ' data-given="' + o.given + '"' : '') + (o.target ? ' data-target="' + o.target + '"' : '') + '/>');
        if (o.label !== '') {
          var text = o.label != null ? o.label : (o.given != null ? o.given + '°' : o.target);
          var at = add(c, polar(start + sweep / 2, r + (o.gap != null ? o.gap : 13)));
          F.text(at, text, { color: color, size: o.size || 13 });
        } else see(add(c, polar(start + sweep / 2, r)), 2);
      },
      right: function (v, a, b, s) {
        s = s || 8; var u = unit(sub(named[a], named[v])), w = unit(sub(named[b], named[v])), c = named[v];
        var p1 = add(c, mul(u, s)), p2 = add(p1, mul(w, s)), p3 = add(c, mul(w, s));
        F.line(p1, p2, { w: 1 }); F.line(p2, p3, { w: 1 });
      },
      svg: function (label) {
        var pad = 6, x = box.x0 - pad, y = -box.y1 - pad, w = box.x1 - box.x0 + pad * 2, h = box.y1 - box.y0 + pad * 2;
        var marks = pts.map(function (q) { return '<g data-p="' + q[0] + '" data-x="' + n(q[1].x) + '" data-y="' + n(q[1].y) + '"></g>'; }).join('');
        return '<svg class="u2-fig" viewBox="' + [n(x), n(y), n(w), n(h)].join(' ') + '" style="display:block;width:100%;max-width:' + Math.round(width || 360) + 'px;height:auto;margin:12px auto 0;font-family:inherit" role="img" aria-label="' + label + '">' + items.join('') + marks + '</svg>';
      },
      size: function () { return { w: box.x1 - box.x0, h: box.y1 - box.y0 }; }
    };
    return F;
  }

  var JAMO = ['㉠', '㉡', '㉢', '㉣', '㉤', '㉥', '㉦', '㉧', '㉨', '㉩', '㉪', '㉫', '㉬', '㉭'];
  var CIRC = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  function Retry() {}
  function must(c) { if (!c) throw new Retry(); }
  function out(html, answer, solution) { return { html: html, answer: String(answer), solution: solution }; }

  /* ================================================================ 1·2차시 1번: 선이 겹친 그림에서 180°보다 작은 각 세기 */
  function arrangementCount(segs) {
    var verts = [];
    function addV(p) { if (!verts.some(function (v) { return len(sub(v, p)) < 1e-6; })) verts.push(p); }
    segs.forEach(function (s) { addV(s[0]); addV(s[1]); });
    for (var i = 0; i < segs.length; i++) for (var j = i + 1; j < segs.length; j++) {
      var m = meet(segs[i][0], sub(segs[i][1], segs[i][0]), segs[j][0], sub(segs[j][1], segs[j][0]));
      if (m && m.t > -1e-9 && m.t < 1 + 1e-9 && m.s > -1e-9 && m.s < 1 + 1e-9) addV(m.p);
    }
    var total = 0, list = [], minRay = 180;
    verts.forEach(function (v) {
      var rays = [];
      segs.forEach(function (s) {
        var d = sub(s[1], s[0]), t = ((v.x - s[0].x) * d.x + (v.y - s[0].y) * d.y) / (d.x * d.x + d.y * d.y);
        if (t < -1e-9 || t > 1 + 1e-9 || len(sub(add(s[0], mul(d, t)), v)) > 1e-6) return;
        [s[0], s[1]].forEach(function (end) {
          if (len(sub(end, v)) < 1e-6) return;
          var a = dirOf(sub(end, v));
          if (!rays.some(function (r) { var x = Math.abs(r - a); return Math.min(x, 360 - x) < 0.01; })) rays.push(a);
        });
      });
      var c = 0;
      for (var p = 0; p < rays.length; p++) for (var q = p + 1; q < rays.length; q++) {
        var x = Math.abs(rays[p] - rays[q]); x = Math.min(x, 360 - x);
        minRay = Math.min(minRay, x);
        if (x < 179.99) c++;
      }
      if (c) list.push({ v: v, count: c });
      total += c;
    });
    return { total: total, verts: verts, list: list, minRay: minRay };
  }
  function g_a1(level, R) {
    var A = P(R.int(55, 75), R.int(168, 184)), D = P(A.x, 0);
    var B = P(A.x, R.int(72, 88)), C = P(R.int(190, 215), R.int(52, 68));
    var t = R.int(54, 66) / 100, Q = add(A, mul(sub(C, A), t));
    var d2 = unit(sub(Q, B)), L2 = [sub(B, mul(d2, R.int(55, 68))), add(Q, mul(d2, R.int(80, 100)))];
    var d1 = unit(sub(B, C)), L1 = [add(B, mul(d1, R.int(50, 62))), C];
    var d3 = unit(sub(Q, D)), L3 = [D, add(Q, mul(d3, R.int(58, 76)))];
    var m = meet(D, d3, C, d1); must(m);
    var Pp = m.p; must(Pp.x > B.x + 18 && Pp.x < C.x - 18);
    var AP = [A, Pp];
    var extras = [
      function () { L1 = [L1[0], add(C, mul(d1, -R.int(34, 48)))]; },                       // 아래 가로선을 오른쪽으로 더 긋기
      function () { L3 = [add(D, mul(d3, -R.int(30, 42))), L3[1]]; },                       // 비스듬한 선을 아래로 더 긋기
      function () { AP = [A, add(Pp, mul(unit(sub(Pp, A)), R.int(30, 42)))]; },             // 가운데 선분을 더 긋기
      function () { var e = unit(sub(C, A)); C = C; extraLine = [C, add(C, mul(e, R.int(30, 44)))]; }  // 오른쪽 선을 더 긋기
    ];
    var extraLine = null, useAP = level !== 'lower';
    var picks = level === 'lower' ? R.int(0, 1) : (level === 'same' ? R.int(0, 1) : R.int(2, 3));
    var pool = [0, 1, 2, 3].filter(function (i) { return useAP || i !== 2; });
    for (var k = 0; k < picks; k++) { var at = R.int(0, pool.length - 1); extras[pool.splice(at, 1)[0]](); }
    var segs = [[A, D], [A, C], L1, L2, L3];
    if (useAP) segs.push(AP);
    if (extraLine) { segs[1] = [A, extraLine[1]]; }
    if (level === 'lower') { var drop = R.int(0, 2); if (drop) segs.splice(drop === 1 ? 2 : 3, 1); }
    var r = arrangementCount(segs);
    for (var i = 0; i < r.verts.length; i++) for (var j = i + 1; j < r.verts.length; j++) must(len(sub(r.verts[i], r.verts[j])) > 15);
    must(r.minRay > 9);
    var F = Figure(340);
    segs.forEach(function (s, i) { F.line(s[0], s[1], { cls: 'u2-seg' }); F.point('s' + i + 'a', s[0]); F.point('s' + i + 'b', s[1]); });
    var parts = r.list.map(function (x) { return x.count; });
    return out('다음 그림에서 180°보다 작은 각은 모두 몇 개입니까?' + F.svg('여러 선분이 만나는 그림'), r.total + '개',
      '선이 만나거나 꺾이는 점마다 180°보다 작은 각을 셉니다. 점 ' + parts.length + '곳에서 각각 ' + parts.join(', ') + '개이므로 모두 ' + r.total + '개입니다.');
  }

  /* ================================================================ 1·2차시 4번: 삼각형을 돌린 각 */
  function g_a4(level, R) {
    var s = level === 'higher' ? 1 : 5;
    var A = R.step(20, 35, s), C = R.step(25, 40, s), B = 180 - A - C, th = R.step(25, 40, s), x = A + th;
    must(B >= 105 && B - th >= 55 && A !== th);
    var k = 330, BA = k * Math.sin(C * RAD), BC = k * Math.sin(A * RAD);
    var F = Figure(380);
    var O = F.point('N', P(0, 0));
    var A2 = F.point('D', polar(180, BA)), C2 = F.point('E', polar(180 - B, BC));   // 돌린 뒤(실선)
    var A1 = F.point('G', polar(180 - th, BA)), C1 = F.point('S', polar(180 - th - B, BC));   // 처음(점선)
    var m = meet(O, sub(A1, O), A2, sub(C2, A2)); must(m && m.t > 0.2 && m.t < 0.85 && m.s > 0.1 && m.s < 0.9);
    F.point('X', m.p);
    F.poly([O, A2, C2]); F.poly([O, A1, C1], { dash: true });
    F.angle('N', 'D', 'E', { given: B, r: 18 });
    F.angle('S', 'G', 'N', { given: C, r: 30 });
    F.angle('X', 'D', 'G', { given: x, r: 15 });
    F.text(add(A1, polar(150, 11)), 'ㄱ'); F.text(add(O, P(0, -12)), 'ㄴ'); F.text(add(C1, P(12, 2)), 'ㄷ');
    var arrowA = polar(180 - th + 3, BA * 1.07), arrowB = polar(177, BA * 1.07), mid = polar(180 - th / 2, BA * 1.11);
    F.line(arrowA, mid, { w: 1 }); F.line(mid, arrowB, { w: 1 });
    F.line(arrowB, add(arrowB, polar(dirOf(sub(mid, arrowB)) + 25, 9)), { w: 1 }); F.line(arrowB, add(arrowB, polar(dirOf(sub(mid, arrowB)) - 25, 9)), { w: 1 });
    var q, answer, more = '';
    if (level === 'higher') {
      F.text(add(A2, P(-12, -4)), 'ㄹ'); F.text(add(C2, P(8, 11)), 'ㅁ');
      q = '삼각형 ㄱㄴㄷ을 점 ㄴ을 중심으로 화살표 방향으로 돌려 삼각형 ㄹㄴㅁ을 만들었습니다. 각 ㄹㄴㄷ의 크기를 구하세요.';
      answer = B + th; must(answer < 175);
      more = ' 각 ㄹㄴㄷ은 각 ㄱㄴㄷ ' + B + '°와 돌린 각 ' + th + '°를 더한 ' + answer + '°입니다.';
    } else {
      q = '삼각형 ㄱㄴㄷ(점선)을 점 ㄴ을 중심으로 화살표 방향으로 돌렸습니다. 삼각형 ㄱㄴㄷ을 몇 도만큼 돌렸습니까?';
      answer = th;
    }
    return out(q + F.svg('삼각형을 한 꼭짓점을 중심으로 돌린 그림'), answer + '°',
      '삼각형 ㄱㄴㄷ의 각 ㄱ은 180° − ' + B + '° − ' + C + '° = ' + A + '°입니다. 그림의 ' + x + '°는 각 ㄱ의 크기와 돌린 각을 더한 것이므로 돌린 각은 ' + x + '° − ' + A + '° = ' + th + '°입니다.' + more);
  }

  /* ================================================================ 1·2차시 5번: 한 점에서 만나는 네 도형 */
  function g_a5(level, R) {
    var n = level === 'lower' ? 3 : (level === 'same' ? 4 : 5);
    var s = level === 'higher' ? 1 : 5;
    var g1 = R.step(25, 45, s), g2 = R.step(25, 45, s), sum = 180 - g1 - g2;
    must(g1 !== g2);
    var a = R.step(40, sum - 40, s), b = sum - a; must(a >= 40 && b >= 40 && a <= 75 && b <= 75);
    var F = Figure(390);
    var O = F.point('O', P(0, 0));
    var start = R.int(-18, -6), spans = [[start, b], [start + b + g1, a], [start + b + g1 + a + g2, b], [start + 2 * b + 2 * g1 + a + g2, a]];
    var letter = 0, marks = n * 4 - 4 > JAMO.length ? false : true;
    spans.forEach(function (sp, si) {
      var wide = si % 2 === 0, reach = wide ? R.int(128, 146) : R.int(96, 112);
      var keys = ['O'], list = [P(0, 0)];
      var r1 = reach * 0.78, r2 = reach * (wide ? 0.8 : 0.74);
      var p1 = polar(sp[0], r1), p2 = polar(sp[0] + sp[1], r2);
      var mids = [];
      var count = n - 3;   // 두 변 끝점 사이에 더 놓는 꼭짓점 수
      var chordMid = mul(add(p1, p2), 0.5);
      if (count === 1) mids.push(mul(unit(chordMid), len(chordMid) * 1.36));
      if (count === 2) { var u = unit(chordMid), push = len(chordMid) * 0.34;
        mids.push(add(add(p1, mul(sub(p2, p1), 0.27)), mul(u, push)), add(add(p1, mul(sub(p2, p1), 0.73)), mul(u, push))); }
      [p1].concat(mids, [p2]).forEach(function (p, i) { var key = 'q' + si + '_' + i; F.point(key, p); keys.push(key); list.push(p); });
      F.poly(list);
      var turn = 0;
      for (var i = 0; i < list.length; i++) {   // 볼록한지 확인
        var u1 = sub(list[(i + 1) % list.length], list[i]), u2 = sub(list[(i + 2) % list.length], list[(i + 1) % list.length]);
        var c = cross(u1, u2); must(Math.abs(c) > 1e-6); must(!turn || (c > 0) === (turn > 0)); turn = c;
      }
      for (var j = 1; j < keys.length; j++) {
        F.angle(keys[j], keys[j - 1], keys[(j + 1) % keys.length], { r: 9, gap: 10, size: 12, target: marks ? JAMO[letter] : '●' + letter, label: marks ? JAMO[letter] : '' });
        letter++;
      }
    });
    F.angle('O', 'q0_' + (n - 2), 'q1_0', { given: g1, r: 22, gap: 15 });
    F.angle('O', 'q1_' + (n - 2), 'q2_0', { given: g2, r: 18, gap: 16 });
    var total = 4 * (n - 2) * 180 - (360 - 2 * (g1 + g2));
    var name = { 3: '삼각형', 4: '사각형', 5: '오각형' }[n];
    return out('그림은 한 점에서 만나는 ' + name + ' 4개입니다. 마주 보는 두 도형의 변은 각각 한 직선 위에 있습니다. ' + (marks ? '기호로 표시한' : '호로 표시한') + ' 각의 크기의 합을 구하세요.' + F.svg('한 점에서 만나는 ' + name + ' 네 개'), total + '°',
      name + ' 4개의 안쪽 각의 합은 ' + ((n - 2) * 180) + '° × 4 = ' + (4 * (n - 2) * 180) + '°입니다. 가운데 점 둘레에서 빈 곳은 ' + g1 + '°, ' + g2 + '°가 두 번씩이므로, 네 도형의 가운데 각의 합은 360° − ' + (2 * (g1 + g2)) + '° = ' + (360 - 2 * (g1 + g2)) + '°입니다. 따라서 ' + (4 * (n - 2) * 180) + '° − ' + (360 - 2 * (g1 + g2)) + '° = ' + total + '°입니다.');
  }

  /* ================================================================ 1·2차시 6번: 이어 붙인 도형의 네 각의 합 */
  function g_a6(level, R) {
    var s = level === 'lower' ? 5 : 1;
    var a = R.step(12, 24, level === 'lower' ? 5 : 1), ext = level === 'lower' ? R.pick([160, 165]) : R.step(162, 170, s), e = 180 - ext;
    if (level === 'lower') a = R.pick([15, 20, 25]);
    var F = Figure(390);
    var J = F.point('J', P(0, 0)), H = 108, W = e >= 15 ? 96 : 128, K = Math.max(46, Math.ceil(W * Math.tan(e * RAD)) + 24);
    must(K <= 70);
    F.point('T', P(0, H)); F.point('U', P(W, H));
    var E = F.point('E', P(W, -W * Math.tan(e * RAD)));
    var Kp = F.point('K', P(0, -K)), Fp = F.point('F', P(K / Math.tan(e * RAD), -K));
    must(Fp.x < 300 && Fp.x > W + 30);
    var Z = F.point('Z', P(Fp.x + 52, -K));
    var S = F.point('S', polar(90 + a, 104)), G = F.point('G', P(-R.int(58, 70), 0));
    F.line(J, F.point('T', P(0, H))); F.line(P(0, H), P(W, H)); F.line(P(W, H), E); F.line(J, Fp); F.line(J, Kp); F.line(Kp, Z); F.line(G, J); F.line(G, S); F.line(S, J);
    F.right('T', 'J', 'U'); F.right('U', 'T', 'E'); F.right('K', 'J', 'F'); F.right('J', 'G', 'K');
    F.angle('J', 'T', 'S', { given: a, r: 36, gap: 14 });
    var target = level !== 'higher';
    F.angle('S', 'G', 'J', { r: 18, gap: 11, target: '㉠' });
    F.angle('G', 'S', 'J', { r: 15, gap: 12, target: '㉡' });
    F.angle('E', 'J', 'U', { r: 14, gap: 12, target: '㉢' });
    F.angle('J', 'K', 'F', { r: 20, gap: 12, target: '㉣' });
    var d = ext - 90, total = 90 + a + 2 * d;
    F.angle('F', 'Z', 'J', target ? { given: ext, r: 17, gap: 17 } : { r: 17, gap: 15, target: '㉤' });
    var how = '왼쪽 작은 삼각형에서 아래 꼭짓점의 각은 90° − ' + a + '° = ' + (90 - a) + '°이므로 ㉠ + ㉡ = 180° − ' + (90 - a) + '° = ' + (90 + a) + '°입니다.';
    if (target) {
      return out('다음 도형에서 ㉠, ㉡, ㉢, ㉣의 크기의 합을 구하세요.' + F.svg('삼각형과 사각형을 이어 붙인 그림'), total + '°',
        how + ' 아래 삼각형에서 오른쪽 안쪽 각은 180° − ' + ext + '° = ' + e + '°이므로 ㉣ = 90° − ' + e + '° = ' + d + '°입니다. 위 사각형에서 ㉢ = 360° − 90° − 90° − (180° − ' + d + '°) = ' + d + '°입니다. 합은 ' + (90 + a) + '° + ' + d + '° + ' + d + '° = ' + total + '°입니다.');
    }
    return out('다음 도형에서 ㉠, ㉡, ㉢, ㉣의 크기의 합이 ' + total + '°일 때, ㉤의 크기를 구하세요.' + F.svg('삼각형과 사각형을 이어 붙인 그림'), ext + '°',
      how + ' ㉢과 ㉣은 크기가 같으므로 ㉣ = (' + total + '° − ' + (90 + a) + '°) ÷ 2 = ' + d + '°입니다. 아래 삼각형의 오른쪽 안쪽 각은 90° − ' + d + '° = ' + e + '°이므로 ㉤ = 180° − ' + e + '° = ' + ext + '°입니다.');
  }

  /* ================================================================ 3·4차시 1번: 종이 테이프 접기 */
  function g_b1(level, R) {
    var s = level === 'lower' ? 2 : 1;
    var al = R.step(58, 68, s), be = R.step(65, 80, s), de = 2 * al - be, one = 180 - de;
    must(de >= 42 && de <= 66);
    var h = 58, F = Figure(420);
    var T = F.point('T', P(0, h));
    var U = F.point('U', P(-h / Math.tan(al * RAD), 0));
    var V = F.point('V', P(-h * Math.cos(2 * al * RAD) / Math.sin(2 * al * RAD), 0));
    var Z = F.point('Z', P(V.x + h / Math.tan(de / 2 * RAD), h));
    var Lt = len(sub(V, T)) + 34, X = Z.x + 14;
    var R0 = F.point('R0', reflect(P(-Lt, 0), T, U)), Rh = F.point('R1', reflect(P(-Lt, h), T, U));
    var C0 = F.point('C0', reflect(P(X, 0), V, Z)), C1 = F.point('C1', reflect(P(X, h), V, Z));
    var m = meet(V, sub(C0, V), P(0, h), P(1, 0)); must(m && m.t > 0 && m.t < 0.95 && m.p.x > 22);
    var M = F.point('M', m.p);
    var W0 = F.point('W', P(-Lt, 0));
    F.line(P(-Lt, h), T, { dash: true }); F.line(P(-Lt, h), P(-Lt, 0), { dash: true }); F.line(W0, U, { dash: true });
    F.line(M, P(X, h), { dash: true }); F.line(P(X, h), P(X, 0), { dash: true }); F.line(P(X, 0), V, { dash: true });
    F.poly([T, U, R0, Rh]); F.line(T, M); F.line(V, C0); F.line(C0, C1); F.line(C1, Z); F.line(Z, V);
    F.angle('T', 'U', 'V', { given: al, r: 15, gap: 14 });
    if (level !== 'higher') F.angle('V', 'T', 'C0', { given: be, r: 17, gap: 14 });
    F.point('H', P(Z.x - 40, h));
    var head = '다음 그림은 직사각형 모양의 종이 테이프를 두 번 접은 것입니다. ';
    var left = 180 - 2 * al;
    var fold = '접은 부분은 겹치므로 처음 접은 선의 양쪽 각은 ' + al + '°로 같습니다. 위쪽 삼각형의 왼쪽 위 각은 180° − ' + al + '° × 2 = ' + left + '°입니다.';
    if (level === 'higher') {
      F.angle('Z', 'C1', 'H', { given: one, r: 15, gap: 17 });
      F.angle('V', 'T', 'C0', { r: 24, gap: 14, target: '㉠' });
      return out(head + '㉠의 크기를 구하세요.' + F.svg('종이 테이프를 두 번 접은 그림'), be + '°',
        fold + ' 접힌 끝부분의 사각형은 두 각이 직각이므로 나머지 한 각은 360° − 90° − 90° − ' + one + '° = ' + de + '°이고, 이 각은 위쪽 삼각형의 오른쪽 각과 마주 보는 각이라 크기가 같습니다. 따라서 ㉠ = 180° − ' + left + '° − ' + de + '° = ' + be + '°입니다.');
    }
    F.angle('Z', 'C1', 'H', { r: 14, gap: 20, target: '㉠' });
    return out(head + '㉠의 크기를 구하세요.' + F.svg('종이 테이프를 두 번 접은 그림'), one + '°',
      fold + ' 위쪽 삼각형의 오른쪽 각은 180° − ' + left + '° − ' + be + '° = ' + de + '°입니다. 접힌 끝부분의 사각형에도 이 각과 마주 보는 ' + de + '°가 있고 두 각은 직각이므로 ㉠ = 360° − 90° − 90° − ' + de + '° = ' + one + '°입니다.');
  }

  /* ================================================================ 3·4차시 3번: 크기가 같은 각이 있는 오각형 */
  function g_b3(level, R) {
    var s = level === 'lower' ? 5 : 1;
    var L = R.step(75, 95, s), B = R.step(100, 120, s), rf = R.step(250, 270, s);
    var both = rf - B, one = 540 - L - B - 2 * both;
    must(one >= 30 && one <= 62 && both >= 138 && both <= 162);
    var n = Math.round(both / 2) + R.int(-7, 7), m = both - n;
    must(n >= 60 && n <= 88 && m >= 60 && m <= 88);
    var F = Figure(380);
    var O = F.point('B', P(0, 0));
    var BL = F.point('P', polar(90 + B / 2, R.int(74, 88))), E = F.point('E', polar(90 - B / 2, R.int(70, 84)));
    var toL = polar(dirOf(sub(O, BL)) + 2 * n, 1), toR = polar(dirOf(sub(O, E)) - 2 * m, 1);
    var Lp = add(BL, mul(toL, R.int(62, 80)));
    var dLR = polar(dirOf(sub(BL, Lp)) + L, 1);
    var hit = meet(Lp, dLR, E, toR); must(hit && hit.t > 90 && hit.s > 45);
    var Rp = hit.p;
    F.point('L', Lp); F.point('R', Rp);
    var bi = meet(BL, polar(dirOf(sub(O, BL)) + n, 1), E, polar(dirOf(sub(O, E)) - m, 1)); must(bi && bi.t > 0 && bi.s > 0);
    var I = F.point('I', bi.p);
    var side = unit(sub(Rp, Lp)), gapTop = Math.abs(cross(side, sub(I, Lp)));
    must(cross(side, sub(I, Lp)) < 0 && gapTop > 24 && I.y > 18 && len(sub(Rp, Lp)) < 330);
    F.poly([Lp, Rp, E, O, BL]); F.line(BL, I); F.line(I, E);
    F.angle('L', 'R', 'P', { given: L, r: 15, gap: 14 });
    F.angle('B', 'P', 'E', { given: B, r: 14, gap: 13 });
    F.angle('P', 'L', 'I', { r: 13, gap: 9, size: 12, target: '㉡' });
    F.angle('P', 'I', 'B', { r: 16, gap: 9, size: 12, target: '㉢' });
    F.angle('E', 'B', 'I', { r: 13, gap: 9, size: 12, target: '㉣' });
    F.angle('E', 'I', 'R', { r: 16, gap: 9, size: 12, target: '㉤' });
    var svg;
    if (level === 'higher') {
      F.angle('R', 'L', 'E', { given: one, r: 24, gap: 15 });
      F.angle('I', 'P', 'E', { reflex: true, r: 10, gap: 8, target: '㉠' });
      svg = F.svg('크기가 같은 각이 있는 오각형 그림');
      var half = (540 - L - B - one) / 2; must(half === both);
      return out('다음 그림에서 ㉡과 ㉢의 크기가 같고, ㉣과 ㉤의 크기가 같습니다. ㉠의 크기를 구하세요.' + svg, rf + '°',
        '오각형의 안쪽 각의 합은 540°입니다. ㉡+㉢+㉣+㉤ = 540° − ' + L + '° − ' + one + '° − ' + B + '° = ' + (2 * both) + '°이므로 ㉢+㉣ = ' + both + '°입니다. 아래 사각형에서 안쪽의 작은 각은 360° − ' + B + '° − ' + both + '° = ' + (360 - B - both) + '°이므로 ㉠ = 360° − ' + (360 - B - both) + '° = ' + rf + '°입니다.');
    }
    F.angle('I', 'P', 'E', { reflex: true, given: rf, r: 10, gap: 16 });
    F.angle('R', 'L', 'E', { r: 24, gap: 13, target: '㉠' });
    svg = F.svg('크기가 같은 각이 있는 오각형 그림');
    return out('다음 그림에서 ㉡과 ㉢의 크기가 같고, ㉣과 ㉤의 크기가 같습니다. ㉠의 크기를 구하세요.' + svg, one + '°',
      '아래 사각형에서 안쪽의 작은 각은 360° − ' + rf + '° = ' + (360 - rf) + '°이므로 ㉢+㉣ = 360° − ' + (360 - rf) + '° − ' + B + '° = ' + both + '°입니다. ㉡+㉤도 ' + both + '°입니다. 오각형의 안쪽 각의 합 540°에서 ㉠ = 540° − ' + L + '° − ' + B + '° − ' + both + '° × 2 = ' + one + '°입니다.');
  }

  /* ================================================================ 3·4차시 4번: 긴바늘이 움직인 뒤의 작은 각 */
  function hm(total) { var t = ((total % 720) + 720) % 720, h = Math.floor(t / 60) || 12; return { h: h, m: t % 60, text: h + '시 ' + (t % 60 ? (t % 60) + '분' : '정각') }; }
  function handAngles(t) { return { long: t.m * 6, short: (t.h % 12) * 30 + t.m / 2 }; }
  function g_b4(level, R) {
    var start = R.int(1, 5) * 60 + (level === 'lower' ? R.step(0, 50, 10) : R.step(2, 58, 2));
    var move = level === 'lower' ? R.step(60, 150, 10) : R.int(65, 175);
    var back = level === 'higher';
    var end = back ? start - move : start + move;
    var t = hm(end), g = handAngles(t), diff = Math.abs(g.long - g.short), small = Math.min(diff, 360 - diff);
    must(t.m % 2 === 0 && small > 0 && small < 180);
    var s = hm(start);
    must(!back || (end > 0));
    return out('지금 시각은 오후 ' + s.text + '입니다. 긴바늘이 ' + (move * 6) + '° ' + (back ? '움직이기 전' : '움직인 후') + '의 시각에서 긴바늘과 짧은바늘이 이루는 작은 쪽의 각의 크기를 구하세요.', small + '°',
      '긴바늘은 1분에 6°씩 움직이므로 ' + (move * 6) + '° ÷ 6° = ' + move + '분이 ' + (back ? '지나기 전' : '지난 뒤') + '인 ' + t.text + '입니다. 12에서 시계 방향으로 긴바늘은 ' + g.long + '°, 짧은바늘은 ' + g.short + '°에 있습니다. 두 각의 차는 ' + diff + '°' +
      (diff > 180 ? '이고 작은 쪽의 각은 360° − ' + diff + '° = ' + small + '°입니다.' : '이므로 작은 쪽의 각은 ' + small + '°입니다.'));
  }

  /* ================================================================ 시계 그림 */
  function clockFace(F, r) { F.circle(P(0, 0), r, { w: 3 }); F.circle(P(0, 0), 2.6, { fill: INK }); F.point('O', P(0, 0)); }
  function cw(deg, r) { return polar(90 - deg, r); }   // 12시에서 시계 방향으로 잰 각
  /* 3·4차시 5번: 숫자가 없는 시계 */
  function g_b5(level, R) {
    var d = level === 'higher' ? R.int(10, 24) : R.pick(level === 'lower' ? [15, 20] : [10, 15, 20, 25]);
    var h = R.int(1, 12), m = 60 - 2 * d, rot = 30 * R.int(1, 11);
    var F = Figure(250);
    clockFace(F, 92);
    for (var i = 0; i < 60; i++) F.line(cw(i * 6, i % 5 ? 86 : 80), cw(i * 6, 90), { w: i % 5 ? 0.8 : 1.8 });
    var hourDeg = (h % 12) * 30 + m / 2 + rot, minDeg = m * 6 + rot, markDeg = ((h % 12) + 1) * 30 + rot;
    var H = F.point('H', cw(hourDeg, 46)), Mn = F.point('M', cw(minDeg, 72)), K = F.point('K', cw(markDeg, 80));
    var diffH = Math.abs(((minDeg - hourDeg) % 360 + 360) % 360);
    must(Math.min(diffH, 360 - diffH) > 25);
    var sepMark = Math.abs(((minDeg - markDeg) % 360 + 360) % 360); must(Math.min(sepMark, 360 - sepMark) > 8);
    F.line(P(0, 0), H, { w: 4 }); F.line(P(0, 0), Mn, { w: 2.2 }); F.line(P(0, 0), K, { w: 1.2, dash: true });
    F.angle('O', 'H', 'K', { given: d, r: 34, gap: 26 });
    var t = h + '시 ' + m + '분';
    var base = '짧은바늘은 숫자가 있던 자리(점선)까지 ' + d + '° 남았으므로 앞의 숫자에서 30° − ' + d + '° = ' + (30 - d) + '° 지났습니다. 짧은바늘은 1분에 0.5°씩 움직이므로 ' + m + '분입니다. 긴바늘이 ' + m + '분을 가리키도록 12의 자리를 정하면 ' + t + '입니다.';
    var q = '숫자가 지워진 시계를 굴렸더니 12가 있던 자리를 알 수 없게 되었습니다. 짧은 눈금은 1분 간격, 긴 눈금은 숫자가 있던 자리이고, 점선은 그중 한 곳을 가리킵니다. 긴바늘과 짧은바늘이 그림과 같을 때, ';
    if (level === 'higher') {
      var later = R.pick([20, 30, 40, 50]), t2 = hm((h % 12) * 60 + m + later), g = handAngles(t2), x = Math.abs(g.long - g.short), small = Math.min(x, 360 - x);
      must(t2.m % 2 === 0 && small > 0 && small < 180);
      return out(q + later + '분 뒤에 두 바늘이 이루는 작은 쪽의 각을 구하세요.' + F.svg('숫자가 없는 시계'), small + '°',
        base + ' ' + later + '분 뒤는 ' + t2.text + '이고, 긴바늘은 ' + g.long + '°, 짧은바늘은 ' + g.short + '°에 있으므로 작은 쪽의 각은 ' + small + '°입니다.');
    }
    return out(q + '시계가 가리키는 시각은 몇 시 몇 분입니까?' + F.svg('숫자가 없는 시계'), t, base);
  }
  /* 3·4차시 6번: 짧은바늘이 N시간에 한 바퀴 도는 시계 */
  function g_b6(level, R) {
    var N = level === 'same' ? R.pick([8, 9, 10]) : (level === 'lower' ? R.pick([6, 8, 9, 10]) : R.pick([8, 10]));
    var h = R.int(1, N - 1), m = level === 'higher' ? R.pick([15, 20, 30, 40, 45]) : 0;
    var shortDeg = (h + m / 60) * 360 / N, longDeg = m * 6;
    must(Math.abs(shortDeg - Math.round(shortDeg * 2) / 2) < 1e-9);
    var diff = Math.abs(shortDeg - longDeg), small = Math.min(diff, 360 - diff);
    must(small > 0 && small < 179.9 && Math.abs(small - Math.round(small)) < 1e-9);   // 답은 자연수
    var F = Figure(230);
    clockFace(F, 92);
    for (var i = 1; i <= N; i++) F.text(cw(i * 360 / N, 74), String(i), { size: 15 });
    var H = F.point('H', cw(shortDeg, 46)), Mn = F.point('M', cw(longDeg, 62));
    F.line(P(0, 0), H, { w: 4 }); F.line(P(0, 0), Mn, { w: 2.2 });
    var each = 360 / N, when = h + '시 ' + (m ? m + '분' : '정각');
    return out('긴바늘은 1시간에 한 바퀴 돌고, 짧은바늘은 ' + N + '시간에 한 바퀴 도는 시계가 있습니다. 그림은 ' + when + '을 나타냅니다. 긴바늘과 짧은바늘이 이루는 작은 쪽의 각의 크기를 구하세요.' + F.svg(N + '시간 시계'), small + '°',
      '짧은바늘은 1시간에 360° ÷ ' + N + ' = ' + each + '°씩 움직입니다. 12시 방향에서 시계 방향으로 짧은바늘은 ' + shortDeg + '°, 긴바늘은 ' + longDeg + '°에 있습니다. 두 각의 차는 ' + diff + '°' + (diff > 180 ? '이므로 작은 쪽의 각은 360° − ' + diff + '° = ' + small + '°입니다.' : '이므로 작은 쪽의 각은 ' + small + '°입니다.'));
  }

  var FAMILIES = { 'u2-12-q1': g_a1, 'u2-12-q4': g_a4, 'u2-12-q5': g_a5, 'u2-12-q6': g_a6, 'u2-34-q1': g_b1, 'u2-34-q3': g_b3, 'u2-34-q4': g_b4, 'u2-34-q5': g_b5, 'u2-34-q6': g_b6 };

  /* 같은 번호면 같은 문제. 조건에 맞지 않는 값이 뽑히면 다음 값으로 다시 만든다. */
  function generate(key, level, seed) {
    var fn = FAMILIES[key]; if (!fn) return null;
    for (var k = 0; k < 600; k++) {
      try { return fn(level, makeRng((seed + Math.imul(k, 2654435761)) >>> 0)); }
      catch (e) { if (!(e instanceof Retry)) throw e; }
    }
    return null;
  }

  var api = { generate: generate, keys: Object.keys(FAMILIES), arrangementCount: arrangementCount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UPGRADE41_U2 = api;
})(typeof window !== 'undefined' ? window : null);
