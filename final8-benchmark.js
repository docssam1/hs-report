/* 최종 실전 8회 독립 예상치. 원점수와 2025년 척도 난도 보정 점수는 별개다.
 * 최종 8회 자체 응시 분포가 없으므로 최종 1~4회 각 회차의 석차 백분율을
 * 같은 비중으로 결합한 뒤 시그니처와 동일한 2024·2025 합산 분포에 역대입한다.
 * 실측 8회 석차나 합격 예측으로 표시하지 않는다. */
(function(root){
  'use strict';
  var rounds=root.GFIELD_LAST_SCORE_DATA&&root.GFIELD_LAST_SCORE_DATA.rounds;
  var signature=root.GFIELD_MOCK_ORIGINAL;
  if(!rounds||!signature||typeof signature.scoreForTopPercent!=='function')return;
  function round1(value){return Math.round(value*10)/10;}
  function sourcePercentile(source,score){
    if(Array.isArray(source.percentileTable)&&source.percentileTable.length){
      var first=source.percentileTable[0];
      if(score>Number(first[0]))return Number(first[1])*(100-score)/(100-Number(first[0]));
      for(var i=0;i<source.percentileTable.length;i++){
        if(score>=Number(source.percentileTable[i][0]))return Number(source.percentileTable[i][1]);
      }
      return Number(source.percentileTable[source.percentileTable.length-1][1]);
    }
    var dist=Array.isArray(source.scoreDist)?source.scoreDist:[];
    var size=Number(source.cohortSize)||dist.length;
    if(!size||!dist.length)return null;
    if(score>Number(dist[0]))return (100-score)/(100-Number(dist[0]))*100/size;
    var higher=dist.filter(function(value){return Number(value)>score;}).length;
    return Math.min(100,(higher+1)/size*100);
  }
  function project(rawScore){
    var raw=Number(rawScore);
    if(!Number.isFinite(raw)||raw<0||raw>100)return null;
    var values=['1','2','3','4'].map(function(round){return sourcePercentile(rounds[round],raw);});
    if(values.some(function(value){return !Number.isFinite(value);}))return null;
    var processTopPercent=values.reduce(function(sum,value){return sum+value;},0)/values.length;
    var adjusted=signature.scoreForTopPercent(processTopPercent);
    var historical=signature.estimatedPosition(adjusted);
    return {
      actualScore:round1(raw),adjustedScore:round1(adjusted),
      topPercent:historical.topPercent,estimatedRank:historical.rank,
      referencePopulation:historical.cohortSize,
      sourceProcessTopPercent:round1(processTopPercent),
      status:'provisional-difficulty-adjusted-historical-estimate'
    };
  }
  root.GFIELD_FINAL8_BENCHMARK={project:project,sourceRoundKeys:['1','2','3','4']};
})(typeof window==='object'?window:globalThis);
