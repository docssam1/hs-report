'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data.js');
const ENHANCEMENTS_FILE = path.join(ROOT, 'index-enhancements.js');
const FINAL_DATA_FILE = path.join(ROOT, 'mock-data-final.js');
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

check('파이널 1~4회 서재 JPG 메타데이터와 중복 없는 세 링크', () => {
  assertFinalLibraryBooks(configuredData(ONSITE_STUDENT));
});

check('최종 1~4회 일반 회원 서재 링크', () => {
  assertLastLibraryBooks(configuredData(ONSITE_STUDENT), false);
});

check('최종 1~4회 온라인 회원 성적 입력 링크', () => {
  assertLastLibraryBooks(configuredData(ONLINE_STUDENT), true);
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
  assert.match(source, /paper-time-correction/, '첫 쪽 90분 인쇄 보정 누락');
  assert.match(source, /Number\(M\.exam\.minutes\|\|90\)\+'분<\/div>'/, '시험 시간 보정이 공용 90분 설정을 사용하지 않음');
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
