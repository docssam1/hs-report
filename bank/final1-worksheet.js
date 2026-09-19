(function(global){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function mathText(v){
    return esc(v).replace(/(^|[^0-9])(\d{1,3})\/(\d{1,3})(?![0-9])/g,function(_,prefix,numerator,denominator){
      return prefix+'<span class="f1-frac" role="math" aria-label="'+denominator+'분의 '+numerator+'"><span>'+numerator+'</span><span>'+denominator+'</span></span>';
    });
  }
  function chunks(a,n){var out=[];for(var i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out;}
  function editorialWide(x){
    var dataLength=Array.isArray(x.promptDataLines)?x.promptDataLines.join(' ').length:0;
    var total=(x.text||'').length+dataLength;
    if(Number(x.sourceRound)===1)return total>180||!!x.asset&&(total>110||[18,20,28].includes(Number(x.sourceNo)));
    if(Number(x.sourceRound)===7&&[5,6,12].includes(Number(x.sourceNo)))return true;
    if(Number(x.sourceRound)===7&&[14,15,17,29].includes(Number(x.sourceNo)))return false;
    return total>210||!!x.asset&&(total>180||Number(x.sourceNo)===28);
  }
  function questionGroups(items,layout){
    if(layout==='compact')return chunks(items,6);
    var groups=[],group=[],slots=0;
    items.forEach(x=>{
      var weight=editorialWide(x)?2:1;
      if(weight===2&&slots%2===1){
        if(group.length===1&&groups.length){
          var previous=groups[groups.length-1];
          var moved=previous[previous.length-1];
          if(moved&&!editorialWide(moved)){
            previous.pop();
            group.unshift(moved);
            slots+=1;
          }
        }
        if(slots%2===1){groups.push(group);group=[];slots=0;}
      }
      if(group.length&&slots+weight>4){groups.push(group);group=[];slots=0;}
      group.push(x);slots+=weight;
      if(slots===4){groups.push(group);group=[];slots=0;}
    });
    if(group.length)groups.push(group);
    if(groups.length>1&&groups[groups.length-1].length===1){
      var last=groups[groups.length-1],previous=groups[groups.length-2],moveIndex=-1;
      for(var j=previous.length-1;j>=0;j-=1){if(!editorialWide(previous[j])){moveIndex=j;break;}}
      if(moveIndex>=0)last.unshift(previous.splice(moveIndex,1)[0]);
    }
    return groups;
  }
  function raster(a,cls){
    if(!a)return '';
    if(a.kind!=='raster'||!/^data:image\/png;base64,/.test(a.src||''))throw Error('문항 그림을 확인할 수 없습니다. 선생님께 문의해 주세요.');
    return '<img class="'+cls+'" src="'+esc(a.src)+'" alt="'+esc(a.description||'문항 그림')+'">';
  }
  function mount(opts){
    document.body.classList.add('fixed-bank-mode');
    var legacy=document.getElementById('btnPrint');if(legacy)legacy.id='legacyPrint';
    var root=document.createElement('main');root.id='final1Worksheet';root.className='gfield-ui';document.body.appendChild(root);
    var q=new URLSearchParams(location.search),wrong=!!opts.wrongPracticeMode,ids=opts.genIds;
    var bankCode=/^(?:final[127]|important)$/.test(opts.bankCode||'')?opts.bankCode:'final1';
    var important=bankCode==='important';
    root.dataset.bankCode=bankCode;
    var round=important?null:Number(bankCode.slice(5)),roundLabel=important?'선생님이 고른 중요 유형':(round===7?'최종 7회':'파이널 '+round+'회'),idPrefix=important?'':bankCode+'-q';
    if(important)ids=Array.isArray(opts.typeIds)?opts.typeIds:[];
    else if(!Array.isArray(ids))ids=wrong?[]:(round===7?[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(no=>idPrefix+String(no).padStart(2,'0')):Array.from({length:30},(_,i)=>idPrefix+String(i+1).padStart(2,'0')));
    var labels={all:'전체문제','2.7':'2점대','3.4':'3점대','4.2':'4점대'};
    var counts=[4,8,20,40],requestedCount=counts.includes(Number(opts.n))?Number(opts.n):20;
    var band=Object.hasOwn(labels,opts.pointBand)?opts.pointBand:'all',mode=q.get('printMode')||'both';
    if(!['questions','answers','both','quick'].includes(mode))mode='both';
    var layout=q.get('layout')||'editorial';
    if(!['editorial','compact'].includes(layout))layout='editorial';
    root.dataset.layout=layout;
    var student=(new URLSearchParams(location.hash.slice(1)).get('student')||'').trim(),checked=new Set(),revision=0;
    // Display-only name, never authority for reading or writing student results.
    var back=wrong?'../final.html?round='+round+'&go=report'+(student?'&name='+encodeURIComponent(student):''):'../index.html';
    var countControls=important?'<div class="f1-bands f1-counts" role="group" aria-label="문항 수">'+counts.map(k=>'<button type="button" data-role="count" data-val="'+k+'">'+k+'문항</button>').join('')+'</div>':'';
    root.innerHTML='<header class="f1-toolbar"><a class="f1-back" href="'+esc(back)+'">← '+(wrong?'성적표':'자료실')+'</a><div class="f1-title">'+roundLabel+(important?'':' 약점 유형')+'</div><div class="f1-bands" role="group" aria-label="오답 배점대">'+Object.keys(labels).map(k=>'<button type="button" data-role="points" data-val="'+k+'">'+labels[k]+'</button>').join('')+'</div>'+countControls+'<label class="f1-layout-label">문제 배치 <select id="pageLayout"><option value="editorial">읽기 편한 4문항</option><option value="compact">간결한 6문항</option></select></label><label class="f1-print-label">인쇄 구성 <select id="printMode"><option value="questions">문제만</option><option value="answers">답안·풀이만</option><option value="both">둘 다</option><option value="quick">빠른 정답만</option></select></label><button type="button" id="btnPrint" disabled>인쇄</button></header><div class="f1-status" id="f1Status" role="status" aria-live="polite"></div><div id="f1Pages"></div>';
    var pageRoot=root.querySelector('#f1Pages'),print=root.querySelector('#btnPrint');
    function sheet(cls,html){return '<section class="f1-page page '+cls+'"><div class="f1-watermark-clip"><div class="wm-layer"></div></div>'+html+'</section>';}
    function cleanUrl(){
      var u=new URL(location.href);['seed','gen','review','n','tune','ratio','area','level','mode'].forEach(k=>u.searchParams.delete(k));
      u.searchParams.set('bank',bankCode);u.searchParams.set('points',band);u.searchParams.set('printMode',mode);
      u.searchParams.set('layout',layout);
      if(important){u.searchParams.set('types',ids.join(','));u.searchParams.set('n',requestedCount);u.searchParams.delete('gens');return history.replaceState(null,'',u.toString());}
      var idPattern=new RegExp('^'+idPrefix+'(0[1-9]|[12][0-9]|30)$');
      var all=ids.length===30&&new Set(ids).size===30&&ids.every(id=>idPattern.test(id));
      if(all&&!wrong)u.searchParams.delete('gens');else u.searchParams.set('gens',ids.join(','));
      history.replaceState(null,'',u.toString());
    }
    function cover(paper){
      var seen=new Map();paper.questions.forEach(x=>{var key=x.sourceRound+'-'+x.sourceNo;if(!seen.has(key))seen.set(key,x);});
      var list=Array.from(seen.values()).sort((a,b)=>a.sourceRound-b.sourceRound||a.sourceNo-b.sourceNo).map(x=>{var key=x.sourceRound+'-'+x.sourceNo,label=important?'파이널 '+x.sourceRound+'회 '+x.sourceNo+'번':'원문 '+x.sourceNo+'번';return '<label class="f1-check"><input type="checkbox" data-source="'+key+'"'+(checked.has(key)?' checked':'')+' aria-label="'+label+' 해결 체크"><span><b>'+label+'</b><span class="f1-check-type">'+esc(x.importantTypeTitle||x.detailType)+'</span></span></label>';}).join('');
      return sheet('f1-cover cover-page','<div class="f1-mast"><div class="f1-brand">지필드 영재교육</div><div class="f1-issue">'+labels[band]+' / '+paper.questions.length+'문항</div></div><div class="f1-cover-heading"><div class="f1-owner">'+(student?esc(student)+' 학생의':'이름 ____________________')+'</div><h1>'+roundLabel+(important?'':' <span>약점 유형</span>')+'</h1></div><div class="f1-check-title">'+(wrong?'오답':'선택')+' 유형 자기 점검</div><p class="lead">풀이를 보지 않고 다시 풀 수 있으면 체크하세요.</p><div class="f1-checks">'+list+'</div><div class="f1-rule">'+(important?'검수 문제 3개를 기준으로 같은 유형의 새 문제를 이어서 공부합니다.':'원문 한 문제마다 유사문제 3개씩 공부합니다.')+' 체크는 성적에 반영되지 않습니다.</div>');
    }
    function questionPage(group,n,total){
      var wideLead=layout==='editorial'&&group.length===3&&editorialWide(group[0]);
      var html='<div class="f1-qpage qpage" data-wide-lead="'+String(wideLead)+'"><div class="f1-qhead qhead"><span>'+roundLabel+' 약점 유형</span><small>문제 '+n+' / '+total+'</small></div>';
      group.forEach(x=>{
        var legacyGiven=bankCode==='final1'&&[12,14,23].includes(Number(x.sourceNo))&&Array.isArray(x.conditionLines)?x.conditionLines:[];
        var promptText=[x.text].concat(legacyGiven).filter(Boolean).join(' ');
        var given=Array.isArray(x.promptDataLines)&&x.promptDataLines.length?x.promptDataLines:[];
        var givenBlock=given.length?'<div class="f1-qgiven"><b>'+esc(x.promptDataLabel||'주어진 조건')+'</b><div class="f1-qgiven-lines">'+given.map(t=>'<span>'+mathText(t)+'</span>').join('')+'</div></div>':'';
        var sourceLabel=important?'파이널 '+x.sourceRound+'회 '+x.sourceNo+'번':'원문 '+x.sourceNo+'번';
        html+='<article class="f1-qcard qcard" data-index="'+x.index+'" data-source-no="'+x.sourceNo+'" data-source-round="'+x.sourceRound+'" data-points="'+esc(x.pointBand)+'" data-gen="'+esc(x.genId)+'" data-wide="'+String(layout==='editorial'&&editorialWide(x))+'"><div class="f1-qcard-head"><span class="f1-qno">'+x.index+'.</span><span class="f1-qtype">['+esc(x.importantTypeTitle||x.detailType)+']</span></div><div class="f1-qtext qtext">'+mathText(promptText)+'</div>'+givenBlock+'<div class="f1-qmeta qmeta fixed-item" data-item-id="'+esc(x.id)+'">'+sourceLabel+' / 유사문제 '+x.variantNo+' / '+esc(x.pointBand)+'점</div>'+(x.asset?'<div class="f1-qfigure qfigure">'+raster(x.asset,'')+'</div>':'')+'<div class="f1-workspace" aria-hidden="true"></div><div class="f1-answerline answerline"><span>답</span><span class="f1-answer-blank" aria-hidden="true"></span></div></article>';
      });
      var lastTwo=layout==='editorial'&&n===total&&group.length===2&&group.every(x=>!editorialWide(x));
      return sheet('question-page'+(lastTwo?' f1-last-two':''),html+'</div>');
    }
    function answerCard(x){
      var steps=Array.isArray(x.solutionSteps)?x.solutionSteps:[];
      var split=x.solutionAsset&&Number.isInteger(x.solutionAssetAfterStep)&&x.solutionAssetAfterStep>0&&x.solutionAssetAfterStep<steps.length?x.solutionAssetAfterStep:steps.length;
      var body='<ol>'+steps.slice(0,split).map(t=>'<li>'+mathText(t)+'</li>').join('')+'</ol>'+raster(x.solutionAsset,'f1-solution-asset');
      if(split<steps.length)body+='<ol start="'+(split+1)+'">'+steps.slice(split).map(t=>'<li>'+mathText(t)+'</li>').join('')+'</ol>';
      return '<article class="f1-solution solution-card" data-answer-id="'+esc(x.id)+'" data-source-no="'+x.sourceNo+'" data-index="'+x.index+'"><div class="f1-solution-head"><h3>'+x.index+'. <span class="f1-solution-type">['+esc(x.detailType)+']</span></h3><strong class="ans">답 '+mathText(x.answer)+'</strong></div><div class="label">원문 '+x.sourceNo+'번</div>'+(x.readingFocus?'<p class="f1-core"><b>핵심</b> '+mathText(x.readingFocus)+'</p>':'')+(x.solutionSkill?'<p class="f1-method"><b>풀이</b> '+mathText(x.solutionSkill)+'</p>':'')+body+(steps.join(' ')===x.solution?'':'<p class="f1-answer-summary">'+mathText(x.solution)+'</p>')+'</article>';
    }
    function quickAnswerGrid(items){return '<section class="f1-answer-key" aria-label="빠른 정답"><h3>빠른 정답</h3><div class="f1-answer-key-grid">'+items.map(x=>'<div data-answer-id="'+esc(x.id)+'"><b>'+x.index+'</b><span>'+mathText(x.answer)+'</span></div>').join('')+'</div></section>';}
    function answerPages(items){return '<div class="f1-answer-staging">'+items.map(answerCard).join('')+'</div>';}
    function compactAnswerPages(){
      var staging=pageRoot.querySelector('.f1-answer-staging');if(!staging)return;
      var cards=Array.from(staging.children),built=[],page=null,flow=null;
      function addPage(){
        page=document.createElement('section');page.className='f1-page page f1-answer-page answer-page f1-pagination-probe';
        page.innerHTML='<div class="f1-watermark-clip"><div class="wm-layer"></div></div><h2>정답 및 풀이 <small></small></h2><div class="f1-answer-flow"></div>';
        pageRoot.insertBefore(page,staging);flow=page.querySelector('.f1-answer-flow');built.push(page);
      }
      cards.forEach(card=>{
        if(!page)addPage();flow.appendChild(card);
        if(page.scrollHeight>page.clientHeight&&flow.children.length>1){flow.removeChild(card);addPage();flow.appendChild(card);}
      });
      staging.remove();
      built.forEach((answerPage,index)=>{answerPage.querySelector('h2 small').textContent=(index+1)+' / '+built.length;answerPage.classList.remove('f1-pagination-probe');});
    }
    function quickPages(items){return chunks(items,30).map((group,i,groups)=>sheet('f1-answer-page answer-page quick-page','<h2>빠른 정답 <small>'+(i+1)+' / '+groups.length+'</small></h2><div class="f1-quick">'+group.map(x=>'<div data-answer-id="'+esc(x.id)+'"><b>'+x.index+'</b><span>'+mathText(x.answer)+'</span></div>').join('')+'</div>')).join('');}
    async function render(){
      var current=++revision;print.disabled=true;pageRoot.innerHTML='';root.querySelector('#f1Status').textContent='문항을 불러오는 중입니다.';
      root.dataset.layout=layout;root.querySelector('#pageLayout').value=layout;root.querySelector('#printMode').value=mode;root.querySelectorAll('[data-role=points]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===band)));
      root.querySelectorAll('[data-role=count]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.val)===requestedCount)));
      try{
        var paper=await global.BANK_FIXED.buildPaper({bankCode:bankCode,genIds:important?null:ids.slice(),typeIds:important?ids.slice():null,n:requestedCount,pointBand:band});if(current!==revision)return;
        if(!paper.questions.length){root.querySelector('#f1Status').textContent='선택한 배점대의 '+(wrong?'오답':'문항')+'이 없습니다.';return;}
        var pages=[],groups=questionGroups(paper.questions,layout);
        if(mode==='questions'||mode==='both'){
          pages.push(cover(paper));groups.forEach((g,i)=>pages.push(questionPage(g,i+1,groups.length)));
          if(mode==='both'&&(1+groups.length)%2===1)pages.push('<section class="f1-page page duplex-blank"><span>양면 인쇄용 빈 면 · 답안은 새 종이 앞면에서 시작합니다.</span></section>');
        }
        if(mode==='answers'||mode==='both')pages.push(answerPages(paper.questions));if(mode==='quick')pages.push(quickPages(paper.questions));
        pageRoot.innerHTML=pages.join('');cleanUrl();
        await Promise.all([document.fonts.ready].concat(Array.from(pageRoot.querySelectorAll('img')).map(img=>img.decode())));
        compactAnswerPages();
        var watermarkName=student||global.BANK_CORE.getStudentName()||'학습 자료';
        pageRoot.querySelectorAll('.wm-layer').forEach(layer=>global.BANK_CORE.buildWatermarkTiles(layer,watermarkName));
        if(current!==revision)return;root.querySelector('#f1Status').textContent=paper.questions.length+'문항 / '+labels[band]+' / '+(layout==='editorial'?'읽기 편한 4문항':'간결한 6문항')+' / '+(important?'선택 유형':'원문별 3문항');print.disabled=false;
      }catch(error){if(current!==revision)return;pageRoot.innerHTML='';root.querySelector('#f1Status').innerHTML='<div class="f1-error" role="alert">'+esc(error.message||'문항을 불러오지 못했습니다.')+'</div>';}
    }
    root.querySelectorAll('[data-role=points]').forEach(b=>b.addEventListener('click',()=>{band=b.dataset.val;render();}));
    root.querySelectorAll('[data-role=count]').forEach(b=>b.addEventListener('click',()=>{requestedCount=Number(b.dataset.val);render();}));
    root.querySelector('#pageLayout').addEventListener('change',e=>{layout=e.target.value;render();});
    root.querySelector('#printMode').addEventListener('change',e=>{mode=e.target.value;render();});
    root.addEventListener('change',e=>{if(e.target.matches('.f1-check input')){var key=e.target.dataset.source;if(e.target.checked)checked.add(key);else checked.delete(key);}});
    print.addEventListener('click',()=>{if(!print.disabled)global.print();});render();
  }
  global.FINAL1_WORKSHEET={mount:mount};
})(window);
