/*!
 * GFIELD BULL BANK - gens/g-path.js
 * 유형: 격자 도로망에서 최단 경로 가짓수 (연못/통행 불가 지점 변형)
 * 최단 경로 = 오른쪽 또는 아래쪽으로만 이동. DP로 전수 계산.
 */
(function (global) {
  'use strict';

  // gridW, gridH: 교차점 개수(가로/세로). blocked: {"x,y":true} 통행 불가 교차점(출발/도착 제외)
  function dpCount(gridW, gridH, blocked) {
    blocked = blocked || {};
    var dp = [];
    for (var y = 0; y < gridH; y++) {
      dp.push(new Array(gridW).fill(0));
    }
    for (var y2 = 0; y2 < gridH; y2++) {
      for (var x = 0; x < gridW; x++) {
        if (blocked[x + ',' + y2]) { dp[y2][x] = 0; continue; }
        if (x === 0 && y2 === 0) { dp[y2][x] = 1; continue; }
        var fromLeft = x > 0 ? dp[y2][x - 1] : 0;
        var fromUp = y2 > 0 ? dp[y2 - 1][x] : 0;
        dp[y2][x] = fromLeft + fromUp;
      }
    }
    return dp[gridH - 1][gridW - 1];
  }

  function randomBlockedSet(rng, gridW, gridH, count) {
    var R = global.BANK_CORE.randint;
    var chosen = [];
    var tries = 0;
    while (chosen.length < count && tries < 300) {
      tries++;
      var x = R(rng, 0, gridW - 1);
      var y = R(rng, 0, gridH - 1);
      if (x === 0 && y === 0) continue; // 출발
      if (x === gridW - 1 && y === gridH - 1) continue; // 도착
      var dup = chosen.some(function (p) { return p[0] === x && p[1] === y; });
      if (dup) continue;
      chosen.push([x, y]);
    }
    return chosen;
  }

  function gen(level, rng) {
    var CORE = global.BANK_CORE, SVG = global.BANK_SVG;
    var R = CORE.randint;
    var gridW, gridH, pondCount;

    if (level <= 1) { gridW = 3; gridH = 3; pondCount = 0; }
    else if (level === 2) { gridW = R(rng, 3, 4); gridH = 4; pondCount = 0; }
    else if (level === 3) { gridW = 4; gridH = 4; pondCount = 1; }
    else if (level === 4) { gridW = 5; gridH = 4; pondCount = R(rng, 1, 2); }
    else { gridW = 5; gridH = 5; pondCount = 2; }

    var unblockedCount = dpCount(gridW, gridH, {});
    var blockedList = [];
    var count = unblockedCount;
    var attempts = 0;

    if (pondCount > 0) {
      var ok = false;
      while (!ok && attempts < 150) {
        attempts++;
        blockedList = randomBlockedSet(rng, gridW, gridH, pondCount);
        var blockedMap = {};
        blockedList.forEach(function (p) { blockedMap[p[0] + ',' + p[1]] = true; });
        var c = dpCount(gridW, gridH, blockedMap);
        // 연못이 실제로 경로에 영향을 주고(자명하지 않고), 0은 아니어야 함
        if (c >= 2 && c < unblockedCount) {
          count = c;
          ok = true;
        }
      }
      if (!ok) { blockedList = []; count = unblockedCount; }
    }

    var blockedMapFinal = {};
    blockedList.forEach(function (p) { blockedMapFinal[p[0] + ',' + p[1]] = true; });

    var cs = 44;
    var rn = SVG.drawRoadNetwork(gridW - 1, gridH - 1, cs, {
      ox: 26, oy: 26,
      blocked: blockedMapFinal,
      start: [0, 0],
      end: [gridW - 1, gridH - 1],
      pondLabel: blockedList.length > 0
    });
    var svgStr = SVG.svgWrap(rn.w, rn.h, rn.inner);

    var pondText = blockedList.length === 1 ?
      ' 단, 그림에 표시된 연못(파란 점)이 있는 교차점은 지나갈 수 없습니다.' :
      blockedList.length > 1 ?
        ' 단, 그림에 표시된 ' + blockedList.length + '개의 연못(파란 점)이 있는 교차점은 지나갈 수 없습니다.' : '';

    var text = '오른쪽 그림과 같은 도로망이 있습니다. 출발점에서 도착점까지 오른쪽 또는 아래쪽으로만 움직여 가는' +
      pondText + ' 최단 경로는 모두 몇 가지입니까?';

    var solution = '각 교차점까지 가는 경로 수는 바로 왼쪽 교차점까지의 경로 수와 바로 위 교차점까지의 경로 수를 더한 것과 같습니다' +
      (blockedList.length ? ' (단, 통행할 수 없는 교차점은 0으로 둡니다)' : '') +
      '. 이 규칙을 도착점까지 차례로 적용하면 최단 경로의 가짓수는 ' + count + '가지입니다.';

    return {
      text: text,
      svg: svgStr,
      answer: count,
      solution: solution,
      meta: { gridW: gridW, gridH: gridH, blocked: blockedList, unblockedCount: unblockedCount }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'path',
    name: '최단 경로 가짓수',
    area: '경우의 수',
    gen: gen,
    _dpCount: dpCount
  });
})(typeof window !== 'undefined' ? window : globalThis);
