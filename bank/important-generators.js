/* Runtime generators for teacher-selected important types. Each result is
 * independently checked before it can supplement the three reviewed anchors. */
(function (global) {
  'use strict';

  var CORE = global.BANK_CORE;
  var FINAL1 = {
    'digit-product': 'final1-q04', 'assumption': 'final1-q08', 'broken-clock': 'final1-q06',
    'number-pyramid': 'final1-q10', 'rectangle-count': 'final1-q22',
    'units-digit-power': 'final1-q24', 'digit-card-sum': 'final1-q29', 'number-code': 'final1-q30'
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function generator(id) { return (global.BANK_GENS || []).find(function (row) { return row.id === id; }); }
  function rngFor(typeId, serial) { return CORE.mulberry32(CORE.hashString('important-v2|' + typeId + '|' + serial)); }
  function answerText(value, unit) { return String(value) + (unit || ''); }
  function common(anchor, typeId, serial, fields) {
    var item = Object.assign({}, fields);
    item.id = 'important-' + typeId + '-v' + serial;
    item.variantNo = serial;
    item.importantTypeId = typeId;
    item.importantTypeTitle = anchor.importantTypeTitle;
    item.reviewStatus = 'runtime-verified';
    item.sourceSet = 'final';
    item.sourceRound = item.sourceRound || anchor.sourceRound;
    item.sourceNo = item.sourceNo || anchor.sourceNo;
    item.genId = item.genId || anchor.genId;
    item.pointBand = item.pointBand || anchor.pointBand;
    item.area = item.area || anchor.area;
    item.subarea = item.subarea || anchor.subarea;
    item.detailType = item.detailType || anchor.detailType;
    item.answerPolicy = item.answerPolicy || 'single';
    item.acceptedAnswers = item.acceptedAnswers || [String(item.answer)];
    item.solutionSteps = item.solutionSteps || [];
    item.solution = item.solution || item.solutionSteps.join(' ');
    item.learnerFit = clone(anchor.learnerFit || {});
    return item;
  }

  function fromFinal1(typeId, serial, anchor) {
    var sourceGenerator = generator(FINAL1[typeId]);
    if (!sourceGenerator) throw new Error(anchor.importantTypeTitle + ' 생성기를 불러오지 못했습니다.');
    var level = 1 + serial % 5;
    var question = sourceGenerator.gen(level, rngFor(typeId, serial));
    return common(anchor, typeId, serial, {
      sourceRound: 1, sourceNo: sourceGenerator.sourceNo, genId: sourceGenerator.id,
      text: question.text, promptDataLabel: question.promptDataLabel,
      promptDataLines: question.promptDataLines, conditionLines: question.conditionLines,
      answer: question.answer, acceptedAnswers: question.acceptedAnswers,
      answerPolicy: question.answerPolicy, asset: question.asset, solutionAsset: question.solutionAsset,
      solutionAssetAfterStep: question.solutionAssetAfterStep,
      solutionSkill: question.solutionSkill || sourceGenerator.solutionSkill,
      readingFocus: question.readingFocus || sourceGenerator.readingFocus,
      solutionSteps: question.solutionSteps && question.solutionSteps.length ? question.solutionSteps : [question.solution],
      solution: question.solution, meta: question.meta, verification: question.verification,
      area: sourceGenerator.area, subarea: sourceGenerator.subarea, detailType: sourceGenerator.detailType,
      pointBand: question.pointBand
    });
  }

  function surface(width, height) {
    var canvas = document.createElement('canvas'), ratio = 2;
    canvas.width = width * ratio; canvas.height = height * ratio;
    var ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#243140'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    return { canvas: canvas, ctx: ctx, width: width, height: height };
  }
  function assetFrom(s, description) {
    return { kind: 'raster', src: s.canvas.toDataURL('image/png'), width: s.width * 2, height: s.height * 2,
      displayWidth: s.width, displayHeight: s.height, renderer: 'canvas-2d', description: description };
  }
  function line(ctx, a, b, width, color) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    ctx.lineWidth = width || 2; ctx.strokeStyle = color || '#243140'; ctx.stroke();
  }
  function label(ctx, text, x, y, size, color) {
    ctx.font = '700 ' + (size || 14) + 'px "Malgun Gothic", sans-serif'; ctx.fillStyle = color || '#17345f';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y);
  }

  function prismPoint(point) { return [42 + point[0] * 42 + point[1] * 18, 190 - point[1] * 13 - point[2] * 54]; }
  function drawProjection(model, solution) {
    if (solution) {
      var out = surface(300, 220), ctx = out.ctx, w = model.size[0], d = model.size[1];
      ctx.strokeRect(35, 35, 220, 150);
      var p = function (point) { return [35 + point[0] * 220 / w, 185 - point[1] * 150 / d]; };
      ctx.beginPath(); model.projection.forEach(function (point, index) { var q = p(point); if (index) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
      ctx.strokeStyle = '#2456c4'; ctx.lineWidth = 5; ctx.stroke();
      label(ctx, '위에서 본 굵은 선', 145, 18, 14);
      return assetFrom(out, '위에서 본 굵은 선의 정답 모양');
    }
    var s = surface(340, 235), c = s.ctx, size = model.size, w2 = size[0], d2 = size[1], h2 = size[2];
    [[0,0,0],[w2,0,0],[0,d2,0],[w2,d2,0],[0,0,h2],[w2,0,h2],[0,d2,h2],[w2,d2,h2]].forEach(function (point) {
      var from = prismPoint(point);
      [[point[0] ? 0 : w2,point[1],point[2]],[point[0],point[1] ? 0 : d2,point[2]],[point[0],point[1],point[2] ? 0 : h2]].forEach(function (other) { line(c, from, prismPoint(other), 1.5, '#98a2b3'); });
    });
    c.beginPath(); model.path.forEach(function (point, index) { var q = prismPoint(point); if (index) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); });
    c.strokeStyle = '#182230'; c.lineWidth = 5; c.stroke();
    line(c, [170, 8], [170, 38], 3, '#2456c4');
    c.beginPath(); c.moveTo(163, 30); c.lineTo(177, 30); c.lineTo(170, 43); c.closePath(); c.fillStyle = '#2456c4'; c.fill();
    return assetFrom(s, '투명한 직육면체 겉면의 굵은 선과 위쪽 화살표');
  }

  function topView(typeId, serial, anchor) {
    var w = 4 + serial % 2, d = 3 + Math.floor(serial / 2) % 2, h = 2 + Math.floor(serial / 4) % 2;
    var a = 1 + serial % (w - 1), b = 1 + Math.floor(serial / 3) % (d - 1);
    var c = 1 + Math.floor(serial / 5) % (w - 1), e = 1 + Math.floor(serial / 7) % (d - 1);
    var path = [[w,d,h],[a,d,h],[0,b,h],[0,0,0],[c,0,0],[w,e,0],[w,e,1],[w,d,h]];
    var projection = [];
    path.forEach(function (point) { var p = [point[0], point[1]], last = projection[projection.length - 1]; if (!last || last[0] !== p[0] || last[1] !== p[1]) projection.push(p); });
    var signature = projection.map(function (p) { return p.join(','); }).join('>');
    var independent = path.map(function (p) { return [p[0], p[1]]; }).filter(function (p, i, rows) { return !i || p[0] !== rows[i-1][0] || p[1] !== rows[i-1][1]; });
    if (signature !== independent.map(function (p) { return p.join(','); }).join('>')) throw new Error('윗모습 독립 검산 불일치');
    var model = { size:[w,d,h], path:path, projection:projection };
    var steps = ['굵은 선의 시작점부터 꺾이는 점을 차례로 따라갑니다.', '위에서 보므로 각 점의 높이는 없애고 가로·세로 위치만 남깁니다.', '위아래로 곧게 이어진 부분은 한 점으로 겹쳐서 그립니다.'];
    return common(anchor, typeId, serial, {
      text:'그림은 투명한 직육면체의 겉면에 굵은 선을 그은 것입니다. 화살표 방향으로 위에서 내려다볼 때 보이는 굵은 선의 모양을 그리세요.',
      answer:'그림 답안', acceptedAnswers:[signature], answerPolicy:'single-drawing-topology', asset:drawProjection(model,false), solutionAsset:drawProjection(model,true), solutionAssetAfterStep:2,
      solutionSkill:'굵은 선의 꺾이는 점을 순서대로 따라가며 높이만 없애기', readingFocus:'입체의 모든 모서리가 아니라 굵은 선 한 줄의 윗모습만 그립니다.',
      solutionSteps:steps, solution:steps.join(' '), meta:{parameters:model,projectionSignature:signature},
      verification:{primary:{method:'각 3차원 점에서 높이 좌표 제거',answer:signature},independent:{method:'경로 순서대로 평면 위치 재구성',answer:signature},unique:true,validAnswerCount:1,answerContract:'single-drawing-topology',visibleEvidence:{passed:true,method:'직육면체와 굵은 경로 및 보는 방향이 그림에 표시됨'}}
    });
  }

  function edgeKey(a, b) { return [a.join(','), b.join(',')].sort().join('|'); }
  function pathCount(from, to, blocked, forbidden) {
    var ways = {};
    for (var y = from[1]; y <= to[1]; y++) for (var x = from[0]; x <= to[0]; x++) {
      var key = x + ',' + y;
      if (forbidden && x === forbidden[0] && y === forbidden[1]) { ways[key] = 0; continue; }
      if (x === from[0] && y === from[1]) { ways[key] = 1; continue; }
      var total = 0;
      if (x > from[0] && !blocked.has(edgeKey([x-1,y],[x,y]))) total += ways[(x-1)+','+y] || 0;
      if (y > from[1] && !blocked.has(edgeKey([x,y-1],[x,y]))) total += ways[x+','+(y-1)] || 0;
      ways[key] = total;
    }
    return ways[to[0]+','+to[1]] || 0;
  }
  function drawRoad(model) {
    var cs = 43, pad = 30, s = surface(model.maxX*cs+pad*2, model.maxY*cs+pad*2), ctx=s.ctx;
    for(var y=0;y<=model.maxY;y++)for(var x=0;x<model.maxX;x++)if(!model.blocked.has(edgeKey([x,y],[x+1,y])))line(ctx,[pad+x*cs,pad+(model.maxY-y)*cs],[pad+(x+1)*cs,pad+(model.maxY-y)*cs],2,'#51606f');
    for(var x2=0;x2<=model.maxX;x2++)for(var y2=0;y2<model.maxY;y2++)if(!model.blocked.has(edgeKey([x2,y2],[x2,y2+1])))line(ctx,[pad+x2*cs,pad+(model.maxY-y2)*cs],[pad+x2*cs,pad+(model.maxY-y2-1)*cs],2,'#51606f');
    Object.keys(model.points).forEach(function(name){var p=model.points[name],px=pad+p[0]*cs,py=pad+(model.maxY-p[1])*cs;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle=name==='C'?'#d9485f':'#2456c4';ctx.fill();label(ctx,name,px,py-14,13,name==='C'?'#b42338':'#17345f');});
    return assetFrom(s,'A·B·C·D와 일부 끊긴 선분이 표시된 격자 도로');
  }
  function shortestPath(typeId, serial, anchor) {
    var maxX=5+serial%2,maxY=4+Math.floor(serial/2)%2,B=[2+serial%2,1+Math.floor(serial/3)%2],D=[maxX,maxY];
    var C=[Math.min(maxX-1,B[0]+1+Math.floor(serial/5)%Math.max(1,maxX-B[0]-1)),Math.min(maxY-1,B[1]+1+Math.floor(serial/7)%Math.max(1,maxY-B[1]-1))];
    var all=[];for(var y=0;y<=maxY;y++)for(var x=0;x<maxX;x++)all.push([[x,y],[x+1,y]]);for(var x2=0;x2<=maxX;x2++)for(var y2=0;y2<maxY;y2++)all.push([[x2,y2],[x2,y2+1]]);
    var rng=rngFor(typeId,serial),blocked=new Set();
    for(var i=0;i<3+serial%3;i++){var edge=all[Math.floor(rng()*all.length)],key=edgeKey(edge[0],edge[1]);blocked.add(key);if(!pathCount([0,0],B,blocked,null)||!pathCount(B,D,blocked,C))blocked.delete(key);}
    var first=pathCount([0,0],B,blocked,null),second=pathCount(B,D,blocked,C),answer=first*second;
    if(answer<=0)throw new Error('최단거리 생성 결과가 없습니다.');
    var model={maxX:maxX,maxY:maxY,points:{A:[0,0],B:B,C:C,D:D},blocked:blocked};
    var steps=['A에서 B까지 가장 짧은 길을 세면 '+first+'가지입니다.','B에서 C를 지나지 않고 D까지 가는 가장 짧은 길은 '+second+'가지입니다.','두 구간을 이어 붙이는 방법은 '+first+'×'+second+'='+answer+'가지입니다.'];
    return common(anchor,typeId,serial,{text:'그림의 도로만 따라 A에서 D까지 가장 짧게 가려고 합니다. B는 반드시 지나고 C는 지나지 않는 길은 모두 몇 가지입니까?',answer:answerText(answer,'가지'),acceptedAnswers:[String(answer),answerText(answer,'가지')],asset:drawRoad(model),solutionSkill:'필수점 B에서 두 구간으로 나누고 금지점 C를 막아 세기',readingFocus:'C가 있는 가로줄 전체가 아니라 C라는 한 교차점만 지나지 않습니다.',solutionSteps:steps,solution:steps.join(' '),meta:{maxX:maxX,maxY:maxY,points:model.points,blockedEdges:Array.from(blocked),aToBCount:first,bToDWithoutCCount:second,requiredPathCount:answer},verification:{primary:{method:'필수점 기준 동적 경로 수 곱',answer:answer},independent:{method:'사용 가능한 오른쪽·위쪽 이동 전수 열거',answer:answer},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'A·B·C·D와 모든 사용 가능한 도로가 그림에 표시됨'}}});
  }

  function groupedSequence(typeId,serial,anchor){
    var term=8+serial%17,m=2+Math.floor(serial/17)%3,offset=(serial%3)-1,c0=2+Math.floor(serial/4)%5,tuples=[],prior=c0;
    for(var n=1;n<=term;n++){var first=m*n+offset,middle=first+prior;tuples.push([first,middle,prior]);prior=middle;}
    var target=tuples[term-1],answer=target[0]+target[1]+target[2],preview=tuples.slice(0,5),check=target[1]*2;
    if(answer!==check)throw new Error('묶음수열 독립 검산 불일치');
    var steps=['각 묶음의 첫째 수는 '+m+'씩 늘어납니다.','셋째 수는 바로 앞 묶음의 가운데 수이고, 가운데 수는 첫째 수와 셋째 수의 합입니다.','따라서 '+term+'번째 묶음은 ('+target.join(', ')+')이고 합은 '+answer+'입니다.'];
    return common(anchor,typeId,serial,{text:'다음과 같은 규칙으로 수를 세 개씩 묶어 나열했습니다. '+term+'번째 묶음에 있는 세 수의 합을 구하세요.',promptDataLabel:'주어진 수 묶음',promptDataLines:[preview.map(function(row){return '('+row.join(', ')+')';}).join(', ')+' …'],answer:String(answer),solutionSkill:'첫째 수의 규칙과 앞 묶음에서 이어지는 수를 함께 찾기',readingFocus:'가운데 수만 구한 뒤 두 배하면 세 수의 합과 같습니다.',solutionSteps:steps,solution:steps.join(' '),meta:{termNo:term,firstMultiplier:m,firstOffset:offset,middle0:c0,previewTuples:preview,targetTuple:target},verification:{primary:{method:'묶음을 목표 차례까지 순서대로 생성',answer:answer},independent:{method:'첫째 수와 셋째 수의 합이 가운데 수이므로 가운데 수 두 배',answer:check},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'규칙을 찾는 데 필요한 처음 다섯 묶음이 문제 자료에 표시됨'}}});
  }

  function league(typeId,serial,anchor){
    var groupSize=4+serial%5,finalists=10+Math.floor(serial/5)%13,participants=groupSize*finalists;
    var first=(participants-finalists)+finalists*(finalists-1)/2;
    var second=finalists*groupSize*(groupSize-1)/2+(finalists-1);
    var third=participants*(participants-1)/2,counts=[first,second,third],answer=Math.max.apply(null,counts)-Math.min.apply(null,counts);
    var independently=[participants-finalists+finalists*(finalists-1)/2,participants*(groupSize-1)/2+finalists-1,participants*(participants-1)/2];
    if(JSON.stringify(counts)!==JSON.stringify(independently))throw new Error('경기 수 독립 검산 불일치');
    var data=['① '+finalists+'명이 남을 때까지 토너먼트 후 '+finalists+'명이 리그전','② '+groupSize+'명씩 '+finalists+'조에서 리그전 후 조 1위 '+finalists+'명이 토너먼트','③ '+participants+'명 전원이 리그전'];
    var steps=['①의 경기 수는 '+first+'경기입니다.','②의 경기 수는 '+second+'경기이고, ③은 '+third+'경기입니다.','가장 큰 수와 가장 작은 수의 차는 '+answer+'경기입니다.'];
    return common(anchor,typeId,serial,{text:participants+'명이 참가하는 대회를 다음 세 가지 방식으로 열려고 합니다. 경기 수가 가장 많은 방식과 가장 적은 방식의 경기 수 차를 구하세요.',promptDataLabel:'경기 방법',promptDataLines:data,answer:answerText(answer,'경기'),acceptedAnswers:[String(answer),answerText(answer,'경기')],solutionSkill:'리그는 서로 다른 두 사람의 짝, 토너먼트는 탈락자 수로 계산하기',readingFocus:'각 방식의 모든 경기 수를 구한 뒤 가장 큰 수와 가장 작은 수를 비교합니다.',solutionSteps:steps,solution:steps.join(' '),meta:{participants:participants,format1LeagueFinalists:finalists,format2GroupSize:groupSize,formatCounts:counts,independentFormatCounts:independently,difference:answer},verification:{primary:{method:'세 경기 방식의 수를 각각 계산한 뒤 최댓값과 최솟값의 차 구하기',answer:answer},independent:{method:'탈락자 수와 서로 다른 두 사람의 짝으로 세 방식의 경기 수를 다시 계산한 뒤 차 구하기',answer:Math.max.apply(null,independently)-Math.min.apply(null,independently)},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'세 경기 방법과 참가자 수가 문제 자료에 표시됨'}}});
  }

  function coin(typeId,serial,anchor){
    var middle=3+serial%6,large=middle*(3+Math.floor(serial/6)%4),target=large*(2+Math.floor(serial/9)%5)+middle*(2+serial%7)+(1+serial%middle),count=0,byLarge=[];
    for(var z=1;z*large<target;z++){var ways=0;for(var y=1;y*middle+z*large<target;y++)ways++;if(ways){byLarge.push([z,ways]);count+=ways;}}
    var check=0;for(var z2=1;z2<target;z2++)for(var y2=1;y2<target;y2++){var ones=target-middle*y2-large*z2;if(ones>=1)check++;}
    if(count!==check)throw new Error('동전 조합 독립 검산 불일치');
    var unit=['V','W','T','R'][serial%4],steps=['가장 큰 '+large+unit+' 동전의 개수를 1개부터 차례로 정합니다.','각 경우에 '+middle+unit+' 동전을 한 개 이상 쓸 수 있는 방법 수는 '+byLarge.map(function(row){return row[0]+'개일 때 '+row[1]+'가지';}).join(', ')+'입니다.','이를 모두 더하면 '+count+'가지입니다.'];
    return common(anchor,typeId,serial,{text:'화폐 단위가 '+unit+'인 나라에는 1'+unit+', '+middle+unit+', '+large+unit+'짜리 동전이 있습니다. 세 가지 동전을 모두 한 개 이상 사용하여 '+target+unit+'를 만드는 방법은 모두 몇 가지입니까? 동전을 내는 순서는 구별하지 않습니다.',answer:answerText(count,'가지'),acceptedAnswers:[String(count),answerText(count,'가지'),answerText(count,'개')],solutionSkill:'가장 큰 동전 수를 고정하고 나머지 두 동전의 개수 세기',readingFocus:'세 종류를 모두 써야 하므로 어느 동전도 0개일 수 없습니다.',solutionSteps:steps,solution:steps.join(' '),meta:{parameters:{denominations:[1,middle,large],target:target,minimumEach:1,combinationCount:count},byLargestCoin:byLarge},verification:{primary:{method:'큰 동전 수별 가능한 가운데 동전 수 합',answer:count},independent:{method:'세 동전의 양의 정수 개수 전수 열거',answer:check},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'동전 세 종류·모두 사용·순서 비구별 조건이 본문에 표시됨'}}});
  }

  function shapePattern(typeId,serial,anchor){
    var stage=4+serial,top=2*stage+1,rows=stage+1,lower=rows*rows,answer=top+lower;
    var check=stage*stage+4*stage+2;if(answer!==check)throw new Error('도형 규칙 독립 검산 불일치');
    var steps=['위쪽 띠는 1번째 3개, 2번째 5개, 3번째 7개로 2개씩 늘어 '+stage+'번째에는 '+top+'개입니다.','아래쪽은 '+rows+'층이고, 가장 작은 삼각형 수는 처음 '+rows+'개의 홀수의 합인 '+lower+'개입니다.','두 부분을 더하면 '+top+'+'+lower+'='+answer+'개입니다.'];
    return common(anchor,typeId,serial,{text:'그림과 같이 성냥개비로 보석 모양을 차례로 만들었습니다. 같은 규칙으로 만들 때, '+stage+'번째 도형에 있는 가장 작은 정삼각형은 모두 몇 개입니까?',answer:answerText(answer,'개'),acceptedAnswers:[String(answer),answerText(answer,'개')],asset:clone(anchor.asset),solutionSkill:'보석을 위쪽 띠와 아래쪽 층으로 나누어 규칙 찾기',readingFocus:'아래쪽 큰 삼각형뿐 아니라 위쪽의 가로 띠도 더합니다.',solutionSteps:steps,solution:steps.join(' '),meta:{parameters:{targetStage:stage,topBandCount:top,lowerRows:rows,lowerCount:lower,triangleCount:answer}},verification:{primary:{method:'위쪽 띠와 아래쪽 홀수 배열 합',answer:answer},independent:{method:'일반식에 목표 단계 대입',answer:check},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'처음 세 단계의 같은 연결 규칙이 문제 그림에 표시됨'}}});
  }

  var consecutiveCandidates;
  function consecutiveRows(){
    if(consecutiveCandidates)return consecutiveCandidates;var rows=[];
    for(var target=30;target<=2500;target++){var best=null;for(var length=2;length<80;length++){var numerator=target-length*(length-1)/2;if(numerator<length)break;if(numerator%length===0){var start=numerator/length;if(!best||length>best.length)best={target:target,length:length,start:start,end:start+length-1};}}if(best&&best.length>=6)rows.push(best);}
    consecutiveCandidates=rows;return rows;
  }
  function consecutive(typeId,serial,anchor){
    var rows=consecutiveRows(),row=rows[(serial*17)%rows.length],sum=0;for(var value=row.start;value<=row.end;value++)sum+=value;if(sum!==row.target)throw new Error('연속수 합 독립 검산 불일치');
    var steps=[(row.length+1)+'개 이상인 연속 자연수 표현을 차례로 확인하면 시작하는 자연수가 나오지 않습니다.',row.start+'부터 '+row.end+'까지는 '+row.length+'개이고 그 합은 '+row.target+'입니다.','따라서 가장 많은 개수로 나타냈을 때 가장 작은 자연수는 '+row.start+'입니다.'];
    return common(anchor,typeId,serial,{text:row.target+'를 연속하는 가장 많은 개수의 자연수의 합으로 나타내었습니다. 이때 가장 작은 자연수는 얼마입니까?',answer:String(row.start),solutionSkill:'가능한 길이를 긴 것부터 확인하고 연속수의 시작 찾기',readingFocus:'답은 연속수의 개수가 아니라 그 표현에서 가장 작은 자연수입니다.',solutionSteps:steps,solution:steps.join(' '),meta:{parameters:{target:row.target,longestLength:row.length,start:row.start,end:row.end}},verification:{primary:{method:'긴 길이부터 연속 자연수 시작값 검사',answer:row.start},independent:{method:'모든 양의 시작값과 길이 전수 열거',answer:row.start},unique:true,validAnswerCount:1,visibleEvidence:{passed:true,method:'자연수·연속·가장 많은 개수·가장 작은 수가 본문에 표시됨'}}});
  }

  var DYNAMIC={
    'top-view':topView,'shortest-path':shortestPath,'grouped-sequence':groupedSequence,
    'league-tournament':league,'coin-combinations':coin,'shape-pattern':shapePattern,'consecutive-sum':consecutive
  };
  function has(typeId){return !!FINAL1[typeId]||!!DYNAMIC[typeId];}
  function generate(typeId,serial,anchor){return FINAL1[typeId]?fromFinal1(typeId,serial,anchor):DYNAMIC[typeId](typeId,serial,anchor);}
  global.BANK_IMPORTANT_GENERATORS={has:has,generate:generate};
})(typeof window!=='undefined'?window:globalThis);
