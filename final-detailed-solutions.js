(function(root){
  'use strict';

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function integer(value){
    var n=Number(value);
    return Number.isInteger(n)?n:null;
  }

  function text(value){
    return typeof value==='string'&&value.trim()?value.trim():'';
  }

  function scalarText(value){
    if(typeof value==='string') return value.trim();
    return typeof value==='number'&&Number.isFinite(value)?String(value):'';
  }

  function isScalar(value){
    return typeof value==='string'||(typeof value==='number'&&Number.isFinite(value));
  }

  function watermark(){
    return '<div class="final1-watermark" aria-hidden="true"><span>지필드 영재교육</span><span>지필드 영재교육</span><span>지필드 영재교육</span></div>';
  }

  function tableHTML(table,no,stepIndex){
    if(!validTable(table)) return '';
    var width=table.headers.length;
    var headers=table.headers.map(function(cell){return '<th scope="col">'+esc(cell)+'</th>';}).join('');
    var rows=table.rows.filter(function(row){return Array.isArray(row)&&row.length===width;}).map(function(row){
      return '<tr>'+row.map(function(cell){return '<td>'+esc(cell)+'</td>';}).join('')+'</tr>';
    }).join('');
    if(!rows) return '';
    var caption=text(table.caption)||no+'번 '+stepIndex+'단계 정리';
    return '<div class="final1-data-table-wrap"><table class="final1-data-table"><caption>'+esc(caption)+'</caption><thead><tr>'+headers+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  function validTable(table){
    if(!table||!Array.isArray(table.headers)||!table.headers.length||!Array.isArray(table.rows)||!table.rows.length) return false;
    var width=table.headers.length;
    return table.headers.every(function(cell){return scalarText(cell);})&&table.rows.every(function(row){return Array.isArray(row)&&row.length===width&&row.every(isScalar);});
  }

  function validNumberLine(numberLine){
    if(!numberLine||!Array.isArray(numberLine.labels)||!Array.isArray(numberLine.distances)) return false;
    var labels=numberLine.labels.map(scalarText);
    var distances=numberLine.distances.map(Number);
    return labels.length>=2&&labels.every(Boolean)&&distances.length===labels.length-1&&distances.every(function(n){return Number.isFinite(n)&&n>0;});
  }

  function numberLineHTML(numberLine,no){
    if(!validNumberLine(numberLine)) return '';
    var labels=numberLine.labels.map(scalarText);
    var distances=numberLine.distances.map(Number);

    var left=44,right=676,y=70,total=distances.reduce(function(sum,n){return sum+n;},0);
    var points=[left];
    distances.forEach(function(distance){points.push(points[points.length-1]+(right-left)*(distance/total));});
    var id='final1-number-line-title-'+no;
    var marks=points.map(function(x,index){
      var labelY=index%2===0?103:125;
      return '<line class="tick" x1="'+x.toFixed(2)+'" y1="58" x2="'+x.toFixed(2)+'" y2="82"></line><circle class="point" cx="'+x.toFixed(2)+'" cy="'+y+'" r="4"></circle><text x="'+x.toFixed(2)+'" y="'+labelY+'" text-anchor="middle">'+esc(labels[index])+'</text>';
    }).join('');
    var distanceLabels=distances.map(function(distance,index){
      var x=(points[index]+points[index+1])/2;
      return '<text class="distance-label" x="'+x.toFixed(2)+'" y="45" text-anchor="middle">'+esc(distance)+'</text>';
    }).join('');
    var distanceRows=distances.map(function(distance,index){
      return '<tr><td>'+esc(labels[index])+'</td><td>'+esc(labels[index+1])+'</td><td>'+esc(distance)+'</td></tr>';
    }).join('');
    var accessible=labels.map(function(label,index){return index<distances.length?label+'에서 '+labels[index+1]+'까지 '+distances[index]:'';}).filter(Boolean).join(', ');

    return '<figure class="final1-number-line"><figcaption id="'+id+'">실제 거리의 비로 그린 수직선</figcaption><div class="final1-number-line-scroll"><svg viewBox="0 0 720 142" role="img" aria-labelledby="'+id+'"><title>'+esc(accessible)+'</title><line class="axis" x1="'+left+'" y1="'+y+'" x2="'+right+'" y2="'+y+'"></line>'+distanceLabels+marks+'</svg></div><table class="final1-distance-table"><thead><tr><th scope="col">시작</th><th scope="col">끝</th><th scope="col">거리</th></tr></thead><tbody>'+distanceRows+'</tbody></table></figure>';
  }

  function readyItemHTML(solution){
    var no=integer(solution.no);
    var steps=solution.steps.map(function(step,index){
      var title=text(step&&step.title)||'계산하기';
      var body=text(step&&step.body);
      return '<div class="final1-step"><h5><span class="final1-step-index">'+(index+1)+'</span>'+esc(title)+'</h5><p>'+esc(body)+'</p>'+tableHTML(step&&step.table,no,index+1)+'</div>';
    }).join('');
    return '<article class="final1-detailed-card is-ready" id="final1-solution-'+no+'" data-final1-solution-no="'+no+'">'+watermark()+'<div class="final1-card-content"><header class="final1-solution-heading"><span class="final1-no">'+no+'번</span><div><h4>'+esc(solution.title)+'</h4><span class="final1-status">원문 상세 풀이</span></div></header><div class="final1-answer"><strong>정답</strong> · '+esc(solution.answer)+'</div><div class="final1-solution-block"><h5>읽을 조건</h5><p>'+esc(solution.read)+'</p></div><div class="final1-solution-block"><h5>풀이 전략</h5><p>'+esc(solution.method)+'</p></div>'+numberLineHTML(solution.numberLine,no)+'<div class="final1-steps">'+steps+'</div><div class="final1-solution-block final1-check"><h5>검산</h5><p>'+esc(solution.check)+'</p></div><div class="final1-solution-block final1-caution"><h5>주의할 점</h5><p>'+esc(solution.caution)+'</p></div></div></article>';
  }

  function pendingItemHTML(no,title){
    return '<article class="final1-detailed-card is-pending" id="final1-solution-'+no+'" data-final1-solution-no="'+no+'">'+watermark()+'<div class="final1-card-content"><header class="final1-solution-heading"><span class="final1-no">'+no+'번</span><div><h4>'+esc(title||'상세 풀이')+'</h4><span class="final1-status">상세 풀이 준비 중</span></div></header><p class="final1-pending-copy">내용 확인이 끝난 뒤 표시됩니다.</p></div></article>';
  }

  function validSolution(solution,roundItem){
    return !!solution&&solution.reviewStatus==='verified'&&typeof solution.answer==='string'&&solution.answer===String(roundItem.answer)&&text(solution.title)&&text(solution.read)&&text(solution.method)&&Array.isArray(solution.steps)&&solution.steps.length>0&&solution.steps.every(function(step){return text(step&&step.title)&&text(step&&step.body)&&(step.table==null||validTable(step.table));})&&(solution.numberLine==null||validNumberLine(solution.numberLine))&&(Number(roundItem.no)!==7||validNumberLine(solution.numberLine))&&text(solution.check)&&text(solution.caution);
  }

  function render(options){
    options=options||{};
    var roundItems=Array.isArray(options.roundItems)?options.roundItems.slice():[];
    var dataItems=options.data&&Array.isArray(options.data.items)?options.data.items:[];
    var byNo={};
    dataItems.forEach(function(item){
      var no=integer(item&&item.no);
      if(no!==null) byNo[no]=byNo[no]===undefined?item:null;
    });
    roundItems.sort(function(a,b){return Number(a.no)-Number(b.no);});
    var jump=roundItems.map(function(item){
      var no=integer(item.no);
      return '<a href="#final1-solution-'+no+'" aria-label="'+no+'번 상세 풀이로 이동">'+no+'</a>';
    }).join('');
    var cards=roundItems.map(function(roundItem){
      var no=integer(roundItem.no);
      var solution=byNo[no];
      return validSolution(solution,roundItem)?readyItemHTML(solution):pendingItemHTML(no,solution&&text(solution.title));
    }).join('');
    return '<div class="final1-detailed-solutions" id="final1DetailedSolutions"><div class="final1-print-watermark" aria-hidden="true">지필드 영재교육</div><header class="final1-solutions-head"><div class="final1-solutions-title-row"><div><h3>파이널 1회 원문 상세 풀이</h3><p>검수 완료 '+roundItems.filter(function(it){return validSolution(byNo[integer(it.no)],it);}).length+'문항 / 전체 '+roundItems.length+'문항. 준비 중인 풀이를 제외하고 읽을 조건부터 검산까지 확인합니다.</p></div><button type="button" class="final1-print-only no-print" id="printFinal1Solutions">상세 풀이만 인쇄</button></div><nav class="final1-jump no-print" aria-label="상세 풀이 번호 이동"><strong>번호 이동</strong>'+jump+'</nav></header>'+cards+'</div>';
  }

  function wire(){
    var button=document.getElementById('printFinal1Solutions');
    if(!button||button.dataset.wired==='true') return;
    button.dataset.wired='true';
    button.addEventListener('click',function(){
      function cleanup(){document.body.classList.remove('print-final1-solutions');}
      document.body.classList.add('print-final1-solutions');
      window.addEventListener('afterprint',cleanup,{once:true});
      window.print();
    });
  }

  root.GFIELD_FINAL1_DETAILED_RENDERER={render:render,wire:wire};
})(window);
