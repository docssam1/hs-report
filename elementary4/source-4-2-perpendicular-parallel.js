(function (root, factory) {
  "use strict";

  const exported = factory(root || {});
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const GENERATOR_KEY = "sourceGrade4AdvancedPerpendicularParallel";
  const SOURCE_IDS = Object.freeze([
    "4-2-u4-e1-example-1-1",
    "4-2-u4-e1-example-1-2",
    "4-2-u4-e1-example-1-3",
    "4-2-u4-e1-example-1-4",
    "4-2-u4-e1-mission-1",
    "4-2-u4-e1-mission-2",
    "4-2-u4-e1-mission-3",
    "4-2-u4-e1-mission-4",
    "4-2-u4-e1-mission-5",
    "4-2-u4-e1-mission-6"
  ]);
  const SOURCE_ID_SET = new Set(SOURCE_IDS);
  const KINDS = Object.freeze({
    [SOURCE_IDS[0]]: "example-1-1",
    [SOURCE_IDS[1]]: "example-1-2",
    [SOURCE_IDS[2]]: "example-1-3",
    [SOURCE_IDS[3]]: "example-1-4",
    [SOURCE_IDS[4]]: "mission-1",
    [SOURCE_IDS[5]]: "mission-2",
    [SOURCE_IDS[6]]: "mission-3",
    [SOURCE_IDS[7]]: "mission-4",
    [SOURCE_IDS[8]]: "mission-5",
    [SOURCE_IDS[9]]: "mission-6"
  });

  const POOLS = Object.freeze({
    "example-1-1": Object.freeze([
      { topPart: 5, bottomPart: 7 },
      { topPart: 6, bottomPart: 8 },
      { topPart: 4, bottomPart: 9 }
    ]),
    "example-1-2": Object.freeze([
      { known: [3, 6, 9], missing: 1, total: 19, top: 15, bottom: 18, side: 23 },
      { known: [4, 7, 8], missing: 3, total: 22, top: 17, bottom: 20, side: 26 },
      { known: [2, 5, 9], missing: 4, total: 20, top: 16, bottom: 19, side: 25 }
    ]),
    "example-1-3": Object.freeze([
      { start: 1, step: 1, count: 11 },
      { start: 2, step: 1, count: 11 },
      { start: 1, step: 2, count: 11 }
    ]),
    "example-1-4": Object.freeze([
      { rotation: -90 },
      { rotation: -80 },
      { rotation: -100 }
    ]),
    "mission-1": Object.freeze([
      { distance: 20, distractors: [4, 5, 7, 8, 10, 12, 14] },
      { distance: 18, distractors: [3, 6, 7, 9, 11, 13, 15] },
      { distance: 24, distractors: [5, 8, 9, 12, 14, 16, 19] }
    ]),
    "mission-2": Object.freeze([
      { unit: 6 },
      { unit: 8 },
      { unit: 10 }
    ]),
    "mission-3": Object.freeze([
      { known: [5, 9, 11], missing: 4, total: 29, horizontal: [7, 19], outer: [24, 28, 30] },
      { known: [4, 8, 10], missing: 5, total: 27, horizontal: [8, 17], outer: [22, 26, 29] },
      { known: [6, 7, 12], missing: 6, total: 31, horizontal: [9, 21], outer: [25, 30, 33] }
    ]),
    "mission-4": Object.freeze([
      { leg: 3, moveSeconds: 20, turnUnit: 10, turnSeconds: 2 },
      { leg: 4, moveSeconds: 15, turnUnit: 15, turnSeconds: 3 },
      { leg: 5, moveSeconds: 12, turnUnit: 30, turnSeconds: 4 }
    ]),
    "mission-5": Object.freeze([
      { start: 1, step: 1, turns: 6 },
      { start: 2, step: 1, turns: 6 },
      { start: 1, step: 2, turns: 6 }
    ]),
    "mission-6": Object.freeze([
      { rotation: -90 },
      { rotation: -82 },
      { rotation: -98 }
    ])
  });

  const esc = value => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
  const round = value => Math.round(Number(value) * 1000) / 1000;
  const point = (x, y) => ({ x: Number(x), y: Number(y) });
  const add = (a, b) => point(a.x + b.x, a.y + b.y);
  const scalePoint = (value, scale) => point(value.x * scale, value.y * scale);
  const pointAt = (origin, degrees, distance) => {
    const radians = Number(degrees) * Math.PI / 180;
    return point(origin.x + Math.cos(radians) * distance, origin.y + Math.sin(radians) * distance);
  };
  const angleOf = (from, to) => ((Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI) % 360 + 360) % 360;
  const normalizeLine = degrees => ((Number(degrees) % 180) + 180) % 180;
  const pathPoint = value => `${round(value.x)} ${round(value.y)}`;
  const encoded = value => encodeURIComponent(JSON.stringify(value));
  const chooseTwo = value => value * (value - 1) / 2;

  const style = `<style>
    .source42-pp{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;overflow:visible}
    .source42-pp .pp-line{fill:none;stroke:#222;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .source42-pp .pp-guide{fill:none;stroke:#666;stroke-width:1;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
    .source42-pp .pp-dimension{fill:none;stroke:#222;stroke-width:1;vector-effect:non-scaling-stroke}
    .source42-pp .pp-right{fill:none;stroke:#222;stroke-width:1;vector-effect:non-scaling-stroke}
    .source42-pp .pp-answer{fill:none;stroke:#111;stroke-width:2;vector-effect:non-scaling-stroke}
    .geometry-diagram.source42-pp text{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;font-size:21px;font-weight:400;letter-spacing:0;fill:#111;stroke:none;text-shadow:none}
    .geometry-diagram.source42-pp .pp-name{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;font-size:20px;dominant-baseline:middle}
    .geometry-diagram.source42-pp .pp-note{font-family:Pretendard,"Malgun Gothic",Arial,sans-serif;font-size:18px;dominant-baseline:middle}
    .geometry-diagram.source42-pp .pp-small{font-size:18px}
    .geometry-diagram.source42-pp[data-model-kind="여러 직선에서 평행선 찾기"] .pp-small,.geometry-diagram.source42-pp[data-model-kind="여러 직선에서 평행선 찾기"] .pp-name{font-size:22px}
    .geometry-diagram.source42-pp .pp-value{text-anchor:middle;dominant-baseline:middle}
  </style>`;

  const svgLine = (a, b, className = "pp-line", attributes = "") => `<line class="${className}" x1="${round(a.x)}" y1="${round(a.y)}" x2="${round(b.x)}" y2="${round(b.y)}"${attributes}/>`;
  const svgPolyline = (points, className = "pp-line", attributes = "") => `<polyline class="${className}" points="${points.map(pathPoint).join(" ")}"${attributes}/>`;
  const svgText = (position, value, className = "pp-value", anchor = "middle", attributes = "") => `<text class="${className}" data-layout-role="label" x="${round(position.x)}" y="${round(position.y)}" text-anchor="${anchor}"${attributes}>${esc(value)}</text>`;
  const svgPlateText = (position, value, className = "pp-value pp-small") => {
    const width = Math.max(36, String(value).length * 12 + 12);
    return `<rect x="${round(position.x - width / 2)}" y="${round(position.y - 15)}" width="${round(width)}" height="30" style="fill:#fff;stroke:none"/>${svgText(position, value, className, "middle", ` data-layout-overlap-ok="true"`)}`;
  };
  const rightMark = (vertex, firstAngle, secondAngle, size = 11) => {
    const a = pointAt(vertex, firstAngle, size);
    const b = add(a, scalePoint(pointAt(point(0, 0), secondAngle, 1), size));
    const c = pointAt(vertex, secondAngle, size);
    return `<path class="pp-right" d="M ${pathPoint(a)} L ${pathPoint(b)} L ${pathPoint(c)}"/>`;
  };
  const dimension = (a, b, label, offset = 0, solved = false) => {
    const angle = angleOf(a, b);
    const normal = pointAt(point(0, 0), angle - 90, offset);
    const start = add(a, normal);
    const end = add(b, normal);
    const tickA1 = pointAt(start, angle - 90, 5);
    const tickA2 = pointAt(start, angle + 90, 5);
    const tickB1 = pointAt(end, angle - 90, 5);
    const tickB2 = pointAt(end, angle + 90, 5);
    const labelAngle = offset < 0 ? angle + 90 : angle - 90;
    const labelDistance = Math.abs(Math.sin(angle * Math.PI / 180)) > 0.8 ? 28 : 13;
    const labelPoint = add(point((start.x + end.x) / 2, (start.y + end.y) / 2), pointAt(point(0, 0), labelAngle, labelDistance));
    const className = solved ? "pp-answer" : "pp-dimension";
    const ignored = ` data-layout-ignore="true"`;
    return `${svgLine(start, end, className, ignored)}${svgLine(tickA1, tickA2, className, ignored)}${svgLine(tickB1, tickB2, className, ignored)}${svgText(labelPoint, label)}`;
  };
  const wrapSvg = (kind, sourceItemId, poolIndex, solved, content, model, width = 560, height = 360) => `<svg class="geometry-diagram source42-pp" style="display:block;width:min(${width}px,100%);height:auto;margin:12px auto;overflow:visible" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(`${kind} ${solved ? "정답" : "문제"} 그림`)}" data-phase="${solved ? "answer" : "problem"}" data-source-item="${esc(sourceItemId)}" data-pool-index="${poolIndex}" data-model-kind="${esc(kind)}" data-geometry-model="${encoded(model)}">${style}${content}</svg>`;

  const clipLine = (center, angle, frame = { left: 45, right: 515, top: 35, bottom: 315 }) => {
    const direction = point(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180));
    let low = -Infinity;
    let high = Infinity;
    for (const [origin, delta, min, max] of [[center.x, direction.x, frame.left, frame.right], [center.y, direction.y, frame.top, frame.bottom]]) {
      if (Math.abs(delta) < 1e-9) {
        if (origin < min || origin > max) throw new Error("직선이 그림 영역 밖에 있습니다.");
        continue;
      }
      const first = (min - origin) / delta;
      const second = (max - origin) / delta;
      low = Math.max(low, Math.min(first, second));
      high = Math.min(high, Math.max(first, second));
    }
    if (!(low < high)) throw new Error("직선의 표시 구간을 계산하지 못했습니다.");
    return [add(center, scalePoint(direction, low)), add(center, scalePoint(direction, high))];
  };

  const regularHexagonModel = rotation => {
    const center = point(280, 168);
    const radius = 108;
    const vertices = Array.from({ length: 6 }, (_, index) => pointAt(center, rotation + index * 60, radius));
    const lines = [];
    for (let index = 0; index < 6; index += 1) lines.push({ a: vertices[index], b: vertices[(index + 1) % 6], role: `side-${index + 1}` });
    for (let index = 0; index < 3; index += 1) lines.push({ a: vertices[index], b: vertices[index + 3], role: `diameter-${index + 1}` });
    const groups = new Map();
    lines.forEach(item => {
      const key = round(normalizeLine(angleOf(item.a, item.b))).toFixed(3);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item.role);
      item.family = key;
    });
    const answer = [...groups.values()].reduce((sum, family) => sum + chooseTwo(family.length), 0);
    return { center, vertices, lines, groups: Object.fromEntries(groups), answer };
  };

  const cubeProjectionModel = rotation => {
    const center = point(280, 170);
    const radius = 105;
    const vertices = Array.from({ length: 6 }, (_, index) => pointAt(center, rotation + index * 60, radius));
    const lines = [];
    for (let index = 0; index < 6; index += 1) lines.push({ a: vertices[index], b: vertices[(index + 1) % 6], role: `outer-${index + 1}` });
    [0, 2, 4].forEach((vertexIndex, index) => lines.push({ a: center, b: vertices[vertexIndex], role: `inside-${index + 1}` }));
    const groups = new Map();
    lines.forEach(item => {
      const key = round(normalizeLine(angleOf(item.a, item.b))).toFixed(3);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item.role);
      item.family = key;
    });
    const answer = [...groups.values()].reduce((sum, family) => sum + chooseTwo(family.length), 0);
    return { center, vertices, lines, groups: Object.fromEntries(groups), answer };
  };

  const deriveCase = (kind, rawData) => {
    const data = JSON.parse(JSON.stringify(rawData));
    if (kind === "example-1-1") return { ...data, answer: data.topPart + data.bottomPart };
    if (kind === "example-1-2") return { ...data, answer: data.total - data.known.reduce((sum, value) => sum + value, 0) };
    if (kind === "example-1-3") {
      const lengths = Array.from({ length: data.count }, (_, index) => data.start + index * data.step);
      const horizontalLengths = lengths.filter((_, index) => (index + 1) % 2 === 0);
      return { ...data, lengths, horizontalLengths, answer: horizontalLengths.reduce((sum, value) => sum + value, 0) };
    }
    if (kind === "example-1-4") {
      const geometry = regularHexagonModel(data.rotation);
      return { ...data, geometry, answer: geometry.answer };
    }
    if (kind === "mission-1") return { ...data, pair: ["가", "나"], answer: `가와 나, ${data.distance}cm` };
    if (kind === "mission-2") return { ...data, parts: [data.unit, data.unit * 2, data.unit * 4], total: data.unit * 7, answer: data.unit * 6 };
    if (kind === "mission-3") return { ...data, answer: data.total - data.known.reduce((sum, value) => sum + value, 0) };
    if (kind === "mission-4") {
      const moveTime = data.leg * 2 * data.moveSeconds;
      const turnTime = 90 / data.turnUnit * data.turnSeconds;
      return { ...data, moveTime, turnTime, answer: moveTime + turnTime };
    }
    if (kind === "mission-5") {
      const lengths = Array.from({ length: data.turns + 1 }, (_, index) => data.start + index * data.step);
      const perpendicularMoves = [lengths[1], -lengths[3], lengths[5]];
      return { ...data, lengths, perpendicularMoves, answer: Math.abs(perpendicularMoves.reduce((sum, value) => sum + value, 0)) };
    }
    if (kind === "mission-6") {
      const geometry = cubeProjectionModel(data.rotation);
      return { ...data, geometry, answer: geometry.answer };
    }
    throw new Error(`지원하지 않는 수선과 평행선 유형입니다: ${kind}`);
  };

  const example11Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const unit = 11;
    const topY = 55;
    const bottomY = topY + facts.answer * unit;
    const topStart = point(145, topY);
    const footX = topStart.x + facts.topPart * unit;
    const topFoot = point(footX, topY);
    const bottomFoot = point(footX, bottomY);
    const diagonalEnd = point(footX + facts.bottomPart * unit, bottomY);
    const topLine = [point(65, topY), point(495, topY)];
    const bottomLine = [point(65, bottomY), point(495, bottomY)];
    const angleCenter = diagonalEnd;
    const radius = 27;
    const arcStart = pointAt(angleCenter, 225, radius);
    const arcEnd = pointAt(angleCenter, 360, radius);
    const angleArc = `<path class="pp-dimension" d="M ${pathPoint(arcStart)} A ${radius} ${radius} 0 0 1 ${pathPoint(arcEnd)}"/>${svgText(pointAt(angleCenter, 292.5, 48), "135°")}`;
    const answerDimension = solved ? dimension(topFoot, bottomFoot, `${facts.answer} cm`, -32, true) : "";
    const content = `${svgLine(...topLine)}${svgLine(...bottomLine)}${svgLine(topStart, diagonalEnd)}${svgLine(topFoot, bottomFoot)}${rightMark(bottomFoot, 180, 270)}${angleArc}${dimension(topStart, topFoot, `${facts.topPart} cm`, 18)}${dimension(bottomFoot, diagonalEnd, `${facts.bottomPart} cm`, -18)}${answerDimension}${svgText(point(48, topY), "가", "pp-name")}${svgText(point(48, bottomY), "나", "pp-name")}`;
    const model = { kind: "example-1-1", angle: 135, topPart: facts.topPart, bottomPart: facts.bottomPart, horizontalShift: facts.answer, perpendicularDistance: facts.answer, answer: facts.answer };
    return wrapSvg("빗선의 두 부분과 평행선 사이 거리", sourceItemId, poolIndex, solved, content, model, 560, Math.max(290, bottomY + 65));
  };

  const example12Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const topY = 45;
    const bottomY = 305;
    const scale = (bottomY - topY) / facts.total;
    const rightX = 430;
    const points = [point(155, topY), point(rightX, topY)];
    let current = point(rightX, topY);
    const verticals = [...facts.known, facts.missing];
    verticals.forEach((length, index) => {
      current = point(current.x, current.y + length * scale);
      points.push(current);
      if (index < verticals.length - 1) {
        current = point(current.x - 48, current.y);
        points.push(current);
      }
    });
    points.push(point(145, bottomY), point(155, topY));
    const labels = [];
    let cursorY = topY;
    verticals.forEach((length, index) => {
      const midpoint = cursorY + length * scale / 2;
      const x = rightX - index * 48;
      const value = index === verticals.length - 1 && !solved ? "□ cm" : `${length} cm`;
      if (index === verticals.length - 1 && length * scale < 28) {
        const target = point(x, midpoint);
        const bend = point(x + 35, midpoint - 30);
        const textPosition = point(x + 82, midpoint - 30);
        labels.push(`${svgPolyline([target, bend, point(textPosition.x - 30, textPosition.y)], "pp-dimension", ` data-layout-ignore="true"`)}${svgText(textPosition, value)}`);
      } else {
        labels.push(svgText(point(x + (index === verticals.length - 1 ? 100 : 60), midpoint), value));
      }
      cursorY += length * scale;
    });
    const content = `${svgPolyline(points)}${labels.join("")}${dimension(point(155, topY), point(rightX, topY), `${facts.top} cm`, -13)}${dimension(point(145, bottomY), point(rightX - 144, bottomY), `${facts.bottom} cm`, 14)}${dimension(point(155, topY), point(145, bottomY), `${facts.side} cm`, -25)}${dimension(point(505, topY), point(505, bottomY), `${facts.total} cm`, 0, solved)}${solved ? svgText(point(280, 343), `□ = ${facts.answer} cm`, "pp-note") : ""}`;
    const model = { kind: "example-1-2", knownVerticals: facts.known, missing: facts.missing, totalPerpendicularDistance: facts.total, outerDistractors: [facts.top, facts.bottom, facts.side], answer: facts.answer };
    return wrapSvg("꺾인 선분과 평행선 사이 거리", sourceItemId, poolIndex, solved, content, model, 560, 370);
  };

  const meanderPoints = lengths => {
    const points = [point(0, 0)];
    let x = 0;
    let y = 0;
    lengths.forEach((length, index) => {
      const number = index + 1;
      if (number % 2 === 0) x += length;
      else y += number % 4 === 1 ? length : -length;
      points.push(point(x, y));
    });
    return points;
  };

  const fitPoints = (points, frame) => {
    const minX = Math.min(...points.map(value => value.x));
    const maxX = Math.max(...points.map(value => value.x));
    const minY = Math.min(...points.map(value => value.y));
    const maxY = Math.max(...points.map(value => value.y));
    const scale = Math.min((frame.right - frame.left) / Math.max(1, maxX - minX), (frame.bottom - frame.top) / Math.max(1, maxY - minY));
    return points.map(value => point(frame.left + (value.x - minX) * scale, frame.top + (value.y - minY) * scale));
  };

  const example13Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const raw = meanderPoints(facts.lengths);
    const previewRaw = meanderPoints(facts.lengths.slice(0, 7));
    const previewMinY = Math.min(...previewRaw.map(value => value.y));
    const previewMaxY = Math.max(...previewRaw.map(value => value.y));
    const previewMaxX = Math.max(...previewRaw.map(value => value.x));
    const previewScale = Math.min(22, 290 / Math.max(1, previewMaxX), 175 / Math.max(1, previewMaxY - previewMinY));
    const preview = previewRaw.map(value => point(90 + value.x * previewScale, 70 + (value.y - previewMinY) * previewScale));
    const labelOffsets = [point(-42, 0), point(12, 30), point(42, 0), point(0, -30), point(44, 0)];
    const labels = facts.lengths.slice(0, 5).map((length, index) => {
      const a = preview[index];
      const b = preview[index + 1];
      const midpoint = point((a.x + b.x) / 2, (a.y + b.y) / 2);
      return svgText(add(midpoint, labelOffsets[index]), `${length} cm`, "pp-value pp-small");
    }).join("");
    const firstVerticalX = preview[0].x;
    const previewRight = Math.max(...preview.map(value => value.x));
    const lastVerticalX = 500;
    const lastVertical = svgLine(point(lastVerticalX, 65), point(lastVerticalX, 282));
    const answerGuide = solved ? `${svgLine(point(firstVerticalX, 225), point(firstVerticalX, 315), "pp-guide")}${svgLine(point(lastVerticalX, 282), point(lastVerticalX, 315), "pp-guide")}${dimension(point(firstVerticalX, 315), point(lastVerticalX, 315), `${facts.answer} cm`, 0, true)}` : "";
    const content = `${svgPolyline(preview)}${lastVertical}${labels}${svgText(point((previewRight + lastVerticalX) / 2, 178), "⋯", "pp-value")}${answerGuide}`;
    const model = { kind: "example-1-3", lengths: facts.lengths, verticalSupportingLinePositions: raw.filter((_, index) => index % 2 === 0).map(value => value.x), horizontalTravel: facts.horizontalLengths, answer: facts.answer };
    return wrapSvg("이어 그린 수선의 가장 먼 거리", sourceItemId, poolIndex, solved, content, model, 560, 350);
  };

  const familyDiagram = (geometry, solved, sourceItemId, poolIndex, kind) => {
    const lines = geometry.lines.map(item => svgLine(item.a, item.b, solved ? "pp-line pp-answer" : "pp-line", ` data-line-role="${item.role}" data-line-family="${item.family}"`)).join("");
    const note = solved ? svgText(point(280, 326), `세 방향마다 3개씩: 3쌍 × 3 = ${geometry.answer}쌍`, "pp-note") : "";
    const centerDot = kind === "mission-6" ? `<circle cx="${geometry.center.x}" cy="${geometry.center.y}" r="2" fill="#222"/>` : "";
    const model = { kind, lineFamilies: geometry.groups, familySizes: Object.values(geometry.groups).map(values => values.length), answer: geometry.answer };
    return wrapSvg(kind === "mission-6" ? "정육면체 모양의 평행선" : "정육각형의 평행선", sourceItemId, poolIndex, solved, `${lines}${centerDot}${note}`, model, 560, 350);
  };

  const mission1Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const targetAngle = 18;
    const targetA = point(255, 135);
    const normalAngle = targetAngle + 90;
    const pixelDistance = 88;
    const targetB = pointAt(targetA, normalAngle, pixelDistance);
    const definitions = [
      { name: "가", center: targetA, angle: targetAngle },
      { name: "나", center: targetB, angle: targetAngle },
      { name: "다", center: point(280, 195), angle: -14 },
      { name: "라", center: point(300, 245), angle: 0 },
      { name: "마", center: point(195, 165), angle: 72 },
      { name: "바", center: point(290, 175), angle: 90 },
      { name: "사", center: point(382, 178), angle: -64 }
    ];
    const lineMarkup = definitions.map((definition, index) => {
      const ends = clipLine(definition.center, definition.angle);
      const endpoint = ends[index % 2];
      const fromCenter = point(endpoint.x - 280, endpoint.y - 175);
      const magnitude = Math.max(1, Math.hypot(fromCenter.x, fromCenter.y));
      const labelPoint = add(endpoint, point(fromCenter.x * 24 / magnitude, fromCenter.y * 24 / magnitude));
      return `${svgLine(ends[0], ends[1], solved && (definition.name === "가" || definition.name === "나") ? "pp-line pp-answer" : "pp-line", ` data-line-name="${definition.name}" data-line-angle="${definition.angle}"`)}${svgText(labelPoint, definition.name, "pp-name")}`;
    }).join("");
    const connectorStart = targetA;
    const connectorEnd = targetB;
    const measuredLines = [
      { definition: definitions[4], travel: -76, side: -1, value: facts.distractors[0] },
      { definition: definitions[5], travel: -25, side: 1, value: facts.distractors[1] },
      { definition: definitions[6], travel: 84, side: 1, value: facts.distractors[2] },
      { definition: definitions[2], travel: -116, side: -1, value: facts.distractors[3] },
      { definition: definitions[3], travel: 96, side: 1, value: facts.distractors[4] }
    ];
    const distractorMarks = measuredLines.map(item => {
      const anchor = pointAt(item.definition.center, item.definition.angle, item.travel);
      const normal = item.definition.angle + item.side * 90;
      const end = pointAt(anchor, normal, 18);
      const labelPoint = pointAt(end, normal, 22);
      return `${svgLine(anchor, end, "pp-dimension", ` data-layout-ignore="true"`)}${rightMark(anchor, item.definition.angle, normal, 7)}${svgPlateText(labelPoint, `${item.value} cm`)}`;
    }).join("");
    const connectorMidpoint = point((connectorStart.x + connectorEnd.x) / 2, (connectorStart.y + connectorEnd.y) / 2);
    const distanceMark = `${svgLine(connectorStart, connectorEnd, solved ? "pp-answer" : "pp-dimension", ` data-distance-cm="${facts.distance}" data-layout-ignore="true"`)}${rightMark(connectorStart, targetAngle, normalAngle, 9)}${rightMark(connectorEnd, targetAngle, normalAngle, 9)}${svgPlateText(add(connectorMidpoint, pointAt(point(0, 0), targetAngle, 50)), `${facts.distance} cm`)}`;
    const answerNote = solved ? svgText(point(280, 370), `가 ∥ 나, 거리 ${facts.distance} cm`, "pp-note") : "";
    const model = { kind: "mission-1", lines: definitions.map(value => ({ name: value.name, angle: normalizeLine(value.angle) })), uniqueParallelPair: facts.pair, perpendicularDistance: facts.distance, answer: facts.answer };
    return wrapSvg("여러 직선에서 평행선 찾기", sourceItemId, poolIndex, solved, `${lineMarkup}${distanceMark}${distractorMarks}${answerNote}`, model, 560, 395);
  };

  const mission2Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const left = 80;
    const right = 480;
    const yTop = 65;
    const yBottom = 255;
    const positions = [left];
    let running = 0;
    facts.parts.forEach(part => {
      running += part;
      positions.push(left + (right - left) * running / facts.total);
    });
    const names = ["가", "나", "다", "라"];
    const lines = positions.map((x, index) => `${svgLine(point(x, yTop), point(x, yBottom), solved ? "pp-line pp-answer" : "pp-line", ` data-line-name="${names[index]}" data-line-angle="90"`)}${svgText(point(x, 43), names[index], "pp-name")}`).join("");
    const upper = svgPolyline(positions.map((x, index) => point(x, 215 - index * 42)));
    const totalDimension = dimension(point(left, 295), point(right, 295), `${facts.total} cm`, 0);
    const partLabels = solved ? facts.parts.map((part, index) => svgText(point((positions[index] + positions[index + 1]) / 2, 244), String(part), "pp-value pp-small")).join("") : "";
    const answerNote = solved ? svgText(point(280, 326), `나와 라 사이: ${facts.parts[1]} + ${facts.parts[2]} = ${facts.answer} cm`, "pp-note") : "";
    const model = { kind: "mission-2", ratio: [1, 2, 4], parts: facts.parts, total: facts.total, targetParts: facts.parts.slice(1), answer: facts.answer };
    return wrapSvg("네 평행선 사이 거리", sourceItemId, poolIndex, solved, `${lines}${upper}${totalDimension}${partLabels}${answerNote}`, model, 560, 350);
  };

  const mission3Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const topY = 48;
    const bottomY = 306;
    const scale = (bottomY - topY) / facts.total;
    const verticals = [facts.known[0], facts.known[1], facts.missing, facts.known[2]];
    const horizontalPixels = [72, 105, -92];
    const points = [point(155, topY)];
    let current = points[0];
    verticals.forEach((length, index) => {
      current = point(current.x, current.y + length * scale);
      points.push(current);
      if (index < horizontalPixels.length) {
        current = point(current.x + horizontalPixels[index], current.y);
        points.push(current);
      }
    });
    const outer = [point(155, topY), point(435, topY), point(475, bottomY), point(120, bottomY)];
    const verticalLabels = [];
    let y = topY;
    let x = 155;
    const verticalLabelOffsets = [-34, 34, 38, -36];
    verticals.forEach((length, index) => {
      const label = index === 2 && !solved ? "□ cm" : `${length} cm`;
      verticalLabels.push(svgText(point(x + verticalLabelOffsets[index], y + length * scale / 2), label));
      y += length * scale;
      if (index < horizontalPixels.length) x += horizontalPixels[index];
    });
    const firstHorizontalMidpoint = point((points[1].x + points[2].x) / 2, points[1].y - 18);
    const thirdHorizontalMidpoint = point((points[5].x + points[6].x) / 2, points[5].y + 20);
    const content = `${svgPolyline([...outer, outer[0]])}${svgPolyline(points)}${verticalLabels.join("")}${svgText(firstHorizontalMidpoint, `${facts.horizontal[0]} cm`)}${svgText(thirdHorizontalMidpoint, `${facts.horizontal[1]} cm`)}${dimension(outer[0], outer[1], `${facts.outer[0]} cm`, -12)}${dimension(outer[3], outer[2], `${facts.outer[1]} cm`, 13)}${dimension(outer[1], outer[2], `${facts.outer[2]} cm`, 26)}${solved ? svgText(point(280, 345), `□ = ${facts.answer} cm`, "pp-note") : ""}`;
    const model = { kind: "mission-3", verticalParts: verticals, known: facts.known, missing: facts.missing, farthestParallelDistance: facts.total, answer: facts.answer };
    return wrapSvg("꺾인 도형의 빈 길이", sourceItemId, poolIndex, solved, content, model, 560, 370);
  };

  const mission4Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const start = point(400, 55);
    const turn = point(235, 200);
    const end = point(400, 345);
    const angleFirst = angleOf(turn, start);
    const angleSecond = angleOf(turn, end);
    const firstMidpoint = point((start.x + turn.x) / 2, (start.y + turn.y) / 2);
    const secondMidpoint = point((turn.x + end.x) / 2, (turn.y + end.y) / 2);
    const content = `${svgPolyline([start, turn, end], solved ? "pp-answer" : "pp-line")}${rightMark(turn, angleFirst, angleSecond, 14)}${svgText(point(446, 42), "출발점", "pp-name")}${svgText(point(448, 363), "도착점", "pp-name")}${svgText(add(firstMidpoint, pointAt(point(0, 0), angleFirst - 90, 40)), `${facts.leg} m`)}${svgText(add(secondMidpoint, pointAt(point(0, 0), angleSecond + 90, 40)), `${facts.leg} m`)}${solved ? svgText(point(122, 205), `이동 ${facts.moveTime}초 + 회전 ${facts.turnTime}초`, "pp-note") : ""}`;
    const model = { kind: "mission-4", legLengths: [facts.leg, facts.leg], turnAngle: 90, moveSecondsPerMeter: facts.moveSeconds, turnUnit: facts.turnUnit, turnSecondsPerUnit: facts.turnSeconds, moveTime: facts.moveTime, turnTime: facts.turnTime, answer: facts.answer };
    return wrapSvg("수직인 두 길을 따라가는 시간", sourceItemId, poolIndex, solved, content, model, 560, 390);
  };

  const spiralPoints = lengths => {
    const points = [point(0, 0)];
    let direction = 0;
    lengths.forEach((length, index) => {
      if (index > 0) direction -= 90;
      points.push(pointAt(points[points.length - 1], direction, length));
    });
    return points;
  };

  const mission5Diagram = (facts, solved, sourceItemId, poolIndex) => {
    const raw = spiralPoints(facts.lengths);
    const fitted = fitPoints(raw, { left: 65, right: 495, top: 30, bottom: 310 });
    const labelOffsets = [point(0, 30), point(36, 0), point(0, -32)];
    const labels = facts.lengths.slice(0, 3).map((length, index) => {
      const a = fitted[index];
      const b = fitted[index + 1];
      const midpoint = point((a.x + b.x) / 2, (a.y + b.y) / 2);
      return svgText(add(midpoint, labelOffsets[index]), `${length} cm`, "pp-value pp-small");
    }).join("");
    const initialA = fitted[0];
    const initialB = fitted[1];
    const finalA = fitted[fitted.length - 2];
    const finalB = fitted[fitted.length - 1];
    const firstY = (initialA.y + initialB.y) / 2;
    const lastY = (finalA.y + finalB.y) / 2;
    const answerGuide = solved ? `${svgLine(point(55, firstY), point(510, firstY), "pp-guide")}${svgLine(point(55, lastY), point(510, lastY), "pp-guide")}${dimension(point(520, firstY), point(520, lastY), `${facts.answer} cm`, 0, true)}` : "";
    const content = `${svgPolyline(fitted)}${labels}${answerGuide}`;
    const model = { kind: "mission-5", lengths: facts.lengths, turns: facts.turns, turnDirection: "counterclockwise", perpendicularMoves: facts.perpendicularMoves, answer: facts.answer };
    return wrapSvg("길이가 늘어나는 수선", sourceItemId, poolIndex, solved, content, model, 560, 370);
  };

  const diagrams = Object.freeze({
    "example-1-1": example11Diagram,
    "example-1-2": example12Diagram,
    "example-1-3": example13Diagram,
    "example-1-4": (facts, solved, sourceItemId, poolIndex) => familyDiagram(facts.geometry, solved, sourceItemId, poolIndex, "example-1-4"),
    "mission-1": mission1Diagram,
    "mission-2": mission2Diagram,
    "mission-3": mission3Diagram,
    "mission-4": mission4Diagram,
    "mission-5": mission5Diagram,
    "mission-6": (facts, solved, sourceItemId, poolIndex) => familyDiagram(facts.geometry, solved, sourceItemId, poolIndex, "mission-6")
  });

  const promptFor = (kind, facts) => {
    if (kind === "example-1-1") return `그림에서 직선 가와 나는 서로 평행합니다. 두 직선 사이의 거리를 구하세요.`;
    if (kind === "example-1-2") return `그림에서 가장 먼 평행선 사이의 거리는 ${facts.total}cm입니다. □로 표시한 선분의 길이를 구하세요.`;
    if (kind === "example-1-3") return `서로 수직인 선분을 이어 그었습니다. 선분의 길이는 ${facts.start}cm부터 ${facts.step}cm씩 늘어나고, 선분은 모두 ${facts.count}개입니다. 가장 먼 평행선 사이의 거리를 구하세요.`;
    if (kind === "example-1-4") return "정육각형의 모든 변과 세 대각선을 직선으로 늘였습니다. 평행한 두 직선은 모두 몇 쌍인지 구하세요.";
    if (kind === "mission-1") return "그림의 직선 중 평행한 두 직선을 찾고, 두 직선 사이의 거리를 구하세요.";
    if (kind === "mission-2") return `직선 가, 나, 다, 라는 서로 평행합니다. 가와 라 사이의 거리는 ${facts.total}cm이고, 나와 다 사이는 가와 나 사이의 2배, 다와 라 사이는 나와 다 사이의 2배입니다. 나와 라 사이의 거리를 구하세요.`;
    if (kind === "mission-3") return `그림에서 가장 먼 평행선 사이의 거리는 ${facts.total}cm입니다. □로 표시한 선분의 길이를 구하세요.`;
    if (kind === "mission-4") return `로봇이 1m를 가는 데 ${facts.moveSeconds}초, 왼쪽으로 ${facts.turnUnit}° 방향을 바꾸는 데 ${facts.turnSeconds}초가 걸립니다. 두 길이 서로 수직일 때, 출발점에서 도착점까지 가는 데 걸리는 시간을 구하세요.`;
    if (kind === "mission-5") return `길이가 ${facts.start}cm인 선분의 끝에서 길이를 ${facts.step}cm씩 늘리며 시계 반대 방향으로 수선을 그었습니다. 수선을 ${facts.turns}번 그었을 때 처음 선분과 마지막 선분 사이의 거리를 구하세요.`;
    if (kind === "mission-6") return "그림의 각 선분을 직선으로 늘였습니다. 평행한 두 직선은 모두 몇 쌍인지 구하세요.";
    throw new Error(`문장을 만들 수 없는 유형입니다: ${kind}`);
  };

  const solutionFor = (kind, facts) => {
    if (kind === "example-1-1") return `135°와 이웃한 작은 각은 45°입니다. 빗선이 가로와 세로로 움직인 길이는 같으므로 두 직선 사이의 거리는 <span class="math-inline-expression">${facts.topPart}+${facts.bottomPart}=${facts.answer}</span>cm입니다.`;
    if (kind === "example-1-2") return `평행선 사이의 거리는 꺾인 수선의 세로 길이를 모두 더한 값입니다. <span class="math-inline-expression">${facts.total}-(${facts.known.join("+")})=${facts.answer}</span>cm입니다.`;
    if (kind === "example-1-3") return `가장 왼쪽과 가장 오른쪽의 세로선 사이 거리는 가로 선분의 길이를 모두 더한 값입니다. <span class="math-inline-expression">${facts.horizontalLengths.join("+")}=${facts.answer}</span>cm입니다.`;
    if (kind === "example-1-4") return `직선은 세 방향으로 나뉘고, 각 방향에는 서로 평행한 직선이 3개씩 있습니다. 한 방향에서 3쌍이므로 <span class="math-inline-expression">3×3=${facts.answer}</span>쌍입니다.`;
    if (kind === "mission-1") return `같은 방향인 직선은 가와 나뿐입니다. 두 직선에 수직인 선분의 길이가 ${facts.distance}cm이므로 답은 ${facts.answer}입니다.`;
    if (kind === "mission-2") return `가와 나 사이를 한 부분으로 보면 세 구간은 1:2:4입니다. 한 부분은 <span class="math-inline-expression">${facts.total}÷7=${facts.unit}</span>cm이고, 나와 라 사이는 6부분이므로 <span class="math-inline-expression">${facts.unit}×6=${facts.answer}</span>cm입니다.`;
    if (kind === "mission-3") return `위쪽과 아래쪽 평행선 사이의 수선은 ${facts.known.join("cm, ")}cm와 □cm로 나뉩니다. <span class="math-inline-expression">${facts.total}-(${facts.known.join("+")})=${facts.answer}</span>cm입니다.`;
    if (kind === "mission-4") return `이동 시간은 <span class="math-inline-expression">${facts.leg}×2×${facts.moveSeconds}=${facts.moveTime}</span>초입니다. 90°를 도는 시간은 <span class="math-inline-expression">90÷${facts.turnUnit}×${facts.turnSeconds}=${facts.turnTime}</span>초이므로 모두 ${facts.answer}초입니다.`;
    if (kind === "mission-5") return `처음 선분과 마지막 선분에 수직인 방향으로 움직인 길이는 <span class="math-inline-expression">${facts.perpendicularMoves.map(value => value < 0 ? `(${value})` : value).join("+")}=${facts.answer}</span>cm입니다.`;
    if (kind === "mission-6") return `직선은 세 방향으로 나뉘고 각 방향에 3개씩 있습니다. 한 방향마다 3쌍이므로 <span class="math-inline-expression">3×3=${facts.answer}</span>쌍입니다.`;
    throw new Error(`풀이를 만들 수 없는 유형입니다: ${kind}`);
  };

  const buildGenerated = (sourceItemId, poolIndex) => {
    const kind = KINDS[sourceItemId];
    if (!kind) throw new Error(`등록되지 않은 수선과 평행선 원문 ID입니다: ${sourceItemId}`);
    const pool = POOLS[kind];
    if (!pool || pool.length !== 3) throw new Error(`${sourceItemId}의 검증 풀이 정확히 3개가 아닙니다.`);
    const facts = deriveCase(kind, pool[poolIndex]);
    if (facts.answer !== facts.missing && (kind === "example-1-2" || kind === "mission-3")) throw new Error(`${sourceItemId}의 빈 길이 계산이 원자료와 다릅니다.`);
    const problemDiagram = diagrams[kind](facts, false, sourceItemId, poolIndex);
    const answerDiagram = diagrams[kind](facts, true, sourceItemId, poolIndex);
    const evidenceModel = { sourceItemId, kind, poolIndex, facts, answer: facts.answer, uniqueAnswerCount: 1 };
    const evidence = `<span hidden data-source-item="${esc(sourceItemId)}" data-pool-index="${poolIndex}" data-answer-contract="single" data-unique-answer-count="1" data-geometry-model="${encoded(evidenceModel)}"></span>`;
    return {
      prompt: `${promptFor(kind, facts)}${problemDiagram}${evidence}`,
      answer: facts.answer,
      solution: solutionFor(kind, facts),
      answerVisual: `<div class="verified-answer-diagram source42-perpendicular-parallel-answer" data-answer-source="${esc(sourceItemId)}" data-verified-pool-index="${poolIndex}">${answerDiagram}</div>`,
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
      difficultyEvidence: {
        sourceTier: "심화",
        sourceStructurePreserved: true,
        numericChangeOnly: false,
        figureRequired: true,
        sourceTask: sourceItemId.includes("mission") ? "Mission" : "예제"
      }
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
    if (api.__sourceGrade4AdvancedPerpendicularParallelInstalled) {
      markReady(targetRoot);
      return true;
    }
    const originalGeneratorKey = api.generatorKey.bind(api);
    const originalGenerate = api.generate.bind(api);
    api.generatorKey = type => SOURCE_ID_SET.has(type?.sourceItemId) || type?.generatorKey === GENERATOR_KEY
      ? GENERATOR_KEY
      : originalGeneratorKey(type);
    api.generate = (type, levelRank, difficultyOffset, seed, variant = 0) => {
      if (!SOURCE_ID_SET.has(type?.sourceItemId) && type?.generatorKey !== GENERATOR_KEY) return originalGenerate(type, levelRank, difficultyOffset, seed, variant);
      if (!SOURCE_ID_SET.has(type?.sourceItemId)) throw new Error(`허용되지 않은 ${GENERATOR_KEY} 원문 ID입니다: ${type?.sourceItemId || "없음"}`);
      const requestedVariant = Number.isInteger(variant) ? variant : Number.isInteger(type?.variant) ? type.variant : 0;
      const poolIndex = ((requestedVariant % 3) + 3) % 3;
      return buildGenerated(type.sourceItemId, poolIndex);
    };
    Object.defineProperty(api, "__sourceGrade4AdvancedPerpendicularParallelInstalled", { value: true, configurable: false });
    markReady(targetRoot);
    return true;
  };

  const exported = Object.freeze({
    GENERATOR_KEY,
    SOURCE_IDS,
    KINDS,
    POOLS,
    point,
    pointAt,
    angleOf,
    normalizeLine,
    deriveCase,
    regularHexagonModel,
    cubeProjectionModel,
    buildGenerated,
    markReady,
    install
  });
  root.HSE_SOURCE_42_PERPENDICULAR_PARALLEL = exported;
  install(root);
  return exported;
});
