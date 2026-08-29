'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = { window: {} };
context.window = context;
vm.createContext(context);

[
  'mock-data.js', 'mock-data-hw.js', 'mock-data-final.js',
  'mock-data-last.js', 'mock-data-last3.js', 'mock-data-last4.js',
  'last-score-data.js', 'mock-data-original.js',
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
});

const registry = require(path.join(ROOT, 'bank', 'bank-registry.js'));
const lastRounds = {};
for (const [round, scoreRound] of Object.entries(context.GFIELD_LAST_SCORE_DATA.rounds)) {
  const paperQuestions = context.GFIELD_MOCK_LAST.rounds[round]?.paper?.questions;
  assert.equal(scoreRound.items.length, 30, `최종 ${round}회 분류 문항 수`);
  assert.equal(paperQuestions.length, 30, `최종 ${round}회 시험지 문항 수`);
  lastRounds[round] = { items: scoreRound.items };
}
assert.equal(Object.keys(lastRounds).length, 4, '최종 1~4회가 모두 연결되어야 함');

const unified = registry.buildUnifiedCatalog({
  mid: context.GFIELD_MOCK,
  hw: context.GFIELD_MOCK_HW,
  final: context.GFIELD_MOCK_FINAL,
  last: { questions: 30, rounds: lastRounds },
  original: context.GFIELD_MOCK_ORIGINAL,
});
assert.deepEqual(
  {
    sourceQuestions: unified.summary.sourceQuestions,
    rawDisplayTypes: unified.summary.rawDisplayTypes,
    canonicalTypes: unified.summary.canonicalTypes,
    confirmedItems: unified.summary.confirmedItems,
    candidateItems: unified.summary.candidateItems,
  },
  { sourceQuestions: 810, rawDisplayTypes: 704, canonicalTypes: 123, confirmedItems: 60, candidateItems: 750 },
  '전체 분류 현황 수치',
);
assert.equal(unified.summary.duplicateSourceKeys.length, 0, '출처 문항 키 중복 없음');

const originalCatalog = registry.buildCatalog(context.GFIELD_MOCK_ORIGINAL);
const verifiedPractice = originalCatalog.filter((type) =>
  type.generator?.status === 'verified-practice' && type.generator.practiceReleaseReady === true,
);
assert.equal(verifiedPractice.length, 5, '독립 검산을 통과한 연습형 생성기 수');
assert.deepEqual(
  verifiedPractice.map((type) => type.generator.generatorId).sort(),
  ['cube', 'inclusion', 'path', 'remainder', 'tri'],
  '확정 원본 유형에 연결된 5개 연습형 생성기',
);
assert.ok(verifiedPractice.every((type) => type.sourceFaithfulReleaseReady === false), '연습형 검증을 원본 복기형 승인으로 오인하지 않음');

const catalogHtml = fs.readFileSync(path.join(ROOT, 'bank', 'catalog.html'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'bank', 'index.html'), 'utf8');
[
  '../mock-data.js', '../mock-data-hw.js', '../mock-data-final.js', '../mock-data-last.js',
  '../mock-data-original.js', 'bank-registry.js',
].forEach((source) => assert.match(catalogHtml, new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${source} 로드`));
assert.match(catalogHtml, /buildUnifiedCatalog\(models\)/, '통합 분류 레지스트리 결과 사용');
assert.match(catalogHtml, /검토 후보는 확정 분류가 아닙니다/, '후보 비확정 안내');
assert.match(catalogHtml, /원본 복기형 대조 대기/, '원본 대조 상태 표시');
assert.match(catalogHtml, /연습형 생성기 검증 완료/, '연습형 검증 상태 표시');
assert.match(catalogHtml, /aria-live="polite"/, '필터 결과 접근성 상태 영역');
assert.match(indexHtml, /class="catalog-link" href="catalog\.html"/, '문제은행 상단 현황 링크');

console.log('PASS bank catalog contract: 810 questions, 704 raw types, 123 groups, 60 confirmed, 750 candidates, 5 verified-practice generators');
