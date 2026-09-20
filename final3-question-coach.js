(function(root){
  'use strict';

  var activeCard=null;
  var activeSolution=null;
  var activeStep=0;
  var wiredRoot=null;

  function compact(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function byNo(no){
    var data=root.GFIELD_FINAL3_DETAILED;
    if(!data||!Array.isArray(data.items)) return null;
    var matches=data.items.filter(function(item){return Number(item.no)===Number(no)&&item.reviewStatus==='verified'&&item.releaseStatus==='eligible';});
    return matches.length===1?matches[0]:null;
  }
  function icon(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"></path><path d="M9 9h6M9 12h4"></path></svg>';
  }
  function addStyles(){
    if(document.getElementById('final3-question-coach-style')) return;
    var style=document.createElement('style');
    style.id='final3-question-coach-style';
    style.textContent=[
      '.final3-coach-launch{min-height:44px;margin:12px 0 2px;padding:9px 14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #2456c4;border-radius:6px;color:#1d469f;background:#f7f9ff;font:750 14px/1.35 Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif;cursor:pointer}',
      '.final3-coach-launch:hover{background:#eaf0ff}.final3-coach-launch:focus-visible,.final3-coach-dialog button:focus-visible,.final3-coach-dialog input:focus-visible{outline:3px solid #93b4ff;outline-offset:2px}',
      '.final3-coach-launch svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}',
      '.final3-coach-dialog{box-sizing:border-box;width:min(640px,calc(100vw - 32px));max-height:min(780px,calc(100dvh - 32px));margin:auto;padding:0;overflow:hidden;border:1px solid #9eabba;border-radius:8px;color:#182230;background:#fff;box-shadow:0 24px 80px rgba(24,34,48,.24);font-family:Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif}',
      '.final3-coach-dialog *{box-sizing:border-box}.final3-coach-dialog::backdrop{background:rgba(24,34,48,.48)}',
      '.final3-coach-shell{display:grid;grid-template-rows:auto auto minmax(170px,1fr) auto;max-height:inherit}',
      '.final3-coach-head{padding:18px 20px 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid #d8dee8}',
      '.final3-coach-kicker{margin:0 0 4px;color:#2456c4;font-size:11px;font-weight:850;letter-spacing:.08em}.final3-coach-head h2{margin:0;font-size:21px;line-height:1.3;letter-spacing:-.03em}',
      '.final3-coach-close{width:44px;height:44px;flex:0 0 44px;border:1px solid #9eabba;border-radius:6px;color:#344054;background:#fff;font-size:22px;cursor:pointer}',
      '.final3-coach-context{padding:12px 20px;border-bottom:1px solid #d8dee8;background:#f7f9fc}.final3-coach-context strong{display:block;margin-bottom:3px;font-size:12px}.final3-coach-context p{margin:0;color:#566274;font-size:13px;line-height:1.5}',
      '.final3-coach-log{min-height:190px;padding:18px 20px;overflow-y:auto;background:#fff}',
      '.final3-coach-message{max-width:94%;margin:0 0 12px}.final3-coach-message small{display:block;margin:0 0 4px;color:#667085;font-size:11px;font-weight:800}.final3-coach-message p{margin:0;padding:11px 13px;border:1px solid #d8dee8;border-left:3px solid #2456c4;border-radius:6px;background:#f7f9ff;color:#253142;font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word}',
      '.final3-coach-actions{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0 14px}.final3-coach-action,.final3-coach-faq{min-height:40px;padding:8px 11px;border:1px solid #9eabba;border-radius:5px;color:#344054;background:#fff;font:700 13px/1.35 inherit;cursor:pointer}.final3-coach-action:hover,.final3-coach-faq:hover{border-color:#2456c4;color:#1d469f;background:#f7f9ff}',
      '.final3-coach-controls{padding:14px 20px 18px;border-top:1px solid #d8dee8;background:#fff}.final3-coach-faq-title{margin:0 0 8px;font-size:13px;font-weight:800}.final3-coach-faqs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}',
      '.final3-coach-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.final3-coach-input{min-height:46px;width:100%;padding:10px 12px;border:1px solid #566274;border-radius:6px;color:#182230;background:#fff;font:400 16px/1.45 inherit}.final3-coach-send{min-width:78px;min-height:46px;padding:9px 15px;border:1px solid #2456c4;border-radius:6px;color:#fff;background:#2456c4;font:800 14px/1 inherit;cursor:pointer}',
      '.final3-coach-note{margin:8px 0 0;color:#667085;font-size:11px;line-height:1.45}',
      '@media(max-width:560px){.final3-coach-launch{width:100%}.final3-coach-dialog{width:100%;max-width:none;max-height:88dvh;margin:auto 0 0;border-radius:8px 8px 0 0}.final3-coach-head{padding:15px 16px 11px}.final3-coach-context{padding:10px 16px}.final3-coach-log{padding:14px 16px}.final3-coach-controls{padding:12px 16px max(16px,env(safe-area-inset-bottom))}.final3-coach-form{grid-template-columns:1fr}.final3-coach-send{width:100%}}',
      '@media print{.final3-coach-launch,.final3-coach-dialog{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }
  function dialog(){
    var node=document.getElementById('final3-question-coach-dialog');
    if(node) return node;
    node=document.createElement('dialog');
    node.id='final3-question-coach-dialog';
    node.className='final3-coach-dialog no-print';
    node.setAttribute('aria-labelledby','final3-question-coach-title');
    node.innerHTML='<div class="final3-coach-shell"><header class="final3-coach-head"><div><p class="final3-coach-kicker">G·FIELD 문제 질문 도우미</p><h2 id="final3-question-coach-title">어느 부분이 이해되지 않나요?</h2></div><button type="button" class="final3-coach-close" aria-label="닫기">×</button></header><section class="final3-coach-context"><strong>지금 보고 있는 원문 풀이</strong><p></p></section><div class="final3-coach-log" role="log" aria-live="polite"></div><section class="final3-coach-controls"><p class="final3-coach-faq-title">궁금한 내용을 선택하세요.</p><div class="final3-coach-faqs"></div><form class="final3-coach-form"><input class="final3-coach-input" type="text" autocomplete="off" placeholder="예: 2단계가 이해되지 않아요"><button class="final3-coach-send" type="submit">질문하기</button></form><p class="final3-coach-note">파이널 3회 검수 풀이를 선생님 설명 순서대로 보여 줍니다. 외부 AI나 API를 사용하지 않습니다.</p></section></div>';
    document.body.appendChild(node);
    node.querySelector('.final3-coach-close').addEventListener('click',function(){node.close();});
    node.addEventListener('click',function(event){if(event.target===node)node.close();});
    node.querySelector('form').addEventListener('submit',function(event){event.preventDefault();var input=node.querySelector('.final3-coach-input');var value=compact(input.value);if(!value)return;input.value='';answerQuestion(value);});
    return node;
  }
  function log(){return dialog().querySelector('.final3-coach-log');}
  function append(text){
    var wrap=document.createElement('div');wrap.className='final3-coach-message';
    var label=document.createElement('small');label.textContent='풀이 도우미';
    var body=document.createElement('p');body.textContent=text;
    wrap.append(label,body);log().appendChild(wrap);log().scrollTop=log().scrollHeight;return wrap;
  }
  function actions(parent,specs){
    var row=document.createElement('div');row.className='final3-coach-actions';
    specs.forEach(function(spec){var button=document.createElement('button');button.type='button';button.className='final3-coach-action';button.textContent=spec.label;button.addEventListener('click',spec.run);row.appendChild(button);});
    parent.after(row);log().scrollTop=log().scrollHeight;
  }
  function concept(){
    var figure=activeSolution.diagram?'그림 전체를 한꺼번에 보지 말고, 문제에서 묻는 모양과 수의 관계부터 찾아볼게요. ':'문장을 짧은 조건으로 나누어 수와 관계를 찾아볼게요. ';
    var message=append(figure+compact(activeSolution.read));
    actions(message,[{label:'이해했어요 · 시작 방법 보기',run:start},{label:'아직 어려워요',run:function(){deeper('문제에서 주어진 것과 구하려는 것을 각각 손으로 짚어 보세요. 그런 다음 「'+compact(activeSolution.read)+'」에서 서로 연결되는 말에 같은 표시를 해 보세요.');}}]);
  }
  function start(){
    var message=append('선생님 풀이의 시작은 이렇습니다. '+compact(activeSolution.method));
    actions(message,[{label:'이해했어요 · 1단계 보기',run:function(){showStep(0);}},{label:'이 시작이 어려워요',run:function(){deeper('아직 계산하지 않아도 됩니다. 먼저 해야 할 일을 한 문장으로 바꾸면 「'+compact(activeSolution.method)+'」입니다. 문제에서 이 방법에 쓰는 조건만 표시해 보세요.');}}]);
  }
  function stepText(index){
    var step=activeSolution.steps[index];
    return (index+1)+'단계 · '+compact(step.title)+'\n'+compact(step.body);
  }
  function showStep(index){
    if(!activeSolution||!activeSolution.steps[index]){finish();return;}
    activeStep=index;
    var message=append(stepText(index));
    var last=index===activeSolution.steps.length-1;
    actions(message,[
      {label:last?'이해했어요 · 검산 보기':'이해했어요 · 다음 단계',run:function(){if(last)finish();else showStep(index+1);}},
      {label:'이 부분이 어려워요',run:function(){deepenStep(index);}},
      {label:'앞 단계 다시 보기',run:function(){if(index>0)showStep(index-1);else start();}}
    ]);
  }
  function deepenStep(index){
    var step=activeSolution.steps[index];
    var sentences=compact(step.body).split(/(?<=[.!?。]|입니다|됩니다|합니다)\s+/).filter(Boolean);
    var focus=sentences.length>1?sentences.join('\n→ '):compact(step.body);
    deeper('이 단계만 더 작게 나누어 볼게요.\n→ '+focus+'\n계산값보다 지금 사용한 조건이 무엇인지 먼저 말해 보세요.',function(){showStep(index);});
  }
  function deeper(text,next){
    var message=append('더 자세히 설명할게요.\n'+text);
    actions(message,[{label:'이해했어요',run:next||function(){showStep(activeStep);}},{label:'선생님과 확인할래요',run:function(){append('좋아요. 이 문항 번호와 지금 막힌 단계를 선생님께 보여 주세요. 위 상세 풀이의 해당 단계도 함께 표시해 두면 좋습니다.');}}]);
  }
  function finish(){
    var message=append('마지막으로 확인해 볼게요. '+compact(activeSolution.check)+'\n주의할 점 · '+compact(activeSolution.caution));
    actions(message,[{label:'처음부터 다시 보기',run:concept},{label:'막힌 단계 고르기',run:chooseStep}]);
  }
  function chooseStep(){
    var message=append('어느 단계가 이해되지 않았나요?');
    actions(message,activeSolution.steps.map(function(step,index){return {label:(index+1)+'단계 · '+compact(step.title),run:function(){showStep(index);}};}));
  }
  function answerQuestion(query){
    append('학생 질문 · '+query);
    var match=query.match(/([1-9]|10)\s*단계/);
    if(match&&activeSolution.steps[Number(match[1])-1]){showStep(Number(match[1])-1);return;}
    if(/개념|무슨 뜻|모르/.test(query)){concept();return;}
    if(/시작|처음|어떻게 풀/.test(query)){start();return;}
    if(/검산|맞는지|확인/.test(query)){finish();return;}
    if(/주의|실수|틀린/.test(query)){append('이 문제에서 가장 조심할 점은 「'+compact(activeSolution.caution)+'」입니다. 어느 단계에서 이 조건을 놓쳤는지 단계 버튼으로 확인해 보세요.');chooseStep();return;}
    chooseStep();
  }
  function faq(label,run){var button=document.createElement('button');button.type='button';button.className='final3-coach-faq';button.textContent=label;button.addEventListener('click',run);return button;}
  function open(card,solution){
    activeCard=card;activeSolution=solution;activeStep=0;
    var node=dialog();
    node.querySelector('.final3-coach-context p').textContent='파이널 3회 '+solution.no+'번 · '+compact(solution.title);
    node.querySelector('.final3-coach-log').replaceChildren();
    append('답을 보아도 이해되지 않는 부분을 골라 주세요. 한 번에 모두 보여 주지 않고, 이해한 만큼 다음 단계로 설명해 드릴게요.');
    var faqs=node.querySelector('.final3-coach-faqs');faqs.replaceChildren(
      faq('개념이 잘 모르겠어요',concept),
      faq('문제를 어떻게 시작하나요?',start),
      faq('한 단계씩 같이 풀어 주세요',function(){showStep(0);}),
      faq('이해 안 된 단계 고르기',chooseStep)
    );
    if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');
  }
  function attach(card){
    if(!card||card.dataset.final3QuestionCoach==='ready')return;
    var no=Number(card.getAttribute('data-detailed-solution-no'));
    var solution=byNo(no);
    if(!solution)return;
    card.dataset.final3QuestionCoach='ready';
    var button=document.createElement('button');button.type='button';button.className='final3-coach-launch no-print';button.innerHTML=icon()+'<span>문제 질문 도우미</span>';
    button.setAttribute('aria-label','파이널 3회 '+no+'번 문제 질문 도우미 열기');
    button.addEventListener('click',function(){open(card,solution);});
    var heading=card.querySelector('.final1-solution-heading');
    if(heading)heading.after(button);else card.appendChild(button);
  }
  function wire(scope){
    addStyles();wiredRoot=scope||document;
    wiredRoot.querySelectorAll('#final3DetailedSolutions .final1-detailed-card.is-ready').forEach(attach);
  }

  root.GFIELD_FINAL3_QUESTION_COACH={wire:wire};
})(window);
