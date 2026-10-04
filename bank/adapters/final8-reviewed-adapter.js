/* Thin adapter around the existing reviewed Final 8 fixed-item export. */
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
    {id:'f8-two-road-car-length',domain:'number',middle:'합과 차',label:'두 줄 빈 구간 합 차이로 자동차 길이 역산',gradeBand:{from:'g3',to:'g5'},solvingModel:'difference-of-gap-sums',visualModel:'two-road-gap-diagram',answerContract:'single-number',generatorId:'final8-q01',rendererId:'reviewed-raster',searchAliases:['자동차 길이','빈 거리','두 도로']},
    {id:'f8-four-digit-digit-conditions',domain:'number',middle:'수의 성질',label:'자리 숫자의 합·곱 조건으로 네 자리 수 극값 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-multiset-extrema',visualModel:'text-only',answerContract:'number-pair',generatorId:'final8-q02',rendererId:'text-block',searchAliases:['네 자리 수','자리 숫자의 합','자리 숫자의 곱']},
    {id:'f8-dice-truth-lie-product',domain:'combinatorics',middle:'경우의 수',label:'두 명제 참거짓으로 주사위 두 눈 곱 극값 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'truth-table-product-extrema',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q03',rendererId:'text-block',searchAliases:['주사위 두 눈','참과 거짓','곱의 최댓값']},
    {id:'f8-four-numbers-six-pair-means',domain:'number',middle:'평균',label:'네 수의 여섯 쌍 평균으로 가장 큰 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'pair-mean-to-original',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q04',rendererId:'text-block',searchAliases:['두 수의 평균','여섯 평균','가장 큰 수']},
    {id:'f8-append-divide-quotient',domain:'number',middle:'나눗셈의 몫과 나머지',label:'숫자 이어 쓰고 더한 뒤 나눗셈 몫 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-append-modular-congruence',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q05',rendererId:'text-block',searchAliases:['숫자 이어 쓰기','나눗셈 몫','한 자리 수']},
    {id:'f8-serpentine-grid-position',domain:'number',middle:'규칙과 과정',label:'뱀 지그재그 배열에서 ㄱ 위치 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'row-reversal-position-algebra',visualModel:'serpentine-four-row-grid',answerContract:'single-number',generatorId:'final8-q06',rendererId:'reviewed-raster',searchAliases:['뱀 모양 배열','지그재그','ㄱ 위치']},
    {id:'f8-triangle-lines-count',domain:'geometry',middle:'도형 세기',label:'선으로 나뉜 도형 안의 크고 작은 삼각형 세기',gradeBand:{from:'g3',to:'g5'},solvingModel:'planar-graph-triangle-enumeration',visualModel:'triangle-with-interior-lines',answerContract:'single-number',generatorId:'final8-q07',rendererId:'reviewed-raster',searchAliases:['삼각형 세기','크고 작은 삼각형','선분']},
    {id:'f8-cube-views-min-max',domain:'geometry',middle:'입체도형',label:'정면·위·옆 그림으로 블록 수 최솟값·최댓값 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'orthographic-cube-min-max',visualModel:'cube-orthographic-views',answerContract:'number-pair',generatorId:'final8-q08',rendererId:'reviewed-raster',searchAliases:['쌓기나무','세 방향','최솟값 최댓값']},
    {id:'f8-clock-right-angle-count',domain:'measurement',middle:'시각과 시간',label:'시침·분침이 직각을 이루는 횟수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'clock-hand-angle-interval',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q09',rendererId:'text-block',searchAliases:['시침 분침 직각','몇 시간 동안','시계 각도']},
    {id:'f8-missing-house-number',domain:'number',middle:'우기기/가정하여 풀기',label:'빠진 집 번호를 합과 나눗셈 조건으로 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'gap-in-consecutive-sum',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q10',rendererId:'text-block',searchAliases:['집 번호','빠진 수','자연수의 합']},
    {id:'f8-folded-hexagon-arrows',domain:'geometry',middle:'도형의 이동',label:'접고 펀칭한 도형에서 화살표가 가리키는 방향 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'fold-punch-orientation-trace',visualModel:'folded-hexagon-arrow-cells',answerContract:'single-choice',generatorId:'final8-q11',rendererId:'reviewed-raster',searchAliases:['접기','화살표','구멍 뚫기']},
    {id:'f8-same-weekday-dates',domain:'measurement',middle:'달력과 시간',label:'두 달 뒤 같은 요일 날짜 개수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'calendar-modular-weekday-count',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q12',rendererId:'text-block',searchAliases:['같은 요일','달력','날짜 개수']},
    {id:'f8-triangle-number-count',domain:'geometry',middle:'도형 세기',label:'삼각 배열에서 조각 개수를 넘는 삼각형 세기',gradeBand:{from:'g3',to:'g5'},solvingModel:'triangular-region-count-threshold',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q13',rendererId:'text-block',searchAliases:['삼각형 배열','조각 세기','삼각형 개수']},
    {id:'f8-four-pair-sums-largest',domain:'number',middle:'합과 차',label:'네 수 여섯 쌍의 합으로 가장 큰 수와 전체 합 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'six-pair-sums-to-four-values',visualModel:'text-only',answerContract:'number-pair',generatorId:'final8-q14',rendererId:'text-block',searchAliases:['두 수의 합','가장 큰 수','여섯 합']},
    {id:'f8-go-stones-n-step',domain:'number',middle:'도형 배열의 규칙',label:'바둑돌 단계 배열에서 n단계 개수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'figurate-number-pattern',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q15',rendererId:'text-block',searchAliases:['바둑돌','단계별 개수','규칙적 배열']},
    {id:'f8-horizontal-covers-sum',domain:'number',middle:'우기기/가정하여 풀기',label:'수평 덮개 개수와 카드 합 조건으로 빈칸 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'cover-card-complement-count',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q16',rendererId:'text-block',searchAliases:['덮개','카드 합','빈 칸']},
    {id:'f8-jobs-logic-puzzle',domain:'logic',middle:'조건의 논리',label:'여섯 조건으로 세 사람의 직업 쌍 결정하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'constraint-propagation-job-assignment',visualModel:'text-only',answerContract:'person-job-assignment',generatorId:'final8-q17',rendererId:'text-block',searchAliases:['직업 논리','조건 추론','A B C 직업']},
    {id:'f8-repeated-product-range',domain:'number',middle:'곱셈과 나눗셈',label:'반복 곱셈 과정의 최솟값·최댓값 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'iterated-product-range',visualModel:'text-only',answerContract:'number-pair',generatorId:'final8-q18',rendererId:'text-block',searchAliases:['반복 곱셈','최솟값','최댓값']},
    {id:'f8-sequence-target-position',domain:'number',middle:'군수열/묶음수열',label:'등차 묶음 수열에서 목표 수의 순번 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'arithmetic-group-position-formula',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q19',rendererId:'text-block',searchAliases:['묶음 수열','몇 번째','목표 수']},
    {id:'f8-dumpling-distribution',domain:'combinatorics',middle:'분배와 배열',label:'일부 남긴 만두 분배의 경우의 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'distribution-with-remainder',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q20',rendererId:'text-block',searchAliases:['만두 분배','경우의 수','나누어 주기']},
    {id:'f8-ring-stack-sum',domain:'number',middle:'도형 배열의 규칙',label:'가운데 빈 정사각형 테두리 단계 합 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'square-ring-arithmetic-series',visualModel:'square-ring-stacks',answerContract:'single-number',generatorId:'final8-q21',rendererId:'reviewed-raster',searchAliases:['쌓기나무 테두리','가운데 빈 정사각형','단계 합']},
    {id:'f8-stair-game-wins',domain:'number',middle:'우기기/가정하여 풀기',label:'계단 가위바위보 게임에서 이긴 횟수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'stair-position-difference-equation',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q22',rendererId:'text-block',searchAliases:['계단 게임','이긴 횟수','위치 차이']},
    {id:'f8-blocked-grid-paths',domain:'combinatorics',middle:'길 찾기',label:'막힌 칸이 있는 격자 경로의 수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'grid-path-count-with-obstacles',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q23',rendererId:'text-block',searchAliases:['격자 경로','막힌 칸','경우의 수']},
    {id:'f8-cable-car-pairs',domain:'combinatorics',middle:'경우의 수',label:'케이블카 탑승 쌍 구성의 경우의 수',gradeBand:{from:'g3',to:'g5'},solvingModel:'pair-selection-constraint',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q24',rendererId:'text-block',searchAliases:['케이블카','탑승 쌍','경우의 수']},
    {id:'f8-route-tiles-path-count',domain:'combinatorics',middle:'길 찾기',label:'최단 경로에서 경유 지점 방법 수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'waypoint-shortest-path-product',visualModel:'route-tile-grid',answerContract:'single-number',generatorId:'final8-q25',rendererId:'reviewed-raster',searchAliases:['최단 경로','경유 지점','길의 수']},
    {id:'f8-room-capacity-time',domain:'number',middle:'규칙과 과정',label:'주기적 출입 규칙에서 처음 정원이 꽉 차는 시각',gradeBand:{from:'g3',to:'g5'},solvingModel:'periodic-occupancy-threshold',visualModel:'text-only',answerContract:'single-time',generatorId:'final8-q26',rendererId:'text-block',searchAliases:['게임방 정원','출입 규칙','처음 만원']},
    {id:'f8-frog-circular-jump',domain:'number',middle:'원형 이동',label:'점프 거리가 차례로 증가하는 원형 이동 위치',gradeBand:{from:'g3',to:'g5'},solvingModel:'triangular-number-mod-circular-position',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q27',rendererId:'text-block',searchAliases:['개구리 점프','징검다리','원형 이동']},
    {id:'f8-calculator-stop-count',domain:'number',middle:'연산 과정의 역추적',label:'정확히 n번 눌러 1이 되는 시작 자연수 개수',gradeBand:{from:'g4',to:'g6'},solvingModel:'reverse-collatz-tree-count',visualModel:'text-only',answerContract:'single-number',generatorId:'final8-q28',rendererId:'text-block',searchAliases:['계산기','홀짝 규칙','역추적']},
    {id:'f8-alphametics-valid-count',domain:'number',middle:'복면산',label:'성립 가능한 알파벳 덧셈식 개수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'alphametic-brute-force-count',visualModel:'alphametic-word-grid',answerContract:'single-number',generatorId:'final8-q29',rendererId:'reviewed-raster',searchAliases:['복면산','알파벳 덧셈','성립 가능한']},
    {id:'f8-joined-cubes-matchsticks',domain:'geometry',middle:'도형 세기',label:'붙어 있는 정육면체 묶음의 성냥개비 개수',gradeBand:{from:'g3',to:'g5'},solvingModel:'shared-edge-count-by-direction',visualModel:'isometric-cube-cluster',answerContract:'single-number',generatorId:'final8-q30',rendererId:'reviewed-raster',searchAliases:['성냥개비 정육면체','모서리 세기','붙어 있는 정육면체']}
  ];
  var typeById = new Map(types.map(function (type) { return [type.id, type]; }));
  var typeIdByNo = Object.fromEntries(types.map(function (type) { return [Number(type.generatorId.slice(-2)), type.id]; }));
  var visualByNo = {1:'two-road:car-gap-diagram',2:'text:digit-conditions',3:'text:dice-truth-lie',4:'text:pair-means',5:'text:append-divide',6:'grid:serpentine-four-row',7:'triangle:interior-lines',8:'cube:orthographic-views',9:'text:clock-right-angle',10:'text:missing-house',11:'hexagon:fold-arrow',12:'text:same-weekday',13:'text:triangle-count',14:'text:four-pair-sums',15:'text:go-stones',16:'text:horizontal-covers',17:'text:jobs-logic',18:'text:repeated-product',19:'text:group-sequence-position',20:'text:dumpling-distribution',21:'cube-ring:ring-stack-sum',22:'text:stair-game',23:'text:blocked-grid',24:'text:cable-car',25:'grid:route-tiles',26:'text:room-capacity',27:'text:frog-jump',28:'text:calculator-stop',29:'alphametic:word-grid',30:'cube:joined-matchsticks'};
  var unitByNo = {1:'m',2:'',3:'',4:'',5:'',6:'',7:'개',8:'',9:'번',10:'번',11:'',12:'개',13:'개',14:'',15:'개',16:'개',17:'',18:'',19:'번째',20:'가지',21:'개',22:'판',23:'가지',24:'가지',25:'가지',26:'',27:'번',28:'개',29:'개',30:'개'};

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function useData(value) { data = value; return adapter; }
  function requireData() { if (!data) throw new Error('최종 8회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/final8-reviewed.json?v=1', {cache:'no-cache'}).then(function (response) {
      if (!response.ok) throw new Error('최종 8회 검수 문항을 불러오지 못했습니다.');
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
        sourceKey:'gfield:final:' + edition + ':round-08:q' + String(no).padStart(3,'0'),
        sourceSeriesId:sourceSeriesId,
        edition:edition,
        sourceLocator:{set:'final',round:8,questionNo:no},
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
  var adapter = {adapterVersion:'1.0',id:'gfield-final8-reviewed',label:'지필드 최종 8회 검수 문항',listTypes:listTypes,listSourceItems:listSourceItems,getGenerator:getGenerator,getRenderer:getRenderer,validateSourceItem:validateSourceItem,useData:useData,load:load};
  return adapter;
});
