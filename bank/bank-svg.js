/*!
 * GFIELD BULL BANK - bank-svg.js
 * Shared inline-SVG drawing helpers: rectangular grids, grid symbols,
 * isometric cube stacks, dot-grid road networks.
 * No bundler: registers on window.BANK_SVG
 */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function svgWrap(w, h, inner, extraAttr) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
      '" xmlns="http://www.w3.org/2000/svg" ' + (extraAttr || '') + '>' + inner + '</svg>';
  }

  // -----------------------------------------------------------------
  // 1) 사각 격자 (cols x rows 칸) - rect-count 등에 사용
  //    origin(ox,oy)부터 cell 크기 cs 로 (cols+1) x (rows+1) 교차점 격자
  // -----------------------------------------------------------------
  function drawRectGrid(cols, rows, cs, opts) {
    opts = opts || {};
    var ox = opts.ox != null ? opts.ox : 10;
    var oy = opts.oy != null ? opts.oy : 10;
    var stroke = opts.stroke || '#2b2b2b';
    var sw = opts.strokeWidth || 2;
    var w = cols * cs + ox * 2;
    var h = rows * cs + oy * 2;
    var lines = [];
    for (var r = 0; r <= rows; r++) {
      var y = oy + r * cs;
      lines.push('<line x1="' + ox + '" y1="' + y + '" x2="' + (ox + cols * cs) + '" y2="' + y + '" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round"/>');
    }
    for (var c = 0; c <= cols; c++) {
      var x = ox + c * cs;
      lines.push('<line x1="' + x + '" y1="' + oy + '" x2="' + x + '" y2="' + (oy + rows * cs) + '" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round"/>');
    }
    return { inner: lines.join(''), w: w, h: h, ox: ox, oy: oy, cs: cs };
  }

  // 격자 "칸" 중앙(col,row 0-indexed, cols x rows 개의 칸)에 기호 배치
  // symbol: 'dot' | 'star' | 'x'
  function gridCellSymbol(grid, col, row, symbol, opts) {
    opts = opts || {};
    var cx = grid.ox + col * grid.cs + grid.cs / 2;
    var cy = grid.oy + row * grid.cs + grid.cs / 2;
    var color = opts.color || '#e8590c';
    var scale = (opts.size || 0.34) * grid.cs;
    if (symbol === 'star') {
      return drawStar(cx, cy, scale, color);
    } else if (symbol === 'x') {
      var d = scale * 0.7;
      return '<line x1="' + (cx - d) + '" y1="' + (cy - d) + '" x2="' + (cx + d) + '" y2="' + (cy + d) + '" stroke="' + color + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="' + (cx - d) + '" y1="' + (cy + d) + '" x2="' + (cx + d) + '" y2="' + (cy - d) + '" stroke="' + color + '" stroke-width="4" stroke-linecap="round"/>';
    }
    // default dot
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + scale + '" fill="' + color + '"/>';
  }

  function drawStar(cx, cy, r, color) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 === 0 ? r : r * 0.42;
      pts.push((cx + rad * Math.cos(ang)).toFixed(1) + ',' + (cy + rad * Math.sin(ang)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + color + '"/>';
  }

  // -----------------------------------------------------------------
  // 2) 정삼각형 격자 (변 길이 n인 큰 정삼각형을 n^2개 소삼각형으로 분할)
  //    위쪽 꼭짓점 기준, row 0..n-1, 각 row에 (2*row+1)개의 소삼각형
  // -----------------------------------------------------------------
  function drawTriGrid(n, cs, opts) {
    opts = opts || {};
    var ox = opts.ox != null ? opts.ox : 10;
    var oy = opts.oy != null ? opts.oy : 10;
    var stroke = opts.stroke || '#2b2b2b';
    var sw = opts.strokeWidth || 2;
    var h = cs * Math.sqrt(3) / 2; // 소삼각형 높이
    var totalW = n * cs;
    var totalH = n * h;
    var lines = [];
    // 세 방향의 격자선을 그린다: 수평선(row 경계), 좌상->우하 대각선, 우상->좌하 대각선
    // 꼭짓점 좌표 함수: apex는 (ox+totalW/2, oy)
    function pt(row, col) {
      // row: 0(top) .. n (bottom), col: 0..row (좌측부터)
      var y = oy + row * h;
      var x = ox + totalW / 2 - row * (cs / 2) + col * cs;
      return [x, y];
    }
    for (var row = 0; row <= n; row++) {
      var a = pt(row, 0), b = pt(row, row);
      lines.push('<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>');
    }
    // 좌하향 대각선 (좌상 -> 우하, "/" 반대인 "\" 방향): apex에서 좌변 따라
    for (var k = 0; k <= n; k++) {
      var a2 = pt(k, 0), b2 = pt(n, n - k);
      lines.push('<line x1="' + a2[0].toFixed(1) + '" y1="' + a2[1].toFixed(1) + '" x2="' + b2[0].toFixed(1) + '" y2="' + b2[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>');
    }
    for (var k2 = 0; k2 <= n; k2++) {
      var a3 = pt(k2, k2), b3 = pt(n, k2);
      lines.push('<line x1="' + a3[0].toFixed(1) + '" y1="' + a3[1].toFixed(1) + '" x2="' + b3[0].toFixed(1) + '" y2="' + b3[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>');
    }
    return { inner: lines.join(''), w: totalW + ox * 2, h: totalH + oy * 2, ox: ox, oy: oy, cs: cs, triH: h, pt: pt };
  }

  // -----------------------------------------------------------------
  // 3) 등각투상(isometric) 쌓기나무
  //    heights: 2차원 배열 heights[bx][by] = 그 위치에 쌓인 정육면체 개수
  //    colorMap(bx,by,z) 옵션으로 각 층별 색을 다르게 줄 수 있음
  // -----------------------------------------------------------------
  function drawIsoCubes(heights, opts) {
    opts = opts || {};
    var unit = opts.unit || 30;
    var nx = heights.length;
    var ny = heights[0] ? heights[0].length : 0;

    function project(bx, by, bz) {
      // 표준 등각(2:1) 투영
      var x = (bx - by) * unit;
      var y = (bx + by) * unit / 2 - bz * unit;
      return [x, y];
    }

    // 캔버스 크기 추정
    var maxH = 0;
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) maxH = Math.max(maxH, heights[i][j] || 0);
    var originX = ny * unit + unit;
    var originY = unit * 1.5;
    var totalW = (nx + ny) * unit + unit * 2;
    var totalH = (nx + ny) * unit / 2 + (maxH + 1) * unit + unit * 2;

    function P(bx, by, bz) {
      var p = project(bx, by, bz);
      return [p[0] + originX, p[1] + originY + (nx + ny) * unit / 4];
    }

    var topColor = opts.topColor || '#ffe08a';
    var leftColor = opts.leftColor || '#e8590c';
    var rightColor = opts.rightColor || '#f08c3d';

    var cubes = [];
    // 그리기 순서: 뒤에서 앞으로 (bx+by 작은 것부터), 아래층부터
    var order = [];
    for (var x = 0; x < nx; x++) {
      for (var y = 0; y < ny; y++) {
        var hgt = heights[x][y] || 0;
        for (var z = 0; z < hgt; z++) {
          order.push([x, y, z]);
        }
      }
    }
    order.sort(function (a, b) {
      var da = (a[0] + a[1]) * 100 - a[2];
      var db = (b[0] + b[1]) * 100 - b[2];
      return da - db;
    });

    order.forEach(function (c) {
      var bx = c[0], by = c[1], bz = c[2];
      var top = [P(bx, by, bz + 1), P(bx + 1, by, bz + 1), P(bx + 1, by + 1, bz + 1), P(bx, by + 1, bz + 1)];
      var left = [P(bx, by + 1, bz + 1), P(bx, by + 1, bz), P(bx + 1, by + 1, bz), P(bx + 1, by + 1, bz + 1)];
      var right = [P(bx + 1, by, bz + 1), P(bx + 1, by, bz), P(bx + 1, by + 1, bz), P(bx + 1, by + 1, bz + 1)];
      var tCol = (typeof opts.colorFn === 'function' && opts.colorFn(bx, by, bz, 'top')) || topColor;
      var lCol = (typeof opts.colorFn === 'function' && opts.colorFn(bx, by, bz, 'left')) || leftColor;
      var rCol = (typeof opts.colorFn === 'function' && opts.colorFn(bx, by, bz, 'right')) || rightColor;
      function poly(pts, fill) {
        return '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="' + fill + '" stroke="#5a3200" stroke-width="1.2" stroke-linejoin="round"/>';
      }
      cubes.push(poly(left, lCol));
      cubes.push(poly(right, rCol));
      cubes.push(poly(top, tCol));
    });

    return { inner: cubes.join(''), w: totalW, h: totalH };
  }

  // -----------------------------------------------------------------
  // 4) 점격자 + 도로망(경로) 그리기
  //    cols x rows 교차점 (0..cols, 0..rows), blocked: Set of "x,y" 막힌 교차점
  //    pathPts: 강조 표시할 경로(선택)
  // -----------------------------------------------------------------
  function drawRoadNetwork(cols, rows, cs, opts) {
    opts = opts || {};
    var ox = opts.ox != null ? opts.ox : 20;
    var oy = opts.oy != null ? opts.oy : 20;
    var blocked = opts.blocked || {};
    var parts = [];
    function nodeXY(x, y) { return [ox + x * cs, oy + y * cs]; }

    // 도로 (가로/세로 선분) - 막힌 교차점에 인접한 변은 점선 + 표시
    for (var y = 0; y <= rows; y++) {
      for (var x = 0; x < cols; x++) {
        var a = nodeXY(x, y), b = nodeXY(x + 1, y);
        var blockedEdge = blocked[x + ',' + y] || blocked[(x + 1) + ',' + y];
        parts.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (blockedEdge ? '#c9c9c9' : '#495057') + '" stroke-width="3" stroke-linecap="round"/>');
      }
    }
    for (var x2 = 0; x2 <= cols; x2++) {
      for (var y2 = 0; y2 < rows; y2++) {
        var a2 = nodeXY(x2, y2), b2 = nodeXY(x2, y2 + 1);
        var blockedEdge2 = blocked[x2 + ',' + y2] || blocked[x2 + ',' + (y2 + 1)];
        parts.push('<line x1="' + a2[0] + '" y1="' + a2[1] + '" x2="' + b2[0] + '" y2="' + b2[1] + '" stroke="' + (blockedEdge2 ? '#c9c9c9' : '#495057') + '" stroke-width="3" stroke-linecap="round"/>');
      }
    }
    // 교차점
    for (var yy = 0; yy <= rows; yy++) {
      for (var xx = 0; xx <= cols; xx++) {
        var p = nodeXY(xx, yy);
        var isBlocked = blocked[xx + ',' + yy];
        if (isBlocked) {
          parts.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#4dabf7" stroke="#1864ab" stroke-width="1.5"/>');
        } else {
          parts.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#495057"/>');
        }
      }
    }
    // 출발/도착 표시
    if (opts.start) {
      var sp = nodeXY(opts.start[0], opts.start[1]);
      parts.push('<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="9" fill="#40c057"/>');
      parts.push('<text x="' + sp[0] + '" y="' + (sp[1] - 14) + '" font-size="16" text-anchor="middle" fill="#2b8a3e" font-weight="bold">출발</text>');
    }
    if (opts.end) {
      var ep = nodeXY(opts.end[0], opts.end[1]);
      parts.push('<circle cx="' + ep[0] + '" cy="' + ep[1] + '" r="9" fill="#e8590c"/>');
      parts.push('<text x="' + ep[0] + '" y="' + (ep[1] - 14) + '" font-size="16" text-anchor="middle" fill="#c2410c" font-weight="bold">도착</text>');
    }
    if (opts.pondLabel) {
      Object.keys(blocked).forEach(function (k) {
        var xy = k.split(',').map(Number);
        var p = nodeXY(xy[0], xy[1]);
        parts.push('<text x="' + p[0] + '" y="' + (p[1] + 24) + '" font-size="11" text-anchor="middle" fill="#1864ab">연못</text>');
      });
    }

    var w = cols * cs + ox * 2;
    var h = rows * cs + oy * 2;
    return { inner: parts.join(''), w: w, h: h };
  }

  global.BANK_SVG = {
    esc: esc,
    svgWrap: svgWrap,
    drawRectGrid: drawRectGrid,
    gridCellSymbol: gridCellSymbol,
    drawStar: drawStar,
    drawTriGrid: drawTriGrid,
    drawIsoCubes: drawIsoCubes,
    drawRoadNetwork: drawRoadNetwork
  };
})(typeof window !== 'undefined' ? window : globalThis);
