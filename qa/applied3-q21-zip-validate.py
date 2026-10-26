#!/usr/bin/env python3
"""Validate the actual Applied 3 207-item ZIP and its Q21/Q04 content."""
import csv
import hashlib
import html
import io
import json
import re
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied3-expanded.json"
INDEX = ROOT / "bank/data/applied3-expanded-index.json"
ZIP_PATH = ROOT / ".private-work/hw-expansion-20261023/hw3/output-qa/selected-207.zip"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw3/q12-review/q12-zip-audit-r9.json"
EXPECTED_MEMBERS = {
    "문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
    "빠른정답.csv", "문항목록.json", "검수기록.json",
}


def require(condition, message):
    if not condition:
        raise AssertionError(message)


data = json.loads(DATA.read_text())
index = json.loads(INDEX.read_text())
items = data["items"]
require(len(items) == 207, f"expected 207 bank items, got {len(items)}")
require(len(data["availableSourceNos"]) == 23, "expected 23 reviewed source types")
require(all(sum(x["sourceNo"] == no for x in items) == 9 for no in data["availableSourceNos"]),
        "a reviewed source type does not have exactly nine variants")
require(index["itemCount"] == len(items) and index["version"] == data["version"],
        "adapter index count/version differs from data")

with zipfile.ZipFile(ZIP_PATH) as archive:
    require(set(archive.namelist()) == EXPECTED_MEMBERS, "ZIP member set is incomplete or unexpected")
    require(archive.testzip() is None, "ZIP CRC failure")
    manifest = json.loads(archive.read("문항목록.json"))
    build_record = json.loads(archive.read("검수기록.json"))
    exported = manifest["items"]
    expected_ids = [x["id"] for x in items]
    require(manifest["version"] == data["version"], "ZIP data version mismatch")
    require(manifest["count"] == 207 and [x["id"] for x in exported] == expected_ids,
            "ZIP question manifest does not exactly match all 207 bank IDs")
    require(build_record["count"] == 207 and build_record["selectedIds"] == expected_ids,
            "ZIP export record does not contain all selected IDs")
    require(set(build_record["includes"]) == EXPECTED_MEMBERS - {"검수기록.json"},
            "ZIP export record omits a required deliverable")

    rows = list(csv.DictReader(io.StringIO(archive.read("빠른정답.csv").decode("utf-8-sig"))))
    require(len(rows) == 207, "quick-answer count mismatch")
    require([row["문항ID"] for row in rows] == expected_ids, "quick-answer IDs/order mismatch")
    require([row["정답"] for row in rows] == [x["answer"] for x in items],
            "quick answers differ from reviewed data")

    qhtml = archive.read("문제.html").decode("utf-8")
    ahtml = archive.read("답안과상세풀이.html").decode("utf-8")
    q_ids = re.findall(r'data-item-id="([^"]+)"', qhtml)
    a_ids = re.findall(r'data-answer-id="([^"]+)"', ahtml)
    require(q_ids == expected_ids, "problem HTML IDs/order mismatch")
    require(a_ids == expected_ids, "answer/solution HTML IDs/order mismatch")
    for no in range(1, 10):
        ident = f"applied3-q21-v{no}"
        require(qhtml.count(f'data-item-id="{ident}"') == 1, f"missing Q21 problem {no}")
        require(ahtml.count(f'data-answer-id="{ident}"') == 1, f"missing Q21 solution {no}")
    normalized_q = html.unescape(re.sub(r"<[^>]+>", " ", qhtml))
    normalized_a = html.unescape(re.sub(r"<[^>]+>", " ", ahtml))
    require("□□ ÷ □ = □" in normalized_q, "Q21 blank-box division structure is missing from problem output")
    require(all(f"applied3-q04-v{no}" in qhtml and f"applied3-q04-v{no}" in ahtml for no in range(1,10)),
            "one or more Q04 variants are missing from problem/solution HTML")
    require("18×55=990" in normalized_a and "1008=18×56" in normalized_a,
            "Q04 first solution is missing the lower-multiple minimality proof")
    require(all(f"applied3-q12-v{no}" in qhtml and f"applied3-q12-v{no}" in ahtml for no in range(1,10)),
            "one or more Q12 variants are missing from problem/solution HTML")
    require("12시간 표시 시계" in normalized_q and "30일 0시간" in normalized_a and "7일 12시간" in normalized_a,
            "Q12 question condition or mixed day/hour solutions are missing")
    require(6 in data["pendingSourceNos"] and 6 not in data["availableSourceNos"],
            "Q06 source answer conflict is not locked")
    require(not any(x["sourceNo"] == 6 for x in items),
            "locked Q06 variants leaked into the exported ZIP")
    require("학습 위치" in normalized_a and "학습 포인트" in normalized_a,
            "solution learning location/point links are missing")
    q_sections = re.findall(r'<section\b[^>]*class="page[^\"]*"[^>]*>.*?</section>', qhtml, re.S)
    a_sections = re.findall(r'<section\b[^>]*class="page[^\"]*"[^>]*>.*?</section>', ahtml, re.S)
    q12_items = [x for x in items if x["sourceNo"] == 12]
    q12_q_pages = {x["id"]: [i + 1 for i, section in enumerate(q_sections)
                              if f'data-item-id="{x["id"]}"' in section]
                   for x in q12_items}
    q12_a_pages = {x["id"]: [i + 1 for i, section in enumerate(a_sections)
                              if f'data-answer-id="{x["id"]}"' in section]
                   for x in q12_items}
    require(len(q12_items) == 9 and all(len(v) == 1 for v in q12_q_pages.values())
            and all(len(v) == 1 for v in q12_a_pages.values()),
            "each Q12 variant must appear on exactly one problem and solution page")
    q12_question_pages = sorted({v[0] for v in q12_q_pages.values()})
    q12_solution_pages = sorted({v[0] for v in q12_a_pages.values()})
    q21_q_pages = [i + 1 for i, section in enumerate(q_sections) if 'data-item-id="applied3-q21-v1"' in section]
    q21_a_pages = [i + 1 for i, section in enumerate(a_sections) if 'data-answer-id="applied3-q21-v1"' in section]
    require(len(q21_q_pages) == 1 and len(q21_a_pages) == 1,
            "Q21 first problem/solution must each appear on exactly one output page")

    pdf_info = {}
    for name in ("문제.pdf", "답안과상세풀이.pdf"):
        reader = PdfReader(io.BytesIO(archive.read(name)))
        require(reader.pages, f"{name} contains no pages")
        a4 = all(abs(float(p.mediabox.width) - 595.28) < 1 and
                 abs(float(p.mediabox.height) - 841.89) < 1 for p in reader.pages)
        require(a4, f"{name} has non-A4 pages")
        pdf_info[name] = {"pages": len(reader.pages), "a4": True}

    evidence = {
        "version": data["version"],
        "count": 207,
        "sourceTypes": 23,
        "itemsPerSource": 9,
        "zipMembers": sorted(archive.namelist()),
        "zipCrc": "pass",
        "problemAndSolutionIDsMatch": True,
        "quickAnswersMatchData": True,
        "q12VariantIDs": [f"applied3-q12-v{n}" for n in range(1, 10)],
        "q12AnswerValues": [x["answer"] for x in items if x["sourceNo"] == 12],
        "q12QuestionPdfPages": q12_question_pages,
        "q12SolutionPdfPages": q12_solution_pages,
        "q06Locked": True,
        "q04VariantIDs": [f"applied3-q04-v{n}" for n in range(1, 10)],
        "q21VariantIDs": [f"applied3-q21-v{n}" for n in range(1, 10)],
        "q21AnswerValues": [x["answer"] for x in items if x["sourceNo"] == 21],
        "q21ProblemHtmlPage": q21_q_pages[0],
        "q21SolutionHtmlPage": q21_a_pages[0],
        "pdf": pdf_info,
        "dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
        "indexSha256": hashlib.sha256(INDEX.read_bytes()).hexdigest(),
        "zipSha256": hashlib.sha256(ZIP_PATH.read_bytes()).hexdigest(),
        "zipBytes": ZIP_PATH.stat().st_size,
    }

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied3 207-item ZIP: seven required members, matching problem/solution IDs and answers, Q04/Q12/Q21 variants, Q06 locked, A4 PDFs")
print(json.dumps(evidence, ensure_ascii=False))
