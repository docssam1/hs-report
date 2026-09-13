/* Authored question records. Student requests only select stored items. */
(function (global) {
  'use strict';
  var loaded = {};
  function bankConfig(bankCode) {
    if(String(bankCode||'')==='important')return {code:'important',round:null,label:'중요 유형',prefix:''};
    var match = /^final([12])$/.exec(String(bankCode || 'final1'));
    if (!match) throw new Error('등록된 파이널 유사문제 회차를 확인해 주세요.');
    var round = Number(match[1]);
    return {code:'final' + round, round:round, label:'파이널 ' + round + '회', prefix:'final' + round + '-q'};
  }
  function validate(data, bankCode) {
    var config = bankConfig(bankCode);
    if(config.code==='important'){
      if(!data||!Array.isArray(data.items)||!Array.isArray(data.types)||data.items.length!==48)throw new Error('중요 유형 등록 문항을 확인할 수 없습니다.');
      return data;
    }
    if (!data || data.sourceSet !== 'final' || data.sourceRound !== config.round || !Array.isArray(data.items) || data.items.length !== 90) {
      throw new Error(config.label + ' 등록 문항을 확인할 수 없습니다.');
    }
    var ids = new Set();
    for (var no = 1; no <= 30; no++) {
      var genId = config.prefix + String(no).padStart(2, '0');
      var group = data.items.filter(function (item) { return item.genId === genId; });
      if (group.length !== 3) throw new Error(no + '번 유사문제 3문항의 등록을 확인해 주세요.');
      group.forEach(function (item) {
        if (ids.has(item.id) || item.id !== genId + '-v' + item.variantNo || ![1, 2, 3].includes(item.variantNo) ||
            item.sourceNo !== no || item.sourceSet !== 'final' || item.sourceRound !== config.round ||
            !item.text || !item.solution || item.answer == null || !item.area || !item.subarea || !item.detailType) {
          throw new Error(no + '번 등록 문항의 내용과 번호를 확인해 주세요.');
        }
        ids.add(item.id);
      });
    }
    return data;
  }
  function load(bankCode) {
    var config = bankConfig(bankCode);
    if(config.code==='important'){
      if(!loaded.important){
        loaded.important=Promise.all([load('final1'),load('final2')]).then(function(rounds){
          var setting=global.GFIELD_IMPORTANT_TYPES;
          if(!setting||!Array.isArray(setting.types)||setting.types.length!==15)throw new Error('선생님이 고른 중요 유형을 확인할 수 없습니다.');
          var items=[];
          setting.types.forEach(function(type){
            type.sources.forEach(function(source){
              var data=rounds[source.round-1];
              var group=data.items.filter(function(item){return Number(item.sourceNo)===Number(source.no);});
              if(group.length!==3)throw new Error(type.title+' 유형의 유사문제 3문항을 확인할 수 없습니다.');
              group.forEach(function(item){var copy=JSON.parse(JSON.stringify(item));copy.importantTypeId=type.id;copy.importantTypeTitle=type.title;items.push(copy);});
            });
          });
          return validate({version:setting.version,sourceSet:'final-mixed',sourceRound:null,types:setting.types,items:items},'important');
        }).catch(function(error){loaded.important=null;throw error;});
      }
      return loaded.important;
    }
    if (!loaded[config.code]) {
      loaded[config.code] = fetch('data/' + config.code + '-fixed90.json?v=1', {cache:'no-cache'}).then(function (response) {
        if (!response.ok) throw new Error('등록 문항을 불러오지 못했습니다. 잠시 후 다시 열어 주세요.');
        return response.json();
      }).then(function (data) { return validate(data, config.code); }).catch(function (error) { loaded[config.code] = null; throw error; });
    }
    return loaded[config.code];
  }
  function select(data, opts) {
    var config = bankConfig(opts.bankCode);
    if(config.code==='important'){
      var setting=global.GFIELD_IMPORTANT_TYPES;
      var requested=Array.isArray(opts.typeIds)?opts.typeIds.map(String):[];
      var allowed=new Map(setting.types.map(function(type){return [type.id,type];}));
      if(!requested.length||new Set(requested).size!==requested.length||requested.some(function(id){return !allowed.has(id);}))throw new Error('학습할 중요 유형을 선택해 주세요.');
      var requestedCount=[4,8,20,40].includes(Number(opts.n))?Number(opts.n):20;
      var groups=[];
      requested.forEach(function(typeId){
        var type=allowed.get(typeId);
        type.sources.forEach(function(source){
          var group=data.items.filter(function(item){return item.importantTypeId===typeId&&Number(item.sourceRound)===source.round&&Number(item.sourceNo)===source.no;}).sort(function(a,b){return a.variantNo-b.variantNo;});
          if(opts.pointBand&&opts.pointBand!=='all'&&group[0].pointBand!==opts.pointBand)return;
          if(group.length!==3||group.some(function(item){return item.reviewStatus!=='verified';}))throw new Error(type.title+' 유형은 검수 중입니다. 검수가 끝난 뒤 제공됩니다.');
          groups.push(group);
        });
      });
      var selected=[];
      for(var variant=0;variant<3;variant++)groups.forEach(function(group){selected.push(group[variant]);});
      selected=selected.slice(0,Math.min(requestedCount,setting.maxQuestions));
      selected=selected.map(function(item,index){var copy=JSON.parse(JSON.stringify(item));copy.index=index+1;return copy;});
      return {bankVersion:data.version,bankCode:'important',bankLabel:'중요 유형',fixed:true,seedStr:'IMPORTANT',seedNum:0,typeIds:requested.slice(),genIds:groups.map(function(group){return group[0].genId;}),pointBand:opts.pointBand||'all',difficultyMode:'standard',difficultyMix:'single',perGenerator:3,n:selected.length,availableCount:groups.length*3,questions:selected};
    }
    var ids = opts.genIds;
    var idPattern = new RegExp('^' + config.prefix + '(0[1-9]|[12][0-9]|30)$');
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.some(function (id) {return !idPattern.test(id);})) {
      throw new Error('학습할 ' + config.label + ' 문항을 선택해 주세요.');
    }
    var selected = [], groups = [];
    ids.forEach(function (id) {
      var group = data.items.filter(function (item) { return item.genId === id; }).sort(function (a, b) { return a.variantNo - b.variantNo; });
      if (opts.pointBand && opts.pointBand !== 'all' && group[0].pointBand !== opts.pointBand) return;
      if (group.some(function (item) { return item.reviewStatus !== 'verified'; })) {
        throw new Error(group[0].sourceNo + '번 유사문제는 검수 중입니다. 검수가 끝난 뒤 제공됩니다.');
      }
      groups.push(group);
    });
    // Interleave the reviewed variants across source types; do not regenerate.
    for (var variant = 0; variant < 3; variant++) {
      groups.forEach(function (group) {
        var item = group[variant];
        var copy = JSON.parse(JSON.stringify(item));
        copy.index = selected.length + 1;
        selected.push(copy);
      });
    }
    return {
      bankVersion:data.version, bankCode:config.code, sourceSet:'final', sourceRound:config.round, bankLabel:config.label,
      fixed:true, seedStr:'F' + config.round + 'V1', seedNum:0,
      genIds:ids.slice(), pointBand:opts.pointBand || 'all', difficultyMode:'standard', difficultyMix:'single',
      perGenerator:3, n:selected.length, questions:selected
    };
  }
  global.BANK_FIXED = {load:load, validate:validate, select:select, buildPaper:function (opts) {return load(opts.bankCode).then(function (data) {return select(data, opts);});}};
})(window);
