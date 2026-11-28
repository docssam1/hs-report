(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.HSE_FIGURE_DIMENSION_ARCS = api;
  api.install(root);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  // 교재 표기: 길이는 변 바깥쪽 점선 호(치수선) 옆에 쓴다.
  // 생성된 SVG에서 길이 글자가 가리키는 변을 찾아 점선 호를 덧그린다.
  // 이미 점선이 가까이 있는 글자, 어느 변인지 분명하지 않은 글자는 건드리지 않는다.
  const LENGTH = /(?:^|[^\d.])\d+(?:\.\d+)?\s*(?:cm|mm|km|m)(?![²³a-zA-Z])/;
  const SCOPE = /^5-2-/;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function segmentsOf(svg) {
    const segs = [];
    const push = (el, pts, closed) => {
      const m = el.getCTM && el.getCTM();
      const root = svg.getCTM && svg.getCTM();
      const toUser = p => {
        if (!m || !root) return p;
        const pt = svg.createSVGPoint(); pt.x = p.x; pt.y = p.y;
        const screen = pt.matrixTransform(m);
        return screen.matrixTransform(root.inverse());
      };
      const q = pts.map(toUser);
      for (let i = 0; i + 1 < q.length; i += 1) segs.push([q[i], q[i + 1], el]);
      if (closed && q.length > 2) segs.push([q[q.length - 1], q[0], el]);
    };
    for (const el of svg.querySelectorAll('line')) {
      push(el, [{ x: +el.getAttribute('x1') || 0, y: +el.getAttribute('y1') || 0 }, { x: +el.getAttribute('x2') || 0, y: +el.getAttribute('y2') || 0 }], false);
    }
    for (const el of svg.querySelectorAll('polyline,polygon')) {
      const nums = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
      const pts = []; for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
      push(el, pts, el.tagName.toLowerCase() === 'polygon');
    }
    for (const el of svg.querySelectorAll('rect')) {
      const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0, w = +el.getAttribute('width') || 0, h = +el.getAttribute('height') || 0;
      if (w > 0 && h > 0) push(el, [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], true);
    }
    for (const el of svg.querySelectorAll('path')) {
      const d = el.getAttribute('d') || '';
      if (/[^MmLlHhVvZz\d\s,.\-eE]/.test(d)) continue;
      const toks = d.match(/[MmLlHhVvZz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
      let i = 0, cmd = 'M', cur = { x: 0, y: 0 }, start = null, pts = [];
      const flush = closed => { if (pts.length > 1) push(el, pts, closed); pts = []; };
      while (i < toks.length) {
        if (/[A-Za-z]/.test(toks[i])) { cmd = toks[i++]; if (/[Zz]/.test(cmd)) { flush(true); cur = start || cur; continue; } }
        const num = () => Number(toks[i++]);
        if (/[Mm]/.test(cmd)) { flush(false); const x = num(), y = num(); cur = cmd === 'm' ? { x: cur.x + x, y: cur.y + y } : { x, y }; start = cur; pts = [cur]; cmd = cmd === 'm' ? 'l' : 'L'; }
        else if (/[Ll]/.test(cmd)) { const x = num(), y = num(); cur = cmd === 'l' ? { x: cur.x + x, y: cur.y + y } : { x, y }; pts.push(cur); }
        else if (/[Hh]/.test(cmd)) { const x = num(); cur = { x: cmd === 'h' ? cur.x + x : x, y: cur.y }; pts.push(cur); }
        else if (/[Vv]/.test(cmd)) { const y = num(); cur = { x: cur.x, y: cmd === 'v' ? cur.y + y : y }; pts.push(cur); }
        else i += 1;
      }
      flush(false);
    }
    return segs;
  }

  function pointToUser(svg, el, x, y) {
    const m = el.getCTM && el.getCTM(), root = svg.getCTM && svg.getCTM();
    if (!m || !root) return { x, y };
    const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    return pt.matrixTransform(m).matrixTransform(root.inverse());
  }

  function isDashed(el) {
    for (let n = el; n && n.getAttribute; n = n.parentNode) {
      const da = n.getAttribute('stroke-dasharray');
      if (da && da !== 'none' && da !== '0') return true;
      if (n.tagName && n.tagName.toLowerCase() === 'svg') break;
    }
    try { const cs = getComputedStyle(el).strokeDasharray; return !!cs && cs !== 'none' && !/^0(px)?$/.test(cs); } catch (e) { return false; }
  }

  function boxOf(el, svg) {
    const b = el.getBBox();
    const m = el.getCTM(), root = svg.getCTM();
    if (!m || !root) return b;
    const inv = root.inverse();
    const corners = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(m).matrixTransform(inv);
    });
    const xs = corners.map(p => p.x), ys = corners.map(p => p.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }

  // 이미 그려진 실선 치수선: 도형의 변이 아니라 양 끝에 짧은 눈금(또는 화살촉)이 달린 선분.
  function isTickedDimensionLine(best, allSegments) {
    const tag = best.el.tagName.toLowerCase();
    if (tag !== 'line' && !(tag === 'path' || tag === 'polyline')) return false;
    if (best.el.getAttribute('marker-start') || best.el.getAttribute('marker-end')) return true;
    const ux = best.vx / best.L, uy = best.vy / best.L;
    const tickAt = p => allSegments.some(seg => {
      const [s, e] = seg;
      if (seg === best.seg) return false;
      const len = Math.hypot(e.x - s.x, e.y - s.y);
      if (len > 16) return false;
      const mx = (s.x + e.x) / 2, my = (s.y + e.y) / 2;
      if (Math.hypot(mx - p.x, my - p.y) > 6) return false;
      return Math.abs(((e.x - s.x) * ux + (e.y - s.y) * uy) / len) < 0.35;
    });
    if (tickAt(best.a) && tickAt(best.b)) return true;
    // 도형의 다른 선과 끝점을 공유하지 않는 가는 단독 선분도 치수선으로 본다.
    const width = parseFloat((() => { try { return getComputedStyle(best.el).strokeWidth; } catch (e) { return best.el.getAttribute('stroke-width'); } })()) || 1;
    if (width >= 1.4) return false;
    const touches = p => allSegments.some(seg => { const [s, e] = seg; return seg !== best.seg && (Math.hypot(s.x - p.x, s.y - p.y) < 3 || Math.hypot(e.x - p.x, e.y - p.y) < 3); });
    return !touches(best.a) && !touches(best.b);
  }

  function decorate(svg) {
    const texts = [...svg.querySelectorAll('text')].filter(t => LENGTH.test(t.textContent.replace(/\s+/g, ' ')) && t.textContent.length <= 14 && !/[=:]/.test(t.textContent));
    if (!texts.length) return 0;
    const allSegs = segmentsOf(svg);
    const dashedSeg = new Set(allSegs.filter(([, , el]) => isDashed(el)));
    const rectInfo = el => { try { const r = boxOf(el, svg); return { x: r.x, y: r.y, w: r.width, h: r.height }; } catch (e) { return { x: 0, y: 0, w: 0, h: 0 }; } };
    // 이미 그려진 곡선 점선(치수 호)
    const curvedDashed = [...svg.querySelectorAll('path,circle,ellipse')].filter(el => isDashed(el) && (el.tagName.toLowerCase() !== 'path' || /[AaQqCcSsTt]/.test(el.getAttribute('d') || ''))).map(el => { try { return boxOf(el, svg); } catch (e) { return null; } }).filter(Boolean);
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: +svg.getAttribute('width') || 0, height: +svg.getAttribute('height') || 0 };
    // 그림 전체를 가로지르는 틀·칸 경계선은 길이를 재는 변이 아니다.
    const isFrameLine = ([a, b]) => vb.width && vb.height && ((Math.abs(a.y - b.y) < 1 && Math.abs(b.x - a.x) >= vb.width * 0.9) || (Math.abs(a.x - b.x) < 1 && Math.abs(b.y - a.y) >= vb.height * 0.9));
    // 변 위에서 다른 선이 끝나거나 점 표시가 있는 곳에서 변을 나눈 부분 구간도 후보로 둔다.
    const dots = [...svg.querySelectorAll('circle')].filter(el => (+el.getAttribute('r') || 0) <= 6).map(el => pointToUser(svg, el, +el.getAttribute('cx') || 0, +el.getAttribute('cy') || 0));
    const candidates = [...allSegs];
    for (const seg of allSegs) {
      const [a, b] = seg; const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
      if (L2 < 36 * 36) continue;
      const ts = [];
      const consider = p => {
        const t = ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2;
        if (t <= 0.05 || t >= 0.95) return;
        if (Math.abs((p.x - a.x) * vy - (p.y - a.y) * vx) / Math.sqrt(L2) > 1.5) return;
        ts.push(t);
      };
      for (const other of allSegs) if (other !== seg) { consider(other[0]); consider(other[1]); }
      for (const d of dots) consider(d);
      const cuts = [0, ...[...new Set(ts.map(t => Math.round(t * 1000) / 1000))].sort((x, y) => x - y), 1];
      if (cuts.length < 3) continue;
      for (let i = 0; i + 1 < cuts.length; i += 1) {
        const p = { x: a.x + cuts[i] * vx, y: a.y + cuts[i] * vy }, q = { x: a.x + cuts[i + 1] * vx, y: a.y + cuts[i + 1] * vy };
        candidates.push([p, q, seg[2], seg]);
      }
    }
    let added = 0;
    for (const text of texts) {
      let tb; try { tb = boxOf(text, svg); } catch (e) { continue; }
      if (!tb.width) continue;
      const c = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 };
      const tol = Math.max(10, tb.height * 1.2);
      if (curvedDashed.some(b => Math.hypot(Math.max(b.x - c.x, 0, c.x - (b.x + b.width)), Math.max(b.y - c.y, 0, c.y - (b.y + b.height))) <= tol)) continue;
      // 글자를 품은 칸(다른 선을 둘 이상 품은 사각형) 가운데 가장 작은 것: 그 칸 안의 선에만 붙인다.
      let cell = null;
      for (const el of svg.querySelectorAll('rect')) {
        const r = rectInfo(el);
        if (!(c.x > r.x && c.x < r.x + r.w && c.y > r.y && c.y < r.y + r.h)) continue;
        const inside = allSegs.filter(([p, q, other]) => other !== el && Math.hypot(q.x - p.x, q.y - p.y) >= 12 && (p.x + q.x) / 2 > r.x + 2 && (p.x + q.x) / 2 < r.x + r.w - 2 && (p.y + q.y) / 2 > r.y + 2 && (p.y + q.y) / 2 < r.y + r.h - 2).length;
        if (inside >= 2 && (!cell || r.w * r.h < cell.w * cell.h)) cell = r;
      }
      const inCell = ([p, q]) => !cell || ((p.x + q.x) / 2 > cell.x + 1 && (p.x + q.x) / 2 < cell.x + cell.w - 1 && (p.y + q.y) / 2 > cell.y + 1 && (p.y + q.y) / 2 < cell.y + cell.h - 1);
      let best = null;
      for (const seg of candidates) {
        const [a, b, el] = seg;
        const vx = b.x - a.x, vy = b.y - a.y, L = Math.hypot(vx, vy);
        if (L < 18 || isFrameLine(seg) || !inCell(seg)) continue;
        if (el.tagName.toLowerCase() === 'rect') {
          const r = rectInfo(el);
          if (r.w < 30 && r.h < 30) continue;
          const holdsLabel = c.x > r.x && c.x < r.x + r.w && c.y > r.y && c.y < r.y + r.h;
          if (holdsLabel) {
            // 안에 다른 도형 선을 품은 사각형은 칸·틀이다.
            const inside = allSegs.filter(([p, q, other]) => other !== el && Math.hypot(q.x - p.x, q.y - p.y) >= 12 && (p.x + q.x) / 2 > r.x + 2 && (p.x + q.x) / 2 < r.x + r.w - 2 && (p.y + q.y) / 2 > r.y + 2 && (p.y + q.y) / 2 < r.y + r.h - 2).length;
            if (inside >= 2) continue;
          }
        }
        const t = ((c.x - a.x) * vx + (c.y - a.y) * vy) / (L * L);
        if (t < 0.2 || t > 0.8) continue;
        const px = a.x + t * vx, py = a.y + t * vy;
        const d = Math.hypot(c.x - px, c.y - py);
        if (d > Math.max(34, tb.height * 2.4)) continue;
        const score = d + Math.abs(t - 0.5) * 8;
        if (!best || score < best.score) best = { a, b, d, L, vx, vy, el, seg: seg[3] || seg, sub: !!seg[3], score };
      }
      if (!best) continue;
      // 가장 가까운 선이 점선이면 그 점선이 이미 치수선이거나, 글자가 점선 자체의 길이를 나타낸다.
      if (dashedSeg.has(best.seg)) continue;
      // 고른 변과 나란하고 길이가 겹치는 점선 치수선이 이미 가까이 있으면 건드리지 않는다.
      {
        const ux = best.vx / best.L, uy = best.vy / best.L;
        const labelSide = (c.x - best.a.x) * uy - (c.y - best.a.y) * ux;
        const covered = [...dashedSeg].some(([s, e]) => {
          const L2 = Math.hypot(e.x - s.x, e.y - s.y); if (L2 < 12) return false;
          if (Math.abs(((e.x - s.x) * uy - (e.y - s.y) * ux) / L2) > 0.17) return false;
          const p1 = (s.x - best.a.x) * ux + (s.y - best.a.y) * uy, p2 = (e.x - best.a.x) * ux + (e.y - best.a.y) * uy;
          const overlap = Math.min(Math.max(p1, p2), best.L) - Math.max(Math.min(p1, p2), 0);
          const off = ((s.x - best.a.x) * uy - (s.y - best.a.y) * ux) * Math.sign(labelSide || 1);
          return overlap >= best.L * 0.6 && off > 1 && off <= Math.abs(labelSide) + tb.height * 2;
        });
        if (covered) continue;
      }
      const closedShape = ['polygon', 'rect'].includes(best.el.tagName.toLowerCase()) || /[Zz]/.test(best.el.getAttribute('d') || '');
      if (!best.sub && !closedShape && isTickedDimensionLine(best, allSegs)) {
        best.el.setAttribute('stroke-dasharray', '4 3');
        best.el.style.strokeDasharray = '4 3';
        best.el.setAttribute('data-dimension-for', text.textContent.trim());
        added += 1;
        continue;
      }
      const { a, b, L, vx, vy } = best;
      let nx = -vy / L, ny = vx / L;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if ((c.x - mx) * nx + (c.y - my) * ny < 0) { nx = -nx; ny = -ny; }
      const halfExtent = Math.abs(nx) * tb.width / 2 + Math.abs(ny) * tb.height / 2;
      const along = (c.x - mx) * nx + (c.y - my) * ny;
      const apex = Math.max(4, Math.min(along - halfExtent - 2, L * 0.22));
      const path = svg.ownerDocument.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx + nx * apex * 2).toFixed(1)} ${(my + ny * apex * 2).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#55524d');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('stroke-dasharray', '4 3');
      path.setAttribute('style', 'fill:none;stroke:#55524d;stroke-width:1px;stroke-dasharray:4 3;stroke-linecap:butt');
      path.setAttribute('class', 'dimension-arc');
      path.setAttribute('data-dimension-for', text.textContent.trim());
      svg.insertBefore(path, svg.firstChild && svg.firstChild.nextSibling ? svg.firstChild.nextSibling : null);
      added += 1;
    }
    return added;
  }

  // 교재 표기: 각의 크기는 꼭짓점에서 두 변 사이를 잇는 각호와 함께 쓴다(GEOMETRY_VALIDATION.md).
  // 각호가 없는 각 글자에 대해, 글자가 놓인 꼭짓점의 두 변 사이에 각호를 그린다.
  function decorateAngles(svg) {
    const texts = [...svg.querySelectorAll('text')].filter(t => /\d\s*°/.test(t.textContent) && t.textContent.trim().length <= 8);
    if (!texts.length) return 0;
    const segs = segmentsOf(svg).filter(([a, b, el]) => Math.hypot(b.x - a.x, b.y - a.y) >= 12 && !isDashed(el));
    // 곡선 표시(각호)의 위치: path는 하위 경로마다 시작점과 끝점의 가운데, 원은 중심.
    const curved = [];
    const toUser = (el, x, y) => { const m = el.getCTM && el.getCTM(), root = svg.getCTM && svg.getCTM(); if (!m || !root) return { x, y }; const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return pt.matrixTransform(m).matrixTransform(root.inverse()); };
    for (const el of svg.querySelectorAll('path,circle,ellipse')) {
      const tag = el.tagName.toLowerCase();
      if (isDashed(el) || el.classList.contains('dimension-arc')) continue;
      if (tag !== 'path') { const p = toUser(el, +el.getAttribute('cx') || 0, +el.getAttribute('cy') || 0); const rr = +(el.getAttribute('r') || el.getAttribute('rx')) || 0; curved.push({ x: p.x - 0.5, y: p.y - 0.5, width: 1, height: 1, size: rr * 2 }); continue; }
      const d = el.getAttribute('d') || '';
      if (!/[AaQqCcSsTt]/.test(d)) continue;
      for (const sub of d.split(/(?=[Mm])/)) {
        if (!/[AaQqCcSsTt]/.test(sub)) continue;
        const nums = (sub.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
        if (nums.length < 4) continue;
        const s0 = toUser(el, nums[0], nums[1]), s1 = toUser(el, nums[nums.length - 2], nums[nums.length - 1]);
        const mx = (s0.x + s1.x) / 2, my = (s0.y + s1.y) / 2;
        curved.push({ x: mx - 0.5, y: my - 0.5, width: 1, height: 1, size: Math.hypot(s1.x - s0.x, s1.y - s0.y) });
      }
    }
    // 이미 각호를 쓰는 그림은 원래 설계를 따른다. 각호가 하나도 없는 그림에만 각호를 더한다.
    const key = p => `${Math.round(p.x)},${Math.round(p.y)}`;
    const vertices = new Map();
    const add = (p, q) => { const k = key(p); if (!vertices.has(k)) vertices.set(k, { p, dirs: [] }); vertices.get(k).dirs.push(Math.atan2(q.y - p.y, q.x - p.x)); };
    for (const [a, b] of segs) { add(a, b); add(b, a); }
    // 다른 선분의 중간을 지나는 꼭짓점(T자, 선 위의 점)도 두 방향을 갖는다.
    for (const v of vertices.values()) for (const [a, b] of segs) {
      const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
      const t = ((v.p.x - a.x) * vx + (v.p.y - a.y) * vy) / L2;
      if (t <= 0.02 || t >= 0.98) continue;
      if (Math.abs((v.p.x - a.x) * vy - (v.p.y - a.y) * vx) / Math.sqrt(L2) > 1.2) continue;
      v.dirs.push(Math.atan2(vy, vx), Math.atan2(-vy, -vx));
    }
    // 두 선분이 서로 가로지르는 교차점(X자)은 네 방향을 갖는 꼭짓점이다.
    for (let i = 0; i < segs.length; i += 1) for (let j = i + 1; j < segs.length; j += 1) {
      const [a, b] = segs[i], [p, q] = segs[j];
      const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: q.x - p.x, y: q.y - p.y };
      const den = r.x * s.y - r.y * s.x;
      if (Math.abs(den) < 1e-6) continue;
      const t = ((p.x - a.x) * s.y - (p.y - a.y) * s.x) / den, u = ((p.x - a.x) * r.y - (p.y - a.y) * r.x) / den;
      if (t <= 0.03 || t >= 0.97 || u <= 0.03 || u >= 0.97) continue;
      const x = { x: a.x + t * r.x, y: a.y + t * r.y };
      const k = key(x);
      if (!vertices.has(k)) vertices.set(k, { p: x, dirs: [] });
      vertices.get(k).dirs.push(Math.atan2(r.y, r.x), Math.atan2(-r.y, -r.x), Math.atan2(s.y, s.x), Math.atan2(-s.y, -s.x));
    }
    let added = 0;
    for (const text of texts) {
      let tb; try { tb = boxOf(text, svg); } catch (e) { continue; }
      if (!tb.width) continue;
      const c = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 };
      const tol = Math.max(16, tb.height * 2);
      const deg = parseFloat(text.textContent);
      let best = null;
      for (const v of vertices.values()) {
        if (v.dirs.length < 2) continue;
        const dist = Math.hypot(c.x - v.p.x, c.y - v.p.y);
        if (dist > 45 || dist < 4) continue;
        const toLabel = Math.atan2(c.y - v.p.y, c.x - v.p.x);
        const dirs = [...new Set(v.dirs.map(d => Math.round(d * 1000) / 1000))].sort((x, y) => x - y);
        for (let i = 0; i < dirs.length; i += 1) {
          const from = dirs[i], to = i + 1 < dirs.length ? dirs[i + 1] : dirs[0] + 2 * Math.PI;
          const span = to - from;
          let rel = toLabel - from; while (rel < 0) rel += 2 * Math.PI; while (rel >= 2 * Math.PI) rel -= 2 * Math.PI;
          if (rel <= 0 || rel >= span || span >= Math.PI * 0.999) continue;
          const spanDeg = span * 180 / Math.PI;
          const fit = Number.isFinite(deg) ? Math.abs(spanDeg - deg) : 0;
          // 그림 각도와 표시 각도가 많이 다르면(축척 없는 그림) 거리 우선
          const score = dist + Math.min(fit, 40) * 0.6;
          if (!best || score < best.score) best = { score, v, from, to, dist };
        }
      }
      if (!best) continue;
      // 같은 꼭짓점의 같은 두 변 사이에 이미 각호(곡선)가 있으면 건드리지 않는다.
      const span = best.to - best.from;
      const hasArc = curved.some(bx => {
        const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
        const d = Math.hypot(cx - best.v.p.x, cy - best.v.p.y);
        if (d > Math.max(best.dist * 1.3, 30)) return false;
        if (d < 2) return (bx.size || 0) < Math.max(best.dist * 2.6, 60);
        // 같은 꼭짓점에 이미 각호가 있으면 글자는 그 호의 것으로 본다(다른 각에 잘못 그리지 않도록).
        return true;
      });
      if (hasArc) continue;
      // 기존 각호가 고른 꼭짓점보다 글자에 더 가까우면 그 글자는 기존 호의 것이다.
      if (curved.some(bx => Math.hypot(bx.x + bx.width / 2 - c.x, bx.y + bx.height / 2 - c.y) < best.dist * 1.05)) continue;
      const r = Math.max(8, Math.min(22, best.dist * 0.55));
      const p1 = { x: best.v.p.x + r * Math.cos(best.from), y: best.v.p.y + r * Math.sin(best.from) };
      const p2 = { x: best.v.p.x + r * Math.cos(best.to), y: best.v.p.y + r * Math.sin(best.to) };
      const path = svg.ownerDocument.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
      path.setAttribute('style', 'fill:none;stroke:#191511;stroke-width:1.2px');
      path.setAttribute('class', 'angle-arc');
      path.setAttribute('data-angle-for', text.textContent.trim());
      svg.appendChild(path);
      added += 1;
    }
    return added;
  }

  function transformHtml(html) {
    if (typeof document === 'undefined' || !html || !/<svg[\s>]/.test(html) || !(LENGTH.test(html) || /°/.test(html))) return html;
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-10000px;top:0;width:520px;visibility:hidden';
    host.className = 'question-item';
    host.innerHTML = html;
    document.body.appendChild(host);
    let changed = 0;
    try { for (const svg of host.querySelectorAll('svg')) changed += decorate(svg) + decorateAngles(svg); } finally { host.remove(); }
    return changed ? host.innerHTML : html;
  }

  function install(target) {
    const api = target?.HSE_GENERATORS;
    if (!api || typeof api.generate !== 'function' || typeof document === 'undefined') return false;
    if (api.__figureDimensionArcsInstalled) return true;
    const previous = api.generate.bind(api);
    api.generate = (type, ...rest) => {
      const q = previous(type, ...rest);
      if (!q || !type || !SCOPE.test(String(type.id || '')) || !document.body || target.HSE_FIGURE_DIMENSION_ARCS_DISABLED) return q;
      const out = { ...q };
      for (const key of ['prompt', 'answerVisual']) if (typeof out[key] === 'string') out[key] = transformHtml(out[key]);
      return out;
    };
    Object.defineProperty(api, '__figureDimensionArcsInstalled', { value: true });
    return true;
  }
  return Object.freeze({ install, transformHtml, decorate, segmentsOf });
});
