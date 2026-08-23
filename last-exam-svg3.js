/* 최종 모의고사 3회 · PDF 시험지 기반 학생용 도형 증분 */
(function(){
  'use strict';

  function esc(value){
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function asset(title, file, cls, maxHeight){
    return '<img class="exam-figure '+(cls||'')+'" src="mock-assets/last3/'+esc(file)+'" alt="'+esc(title)+'" loading="eager" decoding="sync" style="display:block;width:100%;max-height:'+(maxHeight||150)+'px;object-fit:contain">';
  }

  function signBlanks(){
    return asset('6부터 1까지의 수 사이에 기호를 넣는 다섯 개의 빈칸','q12-sign-blanks.png','wide',66)+
      '<div class="score-band" style="margin-top:8px">13번부터 22번까지는 [3.4점] 짜리 문제입니다.</div>';
  }

  function codeRule(){
    var rows=[
      ['AEI:','■','BFJ:','○○'],
      ['BGJ:','△△','AHI:','◆'],
      ['CEJ:','□□□','DGI:','▲▲▲▲'],
      ['CGI:','▲▲▲','DHJ:','◇◇◇◇'],
      ['DEJ:','□□□□','CFI:','●●●']
    ];
    var html='<div class="figure-html" role="img" aria-label="A부터 J까지의 코드와 개수, 색깔, 모양 보기" style="font-size:13px;line-height:1.45;max-width:330px;margin:8px auto 0">';
    rows.forEach(function(row){
      html+='<div style="display:grid;grid-template-columns:45px 1fr 45px 1fr;gap:3px 5px"><b>'+row[0]+'</b><span>'+row[1]+'</span><b>'+row[2]+'</b><span>'+row[3]+'</span></div>';
    });
    return html+'<div style="display:grid;grid-template-columns:45px 1fr;gap:3px 5px;margin-top:2px"><b>CHI:</b><span></span></div></div>';
  }

  function reporterClues(){
    var rows=[
      ['변진수','“김희선 선수와 이수영 선수 사이에 두 명이 골인했습니다.”'],
      ['김진자','“심은하 선수는 고소영 선수와 전도연 선수보다 먼저 골인했습니다.”'],
      ['김명수','“이영애 선수는 3위 안이고 김희선 선수와 최지우 선수는 4위 이하입니다.”'],
      ['장은랑','“고소영 선수는 이수영 선수보다 빨리 골인했습니다.”'],
      ['이혜현','“이영애 선수 다음에 김희선 선수가 골인했고, 이승연 선수 바로 전에 최지우 선수가 골인했습니다.”']
    ];
    var html='<div class="figure-html" role="img" aria-label="여자 마라톤 결과에 관한 다섯 리포터의 말" style="border:1px solid #64748b;padding:7px 8px;margin-top:7px;font-size:10.5px;line-height:1.45">';
    rows.forEach(function(row){
      html+='<div style="display:grid;grid-template-columns:46px 1fr;gap:4px"><b>'+row[0]+'</b><span>'+row[1]+'</span></div>';
    });
    return html+'</div><div style="font-size:12px;margin-top:7px">우승자와 7위를 한 사람을 구하세요.</div>';
  }

  var figures = window.GFIELD_LAST_FIGURES || (window.GFIELD_LAST_FIGURES = {});
  figures['last3-exposed-blocks']=function(){return asset('겉면을 들어내기 전 계단 모양 쌓기나무','q01-exposed-blocks.png','',150);};
  figures['last3-sign-blanks']=signBlanks;
  figures['last3-road-network']=function(){return asset('A에서 C를 지나 D로 가되 B를 지나지 않는 도로망','q15-road-network.png','wide',145);};
  figures['last3-paper-folding']=function(){return asset('정사각형 색종이를 두 번 접고 굵은 선을 따라 자르는 보기','q18-paper-folding.png','wide',142);};
  figures['last3-star-triangle-grid']=function(){return asset('7×5 표 안의 별과 삼각형 위치','q19-star-triangle-grid.png','',145);};
  figures['last3-fraction-sequence']=function(){return asset('분자와 분모의 합이 차례로 커지는 분수 수열','q24-fraction-sequence.png','wide',120);};
  figures['last3-hexagon-stages']=function(){return asset('단위 정삼각형으로 만든 1단계, 2단계, 3단계 정육각형','q26-hexagon-stages.png','wide',120);};
  figures['last3-code-rule']=codeRule;
  figures['last3-race-reporter-clues']=reporterClues;
})();
