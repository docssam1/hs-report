'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const box={window:{}};
vm.createContext(box);
vm.runInContext(read('mock-data-final.js'),box);
vm.runInContext(read('final2-solution-diagrams.js'),box);
vm.runInContext(read('final2-detailed-data.js'),box);
vm.runInContext(read('final1-detailed-data.js'),box);
vm.runInContext(read('final-detailed-solutions.js'),box);
const w=box.window,items=w.GFIELD_MOCK_FINAL.rounds['2'].items;
const html=w.GFIELD_FINAL1_DETAILED_RENDERER.render({
  round:2,
  data:w.GFIELD_FINAL2_DETAILED,
  roundItems:items,
  resolve:w.GFIELD_FINAL2_RESOLVE_SOLUTION,
  renderDiagram:solution=>solution.diagram?w.GFIELD_FINAL2_SOLUTION_DIAGRAMS.render(solution.no):''
});
assert.match(html,/id="final2DetailedSolutions" data-detailed-round="2"/);
assert.match(html,/23문항 \/ 전체 30문항/);
assert.equal((html.match(/final1-detailed-card is-ready/g)||[]).length,23);
assert.equal((html.match(/final1-detailed-card is-pending/g)||[]).length,7);
assert.match(html,/id="printFinal2Solutions"/);
assert.equal((html.match(/class="final1-data-table"/g)||[]).length,14,'all reviewed step tables render');
assert.match(html,/101부터 500까지에서 2가 들어 있는 층별 개수/);
assert.match(html,/처음 묶음들과 20번째 묶음 비교/);
assert.match(html,/8번 만에 모두 아는 한 가지 통화 순서/);
assert.match(html,/그림에 주어진 도로의 길이별 합/);
assert.match(html,/gfield-final2-solution-diagram--q12/);
assert.match(html,/gfield-final2-solution-diagram--q28/);
assert.equal((html.match(/class="gfield-final2-solution-diagram /g)||[]).length,2,'each required reviewed SVG renders exactly once');
assert.match(html,/data-detailed-solution-no="15"/);
assert.match(html,/정답<\/strong> · 422/);
assert.doesNotMatch(html,/응시\s*인원|sourceLocator|reviewId/);
const final1=w.GFIELD_FINAL1_DETAILED_RENDERER.render({data:w.GFIELD_FINAL1_DETAILED,roundItems:w.GFIELD_MOCK_FINAL.rounds['1'].items});
assert.match(final1,/id="final1DetailedSolutions"/);
assert.match(final1,/id="printFinal1Solutions"/);
assert.match(final1,/id="final1-solution-1"/);
assert.match(final1,/data-final1-solution-no="1"/);
console.log('PASS Final2 renderer: 23 reviewed, 7 pending, numbered steps, tables, Q12 and Q28 SVGs, print control and no private evidence fields');
