/*!
 * GFIELD BULL BANK - gens/g-rect.js
 * 유형: 격자에서 크고 작은 직사각형/정사각형 개수 (조건 포함/제외 변형)
 * 답은 전수 brute-force 계산으로만 산출.
 */
(function (global) {
  'use strict';

  function bruteForceCount(cols, rows, opts) {
    opts = opts || {};
    var squareOnly = !!opts.squareOnly;
    var include = opts.include || []; // [[c,r], ...] 모두 포함해야 하는 칸
    var exclude = opts.exclude || []; // [[c,r], ...] 모두 포함하면 안 되는 칸
    var count = 0;
    var matches = [];
    for (var left = 0; left < cols; left++) {
      for (var right = left + 1; right <= cols; right++) {
        var w = right - left;
        for (var top = 0; top < rows; top++) {
          for (var bottom = top + 1; bottom <= rows; bottom++) {
            var h = bottom - top;
            if (squareOnly && w !== h) continue;
            var ok = true;
            for (var i = 0; i < include.length; i++) {
              var ic = include[i][0], ir = include[i][1];
              if (!(left <= ic && ic < right && top <= ir && ir < bottom)) { ok = false; break; }
            }
            if (ok) {
              for (var j = 0; j < exclude.length; j++) {
                var ec = exclude[j][0], er = exclude[j][1];
                if (left <= ec && ec < right && top <= er && er < bottom) { ok = false; break; }
              }
            }
            if (ok) {
              count++;
              matches.push([left, right, top, bottom]);
            }
          }
        }
      }
    }
    return { count: count, matches: matches };
  }

  function randomCellExcluding(rng, cols, rows, taken) {
    var R = global.BANK_CORE.randint;
    var tries = 0;
    while (tries < 200) {
      var c = R(rng, 0, cols - 1), r = R(rng, 0, rows - 1);
      var dup = taken.some(function (t) { return t[0] === c && t[1] === r; });
      if (!dup) return [c, r];
      tries++;
    }
    return [0, 0];
  }

  function gen(level, rng) {
    var CORE = global.BANK_CORE, SVG = global.BANK_SVG;
    var R = CORE.randint;
    var cols, rows, squareOnly = false, include = [], exclude = [];
    var attempts = 0, best = null;

    while (attempts < 40) {
      attempts++;
      include = []; exclude = [];
      if (level <= 1) {
        cols = R(rng, 3, 4); rows = 3;
        squareOnly = rng() < 0.35;
      } else if (level === 2) {
        cols = R(rng, 4, 5); rows = R(rng, 3, 4);
        squareOnly = rng() < 0.35;
      } else if (level === 3) {
        cols = R(rng, 4, 5); rows = 4;
        include = [randomCellExcluding(rng, cols, rows, [])];
      } else if (level === 4) {
        cols = 5; rows = R(rng, 4, 5);
        include = [randomCellExcluding(rng, cols, rows, [])];
        exclude = [randomCellExcluding(rng, cols, rows, include)];
      } else {
        cols = 5; rows = 5;
        include = [randomCellExcluding(rng, cols, rows, [])];
        var ex1 = randomCellExcluding(rng, cols, rows, include);
        var ex2 = randomCellExcluding(rng, cols, rows, include.concat([ex1]));
        exclude = [ex1, ex2];
      }
      var res = bruteForceCount(cols, rows, { squareOnly: squareOnly, include: include, exclude: exclude });
      if (res.count > 0 && res.count < (cols * rows * (cols + 1) * (rows + 1))) {
        best = res;
        break;
      }
    }
    if (!best) {
      // 안전망: 조건 없이 재계산
      include = []; exclude = []; squareOnly = false;
      best = bruteForceCount(cols, rows, {});
    }

    var cs = 42;
    var grid = SVG.drawRectGrid(cols, rows, cs, { ox: 14, oy: 14 });
    var inner = grid.inner;
    include.forEach(function (p) {
      inner += SVG.gridCellSymbol(grid, p[0], p[1], 'dot', { color: '#e8590c' });
    });
    exclude.forEach(function (p) {
      inner += SVG.gridCellSymbol(grid, p[0], p[1], 'star', { color: '#1864ab' });
    });
    var svgStr = SVG.svgWrap(grid.w, grid.h, inner);

    var shapeWord = squareOnly ? '정사각형' : '직사각형(정사각형 포함)';
    var sizeDesc = '가로 ' + cols + '칸, 세로 ' + rows + '칸';
    var condText = '';
    if (include.length && exclude.length) {
      condText = ' 이때 색칠된 점(●)이 반드시 포함되고, 별표(★) 자리는 포함하지 않는 ' + shapeWord + '만 셉니다.';
      if (exclude.length > 1) {
        condText = ' 이때 색칠된 점(●)이 반드시 포함되고, 두 개의 별표(★) 자리는 모두 포함하지 않는 ' + shapeWord + '만 셉니다.';
      }
    } else if (include.length) {
      condText = ' 이때 색칠된 점(●)이 반드시 포함되는 ' + shapeWord + '만 셉니다.';
    }

    var text = '다음 그림과 같이 ' + sizeDesc + '으로 나누어진 모눈이 있습니다.' + condText +
      ' 크고 작은 ' + shapeWord + '은 모두 몇 개입니까?';

    var solution = '가로 선 ' + (cols + 1) + '개 중 2개, 세로 선 ' + (rows + 1) + '개 중 2개를 고르면 하나의 직사각형이 정해집니다. ' +
      (squareOnly ? '이 중 가로·세로 칸 수가 같은 것만 정사각형입니다. ' : '') +
      (include.length || exclude.length ? '조건(포함/제외)을 만족하는 경우만 전수 확인하면 ' : '전수로 확인하면 ') +
      '답은 ' + best.count + '개입니다.';

    return {
      text: text,
      svg: svgStr,
      answer: best.count,
      solution: solution,
      meta: { cols: cols, rows: rows, squareOnly: squareOnly, include: include, exclude: exclude }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'rect',
    name: '크고 작은 직사각형 개수',
    area: '도형',
    gen: gen,
    _bruteForceCount: bruteForceCount // 테스트용 노출
  });
})(typeof window !== 'undefined' ? window : globalThis);
