const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);

function loadIfPresent(name) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) return false;
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: name });
  return true;
}

loadIfPresent('mock-data-last.js');
loadIfPresent('mock-data-last3.js');
loadIfPresent('mock-data-last4.js');
loadIfPresent('last-exam-svg.js');
loadIfPresent('last-exam-svg3.js');
loadIfPresent('last-exam-svg4.js');

const model = context.window.GFIELD_MOCK_LAST;
const figures = context.window.GFIELD_LAST_FIGURES;
let passed = 0;

function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}

function pageNumbers(page) {
  return [...(page.left || []), ...(page.right || []), ...(page.full || [])];
}

function inspectRound(no) {
  const round = model.rounds[no];
  assert.ok(round, `round ${no} missing`);
  assert.ok(round.paper, `round ${no} paper missing`);
  assert.equal(round.paper.imageDir, `last_final_${no}`, `round ${no} image directory`);
  assert.equal(round.paper.imagePages, 6, `round ${no} image page count`);
  const imageRoot = path.join(ROOT, 'materials', round.paper.imageDir);
  const pageImages = fs.readdirSync(imageRoot).filter(name => /^\d{3}\.jpg$/i.test(name)).sort();
  assert.deepEqual(pageImages, Array.from({ length: 6 }, (_, index) => `${String(index + 1).padStart(3, '0')}.jpg`));
  pageImages.forEach(name => assert.ok(fs.statSync(path.join(imageRoot, name)).size > 50000, `round ${no} ${name} is too small`));
  const questions = round.paper.questions;
  assert.equal(questions.length, 30, `round ${no} question count`);
  assert.deepEqual(Array.from(questions, item => item.no), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(Math.round(questions.reduce((sum, item) => sum + item.pts, 0) * 10) / 10, 100);
  assert.equal(round.paper.pages.length, 6, `round ${no} page count`);
  assert.deepEqual(
    Array.from(round.paper.pages.flatMap(pageNumbers)).sort((a, b) => a - b),
    Array.from({ length: 30 }, (_, index) => index + 1),
    `round ${no} page map`,
  );

  const figureKeys = [];
  questions.forEach(question => {
    for (const forbidden of ['answer', 'answers', 'solution', 'solutions', 'correct', 'correctAnswer']) {
      assert.equal(Object.hasOwn(question, forbidden), false, `round ${no} q${question.no} ${forbidden}`);
    }
    assert.doesNotMatch(String(question.body || ''), /<\/?(?:script|iframe|object|embed)\b|\son\w+\s*=|\.pdf(?:[?#]|$)/i);
    if (question.figure) figureKeys.push(question.figure);
  });
  assert.equal(new Set(figureKeys).size, figureKeys.length, `round ${no} duplicate figure keys`);

  const corrections = Array.from(round.paper.corrections || []);
  corrections.forEach(item => {
    assert.ok(Number.isInteger(item.qno) && item.qno >= 1 && item.qno <= 30, `round ${no} correction qno`);
    assert.equal(typeof item.text, 'string', `round ${no} correction text`);
    assert.ok(item.text.trim().length > 0, `round ${no} empty correction`);
    for (const forbidden of ['answer', 'answers', 'solution', 'solutions', 'correct', 'correctAnswer']) {
      assert.equal(Object.hasOwn(item, forbidden), false, `round ${no} correction ${item.qno} ${forbidden}`);
    }
  });
  assert.equal(new Set(corrections.map(item => item.qno)).size, corrections.length, `round ${no} duplicate corrections`);

  figureKeys.forEach(key => {
    assert.equal(typeof figures[key], 'function', `round ${no} renderer ${key}`);
    const markup = figures[key]();
    assert.equal(typeof markup, 'string');
    assert.ok(markup.trim().length > 0, `round ${no} empty renderer ${key}`);
    assert.doesNotMatch(markup, /<\/?script\b|\son\w+\s*=|\.pdf(?:[?#]|$)/i);
    for (const match of markup.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
      const relative = match[1].split(/[?#]/, 1)[0].replaceAll('/', path.sep);
      assert.equal(fs.existsSync(path.join(ROOT, relative)), true, `round ${no} missing asset ${match[1]}`);
    }
  });

  if (round.ready === true) assert.deepEqual(Array.from(round.lockedQuestions || []), [], `round ${no} ready with locks`);
  if ((round.lockedQuestions || []).length) assert.notEqual(round.ready, true, `round ${no} locked but ready`);
  return { figureKeys, corrections };
}

check('최종 시험지는 공통 90분 JPG 뷰어이며 PDF 뷰어를 사용하지 않음', () => {
  assert.equal(model.exam.minutes, 90);
  const finalPage = fs.readFileSync(path.join(ROOT, 'final.html'), 'utf8');
  assert.match(finalPage, /\^\[1-4\]\$/);
  assert.match(finalPage, /회차를 확인해 주세요/);
  assert.doesNotMatch(finalPage, /parseInt\(params\.get\('round'/);
  const sources = ['mock-data-last.js', 'last-exam-svg.js', 'final.html']
    .concat(['mock-data-last3.js', 'mock-data-last4.js', 'last-exam-svg3.js', 'last-exam-svg4.js'].filter(name => fs.existsSync(path.join(ROOT, name))))
    .map(name => fs.readFileSync(path.join(ROOT, name), 'utf8'))
    .join('\n');
  assert.doesNotMatch(sources, /\.pdf(?:[?#'"\s]|$)|application\/pdf|pdfjs|pdf\.js/i);
  assert.match(finalPage, /paper-image-page/);
  assert.match(finalPage, /paperCorrectionsHTML/);
  assert.match(finalPage, /var paperHTML=correctionHTML\+\(\(R\.paper\.imageDir/);
  assert.match(finalPage, /\.paper-correction-page\{width:210mm;height:297mm/);
});

check('최종 1회 시험지 구조', () => inspectRound('1'));

check('최종 2회 시험지 구조·그림 자산', () => {
  const result = inspectRound('2');
  assert.equal(model.rounds['2'].ready, true);
  assert.equal(result.figureKeys.length, 15);
  const assets = fs.readdirSync(path.join(ROOT, 'mock-assets', 'last2')).filter(name => /\.png$/i.test(name));
  assert.equal(assets.length, 15);
});

check('최종 3회 정정 안내 공개·그림 자산', () => {
  const result = inspectRound('3');
  assert.equal(model.rounds['3'].ready, true);
  assert.deepEqual(Array.from(model.rounds['3'].lockedQuestions), []);
  assert.deepEqual(result.corrections.map(item => item.qno), [8, 11]);
  assert.match(result.corrections[0].text, /다다음 날 아침/);
  assert.match(result.corrections[1].text, /영양제의 수는 같았습니다/);
  assert.equal(result.figureKeys.length, 9);
  const assets = fs.readdirSync(path.join(ROOT, 'mock-assets', 'last3')).filter(name => /^q\d{2}-.*\.png$/i.test(name));
  assert.equal(assets.length, 7);
});

check('최종 4회 정정 안내 공개·그림 자산', () => {
  const result = inspectRound('4');
  assert.equal(model.rounds['4'].ready, true);
  assert.deepEqual(Array.from(model.rounds['4'].lockedQuestions), []);
  assert.deepEqual(result.corrections.map(item => item.qno), [19]);
  assert.equal(result.corrections[0].text, '㉠은 ㉤보다 큽니다.');
  assert.equal(result.figureKeys.length, 21);
  const assets = fs.readdirSync(path.join(ROOT, 'mock-assets', 'last4')).filter(name => /^q\d{2}-.*\.png$/i.test(name));
  assert.equal(assets.length, 21);
});

console.log(`\n${passed} checks passed`);
