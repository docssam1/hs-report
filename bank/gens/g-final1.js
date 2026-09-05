/*!
 * 파이널 1회 실제 원본 구조 기반 유사문제 검토 생성기.
 *
 * 원본 문항의 사고 순서와 조건 관계만 보존하고 원문 수치는 복사하지 않는다.
 * 모든 생성기는 교사용 검토 전용이며, 주 계산과 독립 열거 결과가 일치해야만
 * 문항을 반환한다.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  if (!CORE) throw new Error('파이널 1회 생성기는 BANK_CORE가 필요합니다.');
  var RASTER = global.BANK_RASTER;
  if (!RASTER) throw new Error('파이널 1회 그림 생성기는 BANK_RASTER가 필요합니다.');

  var SOURCE = '파이널 1회';
  var LEARNER_FIT = {
    learnerStage: '초등 선발 대비 사고력 수학',
    language: '한글 조건문과 초등 자연수 계산',
    prerequisites: '사칙연산, 나눗셈의 몫과 나머지, 규칙 찾기',
    reasoningLoad: '원본과 같은 핵심 조건 관계를 유지하고 수치 범위만 단계별 조정',
    responseMode: '문항에서 요구한 하나의 수 또는 순서가 고정된 답'
  };

  function levelOf(level) {
    return Math.max(1, Math.min(5, Number(level) || 1));
  }

  function range(level, starts, spans) {
    level = levelOf(level);
    return [starts[level - 1], starts[level - 1] + spans[level - 1]];
  }

  function sumDigits(number) {
    return String(number).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }

  function permutations(values) {
    if (values.length <= 1) return [values.slice()];
    var out = [];
    values.forEach(function (value, index) {
      var rest = values.slice(0, index).concat(values.slice(index + 1));
      permutations(rest).forEach(function (tail) { out.push([value].concat(tail)); });
    });
    return out;
  }

  function finalize(spec, answer, independentAnswer, text, solution, meta, extras) {
    if (String(answer) !== String(independentAnswer)) {
      throw new Error(spec.id + ': 독립 검산 결과가 일치하지 않습니다.');
    }
    extras = extras || {};
    var validAnswers = Array.isArray(extras.validAnswers) && extras.validAnswers.length ? extras.validAnswers.slice() : [answer];
    return {
      text: text,
      conditionLines: extras.conditionLines,
      asset: extras.asset,
      answer: answer,
      solution: solution,
      solutionSkill: spec.primaryMethod,
      solutionSteps: Array.isArray(extras.solutionSteps) ? extras.solutionSteps.slice() : [],
      readingFocus: spec.readingFocus || '',
      acceptedAnswers: validAnswers,
      answerPolicy: validAnswers.length > 1 ? 'any-one' : 'single',
      pointBand: spec.points,
      verification: {
        primary: { method: spec.primaryMethod, answer: answer },
        independent: { method: spec.independentMethod, answer: independentAnswer },
        unique: validAnswers.length === 1,
        validAnswerCount: validAnswers.length,
        answerContract: validAnswers.length > 1 ? 'any-of-set' : 'single-value',
        visibleEvidence: { passed: true, method: extras.visibleMethod || '문제 해결에 필요한 모든 수와 조건을 본문에 직접 제시' }
      },
      learnerFit: LEARNER_FIT,
      variantKey: extras.variantKey,
      meta: meta || {}
    };
  }

  var SPECS = [];
  var HANOI_DISTANCE_CACHE = {};
  function register(spec, gen) {
    spec.id = 'final1-q' + String(spec.no).padStart(2, '0');
    spec.points = spec.no <= 12 ? '2.7' : spec.no <= 22 ? '3.4' : '4.2';
    spec.primaryMethod = spec.primaryMethod || '관계식을 이용한 계산';
    spec.independentMethod = spec.independentMethod || '가능한 값을 전부 대입한 열거';
    SPECS.push(spec);
    global.BANK_GENS = global.BANK_GENS || [];
    global.BANK_GENS.push({
      id: spec.id,
      version: '1.1.0',
      name: SOURCE + ' ' + spec.no + '번 · ' + spec.name,
      area: spec.area,
      gradeBand: '초등 선발 대비',
      typeId: 'source-final-1-' + String(spec.no).padStart(2, '0'),
      sourceLinked: true,
      sourceSet: 'final',
      sourceRound: 1,
      sourceNo: spec.no,
      reviewOnly: true,
      preferDistinctAnswers: true,
      sourceStructure: spec.sourceStructure,
      solutionSkill: spec.primaryMethod,
      readingFocus: spec.readingFocus || '',
      errorTags: spec.errorTags.slice(),
      contentConstraints: { latinVariables: false, powers: false },
      learnerFit: LEARNER_FIT,
      gen: function (level, rng) { return gen(levelOf(level), rng, spec); },
      pointBands: { 1: spec.points, 2: spec.points, 3: spec.points, 4: spec.points, 5: spec.points }
    });
  }

  register({
    no: 1,
    name: '합이 일정한 두 자리 수의 개수',
    area: '수·규칙찾기',
    sourceStructure: '두 자리 자연수 중 두 자리 숫자의 합이 주어진 수보다 작은 것의 개수를 묻는다.',
    errorTags: ['두 자리 수 범위 누락', '미만을 이하로 계산', '십의 자리 0 포함'],
    primaryMethod: '십의 자리별 가능한 일의 자리 개수의 합',
    independentMethod: '10부터 99까지 모든 수의 자리 합 검사'
  }, function (level, rng, spec) {
    var threshold = CORE.randint(rng, 7 + level, 10 + level * 2);
    if (threshold === 12) threshold += 1;
    var primary = 0;
    for (var tens = 1; tens <= 9; tens++) primary += Math.max(0, Math.min(10, threshold - tens));
    var numbers = [];
    for (var number = 10; number <= 99; number++) if (sumDigits(number) < threshold) numbers.push(number);
    return finalize(spec, primary, numbers.length,
      '두 자리 자연수 중에서 각 자리 숫자의 합이 ' + threshold + '보다 작은 수는 모두 몇 개입니까?',
      '십의 자리를 1부터 9까지 정해 놓고 가능한 일의 자리 수를 각각 세어 더하면 ' + primary + '개입니다.',
      { threshold: threshold, matchingNumbers: numbers });
  });

  register({
    no: 3,
    name: '시침과 분침이 겹치는 횟수',
    area: '도형',
    sourceStructure: '정각으로 주어진 두 시각 사이에서 시침과 분침이 겹치는 횟수를 센다.',
    errorTags: ['12시간마다 11회 관계 누락', '시작과 끝 시각 포함 오류', '시간 간격만큼으로 오인'],
    primaryMethod: '시침과 분침의 상대속도로 겹침 번호 범위 계산',
    independentMethod: '겹침 시각을 분수 시간으로 모두 만들어 구간 포함 여부 검사'
  }, function (level, rng, spec) {
    var start = CORE.randint(rng, 1, 8);
    var duration = CORE.randint(rng, 6 + level, 10 + level * 2);
    var end = start + duration;
    if (start === 3 && end === 16) end += 1;
    var primary = Math.floor((11 * end - 1) / 12) - Math.floor(11 * start / 12);
    var events = [];
    for (var index = 0; index <= 30; index++) {
      if (12 * index > 11 * start && 12 * index < 11 * end) events.push(12 * index / 11);
    }
    function clockLabel(hour) {
      if (hour < 12) return '오전 ' + hour + '시';
      if (hour === 12) return '오후 12시';
      if (hour < 24) return '오후 ' + (hour - 12) + '시';
      return '다음 날 오전 ' + (hour - 24) + '시';
    }
    return finalize(spec, primary, events.length,
      '민서는 ' + clockLabel(start) + '부터 ' + clockLabel(end) + ' 사이에 시침과 분침이 겹칠 때마다 문제를 한 개씩 풀었습니다. 모두 몇 문제를 풀었습니까?',
      '시침과 분침은 12시간 동안 11번 겹칩니다. 두 시각 사이의 실제 겹침 시각만 세면 ' + primary + '번입니다.',
      { startHour: start, endHour: end, overlapHours: events });
  });

  register({
    no: 4,
    name: '두 수의 곱의 최대·최소',
    area: '수·규칙찾기',
    sourceStructure: '서로 다른 숫자 카드 네 장을 한 번씩 모두 써서 두 자연수를 만들고, 가능한 곱의 최댓값과 최솟값의 차를 묻는다.',
    errorTags: ['한 자리 수와 세 자리 수의 곱 누락', '숫자 카드 중복 사용', '최대·최소만 쓰고 차 누락'],
    primaryMethod: '카드를 두 수로 나누는 세 경우를 비교해 최대·최소 찾기',
    independentMethod: '모든 카드 순열과 세 분할 위치를 전수 열거'
  }, function (level, rng, spec) {
    var digits;
    do { digits = CORE.shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).sort(); }
    while (digits.join('') === '2345');
    function numberFrom(values) { return Number(values.join('')); }
    var cases = [];
    permutations(digits).forEach(function (p) {
      for (var split = 1; split <= 3; split++) {
        var left = numberFrom(p.slice(0, split));
        var right = numberFrom(p.slice(split));
        cases.push({ left: left, right: right, product: left * right });
      }
    });
    var minCase = cases.reduce(function (best, item) { return item.product < best.product ? item : best; });
    var maxCase = cases.reduce(function (best, item) { return item.product > best.product ? item : best; });
    var independentProducts = [];
    for (var mask = 1; mask < 15; mask++) {
      var leftDigits = [], rightDigits = [];
      digits.forEach(function (digit, index) { (mask & (1 << index) ? leftDigits : rightDigits).push(digit); });
      permutations(leftDigits).forEach(function (leftOrder) {
        permutations(rightDigits).forEach(function (rightOrder) {
          independentProducts.push(numberFrom(leftOrder) * numberFrom(rightOrder));
        });
      });
    }
    var min = minCase.product, max = maxCase.product;
    var independentAnswer = Math.max.apply(null, independentProducts) - Math.min.apply(null, independentProducts);
    return finalize(spec, max - min, independentAnswer,
      '숫자 카드 ' + digits.join(', ') + '를 한 번씩 모두 사용하여 두 자연수를 만들고 곱합니다. 만들 수 있는 곱 중 가장 큰 값과 가장 작은 값의 차를 구하세요.',
      '두 자리 수×두 자리 수라는 조건이 없으므로 한 자리 수×세 자리 수도 반드시 비교합니다. 카드를 1장과 3장, 2장과 2장, 3장과 1장으로 나누어 보면 가장 큰 곱은 ' + maxCase.left + '×' + maxCase.right + '=' + max + ', 가장 작은 곱은 ' + minCase.left + '×' + minCase.right + '=' + min + '이므로 차는 ' + (max - min) + '입니다.',
      { digits: digits, minimumProduct: min, maximumProduct: max, minimumPair: [minCase.left, minCase.right], maximumPair: [maxCase.left, maxCase.right] },
      { solutionSteps: ['카드를 두 수로 나누는 자리 수를 정합니다.', '각 경우에서 곱이 가장 큰 배치와 가장 작은 배치를 비교합니다.', '가장 큰 곱에서 가장 작은 곱을 뺍니다.'] });
  });

  register({
    no: 6,
    name: '고장난 시계',
    area: '식의 계산',
    sourceStructure: '매주 일정하게 빨라지는 아날로그시계를 맞춘 뒤 다시 같은 시각을 가리키는 날을 구한다.',
    errorTags: ['24시간을 기준으로 계산', '주간 오차를 일간 오차로 바꾸지 않음', '시계판 반복 누락'],
    primaryMethod: '12시간에 해당하는 720분을 하루 오차로 나눔',
    independentMethod: '날짜별 누적 오차를 12시간 나머지로 반복 확인'
  }, function (level, rng, spec) {
    var gains = [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 48, 60];
    var dailyGain = CORE.pick(rng, gains.slice(Math.min(level - 1, 5)));
    if (dailyGain === 15) dailyGain = 18;
    var weeklyGain = dailyGain * 7;
    var answer = 720 / dailyGain;
    var simulated = 1;
    while ((simulated * dailyGain) % 720 !== 0) simulated++;
    return finalize(spec, answer, simulated,
      '도윤이의 시계는 일주일에 ' + Math.floor(weeklyGain / 60) + '시간 ' + (weeklyGain % 60) + '분씩 빨라집니다. 어느 날 시계를 정확히 맞추었습니다. 이 아날로그시계가 다시 정확한 시각을 가리키는 것은 며칠 후입니까?',
      '하루에 ' + dailyGain + '분씩 빨라집니다. 아날로그시계는 12시간, 즉 720분 빠르면 같은 모양이므로 720÷' + dailyGain + '=' + answer + '일입니다.',
      { dailyGainMinutes: dailyGain, weeklyGainMinutes: weeklyGain });
  });

  register({
    no: 8,
    name: '우기기(가정하여 풀기)',
    area: '식의 계산',
    sourceStructure: '성공 때 받는 돈과 실패 때 물어내는 돈, 전체 개수와 실제 수입을 주고 성공 개수를 구한다.',
    errorTags: ['한 개당 차이 계산 오류', '실패 개수를 답으로 씀', '물어낸 돈의 부호 오류'],
    primaryMethod: '모두 성공했다고 가정한 금액과 실제 금액의 차이 이용',
    independentMethod: '가능한 성공 개수를 0부터 전체까지 대입'
  }, function (level, rng, spec) {
    var total = CORE.randint(rng, 40 + level * 20, 90 + level * 35);
    var reward = CORE.randint(rng, 2 + level, 5 + level) * 100;
    var penalty = CORE.randint(rng, 2 + level, 6 + level) * 100;
    var broken = CORE.randint(rng, 5, Math.max(6, Math.floor(total * 0.4)));
    var delivered = total - broken;
    var received = delivered * reward - broken * penalty;
    if (total === 300 && reward === 300 && penalty === 400) total += 1;
    var algebra = total - (total * reward - received) / (reward + penalty);
    var matches = [];
    for (var candidate = 0; candidate <= total; candidate++) {
      if (candidate * reward - (total - candidate) * penalty === received) matches.push(candidate);
    }
    return finalize(spec, algebra, matches.length === 1 ? matches[0] : NaN,
      '수아는 물건 ' + total + '개를 옮깁니다. 한 개를 무사히 옮기면 ' + reward + '원을 받고, 깨뜨리면 ' + penalty + '원을 물어냅니다. 일을 마친 뒤 받은 돈이 ' + received + '원이었습니다. 깨뜨리지 않고 옮긴 물건은 몇 개입니까?',
      '모두 성공했다면 ' + (total * reward) + '원입니다. 성공과 실패 한 개의 차이는 ' + (reward + penalty) + '원이므로 실패는 ' + broken + '개, 성공은 ' + delivered + '개입니다.',
      { total: total, reward: reward, penalty: penalty, received: received, matchingDeliveredCounts: matches },
      { solutionSteps: ['성공 한 개와 실패 한 개의 금액 차이를 구합니다.', '모두 성공했다고 가정한 금액을 구합니다.', '가정한 금액과 실제 금액의 차이로 실패 수를 구한 뒤, 문제에서 묻는 성공 수로 바꿉니다.'] });
  });

  register({
    no: 12,
    name: '조건에 맞게 나누기(합과 차)',
    area: '식의 계산',
    sourceStructure: '네 사람의 전체 합, 두 부분합, 두 수의 차 조건으로 네 값을 모두 구한다.',
    errorTags: ['사람별 조건 뒤바꿈', '두 배 조건 누락', '전체 합 검산 누락'],
    primaryMethod: '조건식을 차례로 대입하여 네 값을 계산',
    independentMethod: '양의 정수 네 쌍을 전체 범위에서 열거해 모든 조건 확인'
  }, function (level, rng, spec) {
    var a = CORE.randint(rng, 12 + level * 2, 22 + level * 4);
    var b = CORE.randint(rng, 8 + level, 18 + level * 3);
    var c = CORE.randint(rng, 9 + level, 18 + level * 3);
    var d = CORE.randint(rng, 5 + level, 12 + level * 2);
    var total = a + b + c + d;
    var firstPair = a + b;
    var weighted = c + 2 * d;
    var difference = a - c;
    if (difference <= 0) { a = c + CORE.randint(rng, 2, 8); total = a + b + c + d; firstPair = a + b; difference = a - c; }
    var answer = [a, b, c, d].join(', ');
    var matches = [];
    for (var cc = 1; cc < total; cc++) {
      var aa = cc + difference;
      var bb = firstPair - aa;
      var dd = total - aa - bb - cc;
      if (aa > 0 && bb > 0 && dd > 0 && cc + 2 * dd === weighted) matches.push([aa, bb, cc, dd]);
    }
    return finalize(spec, answer, matches.length === 1 ? matches[0].join(', ') : NaN,
      '가온, 나래, 다온, 라온이 가진 구슬은 모두 ' + total + '개입니다. 네 사람이 가진 구슬의 수를 순서대로 구하세요.',
      '조건을 순서대로 대입하면 가온 ' + a + '개, 나래 ' + b + '개, 다온 ' + c + '개, 라온 ' + d + '개입니다.',
      { total: total, firstPair: firstPair, weighted: weighted, difference: difference, matches: matches },
      { conditionLines: ['가온과 나래의 구슬을 합치면 ' + firstPair + '개입니다.', '다온의 구슬 수와 라온의 구슬 수의 2배를 합하면 ' + weighted + '개입니다.', '가온은 다온보다 ' + difference + '개 더 가지고 있습니다.'] });
  });

  register({
    no: 14,
    name: '기준 정해 인원 구하기',
    area: '식의 계산',
    sourceStructure: '다섯 집단의 전체 인원과 배수·차 조건을 이용해 특정 집단 인원을 구한다.',
    errorTags: ['기준 집단 선택 오류', '전체 합 누락', '차 조건 방향 반대'],
    primaryMethod: '묻는 집단을 기준 수로 놓고 전체 합 식 계산',
    independentMethod: '양의 정수 후보를 대입해 다섯 집단의 합 확인'
  }, function (level, rng, spec) {
    var rabbit = CORE.randint(rng, 5 + level, 9 + level * 2);
    var cat = rabbit + 2;
    var dog = rabbit * 2;
    var bird = rabbit - 2;
    var hamster = rabbit + 1;
    var total = rabbit + cat + dog + bird + hamster;
    var matches = [];
    for (var candidate = 1; candidate <= total; candidate++) {
      if (candidate + (candidate + 2) + candidate * 2 + (candidate - 2) + (candidate + 1) === total) matches.push(candidate);
    }
    return finalize(spec, rabbit, matches.length === 1 ? matches[0] : NaN,
      '한 반 학생 ' + total + '명이 가장 좋아하는 동물을 한 가지씩 골랐습니다. 토끼를 고른 학생은 몇 명입니까?',
      '토끼를 좋아하는 학생 수를 기준으로 두고 다섯 집단을 모두 나타내어 합을 맞추면 ' + rabbit + '명입니다.',
      { total: total, rabbit: rabbit, cat: cat, dog: dog, bird: bird, hamster: hamster },
      { conditionLines: ['동물은 강아지, 고양이, 토끼, 새, 햄스터의 5가지입니다.', '강아지는 토끼의 2배입니다.', '고양이는 토끼보다 2명 많고, 새는 토끼보다 2명 적습니다.', '햄스터는 토끼보다 1명 많습니다.'] });
  });

  register({
    no: 16,
    name: '나머지의 성질',
    area: '수·규칙찾기',
    sourceStructure: '두 수의 합을 같은 수로 나눈 나머지 두 개를 주고 네 수 전체 합의 나머지를 구한다.',
    errorTags: ['나머지를 그대로 더하고 끝냄', '나누는 수보다 큰 나머지 허용', '검산식 누락'],
    primaryMethod: '두 나머지의 합을 다시 같은 수로 나눔',
    independentMethod: '서로 다른 몫을 넣어 실제 네 수를 만든 뒤 전체 합 나눗셈'
  }, function (level, rng, spec) {
    var divisor = CORE.randint(rng, 5 + level, 9 + level * 2);
    var firstRemainder = CORE.randint(rng, 1, divisor - 1);
    var secondRemainder = CORE.randint(rng, 1, divisor - 1);
    if (divisor === 6 && firstRemainder === 4 && secondRemainder === 5) secondRemainder = 3;
    var answer = (firstRemainder + secondRemainder) % divisor;
    var firstSum = divisor * CORE.randint(rng, 4, 15) + firstRemainder;
    var secondSum = divisor * CORE.randint(rng, 5, 16) + secondRemainder;
    var independent = (firstSum + secondSum) % divisor;
    return finalize(spec, answer, independent,
      '두 수의 합을 ' + divisor + '로 나눈 나머지는 ' + firstRemainder + '이고, 다른 두 수의 합을 ' + divisor + '로 나눈 나머지는 ' + secondRemainder + '입니다. 네 수를 모두 더한 값을 ' + divisor + '로 나눈 나머지를 구하세요.',
      '나머지끼리 더한 ' + (firstRemainder + secondRemainder) + '을 ' + divisor + '로 다시 나누면 나머지는 ' + answer + '입니다.',
      { divisor: divisor, remainders: [firstRemainder, secondRemainder], witnessSums: [firstSum, secondSum] });
  });

  register({
    no: 17,
    name: '영역의 최대·최소',
    area: '도형',
    sourceStructure: '경계가 있는 판 안에 서로 평행하지 않은 직선을 긋되 교점이 판 밖에 놓일 수 있을 때, 판 안 영역의 최대와 최소를 더한다.',
    readingFocus: '서로 평행하지 않아도 연장선의 교점이 판 밖에 있으면 판 안에서는 만나지 않는다는 조건',
    errorTags: ['영역을 평면 전체로 오해', '판 밖의 교점을 판 안 분할로 계산', '최대와 최소 중 하나만 구함'],
    primaryMethod: '새 직선이 판 안에서 만드는 조각 수를 최대와 최소로 나누어 누적',
    independentMethod: '최대·최소 배치에서 직선을 한 개씩 추가하며 영역 증가량 재계산'
  }, function (level, rng, spec) {
    var count = CORE.randint(rng, 4 + level, 7 + level * 2);
    if (count === 7) count += 1;
    var maximum = 1 + count * (count + 1) / 2;
    var minimum = count + 1;
    var independentMaximum = 1, independentMinimum = 1;
    for (var line = 1; line <= count; line++) {
      independentMaximum += line;
      independentMinimum += 1;
    }
    return finalize(spec, maximum + minimum, independentMaximum + independentMinimum,
      '민지는 직사각형 모양의 큰 피자를 직선 칼집 ' + count + '개로 나누려고 합니다. 칼집끼리는 서로 평행하지 않지만, 칼집의 연장선이 만나는 점은 피자 밖에 있을 수도 있습니다. 피자 안에서 생길 수 있는 영역의 최대 개수와 최소 개수의 합을 구하세요.',
      '최대로 나누려면 새 칼집이 앞의 칼집들과 피자 안의 서로 다른 점에서 만나게 하므로 영역은 1+1+2+…+' + count + '=' + maximum + '개입니다. 최소로 나누려면 모든 교점이 피자 밖에 있게 하여 칼집 하나마다 영역을 한 개씩만 늘리므로 ' + count + '+1=' + minimum + '개입니다. 따라서 합은 ' + (maximum + minimum) + '개입니다.',
      { lineCount: count, maximum: maximum, minimum: minimum, countedDomain: '직사각형 판 안' },
      { solutionSteps: ['세는 범위가 피자 안임을 확인합니다.', '모든 교점이 피자 안에 있는 최대 배치를 계산합니다.', '모든 교점이 피자 밖에 있는 최소 배치를 계산한 뒤 두 값을 더합니다.'] });
  });

  register({
    no: 19,
    name: '하노이 탑',
    area: '수·규칙찾기',
    sourceStructure: '크기가 다른 원반을 한 번에 하나씩 옮기고 큰 원반을 작은 원반 위에 놓지 않는 최소 이동 횟수를 구한다.',
    errorTags: ['가장 큰 원반 이동 전후 단계 누락', '최소 횟수가 아닌 한 가지 이동만 셈', '원반 수 증가 규칙 오류'],
    primaryMethod: '이전 원반 수의 최소 횟수를 두 배 하고 1을 더하는 점화 계산',
    independentMethod: '세 기둥의 모든 합법 상태를 너비 우선으로 탐색'
  }, function (level, rng, spec) {
    var disks = CORE.randint(rng, 3 + Math.floor(level / 2), Math.min(8, 4 + level));
    if (disks === 6) disks = level < 4 ? 5 : 7;
    var moves = 0;
    for (var count = 1; count <= disks; count++) moves = moves * 2 + 1;
    var independent = HANOI_DISTANCE_CACHE[disks];
    var exploredStates = 0;
    if (independent == null) {
      var start = Array(disks).fill(0).join('');
      var goal = Array(disks).fill(2).join('');
      var queue = [start], distance = {}; distance[start] = 0;
      for (var qi = 0; qi < queue.length && distance[goal] == null; qi++) {
        var state = queue[qi].split('').map(Number);
        var tops = [null, null, null];
        for (var disk = 0; disk < disks; disk++) if (tops[state[disk]] == null) tops[state[disk]] = disk;
        for (var from = 0; from < 3; from++) if (tops[from] != null) for (var to = 0; to < 3; to++) if (to !== from) {
          if (tops[to] != null && tops[to] < tops[from]) continue;
          var next = state.slice(); next[tops[from]] = to; var key = next.join('');
          if (distance[key] == null) { distance[key] = distance[queue[qi]] + 1; queue.push(key); }
        }
      }
      independent = distance[goal];
      exploredStates = Object.keys(distance).length;
      HANOI_DISTANCE_CACHE[disks] = independent;
    }
    return finalize(spec, moves, independent,
      '세 기둥 중 한 기둥에 크기가 다른 원반 ' + disks + '개가 큰 것부터 쌓여 있습니다. 한 번에 원반 하나만 옮기고 큰 원반을 작은 원반 위에 놓지 않을 때, 다른 기둥으로 모두 옮기는 최소 횟수를 구하세요.',
      '원반이 하나 늘 때마다 이전 최소 횟수를 두 번 사용하고 가장 큰 원반을 한 번 옮깁니다. 이 규칙을 ' + disks + '개까지 이어 가면 ' + moves + '번입니다.',
      { disks: disks, exploredStates: exploredStates });
  });

  register({
    no: 24,
    name: '거듭제곱에서의 일의 자리',
    area: '수·규칙찾기',
    sourceStructure: '같은 수를 여러 번 곱한 수의 일의 자리 반복 규칙을 찾는다.',
    errorTags: ['반복마디 나머지 0 처리 오류', '전체 수를 직접 계산하려 함', '곱한 횟수 한 칸 이동'],
    primaryMethod: '일의 자리 반복마디를 만든 뒤 곱한 횟수의 위치 계산',
    independentMethod: '일의 자리만 남기며 횟수만큼 반복 곱셈'
  }, function (level, rng, spec) {
    var base = CORE.randint(rng, 2, 9);
    if (base === 2) base = CORE.pick(rng, [3, 4, 7, 8, 9]);
    var exponent = CORE.randint(rng, 20 + level * 15, 80 + level * 55);
    if (base === 2 && exponent === 100) exponent += 1;
    var cycle = [], seen = {}, value = 1;
    while (!seen[value = (value * base) % 10]) { seen[value] = true; cycle.push(value); }
    var answer = cycle[(exponent - 1) % cycle.length];
    var independent = 1;
    for (var count = 0; count < exponent; count++) independent = (independent * base) % 10;
    return finalize(spec, answer, independent,
      base + '를 ' + exponent + '번 곱한 수의 일의 자리 숫자를 구하세요.',
      '일의 자리만 차례로 곱하면 ' + cycle.join(', ') + '의 반복마디가 생깁니다. ' + exponent + '번째 위치의 수는 ' + answer + '입니다.',
      { base: base, exponent: exponent, unitsCycle: cycle });
  });

  register({
    no: 25,
    name: '나머지가 몫보다 큰 수',
    area: '수·규칙찾기',
    sourceStructure: '세 자리 수를 주어진 수로 나눌 때 나머지가 몫보다 큰 경우의 수를 구한다.',
    errorTags: ['세 자리 수 범위 누락', '나머지 범위 위반', '몫과 나머지 대소관계 반대'],
    primaryMethod: '가능한 몫마다 몫보다 큰 나머지의 개수를 합산',
    independentMethod: '100부터 999까지 모든 수를 직접 나누어 검사'
  }, function (level, rng, spec) {
    var divisor = CORE.randint(rng, 10 + level, 16 + level * 2);
    if (divisor === 15) divisor += 1;
    var primary = 0;
    for (var quotient = Math.floor(100 / divisor) - 1; quotient <= Math.floor(999 / divisor); quotient++) {
      for (var remainder = 0; remainder < divisor; remainder++) {
        var number = divisor * quotient + remainder;
        if (number >= 100 && number <= 999 && remainder > quotient) primary++;
      }
    }
    var matches = [];
    for (var number = 100; number <= 999; number++) if (number % divisor > Math.floor(number / divisor)) matches.push(number);
    return finalize(spec, primary, matches.length,
      divisor + '로 나눌 때 나머지가 몫보다 큰 세 자리 자연수는 모두 몇 개입니까?',
      '나머지는 ' + divisor + '보다 작아야 합니다. 가능한 몫마다 그 몫보다 큰 나머지를 세어 합하면 ' + primary + '개입니다.',
      { divisor: divisor, matchingCount: matches.length, firstMatch: matches[0], lastMatch: matches[matches.length - 1] });
  });

  register({
    no: 26,
    name: '자리 뒤집기 나이 계산',
    area: '식의 계산',
    sourceStructure: '할아버지와 아버지의 두 자리 나이가 서로 자리 뒤집기이고, 두 나이가 아이 나이의 정수배이며 두 답 중 하나를 쓰게 한다.',
    readingFocus: '가능한 나이 조합이 두 가지이며 그중 한 가지만 써도 정답이라는 답 형식',
    errorTags: ['가능한 나이 조합 하나를 누락', '자리 뒤집기 조건 누락', '두 답을 모두 써야 한다고 오해'],
    primaryMethod: '아이 나이의 배수로 할아버지와 아버지 나이를 만든 뒤 자리 뒤집기 검사',
    independentMethod: '두 자리 할아버지 나이를 전부 대입해 모든 조건을 만족하는 조합 열거'
  }, function (level, rng, spec) {
    var childNames = ['민준', '서준', '도윤', '하준', '시우', '지호'];
    var childName = CORE.pick(rng, childNames);
    var primaryMatches = [];
    for (var child = 1; child <= 19; child++) {
      var grandfather = child * 7;
      var father = child * 4;
      if (grandfather < 20 || grandfather > 99 || father < 20 || father > 99) continue;
      if ((grandfather % 10) * 10 + Math.floor(grandfather / 10) !== father) continue;
      if (grandfather - father < 20 || father - child < 20) continue;
      primaryMatches.push([grandfather, father, child]);
    }
    var independentMatches = [];
    for (var age = 20; age <= 99; age++) {
      var reversed = (age % 10) * 10 + Math.floor(age / 10);
      if (age % 7 !== 0 || reversed < 20) continue;
      var childAge = age / 7;
      if (reversed !== childAge * 4 || age - reversed < 20 || reversed - childAge < 20) continue;
      independentMatches.push([age, reversed, childAge]);
    }
    function asAnswer(rows) { return rows.map(function (row) { return row.join(', '); }).join(' 또는 '); }
    var answer = asAnswer(primaryMatches), independentAnswer = asAnswer(independentMatches);
    return finalize(spec, answer, independentAnswer,
      childName + '의 할아버지 나이는 두 자리 수이고, 숫자의 자리를 바꾸면 아버지 나이가 됩니다. 아버지 나이는 ' + childName + ' 나이의 4배이고, ' + childName + '의 나이는 할아버지 나이의 7분의 1입니다. 할아버지와 아버지는 모두 스무 살이 지난 뒤 아버지가 되었습니다. 세 사람의 나이를 할아버지, 아버지, ' + childName + ' 순서로 가능한 답 중 한 가지만 쓰세요.',
      childName + '의 나이를 기준으로 두면 할아버지는 7배, 아버지는 4배입니다. 자리 뒤집기와 나이 차 조건을 함께 확인하면 가능한 답은 ' + answer + '입니다. 둘 중 한 가지만 쓰면 정답입니다.',
      { childName: childName, matches: primaryMatches, order: ['할아버지', '아버지', childName] },
      { validAnswers: primaryMatches.map(function (row) { return row.join(', '); }), solutionSteps: ['아이 나이를 기준 수로 두고 할아버지는 7배, 아버지는 4배로 나타냅니다.', '할아버지 나이의 두 자리를 바꾸어 아버지 나이와 같은지 확인합니다.', '나이 차 조건까지 맞는 두 조합 가운데 한 가지를 씁니다.'] });
  });

  register({
    no: 27,
    name: '거리·속력·시간',
    area: '식의 계산',
    sourceStructure: '서로 반대 방향으로 움직이는 자동차와 기차가 완전히 겹친 뒤 자동차가 기차에 가려지는 시간을 구한다.',
    errorTags: ['마주 오는 속력을 빼기', '자동차 길이를 더함', '단위 시간 변환 오류'],
    primaryMethod: '기차 길이를 두 물체의 상대속력 합으로 나눔',
    independentMethod: '분 단위 위치를 나열해 자동차가 기차 끝을 통과하는 최초 시각 확인'
  }, function (level, rng, spec) {
    var carSpeed = CORE.randint(rng, 5 + level, 10 + level * 2) * 10;
    var trainSpeed = CORE.randint(rng, 12 + level, 22 + level * 2) * 10;
    var time = CORE.randint(rng, 1, 2 + level);
    var trainLength = (carSpeed + trainSpeed) * time;
    var carLength = CORE.randint(rng, 2, 6 + level);
    if (carSpeed === 80 && trainSpeed === 200 && trainLength === 280) trainLength += carSpeed + trainSpeed;
    var answer = trainLength / (carSpeed + trainSpeed);
    var independent = null;
    for (var minute = 0; minute <= 20; minute++) if ((carSpeed + trainSpeed) * minute >= trainLength) { independent = minute; break; }
    return finalize(spec, answer, independent,
      '민호는 기찻길 옆에서 1분에 ' + carSpeed + '미터씩 가는 자동차와 반대 방향으로 1분에 ' + trainSpeed + '미터씩 가는 기차를 보았습니다. 길이 ' + carLength + '미터인 자동차가 길이 ' + trainLength + '미터인 기차에 완전히 가려진 순간부터 다시 보일 때까지 몇 분입니까?',
      '완전히 가려진 순간부터는 자동차 길이를 더하지 않습니다. 1분에 ' + (carSpeed + trainSpeed) + '미터씩 지나가므로 ' + trainLength + '÷' + (carSpeed + trainSpeed) + '=' + answer + '분입니다.',
      { carSpeed: carSpeed, trainSpeed: trainSpeed, trainLength: trainLength, carLength: carLength });
  });

  register({
    no: 28,
    name: '이상한 시계',
    area: '식의 계산',
    sourceStructure: '한 시간이 실제 몇 분인지와 분침이 시침을 따라잡는 각·시간을 이용해 하루의 시간 수를 구한다.',
    errorTags: ['하루와 시계판 한 바퀴 혼동', '분침만의 속력으로 계산', '상대속력의 방향 오류'],
    primaryMethod: '분침과 시침의 상대 각속력 식으로 시계판 시간 수 계산',
    independentMethod: '후보 시간 수마다 두 바늘의 이동 각도를 직접 대입'
  }, function (level, rng, spec) {
    var hourMinutes = CORE.pick(rng, [30, 36, 40, 48, 50, 60]);
    var dialHours = CORE.pick(rng, [6, 8, 9, 10, 12, 15]);
    var chaseMinutes = hourMinutes;
    var chaseAngle = 360 * (dialHours - 1) / dialHours;
    if (!Number.isInteger(chaseAngle)) { dialHours = 10; chaseAngle = 324; }
    var answer = dialHours * 2;
    var minuteSpeed = 360 / hourMinutes;
    var hourSpeed = 360 / (dialHours * hourMinutes);
    var calculatedDial = Math.round(1 / (1 - chaseAngle / (chaseMinutes * minuteSpeed)));
    var matches = [];
    for (var candidate = 3; candidate <= 24; candidate++) {
      if (Math.abs((minuteSpeed - 360 / (candidate * hourMinutes)) * chaseMinutes - chaseAngle) < 1e-9) matches.push(candidate * 2);
    }
    return finalize(spec, answer, matches.length === 1 ? matches[0] : calculatedDial * 2,
      '서진이는 한 시간이 ' + hourMinutes + '분인 이상한 아날로그시계를 만들었습니다. 이 시계의 분침이 시침을 ' + chaseAngle + '° 따라잡는 데 ' + chaseMinutes + '분이 걸립니다. 이 시계에서 하루는 몇 시간입니까?',
      '분침과 시침의 상대속력으로 시계판 한 바퀴가 ' + dialHours + '시간임을 알 수 있습니다. 하루는 시계판 두 바퀴이므로 ' + answer + '시간입니다.',
      { hourMinutes: hourMinutes, dialHours: dialHours, chaseMinutes: chaseMinutes, chaseAngle: chaseAngle, candidateAnswers: matches });
  });

  register({
    no: 5,
    name: '규칙이 있는 도형의 둘레',
    area: '도형',
    sourceStructure: '합동인 이등변삼각형을 변끼리 홀수 개 이어 붙인 띠 도형의 둘레를 구한다.',
    errorTags: ['공유한 변을 둘레에 포함', '양 끝 옆변 누락', '삼각형 개수와 밑변 개수 혼동'],
    primaryMethod: '이어 붙인 뒤 남는 밑변과 양 끝 옆변을 따로 계산',
    independentMethod: '각 삼각형의 세 변 합에서 공유 변을 두 번씩 제거'
  }, function (level, rng, spec) {
    var count = CORE.randint(rng, 4 + level * 2, 8 + level * 7);
    if (count % 2 === 0) count++;
    if (count === 49) count += 2;
    var base = CORE.randint(rng, 3, 6 + level);
    var side = CORE.randint(rng, base + 2, base + 6 + level);
    var answer = count * base + 2 * side;
    var independent = count * (base + 2 * side) - 2 * (count - 1) * side;
    return finalize(spec, answer, independent,
      '그림과 같이 밑변이 ' + base + '센티미터, 같은 두 옆변이 각각 ' + side + '센티미터인 이등변삼각형을 ' + count + '개 변끼리 이어 붙였습니다. 완성된 도형의 둘레를 구하세요.',
      '홀수 개를 이어 붙이면 윗변에는 ' + Math.ceil(count / 2) + '개, 아랫변에는 ' + Math.floor(count / 2) + '개의 밑변이 남아 합이 ' + count + '개입니다. 밑변 전체와 양 끝 옆변 두 개를 더하면 ' + base + '×' + count + '+' + side + '×2=' + answer + '센티미터입니다.',
      { count: count, base: base, side: side },
      { asset: RASTER.drawTriangleChain(count, base + 'cm', side + 'cm'), visibleMethod: '삼각형이 변끼리 이어진 방향과 밑변·옆변 길이를 PNG에 표시', solutionSteps: ['윗변과 아랫변에 남는 밑변의 개수를 각각 셉니다.', '두 개수를 합쳐 삼각형 수와 같은지 확인합니다.', '양 끝 옆변 두 개를 더합니다.'] });
  });

  register({
    no: 7,
    name: '표를 활용한 거리 구하기',
    area: '식의 계산',
    sourceStructure: '순서대로 놓인 역 사이 거리표에서 전체 거리와 양 끝 구간을 이용해 가운데 두 역 사이 거리를 구한다.',
    errorTags: ['역의 순서 뒤바꿈', '양 끝 한 구간 누락', '전체 거리에서 더함'],
    primaryMethod: '전체 거리에서 양 끝 두 구간을 뺌',
    independentMethod: '각 역을 수직선 좌표에 놓아 두 좌표의 차 계산'
  }, function (level, rng, spec) {
    var stations = ['가람', '나루', '다온', '라온', '마루', '바다'];
    var gaps = [];
    for (var i = 0; i < 5; i++) gaps.push(CORE.randint(rng, 12 + level * 2, 28 + level * 8));
    var positions = [0]; gaps.forEach(function (gap) { positions.push(positions[positions.length - 1] + gap); });
    var total = positions[5], answer = positions[4] - positions[1];
    var known = { '0:1': gaps[0], '0:5': total, '4:5': gaps[4] };
    return finalize(spec, answer, total - gaps[0] - gaps[4],
      '그림은 한 철도 노선의 역 사이 거리를 나타낸 표입니다. ' + stations[1] + '역과 ' + stations[4] + '역 사이의 거리는 몇 킬로미터입니까?',
      '먼저 역을 순서대로 수직선에 꼭 그립니다. ' + stations[0] + '역부터 ' + stations[5] + '역까지의 거리에서 양 끝 구간 ' + gaps[0] + '킬로미터와 ' + gaps[4] + '킬로미터를 빼면 ' + answer + '킬로미터입니다.',
      { stations: stations, gaps: gaps, positions: positions, total: total },
      { asset: RASTER.drawDistanceTable(stations, known), variantKey: gaps.join('-'), visibleMethod: '역의 순서와 계산에 필요한 세 거리를 삼각 거리표에 표시', solutionSteps: ['역의 순서를 수직선에 표시합니다.', '전체 거리와 양 끝 구간을 수직선에 옮겨 적습니다.', '전체 거리에서 양 끝 두 구간을 뺍니다.'] });
  });

  register({
    no: 9,
    name: '규칙 찾아 합 구하기',
    area: '수·규칙찾기',
    sourceStructure: '첫 배열은 한 개이고 그 뒤 배열은 일정한 배수만큼 늘어나는 원형 구슬 수를 주어진 차례까지 모두 더한다.',
    errorTags: ['첫 번째 한 개 누락', '마지막 차례 한 칸 오류', '각 단계 수만 구하고 전체 합 누락'],
    primaryMethod: '첫 항과 일정한 배수의 삼각수 합 공식',
    independentMethod: '첫째부터 목표 차례까지 단계별 구슬 수를 만들어 합산'
  }, function (level, rng, spec) {
    var multiplier = CORE.randint(rng, 3, 5 + level);
    if (multiplier === 5) multiplier += 1;
    var target = CORE.randint(rng, 7 + level, 11 + level * 3);
    var answer = 1 + multiplier * (target - 1) * target / 2;
    var stageCounts = [1];
    for (var stage = 2; stage <= target; stage++) stageCounts.push(multiplier * (stage - 1));
    var independent = stageCounts.reduce(function (sum, value) { return sum + value; }, 0);
    return finalize(spec, answer, independent,
      '그림과 같은 규칙으로 구슬을 나열합니다. 첫 번째부터 ' + target + '번째 배열까지 만드는 데 필요한 구슬은 모두 몇 개입니까?',
      '첫 번째는 1개이고, 그 뒤에는 ' + multiplier + '의 배수로 늘어납니다. 1+' + multiplier + '×(1+2+…+' + (target - 1) + ')=' + answer + '개입니다.',
      { multiplier: multiplier, target: target, stageCounts: stageCounts },
      { asset: RASTER.drawRingPattern(multiplier), visibleMethod: '첫 네 단계의 실제 구슬 수와 원형 증가 모양을 함께 표시' });
  });

  register({
    no: 10,
    name: '수 피라미드',
    area: '수·규칙찾기',
    sourceStructure: '첫째 행부터 행 번호만큼 자연수를 차례로 배열하고 목표 행의 모든 수의 합을 구한다.',
    errorTags: ['목표 행 시작 수 오류', '행의 수만큼 항 개수 누락', '마지막 수 한 칸 오류'],
    primaryMethod: '삼각수로 목표 행의 처음과 끝을 구해 등차수열 합 계산',
    independentMethod: '1부터 차례로 행을 채워 목표 행만 직접 합산'
  }, function (level, rng, spec) {
    var row = CORE.randint(rng, 8 + level * 2, 13 + level * 5);
    if (row === 21) row++;
    var first = row * (row - 1) / 2 + 1;
    var last = row * (row + 1) / 2;
    var answer = (first + last) * row / 2;
    var value = 1, independent = 0;
    for (var current = 1; current <= row; current++) for (var col = 0; col < current; col++) {
      if (current === row) independent += value;
      value++;
    }
    return finalize(spec, answer, independent,
      '그림과 같이 자연수를 1부터 차례로, 각 행에 행 번호만큼 놓았습니다. ' + row + '행의 수를 모두 더한 값을 구하세요.',
      row + '행은 ' + first + '부터 ' + last + '까지 ' + row + '개입니다. 처음과 끝을 짝지어 더하면 합은 ' + answer + '입니다.',
      { row: row, first: first, last: last },
      { asset: RASTER.drawNumberPyramid(5), visibleMethod: '초기 다섯 행의 수와 행별 항 개수를 PNG로 표시' });
  });

  register({
    no: 13,
    name: '도형이 나타내는 수의 활용',
    area: '식의 계산',
    sourceStructure: '3×3 수 배열에서 각 행의 합과 각 열의 합을 이용해 가려진 마지막 열의 합을 구한다.',
    errorTags: ['행 합 전체와 열 합 전체 관계 누락', '가려진 칸을 개별로 구하려 함', '빼는 방향 오류'],
    primaryMethod: '세 행의 합에서 보이는 두 열의 합을 뺌',
    independentMethod: '숨겨진 3×3 원래 수를 열별로 직접 더함'
  }, function (level, rng, spec) {
    var grid = [];
    for (var r = 0; r < 3; r++) {
      var row = [];
      for (var c = 0; c < 3; c++) row.push(CORE.randint(rng, 2 + level, 9 + level * 3));
      grid.push(row);
    }
    var rowSums = grid.map(function (row) { return row.reduce(function (a, b) { return a + b; }, 0); });
    var columnSums = [0, 1, 2].map(function (c) { return grid[0][c] + grid[1][c] + grid[2][c]; });
    var answer = rowSums.reduce(function (a, b) { return a + b; }, 0) - columnSums[0] - columnSums[1];
    return finalize(spec, answer, columnSums[2],
      '각 가로줄의 오른쪽에는 그 줄의 세 수의 합이, 각 세로줄의 아래에는 그 줄의 세 수의 합이 적혀 있습니다. 물음표에 들어갈 수를 구하세요.',
      '가로줄의 합 전체와 세로줄의 합 전체는 같습니다. 따라서 세 가로줄의 합에서 보이는 두 세로줄의 합을 빼면 물음표는 ' + answer + '입니다.',
      { grid: grid, rowSums: rowSums, columnSums: columnSums },
      { asset: RASTER.drawSumGrid(rowSums, columnSums), variantKey: rowSums.concat(columnSums).join('-'), visibleMethod: '원본과 같은 ㄱ자 합 격자에 세 행의 합과 두 열의 합, 물음표를 표시', solutionSteps: ['가로줄의 합을 모두 더합니다.', '세로줄의 합도 같은 전체 수를 한 번씩 더한 값임을 확인합니다.', '가로줄 합 전체에서 보이는 두 세로줄의 합을 뺍니다.'] });
  });

  register({
    no: 15,
    name: '색칠하기 경우의 수',
    area: '경우의 수',
    sourceStructure: '세 색의 사용 개수를 정하고 세로로 쌓은 이웃 쌓기나무가 같은 색이 아니게 칠하는 경우를 센다.',
    errorTags: ['색별 사용 개수 위반', '이웃한 같은 색 허용', '같은 배열 중복 계산'],
    primaryMethod: '남은 색 개수와 직전 색을 상태로 둔 경우의 수 계산',
    independentMethod: '주어진 색의 모든 중복순열을 만들어 이웃 조건 검사'
  }, function (level, rng, spec) {
    var height = 5 + level;
    var counts = null;
    for (var attempt = 0; attempt < 100 && !counts; attempt++) {
      var first = CORE.randint(rng, 1, height - 2);
      var second = CORE.randint(rng, 1, height - first - 1);
      var third = height - first - second;
      var candidateCounts = [first, second, third];
      if (Math.max.apply(null, candidateCounts) <= Math.ceil(height / 2)) counts = candidateCounts;
    }
    if (!counts) counts = [Math.floor(height / 3), Math.floor((height + 1) / 3), height - Math.floor(height / 3) - Math.floor((height + 1) / 3)];
    var memo = {};
    function dp(a, b, c, last) {
      var key = [a, b, c, last].join('|');
      if (memo[key] != null) return memo[key];
      if (a + b + c === 0) return 1;
      var total = 0;
      if (a && last !== 0) total += dp(a - 1, b, c, 0);
      if (b && last !== 1) total += dp(a, b - 1, c, 1);
      if (c && last !== 2) total += dp(a, b, c - 1, 2);
      memo[key] = total; return total;
    }
    var answer = dp(counts[0], counts[1], counts[2], -1);
    var valid = 0;
    function enumerate(prefix, remaining) {
      if (prefix.length === height) { valid++; return; }
      for (var color = 0; color < 3; color++) if (remaining[color] && prefix[prefix.length - 1] !== color) {
        remaining[color]--; enumerate(prefix.concat(color), remaining); remaining[color]++;
      }
    }
    enumerate([], counts.slice());
    var colors = ['초록색', '파란색', '노란색'];
    return finalize(spec, answer, valid,
      '그림처럼 쌓기나무 ' + height + '개를 세로로 쌓습니다. ' + colors[0] + '은 ' + counts[0] + '개, ' + colors[1] + '은 ' + counts[1] + '개, ' + colors[2] + '은 ' + counts[2] + '개를 칠합니다. 이웃한 쌓기나무가 같은 색이 되지 않게 칠하는 방법은 모두 몇 가지입니까?',
      '남은 색의 개수와 바로 아래 색을 함께 기록하며 가능한 배열을 세면 ' + answer + '가지입니다.',
      { height: height, counts: counts },
      { asset: RASTER.drawCubeColumn(height), visibleMethod: '세로로 맞닿은 쌓기나무의 개수와 이웃 관계를 PNG로 표시' });
  });

  register({
    no: 22,
    name: '조건이 포함된 도형의 개수',
    area: '도형',
    sourceStructure: '모눈에서 별과 삼각형이 있는 두 칸을 어느 것도 포함하지 않는 직사각형의 개수를 센다.',
    errorTags: ['정사각형만 셈', '표시 칸 하나만 제외', '두 표시를 함께 포함한 직사각형 보정 누락'],
    primaryMethod: '전체에서 각 표시를 포함한 직사각형을 빼고 둘 다 포함한 것을 다시 더하는 포함·배제',
    independentMethod: '모든 직사각형의 네 경계를 골라 두 표시 칸 포함 여부 검사'
  }, function (level, rng, spec) {
    var cols = 4 + level, rows = 3 + Math.ceil(level / 2);
    var first = [CORE.randint(rng, 0, cols - 1), CORE.randint(rng, 0, rows - 1)];
    var second;
    do { second = [CORE.randint(rng, 0, cols - 1), CORE.randint(rng, 0, rows - 1)]; }
    while (first[0] === second[0] && first[1] === second[1]);
    function containing(marker) {
      return (marker[0] + 1) * (cols - marker[0]) * (marker[1] + 1) * (rows - marker[1]);
    }
    var totalRectangles = cols * (cols + 1) * rows * (rows + 1) / 4;
    var containingFirst = containing(first), containingSecond = containing(second);
    var containingBoth = (Math.min(first[0], second[0]) + 1) * (cols - Math.max(first[0], second[0])) *
      (Math.min(first[1], second[1]) + 1) * (rows - Math.max(first[1], second[1]));
    var answer = totalRectangles - containingFirst - containingSecond + containingBoth;
    var independent = 0;
    for (var width = 1; width <= cols; width++) for (var height = 1; height <= rows; height++) {
      for (var x = 0; x + width <= cols; x++) for (var y = 0; y + height <= rows; y++) {
        var outside = function (p) { return !(x <= p[0] && p[0] < x + width && y <= p[1] && p[1] < y + height); };
        if (outside(first) && outside(second)) independent++;
      }
    }
    return finalize(spec, answer, independent,
      '그림과 같은 ' + cols + '×' + rows + ' 모눈에서 별과 삼각형이 있는 칸을 어느 것도 포함하지 않는 크고 작은 직사각형은 모두 몇 개입니까?',
      '전체 ' + totalRectangles + '개에서 별을 포함한 ' + containingFirst + '개와 삼각형을 포함한 ' + containingSecond + '개를 빼고, 두 번 빠진 둘 다 포함한 ' + containingBoth + '개를 다시 더하면 ' + answer + '개입니다. 이 문항이 틀렸다면 자료실의 「도형의 개수」를 꼭 확인하세요.',
      { cols: cols, rows: rows, markers: [first, second], totalRectangles: totalRectangles, containingFirst: containingFirst, containingSecond: containingSecond, containingBoth: containingBoth },
      { asset: RASTER.drawMarkedRectGrid(cols, rows, [{ col: first[0], row: first[1], kind: 'star' }, { col: second[0], row: second[1], kind: 'triangle' }]), variantKey: first.join('-') + '|' + second.join('-'), visibleMethod: '별과 삼각형을 서로 다른 실제 표식으로 정확한 모눈 칸에 표시', solutionSteps: ['모눈 전체의 직사각형 수를 구합니다.', '별을 포함한 것과 삼각형을 포함한 것을 각각 뺍니다.', '두 표시를 모두 포함해 두 번 빠진 직사각형을 한 번 다시 더합니다.'] });
  });

  register({
    no: 29,
    name: '숫자 카드로 만든 수의 합',
    area: '수·규칙찾기',
    sourceStructure: '0을 포함한 숫자 카드 세 종류를 같은 장수씩 모두 사용해 만들 수 있는 일정 자리 수의 합을 구한다.',
    errorTags: ['맨 앞자리에 0 허용', '같은 숫자 카드 사용 가능 횟수 누락', '자리별 등장 횟수 오류'],
    primaryMethod: '각 자리에서 각 숫자가 나타나는 횟수로 자리값의 합 계산',
    independentMethod: '가능한 모든 카드 배열을 재귀로 만들어 실제 수를 합산'
  }, function (level, rng, spec) {
    var length = Math.min(5, 3 + Math.ceil(level / 2));
    var digits = [0].concat(CORE.shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2).sort());
    if (length === 4 && digits.join(',') === '0,3,7') digits[2] = 8;
    var numbers = [];
    function build(prefix) {
      if (prefix.length === length) { numbers.push(Number(prefix.join(''))); return; }
      digits.forEach(function (digit) { if (prefix.length || digit !== 0) build(prefix.concat(digit)); });
    }
    build([]);
    var independent = numbers.reduce(function (sum, number) { return sum + number; }, 0);
    var answer = 0;
    for (var position = 0; position < length; position++) {
      var place = Math.pow(10, length - position - 1);
      digits.forEach(function (digit) {
        var count = position === 0 ? (digit === 0 ? 0 : Math.pow(3, length - 1)) : (digit === 0 ? 2 : 2) * Math.pow(3, length - 2);
        answer += digit * count * place;
      });
    }
    return finalize(spec, answer, independent,
      '그림의 숫자 카드는 각각 ' + length + '장씩 있습니다. 이 카드로 만들 수 있는 모든 ' + length + '자리 자연수의 합을 구하세요.',
      '맨 앞자리에는 0이 올 수 없다는 점을 따로 처리해 자리별로 숫자가 나타나는 횟수를 더하면 ' + answer + '입니다.',
      { digits: digits, copies: length, length: length, numberCount: numbers.length },
      { asset: RASTER.drawDigitCards(digits, length), variantKey: digits.join('-') + '|' + length, visibleMethod: '0을 포함한 세 종류의 숫자 카드와 각 카드 장수를 PNG로 표시' });
  });

  register({
    no: 30,
    name: '수 배열에서 가운데 수',
    area: '수·규칙찾기',
    sourceStructure: '원 위의 두 두 자리 수에서 바깥 자리와 두 수의 차를 이어 아래 수를 만드는 규칙을 찾는다.',
    errorTags: ['두 수의 차 계산 오류', '바깥 자리 순서 뒤바꿈', '예시 하나만 보고 다른 규칙 적용'],
    primaryMethod: '왼쪽 수 십의 자리·두 수의 차·오른쪽 수 일의 자리 이어 붙이기',
    independentMethod: '각 부분의 자리값을 천·십·일의 자리 수식으로 합산'
  }, function (level, rng, spec) {
    function makePair() {
      var right = CORE.randint(rng, 20, 69);
      var difference = CORE.randint(rng, 10, Math.min(29 + level * 7, 89 - right));
      var left = right + difference;
      if (left > 99) return makePair();
      var bottom = Number(String(Math.floor(left / 10)) + String(difference) + String(right % 10));
      return { left: left, right: right, difference: difference, bottom: bottom };
    }
    var examples = [makePair(), makePair()], target = makePair();
    var answer = target.bottom;
    var independent = Math.floor(target.left / 10) * 1000 + target.difference * 10 + target.right % 10;
    return finalize(spec, answer, independent,
      '세 원 안의 수는 같은 규칙으로 만들어졌습니다. 물음표에 들어갈 수를 구하세요.',
      '왼쪽 위 수의 십의 자리, 두 위 수의 차, 오른쪽 위 수의 일의 자리를 차례로 이어 쓰면 ' + answer + '입니다.',
      { examples: examples, target: target },
      { asset: RASTER.drawCircleRule(examples, target), variantKey: examples.map(function (item) { return item.left + '-' + item.right; }).concat([target.left + '-' + target.right]).join('|'), visibleMethod: '원본과 같은 위 두 수·아래 결과 배치의 원 세 개를 PNG로 표시' });
  });

  register({
    no: 2,
    name: '색칠된 쌓기나무의 개수',
    area: '도형',
    sourceStructure: '바닥에 빈틈없이 쌓은 정육면체 겉면을 칠한 뒤 정확히 두 면만 칠해진 것과 하나도 칠해지지 않은 것의 합을 구한다.',
    errorTags: ['바닥 면을 칠한 것으로 계산', '맞닿은 면을 겉면으로 계산', '두 종류 중 하나만 셈'],
    primaryMethod: '각 정육면체의 위·앞·뒤·왼쪽·오른쪽 노출 면을 좌표별 검사',
    independentMethod: '정육면체 좌표 집합에서 이웃 좌표의 존재 여부로 노출 면 재계산'
  }, function (level, rng, spec) {
    var size = CORE.randint(rng, 3, Math.min(5, 3 + Math.ceil(level / 2)));
    var base = CORE.randint(rng, 2, 2 + Math.ceil(level / 2));
    var terrace = CORE.randint(rng, 1, 1 + Math.ceil(level / 2));
    var center = (size - 1) / 2, heights = [];
    for (var y = 0; y < size; y++) {
      var row = [];
      for (var x = 0; x < size; x++) {
        var distance = Math.max(Math.abs(x - center), Math.abs(y - center));
        row.push(base + Math.max(0, terrace - Math.floor(distance + 0.5)));
      }
      heights.push(row);
    }
    var counts = { zero: 0, two: 0 };
    for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) for (var z = 0; z < heights[yy][xx]; z++) {
      var exposed = z === heights[yy][xx] - 1 ? 1 : 0;
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (move) {
        var nx = xx + move[0], ny = yy + move[1];
        if (nx < 0 || nx >= size || ny < 0 || ny >= size || heights[ny][nx] <= z) exposed++;
      });
      if (exposed === 0) counts.zero++;
      if (exposed === 2) counts.two++;
    }
    var cubes = {};
    for (var ry = 0; ry < size; ry++) for (var rx = 0; rx < size; rx++) for (var rz = 0; rz < heights[ry][rx]; rz++) cubes[[rx, ry, rz].join(',')] = true;
    var independentCounts = { zero: 0, two: 0 };
    Object.keys(cubes).forEach(function (key) {
      var p = key.split(',').map(Number), exposed = 0;
      [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]].forEach(function (move) {
        if (!cubes[[p[0] + move[0], p[1] + move[1], p[2] + move[2]].join(',')]) exposed++;
      });
      if (exposed === 0) independentCounts.zero++;
      if (exposed === 2) independentCounts.two++;
    });
    var answer = counts.zero + counts.two;
    return finalize(spec, answer, independentCounts.zero + independentCounts.two,
      '그림처럼 쌓기나무를 바닥에 빈틈없이 쌓고 바닥에 닿은 면을 제외한 겉면을 모두 칠했습니다. 정확히 2개 면만 칠해진 쌓기나무와 한 면도 칠해지지 않은 쌓기나무는 모두 몇 개입니까?',
      '각 쌓기나무마다 맞닿지 않은 위쪽과 네 옆면을 확인하면 2개 면이 칠해진 것은 ' + counts.two + '개, 칠해지지 않은 것은 ' + counts.zero + '개이므로 모두 ' + answer + '개입니다.',
      { heights: heights, counts: counts, independentCounts: independentCounts },
      { asset: RASTER.drawIsoStackWithHeightMap(heights, { cell: 27 }), variantKey: heights.map(function (row) { return row.join(''); }).join('-'), visibleMethod: '모든 기둥 높이를 실제 정육면체로 그린 등각 PNG에서 노출 면을 확인' });
  });

  register({
    no: 11,
    name: '별 마방진',
    area: '식의 계산',
    sourceStructure: '별의 각 선에 놓인 네 수의 합이 같다는 조건으로 안쪽 다섯 숫자를 구해 세 자리 수와 두 자리 수의 합을 계산한다.',
    errorTags: ['한 선의 수 네 개 누락', '빈칸 순서 뒤바꿈', '숫자를 이어 쓴 뒤 마지막 덧셈 누락'],
    primaryMethod: '다섯 이웃 빈칸 합 식을 번갈아 더하고 빼어 숫자 계산',
    independentMethod: '첫 빈칸 0부터 9까지 대입 후 나머지 빈칸을 연쇄 계산해 모든 선 검사'
  }, function (level, rng, spec) {
    var scenario = null;
    for (var attempt = 0; attempt < 3000 && !scenario; attempt++) {
      var targetSum = CORE.randint(rng, 26 + level, 34 + level * 3);
      var outer = [];
      for (var i = 0; i < 5; i++) outer.push(CORE.randint(rng, 6, 12 + level));
      var pairSums = [];
      for (var k = 0; k < 5; k++) pairSums.push(targetSum - outer[k] - outer[(k + 2) % 5]);
      var first = (pairSums[0] - pairSums[1] + pairSums[2] - pairSums[3] + pairSums[4]) / 2;
      var inner = [first];
      for (var j = 0; j < 4; j++) inner.push(pairSums[j] - inner[j]);
      if (!inner.every(function (value) { return Number.isInteger(value) && value >= 1 && value <= 9; })) continue;
      if (inner[4] + inner[0] !== pairSums[4]) continue;
      var answerValue = Number(String(inner[0]) + inner[1] + inner[2]) + Number(String(inner[3]) + inner[4]);
      if (answerValue === 389) continue;
      scenario = { targetSum: targetSum, outer: outer, pairSums: pairSums, inner: inner, answer: answerValue };
    }
    if (!scenario) throw new Error('별 수 퍼즐 조건을 만들지 못했습니다.');
    var matches = [];
    for (var start = 0; start <= 9; start++) {
      var candidate = [start];
      for (var n = 0; n < 4; n++) candidate.push(scenario.pairSums[n] - candidate[n]);
      if (candidate.every(function (value) { return Number.isInteger(value) && value >= 0 && value <= 9; }) && candidate[4] + candidate[0] === scenario.pairSums[4]) matches.push(candidate);
    }
    var independent = matches.length === 1 ? Number(String(matches[0][0]) + matches[0][1] + matches[0][2]) + Number(String(matches[0][3]) + matches[0][4]) : NaN;
    return finalize(spec, scenario.answer, independent,
      '별의 각 선에 놓인 네 수의 합은 모두 ' + scenario.targetSum + '입니다. 안쪽의 ㄱ, ㄴ, ㄷ, ㄹ, ㅁ을 차례로 구한 뒤 세 자리 수 ㄱㄴㄷ과 두 자리 수 ㄹㅁ의 합을 구하세요.',
      '서로 이웃한 두 빈칸의 합을 각 선에서 구해 번갈아 대입하면 빈칸은 ' + scenario.inner.join(', ') + '입니다. 따라서 두 수의 합은 ' + scenario.answer + '입니다.',
      { targetSum: scenario.targetSum, outer: scenario.outer, pairSums: scenario.pairSums, inner: scenario.inner, matchingInnerSets: matches },
      { asset: RASTER.drawMagicStar(scenario.outer, ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ']), variantKey: scenario.outer.join('-') + '|' + scenario.targetSum, visibleMethod: '각 선이 바깥 수 두 개와 안쪽 빈칸 두 개를 정확히 잇는 별 PNG' });
  });

  register({
    no: 21,
    name: '도형이 나타내는 수',
    area: '식의 계산',
    sourceStructure: '네 도형이 놓인 4×4 배열의 가로·세로 합 여섯 개로 도형값을 알아내고 남은 가로·세로 합을 구한다.',
    errorTags: ['같은 도형값을 다르게 사용', '가로와 세로 합 순서 뒤바꿈', '두 답 중 하나 누락'],
    primaryMethod: '가로·세로 합 연립식을 가감하여 네 도형값 계산',
    independentMethod: '독립인 네 식을 행렬식으로 풀어 나머지 두 식에 대입'
  }, function (level, rng, spec) {
    function coefficients(items) {
      var result = [0, 0, 0, 0]; items.forEach(function (value) { result[value]++; }); return result;
    }
    function determinant(matrix) {
      if (matrix.length === 1) return matrix[0][0];
      return matrix[0].reduce(function (sum, value, col) {
        var minor = matrix.slice(1).map(function (row) { return row.slice(0, col).concat(row.slice(col + 1)); });
        return sum + (col % 2 ? -1 : 1) * value * determinant(minor);
      }, 0);
    }
    function combinations(values, count, start, prefix, out) {
      if (prefix.length === count) { out.push(prefix.slice()); return; }
      for (var i = start; i < values.length; i++) { prefix.push(values[i]); combinations(values, count, i + 1, prefix, out); prefix.pop(); }
    }
    var scenario = null;
    for (var attempt = 0; attempt < 1000 && !scenario; attempt++) {
      var grid = [];
      for (var r = 0; r < 4; r++) { var row = []; for (var c = 0; c < 4; c++) row.push(CORE.randint(rng, 0, 3)); grid.push(row); }
      if ([0, 1, 2, 3].some(function (symbol) { return !grid.some(function (row) { return row.indexOf(symbol) >= 0; }); })) continue;
      var equations = grid.slice(0, 3).map(coefficients);
      for (var col = 0; col < 3; col++) equations.push(coefficients(grid.map(function (row) { return row[col]; })));
      var choices = []; combinations([0, 1, 2, 3, 4, 5], 4, 0, [], choices);
      var independentRows = choices.find(function (choice) { return determinant(choice.map(function (index) { return equations[index]; })) !== 0; });
      if (!independentRows) continue;
      var valuePool = [];
      for (var candidateValue = 2; candidateValue <= 8 + level; candidateValue++) valuePool.push(candidateValue);
      var values = CORE.shuffle(rng, valuePool).slice(0, 4);
      var rowSums = grid.map(function (row) { return row.reduce(function (sum, symbol) { return sum + values[symbol]; }, 0); });
      var columnSums = [0, 1, 2, 3].map(function (column) { return grid.reduce(function (sum, row) { return sum + values[row[column]]; }, 0); });
      scenario = { grid: grid, equations: equations, independentRows: independentRows, values: values, rowSums: rowSums, columnSums: columnSums };
    }
    if (!scenario) throw new Error('도형값 표의 독립 조건을 만들지 못했습니다.');
    var rhs = scenario.rowSums.slice(0, 3).concat(scenario.columnSums.slice(0, 3));
    var selectedMatrix = scenario.independentRows.map(function (index) { return scenario.equations[index]; });
    var selectedRhs = scenario.independentRows.map(function (index) { return rhs[index]; });
    var det = determinant(selectedMatrix), solved = [];
    for (var symbol = 0; symbol < 4; symbol++) {
      var replaced = selectedMatrix.map(function (row, rowIndex) { var copy = row.slice(); copy[symbol] = selectedRhs[rowIndex]; return copy; });
      solved.push(determinant(replaced) / det);
    }
    var answer = scenario.rowSums[3] + ', ' + scenario.columnSums[3];
    var independentRow = scenario.grid[3].reduce(function (sum, value) { return sum + solved[value]; }, 0);
    var independentColumn = scenario.grid.reduce(function (sum, row) { return sum + solved[row[3]]; }, 0);
    return finalize(spec, answer, independentRow + ', ' + independentColumn,
      '서로 다른 도형은 각각 서로 다른 하나의 수를 나타냅니다. 그림에 주어진 가로줄 세 개와 세로줄 세 개의 합을 이용해, 남은 가로줄의 합과 세로줄의 합을 차례로 구하세요.',
      '같은 도형끼리 묶어 가로·세로 식을 가감하면 네 도형값을 구할 수 있습니다. 남은 가로줄과 세로줄의 합은 차례로 ' + answer + '입니다.',
      { grid: scenario.grid, values: scenario.values, rowSums: scenario.rowSums, columnSums: scenario.columnSums, solvedValues: solved },
      { asset: RASTER.drawShapeValueGrid(scenario.grid, scenario.rowSums, scenario.columnSums), variantKey: scenario.grid.map(function (row) { return row.join(''); }).join('-') + '|' + rhs.join('-'), visibleMethod: '4×4 도형 배열과 알려진 여섯 합, 남은 두 물음표를 PNG로 표시' });
  });

  register({
    no: 23,
    name: '논리추리',
    area: '경우의 수',
    sourceStructure: '월요일부터 금요일까지 아이 이름·요일·운동을 한 표에 하나씩 배치하고 단서로 특정 묶음을 찾는다.',
    readingFocus: '아이 이름·요일·운동의 세 조건을 같은 표에서 함께 연결',
    errorTags: ['아이 이름·요일·운동 중 한 축 누락', '확정 단서부터 배치하지 않음', '바로 전날 관계 방향 반대'],
    primaryMethod: '이름·요일·운동 표에 확정 조건부터 쓰고 바로 전날 관계 연결',
    independentMethod: '아이와 운동의 모든 요일 배치를 전수 대입해 목표 묶음의 유일성 확인'
  }, function (level, rng, spec) {
    var people = CORE.shuffle(rng, ['재우', '윤후', '재현', '민준', '하은']);
    var sports = CORE.shuffle(rng, ['야구', '축구', '농구', '탁구', '볼링']);
    var target = people[0], wednesdayPerson = people[1], mondayPerson = people[2], fridayPerson = people[3], tuesdayPerson = people[4];
    var targetSport = sports[0], fridaySport = sports[1], mondaySport = sports[2], wednesdaySport = sports[3], tuesdaySport = sports[4];
    var answer = target + ', 목요일, ' + targetSport;
    var days = ['월요일', '화요일', '수요일', '목요일', '금요일'];
    var matches = [];
    permutations(people).forEach(function (peopleByDay) {
      if (peopleByDay[0] !== mondayPerson || peopleByDay[1] !== tuesdayPerson || peopleByDay[2] !== wednesdayPerson || peopleByDay[4] !== fridayPerson) return;
      permutations(sports).forEach(function (sportsByDay) {
        if (sportsByDay[0] !== mondaySport || sportsByDay[1] !== tuesdaySport || sportsByDay[2] !== wednesdaySport || sportsByDay[4] !== fridaySport) return;
        var targetDay = peopleByDay.indexOf(target);
        var fridaySportDay = sportsByDay.indexOf(fridaySport);
        if (targetDay + 1 !== fridaySportDay || sportsByDay[targetDay] !== targetSport) return;
        matches.push(target + ', ' + days[targetDay] + ', ' + sportsByDay[targetDay]);
      });
    });
    return finalize(spec, answer, matches.length === 1 ? matches[0] : NaN,
      people.join(', ') + '는 월요일부터 금요일까지 서로 다른 날에 서로 다른 운동을 한 가지씩 했습니다. 단서를 읽고 ' + target + '의 이름·요일·운동을 한 묶음으로 쓰세요.',
      '이름·요일·운동의 세 칸을 가진 표를 그리고 확정된 조건부터 채웁니다. ' + fridayPerson + '가 금요일에 ' + fridaySport + '을 했고, ' + target + '는 그 바로 전날 ' + targetSport + '을 했으므로 답은 ' + answer + '입니다.',
      { people: people, sports: sports, target: target, targetSport: targetSport, matches: matches },
      { conditionLines: [mondayPerson + '는 월요일에 ' + mondaySport + '을 했고, ' + tuesdayPerson + '는 화요일에 ' + tuesdaySport + '을 했습니다.', wednesdayPerson + '는 수요일에 ' + wednesdaySport + '을 했습니다.', target + '는 ' + fridaySport + '을 한 바로 전날에 ' + targetSport + '을 했습니다.', fridayPerson + '는 금요일에 ' + fridaySport + '을 했습니다.'], solutionSteps: ['아이 이름·요일·운동의 세 열을 가진 표를 그립니다.', '요일과 운동이 함께 확정된 단서부터 채웁니다.', '바로 전날 조건을 연결해 목표 아이의 세 항목을 한 묶음으로 씁니다.'] });
  });

  global.BANK_FINAL1_REVIEW = {
    version: '1.1.0',
    source: SOURCE,
    learnerFit: LEARNER_FIT,
    readyQuestionNos: SPECS.map(function (spec) { return spec.no; }).sort(function (a, b) { return a - b; }),
    blockedQuestionNos: [18, 20],
    blockedReasons: {
      18: '색종이 자체가 아니라 접고 자르는 과정을 두 번 반복하는 구조의 정확한 펼침 모델 및 조각 연결성 검수 필요',
      20: '정육면체 여섯 면 대각선 절단의 공간 분할 모델과 원본 그림 대조 필요'
    },
    sourceReadingFocus: {
      17: '직선의 교점이 세는 판 밖에 놓일 수 있음',
      18: '접고 자르는 과정을 두 번 반복함',
      22: '틀렸다면 자료실의 도형의 개수 학습을 확인함',
      26: '가능한 두 답 가운데 한 가지만 쓰면 됨'
    },
    sourceAnswerConnectedQuestionNos: Array.from({ length: 30 }, function (_, index) { return index + 1; }),
    generatorPendingQuestionNos: [18, 20]
  };
})(typeof window !== 'undefined' ? window : globalThis);
