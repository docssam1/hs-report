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
  var SCRIPTED_TUTORS={
    14:{title:'상자 사이 구슬 옮기기',page:'004.jpg',view:'45 790 530 610',summary:'상자마다 한 번에 얼마나 늘고 줄어드는지 정리한 뒤 50회를 거꾸로 계산합니다.',answer:'101, 148, 145',answerLabel:'처음 A, 마지막 B, 마지막 C',steps:[
      {title:'C 상자를 ○개라고 놓아요',speech:'선생님이 먼저 세 상자의 차이를 한 줄로 놓았죠. C가 ○개라면 B는 ○+3개, A는 ○+6개입니다. 여기까지 이해됐나요?',deep:'C에서 B로 갈 때 3개, B에서 A로 갈 때 다시 3개가 늘어요. 그래서 C=○, B=○+3, A=○+6입니다.',visual:'<span>C<br><b>○</b></span><i>+3</i><span>B<br><b>○+3</b></span><i>+3</i><span>A<br><b>○+6</b></span>'},
      {title:'한 번 뒤의 순변화를 계산해요',speech:'A는 3개를 주고 1개를 받으니 2개 줄어요. B는 3개를 받고 2개를 주어 1개 늘고, C도 2개를 받고 1개를 주어 1개 늘어요.',deep:'옮긴 순서를 끝까지 합치면 A는 −3+1=−2, B는 +3−2=+1, C는 +2−1=+1입니다. 구슬의 전체 수는 바뀌지 않아요.',visual:'<span>A<br><b>−2</b></span><span>B<br><b>+1</b></span><span>C<br><b>+1</b></span>'},
      {title:'50회를 거꾸로 되돌려요',speech:'50회 뒤 A에 1개가 남았고, 한 번마다 2개씩 줄었어요. 처음 A는 1+2×50입니다. 그러면 ○는 처음 A보다 6개 적겠죠?',deep:'A의 처음 수는 101개이고 C를 뜻한 ○는 101−6=95입니다. 마지막 B는 98+50, 마지막 C는 95+50으로 계산합니다.',visual:'<span>마지막 A<br><b>1</b></span><i>+</i><span>줄어든 수<br><b>2×50</b></span><i>→</i><span>처음 A<br><b>101</b></span>'},
      {title:'세 값을 순서대로 확인해요',speech:'처음 A는 101개입니다. 처음 B는 98개, C는 95개였으므로 50회 뒤에는 B가 148개, C가 145개입니다.',visual:'<span>처음 A<br><b>101</b></span><span>마지막 B<br><b>148</b></span><span>마지막 C<br><b>145</b></span>'}
    ]},
    15:{title:'화살표 이동 좌표',page:'004.jpg',view:'600 120 550 430',summary:'12칸짜리 이동 묶음과 묶음마다 오른쪽으로 옮겨지는 열을 함께 계산합니다.',answer:'(3, 50)',answerLabel:'150번째 칸의 위치',steps:[
      {title:'먼저 12칸짜리 한 묶음을 따라가요',speech:'첫째 칸 (1,1)에서 화살표를 따라가면 여섯째 칸은 (3,2)입니다. 손가락으로 1번부터 12번까지 이어 보세요.',deep:'화살표가 가리키는 바로 다음 칸으로 한 칸씩 이동합니다. 같은 칸으로 되돌아가지 않고 12칸을 지나면 같은 모양이 오른쪽에서 반복됩니다.',visual:'<span>1번째<br><b>(1,1)</b></span><i>화살표 5번</i><span>6번째<br><b>(3,2)</b></span><i>…</i><span>12칸 한 묶음</span>'},
      {title:'150을 12칸씩 나눠요',speech:'150=12×12+6입니다. 따라서 완성된 묶음 12개를 지나고, 다음 묶음의 여섯째 칸에 도착합니다.',deep:'나머지가 0이면 한 묶음의 마지막 칸이지만, 나머지가 6이므로 다음 묶음에서 여섯 칸을 따라가야 합니다.',visual:'<span>150</span><i>÷12</i><span><b>12묶음</b></span><span><b>나머지 6</b></span>'},
      {title:'묶음마다 열이 4칸씩 옮겨져요',speech:'한 묶음이 끝날 때마다 같은 여섯째 칸은 오른쪽으로 4열 이동합니다. 12묶음이면 48열을 더해요.',deep:'첫 묶음의 여섯째 칸은 (3,2)이고, 반복 12묶음 뒤에는 열 번호만 2+4×12로 바뀝니다. 행 번호 3은 그대로예요.',visual:'<span>행<br><b>3</b></span><span>열<br><b>2+4×12</b></span>'},
      {title:'행과 열을 순서대로 써요',speech:'행은 3, 열은 50입니다. 좌표는 행을 먼저, 열을 나중에 써서 (3,50)입니다.',visual:'<span>행 3</span><i>,</i><span>열 50</span>'}
    ]},
    16:{title:'카드 버리기와 옮기기',page:'004.jpg',view:'600 790 550 430',summary:'위의 두 장을 버리고 다음 한 장을 맨 아래로 옮기는 순서를 마지막 두 장까지 정확히 반복합니다.',answer:'165',answerLabel:'마지막 두 카드의 합',steps:[
      {title:'세 장씩 한 덩어리로 보지 않아요',speech:'매번 위의 두 장은 버리고, 바로 다음 한 장은 버리지 않고 맨 밑으로 옮깁니다. 순서를 말로 따라 해 볼까요?',deep:'1·2는 버리고 3은 맨 밑, 4·5는 버리고 6은 맨 밑으로 갑니다. 다만 100도 첫 바퀴 뒤 맨 위쪽으로 이어진다는 점을 놓치면 안 돼요.',visual:'<span>1, 2<br><b>버림</b></span><i>→</i><span>3<br><b>맨 밑</b></span><i>반복</i>'},
      {title:'카드가 적어질 때의 순서를 적어요',speech:'카드가 12장 남은 순간부터는 모두 적어도 어렵지 않아요. 위에서부터 99, 6, 15, …, 96의 순서입니다.',deep:'처음부터 큐의 맨 앞 두 장을 지우고 다음 한 장을 맨 뒤로 보내는 과정을 그대로 반복한 결과입니다. 100이 포함된 순환 때문에 단순히 3의 배수만 남는 것은 아닙니다.',visual:'<span>12장</span><b>99 · 6 · 15 · 24 · 33 · 42 · 51 · 60 · 69 · 78 · 87 · 96</b>'},
      {title:'마지막 네 장에서 한 번 더 해요',speech:'네 장이 남았을 때 위에서부터 15, 42, 69, 96입니다. 위의 15와 42를 버리면 어떤 두 장이 남나요?',deep:'카드가 두 장이 되는 순간 반복을 멈춥니다. 따라서 69를 다시 맨 밑으로 보내지 않습니다.',visual:'<span class="muted">15</span><span class="muted">42</span><span><b>69</b></span><span><b>96</b></span>'},
      {title:'남은 두 수를 더해요',speech:'마지막 두 카드는 69와 96이고, 69+96=165입니다.',visual:'<span>69</span><i>+</i><span>96</span><i>=</i><span><b>165</b></span>'}
    ]},
    17:{title:'단계별 바둑돌 수',page:'005.jpg',view:'45 120 530 430',summary:'흰 바둑돌로 단계를 찾고, 양쪽 검은 바둑돌을 1부터 14까지의 합으로 셉니다.',answer:'210개',answerLabel:'검은색 바둑돌의 수',steps:[
      {title:'흰 바둑돌 수로 단계를 찾아요',speech:'흰 바둑돌은 가운데 정사각형으로 놓입니다. 225=15×15이므로 몇 단계일까요?',deep:'n단계의 흰 바둑돌은 n×n개입니다. 15×15=225이므로 15단계입니다.',visual:'<span>흰 바둑돌</span><i>225=</i><span><b>15×15</b></span>'},
      {title:'검은 바둑돌은 양쪽 계단이에요',speech:'2단계에는 한쪽에 1개, 3단계에는 한쪽에 1+2개가 놓입니다. 15단계에는 한쪽에 1부터 14까지 놓여요.',deep:'가운데 흰 정사각형의 한 변이 15개이면 바깥 검은 계단은 14줄입니다. 왼쪽과 오른쪽의 모양은 서로 같습니다.',visual:'<span>한쪽</span><b>1+2+3+…+14</b><i>× 양쪽 2</i>'},
      {title:'1부터 14까지 빠르게 더해요',speech:'1과 14, 2와 13처럼 짝지으면 15가 되는 쌍이 7개입니다. 한쪽은 15×7=105개예요.',deep:'(1+14)+(2+13)+…+(7+8)=15×7=105입니다. 같은 수를 두 번 세지 않았는지 양쪽을 나누어 확인하세요.',visual:'<span>15</span><i>×</i><span>7쌍</span><i>=</i><span><b>105</b></span>'},
      {title:'같은 계단이 두 쪽이에요',speech:'한쪽 105개가 양쪽에 있으므로 105×2=210개입니다.',visual:'<span>왼쪽 105</span><i>+</i><span>오른쪽 105</span>'}
    ]},
    18:{title:'세 사람의 나이',page:'005.jpg',view:'45 780 530 430',summary:'세 쌍의 합을 모두 더해 전체 나이를 찾고, 반대쪽 두 사람의 합을 뺍니다.',answer:'병 16살',answerLabel:'나이가 가장 많은 사람',steps:[
      {title:'세 쌍의 합을 모두 더해요',speech:'갑+을, 을+병, 갑+병을 모두 더하면 각 사람의 나이가 몇 번씩 들어갈까요?',deep:'갑도 두 번, 을도 두 번, 병도 두 번 들어갑니다. 따라서 세 합의 합은 세 사람 전체 나이의 두 배예요.',visual:'<span>12</span><i>+</i><span>20</span><i>+</i><span>24</span><i>=</i><span><b>56</b></span>'},
      {title:'세 사람의 전체 나이를 구해요',speech:'56에는 각 사람 나이가 두 번씩 있으므로 56÷2=28입니다.',deep:'갑+을+병=28입니다. 이제 원하는 사람을 제외한 두 사람의 합을 빼면 한 사람의 나이가 바로 나옵니다.',visual:'<span>두 배 56</span><i>÷2</i><span><b>전체 28</b></span>'},
      {title:'가장 큰 사람을 찾아요',speech:'갑+을의 합 12가 가장 작으므로, 전체에서 그 둘을 뺀 병의 나이가 가장 큽니다.',deep:'병=28−(갑+을)=28−12입니다. 같은 방법으로 갑=28−20, 을=28−24도 확인할 수 있어요.',visual:'<span>전체 28</span><i>−</i><span>갑+을 12</span><i>=</i><span><b>병 16</b></span>'},
      {title:'세 합에 다시 넣어 확인해요',speech:'갑 8살, 을 4살, 병 16살이면 8+4=12, 4+16=20, 8+16=24로 모두 맞습니다.',visual:'<span>갑 8</span><span>을 4</span><span><b>병 16</b></span>'}
    ]},
    19:{title:'사과를 거꾸로 계산하기',page:'005.jpg',view:'600 120 550 450',summary:'마지막 1개에서 출발해 매 이웃 전의 사과 수를 거꾸로 복원합니다.',answer:'382개',answerLabel:'과수원에서 딴 사과',steps:[
      {title:'마지막에 남은 1개부터 시작해요',speech:'이웃에게 절반과 1개를 더 주고 1개가 남았습니다. 주기 전에는 몇 개였을까요?',deep:'남은 수에 먼저 1을 더하고 두 배하면 주기 전의 수가 됩니다. (1+1)×2=4입니다.',visual:'<span>남은 1</span><i>+1, ×2</i><span><b>그전 4</b></span>'},
      {title:'같은 역산을 반복해요',speech:'매번 “1을 더하고 두 배”를 반복합니다. 1에서 4, 10, 22, 46으로 거슬러 올라가요.',deep:'앞으로 계산할 때는 절반을 주고 1개를 더 주므로, 거꾸로는 그 1개를 되돌린 뒤 절반의 반대인 두 배를 합니다.',visual:'<span>1</span><i>→</i><span>4</span><i>→</i><span>10</span><i>→</i><span>22</span><i>→</i><span>46</span>'},
      {title:'일곱 이웃만큼 정확히 되돌려요',speech:'46 다음은 94, 190, 382입니다. 모두 일곱 번 되돌렸는지 화살표를 세어 보세요.',deep:'1→4(1)→10(2)→22(3)→46(4)→94(5)→190(6)→382(7)입니다.',visual:'<span>46</span><i>→</i><span>94</span><i>→</i><span>190</span><i>→</i><span><b>382</b></span>'},
      {title:'앞으로 나누어 다시 확인해요',speech:'382에서 절반과 1개를 일곱 번 주면 190, 94, 46, 22, 10, 4, 1이 되어 조건과 맞습니다.',visual:'<span>382</span><i>7번 나누기</i><span><b>1</b></span>'}
    ]},
    20:{title:'남은 양의 절반씩 나누기',page:'005.jpg',view:'600 780 550 470',summary:'다섯째가 실제로 받은 양과 처음 똑같이 나누려던 양을 따로 구해 비교합니다.',answer:'216g',answerLabel:'다섯째가 더 적게 받은 양',steps:[
      {title:'원래 계획한 한 사람 몫을 구해요',speech:'1kg 280g은 1280g입니다. 다섯 명에게 똑같이 나누면 한 사람은 몇 g일까요?',deep:'1280÷5=256이므로 원래 계획은 한 사람마다 256g입니다.',visual:'<span>1280g</span><i>÷5</i><span><b>256g</b></span>'},
      {title:'실제로는 남은 것의 절반씩 줘요',speech:'첫째는 640g, 남은 640g의 절반인 320g을 둘째가 받습니다. 같은 방식으로 계속해요.',deep:'받은 양과 남은 양이 매번 같아집니다. 받은 양은 640, 320, 160, 80, 40g으로 절반씩 줄어요.',visual:'<span>640</span><i>→</i><span>320</span><i>→</i><span>160</span><i>→</i><span>80</span><i>→</i><span><b>40</b></span>'},
      {title:'다섯째의 실제 몫을 확인해요',speech:'다섯째는 남은 80g의 절반인 40g을 받고, 마지막 40g은 이웃돕기에 씁니다.',deep:'다섯째가 받은 양과 기부한 양은 각각 40g입니다. 문제는 다섯째가 계획보다 얼마나 적게 받았는지를 묻습니다.',visual:'<span>계획 256g</span><i>−</i><span>실제 40g</span>'},
      {title:'계획과 실제의 차를 구해요',speech:'256−40=216이므로 다섯째는 처음 계획보다 216g 적게 받았습니다.',visual:'<span>256</span><i>−</i><span>40</span><i>=</i><span><b>216g</b></span>'}
    ]},
    21:{title:'연속한 세 짝수의 곱',page:'006.jpg',view:'45 120 530 400',summary:'여섯 자리 수의 보이는 앞자리와 끝자리를 함께 만족하는 연속 짝수를 좁혀 갑니다.',answer:'62',answerLabel:'가장 작은 짝수',steps:[
      {title:'보이는 숫자를 정확히 읽어요',speech:'곱은 여섯 자리이고 2로 시작해 8로 끝납니다. 네모 안 숫자를 미리 정하지 말고 두 조건을 함께 봐요.',deep:'연속한 세 짝수를 n, n+2, n+4라 두면 곱이 200000 이상 299999 이하이고 일의 자리가 8이어야 합니다.',visual:'<span><b>2</b></span><span>□</span><span>□</span><span>□</span><span>□</span><span><b>8</b></span>'},
      {title:'60 근처부터 확인해요',speech:'세 수의 곱이 20만대이므로 가장 작은 짝수는 60 근처입니다. 60·62·64부터 차례로 확인해요.',deep:'60×62×64=238080이라 끝자리가 8이 아닙니다. 다음 연속 짝수 묶음으로 한 칸 옮깁니다.',visual:'<span>60×62×64</span><i>=</i><span>238080</span>'},
      {title:'다음 연속 짝수 세 수를 곱해요',speech:'62×64×66을 계산하면 261888입니다. 2로 시작하고 8로 끝나는 여섯 자리 수가 맞나요?',deep:'62×64=3968, 3968×66=261888입니다. 앞자리와 끝자리 조건을 모두 만족합니다.',visual:'<span>62×64×66</span><i>=</i><span><b>261888</b></span>'},
      {title:'가장 작은 수를 골라요',speech:'조건을 처음 만족한 연속 짝수는 62, 64, 66이므로 가장 작은 수는 62입니다.',visual:'<span><b>62</b></span><span>64</span><span>66</span>'}
    ]},
    22:{title:'두 학년을 제외한 학생 수',page:'006.jpg',view:'45 780 530 460',summary:'‘아닌 학생’을 두 학년의 합으로 바꾸고, 세 쌍의 합으로 전체를 찾습니다.',answer:'75명',answerLabel:'4학년과 6학년을 제외한 학생',steps:[
      {title:'아닌 학생을 학년의 합으로 바꿔요',speech:'6학년이 아닌 180명은 4학년+5학년, 4학년이 아닌 120명은 5학년+6학년입니다.',deep:'운동장에는 4·5·6학년만 있습니다. 따라서 “6학년이 아님”처럼 여집합으로 읽은 말을 두 학년의 합으로 바로 바꿀 수 있어요.',visual:'<span>4+5<br><b>180</b></span><span>5+6<br><b>120</b></span><span>4+6<br><b>150</b></span>'},
      {title:'세 쌍을 더하면 전체의 두 배예요',speech:'180+120+150=450입니다. 4·5·6학년이 각각 두 번씩 들어 있으니 전체는 450÷2예요.',deep:'(4+5)+(5+6)+(4+6)=2×(4+5+6)입니다.',visual:'<span>450</span><i>÷2</i><span><b>전체 225</b></span>'},
      {title:'문제가 묻는 학년을 확인해요',speech:'4학년과 6학년을 제외하면 5학년만 남습니다. 4+6은 이미 150명이라고 주어졌어요.',deep:'따로 4학년과 6학년을 구할 필요 없이 전체 225명에서 두 학년의 합 150명을 빼면 됩니다.',visual:'<span>전체 225</span><i>−</i><span>4+6의 150</span>'},
      {title:'남은 5학년 수를 구해요',speech:'225−150=75이므로 답은 75명입니다.',visual:'<span>225−150</span><i>=</i><span><b>75명</b></span>'}
    ]},
    23:{title:'자리 숫자 합과 받아올림',page:'006.jpg',view:'600 120 550 470',summary:'1을 더하기 전후에 자리 숫자 합이 모두 8의 배수가 되려면 받아올림이 필요함을 이용합니다.',answer:'169',answerLabel:'가장 작은 세 자리 수',steps:[
      {title:'그냥 1만 커지면 조건을 만족할 수 없어요',speech:'받아올림이 없으면 자리 숫자의 합도 1만 커집니다. 연속한 두 수가 모두 8의 배수일 수 있을까요?',deep:'어떤 8의 배수에 1을 더한 수는 8의 배수가 아닙니다. 따라서 일의 자리 9에서 받아올림이 일어나 자리 숫자의 합이 크게 줄어야 해요.',visual:'<span>합 8의 배수</span><i>+1만 되면</i><span class="muted">8의 배수 아님</span>'},
      {title:'가장 작은 세 자리 수부터 끝자리 9를 봐요',speech:'가장 작은 백의 자리 1을 두고 1□9의 자리 숫자 합이 8의 배수가 되게 해 봅시다.',deep:'1+□+9는 적어도 10입니다. 가장 작은 가능한 8의 배수는 16이므로 □=6입니다.',visual:'<span>1</span><span>□</span><span>9</span><i>합 16</i>'},
      {title:'1을 더한 수도 확인해요',speech:'169의 자리 숫자 합은 16입니다. 1을 더한 170의 자리 숫자 합은 8입니다.',deep:'169+1=170에서 9가 0이 되고 십의 자리 6이 7이 되어 합이 16에서 8로 줄어듭니다.',visual:'<span>169<br><b>1+6+9=16</b></span><i>+1</i><span>170<br><b>1+7+0=8</b></span>'},
      {title:'두 합이 모두 나누어떨어져요',speech:'16과 8은 모두 8로 나누어떨어지고, 백의 자리 1에서 만든 가장 작은 수이므로 답은 169입니다.',visual:'<span>16÷8=2</span><span>8÷8=1</span>'}
    ]},
    24:{title:'두 잔디밭의 작업량',page:'006.jpg',view:'600 780 550 520',summary:'큰 잔디밭의 작업량을 농부 수로 나타낸 뒤 작은 잔디밭의 남은 양과 비교합니다.',answer:'4명',answerLabel:'농부의 수',steps:[
      {title:'전체 농부 수를 □명이라 해요',speech:'첫째 날 큰 잔디밭에서 □명분, 둘째 날 큰 잔디밭에서 □÷2명분을 일했습니다.',deep:'한 사람이 하루 종일 하는 일을 1명분이라 보면 큰 잔디밭의 전체 작업량은 □+□÷2, 즉 3□/2명분입니다.',visual:'<span>첫째 날<br><b>□</b></span><i>+</i><span>둘째 날<br><b>□/2</b></span><i>=</i><span><b>3□/2</b></span>'},
      {title:'작은 잔디밭은 큰 곳의 절반이에요',speech:'작은 잔디밭의 작업량은 3□/2의 절반인 3□/4명분입니다.',deep:'넓이가 절반이고 같은 속도로 잔디를 깎으므로 필요한 사람·날의 양도 정확히 절반입니다.',visual:'<span>큰 곳 3□/2</span><i>÷2</i><span><b>작은 곳 3□/4</b></span>'},
      {title:'둘째 날 뒤에 남은 양을 봐요',speech:'작은 곳에서 둘째 날 □/2명분을 했으니 남은 양은 3□/4−□/2=□/4명분입니다.',deep:'분모를 4로 맞추면 3□/4−2□/4=□/4입니다. 이 양을 셋째 날 한 명이 끝냈어요.',visual:'<span>3□/4</span><i>−</i><span>2□/4</span><i>=</i><span><b>□/4</b></span>'},
      {title:'남은 한 명분과 같게 놓아요',speech:'□/4=1이므로 □=4입니다. 농부는 모두 4명입니다.',visual:'<span>□/4=1</span><i>→</i><span><b>□=4</b></span>'}
    ]},
    25:{title:'가족이 잡은 물고기',page:'007.jpg',view:'45 120 530 510',summary:'주영이 수를 하나의 동그라미로 놓고 가족 네 명의 수를 모두 같은 기준으로 나타냅니다.',answer:'3마리',answerLabel:'주영이가 잡은 물고기',steps:[
      {title:'주영이가 잡은 수를 ○라 해요',speech:'엄마는 주영이의 2배, 아빠는 엄마의 2배이므로 각각 ○ 2개, ○ 4개입니다.',deep:'주영 ○, 엄마 2○, 아빠 4○입니다. 여기까지 세 사람의 합은 7○예요.',visual:'<span>주영<br><b>○</b></span><span>엄마<br><b>2○</b></span><span>아빠<br><b>4○</b></span>'},
      {title:'할아버지 수를 같은 ○로 나타내요',speech:'할아버지는 나머지 세 명의 합보다 15마리 많으므로 7○+15입니다.',deep:'“나머지 3명”은 주영·엄마·아빠이고 그 합은 ○+2○+4○=7○입니다.',visual:'<span>나머지 세 명<br><b>7○</b></span><i>+15</i><span>할아버지<br><b>7○+15</b></span>'},
      {title:'네 사람의 전체 57마리와 같게 놓아요',speech:'○+2○+4○+(7○+15)=57이므로 14○+15=57입니다.',deep:'15를 빼면 14○=42이고, 42를 14로 나누면 ○를 구할 수 있어요.',visual:'<span>14○+15=57</span><i>→</i><span>14○=42</span>'},
      {title:'○의 값을 구해요',speech:'42÷14=3이므로 주영이가 잡은 물고기는 3마리입니다.',visual:'<span>○=42÷14</span><i>=</i><span><b>3마리</b></span>'}
    ]},
    26:{title:'같은 달력 찾기',page:'007.jpg',view:'45 780 530 470',summary:'평년·윤년의 요일 이동을 누적해 2025년과 같은 달력이 되는 가장 가까운 과거 연도를 찾습니다.',answer:'2014년',answerLabel:'2022년과 가장 가까운 과거의 해',steps:[
      {title:'같은 달력의 두 조건을 확인해요',speech:'1월 1일의 요일이 같고, 두 해가 모두 평년이거나 모두 윤년이어야 달력이 같습니다.',deep:'요일만 같아도 윤년 여부가 다르면 2월 뒤 날짜가 달라집니다. 2025년은 평년이므로 후보도 평년이어야 해요.',visual:'<span>같은 시작 요일</span><i>+</i><span>같은 평년·윤년</span>'},
      {title:'한 해 전으로 갈 때 요일을 되돌려요',speech:'평년은 요일이 1칸, 윤년을 건너면 2칸 움직입니다. 2024·2020·2016년은 윤년이에요.',deep:'2025년에서 과거로 한 해씩 가며 1칸 또는 2칸을 누적합니다. 합이 7의 배수가 될 때 시작 요일이 다시 같아집니다.',visual:'<span>평년<br><b>1칸</b></span><span>윤년<br><b>2칸</b></span>'},
      {title:'2014년까지의 이동을 합쳐요',speech:'2014년부터 2025년 전까지 평년 8번과 윤년 3번이 있어 8+3×2=14칸 이동합니다.',deep:'14는 7의 두 배라 시작 요일이 같습니다. 2014년과 2025년은 모두 평년입니다.',visual:'<span>평년 8칸</span><i>+</i><span>윤년 6칸</span><i>=</i><span><b>14칸</b></span>'},
      {title:'더 가까운 과거 후보가 없는지 확인해요',speech:'2022년보다 가까운 과거의 해들을 확인하면 두 조건을 함께 만족하지 않습니다. 가장 가까운 해는 2014년입니다.',visual:'<span>2021 … 2015</span><i>조건 불일치</i><span><b>2014</b></span>'}
    ]},
    27:{title:'매주 늘어나는 감염자 수',page:'007.jpg',view:'600 120 550 380',summary:'감염된 한 명도 남아 있으므로 매주 50명이 아니라 51배가 된다는 점부터 확인합니다.',answer:'5주일',answerLabel:'1억 명 이상이 되는 때',steps:[
      {title:'한 명이 다음 주에 몇 명이 되는지 봐요',speech:'감염된 한 명이 50명을 새로 감염시키고, 그 한 명도 그대로 남습니다. 그래서 한 명은 모두 51명이 됩니다.',deep:'새 감염자 50명만 세면 안 됩니다. 기존 감염자 1명+새 감염자 50명=51명입니다.',visual:'<span>기존 1명</span><i>+</i><span>새 50명</span><i>=</i><span><b>51명</b></span>'},
      {title:'매주 51배씩 곱해요',speech:'1주 뒤 51명, 2주 뒤 2601명, 3주 뒤 132651명으로 늘어납니다.',deep:'매주 그때의 모든 감염자가 각각 50명을 감염시키므로 전체 수에 51을 계속 곱합니다.',visual:'<span>51</span><i>×51</i><span>2,601</span><i>×51</i><span>132,651</span>'},
      {title:'1억 바로 아래와 위를 비교해요',speech:'4주 뒤에는 6,765,201명으로 1억보다 적습니다. 5주 뒤에는 345,025,251명으로 1억을 넘습니다.',deep:'처음으로 1억 이상인 때를 묻기 때문에 5주의 값뿐 아니라 바로 전 4주가 1억 미만인지도 확인해야 합니다.',visual:'<span>4주<br><b>6,765,201</b></span><i>&lt; 1억 &lt;</i><span>5주<br><b>345,025,251</b></span>'},
      {title:'처음 넘는 주를 답해요',speech:'4주에는 아직 작고 5주에 처음 1억 이상이 되므로 답은 5주일입니다.',visual:'<span><b>5주일</b></span>'}
    ]},
    28:{title:'삼각 수 배열의 이웃 합',page:'007.jpg',view:'600 700 550 600',summary:'원 안의 수를 제외하고 변이 맞닿은 여섯 칸을 원 안의 수와의 차로 나타냅니다.',answer:'30',answerLabel:'원 안의 수',steps:[
      {title:'보기에서 맞닿은 칸의 뜻을 확인해요',speech:'그 수가 적힌 칸은 합에서 빼고, 그 칸과 변이 맞닿은 칸만 더합니다. 꼭짓점만 닿은 칸은 포함하지 않아요.',deep:'가운데 칸을 기준으로 왼쪽·오른쪽 두 칸과 위쪽 두 칸, 아래쪽 두 칸, 모두 여섯 칸입니다.',visual:'<span>왼쪽·오른쪽 2칸</span><span>위 2칸</span><span>아래 2칸</span>'},
      {title:'원 안의 수를 ○라 놓아요',speech:'배열의 규칙을 따라 여섯 이웃은 ○−4, ○−3, ○−1, ○+1, ○+4, ○+5가 됩니다.',deep:'같은 줄의 이웃은 1 차이이고, 위·아래 줄의 위치 차이를 원본 배열의 번호로 직접 확인한 값입니다.',visual:'<span>○−4</span><span>○−3</span><span>○−1</span><span>○+1</span><span>○+4</span><span>○+5</span>'},
      {title:'여섯 이웃의 합을 정리해요',speech:'○가 여섯 번이고, 나머지 차이는 −4−3−1+1+4+5=2입니다. 그래서 6○+2=182예요.',deep:'원 안의 ○ 자체는 더하지 않았습니다. 오직 변이 맞닿은 여섯 칸만 더한 식입니다.',visual:'<span>6○+2</span><i>=</i><span>182</span>'},
      {title:'○를 구해 배열에서 확인해요',speech:'6○=180이므로 ○=30입니다. 30의 여섯 이웃을 더하면 182가 되는지도 확인할 수 있어요.',visual:'<span>6○=180</span><i>→</i><span><b>○=30</b></span>'}
    ]},
    29:{title:'가로·세로 합이 같은 배열',page:'008.jpg',view:'45 120 530 430',summary:'가운데 수를 정한 뒤 세로의 두 끝을 고르고, 남은 네 수의 모든 순서를 셉니다.',answer:'192가지',answerLabel:'수를 써넣는 방법',steps:[
      {title:'가운데 칸이 두 줄에 함께 들어가요',speech:'일곱 수의 합은 49입니다. 가로 합과 세로 합을 더하면 전체 49에 가운데 수가 한 번 더 들어갑니다.',deep:'가로와 세로의 공통 칸을 ○라 하면 두 줄 합의 합은 49+○입니다. 두 줄 합이 같으므로 한 줄 합은 (49+○)÷2예요.',visual:'<span>전체 49</span><i>+</i><span>가운데 ○</span><i>=</i><span>두 줄의 합</span>'},
      {title:'가능한 가운데 수를 찾아요',speech:'가운데가 1, 5, 9, 13일 때만 세로의 위·아래 두 수를 만들 수 있습니다. 각각 한 쌍씩 있어요.',deep:'가운데 ○를 빼고 세로 끝 두 수의 합은 (49−○)÷2입니다. 가능한 쌍은 ○=1일 때 11·13, 5일 때 9·13, 9일 때 7·13, 13일 때 7·11입니다.',visual:'<span>가운데</span><b>1 · 5 · 9 · 13</b><i>4가지</i>'},
      {title:'한 가운데 수에서 자리 순서를 세요',speech:'세로의 두 끝은 위·아래를 바꾸는 2가지입니다. 남은 네 수는 가로의 서로 다른 네 칸에 4×3×2×1가지로 놓습니다.',deep:'가로 네 칸은 모두 위치가 다르므로 단순히 좌우만 바꾸는 2가지가 아니라 4!=24가지입니다. 이것이 기존 64가지 계산에서 빠졌던 부분이에요.',visual:'<span>세로<br><b>2가지</b></span><i>×</i><span>가로<br><b>4!=24가지</b></span>'},
      {title:'가운데 네 경우를 모두 곱해요',speech:'가운데 4가지×세로 2가지×가로 24가지=192가지입니다.',visual:'<span>4</span><i>×</i><span>2</span><i>×</i><span>24</span><i>=</i><span><b>192</b></span>'}
    ]},
    30:{title:'짝수 번호만 남기기',page:'008.jpg',view:'45 780 530 520',summary:'매번 다시 붙인 번호의 짝수 자리만 남길 때 원래 번호가 2의 배수로 좁혀지는 규칙을 찾습니다.',answer:'128',answerLabel:'대표의 처음 번호',steps:[
      {title:'첫 번째에는 원래 짝수 번호가 남아요',speech:'1부터 200까지에서 짝수 번호만 남기므로 원래 번호 2, 4, 6, …, 200이 남습니다.',deep:'첫 번째 뒤에는 100명이 남고, 이들을 다시 1부터 100까지 번호 붙입니다.',visual:'<span>처음 200명</span><i>짝수만</i><span><b>2의 배수 100명</b></span>'},
      {title:'다시 짝수 자리만 남겨요',speech:'새 번호의 짝수 번째는 원래 번호로 4의 배수입니다. 다음은 8의 배수, 그다음은 16의 배수가 남아요.',deep:'번호를 다시 붙여도 원래 번호를 함께 적어 보면 2, 4, 8, 16처럼 남는 번호의 간격이 두 배씩 커집니다.',visual:'<span>2의 배수</span><i>→</i><span>4의 배수</span><i>→</i><span>8의 배수</span><i>→</i><span>16의 배수</span>'},
      {title:'200 이하의 2의 거듭제곱을 찾아요',speech:'1, 2, 4, 8, 16, 32, 64, 128 다음은 256입니다. 256은 200을 넘어요.',deep:'한 명이 남을 때의 원래 번호는 처음 인원 이하에서 가장 큰 2의 거듭제곱입니다.',visual:'<span>64</span><i>→</i><span><b>128</b></span><i>→</i><span class="muted">256 &gt; 200</span>'},
      {title:'마지막 한 명의 처음 번호를 답해요',speech:'200 이하에서 가장 큰 2의 거듭제곱은 128이므로 대표는 처음 줄의 128번 학생입니다.',visual:'<span><b>128번</b></span>'}
    ]}
  };
  function scriptedSourceFigure(no){
    var spec=SCRIPTED_TUTORS[no],wrap=document.createElement('div');wrap.className='f7ot-source f7ot-source--scripted';
    wrap.innerHTML='<svg viewBox="'+spec.view+'" role="img" aria-label="최종 7회 '+no+'번 원본 문제"><image href="materials/final_7/'+spec.page+'" x="0" y="0" width="1191" height="1684" preserveAspectRatio="xMidYMid slice"></image></svg>';
    return wrap;
  }
  function scriptedVisual(html){var visual=document.createElement('div');visual.className='f7ot-scripted-visual';visual.innerHTML=html;return visual;}
  function showScripted(no,index,deeper){
    var spec=SCRIPTED_TUTORS[no],step=spec.steps[index];stage=index+1;
    render(function(){
      var section=stageShell(step.title,deeper&&step.deep?step.deep:step.speech,scriptedVisual(step.visual));
      if(index===spec.steps.length-1){var answer=document.createElement('div');answer.className='f7ot-answer';answer.innerHTML=spec.answerLabel+'<strong>'+spec.answer+'</strong>';section.appendChild(answer);}
      return section;
    },index===spec.steps.length-1?[
      {label:'이해했어요 · 마치기',action:function(){dialog().close();},primary:true},
      {label:'앞 단계 다시 보기',action:function(){showScripted(no,index-1,false);}},
      {label:'처음부터 다시 보기',action:function(){showScriptedOriginal(no);}}
    ]:[
      {label:'이해했어요 · 다음 단계',action:function(){showScripted(no,index+1,false);},primary:true},
      {label:deeper?'한 번 더 설명해 주세요':'모르겠어요 · 더 자세히 보여 주세요',action:function(){showScripted(no,index,true);}},
      {label:index?'앞 단계로':'원문 다시 보기',action:function(){if(index)showScripted(no,index-1,false);else showScriptedOriginal(no);}}
    ]);
  }
  function showScriptedOriginal(no){
    var spec=SCRIPTED_TUTORS[no];stage=0;dialog().querySelector('#f7otTitle').textContent='최종 7회 '+no+'번 · '+spec.title;
    render(function(){var section=stageShell('먼저 원문을 다시 볼까요?','원본 문제를 바꾸지 않고, 선생님 대본과 독립 검산이 일치한 순서로 한 단계씩 볼게요.',scriptedSourceFigure(no));var note=document.createElement('p');note.className='f7ot-note';note.textContent='답은 마지막 단계에서만 확인할 수 있습니다.';section.appendChild(note);return section;},[{label:no+'번 풀이 시작',action:function(){showScripted(no,0,false);},primary:true}]);
  }
  function openScripted(no){showScriptedOriginal(no);var node=dialog();if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  function originalCardScripted(no){
    var spec=SCRIPTED_TUTORS[no],card=document.createElement('article');card.className='detailed-solution f7ot-card';card.dataset.solutionNo=String(no);
    var heading=document.createElement('h3');heading.textContent=no+'번 원문 풀이 도우미';var copy=document.createElement('p');copy.textContent=spec.summary;
    card.append(heading,copy,scriptedSourceFigure(no),launch('선생님 대본으로 한 단계씩 보기',false,function(){openScripted(no);}));return card;
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
    Object.keys(SCRIPTED_TUTORS).map(Number).sort(function(a,b){return b-a;}).forEach(function(no){
      if(!solutions.querySelector('.f7ot-card[data-solution-no="'+no+'"]'))solutions.insertBefore(originalCardScripted(no),solutions.firstChild);
    });
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
    Object.keys(SCRIPTED_TUTORS).map(Number).forEach(function(no){
      var row=container.querySelector('#detailWrap tbody:nth-of-type('+no+') tr:first-child .weak-cell');
      if(row)row.replaceChildren(launch(no+'번 풀이',true,function(){openScripted(no);}));
    });
  }
  root.GFIELD_FINAL7_ORIGINAL_TUTOR={attach:attach,openQ6:openQ6,openQ11:openQ11,openQ12:openQ12,openQ13:openQ13,openScripted:openScripted,scriptedTutors:SCRIPTED_TUTORS,sourcePriority:['final7-video-script','independent-verification','basic','think-core']};
})(window);
