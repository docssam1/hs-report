/*!
 * GFIELD BULL BANK - canonical type registry draft
 *
 * This file is deliberately independent from the current four legacy
 * generators.  It turns the original-form exam data into one canonical
 * catalogue without copying the 60 source rows into a second data file.
 *
 * Browser: window.BANK_TYPE_REGISTRY
 * Node QA: require('./bank-registry.js')
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BANK_TYPE_REGISTRY = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var SCHEMA_VERSION = '0.2.0';
  var REGISTRY_VERSION = 'original-2026-08-28-draft3';

  /* The taxonomy already used by mock-data-original.js. */
  var TAXONOMY = {
    '수·규칙찾기': [
      '마디수열·규칙찾기', '간격·자르기', '수 배열의 규칙',
      '규칙수열·도형분할', '조건에 맞는 수', '규칙수열·사각수',
      '수의 관계', '관찰과 분류'
    ],
    '도형': [
      '시각적 변별', '연결과 영역', '선과 위치', '쌓기나무',
      '성냥개비 퍼즐', '공간지각', '도형의 구성·공유', '도형의 개수'
    ],
    '경우의 수': [
      '논리추리', '숫자카드로 수 만들기', '최단거리',
      '포함과 배제', '순서 추리', '자리 앉기'
    ],
    '식의 계산': [
      '합차와 배수', '나눗셈의 몫과 나머지', '거꾸로 생각하기',
      '달력·요일(시계)', '우기기/가정하여 풀기', '식의 완성',
      '재치 있게 계산하기', '달력·요일', '나이 계산'
    ]
  };

  /* Exam points are evidence from the source paper.  They are not the same
   * thing as the legacy generator's arbitrary Lv.1-Lv.5 variation switch. */
  var DIFFICULTY_BANDS = {
    '2.7': { id: 'source-2.7', label: '2.7점', sourceNos: [1, 12] },
    '3.4': { id: 'source-3.4', label: '3.4점', sourceNos: [13, 22] },
    '4.2': { id: 'source-4.2', label: '4.2점', sourceNos: [23, 30] }
  };

  var STAGE_POLICY = {
    allowedStages: ['킨더', '키즈', 'Pre', '입문', '초급', '중급'],
    sourceStage: null,
    track: '황소 초등선발',
    note: '과정 단계와 문항 난이도는 별도 값이다. 원본 자료에서 확인하기 전에는 단계를 추정하지 않는다.'
  };

  var ASSET_POLICY = {
    sourceComparisonRequired: true,
    practiceSourceComparisonRequired: false,
    generatedVisualDelivery: 'raster',
    allowedRasterExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    inlineSvgAllowedForRelease: false,
    unresolvedVisualDefault: 'source-audit-required',
    note: '일반 연습형도 PNG 래스터·단일 정답·가시성 검증을 필요로 한다. 원본 복기형은 여기에 원본 나란히 비교 승인을 더해야 한다.'
  };

  /* The default is intentionally the stricter mode.  A verified practice
   * generator is never silently promoted to a source-faithful reconstruction. */
  var RELEASE_POLICY = {
    defaultMode: 'source-faithful',
    modes: {
      practice: {
        status: 'verified-practice',
        sourceComparisonRequired: false,
        requiredEvidence: ['raster PNG', 'primary answer proof', 'independent answer proof', 'single answer', 'visible evidence for geometry']
      },
      'source-faithful': {
        status: 'source-faithful-reviewed',
        sourceComparisonRequired: true,
        requiredEvidence: ['all practice evidence', 'source-side-by-side review', 'composition review', 'source-condition equivalence']
      }
    }
  };

  var DIAGNOSIS_POLICY = {
    areaMetric: 'earned-points / available-points',
    subareaMetric: 'earned-points / available-points',
    minimumItemsForWeakClaim: 2,
    singleItemLabel: '확인 필요',
    repeatedWeakness: {
      minimumRounds: 2,
      rule: 'repeat only a per-round subarea weakness status, not one isolated wrong answer'
    },
    generatedVariantRequired: ['canonicalTypeId', 'errorTags'],
    populationComparison: 'forbidden-without-published-or-collected-evidence'
  };

  var LEGACY_AUDITS = {
    cubeLevel5Minimum: {
      implementation: 'bank/gens/g-cube.js:minMaxFromViews',
      status: 'fixed-verified',
      fixedRule: 'a top-view occupied cell receives the domain 1..cap; only an unoccupied cell may have height 0',
      historicalIssue: {
        status: 'resolved',
        cause: 'a top-view occupied cell incorrectly received the domain 0..cap instead of 1..cap',
        result: { min: 2, max: 4 }
      },
      counterexample: {
        top: [[true, true], [true, true]],
        front: [1, 1],
        side: [1, 1],
        expected: { min: 4, max: 4 },
        actual: { min: 4, max: 4 }
      },
      sampleAudit: {
        generatedQuestions: 40,
        level5Questions: 8,
        fullBankQuestions: 320,
        mismatches: 0,
        independentVerifier: 'silhouette-witness dynamic programming plus external QA enumerator',
        date: '2026-08-28'
      }
    }
  };

  var AREA_IDS = {
    '수·규칙찾기': 'number-pattern',
    '도형': 'geometry',
    '경우의 수': 'combinatorics',
    '식의 계산': 'calculation'
  };

  function familyRule(id, subarea, label, patterns) {
    return { id: id, subarea: subarea, label: label, patterns: patterns };
  }

  /* Broad, reviewable aliases for the four older data sets that do not have
   * a source-authored subarea.  The original display type is always kept. */
  var FAMILY_RULES = {
    '수·규칙찾기': [
      familyRule('digit-count', '수와 숫자 세기', '숫자 출현·자리 세기', [/특정 숫자/, /숫자의? 개수/, /숫자가.*쓰/, /자리 수하?기/, /쪽수/, /이어 쓴/]),
      familyRule('number-array', '수 배열의 규칙', '수 배열표', [/수 배열/, /배열표/, /행.*열/, /대각선.*수/]),
      familyRule('periodic-sequence', '마디수열·규칙찾기', '반복마디·주기', [/반복마디/, /묶음 수열/, /순환/, /주기/, /손가락/]),
      familyRule('progression', '수열과 규칙', '등차·등비·계차수열', [/등차/, /등비/, /계차/, /피보나치/, /수열/]),
      familyRule('figure-pattern', '수열과 규칙', '도형·바둑돌 규칙', [/바둑돌/, /도형.*규칙/, /규칙.*도형/, /그림.*번째/, /규칙.*개수/]),
      familyRule('calendar-cycle', '달력·요일', '달력·요일 주기', [/달력/, /요일/]),
      familyRule('numeral-code', '진법·암호', '진법·암호', [/진법/, /이진법/, /암호/, /기호.*수/]),
      familyRule('number-property', '조건에 맞는 수', '수의 성질·조건', [/약수/, /배수/, /홀수/, /짝수/, /소수/, /나머지/, /조건에 맞는 수/, /점점.*수/]),
      familyRule('interval-count', '간격·자르기', '간격·도막·나무 심기', [/간격/, /도막/, /자르기/, /나무.*심/, /계단/]),
      familyRule('number-relation', '수의 관계', '수의 관계·저울', [/저울/, /저욱/, /수의 관계/, /마주보는 수/, /합이 일정한 수/, /두 수의 곱/, /분수 만들기/]),
      familyRule('number-construction', '조건에 맞는 수', '수 만들기·카드', [/숫자.?카드/, /카드로.*수/, /수 지우기/, /가장.*수 만들기/, /금액.*합/]),
      familyRule('general-pattern', '수열과 규칙', '일반 규칙 찾기', [/규칙/, /일의 자리/, /자리 숫자의 합/, /거듭제곱/, /연속하는/, /제곱수/, /번식/, /분열/, /하노이/, /피라미드/, /타일/, /톱니바퀴/])
    ],
    '도형': [
      familyRule('rectangle-count', '도형의 개수', '사각형·직사각형 개수', [/직사각형.*개수/, /사각형.*개수/, /크고 작은 사각형/, /정사각형.*개수/]),
      familyRule('triangle-count', '도형의 개수', '삼각형 개수', [/삼각형.*개수/, /크고 작은 삼각형/]),
      familyRule('solid-count', '도형의 개수', '입체도형 개수', [/직육면체.*개수/, /각기둥.*개수/, /입체.*개수/]),
      familyRule('cube-views', '쌓기나무', '쌓기나무의 보이는 모양', [/위.*앞.*옆/, /쌓기나무.*모양/, /바탕그림/, /최소.*쌓기나무/, /최대.*쌓기나무/]),
      familyRule('cube-count', '쌓기나무', '쌓기나무 개수', [/쌓기나무.*개수/, /쌓기나무.*몇/, /겉면.*쌓기나무/, /칠해진 쌓기나무/]),
      familyRule('matchstick-shape', '성냥개비 퍼즐', '성냥개비 도형', [/성냥개비/]),
      familyRule('paper-fold', '공간지각', '종이 접기·자르기', [/종이.*접/, /색종이.*접/, /접기/, /펼쳤/]),
      familyRule('maze-view', '공간지각', '미로·시점·공간 보기', [/미로/, /시점/, /공간/, /회전한.*모양/, /옆에서 본/, /위에서 본/]),
      familyRule('line-region', '선과 위치', '선·교점·영역', [/교점/, /교차/, /영역의 개수/, /선.*나뉜/, /선 따라/]),
      familyRule('measure-geometry', '길이·각·둘레·넓이', '길이·각·둘레·넓이', [/둘레/, /넓이/, /각도/, /각의 크기/, /지름/, /반지름/, /길이/]),
      familyRule('move-symmetry', '이동·회전·대칭', '이동·회전·대칭', [/대칭/, /회전/, /굴렸/, /움직이/, /주사위/]),
      familyRule('visual-discrimination', '시각적 변별', '겹침·좌우·시각 변별', [/겹친/, /왼발/, /오른발/, /슬리퍼/, /겹쳐/, /뒤집/]),
      familyRule('shape-compose', '도형의 구성·공유', '도형 구성·공유', [/붙여/, /공유/, /조각/, /채우기/, /압정/]),
      familyRule('clock-angle', '길이·각·둘레·넓이', '시계의 각·겹침', [/시침/, /분침/, /시계/]),
      familyRule('cube-general', '쌓기나무', '정육면체·쌓기나무', [/쌓기나무/, /쌓은 블록/, /검은 블록/, /정육면체/, /직육면체/]),
      familyRule('shape-count-general', '도형의 개수', '여러 도형의 개수', [/도형.*개수/, /도형의 개수/, /평행사변형/, /점판/, /원 위.*사각형/]),
      familyRule('region-general', '선과 위치', '영역 나누기', [/영역/, /원을 나누/, /직선을 그어/]),
      familyRule('solid-net-cut', '공간지각', '전개도·입체 자르기', [/전개도/, /입체.*선/, /자르기/, /투상도/])
    ],
    '경우의 수': [
      familyRule('shortest-path', '최단거리', '최단거리·경로', [/최단/, /경로/, /길의 가짓수/, /길.*경우/]),
      familyRule('logic', '논리추리', '논리추리·진실과 거짓', [/논리/, /추리/, /모순/, /참.*거짓/, /정답 예상/]),
      familyRule('seat-order', '순서·자리배치', '자리 앉기·줄 세우기', [/자리 앉/, /줄 세우/, /순서/, /배열/, /나열/]),
      familyRule('make-number', '숫자카드로 수 만들기', '숫자카드·수 만들기', [/숫자.?카드/, /수 만들기/, /만들 수 있는 수/, /자리 수의 개수/]),
      familyRule('inclusion-exclusion', '포함과 배제', '포함·배제', [/포함.*배제/, /두 모임/, /어느 것도/, /적어도 하나/]),
      familyRule('distribution', '분배·비둘기집', '분배·서랍원리', [/서랍/, /비둘기/, /나누어 담/, /분배/, /구슬.*상자/, /상자.*구슬/]),
      familyRule('connection', '연결과 선택', '악수·연결·선택', [/악수/, /연결/, /깃발/, /신호/, /고르/, /선택/]),
      familyRule('score-cases', '점수와 경우', '점수·과녁·게임 경우', [/과녁/, /점수/, /승패/, /던져/]),
      familyRule('money-cases', '금액의 경우', '동전·금액의 경우', [/동전/, /금액/, /지불/, /거스름돈/]),
      familyRule('number-condition-cases', '조건에 맞는 수의 개수', '조건에 맞는 수 세기', [/조건.*수/, /자리.*수/, /숫자/, /몫.*나머지/, /나눗셈/, /홀수/, /짝수/, /회전.*수/]),
      familyRule('tiling-cut-cases', '조합·구성', '타일·조각·자르기', [/타일/, /조각/, /피자/, /자르기/, /도형.*만들/]),
      familyRule('sign-equation-cases', '식 구성의 경우', '부호·식 구성', [/부호/, /등식/, /식 만들기/, /\+.*−/]),
      familyRule('tournament-cases', '경기의 경우', '리그·토너먼트', [/리그/, /토너먼트/, /경기 수/]),
      familyRule('coloring-cases', '색칠의 경우', '색칠·지도', [/색칠/, /색정리/, /지도/]),
      familyRule('measure-cases', '길이 구성의 경우', '길이·무게 재기', [/길이/, /막대/, /자로/, /추로/, /무게/])
    ],
    '식의 계산': [
      familyRule('alphametic-equation', '식의 완성', '복면산·빈칸 식', [/복면산/, /벌레먹은/, /빈칸.*식/, /기호.*계산/, /식.*완성/, /암호/]),
      familyRule('division-remainder', '나눗셈의 몫과 나머지', '몫과 나머지', [/몫/, /나머지/, /나누/]),
      familyRule('reverse', '거꾸로 생각하기', '거꾸로 풀기', [/거꾸로/, /처음.*구하기/, /원래의 수/, /역산/]),
      familyRule('work-rate', '일·속력·시간', '일·속력·거리·시간', [/일에 관한/, /작업/, /속력/, /거리.*시간/, /시간.*거리/, /일의 양/]),
      familyRule('age', '나이 계산', '나이 계산', [/나이/, /살/]),
      familyRule('clock-calendar', '달력·요일(시계)', '달력·요일·시계', [/달력/, /요일/, /시계/, /시침/, /분침/]),
      familyRule('sum-difference-multiple', '합차와 배수', '합·차·배수 관계', [/합과 차/, /합차/, /합.*배수/, /부족한 수/, /기준 맞춰/]),
      familyRule('ratio-distribution', '비와 비례', '비·비례·배분', [/비례/, /비율/, /배분/, /분수/, /몇 배/]),
      familyRule('clever-calculation', '재치 있게 계산하기', '재치 있는 계산', [/재치/, /가우스/, /효율적인.*계산/, /계산.*활용/]),
      familyRule('money', '금액 계산', '돈·가격·동전 계산', [/원/, /돈/, /가격/, /물건값/, /동전/]),
      familyRule('quantity-relation', '수량 관계', '합·차 수량 관계', [/합이 일정/, /두 수의 합/, /구슬/, /명/, /마리/, /개수/]),
      familyRule('logic-assumption', '우기기·논리추리', '가정·논리·집합', [/우기기/, /가정/, /논리/, /참.*거짓/, /집합/, /벤.?다이어그램/, /표 만들기/]),
      familyRule('weight-balance', '수량 관계', '저울·무게 관계', [/저울/, /무게/, /모빌/, /평형/]),
      familyRule('interval-time', '일·속력·시간', '간격·통과·소요 시간', [/계단/, /간격/, /막대/, /열차/, /배차/, /통나무/, /터널/, /걸린 시간/]),
      familyRule('magic-sum', '식의 완성', '마방진·합이 같은 배치', [/마방진/, /삼각진/, /한 줄 합/, /합이 같은 배치/]),
      familyRule('operation-relation', '계산과 수의 관계', '곱셈·나눗셈·연산 관계', [/곱셈/, /나눗셈/, /곱이/, /곱과/, /연산/, /부호/]),
      familyRule('condition-equation', '식의 완성', '조건식·수 찾기', [/조건/, /가장 큰 수/, /가장 작은 수/, /자리.*바꾸/, /순서도/])
    ]
  };

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function signature(area, subarea, name) {
    return [clean(area), clean(subarea), clean(name)].join('|');
  }

  /* FNV-1a gives a short, deterministic ASCII id for Korean type names. */
  function stableId(value) {
    var s = clean(value);
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return 'type-' + (h >>> 0).toString(36).padStart(7, '0');
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function generatorLink(legacyId, file, coverage, sourceFaithfulBlockers) {
    return {
      generatorId: legacyId,
      legacyId: legacyId,
      implementation: file,
      coverage: coverage,
      status: 'verified-practice',
      approvedModes: ['practice'],
      renderer: 'canvas-2d-png',
      assetKind: 'raster',
      answerCheck: 'primary plus independent verifier',
      singleAnswerVerified: true,
      visibleEvidenceVerified: true,
      practiceReleaseReady: true,
      sourceFaithfulReleaseReady: false,
      sourceFaithfulBlockers: sourceFaithfulBlockers.slice(),
      qaEvidence: {
        suite: 'qa/bank-raster-generators-validate.js',
        generatedQuestions: 40,
        levels: [1, 2, 3, 4, 5],
        seedsPerLevel: 8,
        date: '2026-08-28'
      }
    };
  }

  function elementaryTextGeneratorLink(generatorId, file, coverage, sourceFaithfulBlockers) {
    var link = generatorLink(generatorId, file, coverage, sourceFaithfulBlockers);
    link.gradeBand = '초2~초3';
    link.contentConstraints = { latinVariables: false, powers: false };
    return link;
  }

  /* These are verified general-practice generators, not claims of
   * source-faithful equivalence.  The second gate stays closed until the
   * source conditions and side-by-side composition have both been approved. */
  var GENERATOR_LINKS = {};
  GENERATOR_LINKS[signature('도형', '도형의 개수', '크고 작은 직사각형')] = generatorLink(
    'rect', 'bank/gens/g-rect.js', 'same core skill',
    ['no original-side-by-side art review', 'source-condition equivalence not approved']
  );
  GENERATOR_LINKS[signature('도형', '도형의 개수', '크고 작은 삼각형')] = generatorLink(
    'tri', 'bank/gens/g-tri.js', 'same core skill',
    ['no original-side-by-side art review', 'source-condition equivalence not approved']
  );
  GENERATOR_LINKS[signature('경우의 수', '최단거리', '금지 선분이 있는 경로')] = generatorLink(
    'path', 'bank/gens/g-path.js', 'concept only; blocked points differ from forbidden segments',
    ['source condition mismatch: blocked intersections differ from forbidden segments', 'no original-side-by-side art review']
  );
  GENERATOR_LINKS[signature('도형', '쌓기나무', '세 방향의 검은 기둥')] = generatorLink(
    'cube', 'bank/gens/g-cube.js', 'concept only; practice variants do not reproduce the source three-view black-column conditions',
    ['source condition mismatch: current variants do not reproduce the source three-view black-column type', 'no original-side-by-side art review']
  );
  GENERATOR_LINKS[signature('수·규칙찾기', '마디수열·규칙찾기', '큰 위치의 반복문자')] = elementaryTextGeneratorLink(
    'repeat', 'bank/gens/g-repeat.js', 'same repeating-block position skill',
    ['no original-side-by-side art review', 'source wording and sequence composition equivalence not approved']
  );
  GENERATOR_LINKS[signature('식의 계산', '달력·요일', '날짜 이동')] = elementaryTextGeneratorLink(
    'weekday', 'bank/gens/g-weekday.js', 'same date-movement and weekday-cycle skill',
    ['no original-side-by-side art review', 'source date conditions and composition equivalence not approved']
  );
  GENERATOR_LINKS[signature('경우의 수', '포함과 배제', '겹친 두 모임의 가장 작은 수')] = elementaryTextGeneratorLink(
    'inclusion', 'bank/gens/g-inclusion.js', 'same minimum-overlap skill; practice variants also cover exact overlap',
    ['no original-side-by-side art review', 'source story conditions and composition equivalence not approved']
  );
  GENERATOR_LINKS[signature('식의 계산', '나눗셈의 몫과 나머지', '나머지 조건')] = elementaryTextGeneratorLink(
    'remainder', 'bank/gens/g-remainder.js', 'same unique-number-from-remainders skill',
    ['no original-side-by-side art review', 'source range and remainder-condition equivalence not approved']
  );

  function pointBand(points) {
    return DIFFICULTY_BANDS[String(Number(points))] || null;
  }

  function getSourceInventory(inventory, round, no) {
    if (!inventory) return null;
    return inventory[String(round) + ':' + String(no)] || null;
  }

  function buildCatalog(model, sourceInventory) {
    if (!model || !model.rounds) throw new Error('원본형 시험 데이터가 필요합니다.');
    var bySignature = {};
    var roundKeys = Object.keys(model.rounds).sort(function (a, b) { return Number(a) - Number(b); });

    roundKeys.forEach(function (roundKey) {
      var round = model.rounds[roundKey] || {};
      (round.items || []).forEach(function (item) {
        var sig = signature(item.area, item.subarea, item.type);
        var entry = bySignature[sig];
        if (!entry) {
          var linked = GENERATOR_LINKS[sig] ? clone(GENERATOR_LINKS[sig]) : null;
          entry = bySignature[sig] = {
            id: stableId(sig),
            signature: sig,
            area: clean(item.area),
            subarea: clean(item.subarea),
            name: clean(item.type),
            sourceRefs: [],
            pointBands: [],
            generator: linked,
            bankStatus: linked ? linked.status : 'planned',
            practiceReleaseReady: !!(linked && linked.practiceReleaseReady),
            sourceFaithfulReleaseReady: false,
            releaseReady: false,
            visual: {
              status: ASSET_POLICY.unresolvedVisualDefault,
              delivery: ASSET_POLICY.generatedVisualDelivery,
              inlineSvgAllowed: ASSET_POLICY.inlineSvgAllowedForRelease,
              sourceComparisonRequired: ASSET_POLICY.sourceComparisonRequired,
              auditedRefs: 0,
              requiredRefs: 0,
              reviewedRefs: 0,
              textOnlyRefs: 0
            },
            diagnosis: {
              aggregateBy: 'subarea',
              canonicalTypeId: stableId(sig),
              misconceptionTags: [],
              evidenceStatus: 'authoring-required'
            }
          };
        }

        var band = pointBand(item.pts);
        var inventory = getSourceInventory(sourceInventory, roundKey, item.no);
        entry.sourceRefs.push({
          set: clean(model.setKey || 'original'),
          round: Number(roundKey),
          no: Number(item.no),
          points: Number(item.pts),
          answer: clean(item.answer),
          visualAudit: inventory ? clone(inventory) : null
        });
        if (band && entry.pointBands.indexOf(band.id) < 0) entry.pointBands.push(band.id);
        if (inventory) {
          entry.visual.auditedRefs++;
          if (inventory.visualRequired === false) entry.visual.textOnlyRefs++;
          if (inventory.visualRequired === true) {
            entry.visual.requiredRefs++;
            if (inventory.sourceCompared) entry.visual.reviewedRefs++;
          }
        }
      });
    });

    return Object.keys(bySignature).map(function (key) {
      var entry = bySignature[key];
      if (entry.visual.auditedRefs < entry.sourceRefs.length) {
        entry.visual.status = ASSET_POLICY.unresolvedVisualDefault;
      } else if (entry.visual.requiredRefs > 0) {
        entry.visual.status = entry.visual.reviewedRefs === entry.visual.requiredRefs ?
          'raster-source-reviewed' : 'raster-review-required';
      } else if (entry.visual.textOnlyRefs === entry.sourceRefs.length) {
        entry.visual.status = 'text-only-confirmed';
      }
      return entry;
    })
      .sort(function (a, b) {
        return a.area.localeCompare(b.area, 'ko') ||
          a.subarea.localeCompare(b.subarea, 'ko') ||
          a.name.localeCompare(b.name, 'ko');
      });
  }

  function registeredSubarea(area, subarea) {
    return !!(TAXONOMY[area] && TAXONOMY[area].indexOf(clean(subarea)) >= 0);
  }

  function candidateRule(area, displayType) {
    var rules = FAMILY_RULES[area] || [];
    var value = clean(displayType);
    for (var i = 0; i < rules.length; i++) {
      for (var j = 0; j < rules[i].patterns.length; j++) {
        if (rules[i].patterns[j].test(value)) return rules[i];
      }
    }
    return familyRule('review-other', '기타·검토 대기', '기타·검토 대기', []);
  }

  function modelEntries(models) {
    if (!models || typeof models !== 'object') throw new Error('계열별 시험 데이터가 필요합니다.');
    if (Array.isArray(models)) {
      return models.map(function (row, index) {
        if (!row || !row.model) throw new Error('models[' + index + ']에 model이 없습니다.');
        return { setKey: clean(row.setKey || row.key || ('set' + (index + 1))), model: row.model };
      });
    }
    return Object.keys(models).map(function (key) { return { setKey: clean(key), model: models[key] }; });
  }

  function itemPoints(model, item) {
    if (item && item.pts != null) return Number(item.pts);
    var no = Number(item && item.no);
    var row = (model && model.blueprint || []).filter(function (bp) { return Number(bp.no) === no; })[0];
    return row && row.pts != null ? Number(row.pts) : NaN;
  }

  function confirmedAliasMap(entries) {
    var candidates = {};
    entries.forEach(function (entry) {
      Object.keys(entry.model.rounds || {}).forEach(function (roundKey) {
        (entry.model.rounds[roundKey].items || []).forEach(function (item) {
          var area = clean(item.area), subarea = clean(item.subarea), displayType = clean(item.type);
          if (!registeredSubarea(area, subarea)) return;
          var key = area + '|' + displayType;
          var value = {
            area: area,
            subarea: subarea,
            subareaId: 'subarea-' + stableId(area + '|' + subarea).slice(5),
            canonicalTypeId: stableId(signature(area, subarea, displayType))
          };
          if (!Object.prototype.hasOwnProperty.call(candidates, key)) candidates[key] = value;
          else if (candidates[key] && candidates[key].canonicalTypeId !== value.canonicalTypeId) candidates[key] = null;
        });
      });
    });
    return candidates;
  }

  /* Build one reviewable index for 중급/활용/파이널/최종/원본형.
   * - item.area is the authority; blueprint.area is never used.
   * - source-authored registered subareas are confirmed.
   * - rule-derived subareas and family aliases remain candidates.
   * - raw display types are preserved even when aliases share one family. */
  function buildUnifiedCatalog(models) {
    var entries = modelEntries(models);
    var aliases = confirmedAliasMap(entries);
    var items = [];
    var seenSources = {};

    entries.forEach(function (entry) {
      var model = entry.model || {};
      Object.keys(model.rounds || {}).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (roundKey) {
        var round = model.rounds[roundKey] || {};
        (round.items || []).forEach(function (item) {
          var area = clean(item.area);
          var displayType = clean(item.type);
          var sourceSubarea = clean(item.subarea);
          var aId = AREA_IDS[area] || ('area-' + stableId(area).slice(5));
          var isConfirmed = registeredSubarea(area, sourceSubarea);
          var exactAlias = !isConfirmed ? aliases[area + '|' + displayType] : null;
          var rule = !isConfirmed && !exactAlias ? candidateRule(area, displayType) : null;
          var subarea, subareaId, canonicalTypeId, familyId, familyLabel, basis;

          if (isConfirmed) {
            subarea = sourceSubarea;
            subareaId = 'subarea-' + stableId(area + '|' + subarea).slice(5);
            canonicalTypeId = stableId(signature(area, subarea, displayType));
            familyId = 'source-exact';
            familyLabel = displayType;
            basis = 'source item.subarea';
          } else if (exactAlias) {
            subarea = exactAlias.subarea;
            subareaId = exactAlias.subareaId;
            canonicalTypeId = exactAlias.canonicalTypeId;
            familyId = 'exact-source-alias';
            familyLabel = displayType;
            basis = 'exact area+type alias to a registered source type';
          } else {
            subarea = rule.subarea;
            subareaId = 'subarea-' + stableId(area + '|' + subarea).slice(5);
            canonicalTypeId = 'family-' + stableId(aId + '|' + rule.id).slice(5);
            familyId = rule.id;
            familyLabel = rule.label;
            basis = rule.id === 'review-other' ? 'broad area fallback' : ('type-family rule ' + rule.id);
          }

          var points = itemPoints(model, item);
          var band = pointBand(points);
          var sourceKey = [entry.setKey, Number(roundKey), Number(item.no)].join('|');
          var reasons = [];
          if (!AREA_IDS[area]) reasons.push('unregistered area');
          if (!isConfirmed) reasons.push(exactAlias ? 'subarea inherited as candidate from exact source alias' : 'subarea inferred from display type');
          if (rule && rule.id === 'review-other') reasons.push('no specific type-family rule matched');
          if (!band) reasons.push('unregistered point band');

          items.push({
            area: area,
            areaId: aId,
            sourceSubarea: sourceSubarea || null,
            subarea: subarea,
            subareaId: subareaId,
            displayType: displayType,
            typeFamilyId: familyId,
            typeFamilyLabel: familyLabel,
            canonicalTypeId: canonicalTypeId,
            sourceRef: { set: entry.setKey, round: Number(roundKey), no: Number(item.no) },
            sourceKey: sourceKey,
            points: points,
            pointBand: band ? band.id : null,
            reviewStatus: isConfirmed ? 'confirmed' : 'candidate',
            reviewRequired: reasons.length > 0,
            reviewBasis: basis,
            reviewReasons: reasons,
            hasApprovedAnswer: !!clean(item.answer)
          });
          seenSources[sourceKey] = (seenSources[sourceKey] || 0) + 1;
        });
      });
    });

    var typeMap = {};
    items.forEach(function (item) {
      var type = typeMap[item.canonicalTypeId];
      if (!type) {
        type = typeMap[item.canonicalTypeId] = {
          id: item.canonicalTypeId,
          areaId: item.areaId,
          subareaId: item.subareaId,
          familyId: item.typeFamilyId,
          familyLabel: item.typeFamilyLabel,
          displayTypes: [],
          sourceRefs: [],
          reviewRequired: false
        };
      }
      if (type.displayTypes.indexOf(item.displayType) < 0) type.displayTypes.push(item.displayType);
      type.sourceRefs.push(clone(item.sourceRef));
      if (item.reviewRequired) type.reviewRequired = true;
    });

    var duplicateSources = Object.keys(seenSources).filter(function (key) { return seenSources[key] > 1; });
    return {
      schemaVersion: SCHEMA_VERSION,
      registryVersion: REGISTRY_VERSION,
      items: items,
      types: Object.keys(typeMap).map(function (key) { return typeMap[key]; }),
      summary: {
        sets: entries.length,
        sourceQuestions: items.length,
        rawDisplayTypes: Object.keys(items.reduce(function (map, item) { map[item.displayType] = true; return map; }, {})).length,
        canonicalTypes: Object.keys(typeMap).length,
        confirmedItems: items.filter(function (item) { return item.reviewStatus === 'confirmed'; }).length,
        candidateItems: items.filter(function (item) { return item.reviewStatus === 'candidate'; }).length,
        duplicateSourceKeys: duplicateSources
      }
    };
  }

  function summarize(model, catalog) {
    var areaCounts = {};
    var pointCounts = {};
    var refs = 0;
    catalog.forEach(function (type) {
      type.sourceRefs.forEach(function (ref) {
        refs++;
        areaCounts[type.area] = (areaCounts[type.area] || 0) + 1;
        pointCounts[String(ref.points)] = (pointCounts[String(ref.points)] || 0) + 1;
      });
    });
    return {
      schemaVersion: SCHEMA_VERSION,
      registryVersion: REGISTRY_VERSION,
      setKey: clean(model && model.setKey || 'original'),
      sourceQuestions: refs,
      canonicalTypes: catalog.length,
      canonicalSubareas: Object.keys(TAXONOMY).reduce(function (sum, area) { return sum + TAXONOMY[area].length; }, 0),
      linkedLegacyGenerators: catalog.filter(function (type) { return !!type.generator; }).length,
      verifiedPracticeGenerators: catalog.filter(function (type) { return !!(type.generator && type.generator.practiceReleaseReady); }).length,
      sourceFaithfulReleaseReadyTypes: catalog.filter(function (type) { return type.sourceFaithfulReleaseReady; }).length,
      releaseReadyTypes: catalog.filter(function (type) { return type.releaseReady; }).length,
      areaQuestionCounts: areaCounts,
      pointQuestionCounts: pointCounts
    };
  }

  function validateCatalog(catalog) {
    var errors = [];
    var ids = {};
    var signatures = {};
    if (!Array.isArray(catalog) || !catalog.length) return ['catalogue is empty'];

    catalog.forEach(function (type, index) {
      var at = 'type[' + index + ']';
      if (!type.id || ids[type.id]) errors.push(at + ': duplicate or missing id');
      ids[type.id] = true;
      if (!type.signature || signatures[type.signature]) errors.push(at + ': duplicate or missing signature');
      signatures[type.signature] = true;
      if (!Object.prototype.hasOwnProperty.call(TAXONOMY, type.area)) errors.push(at + ': unknown area');
      else if (TAXONOMY[type.area].indexOf(type.subarea) < 0) errors.push(at + ': unknown subarea');
      if (!type.name) errors.push(at + ': missing type name');
      if (!Array.isArray(type.sourceRefs) || !type.sourceRefs.length) errors.push(at + ': missing source reference');
      (type.sourceRefs || []).forEach(function (ref) {
        if (!ref.round || !ref.no || !pointBand(ref.points)) errors.push(at + ': invalid source reference');
        if (!ref.answer) errors.push(at + ': missing approved source answer');
      });
      if (type.releaseReady && type.visual && type.visual.inlineSvgAllowed) errors.push(at + ': release cannot allow inline SVG');
      if (type.generator) {
        var generator = type.generator;
        if (generator.status !== 'verified-practice') errors.push(at + ': linked generator is not practice-verified');
        if (generator.renderer !== 'canvas-2d-png' || generator.assetKind !== 'raster') errors.push(at + ': practice generator is not raster PNG');
        if (generator.answerCheck !== 'primary plus independent verifier') errors.push(at + ': practice generator lacks an independent answer verifier');
        if (generator.practiceReleaseReady !== true) errors.push(at + ': practice release gate is closed');
        if (generator.sourceFaithfulReleaseReady === true && (!Array.isArray(generator.approvedModes) || generator.approvedModes.indexOf('source-faithful') < 0)) {
          errors.push(at + ': source-faithful generator approval is internally inconsistent');
        }
        if (generator.sourceFaithfulReleaseReady !== true && (!Array.isArray(generator.sourceFaithfulBlockers) || !generator.sourceFaithfulBlockers.length)) {
          errors.push(at + ': source-faithful blockers are missing');
        }
      }
      if (type.releaseReady !== type.sourceFaithfulReleaseReady) errors.push(at + ': releaseReady must alias the source-faithful gate');
    });
    return errors;
  }

  function sameAnswer(a, b) {
    return clean(a) === clean(b);
  }

  function approvedRasterAsset(asset) {
    if (!asset || asset.kind !== 'raster') return false;
    var src = clean(asset.src);
    var mime = clean(asset.mimeType).toLowerCase();
    var fileExt = src && !/^data:/i.test(src) ? src.split('?')[0].split('.').pop().toLowerCase() : '';
    var isPngData = /^data:image\/png;base64,/i.test(src);
    var approvedSource = isPngData || ASSET_POLICY.allowedRasterExtensions.indexOf(fileExt) >= 0;
    return approvedSource && (!mime || ASSET_POLICY.allowedRasterExtensions.indexOf(mime.replace('image/', '')) >= 0) &&
      Number(asset.width) > 0 && Number(asset.height) > 0;
  }

  function pngRasterAsset(asset) {
    if (!approvedRasterAsset(asset)) return false;
    var src = clean(asset.src);
    var mime = clean(asset.mimeType).toLowerCase();
    return /^data:image\/png;base64,/i.test(src) || mime === 'image/png' || /\.png(?:\?|$)/i.test(src);
  }

  /* Release gate for one generated variant.  A generator calculating its own
   * answer twice is not independent: the two method names must also differ.
   * The omitted mode is source-faithful so a practice-only generator can
   * never be promoted merely because a caller forgot to state its purpose. */
  function validateGeneratedQuestion(question, type, options) {
    options = options || {};
    var errors = [];
    var releaseMode = clean(options.releaseMode || RELEASE_POLICY.defaultMode);
    if (!question || typeof question !== 'object') return ['question is missing'];
    if (!type || typeof type !== 'object') return ['canonical type is missing'];
    if (!RELEASE_POLICY.modes[releaseMode]) return ['unknown release mode'];
    if (!clean(question.text)) errors.push('question text is missing');
    if (!clean(question.answer)) errors.push('approved answer is missing');
    if (question.svg) errors.push('inline SVG is forbidden for release');

    var proof = question.verification || {};
    var primary = proof.primary || {};
    var independent = proof.independent || {};
    if (!primary.method || !sameAnswer(primary.answer, question.answer)) errors.push('primary answer proof is missing or disagrees');
    if (!independent.method || !sameAnswer(independent.answer, question.answer)) errors.push('independent answer proof is missing or disagrees');
    if (primary.method && independent.method && clean(primary.method) === clean(independent.method)) errors.push('answer proofs are not independent');
    if (proof.unique !== true) errors.push('single answer was not proven');
    if (Number(proof.validAnswerCount) !== 1) errors.push('valid answer count is not exactly one');
    if (type.area === '도형') {
      var visible = proof.visibleEvidence || {};
      if (visible.passed !== true || !clean(visible.method)) errors.push('geometry answer is not proven visible or inferable');
    }

    var visualStatus = type.visual && type.visual.status;
    var asset = question.asset || {};
    if (releaseMode === 'practice') {
      if (!type.generator || type.generator.practiceReleaseReady !== true || type.generator.status !== 'verified-practice') {
        errors.push('practice generator is not verified');
      }
      if (!pngRasterAsset(asset)) errors.push('approved PNG raster asset is missing');
    } else {
      if (type.generator && type.generator.sourceFaithfulReleaseReady !== true) {
        errors.push('generator is verified for practice only, not source-faithful release');
      }
      if (visualStatus === ASSET_POLICY.unresolvedVisualDefault) errors.push('source visual audit is unresolved');
      if (visualStatus === 'raster-review-required') errors.push('source visual comparison is not approved');
      if (visualStatus === 'raster-source-reviewed') {
        if (!approvedRasterAsset(asset)) errors.push('approved raster asset is missing');
        if (!asset.review || asset.review.originalCompared !== true) errors.push('original-side-by-side image review is missing');
        if (!asset.review || asset.review.compositionChecked !== true) errors.push('image composition review is missing');
      }
    }
    if (question.asset && question.asset.kind === 'svg') errors.push('SVG asset is forbidden for release');
    if (options.requireDiagnosis !== false) {
      if (!question.diagnosis || question.diagnosis.typeId !== type.id) errors.push('diagnosis type id is missing or disagrees');
      if (!question.diagnosis || !Array.isArray(question.diagnosis.errorTags) || !question.diagnosis.errorTags.length) errors.push('diagnosis error tags are missing');
    }
    return errors;
  }

  /* A stored paper must keep exact generator versions and per-item seeds.
   * Student-facing manifests contain no answer key; answers belong in a
   * teacher-only record keyed by paperId + itemId. */
  var PAPER_MANIFEST_CONTRACT = {
    version: '1',
    required: ['paperId', 'registryVersion', 'masterSeed', 'items'],
    itemRequired: ['itemId', 'typeId', 'generatorVersion', 'variationSeed', 'assetRef'],
    publicAnswerFields: [],
    teacherAnswerKey: 'separate-private-record',
    persistence: 'central-store-plus-local-retry-queue'
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    registryVersion: REGISTRY_VERSION,
    taxonomy: clone(TAXONOMY),
    areaIds: clone(AREA_IDS),
    difficultyBands: clone(DIFFICULTY_BANDS),
    stagePolicy: clone(STAGE_POLICY),
    assetPolicy: clone(ASSET_POLICY),
    releasePolicy: clone(RELEASE_POLICY),
    diagnosisPolicy: clone(DIAGNOSIS_POLICY),
    legacyAudits: clone(LEGACY_AUDITS),
    paperManifestContract: clone(PAPER_MANIFEST_CONTRACT),
    signature: signature,
    stableId: stableId,
    buildCatalog: buildCatalog,
    buildUnifiedCatalog: buildUnifiedCatalog,
    summarize: summarize,
    validateCatalog: validateCatalog,
    validateGeneratedQuestion: validateGeneratedQuestion
  };
});
