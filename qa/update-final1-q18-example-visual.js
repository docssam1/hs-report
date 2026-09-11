'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'bank', 'data', 'final1-fixed90.json');
const AUDIT_PATH = path.join(ROOT, 'qa', 'final1-fixed90-content-audit.json');
const WRITE = process.argv.includes('--write');
const SOURCE_FILES = [
  'bank/bank-core.js',
  'bank/bank-raster.js',
  'bank/gens/g-final1.js',
  'bank/gens/g-final1-solutions.js',
  'mock-data-final.js'
];
const GENERATOR_FIELDS = [
  'text', 'conditionLines', 'answer', 'solution', 'solutionSkill', 'solutionSteps', 'solutionAsset',
  'readingFocus', 'acceptedAnswers', 'answerPolicy', 'pointBand', 'learnerFit', 'variantKey', 'meta',
  'level', 'difficultyMode', 'genId', 'genName', 'area', 'subarea', 'detailType', 'sourceSet',
  'sourceRound', 'sourceNo', 'diagnosis'
];

const sha256Buffer = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sha256Text = (value) => sha256Buffer(Buffer.from(String(value), 'utf8'));
const sha256File = (filename) => sha256Buffer(fs.readFileSync(filename));

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
    'solution', 'solutionSteps', 'solutionAsset', 'itemContentHash', 'questionIdentityHash',
    'reviewStatus', 'reviewNotes', 'auditMetadata'
  ]);
  const locked = Object.keys(question).reduce((result, key) => {
    if (!solutionOnlyFields.has(key)) result[key] = question[key];
    return result;
  }, {});
  return sha256Text(JSON.stringify(canonicalize(locked)));
}

function itemContentHash(item) {
  return sha256Text(JSON.stringify({
    sourceNo: Number(item.sourceNo),
    genId: item.genId,
    generatorVersion: item.auditMetadata.generatorVersion,
    area: item.area,
    subarea: item.subarea,
    detailType: item.detailType,
    sourceStructure: item.sourceStructure,
    text: item.text,
    conditionLines: item.conditionLines || [],
    asset: item.asset || null,
    answer: item.answer,
    acceptedAnswers: item.acceptedAnswers || [],
    answerPolicy: item.answerPolicy,
    solution: item.solution,
    solutionSkill: item.solutionSkill,
    solutionSteps: item.solutionSteps || [],
    solutionAsset: item.solutionAsset || null,
    solutionEnricherVersion: item.auditMetadata.solutionEnricherVersion,
    readingFocus: item.readingFocus || '',
    diagnosis: item.diagnosis || null,
    meta: item.meta || {},
    sourceReference: item.sourceReference,
    sourceResponseRate: item.sourceResponseRate,
    sourceResponseRateBasis: item.sourceResponseRateBasis
  }));
}

function setHash(items, field) {
  return sha256Text(items.map((item) => `${item.id}:${item[field]}`).sort().join('\n'));
}

function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname === '/__q18_visual_update__.html') {
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
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(filename).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

(async () => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
  const { server, port } = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/__q18_visual_update__.html`, { waitUntil: 'load' });
    const generated = await page.evaluate(() => {
      const ids = Array.from({ length: 30 }, (_, index) => `final1-q${String(index + 1).padStart(2, '0')}`);
      const paper = BANK_CORE.buildPaper({
        genIds: ids,
        perGenerator: 3,
        seedStr: 'F190',
        difficultyMode: 'standard',
        difficultyMix: 'single',
        pointBand: 'all'
      });
      return paper.questions.filter((question) => question.genId === 'final1-q18')
        .map((question) => BANK_FINAL1_SOLUTIONS.enrich(question));
    });
    assert.equal(generated.length, 3, 'q18 생성 그림이 정확히 세 개가 아닙니다.');
    const generatedByKey = new Map(generated.map((item) => [item.variantKey, item]));
    assert.equal(generatedByKey.size, 3, 'q18 절단 유형 세 가지가 서로 다르지 않습니다.');

    const q18 = data.items.filter((item) => Number(item.sourceNo) === 18);
    assert.equal(q18.length, 3, '고정본 q18이 정확히 세 문항이 아닙니다.');
    q18.forEach((item) => {
      const replacement = generatedByKey.get(item.variantKey);
      assert.ok(replacement, `${item.id}: 같은 절단 유형의 새 그림을 찾지 못했습니다.`);
      GENERATOR_FIELDS.forEach((field) => assert.deepEqual(replacement[field], item[field], `${item.id}: 허용하지 않은 ${field} 변경`));
      const oldVerification = structuredClone(item.verification);
      const newVerification = structuredClone(replacement.verification);
      delete oldVerification.visibleEvidence;
      delete newVerification.visibleEvidence;
      assert.deepEqual(newVerification, oldVerification, `${item.id}: 수학 검산 계약이 바뀌었습니다.`);
      assert.match(replacement.asset.description, /보기에는 가로·세로 반 접기 한 세트만 한 번 그리고/);
      assert.match(replacement.verification.visibleEvidence.method, /보기에는 한 세트의 두 접기만 한 번 그림/);
      item.asset = replacement.asset;
      item.verification.visibleEvidence = replacement.verification.visibleEvidence;
      item.auditMetadata.independentEvidence = structuredClone(item.verification);
      item.itemContentHash = itemContentHash(item);
      item.questionIdentityHash = questionIdentityHash(item);
      item.auditMetadata.itemContentHash = item.itemContentHash;
      item.auditMetadata.questionIdentityHash = item.questionIdentityHash;
      item.reviewStatus = 'verified';
      item.reviewNotes = `${item.reviewNotes} 2026-09-11 사용자 검수에 따라 보기의 접기 그림은 한 세트만 한 번 제시하고, 두 번째 반복은 지문으로 읽도록 바로잡았습니다.`;

      const review = audit.itemReviews.find((row) => row.id === item.id);
      assert.ok(review, `${item.id}: 감사 기록이 없습니다.`);
      review.itemContentHash = item.itemContentHash;
      review.questionIdentityHash = item.questionIdentityHash;
      review.reviewStatus = 'verified';
      review.reviewNotes = item.reviewNotes;
    });

    data.freezePolicy.itemContentSetHash = setHash(data.items, 'itemContentHash');
    data.freezePolicy.questionIdentitySetHash = setHash(data.items, 'questionIdentityHash');
    SOURCE_FILES.forEach((relativePath) => { data.sourceFingerprints[relativePath] = sha256File(path.join(ROOT, relativePath)); });
    data.reviewSummary = data.items.reduce((result, item) => {
      result[item.reviewStatus] = (result[item.reviewStatus] || 0) + 1;
      return result;
    }, { verified: 0, pending: 0 });
    audit.frozenItemSetHash = data.freezePolicy.itemContentSetHash;
    audit.questionIdentitySetHash = data.freezePolicy.questionIdentitySetHash;
    audit.reviewedOn = '2026-09-11';
    audit.reviewSummary = data.reviewSummary;
    const rasterEvidence = audit.evidence.find((row) => row.id === 'raster-review');
    const identityEvidence = audit.evidence.find((row) => row.id === 'question-identity-lock');
    assert.ok(rasterEvidence && identityEvidence, '그림·문항 잠금 감사 근거가 없습니다.');
    rasterEvidence.method = 'PNG 서명·크기와 실제 표시를 확인하고 q18 보기는 접기 한 세트만 한 번 제시하며 두 번째 반복은 지문으로 읽도록 재검토';
    identityEvidence.method = `풀이 필드만 제외한 지문·조건·정답·문제 그림·수치 전제의 SHA-256 집합이 ${data.freezePolicy.questionIdentitySetHash}와 일치`;

    if (WRITE) {
      fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
      fs.writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
    }
    console.log(JSON.stringify({
      pass: true,
      mode: WRITE ? 'write' : 'dry-run',
      updatedIds: q18.map((item) => item.id),
      answers: q18.map((item) => item.answer),
      itemContentSetHash: data.freezePolicy.itemContentSetHash,
      questionIdentitySetHash: data.freezePolicy.questionIdentitySetHash,
      reviewSummary: data.reviewSummary
    }));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
