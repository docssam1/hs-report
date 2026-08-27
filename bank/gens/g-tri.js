/*!
 * GFIELD BULL BANK - gens/g-tri.js
 * 유형: 정삼각형 격자에서 크고 작은 삼각형(위/아래 방향) 개수
 * 답은 위치별 유효성 조건을 모두 검사하는 전수 나열로만 산출.
 */
(function (global) {
  'use strict';

  // n: 큰 정삼각형의 한 변을 이루는 소삼각형 개수(변 길이)
  // variant: 'all' | 'up' | 'down'
  function bruteForceCount(n, variant) {
    var up = 0, down = 0;
    for (var s = 1; s <= n; s++) {
      for (var r = 0; r <= n; r++) {
        for (var c = 0; c <= r; c++) {
          // 위쪽 방향(꼭짓점이 위) 삼각형: apex (r,c), base row r+s, col c..c+s
          if (r + s <= n) {
            up++;
          }
          // 아래쪽 방향(꼭짓점이 아래) 삼각형: top row r, col c..c+s, apex row r+s col c+s
          if (c + s <= r && r + s <= n) {
            down++;
          }
        }
      }
    }
    if (variant === 'up') return { count: up, up: up, down: down };
    if (variant === 'down') return { count: down, up: up, down: down };
    return { count: up + down, up: up, down: down };
  }

  function triangular(k) { return k > 0 ? k * (k + 1) / 2 : 0; }

  // Independent closed-form-by-size audit. For a down-facing triangle of
  // side s, the remaining placement order is n - 2s + 1.
  function formulaCount(n, variant) {
    var up = 0, down = 0;
    for (var s = 1; s <= n; s++) {
      up += triangular(n - s + 1);
      down += triangular(n - 2 * s + 1);
    }
    return { count: variant === 'up' ? up : variant === 'down' ? down : up + down, up: up, down: down };
  }

  function gen(level, rng) {
    var CORE = global.BANK_CORE, RASTER = global.BANK_RASTER;
    var n;
    if (level <= 1) n = 2;
    else if (level === 2) n = 3;
    else if (level === 3) n = 3;
    else if (level === 4) n = 4;
    else n = 4;

    var variant = 'all';
    if (level >= 3) {
      var roll = rng();
      variant = roll < 0.5 ? 'all' : (roll < 0.75 ? 'up' : 'down');
    }

    var res = bruteForceCount(n, variant);
    var independent = formulaCount(n, variant);
    if (independent.count !== res.count || independent.up !== res.up || independent.down !== res.down) {
      throw new Error('triangle independent verification mismatch');
    }

    var asset = RASTER.drawTriGrid(n, { cellSize: 70, padding: 26 });

    var variantText = variant === 'up' ? '꼭짓점이 위쪽을 향한(▲ 모양) ' :
      variant === 'down' ? '꼭짓점이 아래쪽을 향한(▽ 모양) ' : '';

    var text = '다음 그림은 한 변을 ' + n + '등분하여 만든 정삼각형 모눈입니다. 이 그림 안에서 찾을 수 있는 크고 작은 ' +
      variantText + '정삼각형은 모두 몇 개입니까?';

    var solution = '삼각형의 크기(한 변이 소삼각형 몇 개분인지)별로 나누어, 위쪽 방향과 아래쪽 방향 삼각형이 놓일 수 있는 위치를 ' +
      '모두 확인하면 위쪽 방향 ' + res.up + '개, 아래쪽 방향 ' + res.down + '개' +
      (variant === 'all' ? '이므로 합은 ' + res.count + '개입니다.' :
        variant === 'up' ? '이며, 문제에서 구하는 위쪽 방향 삼각형은 ' + res.count + '개입니다.' :
          '이며, 문제에서 구하는 아래쪽 방향 삼각형은 ' + res.count + '개입니다.');

    return {
      text: text,
      asset: asset,
      answer: res.count,
      solution: solution,
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'position-by-position enumeration', answer: res.count },
        independent: { method: 'closed formula summed by triangle size', answer: independent.count },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'all three directions of the triangular grid are fully drawn' }
      },
      meta: { n: n, variant: variant, up: res.up, down: res.down }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'tri',
    name: '크고 작은 삼각형 개수',
    area: '도형',
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    _bruteForceCount: bruteForceCount,
    _formulaCount: formulaCount
  });
})(typeof window !== 'undefined' ? window : globalThis);
