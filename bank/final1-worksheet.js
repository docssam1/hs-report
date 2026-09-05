(function(global){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function chunks(a,n){var out=[];for(var i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out;}
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
    if(!Array.isArray(ids))ids=wrong?[]:Array.from({length:30},(_,i)=>'final1-q'+String(i+1).padStart(2,'0'));
    var labels={all:'전체문제','2.7':'2점대','3.4':'3점대','4.2':'4점대'};
    var band=Object.hasOwn(labels,opts.pointBand)?opts.pointBand:'all',mode=q.get('printMode')||'both';
    if(!['questions','answers','both','quick'].includes(mode))mode='both';
    var student=(new URLSearchParams(location.hash.slice(1)).get('student')||'').trim(),checked=new Set(),revision=0;
    // Display-only name, never authority for reading or writing student results.
    var back=wrong?'../final.html?round=1&go=report'+(student?'&name='+encodeURIComponent(student):''):'../index.html';
    root.innerHTML='<header class="f1-toolbar"><a class="f1-back" href="'+esc(back)+'">← '+(wrong?'성적표':'자료실')+'</a><div class="f1-title">파이널 1회 약점 유형</div><div class="f1-bands" role="group" aria-label="오답 배점대">'+Object.keys(labels).map(k=>'<button type="button" data-role="points" data-val="'+k+'">'+labels[k]+'</button>').join('')+'</div><label class="f1-print-label">인쇄 구성 <select id="printMode"><option value="questions">문제만</option><option value="answers">답안·풀이만</option><option value="both">둘 다</option><option value="quick">빠른 정답만</option></select></label><button type="button" id="btnPrint" disabled>인쇄</button></header><div class="f1-status" id="f1Status" role="status" aria-live="polite"></div><div id="f1Pages"></div>';
    var pageRoot=root.querySelector('#f1Pages'),print=root.querySelector('#btnPrint');
    function sheet(cls,html){return '<section class="f1-page page '+cls+'"><div class="f1-watermark-clip"><div class="wm-layer"></div></div>'+html+'</section>';}
    function cleanUrl(){
      var u=new URL(location.href);['seed','gen','review','n','tune','ratio','area','level','mode'].forEach(k=>u.searchParams.delete(k));
      u.searchParams.set('bank','final1');u.searchParams.set('points',band);u.searchParams.set('printMode',mode);
      var all=ids.length===30&&new Set(ids).size===30&&ids.every(id=>/^final1-q(0[1-9]|[12][0-9]|30)$/.test(id));
      if(all&&!wrong)u.searchParams.delete('gens');else u.searchParams.set('gens',ids.join(','));
      history.replaceState(null,'',u.toString());
    }
    function cover(paper){
      var seen=new Map();paper.questions.forEach(x=>{if(!seen.has(x.sourceNo))seen.set(x.sourceNo,x);});
      var list=Array.from(seen.values()).sort((a,b)=>a.sourceNo-b.sourceNo).map(x=>'<label class="f1-check"><input type="checkbox" data-source="'+x.sourceNo+'"'+(checked.has(x.sourceNo)?' checked':'')+' aria-label="원문 '+x.sourceNo+'번 해결 체크"><span><b>원문 '+x.sourceNo+'번</b><span class="f1-check-type">'+esc(x.detailType)+'</span></span></label>').join('');
      return sheet('f1-cover cover-page','<div class="f1-mast"><div class="f1-brand">지필드 영재교육</div><div class="f1-issue">'+labels[band]+' / '+paper.questions.length+'문항</div></div><div class="f1-cover-heading"><div class="f1-owner">'+(student?esc(student)+' 학생의':'이름 ____________________')+'</div><h1>파이널 1회 <span>약점 유형</span></h1></div><div class="f1-check-title">'+(wrong?'오답':'선택')+' 유형 자기 점검</div><p class="lead">풀이를 보지 않고 다시 풀 수 있으면 체크하세요.</p><div class="f1-checks">'+list+'</div><div class="f1-rule">원문 한 문제마다 유사문제 3개씩 공부합니다. 체크는 성적에 반영되지 않습니다.</div>');
    }
    function questionPage(group,n,total){
      var html='<div class="f1-qpage qpage"><div class="f1-qhead qhead"><span>파이널 1회 약점 유형</span><small>문제 '+n+' / '+total+'</small></div>';
      group.forEach(x=>{
        var cond=Array.isArray(x.conditionLines)&&x.conditionLines.length?'<ol class="qconditions">'+x.conditionLines.map((t,i)=>'<li>'+String.fromCodePoint(0x2460+i)+' '+esc(t)+'</li>').join('')+'</ol>':'';
        html+='<article class="f1-qcard qcard" data-index="'+x.index+'" data-source-no="'+x.sourceNo+'" data-points="'+esc(x.pointBand)+'" data-gen="'+esc(x.genId)+'"><span class="f1-qno">'+x.index+'.</span><span class="f1-qtext qtext">'+esc(x.text)+'</span>'+cond+'<div class="f1-qmeta qmeta fixed-item" data-item-id="'+esc(x.id)+'">원문 '+x.sourceNo+'번 / 유사문제 '+x.variantNo+' / '+esc(x.pointBand)+'점</div>'+(x.asset?'<div class="f1-qfigure qfigure">'+raster(x.asset,'')+'</div>':'')+'<div class="f1-answerline answerline">답 <i></i></div></article>';
      });return sheet('question-page',html+'</div>');
    }
    function answerPages(items){return chunks(items,2).map((group,i,groups)=>{
      var html='<h2>정답 및 풀이 <small>'+(i+1)+' / '+groups.length+'</small></h2>';
      group.forEach(x=>{
        var steps=Array.isArray(x.solutionSteps)?x.solutionSteps:[];
        html+='<article class="f1-solution solution-card" data-answer-id="'+esc(x.id)+'" data-index="'+x.index+'"><h3>'+x.index+'번 <span class="ans">'+esc(x.answer)+'</span></h3><div class="label">원문 '+x.sourceNo+'번 / '+esc(x.detailType)+'</div>'+(x.readingFocus?'<p><b>조건 읽기</b> '+esc(x.readingFocus)+'</p>':'')+(x.solutionSkill?'<p><b>풀이 방법</b> '+esc(x.solutionSkill)+'</p>':'')+'<ol>'+steps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>'+raster(x.solutionAsset,'f1-solution-asset')+(steps.join(' ')===x.solution?'':'<p class="f1-answer-summary">'+esc(x.solution)+'</p>')+'</article>';
      });return sheet('f1-answer-page answer-page',html);
    }).join('');}
    function quickPages(items){return chunks(items,30).map((group,i,groups)=>sheet('f1-answer-page answer-page quick-page','<h2>빠른 정답 <small>'+(i+1)+' / '+groups.length+'</small></h2><div class="f1-quick">'+group.map(x=>'<div data-answer-id="'+esc(x.id)+'"><b>'+x.index+'</b><span>'+esc(x.answer)+'</span></div>').join('')+'</div>')).join('');}
    async function render(){
      var current=++revision;print.disabled=true;pageRoot.innerHTML='';root.querySelector('#f1Status').textContent='문항을 불러오는 중입니다.';
      root.querySelector('#printMode').value=mode;root.querySelectorAll('[data-role=points]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===band)));
      try{
        var paper=await global.BANK_FIXED.buildPaper({genIds:ids.slice(),pointBand:band});if(current!==revision)return;
        if(!paper.questions.length){root.querySelector('#f1Status').textContent='선택한 배점대의 '+(wrong?'오답':'문항')+'이 없습니다.';return;}
        var pages=[],groups=chunks(paper.questions,6);
        if(mode==='questions'||mode==='both'){
          pages.push(cover(paper));groups.forEach((g,i)=>pages.push(questionPage(g,i+1,groups.length)));
          if(mode==='both'&&(1+groups.length)%2===1)pages.push('<section class="f1-page page duplex-blank"><span>양면 인쇄용 빈 면 · 답안은 새 종이 앞면에서 시작합니다.</span></section>');
        }
        if(mode==='answers'||mode==='both')pages.push(answerPages(paper.questions));if(mode==='quick')pages.push(quickPages(paper.questions));
        pageRoot.innerHTML=pages.join('');
        var watermarkName=student||global.BANK_CORE.getStudentName()||'학습 자료';
        pageRoot.querySelectorAll('.wm-layer').forEach(layer=>global.BANK_CORE.buildWatermarkTiles(layer,watermarkName));
        cleanUrl();
        await Promise.all([document.fonts.ready].concat(Array.from(pageRoot.querySelectorAll('img')).map(img=>img.decode())));
        if(current!==revision)return;root.querySelector('#f1Status').textContent=paper.questions.length+'문항 / '+labels[band]+' / 원문별 3문항';print.disabled=false;
      }catch(error){if(current!==revision)return;pageRoot.innerHTML='';root.querySelector('#f1Status').innerHTML='<div class="f1-error" role="alert">'+esc(error.message||'문항을 불러오지 못했습니다.')+'</div>';}
    }
    root.querySelectorAll('[data-role=points]').forEach(b=>b.addEventListener('click',()=>{band=b.dataset.val;render();}));
    root.querySelector('#printMode').addEventListener('change',e=>{mode=e.target.value;render();});
    root.addEventListener('change',e=>{if(e.target.matches('.f1-check input')){var no=Number(e.target.dataset.source);if(e.target.checked)checked.add(no);else checked.delete(no);}});
    print.addEventListener('click',()=>{if(!print.disabled)global.print();});render();
  }
  global.FINAL1_WORKSHEET={mount:mount};
})(window);
