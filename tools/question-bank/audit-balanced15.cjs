'use strict';

// Read-only readiness audit. Source difficulty is a benchmark, never a new
// variant's measured difficulty. This tool neither generates nor publishes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const PROFILE = require(path.join(ROOT, 'bank/learning-profile.js'));
const REGISTRY = require(path.join(ROOT, 'bank/bank-registry.js'));
const LEVELS = ['low', 'middle', 'high'];
const TARGET = Object.freeze({low: 5, middle: 5, high: 5});

function quota(counts) {
  const have = Object.fromEntries(LEVELS.map(k => [k, Number(counts[k] || 0)]));
  const missing = Object.fromEntries(LEVELS.map(k => [k, Math.max(0, TARGET[k] - have[k])]));
  return {
    counts: have,
    missing,
    missingTotal: Object.values(missing).reduce((a, b) => a + b, 0),
    ready: LEVELS.every(k => have[k] >= TARGET[k]),
    retainedOutsideQuota: LEVELS.reduce((n, k) => n + Math.max(0, have[k] - TARGET[k]), 0),
  };
}

function loadSources() {
  const sandbox = {window: {}};
  vm.createContext(sandbox);
  for (const file of ['mock-data.js', 'mock-data-hw.js', 'mock-data-final.js', 'last-score-data.js', 'mock-data-original.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, {filename: file, timeout: 3000});
  }
  const w = sandbox.window;
  return REGISTRY.buildUnifiedCatalog({middle: w.GFIELD_MOCK, applied: w.GFIELD_MOCK_HW,
    final: w.GFIELD_MOCK_FINAL, last: w.GFIELD_LAST_SCORE_DATA, original: w.GFIELD_MOCK_ORIGINAL}).items;
}

function audit() {
  const sources = loadSources();
  const byKey = new Map(sources.map(x => [x.sourceKey, x]));
  if (byKey.size !== sources.length) throw Error('Duplicate source key');
  const groups = new Map();
  const paperGroups = new Map();
  const files = [];
  const seenIds = new Set();
  const seenItems = new Map();
  let verifiedCount = 0;
  const names = fs.readdirSync(path.join(ROOT, 'bank/data')).sort((a, b) => Number(a.includes('-balanced15')) - Number(b.includes('-balanced15')) || a.localeCompare(b));
  for (const file of names) {
    if (!/^(?:applied\d+-(?:expanded|balanced15)|(?:final|last|middle)\d+-(?:fixed90|reviewed)|original\d+-fixed90)\.json$/.test(file)) continue;
    const bytes = fs.readFileSync(path.join(ROOT, 'bank/data', file));
    const bank = JSON.parse(bytes);
    const allowed = bank.availableSourceNos || bank.freezePolicy?.availableSourceNos;
    const pending = new Set(bank.pendingSourceNos || []);
    let accepted = 0;
    for (const item of bank.items) {
      if (item.reviewStatus !== 'verified' || pending.has(item.sourceNo) || allowed && !allowed.includes(item.sourceNo)) continue;
      if (seenIds.has(item.id)) {
        const old = seenItems.get(item.id);
        if (item.preservedApprovedId !== item.id || Object.keys(old).some(k => JSON.stringify(old[k]) !== JSON.stringify(item[k]))) throw Error('Modified or duplicate stored variant: ' + item.id);
        continue; // A preserved approved item in a new balanced view is one item.
      }
      seenIds.add(item.id);
      seenItems.set(item.id, item);
      if (item.sourceSet !== bank.sourceSet || item.sourceRound !== bank.sourceRound) throw Error('Source locator mismatch: ' + item.id);
      const key = [item.sourceSet, item.sourceRound, item.sourceNo].join('|');
      const source = byKey.get(key);
      if (!source) throw Error('Missing source: ' + key);
      const level = PROFILE.difficulty(source);
      if (item.practiceLevel && (!LEVELS.includes(item.practiceLevel) || !item.levelReview || item.levelReview.measured !== false)) throw Error('Missing authored level evidence: ' + item.id);
      const entry = {id: item.id, file, sourceBenchmarkLevel: item.practiceLevel || level.id,
        basis: item.practiceLevel ? item.levelReview.basis : level.basis};
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
      const paperKey = [item.sourceSet, item.sourceRound].join('|');
      if (!paperGroups.has(paperKey)) paperGroups.set(paperKey, []);
      paperGroups.get(paperKey).push(entry);
      verifiedCount++; accepted++;
    }
    files.push({file, version: bank.version, accepted, sha256: crypto.createHash('sha256').update(bytes).digest('hex')});
  }
  function counts(items) {
    return items.reduce((a, x) => { if (LEVELS.includes(x.sourceBenchmarkLevel)) a[x.sourceBenchmarkLevel]++; return a; }, {low: 0, middle: 0, high: 0});
  }
  const perSource = sources.map(source => {
    const entries = groups.get(source.sourceKey) || [];
    return {
      sourceKey: source.sourceKey, sourceRef: source.sourceRef,
      taxonomy: PROFILE.taxonomy(source), benchmark: PROFILE.difficulty(source),
      storedVerified: entries.length, benchmarkQuota: quota(counts(entries)),
      variantIds: entries.map(x => x.id),
    };
  });
  const papers = Array.from(paperGroups, ([paperKey, items]) => ({paperKey, storedVerified: items.length, benchmarkQuota: quota(counts(items))}));
  const applied = perSource.filter(x => x.sourceRef.set === 'applied');
  return {
    schemaVersion: 1, target: TARGET, totalPerUnit: 15,
    scopeConfirmed: true, scope: 'per-source-question',
    caveat: 'Original variants use their source benchmark; explicit levelled extensions use separately reviewed authored levels. Neither is a measured variant success rate. Counts alone do not certify fidelity, rendering, input links, diagnosis or ZIP delivery.',
    sourceCount: sources.length, bankCount: files.length, storedVerified: verifiedCount,
    perSourceProjection: {unitsWithVariants: groups.size, readyByBenchmarkCounts: perSource.filter(x => x.benchmarkQuota.ready).length,
      missingByBenchmarkCounts: perSource.reduce((n, x) => n + x.benchmarkQuota.missingTotal, 0)},
    appliedProjection: {sourceCount: applied.length, targetCount: applied.length * 15,
      storedVerified: applied.reduce((n, x) => n + x.storedVerified, 0),
      missingByBenchmarkCounts: applied.reduce((n, x) => n + x.benchmarkQuota.missingTotal, 0)},
    perPaperProjection: {readyByBenchmarkCounts: papers.filter(x => x.benchmarkQuota.ready).length,
      caveat: 'Combining different source questions into one paper is a separate scope; no paper has been generated or connected by this audit.'},
    files, papers, perSource,
  };
}

if (require.main === module) {
  const result = audit();
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 2 && args[0] === '--output')) throw Error('Usage: node audit-balanced15.cjs [--output path]');
  if (args.length) {
    const output = path.resolve(args[1]);
    if (!output.startsWith(path.join(ROOT, '.private-work') + path.sep)) throw Error('Write audit evidence only under .private-work');
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  }
  console.log(JSON.stringify({sourceCount: result.sourceCount, bankCount: result.bankCount,
    storedVerified: result.storedVerified, perSourceProjection: result.perSourceProjection,
    appliedProjection: result.appliedProjection, perPaperProjection: result.perPaperProjection}, null, 2));
}

module.exports = {quota, audit};
