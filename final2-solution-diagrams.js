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

  function calculate(no){
    if(Number(no)!==12) return null;
    var source=MODEL.q12;
    var spatial=source.spatialPath.map(function(point){return resolvePoint(point,source.parameters);});
    var projected=spatial.map(projectTop);
    var screen=projected.map(function(point){return screenPoint(point,source.frame);});
    var pathD=screen.map(function(point,index){
      return (index?'L':'M')+number(point.x)+' '+number(point.y);
    }).join(' ');
    return {spatial:spatial,projected:projected,screen:screen,pathD:pathD};
  }

  function render(no){
    var calculated=calculate(no);
    if(!calculated) return '';
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

  root.GFIELD_FINAL2_SOLUTION_DIAGRAMS=deepFreeze({
    model:MODEL,
    calculate:calculate,
    projectTop:projectTop,
    render:render
  });
})(typeof window!=='undefined'?window:globalThis);
