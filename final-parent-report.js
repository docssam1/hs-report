(function(root){
  'use strict';

  var VERSION='1.0.0';
  var printLifecycle=null;

  function number(value){
    if(value==null||value==='')return null;
    value=Number(value);
    return Number.isFinite(value)?value:null;
  }
  function round1(value){return Math.round(Number(value)*10)/10;}
  function escapeHTML(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }
  function validAttempt(row,roundNum,rounds){
    var n=row&&Number(row.n),items=rounds&&rounds[String(n)]&&rounds[String(n)].items;
    return row&&Number.isInteger(n)&&n>=1&&n<=roundNum&&Array.isArray(row.oxArr)&&Array.isArray(items)&&row.oxArr.length===items.length&&/^[OX]+$/.test(row.oxArr.join(''));
  }
  function pointValue(points,no,round){
    var value=typeof points==='function'?points(no,round):points&&points[no];
    value=number(value&&typeof value==='object'?value.pts:value);
    return value==null?0:value;
  }
  function taxonomyValue(taxonomy,round,item){
    var value=typeof taxonomy==='function'?taxonomy(round,item):null;
    return value||{area:item.area||'기타',subarea:item.subarea||'',detailType:item.type||'',canonicalTypeId:'',reviewRequired:true};
  }
  function bandFor(percentile,bands){
    if(percentile==null)return null;
    var sorted=(bands||[]).slice().sort(function(a,b){return Number(a[1])-Number(b[1]);});
    if(!sorted.length)return null;
    return sorted.filter(function(row){return percentile<=Number(row[1]);})[0]||sorted[sorted.length-1];
  }
  function roundList(rows){
    return rows.map(function(row){return Number(row.n);}).filter(function(n,index,list){return list.indexOf(n)===index;}).sort(function(a,b){return a-b;});
  }
  function uniqueRounds(rows){
    var seen={};
    return rows.filter(function(row){var n=Number(row.n);if(seen[n])return false;seen[n]=true;return true;});
  }
  function expectedRounds(roundNum){
    return Array.from({length:roundNum},function(_,index){return index+1;});
  }
  function missingRounds(roundNum,included){
    return expectedRounds(roundNum).filter(function(n){return included.indexOf(n)<0;});
  }
  function aggregate(attempts,rounds,taxonomy,points,keyFor){
    var map={};
    attempts.forEach(function(attempt){
      var round=rounds&&rounds[String(attempt.n)];
      (round&&round.items||[]).forEach(function(item){
        var meta=taxonomyValue(taxonomy,attempt.n,item);
        var key=keyFor(item,meta,attempt.n);
        if(!key)return;
        var pts=pointValue(points,item.no,attempt.n);
        if(!map[key])map[key]={key:key,label:key,n:0,correct:0,total:0,got:0,lost:0};
        var row=map[key];
        row.n+=1;
        row.total+=pts;
        if(attempt.oxArr[Number(item.no)-1]!=='X'){
          row.correct+=1;
          row.got+=pts;
        }
      });
    });
    return Object.keys(map).map(function(key){
      var row=map[key];
      row.total=round1(row.total);
      row.got=round1(row.got);
      row.lost=round1(row.total-row.got);
      row.perf=row.total?round1(row.got/row.total*100):null;
      return row;
    });
  }
  function currentAttempt(ctx){
    return {n:Number(ctx.roundNum),score:number(ctx.score),oxArr:(ctx.oxArr||[]).slice()};
  }
  function joinComparisons(currentRows,cumulativeRows){
    var currentMap={},cumulativeMap={};
    currentRows.forEach(function(row){currentMap[row.key]=row;});
    cumulativeRows.forEach(function(row){cumulativeMap[row.key]=row;});
    return Object.keys(Object.assign({},currentMap,cumulativeMap)).map(function(key){
      var current=currentMap[key]||null,cumulative=cumulativeMap[key]||null;
      var currentPerf=current&&current.perf,cumulativePerf=cumulative&&cumulative.perf;
      return {
        key:key,
        label:(current||cumulative).label,
        current:current,
        cumulative:cumulative,
        deltaPp:currentPerf==null||cumulativePerf==null?null:round1(currentPerf-cumulativePerf)
      };
    });
  }
  function focusRows(rows,strong){
    return rows.filter(function(row){return row.n>=2&&row.perf!=null&&(strong?row.perf>=70:row.perf<70);}).sort(function(a,b){
      return strong?(b.perf-a.perf||b.n-a.n||String(a.label).localeCompare(String(b.label),'ko')):(a.perf-b.perf||b.lost-a.lost||String(a.label).localeCompare(String(b.label),'ko'));
    }).slice(0,2);
  }
  function repeatedWeaknesses(attempts,rounds,taxonomy){
    var map={};
    attempts.forEach(function(attempt){
      var seen={};
      var round=rounds&&rounds[String(attempt.n)];
      (round&&round.items||[]).forEach(function(item){
        if(attempt.oxArr[Number(item.no)-1]!=='X')return;
        var meta=taxonomyValue(taxonomy,attempt.n,item);
        var id=meta.canonicalTypeId;
        if(meta.reviewRequired!==false||!id||seen[id])return;
        seen[id]=true;
        if(!map[id])map[id]={id:id,label:meta.typeFamilyLabel||meta.detailType||item.type||'유형',rounds:[]};
        map[id].rounds.push(Number(attempt.n));
      });
    });
    return Object.keys(map).map(function(key){return map[key];}).filter(function(row){return row.rounds.length>=2;}).sort(function(a,b){
      return b.rounds.length-a.rounds.length||String(a.label).localeCompare(String(b.label),'ko');
    });
  }
  function model(ctx,options){
    options=options||{};
    var roundNum=Number(ctx&&ctx.roundNum)||1;
    var standalone=options.standalone===true;
    var rounds=options.rounds||{};
    var attempts=uniqueRounds((options.attempts||[]).filter(function(row){return validAttempt(row,roundNum,rounds);}).slice().sort(function(a,b){return Number(a.n)-Number(b.n);}));
    var considered=uniqueRounds((options.considered||[]).filter(function(row){var pct=number(row&&row.pct);return row&&Number(row.n)>=1&&Number(row.n)<=roundNum&&pct!=null&&pct>=0&&pct<=100;}).slice().sort(function(a,b){return Number(a.n)-Number(b.n);}));
    var personalRounds=roundList(attempts),rankRounds=roundList(considered);
    var scoreValues=attempts.map(function(row){return number(row.score);}).filter(function(value){return value!=null;});
    var rankValues=considered.map(function(row){return number(row.pct);}).filter(function(value){return value!=null;});
    var scoreAverage=scoreValues.length?round1(scoreValues.reduce(function(sum,value){return sum+value;},0)/scoreValues.length):null;
    var percentileAverage=rankValues.length?round1(rankValues.reduce(function(sum,value){return sum+value;},0)/rankValues.length):null;
    var band=bandFor(percentileAverage,options.cumulativeBands);
    var currentRows=[currentAttempt(ctx)];
    var fakeRounds={};fakeRounds[String(roundNum)]={items:ctx.items||[]};
    var currentAreas=aggregate(currentRows,fakeRounds,options.taxonomy,options.points,function(item,meta){return meta.area||item.area||'기타';});
    var cumulativeAreas=aggregate(attempts,rounds,options.taxonomy,options.points,function(item,meta){return meta.area||item.area||'기타';});
    var currentTiers=aggregate(currentRows,fakeRounds,options.taxonomy,options.points,function(item,meta,round){return String(pointValue(options.points,item.no,round));});
    var cumulativeTiers=aggregate(attempts,rounds,options.taxonomy,options.points,function(item,meta,round){return String(pointValue(options.points,item.no,round));});
    currentTiers.forEach(function(row){row.label=row.key+'점대';});
    cumulativeTiers.forEach(function(row){row.label=row.key+'점대';});
    var areas=joinComparisons(currentAreas,cumulativeAreas).sort(function(a,b){return String(a.label).localeCompare(String(b.label),'ko');});
    var tiers=joinComparisons(currentTiers,cumulativeTiers).sort(function(a,b){return Number(a.key)-Number(b.key);});
    var strengths=focusRows(cumulativeAreas.length?cumulativeAreas:currentAreas,true);
    var improvements=focusRows(cumulativeAreas.length?cumulativeAreas:currentAreas,false);
    var itemByNo={};(ctx.items||[]).forEach(function(item){itemByNo[Number(item.no)]=item;});
    var recoveryNos=(ctx.miss||[]).slice();
    var fallbackNos=(ctx.wrongList||[]).map(function(item){return Number(item.no);});
    var priorityNos=(recoveryNos.length?recoveryNos:fallbackNos).slice(0,3);
    var priorityItems=priorityNos.map(function(no){
      var item=itemByNo[Number(no)];if(!item)return null;
      var meta=taxonomyValue(options.taxonomy,roundNum,item);
      var rate=ctx.ratesVerified&&ctx.rate?number(ctx.rate[Number(no)]):null;
      return {no:Number(no),label:meta.detailType||meta.displayType||item.type||'유형',area:meta.area||item.area||'',subarea:meta.subarea||item.subarea||'',points:pointValue(options.points,Number(no),roundNum),rate:rate==null?null:round1(rate*100),recovery:recoveryNos.indexOf(Number(no))>=0};
    }).filter(Boolean);
    return {
      roundNum:roundNum,
      standalone:standalone,
      isPractice:Number(ctx.attemptNo)>=2,
      current:{label:(Number(ctx.attemptNo)>=2?'이번 연습 결과':'이번 회차')+' · '+(standalone?(ctx.R&&ctx.R.title||'최종 실전 '+roundNum+'회'):'파이널 '+roundNum+'회'),score:number(ctx.score),percentile:number(ctx.pct),grade:ctx.grade||null},
      cumulative:{label:'파이널 1~'+roundNum+'회',personalRounds:personalRounds,rankRounds:rankRounds,missingPersonalRounds:missingRounds(roundNum,personalRounds),missingRankRounds:missingRounds(roundNum,rankRounds),personalHistory:attempts.map(function(row){return {n:Number(row.n),score:number(row.score)};}),rankHistory:considered.map(function(row){return {n:Number(row.n),pct:number(row.pct)};}),scoreAverage:scoreAverage,percentileAverage:percentileAverage,band:band?band[0]:null},
      areas:areas,
      tiers:tiers,
      strengths:strengths,
      improvements:improvements,
      currentStrengths:focusRows(currentAreas,true),
      currentImprovements:focusRows(currentAreas,false),
      cumulativeStrengths:focusRows(cumulativeAreas,true),
      cumulativeImprovements:focusRows(cumulativeAreas,false),
      repeatedWeaknesses:repeatedWeaknesses(attempts,rounds,options.taxonomy),
      priorityItems:priorityItems,
      targetScore:priorityItems.length?round1(Math.min(100,(number(ctx.score)||0)+priorityItems.reduce(function(sum,item){return sum+item.points;},0))):null,
      currentScore:number(ctx.score),
      currentWrongCount:number(ctx.wrong)
    };
  }

  function roundsText(rounds){return rounds.length?rounds.join('·')+'회':'없음';}
  function metric(label,value,unit){return '<div><dt>'+escapeHTML(label)+'</dt><dd>'+(value==null?'확인 필요':escapeHTML(value)+(unit||''))+'</dd></div>';}
  function summaryHTML(vm){
    var current='<article class="parent-summary-column current"><p>'+escapeHTML(vm.current.label)+'</p>'+metric('점수',vm.current.score,'점')+metric('석차 백분율',vm.current.percentile,'%')+metric('예상 등급',vm.current.grade,'')+'</article>';
    if(vm.standalone)return '<section id="report-summary" class="parent-summary-section"><h2>성적 요약</h2><div class="parent-report-comparison is-single">'+current+'</div></section>';
    if(vm.roundNum<2)return '<section id="report-summary" class="parent-summary-section"><h2>성적 요약</h2><div class="parent-report-comparison is-single">'+current+'</div><p class="parent-report-note">누적 비교는 파이널 2회부터 표시됩니다.</p></section>';
    var cumulative='<article class="parent-summary-column cumulative"><p>'+escapeHTML(vm.cumulative.label)+' 누적</p>'+metric('회차 평균 점수',vm.cumulative.scoreAverage,'점')+metric('회차별 석차 백분율 평균',vm.cumulative.percentileAverage,'%')+metric('누적 판정',vm.cumulative.band,'')+'</article>';
    var scope='<div class="parent-report-scope"><span>개인 성적 반영: '+roundsText(vm.cumulative.personalRounds)+'</span><span>석차 반영: '+roundsText(vm.cumulative.rankRounds)+'</span></div>';
    var missing=[];
    if(vm.cumulative.missingPersonalRounds.length)missing.push('개인 성적 미등록 '+roundsText(vm.cumulative.missingPersonalRounds));
    if(vm.cumulative.missingRankRounds.length)missing.push('석차 자료 확인 필요 '+roundsText(vm.cumulative.missingRankRounds));
    return '<section id="report-summary" class="parent-summary-section"><h2>성적 요약</h2><div class="parent-report-comparison">'+current+cumulative+'</div>'+scope+(missing.length?'<p class="parent-report-note">'+escapeHTML(missing.join(' · '))+'</p>':'')+(vm.isPractice?'<p class="parent-report-note">이번 연습 결과는 왼쪽에만 표시하며, 누적은 저장된 최초 응시 기록을 유지합니다.</p>':'')+'</section>';
  }
  function deltaHTML(value){return value==null?'—':(value>0?'+':'')+value.toFixed(1)+'%p';}
  function comparisonRows(rows){
    return rows.map(function(row){
      var current=row.current&&row.current.perf,cumulative=row.cumulative&&row.cumulative.perf;
      return '<tr><th scope="row">'+escapeHTML(row.label)+'</th><td>'+barHTML(current,'current')+'</td><td>'+barHTML(cumulative,'cumulative')+'</td><td class="parent-delta">'+deltaHTML(row.deltaPp)+'</td></tr>';
    }).join('');
  }
  function barHTML(value,type){
    if(value==null)return '<span class="parent-no-data">확인 필요</span>';
    var width=Math.max(0,Math.min(100,value));
    return '<span class="parent-compare-bar '+type+'"><i style="width:'+width.toFixed(1)+'%"></i><b>'+value.toFixed(1)+'%</b></span>';
  }
  function focusHTML(vm){
    function list(rows,empty){return rows.length?'<ul>'+rows.map(function(row){return '<li><b>'+escapeHTML(row.label)+'</b><span>'+row.perf.toFixed(1)+'% · '+row.n+'문항</span></li>';}).join('')+'</ul>':'<p>'+empty+'</p>';}
    function column(title,strengths,improvements){return '<article><h3>'+title+'</h3><h4>강점</h4>'+list(strengths,'확인 필요')+'<h4>우선 보완</h4>'+list(improvements,'확인 필요')+'</article>';}
    var current=column('이번 회차',vm.currentStrengths,vm.currentImprovements);
    var cumulative=!vm.standalone&&vm.roundNum>=2?column('1~'+vm.roundNum+'회 누적',vm.cumulativeStrengths,vm.cumulativeImprovements):'';
    return '<div class="parent-focus-grid'+(vm.standalone||vm.roundNum<2?' is-single':'')+'">'+current+cumulative+'</div>';
  }
  function areaHTML(vm){
    var compare=!vm.standalone&&vm.roundNum>=2;
    var lead=compare?'득점률 비교 · 차이=이번−누적':'이번 회차의 영역별 득점률입니다.';
    var head=compare?'<tr><th>영역</th><th>이번</th><th>누적</th><th>차이</th></tr>':'<tr><th>영역</th><th>이번</th></tr>';
    var rows=compare?comparisonRows(vm.areas):vm.areas.map(function(row){return '<tr><th scope="row">'+escapeHTML(row.label)+'</th><td>'+barHTML(row.current&&row.current.perf,'current')+'</td></tr>';}).join('');
    return '<div class="parent-area-comparison"><p class="lead">'+lead+'</p><div class="report-table-scroll"><table><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'+focusHTML(vm)+'</div>';
  }
  function tierHTML(vm){
    var compare=!vm.standalone&&vm.roundNum>=2;
    var head=compare?'<tr><th>배점대</th><th>이번</th><th>누적</th><th>차이</th></tr>':'<tr><th>배점대</th><th>이번</th></tr>';
    var rows=compare?comparisonRows(vm.tiers):vm.tiers.map(function(row){return '<tr><th scope="row">'+escapeHTML(row.label)+'</th><td>'+barHTML(row.current&&row.current.perf,'current')+'</td></tr>';}).join('');
    return '<div class="parent-tier-comparison"><p class="lead">포함된 모든 문항의 득점 합을 배점 합으로 나눈 결과입니다.</p><div class="report-table-scroll"><table><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div></div>';
  }
  function priorityHTML(vm){
    if(!vm.priorityItems.length)return '<div class="parent-priority-empty">'+(vm.currentWrongCount===0?'이번 회차는 오답이 없습니다.':'이번 회차에는 ★ 우선 복습 추천 문항이 없습니다. 아래 학습 계획에 따라 오답을 차근차근 복습하세요.')+'</div>';
    var items=vm.priorityItems.map(function(item,index){return '<li><a href="#report-items"><span>'+String(index+1).padStart(2,'0')+'</span><b>'+item.no+'번 · '+escapeHTML(item.label)+'</b><small>'+escapeHTML(item.area)+(item.subarea?' › '+escapeHTML(item.subarea):'')+' · '+item.points+'점'+(item.rate==null?'':' · 정답률 '+item.rate.toFixed(0)+'%')+'</small></a></li>';}).join('');
    var target=vm.targetScore==null?'':' 이 문항들을 모두 맞히고 다른 답안이 같다면 '+vm.currentScore+'점에서 '+vm.targetScore+'점이 됩니다.';
    var recovery=vm.priorityItems.some(function(item){return item.recovery;});
    var reason=recovery?'현재 실력에서 먼저 회복할 가능성이 큰 문항입니다.':'오답 중 앞에서부터 3문항만 먼저 복습합니다.';
    return '<div class="parent-priority"><h3>이번 주 우선 '+vm.priorityItems.length+'문항</h3><p>'+reason+target+'</p><ol class="parent-priority-list">'+items+'</ol></div>';
  }
  function historyHTML(vm){
    if(vm.standalone)return '';
    var personal=vm.cumulative.personalHistory.length?'<table><thead><tr><th>회차</th><th>최초 응시 점수</th></tr></thead><tbody>'+vm.cumulative.personalHistory.map(function(row){return '<tr><td>파이널 '+row.n+'회</td><td class="c">'+(row.score==null?'확인 필요':row.score+'점')+'</td></tr>';}).join('')+'</tbody></table>':'<p class="lead">반영할 최초 응시 기록이 없습니다.</p>';
    var rank=vm.cumulative.rankHistory.length?'<table><thead><tr><th>회차</th><th>석차 백분율</th></tr></thead><tbody>'+vm.cumulative.rankHistory.map(function(row){return '<tr><td>파이널 '+row.n+'회</td><td class="c">'+row.pct+'%</td></tr>';}).join('')+'</tbody></table>':'<p class="lead">반영할 석차 자료가 없습니다.</p>';
    var repeated=vm.repeatedWeaknesses.length?vm.repeatedWeaknesses.map(function(row){return '<div class="repwk"><b>'+escapeHTML(row.label)+'</b> — 파이널 '+row.rounds.join('·')+'회 반복 오답</div>';}).join(''):'<div class="repwk">승인된 같은 유형이 서로 다른 두 회차 이상 반복된 오답은 없습니다.</div>';
    return '<h3>개인 성적 반영 기록</h3>'+personal+'<h3>석차 반영 기록</h3>'+rank+'<h3>서로 다른 회차에 반복된 약점 유형</h3>'+repeated+'<p class="parent-report-note">영역·배점대 누적은 포함 문항의 득점 합÷배점 합입니다. 차이는 이번−누적이며, 한 번의 차이만으로 성장이나 하락을 단정하지 않습니다.</p>';
  }
  function indexHTML(){
    var items=[['report-summary','성적 요약'],['report-plan','이번 주 학습'],['report-strengths','강점·보완'],['report-items','오답 요약'],['report-materials','학습 자료']];
    return '<nav class="parent-report-index no-print" aria-label="성적표 섹션">'+items.map(function(item,index){return '<a href="#'+item[0]+'"'+(!index?' aria-current="location"':'')+'><span>0'+(index+1)+'</span>'+item[1]+'</a>';}).join('')+'</nav>';
  }
  function openAncestors(node){
    for(var parent=node&&node.parentElement;parent;parent=parent.parentElement){if(parent.tagName==='DETAILS')parent.open=true;}
  }
  function promoteStudyPlan(container){
    var host=container&&container.querySelector('.report-study-plan-host');
    var plan=container&&container.querySelector('.diagnostic-coaching .personal-study-plan');
    if(host&&plan)host.appendChild(plan);
  }
  function bindPrintDetails(container){
    if(printLifecycle){root.removeEventListener('beforeprint',printLifecycle.before);root.removeEventListener('afterprint',printLifecycle.after);}
    var state=null;
    function before(){
      if(state)return;
      state=Array.prototype.slice.call(container.querySelectorAll('details')).map(function(details){return {details:details,open:details.open};});
      state.forEach(function(row){row.details.open=true;row.details.setAttribute('open','');});
    }
    function after(){
      if(!state)return;
      state.forEach(function(row){row.details.open=row.open;if(row.open)row.details.setAttribute('open','');else row.details.removeAttribute('open');});
      state=null;
    }
    root.addEventListener('beforeprint',before);
    root.addEventListener('afterprint',after);
    printLifecycle={before:before,after:after};
  }
  function wire(container){
    if(!container)return;
    promoteStudyPlan(container);
    bindPrintDetails(container);
    var nav=container.querySelector('.parent-report-index');
    if(!nav)return;
    var links=Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    links.forEach(function(link){
      link.addEventListener('click',function(){
        var target=container.querySelector(link.getAttribute('href'));
        openAncestors(target);
        links.forEach(function(other){other.removeAttribute('aria-current');});
        link.setAttribute('aria-current','location');
      });
    });
    if(typeof root.IntersectionObserver==='function'){
      var observer=new root.IntersectionObserver(function(entries){
        var visible=entries.filter(function(entry){return entry.isIntersecting;}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top;})[0];
        if(!visible)return;
        links.forEach(function(link){
          if(link.getAttribute('href')==='#'+visible.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
        });
      },{rootMargin:'-15% 0px -70% 0px',threshold:0});
      links.forEach(function(link){var target=container.querySelector(link.getAttribute('href'));if(target)observer.observe(target);});
    }
  }

  var api=Object.freeze({version:VERSION,model:model,summaryHTML:summaryHTML,areaHTML:areaHTML,tierHTML:tierHTML,priorityHTML:priorityHTML,historyHTML:historyHTML,indexHTML:indexHTML,wire:wire,promoteStudyPlan:promoteStudyPlan,bindPrintDetails:bindPrintDetails});
  root.GFIELD_FINAL_PARENT_REPORT=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
