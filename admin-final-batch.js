/* GFIELD 관리자 파이널 진단·유사문제 일괄 PDF 저장 */
(function(global){
  'use strict';

  var VERSION='1.0.0';
  var selectedStudents=new Set();
  var selectedRounds=new Set([1,2,3,4]);
  var running=false;
  var cancelled=false;
  var activeFrame=null;

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function safeName(value){return String(value||'학생').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').slice(0,80)||'학생';}
  function api(){return global.GFIELD_ADMIN_MOCK_V2;}
  function entries(){var source=api()&&api().finalOfficialEntries();return Array.isArray(source)?source:null;}
  function uniqueStudents(rows){return Array.from(new Set((rows||[]).map(function(row){return row.student;}))).sort(function(a,b){return a.localeCompare(b,'ko');});}
  function byStudent(rows,name){return rows.filter(function(row){return row.student===name;});}
  function status(message,state){var node=document.getElementById('final-batch-status');if(!node)return;node.textContent=message||'';node.dataset.state=state||'';}
  function setBusy(value){
    running=value;
    document.querySelectorAll('[data-final-batch-action],#final-batch-rounds input,#final-batch-students input').forEach(function(node){node.disabled=value;});
    var cancel=document.getElementById('final-batch-cancel');if(cancel)cancel.hidden=!value;
  }
  function ensurePanel(){
    var body=document.getElementById('mock-body');
    if(!body||document.getElementById('final-batch-panel'))return;
    var panel=document.createElement('section');
    panel.id='final-batch-panel';
    panel.className='final-batch-panel';
    panel.setAttribute('aria-labelledby','final-batch-title');
    panel.innerHTML='<div class="final-batch-head"><div><h4 id="final-batch-title">파이널 진단·유사문제 한 번에 저장</h4><p>응시 학생과 회차를 고르면 학생별 PDF를 회차 폴더에 나누어 저장합니다. 성적 기록은 읽기만 합니다.</p></div><span class="final-batch-count" id="final-batch-count">선택 0건</span></div>'+
      '<div class="final-batch-body"><fieldset class="final-batch-fieldset"><legend>1. 회차 선택</legend><div class="final-batch-rounds" id="final-batch-rounds">'+
      [1,2,3,4].map(function(round){return '<label class="final-batch-check"><input type="checkbox" value="'+round+'" checked>파이널 '+round+'회</label>';}).join('')+
      '<label class="final-batch-check"><input type="checkbox" id="final-batch-similar" checked>오답 유사문제·풀이 포함</label></div></fieldset>'+
      '<fieldset class="final-batch-fieldset"><legend>2. 응시 학생 선택</legend><div class="final-batch-tools"><button type="button" id="final-batch-select-all">응시 학생 전체 선택</button><button type="button" id="final-batch-clear">선택 비우기</button><span id="final-batch-student-count"></span></div><div class="final-batch-students" id="final-batch-students"></div></fieldset></div>'+
      '<div class="final-batch-actions"><button type="button" class="btn final-batch-primary" id="final-batch-folder" data-final-batch-action>선택 폴더에 PDF 저장</button><button type="button" class="btn final-batch-secondary" id="final-batch-zip" data-final-batch-action>ZIP 한 개로 받기</button><button type="button" class="btn final-batch-cancel" id="final-batch-cancel" hidden>중단</button><p class="final-batch-note">폴더 저장은 Chrome·Edge에서 지원합니다. 다른 브라우저에서는 ZIP 저장을 이용하세요. 공식 1차 성적이 있는 학생·회차만 저장됩니다.</p></div><div class="final-batch-status" id="final-batch-status" role="status" aria-live="polite"></div>';
    body.parentNode.insertBefore(panel,body);

    document.getElementById('final-batch-rounds').addEventListener('change',function(event){
      if(event.target.id==='final-batch-similar')return;
      var round=Number(event.target.value);if(event.target.checked)selectedRounds.add(round);else selectedRounds.delete(round);refresh();
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
    return (entries()||[]).filter(function(row){return selectedStudents.has(row.student)&&selectedRounds.has(row.round);});
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
      var mine=byStudent(rows,name),summary=mine.map(function(row){return row.round+'회 '+row.score+'점';}).join(' · ');
      return '<label class="final-batch-student"><input type="checkbox" data-student="'+esc(name)+'" '+(selectedStudents.has(name)?'checked':'')+'><b>'+esc(name)+'</b><small>'+esc(summary)+'</small></label>';
    }).join(''):'<div class="final-batch-empty">파이널 1~4회 공식 1차 성적이 있는 학생이 없습니다.</div>';
    var studentCount=document.getElementById('final-batch-student-count');if(studentCount)studentCount.textContent=names.length+'명 응시';
    document.querySelectorAll('#final-batch-rounds input:not(#final-batch-similar)').forEach(function(input){input.checked=selectedRounds.has(Number(input.value));});
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
  function wrongBankUrl(doc,task){
    var rows=Array.from(doc.querySelectorAll('#wrongPractice .wp-item'));if(!rows.length)return '';
    var params=new URLSearchParams({practice:'wrong',gens:rows.map(function(row){return row.dataset.wpGen;}).join(','),per:'3',points:'all',source:'final|'+task.round,sourceNos:rows.map(function(row){return row.dataset.wpNo;}).join(','),seed:task.student+'-final'+task.round+'-batch'});
    if(task.round===1||task.round===2)params.set('bank','final'+task.round);
    return 'bank/index.html?'+params.toString()+'#'+new URLSearchParams({student:task.student}).toString();
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
    var canvas=await global.html2canvas(element,{backgroundColor:'#ffffff',scale:1.45,useCORS:true,allowTaint:false,logging:false,imageTimeout:20000,removeContainer:true});
    if(!isFirst)pdf.addPage('a4','portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg',0.88),'JPEG',0,0,210,297,undefined,'FAST');
    canvas.width=1;canvas.height=1;
  }
  function addBlank(pdf,isFirst){if(!isFirst)pdf.addPage('a4','portrait');}

  async function buildPackage(task,index,total){
    if(!global.jspdf||!global.jspdf.jsPDF||!global.html2canvas)throw new Error('PDF 저장 도구를 불러오지 못했습니다.');
    var reportFrame,prepared,detailPages,bankFrame;
    try{
      status((index+1)+'/'+total+' · '+task.student+' · 파이널 '+task.round+'회 진단지를 준비하고 있습니다.');
      reportFrame=await loadFrame(api().reportUrl(task),'진단지');
      var reportDoc=reportFrame.contentDocument;
      await waitFor(function(){
        var ready=reportDoc.querySelectorAll('.final1-detailed-card.is-ready').length;
        return reportDoc.querySelector('.final-report-package')&&ready>=30&&!reportDoc.querySelector('.final1-detailed-card.is-pending')&&reportFrame.contentWindow.GFIELD_FINAL_REPORT_PRINT;
      },45000,'진단지와 상세 답안을 준비하지 못했습니다.');
      var bankUrl=document.getElementById('final-batch-similar').checked?wrongBankUrl(reportDoc,task):'';
      var job=reportFrame.contentWindow.GFIELD_FINAL_REPORT_PRINT.createPreparation({document:reportDoc,source:reportDoc.querySelector('.final-report-package'),requiredFontFamilies:[],timeoutMs:45000});
      prepared=await job.promise;
      var printDoc=prepared.frame.contentDocument;
      var prelude=Array.from(printDoc.querySelectorAll('.pagedjs_pages > .pagedjs_page'));
      if(!prelude.length)throw new Error('진단지 쪽을 만들지 못했습니다.');
      detailPages=await paginateDetails(prepared);
      var PDF=global.jspdf.jsPDF,pdf=new PDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
      pdf.setProperties({title:task.student+' 파이널 '+task.round+'회 진단과 복습',subject:'지필드 파이널 진단 결과와 유사문제',creator:'GFIELD 관리자'});
      var pageNo=0;
      for(var p=0;p<prelude.length;p++){status((index+1)+'/'+total+' · '+task.student+' · 진단 '+(p+1)+'/'+prelude.length+'쪽');await addPage(pdf,prelude[p],pageNo++===0);}
      if(prepared.metrics.blankPages){addBlank(pdf,pageNo++===0);}
      for(var d=0;d<detailPages.pages.length;d++){status((index+1)+'/'+total+' · '+task.student+' · 상세 답안 '+(d+1)+'/'+detailPages.pages.length+'쪽');await addPage(pdf,detailPages.pages[d],pageNo++===0);}
      if(bankUrl){
        status((index+1)+'/'+total+' · '+task.student+' · 유사문제를 준비하고 있습니다.');
        bankFrame=await loadFrame(bankUrl,'유사문제');
        var bankDoc=bankFrame.contentDocument;
        var bankPages=await waitFor(function(){var pages=Array.from(bankDoc.querySelectorAll('#final1Worksheet #f1Pages .page, #stage .page'));return pages.length&&!(bankDoc.getElementById('btnPrint')||{}).disabled?pages:null;},45000,'유사문제와 풀이를 준비하지 못했습니다.');
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
    var folder=await directory.getDirectoryHandle('파이널 '+task.round+'회',{create:true});
    var file=await folder.getFileHandle(safeName(task.student)+'_파이널_'+task.round+'회_진단과복습.pdf',{create:true});
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
    await runTasks(tasks,function(task,blob){zip.folder('파이널 '+task.round+'회').file(safeName(task.student)+'_파이널_'+task.round+'회_진단과복습.pdf',blob);},'ZIP을 만들었습니다.',async function(){
      status('PDF를 모두 만들었습니다. ZIP 파일을 묶고 있습니다.');
      var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
      var url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='지필드_파이널_진단과복습_'+new Date().toISOString().slice(0,10)+'.zip';document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},30000);
    });
  }
  async function runTasks(tasks,save,doneMessage,finish){
    cancelled=false;setBusy(true);var completed=0,failures=[];
    try{
      for(var i=0;i<tasks.length;i++){
        if(cancelled)break;
        try{var blob=await buildPackage(tasks[i],i,tasks.length);await save(tasks[i],blob);completed++;}
        catch(error){failures.push(tasks[i].student+' · '+tasks[i].round+'회: '+(error&&error.message||'저장 실패'));}
      }
      if(finish&&completed)await finish();
      if(cancelled)status(completed+'건 저장 후 중단했습니다.'+(failures.length?'\n저장하지 못한 항목: '+failures.join(' / '):''),'error');
      else if(failures.length)status(completed+'건 저장했습니다. '+failures.length+'건은 다시 확인해 주세요.\n'+failures.join('\n'),'error');
      else status(completed+'건을 '+doneMessage,'done');
    }finally{cleanupFrame(activeFrame);setBusy(false);}
  }

  global.GFIELD_ADMIN_FINAL_BATCH=Object.freeze({version:VERSION,refresh:refresh,_test:Object.freeze({safeName:safeName,wrongBankUrl:wrongBankUrl,taskList:taskList,buildPackage:buildPackage,writeFile:writeFile})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})(window);
