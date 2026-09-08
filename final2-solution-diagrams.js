(function(root){
  'use strict';

  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function(key){deepFreeze(value[key]);});
    return Object.freeze(value);
  }

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  /*
   * The source drawing fixes the path topology and viewing direction, but does
   * not mark the three interior positions as exact midpoints.  The numeric
   * values below therefore exist only to draw a readable representative SVG.
   */
  var MODEL=deepFreeze({
    q2:{
      no:2,
      id:'final2-q2-alternating-square-chain-v1',
      sourceLocator:'materials/final_2/001.jpg#q2',
      answerKind:'count-alternating-square-chain',
      cells:[
        [1,0,0],[2,1,0],[3,1,1],[4,2,1],[5,2,2],
        [6,3,2],[7,3,3],[8,4,3],[9,4,4],[10,5,4],
        [11,5,5],[12,6,5],[13,6,6],[14,7,6],[15,7,7],
        [16,8,7],[17,8,8],[18,9,8],[19,9,9],[20,10,9]
      ],
      sharedSidePairs:[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20]],
      largePairsFirstSlope:[[1,2],[3,4],[5,6],[7,8],[9,10],[11,12],[13,14],[15,16],[17,18],[19,20]],
      largePairsSecondSlope:[[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19]],
      frame:{left:28,top:56,step:22},
      labels:{
        caption:'작은 사각형 20개와 이웃한 두 칸 10+9개',
        aria:'번갈아 꺾여 이어진 작은 정사각형 20개. 맞닿은 두 칸은 파란 실선 10곳과 초록 점선 9곳으로 구분되어 모두 19개이다.',
        first:'첫 묶음 10곳',
        second:'둘째 묶음 9곳'
      }
    },
    q5:{
      no:5,
      id:'final2-q5-point-contact-coloring-v1',
      sourceLocator:'materials/final_2/001.jpg#q5',
      answerKind:'point-contact-map-coloring',
      countries:['가','나','라','바','마','다'],
      positiveLengthBoundaryPairs:[
        ['가','나'],['가','라'],['가','마'],['가','다'],['나','라'],
        ['나','바'],['라','바'],['라','마'],['바','마'],['마','다']
      ],
      pointOnlyPairs:[['가','바']],
      centralJunction:{
        point:[100,75],
        localFrame:{left:18,top:18,right:182,bottom:132},
        countriesClockwise:['가','마','바','라'],
        sectors:[
          {country:'라',quadrant:'upper-left',labelPoint:[62,43],colorId:2},
          {country:'가',quadrant:'upper-right',labelPoint:[138,43],colorId:1},
          {country:'마',quadrant:'lower-right',labelPoint:[138,107],colorId:3},
          {country:'바',quadrant:'lower-left',labelPoint:[62,107],colorId:4}
        ],
        localBoundaryRays:[
          [[100,75],[100,18]],[[100,75],[182,75]],
          [[100,75],[100,132]],[[100,75],[18,75]]
        ],
        pointOnlyPairToEmphasize:['가','바'],
        doNotDrawBoundarySegmentBetween:['가','바']
      },
      coloringClasses:[
        {colorId:1,countries:['가']},
        {colorId:2,countries:['라','다']},
        {colorId:3,countries:['나','마']},
        {colorId:4,countries:['바']}
      ],
      palette:{
        1:{fill:'#EAF0FF',stroke:'#2456C4'},
        2:{fill:'#FFF3D6',stroke:'#8A5A00'},
        3:{fill:'#E7F5EE',stroke:'#16734B'},
        4:{fill:'#F3EAFE',stroke:'#6E3CBC'}
      },
      labels:{
        caption:'중앙의 한 점에서 만나는 네 나라와 네 가지 색 배정',
        aria:'원래 지도의 중앙점을 확대한 그림. 위 왼쪽 라는 둘째 색, 위 오른쪽 가는 첫째 색, 아래 오른쪽 마는 셋째 색, 아래 왼쪽 바는 넷째 색이며 네 나라가 가운데 한 점에서 함께 만난다.',
        local:'원래 중앙점 확대',
        contract:'한 점에서 닿는 경우도 만남에 포함',
        point:'중앙의 한 점',
        assignment:'네 색으로 칠하는 한 가지 방법'
      }
    },
    q9:{
      no:9,
      id:'final2-q9-five-edge-cuboid-paths-v1',
      sourceLocator:'materials/final_2/002.jpg#q9',
      answerKind:'simple-cuboid-paths',
      vertices:{K:[0,0,0],N:[1,0,0],U0:[0,1,0],U1:[1,1,0],D0:[0,0,1],D1:[1,0,1],F0:[0,1,1],F1:[1,1,1]},
      edges:[['K','N'],['K','U0'],['K','D0'],['N','U1'],['N','D1'],['U0','U1'],['U0','F0'],['U1','F1'],['D0','D1'],['D0','F0'],['D1','F1'],['F0','F1']],
      start:'K',
      end:'N',
      edgeCount:5,
      revisitAllowed:false,
      pathOrder:[
        ['K','U0','U1','F1','D1','N'],
        ['K','U0','F0','F1','D1','N'],
        ['K','U0','F0','F1','U1','N'],
        ['K','U0','F0','D0','D1','N'],
        ['K','D0','D1','F1','U1','N'],
        ['K','D0','F0','F1','D1','N'],
        ['K','D0','F0','F1','U1','N'],
        ['K','D0','F0','U0','U1','N']
      ],
      labels:{
        caption:'꼭짓점 이름과 다섯 모서리를 지나는 길 8가지',
        aria:'K는 문제의 기역, N은 문제의 니은이다. 꼭짓점 이름이 표시된 기준 직육면체와, K에서 N까지 서로 다른 꼭짓점 여섯 개를 잇는 여덟 경로.',
        reference:'꼭짓점 이름 기준',
        firstGroup:'U0에서 시작하는 4가지',
        secondGroup:'D0에서 시작하는 4가지'
      }
    },
    q13:{
      no:13,
      id:'final2-q13-road-network-v1',
      sourceLocator:'materials/final_2/003.jpg#q13',
      answerKind:'shortest-road-paths',
      axes:{
        x:[{id:'X0',value:0},{id:'X1',value:2},{id:'X1b',value:3},{id:'X2',value:5},{id:'X3',value:8},{id:'X4',value:10},{id:'X5',value:13}],
        y:[{id:'Y0',value:0},{id:'Y1',value:2},{id:'Y2',value:4},{id:'Y3',value:7},{id:'Y4',value:8},{id:'Y5',value:10},{id:'Y6',value:12},{id:'Y7',value:14}]
      },
      horizontalSegments:[
        {y:'Y0',from:'X0',to:'X5'},{y:'Y1',from:'X1',to:'X5'},
        {y:'Y2',from:'X0',to:'X3'},{y:'Y3',from:'X3',to:'X5'},
        {y:'Y4',from:'X0',to:'X1'},{y:'Y5',from:'X1',to:'X4'},
        {y:'Y6',from:'X4',to:'X5'},{y:'Y7',from:'X0',to:'X5'}
      ],
      verticalSegments:[
        {x:'X0',from:'Y0',to:'Y7'},{x:'X1',from:'Y0',to:'Y7'},
        {x:'X1b',from:'Y0',to:'Y1'},{x:'X2',from:'Y1',to:'Y7'},
        {x:'X3',from:'Y1',to:'Y7'},{x:'X4',from:'Y0',to:'Y7'},
        {x:'X5',from:'Y0',to:'Y7'}
      ],
      points:{A:{x:'X0',y:'Y0'},B:{x:'X2',y:'Y2'},C:{x:'X3',y:'Y5'},D:{x:'X5',y:'Y7'}},
      frame:{left:27,top:24,width:306,height:190},
      labels:{
        caption:'B를 지나고 C를 피하는 가장 짧은 길: 4×4=16가지',
        aria:'원래 도로망의 여덟 가로 높이와 일곱 세로줄. 첫 그림은 A에서 B까지 교차점마다 길 수를 더해 4가 되고, 둘째 그림은 C를 지나지 않고 B에서 D까지 더해 4가 된다.',
        first:'① A에서 B까지',
        second:'② B에서 D까지 · C는 지나지 않기',
        direction:'오른쪽 또는 위쪽으로만 이동',
        count:'교차점의 숫자 = 그 점까지 오는 길 수'
      }
    },
    q16:{
      no:16,
      id:'final2-q16-l-tromino-orbits-v1',
      sourceLocator:'materials/final_2/003.jpg#q16',
      answerKind:'polyomino-tiling-orbits',
      board:{rows:3,cols:3},
      pieces:[{kind:'L-tromino',count:2,cells:3},{kind:'monomino',count:3,cells:1}],
      equivalence:['rotate-0','rotate-90','rotate-180','rotate-270','reflect-and-four-rotations'],
      representatives:[
        {A:[[1,1],[1,2],[2,1]],B:[[2,2],[2,3],[3,2]]},
        {A:[[1,1],[1,2],[2,1]],B:[[1,3],[2,2],[2,3]]},
        {A:[[1,1],[1,2],[2,1]],B:[[2,2],[2,3],[3,3]]},
        {A:[[1,1],[1,2],[2,1]],B:[[2,3],[3,2],[3,3]]}
      ],
      labels:{
        caption:'돌리거나 뒤집어도 같아지지 않는 네 대표 배치',
        aria:'세 칸짜리 L자 조각 A와 B, 한 칸 조각 세 개로 채운 3 곱하기 3 정사각형의 서로 다른 대표 배치 네 가지.',
        rule:'돌리기·뒤집기로 같은 모양은 1가지',
        pieceA:'A · 세 칸 L자',
        pieceB:'B · 세 칸 L자',
        single:'점 · 한 칸 조각'
      }
    },
    q12:{
      no:12,
      reviewId:'final2-detailed-review-20260909',
      sourceLocator:'materials/final_2/002.jpg#q12',
      answerKind:'drawing',
      projection:'drop-z',
      axes:{x:'left-right',y:'front-back',z:'height'},
      answerOrientation:{back:'top',front:'bottom'},
      parameters:{
        t:0.54,
        a:0.50,
        b:0.48,
        role:'diagram-only-representative',
        exactMidpointClaim:false
      },
      spatialPath:[
        {x:1,y:1,z:1,role:'back-right-upper'},
        {x:0,y:'t',z:1,role:'left-edge-upper'},
        {x:0,y:0,z:1,role:'front-left-upper'},
        {x:'a',y:0,z:0,role:'front-edge-lower'},
        {x:'a',y:'b',z:0,role:'interior-lower'},
        {x:1,y:'b',z:0,role:'right-edge-lower'},
        {x:1,y:1,z:0,role:'back-right-lower'}
      ],
      frame:{left:40,top:42,size:240},
      labels:{
        back:'뒤쪽',
        front:'앞쪽',
        caption:'위에서 본 굵은 선의 연결 모양',
        aria:'높이를 없애 위에서 본 굵은 선의 연결 모양'
      }
    },
    q28:{
      no:28,
      id:'q28-weighted-road-graph-v1',
      sourceLocator:'materials/final_2/005.jpg#q28',
      answerKind:'weighted-road-graph',
      nodes:[
        {id:'A',x:50,y:4},{id:'B',x:8,y:31},{id:'G',x:50,y:31},{id:'F',x:92,y:31},
        {id:'C',x:8,y:72},{id:'H',x:30,y:60},{id:'I',x:70,y:60},{id:'E',x:92,y:72},{id:'D',x:50,y:96}
      ],
      edges:[
        {id:'AB',from:'A',to:'B',weight:13},{id:'AF',from:'A',to:'F',weight:13},
        {id:'BC',from:'B',to:'C',weight:13},{id:'CD',from:'C',to:'D',weight:13},
        {id:'DE',from:'D',to:'E',weight:13},{id:'EF',from:'E',to:'F',weight:13},
        {id:'AG',from:'A',to:'G',weight:5},{id:'CH',from:'C',to:'H',weight:5},
        {id:'EI',from:'E',to:'I',weight:5},{id:'BG',from:'B',to:'G',weight:12},
        {id:'GF',from:'G',to:'F',weight:12},{id:'BH',from:'B',to:'H',weight:12},
        {id:'GH',from:'G',to:'H',weight:12},{id:'GI',from:'G',to:'I',weight:12},
        {id:'FI',from:'F',to:'I',weight:12},{id:'HI',from:'H',to:'I',weight:12},
        {id:'HD',from:'H',to:'D',weight:12},{id:'ID',from:'I',to:'D',weight:12}
      ],
      oddVertices:['A','C','E','G','H','I'],
      duplicateEdgeIds:['AG','CH','EI'],
      route:['A','B','C','D','E','F','A','G','B','H','C','H','G','F','I','E','I','H','D','I','G','A'],
      labels:{
        caption:'모든 도로와 한 번 더 지나는 가장 짧은 세 도로',
        aria:'아홉 마을의 도로망. AG, CH, EI 도로를 한 번씩 더 지나도록 파란색으로 표시했다.',
        duplicate:'한 번 더 지나는 길'
      }
    }
  });

  function resolve(value,parameters){
    return typeof value==='number'?value:parameters[value];
  }

  function resolvePoint(point,parameters){
    return {
      x:resolve(point.x,parameters),
      y:resolve(point.y,parameters),
      z:resolve(point.z,parameters),
      role:point.role
    };
  }

  // Looking from above removes only height; left/right and front/back remain.
  function projectTop(point){
    return {x:Number(point.x),y:Number(point.y),role:point.role};
  }

  function screenPoint(point,frame){
    return {
      x:frame.left+point.x*frame.size,
      y:frame.top+(1-point.y)*frame.size,
      role:point.role
    };
  }

  function number(value){
    return Number(value.toFixed(2)).toString();
  }

  function pairKey(a,b){
    return [String(a),String(b)].sort().join('|');
  }

  function squareScreenPoint(x,y,frame){
    return {x:frame.left+(x+y)*frame.step,y:frame.top+(x-y)*frame.step};
  }

  function squareSharedEdge(first,second,frame){
    var x1=first[1],y1=first[2],x2=second[1],y2=second[2],raw;
    if(Math.abs(x1-x2)===1&&y1===y2){
      var verticalX=Math.max(x1,x2);
      raw=[[verticalX,y1],[verticalX,y1+1]];
    }else if(Math.abs(y1-y2)===1&&x1===x2){
      var horizontalY=Math.max(y1,y2);
      raw=[[x1,horizontalY],[x1+1,horizontalY]];
    }else{
      return null;
    }
    return raw.map(function(point){return squareScreenPoint(point[0],point[1],frame);});
  }

  function calculateSquareChain(){
    var model=MODEL.q2,byId={},positionKeys={},valid=true;
    var polygons=model.cells.map(function(cell){
      byId[cell[0]]=cell;
      var position=cell[1]+','+cell[2];
      if(positionKeys[position]) valid=false;
      positionKeys[position]=true;
      var points=[[cell[1],cell[2]],[cell[1]+1,cell[2]],[cell[1]+1,cell[2]+1],[cell[1],cell[2]+1]].map(function(point){
        return squareScreenPoint(point[0],point[1],model.frame);
      });
      return {id:cell[0],points:points,pointsText:points.map(function(point){return number(point.x)+','+number(point.y);}).join(' ')};
    });
    var first={};
    var second={};
    model.largePairsFirstSlope.forEach(function(pair){first[pairKey(pair[0],pair[1])]=true;});
    model.largePairsSecondSlope.forEach(function(pair){second[pairKey(pair[0],pair[1])]=true;});
    var sharedEdges=model.sharedSidePairs.map(function(pair){
      var key=pairKey(pair[0],pair[1]);
      var points=squareSharedEdge(byId[pair[0]],byId[pair[1]],model.frame);
      if(!points||(first[key]&&second[key])||(!first[key]&&!second[key])) valid=false;
      return {pair:pair.slice(),group:first[key]?'first':'second',points:points};
    });
    var approvedPairs=model.largePairsFirstSlope.concat(model.largePairsSecondSlope).map(function(pair){return pairKey(pair[0],pair[1]);}).sort();
    var sharedPairs=model.sharedSidePairs.map(function(pair){return pairKey(pair[0],pair[1]);}).sort();
    if(JSON.stringify(approvedPairs)!==JSON.stringify(sharedPairs)) valid=false;
    if(model.cells.length!==20||Object.keys(byId).length!==20||model.sharedSidePairs.length!==19||model.largePairsFirstSlope.length!==10||model.largePairsSecondSlope.length!==9) valid=false;
    return {
      valid:valid,
      polygons:polygons,
      sharedEdges:sharedEdges,
      smallCount:model.cells.length,
      firstPairCount:model.largePairsFirstSlope.length,
      secondPairCount:model.largePairsSecondSlope.length,
      largeCount:model.sharedSidePairs.length,
      total:model.cells.length+model.sharedSidePairs.length
    };
  }

  function minimumColorCount(countries,pairs){
    var adjacency={};
    countries.forEach(function(country){adjacency[country]={};});
    pairs.forEach(function(pair){
      adjacency[pair[0]][pair[1]]=true;
      adjacency[pair[1]][pair[0]]=true;
    });
    var order=countries.slice().sort(function(a,b){return Object.keys(adjacency[b]).length-Object.keys(adjacency[a]).length;});
    function possible(colorCount){
      var assigned={};
      function search(index){
        if(index===order.length) return true;
        var country=order[index];
        for(var color=1;color<=colorCount;color++){
          var allowed=Object.keys(adjacency[country]).every(function(other){return assigned[other]!==color;});
          if(!allowed) continue;
          assigned[country]=color;
          if(search(index+1)) return true;
          delete assigned[country];
        }
        return false;
      }
      return search(0);
    }
    for(var count=1;count<=countries.length;count++) if(possible(count)) return count;
    return countries.length;
  }

  function calculateCountryColoring(){
    var model=MODEL.q5;
    var allPairs=model.positiveLengthBoundaryPairs.concat(model.pointOnlyPairs);
    var pairMap={},valid=true;
    allPairs.forEach(function(pair){
      var key=pairKey(pair[0],pair[1]);
      if(pairMap[key]) valid=false;
      pairMap[key]=true;
    });
    var assignment={};
    model.coloringClasses.forEach(function(group){
      group.countries.forEach(function(country){
        if(assignment[country]) valid=false;
        assignment[country]=group.colorId;
      });
    });
    if(Object.keys(assignment).length!==model.countries.length) valid=false;
    allPairs.forEach(function(pair){if(assignment[pair[0]]===assignment[pair[1]]) valid=false;});
    var central=['가','라','마','바'],centralPairs=0;
    for(var first=0;first<central.length;first++) for(var second=first+1;second<central.length;second++){
      if(pairMap[pairKey(central[first],central[second])]) centralPairs++;
    }
    var pointKey=pairKey(model.centralJunction.pointOnlyPairToEmphasize[0],model.centralJunction.pointOnlyPairToEmphasize[1]);
    var boundaryKeys={};
    model.positiveLengthBoundaryPairs.forEach(function(pair){boundaryKeys[pairKey(pair[0],pair[1])]=true;});
    var chromaticNumber=minimumColorCount(model.countries,allPairs);
    valid=valid&&allPairs.length===11&&centralPairs===6&&chromaticNumber===4&&!boundaryKeys[pointKey];
    valid=valid&&model.centralJunction.countriesClockwise.join('|')==='가|마|바|라';
    return {
      valid:valid,
      chromaticNumber:chromaticNumber,
      contactPairCount:allPairs.length,
      centralPairCount:centralPairs,
      assignment:assignment,
      pointOnlyPair:model.pointOnlyPairs[0].slice()
    };
  }

  function calculateCuboidPaths(){
    var model=MODEL.q9,ids=Object.keys(model.vertices),adjacency={},valid=true;
    ids.forEach(function(id){adjacency[id]=[];});
    model.edges.forEach(function(edge){
      if(!adjacency[edge[0]]||!adjacency[edge[1]]){valid=false;return;}
      adjacency[edge[0]].push(edge[1]);
      adjacency[edge[1]].push(edge[0]);
    });
    var paths=[];
    function walk(node,path){
      if(path.length-1===model.edgeCount){
        if(node===model.end) paths.push(path.slice());
        return;
      }
      adjacency[node].forEach(function(next){
        if(model.revisitAllowed||path.indexOf(next)<0) walk(next,path.concat(next));
      });
    }
    walk(model.start,[model.start]);
    var order={};
    model.pathOrder.forEach(function(path,index){order[path.join('|')]=index;});
    paths.sort(function(a,b){return order[a.join('|')]-order[b.join('|')];});
    var found=paths.map(function(path){return path.join('|');}).sort();
    var approved=model.pathOrder.map(function(path){return path.join('|');}).sort();
    if(JSON.stringify(found)!==JSON.stringify(approved)) valid=false;
    if(ids.length!==8||model.edges.length!==12||paths.length!==8) valid=false;
    var screenVertices={};
    ids.forEach(function(id){screenVertices[id]=cuboidScreenPoint(model.vertices[id]);});
    return {
      valid:valid,
      adjacency:adjacency,
      paths:paths,
      firstStepCounts:{U0:paths.filter(function(path){return path[1]==='U0';}).length,D0:paths.filter(function(path){return path[1]==='D0';}).length},
      screenVertices:screenVertices
    };
  }

  function roadAxisMap(axes){
    var map={};
    axes.forEach(function(axis){map[axis.id]=axis.value;});
    return map;
  }

  function roadPointKey(x,y){
    return number(x)+','+number(y);
  }

  function buildRoadGraph(){
    var model=MODEL.q13,x=roadAxisMap(model.axes.x),y=roadAxisMap(model.axes.y),pointMap={},edgeMap={};
    function addPoint(px,py){
      var key=roadPointKey(px,py);
      if(!pointMap[key]) pointMap[key]={key:key,x:px,y:py};
    }
    var horizontal=model.horizontalSegments.map(function(segment){return {y:y[segment.y],from:x[segment.from],to:x[segment.to],source:segment};});
    var vertical=model.verticalSegments.map(function(segment){return {x:x[segment.x],from:y[segment.from],to:y[segment.to],source:segment};});
    horizontal.forEach(function(segment){
      addPoint(segment.from,segment.y);
      addPoint(segment.to,segment.y);
      vertical.forEach(function(cross){
        if(cross.x>=segment.from&&cross.x<=segment.to&&segment.y>=cross.from&&segment.y<=cross.to) addPoint(cross.x,segment.y);
      });
    });
    vertical.forEach(function(segment){addPoint(segment.x,segment.from);addPoint(segment.x,segment.to);});
    var points=Object.keys(pointMap).map(function(key){return pointMap[key];});
    function addEdge(first,second,axis){
      var key=pairKey(first.key,second.key);
      if(edgeMap[key]) return;
      edgeMap[key]={id:key,from:first.key,to:second.key,axis:axis,length:Math.abs(first.x-second.x)+Math.abs(first.y-second.y)};
    }
    horizontal.forEach(function(segment){
      var onSegment=points.filter(function(point){return point.y===segment.y&&point.x>=segment.from&&point.x<=segment.to;}).sort(function(a,b){return a.x-b.x;});
      for(var index=1;index<onSegment.length;index++) addEdge(onSegment[index-1],onSegment[index],'horizontal');
    });
    vertical.forEach(function(segment){
      var onSegment=points.filter(function(point){return point.x===segment.x&&point.y>=segment.from&&point.y<=segment.to;}).sort(function(a,b){return a.y-b.y;});
      for(var index=1;index<onSegment.length;index++) addEdge(onSegment[index-1],onSegment[index],'vertical');
    });
    var edges=Object.keys(edgeMap).map(function(key){return edgeMap[key];});
    var adjacency={};
    points.forEach(function(point){adjacency[point.key]=[];});
    edges.forEach(function(edge){
      adjacency[edge.from].push(edge.to);
      adjacency[edge.to].push(edge.from);
    });
    var named={};
    Object.keys(model.points).forEach(function(label){
      var point=model.points[label];
      named[label]=roadPointKey(x[point.x],y[point.y]);
      pointMap[named[label]].label=label;
    });
    return {x:x,y:y,points:points,pointMap:pointMap,edges:edges,adjacency:adjacency,named:named,horizontal:horizontal,vertical:vertical};
  }

  function calculateRoadLeg(graph,startLabel,endLabel,bannedLabels){
    var start=graph.pointMap[graph.named[startLabel]],end=graph.pointMap[graph.named[endLabel]],banned={};
    bannedLabels.forEach(function(label){banned[graph.named[label]]=true;});
    function usable(point){
      return !banned[point.key]&&point.x>=start.x&&point.x<=end.x&&point.y>=start.y&&point.y<=end.y;
    }
    var ordered=graph.points.filter(usable).sort(function(a,b){return (a.x+a.y)-(b.x+b.y)||a.x-b.x;});
    var counts={};
    ordered.forEach(function(point){counts[point.key]=0;});
    counts[start.key]=1;
    function outgoing(point){
      return graph.adjacency[point.key].map(function(key){return graph.pointMap[key];}).filter(function(next){
        return usable(next)&&next.x>=point.x&&next.y>=point.y&&(next.x>point.x||next.y>point.y);
      });
    }
    ordered.forEach(function(point){
      outgoing(point).forEach(function(next){counts[next.key]+=counts[point.key];});
    });
    var canReach={};
    canReach[end.key]=true;
    ordered.slice().reverse().forEach(function(point){
      if(point.key!==end.key) canReach[point.key]=outgoing(point).some(function(next){return !!canReach[next.key];});
    });
    var relevant=ordered.filter(function(point){return counts[point.key]>0&&canReach[point.key];});
    var relevantMap={};
    relevant.forEach(function(point){relevantMap[point.key]=true;});
    var activeEdges=graph.edges.filter(function(edge){return relevantMap[edge.from]&&relevantMap[edge.to];});
    return {
      start:startLabel,
      end:endLabel,
      banned:bannedLabels.slice(),
      pathCount:counts[end.key]||0,
      distance:(end.x-start.x)+(end.y-start.y),
      counts:relevant.map(function(point){return {key:point.key,x:point.x,y:point.y,label:point.label||'',count:counts[point.key]};}),
      activeEdges:activeEdges
    };
  }

  function calculateRoadPaths(){
    var graph=buildRoadGraph();
    var first=calculateRoadLeg(graph,'A','B',[]);
    var second=calculateRoadLeg(graph,'B','D',['C']);
    var hasLeftShort=MODEL.q13.horizontalSegments.some(function(segment){return segment.y==='Y4'&&segment.from==='X0'&&segment.to==='X1';});
    return {
      valid:MODEL.q13.horizontalSegments.length===8&&MODEL.q13.verticalSegments.length===7&&hasLeftShort&&first.pathCount===4&&second.pathCount===4,
      graph:graph,
      first:first,
      second:second,
      total:first.pathCount*second.pathCount
    };
  }

  function tilingCellKey(cell){
    return cell[0]+','+cell[1];
  }

  function tilingPieceKey(cells){
    return cells.map(tilingCellKey).sort().join(';');
  }

  function transformTilingCells(cells,reflection,rotation){
    return cells.map(function(cell){
      var row=cell[0],col=cell[1];
      if(reflection) col=2-col;
      for(var turn=0;turn<rotation;turn++){
        var nextRow=col,nextCol=2-row;
        row=nextRow;col=nextCol;
      }
      return [row,col];
    });
  }

  function tilingOrbitKey(pair){
    var keys=[];
    for(var reflection=0;reflection<2;reflection++) for(var rotation=0;rotation<4;rotation++){
      keys.push([tilingPieceKey(transformTilingCells(pair[0],reflection,rotation)),tilingPieceKey(transformTilingCells(pair[1],reflection,rotation))].sort().join('|'));
    }
    return keys.sort()[0];
  }

  function isLTromino(cells){
    if(cells.length!==3) return false;
    var rows=cells.map(function(cell){return cell[0];});
    var cols=cells.map(function(cell){return cell[1];});
    return Math.max.apply(null,rows)-Math.min.apply(null,rows)===1&&Math.max.apply(null,cols)-Math.min.apply(null,cols)===1&&new Set(cells.map(tilingCellKey)).size===3;
  }

  function calculateTilings(){
    var model=MODEL.q16,placements=[];
    for(var row=0;row<2;row++) for(var col=0;col<2;col++){
      var block=[[row,col],[row,col+1],[row+1,col],[row+1,col+1]];
      for(var omitted=0;omitted<4;omitted++) placements.push(block.filter(function(_,index){return index!==omitted;}));
    }
    var pairs=[];
    for(var first=0;first<placements.length;first++) for(var second=first+1;second<placements.length;second++){
      var occupied={};
      placements[first].forEach(function(cell){occupied[tilingCellKey(cell)]=true;});
      if(placements[second].every(function(cell){return !occupied[tilingCellKey(cell)];})) pairs.push([placements[first],placements[second]]);
    }
    var orbitMap={};
    pairs.forEach(function(pair){orbitMap[tilingOrbitKey(pair)]=true;});
    var representatives=model.representatives.map(function(representative){
      var A=representative.A.map(function(cell){return [cell[0]-1,cell[1]-1];});
      var B=representative.B.map(function(cell){return [cell[0]-1,cell[1]-1];});
      var used={};
      A.concat(B).forEach(function(cell){used[tilingCellKey(cell)]=true;});
      var single=[];
      for(var row=0;row<model.board.rows;row++) for(var col=0;col<model.board.cols;col++) if(!used[row+','+col]) single.push([row,col]);
      return {A:A,B:B,single:single,orbitKey:tilingOrbitKey([A,B])};
    });
    var representativeOrbitMap={};
    representatives.forEach(function(representative){representativeOrbitMap[representative.orbitKey]=true;});
    var valid=model.pieces.length===2&&model.pieces[0].kind==='L-tromino'&&model.pieces[0].count===2&&model.pieces[0].cells===3&&model.pieces[1].kind==='monomino'&&model.pieces[1].count===3&&model.pieces[1].cells===1;
    valid=valid&&placements.length===16&&pairs.length===22&&Object.keys(orbitMap).length===4&&Object.keys(representativeOrbitMap).length===4;
    valid=valid&&Object.keys(orbitMap).sort().join('||')===Object.keys(representativeOrbitMap).sort().join('||');
    valid=valid&&representatives.every(function(representative){return isLTromino(representative.A)&&isLTromino(representative.B)&&representative.single.length===3;});
    return {valid:valid,placementCount:placements.length,disjointPairCount:pairs.length,orbitCount:Object.keys(orbitMap).length,representatives:representatives};
  }

  function calculateProjection(){
    var source=MODEL.q12;
    var spatial=source.spatialPath.map(function(point){return resolvePoint(point,source.parameters);});
    var projected=spatial.map(projectTop);
    var screen=projected.map(function(point){return screenPoint(point,source.frame);});
    var pathD=screen.map(function(point,index){
      return (index?'L':'M')+number(point.x)+' '+number(point.y);
    }).join(' ');
    return {spatial:spatial,projected:projected,screen:screen,pathD:pathD};
  }

  function graphPair(a,b){
    return [a,b].sort().join('-');
  }

  function calculateGraph(){
    var source=MODEL.q28;
    var nodes={};
    source.nodes.forEach(function(node){nodes[node.id]=node;});
    var degrees={};
    source.nodes.forEach(function(node){degrees[node.id]=0;});
    var baseLength=source.edges.reduce(function(sum,edge){
      degrees[edge.from]+=1;
      degrees[edge.to]+=1;
      return sum+edge.weight;
    },0);
    var weights={};
    source.edges.forEach(function(edge){weights[graphPair(edge.from,edge.to)]=edge.weight;});
    var routeLength=0;
    for(var index=0;index<source.route.length-1;index++){
      routeLength+=weights[graphPair(source.route[index],source.route[index+1])]||0;
    }
    return {
      nodes:nodes,
      edges:source.edges.slice(),
      degrees:degrees,
      baseLength:baseLength,
      oddVertices:Object.keys(degrees).filter(function(id){return degrees[id]%2===1;}).sort(),
      duplicateEdgeIds:source.duplicateEdgeIds.slice(),
      addedLength:source.edges.filter(function(edge){return source.duplicateEdgeIds.indexOf(edge.id)>=0;}).reduce(function(sum,edge){return sum+edge.weight;},0),
      routeLength:routeLength
    };
  }

  function calculate(no){
    if(Number(no)===2) return calculateSquareChain();
    if(Number(no)===5) return calculateCountryColoring();
    if(Number(no)===9) return calculateCuboidPaths();
    if(Number(no)===12) return calculateProjection();
    if(Number(no)===13) return calculateRoadPaths();
    if(Number(no)===16) return calculateTilings();
    if(Number(no)===28) return calculateGraph();
    return null;
  }

  function lineElement(className,attributes){
    return '<line class="'+esc(className)+'" '+attributes+' vector-effect="non-scaling-stroke"></line>';
  }

  function renderSquareChain(){
    var model=MODEL.q2,calculated=calculateSquareChain();
    if(!calculated.valid) return '';
    var cells=calculated.polygons.map(function(cell){
      var center=cell.points.reduce(function(total,point){return {x:total.x+point.x/4,y:total.y+point.y/4};},{x:0,y:0});
      return '<g class="gfield-final2-q2-cell" data-cell-id="'+cell.id+'">'+
        '<polygon points="'+cell.pointsText+'" fill="#FFFFFF" stroke="#566274" stroke-width="1.7" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polygon>'+
        '<text x="'+number(center.x)+'" y="'+number(center.y+6)+'" text-anchor="middle" fill="#182230" stroke="#FFFFFF" stroke-width="3" paint-order="stroke" font-size="18" font-weight="800" font-family="sans-serif">'+cell.id+'</text>'+
      '</g>';
    }).join('');
    var shared=calculated.sharedEdges.map(function(edge){
      var first=edge.points[0],second=edge.points[1],isFirst=edge.group==='first';
      return lineElement('gfield-final2-q2-shared is-'+edge.group,
        'data-pair="'+edge.pair.join('-')+'" data-group="'+edge.group+'" x1="'+number(first.x)+'" y1="'+number(first.y)+'" x2="'+number(second.x)+'" y2="'+number(second.y)+'" stroke="'+(isFirst?'#2456C4':'#16734B')+'" stroke-width="4.4" stroke-linecap="round"'+(isFirst?'':' stroke-dasharray="6 4"'));
    }).join('');
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q2" style="box-sizing:border-box;width:100%;max-width:34rem;margin:.6rem auto;background:#FFFFFF;color:#182230;break-inside:avoid;page-break-inside:avoid">'+
      '<svg viewBox="0 0 520 150" role="img" aria-label="'+esc(model.labels.aria)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+
        cells+shared+
        '<g transform="translate(78 132)" font-family="sans-serif" font-size="18" font-weight="700">'+
          '<line x1="0" y1="-4" x2="28" y2="-4" stroke="#2456C4" stroke-width="4.4" stroke-linecap="round"></line><text x="36" y="0" fill="#566274">'+esc(model.labels.first)+'</text>'+
          '<line x1="230" y1="-4" x2="258" y2="-4" stroke="#16734B" stroke-width="4.4" stroke-dasharray="6 4" stroke-linecap="round"></line><text x="266" y="0" fill="#566274">'+esc(model.labels.second)+'</text>'+
        '</g>'+
      '</svg>'+
      '<div style="margin:.15rem 0 0;text-align:center;color:#182230;font:800 .86rem/1.4 sans-serif">작은 정사각형 20개 + 맞닿은 두 칸 19개 = 39개</div>'+
      '<figcaption style="margin:.15rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.4 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function junctionSectorPoints(quadrant,junction){
    var frame=junction.localFrame,point=junction.point,left=frame.left,right=frame.right,top=frame.top,bottom=frame.bottom,x=point[0],y=point[1];
    if(quadrant==='upper-left') return [[left,top],[x,top],[x,y],[left,y]];
    if(quadrant==='upper-right') return [[x,top],[right,top],[right,y],[x,y]];
    if(quadrant==='lower-right') return [[x,y],[right,y],[right,bottom],[x,bottom]];
    return [[left,y],[x,y],[x,bottom],[left,bottom]];
  }

  function renderCountryColoring(){
    var model=MODEL.q5,calculated=calculateCountryColoring();
    if(!calculated.valid) return '';
    var junction=model.centralJunction;
    var sectors=junction.sectors.map(function(sector){
      var palette=model.palette[sector.colorId];
      var points=junctionSectorPoints(sector.quadrant,junction).map(function(point){return point.join(',');}).join(' ');
      return '<g class="gfield-final2-q5-sector" data-country="'+esc(sector.country)+'" data-color-id="'+sector.colorId+'">'+
        '<polygon points="'+points+'" fill="'+palette.fill+'"></polygon>'+
        '<text x="'+sector.labelPoint[0]+'" y="'+(sector.labelPoint[1]+5)+'" text-anchor="middle" fill="'+palette.stroke+'" stroke="#FFFFFF" stroke-width="3" paint-order="stroke" font-size="15" font-weight="900" font-family="sans-serif">'+sector.country+' · '+sector.colorId+'</text>'+
      '</g>';
    }).join('');
    var rays=junction.localBoundaryRays.map(function(ray,index){
      return lineElement('gfield-final2-q5-boundary-ray','data-boundary-ray="'+index+'" x1="'+ray[0][0]+'" y1="'+ray[0][1]+'" x2="'+ray[1][0]+'" y2="'+ray[1][1]+'" stroke="#566274" stroke-width="2.2" stroke-linecap="round"');
    }).join('');
    var frame=junction.localFrame,point=junction.point;
    var diagram='<svg viewBox="0 0 260 190" role="img" aria-label="'+esc(model.labels.aria)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+
      '<text x="130" y="17" text-anchor="middle" fill="#182230" font-size="13" font-weight="900" font-family="sans-serif">원래 중앙점 확대</text>'+
      '<g transform="translate(30 20)">'+sectors+
        '<rect x="'+frame.left+'" y="'+frame.top+'" width="'+(frame.right-frame.left)+'" height="'+(frame.bottom-frame.top)+'" rx="4" fill="none" stroke="#566274" stroke-width="2.2" vector-effect="non-scaling-stroke"></rect>'+rays+
        '<circle class="gfield-final2-q5-central-point" data-point-only-pair="가-바" cx="'+point[0]+'" cy="'+point[1]+'" r="7" fill="#B3261E" stroke="#FFFFFF" stroke-width="2.5" vector-effect="non-scaling-stroke"></circle>'+
      '</g>'+
      '<circle cx="58" cy="171" r="5" fill="#B3261E"></circle><text x="69" y="176" fill="#566274" font-size="12.5" font-weight="700" font-family="sans-serif">빨간 점 = 원래 중앙의 한 점</text>'+
    '</svg>';
    var cards=model.coloringClasses.map(function(group,index){
      var palette=model.palette[group.colorId],label=['첫째','둘째','셋째','넷째'][index];
      return '<div class="gfield-final2-q5-color-card" data-color-id="'+group.colorId+'" style="box-sizing:border-box;border:2px solid '+palette.stroke+';border-radius:.45rem;padding:.35rem .45rem;background:'+palette.fill+';color:#182230;font:800 .78rem/1.4 sans-serif">'+label+' 색 <strong style="color:'+palette.stroke+'">'+group.colorId+'</strong> · '+group.countries.join('·')+'</div>';
    }).join('');
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q5" style="box-sizing:border-box;width:100%;max-width:26rem;margin:.6rem auto;background:#FFFFFF;color:#182230;break-inside:avoid;page-break-inside:avoid">'+
      diagram+
      '<div style="margin:.15rem 0 .45rem;text-align:center;color:#182230;font:800 .78rem/1.45 sans-serif">가·라·마·바는 같은 중앙점에서 만나므로 네 나라의 색이 모두 달라야 합니다.</div>'+
      '<div class="gfield-final2-q5-color-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem">'+cards+'</div>'+
      '<div style="margin:.4rem 0 0;text-align:center;color:#566274;font:700 .72rem/1.45 sans-serif">라·다는 서로 만나지 않고, 나·마도 서로 만나지 않아 같은 색을 쓸 수 있습니다.</div>'+
      '<div style="margin:.25rem 0 0;text-align:center;color:#B3261E;font:700 .7rem/1.4 sans-serif">가와 바 사이에 새 국경선을 그린 것이 아니라, 원래 중앙점의 만남을 표시했습니다.</div>'+
      '<figcaption style="margin:.2rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.4 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function cuboidScreenPoint(coordinate){
    return {x:64+coordinate[0]*112-coordinate[1]*40,y:30+coordinate[1]*34+coordinate[2]*52};
  }

  function cuboidDisplayName(id){
    if(id==='K') return 'ㄱ(K)';
    if(id==='N') return 'ㄴ(N)';
    return id.replace('0','₀').replace('1','₁');
  }

  function renderCuboidSvg(route,index,isReference){
    var model=MODEL.q9,routeEdges={};
    if(route) for(var step=1;step<route.length;step++) routeEdges[pairKey(route[step-1],route[step])]=true;
    var edges=model.edges.map(function(edge){
      var first=cuboidScreenPoint(model.vertices[edge[0]]),second=cuboidScreenPoint(model.vertices[edge[1]]),active=!!routeEdges[pairKey(edge[0],edge[1])];
      return lineElement('gfield-final2-q9-edge'+(active?' is-route':''),
        'data-edge="'+edge.join('-')+'" x1="'+number(first.x)+'" y1="'+number(first.y)+'" x2="'+number(second.x)+'" y2="'+number(second.y)+'" stroke="'+(active?'#2456C4':'#AEB7C5')+'" stroke-width="'+(active?'5':'2')+'" stroke-linecap="round" stroke-linejoin="round"');
    }).join('');
    var vertices=Object.keys(model.vertices).map(function(id){
      var point=cuboidScreenPoint(model.vertices[id]),active=!route||route.indexOf(id)>=0,label=cuboidDisplayName(id);
      var labelX=point.x+(id==='K'||id==='U0'||id==='D0'||id==='F0'?-7:7);
      var anchor=id==='K'||id==='U0'||id==='D0'||id==='F0'?'end':'start';
      var labelY=point.y+(id==='K'||id==='N'||id==='U0'||id==='U1'?-8:16);
      return '<g class="gfield-final2-q9-vertex'+(active?' is-route':'')+'" data-vertex-id="'+esc(id)+'">'+
        '<circle cx="'+number(point.x)+'" cy="'+number(point.y)+'" r="'+(id===model.start||id===model.end?5.5:4)+'" fill="'+(active?'#2456C4':'#FFFFFF')+'" stroke="'+(active?'#2456C4':'#566274')+'" stroke-width="1.7" vector-effect="non-scaling-stroke"></circle>'+
        (isReference?'<text x="'+number(labelX)+'" y="'+number(labelY)+'" text-anchor="'+anchor+'" fill="#182230" stroke="#FFFFFF" stroke-width="4" paint-order="stroke" font-size="12" font-weight="800" font-family="sans-serif">'+esc(label)+'</text>':'')+
      '</g>';
    }).join('');
    var aria=isReference?model.labels.reference:(index+'번 길: '+route.map(cuboidDisplayName).join(', '));
    return '<svg viewBox="0 0 220 150" role="img" aria-label="'+esc(aria)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+edges+vertices+'</svg>';
  }

  function renderCuboidPaths(){
    var model=MODEL.q9,calculated=calculateCuboidPaths();
    if(!calculated.valid) return '';
    var routeCards=calculated.paths.map(function(path,index){
      var group=path[1]==='U0'?model.labels.firstGroup:model.labels.secondGroup;
      return '<div class="gfield-final2-q9-route" data-route-index="'+(index+1)+'" data-route="'+esc(path.join('-'))+'" data-first-step="'+esc(path[1])+'" style="box-sizing:border-box;border:1px solid #D8DEE8;border-radius:.45rem;padding:.25rem .35rem .4rem;background:#FFFFFF;break-inside:avoid;page-break-inside:avoid">'+
        renderCuboidSvg(path,index+1,false)+
        '<div style="margin-top:-.2rem;text-align:center;color:#182230;font:800 .72rem/1.35 sans-serif">'+(index+1)+'. '+path.map(cuboidDisplayName).join(' → ')+'</div>'+
        '<div style="margin-top:.1rem;text-align:center;color:#566274;font:600 .66rem/1.3 sans-serif">'+esc(group.replace('U0','U₀').replace('D0','D₀'))+'</div>'+
      '</div>';
    }).join('');
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q9" style="box-sizing:border-box;width:100%;max-width:31rem;margin:.6rem auto;background:#FFFFFF;color:#182230">'+
      '<div style="box-sizing:border-box;max-width:21rem;margin:0 auto .4rem;border:1px solid #D8DEE8;border-radius:.55rem;padding:.35rem .5rem;background:#FFFFFF;break-inside:avoid;page-break-inside:avoid">'+
        '<div style="text-align:center;color:#182230;font:800 .82rem/1.35 sans-serif">'+esc(model.labels.reference)+'</div>'+renderCuboidSvg(null,0,true)+
        '<div style="margin-top:-.25rem;text-align:center;color:#566274;font:600 .7rem/1.4 sans-serif">K=ㄱ, N=ㄴ · U=위 앞쪽 · D=아래 뒤쪽 · F=아래 앞쪽 · 0=왼쪽, 1=오른쪽</div>'+
      '</div>'+
      '<div class="gfield-final2-q9-route-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;align-items:start">'+routeCards+'</div>'+
      '<div style="margin:.4rem 0 0;text-align:center;color:#182230;font:800 .82rem/1.4 sans-serif">U₀에서 4가지 + D₀에서 4가지 = 8가지</div>'+
      '<figcaption style="margin:.15rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.4 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function roadScreenPoint(point,model){
    var xMax=model.axes.x.reduce(function(max,axis){return Math.max(max,axis.value);},0);
    var yMax=model.axes.y.reduce(function(max,axis){return Math.max(max,axis.value);},0);
    return {x:model.frame.left+(point.x/xMax)*model.frame.width,y:model.frame.top+model.frame.height-(point.y/yMax)*model.frame.height};
  }

  function renderRoadPanel(calculated,leg,title,index){
    var model=MODEL.q13,graph=calculated.graph,active={};
    leg.activeEdges.forEach(function(edge){active[edge.id]=true;});
    var baseHorizontal=graph.horizontal.map(function(segment,segmentIndex){
      var first=roadScreenPoint({x:segment.from,y:segment.y},model),second=roadScreenPoint({x:segment.to,y:segment.y},model);
      return lineElement('gfield-final2-q13-road is-horizontal','data-road-horizontal="'+segmentIndex+'" x1="'+number(first.x)+'" y1="'+number(first.y)+'" x2="'+number(second.x)+'" y2="'+number(second.y)+'" stroke="#AEB7C5" stroke-width="2.2" stroke-linecap="round"');
    }).join('');
    var baseVertical=graph.vertical.map(function(segment,segmentIndex){
      var first=roadScreenPoint({x:segment.x,y:segment.from},model),second=roadScreenPoint({x:segment.x,y:segment.to},model);
      return lineElement('gfield-final2-q13-road is-vertical','data-road-vertical="'+segmentIndex+'" x1="'+number(first.x)+'" y1="'+number(first.y)+'" x2="'+number(second.x)+'" y2="'+number(second.y)+'" stroke="#AEB7C5" stroke-width="2.2" stroke-linecap="round"');
    }).join('');
    var activeEdges=leg.activeEdges.map(function(edge){
      var first=roadScreenPoint(graph.pointMap[edge.from],model),second=roadScreenPoint(graph.pointMap[edge.to],model);
      return lineElement('gfield-final2-q13-active-road','data-active-edge="'+esc(edge.id)+'" x1="'+number(first.x)+'" y1="'+number(first.y)+'" x2="'+number(second.x)+'" y2="'+number(second.y)+'" stroke="#2456C4" stroke-width="4.6" stroke-linecap="round"');
    }).join('');
    var counts=leg.counts.map(function(item){
      var point=roadScreenPoint(item,model),isEnd=item.label===leg.end;
      return '<g class="gfield-final2-q13-count'+(isEnd?' is-end':'')+'" data-count-node="'+esc(item.key)+'" data-count="'+item.count+'">'+
        '<circle cx="'+number(point.x)+'" cy="'+number(point.y)+'" r="9.5" fill="'+(isEnd?'#2456C4':'#FFFFFF')+'" stroke="#2456C4" stroke-width="2" vector-effect="non-scaling-stroke"></circle>'+
        '<text x="'+number(point.x)+'" y="'+number(point.y+4)+'" text-anchor="middle" fill="'+(isEnd?'#FFFFFF':'#182230')+'" font-size="11.5" font-weight="800" font-family="sans-serif">'+item.count+'</text>'+
      '</g>';
    }).join('');
    var named=Object.keys(model.points).map(function(label){
      var source=model.points[label],point=roadScreenPoint({x:graph.x[source.x],y:graph.y[source.y]},model),banned=leg.banned.indexOf(label)>=0;
      var dx=label==='A'||label==='C'?-13:13,dy=label==='A'||label==='D'?16:-10;
      var marker=banned?'<path d="M'+number(point.x-8)+' '+number(point.y-8)+' L'+number(point.x+8)+' '+number(point.y+8)+' M'+number(point.x+8)+' '+number(point.y-8)+' L'+number(point.x-8)+' '+number(point.y+8)+'" fill="none" stroke="#B3261E" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>':'';
      return '<g class="gfield-final2-q13-named-point'+(banned?' is-banned':'')+'" data-point-label="'+label+'">'+marker+'<text x="'+number(point.x+dx)+'" y="'+number(point.y+dy)+'" text-anchor="middle" fill="'+(banned?'#B3261E':'#182230')+'" stroke="#FFFFFF" stroke-width="4" paint-order="stroke" font-size="13" font-weight="900" font-family="sans-serif">'+label+(banned?' ×':'')+'</text></g>';
    }).join('');
    return '<section class="gfield-final2-q13-leg" data-leg="'+index+'" style="box-sizing:border-box;border:1px solid #D8DEE8;border-radius:.55rem;padding:.35rem .4rem .45rem;background:#FFFFFF;break-inside:avoid;page-break-inside:avoid">'+
      '<div style="text-align:center;color:#182230;font:800 .83rem/1.4 sans-serif">'+esc(title)+'</div>'+
      '<svg viewBox="0 0 360 240" role="img" aria-label="'+esc(title+'. '+model.labels.count)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+baseHorizontal+baseVertical+activeEdges+counts+named+'</svg>'+
      '<div style="margin-top:-.15rem;text-align:center;color:#566274;font:600 .7rem/1.4 sans-serif">파란 길만 따라 오른쪽·위쪽으로 이동 · 끝점의 수 '+leg.pathCount+'</div>'+
    '</section>';
  }

  function renderRoadPaths(){
    var model=MODEL.q13,calculated=calculateRoadPaths();
    if(!calculated.valid) return '';
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q13" style="box-sizing:border-box;width:100%;max-width:31rem;margin:.6rem auto;background:#FFFFFF;color:#182230">'+
      '<div style="margin:0 0 .35rem;text-align:center;color:#566274;font:700 .74rem/1.4 sans-serif">'+esc(model.labels.direction)+' · '+esc(model.labels.count)+'</div>'+
      '<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.55rem">'+renderRoadPanel(calculated,calculated.first,model.labels.first,1)+renderRoadPanel(calculated,calculated.second,model.labels.second,2)+'</div>'+
      '<div style="margin:.4rem 0 0;text-align:center;color:#182230;font:900 .9rem/1.4 sans-serif">4 × 4 = 16가지</div>'+
      '<figcaption style="margin:.15rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.4 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function renderTilingBoard(representative,index){
    var occupancy={};
    representative.A.forEach(function(cell){occupancy[tilingCellKey(cell)]='A';});
    representative.B.forEach(function(cell){occupancy[tilingCellKey(cell)]='B';});
    representative.single.forEach(function(cell){occupancy[tilingCellKey(cell)]='single';});
    var cells=[];
    for(var row=0;row<3;row++) for(var col=0;col<3;col++){
      var piece=occupancy[row+','+col],x=41+col*44,y=17+row*44,label=piece==='single'?'•':piece;
      cells.push('<g class="gfield-final2-q16-cell is-'+piece+'" data-row="'+(row+1)+'" data-col="'+(col+1)+'" data-piece="'+piece+'">'+
        '<rect x="'+x+'" y="'+y+'" width="44" height="44" rx="2" fill="'+(piece==='A'?'#EAF0FF':piece==='B'?'#E7F5EE':'#FFFFFF')+'" stroke="'+(piece==='A'?'#2456C4':piece==='B'?'#16734B':'#AEB7C5')+'" stroke-width="2" vector-effect="non-scaling-stroke"></rect>'+
        '<text x="'+(x+22)+'" y="'+(y+28)+'" text-anchor="middle" fill="'+(piece==='A'?'#2456C4':piece==='B'?'#16734B':'#566274')+'" font-size="16" font-weight="900" font-family="sans-serif">'+label+'</text>'+
      '</g>');
    }
    return '<div class="gfield-final2-q16-representative" data-representative="'+index+'" style="box-sizing:border-box;border:1px solid #D8DEE8;border-radius:.5rem;padding:.3rem;background:#FFFFFF;break-inside:avoid;page-break-inside:avoid">'+
      '<div style="text-align:center;color:#182230;font:900 .78rem/1.35 sans-serif">대표 '+index+'</div>'+
      '<svg viewBox="0 0 214 160" role="img" aria-label="대표 '+index+'. A L자 세 칸, B L자 세 칸, 한 칸 조각 세 개" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+cells.join('')+'</svg>'+
    '</div>';
  }

  function renderTilings(){
    var model=MODEL.q16,calculated=calculateTilings();
    if(!calculated.valid) return '';
    var boards=calculated.representatives.map(function(representative,index){return renderTilingBoard(representative,index+1);}).join('');
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q16" style="box-sizing:border-box;width:100%;max-width:29rem;margin:.6rem auto;background:#FFFFFF;color:#182230">'+
      '<div style="box-sizing:border-box;margin:0 0 .45rem;border:1px solid #D8DEE8;border-radius:.45rem;padding:.38rem .5rem;text-align:center;color:#182230;font:800 .8rem/1.45 sans-serif;background:#FFFFFF">↻ 돌리기 · ↔ 뒤집기로 같아지는 배치는 하나로 묶기</div>'+
      '<div class="gfield-final2-q16-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem">'+boards+'</div>'+
      '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem .8rem;margin:.45rem 0 0;color:#566274;font:700 .72rem/1.4 sans-serif">'+
        '<span style="color:#2456C4">'+esc(model.labels.pieceA)+'</span><span style="color:#16734B">'+esc(model.labels.pieceB)+'</span><span>'+esc(model.labels.single)+'</span>'+
      '</div>'+
      '<div style="margin:.3rem 0 0;text-align:center;color:#182230;font:900 .88rem/1.4 sans-serif">서로 다른 대표 = 4가지</div>'+
      '<figcaption style="margin:.15rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.4 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function renderProjection(){
    var calculated=calculateProjection();
    var model=MODEL.q12;
    var frame=model.frame;
    var square='<rect class="gfield-final2-q12-frame" x="'+number(frame.left)+'" y="'+number(frame.top)+'" width="'+number(frame.size)+'" height="'+number(frame.size)+'" fill="#FFFFFF" stroke="#AEB7C5" stroke-width="2" vector-effect="non-scaling-stroke"></rect>';
    var answer='<path class="gfield-final2-q12-answer" d="'+esc(calculated.pathD)+'" fill="none" stroke="#111111" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>';
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q12" style="box-sizing:border-box;width:100%;max-width:20rem;margin:.5rem auto;background:#FFFFFF;color:#182230;break-inside:avoid;page-break-inside:avoid">'+
      '<svg viewBox="0 0 320 340" role="img" aria-label="'+esc(model.labels.aria)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+
        '<text x="160" y="25" text-anchor="middle" fill="#566274" font-size="17" font-family="sans-serif">'+esc(model.labels.back)+'</text>'+
        square+answer+
        '<text x="160" y="312" text-anchor="middle" fill="#566274" font-size="17" font-family="sans-serif">'+esc(model.labels.front)+'</text>'+
      '</svg>'+
      '<figcaption style="margin:.2rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.35 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function renderGraph(){
    var calculated=calculateGraph();
    var model=MODEL.q28;
    var scaleX=3.2,scaleY=2.9,offsetX=40,offsetY=26;
    function point(id){
      var node=calculated.nodes[id];
      return {x:offsetX+node.x*scaleX,y:offsetY+node.y*scaleY};
    }
    var edges=model.edges.map(function(edge){
      var from=point(edge.from),to=point(edge.to);
      var repeated=model.duplicateEdgeIds.indexOf(edge.id)>=0;
      var line='<line class="gfield-final2-q28-edge'+(repeated?' is-repeated':'')+'" data-edge-id="'+esc(edge.id)+'" x1="'+number(from.x)+'" y1="'+number(from.y)+'" x2="'+number(to.x)+'" y2="'+number(to.y)+'" stroke="'+(repeated?'#2456C4':'#566274')+'" stroke-width="'+(repeated?'5':'2.5')+'" stroke-linecap="round" vector-effect="non-scaling-stroke"></line>';
      var mx=(from.x+to.x)/2,my=(from.y+to.y)/2;
      var label='<text x="'+number(mx)+'" y="'+number(my-5)+'" text-anchor="middle" fill="#182230" stroke="#FFFFFF" stroke-width="5" paint-order="stroke" font-size="13" font-weight="700" font-family="sans-serif">'+edge.weight+'</text>';
      return line+label;
    }).join('');
    var nodes=model.nodes.map(function(node){
      var p=point(node.id),odd=model.oddVertices.indexOf(node.id)>=0;
      return '<g class="gfield-final2-q28-node'+(odd?' is-odd':'')+'" data-node-id="'+esc(node.id)+'"><circle cx="'+number(p.x)+'" cy="'+number(p.y)+'" r="13" fill="'+(odd?'#EAF0FF':'#FFFFFF')+'" stroke="'+(odd?'#2456C4':'#566274')+'" stroke-width="2" vector-effect="non-scaling-stroke"></circle><text x="'+number(p.x)+'" y="'+number(p.y+5)+'" text-anchor="middle" fill="#182230" font-size="14" font-weight="800" font-family="sans-serif">'+esc(node.id)+'</text></g>';
    }).join('');
    return '<figure class="gfield-final2-solution-diagram gfield-final2-solution-diagram--q28" style="box-sizing:border-box;width:100%;max-width:32rem;margin:.6rem auto;background:#FFFFFF;color:#182230;break-inside:avoid;page-break-inside:avoid">'+
      '<svg viewBox="0 0 400 340" role="img" aria-label="'+esc(model.labels.aria)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;background:#FFFFFF">'+
        edges+nodes+
        '<g transform="translate(84 328)"><line x1="0" y1="-5" x2="34" y2="-5" stroke="#2456C4" stroke-width="5" stroke-linecap="round"></line><text x="43" y="0" fill="#566274" font-size="13" font-weight="700" font-family="sans-serif">'+esc(model.labels.duplicate)+'</text></g>'+
      '</svg>'+
      '<figcaption style="margin:.2rem 0 0;text-align:center;color:#566274;font:600 .78rem/1.35 sans-serif">'+esc(model.labels.caption)+'</figcaption>'+
    '</figure>';
  }

  function render(no){
    if(Number(no)===2) return renderSquareChain();
    if(Number(no)===5) return renderCountryColoring();
    if(Number(no)===9) return renderCuboidPaths();
    if(Number(no)===12) return renderProjection();
    if(Number(no)===13) return renderRoadPaths();
    if(Number(no)===16) return renderTilings();
    if(Number(no)===28) return renderGraph();
    return '';
  }

  root.GFIELD_FINAL2_SOLUTION_DIAGRAMS=deepFreeze({
    model:MODEL,
    calculate:calculate,
    projectTop:projectTop,
    render:render
  });
})(typeof window!=='undefined'?window:globalThis);
