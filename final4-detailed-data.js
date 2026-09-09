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
    {no:10,canonicalExact:'11개',displayAnswerExact:'11개'}
  ]);
  var CONTRACT=deepFreeze({schemaVersion:1,round:4,expectedCount:9,totalQuestions:30,expectedNos:[1,2,3,4,5,6,7,8,10],requiredDiagramNos:[],evidenceStatus:'verified',independentReviewStatus:'verified',releaseStatus:'eligible',reviewId:'final4-detailed-review-first10-safe9-20260909',learnerStage:'초등 선발 대비 파이널 모의고사 수강생',learnerFitCriteria:['language','representations','prerequisites','reasoning-load','response-mode'],answerVisibility:'post-attempt'});
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
    {no:10,title:'긴 1의 수와 9의 수의 곱에서 짝수 세기',answer:'11개',displayAnswer:'11개',sourceLocator:'materials/final_4/002.jpg#q10',read:'1이 12개 이어진 수와 9가 12개 이어진 수를 곱한 결과에서 0이 아닌 짝수 숫자의 개수를 셉니다.',method:'짧은 자리수의 곱을 써서 자릿수 규칙을 찾은 뒤 12자리로 늘립니다.',steps:[
      {title:'짧은 곱에서 모양 찾기',body:'11×99＝1089, 111×999＝110889, 1111×9999＝11108889처럼 앞에는 1, 가운데에는 0, 뒤에는 8과 마지막 9가 나타납니다.',table:{caption:'자리수가 늘어날 때의 곱',headers:['1과 9의 자리수','곱','8의 개수'],rows:[['2자리','1089','1개'],['3자리','110889','2개'],['4자리','11108889','3개']]}},
      {title:'12자리 곱 쓰기',body:'같은 규칙으로 111111111111×999999999999＝111111111110888888888889입니다.'},
      {title:'0이 아닌 짝수만 세기',body:'결과의 짝수 숫자는 0과 8이지만 0은 제외합니다. 8이 11개 있으므로 답은 11개입니다.'}],check:'n자리에서 8이 n－1개 나타나므로 n＝12일 때 12－1＝11개입니다.',caution:'짝수인 0은 문제에서 제외하라고 했습니다. 숫자 8의 값이 아니라 나타난 횟수를 셉니다.'}
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
