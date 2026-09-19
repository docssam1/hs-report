/* Thin adapter around the existing reviewed Final 7 fixed-item export. */
(function (root, factory) {
  'use strict';
  var registry = root && root.QUESTION_BANK_ADAPTERS;
  if (!registry && typeof require === 'function') registry = require('../core/adapter-registry.js');
  var adapter = factory();
  if (typeof module === 'object' && module.exports) module.exports = adapter;
  if (registry) registry.register(adapter);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var data = null;
  var loadPromise = null;
  var sourceSeriesId = 'gfield-final';
  var edition = '2025';
  var types = [
    {id:'hex-simple-path-count',domain:'combinatorics',middle:'길 찾기',label:'육각형 칸을 따라가는 방법의 수',gradeBand:{from:'g3',to:'g5'},solvingModel:'simple-path-enumeration',visualModel:'hex-cell-network',answerContract:'single-number',generatorId:'final7-q05',rendererId:'reviewed-raster',searchAliases:['육각형 길 찾기','경로 세기']},
    {id:'continuous-rope-orientation-trace',domain:'geometry',middle:'방향과 위치',label:'꼬인 한 줄을 따라 물고기 방향 판단',gradeBand:{from:'g3',to:'g5'},solvingModel:'continuous-line-tracing',visualModel:'crossed-rope-with-oriented-objects',answerContract:'single-number',generatorId:'final7-q06',rendererId:'reviewed-raster',searchAliases:['꼬인 줄','낚싯줄','방향 판단']},
    {id:'digit-permutation-page-range',domain:'number',middle:'연속수',label:'같은 숫자로 만든 마지막 쪽수와 페이지 수',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-permutation-range-filter',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q07',rendererId:'text-block',searchAliases:['쪽수','숫자 순서','연속 페이지']},
    {id:'fixed-remainder-arithmetic-sum',domain:'number',middle:'나머지',label:'범위 안에서 같은 나머지를 갖는 수의 합',gradeBand:{from:'g3',to:'g5'},solvingModel:'arithmetic-progression-remainder-class',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q08',rendererId:'text-block',searchAliases:['나머지의 합','등차수열']},
    {id:'orthogonal-return-displacement',domain:'number',middle:'방향과 이동',label:'이동 경로를 거꾸로 추적해 출발점으로 돌아가기',gradeBand:{from:'g3',to:'g5'},solvingModel:'orthogonal-vector-cancellation',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q09',rendererId:'text-block',searchAliases:['방향 이동','출발점으로 돌아가기']},
    {id:'maximize-others-minimum-selected',domain:'number',middle:'가정하여 풀기',label:'합 조건에서 가장 작은 선택 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'maximize-complement-to-minimize-target',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q10',rendererId:'text-block',searchAliases:['가장 작은 수','최댓값 가정','카드의 합']},
    {id:'two-capacity-partial-last-seat',domain:'number',middle:'가정하여 풀기',label:'마지막 불완전 착석에서 두 종류 좌석 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'all-small-capacity-difference',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q11',rendererId:'text-block',searchAliases:['의자 수','우기기','좌석 정원']},
    {id:'recursive-quarter-shaded-area-difference',domain:'geometry',middle:'도형 분할과 넓이',label:'반복 분할한 두 단계의 색칠 넓이 차',gradeBand:{from:'g3',to:'g5'},solvingModel:'geometric-area-increments',visualModel:'recursive-quarter-shading',answerContract:'single-fraction',generatorId:'final7-q12',rendererId:'reviewed-raster',searchAliases:['반복 색칠','넓이의 차','정사각형 분할']},
    {id:'alternating-growing-run-count-difference',domain:'number',middle:'군수열/묶음수열',label:'한 개씩 길어지는 두 숫자 묶음의 개수 비교',gradeBand:{from:'g3',to:'g5'},solvingModel:'triangular-block-parity-count',visualModel:'text-sequence',answerContract:'number-and-count',generatorId:'final7-q13',rendererId:'text-block',searchAliases:['군수열','묶음수열','늘어나는 묶음']},
    {id:'three-container-cyclic-transfer',domain:'number',middle:'거꾸로 생각하기',label:'세 곳 사이의 반복 이동을 거꾸로 계산하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'cyclic-transfer-net-change-reversal',visualModel:'text-only',answerContract:'ordered-triple',generatorId:'final7-q14',rendererId:'text-block',searchAliases:['세 상자','반복 이동','거꾸로 계산']},
    {id:'periodic-arrow-grid-position',domain:'number',middle:'규칙과 위치',label:'반복되는 화살표 이동에서 먼 칸의 위치 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'periodic-path-quotient-remainder',visualModel:'nonrepeating-arrow-grid',answerContract:'ordered-pair',generatorId:'final7-q15',rendererId:'reviewed-raster',searchAliases:['화살표 이동','행과 열','주기적 위치']},
    {id:'discard-two-move-one-card-queue',domain:'number',middle:'규칙과 과정',label:'카드 버리기와 옮기기를 반복한 뒤 남는 두 수의 합',gradeBand:{from:'g3',to:'g5'},solvingModel:'queue-discard-discard-rotate',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q16',rendererId:'text-block',searchAliases:['카드 버리기','맨 밑으로 옮기기','마지막 두 장']},
    {id:'square-core-double-stair-growth',domain:'number',middle:'도형 배열 규칙',label:'정사각형 배열과 두 바깥 배열의 개수 관계',gradeBand:{from:'g3',to:'g5'},solvingModel:'square-and-double-triangular-growth',visualModel:'square-core-double-stair-growth',answerContract:'single-number',generatorId:'final7-q17',rendererId:'reviewed-raster',searchAliases:['바둑돌 배열','단계별 도형','정사각형과 계단']},
    {id:'three-values-from-pair-sums',domain:'number',middle:'합과 차',label:'세 쌍의 합으로 세 수와 가장 큰 값 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'pair-sum-half-total',visualModel:'text-only',answerContract:'entity-and-number',generatorId:'final7-q18',rendererId:'text-block',searchAliases:['세 사람 나이','두 수의 합','가장 큰 수']},
    {id:'repeated-half-plus-extra-reverse',domain:'number',middle:'거꾸로 계산',label:'절반과 일정한 수를 반복해 준 뒤 처음 수 역산하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'reverse-double-after-extra',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q19',rendererId:'text-block',searchAliases:['거꾸로 계산','절반과 한 개 더','처음 수']},
    {id:'successive-half-share-difference',domain:'number',middle:'분수의 연산',label:'남은 양의 절반씩 나누었을 때 계획 몫과 실제 몫의 차',gradeBand:{from:'g3',to:'g5'},solvingModel:'equal-share-versus-successive-halves',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q20',rendererId:'text-block',searchAliases:['남은 것의 절반','똑같이 나누기','받은 양의 차']},
    {id:'masked-product-three-consecutive-evens',domain:'number',middle:'연속수와 곱',label:'일부 숫자만 보이는 곱에서 연속한 세 짝수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'consecutive-even-product-enumeration',visualModel:'masked-six-digit-number',answerContract:'single-number',generatorId:'final7-q21',rendererId:'reviewed-raster',searchAliases:['연속한 짝수','세 수의 곱','숫자칸']},
    {id:'two-group-complement-total',domain:'combinatorics',middle:'포함과 배제',label:'두 집단의 여집합 수와 두 집단의 합으로 나머지 인원 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'two-complements-recover-total',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q22',rendererId:'text-block',searchAliases:['두 학년 제외','여집합','나머지 학생']},
    {id:'digit-sum-before-after-increment',domain:'number',middle:'조건에 맞는 수',label:'1을 더하기 전후 자리 숫자의 합이 모두 8의 배수인 최소 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-sum-carry-enumeration',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q23',rendererId:'text-block',searchAliases:['자리 숫자의 합','1을 더한 수','받아올림']},
    {id:'two-jobs-multi-day-workforce',domain:'number',middle:'일·속력·시간',label:'넓이가 두 배인 두 작업을 여러 날 나누어 끝낼 때 전체 인원 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'shared-work-ratio-equation',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q24',rendererId:'text-block',searchAliases:['공동 작업','두 잔디밭','전체 인원']},
    {id:'double-chain-fourth-exceeds-rest',domain:'number',middle:'배수와 나머지',label:'연속한 두 배 관계와 나머지보다 많은 수로 첫 사람의 수량 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'multiplicative-chain-total-equation',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q25',rendererId:'text-block',searchAliases:['두 배 관계','네 사람 수량','나머지보다 많음']},
    {id:'nearest-equivalent-calendar-year',domain:'number',middle:'달력과 요일',label:'평년·윤년의 요일 이동으로 같은 달력의 가장 가까운 해 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'calendar-weekday-cycle-search',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q26',rendererId:'text-block',searchAliases:['같은 달력','윤년','날짜와 요일']},
    {id:'weekly-multiplication-threshold',domain:'number',middle:'규칙과 큰 수',label:'1에서 시작해 매주 일정한 배수가 될 때 목표 이상이 되는 첫 주 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'exponential-threshold-search',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q27',rendererId:'text-block',searchAliases:['매주 몇 배','큰 수','몇 주일']},
    {id:'triangular-array-edge-neighbor-sum',domain:'number',middle:'수 배열의 규칙',label:'삼각형 자연수 배열에서 선택한 칸을 제외한 변 이웃의 합으로 숨은 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'triangular-grid-edge-neighbor-enumeration',visualModel:'triangular-number-array-with-source-example',answerContract:'single-number',generatorId:'final7-q28',rendererId:'reviewed-raster',searchAliases:['삼각형 수 배열','맞닿은 칸','이웃의 합']},
    {id:'cross-array-equal-line-sums',domain:'combinatorics',middle:'수 배열의 경우의 수',label:'가운데 칸을 공유하는 가로줄과 세로줄의 합을 같게 배열하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'shared-center-equal-sum-permutation-count',visualModel:'cross-number-cells',answerContract:'single-number',generatorId:'final7-q29',rendererId:'reviewed-raster',searchAliases:['가로 세로 합','십자 수 배열','수 배열 경우의 수']},
    {id:'repeated-even-position-survivor',domain:'number',middle:'규칙에 따른 제거',label:'짝수 위치만 남기고 다시 번호를 붙이는 과정을 반복해 마지막 학생 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'largest-power-of-two-survivor',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q30',rendererId:'text-block',searchAliases:['짝수 번호 남기기','다시 번호 붙이기','마지막 학생']}
  ];
  var typeById = new Map(types.map(function (type) { return [type.id, type]; }));
  var typeIdByNo = {5:types[0].id,6:types[1].id,7:types[2].id,8:types[3].id,9:types[4].id,10:types[5].id,11:types[6].id,12:types[7].id,13:types[8].id,14:types[9].id,15:types[10].id,16:types[11].id,17:types[12].id,18:types[13].id,19:types[14].id,20:types[15].id,21:types[16].id,22:types[17].id,23:types[18].id,24:types[19].id,25:types[20].id,26:types[21].id,27:types[22].id,28:types[23].id,29:types[24].id,30:types[25].id};
  var visualByNo = {5:'hex-cells:path-count',6:'continuous-rope:oriented-fish',7:'text:digit-permutation-pages',8:'text:remainder-class-sum',9:'text:orthogonal-moves',10:'text:bounded-distinct-selection',11:'text:two-capacity-partial-last-seat',12:'recursive-quarter-shading:first-three-stages',13:'text:alternating-growing-runs',14:'text:cyclic-three-container-transfer',15:'grid:periodic-nonrepeating-arrow-path',16:'text:queue-discard-two-move-one',17:'square-core:double-stair-growth',18:'text:three-pair-sums',19:'text:repeated-half-plus-extra-reverse',20:'text:successive-half-sharing',21:'masked-number:first-and-last-digit',22:'text:two-group-complements',23:'text:digit-sum-before-after-increment',24:'text:two-jobs-multi-day-work',25:'text:multiplicative-chain-four-people',26:'text:calendar-cycle-search',27:'text:weekly-multiplication-threshold',28:'triangular-array:edge-neighbor-sum',29:'cross-array:equal-line-sums',30:'text:repeated-even-position-survivor'};
  var unitByNo = {5:'가지',6:'마리',7:'페이지',8:'',9:'',10:'',11:'개',12:'분수',13:'숫자·개수',14:'개·개·개',15:'행·열',16:'',17:'개',18:'대상·수',19:'개·장',20:'g',21:'',22:'명',23:'',24:'명',25:'개',26:'년',27:'주일',28:'',29:'가지',30:'번'};

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function useData(value) { data = value; return adapter; }
  function requireData() { if (!data) throw new Error('최종 7회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/final7-reviewed.json?v=12', {cache:'no-cache'}).then(function (response) {
      if (!response.ok) throw new Error('최종 7회 검수 문항을 불러오지 못했습니다.');
      return response.json();
    }).then(function (value) { data = value; return value; }).catch(function (error) { loadPromise = null; throw error; });
    return loadPromise;
  }
  function listTypes() { return clone(types); }
  function listSourceItems() {
    var value = requireData();
    return value.freezePolicy.availableSourceNos.map(function (no) {
      var first = value.items.find(function (item) { return Number(item.sourceNo) === Number(no); });
      return {
        sourceKey:'gfield:final:' + edition + ':round-07:q' + String(no).padStart(3,'0'),
        sourceSeriesId:sourceSeriesId,
        edition:edition,
        sourceLocator:{set:'final',round:7,questionNo:no},
        sourceTypeLabel:first.detailType,
        typeIds:[typeIdByNo[no]],
        difficulty:'actual',
        answerContract:typeById.get(typeIdByNo[no]).answerContract,
        visualSignature:visualByNo[no],
        sourceFidelity:'structure-matched',
        verificationStatus:first.reviewStatus === 'verified' ? 'verified' : 'pending',
        rights:'private-source-derived-variant',
        sourceMeta:{pointBand:first.pointBand,area:first.area,subarea:first.subarea,answerUnit:unitByNo[no],variantCount:value.items.filter(function (item) { return Number(item.sourceNo) === Number(no); }).length}
      };
    });
  }
  function getGenerator(generatorId) {
    var value = requireData();
    var items = value.items.filter(function (item) { return item.genId === generatorId; });
    return items.length ? {id:generatorId,kind:'stored-reviewed-variants',items:clone(items)} : null;
  }
  function getRenderer(rendererId) {
    if (rendererId === 'reviewed-raster') return {id:rendererId,kind:'raster-image',answerMarks:false};
    if (rendererId === 'text-block') return {id:rendererId,kind:'text-only'};
    return null;
  }
  function validateSourceItem(item) {
    var errors = [];
    if (!item || typeof item !== 'object') return ['source item is missing'];
    ['sourceKey','sourceSeriesId','edition','sourceLocator','sourceTypeLabel','typeIds','difficulty','answerContract','visualSignature','sourceFidelity','verificationStatus','rights','sourceMeta'].forEach(function (key) { if (item[key] == null || item[key] === '') errors.push(key + ' is missing'); });
    if (!Array.isArray(item.typeIds) || !item.typeIds.length) errors.push('typeIds is empty');
    else item.typeIds.forEach(function (id) { if (!typeById.has(id)) errors.push('unknown typeId: ' + id); });
    if (item.verificationStatus === 'verified') {
      var type = item.typeIds && typeById.get(item.typeIds[0]);
      if (!type || !getGenerator(type.generatorId)) errors.push('verified item generator is missing');
      if (!type || !getRenderer(type.rendererId)) errors.push('verified item renderer is missing');
    }
    return errors;
  }
  var adapter = {adapterVersion:'1.0',id:'gfield-final7-reviewed',label:'지필드 최종 7회 검수 문항',listTypes:listTypes,listSourceItems:listSourceItems,getGenerator:getGenerator,getRenderer:getRenderer,validateSourceItem:validateSourceItem,useData:useData,load:load};
  return adapter;
});
