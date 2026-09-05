'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));

function loadOriginalModel() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'mock-data-original.js'), 'utf8'),
    sandbox,
    { filename: 'mock-data-original.js', timeout: 2000 },
  );
  return JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_ORIGINAL));
}

function loadUnifiedModels() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  [
    'mock-data.js',
    'mock-data-hw.js',
    'mock-data-final.js',
    'last-score-data.js',
    'mock-data-original.js',
  ].forEach((filename) => {
    vm.runInContext(
      fs.readFileSync(path.join(ROOT, filename), 'utf8'),
      sandbox,
      { filename, timeout: 3000 },
    );
  });
  return {
    middle: JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK)),
    applied: JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_HW)),
    final: JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_FINAL)),
    last: JSON.parse(JSON.stringify(sandbox.window.GFIELD_LAST_SCORE_DATA)),
    original: JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_ORIGINAL)),
  };
}

const model = loadOriginalModel();
const catalog = registry.buildCatalog(model);
const summary = registry.summarize(model, catalog);
const unifiedModels = loadUnifiedModels();
const unified = registry.buildUnifiedCatalog(unifiedModels);
const tests = [];
function check(name, fn) { fn(); tests.push(name); }

check('원본형 60문항을 57개 고유유형으로 병합', () => {
  assert.equal(summary.sourceQuestions, 60);
  assert.equal(summary.canonicalTypes, 57);
  assert.equal(summary.canonicalSubareas, 46);
  const recursiveLength = catalog.find((type) => type.name === '반복 분할선 길이');
  assert.ok(recursiveLength);
  assert.deepEqual(recursiveLength.sourceRefs.map((ref) => [ref.round, ref.no]), [[1, 25]]);
  const recursiveTotalLength = catalog.find((type) => type.name === '반복 분할선의 전체 길이');
  assert.ok(recursiveTotalLength);
  assert.deepEqual(recursiveTotalLength.sourceRefs.map((ref) => [ref.round, ref.no]), [[2, 23]]);
});

check('대영역·배점 분포가 원본 데이터와 일치', () => {
  assert.deepEqual(summary.areaQuestionCounts, {
    '수·규칙찾기': 17,
    '도형': 14,
    '경우의 수': 8,
    '식의 계산': 21,
  });
  assert.deepEqual(summary.pointQuestionCounts, { '2.7': 24, '3.4': 20, '4.2': 16 });
});

check('3개 일반 연습형과 2개 실제 원본 구조 검토형을 구분하고 공개는 차단', () => {
  assert.equal(summary.linkedLegacyGenerators, 5);
  assert.equal(summary.verifiedPracticeGenerators, 3);
  assert.equal(summary.sourceLinkedReviewTypes, 2);
  assert.equal(summary.sourceFaithfulReleaseReadyTypes, 0);
  assert.equal(summary.releaseReadyTypes, 0);
  const links = catalog.filter((type) => type.generator);
  assert.deepEqual(links.map((type) => type.generator.generatorId).sort(), [
    'cube', 'overlap-range-sum', 'path', 'remainder-yes-no', 'tri'
  ]);
  links.filter((type) => type.generator.status === 'verified-practice').forEach((type) => {
    assert.equal(type.bankStatus, 'verified-practice');
    assert.equal(type.practiceReleaseReady, true);
    assert.equal(type.sourceFaithfulReleaseReady, false);
    assert.equal(type.releaseReady, false);
    assert.equal(type.generator.status, 'verified-practice');
    assert.equal(type.generator.generatorId, type.generator.legacyId);
    assert.deepEqual(type.generator.approvedModes, ['practice']);
    assert.equal(type.generator.renderer, 'canvas-2d-png');
    assert.equal(type.generator.assetKind, 'raster');
    assert.equal(type.generator.answerCheck, 'primary plus independent verifier');
    assert.equal(type.generator.practiceReleaseReady, true);
    assert.equal(type.generator.sourceFaithfulReleaseReady, false);
    assert.ok(type.generator.sourceFaithfulBlockers.length >= 2);
    assert.equal(type.generator.qaEvidence.generatedQuestions, 40);
  });
  ['overlap-range-sum', 'remainder-yes-no'].forEach((generatorId) => {
    const linked = links.find((type) => type.generator.generatorId === generatorId);
    assert.ok(linked, `${generatorId} confirmed source link`);
    assert.equal(linked.generator.gradeBand, '초2~초3');
    assert.deepEqual(linked.generator.contentConstraints, { latinVariables: false, powers: false });
    assert.equal(linked.generator.status, 'source-linked-review');
    assert.deepEqual(linked.generator.approvedModes, ['review']);
    assert.equal(linked.generator.renderer, 'text-only');
    assert.equal(linked.generator.assetKind, 'none');
    assert.equal(linked.generator.practiceReleaseReady, false);
    assert.equal(linked.generator.sourceFaithfulReleaseReady, false);
    assert.ok(linked.generator.sourceFaithfulBlockers.length >= 2);
    assert.equal(linked.generator.qaEvidence.generatedQuestions, 5000);
    assert.equal(linked.generator.qaEvidence.seedsPerLevel, 1000);
  });
});

check('일반 연습형과 원본 복기형 공개 게이트를 분리', () => {
  assert.equal(registry.releasePolicy.defaultMode, 'source-faithful');
  assert.equal(registry.releasePolicy.modes.practice.sourceComparisonRequired, false);
  assert.equal(registry.releasePolicy.modes['source-faithful'].sourceComparisonRequired, true);

  const type = catalog.find((row) => row.generator && row.generator.legacyId === 'tri');
  const question = {
    text: '불규칙 선망에서 크고 작은 삼각형의 개수를 구하세요.',
    answer: 18,
    asset: {
      kind: 'raster', mimeType: 'image/png', src: 'data:image/png;base64,AAAA',
      width: 900, height: 540, renderer: 'canvas-2d',
    },
    verification: {
      primary: { method: 'segment-graph brute force', answer: 18 },
      independent: { method: 'vertex-triple enumeration', answer: 18 },
      unique: true,
      validAnswerCount: 1,
      visibleEvidence: { passed: true, method: 'complete segment network is visible' },
    },
    diagnosis: { typeId: type.id, errorTags: ['크기별 누락'] },
  };
  assert.deepEqual(registry.validateGeneratedQuestion(question, type, { releaseMode: 'practice' }), []);
  const sourceFaithfulErrors = registry.validateGeneratedQuestion(question, type);
  assert.ok(sourceFaithfulErrors.includes('generator is verified for practice only, not source-faithful release'));
  assert.ok(sourceFaithfulErrors.includes('source visual audit is unresolved'));
});

check('두 반복 분할선 유형은 각 실제 출처를 따로 감사', () => {
  const first = registry.buildCatalog(model, {
    '1:25': { visualRequired: true, sourceCompared: true },
  }).find((row) => row.name === '반복 분할선 길이');
  assert.equal(first.sourceRefs.length, 1);
  assert.equal(first.visual.auditedRefs, 1);
  assert.equal(first.visual.status, 'raster-source-reviewed');

  const second = registry.buildCatalog(model, {
    '2:23': { visualRequired: true, sourceCompared: true },
  }).find((row) => row.name === '반복 분할선의 전체 길이');
  assert.equal(second.sourceRefs.length, 1);
  assert.equal(second.visual.auditedRefs, 1);
  assert.equal(second.visual.status, 'raster-source-reviewed');
});

check('카탈로그 스키마 자체 검증 통과', () => {
  assert.deepEqual(registry.validateCatalog(catalog), []);
  assert.equal(new Set(catalog.map((type) => type.id)).size, catalog.length);
  assert.equal(new Set(catalog.map((type) => type.signature)).size, catalog.length);
});

check('배점 난이도와 생성 변형 레벨을 섞지 않음', () => {
  assert.deepEqual(Object.keys(registry.difficultyBands), ['2.7', '3.4', '4.2']);
  assert.equal('level' in registry.difficultyBands['2.7'], false);
  assert.equal(registry.stagePolicy.sourceStage, null);
  assert.deepEqual(registry.stagePolicy.allowedStages, ['킨더', '키즈', 'Pre', '입문', '초급', '중급']);
  catalog.forEach((type) => type.pointBands.forEach((band) => assert.match(band, /^source-(2\.7|3\.4|4\.2)$/)));
});

check('원본 그림 감사 전에는 생성 문항 공개 차단', () => {
  const type = catalog.find((row) => row.name === '겹친 선분 추적');
  const errors = registry.validateGeneratedQuestion({
    text: '시험 문항', answer: '18개', svg: '<svg></svg>',
    verification: {
      primary: { method: 'enumeration', answer: '18개' },
      independent: { method: 'graph trace', answer: '18개' },
      unique: true,
      validAnswerCount: 1,
      visibleEvidence: { passed: true, method: 'endpoint-by-endpoint trace' },
    },
    diagnosis: { typeId: type.id, errorTags: ['끝점 누락'] },
  }, type);
  assert.ok(errors.includes('inline SVG is forbidden for release'));
  assert.ok(errors.includes('source visual audit is unresolved'));
});

check('래스터·원본대조·독립검산·진단이 모두 있어야 통과', () => {
  const sourceInventory = {
    '1:3': { visualRequired: true, sourceCompared: true, sourceAsset: 'original-r1-q03' },
  };
  const auditedCatalog = registry.buildCatalog(model, sourceInventory);
  const type = auditedCatalog.find((row) => row.name === '왼발·오른발 슬리퍼 판별');
  assert.equal(type.visual.status, 'raster-source-reviewed');
  const question = {
    text: '왼쪽 발에 신는 슬리퍼는 몇 개입니까?',
    answer: '7개',
    asset: {
      kind: 'raster', src: 'assets/slippers-variant.png', width: 3200, height: 2400,
      review: { originalCompared: true, compositionChecked: true },
    },
    verification: {
      primary: { method: 'inventory count', answer: '7개' },
      independent: { method: 'annotated visual recount', answer: '7개' },
      unique: true,
      validAnswerCount: 1,
      visibleEvidence: { passed: true, method: 'left/right silhouette inventory' },
    },
    diagnosis: { typeId: type.id, errorTags: ['좌우 반전', '밑창 오인'] },
  };
  assert.deepEqual(registry.validateGeneratedQuestion(question, type), []);
});

check('도형은 답 하나뿐 아니라 그림에서 확인 가능해야 통과', () => {
  const sourceInventory = {
    '1:3': { visualRequired: true, sourceCompared: true, sourceAsset: 'original-r1-q03' },
  };
  const type = registry.buildCatalog(model, sourceInventory)
    .find((row) => row.name === '왼발·오른발 슬리퍼 판별');
  const question = {
    text: '왼쪽 발에 신는 슬리퍼는 몇 개입니까?', answer: '7개',
    asset: {
      kind: 'raster', src: 'assets/slippers-variant.png', width: 3200, height: 2400,
      review: { originalCompared: true, compositionChecked: true },
    },
    verification: {
      primary: { method: 'inventory count', answer: '7개' },
      independent: { method: 'annotated visual recount', answer: '7개' },
      unique: true, validAnswerCount: 1,
    },
    diagnosis: { typeId: type.id, errorTags: ['좌우 반전'] },
  };
  assert.ok(registry.validateGeneratedQuestion(question, type)
    .includes('geometry answer is not proven visible or inferable'));
});

check('학생용 저장 계약에는 정답을 넣지 않음', () => {
  const contract = registry.paperManifestContract;
  assert.deepEqual(contract.publicAnswerFields, []);
  assert.equal(contract.teacherAnswerKey, 'separate-private-record');
  assert.ok(contract.itemRequired.includes('generatorVersion'));
  assert.ok(contract.itemRequired.includes('variationSeed'));
});

check('진단은 한 문제 오답과 반복 약점을 구분', () => {
  const policy = registry.diagnosisPolicy;
  assert.equal(policy.minimumItemsForWeakClaim, 2);
  assert.equal(policy.singleItemLabel, '확인 필요');
  assert.equal(policy.repeatedWeakness.minimumRounds, 2);
  assert.match(policy.repeatedWeakness.rule, /not one isolated wrong answer/);
  assert.match(policy.populationComparison, /forbidden/);
});

check('5계열 840문항을 빠짐없이 통합', () => {
  assert.equal(unified.summary.sets, 5);
  assert.equal(unified.summary.sourceQuestions, 840);
  const setCounts = Object.fromEntries(
    Object.keys(unifiedModels).map((set) => [set, unified.items.filter((item) => item.sourceRef.set === set).length]),
  );
  assert.deepEqual(setCounts, { middle: 240, applied: 270, final: 150, last: 120, original: 60 });
});

check('840문항 모두 이원목적표 유형·내부 식별자·출처·배점 밴드 보유', () => {
  unified.items.forEach((item) => {
    assert.ok(item.areaId, item.sourceKey + ' areaId');
    assert.ok(item.subareaId, item.sourceKey + ' subareaId');
    assert.ok(item.objectiveTypeId, item.sourceKey + ' objectiveTypeId');
    assert.equal(item.objectiveTypeBasis, 'source item.type / 이원목적분류표 내용(단원)');
    assert.ok(item.canonicalTypeId, item.sourceKey + ' canonicalTypeId');
    assert.ok(item.sourceRef && item.sourceRef.set && item.sourceRef.round && item.sourceRef.no, item.sourceKey + ' sourceRef');
    assert.match(item.pointBand, /^source-(2\.7|3\.4|4\.2)$/, item.sourceKey + ' pointBand');
  });
  const bandCounts = Object.fromEntries(
    ['source-2.7', 'source-3.4', 'source-4.2']
      .map((band) => [band, unified.items.filter((item) => item.pointBand === band).length]),
  );
  assert.deepEqual(bandCounts, { 'source-2.7': 336, 'source-3.4': 280, 'source-4.2': 224 });
});

check('실제 정답률 우선·정답률 없으면 배점인 5단계 난이도 계약', () => {
  assert.deepEqual(registry.difficultyEvidencePolicy.judgmentOrder, [
    'source-item-response-rate', 'source-points',
  ]);
  assert.equal(registry.difficultyEvidencePolicy.observedRateLabel, '실제 정답률');
  assert.equal(registry.difficultyEvidencePolicy.inheritedRateLabel, '기준 정답률');
  assert.match(registry.difficultyEvidencePolicy.generatedVariant.note, /실제 응시 정답률로 표시하지 않는다/);
  assert.deepEqual(Object.values(registry.bankDifficultyLevels).map((level) => level.label), [
    '최상', '상', '중간', '하', '최하',
  ]);
  [
    [0.199, '최상'], [0.2, '상'], [0.4, '중간'], [0.6, '하'], [0.8, '최하'],
  ].forEach(([rate, label]) => {
    const difficulty = registry.bankDifficulty(rate, 2.7);
    assert.equal(difficulty.label, label, `${rate} 정답률 난이도`);
    assert.equal(difficulty.basis, 'response-rate', `${rate} 정답률 우선`);
  });
  [[4.2, '최상'], [3.4, '중간'], [2.7, '최하']].forEach(([points, label]) => {
    const difficulty = registry.bankDifficulty(null, points);
    assert.equal(difficulty.label, label, `${points}점 대체 난이도`);
    assert.equal(difficulty.basis, 'source-points', `${points}점 대체 근거`);
  });

  const target = unified.items.filter((item) => ['applied', 'final', 'last', 'original'].includes(item.sourceRef.set));
  assert.equal(target.length, 600);
  assert.equal(target.filter((item) => item.responseRateStatus === 'measured').length, 240);
  assert.equal(target.filter((item) => item.bankDifficulty.basis === 'response-rate').length, 240);
  assert.equal(target.filter((item) => item.bankDifficulty.basis === 'source-points').length, 360);
  assert.deepEqual(
    new Set(target.map((item) => item.bankDifficulty.label)),
    new Set(['최상', '상', '중간', '하', '최하']),
  );
  target.filter((item) => item.responseRateStatus === 'measured').forEach((item) => {
    assert.equal(item.responseRateUse, 'observed-source-and-variant-benchmark');
    assert.match(item.paperContextKey, /^(final|last)\|[1-4]$/);
  });
  target.filter((item) => item.responseRateStatus === 'unmeasured').forEach((item) => {
    assert.equal(item.responseRateUse, 'source-points-fallback');
  });
  assert.equal(unified.papers.filter((paper) => ['applied', 'final', 'last', 'original'].includes(paper.set)).length, 20);
});

check('item.area를 권위값으로 보존하고 출처 키 중복 없음', () => {
  const originals = new Map();
  Object.entries(unifiedModels).forEach(([set, sourceModel]) => {
    Object.entries(sourceModel.rounds).forEach(([round, data]) => {
      data.items.forEach((item) => originals.set([set, +round, +item.no].join('|'), item.area));
    });
  });
  unified.items.forEach((item) => assert.equal(item.area, originals.get(item.sourceKey), item.sourceKey));
  assert.deepEqual(unified.summary.duplicateSourceKeys, []);
  assert.equal(new Set(unified.items.map((item) => item.sourceKey)).size, 840);
});

check('등록 소영역과 규칙 후보를 명시적으로 구분', () => {
  assert.equal(unified.summary.confirmedItems, 120);
  assert.equal(unified.summary.candidateItems, 720);
  unified.items.filter((item) => item.sourceRef.set === 'original' || (item.sourceRef.set === 'final' && (item.sourceRef.round === 1 || item.sourceRef.round === 5))).forEach((item) => {
    assert.equal(item.reviewStatus, 'confirmed');
    assert.equal(item.reviewRequired, false);
  });
  unified.items.filter((item) => item.sourceRef.set !== 'original' && !(item.sourceRef.set === 'final' && (item.sourceRef.round === 1 || item.sourceRef.round === 5))).forEach((item) => {
    assert.equal(item.reviewStatus, 'candidate');
    assert.equal(item.reviewRequired, true);
    assert.ok(item.reviewReasons.length);
  });
});

check('이원목적표의 대영역+소영역+세부유형을 화면 권위값으로 보존', () => {
  assert.equal(unified.summary.rawDisplayTypes, 742);
  assert.equal(unified.summary.objectiveTypes, 748);
  assert.equal(new Set(unified.items.map((item) => item.objectiveTypeId)).size, 748);
  unified.items.forEach((item) => assert.ok(item.displayType));
  unified.items.forEach((item) => assert.deepEqual(item.taxonomyPath, { major: item.area, minor: item.subarea, detail: item.displayType }));
});

check('기존 후보 family는 생성기 연결용 내부 값으로만 유지', () => {
  assert.ok(unified.summary.canonicalTypes < 210, `canonical types=${unified.summary.canonicalTypes}`);
  assert.ok(unified.summary.canonicalTypes < unified.summary.rawDisplayTypes / 4);
  const clockTypes = unified.items.filter((item) => item.area === '도형' && /시침과 분침이 (직각|겹)/.test(item.displayType));
  assert.ok(clockTypes.length >= 4);
  assert.equal(new Set(clockTypes.map((item) => item.canonicalTypeId)).size, 2, '파이널 1회 겹침 횟수 세부유형은 직각·일반 겹침 family와 분리');
});

check('쌓기나무 Lv5 최소값 오류 수정과 독립 회귀 검산', () => {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  ['bank/bank-core.js', 'bank/bank-raster.js', 'bank/gens/g-cube.js'].forEach((filename) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, filename), 'utf8'), sandbox, { filename, timeout: 3000 });
  });
  const cube = sandbox.window.BANK_GENS.find((generator) => generator.id === 'cube');
  const audit = registry.legacyAudits.cubeLevel5Minimum;
  const actual = JSON.parse(JSON.stringify(cube._minMaxFromViews(
    audit.counterexample.top,
    audit.counterexample.front,
    audit.counterexample.side,
  )));
  const independent = JSON.parse(JSON.stringify(cube._minMaxFromViewsIndependent(
    audit.counterexample.top,
    audit.counterexample.front,
    audit.counterexample.side,
  )));
  assert.deepEqual(actual, audit.counterexample.expected);
  assert.deepEqual(independent, audit.counterexample.expected);
  assert.deepEqual(audit.counterexample.actual, audit.counterexample.expected);
  assert.equal(audit.status, 'fixed-verified');
  assert.equal(audit.historicalIssue.status, 'resolved');
  assert.deepEqual(audit.historicalIssue.result, { min: 2, max: 4 });
  assert.deepEqual(audit.sampleAudit, {
    generatedQuestions: 40,
    level5Questions: 8,
    fullBankQuestions: 320,
    mismatches: 0,
    independentVerifier: 'silhouette-witness dynamic programming plus external QA enumerator',
    date: '2026-08-28',
  });
});

console.log(
  `문제은행 canonical registry QA ${tests.length}개 통과 · ` +
  `원본 ${summary.sourceQuestions}문항/${summary.canonicalTypes}유형/${summary.canonicalSubareas}소영역 · ` +
  `통합 ${unified.summary.sourceQuestions}문항/${unified.summary.objectiveTypes}이원목적표 영역·유형 · 내부 ${unified.summary.canonicalTypes}후보family`,
);
