/* Thin adapter around the reviewed Last 1 fixed-item export. */
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
  {
    "id": "last1-q01-type",
    "domain": "number",
    "middle": "연산",
    "label": "어떤 동화책에 쪽수가 1쪽에서 260쪽까지 적혀 있을 …",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q01",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q01",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q01"
    ]
  },
  {
    "id": "last1-q02-type",
    "domain": "number",
    "middle": "연산",
    "label": "어느 달의 수요일과 목요일의 날짜를 모두 더하였더니 1…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q02",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q02",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q02"
    ]
  },
  {
    "id": "last1-q03-type",
    "domain": "number",
    "middle": "연산",
    "label": "9/7을 소수로 나타내면 1.285714285714…로…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q03",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q03",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q03"
    ]
  },
  {
    "id": "last1-q04-type",
    "domain": "number",
    "middle": "연산",
    "label": "차가 일정한 어떤 수들을 첫 번째 수부터 7번째 수까지…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q04",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q04",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q04"
    ]
  },
  {
    "id": "last1-q05-type",
    "domain": "number",
    "middle": "연산",
    "label": "1시간에 2분씩 빨리 가는 벽시계와 1시간에 45초씩 …",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q05",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q05",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q05"
    ]
  },
  {
    "id": "last1-q06-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음과 같이 앞면과 뒷면에 같은 수가 쓰인 모눈종이가 …",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q06",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q06",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q06"
    ]
  },
  {
    "id": "last1-q07-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음 도형에서 ㄱ을 포함하는 사각형과 ㄴ을 포함하는 사…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q07",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q07",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q07"
    ]
  },
  {
    "id": "last1-q08-type",
    "domain": "number",
    "middle": "연산",
    "label": "1번부터 240번까지 번호를 붙인 240명의 어린이가 …",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q08",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q08",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q08"
    ]
  },
  {
    "id": "last1-q09-type",
    "domain": "number",
    "middle": "연산",
    "label": "1부터 1000까지의 수 중 각 자리 숫자의 합이 8인…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q09",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q09",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q09"
    ]
  },
  {
    "id": "last1-q10-type",
    "domain": "number",
    "middle": "연산",
    "label": "동욱, 진일, 덕수, 병성이가 철봉에서 턱걸이를 했습니…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q10",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q10",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q10"
    ]
  },
  {
    "id": "last1-q11-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음 도형이 나타내는 수는 아래에 있는 네 수 중 하나…",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q11",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q11",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q11"
    ]
  },
  {
    "id": "last1-q12-type",
    "domain": "number",
    "middle": "연산",
    "label": "그림과 같은 정팔각형에서 대각선을 그어 똑같은 삼각형 …",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "last1-q12",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q12",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q12"
    ]
  },
  {
    "id": "last1-q13-type",
    "domain": "number",
    "middle": "연산",
    "label": "어느 배가 폭풍을 만나 난파되었습니다. 그 배에는 20…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q13",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q13",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q13"
    ]
  },
  {
    "id": "last1-q14-type",
    "domain": "number",
    "middle": "연산",
    "label": "곱이 630이고, 합이 26인 3개의 자연수가 있습니다…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q14",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q14",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q14"
    ]
  },
  {
    "id": "last1-q15-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음에서 연속으로 이웃하는 칸 4개에 있는 수의 합이 …",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q15",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q15",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q15"
    ]
  },
  {
    "id": "last1-q16-type",
    "domain": "number",
    "middle": "연산",
    "label": "바둑돌을 안이 꽉 찬 정사각형 모양으로 늘어놓았더니 1…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q16",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q16",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q16"
    ]
  },
  {
    "id": "last1-q17-type",
    "domain": "number",
    "middle": "연산",
    "label": "검은 바둑돌 4개가 24cm, 36cm, 60cm 간격…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q17",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q17",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q17"
    ]
  },
  {
    "id": "last1-q18-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음과 같이 빨간색 2개, 노란색 2개, 파란색 2개,…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q18",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q18",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q18"
    ]
  },
  {
    "id": "last1-q19-type",
    "domain": "number",
    "middle": "연산",
    "label": "서랍 속에 색종이가 빨간색 6장, 노란색 5장, 파란색…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q19",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q19",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q19"
    ]
  },
  {
    "id": "last1-q20-type",
    "domain": "number",
    "middle": "연산",
    "label": "바둑판 모양으로 선이 그어진 판자의 한 칸 위에 왼쪽 …",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q20",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q20",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q20"
    ]
  },
  {
    "id": "last1-q21-type",
    "domain": "number",
    "middle": "연산",
    "label": "50개의 구슬을 5개의 상자에 나누어 담으려고 합니다.…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q21",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q21",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q21"
    ]
  },
  {
    "id": "last1-q22-type",
    "domain": "number",
    "middle": "연산",
    "label": "어느 초등학교 운동장에 각 학년 학생들이 모여 있습니다…",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "last1-q22",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q22",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q22"
    ]
  },
  {
    "id": "last1-q23-type",
    "domain": "number",
    "middle": "연산",
    "label": "그림과 같이 1에서 11까지의 숫자가 쓰여진 원판에서 …",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q23",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q23",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q23"
    ]
  },
  {
    "id": "last1-q24-type",
    "domain": "number",
    "middle": "연산",
    "label": "10부터 10000까지의 수가 있습니다. 이 중 322…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q24",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q24",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q24"
    ]
  },
  {
    "id": "last1-q25-type",
    "domain": "number",
    "middle": "연산",
    "label": "키보드에 알파벳 A를 치면 컴퓨터는 00001이라는 수…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q25",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q25",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q25"
    ]
  },
  {
    "id": "last1-q26-type",
    "domain": "number",
    "middle": "연산",
    "label": "아래 식을 계산하였을 때 마지막 네 자리 수는 얼마입니…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q26",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q26",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q26"
    ]
  },
  {
    "id": "last1-q27-type",
    "domain": "number",
    "middle": "연산",
    "label": "갑, 을, 병 세 사람은 각자 직업을 두 가지씩 가지고…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q27",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q27",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q27"
    ]
  },
  {
    "id": "last1-q28-type",
    "domain": "number",
    "middle": "연산",
    "label": "5개의 의자가 있고, 5명의 학생이 각자 자기 자리에 …",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q28",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q28",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q28"
    ]
  },
  {
    "id": "last1-q29-type",
    "domain": "number",
    "middle": "연산",
    "label": "1부터 6까지의 숫자를 사용하여 3자리로 된 비밀번호를…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q29",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "last1-q29",
    "rendererId": "text-block",
    "searchAliases": [
      "last1-q29"
    ]
  },
  {
    "id": "last1-q30-type",
    "domain": "number",
    "middle": "연산",
    "label": "다음 식에서 ㄱ, ㄴ, ㄷ, ㄹ은 각각 다른 숫자를 나…",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "last1-q30",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "last1-q30",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "last1-q30"
    ]
  }
];
  var typeById = new Map(types.map(function (t) { return [t.id, t]; }));
  var typeIdByNo = Object.fromEntries(types.map(function (t, i) { return [i + 1, t.id]; }));

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function useData(v) { data = v; return adapter; }
  function requireData() { if (!data) throw new Error('최종 1회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/last1-reviewed.json?v=20261005-last1', {cache:'no-cache'})
      .then(function (r) { if (!r.ok) throw new Error('최종 1회 검수 문항을 불러오지 못했습니다.'); return r.json(); })
      .then(function (v) { (v.items||[]).forEach(function (it) { ['asset','solutionAsset'].forEach(function (k) { if (typeof it[k] === 'string' && /^data:image\/png;base64,/.test(it[k])) it[k] = {kind:'raster', src:it[k], mimeType:'image/png', description:'문항 그림'}; }); if (!it.solution && Array.isArray(it.solutionSteps)) it.solution = it.solutionSteps.join(' '); }); data = v; return v; })
      .catch(function (e) { loadPromise = null; throw e; });
    return loadPromise;
  }
  function listTypes() { return clone(types); }
  function listSourceItems() {
    var value = requireData();
    return value.freezePolicy.availableSourceNos.map(function (no) {
      var first = value.items.find(function (item) { return Number(item.sourceNo) === Number(no); });
      var typeId = typeIdByNo[no];
      return {
        sourceKey: 'gfield:last:' + edition + ':round-01:q' + String(no).padStart(3, '0'),
        sourceSeriesId: sourceSeriesId,
        edition: edition,
        sourceLocator: {set:'last', round:1, questionNo:no},
        sourceTypeLabel: first ? first.text.slice(0, 40) : '',
        typeIds: [typeId],
        difficulty: 'actual',
        answerContract: typeById.get(typeId) ? typeById.get(typeId).answerContract : 'single-value',
        visualSignature: typeById.get(typeId) ? typeById.get(typeId).visualModel : 'text-only',
        sourceFidelity: 'structure-matched',
        verificationStatus: first && first.reviewStatus === 'verified' ? 'verified' : 'pending',
        rights: 'private-source-derived-variant',
        sourceMeta: {
          pointBand: first ? first.pointBand : '2.7',
          variantCount: value.items.filter(function (item) { return Number(item.sourceNo) === Number(no); }).length
        }
      };
    });
  }
  function getGenerator(generatorId) {
    var value = requireData();
    var items = value.items.filter(function (item) { return item.genId === generatorId; });
    return items.length ? {id:generatorId, kind:'stored-reviewed-variants', items:clone(items)} : null;
  }
  function getRenderer(rendererId) {
    if (rendererId === 'reviewed-raster') return {id:rendererId, kind:'raster-image', answerMarks:false};
    if (rendererId === 'text-block') return {id:rendererId, kind:'text-only'};
    return null;
  }
  function validateSourceItem(item) {
    var errors = [];
    if (!item || typeof item !== 'object') return ['source item is missing'];
    ['sourceKey','sourceSeriesId','typeIds','verificationStatus'].forEach(function (k) {
      if (item[k] == null || item[k] === '') errors.push(k + ' is missing');
    });
    return errors;
  }
  var adapter = {
    adapterVersion: '2.0',
    id: 'gfield-last1-reviewed',
    label: '지필드 최종 1회 검수 문항',
    listTypes: listTypes,
    listSourceItems: listSourceItems,
    getGenerator: getGenerator,
    getRenderer: getRenderer,
    validateSourceItem: validateSourceItem,
    useData: useData,
    load: load
  };
  return adapter;
});
