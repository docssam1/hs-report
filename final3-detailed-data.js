(function(root){
  'use strict';

  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function(key){deepFreeze(value[key]);});
    return Object.freeze(value);
  }

  function text(value){
    return typeof value==='string'&&value.trim()?value.trim():'';
  }

  function scalar(value){
    return typeof value==='string'||(typeof value==='number'&&Number.isFinite(value));
  }

  function validTable(table){
    if(table==null) return true;
    if(!table||!text(table.caption)||!Array.isArray(table.headers)||!table.headers.length||!Array.isArray(table.rows)||!table.rows.length) return false;
    var width=table.headers.length;
    return table.headers.every(scalar)&&table.rows.every(function(row){
      return Array.isArray(row)&&row.length===width&&row.every(scalar);
    });
  }

  var DIAGRAMS=deepFreeze({
    1:'final3-q1-fruit-branch-recurrence-v1',
    3:'final3-q3-alternating-tile-rings-v1',
    4:'final3-q4-finger-cycle-v1',
    6:'final3-q6-folded-paper-five-layers-v1',
    7:'final3-q7-balance-equations-v1',
    8:'final3-q8-stepped-mountain-paths-v1',
    13:'final3-q13-honeycomb-forward-paths-v1'
  });

  var ANSWER_BINDINGS=deepFreeze(  [
    {
      "no": 1,
      "canonicalExact": "144,233",
      "displayAnswerExact": "바나나 144개, 사과 233개"
    },
    {
      "no": 2,
      "canonicalExact": "성은",
      "displayAnswerExact": "성은"
    },
    {
      "no": 3,
      "canonicalExact": "188",
      "displayAnswerExact": "검은 타일 188개"
    },
    {
      "no": 4,
      "canonicalExact": "오른손 중지",
      "displayAnswerExact": "오른손 중지"
    },
    {
      "no": 5,
      "canonicalExact": "목요일",
      "displayAnswerExact": "목요일"
    },
    {
      "no": 6,
      "canonicalExact": "21",
      "displayAnswerExact": "21개"
    },
    {
      "no": 7,
      "canonicalExact": "원, 1",
      "displayAnswerExact": "동그라미 1개"
    },
    {
      "no": 8,
      "canonicalExact": "5544",
      "displayAnswerExact": "5544가지"
    },
    {
      "no": 9,
      "canonicalExact": "15,9,36,4",
      "displayAnswerExact": "15, 9, 36, 4"
    },
    {
      "no": 10,
      "canonicalExact": "124",
      "displayAnswerExact": "124개"
    },
    {
      "no": 11,
      "canonicalExact": "118",
      "displayAnswerExact": "118"
    },
    {
      "no": 12,
      "canonicalExact": "9",
      "displayAnswerExact": "9개"
    },
    {
      "no": 13,
      "canonicalExact": "377",
      "displayAnswerExact": "377가지"
    },
    {
      "no": 14,
      "canonicalExact": "35,21",
      "displayAnswerExact": "관호 35살, 주연 21살"
    },
    {
      "no": 15,
      "canonicalExact": "13",
      "displayAnswerExact": "13"
    }
  ]);

  var CONTRACT=deepFreeze({
    schemaVersion:1,
    round:3,
    expectedCount:15,
    totalQuestions:30,
    expectedNos:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    requiredDiagramNos:[1,3,4,6,7,8,13],
    evidenceStatus:'verified',
    independentReviewStatus:'verified',
    releaseStatus:'eligible',
    reviewId:'final3-detailed-review-20260909',
    learnerStage:'초등 선발 대비 파이널 모의고사 수강생',
    learnerFitCriteria:['language','representations','prerequisites','reasoning-load','response-mode'],
    answerVisibility:'post-attempt'
  });

  function formatComment(item){
    return [
      '정답 · '+item.displayAnswer,
      '',
      '읽을 조건 · '+item.read,
      '',
      '풀이 전략 · '+item.method,
      '',
      item.steps.map(function(step,index){return (index+1)+'단계 '+step.title+' · '+step.body;}).join('\n\n'),
      '',
      '검산 · '+item.check,
      '',
      '주의할 점 · '+item.caution
    ].join('\n');
  }

  var RAW_ITEMS=  [
    {
      "no": 1,
      "title": "과일이 바뀌는 규칙으로 14번째 줄 찾기",
      "answer": "144,233",
      "displayAnswer": "바나나 144개, 사과 233개",
      "sourceLocator": "materials/final_3/001.jpg#q1",
      "read": "1번째 줄에는 바나나 1개가 있습니다. 그림의 가지를 보면 바나나는 다음 줄에 사과 1개가 되고, 사과는 다음 줄에 바나나 1개와 사과 1개를 만듭니다. 이 규칙으로 14번째 줄의 바나나 수와 사과 수를 각각 구합니다.",
      "method": "매번 그림 전체를 그리는 대신 ‘바나나 수, 사과 수’를 한 쌍으로 적습니다. 다음 줄의 바나나 수는 지금 줄의 사과 수이고, 다음 줄의 사과 수는 지금 줄의 전체 과일 수입니다.",
      "steps": [
        {
          "title": "한 과일이 다음 줄에서 어떻게 바뀌는지 읽기",
          "body": "바나나 1개는 사과 1개로 이어집니다. 사과 1개는 바나나 1개와 사과 1개로 갈라집니다. 따라서 지금 줄이 (바나나 B개, 사과 A개)이면 다음 줄은 (A개, B+A개)입니다."
        },
        {
          "title": "14번째 줄까지 두 수를 함께 적기",
          "body": "앞줄에서 얻은 두 수만 있으면 다음 줄을 바로 만들 수 있습니다.",
          "table": {
            "caption": "줄별 바나나와 사과 수",
            "headers": [
              "줄",
              "바나나",
              "사과"
            ],
            "rows": [
              [
                "1",
                "1",
                "0"
              ],
              [
                "2",
                "0",
                "1"
              ],
              [
                "3",
                "1",
                "1"
              ],
              [
                "4",
                "1",
                "2"
              ],
              [
                "5",
                "2",
                "3"
              ],
              [
                "6",
                "3",
                "5"
              ],
              [
                "7",
                "5",
                "8"
              ],
              [
                "8",
                "8",
                "13"
              ],
              [
                "9",
                "13",
                "21"
              ],
              [
                "10",
                "21",
                "34"
              ],
              [
                "11",
                "34",
                "55"
              ],
              [
                "12",
                "55",
                "89"
              ],
              [
                "13",
                "89",
                "144"
              ],
              [
                "14",
                "144",
                "233"
              ]
            ]
          }
        },
        {
          "title": "묻는 두 수로 답하기",
          "body": "14번째 줄의 첫째 수는 바나나 수 144이고, 둘째 수는 사과 수 233입니다. 따라서 바나나 144개, 사과 233개입니다."
        }
      ],
      "check": "각 줄의 전체 과일 수는 1, 1, 2, 3, 5, …가 되어 앞의 두 줄 전체 수의 합과 같습니다. 14번째 줄의 전체도 144+233=377이고, 앞의 전체 144와 233을 더한 값입니다.",
      "caution": "문제는 전체 과일 수 하나가 아니라 바나나와 사과의 수를 따로 묻습니다. 답을 377개로만 쓰지 않습니다.",
      "diagram": "final3-q1-fruit-branch-recurrence-v1"
    },
    {
      "no": 2,
      "title": "관계 단서를 하나씩 지워 건축가 찾기",
      "answer": "성은",
      "displayAnswer": "성은",
      "sourceLocator": "materials/final_3/001.jpg#q2",
      "read": "성은, 주미, 인성, 현우는 건축가, 배우, 교사, 작곡가를 하나씩 맡습니다. 건축가·배우·인성은 친하고, 배우는 작곡가를 모르며, 작곡가는 인성의 옆집에 삽니다. 주미는 건축가와 결혼했고, 현우는 신곡 작업을 시작했습니다. 건축가의 이름을 찾습니다.",
      "method": "직업이 거의 바로 드러나는 현우부터 정하고, 각 단서에서 같은 사람이 될 수 없는 자리를 지웁니다. 마지막에 건축가 자리에 남는 이름을 고릅니다.",
      "steps": [
        {
          "title": "현우의 직업부터 정하기",
          "body": "‘신곡 작업’은 작곡가의 일입니다. 따라서 현우는 작곡가입니다."
        },
        {
          "title": "인성과 주미가 건축가가 될 수 없는 까닭 찾기",
          "body": "첫 단서의 건축가, 배우, 인성은 서로 다른 사람으로 등장하므로 인성은 건축가가 아닙니다. 또 주미는 ‘건축가와 결혼한 사람’이므로 주미 자신이 건축가는 아닙니다."
        },
        {
          "title": "남은 이름을 건축가 자리에 넣기",
          "body": "현우는 작곡가이고, 인성과 주미도 건축가가 아닙니다. 네 이름 중 건축가가 될 수 있는 사람은 성은만 남습니다.",
          "table": {
            "caption": "직업 배정 확인",
            "headers": [
              "이름",
              "직업"
            ],
            "rows": [
              [
                "성은",
                "건축가"
              ],
              [
                "주미",
                "배우"
              ],
              [
                "인성",
                "교사"
              ],
              [
                "현우",
                "작곡가"
              ]
            ]
          }
        }
      ],
      "check": "완성한 표에서 네 사람의 직업은 모두 다릅니다. 현우는 신곡 작업을 하고, 작곡가는 인성의 옆집에 살며, 주미는 건축가 성은과 결혼한 사람으로 모든 단서에 어긋나지 않습니다.",
      "caution": "‘친하다’, ‘모른다’, ‘옆집에 산다’, ‘결혼했다’를 모두 같은 관계로 바꾸어 읽지 않습니다. 각 문장이 알려 주는 제외 조건만 사용합니다."
    },
    {
      "no": 3,
      "title": "48회에 새로 붙이는 검은 타일 수 찾기",
      "answer": "188",
      "displayAnswer": "검은 타일 188개",
      "sourceLocator": "materials/final_3/001.jpg#q3",
      "read": "1회에는 흰 타일, 2회에는 검은 타일, 3회에는 흰 타일, 4회에는 검은 타일을 번갈아 붙입니다. 그림에서 2회, 3회, 4회에 새로 붙는 타일은 각각 4개, 8개, 12개입니다. 48회에 ‘새로 붙이는’ 타일의 색과 수를 묻습니다.",
      "method": "회가 한 번 늘 때마다 바깥 테두리에 붙는 타일이 4개씩 늘어나는 규칙과, 홀수 회는 흰색·짝수 회는 검은색이라는 색 규칙을 따로 봅니다.",
      "steps": [
        {
          "title": "처음 네 회의 새 타일 수 적기",
          "body": "가운데 한 칸을 붙이는 1회 뒤에는 새 테두리마다 4개씩 더 많아집니다.",
          "table": {
            "caption": "회별 새로 붙이는 타일",
            "headers": [
              "회",
              "색",
              "새 타일 수"
            ],
            "rows": [
              [
                "1",
                "흰색",
                "1"
              ],
              [
                "2",
                "검은색",
                "4"
              ],
              [
                "3",
                "흰색",
                "8"
              ],
              [
                "4",
                "검은색",
                "12"
              ]
            ]
          }
        },
        {
          "title": "48회의 새 타일 수 계산하기",
          "body": "2회부터 n회에 새로 붙는 수는 4×(n-1)입니다. 따라서 48회에는 4×47=188개를 붙입니다."
        },
        {
          "title": "48회의 색 정하기",
          "body": "색은 흰색, 검은색으로 번갈아 나옵니다. 48은 짝수이므로 48회에 붙이는 타일은 검은색입니다."
        }
      ],
      "check": "식 4×(n-1)에 n=2,3,4를 넣으면 그림의 4,8,12가 모두 나옵니다.",
      "caution": "48회까지 벽에 붙어 있는 전체 타일 수나 흰색·검은색 전체 수를 구하는 문제가 아닙니다. 48회에 새로 붙이는 한 겹만 셉니다.",
      "diagram": "final3-q3-alternating-tile-rings-v1"
    },
    {
      "no": 4,
      "title": "18개 손가락 순서에서 3000번째 자리 찾기",
      "answer": "오른손 중지",
      "displayAnswer": "오른손 중지",
      "sourceLocator": "materials/final_3/001.jpg#q4",
      "read": "그림의 번호는 왼손 엄지에서 새끼손가락까지 갔다가 돌아오고, 이어 오른손 엄지에서 새끼손가락까지 갔다가 돌아오는 순서입니다. 19는 다시 왼손 엄지, 20은 왼손 검지이므로 1~18이 반복됩니다. 3000을 세는 손과 손가락을 찾습니다.",
      "method": "3000을 반복마디의 길이 18로 나눈 나머지를 구하고, 그림에서 그 번호가 붙은 손가락을 읽습니다.",
      "steps": [
        {
          "title": "한 반복마디를 정확히 적기",
          "body": "1~18의 순서를 손과 손가락으로 적으면 다음과 같습니다.",
          "table": {
            "caption": "18칸 손가락 반복",
            "headers": [
              "번호",
              "손과 손가락"
            ],
            "rows": [
              [
                "1",
                "왼손 엄지"
              ],
              [
                "2",
                "왼손 검지"
              ],
              [
                "3",
                "왼손 중지"
              ],
              [
                "4",
                "왼손 약지"
              ],
              [
                "5",
                "왼손 소지"
              ],
              [
                "6",
                "왼손 약지"
              ],
              [
                "7",
                "왼손 중지"
              ],
              [
                "8",
                "왼손 검지"
              ],
              [
                "9",
                "왼손 엄지"
              ],
              [
                "10",
                "오른손 엄지"
              ],
              [
                "11",
                "오른손 검지"
              ],
              [
                "12",
                "오른손 중지"
              ],
              [
                "13",
                "오른손 약지"
              ],
              [
                "14",
                "오른손 소지"
              ],
              [
                "15",
                "오른손 약지"
              ],
              [
                "16",
                "오른손 중지"
              ],
              [
                "17",
                "오른손 검지"
              ],
              [
                "18",
                "오른손 엄지"
              ]
            ]
          }
        },
        {
          "title": "3000을 18칸씩 묶기",
          "body": "3000=18×166+12입니다. 18칸짜리 묶음 166개 뒤의 12번째 자리입니다."
        },
        {
          "title": "12번 손가락 읽기",
          "body": "표와 원본 그림에서 12번은 오른손 중지입니다."
        }
      ],
      "check": "18×166=2988이므로 2989가 새 반복의 1번, 3000이 그 반복의 12번입니다.",
      "caution": "그림의 19는 왼손 검지가 아니라 왼손 엄지에 붙은 수입니다. 반복 길이를 17로 잡지 않습니다.",
      "diagram": "final3-q4-finger-cycle-v1"
    },
    {
      "no": 5,
      "title": "기준 날짜에서 7일 묶음으로 요일 찾기",
      "answer": "목요일",
      "displayAnswer": "목요일",
      "sourceLocator": "materials/final_3/002.jpg#q5",
      "read": "문제에서 2021년 한글날인 10월 9일을 목요일이라고 정했습니다. 이 날짜에서 2025년 3월 1일까지 며칠이 지나는지 세어 삼일절의 요일을 구합니다.",
      "method": "같은 날짜까지 1년씩 이동한 뒤 남은 달의 날짜 수를 더합니다. 전체 날짜 수를 7로 나눈 나머지가 0이면 요일은 그대로입니다.",
      "steps": [
        {
          "title": "2024년 윤년을 포함해 1년씩 이동하기",
          "body": "2021-10-09→2022-10-09는 365일, 다음 1년은 365일, 2023-10-09→2024-10-09는 2월 29일을 지나므로 366일입니다."
        },
        {
          "title": "2024년 10월 9일부터 2025년 3월 1일까지 세기",
          "body": "31+30+31+31+20=143일입니다. 따라서 전체는 365+365+366+143=1239일입니다."
        },
        {
          "title": "7일 묶음으로 요일 정하기",
          "body": "1239=7×177이므로 요일이 정확히 177주 돌아옵니다. 시작과 같은 목요일입니다."
        }
      ],
      "check": "7로 나눈 나머지가 0이므로 요일을 앞으로 옮길 칸이 없습니다.",
      "caution": "문제가 준 기준 요일을 사용합니다. 알고 있는 실제 달력의 요일로 기준을 바꾸지 않습니다."
    },
    {
      "no": 6,
      "title": "접힌 다섯 겹과 오린 모양을 나누어 세기",
      "answer": "21",
      "displayAnswer": "21개",
      "sourceLocator": "materials/final_3/002.jpg#q6",
      "read": "종이의 윗정사각형을 대각선으로 두 번 접어 가운데 삼각형을 만들고, 아래 직사각형을 위로 접습니다. 마지막 그림에서 완전한 작은 원 네 곳과 접는 선 위의 반원 한 곳을 오린 뒤 펼쳤을 때 완전한 원만 셉니다.",
      "method": "먼저 검은 표시의 모양을 ‘완전한 원 4개, 반원 1개’로 구분합니다. 그다음 완전한 원이 놓인 부분의 종이 겹 수를 세고, 접는 선 위 반원이 펼쳐질 때 만드는 원을 따로 더합니다.",
      "steps": [
        {
          "title": "완전한 원 네 곳의 겹 수 찾기",
          "body": "첫 대각 접기로 삼각형이 2겹, 둘째 대각 접기로 가운데 삼각형이 4겹이 됩니다. 마지막에 아래 직사각형 한 겹을 위로 접으므로 검은 원 네 곳은 각각 5겹입니다."
        },
        {
          "title": "완전한 원에서 생기는 원 세기",
          "body": "완전한 원 하나를 5겹에서 오리면 펼쳤을 때 원 5개가 생깁니다. 이런 표시가 네 곳이므로 4×5=20개입니다."
        },
        {
          "title": "접는 선 위 반원 더하기",
          "body": "가운데 큰 검은 표시는 접는 선에 붙은 반원입니다. 마지막 접기를 펼치면 반원 두 쪽이 만나 완전한 원 1개가 됩니다. 윗정사각형의 다른 세 겹에 난 반원은 펼치면 종이의 위·왼쪽·오른쪽 바깥선에 놓여 그대로 반원이므로 완전한 원으로 세지 않습니다. 따라서 20+1=21개입니다."
        }
      ],
      "check": "오림 표시를 표로 정리하면 ‘완전한 원 4곳×5겹=20개, 접는 선 위 반원 1곳→완전한 원 1개’입니다.",
      "caution": "아래쪽 양옆의 작은 검은 표시는 반원이 아니라 선 위쪽에 온전히 들어 있는 작은 원입니다. 반원으로 잘못 세면 겹 수가 빠집니다.",
      "diagram": "final3-q6-folded-paper-five-layers-v1"
    },
    {
      "no": 7,
      "title": "저울 두 개로 세 모양의 무게 비교하기",
      "answer": "원, 1",
      "displayAnswer": "동그라미 1개",
      "sourceLocator": "materials/final_3/002.jpg#q7",
      "read": "그림 1은 삼각형+동그라미와 네모 2개의 무게가 같고, 그림 2는 동그라미 5개+네모와 삼각형+네모의 무게가 같습니다. 그림 3의 왼쪽 네모 3개와 오른쪽 삼각형 2개의 차만큼 왼쪽에 더 올립니다.",
      "method": "동그라미 한 개의 무게를 1이라고 놓고, 앞의 두 평형에서 삼각형과 네모를 동그라미 몇 개와 같은지 바꿉니다.",
      "steps": [
        {
          "title": "그림 2에서 같은 네모 지우기",
          "body": "양쪽에 네모가 하나씩 있으므로 빼도 평형입니다. 동그라미 5개=삼각형 1개입니다."
        },
        {
          "title": "그림 1에서 네모 무게 찾기",
          "body": "삼각형+동그라미는 동그라미 5+1=6개의 무게입니다. 이것이 네모 2개와 같으므로 네모 하나는 동그라미 3개의 무게입니다.",
          "table": {
            "caption": "동그라미로 바꾼 무게",
            "headers": [
              "모양",
              "동그라미 몇 개 무게"
            ],
            "rows": [
              [
                "동그라미",
                "1"
              ],
              [
                "네모",
                "3"
              ],
              [
                "삼각형",
                "5"
              ]
            ]
          }
        },
        {
          "title": "그림 3의 양쪽 차이 구하기",
          "body": "왼쪽 네모 3개는 3×3=9, 오른쪽 삼각형 2개는 5×2=10입니다. 왼쪽에 동그라미 1개를 더하면 10으로 같아집니다."
        }
      ],
      "check": "추가 뒤 왼쪽은 네모 3개+동그라미 1개=9+1=10, 오른쪽은 삼각형 2개=10입니다.",
      "caution": "그림 2의 네모는 양쪽에 똑같이 있으므로 먼저 없애야 합니다. 동그라미 수를 4개로 잘못 보지 않습니다.",
      "diagram": "final3-q7-balance-equations-v1"
    },
    {
      "no": 8,
      "title": "계단 산길을 올라갔다 내려오는 최단경로 세기",
      "answer": "5544",
      "displayAnswer": "5544가지",
      "sourceLocator": "materials/final_3/002.jpg#q8",
      "read": "산길은 아래부터 가로로 9칸, 7칸, 5칸, 3칸, 1칸이 가운데에 놓인 계단 모양입니다. A는 맨 아래 왼쪽, B는 맨 위 한 칸의 왼쪽 위 꼭짓점, C는 맨 아래 오른쪽입니다. A에서 B까지 올라간 뒤 C까지 내려오는 전체 길이가 가장 짧은 방법을 셉니다.",
      "method": "A→B에서는 오른쪽과 위쪽으로만, B→C에서는 오른쪽과 아래쪽으로만 움직여야 최단입니다. 각 교차점에 그곳까지 오는 방법 수를 더해 두 구간을 따로 센 뒤 곱합니다.",
      "steps": [
        {
          "title": "A에서 B까지 누적하기",
          "body": "A에 1을 쓰고, 왼쪽 또는 아래쪽에서 들어오는 수를 더합니다. 계단 밖에는 길이 없으므로 그림의 선이 있는 곳만 더하면 B에는 42가 적힙니다.",
          "table": {
            "caption": "A→B 높이별 누적 수(왼쪽에서 오른쪽)",
            "headers": [
              "높이",
              "누적 수"
            ],
            "rows": [
              [
                "5",
                "42"
              ],
              [
                "4",
                "14, 42"
              ],
              [
                "3",
                "5, 14, 28"
              ],
              [
                "2",
                "2, 5, 9, 14"
              ],
              [
                "1",
                "1, 2, 3, 4, 5"
              ],
              [
                "0",
                "1, 1, 1, 1, 1"
              ]
            ]
          }
        },
        {
          "title": "B에서 C까지 누적하기",
          "body": "B에 다시 1을 쓰고 오른쪽과 아래쪽으로 내려가며 더합니다. C에는 132가 적힙니다.",
          "table": {
            "caption": "B→C 높이별 누적 수(왼쪽에서 오른쪽)",
            "headers": [
              "높이",
              "누적 수"
            ],
            "rows": [
              [
                "5",
                "1, 1"
              ],
              [
                "4",
                "1, 2, 2"
              ],
              [
                "3",
                "1, 3, 5, 5"
              ],
              [
                "2",
                "1, 4, 9, 14, 14"
              ],
              [
                "1",
                "1, 5, 14, 28, 42, 42"
              ],
              [
                "0",
                "1, 6, 20, 48, 90, 132"
              ]
            ]
          }
        },
        {
          "title": "두 구간의 선택을 이어 붙이기",
          "body": "A→B의 42가지 각각에 B→C의 132가지를 이어 붙일 수 있습니다. 따라서 42×132=5544가지입니다."
        }
      ],
      "check": "표의 수를 실제로 더해 확인합니다. A→B에서 B 바로 아래의 42는 왼쪽 14와 아래 28을 더한 수이고, B에는 그 42가 그대로 올라옵니다. B→C에서 C의 132는 왼쪽 90과 위 42를 더한 수입니다. 따라서 42×132=5544가 맞습니다.",
      "caution": "B까지 가는 수와 B에서 C까지 가는 수를 더하지 않습니다. 앞길 하나마다 뒷길을 모두 고를 수 있으므로 곱합니다.",
      "diagram": "final3-q8-stepped-mountain-paths-v1"
    },
    {
      "no": 9,
      "title": "같은 기준수에 네 연산을 적용해 64 만들기",
      "answer": "15,9,36,4",
      "displayAnswer": "15, 9, 36, 4",
      "sourceLocator": "materials/final_3/002.jpg#q9",
      "read": "64를 네 수로 나눕니다. 어떤 같은 수에 각각 3을 더한 수, 3을 뺀 수, 3을 곱한 수, 3으로 나눈 수가 차례로 네 수입니다.",
      "method": "공통으로 출발하는 수를 x라 놓고 네 결과의 합이 64라는 한 식을 만듭니다.",
      "steps": [
        {
          "title": "네 수를 x로 나타내기",
          "body": "차례대로 x+3, x-3, 3x, x÷3입니다."
        },
        {
          "title": "합이 64인 식 풀기",
          "body": "(x+3)+(x-3)+3x+x÷3=64입니다. +3과 -3이 없어지고, 5x+x÷3=64이므로 양쪽에 3을 곱하면 16x=192, x=12입니다."
        },
        {
          "title": "네 연산을 실제로 하기",
          "body": "12+3=15, 12-3=9, 12×3=36, 12÷3=4입니다."
        }
      ],
      "check": "15+9+36+4=64이고, 네 수가 모두 같은 기준수 12에서 문제의 네 연산으로 나옵니다.",
      "caution": "앞에서 나온 수에 다음 연산을 이어서 하는 문제가 아닙니다. 네 수 모두 같은 기준수 x에서 출발합니다."
    },
    {
      "no": 10,
      "title": "모두 졌다고 놓고 사탕 경기 결과 찾기",
      "answer": "124",
      "displayAnswer": "124개",
      "sourceLocator": "materials/final_3/003.jpg#q10",
      "read": "관호와 주연은 처음에 사탕 50개씩을 가집니다. 한 판의 승자는 상자에서 7개를 더 받고, 패자는 자기 사탕 4개를 상자에 넣습니다. 비긴 판 없이 20판 뒤 관호가 36개일 때 주연의 사탕 수를 구합니다.",
      "method": "관호가 20판을 모두 졌다고 먼저 놓습니다. 패배 하나를 승리 하나로 바꾸면 사탕 수가 -4에서 +7로 바뀌므로 11개씩 늘어납니다.",
      "steps": [
        {
          "title": "관호가 모두 졌을 때 계산하기",
          "body": "50-4×20=-30개가 됩니다. 실제 36개보다 66개 적습니다."
        },
        {
          "title": "관호의 승리 수 찾기",
          "body": "패배를 승리로 한 번 바꿀 때 7-(-4)=11개 늘어납니다. 66÷11=6이므로 관호는 6승 14패입니다."
        },
        {
          "title": "주연의 결과 계산하기",
          "body": "비긴 판이 없으므로 주연은 관호와 반대로 14승 6패입니다. 50+7×14-4×6=50+98-24=124개입니다.",
          "table": {
            "caption": "20판 뒤 두 사람",
            "headers": [
              "사람",
              "승",
              "패",
              "사탕"
            ],
            "rows": [
              [
                "관호",
                "6",
                "14",
                "36"
              ],
              [
                "주연",
                "14",
                "6",
                "124"
              ]
            ]
          }
        }
      ],
      "check": "두 사람이 처음 가진 합은 100개입니다. 20판 동안 상자에서 나온 것은 7×20=140개, 들어간 것은 4×20=80개이므로 두 사람 합은 160개입니다. 36+124=160입니다.",
      "caution": "승자가 패자에게서 7개를 받는 규칙이 아닙니다. 승자는 상자에서 받고 패자는 상자에 돌려놓습니다."
    },
    {
      "no": 11,
      "title": "199를 200-1로 바꾸어 자리 숫자 합 구하기",
      "answer": "118",
      "displayAnswer": "118",
      "sourceLocator": "materials/final_3/003.jpg#q11",
      "read": "숫자 1이 100개 이어진 수에 199를 곱합니다. 곱을 전부 길게 계산하기보다 결과의 자리 모양을 찾아 모든 자리 숫자의 합을 구합니다.",
      "method": "199=200-1로 바꾸어 ‘원래 수×200-원래 수’로 계산합니다. 짧은 같은 꼴에서 빌림 모양을 확인한 뒤 100자리로 늘립니다.",
      "steps": [
        {
          "title": "짧은 수로 자리 모양 확인하기",
          "body": "111×199=111×200-111=22200-111=22089입니다. 앞에는 22, 뒤에는 089가 남습니다."
        },
        {
          "title": "100자리 수로 모양 늘리기",
          "body": "1이 100개인 수에서는 결과가 ‘22 + 1이 97개 + 089’가 됩니다. 전체 자리 수는 2+97+3=102자리입니다."
        },
        {
          "title": "모든 자리 숫자 더하기",
          "body": "2+2+97×1+0+8+9=4+97+17=118입니다."
        }
      ],
      "check": "118을 9로 나눈 나머지는 1입니다. 원래 수의 자리 합 100과 199는 각각 9로 나눈 나머지가 1이므로 곱도 나머지 1이라 맞습니다.",
      "caution": "가운데 1의 개수는 100개가 아니라 97개입니다. 앞의 22와 뒤의 089가 세 자리를 차지합니다."
    },
    {
      "no": 12,
      "title": "양팔저울에서 487g을 재는 추 최소화하기",
      "answer": "9",
      "displayAnswer": "9개",
      "sourceLocator": "materials/final_3/003.jpg#q12",
      "read": "1g, 5g, 10g, 50g, 100g 추가 각각 5개씩 있습니다. 양팔저울에서는 물체가 있는 접시에도 추를 놓을 수 있습니다. 487g을 재는 데 쓰는 추의 최소 개수를 구합니다.",
      "method": "먼저 9개로 실제 평형을 만듭니다. 그다음 1g 추의 개수 차가 가질 수 있는 두 경우를 살펴 8개 이하로는 불가능함을 확인합니다.",
      "steps": [
        {
          "title": "9개로 평형 만들기",
          "body": "물체 쪽에 10g과 5g을 놓고, 반대쪽에 100g 5개와 1g 2개를 놓습니다. 487+10+5=500+1+1=502이므로 추는 1+1+5+2=9개입니다."
        },
        {
          "title": "1g 추의 차이부터 제한하기",
          "body": "5g 이상 추는 모두 5의 배수입니다. 487의 일의 자리 때문에 양쪽 1g 추 개수 차는 2개이거나 반대 방향으로 3개여야 합니다.",
          "table": {
            "caption": "8개 이하라고 했을 때 남는 조건",
            "headers": [
              "1g 추 차",
              "남은 추 최대",
              "5g 단위로 만들어야 할 차"
            ],
            "rows": [
              [
                "+2개",
                "6개",
                "97"
              ],
              [
                "-3개",
                "5개",
                "98"
              ]
            ]
          }
        },
        {
          "title": "8개 이하가 안 됨을 확인하기",
          "body": "97을 6개 이하로 만들 때 값 20인 100g 추가 3개 이하이면 만들 수 있는 최댓값은 3×20+3×10=90입니다. 4개이면 남은 두 값의 합이 17이어야 하지만 ±1, ±2, ±10 중 두 개로 17을 만들 수 없습니다. 5개이면 남은 한 값이 -3이어야 해 불가능하고, 6개는 100g 추가 5개뿐이어서 불가능합니다. 98을 5개 이하로 만들 때 값 20인 추가 3개 이하이면 최댓값은 3×20+2×10=80입니다. 4개이면 남은 한 값이 18이어야 해 불가능하고, 5개이면 100에서 2를 뺄 추가 남지 않습니다. 따라서 8개 이하는 불가능하고 최소는 9개입니다."
        }
      ],
      "check": "가능한 각 추의 양쪽 개수 차를 -5부터 5까지 넣어 모두 확인하면 최소 개수 9의 배치는 두 가지이고 8개 이하는 없습니다.",
      "caution": "100g 추는 5개만 있습니다. 500g을 만들 때 100g 추를 여섯 개 이상 쓰지 않습니다."
    },
    {
      "no": 13,
      "title": "앞으로 한 칸 또는 두 칸 가는 벌집 길 세기",
      "answer": "377",
      "displayAnswer": "377가지",
      "sourceLocator": "materials/final_3/003.jpg#q13",
      "read": "별 칸에서 시작해 가, 나, 다, … 순서의 앞으로만 이동하여 파 칸까지 갑니다. 공유한 변으로 이어진 칸만 갈 수 있고, 가에서 다처럼 한 글자를 건너뛸 수 있지만 다→나→가처럼 뒤로는 갈 수 없습니다.",
      "method": "별, 가, 나, …, 파를 한 줄의 순서로 놓습니다. 벌집에서 각 방은 바로 앞 방과 두 칸 앞 방에서 들어올 수 있으므로 두 방법 수를 더합니다.",
      "steps": [
        {
          "title": "원본 벌집의 연결을 순서로 바꾸기",
          "body": "위쪽은 별-나-라-바-아-차-타, 아래쪽은 가-다-마-사-자-카-파입니다. 서로 맞닿은 대각선까지 합치면 앞으로 이동할 때 다음 글자 또는 그다음 글자로 갑니다."
        },
        {
          "title": "각 방까지의 방법 수 누적하기",
          "body": "첫 별 칸은 1가지, 가 칸도 1가지입니다. 그다음부터는 앞의 두 수를 더합니다.",
          "table": {
            "caption": "방까지 오는 방법 수",
            "headers": [
              "방",
              "별",
              "가",
              "나",
              "다",
              "라",
              "마",
              "바",
              "사",
              "아",
              "자",
              "차",
              "카",
              "타",
              "파"
            ],
            "rows": [
              [
                "방법 수",
                "1",
                "1",
                "2",
                "3",
                "5",
                "8",
                "13",
                "21",
                "34",
                "55",
                "89",
                "144",
                "233",
                "377"
              ]
            ]
          }
        },
        {
          "title": "파 칸의 수 읽기",
          "body": "마지막 파 칸까지 오는 방법 수는 377입니다."
        }
      ],
      "check": "예를 들어 다까지는 별→가→나→다, 별→가→다, 별→나→다의 3가지여서 표의 3과 맞습니다. 같은 덧셈을 파까지 이어갑니다.",
      "caution": "글자 순서가 뒤로 가는 길은 세지 않습니다. 또 칸이 그림에서 맞닿지 않으면 글자를 건너뛸 수 없습니다.",
      "diagram": "final3-q13-honeycomb-forward-paths-v1"
    },
    {
      "no": 14,
      "title": "과거와 미래의 나이 말을 같은 식으로 맞추기",
      "answer": "35,21",
      "displayAnswer": "관호 35살, 주연 21살",
      "sourceLocator": "materials/final_3/003.jpg#q14",
      "read": "관호는 ‘내가 네 현재 나이였을 때, 내 나이는 네 나이의 3배였다’고 말합니다. 주연은 ‘내가 네 현재 나이가 될 때, 네 나이는 내 현재 나이의 2배보다 7살 많다’고 말합니다. 두 사람의 현재 나이를 구합니다.",
      "method": "관호의 현재 나이를 G, 주연의 현재 나이를 J라 합니다. 두 사람의 나이 차 G-J는 과거와 미래에도 그대로라는 점으로 각 말을 식으로 옮깁니다.",
      "steps": [
        {
          "title": "관호의 과거 말 옮기기",
          "body": "G-J년 전 관호는 J살이고, 주연은 J-(G-J)=2J-G살입니다. 그때 관호가 주연의 3배이므로 J=3(2J-G), 정리하면 3G=5J입니다."
        },
        {
          "title": "주연의 미래 말 옮기기",
          "body": "G-J년 뒤 주연은 G살이 되고, 관호는 G+(G-J)=2G-J살입니다. 이 나이가 주연의 현재 나이 2배보다 7 많으므로 2G-J=2J+7, 즉 2G-3J=7입니다."
        },
        {
          "title": "두 식 함께 풀기",
          "body": "3G=5J에서 G=5J÷3입니다. 이를 2G-3J=7에 넣으면 J÷3=7이므로 J=21, G=35입니다."
        }
      ],
      "check": "14년 전에는 관호 21살, 주연 7살로 3배입니다. 14년 뒤에는 주연 35살, 관호 49살이고 49=21×2+7입니다.",
      "caution": "‘내가 네 현재 나이였을 때’에는 두 사람 모두 같은 만큼 어려집니다. 한 사람의 나이만 바꾸지 않습니다."
    },
    {
      "no": 15,
      "title": "서로 다른 여섯 숫자를 곱셈식부터 정하기",
      "answer": "13",
      "displayAnswer": "13",
      "sourceLocator": "materials/final_3/003.jpg#q15",
      "read": "ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ은 1부터 9까지 중 서로 다른 여섯 수입니다. 주어진 다섯 식을 모두 만족할 때 ㄷ+ㅁ을 구합니다.",
      "method": "곱해도 같은 수가 되는 첫 식에서 ㄴ을 정하고, 한 자리 제곱인 둘째 식과 덧셈식을 이어서 ㄱ, ㄹ, ㅂ을 정합니다. 남은 두 식으로 ㄷ과 ㅁ을 찾습니다.",
      "steps": [
        {
          "title": "ㄴ, ㄱ, ㄹ, ㅂ 정하기",
          "body": "ㄴ×ㄹ=ㄹ이고 ㄹ은 0이 아니므로 ㄴ=1입니다. ㄴ+ㄹ=ㄱ이므로 ㄱ=ㄹ+1입니다. ㄱ×ㄱ=ㅂ이 한 자리이므로 ㄱ은 2 또는 3인데, ㄱ=2이면 ㄹ=1이 되어 ㄴ과 같아집니다. 따라서 ㄱ=3, ㄹ=2, ㅂ=9입니다."
        },
        {
          "title": "ㄷ과 ㅁ의 합을 식에서 바로 찾기",
          "body": "ㄴ+ㄷ+ㅁ=ㄱ+ㄹ+ㅂ에 값을 넣으면 1+ㄷ+ㅁ=3+2+9=14입니다. 따라서 ㄷ+ㅁ=13입니다."
        },
        {
          "title": "실제 서로 다른 값까지 확인하기",
          "body": "마지막 식 ㄷ+ㄹ=ㄹ×ㅁ에 ㄹ=2를 넣으면 ㄷ=2ㅁ-2입니다. ㄷ+ㅁ=13과 함께 풀면 ㅁ=5, ㄷ=8입니다.",
          "table": {
            "caption": "여섯 기호의 값",
            "headers": [
              "기호",
              "ㄱ",
              "ㄴ",
              "ㄷ",
              "ㄹ",
              "ㅁ",
              "ㅂ"
            ],
            "rows": [
              [
                "값",
                "3",
                "1",
                "8",
                "2",
                "5",
                "9"
              ]
            ]
          }
        }
      ],
      "check": "1×2=2, 3×3=9, 1+2=3, 1+8+5=3+2+9, 8+2=2×5로 다섯 식이 모두 맞고 여섯 수가 모두 다릅니다.",
      "caution": "기호들은 0이 아니라 1~9 중 서로 다른 수입니다. 같은 값을 두 기호에 넣지 않습니다."
    }
  ];

  var ITEMS=RAW_ITEMS.map(function(item){
    var enriched=Object.assign({
      reviewStatus:'verified',
      evidenceStatus:CONTRACT.evidenceStatus,
      independentReviewStatus:CONTRACT.independentReviewStatus,
      releaseStatus:CONTRACT.releaseStatus,
      reviewId:CONTRACT.reviewId,
      learnerStage:CONTRACT.learnerStage,
      answerVisibility:CONTRACT.answerVisibility
    },item);
    enriched.comment=formatComment(enriched);
    return enriched;
  });

  function bindingFor(no){
    var matches=ANSWER_BINDINGS.filter(function(binding){return binding.no===no;});
    return matches.length===1?matches[0]:null;
  }

  function validItem(item){
    if(!item||!Number.isInteger(item.no)||!text(item.title)||!text(item.answer)||!text(item.displayAnswer)||!text(item.sourceLocator)) return false;
    if(item.reviewStatus!=='verified'||item.evidenceStatus!==CONTRACT.evidenceStatus||item.independentReviewStatus!==CONTRACT.independentReviewStatus||item.releaseStatus!==CONTRACT.releaseStatus) return false;
    if(item.reviewId!==CONTRACT.reviewId||item.learnerStage!==CONTRACT.learnerStage||item.answerVisibility!==CONTRACT.answerVisibility) return false;
    if(!text(item.read)||!text(item.method)||!Array.isArray(item.steps)||item.steps.length<3) return false;
    if(!item.steps.every(function(step){return text(step&&step.title)&&text(step&&step.body)&&validTable(step.table);})) return false;
    if(!text(item.check)||!text(item.caution)||item.comment!==formatComment(item)) return false;
    var binding=bindingFor(item.no);
    if(!binding||item.answer!==binding.canonicalExact||item.displayAnswer!==binding.displayAnswerExact) return false;
    var diagram=DIAGRAMS[item.no];
    return diagram?item.diagram===diagram:item.diagram==null;
  }

  function validData(data){
    if(!data||data.contract!==CONTRACT||!Array.isArray(data.items)||data.items.length!==CONTRACT.expectedCount) return false;
    var nos=data.items.map(function(item){return item.no;});
    if(new Set(nos).size!==nos.length) return false;
    if(nos.some(function(no,index){return no!==CONTRACT.expectedNos[index];})) return false;
    return data.items.every(validItem);
  }

  var DATA=deepFreeze({contract:CONTRACT,answerBindings:ANSWER_BINDINGS,items:ITEMS});

  function diagramReady(entry){
    if(!entry.diagram) return true;
    var diagrams=root.GFIELD_FINAL3_SOLUTION_DIAGRAMS;
    if(!diagrams||typeof diagrams.modelFor!=='function'||typeof diagrams.calculate!=='function'||typeof diagrams.render!=='function') return false;
    var model=diagrams.modelFor(entry.no);
    if(!model||model.id!==entry.diagram) return false;
    var calculation=diagrams.calculate(entry.no);
    if(!calculation||calculation.valid!==true) return false;
    var rendered=diagrams.render(entry.no);
    return typeof rendered==='string'&&rendered.indexOf('data-diagram-id="'+entry.diagram+'"')>=0&&rendered.indexOf('<svg')>=0;
  }

  function resolve(item,options){
    if(!validData(DATA)||!item) return null;
    if(CONTRACT.evidenceStatus!=='verified'||CONTRACT.independentReviewStatus!=='verified') return null;
    var allowLocked=!!(options&&options.allowLocked===true);
    if(CONTRACT.releaseStatus!=='eligible'&&!(CONTRACT.releaseStatus==='locked'&&allowLocked)) return null;
    var no=Number(item.no);
    if(!Number.isInteger(no)) return null;
    var matches=DATA.items.filter(function(entry){return entry.no===no;});
    if(matches.length!==1) return null;
    var entry=matches[0];
    var binding=bindingFor(no);
    if(!binding||String(item.answer)!==binding.canonicalExact||entry.answer!==binding.canonicalExact||entry.displayAnswer!==binding.displayAnswerExact) return null;
    return diagramReady(entry)?entry:null;
  }

  root.GFIELD_FINAL3_DETAILED=DATA;
  root.GFIELD_FINAL3_RESOLVE_SOLUTION=resolve;
})(typeof window!=='undefined'?window:globalThis);
