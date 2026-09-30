/* Signature-only, source-item-based first-week priorities. Never used by Final exams. */
(function(root){
  'use strict';
  // Curated from the two Signature source papers. Tier 3 is used only after
  // there are no missed foundational (tier 1–2) questions to revisit.
  var TIERS={
    1:{1:1,4:1,5:1,6:1,8:2,10:2,11:1,12:1,14:1,15:2,16:3,17:1,22:1},
    2:{1:2,2:1,3:1,4:1,5:1,6:2,7:2,8:2,9:2,10:2,12:1,13:1,14:2,18:4,20:3}
  };
  function tier(round,item){
    if(!item||![2.7,3.4].includes(Number(item.pts))||!/^D[123]$/.test(String(item.difficultyClass||'')))return null;
    return TIERS[round]&&TIERS[round][Number(item.no)]||null;
  }
  function status(states,no){
    if(!Array.isArray(states))return '미정답(오답·미응답 미구분)';
    return states[no-1]==='-'?'미응답':states[no-1]==='X'?'오답':'미정답(오답·미응답 미구분)';
  }
  function select(options){
    var round=Number(options.round),items=options.wrongItems||[],attempts=options.attempts||[],pairs=options.pairs||[];
    var prior=round===2?attempts.find(function(row){return row.n===1&&Array.isArray(row.oxArr);}):null;
    var priorItems=options.priorItems||[];
    var eligible=items.map(function(item){
      var level=tier(round,item);
      if(level===null)return null;
      var pair=prior&&pairs.find(function(row){return Number(row[1])===Number(item.no);});
      var earlier=pair&&priorItems.find(function(row){return Number(row.no)===Number(pair[0]);});
      var earlierTier=earlier&&tier(1,earlier);
      var repeated=!!(earlierTier!==null&&earlierTier<=2&&prior.oxArr[Number(pair[0])-1]==='X');
      return {no:Number(item.no),type:String(item.type||item.subarea||''),point:Number(item.pts),tier:level,
        repeated:repeated,status:status(options.answerStates,Number(item.no)),item:item};
    }).filter(Boolean);
    var foundation=eligible.filter(function(row){return row.tier<=2;});
    var active=foundation.length?foundation:eligible.filter(function(row){return row.tier>=3;});
    active.sort(function(a,b){return Number(b.repeated)-Number(a.repeated)||a.tier-b.tier||a.point-b.point||a.no-b.no;});
    return active.slice(0,3).map(function(row){
      row.reason=(row.repeated?'두 회차 모두 미정답 · ':'')+row.status;
      return row;
    });
  }
  root.GFIELD_SIGNATURE_STUDY_PRIORITY={select:select,tier:tier};
})(typeof window!=='undefined'?window:globalThis);
