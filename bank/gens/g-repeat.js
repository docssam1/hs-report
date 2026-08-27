/*!
 * GFIELD BULL BANK - repeating Korean-character pattern
 * Practice-only generator. Source-faithful approval is handled separately.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  var RASTER = global.BANK_RASTER;
  if (!CORE || !RASTER) throw new Error('repeat generator requires BANK_CORE and BANK_RASTER');

  var CHARACTERS = ['가', '나', '다', '라', '마', '바', '사', '아'];
  var LEVEL_PROFILES = {
    1: { patternMin: 2, patternMax: 2, targetMin: 8, targetMax: 18 },
    2: { patternMin: 3, patternMax: 3, targetMin: 18, targetMax: 35 },
    3: { patternMin: 4, patternMax: 4, targetMin: 35, targetMax: 70 },
    4: { patternMin: 5, patternMax: 5, targetMin: 70, targetMax: 140 },
    5: { patternMin: 6, patternMax: 6, targetMin: 140, targetMax: 260 }
  };

  function answerByRemainder(pattern, target) {
    var position = target % pattern.length;
    if (position === 0) position = pattern.length;
    return pattern[position - 1];
  }

  function answerByEnumeration(pattern, target) {
    var answer = '';
    for (var count = 1; count <= target; count++) answer = pattern[(count - 1) % pattern.length];
    return answer;
  }

  function preview(pattern) {
    var result = [];
    var length = Math.min(18, pattern.length * 3);
    for (var i = 0; i < length; i++) result.push(pattern[i % pattern.length]);
    return result.join(' ');
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var profile = LEVEL_PROFILES[level];
    var patternLength = CORE.randint(rng, profile.patternMin, profile.patternMax);
    var pattern = CORE.shuffle(rng, CHARACTERS).slice(0, patternLength);
    var target = CORE.randint(rng, profile.targetMin, profile.targetMax);
    var primaryAnswer = answerByRemainder(pattern, target);
    var independentAnswer = answerByEnumeration(pattern, target);
    if (primaryAnswer !== independentAnswer) throw new Error('repeat independent verification mismatch');

    var patternText = pattern.join(' → ');
    var asset = RASTER.drawConditionCard('반복되는 글자 규칙', [
      { label: '반복 마디', value: patternText, accent: true },
      { label: '이어 쓴 모습', value: preview(pattern) + ' …', valueSize: 16 },
      { label: '찾을 자리', value: target + '번째 글자', accent: true }
    ], {
      footer: '반복 마디의 첫 글자를 1번째로 세어요.',
      description: '반복 글자 마디와 찾을 자리를 보여 주는 조건표'
    });

    return {
      text: patternText + ' 순서로 글자를 반복하여 이어 씁니다. ' + target + '번째에 오는 글자는 무엇입니까?',
      asset: asset,
      answer: primaryAnswer,
      solution: '반복 마디는 ' + patternLength + '글자입니다. ' + target + '을(를) ' + patternLength + '으로 나누어 마디 안의 자리를 찾으면 ' + primaryAnswer + '입니다.',
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'remainder position in one repeating block', answer: primaryAnswer },
        independent: { method: 'write and inspect every character through the requested position', answer: independentAnswer },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'the complete repeating block and requested position are printed in separate rows' }
      },
      meta: {
        pattern: pattern,
        target: target,
        patternLength: patternLength,
        preview: preview(pattern)
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'repeat',
    version: '1.0.0',
    name: '반복문자·주기',
    area: '수·규칙찾기',
    gradeBand: '초2~초3',
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _answerByRemainder: answerByRemainder,
    _answerByEnumeration: answerByEnumeration
  });
})(typeof window !== 'undefined' ? window : globalThis);
