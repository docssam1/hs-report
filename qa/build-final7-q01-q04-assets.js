'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'bank', 'assets', 'final7');

const q1 = [
  {count:14, seed:1},
  {count:16, seed:2},
  {count:19, seed:3},
];
const q2 = [
  {hour:5, minute:20},
  {hour:4, minute:45},
  {hour:6, minute:10},
];
const q3 = [{stage:5}, {stage:7}, {stage:8}];
const q4 = [
  {rows:9, cols:11, missing:[[1,2],[1,3],[2,2],[2,3],[3,2],[5,7],[5,8],[6,7],[6,8],[7,7],[7,8],[2,9],[3,9],[4,9],[7,3]]},
  {rows:11, cols:12, missing:[[1,1],[1,2],[2,1],[2,2],[3,1],[3,2],[5,5],[5,6],[5,7],[6,5],[6,6],[6,7],[8,9],[8,10],[9,9],[9,10],[4,10],[4,11],[5,10],[5,11],[6,10]]},
  {rows:10, cols:13, missing:[[1,3],[1,4],[2,3],[2,4],[3,3],[3,4],[5,7],[5,8],[6,7],[6,8],[7,7],[7,8],[2,10],[2,11],[3,10],[3,11],[4,10],[4,11],[7,1],[8,1],[9,1],[7,12],[8,12],[9,12]]},
];

function svg(width, height, body) {
  return `<svg id="art" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
}

function q1Svg(row) {
  // A deterministic spill, not a tidy counting grid. Several leads cross at
  // their interiors just like the source picture, while every full lead stays
  // traceable from one tip to the other.
  const leadLength = 112;
  const leadStrokeWidth = 3.4;
  const source = [
    // The first lead cuts across at least four other leads in every variant.
    [380, 92, -1], [365, 78, -26], [405, 68, 24], [425, 85, -18],
    [465, 74, 15], [488, 95, -30], [520, 90, 8],
    [360, 112, 34], [398, 115, -35], [438, 118, 20], [478, 125, -22], [525, 127, 12],
    [350, 150, -14], [400, 150, 9], [450, 156, -18], [500, 160, 5],
    [378, 190, -6], [452, 198, 0], [535, 180, -28],
  ];
  const offset = (row.seed - 2) * 3;
  const placements = source.slice(0, row.count).map(([x, y, angle], index) => {
    const length = leadLength;
    return {x:x + (index % 3 === 0 ? offset : 0), y:y + (index % 4 === 0 ? -offset : 0), angle, length};
  });
  const endpoints = ({x,y,angle,length}) => {
    const rad=angle*Math.PI/180, dx=Math.cos(rad)*length/2, dy=Math.sin(rad)*length/2;
    return [[x-dx,y-dy],[x+dx,y+dy]];
  };
  const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  let intersections=0;
  const crossingCounts = Array(placements.length).fill(0);
  for(let i=0;i<placements.length;i+=1)for(let j=i+1;j<placements.length;j+=1){
    const [a,b]=endpoints(placements[i]),[c,d]=endpoints(placements[j]);
    if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0){
      intersections+=1;
      crossingCounts[i]+=1;
      crossingCounts[j]+=1;
    }
  }
  if(intersections<8)throw new Error(`Q1 variant ${row.seed}: clustered spill needs at least eight visible crossings`);
  if(crossingCounts[0]<4)throw new Error(`Q1 variant ${row.seed}: one lead must visibly cross at least four other leads`);
  placements.forEach((lead,index)=>{
    endpoints(lead).flat().forEach((value,coordinate)=>{
      const limit=coordinate%2===0?700:260;
      if(value<18||value>limit-18)throw new Error(`Q1 variant ${row.seed}: lead ${index+1} leaves the picture`);
    });
  });
  if (new Set(placements.map((lead) => lead.length)).size !== 1) {
    throw new Error(`Q1 variant ${row.seed}: every lead must have the same length`);
  }
  const leads = placements.map(({x,y,angle,length}) => `<g transform="translate(${x} ${y}) rotate(${angle})"><line x1="${-length/2}" y1="2.5" x2="${length/2}" y2="2.5" stroke="#c7cbd0" stroke-width="2.6" stroke-linecap="round"/><line x1="${-length/2}" y1="0" x2="${length/2}" y2="0" stroke="#353a41" stroke-width="${leadStrokeWidth}" stroke-linecap="round"/><line x1="${-length/2+2}" y1="-.6" x2="${length/2-2}" y2="-.6" stroke="#7d838b" stroke-width=".8" stroke-linecap="round"/></g>`).join('');
  return svg(700, 260, leads);
}

function q2Svg(row) {
  const cx = 250, cy = 170, r = 112;
  const marks = Array.from({length:12}, (_,i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    const x1 = cx + Math.cos(a) * 91, y1 = cy + Math.sin(a) * 91;
    const x2 = cx + Math.cos(a) * 102, y2 = cy + Math.sin(a) * 102;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#252a31" stroke-width="${i%3===0?4:2.5}" stroke-linecap="round"/>`;
  }).join('');
  const minuteAngle = (row.minute * 6 - 90) * Math.PI / 180;
  const hourAngle = ((row.hour % 12) * 30 + row.minute * .5 - 90) * Math.PI / 180;
  const hand = (a,len,width) => `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*len}" y2="${cy+Math.sin(a)*len}" stroke="#1e232a" stroke-width="${width}" stroke-linecap="round"/>`;
  return svg(500, 340, `<rect x="24" y="18" width="452" height="304" rx="8" fill="#fafafa" stroke="#c7ccd2" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#20242b" stroke-width="4"/>${marks}${hand(hourAngle,58,7)}${hand(minuteAngle,82,5)}<circle cx="${cx}" cy="${cy}" r="7" fill="#20242b"/><text x="250" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6a7078">거울에 비친 시계</text>`);
}

function q3Svg(row) {
  const cell = row.stage >= 8 ? 32 : row.stage === 7 ? 38 : 48;
  const max = row.stage * 2 - 1;
  const width = max * cell + 80, height = row.stage * cell + 80;
  const lines = [];
  for (let level = 0; level < row.stage; level += 1) {
    const count = max - level * 2;
    const startX = 40 + level * cell;
    const y = 30 + (row.stage - level - 1) * cell;
    for (let col = 0; col < count; col += 1) lines.push(`<rect x="${startX+col*cell}" y="${y}" width="${cell}" height="${cell}" fill="none" stroke="#20242b" stroke-width="2"/>`);
  }
  return svg(width, height, lines.join(''));
}

function starPoints(cx, cy, outer, inner) {
  const points=[];
  for(let i=0;i<10;i+=1){const a=(-90+i*36)*Math.PI/180,r=i%2===0?outer:inner;points.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);}
  return points.join(' ');
}

function q4Svg(row) {
  const gap = 34, margin = 34;
  const missing = new Set(row.missing.map(([r,c])=>`${r}:${c}`));
  const stars=[];
  for(let r=0;r<row.rows;r+=1)for(let c=0;c<row.cols;c+=1){if(missing.has(`${r}:${c}`))continue;const x=margin+c*gap+gap/2,y=margin+r*gap+gap/2;stars.push(`<polygon points="${starPoints(x,y,11,4.8)}" fill="#20242b"/>`);}
  return svg(margin*2+row.cols*gap, margin*2+row.rows*gap, stars.join(''));
}

(async () => {
  fs.mkdirSync(OUT, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1000,height:700},deviceScaleFactor:2});
  const groups = [[1,q1,q1Svg],[2,q2,q2Svg],[3,q3,q3Svg],[4,q4,q4Svg]];
  for (const [no, rows, render] of groups) {
    for (let index=0; index<rows.length; index+=1) {
      await page.setContent('<!doctype html><style>html,body{margin:0;background:#fff}</style>'+render(rows[index]));
      await page.locator('#art').screenshot({path:path.join(OUT, `q${String(no).padStart(2,'0')}-v${index+1}.png`)});
    }
  }
  await browser.close();
  console.log('Final 7 Q1-Q4 assets: 12 PNG files written.');
})().catch((error)=>{console.error(error);process.exitCode=1;});
