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

  function formatComment(item){
    var steps=item.steps.map(function(step,index){
      return (index+1)+'. '+step.title+'\n'+step.body;
    }).join('\n\n');
    return '읽을 조건\n'+item.read+'\n\n풀이 전략\n'+item.method+'\n\n'+steps+'\n\n검산\n'+item.check+'\n\n주의할 점\n'+item.caution;
  }

  var CONTRACT=deepFreeze({
    schemaVersion:2,
    set:'final',
    round:2,
    expectedNos:[1,3,4,6,7,8,10,11,12,15,25,26],
    expectedCount:12,
    totalQuestions:30,
    learnerStage:'초등 선발 대비 파이널 모의고사 수강생',
    reviewId:'final2-detailed-review-20260909',
    evidenceStatus:'verified',
    independentReviewStatus:'verified',
    releaseStatus:'eligible',
    answerVisibility:'post-attempt-only',
    scope:'selected-detail-only'
  });

  var RAW_ITEMS=[
    {
      no:1,
      title:'모두 낮은 점수라고 가정하여 높은 점수 횟수 찾기',
      answer:'4번',
      sourceLocator:'materials/final_2/001.jpg#q1',
      read:'주사위를 12번 던졌습니다. 1·2·3이 나오면 2점, 4·5·6이 나오면 6점이고, 얻은 점수의 합은 40점입니다. 구할 것은 6점을 얻은 횟수입니다.',
      method:'12번을 모두 2점으로 받았다고 먼저 가정한 뒤, 실제 합과의 차이를 한 번 바꿀 때 늘어나는 점수로 나눕니다.',
      steps:[
        {
          title:'모두 2점이라고 가정하기',
          body:'12번 모두 1·2·3 중 하나가 나왔다고 보면 점수의 합은 2×12=24점입니다.'
        },
        {
          title:'실제 점수와의 차이 구하기',
          body:'실제 점수는 40점이므로 가정한 점수보다 40−24=16점 더 많습니다.'
        },
        {
          title:'한 번을 6점으로 바꿀 때의 차이로 나누기',
          body:'2점인 한 번을 6점으로 바꾸면 6−2=4점이 늘어납니다. 따라서 16÷4=4이므로 6점을 얻은 것은 4번입니다.'
        }
      ],
      check:'6점을 4번, 2점을 8번 받았다고 되짚으면 6×4+2×8=24+16=40점으로 조건과 같습니다.',
      caution:'16÷4의 4는 주사위 눈 4가 나온 횟수가 아니라, 4·5·6 중 하나가 나와 6점을 얻은 전체 횟수입니다.'
    },
    {
      no:3,
      title:'리그전의 전체 승수로 두 반의 전적 완성하기',
      answer:'4승 1패',
      sourceLocator:'materials/final_2/001.jpg#q3',
      read:'6개 반이 서로 한 번씩 경기하고 무승부는 없습니다. 1반부터 4반까지의 전적은 각각 5승, 3승 2패, 5패, 1승 4패이며, 5반은 6반보다 2승 더 많습니다.',
      method:'리그전 전체 경기 수가 전체 승수와 같다는 점을 이용해 5반과 6반의 승수 합을 구한 뒤, 합과 차로 나눕니다.',
      steps:[
        {
          title:'전체 경기 수와 전체 승수 구하기',
          body:'6개 반에서 두 반을 고르는 경기이므로 전체 경기는 6×5÷2=15경기입니다. 무승부가 없으므로 전체 승수도 15승입니다.'
        },
        {
          title:'5반과 6반이 나누어 가질 승수 구하기',
          body:'1반부터 4반까지의 승수 합은 5+3+0+1=9승입니다. 따라서 5반과 6반의 승수 합은 15−9=6승입니다.'
        },
        {
          title:'승수의 합과 차로 5반의 승수 구하기',
          body:'두 반의 승수 합은 6승이고 5반이 2승 더 많으므로, 5반은 (6+2)÷2=4승입니다. 각 반은 5경기를 하므로 나머지 1경기는 패하여 4승 1패입니다.'
        }
      ],
      check:'5반이 4승, 6반이 2승이면 전체 승수는 5+3+0+1+4+2=15승입니다. 전체 패수도 15패가 되어 리그전의 15경기와 맞습니다.',
      caution:'5반의 승수만 구하고 멈추지 말고, 한 반이 모두 5경기를 한다는 사실로 패수까지 써야 합니다.'
    },
    {
      no:4,
      title:'두 화폐를 골라 만들 수 있는 서로 다른 합 세기',
      answer:'15가지',
      sourceLocator:'materials/final_2/001.jpg#q4',
      read:'상자에는 10원·50원·100원·500원 동전과 1000원 지폐가 각각 많이 들어 있습니다. 여기서 화폐 두 장 또는 두 개를 골랐을 때 나오는 서로 다른 금액의 합을 셉니다.',
      method:'같은 종류 두 개를 고른 경우와 서로 다른 두 종류를 고른 경우를 나누고, 실제 합을 적어 겹치는 금액이 있는지 확인합니다.',
      steps:[
        {
          title:'같은 종류 두 개의 합 적기',
          body:'10+10=20, 50+50=100, 100+100=200, 500+500=1000, 1000+1000=2000이므로 5가지입니다.'
        },
        {
          title:'서로 다른 두 종류의 합 적기',
          body:'작은 금액부터 짝지으면 60, 110, 510, 1010, 150, 550, 1050, 600, 1100, 1500원입니다. 모두 10가지입니다.',
          table:{
            caption:'서로 다른 두 종류를 고른 합',
            headers:['고른 화폐','합'],
            rows:[
              ['10+50','60'],['10+100','110'],['10+500','510'],['10+1000','1010'],
              ['50+100','150'],['50+500','550'],['50+1000','1050'],
              ['100+500','600'],['100+1000','1100'],['500+1000','1500']
            ]
          }
        },
        {
          title:'겹치는 합을 확인하고 모두 세기',
          body:'같은 종류에서 나온 5개와 서로 다른 종류에서 나온 10개 사이에도 같은 금액이 없습니다. 따라서 서로 다른 합은 5+10=15가지입니다.'
        }
      ],
      check:'화폐 종류가 5개이고 같은 종류도 두 개 고를 수 있으므로, 순서를 생각하지 않은 두 종류 선택 수는 5×6÷2=15입니다. 적어 둔 15개의 합도 모두 달라 답과 일치합니다.',
      caution:'1000원짜리는 동전이 아니라 지폐입니다. 또 10원과 50원을 고르는 것과 50원과 10원을 고르는 것은 같은 선택이므로 두 번 세지 않습니다.'
    },
    {
      no:6,
      title:'자릿수가 왼쪽부터 작아지는 수의 개수 세기',
      answer:'55개',
      sourceLocator:'materials/final_2/001.jpg#q6',
      read:'각 자리 숫자가 왼쪽에서 오른쪽으로 갈수록 반드시 작아지는 자연수 가운데 500보다 작은 수를 셉니다. 한 자리 수는 제외하므로 두 자리 수와 세 자리 수만 대상입니다.',
      method:'두 자리 수는 서로 다른 숫자 두 개를 고르면 큰 숫자가 자동으로 십의 자리가 됩니다. 세 자리 수는 백의 자리 1·2·3·4별로 그보다 작은 숫자 두 개를 고릅니다.',
      steps:[
        {
          title:'두 자리 수 세기',
          body:'0부터 9까지 서로 다른 숫자 두 개를 고르면 큰 숫자를 십의 자리, 작은 숫자를 일의 자리에 놓는 방법이 하나뿐입니다. 따라서 10×9÷2=45개입니다.'
        },
        {
          title:'세 자리 수 세기',
          body:'500보다 작으므로 백의 자리는 1·2·3·4입니다. 백의 자리가 1이면 0개, 2이면 210의 1개, 3이면 310·320·321의 3개, 4이면 아래 두 자리에 0·1·2·3 중 두 숫자를 고르는 6개입니다.'
        },
        {
          title:'두 자리와 세 자리 경우 더하기',
          body:'세 자리 수는 0+1+3+6=10개이므로 전체는 45+10=55개입니다.'
        }
      ],
      check:'백의 자리보다 작은 숫자 가운데 두 개를 고르는 수는 백의 자리 1·2·3·4에 따라 0개, 1개, 3개, 6개입니다. 합은 10개이고 두 자리 45개와 합치면 55개입니다.',
      caution:'숫자가 같아지는 경우는 포함하지 않습니다. 또한 한 자리 수는 제외하고, 백의 자리가 5 이상인 수는 500보다 작지 않으므로 세면 안 됩니다.'
    },
    {
      no:7,
      title:'곱에 들어 있는 2의 개수로 처음 나머지가 생기는 차례 찾기',
      answer:'199번째',
      sourceLocator:'materials/final_2/002.jpg#q7',
      read:'101×102×⋯×500을 4로 계속 나눕니다. 완전히 나누어지는 횟수가 아니라, 처음으로 나머지가 생기는 나눗셈의 차례를 묻습니다.',
      method:'곱 전체에 인수 2가 몇 개 들어 있는지 2·4·8·16의 배수 층별로 센 뒤, 4 한 개에 필요한 인수 2 두 개씩 묶습니다.',
      steps:[
        {
          title:'101부터 500까지에서 2의 배수 층별로 세기',
          body:'각 수로 나누어지는 수의 개수는 500 이하의 개수에서 100 이하의 개수를 빼서 구합니다. 2의 배수부터 256의 배수까지 세면 다음과 같습니다.',
          table:{
            caption:'101부터 500까지에서 2가 들어 있는 층별 개수',
            headers:['나누는 수','500 이하','100 이하','101~500'],
            rows:[
              ['2','250','50','200'],
              ['4','125','25','100'],
              ['8','62','12','50'],
              ['16','31','6','25'],
              ['32','15','3','12'],
              ['64','7','1','6'],
              ['128','3','0','3'],
              ['256','1','0','1']
            ]
          }
        },
        {
          title:'곱에 들어 있는 인수 2의 전체 개수 구하기',
          body:'각 층을 더하면 200+100+50+25+12+6+3+1=397입니다. 예를 들어 16의 배수는 500 이하 31개에서 100 이하 6개를 빼어 25개로 확인됩니다.'
        },
        {
          title:'4로 완전히 나눌 수 있는 횟수와 다음 차례 구하기',
          body:'4=2×2이므로 한 번 완전히 나눌 때 인수 2가 두 개 필요합니다. 397=2×198+1이므로 198번까지는 나누어떨어지고, 그다음인 199번째에 처음 나머지가 생깁니다.'
        }
      ],
      check:'198번 나눈 뒤에는 인수 2가 397−2×198=1개 남습니다. 남은 수는 2의 배수이지만 4의 배수는 아니므로 199번째로 4를 나눌 때 나머지가 생깁니다.',
      caution:'200번째로 세면 안 됩니다. 4로 완전히 나누어지는 것은 198번이고, 문제는 그다음 처음 나머지가 생기는 차례를 물으므로 답은 199번째입니다.'
    },
    {
      no:8,
      title:'다발 번호만큼 꺼내 한 번에 가짜 은화 다발 찾기',
      answer:'1번',
      sourceLocator:'materials/final_2/002.jpg#q8',
      read:'모양이 같은 은화가 20개씩 든 다발이 6개 있고, 그중 한 다발의 은화만 모두 가짜입니다. 진짜는 한 개에 10g, 가짜는 9g이며 전자저울로 가짜 다발을 찾는 최소 횟수를 구합니다.',
      method:'1번 다발에서 1개, 2번에서 2개, …, 6번에서 6개를 꺼내 한꺼번에 달아, 모두 진짜일 때보다 모자란 무게를 다발 번호와 연결합니다.',
      steps:[
        {
          title:'다발마다 서로 다른 개수 꺼내기',
          body:'1번부터 6번 다발에서 각각 1개, 2개, 3개, 4개, 5개, 6개를 꺼냅니다. 꺼낸 은화는 모두 1+2+3+4+5+6=21개입니다.'
        },
        {
          title:'모두 진짜일 때의 무게 정하기',
          body:'21개가 모두 진짜라면 전체 무게는 21×10=210g입니다. 이제 이 은화를 전자저울에 한 번에 올립니다.'
        },
        {
          title:'모자란 무게로 다발 번호 알아내기',
          body:'가짜 한 개는 진짜보다 1g 가볍습니다. 실제 무게가 210g보다 1g 가벼우면 1번, 2g 가벼우면 2번, …, 6g 가벼우면 6번 다발이 가짜입니다. 따라서 한 번만 재면 됩니다.'
        }
      ],
      check:'가능한 무게는 가짜 다발 번호에 따라 209g, 208g, 207g, 206g, 205g, 204g으로 모두 다릅니다. 한 번의 측정 결과가 여섯 경우를 정확히 구별합니다.',
      caution:'양팔저울처럼 두 쪽을 비교하는 문제가 아니라 정확한 무게를 읽는 전자저울 문제입니다. 그래서 한 번의 측정만으로도 번호를 알 수 있습니다.'
    },
    {
      no:10,
      title:'두 고장 난 시계의 상대적인 시간 차 이용하기',
      answer:'오전 10시 40분',
      sourceLocator:'materials/final_2/002.jpg#q10',
      read:'두 시계를 같은 시각에 맞춘 뒤 파란 시계는 한 시간마다 1분 빨라지고, 빨간 시계는 한 시간마다 2분 느려집니다. 다음 날 아침 파란 시계가 7시, 빨간 시계가 6시를 가리킬 때 처음 맞춘 시각을 구합니다.',
      method:'두 시계 사이의 차이가 한 시간마다 1+2=3분씩 벌어진다고 보고, 1시간 차가 나는 데 걸린 시간을 먼저 구합니다.',
      steps:[
        {
          title:'두 시계가 한 시간 차이 나는 데 걸린 시간 구하기',
          body:'파란 시계는 매시간 1분 앞서고 빨간 시계는 매시간 2분 뒤지므로 두 시계의 차이는 매시간 3분씩 커집니다. 60÷3=20이므로 맞춘 뒤 20시간이 지났습니다.'
        },
        {
          title:'시계를 본 실제 시각 구하기',
          body:'20시간 동안 파란 시계는 20분 빨라졌습니다. 파란 시계가 오전 7시를 가리키므로 실제 시각은 오전 6시 40분입니다. 빨간 시계도 40분 느려져 오전 6시를 가리키므로 일치합니다.'
        },
        {
          title:'20시간 전의 처음 맞춘 시각 구하기',
          body:'다음 날 오전 6시 40분에서 20시간을 거슬러 올라가면 전날 오전 10시 40분입니다. 따라서 처음 맞춘 시각은 오전 10시 40분입니다.'
        }
      ],
      check:'오전 10시 40분에서 20시간 뒤의 실제 시각은 다음 날 오전 6시 40분입니다. 파란 시계는 20분 빨라 오전 7시, 빨간 시계는 40분 느려 오전 6시가 됩니다.',
      caution:'한쪽 시계의 오차만 보지 말고 두 시계가 매시간 3분씩 벌어진다는 것을 써야 합니다. 또 관찰 시각이 다음 날 아침이므로 날짜를 함께 거슬러 올라갑니다.'
    },
    {
      no:11,
      title:'악수의 전체 횟수를 동시에 진행하는 묶음으로 나누기',
      answer:'9시 11분 30초',
      sourceLocator:'materials/final_2/002.jpg#q11',
      read:'24명이 서로 빠짐없이 한 번씩 악수합니다. 30초마다 12쌍이 동시에 악수하며 오전 9시에 시작했을 때 끝나는 시각을 구합니다.',
      method:'24명 가운데 두 명을 고르는 전체 악수 수를 구하고, 한 번에 진행되는 12쌍씩 묶은 뒤 걸린 시간을 시작 시각에 더합니다.',
      steps:[
        {
          title:'서로 다른 두 명의 짝 수 구하기',
          body:'한 사람이 자신을 제외한 23명과 악수한다고 세면 각 악수를 두 번 세게 됩니다. 따라서 전체 악수는 24×23÷2=276번입니다.'
        },
        {
          title:'동시에 진행하는 묶음 수 구하기',
          body:'30초 동안 12쌍이 동시에 악수하므로 필요한 묶음은 276÷12=23묶음입니다.'
        },
        {
          title:'걸린 시간을 끝나는 시각으로 바꾸기',
          body:'23묶음에는 23×30=690초, 즉 11분 30초가 걸립니다. 오전 9시에 시작했으므로 오전 9시 11분 30초에 끝납니다.'
        }
      ],
      check:'22묶음까지 하면 12×22=264쌍이 악수하여 12쌍이 남습니다. 마지막 23번째 30초에 그 12쌍이 악수하면 276쌍을 모두 채웁니다.',
      caution:'11분 30초는 걸린 시간이고, 문제는 끝나는 시각을 묻습니다. 시작 시각 오전 9시에 더해 써야 합니다.'
    },
    {
      no:12,
      title:'높이만 없애 굵은 선의 윗모습 그리기',
      answer:'(그림 답안)',
      sourceLocator:'materials/final_2/002.jpg#q12',
      read:'투명한 입체의 가는 모서리가 아니라 굵게 표시된 한 줄을 따라갑니다. 위에서 볼 때는 뒤쪽을 그림의 위, 앞쪽을 그림의 아래로 놓고 높이만 없앱니다.',
      method:'굵은 선의 꼭짓점과 꺾이는 점을 순서대로 따라간 뒤 각 점에서 높이만 없앱니다. 같은 앞뒤·좌우 위치의 수직선은 위에서 한 점으로 겹칩니다.',
      steps:[
        {
          title:'보는 방향과 출발점 고정하기',
          body:'그림의 뒤쪽을 답안의 위쪽, 앞쪽을 답안의 아래쪽으로 둡니다. 굵은 선의 뒤쪽 오른쪽 점에서 출발하여 선을 끊지 않고 따라갑니다.'
        },
        {
          title:'윗부분의 경로를 평면에 옮기기',
          body:'뒤쪽 오른쪽 점에서 왼쪽 변 위의 안쪽 점으로 간 뒤, 앞쪽 왼쪽 꼭짓점으로 이어지는 두 선분을 그립니다.'
        },
        {
          title:'아랫부분의 꺾인 경로 이어 그리기',
          body:'앞쪽 왼쪽 꼭짓점에서 앞쪽 변 위의 안쪽 점으로 간 다음, 답안의 뒤쪽 방향으로 들어가 꺾고 오른쪽 변 위의 안쪽 점을 지나 뒤쪽 오른쪽 점으로 돌아옵니다.'
        },
        {
          title:'수직선이 한 점으로 겹치는지 확인하기',
          body:'입체의 뒤쪽 오른쪽에서 위아래를 잇는 굵은 수직선은 위에서 볼 때 시작점과 끝점이 같은 한 점에 겹칩니다. 따라서 답안은 끊김 없이 닫힌 한 줄 모양이 됩니다.'
        }
      ],
      check:'모형의 각 굵은 선분에서 높이만 없애면 왼쪽 변의 안쪽 점, 앞쪽 왼쪽 꼭짓점, 앞쪽 변의 안쪽 점, 내부 꺾임, 오른쪽 변의 안쪽 점, 뒤쪽 오른쪽 점이 같은 순서로 이어집니다. 수직선 하나만 한 점으로 줄어듭니다.',
      caution:'문제 그림에 중점 표시나 같은 길이 표시는 없습니다. 답안의 안쪽 점을 정확한 중점이라고 새로 가정하지 말고, 굵은 선의 연결 순서와 보는 방향을 맞추어 그립니다.',
      diagram:'top-projection'
    },
    {
      no:15,
      title:'묶음 수열의 세 성분 규칙을 모두 적용해 합 구하기',
      answer:'422',
      sourceLocator:'materials/final_2/003.jpg#q15',
      read:'수열은 (1,2,1), (2,4,2), (3,7,4), (4,11,7), …처럼 세 수가 한 묶음입니다. 20번째 묶음의 가운데 수만이 아니라 세 수의 합을 구해야 합니다.',
      method:'첫째 수, 가운데 수, 셋째 수의 규칙을 따로 찾습니다. 가운데 수는 1에 1부터 그 묶음 번호까지 더한 수이고, 셋째 수는 바로 앞 묶음의 가운데 수입니다.',
      steps:[
        {
          title:'20번째 묶음의 첫째 수 구하기',
          body:'각 묶음의 첫째 수는 1, 2, 3, …으로 하나씩 늘어나므로 20번째 첫째 수는 20입니다.'
        },
        {
          title:'20번째 묶음의 가운데 수 구하기',
          body:'가운데 수는 앞의 가운데 수에 2, 3, 4, …를 차례로 더합니다. 1부터 20까지의 합은 (1+20)×20÷2=210이므로 가운데 수는 1+210=211입니다.'
        },
        {
          title:'20번째 묶음의 셋째 수 구하기',
          body:'셋째 수는 바로 앞 묶음의 가운데 수입니다. 19번째 가운데 수는 1+(1+2+⋯+19)=1+190=191입니다.'
        },
        {
          title:'세 수 모두 더하기',
          body:'20번째 묶음은 (20, 211, 191)이므로 합은 20+211+191=422입니다. 처음 여섯 묶음과 나란히 놓아도 세 자리의 규칙이 그대로 이어집니다.',
          table:{
            caption:'처음 묶음들과 20번째 묶음 비교',
            headers:['묶음','첫째 수','가운데 수','셋째 수'],
            rows:[
              ['1번째','1','2','1'],
              ['2번째','2','4','2'],
              ['3번째','3','7','4'],
              ['4번째','4','11','7'],
              ['5번째','5','16','11'],
              ['6번째','6','22','16'],
              ['20번째','20','211','191']
            ]
          }
        }
      ],
      check:'20+191=211이므로 첫째 수와 셋째 수의 합이 가운데 수와 같습니다. 따라서 전체 합은 211×2=422로 다시 확인됩니다.',
      caution:'가운데 수 211을 구한 뒤 멈추지 않습니다. 문제에서 요구한 것은 20번째 묶음 안의 세 수를 모두 더한 값입니다.'
    },
    {
      no:25,
      title:'성냥개비 보석을 위쪽 띠와 아래쪽 삼각형으로 나누어 세기',
      answer:'79개',
      sourceLocator:'materials/final_2/005.jpg#q25',
      read:'1번째부터 3번째 보석 그림에서 늘어나는 규칙을 찾아 7번째 보석을 이루는 작은 삼각형의 개수를 구합니다. 위쪽 띠와 아래쪽 뒤집힌 큰 삼각형을 모두 세어야 합니다.',
      method:'보석을 두 부분으로 나눕니다. 위쪽 띠의 작은 삼각형 수는 2개씩 늘고, 아래쪽은 층수가 하나씩 늘어나는 삼각형 배열이므로 홀수의 합을 이용합니다.',
      steps:[
        {
          title:'7번째 위쪽 띠의 개수 구하기',
          body:'위쪽 띠는 1번째 3개, 2번째 5개, 3번째 7개로 2개씩 늘어납니다. 7번째는 3+2×6=15개입니다.'
        },
        {
          title:'7번째 아래쪽의 층수 찾기',
          body:'아래쪽 뒤집힌 삼각형은 1번째가 2층, 2번째가 3층, 3번째가 4층입니다. 따라서 7번째는 8층입니다.'
        },
        {
          title:'아래쪽 8층의 작은 삼각형 세기',
          body:'층별 개수는 1,3,5,7,9,11,13,15입니다. 양끝부터 짝지으면 합이 16인 네 쌍이므로 16×4=64개입니다.'
        },
        {
          title:'위쪽과 아래쪽 더하기',
          body:'위쪽 띠 15개와 아래쪽 64개를 더하면 15+64=79개입니다.'
        }
      ],
      check:'아래쪽은 첫 n개의 홀수의 합이 n²이라는 규칙으로 8²=64개입니다. 위쪽 15개를 더하면 79개로 같습니다. 앞의 그림도 3+2²=7, 5+3²=14, 7+4²=23으로 모양의 증가와 맞습니다.',
      caution:'아래쪽 8층의 64개만 답으로 쓰면 위쪽 띠 15개를 빠뜨립니다. 두 부분을 따로 센 뒤 반드시 합칩니다.'
    },
    {
      no:26,
      title:'서로 다른 기준 시점의 나이를 한 표에 맞추기',
      answer:'14살',
      sourceLocator:'materials/final_2/005.jpg#q26',
      read:'현재 삼촌은 20살보다 많고 80살보다 적습니다. 1년 전 삼촌 나이는 유준 나이의 5배이고, 2년 후 유빈 나이는 그때 삼촌 나이의 1/8입니다. 구할 것은 현재 유준과 유빈 나이의 합입니다.',
      method:'2년 후 삼촌 나이를 범위 안의 8의 배수로 좁힌 뒤, 3년 전인 1년 전 나이가 5의 배수인지 확인합니다. 마지막에는 세 시점의 나이를 현재로 옮깁니다.',
      steps:[
        {
          title:'2년 후 삼촌 나이 후보 적기',
          body:'현재 삼촌은 21살부터 79살까지이므로 2년 후에는 23살부터 81살까지입니다. 이 가운데 8의 배수는 24,32,40,48,56,64,72,80입니다.'
        },
        {
          title:'1년 전의 5배 조건으로 후보 하나 남기기',
          body:'2년 후에서 1년 전으로 가면 3살을 빼야 합니다. 후보는 21,29,37,45,53,61,69,77이고, 5의 배수는 45뿐입니다. 따라서 삼촌은 1년 전 45살, 현재 46살, 2년 후 48살입니다.'
        },
        {
          title:'유준과 유빈의 현재 나이 구하기',
          body:'1년 전 유준은 45÷5=9살이므로 현재 10살입니다. 2년 후 유빈은 48÷8=6살이므로 현재 4살입니다.',
          table:{
            caption:'세 시점의 나이 확인',
            headers:['시점','삼촌','유준','유빈'],
            rows:[
              ['1년 전','45','9','2'],
              ['현재','46','10','4'],
              ['2년 후','48','12','6']
            ]
          }
        },
        {
          title:'현재 두 아이의 나이 더하기',
          body:'현재 유준은 10살, 유빈은 4살이므로 두 사람의 나이 합은 10+4=14살입니다.'
        }
      ],
      check:'1년 전에는 45÷9=5이고, 2년 후에는 6=48÷8이므로 두 배수 조건이 모두 맞습니다. 현재 두 아이의 합도 10+4=14입니다.',
      caution:'48살은 삼촌의 현재 나이가 아니라 2년 후 나이입니다. 1년 전, 현재, 2년 후를 한 줄씩 맞춘 뒤 현재 나이끼리 더합니다.'
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

  function validItem(item){
    if(!item||!Number.isInteger(item.no)||!text(item.title)||!text(item.answer)||!text(item.sourceLocator)) return false;
    if(item.reviewStatus!=='verified'||item.evidenceStatus!==CONTRACT.evidenceStatus||item.independentReviewStatus!==CONTRACT.independentReviewStatus||item.releaseStatus!==CONTRACT.releaseStatus) return false;
    if(item.reviewId!==CONTRACT.reviewId||item.learnerStage!==CONTRACT.learnerStage||item.answerVisibility!==CONTRACT.answerVisibility) return false;
    if(!text(item.read)||!text(item.method)||!Array.isArray(item.steps)||item.steps.length<3) return false;
    if(!item.steps.every(function(step){return text(step&&step.title)&&text(step&&step.body)&&validTable(step.table);})) return false;
    if(!text(item.check)||!text(item.caution)||item.comment!==formatComment(item)) return false;
    if(item.no===12) return item.answer==='(그림 답안)'&&item.diagram==='top-projection';
    return item.diagram==null;
  }

  function validData(data){
    if(!data||data.contract!==CONTRACT||!Array.isArray(data.items)||data.items.length!==CONTRACT.expectedCount) return false;
    var nos=data.items.map(function(item){return item.no;});
    if(new Set(nos).size!==nos.length) return false;
    if(nos.some(function(no,index){return no!==CONTRACT.expectedNos[index];})) return false;
    return data.items.every(validItem);
  }

  var DATA=deepFreeze({contract:CONTRACT,items:ITEMS});

  function resolve(item){
    if(!validData(DATA)||!item) return null;
    if(CONTRACT.independentReviewStatus!=='verified'||CONTRACT.evidenceStatus!=='verified'||CONTRACT.releaseStatus!=='eligible') return null;
    var no=Number(item.no);
    if(!Number.isInteger(no)) return null;
    var matches=DATA.items.filter(function(entry){return entry.no===no;});
    if(matches.length!==1) return null;
    var entry=matches[0];
    if(entry.answer!==String(item.answer)) return null;
    if(entry.diagram){
      var diagrams=root.GFIELD_FINAL2_SOLUTION_DIAGRAMS;
      if(!diagrams||typeof diagrams.render!=='function'||!diagrams.render(no)) return null;
    }
    return entry;
  }

  root.GFIELD_FINAL2_DETAILED=DATA;
  root.GFIELD_FINAL2_RESOLVE_SOLUTION=resolve;
})(typeof window!=='undefined'?window:globalThis);
