/* 10월 최종 모의고사 · 학생용 시험지 인라인 도형 */
(function(){
  'use strict';

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function svg(title, viewBox, body, cls){
    return '<svg class="exam-figure '+(cls||'')+'" viewBox="'+viewBox+'" role="img" aria-label="'+esc(title)+'" xmlns="http://www.w3.org/2000/svg">'+
      '<title>'+esc(title)+'</title>'+body+'</svg>';
  }
  function line(x1,y1,x2,y2,extra){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" '+(extra||'')+'/>';
  }

  function paperFold(){
    var b='<defs><marker id="pf-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#334155"/></marker></defs>';
    var x0=8,y0=8,cw=25,ch=22;
    for(var r=0;r<3;r++){
      for(var c=0;c<9;c++){
        b+='<rect x="'+(x0+c*cw)+'" y="'+(y0+r*ch)+'" width="'+cw+'" height="'+ch+'" fill="#fff" stroke="#64748b" stroke-width="1"/>'+
          '<text x="'+(x0+c*cw+cw/2)+'" y="'+(y0+r*ch+15)+'" text-anchor="middle" font-size="10" fill="#0f172a">'+(r*9+c+1)+'</text>';
      }
    }
    b+='<g transform="translate(8 91)">'+
      '<rect x="0" y="0" width="135" height="43" fill="#fff" stroke="#64748b"/>'+
      '<line x1="45" y1="0" x2="45" y2="43" stroke="#94a3b8" stroke-dasharray="3 2"/>'+
      '<line x1="90" y1="0" x2="90" y2="43" stroke="#94a3b8" stroke-dasharray="3 2"/>'+
      '<path d="M16 29C20 15 33 9 48 13" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '<path d="M119 29C115 15 102 9 87 13" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '</g>'+
      '<path d="M151 112H172" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '<g transform="translate(179 83)">'+
      '<rect x="0" y="0" width="57" height="57" fill="#fff" stroke="#64748b"/>'+
      '<line x1="0" y1="19" x2="57" y2="19" stroke="#94a3b8" stroke-dasharray="3 2"/>'+
      '<line x1="0" y1="38" x2="57" y2="38" stroke="#94a3b8" stroke-dasharray="3 2"/>'+
      '<path d="M21 7C30 11 31 19 24 25" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '<path d="M36 50C45 45 45 35 36 30" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '</g>'+
      '<path d="M243 112H262" stroke="#334155" marker-end="url(#pf-arr)"/>'+
      '<g transform="translate(269 99)"><rect x="0" y="0" width="74" height="28" fill="#fff" stroke="#64748b"/><line x1="25" y1="0" x2="25" y2="28" stroke="#94a3b8" stroke-dasharray="3 2"/><line x1="49" y1="0" x2="49" y2="28" stroke="#94a3b8" stroke-dasharray="3 2"/><path d="M16 22C12 13 17 7 24 7" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/><path d="M58 22C62 13 57 7 50 7" fill="none" stroke="#334155" marker-end="url(#pf-arr)"/></g>';
    return svg('1부터 27까지 적힌 3행 9열 모눈종이와 왼쪽·위쪽 순서의 접기 과정','0 0 352 148',b,'wide');
  }

  function rectangleGrid(){
    var b='',x0=17,y0=10,w=47,h=31;
    for(var r=0;r<4;r++) for(var c=0;c<5;c++){
      var mark=(r===1&&c===3)?'ㄱ':(r===3&&c===0)?'ㄴ':'';
      var fill=mark?'#dbeafe':'#fff';
      b+='<rect x="'+(x0+c*w)+'" y="'+(y0+r*h)+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="#334155"/>';
      if(mark) b+='<text x="'+(x0+c*w+w/2)+'" y="'+(y0+r*h+21)+'" text-anchor="middle" font-size="15" font-weight="700" fill="#1e3a8a">'+mark+'</text>';
    }
    return svg('5열 4행 격자에서 둘째 줄 넷째 칸은 ㄱ, 넷째 줄 첫째 칸은 ㄴ','0 0 270 145',b);
  }

  function symbolNumber(){
    var b='<rect x="7" y="7" width="356" height="54" rx="8" fill="#fff" stroke="#94a3b8"/>'+
      '<rect x="7" y="75" width="356" height="50" rx="8" fill="#fff" stroke="#94a3b8"/>';
    var groups=['♣☆♧','♧♤♡','★♡♠','♤☆♥'], nums=['827','135','936','592'];
    for(var i=0;i<4;i++){
      var x=54+i*85;
      b+='<text x="'+x+'" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#111827">'+groups[i]+'</text>'+
        '<text x="'+x+'" y="108" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#111827">'+nums[i]+'</text>';
    }
    return svg('채운 모양과 윤곽 모양으로 된 네 기호 묶음, 아래에는 827, 135, 936, 592','0 0 370 133',b,'wide');
  }

  function octagon(cx,cy,dots){
    var pts=[];
    for(var i=0;i<8;i++){
      var a=-Math.PI/2+i*Math.PI/4;
      pts.push((cx+31*Math.cos(a)).toFixed(1)+','+(cy+31*Math.sin(a)).toFixed(1));
    }
    var s='<polygon points="'+pts.join(' ')+'" fill="#fffdf5" stroke="#8a6b16" stroke-width="1.5"/>';
    for(var j=0;j<8;j++){
      var aa=-Math.PI/2+j*Math.PI/4;
      s+=line(cx,cy,(cx+31*Math.cos(aa)).toFixed(1),(cy+31*Math.sin(aa)).toFixed(1),'stroke="#475569" stroke-width="1"');
    }
    dots.forEach(function(idx){
      var a=-Math.PI/2+(idx+.5)*Math.PI/4;
      s+='<circle cx="'+(cx+18*Math.cos(a)).toFixed(1)+'" cy="'+(cy+18*Math.sin(a)).toFixed(1)+'" r="3.6" fill="#14532d"/>';
    });
    return s;
  }
  function octagonDots(){
    var b='<defs><marker id="od-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#9a6a12"/></marker></defs>';
    var xs=[39,132,225,318], ds=[[0],[0,2],[0,2,5],[0,1,2,5]];
    for(var i=0;i<4;i++){
      b+=octagon(xs[i],42,ds[i]);
      if(i<3) b+='<path d="M'+(xs[i]+39)+' 42H'+(xs[i+1]-39)+'" stroke="#9a6a12" stroke-width="1.5" marker-end="url(#od-arr)"/>';
    }
    return svg('정팔각형의 여덟 삼각형에 점을 규칙적으로 늘려 찍는 네 단계','0 0 357 84',b,'wide');
  }

  function josephusCircle(){
    var cx=110,cy=82,r=59,b='';
    for(var i=1;i<=25;i++){
      var a=-Math.PI/2+(i-1)*2*Math.PI/25;
      var x=cx+r*Math.cos(a), y=cy+r*Math.sin(a);
      b+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7.2" fill="#fff" stroke="#94a3b8"/>'+
        '<text x="'+x.toFixed(1)+'" y="'+(y+2.8).toFixed(1)+'" text-anchor="middle" font-size="6.8" fill="#334155">'+i+'</text>';
    }
    return svg('1번부터 25번까지 시계 방향으로 둘러앉은 선원','0 0 220 164',b);
  }

  function sequenceStrip(){
    var b='',x0=4,y=14,w=16,h=25, labels={2:'ㄱ',5:'6',9:'ㄴ',10:'5',15:'ㄷ',20:'8'};
    for(var i=1;i<=20;i++){
      b+='<rect x="'+(x0+(i-1)*w)+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#fff" stroke="#64748b"/>';
      if(labels[i]) b+='<text x="'+(x0+(i-.5)*w)+'" y="31" text-anchor="middle" font-size="11" fill="#0f172a">'+labels[i]+'</text>';
    }
    return svg('20칸 띠에서 2번째 칸 ㄱ, 5번째 6, 9번째 ㄴ, 10번째 5, 15번째 ㄷ, 20번째 8','0 0 328 52',b,'wide');
  }

  function stoneIntervals(){
    var xs=[17,75,162,309],b='<path d="M17 33H309" stroke="#64748b" stroke-width="2"/>';
    xs.forEach(function(x){ b+='<circle cx="'+x+'" cy="33" r="8" fill="#334155" stroke="#0f172a"/>'; });
    ['20cm','30cm','55cm'].forEach(function(t,i){ b+='<text x="'+((xs[i]+xs[i+1])/2)+'" y="17" text-anchor="middle" font-size="11" fill="#475569">'+t+'</text>'; });
    return svg('검은 바둑돌 네 개 사이의 간격이 차례로 20cm, 30cm, 55cm','0 0 326 52',b,'wide');
  }

  function flag(x,y,color,label){
    return '<path d="M'+x+' '+y+' C'+(x+15)+' '+(y-8)+','+(x+29)+' '+(y+8)+','+(x+45)+' '+y+' V'+(y+23)+' C'+(x+29)+' '+(y+31)+','+(x+15)+' '+(y+15)+','+x+' '+(y+23)+'Z" fill="'+color+'" stroke="#64748b" stroke-width=".7"/>'+
      '<text x="'+(x+23)+'" y="'+(y+15)+'" text-anchor="middle" font-size="8" font-weight="700" fill="'+(color==='#facc15'?'#713f12':'#fff')+'">'+label+'</text>';
  }
  function signalFlags(){
    var b='';
    b+=flag(9,10,'#dc2626','빨간색')+flag(68,10,'#facc15','노란색')+flag(127,10,'#2563eb','파란색');
    b+=flag(9,50,'#dc2626','빨간색')+flag(68,50,'#facc15','노란색')+flag(127,50,'#2563eb','파란색');
    b+='<line x1="207" y1="5" x2="207" y2="83" stroke="#64748b" stroke-width="4"/><circle cx="207" cy="5" r="5" fill="#94a3b8"/><rect x="202" y="80" width="10" height="13" fill="#475569"/>';
    return svg('빨간색, 노란색, 파란색 깃발이 각각 두 개와 깃대','0 0 225 96',b);
  }

  function cubeRoute(){
    var b='<defs><marker id="cr-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#475569"/></marker></defs>';
    b+='<g transform="translate(2 58)">'+
      '<polygon points="32,20 74,20 91,5 49,5" fill="#f8fafc" stroke="#334155"/>'+
      '<polygon points="32,20 74,20 74,62 32,62" fill="#e2e8f0" stroke="#334155"/>'+
      '<polygon points="74,20 91,5 91,47 74,62" fill="#cbd5e1" stroke="#334155"/>'+
      '<line x1="49" y1="5" x2="49" y2="47" stroke="#64748b" stroke-dasharray="3 2"/><line x1="49" y1="47" x2="91" y2="47" stroke="#64748b" stroke-dasharray="3 2"/><line x1="32" y1="62" x2="49" y2="47" stroke="#64748b"/>'+
      '<text x="58" y="17" text-anchor="middle" font-size="12">1</text><text x="55" y="45" text-anchor="middle" font-size="12">2</text><text x="82" y="38" text-anchor="middle" font-size="12">3</text>'+
      '<text x="14" y="45" font-size="11">4</text><path d="M20 42H31" stroke="#334155" marker-end="url(#cr-arr)"/>'+
      '<text x="61" y="-3" font-size="11">5</text><path d="M58 1V5" stroke="#334155" marker-end="url(#cr-arr)"/>'+
      '<text x="58" y="79" font-size="11">6</text><path d="M55 72V63" stroke="#334155" marker-end="url(#cr-arr)"/>'+
      '</g>';
    var gx=120,gy=8,s=35;
    for(var r=0;r<5;r++) for(var c=0;c<5;c++) b+='<rect x="'+(gx+c*s)+'" y="'+(gy+r*s)+'" width="'+s+'" height="'+s+'" fill="#f1f5f9" stroke="#64748b"/>';
    b+='<text x="'+(gx+s/2)+'" y="'+(gy+s+23)+'" text-anchor="middle" font-size="14" font-weight="700">6</text>'+
      '<text x="'+(gx+s+s/2)+'" y="'+(gy+s+23)+'" text-anchor="middle" font-size="14" font-weight="700">3</text>'+
      '<circle cx="'+(gx+3.5*s)+'" cy="'+(gy+4.5*s)+'" r="12" fill="#fff" stroke="#94a3b8"/><text x="'+(gx+3.5*s)+'" y="'+(gy+4.5*s+4)+'" text-anchor="middle" font-size="12">가</text>';
    var segs=[
      [gx+.5*s,gy+1.5*s,gx+1.5*s,gy+1.5*s],
      [gx+1.5*s,gy+1.5*s,gx+1.5*s,gy+.5*s],
      [gx+1.5*s,gy+.5*s,gx+4.5*s,gy+.5*s],
      [gx+4.5*s,gy+.5*s,gx+4.5*s,gy+2.5*s],
      [gx+4.5*s,gy+2.5*s,gx+1.5*s,gy+2.5*s],
      [gx+1.5*s,gy+2.5*s,gx+1.5*s,gy+3.5*s],
      [gx+1.5*s,gy+3.5*s,gx+3.5*s,gy+3.5*s],
      [gx+3.5*s,gy+3.5*s,gx+3.5*s,gy+4.5*s]
    ];
    segs.forEach(function(v){ b+=line(v[0],v[1],v[2],v[3],'stroke="#475569" stroke-width="1.8" marker-end="url(#cr-arr)"'); });
    return svg('위 1, 앞 2, 오른쪽 3, 왼쪽 4, 뒤 5, 아래 6인 정육면체와 5행 5열 경로','0 0 305 190',b,'wide');
  }

  function skipCircle(){
    var cx=85,cy=73,r=52,pts=[],b='';
    for(var i=1;i<=9;i++){
      var a=-Math.PI/2+(i-1)*2*Math.PI/9;
      var x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
      pts.push([x,y]);
      b+='<text x="'+(cx+(r+15)*Math.cos(a)).toFixed(1)+'" y="'+(cy+(r+15)*Math.sin(a)+4).toFixed(1)+'" text-anchor="middle" font-size="12" fill="#334155">'+i+'</text>';
    }
    b+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff" stroke="#64748b"/>';
    var order=[0,2,4,6,8,1,3,5,7,0];
    b+='<polyline points="'+order.map(function(i){return pts[i][0].toFixed(1)+','+pts[i][1].toFixed(1);}).join(' ')+'" fill="none" stroke="#475569" stroke-width="1.5"/>';
    return svg('1부터 9까지 시계 방향으로 적힌 원판에서 숫자를 하나씩 건너뛴 별 모양 경로','0 0 170 146',b);
  }

  function binaryTable(){
    return '<div class="figure-html binary-code" role="img" aria-label="A부터 K까지의 알파벳과 다섯 자리 코드 표">'+
      '<table><tbody>'+
      '<tr><th>A</th><td>00001</td><th>B</th><td>00010</td><th>C</th><td>00011</td></tr>'+
      '<tr><th>D</th><td>00100</td><th>E</th><td>00101</td><th>F</th><td>00110</td></tr>'+
      '<tr><th>G</th><td>00111</td><th>H</th><td>01000</td><th>I</th><td>01001</td></tr>'+
      '<tr><th>J</th><td>01010</td><th>K</th><td>01011</td><th>…</th><td>…</td></tr>'+
      '</tbody></table></div>';
  }

  function repeatedThreeSum(){
    return '<div class="figure-html repeat-sum" role="img" aria-label="3, 33, 333부터 3이 천 개 이어진 수까지 더하는 식">'+
      '<span>3 + 33 + 333 + ··· + </span><span class="underbrace"><span>33 ··· 33</span><i>3이 1000개</i></span></div>';
  }

  function jobClues(){
    return '<div class="figure-html clue-box" role="img" aria-label="세 사람의 직업을 찾기 위한 일곱 조건"><ul>'+
      '<li>약사는 가수에게 노래를 불러 달라고 부탁하였습니다.</li>'+
      '<li>감독과 이발사는 갑을 좋아합니다.</li>'+
      '<li>감독과 이발사는 서로 다른 사람입니다.</li>'+
      '<li>가수는 배우와 친구입니다.</li>'+
      '<li>약사는 감독에게 약을 지어주었습니다.</li>'+
      '<li>을은 이발사의 이웃에 삽니다.</li>'+
      '<li>병은 바둑을 두어 을과 가수를 이겼습니다.</li>'+
      '</ul></div>';
  }

  function cryptarithm(){
    function boxes(n, indent, labels){
      var s='<div class="crypt-row" style="padding-left:'+indent+'px">';
      for(var i=0;i<n;i++) s+='<span class="crypt-box">'+(labels&&labels[i]?labels[i]:'')+'</span>';
      return s+'</div>';
    }
    function givenThenBoxes(value, n, indent){
      var s='<div class="crypt-row" style="padding-left:'+indent+'px"><span class="crypt-given" style="display:inline-flex;width:22px;height:22px;align-items:center;justify-content:center;font-size:13px">'+value+'</span>';
      for(var i=0;i<n;i++) s+='<span class="crypt-box"></span>';
      return s+'</div>';
    }
    return '<div class="figure-html crypt" role="img" aria-label="ㄱㄴㄷㄹ을 제곱하는 세로셈의 부분곱과 여덟 자리 결과">'+
      '<div class="crypt-num">ㄱ&nbsp;&nbsp;ㄴ&nbsp;&nbsp;ㄷ&nbsp;&nbsp;ㄹ</div>'+
      '<div class="crypt-num">×&nbsp;&nbsp;ㄱ&nbsp;&nbsp;ㄴ&nbsp;&nbsp;ㄷ&nbsp;&nbsp;ㄹ</div>'+
      '<div class="crypt-line"></div>'+boxes(4,112)+boxes(4,76)+givenThenBoxes('9',3,40)+
      '<div class="crypt-line"></div>'+boxes(8,0)+'</div>';
  }

  function last2Asset(title, file, cls){
    return '<img class="exam-figure '+(cls||'')+'" src="mock-assets/last2/'+esc(file)+'" alt="'+esc(title)+'" loading="eager">';
  }

  function last2OperationRule(){
    return '<div class="figure-html" role="img" aria-label="숫자판과 사칙연산 보기로 도형식을 계산하는 규칙">'+
      '<img src="mock-assets/last2/q15-rule.png" alt="가와 나의 숫자판 규칙 및 보기" style="display:block;width:100%;max-height:128px;object-fit:contain">'+
      '<img src="mock-assets/last2/q15-expression.png" alt="계산할 도형식" style="display:block;width:100%;max-height:42px;object-fit:contain;margin-top:5px">'+
      '</div>';
  }

  function last2ProductSum(){
    return '<div class="figure-html repeat-sum" role="img" aria-label="1 곱하기 2부터 100 곱하기 101까지의 합">'+
      '1 × 2 + 2 × 3 + 3 × 4 + ··· + 100 × 101</div>';
  }

  function last2OxTable(){
    var rows=[
      ['갑','○','×','×','×','○','○','○','×','×','○','7'],
      ['을','×','×','○','×','○','×','×','○','○','○','7'],
      ['병','○','×','○','○','×','×','○','×','○','×','7'],
      ['정','○','×','○','×','○','×','○','○','○','○','']
    ];
    var h='<div class="figure-html binary-code" role="img" aria-label="갑, 을, 병, 정의 열 문제 OX 답안표"><table><thead><tr><th></th>';
    for(var n=1;n<=10;n++) h+='<th>'+n+'</th>';
    h+='<th>정답수</th></tr></thead><tbody>';
    rows.forEach(function(row){
      h+='<tr><th>'+row[0]+'</th>';
      for(var i=1;i<row.length;i++) h+='<td>'+row[i]+'</td>';
      h+='</tr>';
    });
    return h+'</tbody></table></div>';
  }

  function last2MatchstickBlocks(){
    return '<div class="figure-html" role="img" aria-label="쌓기나무 13개 모양과 성냥개비로 만든 두 쌓기나무의 보기">'+
      '<div style="display:grid;grid-template-columns:minmax(80px,.34fr) minmax(0,1.66fr);gap:9px;align-items:center">'+
      '<img src="mock-assets/last2/q29-small-blocks.png" alt="쌓기나무 13개의 입체 모양" style="display:block;width:100%;max-height:105px;object-fit:contain">'+
      '<img src="mock-assets/last2/q29-matchstick-blocks.png" alt="쌓기나무 두 개의 성냥개비 보기와 목표 모양" style="display:block;width:100%;max-height:125px;object-fit:contain">'+
      '</div></div>';
  }

  window.GFIELD_LAST_FIGURES = {
    'paper-fold':paperFold,
    'rectangle-grid':rectangleGrid,
    'symbol-number':symbolNumber,
    'octagon-dots':octagonDots,
    'josephus-circle':josephusCircle,
    'sequence-strip':sequenceStrip,
    'stone-intervals':stoneIntervals,
    'signal-flags':signalFlags,
    'cube-route':cubeRoute,
    'skip-circle':skipCircle,
    'binary-table':binaryTable,
    'repeated-three-sum':repeatedThreeSum,
    'job-clues':jobClues,
    'cryptarithm':cryptarithm,
    'last2-calendar':function(){return last2Asset('3월 1일이 금요일인 달력의 일부','q03-calendar.png');},
    'last2-block-views':function(){return last2Asset('쌓기나무를 위, 앞, 오른쪽 옆에서 본 모양','q05-block-views.png','wide');},
    'last2-rectangles':function(){return last2Asset('겹친 직사각형과 가로세로선으로 이루어진 그림','q06-rectangles.png');},
    'last2-stones':function(){return last2Asset('흰 돌과 검은 돌을 번갈아 늘어놓은 첫 네 그림','q07-stones.png','wide');},
    'last2-breadcrumb-conditions':function(){return last2Asset('빵 조각 간격 25미터, 간격 수 221개, 1분 이동 거리 85미터','q08-conditions.png','wide');},
    'last2-number-array':function(){return last2Asset('1부터 199까지 한 칸씩 밀려 배열된 백 행의 수 배열표','q11-number-array.png','wide');},
    'last2-number-cards':function(){return last2Asset('4, 6, 8, 7, 9가 적힌 숫자 카드','q12-number-cards.png','wide');},
    'last2-operation-rule':last2OperationRule,
    'last2-number-grid':function(){return last2Asset('1부터 25까지 바깥에서 안쪽으로 휘어 배열된 수 배열표','q17-number-grid.png');},
    'last2-diagonal-array':function(){return last2Asset('자연수를 대각선 방향으로 배열한 표','q19-diagonal-array.png');},
    'last2-salt-field':function(){return last2Asset('A와 B의 물이 다섯 갈림길을 거쳐 네 출구로 흐르는 염전 물길','q20-salt-field.png');},
    'last2-digit-cards':function(){return last2Asset('0, 1, 2, 4, 8, 9가 적힌 숫자 카드','q24-digit-cards.png','wide');},
    'last2-product-sum':last2ProductSum,
    'last2-ox-table':last2OxTable,
    'last2-matchstick-blocks':last2MatchstickBlocks
  };
})();
