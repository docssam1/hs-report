#!/usr/bin/env python3
"""Extend Applied 9 Q09 using nine original-structure weight-diagram variants."""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'bank/data/applied9-expanded.json'
INDEX = ROOT / 'bank/data/applied9-expanded-index.json'
SOURCE = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 9회.pdf'
ASSETS = ROOT / 'bank/assets/applied9'
SOURCE_HASH = '0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_HASH = 'a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62'
ANSWER_DRIVE_ID = '1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
VERSION = '20261025-applied9-q02-q05-q06-q07-q09-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r12'
# Readings are the observed pairwise body-weight sums: a+b, b+c, and a+c.
READINGS = [(28,32,36),(31,35,42),(35,37,40),(41,43,46),(43,45,50),(47,49,52),(51,53,56),(55,57,62),(59,61,66)]


def svg_for(values, variant):
    labels = [('가','나'),('나','다'),('가','다')]
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="900" height="270" viewBox="0 0 900 270">',
           '<rect width="900" height="270" fill="#fff"/>']
    for i,(value,pair) in enumerate(zip(values,labels)):
        x=15+i*300
        parts.append(f'<g transform="translate({x},0)">')
        # Digital floor-scale face, based on the three measured pairs in the source.
        parts.append('<rect x="46" y="14" width="208" height="222" rx="14" fill="#fdfbf5" stroke="#2a241c" stroke-width="3"/>')
        parts.append('<rect x="70" y="34" width="160" height="60" rx="3" fill="#fff" stroke="#2a241c" stroke-width="2"/>')
        parts.append(f'<text x="150" y="77" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" fill="#191511">{value} kg</text>')
        parts.append(f'<text x="150" y="142" text-anchor="middle" font-family="Arial,sans-serif" font-size="31" fill="#191511">{pair[0]} + {pair[1]}</text>')
        parts.append('<line x1="82" y1="164" x2="218" y2="164" stroke="#c9bda2" stroke-width="2"/>')
        parts.append(f'<text x="150" y="205" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" fill="#7a6f5c">두 사람의 몸무게 합</text>')
        parts.append('</g>')
    parts.append('</svg>')
    return ''.join(parts)


def make_item(i, readings):
    ab,bc,ac=readings
    a=(ab+ac-bc)//2
    b=(ab+bc-ac)//2
    c=(bc+ac-ab)//2
    assert all(v>0 for v in (a,b,c)) and (a+b,a+c,b+c)==(ab,ac,bc)
    filename=f'applied9-q09-v{i}.svg'
    p=ASSETS/filename
    p.write_text(svg_for(readings,i),encoding='utf-8')
    digest=hashlib.sha256(p.read_bytes()).hexdigest()
    total=ab+bc+ac
    steps=[
        f'세 쌍의 몸무게 합을 모두 더하면 가+나, 나+다, 가+다의 합이므로 (가+나+다)의 두 배입니다. 세 사람의 몸무게 합은 ({ab}+{bc}+{ac})÷2={total//2}kg입니다.',
        f'가의 몸무게는 전체 합에서 나+다={bc}kg을 빼므로 {total//2}−{bc}={a}kg입니다.',
        f'나는 전체 합에서 가+다={ac}kg을 빼므로 {total//2}−{ac}={b}kg입니다.',
        f'다는 전체 합에서 가+나={ab}kg을 빼므로 {total//2}−{ab}={c}kg입니다.',
        f'확인하면 가+나={a}+{b}={ab}, 나+다={b}+{c}={bc}, 가+다={a}+{c}={ac}kg으로 그림의 세 측정값과 모두 같습니다.'
    ]
    return {
        'id':f'applied9-q09-v{i}','genId':'applied9-q09','sourceSet':'applied','sourceRound':9,
        'sourceNo':9,'variantNo':i,'reviewStatus':'verified','area':'수와 식',
        'subarea':'합과 차','detailType':'세 쌍의 합으로 세 사람의 몸무게 구하기','pointBand':'2.7',
        'text':'세 사람 가, 나, 다가 두 명씩 짝을 지어 몸무게를 쟀습니다. 그림에 나타난 세 측정값을 보고 세 사람의 몸무게를 각각 구하시오.',
        'answer':f'{a}, {b}, {c}','answerParts':[a,b,c],
        'answerLabels':['가의 몸무게(kg)','나의 몸무게(kg)','다의 몸무게(kg)'],
        'acceptedAnswers':[str(a),str(b),str(c)],'answerContract':'ordered-parts',
        'asset':{'kind':'svg','src':f'assets/applied9/{filename}','description':'두 사람씩 짝지어 잰 세 사람의 몸무게 합을 보여 주는 디지털 체중계 세 개','sha256':digest},
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'세 쌍의 합을 모두 더해 세 사람 몸무게의 두 배를 구하고, 전체 합에서 각 쌍의 합을 빼기',
        'learningLocation':'활용 9회 · 원문 9번 · 합과 차로 세 양 구하기',
        'verification':{
            'primaryMethod':'세 쌍의 합의 총합을 2로 나누어 전체 몸무게를 구한 뒤, 각 사람을 포함하지 않는 쌍의 합을 빼어 개인 몸무게를 계산한다.',
            'independentMethod':'개인 몸무게 세 변수를 세 쌍의 합 방정식으로 두고, 덧셈·뺄셈으로 해를 역산한 뒤 세 식에 대입해 모두 확인한다.',
            'parameters':{'pairSums':{'가+나':ab,'나+다':bc,'가+다':ac},'personWeights':{'가':a,'나':b,'다':c},'totalPairSums':total,'assetSha256':digest},
            'independentSuite':'qa/applied9-q09-independent-validate.py',
            'sourceExamPage':2,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_HASH,
            'sourceAnswerPage':2,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf','sourceAnswerDriveId':ANSWER_DRIVE_ID,'sourceAnswerSha256':ANSWER_HASH,
            'officialAnswerStatus':'Candidate answer page 2 writes Minsu=56kg, Suhyeon=42kg, Yeongjin=49kg; the source pairing sums independently reproduce these values. Candidate edition identity beyond the matching page remains unconfirmed.',
            'sourceDrawingCompared':True,'sourceDrawingPresent':True,
            'sourceDrawingDescription':'Original Q9 page 2 shows three digital scales for Minsu+Suhyeon=98kg, Yeongjin+Suhyeon=91kg, and Minsu+Yeongjin=105kg; source drawing was inspected and not altered.',
            'variantUsesSourceDrawing':False,'variantDrawingModified':False,
            'userAuthorizedNewVariantFigures':True,'authorizationScope':'User approved new figures for every remaining Applied 9 visual question type (Q1,3,4,8,9,12,20,22,23,24,25,28); original images remain unchanged.',
            'studentDifficultyMeasured':False
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
                             'rationale':'활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}
    }


def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_HASH
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
    assert data['version'].endswith('-r11') and 9 in data['pendingSourceNos']
    variants=[make_item(i,r) for i,r in enumerate(READINGS,1)]
    items=sorted([x for x in data['items'] if x['sourceNo']!=9]+variants,key=lambda x:(x['sourceNo'],x['variantNo']))
    available=sorted({x['sourceNo'] for x in items});pending=[n for n in range(1,31) if n not in available]
    data.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['9']={
        'sourcePage':2,'sourcePairSums':{'민수+수현':98,'영진+수현':91,'민수+영진':105},
        'candidateAnswer':{'민수':56,'수현':42,'영진':49},'independentAnswerMatches':True,
        'candidateOfficialStatus':'Candidate answer page 2 matches, but edition identity/official status remains unconfirmed.',
        'status':'Nine variants added with new weight-display figures. Original source figure preserved unchanged.'}
    idx.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    idx['items']=[x for x in idx['items'] if x['sourceNo']!=9]
    idx['items'].append({'sourceNo':9,'genId':'applied9-q09','area':'수와 식','subarea':'합과 차','detailType':'세 쌍의 합으로 세 사람의 몸무게 구하기','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
    idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'BUILT','version':VERSION,'added':9,'itemCount':len(items),'pending':pending,'answers':[x['answer'] for x in variants]},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
