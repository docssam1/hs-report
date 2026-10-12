/* 최종 실전 7·8회 독립 예상치: 승인된 시그니처 1·2회 공식을 그대로 재사용한다.
 * 예상 반은 실전 예상점수, 예상 석차 백분율은 실제 원점수 기준이다.
 * 다른 회차의 집단 분포를 결합하지 않으며 정규 누적 성적에는 포함하지 않는다. */
(function(root){
  'use strict';
  function project(rawScore,finalRecords){
    var signature=root.GFIELD_MOCK_ORIGINAL,forecast=root.GFIELD_SIGNATURE_FORECAST;
    var stats=signature&&signature.rounds&&signature.rounds['1']&&signature.rounds['1'].stats;
    var cuts=stats&&stats.cuts;
    if(!forecast||!signature||typeof signature.estimatedPosition!=='function'||!Array.isArray(cuts))return null;
    var result=forecast.estimate([rawScore],finalRecords||[],cuts);
    if(!result)return null;
    var position=signature.estimatedPosition(result.actual);
    var placement=forecast.levelPlacement(result.expected,cuts,signature.estimatedPosition);
    if(!position||!placement)return null;
    return {
      actualScore:result.actual,adjustedScore:result.expected,
      topPercent:position.topPercent,estimatedRank:position.rank,
      referencePopulation:position.cohortSize,tier:placement.label,
      placement:placement,forecast:result,
      status:'signature-formula-historical-estimate'
    };
  }
  var api={project:project};
  root.GFIELD_FINAL_STANDALONE_BENCHMARK=api;
  root.GFIELD_FINAL8_BENCHMARK=api;
})(typeof window==='object'?window:globalThis);
