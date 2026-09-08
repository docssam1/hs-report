"""Check synthetic Final2 PDF artifacts; never reads learner records."""
import re
import sys
from pathlib import Path
from pypdf import PdfReader

folder = Path(sys.argv[1])
selected = [1, 3, 4, 6, 7, 8, 10, 11, 12, 15, 25, 26]
details = PdfReader(folder / 'final2-details-only.pdf')
package = PdfReader(folder / 'final2-report-package.pdf')
assert len(details.pages) == len(selected), 'Each verified explanation must fit one page'
texts = [p.extract_text() for p in details.pages]
for number, text in zip(selected, texts):
    assert re.search(rf'\b{number}번\s', text), f'Missing title: {number}'
    for label in ['정답', '읽을 조건', '풀이 전략', '검산', '주의할 점', '지필드 영재교육']:
        assert label in text, (number, label)
    assert '준비 중' not in text
    assert '석차 백분율' not in text, 'Diagnosis leaked into details-only printing'
assert '199번째' in texts[selected.index(7)]
assert '397' in texts[selected.index(7)]
assert '422' in texts[selected.index(15)]
assert '중점' in texts[selected.index(12)]
package_texts = [p.extract_text() for p in package.pages]
assert len(package.pages) >= len(details.pages) + 3
assert '진단 학습 패키지' in package_texts[0]
assert any('오답 기준 교재 연결표' in t for t in package_texts[:-12])
for page in package_texts:
    assert '지필드' in page, 'Every printed page needs a watermark'
    assert '상세 풀이 준비 중' not in page
for number, text in zip(selected, package_texts[-12:]):
    assert re.search(rf'\b{number}번\s', text), f'Package solution page mismatch: {number}'
    assert '주의할 점' in text
print('PASS synthetic PDFs: 12 complete one-page solutions, package sequence, watermarks, no pending pages')
