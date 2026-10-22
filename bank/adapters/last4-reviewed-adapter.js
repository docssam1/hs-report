/* Last4 approved stored variants. Pending review is never selectable. */
(function(root,factory){
  'use strict';
  var registry=root&&root.QUESTION_BANK_ADAPTERS;
  if(!registry&&typeof require==='function')registry=require('../core/adapter-registry.js');
  var adapter=factory();
  if(typeof module==='object'&&module.exports)module.exports=adapter;
  if(registry)registry.register(adapter);
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var data=null,promise=null;
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function useData(value){
    if(!value||value.sourceSet!=='last'||value.sourceRound!==4||!Array.isArray(value.items)||!value.freezePolicy||!Array.isArray(value.freezePolicy.availableSourceNos))throw new Error('최종 4회 문항의 출처와 공개 범위를 확인해 주세요.');
    data=clone(value);return adapter;
  }
  function load(){
    if(data)return Promise.resolve(data);
    if(!promise)promise=fetch('data/last4-reviewed.json?v=20261022-figures-r2',{cache:'no-cache'}).then(function(response){if(!response.ok)throw new Error('최종 4회 유사문제를 불러오지 못했습니다.');return response.json();}).then(function(value){useData(value);return data;}).catch(function(error){promise=null;throw error;});
    return promise;
  }
  function approvedGroup(no){
    if(!data||!data.freezePolicy.availableSourceNos.includes(no))return [];
    var rows=data.items.filter(function(item){return item.sourceNo===no;});
    var gen='last4-q'+String(no).padStart(2,'0');
    return rows.length===3&&new Set(rows.map(function(item){return item.variantNo;})).size===3&&rows.every(function(item){return item.sourceSet==='last'&&item.sourceRound===4&&item.reviewStatus==='verified'&&[1,2,3].includes(item.variantNo)&&item.genId===gen&&item.id===gen+'-v'+item.variantNo&&item.detailType===rows[0].detailType&&item.area===rows[0].area&&item.subarea===rows[0].subarea;})?rows:[];
  }
  function listTypes(){
    if(!data)return [];
    return data.freezePolicy.availableSourceNos.map(function(no){
      var group=approvedGroup(no),item=group[0];if(!item)return null;
      var gen='last4-q'+String(no).padStart(2,'0');
      return {id:gen+'-type',domain:item.area==='도형'?'shape':item.area==='경우의 수'?'combinatorics':'number',middle:item.subarea,label:item.detailType,gradeBand:{from:'g2',to:'g6'},solvingModel:gen,visualModel:item.asset?'reviewed-raster':'text-only',answerContract:item.answerContract||'single-value',generatorId:gen,rendererId:item.asset?'reviewed-raster':'text-block',searchAliases:[gen,item.detailType]};
    }).filter(Boolean);
  }
  function listSourceItems(){
    return listTypes().map(function(type){
      var no=Number(type.generatorId.slice(-2)),item=approvedGroup(no)[0];
      return {sourceKey:'gfield:last:2026:round-04:q'+String(no).padStart(3,'0'),sourceSeriesId:'gfield-last',edition:'2026',sourceLocator:{set:'last',round:4,questionNo:no},sourceTypeLabel:item.detailType,typeIds:[type.id],difficulty:'actual',answerContract:type.answerContract,visualSignature:type.visualModel,sourceFidelity:'reviewed-source-derived',verificationStatus:'verified',rights:'private-source-derived-variant',sourceMeta:{pointBand:item.pointBand,variantCount:3}};
    });
  }
  function getGenerator(id){
    var match=/^last4-q(\d{2})$/.exec(String(id||''));
    if(!match)return null;
    var group=approvedGroup(Number(match[1]));
    return group.length?{id:id,kind:'stored-reviewed-variants',items:clone(group)}:null;
  }
  function getRenderer(id){return id==='reviewed-raster'?{id:id,kind:'raster-image',answerMarks:false}:id==='text-block'?{id:id,kind:'text-only'}:null;}
  function validateSourceItem(item){
    var errors=[];if(!item||typeof item!=='object')return ['source item is missing'];
    ['sourceKey','sourceSeriesId','edition','sourceLocator','sourceTypeLabel','typeIds','difficulty','answerContract','visualSignature','sourceFidelity','verificationStatus','rights','sourceMeta'].forEach(function(key){if(item[key]==null||item[key]==='')errors.push(key+' is missing');});
    if(!item.sourceLocator||item.sourceLocator.set!=='last'||item.sourceLocator.round!==4)errors.push('Last4 source locator mismatch');
    return errors;
  }
  var adapter={adapterVersion:'2.0',id:'gfield-last4-reviewed',label:'지필드 최종 4회 검수 문항',listTypes:listTypes,listSourceItems:listSourceItems,getGenerator:getGenerator,getRenderer:getRenderer,validateSourceItem:validateSourceItem,useData:useData,load:load};
  return adapter;
});
