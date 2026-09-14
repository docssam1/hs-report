'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const student='문제은행권한검수학생';
const source=fs.readFileSync(path.join(root,'data.js'),'utf8');
const importantTypes=['digit-product','assumption','broken-clock','number-pyramid','rectangle-count','units-digit-power','digit-card-sum','number-code','top-view','shortest-path','grouped-sequence','league-tournament','coin-combinations','shape-pattern','consecutive-sum'];

const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch();

  async function open(options){
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(({student,session})=>{
      window.__GFIELD_BANK_ACCESS_FORCE__=true;
      if(session)localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'bank-access-token',refresh_token:'bank-access-refresh',expires_at:Math.floor(Date.now()/1000)+3600,login_name:student}));
      localStorage.setItem('gfield_student',student);
    },{student,session:options.session});
    await context.route(base+'/data.js*',route=>route.fulfill({contentType:'application/javascript',body:source+'\n;window.GFIELD_DATA.archiveProductAccess["question-bank"]='+(options.granted?'["'+student+'"]':'[]')+';'}));
    await context.route('https://fgahqumaldheqettmvqg.supabase.co/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/auth/v1/token')return route.fulfill({json:{access_token:'bank-access-token',refresh_token:'bank-access-refresh',expires_in:3600,user:{id:'bank-access-user'}}});
      if(url.pathname==='/auth/v1/user')return route.fulfill({json:{id:'bank-access-user'}});
      if(url.pathname==='/rest/v1/hs_accounts')return route.fulfill({json:[{role:'student',active:true,student}]});
      return route.fulfill({status:404,json:{error:'unexpected'}});
    });
    await context.route('https://fonts.googleapis.com/**',route=>route.abort());
    const page=await context.newPage();
    await page.goto(base+options.path,{waitUntil:'networkidle'});
    return {context,page};
  }

  try{
    const missing=await open({path:'/bank/index.html?bank=final2',session:false,granted:true});
    assert.equal(await missing.page.locator('#bankAccessGate').isVisible(),true,'direct URL requires a verified session');
    assert.equal(await missing.page.locator('#bankAccessForm').isVisible(),true,'approval-number form is shown');
    assert.equal(await missing.page.locator('.qcard').count(),0,'questions do not render before authorization');
    await missing.context.close();

    const login=await open({path:'/bank/index.html?bank=final2',session:false,granted:true});
    await login.page.locator('#bankAccessName').fill(student);
    await login.page.locator('#bankAccessCode').fill('1234');
    await login.page.locator('#bankAccessForm button').click();
    await login.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===90);
    assert.equal(await login.page.locator('#bankAccessGate').isHidden(),true,'approval-number login opens the bank after permission check');
    await login.context.close();

    const denied=await open({path:'/bank/index.html?bank=final2#student=다른학생',session:true,granted:false});
    await denied.page.locator('#bankAccessStatus.error').waitFor();
    assert.match(await denied.page.locator('#bankAccessStatus').textContent(),/열람 권한이 없습니다/);
    assert.equal(await denied.page.locator('.qcard').count(),0,'valid login without product permission stays blocked');
    await denied.context.close();

    const granted=await open({path:'/bank/index.html?bank=final2#student=다른학생',session:true,granted:true});
    await granted.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===90);
    assert.equal(await granted.page.locator('#bankAccessGate').isHidden(),true);
    assert.equal(await granted.page.locator('.qcard').count(),90,'authorized student receives the fixed bank');
    assert.equal(await granted.page.evaluate(()=>document.body.dataset.bankStudent),student,'verified account identity overrides URL display data');
    await granted.context.close();

    const catalog=await open({path:'/bank/catalog.html',session:true,granted:true});
    await catalog.page.waitForFunction(()=>window.__BANK_CATALOG_QA__&&window.__BANK_CATALOG_QA__.fixedIndexLoaded===true);
    assert.equal(await catalog.page.locator('#bankAccessGate').isHidden(),true);
    assert.match(await catalog.page.locator('#result-status').textContent(),/유형.*문항/);
    await catalog.context.close();

    const important=await open({path:'/bank/index.html?bank=important&types='+importantTypes.join(',')+'&n=40&points=all&printMode=both',session:true,granted:true});
    await important.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===40);
    assert.equal(await important.page.locator('.qcard').count(),40,'teacher-selected mixed bank is capped at 40 questions');
    assert.equal(await important.page.locator('.f1-check').count(),16,'cover identifies all 16 source questions represented by 15 buttons');
    assert.equal(await important.page.locator('.qcard[data-gen="final1-q04"]').count(),3,'all three digit-product formats remain inside the 40-question paper');
    assert.deepEqual(new Set(await important.page.locator('.qcard[data-gen="final1-q04"] .qtext').allTextContents().then(rows=>rows.map(text=>text.match(/(두 자리 수와 두 자리 수|세 자리 수와 두 자리 수|세 자리 수와 세 자리 수)/)[1]))),new Set(['두 자리 수와 두 자리 수','세 자리 수와 두 자리 수','세 자리 수와 세 자리 수']));
    await important.context.close();

    const assumption=await open({path:'/bank/index.html?bank=important&types=assumption&n=40&points=all',session:true,granted:true});
    await assumption.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===40);
    assert.equal(await assumption.page.locator('.qmeta[data-item-id^="final1-q08-v"]').count(),3,'three reviewed Final1 Q8 anchors remain in the merged assumption type');
    assert.equal(await assumption.page.locator('.qmeta[data-item-id^="final2-q01-v"]').count(),3,'three reviewed Final2 Q1 anchors remain in the merged assumption type');
    assert.equal(await assumption.page.locator('.qcard').count(),40,'one selected type can fill the requested 40-question paper');
    const typeCoverage=await assumption.page.evaluate(async(typeIds)=>{
      const rows=[];
      for(const typeId of typeIds){
        for(const requestedCount of [4,8,20,40]){
          let paper;try{paper=await window.BANK_FIXED.buildPaper({bankCode:'important',typeIds:[typeId],n:requestedCount,pointBand:'all'});}catch(error){rows.push({typeId,requestedCount,error:String(error&&error.message||error)});continue;}
          const signatures=paper.questions.map(item=>`${item.text}|${item.answer}|${JSON.stringify(item.meta&&item.meta.parameters||item.meta||{})}`);
          rows.push({typeId,requestedCount,count:paper.questions.length,ids:new Set(paper.questions.map(item=>item.id)).size,distinct:new Set(signatures).size,anchors:paper.questions.filter(item=>item.reviewStatus==='verified').length,runtime:paper.questions.filter(item=>item.reviewStatus==='runtime-verified').length,missing:paper.questions.filter(item=>!item.text||item.answer==null||!item.solution||!item.verification).length});
        }
      }
      return rows;
    },importantTypes);
    for(const row of typeCoverage){
      assert.equal(row.error,undefined,`${row.typeId} ${row.requestedCount}-question generation error: ${row.error||''}`);
      assert.equal(row.count,row.requestedCount,`${row.typeId} fills ${row.requestedCount} questions`);
      assert.equal(row.ids,row.requestedCount,`${row.typeId} has unique item ids at ${row.requestedCount}`);
      assert.equal(row.distinct,row.requestedCount,`${row.typeId} has ${row.requestedCount} distinct questions`);
      const expectedAnchors=Math.min(row.requestedCount,row.typeId==='assumption'?6:3);
      assert.equal(row.anchors,expectedAnchors,`${row.typeId} retains reviewed anchors at ${row.requestedCount}`);
      assert.equal(row.runtime,row.requestedCount-expectedAnchors,`${row.typeId} fills the remainder with runtime-verified questions at ${row.requestedCount}`);
      assert.equal(row.missing,0,`${row.typeId} questions are complete`);
    }
    const final2Runtime=await assumption.page.evaluate(async(typeIds)=>{
      const rows=[];
      for(const typeId of typeIds){
        const paper=await window.BANK_FIXED.buildPaper({bankCode:'important',typeIds:[typeId],n:40,pointBand:'all'});
        paper.questions.filter(item=>item.reviewStatus==='runtime-verified').forEach(item=>rows.push({typeId,id:item.id,answer:item.answer,acceptedAnswers:item.acceptedAnswers,meta:item.meta,hasAsset:!!item.asset,hasSolutionAsset:!!item.solutionAsset}));
      }
      return rows;
    },['top-view','shortest-path','grouped-sequence','league-tournament','coin-combinations','shape-pattern','consecutive-sum']);
    const edgeKey=(a,b)=>[a.join(','),b.join(',')].sort().join('|');
    const countPaths=(from,to,blocked,forbidden)=>{
      const ways={};for(let y=from[1];y<=to[1];y++)for(let x=from[0];x<=to[0];x++){
        const key=`${x},${y}`;if(forbidden&&x===forbidden[0]&&y===forbidden[1]){ways[key]=0;continue;}if(x===from[0]&&y===from[1]){ways[key]=1;continue;}
        let total=0;if(x>from[0]&&!blocked.has(edgeKey([x-1,y],[x,y])))total+=ways[`${x-1},${y}`]||0;if(y>from[1]&&!blocked.has(edgeKey([x,y-1],[x,y])))total+=ways[`${x},${y-1}`]||0;ways[key]=total;
      }return ways[`${to[0]},${to[1]}`]||0;
    };
    for(const item of final2Runtime){
      const answerMatch=String(item.answer).match(/\d+/),number=answerMatch?Number(answerMatch[0]):null;
      if(item.typeId==='top-view'){
        const model=item.meta.parameters,projection=[];for(const point of model.path){const p=[point[0],point[1]],last=projection.at(-1);if(!last||last[0]!==p[0]||last[1]!==p[1])projection.push(p);}
        assert.equal(projection.map(point=>point.join(',')).join('>'),item.meta.projectionSignature,`${item.id} top projection`);assert.equal(item.hasAsset,true,`${item.id} prompt image`);assert.equal(item.hasSolutionAsset,true,`${item.id} solution image`);
      }else if(item.typeId==='shortest-path'){
        const m=item.meta,blocked=new Set(m.blockedEdges),first=countPaths(m.points.A,m.points.B,blocked,null),second=countPaths(m.points.B,m.points.D,blocked,m.points.C);assert.equal(number,first*second,`${item.id} path count`);assert.equal(item.hasAsset,true,`${item.id} road image`);
      }else if(item.typeId==='grouped-sequence'){
        const m=item.meta,target=m.targetTuple;assert.equal(target[1],target[0]+target[2],`${item.id} tuple relation`);assert.equal(number,target.reduce((sum,value)=>sum+value,0),`${item.id} tuple sum`);
      }else if(item.typeId==='league-tournament'){
        const m=item.meta,N=m.participants,L=m.format1LeagueFinalists,g=m.format2GroupSize,counts=[N-L+L*(L-1)/2,L*g*(g-1)/2+L-1,N*(N-1)/2];assert.deepEqual(m.formatCounts,counts,`${item.id} game formats`);assert.equal(number,Math.max(...counts)-Math.min(...counts),`${item.id} game difference`);
      }else if(item.typeId==='coin-combinations'){
        const p=item.meta.parameters,[one,middle,large]=p.denominations;let count=0;for(let z=1;z*large<p.target;z++)for(let y=1;y*middle+z*large<p.target;y++)if(p.target-middle*y-large*z>=one)count++;assert.equal(number,count,`${item.id} coin combinations`);
      }else if(item.typeId==='shape-pattern'){
        const p=item.meta.parameters;assert.equal(number,(2*p.targetStage+1)+(p.targetStage+1)**2,`${item.id} shape pattern`);assert.equal(item.hasAsset,true,`${item.id} sequence image`);
      }else if(item.typeId==='consecutive-sum'){
        const p=item.meta.parameters;let best=null;for(let length=2;length<80;length++){const numerator=p.target-length*(length-1)/2;if(numerator<length)break;if(numerator%length===0){const start=numerator/length;if(!best||length>best.length)best={length,start};}}assert.equal(number,best.start,`${item.id} longest consecutive sum`);assert.equal(p.longestLength,best.length,`${item.id} longest length`);
      }
    }
    const previewDir=process.env.GFIELD_IMPORTANT_PREVIEW_DIR;
    if(previewDir){
      fs.mkdirSync(previewDir,{recursive:true});
      for(const typeId of ['top-view','shortest-path','shape-pattern']){
        await assumption.page.goto(`${base}/bank/index.html?bank=important&types=${typeId}&n=8&points=all&printMode=both`,{waitUntil:'networkidle'});
        await assumption.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===8);
        await assumption.page.locator('.question-page').first().screenshot({path:path.join(previewDir,`${typeId}-first-page.png`)});
      }
    }
    await assumption.context.close();

    const homeContext=await browser.newContext({viewport:{width:390,height:844}});
    await homeContext.route('https://**/*',route=>route.abort());
    const home=await homeContext.newPage();
    await home.goto(base+'/index.html',{waitUntil:'networkidle'});
    await home.evaluate(()=>{currentStudent='허유민';isDemo=false;renderArchive();});
    assert.equal(await home.locator('.bank-launch').count(),1,'authorized student sees the teacher-selected bank entry');
    assert.equal(await home.locator('.bank-type-btn').count(),15,'student sees exactly 15 teacher-selected type buttons');
    assert.equal(await home.locator('.bank-type-btn[data-important-type="league-tournament"]').count(),1,'Final2 Q19 league/tournament button is included');
    await home.locator('.bank-type-btn[data-important-type="assumption"]').evaluate(button=>button.click());
    assert.match(await home.locator('.bank-selection-note').textContent(),/검수 기준 6문항을 바탕으로 20문항/,'merged assumption button clearly describes anchor-based generation');
    assert.match(await home.locator('.bank-start').getAttribute('href'),/bank=important.*types=assumption.*n=20/,'selected button opens only its registered important type');
    await home.evaluate(()=>{currentStudent='권한없는학생';renderArchive();});
    assert.equal(await home.locator('.bank-launch').count(),0,'student without question-bank permission sees no important-type buttons');
    await homeContext.close();

    console.log('PASS bank access: approval session, self-account lookup, product permission, direct-link denial, identity binding, catalog gate, 15 teacher buttons, 40-question bank');
  }finally{
    await browser.close();server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
