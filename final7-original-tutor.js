(function(root){
  'use strict';

  var SOURCE_IMAGE='materials/final_7/002.jpg';
  var SOURCE_IMAGE_Q11='materials/final_7/003.jpg';
  var SOURCE_IMAGE_Q13='materials/final_7/004.jpg';
  var stage=0;
  var tracing=false;

  function button(label,action,primary){
    var node=document.createElement('button');
    node.type='button';
    node.className='f7ot-action'+(primary?' primary':'');
    node.textContent=label;
    node.addEventListener('click',action);
    return node;
  }
  function sourceFigure(problemMode,interactive,guide){
    var wrap=document.createElement('div');
    wrap.className='f7ot-source f7ot-source--'+(problemMode?'problem':'figure');
    var view=problemMode?'45 820 540 380':'65 955 520 230';
    wrap.innerHTML='<svg viewBox="'+view+'" role="img" aria-label="최종 7회 6번 원본 '+(problemMode?'문제':'낚싯줄 그림')+'"><image href="'+SOURCE_IMAGE+'" x="0" y="0" width="1191" height="1684" preserveAspectRatio="xMidYMid slice"></image>'+(interactive?'<path class="f7ot-trace-path" d=""></path>':'')+'</svg>'+(guide?'<canvas class="f7ot-guide" width="520" height="230" aria-hidden="true"></canvas>':'');
    if(interactive)wireTrace(wrap);
    if(guide)paintExactLine(wrap.querySelector('.f7ot-guide'));
    return wrap;
  }
  function q11SourceFigure(){
    var wrap=document.createElement('div');wrap.className='f7ot-source f7ot-source--q11';
    wrap.innerHTML='<svg viewBox="600 120 550 330" role="img" aria-label="최종 7회 11번 원본 문제"><image href="'+SOURCE_IMAGE_Q11+'" x="0" y="0" width="1191" height="1684" preserveAspectRatio="xMidYMid slice"></image></svg>';
    return wrap;
  }
  function q12SourceFigure(){
    var wrap=document.createElement('div');wrap.className='f7ot-source f7ot-source--q12';
    wrap.innerHTML='<svg viewBox="600 745 550 350" role="img" aria-label="최종 7회 12번 원본 문제"><image href="'+SOURCE_IMAGE_Q11+'" x="0" y="0" width="1191" height="1684" preserveAspectRatio="xMidYMid slice"></image></svg>';
    return wrap;
  }
  function q12Diagram(level,highlightLevel,label){
    var x=14,y=14,size=232,parts=['<figure class="f7ot-q12-diagram"><svg viewBox="0 0 260 260" role="img" aria-label="'+label+' 도형">'];
    parts.push('<rect x="14" y="14" width="232" height="232" class="f7ot-q12-outline"></rect>');
    for(var index=0;index<level;index+=1){
      var half=size/2,fill=index===highlightLevel?'f7ot-q12-new':'f7ot-q12-old';
      parts.push('<rect x="'+(x+half)+'" y="'+y+'" width="'+half+'" height="'+half+'" class="'+fill+'"></rect>');
      parts.push('<rect x="'+x+'" y="'+(y+half)+'" width="'+half+'" height="'+half+'" class="'+fill+'"></rect>');
      parts.push('<path d="M '+(x+half)+' '+y+' V '+(y+size)+' M '+x+' '+(y+half)+' H '+(x+size)+'" class="f7ot-q12-line"></path>');
      x+=half;y+=half;size=half;
    }
    parts.push('</svg><figcaption>'+label+'</figcaption></figure>');
    return parts.join('');
  }
  function q12Visual(kind){
    var visual=document.createElement('div');visual.className='f7ot-q12-visual f7ot-q12-visual--'+kind;
    if(kind==='pattern')visual.innerHTML=q12Diagram(1,0,'첫 번째')+q12Diagram(2,1,'두 번째')+'<div class="f7ot-q12-equation"><b>첫 번째</b> 2/4 = 1/2<br><b>두 번째에 새로</b> 2/16 = 1/8</div>';
    if(kind==='sequence')visual.innerHTML='<div class="f7ot-q12-sequence"><span>1/2</span><i>÷4</i><span>1/8</span><i>÷4</i><span>1/32</span><i>÷4</i><span>?</span></div>';
    if(kind==='third')visual.innerHTML=q12Diagram(3,2,'세 번째에 새로 색칠한 두 칸')+'<div class="f7ot-q12-equation"><b>작은 한 칸</b> 1/64<br><b>두 칸</b> 2/64 = 1/32</div>';
    if(kind==='finish')visual.innerHTML=q12Diagram(4,3,'네 번째에 새로 색칠한 두 칸')+'<div class="f7ot-q12-equation"><b>작은 한 칸</b> 1/256<br><b>두 칸</b> 2/256 = 1/128</div>';
    return visual;
  }
  function q13SourceFigure(){
    var wrap=document.createElement('div');wrap.className='f7ot-source f7ot-source--q13';
    wrap.innerHTML='<svg viewBox="45 125 530 265" role="img" aria-label="최종 7회 13번 원본 문제"><image href="'+SOURCE_IMAGE_Q13+'" x="0" y="0" width="1191" height="1684" preserveAspectRatio="xMidYMid slice"></image></svg>';
    return wrap;
  }
  function q13Visual(kind){
    var visual=document.createElement('div');visual.className='f7ot-q13-visual f7ot-q13-visual--'+kind;
    if(kind==='groups')visual.innerHTML='<div class="f7ot-q13-groups"><span><b>1</b><small>1개</small></span><span><b>2 2</b><small>2개</small></span><span><b>1 1 1</b><small>3개</small></span><span><b>2 2 2 2</b><small>4개</small></span><span><b>1 1 1 1 1</b><small>5개</small></span></div>';
    if(kind==='boundary')visual.innerHTML='<div class="f7ot-q13-boundary"><b>1부터 20까지</b><strong>210개</strong><span>+</span><b>21+22+23+24</b><strong>90개</strong><em>210+90=300</em></div>';
    if(kind==='pairs')visual.innerHTML='<div class="f7ot-q13-pairs"><span>(1, 2)</span><span>(3, 4)</span><span>(5, 6)</span><i>…</i><span>(23, 24)</span></div><div class="f7ot-q13-pair-rule"><b>두 묶음마다</b><strong>2가 1개 더 많음</strong><b>모두 12쌍</b></div>';
    return visual;
  }
  function q11Visual(kind){
    var visual=document.createElement('div');visual.className='f7ot-math-scene f7ot-math-scene--'+kind;
    if(kind==='chairs')visual.innerHTML='<div><small>전체 의자</small><strong>41개</strong></div><span>→</span><div><small>마지막 5인용</small><strong>3명</strong></div><span>→</span><div class="active"><small>가득 찬 의자</small><strong>40개 · 122명</strong></div>';
    if(kind==='difference')visual.innerHTML='<div><small>2인용</small><strong class="f7ot-seats">● ●</strong></div><span class="f7ot-math-sign">5 − 2</span><div><small>5인용</small><strong class="f7ot-seats">● ● ● ● ●</strong></div><b class="f7ot-scene-answer">차이 3자리</b>';
    if(kind==='assume')visual.innerHTML='<div><small>40개를 모두 2인용으로 우기기</small><strong>40 × 2 = 80명</strong></div><span>→</span><div class="active"><small>실제 가득 앉은 사람</small><strong>122명</strong></div><b class="f7ot-scene-answer">122 − 80 = 42명</b>';
    if(kind==='finish')visual.innerHTML='<div><small>3명씩 늘려 42명 채우기</small><strong>42 ÷ 3 = 14개</strong></div><span>+</span><div><small>마지막 불완전 5인용</small><strong>1개</strong></div><b class="f7ot-scene-answer">14 + 1 = 15개</b>';
    return visual;
  }
  function paintExactLine(canvas){
    var source=new Image();
    source.onload=function(){
      var width=520,height=230,sourceCanvas=document.createElement('canvas'),maskCanvas=document.createElement('canvas');
      sourceCanvas.width=maskCanvas.width=width;sourceCanvas.height=maskCanvas.height=height;
      var sourceContext=sourceCanvas.getContext('2d',{willReadFrequently:true}),maskContext=maskCanvas.getContext('2d',{willReadFrequently:true});
      sourceContext.drawImage(source,65,955,520,230,0,0,width,height);
      maskContext.strokeStyle='#000';maskContext.lineWidth=14;maskContext.lineCap='round';maskContext.lineJoin='round';
      var guidePaths=[
        new Path2D('M27 105 C90 105 150 105 205 105 C280 105 385 103 475 105'),
        new Path2D('M175 80 C192 62 207 48 228 45 C250 42 270 58 270 84 C270 96 260 104 245 105'),
        new Path2D('M175 80 C180 108 203 132 228 140 C255 149 285 145 310 140'),
        new Path2D('M305 76 C315 56 340 44 360 52 C373 62 371 80 358 92 C345 112 330 128 310 140'),
        new Path2D('M305 76 C300 103 314 117 332 112 C344 105 352 97 358 92'),
        new Path2D('M310 140 C350 125 398 100 455 75'),
        new Path2D('M370 105 C415 105 465 102 485 112 C505 126 501 157 480 173 C456 191 414 185 392 160 C382 150 382 141 386 133')
      ];
      guidePaths.forEach(function(path){maskContext.stroke(path);});
      var pixels=sourceContext.getImageData(0,0,width,height),mask=maskContext.getImageData(0,0,width,height),out=canvas.getContext('2d').createImageData(width,height);
      for(var offset=0;offset<pixels.data.length;offset+=4){
        var red=pixels.data[offset],green=pixels.data[offset+1],blue=pixels.data[offset+2],light=.299*red+.587*green+.114*blue;
        if(mask.data[offset+3]===0||light>=145||Math.max(red,green,blue)-Math.min(red,green,blue)>90)continue;
        var pixel=offset/4,x=pixel%width,y=Math.floor(pixel/width),dense=0;
        for(var dy=-3;dy<=3;dy+=1)for(var dx=-3;dx<=3;dx+=1){
          var nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
          var nearby=(ny*width+nx)*4,nr=pixels.data[nearby],ng=pixels.data[nearby+1],nb=pixels.data[nearby+2];
          if((.299*nr+.587*ng+.114*nb)<145&&Math.max(nr,ng,nb)-Math.min(nr,ng,nb)<=90)dense+=1;
        }
        if(dense>35)continue;
        for(var oy=-1;oy<=1;oy+=1)for(var ox=-1;ox<=1;ox+=1){
          var px=x+ox,py=y+oy;if(px<0||py<0||px>=width||py>=height)continue;
          var target=(py*width+px)*4;out.data[target]=255;out.data[target+1]=111;out.data[target+2]=0;out.data[target+3]=205;
        }
      }
      var outputContext=canvas.getContext('2d');outputContext.putImageData(out,0,0);
      outputContext.strokeStyle='rgba(255,111,0,.46)';outputContext.lineWidth=2.2;outputContext.lineCap='round';outputContext.lineJoin='round';
      guidePaths.forEach(function(path){outputContext.stroke(path);});
    };
    source.src=SOURCE_IMAGE;
  }
  function svgPoint(svg,event){
    var point=svg.createSVGPoint();
    point.x=event.clientX;point.y=event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  function wireTrace(wrap){
    var svg=wrap.querySelector('svg'),path=wrap.querySelector('.f7ot-trace-path'),points=[];
    function begin(event){
      tracing=true;points=[];svg.setPointerCapture(event.pointerId);
      var p=svgPoint(svg,event);points.push([p.x,p.y]);path.setAttribute('d','M'+p.x+' '+p.y);event.preventDefault();
    }
    function move(event){
      if(!tracing)return;
      var p=svgPoint(svg,event);points.push([p.x,p.y]);
      path.setAttribute('d','M'+points.map(function(pair){return pair[0].toFixed(1)+' '+pair[1].toFixed(1);}).join(' L'));
      event.preventDefault();
    }
    function end(){tracing=false;}
    svg.addEventListener('pointerdown',begin);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  }
  function dialog(){
    var node=document.getElementById('final7OriginalTutor');
    if(node)return node;
    node=document.createElement('dialog');node.id='final7OriginalTutor';node.className='f7ot-dialog no-print';node.setAttribute('aria-labelledby','f7otTitle');
    node.innerHTML='<div class="f7ot-shell"><header class="f7ot-head"><div><small>선생님 대본으로 배우는 원문 풀이</small><h2 id="f7otTitle">최종 7회 6번 · 낚싯줄 따라가기</h2></div><button type="button" class="f7ot-close" aria-label="닫기">×</button></header><div class="f7ot-body" aria-live="polite"></div><div class="f7ot-actions"></div></div>';
    document.body.appendChild(node);
    node.querySelector('.f7ot-close').addEventListener('click',function(){node.close();});
    node.addEventListener('click',function(event){if(event.target===node)node.close();});
    return node;
  }
  function progress(){return '<div class="f7ot-progress" aria-label="풀이 단계">'+[0,1,2,3,4].map(function(_,index){return '<i class="'+(index<=stage?'on':'')+'"></i>';}).join('')+'</div>';}
  function setActions(specs){
    var area=dialog().querySelector('.f7ot-actions');area.replaceChildren();
    specs.forEach(function(spec){area.appendChild(button(spec.label,spec.action,spec.primary));});
  }
  function render(shellBuilder,actions){
    var body=dialog().querySelector('.f7ot-body');body.replaceChildren();
    var progressNode=document.createElement('div');progressNode.innerHTML=progress();body.appendChild(progressNode.firstChild);
    body.appendChild(shellBuilder());setActions(actions);
  }
  function stageShell(title,speech,visual){
    var section=document.createElement('section');section.className='f7ot-stage';
    var heading=document.createElement('h3');heading.textContent=title;
    var teacher=document.createElement('p');teacher.className='f7ot-teacher';teacher.textContent=speech;
    section.append(heading,teacher);if(visual)section.appendChild(visual);return section;
  }
  function showOriginal(){
    stage=0;render(function(){
      var section=stageShell('먼저 원문을 다시 볼까요?','다른 풀이를 섞지 않고, 선생님이 수업에서 설명한 순서대로 한 단계씩 볼게요.',sourceFigure(true,false,false));
      var note=document.createElement('p');note.className='f7ot-note';note.textContent='원본 문제 그림은 바꾸지 않았습니다. 풀이 표시는 다음 단계에서만 따로 나타납니다.';section.appendChild(note);return section;
    },[{label:'6번 풀이 시작',action:showRule,primary:true}]);
  }
  function showRule(){
    stage=1;render(function(){
      var section=stageShell('같은 방향을 보는 기준을 기억해요','낚싯줄을 쭉 폈을 때 같은 방향이 되려면, 앞 물고기의 꼬리와 다음 물고기의 머리가 만나겠죠? 기억나나요?',sourceFigure(false,false,false));
      var rule=document.createElement('div');rule.className='f7ot-rule';rule.innerHTML='<span><b>꼬리 + 머리</b><br>같은 방향</span><span><b>꼬리 + 꼬리</b><br>반대 방향</span>';section.appendChild(rule);return section;
    },[
      {label:'기억나요 · 손으로 따라가 볼게요',action:showTrace,primary:true},
      {label:'모르겠어요 · 선을 이어서 보여 주세요',action:showGuide}
    ]);
  }
  function showTrace(){
    stage=2;render(function(){
      var section=stageShell('손으로 낚싯줄을 그어 볼까요?','앞에서 뒤까지 검지나 마우스로 낚싯줄을 천천히 따라 그어 보세요. 교차한 곳에서도 지금 따라가던 줄을 놓치지 마세요.',sourceFigure(false,true,false));
      var note=document.createElement('p');note.className='f7ot-note';note.textContent='그림 위를 직접 그어도 원본에는 저장되지 않습니다.';section.appendChild(note);return section;
    },[
      {label:'다 그었어요 · 이어서 판단할게요',action:showJudge,primary:true},
      {label:'모르겠어요 · 선을 이어서 보여 주세요',action:showGuide},
      {label:'기준 다시 보기',action:showRule}
    ]);
  }
  function showGuide(){
    stage=3;render(function(){
      var visual=sourceFigure(false,false,true);var section=stageShell('선생님 손을 따라 줄을 이어 볼게요','앞에서 출발해 주황색 선이 이어지는 쪽을 눈으로 따라가세요. 선이 교차해도 옆 선으로 넘어가지 않습니다.',visual);
      requestAnimationFrame(function(){var guide=visual.querySelector('.f7ot-guide');if(guide)guide.classList.add('is-playing');});
      var rule=document.createElement('div');rule.className='f7ot-rule';rule.innerHTML='<span><b>꼬리와 머리</b>면 같은 방향</span><span><b>꼬리와 꼬리</b>면 반대 방향</span>';section.appendChild(rule);return section;
    },[
      {label:'이해되었어요 · 물고기를 셀게요',action:showJudge,primary:true},
      {label:'한 번 더 이어서 보기',action:showGuide},
      {label:'직접 다시 그어 보기',action:showTrace}
    ]);
  }
  function showJudge(){
    stage=4;render(function(){
      var section=stageShell('이제 한 마리씩 판단해요','줄을 따라가며 “꼬리와 머리니까 돼요, 꼬리와 꼬리니까 안 돼요”라고 말해 보세요. 앞쪽을 보는 물고기에만 하나씩 표시하면 여섯 마리입니다.',sourceFigure(false,false,false));
      var answer=document.createElement('div');answer.className='f7ot-answer';answer.innerHTML='앞쪽을 바라보는 물고기<strong>6마리</strong>';section.appendChild(answer);return section;
    },[
      {label:'이해했어요 · 마치기',action:function(){dialog().close();},primary:true},
      {label:'선 이어 보기',action:showGuide},
      {label:'처음부터 다시 보기',action:showOriginal}
    ]);
  }
  function showQ11Original(){
    stage=0;dialog().querySelector('#f7otTitle').textContent='최종 7회 11번 · 우기기';render(function(){
      var section=stageShell('먼저 원문을 다시 볼까요?','선생님 대본의 순서대로 마지막 의자를 먼저 정리하고, 우기기의 첫 번째 차이부터 계산할게요.',q11SourceFigure());
      return section;
    },[{label:'11번 풀이 시작',action:function(){showQ11Chairs(false);},primary:true}]);
  }
  function showQ11Chairs(deeper){
    stage=1;render(function(){
      var speech=deeper?'전체 의자는 41개지만 마지막 5인용 의자는 3명만 앉았어요. 그래서 가득 찬 의자는 41-1=40개이고, 그 40개에 앉은 사람은 125-3=122명입니다.':'마지막 5인용 의자에는 3명이 앉았죠. 그러면 가득 찬 의자는 40개이고, 거기에 앉은 사람은 122명이라고 할 수 있겠죠? 이해됐나요?';
      return stageShell(deeper?'마지막 의자 하나를 따로 떼어 볼게요':'우기기 전에 마지막 의자를 정리해요',speech,q11Visual('chairs'));
    },[
      {label:'이해했어요 · 첫 번째 차이 보기',action:function(){showQ11Difference(false);},primary:true},
      {label:deeper?'다시 설명해 주세요':'모르겠어요 · 더 잘게 보여 주세요',action:function(){showQ11Chairs(true);}},
      {label:'원문 다시 보기',action:showQ11Original}
    ]);
  }
  function showQ11Difference(deeper){
    stage=2;render(function(){
      var speech=deeper?'2인용을 5인용으로 한 개 바꾸면 앉을 수 있는 사람은 2명에서 5명으로 늘어요. 늘어난 자리는 5-2=3자리입니다.':'선생님이 뭐라고 했죠? 우기기를 시작하기 전에 첫 번째 차이를 계산하라고 했죠. 5인용과 2인용의 차이는 3자리예요. 기억나나요?';
      return stageShell(deeper?'2자리와 5자리를 직접 비교해요':'첫 번째는 차이를 계산해요',speech,q11Visual('difference'));
    },[
      {label:'기억나요 · 모두 2인용으로 우겨 볼게요',action:function(){showQ11Assume(false);},primary:true},
      {label:deeper?'차이를 다시 볼게요':'모르겠어요 · 자리 차이를 보여 주세요',action:function(){showQ11Difference(true);}},
      {label:'앞 단계로',action:function(){showQ11Chairs(false);}}
    ]);
  }
  function showQ11Assume(deeper){
    stage=3;render(function(){
      var speech=deeper?'가득 찬 의자 40개가 모두 2인용이라면 40×2=80명입니다. 실제 가득 앉은 사람 122명까지는 122-80=42명이 더 필요합니다.':'이제 40개를 모두 2인용이라고 우겨 봅시다. 그러면 80명입니다. 실제 122명과는 42명 차이가 나죠. 이해되었나요?';
      return stageShell(deeper?'80명에서 122명까지의 차이를 봐요':'모두 2인용이라고 우겨요',speech,q11Visual('assume'));
    },[
      {label:'이해했어요 · 5인용 수 구하기',action:showQ11Finish,primary:true},
      {label:deeper?'계산을 다시 볼게요':'모르겠어요 · 42명이 왜 나오는지 보여 주세요',action:function(){showQ11Assume(true);}},
      {label:'첫 번째 차이 다시 보기',action:function(){showQ11Difference(false);}}
    ]);
  }
  function showQ11Finish(){
    stage=4;render(function(){
      var section=stageShell('3명씩 바꾸고 마지막 의자를 더해요','의자 하나를 2인용에서 5인용으로 바꿀 때 3명씩 늘어요. 42÷3=14이므로 가득 찬 5인용은 14개예요. 마지막 5인용 의자 한 개를 더하면 15개입니다.',q11Visual('finish'));
      var answer=document.createElement('div');answer.className='f7ot-answer';answer.innerHTML='5인용 의자의 수<strong>15개</strong>';section.appendChild(answer);return section;
    },[
      {label:'이해했어요 · 마치기',action:function(){dialog().close();},primary:true},
      {label:'42명이 왜 나오는지 다시 보기',action:function(){showQ11Assume(false);}},
      {label:'처음부터 다시 보기',action:showQ11Original}
    ]);
  }
  function showQ12Original(){
    stage=0;dialog().querySelector('#f7otTitle').textContent='최종 7회 12번 · 반복 색칠 넓이';render(function(){
      return stageShell('먼저 원문 그림을 다시 볼까요?','네 번째 전체 넓이가 아니라, 세 번째보다 더 색칠한 부분만 찾는 문제예요. 원문 그림에서 반복되는 한 곳을 찾아볼게요.',q12SourceFigure());
    },[{label:'12번 풀이 시작',action:function(){showQ12Pattern(false);},primary:true}]);
  }
  function showQ12Pattern(deeper){
    stage=1;render(function(){
      var speech=deeper?'첫 번째는 전체를 4칸으로 나누어 대각선의 2칸을 색칠합니다. 두 번째는 오른쪽 아래의 남은 흰 정사각형 하나만 다시 4칸으로 나누고, 그 안의 대각선 2칸을 새로 색칠합니다.':'그림을 수로 나타내 볼까요? 첫 번째는 4칸 중 2칸, 두 번째는 전체를 16칸으로 보았을 때 작은 2칸을 새로 색칠했어요. 여기까지 이해됐나요?';
      return stageShell(deeper?'어느 정사각형을 다시 나누는지 볼게요':'한 단계에서 새로 색칠한 두 칸을 찾아요',speech,q12Visual('pattern'));
    },[
      {label:'이해했어요 · 넓이 규칙 보기',action:function(){showQ12Sequence(false);},primary:true},
      {label:deeper?'그림을 다시 볼게요':'모르겠어요 · 나누는 칸을 다시 보여 주세요',action:function(){showQ12Pattern(true);}},
      {label:'원문 다시 보기',action:showQ12Original}
    ]);
  }
  function showQ12Sequence(deeper){
    stage=2;render(function(){
      var speech=deeper?'새로 색칠한 넓이는 첫 번째 1/2, 두 번째 1/8, 세 번째 1/32입니다. 1/2÷4=1/8, 1/8÷4=1/32처럼 바로 앞 단계의 1/4이 됩니다.':'선생님이 뭐라고 했죠? 한 단계가 늘 때마다 새로 색칠한 넓이는 앞 단계의 1/4이 됩니다. 1/2, 1/8, 1/32로 줄어드는 것이 보이나요?';
      return stageShell(deeper?'분모가 4배씩 커지는 것을 확인해요':'새로 색칠한 넓이는 1/4씩 줄어요',speech,q12Visual('sequence'));
    },[
      {label:'이해했어요 · 세 번째 확인하기',action:function(){showQ12Third(false);},primary:true},
      {label:deeper?'규칙을 다시 볼게요':'모르겠어요 · 분수로 더 자세히 보여 주세요',action:function(){showQ12Sequence(true);}},
      {label:'그림 규칙 다시 보기',action:function(){showQ12Pattern(false);}}
    ]);
  }
  function showQ12Third(deeper){
    stage=3;render(function(){
      var speech=deeper?'세 번째에 새로 생긴 작은 한 칸은 전체의 1/64입니다. 같은 크기 두 칸을 색칠하므로 2/64이고, 약분하면 1/32입니다.':'세 번째에서 새로 색칠한 부분은 전체를 64칸으로 보았을 때 두 칸이에요. 그래서 2/64=1/32입니다. 그럼 네 번째에는 어떻게 될까요?';
      return stageShell(deeper?'작은 한 칸의 넓이부터 볼게요':'세 번째의 새 색칠 넓이를 확인해요',speech,q12Visual('third'));
    },[
      {label:'알겠어요 · 네 번째 구하기',action:showQ12Finish,primary:true},
      {label:deeper?'세 번째를 다시 볼게요':'모르겠어요 · 1/32가 되는 과정을 보여 주세요',action:function(){showQ12Third(true);}},
      {label:'넓이 규칙 다시 보기',action:function(){showQ12Sequence(false);}}
    ]);
  }
  function showQ12Finish(){
    stage=4;render(function(){
      var section=stageShell('네 번째에서 새로 색칠한 두 칸만 계산해요','네 번째의 작은 한 칸은 전체의 1/256입니다. 두 칸을 새로 색칠했으므로 2/256=1/128입니다. 이것이 네 번째 도형에서 세 번째 도형보다 더 색칠한 부분이에요.',q12Visual('finish'));
      var answer=document.createElement('div');answer.className='f7ot-answer';answer.innerHTML='세 번째보다 더 색칠한 부분<strong>1/128</strong>';section.appendChild(answer);return section;
    },[
      {label:'이해했어요 · 마치기',action:function(){dialog().close();},primary:true},
      {label:'1/32부터 다시 보기',action:function(){showQ12Third(false);}},
      {label:'처음부터 다시 보기',action:showQ12Original}
    ]);
  }
  function showQ13Original(){
    stage=0;dialog().querySelector('#f7otTitle').textContent='최종 7회 13번 · 늘어나는 묶음';render(function(){
      return stageShell('먼저 원문 수열을 다시 볼까요?','숫자를 하나씩 세기 전에, 같은 숫자가 몇 개씩 묶여 있는지 찾아볼게요.',q13SourceFigure());
    },[{label:'13번 풀이 시작',action:function(){showQ13Groups(false);},primary:true}]);
  }
  function showQ13Groups(deeper){
    stage=1;render(function(){
      var speech=deeper?'첫 묶음에는 1이 1개, 둘째 묶음에는 2가 2개, 셋째 묶음에는 1이 3개, 넷째 묶음에는 2가 4개 있습니다. 묶음의 길이가 1개씩 늘고 숫자는 1과 2가 번갈아 나옵니다.':'선생님이 묶음을 먼저 보라고 했죠. 1개, 2개, 3개, 4개, 5개로 묶음의 길이가 하나씩 늘어나는 것이 보이나요?';
      return stageShell(deeper?'같은 숫자끼리 선을 그어 묶어 볼게요':'몇 번째 묶음인지 먼저 찾아요',speech,q13Visual('groups'));
    },[
      {label:'이해했어요 · 300개 경계 찾기',action:function(){showQ13Boundary(false);},primary:true},
      {label:deeper?'묶음을 다시 볼게요':'모르겠어요 · 묶음을 더 자세히 보여 주세요',action:function(){showQ13Groups(true);}},
      {label:'원문 다시 보기',action:showQ13Original}
    ]);
  }
  function showQ13Boundary(deeper){
    stage=2;render(function(){
      var speech=deeper?'1부터 20까지 더하면 210입니다. 여기에 21+22+23+24=90을 더하면 정확히 300입니다. 따라서 300번째 수는 24번째 묶음의 마지막 수예요.':'300에 가까운 묶음의 끝을 찾아볼까요? 1부터 20까지는 210개이고, 21번째부터 24번째까지 90개를 더하면 정확히 300개입니다. 이해됐나요?';
      return stageShell(deeper?'300번째가 어느 묶음에서 끝나는지 계산해요':'1번째부터 24번째 묶음까지가 300개예요',speech,q13Visual('boundary'));
    },[
      {label:'이해했어요 · 1과 2 비교하기',action:function(){showQ13Pairs(false);},primary:true},
      {label:deeper?'경계를 다시 볼게요':'모르겠어요 · 210과 90을 보여 주세요',action:function(){showQ13Boundary(true);}},
      {label:'묶음 규칙 다시 보기',action:function(){showQ13Groups(false);}}
    ]);
  }
  function showQ13Pairs(deeper){
    stage=3;render(function(){
      var speech=deeper?'홀수 번째 묶음에는 1이 홀수 개, 바로 다음 짝수 번째 묶음에는 2가 그보다 한 개 더 있습니다. (1,2)부터 (23,24)까지 이런 묶음 쌍이 12개입니다.':'묶음을 두 개씩 짝지어 볼까요? 1개와 2개, 3개와 4개처럼 매 쌍마다 2가 딱 한 개 더 많아요. 이런 쌍이 몇 개일까요?';
      return stageShell(deeper?'묶음 두 개마다 차이가 1개예요':'홀수 묶음과 다음 짝수 묶음을 짝지어요',speech,q13Visual('pairs'));
    },[
      {label:'12쌍이에요 · 답 확인하기',action:showQ13Finish,primary:true},
      {label:deeper?'묶음 쌍을 다시 볼게요':'모르겠어요 · 왜 한 개 차이인지 보여 주세요',action:function(){showQ13Pairs(true);}},
      {label:'300개 경계 다시 보기',action:function(){showQ13Boundary(false);}}
    ]);
  }
  function showQ13Finish(){
    stage=4;render(function(){
      var section=stageShell('12쌍에서 한 개씩 차이가 나요','각 묶음 쌍마다 2가 1개씩 더 많고, 묶음 쌍은 12개입니다. 따라서 숫자 2가 숫자 1보다 12개 더 많습니다.',q13Visual('pairs'));
      var answer=document.createElement('div');answer.className='f7ot-answer';answer.innerHTML='더 많은 숫자와 개수 차이<strong>2가 12개 더 많음</strong>';section.appendChild(answer);return section;
    },[
      {label:'이해했어요 · 마치기',action:function(){dialog().close();},primary:true},
      {label:'묶음 짝 다시 보기',action:function(){showQ13Pairs(false);}},
      {label:'처음부터 다시 보기',action:showQ13Original}
    ]);
  }
  function openQ6(){dialog().querySelector('#f7otTitle').textContent='최종 7회 6번 · 낚싯줄 따라가기';showOriginal();var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function openQ11(){showQ11Original();var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function openQ12(){showQ12Original();var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function openQ13(){showQ13Original();var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function launch(label,row,handler){
    var node=document.createElement('button');node.type='button';node.className='f7ot-launch no-print'+(row?' f7ot-row-launch':'');node.textContent=label;node.addEventListener('click',handler);return node;
  }
  function originalCardQ6(){
    var card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo='6';
    var heading=document.createElement('h3');heading.textContent='6번 원문 풀이 도우미';
    var copy=document.createElement('p');copy.textContent='원문 그림과 선생님 대본으로 낚싯줄을 직접 따라가며 배웁니다.';
    card.append(heading,copy,sourceFigure(true,false,false),launch('선생님 대본으로 한 단계씩 보기',false,openQ6));return card;
  }
  function originalCardQ11(){
    var card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo='11';
    var heading=document.createElement('h3');heading.textContent='11번 원문 풀이 도우미';
    var copy=document.createElement('p');copy.textContent='선생님 대본의 우기기 순서대로 첫 번째 차이부터 계산합니다.';
    card.append(heading,copy,q11SourceFigure(),launch('선생님 대본으로 한 단계씩 보기',false,openQ11));return card;
  }
  function originalCardQ12(){
    var card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo='12';
    var heading=document.createElement('h3');heading.textContent='12번 원문 풀이 도우미';
    var copy=document.createElement('p');copy.textContent='원문 그림에서 한 단계마다 새로 색칠되는 두 칸의 넓이를 따라갑니다.';
    card.append(heading,copy,q12SourceFigure(),launch('선생님 대본으로 한 단계씩 보기',false,openQ12));return card;
  }
  function originalCardQ13(){
    var card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo='13';
    var heading=document.createElement('h3');heading.textContent='13번 원문 풀이 도우미';
    var copy=document.createElement('p');copy.textContent='선생님 대본대로 묶음의 끝을 찾고 1과 2의 개수를 묶음 쌍으로 비교합니다.';
    card.append(heading,copy,q13SourceFigure(),launch('선생님 대본으로 한 단계씩 보기',false,openQ13));return card;
  }
  function attach(container,options){
    if(!container||!options||Number(options.round)!==7)return;
    var details=container.querySelector('#detailedAnswersSection .report-resource-details');if(!details)return;
    var solutions=details.querySelector('.detailed-solutions');
    if(!solutions){solutions=document.createElement('div');solutions.className='detailed-solutions';details.appendChild(solutions);}
    if(!solutions.querySelector('.f7ot-card[data-solution-no="13"]'))solutions.insertBefore(originalCardQ13(),solutions.firstChild);
    if(!solutions.querySelector('.f7ot-card[data-solution-no="12"]'))solutions.insertBefore(originalCardQ12(),solutions.firstChild);
    if(!solutions.querySelector('.f7ot-card[data-solution-no="11"]'))solutions.insertBefore(originalCardQ11(),solutions.firstChild);
    if(!solutions.querySelector('.f7ot-card[data-solution-no="6"]'))solutions.insertBefore(originalCardQ6(),solutions.firstChild);
    var row6=container.querySelector('#detailWrap tbody:nth-of-type(6) tr:first-child .weak-cell');
    if(row6)row6.replaceChildren(launch('6번 풀이',true,openQ6));
    var row11=container.querySelector('#detailWrap tbody:nth-of-type(11) tr:first-child .weak-cell');
    if(row11)row11.replaceChildren(launch('11번 풀이',true,openQ11));
    var row12=container.querySelector('#detailWrap tbody:nth-of-type(12) tr:first-child .weak-cell');
    if(row12)row12.replaceChildren(launch('12번 풀이',true,openQ12));
    var row13=container.querySelector('#detailWrap tbody:nth-of-type(13) tr:first-child .weak-cell');
    if(row13)row13.replaceChildren(launch('13번 풀이',true,openQ13));
  }
  root.GFIELD_FINAL7_ORIGINAL_TUTOR={attach:attach,openQ6:openQ6,openQ11:openQ11,openQ12:openQ12,openQ13:openQ13,sourcePriority:['final7-video-script','basic','think-core']};
})(window);
