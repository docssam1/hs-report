(function(global){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function mathText(v){return global.GFIELD_MATH_MARKUP.render(v);}
  function chunks(a,n){var out=[];for(var i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out;}
  function largeFigure(x){return x.sourceSet==='middle'&&(Number(x.sourceRound)===7&&Number(x.sourceNo)===13||Number(x.sourceRound)===8&&[13,17,20,26,27,30].includes(Number(x.sourceNo)))||x.sourceSet==='final'&&Number(x.sourceRound)===8&&Number(x.sourceNo)===25||x.sourceSet==='last'&&Number(x.sourceRound)===1&&Number(x.sourceNo)===6&&[2,3].includes(Number(x.variantNo))||x.sourceSet==='last'&&Number(x.sourceRound)===2&&[15,20,28,29].includes(Number(x.sourceNo))||x.sourceSet==='last'&&Number(x.sourceRound)===3&&[15,18,23,30].includes(Number(x.sourceNo));}
  function editorialWide(x){
    var essential=x.actualEssentialData;
    var dataLength=(Array.isArray(x.promptDataLines)?x.promptDataLines.join(' ').length:0)+(essential&&essential.text?essential.text.length:0);
    var total=(x.text||'').length+dataLength;
    if(essential&&Array.isArray(essential.rows))return true;
    if(Number(x.sourceRound)===1)return total>180||!!x.asset&&(total>110||[18,20,28].includes(Number(x.sourceNo)));
    if(x.sourceSet==='final'&&Number(x.sourceRound)===7&&[5,6,12].includes(Number(x.sourceNo)))return true;
    if(x.sourceSet==='final'&&Number(x.sourceRound)===7&&[14,15,17,29].includes(Number(x.sourceNo)))return false;
    return total>210||!!x.asset&&(total>180||Number(x.sourceNo)===28);
  }
  function questionGroups(items,layout,reportColumns){
    if(reportColumns&&items[0]&&items[0].sourceSet==='last'&&Number(items[0].sourceRound)===4)return chunks(items,6);
    if(reportColumns)return chunks(items,6).flatMap(function(group){
      // Give long text or a diagram with a long stem a half-page cell.
      var dense=group.some(function(x){
        var length=String(x.stemHtml||x.text||'').length+(Array.isArray(x.promptDataLines)?x.promptDataLines.join(' ').length:0);
        return length>270||!!x.asset&&length>95;
      });
      return dense?chunks(group,3):[group];
    });
    // Keep approved tall diagrams readable, rather than clip or miniaturize them.
    if(items.some(largeFigure)){
      var pages=[],pending=[];
      function flush(){if(pending.length){pages.push.apply(pages,questionGroups(pending,layout,false));pending=[];}}
      items.forEach(function(x){if(largeFigure(x)){flush();pages.push([x]);}else pending.push(x);});
      flush();return pages;
    }
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
      if(moveIndex>=0&&previous.length>2)last.unshift(previous.splice(moveIndex,1)[0]);
    }
    return groups;
  }
  function raster(a,cls){
    if(!a)return '';
    if(a.kind!=='raster'||!/^data:image\/png;base64,/.test(a.src||''))throw Error('문항 그림을 확인할 수 없습니다. 선생님께 문의해 주세요.');
    return '<img class="'+cls+'" src="'+esc(a.src)+'"'+(a.width&&a.height?' width="'+Number(a.width)+'" height="'+Number(a.height)+'"':'')+' alt="'+esc(a.description||'문항 그림')+'">';
  }
  function essentialBlock(item){
    var data=item.actualEssentialData;if(!data)return '';
    if(Array.isArray(data.rows))return '<table class="f1-essential-table" aria-label="문항 표"><tbody>'+data.rows.map(function(row){return '<tr>'+row.map(function(cell){return '<td>'+esc(cell==null||cell===''?'\u00a0':cell)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';
    if(typeof data.text==='string')return '<div class="f1-essential-text">'+data.text.split('\n').map(function(line){return '<p>'+mathText(line)+'</p>';}).join('')+'</div>';
    return '';
  }
  function mount(opts){
    document.body.classList.add('fixed-bank-mode');
    var legacy=document.getElementById('btnPrint');if(legacy)legacy.id='legacyPrint';
    var root=document.createElement('main');root.id='final1Worksheet';root.className='gfield-ui';document.body.appendChild(root);
    var q=new URLSearchParams(location.search),wrong=!!opts.wrongPracticeMode,ids=opts.genIds;
    var bankCode=/^(?:final[123478]|original[12]|last[1234]|middle[78]|important)$/.test(opts.bankCode||'')?opts.bankCode:'final1';
    var important=bankCode==='important';
    var signature=bankCode.startsWith('original');
    root.dataset.bankCode=bankCode;
    var isLast=/^last[1234]$/.test(bankCode);
    var isMiddle=/^middle[78]$/.test(bankCode);
    var round=important?null:isMiddle?Number(bankCode.slice(6)):Number(bankCode.slice(isLast?4:(signature?8:5))),roundLabel=important?'선생님이 고른 중요 유형':isMiddle?'중급 모의고사 '+round+'회':(signature?'시그니처 실전 '+round+'회':(isLast?'최종 실전 '+round+'회':(round===7?'최종 7회':(round===8?'최종 8회':'파이널 '+round+'회')))),idPrefix=important?'':isMiddle?'mid'+round+'-q':bankCode+'-q';
    if(important)ids=Array.isArray(opts.typeIds)?opts.typeIds:[];
    else if(!Array.isArray(ids))ids=wrong?[]:Array.from({length:30},(_,i)=>idPrefix+String(i+1).padStart(2,'0'));
    var labels={all:'전체문제','2.7':'2점대','3.4':'3점대','4.2':'4점대'};
    var counts=[4,8,20,40],requestedCount=counts.includes(Number(opts.n))?Number(opts.n):20;
    var band=Object.hasOwn(labels,opts.pointBand)?opts.pointBand:'all',mode=q.get('printMode')||'both';
    var freshAvailable=!important&&!wrong&&ids.length===1&&global.BANK_FINAL_SOURCE_GENERATORS&&global.BANK_FINAL_SOURCE_GENERATORS.has(ids[0]);
    var fresh=!!freshAvailable&&q.get('fresh')==='1';
    var orderMode=q.get('view')==='grouped'?'grouped':'mixed';
    if(!['questions','answers','both','quick'].includes(mode))mode='both';
    var layout=q.get('layout')||(isLast&&round===4?'compact':'editorial');
    if(!['editorial','compact'].includes(layout))layout='editorial';
    var reportColumns=isLast&&layout==='compact'&&(round===4||round===3&&wrong&&q.get('reportColumns')==='1');
    root.dataset.layout=layout;
    var student=(new URLSearchParams(location.hash.slice(1)).get('student')||'').trim(),checked=new Set(),revision=0,preparePrint=null;
    // Display-only name, never authority for reading or writing student results.
    var back=wrong?(isMiddle?'../mock.html?':'../final.html?')+(signature?'set=original&':(isLast?'set=last&':''))+'round='+round+'&go=report'+(student?'&name='+encodeURIComponent(student):''):'../index.html';
    var countControls=important||freshAvailable?'<div class="f1-bands f1-counts" role="group" aria-label="문항 수">'+counts.map(k=>'<button type="button" data-role="count" data-val="'+k+'">'+k+'문항</button>').join('')+'</div>':'';
    var freshControl=freshAvailable?'<button type="button" class="f1-fresh-toggle" data-role="fresh" aria-pressed="false">새 문제 섞기</button>':'';
    var viewControls=important?'':'<div class="f1-bands f1-view-modes" role="group" aria-label="약점 유형 보기 방식"><button type="button" data-role="view" data-val="grouped">문제별로 보기</button><button type="button" data-role="view" data-val="mixed">섞어서 보기</button></div>';
    root.innerHTML='<header class="f1-toolbar"><a class="f1-back" href="'+esc(back)+'">← '+(wrong?'성적표':'자료실')+'</a><div class="f1-title">'+roundLabel+(important?'':' 약점 유형')+'</div><div class="f1-bands" role="group" aria-label="오답 배점대">'+Object.keys(labels).map(k=>'<button type="button" data-role="points" data-val="'+k+'">'+labels[k]+'</button>').join('')+'</div>'+viewControls+freshControl+countControls+'<label class="f1-layout-label">문제 배치 <select id="pageLayout"><option value="editorial">읽기 편한 4문항</option><option value="compact">간결한 6문항</option></select></label><label class="f1-print-label">인쇄 구성 <select id="printMode"><option value="questions">문제만</option><option value="answers">답안·풀이만</option><option value="both">둘 다</option><option value="quick">빠른 정답만</option></select></label><button type="button" id="btnPrint" disabled>인쇄</button></header><div class="f1-status" id="f1Status" role="status" aria-live="polite"></div><div id="f1Pages"></div>';
    if(signature&&!wrong)root.querySelector('.f1-title').textContent=roundLabel+' 전체 유형';
    if(bankCode==='final8'||isLast||isMiddle)root.querySelector('#pageLayout option[value="compact"]').textContent='간결한 6문항 · 큰 그림은 별도 쪽';
    if(isLast&&round===4)root.querySelector('#pageLayout option[value="compact"]').textContent='2단 · 세로 3문항';
    var pageRoot=root.querySelector('#f1Pages'),print=root.querySelector('#btnPrint');
    function sheet(cls,html){return '<section class="f1-page page '+cls+'"><div class="f1-watermark-clip"><div class="wm-layer"></div></div>'+html+'</section>';}
    function cleanUrl(){
      var u=new URL(location.href);['seed','gen','review','n','tune','ratio','area','level','mode'].forEach(k=>u.searchParams.delete(k));
      u.searchParams.set('bank',bankCode);u.searchParams.set('points',band);u.searchParams.set('printMode',mode);
      u.searchParams.set('layout',layout);
      if(!important)u.searchParams.set('view',orderMode);
      if(fresh)u.searchParams.set('fresh','1');else u.searchParams.delete('fresh');
      if(important){u.searchParams.set('types',ids.join(','));u.searchParams.set('n',requestedCount);u.searchParams.delete('gens');return history.replaceState(null,'',u.toString());}
      var idPattern=new RegExp('^'+idPrefix+'(0[1-9]|[12][0-9]|30)$');
      var all=ids.length===30&&new Set(ids).size===30&&ids.every(id=>idPattern.test(id));
      if(all&&!wrong)u.searchParams.delete('gens');else u.searchParams.set('gens',ids.join(','));
      history.replaceState(null,'',u.toString());
    }
    function cover(paper){
      var seen=new Map();paper.questions.forEach(x=>{var key=x.sourceRound+'-'+x.sourceNo;if(!seen.has(key))seen.set(key,x);});
      var list=Array.from(seen.values()).sort((a,b)=>a.sourceRound-b.sourceRound||a.sourceNo-b.sourceNo).map(x=>{var key=x.sourceRound+'-'+x.sourceNo,label=important?'파이널 '+x.sourceRound+'회 '+x.sourceNo+'번':'원문 '+x.sourceNo+'번';return '<label class="f1-check"><input type="checkbox" data-source="'+key+'"'+(checked.has(key)?' checked':'')+' aria-label="'+label+' 해결 체크"><span><b>'+label+'</b><span class="f1-check-type">'+esc(x.importantTypeTitle||x.detailType)+'</span></span></label>';}).join('');
      return sheet('f1-cover cover-page','<div class="f1-mast"><div class="f1-brand">지필드 영재교육</div><div class="f1-issue">'+labels[band]+' / '+paper.questions.length+'문항</div></div><div class="f1-cover-heading"><div class="f1-owner">'+(student?esc(student)+' 학생의':'이름 ____________________')+'</div><h1>'+roundLabel+(important?'':' <span>약점 유형</span>')+'</h1></div><div class="f1-check-title">'+(wrong?'오답':'선택')+' 유형 자기 점검</div><p class="lead">풀이를 보지 않고 다시 풀 수 있으면 체크하세요.</p><div class="f1-checks">'+list+'</div><div class="f1-rule">'+(important?'검수 문제 3개를 기준으로 같은 유형의 새 문제를 이어서 공부합니다.':fresh?'검수된 유사문제 3개와 같은 원문 유형의 새 문제를 이어서 공부합니다.':'원문 한 문제마다 유사문제 3개씩 공부합니다.')+' 체크는 성적에 반영되지 않습니다.</div>');
    }
    function questionPage(group,n,total){
      var reportRows=reportColumns?(isLast&&round===4?3:Math.min(3,Math.max(1,Math.ceil(group.length/2)))):0;
      var wideLead=layout==='editorial'&&group.length===3&&editorialWide(group[0]);
      var single=(layout==='editorial'||isMiddle)&&group.length===1;
      var twoWithWide=layout==='editorial'&&group.length===2&&group.some(editorialWide);
      var writeLines=Array.from({length:single?10:3},()=>'<span class="f1-write-line"></span>').join('');
      var rowCount=isMiddle?Math.ceil(group.reduce((sum,x)=>sum+(layout==='editorial'&&editorialWide(x)?2:1),0)/2):0;
      var html='<div class="f1-qpage qpage" data-wide-lead="'+String(wideLead)+'"'+(reportColumns?' data-report-columns="true" data-report-rows="'+reportRows+'" style="grid-auto-flow:column;grid-template-rows:auto repeat('+reportRows+',minmax(0,1fr))"':rowCount?' style="grid-template-rows:auto repeat('+rowCount+',minmax(0,1fr))"':'')+'><div class="f1-qhead qhead"><span>'+roundLabel+' 약점 유형</span><small>문제 '+n+' / '+total+'</small></div>';
      group.forEach((x,index)=>{
        var legacyGiven=bankCode==='final1'&&[12,14,23].includes(Number(x.sourceNo))&&Array.isArray(x.conditionLines)?x.conditionLines:[];
        var promptText=[x.stemHtml||x.text].concat(legacyGiven).filter(Boolean).join(' ');
        var given=Array.isArray(x.promptDataLines)&&x.promptDataLines.length?x.promptDataLines:[];
        var givenBlock=given.length?'<div class="f1-qgiven"><b>'+esc(x.promptDataLabel||'주어진 조건')+'</b><div class="f1-qgiven-lines">'+given.map(t=>'<span>'+mathText(t)+'</span>').join('')+'</div></div>':'';
        var sourceLabel=important?'파이널 '+x.sourceRound+'회 '+x.sourceNo+'번':'원문 '+x.sourceNo+'번';
        html+='<article class="f1-qcard qcard"'+(reportColumns?' style="grid-column:'+String(Math.floor(index/reportRows)+1)+';grid-row:'+String(index%reportRows+2)+'"':'')+' data-index="'+x.index+'" data-source-no="'+x.sourceNo+'" data-source-round="'+x.sourceRound+'" data-points="'+esc(x.pointBand)+'" data-gen="'+esc(x.genId)+'" data-wide="'+String(layout==='editorial'&&editorialWide(x))+'"><div class="f1-qcard-head"><span class="f1-qno">'+x.index+'.</span><span class="f1-qtype">['+esc(x.importantTypeTitle||x.detailType)+']</span></div><div class="f1-qtext qtext">'+mathText(promptText)+'</div>'+givenBlock+essentialBlock(x)+'<div class="f1-qmeta qmeta fixed-item" data-item-id="'+esc(x.id)+'">'+sourceLabel+' / '+(x.reviewStatus==='runtime-verified'?'새 문제 '+(x.variantNo-3):'유사문제 '+x.variantNo)+(x.variantRoleLabel?' · '+esc(x.variantRoleLabel):'')+' / '+(x.sourceEquivalentConfirmed===false?'원문 참고 배점 ':'')+esc(x.pointBand)+'점</div>'+(x.asset?'<div class="f1-qfigure qfigure">'+raster(x.asset,'')+'</div>':'')+'<div class="f1-workspace" aria-hidden="true">'+writeLines+'</div><div class="f1-answerline answerline"><span>답</span><span class="f1-answer-blank" aria-hidden="true"></span></div></article>';
      });
      var lastTwo=layout==='editorial'&&n===total&&group.length===2&&group.every(x=>!editorialWide(x));
      return sheet('question-page'+(lastTwo?' f1-last-two':'')+(single?' f1-single-question':'')+(twoWithWide?' f1-two-with-wide':'')+(group.length===1&&largeFigure(group[0])?' f1-large-figure':''),html+'</div>');
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
      if(fresh&&band!=='all'&&band!=='2.7')fresh=false;
      var current=++revision;print.disabled=true;pageRoot.innerHTML='';root.querySelector('#f1Status').textContent='문항을 불러오는 중입니다.';
      root.dataset.layout=layout;root.querySelector('#pageLayout').value=layout;root.querySelector('#printMode').value=mode;root.querySelectorAll('[data-role=points]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===band)));
      root.querySelectorAll('[data-role=view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===orderMode)));
      root.querySelectorAll('[data-role=count]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.val)===requestedCount)));
      var freshButton=root.querySelector('[data-role=fresh]');if(freshButton){freshButton.setAttribute('aria-pressed',String(fresh));freshButton.disabled=band!=='all'&&band!=='2.7';}
      if(freshAvailable)root.querySelector('.f1-counts').style.display=fresh?'':'none';
      try{
        var paper=await global.BANK_FIXED.buildPaper({bankCode:bankCode,genIds:important?null:ids.slice(),typeIds:important?ids.slice():null,n:requestedCount,pointBand:band,orderMode:orderMode,fresh:fresh,wrongPracticeMode:wrong});if(current!==revision)return;
        if(!paper.questions.length){cleanUrl();root.querySelector('#f1Status').textContent='선택한 배점대의 '+(wrong?'오답':'문항')+'이 없습니다.';return;}
        var pages=[],groups=questionGroups(paper.questions,layout,reportColumns);
        function assemblePages(){pages=[];
        if(mode==='questions'||mode==='both'){
          pages.push(cover(paper));groups.forEach((g,i)=>pages.push(questionPage(g,i+1,groups.length)));
          if(mode==='both'&&(1+groups.length)%2===1)pages.push('<section class="f1-page page duplex-blank"><span>양면 인쇄용 빈 면 · 답안은 새 종이 앞면에서 시작합니다.</span></section>');
        }
        if(mode==='answers'||mode==='both')pages.push(answerPages(paper.questions));if(mode==='quick')pages.push(quickPages(paper.questions));
        pageRoot.innerHTML=pages.join('');}
        assemblePages();cleanUrl();
        if(signature&&!wrong){
          pageRoot.querySelectorAll('.f1-cover-heading h1').forEach(node=>{node.textContent=roundLabel+' 전체 유형';});
          pageRoot.querySelectorAll('.f1-qhead span').forEach(node=>{node.textContent=roundLabel+' 전체 유형';});
        }
        await Promise.all([document.fonts.ready].concat(Array.from(pageRoot.querySelectorAll('img')).map(img=>img.decode())));
        // Reuse the same approved cards. Only Middle 7 reduces page density
        // when a full-size prompt or figure will not fit; never shrink the text.
        function fitMiddle7Groups(){
        if(isMiddle&&(mode==='questions'||mode==='both')&&pageRoot.querySelector('.qpage')&&getComputedStyle(pageRoot.querySelector('.qpage')).display==='grid'){
          for(var attempt=0;attempt<5;attempt++){
            var bad=Array.from(pageRoot.querySelectorAll('.question-page')).map((page,index)=>
              Array.from(page.querySelectorAll('.qcard')).some(card=>card.scrollHeight>card.clientHeight+1)?index:-1).filter(i=>i>=0);
            if(!bad.length)break;
            groups=groups.flatMap((group,index)=>{
              if(!bad.includes(index))return [group];
              if(group.length===1)throw Error('이 문항의 인쇄 영역을 확인해 주세요.');
              return chunks(group,group.length>4?4:group.length>2?2:1);
            });
            assemblePages();
          }
        }
        }
        fitMiddle7Groups();
        await Promise.all(Array.from(pageRoot.querySelectorAll('img')).map(img=>img.decode()));
        compactAnswerPages();
        var watermarkName=student||global.BANK_CORE.getStudentName()||'학습 자료';
        pageRoot.querySelectorAll('.wm-layer').forEach(layer=>global.BANK_CORE.buildWatermarkTiles(layer,watermarkName));
        if(isMiddle)preparePrint=function(){
          if(current!==revision)return;
          assemblePages();fitMiddle7Groups();compactAnswerPages();
          pageRoot.querySelectorAll('.wm-layer').forEach(layer=>global.BANK_CORE.buildWatermarkTiles(layer,watermarkName));
        };
        if(current!==revision)return;root.querySelector('#f1Status').textContent=paper.questions.length+'문항 / '+labels[band]+' / '+(layout==='editorial'?'읽기 편한 4문항':'간결한 6문항')+' / '+(fresh?'새 문제 '+paper.generatedCount+'개 포함':important?'선택 유형':(orderMode==='grouped'?'문제별로 보기':'섞어서 보기'));print.disabled=false;
      }catch(error){if(current!==revision)return;pageRoot.innerHTML='';root.querySelector('#f1Status').innerHTML='<div class="f1-error" role="alert">'+esc(error.message||'문항을 불러오지 못했습니다.')+'</div>';}
    }
    root.querySelectorAll('[data-role=points]').forEach(b=>b.addEventListener('click',()=>{band=b.dataset.val;render();}));
    root.querySelectorAll('[data-role=view]').forEach(b=>b.addEventListener('click',()=>{orderMode=b.dataset.val;render();}));
    root.querySelectorAll('[data-role=count]').forEach(b=>b.addEventListener('click',()=>{requestedCount=Number(b.dataset.val);render();}));
    if(freshAvailable)root.querySelector('[data-role=fresh]').addEventListener('click',()=>{if(band!=='all'&&band!=='2.7')return;fresh=!fresh;render();});
    root.querySelector('#pageLayout').addEventListener('change',e=>{layout=e.target.value;render();});
    root.querySelector('#printMode').addEventListener('change',e=>{mode=e.target.value;render();});
    root.addEventListener('change',e=>{if(e.target.matches('.f1-check input')){var key=e.target.dataset.source;if(e.target.checked)checked.add(key);else checked.delete(key);}});
    print.addEventListener('click',()=>{if(!print.disabled)global.print();});render();
    if(isMiddle){
      global.addEventListener('beforeprint',()=>{if(preparePrint)preparePrint();});
      global.matchMedia('print').addEventListener('change',event=>{if(event.matches&&preparePrint)preparePrint();});
    }
  }
  global.FINAL1_WORKSHEET={mount:mount};
})(window);
