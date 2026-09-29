/* 시그니처 실전 예상치: 공식 원점수와 분리된 참고 시나리오. */
(function(root){
  'use strict';
  function round1(value){return Math.round((value+1e-9)*10)/10;}
  function number(value){
    if((typeof value!=='number'&&typeof value!=='string')||String(value).trim()==='')return null;
    var n=Number(value);
    return Number.isFinite(n)&&n>=0&&n<=100?n:null;
  }
  function cut(cuts,label){
    var row=(cuts||[]).filter(function(x){return Array.isArray(x)&&x[0]===label;})[0];
    return row?number(row[1]):null;
  }
  function baseScore(score){
    var value=number(score);
    if(value===null)return null;
    // 30점 이하는 유지, 30~40점은 0→10%, 40점 이상은 10% 난도 시나리오.
    var rate=value<=30?0:value>=40?0.1:(value-30)/100;
    return round1(value*(1-rate));
  }
  function equivalentFinalScore(score,finalCuts,signatureCuts){
    var value=number(score);
    if(value===null)return null;
    var labels=['실력컷 · 일품안정권','심화컷 · 실력안정권','경시컷 · 심화안정권','경시 가능'];
    var anchors=[{f:0,s:0}];
    labels.forEach(function(label){
      var f=cut(finalCuts,label),s=cut(signatureCuts,label);
      if(f!==null&&s!==null)anchors.push({f:f,s:s});
    });
    anchors.push({f:100,s:100});
    anchors.sort(function(a,b){return a.f-b.f;});
    for(var i=1;i<anchors.length;i++){
      if(anchors[i].f<=anchors[i-1].f||anchors[i].s<=anchors[i-1].s)return null;
      if(value<=anchors[i].f){
        var a=anchors[i-1],b=anchors[i];
        return round1(a.s+(value-a.f)*(b.s-a.s)/(b.f-a.f));
      }
    }
    return 100;
  }
  function estimate(scores,finalRecords,signatureCuts){
    var actual=(scores||[]).map(number).filter(function(x){return x!==null;});
    if(!actual.length)return null;
    var actualScore=round1(actual.reduce(function(a,b){return a+b;},0)/actual.length);
    var base=round1(actual.reduce(function(a,b){return a+baseScore(b);},0)/actual.length);
    var equivalents=(finalRecords||[]).map(function(row){
      return equivalentFinalScore(row&&row.score,row&&row.cuts,signatureCuts);
    }).filter(function(x){return x!==null;});
    var finalEquivalent=equivalents.length?round1(equivalents.reduce(function(a,b){return a+b;},0)/equivalents.length):null;
    // 한 회차의 파이널 결과만으로 강하게 보정하지 않는다. 3회 이상이어도 최대 30%.
    var evidenceWeight=Math.min(0.3,equivalents.length*0.1);
    var scoreWeight=Math.max(0,Math.min(1,(actualScore-30)/10));
    var weight=evidenceWeight*scoreWeight;
    var predicted=finalEquivalent===null?base:round1(base-weight*Math.max(0,base-finalEquivalent));
    return {actual:actualScore,expected:predicted,base:base,finalEquivalent:finalEquivalent,
      finalCount:equivalents.length,finalWeight:round1(weight*100)};
  }
  function levelPlacement(score,cuts,positionOf){
    var value=number(score);
    if(value===null||typeof positionOf!=='function')return null;
    var levels=(cuts||[]).filter(function(row){return Array.isArray(row)&&number(row[1])!==null&&Number(row[1])>0;})
      .slice().sort(function(a,b){return Number(b[1])-Number(a[1]);});
    var index=levels.findIndex(function(row){return value>=Number(row[1]);});
    if(index<0)return {label:'기초 보완',level:null,waitlist:false};
    var names=['경시','심화','실력','일품'];
    var name=names[index]||String(levels[index][0]).split(' ')[0];
    var current=positionOf(value),lower=positionOf(Number(levels[index][1]));
    var upper=index?positionOf(Number(levels[index-1][1])):{rank:0};
    var rank=Number(current&&current.rank),lowerRank=Number(lower&&lower.rank),upperRank=Number(upper&&upper.rank);
    if(!Number.isFinite(rank)||!Number.isFinite(lowerRank)||!Number.isFinite(upperRank)||lowerRank<=upperRank)
      return {label:name+' 가능 예상',level:name,waitlist:false,groupRank:null,groupSize:null};
    var groupSize=lowerRank-upperRank;
    var groupRank=Math.max(1,Math.min(groupSize,rank-upperRank));
    var waitlist=groupRank>Math.max(1,Math.floor(groupSize*0.9));
    return {label:name+(waitlist?' 대기 예상':' 가능 예상'),level:name,waitlist:waitlist,
      groupRank:groupRank,groupSize:groupSize};
  }
  var api={baseScore:baseScore,equivalentFinalScore:equivalentFinalScore,estimate:estimate,levelPlacement:levelPlacement};
  root.GFIELD_SIGNATURE_FORECAST=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
