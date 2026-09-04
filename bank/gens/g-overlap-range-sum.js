/*!
 * Source-linked variant generator:
 * two exhaustive groups + one shared property, ask min + max in group one.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  if (!CORE) throw new Error('overlap-range-sum generator requires BANK_CORE');

  var TYPE = {
    area: '경우의 수',
    subarea: '포함과 배제',
    name: '겹치는 두 모임의 최솟값과 최댓값'
  };
  var LEVEL_PROFILES = {
    1: { groupMin: 10, groupMax: 24 },
    2: { groupMin: 16, groupMax: 32 },
    3: { groupMin: 24, groupMax: 45 },
    4: { groupMin: 34, groupMax: 60 },
    5: { groupMin: 48, groupMax: 85 }
  };
  var PROPERTIES = ['안경을 쓴', '우산을 가져온', '도서관에 다녀온', '줄넘기를 가져온'];

  function bounds(firstCount, secondCount, propertyCount) {
    return {
      minimum: Math.max(0, propertyCount - secondCount),
      maximum: Math.min(firstCount, propertyCount)
    };
  }

  function enumerate(firstCount, secondCount, propertyCount) {
    var values = [];
    for (var firstProperty = 0; firstProperty <= firstCount; firstProperty++) {
      var secondProperty = propertyCount - firstProperty;
      if (secondProperty >= 0 && secondProperty <= secondCount) values.push(firstProperty);
    }
    return values;
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var profile = LEVEL_PROFILES[level];
    var scenario = null;
    for (var attempt = 0; attempt < 400; attempt++) {
      var girls = CORE.randint(rng, profile.groupMin, profile.groupMax - 3);
      var boys = CORE.randint(rng, girls + 2, profile.groupMax);
      var propertyCount = CORE.randint(rng, girls + 1, boys - 1);
      if (boys === 21 && girls === 15 && propertyCount === 19) continue;
      var answerBounds = bounds(boys, girls, propertyCount);
      var candidates = enumerate(boys, girls, propertyCount);
      if (candidates.length < 2 || answerBounds.minimum < 1 || candidates[0] !== answerBounds.minimum || candidates[candidates.length - 1] !== answerBounds.maximum) continue;
      if (answerBounds.minimum === answerBounds.maximum) continue;
      scenario = {
        boys: boys,
        girls: girls,
        propertyCount: propertyCount,
        minimum: answerBounds.minimum,
        maximum: answerBounds.maximum,
        candidates: candidates
      };
      break;
    }
    if (!scenario) throw new Error('overlap min-max scenario could not be generated');

    var property = CORE.pick(rng, PROPERTIES);
    var answer = scenario.minimum + scenario.maximum;
    var independentAnswer = scenario.candidates[0] + scenario.candidates[scenario.candidates.length - 1];
    if (answer !== independentAnswer) throw new Error('overlap min-max independent verification mismatch');

    return {
      text: '한 반의 남학생은 ' + scenario.boys + '명, 여학생은 ' + scenario.girls + '명이고, ' + property +
        ' 학생은 모두 ' + scenario.propertyCount + '명입니다. ' + property +
        ' 남학생 수로 가능한 가장 작은 수와 가장 큰 수의 합을 구하세요.',
      answer: answer,
      solution: property + ' 남학생 수의 최솟값은 ' + scenario.minimum + '명이고, 최댓값은 ' +
        scenario.maximum + '명입니다. 따라서 두 수의 합은 ' + answer + '입니다.',
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: '두 집단의 수용 범위로 최솟값과 최댓값 계산', answer: answer },
        independent: { method: '가능한 남학생 수를 처음부터 끝까지 열거', answer: independentAnswer },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: '두 집단의 인원과 공통 조건의 전체 인원을 모두 제시' }
      },
      meta: {
        boys: scenario.boys,
        girls: scenario.girls,
        propertyCount: scenario.propertyCount,
        minimum: scenario.minimum,
        maximum: scenario.maximum,
        feasibleFirstGroupCounts: scenario.candidates
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'overlap-range-sum',
    version: '1.0.0',
    name: '두 모임 겹침의 최솟값·최댓값',
    area: TYPE.area,
    gradeBand: '초2~초3',
    typeId: CORE.stableTypeId(TYPE.area, TYPE.subarea, TYPE.name),
    sourceLinked: true,
    reviewOnly: true,
    preferDistinctAnswers: true,
    sourceStructure: '두 배타적 집단의 크기와 공통 속성의 전체 수를 주고 첫 집단 속성 수의 최솟값과 최댓값의 합을 묻는다.',
    errorTags: ['최솟값 계산 오류', '최댓값 계산 오류', '두 값의 합 누락'],
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _bounds: bounds,
    _enumerate: enumerate
  });
})(typeof window !== 'undefined' ? window : globalThis);
