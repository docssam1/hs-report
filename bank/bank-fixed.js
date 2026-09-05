/* Authored question records. Student requests only select stored items. */
(function (global) {
  'use strict';
  var loaded;
  function validate(data) {
    if (!data || data.sourceSet !== 'final' || data.sourceRound !== 1 || !Array.isArray(data.items) || data.items.length !== 90) {
      throw new Error('파이널 1회 등록 문항을 확인할 수 없습니다.');
    }
    var ids = new Set();
    for (var no = 1; no <= 30; no++) {
      var genId = 'final1-q' + String(no).padStart(2, '0');
      var group = data.items.filter(function (item) { return item.genId === genId; });
      if (group.length !== 3) throw new Error(no + '번 유사문제 3문항의 등록을 확인해 주세요.');
      group.forEach(function (item) {
        if (ids.has(item.id) || item.id !== genId + '-v' + item.variantNo || ![1, 2, 3].includes(item.variantNo) ||
            item.sourceNo !== no || item.sourceSet !== 'final' || item.sourceRound !== 1 ||
            !item.text || !item.solution || item.answer == null || !item.area || !item.subarea || !item.detailType) {
          throw new Error(no + '번 등록 문항의 내용과 번호를 확인해 주세요.');
        }
        ids.add(item.id);
      });
    }
    return data;
  }
  function load() {
    if (!loaded) {
      loaded = fetch('data/final1-fixed90.json?v=1', {cache:'no-cache'}).then(function (response) {
        if (!response.ok) throw new Error('등록 문항을 불러오지 못했습니다. 잠시 후 다시 열어 주세요.');
        return response.json();
      }).then(validate).catch(function (error) { loaded = null; throw error; });
    }
    return loaded;
  }
  function select(data, opts) {
    var ids = opts.genIds;
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.some(function (id) {return !/^final1-q(0[1-9]|[12][0-9]|30)$/.test(id);})) {
      throw new Error('학습할 파이널 1회 문항을 선택해 주세요.');
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
      bankVersion:data.version, fixed:true, seedStr:'F1V1', seedNum:0,
      genIds:ids.slice(), pointBand:opts.pointBand || 'all', difficultyMode:'standard', difficultyMix:'single',
      perGenerator:3, n:selected.length, questions:selected
    };
  }
  global.BANK_FIXED = {load:load, validate:validate, select:select, buildPaper:function (opts) {return load().then(function (data) {return select(data, opts);});}};
})(window);
