/* Teacher-selected student question-bank types. Do not add or rename entries without teacher selection. */
(function(global){
  'use strict';
  global.GFIELD_IMPORTANT_TYPES={
    version:'2026-09-13.1',
    maxQuestions:40,
    questionCounts:[4,8,20,40],
    types:[
      {id:'digit-product',title:'숫자카드로 만든 곱',note:'두 자리×두 자리 · 세 자리×세 자리 · 세 자리×두 자리',sources:[{round:1,no:4}]},
      {id:'assumption',title:'우기기',note:'두 경우를 한쪽으로 가정하여 차이로 찾기',sources:[{round:1,no:8},{round:2,no:1}]},
      {id:'broken-clock',title:'고장난 시계',sources:[{round:1,no:6}]},
      {id:'number-pyramid',title:'수피라미드 배열',sources:[{round:1,no:10}]},
      {id:'rectangle-count',title:'직사각형 도형의 개수',sources:[{round:1,no:22}]},
      {id:'units-digit-power',title:'같은 수를 여러 번 곱한 일의 자리',sources:[{round:1,no:24}]},
      {id:'digit-card-sum',title:'숫자카드를 여러 장 사용하여 만든 수들의 합',sources:[{round:1,no:29}]},
      {id:'number-code',title:'수의 관계(암호)',sources:[{round:1,no:30}]},
      {id:'top-view',title:'위에서 바라본 모양',sources:[{round:2,no:12}]},
      {id:'shortest-path',title:'최단거리',sources:[{round:2,no:13}]},
      {id:'grouped-sequence',title:'군수열(묶음수열)',sources:[{round:2,no:15}]},
      {id:'league-tournament',title:'리그와 토너먼트',sources:[{round:2,no:19}]},
      {id:'coin-combinations',title:'동전 만들기',sources:[{round:2,no:22}]},
      {id:'shape-pattern',title:'도형 규칙',sources:[{round:2,no:25}]},
      {id:'consecutive-sum',title:'연속수의 합',sources:[{round:2,no:30}]}
    ]
  };
})(typeof window!=='undefined'?window:globalThis);
