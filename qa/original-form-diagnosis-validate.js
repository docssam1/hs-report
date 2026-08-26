'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'mock-data-original.js');
const PAGE_FILE = path.join(ROOT, 'final.html');
const allowedAreas = ['수·규칙찾기', '도형', '경우의 수', '식의 계산'];

function loadModel() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA_FILE, 'utf8'), sandbox, { filename: DATA_FILE, timeout: 2000 });
  return JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_ORIGINAL));
}

function loadCore(model) {
  const html = fs.readFileSync(PAGE_FILE, 'utf8');
  const marker = '지필드 영재교육 · 파이널 모의고사 진단 LMS (final.html)';
  const markerAt = html.indexOf(marker);
  assert.notEqual(markerAt, -1, '진단 스크립트 시작을 찾을 수 없음');
  const start = html.lastIndexOf('<script>', markerAt) + '<script>'.length;
  const end = html.indexOf('</script>', markerAt);
  const app = { innerHTML: '', onclick: null };
  const printBtn = { style: {}, onclick: null };
  const sandbox = {
    window: null,
    URLSearchParams,
    location: { search: '?set=original&round=2', protocol: 'file:', hostname: '', href: '' },
    document: {
      title: '',
      readyState: 'loading',
      addEventListener() {},
      getElementById(id) { return id === 'app' ? app : printBtn; },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      body: { appendChild() {} },
    },
    localStorage: { getItem() { return ''; }, setItem() {} },
    fetch: async () => ({ ok: true, json: async () => [] }),
    setTimeout() { return 0; },
    clearTimeout() {},
    setInterval() { return 0; },
    clearInterval() {},
    console,
    GFIELD_MOCK_ORIGINAL: model,
    GFIELD_DATA: { students: [], studentTypes: {} },
    GFIELD_EXAM_CUES: [],
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(html.slice(start, end), sandbox, { filename: PAGE_FILE, timeout: 3000 });
  return sandbox.GF_TEST;
}

const model = loadModel();
const tests = [];
function check(name, fn) { fn(); tests.push(name); }

check('원본형 2회·각 30문항·각 100점', () => {
  assert.equal(model.roundCount, 2);
  for (const roundNo of ['1', '2']) {
    const items = model.rounds[roundNo].items;
    assert.equal(items.length, 30);
    assert.equal(items.reduce((sum, item) => sum + model.blueprint[item.no - 1].pts, 0).toFixed(1), '100.0');
    assert.deepEqual(items.map((item) => item.no), Array.from({ length: 30 }, (_, i) => i + 1));
  }
});

check('모든 문항에 대영역·소영역·세부유형·정답 존재', () => {
  Object.values(model.rounds).forEach((round) => round.items.forEach((item) => {
    assert.ok(allowedAreas.includes(item.area), `${round.title} ${item.no}번 대영역`);
    assert.ok(item.subarea && item.type && item.answer, `${round.title} ${item.no}번 3단계 분류 또는 정답 누락`);
  }));
});

check('공개 점수컷 2개년 산술평균과 경계값', () => {
  assert.deepEqual(model.cutBasis.rows.map((row) => row.average), [48.1, 39.0, 30.6, 21.0]);
  model.cutBasis.rows.forEach((row) => {
    assert.equal(row.average, Math.round(((row.y2024 + row.y2025) / 2) * 10) / 10);
  });
  Object.values(model.rounds).forEach((round) => {
    assert.equal(round.stats.cutOnly, true);
    assert.equal('n' in round.stats, false);
    assert.equal('dist' in round.stats, false);
    assert.equal('rate' in round.stats, false);
  });
});

check('새 2회 자동차·두 동물 키 차 정답과 버전 이미지 경로', () => {
  assert.equal(model.rounds['2'].items[1].answer, '8m');
  assert.equal(model.rounds['2'].items[4].answer, '25cm');
  assert.equal(model.rounds['2'].paper.imageDir, 'original_form_2_v2');
});

check('25번 반복 분할은 마디수열·규칙찾기로 분류', () => {
  for (const roundNo of ['1', '2']) {
    const item = model.rounds[roundNo].items[24];
    assert.equal(item.area, '수·규칙찾기');
    assert.equal(item.subarea, '마디수열·규칙찾기');
  }
  assert.equal(model.rounds['1'].items[24].type, '반복 분할 선 길이');
  assert.equal(model.rounds['2'].items[24].type, '3등분 반복 선 길이');
});

check('23번 제한된 수의 최소합은 식의 계산·식의 완성 기준', () => {
  for (const roundNo of ['1', '2']) {
    const item = model.rounds[roundNo].items[22];
    assert.equal(item.area, '식의 계산');
    assert.equal(item.subarea, '식의 완성');
    assert.equal(item.type, '제한된 수의 최소합');
  }
});

const core = loadCore(model);

check('원본형 점수 계산과 등급 경계', () => {
  assert.equal(core.computeScore(Array(30).fill('O')).score, 100);
  const cuts = model.rounds['1'].stats.cuts;
  assert.equal(core.cutInfo(48.1, cuts).grade, '경시 가능');
  assert.equal(core.cutInfo(48.0, cuts).grade, '경시컷 · 심화안정권');
  assert.equal(core.cutInfo(39.0, cuts).grade, '경시컷 · 심화안정권');
  assert.equal(core.cutInfo(38.9, cuts).grade, '심화컷 · 실력안정권');
  assert.equal(core.cutInfo(30.6, cuts).grade, '심화컷 · 실력안정권');
  assert.equal(core.cutInfo(30.5, cuts).grade, '실력컷 · 일품안정권');
  assert.equal(core.cutInfo(21.0, cuts).grade, '실력컷 · 일품안정권');
  assert.equal(core.cutInfo(20.9, cuts).grade, '노력요함');
});

check('소영역 수행률과 1문항 확인 필요 판정', () => {
  const ox = Array(30).fill('O');
  ox[8] = 'X';
  const stats = core.subareaAgg(model.rounds['2'].items, ox);
  const interval = stats.find((row) => row.k === '간격 문제');
  assert.equal(interval.n, 1);
  assert.equal(interval.wrongNos[0], 9);
  assert.equal(core.originalWeakStatus(interval), '확인 필요');
});

check('두 회차 같은 소영역 반복 오답 감지', () => {
  const ox1 = Array(30).fill('O');
  const ox2 = Array(30).fill('O');
  ox1[0] = 'X';
  ox2[1] = 'X';
  const repeated = core.repeatedOriginalSubareas([{ n: 1, oxArr: ox1 }, { n: 2, oxArr: ox2 }]);
  assert.ok(repeated.some((row) => row.k === '합차와 배수' && row.rounds.join(',') === '1,2'));
});

check('개인 전용 레이더에는 존재하지 않는 전체 평균 계열 없음', () => {
  const areas = core.areaAgg(model.rounds['2'].items, Array(30).fill('O'), {});
  const svg = core.radarSVG(areas, true);
  assert.doesNotMatch(svg, /class="av"|class="d-av"/);
  assert.match(svg, /class="me"/);
});

check('저장 실패한 현재 답안은 최초 기록에 포함하지 않음', () => {
  const ox = Array(30).fill('O');
  assert.equal(core.originalFirstAttempts(2, {}, 1, 'original2', ox, false).length, 0);
  const saved = core.originalFirstAttempts(2, {}, 1, 'original2', ox, true);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].n, 2);
});

console.log(`원본형 성적·약점 진단 QA ${tests.length}개 통과`);
