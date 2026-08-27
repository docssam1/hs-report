/*!
 * GFIELD BULL BANK - inclusion/exclusion, minimum or exact overlap
 * Practice-only generator. Source-faithful approval is handled separately.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  var RASTER = global.BANK_RASTER;
  if (!CORE || !RASTER) throw new Error('inclusion generator requires BANK_CORE and BANK_RASTER');

  var CONTEXTS = [
    { first: '축구를 좋아하는 학생', second: '수영을 좋아하는 학생' },
    { first: '딸기를 좋아하는 학생', second: '포도를 좋아하는 학생' },
    { first: '독서 모임에 참가한 학생', second: '과학 모임에 참가한 학생' }
  ];
  var LEVEL_PROFILES = {
    1: { mode: 'minimum', totalMin: 12, totalMax: 20, extraConditionCount: 0 },
    2: { mode: 'minimum', totalMin: 21, totalMax: 30, extraConditionCount: 0 },
    3: { mode: 'exact', totalMin: 31, totalMax: 40, extraConditionCount: 1 },
    4: { mode: 'exact', totalMin: 41, totalMax: 55, extraConditionCount: 1 },
    5: { mode: 'exact', totalMin: 56, totalMax: 70, extraConditionCount: 1 }
  };

  function feasibleOverlaps(total, firstCount, secondCount) {
    var values = [];
    for (var overlap = 0; overlap <= Math.min(firstCount, secondCount); overlap++) {
      var union = firstCount + secondCount - overlap;
      if (union <= total && union >= Math.max(firstCount, secondCount)) values.push(overlap);
    }
    return values;
  }

  function minimumByFormula(total, firstCount, secondCount) {
    return Math.max(0, firstCount + secondCount - total);
  }

  function exactByFormula(total, firstCount, secondCount, neitherCount) {
    return firstCount + secondCount + neitherCount - total;
  }

  function exactByEnumeration(total, firstCount, secondCount, neitherCount) {
    return feasibleOverlaps(total, firstCount, secondCount).filter(function (overlap) {
      return total - (firstCount + secondCount - overlap) === neitherCount;
    });
  }

  function generateMinimum(profile, rng) {
    for (var attempt = 0; attempt < 300; attempt++) {
      var total = CORE.randint(rng, profile.totalMin, profile.totalMax);
      var intendedMinimum = CORE.randint(rng, 1, Math.max(1, Math.floor(total / 4)));
      var firstCount = CORE.randint(rng, Math.max(3, intendedMinimum + 1), total - 2);
      var secondCount = total + intendedMinimum - firstCount;
      if (secondCount < 3 || secondCount > total - 1) continue;
      var values = feasibleOverlaps(total, firstCount, secondCount);
      if (!values.length || values[0] !== intendedMinimum) continue;
      return {
        mode: 'minimum', total: total, firstCount: firstCount, secondCount: secondCount,
        neitherCount: null, answer: intendedMinimum, feasible: values
      };
    }
    throw new Error('minimum-overlap scenario could not be generated');
  }

  function generateExact(profile, rng) {
    for (var attempt = 0; attempt < 300; attempt++) {
      var total = CORE.randint(rng, profile.totalMin, profile.totalMax);
      var overlap = CORE.randint(rng, 2, Math.max(2, Math.floor(total / 4)));
      var neither = CORE.randint(rng, 1, Math.max(2, Math.floor(total / 6)));
      var remaining = total - overlap - neither;
      if (remaining < 4) continue;
      var onlyFirst = CORE.randint(rng, 2, remaining - 2);
      var onlySecond = remaining - onlyFirst;
      var firstCount = overlap + onlyFirst;
      var secondCount = overlap + onlySecond;
      var candidates = exactByEnumeration(total, firstCount, secondCount, neither);
      if (candidates.length !== 1 || candidates[0] !== overlap) continue;
      return {
        mode: 'exact', total: total, firstCount: firstCount, secondCount: secondCount,
        neitherCount: neither, answer: overlap, feasible: candidates
      };
    }
    throw new Error('exact-overlap scenario could not be generated');
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var profile = LEVEL_PROFILES[level];
    var context = CORE.pick(rng, CONTEXTS);
    var scenario = profile.mode === 'minimum' ? generateMinimum(profile, rng) : generateExact(profile, rng);
    var formulaAnswer = scenario.mode === 'minimum' ?
      minimumByFormula(scenario.total, scenario.firstCount, scenario.secondCount) :
      exactByFormula(scenario.total, scenario.firstCount, scenario.secondCount, scenario.neitherCount);
    var enumerated = scenario.mode === 'minimum' ? scenario.feasible[0] : scenario.feasible[0];
    if (formulaAnswer !== scenario.answer || enumerated !== scenario.answer) {
      throw new Error('inclusion independent verification mismatch');
    }

    var rows = [
      { label: '전체 학생', value: scenario.total + '명' },
      { label: '첫 번째 모임', value: context.first + ' ' + scenario.firstCount + '명', valueSize: 15 },
      { label: '두 번째 모임', value: context.second + ' ' + scenario.secondCount + '명', valueSize: 15 }
    ];
    if (scenario.mode === 'exact') rows.push({ label: '둘 다 아님', value: scenario.neitherCount + '명', accent: true });
    var asset = RASTER.drawConditionCard(
      scenario.mode === 'minimum' ? '두 모임에 모두 속한 최소 인원' : '두 모임에 모두 속한 정확한 인원',
      rows,
      {
        width: 720,
        labelRatio: 0.27,
        footer: scenario.mode === 'minimum' ? '같은 학생을 두 번 세지 않도록 생각해요.' : '어느 모임에도 속하지 않은 학생도 합계에 포함해요.',
        description: '전체 인원과 두 모임의 인원, 추가 조건을 행별로 보여 주는 표'
      }
    );

    var text;
    var solution;
    if (scenario.mode === 'minimum') {
      text = '전체 ' + scenario.total + '명 중 ' + context.first + '의 수는 ' + scenario.firstCount + '명, ' +
        context.second + '의 수는 ' + scenario.secondCount + '명입니다. 두 모임에 모두 속한 학생은 적어도 몇 명입니까?';
      solution = '두 모임의 인원을 합하면 ' + (scenario.firstCount + scenario.secondCount) + '명입니다. 전체 ' + scenario.total + '명을 넘는 ' + scenario.answer + '명은 반드시 두 모임에 모두 속합니다.';
    } else {
      text = '전체 ' + scenario.total + '명 중 ' + context.first + '의 수는 ' + scenario.firstCount + '명, ' +
        context.second + '의 수는 ' + scenario.secondCount + '명이고, 둘 다 아닌 학생은 ' + scenario.neitherCount + '명입니다. 두 모임에 모두 속한 학생은 몇 명입니까?';
      solution = '적어도 한 모임에 속한 학생은 ' + (scenario.total - scenario.neitherCount) + '명입니다. 두 모임의 인원을 합한 것에서 이 인원을 빼면 두 모임에 모두 속한 학생은 ' + scenario.answer + '명입니다.';
    }

    return {
      text: text,
      asset: asset,
      answer: scenario.answer,
      solution: solution,
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: {
          method: scenario.mode === 'minimum' ? 'minimum-overlap subtraction formula' : 'union-and-neither subtraction formula',
          answer: formulaAnswer
        },
        independent: {
          method: 'enumerate every feasible overlap and keep the condition-matching value',
          answer: enumerated
        },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'the total, both group counts, and any neither condition are shown in separate rows' }
      },
      meta: {
        mode: scenario.mode,
        total: scenario.total,
        firstCount: scenario.firstCount,
        secondCount: scenario.secondCount,
        neitherCount: scenario.neitherCount,
        feasibleOverlaps: scenario.mode === 'minimum' ? scenario.feasible : feasibleOverlaps(scenario.total, scenario.firstCount, scenario.secondCount)
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'inclusion',
    version: '1.0.0',
    name: '포함과 배제 최소·정확 수',
    area: '경우의 수',
    gradeBand: '초2~초3',
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _feasibleOverlaps: feasibleOverlaps,
    _minimumByFormula: minimumByFormula,
    _exactByFormula: exactByFormula,
    _exactByEnumeration: exactByEnumeration
  });
})(typeof window !== 'undefined' ? window : globalThis);
