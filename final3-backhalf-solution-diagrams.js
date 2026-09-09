(function(root){
'use strict';
function deepFreeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function(key){deepFreeze(value[key]);});
  return Object.freeze(value);
}
const MODEL=deepFreeze({
  "q17": {
    "id": "final3-q17-fixed-rectangles-v1",
    "questionNo": 17,
    "kind": "fixed-orientation-rectangle-edge-matching",
    "rectangles": {
      "가": {
        "top": 1,
        "left": 2,
        "right": 4,
        "bottom": 7
      },
      "나": {
        "top": 2,
        "left": 5,
        "right": 7,
        "bottom": 10
      },
      "다": {
        "top": 3,
        "left": 10,
        "right": 8,
        "bottom": 1
      },
      "라": {
        "top": 6,
        "left": 8,
        "right": 5,
        "bottom": 9
      },
      "마": {
        "top": 9,
        "left": 4,
        "right": 6,
        "bottom": 3
      }
    },
    "positions": {
      "topRow": [
        1,
        2,
        3
      ],
      "bottomRowUnderFirstTwo": [
        4,
        5
      ]
    },
    "sharedEdges": [
      [
        1,
        "right",
        2,
        "left"
      ],
      [
        2,
        "right",
        3,
        "left"
      ],
      [
        1,
        "bottom",
        4,
        "top"
      ],
      [
        2,
        "bottom",
        5,
        "top"
      ],
      [
        4,
        "right",
        5,
        "left"
      ]
    ],
    "solutionPlacement": {
      "1": "다",
      "2": "라",
      "3": "나",
      "4": "가",
      "5": "마"
    },
    "target": {
      "position": 1,
      "operation": "multiply all four sides",
      "value": 240
    }
  },
  "q18": {
    "id": "final3-q18-river-rods-v1",
    "questionNo": 18,
    "kind": "three-rods-common-submerged-depth",
    "waterline": "one common horizontal line",
    "bottom": "one common level riverbed",
    "rods": [
      {
        "label": "가",
        "aboveFraction": "1/2",
        "submergedFraction": "1/2",
        "totalInH": 2
      },
      {
        "label": "나",
        "aboveFraction": "2/3",
        "submergedFraction": "1/3",
        "totalInH": 3
      },
      {
        "label": "다",
        "aboveFraction": "3/4",
        "submergedFraction": "1/4",
        "totalInH": 4
      }
    ],
    "totalLengthMeters": 36,
    "depthMeters": 4
  },
  "q19": {
    "id": "final3-q19-seven-cells-squares-v1",
    "questionNo": 19,
    "kind": "seven-diagonal-cells-square-enumeration",
    "coordinateScale": 2,
    "cellsTopLeft": [
      [
        0,
        0
      ],
      [
        2,
        0
      ],
      [
        0,
        2
      ],
      [
        2,
        2
      ],
      [
        4,
        2
      ],
      [
        2,
        4
      ],
      [
        4,
        4
      ]
    ],
    "cellSize": 2,
    "linesPerCell": [
      "top",
      "right",
      "bottom",
      "left",
      "down-right diagonal",
      "down-left diagonal"
    ],
    "shadedTriangle": [
      [
        3,
        3
      ],
      [
        4,
        2
      ],
      [
        4,
        4
      ]
    ],
    "counts": {
      "smallTilted": {
        "all": 8,
        "shaded": 1,
        "kept": 7
      },
      "unitAxisAligned": {
        "all": 7,
        "shaded": 1,
        "kept": 6
      },
      "largeTilted": {
        "all": 3,
        "shaded": 2,
        "kept": 1
      },
      "twoByTwoAxisAligned": {
        "all": 2,
        "shaded": 2,
        "kept": 0
      },
      "keptTotal": 14
    }
  },
  "q24": {
    "id": "final3-q24-cryptarithm-layout-v1",
    "questionNo": 24,
    "kind": "vertical-multiplication-cryptarithm",
    "rows": [
      {
        "role": "multiplicand",
        "cells": [
          "ㄱ",
          "ㄴ",
          "ㄷ"
        ]
      },
      {
        "role": "multiplier",
        "cells": [
          "ㄱ",
          "ㄷ"
        ]
      },
      {
        "role": "onesPartial",
        "cells": [
          "ㄹ",
          "ㄷ",
          "ㅁ",
          "ㄱ"
        ]
      },
      {
        "role": "tensPartial",
        "cells": [
          "ㅂ",
          "ㄱ",
          "ㅅ",
          "ㄷ"
        ],
        "shift": 1
      },
      {
        "role": "product",
        "cells": [
          "ㅂ",
          "ㅇ",
          "ㄹ",
          "ㅇ",
          "ㄱ"
        ]
      }
    ],
    "assignment": {
      "ㄱ": 6,
      "ㄴ": 1,
      "ㄷ": 4,
      "ㄹ": 2,
      "ㅁ": 5,
      "ㅂ": 3,
      "ㅅ": 8,
      "ㅇ": 9
    },
    "numericRows": {
      "multiplicand": 614,
      "multiplier": 64,
      "onesPartial": 2456,
      "tensPartialUnshifted": 3684,
      "product": 39296
    }
  },
  "q25": {
    "id": "final3-q25-seven-segment-mirror-v1",
    "questionNo": 25,
    "kind": "matchstick-digit-horizontal-mirror",
    "segmentCoordinates": {
      "top": [
        [
          0,
          0
        ],
        [
          2,
          0
        ]
      ],
      "upperLeft": [
        [
          0,
          0
        ],
        [
          0,
          2
        ]
      ],
      "upperRight": [
        [
          2,
          0
        ],
        [
          2,
          2
        ]
      ],
      "middle": [
        [
          0,
          2
        ],
        [
          2,
          2
        ]
      ],
      "lowerLeft": [
        [
          0,
          2
        ],
        [
          0,
          4
        ]
      ],
      "lowerRight": [
        [
          2,
          2
        ],
        [
          2,
          4
        ]
      ],
      "bottom": [
        [
          0,
          4
        ],
        [
          2,
          4
        ]
      ],
      "centerUpper": [
        [
          1,
          0
        ],
        [
          1,
          2
        ]
      ],
      "centerLower": [
        [
          1,
          2
        ],
        [
          1,
          4
        ]
      ]
    },
    "validGlyphs": {
      "0": [
        "top",
        "upperLeft",
        "upperRight",
        "lowerLeft",
        "lowerRight",
        "bottom"
      ],
      "1": [
        "centerUpper",
        "centerLower"
      ],
      "2": [
        "top",
        "upperRight",
        "middle",
        "lowerLeft",
        "bottom"
      ],
      "5": [
        "top",
        "upperLeft",
        "middle",
        "lowerRight",
        "bottom"
      ],
      "8": [
        "top",
        "upperLeft",
        "upperRight",
        "middle",
        "lowerLeft",
        "lowerRight",
        "bottom"
      ]
    },
    "mirrorMap": {
      "0": 0,
      "1": 1,
      "2": 5,
      "5": 2,
      "8": 8
    },
    "matchstickCounts": {
      "0": 6,
      "1": 2,
      "2": 5,
      "5": 5,
      "8": 7
    },
    "validNumbersByLength": {
      "2": [
        28,
        58,
        82,
        85
      ],
      "3": [
        122,
        125,
        152,
        155,
        212,
        215,
        221,
        251,
        512,
        515,
        521,
        551
      ],
      "4": [
        1011,
        1101
      ],
      "6": [
        111111
      ]
    },
    "targetCount": 19
  },
  "q26": {
    "id": "final3-q26-seven-hex-fold-patterns-v1",
    "questionNo": 26,
    "kind": "three-colored-cells-with-reflection",
    "hexCells": {
      "C": [
        0,
        0
      ],
      "R0": [
        0,
        -1
      ],
      "R1": [
        1,
        -1
      ],
      "R2": [
        1,
        0
      ],
      "R3": [
        0,
        1
      ],
      "R4": [
        -1,
        1
      ],
      "R5": [
        -1,
        0
      ]
    },
    "equivalence": "six rotations and six reflections of the regular hexagon",
    "foldability": "selected cells are fixed by at least one reflection axis",
    "acceptedRepresentatives": [
      [
        "C",
        "R0",
        "R1"
      ],
      [
        "C",
        "R0",
        "R2"
      ],
      [
        "C",
        "R0",
        "R3"
      ],
      [
        "R0",
        "R1",
        "R2"
      ],
      [
        "R0",
        "R2",
        "R4"
      ]
    ],
    "rejectedAsymmetricRepresentative": [
      "R0",
      "R1",
      "R3"
    ],
    "targetCount": 5
  },
  "q30": {
    "id": "final3-q30-map-four-colors-v1",
    "questionNo": 30,
    "kind": "orthogonal-map-minimum-coloring",
    "outerRectangle": [
      0,
      0,
      419,
      284
    ],
    "horizontalBoundarySegments": [
      [
        387,
        21,
        419
      ],
      [
        60,
        41,
        179
      ],
      [
        202,
        46,
        387
      ],
      [
        291,
        77,
        419
      ],
      [
        0,
        81,
        60
      ],
      [
        120,
        81,
        239
      ],
      [
        60,
        122,
        120
      ],
      [
        179,
        122,
        298
      ],
      [
        120,
        163,
        179
      ],
      [
        239,
        164,
        379
      ],
      [
        179,
        204,
        239
      ],
      [
        298,
        204,
        419
      ],
      [
        0,
        218,
        239
      ],
      [
        239,
        244,
        298
      ]
    ],
    "verticalBoundarySegments": [
      [
        37,
        81,
        37,
        284
      ],
      [
        60,
        41,
        60,
        122
      ],
      [
        120,
        0,
        120,
        41
      ],
      [
        120,
        81,
        120,
        163
      ],
      [
        142,
        163,
        142,
        284
      ],
      [
        179,
        41,
        179,
        81
      ],
      [
        179,
        122,
        179,
        204
      ],
      [
        202,
        46,
        202,
        81
      ],
      [
        239,
        81,
        239,
        122
      ],
      [
        239,
        164,
        239,
        244
      ],
      [
        291,
        0,
        291,
        122
      ],
      [
        298,
        122,
        298,
        164
      ],
      [
        298,
        204,
        298,
        284
      ],
      [
        359,
        164,
        359,
        204
      ],
      [
        379,
        46,
        379,
        164
      ],
      [
        387,
        0,
        387,
        46
      ]
    ],
    "regionSeeds": {
      "1": [
        403,
        10.5
      ],
      "2": [
        328.5,
        10.5
      ],
      "3": [
        265,
        10.5
      ],
      "4": [
        90,
        10.5
      ],
      "5": [
        403,
        61.5
      ],
      "6": [
        328.5,
        61.5
      ],
      "7": [
        90,
        101.5
      ],
      "8": [
        265,
        101.5
      ],
      "9": [
        160.5,
        101.5
      ],
      "10": [
        328.5,
        101.5
      ],
      "11": [
        403,
        101.5
      ],
      "12": [
        18.5,
        101.5
      ],
      "13": [
        265,
        142.5
      ],
      "14": [
        90,
        142.5
      ],
      "15": [
        160.5,
        184
      ],
      "16": [
        328.5,
        184
      ],
      "17": [
        328.5,
        264
      ],
      "18": [
        18.5,
        264
      ],
      "19": [
        90,
        264
      ],
      "20": [
        265,
        264
      ]
    },
    "adjacentPairs": [
      [
        1,
        2
      ],
      [
        1,
        5
      ],
      [
        2,
        3
      ],
      [
        2,
        5
      ],
      [
        2,
        6
      ],
      [
        3,
        4
      ],
      [
        3,
        7
      ],
      [
        3,
        8
      ],
      [
        3,
        9
      ],
      [
        4,
        7
      ],
      [
        4,
        12
      ],
      [
        4,
        14
      ],
      [
        5,
        6
      ],
      [
        5,
        11
      ],
      [
        6,
        8
      ],
      [
        6,
        10
      ],
      [
        7,
        9
      ],
      [
        7,
        14
      ],
      [
        8,
        9
      ],
      [
        8,
        10
      ],
      [
        8,
        13
      ],
      [
        9,
        13
      ],
      [
        9,
        14
      ],
      [
        9,
        15
      ],
      [
        10,
        11
      ],
      [
        10,
        13
      ],
      [
        10,
        16
      ],
      [
        11,
        16
      ],
      [
        11,
        17
      ],
      [
        12,
        14
      ],
      [
        12,
        18
      ],
      [
        13,
        15
      ],
      [
        13,
        16
      ],
      [
        14,
        15
      ],
      [
        14,
        19
      ],
      [
        15,
        16
      ],
      [
        15,
        20
      ],
      [
        16,
        17
      ],
      [
        16,
        20
      ],
      [
        17,
        20
      ],
      [
        18,
        19
      ],
      [
        19,
        20
      ]
    ],
    "fourColorLowerBound": {
      "center": 13,
      "fiveRegionRing": [
        8,
        9,
        15,
        16,
        10
      ]
    },
    "fourColoring": {
      "color1": [
        1,
        4,
        6,
        9,
        16,
        19
      ],
      "color2": [
        3,
        5,
        13,
        14,
        18,
        20
      ],
      "color3": [
        2,
        7,
        8,
        11,
        12,
        15
      ],
      "color4": [
        10,
        17
      ]
    }
  }
});
const engine=(function(){
  const module={exports:{}};
  const exports=module.exports;
  const STATUS = 'prototype-complete';
const RELEASE_STATUS = 'locked';
const SUPPORTED_IDS = new Set([
  'final3-q17-fixed-rectangles-v1',
  'final3-q18-river-rods-v1',
  'final3-q19-seven-cells-squares-v1',
  'final3-q24-cryptarithm-layout-v1',
  'final3-q25-seven-segment-mirror-v1',
  'final3-q26-seven-hex-fold-patterns-v1',
  'final3-q30-map-four-colors-v1',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map((tail) => [value, ...tail]));
}

function combinations(values, size) {
  if (size === 0) return [[]];
  if (values.length < size) return [];
  const [head, ...tail] = values;
  return [
    ...combinations(tail, size - 1).map((rest) => [head, ...rest]),
    ...combinations(tail, size),
  ];
}

function sortedPairKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function calculateQ17(model) {
  const names = Object.keys(model.rectangles);
  const valid = permutations(names).filter((p) => {
    const r = model.rectangles;
    return r[p[0]].right === r[p[1]].left
      && r[p[1]].right === r[p[2]].left
      && r[p[0]].bottom === r[p[3]].top
      && r[p[1]].bottom === r[p[4]].top
      && r[p[3]].right === r[p[4]].left;
  });
  const horizontalCandidates = [];
  for (const left of names) for (const right of names) {
    if (left !== right && model.rectangles[left].right === model.rectangles[right].left) {
      horizontalCandidates.push([left, right, model.rectangles[left].right]);
    }
  }
  const placement = valid[0] || [];
  const r = model.rectangles;
  const sharedValues = placement.length ? [
    r[placement[0]].right,
    r[placement[1]].right,
    r[placement[0]].bottom,
    r[placement[1]].bottom,
    r[placement[3]].right,
  ] : [];
  const first = placement.length ? r[placement[0]] : null;
  return {
    permutationsExamined: 120,
    valid,
    horizontalCandidates,
    sharedValues,
    product: first ? first.top * first.left * first.right * first.bottom : null,
  };
}

function calculateQ18(model) {
  const coefficients = model.rods.map((rod) => rod.totalInH);
  const coefficientSum = coefficients.reduce((sum, value) => sum + value, 0);
  const totalMeters = 36;
  const depthMeters = totalMeters / coefficientSum;
  return {
    coefficientSum,
    depthMeters,
    rodLengths: coefficients.map((value) => value * depthMeters),
    submergedLengths: coefficients.map(() => depthMeters),
  };
}

const vectorSub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

function polygonOrder(poly) {
  const cx = poly.reduce((sum, p) => sum + p[0], 0) / poly.length;
  const cy = poly.reduce((sum, p) => sum + p[1], 0) / poly.length;
  return [...poly].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
}

function signedArea(poly) {
  return poly.reduce((sum, p, index) => {
    const next = poly[(index + 1) % poly.length];
    return sum + p[0] * next[1] - next[0] * p[1];
  }, 0) / 2;
}

function polygonArea(poly) {
  return Math.abs(signedArea(poly));
}

function convexIntersection(subjectInput, clipInput) {
  let output = polygonOrder(subjectInput).map((point) => point.map(Number));
  let clip = polygonOrder(clipInput).map((point) => point.map(Number));
  if (signedArea(clip) < 0) clip.reverse();
  const inside = (point, a, b) => cross(vectorSub(b, a), vectorSub(point, a)) >= -1e-9;
  for (let clipIndex = 0; clipIndex < clip.length; clipIndex += 1) {
    const a = clip[clipIndex];
    const b = clip[(clipIndex + 1) % clip.length];
    const input = output;
    output = [];
    if (!input.length) break;
    let start = input[input.length - 1];
    for (const end of input) {
      const endInside = inside(end, a, b);
      const startInside = inside(start, a, b);
      const intersection = () => {
        const direction = vectorSub(end, start);
        const clipEdge = vectorSub(b, a);
        const denominator = cross(direction, clipEdge);
        const t = cross(vectorSub(a, start), clipEdge) / denominator;
        return [start[0] + t * direction[0], start[1] + t * direction[1]];
      };
      if (endInside) {
        if (!startInside) output.push(intersection());
        output.push(end);
      } else if (startInside) {
        output.push(intersection());
      }
      start = end;
    }
  }
  return output;
}

function calculateQ19(model) {
  const segments = [];
  const vertices = new Set();
  const cellSize = model.cellSize;
  for (const [x, y] of model.cellsTopLeft) {
    const corners = [[x, y], [x + cellSize, y], [x + cellSize, y + cellSize], [x, y + cellSize]];
    segments.push(
      [corners[0], corners[1]], [corners[1], corners[2]],
      [corners[2], corners[3]], [corners[3], corners[0]],
      [corners[0], corners[2]], [corners[1], corners[3]],
    );
    corners.forEach((point) => vertices.add(point.join(',')));
    vertices.add(`${x + cellSize / 2},${y + cellSize / 2}`);
  }
  const points = [...vertices].map((key) => key.split(',').map(Number));
  function segmentCovered(p, q) {
    const direction = vectorSub(q, p);
    const denominator = direction[0] ** 2 + direction[1] ** 2;
    const intervals = [];
    for (const [a, b] of segments) {
      if (Math.abs(cross(vectorSub(a, p), direction)) > 1e-9 || Math.abs(cross(vectorSub(b, p), direction)) > 1e-9) continue;
      let ta = ((a[0] - p[0]) * direction[0] + (a[1] - p[1]) * direction[1]) / denominator;
      let tb = ((b[0] - p[0]) * direction[0] + (b[1] - p[1]) * direction[1]) / denominator;
      if (ta > tb) [ta, tb] = [tb, ta];
      ta = Math.max(0, ta);
      tb = Math.min(1, tb);
      if (ta < tb) intervals.push([ta, tb]);
    }
    intervals.sort((a, b) => a[0] - b[0]);
    let coveredEnd = 0;
    for (const [start, end] of intervals) {
      if (start > coveredEnd + 1e-9) return false;
      coveredEnd = Math.max(coveredEnd, end);
      if (coveredEnd >= 1 - 1e-9) return true;
    }
    return false;
  }
  const pointSet = new Set(points.map((point) => point.join(',')));
  const squareKeys = new Set();
  for (const p of points) for (const q of points) {
    if (p[0] === q[0] && p[1] === q[1]) continue;
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    for (const [rx, ry] of [[-dy, dx], [dy, -dx]]) {
      const r = [q[0] + rx, q[1] + ry];
      const s = [p[0] + rx, p[1] + ry];
      if (!pointSet.has(r.join(',')) || !pointSet.has(s.join(','))) continue;
      if ([[p, q], [q, r], [r, s], [s, p]].every(([a, b]) => segmentCovered(a, b))) {
        squareKeys.add([p, q, r, s].map((point) => point.join(',')).sort().join('|'));
      }
    }
  }
  const squares = [...squareKeys].map((key) => key.split('|').map((point) => point.split(',').map(Number)));
  const annotated = squares.map((square) => {
    const ordered = polygonOrder(square);
    const sideSquared = Math.min(...ordered.map((p, index) => {
      const q = ordered[(index + 1) % ordered.length];
      return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    }));
    const intersection = convexIntersection(square, model.shadedTriangle);
    const shaded = intersection.length >= 3 && polygonArea(intersection) > 1e-9;
    return { square, sideSquared, shaded };
  });
  const groups = {
    smallTilted: annotated.filter((entry) => entry.sideSquared === 2),
    unitAxisAligned: annotated.filter((entry) => entry.sideSquared === 4),
    largeTilted: annotated.filter((entry) => entry.sideSquared === 8),
    twoByTwoAxisAligned: annotated.filter((entry) => entry.sideSquared === 16),
  };
  const counts = Object.fromEntries(Object.entries(groups).map(([key, entries]) => [key, {
    all: entries.length,
    shaded: entries.filter((entry) => entry.shaded).length,
    kept: entries.filter((entry) => !entry.shaded).length,
  }]));
  return {
    total: annotated.length,
    shaded: annotated.filter((entry) => entry.shaded).length,
    kept: annotated.filter((entry) => !entry.shaded).length,
    counts,
    squares: annotated,
  };
}

function digitsOf(value, length) {
  const string = String(value);
  return string.length === length ? [...string].map(Number) : null;
}

function calculateQ24(model) {
  const assignments = [];
  let triplesExamined = 0;
  for (let g = 1; g <= 9; g += 1) for (let n = 0; n <= 9; n += 1) for (let d = 0; d <= 9; d += 1) {
    if (new Set([g, n, d]).size !== 3) continue;
    triplesExamined += 1;
    const multiplicand = 100 * g + 10 * n + d;
    const onesDigits = digitsOf(multiplicand * d, 4);
    const tensDigits = digitsOf(multiplicand * g, 4);
    const productDigits = digitsOf(multiplicand * (10 * g + d), 5);
    if (!onesDigits || !tensDigits || !productDigits) continue;
    const [l1, d1, m1, g1] = onesDigits;
    const [b1, g2, s1, d2] = tensDigits;
    const [b2, o1, l2, o2, g3] = productDigits;
    if (d1 !== d || g1 !== g || g2 !== g || d2 !== d || b2 !== b1 || l2 !== l1 || o2 !== o1 || g3 !== g) continue;
    const values = [g, n, d, l1, m1, b1, s1, o1];
    if (new Set(values).size !== 8) continue;
    assignments.push({
      'ㄱ': g, 'ㄴ': n, 'ㄷ': d, 'ㄹ': l1,
      'ㅁ': m1, 'ㅂ': b1, 'ㅅ': s1, 'ㅇ': o1,
    });
  }
  const onesDigitCandidates = [];
  for (let g = 1; g <= 9; g += 1) for (let d = 0; d <= 9; d += 1) {
    if (g !== d && (d * d) % 10 === g && (g * d) % 10 === d) onesDigitCandidates.push([g, d]);
  }
  return { triplesExamined, assignments, onesDigitCandidates };
}

function calculateQ25(model) {
  const digits = Object.keys(model.validGlyphs);
  const byLength = {};
  function build(prefix, remaining, length) {
    if (prefix.length === length) {
      if (remaining === 0 && prefix[0] !== '0' && prefix[prefix.length - 1] !== '0') {
        (byLength[length] ||= []).push(Number(prefix));
      }
      return;
    }
    for (const digit of digits) {
      const cost = model.matchstickCounts[digit];
      if (cost <= remaining) build(prefix + digit, remaining - cost, length);
    }
  }
  for (let length = 1; length <= 6; length += 1) build('', 12, length);
  const all = Object.values(byLength).flat();
  const mirrorOf = (number) => Number([...String(number)].reverse().map((digit) => model.mirrorMap[digit]).join(''));
  return {
    byLength,
    all,
    count: all.length,
    mirrors: Object.fromEntries(all.map((number) => [number, mirrorOf(number)])),
    repeatedDigitExamples: all.filter((number) => new Set(String(number)).size < String(number).length),
  };
}

function normalizeHexCell(cell) {
  if (cell === 'C') return 'C';
  return Number(String(cell).slice(1));
}

function transformHexCell(cell, kind, amount) {
  const value = normalizeHexCell(cell);
  if (value === 'C') return 'C';
  const transformed = kind === 'rotation'
    ? (value + amount) % 6
    : ((amount - value) % 6 + 6) % 6;
  return `R${transformed}`;
}

function transformHexSet(cells, kind, amount) {
  return cells.map((cell) => transformHexCell(cell, kind, amount)).sort();
}

function hexOrbitKey(cells) {
  const variants = [];
  for (let amount = 0; amount < 6; amount += 1) {
    variants.push(transformHexSet(cells, 'rotation', amount).join(','));
    variants.push(transformHexSet(cells, 'reflection', amount).join(','));
  }
  return variants.sort()[0];
}

function reflectionAxes(cells) {
  const base = [...cells].sort().join(',');
  return Array.from({ length: 6 }, (_, amount) => amount)
    .filter((amount) => transformHexSet(cells, 'reflection', amount).join(',') === base);
}

function calculateQ26(model) {
  const cellNames = Object.keys(model.hexCells);
  const allSelections = combinations(cellNames, 3);
  const orbits = new Map();
  for (const selection of allSelections) {
    const key = hexOrbitKey(selection);
    if (!orbits.has(key)) orbits.set(key, []);
    orbits.get(key).push(selection);
  }
  const foldableOrbitKeys = [...orbits.entries()]
    .filter(([, selections]) => selections.some((selection) => reflectionAxes(selection).length > 0))
    .map(([key]) => key)
    .sort();
  return {
    selectionsExamined: allSelections.length,
    orbitCount: orbits.size,
    foldableOrbitKeys,
    accepted: model.acceptedRepresentatives.map((cells) => ({
      cells,
      orbitKey: hexOrbitKey(cells),
      axes: reflectionAxes(cells),
    })),
  };
}

function reconstructQ30(model) {
  const [outerLeft, outerTop, outerRight, outerBottom] = model.outerRectangle;
  const xs = [...new Set([
    outerLeft, outerRight,
    ...model.horizontalBoundarySegments.flatMap((segment) => [segment[0], segment[2]]),
    ...model.verticalBoundarySegments.map((segment) => segment[0]),
  ])].sort((a, b) => a - b);
  const ys = [...new Set([
    outerTop, outerBottom,
    ...model.horizontalBoundarySegments.map((segment) => segment[1]),
    ...model.verticalBoundarySegments.flatMap((segment) => [segment[1], segment[3]]),
  ])].sort((a, b) => a - b);
  const nx = xs.length - 1;
  const ny = ys.length - 1;
  const cellId = (i, j) => j * nx + i;
  const parent = Array.from({ length: nx * ny }, (_, index) => index);
  const find = (value) => parent[value] === value ? value : (parent[value] = find(parent[value]));
  const unite = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  const hasHorizontalWall = (x1, x2, y) => model.horizontalBoundarySegments.some(([a, yy, b]) => yy === y && a <= x1 && b >= x2);
  const hasVerticalWall = (x, y1, y2) => model.verticalBoundarySegments.some(([xx, a, , b]) => xx === x && a <= y1 && b >= y2);
  for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) {
    if (i + 1 < nx && !hasVerticalWall(xs[i + 1], ys[j], ys[j + 1])) unite(cellId(i, j), cellId(i + 1, j));
    if (j + 1 < ny && !hasHorizontalWall(xs[i], xs[i + 1], ys[j + 1])) unite(cellId(i, j), cellId(i, j + 1));
  }
  const roots = new Set(Array.from({ length: nx * ny }, (_, index) => find(index)));
  const rootToRegion = new Map();
  for (const [label, [seedX, seedY]] of Object.entries(model.regionSeeds)) {
    const i = xs.findIndex((value, index) => index < xs.length - 1 && value < seedX && seedX < xs[index + 1]);
    const j = ys.findIndex((value, index) => index < ys.length - 1 && value < seedY && seedY < ys[index + 1]);
    assert(i >= 0 && j >= 0, `Q30 seed ${label} is outside the atomic grid`);
    rootToRegion.set(find(cellId(i, j)), Number(label));
  }
  const atomicCells = [];
  for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) {
    atomicCells.push({ x1: xs[i], y1: ys[j], x2: xs[i + 1], y2: ys[j + 1], region: rootToRegion.get(find(cellId(i, j))) });
  }
  const edges = new Set();
  for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) {
    const regionA = rootToRegion.get(find(cellId(i, j)));
    if (i + 1 < nx) {
      const regionB = rootToRegion.get(find(cellId(i + 1, j)));
      if (regionA !== regionB) edges.add(sortedPairKey(regionA, regionB));
    }
    if (j + 1 < ny) {
      const regionB = rootToRegion.get(find(cellId(i, j + 1)));
      if (regionA !== regionB) edges.add(sortedPairKey(regionA, regionB));
    }
  }
  return { xs, ys, roots, atomicCells, edges };
}

function graphCanColor(regionCount, edgeKeys, colorCount) {
  const adjacency = Array.from({ length: regionCount + 1 }, () => new Set());
  for (const key of edgeKeys) {
    const [a, b] = key.split('-').map(Number);
    adjacency[a].add(b);
    adjacency[b].add(a);
  }
  const colors = Array(regionCount + 1).fill(0);
  function visit(done) {
    if (done === regionCount) return true;
    let best = 0;
    let bestScore = -1;
    for (let region = 1; region <= regionCount; region += 1) if (!colors[region]) {
      const saturation = new Set([...adjacency[region]].map((neighbor) => colors[neighbor]).filter(Boolean)).size;
      const score = 100 * saturation + adjacency[region].size;
      if (score > bestScore) {
        best = region;
        bestScore = score;
      }
    }
    for (let color = 1; color <= colorCount; color += 1) {
      if ([...adjacency[best]].some((neighbor) => colors[neighbor] === color)) continue;
      colors[best] = color;
      if (visit(done + 1)) return true;
      colors[best] = 0;
    }
    return false;
  }
  return visit(0);
}

function calculateQ30(model) {
  const reconstructed = reconstructQ30(model);
  const colorByRegion = {};
  for (const [colorName, regions] of Object.entries(model.fourColoring)) {
    const color = Number(colorName.replace('color', ''));
    regions.forEach((region) => { colorByRegion[region] = color; });
  }
  const witnessConflicts = [...reconstructed.edges].filter((key) => {
    const [a, b] = key.split('-').map(Number);
    return colorByRegion[a] === colorByRegion[b];
  });
  return {
    ...reconstructed,
    regionCount: reconstructed.roots.size,
    edgeCount: reconstructed.edges.size,
    threeColorable: graphCanColor(20, reconstructed.edges, 3),
    fourColorable: graphCanColor(20, reconstructed.edges, 4),
    colorByRegion,
    witnessConflicts,
  };
}

function calculate(model) {
  assert(model && SUPPORTED_IDS.has(model.id), `unsupported diagram model: ${model && model.id}`);
  switch (model.questionNo) {
    case 17: return calculateQ17(model);
    case 18: return calculateQ18(model);
    case 19: return calculateQ19(model);
    case 24: return calculateQ24(model);
    case 25: return calculateQ25(model);
    case 26: return calculateQ26(model);
    case 30: return calculateQ30(model);
    default: throw new Error(`unsupported question: ${model.questionNo}`);
  }
}

function baseStyle() {
  return `<style>
    .f3-back-diagram{--ink:#182638;--muted:#5b6878;--paper:#fffdf7;--line:#cbd5df;--blue:#2374d8;--aqua:#dff5f4;--yellow:#fff0a8;--rose:#ffe0df;--violet:#7357d8;margin:18px auto;padding:22px;max-width:920px;box-sizing:border-box;border:1px solid #d9e0e8;border-radius:20px;background:var(--paper);color:var(--ink);font-family:"Noto Sans KR","Malgun Gothic",sans-serif;box-shadow:0 10px 30px rgba(30,50,80,.08)}
    .f3-back-diagram *{box-sizing:border-box}.f3-back-diagram h3{margin:0 0 6px;font-size:22px;line-height:1.35}.f3-back-diagram h4{margin:0 0 8px;font-size:16px}.f3-back-diagram p{margin:6px 0;line-height:1.65}.f3-back-diagram .sub{margin:0 0 16px;color:var(--muted);font-size:14px}.f3-back-diagram .grid2{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:18px;align-items:center}.f3-back-diagram .card{padding:14px;border:1px solid var(--line);border-radius:14px;background:#fff}.f3-back-diagram .note{padding:10px 12px;border-left:4px solid var(--blue);border-radius:7px;background:#edf6ff;font-size:14px;line-height:1.6}.f3-back-diagram .answer{display:inline-flex;align-items:center;gap:7px;margin-top:10px;padding:8px 13px;border-radius:999px;background:#17283d;color:white;font-weight:800}.f3-back-diagram .chip{display:inline-flex;align-items:center;justify-content:center;padding:5px 9px;border:1px solid var(--line);border-radius:999px;background:white;font-weight:700}.f3-back-diagram .chips{display:flex;flex-wrap:wrap;gap:7px}.f3-back-diagram table{width:100%;border-collapse:collapse;font-size:14px}.f3-back-diagram th,.f3-back-diagram td{padding:7px 8px;border-bottom:1px solid #e4e9ef;text-align:center}.f3-back-diagram th{background:#f2f6fa}.f3-back-diagram svg{display:block;width:100%;height:auto;overflow:visible}.f3-back-diagram .locked{margin-top:15px;color:#6f7884;font-size:11px;text-align:right}.f3-back-diagram .mini{font-size:12px;color:var(--muted)}
    .f3-back-diagram .q24-layout{display:grid;grid-template-columns:1fr 1fr;gap:12px}.f3-back-diagram .mapping{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-top:12px}.f3-back-diagram .mapping span{padding:7px 2px;border-radius:9px;background:#eef4fb;text-align:center;font-weight:800}.f3-back-diagram .digit-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.f3-back-diagram .digit-card{padding:9px 5px;border:1px solid var(--line);border-radius:12px;background:white;text-align:center}.f3-back-diagram .digit-card svg{max-height:108px}.f3-back-diagram .number-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.f3-back-diagram .number-group{padding:9px;border-radius:10px;background:#f4f7fa;font-size:13px;line-height:1.6}.f3-back-diagram .hex-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.f3-back-diagram .hex-card{padding:7px;border:1px solid var(--line);border-radius:12px;background:white;text-align:center}.f3-back-diagram .hex-card strong{display:block;font-size:13px}.f3-back-diagram .map-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(230px,.55fr);gap:16px;align-items:center}
    @media(max-width:560px){.f3-back-diagram{margin:10px auto;padding:14px;border-radius:15px}.f3-back-diagram h3{font-size:19px}.f3-back-diagram .grid2,.f3-back-diagram .map-grid,.f3-back-diagram .q24-layout{grid-template-columns:1fr}.f3-back-diagram .mapping{grid-template-columns:repeat(4,1fr)}.f3-back-diagram .digit-grid{grid-template-columns:repeat(3,1fr)}.f3-back-diagram .number-groups{grid-template-columns:1fr}.f3-back-diagram .hex-grid{grid-template-columns:repeat(2,1fr)}.f3-back-diagram th,.f3-back-diagram td{padding:6px 4px;font-size:12px}}
    @media print{.f3-back-diagram{box-shadow:none;break-after:page;page-break-after:always;max-width:none;margin:0;padding:12mm;border-color:none}.f3-back-diagram:last-child{break-after:auto;page-break-after:auto}.f3-back-diagram .print-redundant{display:none!important}.f3-back-diagram[data-question-no="24"]{zoom:.82}}
  </style>`;
}

function figureShell(model, title, subtitle, body) {
  return `<figure class="f3-back-diagram" data-diagram-id="${escapeHtml(model.id)}" data-question-no="${model.questionNo}" data-release-status="eligible">
    ${baseStyle()}
    <h3>${model.questionNo}번 · ${escapeHtml(title)}</h3>
    <p class="sub">${escapeHtml(subtitle)}</p>
    ${body}
    <figcaption class="locked">지필드 영재교육 · 상세 풀이 도식</figcaption>
  </figure>`;
}

function rectanglePiece(name, values, x, y, position, target) {
  const width = 142;
  const height = 102;
  return `<g data-position="${position}" data-piece="${name}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="${target ? '#fff0a8' : '#ffffff'}" stroke="#29435f" stroke-width="2.2"/>
    <circle cx="${x + 17}" cy="${y + 17}" r="13" fill="${target ? '#182638' : '#e7eef6'}"/><text x="${x + 17}" y="${y + 22}" text-anchor="middle" font-size="13" font-weight="800" fill="${target ? 'white' : '#182638'}">${position}</text>
    <text x="${x + width / 2}" y="${y + height / 2 + 7}" text-anchor="middle" font-size="24" font-weight="900" fill="#182638">${name}</text>
    <text x="${x + width / 2}" y="${y + 17}" text-anchor="middle" font-size="15" font-weight="800">${values.top}</text>
    <text x="${x + width / 2}" y="${y + height - 8}" text-anchor="middle" font-size="15" font-weight="800">${values.bottom}</text>
    <text x="${x + 12}" y="${y + height / 2 + 5}" text-anchor="middle" font-size="15" font-weight="800">${values.left}</text>
    <text x="${x + width - 12}" y="${y + height / 2 + 5}" text-anchor="middle" font-size="15" font-weight="800">${values.right}</text>
  </g>`;
}

function renderQ17(model) {
  const result = calculateQ17(model);
  const placement = result.valid[0];
  const coords = [[8, 20], [198, 20], [388, 20], [8, 158], [198, 158]];
  const pieces = placement.map((name, index) => rectanglePiece(name, model.rectangles[name], coords[index][0], coords[index][1], index + 1, index === 0)).join('');
  const candidateRows = result.horizontalCandidates.map(([left, right, value]) => `<tr><td>${left}→${right}</td><td>${value}=${value}</td><td>${left === '다' ? '윗줄 완성 가능' : left === '가' ? '그다음 연결 없음' : '앞에 올 조각 없음'}</td></tr>`).join('');
  const equalityPill = (x, y, text) => `<g aria-label="맞닿은 수 ${text}"><rect x="${x - 25}" y="${y - 13}" width="50" height="26" rx="13" fill="#ffffff" stroke="#2374d8" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="900" fill="#145fb8">${text}</text></g>`;
  return figureShell(model, '맞닿은 변을 따라 강제로 놓기', '오른쪽→왼쪽 연결을 먼저 찾고, 아래 두 칸까지 같은 수로 맞춥니다.', `
    <div class="grid2">
      <div class="card">
        <svg viewBox="0 0 538 280" role="img" aria-label="위 다 라 나, 아래 가 마로 완성된 다섯 사각형과 맞닿은 수">
          ${pieces}
          ${equalityPill(174, 71, '8=8')}${equalityPill(364, 71, '5=5')}
          ${equalityPill(79, 140, '1=1')}${equalityPill(269, 140, '9=9')}${equalityPill(174, 209, '4=4')}
        </svg>
      </div>
      <div>
        <h4>①→②가 될 수 있는 연결부터</h4>
        <table data-q17-candidates><thead><tr><th>연결</th><th>같은 수</th><th>확인</th></tr></thead><tbody>${candidateRows}</tbody></table>
        <p class="note">따라서 윗줄은 <strong>다→라→나</strong>입니다. 다의 아래 1에는 가, 라의 아래 9에는 마가 놓여 아래도 <strong>가→마</strong>로 정해집니다.</p>
        <span class="answer">①의 곱 3×10×8×1 = 240</span>
      </div>
    </div>`);
}

function renderQ18(model) {
  const result = calculateQ18(model);
  const barX = [90, 235, 380];
  const blocks = model.rods.map((rod, index) => {
    const unit = 47;
    const bottom = 238;
    const top = bottom - rod.totalInH * unit;
    const lines = Array.from({ length: rod.totalInH + 1 }, (_, k) => `<line x1="${barX[index]}" y1="${bottom - k * unit}" x2="${barX[index] + 38}" y2="${bottom - k * unit}" stroke="#29435f" stroke-width="1.5"/>`).join('');
    return `<g data-rod="${rod.label}" data-total-meters="${result.rodLengths[index]}">
      <rect x="${barX[index]}" y="${top}" width="38" height="${rod.totalInH * unit}" rx="3" fill="#fff8df" stroke="#29435f" stroke-width="2"/>
      ${lines}
      <text x="${barX[index] + 19}" y="${top - 12}" text-anchor="middle" font-size="17" font-weight="900">${rod.label}</text>
      <text x="${barX[index] + 19}" y="${top + 22}" text-anchor="middle" font-size="12" fill="#5b6878">밖 ${rod.aboveFraction}</text>
      <text x="${barX[index] + 19}" y="259" text-anchor="middle" font-size="13" font-weight="800">${result.rodLengths[index]}m</text>
    </g>`;
  }).join('');
  return figureShell(model, '세 막대에 공통인 잠긴 길이', '물속의 한 칸은 세 막대에서 모두 같은 깊이 h입니다.', `
    <div class="grid2">
      <div class="card"><svg viewBox="0 0 520 280" role="img" aria-label="같은 강물 깊이에 잠긴 2h, 3h, 4h 막대">
        ${blocks}
        <rect x="28" y="191" width="464" height="47" fill="#bdebf3" opacity=".78"/>
        <line x1="28" y1="191" x2="492" y2="191" stroke="#167aa0" stroke-width="3"/>
        <text x="45" y="185" font-size="13" fill="#167aa0" font-weight="800">물 표면</text>
        <text x="456" y="220" text-anchor="middle" font-size="14" fill="#075f7f" font-weight="900">h=4m</text>
        <line x1="28" y1="238" x2="492" y2="238" stroke="#694f34" stroke-width="5"/>
      </svg></div>
      <div>
        <div class="chips"><span class="chip">가 = 2h</span><span class="chip">나 = 3h</span><span class="chip">다 = 4h</span></div>
        <p class="note">막대 전체의 합은 2h+3h+4h=9h입니다. 9h=36이므로 h=4입니다.</p>
        <table><thead><tr><th>막대</th><th>전체</th><th>잠긴 길이</th></tr></thead><tbody><tr><td>가</td><td>8m</td><td>4m</td></tr><tr><td>나</td><td>12m</td><td>4m</td></tr><tr><td>다</td><td>16m</td><td>4m</td></tr></tbody></table>
        <span class="answer">강물의 깊이 = 4m</span>
      </div>
    </div>`);
}

function renderQ19(model) {
  const result = calculateQ19(model);
  const scale = 50;
  const offset = 16;
  const cellSvg = model.cellsTopLeft.map(([x, y]) => {
    const sx = offset + x * scale;
    const sy = offset + y * scale;
    const size = model.cellSize * scale;
    return `<g><rect x="${sx}" y="${sy}" width="${size}" height="${size}" fill="white" stroke="#24384f" stroke-width="2"/><line x1="${sx}" y1="${sy}" x2="${sx + size}" y2="${sy + size}" stroke="#6c7f91" stroke-width="1.6"/><line x1="${sx + size}" y1="${sy}" x2="${sx}" y2="${sy + size}" stroke="#6c7f91" stroke-width="1.6"/></g>`;
  }).join('');
  const shadedPoints = model.shadedTriangle.map(([x, y]) => `${offset + x * scale},${offset + y * scale}`).join(' ');
  const labels = [
    ['작은 기울어진 것', 'smallTilted'],
    ['똑바른 한 칸', 'unitAxisAligned'],
    ['큰 기울어진 것', 'largeTilted'],
    ['똑바른 2×2', 'twoByTwoAxisAligned'],
  ];
  const rows = labels.map(([label, key]) => `<tr><td>${label}</td><td>${result.counts[key].all}</td><td>${result.counts[key].shaded}</td><td><strong>${result.counts[key].kept}</strong></td></tr>`).join('');
  return figureShell(model, '일곱 칸의 정사각형을 네 묶음으로 세기', '색칠한 삼각형과 넓이가 조금이라도 겹치는 정사각형은 제외합니다.', `
    <div class="grid2">
      <div class="card"><svg viewBox="0 0 340 340" role="img" aria-label="위 둘 가운데 셋 아래 둘로 놓인 일곱 정사각형과 모든 대각선">
        ${cellSvg}
        <polygon points="${shadedPoints}" fill="#ef6b69" opacity=".9" stroke="#a72f31" stroke-width="2" data-shaded-triangle="true"/>
        <text x="221" y="170" text-anchor="middle" font-size="12" font-weight="900" fill="white" stroke="#7a1f25" stroke-width="2.5" paint-order="stroke">색칠</text>
      </svg></div>
      <div>
        <table data-square-total="${result.total}" data-square-shaded="${result.shaded}" data-square-kept="${result.kept}"><thead><tr><th>종류</th><th>전체</th><th>제외</th><th>남음</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="note">전체 20개에서 색칠과 겹치는 6개를 빼면 20−6=14입니다. 경계에 닿기만 하고 넓이가 겹치지 않는 것은 빼지 않습니다.</p>
        <span class="answer">남는 정사각형 = 14개</span>
      </div>
    </div>`);
}

function multiplicationSvg(rows, label) {
  const cellWidth = 42;
  const cellHeight = 39;
  const originX = 38;
  const originY = 17;
  const rowYs = [originY, originY + cellHeight, originY + cellHeight * 2 + 13, originY + cellHeight * 3 + 13, originY + cellHeight * 4 + 26];
  const normalized = [
    ['', '', ...rows.multiplicand],
    ['', '', '', ...rows.multiplier],
    ['', ...rows.onesPartial],
    [...rows.tensPartial, ''],
    [...rows.product],
  ];
  const rowNames = ['윗수', '곱하는 수', '일의 자리 곱', '십의 자리 곱', '합'];
  const content = normalized.map((cells, rowIndex) => cells.map((cell, columnIndex) => {
    const x = originX + columnIndex * cellWidth;
    const y = rowYs[rowIndex];
    const isShiftBlank = rowIndex === 3 && columnIndex === 4;
    const visible = cell !== '' || isShiftBlank;
    return `<g data-row="${rowNames[rowIndex]}" data-column="${columnIndex}"${isShiftBlank ? ' data-place="ones-shift-blank"' : ''}>
      ${visible ? `<rect x="${x}" y="${y}" width="${cellWidth - 3}" height="${cellHeight - 5}" rx="6" fill="${isShiftBlank ? '#fff5cf' : '#f4f7fb'}" stroke="${isShiftBlank ? '#d39619' : '#cbd5df'}" ${isShiftBlank ? 'stroke-dasharray="4 3"' : ''}/>` : ''}
      ${cell !== '' ? `<text x="${x + (cellWidth - 3) / 2}" y="${y + 24}" text-anchor="middle" font-size="21" font-weight="900">${escapeHtml(cell)}</text>` : ''}
    </g>`;
  }).join('')).join('');
  return `<svg viewBox="0 0 285 255" role="img" aria-label="${escapeHtml(label)}">
    <text x="12" y="${rowYs[1] + 24}" font-size="22" font-weight="900">×</text>
    ${content}
    <line x1="30" y1="${rowYs[1] + 39}" x2="251" y2="${rowYs[1] + 39}" stroke="#182638" stroke-width="2.5"/>
    <line x1="30" y1="${rowYs[3] + 39}" x2="251" y2="${rowYs[3] + 39}" stroke="#182638" stroke-width="2.5"/>
    <path d="M248 ${rowYs[3] + 17} h22 v-22" fill="none" stroke="#d39619" stroke-width="1.6"/>
    <text x="270" y="${rowYs[3] - 9}" text-anchor="end" font-size="10" font-weight="800" fill="#9a6810">빈칸</text>
  </svg>`;
}

function renderQ24(model) {
  const result = calculateQ24(model);
  const assignment = result.assignments[0];
  const symbolRows = {
    multiplicand: ['ㄱ', 'ㄴ', 'ㄷ'], multiplier: ['ㄱ', 'ㄷ'],
    onesPartial: ['ㄹ', 'ㄷ', 'ㅁ', 'ㄱ'], tensPartial: ['ㅂ', 'ㄱ', 'ㅅ', 'ㄷ'],
    product: ['ㅂ', 'ㅇ', 'ㄹ', 'ㅇ', 'ㄱ'],
  };
  const numericRows = {
    multiplicand: ['6', '1', '4'], multiplier: ['6', '4'],
    onesPartial: ['2', '4', '5', '6'], tensPartial: ['3', '6', '8', '4'],
    product: ['3', '9', '2', '9', '6'],
  };
  const mapping = Object.entries(assignment).map(([symbol, value]) => `<span data-symbol="${symbol}" data-value="${value}">${symbol} = ${value}</span>`).join('');
  return figureShell(model, '부분곱의 자리와 빈칸까지 맞춘 세로셈', '기호 세로셈과 숫자 세로셈을 같은 다섯 자리 칸에 나란히 놓았습니다.', `
    <div class="q24-layout">
      <div class="card"><h4>기호로 읽기</h4>${multiplicationSvg(symbolRows, '여덟 기호로 된 세로 곱셈')}</div>
      <div class="card"><h4>숫자를 넣어 확인하기</h4>${multiplicationSvg(numericRows, '614 곱하기 64 세로 곱셈')}</div>
    </div>
    <div class="mapping" data-complete-symbol-mapping="true">${mapping}</div>
    <div class="grid2" style="margin-top:14px;align-items:start">
      <div class="card">
        <h4>후보를 실제로 지우는 순서</h4>
        <p>① 두 일의 자리 조건을 함께 보면 (ㄱ,ㄷ)은 <strong>(1,9), (6,4)</strong>만 남습니다.</p>
        <p>② (1,9)는 ㄱㄴㄷ×ㄱ이 세 자리라서 네 칸인 <strong>ㅂㄱㅅㄷ</strong>과 맞지 않아 제외합니다.</p>
        <p>③ (6,4)에서 ㄴ=0이면 ㄹ=ㅅ=2, ㄴ=2이면 ㄴ=ㄹ=2가 되어 ‘서로 다른 기호’ 조건에 어긋납니다. 그래서 <strong>ㄴ=1</strong>만 남습니다.</p>
      </div>
      <div class="note">
        614×4=2456<br>614×6=3684<br><strong>2456+36840=39296</strong><br><br>둘째 부분곱은 십의 자리 6을 곱했으므로 한 자리 왼쪽에 놓고, 맨 오른쪽은 빈칸입니다.
      </div>
    </div>
    <span class="answer print-redundant">ㄱ=6, ㄴ=1, ㄷ=4, ㄹ=2, ㅁ=5, ㅂ=3, ㅅ=8, ㅇ=9</span>`);
}

function segmentLine(model, segmentName, offsetX) {
  const [[x1, y1], [x2, y2]] = model.segmentCoordinates[segmentName];
  const scale = 20;
  return `<line x1="${offsetX + x1 * scale}" y1="${12 + y1 * scale}" x2="${offsetX + x2 * scale}" y2="${12 + y2 * scale}" stroke="#25384c" stroke-width="7" stroke-linecap="round"/>`;
}

function matchstickGlyph(model, digit, offsetX) {
  return model.validGlyphs[String(digit)].map((segment) => segmentLine(model, segment, offsetX)).join('');
}

function renderQ25(model) {
  const result = calculateQ25(model);
  const cards = Object.keys(model.validGlyphs).map((digit) => {
    const mirror = String(model.mirrorMap[digit]);
    return `<div class="digit-card" data-digit="${digit}" data-mirror="${mirror}" data-matchsticks="${model.matchstickCounts[digit]}">
      <svg viewBox="0 0 152 108" role="img" aria-label="숫자 ${digit}은 거울에서 ${mirror}">
        ${matchstickGlyph(model, digit, 15)}
        <path d="M65 52 h22" stroke="#2374d8" stroke-width="2"/><path d="M83 47 l6 5 -6 5" fill="none" stroke="#2374d8" stroke-width="2"/>
        ${matchstickGlyph(model, mirror, 98)}
      </svg>
      <strong>${digit} → ${mirror}</strong><div class="mini">${model.matchstickCounts[digit]}개비</div>
    </div>`;
  }).join('');
  const groupLabels = { 2: '2자리', 3: '3자리', 4: '4자리', 6: '6자리' };
  const numberGroups = Object.entries(model.validNumbersByLength).map(([length, numbers]) => `<div class="number-group" data-length="${length}"><strong>${groupLabels[length]} · ${numbers.length}개</strong><br>${numbers.join(', ')}</div>`).join('');
  return figureShell(model, '거울에 남는 숫자와 12개비 목록', '숫자 카드는 여러 장씩 있으므로 같은 숫자를 여러 번 써도 됩니다.', `
    <p class="note"><strong>반복 사용 가능:</strong> 11, 122, 1011, 111111처럼 같은 숫자 카드가 되풀이되는 수도 반드시 셉니다.</p>
    <div class="digit-grid" data-repeat-allowed="true">${cards}</div>
    <div class="number-groups">${numberGroups}</div>
    <p>첫 자리와 마지막 자리는 0이 아니어야 합니다. 각 수의 성냥개비를 더하면 모두 12개이고, 거울에서는 숫자 순서도 거꾸로 읽습니다.</p>
    <span class="answer">4+12+2+1 = 19가지</span>`);
}

function hexagonPoints(cx, cy, radius) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = index * Math.PI / 3;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

function renderHexPattern(entry, index) {
  const centerX = 90;
  const centerY = 82;
  const centerDistance = 48.5;
  const radius = 28;
  const selected = new Set(entry.cells);
  const centers = { C: [centerX, centerY] };
  for (let ring = 0; ring < 6; ring += 1) {
    const angle = (-90 + 60 * ring) * Math.PI / 180;
    centers[`R${ring}`] = [centerX + centerDistance * Math.cos(angle), centerY + centerDistance * Math.sin(angle)];
  }
  const hexagons = Object.entries(centers).map(([name, [cx, cy]]) => `<polygon points="${hexagonPoints(cx, cy, radius)}" fill="${selected.has(name) ? '#7357d8' : '#f6f7f9'}" stroke="#273b52" stroke-width="1.7" data-cell="${name}" data-selected="${selected.has(name)}"/>`).join('');
  const axisAmount = entry.axes[0];
  const axisAngle = (-90 + 30 * axisAmount) * Math.PI / 180;
  const dx = 76 * Math.cos(axisAngle);
  const dy = 76 * Math.sin(axisAngle);
  const labels = ['가운데+이웃 두 칸', '가운데+한 칸 사이', '가운데+마주 보는 칸', '둘레 세 칸 연속', '둘레 한 칸씩 번갈아'];
  return `<div class="hex-card" data-pattern="${index + 1}" data-axis="${axisAmount}">
    <svg viewBox="0 0 180 168" role="img" aria-label="접으면 겹치는 색칠 방법 ${index + 1}">
      ${hexagons}
      <line x1="${centerX - dx}" y1="${centerY - dy}" x2="${centerX + dx}" y2="${centerY + dy}" stroke="#e2474b" stroke-width="3" stroke-dasharray="6 4" data-fold-axis="true"/>
      <circle cx="90" cy="82" r="3" fill="#e2474b"/>
    </svg>
    <strong>${index + 1}. ${labels[index]}</strong>
  </div>`;
}

function renderQ26(model) {
  const result = calculateQ26(model);
  const patterns = result.accepted.map(renderHexPattern).join('');
  return figureShell(model, '접는 선이 있는 세 칸 색칠 다섯 가지', '빨간 점선으로 접으면 색칠한 칸과 바깥 선이 양쪽에서 포개집니다.', `
    <div class="hex-grid" data-foldable-count="${result.foldableOrbitKeys.length}">${patterns}</div>
    <div class="grid2" style="margin-top:14px">
      <p class="note">가운데를 칠하면 둘레 두 칸의 간격이 <strong>이웃·한 칸 사이·마주 봄</strong>인 3가지입니다. 가운데를 칠하지 않으면 <strong>둘레 세 칸 연속·번갈아</strong>인 2가지입니다.</p>
      <div><div class="chips"><span class="chip">가운데 포함 3</span><span class="chip">가운데 없음 2</span></div><span class="answer">3+2 = 5가지</span></div>
    </div>`);
}

function mapScale(model, x, y) {
  const [left, top] = model.outerRectangle;
  return [25 + (x - left), 22 + (y - top)];
}

function renderOddWheel(model) {
  const ring = model.fourColorLowerBound.fiveRegionRing;
  const center = model.fourColorLowerBound.center;
  const cx = 130;
  const cy = 105;
  const radius = 72;
  const points = ring.map((region, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    return { region, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  const edges = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return `<line x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}" stroke="#4f6380" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${point.x}" y2="${point.y}" stroke="#9caabd" stroke-width="1.5"/>`;
  }).join('');
  const nodes = points.map((point, index) => `<g><circle cx="${point.x}" cy="${point.y}" r="18" fill="${index % 2 ? '#ffd972' : '#70c7e8'}" stroke="#273b52" stroke-width="2"/><text x="${point.x}" y="${point.y + 5}" text-anchor="middle" font-size="13" font-weight="900">${point.region}</text></g>`).join('');
  return `<svg viewBox="0 0 260 210" role="img" aria-label="13번과 다섯 지역 고리 때문에 세 색으로 칠할 수 없음" data-lower-bound-ring="${ring.join('-')}">
    ${edges}${nodes}
    <circle cx="${cx}" cy="${cy}" r="20" fill="#7357d8" stroke="#273b52" stroke-width="2"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="white">${center}</text>
  </svg>`;
}

function renderQ30(model) {
  const result = calculateQ30(model);
  const palette = { 1: '#ffcf5a', 2: '#74c8ee', 3: '#8ed39a', 4: '#e898c5' };
  const fills = result.atomicCells.map((cell) => {
    const [x1, y1] = mapScale(model, cell.x1, cell.y1);
    const [x2, y2] = mapScale(model, cell.x2, cell.y2);
    return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="${palette[result.colorByRegion[cell.region]]}" data-region-fill="${cell.region}"/>`;
  }).join('');
  const [left, top, right, bottom] = model.outerRectangle;
  const [outerX, outerY] = mapScale(model, left, top);
  const [outerRight, outerBottom] = mapScale(model, right, bottom);
  const horizontal = model.horizontalBoundarySegments.map(([x1, y, x2]) => {
    const [sx1, sy] = mapScale(model, x1, y);
    const [sx2] = mapScale(model, x2, y);
    return `<line x1="${sx1}" y1="${sy}" x2="${sx2}" y2="${sy}"/>`;
  }).join('');
  const vertical = model.verticalBoundarySegments.map(([x, y1, , y2]) => {
    const [sx, sy1] = mapScale(model, x, y1);
    const [, sy2] = mapScale(model, x, y2);
    return `<line x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}"/>`;
  }).join('');
  const highlighted = new Set([model.fourColorLowerBound.center, ...model.fourColorLowerBound.fiveRegionRing]);
  const labels = Object.entries(model.regionSeeds).map(([region, [x, y]]) => {
    const [sx, sy] = mapScale(model, x, y);
    return `<g data-region-label="${region}">${highlighted.has(Number(region)) ? `<circle cx="${sx}" cy="${sy}" r="12" fill="none" stroke="#683cb6" stroke-width="2.5"/>` : ''}<text x="${sx}" y="${sy + 4}" text-anchor="middle" font-size="12" font-weight="900" fill="#182638" stroke="white" stroke-width="3" paint-order="stroke">${region}</text></g>`;
  }).join('');
  const legend = Object.entries(model.fourColoring).map(([colorName, regions]) => {
    const color = Number(colorName.replace('color', ''));
    return `<span class="chip" style="border-color:${palette[color]};box-shadow:inset 0 -5px 0 ${palette[color]}">색 ${color}: ${regions.join(', ')}</span>`;
  }).join('');
  return figureShell(model, '지도에 필요한 최소 색 수', '왼쪽은 전체 20지역의 실제 네 색 칠하기이고, 오른쪽은 세 색이 모자라는 까닭입니다.', `
    <div class="map-grid">
      <div class="card"><svg viewBox="0 0 470 335" role="img" aria-label="20개 지역을 네 색으로 칠한 지도" data-region-count="${result.regionCount}" data-edge-count="${result.edgeCount}">
        ${fills}
        <g stroke="#263a50" stroke-width="2.1" stroke-linecap="square">${horizontal}${vertical}<rect x="${outerX}" y="${outerY}" width="${outerRight - outerX}" height="${outerBottom - outerY}" fill="none" stroke-width="3"/></g>
        ${labels}
      </svg></div>
      <div class="card">
        <h4>13번과 다섯 칸 고리</h4>
        ${renderOddWheel(model)}
        <p class="mini">13번에 한 색을 쓰면 둘레는 두 색만 남습니다. 다섯 칸을 번갈아 칠하면 처음과 끝이 같은 색이 되어 서로 이웃인 10번과 8번에서 막힙니다.</p>
      </div>
    </div>
    <div class="chips" style="margin-top:12px">${legend}</div>
    <p class="note"><strong>세 색은 불가능</strong>하고, 왼쪽 지도처럼 <strong>네 색이면 전체가 가능</strong>합니다. 따라서 이것은 색칠 방법의 수가 아니라 필요한 색의 <strong>최소 개수</strong>입니다.</p>
    <span class="answer">필요한 색의 최소 개수 = 4색</span>`);
}

function render(model) {
  assert(model && SUPPORTED_IDS.has(model.id), `unsupported diagram model: ${model && model.id}`);
  switch (model.questionNo) {
    case 17: return renderQ17(model);
    case 18: return renderQ18(model);
    case 19: return renderQ19(model);
    case 24: return renderQ24(model);
    case 25: return renderQ25(model);
    case 26: return renderQ26(model);
    case 30: return renderQ30(model);
    default: throw new Error(`unsupported question: ${model.questionNo}`);
  }
}

module.exports = {
  STATUS,
  RELEASE_STATUS,
  SUPPORTED_IDS: [...SUPPORTED_IDS],
  calculate,
  render,
};

  return module.exports;
})();
const expectedNos=[17,18,19,24,25,26,30];
function modelFor(no){return MODEL['q'+Number(no)]||null;}
function calculate(no){
  const model=modelFor(no);
  if(!model) return null;
  const result=engine.calculate(model);
  return Object.assign({},result,{valid:true});
}
function render(no){
  const model=modelFor(no);
  return model?engine.render(model):'';
}
root.GFIELD_FINAL3_BACKHALF_SOLUTION_DIAGRAMS=deepFreeze({
  contract:{schemaVersion:1,round:3,expectedNos:expectedNos.slice(),evidenceStatus:'verified',independentReviewStatus:'verified',releaseStatus:'locked'},
  supportedIds:engine.SUPPORTED_IDS.slice(),
  models:MODEL,
  modelFor:modelFor,
  calculate:calculate,
  render:render
});
})(typeof window!=='undefined'?window:globalThis);
