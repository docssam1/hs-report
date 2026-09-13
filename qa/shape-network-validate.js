'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

require(path.resolve(__dirname, '..', 'bank', 'shape-network.js'));
const network = global.BANK_SHAPE_NETWORK;

const expected = {
  'cross-2x2': { triangles: 16, quadrilaterals: 17 },
  'offset-2x2': { triangles: 22, quadrilaterals: 26 },
  'double-cross-3x2': { triangles: 42, quadrilaterals: 85 },
};

for (const [id, counts] of Object.entries(expected)) {
  const pattern = network.getPattern(id);
  assert.ok(pattern.diagonals.length > 0, `${id} has diagonal segments`);

  const triangles = network.countTriangles(pattern.segments);
  const trianglesByCycles = network.countTrianglesByCycles(pattern.segments);
  assert.equal(triangles.count, counts.triangles, `${id} triangle golden count`);
  assert.equal(trianglesByCycles.count, counts.triangles, `${id} triangle cycle count`);
  assert.deepEqual(triangles.byArea, trianglesByCycles.byArea, `${id} triangle area groups`);

  const quadrilaterals = network.countQuadrilaterals(pattern.segments);
  const quadrilateralsByCycles = network.countQuadrilateralsByCycles(pattern.segments);
  assert.equal(quadrilaterals.count, counts.quadrilaterals, `${id} quadrilateral golden count`);
  assert.equal(quadrilateralsByCycles.count, counts.quadrilaterals, `${id} quadrilateral cycle count`);
  assert.deepEqual(quadrilaterals.byArea, quadrilateralsByCycles.byArea, `${id} quadrilateral area groups`);

  const reversed = pattern.segments.slice().reverse().map((segment) => segment.slice().reverse());
  assert.equal(network.countTriangles(reversed).count, counts.triangles, `${id} triangle count ignores draw order`);
  assert.equal(network.countQuadrilaterals(reversed).count, counts.quadrilaterals, `${id} quadrilateral count ignores draw order`);
}

console.log('PASS shape network QA: diagonal triangle/quadrilateral golden counts and two-route verification');
