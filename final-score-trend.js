(function(root){
  'use strict';
  function finite(value){return typeof value==='number'&&Number.isFinite(value)?value:null;}
  function one(value){return Math.round(value*10)/10;}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function grade(percentile,bands){
    if(percentile==null)return null;
    var sorted=(bands||[]).slice().sort(function(a,b){return Number(a[1])-Number(b[1]);});
    var found=sorted.find(function(row){return percentile<=Number(row[1]);});
    return found?String(found[0]):(sorted.length?String(sorted[sorted.length-1][0]):null);
  }
  function model(input,bands){
    var known={};(input||[]).forEach(function(row){
      if(!row||! /^(final|last)[1-4]$/.test(String(row.key))||known[row.key])return;
      var score=finite(row.score),average=finite(row.average),percentile=finite(row.percentile);
      if(score===null||score<0||score>100)return;
      known[row.key]={key:row.key,label:(row.key.indexOf('final')===0?'파이널 ':'최종 ')+row.key.slice(-1)+'회',score:score,
        average:average!==null&&average>=0&&average<=100?average:null,
        percentile:percentile!==null&&percentile>=0&&percentile<=100?percentile:null,
        grade:row.grade?String(row.grade):null};
    });
    var keys=['final1','final2','final3','final4','last1','last2','last3','last4'];
    var rows=keys.map(function(key){return known[key]||null;}).filter(Boolean);
    /* 누적 판정 기준 (2026-10-04 원장님 확정)
       - 최종 응시 없음: 파이널 1~4회 · 파이널 누적 기준표
       - 최종 1회까지: 파이널 1~4회 + 최종 1회
       - 최종 2회부터: 최종 1~N회만 (N = 응시한 가장 늦은 최종 회차)
       최종 기준표는 last-score-data.js 의 그 회차 cumulativeBands.
       회차별 점수표·그래프(rows/slots)는 응시한 모든 회차를 그대로 보여 준다. */
    var lastNo=0;rows.forEach(function(row){if(row.key.indexOf('last')===0)lastNo=Math.max(lastNo,Number(row.key.slice(-1)));});
    var judge=rows,judgeLabel='파이널 1~4회',judgeBands=bands;
    if(lastNo>=1){
      judge=lastNo===1?rows:rows.filter(function(row){return row.key.indexOf('last')===0;});
      judgeLabel=lastNo===1?'파이널 1~4회 + 최종 1회':'최종 1~'+lastNo+'회';
      var lastData=root.GFIELD_LAST_SCORE_DATA,lastRound=lastData&&lastData.rounds&&lastData.rounds[String(lastNo)];
      judgeBands=lastRound&&Array.isArray(lastRound.cumulativeBands)&&lastRound.cumulativeBands.length
        ?lastRound.cumulativeBands.map(function(b){return [String(b[1]).replace(/,/g,' · '),Number(b[0])];}):null;
    }
    var ranked=judge.filter(function(row){return row.percentile!==null;});
    var scoreAverage=judge.length?one(judge.reduce(function(sum,row){return sum+row.score;},0)/judge.length):null;
    var percentileAverage=ranked.length?one(ranked.reduce(function(sum,row){return sum+row.percentile;},0)/ranked.length):null;
    return {rows:rows,slots:keys.map(function(key){return known[key]||null;}),scoreAverage:scoreAverage,
      percentileAverage:percentileAverage,cumulativeGrade:grade(percentileAverage,judgeBands),rankedCount:ranked.length,
      judgeLabel:judgeLabel,judgeCount:judge.length,lastRound:lastNo};
  }
  function chart(vm,field,meanField,title,reverse){
    var left=35,right=625,top=18,bottom=105,width=right-left,height=bottom-top;
    function xy(index,value){return [left+width*index/7,reverse?top+height*value/100:bottom-height*value/100];}
    function paths(key){
      var runs=[],run=[];vm.slots.forEach(function(row,index){
        var value=row&&finite(row[key]);if(value===null){if(run.length)runs.push(run);run=[];return;}
        run.push(xy(index,value));
      });if(run.length)runs.push(run);
      return runs.map(function(points){return points.length>1?'<polyline points="'+points.map(function(p){return p.join(',');}).join(' ')+'"/>':'';}).join('');
    }
    function dots(key,cls){return vm.slots.map(function(row,index){var value=row&&finite(row[key]);if(value===null)return '';var p=xy(index,value);return '<circle class="'+cls+'" cx="'+p[0]+'" cy="'+p[1]+'" r="3.6"/>';}).join('');}
    var axis=[0,50,100].map(function(value){var y=reverse?top+height*value/100:bottom-height*value/100;return '<line x1="'+left+'" x2="'+right+'" y1="'+y+'" y2="'+y+'"/><text x="29" y="'+(y+3)+'" text-anchor="end">'+value+'</text>';}).join('');
    var labels=vm.slots.map(function(_,index){return '<text x="'+(left+width*index/7)+'" y="125" text-anchor="middle">'+(index<4?'파'+(index+1):'최'+(index-3))+'</text>';}).join('');
    return '<div class="score-trend-chart"><h3>'+esc(title)+'</h3><svg viewBox="0 0 650 132" role="img" aria-label="'+esc(title)+' 회차별 꺾은선 그래프"><g class="trend-axis">'+axis+labels+'</g>'+
      (meanField?'<g class="trend-mean">'+paths(meanField)+dots(meanField,'mean-dot')+'</g>':'')+
      '<g class="trend-personal">'+paths(field)+dots(field,'personal-dot')+'</g></svg><p>'+(meanField?'<span class="legend-personal">● 원점수</span> <span class="legend-mean">● 회차 평균</span>':'● 석차 백분율 · 위쪽이 상위')+'</p></div>';
  }
  function render(vm){
    var rows=vm.rows.map(function(row){return '<tr><th scope="row">'+esc(row.label)+'</th><td>'+row.score.toFixed(1)+'</td><td>'+(row.average===null?'—':row.average.toFixed(1))+'</td><td>'+(row.percentile===null?'—':row.percentile.toFixed(1)+'%')+'</td><td>'+(row.grade?esc(row.grade):'—')+'</td></tr>';}).join('');
    return '<section class="final-score-trend" id="report-score-trend"><h2>파이널·최종 성적 추이</h2><p class="score-trend-lead">파이널 1~4회와 최종 1~4회 중 응시한 최초 성적만 반영합니다. 시그니처 특강과 재응시는 제외합니다.</p>'+
      (vm.rows.length?'<div class="score-trend-charts">'+chart(vm,'score','average','원점수와 회차 평균',false)+chart(vm,'percentile',null,'예상 석차 백분율',true)+'</div><div class="score-trend-table-wrap"><table><thead><tr><th>응시 회차</th><th>원점수</th><th>회차 평균</th><th>석차 백분율</th><th>예상 등급</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="score-trend-empty">반영할 최초 응시 성적이 없습니다.</p>')+
      '<div class="score-trend-cumulative"><span>누적 판정 · '+esc(vm.judgeLabel||'파이널·최종')+' ('+(vm.judgeCount==null?vm.rows.length:vm.judgeCount)+'회)</span><span>원점수 평균 <b>'+(vm.scoreAverage===null?'—':vm.scoreAverage.toFixed(1)+'점')+'</b></span><span>누적 예상 석차 백분율 <b>'+(vm.percentileAverage===null?'—':vm.percentileAverage.toFixed(1)+'%')+'</b></span><span>누적 예상 등급 <b>'+(vm.cumulativeGrade?esc(vm.cumulativeGrade):'—')+'</b></span></div>'+
      '<p class="score-trend-note">누적 백분율은 확인된 회차별 예상 석차 백분율의 평균('+vm.rankedCount+'/'+(vm.judgeCount==null?vm.rows.length:vm.judgeCount)+'회)입니다. 최종 2회부터는 최종 모의고사 성적만으로 판정하며, 위 점수표와 그래프에는 응시한 모든 회차를 표시합니다. 자료가 없는 칸은 0점으로 처리하지 않습니다. 백분율이 작을수록 상위이며, 등급은 예상치입니다.</p></section>';
  }
  var api={model:model,render:render,grade:grade};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.GFIELD_FINAL_SCORE_TREND=api;
})(typeof window==='object'?window:globalThis);
