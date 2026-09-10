(function(root){
  'use strict';
  function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.keys(value).forEach(function(key){deepFreeze(value[key]);});return Object.freeze(value);}
  function text(value){return typeof value==='string'&&value.trim()?value.trim():'';}
  function scalar(value){return typeof value==='string'||(typeof value==='number'&&Number.isFinite(value));}
  function validTable(table){if(table==null)return true;if(!table||!text(table.caption)||!Array.isArray(table.headers)||!table.headers.length||!Array.isArray(table.rows)||!table.rows.length)return false;var width=table.headers.length;return table.headers.every(scalar)&&table.rows.every(function(row){return Array.isArray(row)&&row.length===width&&row.every(scalar);});}

  var ANSWER_BINDINGS=deepFreeze([
    {no:1,canonicalExact:'큰 추 50g, 작은 추 10g',displayAnswerExact:'큰 추 50g, 작은 추 10g'},
    {no:2,canonicalExact:'1개 남는다',displayAnswerExact:'1개 남는다'},
    {no:3,canonicalExact:'66번',displayAnswerExact:'66번'},
    {no:4,canonicalExact:'여러 가지',displayAnswerExact:'예: 1＋2－3＋4＋5＋6＋7－8－9＝5'},
    {no:5,canonicalExact:'18일',displayAnswerExact:'18일'},
    {no:6,canonicalExact:'3가지',displayAnswerExact:'3가지'},
    {no:7,canonicalExact:'7대',displayAnswerExact:'7대'},
    {no:8,canonicalExact:'1720g',displayAnswerExact:'1720g'},
    {no:9,canonicalExact:'260알',displayAnswerExact:'260알'},
    {no:10,canonicalExact:'11개',displayAnswerExact:'11개'},
    {no:11,canonicalExact:'57',displayAnswerExact:'57'},
    {no:12,canonicalExact:'50도막',displayAnswerExact:'50도막'},
    {no:13,canonicalExact:'16개',displayAnswerExact:'16개'},
    {no:14,canonicalExact:'11살',displayAnswerExact:'11살'},
    {no:15,canonicalExact:'40명',displayAnswerExact:'40명'},
    {no:16,canonicalExact:'6시간 33분 45초',displayAnswerExact:'6시간 33분 45초'},
    {no:17,canonicalExact:'450m',displayAnswerExact:'450m'},
    {no:18,canonicalExact:'152.5도',displayAnswerExact:'152.5도'},
    {no:19,canonicalExact:'85번',displayAnswerExact:'85번'},
    {no:20,canonicalExact:'32640',displayAnswerExact:'32640'},
    {no:21,canonicalExact:'12장',displayAnswerExact:'12장'},
    {no:22,canonicalExact:'2081',displayAnswerExact:'2081'},
    {no:23,canonicalExact:'72가지',displayAnswerExact:'72가지'},
    {no:24,canonicalExact:'14일',displayAnswerExact:'14일'},
    {no:25,canonicalExact:'10개',displayAnswerExact:'10개'},
    {no:26,canonicalExact:'241×83=20003',displayAnswerExact:'241×83＝20003'},
    {no:27,canonicalExact:'4250',displayAnswerExact:'4250'},
    {no:28,canonicalExact:'156',displayAnswerExact:'156'},
    {no:29,canonicalExact:'378',displayAnswerExact:'378'},
    {no:30,canonicalExact:'378',displayAnswerExact:'378'}
  ]);
  var CONTRACT=deepFreeze({schemaVersion:2,round:4,expectedCount:30,totalQuestions:30,expectedNos:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],requiredDiagramNos:[],evidenceStatus:'verified',independentReviewStatus:'verified',releaseStatus:'eligible',reviewId:'final4-detailed-review-all30-20260911',learnerStage:'초등 선발 대비 파이널 모의고사 수강생',learnerFitCriteria:['language','representations','prerequisites','reasoning-load','response-mode'],answerVisibility:'post-attempt'});
  function formatComment(item){return ['정답 · '+item.displayAnswer,'','읽을 조건 · '+item.read,'','풀이 전략 · '+item.method,'',item.steps.map(function(step,index){return (index+1)+'단계 '+step.title+' · '+step.body;}).join('\n\n'),'','검산 · '+item.check,'','주의할 점 · '+item.caution].join('\n');}
  var RAW_ITEMS=[
    {no:1,title:'두 저울식의 차로 큰 추와 작은 추의 무게 찾기',answer:'큰 추 50g, 작은 추 10g',displayAnswer:'큰 추 50g, 작은 추 10g',sourceLocator:'materials/final_4/001.jpg#q1',read:'큰 추 5개와 작은 추 3개의 무게는 280g이고, 큰 추 3개와 작은 추 6개의 무게는 210g입니다. 두 종류 추의 무게를 각각 구합니다.',method:'작은 추의 개수를 6개로 맞춘 뒤 두 식을 빼서 큰 추의 무게를 먼저 구합니다.',steps:[
      {title:'두 식 세우기',body:'큰 추 한 개를 Lg, 작은 추 한 개를 Sg라 하면 5L＋3S＝280, 3L＋6S＝210입니다.'},
      {title:'작은 추를 지워 큰 추 구하기',body:'첫째 식을 2배 하면 10L＋6S＝560입니다. 여기서 3L＋6S＝210을 빼면 7L＝350이므로 L＝50입니다.',table:{caption:'같은 작은 추 6개를 둔 두 식',headers:['식','무게'],rows:[['큰 추 10개＋작은 추 6개','560g'],['큰 추 3개＋작은 추 6개','210g'],['차: 큰 추 7개','350g']]}},
      {title:'작은 추 구하기',body:'5×50＋3S＝280이므로 3S＝30, S＝10입니다.'}],check:'3×50＋6×10＝210, 5×50＋3×10＝280으로 두 조건을 모두 만족합니다.',caution:'280에서 210을 바로 빼면 큰 추와 작은 추가 함께 달라집니다. 한 종류의 개수를 먼저 같게 맞춥니다.'},
    {no:2,title:'남는 수와 모자라는 수의 차로 사람 수 찾기',answer:'1개 남는다',displayAnswer:'1개 남는다',sourceLocator:'materials/final_4/001.jpg#q2',read:'한 사람에게 8개씩 주면 4개가 남고, 10개씩 주면 2개가 모자랍니다. 같은 어린이들에게 9개씩 나누어 줄 때를 묻습니다.',method:'8개씩 줄 때와 10개씩 줄 때 필요한 전체 수의 차를 사람 한 명당 차이 2개와 연결합니다.',steps:[
      {title:'두 상황의 전체 차 찾기',body:'8개씩 준 뒤 남은 4개와 10개씩 주려면 더 필요한 2개를 합하면 두 상황의 차는 6개입니다.'},
      {title:'어린이 수 구하기',body:'한 사람당 10－8＝2개씩 차이 나므로 어린이는 6÷2＝3명입니다.'},
      {title:'전체 수와 9개씩 준 뒤 확인하기',body:'전체 수수깡은 8×3＋4＝28개입니다. 9×3＝27개를 주면 1개가 남습니다.',table:{caption:'나누어 주는 수에 따른 확인',headers:['한 사람당','필요하거나 남는 수'],rows:[['8개','24개를 주고 4개 남음'],['9개','27개를 주고 1개 남음'],['10개','30개가 필요해 2개 모자람']]}}],check:'10×3－2＝28도 같으므로 사람 수와 전체 수가 모두 맞습니다.',caution:'남는 4개와 모자라는 2개는 서로 반대쪽에 있으므로 빼지 않고 더합니다.'},
    {no:3,title:'36시간 동안 시침과 분침이 직각이 되는 횟수',answer:'66번',displayAnswer:'66번',sourceLocator:'materials/final_4/001.jpg#q3',read:'2021년 2월 20일 오후 2시부터 2월 22일 오전 2시까지 36시간 동안 시침과 분침이 직각이 되는 횟수를 구합니다.',method:'12시간마다 같은 시계 움직임이 반복되고, 그 12시간 동안 직각은 22번 생긴다는 성질을 사용합니다.',steps:[
      {title:'전체 시간 구하기',body:'20일 오후 2시부터 21일 오후 2시까지 24시간, 다시 22일 오전 2시까지 12시간이므로 모두 36시간입니다.'},
      {title:'12시간 묶음 수 찾기',body:'36시간은 12시간이 3묶음입니다.'},
      {title:'직각 횟수 계산하기',body:'시침과 분침은 12시간 동안 직각을 22번 이루므로 22×3＝66번입니다.',table:{caption:'시간 묶음별 직각 횟수',headers:['시간','직각 횟수'],rows:[['12시간','22번'],['24시간','44번'],['36시간','66번']]}}],check:'24시간의 44번에 남은 12시간의 22번을 더해도 66번입니다.',caution:'직각은 매 시간 정확히 두 번씩 생기지 않습니다. 시침도 계속 움직이므로 12시간의 정확한 횟수 22번을 사용합니다.'},
    {no:4,title:'1부터 9 사이에 덧셈·뺄셈 부호 넣기',answer:'여러 가지',displayAnswer:'예: 1＋2－3＋4＋5＋6＋7－8－9＝5',sourceLocator:'materials/final_4/001.jpg#q4',read:'1, 2, 3, …, 9의 순서는 바꾸지 않고 각 두 수 사이에 ＋ 또는 －를 넣어 결과가 5가 되는 식을 만듭니다.',method:'모두 더한 45에서 어떤 수를 빼는 것으로 바꿀지 생각합니다. 부호를 ＋에서 －로 바꾸면 그 수의 두 배만큼 합이 줄어듭니다.',steps:[
      {title:'모두 더한 값과 줄여야 할 값 구하기',body:'1＋2＋3＋4＋5＋6＋7＋8＋9＝45이고 목표는 5이므로 40을 줄여야 합니다.'},
      {title:'마이너스가 될 수의 합 찾기',body:'한 수의 부호를 ＋에서 －로 바꾸면 합은 그 수의 2배만큼 줄어듭니다. 따라서 마이너스가 될 수들의 합은 40÷2＝20이어야 합니다.'},
      {title:'합이 20인 수를 골라 식 완성하기',body:'3＋8＋9＝20이므로 3, 8, 9 앞에 －를 놓습니다. 그러면 1＋2－3＋4＋5＋6＋7－8－9＝5입니다.',table:{caption:'한 가지 완성 과정',headers:['마이너스가 되는 수','합','완성 값'],rows:[['3, 8, 9','20','45－2×20＝5']]}}],check:'왼쪽부터 계산해도 1＋2－3＋4＋5＋6＋7－8－9＝5입니다.',caution:'문제에는 계산 중간 값이 음수가 되면 안 된다는 조건이 없습니다. 순서를 바꾸거나 숫자를 붙여 쓰지 않고 ＋, －만 넣습니다.'},
    {no:5,title:'네 배 날짜와 요일 차를 함께 맞추는 달력',answer:'18일',displayAnswer:'18일',sourceLocator:'materials/final_4/001.jpg#q5',read:'어느 월요일 날짜의 4배가 되는 날짜가 화요일입니다. 같은 달의 세 번째 일요일 날짜를 구합니다.',method:'월요일을 m일이라 하면 4m일까지의 날짜 차는 3m일이고, 월요일에서 화요일로 가려면 날짜 차를 7로 나눈 나머지가 1이어야 합니다.',steps:[
      {title:'가능한 월요일 날짜 좁히기',body:'4m도 같은 달의 날짜이므로 m은 7 이하입니다.'},
      {title:'요일 조건 맞추기',body:'3m을 7로 나눈 나머지가 1인 1부터 7까지의 수를 찾으면 m＝5입니다. 실제로 5일에서 20일까지는 15일 차이고, 15는 7×2＋1이므로 20일은 화요일입니다.'},
      {title:'일요일 세기',body:'5일이 월요일이면 바로 앞 4일이 첫 번째 일요일입니다. 다음 일요일은 11일, 세 번째 일요일은 18일입니다.',table:{caption:'그달 첫 세 일요일',headers:['차례','날짜'],rows:[['첫 번째','4일'],['두 번째','11일'],['세 번째','18일']]}}],check:'18일 다음 날 19일은 월요일이고, 20일은 화요일이므로 조건과 맞습니다.',caution:'4배한 수가 날짜 범위를 벗어나지 않는지 먼저 확인합니다.'},
    {no:6,title:'1부터 6 사이에 부호를 넣어 11 만들기',answer:'3가지',displayAnswer:'3가지',sourceLocator:'materials/final_4/001.jpg#q6',read:'6, 5, 4, 3, 2, 1의 순서를 바꾸지 않고 다섯 빈칸에 ＋ 또는 －를 넣어 결과가 11이 되는 경우를 셉니다.',method:'모두 더한 21에서 11로 10만큼 줄여야 하므로, 마이너스가 될 수들의 합이 5인 경우를 찾습니다.',steps:[
      {title:'모두 더한 값 구하기',body:'6＋5＋4＋3＋2＋1＝21입니다.'},
      {title:'마이너스 수의 합 구하기',body:'부호를 ＋에서 －로 바꾸면 그 수의 두 배만큼 줄어드므로 마이너스가 될 수의 합은 (21－11)÷2＝5입니다.'},
      {title:'합이 5인 묶음 빠짐없이 찾기',body:'5, 4＋1, 3＋2의 세 묶음뿐입니다.',table:{caption:'세 가지 부호 배치',headers:['마이너스가 되는 수','식'],rows:[['5','6－5＋4＋3＋2＋1＝11'],['4, 1','6＋5－4＋3＋2－1＝11'],['3, 2','6＋5＋4－3－2＋1＝11']]}}],check:'세 식을 각각 계산하면 모두 11이며, 1부터 5에서 합이 5인 다른 묶음은 없습니다.',caution:'마이너스 부호의 개수만 세지 말고, 마이너스가 되는 수들의 합을 셉니다.'},
    {no:7,title:'한 대·한 번의 운반량으로 필요한 자동차 수 구하기',answer:'7대',displayAnswer:'7대',sourceLocator:'materials/final_4/002.jpg#q7',read:'자동차 7대가 6번 운반해 336톤을 나릅니다. 560톤을 5번 만에 나르기 위해 더 필요한 자동차 수를 구합니다.',method:'먼저 자동차 한 대가 한 번에 나르는 양을 구한 뒤, 560톤을 5번에 나를 때 필요한 전체 자동차 수를 찾습니다.',steps:[
      {title:'한 대가 한 번에 나르는 양 구하기',body:'모두 7×6＝42대·번 운반했으므로 한 대가 한 번에 나르는 양은 336÷42＝8톤입니다.'},
      {title:'자동차 한 대의 5번 운반량 구하기',body:'한 대가 5번 나르면 8×5＝40톤을 나릅니다.'},
      {title:'필요한 전체 수와 더 늘릴 수 구하기',body:'560÷40＝14대가 필요합니다. 지금 7대가 있으므로 14－7＝7대를 더 늘립니다.',table:{caption:'기준량으로 바꾸기',headers:['기준','운반량'],rows:[['1대·1번','8톤'],['1대·5번','40톤'],['14대·5번','560톤']]}}],check:'(7＋7)×5×8＝560이므로 정확히 5번에 모두 나릅니다.',caution:'14대는 더 늘릴 수가 아니라 필요한 전체 자동차 수입니다. 마지막에 현재 7대를 뺍니다.'},
    {no:8,title:'저울 위의 저울에서 저울 한 개 무게 찾기',answer:'1720g',displayAnswer:'1720g',sourceLocator:'materials/final_4/002.jpg#q8',read:'위 저울에는 우유와 오렌지주스가 올라 있고 580g을 가리킵니다. 아래 저울에는 위 저울 전체가 올라 있고 2kg 300g을 가리킵니다.',method:'아래 저울이 받는 전체 무게에서 위 저울이 가리킨 음료의 무게를 빼면 위 저울 자체의 무게가 남습니다.',steps:[
      {title:'단위를 g으로 맞추기',body:'2kg 300g＝2300g입니다.'},
      {title:'두 눈금이 뜻하는 것 나누기',body:'위 눈금 580g은 우유와 오렌지주스의 무게이고, 아래 눈금 2300g은 위 저울 자체와 두 음료를 합한 무게입니다.',table:{caption:'두 저울의 눈금',headers:['눈금','포함된 것'],rows:[['580g','우유＋오렌지주스'],['2300g','저울 한 개＋우유＋오렌지주스']]}},
      {title:'같은 음료 무게 빼기',body:'2300－580＝1720이므로 저울 한 개의 무게는 1720g입니다.'}],check:'1720＋580＝2300g이므로 아래 저울의 눈금과 맞습니다.',caution:'아래 저울 자체의 무게는 아래 저울의 눈금에 포함되지 않습니다. 눈금은 그 위에 올린 물건의 무게를 나타냅니다.'},
    {no:9,title:'같은 수가 든 두 약병의 남은 양 비교하기',answer:'260알',displayAnswer:'260알',sourceLocator:'materials/final_4/002.jpg#q9; provided-answer-text-20260729',read:'처음 두 약병에는 같은 수의 영양제가 있었습니다. 누나는 하루 3알, 나는 하루 2알씩 먹다가 누나 약병에 2알이 남았을 때 함께 먹기 시작했고, 18일 뒤 두 약병을 모두 비웠습니다.',method:'함께 먹은 18일 동안 필요한 90알에서 누나 약병의 2알을 빼 내 약병의 남은 양을 찾고, 두 사람의 하루 섭취량 차로 앞선 날짜를 구합니다.',steps:[
      {title:'함께 먹은 18일의 양 구하기',body:'두 사람은 하루에 3＋2＝5알을 먹으므로 18일 동안 5×18＝90알을 먹습니다.'},
      {title:'함께 먹기 직전 내 약병의 양 구하기',body:'그때 누나 약병에는 2알이 있었으므로 내 약병에는 90－2＝88알이 있었습니다.'},
      {title:'처음 양 구하기',body:'처음 양은 같고 누나는 날마다 나보다 1알씩 더 먹었습니다. 남은 양의 차 88－2＝86알은 앞선 86일 동안 생긴 차입니다. 따라서 처음 누나 약병에는 3×86＋2＝260알이 있었습니다.'}],check:'나는 86일 동안 2×86＝172알을 먹어 260－172＝88알이 남고, 두 약병의 90알을 18일 동안 하루 5알씩 먹으면 모두 없어집니다.',caution:'처음 두 약병의 수가 같다는 제공 답안 조건과, 함께 먹기 시작한 뒤 18일이라는 두 시점을 나누어 읽습니다.'},
    {no:10,title:'긴 1의 수와 9의 수의 곱에서 짝수 세기',answer:'11개',displayAnswer:'11개',sourceLocator:'materials/final_4/002.jpg#q10',read:'1이 12개 이어진 수와 9가 12개 이어진 수를 곱한 결과에서 0이 아닌 짝수 숫자의 개수를 셉니다.',method:'짧은 자리수의 곱을 써서 자릿수 규칙을 찾은 뒤 12자리로 늘립니다.',steps:[
      {title:'짧은 곱에서 모양 찾기',body:'11×99＝1089, 111×999＝110889, 1111×9999＝11108889처럼 앞에는 1, 가운데에는 0, 뒤에는 8과 마지막 9가 나타납니다.',table:{caption:'자리수가 늘어날 때의 곱',headers:['1과 9의 자리수','곱','8의 개수'],rows:[['2자리','1089','1개'],['3자리','110889','2개'],['4자리','11108889','3개']]}},
      {title:'12자리 곱 쓰기',body:'같은 규칙으로 111111111111×999999999999＝111111111110888888888889입니다.'},
      {title:'0이 아닌 짝수만 세기',body:'결과의 짝수 숫자는 0과 8이지만 0은 제외합니다. 8이 11개 있으므로 답은 11개입니다.'}],check:'n자리에서 8이 n－1개 나타나므로 n＝12일 때 12－1＝11개입니다.',caution:'짝수인 0은 문제에서 제외하라고 했습니다. 숫자 8의 값이 아니라 나타난 횟수를 셉니다.'},
    {no:11,title:'잘못 본 두 자리 숫자가 계산값의 차에 미친 영향',answer:'57',displayAnswer:'57',sourceLocator:'materials/final_4/002.jpg#q11; provided-answer-text-20260729',read:'덧셈에서는 일의 자리 1을 7로 보았고, 뺄셈에서는 빼는 수의 십의 자리 7을 1로 보았습니다. 잘못 계산한 두 값의 차 111을 바르게 고칩니다.',method:'일의 자리 오차는 6, 십의 자리 오차는 60입니다. 두 오차가 계산값의 차를 바꾼 방향을 따로 표시합니다.',steps:[
      {title:'일의 자리 오차 찾기',body:'1을 7로 보았으므로 일의 자리에서는 7－1＝6만큼 차이가 생겼습니다.'},
      {title:'십의 자리 오차 찾기',body:'70을 10으로 보았으므로 십의 자리에서는 70－10＝60만큼 차이가 생겼습니다.'},
      {title:'계산값의 차 바로잡기',body:'제공 답안의 방향대로 두 오차를 되돌리면 111＋6－60＝57입니다.'}],check:'111에서 두 오차의 순변화 60－6＝54를 빼도 111－54＝57입니다.',caution:'6과 60을 모두 더하거나 모두 빼지 않습니다. 덧셈에서 생긴 오차와 뺄셈의 빼는 수에서 생긴 오차는 계산값의 차를 서로 반대 방향으로 바꿉니다.'},
    {no:12,title:'W 모양 실을 가로 12번, 세로 1번 잘랐을 때 도막 수',answer:'50도막',displayAnswer:'50도막',sourceLocator:'materials/final_4/002.jpg#q12; provided-answer-text-20260729',read:'W 모양의 한 줄 실을 가로로 12번 자른 다음, 세로 가운데를 한 번 더 자릅니다.',method:'실 한 줄은 자르는 점 하나가 늘 때마다 도막이 하나 늘어납니다. 각 가로선이 실과 만나는 점의 수를 먼저 셉니다.',steps:[
      {title:'가로선 한 줄의 교점 세기',body:'가로선 한 줄은 W의 네 기울어진 부분을 한 번씩 지나므로 실을 4곳에서 자릅니다.'},
      {title:'가로 12번 뒤 도막 수 구하기',body:'자르는 점은 4×12＝48개이므로 한 줄 실은 48＋1＝49도막이 됩니다.'},
      {title:'세로 가운데 자르기',body:'세로 가운데 자르기는 실을 한 곳 더 자르므로 49＋1＝50도막입니다.'}],check:'첫 번째 가로선 뒤 5도막이고, 가로선을 하나 늘릴 때마다 4도막씩 늘어 5＋4×11＝49, 마지막 세로 자르기로 50입니다.',caution:'가로로 12번을 가로선 12개로 읽습니다. 마지막 세로 자르기 한 번을 빠뜨리지 않습니다.'},
    {no:13,title:'색연필 수에 따른 풀의 수를 같은 양으로 맞추기',answer:'16개',displayAnswer:'16개',sourceLocator:'materials/final_4/003.jpg#q13',read:'색연필 8개를 놓으면 풀이 4개 더 필요하고, 색연필 2개를 놓으면 풀이 13개 더 필요합니다. 풀만으로 같은 가로 길이를 채울 때의 개수를 구합니다.',method:'색연필 한 개와 풀 한 개의 길이를 문자로 두고 두 배치의 전체 길이가 같다는 식을 세웁니다.',steps:[
      {title:'두 배치의 길이식 세우기',body:'색연필 한 개의 길이를 p, 풀 한 개의 길이를 g라 하면 8p＋4g＝2p＋13g입니다.'},
      {title:'색연필을 풀 길이로 바꾸기',body:'6p＝9g이므로 2p＝3g입니다.'},
      {title:'전체 길이를 풀만으로 나타내기',body:'8p＋4g＝4×(2p)＋4g＝4×3g＋4g＝16g이므로 풀은 16개 필요합니다.'}],check:'다른 배치도 2p＋13g＝3g＋13g＝16g으로 같습니다.',caution:'4개와 13개는 전체 풀의 수입니다. 두 수의 차만 답으로 쓰지 않습니다.'},
    {no:14,title:'작년 세 사람의 나이 합과 18년 뒤 조건으로 내 나이 찾기',answer:'11살',displayAnswer:'11살',sourceLocator:'materials/final_4/003.jpg#q14',read:'현재 나와 동생의 나이 합은 할머니 나이의 1/4이고, 작년 세 사람의 합은 72살입니다. 18년 뒤 동생 나이는 현재 내 나이의 2배입니다.',method:'작년 합을 현재 합으로 바꾼 뒤, 할머니와 두 아이의 나이 합 관계를 먼저 풉니다.',steps:[
      {title:'현재 세 사람의 합 구하기',body:'작년에서 올해가 되며 세 사람 모두 한 살씩 늘었으므로 현재 합은 72＋3＝75살입니다.'},
      {title:'나와 동생의 합 구하기',body:'나와 동생의 합을 S라 하면 할머니는 4S살입니다. S＋4S＝75이므로 S＝15입니다.'},
      {title:'내 나이 구하기',body:'내 나이를 x살이라 하면 동생은 15－x살입니다. 18년 뒤 조건은 15－x＋18＝2x이므로 33＝3x, x＝11입니다.'}],check:'현재 동생은 4살, 할머니는 60살입니다. 작년 합은 10＋3＋59＝72이고, 18년 뒤 동생은 22살로 현재 내 나이 11살의 두 배입니다.',caution:'18년 뒤에는 동생만 18을 더한 뒤, 그 나이를 ‘현재 내 나이’의 두 배와 비교합니다.'},
    {no:15,title:'세 가지 학용품의 겹치는 관계를 벤다이어그램으로 정리하기',answer:'40명',displayAnswer:'40명',sourceLocator:'materials/final_4/003.jpg#q15',read:'색연필 30개, 싸인펜 25개, 파스텔 12개와 세 가지를 모두 가진 5명 등 여러 겹침 조건을 이용해 반 전체를 구합니다.',method:'가운데의 세 가지 모두 5명부터 쓰고, 조건이 바로 정하는 칸을 안쪽에서 바깥쪽 순서로 채웁니다.',steps:[
      {title:'파스텔이 들어간 칸부터 채우기',body:'세 가지 모두는 5명입니다. 파스텔과 색연필을 가진 10명의 절반이 세 가지 모두이므로 파스텔·색연필만은 5명입니다. 파스텔만인 학생은 없으므로 파스텔 전체 12명에서 5＋5를 빼면 파스텔·싸인펜만은 2명입니다.'},
      {title:'싸인펜만과 색연필 쪽 칸 구하기',body:'파스텔과 싸인펜을 가진 학생은 세 가지 모두를 포함해 2＋5＝7명이고, 이는 싸인펜만 가진 학생보다 1명 적으므로 싸인펜만은 8명입니다. 싸인펜 전체 25명에서 8＋2＋5를 빼면 색연필·싸인펜만은 10명이고, 조건에 따라 색연필만도 10명입니다.'},
      {title:'겹치지 않게 모두 더하기',body:'색연필만 10, 싸인펜만 8, 파스텔만 0, 색연필·싸인펜만 10, 색연필·파스텔만 5, 싸인펜·파스텔만 2, 세 가지 모두 5를 더하면 40명입니다.'}],check:'색연필은 10＋10＋5＋5＝30명, 싸인펜은 8＋10＋2＋5＝25명, 파스텔은 0＋5＋2＋5＝12명입니다.',caution:'‘파스텔과 싸인펜을 가진 학생’에는 세 가지를 모두 가진 5명도 들어갑니다. 일곱 칸을 나눠 적은 뒤 합칩니다.'},
    {no:16,title:'거북이와 토끼의 실제 달린 시간 차로 잠든 시간 찾기',answer:'6시간 33분 45초',displayAnswer:'6시간 33분 45초',sourceLocator:'materials/final_4/003.jpg#q16; provided-answer-text-20260729',read:'4분에 1m 가는 거북이와 15초에 4m 가는 토끼가 100m 경주를 합니다. 토끼는 중간에 잠들었지만 거북이와 동시에 도착했습니다.',method:'두 동물의 100m 이동 시간을 각각 구한 뒤, 토끼의 전체 경주 시간에서 실제 달린 시간을 뺍니다.',steps:[
      {title:'거북이 시간 구하기',body:'1m에 4분이므로 100m에는 4×100＝400분이 걸립니다.'},
      {title:'토끼가 달린 시간 구하기',body:'4m에 15초이므로 100m는 25묶음입니다. 15×25＝375초＝6분 15초입니다.'},
      {title:'잠든 시간 구하기',body:'400분－6분 15초＝393분 45초＝6시간 33분 45초입니다.'}],check:'6분 15초와 6시간 33분 45초를 더하면 6시간 40분, 곧 400분입니다.',caution:'분과 초를 바로 빼지 말고 같은 단위로 바꾸거나 1분을 60초로 받아내림합니다.'},
    {no:17,title:'반쯤 들어간 열차가 완전히 통과할 때의 이동거리',answer:'450m',displayAnswer:'450m',sourceLocator:'materials/final_4/004.jpg#q17',read:'길이 300m 열차가 터널에 반쯤 들어간 때부터 완전히 통과할 때까지 15초가 걸리고 속력은 시속 144km입니다.',method:'15초 동안 간 거리를 구한 뒤, 출발 순간 이미 터널에 들어간 열차 길이 150m를 반영합니다.',steps:[
      {title:'속력을 초속으로 바꾸기',body:'144km/h＝144000m÷3600초＝40m/s입니다.'},
      {title:'15초 이동거리 구하기',body:'40×15＝600m를 이동합니다.'},
      {title:'터널 길이 구하기',body:'처음에는 열차의 절반인 150m가 이미 터널 안에 있습니다. 완전히 빠져나올 때까지 선두가 가는 거리는 터널 길이＋150m이므로 터널 길이는 600－150＝450m입니다.'}],check:'터널 입구에서 출구까지 450m, 출구에서 열차 꼬리가 나올 때까지 추가 150m로 모두 600m입니다.',caution:'600m는 열차가 15초 동안 간 거리입니다. 열차 전체 길이 300m를 다시 더하거나 빼지 않습니다.'},
    {no:18,title:'서로 다른 두 시각의 분침과 시침 사이 각도',answer:'152.5도',displayAnswer:'152.5도',sourceLocator:'materials/final_4/004.jpg#q18',read:'4시 45분 시계의 분침과 3시 55분 시계의 시침이 이루는 각도를 구합니다.',method:'두 바늘의 위치를 12시 방향을 0도로 한 각도로 각각 바꿔 비교합니다.',steps:[
      {title:'4시 45분의 분침 위치',body:'분침은 1분에 6도 움직이므로 45×6＝270도입니다.'},
      {title:'3시 55분의 시침 위치',body:'시침은 3시에 90도이고 1분에 0.5도 움직이므로 90＋55×0.5＝117.5도입니다.'},
      {title:'두 위치의 차 구하기',body:'270－117.5＝152.5도입니다.'}],check:'152.5도는 180도보다 작으므로 바로 작은 각입니다.',caution:'두 바늘이 같은 시계에 있는 것으로 합치지 않습니다. 시침은 3시에서 멈추지 않고 55분 동안 27.5도 더 움직입니다.'},
    {no:19,title:'전체 악수에서 같은 나라 사람끼리의 악수 빼기',answer:'85번',displayAnswer:'85번',sourceLocator:'materials/final_4/004.jpg#q19',read:'한국 5명, 중국 4명, 일본 3명, 미국 2명, 영국 1명 중 서로 다른 나라 사람끼리만 한 번씩 악수합니다.',method:'15명 전체가 악수하는 수에서 같은 나라 안에서 생기는 악수를 뺍니다.',steps:[
      {title:'전체 15명의 악수 수',body:'한 쌍을 한 번씩 고르면 15×14÷2＝105번입니다.'},
      {title:'같은 나라 악수 수',body:'한국 5×4÷2＝10, 중국 4×3÷2＝6, 일본 3, 미국 1, 영국 0이므로 모두 20번입니다.'},
      {title:'서로 다른 나라 악수 수',body:'105－20＝85번입니다.'}],check:'나라 두 곳을 고른 뒤 인원수를 곱해 더해도 5×4＋5×3＋…＝85가 됩니다.',caution:'A와 B의 악수와 B와 A의 악수는 같은 한 번이므로 전체를 셀 때 2로 나눕니다.'},
    {no:20,title:'반복 가능한 숫자 카드로 만든 세 자리 짝수의 총합',answer:'32640',displayAnswer:'32640',sourceLocator:'materials/final_4/004.jpg#q20',read:'0, 2, 3, 4, 6에서 세 숫자를 골라 반복을 허용해 세 자리 짝수를 모두 만들고 합합니다.',method:'백의 자리, 십의 자리, 일의 자리에 각 숫자가 몇 번씩 나타나는지 따로 셉니다.',steps:[
      {title:'전체 수와 백의 자리 합',body:'백의 자리는 2,3,4,6의 4가지, 십의 자리는 5가지, 일의 자리는 0,2,4,6의 4가지입니다. 각 백의 자리 숫자는 5×4＝20번씩 나오므로 (2＋3＋4＋6)×20×100＝30000입니다.'},
      {title:'십의 자리 합',body:'각 십의 자리 숫자는 4×4＝16번씩 나오므로 (0＋2＋3＋4＋6)×16×10＝2400입니다.'},
      {title:'일의 자리 합과 전체 합',body:'각 짝수 일의 자리 숫자는 4×5＝20번씩 나오므로 (0＋2＋4＋6)×20＝240입니다. 전체는 30000＋2400＋240＝32640입니다.'}],check:'만들어지는 수는 4×5×4＝80개이며 자리별 등장 횟수도 각각 80자리를 채웁니다.',caution:'0은 백의 자리에 올 수 없지만 십의 자리와 일의 자리에는 올 수 있습니다. 같은 숫자를 여러 번 써도 됩니다.'},
    {no:21,title:'합이 10인 세 장 묶음을 최대한 많이 뽑기',answer:'12장',displayAnswer:'12장',sourceLocator:'materials/final_4/004.jpg#q21',read:'1부터 9까지의 카드가 숫자마다 3장씩, 모두 27장입니다. 합이 10이 되도록 세 장씩 계속 뽑아 가장 적게 남길 때를 구합니다.',method:'먼저 5묶음을 실제로 만들고, 6묶음은 카드 18장의 최소 합 때문에 불가능함을 보입니다.',steps:[
      {title:'다섯 묶음 만들기',body:'(1,1,8), (1,2,7), (2,3,5), (2,4,4), (3,3,4)는 각각 합이 10이고 어떤 숫자도 3장을 넘게 쓰지 않습니다.'},
      {title:'여섯 묶음이 불가능한 까닭',body:'여섯 묶음이면 카드 18장의 합이 60이어야 합니다. 그러나 18장의 합을 가장 작게 해도 1부터 6까지를 각각 3장씩 쓴 3×(1＋2＋3＋4＋5＋6)＝63이므로 60을 만들 수 없습니다.'},
      {title:'남는 카드 수',body:'최대 5묶음, 곧 15장을 뽑으므로 27－15＝12장이 남습니다.'}],check:'제시한 다섯 묶음은 실제 카드 수 제한을 지키며 15장을 사용합니다.',caution:'지문의 ‘10이’를 숫자 100으로 읽지 않습니다. 합이 10인 조합만 찾고 카드별 3장 제한을 반드시 확인합니다.'},
    {no:22,title:'한 해 달력에 적힌 모든 숫자의 합',answer:'2081',displayAnswer:'2081',sourceLocator:'materials/final_4/004.jpg#q22',read:'평년 한 해의 달력에서 월을 나타내는 숫자와 날짜를 나타내는 모든 숫자의 각 자리 숫자를 더합니다.',method:'매달 공통인 1일부터 28일까지, 29·30일, 31일, 월 숫자로 나눠 계산합니다.',steps:[
      {title:'1일부터 28일까지',body:'각 자리 숫자의 합은 1~9가 45, 10~19가 55, 20~28이 54이므로 154입니다. 12달 모두 있으므로 154×12＝1848입니다.'},
      {title:'29·30·31일 더하기',body:'29와 30의 자리합은 11＋3＝14이고 각각 11달에 있으므로 154입니다. 31의 자리합 4는 7달에 있으므로 28입니다. 날짜 합은 1848＋154＋28＝2030입니다.'},
      {title:'월 숫자 더하기',body:'1월부터 12월까지 월 숫자의 자리합은 45＋1＋2＋3＝51입니다. 모두 2030＋51＝2081입니다.'}],check:'2월 28일, 30일까지인 달 4개, 31일까지인 달 7개로 달 수가 1＋4＋7＝12가 됩니다.',caution:'날짜 자체를 더하는 것이 아니라 달력에 쓰인 숫자의 각 자리 숫자를 더합니다. 월 숫자도 포함합니다.'},
    {no:23,title:'1부터 6까지를 한 번씩 써서 곱이 홀수인 곱셈식 세기',answer:'72가지',displayAnswer:'72가지',sourceLocator:'materials/final_4/005.jpg#q23',read:'1부터 6까지의 카드를 모두 한 번씩 써서 두 세 자리 수의 곱셈식을 만들고 곱이 홀수인 경우를 셉니다.',method:'두 수가 모두 홀수가 되도록 일의 자리를 먼저 고른 뒤, 두 수의 순서를 바꾼 식은 같은 곱셈식으로 셉니다.',steps:[
      {title:'두 일의 자리 고르기',body:'곱이 홀수이려면 두 수의 일의 자리가 모두 홀수여야 합니다. 1,3,5 중 서로 다른 두 수를 고르는 방법은 3가지입니다.'},
      {title:'선택한 카드 배치하기',body:'고른 두 홀수를 두 일의 자리에 놓는 방법 2가지와 남은 네 카드를 나머지 네 자리에 놓는 4!＝24가지를 곱하면 3×2×24＝144가지입니다.'},
      {title:'곱하는 두 수의 순서 정리하기',body:'ABC×DEF와 DEF×ABC는 같은 곱셈식의 한 경우로 세므로 144÷2＝72가지입니다.'}],check:'어떤 경우에도 두 일의 자리가 홀수이고 나머지 카드 네 장을 모두 한 번씩 사용합니다.',caution:'곱의 값이 같은 서로 다른 인수쌍을 합치는 것이 아니라, 두 인수의 자리만 통째로 바꾼 경우를 한 번으로 셉니다.'},
    {no:24,title:'인원이 줄어든 뒤 전체 작업이 늦어진 날짜 구하기',answer:'14일',displayAnswer:'14일',sourceLocator:'materials/final_4/005.jpg#q24',read:'400명이 하루 3시간씩 10일 걸릴 일을 300명이 시작하고, 1/5을 마친 뒤 150명으로 줄어듭니다.',method:'전체 일을 사람×시간×날짜인 인시로 놓고 앞의 1/5과 뒤의 4/5에 걸린 날짜를 각각 구합니다.',steps:[
      {title:'전체 일의 양',body:'400×3×10＝12000인시입니다.'},
      {title:'300명과 150명이 한 기간 계산',body:'처음 1/5은 2400인시이므로 2400÷(300×3)＝8/3일입니다. 남은 4/5는 9600인시이므로 9600÷(150×3)＝64/3일입니다.'},
      {title:'예정보다 늦은 날짜',body:'실제 기간은 8/3＋64/3＝72/3＝24일입니다. 예정 10일보다 24－10＝14일 늦었습니다.'}],check:'300×3×8/3＝2400, 150×3×64/3＝9600이고 합은 전체 12000인시입니다.',caution:'답의 단위는 시간 아니라 ‘며칠’입니다. 사람이 줄어든 뒤에는 남은 4/5만 계산합니다.'},
    {no:25,title:'자리 숫자 합이 41인 4의 배수 세기',answer:'10개',displayAnswer:'10개',sourceLocator:'materials/final_4/005.jpg#q25',read:'각 자리 숫자의 합이 41인 다섯 자리 수 중 4로 나누어떨어지는 수를 셉니다.',method:'4의 배수는 끝 두 자리만 확인하면 되므로, 끝 두 자리의 합이 충분히 큰 후보부터 좁힙니다.',steps:[
      {title:'끝 두 자리 후보 찾기',body:'앞 세 자리의 합은 최대 27이므로 끝 두 자리 합은 적어도 14여야 합니다. 4의 배수인 두 자리 후보는 68, 88, 96입니다.'},
      {title:'앞 세 자리 배열 수 세기',body:'끝이 68이면 앞 합 27이라 999 한 가지입니다. 끝이 88이면 앞 합 25라 799의 3가지 배열과 889의 3가지 배열, 모두 6가지입니다. 끝이 96이면 앞 합 26이라 899의 3가지 배열입니다.'},
      {title:'모두 더하기',body:'1＋6＋3＝10개입니다.'}],check:'각 후보의 끝 두 자리는 4의 배수이고, 다섯 자리의 자리합은 모두 41입니다.',caution:'4의 배수는 전체 수를 나누지 않고 끝 두 자리로 판단합니다. 맨 앞자리가 0인 경우는 여기 후보에 없습니다.'},
    {no:26,title:'서로 다른 숫자 카드 다섯 장으로 20000에 가장 가까운 곱 만들기',answer:'241×83=20003',displayAnswer:'241×83＝20003',sourceLocator:'materials/final_4/005.jpg#q26',read:'0부터 9까지 숫자카드 중 서로 다른 다섯 장을 한 번씩 써서 세 자리 수와 두 자리 수의 곱을 20000에 가장 가깝게 만듭니다.',method:'두 자리 수를 정했을 때 20000을 그 수로 나눈 값 가까이의 세 자리 수를 남은 카드로 만들고 차를 비교합니다.',steps:[
      {title:'20000 근처의 인수 범위 잡기',body:'두 자리 수가 80 안팎이면 세 자리 수는 20000÷80＝250 안팎이어야 합니다.'},
      {title:'가까운 후보 비교하기',body:'서로 다른 숫자 조건을 지키는 가까운 후보는 241×83＝20003, 215×93＝19995, 247×81＝20007 등입니다. 20000과의 차는 각각 3, 5, 7입니다.'},
      {title:'가장 작은 차 선택하기',body:'차가 가장 작은 3을 만드는 빈칸은 241×83이고 계산 결과는 20003입니다.'}],check:'241×83＝241×(80＋3)＝19280＋723＝20003이며 2,4,1,8,3은 서로 다릅니다.',caution:'곱이 20000보다 큰지 작은지가 아니라 차의 절댓값을 비교합니다. 같은 숫자카드를 두 번 쓰지 않습니다.'},
    {no:27,title:'100개의 연속 자연수에서 짝수 번째 50개의 합 구하기',answer:'4250',displayAnswer:'4250',sourceLocator:'materials/final_4/006.jpg#q27',read:'작은 수부터 큰 수까지 100개의 연속 자연수 합은 8450입니다. 첫째, 셋째, …, 99번째 수를 빼고 남은 50개의 합을 구합니다.',method:'먼저 첫 수를 구한 뒤 남는 짝수 번째 수를 등차수열로 더합니다.',steps:[
      {title:'첫 수 구하기',body:'첫 수를 a라 하면 합은 100a＋(0＋1＋…＋99)＝100a＋4950입니다. 100a＋4950＝8450이므로 a＝35입니다.'},
      {title:'남는 수 확인하기',body:'35가 첫째이므로 빼고 남는 짝수 번째 수는 36, 38, …, 134입니다. 모두 50개입니다.'},
      {title:'등차수열 합 구하기',body:'(36＋134)×50÷2＝170×25＝4250입니다.'}],check:'빼는 홀수 번째 수 35＋37＋…＋133의 합은 (35＋133)×25＝4200이고, 8450－4200＝4250입니다.',caution:'지문의 ‘8450이며’에서 조사 ‘이며’를 숫자 0으로 읽지 않습니다. 첫째 수부터 한 칸씩 건너뛰어 빼면 남는 것은 둘째, 넷째, …입니다.'},
    {no:28,title:'차가 5인 세 수의 곱을 제곱수로 만들기',answer:'156',displayAnswer:'156',sourceLocator:'materials/final_4/006.jpg#q28',read:'B는 A보다 5 크고 C는 B보다 5 크며 A, B, C는 모두 20보다 작습니다. A×B×C×13이 어떤 수의 제곱일 때 그 수를 구합니다.',method:'A는 1부터 9까지이므로 후보가 적습니다. 13이 한 번 있으니 A, B, C 중 13을 포함하는 후보를 먼저 봅니다.',steps:[
      {title:'세 수의 꼴 쓰기',body:'B＝A＋5, C＝A＋10이고 C＜20이므로 A는 1부터 9까지입니다.'},
      {title:'제곱수가 되는 후보 찾기',body:'A＝8이면 A, B, C는 8, 13, 18입니다. 8×13×18×13＝(8×18)×13²＝144×169입니다.'},
      {title:'제곱근 구하기',body:'144×169＝12²×13²＝(12×13)²＝156²이므로 ★＝156입니다.'}],check:'156²＝24336이고 8×13×18×13도 24336입니다. A＝1부터 9까지 확인하면 다른 제곱수는 나오지 않습니다.',caution:'세 수 자체의 곱만 보지 말고 문제에 곱해진 13까지 포함합니다. C가 20보다 작으므로 A의 범위는 1~9입니다.'},
    {no:29,title:'같은 숫자로 이루어진 수열의 555번째 자리합',answer:'378',displayAnswer:'378',sourceLocator:'materials/final_4/006.jpg#q29',read:'11, 22, …, 999, …처럼 두 자리 이상이며 모든 자리 숫자가 같은 수를 작은 것부터 씁니다. 555번째 수의 자리 숫자 합을 구합니다.',method:'자리수 하나마다 1부터 9까지 9개의 수가 생기는 묶음으로 나눕니다.',steps:[
      {title:'555번째가 속한 묶음 찾기',body:'555＝9×61＋6이므로 61묶음을 지나 다음 묶음의 여섯 번째 수입니다.'},
      {title:'자리수와 반복 숫자 찾기',body:'첫 묶음은 두 자리이므로 62번째 묶음은 63자리입니다. 여섯 번째 수는 숫자 6이 63번 이어진 수입니다.'},
      {title:'자리 숫자 합 구하기',body:'6×63＝378입니다.'}],check:'61묶음은 61×9＝549개이고, 그 다음 6번째가 555번째입니다.',caution:'555를 숫자 5가 반복된 수로 바로 읽지 않습니다. 9개씩 묶은 뒤 자리수와 묶음 안 순서를 따로 찾습니다.'},
    {no:30,title:'3×3×3 주사위에서 서로 붙은 면의 눈 합',answer:'378',displayAnswer:'378',sourceLocator:'materials/final_4/006.jpg#q30',read:'같은 방향으로 놓은 주사위 27개를 3×3×3으로 쌓았습니다. 주사위끼리 맞닿은 모든 면의 눈 합을 구합니다.',method:'가로·세로·높이 세 방향에서 맞닿는 주사위 쌍을 세고, 한 쌍의 마주 보는 눈 합 7을 곱합니다.',steps:[
      {title:'한 방향의 맞닿는 쌍 세기',body:'한 줄에 주사위 3개가 있으면 이웃한 쌍은 2개입니다. 그런 줄이 3×3＝9줄이므로 한 방향에는 2×9＝18쌍입니다.'},
      {title:'세 방향의 전체 쌍',body:'가로, 세로, 높이 세 방향이므로 18×3＝54쌍입니다.'},
      {title:'붙은 면의 눈 합',body:'표준 주사위의 서로 마주 보는 두 면의 합은 7입니다. 맞닿은 한 쌍에서도 두 면의 합이 7이므로 54×7＝378입니다.'}],check:'일반식으로도 세 방향 각각 (3－1)×3×3＝18쌍, 모두 54쌍입니다.',caution:'붙은 주사위 ‘쌍’ 하나마다 맞닿은 면은 두 장입니다. 바깥으로 보이는 면은 세지 않습니다.'}
  ];
  var ITEMS=RAW_ITEMS.map(function(item){var enriched=Object.assign({reviewStatus:'verified',evidenceStatus:CONTRACT.evidenceStatus,independentReviewStatus:CONTRACT.independentReviewStatus,releaseStatus:CONTRACT.releaseStatus,reviewId:CONTRACT.reviewId,learnerStage:CONTRACT.learnerStage,answerVisibility:CONTRACT.answerVisibility},item);enriched.comment=formatComment(enriched);return enriched;});
  function bindingFor(no){var matches=ANSWER_BINDINGS.filter(function(binding){return binding.no===no;});return matches.length===1?matches[0]:null;}
  function validItem(item){if(!item||!Number.isInteger(item.no)||!text(item.title)||!text(item.answer)||!text(item.displayAnswer)||!text(item.sourceLocator))return false;if(item.reviewStatus!=='verified'||item.evidenceStatus!==CONTRACT.evidenceStatus||item.independentReviewStatus!==CONTRACT.independentReviewStatus||item.releaseStatus!==CONTRACT.releaseStatus)return false;if(item.reviewId!==CONTRACT.reviewId||item.learnerStage!==CONTRACT.learnerStage||item.answerVisibility!==CONTRACT.answerVisibility)return false;if(!text(item.read)||!text(item.method)||!Array.isArray(item.steps)||item.steps.length<3)return false;if(!item.steps.every(function(step){return text(step&&step.title)&&text(step&&step.body)&&validTable(step.table);} ))return false;if(!text(item.check)||!text(item.caution)||item.comment!==formatComment(item))return false;var binding=bindingFor(item.no);return !!binding&&item.answer===binding.canonicalExact&&item.displayAnswer===binding.displayAnswerExact&&item.diagram==null;}
  function validData(data){if(!data||data.contract!==CONTRACT||!Array.isArray(data.items)||data.items.length!==CONTRACT.expectedCount)return false;var nos=data.items.map(function(item){return item.no;});if(new Set(nos).size!==nos.length)return false;if(nos.some(function(no,index){return no!==CONTRACT.expectedNos[index];}))return false;return data.items.every(validItem);}
  var DATA=deepFreeze({contract:CONTRACT,answerBindings:ANSWER_BINDINGS,items:ITEMS});
  function resolve(item){if(!validData(DATA)||!item||CONTRACT.evidenceStatus!=='verified'||CONTRACT.independentReviewStatus!=='verified'||CONTRACT.releaseStatus!=='eligible')return null;var no=Number(item.no);var matches=DATA.items.filter(function(entry){return entry.no===no;});if(matches.length!==1)return null;var entry=matches[0],binding=bindingFor(no);return binding&&String(item.answer)===binding.canonicalExact&&entry.answer===binding.canonicalExact&&entry.displayAnswer===binding.displayAnswerExact?entry:null;}
  root.GFIELD_FINAL4_DETAILED=DATA;
  root.GFIELD_FINAL4_RESOLVE_SOLUTION=resolve;
})(typeof window!=='undefined'?window:globalThis);
