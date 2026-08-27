/*!
 * GFIELD BULL BANK - moving dates and weekdays
 * Practice-only generator. Source-faithful approval is handled separately.
 */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  var RASTER = global.BANK_RASTER;
  if (!CORE || !RASTER) throw new Error('weekday generator requires BANK_CORE and BANK_RASTER');

  var MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  var LEVEL_PROFILES = {
    1: { deltaMin: 1, deltaMax: 6, minMonthSpan: 0, maxMonthSpan: 0, directions: [1] },
    2: { deltaMin: 7, deltaMax: 20, minMonthSpan: 0, maxMonthSpan: 0, directions: [1] },
    3: { deltaMin: 15, deltaMax: 35, minMonthSpan: 1, maxMonthSpan: 1, directions: [1] },
    4: { deltaMin: 30, deltaMax: 60, minMonthSpan: 1, maxMonthSpan: 3, directions: [-1, 1] },
    5: { deltaMin: 61, deltaMax: 95, minMonthSpan: 2, maxMonthSpan: 4, directions: [-1, 1] }
  };

  function dateToOrdinal(month, day) {
    var total = day - 1;
    for (var m = 1; m < month; m++) total += MONTH_LENGTHS[m - 1];
    return total;
  }

  function ordinalToDate(ordinal) {
    var month = 1;
    var remaining = ordinal;
    while (month <= 12 && remaining >= MONTH_LENGTHS[month - 1]) {
      remaining -= MONTH_LENGTHS[month - 1];
      month++;
    }
    if (month > 12 || remaining < 0) return null;
    return { month: month, day: remaining + 1 };
  }

  function moveByOrdinal(month, day, weekdayIndex, delta, direction) {
    var target = ordinalToDate(dateToOrdinal(month, day) + delta * direction);
    if (!target) return null;
    var targetWeekday = (weekdayIndex + delta * direction) % 7;
    if (targetWeekday < 0) targetWeekday += 7;
    return { month: target.month, day: target.day, weekdayIndex: targetWeekday };
  }

  function moveDayByDay(month, day, weekdayIndex, delta, direction) {
    var currentMonth = month;
    var currentDay = day;
    var currentWeekday = weekdayIndex;
    for (var step = 0; step < delta; step++) {
      currentDay += direction;
      currentWeekday = (currentWeekday + direction + 7) % 7;
      if (currentDay > MONTH_LENGTHS[currentMonth - 1]) {
        currentMonth++;
        currentDay = 1;
      } else if (currentDay < 1) {
        currentMonth--;
        if (currentMonth < 1) return null;
        currentDay = MONTH_LENGTHS[currentMonth - 1];
      }
    }
    return { month: currentMonth, day: currentDay, weekdayIndex: currentWeekday };
  }

  function sameResult(a, b) {
    return !!a && !!b && a.month === b.month && a.day === b.day && a.weekdayIndex === b.weekdayIndex;
  }

  function chooseScenario(level, rng) {
    var profile = LEVEL_PROFILES[level];
    for (var attempt = 0; attempt < 600; attempt++) {
      var direction = CORE.pick(rng, profile.directions);
      var delta = CORE.randint(rng, profile.deltaMin, profile.deltaMax);
      var month = CORE.randint(rng, direction > 0 ? 1 : 2, direction > 0 ? 11 : 12);
      var day = CORE.randint(rng, 1, MONTH_LENGTHS[month - 1]);
      var weekdayIndex = CORE.randint(rng, 0, 6);
      var target = moveByOrdinal(month, day, weekdayIndex, delta, direction);
      if (!target) continue;
      var span = Math.abs(target.month - month);
      if (span < profile.minMonthSpan || span > profile.maxMonthSpan) continue;
      return {
        month: month,
        day: day,
        weekdayIndex: weekdayIndex,
        delta: delta,
        direction: direction,
        target: target,
        monthSpan: span
      };
    }
    throw new Error('weekday scenario could not be generated');
  }

  function involvedMonthText(startMonth, targetMonth) {
    var from = Math.min(startMonth, targetMonth);
    var to = Math.max(startMonth, targetMonth);
    var parts = [];
    for (var month = from; month <= to; month++) parts.push(month + '월 ' + MONTH_LENGTHS[month - 1] + '일');
    return parts.join(' · ');
  }

  function answerText(result) {
    return result.month + '월 ' + result.day + '일 ' + WEEKDAYS[result.weekdayIndex];
  }

  function gen(level, rng) {
    level = Math.max(1, Math.min(5, Number(level) || 1));
    var scenario = chooseScenario(level, rng);
    var independent = moveDayByDay(
      scenario.month, scenario.day, scenario.weekdayIndex, scenario.delta, scenario.direction
    );
    if (!sameResult(scenario.target, independent)) throw new Error('weekday independent verification mismatch');

    var directionText = scenario.direction > 0 ? '뒤' : '전';
    var monthText = involvedMonthText(scenario.month, scenario.target.month);
    var answer = answerText(scenario.target);
    var asset = RASTER.drawConditionCard('날짜와 요일 옮기기', [
      { label: '시작 날짜', value: scenario.month + '월 ' + scenario.day + '일' },
      { label: '시작 요일', value: WEEKDAYS[scenario.weekdayIndex], accent: true },
      { label: '옮길 기간', value: scenario.delta + '일 ' + directionText, accent: true },
      { label: '달의 날수', value: monthText, valueSize: monthText.length > 24 ? 13 : 16 }
    ], {
      width: 700,
      labelRatio: 0.29,
      footer: '날짜를 하루 옮길 때 요일도 하루씩 옮겨요.',
      description: '시작 날짜와 요일, 옮길 기간, 달의 날수를 보여 주는 조건표'
    });

    return {
      text: scenario.month + '월 ' + scenario.day + '일은 ' + WEEKDAYS[scenario.weekdayIndex] + '입니다. ' +
        scenario.delta + '일 ' + directionText + '는 몇 월 며칠이고 무슨 요일입니까? 계산에 필요한 달의 날수는 ' + monthText + '입니다.',
      asset: asset,
      answer: answer,
      solution: '날짜를 ' + scenario.delta + '일 ' + directionText + '로 옮기고, 7일마다 같은 요일이 돌아오는 규칙을 이용하면 ' + answer + '입니다.',
      pointBand: CORE.pointBandForLevel(level),
      verification: {
        primary: { method: 'day-of-year movement plus seven-day cycle', answer: answer },
        independent: { method: 'move the calendar one day at a time', answer: answerText(independent) },
        unique: true,
        validAnswerCount: 1,
        visibleEvidence: { passed: true, method: 'start date, start weekday, direction, distance, and every involved month length are printed' }
      },
      meta: {
        startMonth: scenario.month,
        startDay: scenario.day,
        startWeekdayIndex: scenario.weekdayIndex,
        delta: scenario.delta,
        direction: scenario.direction,
        targetMonth: scenario.target.month,
        targetDay: scenario.target.day,
        targetWeekdayIndex: scenario.target.weekdayIndex,
        monthSpan: scenario.monthSpan,
        monthLengths: MONTH_LENGTHS.slice()
      }
    };
  }

  global.BANK_GENS = global.BANK_GENS || [];
  global.BANK_GENS.push({
    id: 'weekday',
    version: '1.0.0',
    name: '날짜 이동·요일',
    area: '식의 계산',
    gradeBand: '초2~초3',
    contentConstraints: { latinVariables: false, powers: false },
    gen: gen,
    pointBands: { 1: '2.7', 2: '2.7', 3: '3.4', 4: '3.4', 5: '4.2' },
    levelProfiles: LEVEL_PROFILES,
    _moveByOrdinal: moveByOrdinal,
    _moveDayByDay: moveDayByDay,
    _dateToOrdinal: dateToOrdinal,
    _ordinalToDate: ordinalToDate
  });
})(typeof window !== 'undefined' ? window : globalThis);
