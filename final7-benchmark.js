/* 최종 실전 7회는 개인 성적을 다른 회차와 합치지 않는다.
 * 석차 백분율과 예상 등급은 확정된 최종 1~4회 성적 기준을 같은 비중으로 결합해 산출한다.
 * 이 내부 산정 출처는 학생 진단지의 설명 문구로 노출하지 않는다. */
(function(root){
  'use strict';
  var finalModel=root.GFIELD_MOCK_FINAL;
  var sourceModel=root.GFIELD_LAST_SCORE_DATA;
  var target=finalModel&&finalModel.rounds&&finalModel.rounds['7'];
  var rounds=sourceModel&&sourceModel.rounds;
  if(!target||!rounds) return;

  function round1(value){return Math.round(value*10)/10;}
  function percentile(source,score){
    if(Array.isArray(source.percentileTable)&&source.percentileTable.length){
      for(var index=0;index<source.percentileTable.length;index++){
        if(score>=Number(source.percentileTable[index][0])) return Number(source.percentileTable[index][1]);
      }
      return Number(source.percentileTable[source.percentileTable.length-1][1]);
    }
    var dist=Array.isArray(source.scoreDist)?source.scoreDist:[];
    var n=Number(source.cohortSize)||dist.length;
    if(!n||!dist.length) return null;
    var higher=dist.filter(function(value){return Number(value)>score;}).length;
    return round1(Math.min(100,(higher+1)/n*100));
  }
  function processPercentile(score){
    var values=['1','2','3','4'].map(function(key){return percentile(rounds[key],score);});
    if(values.some(function(value){return !Number.isFinite(value);})) return null;
    return round1(values.reduce(function(sum,value){return sum+value;},0)/values.length);
  }

  var table=[],lastPercentile=null;
  for(var tick=1000;tick>=0;tick--){
    var score=round1(tick/10),pct=processPercentile(score);
    if(pct!==lastPercentile){table.push([score,pct]);lastPercentile=pct;}
  }

  var labels=['경시 가능','경시컷,심화안정권','심화컷,실력안정권','실력컷,일품안정권','일품컷','노력요함'];
  var cuts=labels.map(function(label){
    var scores=['1','2','3','4'].map(function(key){
      var row=(rounds[key].scoreBands||[]).filter(function(candidate){return candidate[0]===label;})[0];
      return row?Number(row[1]):NaN;
    });
    if(scores.some(function(score){return !Number.isFinite(score);})) throw new Error('FINAL7_PROCESS_CUT_MISSING:'+label);
    return [label.replace(/,/g,' · '),round1(scores.reduce(function(sum,score){return sum+score;},0)/scores.length)];
  });

  target.stats={
    percentileTable:table,
    cuts:cuts,
    rankEvidence:{
      status:'verified-source-rank',
      sourceId:'last-score-data-1-4-process-benchmark',
      sourceRef:'2024 최종 모의고사 1~4회 회차별 원점수 석차 백분율 및 등급 컷',
      verifiedAt:'2026-09-18'
    }
  };
})(typeof window==='object'?window:globalThis);
