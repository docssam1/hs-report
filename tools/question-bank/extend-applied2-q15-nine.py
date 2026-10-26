"""Add nine independently checked paper-fold/cut variants for Applied 2 Q15."""

from __future__ import annotations

import json
from fractions import Fraction as Q
from pathlib import Path

from applied2_q15_topology import pieces, pieces_by_faces

ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = ROOT / "bank/data/applied2-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied2-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied2"
VERSION = "20261026-applied2-q15-paper-fold-cut-r1"

# Number of horizontal strips (one fewer actual folds), folded-strip height,
# full width, left/right cut stations, and the U-cut height.
VARIANTS = [
    (3, 2, 7, 2, 5, 1),
    (4, 2, 8, 2, 6, 1),
    (5, 2, 9, 3, 6, 1),
    (3, 3, 8, 2, 6, 1),
    (4, 3, 9, 3, 6, 2),
    (5, 3, 10, 3, 7, 1),
    (3, 4, 10, 3, 7, 2),
    (4, 4, 11, 3, 8, 1),
    (5, 4, 12, 4, 8, 2),
]


def folded_svg(params: tuple[int, ...]) -> str:
    layers, height, width, left, right, notch = params
    x0, y0, w, h = 65, 30, 410, 125

    def x(value):
        return x0 + w * value / width

    def y(value):
        return y0 + h - h * value / height

    # The small visible stepped edges denote individual sheets, not a solved net.
    sheets = "".join(
        f'<path d="M {x0+w+i*5} {y0+i*3} h 11 v {h-7} h -11" '
        'fill="none" stroke="#777" stroke-width="1.3"/>'
        for i in range(1, layers)
    )
    cuts = (f'M {x(0):.1f} {y(0):.1f} L {x(left):.1f} {y(height):.1f} '
            f'M {x(right):.1f} {y(height):.1f} L {x(width):.1f} {y(0):.1f} '
            f'M {x(left):.1f} {y(0):.1f} L {x(left):.1f} {y(notch):.1f} '
            f'L {x(right):.1f} {y(notch):.1f} L {x(right):.1f} {y(0):.1f}')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="560" height="200" '
            f'viewBox="0 0 560 200" role="img" '
            f'aria-label="{layers}겹으로 접힌 종이에 양쪽 사선과 가운데 ㄷ자 절단선">'
            '<rect width="560" height="200" fill="white"/>'
            + sheets + f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" '
            'fill="#f7f7f7" stroke="#191511" stroke-width="1.8"/>'
            + f'<path d="{cuts}" fill="none" stroke="#191511" stroke-width="3.2" '
            'stroke-linejoin="round"/>'
            + f'<path d="M 45 {y0} h 11 M 45 {y0+h} h 11 M 50 {y0} V {y0+h}" '
            'fill="none" stroke="#666" stroke-width="1"/>'
            + f'<text x="15" y="{y0+h/2+7}" fill="#191511" '
            f'font-family="Noto Serif KR,serif" font-size="17">{height}cm</text>'
            + f'<text x="{x(left)-23:.1f}" y="{y(notch)-7:.1f}" '
            f'fill="#191511" font-family="Noto Serif KR,serif" font-size="16">{notch}cm</text>'
            + '</svg>\n')


def unfolded_svg(params: tuple[int, ...]) -> str:
    layers, height, width, left, right, notch = params
    full_height = layers * height
    scale = min(350 / width, 340 / full_height)
    x0, y0 = 55, 35

    def transform(p):
        return x0 + float(p[0]) * scale, y0 + float(p[1]) * scale

    cuts = [(Q(0), Q(0)), (Q(left), Q(height))]
    raw_segments = [
        (cuts[0], cuts[1]),
        ((Q(right), Q(height)), (Q(width), Q(0))),
        ((Q(left), Q(0)), (Q(left), Q(notch))),
        ((Q(left), Q(notch)), (Q(right), Q(notch))),
        ((Q(right), Q(notch)), (Q(right), Q(0))),
    ]
    cut_lines = []
    for strip in range(layers):
        def lift(p):
            xx, yy = p
            return xx, Q(strip*height) + (Q(height)-yy if strip % 2 == 0 else yy)
        for a, b in raw_segments:
            xa, ya = transform(lift(a))
            xb, yb = transform(lift(b))
            cut_lines.append(f'<line x1="{xa:.2f}" y1="{ya:.2f}" '
                             f'x2="{xb:.2f}" y2="{yb:.2f}"/>')
    folds = ''.join(
        f'<line x1="{x0:.2f}" y1="{y0+i*height*scale:.2f}" '
        f'x2="{x0+width*scale:.2f}" y2="{y0+i*height*scale:.2f}"/>'
        for i in range(1, layers)
    )
    answer, graph = pieces(layers, Q(notch), Q(left), Q(right), Q(width), Q(height), True, True)
    faces = pieces_by_faces(graph)
    assert len(faces) == answer
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="440" height="{int(y0+full_height*scale+40)}" '
            f'viewBox="0 0 440 {int(y0+full_height*scale+40)}" role="img" '
            f'aria-label="펼친 종이의 절단선과 {answer}개 조각">'
            '<rect width="100%" height="100%" fill="white"/>'
            f'<rect x="{x0}" y="{y0}" width="{width*scale:.2f}" '
            f'height="{full_height*scale:.2f}" fill="#fafafa" '
            'stroke="#191511" stroke-width="1.6"/>'
            '<g fill="none" stroke="#bbb" stroke-width="1" stroke-dasharray="3 4">'
            + folds + '</g><g fill="none" stroke="#191511" stroke-width="2.3">'
            + ''.join(cut_lines) + '</g></svg>\n')


def make_item(number: int, params: tuple[int, ...]) -> dict:
    layers, height, width, left, right, notch = params
    answer, graph = pieces(layers, Q(notch), Q(left), Q(right), Q(width), Q(height), True, True)
    assert answer == len(pieces_by_faces(graph))
    folds = layers - 1
    total_height = layers * height
    steps = [
        f"세로 {total_height}cm를 {height}cm씩 접었으므로 겹친 종이는 {layers}층입니다. "
        "아래쪽 접힌 변을 기준으로 각 층의 절단선을 위아래로 번갈아 뒤집어 펼칩니다.",
        "왼쪽·오른쪽 사선과 가운데 ㄷ자 선이 각 층에 남기는 경계를 "
        "아래 풀이 그림처럼 모두 이어 그립니다. 점선은 접었던 자리이고 절단선이 아닙니다.",
        f"펼친 종이에서 절단선으로 실제 분리된 부분을 세면 {answer}조각입니다. "
        "접힌 선만으로 나뉜 칸은 별도 조각으로 세지 않습니다.",
    ]
    return {
        "id": f"applied2-q15-v{number}", "genId": "applied2-q15",
        "sourceSet": "applied", "sourceRound": 2, "sourceNo": 15,
        "variantNo": number, "reviewStatus": "verified", "area": "도형",
        "subarea": "접기와 자르기", "detailType": "접힌 종이를 펼친 뒤 조각 수 세기",
        "pointBand": "3.4",
        "text": f"세로가 {total_height}cm인 직사각형 종이를 {height}cm씩 포개어 "
                f"{folds}번 접었습니다. 그림에서 아래쪽 긴 변은 접힌 쪽입니다. "
                "겹친 종이를 굵은 선을 따라 모두 자르고 펼쳤을 때, "
                "종이는 몇 조각이 되나요?",
        "answer": f"{answer}조각", "answerContract": "ordered-parts",
        "answerParts": [answer], "answerLabels": ["조각 수"],
        "acceptedAnswers": [str(answer), f"{answer}조각"],
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "접힌 층마다 절단선을 뒤집어 펼치고 실제로 떨어지는 조각만 세기",
        "learningLocation": "활용 2회 · 원문 15번 · 종이 접기와 자르기",
        "verification": {
            "primaryMethod": "유리수 좌표로 펼친 절단선의 교점을 분할하고 평면 그래프의 오일러 식으로 영역 수 계산",
            "independentMethod": "각 유향 모서리를 따라 모든 닫힌 면을 순회하여 양의 넓이를 가진 조각 수 계산",
            "parameters": {"layers": layers, "folds": folds, "foldedHeightCm": height,
                           "widthCm": width, "leftStationCm": left,
                           "rightStationCm": right, "notchHeightCm": notch,
                           "answer": answer},
            "sourceExamPage": 3, "sourceTextDirectlyReviewed": True,
            "sourceFigureDirectlyReviewed": True, "sourceTeacherAnswer": 9,
            "independentSourceAnswer": 9,
            "sourceLecture": "https://www.youtube.com/watch?v=tSfYVTY0AGM&t=889s",
            "sourceExamSha256": "1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab",
            "originalFigurePreserved": True, "variantFiguresCreatedFresh": True,
            "independentMethodAgrees": True,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중",
                               "sourceReasoningPreserved": True, "measuredVariantRate": None},
        "asset": {"kind": "svg", "src": f"assets/applied2/q15-v{number}.svg",
                  "description": "접힌 직사각형 종이의 두 사선과 가운데 ㄷ자 절단선"},
        "solutionAsset": {"kind": "svg", "src": f"assets/applied2/q15-v{number}-solution.svg",
                          "description": "펼친 종이의 절단선", "caption": "실선은 자른 자리, 점선은 접었던 자리"},
    }


def main():
    source, graph = pieces(4, Q(1), Q(2), Q(4), Q(6), Q(2), True, True)
    assert source == len(pieces_by_faces(graph)) == 9
    data = json.loads(DATA_FILE.read_text())
    assert data["version"] == "20261026-applied2-q13-hinged-rods-r1"
    assert 15 in data["pendingSourceNos"]
    assert not any(i["sourceNo"] == 15 for i in data["items"])
    items = [make_item(i, params) for i, params in enumerate(VARIANTS, 1)]
    assert len({tuple(params) for params in VARIANTS}) == 9
    for i, params in enumerate(VARIANTS, 1):
        (ASSET_DIR / f"q15-v{i}.svg").write_text(folded_svg(params))
        (ASSET_DIR / f"q15-v{i}-solution.svg").write_text(unfolded_svg(params))
    data["items"].extend(items)
    data["items"].sort(key=lambda item: (item["sourceNo"], item["variantNo"]))
    data["version"] = VERSION
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"]) | {15})
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 15]
    data["sourceEditionNotes"]["15"] = (
        "원문 p.3 세로8cm를 세 번 접어 2cm가 된 그림과 강의 14:50의 9조각을 "
        "펼친 절단선 평면 그래프와 각 면 순회로 독립 재현. 변형은 접기 횟수·치수·절단 위치를 바꾸되 "
        "양쪽 사선과 가운데 ㄷ자 절단 구조를 보존하고 새 그림9개 제작."
    )
    data["reviewSummary"]["independentMathCount"] += 9
    data["reviewSummary"]["sourceTypes"] += 1
    data["reviewSummary"]["sourceDrawingCount"] += 1
    data["reviewSummary"]["outputReviewed"] = False
    data["itemCount"] = len(data["items"])
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    index = json.loads(INDEX_FILE.read_text())
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    first = items[0]
    index["items"].append({k: first[k] for k in (
        "sourceNo", "genId", "area", "subarea", "detailType", "pointBand", "reviewStatus")}
        | {"variantCount": 9})
    index["items"].sort(key=lambda item: item["sourceNo"])
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Applied 2 Q15: nine variants; original {source} pieces independently confirmed")


if __name__ == "__main__":
    main()
