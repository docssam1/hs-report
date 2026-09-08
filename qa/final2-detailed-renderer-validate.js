'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const demoteForNegativeControl=source=>source
  .replace("independentReviewStatus:'verified'","independentReviewStatus:'pending-final-representation-review'")
  .replace("releaseStatus:'eligible'","releaseStatus:'locked'");

function load(demoted){
  const box={window:{}};
  vm.createContext(box);
  vm.runInContext(read('mock-data-final.js'),box);
  vm.runInContext(read('final2-solution-diagrams.js'),box);
  vm.runInContext(demoted?demoteForNegativeControl(read('final2-detailed-data.js')):read('final2-detailed-data.js'),box);
  vm.runInContext(read('final1-detailed-data.js'),box);
  vm.runInContext(read('final-detailed-solutions.js'),box);
  return box.window;
}

function render(w){
  const items=w.GFIELD_MOCK_FINAL.rounds['2'].items;
  return w.GFIELD_FINAL1_DETAILED_RENDERER.render({
    round:2,
    data:w.GFIELD_FINAL2_DETAILED,
    roundItems:items,
    resolve:w.GFIELD_FINAL2_RESOLVE_SOLUTION,
    renderDiagram:solution=>solution.diagram?w.GFIELD_FINAL2_SOLUTION_DIAGRAMS.render(solution.no):''
  });
}

const w=load(false);
const html=render(w);
assert.match(html,/id="final2DetailedSolutions" data-detailed-round="2"/);
assert.match(html,/30문항 \/ 전체 30문항/);
assert.equal((html.match(/final1-detailed-card is-ready/g)||[]).length,30);
assert.equal((html.match(/final1-detailed-card is-pending/g)||[]).length,0);
assert.match(html,/id="printFinal2Solutions"/);
assert.equal((html.match(/class="final1-data-table"/g)||[]).length,20,'all integrated step tables render');

for(const marker of [
  '10+9로 나눈 큰 사각형 묶음',
  '나라별 색 배정',
  '첫 모서리별 다섯 모서리 경로 수',
  '교차점에 수를 더해 얻은 두 구간의 길 수',
  'A를 왼쪽 위에 고정했을 때 가능한 B의 여섯 자리',
  '그림 III에 후보 두 개가 놓이는 쪽',
  '101부터 500까지에서 2가 들어 있는 층별 개수',
  '처음 묶음들과 20번째 묶음 비교',
  '8번 만에 모두 아는 한 가지 통화 순서',
  '그림에 주어진 도로의 길이별 합'
]) assert.ok(html.includes(marker),'integrated table marker: '+marker);

for(const [no,className] of [
  [2,'gfield-final2-solution-diagram--q2'],
  [5,'gfield-final2-solution-diagram--q5'],
  [9,'gfield-final2-solution-diagram--q9'],
  [12,'gfield-final2-solution-diagram--q12'],
  [13,'gfield-final2-solution-diagram--q13'],
  [16,'gfield-final2-solution-diagram--q16'],
  [28,'gfield-final2-solution-diagram--q28']
]){
  const count=(html.match(new RegExp('class="gfield-final2-solution-diagram '+className+'"','g'))||[]).length;
  assert.equal(count,1,'Q'+no+' required SVG renders exactly once');
}
assert.equal((html.match(/class="gfield-final2-solution-diagram /g)||[]).length,7,'seven required reviewed SVGs render');

for(const no of [2,5,9,13,14,16,17]){
  assert.match(html,new RegExp('data-detailed-solution-no="'+no+'"'),'new Q'+no+' ready card');
}
assert.match(html,/이 문제의 ‘만나는’에는 한 점에서 닿는 경우도 포함합니다/);
assert.match(html,/가와 바 사이에 새 국경선을 그리는 것이 아닙니다/);
assert.match(html,/정답<\/strong> · 39개/);
assert.match(html,/정답<\/strong> · 8가지/);
assert.match(html,/정답<\/strong> · 16가지/);
assert.match(html,/정답<\/strong> · 225개/);
assert.match(html,/정답<\/strong> · 4가지/);
assert.match(html,/정답<\/strong> · ①, ⑦/);
assert.doesNotMatch(html,/응시\s*인원|sourceLocator|reviewId|diagramModel|learnerFit/);

const demotedHtml=render(load(true));
assert.match(demotedHtml,/0문항 \/ 전체 30문항/);
assert.equal((demotedHtml.match(/final1-detailed-card is-ready/g)||[]).length,0,'demoted approval has no ready cards');
assert.equal((demotedHtml.match(/final1-detailed-card is-pending/g)||[]).length,30,'demoted approval fails closed for every card');
assert.doesNotMatch(demotedHtml,/작은 정사각형과 이웃한 두 칸이 만든 큰 사각형/,'demoted data exposes no solution text');

const final1=w.GFIELD_FINAL1_DETAILED_RENDERER.render({
  data:w.GFIELD_FINAL1_DETAILED,
  roundItems:w.GFIELD_MOCK_FINAL.rounds['1'].items
});
assert.match(final1,/id="final1DetailedSolutions"/);
assert.match(final1,/id="printFinal1Solutions"/);
assert.match(final1,/id="final1-solution-1"/);
assert.match(final1,/data-final1-solution-no="1"/);

console.log('PASS Final2 renderer: public 30/30, 20 tables, seven exact diagram figures, approval demotion fails closed, and no private evidence fields');
