'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'bank', 'data', 'final1-fixed90.json');
const AUDIT_PATH = path.join(ROOT, 'qa', 'final1-fixed90-content-audit.json');
const BROWSER_EXECUTABLE = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
const FREEZE_SEED = 'F190';
const SOURCE_RESPONSE_RATE_BASIS = '파이널 1회 원문 문항에 연결된 난이도 분석용 추정 정답률입니다. 이 고정 변형 문항의 실측 정답률이 아닙니다.';
const IDS = Array.from({ length: 30 }, (_, index) => index + 1)
  .map((no) => `final1-q${String(no).padStart(2, '0')}`);
const SOURCE_FILES = [
  'bank/bank-core.js',
  'bank/bank-raster.js',
  'bank/gens/g-final1.js',
  'mock-data-final.js'
];

function sha256(filename) {
  return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}

function sha256Text(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function itemContentHash(question, generator, sourceReference, sourceResponseRate) {
  return sha256Text(JSON.stringify({
    sourceNo: Number(question.sourceNo),
    genId: question.genId,
    generatorVersion: generator.version,
    area: question.area,
    subarea: question.subarea,
    detailType: question.detailType,
    sourceStructure: generator.sourceStructure,
    text: question.text,
    conditionLines: question.conditionLines || [],
    asset: question.asset || null,
    answer: question.answer,
    acceptedAnswers: question.acceptedAnswers || [],
    answerPolicy: question.answerPolicy,
    solution: question.solution,
    solutionSkill: question.solutionSkill,
    solutionSteps: question.solutionSteps || [],
    readingFocus: question.readingFocus || '',
    diagnosis: question.diagnosis || null,
    meta: question.meta || {},
    sourceReference,
    sourceResponseRate,
    sourceResponseRateBasis: SOURCE_RESPONSE_RATE_BASIS
  }));
}

function sourceReferenceFor(sourceRound, source, sourceNo, question, generator) {
  const reference = {
    title: sourceRound.title,
    questionNo: sourceNo,
    type: source.type,
    answer: source.answer,
    explanation: source.comment,
    caution: source.caution,
    readingFocus: source.readingFocus || generator.readingFocus || '',
    taxonomyPath: source.taxonomyPath || {
      major: source.area || question.area,
      minor: source.subarea || question.subarea,
      detail: source.detailType || source.type || question.detailType
    }
  };
  return reference;
}

function loadSourceRound() {
  const sandbox = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(ROOT, 'mock-data-final.js'), 'utf8'),
    sandbox,
    { filename: 'mock-data-final.js' }
  );
  const model = sandbox.window.GFIELD_MOCK_FINAL;
  assert.ok(model && model.rounds && model.rounds['1'], '파이널 1회 원문 메타데이터를 읽지 못했습니다.');
  return model.rounds['1'];
}

function loadReviewDecisions() {
  if (!fs.existsSync(AUDIT_PATH)) return new Map();
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
  const rows = Array.isArray(audit.itemReviews) ? audit.itemReviews : [];
  return new Map(rows.map((row) => [row.id, row]));
}

function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname === '/__final1_fixed90_builder__.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end([
        '<!doctype html><meta charset="utf-8">',
        '<script src="/bank/bank-core.js"></script>',
        '<script src="/bank/bank-raster.js"></script>',
        '<script src="/bank/gens/g-final1.js"></script>'
      ].join(''));
      return;
    }
    const filename = path.resolve(ROOT, `.${pathname}`);
    if (!filename.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const contentType = path.extname(filename) === '.js'
      ? 'application/javascript; charset=utf-8'
      : 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function promptKey(question) {
  return [
    question.text || '',
    Array.isArray(question.conditionLines) ? question.conditionLines.join('|') : '',
    question.variantKey || ''
  ].join('|');
}

(async () => {
  const sourceRound = loadSourceRound();
  const sourceByNo = new Map((sourceRound.items || []).map((item) => [Number(item.no), item]));
  const reviewById = loadReviewDecisions();
  const { server, port } = await startServer();
  const browser = await chromium.launch({
    headless: true,
    ...(BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(String(error)));

  try {
    await page.goto(`http://127.0.0.1:${port}/__final1_fixed90_builder__.html`, { waitUntil: 'load' });
    const generated = await page.evaluate(({ ids, seed }) => {
      const core = window.BANK_CORE;
      const paper = core.buildPaper({
        genIds: ids,
        perGenerator: 3,
        seedStr: seed,
        difficultyMode: 'standard',
        difficultyMix: 'single',
        pointBand: 'all'
      });
      const generatorMeta = {};
      ids.forEach((id) => {
        const generator = window.BANK_GENS.find((row) => row.id === id);
        if (!generator) throw new Error(`${id} 생성기를 찾지 못했습니다.`);
        generatorMeta[id] = {
          version: generator.version,
          name: generator.name,
          typeId: generator.typeId,
          sourceStructure: generator.sourceStructure,
          solutionSkill: generator.solutionSkill,
          readingFocus: generator.readingFocus,
          errorTags: generator.errorTags
        };
      });
      return { paper, generatorMeta };
    }, { ids: IDS, seed: FREEZE_SEED });

    assert.deepEqual(browserErrors, [], `브라우저 오류: ${browserErrors.join(' | ')}`);
    assert.equal(generated.paper.questions.length, 90, '고정 문항은 정확히 90개여야 합니다.');

    const seenIds = new Set();
    const countBySource = new Map();
    const items = generated.paper.questions.map((question) => {
      const sourceNo = Number(question.sourceNo);
      const variantNo = (countBySource.get(sourceNo) || 0) + 1;
      countBySource.set(sourceNo, variantNo);
      const id = `final1-q${String(sourceNo).padStart(2, '0')}-v${variantNo}`;
      const generator = generated.generatorMeta[question.genId];
      const source = sourceByNo.get(sourceNo);
      const review = reviewById.get(id);

      assert.ok(source, `${id}: 원문 메타데이터가 없습니다.`);
      assert.ok(generator, `${id}: 생성기 메타데이터가 없습니다.`);
      assert.ok(!seenIds.has(id), `${id}: 고정 문항 ID가 중복됩니다.`);
      seenIds.add(id);

      const sourceReference = sourceReferenceFor(sourceRound, source, sourceNo, question, generator);
      const sourceResponseRate = sourceRound.stats && sourceRound.stats.rate
        ? sourceRound.stats.rate[String(sourceNo)]
        : null;
      const contentHash = itemContentHash(question, generator, sourceReference, sourceResponseRate);
      const currentReview = review && review.itemContentHash === contentHash;

      return {
        ...question,
        id,
        variantNo,
        itemContentHash: contentHash,
        reviewStatus: currentReview && review.reviewStatus === 'verified' ? 'verified' : 'pending',
        reviewNotes: currentReview && typeof review.reviewNotes === 'string'
          ? review.reviewNotes
          : review
            ? '이전 검수 뒤 실제 문항 콘텐츠가 바뀌어 해시가 일치하지 않습니다. 문장·수학·원문 구조를 다시 검수해야 합니다.'
            : '생성기 내부의 주 계산·독립 계산 일치는 확인됨. 문장·수학·원문 구조의 독립 콘텐츠 감사 전이므로 검수 대기.',
        sourceStructure: generator.sourceStructure,
        sourceReference,
        sourceResponseRate,
        sourceResponseRateBasis: SOURCE_RESPONSE_RATE_BASIS,
        auditMetadata: {
          freezeSeed: FREEZE_SEED,
          generatorVersion: generator.version,
          generatorId: question.genId,
          promptKey: promptKey(question),
          itemContentHash: contentHash,
          independentEvidence: question.verification || null
        }
      };
    });

    IDS.forEach((genId, index) => {
      const sourceNo = index + 1;
      const group = items.filter((item) => item.sourceNo === sourceNo);
      assert.equal(group.length, 3, `${genId}: 고정 문항이 3개가 아닙니다.`);
      assert.equal(new Set(group.map(promptKey)).size, 3, `${genId}: 서로 다른 고정 지문 3개를 만들지 못했습니다.`);
    });

    items.filter((item) => item.asset).forEach((item) => {
      assert.equal(item.asset.kind, 'raster', `${item.id}: 래스터 그림이 아닙니다.`);
      assert.match(item.asset.src || '', /^data:image\/png;base64,/, `${item.id}: PNG data URI가 없습니다.`);
    });

    const q18 = items.filter((item) => item.sourceNo === 18);
    assert.deepEqual(new Set(q18.map((item) => item.meta.cutPattern)), new Set(['diagonals', 'single-diagonal', 'mid-cross']), 'q18: 절단 무늬 세 종류가 고정되지 않았습니다.');
    assert.deepEqual(new Set(q18.map((item) => Number(item.answer))), new Set([40, 12, 25]), 'q18: 절단 무늬별 답이 40·12·25가 아닙니다.');

    const q20 = items.filter((item) => item.sourceNo === 20);
    assert.deepEqual(new Set(q20.map((item) => item.meta.activeCuts)), new Set([2, 3, 6]), 'q20: 2·3·6회 절단 단계가 고정되지 않았습니다.');
    assert.deepEqual(new Set(q20.map((item) => Number(item.answer))), new Set([4, 8, 24]), 'q20: 절단 단계별 답이 4·8·24가 아닙니다.');

    const q26 = items.filter((item) => item.sourceNo === 26);
    assert.deepEqual(new Set(q26.map((item) => item.meta.presentationVariant)), new Set([0, 1, 2]), 'q26: 기본·아이 10살 미만·할아버지 70살 이상 조건이 각각 하나씩 고정되지 않았습니다.');
    q26.forEach((item) => {
      if (item.meta.presentationVariant === 0) {
        assert.equal(item.answerPolicy, 'any-one', `${item.id}: 기본 조건은 두 답 중 하나 허용이어야 합니다.`);
        assert.deepEqual(item.acceptedAnswers, ['63, 36, 9', '84, 48, 12'], `${item.id}: 기본 조건의 허용 답이 다릅니다.`);
      } else {
        assert.equal(item.answerPolicy, 'single', `${item.id}: 추가 나이 조건은 단일 답이어야 합니다.`);
        assert.equal(item.acceptedAnswers.length, 1, `${item.id}: 추가 나이 조건의 허용 답은 한 개여야 합니다.`);
        assert.equal(item.acceptedAnswers[0], item.meta.presentationVariant === 1 ? '63, 36, 9' : '84, 48, 12', `${item.id}: 추가 나이 조건의 답이 다릅니다.`);
      }
    });

    const q30 = items.filter((item) => item.sourceNo === 30);
    q30.forEach((item) => assert.equal(item.meta.examples.length, 3, `${item.id}: 완성 예시가 세 개가 아닙니다.`));

    const sourceFingerprints = {};
    SOURCE_FILES.forEach((relativePath) => {
      sourceFingerprints[relativePath] = sha256(path.join(ROOT, relativePath));
    });
    const reviewCounts = items.reduce((counts, item) => {
      counts[item.reviewStatus] = (counts[item.reviewStatus] || 0) + 1;
      return counts;
    }, { verified: 0, pending: 0 });
    const artifact = {
      version: '1.0.0',
      sourceSet: 'final',
      sourceRound: 1,
      freezePolicy: {
        runtimeGeneration: false,
        fixedItemCount: 90,
        variantsPerSourceQuestion: 3,
        seed: FREEZE_SEED,
        note: '이 파일에 저장된 실제 문항만 제공합니다. 열람할 때 새 문항을 생성하지 않습니다.'
      },
      sourceFingerprints,
      reviewSummary: reviewCounts,
      items
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
    console.log(`WROTE ${path.relative(ROOT, OUTPUT_PATH)} (${items.length} items, verified ${reviewCounts.verified}, pending ${reviewCounts.pending})`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
