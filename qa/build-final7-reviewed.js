'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'bank', 'assets', 'final7');
const DATA_DIR = path.join(ROOT, 'bank', 'data');
const SOURCE_PATHS = ['materials/final_7/002.jpg', 'materials/final_7/003.jpg'];

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

const q7 = [
  {start:247, limit:120, end:274, answer:28, lead:'민서는 책에서 연속된 페이지 여러 장을 뜯어냈습니다.', first:'뜯어낸 부분의 첫 페이지', last:'마지막 페이지', ask:'뜯어낸 페이지'},
  {start:384, limit:80, end:438, answer:55, lead:'도현이는 문제집의 연속된 페이지를 복사했습니다.', first:'처음 복사한 페이지', last:'마지막으로 복사한 페이지', ask:'복사한 페이지'},
  {start:529, limit:100, end:592, answer:64, lead:'유나는 사전의 연속된 페이지를 읽었습니다.', first:'처음 읽은 페이지', last:'마지막으로 읽은 페이지', ask:'읽은 페이지'},
];

const q8 = [
  {from:20, to:100, divisor:8, remainder:5, values:[21,29,37,45,53,61,69,77,85,93], answer:570, wording:'range'},
  {from:15, to:90, divisor:6, remainder:2, values:[20,26,32,38,44,50,56,62,68,74,80,86], answer:636, wording:'natural'},
  {from:30, to:120, divisor:9, remainder:7, values:[34,43,52,61,70,79,88,97,106,115], answer:745, wording:'cards'},
];

const q9 = [
  {text:'배송 로봇은 출발점에서 동쪽으로 36m, 북쪽으로 18m, 서쪽으로 14m, 남쪽으로 7m 이동했습니다. 로봇은 처음 출발한 자리로 돌아가기 위해 서쪽으로 □m, 남쪽으로 △m 이동하려고 합니다. 이때 □+△의 값은 얼마입니까?', moves:{east:36,north:18,west:14,south:7}, returns:{west:22,south:11}, answer:33},
  {text:'등산객이 출발점에서 북쪽으로 45m, 동쪽으로 28m, 남쪽으로 19m, 서쪽으로 11m 걸었습니다. 처음 출발한 자리로 돌아가기 위해 서쪽으로 □m, 남쪽으로 △m 걸어가려고 합니다. 이때 □+△의 값은 얼마입니까?', moves:{north:45,east:28,south:19,west:11}, returns:{west:17,south:26}, answer:43},
  {text:'드론이 출발점에서 서쪽으로 52m, 남쪽으로 21m, 동쪽으로 34m, 북쪽으로 9m 이동했습니다. 처음 출발한 자리로 돌아가기 위해 동쪽으로 □m, 북쪽으로 △m 이동하려고 합니다. 이때 □+△의 값은 얼마입니까?', moves:{west:52,south:21,east:34,north:9}, returns:{east:18,north:12}, answer:30},
];

const q10 = [
  {max:89,count:5,quotient:76,object:'카드',divideWord:'5로',answer:30},
  {max:70,count:6,quotient:58,object:'공',divideWord:'6으로',answer:8},
  {max:80,count:4,quotient:65,object:'번호표',divideWord:'4로',answer:23},
];

const q11 = [
  {small:3,large:7,total:36,largeCount:12,last:5,people:154,setting:'놀이공원 대기실',smallName:'3인용 의자',largeName:'7인용 긴 의자'},
  {small:2,large:6,total:38,largeCount:17,last:4,people:142,setting:'체험관 휴게실',smallName:'2인용 의자',largeName:'6인용 긴 의자'},
  {small:4,large:9,total:29,largeCount:11,last:6,people:168,setting:'식당',smallName:'4인용 식탁',largeName:'9인용 긴 식탁'},
];

const q12 = [
  {from:4,to:5,active:'se',shade:['ne','sw'],answer:[1,512]},
  {from:2,to:4,active:'nw',shade:['ne','sw'],answer:[5,128]},
  {from:5,to:6,active:'ne',shade:['nw','se'],answer:[1,2048]},
];

const comparisons = {
  5: {transformedDimensions:['hex-cell arrangement','start/end position'], preservedInvariants:['adjacent-hex path counting','two first moves','no answer marks']},
  6: {transformedDimensions:['rope crossings','fish order and direction'], preservedInvariants:['one continuous rope','trace from front to back','no answer marks']},
  7: {transformedDimensions:['page numbers','maximum page count','book activity'], preservedInvariants:['same three digits used once','later page','inclusive consecutive-page count']},
  8: {transformedDimensions:['number range','divisor','remainder','setting'], preservedInvariants:['inclusive range','one fixed remainder class','sum of every matching number']},
  9: {transformedDimensions:['movement amounts','direction order','traveler setting'], preservedInvariants:['four orthogonal moves','return to start in two directions','sum of two return distances']},
  10:{transformedDimensions:['number range','selected count','quotient','numbered object'], preservedInvariants:['each number appears once','sum divides exactly by selected count','minimum selected number']},
  11:{transformedDimensions:['seat capacities','total furniture','last partial occupancy','setting'], preservedInvariants:['two furniture capacities','one final partially occupied larger unit','find larger-unit count']},
  12:{transformedDimensions:['nested corner','shaded diagonal','compared stages'], preservedInvariants:['recursive quartering','two diagonally opposite quarters newly shaded','area difference between stages']},
};

function sourcePathFor(no) {
  return no <= 8 ? SOURCE_PATHS[0] : SOURCE_PATHS[1];
}

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
    sourceLocator: sourcePathFor(no) + '#q' + no,
    reviewStatus: 'verified',
    releaseStatus: 'verified-student-wrong-practice',
    sourceComparison: {
      status: 'user-reviewed-variant',
      sourcePath: sourcePathFor(no),
      transformedDimensions: comparisons[no].transformedDimensions,
      preservedInvariants: comparisons[no].preservedInvariants,
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

q7.forEach((row, index) => {
  const variant = index + 1;
  const text = row.lead + ' ' + row.first + '는 ' + row.start + '쪽이고, ' + row.last + '는 ' + row.start + '에 쓰인 세 숫자를 한 번씩 사용해 만든 뒤쪽의 다른 쪽수입니다. ' + row.ask + '가 ' + row.limit + '페이지를 넘지 않을 때, ' + row.ask + '는 모두 몇 페이지일까요?';
  items.push(common(7, variant, {
    text, answer:row.answer + '페이지', acceptedAnswers:[row.answer + '페이지', String(row.answer)],
    area:'식의 계산', subarea:'연속수', detailType:'같은 세 숫자와 제한으로 마지막 쪽수 찾기',
    readingFocus:'마지막 쪽수는 첫 쪽수의 세 숫자를 한 번씩만 사용하며, 첫 쪽수보다 뒤에 있어야 합니다.',
    solutionSkill:'가능한 쪽수의 순서를 비교하고 처음과 끝을 모두 포함해 페이지 수 구하기',
    solutionSteps:[
      row.start + '의 세 숫자를 한 번씩 사용해 만들 수 있는 뒤쪽 쪽수를 작은 수부터 확인합니다.',
      '제한 안에 드는 마지막 쪽수는 ' + row.end + '쪽 하나뿐입니다.',
      row.end + '-' + row.start + '+1=' + row.answer + '이므로 모두 ' + row.answer + '페이지입니다.',
    ],
    meta:{start:row.start, limit:row.limit, validEnd:row.end, inclusiveCount:row.answer}, assetSpec:null,
    verification:{
      primary:{method:'세 숫자의 순열을 작은 수부터 비교',answer:row.answer+'페이지'},
      independent:{method:'모든 순열을 열거하고 제한·순서 조건으로 필터링',answer:row.answer+'페이지'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'첫 쪽수·숫자 사용 규칙·최대 페이지 수가 본문에 모두 보임'},
    },
  }));
});

q8.forEach((row, index) => {
  const variant = index + 1;
  const text = row.wording === 'natural'
    ? row.from + ' 이상 ' + row.to + ' 이하인 자연수 중에서 ' + row.divisor + '으로 나눌 때 나머지가 ' + row.remainder + '인 수의 합을 구하세요.'
    : row.wording === 'cards'
      ? row.from + '부터 ' + row.to + '까지 번호가 하나씩 쓰인 카드가 있습니다. 카드의 번호를 ' + row.divisor + '로 나눌 때 나머지가 ' + row.remainder + '인 카드의 번호를 모두 더하면 얼마입니까?'
      : row.from + '부터 ' + row.to + '까지의 수 중에서 ' + row.divisor + '로 나눌 때 나머지가 ' + row.remainder + '인 수를 모두 더하면 얼마입니까?';
  items.push(common(8, variant, {
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer)],
    area:'식의 계산', subarea:'나눗셈의 몫과 나머지', detailType:'범위 안에서 같은 나머지를 갖는 수의 합',
    readingFocus:'범위의 양 끝을 포함하고 조건에 맞는 수를 빠짐없이 찾습니다.',
    solutionSkill:'가장 작은 수부터 제수만큼 늘어나는 수열을 만들고 합 구하기',
    solutionSteps:[
      '조건에 맞는 수는 ' + row.values.join(', ') + '입니다.',
      '모두 ' + row.values.length + '개이고 처음과 끝의 합은 ' + row.values[0] + '+' + row.values.at(-1) + '=' + (row.values[0]+row.values.at(-1)) + '입니다.',
      '(' + row.values[0] + '+' + row.values.at(-1) + ')×' + row.values.length + '÷2=' + row.answer + '입니다.',
    ],
    meta:{from:row.from,to:row.to,divisor:row.divisor,remainder:row.remainder,matchingValues:row.values},assetSpec:null,
    verification:{
      primary:{method:'같은 나머지를 갖는 등차수열의 첫째항·끝항·항 수로 합 계산',answer:String(row.answer)},
      independent:{method:'범위의 모든 자연수를 직접 나누어 조건에 맞는 수를 합산',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'범위·제수·나머지가 본문에 모두 보임'},
    },
  }));
});

q9.forEach((row, index) => {
  const variant = index + 1;
  const returnValues = Object.values(row.returns);
  items.push(common(9, variant, {
    text:row.text, answer:String(row.answer), acceptedAnswers:[String(row.answer)],
    area:'수·규칙찾기', subarea:'방향과 이동', detailType:'이동 경로를 거꾸로 추적해 출발점으로 돌아가기',
    readingFocus:'동서 방향과 남북 방향의 이동을 각각 계산합니다.',
    solutionSkill:'서로 반대인 방향의 이동량을 상쇄한 뒤 돌아갈 두 거리의 합 구하기',
    solutionSteps:[
      '동쪽·서쪽 이동을 서로 빼고, 북쪽·남쪽 이동도 서로 뺍니다.',
      '출발점으로 돌아갈 두 거리는 ' + returnValues[0] + 'm와 ' + returnValues[1] + 'm입니다.',
      returnValues[0] + '+' + returnValues[1] + '=' + row.answer + '입니다.',
    ],
    meta:{moves:row.moves,returnMoves:row.returns},assetSpec:null,
    verification:{
      primary:{method:'동서·남북 순이동량을 각각 계산',answer:String(row.answer)},
      independent:{method:'좌표평면에서 시작점을 (0,0)으로 두고 네 이동을 순서대로 대입',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'네 이동 방향·거리와 돌아갈 두 방향이 본문에 모두 보임'},
    },
  }));
});

q10.forEach((row, index) => {
  const variant = index + 1;
  const subject = row.object === '공' ? row.max + '개의 공이' : row.max + '장의 ' + row.object + '가';
  const countObject = row.count + (row.object === '공' ? '개를' : '장을');
  const largest = Array.from({length:row.count-1}, (_, offset) => row.max-offset);
  const target = row.count*row.quotient;
  const text = '1부터 ' + row.max + '까지의 수가 각각 하나씩 적힌 ' + subject + ' 있습니다. 이 중 ' + countObject + ' 골라 적힌 수를 더한 뒤 ' + row.divideWord + ' 나누었더니 나누어떨어졌고, 몫은 ' + row.quotient + '이었습니다. 고른 ' + row.object + '에 적힌 수 중 가장 작은 수는 얼마입니까?';
  items.push(common(10, variant, {
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer)],
    area:'식의 계산', subarea:'우기기/가정하여 풀기', detailType:'합과 나눗셈 조건으로 가장 작은 수 구하기',
    readingFocus:'곱이 아니라 고른 수의 합을 고른 개수로 나눈 몫입니다.',
    solutionSkill:'수의 합을 구한 뒤 나머지 수들을 가장 크게 가정해 최소값 구하기',
    solutionSteps:[
      '고른 수의 합은 ' + row.count + '×' + row.quotient + '=' + target + '입니다.',
      '가장 작은 수를 최소로 하려면 나머지 ' + (row.count-1) + '개를 ' + largest.join(', ') + '로 가장 크게 잡습니다.',
      target + '-(' + largest.join('+') + ')=' + row.answer + '입니다.',
    ],
    meta:{maximum:row.max,selectedCount:row.count,quotient:row.quotient,targetSum:target,maximizedOthers:largest},assetSpec:null,
    verification:{
      primary:{method:'최대 가능한 나머지 수들을 대입해 가장 작은 수의 하한 계산',answer:String(row.answer)},
      independent:{method:'서로 다른 선택 수의 합 조건을 만족하는 경우를 열거해 최소 선택값 비교',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'수의 범위·선택 개수·나눗셈의 몫이 본문에 모두 보임'},
    },
  }));
});

q11.forEach((row, index) => {
  const variant = index + 1;
  const filledFurniture = row.total - 1;
  const seatedBeforeLast = row.people - row.last;
  const allSmallCapacity = row.small * filledFurniture;
  const capacityDifference = row.large - row.small;
  const fullLargeCount = (seatedBeforeLast - allSmallCapacity) / capacityDifference;
  const largeCount = fullLargeCount + 1;
  if (!Number.isInteger(largeCount) || largeCount !== row.largeCount) throw new Error('Q11-' + variant + ': invalid larger furniture count');
  const text = row.setting + '에 ' + row.smallName + '와 ' + row.largeName + '가 모두 ' + row.total + '개 있습니다. 사람들을 차례로 모두 앉혔더니 ' + row.people + '명이 앉았고, 마지막 ' + row.largeName + '에는 ' + row.last + '명만 앉았습니다. ' + row.largeName + '는 모두 몇 개입니까?';
  items.push(common(11, variant, {
    text, answer:largeCount + '개', acceptedAnswers:[largeCount + '개', String(largeCount)],
    area:'식의 계산', subarea:'우기기/가정하여 풀기', detailType:'두 종류 좌석의 수를 마지막 불완전 착석에서 역산하기',
    readingFocus:'마지막 큰 좌석 하나를 따로 빼고, 나머지 좌석은 모두 가득 찼다고 봅니다.',
    solutionSkill:'작은 좌석으로 모두 채웠다고 가정한 인원과 실제 인원의 차이를 좌석당 차이로 나누기',
    solutionSteps:[
      '마지막 ' + row.largeName + '를 빼면 ' + filledFurniture + '곳에 ' + seatedBeforeLast + '명이 앉았습니다.',
      '이를 모두 ' + row.smallName + '라고 보면 ' + allSmallCapacity + '명이고, 실제와의 차이는 ' + (seatedBeforeLast-allSmallCapacity) + '명입니다.',
      '가득 찬 큰 좌석은 ' + (seatedBeforeLast-allSmallCapacity) + '÷' + capacityDifference + '=' + fullLargeCount + '개이므로 마지막 좌석까지 모두 ' + largeCount + '개입니다.',
    ],
    meta:{smallCapacity:row.small,largeCapacity:row.large,totalFurniture:row.total,lastOccupancy:row.last,totalPeople:row.people,fullLargeCount,largeCount},assetSpec:null,
    verification:{
      primary:{method:'마지막 큰 좌석을 제외하고 작은 좌석으로 우겨 차이 계산',answer:largeCount+'개'},
      independent:{method:'두 종류 좌석 수의 연립 조건을 모든 정수 조합으로 열거',answer:largeCount+'개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'두 좌석의 정원·전체 수·총인원·마지막 좌석의 착석 수가 본문에 모두 보임'},
    },
  }));
});

function gcd(a, b) { while (b) { const rest = a % b; a = b; b = rest; } return a; }
function differenceArea(from, to) {
  const denominator = 4 ** to;
  let numerator = 0;
  for (let step = from + 1; step <= to; step += 1) numerator += 2 * (4 ** (to - step));
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}
function stageWord(stage) { return ({2:'두',4:'네',5:'다섯',6:'여섯'})[stage]; }

q12.forEach((row, index) => {
  const variant = index + 1;
  const answer = differenceArea(row.from, row.to);
  if (answer[0] !== row.answer[0] || answer[1] !== row.answer[1]) throw new Error('Q12-' + variant + ': invalid area fraction');
  const image = pngAsset('q12-v' + variant + '.png', '첫 번째부터 세 번째까지 한 모서리의 정사각형을 반복해 나누고 대각선 두 칸을 색칠한 규칙');
  const text = '정사각형을 그림과 같은 규칙으로 색칠했습니다. ' + stageWord(row.to) + ' 번째 도형에서 ' + stageWord(row.from) + ' 번째 도형보다 더 색칠한 부분은 전체의 얼마인지 분수로 나타내세요.';
  const terms = [];
  for (let step = row.from + 1; step <= row.to; step += 1) terms.push('2/' + (4 ** step));
  items.push(common(12, variant, Object.assign({
    text, answer:answer[0] + '/' + answer[1], acceptedAnswers:[answer[0] + '/' + answer[1]],
    area:'도형', subarea:'도형 분할과 넓이', detailType:'반복 분할에서 두 단계 사이 새로 색칠한 넓이',
    readingFocus:'각 단계에서 이어서 나눈 정사각형의 대각선 두 칸만 새로 색칠됩니다.',
    solutionSkill:'단계별 작은 정사각형 한 칸의 넓이와 새로 색칠한 두 칸의 넓이를 더하기',
    solutionSteps:[
      '한 단계가 늘 때 이어서 나누는 정사각형 한 칸의 넓이는 앞 단계의 1/4이 됩니다.',
      (row.from + 1) + '번째부터 ' + row.to + '번째까지 새로 색칠한 넓이는 ' + terms.join(' + ') + '입니다.',
      terms.join(' + ') + '=' + answer[0] + '/' + answer[1] + '입니다.',
    ],
    meta:{fromStage:row.from,toStage:row.to,activeCorner:row.active,shadedCorners:row.shade,addedAreaTerms:terms,answerFraction:answer},
    assetSpec:{kind:'recursive-quarter-shading',shownStages:[1,2,3],activeCorner:row.active,shadedCorners:row.shade,renderRules:{showAnswerFraction:false,showOnlyFirstThreeStages:true}},
    verification:{
      primary:{method:'각 단계에서 새로 색칠한 두 정사각형의 넓이를 분수로 합산',answer:answer[0]+'/'+answer[1]},
      independent:{method:'4진 격자 셀의 면적을 단계별로 열거해 두 도형의 색칠 넓이 차 계산',answer:answer[0]+'/'+answer[1]},
      unique:true,validAnswerCount:1,answerContract:'single-fraction',
      visibleEvidence:{passed:true,method:'첫 세 단계의 분할선·색칠 두 칸·계속 나뉘는 모서리가 모두 보임'},
    },
  }, image)));
});

const data = {
  version: '7.3.0', sourceSet: 'final', sourceRound: 7,
  freezePolicy: {runtimeGeneration: false, fixedItemCount: items.length, variantsPerSourceQuestion: 3, availableSourceNos: [5, 6, 7, 8, 9, 10, 11, 12], partialRelease: true},
  sourceFingerprints: Object.fromEntries(SOURCE_PATHS.map(sourcePath => [sourcePath, sha(fs.readFileSync(path.join(ROOT, sourcePath)))])),
  reviewSummary: {verified: items.length, pending: 0, unavailableSourceQuestions: 22},
  items,
};
const index = {
  version: data.version, sourceSet: data.sourceSet, sourceRound: data.sourceRound,
  availableSourceNos: data.freezePolicy.availableSourceNos,
  items: items.map(({id, sourceNo, genId, variantNo, reviewStatus, area, subarea, detailType, pointBand, text}) => ({id, sourceNo, genId, variantNo, reviewStatus, area, subarea, detailType, pointBand, text})),
};

fs.writeFileSync(path.join(DATA_DIR, 'final7-reviewed.json'), JSON.stringify(data, null, 2) + '\n');
fs.writeFileSync(path.join(DATA_DIR, 'final7-reviewed-index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('wrote ' + items.length + ' reviewed Final 7 variants');
