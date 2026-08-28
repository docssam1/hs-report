'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE_DIR = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const META_FILE = path.join(ROOT, 'drafts', 'original-similar-2rounds', 'rigor-meta.json');
const DATA_FILES = {
  1: path.join(PRIVATE_DIR, 'original-form-round1-data.json'),
  2: path.join(PRIVATE_DIR, 'original-form-round2-data.json'),
};

const EXPECTED_ROUNDS = [1, 2];
const QUESTIONS_PER_ROUND = 30;
const PASS_SCORE_TENTHS = 210;
const MAX_LOW_SCORE_TENTHS = 108;
const MAX_SIMPLE_SCORE_TENTHS = 108;
const MIN_PASS_D3_COUNT = 3;

function questionKey(round, number) {
  return `R${round}Q${String(number).padStart(2, '0')}`;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readJson(file, label) {
  if (!fs.existsSync(file)) {
    throw new Error(`${label} 파일이 없습니다: ${path.relative(ROOT, file)}`);
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${label} JSON을 읽지 못했습니다: ${error.message}`);
  }
}

function toTenths(value, label, errors) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${label}: 배점이 유한한 숫자가 아닙니다.`);
    return 0;
  }
  const tenths = Math.round(value * 10);
  if (Math.abs(tenths / 10 - value) > 1e-9 || tenths <= 0) {
    errors.push(`${label}: 배점은 양수인 0.1점 단위여야 합니다 (${value}).`);
  }
  return tenths;
}

function difficultyNumber(value) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5) return value;
  if (!nonEmptyString(value)) return null;
  const match = value.trim().toUpperCase().match(/^D([1-5])(?:\+)?$/);
  return match ? Number(match[1]) : null;
}

function dependencyFlag(value) {
  if (typeof value === 'boolean') return value;
  if (!nonEmptyString(value)) return null;
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (['required', 'dependent', 'essential', 'visual', 'diagram', 'trace', 'yes', 'true'].includes(normalized)) return true;
  if (['none', 'independent', 'not-required', 'text-only', 'numeric-only', 'no', 'false'].includes(normalized)) return false;
  return null;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(nonEmptyString).map((entry) => entry.trim()))];
}

function normalizeMeta(raw, key, errors) {
  if (!isPlainObject(raw)) {
    errors.push(`${key}: 메타가 객체가 아닙니다.`);
    return null;
  }

  const difficulty = difficultyNumber(raw.difficultyClass);
  if (difficulty === null) {
    errors.push(`${key}: difficultyClass는 D1~D5 중 하나여야 합니다.`);
  }

  if (!Number.isInteger(raw.reasoningSteps) || raw.reasoningSteps < 1) {
    errors.push(`${key}: reasoningSteps는 1 이상의 정수여야 합니다.`);
  }
  if (!Number.isInteger(raw.branchCount) || raw.branchCount < 0) {
    errors.push(`${key}: branchCount는 0 이상의 정수여야 합니다.`);
  }
  if (!nonEmptyString(raw.solverId)) {
    errors.push(`${key}: 독립 검산을 식별하는 solverId가 필요합니다.`);
  }

  if (!isPlainObject(raw.conditions)) {
    errors.push(`${key}: conditions 객체가 필요합니다.`);
  }
  const declaredSimple = isPlainObject(raw.conditions) ? raw.conditions.simple : undefined;
  if (typeof declaredSimple !== 'boolean') {
    errors.push(`${key}: conditions.simple은 true 또는 false로 명시해야 합니다.`);
  }

  if (!isPlainObject(raw.visualTrace)) {
    errors.push(`${key}: visualTrace 객체가 필요합니다.`);
  }
  const visualDependency = isPlainObject(raw.visualTrace)
    ? dependencyFlag(raw.visualTrace.dependency)
    : null;
  if (visualDependency === null) {
    errors.push(`${key}: visualTrace.dependency는 시각 의존 여부를 명확히 나타내야 합니다.`);
  }
  const decisionPoints = isPlainObject(raw.visualTrace) ? raw.visualTrace.decisionPoints : undefined;
  if (!Number.isInteger(decisionPoints) || decisionPoints < 0) {
    errors.push(`${key}: visualTrace.decisionPoints는 0 이상의 정수여야 합니다.`);
  }
  const verifierId = isPlainObject(raw.visualTrace) ? raw.visualTrace.verifierId : undefined;
  if (visualDependency === true && !nonEmptyString(verifierId)) {
    errors.push(`${key}: 시각 의존 문항은 visualTrace.verifierId가 필요합니다.`);
  }
  if (visualDependency === true && Number.isInteger(decisionPoints) && decisionPoints < 1) {
    errors.push(`${key}: 시각 의존 문항의 decisionPoints는 1 이상이어야 합니다.`);
  }

  const sourceLocator = raw.sourceLocator;
  if (sourceLocator !== undefined && sourceLocator !== null && !isPlainObject(sourceLocator)) {
    errors.push(`${key}: sourceLocator는 비공개 sourceId 기반의 객체여야 합니다.`);
  }
  if (isPlainObject(sourceLocator)) {
    if (!nonEmptyString(sourceLocator.sourceId)) {
      errors.push(`${key}: sourceLocator.sourceId가 필요합니다.`);
    }
    if (!nonEmptyString(sourceLocator.kind)) {
      errors.push(`${key}: sourceLocator.kind가 필요합니다.`);
    }
  }

  const similarity = raw.similarity;
  if (similarity !== undefined && similarity !== null && !isPlainObject(similarity)) {
    errors.push(`${key}: similarity는 객체여야 합니다.`);
  }
  const variantOf = (isPlainObject(similarity) && similarity.variantOf)
    || (isPlainObject(sourceLocator) && sourceLocator.variantOf)
    || null;
  const changeDimensions = isPlainObject(similarity)
    ? uniqueStrings(similarity.changeDimensions)
    : [];
  const preservedInvariants = isPlainObject(similarity)
    ? uniqueStrings(similarity.preservedInvariants)
    : [];

  if (variantOf) {
    if (changeDimensions.length < 2) {
      errors.push(`${key}: 유사형은 similarity.changeDimensions에 서로 다른 변형 차원을 2개 이상 기록해야 합니다.`);
    }
    if (preservedInvariants.length < 1) {
      errors.push(`${key}: 유사형은 similarity.preservedInvariants에 보존한 난이도 기제를 기록해야 합니다.`);
    }
  }

  const automaticallySimple = Number.isInteger(raw.reasoningSteps)
    && raw.reasoningSteps <= 1
    && Number.isInteger(raw.branchCount)
    && raw.branchCount <= 1
    && visualDependency !== true;

  return {
    key,
    difficulty,
    simple: declaredSimple === true || automaticallySimple,
    declaredSimple,
    reasoningSteps: raw.reasoningSteps,
    branchCount: raw.branchCount,
    visualDependency,
    variantOf,
    changeDimensions,
    preservedInvariants,
    hasDirectSource: isPlainObject(sourceLocator)
      && nonEmptyString(sourceLocator.sourceId)
      && nonEmptyString(sourceLocator.kind),
  };
}

function loadQuestions(errors) {
  const byRound = new Map();
  const seen = new Set();

  for (const round of EXPECTED_ROUNDS) {
    const payload = readJson(DATA_FILES[round], `원본형 ${round}회 생성 데이터`);
    if (!Array.isArray(payload.questions)) {
      errors.push(`원본형 ${round}회: questions 배열이 없습니다.`);
      byRound.set(round, []);
      continue;
    }
    if (payload.questions.length !== QUESTIONS_PER_ROUND) {
      errors.push(`원본형 ${round}회: 30문항이 아닙니다 (${payload.questions.length}문항).`);
    }

    const questions = payload.questions.map((question, index) => {
      const number = question.number;
      const key = questionKey(round, number);
      if (question.round !== round) {
        errors.push(`${key}: 생성 데이터의 round가 ${round}이 아닙니다.`);
      }
      if (!Number.isInteger(number) || number < 1 || number > QUESTIONS_PER_ROUND) {
        errors.push(`원본형 ${round}회 ${index + 1}번 항목: number가 1~30 범위의 정수가 아닙니다.`);
      }
      if (seen.has(key)) errors.push(`${key}: 중복 문항 키입니다.`);
      seen.add(key);
      return {
        round,
        number,
        key,
        pointTenths: toTenths(question.point, key, errors),
      };
    });

    const actualNumbers = questions.map((question) => question.number).sort((a, b) => a - b);
    const expectedNumbers = Array.from({ length: QUESTIONS_PER_ROUND }, (_, index) => index + 1);
    if (JSON.stringify(actualNumbers) !== JSON.stringify(expectedNumbers)) {
      errors.push(`원본형 ${round}회: 문항 번호가 1~30을 정확히 한 번씩 포함하지 않습니다.`);
    }
    const total = questions.reduce((sum, question) => sum + question.pointTenths, 0);
    if (total !== 1000) errors.push(`원본형 ${round}회: 총점이 ${(total / 10).toFixed(1)}점으로 100점이 아닙니다.`);
    byRound.set(round, questions);
  }
  return byRound;
}

function loadMetadata(errors, expectedKeys) {
  const payload = readJson(META_FILE, '난이도 메타');
  if (payload.schemaVersion !== 1) {
    errors.push(`rigor-meta.json: schemaVersion은 1이어야 합니다.`);
  }
  if (!isPlainObject(payload.items)) {
    errors.push('rigor-meta.json: items 객체가 필요합니다.');
    return new Map();
  }

  const actualKeys = Object.keys(payload.items);
  const expectedSet = new Set(expectedKeys);
  const actualSet = new Set(actualKeys);
  const missing = expectedKeys.filter((key) => !actualSet.has(key));
  const extra = actualKeys.filter((key) => !expectedSet.has(key));
  if (missing.length) errors.push(`메타 누락 ${missing.length}개: ${missing.join(', ')}`);
  if (extra.length) errors.push(`알 수 없는 메타 ${extra.length}개: ${extra.join(', ')}`);
  if (actualKeys.length !== EXPECTED_ROUNDS.length * QUESTIONS_PER_ROUND) {
    errors.push(`rigor-meta.json: items는 정확히 60개여야 합니다 (${actualKeys.length}개).`);
  }

  const normalized = new Map();
  for (const key of expectedKeys) {
    if (!actualSet.has(key)) continue;
    const item = normalizeMeta(payload.items[key], key, errors);
    if (item) normalized.set(key, item);
  }
  return normalized;
}

function passingCombinationMinimumD3(questions, metadata) {
  const maxScore = questions.reduce((sum, question) => sum + question.pointTenths, 0);
  const dp = Array(maxScore + 1).fill(null);
  dp[0] = { d3Count: 0, picks: [] };

  for (const question of questions) {
    const meta = metadata.get(question.key);
    if (!meta || meta.difficulty === null) continue;
    const d3Increment = meta.difficulty >= 3 ? 1 : 0;
    for (let score = maxScore - question.pointTenths; score >= 0; score -= 1) {
      const prior = dp[score];
      if (!prior) continue;
      const nextScore = score + question.pointTenths;
      const candidate = {
        d3Count: prior.d3Count + d3Increment,
        picks: [...prior.picks, question.number],
      };
      const current = dp[nextScore];
      if (!current
        || candidate.d3Count < current.d3Count
        || (candidate.d3Count === current.d3Count && candidate.picks.length < current.picks.length)) {
        dp[nextScore] = candidate;
      }
    }
  }

  let best = null;
  for (let score = PASS_SCORE_TENTHS; score <= maxScore; score += 1) {
    const state = dp[score];
    if (!state) continue;
    if (!best
      || state.d3Count < best.d3Count
      || (state.d3Count === best.d3Count && score < best.score)) {
      best = { score, d3Count: state.d3Count, picks: state.picks };
    }
  }
  return best;
}

function validateRound(round, questions, metadata, errors) {
  const complete = questions.every((question) => metadata.has(question.key));
  if (!complete) return;

  const rows = questions.map((question) => ({
    ...question,
    meta: metadata.get(question.key),
  }));
  if (rows.some((row) => row.meta.difficulty === null)) return;

  const lowScore = rows
    .filter((row) => row.meta.difficulty <= 2)
    .reduce((sum, row) => sum + row.pointTenths, 0);
  if (lowScore > MAX_LOW_SCORE_TENTHS) {
    const numbers = rows.filter((row) => row.meta.difficulty <= 2).map((row) => row.number);
    errors.push(`${round}회: D1+D2 합계가 ${(lowScore / 10).toFixed(1)}점으로 10.8점을 넘습니다 (문항 ${numbers.join(', ')}).`);
  }

  const simpleScore = rows
    .filter((row) => row.meta.simple)
    .reduce((sum, row) => sum + row.pointTenths, 0);
  if (simpleScore > MAX_SIMPLE_SCORE_TENTHS) {
    const numbers = rows.filter((row) => row.meta.simple).map((row) => row.number);
    errors.push(`${round}회: 단순 문항 합계가 ${(simpleScore / 10).toFixed(1)}점으로 10.8점을 넘습니다 (문항 ${numbers.join(', ')}).`);
  }

  const middleTooLow = rows.filter((row) => row.number >= 13 && row.number <= 22 && row.meta.difficulty < 3);
  if (middleTooLow.length) {
    errors.push(`${round}회: 13~22번은 D3 이상이어야 합니다 (${middleTooLow.map((row) => row.number).join(', ')}번).`);
  }

  const highTooLow = rows.filter((row) => row.number >= 23 && row.number <= 30 && row.meta.difficulty < 4);
  if (highTooLow.length) {
    errors.push(`${round}회: 23~30번은 D4 이상이어야 합니다 (${highTooLow.map((row) => row.number).join(', ')}번).`);
  }

  const firstBandD3 = rows.filter((row) => row.number <= 12 && row.meta.difficulty >= 3);
  if (firstBandD3.length < 4) {
    errors.push(`${round}회: 1~12번 중 D3 이상이 ${firstBandD3.length}문항으로, 최소 4문항에 못 미칩니다.`);
  }

  const bestPass = passingCombinationMinimumD3(questions, metadata);
  if (!bestPass) {
    errors.push(`${round}회: 21.0점 이상을 만드는 배점 조합을 찾지 못했습니다.`);
  } else if (bestPass.d3Count < MIN_PASS_D3_COUNT) {
    errors.push(`${round}회: ${bestPass.picks.join(', ')}번으로 ${(bestPass.score / 10).toFixed(1)}점에 도달하면서 D3 이상을 ${bestPass.d3Count}문항만 풀 수 있습니다 (최소 3문항 필요).`);
  }

  if (round === 2) {
    for (const row of rows) {
      if (!row.meta.hasDirectSource && !row.meta.variantOf) {
        errors.push(`${row.key}: 2회 문항은 sourceLocator 또는 similarity.variantOf가 필요합니다.`);
      }
    }
  }
}

function validate() {
  const errors = [];
  const questionsByRound = loadQuestions(errors);
  const expectedKeys = EXPECTED_ROUNDS.flatMap((round) => (
    Array.from({ length: QUESTIONS_PER_ROUND }, (_, index) => questionKey(round, index + 1))
  ));
  const metadata = loadMetadata(errors, expectedKeys);

  for (const round of EXPECTED_ROUNDS) {
    validateRound(round, questionsByRound.get(round) || [], metadata, errors);
  }
  return errors;
}

function main() {
  try {
    const errors = validate();
    if (errors.length) {
      console.error(`원본형 난이도 잠금 QA 실패 (${errors.length}건)`);
      for (const error of errors) console.error(`- ${error}`);
      process.exitCode = 1;
      return;
    }
    console.log('원본형 난이도 잠금 QA 통과: 60문항·2회 난이도·합격조합·출처·변형·검산 기준 충족');
  } catch (error) {
    console.error(`원본형 난이도 잠금 QA 실패`);
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  dependencyFlag,
  difficultyNumber,
  passingCombinationMinimumD3,
  questionKey,
  uniqueStrings,
  validate,
};
