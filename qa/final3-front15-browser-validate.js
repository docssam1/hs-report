'use strict';

// Synthetic learner only. Every off-site mutation is intercepted and rejected.
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');

const root=path.resolve(__dirname,'..');
const artifactDir=process.env.GFIELD_FINAL3_ARTIFACT_DIR;
assert.ok(artifactDir,'GFIELD_FINAL3_ARTIFACT_DIR is required');
assert.equal(fs.existsSync(artifactDir),false,'artifact directory already exists; choose a new versioned folder');
fs.mkdirSync(artifactDir,{recursive:true});

const student='Final3전체통합검수학생';
const ox='O'.repeat(20)+'X'.repeat(10);
const score=core.scoreOf(ox);
const records=[1,2,3,4].map(n=>({student,round:'final'+n,ox,score,wrong:10,source:'admin'}));
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const dataSource=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['파이널 모의고사']=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||'')).map(x=>x.id);})();`;
const writes=[],errors=[];

const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);return res.end();
  }
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const origin=new URL(base).origin;
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(name=>{
    localStorage.setItem('gfield_student',name);
    localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));
  },student);
  await context.route(/^https?:\/\//,route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin){
      if(url.pathname==='/data.js') return route.fulfill({contentType:'application/javascript',body:dataSource});
      return route.continue();
    }
    if(url.pathname==='/rest/v1/mock_results'){
      if(request.method()!=='GET') writes.push(request.method()+' '+url.pathname);
      return route.fulfill({json:records});
    }
    if(url.pathname.endsWith('/hs-final-population')){
      const body=request.postDataJSON();
      if(body.action){
        if(body.action!=='read-report') writes.push(body.action);
        return route.fulfill({json:{canEdit:false,comment:'합성 검수',snapshot:null,resultOx:ox}});
      }
      return route.fulfill({json:core.createResponse(baselines[body.exam],body.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(request.method())&&!url.pathname.endsWith('/access_log')) writes.push(request.method()+' '+url.pathname);
    return route.fulfill({json:[]});
  });

  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(base+'/final.html?round=3&go=report&name='+encodeURIComponent(student));
    await page.locator('#final3DetailedSolutions').waitFor();
    assert.equal(await page.locator('#final3DetailedSolutions .is-ready').count(),30);
    assert.equal(await page.locator('#final3DetailedSolutions .is-pending').count(),0);
    assert.equal(await page.locator('#final3DetailedSolutions .gfield-final3-solution-diagram').count(),7);
    assert.equal(await page.locator('#final3DetailedSolutions .f3-back-diagram').count(),7);
    assert.ok(await page.locator('#final3DetailedSolutions .final1-data-table').count()>=25);
    assert.match(await page.locator('#final3DetailedSolutions .final1-solutions-head').innerText(),/30문항 \/ 전체 30문항/);

    const layout={screen:{},print:{}};
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:900});
      await page.locator('#final3DetailedSolutions .final1-solutions-head').scrollIntoViewIfNeeded();
      await page.locator('#final3DetailedSolutions .final1-solutions-head').screenshot({path:path.join(artifactDir,'final3-head-'+width+'.png')});
      layout.screen[width]=await page.locator('#final3DetailedSolutions').evaluate(node=>({
        sectionFits:node.scrollWidth<=node.clientWidth+1,
        readyCards:[...node.querySelectorAll('.is-ready')].map(card=>({no:Number(card.dataset.detailedSolutionNo),fits:card.scrollWidth<=card.clientWidth+1,width:card.getBoundingClientRect().width,height:card.getBoundingClientRect().height})),
        pendingNos:[...node.querySelectorAll('.is-pending')].map(card=>Number(card.dataset.detailedSolutionNo)),
        tables:[...node.querySelectorAll('.final1-data-table')].map(table=>({no:Number(table.closest('[data-detailed-solution-no]').dataset.detailedSolutionNo),fits:table.scrollWidth<=table.parentElement.clientWidth+1,fontSize:parseFloat(getComputedStyle(table).fontSize)}))
      }));
      assert.equal(layout.screen[width].sectionFits,true,'section fits '+width);
      assert.ok(layout.screen[width].readyCards.every(card=>card.fits),'all cards fit '+width);
      assert.deepEqual(layout.screen[width].pendingNos,[]);
      assert.ok(layout.screen[width].tables.every(table=>table.fits&&table.fontSize>=12),'all tables fit and remain readable '+width);
      for(let no=1;no<=30;no++){
        await page.locator('#final3-solution-'+no).screenshot({path:path.join(artifactDir,'final3-card-'+no+'-'+width+'.png')});
      }
      for(const no of [1,3,4,6,7,8,13,17,18,19,24,25,26,30]){
        const figure=page.locator('#final3-solution-'+no+' [data-diagram-id]');
        assert.equal(await figure.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,'diagram fits Q'+no+' at '+width);
        await figure.screenshot({path:path.join(artifactDir,'final3-diagram-'+no+'-'+width+'.png')});
      }
    }

    assert.match(await page.locator('#final3-solution-24').innerText(),/ㄱ=6, ㄴ=1, ㄷ=4, ㄹ=2, ㅁ=5, ㅂ=3, ㅅ=8, ㅇ=9/);
    assert.match(await page.locator('#final3-solution-30').innerText(),/4색/);
    assert.match(await page.locator('#final3-solution-30').innerText(),/42쌍/);

    await page.setViewportSize({width:1280,height:900});
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#final3DetailedSolutions .is-pending').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).display==='none')),true);
    layout.print.readyCards=await page.locator('#final3DetailedSolutions .is-ready').evaluateAll(cards=>cards.map(card=>({no:Number(card.dataset.detailedSolutionNo),display:getComputedStyle(card).display,width:card.getBoundingClientRect().width,height:card.getBoundingClientRect().height})));
    assert.ok(layout.print.readyCards.every(card=>card.display!=='none'));
    await page.pdf({path:path.join(artifactDir,'final3-report-package.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});

    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>{window.print=()=>{window.__final3PrintRequested=true;};});
    await page.locator('#printFinal3Solutions').click();
    assert.equal(await page.evaluate(()=>window.__final3PrintRequested===true&&document.body.classList.contains('print-final1-solutions')),true);
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(artifactDir,'final3-details-only.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    await page.emulateMedia({media:'screen'});
    assert.equal(await page.evaluate(()=>document.body.classList.contains('print-final1-solutions')),false);

    assert.deepEqual(writes,[],'productionWrites0');
    assert.deepEqual(errors,[],'no browser page errors');
    fs.writeFileSync(path.join(artifactDir,'browser-summary.json'),JSON.stringify({pass:true,productionWrites:0,layout},null,2));
    console.log(JSON.stringify({pass:true,artifactDir,ready:30,pending:0,diagrams:14,tables:await page.locator('#final3DetailedSolutions .final1-data-table').count(),productionWrites:0}));
  }finally{
    await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
