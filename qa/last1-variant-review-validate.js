#!/usr/bin/env node
'use strict';
// QA: last1-reviewed.json — 90 items, version 1.2.0
// Usage: node qa/last1-variant-review-validate.js

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'bank', 'data', 'last1-reviewed.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

let errors = 0;
function fail(msg) { console.error('FAIL:', msg); errors++; }

// Version check
if (data.version !== '1.2.0') fail('Expected version 1.2.0, got ' + data.version);

const items = data.items;
if (!Array.isArray(items)) { fail('items is not an array'); process.exit(1); }
if (items.length !== 90) fail('Expected 90 items, got ' + items.length);

const seenIds = new Set();
for (const item of items) {
  if (seenIds.has(item.id)) fail('Duplicate id: ' + item.id);
  seenIds.add(item.id);

  if (item.sourceSet !== 'last') fail(item.id + ': sourceSet should be "last"');
  if (item.sourceRound !== 1) fail(item.id + ': sourceRound should be 1');
  if (typeof item.sourceNo !== 'number' || item.sourceNo < 1 || item.sourceNo > 30)
    fail(item.id + ': sourceNo out of range: ' + item.sourceNo);
  if (![1,2,3].includes(item.variantNo)) fail(item.id + ': variantNo should be 1/2/3');
  if (!item.text || item.text.trim() === '') fail(item.id + ': empty text');
  if (!item.answer || item.answer.trim() === '') fail(item.id + ': empty answer');
  if (!['2.7','3.4','4.2'].includes(item.pointBand)) fail(item.id + ': invalid pointBand ' + item.pointBand);
  if (!item.reviewStatus) fail(item.id + ': missing reviewStatus');
}

// Check all 30 sourceNos × 3 variants present
for (let no = 1; no <= 30; no++) {
  for (let v = 1; v <= 3; v++) {
    const found = items.find(i => i.sourceNo === no && i.variantNo === v);
    if (!found) fail('Missing sourceNo=' + no + ' variantNo=' + v);
  }
}

// Q22 should be a source reuse from final7
const q22Items = items.filter(i => i.sourceNo === 22);
for (const item of q22Items) {
  if (!item.sourceReuse) fail(item.id + ': Q22 should have sourceReuse field');
  else if (item.sourceReuse.canonicalSource !== 'final|7|22')
    fail(item.id + ': Q22 sourceReuse.canonicalSource should be "final|7|22"');
}

if (errors === 0) {
  console.log('OK: last1-reviewed.json — 90 items, all checks passed.');
} else {
  console.error('ERRORS:', errors);
  process.exit(1);
}
