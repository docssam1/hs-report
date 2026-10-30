const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const mockBank=require('../bank/personal-mock.js');
const typst=require('../bank/personal-mock-typst.js');
const root=path.resolve(__dirname,'..');
const samples=[
  ['applied1','applied1-q13-v1','cards',6],
  ['applied1','applied1-q29-v1','cards',4],
  ['applied2','applied2-q03-v1','arithmeticRows',4],
  ['applied2','applied2-q11-v1','givenTable',3],
  ['applied2','applied2-q24-v1','responseTable',6],
  ['applied2','applied2-q30-v1','cards',12],
  ['applied3','applied3-q18-v1','responseTable',5],
  ['applied4','applied4-q29-v1','cards',6],
  ['final1','final1-q12-v1','conditionLines',3],
  ['middle7','mid7-q22-v1','essentialRows',5],
  ['middle7','mid7-q29-v1','essentialText',6]
];
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){response.writeHead(404).end();return;}response.writeHead(200,{'content-type':({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'}).end(data);});
});
let inventoryCount=0;
for(const name of fs.readdirSync(path.join(root,'bank/data')).filter(name=>name.endsWith('.json'))){
  const data=JSON.parse(fs.readFileSync(path.join(root,'bank/data',name),'utf8'));
  for(const item of Array.isArray(data.items)?data.items:[]){
    if(!['cards','arithmeticRows','givenTable','responseTable','conditionLines','actualEssentialData','solutionTable'].some(key=>Array.isArray(item[key])?item[key].length>0:!!item[key]))continue;
    const entry={index:1,item,code:'applied'+item.sourceRound,origin:'attempt'},paper={target:1,questions:[entry]};
    const html=mockBank.renderPaper(paper,'all','all','박서진','자료 검수',4);
    const source=typst.buildSource(paper,[[[entry],[]]],'자료 검수','박서진');
    if(item.cards){assert.match(html,/pm-number-cards/,item.id);assert.match(source,/#grid\(columns: \(1fr/,item.id);}
    if(item.arithmeticRows){assert.match(html,/pm-arithmetic/,item.id);assert.match(source,/font: "Pretendard", size: 11pt/,item.id);}
    if(item.givenTable){assert.match(html,/pm-given-table/,item.id);assert.match(source,/#table\(columns:/,item.id);}
    if(item.responseTable){assert.match(html,/pm-response-table/,item.id);assert.match(source,/#table\(columns:/,item.id);}
    if(item.conditionLines&&item.conditionLines.length){assert.ok(html.includes(item.conditionLines[0]),item.id);assert.ok(source.includes(item.conditionLines[0]),item.id);}
    if(item.actualEssentialData){
      if(item.actualEssentialData.rows){assert.match(html,/pm-essential-table/,item.id);assert.ok(source.includes('27')||source.includes('29'),item.id);}
      else if(item.actualEssentialData.text){assert.ok(html.includes(item.actualEssentialData.text.split('\n')[0]),item.id);assert.ok(source.includes(item.actualEssentialData.text.split('\n')[0]),item.id);}
      else assert.ok(item.asset,item.id+' 실제 필수 자료 자산');
    }
    if(item.solutionTable){assert.match(html,/pm-solution-table/,item.id);assert.ok(source.includes(String(item.solutionTable.rows[0][0])),item.id);}
    inventoryCount++;
  }
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.GFIELD_QA_BROWSER?{executablePath:process.env.GFIELD_QA_BROWSER}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.addInitScript(()=>localStorage.setItem('gfield_student','박서진'));
    await page.route('**/rest/v1/mock_results*',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await page.route('**/rest/v1/bank_print_history*',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await page.goto('http://127.0.0.1:'+server.address().port+'/bank/personal-mock.html?source=applied1');
    await page.locator('#pmTitle').waitFor({state:'visible'});
    const result=await page.evaluate(async samples=>{
      const names={applied1:'applied1-expanded.json',applied2:'applied2-expanded.json',applied3:'applied3-expanded.json',applied4:'applied4-expanded.json',final1:'final1-fixed90.json',middle7:'middle7-reviewed.json'};
      const data={};for(const [code,name] of Object.entries(names))data[code]=await(await fetch('data/'+name)).json();
      const entries=samples.map(([code,id])=>({code,item:data[code].items.find(x=>x.id===id)}));
      if(entries.some(x=>!x.item))throw Error('검수 문항을 찾지 못했습니다.');
      const paper={target:entries.length,questions:entries.map((entry,index)=>({...entry,index:index+1,origin:'attempt'}))};
      const html=GFIELD_PERSONAL_MOCK.renderPaper(paper,'all','all','박서진','필수 자료 검수',4);
      const holder=document.createElement('div');holder.innerHTML=html;holder.style.cssText='position:absolute;left:-10000px;width:210mm';document.body.appendChild(holder);
      const overflow=Array.from(holder.querySelectorAll('.pm-q,.pm-answer')).filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>({id:card.dataset.itemId||card.dataset.answerId,scroll:card.scrollHeight,client:card.clientHeight}));
      const dom=entries.map(entry=>{
        const article=holder.querySelector('[data-item-id="'+entry.item.id+'"]');
        return {id:entry.item.id,cards:article.querySelectorAll('.pm-number-cards span').length,arithmeticRows:article.querySelectorAll('.pm-arithmetic div').length,givenRows:article.querySelectorAll('.pm-given-table tbody tr').length,responseRows:article.querySelectorAll('.pm-response-table tbody tr').length,essentialRows:article.querySelectorAll('.pm-essential-table tr').length,conditionLines:article.querySelectorAll('.pm-given')[0]?.textContent.split('가온').length-1||0,essentialText:article.querySelector('.pm-given')?.textContent.split('\n').length||0,solutionRows:holder.querySelector('[data-answer-id="'+entry.item.id+'"] .pm-solution-table tbody')?.children.length||0};
      });
      const preview=holder.querySelector('[data-item-id="applied1-q13-v1"]').outerHTML;
      const critical=data.final1.items.filter(x=>[12,14,23].includes(x.sourceNo)).concat(data.middle7.items.filter(x=>[22,29].includes(x.sourceNo)));
      const criticalPaper={target:critical.length,questions:critical.map((item,index)=>({index:index+1,item,code:item.sourceSet==='middle'?'middle7':'final1',origin:'attempt'}))};
      const criticalHolder=document.createElement('div');criticalHolder.innerHTML=GFIELD_PERSONAL_MOCK.renderPaper(criticalPaper,'all','all','박서진','조건 자료 검수',4);criticalHolder.style.cssText='position:absolute;left:-10000px;width:210mm';document.body.appendChild(criticalHolder);
      const criticalOverflow=Array.from(criticalHolder.querySelectorAll('.pm-q,.pm-answer')).filter(card=>card.scrollHeight>card.clientHeight+2).map(card=>card.dataset.itemId||card.dataset.answerId);criticalHolder.remove();
      const plan=paper.questions.map(entry=>[[entry],[]]);
      const pdf=await GFIELD_PERSONAL_MOCK_TYPST.pdf(paper,plan,'필수 자료 검수','박서진');
      holder.remove();return {dom,preview,overflow,criticalOverflow,pdf:Array.from(pdf)};
    },samples);
    assert.deepEqual(result.overflow,[],'대표 문항 A4 카드 잘림 없음');
    assert.deepEqual(result.criticalOverflow,[],'파이널1·중급7 필수 자료 15문항 A4 카드 잘림 없음');
    for(const [,id,kind,count] of samples){const row=result.dom.find(x=>x.id===id);if(kind==='conditionLines'||kind==='essentialText')continue;assert.equal(row[kind==='cards'?'cards':kind==='arithmeticRows'?'arithmeticRows':kind==='givenTable'?'givenRows':kind==='essentialRows'?'essentialRows':'responseRows'],kind==='givenTable'||kind==='responseTable'?count-1:count,id+' 필수 자료');}
    assert.match(result.preview,/pm-number-cards/);
    const pdfFile=path.join(os.tmpdir(),'gfield-personal-mock-visual-data-qa.pdf');fs.writeFileSync(pdfFile,Buffer.from(result.pdf));
    const pdfjs=await import(pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);
    const doc=await pdfjs.getDocument({data:new Uint8Array(result.pdf)}).promise;
    const pages=[];for(let no=1;no<=samples.length;no++)pages.push((await(await doc.getPage(no)).getTextContent()).items.map(item=>item.str).join(' '));
    assert.match(pages[0],/2\s+3\s+4\s+5\s+7\s+9/,'13번 수 카드 숫자 PDF 포함');
    assert.match(pages[3],/첫 번째/,'순위 예측 표 PDF 포함');
    assert.match(pages[4],/윤호/,'빈 답안 표 PDF 포함');
    assert.match(pages[8],/가온과 나래의 구슬/,'파이널 1회 조건문 PDF 포함');
    assert.match(pages[9],/27/,'중급 7회 요금표 PDF 포함');
    assert.match(pages[10],/기현 선수와 현우 선수/,'중급 7회 기자 발언 PDF 포함');
    console.log(JSON.stringify({checked:samples.length,inventory:inventoryCount,pdf:pdfFile,pages:doc.numPages,dom:'pass',typst:'pass'}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
