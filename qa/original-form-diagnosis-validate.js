'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'mock-data-original.js');
const PAGE_FILE = path.join(ROOT, 'final.html');
const PRIVATE_DIR = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const RIGOR_META_FILE = path.join(ROOT, 'drafts', 'original-similar-2rounds', 'rigor-meta.json');
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
  assert.equal(model.exam.minutes, 80);
  assert.equal(Object.values(model.rounds).reduce((sum, round) => sum + round.items.length, 0), 60);
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

check('새 60문항의 핵심 정답과 분류', () => {
  const r1 = model.rounds['1'].items;
  const r2 = model.rounds['2'].items;
  assert.deepEqual(
    [r1[1].answer, r1[2].answer, r1[3].answer, r1[6].answer, r1[17].answer, r1[25].answer],
    ['18개', '7개', '9마리', '55', '300일', '9711'],
  );
  assert.deepEqual(
    [r2[3].answer, r2[7].answer, r2[8].answer, r2[9].answer, r2[18].answer, r2[21].answer, r2[22].answer, r2[23].answer, r2[25].answer, r2[27].answer, r2[28].answer, r2[29].answer],
    ['7', '11마리', '171개', '2번', '360일 뒤', '0-2-5-7-4-6-3-1', '186cm', '24개', '1118', '5개', '6장', 'D6'],
  );
  assert.deepEqual(
    [r1[0].difficultyClass, r1[20].difficultyClass, r2[1].difficultyClass, r2[27].difficultyClass],
    ['D2', 'D5', 'D2', 'D5'],
  );
  assert.deepEqual([r1[1].area, r1[1].subarea], ['도형', '시각적 변별']);
  assert.deepEqual([r1[24].area, r1[24].subarea], ['수·규칙찾기', '규칙수열·도형분할']);
  assert.deepEqual([r2[22].area, r2[22].subarea], ['도형', '도형의 길이']);
  assert.deepEqual([r2[18].area, r2[18].subarea], ['식의 계산', '달력·요일(시계)']);
  assert.deepEqual([r2[24].area, r2[24].subarea], ['경우의 수', '관계와 분류']);
  assert.equal(model.rounds['2'].paper.imageDir, 'original_form_2_v2');
});

check('시험지 60문항과 공개 진단 데이터가 문항별로 일치', () => {
  for (const roundNo of ['1', '2']) {
    const rendered = JSON.parse(fs.readFileSync(
      path.join(PRIVATE_DIR, `original-form-round${roundNo}-data.json`),
      'utf8',
    )).questions;
    const diagnostic = model.rounds[roundNo].items;
    assert.equal(rendered.length, diagnostic.length);
    rendered.forEach((item, index) => {
      const publicItem = diagnostic[index];
      assert.deepEqual(
        {
          no: publicItem.no,
          area: publicItem.area,
          subarea: publicItem.subarea,
          type: publicItem.type,
          answer: publicItem.answer,
          point: publicItem.pts,
          difficultyClass: publicItem.difficultyClass,
        },
        {
          no: item.number,
          area: item.area,
          subarea: item.subarea,
          type: item.type,
          answer: item.answer,
          point: item.point,
          difficultyClass: item.difficultyClass,
        },
        `원본형 ${roundNo}회 ${item.number}번 진단 데이터`,
      );
    });
  }
});

check('교체 12문항은 사용자 제공 실제 기출 이미지 구조만 사용', () => {
  const round2 = JSON.parse(fs.readFileSync(
    path.join(PRIVATE_DIR, 'original-form-round2-data.json'),
    'utf8',
  )).questions;
  const rigor = JSON.parse(fs.readFileSync(RIGOR_META_FILE, 'utf8')).items;
  const expectedSources = new Map([
    [4, 'user-24-blackboard-shapes'],
    [8, 'user-29-fish-bowl-pattern'],
    [9, 'user-36-digit-card-range'],
    [10, 'user-09-frog-seven-stones'],
    [19, 'user-35-fast-slow-clocks'],
    [22, 'user-28-adjacent-digits-line'],
    [23, 'user-39-recursive-square'],
    [24, 'user-07-four-problems-a'],
    [26, 'user-02-digital-display'],
    [28, 'user-01-long-sum'],
    [29, 'user-05-square-cover'],
    [30, 'user-41-maze-perspective-4p2'],
  ]);

  expectedSources.forEach((sourceId, no) => {
    const item = round2[no - 1];
    const meta = rigor[`R2Q${String(no).padStart(2, '0')}`];
    assert.match(item.source, /^사용자 제공 실제 기출 이미지 구조 변형/, `2회 ${no}번 사용자 이미지 출처 표기`);
    assert.equal(meta.sourceLocator.kind, 'user-supplied-source-variant', `2회 ${no}번 출처 종류`);
    assert.equal(meta.sourceLocator.sourceId, sourceId, `2회 ${no}번 출처 ID`);
  });

  assert.doesNotMatch(JSON.stringify(round2), /internal-(final|practice)|내부 (파이널|실전)/);

  const userOriginal = rigor.R2Q25.sourceLocator;
  assert.equal(userOriginal.kind, 'user-supplied-original');
  assert.match(userOriginal.sourceId, /^user-original-/);
});

check('1회와 2회에 동일 문항이 없음', () => {
  const normalize = (value) => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const round1 = JSON.parse(fs.readFileSync(path.join(PRIVATE_DIR, 'original-form-round1-data.json'), 'utf8')).questions;
  const round2 = JSON.parse(fs.readFileSync(path.join(PRIVATE_DIR, 'original-form-round2-data.json'), 'utf8')).questions;
  const prompts = new Set(round1.map((item) => normalize(item.prompt)));
  const signatures = new Set(round1.map((item) => `${normalize(item.type)}|${normalize(item.prompt)}|${normalize(item.answer)}`));
  round2.forEach((item) => {
    assert.equal(prompts.has(normalize(item.prompt)), false, `2회 ${item.number}번 문장이 1회와 동일`);
    assert.equal(signatures.has(`${normalize(item.type)}|${normalize(item.prompt)}|${normalize(item.answer)}`), false, `2회 ${item.number}번이 1회와 동일`);
  });
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
  const numberMaking = stats.find((row) => row.k === '수 만들기');
  assert.equal(numberMaking.n, 1);
  assert.equal(numberMaking.wrongNos[0], 9);
  assert.equal(core.originalWeakStatus(numberMaking), '확인 필요');
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
