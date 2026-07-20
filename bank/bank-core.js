/*!
 * GFIELD BULL BANK - bank-core.js
 * Seed-based deterministic RNG, exam assembly, print support, watermark
 * No bundler: registers on window.BANK_CORE
 */
(function (global) {
  'use strict';

  var BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var SEED_LEN = 4;
  var SEED_SPACE = Math.pow(36, SEED_LEN);

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  }

  function encodeSeed(num) {
    num = ((num % SEED_SPACE) + SEED_SPACE) % SEED_SPACE;
    var out = '';
    for (var i = 0; i < SEED_LEN; i++) {
      out = BASE36[num % 36] + out;
      num = Math.floor(num / 36);
    }
    return out;
  }

  function decodeSeed(str) {
    if (!str) return NaN;
    str = String(str).toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!str.length) return NaN;
    var num = 0;
    for (var i = 0; i < str.length; i++) {
      var idx = BASE36.indexOf(str[i]);
      if (idx < 0) return NaN;
      num = num * 36 + idx;
    }
    return ((num % SEED_SPACE) + SEED_SPACE) % SEED_SPACE;
  }

  function randomSeedNum() {
    return Math.floor(Math.random() * SEED_SPACE);
  }

  function normalizeSeedInput(input) {
    var n = decodeSeed(input);
    if (isNaN(n)) n = randomSeedNum();
    return encodeSeed(n);
  }

  function subRng(masterSeedNum, index, salt) {
    var h = hashString(masterSeedNum + ':' + index + ':' + (salt || ''));
    return mulberry32(h);
  }

  function randint(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function buildPaper(opts) {
    var gens = global.BANK_GENS || [];
    var genId = opts.genId;
    var level = opts.level || 'all';
    var n = opts.n || 10;

    var seedStr = normalizeSeedInput(opts.seedStr);
    var seedNum = decodeSeed(seedStr);
    var masterRng = mulberry32(seedNum);

    var candidateGens = gens.filter(function (g) {
      return genId === 'mix' || g.id === genId;
    });
    if (!candidateGens.length) candidateGens = gens;

    var questions = [];
    var guard = 0;
    for (var i = 0; i < n; i++) {
      var qLevel = level === 'all' ? randint(masterRng, 1, 5) : parseInt(level, 10);
      var gen = candidateGens.length > 1 ? pick(masterRng, candidateGens) : candidateGens[0];
      if (!gen) break;
      var qRng = subRng(seedNum, i, gen.id);
      var q = null;
      var attempts = 0;
      while (!q && attempts < 30) {
        try {
          q = gen.gen(qLevel, qRng);
        } catch (e) {
          q = null;
        }
        attempts++;
        guard++;
        if (guard > n * 200) break;
      }
      if (q) {
        q.level = qLevel;
        q.genId = gen.id;
        q.genName = gen.name;
        q.area = gen.area;
        q.index = i + 1;
        questions.push(q);
      }
    }

    return {
      seedStr: seedStr,
      seedNum: seedNum,
      level: level,
      genId: genId,
      n: n,
      questions: questions
    };
  }

  function examNumber(seedStr, date) {
    date = date || new Date();
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var dd = String(date.getDate()).padStart(2, '0');
    return 'BB-' + mm + dd + '-' + seedStr;
  }

  function parseQuery() {
    var out = {};
    var qs = global.location ? global.location.search.replace(/^\?/, '') : '';
    qs.split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }

  function getStudentName() {
    try {
      var v = global.localStorage ? global.localStorage.getItem('gfield_student') : '';
      return (v || '').trim();
    } catch (e) {
      return '';
    }
  }

  function buildWatermarkTiles(container, name) {
    if (!container) return;
    container.innerHTML = '';
    if (!name) return;
    container.classList.add('wm-active');
    var label = name + ' · 지필드 영재교육';
    var ROWS = 8, COLS = 4;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var span = document.createElement('span');
        span.className = 'wm-tile';
        span.textContent = label;
        container.appendChild(span);
      }
    }
  }

  function initWatermarks(selector) {
    selector = selector || '.wm-layer';
    var name = getStudentName();
    var layers = document.querySelectorAll(selector);
    layers.forEach(function (layer) {
      buildWatermarkTiles(layer, name);
    });
    return name;
  }

  global.BANK_CORE = {
    mulberry32: mulberry32,
    hashString: hashString,
    encodeSeed: encodeSeed,
    decodeSeed: decodeSeed,
    randomSeedNum: randomSeedNum,
    normalizeSeedInput: normalizeSeedInput,
    subRng: subRng,
    randint: randint,
    pick: pick,
    shuffle: shuffle,
    buildPaper: buildPaper,
    examNumber: examNumber,
    parseQuery: parseQuery,
    getStudentName: getStudentName,
    buildWatermarkTiles: buildWatermarkTiles,
    initWatermarks: initWatermarks
  };

  global.BANK_GENS = global.BANK_GENS || [];
})(typeof window !== 'undefined' ? window : globalThis);
