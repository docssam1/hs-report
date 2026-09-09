'use strict';

const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function load(withDiagrams=true,withBackhalf=true){
  const box={window:{},document:{querySelectorAll(){return [];}}};
  box.window.window=box.window;
  box.window.document=box.document;
  vm.createContext(box);
  vm.runInContext(read('mock-data-final.js'),box);
  if(withDiagrams){
    vm.runInContext(read('final3-solution-diagrams.js'),box);
    if(withBackhalf) vm.runInContext(read('final3-backhalf-solution-diagrams.js'),box);
  }
  vm.runInContext(read('final3-detailed-data.js'),box);
  vm.runInContext(read('final-detailed-solutions.js'),box);
  return box.window;
}

function renderDiagram(w,solution){
  if(!solution||!solution.diagram) return '';
  const registries=[w.GFIELD_FINAL3_SOLUTION_DIAGRAMS,w.GFIELD_FINAL3_BACKHALF_SOLUTION_DIAGRAMS];
  const registry=registries.find(candidate=>candidate&&candidate.modelFor(solution.no));
  return registry?registry.render(solution.no):'';
}

function render(w,allowLocked){
  const canonical=w.GFIELD_MOCK_FINAL.rounds[3].items;
  return w.GFIELD_FINAL1_DETAILED_RENDERER.render({
    round:3,
    data:w.GFIELD_FINAL3_DETAILED,
    roundItems:canonical,
    resolve:item=>w.GFIELD_FINAL3_RESOLVE_SOLUTION(item,{allowLocked}),
    renderDiagram:solution=>renderDiagram(w,solution)
  });
}

const count=(html,re)=>(html.match(re)||[]).length;
const w=load(true);
const publicReport=render(w,false);
assert.equal(count(publicReport,/class="final1-detailed-card is-ready"/g),30);
assert.equal(count(publicReport,/class="final1-detailed-card is-pending"/g),0);
assert.match(publicReport,/30문항 \/ 전체 30문항/);

const preview=render(w,true);
assert.equal(count(preview,/class="final1-detailed-card is-ready"/g),30);
assert.equal(count(preview,/class="final1-detailed-card is-pending"/g),0);
assert.match(preview,/30문항 \/ 전체 30문항/);
assert.match(preview,/@media print\{#final3DetailedSolutions \.is-pending\{display:none!important\}\}/);
for(const [no,answer] of [[1,'바나나 144개, 사과 233개'],[3,'검은 타일 188개'],[7,'동그라미 1개'],[14,'관호 35살, 주연 21살'],[24,'ㄱ=6, ㄴ=1, ㄷ=4, ㄹ=2, ㅁ=5, ㅂ=3, ㅅ=8, ㅇ=9'],[30,'4색']]){
  const card=preview.split('id="final3-solution-'+no+'"')[1].split('</article>')[0];
  assert.match(card,new RegExp('정답</strong> · '+answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
}
assert.equal(count(preview,/data-diagram-id="final3-q/g),14);
assert.ok(count(preview,/<svg\b/g)>=25);
assert.doesNotMatch(preview,/비공개|프로토타입|검수 전|표현 검수 대기|Q(?:1|3|4|6|7|8|13) ·/);
assert.match(preview,/13번 · 두 줄 벌집/);

const without=load(false);
const missing=render(without,true);
assert.equal(count(missing,/class="final1-detailed-card is-ready"/g),16,'only sixteen text-only reviewed items render without diagram APIs');
assert.equal(count(missing,/class="final1-detailed-card is-pending"/g),14);

const frontOnly=load(true,false);
const frontOnlyReport=render(frontOnly,true);
assert.equal(count(frontOnlyReport,/class="final1-detailed-card is-ready"/g),23,'missing back-half diagram API locks only seven diagram-dependent items');
assert.equal(count(frontOnlyReport,/class="final1-detailed-card is-pending"/g),7);

const canonical=w.GFIELD_MOCK_FINAL.rounds[3].items;
const noResolver=w.GFIELD_FINAL1_DETAILED_RENDERER.render({round:3,data:w.GFIELD_FINAL3_DETAILED,roundItems:canonical,renderDiagram:solution=>renderDiagram(w,solution)});
assert.equal(count(noResolver,/class="final1-detailed-card is-ready"/g),0,'round3 never falls back around its exact resolver');
assert.equal(count(noResolver,/class="final1-detailed-card is-pending"/g),30);
const noDiagramRenderer=w.GFIELD_FINAL1_DETAILED_RENDERER.render({round:3,data:w.GFIELD_FINAL3_DETAILED,roundItems:canonical,resolve:item=>w.GFIELD_FINAL3_RESOLVE_SOLUTION(item,{allowLocked:true})});
assert.equal(count(noDiagramRenderer,/class="final1-detailed-card is-ready"/g),16,'required diagrams fail closed when renderDiagram is omitted');
assert.equal(count(noDiagramRenderer,/class="final1-detailed-card is-pending"/g),14);

console.log('Final3 shared renderer QA: PASS (30/30 public and preview, exact display answers, fourteen fail-closed diagrams)');
