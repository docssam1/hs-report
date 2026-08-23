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
const M = sandbox.window.GFIELD_MOCK_LAST;
const FIGURES = sandbox.window.GFIELD_LAST_FIGURES;

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

    // 문제의 여섯 문장에서 직접 따라오는 서로 다른 사람 조건입니다.
    // "감독과 이발사"가 반드시 서로 다른 사람이라는 추가 조건은 넣지 않습니다.
    if (holder['약사'] === holder['가수']) continue;
    if (holder['감독'] === '갑' || holder['이발사'] === '갑') continue;
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

check('27·29번 review 잠금과 회차 비공개 상태', () => {
  assert.equal(question(round, 27).status, 'review');
  assert.equal(question(round, 27).reviewReason, '원문 조건만으로 두 답이 성립합니다.');
  assert.equal(question(round, 29).status, 'review');
  assert.equal(question(round, 29).reviewReason, '원문의 예시 8878이 사용 숫자 1~5 조건과 모순됩니다.');
  assert.match(question(round, 29).body, /8878/);
  assert.equal(round.ready, false);
  assert.deepEqual(hostArray(round.lockedQuestions), [27, 29]);
  assert.equal(round.reviewNote[27], question(round, 27).reviewReason);
  assert.equal(round.reviewNote[29], question(round, 29).reviewReason);
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

check('27번 조건 전수열거 결과가 정확히 두 해', () => {
  const solutions = enumerateQuestion27();
  assert.equal(solutions.length, 2);
  const signatures = solutions.map((solution) =>
    ['갑', '을', '병'].map((person) => `${person}:${solution[person].join('+')}`).join('|')
  ).sort();
  assert.deepEqual(signatures, [
    '갑:가수+주방장|을:배우+약사|병:감독+이발사',
    '갑:가수+주방장|을:감독+배우|병:약사+이발사'
  ].sort());
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

check('답안 정정과 교사 공개 이중 잠금', () => {
  assert.match(answerSource, /24번 정답은 2862/);
  assert.doesNotMatch(answerSource, /2950/);
  assert.match(answerSource, /27번은 원문 조건에서 답이 2개/);
  assert.match(answerSource, /29번은 원문 예시 8878/);
  assert.match(answerSource, /27·29번은 원문 교정 승인 전 정답 판정과 학생 성적 공개를 보류/);
  assert.doesNotMatch(answerSource, /채점 제외/);
  assert.match(answerSource, /id="answerLock"/);
  assert.match(answerSource, /id="answerSheet"/);
  assert.match(answerSource, /var preview=params\.get\('preview'\)==='1'&&local/);
  assert.match(answerSource, /var ready=!!\(round&&round\.ready===true\)/);
  assert.match(answerSource, /문항 통계 재산출 대기/);
  assert.match(answerSource, /평균 점수 재검토 중/);
  assert.doesNotMatch(answerSource, /평균 정답률 33\.1%|실제 평균 28\.1점|완전순열|2⁴|140가지|갑=가수/);
  assert.match(analysisSource, /const VALIDATION_LOCK=Object\.freeze\(\{/);
  assert.match(analysisSource, /24번 정답률 재산출 대기/);
  assert.match(analysisSource, /27번 조건·정답 확정 대기/);
  assert.match(analysisSource, /29번 원문 예시 오류 교정 승인 대기/);
  assert.match(analysisSource, /publishBtn\.disabled=VALIDATION_LOCK\.active/);
  assert.match(analysisSource, /id="analysisBtn"[^>]*disabled/);
  const renderStart = analysisSource.indexOf('function render()');
  const renderGuard = analysisSource.indexOf('if(VALIDATION_LOCK.active)', renderStart);
  const scoreStart = analysisSource.indexOf('let score=0', renderStart);
  assert.ok(renderStart >= 0 && renderGuard > renderStart && scoreStart > renderGuard, '분석 함수 guard가 점수 산출보다 먼저여야 함');
  const publishStart = analysisSource.indexOf('async function publish()');
  const guard = analysisSource.indexOf('if(VALIDATION_LOCK.active)', publishStart);
  const fetchCall = analysisSource.indexOf('fetch(', publishStart);
  assert.ok(publishStart >= 0 && guard > publishStart && fetchCall > guard, '공개 함수 guard가 fetch보다 먼저여야 함');
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
  console.log('- Q27: 주어진 문장만 적용하면 해 2개 → review 잠금 유지');
  console.log('- Q20/Q12/Q30: 2 / 15 / 3201');
}
