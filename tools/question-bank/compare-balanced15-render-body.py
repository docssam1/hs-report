"""Compare actual ZIP PDF body pixels with a previously reviewed exact artifact.

Unchanged body pixels inherit only their prior visual review. Changed pages still
need direct inspection. Header/footer samples and all new math/input gates remain
separate; this is not a complete release check.
"""
import argparse
import hashlib
import io
import json
import zipfile
import subprocess
import tempfile
from pathlib import Path

from PIL import Image,ImageDraw
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser()
p.add_argument('--work-dir',required=True)
p.add_argument('--prior-work-dir',required=True)
args=p.parse_args()
work=(ROOT/args.work_dir).resolve();prior=(ROOT/args.prior_work_dir).resolve()
assert all(w.is_relative_to(ROOT/'.private-work')for w in [work,prior])
old_evidence=json.loads((prior/'zip-final-evidence.json').read_text())
assert old_evidence['allVerified']and old_evidence['finalPdfImageAndPlacementStreamsEqualVisuallyReviewed']


def load_zip(w):
    browser=json.loads((w/'output-qa/browser-evidence.json').read_text())
    path=w/'output-qa'/browser['actualZip']
    return zipfile.ZipFile(path),path


def body_digest(path):
    image=Image.open(path).convert('RGB')
    # Same350px Poppler render as contact-sheet visual review. Include all blocks
    # and answer lines; exclude only the changing count header/numbered footer.
    body=image.crop((0,round(image.height*.14),image.width,round(image.height*.948)))
    return body.size,hashlib.sha256(body.tobytes()).hexdigest()


old,old_path=load_zip(prior);new,new_path=load_zip(work)
assert hashlib.sha256(old_path.read_bytes()).hexdigest()==old_evidence['sha256']
evidence=dict(priorZipSha256=old_evidence['sha256'],currentZipSha256=hashlib.sha256(new_path.read_bytes()).hexdigest(),bodyCropHeightFraction=[.14,.948],
              priorVisualReviewInheritedOnlyForExactBodyPixels=True,comparisonRenderMaximumPixels=350,headerFooterStillRequireSamples=True,pdfs={})
changed_images=[]
for kind,name in [('questions','문제.pdf'),('solutions','답안과상세풀이.pdf')]:
    before=PdfReader(io.BytesIO(old.read(name)));after=PdfReader(io.BytesIO(new.read(name)))
    unchanged=[];changed=[]
    with tempfile.TemporaryDirectory(prefix='gfield-prior-render-')as temp:
        temp=Path(temp);pdf=temp/'prior.pdf';pdf.write_bytes(old.read(name))
        subprocess.run(['pdftoppm','-scale-to','350','-png',str(pdf),str(temp/'page')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        prior_images=sorted(temp.glob('page-*.png'));assert len(prior_images)==len(before.pages)
        for i,page in enumerate(after.pages):
            image_path=work/'output-qa'/f'{kind}-{i+1:0{len(str(len(after.pages)))}d}.png'
            assert image_path.is_file(),image_path
            if i<len(prior_images)and body_digest(image_path)==body_digest(prior_images[i]):unchanged.append(i+1)
            else:
                changed.append(i+1)
                changed_images.append((kind,i+1,image_path))
    evidence['pdfs'][kind]=dict(totalPages=len(after.pages),unchangedBodyPages=unchanged,changedPages=changed)
for start in range(0,len(changed_images),16):
    sheet=Image.new('RGB',(1120,1600),'#ddd');draw=ImageDraw.Draw(sheet)
    for index,(kind,page,path)in enumerate(changed_images[start:start+16]):
        thumb=Image.open(path);thumb.thumbnail((270,370));x=index%4*280;y=index//4*400
        sheet.paste(thumb,(x,y+20));draw.text((x+5,y+3),f'{kind}-{page}',fill='black')
    sheet.save(work/'output-qa'/f'contact-changed-{start//16+1}.jpg')
(work/'render-body-comparison.json').write_text(json.dumps(evidence,indent=2)+'\n')
print(json.dumps({kind:{k:len(v)if isinstance(v,list)else v for k,v in value.items()}for kind,value in evidence['pdfs'].items()}))
