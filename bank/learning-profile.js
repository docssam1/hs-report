/* Question-bank display metadata. Source papers, grades and canonical source IDs stay unchanged. */
(function(root,factory){'use strict';var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.GFIELD_BANK_LEARNING_PROFILE=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 var AREAS=['도형','수와 식','경우의 수','지문 이해'];
 var LEVELS={high:{id:'high',label:'상',order:1},middle:{id:'middle',label:'중',order:2},low:{id:'low',label:'하',order:3}};
 var MATRIX={'2.7':{low:'low',middle:'low',high:'middle'},'3.4':{low:'low',middle:'middle',high:'high'},'4.2':{low:'middle',middle:'high',high:'high'}};
 function clean(x){return String(x==null?'':x).trim();}
 function setOf(item){return clean(item&&item.sourceRef&&item.sourceRef.set||item&&item.sourceSet);}
 function pointsOf(item){var v=item&&item.points;if(v==null)v=item&&item.pointBand;if(v==null)v=item&&item.pts;return Number(clean(v).replace(/^source-/,''));}
 function rateOf(item){var v=item&&item.responseRate;if(v==null)v=item&&item.benchmarkResponseRate;if(v==null||clean(v)==='')return null;v=Number(v);if(!Number.isFinite(v)||v<0||v>100)return null;return v>1?v/100:v;}
 function localOf(item){var v=clean(item&&item.pointBandDifficulty);return ({상:'high',중:'middle',중간:'middle',하:'low',high:'high',middle:'middle',low:'low'})[v]||null;}
 function difficulty(item){
  item=item||{};var set=setOf(item),points=pointsOf(item),rate=rateOf(item),band=String(points),local=localOf(item),applied=set==='hw'||set==='applied',id,basis;
  if(!applied&&rate!==null){id=rate<.4?'high':rate<.6?'middle':'low';basis='response-rate';}
  else if(MATRIX[band]){id=applied?(points===2.7?'low':points===3.4?'middle':'high'):local?MATRIX[band][local]:(points===2.7?'low':points===3.4?'middle':'high');basis=applied?'applied-point-band':local?'point-band-calibrated':'source-points';}
  else return {id:'unclassified',label:'미분류',order:4,basis:'insufficient-evidence',measured:false,points:Number.isFinite(points)?points:null,responseRate:null,withinBandDifficulty:local};
  return {id:id,label:LEVELS[id].label,order:LEVELS[id].order,basis:basis,measured:basis==='response-rate',points:points,responseRate:applied?null:rate,withinBandDifficulty:applied?null:local,
   evidenceLabel:applied?points+'점대 기준':basis==='response-rate'?'기준 정답률 '+Math.round(rate*1000)/10+'%':points+'점대'+(local?' · 점수대 안 '+LEVELS[local].label:' · 난도 추정')};
 }
 function taxonomy(item){
  item=item||{};var original=clean(item.area),sub=clean(item.subarea||item.sourceSubarea),detail=clean(item.detailType||item.displayType||item.type),text=sub+' '+detail,area,basis='source-area';
  if(AREAS.indexOf(item.learningArea)>=0){area=item.learningArea;basis='explicit-learning-area';}
  else if(/논리추리|논리 추리|진실과 거짓|참과 거짓|거짓말|참·거짓|선후관계|진술의 참|정답 예상/.test(text)){area='지문 이해';basis='source-reasoning-type';}
  else if(original==='지문 이해')area='지문 이해';else if(original==='도형')area='도형';else if(original==='경우의 수')area='경우의 수';else if(original==='수·규칙찾기'||original==='식의 계산'||original==='수와 식')area='수와 식';else area='미분류';
  if(area==='지문 이해')sub=/거짓|진실|참·|진술/.test(text)?'참·거짓과 논리':/선후|순서|순위/.test(text)?'순서와 조건 추론':'정보 연결과 조건 추론';
  return {area:area,subarea:sub||'세부 분류 확인',detailType:detail,path:[area,sub||'세부 분류 확인',detail],basis:basis,sourceArea:original,sourceSubarea:clean(item.subarea||item.sourceSubarea),sourceKey:clean(item.sourceKey)};
 }
 return {version:'2026-10-23.1',areas:AREAS.slice(),levels:LEVELS,withinBandMatrix:MATRIX,difficulty:difficulty,taxonomy:taxonomy,
  policy:{applied:'활용은 배점대만 사용: 2.7 하, 3.4 중, 4.2 상',other:'정답률 우선; 없으면 배점대와 명시된 점수대 안 상중하를 보정',responseRate:'기존 5구간을 상(<40%), 중(40% 이상 60% 미만), 하(60% 이상)로 묶음',benchmark:'유사문제는 원문의 기준 정답률이며 새 문항 실측 정답률이 아님',unknown:'D1~D5 또는 생성기 Lv를 점수대 안 상중하로 임의 변환하지 않음'}};
});
