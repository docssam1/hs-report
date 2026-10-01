/* Source-linked additions for Final 3 and 4. These are not teacher-selected important types.
 * Final 3 Q9: materials/final_3/002.jpg#q9
 * Final 3 Q10: materials/final_3/003.jpg#q10
 * Final 4 Q2: materials/final_4/001.jpg#q2
 * Final 4 Q7: materials/final_4/002.jpg#q7
 */
(function (root) {
  'use strict';

  function base(anchor, serial, fields) {
    return Object.assign({
      id: anchor.genId + '-g' + serial,
      sourceSet: 'final', sourceRound: anchor.sourceRound, sourceNo: anchor.sourceNo,
      genId: anchor.genId, variantNo: serial, reviewStatus: 'runtime-verified',
      area: anchor.area, subarea: anchor.subarea, detailType: anchor.detailType,
      pointBand: anchor.pointBand, answerPolicy: 'single',
      learnerFit: anchor.learnerFit || {}
    }, fields);
  }

  function fourNumbers(serial, anchor) {
    var pairs = [];
    for (var k = 2; k <= 6; k++) {
      for (var m = 2; m <= 24; m++) {
        var total = (k + 1) * (k + 1) * m;
        if (total >= 45 && total <= 220 && !(k === 2 && m === 5) &&
            !(k === 3 && m === 4) && !(k === 4 && m === 4) && !(k === 5 && m === 4)) {
          pairs.push({ k: k, m: m, total: total });
        }
      }
    }
    pairs.sort(function (a, b) { return a.total - b.total || a.k - b.k; });
    var chosen = pairs[(serial - 4) % pairs.length];
    var k = chosen.k, x = k * chosen.m;
    var values = [x + k, x - k, x * k, x / k];
    var primary = values.reduce(function (sum, value) { return sum + value; }, 0);
    var independent = (k + 1) * (k + 1) * chosen.m;
    if (primary !== chosen.total || independent !== chosen.total || values.some(function (value) { return !Number.isInteger(value) || value <= 0; })) {
      throw new Error('Final 3 Q9 independent arithmetic failed');
    }
    var answer = values.join(', ');
    var objectParticle = k === 3 || k === 6 ? '을' : '를';
    var directionParticle = k === 3 || k === 6 ? '으로' : '로';
    var text = '4개의 수를 모두 더한 값은 ' + chosen.total + '입니다. 첫 번째 수는 어떤 수에 ' + k +
      objectParticle + ' 더한 수이고, 두 번째 수는 ' + k + objectParticle + ' 뺀 수이고, 세 번째 수는 ' + k +
      objectParticle + ' 곱한 수이고, 네 번째 수는 ' + k + directionParticle + ' 나눈 수입니다. 네 수를 차례로 구하세요.';
    var steps = ['기준 수를 □라 하면 네 수의 합은 (□＋' + k + ')＋(□－' + k + ')＋' + k + '×□＋□÷' + k + '＝' + chosen.total + '입니다.',
      '기준 수는 ' + x + '이므로 네 수는 차례로 ' + answer + '입니다.',
      values.join('＋') + '＝' + chosen.total + '로 합을 다시 확인합니다.'];
    return base(anchor, serial, {
      text: text, answer: answer, acceptedAnswers: [answer], solutionSteps: steps, solution: steps.join(' '),
      solutionSkill: '한 기준 수에 네 연산을 적용해 합으로 역산',
      readingFocus: '구한 기준 수가 아니라 네 수를 순서대로 답해야 합니다.',
      meta: { base: x, operator: k, total: chosen.total, values: values },
      verification: { primary: { method: '네 수를 구해 직접 합산', answer: answer },
        independent: { method: '기준 수의 계수 (k＋1)²와 배수를 이용해 역산', answer: answer },
        unique: true, validAnswerCount: 1,
        visibleEvidence: { passed: true, method: '합·네 연산·응답 순서가 모두 본문에 표시됨' } }
    });
  }

  function distribution(serial, anchor) {
    var index = serial - 4;
    var count = 4 + index % 7, low = 5 + Math.floor(index / 7) % 4;
    var gap = 2 + Math.floor(index / 28) % 3, targetStep = 1 + index % (gap - 1);
    var leftover = 1 + (index * 3) % Math.min(9, gap * count - 1);
    if (leftover === count * targetStep) leftover = leftover === gap * count - 1 ? leftover - 1 : leftover + 1;
    var shortage = gap * count - leftover, supplies = low * count + leftover;
    var atTarget = supplies - (low + targetStep) * count;
    var independent = leftover - targetStep * count;
    if (shortage <= 0 || atTarget === 0 || atTarget !== independent ||
        supplies !== (low + gap) * count - shortage) throw new Error('Final 4 Q2 independent arithmetic failed');
    var objects = [
      { noun: '색연필', objectParticle: '을', unit: '자루' },
      { noun: '스티커', objectParticle: '를', unit: '장' },
      { noun: '구슬', objectParticle: '을', unit: '개' },
      { noun: '지우개', objectParticle: '를', unit: '개' }
    ];
    var object = objects[serial % objects.length], amount = Math.abs(atTarget);
    var answer = amount + object.unit + (atTarget > 0 ? ' 남는다' : ' 모자란다');
    var text = '아이들에게 ' + object.noun + object.objectParticle + ' 나누어 주려고 합니다. 한 사람에게 ' + low + object.unit +
      '씩 주면 ' + leftover + object.unit + '가 남고, ' + (low + gap) + object.unit + '씩 주면 ' +
      shortage + object.unit + '가 모자랍니다. 한 사람에게 ' + (low + targetStep) +
      object.unit + '씩 나누어 주면 어떻게 됩니까?';
    var steps = ['아이 수는 (' + leftover + '＋' + shortage + ')÷(' + (low + gap) + '－' + low + ')＝' + count + '명입니다.',
      object.noun + '은 ' + low + '×' + count + '＋' + leftover + '＝' + supplies + object.unit + '입니다.',
      (low + targetStep) + '×' + count + '＝' + (low + targetStep) * count + object.unit + '가 필요하므로 ' + answer + '.'];
    return base(anchor, serial, {
      text: text, answer: answer, acceptedAnswers: [answer], solutionSteps: steps, solution: steps.join(' '),
      solutionSkill: '남음과 모자람의 차로 사람 수와 전체 물건 수 찾기',
      readingFocus: '마지막에는 사람 수가 아니라 새 배분 기준에서 남거나 모자라는 양을 답합니다.',
      meta: { people: count, lowEach: low, highEach: low + gap, targetEach: low + targetStep,
        leftover: leftover, shortage: shortage, supplies: supplies, signedRemainder: atTarget },
      verification: { primary: { method: '전체 물건 수와 새 필요량의 차', answer: answer },
        independent: { method: '처음 남은 수에서 한 사람당 늘어난 수를 뺀 차', answer: answer },
        unique: true, validAnswerCount: 1,
        visibleEvidence: { passed: true, method: '두 배분 기준과 남음·모자람, 목표 기준이 본문에 표시됨' } }
    });
  }

  function candyRounds(serial, anchor) {
    var index=serial-4, rounds=12+index%9, initial=90+5*(index%5);
    var winGain=5+Math.floor(index/9)%5, loss=2+Math.floor(index/15)%3;
    var wins=2+index%(rounds-3), loses=rounds-wins;
    var firstFinal=initial+winGain*wins-loss*loses;
    var secondFinal=initial+winGain*loses-loss*wins;
    var derivedWins=(firstFinal-initial+loss*rounds)/(winGain+loss);
    var independent=2*initial+(winGain-loss)*rounds-firstFinal;
    if(initial-loss*rounds<=0||derivedWins!==wins||independent!==secondFinal||secondFinal<=0)
      throw new Error('Final 3 Q10 independent arithmetic failed');
    var answer=secondFinal+'개';
    var text='민호와 서연은 사탕을 각각 '+initial+'개씩 가지고 시작했습니다. 가위바위보에서 이기면 상자에서 '+winGain+
      '개를 가져가고, 지면 가진 사탕 중 '+loss+'개를 상자에 넣습니다. 비긴 적 없이 '+rounds+
      '번 한 뒤 민호의 사탕이 '+firstFinal+'개가 되었습니다. 서연의 사탕은 몇 개입니까?';
    var steps=['민호가 모두 졌다면 '+initial+'－'+loss+'×'+rounds+'＝'+(initial-loss*rounds)+'개입니다.',
      '패배 한 번을 승리로 바꾸면 '+(winGain+loss)+'개 늘어나므로 민호는 ('+firstFinal+'－'+(initial-loss*rounds)+')÷'+(winGain+loss)+'＝'+wins+'번 이겼습니다.',
      '서연은 '+loses+'번 이기고 '+wins+'번 졌으므로 '+initial+'＋'+winGain+'×'+loses+'－'+loss+'×'+wins+'＝'+answer+'입니다.'];
    return base(anchor,serial,{text:text,answer:answer,acceptedAnswers:[answer],solutionSteps:steps,solution:steps.join(' '),
      solutionSkill:'한 사람이 이긴 횟수를 역산한 뒤 상대의 사탕 수 계산',readingFocus:'구한 승리 횟수가 아니라 상대의 마지막 사탕 수를 답합니다.',
      meta:{rounds:rounds,initial:initial,winGain:winGain,loss:loss,wins:wins,loses:loses,firstFinal:firstFinal,secondFinal:secondFinal},
      verification:{primary:{method:'상대의 승패별 증감 직접 계산',answer:answer},
        independent:{method:'두 사람 사탕의 최종 합에서 첫 사람의 사탕 빼기',answer:answer},
        unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'처음 수·승패별 증감·횟수·첫 사람의 마지막 수가 본문에 표시됨'}}});
  }

  function truckTrips(serial, anchor) {
    var index=serial-4, vehicles=4+index%7, firstTrips=3+Math.floor(index/7)%4;
    var capacity=4+Math.floor(index/11)%9, extra=1+Math.floor(index/5)%6;
    var targetTrips=3+index%5, firstLoad=vehicles*firstTrips*capacity;
    var targetVehicles=vehicles+extra, targetLoad=targetVehicles*targetTrips*capacity;
    var perTrip=firstLoad/(vehicles*firstTrips);
    var required=targetLoad/(perTrip*targetTrips);
    var independent=vehicles*firstTrips*targetLoad/(firstLoad*targetTrips)-vehicles;
    if(!Number.isInteger(required)||required!==targetVehicles||independent!==extra||extra<=0)
      throw new Error('Final 4 Q7 independent arithmetic failed');
    var answer=extra+'대';
    var text='트럭 '+vehicles+'대가 '+firstTrips+'번에 '+firstLoad+'톤의 모래를 나릅니다. 지금 '+targetLoad+
      '톤의 모래가 있는데 '+targetTrips+'번 만에 운반하려면 트럭을 몇 대 더 늘려야 합니까?';
    var steps=['트럭 한 대가 한 번에 나르는 양은 '+firstLoad+'÷('+vehicles+'×'+firstTrips+')＝'+capacity+'톤입니다.',
      '필요한 트럭은 '+targetLoad+'÷('+capacity+'×'+targetTrips+')＝'+required+'대입니다.',
      '따라서 '+required+'－'+vehicles+'＝'+answer+'를 더 늘립니다.'];
    return base(anchor,serial,{text:text,answer:answer,acceptedAnswers:[answer],solutionSteps:steps,solution:steps.join(' '),
      solutionSkill:'한 대·한 번의 운반량으로 목표 트럭 수 계산',readingFocus:'필요한 트럭 전체가 아니라 추가로 필요한 대수를 답합니다.',
      meta:{vehicles:vehicles,firstTrips:firstTrips,capacity:capacity,extra:extra,targetTrips:targetTrips,firstLoad:firstLoad,targetLoad:targetLoad},
      verification:{primary:{method:'단위 운반량으로 필요한 트럭 수 구하기',answer:answer},
        independent:{method:'처음 운반량과 목표 운반량의 비례식으로 증차 수 구하기',answer:answer},
        unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'기존 대수·횟수·운반량과 목표 운반량·횟수가 본문에 표시됨'}}});
  }

  var generators = { 'final3-q09': fourNumbers, 'final3-q10': candyRounds,
    'final4-q02': distribution, 'final4-q07': truckTrips };
  function has(sourceKey) { return Object.prototype.hasOwnProperty.call(generators, sourceKey); }
  function generate(sourceKey, serial, anchor) {
    if (!has(sourceKey) || !anchor || anchor.genId !== sourceKey ||
        anchor.sourceSet !== 'final' || anchor.pointBand !== '2.7' ||
        !Number.isInteger(serial) || serial < 4 || serial > 43) throw new Error('Unapproved Final source or variant');
    return generators[sourceKey](serial, anchor);
  }
  root.BANK_FINAL_SOURCE_GENERATORS = { has: has, generate: generate };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.BANK_FINAL_SOURCE_GENERATORS;
})(typeof window !== 'undefined' ? window : globalThis);
