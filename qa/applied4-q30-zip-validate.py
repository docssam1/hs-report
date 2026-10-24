"""Validate the final complete 234-item Applied 4 bank ZIP and Q21/Q24/Q30 payloads."""
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, subprocess

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/nine-expansion-20261024/round10-q30'
OUT=WORK/'browser-output'; ZIP=OUT/'selected-234.zip'
DATA=ROOT/'bank/data/applied4-expanded.json'
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
NEW_NOS=(21,24,30)

def pages(p):
    x=subprocess.check_output(['/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo',str(p)],text=True)
    return int(x.split('Pages:')[1].splitlines()[0].strip())

def main():
    d=json.loads(DATA.read_text()); ids=[q['id'] for q in d['items']]
    assert len(ids)==len(set(ids))==234 and d['availableSourceNos']==list(range(5,31))
    assert d['pendingSourceNos']==[1,2,3,4]
    new={no:[q for q in d['items'] if q['sourceNo']==no] for no in NEW_NOS}
    assert all(len(xs)==9 and [x['variantNo'] for x in xs]==list(range(1,10)) for xs in new.values())
    dest=WORK/'zip-review';dest.mkdir(exist_ok=True)
    with ZipFile(ZIP) as z:
        assert len(z.namelist())==7 and set(z.namelist())==EXPECTED
        manifest=json.loads(z.read('문항목록.json')); audit=json.loads(z.read('검수기록.json'))
        qhtml=z.read('문제.html').decode('utf-8'); ahtml=z.read('답안과상세풀이.html').decode('utf-8')
        csv=z.read('빠른정답.csv').decode('utf-8-sig')
        assert manifest['count']==audit['count']==234 and len(manifest['items'])==234
        mids=[x['id'] for x in manifest['items']]
        assert len(mids)==234 and set(mids)==set(ids)==set(audit['selectedIds'])
        mm={x['id']:x for x in manifest['items']}
        for q in d['items']:
            v=mm[q['id']]
            assert v['answer']==q['answer'] and v['answerParts']==q['answerParts']
            assert v['solutionSteps']==q['solutionSteps'] and v.get('asset',{}).get('src')==q.get('asset',{}).get('src')
            assert q['id'] in qhtml and q['id'] in ahtml and q['id'] in csv
        payload={}
        for name in ('문제.pdf','답안과상세풀이.pdf'):
            b=z.read(name); assert b.startswith(b'%PDF-'); (dest/name).write_bytes(b); payload[name]=hashlib.sha256(b).hexdigest()
    qp,ap=pages(dest/'문제.pdf'),pages(dest/'답안과상세풀이.pdf')
    ev=json.loads((OUT/'browser-evidence.json').read_text())
    data_sha=hashlib.sha256(DATA.read_bytes()).hexdigest()
    assert ev['dataSha256']==data_sha
    assert (ev['count'],ev['types'],ev['zipCount'],ev['questionPdfPages'],ev['solutionPdfPages'])==(234,26,234,qp,ap)
    assert ev['questionOverflow']==ev['solutionOverflow']==0
    assert ev['answerInputAndDiagnosis'] and ev['round4LearningLinks'] and ev['columnOrder']
    assert ev['attempts']==3 and ev['firstPracticePreserved'] and ev['externalWrites']==[] and ev['errors']==[]
    assert all((OUT/f'question-{no}.png').is_file() for no in NEW_NOS)
    assert all((OUT/f'solution-{no}.png').is_file() for no in NEW_NOS)
    report={'passed':True,'dataSha256':data_sha,'zipSha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),
            'zipBytes':ZIP.stat().st_size,'questionPdfSha256':payload['문제.pdf'],'solutionPdfSha256':payload['답안과상세풀이.pdf'],
            'totalCount':234,'types':26,'pendingSourceNos':[1,2,3,4],
            'newSourceItems':{str(no):[q['id'] for q in xs] for no,xs in new.items()},
            'questionPdfPages':qp,'solutionPdfPages':ap,
            'browserEvidence':{k:ev[k] for k in ('answerInputAndDiagnosis','round4LearningLinks','columnOrder','attempts','firstPracticePreserved','questionOverflow','solutionOverflow','externalWrites','errors')}}
    (WORK/'q30-zip-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f'PASS final ZIP: all 234 records and 26 types; Q21/Q24/Q30 each 9 IDs; {qp}-page questions / {ap}-page solutions; browser, input, diagnosis and 3 attempts verified')

if __name__=='__main__':main()
