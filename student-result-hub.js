(function(root){
  'use strict';

  var state={revision:0,options:null,open:false,controller:null};
  var MODEL_FILES={
    middle:{file:'mock-data.js',global:'GFIELD_MOCK'},
    hw:{file:'mock-data-hw.js',global:'GFIELD_MOCK_HW'},
    final:{file:'mock-data-final.js',global:'GFIELD_MOCK_FINAL'},
    original:{file:'mock-data-original.js',global:'GFIELD_MOCK_ORIGINAL'},
    last:{file:'last-score-data.js',global:'GFIELD_LAST_SCORE_DATA'}
  };
  var scriptPromises={};

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function round1(value){return Math.round(Number(value)*10)/10;}
  function scoreOf(ox){
    ox=String(ox||'').trim().toUpperCase();
    if(!/^[OX]{30}$/.test(ox)) return null;
    var score=0,wrong=0;
    for(var i=0;i<30;i++){
      if(ox[i]==='X') wrong++;
      else score+=i<12?2.7:(i<22?3.4:4.2);
    }
    return {score:round1(score),wrong:wrong,ox:ox};
  }
  function parseRound(key){
    key=String(key||'');
    var match;
    if(/^\d+$/.test(key)&&Number(key)>=1&&Number(key)<=8) return {kind:'middle',round:Number(key),order:100+Number(key)};
    if((match=/^hw([1-9])$/.exec(key))) return {kind:'hw',round:Number(match[1]),order:200+Number(match[1])};
    if((match=/^final([1-5])$/.exec(key))) return {kind:'final',round:Number(match[1]),order:300+Number(match[1])};
    if((match=/^last([1-4])$/.exec(key))) return {kind:'last',round:Number(match[1]),order:400+Number(match[1])};
    if((match=/^original([1-2])$/.exec(key))) return {kind:'original',round:Number(match[1]),order:500+Number(match[1])};
    return null;
  }
  function exactStudent(row,student){return row&&String(row.student||'').trim()===student;}
  function officialRows(rows,student){
    var selected={};
    (Array.isArray(rows)?rows:[]).forEach(function(row,index){
      var source=String(row&&row.source||'').toLowerCase(),key=String(row&&row.round||'');
      var meta=parseRound(key),score=scoreOf(row&&row.ox);
      if(!exactStudent(row,student)||source==='reset'||String(row&&row.ox||'').toUpperCase()==='RESET'||key.indexOf('@')>=0||!meta||!score) return;
      if(!Number.isFinite(Number(row.score))||Math.abs(Number(row.score)-score.score)>.001||Number(row.wrong)!==score.wrong) return;
      var stamp=Date.parse(row.updated_at||'');
      var candidate={row:row,key:key,meta:meta,score:score,stamp:Number.isFinite(stamp)?stamp:index};
      if(!selected[key]||candidate.stamp<selected[key].stamp) selected[key]=candidate;
    });
    return Object.keys(selected).map(function(key){return selected[key];}).sort(function(a,b){return b.meta.order-a.meta.order;});
  }
  function loadScript(kind){
    var spec=MODEL_FILES[kind];
    if(!spec) return Promise.resolve();
    if(root[spec.global]) return Promise.resolve(root[spec.global]);
    if(scriptPromises[kind]) return scriptPromises[kind];
    scriptPromises[kind]=new Promise(function(resolve,reject){
      var node=document.createElement('script');
      node.src=spec.file+'?v=20260915a';node.async=true;
      node.onload=function(){root[spec.global]?resolve(root[spec.global]):reject(new Error('성적 기준을 확인하지 못했습니다.'));};
      node.onerror=function(){reject(new Error('성적 기준을 불러오지 못했습니다.'));};
      document.head.appendChild(node);
    });
    return scriptPromises[kind];
  }
  function loadModels(items){
    var kinds={};items.forEach(function(item){kinds[item.meta.kind]=true;});
    return Promise.all(Object.keys(kinds).map(loadScript));
  }
  function percentileFromTable(score,table){
    if(!Array.isArray(table)||!table.length) return null;
    for(var i=0;i<table.length;i++) if(score>=Number(table[i][0])) return Number(table[i][1]);
    return Number(table[table.length-1][1]);
  }
  function percentileFromDistribution(score,dist){
    if(!Array.isArray(dist)||!dist.length) return null;
    var greater=dist.filter(function(value){return Number(value)>score;}).length;
    return Math.min(100,round1((greater+1)/dist.length*100));
  }
  function gradeFromCuts(score,cuts){
    if(!Array.isArray(cuts)) return null;
    var sorted=cuts.filter(function(row){return Array.isArray(row)&&row.length>=2&&Number.isFinite(Number(row[1]));}).slice().sort(function(a,b){return Number(b[1])-Number(a[1]);});
    for(var i=0;i<sorted.length;i++) if(score>=Number(sorted[i][1])) return String(sorted[i][0]).replace(/,/g,' · ');
    return sorted.length?String(sorted[sorted.length-1][0]).replace(/,/g,' · '):null;
  }
  function verifiedFinalStats(stats){
    var e=stats&&stats.rankEvidence,table=stats&&stats.percentileTable;
    if(!(e&&e.status==='verified-source-rank'&&e.sourceId&&e.sourceRef&&e.verifiedAt&&Array.isArray(table)&&table.length)) return false;
    return table.every(function(row,index){
      if(!Array.isArray(row)||!Number.isFinite(Number(row[0]))||!Number.isFinite(Number(row[1]))||Number(row[1])<=0||Number(row[1])>100) return false;
      return !index||(Number(row[0])<Number(table[index-1][0])&&Number(row[1])>=Number(table[index-1][1]));
    });
  }
  function originalGrade(score,model){
    var basis=model&&model.cutBasis,rows=basis&&basis.rows;
    if(!(Array.isArray(basis&&basis.sources)&&basis.sources.length>=2&&Array.isArray(rows)&&rows.length)) return null;
    var sorted=rows.slice().sort(function(a,b){return Number(b.average)-Number(a.average);});
    for(var i=0;i<sorted.length;i++) if(score>=Number(sorted[i].average)) return String(sorted[i].grade)+'반';
    return basis.belowLabel||'노력요함';
  }
  function reportLink(item,options){
    var m=item.meta,name=options.student,helper=root.GFIELD_FINAL_LAST_ROUTES;
    if((m.kind==='final'||m.kind==='last')&&helper){
      var allowed=helper.accessAllowed(options.data||{},name,m.kind,m.round);
      return {url:allowed?helper.reportUrl(m.kind,m.round,name):'',label:allowed?'상세 분석·유사문제':'자료실 승인 필요'};
    }
    if(m.kind==='original') return {url:'final.html?set=original&round='+m.round+'&go=report&name='+encodeURIComponent(name),label:'상세 분석·유사문제'};
    if(m.kind==='hw') return {url:'mock.html?set=hw&round='+m.round+'&name='+encodeURIComponent(name),label:'상세 분석·유사문제'};
    if(m.kind==='middle') return {url:'mock.html?round='+m.round+'&name='+encodeURIComponent(name),label:'상세 분석·유사문제'};
    return {url:'',label:'자료 없음'};
  }
  function describe(item,options){
    var m=item.meta,model,round,stats,percentile=null,grade=null,title='';
    if(m.kind==='final'){
      model=root.GFIELD_MOCK_FINAL;round=model&&model.rounds&&model.rounds[String(m.round)];stats=round&&round.stats;
      title='파이널 모의고사 '+m.round+'회';
      if(verifiedFinalStats(stats)) percentile=percentileFromTable(item.score.score,stats.percentileTable);
      grade=gradeFromCuts(item.score.score,stats&&stats.cuts);
    }else if(m.kind==='last'){
      model=root.GFIELD_LAST_SCORE_DATA;round=model&&model.rounds&&model.rounds[String(m.round)];
      title='최종 모의고사 '+m.round+'회';
      percentile=Array.isArray(round&&round.percentileTable)?percentileFromTable(item.score.score,round.percentileTable):percentileFromDistribution(item.score.score,round&&round.scoreDist);
      grade=gradeFromCuts(item.score.score,round&&round.scoreBands);
    }else if(m.kind==='original'){
      model=root.GFIELD_MOCK_ORIGINAL;title='시그니처 실전 '+m.round+'회';grade=originalGrade(item.score.score,model);
    }else if(m.kind==='hw'){
      title='활용 모의고사 '+m.round+'회';
    }else{
      title='중급 모의고사 '+m.round+'회';
    }
    return {title:title,score:item.score.score,percentile:Number.isFinite(percentile)?round1(percentile):null,grade:grade,link:reportLink(item,options)};
  }
  function fetchRows(options,signal){
    var url=options.supabaseUrl+'/rest/v1/mock_results?select=student,round,ox,score,wrong,source,updated_at&student=eq.'+encodeURIComponent(options.student);
    return fetch(url,{method:'GET',headers:{apikey:options.supabaseKey,Authorization:'Bearer '+options.supabaseKey},signal:signal}).then(function(response){
      if(!response.ok) throw new Error('성적을 불러오지 못했습니다.');
      return response.json();
    });
  }
  function stateHtml(message,kind){
    if(kind==='loading') return '<div class="srh-state" role="status"><span class="srh-loading-dot" aria-hidden="true"></span>'+esc(message)+'</div>';
    if(kind==='error') return '<div class="srh-state srh-error" role="alert"><span>'+esc(message)+'</span><button type="button" class="srh-retry">다시 불러오기</button></div>';
    return '<div class="srh-state">'+esc(message)+'</div>';
  }
  function shell(container,summary){
    container.classList.remove('hidden');
    container.innerHTML='<button type="button" class="srh-banner" aria-expanded="'+(state.open?'true':'false')+'" aria-controls="student-result-panel">'+
      '<span class="srh-icon" aria-hidden="true">✓</span><span><span class="srh-title">내 모의고사 성적</span><span class="srh-summary">'+esc(summary)+'</span></span>'+
      '<span class="srh-open">성적 모아보기 <span class="srh-chevron" aria-hidden="true">⌄</span></span></button>'+
      '<div id="student-result-panel" class="srh-panel" '+(state.open?'':'hidden')+' aria-live="polite"></div>';
    var button=container.querySelector('.srh-banner'),panel=container.querySelector('.srh-panel');
    button.addEventListener('click',function(){state.open=!state.open;button.setAttribute('aria-expanded',state.open?'true':'false');panel.hidden=!state.open;});
    return panel;
  }
  function tableHtml(rows){
    var body=rows.map(function(row){
      var rank=row.percentile===null?'<span class="srh-na">자료 없음</span>':'<span class="srh-rank">'+row.percentile.toFixed(1)+'%</span>';
      var level=row.grade?'<span class="srh-level">'+esc(row.grade)+'</span>':'<span class="srh-na">자료 없음</span>';
      var action=row.link.url?'<a class="srh-detail" href="'+esc(row.link.url)+'">'+esc(row.link.label)+'</a>':'<span class="srh-detail" aria-disabled="true">'+esc(row.link.label)+'</span>';
      return '<tr><td class="srh-exam-cell" data-label="시험"><span class="srh-exam-name">'+esc(row.title)+'</span></td><td data-label="점수"><span class="srh-score">'+row.score.toFixed(1)+'점</span></td><td data-label="석차 백분율">'+rank+'</td><td data-label="예상 등급">'+level+'</td><td class="srh-action-col" data-label="보기">'+action+'</td></tr>';
    }).join('');
    return '<div class="srh-panel-head"><div><h2>응시한 시험</h2><p>석차 백분율은 작을수록 상위입니다.</p></div><span class="srh-count">'+rows.length+'회</span></div>'+
      '<div class="srh-table-wrap"><table class="srh-table"><thead><tr><th class="srh-exam-col">시험</th><th class="srh-score-col">점수</th><th class="srh-rank-col">석차 백분율</th><th class="srh-level-col">예상 등급</th><th class="srh-action-col">학습하기</th></tr></thead><tbody>'+body+'</tbody></table></div>';
  }
  function render(options){
    options=options||{};var container=options.container;
    if(!container||!options.student||!options.supabaseUrl||!options.supabaseKey){clear();return Promise.resolve();}
    state.options=options;state.open=false;var revision=++state.revision;
    if(state.controller) state.controller.abort();state.controller=new AbortController();
    var panel=shell(container,'응시 기록을 불러오는 중입니다.');panel.innerHTML=stateHtml('성적을 불러오는 중입니다.','loading');
    var timer=setTimeout(function(){if(state.controller)state.controller.abort();},8000);
    return fetchRows(options,state.controller.signal).then(function(rows){
      var items=officialRows(rows,options.student);return loadModels(items).then(function(){return items;});
    }).then(function(items){
      if(revision!==state.revision) return;
      var described=items.map(function(item){return describe(item,options);});
      panel=container.querySelector('.srh-panel');
      if(!described.length){container.querySelector('.srh-summary').textContent='등록된 응시 성적이 없습니다.';panel.innerHTML=stateHtml('아직 등록된 응시 성적이 없습니다.','empty');return;}
      container.querySelector('.srh-summary').textContent='응시 '+described.length+'회 · 시험별 진단과 복습을 한곳에서 봅니다.';
      panel.innerHTML=tableHtml(described);
    }).catch(function(error){
      if(revision!==state.revision||error&&error.name==='AbortError'&&state.revision!==revision) return;
      container.querySelector('.srh-summary').textContent='성적을 불러오지 못했습니다.';
      panel=container.querySelector('.srh-panel');panel.innerHTML=stateHtml('성적을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.','error');
      var retry=panel.querySelector('.srh-retry');if(retry)retry.addEventListener('click',function(){render(options);});
    }).finally(function(){clearTimeout(timer);});
  }
  function clear(){
    state.revision++;if(state.controller)state.controller.abort();state.controller=null;state.options=null;state.open=false;
    var container=document.getElementById('student-result-hub');if(container){container.innerHTML='';container.classList.add('hidden');}
  }
  root.GFIELD_STUDENT_RESULT_HUB={render:render,clear:clear,_test:{officialRows:officialRows,parseRound:parseRound,scoreOf:scoreOf,percentileFromTable:percentileFromTable,percentileFromDistribution:percentileFromDistribution,gradeFromCuts:gradeFromCuts}};
})(window);
