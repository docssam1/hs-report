(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const base = root.HSE_SOURCE_42_PARALLEL_ANGLE;
  if (!base?.GEOMETRY) throw new Error("평행선 좌표 렌더러를 먼저 불러와야 합니다.");
  const { point, pointAt, angleOf, line, normalize } = base;
  const { esc, encoded, requireIntersection, svgSegment, svgText, angleMark, rightMark, wrapSvg } = base.GEOMETRY;
  const GENERATOR_KEY = "sourceGrade4AdvancedParallelAngleChainOne";
  const POOLS = Object.freeze({
    exploration: [{ apex: 70, bottom: 38 }, { apex: 64, bottom: 34 }, { apex: 76, bottom: 42 }],
    "example-3-1": [{ top: 15, bend: 50, bottom: 45, middle: 30 }, { top: 18, bend: 58, bottom: 32, middle: 34 }, { top: 22, bend: 64, bottom: 35, middle: 28 }],
    "example-3-2": [{ exterior: 162, bottom: 37, middle: 105 }, { exterior: 156, bottom: 42, middle: 110 }, { exterior: 168, bottom: 34, middle: 100 }],
    "example-3-3": [{ top: 20, bend: 60, aux: 120 }, { top: 24, bend: 68, aux: 116 }, { top: 18, bend: 64, aux: 124 }],
    "example-3-4": [{ given: 70 }, { given: 64 }, { given: 68 }],
    "mission-1": [{ top: 40, internal: 100, bottom: 30 }, { top: 35, internal: 105, bottom: 28 }, { top: 46, internal: 112, bottom: 34 }],
    "mission-2": [{ top: 22, bend: 32 }, { top: 18, bend: 35 }, { top: 26, bend: 28 }],
    "mission-3": [{ top: 42, bottomLeft: 32, bottomRight: 35 }, { top: 38, bottomLeft: 28, bottomRight: 40 }, { top: 47, bottomLeft: 36, bottomRight: 31 }],
    "mission-4": [{ top: 36, bottom: 54, ratio: 4 }, { top: 41, bottom: 59, ratio: 4 }, { top: 34, bottom: 51, ratio: 4 }],
    "mission-5": [{ given: 60 }, { given: 55 }, { given: 65 }],
    "mission-6": [{ upper: 95, exterior: 80 }, { upper: 100, exterior: 75 }, { upper: 88, exterior: 82 }]
  });
  const SOURCE_IDS = Object.freeze(Object.keys(POOLS).map(kind => `4-2-u4-e3-${kind}`));
  const SOURCE_ID_SET = new Set(SOURCE_IDS);
  const kindOf = id => id.replace("4-2-u4-e3-", "");
  const deriveCase = (kind, data) => {
    let target;
    let targets;
    switch (kind) {
      case "exploration": target = data.apex + 90 - data.bottom; break;
      case "example-3-1": targets = [data.bend - data.top + data.middle, data.bottom + data.middle]; target = Math.abs(targets[0] - targets[1]); break;
      case "example-3-2": targets = [360 - data.exterior - data.middle, data.middle + data.bottom]; target = targets[0] + targets[1]; break;
      case "example-3-3": target = data.aux - data.bend - data.top; break;
      case "example-3-4": target = data.given - 45; break;
      case "mission-1": target = data.internal - data.bottom - data.top; break;
      case "mission-2": target = 90 - data.top - data.bend; break;
      case "mission-3": targets = [data.top + data.bottomRight, data.bottomLeft + data.bottomRight]; target = targets[0] + targets[1]; break;
      case "mission-4": target = (data.top + data.bottom) / (data.ratio + 1); break;
      case "mission-5": target = 2 * data.given; break;
      case "mission-6": target = data.upper + 90 - data.exterior; break;
      default: throw new Error(`알 수 없는 평행선 원문: ${kind}`);
    }
    return { ...data, target, targets, answer: `${target}°` };
  };

  const atY = (origin, direction, y) => requireIntersection(line("ray", origin, direction), line("horizontal", point(0, y), 0), "가로선");
  const cross = (a, da, b, db) => requireIntersection(line("first", a, da), line("second", b, db), "선분");
  const near = (p, dx, dy) => point(p.x + dx, p.y + dy);

  function draw(kind, data, sourceItemId, poolIndex, solved) {
    const facts = deriveCase(kind, data);
    const points = {};
    const segments = [];
    const angles = [];
    const relations = [];
    let content = "";
    let width = 560;
    let height = 390;
    const set = (id, p) => { points[id] = p; return p; };
    const seg = (id, a, b) => { segments.push({ id, a, b }); content += svgSegment(id, a, b); };
    const name = (p, label, dx = 0, dy = 0) => { content += svgText(near(p, dx, dy), label); };
    const horizontals = (upper, lower, labels = ["가", "나"]) => {
      seg("upper", point(55, upper), point(505, upper));
      seg("lower", point(55, lower), point(505, lower));
      name(point(31, upper), labels[0]); name(point(31, lower), labels[1]);
      relations.push({ kind: "parallel", segments: ["upper", "lower"] });
    };
    const mark = (role, vertex, rayA, rayB, value, target = false, extra = {}) => {
      angles.push({ role, vertex, rayA, rayB, value, target });
      const radius = Math.max(28, Math.ceil(26 / (value * Math.PI / 180)));
      content += angleMark({ role, vertex, rayA, rayB, value, label: target ? (role === "target-b" ? "㉡" : "㉠") : `${value}°`, solved, radius, labelRadius: Math.max(64, radius + 36), ...extra });
    };
    const right = (vertex, direction, owners) => { content += rightMark(vertex, direction, 13); relations.push({ kind: "perpendicular", owners, vertex, direction }); };

    if (kind === "exploration") {
      const O = set("O", point(270, 318));
      const S = set("S", pointAt(O, 180 + data.bottom, 140));
      const A = set("A", pointAt(S, data.bottom - 90, 235));
      const upperY = 130;
      const B = set("B", atY(S, data.bottom - 90, upperY));
      const C = set("C", atY(A, data.bottom + 90 - data.apex, upperY));
      horizontals(upperY, O.y, ["ㄱ", "ㄷ"]);
      name(point(526, upperY), "ㄴ"); name(point(526, O.y), "ㄹ");
      seg("AS", A, S); seg("AC", A, C); seg("SO", S, O);
      mark("apex", A, S, C, data.apex);
      mark("bottom", O, pointAt(O, 180, 100), S, data.bottom);
      mark("target", C, pointAt(C, 0, 100), A, facts.target, true);
      right(S, angleOf(S, A), ["AS", "SO"]);
      name(A, "ㅁ", 0, -19); name(B, "ㅂ", -20, -18); name(C, "ㅈ", 0, 21); name(S, "ㅅ", -22, 0); name(O, "ㅇ", 0, 23);
    } else if (kind === "example-3-1") {
      const A = set("A", point(105, 45));
      const B = set("B", pointAt(A, data.top, 275));
      const C = set("C", pointAt(B, 180 - (data.bend - data.top), 165));
      const D = set("D", pointAt(C, data.middle, 135));
      const E = set("E", pointAt(D, 180 - data.bottom, 105));
      height = Math.max(390, E.y + 45);
      horizontals(A.y, E.y);
      seg("AB", A, B); seg("BC", B, C); seg("CD", C, D); seg("DE", D, E);
      mark("top", A, pointAt(A, 0, 100), B, data.top);
      mark("bend", B, A, C, data.bend);
      mark("target-a", C, B, D, facts.targets[0], true);
      mark("target-b", D, C, E, facts.targets[1], true);
      mark("bottom", E, D, pointAt(E, 0, 100), data.bottom);
    } else if (kind === "example-3-2") {
      const acute = 180 - data.exterior;
      const A = set("A", point(150, 90));
      const B = set("B", pointAt(A, acute, 250));
      const C = set("C", pointAt(B, data.middle, 125));
      const D = set("D", pointAt(C, 180 - data.bottom, 90));
      height = Math.max(390, D.y + 60);
      horizontals(A.y, D.y);
      seg("AB", pointAt(A, acute + 180, 65), B); seg("BC", B, C); seg("CD", C, pointAt(D, 180 - data.bottom, 38));
      mark("exterior", A, pointAt(A, 0, 100), pointAt(A, acute + 180, 100), data.exterior);
      mark("target-a", B, A, C, facts.targets[0], true);
      mark("target-b", C, B, D, facts.targets[1], true);
      mark("bottom", D, C, pointAt(D, 0, 100), data.bottom);
    } else if (kind === "example-3-3") {
      const A = set("A", point(105, 150));
      const T = set("T", pointAt(A, -data.top, 160));
      const B = set("B", cross(T, 180 - data.top - data.bend, A, facts.target));
      const P = set("P", atY(A, -data.top, 65));
      const Q = set("Q", atY(A, facts.target, B.y + 55));
      height = Q.y + 80;
      horizontals(P.y, Q.y);
      seg("AP", A, pointAt(P, -data.top, 80)); seg("AQ", A, pointAt(Q, facts.target, 60)); seg("TB", T, B);
      mark("top", P, pointAt(P, 0, 100), pointAt(P, -data.top, 100), data.top);
      mark("bend", T, A, B, data.bend);
      mark("aux", B, T, Q, data.aux);
      mark("target", Q, pointAt(Q, 0, 100), pointAt(Q, facts.target, 100), facts.target, true);
    } else if (kind === "example-3-4") {
      const D = set("D", point(250, 300));
      const N = set("N", pointAt(D, 180 + data.given, 125));
      const G = set("G", pointAt(N, data.given - 90, 125));
      const R = set("R", pointAt(G, data.given, 125));
      const P = set("P", atY(N, facts.target, G.y));
      const Q = set("Q", atY(N, facts.target, D.y));
      seg("upper", point(30, G.y), point(545, G.y));
      seg("lower", point(30, D.y), point(545, D.y));
      name(point(10, G.y), "가"); name(point(10, D.y), "나");
      relations.push({ kind: "parallel", segments: ["upper", "lower"] });
      seg("GN", G, N); seg("ND", N, D); seg("DR", D, R); seg("RG", R, G); seg("PQ", P, Q);
      relations.push({ kind: "square", vertices: [G, N, D, R] });
      mark("given", D, pointAt(D, 180, 100), N, data.given);
      mark("target", P, pointAt(P, 0, 100), Q, facts.target, true);
      name(G, "ㄱ", 0, -22); name(N, "ㄴ", -25, 19); name(D, "ㄷ", 0, 24); name(R, "ㄹ", 27, -18);
    } else if (kind === "mission-1") {
      const A = set("A", point(155, 65));
      const P = set("P", pointAt(A, data.top, 100));
      const K = set("K", pointAt(P, data.top, 155));
      const Q = set("Q", cross(P, data.internal - data.bottom, K, 180 - data.bottom));
      const D = set("D", pointAt(Q, 180 - data.bottom, 95));
      height = Math.max(390, D.y + 55);
      horizontals(A.y, D.y);
      seg("AK", pointAt(A, data.top + 180, 48), K); seg("KD", K, pointAt(D, 180 - data.bottom, 45)); seg("PQ", P, Q);
      mark("top", A, pointAt(A, 180, 100), pointAt(A, data.top + 180, 100), data.top);
      mark("internal", Q, P, D, data.internal);
      mark("bottom", D, pointAt(D, 180, 100), pointAt(D, 180 - data.bottom, 100), data.bottom);
      mark("target", P, K, Q, facts.target, true);
    } else if (kind === "mission-2") {
      const T = set("T", point(370, 60));
      const P = set("P", pointAt(T, 180 - data.top, 140));
      const M = set("M", pointAt(P, 180 - data.top - data.bend, 135));
      const B = set("B", pointAt(M, facts.target, 200));
      height = Math.max(390, B.y + 55);
      horizontals(T.y, B.y);
      seg("TP", T, pointAt(P, 180 - data.top, 70)); seg("PM", P, M); seg("MB", M, B);
      mark("top", T, pointAt(T, 180, 100), P, data.top);
      mark("bend", P, pointAt(P, 180 - data.top, 100), M, data.bend);
      right(M, angleOf(M, P), ["PM", "MB"]);
      mark("target", B, pointAt(B, 180, 100), M, facts.target, true);
    } else if (kind === "mission-3") {
      const A = set("A", point(300, 60));
      const P = set("P", pointAt(A, 180 - data.top, 150));
      const B = set("B", atY(P, data.bottomRight, 320));
      const C = set("C", point(135, 320));
      const Q = set("Q", cross(P, data.bottomRight, C, -data.bottomLeft));
      horizontals(A.y, B.y);
      seg("AP", A, P); seg("PB", P, B); seg("CQ", C, Q);
      mark("top", A, pointAt(A, 180, 100), P, data.top);
      mark("bottom-left", C, Q, pointAt(C, 0, 100), data.bottomLeft);
      mark("bottom-right", B, pointAt(B, 180, 100), P, data.bottomRight);
      mark("target-a", P, A, Q, facts.targets[0], true);
      mark("target-b", Q, P, C, facts.targets[1], true);
    } else if (kind === "mission-4") {
      const G = set("G", point(165, 60));
      const N = set("N", pointAt(G, data.top, 195));
      const R = set("R", atY(N, 180 - data.bottom, 325));
      const D = set("D", atY(N, 180 - data.bottom + facts.target, 325));
      horizontals(G.y, R.y);
      seg("GN", G, N); seg("ND", N, D); seg("NR", N, R);
      mark("top", G, pointAt(G, 0, 100), N, data.top);
      mark("bottom", R, N, pointAt(R, 0, 100), data.bottom);
      mark("target", N, D, R, facts.target, true);
      name(G, "ㄱ", 0, -23); name(N, "ㄴ", 23, 0); name(D, "ㄷ", 0, 24); name(R, "ㄹ", 0, 24);
    } else if (kind === "mission-5") {
      const G = set("G", point(170, 70));
      const B = set("B", point(350, 70));
      const M = set("M", pointAt(B, data.given, 130));
      const R = set("R", pointAt(M, 180 - data.given, 130));
      const D = set("D", point(R.x - 180, R.y));
      const N = set("N", pointAt(G, 180 - data.given, 130));
      seg("GB", point(65, G.y), point(505, G.y)); seg("DR", point(65, D.y), point(505, D.y));
      seg("GN", G, N); seg("ND", N, D); seg("BM", B, M); seg("MR", M, R);
      relations.push({ kind: "parallel", segments: ["GB", "DR"] }, { kind: "parallel", segments: ["GN", "MR"] }, { kind: "parallel", segments: ["ND", "BM"] });
      mark("top", B, pointAt(B, 0, 100), M, data.given);
      mark("bottom", R, M, pointAt(R, 0, 100), data.given);
      mark("target", N, G, D, facts.target, true);
      name(G, "ㄱ", 0, -22); name(B, "ㅂ", 0, -22); name(M, "ㅁ", 24, 0); name(R, "ㄹ", 0, 25); name(D, "ㄷ", 0, 25); name(N, "ㄴ", -24, 0);
    } else if (kind === "mission-6") {
      const L = set("L", point(360, 295));
      const M = set("M", pointAt(L, -data.exterior, 200));
      const G = set("G", pointAt(M, 270 - data.exterior, 200));
      const N = set("N", atY(G, 90 - data.exterior + data.upper, 205));
      const D = set("D", point(260, 350));
      const B = set("B", point(65, N.y));
      const S = set("S", point(490, L.y));
      seg("GN", G, N); seg("ND", N, D); seg("DL", D, L); seg("LM", L, M); seg("MG", M, G); seg("BN", B, N); seg("LS", L, S);
      relations.push({ kind: "parallel", segments: ["BN", "LS"] });
      right(M, angleOf(M, L), ["LM", "MG"]);
      mark("upper", G, M, N, data.upper);
      mark("exterior", L, M, S, data.exterior);
      mark("target", N, B, G, facts.target, true);
      name(G, "ㄱ", -3, -22); name(N, "ㄴ", -13, 23); name(D, "ㄷ", 0, 24); name(L, "ㄹ", 5, 23); name(M, "ㅁ", 23, -6); name(B, "ㅂ", -20, 0); name(S, "ㅅ", 20, 0);
    }

    const model = { sourceItemId, poolIndex, kind, data, points, segments, angles, relations, answer: facts.answer, uniqueAnswerCount: 1 };
    return wrapSvg("평행선 사이의 각도", sourceItemId, poolIndex, solved, content, model, width, height)
      .replace('class="geometry-diagram source42-pa"', 'class="geometry-diagram source42-pa source42-pac1"');
  }

  const promptFor = (kind, data) => {
    if (kind === "exploration") return "직선 ㄱㄴ과 ㄷㄹ은 서로 평행합니다. ㉠의 크기를 구하세요.";
    if (kind === "example-3-4") return "직선 가와 나는 서로 평행하고, 사각형 ㄱㄴㄷㄹ은 정사각형입니다. ㉠의 크기를 구하세요.";
    if (kind === "mission-4") return `직선 가와 나는 서로 평행합니다. 각 ㄱㄴㄷ의 크기가 각 ㄷㄴㄹ의 크기의 ${data.ratio}배일 때, ㉠의 크기를 구하세요.`;
    if (kind === "mission-5") return "선분 ㄱㅂ과 ㄷㄹ, 선분 ㄱㄴ과 ㅁㄹ, 선분 ㄴㄷ과 ㅂㅁ은 각각 서로 평행합니다. ㉠의 크기를 구하세요.";
    if (kind === "mission-6") return "선분 ㅂㄴ과 ㄹㅅ은 서로 평행합니다. ㉠의 크기를 구하세요.";
    return `직선 가와 나는 서로 평행합니다. ${kind === "example-3-1" ? "㉠과 ㉡의 크기의 차를" : ["example-3-2", "mission-3"].includes(kind) ? "㉠과 ㉡의 크기의 합을" : "㉠의 크기를"} 구하세요.`;
  };
  const solutionFor = (kind, d, f) => {
    switch (kind) {
      case "exploration": return `직각과 ${d.bottom}°를 이용하면 위쪽 삼각형의 왼쪽 각은 ${90 - d.bottom}°입니다. 삼각형의 나머지 각과 한 평각을 이루므로 ㉠은 ${d.apex}°+${90 - d.bottom}°=${f.target}°입니다.`;
      case "example-3-1": return `꺾인 점마다 직선 가와 평행한 선을 그어 봅니다. ㉠과 ㉡에는 같은 크기의 각이 하나씩 포함됩니다. 나머지 부분은 각각 ${d.bend}°-${d.top}°=${d.bend - d.top}°, ${d.bottom}°이므로 차는 ${f.target}°입니다.`;
      case "example-3-2": return `위쪽 직선과 빗선이 이루는 작은 각은 180°-${d.exterior}°=${180 - d.exterior}°입니다. 꺾인 점을 지나 평행선을 그으면 ㉠+㉡=180°+${180 - d.exterior}°+${d.bottom}°=${f.target}°입니다.`;
      case "example-3-3": return `삼각형의 아래쪽 안쪽 각은 180°-${d.aux}°=${180 - d.aux}°입니다. 왼쪽 각은 180°-${d.bend}°-${180 - d.aux}°=${d.aux - d.bend}°이므로 ㉠=${d.aux - d.bend}°-${d.top}°=${f.target}°입니다.`;
      case "example-3-4": return `정사각형의 대각선은 꼭짓점의 직각을 똑같이 나누므로 각각 45°입니다. 평행한 직선에서 같은 크기의 각을 이용하면 ㉠=${d.given}°-45°=${f.target}°입니다.`;
      case "mission-1": return `꺾인 점을 지나 두 직선과 평행한 선을 그어 각을 나누면 ${d.top}°+㉠+${d.bottom}°=${d.internal}°입니다. 따라서 ㉠=${d.internal}°-${d.top}°-${d.bottom}°=${f.target}°입니다.`;
      case "mission-2": return `꺾인 점을 지나는 평행선을 그으면 직각 안에 ${d.top}°, ${d.bend}°, ㉠이 들어갑니다. ㉠=90°-${d.top}°-${d.bend}°=${f.target}°입니다.`;
      case "mission-3": return `평행선을 이용하면 ㉠=${d.top}°+${d.bottomRight}°=${f.targets[0]}°, ㉡=${d.bottomLeft}°+${d.bottomRight}°=${f.targets[1]}°입니다. 두 각의 합은 ${f.targets[0]}°+${f.targets[1]}°=${f.target}°입니다.`;
      case "mission-4": return `각 ㄱㄴㄹ은 ${d.top}°+${d.bottom}°=${d.top + d.bottom}°입니다. 큰 각이 작은 각의 ${d.ratio}배이므로 ㉠=(${d.top + d.bottom}°)÷${d.ratio + 1}=${f.target}°입니다.`;
      case "mission-5": return `점 ㄴ을 지나 선분 ㄱㅂ과 평행한 선을 그으면, 세 쌍의 평행한 선분에 의해 ㉠이 ${d.given}°인 두 각으로 나뉩니다. 따라서 ㉠=${d.given}°+${d.given}°=${f.target}°입니다.`;
      case "mission-6": return `점 ㄱ을 지나 선분 ㄹㅅ과 평행한 선을 그으면 선분 ㄱㅁ과 이루는 작은 각은 90°-${d.exterior}°=${90 - d.exterior}°입니다. 따라서 ㉠=${d.upper}°+${90 - d.exterior}°=${f.target}°입니다.`;
      default: throw new Error(kind);
    }
  };
  const difficultyEvidence = Object.freeze({ baseline: "source-advanced", sourceStructurePreserved: true, reasoningSteps: ["평행한 선에서 같은 크기의 각 찾기", "원문의 꺾은선·직각·도형 조건 연결하기", "목표각 또는 두 각의 합·차 구하기"], numericChangeOnly: true, difficultyAdjustmentEnabled: false, adjustment: "원문과 같은 풀이 구조의 고정 3문항이며 난이도 상승·하락을 주장하지 않습니다." });
  const buildGenerated = (sourceItemId, poolIndex = 0) => {
    if (!SOURCE_ID_SET.has(sourceItemId)) throw new Error(`등록되지 않은 원문: ${sourceItemId}`);
    if (!Number.isInteger(poolIndex) || poolIndex < 0 || poolIndex > 2) throw new Error("검증된 3개 변형만 사용할 수 있습니다.");
    const kind = kindOf(sourceItemId);
    const data = POOLS[kind][poolIndex];
    const facts = deriveCase(kind, data);
    const evidenceModel = { sourceItemId, kind, poolIndex, data, facts, answer: facts.answer, uniqueAnswerCount: 1, difficultyEvidence };
    const evidence = `<span hidden data-source-item="${sourceItemId}" data-pool-index="${poolIndex}" data-answer-contract="single" data-unique-answer-count="1" data-geometry-model="${encoded(evidenceModel)}"></span>`;
    return {
      prompt: `${promptFor(kind, data)}${draw(kind, data, sourceItemId, poolIndex, false)}${evidence}`,
      answer: facts.answer,
      solution: solutionFor(kind, data, facts),
      answerVisual: `<div class="verified-answer-diagram source42-parallel-angle-answer" data-answer-source="${sourceItemId}" data-verified-pool-index="${poolIndex}">${draw(kind, data, sourceItemId, poolIndex, true)}</div>`,
      generationMode: "fixed-verified-pool", verifiedPoolIndex: poolIndex, verifiedVariantCount: 3,
      sourceItemId, generator: GENERATOR_KEY, variantProvenance: poolIndex === 0 ? "source-values" : "source-structure-variant",
      answerCandidateCount: 1, answerVisualRequired: true, answerVisualStatus: "verified", difficultyDesign: "source-structure", difficultyEvidence,
      difficulty: "심화 기준",
      sourceAnswerConflict: kind === "mission-6" && poolIndex === 0 ? { handwritten: "125°", independentlyVerified: "105°", basis: "parallel-and-right-angle-direction-model" } : null
    };
  };
  const allTypes = curriculum => (curriculum?.semesters || []).flatMap(s => s.units || []).flatMap(u => u.subunits || []).flatMap(s => s.types || []);
  const markReady = targetRoot => {
    const matches = allTypes(targetRoot.HSE_CURRICULUM).filter(t => SOURCE_ID_SET.has(t.sourceItemId));
    matches.forEach(type => Object.assign(type, { generatorKey: GENERATOR_KEY, reviewLocked: false, reviewReason: "", generationMode: "fixed-verified-pool", verifiedVariantTarget: 3, verifiedVariantCount: 3, verifiedVariantProvenance: ["source-values", "source-structure-variant", "source-structure-variant"], answerVisualRequired: true, answerVisualStatus: "verified", status: "verified" }));
    return matches;
  };
  const install = targetRoot => {
    const api = targetRoot?.HSE_GENERATORS;
    if (!api?.generate || !api?.generatorKey) return false;
    if (api.__sourceGrade4AdvancedParallelAngleChainOneInstalled) { markReady(targetRoot); return true; }
    const previousKey = api.generatorKey.bind(api);
    const previousGenerate = api.generate.bind(api);
    api.generatorKey = type => SOURCE_ID_SET.has(type?.sourceItemId) ? GENERATOR_KEY : previousKey(type);
    api.generate = (type, levelRank, difficultyOffset, seed, variant = 0) => {
      if (!SOURCE_ID_SET.has(type?.sourceItemId)) return previousGenerate(type, levelRank, difficultyOffset, seed, variant);
      return buildGenerated(type.sourceItemId, ((variant % 3) + 3) % 3);
    };
    Object.defineProperty(api, "__sourceGrade4AdvancedParallelAngleChainOneInstalled", { value: true });
    markReady(targetRoot);
    return true;
  };
  const api = Object.freeze({ GENERATOR_KEY, SOURCE_IDS, POOLS, deriveCase, buildGenerated, markReady, install });
  root.HSE_SOURCE_42_PARALLEL_ANGLE_CHAIN_ONE = api;
  install(root);
  return api;
});
