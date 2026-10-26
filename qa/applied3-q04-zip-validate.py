"""Validate the actual complete Applied3 ZIP after adding Q04."""
import csv, hashlib, html, io, json, re, zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'bank/data/applied3-expanded.json'
INDEX = ROOT / 'bank/data/applied3-expanded-index.json'
ZIP_PATH = ROOT / '.private-work/hw-expansion-20261023/hw3/output-qa/selected-207.zip'
OUT = ROOT / '.private-work/hw-expansion-20261023/hw3/q04-review/q04-zip-audit-r9.json'
EXPECTED = {'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}

def require(ok, message):
    if not ok:
        raise AssertionError(message)

data=json.loads(DATA.read_text()); index=json.loads(INDEX.read_text()); items=data['items']
require(data['version']=='20261026-applied3-expansion-q04-q07-q12-q14-q18-q21-q06-locked-r11','unexpected data version')
require(len(items)==207 and len(data['availableSourceNos'])==23,'expected 189 items / 21 types')
require(index['itemCount']==207 and index['version']==data['version'],'index count/version mismatch')
require(all(sum(i['sourceNo']==no for i in items)==9 for no in data['availableSourceNos']),'type missing exactly 9 variants')
q4=[i for i in items if i['sourceNo']==4]
require(len(q4)==9,'Q04 does not contain nine variants')
require(6 in data['pendingSourceNos'] and 6 not in data['availableSourceNos'],'Q06 source answer conflict is not locked')
require(not any(i['sourceNo']==6 for i in items),'locked Q06 variants leaked into the active ZIP source data')

with zipfile.ZipFile(ZIP_PATH) as z:
    require(set(z.namelist())==EXPECTED,'ZIP must contain all seven deliverables')
    require(z.testzip() is None,'ZIP CRC failure')
    manifest=json.loads(z.read('문항목록.json')); record=json.loads(z.read('검수기록.json'))
    ids=[i['id'] for i in items]
    require(manifest['version']==data['version'] and manifest['count']==207,'manifest version/count mismatch')
    require([i['id'] for i in manifest['items']]==ids,'manifest IDs/order differ from reviewed data')
    require(record['version']==data['version'] and record['count']==207 and record['selectedIds']==ids,'export record selection mismatch')
    require(set(record['includes'])==EXPECTED-{'검수기록.json'},'export record does not list all required files')
    rows=list(csv.DictReader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
    require(len(rows)==207 and [r['문항ID'] for r in rows]==ids,'quick-answer IDs/order mismatch')
    require([r['정답'] for r in rows]==[i['answer'] for i in items],'quick answers differ from reviewed data')
    qhtml=z.read('문제.html').decode('utf-8'); ahtml=z.read('답안과상세풀이.html').decode('utf-8')
    qids=re.findall(r'data-item-id="([^"]+)"',qhtml); aids=re.findall(r'data-answer-id="([^"]+)"',ahtml)
    require(qids==ids and aids==ids,'problem/solution HTML IDs do not exactly match data')
    qtext=html.unescape(re.sub(r'<[^>]+>',' ',qhtml)); atext=html.unescape(re.sub(r'<[^>]+>',' ',ahtml))
    for item in q4:
        ident=item['id']; h=item['verification']['parameters']['hundredsDigit']; ans=item['answer']
        require(qhtml.count(f'data-item-id="{ident}"')==1 and ahtml.count(f'data-answer-id="{ident}"')==1,f'{ident} missing from HTML')
        require(f'백의 자리가 {h}' in qtext and ans in atext,f'{ident} question or answer text missing')
    require('학습 위치' in atext and '학습 포인트' in atext,'solution learning links missing')
    qsections=re.findall(r'<section\b[^>]*class="page[^\"]*"[^>]*>.*?</section>',qhtml,re.S)
    asections=re.findall(r'<section\b[^>]*class="page[^\"]*"[^>]*>.*?</section>',ahtml,re.S)
    qpages={x['id']:[n+1 for n,s in enumerate(qsections) if x['id'] in s] for x in q4}
    apages={x['id']:[n+1 for n,s in enumerate(asections) if x['id'] in s] for x in q4}
    require(all(len(v)==1 for v in qpages.values()) and all(len(v)==1 for v in apages.values()),'Q04 item appears on zero/multiple HTML pages')
    pdf_info={}
    for name in ('문제.pdf','답안과상세풀이.pdf'):
        reader=PdfReader(io.BytesIO(z.read(name)))
        a4=all(abs(float(p.mediabox.width)-595.28)<1 and abs(float(p.mediabox.height)-841.89)<1 for p in reader.pages)
        require(a4,f'{name} is not all A4')
        pdf_info[name]={'pages':len(reader.pages),'a4':True}
    qpdf=PdfReader(io.BytesIO(z.read('문제.pdf'))); apdf=PdfReader(io.BytesIO(z.read('답안과상세풀이.pdf')))
    # Browser section page indexes and PDF physical pages must agree.
    require(len(qpdf.pages)==len(qsections) and len(apdf.pages)==len(asections),'HTML/PDF page count mismatch')
    first_q_page=qpages['applied3-q04-v1'][0]; first_a_page=apages['applied3-q04-v1'][0]
    require(first_q_page==6 and first_a_page==10,'Q04 first item unexpectedly moved; refresh page review mapping')
    result={
        'version':data['version'],'pass':True,'count':len(items),'sourceTypes':len(data['availableSourceNos']),
        'q04Ids':[x['id'] for x in q4],'q04Answers':[x['answer'] for x in q4],
        'q04QuestionPdfPages':sorted(set(n for v in qpages.values() for n in v)),
        'q04SolutionPdfPages':sorted(set(n for v in apages.values() for n in v)),
        'zipMembers':sorted(z.namelist()),'zipCrc':'pass','allIDsMatch':True,
        'quickAnswersMatchData':True,'pdf':pdf_info,
        'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),
        'indexSha256':hashlib.sha256(INDEX.read_bytes()).hexdigest(),
        'zipSha256':hashlib.sha256(ZIP_PATH.read_bytes()).hexdigest(),'zipBytes':ZIP_PATH.stat().st_size
    }
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied3 207-item ZIP: all nine Q04 variants, seven deliverables, matching IDs/answers, A4 PDFs')
print(json.dumps(result,ensure_ascii=False,indent=2))
