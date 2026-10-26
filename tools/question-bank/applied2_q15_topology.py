"""Exact planar cut graph for the Applied 2 Q15 paper-fold variants."""
from fractions import Fraction as Q
from collections import defaultdict
import math


def cross(a, b):
    return a[0] * b[1] - a[1] * b[0]


def sub(a, b):
    return a[0] - b[0], a[1] - b[1]


def point(a, d, t):
    return a[0] + d[0] * t, a[1] + d[1] * t


def intersection(a, b, c, d):
    u, v = sub(b, a), sub(d, c)
    den = cross(u, v)
    if den:
        t = cross(sub(c, a), v) / den
        s = cross(sub(c, a), u) / den
        if 0 <= t <= 1 and 0 <= s <= 1:
            p = point(a, u, t)
            return [(t, s, p)]
        return []
    if cross(sub(c, a), u):
        return []
    out = []
    for p in (a, b):
        if min(c[0], d[0]) <= p[0] <= max(c[0], d[0]) and min(c[1], d[1]) <= p[1] <= max(c[1], d[1]):
            i = (p[0] - a[0]) / u[0] if u[0] else (p[1] - a[1]) / u[1]
            j = (p[0] - c[0]) / v[0] if v[0] else (p[1] - c[1]) / v[1]
            out.append((i, j, p))
    for p in (c, d):
        if min(a[0], b[0]) <= p[0] <= max(a[0], b[0]) and min(a[1], b[1]) <= p[1] <= max(a[1], b[1]):
            i = (p[0] - a[0]) / u[0] if u[0] else (p[1] - a[1]) / u[1]
            j = (p[0] - c[0]) / v[0] if v[0] else (p[1] - c[1]) / v[1]
            out.append((i, j, p))
    return out


def pieces(folds=4, u_height=Q(1), left=Q(2), right=Q(4), width=Q(6), folded_h=Q(2), flip=True, return_graph=False):
    """Count paper components after cuts, using exact segment intersections/Euler."""
    assert folds >= 2 and 0 < left < right < width and 0 < u_height < folded_h
    h = folds * folded_h
    vertices = [(Q(0), Q(0)), (width, Q(0)), (width, h), (Q(0), h)]
    segs = list(zip(vertices, vertices[1:] + vertices[:1]))
    cuts = [
        ((Q(0), Q(0)), (left, folded_h)),
        ((right, folded_h), (width, Q(0))),
        ((left, Q(0)), (left, u_height)),
        ((left, u_height), (right, u_height)),
        ((right, u_height), (right, Q(0))),
    ]
    for k in range(folds):
        def lift(p):
            x, y = p
            return (x, k * folded_h + (y if (k % 2 == 0) != flip else folded_h - y))
        segs += [(lift(a), lift(b)) for a, b in cuts]
    split = [{Q(0): a, Q(1): b} for a, b in segs]
    for i, (a, b) in enumerate(segs):
        for j, (c, d) in enumerate(segs[:i]):
            for t, s, p in intersection(a, b, c, d):
                split[i][t] = split[j][s] = p
    edges = set()
    for pairs in split:
        pts = [p for _, p in sorted(pairs.items())]
        for a, b in zip(pts, pts[1:]):
            if a != b:
                edges.add(tuple(sorted((a, b))))
    graph = defaultdict(set)
    for a, b in edges:
        graph[a].add(b)
        graph[b].add(a)
    seen = set()
    components = 0
    for root in graph:
        if root in seen:
            continue
        components += 1
        todo = [root]
        while todo:
            v = todo.pop()
            if v in seen:
                continue
            seen.add(v)
            todo += list(graph[v] - seen)
    euler_count = len(edges) - len(graph) + components
    if return_graph:
        return euler_count, graph
    return euler_count


def pieces_by_faces(graph):
    """Independent traversal of all planar faces; positive areas are paper pieces."""
    ordered = {}
    for p, neighbors in graph.items():
        ordered[p] = sorted(neighbors, key=lambda q: math.atan2(float(q[1]-p[1]), float(q[0]-p[0])))
    visited = set()
    positive = []
    for a, neighbors in ordered.items():
        for b in neighbors:
            if (a, b) in visited:
                continue
            start = (a, b)
            edge = start
            polygon = []
            while edge not in visited:
                u, v = edge
                visited.add(edge)
                polygon.append(u)
                around = ordered[v]
                edge = (v, around[(around.index(u)-1) % len(around)])
            assert edge == start
            area_twice = sum(x1*y2-x2*y1 for (x1,y1),(x2,y2) in zip(polygon,polygon[1:]+polygon[:1]))
            if area_twice > 0:
                positive.append((area_twice/2, polygon))
    return positive


if __name__ == "__main__":
    for folds in range(2, 9):
        euler, graph = pieces(folds, return_graph=True)
        faces = pieces_by_faces(graph)
        assert euler == len(faces)
        print(folds, euler, [float(area) for area, _ in faces])
