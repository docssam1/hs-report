"""Require every authored explanation field to survive both synthetic PDF modes."""
import json
from pathlib import Path
import re
import subprocess
import sys
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
folder = Path(sys.argv[1])
node = sys.argv[2] if len(sys.argv) > 2 else 'node'
source = "const fs=require('fs'),vm=require('vm');const b={window:{}};vm.createContext(b);vm.runInContext(fs.readFileSync('final2-detailed-data.js','utf8'),b);process.stdout.write(JSON.stringify(b.window.GFIELD_FINAL2_DETAILED.items));"
items = json.loads(subprocess.check_output([node, '-e', source], cwd=root).decode('utf-8'))

def compact(value):
    # The embedded font extracts the centered ellipsis as a baseline ellipsis.
    return re.sub(r'\s+', '', str(value).replace('⋯', '…'))

def body_text(reader):
    lines = []
    for page in reader.pages:
        for line in page.extract_text().splitlines():
            value = line.strip()
            if value == '지필드 영재교육' or re.fullmatch(r'지필드 영재교육\s*·\s*.+\s학생', value):
                continue
            lines.append(line)
    return compact('\n'.join(lines))

def fields(item):
    for key in ['title', 'answer', 'read', 'method', 'check', 'caution']:
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
    """Bind text to its own numbered explanation, not anywhere in the PDF."""
    positions = []
    for item in entries:
        heading = compact(f'{item["no"]}번 {item["title"]}')
        assert output.count(heading) == 1, f'Expected one exact Q{item["no"]} title'
        positions.append((output.index(heading), item['no']))
    assert positions == sorted(positions), 'Detailed explanations must stay in question order'
    return {
        number: output[start:positions[index + 1][0] if index + 1 < len(positions) else len(output)]
        for index, (start, number) in enumerate(positions)
    }


# A field moved into another answer must not count as preserved.
control = question_sections(compact('1번 첫 풀이 올바른 내용 2번 둘째 풀이 잘못 옮긴 주의점'),
                            [{'no': 1, 'title': '첫 풀이'}, {'no': 2, 'title': '둘째 풀이'}])
assert compact('잘못 옮긴 주의점') not in control[1]

for filename in ['final2-details-only.pdf', 'final2-report-package.pdf']:
    output = body_text(PdfReader(folder / filename))
    sections = question_sections(output, items)
    count = 0
    for item in items:
        for locator, value in fields(item):
            assert compact(value) in sections[item['no']], f'{filename}: missing or misplaced Q{item["no"]} {locator}: {value}'
            count += 1
    print(f'PASS {filename}: {len(items)} complete explanations; {count} authored fields preserved in their own question')
