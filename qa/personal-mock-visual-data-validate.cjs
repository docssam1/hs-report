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
  ['applied4','applied4-q29-v1','cards',6]
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
    if(!['cards','arithmeticRows','givenTable','responseTable'].some(key=>item[key]))continue;
    const entry={index:1,item,code:'applied'+item.sourceRound,origin:'attempt'},paper={target:1,questions:[entry]};
    const html=mockBank.renderPaper(paper,'all','all','박서진','자료 검수',4);
    const source=typst.buildSource(paper,[[[entry],[]]],'자료 검수','박서진');
    if(item.cards){assert.match(html,/pm-number-cards/,item.id);assert.match(source,/#grid\(columns: \(1fr/,item.id);}
    if(item.arithmeticRows){assert.match(html,/pm-arithmetic/,item.id);assert.match(source,/font: "Pretendard", size: 11pt/,item.id);}
    if(item.givenTable){assert.match(html,/pm-given-table/,item.id);assert.match(source,/#table\(columns:/,item.id);}
    if(item.responseTable){assert.match(html,/pm-response-table/,item.id);assert.match(source,/#table\(columns:/,item.id);}
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
      const data=await Promise.all([1,2,3,4].map(async round=>(await fetch('data/applied'+round+'-expanded.json')).json()));
      const entries=samples.map(([code,id])=>({code,item:data[Number(code.slice(-1))-1].items.find(x=>x.id===id)}));
      if(entries.some(x=>!x.item))throw Error('검수 문항을 찾지 못했습니다.');
      const paper={target:entries.length,questions:entries.map((entry,index)=>({...entry,index:index+1,origin:'attempt'}))};
      const html=GFIELD_PERSONAL_MOCK.renderPaper(paper,'all','all','박서진','필수 자료 검수',4);
      const holder=document.createElement('div');holder.innerHTML=html;
      const dom=entries.map(entry=>{
        const article=holder.querySelector('[data-item-id="'+entry.item.id+'"]');
        return {id:entry.item.id,cards:article.querySelectorAll('.pm-number-cards span').length,arithmeticRows:article.querySelectorAll('.pm-arithmetic div').length,givenRows:article.querySelectorAll('.pm-given-table tbody tr').length,responseRows:article.querySelectorAll('.pm-response-table tbody tr').length};
      });
      const preview=holder.querySelector('[data-item-id="applied1-q13-v1"]').outerHTML;
      const plan=paper.questions.map(entry=>[[entry],[]]);
      const pdf=await GFIELD_PERSONAL_MOCK_TYPST.pdf(paper,plan,'필수 자료 검수','박서진');
      return {dom,preview,pdf:Array.from(pdf)};
    },samples);
    for(const [,id,kind,count] of samples){const row=result.dom.find(x=>x.id===id);assert.equal(row[kind==='cards'?'cards':kind==='arithmeticRows'?'arithmeticRows':kind==='givenTable'?'givenRows':'responseRows'],kind==='givenTable'||kind==='responseTable'?count-1:count,id+' 필수 자료');}
    assert.match(result.preview,/pm-number-cards/);
    const pdfFile=path.join(os.tmpdir(),'gfield-personal-mock-visual-data-qa.pdf');fs.writeFileSync(pdfFile,Buffer.from(result.pdf));
    const pdfjs=await import(pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);
    const doc=await pdfjs.getDocument({data:new Uint8Array(result.pdf)}).promise;
    const pages=[];for(let no=1;no<=8;no++)pages.push((await(await doc.getPage(no)).getTextContent()).items.map(item=>item.str).join(' '));
    assert.match(pages[0],/2\s+3\s+4\s+5\s+7\s+9/,'13번 수 카드 숫자 PDF 포함');
    assert.match(pages[3],/첫 번째/,'순위 예측 표 PDF 포함');
    assert.match(pages[4],/윤호/,'빈 답안 표 PDF 포함');
    console.log(JSON.stringify({checked:samples.length,inventory:inventoryCount,pdf:pdfFile,pages:doc.numPages,dom:'pass',typst:'pass'}));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
