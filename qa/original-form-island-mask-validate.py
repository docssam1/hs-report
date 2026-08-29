from collections import Counter
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
ROUND1_ASSET = ROOT / "assets" / "original-form" / "original-r1-q04-island-source-faithful-imagegen-v3.png"
ROUND2_ASSET = ROOT / "assets" / "original-form" / "rigor-r2-q10-island-37-v1.png"
PRIVATE = ROOT / ".private-work" / "original-similar-2rounds"
ROUND1_BASE = ROUND1_ASSET
ROUND1_META = PRIVATE / "original-r1-q04-island-source-faithful-imagegen-v3.meta.json"
ROUND2_META = PRIVATE / "rigor-r2-q10-island-37-v1.meta.json"

EXPECTED_ROUND1_TOPOLOGY = {
    "outerFrame": "closed",
    "internalBoundaryComponents": 1,
    "topContacts": 1,
    "bottomContacts": 1,
    "leftContacts": 0,
    "rightContacts": 0,
    "largeRegions": 2,
}


def dark_components(gray: Image.Image, threshold: int = 80):
    width, height = gray.size
    pixels = gray.load()
    seen = bytearray(width * height)
    components = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or pixels[x, y] >= threshold:
                continue
            stack = [(x, y)]
            seen[index] = 1
            points = []
            while stack:
                px, py = stack.pop()
                points.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        next_index = ny * width + nx
                        if not seen[next_index] and pixels[nx, ny] < threshold:
                            seen[next_index] = 1
                            stack.append((nx, ny))
            xs = [point[0] for point in points]
            ys = [point[1] for point in points]
            components.append((len(points), min(xs), min(ys), max(xs), max(ys)))
    return components


def dark_component_points(gray: Image.Image, threshold: int = 110):
    width, height = gray.size
    pixels = gray.load()
    remaining = {
        (x, y)
        for y in range(height)
        for x in range(width)
        if pixels[x, y] < threshold
    }
    components = []
    while remaining:
        point = remaining.pop()
        stack = [point]
        component = {point}
        while stack:
            px, py = stack.pop()
            for neighbor in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    component.add(neighbor)
                    stack.append(neighbor)
        components.append(component)
    return components


def component_box(points):
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    return min(xs), min(ys), max(xs), max(ys)


def component_count(points, diagonal: bool = False):
    remaining = set(points)
    count = 0
    if diagonal:
        offsets = (
            (-1, -1), (0, -1), (1, -1),
            (-1, 0), (1, 0),
            (-1, 1), (0, 1), (1, 1),
        )
    else:
        offsets = ((-1, 0), (1, 0), (0, -1), (0, 1))
    while remaining:
        stack = [remaining.pop()]
        count += 1
        while stack:
            px, py = stack.pop()
            for dx, dy in offsets:
                neighbor = (px + dx, py + dy)
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    stack.append(neighbor)
    return count


def white_labels(gray: Image.Image, threshold: int = 200):
    width, height = gray.size
    pixels = gray.load()
    labels = [-1] * (width * height)
    sizes = []
    label = 0
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if labels[index] >= 0 or pixels[x, y] <= threshold:
                continue
            stack = [(x, y)]
            labels[index] = label
            size = 0
            while stack:
                px, py = stack.pop()
                size += 1
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        next_index = ny * width + nx
                        if labels[next_index] < 0 and pixels[nx, ny] > threshold:
                            labels[next_index] = label
                            stack.append((nx, ny))
            sizes.append(size)
            label += 1
    return labels, sizes


def surrounding_label(component, labels, width, height):
    _, x0, y0, x1, y1 = component
    candidates = []
    for y in range(max(0, y0 - 8), min(height, y1 + 9)):
        for x in range(max(0, x0 - 8), min(width, x1 + 9)):
            if x < x0 or x > x1 or y < y0 or y > y1:
                label = labels[y * width + x]
                if label >= 0:
                    candidates.append(label)
    assert candidates, f"개구리 주변 흰 영역을 찾을 수 없음: {component}"
    return Counter(candidates).most_common(1)[0][0]


def assert_monochrome_unfilled(rgb: Image.Image, label: str):
    red, green, blue = rgb.split()
    assert ImageStat.Stat(ImageChops.difference(red, green)).mean[0] < 1.0, f"{label}: 무채색"
    assert ImageStat.Stat(ImageChops.difference(red, blue)).mean[0] < 1.0, f"{label}: 무채색"
    assert ImageStat.Stat(rgb.convert("L")).mean[0] > 215, f"{label}: 땅과 바다를 미리 색칠하지 않음"


assert ROUND1_ASSET.exists(), f"1회 섬 그림 누락: {ROUND1_ASSET}"
assert ROUND1_BASE.exists(), f"1회 섬 배경 누락: {ROUND1_BASE}"
assert ROUND1_META.exists(), f"1회 섬 검수 메타 누락: {ROUND1_META}"

meta1 = json.loads(ROUND1_META.read_text(encoding="utf-8"))
assert meta1["boundaryTopology"] == EXPECTED_ROUND1_TOPOLOGY, "1회 경계 구조 메타"
assert meta1["total"] == 14, "1회 개구리 전체 수"
assert meta1["island"] == 5 and meta1["sea"] == 9, "1회 섬·바다 개구리 배분"
assert len(meta1["islandCoordinates"]) == 5 and len(meta1["seaCoordinates"]) == 9, "1회 섬·바다 좌표 수"
coords1 = meta1["islandCoordinates"] + meta1["seaCoordinates"]
assert len(coords1) == 14 and len({tuple(point) for point in coords1}) == 14, "1회 개구리 좌표 고유성"
assert hashlib.sha256(ROUND1_ASSET.read_bytes()).hexdigest() == meta1["assetSha256"], "1회 완성 그림 검수 해시"

rgb = Image.open(ROUND1_ASSET).convert("RGB")
width, height = rgb.size
assert width >= 1400 and height >= 1000, "1회 섬 그림 인쇄 해상도"
assert all(0 <= x < width and 0 <= y < height for x, y in coords1), "1회 개구리 좌표 범위"
assert_monochrome_unfilled(rgb, "1회")
gray = rgb.convert("L")
components = dark_components(gray, threshold=80)
frogs = [
    component
    for component in components
    if 2100 <= component[0] <= 2500
    and 65 <= component[3] - component[1] + 1 <= 75
    and 55 <= component[4] - component[2] + 1 <= 65
]
assert len(frogs) == 14, f"1회 개구리 실루엣은 정확히 14개: {len(frogs)}"

# 메타 좌표마다 실제 개구리 실루엣이 정확히 하나 있어야 하며, 그림에 메타 밖의
# 개구리를 더 그려 넣어도 통과하지 못한다.
unmatched_frogs = list(frogs)
for expected_x, expected_y in coords1:
    matches = [
        component
        for component in unmatched_frogs
        if abs((component[1] + component[3]) / 2 - expected_x) <= 1
        and abs((component[2] + component[4]) / 2 - expected_y) <= 1
    ]
    assert len(matches) == 1, f"1회 개구리 좌표와 실루엣 불일치: {(expected_x, expected_y)}"
    unmatched_frogs.remove(matches[0])
assert not unmatched_frogs, "1회 검수 메타에 없는 개구리 실루엣"

base_rgb = Image.open(ROUND1_BASE).convert("RGB")
assert base_rgb.size == (width, height), "1회 배경과 완성 그림 크기 일치"
assert_monochrome_unfilled(base_rgb, "1회 배경")
base_gray = base_rgb.convert("L")
base_components = dark_components(base_gray, threshold=110)
frame_summary = max(base_components, key=lambda component: component[0])
assert frame_summary[0] > 60_000, "1회 외곽 프레임과 내부 경계가 한 구조로 연결"
assert frame_summary[1] < 20 and frame_summary[2] < 20
assert frame_summary[3] >= width - 20 and frame_summary[4] >= height - 30

# 닫힌 외곽 프레임이면 그림 가장자리의 바깥 흰 영역과 프레임 안의 두 큰 흰
# 영역이 서로 연결되지 않는다. 내부 경계가 만든 큰 영역도 정확히 둘이어야 한다.
base_labels, base_sizes = white_labels(base_gray)
edge_labels = {
    base_labels[y * width + x]
    for x, y in (
        *((x, 0) for x in range(width)),
        *((x, height - 1) for x in range(width)),
        *((0, y) for y in range(height)),
        *((width - 1, y) for y in range(height)),
    )
    if base_labels[y * width + x] >= 0
}
assert len(edge_labels) == 1, f"1회 닫힌 외곽 프레임 바깥 영역: {edge_labels}"
large_region_labels = {
    label
    for label, size in enumerate(base_sizes)
    if size > 100_000 and label not in edge_labels
}
assert len(large_region_labels) == 2, (
    f"1회 색칠·추적으로 구분되는 큰 영역은 정확히 둘: "
    f"{[base_sizes[label] for label in large_region_labels]}"
)

# 프레임 두께만 잘라 내면 남는 검은 구조는 내부 경계 한 가닥뿐이어야 한다.
# 그 경계가 위·아래에는 각각 한 번, 좌·우에는 한 번도 닿지 않는지도 픽셀로 확인한다.
point_components = dark_component_points(base_gray, threshold=110)
frame_points = max(point_components, key=len)
x0, y0, x1, y1 = component_box(frame_points)
frame_trim = 25
internal_boundary = {
    (x, y)
    for x, y in frame_points
    if x0 + frame_trim < x < x1 - frame_trim
    and y0 + frame_trim < y < y1 - frame_trim
}
assert component_count(internal_boundary) == 1, "1회 내부 경계는 정확히 한 가닥"
contact_depth = 70
contact_counts = {
    "topContacts": component_count(
        ((x, y) for x, y in internal_boundary if y <= y0 + contact_depth), diagonal=True
    ),
    "bottomContacts": component_count(
        ((x, y) for x, y in internal_boundary if y >= y1 - contact_depth), diagonal=True
    ),
    "leftContacts": component_count(
        ((x, y) for x, y in internal_boundary if x <= x0 + contact_depth), diagonal=True
    ),
    "rightContacts": component_count(
        ((x, y) for x, y in internal_boundary if x >= x1 - contact_depth), diagonal=True
    ),
}
assert contact_counts["topContacts"] >= 1 and contact_counts["bottomContacts"] >= 1, (
    f"1회 내부 경계가 위·아래 프레임 방향으로 이어져야 함: {contact_counts}"
)
assert contact_counts["leftContacts"] == 0 and contact_counts["rightContacts"] == 0, (
    f"1회 내부 경계가 좌·우 프레임과 닿으면 안 됨: {contact_counts}"
)

# 야자수 실루엣을 둘러싼 흰 영역을 섬으로 삼고, 메타의 모든 개구리 좌표가
# 실제로 섬 5마리·반대쪽 바다 9마리로 나뉘는지 확인한다.
palm_summary = max(
    (component for component in base_components if component != frame_summary),
    key=lambda component: component[0],
)
palm_label = surrounding_label(palm_summary, base_labels, width, height)
assert palm_label in large_region_labels, "1회 야자수가 큰 섬 영역 안에 있어야 함"
sea_labels = large_region_labels - {palm_label}
assert len(sea_labels) == 1, "1회 야자수 반대쪽 바다 영역"
sea_label = next(iter(sea_labels))

def nearby_region_label(x: int, y: int, radius: int = 45):
    counts = Counter(
        base_labels[py * width + px]
        for py in range(max(0, y - radius), min(height, y + radius + 1))
        for px in range(max(0, x - radius), min(width, x + radius + 1))
        if base_labels[py * width + px] in large_region_labels
    )
    assert counts, f"1회 개구리 주변의 큰 영역을 찾지 못함: {(x, y)}"
    return counts.most_common(1)[0][0]

assert all(nearby_region_label(x, y) == palm_label for x, y in meta1["islandCoordinates"]), (
    "1회 섬 개구리 5마리는 모두 야자수 쪽 영역"
)
assert all(nearby_region_label(x, y) == sea_label for x, y in meta1["seaCoordinates"]), (
    "1회 바다 개구리 9마리는 모두 야자수 반대쪽 영역"
)

assert ROUND2_ASSET.exists(), f"2회 섬 그림 누락: {ROUND2_ASSET}"
rgb2 = Image.open(ROUND2_ASSET).convert("RGB")
width2, height2 = rgb2.size
assert width2 >= 2000 and height2 >= 700, "2회 섬 그림 인쇄 해상도"
assert_monochrome_unfilled(rgb2, "2회")
gray2 = rgb2.convert("L")
components2 = dark_components(gray2)

meta2 = json.loads(ROUND2_META.read_text(encoding="utf-8"))
assert meta2["total"] == 37, "2회 개구리 전체 수"
assert meta2["island"] == 22 and meta2["sea"] == 15, "2회 섬·바다 개구리 배분"
coords2 = meta2["islandCoordinates"] + meta2["seaCoordinates"]
assert len(coords2) == 37 and len({tuple(point) for point in coords2}) == 37, "2회 개구리 좌표 고유성"
assert all(0 <= x < width2 and 0 <= y < height2 for x, y in coords2), "2회 개구리 좌표 범위"
asset_hash2 = hashlib.sha256(ROUND2_ASSET.read_bytes()).hexdigest()
assert asset_hash2 == meta2["assetSha256"], "2회 검수 메타와 실제 그림 해시 일치"

# 바깥 네모와 맞닿은 긴 경계가 하나의 큰 검은 구조가 되어야 한다. 네모만 있을
# 때보다 훨씬 큰 구조이므로 닫힌 섬 몇 개를 따로 그린 그림은 이 조건을 통과하지 못한다.
frame_boundary = max(components2, key=lambda component: component[0])
assert frame_boundary[0] > 35_000, "2회 경계가 네모 테두리와 실제로 연결되어야 함"
assert frame_boundary[1] < 20 and frame_boundary[2] < 20
assert frame_boundary[3] >= width2 - 20 and frame_boundary[4] >= height2 - 30

labels2, sizes2 = white_labels(gray2)
large_regions = [size for size in sizes2 if size > 100_000]
assert len(large_regions) == 2, f"2회 색칠·추적으로 구분되는 큰 영역은 정확히 둘: {large_regions}"
palm_x2 = round(width2 * 0.95)
palm_y2 = round(height2 * 0.50)
palm_label2 = labels2[palm_y2 * width2 + palm_x2]
assert palm_label2 >= 0 and sizes2[palm_label2] > 100_000, "2회 야자수 쪽 영역을 찾지 못함"

round1 = json.loads((PRIVATE / "original-form-round1-data.json").read_text(encoding="utf-8"))
round2 = json.loads((PRIVATE / "original-form-round2-data.json").read_text(encoding="utf-8"))
assert round1["questions"][3]["answer"] == "9마리"
assert round2["questions"][9]["answer"] == "15마리"

print(
    "원본형 섬 QA 통과: 1회 닫힌 외곽 프레임·내부 경계 1개·"
    "상/하 접점 1/1·좌/우 접점 0/0·큰 영역 2개·개구리 5/9, "
    "2회 큰 영역 2개·개구리 22/15"
)
