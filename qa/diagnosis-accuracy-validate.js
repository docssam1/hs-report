'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const FINAL_PAGE = path.join(ROOT, 'final.html');
const MOCK_PAGE = path.join(ROOT, 'mock.html');
const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadWindowData(fileName, globalName) {
  const file = path.join(ROOT, fileName);
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, {
    filename: file,
    timeout: 4000,
  });
  assert.ok(sandbox.window[globalName], `${fileName}에서 ${globalName}을 불러오지 못함`);
  return clone(sandbox.window[globalName]);
}

const finalModel = loadWindowData('mock-data-final.js', 'GFIELD_MOCK_FINAL');
const originalModel = loadWindowData('mock-data-original.js', 'GFIELD_MOCK_ORIGINAL');
const middleModel = loadWindowData('mock-data.js', 'GFIELD_MOCK');

function extractMainScript(html, marker) {
  const markerAt = html.indexOf(marker);
  assert.notEqual(markerAt, -1, `스크립트 표식 누락: ${marker}`);
  const start = html.lastIndexOf('<script>', markerAt) + '<script>'.length;
  const end = html.indexOf('</script>', markerAt);
  assert.ok(start >= '<script>'.length && end > start, '주 실행 스크립트 범위 오류');
  return html.slice(start, end);
}

function elementStub() {
  return {
    innerHTML: '', textContent: '', value: '', title: '', href: '',
    style: {}, dataset: {}, onclick: null,
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild() {}, querySelectorAll() { return []; },
  };
}

function loadFinalCore(options = {}) {
  const setKey = options.setKey || 'final';
  const model = clone(options.model || (setKey === 'original' ? originalModel : finalModel));
  const html = fs.readFileSync(FINAL_PAGE, 'utf8');
  let script = extractMainScript(
    html,
    '지필드 영재교육 · 파이널 모의고사 진단 LMS (final.html)',
  );
  const exposeFrom = 'window.GF_TEST = { M:M,';
  const exposeTo = `window.GF_TEST = {
    validOx:validOx, validateExamContract:validateExamContract,
    populationStatsVerified:populationStatsVerified, publicCutVerified:publicCutVerified,
    taxonomyOf:taxonomyOf, computePersonalAttempts:computePersonalAttempts,
    supaLoadRows:supaLoadRows, causeSumHTML:causeSumHTML,
    causeWrapHTML:causeWrapHTML, buildComment:buildComment,
    detailTableHTML:detailTableHTML, canonicalSubareaHTML:canonicalSubareaHTML,
    attemptTrendHTML:attemptTrendHTML, M:M,`;
  assert.ok(script.includes(exposeFrom), 'final.html의 GF_TEST 노출 지점이 바뀜');
  script = script.replace(exposeFrom, exposeTo);

  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, elementStub());
    return elements.get(id);
  };
  const search = setKey === 'original' ? '?set=original&round=1' : '?round=1';
  const sandbox = {
    window: null,
    URLSearchParams,
    location: { search, protocol: 'file:', hostname: '', href: '' },
    document: {
      title: '', readyState: 'loading', body: { appendChild() {} },
      addEventListener() {}, getElementById: getElement,
      querySelectorAll() { return []; }, querySelector() { return null; },
      createElement() { return elementStub(); },
    },
    localStorage: { getItem() { return ''; }, setItem() {}, removeItem() {} },
    fetch: options.fetch || (async () => ({ ok: true, status: 200, json: async () => [] })),
    setTimeout() { return 0; }, clearTimeout() {},
    setInterval() { return 0; }, clearInterval() {},
    console,
    GFIELD_MOCK_FINAL: setKey === 'final' ? model : clone(finalModel),
    GFIELD_MOCK_ORIGINAL: setKey === 'original' ? model : clone(originalModel),
    GFIELD_DATA: { students: [], studentTypes: {} },
    GFIELD_EXAM_CUES: [],
    BANK_TYPE_REGISTRY: registry,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: FINAL_PAGE, timeout: 5000 });
  return { core: sandbox.GF_TEST, sandbox, model };
}

function loadMockCore(options = {}) {
  const html = fs.readFileSync(MOCK_PAGE, 'utf8');
  let script = extractMainScript(html, '지필드 영재교육 · 중급 모의고사 진단 v2');
  const marker = '/* ─── LaTeX';
  assert.ok(script.includes(marker), 'mock.html의 QA 노출 지점이 바뀜');
  script = script.replace(marker, `window.GF_MOCK_TEST = {
    validOx:(typeof validOx==='function'?validOx:(typeof isValidOx==='function'?isValidOx:null)),
    scoreOf:(typeof scoreOf==='function'?scoreOf:null),
    supaLoadAll:(typeof supaLoadAll==='function'?supaLoadAll:null),
    doImport:(typeof doImport==='function'?doImport:null),
    levelLabel:(typeof levelLabel==='function'?levelLabel:null),
    renderReport:(typeof renderReport==='function'?renderReport:null),
    M:M
  };\n${marker}`);

  const model = clone(options.model || middleModel);
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, elementStub());
    return elements.get(id);
  };
  const sandbox = {
    window: null,
    URLSearchParams,
    location: { search: '', protocol: 'file:', hostname: '', href: '', reload() {} },
    document: {
      title: '', readyState: 'complete', body: {},
      addEventListener() {}, getElementById: getElement,
      querySelectorAll() { return []; }, querySelector() { return null; },
      createElement() { return elementStub(); },
      createTreeWalker() { return { nextNode() { return null; } }; },
    },
    NodeFilter: { SHOW_TEXT: 4 },
    localStorage: { getItem() { return ''; }, setItem() {}, removeItem() {} },
    fetch: options.fetch || (async () => ({ ok: true, status: 200, json: async () => [] })),
    setTimeout() { return 0; }, clearTimeout() {},
    setInterval() { return 0; }, clearInterval() {},
    atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
    btoa(value) { return Buffer.from(value, 'binary').toString('base64'); },
    escape, unescape,
    console,
    GFIELD_MOCK: model,
    GFIELD_MOCK_ORIGINAL: clone(originalModel),
    GFIELD_DATA: { students: [], studentTypes: {} },
    BANK_TYPE_REGISTRY: registry,
  };
  sandbox.window = sandbox;
  sandbox.window.addEventListener = () => {};
  sandbox.window.open = () => ({ document: { write() {}, close() {} } });
  vm.createContext(sandbox);
  const rxDataFile = path.join(ROOT, 'mock-rx-data.js');
  vm.runInContext(fs.readFileSync(rxDataFile, 'utf8'), sandbox, {
    filename: rxDataFile,
    timeout: 5000,
  });
  vm.runInContext(script, sandbox, { filename: MOCK_PAGE, timeout: 5000 });
  return { core: sandbox.GF_MOCK_TEST, sandbox, elements, model };
}

function verifiedPopulationFixture(baseStats, questionCount) {
  const size = 100;
  const values = Array(size).fill(50);
  const rate = {};
  const itemRates = {};
  for (let no = 1; no <= questionCount; no += 1) {
    rate[no] = 0.5;
    itemRates[no] = { correctCount: 50, denominator: size };
  }
  return {
    ...clone(baseStats),
    n: size,
    mean: 50,
    dist: values.slice(),
    rate,
    populationEvidence: {
      status: 'verified',
      sourceId: 'qa-fixture',
      sourceRef: 'qa://population-fixture',
      observedAt: '2026-08-27',
      verifiedBy: 'independent-qa',
      verifiedAt: '2026-08-27T00:00:00Z',
      cohort: {
        size,
        validScoreCount: size,
        definition: '같은 회차 최초 응시 중 유효 답안 100건',
      },
      scoreDistribution: {
        values: values.slice(),
        mean: 50,
        hash: 'sha256:qa-distribution',
      },
      itemRates,
      itemRatesHash: 'sha256:qa-item-rates',
    },
  };
}

const checks = [];
function check(name, fn) { checks.push({ name, fn }); }

check('final: O/X 30자 외 정오표와 변조 저장행을 거부', async () => {
  const good = 'X' + 'O'.repeat(29);
  const goodScore = Math.round(finalModel.blueprint.slice(1).reduce((sum, row) => sum + row.pts, 0) * 10) / 10;
  const rows = [
    { student: '학생', round: 'final1', ox: good, score: goodScore, wrong: 1, source: 'parent' },
    { student: '학생', round: 'final2', ox: 'O'.repeat(29) + 'Z', score: 100, wrong: 0, source: 'parent' },
    { student: '학생', round: 'final3', ox: 'O'.repeat(30), score: 0, wrong: 30, source: 'parent' },
    { student: '학생', round: 'final4', ox: 'O'.repeat(29), score: 97.3, wrong: 1, source: 'parent' },
  ];
  const { core } = loadFinalCore({
    fetch: async () => ({ ok: true, status: 200, json: async () => rows }),
  });
  assert.equal(core.validOx(good), true);
  for (const bad of ['O'.repeat(29), 'O'.repeat(29) + 'Z', 'O'.repeat(31), '', null]) {
    assert.equal(core.validOx(bad), false, `잘못된 정오표 승인: ${String(bad)}`);
    assert.throws(() => core.computeScore(String(bad == null ? '' : bad).split('')));
  }
  const loaded = await core.supaLoadRows('학생');
  assert.deepEqual(Object.keys(loaded), ['final1']);
});

check('mock: 입력·DB·수동 등록에서 O/X 30자와 점수 무결성을 강제', async () => {
  const validOx = 'O'.repeat(29) + 'X';
  const invalidOx = 'O'.repeat(29) + 'Z';
  const validScore = Math.round(middleModel.blueprint.slice(0, -1).reduce((sum, row) => sum + row.pts, 0) * 10) / 10;
  const rows = [
    { student: '정상', round: '1', ox: validOx, score: validScore, wrong: 1, source: 'parent' },
    { student: '문자변조', round: '1', ox: invalidOx, score: 100, wrong: 0, source: 'parent' },
    { student: '점수변조', round: '1', ox: validOx, score: 100, wrong: 0, source: 'parent' },
  ];
  const loaded = loadMockCore({
    fetch: async () => ({ ok: true, status: 200, json: async () => rows }),
  });
  const { core, sandbox } = loaded;
  assert.equal(typeof core.validOx, 'function', 'mock.html에 공통 validOx 검증기가 없음');
  assert.equal(core.validOx(validOx), true);
  assert.equal(core.validOx(invalidOx), false);
  let malformedRejected = false;
  try {
    const malformedScore = core.scoreOf(invalidOx.split(''));
    malformedRejected = !malformedScore || !Number.isFinite(Number(malformedScore.score));
  } catch (error) {
    malformedRejected = true;
  }
  assert.equal(malformedRejected, true, 'scoreOf가 잘못된 정오표를 정상 점수로 계산함');

  const ok = await core.supaLoadAll();
  assert.equal(ok, true);
  assert.ok(core.M.results['정상']);
  assert.equal(core.M.results['문자변조'], undefined, 'OX 외 문자가 든 DB 행이 반영됨');
  assert.equal(core.M.results['점수변조'], undefined, '점수/오답 수가 변조된 DB 행이 반영됨');

  const record = { s: '수동변조', r: '1', ox: invalidOx };
  sandbox.document.getElementById('impcode').value = Buffer.from(JSON.stringify(record), 'utf8').toString('base64');
  await core.doImport();
  assert.equal(core.M.results['수동변조'], undefined, '수동 등록이 OX 외 문자를 승인함');
});

check('검증되지 않은 모집단 평균·백분위·문항률·점수컷은 진단에서 숨김', () => {
  const { core } = loadFinalCore();
  const allCorrect = Array(30).fill('O');
  const ctx = core.buildContext('검증학생', 1, allCorrect);
  assert.equal(ctx.populationVerified, false);
  assert.equal(ctx.cutVerified, false);
  assert.equal(ctx.pct, null);
  assert.equal(ctx.grade, '기준 검증 대기');
  assert.equal(Object.keys(ctx.rate).length, 0);
  assert.equal(ctx.miss.length, 0);
  assert.ok(ctx.A.every((row) => row.crowd === null));
  assert.ok(ctx.P.every((row) => row.crowd === null));

  const details = core.detailTableHTML(ctx);
  assert.doesNotMatch(details, /<th>전체 정답률<\/th>|<th>판정<\/th>/);
  const trend = core.attemptTrendHTML(ctx.R, ctx.S, { 1: allCorrect }, [1]);
  assert.doesNotMatch(trend, /석차 백분율/);
  const comment = core.buildComment(ctx, {});
  assert.match(comment, /전체 평균·문항 정답률·석차 자료는 검증 전/);
  assert.doesNotMatch(comment, new RegExp(`응시자 평균\\s*${ctx.S.mean}`));
});

check('mock: 출처가 연결되지 않은 황소 반 점수컷 예측을 표시하지 않음', () => {
  const { core, sandbox } = loadMockCore();
  assert.equal(
    Boolean(core.M.cutBasis || core.M.populationEvidence || core.M.scoreCutEvidence),
    false,
    'QA 전제 변경: mock 데이터에 새 점수컷 근거가 생겼으면 근거 검증을 별도로 추가해야 함',
  );
  const direct = core.levelLabel(100);
  assert.doesNotMatch(String(direct && direct.label), /경시반|심화반|실력반|일품반|입문반/);
  assert.match(String(direct && direct.label), /기준 검증 대기|개인 점수|개인 수행/);
  core.M.results['컷학생'] = {
    1: [{ ox: Array(30).fill('O'), ts: '2026-08-27', by: 'parent' }],
  };
  core.renderReport('컷학생', '1', null, true);
  const html = sandbox.document.getElementById('main').innerHTML;
  assert.doesNotMatch(html, /경시반|심화반|실력반|일품반|입문반/);
  assert.match(html, /기준 검증 대기|개인 점수|개인 수행/);
});

check('모집단 검증 게이트는 출처·표본·분포·문항별 분모가 모두 있어야 열림', () => {
  const { core } = loadFinalCore();
  const base = finalModel.rounds['1'].stats;
  const verified = verifiedPopulationFixture(base, finalModel.questions);
  assert.equal(core.populationStatsVerified(verified), true);

  const missingSource = clone(verified);
  delete missingSource.populationEvidence.sourceRef;
  assert.equal(core.populationStatsVerified(missingSource), false);

  const wrongMean = clone(verified);
  wrongMean.mean = 49;
  assert.equal(core.populationStatsVerified(wrongMean), false);

  const missingHash = clone(verified);
  delete missingHash.populationEvidence.scoreDistribution.hash;
  assert.equal(core.populationStatsVerified(missingHash), false);

  const wrongDenominator = clone(verified);
  wrongDenominator.populationEvidence.itemRates[7].denominator = 99;
  assert.equal(core.populationStatsVerified(wrongDenominator), false);

  const unboundRuntimeDistribution = clone(verified);
  unboundRuntimeDistribution.dist[0] = 100;
  unboundRuntimeDistribution.dist[1] = 0;
  assert.equal(
    core.populationStatsVerified(unboundRuntimeDistribution),
    false,
    '백분위 계산에 쓰는 stats.dist가 검증된 evidence.values와 달라도 승인됨',
  );
});

check('원본형 확정 소영역과 자동 후보를 약점 판정에서 분리', () => {
  const catalog = registry.buildUnifiedCatalog({
    original: clone(originalModel),
    final: clone(finalModel),
  });
  const originalItems = catalog.items.filter((item) => item.sourceRef.set === 'original');
  const confirmedFinal1Items = catalog.items.filter((item) => item.sourceRef.set === 'final' && item.sourceRef.round === 1);
  const candidateItems = catalog.items.filter((item) => item.sourceRef.set === 'final' && item.sourceRef.round >= 2 && item.sourceRef.round <= 4);
  const confirmedFinal5Items = catalog.items.filter((item) => item.sourceRef.set === 'final' && item.sourceRef.round === 5);
  assert.equal(originalItems.length, 60);
  assert.ok(originalItems.every((item) => item.reviewStatus === 'confirmed' && !item.reviewRequired));
  assert.equal(confirmedFinal1Items.length, 30);
  assert.ok(confirmedFinal1Items.every((item) => item.reviewStatus === 'confirmed' && !item.reviewRequired));
  assert.ok(candidateItems.length > 0);
  assert.ok(candidateItems.every((item) => item.reviewStatus === 'candidate' && item.reviewRequired));
  assert.equal(confirmedFinal5Items.length, 30);
  assert.ok(confirmedFinal5Items.every((item) => item.reviewStatus === 'confirmed' && !item.reviewRequired));

  const originalCore = loadFinalCore({ setKey: 'original' }).core;
  const ox = Array(30).fill('O');
  ox[0] = 'X';
  const confirmed = originalCore.subareaAgg(originalModel.rounds['1'].items, ox, 1);
  assert.ok(confirmed.every((row) => row.reviewRequired === false));

  const finalCore = loadFinalCore().core;
  const finalOneSubareas = finalCore.subareaAgg(finalModel.rounds['1'].items, ox, 1);
  assert.ok(finalOneSubareas.every((row) => row.reviewRequired === false));
  const finalOneContext = finalCore.buildContext('분류학생', 1, ox);
  const table = finalCore.canonicalSubareaHTML(finalOneContext);
  assert.match(table, /대영역·소영역·세부유형이 확정된 문항만/);
  assert.doesNotMatch(table, /분류 검토 중/);
});

check('fixed item tag는 학생의 실제 오답 원인으로 단정하지 않음', () => {
  const { core } = loadFinalCore();
  const ox = Array(30).fill('O');
  ox[0] = 'X';
  const ctx = core.buildContext('복습학생', 1, ox);
  const summary = core.causeSumHTML(ctx);
  const blocks = core.causeWrapHTML(ctx);
  const comment = core.buildComment(ctx, {});
  assert.match(summary, /문항별 주의점 분류/);
  assert.match(summary, /실제 오답 원인 판정은 아닙니다/);
  assert.match(blocks, /문항에 미리 등록된 주의점/);
  assert.match(blocks, /실제로 틀린 원인은 학생 또는 교사가 풀이를 확인한 뒤 결정/);
  assert.doesNotMatch(blocks, /조건을 놓쳐 틀린 문제|풀이 절차를 밟지 않아 틀린 문제|개념이 없어 풀지 못한 문제/);
  assert.match(comment, /실제 오답 원인은 풀이를 다시 보며 확인/);
});

check('저장되지 않은 현재 응시는 개인·누적 최초 기록에서 제외', () => {
  const { core } = loadFinalCore();
  const ox = Array(30).fill('O');
  assert.equal(core.computePersonalAttempts(1, {}, 1, 'final1', ox, false).length, 0);
  assert.equal(core.computePersonalAttempts(1, {}, 1, 'final1', ox, true).length, 1);

  const originalCore = loadFinalCore({ setKey: 'original' }).core;
  assert.equal(originalCore.originalFirstAttempts(1, {}, 1, 'original1', ox, false).length, 0);
  assert.equal(originalCore.originalFirstAttempts(1, {}, 1, 'original1', ox, true).length, 1);
});

check('원본형 저장 기록도 O/X 30자 무결성을 만족할 때만 누적', () => {
  const { core } = loadFinalCore({ setKey: 'original' });
  const invalid = 'O'.repeat(29) + 'Z';
  assert.doesNotThrow(() => {
    const attempts = core.originalFirstAttempts(
      2,
      { original1: { ox: invalid } },
      1,
      'original2',
      Array(30).fill('O'),
      false,
    );
    assert.equal(attempts.length, 0);
  });
});

(async () => {
  const passed = [];
  const failed = [];
  for (const test of checks) {
    try {
      await test.fn();
      passed.push(test.name);
    } catch (error) {
      failed.push({ name: test.name, error });
    }
  }

  if (failed.length) {
    console.error(`진단 정확성 QA 실패: ${failed.length}/${checks.length}`);
    failed.forEach(({ name, error }) => {
      console.error(`\n[FAIL] ${name}\n${error.stack || error}`);
    });
    process.exitCode = 1;
    return;
  }
  console.log(`진단 정확성 QA ${passed.length}개 통과`);
})();
