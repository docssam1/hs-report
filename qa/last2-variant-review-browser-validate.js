'use strict';

// Private teacher-review layout QA only: no mathematical approval or live service access.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..');
const source='E:/Codex/visualizations/2026/10/11/last2-review/last2-claude-variants-20261011.html';
const output='E:/Codex/hs-admin-unify-20261004/qa';
const mm=96/25.4,contentWidth=186*mm,contentHeight=273*mm;
const evidence={source,sourceSha256:null,cards:[],screens:[],failures:[],externalBlockedRequests:[],localWriteRequests:[],browserErrors:[],actualExternalWrites:0,pdfs:[]};
const html=fs.readFileSync(source,'utf8');
evidence.sourceSha256=crypto.createHash('sha256').update(html).digest('hex');
const window={location:{search:'?set=last&round=2'}};window.window=window;
const sourceContext=vm.createContext({window,URLSearchParams});
for(const file of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last2-detailed-data.js','last-report-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sourceContext,{filename:file});
const originals=window.GFIELD_MOCK_LAST.rounds['2'].items;
const server=http.createServer((req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){evidence.localWriteRequests.push({method:req.method,url:req.url});res.writeHead(405);return res.end();}
  if(new URL(req.url,'http://localhost').pathname!=='/last2-review.html'){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
});
async function measured(page){
  return page.evaluate(()=>{
    function rect(el){const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}
    return [...document.querySelectorAll('article.review-page')].map(card=>{
      const r=rect(card),children=[...card.children].filter(el=>getComputedStyle(el).display!=='none'&&el.getClientRects().length);
      const overflow=[...card.querySelectorAll('*')].filter(el=>el.getClientRects().length&&getComputedStyle(el).display!=='none').map(el=>({tag:el.tagName,class:el.className,rect:rect(el)})).filter(el=>el.rect.x<r.x-1||el.rect.right>r.right+1);
      const overlaps=[];
      for(let i=1;i<children.length;i++){const a=rect(children[i-1]),b=rect(children[i]);if(a.bottom>b.y+1)overlaps.push({a:children[i-1].tagName,b:children[i].tagName,px:a.bottom-b.y});}
      return {id:card.id,rect:r,header:card.querySelector('header').textContent,type:card.querySelector('h2').textContent,footer:card.querySelector('footer').textContent,verification:card.querySelector('.verification')?.textContent||'',images:[...card.querySelectorAll('img')].map(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete,rect:rect(img)})),overflow,overlaps};
    });
  });
}
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});}

async function physicalPdfContacts(){
  const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:2414,height:1200}}),page=await context.newPage();
  await context.route(/^https?:\/\//,route=>route.abort());
  try{
    for(let first=1;first<=30;first+=2){
      const rows=Array.from({length:6},(_,index)=>({page:(first-1)*3+index+1,id:'last2-q'+String(first+Math.floor(index/3)).padStart(2,'0')+'-v'+(index%3+1)}));
      await page.setContent('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cdd3dc;font-family:"Malgun Gothic",sans-serif}main{display:grid;grid-template-columns:repeat(3,794px);gap:8px;padding:8px}figure{margin:0;background:white}figcaption{padding:8px;font-size:17px;background:#eef1f5}img{display:block;width:794px;height:auto}</style><main>'+rows.map(row=>'<figure><figcaption>PDF '+row.page+'쪽 | '+row.id+'</figcaption><img src="data:image/png;base64,'+fs.readFileSync(path.join(output,'last2-variants-pdf-page-'+String(row.page).padStart(2,'0')+'.png')).toString('base64')+'"></figure>').join('')+'</main>');
      await settled(page);await page.locator('main').screenshot({path:path.join(output,'last2-variants-pdf-contact-'+String(first).padStart(2,'0')+'-'+String(first+1).padStart(2,'0')+'.png')});
    }
    console.log('PDF CONTACTS 15 sheets from all 90 actual PDF pages; no new PDF created.');
  }finally{await context.close();await browser.close();}
}

if(process.env.GFIELD_LAST2_VARIANTS_RENDER_CONTACTS_ONLY==='1')physicalPdfContacts().catch(error=>{console.error(error);process.exitCode=1;});
else (async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:Math.ceil(contentWidth),height:1123},deviceScaleFactor:1});
  await context.route(/^https?:\/\//,route=>{
    const request=route.request();
    if(new URL(request.url()).origin===base&&request.method()==='GET')return route.continue();
    evidence.externalBlockedRequests.push({method:request.method(),url:request.url()});return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',error=>evidence.browserErrors.push(error.message));
  try{
    await page.emulateMedia({media:'print'});await page.goto(base+'/last2-review.html');await settled(page);
    const data=await page.locator('#last2-review-data').evaluate(el=>JSON.parse(el.textContent));
    assert.equal(data.items.length,90);assert.equal(data.freezePolicy.variantsPerSourceQuestion,3);assert.deepEqual(data.freezePolicy.availableSourceNos,[]);
    const cards=await measured(page);assert.equal(cards.length,90);assert.equal(new Set(cards.map(x=>x.id)).size,90);
    for(let no=1;no<=30;no++)assert.deepEqual(data.items.filter(x=>x.sourceNo===no).map(x=>x.variantNo).sort(),[1,2,3]);
    for(const row of data.items){
      const original=originals[row.sourceNo-1],card=cards.find(x=>x.id===row.id);
      assert.equal(row.id,'last2-q'+String(row.sourceNo).padStart(2,'0')+'-v'+row.variantNo);
      assert.equal(row.sourceRound,2);assert.equal(row.sourceSet,'last');assert.equal(row.reviewStatus,'pending-human-review');
      assert.equal(row.pointBand,String(original.pts));assert.equal(row.area,original.area);assert.equal(row.subarea,original.subarea);assert.equal(row.detailType,original.type);assert.equal(card.type,original.type);
      assert.ok(card.header.includes('원문 '+row.sourceNo+'번')&&card.header.includes('유사 '+row.variantNo));assert.ok(card.footer.includes(row.id));
      assert.equal(card.images.length,Number(!!row.asset)+Number(!!row.solutionAsset));
      for(const image of card.images)assert.ok(image.complete&&image.naturalWidth>0&&image.naturalHeight>0&&image.rect.height>0,'image loaded '+row.id);
    }
    evidence.print={contentWidthPx:contentWidth,contentHeightPx:contentHeight,contentHeightMm:273,longCards:cards.filter(x=>x.rect.height>contentHeight).map(x=>({id:x.id,heightPx:x.rect.height,heightMm:x.rect.height/mm,excessMm:(x.rect.height-contentHeight)/mm})),maxHeightMm:Math.max(...cards.map(x=>x.rect.height))/mm,imageCount:cards.reduce((sum,x)=>sum+x.images.length,0)};
    evidence.cards=cards.map(x=>({...x,heightMm:x.rect.height/mm}));
    for(const card of cards)if(card.overflow.length||card.overlaps.length)evidence.failures.push({media:'print',id:card.id,overflow:card.overflow,overlaps:card.overlaps});
    console.log('PRINT HEIGHT '+JSON.stringify(evidence.print));
    if(!process.env.GFIELD_LAST2_VARIANTS_MEASURE_ONLY){
      for(const width of [1280,390]){
        await page.emulateMedia({media:'screen'});await page.setViewportSize({width,height:900});await settled(page);
        const rows=await measured(page),documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
        evidence.screens.push({width,documentWidth,cards:rows.map(x=>({id:x.id,height:x.rect.height,overflow:x.overflow,overlaps:x.overlaps}))});
        for(const card of rows)if(card.overflow.length||card.overlaps.length)evidence.failures.push({media:'screen',width,id:card.id,overflow:card.overflow,overlaps:card.overlaps});
        if(documentWidth>width+1)evidence.failures.push({media:'screen',width,documentWidth,horizontalOverflowPx:documentWidth-width,overflowElements:await page.evaluate(w=>[...document.querySelectorAll('*')].filter(el=>el.getClientRects().length&&el.getBoundingClientRect().right>w+1).map(el=>({tag:el.tagName,class:el.className,id:el.id,right:el.getBoundingClientRect().right})),width),widthWithoutWatermark:await page.evaluate(()=>{const style=document.createElement('style');style.textContent='.review-page::before{display:none!important}';document.head.append(style);const width=document.documentElement.scrollWidth;style.remove();return width;})});
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:path.join(output,'last2-variants-screen-'+width+'-top.png')});
        for(const no of [3,5,6,7,11,12,15,17,19,20,22,24,25,26,27,28,29,30])await page.locator('#last2-q'+String(no).padStart(2,'0')+'-v1').screenshot({path:path.join(output,'last2-variants-screen-'+width+'-q'+String(no).padStart(2,'0')+'.png'),style:'.toolbar{visibility:hidden!important}'});
      }
      await page.emulateMedia({media:'print'});await page.setViewportSize({width:Math.ceil(contentWidth),height:1123});await settled(page);
      for(const card of cards)await page.locator('#'+card.id).screenshot({path:path.join(output,'last2-variants-print-'+card.id+'.png')});
      // This flag is set only after the parent successfully marks the single PDF artifact operation.
      if(process.env.GFIELD_LAST2_VARIANTS_CREATE_PDF==='1'){
        const pdf=path.join(output,'last2-variants-review-a4.pdf');
        await page.pdf({path:pdf,format:'A4',preferCSSPageSize:true,printBackground:true});evidence.pdfs.push(pdf);
        const python=process.env.GFIELD_QA_PYTHON||'C:/Users/user/AppData/Local/Programs/Python/Python312/python.exe';
        const inspection=String.raw`import json,re,sys,unicodedata
from pathlib import Path
from pypdf import PdfReader
html=Path(sys.argv[2]).read_text(encoding='utf-8')
data=json.loads(re.search(r'<script id="last2-review-data" type="application/json">([\s\S]*?)</script>',html).group(1))
reader=PdfReader(sys.argv[1])
def norm(value): return re.sub(r'\s+','',unicodedata.normalize('NFKC',value))
rows=[]
for index,page in enumerate(reader.pages):
 text=page.extract_text() or ''
 compact=norm(text)
 item=data['items'][index] if index<len(data['items']) else None
 if item is None:
  rows.append({'page':index+1,'pass':False,'reason':'unexpected extra page'})
  continue
 checks={'id':item['id'] in text,'number':norm('원문 '+str(item['sourceNo'])+'번') in compact,'variant':norm('유사 '+str(item['variantNo'])) in compact,'type':norm(item['detailType']) in compact,'prompt':norm(item['text']) in compact,'answer':norm(item['answer']) in compact,'solutionHeading':'풀이' in text,'footer':norm('교사용 검수본 · 공개 승인 전 · '+item['id']) in compact,'allSolutionSteps':all(norm(step) in compact for step in item['solutionSteps']),'onlyOwnCard':re.findall(r'last2-q\d{2}-v[123]',text)==[item['id']]}
 rows.append({'page':index+1,'id':item['id'],'pass':all(checks.values()),'checks':checks,'images':len(list(page.images)),'widthPt':float(page.mediabox.width),'heightPt':float(page.mediabox.height)})
print(json.dumps({'pageCount':len(reader.pages),'expectedPageCount':90,'pass':len(reader.pages)==90 and all(row['pass'] for row in rows),'imageCount':sum(row.get('images',0) for row in rows),'pages':rows},ensure_ascii=False))`;
        evidence.physicalPdf=JSON.parse(execFileSync(python,['-X','utf8','-c',inspection,pdf,source],{encoding:'utf8',maxBuffer:4*1024*1024}));
        assert.equal(evidence.physicalPdf.pageCount,90,'physical PDF page count');assert.equal(evidence.physicalPdf.imageCount,45,'physical PDF diagram count');
        if(!evidence.physicalPdf.pass)evidence.failures.push({media:'physical-pdf',pages:evidence.physicalPdf.pages.filter(row=>!row.pass)});
        console.log('PHYSICAL PDF '+JSON.stringify({pages:evidence.physicalPdf.pageCount,images:evidence.physicalPdf.imageCount,missingContentPages:evidence.physicalPdf.pages.filter(row=>!row.pass).map(row=>row.id)}));
      }
      const contact=await context.newPage();await contact.emulateMedia({media:'screen'});await contact.setViewportSize({width:2141,height:1200});
      for(let first=1;first<=30;first+=2){
        const rows=cards.filter(card=>Number(card.id.slice(7,9))>=first&&Number(card.id.slice(7,9))<first+2);
        assert.equal(rows.length,6);
        await contact.setContent('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cdd3dc;font-family:"Malgun Gothic",sans-serif}main{display:grid;grid-template-columns:repeat(3,703px);gap:8px;padding:8px}figure{margin:0;background:white}figcaption{padding:8px;font-size:17px;background:#eef1f5}img{display:block;width:703px;height:auto}</style><main>'+rows.map(card=>'<figure><figcaption>'+card.id+' | '+(card.rect.height/mm).toFixed(1)+' mm</figcaption><img src="data:image/png;base64,'+fs.readFileSync(path.join(output,'last2-variants-print-'+card.id+'.png')).toString('base64')+'"></figure>').join('')+'</main>');
        await settled(contact);await contact.locator('main').screenshot({path:path.join(output,'last2-variants-contact-'+String(first).padStart(2,'0')+'-'+String(first+1).padStart(2,'0')+'.png')});
      }
      await contact.close();
    }
    assert.equal(evidence.actualExternalWrites,0);assert.equal(evidence.localWriteRequests.length,0);assert.equal(evidence.externalBlockedRequests.length,0);assert.equal(evidence.browserErrors.length,0);
    console.log('METADATA PASS '+JSON.stringify({cards:cards.length,sourceQuestions:30,variantsPerSource:3,pendingOnly:true,writes:0,layoutFailures:evidence.failures.length}));
  }catch(error){evidence.failures.push({message:error.stack});process.exitCode=1;console.error(error.stack);}
  finally{fs.writeFileSync(path.join(output,'last2-variants-browser-results.json'),JSON.stringify(evidence,null,2)+'\n');await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
  if(evidence.failures.length)process.exitCode=1;
})();
