/* Build the approved, source-free Signature worksheet payload from the private review. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

async function main(){
  const sourceDir=process.argv[2],reviewHtml=process.argv[3];
  if(!sourceDir||!reviewHtml)throw Error('Usage: node qa/build-signature-fixed.js PRIVATE_DIR CORRECTED_REVIEW_HTML');
  const files=[1,2].flatMap(round=>[`round${round}-q01-q15.json`,`round${round}-q16-q30.json`]);
  const source=files.flatMap(file=>JSON.parse(fs.readFileSync(path.join(sourceDir,file),'utf8')).items);
  if(source.length!==180||new Set(source.map(item=>item.id)).size!==180)throw Error('Expected 180 unique variants');
  global.window={};require('../mock-data-original.js');
  const exam=window.GFIELD_MOCK_ORIGINAL;
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:950},deviceScaleFactor:2});
    await page.goto('file:///'+path.resolve(reviewHtml).replace(/\\/g,'/')+'?round=1&no=1',{waitUntil:'load'});
    const status=await page.evaluate(()=>ITEMS.map(item=>({id:item.id,figureReady:figure(item.figureSpec).done})));
    const ready=new Map(status.map(item=>[item.id,item.figureReady]));
    const outputs={1:[],2:[]};
    for(const item of source){
      const id=item.id,round=item.sourceRound,no=item.sourceNo;
      if(item.answer==null||!item.question||!item.teacherSolution||!ready.get(id))throw Error(`${id}: incomplete approved item`);
      if(item.independentVerification?.unique!==true&&!item.acceptedAnswerCheck)throw Error(`${id}: independent answer check missing`);
      const original=exam.rounds[round].items[no-1];
      if(!original||original.no!==no)throw Error(`${id}: source taxonomy missing`);
      let asset=null;
      if(item.figureSpec){
        await page.evaluate(args=>{round=args.round;no=args.no;render()}, {round,no});
        const figure=page.locator(`.card[data-id="${id}"] .figure`);
        if(await figure.count()!==1)throw Error(`${id}: rendered figure missing`);
        const png=await figure.screenshot({type:'png',animations:'disabled'});
        asset={kind:'raster',src:'data:image/png;base64,'+png.toString('base64'),description:`시그니처 ${round}회 ${no}번 유사문제 그림`};
      }
      const solution=item.teacherSolution+(item.acceptedAnswerCheck&&!item.teacherSolution.includes('다른 올바른 배열')?' 같은 합을 만드는 다른 올바른 배열도 정답입니다.':'');
      outputs[round].push({
        id:`original${round}-q${String(no).padStart(2,'0')}-v${item.variantNo}`,
        sourceSet:'original',sourceRound:round,sourceNo:no,variantNo:item.variantNo,
        genId:`original${round}-q${String(no).padStart(2,'0')}`,
        text:item.question,promptDataLines:item.conditionBox||[],
        answer:item.answer,acceptedAnswers:[item.answer],
        answerPolicy:item.acceptedAnswerCheck?'any-valid-arrangement':'single',
        pointBand:String(original.pts),area:original.area,subarea:original.subarea,detailType:original.type,
        solution,solutionSteps:[solution],
        readingFocus:'',solutionSkill:'',asset,reviewStatus:'verified',
        verification:{method:item.independentVerification?.method||'',unique:item.independentVerification?.unique===true,answerContract:item.answerContract||'single'}
      });
    }
    for(const round of [1,2]){
      const items=outputs[round];
      if(items.length!==90)throw Error(`Round ${round}: ${items.length} items`);
      for(let no=1;no<=30;no++)if(items.filter(item=>item.sourceNo===no).length!==3)throw Error(`Round ${round} Q${no}: missing variants`);
      const result={version:'2026-09-29',sourceSet:'original',sourceRound:round,reviewSummary:{verified:90,pending:0},items};
      const target=path.join(__dirname,'..','bank','data',`original${round}-fixed90.json`);
      fs.writeFileSync(target,JSON.stringify(result));
      console.log(target,fs.statSync(target).size);
    }
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
