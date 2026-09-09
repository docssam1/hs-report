"""Read-only PDF text preservation checks; not a substitute for visual review."""
import argparse
import json
from pathlib import Path
import re
import subprocess

from pypdf import PdfReader


def compact(value):
    return re.sub(r'\s+', '', str(value).replace('⋯', '…'))


def body_text(reader):
    lines = []
    for page in reader.pages:
        for line in (page.extract_text() or '').splitlines():
            value = line.strip()
            if value == '지필드 영재교육' or re.fullmatch(r'지필드 영재교육\s*·\s*.+\s학생', value):
                continue
            lines.append(line)
    return compact('\n'.join(lines))


def fields(item):
    # The resolver separately verifies the exact canonical/display binding.
    # A machine answer such as "144,233" need not be printed beside a full named answer.
    answer_key = 'displayAnswer' if 'displayAnswer' in item else 'answer'
    for key in ['title', answer_key, 'read', 'method', 'check', 'caution']:
        yield key, item[key]
    for index, step in enumerate(item['steps'], 1):
        for key in ['title', 'body']:
            yield f'step{index}.{key}', step[key]
        table = step.get('table')
        if table:
            yield f'step{index}.table.caption', table['caption']
            for column, value in enumerate(table['headers']):
                yield f'step{index}.table.header{column}', value
            for row_index, row in enumerate(table['rows']):
                for column, value in enumerate(row):
                    yield f'step{index}.table.row{row_index}.{column}', value


def question_sections(output, entries):
    assert entries, 'An empty explanation set is not a passing PDF'
    numbers = [item['no'] for item in entries]
    assert len(set(numbers)) == len(numbers), 'Duplicate question number'
    assert numbers == sorted(numbers), 'Input questions must be ordered'
    positions = []
    for item in entries:
        heading = compact(f'{item["no"]}번 {item["title"]}')
        assert output.count(heading) == 1, f'Expected one exact Q{item["no"]} title'
        positions.append((output.index(heading), item['no']))
    assert positions == sorted(positions), 'Printed questions must be ordered'
    return {
        number: output[start:positions[index + 1][0] if index + 1 < len(positions) else len(output)]
        for index, (start, number) in enumerate(positions)
    }


def self_test():
    named = dict(title='과일', answer='144,233', displayAnswer='바나나 144개, 사과 233개',
                 read='조건', method='방법', check='확인', caution='주의', steps=[])
    named_fields = dict(fields(named))
    assert named_fields['displayAnswer'] == named['displayAnswer']
    assert 'answer' not in named_fields, 'PDF checks must follow the full visible answer'
    entries = [{'no': 1, 'title': '첫 풀이'}, {'no': 2, 'title': '둘째 풀이'}]
    result = question_sections(compact('1번 첫 풀이 내용 2번 둘째 풀이 옮겨진 주의점'), entries)
    assert compact('옮겨진 주의점') not in result[1], 'Cross-question content must not pass'
    invalid = [
        ('', []),
        ('1번 첫 풀이 1번 첫 풀이 2번 둘째 풀이', entries),
        ('2번 둘째 풀이 1번 첫 풀이', entries),
        ('1번 첫 풀이', entries),
        ('1번 첫 풀이', [entries[0], entries[0]]),
    ]
    for text, items in invalid:
        try:
            question_sections(compact(text), items)
        except AssertionError:
            continue
        raise AssertionError('A negative PDF content control unexpectedly passed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--round', type=int, choices=range(2, 6))
    parser.add_argument('--folder', type=Path)
    parser.add_argument('--node', default='node')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    self_test()
    if args.self_test:
        print('PASS PDF content negative controls; no production data or PDF written')
        return
    if args.round is None or args.folder is None:
        parser.error('--round and --folder are required unless --self-test is used')
    root = Path(__file__).resolve().parent.parent
    source = (
        "const fs=require('fs'),vm=require('vm');const b={window:{}};vm.createContext(b);"
        f"vm.runInContext(fs.readFileSync('final{args.round}-detailed-data.js','utf8'),b);"
        f"process.stdout.write(JSON.stringify(b.window.GFIELD_FINAL{args.round}_DETAILED.items));"
    )
    items = json.loads(subprocess.check_output([args.node, '-e', source], cwd=root).decode('utf-8'))
    assert items, 'No authored explanations loaded'
    for mode in ['details-only', 'report-package']:
        filename = f'final{args.round}-{mode}.pdf'
        reader = PdfReader(args.folder / filename)
        sections = question_sections(body_text(reader), items)
        count = 0
        for item in items:
            for locator, value in fields(item):
                assert compact(value), f'Empty Q{item["no"]} {locator}'
                assert compact(value) in sections[item['no']], f'{filename}: missing or misplaced Q{item["no"]} {locator}'
                count += 1
        print(f'PASS {filename}: {len(reader.pages)} pages, {len(items)} explanations, {count} fields in their own question; visual gate separate')


if __name__ == '__main__':
    main()
