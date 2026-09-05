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
  // Generation levels control variation complexity. The score band is a
  // separate, explicit exam metadata value used by diagnosis and printing.
  var POINT_BAND_BY_LEVEL = Object.freeze({
    1: '2.7',
    2: '2.7',
    3: '3.4',
    4: '3.4',
    5: '4.2'
  });

  function pointBandForLevel(level) {
    return POINT_BAND_BY_LEVEL[parseInt(level, 10)] || null;
  }

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

  function stableTypeId(area, subarea, name) {
    var value = [area, subarea, name].map(function (part) {
      return String(part == null ? '' : part).replace(/\s+/g, ' ').trim();
    }).join('|');
    var h = 0x811c9dc5;
    for (var i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return 'type-' + (h >>> 0).toString(36).padStart(7, '0');
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

  function complexityValue(value, depth) {
    if (depth > 5 || value == null) return 0;
    if (typeof value === 'number' && isFinite(value)) return Math.log2(Math.abs(value) + 1);
    if (typeof value === 'boolean') return value ? 0.5 : 0;
    if (Array.isArray(value)) {
      return value.length + value.reduce(function (sum, item) {
        return sum + complexityValue(item, depth + 1);
      }, 0);
    }
    if (typeof value === 'object') {
      return Object.keys(value).reduce(function (sum, key) {
        return sum + complexityValue(value[key], depth + 1);
      }, 0);
    }
    return 0;
  }

  function questionComplexity(question, level) {
    if (question && typeof question.complexityScore === 'number' && isFinite(question.complexityScore)) {
      return Number(level || 1) * 10000 + question.complexityScore;
    }
    return Number(level || 1) * 10000 + complexityValue(question && question.meta, 0);
  }

  function questionPromptKey(question) {
    return String(question && question.text || '') + '|' +
      (Array.isArray(question && question.conditionLines) ? question.conditionLines.join('|') : '') + '|' +
      String(question && question.variantKey || '');
  }

  var DIFFICULTY_MIX_PRESETS = Object.freeze({
    single: Object.freeze({ easy: 0, standard: 100, hard: 0 }),
    easy: Object.freeze({ easy: 60, standard: 30, hard: 10 }),
    balanced: Object.freeze({ easy: 25, standard: 50, hard: 25 }),
    hard: Object.freeze({ easy: 10, standard: 30, hard: 60 })
  });

  function difficultySchedule(n, preset, singleMode, rng) {
    var modes = ['easy', 'standard', 'hard'];
    if (preset === 'single' || !DIFFICULTY_MIX_PRESETS[preset]) {
      return Array.from({ length: n }, function () { return singleMode; });
    }
    var weights = DIFFICULTY_MIX_PRESETS[preset];
    var total = modes.reduce(function (sum, mode) { return sum + weights[mode]; }, 0) || 100;
    var counts = {};
    var allocated = 0;
    var fractions = modes.map(function (mode, index) {
      var exact = n * weights[mode] / total;
      counts[mode] = Math.floor(exact);
      allocated += counts[mode];
      return { mode: mode, fraction: exact - counts[mode], index: index };
    });
    fractions.sort(function (a, b) {
      return b.fraction - a.fraction || a.index - b.index;
    });
    for (var remainder = n - allocated, i = 0; i < remainder; i++) {
      counts[fractions[i % fractions.length].mode]++;
    }
    var schedule = [];
    modes.forEach(function (mode) {
      for (var i = 0; i < counts[mode]; i++) schedule.push(mode);
    });
    return shuffle(rng, schedule);
  }

  function buildPaper(opts) {
    var gens = global.BANK_GENS || [];
    var genId = opts.genId;
    var requestedGenIds = Array.isArray(opts.genIds) ? opts.genIds.map(String) : [];
    var level = opts.level || 'all';
    var pointBand = opts.pointBand || 'all';
    var difficultyMode = ['easy', 'standard', 'hard'].indexOf(opts.difficultyMode) >= 0 ? opts.difficultyMode : 'standard';
    var difficultyMix = DIFFICULTY_MIX_PRESETS[opts.difficultyMix] ? opts.difficultyMix : 'single';
    var perGenerator = Math.max(0, Math.min(3, parseInt(opts.perGenerator, 10) || 0));
    var n = perGenerator ? requestedGenIds.length * perGenerator : (opts.n || 10);

    var seedStr = normalizeSeedInput(opts.seedStr);
    var seedNum = decodeSeed(seedStr);
    var masterRng = mulberry32(seedNum);

    var candidateGens;
    if (requestedGenIds.length) {
      candidateGens = requestedGenIds.map(function (id) {
        return gens.filter(function (g) { return g.id === id; })[0];
      }).filter(Boolean);
    } else {
      candidateGens = gens.filter(function (g) {
        return genId === 'mix' ? g.reviewOnly !== true : g.id === genId;
      });
    }
    if (!candidateGens.length) candidateGens = gens.filter(function (g) { return g.reviewOnly !== true; });

    var pointLevels = {
      easy: { all: [1, 2], '2.7': [1], '3.4': [2, 3], '4.2': [4] },
      standard: { all: [1, 2, 3, 4, 5], '2.7': [1, 2], '3.4': [3, 4], '4.2': [5] },
      hard: { all: [4, 5], '2.7': [2, 3], '3.4': [4, 5], '4.2': [5] }
    };

    var questions = [];
    var usedPrompts = {};
    var usedAnswers = {};
    var generatorQueue = [];
    if (perGenerator) {
      candidateGens.forEach(function (generator) {
        for (var copy = 0; copy < perGenerator; copy++) generatorQueue.push(generator);
      });
    }
    var guard = 0;
    var difficultyModes = difficultySchedule(n, difficultyMix, difficultyMode, masterRng);
    for (var i = 0; i < n; i++) {
      var questionDifficulty = difficultyModes[i] || difficultyMode;
      if (!generatorQueue.length && !perGenerator) generatorQueue = shuffle(masterRng, candidateGens);
      var gen = generatorQueue.shift();
      if (!gen) break;
      var generatorPointBand = pointBand === 'all' && gen.sourceLinked && gen.pointBands ? gen.pointBands[1] : pointBand;
      var allowedLevels = pointLevels[questionDifficulty][generatorPointBand] || pointLevels[questionDifficulty].all;
      var qLevel = allowedLevels ? pick(masterRng, allowedLevels) :
        (level === 'all' ? randint(masterRng, 1, 5) : parseInt(level, 10));
      var qRng = subRng(seedNum, i, gen.id);
      var q = null;
      var attempts = 0;
      while (!q && attempts < 60) {
        try {
          var sampleCount = questionDifficulty === 'standard' ? 1 : 4;
          var variants = [];
          for (var sample = 0; sample < sampleCount; sample++) {
            var candidate = gen.gen(qLevel, qRng);
            candidate.difficultyScore = questionComplexity(candidate, qLevel);
            variants.push(candidate);
          }
          variants.sort(function (a, b) {
            return questionDifficulty === 'easy' ? a.difficultyScore - b.difficultyScore : b.difficultyScore - a.difficultyScore;
          });
          q = variants.find(function (candidate) {
            var promptKey = questionPromptKey(candidate);
            var answerKey = String(candidate.answer);
            return !usedPrompts[promptKey] && !(gen.preferDistinctAnswers === true && !!usedAnswers[answerKey]);
          }) || (attempts >= 59 ? variants[0] : null);
        } catch (e) {
          q = null;
        }
        attempts++;
        guard++;
        if (guard > n * 200) break;
      }
      if (q) {
        usedPrompts[questionPromptKey(q)] = true;
        usedAnswers[String(q.answer)] = true;
        q.level = qLevel;
        q.pointBand = pointBand === 'all' ? (q.pointBand || pointBandForLevel(qLevel)) : pointBand;
        q.difficultyMode = questionDifficulty;
        q.genId = gen.id;
        q.genName = gen.name;
        q.area = gen.area;
        q.subarea = gen.subarea || '';
        q.detailType = gen.detailType || gen.name;
        q.sourceSet = gen.sourceSet || '';
        q.sourceRound = gen.sourceRound || null;
        q.sourceNo = gen.sourceNo || null;
        if (!q.diagnosis && gen.typeId) {
          q.diagnosis = {
            typeId: gen.typeId,
            errorTags: (gen.errorTags || []).slice()
          };
        }
        q.index = i + 1;
        questions.push(q);
      }
    }

    return {
      seedStr: seedStr,
      seedNum: seedNum,
      level: level,
      pointBand: pointBand,
      difficultyMode: difficultyMode,
      difficultyMix: difficultyMix,
      perGenerator: perGenerator,
      genId: candidateGens.length === 1 ? candidateGens[0].id : 'mix',
      genIds: candidateGens.map(function (g) { return g.id; }),
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
    stableTypeId: stableTypeId,
    encodeSeed: encodeSeed,
    decodeSeed: decodeSeed,
    randomSeedNum: randomSeedNum,
    normalizeSeedInput: normalizeSeedInput,
    subRng: subRng,
    randint: randint,
    pick: pick,
    shuffle: shuffle,
    difficultySchedule: difficultySchedule,
    buildPaper: buildPaper,
    examNumber: examNumber,
    parseQuery: parseQuery,
    getStudentName: getStudentName,
    buildWatermarkTiles: buildWatermarkTiles,
    initWatermarks: initWatermarks,
    POINT_BAND_BY_LEVEL: POINT_BAND_BY_LEVEL,
    DIFFICULTY_MIX_PRESETS: DIFFICULTY_MIX_PRESETS,
    pointBandForLevel: pointBandForLevel
  };

  global.BANK_GENS = global.BANK_GENS || [];
})(typeof window !== 'undefined' ? window : globalThis);
