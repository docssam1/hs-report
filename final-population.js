(function(root){
  'use strict';
  var trusted=new WeakSet(),cutScores=[48.5,39.4,28.6,19.9,12.8,0];
  var numeric=function(x,min,max){return typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;};
  var exactKeys=function(x,keys){return x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');};
  function accept(payload,scores,cuts){
    if(!exactKeys(payload,['schemaVersion','exam','status','scope','version','mean','rate','percentiles'])||payload.schemaVersion!==1||payload.exam!=='final1'||payload.status!=='verified-snapshot'||payload.scope!=='provided-original-records'||!/^final1-[a-f0-9]{64}$/.test(payload.version)||!numeric(payload.mean,0,100))throw new Error('통계 응답 확인 필요');
    var keys=Array.from({length:30},function(_,i){return String(i+1);});
    if(!exactKeys(payload.rate,keys)||keys.some(function(k){return !numeric(payload.rate[k],0,1);}))throw new Error('정답률 확인 필요');
    var expected=Array.from(new Set(scores.concat(cutScores).map(function(s){return String(Math.round(s*10));})));
    if(!exactKeys(payload.percentiles,expected)||expected.some(function(k){return !numeric(payload.percentiles[k],0.1,100);}))throw new Error('백분율 확인 필요');
    var weighted=keys.reduce(function(s,k){return s+payload.rate[k]*(+k<=12?2.7:+k<=22?3.4:4.2);},0);
    if(Math.abs(weighted-payload.mean)>.050001)throw new Error('평균과 정답률 불일치');
    var sorted=expected.map(Number).sort(function(a,b){return a-b;});
    if(sorted.some(function(k,i){return i>0&&payload.percentiles[k]>payload.percentiles[sorted[i-1]];}))throw new Error('백분율 순서 확인 필요');
    var value={protectedReference:'final1-source-v1',scope:payload.scope,version:payload.version,mean:payload.mean,
      rate:Object.freeze(Object.assign({},payload.rate)),percentiles:Object.freeze(Object.assign({},payload.percentiles)),cuts:Object.freeze(cuts.map(function(c){return Object.freeze(c.slice());}))};
    Object.freeze(value);trusted.add(value);return value;
  }
  async function load(scores,cuts,slot){
    if(!root.GFIELD_AUTH||typeof root.GFIELD_AUTH.functionCall!=='function')throw new Error('로그인 후 통계를 확인해 주세요.');
    scores=Array.from(new Set(scores));
    if(!scores.length||scores.length>16||scores.some(function(s){return !numeric(s,0,100)||Math.abs(s*10-Math.round(s*10))>1e-8;}))throw new Error('조회 점수 확인 필요');
    var response=await root.GFIELD_AUTH.functionCall('hs-final-population',{exam:'final1',scores:scores},slot);
    return accept(response,scores,cuts);
  }
  function isVerified(value){return !!value&&trusted.has(value);}
  function percentile(score,value){
    if(!isVerified(value)||!numeric(score,0,100))return null;
    var key=String(Math.round(score*10));return Object.prototype.hasOwnProperty.call(value.percentiles,key)?value.percentiles[key]:null;
  }
  // Approved cutoff aggregates only. No cohort size or individual scores.
  var fixedCuts=Object.freeze({'485':16.1,'394':30.4,'286':55.4,'199':73.2,'128':92.9});
  function cutPercentile(score,value){
    if(!value||value.protectedReference!=='final1-source-v1')return null;
    var key=String(Math.round(score*10));return Object.prototype.hasOwnProperty.call(fixedCuts,key)?fixedCuts[key]:null;
  }
  root.GFIELD_FINAL_POPULATION={load:load,isVerified:isVerified,percentile:percentile,cutPercentile:cutPercentile,fromSaved:function(payload,score,cuts){return accept(payload,[score],cuts);}};
})(typeof window==='object'?window:globalThis);
