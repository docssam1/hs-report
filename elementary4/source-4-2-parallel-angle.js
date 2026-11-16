(function (root, factory) {
  "use strict";

  const exported = factory(root || {});
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const GENERATOR_KEY = "sourceGrade4AdvancedParallelAngle";
  const SOURCE_IDS = Object.freeze([
    "4-2-u4-e2-exploration",
    "4-2-u4-e2-example-2-3",
    "4-2-u4-e2-example-2-4",
    "4-2-u4-e2-mission-1",
    "4-2-u4-e2-mission-2",
    "4-2-u4-e2-mission-3",
    "4-2-u4-e2-mission-4",
    "4-2-u4-e2-mission-5",
    "4-2-u4-e2-mission-6"
  ]);
  const SOURCE_ID_SET = new Set(SOURCE_IDS);
  const ABILITY_SOURCE_ID = "4-2-quad-2-example-2-1";

  const KINDS = Object.freeze({
    [SOURCE_IDS[0]]: "exploration",
    [SOURCE_IDS[1]]: "example-2-3",
    [SOURCE_IDS[2]]: "example-2-4",
    [SOURCE_IDS[3]]: "mission-1",
    [SOURCE_IDS[4]]: "mission-2",
    [SOURCE_IDS[5]]: "mission-3",
    [SOURCE_IDS[6]]: "mission-4",
    [SOURCE_IDS[7]]: "mission-5",
    [SOURCE_IDS[8]]: "mission-6"
  });

  const POOLS = Object.freeze({
    exploration: Object.freeze([
      { top: 0, bottom: 18, connector: 112, secondConnector: 90 },
      { top: -4, bottom: 16, connector: 108, secondConnector: 90 },
      { top: 3, bottom: 22, connector: 116, secondConnector: 90 }
    ]),
    "example-2-3": Object.freeze([
      { left: -40, bridge: -8, right: 55 },
      { left: -46, bridge: -12, right: 49 },
      { left: -35, bridge: -3, right: 61 }
    ]),
    "example-2-4": Object.freeze([
      { large: 135, small: 24, first: 40 },
      { large: 128, small: 18, first: 38 },
      { large: 142, small: 27, first: 45 }
    ]),
    "mission-1": Object.freeze([
      { first: 46, second: 32, base: 15 },
      { first: 41, second: 35, base: 12 },
      { first: 52, second: 28, base: 18 }
    ]),
    "mission-2": Object.freeze([
      { firstGiven: 65, secondGiven: 128 },
      { firstGiven: 58, secondGiven: 123 },
      { firstGiven: 72, secondGiven: 135 }
    ]),
    "mission-3": Object.freeze([
      { first: 120, second: 110, equal: 50 },
      { first: 115, second: 105, equal: 55 },
      { first: 125, second: 112, equal: 48 }
    ]),
    "mission-4": Object.freeze([
      { left: 55, middle: 65, row: 60, right: 55 },
      { left: 52, middle: 62, row: 64, right: 52 },
      { left: 58, middle: 68, row: 56, right: 58 }
    ]),
    "mission-5": Object.freeze([
      { outer: 72, gap: 22, unused: 40 },
      { outer: 68, gap: 19, unused: 37 },
      { outer: 76, gap: 25, unused: 42 }
    ]),
    "mission-6": Object.freeze([
      { given: 40 },
      { given: 35 },
      { given: 45 }
    ])
  });

  const esc = value => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
  const round = value => Math.round(value * 1000) / 1000;
  const normalize = angle => ((Number(angle) % 360) + 360) % 360;
  const normalizeLine = angle => normalize(angle) % 180;
  const clockwise = (from, to) => normalize(to - from);
  const point = (x, y) => ({ x: Number(x), y: Number(y) });
  const pointAt = (origin, angle, distance) => {
    const radians = normalize(angle) * Math.PI / 180;
    return point(origin.x + Math.cos(radians) * distance, origin.y + Math.sin(radians) * distance);
  };
  const angleOf = (origin, target) => normalize(Math.atan2(target.y - origin.y, target.x - origin.x) * 180 / Math.PI);
  const line = (name, origin, angle) => ({ name, origin: point(origin.x, origin.y), angle: normalize(angle) });
  const linePoint = (modelLine, distance) => pointAt(modelLine.origin, modelLine.angle, distance);
  const intersection = (first, second) => {
    const a = linePoint(first, 1);
    const b = linePoint(second, 1);
    const dax = a.x - first.origin.x;
    const day = a.y - first.origin.y;
    const dbx = b.x - second.origin.x;
    const dby = b.y - second.origin.y;
    const denominator = dax * dby - day * dbx;
    if (Math.abs(denominator) < 1e-9) return null;
    const dx = second.origin.x - first.origin.x;
    const dy = second.origin.y - first.origin.y;
    const t = (dx * dby - dy * dbx) / denominator;
    return point(first.origin.x + t * dax, first.origin.y + t * day);
  };
  const requireIntersection = (first, second, label) => {
    const result = intersection(first, second);
    if (!result || !Number.isFinite(result.x) || !Number.isFinite(result.y)) throw new Error(`${label} 교점을 계산하지 못했습니다.`);
    return result;
  };
  const fmt = value => round(value).toString();
  const attrs = values => Object.entries(values).map(([name, value]) => ` ${name}="${esc(value)}"`).join("");
  const encoded = value => encodeURIComponent(JSON.stringify(value));

  const svgStyle = `<style>
    .source42-pa{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;overflow:visible}
    .source42-pa .pa-line{fill:none;stroke:#222;stroke-width:1.25;stroke-linecap:round;vector-effect:non-scaling-stroke}
    .source42-pa .pa-line.is-answer{stroke:#222;stroke-width:1.25}
    .source42-pa .pa-guide{fill:none;stroke:#666;stroke-width:1;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
    .source42-pa .pa-point{fill:#222;stroke:none}
    .source42-pa .pa-arc{fill:none;stroke:#222;stroke-width:1;stroke-linecap:round;vector-effect:non-scaling-stroke}
    .geometry-diagram.source42-pa text{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;font-size:18px;font-weight:400;letter-spacing:0;fill:#111;stroke:none;text-shadow:none}
    .geometry-diagram.source42-pa .pa-name{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;font-size:17px;dominant-baseline:middle}
    .source42-pa .pa-value,.source42-pa .pa-target{text-anchor:middle;dominant-baseline:middle}
    .source42-pa .pa-answer-note{text-anchor:middle}
    .source42-pa .pa-parallel{fill:none;stroke:#222;stroke-width:1;stroke-linecap:round;vector-effect:non-scaling-stroke}
    .source42-pa .pa-right{fill:none;stroke:#222;stroke-width:1;vector-effect:non-scaling-stroke}
    .source42-pa .pa-leader{fill:none;stroke:#222;stroke-width:.8;vector-effect:non-scaling-stroke}
  </style>`;

  const svgLine = (modelLine, length = 560, extraClass = "") => {
    const start = linePoint(modelLine, -length / 2);
    const end = linePoint(modelLine, length / 2);
    return `<line class="pa-line${extraClass ? ` ${extraClass}` : ""}" data-line-name="${esc(modelLine.name)}" data-line-angle="${fmt(modelLine.angle)}" x1="${fmt(start.x)}" y1="${fmt(start.y)}" x2="${fmt(end.x)}" y2="${fmt(end.y)}"/>`;
  };
  const svgSegment = (name, start, end, extraClass = "") => `<line class="pa-line${extraClass ? ` ${extraClass}` : ""}" data-line-name="${esc(name)}" data-line-angle="${fmt(angleOf(start, end))}" x1="${fmt(start.x)}" y1="${fmt(start.y)}" x2="${fmt(end.x)}" y2="${fmt(end.y)}"/>`;
  const frameEnds = (modelLine, frame = { left: 55, right: 485, top: 35, bottom: 300 }) => {
    const direction = pointAt(point(0, 0), modelLine.angle, 1);
    let low = -Infinity;
    let high = Infinity;
    for (const [origin, delta, min, max] of [[modelLine.origin.x, direction.x, frame.left, frame.right], [modelLine.origin.y, direction.y, frame.top, frame.bottom]]) {
      if (Math.abs(delta) < 1e-9) {
        if (origin < min || origin > max) throw new Error(`${modelLine.name} 직선이 그림 영역 밖에 있습니다.`);
        continue;
      }
      const a = (min - origin) / delta;
      const b = (max - origin) / delta;
      low = Math.max(low, Math.min(a, b));
      high = Math.min(high, Math.max(a, b));
    }
    if (low >= high) throw new Error(`${modelLine.name} 직선의 표시 구간이 없습니다.`);
    return [linePoint(modelLine, low), linePoint(modelLine, high)];
  };
  const framedLine = (modelLine, label = "", labelEnd = 0, frame = { left: 55, right: 485, top: 35, bottom: 300 }) => {
    const ends = frameEnds(modelLine, frame);
    const end = ends[labelEnd];
    const namePoint = Math.abs(end.y - frame.top) < .01 ? point(end.x, end.y - 18)
      : Math.abs(end.y - frame.bottom) < .01 ? point(end.x, end.y + 18)
        : point(end.x + (Math.abs(end.x - frame.left) < .01 ? -23 : 23), end.y);
    return svgSegment(modelLine.name, ends[0], ends[1]) + (label ? svgText(namePoint, label) : "");
  };
  const svgPoint = position => `<circle class="pa-point" cx="${fmt(position.x)}" cy="${fmt(position.y)}" r="1.5"/>`;
  const svgText = (position, value, className = "pa-name", anchor = "middle") => `<text class="${className}" x="${fmt(position.x)}" y="${fmt(position.y)}" text-anchor="${anchor}">${esc(value)}</text>`;
  const lineLabel = (modelLine, value, distance, dx = 0, dy = 0, anchor = "middle") => {
    const base = linePoint(modelLine, distance);
    return svgText(point(base.x + dx, base.y + dy), value, "pa-name", anchor);
  };
  const pathPoint = position => `${fmt(position.x)} ${fmt(position.y)}`;

  const angleMark = ({ role, vertex, rayA, rayB, label, value, solved, direction = "minor", radius = 22, labelRadius = 43, labelPosition = null, labelClearance = 10 }) => {
    const firstAngle = angleOf(vertex, rayA);
    const secondAngle = angleOf(vertex, rayB);
    const cw = clockwise(firstAngle, secondAngle);
    let sweep = 1;
    let span = cw;
    if (direction === "ccw" || (direction === "minor" && cw > 180)) {
      sweep = 0;
      span = normalize(firstAngle - secondAngle);
    }
    if (direction === "cw") {
      sweep = 1;
      span = cw;
    }
    if (!(span > 0 && span < 180.0001)) throw new Error(`${role}의 표시각 ${span}°가 올바르지 않습니다.`);
    if (Math.abs(span - Number(value)) > 0.01) throw new Error(`${role}의 방향 모델 ${round(span)}°와 값 ${value}°가 다릅니다.`);
    const endAngle = sweep ? firstAngle + span : firstAngle - span;
    const bisectorAngle = sweep ? firstAngle + span / 2 : firstAngle - span / 2;
    const resolvedRadius = Math.max(radius, Math.ceil(11 / (span * Math.PI / 180)));
    const startPoint = pointAt(vertex, firstAngle, resolvedRadius);
    const endPoint = pointAt(vertex, endAngle, resolvedRadius);
    const shownLabel = solved && /^㉠|㉡|㉢|㉣$/.test(label) ? `${value}°` : label;
    const targetLabel = /^㉠|㉡|㉢|㉣$/.test(label);
    const fontSize = 18;
    const estimatedWidth = Array.from(shownLabel).reduce((width, character) => width + fontSize * (/\d/.test(character) ? 0.62 : character === "°" ? 0.55 : 1), 0);
    const halfWidth = estimatedWidth / 2;
    const halfHeight = fontSize * 0.58;
    const projectedHalfSize = [firstAngle, endAngle].map(angle => {
      const radians = angle * Math.PI / 180;
      return halfWidth * Math.abs(Math.sin(radians)) + halfHeight * Math.abs(Math.cos(radians));
    });
    const halfSpanSine = Math.sin(span * Math.PI / 360);
    const collisionFreeLabelRadius = Math.ceil((Math.max(...projectedHalfSize) + labelClearance) / Math.max(halfSpanSine, 0.08));
    const resolvedLabelRadius = Math.max(labelRadius, collisionFreeLabelRadius, resolvedRadius + 12);
    const midpoint = pointAt(vertex, bisectorAngle, resolvedRadius);
    const labelPoint = labelPosition ? point(labelPosition.x, labelPosition.y) : pointAt(vertex, bisectorAngle, resolvedLabelRadius);
    const metadata = {
      "data-angle-role": role,
      "data-angle-value": value,
      "data-angle-vertex": `${fmt(vertex.x)},${fmt(vertex.y)}`,
      "data-angle-ray-a": `${fmt(rayA.x)},${fmt(rayA.y)}`,
      "data-angle-ray-b": `${fmt(rayB.x)},${fmt(rayB.y)}`,
      "data-angle-midpoint": `${fmt(midpoint.x)},${fmt(midpoint.y)}`,
      "data-angle-start": fmt(firstAngle),
      "data-angle-start-direction": fmt(firstAngle),
      "data-angle-span": fmt(span),
      "data-angle-center": `${fmt(vertex.x)},${fmt(vertex.y)}`,
      "data-angle-radius": resolvedRadius,
      "data-angle-label-radius": resolvedLabelRadius,
      "data-angle-label-mode": labelPosition ? "leader" : "bisector",
      "data-angle-sweep": sweep
    };
    const leaderStart = point(labelPoint.x + (midpoint.x > labelPoint.x ? halfWidth + 4 : -halfWidth - 4), labelPoint.y);
    const leader = labelPosition ? `<path class="pa-leader" data-leader-end="${fmt(midpoint.x)},${fmt(midpoint.y)}" d="M ${pathPoint(leaderStart)} Q ${fmt(midpoint.x)} ${fmt(labelPoint.y)} ${pathPoint(midpoint)}"/>` : "";
    return `<g class="pa-angle ${targetLabel ? "is-target" : "is-given"}"${attrs(metadata)}><path class="pa-arc"${attrs(metadata)} d="M ${pathPoint(startPoint)} A ${resolvedRadius} ${resolvedRadius} 0 0 ${sweep} ${pathPoint(endPoint)}"/>${leader}<text class="${targetLabel ? "pa-target" : "pa-value"}" data-angle-label-role="${esc(role)}" x="${fmt(labelPoint.x)}" y="${fmt(labelPoint.y)}">${esc(shownLabel)}</text></g>`;
  };
  const markByAngles = options => angleMark({
    ...options,
    rayA: pointAt(options.vertex, options.start, 50),
    rayB: pointAt(options.vertex, options.direction === "ccw" ? options.start - options.value : options.start + options.value, 50),
    direction: options.direction || "cw"
  });
  const parallelMark = (modelLine, center, index = 1) => {
    const normal = modelLine.angle + 90;
    const along = pointAt(center, modelLine.angle, index === 1 ? -5 : 5);
    const a = pointAt(along, normal, -6);
    const b = pointAt(along, normal, 6);
    const c = pointAt(pointAt(along, modelLine.angle, 7), normal, -6);
    const d = pointAt(pointAt(along, modelLine.angle, 7), normal, 6);
    return `<path class="pa-parallel" d="M ${pathPoint(a)} L ${pathPoint(b)}${index === 2 ? ` M ${pathPoint(c)} L ${pathPoint(d)}` : ""}"/>`;
  };
  const rightMark = (vertex, horizontalAngle = 0, size = 12) => {
    const a = pointAt(vertex, horizontalAngle, size);
    const b = pointAt(a, horizontalAngle + 90, size);
    const c = pointAt(vertex, horizontalAngle + 90, size);
    return `<path class="pa-right" d="M ${pathPoint(a)} L ${pathPoint(b)} L ${pathPoint(c)}"/>`;
  };
  const wrapSvg = (kindLabel, sourceItemId, poolIndex, solved, content, model, width = 540, height = 340) => `<svg class="geometry-diagram source42-pa" style="display:block;width:min(${width}px,100%);height:auto;margin:12px auto;overflow:visible" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(`${kindLabel} ${solved ? "정답" : "문제"} 그림`)}" data-phase="${solved ? "answer" : "problem"}" data-source-item="${esc(sourceItemId)}" data-pool-index="${poolIndex}" data-model-kind="${esc(model.kind || kindLabel)}" data-direction-model="${encoded(model)}">${svgStyle}${content}</svg>`;

  const deriveCase = (kind, rawData) => {
    const data = JSON.parse(JSON.stringify(rawData));
    if (kind === "exploration") {
      const upper = clockwise(data.top, data.connector);
      const lower = clockwise(data.connector + 180, data.bottom);
      const secondConnector = data.secondConnector ?? 90;
      const secondUpper = clockwise(data.top, secondConnector);
      const secondLower = clockwise(secondConnector + 180, data.bottom);
      return { ...data, secondConnector, upper, lower, secondUpper, secondLower, firstSum: upper + lower, secondSum: secondUpper + secondLower, answer: "㉠+㉡과 ㉢+㉣은 같습니다." };
    }
    if (kind === "example-2-3") {
      const values = [data.bridge - data.left, 90 + data.left, data.right - data.bridge, 90 - data.right];
      return { ...data, values, sum: values.reduce((sum, value) => sum + value, 0), answer: "180°" };
    }
    if (kind === "example-2-4") {
      const second = data.large - data.small - data.first;
      return { ...data, descending: 180 - data.large, rising: 180 - data.first, steep: 180 - data.first - data.small, second, sum: data.first + second, answer: `${data.large - data.small}°` };
    }
    if (kind === "mission-1") {
      const target = 180 - data.first - data.second;
      return { ...data, connector: data.base + data.first, cross: data.base - data.second, target, answer: `${target}°` };
    }
    if (kind === "mission-2") {
      const firstTarget = data.secondGiven - data.firstGiven;
      const secondTarget = 270 - data.secondGiven;
      const difference = secondTarget - firstTarget;
      return { ...data, firstTarget, secondTarget, difference, answer: `${difference}°` };
    }
    if (kind === "mission-3") {
      const directions = [180 - data.first, 180 - data.second, data.equal, 0, 0];
      return { ...data, directions, candidates: ["라와 마"], answer: "라와 마" };
    }
    if (kind === "mission-4") {
      const directions = {
        row: 0,
        a: 180 - data.row,
        diagonal: 180 - data.row - data.left,
        b: 180 - data.row - data.left + data.middle,
        c: 180 - data.row - data.left + data.right
      };
      const corresponding = [directions.a, directions.b, directions.diagonal, data.right];
      const sum = corresponding.reduce((total, value) => total + value, 0);
      return { ...data, directions, displayed: [data.left, data.middle, data.row, data.right], corresponding, target: directions.c, sum, answer: `${sum}°` };
    }
    if (kind === "mission-5") {
      const target = data.outer - data.gap;
      return { ...data, target, leftInner: target, rightInner: data.outer + data.unused, answer: `${target}°` };
    }
    if (kind === "mission-6") {
      const target = 90 + data.given;
      return { ...data, target, answer: `${target}°` };
    }
    throw new Error(`지원하지 않는 평행선 각 유형입니다: ${kind}`);
  };

  const explorationDiagram = (facts, solved, sourceItemId, poolIndex) => {
    const origin = point(55, 55);
    const top = line("윗선", origin, facts.top);
    const bottom = line("아랫선", origin, facts.bottom);
    const first = line("첫째 선분", linePoint(top, 250), facts.connector);
    const second = line("둘째 선분", linePoint(top, 335), facts.secondConnector);
    const p1 = requireIntersection(top, first, "윗선과 첫째 선분");
    const p2 = requireIntersection(bottom, first, "아랫선과 첫째 선분");
    const p3 = requireIntersection(top, second, "윗선과 둘째 선분");
    const p4 = requireIntersection(bottom, second, "아랫선과 둘째 선분");
    const marks = [
      markByAngles({ role: "circle-1", vertex: p1, start: facts.top, value: facts.upper, label: "㉠", solved: false, radius: 19, labelRadius: 36 }),
      markByAngles({ role: "circle-2", vertex: p2, start: facts.connector + 180, value: facts.lower, label: "㉡", solved: false, radius: 19, labelRadius: 38 }),
      markByAngles({ role: "circle-3", vertex: p3, start: facts.top, value: facts.secondUpper, label: "㉢", solved: false, radius: 19, labelRadius: 36 }),
      markByAngles({ role: "circle-4", vertex: p4, start: facts.secondConnector + 180, value: facts.secondLower, label: "㉣", solved: false, radius: 19, labelRadius: 38 })
    ].join("");
    const answerNote = solved ? svgText(point(270, 286), "두 합은 같습니다.", "pa-answer-note") : "";
    const model = { kind: "exploration", origin, lines: [top, bottom, first, second].map(item => [item.name, item.angle]), values: [facts.upper, facts.lower, facts.secondUpper, facts.secondLower], answer: facts.answer };
    return wrapSvg("두 각의 합 비교", sourceItemId, poolIndex, solved, `${svgSegment(top.name, origin, linePoint(top, 435))}${svgSegment(bottom.name, origin, linePoint(bottom, 465))}${svgSegment(first.name, p1, p2)}${svgSegment(second.name, p3, p4)}${marks}${answerNote}`, model);
  };

  const example23Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const leftParallel = line("가", point(125, 150), 90);
    const rightParallel = line("나", point(415, 150), 90);
    const bridge = line("가로지르는 선", point(270, 104), facts.bridge);
    const leftTop = linePoint(bridge, -48);
    const rightTop = linePoint(bridge, 48);
    const leftSlant = line("왼쪽 빗선", leftTop, facts.left);
    const rightSlant = line("오른쪽 빗선", rightTop, facts.right);
    const leftBottom = requireIntersection(leftParallel, leftSlant, "가와 왼쪽 빗선");
    const rightBottom = requireIntersection(rightParallel, rightSlant, "나와 오른쪽 빗선");
    const [a, b, c, d] = facts.values;
    const marks = [
      markByAngles({ role: "circle-1", vertex: leftTop, start: facts.left + 180, value: a, label: "㉠", solved: false, radius: 17, labelRadius: 34 }),
      markByAngles({ role: "circle-2", vertex: leftBottom, start: 90, value: b, label: "㉡", solved: false, radius: 18, labelRadius: 37 }),
      markByAngles({ role: "circle-3", vertex: rightTop, start: facts.bridge, value: c, label: "㉢", solved: false, radius: 17, labelRadius: 35 }),
      markByAngles({ role: "circle-4", vertex: rightBottom, start: facts.right + 180, value: d, label: "㉣", solved: false, radius: 18, labelRadius: 37 })
    ].join("");
    const guides = solved ? [leftTop, rightTop].map(vertex => `<line class="pa-guide" data-guide-kind="parallel-through-vertex" x1="${fmt(vertex.x)}" y1="${fmt(vertex.y - 45)}" x2="${fmt(vertex.x)}" y2="${fmt(vertex.y + 120)}"/>`).join("") : "";
    const model = { kind: "example-2-3", lines: [["가", 90], ["나", 90], ["가로지르는 선", facts.bridge], ["왼쪽 빗선", facts.left], ["오른쪽 빗선", facts.right]], values: facts.values, sum: facts.sum };
    return wrapSvg("두 평행선에 걸친 네 각", sourceItemId, poolIndex, solved, `${framedLine(leftParallel, "가")}${framedLine(rightParallel, "나")}${framedLine(bridge)}${svgSegment(leftSlant.name, leftTop, pointAt(leftBottom, facts.left + 180, 55))}${svgSegment(rightSlant.name, rightTop, pointAt(rightBottom, facts.right, 55))}${guides}${marks}`, model);
  };

  const example24Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const top = line("가", point(270, 65), 0);
    const bottom = line("나", point(270, 270), 0);
    const descending = line("내려가는 빗선", point(160, 65), facts.descending);
    const risingCross = point(420, 105);
    const rising = line("완만한 빗선", risingCross, facts.rising);
    const steep = line("가파른 빗선", risingCross, facts.steep);
    const topCross = requireIntersection(top, descending, "가와 내려가는 빗선");
    const firstTarget = requireIntersection(bottom, rising, "나와 완만한 빗선");
    const secondTarget = requireIntersection(descending, steep, "두 빗선");
    const marks = [
      markByAngles({ role: "large-given", vertex: topCross, start: facts.descending, value: facts.large, label: `${facts.large}°`, solved, radius: 17, labelRadius: 36 }),
      markByAngles({ role: "small-given", vertex: risingCross, start: facts.steep, value: facts.small, label: `${facts.small}°`, solved, radius: 18, labelRadius: 38, labelPosition: point(438, 145) }),
      markByAngles({ role: "circle-1", vertex: firstTarget, start: facts.rising + 180, value: facts.first, label: "㉠", solved: false, radius: 18, labelRadius: 37, labelClearance: 7 }),
      markByAngles({ role: "circle-2", vertex: secondTarget, start: facts.descending + 180, value: facts.second, label: "㉡", solved: false, radius: 18, labelRadius: 39 })
    ].join("");
    const model = { kind: "example-2-4", lines: [["가", 0], ["나", 0], ["내려가는 빗선", facts.descending], ["완만한 빗선", facts.rising], ["가파른 빗선", facts.steep]], givens: [facts.large, facts.small], targets: [facts.first, facts.second], sum: facts.sum };
    return wrapSvg("평행선과 세 빗선", sourceItemId, poolIndex, solved, `${framedLine(top, "가")}${framedLine(bottom, "나")}${framedLine(descending)}${framedLine(rising)}${framedLine(steep)}${marks}`, model);
  };

  const mission1Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const upper = line("가", point(270, 64), facts.base);
    const lower = line("나", point(270, 232), facts.base);
    const g = linePoint(upper, -92);
    const d = linePoint(upper, 98);
    const steep = line("ㄱㄴㄹㅂ", g, facts.connector);
    const ndLine = line("ㄴㄷ", d, facts.cross);
    const n = requireIntersection(steep, ndLine, "ㄱㄴㄹㅂ와 ㄴㄷ");
    const b = requireIntersection(lower, steep, "나와 ㄱㄴㄹㅂ");
    const r = point(n.x + (b.x - n.x) * 0.34, n.y + (b.y - n.y) * 0.34);
    const mrLine = line("ㅁㄹ", r, facts.cross);
    const m = requireIntersection(lower, mrLine, "나와 ㅁㄹ");
    const marks = [
      markByAngles({ role: "first-given", vertex: g, start: facts.base, value: facts.first, label: `${facts.first}°`, solved, radius: 17, labelRadius: 35, labelClearance: 4 }),
      markByAngles({ role: "second-given", vertex: d, start: facts.cross + 180, value: facts.second, label: `${facts.second}°`, solved, radius: 17, labelRadius: 92, labelClearance: 4 }),
      markByAngles({ role: "target", vertex: r, start: facts.connector, value: facts.target, label: "㉠", solved, radius: 20, labelRadius: 30, labelClearance: 4 })
    ].join("");
    const labels = [
      [pointAt(linePoint(upper, -215), facts.base + 90, 32), "가"],
      [pointAt(linePoint(lower, -250), facts.base - 90, 14), "나"],
      [pointAt(g, facts.base - 90, 24), "ㄱ"], [pointAt(n, facts.connector + 90, 24), "ㄴ"],
      [pointAt(d, facts.base - 90, 24), "ㄷ"], [pointAt(r, facts.connector - 90, 26), "ㄹ"],
      [pointAt(m, facts.base + 90, 25), "ㅁ"], [pointAt(b, facts.base + 90, 25), "ㅂ"]
    ].map(([position, name]) => svgText(position, name)).join("");
    const alongSteep = value => (value.x - g.x) * Math.cos(facts.connector * Math.PI / 180) + (value.y - g.y) * Math.sin(facts.connector * Math.PI / 180);
    const model = {
      kind: "mission-1",
      lines: [["가", facts.base], ["나", facts.base], ["ㄱㄴㄹㅂ", facts.connector], ["ㄴㄷ", facts.cross], ["ㅁㄹ", facts.cross]],
      points: Object.fromEntries(Object.entries({ "ㄱ": g, "ㄴ": n, "ㄷ": d, "ㄹ": r, "ㅁ": m, "ㅂ": b }).map(([name, value]) => [name, [round(value.x), round(value.y)]])),
      pointOrder: [g, n, r, b].map(alongSteep),
      distinctMiddlePoints: Math.hypot(n.x - r.x, n.y - r.y),
      givens: [facts.first, facts.second],
      target: facts.target,
      targetVertex: "ㄹ",
      targetRays: ["ㅂ", "ㅁ"]
    };
    return wrapSvg("평행선과 나란한 선분", sourceItemId, poolIndex, solved, `${svgLine(upper, 430)}${svgLine(lower, 430)}${svgSegment("ㄱㄴㄹㅂ", g, b)}${svgSegment("ㄴㄷ", n, d)}${svgSegment("ㅁㄹ", m, r)}${[g, n, d, r, m, b].map(svgPoint).join("")}${marks}${labels}`, model);
  };

  const mission2Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const upper = line("가", point(270, 80), 0);
    const lower = line("나", point(270, 190), 0);
    const vertical = line("다", point(220, 80), 90);
    const firstSlant = line("첫째 빗선", vertical.origin, facts.firstGiven);
    const center = requireIntersection(firstSlant, lower, "두 빗선과 나");
    const secondSlant = line("둘째 빗선", center, facts.secondGiven);
    const firstTop = requireIntersection(upper, firstSlant, "가와 첫째 빗선");
    const secondTop = requireIntersection(upper, secondSlant, "가와 둘째 빗선");
    const secondTarget = requireIntersection(vertical, secondSlant, "다와 둘째 빗선");
    const marks = [
      markByAngles({ role: "first-given", vertex: firstTop, start: 180, value: facts.firstGiven, label: `${facts.firstGiven}°`, solved, radius: 18, labelRadius: 38 }),
      markByAngles({ role: "second-given", vertex: secondTop, start: 180, value: facts.secondGiven, label: `${facts.secondGiven}°`, solved, radius: 18, labelRadius: 40 }),
      markByAngles({ role: "circle-1", vertex: center, start: facts.firstGiven, value: facts.firstTarget, label: "㉠", solved, radius: 18, labelRadius: 34 }),
      markByAngles({ role: "circle-2", vertex: secondTarget, start: facts.secondGiven, value: facts.secondTarget, label: "㉡", solved, radius: 27, labelRadius: 40, labelClearance: 4 })
    ].join("");
    const model = { kind: "mission-2", lines: [["가", 0], ["나", 0], ["다", 90], ["첫째 빗선", facts.firstGiven], ["둘째 빗선", facts.secondGiven]], intersections: { upperCommon: firstTop, lowerCommon: center, secondTarget }, givens: [facts.firstGiven, facts.secondGiven], targets: [facts.firstTarget, facts.secondTarget], difference: facts.difference };
    const frame = { left: 55, right: 485, top: 35, bottom: 340 };
    return wrapSvg("평행선과 수직선", sourceItemId, poolIndex, solved, `${framedLine(upper, "가", 0, frame)}${framedLine(lower, "나", 0, frame)}${framedLine(vertical, "다", 0, frame)}${framedLine(firstSlant, "", 0, frame)}${framedLine(secondSlant, "", 0, frame)}${rightMark(firstTop)}${marks}`, model, 540, 380);
  };

  const mission3Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const top = line("라", point(270, 90), 0);
    const bottom = line("마", point(270, 215), 0);
    const a = line("가", point(145, 155), 180 - facts.first);
    const b = line("나", point(270, 155), 180 - facts.second);
    const c = line("다", point(365, 155), facts.equal);
    const aBottom = requireIntersection(a, bottom, "가와 마");
    const bBottom = requireIntersection(b, bottom, "나와 마");
    const cTop = requireIntersection(c, top, "다와 라");
    const cBottom = requireIntersection(c, bottom, "다와 마");
    const marks = [
      markByAngles({ role: "first-given", vertex: aBottom, start: a.angle, value: facts.first, label: `${facts.first}°`, solved, radius: 17, labelRadius: 35 }),
      markByAngles({ role: "second-given", vertex: bBottom, start: b.angle, value: facts.second, label: `${facts.second}°`, solved, radius: 17, labelRadius: 36 }),
      markByAngles({ role: "equal-top", vertex: cTop, start: 0, value: facts.equal, label: `${facts.equal}°`, solved, radius: 17, labelRadius: 34 }),
      markByAngles({ role: "equal-bottom", vertex: cBottom, start: 180, value: facts.equal, label: `${facts.equal}°`, solved, radius: 17, labelRadius: 34 })
    ].join("");
    const answerLines = `${framedLine(top, "라", 1)}${framedLine(bottom, "마", 1)}`;
    const model = { kind: "mission-3", lineNames: ["가", "나", "다", "라", "마"], directions: facts.directions, candidates: facts.candidates };
    return wrapSvg("평행한 두 직선 찾기", sourceItemId, poolIndex, solved, `${answerLines}${framedLine(a, "가")}${framedLine(b, "나")}${framedLine(c, "다")}${marks}${solved ? svgText(point(270, 324), "라 ∥ 마", "pa-answer-note") : ""}`, model);
  };

  const mission4Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const directions = facts.directions;
    const row = line("라", point(270, 205), directions.row);
    const diagonal = line("마", point(270, 150), directions.diagonal);
    const a = line("가", point(150, 205), directions.a);
    const b = line("나", point(245, 205), directions.b);
    const c = line("다", point(390, 205), directions.c);
    const aDiagonal = requireIntersection(a, diagonal, "가와 마");
    const bDiagonal = requireIntersection(b, diagonal, "나와 마");
    const aRow = requireIntersection(a, row, "가와 라");
    const cDiagonal = requireIntersection(c, diagonal, "다와 마");
    const target = requireIntersection(c, row, "다와 라");
    const marks = [
      markByAngles({ role: "left-given", vertex: aDiagonal, start: directions.diagonal, value: facts.left, label: `${facts.left}°`, solved, radius: 16, labelRadius: 34 }),
      markByAngles({ role: "middle-given", vertex: bDiagonal, start: directions.diagonal + 180, value: facts.middle, label: `${facts.middle}°`, solved, radius: 16, labelRadius: 34 }),
      markByAngles({ role: "row-given", vertex: aRow, start: directions.a, value: facts.row, label: `${facts.row}°`, solved, radius: 16, labelRadius: 34 }),
      markByAngles({ role: "right-given", vertex: cDiagonal, start: directions.diagonal + 180, value: facts.right, label: `${facts.right}°`, solved, radius: 16, labelRadius: 34 }),
      markByAngles({ role: "circle-1", vertex: target, start: directions.c + 180, value: facts.target, label: "㉠", solved, direction: "ccw", radius: 20, labelRadius: 41 })
    ].join("");
    const model = {
      kind: "mission-4",
      lines: [["가", directions.a], ["나", directions.b], ["다", directions.c], ["라", directions.row], ["마", directions.diagonal]],
      displayedGivens: facts.displayed,
      corresponding: facts.corresponding,
      target: facts.target,
      sum: facts.sum
    };
    const frame = { left: 55, right: 485, top: 35, bottom: 340 };
    return wrapSvg("동위각 네 개의 합", sourceItemId, poolIndex, solved, `${framedLine(row, "라", 1, frame)}${framedLine(diagonal, "마", 1, frame)}${framedLine(a, "가", 0, frame)}${framedLine(b, "나", 0, frame)}${framedLine(c, "다", 0, frame)}${marks}`, model, 540, 380);
  };

  const mission5Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const top = line("가", point(270, 58), 0);
    const bottom = line("나", point(270, 220), 0);
    const leftOuter = line("다", point(185, 58), facts.outer);
    const rightOuter = line("라", point(390, 58), facts.outer);
    const leftJoint = linePoint(leftOuter, 76);
    const rightJoint = linePoint(rightOuter, 72);
    const leftInner = line("왼쪽 안쪽선", leftJoint, facts.leftInner);
    const rightInner = line("오른쪽 안쪽선", rightJoint, facts.rightInner);
    const topLeft = requireIntersection(top, leftOuter, "가와 다");
    const topRight = requireIntersection(top, rightOuter, "가와 라");
    const lowerTarget = requireIntersection(bottom, leftInner, "나와 왼쪽 안쪽선");
    const apex = requireIntersection(leftInner, rightInner, "안쪽 두 선");
    const marks = [
      markByAngles({ role: "outer-given", vertex: topRight, start: 0, value: facts.outer, label: `${facts.outer}°`, solved, radius: 18, labelRadius: 38 }),
      markByAngles({ role: "gap-given", vertex: leftJoint, start: facts.leftInner, value: facts.gap, label: `${facts.gap}°`, solved, radius: 17, labelRadius: 35, labelPosition: point(leftJoint.x - 60, leftJoint.y + 35) }),
      markByAngles({ role: "unused-given", vertex: rightJoint, start: facts.outer, value: facts.unused, label: `${facts.unused}°`, solved, radius: 17, labelRadius: 36, labelPosition: point(rightJoint.x + 70, rightJoint.y + 33) }),
      markByAngles({ role: "target", vertex: lowerTarget, start: 0, value: facts.target, label: "㉠", solved, radius: 20, labelRadius: 40, labelClearance: 4 })
    ].join("");
    const model = { kind: "mission-5", lines: [["가", 0], ["나", 0], ["다", facts.outer], ["라", facts.outer], ["왼쪽 안쪽선", facts.leftInner], ["오른쪽 안쪽선", facts.rightInner]], givens: [facts.outer, facts.gap, facts.unused], target: facts.target, targetIntersection: "나-왼쪽 안쪽선", apex: [round(apex.x), round(apex.y)] };
    const frame = { left: 55, right: 485, top: 35, bottom: 330 };
    return wrapSvg("두 쌍의 평행선", sourceItemId, poolIndex, solved, `${framedLine(top, "가", 0, frame)}${framedLine(bottom, "나", 0, frame)}${framedLine(leftOuter, "다", 0, frame)}${framedLine(rightOuter, "라", 0, frame)}${svgSegment(leftInner.name, leftJoint, apex)}${svgSegment(rightInner.name, rightJoint, apex)}${marks}`, model, 540, 360);
  };

  const mission6Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const horizontal = line("가", point(270, 98), 0);
    const vertical = line("나", point(188, 155), 90);
    const upperSlant = line("라", point(350, 98), facts.given);
    const lowerCross = point(188, 222);
    const lowerSlant = line("다", lowerCross, facts.given);
    const upperCross = requireIntersection(horizontal, upperSlant, "가와 라");
    const perpendicular = requireIntersection(horizontal, vertical, "가와 나");
    const marks = [
      markByAngles({ role: "given", vertex: upperCross, start: 0, value: facts.given, label: `${facts.given}°`, solved, radius: 18, labelRadius: 37 }),
      markByAngles({ role: "target", vertex: lowerCross, start: 90, value: facts.target, label: "㉠", solved, radius: 21, labelRadius: 43 })
    ].join("");
    const model = { kind: "mission-6", lines: [["가", 0], ["나", 90], ["다", facts.given], ["라", facts.given]], perpendicular: ["가", "나"], parallel: ["다", "라"], given: facts.given, target: facts.target };
    const lowerStart = linePoint(lowerSlant, -90);
    return wrapSvg("수직선과 평행한 빗선", sourceItemId, poolIndex, solved, `${framedLine(horizontal, "가")}${framedLine(vertical, "나")}${framedLine(upperSlant, "라")}${svgSegment(lowerSlant.name, lowerStart, linePoint(lowerSlant, 120))}${svgText(pointAt(lowerStart, facts.given - 90, 23), "다")}${rightMark(perpendicular)}${marks}`, model);
  };

  const diagrams = Object.freeze({
    exploration: explorationDiagram,
    "example-2-3": example23Diagram,
    "example-2-4": example24Diagram,
    "mission-1": mission1Diagram,
    "mission-2": mission2Diagram,
    "mission-3": mission3Diagram,
    "mission-4": mission4Diagram,
    "mission-5": mission5Diagram,
    "mission-6": mission6Diagram
  });

  const promptFor = (kind, facts) => {
    if (kind === "exploration") return "그림에서 ㉠과 ㉡의 크기의 합과 ㉢과 ㉣의 크기의 합을 비교하세요.";
    if (kind === "example-2-3") return "그림에서 직선 가와 나는 서로 평행합니다. ㉠+㉡+㉢+㉣을 구하세요.";
    if (kind === "example-2-4") return `그림에서 직선 가와 나는 서로 평행합니다. ㉠과 ㉡의 크기의 합을 구하세요.`;
    if (kind === "mission-1") return "그림에서 직선 가와 나, 선분 ㄴㄷ과 선분 ㅁㄹ은 각각 서로 평행합니다. ㉠의 크기를 구하세요.";
    if (kind === "mission-2") return "그림에서 직선 가와 나는 서로 평행하고 직선 가와 다는 서로 수직입니다. ㉠과 ㉡의 크기의 차를 구하세요.";
    if (kind === "mission-3") return "그림에서 평행한 두 직선을 찾아 쓰세요.";
    if (kind === "mission-4") return "그림에서 각 ㉠의 동위각들을 모두 더하면 몇 도인지 구하세요.";
    if (kind === "mission-5") return "그림에서 직선 가와 나, 직선 다와 라는 각각 서로 평행합니다. ㉠의 크기를 구하세요.";
    if (kind === "mission-6") return "그림에서 직선 가와 나는 서로 수직이고, 직선 다와 라는 서로 평행합니다. ㉠의 크기를 구하세요.";
    throw new Error(`문장을 만들 수 없는 유형입니다: ${kind}`);
  };

  const solutionFor = (kind, facts) => {
    if (kind === "exploration") return `두 삼각형은 왼쪽 꼭짓점의 각을 함께 사용합니다. 나머지 두 내각의 합이 같으므로, 이 내각들과 각각 한 평각을 이루는 표시된 두 각의 합도 같습니다. <span class="math-inline-expression">㉠+㉡=㉢+㉣</span>`;
    if (kind === "example-2-3") return `꺾인 두 꼭짓점을 지나고 직선 가와 평행한 보조선을 그었습니다. 엇각을 이용해 ㉡과 ㉣을 옮기면, ㉠+㉡과 ㉢+㉣은 두 평행선 안쪽에서 가로지르는 선의 같은 쪽에 있는 두 각이 됩니다. 따라서 <span class="math-inline-expression">㉠+㉡+㉢+㉣=180°</span>입니다.`;
    if (kind === "example-2-4") return `평행선의 엇각과 삼각형의 세 각의 합을 이용하면, 주어진 ${facts.large}°는 ㉠, ㉡, ${facts.small}°의 합과 같습니다. 따라서 <span class="math-inline-expression">㉠+㉡=${facts.large}°-${facts.small}°=${facts.sum}°</span>입니다.`;
    if (kind === "mission-1") return `삼각형 ㄱㄴㄷ의 세 각의 합은 180°이므로 각 ㄱㄴㄷ은 <span class="math-inline-expression">180°-${facts.first}°-${facts.second}°=${facts.target}°</span>입니다. ㄴㄷ과 ㅁㄹ이 평행하므로 각 ㅁㄹㅂ은 각 ㄱㄴㄷ과 엇각으로 같습니다.`;
    if (kind === "mission-2") return `맞꼭지각과 엇각을 이용하면 <span class="math-inline-expression">㉠=${facts.secondGiven}°-${facts.firstGiven}°=${facts.firstTarget}°</span>, <span class="math-inline-expression">㉡=270°-${facts.secondGiven}°=${facts.secondTarget}°</span>입니다. <span class="math-inline-expression">${facts.secondTarget}°-${facts.firstTarget}°=${facts.difference}°</span>`;
    if (kind === "mission-3") return `직선 다가 두 직선을 가로지를 때 표시된 두 엇각이 모두 ${facts.equal}°로 같습니다. 따라서 평행한 두 직선은 라와 마입니다.`;
    if (kind === "mission-4") return `동위각은 각각 ${facts.corresponding.join("°, ")}°입니다. <span class="math-inline-expression">${facts.corresponding.join("°+")}°=${facts.sum}°</span>`;
    if (kind === "mission-5") return `평행선의 엇각을 이용하면 <span class="math-inline-expression">${facts.outer}°-${facts.gap}°=${facts.target}°</span>`;
    if (kind === "mission-6") return `수직인 두 직선과 동위각을 이용하면 <span class="math-inline-expression">90°+${facts.given}°=${facts.target}°</span>`;
    throw new Error(`풀이를 만들 수 없는 유형입니다: ${kind}`);
  };

  const difficultyEvidenceFor = kind => {
    if (kind !== "mission-1") return { sourceTier: "심화", sourceStructurePreserved: true };
    return {
      sourceTier: "심화",
      sourceTask: "Mission 1",
      sourceStructurePreserved: true,
      requiredParallelPairs: [["가", "나"], ["ㄴㄷ", "ㅁㄹ"]],
      givenAngleCount: 2,
      reasoningSteps: ["두 주어진 각으로 나머지 각을 구하기", "평행 관계를 이용해 목표각으로 옮기기"],
      numericChangeOnly: false
    };
  };

  const buildGenerated = (sourceItemId, poolIndex) => {
    const kind = KINDS[sourceItemId];
    if (!kind) throw new Error(`등록되지 않은 평행선 각 원문 ID입니다: ${sourceItemId}`);
    const pool = POOLS[kind];
    if (!pool || pool.length !== 3) throw new Error(`${sourceItemId}의 검증 풀이 정확히 3개가 아닙니다.`);
    const data = pool[poolIndex];
    const facts = deriveCase(kind, data);
    const problemDiagram = diagrams[kind](facts, false, sourceItemId, poolIndex);
    const answerDiagram = diagrams[kind](facts, true, sourceItemId, poolIndex);
    const difficultyEvidence = difficultyEvidenceFor(kind);
    const evidenceModel = {
      sourceItemId,
      kind,
      poolIndex,
      data,
      facts,
      answer: facts.answer,
      uniqueAnswerCount: 1,
      difficultyEvidence
    };
    const evidence = `<span hidden data-source-item="${esc(sourceItemId)}" data-pool-index="${poolIndex}" data-answer-contract="single" data-unique-answer-count="1" data-geometry-model="${encoded(evidenceModel)}"></span>`;
    return {
      prompt: `${promptFor(kind, facts)}${problemDiagram}${evidence}`,
      answer: facts.answer,
      solution: solutionFor(kind, facts),
      answerVisual: `<div class="verified-answer-diagram source42-parallel-angle-answer" data-answer-source="${esc(sourceItemId)}" data-verified-pool-index="${poolIndex}">${answerDiagram}</div>`,
      generationMode: "fixed-verified-pool",
      verifiedPoolIndex: poolIndex,
      verifiedVariantCount: 3,
      sourceItemId,
      generator: GENERATOR_KEY,
      variantProvenance: poolIndex === 0 ? "source-values" : "source-structure-variant",
      answerCandidateCount: 1,
      answerVisualRequired: true,
      answerVisualStatus: "verified",
      difficultyDesign: "source-structure",
      difficultyEvidence
    };
  };

  const allTypes = curriculum => (curriculum?.semesters || [])
    .flatMap(semester => semester.units || [])
    .flatMap(unit => unit.subunits || [])
    .flatMap(subunit => subunit.types || []);

  const markReady = targetRoot => {
    const matches = allTypes(targetRoot.HSE_CURRICULUM).filter(type => SOURCE_ID_SET.has(type.sourceItemId));
    matches.forEach(type => Object.assign(type, {
      generatorKey: GENERATOR_KEY,
      reviewLocked: false,
      reviewReason: "",
      generationMode: "fixed-verified-pool",
      verifiedVariantTarget: 3,
      verifiedVariantCount: 3,
      verifiedVariantProvenance: ["source-values", "source-structure-variant", "source-structure-variant"],
      answerVisualRequired: true,
      answerVisualStatus: "verified",
      status: "verified"
    }));
    return matches;
  };

  const install = targetRoot => {
    const api = targetRoot?.HSE_GENERATORS;
    if (!api || typeof api.generate !== "function" || typeof api.generatorKey !== "function") return false;
    if (api.__sourceGrade4AdvancedParallelAngleInstalled) {
      markReady(targetRoot);
      return true;
    }
    const originalGeneratorKey = api.generatorKey.bind(api);
    const originalGenerate = api.generate.bind(api);
    api.generatorKey = type => SOURCE_ID_SET.has(type?.sourceItemId) || type?.generatorKey === GENERATOR_KEY
      ? GENERATOR_KEY
      : originalGeneratorKey(type);
    api.generate = (type, levelRank, difficultyOffset, seed, variant = 0) => {
      if (!SOURCE_ID_SET.has(type?.sourceItemId) && type?.generatorKey !== GENERATOR_KEY) {
        return originalGenerate(type, levelRank, difficultyOffset, seed, variant);
      }
      if (!SOURCE_ID_SET.has(type?.sourceItemId)) throw new Error(`허용되지 않은 ${GENERATOR_KEY} 원문 ID입니다: ${type?.sourceItemId || "없음"}`);
      const requestedVariant = Number.isInteger(variant) ? variant : Number.isInteger(type?.variant) ? type.variant : 0;
      const poolIndex = ((requestedVariant % 3) + 3) % 3;
      return buildGenerated(type.sourceItemId, poolIndex);
    };
    Object.defineProperty(api, "__sourceGrade4AdvancedParallelAngleInstalled", { value: true, configurable: false });
    markReady(targetRoot);
    return true;
  };

  const exported = Object.freeze({
    GEOMETRY: Object.freeze({ esc, fmt, attrs, encoded, requireIntersection, svgStyle, svgLine, svgSegment, framedLine, svgPoint, svgText, lineLabel, angleMark, markByAngles, parallelMark, rightMark, wrapSvg }),
    GENERATOR_KEY,
    SOURCE_IDS,
    ABILITY_SOURCE_ID,
    POOLS,
    normalize,
    normalizeLine,
    clockwise,
    point,
    pointAt,
    angleOf,
    line,
    intersection,
    deriveCase,
    buildGenerated,
    markReady,
    install
  });
  root.HSE_SOURCE_42_PARALLEL_ANGLE = exported;
  install(root);
  return exported;
});
