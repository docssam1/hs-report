'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const box={window:{}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root,'final2-solution-diagrams.js'),'utf8'),box,{filename:'final2-solution-diagrams.js'});

const registry=box.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS;
assert.ok(registry&&typeof registry.calculate==='function'&&typeof registry.render==='function');
assert.ok(Object.isFrozen(registry)&&Object.isFrozen(registry.model),'diagram registry is immutable');

const q12=registry.render(12);
assert.match(q12,/gfield-final2-solution-diagram--q12/,'existing Q12 projection remains registered');
assert.match(q12,/gfield-final2-q12-answer/,'existing Q12 answer path remains present');

const q28Model=registry.model.q28;
assert.equal(q28Model.id,'q28-weighted-road-graph-v1');
assert.equal(q28Model.nodes.length,9);
assert.equal(q28Model.edges.length,18);
assert.equal(new Set(q28Model.edges.map(edge=>edge.id)).size,18);
assert.deepEqual(Array.from(q28Model.duplicateEdgeIds),['AG','CH','EI']);

const q28=registry.calculate(28);
assert.equal(q28.baseLength,201);
assert.equal(q28.addedLength,15);
assert.equal(q28.routeLength,216);
assert.deepEqual(Array.from(q28.oddVertices),['A','C','E','G','H','I']);

const q28Html=registry.render(28);
assert.match(q28Html,/gfield-final2-solution-diagram--q28/);
assert.match(q28Html,/role="img"/);
assert.match(q28Html,/한 번 더 지나는 길/);
assert.equal((q28Html.match(/data-edge-id=/g)||[]).length,18,'all reviewed roads render exactly once');
assert.equal((q28Html.match(/class="gfield-final2-q28-edge is-repeated"/g)||[]).length,3,'the three minimum repeated roads are marked');
assert.equal((q28Html.match(/data-node-id=/g)||[]).length,9,'all villages render exactly once');

for(const unknown of [0,1,27,29,31,'unknown',null,undefined]){
  assert.equal(registry.calculate(unknown),null,`unknown model ${String(unknown)} does not calculate`);
  assert.equal(registry.render(unknown),'',`unknown model ${String(unknown)} fails closed`);
}

console.log('PASS Final2 safe diagram registry: Q12 preserved, Q28 graph is exact, unknown models fail closed');
