"""Validate Q21 identities and the actual full 225-item question/solution ZIP."""
from pathlib import Path
from zipfile import ZipFile
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/nine-expansion-20261024/round10-q21';OUT=WORK/'browser-output'
DATA=ROOT/'bank/data/applied4-expanded.json';BASE=ROOT/'.private-work/nine-expansion-20261024/round10-q30/pre-q30-data.json';ZIP=OUT/'selected-225.zip';EXPECTED={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}
def pages(p):
 x=subprocess.check_output(['/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo',str(p)],text=True)
 return int(x.split('Pages:')[1].splitlines()[0].strip())
def main():
 d=json.loads(DATA.read_text());base=json.loads(BASE.read_text());qs=[x for x in d['items'] if x['sourceNo']==21];base_qs=[x for x in base['items'] if x['sourceNo']==21];ids=[x['id'] for x in qs]
 assert qs==base_qs
 assert len(ids)==9 and [x['variantNo'] for x in qs]==list(range(1,10)) and all(x['reviewStatus']=='verified' for x in qs)
 dest=WORK/'zip-review';dest.mkdir(exist_ok=True)
 with ZipFile(ZIP) as z:
  assert len(z.namelist())==7 and set(z.namelist())==EXPECTED
  m=json.loads(z.read('문항목록.json'));a=json.loads(z.read('검수기록.json'));qhtml=z.read('문제.html').decode();ah=z.read('답안과상세풀이.html').decode();csv=z.read('빠른정답.csv').decode('utf-8-sig')
  assert m['count']==a['count']==225 and len(m['items'])==225
  assert set(x['id'] for x in m['items'])==set(a['selectedIds'])==set(x['id'] for x in base['items'])
  assert len(a['selectedIds'])==225
  mm={x['id']:x for x in m['items']}
  for q in qs:
   v=mm[q['id']]
   assert v['answer']==q['answer'] and v['answerParts']==q['answerParts'] and v['solutionSteps']==q['solutionSteps']
   assert v['asset']['src']==q['asset']['src'] and q['id'] in qhtml and q['id'] in ah and q['id'] in csv
  qp=z.read('문제.pdf');ap=z.read('답안과상세풀이.pdf');assert qp.startswith(b'%PDF-') and ap.startswith(b'%PDF-')
  (dest/'문제.pdf').write_bytes(qp);(dest/'답안과상세풀이.pdf').write_bytes(ap)
 qpages,apages=pages(dest/'문제.pdf'),pages(dest/'답안과상세풀이.pdf')
 ev=json.loads((OUT/'browser-evidence.json').read_text())
 assert ev['dataSha256']==hashlib.sha256(BASE.read_bytes()).hexdigest()
 assert (ev['count'],ev['types'],ev['zipCount'],ev['questionPdfPages'],ev['solutionPdfPages'])==(225,25,225,qpages,apages)
 assert ev['questionOverflow']==ev['solutionOverflow']==0 and ev['answerInputAndDiagnosis'] and ev['round4LearningLinks'] and ev['columnOrder'] and ev['attempts']==3 and ev['firstPracticePreserved'] and ev['externalWrites']==[] and ev['errors']==[]
 assert (WORK/'zip-review/question-page-33.png').is_file() and (WORK/'zip-review/solution-page-55.png').is_file()
 report={'passed':True,'dataSha256':ev['dataSha256'],'zipSha256':hashlib.sha256(ZIP.read_bytes()).hexdigest(),'zipBytes':ZIP.stat().st_size,'totalCount':225,'q21Count':9,'q21Ids':ids,'q21Answers':[x['answer'] for x in qs],'questionPdfPages':qpages,'solutionPdfPages':apages,'q21RenderedPages':{'questions':33,'solutions':55}}
 (WORK/'q21-zip-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(f'PASS Q21 ZIP: exact nine Q21 IDs in 225-item archive; question PDF {qpages}p / solution PDF {apages}p; Q21 pages 33 and 55 rendered')
if __name__=='__main__':main()
