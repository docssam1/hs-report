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
const LOCKED_QUESTION_IDENTITY_SET_HASH = 'e8a78d3e29732e86ae4519d94ac18875110cdbb14553afd2690b0b7f8f3cf006';
const SOURCE_RESPONSE_RATE_BASIS = '파이널 1회 원문 문항에 연결된 난이도 분석용 추정 정답률입니다. 이 고정 변형 문항의 실측 정답률이 아닙니다.';
const IDS = Array.from({ length: 30 }, (_, index) => index + 1)
  .map((no) => `final1-q${String(no).padStart(2, '0')}`);
const SOURCE_FILES = [
  'bank/bank-core.js',
  'bank/bank-raster.js',
  'bank/gens/g-final1.js',
  'bank/gens/g-final1-solutions.js',
  'mock-data-final.js'
];

function sha256(filename) {
  return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}

function sha256Text(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = canonicalize(value[key]);
    return result;
  }, {});
}

function questionIdentityHash(question) {
  const solutionOnlyFields = new Set([
    'solution',
    'solutionSteps',
    'solutionAsset',
    'itemContentHash',
    'questionIdentityHash',
    'reviewStatus',
    'reviewNotes',
    'auditMetadata'
  ]);
  const lockedQuestion = Object.keys(question).reduce((result, key) => {
    if (!solutionOnlyFields.has(key)) result[key] = question[key];
    return result;
  }, {});
  return sha256Text(JSON.stringify(canonicalize(lockedQuestion)));
}

function itemContentHash(question, generator, sourceReference, sourceResponseRate, solutionEnricherVersion) {
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
    solutionAsset: question.solutionAsset || null,
    solutionEnricherVersion,
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

function loadPreviousFixedItems() {
  if (!fs.existsSync(OUTPUT_PATH)) return new Map();
  const artifact = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  const rows = Array.isArray(artifact.items) ? artifact.items : [];
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
        '<script src="/bank/gens/g-final1.js"></script>',
        '<script src="/bank/gens/g-final1-solutions.js"></script>'
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

function normalizedSolutionText(item) {
  return (item.solutionSteps || []).join(' ').replaceAll(',', '').replaceAll(' ', '');
}

function assertSolutionTokens(item, tokens) {
  const text = normalizedSolutionText(item);
  tokens.forEach((token) => {
    const normalizedToken = String(token).replaceAll(',', '').replaceAll(' ', '');
    assert.ok(text.includes(normalizedToken), `${item.id}: 독학 풀이에 실제 근거값 ${token}이 없습니다.`);
  });
}

function itemContentSetHash(items) {
  return sha256Text(items
    .map((item) => `${item.id}:${item.itemContentHash}`)
    .sort()
    .join('\n'));
}

(async () => {
  const sourceRound = loadSourceRound();
  const sourceByNo = new Map((sourceRound.items || []).map((item) => [Number(item.no), item]));
  const reviewById = loadReviewDecisions();
  const previousById = loadPreviousFixedItems();
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
      if (!window.BANK_FINAL1_SOLUTIONS || typeof window.BANK_FINAL1_SOLUTIONS.enrich !== 'function') {
        throw new Error('파이널 1회 풀이 보강 모듈을 읽지 못했습니다.');
      }
      paper.questions = paper.questions.map((question) => window.BANK_FINAL1_SOLUTIONS.enrich(question));
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
      return { paper, generatorMeta, solutionEnricherVersion: window.BANK_FINAL1_SOLUTIONS.version };
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
      const contentHash = itemContentHash(question, generator, sourceReference, sourceResponseRate, generated.solutionEnricherVersion);
      const currentReview = review && review.itemContentHash === contentHash;

      const item = {
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
          solutionEnricherVersion: generated.solutionEnricherVersion,
          promptKey: promptKey(question),
          itemContentHash: contentHash,
          independentEvidence: question.verification || null
        }
      };
      const identityHash = questionIdentityHash(item);
      const previous = previousById.get(id);
      if (previous) {
        assert.equal(identityHash, questionIdentityHash(previous), `${id}: 풀이 외의 잠긴 문제 본체가 바뀌었습니다.`);
      }
      item.questionIdentityHash = identityHash;
      item.auditMetadata.questionIdentityHash = identityHash;
      return item;
    });

    if (previousById.size) {
      assert.equal(previousById.size, 90, '이전 고정본의 문항 수가 90개가 아닙니다.');
      assert.equal(items.length, previousById.size, '풀이 보강 전후 문항 수가 달라졌습니다.');
    }

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

    items.forEach((item) => {
      assert.ok(Array.isArray(item.solutionSteps) && item.solutionSteps.length >= 3, `${item.id}: 순서별 독학 풀이가 3단계보다 짧습니다.`);
      assert.ok(item.solutionSteps.every((step) => typeof step === 'string' && step.trim().length >= 12), `${item.id}: 비어 있거나 지나치게 짧은 풀이 단계가 있습니다.`);
      if (item.sourceNo !== 23) {
        assert.ok(item.solutionSteps.filter((step) => /\d/.test(step)).length >= 2, `${item.id}: 실제 숫자가 들어간 계산 단계가 부족합니다.`);
      }
      const meta = item.meta || {};
      switch (item.sourceNo) {
        case 1: assertSolutionTokens(item, [meta.threshold, item.answer]); break;
        case 2: assertSolutionTokens(item, [meta.counts.zero, meta.counts.two, item.answer]); break;
        case 3: assertSolutionTokens(item, [meta.startHour, meta.endHour, item.answer]); break;
        case 4: assertSolutionTokens(item, [meta.minimumProduct, meta.maximumProduct, item.answer]); break;
        case 5: assertSolutionTokens(item, [meta.count, meta.base, meta.side, item.answer]); break;
        case 6: assertSolutionTokens(item, [meta.weeklyGainMinutes, meta.dailyGainMinutes, 720, item.answer]); break;
        case 7: assertSolutionTokens(item, [meta.total, meta.gaps[0], meta.gaps[4], item.answer]); break;
        case 8: assertSolutionTokens(item, [meta.total, meta.reward, meta.penalty, meta.received, item.answer]); break;
        case 9: assertSolutionTokens(item, [meta.multiplier, meta.target - 1, item.answer]); break;
        case 10: assertSolutionTokens(item, [meta.row, meta.first, meta.last, item.answer]); break;
        case 11: assertSolutionTokens(item, [meta.targetSum, ...meta.inner, item.answer]); break;
        case 12: assertSolutionTokens(item, [meta.total, meta.firstPair, meta.weighted, ...meta.matches[0], item.answer]); break;
        case 13: assertSolutionTokens(item, [...meta.rowSums, meta.columnSums[0], meta.columnSums[1], item.answer]); break;
        case 14: assertSolutionTokens(item, [meta.total, meta.squirrelGap, meta.dogGap, meta.rabbit, item.answer]); break;
        case 15: assertSolutionTokens(item, [...meta.counts, ...meta.firstColorCounts, item.answer]); break;
        case 16: assertSolutionTokens(item, [meta.divisor, ...meta.remainders, item.answer]); break;
        case 17: assertSolutionTokens(item, [meta.lineCount, meta.maximum, meta.minimum, item.answer]); break;
        case 18: assertSolutionTokens(item, [meta.totalHalfFolds, item.answer]); break;
        case 19: assertSolutionTokens(item, [meta.disks, item.answer]); break;
        case 20: assertSolutionTokens(item, [meta.activeCuts, item.answer]); break;
        case 21: assertSolutionTokens(item, [...meta.solvedValues, meta.rowSums[3], meta.columnSums[3]]); break;
        case 22: assertSolutionTokens(item, [meta.totalRectangles, meta.containingFirst, meta.containingSecond, meta.containingBoth, item.answer]); break;
        case 23: assertSolutionTokens(item, [meta.target, '목요일', meta.targetSport]); break;
        case 24: assertSolutionTokens(item, [meta.base, meta.exponent, ...meta.unitsCycle, item.answer]); break;
        case 25: assertSolutionTokens(item, [meta.divisor, meta.quotientGroups[0].quotient, meta.quotientGroups.at(-1).quotient, item.answer]); break;
        case 26: item.acceptedAnswers.forEach((accepted) => assertSolutionTokens(item, [accepted])); break;
        case 27: assertSolutionTokens(item, [meta.trainLength, meta.carLength, meta.relativeSpeed, item.answer]); break;
        case 28: assertSolutionTokens(item, [meta.hourMinutes, meta.chaseAngle, meta.chaseMinutes, meta.derivedHourHandDegreesPerMinute, item.answer]); break;
        case 29: assertSolutionTokens(item, [meta.numberCount, meta.leadingContribution, meta.otherContribution, item.answer]); break;
        case 30: assertSolutionTokens(item, meta.examples.map((row) => row.bottom).concat([meta.target.bottom])); break;
        default: throw new Error(`${item.id}: 독학 풀이 근거 검사 규칙이 없습니다.`);
      }
    });

    const solutionAssetItems = items.filter((item) => item.solutionAsset);
    assert.equal(solutionAssetItems.length, 6, '풀이 전용 그림은 q07·q18의 여섯 문항이어야 합니다.');
    solutionAssetItems.forEach((item) => {
      assert.ok(item.sourceNo === 7 || item.sourceNo === 18, `${item.id}: 허용되지 않은 유형에 풀이 그림이 추가되었습니다.`);
      assert.deepEqual(Object.keys(item.solutionAsset).sort(), ['description', 'height', 'kind', 'src', 'width'], `${item.id}: solutionAsset 필드 계약이 다릅니다.`);
      assert.equal(item.solutionAsset.kind, 'raster', `${item.id}: 풀이 그림이 래스터가 아닙니다.`);
      assert.match(item.solutionAsset.src || '', /^data:image\/png;base64,/, `${item.id}: 풀이 PNG data URI가 없습니다.`);
      assert.ok(item.solutionAsset.width >= 600 && item.solutionAsset.height >= 250, `${item.id}: 풀이 그림 크기가 너무 작습니다.`);
      assert.ok(item.solutionAsset.description.length >= 20, `${item.id}: 풀이 그림 설명이 부족합니다.`);
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

    const contentSetHash = itemContentSetHash(items);

    const sourceFingerprints = {};
    SOURCE_FILES.forEach((relativePath) => {
      sourceFingerprints[relativePath] = sha256(path.join(ROOT, relativePath));
    });
    const reviewCounts = items.reduce((counts, item) => {
      counts[item.reviewStatus] = (counts[item.reviewStatus] || 0) + 1;
      return counts;
    }, { verified: 0, pending: 0 });
    const questionIdentitySetHash = sha256Text(items
      .map((item) => `${item.id}:${item.questionIdentityHash}`)
      .sort()
      .join('\n'));
    assert.equal(questionIdentitySetHash, LOCKED_QUESTION_IDENTITY_SET_HASH, '기존 90문의 지문·정답·문제 그림·수치 전제 중 하나가 바뀌었습니다.');
    const artifact = {
      version: '1.0.0',
      sourceSet: 'final',
      sourceRound: 1,
      freezePolicy: {
        runtimeGeneration: false,
        fixedItemCount: 90,
        variantsPerSourceQuestion: 3,
        seed: FREEZE_SEED,
        questionIdentitySetHash,
        itemContentSetHash: contentSetHash,
        solutionEnricherVersion: generated.solutionEnricherVersion,
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
