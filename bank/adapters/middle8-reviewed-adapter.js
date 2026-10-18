/* Finite, human-approved Middle 8 variants; no runtime question generation. */
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
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function useData(value) {
    if (!value || value.sourceSet !== 'middle' || Number(value.sourceRound) !== 8 || !Array.isArray(value.items) || value.items.length !== 90 || !Array.isArray(value.types) || value.types.length !== 30) {
      throw new Error('중급 8회 승인 고정 90문항 데이터가 필요합니다.');
    }
    data = clone(value);
    return adapter;
  }
  function requireData() { if (!data) throw new Error('중급 8회 검수 문항 데이터를 먼저 불러와 주세요.'); return data; }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loadPromise) loadPromise = fetch('data/middle8-reviewed.json?v=20261019-q02-neutral-type', {cache:'no-cache'}).then(function (response) {
      if (!response.ok) throw new Error('중급 8회 검수 문항을 불러오지 못했습니다.');
      return response.json();
    }).then(function (value) { useData(value); return data; }).catch(function (error) { loadPromise = null; throw error; });
    return loadPromise;
  }
  function listTypes() { return clone(requireData().types); }
  function listSourceItems() {
    var value = requireData();
    return value.freezePolicy.availableSourceNos.map(function (no) {
      var items = value.items.filter(function (item) { return Number(item.sourceNo) === Number(no); });
      var first = items[0];
      var type = value.types.find(function (entry) { return entry.generatorId === first.genId; });
      return {
        sourceKey:'gfield:middle:unspecified:round-08:q' + String(no).padStart(3,'0'),
        sourceSeriesId:'gfield-middle',
        edition:'unspecified',
        sourceLocator:{set:'middle',round:8,questionNo:Number(no)},
        sourceTypeLabel:first.detailType,
        typeIds:[type.id],
        difficulty:'actual',
        answerContract:type.answerContract,
        visualSignature:first.asset ? 'reviewed-raster:mid8-q' + String(no).padStart(2,'0') : 'text:mid8-q' + String(no).padStart(2,'0'),
        sourceFidelity:'teacher-approved-variant',
        verificationStatus:items.every(function (item) { return item.reviewStatus === 'verified'; }) ? 'verified' : 'pending',
        rights:'private-source-derived-variant',
        sourceMeta:{approvalId:first.sourceMeta.approvalId,contentHash:first.sourceMeta.contentHash,variantRole:first.sourceMeta.variantRole,variantRoleLabel:first.sourceMeta.variantRoleLabel}
      };
    });
  }
  function getGenerator(generatorId) {
    var items = requireData().items.filter(function (item) { return item.genId === generatorId; });
    return items.length === 3 && items.every(function(item){return item.reviewStatus==='verified'&&item.teacherApproved===true;}) ? {id:generatorId,kind:'stored-reviewed-variants',items:clone(items)} : null;
  }
  function getRenderer(rendererId) {
    if (rendererId === 'reviewed-raster') return {id:rendererId,kind:'raster-image',answerMarks:false};
    if (rendererId === 'text-block') return {id:rendererId,kind:'text-only'};
    return null;
  }
  function validateSourceItem(item) {
    var errors = [];
    if (!item || typeof item !== 'object') return ['source item is missing'];
    ['sourceKey','sourceSeriesId','edition','sourceLocator','sourceTypeLabel','typeIds','difficulty','answerContract','visualSignature','sourceFidelity','verificationStatus','rights','sourceMeta'].forEach(function (key) { if (item[key] == null || item[key] === '') errors.push(key + ' is missing'); });
    if (!item.sourceLocator || item.sourceLocator.set !== 'middle' || Number(item.sourceLocator.round) !== 8) errors.push('sourceLocator must be Middle 8');
    if (!Array.isArray(item.typeIds) || !item.typeIds.length) errors.push('typeIds is empty');
    else item.typeIds.forEach(function (id) {
      var type = requireData().types.find(function (entry) { return entry.id === id; });
      if (!type) errors.push('unknown typeId: ' + id);
      else if (item.verificationStatus === 'verified' && (!getGenerator(type.generatorId) || !getRenderer(type.rendererId))) errors.push('verified generator or renderer is missing');
    });
    return errors;
  }
  var adapter = {adapterVersion:'1.0',id:'gfield-middle8-reviewed',label:'지필드 중급 8회 검수 문항',listTypes:listTypes,listSourceItems:listSourceItems,getGenerator:getGenerator,getRenderer:getRenderer,validateSourceItem:validateSourceItem,useData:useData,load:load};
  return adapter;
});
