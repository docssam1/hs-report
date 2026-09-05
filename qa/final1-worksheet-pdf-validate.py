"""Validate real paged output, not a print-media DOM approximation."""
import sys
from pathlib import Path
from pypdf import PdfReader

base = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'tmp/pdfs/worksheet-v1'
cases = {
    'full90-both': (61, 17, []),
    'points2-both': (26, 9, [8]),
    'subset6-questions': (2, None, []),
    'subset6-answers': (3, 1, []),
    'subset6-both': (5, 3, []),
    'subset6-quick': (1, None, []),
    'subset9-both': (9, 5, [4]),
}
for name, (count, first_answer, blanks) in cases.items():
    reader = PdfReader(base / (name + '.pdf'))
    texts = [''.join((p.extract_text() or '').split()) for p in reader.pages]
    assert len(texts) == count, (name, 'page count', len(texts), count)
    actual_answer = next((i+1 for i, text in enumerate(texts) if '정답및풀이' in text), None)
    assert actual_answer == first_answer, (name, 'answer start', actual_answer, first_answer)
    assert [i+1 for i, text in enumerate(texts) if not text] == blanks, (name, 'blank faces')
    for i, text in enumerate(texts, 1):
        if i not in blanks:
            assert text.count('지필드영재교육') >= 2, (name, i, 'mandatory repeated watermark missing')
    if name.endswith('both'):
        assert first_answer % 2 == 1, (name, 'answers must start on a new sheet front')
    if name == 'full90-both':
        assert all('원문'+str(n)+'번' in texts[0] for n in range(1, 31)), 'all 30 original numbers on one cover'
    if name == 'subset6-quick':
        assert '빠른정답' in texts[0] and '조건읽기' not in texts[0] and '풀이방법' not in texts[0]
    print('PASS', name, count, 'pages; answer starts', first_answer, '; blank faces', blanks)
