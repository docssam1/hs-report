(function(root){
  'use strict';

  var SOURCE_IMAGE='materials/final_7/002.jpg';
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
  function open(){showOriginal();var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function launch(label,row){
    var node=document.createElement('button');node.type='button';node.className='f7ot-launch no-print'+(row?' f7ot-row-launch':'');node.textContent=label;node.addEventListener('click',open);return node;
  }
  function originalCard(){
    var card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo='6';
    var heading=document.createElement('h3');heading.textContent='6번 원문 풀이 도우미';
    var copy=document.createElement('p');copy.textContent='원문 그림과 선생님 대본으로 낚싯줄을 직접 따라가며 배웁니다.';
    card.append(heading,copy,sourceFigure(true,false,false),launch('선생님 대본으로 한 단계씩 보기',false));return card;
  }
  function attach(container,options){
    if(!container||!options||Number(options.round)!==7||container.querySelector('.f7ot-card'))return;
    var details=container.querySelector('#detailedAnswersSection .report-resource-details');if(!details)return;
    var solutions=details.querySelector('.detailed-solutions');
    if(!solutions){solutions=document.createElement('div');solutions.className='detailed-solutions';details.appendChild(solutions);}
    solutions.insertBefore(originalCard(),solutions.firstChild);
    var row=container.querySelector('#detailWrap tbody:nth-of-type(6) tr:first-child .weak-cell');
    if(row)row.replaceChildren(launch('6번 풀이',true));
  }
  root.GFIELD_FINAL7_ORIGINAL_TUTOR={attach:attach,open:open,sourcePriority:['final7-video-script','basic','think-core']};
})(window);
