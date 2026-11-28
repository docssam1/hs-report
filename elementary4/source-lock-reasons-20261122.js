// 2026-11-22 검수 후에도 잠금을 유지하는 유형의 구체적인 사유. curriculum.js와 공개 등록 뒤에서 읽습니다.
// 잠긴 유형에만 적용하며, 공개 여부는 바꾸지 않습니다.
(function(root){'use strict';
const cur=root.HSE_CURRICULUM;if(!cur)return;
const R={};
Object.assign(R,root.HSE_LOCK_REASONS_20261122_EXTRA||{});
cur.semesters.forEach(s=>s.units.forEach(u=>u.subunits.forEach(g=>g.types.forEach(t=>{const r=R[t.id];if(r&&t.reviewLocked)t.reviewReason=r;}))));
})(typeof window!=='undefined'?window:globalThis);
