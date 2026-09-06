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
    var verified=ctx.populationVerified===true&&typeof options.verifyPopulation==='function'&&options.verifyPopulation(ctx.S)===true;
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
    return '<figure class="coaching-chart"><svg viewBox="0 0 500 136" role="img" aria-label="'+e('현재 '+a.score+'점, 우선 복습 문항 해결 시 '+a.target+'점. 확정 예측이 아닌 조건부 계산입니다.')+'">'+
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
        var book=first?e(first.title+(first.unit?' · '+first.unit:''))+' (유형 기반 추천)':('교재 연결표의 '+r.no+'번 학습 위치 확인');
        return '<li><b>'+r.no+'번 · '+e(r.confirmed?r.type:'분류 확인 중')+'</b> ('+r.points+'점)<br>'+book+(r.repeatRounds&&r.repeatRounds.length?'<br>같은 세부유형 오답 기록: '+r.repeatRounds.map(function(n){return n+'회';}).join(', ')+' 및 이번 회차':'')+'</li>';
      }).join('')+'</ul>':'';
    }
    var allCorrect=a.wrong.length===0;
    var stage1='<article class="personal-plan-stage"><h4>1단계 · '+(allCorrect?'강점 재현하기':'되찾을 점수부터')+'</h4><p class="plan-when">첫 학습 · 약 15~20분 권장</p>'+
      (allCorrect?'<p>맞힌 문제 중 풀이가 길었던 두 문제를 골라 해설 없이 설명합니다. 만점을 이유로 이미 모든 개념을 익혔다고 단정하지 않습니다.</p>':tasks(a.priority)+'<p>조건에 밑줄을 긋고 스스로 다시 풉니다. 막힌 경우 상세답안에서 그 단계만 확인한 뒤 처음부터 다시 풀어 보세요.</p>')+
      '<p><b>완료 기준:</b> 정답뿐 아니라 “왜 이 식·그림을 쓰는지”를 도움 없이 설명할 수 있습니다.</p><p class="plan-score">'+(allCorrect?'점수 상승 계산 없음':a.score+'점 → '+a.target+'점 · 이 단계 +'+a.gain+'점')+'</p></article>';
    var noRepeat=a.historyRounds?'현재 비교 가능한 기록에서는 별도로 배정할 반복 오답이 없습니다. 1단계 문제에 이미 포함된 유형은 다시 배정하지 않습니다.':'이전 회차의 비교 가능한 기록이 없어 반복 약점은 아직 판단하지 않습니다.';
    var stage2='<article class="personal-plan-stage"><h4>2단계 · 반복 약점 보완</h4><p class="plan-when">1단계 완료 후 · 약 20~25분 권장</p>'+
      (a.repeated.length?tasks(a.repeated)+'<p>연결 교재에서 개념과 예제 풀이를 확인하고, 이번 오답을 다시 풉니다. 연결된 유사문제가 준비된 경우 같은 유형 3문제로 방법을 바꾸어 적용해 보세요.</p>':'<p>'+noRepeat+' 새 약점을 만들어 배정하지 않고, 1단계 문항을 다음 날 다시 확인합니다.</p>')+
      '<p><b>완료 기준:</b> 해설 없이 다시 풀고, 전에 막혔던 단계와 달라진 풀이를 설명합니다.</p><p class="plan-score">'+(a.repeated.length?a.stage2Target+'점 · 이 단계 +'+a.stage2Gain+'점 · 1~2단계 합계 +'+round(a.gain+a.stage2Gain)+'점':'추가 점수 합산 없음')+'</p></article>';
    var stage3='<article class="personal-plan-stage"><h4>3단계 · 다음 수준 도전</h4><p class="plan-when">앞 단계 완료 후 · 약 20분 권장</p>'+
      (a.challenge.length?tasks(a.challenge)+'<p>같은 세부유형을 맞힌 근거가 있는 추가 문항입니다. 조건을 정리해 먼저 스스로 시도하고, 풀기 어렵다면 부족한 연결 개념을 선생님과 확인합니다.</p>':'<p>자동으로 확정할 다음 도전 문항은 없습니다. 앞 단계의 풀이를 재현한 뒤, 선생님이 같은 유형의 조건이 달라진 문제를 선택해 주세요. 준비 여부를 확인하기 전에는 더 어려운 문제를 일괄 배정하지 않습니다.</p>')+
      '<p><b>완료 기준:</b> 달라진 조건을 짚고, 기존 풀이에서 무엇을 바꿨는지 설명합니다.</p><p class="plan-score">'+(a.challenge.length?a.stage3Target+'점 · 이 단계 +'+a.stage3Gain+'점 · 전체 합계 +'+round(a.gain+a.stage2Gain+a.stage3Gain)+'점':'새로운 도전 문제의 점수는 이번 시험 점수에 더하지 않습니다.')+'</p></article>';
    var stages=[{label:'현재',score:a.score},{label:'1단계',score:a.target},{label:'2단계까지',score:a.stage2Target},{label:'3단계까지',score:a.stage3Target}];
    var graph='<figure class="coaching-chart"><svg viewBox="0 0 500 200" role="img" aria-label="'+e(stages.map(function(s){return s.label+' '+s.score+'점';}).join(', ')+'; 서로 다른 오답만 한 번씩 합산한 조건부 목표')+'">'+stages.map(function(s,i){var y=16+i*43;return '<text x="0" y="'+y+'" font-size="13" fill="#182230">'+s.label+'</text><rect x="90" y="'+(y-12)+'" width="310" height="16" fill="#E9EDF3"/><rect x="90" y="'+(y-12)+'" width="'+(310*s.score/100)+'" height="16" fill="'+(i?'#16734B':'#2456C4')+'"/><text x="414" y="'+y+'" font-size="13" fill="#182230">'+s.score+'점</text>';}).join('')+'<text x="90" y="190" font-size="12" fill="#566274">0점</text><text x="400" y="190" font-size="12" text-anchor="end" fill="#566274">100점</text></svg><figcaption>현재 시험에서 각 단계의 지정 오답을 모두 해결하고 다른 답안은 같을 때의 점수입니다. 문항을 중복 합산하지 않습니다.</figcaption></figure>';
    return '<section class="personal-study-plan" aria-label="학생별 단계별 학습 계획"><h3>'+e(ctx.name)+' 학생의 단계별 학습 계획</h3><p>정해진 날짜보다 완료 기준에 맞춰 다음 단계로 넘어갑니다. 권장 시간은 일정 제안이며 관찰된 풀이 시간이 아닙니다.</p>'+stage1+stage2+stage3+(allCorrect?'':graph)+'<p class="coaching-caution">선생님은 학습 뒤 풀이와 설명을 확인해 문항과 시간을 조정합니다. 이 계획은 성적·진도·완료 기록을 자동 변경하지 않습니다.</p></section>';
  }
  function render(ctx,options){
    options=options||{};var e=options.escape||escape,a=analyze(ctx,options);
    if(!a)return '<p class="coaching-caution">답안과 배점을 확인한 뒤 상세 진단을 표시합니다. 미등록 답안을 오답이나 0점으로 처리하지 않습니다.</p>';
    var strength=a.strengths.length?a.strengths.slice(0,2).map(function(s){
      return '<p><b>'+e(s.k)+'</b>에서 '+s.n+'문항 중 '+s.cor+'문항, '+s.tot+'점 중 '+s.got+'점('+s.perf+'%)을 얻었습니다. 이번 시험에서 확인한 강점입니다. 맞힌 문제 한 개를 골라 풀이 이유를 말로 설명하고, 같은 유형을 조건만 바꾸어 다시 확인하세요.</p>';
    }).join(''):'<p>이번 기록만으로 안정된 강점을 단정하기는 어렵습니다. 맞힌 '+a.correct.length+'문항의 풀이를 먼저 설명해 보며, 스스로 재현할 수 있는 방법부터 학습의 출발점으로 삼으세요.</p>';
    var weakness=a.weak.length?a.weak.slice(0,2).map(function(s){
      var nos=a.wrong.filter(function(r){return r.item.area===s.k;}).map(function(r){return r.no+'번';});
      return '<p><b>'+e(s.k)+'</b>은 '+s.n+'문항 중 '+s.cor+'문항 정답, 수행률 '+s.perf+'%이며 놓친 배점은 <b>'+round(s.tot-s.got)+'점</b>입니다.'+(nos.length?' '+e(nos.join(', '))+'을 다시 확인하세요.':'')+' 한 번의 결과이므로 영역 전체의 능력으로 단정하지 않습니다.</p>';
    }).join(''):'<p>이번 시험에는 오답이 없습니다. 점수 보완보다 풀이 설명과 조건이 달라진 문제로 이해의 깊이를 확인하세요.</p>';
    var tierText=a.tiers.map(function(p){return p.k+'점대 '+p.cor+'/'+p.n+'문항 · 수행률 '+p.perf+'%';}).join(' / ');
    var candidates=a.priority.map(function(r){
      var reason=r.recovery?'이번 시험에서 잘 맞춘 '+r.area+' 영역의 문항이며, 검증 정답률은 '+round(r.rate*100)+'%입니다. 선생님의 복습 우선순위에 따라 먼저 확인합니다.':r.related.length?'같은 확정 세부유형의 '+r.related.map(function(n){return n+'번';}).join(', ')+'을 맞혔습니다. 그 풀이를 이 문제에도 적용할 수 있는지 확인하세요.':r.strongArea?'이번 시험에서 잘 맞춘 영역 안의 오답입니다. 정답률 근거와 구분하여 우선 점검 후보로 제시합니다.':'이 시험의 오답 중 배점이 낮은 문항부터 점검합니다. 낮은 배점만으로 쉽게 풀 수 있다고 판단하지는 않습니다.';
      return '<tr><td>'+r.no+'번 · '+r.points+'점</td><td><b>'+e(r.confirmed?r.type:'분류 확인 중')+'</b><br>'+e(reason)+'</td></tr>';
    }).join('');
    var review=a.priority.map(function(r){
      // Registered caution is a teacher review prompt, not an observed cause.
      var prompt=r.item.caution||'구해야 하는 것과 주어진 조건을 각각 표시하고, 사용한 식이나 그림을 설명해 보세요.';
      return '<li><b>'+r.no+'번 — '+e(r.confirmed?r.type:'분류 확인 중')+'</b><p>문항별 복습 포인트: '+e(prompt)+'</p><p>해설을 가린 채 조건을 표시하고 식·표·그림으로 다시 풉니다. 막힌 단계만 상세답안과 비교한 뒤, 답을 보지 않고 끝까지 설명하세요.</p></li>';
    }).join('');
    var scenario=a.priority.length?'<h3>우선 복습할 문항과 점수 변화</h3><p>다음 '+a.priority.length+'문항은 <b>우선 점검 후보</b>입니다. 반드시 맞힐 수 있다는 판정이나 정답 확률은 아닙니다. 잘 맞추는 영역 안의 정답률 높은 오답을 먼저 선택합니다. 현재 운영 기준은 영역 수행률 70% 이상(두 문항 이상 출제), 검증 정답률 70% 이상이며 선생님이 조정할 수 있는 추천 기준입니다. 검증 정답률이 없으면 관련 정답과 낮은 배점 등 개인 기록만으로 제시한 후보임을 구분합니다.</p><table class="coaching-priority"><thead><tr><th>문항</th><th>유형과 선정 근거</th></tr></thead><tbody>'+candidates+'</tbody></table>'+scoreGraph(a,e)+'<p><b>'+a.priority.map(function(r){return r.no+'번';}).join(' · ')+'</b>을 모두 맞히고 다른 답안이 그대로라면 <b>'+a.score+' + '+a.gain+' = '+a.target+'점</b>입니다. 새 성적이나 재채점 결과로 저장하지 않는 복습 목표입니다.</p>':'<h3>다음 학습 목표</h3><p>오답이 없으므로 점수 상승 후보를 만들지 않았습니다. 정답을 기억한 것인지 풀이를 이해한 것인지, 새로운 조건에서도 설명할 수 있는지 확인하세요.</p>';
    var verified=a.verified&&Array.isArray(ctx.S&&ctx.S.dist)&&ctx.S.dist.length===ctx.S.n;
    if(a.priority.length&&verified){
      var pct=function(score){return round(Math.min(ctx.S.n,ctx.S.dist.filter(function(v){return v>score;}).length+1)/ctx.S.n*100);};
      scenario+='<p>동일한 검증 성적 분포를 고정하여 비교하면 석차 백분율은 '+pct(a.score)+'% → '+pct(a.target)+'%입니다. 실제 다음 시험의 석차를 예측한 값은 아닙니다.</p>';
    }else if(a.priority.length){scenario+='<p class="coaching-caution">석차 변화는 성적 분포 대조가 끝난 뒤 표시합니다. 여기서는 답안과 배점으로 확인되는 점수 변화만 계산했습니다.</p>';}
    return '<div class="diagnostic-coaching"><p><b>'+e(ctx.name)+'</b> 학생의 이번 파이널 '+e(ctx.roundNum)+'회 결과는 <b>'+a.score+'점</b>입니다. 점수만으로 원인을 정하지 않고, 실제 맞힌 문제와 놓친 배점을 나누어 살펴봅니다.</p><div class="coaching-grid"><div class="coaching-block"><h3>이번 시험에서 확인한 강점</h3>'+strength+'</div><div class="coaching-block"><h3>우선 보완할 영역</h3>'+weakness+'</div></div><h3>배점대별 읽기</h3><p>'+e(tierText)+'</p><p>배점대는 시험의 구분 기준입니다. 영역·세부유형이 다를 수 있으므로 낮은 배점의 오답을 곧바로 실수라고 보지는 않습니다.</p>'+scenario+planHTML(a,ctx,options,e)+(review?'<h3>문제별로 이렇게 복습하세요</h3><ol>'+review+'</ol>':'')+'<h3>교재와 연결하는 복습 순서</h3><p>교재 연결표에서 해당 유형의 학습 위치를 확인하세요. 조건을 읽고 표시하기 → 필요한 식·표·그림 만들기 → 상세답안과 막힌 단계 비교하기 → 연결된 유사문제 풀기 → 다음 날 해설 없이 다시 설명하기 순서로 진행합니다. 위치가 확인되지 않은 교재 쪽수는 임의로 지정하지 않습니다.</p><p class="coaching-caution">정오 기록은 결과를 보여 줍니다. 개념 부족, 지문 해석, 계산 실수, 시간 부족 중 실제 원인은 풀이를 보며 학생과 함께 확인해야 합니다.</p></div>';
  }
  root.GFIELD_DIAGNOSTIC_COMMENT={analyze:analyze,render:render};
  if(typeof module==='object'&&module.exports)module.exports=root.GFIELD_DIAGNOSTIC_COMMENT;
})(typeof window==='object'?window:globalThis);
