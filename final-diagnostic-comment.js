(function(root){
  'use strict';
  var round=function(x){return Math.round(x*10)/10;};
  var escape=function(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  function analyze(ctx,options){
    options=options||{};
    var ox=ctx.oxArr||[], items=ctx.items||[];
    if(!items.length||items.some(function(it){return ox[it.no-1]!=='O'&&ox[it.no-1]!=='X';}))return null;
    var rows=items.map(function(it){
      var tx=options.taxonomy?options.taxonomy(ctx.roundNum,it):{},p=options.points?options.points(it.no):it.pts;
      return {no:it.no,ok:ox[it.no-1]==='O',points:Number(p),item:it,area:tx.area||it.area||'',
        type:tx.detailType||it.detailType||it.type||'',subarea:tx.subarea||it.subarea||'',
        confirmed:tx.reviewRequired===false};
    });
    if(rows.some(function(r){return !Number.isFinite(r.points)||r.points<=0;})||new Set(rows.map(function(r){return r.no;})).size!==rows.length||Math.abs(rows.reduce(function(s,r){return s+r.points;},0)-100)>.05)return null;
    var actual=round(rows.filter(function(r){return r.ok;}).reduce(function(s,r){return s+r.points;},0));
    if(Math.abs(actual-Number(ctx.score))>.05)return null;
    var wrong=rows.filter(function(r){return !r.ok;}),correct=rows.filter(function(r){return r.ok;});
    wrong.forEach(function(r){
      r.related=correct.filter(function(c){return r.confirmed&&c.confirmed&&r.type&&c.type===r.type&&c.area===r.area&&c.subarea===r.subarea;}).map(function(c){return c.no;});
    });
    function aggregate(key){
      var map=new Map();rows.forEach(function(r){
        var k=r[key],g=map.get(k)||{k:k,n:0,cor:0,tot:0,got:0};
        g.n++;g.tot+=r.points;if(r.ok){g.cor++;g.got+=r.points;}map.set(k,g);
      });
      return Array.from(map.values()).map(function(g){g.tot=round(g.tot);g.got=round(g.got);g.perf=round(g.got/g.tot*100);return g;});
    }
    var areas=aggregate('area');
    var strengths=areas.filter(function(a){return a.n>=2&&a.perf>=70;}).sort(function(a,b){return b.perf-a.perf||b.got-a.got;});
    var strongNames=strengths.map(function(a){return a.k;});
    var verified=(ctx.ratesVerified===true||ctx.populationVerified===true)&&typeof options.verifyPopulation==='function'&&options.verifyPopulation(ctx.S)===true;
    wrong.forEach(function(r){
      r.strongArea=strongNames.indexOf(r.area)>=0;
      var rate=ctx.S&&ctx.S.rate&&ctx.S.rate[r.no];
      r.rate=verified&&typeof rate==='number'&&Number.isFinite(rate)&&rate>=0&&rate<=1?rate:null;
      r.recovery=r.strongArea&&r.rate!==null&&r.rate>=.7;
    });
    // Teacher's prioritisation is distinct from evidence and never compares
    // item response rate with the student's rank percentile.
    var priority=wrong.slice().sort(function(a,b){return Number(b.recovery)-Number(a.recovery)||(a.recovery&&b.recovery?b.rate-a.rate:0)||Number(b.related.length>0)-Number(a.related.length>0)||Number(b.strongArea)-Number(a.strongArea)||a.points-b.points||a.no-b.no;}).slice(0,3);
    var gain=round(priority.reduce(function(s,r){return s+r.points;},0));
    var weak=areas.filter(function(a){return a.cor<a.n;}).sort(function(a,b){return round(b.tot-b.got)-round(a.tot-a.got)||a.perf-b.perf;});
    var tiers=aggregate('points').sort(function(a,b){return a.k-b.k;});
    var history=Array.isArray(options.history)?options.history:[], seenRounds=new Set(), past=[];
    history.forEach(function(h){
      var rn=Number(h.round);
      if(!Number.isInteger(rn)||rn<1||rn===Number(ctx.roundNum)||seenRounds.has(rn)||!Array.isArray(h.items)||!Array.isArray(h.oxArr)||!h.items.length||h.items.some(function(it){return h.oxArr[it.no-1]!=='O'&&h.oxArr[it.no-1]!=='X';}))return;
      seenRounds.add(rn);
      h.items.forEach(function(it){
        if(h.oxArr[it.no-1]!=='X')return;
        var tx=options.taxonomy?options.taxonomy(rn,it):{};
        if(tx.reviewRequired!==false)return;
        past.push({round:rn,type:tx.detailType||it.detailType||it.type||'',area:tx.area||it.area||'',subarea:tx.subarea||it.subarea||''});
      });
    });
    wrong.forEach(function(r){r.repeatRounds=r.confirmed?Array.from(new Set(past.filter(function(p){return r.type&&p.type===r.type&&p.area===r.area&&p.subarea===r.subarea;}).map(function(p){return p.round;}))).sort(function(a,b){return a-b;}):[];});
    var used=new Set(priority.map(function(r){return r.no;}));
    var repeated=wrong.filter(function(r){return !used.has(r.no)&&r.repeatRounds.length>0;}).sort(function(a,b){return b.repeatRounds.length-a.repeatRounds.length||a.points-b.points||a.no-b.no;}).slice(0,3);
    repeated.forEach(function(r){used.add(r.no);});
    var challenge=wrong.filter(function(r){return !used.has(r.no)&&r.confirmed&&r.strongArea&&r.related.length>0;}).sort(function(a,b){return a.points-b.points||a.no-b.no;}).slice(0,2);
    var stage2Gain=round(repeated.reduce(function(s,r){return s+r.points;},0));
    var stage3Gain=round(challenge.reduce(function(s,r){return s+r.points;},0));
    return {rows:rows,wrong:wrong,correct:correct,priority:priority,gain:gain,score:actual,target:round(actual+gain),strengths:strengths,weak:weak,tiers:tiers,verified:verified,
      repeated:repeated,challenge:challenge,historyRounds:seenRounds.size,stage2Gain:stage2Gain,stage3Gain:stage3Gain,
      stage2Target:round(actual+gain+stage2Gain),stage3Target:round(actual+gain+stage2Gain+stage3Gain)};
  }
  function scoreGraph(a,e){
    var width=400,current=width*a.score/100,extra=width*a.gain/100;
    return '<figure class="coaching-chart"><svg viewBox="0 0 500 136" role="img" aria-label="'+e('현재 '+a.score+'점, 먼저 복습할 문항을 모두 풀면 '+a.target+'점입니다.')+'">'+
      '<text x="0" y="17" font-size="14" fill="#182230">현재 점수 '+a.score+'점</text><rect x="0" y="28" width="400" height="18" rx="3" fill="#E9EDF3"/><rect x="0" y="28" width="'+current+'" height="18" rx="3" fill="#2456C4"/>'+
      '<text x="0" y="72" font-size="14" fill="#182230">복습 후보 해결 시 '+a.target+'점 (+'+a.gain+'점)</text><rect x="0" y="83" width="400" height="18" rx="3" fill="#E9EDF3"/><rect x="0" y="83" width="'+current+'" height="18" fill="#2456C4"/><rect x="'+current+'" y="83" width="'+extra+'" height="18" fill="#16734B"/>'+
      '<text x="0" y="126" font-size="12" fill="#566274">0점</text><text x="400" y="126" text-anchor="end" font-size="12" fill="#566274">100점</text></svg>'+
      '<figcaption>파랑은 현재 득점, 초록은 선택한 오답의 배점입니다. 두 막대의 눈금은 같습니다.</figcaption></figure>';
  }
  function planHTML(a,ctx,options,e){
    function tasks(rows){
      return rows.length?'<ul>'+rows.map(function(r){
        var books=typeof options.books==='function'?options.books(r.no):[];
        var first=Array.isArray(books)?books.find(function(b){return b&&typeof b.title==='string'&&b.title;}):null;
        var book=first?e(first.title+(first.unit?' · '+first.unit:''))+'에서 다시 보기':('교재 연결표에서 '+r.no+'번과 연결된 학습 위치 찾기');
        return '<li><b>'+r.no+'번 · '+e(r.confirmed?r.type:'유형 확인 중')+'</b> ('+r.points+'점)<br>'+book+(r.repeatRounds&&r.repeatRounds.length?'<br>이전에도 같은 유형을 틀린 회차: '+r.repeatRounds.map(function(n){return n+'회';}).join(', ')+' 및 이번 회차':'')+'</li>';
      }).join('')+'</ul>':'';
    }
    var allCorrect=a.wrong.length===0;
    var stage1='<article class="personal-plan-stage"><h4>1단계 · '+(allCorrect?'강점 재현하기':'되찾을 점수부터')+'</h4><p class="plan-when">첫 학습 · 약 15~20분 권장</p>'+
      (allCorrect?'<p>맞힌 문제 중 풀이가 길었던 두 문제를 골라 해설 없이 설명합니다. 만점이어도 낯선 조건에서 같은 방법을 쓸 수 있는지 한 번 더 풀어 보세요.</p>':tasks(a.priority)+'<p>조건에 밑줄을 긋고 스스로 다시 풉니다. 막힌 경우 상세답안에서 그 단계만 확인한 뒤 처음부터 다시 풀어 보세요.</p>')+
      '<p><b>완료 기준:</b> 정답뿐 아니라 “왜 이 식·그림을 쓰는지”를 도움 없이 설명할 수 있습니다.</p><p class="plan-score">'+(allCorrect?'점수 상승 계산 없음':a.score+'점 → '+a.target+'점 · 이 단계 +'+a.gain+'점')+'</p></article>';
    var noRepeat=a.historyRounds?'이전 시험까지 살펴보았지만, 따로 다시 풀 유형은 없습니다. 1단계에서 푼 문제는 다시 넣지 않습니다.':'이전 시험 기록이 없어 반복해서 어려웠던 유형은 아직 알 수 없습니다.';
    var stage2='<article class="personal-plan-stage"><h4>2단계 · 반복 약점 보완</h4><p class="plan-when">1단계 완료 후 · 약 20~25분 권장</p>'+
      (a.repeated.length?tasks(a.repeated)+'<p>연결 교재에서 개념과 예제 풀이를 확인하고, 이번 오답을 다시 풉니다. 연결된 유사문제가 준비된 경우 같은 유형 3문제로 방법을 바꾸어 적용해 보세요.</p>':'<p>'+noRepeat+' 새 약점을 만들어 배정하지 않고, 1단계 문항을 다음 날 다시 확인합니다.</p>')+
      '<p><b>완료 기준:</b> 해설 없이 다시 풀고, 전에 막혔던 단계와 달라진 풀이를 설명합니다.</p><p class="plan-score">'+(a.repeated.length?a.stage2Target+'점 · 이 단계 +'+a.stage2Gain+'점 · 1~2단계 합계 +'+round(a.gain+a.stage2Gain)+'점':'추가 점수 합산 없음')+'</p></article>';
    var stage3='<article class="personal-plan-stage"><h4>3단계 · 다음 수준 도전</h4><p class="plan-when">앞 단계 완료 후 · 약 20분 권장</p>'+
      (a.challenge.length?tasks(a.challenge)+'<p>이미 맞힌 같은 유형과 연결된 추가 문제입니다. 조건을 정리해 먼저 스스로 풀고, 어렵다면 어떤 개념이 막혔는지 선생님과 함께 찾아보세요.</p>':'<p>다음으로 풀 도전 문제는 선생님과 함께 고릅니다. 앞 단계의 풀이를 다시 설명한 뒤, 조건이 조금 달라진 같은 유형의 문제를 골라 보세요.</p>')+
      '<p><b>완료 기준:</b> 달라진 조건을 짚고, 기존 풀이에서 무엇을 바꿨는지 설명합니다.</p><p class="plan-score">'+(a.challenge.length?a.stage3Target+'점 · 이 단계 +'+a.stage3Gain+'점 · 전체 합계 +'+round(a.gain+a.stage2Gain+a.stage3Gain)+'점':'새로운 도전 문제의 점수는 이번 시험 점수에 더하지 않습니다.')+'</p></article>';
    var stages=[{label:'현재',score:a.score},{label:'1단계',score:a.target},{label:'2단계까지',score:a.stage2Target},{label:'3단계까지',score:a.stage3Target}];
    var graph='<figure class="coaching-chart"><svg viewBox="0 0 500 200" role="img" aria-label="'+e(stages.map(function(s){return s.label+' '+s.score+'점';}).join(', '))+'">'+stages.map(function(s,i){var y=16+i*43;return '<text x="0" y="'+y+'" font-size="13" fill="#182230">'+s.label+'</text><rect x="90" y="'+(y-12)+'" width="310" height="16" fill="#E9EDF3"/><rect x="90" y="'+(y-12)+'" width="'+(310*s.score/100)+'" height="16" fill="'+(i?'#16734B':'#2456C4')+'"/><text x="414" y="'+y+'" font-size="13" fill="#182230">'+s.score+'점</text>';}).join('')+'<text x="90" y="190" font-size="12" fill="#566274">0점</text><text x="400" y="190" font-size="12" text-anchor="end" fill="#566274">100점</text></svg><figcaption>각 단계의 문제를 모두 다시 풀었을 때의 점수입니다.</figcaption></figure>';
    return '<section class="personal-study-plan" aria-label="학생별 단계별 학습 계획"><h3>'+e(ctx.name)+' 학생의 단계별 학습 계획</h3><p>정해진 날짜보다 완료 기준에 맞춰 다음 단계로 넘어갑니다. 권장 시간은 일정 제안이며 관찰된 풀이 시간이 아닙니다.</p>'+stage1+stage2+stage3+(allCorrect?'':graph)+'<p class="coaching-caution">선생님은 학습 뒤 풀이와 설명을 확인해 문항과 시간을 조정합니다. 이 계획은 성적·진도·완료 기록을 자동 변경하지 않습니다.</p></section>';
  }
  function render(ctx,options){
    options=options||{};var e=options.escape||escape,a=analyze(ctx,options);
    if(!a)return '<p class="coaching-caution">답안과 배점을 확인한 뒤 상세 진단을 표시합니다. 미등록 답안을 오답이나 0점으로 처리하지 않습니다.</p>';
    var strength=a.strengths.length?a.strengths.slice(0,2).map(function(s){
      return '<p><b>'+e(s.k)+'</b>에서 '+s.n+'문항 중 '+s.cor+'문항, '+s.tot+'점 중 '+s.got+'점('+s.perf+'%)을 얻었습니다. 이번 시험에서 확인한 강점입니다. 맞힌 문제 한 개를 골라 풀이 이유를 말로 설명하고, 같은 유형을 조건만 바꾸어 다시 확인하세요.</p>';
    }).join(''):'<p>맞힌 '+a.correct.length+'문항의 풀이를 먼저 설명해 보세요. 스스로 다시 풀 수 있는 방법부터 공부를 시작하면 좋습니다.</p>';
    var weakness=a.weak.length?a.weak.slice(0,2).map(function(s){
      var nos=a.wrong.filter(function(r){return r.item.area===s.k;}).map(function(r){return r.no+'번';});
      return '<p><b>'+e(s.k)+'</b>은 '+s.n+'문항 중 '+s.cor+'문항을 맞혔습니다. 이번에 놓친 점수는 <b>'+round(s.tot-s.got)+'점</b>입니다.'+(nos.length?' '+e(nos.join(', '))+'을 먼저 다시 풀어 보세요.':'')+' 틀린 이유는 풀이를 보며 하나씩 찾아보면 됩니다.</p>';
    }).join(''):'<p>이번 시험에는 오답이 없습니다. 점수 보완보다 풀이 설명과 조건이 달라진 문제로 이해의 깊이를 확인하세요.</p>';
    var tierText=a.tiers.map(function(p){return p.k+'점 문제 '+p.n+'개 중 '+p.cor+'개 정답';}).join(' / ');
    var candidates=a.priority.map(function(r){
      var reason=r.recovery?'이번 시험에서 잘 맞힌 '+r.area+' 영역의 문제입니다. 먼저 다시 풀어 보세요.':r.related.length?'같은 유형의 '+r.related.map(function(n){return n+'번';}).join(', ')+'을 맞혔습니다. 그때의 풀이 방법을 이 문제에도 써 볼 수 있는지 확인하세요.':r.strongArea?'이번 시험에서 잘 맞힌 영역 안에서 틀린 문제입니다. 풀이를 다시 적어 보며 어디에서 막혔는지 찾아보세요.':'틀린 문제 중 비교적 짧게 다시 확인할 수 있는 문제입니다. 낮은 배점이라고 쉬운 문제라는 뜻은 아닙니다.';
      return '<tr><td>'+r.no+'번 · '+r.points+'점</td><td><b>'+e(r.confirmed?r.type:'유형 확인 중')+'</b><br>'+e(reason)+'</td></tr>';
    }).join('');
    var review=a.priority.map(function(r){
      // Registered caution is a teacher review prompt, not an observed cause.
      var prompt=r.item.caution||'구해야 하는 것과 주어진 조건을 각각 표시하고, 사용한 식이나 그림을 설명해 보세요.';
      return '<li><b>'+r.no+'번 — '+e(r.confirmed?r.type:'유형 확인 중')+'</b><p>이 문제를 풀 때 살펴볼 점: '+e(prompt)+'</p><p>해설을 가린 채 조건을 표시하고 식·표·그림으로 다시 풉니다. 막힌 단계만 상세답안과 비교한 뒤, 답을 보지 않고 끝까지 설명하세요.</p></li>';
    }).join('');
    var scenario=a.priority.length?'<h3>먼저 다시 풀 문항</h3><p>다음 '+a.priority.length+'문제부터 다시 풀어 보세요. 맞힌 문제에서 쓴 방법을 떠올려 보고, 막힌 곳은 선생님과 함께 확인하면 됩니다.</p><table class="coaching-priority"><thead><tr><th>문항</th><th>유형과 복습 방법</th></tr></thead><tbody>'+candidates+'</tbody></table>'+scoreGraph(a,e)+'<p><b>'+a.priority.map(function(r){return r.no+'번';}).join(' · ')+'</b>을 모두 맞히고 다른 답안이 그대로라면 <b>'+a.score+' + '+a.gain+' = '+a.target+'점</b>입니다. 다시 풀며 세운 목표 점수입니다.</p>':'<h3>다음 학습 목표</h3><p>이번에는 틀린 문제가 없습니다. 정답을 기억한 것인지 풀이를 이해한 것인지, 새로운 조건에서도 설명할 수 있는지 확인하세요.</p>';
    var verified=a.verified&&(typeof options.percentile==='function'||(Array.isArray(ctx.S&&ctx.S.dist)&&ctx.S.dist.length===ctx.S.n));
    if(a.priority.length&&verified){
      var pct=function(score){return typeof options.percentile==='function'?options.percentile(score,ctx.S):round(Math.min(ctx.S.n,ctx.S.dist.filter(function(v){return v>score;}).length+1)/ctx.S.n*100);};
      var fromPct=pct(a.score),toPct=pct(a.target);
      if(Number.isFinite(fromPct)&&Number.isFinite(toPct)) scenario+='<p>이 점수를 기준으로 보면 현재 위치는 '+fromPct+'%에서 '+toPct+'%로 달라집니다. 다음 시험 결과를 미리 말해 주는 수치는 아닙니다.</p>';
      else scenario+='<p class="coaching-caution">점수 변화만 먼저 살펴보세요.</p>';
    }else if(a.priority.length){scenario+='<p class="coaching-caution">점수 변화만 먼저 살펴보세요.</p>';}
    return '<div class="diagnostic-coaching"><p><b>'+e(ctx.name)+'</b> 학생, 이번 파이널 '+e(ctx.roundNum)+'회에서 <b>'+a.score+'점</b>을 받았습니다. 맞힌 문제는 풀이 방법을 익히고, 틀린 문제는 다시 풀며 다음 공부를 준비해 봅시다.</p><div class="coaching-grid"><div class="coaching-block"><h3>이번 시험에서 잘한 점</h3>'+strength+'</div><div class="coaching-block"><h3>다시 살펴볼 영역</h3>'+weakness+'</div></div><h3>점수별 문제 보기</h3><p>'+e(tierText)+'</p><p>점수가 같은 문제라도 쓰는 방법은 다를 수 있습니다. 틀린 문제는 풀이 과정을 다시 적어 보세요.</p>'+scenario+planHTML(a,ctx,options,e)+(review?'<h3>문제별로 이렇게 복습하세요</h3><ol>'+review+'</ol>':'')+'<h3>교재와 연결하는 복습 순서</h3><p>교재 연결표에서 해당 유형의 학습 위치를 찾으세요. 조건을 읽고 표시하기 → 필요한 식·표·그림 만들기 → 막힌 단계만 상세답안과 비교하기 → 연결된 유사문제 풀기 → 다음 날 해설 없이 다시 설명하기 순서로 공부해 보세요. 교재 쪽수는 선생님과 함께 확인합니다.</p><p class="coaching-caution">틀린 이유는 한 가지가 아닐 수 있습니다. 풀이를 보며 어떤 부분이 어려웠는지 학생과 선생님이 함께 찾아보세요.</p></div>';
  }
  root.GFIELD_DIAGNOSTIC_COMMENT={analyze:analyze,render:render};
  if(typeof module==='object'&&module.exports)module.exports=root.GFIELD_DIAGNOSTIC_COMMENT;
})(typeof window==='object'?window:globalThis);
