/* 최종 모의고사 1~4회: 시험지, 원점수 분포, 문항 정답률, 검수 답안을
 * final.html의 공용 진단 화면에서 함께 쓰도록 잇는 어댑터입니다. */
(function(root){
  'use strict';

  var model=root.GFIELD_MOCK_LAST;
  var scoreModel=root.GFIELD_LAST_SCORE_DATA;
  var answerModel=root.GFIELD_LAST_ANSWER_DATA;
  if(!model||!model.rounds||!scoreModel||!scoreModel.rounds) return;

  function point(no){return no<=12?2.7:(no<=22?3.4:4.2);}
  function answerRows(round){
    if(round===1||round===2){
      var source=round===1?root.GFIELD_LAST1_DETAILED:root.GFIELD_LAST2_DETAILED;
      var detailed=source&&source.items;
      if(Array.isArray(detailed)&&detailed.length===30) return detailed.map(function(item){
        return {status:item.reviewStatus,answer:item.answer,explanation:item.method,caution:item.caution};
      });
    }
    return answerModel&&answerModel.rounds&&answerModel.rounds[String(round)]||[];
  }
  function tagFor(type){
    type=String(type||'');
    if(/조건|논리|자리|경우|깃발|서랍|구슬|수의 개수/.test(type)) return '조건놓침';
    if(/접기|그림|도형|사각형|주사위|간격|수열|배열|시계|요일|마주/.test(type)) return '절차';
    return '개념';
  }
  function cleanGrade(label){return String(label||'').replace(/,/g,' · ');}

  /* 최종 1회 이원목적분류표의 영역·유형과 실제 풀이를 함께 읽어 문항별로
   * 확정한 소영역입니다. 번호에 묶어 다른 회차로 자동 전파하지 않습니다. */
  var LAST1_SUBAREAS=[
    '수와 숫자 세기','달력·요일','마디수열·규칙찾기','수열과 규칙','달력·요일(시계)',
    '공간지각','도형의 개수','수의 관계','조건에 맞는 수','수량 관계',
    '진법·암호','수열과 규칙','수열과 규칙','조건에 맞는 수','수 배열의 규칙',
    '계산과 수의 관계','일·속력·시간','연결과 선택','분배·비둘기집','이동·회전·대칭',
    '분배·비둘기집','포함과 배제','마디수열·규칙찾기','조건에 맞는 수','진법·암호',
    '재치 있게 계산하기','논리추리','순서·자리배치','조건에 맞는 수','식의 완성'
  ];
  /* 기존 자료실 교재표에서 오해 없이 찾을 수 있는 검색어만 지정합니다.
   * 빈 값은 억지 연결 대신 확인 중으로 표시합니다. */
  var LAST1_PRESCRIPTION_HINTS=[
    '특정 숫자 세기','요일','반복마디','등차수열','고장난 시계',
    '종이 접기','사각형의 개수','', '조건에 맞는 경우','합과 차',
    '숫자 알아내기','계차수열','', '약수','수열',
    '', '간격','경우의 수','비둘기집','주사위',
    '경우의 수','벤다이어그램','반복마디','','',
    '','논리추리','경우의 수','비밀번호','복면산'
  ];
  var LAST1_PRESCRIPTION_OVERRIDES={
    24:{label:'연속한 11 조건이 있는 수',connectionKind:'same-type',books:{
      '시중교재':[{b:'필즈 입문 상',u:'02단원 조건에 맞는 수'}],
      '필즈더클래식':[{b:'더클래식 1과정 10권',u:'조건에 맞는 수'}],
      '지필드':[{b:'GM중급',u:'3-3 큰 수와 조건에 맞는 수 ★2.7'}]
    },pts:['두 자리·세 자리·네 자리로 나누어 세기','1이 정확히 두 개이고 서로 붙어 있는지 확인하기','조건을 만족하는 수들의 모든 자리 숫자 합 구하기']},
    25:{label:'이진법',connectionKind:'same-type',books:{
      '소마':[{b:'프리미어 중급2',u:'4호 고대의 수와 숫자 ★3.4'},{b:'프리미어 중급8',u:'1호 레비오사 마법카드(5진법) ★3.4'}],
      '필즈더클래식':[{b:'더클래식 1과정 6권',u:'CH04 수와 숫자의 개수'},{b:'더클래식 2과정 A-3권',u:'CH3 수와 숫자의 개수'}],
      '지필드':[{b:'ThinkingCore',u:'CH2 Numbers(1)'}]
    },pts:['알파벳 순서를 십진수로 먼저 바꾸기','16·8·4·2·1 자리로 나누어 5자리 이진수 쓰기','전체 자릿수에서 1의 개수를 빼 0의 개수 구하기']},
    26:{label:'반복 숫자 덧셈의 재치 있는 계산',connectionKind:'same-type',books:{
      '지필드':[{b:'ThinkingCore',u:'CH1 NUMBERS · 재치 있게 계산하기'}]
    },pts:['3·33·333을 먼저 따로 더하기','나머지 항은 같은 수가 몇 번 나오는지 세어 곱하기','마지막 네 자리만 필요하면 10000으로 나눈 나머지 확인하기']}
  };
  var LAST2_SUBAREAS=[
    '일과 작업량','자리 수와 조건 세기','달력·요일','등차 관계와 나이','쌓기나무·세 방향 투영',
    '도형의 개수','수열과 규칙','간격·속력','마디수열·규칙찾기','수와 숫자 세기',
    '수 배열의 합','자리 수 범위가 없는 두 수의 곱의 최대·최소','거울 시계','수량 관계','도형 암호',
    '몫과 나머지','수 배열의 규칙','규칙 따라 건너뛰기','대각선 수 배열','비례 배분',
    '거꾸로 풀기','소수 자릿수 세기','일·속력·시간','조건에 맞는 수','재치 있게 계산하기',
    '정답 추리','달력·요일','일과 작업량','쌓기나무 성냥개비','거리·속력·시간'
  ];
  var LAST2_PRESCRIPTION_HINTS=[
    '일에 관한 문제','조건에 맞는 수','요일','등차수열','쌓기나무',
    '사각형의 개수','수열','간격','반복마디','특정 숫자 세기',
    '가우스 덧셈','', '고장난 시계','합과 차','암호',
    '몫과 나머지','수 배열표','우기기','가우스 덧셈','비례식',
    '거꾸로 해결하기','', '일에 관한 문제','조건에 맞는 수','재치 있게 계산하기',
    '논리추리','요일','일에 관한 문제','쌓기나무','거리 속력 시간'
  ];
  var LAST2_PRESCRIPTION_OVERRIDES={
    12:{label:'자리 수 범위가 없는 두 수의 곱의 최대·최소',connectionKind:'same-type',books:{},pts:[
      '문제에 두 자리 수끼리 곱한다는 조건이 있는지 먼저 확인하기',
      '최댓값은 두 자리×두 자리와 세 자리×한 자리를 모두 비교하기',
      '최솟값도 자리 수를 고정하지 말고 모든 나눔을 비교하기'
    ]}
  };

  // Last3 approved variant taxonomy; source answers, rates and grade bands stay intact.
  var LAST3_SUBAREAS=['쌓기나무','시계의 겹침','고장 난 시계','수량 관계','몫과 나머지','금액의 경우의 수','수열과 규칙','고장 난 시계','악수의 경우의 수','달력·요일','합과 차','기호 넣기','수의 총합','포함과 배제','최단거리','조건에 맞는 수','영역의 개수','종이 접기','도형의 개수','수량 관계','몫과 나머지','수량 관계','일과 작업량','수열과 규칙','수열과 규칙','넓이와 규칙','자리배치','진법·암호','수량 관계','논리추리'];
  // These are source-question matches to existing curriculum chapters. Keep the
  // exact learning action separate from the broad keyword library so a clock
  // error cannot inherit the clock-angle tip, for example.
  var LAST3_STUDY=[
    ['쌓기나무','겉면에 닿은 블록을 한꺼번에 걷어낼 때 내부에 남는 층을 세기'],
    ['시침','시침과 분침이 12시간 동안 11번 겹치는 규칙으로 시간 구간 세기'],
    ['고장난 시계','시계가 빨라진 누적 시간이 12시간이 되는 때 구하기'],
    ['합과 차','전체 합과 두 부분의 합의 차로 각 사람의 수를 차례로 구하기'],
    ['약수','연속한 수의 곱에 들어 있는 2의 개수를 세어 4로 나눌 횟수 구하기'],
    ['지폐','세 장을 고른 금액을 작은 단위로 환산해 중복 없이 세기'],
    ['숫자카드','자릿수를 나누고 앞자리보다 작은 숫자를 골라 내림차순으로 배열하기'],
    ['고장난 시계','빠른 시계와 느린 시계의 표시 차이를 시간당 차이로 나누기'],
    ['리그','전체 악수 쌍에서 부부 쌍을 뺀 뒤 동시 진행 횟수로 시간 구하기'],
    ['요일','두 날짜 사이의 날수를 세고 7로 나눈 나머지로 요일 옮기기'],
    ['합과 차','처음 수가 같은 두 약병의 남은 양 차이로 지난 날수 구하기'],
    ['기호를 넣','모두 더한 합에서 목표값을 뺀 뒤 마이너스로 바꿀 수의 합 구하기'],
    ['숫자카드','맨 앞자리의 0과 끝자리의 짝수 조건을 구분해 자릿값별 합 구하기'],
    ['포함과 배제','한 문제도 풀지 않은 학생을 제외하고 겹쳐 푼 인원을 분리하기'],
    ['최단거리','필수로 지나는 점과 지나면 안 되는 점을 구분해 최단 경로 세기'],
    ['특정 숫자 세기','같은 숫자가 반복되지 않는 수를 자릿수별로 세어 목표 순서 찾기'],
    ['도형의 개수','새 직선이 기존 직선과 내부에서 만나는 횟수로 영역 증가량 구하기'],
    ['색종이','접은 순서를 거꾸로 펼쳐 겹친 부분과 구멍의 위치 확인하기'],
    ['사각형의 개수','필수 칸을 포함하는 직사각형에서 제외 칸을 함께 포함한 경우 빼기'],
    ['우기기','남은 학생을 모두 같은 정답 개수로 가정하고 실제 총합의 차이 비교하기'],
    ['나머지','세 수의 나머지가 같다는 조건과 전체 합을 함께 이용하기'],
    ['분수','전체를 같은 묶음으로 놓고 버스별 운송량의 비를 비교하기'],
    ['일률','전체 일을 사람·일로 환산하고 마감일부터 필요한 근무일을 거꾸로 세기'],
    ['묶음 수열','분자와 분모의 합이 같은 묶음으로 나눠 가분수를 세기'],
    ['수열','나무 수와 해마다 열리는 사과 수의 배율을 구분하기'],
    ['도형의 개수','한 단계의 넓이를 6×단계 수×단계 수로 구하고, 원문은 6으로, 유사문제는 각 지문에 적힌 수로 나눈 나머지를 구하기'],
    ['경우의 수','붙어 앉는 두 사람을 한 묶음으로 세고 묶음 안의 순서 곱하기'],
    ['논리','개수·모양·채움 여부를 각각 대응시켜 그림 암호 해석하기'],
    ['우기기','모든 구간을 짧은 길로 가정하고 실제 거리와의 차이로 긴 구간 수 구하기'],
    ['줄 세우기','순위 조건을 표로 정리하고 확정된 자리부터 채우기']
  ];
  var LAST3_STUDY_OVERRIDES={
    5:{label:'소인수분해 기초',connectionKind:'prerequisite',books:{'지필드':[{b:'ThinkingCore',u:'CH1 소인수분해'}]}},
    9:{label:'악수의 경우의 수',connectionKind:'same-type',books:{'필즈더클래식':[{b:'더클래식 1과정 5권',u:'삼각수와 사각수 · 악수 총 횟수'}]}},
    12:{label:'연산기호 넣기 기초',connectionKind:'prerequisite',books:{'소마':[{b:'프리미어 중급 4',u:'1호 자동차 번호판 · 사칙연산'}]}},
    17:{label:'교점과 영역의 개수',connectionKind:'same-type',books:{'지필드':[{b:'GM중급',u:'5-1 도형의 개수 · 교점과 영역의 개수'}]}},
    22:{label:'비로 나타낸 운송량',connectionKind:'prerequisite',books:{'필즈더클래식':[{b:'더클래식 2과정 A-1권',u:'CH3 분수와 비'}]}},
    23:{label:'일률',connectionKind:'same-type',books:{'지필드':[{b:'ThinkingCore',u:'CH2 Algebra 일률'}]}},
    26:{label:'도형의 넓이와 규칙',connectionKind:'prerequisite',books:{'필즈더클래식':[{b:'더클래식 1과정 9권',u:'도형의 분할과 넓이'}]}},
    27:{label:'붙어 앉는 자리배치',connectionKind:'prerequisite',books:{'지필드':[{b:'ThinkingCore',u:'CH5 경우의 수'}]}},
    28:{label:'논리 암호 기초',connectionKind:'prerequisite',books:{'지필드':[{b:'GIFTED MATH V1-2',u:'CH2 마방진·논리추리'}]}}
  };

  model.blueprint=Array.from({length:30},function(_,index){
    return {no:index+1,pts:point(index+1)};
  });
  model.areas=[];
  Object.keys(scoreModel.rounds).forEach(function(key){
    (scoreModel.rounds[key].items||[]).forEach(function(item){
      if(item.area&&model.areas.indexOf(item.area)<0) model.areas.push(item.area);
    });
  });

  Object.keys(scoreModel.rounds).forEach(function(key){
    var round=Number(key),source=scoreModel.rounds[key],paper=model.rounds[key];
    if(!paper||!source||!Array.isArray(source.items)||source.items.length!==30) return;
    var answers=answerRows(round);
    if(answers.length!==30) return;
    paper.items=source.items.map(function(meta,index){
      var detailedSource=round===1?root.GFIELD_LAST1_DETAILED:(round===2?root.GFIELD_LAST2_DETAILED:null);
      var row=answers[index]||{},detail=detailedSource&&detailedSource.items[index];
      var reviewedRound=round===1||round===2;
      return {
        no:index+1,
        type:round===3&&index===25?'정육각형 단계별 넓이 합의 나머지':meta.type,
        area:meta.area,
        subarea:round===1?LAST1_SUBAREAS[index]:(round===2?LAST2_SUBAREAS[index]:(round===3?LAST3_SUBAREAS[index]:'')),
        taxonomyReviewStatus:reviewedRound||round===3?'verified-source-bound':'candidate',
        prescriptionType:round===1?LAST1_PRESCRIPTION_HINTS[index]:(round===2?LAST2_PRESCRIPTION_HINTS[index]:(round===3?LAST3_STUDY[index][0]:undefined)),
        prescriptionOverride:round===1?LAST1_PRESCRIPTION_OVERRIDES[index+1]:(round===2?LAST2_PRESCRIPTION_OVERRIDES[index+1]:(round===3?LAST3_STUDY_OVERRIDES[index+1]:undefined)),
        studyPoints:round===3?[LAST3_STUDY[index][1]]:undefined,
        pts:point(index+1),
        answer:String(row.answer==null?'':row.answer),
        comment:String(row.explanation||''),
        t:Number(source.videoTimes[index])||0,
        tag:tagFor(meta.type),
        caution:String(row.caution||(detail&&detail.caution)||'문제의 조건과 답의 단위를 끝까지 확인하세요.'),
        detailedSolution:reviewedRound&&row.status==='verified'
      };
    });
    paper.video=source.video||paper.video;
    paper.reportedAverage=Number(source.average);
    paper.stats={
      mean:Number(source.average),
      n:Number(source.cohortSize)||0,
      dist:Array.isArray(source.scoreDist)?source.scoreDist.slice():[],
      percentileTable:Array.isArray(source.percentileTable)?source.percentileTable.map(function(row){return row.slice();}):null,
      rate:source.rates.reduce(function(out,value,index){out[index+1]=Number(value);return out;},{}),
      cuts:(source.scoreBands||[]).map(function(row){return [cleanGrade(row[0]),Number(row[1])];}),
      rankEvidence:{
        status:'verified-source-rank',
        sourceId:'last-score-data-'+key,
        sourceRef:'2024 최종 모의고사 '+key+'회 회차별 원점수 석차 백분율 기준',
        verifiedAt:'2026-09-11'
      },
      rateEvidence:{
        status:'verified-source-aggregate',
        reference:'last-score-data-'+key,
        version:'last-'+key+'-source-aggregate-20260823',
        scope:'provided-original-records',
        precision:'source-ratio'
      }
    };
  });

  var requested=new URLSearchParams(root.location&&root.location.search||'').get('round')||'1';
  var current=scoreModel.rounds[requested]||scoreModel.rounds['1'];
  model.cumulative={
    label:'회차별 최초 성적의 석차 백분율 평균',
    bands:(current.cumulativeBands||[]).map(function(row){return [cleanGrade(row[1]),Number(row[0])];})
  };
  model.reportDataVersion='2026-09-11-last-common-report-v1';
})(window);
