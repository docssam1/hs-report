from collections import Counter
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
ROUND1_ASSET = ROOT / "assets" / "original-form" / "gpt-island-boundary-connected-r2-v2.png"
ROUND2_ASSET = ROOT / "assets" / "original-form" / "rigor-r2-q10-island-37-v1.png"
PRIVATE = ROOT / ".private-work" / "original-similar-2rounds"
ROUND2_META = PRIVATE / "rigor-r2-q10-island-37-v1.meta.json"


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
    assert ImageStat.Stat(rgb.convert("L")).mean[0] > 220, f"{label}: 땅과 바다를 미리 색칠하지 않음"


assert ROUND1_ASSET.exists(), f"1회 섬 그림 누락: {ROUND1_ASSET}"
rgb = Image.open(ROUND1_ASSET).convert("RGB")
width, height = rgb.size
assert width >= 1400 and height >= 1000, "1회 섬 그림 인쇄 해상도"
assert_monochrome_unfilled(rgb, "1회")
gray = rgb.convert("L")
components = dark_components(gray)
frogs = [component for component in components if 800 <= component[0] <= 1100]
assert len(frogs) == 33, f"1회 개구리는 충분히 많이 배치: {len(frogs)}"

frame_boundary = max(components, key=lambda component: component[0])
assert frame_boundary[0] > 60_000, "1회 경계가 네모 테두리와 실제로 연결되어야 함"
assert frame_boundary[1] < 20 and frame_boundary[2] < 20
assert frame_boundary[3] >= width - 20 and frame_boundary[4] >= height - 30

labels, sizes = white_labels(gray)
large_regions = [size for size in sizes if size > 100_000]
assert len(large_regions) == 2, f"1회 색칠·추적으로 구분되는 큰 영역은 정확히 둘: {large_regions}"
palm_x = round(width * 0.725)
palm_y = round(height * 0.36)
palm_label = labels[palm_y * width + palm_x]
assert palm_label >= 0 and sizes[palm_label] > 100_000, "1회 야자수 연결 영역을 찾지 못함"
island_frogs = sum(surrounding_label(frog, labels, width, height) == palm_label for frog in frogs)
assert island_frogs == 26, f"1회 야자수 쪽 개구리 수: {island_frogs}"
assert len(frogs) - island_frogs == 7, "1회 바다 쪽 개구리 수"

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
assert round1["questions"][3]["answer"] == "7마리"
assert round2["questions"][9]["answer"] == "15마리"

print("원본형 섬 QA 통과: 두 회 모두 무채색·단일 연결 경계·큰 영역 2개, 1회 33마리/바다 7마리, 2회 37마리/바다 15마리")
