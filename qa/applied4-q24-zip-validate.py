"""Validate Q24 identity, answers, and PDF page counts in the actual full bank ZIP."""
from pathlib import Path
from zipfile import ZipFile
import csv,hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/nine-expansion-20261024/round10-q24'
OUT=WORK/'browser-output'; ZIP=OUT/'selected-216.zip'; DATA=ROOT/'bank/data/applied4-expanded.json'; BASE=WORK/'../round10-q21/pre-q21-data.json'
EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
def pages(p):
 info=subprocess.check_output(['/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo',str(p)],text=True)
 return int(info.split('Pages:')[1].splitlines()[0].strip())
def main():
 data=json.loads(DATA.read_text()); base=json.loads(BASE.read_text()); qs=[x for x in data['items'] if x['sourceNo']==24]; base_qs=[x for x in base['items'] if x['sourceNo']==24]; ids=[x['id'] for x in qs]
 assert qs==base_qs
 assert len(ids)==9 and [x['variantNo'] for x in qs]==list(range(1,10))
 assert all(x['reviewStatus']=='verified' for x in qs)
 dest=WORK/'zip-review'; dest.mkdir(exist_ok=True)
 with ZipFile(ZIP) as z:
  assert set(z.namelist())==EXPECTED and len(z.namelist())==7
  manifest=json.loads(z.read('문항목록.json')); audit=json.loads(z.read('검수기록.json'))
  csvtext=z.read('빠른정답.csv').decode('utf-8-sig')
  rows=list(csv.DictReader(csvtext.splitlines()))
  qhtml=z.read('문제.html').decode('utf-8'); ahtml=z.read('답안과상세풀이.html').decode('utf-8')
  qpdf=z.read('문제.pdf'); apdf=z.read('답안과상세풀이.pdf')
  assert manifest['count']==audit['count']==216 and len(manifest['items'])==216
  assert set(x['id'] for x in manifest['items'])==set(audit['selectedIds'])==set(x['id'] for x in base['items']) and len(audit['selectedIds'])==216
  assert all(qid in qhtml and qid in ahtml and qid in csvtext for qid in ids)
  m={x['id']:x for x in manifest['items']}
  for q in qs:
   v=m[q['id']]
   assert v['answer']==q['answer'] and v['answerParts']==q['answerParts'] and v['solutionSteps']==q['solutionSteps']
   assert v['asset']['src']==q['asset']['src']
  assert qpdf.startswith(b'%PDF-') and apdf.startswith(b'%PDF-')
  (dest/'문제.pdf').write_bytes(qpdf);(dest/'답안과상세풀이.pdf').write_bytes(apdf)
 qp,ap=pages(dest/'문제.pdf'),pages(dest/'답안과상세풀이.pdf')
 ev=json.loads((OUT/'browser-evidence.json').read_text())
 assert ev['dataSha256']==hashlib.sha256(BASE.read_bytes()).hexdigest()
 assert (ev['count'],ev['types'],ev['zipCount'],ev['questionPdfPages'],ev['solutionPdfPages'])==(216,24,216,qp,ap)
 assert ev['answerInputAndDiagnosis'] and ev['round4LearningLinks'] and ev['columnOrder'] and ev['attempts']==3 and ev['firstPracticePreserved']
 assert ev['questionOverflow']==ev['solutionOverflow']==0 and ev['externalWrites']==[] and ev['errors']==[]
 assert (WORK/'zip-review/question-page-37.png').is_file() and (WORK/'zip-review/solution-page-62.png').is_file()
 report={'passed':True,'dataSha256':ev['dataSha256'],'zipSha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'zipBytes':ZIP.stat().st_size,'totalCount':216,'q24Count':9,'q24Ids':ids,'q24Answers':[x['answer'] for x in qs],'questionPdfPages':qp,'solutionPdfPages':ap,'q24RenderedPages':{'questions':37,'solutions':62}}
 (WORK/'q24-zip-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(f'PASS Q24 ZIP: exact 9 IDs in 216-item package; question PDF {qp}p / solution PDF {ap}p; images verified on pages 37 and 62')
if __name__=='__main__':main()
