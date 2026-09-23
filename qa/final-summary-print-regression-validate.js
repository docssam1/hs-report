'use strict';

// Synthetic learner only. The local server is read-only and every off-site request is mocked.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');

const root=path.resolve(__dirname,'..');
const student='docssam';
const reviewDir=process.env.GFIELD_SUMMARY_PRINT_REVIEW_DIR||'';
const ox=Array.from({length:30},(_,i)=>[1,4,7,11,14,18,21,24,27].includes(i)?'X':'O').join('');
const records=['final2','final7','last1'].map(round=>({student,round,ox,score:core.scoreOf(ox),wrong:9,source:'admin'}));
const baseline={schemaVersion:1,exam:'final2',scope:'provided-original-records',approved:true,version:'final2-'+'2'.repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]};
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+';d.students.push(n);d.studentTypes[n]="resident";d.archiveAccess["파이널 모의고사"]=[n];d.archiveAccess["최종 모의고사"]=[n];d.archiveProductAccess=d.archiveProductAccess||{};d.archiveProductAccess["mock-final-7"]=[n];d.attendance[n]=d.nodes.filter(x=>/파이널|최종/.test(x.title||"")).map(x=>x.id);})();';
const contentTypes={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/qa-print-blank'){
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><head></head><body></body></html>');return;
  }
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end();return;
  }
  res.setHeader('Content-Type',contentTypes[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

const failures=[];
async function check(label,fn){
  try{const detail=await fn();console.log('PASS '+label+(detail?' '+JSON.stringify(detail):''));}
  catch(error){failures.push(label+': '+error.message);console.error('FAIL '+label+': '+error.message);}
}
function variantsForSource(ids,source){
  return ids.map(id=>String(id).match(/-q0*(\d+)-v(\d+)$/))
    .filter(match=>match&&Number(match[1])===Number(source))
    .map(match=>match[2]).sort();
}
async function saveFinal2Review(page){
  if(!reviewDir)return [];
  const allowed=path.join(root,'.private-work','ignored')+path.sep;
  assert.ok(path.resolve(reviewDir).startsWith(allowed),'review images stay in the ignored private-work folder');
  fs.mkdirSync(reviewDir,{recursive:true});
  await page.evaluate(()=>{
    const frame=document.querySelector('iframe.gfield-final-report-print-frame');
    frame.style.cssText='position:fixed!important;left:0!important;top:0!important;width:800px!important;height:1200px!important;opacity:1!important;visibility:visible!important;z-index:99999!important';
  });
  const transition=path.join(reviewDir,'final2-summary-to-practice.png');
  await page.frameLocator('iframe.gfield-final-report-print-frame').locator('.pagedjs_pages > .pagedjs_page').last().screenshot({path:transition});
  const images=await page.evaluate(async()=>{
    const frame=document.querySelector('iframe.gfield-final-report-print-frame');
    const items=[...frame.contentDocument.querySelectorAll('.gfield-summary-practice-page')];
    return Promise.all(items.map(async (item,index)=>{
      const image=item.querySelector('.gfield-summary-practice-image');
      const response=await fetch(image.src),bytes=new Uint8Array(await response.arrayBuffer());
      let binary='';
      for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
      return {kind:item.dataset.practiceKind,index:index+1,base64:btoa(binary)};
    }));
  });
  const saved=[transition];
  images.forEach(item=>{
    const target=path.join(reviewDir,'final2-'+item.kind+'-'+String(item.index).padStart(2,'0')+'.png');
    fs.writeFileSync(target,Buffer.from(item.base64,'base64'));
    saved.push(target);
  });
  const printHTML=await page.evaluate(()=>{
    const frame=document.querySelector('iframe.gfield-final-report-print-frame');
    const copy=frame.contentDocument.documentElement.cloneNode(true);
    copy.querySelectorAll('script').forEach(node=>node.remove());
    const base=copy.ownerDocument.createElement('base');base.href=location.origin+'/';copy.querySelector('head').prepend(base);
    return '<!doctype html>'+copy.outerHTML;
  });
  const pdfPage=await page.context().newPage();
  try{
    await pdfPage.goto(new URL('/qa-print-blank',page.url()).href);
    await pdfPage.setContent(printHTML,{waitUntil:'load'});
    await pdfPage.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:30000});
    await pdfPage.evaluate(()=>document.fonts.ready);
    const target=path.join(reviewDir,'final2-summary-practice.pdf');
    await pdfPage.pdf({path:target,format:'A4',preferCSSPageSize:true,printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
    saved.push(target);
  }finally{await pdfPage.close();}
  return saved;
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const executablePath=process.env.GFIELD_QA_BROWSER_EXECUTABLE||'';
  const browser=await chromium.launch(executablePath?{executablePath}:{});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const errors=[],writes=[];
  await context.addInitScript(name=>{
    localStorage.setItem('gfield_student',name);
    localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));
    window.print=()=>{window.__qaNativePrintCalls=(window.__qaNativePrintCalls||0)+1;};
  },student);
  await context.route(/^https?:\/\//,route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===base){
      if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});
      return route.continue();
    }
    if(url.pathname==='/rest/v1/mock_results'){
      if(request.method()!=='GET')writes.push(request.method()+' '+url.pathname);
      return route.fulfill({json:records});
    }
    if(url.pathname.endsWith('/hs-final-population')){
      const body=request.postDataJSON();
      if(body.action)return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
      return route.fulfill({json:core.createResponse(Object.assign({},baseline,{exam:body.exam,version:String(body.exam)+'-'+'2'.repeat(64)}),body.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(request.method()))writes.push(request.method()+' '+url.pathname);
    if(/fonts\.googleapis\.com|cdn\.jsdelivr\.net/.test(url.hostname))return route.fulfill({contentType:'text/css',body:''});
    return route.fulfill({json:[]});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  const reportUrl=base+'/final.html?round=2&go=report&name='+encodeURIComponent(student);
  try{
    await page.goto(reportUrl);
    await page.locator('.report-screen-header').waitFor();
    await check('summary button remains attached after report UI updates',async()=>{
      const button=page.locator('#printBtn');
      assert.equal(await button.isVisible(),true,'the summary print action is visible');
      assert.equal(await button.evaluate(node=>node.isConnected),true,'the button is in the document');
      assert.match(await button.innerText(),/요약.*인쇄|인쇄.*요약/);
      await page.locator('.report-detail-toggle').click();
      await page.locator('.report-detail-toggle').click();
      assert.equal(await button.isVisible(),true,'the print action survives detail changes');
      assert.equal(await button.evaluate(node=>node.isConnected),true,'the button remains attached');
      return {label:await button.innerText()};
    });
    await check('static loader URLs are stable across visits',async()=>{
      const resources=()=>page.evaluate(()=>Object.fromEntries(performance.getEntriesByType('resource').map(x=>x.name).filter(name=>{
        const url=new URL(name);
        return url.origin===location.origin&&url.pathname.endsWith('.js')&&url.pathname!=='/data.js';
      }).map(name=>[new URL(name).pathname,name])));
      const first=await resources();
      assert.ok(Object.keys(first).length>=5,'the report loads static JavaScript modules');
      await page.waitForTimeout(25);
      await page.reload();
      await page.locator('.report-screen-header').waitFor();
      const second=await resources();
      assert.deepEqual(second,first,'only deliberately fresh data.js may change its cache key');
      return {stableModules:Object.keys(first).length};
    });
    await check('summary print contains nine real questions and nine worked answers',async()=>{
      assert.equal(await page.evaluate(()=>!!window.GFIELD_FINAL_SUMMARY_PRACTICE_PRINT),true,'the summary practice print controller is loaded');
      await page.locator('#gfield-full-print-btn').waitFor({state:'visible'});
      await page.locator('#printBtn').click();
      assert.equal(await page.evaluate(()=>window.__qaNativePrintCalls||0),0,'summary click does not also call native window.print');
      assert.equal(await page.locator('#gfield-full-print-btn').isVisible(),true,'the full-report action survives summary preparation');
      await page.waitForFunction(()=>{
        const frame=document.querySelector('iframe.gfield-final-report-print-frame');
        return frame&&frame.contentDocument&&frame.contentDocument.body.dataset.practiceQuestionCount==='9';
      },null,{timeout:120000});
      const evidence=await page.evaluate(async()=>{
        const frame=document.querySelector('iframe.gfield-final-report-print-frame');
        const doc=frame.contentDocument,body=doc.body;
        const pages=[...doc.querySelectorAll('.gfield-summary-practice-page')];
        const byKind=kind=>pages.filter(node=>node.getAttribute('data-practice-kind')===kind);
        const ids=nodes=>nodes.flatMap(node=>String(node.getAttribute('data-practice-item-ids')||'').split(',').map(x=>x.trim()).filter(Boolean));
        const images=[...doc.querySelectorAll('.gfield-summary-practice-image')];
        const imageChecks=await Promise.all(images.map(async img=>{
          await img.decode();
          const canvas=doc.createElement('canvas');canvas.width=128;canvas.height=128;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,128,128);ctx.drawImage(img,0,0,128,128);
          const pixels=ctx.getImageData(0,0,128,128).data;let ink=0;
          for(let i=0;i<pixels.length;i+=4)if(pixels[i]<220||pixels[i+1]<220||pixels[i+2]<220)ink++;
          return {width:img.naturalWidth,height:img.naturalHeight,ink};
        }));
        const result={questionCount:Number(body.dataset.practiceQuestionCount),answerCount:Number(body.dataset.practiceAnswerCount),sourceNos:String(body.dataset.practiceSourceNos||'').split(',').filter(Boolean),questionIds:ids(byKind('questions')),answerIds:ids(byKind('answers')),prompts:JSON.parse(body.dataset.practicePromptFingerprints||'[]'),answers:JSON.parse(body.dataset.practiceAnswerFingerprints||'[]'),images:imageChecks,bankUrl:body.dataset.practiceBankUrl||''};
        return result;
      });
      assert.equal(evidence.questionCount,9);
      assert.equal(evidence.answerCount,9);
      assert.deepEqual(evidence.sourceNos,['2','5','8'],'the three recommended Final 2 source items');
      assert.equal(new Set(evidence.sourceNos).size,3,'three recommended source items');
      assert.equal(evidence.questionIds.length,9,'nine printed problem cards');
      assert.equal(new Set(evidence.questionIds).size,9,'nine different variants');
      for(const source of evidence.sourceNos){
        const variants=variantsForSource(evidence.questionIds,source);
        assert.deepEqual(variants,['1','2','3'],'three variants for source '+source);
      }
      assert.deepEqual(evidence.answerIds.slice().sort(),evidence.questionIds.slice().sort(),'one worked answer per question');
      assert.equal(evidence.prompts.length,9,'nine inspected prompt texts');
      assert.equal(evidence.answers.length,9,'nine inspected answer texts');
      for(const row of evidence.prompts)assert.ok(row.id&&row.length>=30&&/^[0-9a-f]{8}$/i.test(row.hash),'nonempty prompt evidence '+JSON.stringify(row));
      for(const row of evidence.answers)assert.ok(row.id&&row.length>=20&&/^[0-9a-f]{8}$/i.test(row.hash),'nonempty worked-answer evidence '+JSON.stringify(row));
      assert.deepEqual(evidence.prompts.map(x=>x.id).sort(),evidence.questionIds.slice().sort());
      assert.deepEqual(evidence.answers.map(x=>x.id).sort(),evidence.questionIds.slice().sort());
      assert.ok(evidence.bankUrl.includes('bank/index.html'),'question source is the reviewed bank');
      assert.ok(evidence.images.length>=2&&evidence.images.every(x=>x.width>=500&&x.height>=500&&x.ink>25),'decoded A4 images contain visible content');
      const saved=await saveFinal2Review(page);
      await page.evaluate(()=>document.querySelector('iframe.gfield-final-report-print-frame').contentWindow.dispatchEvent(new Event('afterprint')));
      return {sources:3,questions:9,answers:9,imagePages:evidence.images.length,reviewFiles:saved.length};
    });
    await check('Final 7 uses the same nine-question summary print contract',async()=>{
      await page.goto(base+'/final.html?round=7&go=report&name='+encodeURIComponent(student));
      await page.locator('.report-screen-header').waitFor();
      assert.equal(await page.locator('#printBtn').isVisible(),true);
      await page.locator('#printBtn').click();
      await page.waitForFunction(()=>{
        const frame=document.querySelector('iframe.gfield-final-report-print-frame');
        return frame&&frame.contentDocument&&frame.contentDocument.body.dataset.practiceQuestionCount==='9';
      },null,{timeout:120000});
      const result=await page.evaluate(async()=>{
        const frame=document.querySelector('iframe.gfield-final-report-print-frame');
        const body=frame.contentDocument.body;
        const pages=[...frame.contentDocument.querySelectorAll('.gfield-summary-practice-page')];
        const ids=kind=>pages.filter(node=>node.dataset.practiceKind===kind).flatMap(node=>String(node.dataset.practiceItemIds||'').split(',').filter(Boolean));
        const images=[...frame.contentDocument.querySelectorAll('.gfield-summary-practice-image')];
        await Promise.all(images.map(image=>image.decode()));
        const value={sources:String(body.dataset.practiceSourceNos||'').split(',').filter(Boolean),questions:ids('questions'),answers:ids('answers'),promptCount:JSON.parse(body.dataset.practicePromptFingerprints||'[]').length,answerCount:JSON.parse(body.dataset.practiceAnswerFingerprints||'[]').length,images:images.length,bankUrl:body.dataset.practiceBankUrl||''};
        frame.contentWindow.dispatchEvent(new Event('afterprint'));
        return value;
      });
      assert.equal(new Set(result.sources).size,3);
      assert.equal(new Set(result.questions).size,9);
      for(const source of result.sources){
        const variants=variantsForSource(result.questions,source);
        assert.deepEqual(variants,['1','2','3'],'three Final 7 variants for source '+source);
      }
      assert.deepEqual(result.answers.slice().sort(),result.questions.slice().sort());
      assert.equal(result.promptCount,9);
      assert.equal(result.answerCount,9);
      assert.ok(result.images>=2);
      assert.match(result.bankUrl,/bank=final7/);
      return {sources:3,questions:9,answers:9,imagePages:result.images};
    });
    await check('no wrong answers prints a summary without practice pages',async()=>{
      const record=records.find(row=>row.round==='final2'),before={...record};
      try{
        Object.assign(record,{ox:'O'.repeat(30),score:100,wrong:0});
        await page.goto(reportUrl);
        await page.locator('.report-screen-header').waitFor();
        await page.locator('#printBtn').click();
        await page.waitForFunction(()=>{
          const frame=document.querySelector('iframe.gfield-final-report-print-frame');
          return frame&&frame.contentDocument&&frame.contentDocument.body.dataset.practiceQuestionCount==='0';
        },null,{timeout:60000});
        const result=await page.evaluate(()=>{
          const frame=document.querySelector('iframe.gfield-final-report-print-frame');
          const doc=frame.contentDocument;
          const value={questions:doc.body.dataset.practiceQuestionCount,answers:doc.body.dataset.practiceAnswerCount,practicePages:doc.querySelectorAll('.gfield-summary-practice-page').length,summaryPages:doc.querySelectorAll('.pagedjs_pages > .pagedjs_page').length};
          frame.contentWindow.dispatchEvent(new Event('afterprint'));
          return value;
        });
        assert.equal(result.questions,'0');
        assert.equal(result.answers,'0');
        assert.equal(result.practicePages,0);
        assert.ok(result.summaryPages>=1,'diagnostic summary still prints');
        return result;
      }finally{Object.assign(record,before);}
    });
    await check('Last report print label matches native print action',async()=>{
      await page.goto(base+'/final.html?set=last&round=1&go=report&name='+encodeURIComponent(student));
      await page.locator('.report-screen-header').waitFor();
      const button=page.locator('#printBtn');
      assert.equal(await button.isVisible(),true);
      assert.equal(await button.evaluate(node=>node.isConnected),true);
      assert.match(await button.innerText(),/인쇄/);
      assert.doesNotMatch(await button.innerText(),/요약/,'Last uses native full-report print');
      await button.click();
      assert.equal(await page.evaluate(()=>window.__qaNativePrintCalls),1,'one native print action');
      assert.equal(await page.locator('.report-screen-header').count(),1,'the report remains visible');
      return {label:await button.innerText(),nativePrintCalls:1};
    });
    await check('no browser errors or production writes',async()=>{
      assert.deepEqual(errors,[]);
      assert.deepEqual(writes,[]);
    });
  }finally{
    await browser.close();server.close();
  }
  if(failures.length){console.error('FAILURES '+failures.length+': '+failures.join(' | '));process.exitCode=1;}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
