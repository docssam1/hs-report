// 4·5학년 잠금 원문 유형 공개 등록 (2026-11-22). curriculum.js 뒤, 생성기 플러그인 앞에서 읽습니다.
(function(root){'use strict';
const cur=root.HSE_CURRICULUM,R=root.HSE_LOWER_RELEASE_20261122||{};if(!cur)return;
let n=0;cur.semesters.forEach(s=>s.units.forEach(u=>u.subunits.forEach(g=>g.types.forEach(t=>{const r=R[t.id];if(!r||t.sourceItemId!==r.sourceItemId)return;
 Object.assign(t,{generatorKey:r.key,reviewLocked:false,reviewReason:'',sourceVerified:true,generationMode:'fixed-verified-pool',verifiedVariantTarget:3,
  verifiedVariantCount:r.count||3,problemVisualRequired:!!r.problemVisual,answerVisualRequired:!!r.answerVisual,answerVisualStatus:r.answerVisual?'verified':'not-required',
  publisherKeyVerified:false,release20261122:true},r.typeLabel?{name:r.typeLabel,label:r.typeLabel}:{},r.creative?{creativePractice:true,sourceItemLabel:'창작 연습(원본 문항 아님)',sourceSection:'creative-practice'}:{});
 if(r.creative&&!/창작 연습/.test(t.name)){t.name+=' · 창작 연습';if(t.label)t.label+=' · 창작 연습';}n++;}))));
cur.release20261122LowerCount=n;
})(typeof window!=='undefined'?window:globalThis);
