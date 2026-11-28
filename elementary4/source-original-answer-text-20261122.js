// 2026-11-22 원문 구조 유형(6학년·4·5학년 공개 등록분)의 정답 칸을 앱의 수식 표기(텍스트 a/b, w a/b)로 바꿉니다.
// 정답 칸은 escapeHtml 후 수식 표기로 그려지므로 HTML 분수 표기를 그대로 두면 태그가 글자로 보입니다.
(function(root){'use strict';
const api=root.HSE_GENERATORS;if(!api||typeof api.generate!=='function'||api.__originalAnswerText20261122)return;
const keys=new Set([...Object.values(root.HSE_GRADE6_RELEASE_20261122||{}),...Object.values(root.HSE_LOWER_RELEASE_20261122||{})].map(r=>r&&r.key).filter(Boolean));
const plain=html=>String(html==null?'':html)
 .replace(/<span class="math-mixed-number"[^>]*>\s*<span>([^<]*)<\/span>\s*<span class="math-fraction"[^>]*>\s*<span>([^<]*)<\/span>\s*<span>([^<]*)<\/span>\s*<\/span>\s*<\/span>/g,' $1 $2/$3 ')
 .replace(/<span class="math-fraction"[^>]*>\s*<span>([^<]*)<\/span>\s*<span>([^<]*)<\/span>\s*<\/span>/g,' $1/$2 ')
 .replace(/<br\s*\/?>/gi,', ').replace(/<sup>2<\/sup>/g,'²').replace(/<sup>3<\/sup>/g,'³').replace(/<[^>]+>/g,'')
 .replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
 .replace(/\s+/g,' ').replace(/\(\s+/g,'(').replace(/\s+\)/g,')').replace(/\s+([,.:])/g,'$1').trim();
const previous=api.generate.bind(api);
api.generate=function(type,rank,difficulty,seed,variant){const q=previous(type,rank,difficulty,seed,variant);
 if(q&&keys.has(q.generator)&&typeof q.answer==='string'&&/<[a-z]/i.test(q.answer))return Object.assign({},q,{answer:plain(q.answer),answerHtml:q.answer});
 return q;};
Object.defineProperty(api,'__originalAnswerText20261122',{value:true});
})(typeof window!=='undefined'?window:globalThis);
