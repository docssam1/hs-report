/* 승급과정 4-1 일일테스트 유사문제 생성기 (브라우저·Node 공용)
   시험지 9문제 × 낮춰서/같은 수준/높여서. 규칙에 따라 매번 새 문제를 만들고,
   서로 다른 두 방법(A·B)으로 정답을 계산해 일치할 때만 내보낸다. 일치하지 않으면 그 문제는 버리고 다시 만든다.
   난이도 규칙: 낮춰서 = 수의 범위를 줄임 / 같은 수준 = 원본과 같은 범위·조건 / 높여서 = 범위를 늘리거나 조건을 하나 더함. */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 난수 (같은 생성 번호면 같은 문제) */
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
    return {
      float: f,
      int: function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); },
      pick: function (a) { return a[Math.floor(f() * a.length)]; },
      shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    };
  }
  function Retry(msg) { this.message = msg || 'retry'; }
  function fail(msg) { throw new Retry(msg); }
  function must(cond, msg) { if (!cond) fail(msg); }
  function mismatch(msg) { var e = new Error('검산 불일치: ' + msg); e.mismatch = true; throw e; }

  /* ---------------------------------------------------------------- 조사 */
  function hasFinal(word) {
    var ch = word.charCodeAt(word.length - 1);
    return ch >= 0xAC00 && ch <= 0xD7A3 && (ch - 0xAC00) % 28 !== 0;
  }
  function eun(w) { return w + (hasFinal(w) ? '은' : '는'); }
  function numFinal(n) { return '013678'.indexOf(String(n).slice(-1)) >= 0; }
  function numEun(n) { return n + (numFinal(n) ? '은' : '는'); }
  function numI(n) { return n + (numFinal(n) ? '이' : '가'); }
  function numEul(n) { return n + (numFinal(n) ? '을' : '를'); }
  function numGwa(n) { return n + (numFinal(n) ? '과' : '와'); }

  /* ---------------------------------------------------------------- 한글 수 읽기 */
  var DIG = '영일이삼사오육칠팔구';
  function groupKo(g) {
    var out = '', parts = [[1000, '천'], [100, '백'], [10, '십']];
    for (var i = 0; i < parts.length; i++) {
      var d = Math.floor(g / parts[i][0]); g -= d * parts[i][0];
      if (d) out += (d === 1 ? '' : DIG[d]) + parts[i][1];
    }
    if (g) out += DIG[g];
    return out;
  }
  function readKo(n) {
    var parts = [], rest = n, units = [[1e12, '조'], [1e8, '억'], [1e4, '만']];
    for (var i = 0; i < units.length; i++) {
      var g = Math.floor(rest / units[i][0]); rest -= g * units[i][0];
      if (g) parts.push((g === 1 && units[i][1] === '만' ? '' : groupKo(g)) + units[i][1]);
    }
    if (rest) parts.push(groupKo(rest));
    return parts.join(' ');
  }
  function parseKo(s) {
    var total = 0, chunks = s.split(' ');
    for (var c = 0; c < chunks.length; c++) {
      var chunk = chunks[c], mult = 1, units = [[1e12, '조'], [1e8, '억'], [1e4, '만']];
      for (var u = 0; u < units.length; u++) {
        if (chunk.charAt(chunk.length - 1) === units[u][1]) { mult = units[u][0]; chunk = chunk.slice(0, -1); break; }
      }
      var val = 0, cur = 0, chars = chunk === '' ? '일' : chunk;
      for (var i = 0; i < chars.length; i++) {
        var ch = chars.charAt(i), di = DIG.indexOf(ch);
        if (di > 0) cur = di;
        else if (ch === '천' || ch === '백' || ch === '십') { val += (cur || 1) * ({ '천': 1000, '백': 100, '십': 10 })[ch]; cur = 0; }
      }
      val += cur;
      total += (val || 1) * mult;
    }
    return total;
  }
  var PLACES = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조', '천조'];
  var UNIT_NAME = { 1e12: '1조', 1e11: '1000억', 1e10: '100억', 1e9: '10억', 1e8: '1억', 1e7: '1000만', 1e6: '100만', 1e5: '10만', 1e4: '1만', 1000: '1000', 100: '100', 10: '10', 1: '1' };

  function sumPairs(list) { var s = 0; for (var i = 0; i < list.length; i++) s += list[i][0] * list[i][1]; return s; }

  /* ================================================================ S1-1 단위별 개수로 나타낸 수 */
  function g_u1_1(level, R) {
    var plan = {
      lower: { units: [1e6, 1e5, 1e4, 1000, 100, 10, 1], k: 4, max: [9, 40, 60, 90, 90, 90, 90] },
      same: { units: [1e9, 1e8, 1e5, 1e4, 1000, 1], k: 6, max: [4, 80, 99, 999, 999, 999] },
      higher: { units: [1e12, 1e8, 1e7, 1e5, 1e4, 1000, 1], k: 6, max: [9, 9999, 99, 99, 9999, 9999, 999] }
    }[level];
    var idx = R.shuffle(plan.units.map(function (_, i) { return i; })).slice(0, plan.k).sort(function (a, b) { return a - b; });
    var parts = idx.map(function (i) { return [plan.units[i], R.int(1, Math.max(2, plan.max[i]))]; });
    var hide = R.int(level === 'lower' ? 0 : 1, parts.length - 1);
    var n = sumPairs(parts);
    var uh = parts[hide][0], ch = parts[hide][1];
    var rest = 0, others = [];
    parts.forEach(function (p, i) { if (i !== hide) { rest += p[0] * p[1]; others.push(p[0] * p[1]); } });
    var a = (n - rest) / uh;                               // 방법 A: 합계 − 나머지
    var b = (n - others.reduce(function (x, y) { return x + y; }, 0)) / uh;   // 방법 B: 단위별 값으로 복원
    if (a !== ch || b !== ch || a !== Math.floor(a)) mismatch('u1-1');
    var names = parts.map(function (p, i) { return UNIT_NAME[p[0]] + (p[0] === 1e12 ? '가 ' : '이 ') + (i === hide ? '(      )' : p[1]) + '개'; });   // 1조가 / 10억이
    return {
      text: numEun(n) + ' ' + names.join(', ') + '인 수입니다. 빈칸에 알맞은 수를 쓰세요.', answer: String(ch),
      steps: [n + ' = ' + parts.map(function (p) { return UNIT_NAME[p[0]] + '×' + p[1]; }).join(' + ') + ' 입니다.',
        '빈칸을 뺀 나머지 값의 합은 ' + rest + '이므로, 빈칸이 나타내는 값은 ' + n + ' − ' + rest + ' = ' + (n - rest) + '입니다.',
        UNIT_NAME[uh] + '이 ' + ch + '개이므로 빈칸에 알맞은 수는 ' + ch + '입니다.'],
      check: '합계 역산과 단위별 값 복원이 일치'
    };
  }

  /* ================================================================ S1-2 단위 환산과 숫자가 나타내는 값 */
  function digitValuesString(s, d) { var out = [], L = s.length; for (var i = 0; i < L; i++) if (s.charAt(i) === d) out.push(Number(d) * Math.pow(10, L - 1 - i)); return out; }
  function g_u1_2(level, R) {
    var pool = {
      lower: [['소리', 340], ['여객기', 250], ['우주선', 7800], ['초음속 비행기', 600], ['고속열차', 90], ['물속의 소리', 1500], ['쾌속선', 40], ['인공위성', 7600], ['제트기', 280]],
      same: [['빛', 299790000], ['전파', 300000000], ['빛', 299790000]],
      higher: [['빛', 299790000], ['전파', 300000000]]
    }[level];
    var sp = R.pick(pool), obj = sp[0], v = sp[1];
    var t = level === 'lower' ? R.int(10, 3000) : (level === 'same' ? R.int(20, 1500) : R.int(20, 4000));
    var meters = v * t;
    must(meters % 1000 === 0, 'km');
    var km = meters / 1000, s = String(km);
    must(km >= 100, 'small');
    var mode = level === 'higher' ? 'sum' : 'one';
    var cands = [];
    for (var d = 1; d <= 9; d++) {
      var ds = String(d), cnt = s.split(ds).length - 1;
      if ((mode === 'one' && cnt === 1) || (mode === 'sum' && cnt >= 2)) cands.push(ds);
    }
    must(cands.length > 0, 'digit');
    var dd = R.pick(cands);
    var placesB = digitValuesString(s, dd), placesA = [];
    for (var p = 0; p < s.length; p++) if (Math.floor(km / Math.pow(10, p)) % 10 === Number(dd)) placesA.push(Number(dd) * Math.pow(10, p));
    if (placesA.slice().sort().join() !== placesB.slice().sort().join() || !placesA.length) mismatch('u1-2');
    var ans, q, last;
    if (mode === 'one') { ans = placesA[0]; q = '숫자 ' + numI(dd) + ' 나타내는 값은 얼마입니까?'; last = km + '에서 숫자 ' + numEun(dd) + ' ' + numEul(ans) + ' 나타냅니다.'; }
    else {
      ans = placesA.reduce(function (x, y) { return x + y; }, 0);
      q = '숫자 ' + numI(dd) + ' 나타내는 값을 모두 더하면 얼마입니까?';
      last = '숫자 ' + numI(dd) + ' 나타내는 값은 ' + placesA.slice().sort(function (x, y) { return y - x; }).join(', ') + '이므로 합은 ' + ans + '입니다.';
    }
    return {
      text: eun(obj) + ' 1초에 약 ' + v + 'm를 갑니다. ' + t + '초 동안 간 거리를 km 단위로 나타냈을 때 ' + q, answer: String(ans),
      steps: [t + '초 동안 간 거리는 ' + v + '×' + t + ' = ' + meters + 'm입니다.', '1km = 1000m이므로 ' + meters + 'm = ' + km + 'km입니다.', last],
      check: '수식 방법과 문자열 방법의 자리값이 일치'
    };
  }

  /* ================================================================ S1-3 □가 있는 수의 크기 비교 */
  function interval(p) {
    return [Number(p.replace(/□/g, '0')), Number(p.replace(/□/g, '9'))];
  }
  /* 같은 자리 수인 두 수는 '맨 앞부터 같은 숫자가 이어지다 처음 달라지는 자리'에서 크기가 정해지므로, 그 자리보다 앞에는 □를 두지 않는다. */
  function mkPattern(R, prefix, length, density) {
    var s = prefix;
    while (s.length < length) s += R.float() < density ? '□' : String(R.int(0, 9));
    return s;
  }
  function g_u1_3(level, R) {
    var pats = [];
    function digitNot(not) { var d; do { d = R.int(1, 9); } while (not.indexOf(d) >= 0); return d; }
    if (level === 'lower') {
      var lens = R.shuffle([4, 5, 6]).slice(0, 3);
      lens.forEach(function (L) { pats.push(mkPattern(R, String(R.int(1, 9)), L, 0.45)); });
    } else if (level === 'same') {
      var L = R.int(7, 8), p = 2, base = String(R.int(1, 8)) + String(R.int(0, 9));
      var a = R.int(0, 8), b = R.int(a + 1, 9);
      pats.push(mkPattern(R, base + String(a), L, 0.55));
      pats.push(mkPattern(R, base + String(b), L, 0.55));
      pats.push(mkPattern(R, String(base.charAt(0)) + String(R.int(0, 9)), L - 2, 0.5));
      pats.push(mkPattern(R, String(R.int(Number(base.charAt(0)) + 1, 9)), L, 0.65));
      must(Number(base.charAt(0)) < 9, 'lead');
    } else {
      var L2 = R.int(8, 9), base3 = String(R.int(1, 8)) + String(R.int(0, 9)) + String(R.int(0, 9));
      var ds = R.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      ds.forEach(function (d) { pats.push(mkPattern(R, base3 + String(d), L2, 0.55)); });
      pats.push(mkPattern(R, base3 + String(R.int(0, 9)), L2 - 1, 0.5));
      pats.push(mkPattern(R, String(R.int(Number(base3.charAt(0)) + 1, 9)), L2 - 1, 0.6));
      must(Number(base3.charAt(0)) < 9, 'lead');
    }
    pats = R.shuffle(pats);
    var marks = 'ㄱㄴㄷㄹㅁ';
    var iv = pats.map(interval);
    var idx = pats.map(function (_, i) { return i; });
    var orderA = idx.slice().sort(function (x, y) { return iv[y][0] - iv[x][0]; });
    for (var i = 0; i + 1 < orderA.length; i++) must(iv[orderA[i]][0] > iv[orderA[i + 1]][1], 'order');
    // 방법 B: 무작위 대입 3000회
    for (var t = 0; t < 3000; t++) {
      var vals = pats.map(function (p) { return Number(p.replace(/□/g, function () { return String(Math.floor(R.float() * 10)); })); });
      var ord = idx.slice().sort(function (x, y) { return vals[y] - vals[x]; });
      for (var k = 0; k < ord.length; k++) if (ord[k] !== orderA[k]) mismatch('u1-3');
    }
    var ans = orderA.map(function (i) { return marks.charAt(i); }).join(' > ');
    var body = pats.map(function (p, i) { return marks.charAt(i) + '  ' + p; }).join('\n');
    var steps = ['자리 수가 많은 수가 더 큽니다. 자리 수가 같으면 높은 자리부터 차례로 숫자를 비교합니다. □에 어떤 숫자가 들어가도 크기가 달라지지 않는 자리에서 비교해야 합니다.'];
    for (var j = 0; j + 1 < orderA.length; j++) {
      var x = orderA[j], y = orderA[j + 1], px = pats[x], py = pats[y];
      if (px.length !== py.length) steps.push(marks.charAt(x) + '은 ' + px.length + '자리, ' + marks.charAt(y) + '은 ' + py.length + '자리이므로 ' + marks.charAt(x) + ' > ' + marks.charAt(y) + '입니다.');
      else {
        var pos = 0; while (px.charAt(pos) === py.charAt(pos)) pos++;
        steps.push(marks.charAt(x) + '과 ' + marks.charAt(y) + '은 ' + (pos ? '앞 ' + pos + '자리(' + px.slice(0, pos) + ')가 같고 ' : '') + (pos + 1) + '번째 자리에서 ' + px.charAt(pos) + ' > ' + py.charAt(pos) + '이므로 ' + marks.charAt(x) + ' > ' + marks.charAt(y) + '입니다.');
      }
    }
    steps.push('따라서 큰 수부터 차례로 쓰면 ' + ans + '입니다.');
    return {
      text: '□ 안에는 0부터 9까지의 숫자 중에서 어떤 숫자를 넣어도 됩니다. ' + pats.length + '개의 수의 크기를 비교하여 큰 수부터 차례로 기호를 쓰세요.\n' + body,
      answer: ans, steps: steps, check: '구간 분리와 무작위 대입 3000회가 일치'
    };
  }

  /* ================================================================ S1-4 뛰어 세기 */
  function g_u1_4(level, R) {
    var start, step, jumps, ask;
    if (level === 'lower') { start = R.int(30, 3000) * 100000; step = R.int(2, 90) * 1000000; jumps = R.int(2, 3); ask = jumps + R.int(1, 3); }
    else if (level === 'same') { start = R.int(2, 9) * 1e12 + R.int(0, 99) * 1e10; step = R.int(5, 99) * 1e10; jumps = R.int(2, 4); ask = jumps + R.int(1, 3); }
    else { start = R.int(20, 90) * 1e12 + R.int(0, 99) * 1e10; step = R.int(10, 99) * 1e10 + R.int(0, 9) * 1e8; jumps = R.int(3, 5); ask = jumps + R.int(2, 4); }
    must(start % 1e5 === 0 && step % 1e5 === 0, 'unit');
    var after = start + jumps * step, res = start + ask * step;
    must(res < 9e14, 'big');
    // 방법 B: 읽은 말을 다시 수로
    if (parseKo(readKo(start)) !== start || parseKo(readKo(after)) !== after || parseKo(readKo(res)) !== res) mismatch('u1-4 read');
    if ((parseKo(readKo(after)) - parseKo(readKo(start))) / jumps !== step) mismatch('u1-4 step');
    return {
      text: readKo(start) + '에서 ' + jumps + '번 뛰어 센 수가 ' + readKo(after) + '입니다. 같은 규칙으로 ' + readKo(start) + '에서 ' + ask + '번 뛰어 센 수를 읽어 보세요.',
      answer: readKo(res),
      steps: [readKo(start) + ' = ' + start + ', ' + readKo(after) + ' = ' + after + '입니다.',
        jumps + '번 뛰어 세어 ' + after + ' − ' + start + ' = ' + (after - start) + '만큼 커졌으므로 한 번에 ' + step + '씩 뛰어 센 것입니다.',
        ask + '번 뛰어 세면 ' + start + ' + ' + step + '×' + ask + ' = ' + res + '이고, 읽으면 ' + readKo(res) + '입니다.'],
      check: '수 계산과 읽기·되읽기 변환이 일치'
    };
  }

  /* ================================================================ S2-1 이어 붙인 수의 마지막 세 자리 */
  function g_u2_1(level, R) {
    var n = level === 'lower' ? R.int(20, 189) : (level === 'same' ? R.int(190, 2800) : R.int(2900, 6000));
    var rem = n, width = 1, first = 1, cnt = 9;
    while (rem > width * cnt) { rem -= width * cnt; width++; first *= 10; cnt *= 10; }
    var full = Math.floor(rem / width), extra = rem % width, lastFull = first + full - 1;
    var before = ''; for (var x = Math.max(1, lastFull - 3); x <= lastFull; x++) before += x;
    var tailA = (before + (extra ? String(lastFull + 1).slice(0, extra) : '')).slice(-3);
    var s = ''; for (var i = 1; s.length < n + 10; i++) s += i;
    var tailB = s.slice(0, n).slice(-3);
    if (tailA !== tailB) mismatch('u2-1');
    var steps = ['한 자리 수 1~9는 9개로 9자리, 두 자리 수 10~99는 90개로 180자리입니다.'];
    if (width >= 3) steps.push('세 자리 수 100~999는 900개로 2700자리입니다.');
    if (width === 4) steps.push('1부터 999까지 쓰면 9 + 180 + 2700 = 2889자리입니다.');
    steps.push((n - rem) + '자리까지 쓴 뒤 ' + rem + '자리가 더 필요하고, ' + width + '자리 수를 ' + full + '개 쓰면 ' + lastFull + '까지이고' +
      (extra ? ' ' + extra + '자리가 남아 ' + (lastFull + 1) + '의 앞 ' + extra + '자리(' + String(lastFull + 1).slice(0, extra) + ')까지 씁니다.' : ' 남는 자리가 없습니다.'));
    steps.push('마지막 세 자리는 ' + tailA + '입니다.');
    return {
      text: '다음은 1부터 자연수를 차례로 계속해서 붙여 써서 ' + n + '자리 수를 만든 것입니다. 이때 마지막 세 자리 수 □□□는 얼마입니까?\n12345678910111…□□□',
      answer: tailA, steps: steps, check: '구간 계산과 실제 이어 붙인 수가 일치'
    };
  }

  /* ================================================================ S2-2 범위 안에서 자리 조건을 만족하는 수의 개수 */
  function g_u2_2(level, R) {
    var a, b, cond;
    if (level === 'lower') { a = R.int(1000, 8000); b = a + R.int(150, 450); cond = 'eq'; }
    else if (level === 'same') { a = R.int(100000, 900000); b = a + R.int(300, 1700); cond = 'eq'; }
    else { a = R.int(100000, 900000); b = a + R.int(1000, 3000); cond = R.pick(['eq_gt', 'eq_lt']); }
    function ok(n) { var t = Math.floor(n / 10) % 10, h = Math.floor(n / 100) % 10, o = n % 10; return t === h && (cond === 'eq' || (cond === 'eq_gt' && o > t) || (cond === 'eq_lt' && o < t)); }
    var cntA = 0, groups = {};
    for (var n = a + 1; n < b; n++) if (ok(n)) { cntA++; var g = Math.floor(n / 1000); groups[g] = (groups[g] || 0) + 1; }
    var cntB = 0;
    for (var pre = Math.floor(a / 1000); pre <= Math.floor(b / 1000); pre++) for (var h = 0; h < 10; h++) for (var o = 0; o < 10; o++) {
      var m = pre * 1000 + h * 100 + h * 10 + o; if (m > a && m < b && ok(m)) cntB++;
    }
    if (cntA !== cntB) mismatch('u2-2');
    must(cntA >= 10, 'few');
    var tail = { eq: '수는', eq_gt: '일의 자리 수가 십의 자리 수보다 큰 수는', eq_lt: '일의 자리 수가 십의 자리 수보다 작은 수는' }[cond];
    var steps = [(a + 1) + '부터 ' + (b - 1) + '까지의 수에서 백의 자리와 십의 자리가 같은 수를 천의 자리 이상이 같은 묶음별로 세어 봅니다.',
      Object.keys(groups).sort(function (x, y) { return x - y; }).map(function (k) { return k + '□□□ 묶음 ' + groups[k] + '개'; }).join(', ') + '입니다.',
      '모두 더하면 ' + cntA + '개입니다.'];
    return {
      text: a + '보다 크고 ' + b + '보다 작은 자연수 중에서 십의 자리와 백의 자리 수가 같' + (cond === 'eq' ? '은 ' : '고, ') + tail + ' 모두 몇 개입니까?',
      answer: String(cntA), steps: steps, check: '하나씩 검사와 조합 생성 세기가 일치'
    };
  }

  /* ================================================================ S2-3 수 카드로 만든 k번째로 큰 수 */
  function factorial(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }
  function distinctPermsDesc(cards) {
    var out = [], sorted = cards.slice().sort(function (x, y) { return x - y; });
    (function rec(rest, cur) {
      if (!rest.length) { if (cur[0] !== 0) out.push(cur.join('')); return; }
      for (var i = 0; i < rest.length; i++) { if (i && rest[i] === rest[i - 1]) continue; rec(rest.slice(0, i).concat(rest.slice(i + 1)), cur.concat(rest[i])); }
    })(sorted, []);
    return out.sort().reverse();
  }
  function kthLargestCount(counter, k) {
    var total = 0, key; for (key in counter) total += counter[key];
    var cnt = {}; for (key in counter) cnt[key] = counter[key];
    var digits = [], remaining = k;
    for (var pos = 0; pos < total; pos++) {
      var ds = Object.keys(cnt).map(Number).sort(function (x, y) { return y - x; });
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i];
        if (cnt[d] === 0 || (pos === 0 && d === 0)) continue;
        cnt[d]--;
        var ways = factorial(total - pos - 1); for (var kk in cnt) ways /= factorial(cnt[kk]);
        ways = Math.round(ways);
        if (remaining <= ways) { digits.push(d); break; }
        remaining -= ways; cnt[d]++;
      }
    }
    return digits.join('');
  }
  function g_u2_3(level, R) {
    var cards, nth;
    if (level === 'lower') { cards = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort(function (x, y) { return x - y; }); nth = R.int(3, 6); }
    else if (level === 'same') { cards = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).sort(function (x, y) { return x - y; }); nth = R.int(4, 8); }
    else { cards = [0].concat(R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort(function (x, y) { return x - y; })); nth = R.int(8, 14); }
    var seq = []; cards.forEach(function (c) { seq.push(c, c); });
    var list = distinctPermsDesc(seq);
    must(nth <= list.length, 'nth');
    var a = list[nth - 1];
    var counter = {}; seq.forEach(function (c) { counter[c] = (counter[c] || 0) + 1; });
    var b = kthLargestCount(counter, nth);
    if (a !== b) mismatch('u2-3');
    var n = seq.length;
    return {
      text: '다음의 수 카드를 두 번씩 사용하여 ' + n + '자리 자연수를 만들었을 때 ' + nth + '번째로 큰 수를 쓰세요.\n' + cards.join('   '),
      answer: a,
      steps: ['카드를 두 번씩 모두 사용하면 ' + n + '자리 수가 됩니다.' + (cards.indexOf(0) >= 0 ? ' 맨 앞자리에는 0이 올 수 없습니다.' : ''),
        '가장 큰 수부터 큰 자리의 숫자를 큰 것부터 정하고, 앞자리가 정해질 때마다 만들 수 있는 수의 개수를 세어 순서를 따라갑니다.',
        '큰 수부터 ' + nth + '번째 수는 ' + a + '입니다. (큰 수부터: ' + list.slice(0, nth).join(', ') + ')'],
      check: '모든 수를 나열해 정렬한 결과와 경우의 수 계산이 일치'
    };
  }

  /* ================================================================ S2-4 조건에 맞는 가장 큰 수 */
  function solveMaxA(L, cap, fixed, rel) {
    var nodes = 0, LIMIT = 400000;
    function feasible(prefix) {
      var used = {}, i, d;
      for (i = 0; i < prefix.length; i++) used[prefix[i]] = (used[prefix[i]] || 0) + 1;
      for (d in used) if (used[d] > cap) return false;
      for (i = 0; i < prefix.length; i++) { var pos = L - i; if (fixed[pos] !== undefined && fixed[pos] !== prefix[i]) return false; }
      var room = 0; for (d = 1; d <= 9; d++) room += cap - (used[d] || 0);
      if (room < L - prefix.length) return false;
      var need = {};
      for (i = prefix.length; i < L; i++) { var ps = L - i; if (fixed[ps] !== undefined) need[fixed[ps]] = (need[fixed[ps]] || 0) + 1; }
      for (d in need) if ((used[d] || 0) + need[d] > cap) return false;
      if (rel) {
        var p = rel[0], q = rel[1], m = rel[2], ip = L - p, iq = L - q;
        var dpK = ip < prefix.length ? prefix[ip] : (fixed[p] !== undefined ? fixed[p] : null);
        var dqK = iq < prefix.length ? prefix[iq] : (fixed[q] !== undefined ? fixed[q] : null);
        var pCounted = ip < prefix.length || fixed[p] !== undefined, qCounted = iq < prefix.length || fixed[q] !== undefined;
        var base = {}, k;
        for (k in used) base[k] = used[k];
        for (k in need) base[k] = (base[k] || 0) + need[k];
        var cand = false;
        for (var dq = 1; dq <= 9; dq++) {
          var dp = m * dq; if (dp > 9) continue;
          if (dpK !== null && dpK !== dp) continue;
          if (dqK !== null && dqK !== dq) continue;
          var tmp = {}; for (k in base) tmp[k] = base[k];
          if (!pCounted) tmp[dp] = (tmp[dp] || 0) + 1;
          if (!qCounted) tmp[dq] = (tmp[dq] || 0) + 1;
          var okc = true; for (k in tmp) if (tmp[k] > cap) okc = false;
          if (okc) cand = true;
        }
        if (!cand) return false;
        if (dpK !== null && dqK !== null && dpK !== m * dqK) return false;
      }
      return true;
    }
    function dfs(prefix) {
      if (++nodes > LIMIT) fail('nodes');
      if (prefix.length === L) return prefix;
      for (var d = 9; d >= 1; d--) {
        var nxt = prefix.concat(d);
        if (feasible(nxt)) { var r = dfs(nxt); if (r) return r; }
      }
      return null;
    }
    return dfs([]);
  }
  function solveMaxB(L, cap, fixed, rel) {
    var pairs = [null], best = null;
    if (rel) { pairs = []; for (var dq = 1; dq <= 9; dq++) if (rel[2] * dq <= 9) pairs.push([rel[2] * dq, dq]); }
    pairs.forEach(function (pr) {
      var digits = {}, pos;
      for (pos in fixed) digits[pos] = fixed[pos];
      if (pr) {
        var p = rel[0], q = rel[1];
        if ((digits[q] !== undefined && digits[q] !== pr[1]) || (digits[p] !== undefined && digits[p] !== pr[0])) return;
        digits[q] = pr[1]; digits[p] = pr[0];
      }
      var used = {}; for (pos in digits) used[digits[pos]] = (used[digits[pos]] || 0) + 1;
      for (var d in used) if (used[d] > cap) return;
      for (pos = L; pos >= 1; pos--) {
        if (digits[pos] !== undefined) continue;
        var found = false;
        for (var x = 9; x >= 1; x--) if ((used[x] || 0) < cap) { digits[pos] = x; used[x] = (used[x] || 0) + 1; found = true; break; }
        if (!found) return;
      }
      var arr = []; for (pos = L; pos >= 1; pos--) arr.push(digits[pos]);
      if (!best || arr.join('') > best.join('')) best = arr;
    });
    return best;
  }
  function g_u2_4(level, R) {
    var L, nfix, useRel;
    if (level === 'lower') { L = R.int(8, 9); nfix = R.int(1, 2); useRel = false; }
    else if (level === 'same') { L = R.int(13, 14); nfix = 2; useRel = true; }
    else { L = R.int(15, 16); nfix = 3; useRel = true; }
    var positions = R.shuffle(Array.apply(null, Array(L)).map(function (_, i) { return i + 1; }));
    var rel = null, fixed = {};
    if (useRel) { var p = positions.pop(), q = positions.pop(); rel = [p, q, 2]; }
    for (var i = 0; i < nfix; i++) fixed[positions.pop()] = R.int(1, 9);
    var A = solveMaxA(L, 2, fixed, rel), B = solveMaxB(L, 2, fixed, rel);
    must(A && B, 'infeasible');
    if (A.join('') !== B.join('')) mismatch('u2-4');
    var best = A.join('');
    var conds = ['1부터 9까지의 숫자를 2번까지 사용하여 만든 ' + L + '자리 자연수입니다.'];
    Object.keys(fixed).map(Number).sort(function (x, y) { return y - x; }).forEach(function (pos) { conds.push(PLACES[pos - 1] + '의 자리 수는 ' + fixed[pos] + '입니다.'); });
    if (rel) conds.push(PLACES[rel[0] - 1] + '의 자리 수가 ' + PLACES[rel[1] - 1] + '의 자리 수의 ' + rel[2] + '배입니다.');
    var steps = ['조건에서 정해진 자리의 숫자를 먼저 놓고 사용한 횟수를 셉니다.', '남은 자리에는 높은 자리부터 큰 숫자를 넣되, 같은 숫자를 2번보다 많이 쓰지 않습니다.'];
    if (rel) steps.push(PLACES[rel[0] - 1] + '의 자리 수가 ' + PLACES[rel[1] - 1] + '의 자리 수의 ' + rel[2] + '배이므로 두 숫자의 짝을 정하고, 큰 수가 되는 짝을 비교합니다.');
    steps.push('가장 큰 수는 ' + best + '입니다.');
    return { text: '조건을 만족하는 가장 큰 수를 구하세요.\n' + conds.map(function (c, i2) { return (i2 + 1) + ') ' + c; }).join('\n'), answer: best, steps: steps, check: '되짚기 탐색과 관계 쌍을 정한 뒤 채우는 방법이 일치' };
  }

  /* ================================================================ S2-5 순열 사이의 수의 개수 */
  function rankDescFormula(descDigits, numStr) {
    var n = descDigits.length, remaining = descDigits.slice(), rank = 1;
    for (var pos = 0; pos < n; pos++) {
      var d = Number(numStr.charAt(pos)), bigger = 0;
      for (var i = 0; i < remaining.length; i++) if (remaining[i] > d && !(pos === 0 && remaining[i] === 0)) bigger++;
      rank += bigger * factorial(n - pos - 1);
      remaining.splice(remaining.indexOf(d), 1);
    }
    return rank;
  }
  function rankDescViaAscending(digits, numStr) {      // 방법 B: 작은 수부터의 순위로 계산한 뒤 뒤집는다
    var n = digits.length, remaining = digits.slice(), smaller = 0, nonzero = digits.filter(function (d) { return d !== 0; }).length;
    for (var pos = 0; pos < n; pos++) {
      var d = Number(numStr.charAt(pos)), less = 0;
      for (var i = 0; i < remaining.length; i++) if (remaining[i] < d && !(pos === 0 && remaining[i] === 0)) less++;
      smaller += less * factorial(n - pos - 1);
      remaining.splice(remaining.indexOf(d), 1);
    }
    var total = nonzero * factorial(n - 1);
    return total - (smaller + 1) + 1;
  }
  function prevPermutation(a) {
    a = a.slice(); var i = a.length - 2;
    while (i >= 0 && a[i] <= a[i + 1]) i--;
    if (i < 0) return null;
    var j = a.length - 1; while (a[j] >= a[i]) j--;
    var t = a[i]; a[i] = a[j]; a[j] = t;
    var l = i + 1, r = a.length - 1; while (l < r) { t = a[l]; a[l] = a[r]; a[r] = t; l++; r--; }
    return a;
  }
  function g_u2_5(level, R) {
    var digits, tcount, kth;
    if (level === 'lower') { digits = R.pick([[0, 1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]]); tcount = R.int(3, 4); kth = R.int(2, 3); }
    else if (level === 'same') { digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; tcount = R.int(4, 6); kth = R.int(2, 3); }
    else { digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; tcount = R.int(6, 7); kth = R.int(4, 6); }
    var desc = digits.slice().sort(function (x, y) { return y - x; });
    var head = desc.slice(0, desc.length - tcount), tail = R.shuffle(desc.slice(desc.length - tcount));
    var num = head.concat(tail).join('');
    must(num !== desc.join(''), 'same');
    var rA = rankDescFormula(desc, num), rB = rankDescViaAscending(digits, num);
    if (rA !== rB) mismatch('u2-5 rank');
    var ans = rA - kth - 1;
    must(ans >= 1, 'adjacent');
    var cur = desc.slice(); for (var i = 1; i < kth; i++) cur = prevPermutation(cur);
    var kthStr = cur.join('');
    var ordWord = { 2: '두', 3: '세', 4: '네', 5: '다섯', 6: '여섯', 7: '일곱' }[kth];
    var dtxt = digits[0] === 0 && digits.length === 10 ? '0부터 9까지의' : (digits[0] + '부터 ' + digits[digits.length - 1] + '까지의');
    return {
      text: dtxt + ' 숫자를 한 번씩만 사용하여 만들 수 있는 ' + digits.length + '자리 자연수 중에서 ' + numGwa(num) + ' ' + ordWord + ' 번째로 큰 수 사이에 있는 수는 모두 몇 개입니까?',
      answer: String(ans),
      steps: ['가장 큰 수부터 차례로 세면 ' + kth + '번째로 큰 수는 ' + kthStr + '입니다.',
        numEun(num) + ' 큰 수부터 ' + rA + '번째 수입니다. (앞에 오는 수의 개수를 자리별로 세어 구합니다.)',
        kth + '번째 수와 ' + rA + '번째 수 사이에는 ' + rA + ' − ' + kth + ' − 1 = ' + ans + '개가 있습니다.'],
      check: '큰 수부터의 순위와 작은 수부터의 순위로 구한 값이 일치'
    };
  }

  /* ================================================================ 공개 API */
  var FAMILIES = {
    'u1-1-q1': g_u1_1, 'u1-1-q2': g_u1_2, 'u1-1-q3': g_u1_3, 'u1-1-q4': g_u1_4,
    'u1-3-q1': g_u2_1, 'u1-3-q2': g_u2_2, 'u1-3-q3': g_u2_3, 'u1-3-q4': g_u2_4, 'u1-3-q5': g_u2_5
  };
  var LEVEL_IDS = ['lower', 'same', 'higher'];

  /* 한 문제를 만든다. 조건에 안 맞거나 검산이 어긋난 후보는 버리고 다시 만든다(검산 불일치는 따로 센다). */
  function generateOne(sourceId, level, R, seen) {
    var fn = FAMILIES[sourceId];
    if (!fn) throw new Error('알 수 없는 문제 유형: ' + sourceId);
    var rejected = 0, mismatches = 0;
    for (var attempt = 0; attempt < 400; attempt++) {
      try {
        var it = fn(level, R);
        if (seen && seen[it.text]) { rejected++; continue; }
        if (seen) seen[it.text] = true;
        it.source = sourceId; it.level = level; it.rejected = rejected; it.mismatches = mismatches;
        return it;
      } catch (e) {
        if (e instanceof Retry) { rejected++; continue; }
        if (e && e.mismatch) { mismatches++; continue; }     // 검산이 어긋난 문제는 절대 내보내지 않는다
        throw e;
      }
    }
    var ex = new Error('문제를 만들지 못했습니다: ' + sourceId + ' ' + level); ex.exhausted = true; throw ex;
  }

  /* requests: [{source, level, count}] → 순서대로 만든 문제 목록 (한 번의 생성 안에서 본문이 같은 문제는 없다) */
  function generateSet(requests, seed) {
    var R = makeRng(seed), seen = {}, out = [];
    out.short = [];                                   // 서로 다른 문제를 더 만들 수 없던 조합
    requests.forEach(function (rq) {
      var made = 0;
      for (var i = 0; i < rq.count; i++) {
        try { var it = generateOne(rq.source, rq.level, R, seen); }
        catch (e) { if (e && e.exhausted) break; throw e; }
        it.id = rq.source + '-' + rq.level + '-' + seed + '-' + (out.length + 1);
        out.push(it); made++;
      }
      if (made < rq.count) out.short.push({ source: rq.source, level: rq.level, wanted: rq.count, made: made });
    });
    return out;
  }

  var api = { generateOne: generateOne, generateSet: generateSet, makeRng: makeRng, sources: Object.keys(FAMILIES), levels: LEVEL_IDS, readKo: readKo, parseKo: parseKo };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UPGRADE41_GEN = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
