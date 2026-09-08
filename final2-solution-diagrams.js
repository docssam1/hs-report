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
    if(Number(no)===12) return calculateProjection();
    if(Number(no)===28) return calculateGraph();
    return null;
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
    if(Number(no)===12) return renderProjection();
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
