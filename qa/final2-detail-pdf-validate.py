"""Check synthetic Final2 PDF artifacts; never reads learner records."""
import re
import sys
from pathlib import Path
from pypdf import PdfReader

folder = Path(sys.argv[1])
selected = list(range(1, 31))
continuations = {5, 9, 13, 16, 23, 27, 28}
page_counts = {number: (3 if number == 27 else 2 if number in continuations else 1) for number in selected}
expected_detail_pages = sum(page_counts.values())
details = PdfReader(folder / 'final2-details-only.pdf')
package = PdfReader(folder / 'final2-report-package.pdf')
assert len(details.pages) == expected_detail_pages, 'Reviewed explanations must use the exact approved page plan'
texts = [p.extract_text() for p in details.pages]

def group_solution_pages(page_texts):
    groups = {}
    cursor = 0
    for number in selected:
        count = page_counts[number]
        group = page_texts[cursor:cursor + count]
        assert len(group) == count, f'Missing pages for Q{number}'
        assert re.search(rf'\b{number}번\s', group[0]), f'Missing title: {number}'
        for continuation in group[1:]:
            assert f'{number}번 풀이 계속' in continuation, f'Missing continuation heading: {number}'
        groups[number] = group
        cursor += count
    assert cursor == len(page_texts), 'Unexpected extra solution page'
    return groups

def validate_solution_groups(page_texts):
    groups = group_solution_pages(page_texts)
    for number, pages in groups.items():
        text = '\n'.join(pages)
        for page in pages:
            assert '지필드' in page, f'Missing watermark on Q{number} page'
        for label in ['정답', '읽을 조건', '풀이 전략', '검산', '주의할 점']:
            assert label in text, (number, label)
        assert '준비 중' not in text
        assert '석차 백분율' not in text, 'Diagnosis leaked into details-only printing'
    return groups

def educational_body(pages):
    """Exclude known watermark lines; compare all body characters in order.

    PDF text extraction may insert spaces at font-run boundaries (216km / 를).
    Page structure, required fields and watermarks are asserted separately.
    """
    text = '\n'.join(pages)
    # A fixed watermark can be extracted as a standalone line or appended to
    # the preceding text run. Remove only the two exact watermark forms.
    text = re.sub(r'지필드 영재교육\s*·\s*[^\n]*?\s학생', '', text)
    text = text.replace('지필드 영재교육', '')
    return re.sub(r'\s+', '', text)

detail_groups = validate_solution_groups(texts)
for number, group in detail_groups.items():
    text = '\n'.join(group)
    for label in ['정답', '읽을 조건', '풀이 전략', '검산', '주의할 점', '지필드 영재교육']:
        assert label in text, (number, label)
assert '199번째' in '\n'.join(detail_groups[7])
assert '397' in '\n'.join(detail_groups[7])
assert '39개' in '\n'.join(detail_groups[2])
assert '5번 풀이 계속' in detail_groups[5][1]
assert '9번 풀이 계속' in detail_groups[9][1]
assert '13번 풀이 계속' in detail_groups[13][1]
assert '16번 풀이 계속' in detail_groups[16][1]
assert '23번 풀이 계속' in detail_groups[23][1]
assert '422' in '\n'.join(detail_groups[15])
assert '중점' in '\n'.join(detail_groups[12])
assert '27번 풀이 계속' in detail_groups[27][1]
assert '27번 풀이 계속' in detail_groups[27][2]
assert '28번 풀이 계속' in detail_groups[28][1]
package_texts = [p.extract_text() for p in package.pages]
front_pages = len(package.pages) - expected_detail_pages
assert 10 <= front_pages <= 24, 'Report package front matter is outside the reviewed compact range'
assert '진단 학습 패키지' in package_texts[0]
assert any('오답 기준 교재 연결표' in t for t in package_texts[:-expected_detail_pages])
for page in package_texts:
    assert '지필드' in page, 'Every printed page needs a watermark'
    assert '상세 풀이 준비 중' not in page
package_groups = validate_solution_groups(package_texts[-expected_detail_pages:])
for number in selected:
    assert educational_body(package_groups[number]) == educational_body(detail_groups[number]), f'Package educational body mismatch: {number}'
print(f'PASS synthetic PDFs: 30 complete solution groups, eight headed continuation pages, {expected_detail_pages} detail pages, {front_pages} report pages, package sequence, watermarks, no pending pages')
