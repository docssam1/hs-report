'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const sharp=require('sharp');

const ROOT=path.resolve(__dirname,'..');
const PRIVATE=path.join(ROOT,'.private-work','final2-similar');
const DATA_PATH=path.join(ROOT,'bank','data','final2-fixed90.json');
const INDEX_PATH=path.join(ROOT,'bank','data','final2-fixed90-index.json');
const BATCHES=['01-10','11-20','21-30'];
const VISUAL_SOURCES=new Set([2,5,9,12,13,16,17,25,28]);

function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function hash(value){return crypto.createHash('sha256').update(value).digest('hex');}
function fileHash(filename){return hash(fs.readFileSync(path.join(ROOT,filename)));}
function svg(width,height,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g stroke="#182230" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;}
function line(a,b,extra=''){return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${extra}/>`;}
function textAt(x,y,value,size=15,extra=''){return `<text x="${x}" y="${y}" fill="#182230" stroke="none" font-family="Noto Sans KR,Arial,sans-serif" font-size="${size}" text-anchor="middle" dominant-baseline="middle" ${extra}>${esc(value)}</text>`;}

function chainSvg(spec){
  const cells=spec.cellCoordinates.map(row=>({x:row[1],y:row[2]}));
  const project=([x,y])=>[(x+y)*24,(y-x)*24];
  const polys=cells.map(cell=>[[cell.x,cell.y],[cell.x+1,cell.y],[cell.x+1,cell.y+1],[cell.x,cell.y+1]].map(project));
  const points=polys.flat(),minX=Math.min(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));
  const shifted=polys.map(poly=>poly.map(([x,y])=>[x-minX+24,y-minY+24]));
  const width=Math.ceil(Math.max(...shifted.flat().map(p=>p[0]))+24),height=Math.ceil(Math.max(...shifted.flat().map(p=>p[1]))+24);
  return {width,height,svg:svg(width,height,shifted.map(poly=>`<polygon points="${poly.map(p=>p.join(',')).join(' ')}" fill="white"/>`).join(''))};
}

function mapSvg(spec){
  const vertices=spec.vertices,regions=spec.regions;
  const body=regions.map((region,index)=>{
    const pts=region.polygon.map(name=>vertices[name]);
    const cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cy=pts.reduce((s,p)=>s+p[1],0)/pts.length;
    return `<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${index%2?'#f7f9fc':'white'}"/>${textAt(cx,cy,region.id,15)}`;
  }).join('');
  return {width:220,height:220,svg:svg(220,220,`<g transform="translate(10 10)">${body}</g>`)};
}

function cloudMapSvg(spec){
  const dividers=spec.dividerPaths||[];
  const boundaries=[
    `<path data-map-outline="" d="${esc(spec.outlinePath)}" fill="white" stroke="#566274" stroke-width="3"/>`,
    `<path data-center-country="${esc(spec.centerCountry)}" d="${esc(spec.centerPath)}" fill="white" stroke="#566274" stroke-width="2.6"/>`,
    ...dividers.map((path,index)=>`<path data-curved-divider="${index+1}" d="${esc(path)}" fill="none" stroke="#566274" stroke-width="2.6"/>`)
  ].join('');
  const labels=(spec.labels||[]).map(label=>textAt(label.point[0],label.point[1],label.id,16,'font-weight="700"')).join('');
  return {width:220,height:220,svg:svg(220,220,boundaries+labels)};
}

function cubeProject([x,y,z]){return [55+x*105+y*45,145+y*32-z*90];}
function cuboidSvg(spec){
  const vertices=spec.vertices;
  const body=spec.edges.map(edge=>line(cubeProject(vertices[edge[0]]),cubeProject(vertices[edge[1]]))).join('')+
    Object.entries(vertices).map(([label,p])=>{const [x,y]=cubeProject(p);return `<circle cx="${x}" cy="${y}" r="3" fill="#182230"/>${textAt(x+(x<120?-12:12),y+(y<80?-12:14),label,14)}`;}).join('');
  return {width:270,height:220,svg:svg(270,220,body)};
}

function prismProject([x,y,z]){return [45+x*34+y*18,170-y*14-z*38];}
function prismEdges(size){
  const [w,d,h]=size,c=[];
  for(const x of [0,w])for(const y of [0,d])c.push([[x,y,0],[x,y,h]]);
  for(const z of [0,h]){
    c.push([[0,0,z],[w,0,z]],[[0,d,z],[w,d,z]],[[0,0,z],[0,d,z]],[[w,0,z],[w,d,z]]);
  }
  return c;
}
function projectionSvg(spec,solution=false){
  const prompt=spec.promptModel;
  if(solution){
    const points=spec.solutionModel.projection2d,maxX=prompt.solid.size[0],maxY=prompt.solid.size[1],sx=190/maxX,sy=130/maxY;
    const p=([x,y])=>[30+x*sx,165-y*sy];
    const path=points.map((pt,i)=>(i?'L':'M')+p(pt).join(' ')).join(' ');
    const body=`<rect x="30" y="35" width="190" height="130" fill="white"/><path d="${path}" stroke="#2456c4" stroke-width="5" fill="none"/>`+textAt(125,16,'위에서 본 굵은 선',14);
    return {width:250,height:190,svg:svg(250,190,body)};
  }
  const edges=prismEdges(prompt.solid.size).map(edge=>line(prismProject(edge[0]),prismProject(edge[1]),'stroke="#8a95a6"')).join('');
  const path=prompt.path3d.map((pt,i)=>(i?'L':'M')+prismProject(pt).join(' ')).join(' ');
  const arrow='<line x1="150" y1="10" x2="150" y2="42" stroke="#2456c4" stroke-width="3"/><polygon points="144,34 156,34 150,45" fill="#2456c4" stroke="none"/>';
  return {width:300,height:220,svg:svg(300,220,edges+`<path d="${path}" stroke="#182230" stroke-width="5" fill="none"/>`+arrow)};
}

function gridSvg(spec){
  const m=spec.promptModel,maxX=m.maxX,maxY=m.maxY,s=Math.min(42,210/Math.max(maxX,maxY)),origin=[28,24];
  const p=([x,y])=>[origin[0]+x*s,origin[1]+(maxY-y)*s];
  const edgeKey=(a,b)=>[a.join(','),b.join(',')].sort().join('|');
  const blocked=new Set((m.blockedEdges||[]).map(edge=>edgeKey(edge[0],edge[1]))),parts=[];
  for(let y=0;y<=maxY;y++)for(let x=0;x<maxX;x++){const a=[x,y],b=[x+1,y];if(!blocked.has(edgeKey(a,b)))parts.push(line(p(a),p(b)));}
  for(let x=0;x<=maxX;x++)for(let y=0;y<maxY;y++){const a=[x,y],b=[x,y+1];if(!blocked.has(edgeKey(a,b)))parts.push(line(p(a),p(b)));}
  Object.entries(m.points).forEach(([label,point])=>{const [x,y]=p(point);parts.push(`<circle cx="${x}" cy="${y}" r="5" fill="#2456c4" stroke="white"/>${textAt(x,y-13,label,14,'font-weight="700"')}`);});
  return {width:origin[0]*2+maxX*s,height:origin[1]*2+maxY*s,svg:svg(origin[0]*2+maxX*s,origin[1]*2+maxY*s,parts.join(''))};
}

function tilingSvg(spec){
  const m=spec.promptModel,board=m.board,cell=Math.min(30,150/board.width),bx=205,by=30,parts=[];
  parts.push(textAt(80,18,'주어진 조각',14),textAt(bx+board.width*cell/2,18,'맞출 정사각형',14));
  let cursor=24;
  m.pieces.forEach(piece=>{
    const maxX=Math.max(...piece.shape.map(p=>p[0])),maxY=Math.max(...piece.shape.map(p=>p[1]));
    piece.shape.forEach(([x,y])=>parts.push(`<rect x="${cursor+x*24}" y="${45+y*24}" width="24" height="24" fill="white"/>`));
    cursor+=Math.max(62,(maxX+1)*24+34);
  });
  for(let x=0;x<=board.width;x++)parts.push(line([bx+x*cell,by],[bx+x*cell,by+board.height*cell],'stroke="#64748b"'));
  for(let y=0;y<=board.height;y++)parts.push(line([bx,by+y*cell],[bx+board.width*cell,by+y*cell],'stroke="#64748b"'));
  const width=bx+board.width*cell+25,height=Math.max(155,by+board.height*cell+20);
  return {width,height,svg:svg(width,height,parts.join(''))};
}

function balanceSvg(spec){
  const rows=spec.promptModel.weighings,parts=[];
  rows.forEach((row,index)=>{
    const cy=42+index*72,tilt=row.outcome==='balance'?0:(row.outcome==='left-up'?8:-8);
    const leftY=cy-tilt,rightY=cy+tilt;
    parts.push(line([70,leftY],[250,rightY],'stroke-width="3"'),line([160,cy],[160,cy+25]),`<polygon points="145,${cy+38} 175,${cy+38} 160,${cy+25}" fill="white"/>`);
    const balls=(values,start,end,y)=>values.map((value,i)=>{const x=start+(end-start)*(i+.5)/values.length;return `<circle cx="${x}" cy="${y-14}" r="10" fill="white"/>${textAt(x,y-14,value,10)}`;}).join('');
    parts.push(balls(row.left,35,135,leftY),balls(row.right,185,285,rightY));
  });
  return {width:320,height:235,svg:svg(320,235,parts.join(''))};
}

function triangleStage(n,offsetX,offsetY,scale){
  const h=scale*Math.sqrt(3)/2,width=(n+1)*scale,parts=[];
  const topLeft=[offsetX,offsetY+h],topPeak=[offsetX+scale/2,offsetY],topRightPeak=[offsetX+width-scale/2,offsetY],topRight=[offsetX+width,offsetY+h];
  parts.push(`<polygon points="${[topLeft,topPeak,topRightPeak,topRight].map(p=>p.join(',')).join(' ')}" fill="white"/>`,line(topLeft,topRight));
  for(let i=1;i<=n;i++)parts.push(line([offsetX+i*scale,offsetY+h],[offsetX+(i-.5)*scale,offsetY]));
  for(let i=1;i<=n;i++)parts.push(line([offsetX+i*scale,offsetY+h],[offsetX+(i+.5)*scale,offsetY]));
  const bottom=[offsetX+width/2,offsetY+h+(n+1)*h];
  parts.push(`<polygon points="${topLeft.join(',')} ${topRight.join(',')} ${bottom.join(',')}" fill="white"/>`);
  for(let row=1;row<=n;row++){
    const y=offsetY+h+row*h,left=offsetX+row*scale/2,right=offsetX+width-row*scale/2;
    parts.push(line([left,y],[right,y]));
  }
  for(let i=1;i<=n;i++){
    parts.push(line([offsetX+i*scale,offsetY+h],bottom));
    parts.push(line([offsetX+width-i*scale,offsetY+h],bottom));
  }
  return parts.join('');
}
function triangleSequenceSvg(spec){
  const stages=spec.visibleStages,parts=[],panel=170;
  stages.forEach((n,index)=>{const scale=26-n*2,x=index*panel+25;parts.push(triangleStage(n,x,24,scale),textAt(x+(n+1)*scale/2,178,spec.visibleLabels[index],13));});
  return {width:stages.length*panel,height:200,svg:svg(stages.length*panel,200,parts.join(''))};
}

function roadGraphSvg(spec){
  const vertices=spec.vertices,parts=[],edges=[];
  spec.edgeGroups.forEach(group=>(group.edges||[]).forEach(item=>{
    if(typeof item==='string')edges.push({edge:item,weight:group.weight});else edges.push(item);
  }));
  const p=point=>[30+point[0]*3.15,18+point[1]*2.45];
  edges.forEach(item=>{
    const a=item.edge[0],b=item.edge[1],pa=p(vertices[a]),pb=p(vertices[b]),mx=(pa[0]+pb[0])/2,my=(pa[1]+pb[1])/2;
    parts.push(line(pa,pb,'stroke="#64748b" stroke-width="2.5"'),`<rect x="${mx-11}" y="${my-10}" width="22" height="20" rx="4" fill="white" stroke="none"/>`,textAt(mx,my,item.weight,14,'font-weight="600"'));
  });
  Object.entries(vertices).forEach(([label,point])=>{const [x,y]=p(point);parts.push(`<circle cx="${x}" cy="${y}" r="6" fill="#2456c4" stroke="white"/>${textAt(x,y-16,label,16,'font-weight="700"')}`);});
  return {width:375,height:275,svg:svg(375,275,parts.join(''))};
}

// Answer-only overlay: use the exact prompt coordinates and weights, not a new map.
function roadSolution(item){
  const spec=item.assetSpec,parameters=item.meta.parameters;
  const edges=spec.edgeGroups.flatMap(group=>group.edges.map(edge=>typeof edge==='string'?{edge,weight:group.weight}:edge));
  const key=edge=>edge.split('').sort().join('');
  const repeated=new Set(parameters.minimumPairing.map(pair=>pair.slice().sort().join('')));
  const short=edges.filter(edge=>repeated.has(key(edge.edge)));
  const odd=new Set(parameters.oddVertices);
  const p=point=>[30+point[0]*3.15,18+point[1]*2.45];
  const parts=[];
  edges.forEach(edge=>{
    const a=p(spec.vertices[edge.edge[0]]),b=p(spec.vertices[edge.edge[1]]),twice=repeated.has(key(edge.edge));
    parts.push(line(a,b,`stroke="${twice?'#2456C4':'#566274'}" stroke-width="${twice?7:2.5}"`));
    if(twice)parts.push(line(a,b,'stroke="white" stroke-width="2" stroke-dasharray="5 4"'));
    const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;
    parts.push(`<rect x="${x-12}" y="${y-11}" width="24" height="22" fill="white" stroke="none"/>`,textAt(x,y,edge.weight,16,'font-weight="700"'));
  });
  Object.entries(spec.vertices).forEach(([label,point])=>{
    const [x,y]=p(point);
    parts.push(`<circle cx="${x}" cy="${y}" r="10" fill="white" stroke="${odd.has(label)?'#2456C4':'#566274'}" stroke-width="${odd.has(label)?3:1.5}"/>`,textAt(x,y,label,14,'font-weight="700"'));
  });
  parts.push(line([24,279],[58,279],'stroke="#2456C4" stroke-width="7"'),line([24,279],[58,279],'stroke="white" stroke-width="2" stroke-dasharray="5 4"'),textAt(217,279,'굵은 점선: 모두 두 번 지나는 길',15));
  parts.push(textAt(187,305,short.map(edge=>edge.edge+' '+edge.weight).join('  /  '),16,'font-weight="700"'));
  parts.push(textAt(187,330,'한 번 더 가는 거리: '+short.map(edge=>edge.weight).join(' + ')+' = '+parameters.minimumAddedDistance,16,'font-weight="700"'));
  const names=short.map(edge=>edge.edge).join('·'),values=short.map(edge=>edge.weight).join('+');
  const outer=spec.edgeGroups.find(group=>group.role==='outer'),inner=spec.edgeGroups.find(group=>group.role==='inner');
  const route=parameters.routeWitness;
  const steps=[
    `모든 길을 한 번씩 더하기 — 바깥 ${outer.edges.length}개는 ${outer.weight}씩, 안쪽 ${inner.edges.length}개는 ${inner.weight}씩입니다. 나머지 ${names}는 ${short.map(edge=>edge.weight).join(', ')}이므로 ${outer.weight}×${outer.edges.length}+${inner.weight}×${inner.edges.length}+${values}=${parameters.baseEdgeSum}입니다.`,
    '그냥 한 번씩만 지나갈 수 없는 이유 — 출발점으로 돌아오려면 각 지점에서 들어오는 길과 나가는 길이 짝을 이루어야 합니다. 그런데 A·C·E에는 길이 3개씩, G·H·I에는 5개씩 연결되어 한 길씩 짝이 남습니다.',
    `그림에서 다시 지날 길 정하기 — ${names}를 한 번씩 더 지나면 여섯 지점의 남은 길을 모두 짝지을 수 있습니다. 아래 굵은 점선은 새 길이 아니라 원래 길을 두 번 이용한다는 표시입니다. 추가 거리는 ${values}=${parameters.minimumAddedDistance}입니다.`,
    `이보다 짧게 갈 수 없는 이유 — A와 G에서 가장 짧은 길은 AG(${short.find(edge=>key(edge.edge)==='AG').weight}), C와 H에서는 CH(${short.find(edge=>key(edge.edge)==='CH').weight}), E와 I에서는 EI(${short.find(edge=>key(edge.edge)==='EI').weight})입니다. 여섯 지점은 각각 적어도 한 번 더 길을 지나야 합니다. 양 끝에서 같은 길을 두 번 센 것을 2로 나누면 필요한 추가 거리는 적어도 (${values})×2÷2=${parameters.minimumAddedDistance}입니다. 위 그림이 이 거리로 가능하므로 가장 짧습니다.`,
    `실제로 한 바퀴 돌아보기 — ${route.slice(0,12).join(' → ')}까지 간 뒤, ${route.slice(11).join(' → ')}로 돌아옵니다. 모든 길을 지나고 A로 돌아오며, ${names}만 두 번씩 지납니다.`,
    `전체 거리 구하기 — 모든 길을 한 번씩 지난 거리와 추가 거리를 더합니다. ${parameters.baseEdgeSum}+${parameters.minimumAddedDistance}=${parameters.minimumDistance}입니다.`
  ];
  return {width:375,height:350,svg:svg(375,350,parts.join('')),steps};
}

function renderModel(spec,solution=false){
  switch(spec.kind){
    case 'alternating-square-chain-grid':return chainSvg(spec);
    case 'planar-point-contact-map':return mapSvg(spec);
    case 'cloud-region-map':return cloudMapSvg(spec);
    case 'cuboid-edge-graph':return cuboidSvg(spec);
    case 'solid-surface-path-projection':return projectionSvg(spec,solution);
    case 'grid-road-network':return gridSvg(spec);
    case 'polyomino-square-tiling':return tilingSvg(spec);
    case 'balance-scale-sequence':return balanceSvg(spec);
    case 'triangular-lattice-composite-sequence':return triangleSequenceSvg(spec);
    case 'weighted-undirected-road-graph':return roadGraphSvg(spec);
    default:throw new Error(`지원하지 않는 그림 모델: ${spec.kind}`);
  }
}

async function raster(spec,description,solution=false){
  const model=renderModel(spec,solution);
  const png=await sharp(Buffer.from(model.svg)).png({compressionLevel:9}).toBuffer();
  return {kind:'raster',src:`data:image/png;base64,${png.toString('base64')}`,width:model.width,height:model.height,displayWidth:model.width,displayHeight:model.height,description};
}

function normalizeStep(step){return typeof step==='string'?step:`${step.title} — ${step.body}`;}
function bandFor(no){return no<=12?'2.7':no<=22?'3.4':'4.2';}
function sentence(value){
  const text=String(value||'').trim();
  return text&&!/[.!?]$/.test(text)?text+'.':text;
}
function promptContent(original,no){
  const lines=Array.isArray(original.conditionLines)?original.conditionLines.filter(Boolean):[];
  // Genuine givens belong in the question, not in a numbered hint list.
  const inlineIndexes={5:[0],6:[0],8:[0,1]}[no]||[];
  const text=[original.text].concat(inlineIndexes.map(index=>sentence(lines[index]))).filter(Boolean).join(' ');
  // These two lists are source data, not a restatement or a solving hint.
  if(no===15)return {text,promptDataLabel:'주어진 수 묶음',promptDataLines:lines.slice()};
  if(no===19)return {text,promptDataLabel:'경기 방법',promptDataLines:lines.slice()};
  return {text};
}

async function main(){
  const batches=BATCHES.map(name=>JSON.parse(fs.readFileSync(path.join(PRIVATE,`batch-${name}.json`),'utf8')));
  batches.forEach((batch,index)=>{
    if(batch.sourceSet!=='final'||batch.sourceRound!==2||!Array.isArray(batch.items)||batch.items.length!==30)throw new Error(`${BATCHES[index]} 묶음은 검수된 30문항이어야 합니다.`);
  });
  const taxonomy=new Map(require(path.join(ROOT,'bank','bank-registry.js')).reviewedTaxonomyOverrides.map(row=>[row.sourceKey,row]));
  const raw=batches.flatMap(batch=>batch.items).sort((a,b)=>a.sourceNo-b.sourceNo||a.variantNo-b.variantNo);
  if(raw.length!==90||new Set(raw.map(item=>item.id)).size!==90)throw new Error('파이널 2회 고정 문항은 중복 없는 90문항이어야 합니다.');
  const items=[];
  for(const original of raw){
    const no=Number(original.sourceNo),variant=Number(original.variantNo),key=`final|2|${no}`,tx=taxonomy.get(key);
    if(!tx||variant<1||variant>3||original.id!==`final2-q${String(no).padStart(2,'0')}-v${variant}`)throw new Error(`${original.id}: 회차·문항 번호를 확인해 주세요.`);
    if(original.pointBand!==bandFor(no))throw new Error(`${original.id}: 배점대를 확인해 주세요.`);
    const steps=(original.solutionSteps||[]).map(normalizeStep);
    if(steps.length<2)throw new Error(`${original.id}: 단계별 풀이가 부족합니다.`);
    const {conditionLines:unusedConditionLines,...originalWithoutConditionLines}=original;
    const item={...originalWithoutConditionLines,...promptContent(original,no),sourceSet:'final',sourceRound:2,genId:`final2-q${String(no).padStart(2,'0')}`,reviewStatus:'verified',area:tx.area,subarea:tx.subarea,detailType:tx.studentDisplayName,solutionSteps:steps,solution:steps.join(' ')};
    if(original.assetSpec)item.asset=await raster(original.assetSpec,`${no}번 유사문제 ${variant} 그림`);
    if(no===12){item.answer='그림 답안';item.solutionAsset=await raster(original.assetSpec,`${no}번 유사문제 ${variant} 위에서 본 답 그림`,true);}
    if(no===28){
      const diagram=roadSolution(original);
      const png=await sharp(Buffer.from(diagram.svg),{density:192}).png({compressionLevel:9}).toBuffer();
      item.solutionAsset={kind:'raster',src:`data:image/png;base64,${png.toString('base64')}`,width:diagram.width,height:diagram.height,displayWidth:diagram.width,displayHeight:diagram.height,description:'풀이 그림: 문제와 같은 도로망에서 AG·CH·EI를 각각 두 번 지나는 길로 표시'};
      item.solutionAssetAfterStep=3;
      item.solutionSkill='모든 길의 거리와 한 번 더 지나야 할 거리를 나누어 구하기';
      item.solutionSteps=diagram.steps;item.solution=diagram.steps.join(' ');
    }
    if(VISUAL_SOURCES.has(no)&&(!item.asset||item.asset.kind!=='raster'))throw new Error(`${item.id}: 문제 풀이에 필요한 그림이 없습니다.`);
    items.push(item);
  }
  for(let no=1;no<=30;no++)if(items.filter(item=>item.sourceNo===no).length!==3)throw new Error(`${no}번은 유사문제 3개여야 합니다.`);
  const identity=items.map(item=>({id:item.id,sourceNo:item.sourceNo,variantNo:item.variantNo,text:item.text,promptDataLines:item.promptDataLines||[]}));
  const content=items.map(({asset,solutionAsset,...item})=>item);
  const data={
    version:'2.0.0',sourceSet:'final',sourceRound:2,
    freezePolicy:{runtimeGeneration:false,fixedItemCount:90,variantsPerSourceQuestion:3,seed:'F290',questionIdentitySetHash:hash(JSON.stringify(identity)),itemContentSetHash:hash(JSON.stringify(content)),note:'독립 검수까지 통과한 고정 문항만 제공합니다. 열람할 때 문항을 새로 만들지 않습니다.'},
    sourceFingerprints:{'materials/final_2/001.jpg':fileHash('materials/final_2/001.jpg'),'materials/final_2/002.jpg':fileHash('materials/final_2/002.jpg'),'materials/final_2/003.jpg':fileHash('materials/final_2/003.jpg'),'materials/final_2/004.jpg':fileHash('materials/final_2/004.jpg'),'materials/final_2/005.jpg':fileHash('materials/final_2/005.jpg'),'materials/final_2/006.jpg':fileHash('materials/final_2/006.jpg'),'final2-detailed-data.js':fileHash('final2-detailed-data.js'),'qa/final2-detailed-review.json':fileHash('qa/final2-detailed-review.json')},
    reviewSummary:{verified:90,pending:0},items
  };
  const index={version:data.version,sourceSet:'final',sourceRound:2,items:items.map(item=>({id:item.id,sourceNo:item.sourceNo,genId:item.genId,variantNo:item.variantNo,reviewStatus:item.reviewStatus,area:item.area,subarea:item.subarea,detailType:item.detailType,pointBand:item.pointBand,text:item.text,...(item.promptDataLines?{promptDataLabel:item.promptDataLabel,promptDataLines:item.promptDataLines}:{})}))};
  fs.writeFileSync(DATA_PATH,JSON.stringify(data,null,2)+'\n');
  fs.writeFileSync(INDEX_PATH,JSON.stringify(index,null,2)+'\n');
  console.log(`Built Final 2 fixed bank: ${items.length} verified items, ${items.filter(item=>item.asset).length} prompt figures, ${items.filter(item=>item.solutionAsset).length} solution figures.`);
}

main().catch(error=>{console.error(error);process.exitCode=1;});
