'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data.js');
const ENHANCEMENTS_FILE = path.join(ROOT, 'index-enhancements.js');
const FINAL_DATA_FILE = path.join(ROOT, 'mock-data-final.js');
const ORIGINAL_DATA_FILE = path.join(ROOT, 'mock-data-original.js');
const FINAL_PAGE_FILE = path.join(ROOT, 'final.html');
const INDEX_FILE = path.join(ROOT, 'index.html');

const FINAL_PAGE_COUNTS = [8, 6, 7, 6];
const FINAL_COPYRIGHT_MISSING = [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], [], [1, 2, 3, 4, 5]];
const LAST_PAGE_COUNTS = [6, 6, 6, 6];
const LAST_VIDEOS = [
  'https://youtu.be/T9LbJLG2BRQ',
  'https://youtu.be/YiKvaYUlIp4',
  'https://youtu.be/M4EHgd42ReU',
  'https://youtu.be/ZiOpTckV_wM',
];
const ORIGINAL_FORM_BOOKS = [
  {
    round: 1,
    title: '초등선발 대비 시그니처 실전 모의고사 1회',
    imageDir: 'original_form_1',
    pdf: 'output/pdf/hwangso-original-form-mock-01-rebuilt.pdf',
    answer: 'output/pdf/hwangso-original-form-mock-01-rebuilt-answer.pdf',
  },
  {
    round: 2,
    title: '초등선발 대비 시그니처 실전 모의고사 2회',
    imageDir: 'original_form_2_v2',
    pdf: 'output/pdf/hwangso-original-form-mock-02-rebuilt.pdf',
    answer: 'output/pdf/hwangso-original-form-mock-02-rebuilt-answer.pdf',
  },
];
const ONLINE_STUDENT = '검수온라인';
const ONSITE_STUDENT = '검수재원';

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

function hostValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function libraryEnhancementSource() {
  const source = fs.readFileSync(ENHANCEMENTS_FILE, 'utf8');
  const uiMarker = "const style=document.createElement('style');";
  const markerIndex = source.indexOf(uiMarker);
  assert.notEqual(markerIndex, -1, '서재 링크 보정 뒤의 UI 확장 블록을 찾을 수 없음');
  const uiBlockStart = source.lastIndexOf('(function(){', markerIndex);
  assert.notEqual(uiBlockStart, -1, 'UI 확장 IIFE 시작을 찾을 수 없음');
  return source.slice(0, uiBlockStart);
}

function configuredData(student) {
  const sandbox = {
    currentStudent: student,
    setTimeout() { return 0; },
    clearTimeout() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA_FILE, 'utf8'), sandbox, {
    filename: 'data.js',
    timeout: 2000,
  });
  sandbox.GFIELD_DATA.studentTypes = sandbox.GFIELD_DATA.studentTypes || {};
  sandbox.GFIELD_DATA.studentTypes[student] = student === ONLINE_STUDENT ? 'online' : 'onsite';
  vm.runInContext(libraryEnhancementSource(), sandbox, {
    filename: 'index-enhancements.library.js',
    timeout: 2000,
  });
  return hostValue(sandbox.GFIELD_DATA);
}

function finalMockData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(FINAL_DATA_FILE, 'utf8'), sandbox, {
    filename: 'mock-data-final.js',
    timeout: 2000,
  });
  return hostValue(sandbox.window.GFIELD_MOCK_FINAL);
}

function bookFor(data, folder, round) {
  const pattern = new RegExp(`${folder.replace(' 모의고사', '')}(?:\\s*실전)?\\s*모의고사\\s*${round}\\s*회`);
  const matches = (data.books || []).filter((book) => (
    book && book.folder === folder && pattern.test(String(book.title || ''))
  ));
  assert.equal(matches.length, 1, `${folder} ${round}회 책은 정확히 하나여야 함`);
  return matches[0];
}

function linkFor(book, label) {
  const matches = (book.links || []).filter((link) => link && link.label === label);
  assert.equal(matches.length, 1, `${book.title}: '${label}' 링크는 정확히 하나여야 함`);
  assert.equal(typeof matches[0].url, 'string', `${book.title}: '${label}' URL 누락`);
  assert.ok(matches[0].url.trim(), `${book.title}: '${label}' URL이 비어 있음`);
  return matches[0];
}

function originalMockData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(ORIGINAL_DATA_FILE, 'utf8'), sandbox, {
    filename: 'mock-data-original.js',
    timeout: 2000,
  });
  return hostValue(sandbox.window.GFIELD_MOCK_ORIGINAL);
}

function assertNoLink(book, label) {
  const matches = (book.links || []).filter((link) => link && link.label === label);
  assert.equal(matches.length, 0, `${book.title}: 중복 '${label}' 링크가 없어야 함`);
}

function assertRoute(link, pathname, params, description) {
  const url = new URL(link.url, 'https://hs.gfieldacademy.net/');
  assert.equal(url.pathname, pathname, `${description} 경로`);
  for (const [key, expected] of Object.entries(params)) {
    assert.equal(url.searchParams.get(key), String(expected), `${description} ${key}`);
  }
}

function assertImageSet(imageDir, pageCount) {
  const directory = path.join(ROOT, 'materials', imageDir);
  assert.equal(fs.existsSync(directory), true, `${imageDir} 폴더 누락`);
  const actual = fs.readdirSync(directory)
    .filter((name) => /^\d{3}\.jpg$/i.test(name))
    .sort();
  const expected = Array.from(
    { length: pageCount },
    (_, index) => `${String(index + 1).padStart(3, '0')}.jpg`,
  );
  assert.deepEqual(actual, expected, `${imageDir} JPG 페이지 목록`);
  actual.forEach((name) => {
    assert.ok(fs.statSync(path.join(directory, name)).size > 0, `${imageDir}/${name} 빈 파일`);
  });
}

function assertFinalLibraryBooks(data) {
  FINAL_PAGE_COUNTS.forEach((pageCount, index) => {
    const round = index + 1;
    const book = bookFor(data, '파이널 모의고사', round);
    assert.equal(book.imgdir, `final_${round}`, `파이널 ${round}회 imgdir`);
    assert.equal(book.pages, pageCount, `파이널 ${round}회 pages`);
    assert.deepEqual(book.copyrightMissingPages, FINAL_COPYRIGHT_MISSING[index], `파이널 ${round}회 저작권 꼬리말 보정 쪽`);

    assertNoLink(book, '시험지 보기·인쇄');
    assertRoute(
      linkFor(book, '실전 타이머'),
      '/final.html',
      { round, go: 'timer' },
      `파이널 ${round}회 타이머`,
    );
    assertRoute(
      linkFor(book, '오답 입력·진단'),
      '/final.html',
      { round, go: 'answer' },
      `파이널 ${round}회 오답 진단`,
    );
    assertRoute(
      linkFor(book, '답안·교재 연결표'),
      '/answer.html',
      { set: 'final', round },
      `파이널 ${round}회 답안`,
    );
  });
}

function assertLastLibraryBooks(data, online) {
  LAST_PAGE_COUNTS.forEach((pageCount, index) => {
    const round = index + 1;
    const book = bookFor(data, '최종 모의고사', round);
    assert.equal(book.imgdir, `last_final_${round}`, `최종 ${round}회 imgdir`);
    assert.equal(book.pages, pageCount, `최종 ${round}회 pages`);
    assert.equal(book.video, LAST_VIDEOS[index], `최종 ${round}회 전체 풀이 영상`);

    assertNoLink(book, '시험지 보기·인쇄');
    assertRoute(
      linkFor(book, '실전 타이머'),
      '/final.html',
      { set: 'last', round, go: 'timer' },
      `최종 ${round}회 타이머`,
    );
    assertRoute(
      linkFor(book, '답안·해설'),
      '/final.html',
      { set: 'last', round, go: 'answer' },
      `최종 ${round}회 답안`,
    );
    assertRoute(
      linkFor(book, '성적 확인·진단'),
      '/last1-result.html',
      { round },
      `최종 ${round}회 성적 확인`,
    );

    const entryLinks = (book.links || []).filter((link) => link && link.label === '성적 입력');
    assert.equal(entryLinks.length, online ? 1 : 0, `최종 ${round}회 성적 입력 링크 노출`);
    if (online) {
      assertRoute(
        entryLinks[0],
        '/last1-entry.html',
        { round },
        `최종 ${round}회 성적 입력`,
      );
    }
  });
}

function assertOriginalFormBooks(data) {
  ORIGINAL_FORM_BOOKS.forEach((expected) => {
    const matches = (data.books || []).filter((book) => (
      book && book.folder === '추가 모의고사' && book.title === expected.title
    ));
    assert.equal(matches.length, 1, `${expected.title} 책은 정확히 하나여야 함`);
    const book = matches[0];
    assert.equal(book.imgdir, expected.imageDir, `${expected.title} imgdir`);
    assert.equal(book.pages, 6, `${expected.title} pages`);
    assert.equal(book.pdf, expected.pdf, `${expected.title} 원본 PDF`);
    assert.equal(book.desc, '80분 · 30문항 · 100점', `${expected.title} 시험 정보`);
    const answer = linkFor(book, '정답지 PDF');
    assert.equal(answer.url, expected.answer, `${expected.title} 정답 PDF`);
    assertRoute(
      linkFor(book, '성적·약점 진단'),
      '/final.html',
      { set: 'original', round: String(expected.round), go: 'answer' },
      `${expected.title} 성적·약점 진단`,
    );
    assertImageSet(expected.imageDir, 6);
    assert.equal(fs.existsSync(path.join(ROOT, expected.pdf)), true, `${expected.title} 원본 PDF 파일`);
    assert.equal(fs.existsSync(path.join(ROOT, expected.answer)), true, `${expected.title} 정답 PDF 파일`);
  });
}

check('파이널 1~4회 서재 JPG 메타데이터와 중복 없는 세 링크', () => {
  assertFinalLibraryBooks(configuredData(ONSITE_STUDENT));
});

check('최종 1~4회 일반 회원 서재 링크', () => {
  assertLastLibraryBooks(configuredData(ONSITE_STUDENT), false);
});

check('최종 1~4회 온라인 회원 성적 입력 링크', () => {
  assertLastLibraryBooks(configuredData(ONLINE_STUDENT), true);
});

check('추가 모의고사 원본형 1·2회 이미지·PDF·정답 연결', () => {
  assertOriginalFormBooks(configuredData(ONSITE_STUDENT));
});

check('Thinking Core 강의 버튼 통합과 종료 후 자동 연결', () => {
  const data = configuredData(ONSITE_STUDENT);
  const books = (data.books || []).filter((book) => book && book.accessKey === 'concept-core');
  assert.equal(books.length, 1, 'Thinking Core 교재는 정확히 하나여야 함');
  assert.equal(books[0].pages, 96, 'Thinking Core 영상 순서 수정본 쪽수');
  assert.equal(books[0].pdf, 'output/pdf/thinking-core-revised-96p.pdf', 'Thinking Core 영상 순서 수정 PDF 연결');
  assertImageSet('tb_mrhqq399', 96);
  const labels = (books[0].links || []).map((link) => link && link.label);
  assert.equal(labels.filter((label) => label === 'CH2 학습영상').length, 1, 'CH2 학습영상 통합 버튼');
  assert.equal(labels.filter((label) => label === 'CH2 Semi 2회').length, 1, 'CH2 Semi 2회 통합 버튼');
  assert.equal(labels.includes('CH2 학습영상 2'), false, 'CH2 학습영상 2 별도 버튼 제거');
  assert.equal(labels.includes('CH2 Semi 2회 14·15·16번'), false, 'CH2 Semi 14·15·16 별도 버튼 제거');

  const source = fs.readFileSync(ENHANCEMENTS_FILE, 'utf8');
  assert.match(source, /'TxEkE7zNu8I':\s*\{\s*onEnd:true,\s*next:'jYu8jXkawrA'/, 'CH2 학습영상 1 종료 후 2 연결');
  assert.match(source, /'W6GnRtzez24':\s*\{\s*onEnd:true,\s*next:'AT5xxcA0DSU'/, 'CH2 Semi 1~13 종료 후 14~16 연결');
  assert.match(source, /'Ou3ng5mFmuo':\s*\{\s*onEnd:true,\s*next:'vLCFnRx7TiU',\s*start:521\s*\}/, 'CH5 학습영상 종료 후 지정 영상 8분 41초부터 연결');
  assert.match(source, /event\.data!==YT\.PlayerState\.ENDED/, 'YouTube 실제 종료 상태 감지');
});

check('원본형 진단 데이터와 서재 이미지 경로 일치', () => {
  const model = originalMockData();
  assert.equal(model.roundCount, 2);
  assert.equal(model.exam.minutes, 80);
  assert.equal(Object.values(model.rounds).reduce((sum, round) => sum + round.items.length, 0), 60);
  ORIGINAL_FORM_BOOKS.forEach((expected) => {
    const round = model.rounds[String(expected.round)];
    assert.equal(round.paper.imageDir, expected.imageDir);
    assert.equal(round.paper.imagePages, 6);
    assert.equal(round.items.length, 30);
    assert.equal(round.items.reduce((sum, item) => sum + item.pts, 0).toFixed(1), '100.0');
    assert.deepEqual(round.paper.pageRanges, [[1,6],[7,12],[13,18],[19,24],[25,28],[29,30]]);
  });
});

check('파이널·최종 JPG 자산이 메타데이터와 일치', () => {
  FINAL_PAGE_COUNTS.forEach((pageCount, index) => assertImageSet(`final_${index + 1}`, pageCount));
  LAST_PAGE_COUNTS.forEach((pageCount, index) => assertImageSet(`last_final_${index + 1}`, pageCount));
});

check('mock-data-final.js 파이널 1~4회 paper 이미지 메타데이터', () => {
  const model = finalMockData();
  assert.ok(model && model.rounds, 'GFIELD_MOCK_FINAL.rounds 누락');
  FINAL_PAGE_COUNTS.forEach((pageCount, index) => {
    const roundNo = String(index + 1);
    const round = model.rounds[roundNo];
    assert.ok(round, `파이널 ${roundNo}회 데이터 누락`);
    assert.ok(round.paper, `파이널 ${roundNo}회 paper 누락`);
    assert.equal(round.paper.imageDir, `final_${roundNo}`, `파이널 ${roundNo}회 paper.imageDir`);
    assert.equal(round.paper.imagePages, pageCount, `파이널 ${roundNo}회 paper.imagePages`);
    assert.deepEqual(round.paper.copyrightMissingPages, FINAL_COPYRIGHT_MISSING[index], `파이널 ${roundNo}회 paper 꼬리말 보정 쪽`);
  });
});

check('final.html 시작 화면은 파이널 paper 데이터가 있으면 시험지 버튼 노출', () => {
  const source = fs.readFileSync(FINAL_PAGE_FILE, 'utf8');
  const start = source.indexOf('function renderStart(){');
  const end = source.indexOf('function openAnswerPage(){', start);
  assert.notEqual(start, -1, 'renderStart 함수를 찾을 수 없음');
  assert.notEqual(end, -1, 'renderStart 함수 끝을 찾을 수 없음');
  const renderStart = source.slice(start, end);

  assert.match(renderStart, /\bR\.paper\b/, 'renderStart가 현재 회차 paper 존재 여부를 확인해야 함');
  assert.match(renderStart, /id=["']btnPaper["']/, '시험지 보기·인쇄 버튼 누락');
  assert.match(
    renderStart,
    /getElementById\(['"]btnPaper['"]\)\.onclick\s*=\s*renderPaper/,
    '시험지 버튼이 renderPaper에 연결되지 않음',
  );
  assert.match(source, /if\s*\(goParam===['"]paper['"]\)\s*\{\s*renderPaper\(\)/, 'go=paper 직접 진입 누락');
  assert.match(source, /paper-time-correction/, '첫 쪽 시험 시간 인쇄 보정 누락');
  assert.match(source, /Number\(M\.exam\.minutes\|\|90\)\+'분<\/div>'/, '시험 시간 보정이 현재 시험 설정을 사용하지 않음');
  assert.match(source, /시험 시간은 '\+Number\(M\.exam\.minutes\|\|90\)\+'분입니다\./, '정정 안내 시험 시간이 현재 시험 설정을 사용하지 않음');
  assert.match(source, /paper-image-watermark/, '이미지 시험지 워터마크 누락');
  assert.match(source, /\.paper-image-page\{[^}]*margin:0 auto;[^}]*padding:0;[^}]*border:0;/, '시험지 화면 가운데 정렬·여백 초기화 누락');
  assert.match(source, /\.paper-stack\{display:block;width:210mm;margin:0 auto\}/, '인쇄용 A4 스택 가운데 정렬 누락');
});

check('모든 영상 교재 뷰어는 화면 한 줄·인쇄 세 줄 워터마크', () => {
  const source = fs.readFileSync(INDEX_FILE, 'utf8');
  assert.match(source, /function wmLines\(\)[\s\S]*?<span>\$\{t\}<\/span><span>\$\{t\}<\/span><span>\$\{t\}<\/span>/, 'PDF 교재 워터마크 세 줄 구성 누락');
  assert.match(source, /\.bv-wm span:nth-child\(2\)\{top:50%;opacity:\.075\}/, 'PDF 교재 화면 한 줄 워터마크 누락');
  assert.match(source, /@media print\{ \.bv-doc\.scroll \.wm3 span,\.bv-wm span\{opacity:\.12!important\}/, '교재 인쇄 세 줄 워터마크 누락');
  assert.match(source, /\[0\.22,0\.49,0\.76\]\.forEach\(ratio=>p\.drawImage\(stampImage,/, 'PDF 저장 시 세 줄 워터마크 위치 누락');
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
}
