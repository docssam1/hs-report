/* Reviewed priority practice appended to the concise Final report print. */
(function(global){
  'use strict';

  var VERSION='1.0.0';
  var DEFAULT_TIMEOUT=45000;
  var controllers=new WeakMap();
  var BANK_FRAME_CLASS='gfield-summary-practice-bank-frame';
  var PAGE_CLASS='gfield-summary-practice-page';

  function PrintError(code,message){
    this.name='SummaryPracticePrintError';
    this.code=code;
    this.message=message;
    if(Error.captureStackTrace)Error.captureStackTrace(this,PrintError);
  }
  PrintError.prototype=Object.create(Error.prototype);
  PrintError.prototype.constructor=PrintError;
  function fail(code,message){throw new PrintError(code,message);}
  function list(value){return Array.prototype.slice.call(value||[]);}
  function compact(value){return String(value==null?'':value).replace(/\s+/g,'').trim();}
  function hash(value){
    var source=compact(value),h=2166136261;
    for(var i=0;i<source.length;i++){
      h^=source.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return ('00000000'+(h>>>0).toString(16)).slice(-8);
  }
  function wait(ms){return new Promise(function(resolve){global.setTimeout(resolve,ms);});}
  function withTimeout(promise,ms,code,message){
    return new Promise(function(resolve,reject){
      var timer=global.setTimeout(function(){reject(new PrintError(code,message));},ms);
      Promise.resolve(promise).then(function(value){global.clearTimeout(timer);resolve(value);},function(error){global.clearTimeout(timer);reject(error);});
    });
  }
  function check(job){if(job.cancelled)fail('cancelled','인쇄 준비가 취소되었습니다.');}
  function cleanupFrame(frame){if(frame&&frame.parentNode)frame.parentNode.removeChild(frame);}
  function revokeUrls(job){job.urls.splice(0).forEach(function(url){global.URL.revokeObjectURL(url);});}
  function cleanup(job){
    if(job.cleaned)return;
    job.cleaned=true;
    cleanupFrame(job.bankFrame);
    job.bankFrame=null;
    if(job.prepared){job.prepared.cleanup();job.prepared=null;}
    else if(job.reportJob)job.reportJob.cancel();
    revokeUrls(job);
  }
  function cancel(job){job.cancelled=true;cleanup(job);}

  function validateOptions(options,requireButton){
    var doc=options.document||global.document;
    var button=typeof options.button==='string'?doc.querySelector(options.button):options.button;
    var source=typeof options.source==='string'?doc.querySelector(options.source):options.source;
    var round=Number(options.round);
    var nos=options.priorityNos;
    if(requireButton&&(!button||button.nodeType!==1))fail('button-missing','인쇄 단추를 찾지 못했습니다.');
    if(!source||source.nodeType!==1||!source.classList.contains('final-report-package'))fail('source-missing','인쇄할 진단 요약을 찾지 못했습니다.');
    if(![1,2,3,4,7].includes(round)||Number(source.getAttribute('data-report-round'))!==round)fail('round-invalid','진단지 회차와 유사문제 회차가 다릅니다.');
    if(!Array.isArray(nos)||nos.length>3||nos.some(function(no){return !Number.isInteger(Number(no))||Number(no)<1||Number(no)>30;})||new Set(nos.map(Number)).size!==nos.length){
      fail('priority-invalid','이번 주 우선 복습 문항을 확인할 수 없습니다.');
    }
    var printedPriority=list(source.querySelectorAll('.parent-priority-list li b')).map(function(node){
      var match=/^\s*(\d+)번/.exec(node.textContent||'');
      return match?Number(match[1]):NaN;
    });
    if(printedPriority.length!==nos.length||printedPriority.some(function(no,index){return no!==Number(nos[index]);}))fail('priority-mismatch','화면의 우선 복습 추천과 인쇄할 문항이 다릅니다.');
    return {doc:doc,button:button,source:source,round:round,nos:nos.map(Number),name:String(options.name||'').trim(),timeout:Number(options.timeoutMs)||DEFAULT_TIMEOUT};
  }

  function bankUrl(input){
    var params=new URLSearchParams({
      bank:'final'+input.round,
      practice:'wrong',
      source:'final|'+input.round,
      sourceNos:input.nos.join(','),
      gens:input.nos.map(function(no){return 'final'+input.round+'-q'+String(no).padStart(2,'0');}).join(','),
      per:'3',
      points:'all',
      view:'grouped',
      printMode:'both',
      layout:'editorial'
    });
    return 'bank/index.html?'+params.toString();
  }
  function makeBankFrame(input,job){
    var frame=input.doc.createElement('iframe');
    frame.className=BANK_FRAME_CLASS;
    frame.title='검수된 우선 복습 유사문제 인쇄 준비';
    frame.setAttribute('aria-hidden','true');
    frame.tabIndex=-1;
    // The worksheet must use its desktop A4 layout even on a narrow phone.
    frame.style.cssText='position:fixed!important;left:-20000px!important;top:0!important;width:1000px!important;height:1100px!important;border:0!important;pointer-events:none!important;opacity:1!important;z-index:-1!important';
    var url=bankUrl(input);
    var absolute=new URL(url,input.doc.baseURI).href;
    if(new URL(absolute).origin!==input.doc.location.origin)fail('bank-origin','문제은행 연결 주소를 확인할 수 없습니다.');
    frame.src=absolute+(input.name?'#'+new URLSearchParams({student:input.name}).toString():'');
    job.bankFrame=frame;
    input.doc.body.appendChild(frame);
    return {frame:frame,url:url};
  }
  async function waitForBank(input,job){
    var end=Date.now()+input.timeout;
    while(Date.now()<end){
      check(job);
      var frame=job.bankFrame,doc,win;
      try{doc=frame&&frame.contentDocument;win=frame&&frame.contentWindow;}catch(error){fail('bank-origin','문제은행 접근 권한을 확인할 수 없습니다.');}
      if(frame&&frame.contentWindow&&frame.contentWindow.location){
        try{
          var current=frame.contentWindow.location;
          if(current.href!=='about:blank'&&(current.origin!==input.doc.location.origin||!/\/bank\/index\.html$/.test(current.pathname)))fail('bank-access','문제은행 열람 권한을 확인하지 못했습니다. 자료실 로그인을 확인해 주세요.');
        }catch(error){if(error instanceof PrintError)throw error;fail('bank-origin','문제은행 접근 권한을 확인할 수 없습니다.');}
      }
      if(doc&&doc.body){
        var gate=doc.querySelector('#bankAccessGate');
        var gateStatus=doc.querySelector('#bankAccessStatus');
        if(gate&&!gate.hidden&&gateStatus&&gateStatus.classList.contains('error'))fail('bank-access',compact(gateStatus.textContent)||'문제은행 열람 권한이 없습니다.');
        if(doc.body.classList.contains('bank-access-granted')){
          var access=win&&win.GFIELD_BANK_ACCESS;
          if(!access||!access.ready)fail('bank-access','문제은행 권한 확인을 완료하지 못했습니다.');
          var account=await withTimeout(access.ready,input.timeout,'bank-timeout','문제은행 권한 확인 시간이 초과되었습니다.');
          check(job);
          if(!account||account.active!==true)fail('bank-access','문제은행 열람 권한이 없습니다.');
          if(account.role==='student'&&input.name&&account.student!==input.name)fail('bank-student','성적표 학생과 문제은행 학생이 다릅니다.');
          var print=doc.querySelector('#final1Worksheet #btnPrint');
          if(print&&!print.disabled)return {doc:doc,win:win};
          var errorNode=doc.querySelector('#f1Status .f1-error');
          if(errorNode)fail('bank-unreviewed',compact(errorNode.textContent)||'추천 문항의 유사문제는 검수 중입니다.');
        }
      }
      await wait(120);
    }
    fail('bank-timeout','검수된 유사문제와 답안 준비 시간이 초과되었습니다.');
  }
  function verifyBank(input,bank){
    var doc=bank.doc,win=bank.win,expected=input.nos.length*3;
    if(!win.BANK_FIXED||typeof win.BANK_FIXED.buildPaper!=='function')fail('bank-missing','검수된 문제은행을 확인할 수 없습니다.');
    return win.BANK_FIXED.buildPaper({bankCode:'final'+input.round,genIds:input.nos.map(function(no){return 'final'+input.round+'-q'+String(no).padStart(2,'0');}),pointBand:'all',orderMode:'grouped'}).then(function(paper){
      var questions=list(doc.querySelectorAll('#final1Worksheet #f1Pages .question-page .f1-qcard'));
      var answers=list(doc.querySelectorAll('#final1Worksheet #f1Pages .answer-page .f1-solution'));
      var pages=list(doc.querySelectorAll('#final1Worksheet #f1Pages .page')).filter(function(page){return !page.classList.contains('cover-page')&&!page.classList.contains('duplex-blank');});
      if(!paper||!paper.fixed||!Array.isArray(paper.questions)||paper.questions.length!==expected||questions.length!==expected||answers.length!==expected||!pages.length)fail('bank-count','우선 복습 문항의 유사문제와 답안 수가 맞지 않습니다.');
      var ids=[],promptPrints=[],answerPrints=[];
      questions.forEach(function(card,index){
        var item=paper.questions[index],id=card.querySelector('.fixed-item')&&card.querySelector('.fixed-item').getAttribute('data-item-id');
        var no=input.nos[Math.floor(index/3)],variant=index%3+1;
        var expectedId='final'+input.round+'-q'+String(no).padStart(2,'0')+'-v'+variant;
        var prompt=compact(card.querySelector('.f1-qtext')&&card.querySelector('.f1-qtext').textContent)+' '+compact(card.querySelector('.f1-qgiven')&&card.querySelector('.f1-qgiven').textContent);
        if(!item||item.reviewStatus!=='verified'||item.id!==expectedId||id!==expectedId||Number(card.getAttribute('data-source-no'))!==no||Number(item.sourceNo)!==no||Number(item.variantNo)!==variant||compact(prompt).length<8){
          fail('bank-unreviewed',no+'번의 검수된 유사문제 3개를 확인할 수 없습니다.');
        }
        ids.push(id);
        promptPrints.push({id:id,length:compact(prompt).length,hash:hash(prompt)});
      });
      if(new Set(ids).size!==expected)fail('bank-duplicate','유사문제에 중복 문항이 있습니다.');
      answers.forEach(function(card,index){
        var id=card.getAttribute('data-answer-id'),answer=card.querySelector('.ans'),steps=card.querySelector('ol li, .f1-answer-summary');
        var value=compact(card.textContent);
        if(id!==ids[index]||!answer||!compact(answer.textContent)||!steps||!compact(steps.textContent)||value.length<8)fail('answer-missing','유사문제 답안과 풀이를 확인할 수 없습니다.');
        answerPrints.push({id:id,length:value.length,hash:hash(value)});
      });
      var problemPages=pages.filter(function(page){return page.classList.contains('question-page');});
      var solutionPages=pages.filter(function(page){return page.classList.contains('answer-page');});
      if(!problemPages.length||!solutionPages.length||pages.findIndex(function(page){return page.classList.contains('answer-page');})<problemPages.length)fail('bank-pages','문제와 풀이 쪽 순서를 확인할 수 없습니다.');
      return {questions:questions,answers:answers,problemPages:problemPages,solutionPages:solutionPages,ids:ids,promptPrints:promptPrints,answerPrints:answerPrints};
    });
  }
  async function waitForImages(root,job,timeout){
    var images=list(root.querySelectorAll('img'));
    await Promise.all(images.map(function(img){
      if(img.complete&&img.naturalWidth>0)return Promise.resolve();
      if(img.complete&&img.naturalWidth===0)fail('image-broken','유사문제 그림을 불러오지 못했습니다.');
      return new Promise(function(resolve,reject){
        var timer=global.setTimeout(function(){reject(new PrintError('image-timeout','유사문제 그림 준비 시간이 초과되었습니다.'));},timeout);
        img.addEventListener('load',function(){global.clearTimeout(timer);resolve();},{once:true});
        img.addEventListener('error',function(){global.clearTimeout(timer);reject(new PrintError('image-broken','유사문제 그림을 불러오지 못했습니다.'));},{once:true});
      });
    }));
    check(job);
  }
  async function ensureRenderer(bank,input,job){
    if(typeof bank.win.html2canvas==='function')return;
    var script=bank.doc.createElement('script');
    script.src=new URL('vendor/html2canvas/1.4.1/html2canvas.min.js',input.doc.baseURI).href;
    var loaded=new Promise(function(resolve,reject){
      script.onload=function(){resolve();};
      script.onerror=function(){reject(new PrintError('renderer-load','인쇄 화면 생성기를 불러오지 못했습니다.'));};
    });
    bank.doc.head.appendChild(script);
    await withTimeout(loaded,input.timeout,'renderer-timeout','인쇄 화면 생성기 준비 시간이 초과되었습니다.');
    check(job);
    if(typeof bank.win.html2canvas!=='function')fail('renderer-invalid','인쇄 화면 생성기를 확인할 수 없습니다.');
  }
  function forceStyle(saved,node,styles){
    if(!node)return;
    saved.push([node,node.getAttribute('style')]);
    Object.keys(styles).forEach(function(key){node.style[key]=styles[key];});
  }
  async function capturePage(page,bank,input,job){
    check(job);
    await waitForImages(page,job,input.timeout);
    var saved=[],isQuestion=page.classList.contains('question-page'),isAnswer=page.classList.contains('answer-page');
    forceStyle(saved,page.querySelector('.wm-layer.wm-active'),{opacity:'.04'});
    if(isQuestion){
      page.classList.add('f1-batch-capture-editorial');
      var qpage=page.querySelector('.f1-qpage'),cards=list(page.querySelectorAll('.f1-qcard'));
      forceStyle(saved,qpage,{gridTemplateRows:'auto repeat(2,minmax(0,1fr))',rowGap:'6mm'});
      cards.forEach(function(card,index){
        forceStyle(saved,card,{display:'flex',flexDirection:'column',border:'1px solid #d8dee8',padding:'4mm',overflow:'hidden'});
        if(card.dataset.wide==='true')forceStyle(saved,card,{gridColumn:'1 / -1'});
        if(qpage&&qpage.dataset.wideLead==='true'){
          if(index===0)forceStyle(saved,card,{gridColumn:'1 / -1',gridRow:'2'});
          if(index===1)forceStyle(saved,card,{gridColumn:'1',gridRow:'3'});
          if(index===2)forceStyle(saved,card,{gridColumn:'2',gridRow:'3'});
        }
        forceStyle(saved,card.querySelector('.f1-workspace'),{display:'block',flex:'1 1 16mm',minHeight:card.dataset.wide==='true'?'12mm':'16mm',marginTop:'7px'});
      });
    }
    if(isAnswer){
      page.classList.add('f1-batch-capture-answer');
      forceStyle(saved,page.querySelector('.f1-answer-flow'),{boxSizing:'border-box',width:'100%',maxWidth:'100%',overflow:'hidden'});
      list(page.querySelectorAll('.f1-solution')).forEach(function(card){forceStyle(saved,card,{boxSizing:'border-box',width:'100%',maxWidth:'100%',minWidth:'0',overflow:'hidden'});});
      list(page.querySelectorAll('.f1-solution-asset')).forEach(function(img){forceStyle(saved,img,{display:'block',width:img.closest('[data-answer-id^="final2-q28-"]')?'68mm':'auto',maxWidth:'100%',height:'auto',maxHeight:img.closest('[data-answer-id^="final2-q28-"]')?'50mm':'24mm',objectFit:'contain',marginLeft:'auto',marginRight:'auto'});});
    }
    var token='gf-summary-'+Date.now()+'-'+Math.random().toString(36).slice(2);
    page.setAttribute('data-gfield-summary-token',token);
    var canvas;
    try{
      await new Promise(function(resolve){bank.win.requestAnimationFrame(function(){bank.win.requestAnimationFrame(resolve);});});
      var renderInFrame=bank.win.Function('token','options','return window.html2canvas(document.querySelector(\'[data-gfield-summary-token="\'+token+\'"]\'),options);');
      canvas=await renderInFrame(token,{backgroundColor:'#ffffff',scale:1.5,useCORS:true,allowTaint:false,logging:false,imageTimeout:20000,removeContainer:true});
    }finally{
      page.removeAttribute('data-gfield-summary-token');
      saved.reverse().forEach(function(entry){if(entry[1]===null)entry[0].removeAttribute('style');else entry[0].setAttribute('style',entry[1]);});
      if(isQuestion)page.classList.remove('f1-batch-capture-editorial');
      if(isAnswer)page.classList.remove('f1-batch-capture-answer');
    }
    check(job);
    if(!canvas||canvas.width<700||canvas.height<1000)fail('capture-empty','유사문제 인쇄 화면이 비어 있습니다.');
    var blob=await new Promise(function(resolve){canvas.toBlob(resolve,'image/jpeg',0.9);});
    canvas.width=1;canvas.height=1;
    if(!blob||blob.size<1000)fail('capture-empty','유사문제 인쇄 화면을 저장하지 못했습니다.');
    return blob;
  }
  async function captureBank(input,bank,validated,job){
    await ensureRenderer(bank,input,job);
    await waitForImages(bank.doc.getElementById('f1Pages'),job,input.timeout);
    await bank.doc.fonts.ready;
    check(job);
    var pages=validated.problemPages.map(function(page){return {page:page,kind:'questions'};}).concat(validated.solutionPages.map(function(page){return {page:page,kind:'answers'};}));
    var captured=[];
    for(var i=0;i<pages.length;i++){
      var entry=pages[i],ids=list(entry.page.querySelectorAll(entry.kind==='questions'?'.f1-qcard .fixed-item[data-item-id]':'.f1-solution[data-answer-id]')).map(function(node){return node.getAttribute(entry.kind==='questions'?'data-item-id':'data-answer-id');});
      if(!ids.length)fail('page-empty','유사문제 또는 풀이 쪽이 비어 있습니다.');
      var blob=await capturePage(entry.page,bank,input,job);
      captured.push({kind:entry.kind,ids:ids,blob:blob});
    }
    return captured;
  }
  function printStyles(){
    return '@page gfield-summary-practice{size:A4 portrait;margin:0}'+
      '@media print{.gfield-summary-practice-page,.gfield-summary-practice-blank{box-sizing:border-box!important;page:gfield-summary-practice;display:block!important;width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;margin:0!important;padding:0!important;overflow:hidden!important;break-before:page!important;page-break-before:always!important;break-after:page!important;page-break-after:always!important;background:white!important}'+
      '.gfield-summary-practice-page img{display:block!important;width:210mm!important;height:297mm!important;object-fit:fill!important}'+
      '.gfield-summary-practice-blank *{display:none!important}}'+
      '.gfield-summary-practice-page,.gfield-summary-practice-blank{box-sizing:border-box;width:210mm;height:297mm;overflow:hidden;background:#fff}'+
      '.gfield-summary-practice-page img{display:block;width:100%;height:100%;object-fit:fill}';
  }
  function appendBlank(doc,host){
    var blank=doc.createElement('div');
    blank.className='gfield-summary-practice-blank';
    blank.setAttribute('aria-hidden','true');
    host.appendChild(blank);
  }
  async function appendPractice(input,prepared,captured,validated,job,url){
    var doc=prepared.frame.contentDocument;
    var host=doc.querySelector('.pagedjs_pages');
    if(!host)fail('report-pages','진단 요약 인쇄 쪽을 확인할 수 없습니다.');
    var preludeCount=list(host.querySelectorAll(':scope > .pagedjs_page')).length;
    if(preludeCount<1||preludeCount!==prepared.metrics.preludePages)fail('report-pages','진단 요약 인쇄 쪽 수가 달라졌습니다.');
    var style=doc.createElement('style');style.id='gfield-summary-practice-styles';style.textContent=printStyles();doc.head.appendChild(style);
    // The problem set and the solutions each begin on the front of a sheet.
    if(preludeCount%2)appendBlank(doc,host);
    var questionCount=captured.filter(function(page){return page.kind==='questions';}).length;
    if(questionCount<1||!captured.some(function(page){return page.kind==='answers';}))fail('bank-pages','유사문제와 풀이 쪽을 확인할 수 없습니다.');
    var images=[];
    for(var i=0;i<captured.length;i++){
      if(i===questionCount&&questionCount%2)appendBlank(doc,host);
      var entry=captured[i],page=doc.createElement('div'),image=doc.createElement('img');
      page.className=PAGE_CLASS;
      page.setAttribute('data-practice-kind',entry.kind);
      page.setAttribute('data-practice-item-ids',entry.ids.join(','));
      image.className='gfield-summary-practice-image';
      image.alt=(entry.kind==='questions'?'우선 복습 유사문제':'우선 복습 답안과 풀이')+' '+(i+1)+'쪽';
      var objectUrl=global.URL.createObjectURL(entry.blob);
      job.urls.push(objectUrl);
      image.src=objectUrl;
      page.appendChild(image);host.appendChild(page);images.push(image);
    }
    await Promise.all(images.map(function(image){return image.decode().catch(function(){fail('capture-image','인쇄용 유사문제 이미지를 확인할 수 없습니다.');});}));
    check(job);
    var problemIds=captured.filter(function(page){return page.kind==='questions';}).flatMap(function(page){return page.ids;});
    var answerIds=captured.filter(function(page){return page.kind==='answers';}).flatMap(function(page){return page.ids;});
    if(problemIds.join(',')!==validated.ids.join(',')||answerIds.join(',')!==validated.ids.join(','))fail('practice-copy','인쇄용 유사문제와 답안이 일치하지 않습니다.');
    doc.body.setAttribute('data-practice-question-count',String(problemIds.length));
    doc.body.setAttribute('data-practice-answer-count',String(answerIds.length));
    doc.body.setAttribute('data-practice-source-nos',input.nos.join(','));
    doc.body.setAttribute('data-practice-bank-url',url);
    doc.body.setAttribute('data-practice-prompt-fingerprints',JSON.stringify(validated.promptPrints));
    doc.body.setAttribute('data-practice-answer-fingerprints',JSON.stringify(validated.answerPrints));
    prepared.metrics.practiceQuestions=problemIds.length;
    prepared.metrics.practiceAnswers=answerIds.length;
    prepared.metrics.practiceQuestionPages=questionCount;
    prepared.metrics.practiceAnswerPages=captured.length-questionCount;
    prepared.metrics.practiceSourceNos=input.nos.slice();
    prepared.metrics.practiceBlankPages=(preludeCount%2)+(questionCount%2);
  }
  function createPreparation(options){
    options=options||{};
    var input=validateOptions(options,false);
    var job={cancelled:false,cleaned:false,bankFrame:null,reportJob:null,prepared:null,urls:[]};
    job.cancel=function(){cancel(job);};
    job.promise=(async function(){
      try{
        var captured=[],validated=null,url='';
        if(input.nos.length){
          if(typeof options.beforeOpen==='function')await options.beforeOpen();
          check(job);
          var loaded=makeBankFrame(input,job);url=loaded.url;
          var bank=await waitForBank(input,job);
          validated=await verifyBank(input,bank);
          check(job);
          captured=await captureBank(input,bank,validated,job);
          cleanupFrame(job.bankFrame);job.bankFrame=null;
        }
        check(job);
        if(!global.GFIELD_FINAL_REPORT_PRINT||typeof global.GFIELD_FINAL_REPORT_PRINT.createPreparation!=='function')fail('report-printer','진단 요약 인쇄 기능을 확인할 수 없습니다.');
        job.reportJob=global.GFIELD_FINAL_REPORT_PRINT.createPreparation({document:input.doc,source:input.source,mode:'summary',timeoutMs:input.timeout,requiredFontFamilies:options.requiredFontFamilies===undefined?[]:options.requiredFontFamilies});
        var prepared=await job.reportJob.promise;
        job.prepared=prepared;
        check(job);
        if(input.nos.length)await appendPractice(input,prepared,captured,validated,job,url);
        else{
          prepared.metrics.practiceQuestions=0;
          prepared.metrics.practiceAnswers=0;
          prepared.metrics.practiceSourceNos=[];
          prepared.frame.contentDocument.body.setAttribute('data-practice-question-count','0');
          prepared.frame.contentDocument.body.setAttribute('data-practice-answer-count','0');
          prepared.frame.contentDocument.body.setAttribute('data-practice-source-nos','');
        }
        var originalOpen=prepared.openPrint;
        var originalCleanup=prepared.cleanup;
        prepared.openPrint=function(){
          return originalOpen().finally(function(){revokeUrls(job);job.prepared=null;job.cleaned=true;});
        };
        prepared.cleanup=function(){originalCleanup();job.prepared=null;revokeUrls(job);job.cleaned=true;};
        return prepared;
      }catch(error){
        cleanup(job);
        if(error instanceof PrintError||error&&error.name==='PrintPreparationError')throw error;
        throw new PrintError('preparation-failed',error&&error.message||'요약과 유사문제 인쇄를 준비하지 못했습니다.');
      }
    })();
    return job;
  }

  function attach(options){
    options=options||{};
    var doc=options.document||global.document;
    var button=typeof options.button==='string'?doc.querySelector(options.button):options.button;
    if(!button||button.nodeType!==1)fail('button-missing','인쇄 단추를 찾지 못했습니다.');
    if(controllers.has(button))return controllers.get(button);
    var original={text:button.textContent,disabled:button.disabled,onclick:button.onclick,ariaBusy:button.getAttribute('aria-busy'),ariaLabel:button.getAttribute('aria-label'),state:button.getAttribute('data-print-state'),title:button.getAttribute('title')};
    var active=null,disposed=false,statusNode=null;
    var hadPrintClass=button.classList.contains('gfield-final-report-print-button');
    button.onclick=null;
    button.classList.add('gfield-final-report-print-button');
    function attr(name,value){if(value==null)button.removeAttribute(name);else button.setAttribute(name,value);}
    function restore(){button.textContent=original.text;button.disabled=original.disabled;attr('aria-busy',original.ariaBusy);attr('aria-label',original.ariaLabel);attr('data-print-state',original.state);attr('title',original.title);}
    function status(message){
      if(!statusNode){statusNode=doc.createElement('div');statusNode.className='gfield-summary-practice-print-error no-print';statusNode.setAttribute('role','alert');statusNode.style.cssText='color:#b42318;font-size:13px;line-height:1.5;margin:6px 0';button.insertAdjacentElement('afterend',statusNode);}
      statusNode.textContent=message;
      statusNode.hidden=!message;
    }
    function failed(error){
      button.disabled=false;button.textContent='인쇄 준비 실패 · 다시 시도';attr('aria-busy',null);attr('data-print-state','error');attr('title',error&&error.message||'인쇄 준비 실패');
      status(error&&error.message||'유사문제 인쇄를 준비하지 못했습니다.');
    }
    function run(){
      if(disposed)return Promise.reject(new PrintError('controller-closed','인쇄 연결이 닫혔습니다.'));
      if(active)return active.promise;
      status('');button.disabled=true;button.textContent='유사문제 인쇄 준비 중…';attr('aria-busy','true');attr('data-print-state','preparing');
      var job;
      try{job=createPreparation(options);}catch(error){failed(error);return Promise.reject(error);}
      var record={job:job,promise:null};
      record.promise=job.promise.then(function(prepared){
        if(active!==record){prepared.cleanup();fail('cancelled','인쇄 준비가 취소되었습니다.');}
        restore();
        if(options.openPrint===false){active=null;return prepared;}
        attr('data-print-state','printing');
        return prepared.openPrint().then(function(metrics){if(active===record){active=null;restore();}return metrics;});
      }).catch(function(error){
        if(active===record){
          active=null;
          if(error&&error.code==='cancelled')restore();
          else failed(error);
        }
        throw error;
      });
      active=record;return record.promise;
    }
    function click(event){event.preventDefault();run().catch(function(){});}
    button.addEventListener('click',click);
    var controller={
      prepareAndPrint:run,retry:run,
      cancel:function(){var record=active;active=null;if(record)record.job.cancel();restore();status('');},
      dispose:function(){if(disposed)return;disposed=true;controller.cancel();button.removeEventListener('click',click);button.onclick=original.onclick;if(!hadPrintClass)button.classList.remove('gfield-final-report-print-button');if(statusNode)statusNode.remove();controllers.delete(button);},
      state:function(){return active?'busy':'idle';}
    };
    controllers.set(button,controller);
    return controller;
  }

  global.GFIELD_FINAL_SUMMARY_PRACTICE_PRINT=Object.freeze({version:VERSION,attach:attach,createPreparation:createPreparation,PrintError:PrintError});
})(window);
