const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');

const original = {
  cols: 10,
  rows: 8,
  direction: 'N',
  vertical: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,1],[1,5],[1,7],[2,4],[2,6],[3,1],[3,2],[3,3],[4,1],[4,5],[4,6],[5,2],[5,4],[5,5],[5,7],[6,3],[6,6],[7,1],[7,2],[8,1],[8,3],[8,4],[8,5],[8,6],[9,1],[9,2],[9,4],[9,5],[9,6],[10,0],[10,1],[10,2],[10,3],[10,4],[10,5],[10,6],[10,7]],
  horizontal: [[0,0],[0,4],[0,8],[1,0],[1,1],[1,2],[1,3],[1,4],[1,6],[1,8],[2,0],[2,1],[2,2],[2,3],[2,5],[2,6],[2,7],[2,8],[3,0],[3,2],[3,4],[3,7],[3,8],[4,0],[4,1],[4,3],[4,4],[4,6],[5,0],[5,1],[5,2],[5,4],[5,6],[5,8],[6,0],[6,2],[6,4],[6,5],[6,6],[6,8],[7,0],[7,3],[7,5],[7,6],[7,7],[7,8],[8,0],[8,1],[8,3],[8,5],[8,7],[8,8],[9,7],[9,8]],
  signature: [1,1,1,0,1,1,1],
};

const similar = {
  cols: 8,
  rows: 8,
  direction: 'E',
  vertical: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,0],[1,3],[2,2],[2,3],[2,5],[2,6],[3,1],[3,2],[3,3],[3,4],[3,7],[4,1],[4,2],[4,5],[5,2],[5,4],[6,1],[6,2],[6,3],[6,4],[6,6],[7,3],[7,4],[7,5],[7,7],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7]],
  horizontal: [[0,0],[0,2],[0,6],[0,8],[1,0],[1,1],[1,2],[1,4],[1,5],[1,7],[1,8],[2,0],[2,1],[2,5],[2,6],[2,8],[3,0],[3,4],[3,6],[3,7],[3,8],[4,0],[4,1],[4,3],[4,4],[4,6],[4,7],[4,8],[5,0],[5,1],[5,6],[5,8],[6,0],[6,1],[6,3],[6,6],[6,8],[7,0],[7,2],[7,8]],
  signature: [1,0,1,1,0,0,1],
};

function key(a, b) { return `${a},${b}`; }

function state(config, col, row) {
  const vertical = new Set(config.vertical.map(([a, b]) => key(a, b)));
  const horizontal = new Set(config.horizontal.map(([a, b]) => key(a, b)));
  if (config.direction === 'N') {
    return {
      left: vertical.has(key(col, row)),
      right: vertical.has(key(col + 1, row)),
      front: horizontal.has(key(col, row + 1)),
      next: [col, row + 1],
    };
  }
  if (config.direction === 'E') {
    return {
      left: horizontal.has(key(col, row + 1)),
      right: horizontal.has(key(col, row)),
      front: vertical.has(key(col + 1, row)),
      next: [col + 1, row],
    };
  }
  throw new Error(`Unsupported direction: ${config.direction}`);
}

function signatureAt(config, startCol, startRow) {
  let col = startCol;
  let row = startRow;
  const bits = [];
  for (let depth = 0; depth < 3; depth += 1) {
    if (col < 0 || col >= config.cols || row < 0 || row >= config.rows) return null;
    const current = state(config, col, row);
    bits.push(Number(current.left), Number(current.right));
    if (depth < 2) {
      if (current.front) return null;
      [col, row] = current.next;
    } else {
      bits.push(Number(current.front));
    }
  }
  return { bits, end: [col, row] };
}

function coord([col, row]) { return `${String.fromCharCode(65 + row)}${col + 1}`; }

function matches(config) {
  const found = [];
  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const result = signatureAt(config, col, row);
      if (result && result.bits.join(',') === config.signature.join(',')) {
        found.push({ start: coord([col, row]), answer: coord(result.end) });
      }
    }
  }
  return found;
}

const tests = [];
function check(name, fn) { fn(); tests.push(name); }

check('복원 원문형 통로 패턴은 한 곳뿐', () => assert.deepStrictEqual(matches(original), [{start:'F1', answer:'H1'}]));
check('유사형 통로 패턴은 한 곳뿐', () => assert.deepStrictEqual(matches(similar), [{start:'D4', answer:'D6'}]));
check('복원 원문형은 셋째 칸 앞이 벽', () => assert.strictEqual(original.signature.at(-1), 1));
check('유사형은 셋째 칸 앞이 벽', () => assert.strictEqual(similar.signature.at(-1), 1));

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(repo, 'mock-data-original.js'), 'utf8'), sandbox);
const data = sandbox.window.GFIELD_MOCK_ORIGINAL;
const originalItem = data.rounds['1'].items[27];
const similarItem = data.rounds['2'].items[29];
check('1회 28번 진단 정답 H1', () => assert.strictEqual(originalItem.answer, 'H1'));
check('2회 30번 진단 정답 D6', () => assert.strictEqual(similarItem.answer, 'D6'));
check('두 문항 대영역은 도형', () => assert.deepStrictEqual([originalItem.area, similarItem.area], ['도형', '도형']));
check('두 문항 소영역은 공간지각', () => assert.deepStrictEqual([originalItem.subarea, similarItem.subarea], ['공간지각', '공간지각']));
check('두 문항 세부유형이 같아 반복 약점 진단 가능', () => assert.strictEqual(originalItem.type, similarItem.type));

const restoredHtml = path.resolve(repo, '..', '메뉴얼', '영재성_미로입체_복원문제.html');
if (fs.existsSync(restoredHtml)) {
  const source = fs.readFileSync(restoredHtml, 'utf8');
  check('제공 HTML 정답 H1 대조', () => assert.match(source, /<td class="a">H1<\/td>/));
  check('제공 HTML 유일 경로 F1-G1-H1 대조', () => assert.match(source, /F1(?:→|&rarr;)G1(?:→|&rarr;)H1/));
}

console.log(`원본형 입체 미로 QA ${tests.length}개 통과`);
