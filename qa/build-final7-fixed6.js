'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'bank', 'assets', 'final7');
const DATA_DIR = path.join(ROOT, 'bank', 'data');
const SOURCE_PATH = 'materials/final_7/002.jpg';

const q5 = [
  {
    text: '도윤이가 그림과 같은 게임판에서 X에서 출발하여 Y까지 도착하면 끝나는 게임을 합니다. 도윤이는 몇 가지 방법으로 갈 수 있을까요?',
    cells: [[-2, 0], [-2, 1], [-2, 2], [-1, 0], [-1, 1], [0, 0]],
    start: [-2, 0], end: [-2, 2], firstCounts: [4, 6], answer: 10,
  },
  {
    text: '로봇이 그림의 X칸에서 출발하여 Y칸에 도착하려고 합니다. 로봇이 갈 수 있는 방법은 모두 몇 가지일까요?',
    cells: [[-2, 0], [-2, 1], [-2, 2], [-1, 0], [0, -1], [0, 0], [1, -1]],
    start: [-2, 0], end: [1, -1], firstCounts: [4, 4], answer: 8,
  },
  {
    text: '장난감 말을 그림의 X에서 출발시켜 Y까지 옮기려고 합니다. 장난감 말이 갈 수 있는 방법은 모두 몇 가지일까요?',
    cells: [[-2, 0], [-2, 1], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [0, 0]],
    start: [-1, -1], end: [0, 0], firstCounts: [7, 4], answer: 11,
  },
];

const q6 = [
  {
    name: '수현', answer: 6,
    points: [[24,160],[70,160],[130,80],[210,230],[100,230],[230,80],[270,160],[330,80],[410,230],[300,230],[430,80],[470,160],[530,80],[610,230],[500,230],[630,80],[736,160]],
    facingFront: [1,0,1,1,0,1,0,1,0,1],
  },
  {
    name: '민준', answer: 6,
    points: [[24,175],[75,175],[135,95],[215,245],[105,245],[235,95],[280,175],[340,70],[420,225],[310,225],[440,70],[480,175],[545,95],[625,245],[515,245],[645,95],[736,175]],
    facingFront: [0,1,1,0,1,0,1,0,1,0,1],
  },
  {
    name: '지안', answer: 7,
    points: [[24,145],[70,145],[135,55],[220,225],[100,225],[240,55],[280,145],[345,95],[425,260],[315,260],[445,95],[480,145],[540,55],[625,225],[505,225],[645,55],[736,145]],
    facingFront: [1,1,0,1,0,1,1,0,1,0,1,0],
  },
];

function sha(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function pngAsset(file, description) {
  const data = fs.readFileSync(path.join(ASSET_DIR, file));
  if (data.toString('ascii', 1, 4) !== 'PNG') throw new Error(file + ': PNG asset required');
  return {
    asset: {
      kind: 'raster',
      src: 'data:image/png;base64,' + data.toString('base64'),
      mimeType: 'image/png',
      description,
      width: data.readUInt32BE(16),
      height: data.readUInt32BE(20),
    },
    assetSha256: sha(data),
  };
}

function common(no, variant, fields) {
  const record = Object.assign({
    id: 'final7-q' + String(no).padStart(2, '0') + '-v' + variant,
    sourceSet: 'final',
    sourceRound: 7,
    sourceNo: no,
    variantNo: variant,
    genId: 'final7-q' + String(no).padStart(2, '0'),
    pointBand: '2.7',
    answerPolicy: 'single',
    sourceLocator: SOURCE_PATH + '#q' + no,
    reviewStatus: 'verified',
    releaseStatus: 'verified-student-wrong-practice',
    sourceComparison: {
      status: 'user-reviewed-variant',
      sourcePath: SOURCE_PATH,
      transformedDimensions: no === 5 ? ['hex-cell arrangement', 'start/end position'] : ['rope crossings', 'fish order and direction'],
      preservedInvariants: no === 5 ? ['adjacent-hex path counting', 'two first moves', 'no answer marks'] : ['one continuous rope', 'trace from front to back', 'no answer marks'],
    },
    learnerFit: {
      gateId: 'learner-fit', status: 'pass', learnerStage: '초등 선발 대비 최종 모의고사 수강생',
      language: '원문과 같은 수준의 짧은 문장', responseMode: '한 개의 수로 답하기',
    },
  }, fields);
  record.solution = record.solutionSteps.join(' ');
  record.itemContentHash = sha(JSON.stringify({text: record.text, answer: record.answer, meta: record.meta, assetSha256: record.assetSha256}));
  return record;
}

const items = [];
q5.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q05-v' + variant + '.png', '서로 맞닿은 육각형 칸과 X·Y가 표시된 길 찾기 게임판');
  items.push(common(5, variant, Object.assign({
    text: row.text,
    answer: row.answer + '가지',
    acceptedAnswers: [row.answer + '가지', String(row.answer)],
    area: '경우의 수', subarea: '길 찾기', detailType: '육각형 칸을 따라가는 방법의 수',
    readingFocus: 'X에서 처음 옮길 수 있는 두 칸을 나누어 살펴봅니다.',
    solutionSkill: '첫 이동에 따라 경우를 나누고 같은 칸을 다시 지나지 않는 길을 빠짐없이 세기',
    solutionSteps: [
      'X에서 처음 갈 수 있는 두 칸을 기준으로 경우를 나눕니다.',
      '첫째 칸으로 시작하는 길은 ' + row.firstCounts[0] + '가지, 둘째 칸으로 시작하는 길은 ' + row.firstCounts[1] + '가지입니다.',
      row.firstCounts[0] + '+' + row.firstCounts[1] + '=' + row.answer + '이므로 모두 ' + row.answer + '가지입니다.',
    ],
    meta: {cells: row.cells, start: row.start, end: row.end, firstBranchCounts: row.firstCounts, simplePathCount: row.answer},
    assetSpec: {kind: 'hex-cell-path', cells: row.cells, start: row.start, end: row.end, renderRules: {showAnswerPath: false, showCounts: false}},
    verification: {
      primary: {method: '첫 이동 두 경우로 나누어 경로 목록 확인', answer: row.answer + '가지', branchCounts: row.firstCounts},
      independent: {method: '육각형 인접 그래프의 단순 경로 전수 탐색', answer: row.answer + '가지'},
      unique: true, validAnswerCount: 1, answerContract: 'single-value',
      visibleEvidence: {passed: true, method: '모든 육각형 경계와 X·Y가 보이며 정답 경로 표시는 없음'},
    },
  }, image)));
});

q6.forEach((row, index) => {
  const variant = index + 1;
  const frontNos = row.facingFront.map((value, i) => value ? i + 1 : null).filter(Boolean);
  const image = pngAsset('q06-v' + variant + '.png', '앞과 뒤가 표시되고 세 구간에서 교차하는 한 줄의 낚싯줄과 물고기');
  items.push(common(6, variant, Object.assign({
    text: row.name + '이가 낚시를 하러 갔습니다. 낚싯줄에 물고기가 아래와 같이 잡혔습니다. 꼬인 낚싯줄을 한 줄로 길게 폈을 때, 앞쪽을 바라보고 있는 물고기는 몇 마리인지 구하세요.',
    answer: row.answer + '마리',
    acceptedAnswers: [row.answer + '마리', String(row.answer)],
    area: '도형', subarea: '방향과 위치', detailType: '꼬인 낚싯줄을 편 뒤 물고기 방향 판단',
    readingFocus: '교차점에서 다른 선으로 건너가지 않고 앞에서 뒤까지 같은 낚싯줄을 따라갑니다.',
    solutionSkill: '한 줄을 순서대로 따라가며 머리가 앞쪽을 향하는 물고기만 세기',
    solutionSteps: [
      '낚싯줄의 앞에서 시작하여 교차점에서 다른 선으로 건너가지 않고 같은 줄을 뒤까지 따라갑니다.',
      '지나가는 순서대로 번호를 붙이면 앞쪽을 바라보는 물고기는 ' + frontNos.join('·') + '번째입니다.',
      '따라서 앞쪽을 바라보는 물고기는 모두 ' + row.answer + '마리입니다.',
    ],
    meta: {ropePoints: row.points, ropeContinuous: true, crossingCount: 3, facingFront: row.facingFront, facingFrontNos: frontNos, fishCount: row.facingFront.length},
    assetSpec: {kind: 'continuous-fishing-line', points: row.points, facingFront: row.facingFront, renderRules: {showAnswerMarks: false, ropeStrokeWidth: 4.5, spreadCrossings: true}},
    verification: {
      primary: {method: '앞에서 뒤까지 줄을 직접 추적해 물고기 방향 기록', answer: row.answer + '마리', facingFrontNos: frontNos},
      independent: {method: '그림 생성에 사용한 방향 배열의 참값 개수 계산', answer: row.answer + '마리'},
      unique: true, validAnswerCount: 1, answerContract: 'single-value',
      visibleEvidence: {passed: true, method: '연속된 검은 낚싯줄, 분산된 세 교차점, 물고기 머리·꼬리 및 앞·뒤 표기가 모두 보임'},
    },
  }, image)));
});

const data = {
  version: '7.1.0', sourceSet: 'final', sourceRound: 7,
  freezePolicy: {runtimeGeneration: false, fixedItemCount: items.length, variantsPerSourceQuestion: 3, availableSourceNos: [5, 6], partialRelease: true},
  sourceFingerprints: {[SOURCE_PATH]: sha(fs.readFileSync(path.join(ROOT, SOURCE_PATH)))},
  reviewSummary: {verified: items.length, pending: 0, unavailableSourceQuestions: 28},
  items,
};
const index = {
  version: data.version, sourceSet: data.sourceSet, sourceRound: data.sourceRound,
  availableSourceNos: data.freezePolicy.availableSourceNos,
  items: items.map(({id, sourceNo, genId, variantNo, reviewStatus, area, subarea, detailType, pointBand, text}) => ({id, sourceNo, genId, variantNo, reviewStatus, area, subarea, detailType, pointBand, text})),
};

fs.writeFileSync(path.join(DATA_DIR, 'final7-fixed6.json'), JSON.stringify(data, null, 2) + '\n');
fs.writeFileSync(path.join(DATA_DIR, 'final7-fixed6-index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('wrote ' + items.length + ' reviewed Final 7 variants');
