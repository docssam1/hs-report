'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE_DIR = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const RENDERER = path.join(PRIVATE_DIR, 'render-original-form-two-rounds.js');
const ASSET_DIR = path.join(ROOT, 'assets', 'original-form');
const ISLAND_META = path.join(PRIVATE_DIR, 'rigor-r2-q10-island-37-v1.meta.json');
const CUBOID_META = path.join(PRIVATE_DIR, 'rigor-r2-q28-cuboid-5x5-pattern-v1.meta.json');

const REQUIRED_SOLVERS = [
  'R1Q05', 'R1Q08', 'R1Q10', 'R1Q12', 'R1Q14', 'R1Q18', 'R1Q23', 'R1Q26', 'R1Q29',
  'R2Q01', 'R2Q02', 'R2Q03', 'R2Q04', 'R2Q05', 'R2Q06', 'R2Q07', 'R2Q09', 'R2Q10',
  'R2Q12', 'R2Q13', 'R2Q15', 'R2Q17', 'R2Q20', 'R2Q21', 'R2Q23', 'R2Q24',
  'R2Q26', 'R2Q27', 'R2Q28',
];

const EXPECTED_ASSET_HASHES = {
  'rigor-r2-q07-stars-102-v1.png': '57ceff967458492300e21333f5c0db2d1f868fe3f3bb57b0ddd202d1aa062a67',
  'rigor-r2-q10-island-37-v1.png': '6ab3839a25bcb42923db32a5ab28781bafe2fea57b760a74aa2861ce56e267d0',
  'rigor-r2-q28-cuboid-5x5-pattern-v1.png': '0ddac6efe1ddfcf79d06d810c6d80708a4d2ed6c4a4dbc58bc30b9570a413b29',
  'rigor-r1-q29-triangle-complete-21-imagegen-v2.png': 'e2d3106e7238213aeee144665deaa783bcdcf83f48414adba550bccd05798493',
  'rigor-r2-q17-triangle-variant-14-v1.png': '69c979dbfe4688c43210ce465aa437e04e97582837d16dabbb2d816f0b31ddff',
  'rigor-digital-display-7-four-bars-v1.png': '687166a656f168ec15127311f084c866dd17d00a3db05760698afcf6362537f9',
};

const failures = [];
const passes = [];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function same(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: 기대값 ${JSON.stringify(expected)}, 실제값 ${JSON.stringify(actual)}`);
  }
}

function sameJson(actual, expected, label) {
  same(JSON.stringify(actual), JSON.stringify(expected), label);
}

function run(label, check) {
  try {
    const evidence = check();
    passes.push({ label, evidence: evidence || '통과' });
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
  }
}

function normalizeAnswer(value) {
  return String(value).replace(/[–—]/g, '-').replace(/\s+/g, '');
}

function keyOf(round, number) {
  return `R${round}Q${String(number).padStart(2, '0')}`;
}

function loadRoundsWithoutRendererWrites() {
  assert(fs.existsSync(RENDERER), `렌더러가 없습니다: ${path.relative(ROOT, RENDERER)}`);
  const source = fs.readFileSync(RENDERER, 'utf8');
  const marker = 'ROUNDS.forEach((items, idx) => {';
  const markerIndex = source.indexOf(marker);
  assert(markerIndex > 0, '렌더러의 출력 시작점을 찾지 못했습니다.');

  // 출력 루프 앞까지만 실행하고 ROUNDS를 노출한다. 원본 HTML/JSON은 쓰지 않는다.
  const inspectedSource = `${source.slice(0, markerIndex)}\n;globalThis.__qaRounds = ROUNDS;`;
  const quietConsole = { log() {}, info() {}, warn() {}, error() {} };
  const context = { require, __dirname: path.dirname(RENDERER), console: quietConsole };
  vm.runInNewContext(inspectedSource, context, { filename: RENDERER, timeout: 5000 });
  assert(Array.isArray(context.__qaRounds), '렌더러에서 ROUNDS를 읽지 못했습니다.');
  return context.__qaRounds;
}

function buildQuestionIndex(rounds) {
  const index = new Map();
  for (const questions of rounds) {
    for (const question of questions) {
      const key = keyOf(question.round, question.number);
      assert(!index.has(key), `${key}가 중복되었습니다.`);
      index.set(key, question);
    }
  }
  return index;
}

function requireQuestion(index, key) {
  const question = index.get(key);
  assert(question, `${key} 문항이 렌더러에 없습니다.`);
  return question;
}

function requirePrompt(question, fragments, key) {
  for (const fragment of fragments) {
    assert(question.prompt.includes(fragment), `${key} 조건이 바뀌었습니다: ${fragment}`);
  }
}

function checkAnswer(index, key, computed, evidence) {
  const question = requireQuestion(index, key);
  same(normalizeAnswer(question.answer), normalizeAnswer(computed), `${key} 정답`);
  return evidence || `독립 계산=${computed}`;
}

function readJson(file, label) {
  assert(fs.existsSync(file), `${label} 파일이 없습니다: ${path.relative(ROOT, file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function requireAsset(question, key, name, expectedHash = null) {
  assert(question.figure.includes(name), `${key}가 검증 대상 자산 ${name}을 사용하지 않습니다.`);
  const file = path.join(ASSET_DIR, name);
  assert(fs.existsSync(file), `${key} 자산이 없습니다: ${path.relative(ROOT, file)}`);
  if (expectedHash) same(sha256(file), expectedHash, `${key} 자산 SHA-256`);
  return file;
}

function combinations(values, size, start = 0, prefix = [], output = []) {
  if (prefix.length === size) {
    output.push(prefix.slice());
    return output;
  }
  for (let i = start; i <= values.length - (size - prefix.length); i += 1) {
    prefix.push(values[i]);
    combinations(values, size, i + 1, prefix, output);
    prefix.pop();
  }
  return output;
}

function permutations(values) {
  if (values.length === 0) return [[]];
  const result = [];
  for (let i = 0; i < values.length; i += 1) {
    const rest = values.slice(0, i).concat(values.slice(i + 1));
    for (const tail of permutations(rest)) result.push([values[i], ...tail]);
  }
  return result;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

function pngHeader(file) {
  const data = fs.readFileSync(file);
  const signature = '89504e470d0a1a0a';
  same(data.subarray(0, 8).toString('hex'), signature, `${path.basename(file)} PNG 서명`);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bitDepth: data[24],
    colorType: data[25],
    interlace: data[28],
  };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function decodeRgbPng(file) {
  const data = fs.readFileSync(file);
  const header = pngHeader(file);
  same(header.bitDepth, 8, `${path.basename(file)} 비트 깊이`);
  same(header.colorType, 2, `${path.basename(file)} 색상 형식`);
  same(header.interlace, 0, `${path.basename(file)} 인터레이스`);

  const idat = [];
  for (let offset = 8; offset < data.length;) {
    const length = data.readUInt32BE(offset);
    const type = data.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') idat.push(data.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const bytesPerPixel = 3;
  const rowBytes = header.width * bytesPerPixel;
  const expectedBytes = (rowBytes + 1) * header.height;
  same(inflated.length, expectedBytes, `${path.basename(file)} 해제된 픽셀 크기`);

  const pixels = Buffer.alloc(rowBytes * header.height);
  for (let y = 0; y < header.height; y += 1) {
    const inputStart = y * (rowBytes + 1);
    const filter = inflated[inputStart];
    const outputStart = y * rowBytes;
    for (let x = 0; x < rowBytes; x += 1) {
      const raw = inflated[inputStart + 1 + x];
      const left = x >= bytesPerPixel ? pixels[outputStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[outputStart + x - rowBytes] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel
        ? pixels[outputStart + x - rowBytes - bytesPerPixel]
        : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upperLeft);
      else fail(`${path.basename(file)}에 지원하지 않는 PNG 필터 ${filter}가 있습니다.`);
      pixels[outputStart + x] = value & 0xff;
    }
  }
  return { ...header, pixels };
}

function darkComponents(image) {
  const { width, height, pixels } = image;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 3;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    if (r < 180 && g < 180 && b < 190) mask[i] = 1;
  }

  const visited = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  const components = [];
  const neighbors = [-1, 0, 1];
  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) continue;
    let head = 0;
    let tail = 0;
    let area = 0;
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    queue[tail++] = start;
    visited[start] = 1;
    while (head < tail) {
      const current = queue[head++];
      const x = current % width;
      const y = Math.floor(current / width);
      area += 1;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const dy of neighbors) {
        for (const dx of neighbors) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (mask[next] && !visited[next]) {
            visited[next] = 1;
            queue[tail++] = next;
          }
        }
      }
    }
    components.push({ area, minX, maxX, minY, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 });
  }
  return components;
}

function countTriangleGraph(removeInternalDiagonal = false, extendLowerDiagonalToOuterEdge = false) {
  const pointsByName = {
    A: [0, 12], B: [-6, 0], C: [6, 0], L: [-3, 6], R: [3, 6],
    U: [-1, 10], D: [0, 0], Q: [4, 3], E: [102 / 23, 72 / 23], P: [1, 8],
  };
  const namedLines = [
    ['A', 'B'], ['A', 'C'], ['B', 'C'], ['L', 'R'], ['U', 'R'],
    ['P', 'D'], ['L', 'D'], ['D', 'R'], ['B', extendLowerDiagonalToOuterEdge ? 'E' : 'Q'],
  ].filter((_, index) => !(removeInternalDiagonal && index === 4));
  const lines = namedLines.map(([a, b]) => [pointsByName[a], pointsByName[b]]);
  const epsilon = 1e-8;
  const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const pointKey = (p) => `${Math.round(p[0] * 1e8)},${Math.round(p[1] * 1e8)}`;
  const intersection = ([p, p2], [q, q2]) => {
    const r = subtract(p2, p);
    const s = subtract(q2, q);
    const denominator = cross(r, s);
    if (Math.abs(denominator) < epsilon) return null;
    const qp = subtract(q, p);
    const t = cross(qp, s) / denominator;
    const u = cross(qp, r) / denominator;
    if (t < -epsilon || t > 1 + epsilon || u < -epsilon || u > 1 + epsilon) return null;
    return [p[0] + t * r[0], p[1] + t * r[1]];
  };
  const onSegment = (p, [a, b]) => (
    Math.abs(cross(subtract(p, a), subtract(b, a))) < epsilon
    && p[0] >= Math.min(a[0], b[0]) - epsilon
    && p[0] <= Math.max(a[0], b[0]) + epsilon
    && p[1] >= Math.min(a[1], b[1]) - epsilon
    && p[1] <= Math.max(a[1], b[1]) + epsilon
  );

  const pointMap = new Map();
  for (const line of lines) for (const point of line) pointMap.set(pointKey(point), point);
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const point = intersection(lines[i], lines[j]);
      if (point) pointMap.set(pointKey(point), point);
    }
  }
  const points = [...pointMap.values()];
  const connected = (a, b) => lines.some((line) => onSegment(a, line) && onSegment(b, line));
  let triangles = 0;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      for (let k = j + 1; k < points.length; k += 1) {
        if (Math.abs(cross(subtract(points[j], points[i]), subtract(points[k], points[i]))) < epsilon) continue;
        if (connected(points[i], points[j]) && connected(points[j], points[k]) && connected(points[k], points[i])) {
          triangles += 1;
        }
      }
    }
  }
  return { triangles, points: points.length, lines: lines.length };
}

function enumerateCuboid(meta) {
  const [rows, columns, depth] = meta.size;
  const pattern = meta.pattern;
  const black = new Set();
  const add = (r, c, d) => black.add(`${r},${c},${d}`);
  for (const [r, c] of pattern) for (let d = 1; d <= depth; d += 1) add(r, c, d);
  for (const [d, c] of pattern) for (let r = 1; r <= rows; r += 1) add(r, c, d);
  for (const [r, d] of pattern) for (let c = 1; c <= columns; c += 1) add(r, c, d);
  const total = rows * columns * depth;
  return { black: black.size, white: total - black.size, total };
}

function installSolvers(rounds) {
  const index = buildQuestionIndex(rounds);

  run('구조 · 렌더러 2회 60문항', () => {
    same(rounds.length, 2, '회차 수');
    for (let r = 0; r < rounds.length; r += 1) {
      const questions = rounds[r];
      same(questions.length, 30, `${r + 1}회 문항 수`);
      sameJson(questions.map((q) => q.number), Array.from({ length: 30 }, (_, i) => i + 1), `${r + 1}회 번호`);
      same(questions.reduce((sum, q) => sum + Math.round(q.point * 10), 0), 1000, `${r + 1}회 총점(0.1점 단위)`);
      for (const question of questions) {
        for (const field of ['area', 'subarea', 'type', 'source', 'prompt', 'answer', 'solution']) {
          assert(typeof question[field] === 'string' && question[field].trim(), `${keyOf(question.round, question.number)} ${field}가 비었습니다.`);
        }
      }
    }
    same(index.size, 60, '고유 문항 수');
    for (const key of REQUIRED_SOLVERS) assert(index.has(key), `${key}가 누락되었습니다.`);
    return '2회×30문항, 각 100점, 필수 필드와 번호 연속성 확인';
  });

  run('R1Q05 · 도형별 합에서 남은 수', () => {
    const q = requireQuestion(index, 'R1Q05');
    requirePrompt(q, ['1부터 8', '합은 10', '합은 20', '동그라미'], 'R1Q05');
    const total = Array.from({ length: 8 }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
    same(total, 36, 'R1Q05 1부터 8의 합');
    return checkAnswer(index, 'R1Q05', String(total - 10 - 20), '36-10-20=6');
  });

  run('R1Q08 · 두 모임의 최소·최대', () => {
    const q = requireQuestion(index, 'R1Q08');
    requirePrompt(q, ['남학생은 21명', '여학생은 15명', '19명', '최솟값과 최댓값'], 'R1Q08');
    const possible = [];
    for (let boysWithGlasses = 0; boysWithGlasses <= 21; boysWithGlasses += 1) {
      const girlsWithGlasses = 19 - boysWithGlasses;
      if (girlsWithGlasses >= 0 && girlsWithGlasses <= 15) possible.push(boysWithGlasses);
    }
    sameJson([Math.min(...possible), Math.max(...possible)], [4, 19], 'R1Q08 범위');
    return checkAnswer(index, 'R1Q08', '23', `가능 범위 4~19, 합 23`);
  });

  run('R1Q10 · 서로 다른 길이의 반복문자', () => {
    const q = requireQuestion(index, 'R1Q10');
    requirePrompt(q, ['19글자', '20글자', '22글자', '‘나’'], 'R1Q10');
    const patterns = ['가나다', '나다가', '다가나'];
    const lengths = [19, 20, 22];
    const counts = patterns.map((pattern, i) => (
      Array.from({ length: lengths[i] }, (_, j) => pattern[j % pattern.length]).filter((c) => c === '나').length
    ));
    sameJson(counts, [6, 7, 7], 'R1Q10 줄별 나의 수');
    return checkAnswer(index, 'R1Q10', '20개', `6+7+7=20`);
  });

  run('R1Q12 · 토끼가 잠든 시간', () => {
    const q = requireQuestion(index, 'R1Q12');
    requirePrompt(q, ['2분 동안 1m', '10초 동안 2m', '30m', '3분 늦게'], 'R1Q12');
    const turtleSeconds = 30 * 2 * 60;
    const rabbitArrivalSeconds = turtleSeconds + 3 * 60;
    const rabbitRunningSeconds = (30 / 2) * 10;
    const sleep = rabbitArrivalSeconds - rabbitRunningSeconds;
    same(sleep, 3630, 'R1Q12 잠든 초');
    return checkAnswer(index, 'R1Q12', `${Math.floor(sleep / 60)}분 ${sleep % 60}초`, '총 63분에서 달린 2분30초를 제외');
  });

  run('R1Q14 · 네 어항 역산', () => {
    const q = requireQuestion(index, 'R1Q14');
    requirePrompt(q, ['모두 31마리', '2마리 많고', '3마리 많으며', '1마리 적습니다'], 'R1Q14');
    const solutions = [];
    for (let first = 1; first <= 31; first += 1) {
      const bowls = [first, first + 2, first + 5, first + 4];
      if (bowls.reduce((a, b) => a + b, 0) === 31) solutions.push(bowls);
    }
    sameJson(solutions, [[5, 7, 10, 9]], 'R1Q14 가능한 어항 수');
    return checkAnswer(index, 'R1Q14', '9마리', '유일한 배치 5,7,10,9');
  });

  run('R1Q18 · 빠른·느린 시계 재일치', () => {
    const q = requireQuestion(index, 'R1Q18');
    requirePrompt(q, ['1시간마다 2초', '4초씩 느려', '다시 같은 시각'], 'R1Q18');
    const relativeSecondsPerHour = 2 + 4;
    const dialSeconds = 12 * 60 * 60;
    const hours = dialSeconds / gcd(dialSeconds, relativeSecondsPerHour);
    const days = hours / 24;
    same(days, 300, 'R1Q18 첫 재일치 일수');
    return checkAnswer(index, 'R1Q18', '300일', '상대 오차 6초/시간, 12시간 눈금 차까지 7200시간');
  });

  run('R1Q23 · 횟수 제한 최소합', () => {
    const q = requireQuestion(index, 'R1Q23');
    requirePrompt(q, ['88+2', '=137', '1, 2, 5, 8, 9', '최대 두 번'], 'R1Q23');
    const values = [1, 2, 5, 8, 9];
    const target = 137 - 88 - 2 - 1;
    const ways = [];
    const search = (i, sum, count, used) => {
      if (i === values.length) {
        if (sum === target) ways.push({ count, used: used.slice() });
        return;
      }
      for (let copies = 0; copies <= 2; copies += 1) {
        used.push(copies);
        search(i + 1, sum + values[i] * copies, count + copies, used);
        used.pop();
      }
    };
    search(0, 0, 0, []);
    const minimum = Math.min(...ways.map((way) => way.count));
    same(minimum, 7, 'R1Q23 최소 항 수');
    return checkAnswer(index, 'R1Q23', '7개', `${ways.length}개 표현을 전수 열거, 최소 7개`);
  });

  const segmentCounts = { 0: 6, 1: 2, 2: 5, 3: 5, 4: 4, 5: 5, 6: 6, 7: 4, 8: 7, 9: 6 };
  run('R1Q26 · 비표준 디지털 14칸 최댓값', () => {
    const q = requireQuestion(index, 'R1Q26');
    requirePrompt(q, ['네 자리 자연수', '14개', '가장 큰 수'], 'R1Q26');
    requireAsset(q, 'R1Q26', 'rigor-digital-display-7-four-bars-v1.png', EXPECTED_ASSET_HASHES['rigor-digital-display-7-four-bars-v1.png']);
    const valid = [];
    for (let n = 1000; n <= 9999; n += 1) {
      const count = [...String(n)].reduce((sum, digit) => sum + segmentCounts[digit], 0);
      if (count === 14) valid.push(n);
    }
    same(Math.max(...valid), 9711, 'R1Q26 최댓값');
    return checkAnswer(index, 'R1Q26', '9711', `${valid.length}개 네 자리 수 전수 열거, 7은 4칸`);
  });

  run('R1Q29 · 외곽선까지 이어진 불규칙 삼각형', () => {
    const q = requireQuestion(index, 'R1Q29');
    requireAsset(q, 'R1Q29', 'rigor-r1-q29-triangle-complete-21-imagegen-v2.png', EXPECTED_ASSET_HASHES['rigor-r1-q29-triangle-complete-21-imagegen-v2.png']);
    const graph = countTriangleGraph(false, true);
    same(graph.triangles, 21, 'R1Q29 삼각형 수');
    return checkAnswer(index, 'R1Q29', '21개', `${graph.lines}선분·${graph.points}교점/끝점 전수 열거`);
  });

  run('R2Q01 · 카드 50장 공유 꼭짓점', () => {
    const q = requireQuestion(index, 'R2Q01');
    requirePrompt(q, ['50장', '꼭짓점 한 곳만', '핀'], 'R2Q01');
    const pins = new Set(['0:a', '0:b', '0:c', '0:d']);
    let shared = '0:d';
    for (let card = 1; card < 50; card += 1) {
      pins.add(shared);
      pins.add(`${card}:a`);
      pins.add(`${card}:b`);
      pins.add(`${card}:c`);
      shared = `${card}:c`;
    }
    same(pins.size, 151, 'R2Q01 핀 합집합');
    return checkAnswer(index, 'R2Q01', '151개', '첫 카드 4개, 이후 49장마다 새 핀 3개');
  });

  run('R2Q02 · 같은 도로에서 자동차 길이', () => {
    const q = requireQuestion(index, 'R2Q02');
    requirePrompt(q, ['길이가 같은 두 도로', '자동차 한 대의 길이'], 'R2Q02');
    const upperGap = 2 + 4 + 2 + 3;
    const lowerGap = 5 + 6 + 5;
    same(upperGap, 11, 'R2Q02 위 빈 거리 합');
    same(lowerGap, 16, 'R2Q02 아래 빈 거리 합');
    return checkAnswer(index, 'R2Q02', `${lowerGap - upperGap}m`, '자동차 한 대 차이와 빈 거리 합의 차가 같음');
  });

  run('R2Q03 · 쌓은 저울의 포함 관계', () => {
    const q = requireQuestion(index, 'R2Q03');
    requirePrompt(q, ['1.9kg', '1.2kg', '저울 자체'], 'R2Q03');
    const grams = Math.round((1.9 - 1.2) * 1000);
    same(grams, 700, 'R2Q03 저울 자체 무게');
    return checkAnswer(index, 'R2Q03', '700g', '아래 묶음에서 위 묶음을 제외');
  });

  run('R2Q04 · 세 모임 겹침의 범위', () => {
    const q = requireQuestion(index, 'R2Q04');
    requirePrompt(q, ['남학생 17명', '여학생 13명', '안경을 쓴 학생은 18명', '모자를 쓴 학생은 12명', '둘 다 한 학생은 8명'], 'R2Q04');
    const boysGlasses = 18 - 7;
    const boysHats = 12 - 6;
    const possibleBoysBoth = [];
    for (let boysBoth = 0; boysBoth <= 17; boysBoth += 1) {
      const girlsBoth = 8 - boysBoth;
      const boysUnion = boysGlasses + boysHats - boysBoth;
      const girlsUnion = 7 + 6 - girlsBoth;
      if (boysBoth <= Math.min(boysGlasses, boysHats)
        && girlsBoth >= 0 && girlsBoth <= Math.min(7, 6)
        && boysUnion <= 17 && girlsUnion <= 13) {
        possibleBoysBoth.push(boysBoth);
      }
    }
    sameJson(possibleBoysBoth, [2, 3, 4, 5, 6], 'R2Q04 가능한 남학생 교집합');
    return checkAnswer(index, 'R2Q04', '8', '최솟값 2와 최댓값 6의 합');
  });

  run('R2Q05 · 거울시계와 지난 시간', () => {
    const q = requireQuestion(index, 'R2Q05');
    requirePrompt(q, ['8시 10분', '오전 8시 30분', '몇 분'], 'R2Q05');
    const mirrorMinutes = 8 * 60 + 10;
    const actualMinutes = (12 * 60 - mirrorMinutes) % (12 * 60);
    const wakeMinutes = 8 * 60 + 30;
    const elapsed = wakeMinutes - actualMinutes;
    same(actualMinutes, 3 * 60 + 50, 'R2Q05 실제 시각');
    return checkAnswer(index, 'R2Q05', `${elapsed}분`, '거울 8:10→실제 3:50, 8:30까지 280분');
  });

  run('R2Q06 · 달을 건너는 요일', () => {
    const q = requireQuestion(index, 'R2Q06');
    requirePrompt(q, ['4월 18일', '수요일', '5월 13일'], 'R2Q06');
    const dayDifference = (30 - 18) + 13;
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const result = weekdays[(3 + dayDifference) % 7];
    same(dayDifference, 25, 'R2Q06 날짜 차');
    return checkAnswer(index, 'R2Q06', result, '25일 뒤는 수요일에서 네 칸 뒤');
  });

  run('R2Q07 · 별 PNG 연결요소', () => {
    const q = requireQuestion(index, 'R2Q07');
    const file = requireAsset(q, 'R2Q07', 'rigor-r2-q07-stars-102-v1.png', EXPECTED_ASSET_HASHES['rigor-r2-q07-stars-102-v1.png']);
    const image = decodeRgbPng(file);
    const stars = darkComponents(image).filter((component) => component.area >= 120 && component.area <= 5000);
    same(stars.length, 102, 'R2Q07 그림 속 별 연결요소');
    const rowCenters = stars.map((star) => star.cy).sort((a, b) => a - b);
    const rows = [];
    for (const y of rowCenters) {
      const row = rows.find((candidate) => Math.abs(candidate.center - y) < 24);
      if (row) {
        row.values.push(y);
        row.center = row.values.reduce((a, b) => a + b, 0) / row.values.length;
      } else rows.push({ center: y, values: [y] });
    }
    same(rows.length, 12, 'R2Q07 별 행 수');
    return checkAnswer(index, 'R2Q07', '102개', `PNG ${image.width}×${image.height}에서 별 102개·12행 검출`);
  });

  run('R2Q09 · 지그재그 여덟 교점', () => {
    const q = requireQuestion(index, 'R2Q09');
    requirePrompt(q, ['5번 자릅니다', '몇 도막'], 'R2Q09');
    const pieces = 1 + 8 * 5;
    return checkAnswer(index, 'R2Q09', `${pieces}도막`, '한 절단선이 8개 사선과 만나고 5회 절단');
  });

  run('R2Q10 · 섬·바다 비공개 메타', () => {
    const q = requireQuestion(index, 'R2Q10');
    requirePrompt(q, ['위에서 아래까지', '하나의 구불구불한 선', '야자수가 있는 쪽'], 'R2Q10');
    const meta = readJson(ISLAND_META, 'R2Q10 섬 메타');
    const file = requireAsset(q, 'R2Q10', 'rigor-r2-q10-island-37-v1.png');
    same(sha256(file), meta.assetSha256, 'R2Q10 메타와 자산 SHA-256');
    same(sha256(file), EXPECTED_ASSET_HASHES['rigor-r2-q10-island-37-v1.png'], 'R2Q10 감사 잠금 SHA-256');
    same(meta.islandCoordinates.length, meta.island, 'R2Q10 섬 좌표 수');
    same(meta.seaCoordinates.length, meta.sea, 'R2Q10 바다 좌표 수');
    same(meta.island + meta.sea, meta.total, 'R2Q10 전체 개구리 수');
    const all = [...meta.islandCoordinates, ...meta.seaCoordinates];
    same(new Set(all.map((point) => point.join(','))).size, meta.total, 'R2Q10 좌표 고유성');
    const header = pngHeader(file);
    for (const [x, y] of all) {
      assert(x >= 0 && x < header.width && y >= 0 && y < header.height, `R2Q10 좌표가 그림 밖입니다: ${x},${y}`);
    }
    return checkAnswer(index, 'R2Q10', `${meta.sea}마리`, `메타 37마리=섬22+바다15, 자산 해시 일치`);
  });

  run('R2Q12 · 세 나머지 조건', () => {
    const q = requireQuestion(index, 'R2Q12');
    requirePrompt(q, ['20 이상 80 이하', '4로 나눈 나머지가 1', '7로 나눈 나머지가 3', '5로 나누어떨어지지'], 'R2Q12');
    const valid = [];
    for (let n = 20; n <= 80; n += 1) {
      if (n % 4 === 1 && n % 7 === 3 && n % 5 !== 0) valid.push(n);
    }
    sameJson(valid, [73], 'R2Q12 가능한 수');
    return checkAnswer(index, 'R2Q12', '73', '20~80 전수 열거에서 73 하나');
  });

  run('R2Q13 · 세 교실의 쌍합', () => {
    const q = requireQuestion(index, 'R2Q13');
    requirePrompt(q, ['34명', '25명', '41명', '교실 (다)'], 'R2Q13');
    const solutions = [];
    for (let a = 1; a <= 50; a += 1) {
      for (let b = 1; b <= 50; b += 1) {
        for (let c = 1; c <= 50; c += 1) {
          if (a + b === 34 && a + c === 25 && b + c === 41) solutions.push([a, b, c]);
        }
      }
    }
    sameJson(solutions, [[9, 25, 16]], 'R2Q13 가능한 교실 인원');
    return checkAnswer(index, 'R2Q13', '16명', '양의 정수 전수 열거에서 (9,25,16) 하나');
  });

  run('R2Q15 · 과거·미래 나이', () => {
    const q = requireQuestion(index, 'R2Q15');
    requirePrompt(q, ['너는 9살', '나는 24살', '현재 나이'], 'R2Q15');
    const solutions = [];
    for (let older = 2; older <= 80; older += 1) {
      for (let younger = 1; younger < older; younger += 1) {
        const gap = older - younger;
        if (younger - gap === 9 && older + gap === 24) solutions.push([older, younger]);
      }
    }
    sameJson(solutions, [[19, 14]], 'R2Q15 가능한 현재 나이');
    return checkAnswer(index, 'R2Q15', '형 19살, 동생 14살', '1~80살 전수 열거에서 한 쌍');
  });

  run('R2Q17 · 불규칙 삼각형 유사형', () => {
    const q = requireQuestion(index, 'R2Q17');
    requireAsset(q, 'R2Q17', 'rigor-r2-q17-triangle-variant-14-v1.png', EXPECTED_ASSET_HASHES['rigor-r2-q17-triangle-variant-14-v1.png']);
    const graph = countTriangleGraph(true);
    same(graph.triangles, 14, 'R2Q17 삼각형 수');
    return checkAnswer(index, 'R2Q17', '14개', `${graph.lines}선분·${graph.points}교점/끝점 전수 열거`);
  });

  run('R2Q20 · 2026번째 세 반복마디', () => {
    const q = requireQuestion(index, 'R2Q20');
    requirePrompt(q, ['2026번째 세로줄'], 'R2Q20');
    const patterns = ['가나다라', '마바사', '아자차카타'];
    const letters = patterns.map((pattern) => pattern[(2026 - 1) % pattern.length]);
    sameJson(letters, ['나', '마', '아'], 'R2Q20 세 글자');
    return checkAnswer(index, 'R2Q20', letters.join('-'), '주기 4·3·5를 각각 독립 적용');
  });

  run('R2Q21 · 두 재생 주기 시뮬레이션', () => {
    const q = requireQuestion(index, 'R2Q21');
    requirePrompt(q, ['4의 차례마다 머리 2개', '7의 차례마다 머리 1개', '31번째', '처음 머리가 0개'], 'R2Q21');
    const validInitial = [];
    for (let initial = 1; initial <= 100; initial += 1) {
      let heads = initial;
      let firstZero = null;
      for (let cut = 1; cut <= 100; cut += 1) {
        if (heads <= 0) break;
        heads -= 1;
        if (cut % 4 === 0) heads += 2;
        if (cut % 7 === 0) heads += 1;
        if (heads === 0) {
          firstZero = cut;
          break;
        }
        if (heads < 0) break;
      }
      if (firstZero === 31) validInitial.push(initial);
    }
    sameJson(validInitial, [13], 'R2Q21 가능한 처음 머리 수');
    return checkAnswer(index, 'R2Q21', '13개', '처음 1~100개를 상태 시뮬레이션, 31회 첫 0은 13 하나');
  });

  run('R2Q23 · 디지털 칸·서로 다름·3의 배수', () => {
    const q = requireQuestion(index, 'R2Q23');
    requirePrompt(q, ['서로 다른 숫자 네 개', '16개', '3으로 나누어떨어지는', '가장 큰 수'], 'R2Q23');
    requireAsset(q, 'R2Q23', 'rigor-digital-display-7-four-bars-v1.png', EXPECTED_ASSET_HASHES['rigor-digital-display-7-four-bars-v1.png']);
    const valid = [];
    for (let n = 1000; n <= 9999; n += 1) {
      const digits = [...String(n)].map(Number);
      if (new Set(digits).size !== 4) continue;
      if (digits.reduce((sum, digit) => sum + segmentCounts[digit], 0) !== 16) continue;
      if (n % 3 === 0) valid.push(n);
    }
    same(Math.max(...valid), 9741, 'R2Q23 최댓값');
    return checkAnswer(index, 'R2Q23', '9741', `${valid.length}개 후보 전수 열거`);
  });

  run('R2Q24 · 재귀 정사각형 선 길이', () => {
    const q = requireQuestion(index, 'R2Q24');
    requirePrompt(q, ['32cm', '5번째 그림', '모든 선의 길이'], 'R2Q24');
    let total = 4 * 32;
    let squareSide = 32;
    for (let figure = 2; figure <= 5; figure += 1) {
      total += 2 * squareSide;
      squareSide /= 2;
    }
    same(total, 248, 'R2Q24 선 길이 합');
    return checkAnswer(index, 'R2Q24', '248cm', '바깥128+새 십자선64+32+16+8');
  });

  run('R2Q26 · 여섯 사람 자리배치', () => {
    const q = requireQuestion(index, 'R2Q26');
    requirePrompt(q, ['1번부터 6번', '바로 오른쪽', '양 끝', '두 자리 오른쪽', '왼쪽'], 'R2Q26');
    const people = ['M', 'J', 'Z', 'S', 'H', 'Y'];
    const valid = permutations(people).filter((order) => {
      const position = Object.fromEntries(order.map((person, i) => [person, i + 1]));
      return position.J === position.M + 1
        && ![1, 6].includes(position.Z)
        && ![1, 6].includes(position.S)
        && position.H === position.Y + 2
        && position.Y < position.M;
    });
    sameJson(valid, [['Y', 'Z', 'H', 'S', 'M', 'J'], ['Y', 'S', 'H', 'Z', 'M', 'J']], 'R2Q26 가능한 배열');
    return checkAnswer(index, 'R2Q26', '2가지', '6!=720배열 전수 확인');
  });

  run('R2Q27 · 세 형제의 현재 나이', () => {
    const q = requireQuestion(index, 'R2Q27');
    requirePrompt(q, ['모두 더하면 46살', '4년 뒤', '42살', '3년 전', '21살'], 'R2Q27');
    const valid = [];
    for (let older = 1; older <= 50; older += 1) {
      for (let middle = 1; middle < older; middle += 1) {
        for (let younger = 1; younger < middle; younger += 1) {
          if (older + middle + younger === 46
            && older + 4 + middle + 4 === 42
            && middle - 3 + younger - 3 === 21) {
            valid.push([older, middle, younger]);
          }
        }
      }
    }
    sameJson(valid, [[19, 15, 12]], 'R2Q27 가능한 나이');
    return checkAnswer(index, 'R2Q27', '19살, 15살, 12살', '1~50살 순서 있는 세 쌍 전수 열거');
  });

  run('R2Q28 · 쌓기나무 비공개 메타와 3차원 합집합', () => {
    const q = requireQuestion(index, 'R2Q28');
    requirePrompt(q, ['각각 5칸', '앞면·윗면·오른쪽 면', '반대편 끝까지', '흰색 쌓기나무'], 'R2Q28');
    const meta = readJson(CUBOID_META, 'R2Q28 쌓기나무 메타');
    const file = requireAsset(q, 'R2Q28', 'rigor-r2-q28-cuboid-5x5-pattern-v1.png', EXPECTED_ASSET_HASHES['rigor-r2-q28-cuboid-5x5-pattern-v1.png']);
    sameJson(meta.size, [5, 5, 5], 'R2Q28 크기 메타');
    sameJson(meta.pattern, [[2, 2], [2, 4], [3, 3], [4, 2], [4, 4]], 'R2Q28 면 무늬 메타');
    same(new Set(meta.pattern.map((point) => point.join(','))).size, meta.pattern.length, 'R2Q28 면 무늬 고유 칸 수');
    const result = enumerateCuboid(meta);
    same(result.black, meta.black, 'R2Q28 독립 검산 검정 수와 메타');
    same(result.white, meta.white, 'R2Q28 독립 검산 흰색 수와 메타');
    same(result.total, 125, 'R2Q28 전체 쌓기나무');
    const header = pngHeader(file);
    assert(header.width >= 1200 && header.height >= 700, 'R2Q28 그림 해상도가 너무 작습니다.');
    return checkAnswer(index, 'R2Q28', `${result.white}개`, '125개 좌표를 3방향 관통선 합집합으로 전수 표시: 검정57·흰색68');
  });

  sameJson([...index.keys()].filter((key) => REQUIRED_SOLVERS.includes(key)).sort(), REQUIRED_SOLVERS.slice().sort(), '필수 검산 문항 집합');
}

function main() {
  try {
    const rounds = loadRoundsWithoutRendererWrites();
    installSolvers(rounds);
  } catch (error) {
    failures.push(`검산기 초기화: ${error.message}`);
  }

  if (failures.length) {
    console.error(`원본형 독립 난도·정답 QA 실패 (${failures.length}건)`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`원본형 독립 난도·정답 QA 통과: ${passes.length}개 검사`);
  console.log(`- 렌더러를 출력 없이 읽어 2회×30문항·각 100점 확인`);
  console.log(`- 지정 교체 문항 ${REQUIRED_SOLVERS.length}개 독립 계산·열거·그래프·시뮬레이션 통과`);
  console.log('- R2Q07 별 PNG 연결요소 102개, R2Q10 섬 메타·자산 해시, R2Q28 쌓기나무 3차원 합집합 교차 검증 통과');
}

if (require.main === module) main();

module.exports = {
  countTriangleGraph,
  decodeRgbPng,
  enumerateCuboid,
  loadRoundsWithoutRendererWrites,
};
