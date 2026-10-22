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

  var LAST4_SUBAREAS=["참·거짓 추론", "벌레먹은 셈", "세 방향 투영", "거꾸로 계산", "원형 간격", "도형 암호", "종이 접기", "세 항 합 수열", "두 계획의 배분", "이동 시간", "마방진", "직육면체 개수", "숫자 세기", "자리 추론", "직사각형 개수", "도형 숫자", "고장 난 시계", "숫자 배치", "조건식 완성", "서로 다른 합", "자리 배치", "일의 순서와 시간", "조각 채우기", "순서 있는 점수", "동전 구성", "풀의 성장과 소비", "갈림길 배분", "공간의 포함과 배제", "금지 숫자", "성냥개비와 정육면체"];
  var LAST4_STUDY=[["논리", "각 상자가 비었다고 가정하여 참인 문장의 개수가 하나인 경우 찾기"], ["복면산", "일의 자리부터 받아내림과 서로 다른 숫자 사용 조건 함께 확인하기"], ["쌓기나무", "위 그림의 칸을 고정하고 앞·옆에서 보이는 최대 높이를 함께 적용하기"], ["거꾸로", "남은 길이에서 절반씩 사용한 횟수만큼 두 배로 거슬러 올라가기"], ["간격", "마주 보는 두 번호의 차이가 전체의 절반임을 이용하기"], ["논리", "기호의 둘레 선 모양을 표의 칸과 대응시켜 식으로 읽기"], ["종이 접기", "접을 때 이동하는 면과 뒤집히는 층 순서를 구분하기"], ["수열", "앞의 세 항의 합에서 일의 자리를 취하는 규칙을 반복하기"], ["합과 차", "두 배분 계획에서 추가되는 양과 받지 못한 학생의 몫 비교하기"], ["속력", "이동한 층수와 출발 시간 차이를 구분해 도착 시각 비교하기"], ["마방진", "같은 합을 갖는 행과 대각선을 비교해 공통 빈칸 소거하기"], ["직육면체의 개수", "세 방향에서 서로 다른 두 경계면을 고르는 경우의 수 곱하기"], ["특정 숫자 세기", "배수 조건을 먼저 적용하고 각 자릿수의 숫자 출현 횟수 세기"], ["줄 세우기", "한 자리를 고정한 뒤 시계 방향과 맞은편 조건으로 배치하기"], ["사각형의 개수", "가로·세로 방향과 기울어진 방향의 직사각형을 나누어 세기"], ["논리", "세로줄의 자릿값과 점의 높이에 따른 값을 구분해 수로 나타내기"], ["고장난 시계", "12시간 표시가 다시 일치하는 데 필요한 누적 지연 시간 구하기"], ["숫자카드", "가운데 짝수 조건부터 고정하고 숫자 중복 없이 식 완성하기"], ["마방진", "나눗셈과 곱셈 조건을 먼저 좁힌 뒤 여덟 수의 중복 확인하기"], ["경우의 수", "두 점수의 합을 모두 구하고 같은 합은 한 번만 세기"], ["경우의 수", "반드시 사용하는 의자에 앉는 학생을 나누고 자기 번호 자리 제외하기"], ["일률", "먼저 끝낼 일을 연결하고 두 사람이 동시에 할 일을 시간표로 배치하기"], ["타일", "조각을 모두 사용한 배치에서 같은 색칠 모양과 대칭 중복 제거하기"], ["경우의 수", "최대 점수에서 깎인 점수의 합으로 바꿔 순서 있는 경우 세기"], ["금액", "동전 수와 총액으로 처음 구성을 찾고 두 구매의 동전 수 함께 적용하기"], ["일률", "처음 풀과 매일 자라는 풀을 구분해 두 소비 기간의 차이 비교하기"], ["분수", "갈림길에서 전체의 몇 분의 몇이 각 전시실로 가는지 합하기"], ["포함과 배제", "세 방향 검은 줄의 겹침을 한 번만 세고 층별 합 확인하기"], ["특정 숫자 세기", "금지 숫자가 없는 수를 자릿수와 상한에 따라 나누어 세기"], ["성냥개비", "처음 한 개와 추가 한 개의 성냥 수를 구분하고 최대 개수와 남는 수 확인하기"]];

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
        subarea:round===1?LAST1_SUBAREAS[index]:(round===2?LAST2_SUBAREAS[index]:(round===3?LAST3_SUBAREAS[index]:(round===4?LAST4_SUBAREAS[index]:''))),
        taxonomyReviewStatus:reviewedRound||round===3||round===4?'verified-source-bound':'candidate',
        prescriptionType:round===1?LAST1_PRESCRIPTION_HINTS[index]:(round===2?LAST2_PRESCRIPTION_HINTS[index]:(round===3?LAST3_STUDY[index][0]:(round===4?LAST4_STUDY[index][0]:undefined))),
        prescriptionOverride:round===1?LAST1_PRESCRIPTION_OVERRIDES[index+1]:(round===2?LAST2_PRESCRIPTION_OVERRIDES[index+1]:(round===3?LAST3_STUDY_OVERRIDES[index+1]:undefined)),
        studyPoints:round===3?[LAST3_STUDY[index][1]]:(round===4?[LAST4_STUDY[index][1]]:undefined),
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
