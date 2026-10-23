"""Inspect the real browser-downloaded ZIP; optionally render, then compare release bytes.

This verifies selected IDs and PDF completeness, not mathematical or visual quality.
The contact sheets still require direct visual review before release.
"""
import argparse
import csv
import hashlib
import io
import json
import re
import subprocess
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--work-dir',required=True)
parser.add_argument('--render',action='store_true')
parser.add_argument('--final',action='store_true')
args=parser.parse_args()
work=(ROOT/args.work_dir).resolve()
assert work.is_relative_to(ROOT/'.private-work')
out=work/'output-qa'
data=json.loads((ROOT/'bank/data/applied1-balanced15.json').read_text())
browser=json.loads((out/'browser-evidence.json').read_text())
assert browser['dataSha256']==hashlib.sha256((ROOT/'bank/data/applied1-balanced15.json').read_bytes()).hexdigest()
items=sorted(data['items'],key=lambda x:(x['sourceNo'],['low','middle','high'].index(x['practiceLevel']),x['variantNo']))
ids=[x['id']for x in items]
assert len(ids)==len(set(ids))==browser['count']
zip_path=out/browser['actualZip']
expected={'문제.pdf','답안과상세풀이.pdf','문제.html','답안과상세풀이.html','빠른정답.csv','문항목록.json','검수기록.json'}


def image_signature(page):
    images=[]
    for ref in page['/Resources']['/XObject'].values():
        obj=ref.get_object()
        images.append((str(obj.get('/Subtype')),int(obj.get('/Width',0)),int(obj.get('/Height',0)),
                       hashlib.sha256(obj._data).hexdigest()))
    return sorted(images),hashlib.sha256(page.get_contents().get_data()).hexdigest()


with zipfile.ZipFile(zip_path)as z:
    assert set(z.namelist())==expected and len(z.namelist())==7
    manifest=json.loads(z.read('문항목록.json'))
    assert manifest['count']==len(ids)and[x['id']for x in manifest['items']]==ids
    expected_items=[dict(x,reviewStatus='verified')for x in items]
    assert manifest['items']==expected_items,'ZIP must contain the exact selected question/answer/solution data'
    assert re.findall('data-item-id="([^"]+)"',z.read('문제.html').decode())==ids
    assert re.findall('data-answer-id="([^"]+)"',z.read('답안과상세풀이.html').decode())==ids
    quick=list(csv.reader(io.StringIO(z.read('빠른정답.csv').decode('utf-8-sig'))))
    assert[row[1]for row in quick[1:]]==ids
    assert json.loads(z.read('검수기록.json'))['selectedIds']==ids
    if args.final:
        assert all(x['reviewStatus']=='verified'for x in items)
        assert all(x['reviewStatus']=='verified'for x in manifest['items'])
    for kind,filename,page_key in [('questions','문제.pdf','questionPdfPages'),('solutions','답안과상세풀이.pdf','solutionPdfPages')]:
        path=out/(('final-'if args.final else'')+f'zip-{kind}.pdf')
        path.write_bytes(z.read(filename))
        pdf=PdfReader(path)
        assert len(pdf.pages)==browser[page_key]
        if args.final:
            previous=PdfReader(out/f'zip-{kind}.pdf')
            assert len(previous.pages)==len(pdf.pages)
            for before,after in zip(previous.pages,pdf.pages):
                assert image_signature(before)==image_signature(after),'Released PDF rendering changed after visual review'
        if args.render:
            from PIL import Image,ImageDraw
            for generated in list(out.glob(kind+'-*.png'))+list(out.glob('contact-'+kind+'-*.jpg')):
                generated.unlink()
            subprocess.run(['pdftoppm','-scale-to','350','-png',str(path),str(out/kind)],check=True,
                           stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            images=sorted(out.glob(kind+'-*.png'))
            assert len(images)==len(pdf.pages)
            for start in range(0,len(images),16):
                sheet=Image.new('RGB',(1120,1600),'#ddd');draw=ImageDraw.Draw(sheet)
                for index,image in enumerate(images[start:start+16]):
                    thumb=Image.open(image);thumb.thumbnail((270,370));x=index%4*280;y=index//4*400
                    sheet.paste(thumb,(x,y+20));draw.text((x+5,y+3),image.stem,fill='black')
                sheet.save(out/f'contact-{kind}-{start//16+1}.jpg')

receipt=dict(count=len(ids),sourceTypes=len(data['availableSourceNos']),perLevelPerSource=5,
             newCount=data['newAuthoredCount'],reusedPreservedCount=data['preservedLegacyCount'],
             questionPages=browser['questionPdfPages'],solutionPages=browser['solutionPdfPages'],
             bytes=zip_path.stat().st_size,sha256=hashlib.sha256(zip_path.read_bytes()).hexdigest(),
             entries=sorted(expected),allIdsMatched=True,exactSelectedData=True,allVerified=args.final,
             finalPdfImageAndPlacementStreamsEqualVisuallyReviewed=args.final)
(work/('zip-final-evidence.json'if args.final else'zip-evidence.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(f"PASS real{len(ids)}-question ZIP:7entries, exact problem/solution/CSV IDs, PDFs{receipt['questionPages']}/{receipt['solutionPages']}pages"+
      ('; all verified and every PDF page unchanged from visual review'if args.final else'; visual review still required'))
