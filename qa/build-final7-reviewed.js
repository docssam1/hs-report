'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'bank', 'assets', 'final7');
const DATA_DIR = path.join(ROOT, 'bank', 'data');
const SOURCE_PATHS = ['materials/final_7/001.jpg', 'materials/final_7/002.jpg', 'materials/final_7/003.jpg', 'materials/final_7/004.jpg', 'materials/final_7/005.jpg', 'materials/final_7/006.jpg', 'materials/final_7/007.jpg', 'materials/final_7/008.jpg'];

const q1 = [
  {name:'민혁', object:'샤프심', total:60, floor:14, desk:3, place:'샤프심 통', answer:43},
  {name:'관호', object:'샤프심', total:72, floor:16, desk:5, place:'샤프심 통', answer:51},
  {name:'주연', object:'샤프심', total:80, floor:19, desk:4, place:'샤프심 통', answer:57},
];

const q2 = [
  {name:'유빈', mirror:'5시 20분', actual:'6시 40분', wake:'8시 10분', elapsed:90},
  {name:'유준', mirror:'4시 45분', actual:'7시 15분', wake:'9시', elapsed:105},
  {name:'서연', mirror:'6시 10분', actual:'5시 50분', wake:'8시 20분', elapsed:150},
];

const q3 = [
  {stage:5, counts:[25,12,4], answer:41},
  {stage:7, counts:[49,30,16,6,1], answer:102},
  {stage:8, counts:[64,42,25,12,4], answer:147},
];

const q4 = [
  {rows:9, cols:11, missing:15, answer:84},
  {rows:11, cols:12, missing:21, answer:111},
  {rows:10, cols:13, missing:24, answer:106},
];

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

const q13 = [
  {first:4,second:7,total:210,lastBlock:20,answerNumber:7,difference:10},
  {first:3,second:8,total:276,lastBlock:23,answerNumber:3,difference:12},
  {first:5,second:9,total:325,lastBlock:25,answerNumber:5,difference:13},
];

const q14 = [
  {labels:['A','B','C'],intro:'A, B, C라고 적힌 바구니가 있습니다.',container:'바구니',object:'구슬',objectSubject:'구슬이',gapAB:4,gapBC:4,repeat:30,finalA:2,moveAB:4,moveBC:3,moveCA:1,answer:[92,118,144]},
  {labels:['가','나','다'],intro:'가, 나, 다라고 적힌 통이 있습니다.',container:'통',object:'바둑돌',objectSubject:'바둑돌이',gapAB:5,gapBC:2,repeat:40,finalA:3,moveAB:5,moveBC:3,moveCA:2,answer:[123,198,156]},
  {labels:['빨강','파랑','초록'],intro:'빨강, 파랑, 초록 상자가 있습니다.',container:'상자',object:'카드',objectSubject:'카드가',gapAB:2,gapBC:5,repeat:25,finalA:4,moveAB:4,moveBC:2,moveCA:1,answer:[79,127,97]},
];

const q15 = [
  {rows:2,cols:6,target:102,path:[[1,1],[2,1],[2,2],[1,2],[1,3],[2,3],[2,4],[1,4],[1,5],[2,5],[2,6],[1,6]],answer:[2,51]},
  {rows:4,cols:4,target:197,path:[[1,1],[2,1],[3,1],[4,1],[4,2],[3,2],[2,2],[1,2],[1,3],[2,3],[3,3],[4,3],[4,4],[3,4],[2,4],[1,4]],answer:[4,50]},
  {rows:3,cols:6,target:250,path:[[1,1],[2,1],[3,1],[3,2],[2,2],[1,2],[1,3],[2,3],[3,3],[3,4],[2,4],[1,4],[1,5],[2,5],[3,5],[3,6],[2,6],[1,6]],answer:[3,84]},
];

const q16 = [
  {count:60,answer:45},
  {count:80,answer:105},
  {count:120,answer:117},
];

const q17 = [
  {mode:'source',light:144,answer:132},
  {mode:'reverse',dark:182,answer:196},
  {mode:'total',light:289,answer:561},
];

const q18 = [
  {intro:'나이가 서로 다른 민준, 서윤, 도윤 세 사람이 있습니다.',labels:['민준','서윤','도윤'],unit:'살',pairSums:[19,27,24],ask:'셋 중 나이가 가장 많은 사람은 누구이고, 몇 살입니까?',answer:'도윤 16살',values:[8,11,16]},
  {intro:'빨강, 파랑, 초록 세 바구니에 서로 다른 수의 공이 들어 있습니다.',labels:['빨강','파랑','초록'],unit:'개',pairSums:[24,27,21],ask:'공이 가장 많이 들어 있는 바구니는 어느 것이고, 몇 개입니까?',answer:'파랑 바구니 15개',values:[9,15,12],answerLabel:'파랑 바구니'},
  {intro:'가, 나, 다 세 학급이 서로 다른 수의 책을 모았습니다.',labels:['가 학급','나 학급','다 학급'],unit:'권',pairSums:[24,27,31],ask:'책을 가장 많이 모은 학급은 어디이고, 몇 권입니까?',answer:'다 학급 17권',values:[14,10,17]},
];

const q19 = [
  {lead:'서연이가 봉사 행사에 가져온 리본을 다섯 개의 체험 부스에 차례로 나누어 주었습니다.',object:'리본',receivers:'부스',count:5,extra:2,left:3,unit:'개',answer:220},
  {lead:'용준이가 주운 밤을 집으로 가져오는 길에 여섯 명의 친구를 차례로 만났습니다.',object:'밤',receivers:'친구',count:6,extra:1,left:2,unit:'개',answer:254},
  {lead:'유민이가 모은 카드를 네 명의 동생에게 차례로 나누어 주었습니다.',object:'카드',receivers:'동생',count:4,extra:3,left:1,unit:'장',answer:106},
];

const q20 = [
  {giver:'현우',people:5,peopleName:'친구',object:'찰흙',total:960,target:5,unit:'g',answer:162},
  {giver:'하린',people:5,peopleName:'친구',object:'색모래',total:1600,target:5,unit:'g',answer:270},
  {giver:'선우',people:6,peopleName:'친구',object:'밀가루',total:1920,target:6,unit:'g',answer:290},
];

const q21 = [
  {first:'1',last:'2',answer:54,product:175392},
  {first:'4',last:'0',answer:76,product:474240},
  {first:'8',last:'8',answer:92,product:830208},
];

const q22 = [
  {intro:'어느 초등학교 운동장에 각 학년 학생들이 모여 있습니다.',a:'5학년',b:'6학년',notB:168,notA:132,sumAB:140,answer:80},
  {intro:'한 학교의 학생들이 여러 동아리 중 하나에 참여하고 있습니다.',a:'미술 동아리',b:'과학 동아리',notB:155,notA:125,sumAB:130,answer:75},
  {intro:'체육 대회에 참가한 학생들이 종목별로 모여 있습니다.',a:'축구 종목',b:'수영 종목',notB:174,notA:146,sumAB:160,answer:80},
];

const q23 = [
  {lower:200,answer:259},
  {lower:400,answer:439},
  {lower:700,answer:709},
];

const q24 = [
  {people:'농부',work:'잔디밭의 풀을 깎으려고 합니다',large:'큰 잔디밭',small:'작은 잔디밭',last:2,answer:8},
  {people:'화가',work:'두 벽에 그림을 그리려고 합니다',large:'큰 벽',small:'작은 벽',last:3,answer:12},
  {people:'작업자',work:'두 운동장의 흰 선을 새로 칠하려고 합니다',large:'큰 운동장',small:'작은 운동장',last:4,answer:16},
];

const q25 = [
  {names:['서연','용준','유민','현우'],activity:'밤을 주웠습니다',object:'밤',extra:12,total:68,answer:4},
  {names:['민혁','관호','주연','유빈'],activity:'우표를 모았습니다',object:'우표',extra:10,total:80,answer:5},
  {names:['유준','채연','하영','지유'],activity:'조개를 주웠습니다',object:'조개',extra:17,total:101,answer:6},
];

const q26 = [
  {name:'관호',reference:2026,cutoff:2024,leapAnchor:2024,direction:'past',answer:2015},
  {name:'주연',reference:2027,cutoff:2025,leapAnchor:2024,direction:'past',answer:2021},
  {name:'유빈',reference:2029,cutoff:2031,leapAnchor:2032,direction:'future',answer:2035},
];

const q27 = [
  {subject:'세균의 수',factor:10,target:500000,answer:6},
  {subject:'소식을 들은 사람 수',factor:20,target:2000000,answer:5},
  {subject:'컴퓨터 바이러스에 감염된 파일 수',factor:100,target:50000000,answer:4},
];

const q28 = [
  {targetSum:146,answer:24},
  {targetSum:200,answer:33},
  {targetSum:260,answer:43},
];

const q29 = [
  {horizontal:3,vertical:3,numbers:[1,3,5,7,9],answer:24},
  {horizontal:5,vertical:3,numbers:[1,3,5,7,9,11,15],answer:144},
  {horizontal:7,vertical:3,numbers:[1,3,5,7,9,11,13,15,21],answer:1440},
];

const q30 = [
  {students:150,answer:128},
  {students:350,answer:256},
  {students:90,answer:64},
];

const comparisons = {
  1: {transformedDimensions:['object','total count','visible arrangement','separate count'], preservedInvariants:['whole minus visible groups','one hidden remainder','no count labels in the picture']},
  2: {transformedDimensions:['mirror-clock time','wake time'], preservedInvariants:['read mirror image first','find actual time','calculate elapsed minutes']},
  3: {transformedDimensions:['target stage'], preservedInvariants:['odd-width stair-step square arrangement','count every axis-aligned square size','no answer marks']},
  4: {transformedDimensions:['rectangle dimensions','missing-star regions'], preservedInvariants:['complete rectangular array minus missing positions','all visible stars are countable','no missing-count labels']},
  5: {transformedDimensions:['hex-cell arrangement','start/end position'], preservedInvariants:['adjacent-hex path counting','two first moves','no answer marks']},
  6: {transformedDimensions:['rope crossings','fish order and direction'], preservedInvariants:['one continuous rope','trace from front to back','no answer marks']},
  7: {transformedDimensions:['page numbers','maximum page count','book activity'], preservedInvariants:['same three digits used once','later page','inclusive consecutive-page count']},
  8: {transformedDimensions:['number range','divisor','remainder','setting'], preservedInvariants:['inclusive range','one fixed remainder class','sum of every matching number']},
  9: {transformedDimensions:['movement amounts','direction order','traveler setting'], preservedInvariants:['four orthogonal moves','return to start in two directions','sum of two return distances']},
  10:{transformedDimensions:['number range','selected count','quotient','numbered object'], preservedInvariants:['each number appears once','sum divides exactly by selected count','minimum selected number']},
  11:{transformedDimensions:['seat capacities','total furniture','last partial occupancy','setting'], preservedInvariants:['two furniture capacities','one final partially occupied larger unit','find larger-unit count']},
  12:{transformedDimensions:['nested corner','shaded diagonal','compared stages'], preservedInvariants:['recursive quartering','two diagonally opposite quarters newly shaded','area difference between stages']},
  13:{transformedDimensions:['two digits','total term count','last complete block'], preservedInvariants:['alternating digit blocks','block lengths increase by one','compare the two digit counts']},
  14:{transformedDimensions:['container labels','objects','initial gaps','transfer amounts','repeat count'], preservedInvariants:['three containers','cyclic transfers','reverse from final first-container count','report one initial and two final counts']},
  15:{transformedDimensions:['grid height and width','non-repeating arrow path','target position'], preservedInvariants:['one arrow move per square','periodic horizontal continuation','find row and column of a distant term']},
  16:{transformedDimensions:['number of cards'], preservedInvariants:['discard top two cards','move the next card to the bottom','stop with exactly two cards','add the final card numbers']},
  17:{transformedDimensions:['object material','figure arrangement','given color and requested quantity'], preservedInvariants:['center n by n array','two outer groups total n times n minus 1','first three stages visible without answer marks']},
  18:{transformedDimensions:['people or object setting','labels','three pair sums'], preservedInvariants:['three distinct values','all three pair sums','find the largest label and value']},
  19:{transformedDimensions:['character','shared object','recipient count','extra amount','final remainder'], preservedInvariants:['give half of the current amount plus a fixed extra','repeat the same action','reverse from the final remainder']},
  20:{transformedDimensions:['character','shared material','total amount','recipient count'], preservedInvariants:['original plan is equal sharing','actual sharing repeatedly halves the remainder','compare the target recipient with the equal share']},
  21:{transformedDimensions:['visible first digit','visible last digit','consecutive even factors'], preservedInvariants:['six-digit product pattern','three consecutive even numbers','find the smallest factor','exactly one valid factor triple']},
  22:{transformedDimensions:['school grouping context','two named groups','complement counts','two-group total'], preservedInvariants:['all students belong to one category','two complement counts','sum of the two target groups','find everyone outside both groups']},
  23:{transformedDimensions:['lower bound of the three-digit range'], preservedInvariants:['digit sum divisible by eight before adding one','digit sum divisible by eight after adding one','find the least valid number','exhaustive range verification']},
  24:{transformedDimensions:['worker role','work setting','third-day worker count'], preservedInvariants:['larger job is twice the smaller job','all workers on larger job on day one','equal groups on day two','one group finishes each remaining job']},
  25:{transformedDimensions:['characters','collected object','fixed excess','total count'], preservedInvariants:['second count is twice first','third count is twice second','fourth exceeds the other three combined','find the first count']},
  26:{transformedDimensions:['character','reference year','search cutoff','past or future direction'], preservedInvariants:['same leap status','same weekday for every date','nearest valid year on the requested side','leap-year anchor is stated']},
  27:{transformedDimensions:['growing subject','weekly multiplier','target threshold'], preservedInvariants:['start from one','same multiplier every week','find the first week reaching or exceeding the target','power growth']},
  28:{transformedDimensions:['target neighbor sum','hidden cell position'], preservedInvariants:['consecutive natural numbers in centered triangular rows','exclude the selected cell','sum only edge-sharing cells','exactly one valid hidden number','original example image retained']},
  29:{transformedDimensions:['number of cells','numbers placed','horizontal arm length'], preservedInvariants:['one shared center cell','use every number exactly once','equal horizontal and vertical sums','different positions count separately']},
  30:{transformedDimensions:['initial student count'], preservedInvariants:['keep even-numbered students','renumber from one after every round','repeat until one student remains','report the original number']},
};

function sourcePathFor(no) {
  return no <= 4 ? SOURCE_PATHS[0] : no <= 8 ? SOURCE_PATHS[1] : no <= 12 ? SOURCE_PATHS[2] : no <= 16 ? SOURCE_PATHS[3] : no <= 20 ? SOURCE_PATHS[4] : no <= 24 ? SOURCE_PATHS[5] : no <= 28 ? SOURCE_PATHS[6] : SOURCE_PATHS[7];
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
q1.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q01-v' + variant + '.png', '바닥에 쏟아져 일부가 서로 교차한 샤프심');
  const code=row.name.charCodeAt(row.name.length-1)-0xAC00;
  const subject=row.name+(code>=0&&code<=11171&&code%28?'이가':'가');
  items.push(common(1, variant, Object.assign({
    text: subject + ' ' + row.object + ' ' + row.total + '개를 정리하고 있습니다. 그림은 바닥에 쏟아진 ' + row.object + '을 나타냅니다. 책상 위에는 ' + row.desk + '개가 있습니다. 나머지는 모두 ' + row.place + ' 안에 있다면, ' + row.place + ' 안에는 몇 개가 있습니까?',
    answer: row.answer + '개', acceptedAnswers:[row.answer + '개', String(row.answer)],
    area:'식의 계산', subarea:'뺄셈', detailType:'전체에서 그림 속 수와 따로 있는 수를 빼기',
    readingFocus:'그림 속 물건을 한 개씩 세고, 책상 위의 수까지 전체에서 뺍니다.',
    solutionSkill:'전체 수에서 두 곳에 보이는 수를 차례로 빼어 보이지 않는 나머지 구하기',
    solutionSteps:[
      '그림 속 ' + row.object + '은 ' + row.floor + '개입니다.',
      '이미 보이는 수는 ' + row.floor + '+' + row.desk + '=' + (row.floor + row.desk) + '개입니다.',
      row.total + '-' + (row.floor + row.desk) + '=' + row.answer + '이므로 ' + row.place + ' 안에는 ' + row.answer + '개가 있습니다.',
    ],
    meta:{object:row.object,totalCount:row.total,pictureCount:row.floor,separateCount:row.desk,hiddenCount:row.answer},
    assetSpec:{kind:'spilled-pencil-leads',objectCount:row.floor,renderRules:{showCount:false,allowOverlap:true,clusteredToOneSide:true,equalLength:true,equalThickness:true,minimumInteriorCrossings:8,oneLeadMinimumCrossings:4}},
    verification:{
      primary:{method:'전체에서 그림 속 수와 책상 위 수를 차례로 뺌',answer:row.answer+'개'},
      independent:{method:'PNG 생성 입력의 물건 수를 다시 세고 total-picture-separate 계산',answer:row.answer+'개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'샤프심이 모두 화면 안에 있고 일부는 교차하지만 각 샤프심의 양 끝을 따라 셀 수 있음'},
    },
  }, image)));
});

q2.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q02-v' + variant + '.png', '거울에 비친 아날로그 시계의 시침과 분침');
  items.push(common(2, variant, Object.assign({
    text: row.name + '이가 자다가 잠깐 깨어 거울에 비친 시계를 보니 그림과 같았습니다. 다시 잠들었다가 오전 ' + row.wake + '에 일어났다면, 다시 잠든 뒤 몇 분 만에 일어난 것입니까?',
    answer: row.elapsed + '분', acceptedAnswers:[row.elapsed + '분', String(row.elapsed)],
    area:'측정', subarea:'시각과 시간', detailType:'거울에 비친 시각을 실제 시각으로 고쳐 지난 시간 구하기',
    readingFocus:'그림은 실제 시계가 아니라 거울에 비친 모습입니다.',
    solutionSkill:'거울 속 시각을 좌우로 되돌려 실제 시각을 찾은 뒤 기상 시각까지의 시간 계산하기',
    solutionSteps:[
      '거울에 비친 시계는 ' + row.mirror + '를 나타냅니다.',
      '좌우를 되돌린 실제 시각은 오전 ' + row.actual + '입니다.',
      row.actual + '부터 ' + row.wake + '까지는 ' + row.elapsed + '분입니다.',
    ],
    meta:{mirrorTime:row.mirror,actualTime:row.actual,wakeTime:row.wake,elapsedMinutes:row.elapsed},
    assetSpec:{kind:'mirror-analog-clock',mirrorTime:row.mirror,renderRules:{showActualTime:false,showElapsedMinutes:false}},
    verification:{
      primary:{method:'11시 60분에서 거울 시각을 빼 실제 시각을 찾고 경과 시간 계산',answer:row.elapsed+'분'},
      independent:{method:'시침·분침 각도를 좌우 반사해 실제 분 수를 다시 계산',answer:row.elapsed+'분'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'시침과 분침이 서로 구분되고 시침이 분침 위치에 맞게 눈금 사이에 놓임'},
    },
  }, image)));
});

q3.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q03-v' + variant + '.png', '단위 정사각형이 아래층부터 홀수 개씩 놓인 계단형 성냥개비 배열');
  items.push(common(3, variant, Object.assign({
    text: '성냥개비로 그림과 같이 정사각형을 층층이 만들었습니다. 그림은 ' + row.stage + '번째 모양입니다. 이 모양에서 찾을 수 있는 크고 작은 정사각형은 모두 몇 개입니까?',
    answer: row.answer + '개', acceptedAnswers:[row.answer + '개', String(row.answer)],
    area:'도형', subarea:'도형 세기', detailType:'계단형 성냥개비 배열에서 크고 작은 정사각형의 개수',
    readingFocus:'가장 작은 정사각형뿐 아니라 여러 칸을 합친 큰 정사각형도 셉니다.',
    solutionSkill:'정사각형의 한 변 길이에 따라 나누어 세고 모두 더하기',
    solutionSteps:[
      '한 변이 한 칸인 정사각형은 ' + row.counts[0] + '개입니다.',
      '더 큰 정사각형을 한 변 길이별로 세면 ' + row.counts.slice(1).join(', ') + '개입니다.',
      row.counts.join('+') + '=' + row.answer + '이므로 모두 ' + row.answer + '개입니다.',
    ],
    meta:{stage:row.stage,countsBySide:row.counts,totalSquareCount:row.answer},
    assetSpec:{kind:'odd-row-square-staircase',stage:row.stage,renderRules:{showCount:false,axisAlignedOnly:true}},
    verification:{
      primary:{method:'한 변 길이별 정사각형 수를 나누어 합산',answer:row.answer+'개'},
      independent:{method:'단위 칸 점유 격자에서 가능한 모든 정사각형의 네 변을 전수 확인',answer:row.answer+'개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'모든 수평·수직 선분이 끊김 없이 보이고 회전 정사각형은 생기지 않음'},
    },
  }, image)));
});

q4.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q04-v' + variant + '.png', '일부 자리가 비어 있는 직사각형 별 배열');
  items.push(common(4, variant, Object.assign({
    text: '별을 직사각형 모양으로 빈틈없이 놓으려 했습니다. 그림처럼 아직 놓지 못한 자리가 있을 때, 이미 놓인 별은 모두 몇 개입니까?',
    answer: row.answer + '개', acceptedAnswers:[row.answer + '개', String(row.answer)],
    area:'식의 계산', subarea:'곱셈과 뺄셈', detailType:'직사각형 전체 자리에서 빈 자리를 빼어 도형의 개수 구하기',
    readingFocus:'완성된 직사각형의 전체 자리와 그림의 빈 자리를 따로 셉니다.',
    solutionSkill:'가로와 세로를 곱한 전체 수에서 비어 있는 자리 수 빼기',
    solutionSteps:[
      '모든 자리에 별을 놓으면 ' + row.cols + '×' + row.rows + '=' + (row.cols*row.rows) + '개입니다.',
      '그림에서 비어 있는 자리는 모두 ' + row.missing + '개입니다.',
      (row.cols*row.rows) + '-' + row.missing + '=' + row.answer + '이므로 이미 놓인 별은 ' + row.answer + '개입니다.',
    ],
    meta:{rows:row.rows,columns:row.cols,totalPositions:row.rows*row.cols,missingPositions:row.missing,visibleStars:row.answer},
    assetSpec:{kind:'incomplete-symbol-rectangle',rows:row.rows,columns:row.cols,missingPositions:row.missing,renderRules:{showMissingCount:false,showGroupingMarks:false}},
    verification:{
      primary:{method:'전체 자리에서 빈 자리 수를 뺌',answer:row.answer+'개'},
      independent:{method:'PNG 생성 점유 격자의 별 위치를 직접 집계',answer:row.answer+'개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'별이 모두 분리되어 보이고 빈 영역에 개수·괄호·풀이 표시는 없음'},
    },
  }, image)));
});

q5.forEach((row, index) => {
  const variant = index + 1;
  const image = pngAsset('q05-v' + variant + '.png', '서로 맞닿은 육각형 칸과 X·Y가 표시된 길 찾기 게임판');
  items.push(common(5, variant, Object.assign({
    text: row.text + ' (변을 함께 쓰는 이웃한 칸으로만 움직이며, 한 번 지난 칸은 다시 지나지 않습니다.)',
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

function sequencePrefix(first, second, count) {
  const values = [];
  for (let block = 1; values.length < count; block += 1) {
    const value = block % 2 ? first : second;
    for (let index = 0; index < block && values.length < count; index += 1) values.push(value);
  }
  return values;
}
function blockCounts(lastBlock) {
  let firstCount = 0;
  let secondCount = 0;
  for (let block = 1; block <= lastBlock; block += 1) {
    if (block % 2) firstCount += block;
    else secondCount += block;
  }
  return {firstCount, secondCount};
}
function numberSubject(number) { return number + ([3, 6, 7, 8].includes(number % 10) ? '이' : '가'); }

q13.forEach((row, index) => {
  const variant = index + 1;
  const total = row.lastBlock * (row.lastBlock + 1) / 2;
  const counts = blockCounts(row.lastBlock);
  const answerNumber = counts.firstCount > counts.secondCount ? row.first : row.second;
  const difference = Math.abs(counts.firstCount - counts.secondCount);
  if (total !== row.total || answerNumber !== row.answerNumber || difference !== row.difference) throw new Error('Q13-' + variant + ': invalid alternating block count');
  const prefix = sequencePrefix(row.first, row.second, 15);
  const text = '다음과 같은 규칙으로 숫자 ' + row.first + ', ' + row.second + '를 모두 ' + row.total + '개 나열했습니다. 어느 숫자가 몇 개 더 많습니까? 나열된 수의 처음 부분은 ' + prefix.join(', ') + ', …입니다.';
  const answer = numberSubject(answerNumber) + ' ' + difference + '개';
  items.push(common(13, variant, {
    text, answer, acceptedAnswers:[answer, answerNumber + ',' + difference, answerNumber + ' ' + difference], pointBand:'3.4',
    area:'수·규칙찾기', subarea:'군수열/묶음수열', detailType:'한 개씩 길어지는 두 숫자 묶음의 개수 비교',
    readingFocus:'첫째 묶음부터 길이가 1개씩 늘고, 두 숫자가 묶음마다 번갈아 나옵니다.',
    solutionSkill:'전체 개수를 삼각수로 나타내 마지막 묶음을 찾고 홀수·짝수 번째 묶음의 길이 합 비교하기',
    solutionSteps:[
      '1+2+⋯+' + row.lastBlock + '=' + row.total + '이므로 ' + row.lastBlock + '번째 묶음까지 들어갑니다.',
      '홀수 번째 묶음의 ' + row.first + '은 ' + counts.firstCount + '개이고, 짝수 번째 묶음의 ' + row.second + '는 ' + counts.secondCount + '개입니다.',
      '따라서 ' + numberSubject(answerNumber) + ' ' + difference + '개 더 많습니다.',
    ],
    meta:{firstNumber:row.first,secondNumber:row.second,totalTerms:row.total,lastCompleteBlock:row.lastBlock,firstNumberCount:counts.firstCount,secondNumberCount:counts.secondCount,answerNumber,difference,shownPrefix:prefix},assetSpec:null,
    verification:{
      primary:{method:'삼각수로 마지막 완성 묶음을 찾고 홀수·짝수 번째 묶음의 길이를 각각 합산',answer},
      independent:{method:'첫째 항부터 전체 항까지 묶음 규칙을 직접 생성해 두 숫자의 개수를 집계',answer},
      unique:true,validAnswerCount:1,answerContract:'number-and-count',
      visibleEvidence:{passed:true,method:'두 숫자·전체 항 수·처음 다섯 묶음의 배열이 본문에 모두 보임'},
    },
  }));
});

q14.forEach((row, index) => {
  const variant = index + 1;
  const [a, b, c] = row.labels;
  const netA = -row.moveAB + row.moveCA;
  const netB = row.moveAB - row.moveBC;
  const netC = row.moveBC - row.moveCA;
  const initialA = row.finalA - netA * row.repeat;
  const initialB = initialA - row.gapAB;
  const initialC = initialB - row.gapBC;
  const finalB = initialB + netB * row.repeat;
  const finalC = initialC + netC * row.repeat;
  const answerValues = [initialA, finalB, finalC];
  if (answerValues.some((value, answerIndex) => value !== row.answer[answerIndex])) throw new Error('Q14-' + variant + ': invalid cyclic-transfer answer');
  const text = row.intro + ' 처음에 ' + a + ' ' + row.container + '에는 ' + b + ' ' + row.container + '보다 ' + row.objectSubject + ' ' + row.gapAB + '개 더 많고, ' + b + ' ' + row.container + '에는 ' + c + ' ' + row.container + '보다 ' + row.gapBC + '개 더 많습니다. ' + a + '에서 ' + b + '로 ' + row.moveAB + '개, ' + b + '에서 ' + c + '로 ' + row.moveBC + '개, ' + c + '에서 ' + a + '로 ' + row.moveCA + '개를 옮기는 일을 ' + row.repeat + '번 반복했더니 ' + a + ' ' + row.container + '에 ' + row.objectSubject + ' ' + row.finalA + '개 남았습니다. ' + a + ' ' + row.container + '에 처음 들어 있던 ' + row.object + '의 개수와 ' + b + ', ' + c + ' ' + row.container + '에 마지막에 남아 있는 ' + row.object + '의 개수를 각각 구하세요.';
  const answer = initialA + '개, ' + finalB + '개, ' + finalC + '개';
  items.push(common(14, variant, {
    text, answer, acceptedAnswers:[answer, answerValues.join(','), answerValues.join(', ')], pointBand:'3.4',
    area:'식의 계산', subarea:'거꾸로 생각하기', detailType:'세 곳 사이의 반복 이동을 거꾸로 계산하기',
    readingFocus:'세 번의 이동을 한 묶음으로 보고 각 곳의 수가 한 번에 얼마나 변하는지 계산합니다.',
    solutionSkill:'첫째 곳의 마지막 수에서 처음 수를 역산한 뒤 처음 관계와 반복 순변화로 나머지 두 곳의 마지막 수 구하기',
    solutionSteps:[
      '한 번 반복할 때 ' + a + '는 ' + (-netA) + '개 줄고, ' + b + '는 ' + netB + '개 늘며, ' + c + '는 ' + netC + '개 늘어납니다.',
      a + '는 모두 ' + (-netA) + '×' + row.repeat + '=' + (-netA * row.repeat) + '개 줄었으므로 처음에는 ' + row.finalA + '+' + (-netA * row.repeat) + '=' + initialA + '개였습니다.',
      '처음 ' + b + '는 ' + initialB + '개, ' + c + '는 ' + initialC + '개이므로 마지막에는 각각 ' + finalB + '개, ' + finalC + '개입니다.',
    ],
    meta:{labels:row.labels,initialGaps:[row.gapAB,row.gapBC],transfers:[row.moveAB,row.moveBC,row.moveCA],repeatCount:row.repeat,finalFirst:row.finalA,netChange:[netA,netB,netC],initialCounts:[initialA,initialB,initialC],finalCounts:[row.finalA,finalB,finalC]},assetSpec:null,
    verification:{
      primary:{method:'한 번의 순변화량으로 첫째 곳의 처음 수를 역산한 뒤 나머지 수 계산',answer},
      independent:{method:'초기 세 수에서 주어진 이동 세 단계를 반복 횟수만큼 직접 모의 실행',answer},
      unique:true,validAnswerCount:1,answerContract:'ordered-triple',
      visibleEvidence:{passed:true,method:'처음 두 차이·세 이동량·반복 횟수·첫째 곳의 마지막 수가 본문에 모두 보임'},
    },
  }));
});

function arrowDirection(from, to) {
  const rowGap = Math.abs(from[0] - to[0]);
  const columnGap = Math.abs(from[1] - to[1]);
  if (rowGap + columnGap !== 1) throw new Error('Q15: arrow path must move to one adjacent square');
}

function validateArrowPath(row) {
  if (row.path.length !== row.rows * row.cols) throw new Error('Q15: path must visit every square exactly once');
  if (new Set(row.path.map((point) => point.join(','))).size !== row.path.length) throw new Error('Q15: path returns to a visited square');
  row.path.forEach(([pathRow, column]) => {
    if (pathRow < 1 || pathRow > row.rows || column < 1 || column > row.cols) throw new Error('Q15: path leaves the grid');
  });
  for (let step = 0; step < row.path.length - 1; step += 1) arrowDirection(row.path[step], row.path[step + 1]);
  arrowDirection(row.path.at(-1), [row.path[0][0], row.path[0][1] + row.cols]);
}

function arrowPosition(row, position) {
  const period = row.path.length;
  const block = Math.floor((position - 1) / period);
  const step = (position - 1) % period;
  return [row.path[step][0], block * row.cols + row.path[step][1]];
}

q15.forEach((row, index) => {
  const variant = index + 1;
  validateArrowPath(row);
  const first = arrowPosition(row, 1);
  const sixth = arrowPosition(row, 6);
  const answerPosition = arrowPosition(row, row.target);
  if (answerPosition[0] !== row.answer[0] || answerPosition[1] !== row.answer[1]) throw new Error('Q15-' + variant + ': invalid arrow position');
  const period = row.path.length;
  const completeBlocks = Math.floor((row.target - 1) / period);
  const step = (row.target - 1) % period + 1;
  const image = pngAsset('q15-v' + variant + '.png', row.rows + '행 격자에서 같은 칸을 다시 지나지 않고 다음 묶음으로 이어지는 반복 화살표');
  const text = '정사각형 칸에서 화살표 방향으로 한 칸씩 나아갑니다. 첫 번째 칸의 위치를 (' + first[0] + ', ' + first[1] + '), 여섯 번째 칸의 위치를 (' + sixth[0] + ', ' + sixth[1] + ')이라고 할 때, ' + row.target + '번째 칸의 위치를 구하세요.';
  const answer = '(' + answerPosition[0] + ', ' + answerPosition[1] + ')';
  items.push(common(15, variant, Object.assign({
    text, answer, acceptedAnswers:[answer, answerPosition.join(','), answerPosition.join(', ')], pointBand:'3.4',
    area:'수·규칙찾기', subarea:'규칙과 위치', detailType:'반복되는 화살표 이동에서 먼 칸의 위치 찾기',
    readingFocus:'한 묶음 안에서는 같은 칸을 다시 지나지 않고, 마지막 화살표는 오른쪽의 다음 묶음으로 이어집니다.',
    solutionSkill:'한 묶음의 칸 수로 나누어 묶음 수와 묶음 안의 차례를 찾기',
    solutionSteps:[
      '화살표 ' + period + '개가 한 묶음이고, 한 묶음이 끝날 때마다 오른쪽으로 ' + row.cols + '열 이동합니다.',
      row.target + '번째는 완성된 ' + completeBlocks + '묶음 뒤의 ' + step + '번째 칸입니다.',
      step + '번째 칸의 묶음 안 위치에 오른쪽 이동을 더하면 ' + answer + '입니다.',
    ],
    learnerFit:{gateId:'learner-fit',status:'pass',learnerStage:'초등 선발 대비 최종 모의고사 수강생',language:'원문과 같은 수준의 짧은 문장',responseMode:'행과 열을 순서쌍으로 답하기'},
    meta:{rows:row.rows,columnsPerBlock:row.cols,path:row.path,targetPosition:row.target,firstPosition:first,sixthPosition:sixth,completeBlocks,stepInBlock:step,answerPosition},
    assetSpec:{kind:'periodic-arrow-grid',rows:row.rows,columnsPerBlock:row.cols,path:row.path,shownBlocks:2,renderRules:{showAnswerPosition:false,repeatHorizontally:true,revisitWithinBlock:false}},
    verification:{
      primary:{method:'한 묶음의 칸 수로 나눠 묶음 안 차례와 오른쪽 이동 열 수 계산',answer},
      independent:{method:'첫째 칸부터 목표 차례까지 화살표 경로를 직접 반복 생성',answer},
      unique:true,validAnswerCount:1,answerContract:'ordered-pair',
      visibleEvidence:{passed:true,method:'격자 행·열 번호, 첫째·여섯째 칸, 모든 화살표 방향이 보이며 같은 칸 재방문 없음'},
    },
  }, image)));
});

function simulateCards(count) {
  const cards = Array.from({length:count}, (_, index) => index + 1);
  let lastFour = [];
  while (cards.length > 2) {
    cards.shift();
    cards.shift();
    if (cards.length > 2) cards.push(cards.shift());
    if (cards.length === 4) lastFour = cards.slice();
  }
  return {lastFour,lastTwo:cards.slice(),sum:cards[0] + cards[1]};
}

q16.forEach((row, index) => {
  const variant = index + 1;
  const result = simulateCards(row.count);
  if (result.sum !== row.answer || result.lastFour.length !== 4 || result.lastTwo.length !== 2) throw new Error('Q16-' + variant + ': invalid final cards');
  const text = '1부터 ' + row.count + '까지의 자연수가 적힌 카드 ' + row.count + '장을 위에서부터 차례대로 쌓았습니다. 위에서부터 2장을 버리고, 그다음 1장을 맨 밑으로 놓는 일을 카드가 2장 남을 때까지 반복합니다. 마지막에 남는 2장의 카드에 적힌 수의 합을 구하세요.';
  items.push(common(16, variant, {
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer)], pointBand:'3.4',
    area:'수·규칙찾기', subarea:'규칙과 과정', detailType:'카드 버리기와 옮기기를 반복한 뒤 남는 두 수의 합',
    readingFocus:'매번 위의 두 장을 먼저 버린 다음, 바로 다음 한 장을 맨 밑으로 옮깁니다.',
    solutionSkill:'카드의 위쪽 순서를 유지하며 버림·버림·옮김을 두 장이 남을 때까지 반복하기',
    solutionSteps:[
      '카드의 맨 위를 기준으로 버림·버림·맨 밑으로 옮김을 같은 순서로 반복합니다.',
      '카드가 4장 남았을 때의 위에서부터 순서는 ' + result.lastFour.join(', ') + '입니다.',
      '여기서 위의 두 장을 버리면 ' + result.lastTwo.join(', ') + '가 남으므로 합은 ' + result.lastTwo[0] + '+' + result.lastTwo[1] + '=' + result.sum + '입니다.',
    ],
    meta:{cardCount:row.count,discardCount:2,moveCount:1,stopCount:2,lastFour:result.lastFour,lastTwo:result.lastTwo},
    assetSpec:null,
    verification:{
      primary:{method:'카드 순서를 표로 줄여 마지막 네 장과 두 장을 확인',answer:String(row.answer)},
      independent:{method:'큐에 1부터 전체 카드 수까지 넣고 버림·버림·뒤로 보내기를 직접 모의 실행',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'처음 카드 순서·버리는 장수·옮기는 장수·멈추는 장수가 본문에 모두 보임'},
    },
  }));
});

q17.forEach((row, index) => {
  const variant = index + 1;
  let stage;
  let light;
  let dark;
  let answer;
  let text;
  let detailType;
  let solutionSteps;
  if (row.mode === 'reverse') {
    stage = (1 + Math.sqrt(1 + 4 * row.dark)) / 2;
    dark = row.dark;
    light = stage * stage;
    answer = light;
    if (!Number.isInteger(stage) || stage * (stage - 1) !== dark || answer !== row.answer) throw new Error('Q17-' + variant + ': invalid reverse count');
    text = '흰색 정사각형 타일과 검은색 정사각형 타일을 각 단계별로 다음 그림과 같은 규칙으로 놓았습니다. 어떤 단계에서 검은색 타일이 ' + dark + '개였다면, 흰색 타일은 몇 개인지 구하세요.';
    detailType = '바깥 계단 배열 수에서 가운데 정사각형 배열 수 찾기';
    solutionSteps = [
      '검은색 타일 수는 단계 수와 그보다 1 작은 수의 곱입니다.',
      stage + '×' + (stage - 1) + '=' + dark + '이므로 ' + stage + '단계입니다.',
      '흰색 타일은 ' + stage + '×' + stage + '=' + light + '개입니다.',
    ];
  } else {
    stage = Math.sqrt(row.light);
    light = row.light;
    dark = stage * (stage - 1);
    answer = row.mode === 'total' ? light + dark : dark;
    if (!Number.isInteger(stage) || answer !== row.answer) throw new Error('Q17-' + variant + ': invalid stage count');
    if (row.mode === 'total') {
      text = '흰색 전구와 검은색 전구를 각 단계별로 다음 그림과 같은 규칙으로 놓았습니다. 어떤 단계에서 흰색 전구가 ' + light + '개였다면, 전구는 모두 몇 개인지 구하세요.';
      detailType = '두 종류의 단계별 배열 전체 개수 구하기';
      solutionSteps = [
        stage + '×' + stage + '=' + light + '이므로 ' + stage + '단계입니다.',
        '검은색 전구는 ' + stage + '×' + (stage - 1) + '=' + dark + '개입니다.',
        '전구는 모두 ' + light + '+' + dark + '=' + answer + '개입니다.',
      ];
    } else {
      const oneSide = dark / 2;
      text = '흰색 바둑돌과 검은색 바둑돌을 각 단계별로 다음 그림과 같은 규칙으로 배열했습니다. 어떤 단계에서 흰색 바둑돌이 ' + light + '개였다면, 검은색 바둑돌은 몇 개인지 구하세요.';
      detailType = '정사각형 배열과 양쪽 계단 배열의 개수 관계';
      solutionSteps = [
        stage + '×' + stage + '=' + light + '이므로 ' + stage + '단계입니다.',
        '검은색 바둑돌은 한쪽에 1+2+⋯+' + (stage - 1) + '=' + oneSide + '개씩 있습니다.',
        '양쪽을 합하면 ' + oneSide + '×2=' + dark + '개입니다.',
      ];
    }
  }
  const image = pngAsset('q17-v' + variant + '.png', '가운데 정사각형 배열과 두 바깥 배열이 같은 단계 규칙으로 늘어나는 그림');
  items.push(common(17, variant, Object.assign({
    text, answer:answer + '개', acceptedAnswers:[answer + '개', String(answer)], pointBand:'3.4',
    area:'수·규칙찾기', subarea:'도형 배열의 규칙', detailType,
    readingFocus:'가운데 배열의 한 변에 놓인 수가 단계 수이고, 바깥 두 묶음은 단계마다 한 줄씩 늘어납니다.',
    solutionSkill:'가운데 정사각형 배열로 단계를 찾고 두 바깥 계단 배열의 개수 관계 적용하기',
    solutionSteps,
    meta:{mode:row.mode,stage,lightCount:light,darkCount:dark,totalCount:light + dark},
    assetSpec:{kind:'square-core-double-stair-growth',variantModel:row.mode,shownStages:[1,2,3],renderRules:{showAnswerCounts:false,preserveStageCounts:true}},
    verification:{
      primary:{method:'그림의 단계별 가운데 정사각형과 바깥 두 계단 배열을 식으로 나타냄',answer:answer + '개'},
      independent:{method:'단계 수 n에 대해 가운데 n²개, 바깥 전체 n(n-1)개를 별도로 계산',answer:answer + '개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'1~3단계의 가운데 배열과 바깥 두 묶음이 모두 보이며 수나 정답 표시는 없음'},
    },
  }, image)));
});

q18.forEach((row, index) => {
  const variant = index + 1;
  const [a, b, c] = row.labels;
  const [ab, bc, ac] = row.pairSums;
  const total = (ab + bc + ac) / 2;
  const values = [total - bc, total - ac, total - ab];
  if (!Number.isInteger(total) || values.some((value, valueIndex) => value !== row.values[valueIndex])) throw new Error('Q18-' + variant + ': invalid pair-sum values');
  const maximum = Math.max(...values);
  const maximumIndex = values.indexOf(maximum);
  const maximumLabel = row.answerLabel || row.labels[maximumIndex];
  if (row.answer !== maximumLabel + ' ' + maximum + row.unit) throw new Error('Q18-' + variant + ': invalid largest value answer');
  const text = row.intro + ' ' + a + '와 ' + b + '의 합은 ' + ab + row.unit + ', ' + b + '와 ' + c + '의 합은 ' + bc + row.unit + ', ' + a + '와 ' + c + '의 합은 ' + ac + row.unit + '입니다. ' + row.ask;
  items.push(common(18, variant, {
    text, answer:row.answer, acceptedAnswers:[row.answer, maximumLabel + ',' + maximum, maximumLabel + ' ' + maximum], pointBand:'3.4',
    area:'식의 계산', subarea:'합과 차', detailType:'세 쌍의 합으로 세 수와 가장 큰 값 찾기',
    readingFocus:'세 쌍의 합을 모두 더하면 각 수가 두 번씩 들어갑니다.',
    solutionSkill:'세 쌍의 합의 절반으로 전체를 구하고 반대쪽 두 수의 합을 빼서 각 수 찾기',
    solutionSteps:[
      '세 합을 모두 더하면 각 수가 두 번씩 들어가므로 전체는 (' + ab + '+' + bc + '+' + ac + ')÷2=' + total + row.unit + '입니다.',
      a + ', ' + b + ', ' + c + '의 값은 차례로 ' + values[0] + row.unit + ', ' + values[1] + row.unit + ', ' + values[2] + row.unit + '입니다.',
      '가장 큰 값은 ' + maximumLabel + '의 ' + maximum + row.unit + '입니다.',
    ],
    learnerFit:{gateId:'learner-fit',status:'pass',learnerStage:'초등 선발 대비 최종 모의고사 수강생',language:'원문과 같은 수준의 짧은 문장',responseMode:'대상과 수를 함께 답하기'},
    meta:{labels:row.labels,unit:row.unit,pairSums:row.pairSums,total,values,maximumIndex,maximumLabel,maximum}, assetSpec:null,
    verification:{
      primary:{method:'세 쌍의 합을 더해 전체를 구한 뒤 각 반대쪽 합을 빼기',answer:row.answer},
      independent:{method:'계산된 세 값으로 주어진 세 쌍의 합을 다시 대입 확인',answer:row.answer},
      unique:true,validAnswerCount:1,answerContract:'entity-and-number',
      visibleEvidence:{passed:true,method:'세 대상·세 쌍의 합·가장 큰 대상과 값을 묻는 조건이 본문에 모두 보임'},
    },
  }));
});

function subjectName(name) {
  const code = name.charCodeAt(name.length - 1) - 0xAC00;
  return name + (code >= 0 && code <= 11171 && code % 28 ? '이가' : '가');
}

q19.forEach((row, index) => {
  const variant = index + 1;
  let before = row.left;
  const reverseValues = [before];
  for (let turn = 0; turn < row.count; turn += 1) {
    before = 2 * (before + row.extra);
    reverseValues.push(before);
  }
  let forward = before;
  const forwardValues = [forward];
  for (let turn = 0; turn < row.count; turn += 1) {
    forward = forward / 2 - row.extra;
    forwardValues.push(forward);
  }
  if (before !== row.answer || forward !== row.left || !reverseValues.every(Number.isInteger)) throw new Error('Q19-' + variant + ': invalid reverse-sharing answer');
  const text = row.lead + ' 첫 번째 ' + row.receivers + '부터 매번 그때 가지고 있던 ' + row.object + '의 절반과 ' + row.extra + row.unit + '를 더 주었습니다. 마지막 ' + row.receivers + '에게 나누어 준 뒤 ' + row.object + '이 ' + row.left + row.unit + ' 남았다면, 처음에 가지고 있던 ' + row.object + '은 몇 ' + row.unit + '입니까?';
  const reverseChain = reverseValues.slice(0, -1).map((value, chainIndex) => value + '→' + reverseValues[chainIndex + 1]).join(', ');
  items.push(common(19, variant, {
    text, answer:row.answer + row.unit, acceptedAnswers:[row.answer + row.unit, String(row.answer)], pointBand:'3.4',
    area:'식의 계산', subarea:'거꾸로 계산', detailType:'절반과 일정한 수를 반복해 준 뒤 처음 수 역산하기',
    readingFocus:'마지막에 남은 수에서 시작해 매번 더 준 수를 더하고 두 배합니다.',
    solutionSkill:'한 번 전의 수=(남은 수+추가로 준 수)×2를 같은 횟수만큼 반복하기',
    solutionSteps:[
      '마지막에 남은 ' + row.left + row.unit + '부터 거꾸로 계산합니다.',
      '한 번 전의 수는 (남은 수+' + row.extra + ')×2이므로 ' + reverseChain + '입니다.',
      '따라서 처음에 가지고 있던 ' + row.object + '은 ' + row.answer + row.unit + '입니다.',
    ],
    meta:{recipientCount:row.count,extraEachTime:row.extra,finalRemainder:row.left,unit:row.unit,reverseValues,forwardValues,initialAmount:row.answer}, assetSpec:null,
    verification:{
      primary:{method:'마지막 수에서 더 준 수를 더하고 두 배하는 역산 반복',answer:row.answer + row.unit},
      independent:{method:'계산한 처음 수에서 절반과 추가 수를 실제 횟수만큼 순방향으로 나눔',answer:row.answer + row.unit},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'받는 곳의 수·매번 주는 규칙·마지막 남은 수가 본문에 모두 보임'},
    },
  }));
});

q20.forEach((row, index) => {
  const variant = index + 1;
  if (row.total % row.people || row.total % (2 ** row.target)) throw new Error('Q20-' + variant + ': invalid division conditions');
  const equalShare = row.total / row.people;
  const actualShares = Array.from({length:row.people}, (_, shareIndex) => row.total / (2 ** (shareIndex + 1)));
  const targetShare = actualShares[row.target - 1];
  const difference = equalShare - targetShare;
  if (difference !== row.answer) throw new Error('Q20-' + variant + ': invalid sequential-half answer');
  const ordinals = ['첫째','둘째','셋째','넷째','다섯째','여섯째'];
  const text = subjectName(row.giver) + ' ' + row.people + '명의 ' + row.peopleName + '에게 ' + row.object + ' ' + row.total + row.unit + '을 똑같이 나누어 주려고 했습니다. 마음이 바뀌어 첫째에게 전체의 절반을 주고, 둘째부터는 바로 앞 사람에게 주고 남은 양의 절반씩을 차례로 주었습니다. ' + ordinals[row.target - 1] + '는 처음에 똑같이 나누어 받기로 한 양보다 몇 ' + row.unit + ' 적게 받았습니까?';
  const shareList = actualShares.map((share, shareIndex) => ordinals[shareIndex] + ' ' + share + row.unit).join(', ');
  items.push(common(20, variant, {
    text, answer:row.answer + row.unit, acceptedAnswers:[row.answer + row.unit, String(row.answer)], pointBand:'3.4',
    area:'식의 계산', subarea:'분수의 연산', detailType:'남은 양의 절반씩 나누었을 때 계획한 몫과 실제 몫의 차',
    readingFocus:'처음 계획한 똑같은 몫과 실제로 차례에 따라 받은 몫을 따로 구합니다.',
    solutionSkill:'전체를 사람 수로 나눈 계획 몫과 전체를 2의 차례 제곱으로 나눈 실제 몫 비교하기',
    solutionSteps:[
      '똑같이 나누면 한 명이 ' + row.total + '÷' + row.people + '=' + equalShare + row.unit + '을 받습니다.',
      '실제로 받은 양은 차례로 ' + shareList + '입니다.',
      ordinals[row.target - 1] + '는 ' + equalShare + '-' + targetShare + '=' + difference + row.unit + ' 적게 받았습니다.',
    ],
    meta:{giver:row.giver,recipientCount:row.people,totalAmount:row.total,targetRecipient:row.target,equalShare,actualShares,targetShare,difference,unit:row.unit}, assetSpec:null,
    verification:{
      primary:{method:'계획한 균등 몫과 차례별 절반 몫을 각각 계산해 차 구하기',answer:row.answer + row.unit},
      independent:{method:'각 차례 뒤 남은 양과 받은 양이 같음을 순서대로 모의 실행',answer:row.answer + row.unit},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'전체 양·사람 수·반복 분배 규칙·비교할 차례가 본문에 모두 보임'},
    },
  }));
});

q21.forEach((row, index) => {
  const variant = index + 1;
  const matches = [];
  for (let number = 2; number <= 998; number += 2) {
    const product = number * (number + 2) * (number + 4);
    const digits = String(product);
    if (digits.length === 6 && digits[0] === row.first && digits.at(-1) === row.last) matches.push({number,product});
  }
  if (matches.length !== 1 || matches[0].number !== row.answer || matches[0].product !== row.product) throw new Error('Q21-' + variant + ': invalid unique consecutive-even answer');
  const image = pngAsset('q21-v' + variant + '.png', row.first + '로 시작하고 ' + row.last + '로 끝나는 여섯 자리 수의 숫자칸');
  items.push(common(21, variant, Object.assign({
    text:'아래 수는 연속한 세 짝수의 곱입니다. 세 짝수 중 가장 작은 수를 구하세요.',
    answer:String(row.answer), acceptedAnswers:[String(row.answer)], pointBand:'3.4',
    area:'식의 계산', subarea:'연속수와 곱', detailType:'일부 숫자만 보이는 곱에서 연속한 세 짝수 찾기',
    readingFocus:'숫자칸은 여섯 자리 수이며 첫째 자리와 일의 자리만 주어져 있습니다.',
    solutionSkill:'여섯 자리 범위의 연속한 세 짝수를 곱해 주어진 첫째·끝자리 조건을 함께 확인하기',
    solutionSteps:[
      '여섯 자리 수가 되는 연속한 세 짝수를 작은 수부터 차례로 확인합니다.',
      row.answer + '×' + (row.answer + 2) + '×' + (row.answer + 4) + '=' + row.product + '이고 ' + row.first + '로 시작하여 ' + row.last + '로 끝납니다.',
      '두 자리 조건을 모두 만족하는 경우는 하나이므로 가장 작은 수는 ' + row.answer + '입니다.',
    ],
    meta:{digits:6,firstDigit:row.first,lastDigit:row.last,smallestEven:row.answer,factors:[row.answer,row.answer+2,row.answer+4],product:row.product,validMatches:matches},
    assetSpec:{kind:'masked-six-digit-number',knownPositions:{first:row.first,last:row.last},blankCount:4,renderRules:{showHiddenDigits:false,showProductAnswer:false}},
    verification:{
      primary:{method:'연속한 세 짝수의 곱을 구해 첫째 자리와 일의 자리 확인',answer:String(row.answer)},
      independent:{method:'여섯 자리 곱을 만드는 모든 연속 짝수 세 수를 전수 열거해 숫자 무늬 필터링',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'첫째 자리·네 빈칸·일의 자리가 한 줄에 보이며 숨은 숫자와 정답은 표시하지 않음'},
    },
  }, image)));
});

function hasBatchim(word) {
  const code = word.charCodeAt(word.length - 1) - 0xAC00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

q22.forEach((row, index) => {
  const variant = index + 1;
  const total = (row.notB + row.notA + row.sumAB) / 2;
  const aCount = total - row.notA;
  const bCount = total - row.notB;
  const neither = total - row.sumAB;
  if (!Number.isInteger(total) || aCount + bCount !== row.sumAB || neither !== row.answer || Math.min(aCount,bCount,neither) < 0) throw new Error('Q22-' + variant + ': invalid complement-count answer');
  const pair = row.a + (hasBatchim(row.a) ? '과 ' : '와 ') + row.b;
  const pairObject = pair + (hasBatchim(row.b) ? '을' : '를');
  const text = row.intro + ' 이 중 ' + row.notB + '명은 ' + row.b + ' 학생이 아니고, ' + row.notA + '명은 ' + row.a + ' 학생이 아닙니다. 모인 ' + pair + ' 학생은 모두 ' + row.sumAB + '명입니다. ' + pairObject + ' 제외한 나머지 학생은 모두 몇 명입니까?';
  items.push(common(22, variant, {
    text, answer:neither + '명', acceptedAnswers:[neither + '명', String(neither)], pointBand:'3.4',
    area:'경우의 수', subarea:'포함과 배제', detailType:'두 집단의 여집합 수와 두 집단의 합으로 나머지 인원 구하기',
    readingFocus:'각 집단이 아닌 학생 수를 전체에서 빼면 두 집단의 학생 수가 됩니다.',
    solutionSkill:'전체를 □로 놓고 두 집단 수를 각각 나타낸 뒤 두 집단의 합 조건으로 전체와 나머지 구하기',
    solutionSteps:[
      '전체 학생 수를 □명이라 하면 ' + row.a + '은 □-' + row.notA + '명, ' + row.b + '은 □-' + row.notB + '명입니다.',
      '두 집단의 합이 ' + row.sumAB + '명이므로 전체는 (' + row.notA + '+' + row.notB + '+' + row.sumAB + ')÷2=' + total + '명입니다.',
      '두 집단을 제외한 학생은 ' + total + '-' + row.sumAB + '=' + neither + '명입니다.',
    ],
    meta:{groups:[row.a,row.b],notCounts:[row.notA,row.notB],groupSum:row.sumAB,total,aCount,bCount,neither}, assetSpec:null,
    verification:{
      primary:{method:'전체를 미지수로 두고 두 집단의 합 식 세우기',answer:neither + '명'},
      independent:{method:'계산된 전체·두 집단·나머지를 원래 두 여집합 수에 다시 대입',answer:neither + '명'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'두 여집합 수·두 집단의 합·구할 나머지 집단이 본문에 모두 보임'},
    },
  }));
});

function digitSum(number) {
  return String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

q23.forEach((row, index) => {
  const variant = index + 1;
  const matches = [];
  for (let number = row.lower + 1; number <= 999; number += 1) {
    if (digitSum(number) % 8 === 0 && digitSum(number + 1) % 8 === 0) matches.push(number);
  }
  if (!matches.length || matches[0] !== row.answer) throw new Error('Q23-' + variant + ': invalid least digit-sum answer');
  const beforeSum = digitSum(row.answer);
  const afterSum = digitSum(row.answer + 1);
  const text = row.lower + '보다 큰 세 자리 자연수 중에서 각 자리 숫자의 합이 8로 나누어떨어지는 수가 있습니다. 이 수에 1을 더한 수의 각 자리 숫자의 합도 8로 나누어떨어질 때, 조건을 만족하는 가장 작은 수를 구하세요.';
  items.push(common(23, variant, {
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer)], pointBand:'4.2',
    area:'수·규칙찾기', subarea:'조건에 맞는 수', detailType:'1을 더하기 전후 자리 숫자의 합이 모두 8의 배수인 최소 수 찾기',
    readingFocus:'원래 수와 1을 더한 수의 자리 숫자 합을 각각 확인합니다.',
    solutionSkill:'일의 자리 받아올림이 생기는 수를 범위 안에서 차례로 확인하기',
    solutionSteps:[
      '1을 더하기 전과 후의 자리 숫자 합이 모두 8의 배수가 되려면 일의 자리에서 받아올림이 일어나야 합니다.',
      row.answer + '의 자리 숫자 합은 ' + beforeSum + '이고, ' + (row.answer + 1) + '의 자리 숫자 합도 ' + afterSum + '이므로 두 합은 모두 8의 배수입니다.',
      row.lower + '보다 큰 수를 차례로 확인했을 때 먼저 조건을 만족하는 수가 없으므로 가장 작은 수는 ' + row.answer + '입니다.',
    ],
    meta:{lowerExclusive:row.lower,upperInclusive:999,divisor:8,answer:row.answer,beforeSum,afterSum,validMatches:matches}, assetSpec:null,
    verification:{
      primary:{method:'받아올림 후보의 전후 자리 숫자 합 확인',answer:String(row.answer)},
      independent:{method:'주어진 하한 다음 수부터 999까지 전수 열거해 두 합의 나머지가 모두 0인 첫 수 확인',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'하한·세 자리 범위·나누는 수·1을 더한 뒤의 조건·최소값 요구가 본문에 모두 보임'},
    },
  }));
});

q24.forEach((row, index) => {
  const variant = index + 1;
  const totalWorkers = row.answer;
  const largeWork = totalWorkers * 3 / 2;
  const smallWork = totalWorkers * 3 / 4;
  const largeRemainderAfterDay1 = largeWork - totalWorkers;
  const largeRemainderAfterDay2 = largeRemainderAfterDay1 - totalWorkers / 2;
  const smallRemainderAfterDay2 = smallWork - totalWorkers / 2;
  if (totalWorkers !== 4 * row.last || largeWork !== 2 * smallWork || largeRemainderAfterDay2 !== 0 || smallRemainderAfterDay2 !== row.last) throw new Error('Q24-' + variant + ': invalid shared-work answer');
  const text = row.people + '들이 ' + row.work + '. ' + row.large + '의 넓이는 ' + row.small + '의 넓이의 2배입니다. 첫째 날에는 모든 ' + row.people + '가 ' + row.large + '에서 하루 종일 일했습니다. 둘째 날에는 같은 수의 두 모둠으로 나누어 한 모둠은 ' + row.large + '의 남은 일을 끝내고, 다른 모둠은 ' + row.small + '에서 일했습니다. 셋째 날에는 ' + row.people + ' ' + row.last + '명이 ' + row.small + '의 남은 일을 끝냈습니다. ' + row.people + '는 모두 몇 명입니까?';
  items.push(common(24, variant, {
    text, answer:totalWorkers + '명', acceptedAnswers:[totalWorkers + '명', String(totalWorkers)], pointBand:'4.2',
    area:'식의 계산', subarea:'일·속력·시간', detailType:'넓이가 두 배인 두 작업을 여러 날 나누어 끝낼 때 전체 인원 구하기',
    readingFocus:'날마다 어느 작업에 몇 명이 참여했는지와 두 작업량의 비를 구분합니다.',
    solutionSkill:'전체 인원을 한 단위로 두고 큰 작업과 작은 작업의 양을 같은 단위로 나타내기',
    solutionSteps:[
      '전체 인원을 □명이라 하면 둘째 날 각 모둠은 □÷2명입니다.',
      row.large + '은 첫째 날 □명과 둘째 날 □÷2명이 끝냈으므로 작업량은 □의 1과 1/2배이고, ' + row.small + '의 작업량은 그 절반인 □의 3/4배입니다.',
      '둘째 날 □÷2명이 ' + row.small + '에서 일한 뒤 남은 □÷4명분을 ' + row.last + '명이 끝냈으므로 □÷4=' + row.last + ', □=' + totalWorkers + '입니다.',
    ],
    meta:{workerRole:row.people,largeWorkName:row.large,smallWorkName:row.small,largeToSmallRatio:2,thirdDayWorkers:row.last,totalWorkers,largeWork,smallWork,largeRemainderAfterDay1,largeRemainderAfterDay2,smallRemainderAfterDay2}, assetSpec:null,
    verification:{
      primary:{method:'전체 인원을 미지수로 두고 큰 작업과 작은 작업의 양을 비교',answer:totalWorkers + '명'},
      independent:{method:'각 날의 작업 인원을 1인 1일 작업량으로 두고 두 작업의 완료·잔여량을 순서대로 모의 계산',answer:totalWorkers + '명'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'두 작업의 넓이비·날짜별 인원 배치·마지막 인원이 본문에 모두 보임'},
    },
  }));
});

function subjectNameForFinal7(name) {
  return name + (hasBatchim(name) ? '이가' : '가');
}

function topicNameForFinal7(name) {
  return name + (hasBatchim(name) ? '이는' : '는');
}

q25.forEach((row, index) => {
  const variant = index + 1;
  const [first, second, third, fourth] = row.names;
  const values = [row.answer, row.answer * 2, row.answer * 4, row.answer * 7 + row.extra];
  if (values.reduce((sum, value) => sum + value, 0) !== row.total || values[3] !== values[0] + values[1] + values[2] + row.extra) throw new Error('Q25-' + variant + ': invalid multiplicative sum-and-difference answer');
  const text = first + ', ' + second + ', ' + third + ', ' + fourth + (hasBatchim(fourth) ? '은' : '는') + ' 함께 ' + row.activity + '. ' + topicNameForFinal7(second) + ' ' + subjectNameForFinal7(first) + ' 모은 ' + row.object + '의 2배를 모았고, ' + topicNameForFinal7(third) + ' ' + subjectNameForFinal7(second) + ' 모은 ' + row.object + '의 2배를 모았습니다. ' + topicNameForFinal7(fourth) + ' 나머지 세 명이 모은 ' + row.object + '를 합친 것보다 ' + row.extra + '개 더 많이 모았습니다. 네 명이 모은 ' + row.object + '가 모두 ' + row.total + '개일 때, ' + subjectNameForFinal7(first) + ' 모은 ' + row.object + '는 몇 개입니까?';
  items.push(common(25, variant, {
    text, answer:row.answer + '개', acceptedAnswers:[row.answer + '개', String(row.answer)], pointBand:'4.2',
    area:'식의 계산', subarea:'배수 관계와 합', detailType:'연속한 두 배 관계와 세 사람의 합보다 많은 수로 첫 사람의 수량 구하기',
    readingFocus:'둘째와 셋째의 수를 첫째의 수로 나타내고, 넷째의 비교 대상이 나머지 세 명의 합임을 확인합니다.',
    solutionSkill:'첫 사람의 수를 한 단위로 두어 네 사람의 수량을 한 식으로 나타내기',
    solutionSteps:[
      subjectNameForFinal7(first) + ' 모은 수를 □개라 하면 ' + second + (hasBatchim(second) ? '은' : '는') + ' 2×□개, ' + third + (hasBatchim(third) ? '은' : '는') + ' 4×□개입니다.',
      fourth + (hasBatchim(fourth) ? '은' : '는') + ' (□+2×□+4×□)+' + row.extra + '=7×□+' + row.extra + '개입니다.',
      '네 사람의 합은 14×□+' + row.extra + '=' + row.total + '이므로 □=' + row.answer + '입니다.',
    ],
    meta:{names:row.names,object:row.object,firstCount:row.answer,counts:values,secondMultiplier:2,thirdToSecondMultiplier:2,fourthExtra:row.extra,total:row.total}, assetSpec:null,
    verification:{
      primary:{method:'첫 사람의 수를 미지수로 두고 네 사람의 합 식 계산',answer:row.answer + '개'},
      independent:{method:'구한 네 수를 두 배 관계·나머지 세 명의 합과의 차·전체 합에 각각 재대입',answer:row.answer + '개'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'두 번의 2배 관계·넷째의 초과량·전체 합·구할 사람이 본문에 모두 보임'},
    },
  }));
});

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function januaryFirstWeekday(year) {
  return new Date(Date.UTC(year, 0, 1)).getUTCDay();
}

function sameCalendar(yearA, yearB) {
  return isLeapYear(yearA) === isLeapYear(yearB) && januaryFirstWeekday(yearA) === januaryFirstWeekday(yearB);
}

q26.forEach((row, index) => {
  const variant = index + 1;
  const matches = [];
  if (row.direction === 'past') {
    for (let year = 1900; year < row.cutoff; year += 1) if (sameCalendar(year, row.reference)) matches.push(year);
  } else {
    for (let year = row.cutoff + 1; year <= 2100; year += 1) if (sameCalendar(year, row.reference)) matches.push(year);
  }
  const answer = row.direction === 'past' ? matches.at(-1) : matches[0];
  if (answer !== row.answer) throw new Error('Q26-' + variant + ': invalid nearest matching calendar');
  const earlier = Math.min(answer, row.reference);
  const later = Math.max(answer, row.reference);
  let leapCount = 0;
  for (let year = earlier; year < later; year += 1) if (isLeapYear(year)) leapCount += 1;
  const weekdayShift = later - earlier + leapCount;
  if (weekdayShift % 7 !== 0 || isLeapYear(answer) !== isLeapYear(row.reference)) throw new Error('Q26-' + variant + ': calendar equivalence verification failed');
  const rangePhrase = row.direction === 'past' ? row.cutoff + '년과 가장 가까운 과거의 해' : row.cutoff + '년 이후의 해 중에서 ' + row.cutoff + '년과 가장 가까운 해';
  const searchPhrase = row.direction === 'past' ? row.cutoff + '년보다 작은 해를 가까운 순서로' : row.cutoff + '년보다 큰 해를 가까운 순서로';
  const text = subjectNameForFinal7(row.name) + ' ' + row.reference + '년도 달력을 보다가 다른 해에도 날짜와 요일이 같은 달력이 있는지 찾아보았습니다. ' + row.reference + '년과 연도만 다르고 달력이 같은 해 중에서 ' + rangePhrase + '는 몇 년입니까? (단, ' + row.leapAnchor + '년은 윤년입니다.)';
  items.push(common(26, variant, {
    text, answer:answer + '년', acceptedAnswers:[answer + '년', String(answer)], pointBand:'4.2',
    area:'수·규칙찾기', subarea:'달력과 요일', detailType:'평년·윤년의 요일 이동으로 같은 달력의 가장 가까운 해 찾기',
    readingFocus:'찾는 해의 방향과 기준 연도, 평년·윤년 여부를 함께 확인합니다.',
    solutionSkill:'평년은 1일, 윤년은 2일씩 바뀌는 1월 1일의 요일을 누적하고 윤년 여부도 비교하기',
    solutionSteps:[
      '같은 달력이 되려면 두 해가 모두 평년이거나 모두 윤년이고, 1월 1일의 요일도 같아야 합니다.',
      earlier + '년부터 ' + later + '년까지 요일은 모두 ' + weekdayShift + '일, 즉 ' + (weekdayShift / 7) + '주 이동하므로 날짜와 요일이 다시 같아집니다.',
      searchPhrase + ' 확인하면 먼저 조건을 만족하는 해는 ' + answer + '년입니다.',
    ],
    meta:{name:row.name,referenceYear:row.reference,cutoffYear:row.cutoff,leapAnchor:row.leapAnchor,direction:row.direction,answerYear:answer,matchingYears:matches,earlierYear:earlier,laterYear:later,leapCount,weekdayShift}, assetSpec:null,
    verification:{
      primary:{method:'평년과 윤년의 요일 이동량을 누적해 같은 달력 확인',answer:answer + '년'},
      independent:{method:'요청 범위의 모든 연도를 전수 검사해 윤년 여부와 1월 1일 요일이 같은 첫 해 확인',answer:answer + '년'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'기준 달력·탐색 기준 연도·과거 또는 이후 방향·윤년 기준이 본문에 모두 보임'},
    },
  }));
});

q27.forEach((row, index) => {
  const variant = index + 1;
  let week = 0;
  let count = 1;
  let previous = 1;
  while (count < row.target) {
    previous = count;
    count *= row.factor;
    week += 1;
  }
  if (week !== row.answer || previous >= row.target || count < row.target) throw new Error('Q27-' + variant + ': invalid first threshold week');
  const text = '처음에 1이었던 ' + row.subject + '가 1주일마다 ' + row.factor + '배가 됩니다. ' + row.subject + '가 적어도 ' + row.target.toLocaleString('ko-KR') + '이 되는 것은 몇 주일 후입니까?';
  items.push(common(27, variant, {
    text, answer:row.answer + '주일', acceptedAnswers:[row.answer + '주일', String(row.answer)], pointBand:'4.2',
    area:'수·규칙찾기', subarea:'규칙과 큰 수', detailType:'1에서 시작해 매주 일정한 배수가 될 때 목표 이상이 되는 첫 주 구하기',
    readingFocus:'매주 더하는 것이 아니라 앞 주의 수에 같은 배수를 곱한다는 점과 목표 이상이 되는 첫 주를 확인합니다.',
    solutionSkill:'주별 수를 거듭제곱으로 나타내고 목표보다 작은 마지막 주와 목표 이상인 첫 주 비교하기',
    solutionSteps:[
      row.subject + '는 매주 ' + row.factor + '배이므로 ' + row.factor + '의 거듭제곱으로 늘어납니다.',
      (row.answer - 1) + '주 후에는 ' + previous.toLocaleString('ko-KR') + '이고 목표인 ' + row.target.toLocaleString('ko-KR') + '보다 작습니다.',
      row.answer + '주 후에는 ' + count.toLocaleString('ko-KR') + '이므로 처음으로 목표 이상이 되는 때는 ' + row.answer + '주일 후입니다.',
    ],
    meta:{subject:row.subject,start:1,weeklyMultiplier:row.factor,targetThreshold:row.target,firstWeek:row.answer,previousCount:previous,firstReachedCount:count}, assetSpec:null,
    verification:{
      primary:{method:'주별 수를 차례로 곱해 목표 이상이 되는 첫 주 확인',answer:row.answer + '주일'},
      independent:{method:'직전 거듭제곱은 목표 미만이고 다음 거듭제곱은 목표 이상인지 경계값 검사',answer:row.answer + '주일'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'시작 수·주별 배수·목표 인원·처음 도달 시점 요구가 본문에 모두 보임'},
    },
  }));
});

function triangularNumber(n) {
  return n * (n + 1) / 2;
}

function triangularValue(row, column) {
  return triangularNumber(row - 1) + column;
}

function triangularLocate(number) {
  let row = 1;
  while (triangularNumber(row) < number) row += 1;
  return [row, number - triangularNumber(row - 1)];
}

function triangularNeighbors(row, column) {
  return [[row,column-1],[row,column+1],[row-1,column-1],[row-1,column],[row+1,column],[row+1,column+1]]
    .filter(([candidateRow,candidateColumn]) => candidateRow >= 1 && candidateColumn >= 1 && candidateColumn <= candidateRow)
    .map(([candidateRow,candidateColumn]) => triangularValue(candidateRow,candidateColumn));
}

function triangularNeighborSum(number) {
  const [row,column] = triangularLocate(number);
  return triangularNeighbors(row,column).reduce((sum,value) => sum + value, 0);
}

q28.forEach((row, index) => {
  const variant = index + 1;
  const matches = [];
  for (let number = 1; number <= 500; number += 1) if (triangularNeighborSum(number) === row.targetSum) matches.push(number);
  if (matches.length !== 1 || matches[0] !== row.answer) throw new Error('Q28-' + variant + ': invalid unique triangular-neighbor answer');
  const [answerRow,answerColumn] = triangularLocate(row.answer);
  const adjacent = triangularNeighbors(answerRow,answerColumn);
  const image = pngAsset('q28-v' + variant + '.png', '삼각형 자연수 배열, 원본 계산 약속 보기, 원 안에 들어갈 수의 이웃 합 ' + row.targetSum);
  const text = '그림과 같이 자연수를 위에서부터 차례로 배열했습니다. 원 안에 들어 있는 수는 그 수가 적힌 칸을 제외하고, 그 수가 적힌 칸에 변으로 맞닿은 칸들의 수를 모두 더한 값으로 계산하기로 했습니다. 보기를 보고 다음 원 안에 들어갈 수를 구하세요.';
  items.push(common(28, variant, Object.assign({
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer)], pointBand:'4.2',
    area:'수·규칙찾기', subarea:'수 배열의 규칙', detailType:'삼각형 자연수 배열에서 선택한 칸을 제외한 변 이웃의 합으로 숨은 수 찾기',
    readingFocus:'원 안의 수가 적힌 칸 자체는 합에서 제외하고, 변으로 맞닿은 칸만 더합니다.',
    solutionSkill:'삼각수로 목표 수의 행과 열을 찾고 같은 행·윗행·아랫행의 변 이웃 여섯 수 합 확인하기',
    solutionSteps:[
      row.answer + '은 ' + answerRow + '번째 줄 ' + answerColumn + '번째 칸에 있습니다.',
      '이 칸을 제외하고 변으로 맞닿은 칸의 수는 ' + adjacent.join(', ') + '입니다.',
      adjacent.join('+') + '=' + row.targetSum + '이고 이 합을 만드는 칸은 하나뿐이므로 원 안의 수는 ' + row.answer + '입니다.',
    ],
    meta:{targetNeighborSum:row.targetSum,answerNumber:row.answer,answerRow,answerColumn,adjacentValues:adjacent,validMatches:matches,searchMax:500,excludeSelectedCell:true,adjacency:'shared-edge-only'},
    assetSpec:{kind:'triangular-number-array-with-source-example',visibleRows:5,sequenceStart:1,exampleSource:'cropped-original-q28-example',targetNeighborSum:row.targetSum,renderRules:{showAnswerCell:false,showAnswerNumber:false,showOriginalExamples:true}},
    verification:{
      primary:{method:'답 후보 칸의 변 이웃을 좌표로 찾아 합 계산',answer:String(row.answer)},
      independent:{method:'1부터 500까지 모든 칸의 변 이웃 합을 전수 열거해 목표 합과 일치하는 칸 수 확인',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'자연수 배열·자기 칸 제외·변 이웃만 합산·원본 보기·목표 합이 모두 보이며 답 칸은 표시하지 않음'},
    },
  }, image)));
});

function factorial(number) {
  let value = 1;
  for (let current = 2; current <= number; current += 1) value *= current;
  return value;
}

function combinations(values, count) {
  const result = [];
  function visit(start, selected) {
    if (selected.length === count) {
      result.push(selected);
      return;
    }
    for (let index = start; index <= values.length - (count - selected.length); index += 1) {
      visit(index + 1, selected.concat(values[index]));
    }
  }
  visit(0, []);
  return result;
}

function exhaustiveCrossCount(numbers, horizontal, vertical) {
  const centerIndex = Math.floor(horizontal / 2);
  let count = 0;
  function visit(prefix, remaining) {
    if (!remaining.length) {
      const horizontalSum = prefix.slice(0, horizontal).reduce((sum, value) => sum + value, 0);
      const verticalSum = prefix[centerIndex] + prefix.slice(horizontal).reduce((sum, value) => sum + value, 0);
      if (horizontalSum === verticalSum) count += 1;
      return;
    }
    remaining.forEach((value, index) => visit(prefix.concat(value), remaining.slice(0, index).concat(remaining.slice(index + 1))));
  }
  visit([], numbers);
  if (horizontal + vertical - 1 !== numbers.length) throw new Error('cross cell count and number count differ');
  return count;
}

q29.forEach((row, index) => {
  const variant = index + 1;
  const total = row.numbers.reduce((sum, value) => sum + value, 0);
  const centerCases = [];
  row.numbers.forEach((center) => {
    const remaining = row.numbers.filter((value) => value !== center);
    const verticalArmSum = (total - center) / 2;
    combinations(remaining, row.vertical - 1).forEach((arms) => {
      if (arms.reduce((sum, value) => sum + value, 0) === verticalArmSum) centerCases.push({center, verticalArms:arms});
    });
  });
  const arrangementsPerCase = factorial(row.vertical - 1) * factorial(row.horizontal - 1);
  const combinationCount = centerCases.length * arrangementsPerCase;
  const exhaustiveCount = exhaustiveCrossCount(row.numbers, row.horizontal, row.vertical);
  if (combinationCount !== row.answer || exhaustiveCount !== row.answer) throw new Error('Q29-' + variant + ': invalid equal-line arrangement count');
  const caseText = centerCases.map((entry) => '가운데 ' + entry.center + ', 세로의 나머지 수 ' + entry.verticalArms.join('·')).join('; ');
  const image = pngAsset('q29-v' + variant + '.png', '가로 ' + row.horizontal + '칸과 세로 ' + row.vertical + '칸이 가운데에서 만나는 빈 수 배열');
  const text = '그림의 가로줄과 세로줄에 있는 수의 합이 같도록 빈칸에 ' + row.numbers.join(', ') + '을 한 번씩 모두 써넣으려고 합니다. 수를 써넣는 방법은 모두 몇 가지입니까? (단, 위치가 다른 칸에 다른 수가 들어가는 것은 모두 다릅니다.)';
  items.push(common(29, variant, Object.assign({
    text, answer:row.answer + '가지', acceptedAnswers:[row.answer + '가지', String(row.answer)], pointBand:'4.2',
    area:'경우의 수', subarea:'수 배열의 경우의 수', detailType:'가로줄과 세로줄의 합이 같은 수 배열의 경우의 수',
    readingFocus:'가로줄과 세로줄이 공유하는 가운데 칸을 먼저 정하고, 나머지 칸의 순서를 각각 셉니다.',
    solutionSkill:'가운데 수와 세로의 나머지 수를 먼저 고른 뒤 세로와 가로의 자리 바꿈 수를 곱하기',
    solutionSteps:[
      '모든 수의 합은 ' + total + '이고, 가능한 선택은 ' + caseText + '로 모두 ' + centerCases.length + '가지입니다.',
      '한 선택마다 세로의 나머지 ' + (row.vertical - 1) + '칸은 ' + factorial(row.vertical - 1) + '가지, 가로의 나머지 ' + (row.horizontal - 1) + '칸은 ' + factorial(row.horizontal - 1) + '가지로 바꿔 놓을 수 있습니다.',
      centerCases.length + '×' + factorial(row.vertical - 1) + '×' + factorial(row.horizontal - 1) + '=' + row.answer + '이므로 모두 ' + row.answer + '가지입니다.',
    ],
    meta:{horizontalCells:row.horizontal,verticalCells:row.vertical,totalCells:row.numbers.length,numbers:row.numbers,total,centerCases,arrangementsPerCase,combinationCount,exhaustiveCount},
    assetSpec:{kind:'cross-number-cells',horizontalCells:row.horizontal,verticalCells:row.vertical,totalCells:row.numbers.length,renderRules:{showNumbers:false,showAnswerArrangement:false,preserveSharedCenter:true}},
    verification:{
      primary:{method:'가운데 수와 세로 나머지 수의 조합을 찾은 뒤 각 줄의 순열 수를 곱함',answer:row.answer + '가지'},
      independent:{method:row.numbers.length + '!개 전체 배열을 전수 확인해 두 줄의 합이 같은 배치 수 계산',answer:row.answer + '가지'},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'서로 다른 칸 수의 십자 배열·사용할 수·모든 위치 구별 조건이 보이며 숫자나 정답 배열은 표시하지 않음'},
    },
  }, image)));
});

q30.forEach((row, index) => {
  const variant = index + 1;
  let remaining = Array.from({length:row.students}, (_, studentIndex) => studentIndex + 1);
  const roundCounts = [remaining.length];
  while (remaining.length > 1) {
    remaining = remaining.filter((_, position) => (position + 1) % 2 === 0);
    roundCounts.push(remaining.length);
  }
  let largestPowerOfTwo = 1;
  const powers = [1];
  while (largestPowerOfTwo * 2 <= row.students) {
    largestPowerOfTwo *= 2;
    powers.push(largestPowerOfTwo);
  }
  if (remaining[0] !== row.answer || largestPowerOfTwo !== row.answer) throw new Error('Q30-' + variant + ': invalid last original student number');
  const text = row.students + '명의 학생을 한 줄로 세워 차례대로 1번부터 ' + row.students + '번까지 번호를 붙인 뒤 짝수 번호인 학생만 남깁니다. 남은 학생들에게 다시 1번부터 차례대로 번호를 붙이고 짝수 번호인 학생만 남기는 일을 한 명이 남을 때까지 반복합니다. 마지막에 남은 학생이 처음 줄에서 받은 번호는 몇 번입니까?';
  items.push(common(30, variant, {
    text, answer:String(row.answer), acceptedAnswers:[String(row.answer), row.answer + '번'], pointBand:'4.2',
    area:'수·규칙찾기', subarea:'규칙에 따른 제거', detailType:'짝수 번호만 남기고 다시 번호를 붙이는 과정을 반복해 마지막 학생 찾기',
    readingFocus:'매번 새로 붙인 번호가 짝수인 학생만 남으므로 처음 번호에서는 2의 배수, 4의 배수, 8의 배수 순서로 남습니다.',
    solutionSkill:'처음 학생 수 이하인 가장 큰 2의 거듭제곱 찾기',
    solutionSteps:[
      '첫 번째에는 처음 번호가 2의 배수인 학생, 다음에는 4의 배수인 학생, 그다음에는 8의 배수인 학생이 남습니다.',
      row.students + ' 이하인 2의 거듭제곱은 ' + powers.join(', ') + '이고, 그중 가장 큰 수는 ' + largestPowerOfTwo + '입니다.',
      '따라서 마지막에 남은 학생이 처음 줄에서 받은 번호는 ' + row.answer + '번입니다.',
    ],
    meta:{initialStudents:row.students,roundCounts,powersOfTwo:powers,lastOriginalNumber:remaining[0],largestPowerOfTwo}, assetSpec:null,
    verification:{
      primary:{method:'매 라운드의 짝수 위치만 남기며 실제 학생 번호를 끝까지 모의 실행',answer:String(row.answer)},
      independent:{method:'처음 학생 수 이하인 가장 큰 2의 거듭제곱 계산',answer:String(row.answer)},
      unique:true,validAnswerCount:1,answerContract:'single-value',
      visibleEvidence:{passed:true,method:'처음 학생 수·짝수 번호만 남기는 규칙·매번 재번호·한 명이 될 때까지 반복 조건이 본문에 모두 보임'},
    },
  }));
});

const data = {
  version: '7.14.0', sourceSet: 'final', sourceRound: 7,
  freezePolicy: {runtimeGeneration: false, fixedItemCount: items.length, variantsPerSourceQuestion: 3, availableSourceNos: Array.from({length:30}, (_, index) => index + 1), partialRelease: false},
  sourceFingerprints: Object.fromEntries(SOURCE_PATHS.map(sourcePath => [sourcePath, sha(fs.readFileSync(path.join(ROOT, sourcePath)))])),
  reviewSummary: {verified: items.length, pending: 0, unavailableSourceQuestions: 0},
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
