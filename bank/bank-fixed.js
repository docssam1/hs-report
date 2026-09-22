/* Authored question records. Student requests only select stored items. */
(function (global) {
  'use strict';
  var loaded = {};
  function bankConfig(bankCode) {
    if(String(bankCode||'')==='important')return {code:'important',round:null,label:'중요 유형',prefix:''};
    var match = /^final([12347])$/.exec(String(bankCode || 'final1'));
    if (!match) throw new Error('등록된 파이널 유사문제 회차를 확인해 주세요.');
    var round = Number(match[1]);
    return {
      code:'final' + round,
      round:round,
      label:round===7?'최종 7회':'파이널 ' + round + '회',
      prefix:'final' + round + '-q',
      adapterId:round===7?'gfield-final7-reviewed':null,
      file:round===7?null:'final' + round + '-fixed90.json'
    };
  }

  /* =======================================================================
     누락된 문제 식 보충 (2026-09)

     파이널 4회 유사문제 4·6·10번(각 3변형, 모두 9건)은 본문이 "다음 식",
     "다음 빈칸", "다음 곱"으로 식을 가리키는데 정작 식을 담는 키
     (promptDataLines / asset)가 데이터에 아예 없어서, 화면과 인쇄물에
     문장만 나오고 식이 통째로 비어 있었다.

     아래 식은 각 항목에 저장된 answer 와 solutionSteps 를 그대로 재현하는지
     전수 계산으로 검증한 값이다.
       q04  1~9 사이 ±  → 결과 9 / 15 / －1  → 경우의 수 11 / 9 / 11
       q06  첫 수 고정 + → 결과 9 / 13 / 17  → 경우의 수 3 / 2 / 2
       q10  반복수의 곱 → 0이 아닌 짝수 7 / 10 / 15개
     표기는 원문 상세풀이(final4-detailed-data.js)와 같은 전각 기호를 쓴다.

     ※ 본래 있어야 할 자리는 bank/data/final4-fixed90.json 이지만 그 파일은
       동결(freezePolicy)된 382KB 단일 파일이라, 여기서 불러온 직후에 채운다.
       나중에 JSON 에 식이 들어가면 아래 로직은 자동으로 아무 일도 하지 않는다
       (이미 값이 있으면 건드리지 않음).
     ======================================================================= */
  var PROMPT_BACKFILL = {
    final4: {
      'final4-q04-v1': ['1 ○ 2 ○ 3 ○ 4 ○ 5 ○ 6 ○ 7 ○ 8 ○ 9 ＝ 9'],
      'final4-q04-v2': ['1 ○ 2 ○ 3 ○ 4 ○ 5 ○ 6 ○ 7 ○ 8 ○ 9 ＝ 15'],
      'final4-q04-v3': ['1 ○ 2 ○ 3 ○ 4 ○ 5 ○ 6 ○ 7 ○ 8 ○ 9 ＝ －1'],
      'final4-q06-v1': ['7 ○ 6 ○ 5 ○ 4 ○ 3 ○ 2'],
      'final4-q06-v2': ['8 ○ 7 ○ 6 ○ 5 ○ 4 ○ 3'],
      'final4-q06-v3': ['9 ○ 8 ○ 7 ○ 6 ○ 5 ○ 4'],
      'final4-q10-v1': ['11111111 × 99999999'],
      'final4-q10-v2': ['2222222222 × 9999999999'],
      'final4-q10-v3': ['333333333333333 × 999999999999999']
    }
  };
  function backfillPrompts(data, bankCode) {
    try {
      var table = PROMPT_BACKFILL[String(bankCode || '')];
      if (!table || !data || !Array.isArray(data.items)) return data;
      data.items.forEach(function (item) {
        if (!item || !table[item.id]) return;
        var already = (Array.isArray(item.promptDataLines) && item.promptDataLines.length) || item.asset;
        if (already) return;                       /* 원본 데이터가 고쳐지면 건드리지 않는다 */
        item.promptDataLines = table[item.id].slice();
        if (!item.promptDataLabel) item.promptDataLabel = '식';
      });
    } catch (error) { /* 보충에 실패해도 본래 흐름은 막지 않는다 */ }
    return data;
  }

  function validate(data, bankCode) {
    var config = bankConfig(bankCode);
    if(config.code==='important'){
      if(!data||!Array.isArray(data.items)||!Array.isArray(data.types)||data.items.length!==48)throw new Error('중요 유형 등록 문항을 확인할 수 없습니다.');
      return data;
    }
    var availableNos=data&&data.freezePolicy&&Array.isArray(data.freezePolicy.availableSourceNos)?data.freezePolicy.availableSourceNos.slice():Array.from({length:30},function(_,i){return i+1;});
    if (!data || data.sourceSet !== 'final' || data.sourceRound !== config.round || !Array.isArray(data.items) || data.items.length !== availableNos.length*3) {
      throw new Error(config.label + ' 등록 문항을 확인할 수 없습니다.');
    }
    var ids = new Set();
    for (var index = 0; index < availableNos.length; index++) {
      var no=Number(availableNos[index]);
      if(!Number.isInteger(no)||no<1||no>30)throw new Error(config.label+' 공개 문항 번호를 확인해 주세요.');
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
      var source;
      if(config.adapterId){
        var adapters=global.QUESTION_BANK_ADAPTERS;
        var adapter=adapters&&typeof adapters.get==='function'?adapters.get(config.adapterId):null;
        if(!adapter||typeof adapter.load!=='function')return Promise.reject(new Error(config.label+' 소스 어댑터를 확인할 수 없습니다.'));
        source=adapter.load();
      }else source=fetch('data/' + config.file + '?v=1', {cache:'no-cache'}).then(function (response) {
        if (!response.ok) throw new Error('등록 문항을 불러오지 못했습니다. 잠시 후 다시 열어 주세요.');
        return response.json();
      });
      loaded[config.code] = source.then(function (data) { return validate(backfillPrompts(data, config.code), config.code); }).catch(function (error) { loaded[config.code] = null; throw error; });
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
      var targetCount=Math.min(requestedCount,setting.maxQuestions);
      var dynamic=global.BANK_IMPORTANT_GENERATORS;
      function questionSignature(item){return String(item.text)+'|'+String(item.answer)+'|'+JSON.stringify(item.meta&&item.meta.parameters||item.meta||{});}
      var seenQuestions=new Set(selected.map(questionSignature));
      if(selected.length<targetCount){
        if(!dynamic)throw new Error('중요 유형 추가 문제 생성기를 불러오지 못했습니다.');
        var serialByType={};
        groups.forEach(function(group){serialByType[group[0].importantTypeId]=4;});
        var cursor=0,guard=0;
        while(selected.length<targetCount&&guard<targetCount*200){
          var sourceGroup=groups[cursor%groups.length],typeId=sourceGroup[0].importantTypeId;
          if(!dynamic.has(typeId))throw new Error(sourceGroup[0].importantTypeTitle+' 유형의 추가 문제를 확인할 수 없습니다.');
          var candidate=dynamic.generate(typeId,serialByType[typeId]++,sourceGroup[0]);
          var signature=questionSignature(candidate);
          if(!seenQuestions.has(signature)){seenQuestions.add(signature);selected.push(candidate);}
          cursor++;guard++;
        }
        if(selected.length<targetCount)throw new Error('요청한 문항 수만큼 서로 다른 문제를 만들지 못했습니다.');
      }
      selected=selected.slice(0,targetCount);
      selected=selected.map(function(item,index){var copy=JSON.parse(JSON.stringify(item));copy.index=index+1;return copy;});
      return {bankVersion:data.version,bankCode:'important',bankLabel:'중요 유형',fixed:true,seedStr:'IMPORTANT-V2',seedNum:0,typeIds:requested.slice(),genIds:groups.map(function(group){return group[0].genId;}),pointBand:opts.pointBand||'all',difficultyMode:'standard',difficultyMix:'single',perGenerator:0,n:selected.length,availableCount:setting.maxQuestions,questions:selected};
    }
    var ids = opts.genIds;
    var idPattern = new RegExp('^' + config.prefix + '(0[1-9]|[12][0-9]|30)$');
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.some(function (id) {return !idPattern.test(id);})) {
      throw new Error('학습할 ' + config.label + ' 문항을 선택해 주세요.');
    }
    var selected = [], groups = [];
    var orderMode = opts.orderMode === 'mixed' ? 'mixed' : 'grouped';
    ids.forEach(function (id) {
      var group = data.items.filter(function (item) { return item.genId === id; }).sort(function (a, b) { return a.variantNo - b.variantNo; });
      if(group.length!==3)throw new Error(id.replace(config.prefix,'')+'번 유사문제는 아직 검수 중입니다.');
      if (opts.pointBand && opts.pointBand !== 'all' && group[0].pointBand !== opts.pointBand) return;
      if (group.some(function (item) { return item.reviewStatus !== 'verified'; })) {
        throw new Error(group[0].sourceNo + '번 유사문제는 검수 중입니다. 검수가 끝난 뒤 제공됩니다.');
      }
      groups.push(group);
    });
    // Keep each source question's three variants together for focused study,
    // or interleave them for a mixed review. Never regenerate reviewed items.
    if (orderMode === 'grouped') {
      groups.forEach(function (group) {
        group.forEach(function (item) {
          var copy = JSON.parse(JSON.stringify(item));
          copy.index = selected.length + 1;
          selected.push(copy);
        });
      });
    } else {
      for (var variant = 0; variant < 3; variant++) {
        groups.forEach(function (group) {
          var item = group[variant];
          var copy = JSON.parse(JSON.stringify(item));
          copy.index = selected.length + 1;
          selected.push(copy);
        });
      }
    }
    return {
      bankVersion:data.version, bankCode:config.code, sourceSet:'final', sourceRound:config.round, bankLabel:config.label,
      fixed:true, seedStr:'F' + config.round + 'V1', seedNum:0,
      genIds:ids.slice(), pointBand:opts.pointBand || 'all', difficultyMode:'standard', difficultyMix:'single', orderMode:orderMode,
      perGenerator:3, n:selected.length, questions:selected
    };
  }
  global.BANK_FIXED = {load:load, validate:validate, select:select, buildPaper:function (opts) {return load(opts.bankCode).then(function (data) {return select(data, opts);});}};
})(window);
