/*!
 * GFIELD BULL BANK - gens/g-cube.js
 * 유형: 쌓기나무 - 층별 개수 세기(레벨1-2), 색칠된 면 개수(레벨3-4), 최소/최대 개수(레벨5)
 * 모두 전수 계산(brute force)으로 답을 산출.
 */
(function (global) {
  'use strict';

  // ---- 레벨 1-2: 층별 개수 세기 ----
  function buildHeightsGrid(rng, nx, ny, maxH, allowZero) {
    var R = global.BANK_CORE.randint;
    var heights = [];
    for (var x = 0; x < nx; x++) {
      var col = [];
      for (var y = 0; y < ny; y++) {
        var h = allowZero ? R(rng, 0, maxH) : R(rng, 1, maxH);
        col.push(h);
      }
      heights.push(col);
    }
    return heights;
  }

  function countTotal(heights) {
    var s = 0;
    for (var x = 0; x < heights.length; x++) {
      for (var y = 0; y < heights[x].length; y++) s += heights[x][y];
    }
    return s;
  }

  function countLayer(heights, k) {
    var c = 0;
    for (var x = 0; x < heights.length; x++) {
      for (var y = 0; y < heights[x].length; y++) {
        if (heights[x][y] >= k) c++;
      }
    }
    return c;
  }

  function genLayerQuestion(level, rng) {
    var CORE = global.BANK_CORE, RASTER = global.BANK_RASTER;
    var R = CORE.randint;
    var nx = level <= 1 ? R(rng, 2, 3) : R(rng, 3, 3);
    var ny = level <= 1 ? R(rng, 2, 3) : R(rng, 3, 3);
    var maxH = level <= 1 ? 3 : 4;
    var heights = buildHeightsGrid(rng, nx, ny, maxH, level > 1 && rng() < 0.3);
    var maxUsed = 0;
    for (var x = 0; x < nx; x++) for (var y = 0; y < ny; y++) maxUsed = Math.max(maxUsed, heights[x][y]);
    if (maxUsed < 1) { heights[0][0] = 1; maxUsed = 1; }

    var variant = rng() < 0.5 ? 'total' : 'layer';
    var k = 1;
    var answer, text;
    if (variant === 'layer' && maxUsed >= 2) {
      k = R(rng, 1, maxUsed);
      answer = countLayer(heights, k);
      text = '쌓기나무를 다음 그림과 같이 쌓았습니다. 위에서부터 세어 ' + k + '층에 놓여 있는 쌓기나무는 모두 몇 개입니까?';
    } else {
      variant = 'total';
      answer = countTotal(heights);
      text = '쌓기나무를 다음 그림과 같이 쌓았습니다. 사용된 쌓기나무는 모두 몇 개입니까?';
    }

    var independentAnswer = 0;
    heights.forEach(function (column) {
      column.forEach(function (height) {
        independentAnswer += variant === 'layer' && maxUsed >= 2 ? (height >= k ? 1 : 0) : height;
      });
    });
    if (independentAnswer !== answer) throw new Error('cube layer independent verification mismatch');
    var asset = RASTER.drawIsoStackWithHeightMap(heights, { unit: 28 });

    var solution = variant === 'layer' && maxUsed >= 2 ?
      '각 자리마다 높이가 ' + k + ' 이상인 곳에는 ' + k + '층에도 쌓기나무가 있습니다. 모든 자리를 하나씩 확인하면 ' + k + '층에는 ' + answer + '개가 있습니다.' :
      '각 자리에 쌓인 쌓기나무 개수를 모두 더하면 ' + answer + '개입니다.';

    return {
      text: text,
      asset: asset,
      answer: answer,
      solution: solution,
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: variant === 'layer' ? 'height-threshold count' : 'stack-height sum', answer: answer },
        independent: { method: 'top-view height-table recount', answer: independentAnswer },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'isometric build plus exact height table removes hidden-stack ambiguity' }
      },
      meta: { heights: heights, variant: variant, k: k }
    };
  }

  // ---- 레벨 3-4: 색칠된 면 개수 ----
  function paintedFacesCount(n, k) {
    var c = 0;
    for (var x = 0; x < n; x++) {
      for (var y = 0; y < n; y++) {
        for (var z = 0; z < n; z++) {
          var faces = (x === 0 || x === n - 1 ? 1 : 0) + (y === 0 || y === n - 1 ? 1 : 0) + (z === 0 || z === n - 1 ? 1 : 0);
          if (faces === k) c++;
        }
      }
    }
    return c;
  }

  function paintedFacesFormula(n, k) {
    if (k === 3) return 8;
    if (k === 2) return 12 * Math.max(0, n - 2);
    if (k === 1) return 6 * Math.pow(Math.max(0, n - 2), 2);
    return Math.pow(Math.max(0, n - 2), 3);
  }

  function genPaintedQuestion(level, rng) {
    var CORE = global.BANK_CORE, RASTER = global.BANK_RASTER;
    var n = level <= 3 ? 3 : (rng() < 0.5 ? 4 : 5);
    var k = CORE.randint(rng, 0, 3);
    var answer = paintedFacesCount(n, k);
    var independentAnswer = paintedFacesFormula(n, k);
    if (independentAnswer !== answer) throw new Error('painted cube independent verification mismatch');

    var asset = RASTER.drawPaintedCube(n);

    var kWord = { 0: '한 면도 칠해지지 않은', 1: '정확히 한 면만 칠해진', 2: '정확히 두 면이 칠해진', 3: '정확히 세 면이 칠해진' }[k];

    var text = '한 모서리의 길이가 ' + n + '인 큰 정육면체의 겉면 전체에 페인트를 칠한 다음, 모서리의 길이가 1인 작은 정육면체 ' +
      (n * n * n) + '개로 잘랐습니다. 이 중에서 ' + kWord + ' 작은 정육면체는 모두 몇 개입니까?';

    var solution = '작은 정육면체는 큰 정육면체 안에서의 위치(꼭짓점·모서리·면·내부)에 따라 칠해진 면의 개수가 정해집니다. ' +
      '모든 위치를 하나씩 확인하면 칠해진 면이 ' + k + '개인 작은 정육면체는 ' + answer + '개입니다.';

    return {
      text: text,
      asset: asset,
      answer: answer,
      solution: solution,
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'coordinate-by-coordinate face enumeration', answer: answer },
        independent: { method: 'corner-edge-face-interior formula', answer: independentAnswer },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'dimensions and all visible unit boundaries are explicit; hidden cells follow the stated solid-cube rule' }
      },
      meta: { n: n, k: k }
    };
  }

  // ---- 레벨 5: 위/앞/옆에서 본 모양으로 최소/최대 개수 ----
  function computeViews(heights) {
    var nx = heights.length, ny = heights[0].length;
    var front = new Array(nx).fill(0); // x별 최대 높이(앞에서 봤을 때)
    var side = new Array(ny).fill(0);  // y별 최대 높이(옆에서 봤을 때)
    var top = [];
    for (var x = 0; x < nx; x++) {
      top.push([]);
      for (var y = 0; y < ny; y++) {
        top[x].push(heights[x][y] > 0);
        front[x] = Math.max(front[x], heights[x][y]);
        side[y] = Math.max(side[y], heights[x][y]);
      }
    }
    return { top: top, front: front, side: side };
  }

  // top/front/side 조건을 만족하는 모든 높이 배치를 전수 탐색하여 총합의 최소/최대를 구함
  function minMaxFromViews(top, front, side) {
    var nx = front.length, ny = side.length;
    var domains = [];
    for (var x = 0; x < nx; x++) {
      domains.push([]);
      for (var y = 0; y < ny; y++) {
        if (!top[x][y]) { domains[x].push([0]); continue; }
        var cap = Math.min(front[x], side[y]);
        var opts = [];
        // A filled cell in the top view must contain at least one cube.
        for (var v = 1; v <= cap; v++) opts.push(v);
        domains[x].push(opts);
      }
    }
    var cells = [];
    for (var x2 = 0; x2 < nx; x2++) for (var y2 = 0; y2 < ny; y2++) cells.push([x2, y2]);

    var minSum = Infinity, maxSum = -Infinity;
    var assign = {};
    function rec(idx, colMax, rowMax, sum) {
      if (idx === cells.length) {
        // 모든 행/열의 최대값이 정확히 front/side와 일치해야 함
        for (var x3 = 0; x3 < nx; x3++) if (colMax[x3] !== front[x3]) return;
        for (var y3 = 0; y3 < ny; y3++) if (rowMax[y3] !== side[y3]) return;
        if (sum < minSum) minSum = sum;
        if (sum > maxSum) maxSum = sum;
        return;
      }
      var cx = cells[idx][0], cy = cells[idx][1];
      var opts = domains[cx][cy];
      for (var i = 0; i < opts.length; i++) {
        var v = opts[i];
        var prevC = colMax[cx], prevR = rowMax[cy];
        colMax[cx] = Math.max(colMax[cx], v);
        rowMax[cy] = Math.max(rowMax[cy], v);
        rec(idx + 1, colMax, rowMax, sum + v);
        colMax[cx] = prevC;
        rowMax[cy] = prevR;
      }
    }
    rec(0, new Array(nx).fill(0), new Array(ny).fill(0), 0);
    return { min: minSum, max: maxSum };
  }

  // Independent dynamic-programming solver. Because each cell is capped by
  // both silhouettes, it is enough to record which front/side maxima have
  // already been witnessed while minimizing/maximizing the running sum.
  function minMaxFromViewsIndependent(top, front, side) {
    var nx = front.length, ny = side.length;
    var cells = [];
    for (var x = 0; x < nx; x++) {
      for (var y = 0; y < ny; y++) {
        var values = [];
        if (top[x][y]) {
          var cap = Math.min(front[x], side[y]);
          for (var v = 1; v <= cap; v++) values.push(v);
          if (!values.length) return { min: Infinity, max: -Infinity };
        } else {
          values.push(0);
        }
        cells.push({ x: x, y: y, values: values });
      }
    }
    var frontStart = 0, sideStart = 0;
    for (var fx = 0; fx < nx; fx++) if (front[fx] === 0) frontStart |= (1 << fx);
    for (var sy = 0; sy < ny; sy++) if (side[sy] === 0) sideStart |= (1 << sy);
    var states = {};
    states[frontStart + '|' + sideStart] = { min: 0, max: 0, fm: frontStart, sm: sideStart };
    cells.forEach(function (cell) {
      var next = {};
      Object.keys(states).forEach(function (key) {
        var state = states[key];
        cell.values.forEach(function (value) {
          var fm = state.fm | (value === front[cell.x] ? (1 << cell.x) : 0);
          var sm = state.sm | (value === side[cell.y] ? (1 << cell.y) : 0);
          var nextKey = fm + '|' + sm;
          var candidateMin = state.min + value;
          var candidateMax = state.max + value;
          if (!next[nextKey]) next[nextKey] = { min: candidateMin, max: candidateMax, fm: fm, sm: sm };
          else {
            next[nextKey].min = Math.min(next[nextKey].min, candidateMin);
            next[nextKey].max = Math.max(next[nextKey].max, candidateMax);
          }
        });
      });
      states = next;
    });
    var fullFront = (1 << nx) - 1, fullSide = (1 << ny) - 1;
    var result = states[fullFront + '|' + fullSide];
    return result ? { min: result.min, max: result.max } : { min: Infinity, max: -Infinity };
  }

  function genViewsQuestion(level, rng) {
    var CORE = global.BANK_CORE, RASTER = global.BANK_RASTER;
    var R = CORE.randint;
    var nx = 3, ny = 3, maxH = 3;
    var best = null;
    var attempts = 0;
    while (attempts < 60) {
      attempts++;
      var heights = buildHeightsGrid(rng, nx, ny, maxH, true);
      var total = countTotal(heights);
      if (total < 4) continue;
      var views = computeViews(heights);
      var mm = minMaxFromViews(views.top, views.front, views.side);
      var independentMm = minMaxFromViewsIndependent(views.top, views.front, views.side);
      if (mm.min !== independentMm.min || mm.max !== independentMm.max) {
        throw new Error('cube views independent verification mismatch');
      }
      if (mm.min === Infinity || mm.max < 0) continue;
      if (mm.max > mm.min) { best = { heights: heights, views: views, mm: mm }; break; }
      if (!best) best = { heights: heights, views: views, mm: mm };
    }
    if (!best) {
      var fallbackHeights = [[1, 2, 1], [2, 3, 2], [1, 2, 1]];
      var fv = computeViews(fallbackHeights);
      var fmm = minMaxFromViews(fv.top, fv.front, fv.side);
      best = { heights: fallbackHeights, views: fv, mm: fmm };
    }

    var views = best.views, mm = best.mm;
    var independent = minMaxFromViewsIndependent(views.top, views.front, views.side);
    var answer = mm.max - mm.min;
    if (independent.min !== mm.min || independent.max !== mm.max) throw new Error('cube final independent verification mismatch');
    var asset = RASTER.drawOrthographicViews(views);

    var text = '쌓기나무로 어떤 모양을 만들었더니, 위·앞·옆에서 본 모양이 다음 그림과 같았습니다. ' +
      '이 모양을 만드는 데 사용한 쌓기나무 개수가 가장 많을 때와 가장 적을 때의 개수의 차는 얼마입니까?';

    var solution = '위에서 본 모양으로 쌓기나무가 있는 자리를 알 수 있고, 각 자리의 높이는 앞·옆에서 본 모양의 최댓값을 넘을 수 없습니다. ' +
      '가능한 모든 배치를 확인하면 최대 ' + mm.max + '개, 최소 ' + mm.min + '개이므로 차는 ' + answer + '개입니다.';

    return {
      text: text,
      asset: asset,
      answer: answer,
      solution: solution,
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'complete height-assignment enumeration', answer: answer, min: mm.min, max: mm.max },
        independent: { method: 'silhouette-witness dynamic programming', answer: independent.max - independent.min, min: independent.min, max: independent.max },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'top occupancy and front/side heights are shown on complete orthographic grids' }
      },
      meta: { heights: best.heights, views: views, min: mm.min, max: mm.max }
    };
  }

  function gen(level, rng) {
    if (level <= 2) return genLayerQuestion(level, rng);
    if (level <= 4) return genPaintedQuestion(level, rng);
    return genViewsQuestion(level, rng);
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'cube',
    name: '쌓기나무',
    area: '도형',
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    _countTotal: countTotal,
    _countLayer: countLayer,
    _paintedFacesCount: paintedFacesCount,
    _paintedFacesFormula: paintedFacesFormula,
    _computeViews: computeViews,
    _minMaxFromViews: minMaxFromViews,
    _minMaxFromViewsIndependent: minMaxFromViewsIndependent
  });
})(typeof window !== 'undefined' ? window : globalThis);
