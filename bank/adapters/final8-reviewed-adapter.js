/* Thin adapter around the reviewed Final 8 fixed-item export. */
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
  {
    "id": "두-도로의-길이-차로-자동차-길이-역산",
    "domain": "number",
    "middle": "두 도로의 길이 차로 자동차 길이 역산",
    "label": "두 도로의 길이 차로 자동차 길이 역산",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "두-도로의-길이-차로-자동차-길이-역산",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q01",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "두 도로의 길이 차로 자동차 길이 역산"
    ]
  },
  {
    "id": "자리-숫자의-합·곱으로-네-자리-수-극값-찾기",
    "domain": "number",
    "middle": "자리 숫자의 합",
    "label": "자리 숫자의 합·곱으로 네 자리 수 극값 찾기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "자리-숫자의-합·곱으로-네-자리-수-극값-찾기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q02",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "자리 숫자의 합·곱으로 네 자리 수 극값 찾기"
    ]
  },
  {
    "id": "두-명제의-참·거짓으로-주사위-곱-극값-찾기",
    "domain": "number",
    "middle": "두 명제의 참",
    "label": "두 명제의 참·거짓으로 주사위 곱 극값 찾기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "두-명제의-참·거짓으로-주사위-곱-극값-찾기",
    "visualModel": "text-only",
    "answerContract": "single-value",
    "generatorId": "final8-q03",
    "rendererId": "text-block",
    "searchAliases": [
      "두 명제의 참·거짓으로 주사위 곱 극값 찾기"
    ]
  },
  {
    "id": "네-수의-여섯-쌍-평균으로-가장-큰-수-찾기",
    "domain": "number",
    "middle": "네 수의 여섯 쌍 평균으로 가장 큰 수 찾기",
    "label": "네 수의 여섯 쌍 평균으로 가장 큰 수 찾기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "네-수의-여섯-쌍-평균으로-가장-큰-수-찾기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q04",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "네 수의 여섯 쌍 평균으로 가장 큰 수 찾기"
    ]
  },
  {
    "id": "숫자-이어-쓰기와-나눗셈-조건",
    "domain": "number",
    "middle": "숫자 이어 쓰기와 나눗셈 조건",
    "label": "숫자 이어 쓰기와 나눗셈 조건",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "숫자-이어-쓰기와-나눗셈-조건",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q05",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "숫자 이어 쓰기와 나눗셈 조건"
    ]
  },
  {
    "id": "방향이-바뀌는-수-배열의-같은-열-찾기",
    "domain": "number",
    "middle": "방향이 바뀌는 수 배열의 같은 열 찾기",
    "label": "방향이 바뀌는 수 배열의 같은 열 찾기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "방향이-바뀌는-수-배열의-같은-열-찾기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q06",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "방향이 바뀌는 수 배열의 같은 열 찾기"
    ]
  },
  {
    "id": "그려진-선으로-만들어지는-삼각형-전수-세기",
    "domain": "number",
    "middle": "그려진 선으로 만들어지는 삼각형 전수 세기",
    "label": "그려진 선으로 만들어지는 삼각형 전수 세기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "그려진-선으로-만들어지는-삼각형-전수-세기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q07",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "그려진 선으로 만들어지는 삼각형 전수 세기"
    ]
  },
  {
    "id": "위·앞·옆-투영으로-쌓기나무-개수-범위",
    "domain": "number",
    "middle": "위",
    "label": "위·앞·옆 투영으로 쌓기나무 개수 범위",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "위·앞·옆-투영으로-쌓기나무-개수-범위",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q08",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "위·앞·옆 투영으로 쌓기나무 개수 범위"
    ]
  },
  {
    "id": "시침·분침이-직각을-이루는-횟수",
    "domain": "number",
    "middle": "시침",
    "label": "시침·분침이 직각을 이루는 횟수",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "시침·분침이-직각을-이루는-횟수",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q09",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "시침·분침이 직각을 이루는 횟수"
    ]
  },
  {
    "id": "연속-집-번호-합에서-빠진-번지-역산",
    "domain": "number",
    "middle": "연속 집 번호 합에서 빠진 번지 역산",
    "label": "연속 집 번호 합에서 빠진 번지 역산",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "연속-집-번호-합에서-빠진-번지-역산",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q10",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "연속 집 번호 합에서 빠진 번지 역산"
    ]
  },
  {
    "id": "정육면체-전개도-다섯-보기-비교",
    "domain": "number",
    "middle": "정육면체 전개도 다섯 보기 비교",
    "label": "정육면체 전개도 다섯 보기 비교",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "정육면체-전개도-다섯-보기-비교",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q11",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "정육면체 전개도 다섯 보기 비교"
    ]
  },
  {
    "id": "같은-요일-두-날짜의-합으로-말일-요일-찾기",
    "domain": "number",
    "middle": "같은 요일 두 날짜의 합으로 말일 요일 찾기",
    "label": "같은 요일 두 날짜의 합으로 말일 요일 찾기",
    "gradeBand": {
      "from": "g3",
      "to": "g5"
    },
    "solvingModel": "같은-요일-두-날짜의-합으로-말일-요일-찾기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q12",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "같은 요일 두 날짜의 합으로 말일 요일 찾기"
    ]
  },
  {
    "id": "연속-자연수-합의-배수-판별",
    "domain": "number",
    "middle": "연속 자연수 합의 배수 판별",
    "label": "연속 자연수 합의 배수 판별",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "연속-자연수-합의-배수-판별",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q13",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "연속 자연수 합의 배수 판별"
    ]
  },
  {
    "id": "네-수의-모든-두-수-합으로-각-수-역산",
    "domain": "number",
    "middle": "네 수의 모든 두 수 합으로 각 수 역산",
    "label": "네 수의 모든 두 수 합으로 각 수 역산",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "네-수의-모든-두-수-합으로-각-수-역산",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q14",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "네 수의 모든 두 수 합으로 각 수 역산"
    ]
  },
  {
    "id": "검은색·흰색이-번갈아-놓인-마름모-바둑돌",
    "domain": "number",
    "middle": "검은색",
    "label": "검은색·흰색이 번갈아 놓인 마름모 바둑돌",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "검은색·흰색이-번갈아-놓인-마름모-바둑돌",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q15",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "검은색·흰색이 번갈아 놓인 마름모 바둑돌"
    ]
  },
  {
    "id": "가로-세-칸-가림막으로-남은-수-합의-극값",
    "domain": "number",
    "middle": "가로 세 칸 가림막으로 남은 수 합의 극값",
    "label": "가로 세 칸 가림막으로 남은 수 합의 극값",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "가로-세-칸-가림막으로-남은-수-합의-극값",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q16",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "가로 세 칸 가림막으로 남은 수 합의 극값"
    ]
  },
  {
    "id": "관계-이야기와-표로-두-직업씩-가진-세-사람-추리",
    "domain": "number",
    "middle": "관계 이야기와 표로 두 직업씩 가진 세 사람 추리",
    "label": "관계 이야기와 표로 두 직업씩 가진 세 사람 추리",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "관계-이야기와-표로-두-직업씩-가진-세-사람-추리",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q17",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "관계 이야기와 표로 두 직업씩 가진 세 사람 추리"
    ]
  },
  {
    "id": "반복-숫자-곱셈에서-홀짝-숫자의-개수",
    "domain": "number",
    "middle": "반복 숫자 곱셈에서 홀짝 숫자의 개수",
    "label": "반복 숫자 곱셈에서 홀짝 숫자의 개수",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "반복-숫자-곱셈에서-홀짝-숫자의-개수",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q18",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "반복 숫자 곱셈에서 홀짝 숫자의 개수"
    ]
  },
  {
    "id": "다섯-수-묶음의-반복으로-수의-순번-찾기",
    "domain": "number",
    "middle": "다섯 수 묶음의 반복으로 수의 순번 찾기",
    "label": "다섯 수 묶음의 반복으로 수의 순번 찾기",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "다섯-수-묶음의-반복으로-수의-순번-찾기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q19",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "다섯 수 묶음의 반복으로 수의 순번 찾기"
    ]
  },
  {
    "id": "원형-이웃-간-최소-전달로-수량-같게-하기",
    "domain": "number",
    "middle": "원형 이웃 간 최소 전달로 수량 같게 하기",
    "label": "원형 이웃 간 최소 전달로 수량 같게 하기",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "원형-이웃-간-최소-전달로-수량-같게-하기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q20",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "원형 이웃 간 최소 전달로 수량 같게 하기"
    ]
  },
  {
    "id": "가운데-빈-한-층-정사각형-테두리의-단계-합",
    "domain": "number",
    "middle": "가운데 빈 한 층 정사각형 테두리의 단계 합",
    "label": "가운데 빈 한 층 정사각형 테두리의 단계 합",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "가운데-빈-한-층-정사각형-테두리의-단계-합",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q21",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "가운데 빈 한 층 정사각형 테두리의 단계 합"
    ]
  },
  {
    "id": "두-사람-계단-위치-차로-승리-횟수-역산",
    "domain": "number",
    "middle": "두 사람 계단 위치 차로 승리 횟수 역산",
    "label": "두 사람 계단 위치 차로 승리 횟수 역산",
    "gradeBand": {
      "from": "g4",
      "to": "g5"
    },
    "solvingModel": "두-사람-계단-위치-차로-승리-횟수-역산",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q22",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "두 사람 계단 위치 차로 승리 횟수 역산"
    ]
  },
  {
    "id": "지나갈-수-없는-변이-있는-격자-최단경로",
    "domain": "number",
    "middle": "지나갈 수 없는 변이 있는 격자 최단경로",
    "label": "지나갈 수 없는 변이 있는 격자 최단경로",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "지나갈-수-없는-변이-있는-격자-최단경로",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q23",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "지나갈 수 없는 변이 있는 격자 최단경로"
    ]
  },
  {
    "id": "출발-주기와-소요-시간으로-마감-전-도착-인원-세기",
    "domain": "number",
    "middle": "출발 주기와 소요 시간으로 마감 전 도착 인원 세기",
    "label": "출발 주기와 소요 시간으로 마감 전 도착 인원 세기",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "출발-주기와-소요-시간으로-마감-전-도착-인원-세기",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q24",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "출발 주기와 소요 시간으로 마감 전 도착 인원 세기"
    ]
  },
  {
    "id": "방향-블록을-한-번씩-놓는-최단시간",
    "domain": "number",
    "middle": "방향 블록을 한 번씩 놓는 최단시간",
    "label": "방향 블록을 한 번씩 놓는 최단시간",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "방향-블록을-한-번씩-놓는-최단시간",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q25",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "방향 블록을 한 번씩 놓는 최단시간"
    ]
  },
  {
    "id": "서로-다른-두-주기의-출입으로-처음-만원-되는-시각",
    "domain": "number",
    "middle": "서로 다른 두 주기의 출입으로 처음 만원 되는 시각",
    "label": "서로 다른 두 주기의 출입으로 처음 만원 되는 시각",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "서로-다른-두-주기의-출입으로-처음-만원-되는-시각",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q26",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "서로 다른 두 주기의 출입으로 처음 만원 되는 시각"
    ]
  },
  {
    "id": "점프-거리가-차례로-증가하는-원형-이동",
    "domain": "number",
    "middle": "점프 거리가 차례로 증가하는 원형 이동",
    "label": "점프 거리가 차례로 증가하는 원형 이동",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "점프-거리가-차례로-증가하는-원형-이동",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q27",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "점프 거리가 차례로 증가하는 원형 이동"
    ]
  },
  {
    "id": "1에서-멈추는-홀짝-계산기의-시작-수-역산",
    "domain": "number",
    "middle": "1에서 멈추는 홀짝 계산기의 시작 수 역산",
    "label": "1에서 멈추는 홀짝 계산기의 시작 수 역산",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "1에서-멈추는-홀짝-계산기의-시작-수-역산",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q28",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "1에서 멈추는 홀짝 계산기의 시작 수 역산"
    ]
  },
  {
    "id": "자릿수·받아올림으로-다섯-덧셈식의-성립-판단",
    "domain": "number",
    "middle": "자릿수",
    "label": "자릿수·받아올림으로 다섯 덧셈식의 성립 판단",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "자릿수·받아올림으로-다섯-덧셈식의-성립-판단",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q29",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "자릿수·받아올림으로 다섯 덧셈식의 성립 판단"
    ]
  },
  {
    "id": "면-하나를-공유하며-붙이는-정육면체-성냥개비",
    "domain": "number",
    "middle": "면 하나를 공유하며 붙이는 정육면체 성냥개비",
    "label": "면 하나를 공유하며 붙이는 정육면체 성냥개비",
    "gradeBand": {
      "from": "g4",
      "to": "g6"
    },
    "solvingModel": "면-하나를-공유하며-붙이는-정육면체-성냥개비",
    "visualModel": "figure",
    "answerContract": "single-value",
    "generatorId": "final8-q30",
    "rendererId": "reviewed-raster",
    "searchAliases": [
      "면 하나를 공유하며 붙이는 정육면체 성냥개비"
    ]
  }
];
  var typeById = new Map(types.map(function (t) { return [t.id, t]; }));
  var typeIdByNo = Object.fromEntries(types.map(function (t, i) { return [i + 1, t.id]; }));

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function useData(v) { data = v; return adapter; }
  function requireData() { if (!data) throw new Error('최종 8회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/final8-reviewed.json?v=20261005-final8', {cache:'no-cache'})
      .then(function (r) { if (!r.ok) throw new Error('최종 8회 검수 문항을 불러오지 못했습니다.'); return r.json(); })
      .then(function (v) { data = v; return v; })
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
        sourceKey: 'gfield:final:' + edition + ':round-08:q' + String(no).padStart(3, '0'),
        sourceSeriesId: sourceSeriesId,
        edition: edition,
        sourceLocator: {set:'final', round:8, questionNo:no},
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
    adapterVersion: '1.0',
    id: 'gfield-final8-reviewed',
    label: '지필드 최종 8회 검수 문항',
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
