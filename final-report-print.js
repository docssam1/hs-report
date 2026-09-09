'use strict';

(function(global){
  var VERSION='1.0.0';
  var LIBRARY_URL='vendor/pagedjs/0.4.3/paged.polyfill.js';
  var FRAME_CLASS='gfield-final-report-print-frame';
  var BUTTON_CLASS='gfield-final-report-print-button';
  var DEFAULT_TIMEOUT=30000;
  var controllers=new WeakMap();

  function PrintPreparationError(code,message){
    this.name='PrintPreparationError';
    this.code=code;
    this.message=message;
    if(Error.captureStackTrace) Error.captureStackTrace(this,PrintPreparationError);
  }
  PrintPreparationError.prototype=Object.create(Error.prototype);
  PrintPreparationError.prototype.constructor=PrintPreparationError;

  function fail(code,message){throw new PrintPreparationError(code,message);}
  function list(value){return Array.prototype.slice.call(value||[]);}
  function compact(value){return String(value||'').replace(/\s+/g,'').trim();}
  function familyKey(value){return String(value||'').replace(/["']/g,'').trim().toLowerCase();}
  function absoluteUrl(value,base){return new URL(value,base).href;}
  function nextFrame(win){return new Promise(function(resolve){win.requestAnimationFrame(function(){win.requestAnimationFrame(resolve);});});}

  function timed(promise,timeout,code,message,job){
    return new Promise(function(resolve,reject){
      var done=false;
      var cancel;
      function detachCancel(){
        if(!job||!cancel)return;
        var index=job.cancelWaiters.indexOf(cancel);
        if(index>=0)job.cancelWaiters.splice(index,1);
      }
      if(job){
        cancel=function(){
          if(done)return;
          done=true;
          global.clearTimeout(timer);
          detachCancel();
          reject(new PrintPreparationError('cancelled','인쇄 준비가 취소되었습니다.'));
        };
        if(job.cancelled)return cancel();
        job.cancelWaiters.push(cancel);
      }
      var timer=global.setTimeout(function(){
        if(done)return;
        done=true;
        detachCancel();
        reject(new PrintPreparationError(code,message));
      },timeout);
      Promise.resolve(promise).then(function(value){
        if(done)return;
        done=true;
        global.clearTimeout(timer);
        detachCancel();
        if(job&&job.cancelled) return reject(new PrintPreparationError('cancelled','인쇄 준비가 취소되었습니다.'));
        resolve(value);
      },function(error){
        if(done)return;
        done=true;
        global.clearTimeout(timer);
        detachCancel();
        reject(error);
      });
    });
  }

  function checkJob(job){
    if(job.cancelled) fail('cancelled','인쇄 준비가 취소되었습니다.');
  }

  function resolveSource(doc,source){
    var node=typeof source==='string'?doc.querySelector(source):source;
    if(!node||node.nodeType!==1) fail('source-missing','인쇄할 진단 패키지를 찾지 못했습니다.');
    if(!node.classList.contains('final-report-package')) fail('source-invalid','검증된 진단 패키지만 인쇄할 수 있습니다.');
    return node;
  }

  function copyFormState(source,clone){
    var originals=list(source.querySelectorAll('input,textarea,select'));
    var copies=list(clone.querySelectorAll('input,textarea,select'));
    originals.forEach(function(control,index){
      var copy=copies[index];
      if(!copy)return;
      if(control.tagName==='INPUT'){
        copy.value=control.value;
        copy.setAttribute('value',control.value);
        copy.checked=control.checked;
        if(control.checked)copy.setAttribute('checked','');else copy.removeAttribute('checked');
      }else if(control.tagName==='TEXTAREA'){
        copy.value=control.value;
        copy.textContent=control.value;
      }else{
        copy.value=control.value;
        list(copy.options).forEach(function(option){option.selected=option.value===control.value;});
      }
      copy.disabled=true;
    });
  }

  function makeStaticClone(source){
    var clone=source.cloneNode(true);
    copyFormState(source,clone);
    list(clone.querySelectorAll('script,iframe,object,embed')).forEach(function(node){node.remove();});
    list(clone.querySelectorAll('.no-print')).forEach(function(node){node.remove();});
    list(clone.querySelectorAll('[autofocus]')).forEach(function(node){node.removeAttribute('autofocus');});
    return clone;
  }

  function buildCopies(source){
    var detailSection=source.querySelector('.report-detailed-section');
    var detailed=detailSection&&detailSection.querySelector('#final2DetailedSolutions[data-detailed-round="2"]');
    if(!detailSection||!detailed) fail('unsupported-round','현재 안전 조판은 파이널 2회 진단 패키지만 지원합니다.');

    var prelude=makeStaticClone(source);
    list(prelude.querySelectorAll('.report-detailed-section')).forEach(function(node){node.remove();});
    if(prelude.querySelector('.report-detailed-section')) fail('prelude-leak','상세 답안이 진단 앞부분에 남았습니다.');

    var details=makeStaticClone(detailSection);
    list(details.querySelectorAll('.is-pending')).forEach(function(node){node.remove();});
    var ready=list(details.querySelectorAll('.final1-detailed-card.is-ready'));
    var sourceReady=list(detailSection.querySelectorAll('.final1-detailed-card.is-ready'));
    if(!ready.length||ready.length!==sourceReady.length) fail('detail-invalid','검수된 상세 답안 범위를 확인하지 못했습니다.');
    if(details.querySelector('.is-pending')) fail('detail-pending','미검수 상세 답안은 인쇄할 수 없습니다.');
    var nos=ready.map(function(card){return Number(card.getAttribute('data-detailed-solution-no'));});
    if(nos.some(function(no){return !Number.isInteger(no)||no<1;})||new Set(nos).size!==nos.length) fail('detail-invalid','상세 답안 번호가 올바르지 않습니다.');
    return {prelude:prelude,details:details,detailNos:nos,detailText:compact(details.textContent)};
  }

  function collectStyles(doc){
    var css=[];
    var links=[];
    list(doc.styleSheets).forEach(function(sheet){
      try{
        var rules=list(sheet.cssRules);
        css.push(rules.map(function(rule){return rule.cssText;}).join('\n'));
      }catch(error){
        if(!sheet.href) fail('style-unavailable','인쇄 스타일을 읽지 못했습니다.');
        var href=absoluteUrl(sheet.href,doc.baseURI);
        if(new URL(href).origin===new URL(doc.baseURI).origin) fail('style-unavailable','필수 인쇄 스타일을 읽지 못했습니다.');
        links.push({href:href,media:sheet.media&&sheet.media.mediaText||'all'});
      }
    });
    if(!css.join('').trim()) fail('style-missing','인쇄 스타일이 준비되지 않았습니다.');
    return {css:css.join('\n'),links:links};
  }

  function waitForLinks(doc,links,timeout,job){
    return timed(Promise.all(links.map(function(item){
      return new Promise(function(resolve,reject){
        var link=doc.createElement('link');
        link.rel='stylesheet';
        link.href=item.href;
        if(item.media)link.media=item.media;
        link.onload=function(){resolve();};
        link.onerror=function(){reject(new PrintPreparationError('style-load','인쇄 스타일을 불러오지 못했습니다.'));};
        doc.head.appendChild(link);
      });
    })),timeout,'style-timeout','인쇄 스타일 준비 시간이 초과되었습니다.',job);
  }

  function printRules(doc){
    var output=[];
    list(doc.styleSheets).forEach(function(sheet){
      var rules;
      try{rules=list(sheet.cssRules);}catch(error){return;}
      rules.forEach(function(rule){
        var media=rule.media&&rule.media.mediaText||'';
        if(rule.cssRules&&/\bprint\b/i.test(media)&&!/\bnot\s+print\b/i.test(media)){
          output.push(list(rule.cssRules).map(function(inner){return inner.cssText;}).join('\n'));
        }
      });
    });
    return output.join('\n');
  }

  function waitForImages(root,timeout,job){
    var images=list(root.querySelectorAll('img'));
    return timed(Promise.all(images.map(function(image){
      if(image.complete){
        if(image.naturalWidth>0)return Promise.resolve();
        return Promise.reject(new PrintPreparationError('image-load','인쇄 그림을 불러오지 못했습니다.'));
      }
      return new Promise(function(resolve,reject){
        function clear(){image.removeEventListener('load',loaded);image.removeEventListener('error',broken);}
        function loaded(){clear();resolve();}
        function broken(){clear();reject(new PrintPreparationError('image-load','인쇄 그림을 불러오지 못했습니다.'));}
        image.addEventListener('load',loaded,{once:true});
        image.addEventListener('error',broken,{once:true});
      });
    })),timeout,'image-timeout','인쇄 그림 준비 시간이 초과되었습니다.',job);
  }

  function waitForFonts(doc,families,timeout,job){
    families=Array.isArray(families)?families:[];
    if(!doc.fonts){
      if(families.length) return Promise.reject(new PrintPreparationError('font-api','글꼴 준비 상태를 확인할 수 없습니다.'));
      return Promise.resolve();
    }
    return timed(doc.fonts.ready.then(function(){
      var faces=list(doc.fonts);
      if(faces.some(function(face){return face.status==='error';})) fail('font-load','인쇄 글꼴을 불러오지 못했습니다.');
      families.forEach(function(family){
        var key=familyKey(family);
        var matches=faces.filter(function(face){return familyKey(face.family)===key;});
        if(!matches.length||!matches.some(function(face){return face.status==='loaded';})) fail('font-missing','필수 인쇄 글꼴을 확인하지 못했습니다: '+family);
      });
    }),timeout,'font-timeout','인쇄 글꼴 준비 시간이 초과되었습니다.',job);
  }

  function addStyle(doc,text,id){
    var style=doc.createElement('style');
    if(id)style.id=id;
    style.textContent=text;
    doc.head.appendChild(style);
    return style;
  }

  function prepareFrame(doc,styles,copies,job){
    var frame=doc.createElement('iframe');
    frame.className=FRAME_CLASS;
    frame.title='진단 패키지 인쇄 준비';
    frame.setAttribute('aria-hidden','true');
    frame.setAttribute('tabindex','-1');
    doc.body.appendChild(frame);
    job.frame=frame;
    var frameDoc=frame.contentDocument;
    frameDoc.open();
    frameDoc.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>진단 패키지 인쇄</title></head><body></body></html>');
    frameDoc.close();
    var base=frameDoc.createElement('base');
    base.href=doc.baseURI;
    frameDoc.head.prepend(base);
    addStyle(frameDoc,styles.css,'gfield-source-styles');
    var stage=frameDoc.importNode(copies.prelude,true);
    stage.id='gfield-report-print-prelude';
    frameDoc.body.appendChild(stage);
    frame.contentWindow.PagedConfig={auto:false};
    return {frame:frame,win:frame.contentWindow,doc:frameDoc,stage:stage};
  }

  function firstHeaderRow(table){
    var direct=list(table.children);
    var head=direct.find(function(node){return node.tagName==='THEAD';});
    if(head)return head.querySelector('tr');
    var body=direct.find(function(node){return node.tagName==='TBODY';});
    var row=body&&body.querySelector(':scope > tr:first-child');
    if(row&&list(row.children).length&&list(row.children).every(function(cell){return cell.tagName==='TH';})){
      head=table.ownerDocument.createElement('thead');
      head.appendChild(row);
      var caption=direct.find(function(node){return node.tagName==='CAPTION';});
      table.insertBefore(head,caption?caption.nextSibling:table.firstChild);
      return row;
    }
    return null;
  }

  function lockTableWidths(stage){
    var locked=0;
    list(stage.querySelectorAll('table')).forEach(function(table){
      var rect=table.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)return;
      var row=firstHeaderRow(table);
      if(!row) fail('table-header','인쇄 표의 머리행을 확인하지 못했습니다.');
      var cells=list(row.children);
      if(!cells.length||cells.some(function(cell){return cell.colSpan!==1;})) fail('table-columns','인쇄 표의 열 구조를 확인하지 못했습니다.');
      var widths=cells.map(function(cell){return cell.getBoundingClientRect().width;});
      var total=widths.reduce(function(sum,width){return sum+width;},0);
      if(!total||widths.some(function(width){return width<=0;})) fail('table-columns','인쇄 표의 열 너비를 확인하지 못했습니다.');
      list(table.children).filter(function(node){return node.tagName==='COLGROUP'&&node.hasAttribute('data-gfield-print-widths');}).forEach(function(node){node.remove();});
      var group=table.ownerDocument.createElement('colgroup');
      group.setAttribute('data-gfield-print-widths','');
      widths.forEach(function(width){
        var col=table.ownerDocument.createElement('col');
        col.style.width=(100*width/total).toFixed(6)+'%';
        group.appendChild(col);
      });
      var head=list(table.children).find(function(node){return node.tagName==='THEAD';});
      table.insertBefore(group,head||table.firstChild);
      table.setAttribute('data-gfield-print-table','');
      locked++;
    });
    return locked;
  }

  function visibleText(root){
    var values=[];
    var walker=root.ownerDocument.createTreeWalker(root,root.ownerDocument.defaultView.NodeFilter.SHOW_TEXT);
    for(var node=walker.nextNode();node;node=walker.nextNode()){
      var value=String(node.textContent||'').trim();
      var element=node.parentElement;
      if(!value||!element||element.closest('[aria-hidden="true"]'))continue;
      var style=element.ownerDocument.defaultView.getComputedStyle(element);
      if(style.display==='none'||style.visibility==='hidden')continue;
      var range=root.ownerDocument.createRange();
      range.selectNodeContents(node);
      if(list(range.getClientRects()).some(function(rect){return rect.width>0&&rect.height>0;}))values.push(value);
    }
    return values;
  }

  function loadPaged(frameState,url,timeout,job){
    return timed(new Promise(function(resolve,reject){
      var script=frameState.doc.createElement('script');
      script.src=url;
      script.onload=function(){
        if(!frameState.win.PagedPolyfill||!frameState.win.Paged||!frameState.win.Paged.Handler) return reject(new PrintPreparationError('library-invalid','인쇄 조판기를 확인하지 못했습니다.'));
        resolve();
      };
      script.onerror=function(){reject(new PrintPreparationError('library-load','인쇄 조판기를 불러오지 못했습니다.'));};
      frameState.doc.head.appendChild(script);
    }),timeout,'library-timeout','인쇄 조판기 준비 시간이 초과되었습니다.',job);
  }

  function registerTableHandler(frameState){
    var Handler=frameState.win.Paged.Handler;
    var RepeatTableStructure=class extends Handler {
      renderNode(clone,node){
        var cell=clone&&clone.nodeType===1?clone:clone&&clone.parentElement;
        var origin=node&&node.nodeType===1?node:node&&node.parentElement;
        var table=cell&&cell.closest&&cell.closest('table[data-split-from]');
        var sourceTable=origin&&origin.closest&&origin.closest('table[data-gfield-print-table]');
        if(!table||!sourceTable||table.hasAttribute('data-gfield-print-header-ready'))return;
        table.setAttribute('data-gfield-print-header-ready','');
        ['thead','colgroup'].forEach(function(tag){
          var part=list(sourceTable.children).find(function(child){return child.tagName.toLowerCase()===tag;});
          var existing=list(table.children).some(function(child){return child.tagName.toLowerCase()===tag;});
          if(part&&!existing)table.insertBefore(part.cloneNode(true),table.firstChild);
        });
      }
    };
    frameState.win.Paged.registerHandlers(RepeatTableStructure);
  }

  function pageStyles(){
    return '@page gfield-report-prelude{size:A4 portrait;margin:0}'+
      '@page final2-solutions{size:A4 portrait;margin:14mm}'+
      '@media print{html,body,.pagedjs_pages{height:auto!important;min-height:0!important;max-height:none!important}'+
      '.pagedjs_pages{display:block!important}'+
      '.pagedjs_page,.gfield-report-print-blank{page:gfield-report-prelude;width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;margin:0!important;break-after:page;page-break-after:always}'+
      '.pagedjs_pages .pagedjs_page{overflow:hidden!important}'+
      '.gfield-report-print-blank{display:block!important}'+
      '#gfield-final2-detail-host{display:block!important;page:final2-solutions}}';
  }

  function measurementStyles(){
    return 'html,body{margin:0!important;padding:0!important;width:210mm!important;min-width:210mm!important;background:#fff!important}'+
      '#gfield-report-print-prelude{box-sizing:border-box;width:190mm!important;max-width:none!important;margin:0!important;padding:0!important;box-shadow:none!important}'+
      '#gfield-report-print-prelude>section:not(.report-print-cover){padding:6mm 0!important}'+
      '#gfield-report-print-prelude .report-print-cover{min-height:260mm!important;padding:12mm 8mm!important}'+
      '#gfield-report-print-prelude>.report-docssam-note{break-before:page!important;page-break-before:always!important;break-inside:avoid!important;page-break-inside:avoid!important}'+
      '#gfield-report-print-prelude>.report-docssam-note>h2{break-after:avoid!important;page-break-after:avoid!important}'+
      '#gfield-report-print-prelude>.report-docssam-note>.docssam-saved-comment{orphans:2;widows:2}'+
      '#gfield-report-print-prelude .diagnostic-coaching>h3:last-of-type{break-before:page!important;page-break-before:always!important;break-after:avoid!important;page-break-after:avoid!important}'+
      '#gfield-report-print-prelude .able-box{break-inside:avoid!important;page-break-inside:avoid!important}'+
      '@page{size:A4 portrait;margin:10mm}';
  }

  function appendDetails(frameState,styles,copies,preludePages){
    var pages=frameState.doc.querySelector('.pagedjs_pages');
    if(!pages) fail('pagination-missing','인쇄 쪽을 만들지 못했습니다.');
    if(preludePages%2===1){
      var blank=frameState.doc.createElement('div');
      blank.className='gfield-report-print-blank';
      blank.setAttribute('aria-hidden','true');
      pages.appendChild(blank);
    }
    var host=frameState.doc.createElement('div');
    host.id='gfield-final2-detail-host';
    var shadow=host.attachShadow({mode:'open'});
    var style=frameState.doc.createElement('style');
    style.textContent=styles.css+'\n:host{display:block}';
    shadow.appendChild(style);
    var main=frameState.doc.createElement('main');
    main.className='doc final-report-package';
    main.appendChild(frameState.doc.importNode(copies.details,true));
    shadow.appendChild(main);
    frameState.doc.body.appendChild(host);
    if(compact(main.textContent)!==copies.detailText) fail('detail-copy','상세 답안 복제 내용을 확인하지 못했습니다.');
    if(shadow.querySelector('.is-pending')) fail('detail-pending','미검수 상세 답안이 인쇄 복제본에 포함되었습니다.');
    if(shadow.querySelectorAll('.final1-detailed-card.is-ready').length!==copies.detailNos.length) fail('detail-copy','상세 답안 문항 수가 달라졌습니다.');
    addStyle(frameState.doc,pageStyles(),'gfield-print-page-styles');
    return {host:host,shadow:shadow,blankPages:preludePages%2};
  }

  function printedPreludeText(frameState){
    var pages=frameState.doc.querySelector('.pagedjs_pages');
    var pieces=[];
    list(pages&&pages.querySelectorAll(':scope > .pagedjs_page .pagedjs_page_content')).forEach(function(content){
      var walker=frameState.doc.createTreeWalker(content,frameState.win.NodeFilter.SHOW_TEXT);
      for(var node=walker.nextNode();node;node=walker.nextNode()){
        var element=node.parentElement;
        if(!element||element.closest('[aria-hidden="true"]'))continue;
        var style=frameState.win.getComputedStyle(element);
        if(style.display==='none'||style.visibility==='hidden')continue;
        pieces.push(node.textContent||'');
      }
    });
    return compact(pieces.join(''));
  }

  function verifyPrelude(frameState,visible,flow){
    var pages=frameState.doc.querySelector('.pagedjs_pages');
    var actual=pages&&pages.querySelectorAll(':scope > .pagedjs_page').length||0;
    if(!Number.isInteger(flow.total)||flow.total<1||actual!==flow.total) fail('pagination-count','인쇄 쪽 수를 확인하지 못했습니다.');
    var printed=printedPreludeText(frameState);
    visible.forEach(function(value){
      var needle=compact(value);
      if(needle&&printed.indexOf(needle)<0) fail('prelude-content','진단 내용이 조판 중 누락되었습니다.');
    });
    return actual;
  }

  function createPreparation(options){
    options=options||{};
    var doc=options.document||global.document;
    var timeout=Number(options.timeoutMs)||DEFAULT_TIMEOUT;
    var job={cancelled:false,frame:null,cleaned:false,cancelWaiters:[],finishPrint:null};
    function cleanup(){
      if(job.cleaned)return;
      job.cleaned=true;
      if(job.frame&&job.frame.parentNode)job.frame.parentNode.removeChild(job.frame);
      job.frame=null;
    }
    job.cancel=function(){
      if(job.cancelled)return;
      job.cancelled=true;
      job.cancelWaiters.splice(0).forEach(function(cancel){cancel();});
      if(job.finishPrint)job.finishPrint();else cleanup();
    };
    job.promise=(async function(){
      try{
        var source=resolveSource(doc,options.source||'.final-report-package');
        var copies=buildCopies(source);
        var styles=collectStyles(doc);
        var requiredFonts=options.requiredFontFamilies===undefined?['Noto Sans KR','Jua']:options.requiredFontFamilies;
        await waitForImages(source,timeout,job);
        await waitForFonts(doc,requiredFonts,timeout,job);
        checkJob(job);
        var frameState=prepareFrame(doc,styles,copies,job);
        await waitForLinks(frameState.doc,styles.links,timeout,job);
        addStyle(frameState.doc,printRules(frameState.doc)+'\n'+measurementStyles(),'gfield-active-print-styles');
        await nextFrame(frameState.win);
        await waitForImages(frameState.stage,timeout,job);
        await waitForFonts(frameState.doc,requiredFonts,timeout,job);
        checkJob(job);
        var tableCount=lockTableWidths(frameState.stage);
        var visible=visibleText(frameState.stage);
        if(!visible.length) fail('prelude-empty','인쇄할 진단 내용이 없습니다.');
        await loadPaged(frameState,absoluteUrl(options.libraryUrl||LIBRARY_URL,doc.baseURI),timeout,job);
        registerTableHandler(frameState);
        checkJob(job);
        var flow=await timed(frameState.win.PagedPolyfill.preview(),timeout,'pagination-timeout','인쇄 쪽 나누기 시간이 초과되었습니다.',job);
        var preludePages=verifyPrelude(frameState,visible,flow);
        var details=appendDetails(frameState,styles,copies,preludePages);
        await nextFrame(frameState.win);
        await waitForImages(details.shadow,timeout,job);
        await waitForFonts(frameState.doc,requiredFonts,timeout,job);
        checkJob(job);
        var metrics={
          round:2,
          preludePages:preludePages,
          blankPages:details.blankPages,
          detailStartPage:preludePages+details.blankPages+1,
          detailItems:copies.detailNos.slice(),
          tableCount:tableCount,
          visiblePreludeTextNodes:visible.length
        };
        if(metrics.detailStartPage%2!==1) fail('duplex-parity','상세 답안이 새 종이 앞면에서 시작하지 않습니다.');
        var prepared={
          frame:frameState.frame,
          metrics:metrics,
          cleanup:function(){if(job.finishPrint)job.finishPrint();else cleanup();},
          openPrint:function(){
            if(job.cleaned)return Promise.reject(new PrintPreparationError('print-closed','인쇄 준비 화면이 닫혔습니다.'));
            return new Promise(function(resolve,reject){
              var finished=false;
              function finish(){
                if(finished)return;
                finished=true;
                frameState.win.removeEventListener('afterprint',finish);
                job.finishPrint=null;
                cleanup();
                resolve(metrics);
              }
              job.finishPrint=finish;
              frameState.win.addEventListener('afterprint',finish,{once:true});
              try{
                frameState.win.focus();
                frameState.win.print();
              }catch(error){
                frameState.win.removeEventListener('afterprint',finish);
                job.finishPrint=null;
                cleanup();
                reject(new PrintPreparationError('print-open','인쇄 창을 열지 못했습니다.'));
              }
            });
          }
        };
        return prepared;
      }catch(error){
        cleanup();
        if(error instanceof PrintPreparationError)throw error;
        throw new PrintPreparationError('preparation-failed','인쇄 준비 중 오류가 발생했습니다.');
      }
    })();
    return job;
  }

  function snapshotButton(button){
    function attr(name){return {present:button.hasAttribute(name),value:button.getAttribute(name)};}
    return {text:button.textContent,disabled:button.disabled,ariaBusy:attr('aria-busy'),ariaLabel:attr('aria-label'),state:attr('data-print-state'),title:attr('title')};
  }

  function setAttr(button,name,snapshot){
    if(snapshot.present)button.setAttribute(name,snapshot.value);else button.removeAttribute(name);
  }

  function restoreButton(button,snapshot){
    button.textContent=snapshot.text;
    button.disabled=snapshot.disabled;
    setAttr(button,'aria-busy',snapshot.ariaBusy);
    setAttr(button,'aria-label',snapshot.ariaLabel);
    setAttr(button,'data-print-state',snapshot.state);
    setAttr(button,'title',snapshot.title);
  }

  function attach(options){
    options=options||{};
    var doc=options.document||global.document;
    var button=typeof options.button==='string'?doc.querySelector(options.button):options.button;
    if(!button||button.nodeType!==1) fail('button-missing','인쇄 단추를 찾지 못했습니다.');
    if(controllers.has(button))return controllers.get(button);
    var original=snapshotButton(button);
    var originalOnclick=button.onclick;
    var hadButtonClass=button.classList.contains(BUTTON_CLASS);
    var active=null;
    var disposed=false;
    var controller;
    button.onclick=null;
    button.classList.add(BUTTON_CLASS);

    function notify(state,extra){
      if(typeof options.onStateChange==='function')options.onStateChange(Object.assign({state:state},extra||{}));
    }

    function preparing(){
      button.disabled=true;
      button.setAttribute('aria-busy','true');
      button.setAttribute('data-print-state','preparing');
      button.textContent='인쇄 준비 중…';
      button.setAttribute('aria-label','진단 패키지 인쇄 준비 중');
      notify('preparing');
    }

    function failed(error){
      button.disabled=false;
      button.removeAttribute('aria-busy');
      button.setAttribute('data-print-state','error');
      button.textContent='인쇄 준비 실패 · 다시 시도';
      button.setAttribute('aria-label','인쇄 준비에 실패했습니다. 다시 시도');
      button.setAttribute('title',error.message);
      notify('error',{code:error.code||'preparation-failed'});
    }

    function run(){
      if(disposed)return Promise.reject(new PrintPreparationError('controller-closed','인쇄 연결이 닫혔습니다.'));
      if(active)return active.promise;
      preparing();
      var job=createPreparation(Object.assign({},options,{document:doc}));
      var record={job:job,promise:null};
      record.promise=job.promise.then(function(prepared){
        if(active!==record){
          prepared.cleanup();
          throw new PrintPreparationError('cancelled','인쇄 준비가 취소되었습니다.');
        }
        restoreButton(button,original);
        notify('ready',{metrics:prepared.metrics});
        if(options.openPrint===false){
          if(active===record)active=null;
          return prepared;
        }
        notify('printing',{metrics:prepared.metrics});
        return prepared.openPrint().then(function(metrics){
          if(active===record){
            active=null;
            restoreButton(button,original);
            notify('idle',{metrics:metrics});
          }
          return metrics;
        });
      }).catch(function(error){
        if(active===record){
          active=null;
          if(error&&error.code==='cancelled'){
            restoreButton(button,original);
            notify('idle');
          }else failed(error);
        }
        throw error;
      });
      active=record;
      return record.promise;
    }

    function click(event){event.preventDefault();run().catch(function(){});}
    button.addEventListener('click',click);
    controller={
      prepareAndPrint:run,
      cancel:function(){
        var record=active;
        active=null;
        if(record)record.job.cancel();
        restoreButton(button,original);
        notify('idle');
      },
      retry:run,
      dispose:function(){
        if(disposed)return;
        disposed=true;
        var record=active;
        active=null;
        if(record)record.job.cancel();
        button.removeEventListener('click',click);
        if(!hadButtonClass)button.classList.remove(BUTTON_CLASS);
        button.onclick=originalOnclick;
        restoreButton(button,original);
        controllers.delete(button);
      },
      state:function(){return active?'busy':'idle';}
    };
    controllers.set(button,controller);
    return controller;
  }

  global.GFIELD_FINAL_REPORT_PRINT=Object.freeze({
    version:VERSION,
    supportedRounds:Object.freeze([2]),
    libraryUrl:LIBRARY_URL,
    createPreparation:createPreparation,
    attach:attach,
    PrintPreparationError:PrintPreparationError
  });
})(window);
