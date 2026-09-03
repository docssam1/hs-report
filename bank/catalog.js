(function(){
  'use strict';

  var R=window.BANK_TYPE_REGISTRY;
  var SOURCE_LABELS={middle:'중급',applied:'활용',final:'파이널',last:'최종',original:'시그니처 실전'};
  var TARGET_SETS=['applied','final','last','original'];
  var AREA_ORDER=['수·규칙찾기','식의 계산','도형','경우의 수'];
  var POINT_LABELS={'source-2.7':'2.7점','source-3.4':'3.4점','source-4.2':'4.2점'};
  var $=function(id){return document.getElementById(id)};
  var FINDER_MODE='paper';
  var TYPE_AREA='all';
  var SEARCH_STOP={어떤:1,다음:1,그림:1,문제:1,구하세요:1,구하시오:1,무엇입니까:1,몇:1,개:1,때:1,있는:1,하는:1,모두:1};

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function unique(values){var seen={};return values.filter(function(value){var key=String(value);if(seen[key])return false;seen[key]=true;return true})}
  function setText(id,value){$(id).textContent=String(value)}
  function filterValue(id){return $(id)?$(id).value:'all'}
  function percent(value){return Math.round(Number(value)*100)+'%'}
  function countBy(values){return values.reduce(function(map,value){map[value]=(map[value]||0)+1;return map},{})}
  function normalized(value){return String(value||'').toLocaleLowerCase('ko-KR').replace(/[^0-9a-z가-힣]+/g,' ').trim()}
  function queryMatches(item,query){
    var cleanQuery=normalized(query);
    if(!cleanQuery)return true;
    var fields=[item.area,item.subarea,item.displayType,item.typeFamilyLabel].concat(item.searchEvidence||[]);
    var haystack=normalized(fields.join(' '));
    if(haystack.replace(/ /g,'').indexOf(cleanQuery.replace(/ /g,''))>=0)return true;
    var tokens=unique(cleanQuery.split(/\s+/).filter(function(token){return token.length>=2&&!SEARCH_STOP[token]}));
    if(!tokens.length)return false;
    var hits=tokens.filter(function(token){return haystack.indexOf(token)>=0}).length;
    return hits>=Math.max(1,Math.ceil(tokens.length/2));
  }
  function inScope(setKey,scope){
    if(scope==='all')return true;
    if(scope==='target')return TARGET_SETS.indexOf(setKey)>=0;
    return setKey===scope;
  }

  function buildLastCatalogModel(){
    var paper=window.GFIELD_MOCK_LAST||{},scores=window.GFIELD_LAST_SCORE_DATA||{};
    var rounds={};
    Object.keys(scores.rounds||{}).forEach(function(roundKey){
      var scoreRound=scores.rounds[roundKey]||{};
      var paperRound=paper.rounds&&paper.rounds[roundKey];
      var paperQuestions=paperRound&&paperRound.paper&&paperRound.paper.questions;
      if(!Array.isArray(scoreRound.items)||scoreRound.items.length!==30||!Array.isArray(paperQuestions)||paperQuestions.length!==30){
        throw new Error('최종 '+roundKey+'회 30문항 분류·시험지 연결을 확인할 수 없습니다.');
      }
      var mergedItems=scoreRound.items.map(function(item,index){
        return Object.assign({},item,{body:paperQuestions[index]&&paperQuestions[index].body||''});
      });
      rounds[roundKey]=Object.assign({},scoreRound,{items:mergedItems});
    });
    if(Object.keys(rounds).length!==4)throw new Error('최종 모의고사 1~4회 분류 데이터가 모두 필요합니다.');
    return {title:paper.title||'최종 모의고사',questions:30,rounds:rounds};
  }

  function aggregate(items,originalCatalog){
    var originalById={};
    originalCatalog.forEach(function(entry){originalById[entry.id]=entry});
    var map={};
    items.forEach(function(item){
      var group=map[item.canonicalTypeId];
      if(!group){
        group=map[item.canonicalTypeId]={
          id:item.canonicalTypeId,area:item.area,subarea:item.subarea,familyLabel:item.typeFamilyLabel,
          displayTypes:[],sourceCounts:{},pointCounts:{},rateBandCounts:{},difficultyCounts:{},
          rates:[],unmeasuredRateCount:0,confirmedCount:0,candidateCount:0,itemCount:0,reviewBases:[]
        };
      }
      if(group.displayTypes.indexOf(item.displayType)<0)group.displayTypes.push(item.displayType);
      group.sourceCounts[item.sourceRef.set]=(group.sourceCounts[item.sourceRef.set]||0)+1;
      group.pointCounts[item.pointBand]=(group.pointCounts[item.pointBand]||0)+1;
      group.rateBandCounts[item.responseRateBand]=(group.rateBandCounts[item.responseRateBand]||0)+1;
      if(item.responseRateStatus==='measured')group.rates.push(item.responseRate);else group.unmeasuredRateCount++;
      if(item.difficultyClass)group.difficultyCounts[item.difficultyClass]=(group.difficultyCounts[item.difficultyClass]||0)+1;
      group.itemCount++;
      if(item.reviewStatus==='confirmed')group.confirmedCount++;else group.candidateCount++;
      if(group.reviewBases.indexOf(item.reviewBasis)<0)group.reviewBases.push(item.reviewBasis);
    });
    return Object.keys(map).map(function(key){
      var group=map[key],original=originalById[key]||null;
      group.displayTypes.sort(function(a,b){return a.localeCompare(b,'ko')});
      group.original=original;
      group.practiceVerified=!!(original&&original.generator&&original.generator.status==='verified-practice'&&original.generator.practiceReleaseReady===true);
      group.sourcePending=!!(original&&original.sourceFaithfulReleaseReady!==true);
      group.searchText=[group.area,group.subarea,group.familyLabel].concat(group.displayTypes).join(' ').toLocaleLowerCase('ko-KR');
      return group;
    });
  }

  function sourceBadges(group){
    return Object.keys(SOURCE_LABELS).filter(function(key){return group.sourceCounts[key]}).map(function(key){
      return '<span class="badge source">'+esc(SOURCE_LABELS[key])+' '+group.sourceCounts[key]+'문항</span>';
    }).join('');
  }

  function evidenceBadges(group){
    var html=Object.keys(POINT_LABELS).filter(function(key){return group.pointCounts[key]}).map(function(key){
      return '<span class="badge na">'+POINT_LABELS[key]+' '+group.pointCounts[key]+'</span>';
    }).join('');
    if(group.rates.length){
      var min=Math.min.apply(null,group.rates),max=Math.max.apply(null,group.rates);
      var label=min===max?percent(min):(percent(min)+'~'+percent(max));
      html+='<span class="badge source">실제 정답률 '+label+' · 유사문항 기준</span>';
    }
    if(group.unmeasuredRateCount)html+='<span class="badge na">정답률 미측정 '+group.unmeasuredRateCount+'</span>';
    Object.keys(group.difficultyCounts).sort().forEach(function(key){
      html+='<span class="badge pending">'+key+' '+group.difficultyCounts[key]+'</span>';
    });
    return html;
  }

  function rawTypesHtml(group){
    if(group.displayTypes.length===1)return '<div class="raw-single">원문 유형 · '+esc(group.displayTypes[0])+'</div>';
    return '<details class="raw-types"><summary>원문 유형 '+group.displayTypes.length+'개 보기</summary><ul>'+group.displayTypes.map(function(type){return '<li>'+esc(type)+'</li>'}).join('')+'</ul></details>';
  }

  function typeCardHtml(group){
    var candidate=group.candidateCount>0;
    var title=group.displayTypes.length===1?group.displayTypes[0]:group.familyLabel;
    var practice=group.practiceVerified
      ?'<a class="badge practice" href="index.html?gen='+encodeURIComponent(group.original.generator.legacyId)+'">이 유형으로 문제 만들기</a>'
      :'';
    return '<article class="type-card '+(candidate?'candidate':'confirmed')+'" data-type-id="'+esc(group.id)+'">'+
      '<h4>'+esc(title)+'</h4><div class="sources" aria-label="출처 문항 수">'+sourceBadges(group)+'</div>'+
      '<div class="badges" aria-label="난이도 근거">'+evidenceBadges(group)+'</div>'+(practice?'<div class="development">'+practice+'</div>':'')+rawTypesHtml(group)+'</article>';
  }

  function selectedItems(unified){
    var query=$('search').value;
    var scope=$('source-filter').value,round=$('round-filter').value;
    return unified.items.filter(function(item){
      if(FINDER_MODE==='paper'){
        if(item.sourceRef.set!==scope)return false;
        if(round!=='all'&&item.paperContextKey!==round)return false;
        return true;
      }
      if(TARGET_SETS.indexOf(item.sourceRef.set)<0)return false;
      if(TYPE_AREA!=='all'&&item.area!==TYPE_AREA)return false;
      if(!queryMatches(item,query))return false;
      return true;
    });
  }

  function developmentFilter(groups){
    var dev=filterValue('dev-filter');
    return groups.filter(function(group){
      if(dev==='verified'&&!group.practiceVerified)return false;
      if(dev==='source-pending'&&!group.sourcePending)return false;
      if(dev==='planned'&&group.practiceVerified)return false;
      return true;
    });
  }

  function scopeLabel(scope){
    if(scope==='target')return '활용~시그니처 실전 570문항';
    if(scope==='all')return '전체 810문항';
    return SOURCE_LABELS[scope]+' 범위';
  }

  function renderPaperContext(unified){
    var roundKey=$('round-filter').value;
    var box=$('paper-context');
    box.hidden=FINDER_MODE!=='paper';
    if(box.hidden)return;
    if(roundKey==='all'){
      box.innerHTML='<h2>1차 판단 · 시험지 점수대</h2><p>시험지·회차를 선택하면 그 회차의 평균과 실제 점수 구간을 먼저 보고, 문항별 실제 정답률을 이어서 비교합니다.</p>';
      return;
    }
    var paper=unified.papers.filter(function(row){return row.set+'|'+row.round===roundKey})[0];
    if(!paper)return;
    var metrics='<div class="paper-metrics">';
    if(paper.average!=null)metrics+='<span class="badge source">평균 '+paper.average+'점</span>';
    if(paper.cohortSize!=null)metrics+='<span class="badge na">표본 '+paper.cohortSize+'명</span>';
    metrics+='<span class="badge '+(paper.responseRatesMeasured?'confirmed':'na')+'">'+(paper.responseRatesMeasured?'문항 실제 정답률 있음':'문항 정답률 없음')+'</span></div>';
    var cuts='';
    if(Array.isArray(paper.scoreBands)&&paper.scoreBands.length){
      cuts='<div class="paper-cuts">'+paper.scoreBands.map(function(row){return '<span>'+esc(row[0])+' · '+esc(row[1])+'점 이상</span>'}).join('')+'</div>';
    }
    box.innerHTML='<h2>'+esc(SOURCE_LABELS[paper.set])+' '+paper.round+'회 · 점수대 우선 판단</h2><p>'+esc(paper.title)+'</p>'+metrics+cuts;
  }

  function updateStats(items,groups){
    if($('stat-questions'))setText('stat-questions',items.length);
    if($('stat-raw-types'))setText('stat-raw-types',unique(items.map(function(item){return item.displayType})).length);
    if($('stat-canonical-types'))setText('stat-canonical-types',unique(items.map(function(item){return item.canonicalTypeId})).length);
    if($('stat-confirmed'))setText('stat-confirmed',items.filter(function(item){return item.reviewStatus==='confirmed'}).length);
    if($('stat-candidate'))setText('stat-candidate',items.filter(function(item){return item.reviewStatus==='candidate'}).length);
    if($('stat-verified-practice'))setText('stat-verified-practice',groups.filter(function(group){return group.practiceVerified}).length);
    if($('notice-confirmed-count'))setText('notice-confirmed-count',items.filter(function(item){return item.reviewStatus==='confirmed'}).length);
    if($('stat-scope-label'))setText('stat-scope-label',scopeLabel($('source-filter').value));
  }

  function renderResults(unified,originalCatalog){
    var items=selectedItems(unified);
    var groups=developmentFilter(aggregate(items,originalCatalog));
    groups.sort(function(a,b){return AREA_ORDER.indexOf(a.area)-AREA_ORDER.indexOf(b.area)||a.subarea.localeCompare(b.subarea,'ko')||a.familyLabel.localeCompare(b.familyLabel,'ko')});
    var areas={};
    groups.forEach(function(group){
      if(!areas[group.area])areas[group.area]={};
      if(!areas[group.area][group.subarea])areas[group.area][group.subarea]=[];
      areas[group.area][group.subarea].push(group);
    });
    var html='';
    AREA_ORDER.concat(Object.keys(areas).filter(function(area){return AREA_ORDER.indexOf(area)<0})).forEach(function(area){
      if(!areas[area])return;
      var subareas=areas[area];
      var areaGroups=Object.keys(subareas).reduce(function(all,key){return all.concat(subareas[key])},[]);
      var areaQuestions=areaGroups.reduce(function(sum,group){return sum+group.itemCount},0);
      html+='<section class="area-section" data-area="'+esc(area)+'"><header class="area-head"><h2>'+esc(area)+'</h2><span>'+areaGroups.length+'유형 · '+areaQuestions+'문항</span></header>';
      Object.keys(subareas).sort(function(a,b){return a.localeCompare(b,'ko')}).forEach(function(subarea){
        var list=subareas[subarea];
        var subQuestions=list.reduce(function(sum,group){return sum+group.itemCount},0);
        html+='<section class="subarea"><div class="subarea-head"><h3>'+esc(subarea)+'</h3><span class="subarea-count">'+list.length+'유형 · '+subQuestions+'문항</span></div><div class="type-grid">'+list.map(typeCardHtml).join('')+'</div></section>';
      });
      html+='</section>';
    });
    if(!html)html='<div class="empty">관련 유형을 찾지 못했습니다. 지문의 핵심 낱말이나 유형명을 조금 짧게 입력해 보세요.</div>';
    $('results').innerHTML=html;
    $('results').setAttribute('aria-busy','false');
    $('result-status').textContent='현재 표시: '+groups.length+'유형 · '+items.length+'문항';
    updateStats(items,groups);
    renderPaperContext(unified);
    return groups;
  }

  function fillRoundFilter(unified){
    var scope=$('source-filter').value,current=$('round-filter').value;
    var papers=unified.papers.filter(function(paper){return inScope(paper.set,scope)});
    $('round-filter').innerHTML='<option value="all">전체 회차</option>'+papers.map(function(paper){
      var value=paper.set+'|'+paper.round;
      return '<option value="'+value+'">'+esc(SOURCE_LABELS[paper.set])+' '+paper.round+'회</option>';
    }).join('');
    if(Array.prototype.some.call($('round-filter').options,function(option){return option.value===current}))$('round-filter').value=current;
  }

  function fail(error){
    $('results').setAttribute('aria-busy','false');
    $('results').innerHTML='<div class="error"><strong>분류 현황을 불러오지 못했습니다.</strong><br>'+esc(error&&error.message||error)+'</div>';
    $('result-status').textContent='데이터 오류';
  }

  function setFinderMode(mode,unified,originalCatalog){
    FINDER_MODE=mode;
    var paperMode=mode==='paper';
    $('paper-panel').hidden=!paperMode;
    $('type-panel').hidden=paperMode;
    $('paper-tab').classList.toggle('active',paperMode);
    $('type-tab').classList.toggle('active',!paperMode);
    $('paper-tab').setAttribute('aria-selected',paperMode?'true':'false');
    $('type-tab').setAttribute('aria-selected',paperMode?'false':'true');
    renderResults(unified,originalCatalog);
    if(!paperMode)$('search').focus();
  }

  try{
    if(!R)throw new Error('문제은행 분류 레지스트리가 없습니다.');
    var models={
      middle:window.GFIELD_MOCK,applied:window.GFIELD_MOCK_HW,final:window.GFIELD_MOCK_FINAL,
      last:buildLastCatalogModel(),original:window.GFIELD_MOCK_ORIGINAL
    };
    var unified=R.buildUnifiedCatalog(models);
    var originalCatalog=R.buildCatalog(window.GFIELD_MOCK_ORIGINAL);
    fillRoundFilter(unified);
    var groups=renderResults(unified,originalCatalog);
    ['search','round-filter'].forEach(function(id){$(id).addEventListener(id==='search'?'input':'change',function(){groups=renderResults(unified,originalCatalog)})});
    $('source-filter').addEventListener('change',function(){fillRoundFilter(unified);groups=renderResults(unified,originalCatalog)});
    $('filter-form').addEventListener('submit',function(event){event.preventDefault();groups=renderResults(unified,originalCatalog)});
    $('paper-tab').addEventListener('click',function(){setFinderMode('paper',unified,originalCatalog)});
    $('type-tab').addEventListener('click',function(){setFinderMode('type',unified,originalCatalog)});
    $('reset-paper').addEventListener('click',function(){
      $('source-filter').value='applied';fillRoundFilter(unified);$('round-filter').value='all';groups=renderResults(unified,originalCatalog);
    });
    $('reset-type').addEventListener('click',function(){$('search').value='';groups=renderResults(unified,originalCatalog);$('search').focus()});
    Array.prototype.forEach.call(document.querySelectorAll('.area-pick'),function(button){
      button.addEventListener('click',function(){
        TYPE_AREA=button.getAttribute('data-area')||'all';
        Array.prototype.forEach.call(document.querySelectorAll('.area-pick'),function(row){row.classList.toggle('active',row===button)});
        groups=renderResults(unified,originalCatalog);
      });
    });
    window.__BANK_CATALOG_QA__={summary:unified.summary,groups:groups,unified:unified,difficultyPolicy:R.difficultyEvidencePolicy};
  }catch(error){fail(error)}
})();
