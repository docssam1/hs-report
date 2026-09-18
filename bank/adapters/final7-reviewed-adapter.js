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
    {id:'discard-two-move-one-card-queue',domain:'number',middle:'규칙과 과정',label:'카드 버리기와 옮기기를 반복한 뒤 남는 두 수의 합',gradeBand:{from:'g3',to:'g5'},solvingModel:'queue-discard-discard-rotate',visualModel:'text-only',answerContract:'single-number',generatorId:'final7-q16',rendererId:'text-block',searchAliases:['카드 버리기','맨 밑으로 옮기기','마지막 두 장']}
  ];
  var typeById = new Map(types.map(function (type) { return [type.id, type]; }));
  var typeIdByNo = {5:types[0].id,6:types[1].id,7:types[2].id,8:types[3].id,9:types[4].id,10:types[5].id,11:types[6].id,12:types[7].id,13:types[8].id,14:types[9].id,15:types[10].id,16:types[11].id};
  var visualByNo = {5:'hex-cells:path-count',6:'continuous-rope:oriented-fish',7:'text:digit-permutation-pages',8:'text:remainder-class-sum',9:'text:orthogonal-moves',10:'text:bounded-distinct-selection',11:'text:two-capacity-partial-last-seat',12:'recursive-quarter-shading:first-three-stages',13:'text:alternating-growing-runs',14:'text:cyclic-three-container-transfer',15:'grid:periodic-nonrepeating-arrow-path',16:'text:queue-discard-two-move-one'};
  var unitByNo = {5:'가지',6:'마리',7:'페이지',8:'',9:'',10:'',11:'개',12:'분수',13:'숫자·개수',14:'개·개·개',15:'행·열',16:''};

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function useData(value) { data = value; return adapter; }
  function requireData() { if (!data) throw new Error('최종 7회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/final7-reviewed.json?v=5', {cache:'no-cache'}).then(function (response) {
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
