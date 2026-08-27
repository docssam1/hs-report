from collections import Counter
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "assets" / "original-form" / "gpt-island-maze-ribbon-v3.png"
PRIVATE = ROOT / ".private-work" / "original-similar-2rounds"


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


assert ASSET.exists(), f"섬 그림 누락: {ASSET}"
rgb = Image.open(ASSET).convert("RGB")
width, height = rgb.size
assert width >= 1200 and height >= 1200, "섬 그림 인쇄 해상도"

red, green, blue = rgb.split()
assert ImageStat.Stat(ImageChops.difference(red, green)).mean[0] < 1.0
assert ImageStat.Stat(ImageChops.difference(red, blue)).mean[0] < 1.0
gray = rgb.convert("L")
assert ImageStat.Stat(gray).mean[0] > 220, "땅과 바다를 색이나 짙은 면으로 구분하지 않아야 함"

frogs = [component for component in dark_components(gray) if 800 <= component[0] <= 1600]
assert len(frogs) == 19, f"개구리 실루엣 수: {len(frogs)}"

labels, sizes = white_labels(gray)
palm_x = round(width * 0.742)
palm_y = round(height * 0.175)
palm_label = labels[palm_y * width + palm_x]
assert palm_label >= 0 and sizes[palm_label] > 100_000, "야자수 연결 영역을 찾지 못함"
connected = sum(surrounding_label(frog, labels, width, height) == palm_label for frog in frogs)
assert connected == 7, f"야자수까지 물 없이 갈 수 있는 개구리 수: {connected}"
assert len(frogs) - connected == 12, "물을 건너야 하는 개구리 수"

round1 = json.loads((PRIVATE / "original-form-round1-data.json").read_text(encoding="utf-8"))
round2 = json.loads((PRIVATE / "original-form-round2-data.json").read_text(encoding="utf-8"))
assert round1["questions"][3]["answer"] == "7마리"
assert round2["questions"][9]["answer"] == "12마리"

print("원본형 무채색 섬·개구리 19마리·연결 7마리·바깥 12마리 QA 통과")
