'use strict';

// Synthetic learner only. All off-site writes are rejected; no PDF is created here.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const core=require('../supabase/functions/hs-final-population/population-core.js');

const root=path.resolve(__dirname,'..');
const vendor=path.join(root,'vendor/pagedjs/0.4.3/paged.polyfill.js');
const license=path.join(root,'vendor/pagedjs/0.4.3/LICENSE.md');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
assert.equal(sha(vendor),'F59F361802416C770D549A647958649AF2CF6601999924BC00E4F507DAD5269F','pinned pagedjs@0.4.3 distribution');
assert.equal(sha(license),'F49BDDE202CA66880E2D7CB7FD8103F43A917A60B61681484A66CF370E7647E0','pinned MIT license');
assert.match(fs.readFileSync(license,'utf8'),/The MIT License[\s\S]*Copyright[\s\S]*Permission is hereby granted/);
const moduleSource=fs.readFileSync(path.join(root,'final-report-print.js'),'utf8');
assert.doesNotMatch(moduleSource,/\blocalStorage\b|\bsessionStorage\b|\bfetch\s*\(|\bXMLHttpRequest\b/,'print module never reads or writes learner/session storage or network data APIs');
assert.match(moduleSource,/@page gfield-report-prelude\{size:A4 portrait;margin:0\}/,'finished Paged sheets use a zero-margin native shell');
assert.match(moduleSource,/@page\{size:A4 portrait;margin:10mm\}/,'the prelude itself is measured and paginated with 10mm content margins');
assert.match(moduleSource,/report-print-cover\{min-height:260mm!important;padding:12mm 8mm!important\}/);
assert.match(moduleSource,/report-docssam-note\{break-before:page!important;page-break-before:always!important;break-inside:avoid!important;page-break-inside:avoid!important\}/);
assert.match(moduleSource,/report-docssam-note>h2\{break-after:avoid!important;page-break-after:avoid!important\}/);
assert.match(moduleSource,/docssam-saved-comment\{orphans:2;widows:2\}/);
assert.match(moduleSource,/\.able-box\{break-inside:avoid!important;page-break-inside:avoid!important\}/);
const finalHtml=fs.readFileSync(path.join(root,'final.html'),'utf8');
assert.match(finalHtml,/<link rel="stylesheet" href="final-report-print\.css">/,'print layout is loaded by the report page');
assert.match(finalHtml,/if\(isFinal2\) files\.push\([^\n]*'final-report-print\.js'\)/,'print controller is loaded only for Final2');

const student='인쇄모듈합성검수학생';
const ox='O'.repeat(30);
const score=core.scoreOf(ox);
const teacherComment=Array.from({length:80},(_,index)=>'복습 안내 '+(index+1)+': 문제의 조건에 표시하고 식을 세운 까닭을 한 줄씩 적으며 다시 확인해 보세요.').join('\n');
const records=[1,2,3,4].map(n=>({student,round:'final'+n,ox,score,wrong:0,source:'admin'}));
const baselines=Object.fromEntries([1,2,3,4].map(n=>['final'+n,{schemaVersion:1,exam:'final'+n,scope:'provided-original-records',approved:true,version:'final'+n+'-'+String(n).repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]}]));
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{let d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveAccess['파이널 모의고사']=[n];d.attendance[n]=d.nodes.filter(x=>/파이널/.test(x.title||'')).map(x=>x.id);})();`;
const writes=[];
const errors=[];
let retryRequests=0;

const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/paged-on-retry.js'){
    retryRequests++;
    if(retryRequests===1){res.writeHead(503);return res.end('first request intentionally fails');}
    res.setHeader('Content-Type','application/javascript');
    return fs.createReadStream(vendor).pipe(res);
  }
  if(pathname==='/slow-paged.js'){
    return setTimeout(()=>{
      if(res.destroyed)return;
      res.setHeader('Content-Type','application/javascript');
      fs.createReadStream(vendor).pipe(res);
    },500);
  }
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||/\.private(?:-work|\.json)/.test(file)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);return res.end();
  }
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const origin=new URL(base).origin;
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:390,height:900}});
  await context.addInitScript(name=>{
    localStorage.setItem('gfield_student',name);
    localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'synthetic-only',refresh_token:'synthetic-only',expires_at:Math.floor(Date.now()/1000)+3600,login_name:name}));
  },student);
  await context.route(/^https?:\/\//,route=>{
    const request=route.request();
    const url=new URL(request.url());
    if(url.origin===origin){
      if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});
      return route.continue();
    }
    if(url.pathname==='/rest/v1/mock_results'){
      if(request.method()!=='GET')writes.push(request.method()+' '+url.pathname);
      return route.fulfill({json:records});
    }
    if(url.pathname.endsWith('/hs-final-population')){
      const body=request.postDataJSON();
      if(body.action){
        if(body.action!=='read-report')writes.push(body.action);
        return route.fulfill({json:{canEdit:false,comment:teacherComment,snapshot:null,resultOx:ox}});
      }
      return route.fulfill({json:core.createResponse(baselines[body.exam],body.scores)});
    }
    if(!['GET','HEAD','OPTIONS'].includes(request.method())&&!url.pathname.endsWith('/access_log'))writes.push(request.method()+' '+url.pathname);
    return route.fulfill({contentType:'text/css',body:''});
  });

  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(base+'/final.html?round=2&go=report&name='+encodeURIComponent(student));
    await page.locator('.final-report-package #final2DetailedSolutions').waitFor();
    assert.equal(await page.locator('#final2DetailedSolutions .is-ready').count(),30);
    assert.equal(await page.locator('#final2DetailedSolutions .is-pending').count(),0);
    assert.deepEqual(await page.evaluate(()=>({
      api:!!window.GFIELD_FINAL_REPORT_PRINT,
      supported:window.GFIELD_FINAL_REPORT_PRINT&&window.GFIELD_FINAL_REPORT_PRINT.supportedRounds.slice(),
      wired:document.querySelector('#printBtn').classList.contains('gfield-final-report-print-button'),
      css:!!document.querySelector('link[href="final-report-print.css"]')
    })),{api:true,supported:[2],wired:true,css:true},'Final2 report loads and wires the reviewed print module');

    const before=await page.evaluate(()=>({
      package:document.querySelector('.final-report-package').outerHTML,
      storage:(()=>{const session=JSON.parse(localStorage.getItem('gfield_hs_student_session_v1'));return {student:localStorage.getItem('gfield_student'),session:{access_token:session.access_token,refresh_token:session.refresh_token,login_name:session.login_name}};})(),
      url:location.href,
      bodyClass:document.body.className
    }));

    const prepared=await page.evaluate(async()=>{
      const job=GFIELD_FINAL_REPORT_PRINT.createPreparation({
        source:document.querySelector('.final-report-package'),
        requiredFontFamilies:[],
        timeoutMs:30000,
        printCleanupTimeoutMs:10
      });
      const value=await job.promise.catch(error=>{throw new Error((error&&error.code||error&&error.name||'print-error')+': '+(error&&error.message||''));});
      window.__gfieldPreparedPrint=value;
      const doc=value.frame.contentDocument;
      const host=doc.querySelector('#gfield-final2-detail-host');
      const pages=[...doc.querySelectorAll('.pagedjs_pages > .pagedjs_page')];
      const splitTables=[...doc.querySelectorAll('.pagedjs_pages table[data-split-from]')];
      const noteTitle=doc.querySelector('.pagedjs_pages #docssam-note-title');
      const noteSection=noteTitle&&noteTitle.closest('.report-docssam-note');
      const notePage=noteTitle&&noteTitle.closest('.pagedjs_page');
      const noteArea=notePage&&notePage.querySelector('.pagedjs_area');
      const rect=node=>node&&node.getBoundingClientRect().toJSON();
      const firstTextRect=node=>{
        if(!node)return null;
        const walker=doc.createTreeWalker(node,NodeFilter.SHOW_TEXT);
        for(let text=walker.nextNode();text;text=walker.nextNode()){
          if(!text.textContent.trim())continue;
          const range=doc.createRange();range.selectNodeContents(text);
          const box=[...range.getClientRects()].find(item=>item.width>0&&item.height>0);
          return box&&box.toJSON()||null;
        }
        return null;
      };
      return {
        metrics:value.metrics,
        frame:{width:value.frame.getBoundingClientRect().width,height:value.frame.getBoundingClientRect().height},
        pages:pages.length,
        pageBoxes:pages.map(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height})),
        blanks:doc.querySelectorAll('.gfield-report-print-blank').length,
        shadowReady:host.shadowRoot.querySelectorAll('.final1-detailed-card.is-ready').length,
        shadowPending:host.shadowRoot.querySelectorAll('.is-pending').length,
        shadowDiagrams:host.shadowRoot.querySelectorAll('.gfield-final2-solution-diagram').length,
        lockedTables:doc.querySelectorAll('.pagedjs_pages table[data-gfield-print-table] colgroup[data-gfield-print-widths]').length,
        splitTables:splitTables.length,
        repeatedHeads:splitTables.every(table=>table.querySelector(':scope > thead')&&table.querySelector(':scope > colgroup')),
        docssamLayout:{
          title:rect(noteTitle),
          firstCommentLine:firstTextRect(noteSection&&noteSection.querySelector('.docssam-saved-comment')),
          section:rect(noteSection),
          area:rect(noteArea),
          page:Number(notePage&&notePage.dataset.pageNumber||0)
        }
      };
    });
    assert.equal(prepared.metrics.round,2);
    assert.equal(prepared.metrics.detailItems.length,30);
    assert.deepEqual(prepared.metrics.detailItems,Array.from({length:30},(_,index)=>index+1));
    assert.ok(prepared.metrics.preludePages>=1);
    assert.equal(prepared.metrics.blankPages,prepared.metrics.preludePages%2);
    assert.equal(prepared.metrics.detailStartPage%2,1,'details start on a fresh front side');
    assert.equal(prepared.pages,prepared.metrics.preludePages);
    assert.equal(prepared.blanks,prepared.metrics.blankPages);
    assert.equal(prepared.shadowReady,30);
    assert.equal(prepared.shadowPending,0);
    assert.equal(prepared.shadowDiagrams,7);
    assert.equal(prepared.metrics.tableCount,6,'all six visible report tables are measured in the A4 frame');
    assert.ok(prepared.lockedTables>=prepared.metrics.tableCount,'measured column proportions survive pagination');
    assert.equal(prepared.repeatedHeads,true,'split tables retain headers and colgroups');
    assert.ok(prepared.docssamLayout.title&&prepared.docssamLayout.firstCommentLine&&prepared.docssamLayout.area,'docssam comment title and first line remain in a rendered page area');
    assert.equal(prepared.docssamLayout.page,2,'docssam comment starts on the first diagnosis page after the cover');
    assert.ok(prepared.docssamLayout.title.top>=prepared.docssamLayout.area.top-1&&prepared.docssamLayout.title.bottom<=prepared.docssamLayout.area.bottom+1&&
      prepared.docssamLayout.title.left>=prepared.docssamLayout.area.left-1&&prepared.docssamLayout.title.right<=prepared.docssamLayout.area.right+1,
      'docssam comment title is not clipped at a page boundary: '+JSON.stringify(prepared.docssamLayout));
    assert.ok(prepared.docssamLayout.firstCommentLine.top>=prepared.docssamLayout.area.top-1&&prepared.docssamLayout.firstCommentLine.bottom<=prepared.docssamLayout.area.bottom+1&&
      prepared.docssamLayout.firstCommentLine.left>=prepared.docssamLayout.area.left-1&&prepared.docssamLayout.firstCommentLine.right<=prepared.docssamLayout.area.right+1,
      'docssam comment title and first line stay together while long comments may continue: '+JSON.stringify(prepared.docssamLayout));
    assert.ok(Math.abs(prepared.frame.width-793.7)<3&&Math.abs(prepared.frame.height-1122.5)<3,'preparation frame is actual A4 size at CSS 96dpi');
    assert.ok(prepared.pageBoxes.every(box=>Math.abs(box.width-793.7)<3&&Math.abs(box.height-1122.5)<3),'every paged prelude sheet is A4');

    await page.evaluate(()=>window.__gfieldPreparedPrint.frame.style.setProperty('display','block','important'));
    await page.emulateMedia({media:'print'});
    await page.waitForTimeout(50);
    const printDocssamLayout=await page.evaluate(()=>{
      const frame=window.__gfieldPreparedPrint.frame;
      const doc=frame.contentDocument;
      const titles=[...doc.querySelectorAll('.pagedjs_pages #docssam-note-title')];
      const title=titles[0];
      const section=title&&title.closest('.report-docssam-note');
      const comment=section&&section.querySelector('.docssam-saved-comment');
      const page=title&&title.closest('.pagedjs_page');
      const area=page&&page.querySelector('.pagedjs_area');
      const rect=node=>node&&node.getBoundingClientRect().toJSON();
      const firstTextRect=node=>{
        if(!node)return null;
        const walker=doc.createTreeWalker(node,NodeFilter.SHOW_TEXT);
        for(let text=walker.nextNode();text;text=walker.nextNode()){
          if(!text.textContent.trim())continue;
          const range=doc.createRange();range.selectNodeContents(text);
          const box=[...range.getClientRects()].find(item=>item.width>0&&item.height>0);
          return box&&box.toJSON()||null;
        }
        return null;
      };
      return {title:rect(title),firstCommentLine:firstTextRect(comment),comment:rect(comment),section:rect(section),area:rect(area),page:Number(page&&page.dataset.pageNumber||0),copies:titles.map(node=>({
        title:rect(node),
        page:Number(node.closest('.pagedjs_page')&&node.closest('.pagedjs_page').dataset.pageNumber||0),
        area:rect(node.closest('.pagedjs_page')&&node.closest('.pagedjs_page').querySelector('.pagedjs_area'))
      }))};
    });
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>window.__gfieldPreparedPrint.frame.style.removeProperty('display'));
    assert.ok(printDocssamLayout.title&&printDocssamLayout.firstCommentLine&&printDocssamLayout.area,'docssam comment remains measurable under native print rules');
    assert.equal(printDocssamLayout.page,2,'docssam comment remains on diagnosis page one under native print rules');
    assert.equal(printDocssamLayout.copies.length,1,'the paged diagnosis contains exactly one docssam comment heading');
    assert.ok(printDocssamLayout.title.top>=printDocssamLayout.area.top-1&&printDocssamLayout.title.bottom<=printDocssamLayout.area.bottom+1&&
      printDocssamLayout.title.left>=printDocssamLayout.area.left-1&&printDocssamLayout.title.right<=printDocssamLayout.area.right+1,
      'docssam comment title stays inside its native print area: '+JSON.stringify(printDocssamLayout));
    assert.ok(printDocssamLayout.firstCommentLine.top>=printDocssamLayout.area.top-1&&printDocssamLayout.firstCommentLine.bottom<=printDocssamLayout.area.bottom+1&&
      printDocssamLayout.firstCommentLine.left>=printDocssamLayout.area.left-1&&printDocssamLayout.firstCommentLine.right<=printDocssamLayout.area.right+1,
      'native print keeps the docssam comment heading with its first line: '+JSON.stringify(printDocssamLayout));

    const afterPrepare=await page.evaluate(()=>({
      package:document.querySelector('.final-report-package').outerHTML,
      storage:(()=>{const session=JSON.parse(localStorage.getItem('gfield_hs_student_session_v1'));return {student:localStorage.getItem('gfield_student'),session:{access_token:session.access_token,refresh_token:session.refresh_token,login_name:session.login_name}};})(),
      url:location.href,
      bodyClass:document.body.className
    }));
    assert.deepEqual(afterPrepare,before,'preparation does not mutate report, session, URL, or body mode');

    const cancelCleanup=await page.evaluate(async()=>{
      const value=window.__gfieldPreparedPrint;
      value.frame.contentWindow.print=function(){};
      let settled=false;
      const printing=value.openPrint().then(metrics=>{settled=true;return metrics;});
      await new Promise(resolve=>setTimeout(resolve,40));
      const survivedUntilAfterprint=value.frame.isConnected&&!settled;
      value.frame.contentWindow.dispatchEvent(new Event('afterprint'));
      const metrics=await printing;
      delete window.__gfieldPreparedPrint;
      return {metrics,survivedUntilAfterprint,frames:document.querySelectorAll('.'+value.frame.className).length,connected:value.frame.isConnected};
    });
    assert.equal(cancelCleanup.metrics.detailStartPage%2,1);
    assert.equal(cancelCleanup.survivedUntilAfterprint,true,'prepared frame survives until afterprint instead of an arbitrary timer');
    assert.equal(cancelCleanup.frames,0);
    assert.equal(cancelCleanup.connected,false,'afterprint/cancel cleans temporary frame');

    const failureCodes=await page.evaluate(async base=>{
      const source=document.querySelector('.final-report-package');
      async function code(job){try{const value=await job.promise;value.cleanup();return 'unexpected-success';}catch(error){return error.code;}}
      const missingFont=await code(GFIELD_FINAL_REPORT_PRINT.createPreparation({source,requiredFontFamilies:['검수용 없는 글꼴'],timeoutMs:5000}));
      const missingLibrary=await code(GFIELD_FINAL_REPORT_PRINT.createPreparation({source,requiredFontFamilies:[],libraryUrl:base+'/does-not-exist.js',timeoutMs:5000}));

      const imageClone=source.cloneNode(true);
      imageClone.style.position='fixed';imageClone.style.left='-10000px';
      const badImage=document.createElement('img');badImage.src=base+'/does-not-exist.png';imageClone.prepend(badImage);document.body.append(imageClone);
      const missingImage=await code(GFIELD_FINAL_REPORT_PRINT.createPreparation({source:imageClone,requiredFontFamilies:[],timeoutMs:5000}));
      imageClone.remove();

      const tableClone=source.cloneNode(true);
      tableClone.style.position='fixed';tableClone.style.left='-10000px';document.body.append(tableClone);
      tableClone.querySelector('table th').colSpan=2;
      const badTable=await code(GFIELD_FINAL_REPORT_PRINT.createPreparation({source:tableClone,requiredFontFamilies:[],timeoutMs:5000}));
      tableClone.remove();
      return {missingFont,missingLibrary,missingImage,badTable,frames:document.querySelectorAll('.gfield-final-report-print-frame').length};
    },base);
    assert.deepEqual(failureCodes,{missingFont:'font-missing',missingLibrary:'library-load',missingImage:'image-load',badTable:'table-columns',frames:0});

    const controllerResult=await page.evaluate(async base=>{
      const button=document.createElement('button');
      button.textContent='합성 인쇄';
      button.setAttribute('aria-label','합성 인쇄');
      button.onclick=function(){window.__syntheticLegacyPrint=true;};
      document.body.appendChild(button);
      const original={text:button.textContent,onclick:button.onclick,disabled:button.disabled,aria:button.getAttribute('aria-label')};
      const states=[];
      const controller=GFIELD_FINAL_REPORT_PRINT.attach({
        button,
        source:document.querySelector('.final-report-package'),
        libraryUrl:base+'/slow-paged.js',
        requiredFontFamilies:[],
        timeoutMs:5000,
        openPrint:false,
        onStateChange:event=>states.push(event.state)
      });
      const duplicate=GFIELD_FINAL_REPORT_PRINT.attach({button});
      const first=controller.prepareAndPrint();
      const second=controller.prepareAndPrint();
      const samePromise=first===second;
      const preparing={disabled:button.disabled,busy:button.getAttribute('aria-busy'),text:button.textContent};
      controller.cancel();
      const restoredAfterCancel=button.textContent===original.text&&!button.disabled&&button.onclick===null;
      const retry=controller.retry();
      let cancelCode='';try{await first;}catch(error){cancelCode=error.code;}
      const oldCatchDidNotClobberRetry=button.disabled&&button.getAttribute('aria-busy')==='true'&&button.textContent==='인쇄 준비 중…';
      const retryPrepared=await retry;
      const retryReady=retryPrepared.metrics.detailStartPage%2===1&&button.textContent===original.text&&!button.disabled;
      retryPrepared.cleanup();
      controller.dispose();
      const legacyRestored=button.onclick===original.onclick&&button.textContent===original.text&&button.getAttribute('aria-label')===original.aria;
      button.remove();
      return {sameController:duplicate===controller,samePromise,preparing,cancelCode,restoredAfterCancel,oldCatchDidNotClobberRetry,retryReady,legacyRestored,states,frames:document.querySelectorAll('.gfield-final-report-print-frame').length};
    },base);
    assert.equal(controllerResult.sameController,true,'one controller per button');
    assert.equal(controllerResult.samePromise,true,'repeated click shares one preparation');
    assert.deepEqual(controllerResult.preparing,{disabled:true,busy:'true',text:'인쇄 준비 중…'});
    assert.equal(controllerResult.cancelCode,'cancelled');
    assert.equal(controllerResult.restoredAfterCancel,true);
    assert.equal(controllerResult.oldCatchDidNotClobberRetry,true,'a cancelled promise cannot reset a newer retry state');
    assert.equal(controllerResult.retryReady,true);
    assert.equal(controllerResult.legacyRestored,true,'legacy package handler is restored on dispose');
    assert.equal(controllerResult.frames,0);

    const retryResult=await page.evaluate(async base=>{
      const button=document.createElement('button');
      button.textContent='재시도 합성 인쇄';
      document.body.appendChild(button);
      const original=button.textContent;
      const controller=GFIELD_FINAL_REPORT_PRINT.attach({
        button,
        source:document.querySelector('.final-report-package'),
        libraryUrl:base+'/paged-on-retry.js',
        requiredFontFamilies:[],
        timeoutMs:10000,
        openPrint:false
      });
      let first='';try{await controller.prepareAndPrint();}catch(error){first=error.code;}
      const failureState={disabled:button.disabled,state:button.dataset.printState,text:button.textContent};
      const prepared=await controller.retry();
      const second={detailStart:prepared.metrics.detailStartPage,ready:prepared.frame.contentDocument.querySelector('#gfield-final2-detail-host').shadowRoot.querySelectorAll('.is-ready').length};
      prepared.cleanup();
      controller.dispose();
      const restored=button.textContent===original;
      button.remove();
      return {first,failureState,second,restored,frames:document.querySelectorAll('.gfield-final-report-print-frame').length};
    },base);
    assert.equal(retryResult.first,'library-load');
    assert.deepEqual(retryResult.failureState,{disabled:false,state:'error',text:'인쇄 준비 실패 · 다시 시도'});
    assert.equal(retryResult.second.detailStart%2,1);
    assert.equal(retryResult.second.ready,30);
    assert.equal(retryResult.restored,true);
    assert.equal(retryResult.frames,0);
    assert.equal(retryRequests,2,'retry starts from a clean frame and reloads the pinned engine');

    const detailPrint=await page.evaluate(async()=>{
      window.__legacyDetailPrints=0;
      window.print=()=>{window.__legacyDetailPrints++;};
      document.querySelector('#printFinal2Solutions').click();
      const active=document.body.classList.contains('print-final1-solutions');
      window.dispatchEvent(new Event('afterprint'));
      return {calls:window.__legacyDetailPrints,active,clean:!document.body.classList.contains('print-final1-solutions')};
    });
    assert.deepEqual(detailPrint,{calls:1,active:true,clean:true},'existing detail-only print remains intact');

    assert.deepEqual(writes,[],'productionWrites0');
    assert.deepEqual(errors,[],'no page errors');
    assert.deepEqual(await page.evaluate(()=>({
      package:document.querySelector('.final-report-package').outerHTML,
      storage:(()=>{const session=JSON.parse(localStorage.getItem('gfield_hs_student_session_v1'));return {student:localStorage.getItem('gfield_student'),session:{access_token:session.access_token,refresh_token:session.refresh_token,login_name:session.login_name}};})(),
      url:location.href,
      bodyClass:document.body.className
    })),before,'all temporary jobs leave the live report and session unchanged');
    console.log(JSON.stringify({pass:true,preludePages:prepared.metrics.preludePages,blankPages:prepared.metrics.blankPages,detailStartPage:prepared.metrics.detailStartPage,detailItems:30,tableCount:prepared.metrics.tableCount,docssamPrint:printDocssamLayout,productionWrites:0}));
  }finally{
    await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
