/*!
 * Source-linked variant generator:
 * identify one number from three yes/no questions about division remainders.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  if (!CORE) throw new Error('remainder yes/no generator requires BANK_CORE');

  var TYPE = {
    area: '식의 계산',
    subarea: '나눗셈의 몫과 나머지',
    name: '서로 다른 세 조건의 교집합'
  };
  var LEVEL_PROFILES = {
    1: { divisorMin: 7, divisorMax: 18 },
    2: { divisorMin: 17, divisorMax: 26 },
    3: { divisorMin: 27, divisorMax: 38 },
    4: { divisorMin: 39, divisorMax: 54 },
    5: { divisorMin: 55, divisorMax: 75 }
  };

  function conditionValue(number, condition) {
    var remainder = number % condition.divisor;
    if (condition.kind === 'equals') return remainder === condition.value;
    if (condition.kind === 'greater') return remainder > condition.value;
    throw new Error('unknown remainder condition');
  }

  function matchingNumbers(rangeMin, rangeMax, conditions) {
    var matches = [];
    for (var number = rangeMin; number <= rangeMax; number++) {
      var passes = conditions.every(function (condition) {
        return conditionValue(number, condition) === condition.expected;
      });
      if (passes) matches.push(number);
    }
    return matches;
  }

  function conditionText(condition) {
    var relation = condition.kind === 'equals'
      ? '나머지가 ' + condition.value + '입니까?'
      : '나머지가 ' + condition.value + '보다 큽니까?';
    return condition.divisor + '로 나누었을 때 ' + relation + ' ' + (condition.expected ? '예' : '아니요');
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var profile = LEVEL_PROFILES[level];
    var scenario = null;

    for (var attempt = 0; attempt < 400; attempt++) {
      var mainDivisor = CORE.randint(rng, profile.divisorMin, profile.divisorMax);
      if (mainDivisor === 8) continue;
      var target = mainDivisor - CORE.pick(rng, [1, 2]);
      var checkDivisor = CORE.randint(rng, 3, Math.min(12, mainDivisor - 1));
      var conditions = [
        { divisor: 2, kind: 'equals', value: target % 2, expected: true },
        { divisor: checkDivisor, kind: 'greater', value: checkDivisor - 1, expected: false },
        { divisor: mainDivisor, kind: 'greater', value: mainDivisor - 3, expected: true }
      ];
      var matches = matchingNumbers(1, mainDivisor - 1, conditions);
      if (matches.length !== 1 || matches[0] !== target) continue;
      scenario = {
        rangeMin: 1,
        rangeMax: mainDivisor - 1,
        target: target,
        conditions: conditions,
        matches: matches
      };
      break;
    }
    if (!scenario) throw new Error('remainder yes/no scenario could not be generated');

    var answer = scenario.target;
    var independentAnswer = scenario.matches[0];
    if (answer !== independentAnswer) throw new Error('remainder yes/no independent verification mismatch');

    return {
      text: scenario.rangeMin + '부터 ' + scenario.rangeMax + '까지의 수 중 다음 세 조건을 모두 만족하는 수를 구하세요.',
      conditionLines: scenario.conditions.map(conditionText),
      answer: answer,
      solution: scenario.rangeMin + '부터 ' + scenario.rangeMax + '까지 차례로 확인하면 세 질문의 답이 모두 맞는 수는 ' +
        answer + ' 하나뿐입니다.',
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: '두 후보의 짝홀성과 나머지 범위를 결합', answer: answer },
        independent: { method: '제시 범위의 모든 수를 세 조건에 대입', answer: independentAnswer },
        unique: true,
        validAnswerCount: scenario.matches.length,
        visibleEvidence: { passed: true, method: '유한한 탐색 범위와 세 나머지 질문을 모두 제시' }
      },
      meta: {
        rangeMin: scenario.rangeMin,
        rangeMax: scenario.rangeMax,
        conditions: scenario.conditions,
        matchingNumbers: scenario.matches
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'remainder-yes-no',
    version: '1.0.0',
    name: '예·아니요 나머지 조건으로 수 찾기',
    area: TYPE.area,
    gradeBand: '초2~초3',
    typeId: CORE.stableTypeId(TYPE.area, TYPE.subarea, TYPE.name),
    sourceLinked: true,
    reviewOnly: true,
    preferDistinctAnswers: true,
    sourceStructure: '나머지에 관한 세 질문과 각각의 예·아니요 답을 주고 조건에 맞는 수를 찾는다.',
    errorTags: ['나머지 범위 오해', '예·아니요 조건 반대로 적용', '후보 검산 누락'],
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _conditionValue: conditionValue,
    _matchingNumbers: matchingNumbers
  });
})(typeof window !== 'undefined' ? window : globalThis);
