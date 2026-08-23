'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'mock-data-last.js');
const FIGURE_FILE = path.join(ROOT, 'last-exam-svg.js');
const FINAL_FILE = path.join(ROOT, 'final.html');
const INDEX_ENHANCEMENTS_FILE = path.join(ROOT, 'index-enhancements.js');
const ADMIN_ENHANCEMENTS_FILE = path.join(ROOT, 'admin-mock-v2.js');
const GENERATED_DATA_FILE = path.join(ROOT, 'data.js');
const ANSWER_FILE = path.join(ROOT, 'last1-answer.html');
const GENERIC_ANSWER_FILE = path.join(ROOT, 'last-answer.html');
const ANALYSIS_FILE = path.join(ROOT, 'last1-analysis.html');
const RESULT_FILE = path.join(ROOT, 'last1-result.html');

const sandbox = { window: {} };
vm.createContext(sandbox);

function loadScript(file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, sandbox, { filename: file, timeout: 1000 });
  return source;
}

const dataSource = loadScript(DATA_FILE);
const figureSource = loadScript(FIGURE_FILE);
const finalSource = fs.readFileSync(FINAL_FILE, 'utf8');
const indexEnhancementsSource = fs.readFileSync(INDEX_ENHANCEMENTS_FILE, 'utf8');
const adminEnhancementsSource = fs.readFileSync(ADMIN_ENHANCEMENTS_FILE, 'utf8');
const generatedDataSource = fs.readFileSync(GENERATED_DATA_FILE, 'utf8');
const answerSource = fs.readFileSync(ANSWER_FILE, 'utf8');
const genericAnswerSource = fs.readFileSync(GENERIC_ANSWER_FILE, 'utf8');
const analysisSource = fs.readFileSync(ANALYSIS_FILE, 'utf8');
const resultSource = fs.readFileSync(RESULT_FILE, 'utf8');
const M = sandbox.window.GFIELD_MOCK_LAST;
const FIGURES = sandbox.window.GFIELD_LAST_FIGURES;

const EXPECTED_RATES = [
  .323809524,.6,.904761905,.228571429,.238095238,.133333333,.380952381,.352380952,.285714286,.114285714,
  .714285714,.152380952,.076190476,.514285714,.447619048,.247619048,.428571429,.580952381,.40952381,.485714286,
  .371428571,.361904762,.428571429,0,.257142857,.133333333,.39047619,.2,.095238095,.180952381
];
const EXPECTED_TIMES = [11,112,178,220,380,450,505,550,595,715,810,875,1010,1215,1250,1320,1395,1435,1460,1515,1745,1775,1840,1910,2235,2390,2455,2695,2765,2835];
const EXPECTED_TYPES = ['특정 숫자가 들어있는 수의 개수','요일','순환소수의 자릿수','가우스 덧셈의 활용','고장난 시계의 시간 차','종이 접기','표에서의 특정 칸을 포함하는 사각형의 개수','원에서 마주보고 있는 수 구하기','합이 일정한 수','두 수의 합을 보고 원래의 수 구하기','도형이 나타내는 수','도형을 이용한 계차수열의 활용','자리 수하기','곱과 합이 일정한 수 구하기','연속으로 이웃하는 칸의 합이 같은 수 구하기','바둑돌 채우기(그림그려 해결하기)','간격의 활용','깃발의 가짓수','서랍원리','주사위 움직이기','상자에 구슬을 서로 다르게 담기','그림그려 해결하기','반복마디의 활용','조건에 맞는 수의 활용','이진법','재치있게 계산하기(덧셈)','논리추리(이중조건)','줄 세우기(활용)','두 종류의 수로 만든 수의 가짓수','복면산'];
const EXPECTED_AREAS = ['수,규칙찾기','식의 계산','수,규칙찾기','수,규칙찾기','식의 계산','도형','도형','수,규칙찾기','수,규칙찾기','식의 계산','수,규칙찾기','수,규칙찾기','수,규칙찾기','수,규칙찾기','수,규칙찾기','식의 계산','식의 계산','경우의 수','경우의 수','도형','경우의 수','식의 계산','수,규칙찾기','수,규칙찾기','수,규칙찾기','식의 계산','경우의 수','경우의 수','수,규칙찾기','식의 계산'];
const EXPECTED_POINTS = [...Array(12).fill(2.7),...Array(10).fill(3.4),...Array(8).fill(4.2)];
const EXPECTED_TB = [
  [76.7,0.9],[69.8,1.8],[69.5,2.7],[67.8,3.6],[67.7,4.5],[66.3,5.5],[60.8,6.4],[60.2,7.3],[58,8.2],[57.9,9.1],[56.9,10],[56.1,10.9],[56,11.8],[55.7,12.7],[54.2,13.6],[52.7,14.5],[52.6,16.4],[52.5,17.3],[51.1,18.2],[49.9,19.1],[49.1,20],[48.4,21.8],[47.7,22.7],[46.5,23.6],[45.8,24.5],[43.9,26.4],[42.4,27.3],[40.9,28.2],[40.4,29.1],[40.1,30],[38.9,30.9],[38.2,31.8],[36.3,32.7],[35.5,33.6],[35,35.5],[34.7,36.4],[34.3,37.3],[34,38.2],[33.6,39.1],[32.5,40.9],[32.1,41.8],[32,43.6],[31.9,44.5],[31.2,45.5],[30.6,46.4],[30.5,48.2],[30.2,50],[29.4,50.9],[29.3,51.8],[28.6,52.7],[25.9,54.5],[25.2,55.5],[25.1,56.4],[24.8,57.3],[24.5,60],[24.4,60.9],[24,63.6],[23.8,64.5],[23.3,65.5],[23.2,66.4],[22.4,67.3],[21.8,68.2],[21.7,70],[20.3,70.9],[19.9,71.8],[19.8,73.6],[19.7,75.5],[19.1,76.4],[19,79.1],[18.3,80],[17.7,80.9],[17.6,81.8],[17.2,82.7],[16.9,83.6],[15.7,84.5],[14.9,85.5],[13,86.4],[12.9,87.3],[12.2,88.2],[11.5,90],[9.6,91.8],[9.5,92.7],[8.8,93.6],[2.7,94.5],[0,95.5]
];
const EXPECTED_CUM = [[19.1,'경시 가능'],[36.1,'경시컷,심화안정권'],[46.2,'심화컷,실력안정권'],[53.3,'실력컷,일품안정권'],[60,'일품 가능'],[76.4,'일품컷'],[101,'노력요함']];

const passes = [];
const failures = [];

function check(name, fn) {
  try {
    fn();
    passes.push(name);
  } catch (error) {
    failures.push({ name, error });
  }
}

function hostArray(value) {
  return Array.from(value || []);
}

function extractConstArray(source, name) {
  const match = source.match(new RegExp(`const ${name}=(\\[[\\s\\S]*?\\]);`));
  assert.ok(match, `${name} 배열을 찾을 수 없음`);
  return JSON.parse(JSON.stringify(vm.runInNewContext(match[1], {}, { timeout: 1000 })));
}

function extractAnswerRows() {
  const body = answerSource.match(/<table id="answerTable"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(body, '답안 본표 tbody를 찾을 수 없음');
  return [...body[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[0]);
}

function question(round, no) {
  return hostArray(round.paper.questions).find((q) => q.no === no);
}

function collectForbiddenKeys(value, trail, found, seen) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  for (const key of Object.keys(value)) {
    const nextTrail = trail.concat(key);
    if (/(?:answer|solution)/i.test(key)) found.push(nextTrail.join('.'));
    collectForbiddenKeys(value[key], nextTrail, found, seen);
  }
}

function digitSum(number) {
  return String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function qualifiesForQuestion24(number) {
  const text = String(number);
  const onePositions = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '1') onePositions.push(index);
  }
  return onePositions.length === 2 && onePositions[1] === onePositions[0] + 1;
}

function enumerateQuestion27() {
  const people = ['갑', '을', '병'];
  const jobs = ['가수', '이발사', '배우', '감독', '약사', '주방장'];
  const solutions = [];

  for (let encoded = 0; encoded < 3 ** jobs.length; encoded += 1) {
    let cursor = encoded;
    const holder = {};
    for (const job of jobs) {
      holder[job] = people[cursor % people.length];
      cursor = Math.floor(cursor / people.length);
    }

    if (people.some((person) => jobs.filter((job) => holder[job] === person).length !== 2)) continue;

    // 원문 여섯 조건과 사용자가 승인한 일곱 번째 조건을 모두 적용합니다.
    if (holder['약사'] === holder['가수']) continue;
    if (holder['감독'] === '갑' || holder['이발사'] === '갑') continue;
    if (holder['감독'] === holder['이발사']) continue;
    if (holder['가수'] === holder['배우']) continue;
    if (holder['약사'] === holder['감독']) continue;
    if (holder['이발사'] === '을') continue;
    if (holder['가수'] === '병' || holder['가수'] === '을') continue;

    const byPerson = {};
    for (const person of people) {
      byPerson[person] = jobs.filter((job) => holder[job] === person).sort();
    }
    solutions.push(byPerson);
  }

  return solutions;
}

function enumerateQuestion29() {
  const matches = [];
  for (let a = 1; a <= 5; a += 1) {
    for (let b = 1; b <= 5; b += 1) {
      for (let c = 1; c <= 5; c += 1) {
        for (let d = 1; d <= 5; d += 1) {
          const digits = [a, b, c, d];
          if (new Set(digits).size === 2) matches.push(digits.join(''));
        }
      }
    }
  }
  return matches;
}

function cubeBottomAfterRoute(directions) {
  let cube = { top: 1, bottom: 6, north: 5, south: 2, east: 3, west: 4 };
  for (const direction of directions) {
    const old = cube;
    if (direction === 'E') {
      cube = { ...old, top: old.west, bottom: old.east, east: old.top, west: old.bottom };
    } else if (direction === 'W') {
      cube = { ...old, top: old.east, bottom: old.west, east: old.bottom, west: old.top };
    } else if (direction === 'N') {
      cube = { ...old, top: old.south, bottom: old.north, north: old.top, south: old.bottom };
    } else if (direction === 'S') {
      cube = { ...old, top: old.north, bottom: old.south, north: old.bottom, south: old.top };
    } else {
      throw new Error(`알 수 없는 주사위 이동: ${direction}`);
    }
  }
  return cube.bottom;
}

function routeFromCubeFigure(markup) {
  const segments = [];
  const linePattern = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"[^>]*marker-end="url\(#cr-arr\)"[^>]*\/>/g;
  let match;
  while ((match = linePattern.exec(markup))) {
    const x1 = Number(match[1]);
    const y1 = Number(match[2]);
    const x2 = Number(match[3]);
    const y2 = Number(match[4]);
    if (x2 > x1 && y2 === y1) segments.push({ direction: 'E', distance: x2 - x1 });
    else if (x2 < x1 && y2 === y1) segments.push({ direction: 'W', distance: x1 - x2 });
    else if (y2 < y1 && x2 === x1) segments.push({ direction: 'N', distance: y1 - y2 });
    else if (y2 > y1 && x2 === x1) segments.push({ direction: 'S', distance: y2 - y1 });
    else throw new Error(`대각선 또는 길이 0인 주사위 경로: ${match[0]}`);
  }

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }
  const unit = segments.map((segment) => Math.round(segment.distance)).reduce(gcd);
  const directions = [];
  for (const segment of segments) {
    const steps = Math.round(segment.distance / unit);
    directions.push(...Array(steps).fill(segment.direction));
  }
  return directions;
}

function minimumDotsForQuestion12() {
  const sectorCount = 8;
  let sector = 1;
  const visited = new Set([sector]);
  let pointCount = 1;
  for (let jump = 2; visited.size < sectorCount && jump < 100; jump += 1) {
    sector = ((sector - jump) % sectorCount + sectorCount) % sectorCount;
    visited.add(sector);
    pointCount += 1;
  }
  return pointCount;
}

function solveQuestion30FromVerifiedConstraints() {
  // 세로셈에서 확인되는 ㄱ=3, ㄷ=0, {ㄴ, ㄹ}={1,2}와 여덟 자리 제곱 조건을 검산합니다.
  const candidates = [];
  for (const b of [1, 2]) {
    for (const d of [1, 2]) {
      if (b === d) continue;
      const number = 3000 + b * 100 + d;
      if (String(number * number).length === 8) candidates.push(number);
    }
  }
  return candidates;
}

check('데이터와 도형 전역 객체 로드', () => {
  assert.ok(M && typeof M === 'object');
  assert.ok(FIGURES && typeof FIGURES === 'object');
  assert.equal(M.key, 'last');
  assert.equal(M.mode, 'paper-only');
});

check('최종 모의고사 90분 계획과 종료 큐', () => {
  assert.equal(M.exam.minutes, 90);
  assert.deepEqual(hostArray(M.exam.plan).map((part) => [part.from, part.to]), [
    [0, 5], [5, 35], [35, 75], [75, 90]
  ]);
  assert.deepEqual(hostArray(M.exam.cues).map((cue) => cue.at), [0, 5 * 60, 35 * 60, 75 * 60, 90 * 60]);
});

const round = M && M.rounds && M.rounds['1'];
const questions = round && round.paper && hostArray(round.paper.questions);

check('30문항과 번호 1~30', () => {
  assert.equal(M.questions, 30);
  assert.equal(M.exam.questions, 30);
  assert.equal(questions.length, 30);
  assert.deepEqual(questions.map((q) => q.no), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(new Set(questions.map((q) => q.no)).size, 30);
});

check('배점 구간과 합계 100점', () => {
  for (const q of questions) {
    const expected = q.no <= 12 ? 2.7 : q.no <= 22 ? 3.4 : 4.2;
    assert.equal(q.pts, expected, `${q.no}번 배점`);
  }
  const total = questions.reduce((sum, q) => sum + q.pts, 0);
  assert.ok(Math.abs(total - 100) < 1e-9, `배점 합계 ${total}`);
  assert.equal(M.exam.total, 100);
});

check('6개 페이지의 문항 매핑이 중복·누락 없음', () => {
  const pages = hostArray(round.paper.pages);
  assert.deepEqual(pages.map((page) => page.page), [1, 2, 3, 4, 5, 6]);
  const expectedPages = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28],
    [29, 30]
  ];
  const mapped = [];
  pages.forEach((page, index) => {
    const numbers = ['left', 'right', 'full'].flatMap((key) => hostArray(page[key]));
    assert.deepEqual(numbers, expectedPages[index], `${page.page}쪽 문항`);
    assert.equal(new Set(numbers).size, numbers.length, `${page.page}쪽 내부 중복`);
    mapped.push(...numbers);
  });
  assert.deepEqual(mapped, Array.from({ length: 30 }, (_, index) => index + 1));
});

check('14개 도형 문항과 renderer 일대일 대응', () => {
  const figureKeys = questions.filter((q) => q.figure).map((q) => q.figure);
  const rendererKeys = Object.keys(FIGURES);
  assert.equal(figureKeys.length, 14);
  assert.equal(new Set(figureKeys).size, 14);
  assert.deepEqual(rendererKeys.sort(), figureKeys.slice().sort());
  for (const key of figureKeys) {
    assert.equal(typeof FIGURES[key], 'function', `${key} renderer`);
    const markup = FIGURES[key]();
    assert.equal(typeof markup, 'string');
    assert.ok(markup.length > 80, `${key} 출력 길이`);
    assert.match(markup, /role="img"/);
    assert.match(markup, /aria-label="[^"]+"/);
    assert.doesNotMatch(markup, /(?:undefined|NaN)/);
    if (markup.includes('<svg')) assert.match(markup, /<title>[^<]+<\/title>/);
  }
});

check('학생용 데이터에 answer/solution 계열 필드 없음', () => {
  const forbidden = [];
  collectForbiddenKeys(M, [], forbidden, new Set());
  assert.deepEqual(forbidden, []);
  assert.doesNotMatch(dataSource, /\b(?:answer|solution)(?:Url|Key|Text|Html|Data)?\s*:/i);
});

check('학생용 문항 본문에 실행 가능한 태그·이벤트 없음', () => {
  for (const q of questions) {
    assert.equal(typeof q.body, 'string');
    assert.doesNotMatch(q.body, /<\s*(?:script|iframe|object|embed)\b/i, `${q.no}번`);
    assert.doesNotMatch(q.body, /\son[a-z]+\s*=/i, `${q.no}번`);
  }
});

check('27·29번 승인 교정 반영과 회차 공개 준비 상태', () => {
  assert.equal(question(round, 27).status, undefined);
  assert.equal(question(round, 27).reviewReason, undefined);
  assert.equal(question(round, 29).status, undefined);
  assert.equal(question(round, 29).reviewReason, undefined);
  assert.match(question(round, 29).body, /1211/);
  assert.doesNotMatch(question(round, 29).body, /8878/);
  assert.equal(round.ready, true);
  assert.equal(round.lockedQuestions, undefined);
  assert.equal(round.reviewNote, undefined);
  const clues = FIGURES['job-clues']();
  assert.match(clues, /일곱 조건/);
  assert.match(clues, /감독과 이발사는 서로 다른 사람입니다/);
});

check('6·12·20·30번 원본 도형 표식 반영', () => {
  const fold = FIGURES['paper-fold']();
  assert.match(fold, /M16 29C20 15 33 9 48 13/);
  assert.match(fold, /M119 29C115 15 102 9 87 13/);
  assert.match(fold, /M21 7C30 11 31 19 24 25/);
  assert.match(fold, /M36 50C45 45 45 35 36 30/);
  assert.match(figureSource, /ds=\[\[0\],\[0,2\],\[0,2,5\],\[0,1,2,5\]\]/);
  assert.match(FIGURES['cube-route'](), /왼쪽 4, 뒤 5/);
  const crypt = FIGURES['cryptarithm']();
  assert.match(crypt, /<span class="crypt-given"[^>]*>9<\/span>(?:<span class="crypt-box"><\/span>){3}<\/div>/);
});

check('24번 전수열거 숫자 합 2862', () => {
  const matches = [];
  for (let number = 10; number <= 10000; number += 1) {
    if (qualifiesForQuestion24(number)) matches.push(number);
  }
  assert.equal(matches.length, 243);
  assert.equal(matches.reduce((sum, number) => sum + digitSum(number), 0), 2862);
});

check('27번 승인 조건 전수열거 결과가 정확히 한 해', () => {
  const solutions = enumerateQuestion27();
  assert.equal(solutions.length, 1);
  const signatures = solutions.map((solution) =>
    ['갑', '을', '병'].map((person) => `${person}:${solution[person].join('+')}`).join('|')
  ).sort();
  assert.deepEqual(signatures, [
    '갑:가수+주방장|을:감독+배우|병:약사+이발사'
  ]);
});

check('29번 승인 예시와 정답 140 전수검산', () => {
  const matches = enumerateQuestion29();
  assert.equal(matches.length, 140);
  assert.ok(matches.includes('1211'));
  assert.equal((5 * 4 / 2) * ((2 * 2 * 2 * 2) - 2), 140);
});

check('20번 SVG 실제 경로 주사위 바닥면 2', () => {
  const route = routeFromCubeFigure(FIGURES['cube-route']());
  assert.equal(route.length, 14);
  assert.equal(route.join(''), 'ENEEESSWWWSEES');
  assert.equal(cubeBottomAfterRoute(route), 2);
});

check('12번 점 찍기 계차수열 최소 15개', () => {
  assert.equal(minimumDotsForQuestion12(), 15);
});

check('30번 복면산 3201 및 제곱 검산', () => {
  assert.deepEqual(solveQuestion30FromVerifiedConstraints(), [3201]);
  assert.equal(3201 * 3201, 10246401);
  const markup = FIGURES['cryptarithm']();
  assert.doesNotMatch(markup, /class="crypt-box">[A-S]</);
  assert.doesNotMatch(markup, /class="crypt-box">9<\/span>/);
  assert.match(markup, /class="crypt-given"[^>]*>9<\/span>/);
});

check('검산 파일이 학생 데이터에 섞이지 않음', () => {
  assert.doesNotMatch(dataSource, /2862|10246401|ENEEESSWWWSEES/);
  assert.doesNotMatch(figureSource, /2862|10246401|ENEEESSWWWSEES/);
});

check('최종 1~4회 90분 표기가 공용 화면과 관리자 저장 경로에 유지됨', () => {
  assert.match(indexEnhancementsSource, /90분 시간 배분 전략/);
  assert.match(adminEnhancementsSource, /90분 시간 배분 전략/);
  assert.match(generatedDataSource, /90분 시간 배분 전략/);
  assert.match(answerSource, /제한시간 90분/);
  assert.match(genericAnswerSource, /제한시간 90분/);
  for (const [name, source] of [
    ['index-enhancements.js', indexEnhancementsSource],
    ['admin-mock-v2.js', adminEnhancementsSource],
    ['last1-answer.html', answerSource],
    ['last-answer.html', genericAnswerSource]
  ]) {
    assert.doesNotMatch(source, /80분 시간 배분 전략|제한시간 80분/, name);
  }
});

check('최종 HTML/SVG 시험지·인쇄·준비상태 라우팅', () => {
  assert.match(finalSource, /isLast\?'mock-data-last\.js':'mock-data-final\.js'/);
  assert.match(finalSource, /files\.push\('last-exam-svg\.js'\)/);
  assert.match(finalSource, /goParam==='paper'/);
  assert.match(finalSource, /function renderPaper\(\)/);
  assert.match(finalSource, /window\.print\(\)/);
  assert.match(finalSource, /R\.ready===false && !preview/);
  assert.match(finalSource, /params\.get\('preview'\)==='1' && localPreviewHost/);
  assert.match(finalSource, /location\.hostname==='127\.0\.0\.1'/);
  assert.match(finalSource, /\.paper-columns\{[^}]*height:239mm/);
  assert.match(finalSource, /M\.mode==='paper-only'/);
  assert.match(finalSource, /roundNum===1\?'last1-answer\.html'/);
  assert.match(finalSource, /if\(preview\) query\.push\('preview=1'\)/);
  assert.match(finalSource, /async function supaUpsert\([^)]*\)\{\s*if\(isLast\) return false;/);
  assert.match(finalSource, /async function supaWeakUpsert\([^)]*\)\{\s*if\(isLast\) return false;/);
  assert.match(finalSource, /async function supaWeakDelete\([^)]*\)\{\s*if\(isLast\) return false;/);
  assert.match(finalSource, /@page\{size:A4 portrait;margin:0\}/);
  assert.match(finalSource, /\.exam-paper-page:last-child\{break-after:auto/);
});

check('학생 홈페이지의 최종 1회 링크가 시험지·타이머·답안으로 분리됨', () => {
  assert.match(indexEnhancementsSource, /label:'시험지 보기·인쇄',url:base\+'&go=paper'/);
  assert.match(indexEnhancementsSource, /label:'실전 타이머',url:base\+'&go=timer'/);
  assert.match(indexEnhancementsSource, /label:'답안·해설',url:base\+'&go=answer'/);
  assert.match(indexEnhancementsSource, /book\.pdf=''/);
  assert.match(generatedDataSource, /final\.html\?set=last&round=1&go=answer/);
  assert.doesNotMatch(generatedDataSource, /hs\.gfieldacademy\.net\/last1-answer\.html/);
});

check('승인 문항 교정과 30문항 통계 반영 후 공개 잠금 해제', () => {
  assert.match(answerSource, /24번 정답은 전수검산값 2862/);
  assert.doesNotMatch(answerSource, /2950/);
  assert.match(answerSource, /27번은 승인 조건으로 유일해 확정/);
  assert.match(answerSource, /29번 예시는 1211로 교정/);
  assert.match(answerSource, /갑: 가수·주방장/);
  assert.match(answerSource, /을: 배우·감독/);
  assert.match(answerSource, /병: 이발사·약사/);
  assert.match(answerSource, /140가지/);
  assert.doesNotMatch(answerSource, /채점 제외|판정 보류|공개 보류|8878|완전순열|2⁴|재산출 대기|검수 중/);
  assert.match(answerSource, /id="answerLock"/);
  assert.match(answerSource, /id="answerSheet"/);
  assert.match(answerSource, /var preview=params\.get\('preview'\)==='1'&&local/);
  assert.match(answerSource, /var ready=!!\(round&&round\.ready===true\)/);
  assert.match(answerSource, /평균 정답률 33\.5%/);
  assert.match(answerSource, /가중 평균 32\.4점/);
  assert.match(analysisSource, /const VALIDATION_LOCK=Object\.freeze\(\{\s*active:false/);
  assert.match(analysisSource, /const ITEM_STATUS=Object\.freeze\(\{\}\)/);
  assert.doesNotMatch(analysisSource, /24번 정답률·평균 재산출 대기|27번 조건·정답 확정 대기|29번 원문 예시 오류 교정 승인 대기|27:'판정 보류'|29:'예시 오류'/);
  assert.match(analysisSource, /publishBtn\.disabled=VALIDATION_LOCK\.active/);
  assert.doesNotMatch(analysisSource, /id="(?:analysisBtn|analysisPrintBtn|copyBtn|sendBtn|publishBtn)"[^>]*disabled/);
  const renderStart = analysisSource.indexOf('function render()');
  const renderGuard = analysisSource.indexOf('if(VALIDATION_LOCK.active)', renderStart);
  const scoreStart = analysisSource.indexOf('let score=0', renderStart);
  assert.ok(renderStart >= 0 && renderGuard > renderStart && scoreStart > renderGuard, '분석 함수 guard가 점수 산출보다 먼저여야 함');
  const publishStart = analysisSource.indexOf('async function publish()');
  const guard = analysisSource.indexOf('if(VALIDATION_LOCK.active)', publishStart);
  const fetchCall = analysisSource.indexOf('fetch(', publishStart);
  assert.ok(publishStart >= 0 && guard > publishStart && fetchCall > guard, '공개 함수 guard가 fetch보다 먼저여야 함');
});

check('정답률 30개·평균 정답률·가중 평균점수 정확성', () => {
  const rates = extractConstArray(analysisSource, 'RATE');
  assert.equal(rates.length, 30);
  rates.forEach((rate, index) => assert.ok(Math.abs(rate - EXPECTED_RATES[index]) < 1e-12, `${index + 1}번 정답률`));
  const unweighted = rates.reduce((sum, rate) => sum + rate, 0) / rates.length * 100;
  const weighted = rates.reduce((sum, rate, index) => sum + rate * EXPECTED_POINTS[index], 0);
  assert.ok(Math.abs(unweighted - 33.46031746) < 1e-8, `비가중 평균 ${unweighted}`);
  assert.ok(Math.abs(weighted - 32.3780952376) < 1e-9, `가중 평균 ${weighted}`);
  assert.match(analysisSource, /const AVG=32\.4/);

  const rows = extractAnswerRows();
  assert.equal(rows.length, 30);
  rows.forEach((row, index) => {
    const value = row.match(/<span class="v"[^>]*>([\d.]+)%<\/span>/);
    assert.ok(value, `${index + 1}번 표시 정답률`);
    assert.equal(value[1], (EXPECTED_RATES[index] * 100).toFixed(1), `${index + 1}번 표시 반올림`);
  });
  assert.doesNotMatch(rows[23], /warn|재산출 대기|검수 중/);
  assert.match(rows[23], />0\.0%<\/span>/);
  assert.match(rows[29], />18\.1%<\/span>[\s\S]*?>어려움<\/span>/);
});

check('전체 영상과 문항별 풀이 30개 시점 일대일 대응', () => {
  assert.match(answerSource, /href="https:\/\/youtu\.be\/T9LbJLG2BRQ"[^>]*>▶ 전체 풀이영상 보기/);
  const times = [...answerSource.matchAll(/class="vlnk" href="https:\/\/youtu\.be\/T9LbJLG2BRQ\?t=(\d+)"/g)]
    .map((match) => Number(match[1]));
  assert.deepEqual(times, EXPECTED_TIMES);
  assert.equal(times.length, 30);
});

check('최종 1회 이원 목적 분류표 30행 원본 대조', () => {
  const rows = extractAnswerRows();
  const types = rows.map((row) => (row.match(/<td class="type">([\s\S]*?)<\/td>/) || [])[1]);
  const areas = rows.map((row) => (row.match(/<td class="area"><b[^>]*>([^<]+)<\/b>/) || [])[1]
    .replace('수·규칙찾기', '수,규칙찾기'));
  const points = rows.map((row) => Number((row.match(/<span class="pts">([\d.]+)점<\/span>/) || [])[1]));
  assert.deepEqual(types, EXPECTED_TYPES);
  assert.deepEqual(areas, EXPECTED_AREAS);
  assert.deepEqual(points, EXPECTED_POINTS);
  assert.match(answerSource, /id="classificationSection"/);
  assert.match(answerSource, /id="classificationTable"/);
  assert.match(answerSource, /id="classificationRows"/);
  assert.match(answerSource, /문항번호<\/th><th>내용\(단원\)<\/th><th>문항 유형<\/th><th>점수<\/th>/);
  assert.match(answerSource, /replace\('수·규칙찾기','수,규칙찾기'\)/);
});

check('최종 1회 점수별 석차 백분율과 공통 등급 기준', () => {
  const analysisTable = extractConstArray(analysisSource, 'TB');
  const resultTable = extractConstArray(resultSource, 'TB');
  assert.deepEqual(analysisTable, EXPECTED_TB);
  assert.deepEqual(resultTable, EXPECTED_TB);
  assert.equal(analysisTable.length, 85);
  for (let index = 1; index < analysisTable.length; index += 1) {
    assert.ok(analysisTable[index - 1][0] > analysisTable[index][0], `점수 내림차순 ${index}`);
    assert.ok(analysisTable[index - 1][1] <= analysisTable[index][1], `백분율 비감소 ${index}`);
  }
  assert.match(analysisSource, /function gradeForScore\(s\)/);
  assert.match(resultSource, /function gradeForScore\(score\)/);
  assert.match(resultSource, /const AVG=32\.4/);
  assert.doesNotMatch(`${analysisSource}\n${resultSource}`, /\[76\.7,0\.8|\[0,87\.5/);
  const percentileAt = (score) => EXPECTED_TB.find((row) => score >= row[0])[1];
  assert.equal(percentileAt(76.7), 0.9);
  assert.equal(percentileAt(54.2), 13.6);
  assert.equal(percentileAt(54.1), 14.5);
  assert.equal(percentileAt(0), 95.5);
  assert.match(answerSource, /상위 0\.9% ~ 13\.6%/);
  assert.match(answerSource, /상위 83\.6% ~ 95\.5%/);
});

check('통합 백분율은 파이널 최초 응시부터 최종 1회까지 평균', () => {
  assert.deepEqual(extractConstArray(analysisSource, 'CUM'), EXPECTED_CUM);
  assert.deepEqual(extractConstArray(resultSource, 'CUM'), EXPECTED_CUM);
  assert.match(analysisSource, /\^final\(\[1-4\]\)\$/);
  assert.match(analysisSource, /row\.source!=='reset'/);
  assert.match(analysisSource, /finalRoundPercentile\(k,Number\(row\.score\)\)/);
  assert.match(analysisSource, /const allP=\[\.\.\.fps, pct\]/);
  assert.match(resultSource, /r\.round==='final'\+roundNo&&r\.source!=='reset'/);
  assert.match(resultSource, /entries\.push\(\{label:'최종 1회',pct:currentPct\}\)/);
  assert.match(resultSource, /entries\.reduce\(\(sum,item\)=>sum\+item\.pct,0\)\/entries\.length/);
  assert.match(answerSource, /각 회차 최초 응시의 상위 백분율을 평균/);
  assert.match(answerSource, /누적 백분율 19\.1% 이하/);
  assert.match(answerSource, /누적 백분율 76\.5% 이상/);
  const cumulativeAt = (percentile) => EXPECTED_CUM.find((row) => percentile <= row[0])[1];
  assert.equal(cumulativeAt(19.1), '경시 가능');
  assert.equal(cumulativeAt(19.2), '경시컷,심화안정권');
  assert.equal(cumulativeAt(46.2), '심화컷,실력안정권');
  assert.equal(cumulativeAt(46.3), '실력컷,일품안정권');
  assert.equal(cumulativeAt(76.4), '일품컷');
  assert.equal(cumulativeAt(76.5), '노력요함');
  assert.doesNotMatch(`${finalSource}\n${analysisSource}\n${resultSource}`, /cumulativeRank|rankBadge|rankNoteHTML|명 중/);
});

if (failures.length) {
  console.error(`FAIL ${failures.length}/${passes.length + failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure.name}: ${failure.error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`PASS ${passes.length}/${passes.length}`);
  for (const name of passes) console.log(`- ${name}`);
  console.log('- Q24: 243개 수의 모든 자릿수 합 = 2862');
  console.log('- Q27: 승인 조건 포함 시 유일해 1개');
  console.log('- Q29: 625개 전수검사 중 정확히 두 숫자인 비밀번호 140개');
  console.log('- Q20/Q12/Q30: 2 / 15 / 3201');
}
