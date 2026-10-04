/* Thin adapter around the existing reviewed Last 1 (최종 실전 1회) fixed-item export. */
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
  var sourceSeriesId = 'gfield-last';
  var edition = '2026';
  var types = [
    {id:'l1-book-page-digit',domain:'number',middle:'수의 성질',label:'책 쪽수 범위에서 특정 숫자가 적힌 쪽 세기',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-count-in-range',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q01',rendererId:'text-block',searchAliases:['쪽수','숫자가 적힌 쪽','몇 쪽']},
    {id:'l1-two-weekday-sum',domain:'number',middle:'달력과 시간',label:'두 요일의 날짜 합으로 1일의 요일 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'calendar-two-weekday-sum',visualModel:'text-only',answerContract:'single-choice',generatorId:'last1-q02',rendererId:'text-block',searchAliases:['요일 날짜 합','달력','1일 요일']},
    {id:'l1-repeating-decimal-digit',domain:'number',middle:'순환소수',label:'순환소수의 특정 자리 숫자 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'cyclic-decimal-position',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q03',rendererId:'text-block',searchAliases:['순환소수','소수 자리','반복마디']},
    {id:'l1-arithmetic-seq-endpoints',domain:'number',middle:'등차수열',label:'등차수열의 부분합으로 첫째와 끝 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'arithmetic-seq-partial-sum',visualModel:'text-only',answerContract:'number-pair',generatorId:'last1-q04',rendererId:'text-block',searchAliases:['등차수열','부분합','처음과 끝']},
    {id:'l1-two-clock-difference',domain:'measurement',middle:'시각과 시간',label:'빠르고 늦은 두 시계의 오차 합 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'clock-error-accumulation',visualModel:'text-only',answerContract:'time-duration',generatorId:'last1-q05',rendererId:'text-block',searchAliases:['빠른 시계','늦은 시계','시계 오차']},
    {id:'l1-number-array-position',domain:'number',middle:'규칙 배열',label:'수 배열 규칙에서 특정 위치의 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'grid-position-value',visualModel:'number-grid-array',answerContract:'single-number',generatorId:'last1-q06',rendererId:'reviewed-raster',searchAliases:['수 배열','위치','규칙']},
    {id:'l1-count-comparison',domain:'number',middle:'수 비교',label:'그림 자료에서 두 수량의 차 비교하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'count-difference',visualModel:'count-comparison-visual',answerContract:'comparative-value',generatorId:'last1-q07',rendererId:'reviewed-raster',searchAliases:['수량 비교','차이','ㄱ이 더 많습니다']},
    {id:'l1-circle-opposite-seat',domain:'number',middle:'원형 배열',label:'원형으로 앉은 사람의 맞은편 번호 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'circular-arrangement-opposite',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q08',rendererId:'text-block',searchAliases:['원형 배치','맞은편','번호']},
    {id:'l1-digit-sum-count',domain:'number',middle:'수의 성질',label:'자리 숫자의 합이 주어진 값인 수의 개수',gradeBand:{from:'g3',to:'g5'},solvingModel:'digit-sum-enumeration',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q09',rendererId:'text-block',searchAliases:['자리 숫자의 합','몇 개','1부터 1000']},
    {id:'l1-four-person-pair-sums',domain:'number',middle:'합과 차',label:'네 사람의 여섯 쌍합으로 가장 큰 개인 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'six-pair-sums-to-max-value',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q10',rendererId:'text-block',searchAliases:['여섯 쌍합','가장 큰 수','두 사람의 합']},
    {id:'l1-rule-sequence-value',domain:'number',middle:'규칙과 과정',label:'조건에 맞는 수 찾기',gradeBand:{from:'g3',to:'g5'},solvingModel:'rule-based-sequence',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q11',rendererId:'text-block',searchAliases:['조건','규칙','수 찾기']},
    {id:'l1-calendar-count',domain:'measurement',middle:'달력과 시간',label:'달력 조건에서 개수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'calendar-count',visualModel:'calendar-visual',answerContract:'single-number',generatorId:'last1-q12',rendererId:'reviewed-raster',searchAliases:['달력','개수','조건']},
    {id:'l1-condition-number-set',domain:'logic',middle:'조건 추론',label:'조건에 맞는 수 전체 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'condition-set-enumeration',visualModel:'number-condition-diagram',answerContract:'number-list',generatorId:'last1-q13',rendererId:'reviewed-raster',searchAliases:['조건에 맞는 수','모두 구하기','추론']},
    {id:'l1-three-number-conditions',domain:'number',middle:'합과 차',label:'조건에 맞는 세 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'three-number-system',visualModel:'text-only',answerContract:'ordered-triple',generatorId:'last1-q14',rendererId:'text-block',searchAliases:['세 수','조건','합']},
    {id:'l1-figurate-rule',domain:'number',middle:'도형 배열의 규칙',label:'도형 배열 규칙에서 특정 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'figurate-pattern-value',visualModel:'figurate-pattern',answerContract:'single-number',generatorId:'last1-q15',rendererId:'reviewed-raster',searchAliases:['도형 배열','규칙','수']},
    {id:'l1-assumption-solve',domain:'number',middle:'우기기/가정하여 풀기',label:'가정하여 조건에 맞는 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'assumption-method',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q16',rendererId:'text-block',searchAliases:['가정하여 풀기','조건','개수']},
    {id:'l1-visual-count-pattern',domain:'number',middle:'경우의 수',label:'그림 조건에서 개수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'visual-count-by-pattern',visualModel:'count-pattern-visual',answerContract:'single-number',generatorId:'last1-q17',rendererId:'reviewed-raster',searchAliases:['그림','개수','패턴']},
    {id:'l1-combination-count',domain:'combinatorics',middle:'경우의 수',label:'조건에 맞는 경우의 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'combination-count',visualModel:'combination-visual',answerContract:'single-number',generatorId:'last1-q18',rendererId:'reviewed-raster',searchAliases:['경우의 수','조합','가지']},
    {id:'l1-card-count-combination',domain:'combinatorics',middle:'경우의 수',label:'조건에 맞는 장수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'card-combination',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q19',rendererId:'text-block',searchAliases:['장수','경우의 수','조합']},
    {id:'l1-shape-count',domain:'geometry',middle:'도형 세기',label:'도형 조건에서 특정 수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'shape-enumeration',visualModel:'shape-diagram',answerContract:'single-number',generatorId:'last1-q20',rendererId:'reviewed-raster',searchAliases:['도형','개수','세기']},
    {id:'l1-array-count-rule',domain:'number',middle:'규칙과 과정',label:'규칙 배열에서 개수 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'array-count-by-rule',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q21',rendererId:'text-block',searchAliases:['배열','규칙','개수']},
    {id:'two-group-complement-total',domain:'combinatorics',middle:'포함과 배제',label:'두 집단의 여집합 수와 두 집단의 합으로 나머지 인원 구하기',gradeBand:{from:'g3',to:'g5'},solvingModel:'two-group-complement',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q22',rendererId:'text-block',searchAliases:['두 집단','여집합','나머지']},
    {id:'l1-number-array-rule',domain:'geometry',middle:'수 배열',label:'수 배열 규칙에서 수 찾기',gradeBand:{from:'g4',to:'g6'},solvingModel:'number-array-position',visualModel:'number-array-visual',answerContract:'single-number',generatorId:'last1-q23',rendererId:'reviewed-raster',searchAliases:['수 배열','규칙','위치']},
    {id:'l1-operation-rule-value',domain:'number',middle:'연산 규칙',label:'연산 규칙에서 특정 값 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'operation-rule',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q24',rendererId:'text-block',searchAliases:['연산 규칙','값','특정']},
    {id:'l1-condition-combination',domain:'combinatorics',middle:'경우의 수',label:'조건에 맞는 경우의 수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'conditional-combination',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q25',rendererId:'text-block',searchAliases:['경우의 수','조건','개']},
    {id:'l1-operation-process-value',domain:'number',middle:'연산 과정',label:'수식에서 조건에 맞는 값 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'operation-process',visualModel:'operation-visual',answerContract:'single-number',generatorId:'last1-q26',rendererId:'reviewed-raster',searchAliases:['수식','연산','값']},
    {id:'l1-job-assignment',domain:'logic',middle:'조건 추론',label:'여섯 조건으로 세 사람의 직업 쌍 결정하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'job-assignment-logic',visualModel:'text-only',answerContract:'person-job-assignment',generatorId:'last1-q27',rendererId:'text-block',searchAliases:['직업','논리','조건']},
    {id:'l1-systematic-count-1',domain:'combinatorics',middle:'경우의 수',label:'조건에 맞는 경우의 수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'systematic-enumeration',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q28',rendererId:'text-block',searchAliases:['경우의 수','체계적 세기','가지']},
    {id:'l1-systematic-count-2',domain:'combinatorics',middle:'경우의 수',label:'조건에 맞는 경우의 수 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'systematic-enumeration-2',visualModel:'text-only',answerContract:'single-number',generatorId:'last1-q29',rendererId:'text-block',searchAliases:['경우의 수','조합','가지']},
    {id:'l1-symbol-value',domain:'geometry',middle:'규칙과 과정',label:'기호 연산에서 각 기호 값 구하기',gradeBand:{from:'g4',to:'g6'},solvingModel:'symbol-system',visualModel:'symbol-diagram',answerContract:'symbol-assignment',generatorId:'last1-q30',rendererId:'reviewed-raster',searchAliases:['기호','연산','값']}
  ];
  var typeById = new Map(types.map(function (type) { return [type.id, type]; }));
  var typeIdByNo = Object.fromEntries(types.map(function (type) {
    return [Number(type.generatorId.slice(-2)), type.id];
  }));
  var visualByNo = {
    1:'text:digit-count',2:'text:calendar-weekday-sum',3:'text:repeating-decimal',4:'text:arithmetic-seq',5:'text:clock-error',
    6:'grid:number-array',7:'visual:count-comparison',8:'text:circle-opposite',9:'text:digit-sum-count',10:'text:pair-sums',
    11:'text:rule-sequence',12:'calendar:count',13:'diagram:condition-set',14:'text:three-numbers',15:'pattern:figurate',
    16:'text:assumption-solve',17:'visual:count-pattern',18:'visual:combination',19:'text:card-count',20:'diagram:shape-count',
    21:'text:array-count',22:'text:two-group-complement',23:'visual:number-array',24:'text:operation-rule',25:'text:condition-combination',
    26:'visual:operation-process',27:'text:job-assignment',28:'text:systematic-count',29:'text:systematic-count-2',30:'diagram:symbol-value'
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function useData(value) { data = value; return adapter; }
  function requireData() { if (!data) throw new Error('최종 실전 1회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/last1-reviewed.json?v=20261004-last1', {cache:'no-cache'}).then(function (response) {
      if (!response.ok) throw new Error('최종 실전 1회 검수 문항을 불러오지 못했습니다.');
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
        sourceKey:'gfield:last:' + edition + ':round-01:q' + String(no).padStart(3,'0'),
        sourceSeriesId:sourceSeriesId,
        edition:edition,
        sourceLocator:{set:'last',round:1,questionNo:no},
        sourceTypeLabel:first.detailType,
        typeIds:[typeIdByNo[no]],
        difficulty:'actual',
        answerContract:typeById.get(typeIdByNo[no]).answerContract,
        visualSignature:visualByNo[no],
        sourceFidelity:'structure-matched',
        verificationStatus:first.reviewStatus === 'verified' ? 'verified' : 'pending',
        rights:'private-source-derived-variant',
        sourceMeta:{pointBand:first.pointBand,area:first.area,subarea:first.subarea,answerUnit:'',variantCount:value.items.filter(function (item) { return Number(item.sourceNo) === Number(no); }).length}
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
  var adapter = {adapterVersion:'2.0',id:'gfield-last1-reviewed',label:'지필드 최종 실전 1회 검수 문항',listTypes:listTypes,listSourceItems:listSourceItems,getGenerator:getGenerator,getRenderer:getRenderer,validateSourceItem:validateSourceItem,useData:useData,load:load};
  return adapter;
});
