/* Official-attempt practice, supplemented only with the published important-types bank. */
(function(root){
  'use strict';
  var SUPPORTED=/^(?:final[12347]|original[12])$/;
  var BAND_LABEL={all:'전체 배점','2.7':'2점대','3.4':'3점대','4.2':'4점대'};
  var SCOPE_LABEL={all:'응시 시험 전체',wrong:'틀린 문제',correct:'맞은 문제'};
  var COUNTS={10:{'2.7':4,'3.4':3,'4.2':3},20:{'2.7':8,'3.4':7,'4.2':5},30:{'2.7':12,'3.4':10,'4.2':8}};
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function label(code){if(code.indexOf('original')===0)return '시그니처 '+code.slice(8)+'회';var n=Number(code.slice(5));return n===7?'최종 실전 7회':'파이널 '+n+'회';}
  function codeOf(attempt){var key=String(attempt&&attempt.key||attempt&&attempt.round||'');return SUPPORTED.test(key)?key:'';}
  function isAllowed(code,student,data){
    if(!code||!student)return false;
    if(code.indexOf('original')===0||code==='final7'){
      var key=code.indexOf('original')===0?'mock-signature-'+code.slice(8):'mock-final-7';
      var list=data&&data.archiveProductAccess&&data.archiveProductAccess[key];
      return Array.isArray(list)&&(list.indexOf('*')>=0||list.indexOf(student)>=0);
    }
    return true; // Final 1–4 follow the existing registered-student bank access.
  }
  function signature(item){return JSON.stringify([item.text,item.promptDataLines||[],item.asset&&item.asset.src||'',item.answer]);}
  function buildPool(attempts,datasets,scope,band,target,library){
    target=Object.prototype.hasOwnProperty.call(COUNTS,target)?Number(target):30;
    var groups=[];
    (attempts||[]).forEach(function(attempt){
      var code=codeOf(attempt),data=datasets&&datasets[code];
      if(!code||!data||!Array.isArray(data.items))return;
      var ox=String(attempt.score&&attempt.score.ox||attempt.ox||'').toUpperCase();
      if(!/^[OX]{30}$/.test(ox))return;
      var byNo=new Map();
      data.items.forEach(function(item){
        var no=Number(item&&item.sourceNo);
        if(!Number.isInteger(no)||no<1||no>30||item.reviewStatus!=='verified'||
           band!=='all'&&item.pointBand!==band||scope==='wrong'&&ox[no-1]!=='X'||scope==='correct'&&ox[no-1]!=='O')return;
        if(!byNo.has(no))byNo.set(no,[]);
        byNo.get(no).push(item);
      });
      var sources=Array.from(byNo.keys()).sort(function(a,b){return a-b;}).map(function(no){
        return byNo.get(no).sort(function(a,b){return a.variantNo-b.variantNo;});
      });
      groups.push({code:code,sources:sources});
    });
    var selected=[],seenIds=new Set(),seenQuestions=new Set();
    for(var variant=0;variant<3;variant++){
      for(var depth=0;depth<30;depth++){
        groups.forEach(function(group){
          var item=group.sources[depth]&&group.sources[depth][variant];
          if(!item||seenIds.has(item.id))return;
          var content=signature(item);
          if(seenQuestions.has(content))return;
          seenIds.add(item.id);seenQuestions.add(content);
          selected.push({item:item,code:group.code});
        });
      }
    }
    var chosen=band==='all'?['2.7','3.4','4.2'].flatMap(function(point){return selected.filter(function(entry){return entry.item.pointBand===point;}).slice(0,COUNTS[target][point]);}):selected.slice(0,target);
    var attemptCount=chosen.length;
    if(scope==='all'&&library&&Array.isArray(library.items)&&chosen.length<target){
      var usedIds=new Set(chosen.map(function(entry){return entry.item.id;}));
      var usedContent=new Set(chosen.map(function(entry){return signature(entry.item);}));
      var publicItems=library.items.filter(function(item){
        return item&&item.reviewStatus==='verified'&&item.sourceSet==='final'&&[1,2].includes(Number(item.sourceRound))&&
          [1,2,3].includes(Number(item.variantNo))&&item.text&&item.answer!=null&&item.solution&&
          ['2.7','3.4','4.2'].includes(item.pointBand);
      });
      function supplement(point,limit){
        var current=chosen.filter(function(entry){return entry.item.pointBand===point;}).length;
        publicItems.filter(function(item){return item.pointBand===point;}).forEach(function(item){
          if(current>=limit||usedIds.has(item.id)||usedContent.has(signature(item)))return;
          chosen.push({item:item,code:'final'+item.sourceRound,origin:'library'});
          usedIds.add(item.id);usedContent.add(signature(item));current++;
        });
      }
      if(band==='all') ['2.7','3.4','4.2'].forEach(function(point){supplement(point,COUNTS[target][point]);});
      else supplement(band,target);
    }
    if(band==='all')chosen.sort(function(a,b){return ['2.7','3.4','4.2'].indexOf(a.item.pointBand)-['2.7','3.4','4.2'].indexOf(b.item.pointBand);});
    return {target:target,attemptCount:attemptCount,libraryCount:chosen.length-attemptCount,available:chosen.length,missing:Math.max(0,target-chosen.length),questions:chosen.map(function(entry,index){
      return {index:index+1,item:entry.item,code:entry.code,origin:entry.origin||'attempt'};
    })};
  }
  function figure(asset){
    if(!asset)return '';
    if(asset.kind!=='raster'||!/^data:image\/png;base64,/.test(asset.src||''))throw Error('검수 그림을 확인할 수 없습니다.');
    return '<img src="'+esc(asset.src)+'" alt="'+esc(asset.description||'문항 그림')+'">';
  }
  function page(title,number,total,content,kind){
    return '<section class="pm-page pm-'+kind+'-page"><div class="pm-watermark"><div class="wm-layer"></div></div><div class="pm-page-content"><header><span>지필드 영재교육 · 맞춤 모의고사</span><span>'+esc(title)+' · '+number+'/'+total+'</span></header><div class="pm-'+kind+'-grid">'+content+'</div></div></section>';
  }
  function questionWide(entry){
    var x=entry.item,given=Array.isArray(x.promptDataLines)?x.promptDataLines.join(' '):'';
    return String(x.text||'').length+given.length>210||!!x.asset&&(String(x.text||'').length+given.length>125||[28,30].includes(Number(x.sourceNo)));
  }
  function answerWide(entry){var x=entry.item;return !!x.solutionAsset||String(x.solution||'').length>190||Array.isArray(x.solutionSteps)&&x.solutionSteps.join('').length>190;}
  function answerTall(entry){var x=entry.item;return !!x.solutionAsset&&Array.isArray(x.solutionSteps)&&x.solutionSteps.join('').length>190;}
  function rows(items,wide,tall){
    var out=[],pending=[];
    items.forEach(function(entry){
      if(wide(entry)||tall&&tall(entry)){
        if(pending.length){out.push({entries:pending,tall:false});pending=[];}
        out.push({entries:[entry],tall:!!(tall&&tall(entry))});
      }else{
        pending.push(entry);
        if(pending.length===2){out.push({entries:pending,tall:false});pending=[];}
      }
    });
    if(pending.length)out.push({entries:pending,tall:false});
    var pages=[],current=[];
    out.forEach(function(row){
      if(row.tall){if(current.length){pages.push(current.flat());current=[];}pages.push(row.entries);return;}
      current.push(row.entries);
      if(current.length===2){pages.push(current.flat());current=[];}
    });
    if(current.length)pages.push(current.flat());
    return pages;
  }
  function questionCard(entry){
    var x=entry.item,given=Array.isArray(x.promptDataLines)?x.promptDataLines:[];
    return '<article class="pm-q'+(questionWide(entry)?' pm-wide':'')+'" data-item-id="'+esc(x.id)+'"><h3>'+entry.index+'번 <span class="pm-type">'+esc(x.detailType||'')+' · '+esc(x.pointBand)+'점'+(entry.origin==='library'?' · 자료실 보충':'')+'</span></h3><p>'+esc(x.text)+'</p>'+
      (given.length?'<div class="pm-given">'+given.map(esc).join('<br>')+'</div>':'')+figure(x.asset)+
      '<div class="pm-work" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="pm-answerline">답 <span></span></div></article>';
  }
  function answerCard(entry){
    var x=entry.item,steps=Array.isArray(x.solutionSteps)&&x.solutionSteps.length?x.solutionSteps:[x.solution];
    return '<article class="pm-answer'+(answerWide(entry)?' pm-wide':'')+(answerTall(entry)?' pm-tall':'')+'" data-answer-id="'+esc(x.id)+'"><h3>'+entry.index+'번 · '+esc(x.detailType||'')+'</h3><p class="pm-source">'+(entry.origin==='library'?'자료실 공개 보충 · ':'')+esc(label(entry.code))+' 원문 '+x.sourceNo+'번 · 검수 유사문제 '+x.variantNo+'</p><strong>답 '+esc(x.answer)+'</strong><ol>'+steps.map(function(step){return '<li>'+esc(step)+'</li>';}).join('')+'</ol>'+figure(x.solutionAsset)+'</article>';
  }
  function renderPaper(paper,scope,band,student){
    if(!paper.questions.length||paper.questions.length>paper.target)throw Error('인쇄할 검수 문항이 없습니다.');
    var qPages=[],aPages=[],questionGroups=rows(paper.questions,questionWide),answerGroups=rows(paper.questions,answerWide,answerTall);
    questionGroups.forEach(function(group,index){qPages.push(page('문제',index+1,questionGroups.length,group.map(questionCard).join(''),'question'));});
    answerGroups.forEach(function(group,index){aPages.push(page('정답과 풀이',index+1,answerGroups.length,group.map(answerCard).join(''),'answer'));});
    var duplexBlank=qPages.length%2?['<section class="pm-page pm-duplex-blank" aria-hidden="true"></section>']:[];
    return qPages.concat(duplexBlank,aPages).join('');
  }
  async function fetchAttempts(student){
    var auth=root.GFIELD_AUTH,path='mock_results?select=student,round,ox,score,wrong,source,updated_at&student=eq.'+encodeURIComponent(student);
    var response=await fetch(auth.SUPABASE_URL+'/rest/v1/'+path,{headers:{apikey:auth.PUBLISHABLE_KEY,Authorization:'Bearer '+auth.PUBLISHABLE_KEY,'x-gfield-student':btoa(unescape(encodeURIComponent(student)))}});
    if(!response.ok)throw Error('응시 기록을 불러오지 못했습니다.');
    return root.GFIELD_STUDENT_RESULT_HUB.officialAttempts(await response.json(),student);
  }
  async function mount(){
    var account=await root.GFIELD_BANK_ACCESS.ready,query=new URLSearchParams(location.search);
    var student=String(account.student||((account.role==='admin'||account.role==='teacher')?query.get('name'):'')||'').trim();
    var status=document.getElementById('pmStatus'),print=document.getElementById('pmPrint'),pages=document.getElementById('pmPages');
    if(!student){status.textContent='학생 이름으로 자료실에 입장해 주세요.';return;}
    var scope=Object.prototype.hasOwnProperty.call(SCOPE_LABEL,query.get('scope'))?query.get('scope'):'all',band=Object.prototype.hasOwnProperty.call(BAND_LABEL,query.get('band'))?query.get('band'):'all';
    var count=COUNTS[query.get('count')]?Number(query.get('count')):30;
    var attempts=[],datasets={},unavailable=[],revision=0,currentPaperCount=0,library=null,libraryPromise=null;
    function controls(){
      document.querySelectorAll('[data-scope]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.scope===scope));});
      document.querySelectorAll('[data-band]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.band===band));});
      document.querySelectorAll('[data-count]').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.count)===count));});
    }
    async function render(){
      var current=++revision;controls();print.disabled=true;pages.innerHTML='';currentPaperCount=0;
      var paper=buildPool(attempts,datasets,scope,band,count),note=unavailable.length?' · 유사문제 미등록/권한 확인: '+unavailable.join(', '):'';
      if(!attempts.length){status.textContent='확인된 최초 응시 기록이 없습니다.';return;}
      if(scope==='all'&&paper.missing&&Array.isArray(root.GFIELD_DATA&&root.GFIELD_DATA.students)&&root.GFIELD_DATA.students.includes(student)){
        try{
          if(!libraryPromise)libraryPromise=root.BANK_FIXED.load('important');
          library=await libraryPromise;
          if(current!==revision)return;
          paper=buildPool(attempts,datasets,scope,band,count,library);
        }catch(error){libraryPromise=null;note+=' · 자료실 공개 문제를 불러오지 못했습니다.';}
      }
      if(!paper.available){status.innerHTML='<span class="pm-short">선택한 조건의 검수 유사문제가 없습니다.</span>'+esc(note);return;}
      var sourceNote=paper.libraryCount?' · 응시 기반 '+paper.attemptCount+'문항 + 자료실 공개 보충 '+paper.libraryCount+'문항':'';
      status.innerHTML=paper.missing?'<span class="pm-short">'+count+'문항 중 '+paper.available+'문항 확보 · '+paper.missing+'문항 부족</span> · 확보된 문항은 인쇄할 수 있습니다.'+esc(sourceNote+note):'<span class="pm-ready">'+count+'문항 준비 완료</span> · '+esc(SCOPE_LABEL[scope])+' · '+esc(BAND_LABEL[band]+sourceNote+note);
      try{
        pages.innerHTML=renderPaper(paper,scope,band,student);
        await Promise.all([document.fonts.ready].concat(Array.from(pages.querySelectorAll('img')).map(function(img){return img.decode();})));
        if(current!==revision)return;
        pages.querySelectorAll('.wm-layer').forEach(function(layer){root.BANK_CORE.buildWatermarkTiles(layer,student);});
        currentPaperCount=paper.questions.length;print.disabled=false;
      }catch(error){pages.innerHTML='';status.innerHTML='<span class="pm-error">'+esc(error.message||'시험지를 만들지 못했습니다.')+'</span>';}
    }
    document.querySelectorAll('[data-scope]').forEach(function(button){button.addEventListener('click',function(){scope=button.dataset.scope;render();});});
    document.querySelectorAll('[data-band]').forEach(function(button){button.addEventListener('click',function(){band=button.dataset.band;render();});});
    document.querySelectorAll('[data-count]').forEach(function(button){button.addEventListener('click',function(){count=Number(button.dataset.count);render();});});
    print.addEventListener('click',function(){if(!print.disabled&&currentPaperCount>0&&pages.querySelectorAll('.pm-q').length===currentPaperCount)root.print();});
    try{
      attempts=await fetchAttempts(student);
      await Promise.all(attempts.map(async function(attempt){
        var code=codeOf(attempt);
        if(!code||!isAllowed(code,student,root.GFIELD_DATA)){unavailable.push(code?label(code):String(attempt.key)+'회');return;}
        try{datasets[code]=await root.BANK_FIXED.load(code);}catch(error){unavailable.push(label(code));}
      }));
      render();
    }catch(error){status.innerHTML='<span class="pm-error">'+esc(error.message||'응시 기록을 확인하지 못했습니다.')+'</span>';}
  }
  root.GFIELD_PERSONAL_MOCK={buildPool:buildPool,isAllowed:isAllowed,renderPaper:renderPaper};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GFIELD_PERSONAL_MOCK;
  if(typeof document!=='undefined')mount();
})(typeof window!=='undefined'?window:globalThis);
