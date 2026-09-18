/* Common question-bank source adapter registry. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QUESTION_BANK_ADAPTERS = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var adapters = new Map();
  var required = ['adapterVersion', 'id', 'label', 'listTypes', 'listSourceItems', 'getGenerator', 'getRenderer', 'validateSourceItem'];

  function validateAdapter(adapter) {
    var errors = [];
    if (!adapter || typeof adapter !== 'object') return ['adapter is missing'];
    required.forEach(function (key) {
      if (['listTypes', 'listSourceItems', 'getGenerator', 'getRenderer', 'validateSourceItem'].includes(key)) {
        if (typeof adapter[key] !== 'function') errors.push(key + ' must be a function');
      } else if (!String(adapter[key] || '').trim()) errors.push(key + ' is missing');
    });
    return errors;
  }

  function register(adapter) {
    var errors = validateAdapter(adapter);
    if (errors.length) throw new Error('문제은행 소스 어댑터 계약 오류: ' + errors.join(', '));
    if (adapters.has(adapter.id)) throw new Error('이미 등록된 문제은행 소스 어댑터입니다: ' + adapter.id);
    adapters.set(adapter.id, adapter);
    return adapter;
  }

  function get(id) { return adapters.get(String(id || '')) || null; }
  function list() { return Array.from(adapters.values()); }

  return {contractVersion:'1.0', register:register, get:get, list:list, validateAdapter:validateAdapter};
});
