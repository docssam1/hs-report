(function(root){
  'use strict';

  var items=new Map();
  var active=null;
  var stages=[];
  var stageIndex=0;

  function compact(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function questionTarget(text){
    var parts=compact(text).split(/(?<=[.?!요까])\s+/).filter(Boolean);
    return parts[parts.length-1]||compact(text);
  }
  function hasFigure(item){return !!(item&&(item.solutionAsset||item.asset));}
  function figure(item){return item&&(item.solutionAsset||item.asset)||null;}
  function stepReason(index,total){
    if(index===0)return '먼저 풀이의 기준을 정해야 뒤의 계산에서 경우나 조건을 빠뜨리지 않습니다.';
    if(index===total-1)return '앞에서 구한 값을 문제에서 묻는 값으로 정리하고, 단위까지 맞는지 확인하는 단계입니다.';
    return '바로 앞 단계에서 정리한 결과를 다음 조건에 연결하는 과정입니다.';
  }
  function buildStages(item){
    var solutionSteps=Array.isArray(item.solutionSteps)?item.solutionSteps.filter(Boolean):[];
    var rows=[
      {title:'문제에서 무엇을 구하나요?',body:questionTarget(item.text),why:'마지막 질문을 먼저 확인하면 계산해야 할 값과 중간에만 필요한 값을 구분할 수 있습니다.'},
      {title:'어떤 조건부터 봐야 하나요?',body:compact(item.readingFocus)||compact(item.text),why:'문제의 모든 숫자를 한꺼번에 계산하지 않고, 답과 직접 연결되는 조건부터 표시합니다.'},
      {title:'왜 이 방법을 쓰나요?',body:compact(item.solutionSkill)||'조건을 작은 단계로 나누어 차례대로 계산합니다.',why:'문장의 조건을 식·표·그림으로 바꾸면 빠뜨린 경우가 있는지 확인하기 쉽습니다.'}
    ];
    solutionSteps.forEach(function(step,index){
      rows.push({title:(index+1)+'단계 계산',body:compact(step),why:stepReason(index,solutionSteps.length)});
    });
    rows.push({title:'정답을 어떻게 확인하나요?',body:'계산 결과를 문제에서 요구한 말과 단위로 쓰면 정답은 '+compact(item.answer)+'입니다.',why:'마지막에는 구한 값이 질문의 대상과 같은지, 빠뜨린 조건이나 중복해서 센 것이 없는지 다시 확인합니다.',answer:true});
    return rows;
  }
  function shell(){
    var dialog=document.getElementById('gfieldStepCoach');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='gfieldStepCoach';
    dialog.className='gfield-step-coach no-print';
    dialog.setAttribute('aria-labelledby','gfieldStepCoachTitle');
    dialog.innerHTML='<div class="gsc-shell"><header class="gsc-head"><div><small>G·FIELD 단계별 풀이 도우미</small><h2 id="gfieldStepCoachTitle">풀이를 다시 배워 볼까요?</h2></div><button type="button" class="gsc-close" aria-label="닫기">×</button></header><div class="gsc-context"></div><div class="gsc-body" aria-live="polite"></div><div class="gsc-actions"></div></div>';
    document.body.appendChild(dialog);
    dialog.querySelector('.gsc-close').addEventListener('click',function(){dialog.close();});
    dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});
    return dialog;
  }
  function button(label,action,primary){
    var node=document.createElement('button');
    node.type='button';
    node.className='gsc-action'+(primary?' primary':'');
    node.textContent=label;
    node.addEventListener('click',action);
    return node;
  }
  function setActions(specs){
    var area=shell().querySelector('.gsc-actions');
    area.replaceChildren();
    specs.forEach(function(spec){area.appendChild(button(spec.label,spec.action,spec.primary));});
  }
  function imageBlock(item){
    var asset=figure(item);
    if(!asset||asset.kind!=='raster'||!/^data:image\/png;base64,/.test(asset.src||''))return null;
    var wrap=document.createElement('figure');wrap.className='gsc-figure';
    var image=document.createElement('img');image.src=asset.src;image.alt=asset.description||'풀이에 사용하는 그림';
    wrap.appendChild(image);return wrap;
  }
  function showMenu(){
    var dialog=shell(),body=dialog.querySelector('.gsc-body');
    body.replaceChildren();
    var intro=document.createElement('div');intro.className='gsc-message';
    intro.innerHTML='<b>정답은 이미 확인했어요.</b><p>이제 답을 외우지 않고, 어디에서 막혔는지 골라 다시 배워 봅니다.</p>';
    body.appendChild(intro);
    var grid=document.createElement('div');grid.className='gsc-faq';
    [
      ['문제 뜻부터 모르겠어요',function(){showTopic('target');}],
      ['어떤 조건을 써야 하나요?',function(){showTopic('condition');}],
      ['왜 이 방법을 쓰나요?',function(){showTopic('method');}],
      ['그림을 수로 바꾸고 싶어요',function(){showTopic('figure');}],
      ['계산을 한 단계씩 보고 싶어요',startStages]
    ].forEach(function(entry){grid.appendChild(button(entry[0],entry[1],false));});
    body.appendChild(grid);
    setActions([{label:'처음부터 아주 자세히 설명해 주세요',action:startStages,primary:true}]);
  }
  function topicCopy(kind){
    if(kind==='target')return {title:'문제의 마지막 질문부터 확인해요',body:questionTarget(active.text),why:'여기에서 묻는 대상을 먼저 정하면 중간 계산과 최종 답을 헷갈리지 않습니다.'};
    if(kind==='condition')return {title:'답과 직접 연결되는 조건이에요',body:compact(active.readingFocus)||compact(active.text),why:'이 조건을 먼저 표시하고 나머지 조건을 하나씩 연결하면 빠뜨리거나 두 번 세는 실수를 줄일 수 있습니다.'};
    if(kind==='method')return {title:'이 풀이 방법을 고른 이유예요',body:compact(active.solutionSkill)||compact((active.solutionSteps||[])[0]),why:'문장에 흩어진 조건을 계산할 수 있는 순서로 바꾸는 방법입니다.'};
    return {title:hasFigure(active)?'그림에서 필요한 부분만 수로 바꿔요':'문장을 짧은 수와 식으로 바꿔요',body:compact(active.readingFocus)||compact(active.solutionSkill),why:hasFigure(active)?'그림 전체를 한꺼번에 보지 말고, 지금 세거나 비교하는 부분만 표시한 뒤 수로 적습니다.':'한 문장에 한 조건씩 밑줄을 긋고, 같은 대상을 말하는 수끼리 연결합니다.'};
  }
  function showTopic(kind){
    var dialog=shell(),body=dialog.querySelector('.gsc-body'),copy=topicCopy(kind);
    body.replaceChildren();
    var card=document.createElement('section');card.className='gsc-stage-card';
    var title=document.createElement('h3');title.textContent=copy.title;
    var main=document.createElement('p');main.className='gsc-stage-main';main.textContent=copy.body;
    var why=document.createElement('div');why.className='gsc-why';why.innerHTML='<b>왜 이렇게 하나요?</b><p></p>';why.querySelector('p').textContent=copy.why;
    card.append(title,main);
    if(kind==='figure'){
      var visual=imageBlock(active);if(visual)card.appendChild(visual);
    }
    card.appendChild(why);body.appendChild(card);
    setActions([
      {label:'이해했어요 · 다음 단계 보기',action:startStages,primary:true},
      {label:'아직 모르겠어요 · 더 잘게 보기',action:function(){startStages(kind==='target'?0:kind==='condition'?1:2);}},
      {label:'다른 질문 고르기',action:showMenu}
    ]);
  }
  function startStages(from){stages=buildStages(active);stageIndex=Number.isInteger(from)?Math.max(0,Math.min(from,stages.length-1)):0;showStage();}
  function showStage(){
    var dialog=shell(),body=dialog.querySelector('.gsc-body'),row=stages[stageIndex];
    body.replaceChildren();
    var progress=document.createElement('div');progress.className='gsc-progress';progress.innerHTML='<span style="width:'+(((stageIndex+1)/stages.length)*100)+'%"></span>';
    var label=document.createElement('p');label.className='gsc-step-label';label.textContent=(stageIndex+1)+' / '+stages.length;
    var card=document.createElement('section');card.className='gsc-stage-card';
    var title=document.createElement('h3');title.textContent=row.title;
    var main=document.createElement('p');main.className='gsc-stage-main';main.textContent=row.body;
    var why=document.createElement('div');why.className='gsc-why';why.innerHTML='<b>왜 이렇게 하나요?</b><p></p>';why.querySelector('p').textContent=row.why;
    card.append(title,main,why);
    if(stageIndex===1&&hasFigure(active)){var visual=imageBlock(active);if(visual)card.appendChild(visual);}
    body.append(progress,label,card);
    var actions=[];
    if(stageIndex>0)actions.push({label:'이전 단계',action:function(){stageIndex--;showStage();}});
    if(stageIndex<stages.length-1){
      actions.push({label:'이해했어요 · 다음 단계',action:function(){stageIndex++;showStage();},primary:true});
      actions.push({label:'아직 모르겠어요',action:showDeeper});
    }else actions.push({label:'이제 이해했어요 · 마치기',action:function(){shell().close();},primary:true});
    actions.push({label:'질문 목록',action:showMenu});setActions(actions);
  }
  function showDeeper(){
    var body=shell().querySelector('.gsc-body'),row=stages[stageIndex],card=document.createElement('section');
    card.className='gsc-stage-card gsc-deeper';
    var heading=document.createElement('h3');heading.textContent='더 잘게 나누어 볼게요';
    var list=document.createElement('ol');
    var previous=stageIndex>0?stages[stageIndex-1].body:'문제에서 묻는 값을 확인합니다.';
    [
      '앞에서 확인한 내용: '+previous,
      '지금 해야 하는 일: '+row.body,
      stageIndex<stages.length-1?'이 단계가 끝나면 확인할 것: '+stages[stageIndex+1].body:'마지막으로 정답의 대상과 단위를 확인합니다.'
    ].forEach(function(text){var li=document.createElement('li');li.textContent=text;list.appendChild(li);});
    card.append(heading,list);body.appendChild(card);
    setActions([
      {label:stageIndex<stages.length-1?'이해했어요 · 다음 단계':'이해했어요 · 마치기',action:function(){if(stageIndex<stages.length-1){stageIndex++;showStage();}else shell().close();},primary:true},
      {label:'이 단계를 다시 보기',action:showStage},
      {label:'질문 목록',action:showMenu}
    ]);
  }
  function open(item){
    active=item;stages=[];stageIndex=0;
    var dialog=shell();
    dialog.querySelector('.gsc-context').textContent='원문 '+item.sourceNo+'번 · 유사문제 '+item.variantNo+' · '+compact(item.detailType);
    showMenu();
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }
  function attach(container,questionItems){
    (questionItems||[]).forEach(function(item){items.set(String(item.id),item);});
    container.querySelectorAll('.solution-card[data-answer-id]').forEach(function(card){
      if(card.dataset.coachReady==='1')return;
      var item=items.get(String(card.dataset.answerId));if(!item)return;
      var launch=document.createElement('button');
      launch.type='button';launch.className='f1-coach-launch no-print';launch.textContent='풀이를 봐도 모르겠어요';
      launch.addEventListener('click',function(){open(item);});
      card.appendChild(launch);card.dataset.coachReady='1';
    });
  }

  root.GFIELD_QUESTION_COACH={attach:attach,buildStages:buildStages};
})(window);
