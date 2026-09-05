/*!
 * GFIELD BULL BANK - bank-raster.js
 * Exact mathematical diagrams rendered directly with Canvas 2D.
 * Public question figures are PNG data URLs; no SVG source is produced.
 */
(function (global) {
  'use strict';

  var DEFAULT_SCALE = 2;
  var FONT = '"Noto Sans KR", "Malgun Gothic", sans-serif';

  function surface(width, height, opts) {
    opts = opts || {};
    if (!global.document || typeof global.document.createElement !== 'function') {
      throw new Error('BANK_RASTER requires a browser Canvas implementation');
    }
    var scale = opts.scale || DEFAULT_SCALE;
    var canvas = global.document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is unavailable');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = opts.background || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return { canvas: canvas, ctx: ctx, width: width, height: height, scale: scale };
  }

  function finish(s, description) {
    return {
      kind: 'raster',
      mimeType: 'image/png',
      src: s.canvas.toDataURL('image/png'),
      width: s.canvas.width,
      height: s.canvas.height,
      displayWidth: s.width,
      displayHeight: s.height,
      renderer: 'canvas-2d',
      description: description || ''
    };
  }

  function line(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color || '#263238';
    ctx.lineWidth = width || 2;
    ctx.stroke();
  }

  function polygon(ctx, points, fill, stroke, width) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width || 1.4; ctx.stroke(); }
  }

  function label(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.font = (opts.weight || 700) + ' ' + (opts.size || 14) + 'px ' + FONT;
    ctx.fillStyle = opts.color || '#263238';
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function star(ctx, cx, cy, radius, color) {
    var points = [];
    for (var i = 0; i < 10; i++) {
      var angle = -Math.PI / 2 + i * Math.PI / 5;
      var r = i % 2 === 0 ? radius : radius * 0.43;
      points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    polygon(ctx, points, color || '#1864ab', null);
  }

  function roundedRect(ctx, x, y, width, height, radius, fill, stroke, lineWidth) {
    var r = Math.min(radius || 0, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 1.5; ctx.stroke(); }
  }

  /* A shared print-safe visual for text/rule questions.  Every condition is
   * placed in its own high-contrast row so the diagram supports, rather than
   * hides, the exact information used to obtain the one answer. */
  function drawConditionCard(title, rows, opts) {
    opts = opts || {};
    rows = rows || [];
    var width = opts.width || 620;
    var pad = 24;
    var titleHeight = 58;
    var rowHeight = opts.rowHeight || 52;
    var footerHeight = opts.footer ? 48 : 20;
    var height = pad + titleHeight + rows.length * rowHeight + footerHeight + pad;
    var s = surface(width, height);
    var ctx = s.ctx;
    roundedRect(ctx, 8, 8, width - 16, height - 16, 16, '#ffffff', '#343a40', 2.2);
    roundedRect(ctx, pad, pad, width - pad * 2, titleHeight - 8, 10, '#fff4e6', '#f08c00', 1.5);
    label(ctx, String(title || '조건'), width / 2, pad + (titleHeight - 8) / 2, {
      size: opts.titleSize || 22, color: '#7c3d00'
    });

    var tableX = pad;
    var tableY = pad + titleHeight;
    var tableW = width - pad * 2;
    var labelW = Math.round(tableW * (opts.labelRatio || 0.34));
    rows.forEach(function (row, index) {
      row = row || {};
      var y = tableY + index * rowHeight;
      var accent = row.accent === true;
      ctx.fillStyle = index % 2 ? '#f8f9fa' : '#ffffff';
      ctx.fillRect(tableX, y, tableW, rowHeight);
      ctx.fillStyle = accent ? '#d0ebff' : '#e9ecef';
      ctx.fillRect(tableX, y, labelW, rowHeight);
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tableX, y, tableW, rowHeight);
      line(ctx, tableX + labelW, y, tableX + labelW, y + rowHeight, '#adb5bd', 1.2);
      label(ctx, String(row.label || ''), tableX + 16, y + rowHeight / 2, {
        size: row.labelSize || 16, weight: 700, align: 'left', color: '#343a40'
      });
      label(ctx, String(row.value == null ? '' : row.value), tableX + labelW + 18, y + rowHeight / 2, {
        size: row.valueSize || 18, weight: accent ? 800 : 700, align: 'left', color: accent ? '#0b5c91' : '#212529'
      });
    });

    if (opts.footer) {
      label(ctx, String(opts.footer), width / 2, tableY + rows.length * rowHeight + 27, {
        size: opts.footerSize || 14, weight: 600, color: '#5f3dc4'
      });
    }
    return finish(s, opts.description || '풀이에 필요한 조건을 행별로 나타낸 표');
  }

  function drawRectGrid(cols, rows, opts) {
    opts = opts || {};
    var cs = opts.cellSize || 52;
    var pad = opts.padding || 24;
    var s = surface(cols * cs + pad * 2, rows * cs + pad * 2);
    var ctx = s.ctx;
    for (var r = 0; r <= rows; r++) {
      line(ctx, pad, pad + r * cs, pad + cols * cs, pad + r * cs, '#263238', 2.2);
    }
    for (var c = 0; c <= cols; c++) {
      line(ctx, pad + c * cs, pad, pad + c * cs, pad + rows * cs, '#263238', 2.2);
    }
    (opts.include || []).forEach(function (p) {
      ctx.beginPath();
      ctx.arc(pad + (p[0] + 0.5) * cs, pad + (p[1] + 0.5) * cs, cs * 0.17, 0, Math.PI * 2);
      ctx.fillStyle = '#e8590c';
      ctx.fill();
    });
    (opts.exclude || []).forEach(function (p) {
      star(ctx, pad + (p[0] + 0.5) * cs, pad + (p[1] + 0.5) * cs, cs * 0.22, '#1864ab');
    });
    return finish(s, cols + '×' + rows + ' rectangular grid with exact cell markers');
  }

  function drawTriGrid(n, opts) {
    opts = opts || {};
    var cs = opts.cellSize || 70;
    var pad = opts.padding || 26;
    var triH = cs * Math.sqrt(3) / 2;
    var s = surface(n * cs + pad * 2, n * triH + pad * 2);
    var ctx = s.ctx;
    function point(row, col) {
      return [pad + n * cs / 2 - row * cs / 2 + col * cs, pad + row * triH];
    }
    for (var row = 0; row <= n; row++) {
      var a = point(row, 0), b = point(row, row);
      line(ctx, a[0], a[1], b[0], b[1], '#263238', 2.2);
    }
    for (var k = 0; k <= n; k++) {
      var a2 = point(k, 0), b2 = point(n, n - k);
      line(ctx, a2[0], a2[1], b2[0], b2[1], '#263238', 2.2);
      var a3 = point(k, k), b3 = point(n, k);
      line(ctx, a3[0], a3[1], b3[0], b3[1], '#263238', 2.2);
    }
    return finish(s, 'Equilateral triangle subdivided into an exact triangular grid');
  }

  function drawRoadNetwork(cols, rows, opts) {
    opts = opts || {};
    var cs = opts.cellSize || 58;
    var padX = opts.paddingX || 54;
    var padY = opts.paddingY || 46;
    var blocked = opts.blocked || {};
    var s = surface(cols * cs + padX * 2, rows * cs + padY * 2);
    var ctx = s.ctx;
    function xy(x, y) { return [padX + x * cs, padY + y * cs]; }
    for (var y = 0; y <= rows; y++) {
      for (var x = 0; x < cols; x++) {
        var a = xy(x, y), b = xy(x + 1, y);
        line(ctx, a[0], a[1], b[0], b[1], '#5f6970', 3);
      }
    }
    for (var x2 = 0; x2 <= cols; x2++) {
      for (var y2 = 0; y2 < rows; y2++) {
        var a2 = xy(x2, y2), b2 = xy(x2, y2 + 1);
        line(ctx, a2[0], a2[1], b2[0], b2[1], '#5f6970', 3);
      }
    }
    for (var yy = 0; yy <= rows; yy++) {
      for (var xx = 0; xx <= cols; xx++) {
        var p = xy(xx, yy);
        ctx.beginPath();
        ctx.arc(p[0], p[1], blocked[xx + ',' + yy] ? 10 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = blocked[xx + ',' + yy] ? '#74c0fc' : '#37474f';
        ctx.fill();
        if (blocked[xx + ',' + yy]) {
          ctx.strokeStyle = '#1864ab'; ctx.lineWidth = 2; ctx.stroke();
          line(ctx, p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5, '#1864ab', 2);
          line(ctx, p[0] - 5, p[1] + 5, p[0] + 5, p[1] - 5, '#1864ab', 2);
          label(ctx, '통행 금지', p[0], p[1] + 20, { size: 10, color: '#1864ab' });
        }
      }
    }
    var start = xy(0, 0), end = xy(cols, rows);
    ctx.beginPath(); ctx.arc(start[0], start[1], 9, 0, Math.PI * 2); ctx.fillStyle = '#2f9e44'; ctx.fill();
    ctx.beginPath(); ctx.arc(end[0], end[1], 9, 0, Math.PI * 2); ctx.fillStyle = '#e8590c'; ctx.fill();
    label(ctx, '출발', start[0], start[1] - 19, { size: 13, color: '#2b8a3e' });
    label(ctx, '도착', end[0], end[1] - 19, { size: 13, color: '#c2410c' });
    return finish(s, 'Right-and-down road network with blocked intersections marked explicitly');
  }

  function drawIsoStackWithHeightMap(heights, opts) {
    opts = opts || {};
    var unit = opts.unit || 28;
    var nx = heights.length;
    var ny = heights[0] ? heights[0].length : 0;
    var maxH = 0;
    for (var x = 0; x < nx; x++) for (var y = 0; y < ny; y++) maxH = Math.max(maxH, heights[x][y] || 0);
    var isoWidth = (nx + ny) * unit + 80;
    var mapCell = 34;
    var mapWidth = ny * mapCell + 44;
    var totalWidth = isoWidth + mapWidth + 28;
    var totalHeight = Math.max((nx + ny) * unit / 2 + maxH * unit + 70, nx * mapCell + 86);
    var s = surface(totalWidth, totalHeight);
    var ctx = s.ctx;
    var originX = ny * unit + 36;
    var originY = maxH * unit + 28;
    function P(bx, by, bz) {
      return [originX + (bx - by) * unit, originY + (bx + by) * unit / 2 - bz * unit];
    }
    var cubes = [];
    for (var bx = 0; bx < nx; bx++) {
      for (var by = 0; by < ny; by++) {
        for (var bz = 0; bz < (heights[bx][by] || 0); bz++) cubes.push([bx, by, bz]);
      }
    }
    cubes.sort(function (a, b) {
      var depth = (a[0] + a[1]) - (b[0] + b[1]);
      if (depth) return depth;
      return a[2] - b[2];
    });
    cubes.forEach(function (c) {
      var bx = c[0], by = c[1], bz = c[2];
      var top = [P(bx, by, bz + 1), P(bx + 1, by, bz + 1), P(bx + 1, by + 1, bz + 1), P(bx, by + 1, bz + 1)];
      var left = [P(bx, by + 1, bz + 1), P(bx, by + 1, bz), P(bx + 1, by + 1, bz), P(bx + 1, by + 1, bz + 1)];
      var right = [P(bx + 1, by, bz + 1), P(bx + 1, by, bz), P(bx + 1, by + 1, bz), P(bx + 1, by + 1, bz + 1)];
      polygon(ctx, left, '#e8590c', '#6b3b13', 1.3);
      polygon(ctx, right, '#f59f5b', '#6b3b13', 1.3);
      polygon(ctx, top, '#ffe8a3', '#6b3b13', 1.3);
    });
    label(ctx, '쌓은 모양', isoWidth / 2, 17, { size: 14, color: '#495057' });
    var mx = isoWidth + 20, my = 48;
    label(ctx, '위에서 본 기둥 높이', mx + ny * mapCell / 2, 20, { size: 14, color: '#495057' });
    for (var rx = 0; rx < nx; rx++) {
      for (var ry = 0; ry < ny; ry++) {
        ctx.fillStyle = heights[rx][ry] ? '#fff3bf' : '#f1f3f5';
        ctx.fillRect(mx + ry * mapCell, my + rx * mapCell, mapCell, mapCell);
        ctx.strokeStyle = '#495057'; ctx.lineWidth = 1.5; ctx.strokeRect(mx + ry * mapCell, my + rx * mapCell, mapCell, mapCell);
        label(ctx, String(heights[rx][ry]), mx + (ry + 0.5) * mapCell, my + (rx + 0.5) * mapCell, { size: 16, color: '#263238' });
      }
    }
    label(ctx, '숫자는 그 자리에 쌓인 개수', mx + ny * mapCell / 2, my + nx * mapCell + 22, { size: 10, weight: 500, color: '#6c757d' });
    return finish(s, 'Isometric cube stack accompanied by an exact top-view height table');
  }

  function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function drawPaintedCube(n) {
    var s = surface(330, 255);
    var ctx = s.ctx;
    var A = [165, 24], B = [285, 84], C = [165, 144], D = [45, 84];
    var Bb = [285, 188], Cb = [165, 248], Db = [45, 188];
    polygon(ctx, [D, C, Cb, Db], '#d9480f', '#6b2f13', 1.8);
    polygon(ctx, [B, C, Cb, Bb], '#f76707', '#6b2f13', 1.8);
    polygon(ctx, [A, B, C, D], '#ffb3a7', '#6b2f13', 1.8);
    for (var i = 1; i < n; i++) {
      var t = i / n;
      var ab = lerp(A, B, t), dc = lerp(D, C, t);
      var ad = lerp(A, D, t), bc = lerp(B, C, t);
      line(ctx, ab[0], ab[1], dc[0], dc[1], '#7a3e25', 1);
      line(ctx, ad[0], ad[1], bc[0], bc[1], '#7a3e25', 1);
      var dd = lerp(D, Db, t), cc = lerp(C, Cb, t), bb = lerp(B, Bb, t);
      line(ctx, dd[0], dd[1], cc[0], cc[1], '#7a3e25', 1);
      line(ctx, bb[0], bb[1], cc[0], cc[1], '#7a3e25', 1);
      var dcTop = lerp(D, C, t), dcBottom = lerp(Db, Cb, t);
      var bcTop = lerp(B, C, t), bcBottom = lerp(Bb, Cb, t);
      line(ctx, dcTop[0], dcTop[1], dcBottom[0], dcBottom[1], '#7a3e25', 1);
      line(ctx, bcTop[0], bcTop[1], bcBottom[0], bcBottom[1], '#7a3e25', 1);
    }
    label(ctx, '겉면 전체를 칠한 ' + n + '×' + n + '×' + n + ' 정육면체', 165, 11, { size: 12, color: '#6b2f13' });
    return finish(s, 'Subdivided painted cube with all visible unit boundaries');
  }

  function drawViewPanel(ctx, title, values, x, y, cell, maxH, kind) {
    label(ctx, title, x + values.length * cell / 2, y - 15, { size: 13, color: '#495057' });
    if (kind === 'top') {
      for (var r = 0; r < values.length; r++) {
        for (var c = 0; c < values[r].length; c++) {
          ctx.fillStyle = values[r][c] ? '#ffd8a8' : '#ffffff';
          ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
          ctx.strokeStyle = '#495057'; ctx.lineWidth = 1.4; ctx.strokeRect(x + c * cell, y + r * cell, cell, cell);
        }
      }
      return;
    }
    for (var col = 0; col < values.length; col++) {
      for (var row = 0; row < maxH; row++) {
        var occupied = maxH - row <= values[col];
        ctx.fillStyle = occupied ? (kind === 'front' ? '#a5d8ff' : '#b2f2bb') : '#ffffff';
        ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
        ctx.strokeStyle = '#495057'; ctx.lineWidth = 1.4; ctx.strokeRect(x + col * cell, y + row * cell, cell, cell);
      }
    }
  }

  function drawOrthographicViews(views) {
    var cell = 34;
    var nx = views.front.length, ny = views.side.length;
    var maxH = Math.max.apply(null, views.front.concat(views.side).concat([1]));
    var gap = 48;
    var topW = ny * cell, frontW = nx * cell, sideW = ny * cell;
    var width = 26 + topW + gap + frontW + gap + sideW + 26;
    var height = 52 + Math.max(nx, maxH) * cell + 28;
    var s = surface(width, height);
    var y = 46, x = 26;
    drawViewPanel(s.ctx, '위에서 본 모양', views.top, x, y, cell, maxH, 'top');
    x += topW + gap;
    drawViewPanel(s.ctx, '앞에서 본 모양', views.front, x, y, cell, maxH, 'front');
    x += frontW + gap;
    drawViewPanel(s.ctx, '옆에서 본 모양', views.side, x, y, cell, maxH, 'side');
    return finish(s, 'Top, front, and side orthographic cube-stack views on exact grids');
  }

  function drawTriangleChain(count, baseLength, sideLength) {
    var shown = Math.min(7, count), step = 62, top = 34, left = 100;
    var base = parseFloat(baseLength), side = parseFloat(sideLength);
    var triangleHeight = step * Math.sqrt(side * side - base * base / 4) / base;
    var bottom = top + triangleHeight;
    var chainRight = left + (shown + 1) * step / 2;
    var s = surface(chainRight + 156, bottom + 42), ctx = s.ctx;
    for (var i = 0; i < shown; i++) {
      var x = left + i * step / 2;
      var baseY = i % 2 === 0 ? top : bottom;
      var apexY = i % 2 === 0 ? bottom : top;
      line(ctx, x, baseY, x + step / 2, apexY, '#263238', 2);
      line(ctx, x + step / 2, apexY, x + step, baseY, '#263238', 2);
      line(ctx, x, baseY, x + step, baseY, '#263238', 2);
    }
    label(ctx, '밑변 ' + baseLength, left + step / 2, 17, { size: 13, color: '#0b5c91' });
    label(ctx, '옆변 ' + sideLength, left - 12, (top + bottom) / 2, { size: 13, align: 'right', color: '#7c3d00' });
    if (count > shown) label(ctx, '…  모두 ' + count + '개', chainRight + 18, (top + bottom) / 2, { size: 15, align: 'left' });
    return finish(s, '합동인 이등변삼각형을 변끼리 이어 붙인 띠 모양');
  }

  function drawDistanceTable(stations, knownDistances) {
    var entries = Object.keys(knownDistances).map(function (key) {
      var pair = key.split(':').map(Number);
      return { pair: stations[pair[0]] + '역 ↔ ' + stations[pair[1]] + '역', value: knownDistances[key] };
    });
    var width = 430, top = 54, rowHeight = 42, s = surface(width, top + entries.length * rowHeight + 18), ctx = s.ctx;
    roundedRect(ctx, 8, 8, width - 16, 38, 9, '#fff4e6', '#f08c00', 1.4);
    label(ctx, '역 사이 거리표', width / 2, 27, { size: 18, color: '#7c3d00' });
    entries.forEach(function (entry, index) {
      var y = top + index * rowHeight;
      ctx.fillStyle = index % 2 ? '#f8f9fa' : '#ffffff'; ctx.fillRect(18, y, width - 36, rowHeight);
      ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 1; ctx.strokeRect(18, y, width - 36, rowHeight);
      line(ctx, 286, y, 286, y + rowHeight, '#adb5bd', 1);
      label(ctx, entry.pair, 34, y + rowHeight / 2, { size: 14, align: 'left' });
      label(ctx, entry.value + ' km', 304, y + rowHeight / 2, { size: 15, align: 'left', color: '#0b5c91' });
    });
    return finish(s, '계산에 필요한 역 세 쌍의 거리를 행별로 나타낸 표');
  }

  function drawRingPattern(multiplier) {
    var s = surface(620, 190), ctx = s.ctx;
    for (var stage = 1; stage <= 4; stage++) {
      var cx = 75 + (stage - 1) * 155, cy = 82, count = stage === 1 ? 1 : multiplier * (stage - 1);
      if (stage === 1) {
        ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#263238'; ctx.stroke();
      } else {
        var shown = Math.min(count, 20);
        for (var i = 0; i < shown; i++) {
          var angle = -Math.PI / 2 + i * Math.PI * 2 / shown;
          ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * 38, cy + Math.sin(angle) * 38, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#263238'; ctx.lineWidth = 1.3; ctx.stroke();
        }
      }
      label(ctx, stage + '번째', cx, 154, { size: 13 });
      label(ctx, count + '개', cx, 174, { size: 12, color: '#0b5c91' });
    }
    return finish(s, '첫 번째부터 네 번째까지 원형으로 늘어나는 구슬 배열');
  }

  function drawNumberPyramid(rows) {
    rows = Math.max(4, Math.min(6, rows || 5));
    var s = surface(560, 240), ctx = s.ctx, value = 1;
    for (var row = 1; row <= rows; row++) {
      var y = 28 + row * 33, startX = 280 - (row - 1) * 27;
      label(ctx, row + '행', 82, y, { size: 13, align: 'right', color: '#0b5c91' });
      for (var col = 0; col < row; col++) label(ctx, String(value++), startX + col * 54, y, { size: 18, weight: 600 });
    }
    label(ctx, '⋮', 280, 226, { size: 22, color: '#868e96' });
    return finish(s, '첫째 행부터 자연수를 행의 수만큼 차례로 놓은 수 피라미드');
  }

  function drawSumGrid(rowSums, columnSums) {
    var cell = 60, left = 52, top = 24, s = surface(390, 300), ctx = s.ctx;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var x = left + c * cell, y = top + r * cell;
      if (r < 3 && c < 3) ctx.fillStyle = '#ffffff';
      else if (r < 3 && c === 3) ctx.fillStyle = '#fff4e6';
      else if (r === 3 && c < 3) ctx.fillStyle = '#e7f5ff';
      else continue;
      ctx.fillRect(x, y, cell, cell); ctx.strokeStyle = '#343a40'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cell, cell);
      if (r < 3 && c === 3) label(ctx, String(rowSums[r]), x + cell / 2, y + cell / 2, { size: 17, color: '#7c3d00' });
      if (r === 3 && c < 3) label(ctx, c === 2 ? '?' : String(columnSums[c]), x + cell / 2, y + cell / 2, { size: 17, color: '#0b5c91' });
    }
    label(ctx, '각 행의 합', left + 4 * cell + 12, top + 90, { size: 12, align: 'left', color: '#7c3d00' });
    label(ctx, '각 열의 합', left + 90, top + 4 * cell + 18, { size: 12, color: '#0b5c91' });
    return finish(s, '3×3 빈 수칸의 행 합과 열 합을 나타낸 ㄱ자 합 표');
  }

  function drawCubeColumn(height) {
    var cellH = 28, x = 105, y = 22, s = surface(220, 44 + height * cellH), ctx = s.ctx;
    for (var i = 0; i < height; i++) {
      var yy = y + i * cellH;
      ctx.fillStyle = i % 2 ? '#f8f9fa' : '#ffffff'; ctx.fillRect(x - 28, yy, 56, cellH);
      ctx.strokeStyle = '#343a40'; ctx.lineWidth = 1.6; ctx.strokeRect(x - 28, yy, 56, cellH);
      line(ctx, x + 28, yy, x + 43, yy - 10, '#343a40', 1.4);
      line(ctx, x + 28, yy + cellH, x + 43, yy + cellH - 10, '#343a40', 1.4);
      line(ctx, x + 43, yy - 10, x + 43, yy + cellH - 10, '#343a40', 1.4);
    }
    line(ctx, x - 28, y, x - 13, y - 10, '#343a40', 1.4);
    line(ctx, x - 13, y - 10, x + 43, y - 10, '#343a40', 1.4);
    return finish(s, '정육면체 쌓기나무 ' + height + '개를 세로로 쌓은 모습');
  }

  function drawDigitCards(digits, copies) {
    var s = surface(360, 150), ctx = s.ctx;
    digits.forEach(function (digit, index) {
      var x = 38 + index * 104;
      roundedRect(ctx, x, 24, 72, 84, 5, '#f1f3f5', '#343a40', 1.6);
      label(ctx, String(digit), x + 36, 66, { size: 34, weight: 600 });
    });
    label(ctx, '각 카드 ' + copies + '장씩', 180, 130, { size: 14, color: '#0b5c91' });
    return finish(s, '서로 다른 숫자 카드 세 종류와 각 카드의 장수');
  }

  function drawCircleRule(examples, target) {
    var s = surface((examples.length + 1) * 170 + 50, 220), ctx = s.ctx;
    function one(item, index, unknown) {
      var cx = 100 + index * 170, cy = 102;
      ctx.beginPath(); ctx.arc(cx, cy, 66, 0, Math.PI * 2); ctx.strokeStyle = '#343a40'; ctx.lineWidth = 1.7; ctx.stroke();
      line(ctx, cx, cy - 66, cx, cy - 4, '#343a40', 1.3);
      line(ctx, cx - 66, cy - 4, cx + 66, cy - 4, '#343a40', 1.3);
      label(ctx, String(item.left), cx - 31, cy - 31, { size: 18 });
      label(ctx, String(item.right), cx + 31, cy - 31, { size: 18 });
      label(ctx, unknown ? '?' : String(item.bottom), cx, cy + 28, { size: unknown ? 25 : 18, color: unknown ? '#e8590c' : '#0b5c91' });
    }
    examples.forEach(function(example,index){one(example,index,false);});
    one(target, examples.length, true);
    return finish(s, '규칙을 확인하는 예시 원 '+examples.length+'개와 물음표가 있는 원 한 개');
  }

  function drawMarkedRectGrid(cols, rows, markers) {
    var cs = 44, pad = 24, s = surface(cols * cs + pad * 2, rows * cs + pad * 2), ctx = s.ctx;
    for (var r = 0; r <= rows; r++) line(ctx, pad, pad + r * cs, pad + cols * cs, pad + r * cs, '#263238', 1.8);
    for (var c = 0; c <= cols; c++) line(ctx, pad + c * cs, pad, pad + c * cs, pad + rows * cs, '#263238', 1.8);
    (markers || []).forEach(function (marker) {
      var cx = pad + (marker.col + 0.5) * cs, cy = pad + (marker.row + 0.5) * cs;
      if (marker.kind === 'triangle') {
        polygon(ctx, [[cx, cy - 11], [cx - 11, cy + 9], [cx + 11, cy + 9]], '#ffffff', '#e8590c', 2.2);
      } else {
        star(ctx, cx, cy, 13, '#1864ab');
      }
    });
    return finish(s, cols + '×' + rows + ' 모눈에 별과 삼각형 위치를 정확히 표시한 그림');
  }

  function drawMagicStar(outerValues, innerLabels) {
    var s = surface(430, 390), ctx = s.ctx, cx = 215, cy = 192;
    var outer = [], inner = [];
    for (var i = 0; i < 5; i++) {
      var oa = -Math.PI / 2 + i * Math.PI * 2 / 5;
      var ia = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
      outer.push([cx + Math.cos(oa) * 154, cy + Math.sin(oa) * 154]);
      var innerRadius = 154 * Math.cos(2 * Math.PI / 5) / Math.cos(Math.PI / 5);
      inner.push([cx + Math.cos(ia) * innerRadius, cy + Math.sin(ia) * innerRadius]);
    }
    for (var lineIndex = 0; lineIndex < 5; lineIndex++) {
      var points = [outer[lineIndex], inner[lineIndex], inner[(lineIndex + 1) % 5], outer[(lineIndex + 2) % 5]];
      for (var p = 0; p < points.length - 1; p++) line(ctx, points[p][0], points[p][1], points[p + 1][0], points[p + 1][1], '#495057', 1.6);
    }
    function node(point, text, fill) {
      ctx.beginPath(); ctx.arc(point[0], point[1], 22, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#343a40'; ctx.lineWidth = 1.5; ctx.stroke();
      label(ctx, String(text), point[0], point[1], { size: 16, color: fill === '#ffffff' ? '#212529' : '#7c3d00' });
    }
    outer.forEach(function (point, index) { node(point, outerValues[index], '#fff4e6'); });
    inner.forEach(function (point, index) { node(point, innerLabels[index], '#ffffff'); });
    return finish(s, '다섯 바깥 수와 다섯 안쪽 빈칸을 네 수씩 잇는 별 모양 수 퍼즐');
  }

  function drawShapeValueGrid(grid, rowSums, columnSums) {
    var symbols = ['◆', '●', '▲', '■'], cell = 47, left = 42, top = 28;
    var s = surface(304, 290), ctx = s.ctx;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var x = left + c * cell, y = top + r * cell;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, cell, cell); ctx.strokeStyle = '#868e96'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cell, cell);
      label(ctx, symbols[grid[r][c]], x + cell / 2, y + cell / 2, { size: 23, color: '#212529' });
    }
    for (var rr = 0; rr < 4; rr++) label(ctx, rr === 3 ? '?' : String(rowSums[rr]), left + 4 * cell + 30, top + rr * cell + cell / 2, { size: 16, color: '#7c3d00' });
    for (var cc = 0; cc < 4; cc++) label(ctx, cc === 3 ? '?' : String(columnSums[cc]), left + cc * cell + cell / 2, top + 4 * cell + 27, { size: 16, color: '#0b5c91' });
    return finish(s, '네 가지 도형이 놓인 4×4 표와 알려진 가로·세로 합');
  }

  function drawFoldTwiceCut(variant) {
    var spec=typeof variant==='object'?variant:{};
    var s = surface(740, 220), ctx = s.ctx;
    var ink = '#343a40', fold = '#868e96', accent = '#e8590c';
    function arrow(x1, y1, x2, y2) {
      line(ctx, x1, y1, x2, y2, accent, 2.4);
      var angle = Math.atan2(y2 - y1, x2 - x1), size = 8;
      polygon(ctx, [[x2, y2], [x2 - Math.cos(angle - .55) * size, y2 - Math.sin(angle - .55) * size], [x2 - Math.cos(angle + .55) * size, y2 - Math.sin(angle + .55) * size]], accent, null);
    }
    function folding(x,y,w,h,horizontal){
      ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
      ctx.save();ctx.setLineDash([5,4]);
      if(horizontal)line(ctx,x,y+h/2,x+w,y+h/2,fold,1.5);
      else line(ctx,x+w/2,y,x+w/2,y+h,fold,1.5);
      ctx.restore();
      if(horizontal){
        var upward=spec.firstFold!=='위→아래';
        arrow(x+w*.52,y+h*(upward?.78:.22),x+w*.52,y+h*(upward?.22:.78));
      }else{
        var rightward=spec.secondFold!=='오른쪽→왼쪽';
        arrow(x+w*(rightward?.2:.8),y+h*.55,x+w*(rightward?.8:.2),y+h*.55);
      }
    }
    label(ctx,'보기: 가로로 반 접고 → 세로로 반 접기',202,20,{size:19,color:ink});
    folding(20,51,92,92,true);arrow(121,97,151,97);folding(164,97,92,46,false);
    label(ctx,'① 보기의 방법 한 번',140,187,{size:18,color:ink});
    arrow(274,97,303,97);
    folding(319,74,68,68,true);arrow(398,108,425,108);folding(440,108,68,34,false);
    label(ctx,'② 같은 방법을 한 번 더',415,187,{size:18,color:ink});
    arrow(523,108,552,108);
    var x=586,y=54,side=96;
    ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(x,y,side,side);
    var pattern=spec.cutPattern||'diagonals';
    if(pattern==='mid-cross'){
      line(ctx,x,y+side/2,x+side,y+side/2,'#111111',4);
      line(ctx,x+side/2,y,x+side/2,y+side,'#111111',4);
    }else{
      line(ctx,x,y,x+side,y+side,'#111111',4);
      if(pattern!=='single-diagonal')line(ctx,x+side,y,x,y+side,'#111111',4);
    }
    label(ctx,'③ 굵은 선대로 자르기',637,187,{size:18,color:ink});
    label(ctx,'접힌 종이 확대',634,34,{size:15,color:fold});
    return finish(s, '가로 반 접기와 세로 반 접기를 한 묶음으로 두 번 반복하는 총 네 번의 접기와 마지막 절단선');
  }

  function drawCubeFaceDiagonalCuts(variant) {
    var options=typeof variant==='object'?variant:{};
    var activeCuts=options.activeCuts||6;
    var s = surface(390, 290), ctx = s.ctx;
    function project(x,y,z){return [195+(x-y)*95,150+(x+y)*55-z*110];}
    var top=[project(0,0,1),project(1,0,1),project(1,1,1),project(0,1,1)];
    var left=[project(0,1,1),project(1,1,1),project(1,1,0),project(0,1,0)];
    var right=[project(1,1,1),project(1,0,1),project(1,0,0),project(1,1,0)];
    [top,right,left].forEach(function(face,index){
      polygon(ctx,face,['#f8f9fa','#eef1f4','#e1e6eb'][index],'#343a40',2);
      [[face[0],face[2]],[face[1],face[3]]].forEach(function(seg,diagonal){
        if(index*2+diagonal<activeCuts)line(ctx,seg[0][0],seg[0][1],seg[1][0],seg[1][1],'#1f3864',2.4);
      });
    });
    label(ctx,'현재까지의 칼질: '+activeCuts+'번',195,18,{size:14,color:'#343a40'});
    label(ctx,'굵은 선에서 마주 보는 면의 같은 대각선까지 자릅니다.',195,278,{size:12,color:'#5f6970'});
    return finish(s, '정육면체에서 현재까지 자른 '+activeCuts+'개 대각 절단평면을 굵은 선으로 표시한 그림');
  }

  global.BANK_RASTER = {
    drawConditionCard: drawConditionCard,
    drawRectGrid: drawRectGrid,
    drawTriGrid: drawTriGrid,
    drawRoadNetwork: drawRoadNetwork,
    drawIsoStackWithHeightMap: drawIsoStackWithHeightMap,
    drawPaintedCube: drawPaintedCube,
    drawOrthographicViews: drawOrthographicViews,
    drawTriangleChain: drawTriangleChain,
    drawDistanceTable: drawDistanceTable,
    drawRingPattern: drawRingPattern,
    drawNumberPyramid: drawNumberPyramid,
    drawSumGrid: drawSumGrid,
    drawCubeColumn: drawCubeColumn,
    drawDigitCards: drawDigitCards,
    drawCircleRule: drawCircleRule,
    drawMarkedRectGrid: drawMarkedRectGrid,
    drawMagicStar: drawMagicStar,
    drawShapeValueGrid: drawShapeValueGrid,
    drawFoldTwiceCut: drawFoldTwiceCut,
    drawCubeFaceDiagonalCuts: drawCubeFaceDiagonalCuts
  };
})(typeof window !== 'undefined' ? window : globalThis);
