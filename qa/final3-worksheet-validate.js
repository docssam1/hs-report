'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
const DATA=JSON.parse(fs.readFileSync(path.join(ROOT,'bank','data','final3-fixed90.json'),'utf8'));
const OUTPUT=process.env.GFIELD_WORKSHEET_REVIEW_DIR||path.join(ROOT,'.private-work','final3-similar','worksheet-proof');
const PDF_PATH=path.join(OUTPUT,'final3-fixed90-both.pdf');
const BROWSER_EXECUTABLE=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';

async function assertWatermarks(page){
  for(const media of ['screen','print']){
    await page.emulateMedia({media});
    const missing=await page.locator('#f1Pages .page:not(.duplex-blank)').evaluateAll((pages)=>pages.flatMap((sheet,index)=>{
      const layer=sheet.querySelector('.wm-layer.wm-active');
      const detail={index,hasLayer:!!layer,tiles:layer?layer.querySelectorAll('.wm-tile').length:0,text:layer?layer.textContent.slice(0,40):'',opacity:layer?getComputedStyle(layer).opacity:''};
      if(!layer||detail.tiles!==32||!layer.textContent.includes('지필드 영재교육'))return [detail];
      const opacity=Number(detail.opacity);
      return opacity<=0||opacity>0.08?[detail]:[];
    }));
    assert.deepEqual(missing,[],media+': every content page has a watermark');
  }
  await page.emulateMedia({media:null});
}

function startServer(){
  const server=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
    const filename=path.resolve(ROOT,'.'+pathname);
    if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}
    const mime=({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'})[path.extname(filename)]||'application/octet-stream';
    response.writeHead(200,{'content-type':mime,'cache-control':'no-store'});
    fs.createReadStream(filename).pipe(response);
  });
  return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server)));
}

(async()=>{
  const server=await startServer();
  fs.mkdirSync(OUTPUT,{recursive:true});
  const browser=await chromium.launch({headless:true,...(BROWSER_EXECUTABLE?{executablePath:BROWSER_EXECUTABLE}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    const errors=[],failed=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource/.test(message.text()))errors.push(message.text());});
    page.on('requestfailed',request=>failed.push(request.url()));
    await page.route('https://**/*',route=>route.abort());
    await page.addInitScript(()=>localStorage.setItem('gfield_student','파이널3검수학생'));
    const base=`http://127.0.0.1:${server.address().port}/bank/index.html`;
    const ready=()=>page.waitForFunction(()=>{const button=document.querySelector('#final1Worksheet #btnPrint');return button&&!button.disabled;});

    await page.goto(base+'?bank=final3&printMode=both#student=파이널3검수학생',{waitUntil:'networkidle'});
    await ready();
    const expected=DATA.items.slice().sort((a,b)=>a.variantNo-b.variantNo||a.sourceNo-b.sourceNo);
    assert.match(await page.locator('.f1-title').textContent(),/파이널 3회 약점 유형/);
    assert.equal(await page.locator('.cover-page input[type=checkbox]').count(),30);
    assert.equal(await page.locator('.qcard').count(),90);
    const editorialPageCount=await page.locator('.question-page').count();
    assert.equal(await page.locator('.solution-card').count(),90);
    assert.ok(await page.locator('.answer-page').count()<=30,'상세 답안은 불필요한 빈칸 없이 압축합니다.');
    assert.equal(await page.locator('.duplex-blank').count(),(1+editorialPageCount)%2,'답안은 양면 인쇄 기준 새 종이 앞면에서 시작합니다.');
    assert.equal(await page.locator('.question-page img').count(),48);
    assert.equal(await page.locator('.qcard').evaluateAll(cards=>cards.filter(card=>card.querySelectorAll('img').length>1).length),0);
    assert.deepEqual(await page.locator('.qmeta.fixed-item').evaluateAll(nodes=>nodes.map(node=>node.dataset.itemId)),expected.map(item=>item.id));
    assert.ok(await page.locator('.question-page').evaluateAll(pages=>pages.every(sheet=>sheet.querySelectorAll('.qcard').length>=2)),'한 페이지에 문제 하나만 남기지 않습니다.');
    assert.equal(await page.locator('.question-page .ans').count(),0);
    assert.equal(await page.locator('.solution-card .ans').count(),90);
    assert.equal(await page.locator('.qcard[data-source-no="6"] img').count(),3);
    assert.equal(await page.locator('.qcard[data-source-no="7"] img').count(),3);
    assert.equal(await page.locator('.qcard[data-source-no="8"] img').count(),3);
    assert.equal(await page.locator('.qcard[data-source-no="18"] .f1-frac').count(),9);
    assert.ok(await page.locator('.qcard[data-source-no="18"] .f1-qtext').evaluateAll(nodes=>nodes.every(node=>!node.innerHTML.includes('1/'))));
    assert.deepEqual(await page.locator('#f1Pages img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth||!image.naturalHeight).map(image=>image.alt)),[],'모든 그림이 정상적으로 표시됩니다.');
    assert.doesNotMatch(await page.locator('#final1Worksheet').innerText(),/undefined|NaN|\[object Object\]/);
    assert.ok(await page.locator('.question-page').evaluateAll(pages=>pages.every(sheet=>sheet.querySelectorAll('.qcard').length>=2)),'한 페이지에 문제 하나만 남기지 않습니다.');
    const geometry=await page.locator('.question-page').evaluateAll(pages=>pages.flatMap((sheet,pageIndex)=>{
      const cards=[...sheet.querySelectorAll('.qcard')];
      const rects=cards.map(card=>card.getBoundingClientRect());
      return cards.flatMap((card,index)=>{
        const rect=rects[index];
        const answerLine=card.querySelector('.answerline').getBoundingClientRect();
        const problems=[];
        if(card.scrollWidth>card.clientWidth+2||answerLine.bottom>rect.bottom+2)problems.push([pageIndex,index,card.querySelector('.qmeta').dataset.itemId,'overflow']);
        for(let otherIndex=0;otherIndex<index;otherIndex+=1){
          const other=rects[otherIndex];
          if(rect.left<other.right-2&&rect.right>other.left+2&&rect.top<other.bottom-2&&rect.bottom>other.top+2)problems.push([pageIndex,index,card.querySelector('.qmeta').dataset.itemId,'overlap',otherIndex]);
        }
        return problems;
      });
    }));
    assert.deepEqual(geometry,[],'문제와 풀이칸이 페이지 안에 들어옵니다.');
    const answerGeometry=await page.locator('.answer-page:not(.quick-page)').evaluateAll(pages=>pages.flatMap((sheet,pageIndex)=>{
      const cards=[...sheet.querySelectorAll('.solution-card')];
      if(!cards.length)return [[pageIndex,'empty answer page']];
      const sheetRect=sheet.getBoundingClientRect();
      const bottomPadding=parseFloat(getComputedStyle(sheet).paddingBottom)||0;
      const lastRect=cards[cards.length-1].getBoundingClientRect();
      return lastRect.bottom>sheetRect.bottom-bottomPadding+2?[[pageIndex,'answer overflow',Math.round(lastRect.bottom-sheetRect.bottom+bottomPadding)]]:[];
    }));
    assert.deepEqual(answerGeometry,[],'상세 풀이가 답안 페이지 밖으로 넘치지 않습니다.');
    await assertWatermarks(page);
    await page.screenshot({path:path.join(OUTPUT,'final3-fixed90-desktop.png'),fullPage:true});
    await page.pdf({path:PDF_PATH,preferCSSPageSize:true,printBackground:true});

    for(const [band,count] of [['2.7',36],['3.4',30],['4.2',24]]){
      await page.locator(`#final1Worksheet [data-role="points"][data-val="${band}"]`).click();
      await ready();
      assert.equal(await page.locator('.qcard').count(),count);
    }

    const subset='final3-q06,final3-q07,final3-q08';
    await page.goto(base+'?bank=final3&practice=wrong&source=final%7C3&gens='+subset+'&points=all&printMode=both#student=파이널3검수학생',{waitUntil:'networkidle'});
    await ready();
    assert.equal(await page.locator('.qcard').count(),9);
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>[...new Set(cards.map(card=>Number(card.dataset.sourceNo)))].sort((a,b)=>a-b)),[6,7,8]);
    const subsetQuestionPages=await page.locator('.question-page').count();
    assert.equal(await page.locator('.duplex-blank').count(),(1+subsetQuestionPages)%2);
    for(const mode of ['questions','answers','both','quick']){
      await page.locator('#printMode').selectOption(mode);
      await ready();
      assert.equal(await page.locator('.question-page').count(),['questions','both'].includes(mode)?subsetQuestionPages:0,mode+': question pages');
      assert.equal(await page.locator('.solution-card').count(),['answers','both'].includes(mode)?9:0,mode+': solution count');
      assert.equal(await page.locator('.quick-page').count(),mode==='quick'?1:0,mode+': quick answer page');
    }
    await page.locator('#printMode').selectOption('both');
    await ready();
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(await page.locator('.qcard').evaluateAll(cards=>cards.filter(card=>card.scrollWidth>card.clientWidth+2).map(card=>card.dataset.index)),[]);
    await page.screenshot({path:path.join(OUTPUT,'final3-wrong-mobile-390.png'),fullPage:true});

    await page.setViewportSize({width:1280,height:900});
    await page.goto(`http://127.0.0.1:${server.address().port}/final.html?round=3&go=answer&preview=1`,{waitUntil:'domcontentloaded'});
    await page.locator('.abtn').first().waitFor();
    for(let no=1;no<=30;no++)if(![6,7,8].includes(no))await page.locator('.abtn').nth(no-1).click();
    await page.locator('#btnGrade').click();
    await page.locator('#wrongPractice').waitFor();
    assert.equal(await page.locator('.wp-item').count(),3);
    const popupPromise=page.waitForEvent('popup');
    await page.locator('#wpStart').click();
    const practice=await popupPromise;
    await practice.waitForLoadState('domcontentloaded');
    await practice.locator('.qcard').first().waitFor();
    const practiceUrl=new URL(practice.url());
    assert.equal(practiceUrl.searchParams.get('bank'),'final3');
    assert.equal(practiceUrl.searchParams.get('source'),'final|3');
    assert.equal(await practice.locator('.qcard').count(),9);
    await practice.close();

    await page.goto(base+'?bank=final3&gens=final2-q01',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.qcard').count(),0);
    assert.equal(await page.locator('#btnPrint').isDisabled(),true);
    assert.ok(failed.every(url=>/^https:\/\//.test(url)));
    assert.deepEqual(errors,[]);
  }finally{
    await browser.close();
    server.close();
  }
  console.log(JSON.stringify({pass:true,items:90,figures:48,pdf:PDF_PATH,desktop:path.join(OUTPUT,'final3-fixed90-desktop.png'),mobile:path.join(OUTPUT,'final3-wrong-mobile-390.png')}));
})().catch(error=>{console.error(error);process.exitCode=1;});
