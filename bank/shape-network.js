/*!
 * GFIELD BULL BANK - exact polygon counting on a finite segment network
 * Used by triangle/quadrilateral questions that contain diagonal segments.
 */
(function (global) {
  'use strict';

  var EPS = 1e-8;
  var triangleCache = new Map();
  var quadrilateralCache = new Map();
  var cycleCache = new Map();

  function segmentSignature(segments) { return JSON.stringify(segments); }

  function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
  function pointKey(point) { return point[0].toFixed(8) + ',' + point[1].toFixed(8); }
  function samePoint(a, b) { return Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS; }

  function segmentIntersection(first, second) {
    var p = [first[0], first[1]], r = [first[2] - first[0], first[3] - first[1]];
    var q = [second[0], second[1]], s = [second[2] - second[0], second[3] - second[1]];
    var denominator = cross(r[0], r[1], s[0], s[1]);
    if (Math.abs(denominator) < EPS) return null;
    var qp = [q[0] - p[0], q[1] - p[1]];
    var t = cross(qp[0], qp[1], s[0], s[1]) / denominator;
    var u = cross(qp[0], qp[1], r[0], r[1]) / denominator;
    if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null;
    return [p[0] + t * r[0], p[1] + t * r[1]];
  }

  function collectVertices(segments) {
    var found = new Map();
    function add(point) { found.set(pointKey(point), point); }
    segments.forEach(function (segment) {
      add([segment[0], segment[1]]);
      add([segment[2], segment[3]]);
    });
    for (var i = 0; i < segments.length; i++) {
      for (var j = i + 1; j < segments.length; j++) {
        var intersection = segmentIntersection(segments[i], segments[j]);
        if (intersection) add(intersection);
      }
    }
    return Array.from(found.values()).sort(function (a, b) {
      return a[1] - b[1] || a[0] - b[0];
    });
  }

  function collinearWithSide(segment, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.abs(cross(dx, dy, segment[0] - a[0], segment[1] - a[1])) < EPS &&
      Math.abs(cross(dx, dy, segment[2] - a[0], segment[3] - a[1])) < EPS;
  }

  function sideExists(a, b, segments) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var lengthSquared = dx * dx + dy * dy;
    if (lengthSquared < EPS) return false;
    var intervals = [];
    segments.forEach(function (segment) {
      if (!collinearWithSide(segment, a, b)) return;
      var start = ((segment[0] - a[0]) * dx + (segment[1] - a[1]) * dy) / lengthSquared;
      var end = ((segment[2] - a[0]) * dx + (segment[3] - a[1]) * dy) / lengthSquared;
      var lo = Math.max(0, Math.min(start, end));
      var hi = Math.min(1, Math.max(start, end));
      if (hi >= lo - EPS) intervals.push([lo, hi]);
    });
    intervals.sort(function (a1, b1) { return a1[0] - b1[0] || a1[1] - b1[1]; });
    var covered = 0;
    for (var i = 0; i < intervals.length; i++) {
      if (intervals[i][0] > covered + EPS) return false;
      covered = Math.max(covered, intervals[i][1]);
      if (covered >= 1 - EPS) return true;
    }
    return false;
  }

  function signedArea(points) {
    var twice = 0;
    for (var i = 0; i < points.length; i++) {
      var next = points[(i + 1) % points.length];
      twice += points[i][0] * next[1] - points[i][1] * next[0];
    }
    return twice / 2;
  }

  function properCross(a, b, c, d) {
    function orient(p, q, r) { return cross(q[0] - p[0], q[1] - p[1], r[0] - p[0], r[1] - p[1]); }
    var abC = orient(a, b, c), abD = orient(a, b, d), cdA = orient(c, d, a), cdB = orient(c, d, b);
    return abC * abD < -EPS && cdA * cdB < -EPS;
  }

  function validPolygon(points, segments) {
    if (Math.abs(signedArea(points)) < EPS) return false;
    for (var i = 0; i < points.length; i++) {
      var prev = points[(i + points.length - 1) % points.length];
      var current = points[i];
      var next = points[(i + 1) % points.length];
      if (Math.abs(cross(current[0] - prev[0], current[1] - prev[1], next[0] - current[0], next[1] - current[1])) < EPS) return false;
      if (!sideExists(current, next, segments)) return false;
    }
    if (points.length === 4 && (properCross(points[0], points[1], points[2], points[3]) || properCross(points[1], points[2], points[3], points[0]))) return false;
    return true;
  }

  function canonicalCycle(indexes) {
    var variants = [];
    var directions = [indexes.slice(), indexes.slice().reverse()];
    directions.forEach(function (cycle) {
      for (var offset = 0; offset < cycle.length; offset++) {
        variants.push(cycle.slice(offset).concat(cycle.slice(0, offset)).join('-'));
      }
    });
    variants.sort();
    return variants[0];
  }

  function summarize(polygons, vertices) {
    var byArea = {};
    polygons.forEach(function (cycle) {
      var area = Math.round(Math.abs(signedArea(cycle.map(function (index) { return vertices[index]; }))) * 1000000) / 1000000;
      var key = String(area);
      byArea[key] = (byArea[key] || 0) + 1;
    });
    return { count: polygons.length, polygons: polygons, byArea: byArea };
  }

  function countTriangles(segments) {
    var signature = segmentSignature(segments);
    if (triangleCache.has(signature)) return triangleCache.get(signature);
    var vertices = collectVertices(segments), polygons = [];
    for (var a = 0; a < vertices.length; a++) {
      for (var b = a + 1; b < vertices.length; b++) {
        for (var c = b + 1; c < vertices.length; c++) {
          var points = [vertices[a], vertices[b], vertices[c]];
          if (validPolygon(points, segments)) polygons.push([a, b, c]);
        }
      }
    }
    var result = summarize(polygons, vertices);
    result.vertices = vertices;
    triangleCache.set(signature, result);
    return result;
  }

  function countQuadrilaterals(segments) {
    var signature = segmentSignature(segments);
    if (quadrilateralCache.has(signature)) return quadrilateralCache.get(signature);
    var vertices = collectVertices(segments), found = new Map();
    for (var a = 0; a < vertices.length; a++) {
      for (var b = 0; b < vertices.length; b++) {
        if (b === a) continue;
        for (var c = 0; c < vertices.length; c++) {
          if (c === a || c === b) continue;
          for (var d = 0; d < vertices.length; d++) {
            if (d === a || d === b || d === c) continue;
            var cycle = [a, b, c, d];
            var key = canonicalCycle(cycle);
            if (found.has(key)) continue;
            if (validPolygon(cycle.map(function (index) { return vertices[index]; }), segments)) found.set(key, cycle);
          }
        }
      }
    }
    var result = summarize(Array.from(found.values()), vertices);
    result.vertices = vertices;
    quadrilateralCache.set(signature, result);
    return result;
  }

  function adjacencyFor(vertices, segments) {
    return vertices.map(function (point, index) {
      var adjacent = [];
      for (var other = 0; other < vertices.length; other++) {
        if (other !== index && sideExists(point, vertices[other], segments)) adjacent.push(other);
      }
      return adjacent;
    });
  }

  function countByCycles(segments, sideCount) {
    var signature = sideCount + ':' + segmentSignature(segments);
    if (cycleCache.has(signature)) return cycleCache.get(signature);
    var vertices = collectVertices(segments);
    var adjacency = adjacencyFor(vertices, segments);
    var found = new Map();

    function walk(start, path) {
      if (path.length === sideCount) {
        var last = path[path.length - 1];
        if (adjacency[last].indexOf(start) === -1) return;
        var key = canonicalCycle(path);
        if (found.has(key)) return;
        var points = path.map(function (index) { return vertices[index]; });
        if (validPolygon(points, segments)) found.set(key, path.slice());
        return;
      }
      var current = path[path.length - 1];
      adjacency[current].forEach(function (next) {
        if (path.indexOf(next) === -1) walk(start, path.concat(next));
      });
    }

    for (var start = 0; start < vertices.length; start++) walk(start, [start]);
    var result = summarize(Array.from(found.values()), vertices);
    result.vertices = vertices;
    cycleCache.set(signature, result);
    return result;
  }

  function countTrianglesByCycles(segments) { return countByCycles(segments, 3); }
  function countQuadrilateralsByCycles(segments) { return countByCycles(segments, 4); }

  function gridSegments(cols, rows) {
    var segments = [];
    for (var y = 0; y <= rows; y++) segments.push([0, y, cols, y]);
    for (var x = 0; x <= cols; x++) segments.push([x, 0, x, rows]);
    return segments;
  }

  var PATTERNS = {
    'cross-2x2': { cols: 2, rows: 2, diagonals: [[0, 0, 2, 2], [2, 0, 0, 2]] },
    'offset-2x2': { cols: 2, rows: 2, diagonals: [[0, 0, 1, 1], [1, 1, 2, 0], [0, 2, 1, 1], [1, 1, 2, 2], [0, 1, 1, 0]] },
    'double-cross-3x2': { cols: 3, rows: 2, diagonals: [[0, 0, 2, 2], [2, 0, 0, 2], [1, 0, 3, 2], [3, 0, 1, 2]] }
  };

  function getPattern(id) {
    var base = PATTERNS[id];
    if (!base) throw new Error('unknown segment-network pattern: ' + id);
    return {
      id: id,
      cols: base.cols,
      rows: base.rows,
      diagonals: base.diagonals.map(function (segment) { return segment.slice(); }),
      segments: gridSegments(base.cols, base.rows).concat(base.diagonals.map(function (segment) { return segment.slice(); }))
    };
  }

  global.BANK_SHAPE_NETWORK = {
    getPattern: getPattern,
    countTriangles: countTriangles,
    countQuadrilaterals: countQuadrilaterals,
    countTrianglesByCycles: countTrianglesByCycles,
    countQuadrilateralsByCycles: countQuadrilateralsByCycles,
    collectVertices: collectVertices,
    sideExists: sideExists,
    signedArea: signedArea
  };
})(typeof window !== 'undefined' ? window : globalThis);
