/* 최종 모의고사 4회 · PDF 시험지에서 직접 만든 학생용 도형 자산 */
(function(){
  'use strict';

  var figures=window.GFIELD_LAST_FIGURES;
  if(!figures||typeof figures!=='object') return;

  function esc(value){
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function asset(title,file,maxHeight){
    return '<img class="exam-figure" src="mock-assets/last4/'+esc(file)+'" alt="'+esc(title)+'" loading="eager" style="max-height:'+maxHeight+'px;object-fit:contain">';
  }

  var round4={
    'last4-box-statements':function(){
      return asset('빨간색, 초록색, 노란색 상자에 적힌 세 문장','q01-statements.png',125);
    },
    'last4-subtraction':function(){
      return asset('1부터 9까지의 수를 한 번씩 넣는 세 자리 수 뺄셈','q02-subtraction.png',125);
    },
    'last4-block-views':function(){
      return asset('쌓기나무를 위, 앞, 옆에서 본 모양과 별표 위치','q03-block-views.png',140);
    },
    'last4-code':function(){
      return asset('기호 숫자판의 예시 세 개와 계산할 기호식','q06-code.png',185);
    },
    'last4-paper-fold':function(){
      return asset('1부터 32까지 적힌 모눈 종이와 다섯 번의 접기 순서','q07-paper-fold.png',195);
    },
    'last4-sequence':function(){
      return asset('2, 3, 4, 9, 6, 9, 4, 9, 2, 5, 6, 3으로 이어지는 수열','q08-sequence.png',62);
    },
    'last4-magic-square':function(){
      return asset('A와 B 및 25, 17, 38, 20, 30, 21, 40이 놓인 4행 4열 마방진','q11-magic-square.png',180);
    },
    'last4-prism':function(){
      return asset('선을 따라 나누어진 직육면체','q12-prism.png',135);
    },
    'last4-multiples':function(){
      return asset('3, 6, 9, 12, 15, 18에서 300까지 이어지는 3의 배수','q13-multiples.png',48);
    },
    'last4-seating-clues':function(){
      return asset('서준, 혜정, 모건, 진아의 자리 배치를 정하는 네 가지 설명','q14-seating-clues.png',140);
    },
    'last4-rectangles':function(){
      return asset('크고 작은 직사각형을 찾는 가와 나 그림','q15-rectangles.png',180);
    },
    'last4-symbol-numbers':function(){
      return asset('도형을 수로 나타낸 네 예와 계산할 덧셈식','q16-symbol-numbers.png',215);
    },
    'last4-number-subtraction':function(){
      return asset('서로 다른 다섯 수를 넣는 두 자리 수 뺄셈식','q18-subtraction.png',82);
    },
    'last4-equation-grid':function(){
      return asset('㉠부터 ㉧까지 넣는 뺄셈, 나눗셈, 덧셈, 곱셈 격자','q19-equation-grid.png',195);
    },
    'last4-target':function(){
      return asset('0, 더하는 1·3·9와 빼는 밑줄 친 1·3·9가 있는 과녁','q20-target.png',155);
    },
    'last4-chores':function(){
      return asset('여섯 가지 청소 시간과 먼저 해야 할 일의 순서 표','q22-chores.png',245);
    },
    'last4-pieces':function(){
      return asset('색칠된 조각 다섯 개와 계단 모양 목표판','q23-pieces.png',125);
    },
    'last4-scores':function(){
      return asset('관호의 세 번 화살 점수 9점, 8점, 9점 표','q24-scores.png',92);
    },
    'last4-museum':function(){
      return '<div class="figure-html" role="group" aria-label="박물관 이동 규칙과 관람객 수 조건">'+
        asset('입구와 전시실 가, 나의 박물관 배치도 및 두 갈래와 세 갈래 이동 규칙','q27-museum.png',158)+
        '<p style="margin:6px 0 0;line-height:1.75">모두 전시실에 들어간 후 (나)전시실에 있는 학생을 세어보니 70명이었습니다. 처음 입구로 들어간 관람객은 모두 몇 명일까요?</p></div>';
    },
    'last4-cubes':function(){
      return asset('각 색칠된 행과 열이 검은 쌓기나무인 직육면체','q28-cubes.png',180);
    },
    'last4-matchsticks':function(){
      return asset('성냥개비 정육면체가 가로로 이어진 모양','q30-matchsticks.png',150);
    }
  };

  Object.keys(round4).forEach(function(id){ figures[id]=round4[id]; });
})();
