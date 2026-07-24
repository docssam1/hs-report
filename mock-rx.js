/* GFIELD 모의고사 호환 로더
 * 기존 상세 진단 UI와 처방 데이터는 변경하지 않고,
 * 중급/활용 데이터 선택·권한·저장 키만 분리합니다.
 */
(function(){
  const params=new URLSearchParams(location.search);
  const set=(params.get('set')||'').toLowerCase()==='hw'?'hw':'mid';
  const preview=params.get('preview')==='1';

  /* 기존 처방 데이터 먼저 로드 */
  document.write('<script src="mock-rx-data.js?v=20260724"><\/script>');

  /* 활용 모의고사는 기존 상세 진단 틀에 활용 데이터만 주입 */
  if(set==='hw'){
    document.write('<script src="mock-data-hw.js?v=20260724"><\/script>');
    document.write('<script>(function(){var D=window.GFIELD_DATA||{},H=window.GFIELD_MOCK_HW||{};var p=new URLSearchParams(location.search),n=(p.get("name")||"").trim();if(!n){try{n=localStorage.getItem("gfield_student")||""}catch(e){}}if(n&&n.toLowerCase()!=="docssam"){var online=((D.studentTypes||{})[n])==="online",all=((D.archiveAccess||{})["활용 모의고사"]||[]).includes(n),ok=[];if(online&&all){ok=Object.keys(H.rounds||{})}else if(!online&&(D.specialStudents||[]).includes(n)){((((D.content||{})["special-summer"]||{}).textbooks)||[]).forEach(function(t){var m=String(t.title||"").match(/활용\\s*모의고사\\s*(\\d+)\\s*회/);if(m&&Array.isArray(t.access)&&t.access.includes(n))ok.push(String(+m[1]));});}var filtered={};ok.forEach(function(r){if(H.rounds&&H.rounds[r])filtered[r]=H.rounds[r];});H=Object.assign({},H,{rounds:filtered});}window.GFIELD_MOCK=H;})();<\/script>');
  }

  /* 브라우저 저장소의 중급/활용 충돌 방지 */
  const nativeGet=Storage.prototype.getItem;
  const nativeSet=Storage.prototype.setItem;
  const nativeRemove=Storage.prototype.removeItem;
  function mapKey(k){
    k=String(k||'');
    if(/^gfield_mock_(?!mid_|hw_)/.test(k)) return 'gfield_mock_'+set+'_'+k.slice(12);
    return k;
  }
  Storage.prototype.getItem=function(k){return nativeGet.call(this,mapKey(k));};
  Storage.prototype.setItem=function(k,v){
    const mk=mapKey(k);
    if(preview&&/^gfield_mock_(mid|hw)_/.test(mk)) return;
    return nativeSet.call(this,mk,v);
  };
  Storage.prototype.removeItem=function(k){return nativeRemove.call(this,mapKey(k));};

  /* Supabase 회차 키도 mid / hw 및 1·2·3차로 분리 */
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.includes('/rest/v1/mock_results')){
      const opt=Object.assign({},init||{});
      const method=String(opt.method||'GET').toUpperCase();
      if(method==='POST'&&opt.body){
        try{
          const body=JSON.parse(opt.body);
          if(body&&body.round!=null){
            const slot=Math.max(1,Math.min(3,Number(window.__gfieldAttemptSlot)||1));
            let r=String(body.round).replace(/^hw/,'').replace(/@[123]$/,'');
            body.round=(set==='hw'?'hw':'')+r+(slot>1?'@'+slot:'');
            opt.body=JSON.stringify(body);
          }
        }catch(e){}
      }
      const res=await nativeFetch(input,opt);
      if(method==='GET'&&res.ok){
        try{
          const rows=await res.clone().json();
          if(Array.isArray(rows)){
            const filtered=rows.filter(function(row){
              const raw=String(row.round||'');
              return set==='hw'?raw.startsWith('hw'):!raw.startsWith('hw');
            }).map(function(row){
              const x=Object.assign({},row);
              x.round=String(x.round||'').replace(/^hw/,'').replace(/@[123]$/,'');
              return x;
            });
            return new Response(JSON.stringify(filtered),{status:res.status,statusText:res.statusText,headers:res.headers});
          }
        }catch(e){}
      }
      return res;
    }
    return nativeFetch(input,init);
  };

  /* 원본 inline script 실행 후 함수만 최소 래핑 */
  setTimeout(function(){
    try{
      const D=window.GFIELD_DATA||{};
      const originalRoundKeys=window.roundKeys;
      window.roundKeys=function(){
        const model=(typeof M!=='undefined'&&M)?M:(window.GFIELD_MOCK||{});
        const keys=Object.keys(model.rounds||{}).sort(function(a,b){return +a-+b;});
        const currentMode=typeof mode!=='undefined'?mode:null;
        if(set!=='hw'||currentMode==='teacher') return keys;
        const student=typeof me!=='undefined'?(me||''):'';
        if(!student) return [];
        const online=((D.studentTypes||{})[student])==='online';
        if(online&&(((D.archiveAccess||{})['활용 모의고사']||[]).includes(student))) return keys;
        if(online||!((D.specialStudents||[]).includes(student))) return [];
        const ok=[];
        ((((D.content||{})['special-summer']||{}).textbooks)||[]).forEach(function(t){
          const m=String(t.title||'').match(/활용\s*모의고사\s*(\d+)\s*회/);
          if(m&&Array.isArray(t.access)&&t.access.includes(student))ok.push(String(+m[1]));
        });
        return [...new Set(ok)].filter(function(r){return keys.includes(r);}).sort(function(a,b){return +a-+b;});
      };

      if(typeof window.renderRoundPick==='function'){
        const originalRenderRoundPick=window.renderRoundPick;
        window.renderRoundPick=function(){
          const out=originalRenderRoundPick();
          if(set==='hw'){
            const hint=document.querySelector('#main .hint');
            if(hint)hint.innerHTML=hint.innerHTML.replace(/중급\s*모의고사/g,'활용 모의고사');
          }
          return out;
        };
      }

      if(typeof window.openMark==='function'){
        const originalOpenMark=window.openMark;
        window.openMark=function(r){
          if(!window.roundKeys().includes(String(r))){if(typeof window.toast==='function')window.toast('이 회차는 아직 승인되지 않았어요.');if(typeof window.renderRoundPick==='function')window.renderRoundPick();return;}
          return originalOpenMark(r);
        };
      }

      if(typeof window.supaUpsert==='function'){
        const originalUpsert=window.supaUpsert;
        window.supaUpsert=function(student,r,ox,source){
          try{
            const model=(typeof M!=='undefined'&&M)?M:null;
            window.__gfieldAttemptSlot=Math.max(1,Math.min(3,((model&&model.results&&model.results[student]&&model.results[student][r])||[]).length||1));
          }catch(e){window.__gfieldAttemptSlot=1;}
          const out=originalUpsert(student,r,ox,source);
          Promise.resolve(out).finally(function(){delete window.__gfieldAttemptSlot;});
          return out;
        };
      }

      if(typeof window.submitAttempt==='function'){
        const originalSubmit=window.submitAttempt;
        window.submitAttempt=function(){
          if(preview){if(typeof window.toast==='function')window.toast('관리자 미리보기에서는 저장되지 않습니다.');return;}
          try{
            const student=typeof me!=='undefined'?me:null;
            const round=typeof curRound!=='undefined'?curRound:null;
            if(student&&round&&window.attemptsOf(student,round).length>=3){window.toast('이 회차의 3회 응시 기록을 모두 사용했어요.');return;}
          }catch(e){}
          return originalSubmit();
        };
      }

      const label=set==='hw'?'활용':'중급';
      document.title='지필드 영재교육 | '+label+' 모의고사 진단';
      const gh=document.querySelector('#gate h2');if(gh)gh.textContent=label+' 모의고사 진단';
      const hh=document.querySelector('header .t');if(hh&&hh.firstChild)hh.firstChild.nodeValue=label+' 모의고사 진단';
      const student=typeof me!=='undefined'?me:null;
      const currentMode=typeof mode!=='undefined'?mode:null;
      if(typeof window.renderRoundPick==='function'&&student&&currentMode==='parent')window.renderRoundPick();
    }catch(e){console.error('mock compatibility',e);}
  },0);
})();
