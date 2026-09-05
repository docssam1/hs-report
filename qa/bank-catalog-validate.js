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
  lastRounds[round] = {
    ...scoreRound,
    items: scoreRound.items.map((item, index) => ({ ...item, body: paperQuestions[index].body })),
  };
}
assert.equal(Object.keys(lastRounds).length, 4, '최종 1~4회가 모두 연결되어야 함');

const unified = registry.buildUnifiedCatalog({
  middle: context.GFIELD_MOCK,
  applied: context.GFIELD_MOCK_HW,
  final: context.GFIELD_MOCK_FINAL,
  last: { questions: 30, rounds: lastRounds },
  original: context.GFIELD_MOCK_ORIGINAL,
});
assert.deepEqual(
  {
    sourceQuestions: unified.summary.sourceQuestions,
    rawDisplayTypes: unified.summary.rawDisplayTypes,
    objectiveTypes: unified.summary.objectiveTypes,
    canonicalTypes: unified.summary.canonicalTypes,
    confirmedItems: unified.summary.confirmedItems,
    candidateItems: unified.summary.candidateItems,
  },
  { sourceQuestions: 840, rawDisplayTypes: 742, objectiveTypes: 748, canonicalTypes: 183, confirmedItems: 120, candidateItems: 720 },
  '전체 분류 현황 수치',
);
assert.equal(unified.summary.duplicateSourceKeys.length, 0, '출처 문항 키 중복 없음');
const finalOneItems = unified.items.filter((item) => item.sourceRef.set === 'final' && item.sourceRef.round === 1);
assert.equal(finalOneItems.length, 30, '파이널 1회 30문항');
assert.equal(finalOneItems.filter((item) => item.generator?.status === 'source-linked-review').length, 30, '파이널 1회 실제 유사문제 생성기 30문항 연결');
assert.ok(finalOneItems.every((item) => item.taxonomyPath?.major && item.taxonomyPath?.minor && item.taxonomyPath?.detail), '파이널 1회 대영역·소영역·세부유형 연결');
assert.equal(finalOneItems.find((item) => item.sourceRef.no === 4).detailType, '범위가 주어지지 않은 두 수의 곱의 최댓값·최솟값', '4번을 두 자리×두 자리 제한형과 분리');
assert.equal(finalOneItems.find((item) => item.sourceRef.no === 18).detailType, '보기의 접기 방법을 두 번 반복한 뒤 자르기', '18번은 보기 반복 읽기 세부유형');
assert.ok(finalOneItems.filter((item) => item.generator).every((item) => item.generator.practiceReleaseReady === false && item.generator.sourceFaithfulReleaseReady === false), '파이널 1회 눈 검수 전 공개 잠금');
assert.deepEqual(
  finalOneItems.filter((item) => item.generator).map((item) => item.sourceRef.no),
  Array.from({ length: 30 }, (_, index) => index + 1),
  '독립 검산 가능한 파이널 1회 30문항 연결',
);
const targetItems = unified.items.filter((item) => ['applied', 'final', 'last', 'original'].includes(item.sourceRef.set));
assert.equal(targetItems.length, 600, '문제은행 기본 범위는 활용~시그니처 실전 600문항');
assert.equal(targetItems.filter((item) => item.responseRateStatus === 'measured').length, 240, '파이널·최종 실제 정답률 240문항');
assert.equal(targetItems.filter((item) => item.bankDifficulty.basis === 'source-points').length, 360, '정답률 없는 문항은 배점 기준 360문항');
assert.ok(
  targetItems.some((item) => item.sourceKey === 'last|1|1' && item.searchEvidence.some((text) => /동화책/.test(text))),
  '최종 시험지 지문을 유형 검색 근거로 연결',
);

const originalCatalog = registry.buildCatalog(context.GFIELD_MOCK_ORIGINAL);
const verifiedPractice = originalCatalog.filter((type) =>
  type.generator?.status === 'verified-practice' && type.generator.practiceReleaseReady === true,
);
assert.equal(verifiedPractice.length, 3, '공개 가능한 일반 연습형 생성기 수');
assert.deepEqual(
  verifiedPractice.map((type) => type.generator.generatorId).sort(),
  ['cube', 'path', 'tri'],
  '확정 원본 유형에 연결된 3개 일반 연습형 생성기',
);
assert.ok(verifiedPractice.every((type) => type.sourceFaithfulReleaseReady === false), '연습형 검증을 원본 복기형 승인으로 오인하지 않음');
const sourceLinkedReview = originalCatalog.filter((type) => type.generator?.status === 'source-linked-review');
assert.deepEqual(
  sourceLinkedReview.map((type) => type.generator.generatorId).sort(),
  ['overlap-range-sum', 'remainder-yes-no'],
  '실제 사용자 원본 문항 구조를 따라 만든 유사문제 검토형',
);
assert.ok(sourceLinkedReview.every((type) => !type.practiceReleaseReady && !type.sourceFaithfulReleaseReady), '눈 검수 전 공개 승인 잠금');

const catalogHtml = fs.readFileSync(path.join(ROOT, 'bank', 'catalog.html'), 'utf8');
const catalogJs = fs.readFileSync(path.join(ROOT, 'bank', 'catalog.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'bank', 'index.html'), 'utf8');
[
  '../mock-data.js', '../mock-data-hw.js', '../mock-data-final.js', '../mock-data-last.js',
  '../mock-data-original.js', 'bank-registry.js', 'catalog.js',
].forEach((source) => assert.match(catalogHtml, new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${source} 로드`));
assert.match(catalogJs, /buildUnifiedCatalog\(models\)/, '통합 분류 레지스트리 결과 사용');
assert.match(catalogJs, /TARGET_SETS=\['applied','final','last','original'\]/, '활용~시그니처 기본 범위');
assert.match(catalogHtml, />시험지로 찾기</, '시험지로 찾기 탭');
assert.match(catalogHtml, />유형으로 찾기</, '유형으로 찾기 탭');
assert.match(catalogHtml, /지문 또는 유형/, '지문·유형 통합 검색');
assert.match(catalogHtml, /data-area="수·규칙찾기"/, '영역별 전체 유형 선택');
assert.match(catalogHtml, /시험지 난이도 기준/, '선택 회차 점수대 영역');
assert.match(catalogHtml, /최상·상·중간·하·최하/, '문제은행 5단계 난이도 안내');
assert.match(catalogJs, /item\.objectiveTypeId/, '이원목적표의 세부유형 식별자로 묶음');
assert.match(catalogJs, /class="subarea"/, '대영역 아래 소영역을 나누고 세부유형 카드를 표시');
assert.match(catalogJs, /세부유형/, '세 단계 유형 구조를 화면에 표시');
assert.match(catalogJs, /R\.bankDifficulty\(group\.benchmarkRate,null\)/, '실제 정답률 우선 난이도');
assert.match(catalogJs, /R\.bankDifficulty\(null,Math\.max/, '정답률 없으면 원문 배점 난이도');
assert.match(catalogJs, /기준 정답률/, '정답률 근거를 카드에 표시');
assert.match(catalogJs, /item\.searchEvidence/, '지문 설명까지 검색 근거로 사용');
assert.match(catalogJs, /이 유형 유사문제 검토하기/, '출처 구조 기반 유사문제 검토 연결');
assert.match(catalogHtml, /aria-live="polite"/, '필터 결과 접근성 상태 영역');
assert.match(indexHtml, /class="catalog-link" href="catalog\.html"/, '문제은행 상단 현황 링크');
assert.match(indexHtml, /data-role="points" data-val="2\.7"/, '2점대 별도 학습 선택');
assert.match(indexHtml, /data-role="points" data-val="3\.4"/, '3점대 별도 학습 선택');
assert.match(indexHtml, /data-role="points" data-val="4\.2"/, '4점대 별도 학습 선택');
assert.match(indexHtml, /data-role="tune" data-val="easy"/, '더 쉽게 난이도 조정');
assert.match(indexHtml, /data-role="tune" data-val="standard"/, '기준 난이도 조정');
assert.match(indexHtml, /data-role="tune" data-val="hard"/, '더 어렵게 난이도 조정');
assert.match(indexHtml, /data-role="ratio" data-val="easy"/, '쉽게 중심 난이도 비율');
assert.match(indexHtml, /data-role="ratio" data-val="balanced"/, '균형 난이도 비율');
assert.match(indexHtml, /data-role="ratio" data-val="hard"/, '어렵게 중심 난이도 비율');
assert.match(indexHtml, /지필드 생각하는 초등 황소 약점 유형 문제은행/, '요청한 문제은행 제목');
assert.match(indexHtml, /data-role="area" data-val="도형"/, '영역별 학습 선택');
assert.match(indexHtml, /유형 복수선택/, '여러 유형 동시 선택');
assert.match(indexHtml, /genIds: state\.genIds/, '선택 유형 목록을 시험지 생성기로 전달');
assert.match(indexHtml, /difficultyMode: state\.difficultyMode/, '난이도 조정을 시험지 생성기로 전달');
assert.match(indexHtml, /difficultyMix: state\.difficultyMix/, '난이도 혼합 비율을 시험지 생성기로 전달');

console.log('PASS bank catalog contract: 840 questions, 742 objective-table area/type pairs, five difficulty levels, rate-first/points-fallback');
