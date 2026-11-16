(function (root, factory) {
  "use strict";
  const api = factory(root || {});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const base = root.HSE_SOURCE_42_PARALLEL_ANGLE;
  if (!base?.GEOMETRY) throw new Error("평행선 좌표 렌더러를 먼저 불러와야 합니다.");
  const { point, pointAt } = base;
  const { encoded, svgSegment, svgText, angleMark, wrapSvg } = base.GEOMETRY;
  const GENERATOR_KEY = "sourceGrade4AdvancedParallelAngleChainTwoMission3";
  const SOURCE_IDS = Object.freeze(["4-2-u4-e4-mission-3"]);
  const SOURCE_ID_SET = new Set(SOURCE_IDS);
  const POOLS = Object.freeze([
    Object.freeze({ upper: 20, lower: 30, steep: 45 }),
    Object.freeze({ upper: 24, lower: 32, steep: 45 }),
    Object.freeze({ upper: 18, lower: 35, steep: 45 })
  ]);

  const near = (position, dx, dy) => point(position.x + dx, position.y + dy);

  const deriveCase = data => {
    const targets = [data.steep - data.upper, 90 - data.steep, 90 - data.lower];
    const target = 180 - data.upper - data.lower;
    if (!targets.every(value => Number.isFinite(value) && value > 0 && value < 180)) {
      throw new Error("세 표시각이 모두 양의 작은 각이 되도록 변형값을 정해야 합니다.");
    }
    if (targets.reduce((sum, value) => sum + value, 0) !== target) {
      throw new Error("꺾은선의 세 표시각 합이 평행선의 독립 답과 일치하지 않습니다.");
    }
    return { ...data, targets, target, answer: `${target}°` };
  };

  function draw(data, sourceItemId, poolIndex, solved) {
    const facts = deriveCase(data);
    const points = {};
    const segments = [];
    const angles = [];
    const relations = [];
    let content = "";
    const set = (id, position) => { points[id] = position; return position; };
    const seg = (id, start, end) => {
      segments.push({ id, start, end });
      content += svgSegment(id, start, end);
    };
    const mark = (role, vertex, rayA, rayB, value, label, labelPosition) => {
      angles.push({ role, vertex, rayA, rayB, value, label });
      content += angleMark({
        role,
        vertex,
        rayA,
        rayB,
        value,
        label,
        solved,
        radius: role === "upper-given" ? 64 : 28,
        labelRadius: 62,
        labelPosition
      });
    };

    const upperY = 60;
    const lowerY = 380;
    const top = set("top", point(372, upperY));
    const bend = set("bend", pointAt(top, 180 - data.steep, 225));
    const shallowEnd = set("shallowEnd", pointAt(top, 180 - data.upper, 180));
    const steepExtension = set("steepExtension", pointAt(bend, 180 - data.steep, 58));
    const lowerBend = set("lowerBend", pointAt(bend, 90, 80));
    const verticalEnd = set("verticalEnd", pointAt(lowerBend, 90, 30));
    const diagonalLength = (lowerY - lowerBend.y) / Math.sin(data.lower * Math.PI / 180);
    const lowerCross = set("lowerCross", pointAt(lowerBend, data.lower, diagonalLength));
    const diagonalEnd = set("diagonalEnd", pointAt(lowerCross, data.lower, 82));
    const upperLeft = set("upperLeft", pointAt(top, 180, 90));
    const lowerRight = set("lowerRight", pointAt(lowerCross, 0, 90));

    seg("upper", point(55, upperY), point(505, upperY));
    seg("lower", point(55, lowerY), point(505, lowerY));
    seg("shallow", top, shallowEnd);
    seg("steep-chain", top, steepExtension);
    seg("vertical", bend, verticalEnd);
    seg("lower-diagonal", lowerBend, diagonalEnd);
    relations.push({ kind: "parallel", segments: ["upper", "lower"] });

    content += svgText(near(point(55, upperY), -22, 0), "가");
    content += svgText(near(point(55, lowerY), -22, 0), "나");

    // Each marked sector uses the two visible rays that bound it.
    mark("upper-given", top, upperLeft, shallowEnd, data.upper, `${data.upper}°`);
    mark("target-a", top, shallowEnd, bend, facts.targets[0], "㉠");
    mark("target-b", bend, steepExtension, lowerBend, facts.targets[1], "㉡");
    mark("target-c", lowerBend, verticalEnd, lowerCross, facts.targets[2], "㉢");
    mark("lower-given", lowerCross, lowerRight, diagonalEnd, data.lower, `${data.lower}°`);

    const model = {
      sourceItemId,
      poolIndex,
      data,
      points,
      segments,
      angles,
      relations,
      answer: facts.answer,
      uniqueAnswerCount: 1
    };
    return wrapSvg("평행선과 꺾은선의 각", sourceItemId, poolIndex, solved, content, model, 560, 480)
      .replace('class="geometry-diagram source42-pa"', 'class="geometry-diagram source42-pa source42-pac2m3"');
  }

  const promptFor = () => "다음 그림에서 직선 가와 나는 평행할 때, ㉠, ㉡, ㉢의 합을 구하여라.";
  const solutionFor = facts => `㉠=${facts.steep}°-${facts.upper}°=${facts.targets[0]}°, ㉡=90°-${facts.steep}°=${facts.targets[1]}°, ㉢=90°-${facts.lower}°=${facts.targets[2]}°입니다. 따라서 합은 ${facts.targets[0]}°+${facts.targets[1]}°+${facts.targets[2]}°=${facts.target}°입니다.`;

  const buildGenerated = (sourceItemId, poolIndex = 0) => {
    if (!SOURCE_ID_SET.has(sourceItemId)) throw new Error(`등록되지 않은 원문: ${sourceItemId}`);
    if (!Number.isInteger(poolIndex) || poolIndex < 0 || poolIndex >= POOLS.length) throw new Error("검증된 3개 변형만 사용할 수 있습니다.");
    const data = POOLS[poolIndex];
    const facts = deriveCase(data);
    const evidenceModel = { sourceItemId, poolIndex, data, targets: facts.targets, independentAnswer: facts.target, uniqueAnswerCount: 1 };
    const evidence = `<span hidden data-source-item="${sourceItemId}" data-pool-index="${poolIndex}" data-answer-contract="single" data-unique-answer-count="1" data-geometry-model="${encoded(evidenceModel)}"></span>`;
    return {
      prompt: `${promptFor()}${draw(data, sourceItemId, poolIndex, false)}${evidence}`,
      answer: facts.answer,
      solution: solutionFor(facts),
      answerVisual: `<div class="verified-answer-diagram source42-parallel-angle-answer" data-answer-source="${sourceItemId}" data-verified-pool-index="${poolIndex}">${draw(data, sourceItemId, poolIndex, true)}</div>`,
      generationMode: "fixed-verified-pool",
      verifiedPoolIndex: poolIndex,
      verifiedVariantCount: POOLS.length,
      sourceItemId,
      generator: GENERATOR_KEY,
      variantProvenance: poolIndex === 0 ? "source-values" : "source-structure-variant",
      answerCandidateCount: 1,
      answerVisualRequired: true,
      answerVisualStatus: "verified",
      difficultyDesign: "source-structure",
      difficulty: "심화 기준"
    };
  };

  const allTypes = curriculum => (curriculum?.semesters || [])
    .flatMap(semester => semester.units || [])
    .flatMap(unit => unit.subunits || [])
    .flatMap(subunit => subunit.types || []);
  const markReady = targetRoot => {
    const matches = allTypes(targetRoot?.HSE_CURRICULUM).filter(type => SOURCE_ID_SET.has(type.sourceItemId));
    matches.forEach(type => Object.assign(type, {
      generatorKey: GENERATOR_KEY,
      reviewLocked: false,
      reviewReason: "",
      generationMode: "fixed-verified-pool",
      verifiedVariantTarget: POOLS.length,
      verifiedVariantCount: POOLS.length,
      verifiedVariantProvenance: ["source-values", "source-structure-variant", "source-structure-variant"],
      answerVisualRequired: true,
      answerVisualStatus: "verified",
      status: "verified"
    }));
    return matches;
  };
  const install = targetRoot => {
    const generatorApi = targetRoot?.HSE_GENERATORS;
    if (!generatorApi?.generate || !generatorApi?.generatorKey) return false;
    if (generatorApi.__sourceGrade4AdvancedParallelAngleChainTwoMission3Installed) {
      markReady(targetRoot);
      return true;
    }
    const previousKey = generatorApi.generatorKey.bind(generatorApi);
    const previousGenerate = generatorApi.generate.bind(generatorApi);
    generatorApi.generatorKey = type => SOURCE_ID_SET.has(type?.sourceItemId) ? GENERATOR_KEY : previousKey(type);
    generatorApi.generate = (type, levelRank, difficultyOffset, seed, variant = 0) => {
      if (!SOURCE_ID_SET.has(type?.sourceItemId)) return previousGenerate(type, levelRank, difficultyOffset, seed, variant);
      return buildGenerated(type.sourceItemId, ((variant % POOLS.length) + POOLS.length) % POOLS.length);
    };
    Object.defineProperty(generatorApi, "__sourceGrade4AdvancedParallelAngleChainTwoMission3Installed", { value: true });
    markReady(targetRoot);
    return true;
  };

  const api = Object.freeze({ GENERATOR_KEY, SOURCE_IDS, POOLS, buildGenerated, markReady, install });
  root.HSE_SOURCE_42_PARALLEL_ANGLE_CHAIN_TWO_MISSION3 = api;
  install(root);
  return api;
});
