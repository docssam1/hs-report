/*!
 * GFIELD BULL BANK - find one number from remainder conditions
 * Practice-only generator. Source-faithful approval is handled separately.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  var RASTER = global.BANK_RASTER;
  if (!CORE || !RASTER) throw new Error('remainder generator requires BANK_CORE and BANK_RASTER');

  var LEVEL_PROFILES = {
    1: { conditionCount: 1, modulusSets: [[3], [4], [5], [6]], answerMin: 8, answerMax: 35, widthMin: 2, widthMax: 5 },
    2: { conditionCount: 2, modulusSets: [[2, 3], [3, 4], [3, 5]], answerMin: 15, answerMax: 60, widthMin: 5, widthMax: 11 },
    3: { conditionCount: 2, modulusSets: [[4, 5], [5, 6], [5, 7]], answerMin: 30, answerMax: 100, widthMin: 12, widthMax: 25 },
    4: { conditionCount: 3, modulusSets: [[2, 3, 5], [3, 4, 5], [3, 5, 7]], answerMin: 45, answerMax: 150, widthMin: 25, widthMax: 50 },
    5: { conditionCount: 3, modulusSets: [[4, 5, 7], [5, 7, 8], [5, 8, 9]], answerMin: 80, answerMax: 240, widthMin: 60, widthMax: 110 }
  };

  function gcd(a, b) {
    while (b) {
      var temp = a % b;
      a = b;
      b = temp;
    }
    return Math.abs(a);
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function allMatch(value, conditions) {
    return conditions.every(function (condition) {
      return value % condition.divisor === condition.remainder;
    });
  }

  function enumerateEveryNumber(minimum, maximum, conditions) {
    var values = [];
    for (var value = minimum; value <= maximum; value++) {
      if (allMatch(value, conditions)) values.push(value);
    }
    return values;
  }

  function enumerateByFirstStep(minimum, maximum, conditions) {
    var values = [];
    var first = conditions[0];
    var start = minimum;
    while (start <= maximum && start % first.divisor !== first.remainder) start++;
    for (var value = start; value <= maximum; value += first.divisor) {
      if (allMatch(value, conditions)) values.push(value);
    }
    return values;
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var profile = LEVEL_PROFILES[level];
    var divisors = CORE.pick(rng, profile.modulusSets).slice();
    var period = divisors.reduce(function (value, divisor) { return lcm(value, divisor); }, 1);
    var answer = CORE.randint(rng, profile.answerMin, profile.answerMax);
    var conditions = divisors.map(function (divisor) {
      return { divisor: divisor, remainder: answer % divisor };
    });
    var widthUpper = Math.min(profile.widthMax, period - 1);
    var widthLower = Math.min(profile.widthMin, widthUpper);
    var width = CORE.randint(rng, widthLower, widthUpper);
    var left = CORE.randint(rng, 0, Math.min(width, answer - 1));
    var minimum = answer - left;
    var maximum = minimum + width;
    if (maximum < answer) {
      maximum = answer;
      minimum = answer - width;
    }

    var primaryCandidates = enumerateByFirstStep(minimum, maximum, conditions);
    var independentCandidates = enumerateEveryNumber(minimum, maximum, conditions);
    if (primaryCandidates.length !== 1 || independentCandidates.length !== 1 ||
        primaryCandidates[0] !== answer || independentCandidates[0] !== answer) {
      throw new Error('remainder unique-answer verification mismatch');
    }

    var rows = [{ label: '찾는 범위', value: minimum + '부터 ' + maximum + '까지', accent: true }];
    conditions.forEach(function (condition) {
      rows.push({
        label: condition.divisor + '로 나누기',
        value: '나머지 ' + condition.remainder
      });
    });
    var asset = RASTER.drawConditionCard('나머지 조건에 맞는 수', rows, {
      footer: '범위 안의 수만 하나씩 확인해요.',
      description: '수의 범위와 각 나머지 조건을 행별로 보여 주는 표'
    });
    var conditionText = conditions.map(function (condition) {
      return condition.divisor + '로 나누었을 때 나머지가 ' + condition.remainder + '인';
    }).join(', ');

    return {
      text: minimum + '부터 ' + maximum + '까지의 수 중에서 ' + conditionText + ' 수를 찾으세요.',
      asset: asset,
      answer: answer,
      solution: '첫 번째 나머지 조건에 맞는 수를 ' + minimum + '부터 차례로 찾고, 나머지 조건도 모두 확인하면 답은 ' + answer + '입니다.',
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'step through numbers matching the first remainder, then check the rest', answer: primaryCandidates[0] },
        independent: { method: 'test every integer in the printed range against every remainder condition', answer: independentCandidates[0] },
        unique: true,
        validAnswerCount: independentCandidates.length,
        visibleEvidence: { passed: true, method: 'the inclusive range and every divisor-remainder condition are printed in separate rows' }
      },
      meta: {
        minimum: minimum,
        maximum: maximum,
        rangeWidth: width,
        period: period,
        conditions: conditions,
        candidates: independentCandidates
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'remainder',
    version: '1.0.0',
    name: '나머지 조건 수 찾기',
    area: '식의 계산',
    gradeBand: '초2~초3',
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _gcd: gcd,
    _lcm: lcm,
    _enumerateByFirstStep: enumerateByFirstStep,
    _enumerateEveryNumber: enumerateEveryNumber
  });
})(typeof window !== 'undefined' ? window : globalThis);
