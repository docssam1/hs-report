(function (global) {
  'use strict';

  var VERSION = '1.0.0';
  var SYMBOLS = ['◆', '●', '▲', '■'];

  function formatNumber(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
    if (Number.isInteger(value)) return value.toLocaleString('ko-KR');
    return String(Math.round(value * 1000) / 1000);
  }

  function sum(values) {
    return values.reduce(function (total, value) { return total + value; }, 0);
  }

  function permutations(values) {
    if (values.length <= 1) return [values.slice()];
    var result = [];
    values.forEach(function (value, index) {
      permutations(values.slice(0, index).concat(values.slice(index + 1))).forEach(function (rest) {
        result.push([value].concat(rest));
      });
    });
    return result;
  }

  function formatClock(decimalHour) {
    var totalSeconds = Math.round(decimalHour * 3600);
    var hour = Math.floor(totalSeconds / 3600) % 24;
    var minute = Math.floor((totalSeconds % 3600) / 60);
    var second = totalSeconds % 60;
    return hour + '시 ' + minute + '분' + (second ? ' ' + second + '초' : '');
  }

  function q4SplitExtremes(digits) {
    var byKind = {
      '1자리×3자리': [],
      '2자리×2자리': []
    };
    permutations(digits).forEach(function (order) {
      [1, 2, 3].forEach(function (split) {
        var left = Number(order.slice(0, split).join(''));
        var right = Number(order.slice(split).join(''));
        var kind = Math.min(split, 4 - split) === 1 ? '1자리×3자리' : '2자리×2자리';
        byKind[kind].push({ left: left, right: right, product: left * right });
      });
    });
    Object.keys(byKind).forEach(function (kind) {
      byKind[kind].sort(function (a, b) { return a.product - b.product; });
    });
    return byKind;
  }

  function countColorings(counts, fixedFirst, fixedSecond) {
    var remaining = counts.slice();
    if (fixedFirst >= 0) remaining[fixedFirst]--;
    if (fixedSecond >= 0) remaining[fixedSecond]--;
    if (remaining.some(function (value) { return value < 0; })) return 0;
    var previous = fixedSecond >= 0 ? fixedSecond : fixedFirst;

    function visit(left, prior) {
      if (sum(left) === 0) return 1;
      var total = 0;
      for (var color = 0; color < left.length; color++) {
        if (color === prior || left[color] === 0) continue;
        left[color]--;
        total += visit(left, color);
        left[color]++;
      }
      return total;
    }

    return visit(remaining, previous);
  }

  function stackLayerCounts(heights) {
    var maxHeight = Math.max.apply(null, heights.reduce(function (all, row) { return all.concat(row); }, []));
    var layers = [];
    for (var z = 0; z < maxHeight; z++) {
      var layer = { level: z + 1, zero: 0, two: 0 };
      for (var row = 0; row < heights.length; row++) {
        for (var col = 0; col < heights[row].length; col++) {
          if (heights[row][col] <= z) continue;
          var faces = z === heights[row][col] - 1 ? 1 : 0;
          [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (offset) {
            var neighborRow = row + offset[0], neighborCol = col + offset[1];
            if (neighborRow < 0 || neighborRow >= heights.length || neighborCol < 0 || neighborCol >= heights[row].length || heights[neighborRow][neighborCol] <= z) faces++;
          });
          if (faces === 0) layer.zero++;
          if (faces === 2) layer.two++;
        }
      }
      layers.push(layer);
    }
    return layers;
  }

  function rectContaining(cols, rows, marker) {
    var col = marker[0], row = marker[1];
    return (col + 1) * (cols - col) * (row + 1) * (rows - row);
  }

  function rectContainingBoth(cols, rows, first, second) {
    var minCol = Math.min(first[0], second[0]);
    var maxCol = Math.max(first[0], second[0]);
    var minRow = Math.min(first[1], second[1]);
    var maxRow = Math.max(first[1], second[1]);
    return (minCol + 1) * (cols - maxCol) * (minRow + 1) * (rows - maxRow);
  }

  function expression(symbolIndexes, values) {
    var terms = symbolIndexes.map(function (index) { return values ? values[index] : SYMBOLS[index]; });
    return terms.join('+');
  }

  function q21Steps(meta) {
    var grid = meta.grid;
    var values = meta.solvedValues;
    var signature = grid.map(function (row) { return row.join(''); }).join('|');
    var commonFirst = '보이는 여섯 식을 차례로 쓰면 ' + meta.knownEquations.join(', ') + '입니다.';
    var work;

    if (signature === '3020|0001|0123|2120') {
      work = [
        '2◆+2●=18이므로 ◆+●=9입니다. 「3◆+●=21」에서 「◆+●=9」를 빼면 2◆=12이므로 ◆=6이고, ●=9−6=3입니다.',
        '◆+3▲=42에 ◆=6을 넣으면 3▲=36이므로 ▲=12입니다. 2◆+▲+■=31에 넣으면 ■=31−12−12=7입니다.'
      ];
    } else if (signature === '2223|3233|3000|3133') {
      work = [
        '3▲+■=37을 3배한 식에서 ▲+3■=39를 빼면 8▲=72이므로 ▲=9이고, ■=37−27=10입니다.',
        '3◆+■=25에 ■=10을 넣으면 ◆=5입니다. ◆+●+2▲=31에 넣으면 ●=31−5−18=8입니다.'
      ];
    } else if (signature === '3303|0012|0320|3230') {
      work = [
        '2◆+2■=38이므로 ◆+■=19입니다. ◆+3■=41에서 이를 빼면 2■=22이므로 ■=11, ◆=8입니다.',
        '2◆+▲+■=29에 넣으면 ▲=29−16−11=2입니다. 2◆+●+▲=21에 넣으면 ●=21−16−2=3입니다.'
      ];
    } else {
      work = [
        '여섯 식에서 같은 도형 항을 서로 빼고 더해 ◆=' + values[0] + ', ●=' + values[1] + ', ▲=' + values[2] + ', ■=' + values[3] + '을 얻습니다.',
        '구한 네 값을 원래 여섯 식에 다시 넣어 모든 합이 맞는지 확인합니다.'
      ];
    }

    var lastRow = grid[3];
    var lastColumn = grid.map(function (row) { return row[3]; });
    return [commonFirst].concat(work, [
      '남은 가로줄은 ' + expression(lastRow) + '=' + expression(lastRow, values) + '=' + meta.rowSums[3] + '입니다. 남은 세로줄은 ' + expression(lastColumn) + '=' + expression(lastColumn, values) + '=' + meta.columnSums[3] + '입니다.'
    ]);
  }

  function q23DayOrder(meta) {
    var peopleByDay = [];
    var sportsByDay = [];
    meta.constraints.forEach(function (constraint) {
      if (constraint.kind === 'person-day') peopleByDay[constraint.dayIndex] = constraint.person;
      if (constraint.kind === 'sport-day') sportsByDay[constraint.dayIndex] = constraint.sport;
    });
    var personBefore = meta.constraints.find(function (row) { return row.kind === 'person-immediately-before-person'; });
    var personEarlier = meta.constraints.find(function (row) { return row.kind === 'person-before-person'; });
    var personAfter = meta.constraints.find(function (row) { return row.kind === 'person-immediately-after-person'; });
    peopleByDay[1] = personBefore.first;
    peopleByDay[0] = personEarlier.first;
    peopleByDay[3] = personAfter.second;
    peopleByDay[4] = personAfter.first;

    var sportAfter = meta.constraints.find(function (row) { return row.kind === 'sport-immediately-after-sport'; });
    sportsByDay[0] = sportAfter.second;
    sportsByDay[1] = sportAfter.first;
    sportsByDay[3] = meta.targetSport;
    return { people: peopleByDay, sports: sportsByDay };
  }

  function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return { canvas: canvas, ctx: ctx };
  }

  function rasterResult(canvas, width, height, description) {
    return {
      kind: 'raster',
      src: canvas.toDataURL('image/png'),
      width: width,
      height: height,
      description: description
    };
  }

  function drawNumberLineSolution(meta) {
    var width = 1000, height = 330;
    var made = createCanvas(width, height), canvas = made.canvas, ctx = made.ctx;
    var left = 82, right = 918, y = 160;
    var scale = (right - left) / meta.total;
    var xs = meta.positions.map(function (position) { return left + position * scale; });

    ctx.fillStyle = '#13213c';
    ctx.font = '700 26px "Malgun Gothic", sans-serif';
    ctx.fillText('역 순서와 거리를 한 수직선에 옮기기', 42, 40);
    ctx.strokeStyle = '#293653';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();

    ctx.strokeStyle = '#1774d1';
    ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(xs[1], y); ctx.lineTo(xs[4], y); ctx.stroke();

    meta.stations.forEach(function (station, index) {
      ctx.strokeStyle = '#17233f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xs[index], y - 14); ctx.lineTo(xs[index], y + 14); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#17233f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(xs[index], y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#17233f';
      ctx.textAlign = 'center';
      ctx.font = '700 19px "Malgun Gothic", sans-serif';
      ctx.fillText(station, xs[index], y + 38);
      ctx.font = '15px "Malgun Gothic", sans-serif';
      ctx.fillStyle = '#59657c';
      ctx.fillText(meta.positions[index] + ' km', xs[index], y - 24);
    });

    ctx.strokeStyle = '#0e63b6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xs[1], 92); ctx.lineTo(xs[1], 84); ctx.lineTo(xs[4], 84); ctx.lineTo(xs[4], 92); ctx.stroke();
    ctx.fillStyle = '#0e63b6';
    ctx.font = '700 21px "Malgun Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('? km', (xs[1] + xs[4]) / 2, 75);

    function bracket(x1, x2, by, label, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, by - 8); ctx.lineTo(x1, by); ctx.lineTo(x2, by); ctx.lineTo(x2, by - 8);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '700 17px "Malgun Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, (x1 + x2) / 2, by + 24);
    }
    bracket(xs[0], xs[5], 240, '전체 ' + meta.total + ' km', '#293653');
    bracket(xs[0], xs[1], 280, meta.gaps[0] + ' km', '#a04a23');
    bracket(xs[4], xs[5], 280, meta.gaps[4] + ' km', '#a04a23');
    return rasterResult(canvas, width, height, '여섯 역을 실제 누적거리에 맞춰 놓고 전체 거리에서 양 끝 구간을 빼는 풀이 수직선');
  }

  function drawFoldSolution(meta) {
    var width = 760, height = 520;
    var made = createCanvas(width, height), canvas = made.canvas, ctx = made.ctx;
    var x0 = 96, y0 = 92, size = 320, cell = size / 4;
    ctx.fillStyle = '#14233d';
    ctx.font = '700 25px "Malgun Gothic", sans-serif';
    ctx.fillText('2번 접기 한 세트 × 2번 = 모두 4번 접기', 42, 42);
    ctx.font = '18px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#4a5870';
    ctx.fillText('접은 순서의 반대로 펼쳐 4×4 절단망을 그립니다.', 42, 70);

    ctx.strokeStyle = '#bcc6d5';
    ctx.lineWidth = 1;
    for (var gridLine = 0; gridLine <= 4; gridLine++) {
      ctx.beginPath(); ctx.moveTo(x0 + gridLine * cell, y0); ctx.lineTo(x0 + gridLine * cell, y0 + size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0 + gridLine * cell); ctx.lineTo(x0 + size, y0 + gridLine * cell); ctx.stroke();
    }
    ctx.strokeStyle = '#24324a';
    ctx.lineWidth = 4;
    ctx.strokeRect(x0, y0, size, size);
    ctx.strokeStyle = '#0878cf';
    ctx.lineWidth = 4;

    if (meta.cutPattern === 'mid-cross') {
      for (var middle = 0.5; middle < 4; middle++) {
        ctx.beginPath(); ctx.moveTo(x0 + middle * cell, y0); ctx.lineTo(x0 + middle * cell, y0 + size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, y0 + middle * cell); ctx.lineTo(x0 + size, y0 + middle * cell); ctx.stroke();
      }
    } else {
      for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
          if (meta.cutPattern === 'diagonals' || (row + col) % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x0 + col * cell, y0 + row * cell);
            ctx.lineTo(x0 + (col + 1) * cell, y0 + (row + 1) * cell);
            ctx.stroke();
          }
          if (meta.cutPattern === 'diagonals' || (row + col) % 2 === 1) {
            ctx.beginPath();
            ctx.moveTo(x0 + (col + 1) * cell, y0 + row * cell);
            ctx.lineTo(x0 + col * cell, y0 + (row + 1) * cell);
            ctx.stroke();
          }
        }
      }
    }

    ctx.fillStyle = '#14233d';
    ctx.font = '700 22px "Malgun Gothic", sans-serif';
    ctx.fillText('펼쳐진 4×4 색종이', x0 + 48, y0 + size + 42);
    ctx.font = '700 21px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#0e63b6';
    if (meta.cutPattern === 'mid-cross') {
      ctx.fillText('가로 4줄, 세로 4줄', 470, 155);
      ctx.fillText('→ 5칸 × 5칸', 470, 196);
      ctx.fillText('→ 25조각', 470, 237);
    } else if (meta.cutPattern === 'single-diagonal') {
      ctx.fillText('위 가장자리 4조각', 470, 155);
      ctx.fillText('+ 안쪽 4조각', 470, 196);
      ctx.fillText('+ 아래 가장자리 4조각', 470, 237);
      ctx.fillText('= 12조각', 470, 278);
    } else {
      ctx.fillText('바깥 묶음 18조각', 470, 155);
      ctx.fillText('+ 반대쪽 18조각', 470, 196);
      ctx.fillText('+ 가운데 4조각', 470, 237);
      ctx.fillText('= 40조각', 470, 278);
    }
    ctx.font = '16px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#5b6577';
    ctx.fillText('파란 선은 접은 종이를 자른 자국이', 470, 352);
    ctx.fillText('펼칠 때마다 거울처럼 복사된 모습입니다.', 470, 379);
    return rasterResult(canvas, width, height, '두 번의 반 접기를 한 세트로 두 번 반복한 뒤 완전히 펼친 4×4 절단망과 조각 세기');
  }

  function solutionSteps(question) {
    var meta = question.meta || {};
    var answer = question.answer;
    switch (Number(question.sourceNo)) {
      case 1: {
        var counts = [];
        for (var tens = 1; tens <= 9; tens++) counts.push(Math.max(0, Math.min(10, meta.threshold - tens)));
        var nonzero = counts.map(function (count, index) { return count ? (index + 1) + '일 때 ' + count + '개' : ''; }).filter(Boolean);
        var ending = counts.some(function (count) { return count === 0; })
          ? '그 뒤 십의 자리에서는 가능한 일의 자리가 없습니다.'
          : '십의 자리는 9까지 모두 확인했습니다.';
        return [
          '십의 자리 숫자를 1부터 차례로 정합니다. 일의 자리는 0부터 시작하며 두 자리의 합이 ' + meta.threshold + '보다 작아야 합니다.',
          '십의 자리가 ' + nonzero.join(', ') + '입니다. ' + ending,
          counts.filter(Boolean).join('+') + '=' + answer + '이므로 조건에 맞는 두 자리 수는 ' + answer + '개입니다.'
        ];
      }
      case 2: {
        var layers = stackLayerCounts(meta.heights);
        return [
          '바닥에 닿은 면은 칠하지 않습니다. 각 쌓기나무의 위·앞·뒤·왼쪽·오른쪽 중 다른 나무와 맞닿지 않은 면만 셉니다.',
          '아래층부터 「0개 면, 2개 면」인 나무를 세면 ' + layers.map(function (layer) { return layer.level + '층 (' + layer.zero + ', ' + layer.two + ')'; }).join(', ') + '입니다.',
          '층별 수를 더하면 2개 면이 칠해진 나무는 ' + layers.map(function (layer) { return layer.two; }).join('+') + '=' + meta.counts.two + '개, 한 면도 칠해지지 않은 나무는 ' + layers.map(function (layer) { return layer.zero; }).join('+') + '=' + meta.counts.zero + '개입니다.',
          meta.counts.two + '+' + meta.counts.zero + '=' + answer + '이므로 모두 ' + answer + '개입니다.'
        ];
      }
      case 3:
        return [
          '시침과 분침은 12시간에 11번 겹치므로, 겹침 사이의 간격은 12÷11시간입니다.',
          '두 끝을 빼고 ' + meta.startHour + '시와 ' + meta.endHour + '시 사이에 든 시각은 ' + meta.overlapHours.map(formatClock).join(', ') + '입니다.',
          '이 시각을 하나씩 세면 ' + answer + '번이므로 푼 문제도 ' + answer + '개입니다.'
        ];
      case 4: {
        var splits = q4SplitExtremes(meta.digits);
        var oneThree = splits['1자리×3자리'];
        var twoTwo = splits['2자리×2자리'];
        var oneMin = oneThree[0], oneMax = oneThree[oneThree.length - 1];
        var twoMin = twoTwo[0], twoMax = twoTwo[twoTwo.length - 1];
        return [
          '두 수의 자리 수는 1자리×3자리 또는 2자리×2자리입니다. 3자리×1자리는 곱셈 순서만 바뀌므로 같은 경우입니다.',
          '1자리×3자리에서 가장 작은 곱은 ' + oneMin.left + '×' + oneMin.right + '=' + oneMin.product + ', 가장 큰 곱은 ' + oneMax.left + '×' + oneMax.right + '=' + oneMax.product + '입니다.',
          '2자리×2자리에서 가장 작은 곱은 ' + twoMin.left + '×' + twoMin.right + '=' + twoMin.product + ', 가장 큰 곱은 ' + twoMax.left + '×' + twoMax.right + '=' + twoMax.product + '입니다.',
          '두 종류를 함께 비교하면 전체 최소는 ' + meta.minimumProduct + ', 전체 최대는 ' + meta.maximumProduct + '이므로 ' + meta.maximumProduct + '−' + meta.minimumProduct + '=' + answer + '입니다.'
        ];
      }
      case 5: {
        var top = Math.ceil(meta.count / 2), bottom = Math.floor(meta.count / 2);
        return [
          '이어 붙인 변은 도형 안쪽에 들어가므로 둘레에서 빼고, 바깥에 남은 변만 셉니다.',
          '위쪽 밑변은 ' + top + '개, 아래쪽 밑변은 ' + bottom + '개여서 밑변은 모두 ' + top + '+' + bottom + '=' + meta.count + '개입니다.',
          '양 끝에 옆변이 하나씩 남으므로 둘레는 ' + meta.base + '×' + meta.count + '+' + meta.side + '×2=' + answer + '센티미터입니다.'
        ];
      }
      case 6:
        return [
          '일주일 오차 ' + meta.weeklyGainMinutes + '분을 7일로 나누면 하루에 ' + meta.weeklyGainMinutes + '÷7=' + meta.dailyGainMinutes + '분씩 빨라집니다.',
          '아날로그시계는 12시간만큼 빨라지면 바늘 모양이 다시 같아집니다. 12시간은 12×60=720분입니다.',
          '720÷' + meta.dailyGainMinutes + '=' + answer + '이므로 ' + answer + '일 후 다시 정확한 시각을 가리킵니다.'
        ];
      case 7:
        return [
          '역을 ' + meta.stations.join(' → ') + ' 순서로 수직선에 표시합니다.',
          meta.stations[0] + '역부터 ' + meta.stations[5] + '역까지는 ' + meta.total + '킬로미터입니다. 왼쪽 끝 구간은 ' + meta.gaps[0] + '킬로미터, 오른쪽 끝 구간은 ' + meta.gaps[4] + '킬로미터입니다.',
          meta.stations[1] + '역과 ' + meta.stations[4] + '역 사이는 ' + meta.total + '−' + meta.gaps[0] + '−' + meta.gaps[4] + '=' + answer + '킬로미터입니다.'
        ];
      case 8: {
        var allSuccess = meta.total * meta.reward;
        var oneDifference = meta.reward + meta.penalty;
        var broken = (allSuccess - meta.received) / oneDifference;
        return [
          '모두 무사히 옮겼다고 보면 받을 돈은 ' + meta.total + '×' + meta.reward + '=' + formatNumber(allSuccess) + '원입니다.',
          '한 개가 성공에서 실패로 바뀌면 받는 ' + meta.reward + '원이 없어지고 ' + meta.penalty + '원을 내므로 차이는 ' + meta.reward + '+' + meta.penalty + '=' + oneDifference + '원입니다.',
          '깨뜨린 것은 (' + formatNumber(allSuccess) + '−' + formatNumber(meta.received) + ')÷' + oneDifference + '=' + broken + '개입니다.',
          '깨뜨리지 않은 것은 ' + meta.total + '−' + broken + '=' + answer + '개입니다.'
        ];
      }
      case 9:
        var triangular = (meta.target - 1) * meta.target / 2;
        return [
          '각 배열의 구슬 수를 그림에서 세면 차례로 ' + meta.stageCounts.join(', ') + '개입니다.',
          '첫 번째는 1개이고, 둘째부터는 ' + meta.multiplier + '×1, ' + meta.multiplier + '×2, …, ' + meta.multiplier + '×' + (meta.target - 1) + '개입니다.',
          '1부터 ' + (meta.target - 1) + '까지의 합은 (1+' + (meta.target - 1) + ')×' + (meta.target - 1) + '÷2=' + triangular + '입니다.',
          '따라서 전체는 1+' + meta.multiplier + '×' + triangular + '=' + answer + '개입니다.'
        ];
      case 10:
        return [
          (meta.row - 1) + '행까지 놓인 수는 1+2+…+' + (meta.row - 1) + '=' + (meta.first - 1) + '개이므로 ' + meta.row + '행의 첫 수는 ' + meta.first + '입니다.',
          meta.row + '행에는 ' + meta.row + '개가 있으므로 마지막 수는 ' + meta.first + '+' + (meta.row - 1) + '=' + meta.last + '입니다.',
          '처음과 끝의 평균은 (' + meta.first + '+' + meta.last + ')÷2이고 수가 ' + meta.row + '개이므로 합은 (' + meta.first + '+' + meta.last + ')×' + meta.row + '÷2=' + answer + '입니다.'
        ];
      case 11: {
        var p = meta.pairSums, inner = meta.inner;
        return [
          '각 선에서 바깥 두 수를 빼면 이웃한 안쪽 두 칸의 합은 차례로 ' + meta.targetSum + '−(' + meta.outer[0] + '+' + meta.outer[2] + ')=' + p[0] + ', ' + meta.targetSum + '−(' + meta.outer[1] + '+' + meta.outer[3] + ')=' + p[1] + ', ' + meta.targetSum + '−(' + meta.outer[2] + '+' + meta.outer[4] + ')=' + p[2] + ', ' + meta.targetSum + '−(' + meta.outer[3] + '+' + meta.outer[0] + ')=' + p[3] + ', ' + meta.targetSum + '−(' + meta.outer[4] + '+' + meta.outer[1] + ')=' + p[4] + '입니다.',
          'ㄱ은 (' + p[0] + '−' + p[1] + '+' + p[2] + '−' + p[3] + '+' + p[4] + ')÷2=' + inner[0] + '입니다.',
          '이웃한 합에서 차례로 빼면 ㄴ=' + p[0] + '−' + inner[0] + '=' + inner[1] + ', ㄷ=' + p[1] + '−' + inner[1] + '=' + inner[2] + ', ㄹ=' + p[2] + '−' + inner[2] + '=' + inner[3] + ', ㅁ=' + p[3] + '−' + inner[3] + '=' + inner[4] + '입니다.',
          '' + inner[0] + inner[1] + inner[2] + '+' + inner[3] + inner[4] + '=' + answer + '입니다.'
        ];
      }
      case 12: {
        var values12 = meta.matches[0];
        var daonRaon = meta.total - meta.firstPair;
        return [
          '다온+라온=' + meta.total + '−' + meta.firstPair + '=' + daonRaon + '입니다.',
          '두 식의 차를 구하면 라온=' + meta.weighted + '−' + daonRaon + '=' + values12[3] + '입니다.',
          '다온=' + daonRaon + '−' + values12[3] + '=' + values12[2] + ', 가온=' + values12[2] + '+' + meta.difference + '=' + values12[0] + ', 나래=' + meta.firstPair + '−' + values12[0] + '=' + values12[1] + '입니다.',
          '확인하면 전체는 ' + values12.join('+') + '=' + meta.total + ', 가온+나래=' + meta.firstPair + ', 다온+2×라온=' + meta.weighted + '입니다. 따라서 답은 ' + values12.join(', ') + '개입니다.'
        ];
      }
      case 13: {
        var rowTotal = sum(meta.rowSums), visibleColumns = meta.columnSums[0] + meta.columnSums[1];
        return [
          '세 가로줄의 합을 더하면 ' + meta.rowSums.join('+') + '=' + rowTotal + '입니다. 이것은 ' + meta.grid.length * meta.grid[0].length + '칸의 수를 한 번씩 모두 더한 값입니다.',
          '세 세로줄의 합도 같은 ' + meta.grid.length * meta.grid[0].length + '칸을 한 번씩 모두 더하므로 세로줄의 전체 합도 ' + rowTotal + '입니다.',
          '보이는 두 세로줄의 합은 ' + meta.columnSums[0] + '+' + meta.columnSums[1] + '=' + visibleColumns + '입니다.',
          '물음표는 ' + rowTotal + '−' + visibleColumns + '=' + answer + '입니다.'
        ];
      }
      case 14:
        return [
          '토끼와 양의 수를 같은 기준 수 □명으로 둡니다. 다람쥐는 □−' + meta.squirrelGap + ', 강아지는 □+' + meta.dogGap + ', 고양이는 강아지의 절반입니다.',
          '고양이의 절반을 없애려고 전체를 2배하면 2□+2□+2(□−' + meta.squirrelGap + ')+2(□+' + meta.dogGap + ')+(□+' + meta.dogGap + ')입니다. 이를 묶으면 9□−' + (meta.squirrelGap * 2) + '+' + (meta.dogGap * 3) + '입니다.',
          '따라서 □=(' + meta.total + '×2+' + meta.squirrelGap + '×2−' + meta.dogGap + '×3)÷9=' + meta.rabbit + '입니다.',
          '확인: 토끼 ' + meta.rabbit + '+양 ' + meta.sheep + '+다람쥐 ' + meta.squirrel + '+강아지 ' + meta.dog + '+고양이 ' + meta.cat + '=' + meta.total + '명입니다.'
        ];
      case 15: {
        var colorNames = ['초록', '파랑', '노랑'];
        var details = [];
        for (var first = 0; first < 3; first++) {
          var branches = [];
          for (var second = 0; second < 3; second++) {
            if (second === first) continue;
            branches.push('다음이 ' + colorNames[second] + ' ' + countColorings(meta.counts, first, second) + '가지');
          }
          details.push(colorNames[first] + ' 시작: ' + branches.join(' + ') + ' = ' + meta.firstColorCounts[first] + '가지');
        }
        return [
          '필요한 색 수는 초록 ' + meta.counts[0] + '개, 파랑 ' + meta.counts[1] + '개, 노랑 ' + meta.counts[2] + '개입니다. 맨 아래 색을 먼저 정하고, 그 위에는 바로 아래와 다른 색만 놓습니다.',
          details[0] + '입니다.',
          details[1] + ', ' + details[2] + '입니다.',
          meta.firstColorCounts.join('+') + '=' + answer + '이므로 모두 ' + answer + '가지입니다.'
        ];
      }
      case 16: {
        var remainderSum = sum(meta.remainders);
        return [
          '네 수의 합을 묶으면 「앞의 두 수의 합」+「뒤의 두 수의 합」입니다.',
          '각 묶음을 ' + meta.divisor + '로 나눈 나머지가 ' + meta.remainders[0] + '과 ' + meta.remainders[1] + '이므로 나머지끼리 더하면 ' + meta.remainders[0] + '+' + meta.remainders[1] + '=' + remainderSum + '입니다.',
          remainderSum + '=' + meta.divisor + '×' + Math.floor(remainderSum / meta.divisor) + '+' + answer + '이므로 다시 ' + meta.divisor + '로 나눈 나머지는 ' + answer + '입니다.'
        ];
      }
      case 17:
        return [
          '처음 피자는 1조각입니다. 최대일 때 새 칼집은 앞의 모든 칼집과 피자 안의 서로 다른 점에서 만나므로 늘어나는 조각은 1, 2, 3, …, ' + meta.lineCount + '개입니다.',
          '최대 조각 수는 1+(1+2+…+' + meta.lineCount + ')=1+' + (meta.lineCount * (meta.lineCount + 1) / 2) + '=' + meta.maximum + '개입니다.',
          '최소일 때는 직선의 연장선끼리 만나는 점을 모두 피자 밖에 두어, 피자 안에서는 새 칼집이 앞 칼집과 만나지 않게 합니다. 그러면 한 칼집마다 1조각만 늘어 ' + meta.lineCount + '+1=' + meta.minimum + '개입니다.',
          '따라서 ' + meta.maximum + '+' + meta.minimum + '=' + answer + '개입니다.'
        ];
      case 18:
        if (meta.cutPattern === 'mid-cross') return [
          '보기의 한 세트는 ' + meta.foldDirectionLabels.join(' → ') + '의 두 번 접기입니다. 이를 두 번 반복하므로 2×2=' + meta.totalHalfFolds + '번 반으로 접습니다.',
          '접은 순서의 반대로 네 번 펼치면 가운데 +자 절단선이 가로 4줄과 세로 4줄로 복사됩니다.',
          '가로 4줄은 5칸을, 세로 4줄도 5칸을 만들므로 5×5=' + answer + '조각입니다.'
        ];
        if (meta.cutPattern === 'single-diagonal') return [
          '보기의 한 세트는 ' + meta.foldDirectionLabels.join(' → ') + '의 두 번 접기입니다. 이를 두 번 반복하므로 2×2=' + meta.totalHalfFolds + '번 반으로 접습니다.',
          '한 대각선 자국을 접은 순서의 반대로 펼칠 때마다 거울처럼 뒤집어 복사하면 4×4 칸에 대각선이 번갈아 이어집니다.',
          '펼친 그림에서 위 가장자리 4조각, 안쪽 4조각, 아래 가장자리 4조각이므로 4+4+4=' + answer + '조각입니다.'
        ];
        return [
          '보기의 한 세트는 ' + meta.foldDirectionLabels.join(' → ') + '의 두 번 접기입니다. 이를 두 번 반복하므로 2×2=' + meta.totalHalfFolds + '번 반으로 접습니다.',
          '접힌 정사각형의 두 대각선 자국을 접은 순서의 반대로 펼칠 때마다 거울처럼 뒤집어 복사하면 4×4 모든 칸에 엑스가 생깁니다.',
          '펼친 그림의 바깥쪽 18조각, 반대쪽 18조각, 가운데 4조각을 더하면 18+18+4=' + answer + '조각입니다.'
        ];
      case 19: {
        var moves = [1];
        while (moves.length < meta.disks) moves.push(moves[moves.length - 1] * 2 + 1);
        return [
          '원반 ' + meta.disks + '개를 옮기려면 위의 ' + (meta.disks - 1) + '개를 빈 기둥으로 옮기고, 가장 큰 원반을 1번 옮긴 뒤, 다시 ' + (meta.disks - 1) + '개를 그 위로 옮깁니다.',
          '따라서 원반이 하나 늘 때의 최소 횟수는 「앞 횟수×2+1」입니다.',
          '1개부터 ' + meta.disks + '개까지 최소 횟수는 ' + moves.join(' → ') + '이므로 답은 ' + answer + '번입니다.'
        ];
      }
      case 20:
        if (meta.activeCuts === 2) return [
          '문제는 전체 여섯 번의 계획 중 현재까지 끝낸 ' + meta.activeCuts + '번의 절단만 묻습니다.',
          '첫 절단은 1조각을 2조각으로 만듭니다. 두 번째 절단은 첫 절단면과 중심에서 만나 두 조각을 모두 가르므로 2→4조각입니다.',
          '따라서 현재 조각 수는 ' + answer + '개입니다.'
        ];
        if (meta.activeCuts === 3) return [
          '문제는 전체 여섯 번의 계획 중 현재까지 끝낸 ' + meta.activeCuts + '번의 절단만 묻습니다.',
          '첫 두 절단 뒤에는 1→2→4조각입니다. 세 번째 절단면은 중심을 지나 그 4조각을 각각 한 번씩 갈라 4+4=8조각이 됩니다.',
          '따라서 현재 조각 수는 ' + answer + '개입니다.'
        ];
        return [
          '세 쌍의 마주 보는 면에서 대각선을 이은 절단을 두 번씩 하므로 3×2=6번 자릅니다.',
          '각 면은 두 대각선으로 4개의 삼각형으로 나뉩니다. 중심에서 뻗은 한 조각은 겉면의 삼각형 하나와 짝을 이루므로 한 면마다 4조각입니다.',
          '면이 6개이므로 6×4=' + answer + '조각입니다.'
        ];
      case 21:
        return q21Steps(meta);
      case 22: {
        var totalFormula = (meta.cols * (meta.cols + 1) / 2) * (meta.rows * (meta.rows + 1) / 2);
        var firstCount = rectContaining(meta.cols, meta.rows, meta.markers[0]);
        var secondCount = rectContaining(meta.cols, meta.rows, meta.markers[1]);
        var bothCount = rectContainingBoth(meta.cols, meta.rows, meta.markers[0], meta.markers[1]);
        return [
          '전체 직사각형은 세로선 ' + (meta.cols + 1) + '개 중 2개, 가로선 ' + (meta.rows + 1) + '개 중 2개를 고르므로 (' + (meta.cols + 1) + '×' + meta.cols + '÷2)×(' + (meta.rows + 1) + '×' + meta.rows + '÷2)=' + totalFormula + '개입니다.',
          '별 한 칸을 포함하려면 네 경계선을 고르는 수가 (' + (meta.markers[0][0] + 1) + '×' + (meta.cols - meta.markers[0][0]) + ')×(' + (meta.markers[0][1] + 1) + '×' + (meta.rows - meta.markers[0][1]) + ')=' + firstCount + '개입니다. 삼각형도 같은 방법으로 (' + (meta.markers[1][0] + 1) + '×' + (meta.cols - meta.markers[1][0]) + ')×(' + (meta.markers[1][1] + 1) + '×' + (meta.rows - meta.markers[1][1]) + ')=' + secondCount + '개입니다.',
          '별과 삼각형을 모두 포함한 것은 두 칸을 감싸는 가장 작은 범위를 기준으로 (' + (Math.min(meta.markers[0][0], meta.markers[1][0]) + 1) + '×' + (meta.cols - Math.max(meta.markers[0][0], meta.markers[1][0])) + ')×(' + (Math.min(meta.markers[0][1], meta.markers[1][1]) + 1) + '×' + (meta.rows - Math.max(meta.markers[0][1], meta.markers[1][1])) + ')=' + bothCount + '개입니다. 이 수는 두 번 빠졌으므로 한 번 다시 더합니다.',
          totalFormula + '−' + firstCount + '−' + secondCount + '+' + bothCount + '=' + answer + '개입니다. 이 유형이 어려우면 자료실의 「도형의 개수」에서 선 두 개를 골라 직사각형을 세는 방법을 다시 확인합니다.'
        ];
      }
      case 23: {
        var order = q23DayOrder(meta);
        return [
          '사람 단서부터 표에 넣습니다. 수요일은 ' + order.people[2] + ', 그 바로 전날인 화요일은 ' + order.people[1] + ', 그보다 앞선 월요일은 ' + order.people[0] + '입니다.',
          '남은 목·금요일에서 ' + order.people[4] + '의 바로 전날이 ' + order.people[3] + '이므로 사람 순서는 월~금 ' + order.people.join(' → ') + '입니다.',
          '운동은 수요일 ' + order.sports[2] + ', 금요일 ' + order.sports[4] + '입니다. ' + order.sports[0] + '는 화·목요일이 아니고 바로 다음 날이 ' + order.sports[1] + '이므로 월요일 ' + order.sports[0] + ', 화요일 ' + order.sports[1] + '입니다.',
          '남은 목요일 운동은 ' + order.sports[3] + '입니다. 따라서 답은 ' + meta.target + ', 목요일, ' + meta.targetSport + '입니다.'
        ];
      }
      case 24:
        return [
          '거듭제곱을 한 단계씩 계산하고 일의 자리만 쓰면 ' + meta.unitsCycle.join(' → ') + '이 반복됩니다.',
          '반복마디 길이는 ' + meta.unitsCycle.length + '이고, ' + meta.exponent + '÷' + meta.unitsCycle.length + '의 나머지는 ' + meta.cycleRemainder + '입니다.',
          meta.cycleRemainder === 0
            ? '나머지가 0이므로 반복마디의 마지막 수를 고릅니다. 그 수가 ' + answer + '이므로 답은 ' + answer + '입니다.'
            : '나머지가 ' + meta.cycleRemainder + '이므로 반복마디의 ' + meta.cyclePosition + '번째 수를 고릅니다. 그 수는 ' + answer + '입니다.'
        ];
      case 25: {
        var groups = meta.quotientGroups;
        return [
          '세 자리 수를 ' + meta.divisor + '×몫+나머지로 놓습니다. 나머지는 몫보다 크고 ' + meta.divisor + '보다 작아야 합니다.',
          '세 자리 수가 되는 첫 몫은 ' + groups[0].quotient + ', 가능한 마지막 몫은 ' + groups[groups.length - 1].quotient + '입니다. 예를 들어 몫 ' + groups[0].quotient + '에서는 나머지가 ' + groups[0].firstRemainder + '부터 ' + groups[0].lastRemainder + '까지여서 ' + groups[0].count + '개입니다.',
          '몫별 가능한 개수는 ' + groups.map(function (row) { return row.quotient + '→' + row.count; }).join(', ') + '입니다.',
          groups.map(function (row) { return row.count; }).join('+') + '=' + answer + '이므로 모두 ' + answer + '개입니다.'
        ];
      }
      case 26: {
        var childMin = Math.ceil(meta.minimumGenerationGap / (meta.fatherMultiplier - 1));
        var childMax = Math.floor(99 / meta.grandfatherMultiplier);
        var checks = [];
        for (var age = childMin; age <= childMax; age++) {
          var grandfather = age * meta.grandfatherMultiplier;
          var father = age * meta.fatherMultiplier;
          var reversed = Number(String(grandfather).split('').reverse().join('')) === father;
          checks.push(age + '살→' + grandfather + '/' + father + (reversed ? '○' : '×'));
        }
        var matches = meta.matches.map(function (row) { return row.join(', '); });
        var conditionLabel = meta.additionalCondition === 'childAge<10'
          ? meta.childName + '이 10살 미만'
          : meta.additionalCondition === 'grandfatherAge>=70'
            ? '할아버지가 70살 이상'
            : meta.additionalCondition;
        var lastStep = meta.additionalCondition === 'none'
          ? '추가 조건이 없으므로 ' + matches.join(' 또는 ') + ' 중 한 가지만 할아버지, 아버지, ' + meta.childName + ' 순서로 쓰면 됩니다.'
          : '추가 조건 「' + conditionLabel + '」까지 적용하면 ' + matches[0] + ' 한 조합만 남습니다.';
        return [
          meta.childName + '의 나이를 □살이라 하면 할아버지는 ' + meta.grandfatherMultiplier + '×□, 아버지는 ' + meta.fatherMultiplier + '×□살입니다. 세대 차가 ' + meta.minimumGenerationGap + '살 이상이고 할아버지가 두 자리이므로 □는 ' + childMin + '~' + childMax + '만 확인하면 됩니다.',
          '각 나이를 넣어 할아버지 나이의 자리를 뒤집어 아버지 나이가 되는지 확인합니다: ' + checks.join(', ') + '입니다.',
          '기본 조건을 만족하는 조합은 63, 36, 9와 84, 48, 12입니다.',
          lastStep
        ];
      }
      case 27:
        return [
          '자동차가 완전히 가려진 순간부터 다시 보일 때까지 필요한 상대 이동 거리는 기차 길이−자동차 길이=' + meta.trainLength + '−' + meta.carLength + '=' + meta.hiddenTravelDistance + '미터입니다.',
          '서로 반대 방향으로 움직이므로 상대속력은 ' + meta.carSpeed + '+' + meta.trainSpeed + '=' + meta.relativeSpeed + '미터/분입니다.',
          '걸린 시간은 ' + meta.hiddenTravelDistance + '÷' + meta.relativeSpeed + '=' + answer + '분입니다.'
        ];
      case 28:
        return [
          '한 시간이 ' + meta.hourMinutes + '분이므로 분침 속력은 360÷' + meta.hourMinutes + '=' + meta.minuteHandDegreesPerMinute + '도/분입니다.',
          '두 바늘의 상대속력은 ' + meta.chaseAngle + '÷' + meta.chaseMinutes + '=' + meta.relativeDegreesPerMinute + '도/분입니다. 따라서 시침 속력은 ' + meta.minuteHandDegreesPerMinute + '−' + meta.relativeDegreesPerMinute + '=' + meta.derivedHourHandDegreesPerMinute + '도/분입니다.',
          '시침 한 바퀴는 360÷' + meta.derivedHourHandDegreesPerMinute + '=' + meta.hourHandTurnMinutes + '분, 이 시계로는 ' + meta.hourHandTurnMinutes + '÷' + meta.hourMinutes + '=' + meta.dialHours + '시간입니다.',
          '하루 동안 시침이 ' + meta.dayHourHandTurns + '바퀴 도므로 ' + meta.dialHours + '×' + meta.dayHourHandTurns + '=' + answer + '시간입니다.'
        ];
      case 29:
        return [
          '맨 앞자리에는 0을 놓을 수 없습니다. 0이 아닌 숫자의 합은 ' + meta.digits.filter(function (digit) { return digit !== 0; }).join('+') + '=' + meta.nonzeroDigitSum + '이고, 만들 수 있는 수는 2×3×3×3×3=' + meta.numberCount + '개입니다.',
          '맨 앞 숫자 하나를 정하면 뒤 네 자리에 3가지씩 놓으므로 각 0이 아닌 숫자는 맨 앞에 3⁴=' + meta.leadingCountPerNonzeroDigit + '번 나옵니다. 맨 앞자리의 합 기여는 ' + meta.nonzeroDigitSum + '×' + meta.leadingCountPerNonzeroDigit + '×10,000=' + formatNumber(meta.leadingContribution) + '입니다.',
          '다른 한 자리를 한 숫자로 정하면 맨 앞 2가지와 남은 세 자리 3가지씩이므로 2×3³=' + meta.otherPositionCountPerDigit + '번 나옵니다. 네 자리의 합 기여는 ' + meta.nonzeroDigitSum + '×' + meta.otherPositionCountPerDigit + '×(1,000+100+10+1)=' + formatNumber(meta.otherContribution) + '입니다.',
          formatNumber(meta.leadingContribution) + '+' + formatNumber(meta.otherContribution) + '=' + formatNumber(Number(answer)) + '입니다.'
        ];
      case 30: {
        var examples = meta.examples.map(function (row) {
          var leftTens = Math.floor(row.left / 10);
          var rightUnits = row.right % 10;
          return row.left + '−' + row.right + '=' + row.difference + '이고 ' + leftTens + '·' + row.difference + '·' + rightUnits + ' 순서로 이어 쓰면 ' + row.bottom;
        });
        var targetTens = Math.floor(meta.target.left / 10), targetUnits = meta.target.right % 10;
        return [
          '첫 예시는 ' + examples[0] + '입니다.',
          '둘째와 셋째도 각각 ' + examples[1] + ', ' + examples[2] + '로 같은 규칙이 맞습니다.',
          '물음표 원은 ' + meta.target.left + '−' + meta.target.right + '=' + meta.target.difference + '입니다. 왼쪽 수의 십의 자리·차·오른쪽 수의 일의 자리 순서의 세 값은 ' + targetTens + '·' + meta.target.difference + '·' + targetUnits + '입니다.',
          '이어 쓴 수는 ' + targetTens + '' + meta.target.difference + '' + targetUnits + '이므로 답은 ' + answer + '입니다.'
        ];
      }
      default:
        return Array.isArray(question.solutionSteps) ? question.solutionSteps.slice() : [];
    }
  }

  function enrich(question) {
    var enriched = Object.assign({}, question, { solutionSteps: solutionSteps(question) });
    if (Number(question.sourceNo) === 7) enriched.solutionAsset = drawNumberLineSolution(question.meta);
    if (Number(question.sourceNo) === 18) enriched.solutionAsset = drawFoldSolution(question.meta);
    return enriched;
  }

  global.BANK_FINAL1_SOLUTIONS = Object.freeze({
    version: VERSION,
    enrich: enrich
  });
})(window);
