/* GFIELD 관리자 파이널 진단·유사문제 일괄 PDF 저장 */
(function(global){
  'use strict';

  var VERSION='1.2.0';
  var selectedStudents=new Set();
  var selectedRounds=new Set([1,2,3,4,'last1','last2','last3','last4']);
  var running=false;
  var cancelled=false;
  var activeFrame=null;

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function safeName(value){return String(value||'학생').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').slice(0,80)||'학생';}
  function api(){return global.GFIELD_ADMIN_MOCK_V2;}
  function entries(){var model=api();if(!model)return null;var finals=model.finalOfficialEntries(),lasts=model.lastOfficialEntries();return Array.isArray(finals)&&Array.isArray(lasts)?finals.concat(lasts):null;}
  function series(task){return task.set==='last'?'최종':'파이널';}
  function examKey(task){return task.set==='last'?'last'+task.round:Number(task.round);}
  function examLabel(task){return series(task)+' '+task.round+'회';}
  function fileName(task){return safeName(task.student)+'_'+series(task)+'_'+task.round+'회_진단과복습.pdf';}
  function detailsAvailable(task){return task.set!=='last'||[1,2].includes(Number(task.round));}
  function similarAvailable(task){return task.set!=='last'||Number(task.round)===1;}
  function roundChecks(set){return '<div class="final-batch-series-title">'+(set==='last'?'최종':'파이널')+' 1~4회</div>'+[1,2,3,4].map(function(round){var key=set==='last'?'last'+round:round;return '<label class="final-batch-check"><input type="checkbox" data-exam-set="'+set+'" value="'+key+'" checked>'+examLabel({set:set,round:round})+'<small data-exam-count="'+key+'"></small></label>';}).join('');}
  function uniqueStudents(rows){return Array.from(new Set((rows||[]).map(function(row){return row.student;}))).sort(function(a,b){return a.localeCompare(b,'ko');});}
  function byStudent(rows,name){return rows.filter(function(row){return row.student===name;});}
  function status(message,state){var node=document.getElementById('final-batch-status');if(!node)return;node.textContent=message||'';node.dataset.state=state||'';}
  function setBusy(value){
    running=value;
    document.querySelectorAll('[data-final-batch-action],#final-batch-rounds input,#final-batch-students input,#final-batch-select-all,#final-batch-clear').forEach(function(node){node.disabled=value;});
    var cancel=document.getElementById('final-batch-cancel');if(cancel)cancel.hidden=!value;
  }
  function ensurePanel(){
    var body=document.getElementById('mock-body');
    if(!body||document.getElementById('final-batch-panel'))return;
    var panel=document.createElement('section');
    panel.id='final-batch-panel';
    panel.className='final-batch-panel';
    panel.setAttribute('aria-labelledby','final-batch-title');
    panel.innerHTML='<div class="final-batch-head"><div><h4 id="final-batch-title">파이널·최종 진단·유사문제 한 번에 저장</h4><p>공식 1차 성적이 있는 응시 학생과 회차를 고르면 학생별 PDF를 회차 폴더에 나누어 저장합니다. 성적 기록은 읽기만 합니다.</p></div><span class="final-batch-count" id="final-batch-count">선택 0건</span></div>'+
      '<div class="final-batch-body"><fieldset class="final-batch-fieldset"><legend>1. 회차 선택</legend><div class="final-batch-rounds" id="final-batch-rounds">'+
      roundChecks('final')+roundChecks('last')+
      '<label class="final-batch-check"><input type="checkbox" id="final-batch-similar" checked>오답 유사문제·풀이 포함</label><label class="final-batch-check"><input type="checkbox" id="final-batch-details">원문 30문항 상세 풀이도 포함</label></div></fieldset>'+
      '<fieldset class="final-batch-fieldset"><legend>2. 응시 학생 선택</legend><div class="final-batch-tools"><button type="button" id="final-batch-select-all">응시 학생 전체 선택</button><button type="button" id="final-batch-clear">선택 비우기</button><span id="final-batch-student-count"></span></div><div class="final-batch-students" id="final-batch-students"></div></fieldset></div>'+
      '<div class="final-batch-actions"><button type="button" class="btn final-batch-primary" id="final-batch-folder" data-final-batch-action>진단+유사문제 한 번에 저장</button><button type="button" class="btn final-batch-secondary" id="final-batch-zip" data-final-batch-action>ZIP 한 개로 받기</button><button type="button" class="btn final-batch-cancel" id="final-batch-cancel" hidden>중단</button><p class="final-batch-note">진단 요약·이번 주 학습 계획·QR을 저장합니다. 선택한 부록은 검수 완료 자료만 포함합니다. 최종 2~4회 유사문제와 최종 3~4회 원문 상세 풀이는 준비 중이며, 해당 회차도 진단 요약은 저장됩니다.</p></div><div class="final-batch-status" id="final-batch-status" role="status" aria-live="polite"></div>';
    body.parentNode.insertBefore(panel,body);

    document.getElementById('final-batch-rounds').addEventListener('change',function(event){
      if(event.target.id==='final-batch-similar'||event.target.id==='final-batch-details')return;
      var round=event.target.dataset.examSet==='last'?event.target.value:Number(event.target.value);if(event.target.checked)selectedRounds.add(round);else selectedRounds.delete(round);refresh();
    });
    document.getElementById('final-batch-students').addEventListener('change',function(event){
      var name=event.target.getAttribute('data-student');if(!name)return;if(event.target.checked)selectedStudents.add(name);else selectedStudents.delete(name);updateCount();
    });
    document.getElementById('final-batch-select-all').onclick=function(){uniqueStudents(entries()||[]).forEach(function(name){selectedStudents.add(name);});refresh();};
    document.getElementById('final-batch-clear').onclick=function(){selectedStudents.clear();refresh();};
    document.getElementById('final-batch-folder').onclick=function(){startFolder();};
    document.getElementById('final-batch-zip').onclick=function(){startZip();};
    document.getElementById('final-batch-cancel').onclick=function(){cancelled=true;status('현재 PDF 한 개를 마친 뒤 중단합니다.','error');};
  }

  function taskList(){
    return (entries()||[]).filter(function(row){return selectedStudents.has(row.student)&&selectedRounds.has(examKey(row));});
  }
  function updateCount(){
    var tasks=taskList(),count=document.getElementById('final-batch-count');
    if(count)count.textContent='선택 '+tasks.length+'건';
  }
  function refresh(){
    ensurePanel();
    var rows=entries(),list=document.getElementById('final-batch-students');if(!list)return;
    if(rows===null){list.innerHTML='<div class="final-batch-empty">위의 새로고침을 눌러 모의고사 결과를 먼저 불러오세요.</div>';updateCount();return;}
    var names=uniqueStudents(rows),available=new Set(names);
    Array.from(selectedStudents).forEach(function(name){if(!available.has(name))selectedStudents.delete(name);});
    list.innerHTML=names.length?names.map(function(name){
      var mine=byStudent(rows,name),summary=mine.map(function(row){return examLabel(row)+' '+row.score+'점';}).join(' · ');
      return '<label class="final-batch-student"><input type="checkbox" data-student="'+esc(name)+'" '+(selectedStudents.has(name)?'checked':'')+'><b>'+esc(name)+'</b><small>'+esc(summary)+'</small></label>';
    }).join(''):'<div class="final-batch-empty">파이널·최종 1~4회 공식 1차 성적이 있는 학생이 없습니다.</div>';
    var studentCount=document.getElementById('final-batch-student-count');if(studentCount)studentCount.textContent=names.length+'명 응시';
    document.querySelectorAll('#final-batch-rounds input[data-exam-set]').forEach(function(input){var key=input.dataset.examSet==='last'?input.value:Number(input.value);input.checked=selectedRounds.has(key);var count=rows.filter(function(row){return examKey(row)===key;}).length;input.parentNode.querySelector('small').textContent=count+'건';});
    updateCount();
  }

  function waitFor(test,timeout,message){
    var started=Date.now();
    return new Promise(function(resolve,reject){
      (function poll(){
        if(cancelled)return reject(new Error('작업을 중단했습니다.'));
        try{var value=test();if(value)return resolve(value);}catch(error){}
        if(Date.now()-started>timeout)return reject(new Error(message));
        setTimeout(poll,120);
      })();
    });
  }
  function loadFrame(url,title){
    return new Promise(function(resolve,reject){
      var frame=document.createElement('iframe');
      frame.className='gfield-batch-render-host';frame.title=title;frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.style.height='1100px';
      activeFrame=frame;
      var timer=setTimeout(function(){cleanupFrame(frame);reject(new Error(title+'을 불러오는 시간이 초과되었습니다.'));},45000);
      frame.onload=function(){clearTimeout(timer);resolve(frame);};
      frame.onerror=function(){clearTimeout(timer);cleanupFrame(frame);reject(new Error(title+'을 불러오지 못했습니다.'));};
      frame.src=url;document.body.appendChild(frame);
    });
  }
  function cleanupFrame(frame){if(frame&&frame.parentNode)frame.parentNode.removeChild(frame);if(activeFrame===frame)activeFrame=null;}
  function waitImages(root){
    return Promise.all(Array.from(root.querySelectorAll('img')).map(function(image){
      if(image.complete&&image.naturalWidth>0)return Promise.resolve();
      return new Promise(function(resolve,reject){image.addEventListener('load',resolve,{once:true});image.addEventListener('error',function(){reject(new Error('PDF 그림을 불러오지 못했습니다.'));},{once:true});});
    }));
  }
  function ensureLocalRenderer(doc){
    var win=doc&&doc.defaultView;
    if(win&&typeof win.html2canvas==='function')return Promise.resolve(win.html2canvas);
    return new Promise(function(resolve,reject){
      var script=doc.createElement('script');
      script.src=new URL('vendor/html2canvas/1.4.1/html2canvas.min.js',global.location.href).href;
      script.onload=function(){if(win&&typeof win.html2canvas==='function')resolve(win.html2canvas);else reject(new Error('PDF 렌더러를 준비하지 못했습니다.'));};
      script.onerror=function(){reject(new Error('PDF 렌더러를 불러오지 못했습니다.'));};
      (doc.head||doc.documentElement).appendChild(script);
    });
  }
  function wrongBankUrl(doc,task){
    var rows=Array.from(doc.querySelectorAll('#wrongPractice .wp-item'));if(!rows.length)return '';
    var set=task.set==='last'?'last':'final';
    if(!similarAvailable(task))return '';
    var params=new URLSearchParams({practice:'wrong',gens:rows.map(function(row){return row.dataset.wpGen;}).join(','),per:'3',points:'all',printMode:'both',source:set+'|'+task.round,sourceNos:rows.map(function(row){return row.dataset.wpNo;}).join(','),seed:task.student+'-'+set+task.round+'-batch',reportPrint:'teacher'});
    params.set('bank',set+task.round);
    return 'bank/index.html?'+params.toString()+'#'+new URLSearchParams({student:task.student}).toString();
  }
  function reviewedBankPages(doc,requireReviewed,forBatch){
    var reviewed=Array.from(doc.querySelectorAll('#final1Worksheet #f1Pages .page'));
    var pages=reviewed.length||requireReviewed?reviewed:Array.from(doc.querySelectorAll('#stage .page'));
    return forBatch?pages.filter(function(page){return !page.classList.contains('cover-page')&&!page.classList.contains('duplex-blank');}):pages;
  }

  async function paginateDetails(prepared){
    var frame=prepared.frame,doc=frame.contentDocument,win=frame.contentWindow;
    var sourceHost=doc.getElementById('gfield-final-detail-host'),shadow=sourceHost&&sourceHost.shadowRoot;
    var sourceMain=shadow&&shadow.querySelector('main'),sourceStyle=shadow&&shadow.querySelector('style');
    if(!sourceMain||!sourceStyle)throw new Error('상세 답안 인쇄 내용을 찾지 못했습니다.');
    var renderTo=doc.createElement('div');renderTo.className='gfield-batch-detail-pages';doc.body.appendChild(renderTo);
    var content=doc.createDocumentFragment(),host=doc.createElement('div');host.id='gfield-final-detail-host';
    host.appendChild(sourceMain.cloneNode(true));content.appendChild(host);
    var pageCss='\n@page{size:A4 portrait;margin:14mm}html,body{margin:0!important;background:#fff!important}#gfield-final-detail-host{display:block!important} .pagedjs_page{background:#fff!important;margin:0!important;box-shadow:none!important}';
    var styleObject={};styleObject[doc.baseURI]=sourceStyle.textContent+pageCss;
    var previewer=new win.Paged.Previewer();
    await previewer.preview(content,[styleObject],renderTo);
    var pages=Array.from(renderTo.querySelectorAll('.pagedjs_page'));
    if(!pages.length)throw new Error('상세 답안 쪽을 만들지 못했습니다.');
    await waitImages(renderTo);
    return {root:renderTo,pages:pages};
  }

  async function addPage(pdf,element,isFirst){
    await waitImages(element);
    var worksheet=element.ownerDocument.getElementById('final1Worksheet');
    var isEditorial=element.classList.contains('question-page')&&worksheet&&worksheet.dataset.layout==='editorial';
    var isAnswer=element.classList.contains('answer-page');
    var forcedStyles=[];
    function forceStyle(node,styles){
      if(!node)return;
      forcedStyles.push([node,node.getAttribute('style')]);
      Object.keys(styles).forEach(function(name){node.style[name]=styles[name];});
    }
    forceStyle(element.querySelector('.wm-layer.wm-active'),{opacity:'.04'});
    if(isEditorial)element.classList.add('f1-batch-capture-editorial');
    if(isAnswer)element.classList.add('f1-batch-capture-answer');
    if(isEditorial){
      var qpage=element.querySelector('.f1-qpage'),cards=Array.from(element.querySelectorAll('.f1-qcard'));
      forceStyle(qpage,{gridTemplateRows:'auto repeat(2,minmax(0,1fr))',rowGap:'6mm'});
      cards.forEach(function(card,index){
        forceStyle(card,{display:'flex',flexDirection:'column',border:'1px solid #d8dee8',padding:'4mm',overflow:'hidden'});
        if(card.dataset.wide==='true')forceStyle(card,{gridColumn:'1 / -1'});
        if(qpage&&qpage.dataset.wideLead==='true'){
          if(index===0)forceStyle(card,{gridColumn:'1 / -1',gridRow:'2'});
          if(index===1)forceStyle(card,{gridColumn:'1',gridRow:'3'});
          if(index===2)forceStyle(card,{gridColumn:'2',gridRow:'3'});
        }
        var workspace=card.querySelector('.f1-workspace');
        forceStyle(workspace,{display:'block',flex:'1 1 16mm',minHeight:card.dataset.wide==='true'?'12mm':'16mm',marginTop:'7px'});
      });
    }
    if(isAnswer){
      forceStyle(element.querySelector('.f1-answer-flow'),{boxSizing:'border-box',width:'100%',maxWidth:'100%',overflow:'hidden'});
      Array.from(element.querySelectorAll('.f1-solution')).forEach(function(solution){forceStyle(solution,{boxSizing:'border-box',width:'100%',maxWidth:'100%',minWidth:'0',overflow:'hidden'});});
      Array.from(element.querySelectorAll('.f1-solution-asset')).forEach(function(asset){
        forceStyle(asset,{display:'block',width:asset.closest('[data-answer-id^="final2-q28-"]')?'68mm':'auto',maxWidth:'100%',height:'auto',maxHeight:asset.closest('[data-answer-id^="final2-q28-"]')?'50mm':'24mm',objectFit:'contain',marginLeft:'auto',marginRight:'auto'});
      });
    }
    await new Promise(function(resolve){element.ownerDocument.defaultView.requestAnimationFrame(function(){element.ownerDocument.defaultView.requestAnimationFrame(resolve);});});
    var renderer=await ensureLocalRenderer(element.ownerDocument);
    var canvas;
    var token='gfield-'+Date.now()+'-'+Math.random().toString(36).slice(2);
    element.setAttribute('data-gfield-batch-token',token);
    var renderInFrame=element.ownerDocument.defaultView.Function('token','options','return window.html2canvas(document.querySelector(\'[data-gfield-batch-token="\'+token+\'"]\'),options);');
    try{canvas=await renderInFrame(token,{backgroundColor:'#ffffff',scale:1.45,useCORS:true,allowTaint:false,logging:false,imageTimeout:20000,removeContainer:true});}
    finally{
      element.removeAttribute('data-gfield-batch-token');
      forcedStyles.reverse().forEach(function(saved){if(saved[1]===null)saved[0].removeAttribute('style');else saved[0].setAttribute('style',saved[1]);});
      if(isEditorial)element.classList.remove('f1-batch-capture-editorial');
      if(isAnswer)element.classList.remove('f1-batch-capture-answer');
    }
    if(global.__GFIELD_BATCH_QA_CAPTURE__&&element.classList.contains('question-page')&&!global.__GFIELD_BATCH_QA_CAPTURE__.question){
      global.__GFIELD_BATCH_QA_CAPTURE__.question=canvas.toDataURL('image/png');
      var captureRoot=element.ownerDocument.getElementById('final1Worksheet');
      var captureCard=element.querySelector('.f1-qcard');
      global.__GFIELD_BATCH_QA_CAPTURE__.meta={
        layout:captureRoot&&captureRoot.dataset.layout||'',
        innerWidth:element.ownerDocument.defaultView.innerWidth,
        pageWidth:element.getBoundingClientRect().width,
        pageHeight:element.getBoundingClientRect().height,
        cardColumn:captureCard&&element.ownerDocument.defaultView.getComputedStyle(captureCard).gridColumn||'',
        cardDisplay:captureCard&&element.ownerDocument.defaultView.getComputedStyle(captureCard).display||''
      };
    }
    if(!isFirst)pdf.addPage('a4','portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg',0.88),'JPEG',0,0,210,297,undefined,'FAST');
    canvas.width=1;canvas.height=1;
  }
  function addBlank(pdf,isFirst){if(!isFirst)pdf.addPage('a4','portrait');}

  async function buildPackage(task,index,total){
    if(!global.jspdf||!global.jspdf.jsPDF||!global.html2canvas)throw new Error('PDF 저장 도구를 불러오지 못했습니다.');
    var reportFrame,prepared,detailPages,bankFrame;
    try{
      status((index+1)+'/'+total+' · '+task.student+' · '+examLabel(task)+' 진단지를 준비하고 있습니다.');
      reportFrame=await loadFrame(api().reportUrl(task),'진단지');
      var reportDoc=reportFrame.contentDocument;
      var includeDetails=document.getElementById('final-batch-details').checked&&detailsAvailable(task);
      await waitFor(function(){
        var ready=reportDoc.querySelectorAll('.final1-detailed-card.is-ready').length;
        return reportDoc.querySelector('.final-report-package')&&(!includeDetails||(ready>=30&&!reportDoc.querySelector('.final1-detailed-card.is-pending')))&&reportFrame.contentWindow.GFIELD_FINAL_REPORT_PRINT;
      },45000,includeDetails?'진단지와 상세 답안을 준비하지 못했습니다.':'진단 요약을 준비하지 못했습니다.');
      var bankUrl=document.getElementById('final-batch-similar').checked?wrongBankUrl(reportDoc,task):'';
      var job=reportFrame.contentWindow.GFIELD_FINAL_REPORT_PRINT.createPreparation({document:reportDoc,source:reportDoc.querySelector('.final-report-package'),mode:includeDetails?'full':'summary',requiredFontFamilies:[],timeoutMs:45000});
      prepared=await job.promise;
      var printDoc=prepared.frame.contentDocument;
      var prelude=Array.from(printDoc.querySelectorAll('.pagedjs_pages > .pagedjs_page'));
      if(!prelude.length)throw new Error('진단지 쪽을 만들지 못했습니다.');
      if(includeDetails)detailPages=await paginateDetails(prepared);
      var PDF=global.jspdf.jsPDF,pdf=new PDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
      pdf.setProperties({title:task.student+' '+examLabel(task)+' 진단과 복습',subject:'지필드 '+series(task)+' 진단 결과와 복습',creator:'GFIELD 관리자'});
      var pageNo=0;
      for(var p=0;p<prelude.length;p++){status((index+1)+'/'+total+' · '+task.student+' · 진단 '+(p+1)+'/'+prelude.length+'쪽');await addPage(pdf,prelude[p],pageNo++===0);}
      if(includeDetails&&prepared.metrics.blankPages){addBlank(pdf,pageNo++===0);}
      if(includeDetails)for(var d=0;d<detailPages.pages.length;d++){status((index+1)+'/'+total+' · '+task.student+' · 상세 답안 '+(d+1)+'/'+detailPages.pages.length+'쪽');await addPage(pdf,detailPages.pages[d],pageNo++===0);}
      if(bankUrl){
        status((index+1)+'/'+total+' · '+task.student+' · 유사문제를 준비하고 있습니다.');
        bankFrame=await loadFrame(bankUrl,'유사문제');
        var bankDoc=bankFrame.contentDocument;
        var requireReviewed=/(?:\?|&)bank=(?:final[1234]|last1)(?:&|$)/.test(bankUrl);
        var bankPages=await waitFor(function(){var pages=reviewedBankPages(bankDoc,requireReviewed,true);return pages.length&&!(bankDoc.getElementById('btnPrint')||{}).disabled?pages:null;},45000,'유사문제와 풀이를 준비하지 못했습니다.');
        await waitImages(bankDoc.getElementById('f1Pages')||bankDoc.getElementById('stage'));
        for(var b=0;b<bankPages.length;b++){status((index+1)+'/'+total+' · '+task.student+' · 유사문제 '+(b+1)+'/'+bankPages.length+'쪽');await addPage(pdf,bankPages[b],pageNo++===0);}
      }
      return pdf.output('blob');
    }finally{
      if(detailPages&&detailPages.root&&detailPages.root.parentNode)detailPages.root.parentNode.removeChild(detailPages.root);
      if(prepared)prepared.cleanup();
      cleanupFrame(bankFrame);cleanupFrame(reportFrame);
    }
  }

  async function writeFile(directory,task,blob){
    var folder=await directory.getDirectoryHandle(examLabel(task),{create:true});
    var file=await folder.getFileHandle(fileName(task),{create:true});
    var writable=await file.createWritable();await writable.write(blob);await writable.close();
  }
  function validateStart(){
    if(running)return null;
    var tasks=taskList();
    if(!selectedRounds.size){status('저장할 회차를 하나 이상 선택해 주세요.','error');return null;}
    if(!selectedStudents.size){status('응시 학생을 선택해 주세요.','error');return null;}
    if(!tasks.length){status('선택한 학생과 회차에 공식 1차 성적이 없습니다.','error');return null;}
    return tasks;
  }
  async function startFolder(){
    var tasks=validateStart();if(!tasks)return;
    if(typeof global.showDirectoryPicker!=='function'){status('이 브라우저는 폴더 저장을 지원하지 않습니다. 「ZIP 한 개로 받기」를 이용해 주세요.','error');return;}
    var directory;
    try{directory=await global.showDirectoryPicker({id:'gfield-final-batch',mode:'readwrite'});}catch(error){if(error&&error.name!=='AbortError')status('저장 폴더를 열지 못했습니다. ZIP 저장을 이용해 주세요.','error');return;}
    await runTasks(tasks,async function(task,blob){await writeFile(directory,task,blob);},'선택한 폴더에 저장했습니다.');
  }
  async function startZip(){
    var tasks=validateStart();if(!tasks)return;
    if(!global.JSZip){status('ZIP 저장 도구를 불러오지 못했습니다.','error');return;}
    var zip=new global.JSZip();
    await runTasks(tasks,function(task,blob){zip.folder(examLabel(task)).file(fileName(task),blob);},'ZIP을 만들었습니다.',async function(){
      status('PDF를 모두 만들었습니다. ZIP 파일을 묶고 있습니다.');
      var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
      var url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='지필드_파이널_최종_진단과복습_'+new Date().toISOString().slice(0,10)+'.zip';document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},30000);
    });
  }
  async function runTasks(tasks,save,doneMessage,finish){
    cancelled=false;setBusy(true);var completed=0,failures=[];
    var pending=tasks.filter(function(task){return (document.getElementById('final-batch-similar').checked&&!similarAvailable(task))||(document.getElementById('final-batch-details').checked&&!detailsAvailable(task));}).map(examLabel);
    var pendingNote=pending.length?'\n준비 중인 부록은 제외했습니다: '+Array.from(new Set(pending)).join(', ')+' (진단 요약은 포함)':'';
    try{
      for(var i=0;i<tasks.length;i++){
        if(cancelled)break;
        try{var blob=await buildPackage(tasks[i],i,tasks.length);await save(tasks[i],blob);completed++;}
        catch(error){failures.push(tasks[i].student+' · '+examLabel(tasks[i])+': '+(error&&error.message||'저장 실패'));}
      }
      if(finish&&completed)await finish();
      if(cancelled)status(completed+'건 저장 후 중단했습니다.'+(failures.length?'\n저장하지 못한 항목: '+failures.join(' / '):''),'error');
      else if(failures.length)status(completed+'건 저장했습니다. '+failures.length+'건은 다시 확인해 주세요.\n'+failures.join('\n'),'error');
      else status(completed+'건을 '+doneMessage+pendingNote,'done');
    }finally{cleanupFrame(activeFrame);setBusy(false);}
  }

  global.GFIELD_ADMIN_FINAL_BATCH=Object.freeze({version:VERSION,refresh:refresh,_test:Object.freeze({safeName:safeName,wrongBankUrl:wrongBankUrl,reviewedBankPages:reviewedBankPages,loadFrame:loadFrame,cleanupFrame:cleanupFrame,taskList:taskList,buildPackage:buildPackage,writeFile:writeFile})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})(window);
