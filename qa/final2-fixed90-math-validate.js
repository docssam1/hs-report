'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'bank', 'data', 'final2-fixed90.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const builderSource = fs.readFileSync(path.join(ROOT, 'qa', 'build-final2-fixed90.js'), 'utf8');
const VISUAL_SOURCES = new Set([2, 5, 9, 12, 13, 16, 17, 25, 28]);
const ANSWER_SET_SHA256 = '938c0bc0cf2cfdd3e3c413cbbe5215d41939727a45129c1a34fd892d41cc0919';

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function fileHash(relativePath) {
  return hash(fs.readFileSync(path.join(ROOT, relativePath)));
}

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function minimumColorCount(countries, edges) {
  const adjacency = Object.fromEntries(countries.map((country) => [country, new Set()]));
  edges.forEach(([a, b]) => {
    adjacency[a].add(b);
    adjacency[b].add(a);
  });
  const order = countries.slice().sort((a, b) => adjacency[b].size - adjacency[a].size);
  function possible(colorCount) {
    const assigned = {};
    function search(index) {
      if (index === order.length) return true;
      const country = order[index];
      for (let color = 1; color <= colorCount; color += 1) {
        if ([...adjacency[country]].some((other) => assigned[other] === color)) continue;
        assigned[country] = color;
        if (search(index + 1)) return true;
        delete assigned[country];
      }
      return false;
    }
    return search(0);
  }
  for (let count = 1; count <= countries.length; count += 1) {
    if (possible(count)) return count;
  }
  return countries.length;
}

function validateMapColoring(item) {
  const asset = item.assetSpec;
  const countries = item.meta.countries;
  const regionById = Object.fromEntries(asset.regions.map((region) => [region.id, region]));
  const boundary = new Map();
  const pointOnly = new Map();
  for (let i = 0; i < countries.length; i += 1) {
    for (let j = i + 1; j < countries.length; j += 1) {
      const a = countries[i];
      const b = countries[j];
      const shared = regionById[a].polygon.filter((vertex) => regionById[b].polygon.includes(vertex));
      if (shared.length >= 2) boundary.set(pairKey(a, b), [a, b]);
      else if (shared.length === 1) pointOnly.set(pairKey(a, b), [a, b]);
    }
  }
  assert.deepEqual(
    [...boundary.keys()].sort(),
    asset.positiveBoundaryPairs.map((pair) => pairKey(...pair)).sort(),
    item.id + ': shared-boundary contacts'
  );
  assert.deepEqual(
    [...pointOnly.keys()].sort(),
    asset.pointOnlyPairs.map((pair) => pairKey(...pair)).sort(),
    item.id + ': point-only contacts'
  );
  const edges = [...boundary.values(), ...pointOnly.values()];
  const answer = minimumColorCount(countries, edges);
  assert.equal(answer, item.meta.chromaticNumber, item.id + ': chromatic number');
  assert.equal(item.answer, answer + '가지', item.id + ': answer');
  const witness = item.verification.primary.witnessColoring;
  edges.forEach(([a, b]) => assert.notEqual(witness[a], witness[b], item.id + ': coloring witness'));
}

function edgeKey(a, b) {
  return [a.join(','), b.join(',')].sort().join('|');
}

function gridShortestCount(model, start, target, forbidden) {
  const blocked = new Set((model.blockedEdges || []).map((edge) => edgeKey(edge[0], edge[1])));
  const key = (point) => point.join(',');
  const queue = [[start, 0]];
  const distance = new Map([[key(start), 0]]);
  const count = new Map([[key(start), 1]]);
  for (let head = 0; head < queue.length; head += 1) {
    const [point, steps] = queue[head];
    const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [point[0] + dx, point[1] + dy]);
    neighbors.forEach((next) => {
      if (next[0] < 0 || next[0] > model.maxX || next[1] < 0 || next[1] > model.maxY) return;
      if (forbidden && key(next) === key(forbidden)) return;
      if (blocked.has(edgeKey(point, next))) return;
      const nextKey = key(next);
      const nextDistance = steps + 1;
      if (!distance.has(nextKey)) {
        distance.set(nextKey, nextDistance);
        count.set(nextKey, count.get(key(point)));
        queue.push([next, nextDistance]);
      } else if (distance.get(nextKey) === nextDistance) {
        count.set(nextKey, count.get(nextKey) + count.get(key(point)));
      }
    });
  }
  return {distance: distance.get(key(target)), count: count.get(key(target)) || 0};
}

function validateGridPath(item) {
  const model = item.assetSpec.promptModel;
  const {A, B, C, D} = model.points;
  const first = gridShortestCount(model, A, B, C);
  const second = gridShortestCount(model, B, D, C);
  assert.equal(first.count, item.meta.aToBCount, item.id + ': A-B count');
  assert.equal(second.count, item.meta.bToDWithoutCCount, item.id + ': B-D count');
  assert.equal(first.distance + second.distance, item.meta.shortestDistance, item.id + ': distance');
  assert.equal(item.answer, first.count * second.count + '가지', item.id + ': answer');
}

assert.equal(data.sourceSet, 'final');
assert.equal(data.sourceRound, 2);
assert.equal(data.freezePolicy.runtimeGeneration, false);
assert.equal(data.freezePolicy.fixedItemCount, 90);
assert.equal(data.freezePolicy.variantsPerSourceQuestion, 3);
assert.deepEqual(data.reviewSummary, {verified: 90, pending: 0});
assert.equal(data.items.length, 90);
assert.equal(new Set(data.items.map((item) => item.id)).size, 90);
const tilingRenderer = builderSource.match(/function tilingSvg\(spec\)\{([\s\S]*?)\n\}/);
assert.ok(tilingRenderer, 'Q16 tiling renderer is present');
assert.doesNotMatch(tilingRenderer[1], /×|piece\.count|piece\.label/, 'Q16 prompt drawing does not repeat piece quantities or labels');

for (const [relativePath, expected] of Object.entries(data.sourceFingerprints)) {
  assert.equal(fileHash(relativePath), expected, relativePath + ': source fingerprint');
}

for (let no = 1; no <= 30; no += 1) {
  const group = data.items.filter((item) => item.sourceNo === no).sort((a, b) => a.variantNo - b.variantNo);
  assert.equal(group.length, 3, no + ': exactly three variants');
  assert.deepEqual(group.map((item) => item.variantNo), [1, 2, 3]);
  assert.equal(new Set(group.map((item) => item.pointBand)).size, 1, no + ': one point band');
  const promptSignatures = group.map((item) => hash(JSON.stringify({
    text: item.text,
    promptDataLines: item.promptDataLines || [],
    promptModel: item.assetSpec && (item.assetSpec.promptModel || item.assetSpec.regions),
  })));
  assert.equal(new Set(promptSignatures).size, 3, no + ': three distinct prompts');
}

for (const item of data.items) {
  assert.equal(item.reviewStatus, 'verified', item.id + ': review status');
  assert.equal(item.conditionLines, undefined, item.id + ': no numbered restatement or hint list');
  assert.equal(Boolean(item.promptDataLines), [15, 19].includes(item.sourceNo), item.id + ': only indispensable source data may be separated from the prose');
  assert.ok(item.area && item.subarea && item.detailType, item.id + ': taxonomy');
  assert.ok(item.readingFocus && item.solutionSkill, item.id + ': reading and method');
  assert.ok(Array.isArray(item.solutionSteps) && item.solutionSteps.length >= 3, item.id + ': detailed steps');
  assert.ok(item.solutionSteps.join('').length >= 100, item.id + ': detailed explanation length');
  assert.equal(item.solution, item.solutionSteps.join(' '), item.id + ': rendered solution');
  assert.equal(Boolean(item.asset), VISUAL_SOURCES.has(item.sourceNo), item.id + ': prompt figure contract');
  if (item.asset) {
    assert.equal(item.asset.kind, 'raster', item.id + ': raster prompt figure');
    assert.match(item.asset.src, /^data:image\/png;base64,iVBORw0KGgo/, item.id + ': PNG prompt figure');
  }
  if (item.sourceNo === 28) {
    assert.ok(item.asset.width >= 375 && item.asset.height >= 275, item.id + ': enlarged road graph raster');
    assert.match(item.solutionAsset.src, /^data:image\/png;base64,iVBORw0KGgo/, item.id + ': annotated answer map');
    assert.notEqual(item.asset.src,item.solutionAsset.src,item.id + ': prompt and answer figures are distinct');
    assert.equal(item.solutionAssetAfterStep,3,item.id + ': picture follows repeat-road explanation');
    assert.match(item.solutionSteps[3],/가장 짧은 길.*2로 나누면/s,item.id + ': visible minimum proof');
    const edges=item.assetSpec.edgeGroups.flatMap(group=>group.edges.map(edge=>typeof edge==='string'?{edge,weight:group.weight}:edge));
    const key=edge=>edge.split('').sort().join('');
    const byKey=new Map(edges.map(edge=>[key(edge.edge),edge.weight]));
    const counts=new Map();let distance=0;
    const route=item.meta.parameters.routeWitness;
    route.slice(1).forEach((node,i)=>{const k=key(route[i]+node);assert.ok(byKey.has(k));counts.set(k,(counts.get(k)||0)+1);distance+=byKey.get(k);});
    assert.equal(counts.size,18,item.id + ': route covers every road');
    assert.equal(route[0],route[route.length-1],item.id + ': route returns to A');
    assert.deepEqual([...counts].filter(([k,n])=>n===2).map(([k])=>k).sort(),['AG','CH','EI']);
    assert.ok([...counts.values()].every(n=>n===1||n===2));
    const odd=item.meta.parameters.oddVertices;
    const degree={};edges.forEach(({edge})=>edge.split('').forEach(node=>degree[node]=(degree[node]||0)+1));
    assert.deepEqual(Object.keys(degree).filter(node=>degree[node]%2).sort(),odd.slice().sort(),item.id + ': recomputed odd-degree vertices');
    assert.equal(edges.reduce((sum,edge)=>sum+edge.weight,0),item.meta.parameters.baseEdgeSum,item.id + ': all eighteen road lengths');
    const lowerBound=odd.reduce((sum,node)=>sum+Math.min(...edges.filter(edge=>edge.edge.includes(node)).map(edge=>edge.weight)),0)/2;
    assert.equal(lowerBound,item.meta.parameters.minimumAddedDistance,item.id + ': endpoint lower bound is attained');
    assert.equal(distance,Number(item.answer),item.id + ': pictured route length');
  }
  if (item.sourceNo === 12) {
    assert.equal(item.answer, '그림 답안', item.id + ': drawing response');
    assert.match(item.solutionAsset.src, /^data:image\/png;base64,iVBORw0KGgo/, item.id + ': solution drawing');
  } else {
    assert.ok(item.acceptedAnswers.includes(item.answer), item.id + ': accepted answer');
    if(item.sourceNo!==28)assert.equal(item.solutionAsset, undefined, item.id + ': unexpected solution figure');
  }
  if (item.sourceNo === 5) validateMapColoring(item);
  if (item.sourceNo === 13) validateGridPath(item);
}

const identity = data.items.map((item) => ({
  id: item.id,
  sourceNo: item.sourceNo,
  variantNo: item.variantNo,
  text: item.text,
  promptDataLines: item.promptDataLines || [],
}));
const content = data.items.map(({asset, solutionAsset, ...item}) => item);
assert.equal(hash(JSON.stringify(identity)), data.freezePolicy.questionIdentitySetHash, 'identity freeze hash');
assert.equal(hash(JSON.stringify(content)), data.freezePolicy.itemContentSetHash, 'content freeze hash');
assert.equal(hash(data.items.map((item) => item.id + '=' + item.answer).join('\n')), ANSWER_SET_SHA256, 'independently approved answer set');

console.log('PASS Final2 fixed90: 30 source types x 3 distinct prompts, locked source hashes, detailed solutions, 27 prompt PNGs, 6 solution PNGs, high-risk map/path recomputation, road lower bounds and route witnesses, approved answer set');
