(function(root){
'use strict';

function deepFreeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function(key){deepFreeze(value[key]);});
  return Object.freeze(value);
}

const SUPPORTED_IDS=Object.freeze([
  'final3-q1-fruit-branch-recurrence-v1',
  'final3-q3-alternating-tile-rings-v1',
  'final3-q4-finger-cycle-v1',
  'final3-q6-folded-paper-five-layers-v1',
  'final3-q7-balance-equations-v1',
  'final3-q8-stepped-mountain-paths-v1',
  'final3-q13-honeycomb-forward-paths-v1'
]);

const MODEL=deepFreeze({
  "q1": {
    "id": "final3-q1-fruit-branch-recurrence-v1",
    "questionNo": 1,
    "kind": "substitution-tree",
    "symbols": {
      "B": "바나나",
      "A": "사과"
    },
    "rules": {
      "B": [
        "A"
      ],
      "A": [
        "B",
        "A"
      ]
    },
    "shownRows": [
      [
        "B"
      ],
      [
        "A"
      ],
      [
        "B",
        "A"
      ],
      [
        "A",
        "B",
        "A"
      ],
      [
        "B",
        "A",
        "A",
        "B",
        "A"
      ]
    ]
  },
  "q3": {
    "id": "final3-q3-alternating-tile-rings-v1",
    "questionNo": 3,
    "kind": "square-lattice-rings",
    "roundRule": "round1={(0,0)}; round n>=2 adds positions with max(|x|,|y|)=n-1 and x+y even",
    "colorRule": {
      "odd": "white",
      "even": "black"
    },
    "sampleAddedCounts": [
      [
        1,
        1
      ],
      [
        2,
        4
      ],
      [
        3,
        8
      ],
      [
        4,
        12
      ]
    ],
    "target": {
      "round": 48,
      "color": "black",
      "addedCount": 188
    }
  },
  "q4": {
    "id": "final3-q4-finger-cycle-v1",
    "questionNo": 4,
    "kind": "ordered-finger-cycle",
    "cycle": [
      "왼손 엄지",
      "왼손 검지",
      "왼손 중지",
      "왼손 약지",
      "왼손 소지",
      "왼손 약지",
      "왼손 중지",
      "왼손 검지",
      "왼손 엄지",
      "오른손 엄지",
      "오른손 검지",
      "오른손 중지",
      "오른손 약지",
      "오른손 소지",
      "오른손 약지",
      "오른손 중지",
      "오른손 검지",
      "오른손 엄지"
    ],
    "sourceKey": {
      "19": "왼손 엄지",
      "20": "왼손 검지"
    },
    "target": {
      "count": 3000,
      "remainder": 12,
      "position": "오른손 중지"
    }
  },
  "q6": {
    "id": "final3-q6-folded-paper-five-layers-v1",
    "questionNo": 6,
    "kind": "partial-fold-layer-model",
    "paper": {
      "polygon": [
        [
          0,
          0
        ],
        [
          2,
          0
        ],
        [
          2,
          3
        ],
        [
          0,
          3
        ]
      ],
      "topSquare": [
        [
          0,
          0
        ],
        [
          2,
          0
        ],
        [
          2,
          2
        ],
        [
          0,
          2
        ]
      ],
      "bottomRectangle": [
        [
          0,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ],
        [
          0,
          3
        ]
      ]
    },
    "folds": [
      {
        "order": 1,
        "crease": [
          [
            0,
            2
          ],
          [
            2,
            0
          ]
        ],
        "movingRegion": [
          [
            0,
            0
          ],
          [
            0,
            2
          ],
          [
            2,
            0
          ]
        ],
        "resultLayerCount": 2
      },
      {
        "order": 2,
        "crease": [
          [
            1,
            1
          ],
          [
            2,
            2
          ]
        ],
        "movingRegion": [
          [
            1,
            1
          ],
          [
            2,
            0
          ],
          [
            2,
            2
          ]
        ],
        "resultTriangle": [
          [
            0,
            2
          ],
          [
            1,
            1
          ],
          [
            2,
            2
          ]
        ],
        "resultLayerCount": 4
      },
      {
        "order": 3,
        "crease": [
          [
            0,
            2
          ],
          [
            2,
            2
          ]
        ],
        "movingRegion": [
          [
            0,
            2
          ],
          [
            2,
            2
          ],
          [
            2,
            3
          ],
          [
            0,
            3
          ]
        ],
        "direction": "up",
        "layersInsideTriangle": 5
      }
    ],
    "cuts": [
      {
        "shape": "full-circle",
        "center": [
          1,
          1.34
        ],
        "unfoldedCompleteCircles": 5
      },
      {
        "shape": "full-circle",
        "center": [
          1,
          1.64
        ],
        "unfoldedCompleteCircles": 5
      },
      {
        "shape": "full-circle",
        "center": [
          0.36,
          1.88
        ],
        "unfoldedCompleteCircles": 5
      },
      {
        "shape": "full-circle",
        "center": [
          1.64,
          1.88
        ],
        "unfoldedCompleteCircles": 5
      },
      {
        "shape": "semicircle-on-final-crease",
        "center": [
          1,
          2
        ],
        "opens": "up",
        "unfoldedCompleteCircles": 1
      }
    ],
    "target": 21
  },
  "q7": {
    "id": "final3-q7-balance-equations-v1",
    "questionNo": 7,
    "kind": "three-balance-model",
    "figures": [
      {
        "left": {
          "triangle": 1,
          "circle": 1
        },
        "relation": "equal",
        "right": {
          "square": 2
        }
      },
      {
        "left": {
          "circle": 5,
          "square": 1
        },
        "relation": "equal",
        "right": {
          "triangle": 1,
          "square": 1
        }
      },
      {
        "left": {
          "square": 3
        },
        "relation": "lighter-than",
        "right": {
          "triangle": 2
        }
      }
    ],
    "unitWeights": {
      "circle": 1,
      "square": 3,
      "triangle": 5
    },
    "targetAddition": {
      "side": "left",
      "shape": "circle",
      "count": 1
    }
  },
  "q8": {
    "id": "final3-q8-stepped-mountain-paths-v1",
    "questionNo": 8,
    "kind": "unit-cell-edge-graph",
    "coordinateConvention": "x right, y up; every listed cell contributes all four boundary edges",
    "cellRows": [
      {
        "y": 0,
        "xMin": 0,
        "xMax": 8
      },
      {
        "y": 1,
        "xMin": 1,
        "xMax": 7
      },
      {
        "y": 2,
        "xMin": 2,
        "xMax": 6
      },
      {
        "y": 3,
        "xMin": 3,
        "xMax": 5
      },
      {
        "y": 4,
        "xMin": 4,
        "xMax": 4
      }
    ],
    "points": {
      "A": [
        0,
        0
      ],
      "B": [
        4,
        5
      ],
      "C": [
        9,
        0
      ]
    },
    "shortestMoves": {
      "AtoB": [
        "right",
        "up"
      ],
      "BtoC": [
        "right",
        "down"
      ]
    },
    "counts": {
      "AtoB": 42,
      "BtoC": 132,
      "combined": 5544
    }
  },
  "q13": {
    "id": "final3-q13-honeycomb-forward-paths-v1",
    "questionNo": 13,
    "kind": "two-row-hex-cell-graph",
    "nodes": {
      "top": [
        "별",
        "나",
        "라",
        "바",
        "아",
        "차",
        "타"
      ],
      "bottom": [
        "가",
        "다",
        "마",
        "사",
        "자",
        "카",
        "파"
      ],
      "forwardOrder": [
        "별",
        "가",
        "나",
        "다",
        "라",
        "마",
        "바",
        "사",
        "아",
        "자",
        "차",
        "카",
        "타",
        "파"
      ]
    },
    "edges": {
      "topHorizontal": [
        [
          "별",
          "나"
        ],
        [
          "나",
          "라"
        ],
        [
          "라",
          "바"
        ],
        [
          "바",
          "아"
        ],
        [
          "아",
          "차"
        ],
        [
          "차",
          "타"
        ]
      ],
      "bottomHorizontal": [
        [
          "가",
          "다"
        ],
        [
          "다",
          "마"
        ],
        [
          "마",
          "사"
        ],
        [
          "사",
          "자"
        ],
        [
          "자",
          "카"
        ],
        [
          "카",
          "파"
        ]
      ],
      "downRight": [
        [
          "별",
          "가"
        ],
        [
          "나",
          "다"
        ],
        [
          "라",
          "마"
        ],
        [
          "바",
          "사"
        ],
        [
          "아",
          "자"
        ],
        [
          "차",
          "카"
        ],
        [
          "타",
          "파"
        ]
      ],
      "upRight": [
        [
          "가",
          "나"
        ],
        [
          "다",
          "라"
        ],
        [
          "마",
          "바"
        ],
        [
          "사",
          "아"
        ],
        [
          "자",
          "차"
        ],
        [
          "카",
          "타"
        ]
      ]
    },
    "directionRule": "only edges from earlier to later in forwardOrder",
    "pathCounts": [
      1,
      1,
      2,
      3,
      5,
      8,
      13,
      21,
      34,
      55,
      89,
      144,
      233,
      377
    ],
    "target": 377
  }
});

function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

function same(a,b){
  return JSON.stringify(a)===JSON.stringify(b);
}

function countSymbols(row){
  return row.reduce((counts,symbol)=>{
    counts[symbol]=(counts[symbol]||0)+1;
    return counts;
  },{});
}

function calculateFruit(model){
  if(!model||model.kind!=='substitution-tree'||!model.rules) return null;
  const shown=[['B']];
  while(shown.length<5){
    const next=[];
    for(const symbol of shown[shown.length-1]){
      if(!Array.isArray(model.rules[symbol])) return null;
      next.push(...model.rules[symbol]);
    }
    shown.push(next);
  }
  let target=shown[0].slice();
  for(let row=2;row<=14;row++) target=target.flatMap(symbol=>model.rules[symbol]||[]);
  const counts=countSymbols(target);
  return {
    valid:same(shown,model.shownRows)&&counts.B===144&&counts.A===233,
    shownRows:shown,
    targetRow:14,
    targetCounts:{B:counts.B||0,A:counts.A||0}
  };
}

function tileCells(stage){
  const radius=stage-1;
  const cells=[];
  for(let y=-radius;y<=radius;y++){
    for(let x=-radius;x<=radius;x++){
      if((x+y)%2!==0) continue;
      const ring=Math.max(Math.abs(x),Math.abs(y))+1;
      cells.push({x,y,ring,color:ring%2===1?'white':'black',isNew:ring===stage});
    }
  }
  return cells;
}

function calculateTiles(model){
  if(!model||model.kind!=='square-lattice-rings'||!model.target) return null;
  const stages=[1,2,3,4].map(stage=>{
    const cells=tileCells(stage);
    return {stage,cells,addedCount:cells.filter(cell=>cell.isNew).length};
  });
  const sample=stages.map(stage=>[stage.stage,stage.addedCount]);
  const targetCount=4*(Number(model.target.round)-1);
  const targetColor=Number(model.target.round)%2===0?'black':'white';
  return {
    valid:same(sample,model.sampleAddedCounts)&&targetCount===model.target.addedCount&&targetColor===model.target.color,
    stages,
    target:{round:Number(model.target.round),color:targetColor,addedCount:targetCount}
  };
}

function calculateFingers(model){
  if(!model||model.kind!=='ordered-finger-cycle'||!Array.isArray(model.cycle)||!model.target) return null;
  const count=Number(model.target.count);
  const remainder=count%model.cycle.length;
  const position=model.cycle[(count-1)%model.cycle.length];
  return {
    valid:model.cycle.length===18&&remainder===Number(model.target.remainder)&&position===model.target.position&&
      model.sourceKey&&model.sourceKey['19']==='왼손 엄지'&&model.sourceKey['20']==='왼손 검지',
    cycleLength:model.cycle.length,
    remainder,
    position
  };
}

function calculateFold(model){
  if(!model||model.kind!=='partial-fold-layer-model'||!Array.isArray(model.folds)||!Array.isArray(model.cuts)) return null;
  const fullCuts=model.cuts.filter(cut=>cut.shape==='full-circle');
  const creaseCuts=model.cuts.filter(cut=>cut.shape==='semicircle-on-final-crease');
  const unfoldedCompleteCircles=model.cuts.reduce((sum,cut)=>sum+Number(cut.unfoldedCompleteCircles||0),0);
  const reflect=(point,line)=>{
    const a=line[0],b=line[1],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy);
    const projection=[a[0]+t*dx,a[1]+t*dy];
    return [Number((2*projection[0]-point[0]).toFixed(6)),Number((2*projection[1]-point[1]).toFixed(6))];
  };
  const creasePoint=creaseCuts[0]&&creaseCuts[0].center;
  const secondReflection=creasePoint&&reflect(creasePoint,model.folds[1].crease);
  const outerBoundaryPoints=creasePoint?[
    secondReflection,
    reflect(creasePoint,model.folds[0].crease),
    reflect(secondReflection,model.folds[0].crease)
  ]:[];
  return {
    valid:model.folds.length===3&&fullCuts.length===4&&creaseCuts.length===1&&unfoldedCompleteCircles===Number(model.target)&&
      same([creasePoint,...outerBoundaryPoints].map(point=>pointKey(point)).sort(),['0,1','1,0','1,2','2,1']),
    folds:model.folds.length,
    fullCuts:fullCuts.length,
    creaseCuts:creaseCuts.length,
    unfoldedCompleteCircles,
    creaseUnfolding:{completeCirclePoint:creasePoint.slice(),outerIncompleteSemicirclePoints:outerBoundaryPoints}
  };
}

function sideWeight(side,weights){
  return Object.keys(side||{}).reduce((sum,shape)=>sum+Number(side[shape]||0)*Number(weights[shape]||0),0);
}

function calculateBalance(model){
  if(!model||model.kind!=='three-balance-model'||!Array.isArray(model.figures)||!model.unitWeights) return null;
  const comparisons=model.figures.map(figure=>({
    left:sideWeight(figure.left,model.unitWeights),
    right:sideWeight(figure.right,model.unitWeights),
    relation:figure.relation
  }));
  const target=model.targetAddition||{};
  const third=comparisons[2]||{left:0,right:0};
  const unit=Number(model.unitWeights[target.shape]||0);
  const after=target.side==='left'?third.left+unit*Number(target.count):third.right+unit*Number(target.count);
  const other=target.side==='left'?third.right:third.left;
  return {
    valid:comparisons.length===3&&comparisons[0].left===comparisons[0].right&&comparisons[1].left===comparisons[1].right&&
      comparisons[2].left<comparisons[2].right&&after===other,
    comparisons,
    weights:{...model.unitWeights},
    targetAddition:{...target}
  };
}

function pointKey(point){
  return point[0]+','+point[1];
}

function edgeKey(a,b){
  return [pointKey(a),pointKey(b)].sort().join('|');
}

function mountainEdges(model){
  const edges=new Map();
  for(const row of model.cellRows||[]){
    for(let x=Number(row.xMin);x<=Number(row.xMax);x++){
      const y=Number(row.y);
      const sides=[[[x,y],[x+1,y]],[[x+1,y],[x+1,y+1]],[[x+1,y+1],[x,y+1]],[[x,y+1],[x,y]]];
      for(const [a,b] of sides) edges.set(edgeKey(a,b),[a,b]);
    }
  }
  return [...edges.values()];
}

function monotoneCounts(edges,start,end,moves){
  const vertices=new Map();
  for(const [a,b] of edges){ vertices.set(pointKey(a),a); vertices.set(pointKey(b),b); }
  const within=point=>point[0]>=Math.min(start[0],end[0])&&point[0]<=Math.max(start[0],end[0])&&point[1]>=Math.min(start[1],end[1])&&point[1]<=Math.max(start[1],end[1]);
  const distance=point=>Math.abs(point[0]-start[0])+Math.abs(point[1]-start[1]);
  const ordered=[...vertices.values()].filter(within).sort((a,b)=>distance(a)-distance(b)||a[1]-b[1]||a[0]-b[0]);
  const counts=new Map([[pointKey(start),1]]);
  for(const point of ordered){
    const value=counts.get(pointKey(point))||0;
    if(!value) continue;
    for(const move of moves){
      const next=[point[0]+move[0],point[1]+move[1]];
      if(within(next)&&edges.some(edge=>edgeKey(edge[0],edge[1])===edgeKey(point,next))){
        counts.set(pointKey(next),(counts.get(pointKey(next))||0)+value);
      }
    }
  }
  return [...counts.entries()].map(([key,count])=>({point:key.split(',').map(Number),count}));
}

function calculateMountain(model){
  if(!model||model.kind!=='unit-cell-edge-graph'||!model.points||!model.shortestMoves) return null;
  const edges=mountainEdges(model);
  const moveVector={right:[1,0],up:[0,1],down:[0,-1]};
  const firstMoves=model.shortestMoves.AtoB.map(name=>moveVector[name]);
  const secondMoves=model.shortestMoves.BtoC.map(name=>moveVector[name]);
  if(firstMoves.some(move=>!move)||secondMoves.some(move=>!move)) return null;
  const first=monotoneCounts(edges,model.points.A,model.points.B,firstMoves);
  const second=monotoneCounts(edges,model.points.B,model.points.C,secondMoves);
  const get=(list,point)=>(list.find(entry=>same(entry.point,point))||{}).count||0;
  const AtoB=get(first,model.points.B);
  const BtoC=get(second,model.points.C);
  return {
    valid:AtoB===Number(model.counts.AtoB)&&BtoC===Number(model.counts.BtoC)&&AtoB*BtoC===Number(model.counts.combined),
    edges,
    first:{start:model.points.A,end:model.points.B,counts:first,total:AtoB},
    second:{start:model.points.B,end:model.points.C,counts:second,total:BtoC},
    combined:AtoB*BtoC
  };
}

function calculateHoneycomb(model){
  if(!model||model.kind!=='two-row-hex-cell-graph'||!model.nodes||!model.edges) return null;
  const order=model.nodes.forwardOrder||[];
  const index=new Map(order.map((node,i)=>[node,i]));
  const edges=Object.values(model.edges).flat();
  const counts=new Map([[order[0],1]]);
  for(const node of order.slice(1)){
    let count=0;
    for(const edge of edges){
      if(!edge.includes(node)) continue;
      const other=edge[0]===node?edge[1]:edge[0];
      if(index.get(other)<index.get(node)) count+=counts.get(other)||0;
    }
    counts.set(node,count);
  }
  const pathCounts=order.map(node=>counts.get(node)||0);
  return {
    valid:new Set(edges.map(edge=>edge.slice().sort().join('|'))).size===edges.length&&same(pathCounts,model.pathCounts)&&pathCounts[pathCounts.length-1]===Number(model.target),
    order:order.slice(),
    edges:edges.map(edge=>edge.slice()),
    pathCounts
  };
}

function calculate(model){
  if(!model||SUPPORTED_IDS.indexOf(model.id)<0) return null;
  if(model.id==='final3-q1-fruit-branch-recurrence-v1') return calculateFruit(model);
  if(model.id==='final3-q3-alternating-tile-rings-v1') return calculateTiles(model);
  if(model.id==='final3-q4-finger-cycle-v1') return calculateFingers(model);
  if(model.id==='final3-q6-folded-paper-five-layers-v1') return calculateFold(model);
  if(model.id==='final3-q7-balance-equations-v1') return calculateBalance(model);
  if(model.id==='final3-q8-stepped-mountain-paths-v1') return calculateMountain(model);
  if(model.id==='final3-q13-honeycomb-forward-paths-v1') return calculateHoneycomb(model);
  return null;
}

function baseStyle(){
  return '<style>'+
    '.gfield-final3-solution-diagram{box-sizing:border-box;width:100%;max-width:56rem;margin:0 auto;padding:.8rem;border:1px solid #D8DEE8;border-radius:.8rem;background:#FFF;color:#172033;font-family:Arial,"Noto Sans KR",sans-serif;break-inside:avoid;page-break-inside:avoid}'+
    '.gfield-final3-solution-diagram *{box-sizing:border-box}.gfield-final3-solution-diagram svg{display:block;width:100%;height:auto;background:#FFF}'+
    '.gfield-final3-solution-diagram__title{margin:0 0 .55rem;font-size:1rem;line-height:1.45;font-weight:900}'+
    '.gfield-final3-solution-diagram__grid{display:grid;gap:.6rem;align-items:start}.gfield-final3-solution-diagram__card{min-width:0;border:1px solid #D8DEE8;border-radius:.55rem;padding:.4rem;background:#FFF}'+
    '.gfield-final3-solution-diagram__label{margin:.25rem 0 0;text-align:center;font-size:.82rem;line-height:1.45;font-weight:800}'+
    '.gfield-final3-solution-diagram__summary{margin:.65rem 0 0;padding:.5rem .65rem;border-radius:.5rem;background:#F3F6FB;font-size:.86rem;line-height:1.55;font-weight:750}'+
    '@media(max-width:600px){.gfield-final3-solution-diagram{padding:.6rem}.gfield-final3-solution-diagram__grid{grid-template-columns:1fr!important}.gfield-final3-solution-diagram__grid--q3,.gfield-final3-solution-diagram__grid--q6{grid-template-columns:repeat(2,minmax(0,1fr))!important}.gfield-final3-solution-diagram__title{font-size:.95rem}}'+
    '@media print{.gfield-final3-solution-diagram{max-width:180mm;border-color:#AEB7C4;padding:4mm}.gfield-final3-solution-diagram__title{font-size:11pt}.gfield-final3-solution-diagram__label,.gfield-final3-solution-diagram__summary{font-size:9.5pt}}'+
  '</style>';
}

function figure(model,title,body,summary){
  return '<figure class="gfield-final3-solution-diagram gfield-final3-solution-diagram--q'+Number(model.questionNo)+'" data-diagram-id="'+esc(model.id)+'" data-release-status="locked">'+
    baseStyle()+'<h3 class="gfield-final3-solution-diagram__title">'+esc(title)+'</h3>'+body+
    '<div class="gfield-final3-solution-diagram__summary">'+summary+'</div>'+
  '</figure>';
}

function fruitIcon(symbol,x,y){
  if(symbol==='A'){
    return '<g data-fruit="A" aria-label="사과"><circle cx="'+x+'" cy="'+y+'" r="11" fill="#E96A62" stroke="#5D2730" stroke-width="1.6"></circle><path d="M '+x+' '+(y-10)+' q 2 -9 8 -10" fill="none" stroke="#4B3827" stroke-width="2"></path><ellipse cx="'+(x+8)+'" cy="'+(y-17)+'" rx="5" ry="2.8" fill="#5E9B62" transform="rotate(-20 '+(x+8)+' '+(y-17)+')"></ellipse></g>';
  }
  return '<g data-fruit="B" aria-label="바나나"><path d="M '+(x-13)+' '+(y-8)+' Q '+x+' '+(y+16)+' '+(x+15)+' '+(y-8)+' Q '+(x+5)+' '+(y+5)+' '+(x-8)+' '+(y-13)+' Z" fill="#F4C84A" stroke="#6F5A20" stroke-width="1.6"></path><path d="M '+(x-10)+' '+(y-12)+' l -3 -3 M '+(x+15)+' '+(y-8)+' l 3 -2" stroke="#6F5A20" stroke-width="2" stroke-linecap="round"></path></g>';
}

function renderFruit(model,result){
  const rowYs=[38,98,158,218,278];
  const positions=result.shownRows.map(row=>{
    const gap=52;
    const width=(row.length-1)*gap;
    return row.map((_,index)=>220-width/2+index*gap);
  });
  let links='';
  for(let row=0;row<result.shownRows.length-1;row++){
    let childIndex=0;
    result.shownRows[row].forEach((symbol,parentIndex)=>{
      const children=model.rules[symbol];
      children.forEach(()=>{
        links+='<line x1="'+positions[row][parentIndex]+'" y1="'+(rowYs[row]+14)+'" x2="'+positions[row+1][childIndex]+'" y2="'+(rowYs[row+1]-15)+'" stroke="#8A94A5" stroke-width="1.6" vector-effect="non-scaling-stroke"></line>';
        childIndex++;
      });
    });
  }
  const rows=result.shownRows.map((row,rowIndex)=>{
    const counts=countSymbols(row);
    const icons=row.map((symbol,index)=>fruitIcon(symbol,positions[rowIndex][index],rowYs[rowIndex])).join('');
    return '<g data-row="'+(rowIndex+1)+'"><text x="14" y="'+(rowYs[rowIndex]+5)+'" fill="#172033" font-size="16" font-weight="800">'+(rowIndex+1)+'번째 줄</text>'+icons+'<text x="345" y="'+(rowYs[rowIndex]+5)+'" fill="#526071" font-size="14" font-weight="700">바 '+(counts.B||0)+' · 사 '+(counts.A||0)+'</text></g>';
  }).join('');
  const svg='<svg viewBox="0 0 440 320" role="img" aria-label="바나나는 다음 줄의 사과 하나로, 사과는 바나나 하나와 사과 하나로 갈라지는 첫 다섯 줄">'+links+rows+'</svg>';
  return figure(model,'1번 · 과일이 바뀌는 첫 다섯 줄',svg,
    '바나나 → 사과, 사과 → 바나나+사과. 이 규칙을 14번째 줄까지 이어서 <strong>바나나 '+result.targetCounts.B+'개, 사과 '+result.targetCounts.A+'개</strong>를 얻습니다.');
}

function renderTiles(model,result){
  const cards=result.stages.map(stage=>{
    const cell=16,center=75;
    const cells=stage.cells.map(item=>{
      const x=center+item.x*cell-cell/2,y=center+item.y*cell-cell/2;
      const fill=item.color==='black'?'#20242B':'#FFFFFF';
      const stroke=item.isNew?'#2463C5':'#8A94A5';
      return '<rect data-ring="'+item.ring+'" data-new="'+item.isNew+'" x="'+x+'" y="'+y+'" width="'+cell+'" height="'+cell+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+(item.isNew?2.4:1.2)+'" vector-effect="non-scaling-stroke"></rect>';
    }).join('');
    const color=stage.stage%2===0?'검은':'흰';
    return '<div class="gfield-final3-solution-diagram__card"><svg viewBox="0 0 150 150" role="img" aria-label="'+stage.stage+'회까지 붙인 타일, '+stage.stage+'회 새 타일 '+stage.addedCount+'개">'+cells+'</svg><div class="gfield-final3-solution-diagram__label">'+stage.stage+'회 · 새 '+color+' 타일 '+stage.addedCount+'개</div></div>';
  }).join('');
  const body='<div class="gfield-final3-solution-diagram__grid gfield-final3-solution-diagram__grid--q3" style="grid-template-columns:repeat(4,minmax(0,1fr))">'+cards+'</div>';
  return figure(model,'3번 · 한 회에 새로 붙는 바깥 고리',body,
    '파란 테두리가 그 회에 새로 붙는 타일입니다. <strong>'+result.target.round+'회는 '+(result.target.color==='black'?'검은':'흰')+' 타일 '+result.target.addedCount+'개</strong>입니다.');
}

const FINGER_LAYOUT={
  left:{
    label:'왼손',thumbSide:'right',target:null,
    fingers:[
      {name:'소지',x:66,y:80,numbers:'5'},{name:'약지',x:103,y:47,numbers:'4 · 6'},
      {name:'중지',x:142,y:15,numbers:'3 · 7'},{name:'검지',x:181,y:58,numbers:'2 · 8 · 20'},
      {name:'엄지',x:251,y:115,numbers:'1 · 9 · 19'}
    ]
  },
  right:{
    label:'오른손',thumbSide:'left',target:'중지',
    fingers:[
      {name:'엄지',x:76,y:115,numbers:'10 · 18'},{name:'검지',x:145,y:58,numbers:'11 · 17'},
      {name:'중지',x:184,y:15,numbers:'12 · 16'},{name:'약지',x:223,y:58,numbers:'13 · 15'},
      {name:'소지',x:260,y:80,numbers:'14'}
    ]
  }
};

function handShape(side){
  const mirrored=side==='right';
  const transform=mirrored?'translate(330 0) scale(-1 1)':'';
  return '<g transform="'+transform+'" fill="#F5C9AD" stroke="#8A5C48" stroke-width="1.5">'+
    '<rect x="105" y="112" width="112" height="105" rx="38"></rect><rect x="52" y="79" width="28" height="105" rx="14"></rect><rect x="89" y="47" width="28" height="128" rx="14"></rect><rect x="128" y="29" width="28" height="145" rx="14"></rect><rect x="167" y="47" width="28" height="128" rx="14"></rect><rect x="201" y="121" width="70" height="31" rx="15" transform="rotate(-30 201 121)"></rect></g>';
}

function renderHandCard(side){
  const layout=FINGER_LAYOUT[side];
  const labels=layout.fingers.map(finger=>{
    const target=layout.target===finger.name;
    return '<g data-hand="'+layout.label+'" data-finger="'+finger.name+'">'+
      (target?'<rect x="'+(finger.x-31)+'" y="'+(finger.y-17)+'" width="62" height="38" rx="9" fill="#E7F0FF" stroke="#2463C5" stroke-width="2"></rect>':'')+
      '<text x="'+finger.x+'" y="'+finger.y+'" text-anchor="middle" fill="'+(target?'#174A96':'#172033')+'" font-size="14" font-weight="900">'+finger.numbers+'</text>'+
      '<text x="'+finger.x+'" y="'+(finger.y+17)+'" text-anchor="middle" fill="#526071" font-size="11.5" font-weight="700">'+finger.name+'</text></g>';
  }).join('');
  return '<div class="gfield-final3-solution-diagram__card"><svg viewBox="0 0 330 245" role="img" aria-label="'+layout.label+' 손가락과 그 손가락에서 세는 번호">'+handShape(side)+labels+'<text x="165" y="235" text-anchor="middle" fill="#172033" font-size="16" font-weight="900">'+layout.label+'</text></svg></div>';
}

function renderFingers(model,result){
  const body='<div class="gfield-final3-solution-diagram__grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+renderHandCard('left')+renderHandCard('right')+'</div>';
  return figure(model,'4번 · 1~18이 반복되는 손가락 자리',body,
    '19는 다시 왼손 엄지, 20은 왼손 검지입니다. 3000=18×166+<strong>'+result.remainder+'</strong>이므로 12번째 자리인 <strong>'+esc(result.position)+'</strong>입니다.');
}

function foldStageSvg(stage,model){
  const outer='<rect x="30" y="18" width="90" height="135" fill="#FFF" stroke="#5E6878" stroke-width="1.5"></rect>';
  const dotted='<rect x="30" y="18" width="90" height="90" fill="none" stroke="#8A94A5" stroke-width="1.4" stroke-dasharray="3 3"></rect>';
  const bottom='<rect x="30" y="108" width="90" height="45" fill="#FFF" stroke="#5E6878" stroke-width="1.5"></rect>';
  let content='';
  if(stage===1) content=outer;
  if(stage===2) content=dotted+bottom+'<polygon points="30,108 120,18 120,108" fill="#D8DDE5" stroke="#5E6878" stroke-width="1.5"></polygon><line x1="30" y1="108" x2="120" y2="18" stroke="#2463C5" stroke-width="1.6" stroke-dasharray="5 3"></line>';
  if(stage===3) content=dotted+bottom+'<polygon points="30,108 75,63 120,108" fill="#C9D0DA" stroke="#5E6878" stroke-width="1.5"></polygon><line x1="75" y1="63" x2="120" y2="108" stroke="#2463C5" stroke-width="1.6" stroke-dasharray="5 3"></line>';
  if(stage===4){
    const cuts=model.cuts.map((cut,index)=>{
      const x=30+Number(cut.center[0])*45,y=18+Number(cut.center[1])*45;
      if(cut.shape==='full-circle') return '<circle data-cut-shape="full-circle" data-cut-index="'+index+'" cx="'+x+'" cy="'+y+'" r="4.2" fill="#161A20"></circle>';
      return '<path data-cut-shape="semicircle-on-final-crease" data-cut-index="'+index+'" d="M '+(x-7)+' '+y+' A 7 7 0 0 0 '+(x+7)+' '+y+' Z" fill="#161A20"></path>';
    }).join('');
    content='<rect x="30" y="18" width="90" height="135" fill="#FFF" stroke="#8A94A5" stroke-width="1.4" stroke-dasharray="3 3"></rect><rect x="30" y="63" width="90" height="45" fill="#D1D6DE" stroke="#5E6878" stroke-width="1.5"></rect><polygon points="30,108 75,63 120,108" fill="#B9C1CD" opacity=".8"></polygon><line data-final-crease="true" x1="30" y1="108" x2="120" y2="108" stroke="#2463C5" stroke-width="2" stroke-dasharray="5 3"></line>'+cuts;
  }
  return '<svg viewBox="0 0 150 175" role="img" aria-label="접기 '+stage+'단계">'+content+'</svg>';
}

function unfoldedCreaseSvg(result){
  const sx=x=>30+x*45,sy=y=>15+y*45;
  const incomplete=result.creaseUnfolding.outerIncompleteSemicirclePoints.map((point,index)=>'<circle data-unfolded-incomplete="'+index+'" cx="'+sx(point[0])+'" cy="'+sy(point[1])+'" r="8" fill="#4E5969" clip-path="url(#q6-paper-clip)"></circle>').join('');
  const full=result.creaseUnfolding.completeCirclePoint;
  return '<svg viewBox="0 0 150 190" role="img" aria-label="반원 표시를 완전히 펼치면 안쪽에서 원 하나가 이어지고 위, 왼쪽, 오른쪽 바깥선에는 반원 세 곳이 남는다">'+
    '<defs><clipPath id="q6-paper-clip"><rect x="30" y="15" width="90" height="135"></rect></clipPath></defs>'+
    '<rect x="30" y="15" width="90" height="135" fill="#FFF" stroke="#5E6878" stroke-width="1.5"></rect><line x1="30" y1="105" x2="120" y2="105" stroke="#8A94A5" stroke-width="1.3" stroke-dasharray="4 3"></line>'+incomplete+
    '<circle data-unfolded-complete="true" cx="'+sx(full[0])+'" cy="'+sy(full[1])+'" r="8" fill="#2463C5" stroke="#FFF" stroke-width="1.5"></circle>'+
    '<text x="75" y="168" text-anchor="middle" fill="#172033" font-size="12.5" font-weight="800">안쪽 원 1 · 외곽 반원 3</text><text x="75" y="184" text-anchor="middle" fill="#526071" font-size="10.5" font-weight="700">위·왼쪽·오른쪽 바깥선</text></svg>';
}

function renderFold(model,result){
  const labels=['처음 종이','① 첫 대각 접기','② 둘째 대각 접기','③ 아래를 위로 접은 뒤 오리기'];
  const cards=labels.map((label,index)=>'<div class="gfield-final3-solution-diagram__card">'+foldStageSvg(index+1,model)+'<div class="gfield-final3-solution-diagram__label">'+label+'</div></div>').join('');
  const body='<div class="gfield-final3-solution-diagram__grid gfield-final3-solution-diagram__grid--q6" style="grid-template-columns:repeat(4,minmax(0,1fr))">'+cards+'</div><div class="gfield-final3-solution-diagram__card" style="width:min(100%,15rem);margin:.65rem auto 0">'+unfoldedCreaseSvg(result)+'<div class="gfield-final3-solution-diagram__label">반원 자국만 완전히 펼쳐 확인</div></div>';
  return figure(model,'6번 · 세 번 접은 모양과 다섯 오림 표시',body,
    '완전한 원 4곳×5겹=20개입니다. 접는 선의 반원은 안쪽 두 반원이 이어져 원 1개가 되고, 나머지는 원본 종이의 위·왼쪽·오른쪽 바깥선에 반원으로 남습니다. 따라서 완전한 원은 <strong>'+result.unfoldedCompleteCircles+'개</strong>입니다.');
}

function shapeSvg(shape,x,y,size){
  if(shape==='circle') return '<circle data-shape="circle" cx="'+x+'" cy="'+y+'" r="'+size+'" fill="#C8B66D" stroke="#5A5130" stroke-width="1.3"></circle>';
  if(shape==='square') return '<rect data-shape="square" x="'+(x-size)+'" y="'+(y-size)+'" width="'+(size*2)+'" height="'+(size*2)+'" fill="#B8AA65" stroke="#5A5130" stroke-width="1.3"></rect>';
  return '<polygon data-shape="triangle" points="'+x+','+(y-size-2)+' '+(x-size-2)+','+(y+size)+' '+(x+size+2)+','+(y+size)+'" fill="#D0C178" stroke="#5A5130" stroke-width="1.3"></polygon>';
}

function panShapes(side,centerX,beamY){
  const entries=[];
  Object.keys(side||{}).forEach(shape=>{
    for(let i=0;i<Number(side[shape]);i++) entries.push(shape);
  });
  return entries.map((shape,index)=>{
    const row=index>=3?1:0;
    const col=row?index-3:index;
    const inRow=row?entries.length-3:Math.min(entries.length,3);
    const x=centerX+(col-(inRow-1)/2)*23;
    const y=beamY+(row?0:19);
    return shapeSvg(shape,x,y,8);
  }).join('');
}

function balanceSvg(figure,index,target){
  const tilted=figure.relation==='lighter-than';
  const leftBeamY=tilted?86:96,rightBeamY=tilted?106:96;
  const leftX=58,rightX=192;
  const addition=index===2?'<g data-target-addition="circle-1"><circle cx="58" cy="'+(leftBeamY-63)+'" r="11" fill="#E7F0FF" stroke="#2463C5" stroke-width="2" stroke-dasharray="4 2"></circle><text x="76" y="'+(leftBeamY-59)+'" fill="#174A96" font-size="13" font-weight="900">+1개</text></g>':'';
  return '<svg viewBox="0 0 250 180" role="img" aria-label="저울 그림 '+(index+1)+'">'+
    '<line x1="'+leftX+'" y1="'+leftBeamY+'" x2="'+rightX+'" y2="'+rightBeamY+'" stroke="#4E5969" stroke-width="3"></line><polygon points="125,112 105,153 145,153" fill="#D4D9E1" stroke="#4E5969" stroke-width="1.5"></polygon><circle cx="125" cy="'+((leftBeamY+rightBeamY)/2)+'" r="5" fill="#4E5969"></circle>'+
    '<line x1="'+leftX+'" y1="'+leftBeamY+'" x2="'+leftX+'" y2="'+(leftBeamY+28)+'" stroke="#7A8492" stroke-width="1.4"></line><path d="M '+(leftX-38)+' '+(leftBeamY+28)+' Q '+leftX+' '+(leftBeamY+43)+' '+(leftX+38)+' '+(leftBeamY+28)+'" fill="none" stroke="#4E5969" stroke-width="1.8"></path>'+
    '<line x1="'+rightX+'" y1="'+rightBeamY+'" x2="'+rightX+'" y2="'+(rightBeamY+28)+'" stroke="#7A8492" stroke-width="1.4"></line><path d="M '+(rightX-38)+' '+(rightBeamY+28)+' Q '+rightX+' '+(rightBeamY+43)+' '+(rightX+38)+' '+(rightBeamY+28)+'" fill="none" stroke="#4E5969" stroke-width="1.8"></path>'+
    panShapes(figure.left,leftX,leftBeamY)+panShapes(figure.right,rightX,rightBeamY)+addition+
    '<text x="125" y="172" text-anchor="middle" fill="#172033" font-size="15" font-weight="900">그림 '+(index+1)+'</text></svg>';
}

function renderBalance(model,result){
  const cards=model.figures.map((figure,index)=>'<div class="gfield-final3-solution-diagram__card">'+balanceSvg(figure,index,model.targetAddition)+'</div>').join('');
  const body='<div class="gfield-final3-solution-diagram__grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">'+cards+'</div>';
  return figure(model,'7번 · 두 평형을 같은 동그라미 무게로 바꾸기',body,
    '그림 2에서 □를 양쪽에서 지우면 △=○ 5개. 그림 1에서 □=○ 3개입니다. 그림 3은 왼쪽 9, 오른쪽 10이므로 왼쪽에 <strong>○ 1개</strong>를 더합니다.');
}

function mountainPanel(model,result,leg){
  const part=leg==='first'?result.first:result.second;
  const colors=leg==='first'?{line:'#526071',count:'#174A96',accent:'#2463C5'}:{line:'#526071',count:'#176342',accent:'#16805A'};
  const sx=x=>28+x*46,sy=y=>286-y*48;
  const lines=result.edges.map((edge,index)=>'<line data-road-edge="'+index+'" x1="'+sx(edge[0][0])+'" y1="'+sy(edge[0][1])+'" x2="'+sx(edge[1][0])+'" y2="'+sy(edge[1][1])+'" stroke="'+colors.line+'" stroke-width="1.6" vector-effect="non-scaling-stroke"></line>').join('');
  const counts=part.counts.map(entry=>{
    let dx=0,dy=0;
    if(same(entry.point,part.start)){ dx=14; dy=leg==='first'?-12:0; }
    if(same(entry.point,part.end)){ dx=leg==='first'?14:-2; dy=leg==='first'?0:-16; }
    const x=sx(entry.point[0])+dx,y=sy(entry.point[1])+dy,width=String(entry.count).length*10+8;
    return '<g data-count-node="'+pointKey(entry.point)+'"><rect x="'+(x-width/2)+'" y="'+(y-12)+'" width="'+width+'" height="23" rx="3" fill="#FFF" opacity=".96"></rect><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" fill="'+colors.count+'" font-size="18" font-weight="900">'+entry.count+'</text></g>';
  }).join('');
  const pointDots=Object.keys(model.points).map(key=>{
    const point=model.points[key];
    return '<circle data-point-dot="'+key+'" cx="'+sx(point[0])+'" cy="'+sy(point[1])+'" r="5" fill="'+colors.accent+'" stroke="#FFF" stroke-width="2"></circle>';
  }).join('');
  const pointLabels=Object.keys(model.points).map(key=>{
    const point=model.points[key];
    const dx=key==='A'?-13:(key==='C'?13:0),dy=key==='B'?-28:(key==='C'?32:24);
    return '<text data-point-label="'+key+'" x="'+(sx(point[0])+dx)+'" y="'+(sy(point[1])+dy)+'" text-anchor="middle" fill="#172033" font-size="17" font-weight="900">'+key+'</text>';
  }).join('');
  const aria=leg==='first'?'A에서 B까지 오른쪽과 위쪽으로 가는 누적 수':'B에서 C까지 오른쪽과 아래쪽으로 가는 누적 수';
  return '<svg viewBox="0 0 470 325" role="img" aria-label="'+aria+'">'+lines+pointDots+counts+pointLabels+'</svg>';
}

function renderMountain(model,result){
  const body='<div class="gfield-final3-solution-diagram__grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="gfield-final3-solution-diagram__card">'+mountainPanel(model,result,'first')+'<div class="gfield-final3-solution-diagram__label">① A→B · 이동은 오른쪽·위쪽<br>누적은 왼쪽·아래의 수 · '+result.first.total+'가지</div></div><div class="gfield-final3-solution-diagram__card">'+mountainPanel(model,result,'second')+'<div class="gfield-final3-solution-diagram__label">② B→C · 이동은 오른쪽·아래쪽<br>누적은 왼쪽·위의 수 · '+result.second.total+'가지</div></div></div>';
  return figure(model,'8번 · 9·7·5·3·1칸 산길의 두 최단 구간',body,
    'A→B는 각 점에서 왼쪽·아래의 수를, B→C는 왼쪽·위의 수를 더합니다. 전체는 <strong>'+result.first.total+'×'+result.second.total+'='+result.combined+'가지</strong>입니다.');
}

function pointyHexPoints(cx,cy,r,w){
  return [[cx,cy-r],[cx+w,cy-r/2],[cx+w,cy+r/2],[cx,cy+r],[cx-w,cy+r/2],[cx-w,cy-r/2]].map(point=>point.join(',')).join(' ');
}

function renderHoneycomb(model,result){
  const top=model.nodes.top,bottom=model.nodes.bottom;
  const r=31,w=Math.sqrt(3)*r/2,step=2*w,topY=42,bottomY=topY+1.5*r,topStart=30,bottomStart=topStart+w;
  const countByNode=new Map(result.order.map((node,index)=>[node,result.pathCounts[index]]));
  const cells=[];
  top.forEach((node,index)=>cells.push({node,cx:topStart+index*step,cy:topY,row:'top'}));
  bottom.forEach((node,index)=>cells.push({node,cx:bottomStart+index*step,cy:bottomY,row:'bottom'}));
  const cellByNode=new Map(cells.map(cell=>[cell.node,cell]));
  const polygons=cells.map(cell=>'<g data-honey-node="'+cell.node+'" data-row="'+cell.row+'"><polygon points="'+pointyHexPoints(cell.cx,cell.cy,r,w)+'" fill="#FFF" stroke="#526071" stroke-width="1.7" vector-effect="non-scaling-stroke"></polygon><text x="'+cell.cx+'" y="'+(cell.cy-11)+'" text-anchor="middle" fill="#172033" font-size="17" font-weight="900">'+cell.node+'</text><text x="'+cell.cx+'" y="'+(cell.cy+15)+'" text-anchor="middle" fill="#174A96" font-size="17" font-weight="900">'+countByNode.get(cell.node)+'</text></g>').join('');
  const passages=Object.values(model.edges).flat().map(edge=>{
    const first=cellByNode.get(edge[0]),second=cellByNode.get(edge[1]);
    return '<circle data-passage-edge="'+edge.join('|')+'" cx="'+((first.cx+second.cx)/2)+'" cy="'+((first.cy+second.cy)/2)+'" r="3.6" fill="#FFF"></circle>';
  }).join('');
  const svg='<svg viewBox="0 0 412 160" role="img" aria-label="'+result.order[0]+'에서 파까지 두 줄로 이어진 열네 벌집 칸과 각 칸까지 오는 방법 수">'+polygons+passages+'<text x="206" y="153" text-anchor="middle" fill="#526071" font-size="15" font-weight="700">파란 수 = 오는 방법 수 · 앞의 두 방 수를 더하기</text></svg>';
  return figure(model,'13번 · 두 줄 벌집의 공유 변과 앞으로 가는 순서',svg,
    '윗줄과 아랫줄이 반 칸 어긋나 있어 다음 글자 또는 그다음 글자로 이어집니다. 파 칸의 누적 수는 <strong>'+result.pathCounts[result.pathCounts.length-1]+'가지</strong>입니다.');
}

function renderModel(model){
  const result=calculate(model);
  if(!result||!result.valid) return '';
  if(model.id==='final3-q1-fruit-branch-recurrence-v1') return renderFruit(model,result);
  if(model.id==='final3-q3-alternating-tile-rings-v1') return renderTiles(model,result);
  if(model.id==='final3-q4-finger-cycle-v1') return renderFingers(model,result);
  if(model.id==='final3-q6-folded-paper-five-layers-v1') return renderFold(model,result);
  if(model.id==='final3-q7-balance-equations-v1') return renderBalance(model,result);
  if(model.id==='final3-q8-stepped-mountain-paths-v1') return renderMountain(model,result);
  if(model.id==='final3-q13-honeycomb-forward-paths-v1') return renderHoneycomb(model,result);
  return '';
}

function modelFor(no){
  no=Number(no);
  return Number.isInteger(no)&&MODEL['q'+no]?MODEL['q'+no]:null;
}

function calculateForNo(no){
  var model=modelFor(no);
  return model?calculate(model):null;
}

function renderForNo(no){
  var model=modelFor(no);
  return model?renderModel(model):'';
}

root.GFIELD_FINAL3_SOLUTION_DIAGRAMS=deepFreeze({
  contract:{
    schemaVersion:1,
    round:3,
    expectedNos:[1,3,4,6,7,8,13],
    evidenceStatus:'verified',
    independentReviewStatus:'verified',
    releaseStatus:'locked'
  },
  supportedIds:SUPPORTED_IDS.slice(),
  models:MODEL,
  modelFor:modelFor,
  calculate:calculateForNo,
  render:renderForNo
});
})(typeof window!=='undefined'?window:globalThis);
