/* Official-attempt practice, supplemented with reviewed public source-linked items. */
(function(root){
  'use strict';
  var SUPPORTED=/^(?:final[123478]|original[12]|last[1234]|middle[78]|applied[1-9])$/;
  var BANK_CODES=['final1','final2','final3','final4','final7','final8','original1','original2','last1','last2','last3','last4','middle7','middle8','applied1','applied2','applied3','applied4','applied5','applied6','applied7','applied8','applied9'];
  var BAND_LABEL={all:'전체 배점','2.7':'2점대','3.4':'3점대','4.2':'4점대'};
  var SCOPE_LABEL={all:'승인된 시험 전체',wrong:'틀린 문제',correct:'맞은 문제'};
  var COUNTS={10:{'2.7':4,'3.4':3,'4.2':3},20:{'2.7':8,'3.4':7,'4.2':5},30:{'2.7':12,'3.4':10,'4.2':8}};
  function examTitle(value,count){var title=Array.from(String(value||'').replace(/\s+/g,' ').trim()).slice(0,30).join('');return title||(Number(count)===30?'지필드 맞춤 모의고사':'지필드 유형별 연습지');}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function mathText(v){return typeof document==='undefined'?esc(v):root.GFIELD_MATH_MARKUP.render(v);}
  var TYPE_LABELS={'관통 구멍이 있는 주사위 직육면체의 눈의 합 최적화':'구멍이 있는 주사위 쌓기의 눈의 합','자리 수하기':'원형 자리에서 남는 사람 찾기','단계별 바둑돌 배열의 흰·검은 수':'바둑돌 배열에서 검은 돌과 흰 돌의 수'};
  function typeLabel(value){return TYPE_LABELS[value]||value||'';}
  function label(code){if(/^applied[1-9]$/.test(code))return '활용 모의고사 '+code.slice(7)+'회';if(/^middle[78]$/.test(code))return '중급 모의고사 '+code.slice(6)+'회';if(/^last[1234]$/.test(code))return '최종 실전 '+code.slice(4)+'회';if(code.indexOf('original')===0)return '시그니처 '+code.slice(8)+'회';var n=Number(code.slice(5));return n===7?'최종 실전 7회':n===8?'최종 실전 8회':'파이널 '+n+'회';}
  function codeOf(attempt){var key=String(attempt&&attempt.key||attempt&&attempt.round||'');if(key==='7'||key==='8')return 'middle'+key;if(/^hw[1-9]$/.test(key))return 'applied'+key.slice(2);return SUPPORTED.test(key)?key:'';}
  function attemptLabel(attempt){var key=String(attempt&&attempt.key||attempt&&attempt.round||''),code=codeOf(attempt),m;if(code)return label(code);if(/^\d+$/.test(key))return '중급 모의고사 '+Number(key)+'회';if((m=/^hw(\d+)$/.exec(key)))return '활용 모의고사 '+Number(m[1])+'회';if((m=/^last(\d+)$/.exec(key)))return '최종 실전 '+Number(m[1])+'회';if((m=/^final(\d+)$/.exec(key)))return '파이널 '+Number(m[1])+'회';return '응시 회차 '+key;}
  function availability(attempt,student,data){var code=codeOf(attempt);return {code:code,label:attemptLabel(attempt),reason:!code?'preparing':isAllowed(code,student,data)?'ready':'denied'};}
  function availabilityNote(issues){return [['preparing','유사문제 준비 중'],['denied','열람 권한 없음'],['failed','자료 불러오기 실패']].filter(function(pair){return issues[pair[0]]&&issues[pair[0]].length;}).map(function(pair){return ' · '+pair[1]+': '+Array.from(new Set(issues[pair[0]])).join(', ');}).join('');}
  function isAllowed(code,student,data){
    if(!code||!student)return false;
    if(/^applied[1-9]$/.test(code)){var applied=(data&&data.archiveAccess||{})['활용 모의고사'];return Array.isArray(applied)&&(applied.indexOf('*')>=0||applied.indexOf(student)>=0);}
    if(/^last[1234]$/.test(code)){var acc=(data&&data.archiveAccess||{})['최종 모의고사'],att=data&&data.attendance||{},week={last1:'oct-5',last2:'oct-12',last3:'oct-19',last4:'oct-26'}[code];return Array.isArray(acc)&&(acc.indexOf('*')>=0||acc.indexOf(student)>=0)||Array.isArray(att[student])&&att[student].indexOf(week)>=0;}
    if(/^middle[78]$/.test(code)||code.indexOf('original')===0||code==='final7'||code==='final8'){
      var key=/^middle[78]$/.test(code)?'mock-mid-'+code.slice(6):code.indexOf('original')===0?'mock-signature-'+code.slice(8):(code==='final7'?'mock-final-7':(code==='final8'?'mock-final-8':'mock-last-1'));
      var list=data&&data.archiveProductAccess&&data.archiveProductAccess[key];
      return Array.isArray(list)&&(list.indexOf('*')>=0||list.indexOf(student)>=0);
    }
    return true; // Final 1–4 follow the existing registered-student bank access.
  }
  function approvedAttempts(attempts,student,data){
    var result=(attempts||[]).slice(),seen=new Set(result.map(codeOf));
    BANK_CODES.forEach(function(code){
      if(!seen.has(code)&&isAllowed(code,student,data))result.push({key:code,approvedOnly:true});
    });
    return result;
  }
  function loadDataset(code){
    if(/^applied[1-9]$/.test(code)){
      var adapter=root.QUESTION_BANK_ADAPTERS&&root.QUESTION_BANK_ADAPTERS.get('gfield-'+code+'-expanded');
      if(!adapter||typeof adapter.load!=='function')return Promise.reject(Error('활용 회차 어댑터를 확인할 수 없습니다.'));
      return adapter.load();
    }
    return root.BANK_FIXED.load(code);
  }
  function signature(item){return JSON.stringify([item.text,item.promptDataLines||[],item.asset&&item.asset.src||'',item.answer]);}
  /* 이미 푼(인쇄한) 문항 식별: 검수 문항은 id, 생성형은 내용 서명 */
  function itemKey(item){return String(item&&item.id||signature(item)).slice(0,300);}
  function profileOf(item){
    var P=root.GFIELD_BANK_LEARNING_PROFILE;
    if(!P||!item)return {area:'미분류',subarea:'분류 확인',type:'유형 확인',difficulty:'unclassified',basis:'insufficient-evidence'};
    var index=root.GFIELD_APPLIED_LEARNING_INDEX,round=index&&index.rounds&&index.rounds[String(item.sourceRound)];
    var override=item.sourceSet==='applied'&&round&&round.items&&round.items[String(item.sourceNo)];
    var learningArea=override&&override.area==='수와식'?'수와 식':override&&override.area;
    var tax=P.taxonomy(override?Object.assign({},item,{learningArea:learningArea,learningSubarea:override.subarea,learningDetailType:override.detailType}):item);
    if(tax.area==='미분류'&&item.area==='측정'&&item.subarea==='시각과 시간')tax.area='수와 식';
    var diff=P.difficulty(item);
    return {area:tax.area,subarea:tax.subarea,type:typeLabel(tax.detailType),difficulty:diff.id,basis:diff.basis};
  }
  function sourceRate(item){
    var no=Number(item&&item.sourceNo),round=Number(item&&item.sourceRound),value=null;
    if(!Number.isInteger(no)||no<1||no>30)return null;
    if(item.sourceSet==='final'&&round>=1&&round<=4){
      var final=root.GFIELD_MOCK_FINAL&&root.GFIELD_MOCK_FINAL.rounds&&root.GFIELD_MOCK_FINAL.rounds[String(round)];
      if(final&&final.stats&&final.stats.rateEvidence&&final.stats.rateEvidence.status==='verified-source-aggregate')value=final.stats.rate&&final.stats.rate[no];
    }else if(item.sourceSet==='last'&&round>=1&&round<=4){
      var last=root.GFIELD_LAST_SCORE_DATA&&root.GFIELD_LAST_SCORE_DATA.rounds&&root.GFIELD_LAST_SCORE_DATA.rounds[String(round)];
      value=last&&last.rates&&last.rates[no-1];
    }
    if(value==null||value==='')return null;
    value=Number(value);return Number.isFinite(value)&&value>=0&&value<=1?value:null;
  }
  function priorityOf(item,mode){
    var rate=sourceRate(item);if(rate!==null)return {measured:true,rank:mode==='easy'?-rate:mode==='normal'?Math.abs(rate-.5):rate,basis:'source-response-rate'};
    var evidence=item&&item.difficultyEvidence,reviewed=({상:'high',중:'middle',하:'low'})[evidence&&evidence.label]||profileOf(item).difficulty;
    var order=mode==='easy'?{low:0,middle:1,high:2}:mode==='normal'?{middle:0,low:1,high:1}:{high:0,middle:1,low:2};
    return {measured:false,rank:order[reviewed]??3,basis:evidence&&evidence.basis||'reviewed-source-difficulty'};
  }
  function typeKey(meta){return JSON.stringify([meta.area,meta.subarea,meta.type]);}
  function sourceItems(attempts,datasets,scope,source,band,difficulty){
    var rows=[];
    (attempts||[]).forEach(function(attempt){
      var code=codeOf(attempt),data=datasets&&datasets[code],ox=String(attempt.score&&attempt.score.ox||attempt.ox||'').toUpperCase();
      if(!code||source!=='all'&&(source instanceof Set?!source.has(code):code!==source)||!data||!Array.isArray(data.items)||scope!=='all'&&!/^[OX]{30}$/.test(ox))return;
      var seen=new Set();
      data.items.forEach(function(item){
        var no=Number(item&&item.sourceNo),meta;
        if(!Number.isInteger(no)||no<1||no>30||seen.has(no)||item.reviewStatus!=='verified'||
          band!=='all'&&item.pointBand!==band||scope==='wrong'&&ox[no-1]!=='X'||scope==='correct'&&ox[no-1]!=='O')return;
        meta=profileOf(item);
        if(difficulty!=='all'&&meta.difficulty!==difficulty)return;
        seen.add(no);rows.push({code:code,no:no,meta:meta,item:item});
      });
    });
    return rows;
  }
  function buildPool(attempts,datasets,scope,band,target,library,dynamic,freshRound,sourceDynamic,excluded,filter,priority){
    excluded=excluded instanceof Set?excluded:new Set();
    target=Object.prototype.hasOwnProperty.call(COUNTS,target)?Number(target):30;
    var groups=[];
    (attempts||[]).forEach(function(attempt){
      var code=codeOf(attempt),data=datasets&&datasets[code];
      if(!code||!data||!Array.isArray(data.items))return;
      var ox=String(attempt.score&&attempt.score.ox||attempt.ox||'').toUpperCase();
      if(scope!=='all'&&!/^[OX]{30}$/.test(ox))return;
      var byNo=new Map();
      data.items.forEach(function(item){
        var no=Number(item&&item.sourceNo);
        if(!Number.isInteger(no)||no<1||no>30||item.reviewStatus!=='verified'||
           band!=='all'&&item.pointBand!==band||scope==='wrong'&&ox[no-1]!=='X'||scope==='correct'&&ox[no-1]!=='O'||excluded.has(itemKey(item))||filter&&!filter(item))return;
        if(!byNo.has(no))byNo.set(no,[]);
        byNo.get(no).push(item);
      });
      var sources=Array.from(byNo.keys()).sort(function(a,b){return a-b;}).map(function(no){
        return byNo.get(no).sort(function(a,b){return a.variantNo-b.variantNo;});
      });
      if(priority&&priority!=='balanced')sources.sort(function(a,b){var x=priorityOf(a[0],priority),y=priorityOf(b[0],priority);return x.rank-y.rank||Number(a[0].sourceNo)-Number(b[0].sourceNo);});
      groups.push({code:code,sources:sources});
    });
    var selected=[],seenIds=new Set(),seenQuestions=new Set(),focusDepth=priority==='normal'?15:priority&&priority!=='balanced'?10:30;
    for(var pass=0;pass<9;pass++){
      var variant=(pass+Number(freshRound||0))%9;
      for(var depth=0;depth<focusDepth;depth++){
        groups.forEach(function(group){
          var item=group.sources[depth]&&group.sources[depth][variant];
          if(!item||seenIds.has(item.id))return;
          var content=signature(item);
          if(seenQuestions.has(content))return;
          seenIds.add(item.id);seenQuestions.add(content);
          selected.push({item:item,code:group.code});
        });
      }
    }
    /* 30문항 시험지는 필터를 써도 12·10·8 배점을 바꾸지 않는다. 부족한 배점대는 부분 인쇄로 알린다. */
    var keepMockRatio=(!priority||priority==='balanced')&&band==='all'&&(target===30||!filter);
    var chosen=keepMockRatio?['2.7','3.4','4.2'].flatMap(function(point){return selected.filter(function(entry){return entry.item.pointBand===point;}).slice(0,COUNTS[target][point]);}):selected.slice(0,target);
    if(scope==='all'&&library&&Array.isArray(library.items)&&chosen.length<target){
      var usedIds=new Set(chosen.map(function(entry){return entry.item.id;}));
      var usedContent=new Set(chosen.map(function(entry){return signature(entry.item);}));
      var publicItems=library.items.filter(function(item){
        return item&&item.reviewStatus==='verified'&&item.sourceSet==='final'&&[1,2].includes(Number(item.sourceRound))&&
          [1,2,3].includes(Number(item.variantNo))&&item.text&&item.answer!=null&&item.solution&&
          ['2.7','3.4','4.2'].includes(item.pointBand);
      });
      if(priority&&priority!=='balanced')publicItems.sort(function(a,b){return priorityOf(a,priority).rank-priorityOf(b,priority).rank||a.variantNo-b.variantNo;});
      function supplement(point,limit){
        var current=chosen.filter(function(entry){return entry.item.pointBand===point;}).length;
        publicItems.filter(function(item){return item.pointBand===point;}).forEach(function(item){
          if(current>=limit||usedIds.has(item.id)||usedContent.has(signature(item))||excluded.has(itemKey(item)))return;
          chosen.push({item:item,code:'final'+item.sourceRound,origin:'library'});
          usedIds.add(item.id);usedContent.add(signature(item));current++;
        });
      }
      if(band==='all'&&(!priority||priority==='balanced')) ['2.7','3.4','4.2'].forEach(function(point){supplement(point,COUNTS[target][point]);});
      else if(band==='all')publicItems.forEach(function(item){if(chosen.length>=target||usedIds.has(item.id)||usedContent.has(signature(item))||excluded.has(itemKey(item)))return;chosen.push({item:item,code:'final'+item.sourceRound,origin:'library'});usedIds.add(item.id);usedContent.add(signature(item));});
      else supplement(band,target);
    }
    if(scope==='all'&&Number(freshRound)>0){
      var anchors=library&&dynamic&&typeof dynamic.has==='function'&&typeof dynamic.generate==='function'?
        library.items.filter(function(item){return item&&item.variantNo===1&&item.importantTypeId&&dynamic.has(item.importantTypeId);}):[];
      if(sourceDynamic&&typeof sourceDynamic.has==='function'&&typeof sourceDynamic.generate==='function'){
        var attendedAnchors=[];
        groups.forEach(function(group){
          if(!['final3','final4'].includes(group.code))return;
          group.sources.forEach(function(source){
            var anchor=source[0];
            if(anchor&&anchor.variantNo===1&&sourceDynamic.has(anchor.genId))attendedAnchors.push(anchor);
          });
        });
        anchors=attendedAnchors.concat(anchors);
      }
      var seenFresh=new Set(chosen.map(signature));
      ['2.7','3.4','4.2'].forEach(function(point){
        if(band!=='all'&&band!==point)return;
        var positions=[];
        chosen.forEach(function(entry,index){if(entry.item.pointBand===point)positions.push(index);});
        var candidates=anchors.filter(function(item){return item.pointBand===point;});
        var needed=Math.min(Math.round(positions.length*0.3),positions.length);
        var made=0,guard=0;
        while(made<needed&&candidates.length&&guard<needed*40){
          var anchor=candidates[(guard+Number(freshRound)-1)%candidates.length];
          var serial=4+((Number(freshRound)-1)*7+guard)%37;
          guard++;
          var item;
          try{item=anchor.importantTypeId?dynamic.generate(anchor.importantTypeId,serial,anchor):sourceDynamic.generate(anchor.genId,serial,anchor);}catch(error){continue;}
          var proof=item&&item.verification,content=item&&signature(item);
          if(!item||item.reviewStatus!=='runtime-verified'||item.pointBand!==point||filter&&!filter(item)||
             !proof||!proof.primary||!proof.independent||String(proof.primary.answer)!==String(proof.independent.answer)||
             !proof.visibleEvidence||proof.visibleEvidence.passed!==true||!item.text||item.answer==null||!item.solution||
             !Array.isArray(item.acceptedAnswers)||!item.acceptedAnswers.map(String).includes(String(proof.primary.answer))||seenFresh.has(content)||excluded.has(itemKey(item)))continue;
          seenFresh.add(content);
          chosen[positions[positions.length-1-made]]={item:item,code:'final'+item.sourceRound,origin:'generated'};
          made++;
        }
      });
    }
    if(band==='all'&&(!priority||priority==='balanced'))chosen.sort(function(a,b){return ['2.7','3.4','4.2'].indexOf(a.item.pointBand)-['2.7','3.4','4.2'].indexOf(b.item.pointBand);});
    var attemptCount=chosen.filter(function(entry){return !entry.origin;}).length;
    var libraryCount=chosen.filter(function(entry){return entry.origin==='library';}).length;
    var generatedCount=chosen.filter(function(entry){return entry.origin==='generated';}).length;
    return {target:target,attemptCount:attemptCount,libraryCount:libraryCount,generatedCount:generatedCount,available:chosen.length,missing:Math.max(0,target-chosen.length),questions:chosen.map(function(entry,index){
      return {index:index+1,item:entry.item,code:entry.code,origin:entry.origin||'attempt'};
    })};
  }
  function replaceOne(paper,index,attempts,datasets,scope,band,excluded,filter){
    var current=paper&&paper.questions&&paper.questions[index];if(!current)return null;
    var usedIds=new Set(paper.questions.map(function(row){return row.item.id;})),usedContent=new Set(paper.questions.map(function(row){return signature(row.item);})),choices=[];
    (attempts||[]).forEach(function(attempt){
      var code=codeOf(attempt),data=datasets&&datasets[code],ox=String(attempt.score&&attempt.score.ox||attempt.ox||'').toUpperCase();
      if(!code||!data||!Array.isArray(data.items)||scope!=='all'&&!/^[OX]{30}$/.test(ox))return;
      data.items.forEach(function(item){var no=Number(item.sourceNo);
        if(item.reviewStatus!=='verified'||item.pointBand!==current.item.pointBand||band!=='all'&&item.pointBand!==band||scope==='wrong'&&ox[no-1]!=='X'||scope==='correct'&&ox[no-1]!=='O'||excluded&&excluded.has(itemKey(item))||filter&&!filter(item)||usedIds.has(item.id)||usedContent.has(signature(item)))return;
        choices.push({item:item,code:code});
      });
    });
    var sameSourceChoices=choices.filter(function(row){return row.code===current.code&&Number(row.item.sourceNo)===Number(current.item.sourceNo);});
    if(sameSourceChoices.length)choices=sameSourceChoices;
    var type=typeKey(profileOf(current.item)),currentVariant=Number(current.item.variantNo)||0;
    choices.sort(function(a,b){
      function rank(row){var sameSource=row.code===current.code&&Number(row.item.sourceNo)===Number(current.item.sourceNo),sameType=typeKey(profileOf(row.item))===type;
        return [sameSource?0:sameType?1:row.code===current.code?2:3,sameSource?((Number(row.item.variantNo)||0)-currentVariant+99)%99:Number(row.item.sourceNo)||0];}
      var x=rank(a),y=rank(b);return x[0]-y[0]||x[1]-y[1]||a.code.localeCompare(b.code);
    });
    if(!choices.length)return null;
    var replacement=choices[0],questions=paper.questions.slice();questions[index]={index:current.index,item:replacement.item,code:replacement.code,origin:'attempt'};
    return Object.assign({},paper,{questions:questions,attemptCount:questions.filter(function(row){return row.origin==='attempt';}).length,libraryCount:questions.filter(function(row){return row.origin==='library';}).length,generatedCount:questions.filter(function(row){return row.origin==='generated';}).length});
  }
  function figure(asset){
    if(!asset)return '';
    if(!/^data:image\/png;base64,/.test(asset.src||'')&&!/^assets\/[A-Za-z0-9/_-]+\.(?:png|svg)$/.test(asset.src||''))throw Error('검수 그림을 확인할 수 없습니다.');
    return '<img src="'+esc(asset.src)+'" alt="'+esc(asset.description||'문항 그림')+'">';
  }
  function page(title,number,total,content,kind,fourGrid,meta,sixGrid){
    var first=number===1,heading=meta.title+(kind==='answer'?' · 정답과 풀이':'');
    var mast='<div class="pm-exam-mast"><span class="pm-brand">G·FIELD <small>지필드 영재교육</small></span><span>성공하는 공부 습관을 만드는<br>대치 지필드 영재교육</span></div>';
    var cover=first?'<div class="pm-exam-cover'+(heading.length>22?' pm-long-title':'')+'"><h2>'+esc(heading)+'</h2><div class="pm-student-fields"><span>학교 <i></i></span><span>학년 <i></i></span><span>이름 <b>'+esc(meta.student)+'</b></span><span>날짜 <i></i></span></div><div class="pm-exam-count">'+meta.count+'문항 · '+meta.totalScore+'점</div></div>':'';
    var score=first&&kind==='question'?'<table class="pm-score-table" aria-label="출제 배점표"><tbody><tr><th>배점</th><td>2.7점</td><td>3.4점</td><td>4.2점</td><th>합계</th></tr><tr><th>문항 수</th><td>'+meta.counts['2.7']+'</td><td>'+meta.counts['3.4']+'</td><td>'+meta.counts['4.2']+'</td><td>'+meta.count+'</td></tr></tbody></table>':'';
    return '<section class="pm-page pm-'+kind+'-page'+(fourGrid?' pm-four-grid':'')+(sixGrid?' pm-six-grid':'')+(first?' pm-first':'')+'"><div class="pm-watermark"><div class="wm-layer"></div></div><div class="pm-page-content">'+(first?mast+cover+score:'<div class="pm-compact-head"><span>G·FIELD · 지필드 영재교육</span><span>'+esc(meta.title+' · '+title)+'</span></div>')+'<div class="pm-'+kind+'-grid">'+content+'</div><footer class="pm-exam-footer"><span>'+esc('지필드 영재교육 · '+meta.title)+'</span><span>- '+number+' / '+total+' -</span></footer></div></section>';
  }
  function questionWide(entry){
    var x=entry.item,given=Array.isArray(x.promptDataLines)?x.promptDataLines.join(' '):'';
    return String(x.text||'').length+given.length>210||!!x.asset&&(String(x.text||'').length+given.length>125||[28,30].includes(Number(x.sourceNo)));
  }
  function questionCompactWide(entry){var x=entry.item;return questionWide(entry)||!!x.asset||String(x.text||'').length+(Array.isArray(x.promptDataLines)?x.promptDataLines.join(' ').length:0)>165;}
  function questionTall(entry){return entry.item.sourceSet==='middle'&&Number(entry.item.sourceRound)===7&&Number(entry.item.sourceNo)===13;}
  function answerWide(entry){var x=entry.item;return !!x.solutionAsset||String(x.solution||'').length>190||Array.isArray(x.solutionSteps)&&x.solutionSteps.join('').length>190;}
  function answerCompactWide(entry){return answerWide(entry);}
  function answerTall(entry){var x=entry.item,steps=Array.isArray(x.solutionSteps)?x.solutionSteps.join(''):String(x.solution||'');return steps.length>420||!!x.solutionAsset&&steps.length>190;}
  function rows(items,wide,tall,perPage){
    var out=[],pending=[];
    items.forEach(function(entry){
      if(wide(entry)||tall&&tall(entry)){
        if(pending.length){out.push({entries:pending,tall:false,wide:false});pending=[];}
        out.push({entries:[entry],tall:!!(tall&&tall(entry)),wide:true});
      }else{
        pending.push(entry);
        if(pending.length===2){out.push({entries:pending,tall:false,wide:false});pending=[];}
      }
    });
    if(pending.length)out.push({entries:pending,tall:false,wide:false});
    var pages=[],current=[],hasWide=false;
    out.forEach(function(row){
      if(row.tall){if(current.length){pages.push(current.flatMap(function(x){return x.entries;}));current=[];hasWide=false;}pages.push(row.entries);return;}
      if(current.length>=(hasWide||row.wide?2:Number(perPage)===6?3:2)){pages.push(current.flatMap(function(x){return x.entries;}));current=[];hasWide=false;}
      current.push(row);hasWide=hasWide||row.wide;
      if(current.length===(hasWide?2:Number(perPage)===6?3:2)){pages.push(current.flatMap(function(x){return x.entries;}));current=[];hasWide=false;}
    });
    if(current.length)pages.push(current.flatMap(function(x){return x.entries;}));
    return pages;
  }
  function questionCard(entry,wide){
    var x=entry.item,given=Array.isArray(x.promptDataLines)?x.promptDataLines:[];
    return '<article class="pm-q'+(wide(entry)||questionTall(entry)?' pm-wide':'')+(questionTall(entry)?' pm-tall':'')+'" data-item-id="'+esc(x.id)+'" data-question-index="'+(entry.index-1)+'"><div class="pm-qhead"><h3>'+entry.index+'.</h3><span class="pm-points">['+esc(x.pointBand)+'점]</span><span class="pm-type">'+esc(typeLabel(x.detailType))+(entry.origin==='library'?' · 자료실 보충':entry.origin==='generated'?' · 새 문제':'')+'</span><button type="button" class="pm-replace" aria-label="'+entry.index+'번 문제만 바꾸기">이 문제만 바꾸기</button></div><p>'+mathText(x.stemHtml||x.text)+'</p>'+
      (given.length?'<div class="pm-given">'+given.map(mathText).join('<br>')+'</div>':'')+figure(x.asset)+
      '<div class="pm-work" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="pm-answerline">답 <span></span></div></article>';
  }
  function answerCard(entry,wide){
    var x=entry.item,steps=Array.isArray(x.solutionSteps)&&x.solutionSteps.length?x.solutionSteps:[x.solution];
    return '<article class="pm-answer'+(wide(entry)?' pm-wide':'')+(answerTall(entry)?' pm-tall':'')+'" data-answer-id="'+esc(x.id)+'"><h3>'+entry.index+'번 · '+esc(typeLabel(x.detailType))+'</h3><p class="pm-source">'+(entry.origin==='library'?'자료실 공개 보충 · ':entry.origin==='generated'?'자료실 공개 생성형 · ':'')+esc(label(entry.code))+' 원문 '+x.sourceNo+'번 · '+(entry.origin==='generated'?'추가 연습문제':'검수 유사문제 '+x.variantNo)+'</p><strong>답 '+mathText(x.answer)+'</strong><ol>'+steps.map(function(step){return '<li>'+mathText(step)+'</li>';}).join('')+'</ol>'+figure(x.solutionAsset)+'</article>';
  }
  function renderPaper(paper,scope,band,student,title,perPage){
    if(!paper.questions.length||paper.questions.length>paper.target)throw Error('인쇄할 검수 문항이 없습니다.');
    var counts={'2.7':0,'3.4':0,'4.2':0};paper.questions.forEach(function(entry){if(!Object.prototype.hasOwnProperty.call(counts,entry.item.pointBand))throw Error('문항 배점을 확인할 수 없습니다.');counts[entry.item.pointBand]++;});
    var meta={student:student,title:examTitle(title,paper.target),count:paper.questions.length,counts:counts,totalScore:(counts['2.7']*2.7+counts['3.4']*3.4+counts['4.2']*4.2).toFixed(1).replace(/\.0$/,'')};
    var density=Number(perPage)===6?6:4,qWide=density===6?questionCompactWide:questionWide,aWide=density===6?answerCompactWide:answerWide,qPages=[],aPages=[],questionGroups=rows(paper.questions,qWide,questionTall,density),answerGroups=rows(paper.questions,aWide,answerTall,density);
    questionGroups.forEach(function(group,index){var ordinary=group.every(function(entry){return !qWide(entry)&&!questionTall(entry);});qPages.push(page('문제',index+1,questionGroups.length,group.map(function(entry){return questionCard(entry,qWide);}).join(''),'question',group.length===4&&ordinary,meta,density===6&&group.length>=5&&ordinary));});
    answerGroups.forEach(function(group,index){var ordinary=group.every(function(entry){return !aWide(entry)&&!answerTall(entry);});aPages.push(page('정답과 풀이',index+1,answerGroups.length,group.map(function(entry){return answerCard(entry,aWide);}).join(''),'answer',group.length===4&&ordinary,meta,density===6&&group.length>=5&&ordinary));});
    var duplexBlank=qPages.length%2?['<section class="pm-page pm-duplex-blank" aria-hidden="true"></section>']:[];
    return qPages.concat(duplexBlank,aPages).join('');
  }
  async function fetchAttempts(student){
    var auth=root.GFIELD_AUTH,path='mock_results?select=student,round,ox,score,wrong,source,updated_at&student=eq.'+encodeURIComponent(student);
    var response=await fetch(auth.SUPABASE_URL+'/rest/v1/'+path,{headers:{apikey:auth.PUBLISHABLE_KEY,Authorization:'Bearer '+auth.PUBLISHABLE_KEY,'x-gfield-student':btoa(unescape(encodeURIComponent(student)))}});
    if(!response.ok)throw Error('응시 기록을 불러오지 못했습니다.');
    return root.GFIELD_STUDENT_RESULT_HUB.officialAttempts(await response.json(),student);
  }
  async function mount(){
    var account=await root.GFIELD_BANK_ACCESS.ready,query=new URLSearchParams(location.search);
    var student=String(account.student||((account.role==='admin'||account.role==='teacher')?query.get('name'):'')||'').trim();
    var status=document.getElementById('pmStatus'),print=document.getElementById('pmPrint'),pages=document.getElementById('pmPages');
    if(!student){status.textContent='학생 이름으로 자료실에 입장해 주세요.';return;}
    var scope=Object.prototype.hasOwnProperty.call(SCOPE_LABEL,query.get('scope'))?query.get('scope'):'all',band=Object.prototype.hasOwnProperty.call(BAND_LABEL,query.get('band'))?query.get('band'):'all',priority='balanced',selectedSources=null,selectedAreas=null,selectedSubareas=null,difficulty='all',selectedTypes=new Set(),visibleTypes=[],previewKey='',availableCodes=[],areaOptions=[],subareaOptions=[];
    var count=COUNTS[query.get('count')]?Number(query.get('count')):30,pageDensity=4;
    var titleInput=document.getElementById('pmTitle'),titleEdited=false;
    titleInput.value=examTitle('',count);
    document.title=titleInput.value+' | 지필드 영재교육';
    function currentTitle(){return examTitle(titleEdited?titleInput.value:'',count);}
    function showTitle(){
      var title=currentTitle();document.title=title+' | 지필드 영재교육';
      pages.querySelectorAll('.pm-page').forEach(function(section){
        var answer=section.classList.contains('pm-answer-page'),kind=answer?'정답과 풀이':'문제';
        var cover=section.querySelector('.pm-exam-cover'),heading=title+(answer?' · 정답과 풀이':'');
        if(cover){cover.querySelector('h2').textContent=heading;cover.classList.toggle('pm-long-title',heading.length>22);}
        var compact=section.querySelector('.pm-compact-head span:last-child');if(compact)compact.textContent=title+' · '+kind;
        var footer=section.querySelector('.pm-exam-footer span:first-child');if(footer)footer.textContent='지필드 영재교육 · '+title;
      });
    }
    var attempts=[],datasets={},unavailable={preparing:[],denied:[],failed:[]},revision=0,currentPaperCount=0,currentPaper=null,currentAttempts=[],currentFilterFn=null,library=null,libraryPromise=null,freshRound=0;
    var doneKeys=new Set(),skipDone=true,currentKeys=[];
    function skipSet(){return skipDone?doneKeys:new Set();}
    function taxonomyActive(){return selectedAreas!==null||selectedSubareas!==null||difficulty!=='all'||selectedTypes.size>0;}
    function currentFilter(){return !taxonomyActive()?null:function(item){var meta=profileOf(item);return (selectedAreas===null||selectedAreas.has(meta.area))&&(selectedSubareas===null||selectedSubareas.has(meta.subarea))&&(difficulty==='all'||meta.difficulty===difficulty)&&(!selectedTypes.size||selectedTypes.has(typeKey(meta)));};}
    function checkList(id,values,selected,summaryId,display){
      var list=document.getElementById(id),count=selected===null?values.length:values.filter(function(value){return selected.has(value);}).length;
      var oldScroll=list.scrollTop,hadOptions=!!list.querySelector('input[type="checkbox"]');
      list.innerHTML=values.length?values.map(function(value){return '<label class="pm-check-row"><input type="checkbox" value="'+esc(value)+'"'+(selected===null||selected.has(value)?' checked':'')+'><span>'+esc(display?display(value):value)+'</span></label>';}).join(''):'<p class="pm-filter-empty">선택할 항목이 없습니다.</p>';
      if(hadOptions)list.scrollTop=oldScroll;
      else if(id==='pmSourceList'&&selected!==null){var checked=list.querySelector('input:checked');if(checked)checked.closest('label').scrollIntoView({block:'nearest'});}
      document.getElementById(summaryId).textContent=count+' / '+values.length+'개 선택';
    }
    function sourceLabel(){if(selectedSources===null)return '모든 승인 회차';if(selectedSources.size===1)return label(Array.from(selectedSources)[0]);return selectedSources.size+'개 회차 선택';}
    function selectionChanged(kind,value,checked){
      var values=kind==='source'?availableCodes:kind==='area'?areaOptions:subareaOptions;
      var selected=kind==='source'?selectedSources:kind==='area'?selectedAreas:selectedSubareas;
      if(selected===null)selected=new Set(values);
      if(checked)selected.add(value);else selected.delete(value);
      if(values.length&&values.every(function(item){return selected.has(item);})&&selected.size===values.length)selected=null;
      if(kind==='source'){selectedSources=selected;freshRound=0;}
      else if(kind==='area')selectedAreas=selected;
      else selectedSubareas=selected;
      render();
    }
    function renderPreview(){
      var box=document.getElementById('pmPreview'),group=visibleTypes.find(function(row){return row.key===previewKey;});
      if(!group){box.innerHTML='<p>세부 유형의 ‘문항 보기’를 누르면 대표 문항을 볼 수 있습니다.</p>';return;}
      var item=group.sample,given=Array.isArray(item.promptDataLines)?item.promptDataLines:[];
      box.innerHTML='<h3>'+esc(group.meta.type)+'</h3><div class="pm-preview-source">'+esc(group.meta.area+' · '+group.meta.subarea+' · '+label(group.code))+' · 원문 '+group.no+'번 유형</div><p>'+mathText(item.stemHtml||item.text)+'</p>'+(given.length?'<div class="pm-given">'+given.map(mathText).join('<br>')+'</div>':'')+figure(item.asset);
    }
    function refreshTaxonomy(){
      checkList('pmSourceList',availableCodes,selectedSources,'pmSourceSummary',label);
      var rows=sourceItems(attempts,datasets,scope,selectedSources===null?'all':selectedSources,band,difficulty);
      areaOptions=Array.from(new Set(rows.map(function(row){return row.meta.area;}))).sort(function(a,b){return a.localeCompare(b,'ko');});
      checkList('pmAreaList',areaOptions,selectedAreas,'pmAreaSummary');
      var areaRows=rows.filter(function(row){return selectedAreas===null||selectedAreas.has(row.meta.area);});
      subareaOptions=Array.from(new Set(areaRows.map(function(row){return row.meta.subarea;}))).sort(function(a,b){return a.localeCompare(b,'ko');});
      checkList('pmSubareaList',subareaOptions,selectedSubareas,'pmSubareaSummary');
      var shown=areaRows.filter(function(row){return selectedSubareas===null||selectedSubareas.has(row.meta.subarea);}),groups=new Map();
      shown.forEach(function(row){var key=typeKey(row.meta),group=groups.get(key);if(!group){group={key:key,meta:row.meta,count:0,sample:row.item,code:row.code,no:row.no};groups.set(key,group);}group.count++;});
      visibleTypes=Array.from(groups.values()).sort(function(a,b){return a.meta.type.localeCompare(b.meta.type,'ko');});
      document.getElementById('pmTypeList').innerHTML=visibleTypes.length?visibleTypes.map(function(group){return '<div class="pm-type-row"><label><input type="checkbox" data-type-key="'+esc(group.key)+'"'+(selectedTypes.has(group.key)?' checked':'')+'><span>'+esc(group.meta.subarea+' · '+group.meta.type)+' · 원문 '+group.count+'개</span></label><button type="button" data-preview-key="'+esc(group.key)+'" aria-label="'+esc(group.meta.type)+' 문항 보기">문항 보기</button></div>';}).join(''):'<div class="pm-empty">현재 조건에 맞는 승인 유형이 없습니다.</div>';
      var hidden=Array.from(selectedTypes).filter(function(key){return !groups.has(key);}).length;
      document.getElementById('pmTypeSummary').textContent=visibleTypes.length+'개 유형 · '+shown.length+'개 원문 · 선택 '+selectedTypes.size+'개'+(hidden?' · 현재 결과 밖 '+hidden+'개':'');
      document.getElementById('pmSelectVisible').disabled=!visibleTypes.length;
      document.getElementById('pmClearTypes').disabled=!selectedTypes.size;
      renderPreview();
    }
    function hdr(){var auth=root.GFIELD_AUTH;return {apikey:auth.PUBLISHABLE_KEY,Authorization:'Bearer '+auth.PUBLISHABLE_KEY,'x-gfield-student':btoa(unescape(encodeURIComponent(student))),'Content-Type':'application/json'};}
    async function loadHistory(){
      try{var auth=root.GFIELD_AUTH;var r=await fetch(auth.SUPABASE_URL+'/rest/v1/bank_print_history?select=item_key&student=eq.'+encodeURIComponent(student)+'&limit=5000',{headers:hdr()});
        if(r.ok)(await r.json()).forEach(function(row){doneKeys.add(row.item_key);});}catch(error){}
    }
    function saveHistory(){
      var rows=currentKeys.filter(function(k){return !doneKeys.has(k.key);}).map(function(k){return {student:student,item_key:k.key,source_code:k.code||null};});
      if(!rows.length)return;
      var auth=root.GFIELD_AUTH,h=hdr();h.Prefer='resolution=ignore-duplicates,return=minimal';
      fetch(auth.SUPABASE_URL+'/rest/v1/bank_print_history?on_conflict=student,item_key',{method:'POST',headers:h,body:JSON.stringify(rows)}).then(function(r){if(r.ok){rows.forEach(function(x){doneKeys.add(x.item_key);});controls();}}).catch(function(){});
    }
    function controls(){
      document.querySelectorAll('[data-scope]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.scope===scope));});
      document.querySelectorAll('[data-priority]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.priority===priority));});
      document.querySelectorAll('[data-band]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.band===band));});
      document.querySelectorAll('[data-count]').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.count)===count));});
      document.querySelectorAll('[data-page-density]').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.pageDensity)===pageDensity));});
      var fresh=document.getElementById('pmFresh');
      fresh.disabled=!attempts.length;
      fresh.textContent='다른 새 문제로 바꾸기';
      var skip=document.getElementById('pmSkipDone');
      if(skip){skip.setAttribute('aria-pressed',String(skipDone));skip.textContent=skipDone?'이미 푼 문제 제외 · 켜짐':'이미 푼 문제 제외 · 꺼짐';}
      var skipInfo=document.getElementById('pmSkipInfo');
      if(skipInfo)skipInfo.textContent='지금까지 인쇄한 문항 '+doneKeys.size+'개 · 인쇄하면 다음 시험지에서 빠집니다';
    }
    function hasOtherReviewedItems(selectedAttempts,filter,paper){
      var choices=new Set();
      selectedAttempts.forEach(function(attempt){
        var data=datasets[codeOf(attempt)],ox=String(attempt.score&&attempt.score.ox||attempt.ox||'').toUpperCase();
        if(!data||!Array.isArray(data.items)||scope!=='all'&&!/^[OX]{30}$/.test(ox))return;
        data.items.forEach(function(item){var no=Number(item.sourceNo);if(item.reviewStatus!=='verified'||band!=='all'&&item.pointBand!==band||scope==='wrong'&&ox[no-1]!=='X'||scope==='correct'&&ox[no-1]!=='O'||skipSet().has(itemKey(item))||filter&&!filter(item))return;choices.add(signature(item));});
      });
      return choices.size>paper.available;
    }
    async function render(){
      var current=++revision;refreshTaxonomy();controls();print.disabled=true;pages.innerHTML='';currentPaperCount=0;currentPaper=null;
      var selectedAttempts=selectedSources===null?attempts:attempts.filter(function(attempt){return selectedSources.has(codeOf(attempt));});
      var filter=currentFilter(),paper=buildPool(selectedAttempts,datasets,scope,band,count,null,null,freshRound,root.BANK_FINAL_SOURCE_GENERATORS,skipSet(),filter,priority),note=availabilityNote(unavailable);
      if(skipDone&&doneKeys.size)note+=' · 이미 푼 문제 제외';
      if(!selectedAttempts.length){status.textContent=availableCodes.length?'출제 회차를 선택해 주세요.':'출제 가능한 승인 회차가 없습니다.';return;}
      if(selectedSources===null&&scope==='all'&&!filter&&(paper.missing||freshRound>0)&&Array.isArray(root.GFIELD_DATA&&root.GFIELD_DATA.students)&&root.GFIELD_DATA.students.includes(student)){
        try{
          if(!libraryPromise)libraryPromise=root.BANK_FIXED.load('important');
          library=await libraryPromise;
          if(current!==revision)return;
          paper=buildPool(selectedAttempts,datasets,scope,band,count,library,root.BANK_IMPORTANT_GENERATORS,freshRound,root.BANK_FINAL_SOURCE_GENERATORS,skipSet(),null,priority);
        }catch(error){libraryPromise=null;note+=' · 자료실 공개 문제를 불러오지 못했습니다.';}
      }
      var canChange=hasOtherReviewedItems(selectedAttempts,filter,paper)||paper.generatedCount>0;
      document.getElementById('pmFresh').disabled=!canChange;
      document.getElementById('pmFreshHint').textContent=canChange?'선택한 조건의 다른 검수 문항으로 바꿉니다.':'현재 조건에서 바꿀 다른 검수 문항이 없습니다.';
      if(!paper.available){status.innerHTML='<span class="pm-short">선택한 조건의 검수 유사문제가 없습니다.</span>'+esc(note);return;}
      var sourceNote=paper.libraryCount||paper.generatedCount?' · 승인 회차 '+paper.attemptCount+'문항 + 자료실 공개 보충 '+paper.libraryCount+'문항 + 새 문제 '+paper.generatedCount+'문항':'';
      status.innerHTML=paper.missing?'<span class="pm-short">'+count+'문항 중 '+paper.available+'문항 확보 · '+paper.missing+'문항 부족</span> · 확보된 문항은 인쇄할 수 있습니다.'+esc(sourceNote+note):'<span class="pm-ready">'+count+'문항 준비 완료</span> · '+esc(SCOPE_LABEL[scope])+' · '+esc(sourceLabel())+' · '+esc({balanced:'배점 균형형',easy:'쉬운 모의고사',normal:'보통 모의고사',hard:'어려운 모의고사'}[priority])+' · '+esc(BAND_LABEL[band]+(difficulty==='all'?'':' · 난이도 '+({low:'하',middle:'중',high:'상'}[difficulty]))+sourceNote+note);
      try{
        pages.innerHTML=renderPaper(paper,scope,band,student,currentTitle(),pageDensity);
        await Promise.all([document.fonts.ready].concat(Array.from(pages.querySelectorAll('img')).map(function(img){return img.decode();})));
        if(current!==revision)return;
        pages.querySelectorAll('.wm-layer').forEach(function(layer){root.BANK_CORE.buildWatermarkTiles(layer,student);});
        currentPaper=paper;currentAttempts=selectedAttempts;currentFilterFn=filter;currentPaperCount=paper.questions.length;print.disabled=false;
        currentKeys=paper.questions.map(function(q){return {key:itemKey(q.item),code:q.code};});
      }catch(error){pages.innerHTML='';status.innerHTML='<span class="pm-error">'+esc(error.message||'시험지를 만들지 못했습니다.')+'</span>';}
    }
    document.querySelectorAll('[data-scope]').forEach(function(button){button.addEventListener('click',function(){scope=button.dataset.scope;render();});});
    document.querySelectorAll('[data-priority]').forEach(function(button){button.addEventListener('click',function(){priority=button.dataset.priority;freshRound=0;render();});});
    [['source','pmSourceList'],['area','pmAreaList'],['subarea','pmSubareaList']].forEach(function(pair){document.getElementById(pair[1]).addEventListener('change',function(event){if(event.target&&event.target.matches('input[type="checkbox"]'))selectionChanged(pair[0],event.target.value,event.target.checked);});});
    document.querySelectorAll('[data-filter-all],[data-filter-clear]').forEach(function(button){button.addEventListener('click',function(){var kind=button.dataset.filterAll||button.dataset.filterClear,selected=button.dataset.filterAll!==undefined?null:new Set();if(kind==='source'){selectedSources=selected;freshRound=0;}else if(kind==='area')selectedAreas=selected;else selectedSubareas=selected;render();});});
    document.getElementById('pmDifficulty').addEventListener('change',function(event){difficulty=event.target.value;render();});
    document.getElementById('pmTypeList').addEventListener('change',function(event){var key=event.target&&event.target.dataset.typeKey;if(!key)return;if(event.target.checked)selectedTypes.add(key);else selectedTypes.delete(key);render();var next=Array.from(document.querySelectorAll('#pmTypeList input')).find(function(node){return node.dataset.typeKey===key;});if(next)next.focus();});
    document.getElementById('pmTypeList').addEventListener('click',function(event){var button=event.target.closest('button[data-preview-key]');if(!button)return;previewKey=button.dataset.previewKey;renderPreview();});
    document.getElementById('pmSelectVisible').addEventListener('click',function(){visibleTypes.forEach(function(group){selectedTypes.add(group.key);});render();});
    document.getElementById('pmClearTypes').addEventListener('click',function(){selectedTypes.clear();render();});
    document.querySelectorAll('[data-band]').forEach(function(button){button.addEventListener('click',function(){band=button.dataset.band;render();});});
    document.querySelectorAll('[data-count]').forEach(function(button){button.addEventListener('click',function(){count=Number(button.dataset.count);if(!titleEdited)titleInput.value=examTitle('',count);render();});});
    document.querySelectorAll('[data-page-density]').forEach(function(button){button.addEventListener('click',function(){pageDensity=Number(button.dataset.pageDensity);render();});});
    titleInput.addEventListener('input',function(){titleEdited=!!titleInput.value.trim();showTitle();});
    titleInput.addEventListener('blur',function(){if(!titleEdited)titleInput.value=examTitle('',count);});
    document.getElementById('pmFresh').addEventListener('click',function(){if(this.disabled)return;freshRound++;render();});
    pages.addEventListener('click',async function(event){
      var card=event.target&&event.target.closest&&event.target.closest('.pm-q');
      if(!card||!currentPaper||root.getSelection&&String(root.getSelection()).trim())return;
      var index=Number(card.dataset.questionIndex),next=replaceOne(currentPaper,index,currentAttempts,datasets,scope,band,skipSet(),currentFilterFn);
      if(!next){status.textContent=(index+1)+'번은 현재 조건에서 바꿀 다른 검수 문항이 없습니다.';return;}
      var current=++revision;print.disabled=true;currentPaper=next;
      try{pages.innerHTML=renderPaper(next,scope,band,student,currentTitle(),pageDensity);
        await Promise.all([document.fonts.ready].concat(Array.from(pages.querySelectorAll('img')).map(function(img){return img.decode();})));
        if(current!==revision)return;
        pages.querySelectorAll('.wm-layer').forEach(function(layer){root.BANK_CORE.buildWatermarkTiles(layer,student);});
        currentPaperCount=next.questions.length;currentKeys=next.questions.map(function(q){return {key:itemKey(q.item),code:q.code};});print.disabled=false;
        status.innerHTML='<span class="pm-ready">'+(index+1)+'번 문제 교체 완료</span> · '+next.questions.length+'문항 · '+esc(sourceLabel());
      }catch(error){pages.innerHTML='';status.innerHTML='<span class="pm-error">'+esc(error.message||'문항을 바꾸지 못했습니다.')+'</span>';}
    });
    var skipBtn=document.getElementById('pmSkipDone');
    if(skipBtn)skipBtn.addEventListener('click',function(){skipDone=!skipDone;render();});
    print.addEventListener('click',function(){if(!print.disabled&&currentPaperCount>0&&pages.querySelectorAll('.pm-q').length===currentPaperCount){root.print();saveHistory();}});
    try{
      attempts=approvedAttempts(await fetchAttempts(student),student,root.GFIELD_DATA);
      await loadHistory();
      await Promise.all(attempts.map(async function(attempt){
        var state=availability(attempt,student,root.GFIELD_DATA),code=state.code;
        if(state.reason!=='ready'){unavailable[state.reason].push(state.label);return;}
        try{datasets[code]=await loadDataset(code);}catch(error){unavailable.failed.push(state.label);}
      }));
      availableCodes=Array.from(new Set(attempts.map(codeOf).filter(function(code){return !!datasets[code];})));
      selectedSources=availableCodes.indexOf(query.get('source'))>=0?new Set([query.get('source')]):null;
      render();
    }catch(error){status.innerHTML='<span class="pm-error">'+esc(error.message||'응시 기록을 확인하지 못했습니다.')+'</span>';}
  }
  root.GFIELD_PERSONAL_MOCK={buildPool:buildPool,replaceOne:replaceOne,isAllowed:isAllowed,approvedAttempts:approvedAttempts,profileOf:profileOf,sourceItems:sourceItems,sourceRate:sourceRate,priorityOf:priorityOf,examTitle:examTitle,renderPaper:renderPaper,availability:availability,availabilityNote:availabilityNote};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GFIELD_PERSONAL_MOCK;
  if(typeof document!=='undefined')mount();
})(typeof window!=='undefined'?window:globalThis);
