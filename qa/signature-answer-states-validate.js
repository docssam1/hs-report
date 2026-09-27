'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data={window:{}};
vm.createContext(data);
vm.runInContext(fs.readFileSync(path.join(root,'mock-data-original.js'),'utf8'),data);
const html=fs.readFileSync(path.join(root,'final.html'),'utf8');
const marker=html.indexOf('지필드 영재교육 · 파이널 모의고사 진단 LMS (final.html)');
const start=html.lastIndexOf('<script>',marker)+'<script>'.length;
const end=html.indexOf('</script>',marker);
const sandbox={window:null,URL,URLSearchParams,location:{search:'?set=original&round=2',protocol:'file:',hostname:'',href:''},
  document:{readyState:'loading',addEventListener(){},getElementById(){return {style:{}};}},
  localStorage:{getItem(){return '';}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},
  GFIELD_MOCK_ORIGINAL:data.window.GFIELD_MOCK_ORIGINAL,GFIELD_DATA:{students:[]}};
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(html.slice(start,end),sandbox,{filename:'final.html',timeout:3000});
const core=sandbox.GF_TEST;
const answer='O'.repeat(27)+'X-?';
assert.equal(core.validSignatureStates(answer,true),true);
assert.equal(core.validSignatureStates(answer,false),false,'pending cannot be scored');
assert.equal(core.validSignatureStates('O'.repeat(27)+'X-.' ,false),false,'unentered cannot be scored');
assert.equal(core.validSignatureStates('O'.repeat(27)+'X--',false),true);
assert.equal(core.signatureProjection('O'.repeat(27)+'X--'),'O'.repeat(27)+'XXX');
const summary=core.signatureStateSummary(answer);
assert.equal(summary.correct,27);
assert.equal(summary.wrong,1);
assert.equal(summary.blank,1);
assert.equal(summary.uncertain,1);
assert.equal(summary.unentered,0);
assert.ok(summary.maxScore>summary.score);
assert.equal(core.signatureStatesFromRow({ox:'O'.repeat(27)+'XXX',answer_states:'O'.repeat(27)+'X--'}).join(''),'O'.repeat(27)+'X--');
assert.equal(core.signatureStatesFromRow({ox:'O'.repeat(27)+'XXX',answer_states:null}),null,'legacy O/X has no inferred blanks');
assert.equal(core.signatureStatesFromRow({ox:'O'.repeat(27)+'XXO',answer_states:'O'.repeat(27)+'X--'}),null,'projection mismatch fails closed');
assert.match(fs.readFileSync(path.join(root,'admin-mock-v2.js'),'utf8'),/answer_states:null/,'reset must clear the new column');
console.log('PASS Signature explicit O/X/blank/pending states, score projection, legacy safety');
