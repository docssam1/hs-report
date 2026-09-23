/* GFIELD 관리자 시그니처 실전 1·2회 공식 진단지 일괄 PDF 저장 */
(function(global){
  'use strict';

  var selectedStudents=new Set();
  var selectedRounds=new Set([1,2]);
  var running=false,cancelled=false,activeFrames=new Set();
  var PAGE_TIMEOUT=45000;

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function safeName(value){return String(value||'학생').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').slice(0,80)||'학생';}
  function api(){return global.GFIELD_ADMIN_MOCK_V2;}
  function entries(){var source=api()&&api().originalOfficialEntries&&api().originalOfficialEntries();return Array.isArray(source)?source:null;}
  function uniqueStudents(rows){return Array.from(new Set((rows||[]).map(function(row){return row.student;}))).sort(function(a,b){return a.localeCompare(b,'ko');});}
  function status(message,state){var node=document.getElementById('original-batch-status');if(node){node.textContent=message||'';node.dataset.state=state||'';}}
  function setBusy(value){
    running=value;
    document.querySelectorAll('[data-original-batch-action],#original-batch-rounds input,#original-batch-students input,#original-batch-select-all,#original-batch-clear').forEach(function(node){node.disabled=value;});
    var cancel=document.getElementById('original-batch-cancel');if(cancel)cancel.hidden=!value;
  }
  function ensurePanel(){
    var body=document.getElementById('mock-body');
    if(!body||document.getElementById('original-batch-panel'))return;
    var panel=document.createElement('section');
    panel.id='original-batch-panel';panel.className='final-batch-panel original-batch-panel gfield-ui';
    panel.setAttribute('aria-labelledby','original-batch-title');
    panel.innerHTML='<div class="final-batch-head"><div><h4 id="original-batch-title">시그니처 실전 1·2회 진단지 한 번에 저장</h4><p>공식 1차 성적이 있는 학생만 골라 회차별 PDF로 저장합니다. 연습 응시·초기화 기록은 포함하지 않습니다.</p></div><span class="final-batch-count" id="original-batch-count">선택 0건</span></div>'+
      '<div class="final-batch-body"><fieldset class="final-batch-fieldset"><legend>1. 회차 선택</legend><div class="final-batch-rounds" id="original-batch-rounds"><label class="final-batch-check"><input type="checkbox" value="1" checked>시그니처 실전 1회</label><label class="final-batch-check"><input type="checkbox" value="2" checked>시그니처 실전 2회</label></div></fieldset>'+
      '<fieldset class="final-batch-fieldset"><legend>2. 응시 학생 선택</legend><div class="final-batch-tools"><button type="button" id="original-batch-select-all">응시 학생 전체 선택</button><button type="button" id="original-batch-clear">선택 비우기</button><span id="original-batch-student-count"></span></div><div class="final-batch-students" id="original-batch-students"></div></fieldset></div>'+
      '<div class="final-batch-actions"><button type="button" class="btn final-batch-primary" id="original-batch-folder" data-original-batch-action>선택한 진단지 폴더에 저장</button><button type="button" class="btn final-batch-secondary" id="original-batch-zip" data-original-batch-action>ZIP 한 개로 받기</button><button type="button" class="btn final-batch-cancel" id="original-batch-cancel" hidden>현재 파일 뒤에 중단</button><p class="final-batch-note">성적은 읽기만 합니다. 검수·공개 승인된 유사문제가 있는 오답에 한해서만 문제와 풀이를 같은 PDF 뒤에 넣습니다. 아직 승인된 문항이 없으면 진단지만 저장합니다.</p></div><div class="final-batch-status" id="original-batch-status" role="status" aria-live="polite"></div>';
    body.parentNode.insertBefore(panel,body);
    document.getElementById('original-batch-rounds').addEventListener('change',function(event){var round=Number(event.target.value);if(event.target.checked)selectedRounds.add(round);else selectedRounds.delete(round);refresh();});
    document.getElementById('original-batch-students').addEventListener('change',function(event){var name=event.target.getAttribute('data-student');if(!name)return;if(event.target.checked)selectedStudents.add(name);else selectedStudents.delete(name);updateCount();});
    document.getElementById('original-batch-select-all').onclick=function(){uniqueStudents(entries()||[]).forEach(function(name){selectedStudents.add(name);});refresh();};
    document.getElementById('original-batch-clear').onclick=function(){selectedStudents.clear();refresh();};
    document.getElementById('original-batch-folder').onclick=startFolder;
    document.getElementById('original-batch-zip').onclick=startZip;
    document.getElementById('original-batch-cancel').onclick=function(){cancelled=true;status('현재 PDF를 마친 뒤 중단합니다.','error');};
  }
  function taskList(){return (entries()||[]).filter(function(row){return selectedStudents.has(row.student)&&selectedRounds.has(row.round);});}
  function updateCount(){var node=document.getElementById('original-batch-count');if(node)node.textContent='선택 '+taskList().length+'건';}
  function refresh(){
    ensurePanel();
    var rows=entries(),list=document.getElementById('original-batch-students');if(!list)return;
    if(rows===null){list.innerHTML='<div class="final-batch-empty">위의 새로고침으로 모의고사 결과를 먼저 불러와 주세요.</div>';updateCount();return;}
    var names=uniqueStudents(rows),available=new Set(names);
    Array.from(selectedStudents).forEach(function(name){if(!available.has(name))selectedStudents.delete(name);});
    list.innerHTML=names.length?names.map(function(name){
      var summary=rows.filter(function(row){return row.student===name;}).map(function(row){return row.round+'회 '+row.score+'점';}).join(' · ');
      return '<label class="final-batch-student"><input type="checkbox" data-student="'+esc(name)+'" '+(selectedStudents.has(name)?'checked':'')+'><b>'+esc(name)+'</b><small>'+esc(summary)+'</small></label>';
    }).join(''):'<div class="final-batch-empty">시그니처 실전 1·2회 공식 1차 성적이 있는 학생이 없습니다.</div>';
    var count=document.getElementById('original-batch-student-count');if(count)count.textContent=names.length+'명 응시';
    document.querySelectorAll('#original-batch-rounds input').forEach(function(input){input.checked=selectedRounds.has(Number(input.value));});
    updateCount();
  }
  function waitFor(test,timeout,message){
    var started=Date.now();
    return new Promise(function(resolve,reject){(function poll(){
      try{var result=test();if(result)return resolve(result);}catch(error){}
      if(Date.now()-started>=timeout)return reject(new Error(message));
      setTimeout(poll,120);
    })();});
  }
  function cleanupFrame(frame){if(frame&&frame.parentNode)frame.parentNode.removeChild(frame);activeFrames.delete(frame);}
  function loadFrame(url,title){
    return new Promise(function(resolve,reject){
      var frame=document.createElement('iframe'),timer;
      frame.className='gfield-batch-render-host';frame.title=title;frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
      frame.style.height='1100px';activeFrames.add(frame);
      timer=setTimeout(function(){cleanupFrame(frame);reject(new Error(title+'을 불러오는 시간이 초과되었습니다.'));},PAGE_TIMEOUT);
      frame.onload=function(){clearTimeout(timer);resolve(frame);};
      frame.onerror=function(){clearTimeout(timer);cleanupFrame(frame);reject(new Error(title+'을 불러오지 못했습니다.'));};
      frame.src=url;document.body.appendChild(frame);
    });
  }
  function waitImages(root){return Promise.all(Array.from(root.querySelectorAll('img')).map(function(image){
    if(image.complete&&image.naturalWidth>0)return Promise.resolve();
    return new Promise(function(resolve,reject){image.addEventListener('load',resolve,{once:true});image.addEventListener('error',function(){reject(new Error('PDF 그림을 불러오지 못했습니다.'));},{once:true});});
  }));}
  function loadScript(doc,url,ready){
    if(ready())return Promise.resolve();
    return new Promise(function(resolve,reject){var script=doc.createElement('script');script.src=url;script.onload=function(){ready()?resolve():reject(new Error('PDF 렌더러를 준비하지 못했습니다.'));};script.onerror=function(){reject(new Error('PDF 렌더러를 불러오지 못했습니다.'));};doc.head.appendChild(script);});
  }
  function cssFrom(doc){
    var css=[];
    Array.from(doc.styleSheets).forEach(function(sheet){try{css.push(Array.from(sheet.cssRules).map(function(rule){return rule.cssText;}).join('\n'));}catch(error){/* Cross-origin font CSS is optional; the local report style is required below. */}});
    if(!css.join('').trim())throw new Error('진단지 인쇄 스타일을 읽지 못했습니다.');
    return css.join('\n');
  }
  function repeatTableHeads(win){
    var Handler=win.Paged&&win.Paged.Handler;if(!Handler)return;
    var Repeat=class extends Handler{
      renderNode(clone,node){
        var shown=clone&&clone.nodeType===1?clone:clone&&clone.parentElement;
        var origin=node&&node.nodeType===1?node:node&&node.parentElement;
        var table=shown&&shown.closest&&shown.closest('table[data-split-from]');
        var source=origin&&origin.closest&&origin.closest('table[data-gfield-original-print-table]');
        if(!table||!source||table.hasAttribute('data-gfield-original-print-head-ready'))return;
        table.setAttribute('data-gfield-original-print-head-ready','');
        var head=source.tHead;
        if(head&&!table.tHead)table.insertBefore(head.cloneNode(true),table.firstChild);
      }
    };
    win.Paged.registerHandlers(Repeat);
  }
  function similarRows(doc){return Array.from(doc.querySelectorAll('#wrongPractice .wp-item')).map(function(row){return {generator:row.dataset.wpGen,no:Number(row.dataset.wpNo)};}).filter(function(row){return row.generator&&Number.isInteger(row.no)&&row.no>=1&&row.no<=30;});}
  function similarUrl(task,rows){
    var params=new URLSearchParams({practice:'wrong',gens:rows.map(function(row){return row.generator;}).join(','),per:'3',points:'all',printMode:'both',source:'original|'+task.round,sourceNos:rows.map(function(row){return row.no;}).join(','),seed:task.student+'-original'+task.round+'-batch',bank:'original'+task.round});
    return 'bank/index.html?'+params.toString()+'#'+new URLSearchParams({student:task.student}).toString();
  }
  async function prepareReport(doc,task,hasSimilar){
    var source=doc.querySelector('.doc'),headline=source&&source.querySelector('.cover h1'),student=source&&source.querySelector('.who b');
    if(!source||!headline||!student||!headline.textContent.includes('시그니처 실전')||student.textContent.trim()!==task.student)throw new Error('공식 진단지의 학생·시험을 확인하지 못했습니다.');
    var printedScore=source.querySelector('.kpi b');
    if(!printedScore||Math.abs(Number.parseFloat(printedScore.textContent)-task.score)>0.0001)throw new Error('공식 진단지의 점수가 저장 기록과 일치하지 않습니다. 새로고침해 주세요.');
    var grade=source.querySelector('.kpi > div:nth-child(4) b');
    if(!grade||!grade.textContent.trim()||grade.textContent.trim()==='-')throw new Error('예상 결과가 준비되지 않아 이 진단지를 저장하지 않았습니다.');
    var frame=document.createElement('iframe');frame.className='gfield-batch-render-host';frame.title='시그니처 실전 진단지 조판';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
    frame.style.height='1100px';document.body.appendChild(frame);activeFrames.add(frame);
    var printDoc=frame.contentDocument;
    printDoc.open();printDoc.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"></head><body></body></html>');printDoc.close();
    var base=printDoc.createElement('base');base.href=doc.baseURI;printDoc.head.appendChild(base);
    var css=printDoc.createElement('style');css.textContent=cssFrom(doc);printDoc.head.appendChild(css);
    var override=printDoc.createElement('style');override.textContent='@page{size:A4 portrait;margin:12mm}html,body{margin:0!important;padding:0!important;background:#fff!important}.doc{width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important}.doc>section{break-inside:auto!important;page-break-inside:auto!important;padding:5mm 0!important}.doc>section:nth-of-type(2){break-before:page!important;page-break-before:always!important}.doc section h2{break-after:avoid-page!important;page-break-after:avoid!important}.doc section table{width:100%;table-layout:auto}.doc table thead{display:table-header-group}.doc tr,.doc .cover,.doc .cmt p,.doc .repwk{break-inside:avoid!important;page-break-inside:avoid!important}.doc .split{display:block!important}.doc .split>div:first-child{max-width:108mm;margin:0 auto 4mm}.doc .cover{padding:10mm 7mm!important}.doc .cover .kpi{flex-wrap:wrap}.doc .sign{break-inside:avoid}.doc .original-batch-pending{margin-top:5mm;border-top:1px solid #d7e1f2;padding-top:3mm;break-inside:avoid!important}.doc .original-batch-pending h2{margin:0 0 2mm}.pagedjs_page{background:#fff!important;box-shadow:none!important;margin:0!important}';printDoc.head.appendChild(override);
    var clone=printDoc.importNode(source,true);
    Array.from(clone.querySelectorAll('.no-print,script,iframe,object,embed,button')).forEach(function(node){node.remove();});
    Array.from(clone.querySelectorAll('table')).forEach(function(table){
      var body=table.tBodies[0],first=body&&body.rows[0];
      if(!first||!first.cells.length||Array.from(first.cells).some(function(cell){return cell.tagName!=='TH';}))return;
      var head=printDoc.createElement('thead');head.appendChild(first);table.insertBefore(head,body);table.setAttribute('data-gfield-original-print-table','');
    });
    if(!hasSimilar){var note=printDoc.createElement('div');note.className='original-batch-pending';note.innerHTML='<h2>유사문제 안내</h2><p>이 회차에서 해당 학생의 오답에 연결된 검수·공개 승인 유사문제가 아직 없어 진단지만 저장했습니다.</p>';clone.lastElementChild.appendChild(note);}
    printDoc.body.appendChild(clone);
    await waitImages(clone);
    frame.contentWindow.PagedConfig={auto:false};
    await loadScript(printDoc,new URL('vendor/pagedjs/0.4.3/paged.polyfill.js',doc.baseURI).href,function(){return !!frame.contentWindow.PagedPolyfill;});
    repeatTableHeads(frame.contentWindow);
    var flow=await Promise.race([frame.contentWindow.PagedPolyfill.preview(),new Promise(function(_,reject){setTimeout(function(){reject(new Error('진단지 쪽 나누기 시간이 초과되었습니다.'));},PAGE_TIMEOUT);})]);
    var pages=Array.from(printDoc.querySelectorAll('.pagedjs_pages > .pagedjs_page'));
    if(!pages.length||pages.length!==flow.total)throw new Error('진단지 A4 쪽 수를 확인하지 못했습니다.');
    var pageTexts=pages.map(function(page){return page.textContent.replace(/\s+/g,'');});
    var text=pageTexts.join('');
    Array.from(clone.querySelectorAll('h1,h2')).forEach(function(heading){if(!text.includes(heading.textContent.replace(/\s+/g,'')))throw new Error('진단지 내용이 조판 중 누락되었습니다: '+heading.textContent.trim());});
    Array.from(clone.querySelectorAll('table tbody tr')).forEach(function(row){
      var value=row.textContent.replace(/\s+/g,'');
      if(value&&!pageTexts.some(function(pageText){return pageText.includes(value);}))throw new Error('진단지 표의 한 행이 조판 중 누락되었습니다.');
    });
    if(!text.includes(task.student)||!text.includes(String(task.score)))throw new Error('학생 이름 또는 점수가 인쇄에서 누락되었습니다.');
    return {frame:frame,pages:pages};
  }
  async function addPage(pdf,page,first){
    await waitImages(page);
    var doc=page.ownerDocument,win=doc.defaultView;
    await loadScript(doc,new URL('vendor/html2canvas/1.4.1/html2canvas.min.js',doc.baseURI).href,function(){return typeof win.html2canvas==='function';});
    await new Promise(function(resolve){win.requestAnimationFrame(function(){win.requestAnimationFrame(resolve);});});
    var canvas=await win.html2canvas(page,{backgroundColor:'#fff',scale:1.45,useCORS:true,allowTaint:false,logging:false,imageTimeout:20000});
    if(!canvas.width||!canvas.height)throw new Error('빈 진단지 페이지가 만들어졌습니다.');
    if(!first)pdf.addPage('a4','portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg',0.88),'JPEG',0,0,210,297,undefined,'FAST');
    if(typeof pdf.saveGraphicsState==='function'&&typeof pdf.GState==='function'){
      pdf.saveGraphicsState();pdf.setGState(new pdf.GState({opacity:0.035}));
      pdf.setFontSize(28);pdf.setTextColor(36,86,196);pdf.text('G-FIELD',105,152,{align:'center',angle:30});
      pdf.restoreGraphicsState();
    }
    canvas.width=1;canvas.height=1;
  }
  function reviewedBankPages(doc){return Array.from(doc.querySelectorAll('#final1Worksheet #f1Pages .page')).filter(function(page){return !page.classList.contains('cover-page')&&!page.classList.contains('duplex-blank');});}
  async function buildPackage(task,index,total){
    if(!global.jspdf||!global.jspdf.jsPDF)throw new Error('PDF 저장 도구를 불러오지 못했습니다.');
    var reportFrame,prepared,bankFrame;
    try{
      status((index+1)+'/'+total+' · '+task.student+' · 시그니처 실전 '+task.round+'회 진단지를 불러오고 있습니다.');
      reportFrame=await loadFrame(api().reportUrl(task),'공식 1차 진단지');
      var reportDoc=reportFrame.contentDocument;
      await waitFor(function(){return reportDoc.querySelector('.doc .cover h1')&&reportDoc.querySelector('.doc .sign');},PAGE_TIMEOUT,'공식 진단지가 준비되지 않았습니다.');
      var ready=similarRows(reportDoc);
      prepared=await prepareReport(reportDoc,task,ready.length>0);
      var pdf=new global.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
      pdf.setProperties({title:task.student+' 시그니처 실전 '+task.round+'회 공식 진단',subject:'시그니처 실전 공식 1차 진단 결과',creator:'GFIELD 관리자'});
      var count=0;
      for(var i=0;i<prepared.pages.length;i++){status((index+1)+'/'+total+' · '+task.student+' · 진단 '+(i+1)+'/'+prepared.pages.length+'쪽');await addPage(pdf,prepared.pages[i],count++===0);}
      var bankPageCount=0;
      if(ready.length){
        status((index+1)+'/'+total+' · '+task.student+' · 승인된 유사문제를 준비하고 있습니다.');
        bankFrame=await loadFrame(similarUrl(task,ready),'승인된 유사문제');
        var bankDoc=bankFrame.contentDocument;
        var bankPages=await waitFor(function(){var pages=reviewedBankPages(bankDoc);return pages.length&&!(bankDoc.getElementById('btnPrint')||{}).disabled?pages:null;},PAGE_TIMEOUT,'승인된 유사문제와 풀이를 준비하지 못했습니다. 진단지만 저장하지 않고 이 학생 파일은 건너뜁니다.');
        var expected=ready.length*3;
        if(bankDoc.querySelectorAll('#final1Worksheet .question-page .qcard').length!==expected||bankDoc.querySelectorAll('#final1Worksheet .answer-page .f1-solution').length!==expected)throw new Error('승인된 유사문제 또는 풀이 수가 예상과 다릅니다.');
        var numbers=new Set(ready.map(function(row){return String(row.no);}));
        if(Array.from(bankDoc.querySelectorAll('#final1Worksheet .question-page .qcard')).some(function(card){return !numbers.has(card.dataset.sourceNo);})){throw new Error('다른 원문 번호의 유사문제가 섞였습니다.');}
        for(var b=0;b<bankPages.length;b++){status((index+1)+'/'+total+' · '+task.student+' · 유사문제 '+(b+1)+'/'+bankPages.length+'쪽');await addPage(pdf,bankPages[b],count++===0);bankPageCount++;}
      }
      return {blob:pdf.output('blob'),similarCount:ready.length*3,reportPages:prepared.pages.length,bankPages:bankPageCount};
    }finally{if(prepared)cleanupFrame(prepared.frame);cleanupFrame(bankFrame);cleanupFrame(reportFrame);}
  }
  function fileName(task,result){return safeName(task.student)+'_시그니처_실전_'+task.round+'회_'+(result.similarCount?'진단과유사문제':'진단')+'.pdf';}
  async function unusedFileHandle(folder,name){
    var base=name.slice(0,-4),candidate=name;
    for(var suffix=1;suffix<1000;suffix++){
      try{await folder.getFileHandle(candidate,{create:false});candidate=base+'_'+(suffix+1)+'.pdf';}
      catch(error){if(error&&error.name==='NotFoundError')return folder.getFileHandle(candidate,{create:true});throw error;}
    }
    throw new Error('같은 이름의 PDF가 너무 많습니다. 다른 폴더를 선택해 주세요.');
  }
  async function writeFile(directory,task,result){
    var folder=await directory.getDirectoryHandle('시그니처 실전 '+task.round+'회',{create:true});
    var handle=await unusedFileHandle(folder,fileName(task,result));
    var stream=await handle.createWritable();await stream.write(result.blob);await stream.close();
  }
  function validateStart(){
    if(running)return null;
    if(!selectedRounds.size){status('저장할 회차를 선택해 주세요.','error');return null;}
    if(!selectedStudents.size){status('응시 학생을 선택해 주세요.','error');return null;}
    var tasks=taskList();if(!tasks.length){status('선택한 학생과 회차에 공식 1차 성적이 없습니다.','error');return null;}
    return tasks;
  }
  async function runTasks(tasks,save,finish,builder){
    cancelled=false;setBusy(true);var done=0,failures=[],similar=0;
    try{
      for(var i=0;i<tasks.length;i++){
        if(cancelled)break;
        try{var result=await (builder||buildPackage)(tasks[i],i,tasks.length);await save(tasks[i],result);done++;similar+=result.similarCount;}
        catch(error){failures.push(tasks[i].student+' · '+tasks[i].round+'회: '+(error&&error.message||'저장 실패'));}
      }
      if(finish&&done){
        try{await finish();}
        catch(error){status('ZIP를 만들지 못해 PDF가 다운로드되지 않았습니다. 다시 시도해 주세요.\n'+(error&&error.message||'묶음 저장 실패'),'error');return;}
      }
      var summary=done+'건 저장했습니다. 승인된 유사문제 '+similar+'문항을 포함했습니다.';
      if(cancelled)status(summary+' 현재 파일 뒤에 중단했습니다.'+(failures.length?'\n'+failures.join('\n'):''),'error');
      else if(failures.length)status(summary+' 실패 '+failures.length+'건\n'+failures.join('\n'),'error');
      else status(summary,'done');
    }finally{Array.from(activeFrames).forEach(cleanupFrame);setBusy(false);}
  }
  async function startFolder(){
    var tasks=validateStart();if(!tasks)return;
    if(typeof global.showDirectoryPicker!=='function'){status('이 브라우저는 폴더 저장을 지원하지 않습니다. ZIP 저장을 이용해 주세요.','error');return;}
    var directory;
    try{directory=await global.showDirectoryPicker({id:'gfield-original-batch',mode:'readwrite'});}catch(error){if(error&&error.name!=='AbortError')status('폴더를 열지 못했습니다. ZIP 저장을 이용해 주세요.','error');return;}
    await runTasks(tasks,writeFile.bind(null,directory));
  }
  async function startZip(){
    var tasks=validateStart();if(!tasks)return;
    if(!global.JSZip){status('ZIP 저장 도구를 불러오지 못했습니다.','error');return;}
    var zip=new global.JSZip();
    await runTasks(tasks,function(task,result){zip.folder('시그니처 실전 '+task.round+'회').file(fileName(task,result),result.blob);},async function(){
      status('PDF를 모두 만들었습니다. ZIP 파일을 묶고 있습니다.');
      var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
      var url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='지필드_시그니처_실전_진단_'+new Date().toISOString().slice(0,10)+'.zip';document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},30000);
    });
  }
  global.GFIELD_ADMIN_ORIGINAL_BATCH=Object.freeze({refresh:refresh,_test:Object.freeze({safeName:safeName,taskList:taskList,similarRows:similarRows,similarUrl:similarUrl,fileName:fileName,buildPackage:buildPackage,writeFile:writeFile,runTasks:runTasks})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})(window);
