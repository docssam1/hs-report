// 2026-11-23 문제에서 원문에 없는 힌트를 뺍니다(4~6학년 전체).
// 사용자 지시: "4학년, 5학년도 포함해서 원문에 없는 힌트 같은 거는 빼."
// - 문제 문장 안의 '도움말:', '풀이 도움:', '힌트:', '풀이 순서:' 문장과 '먼저 …하세요.' 안내 문장을 지웁니다.
// - 이름이 '-hint'로 끝나는 힌트 상자를 지웁니다.
// - 6학년 문제 아래의 조건 정리 상자(…-board)는 안의 수·기호가 모두 문제 문장이나 그림에 이미 있을 때만 지웁니다.
//   문제의 식·자료를 처음 보여 주는 상자는 남기고 그 안의 안내 문장만 지웁니다.
// - 유형별로 확인한 힌트 문장(쉬움 난이도의 부분 답, 풀이 방법 안내 등)을 지웁니다(HINT_SENTENCES).
// - 2026-11-24: 쉬움 난이도의 풀이 안내 문단(p.question-step[data-step-evidence^=guided])을 지우고, 그림·상자 바로 뒤에 붙은
//   '먼저 …세요.' 문장도 지우도록 문단 경계를 넣었습니다. 쉼표·마침표만 든 요소는 지우지 않습니다.
//   어려움 난이도의 확인·설명 요구 문단(independent-reasoning)도 지웁니다(사용자 결정 "모두 지움").
// 정답·풀이 쪽 설명은 그대로 둡니다(사용자: "답 풀이에 있는 설명은 상관 없어").
(function (root) {
  "use strict";
  const api = root.HSE_GENERATORS;
  if (!api || typeof api.generate !== "function" || api.__problemHintPolicy20261123) return;
  if (typeof document === "undefined") return;

  const LABEL = /(?:도움말|풀이 도움|풀이 순서|힌트)\s*[:：]/;
  const BOARD_CLASS = /^source6[12]-[\w-]*board$/;
  const TOKEN = /\d+(?:\.\d+)?|[㉠-㉯]|[■▲●◆★♥△□○]|[ㄱ-ㅎ]{2,}|[A-Z]/g;

  // 유형별 힌트 문장: 수는 어느 수든 맞도록 패턴으로 바꿔 씁니다.
  // 2026-11-23 유형별 검토(쉬움·보통·어려움 화면 문장 대조)로 고른 힌트 문장. 빼도 문제가 성립하는 것만 넣었습니다.
  const HINT_SENTENCES = {
 "4-1-u5-t1-3": [
  "처음 그래프의 세로 눈금 한 칸은 5명입니다.",
  "알려진 한 칸의 크기를 이용해,"
 ],
 "4-1-u5-t1-5": [
  "라 마을 막대는 8명까지 그려져 있습니다."
 ],
 "4-1-u5-t1-8": [
  "처음 그래프의 세로 눈금 한 칸은 2명입니다.",
  "알려진 한 칸의 크기를 이용해,"
 ],
 "5-1-u1-t4-10": [
  "힌트: 두 자리 수의 십의 자리에는 7을 넣으세요."
 ],
 "5-1-u1-t4-12": [
  "힌트: (□ - □) ÷ (□ - □) 꼴로 만들어 보세요."
 ],
 "5-1-u1-t4-2": [
  "힌트: 둘째 빈칸에는 ×가 들어갑니다."
 ],
 "5-1-u1-t4-3": [
  "힌트: 괄호 안 빈칸에는 +가 들어갑니다."
 ],
 "5-1-u1-t4-4": [
  "힌트: 괄호는 2 × 3을 먼저 계산하도록 표시합니다."
 ],
 "5-1-u1-t4-5": [
  "힌트: 첫째 칸에는 8을 넣으세요."
 ],
 "5-1-u1-t4-6": [
  "힌트: 괄호 안에는 4 + 5를 먼저 계산합니다."
 ],
 "5-1-u1-t4-7": [
  "힌트: (□ - □) × □ + □ ÷ □ 꼴로 만들어 보세요."
 ],
 "5-1-u1-t4-8": [
  "힌트: 첫째 빈칸은 ÷ 또는 +, 둘째 빈칸은 + 또는 -입니다."
 ],
 "5-1-u2-t1": [
  "약수는 1, 2, 3, 4, 6, 12입니다.",
  "약수의 작은 수와 큰 수를 짝지어 빠짐없이 확인하세요."
 ],
 "5-1-u2-t1-10": [
  "㉠은 3보다 커야 합니다.",
  "나머지를 뺀 수의 약수 중 조건에 맞는 수를 빠짐없이 찾으세요."
 ],
 "5-1-u2-t1-11": [
  "1부터 9까지 넣어 양쪽 곱이 같은지 확인하세요."
 ],
 "5-1-u2-t1-12": [
  "전체 개수에서 각 배수의 개수를 빼세요."
 ],
 "5-1-u2-t1-2": [
  "가장 작은 배수는 1000, 가장 큰 배수는 5975입니다.",
  "범위의 양 끝에 있는 수가 포함되는지도 확인하세요."
 ],
 "5-1-u2-t1-3": [
  "1001의 약수 중 세 자리 수만 골라 보세요.",
  "약수 짝에서 세 자리인 큰 쪽을 비교하세요."
 ],
 "5-1-u2-t1-4": [
  "가능한 두 자리 수를 작은 수부터 일정한 간격으로 찾아보세요."
 ],
 "5-1-u2-t1-5": [
  "나누는 수는 4보다 커야 합니다.",
  "나누어지는 수에서 나머지를 뺀 수의 약수를 모두 확인하세요."
 ],
 "5-1-u2-t1-6": [
  "바른 몫을 ㉠, 바른 나머지를 ㉡으로 놓아 두 나눗셈식을 비교하세요.",
  "두 나눗셈에서 몫과 나머지의 크기 조건도 함께 확인하세요."
 ],
 "5-1-u2-t1-7": [
  "1부터 9까지 차례로 나누어 보세요.",
  "2, 3, 4, 5, 6, 8, 9의 배수 조건을 함께 이용하세요."
 ],
 "5-1-u2-t1-8": [
  "가까운 두 배수는 989과 1,032입니다.",
  "기준값의 바로 앞뒤에 있는 두 배수와의 차를 비교하세요."
 ],
 "5-1-u2-t2": [
  "두 수에 모두 나누어떨어지는 수를 작은 수부터 찾아보세요.",
  "두 수의 최대공약수의 약수를 빠짐없이 확인하세요."
 ],
 "5-1-u2-t2-10": [
  "${base}와 공약수가 1뿐인 수를 작은 수부터 세어 보세요.",
  "${base}와 공약수가 1뿐인 수를 빠짐없이 세어 보세요."
 ],
 "5-1-u2-t2-11": [
  "${target}의 세 자리 배수부터 찾아보세요.",
  "세 자리 수를 큰 수부터 확인하여 최대공약수 조건을 만족하는 첫 수를 찾으세요."
 ],
 "5-1-u2-t2-12": [
  "${product}의 약수 짝을 써 보세요.",
  "약수 짝마다 최대공약수를 확인하여 조건을 만족하는 쌍을 빠뜨리지 마세요."
 ],
 "5-1-u2-t2-13": [
  "첫째 조건에서는 나누어지는 수에서 나머지를 빼고, 둘째 조건에서는 두 수를 더하세요.",
  "두 조건에서 나누어떨어지는 수의 공약수를 모두 찾아 범위 조건을 확인하세요."
 ],
 "5-1-u2-t2-14": [
  "조건을 만족하는 두 자리 수를 모두 쓴 뒤 더하세요.",
  "${target}의 배수 중 최대공약수 조건을 만족하는 수를 빠짐없이 찾아 더하세요."
 ],
 "5-1-u2-t2-2": [
  "한 수의 약수를 쓴 뒤 다른 수에도 나누어떨어지는지 확인하세요.",
  "최대공약수를 먼저 구하면 공약수를 빠뜨리지 않을 수 있습니다."
 ],
 "5-1-u2-t2-3": [
  "먼저 두 곱셈을 계산하세요.",
  "두 곱을 계산한 뒤 최대공약수의 약수를 이용해 보세요."
 ],
 "5-1-u2-t2-4": [
  "두 자리 수를 ${target}의 배수부터 찾아보세요.",
  "${base}의 약수와 배수 관계를 함께 확인하여 빠짐없이 찾으세요."
 ],
 "5-1-u2-t2-5": [
  "공약수를 먼저 모두 찾고 약수의 개수를 세어 보세요.",
  "공약수마다 약수의 짝을 세어 조건을 만족하는 수를 하나로 정하세요."
 ],
 "5-1-u2-t2-6": [
  "${target}의 배수를 작은 수부터 확인하고 ${forbiddenMultiple}의 배수는 빼세요.",
  "최대공약수 조건과 배수가 아닌 조건을 함께 확인하세요."
 ],
 "5-1-u2-t2-7": [
  "공약수를 모두 쓴 뒤 개수를 세세요.",
  "최대공약수의 약수 개수를 이용해 빠짐없이 세세요."
 ],
 "5-1-u2-t2-8": [
  "두 수에 모두 나누어떨어지는 수를 세세요.",
  "최대공약수를 구하고 그 약수의 개수를 세세요."
 ],
 "5-1-u2-t2-9": [
  "공약수를 작은 수부터 쓴 뒤 세어 보세요.",
  "최대공약수의 약수를 빠짐없이 세어 보세요."
 ],
 "5-1-u2-t7": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-10": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-11": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-3": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-4": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-5": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-6": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-7": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t7-9": [
  "풀이 도움: 어떤 수들의 최대공약수를 구해야 하는지 먼저 찾아보세요."
 ],
 "5-1-u2-t8": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-10": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-2": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-3": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-4": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-5": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-6": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-7": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-8": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u2-t8-9": [
  "풀이 도움: 두 수를 최대공약수의 배수로 나타내어 보세요."
 ],
 "5-1-u3-t1": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-10": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-2": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-3": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-6": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-7": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t1-9": [
  "풀이 도움: 주어진 두세 짝에 같은 규칙을 적용해 보세요."
 ],
 "5-1-u3-t2-10": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-2": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-3": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-4": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-5": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-6": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-7": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t2-8": [
  "풀이 도움: 표의 수가 어떻게 바뀌는지 먼저 식으로 나타내세요."
 ],
 "5-1-u3-t3": [
  "풀이 도움: 처음 네 값을 써서 한 단계씩 얼마나 늘어나는지 살펴보세요."
 ],
 "5-1-u3-t3-5": [
  "풀이 도움: 처음 네 값을 써서 한 단계씩 얼마나 늘어나는지 살펴보세요."
 ],
 "5-1-u3-t3-6": [
  "풀이 도움: 처음 네 값을 써서 한 단계씩 얼마나 늘어나는지 살펴보세요."
 ],
 "5-1-u3-t3-7": [
  "풀이 도움: 처음 네 값을 써서 한 단계씩 얼마나 늘어나는지 살펴보세요."
 ],
 "5-1-u3-t3-8": [
  "풀이 도움: 처음 네 값을 써서 한 단계씩 얼마나 늘어나는지 살펴보세요."
 ],
 "5-1-u3-t4": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-10": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-2": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-3": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-4": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-5": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-6": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-7": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-8": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u3-t4-9": [
  "풀이 도움: 두 양이 함께 바뀌는 식을 먼저 세우세요."
 ],
 "5-1-u4-t1": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-10": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-2": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-3": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-4": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-5": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-6": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-7": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-8": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t1-9": [
  "풀이 도움: 두 분수의 분자끼리와 분모끼리가 몇 배인지 먼저 살펴보세요."
 ],
 "5-1-u4-t2": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-10": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-11": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-2": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-3": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-4": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-5": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-6": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-7": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-8": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t2-9": [
  "풀이 도움: 분자와 분모를 함께 나눌 수 있는 수를 먼저 찾아보세요."
 ],
 "5-1-u4-t3": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-10": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-11": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-2": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-3": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-4": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-5": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-6": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-7": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-8": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t3-9": [
  "풀이 도움: 같은 분모로 바꾸거나 두 분수의 분자와 분모를 교차해 곱해 보세요."
 ],
 "5-1-u4-t4": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-10": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-11": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-2": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-3": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-4": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-5": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-6": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-7": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-8": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u4-t4-9": [
  "풀이 도움: 두 분수의 분자와 분모를 교차해 곱하여 가능한 자연수를 차례로 적어 보세요."
 ],
 "5-1-u5-t1": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-10": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-11": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-2": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-3": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-4": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u5-t1-9": [
  "풀이 도움: 분모를 같게 바꾼 뒤 분자끼리 더하세요."
 ],
 "5-1-u6-t3-10": [
  "먼저 평행사변형 한 조각의 넓이를 구하세요."
 ],
 "5-1-u6-t3-5": [
  "두 평행사변형의 넓이는 각각 108cm²입니다."
 ],
 "5-1-u6-t4-3": [
  "색칠하지 않은 삼각형의 넓이는 40cm²입니다."
 ],
 "5-1-u6-t4-5": [
  "겹친 부분의 넓이는 36cm²입니다."
 ],
 "5-1-u6-t4-6": [
  "사다리꼴 ㄱㄴㄷㄹ의 넓이는 252cm²이고, 목표 넓이는 84cm²입니다."
 ],
 "5-2-u1-e1-example-1-1": [
  "도움말: ㄱ과 ㄴ의 차는 427입니다.",
  "세 자리 자연수 중 가장 큰 수를 생각해 보세요."
 ],
 "5-2-u1-e1-example-1-2": [
  "도움말: 6명씩 앉힐 때 학생 수는 247명 이상 253명 미만입니다."
 ],
 "5-2-u1-e1-example-1-3": [
  "도움말: 모자를 쓰지 않은 사람은 14명입니다.",
  "이 사람들부터 선글라스를 낀다고 생각해 보세요."
 ],
 "5-2-u1-e1-example-1-4": [
  "도움말: 한 상자에 가장 많이 담을 수 있는 귤은 34개입니다."
 ],
 "5-2-u1-e1-exploration": [
  "도움말: 왼쪽 끝수는 포함하지 않고, 오른쪽 끝수는 포함합니다."
 ],
 "5-2-u1-e1-mission-1": [
  "도움말: 양 끝을 포함하는지 먼저 확인하고 두 범위의 공통 부분을 찾으세요."
 ],
 "5-2-u1-e1-mission-2": [
  "도움말: 처음으로 조건에 맞는 배수는 36입니다."
 ],
 "5-2-u1-e1-mission-3": [
  "도움말: ㄱ과 ㄴ 사이의 자연수는 ㄴ-ㄱ-1개입니다."
 ],
 "5-2-u1-e1-mission-4": [
  "도움말: 정수 부분에 놓을 숫자별로 나누어 세고, 소수 부분의 두 자리는 순서가 있음을 기억하세요."
 ],
 "5-2-u1-e1-mission-5": [
  "도움말: 한 대 적게 썼을 때의 최대 인원보다 학생이 많아야 합니다."
 ],
 "5-2-u1-e1-mission-6": [
  "도움말: 상자 수를 가장 적게 하려면 한 상자에 가장 많이 담는 수를 생각하세요."
 ],
 "5-2-u1-e2-example-2-1": [
  "도움말: 백의 자리까지 어림할 때는 십의 자리 숫자를 먼저 살펴보세요.",
  "도움말: 각 수의 두 결과를 계산해 표처럼 비교한 다음, 같은 기호를 모두 쓰세요."
 ],
 "5-2-u1-e2-example-2-3": [
  "도움말: 십의 자리 조건은 일의 자리 숫자를, 백의 자리 조건은 십의 자리 숫자를 먼저 살펴보세요.",
  "도움말: 첫째 조건을 만족하는 후보와 둘째 조건을 만족하는 후보를 각각 찾은 뒤 공통인 수를 확인하세요."
 ],
 "5-2-u1-e2-exploration": [
  "도움말: 올림은 지정한 자리보다 작은 수가 남으면 다음 단위로 올리고, 반올림은 바로 오른쪽 숫자를 살펴보세요.",
  "도움말: 각 방법으로 나타낸 수를 먼저 적고, 지정한 자리보다 작은 숫자가 어떻게 처리되는지 설명하세요."
 ],
 "5-2-u1-e2-mission-1": [
  "도움말: 수를 10, 100, 1000씩 묶어 표의 빈칸을 채워 보세요.",
  "풀이 순서: 올림한 수를 쓰고, 각 결과에서 원래 수보다 얼마나 커졌는지도 살펴보세요."
 ],
 "5-2-u1-e2-mission-2": [
  "도움말: 두 어림값을 각각 구한 다음, 큰 값에서 작은 값을 빼세요.",
  "풀이 순서: 두 결과의 순서가 바뀌어도 차는 음수가 되지 않도록 계산하세요."
 ],
 "5-2-u1-e2-mission-3": [
  "도움말: 목표보다 작은 수와 큰 수에서 각각 가장 가까운 수를 찾아 비교하세요.",
  "풀이 순서: 가장 가까운 수를 먼저 정한 뒤, 그 수를 천의 자리까지 반올림하세요."
 ],
 "5-2-u1-e2-mission-4": [
  "도움말: 천의 자리까지 버림한 수와 반올림한 수를 각각 써서 비교하세요.",
  "풀이 순서: 버림과 반올림이 같아지려면 뒤의 세 자리에서 반올림해 올릴 수 없어야 합니다."
 ],
 "5-2-u1-e2-mission-5": [
  "도움말: 올림과 버림의 결과가 같아지는 수를 먼저 찾아보세요.",
  "풀이 순서: 세 방법의 결과가 같으려면 해당 자리의 배수인 수만 남습니다.",
  "범위의 양 끝을 확인하세요."
 ],
 "5-2-u1-e2-mission-6": [
  "도움말: 십의 자리(또는 그보다 큰 자리)까지 올림한 결과와 반올림한 결과를 비교하세요.",
  "풀이 순서: 두 조건을 각각 만족하는 끝자리 범위를 정한 뒤, 전체 자연수에서 전수 확인하세요."
 ],
 "5-2-u1-e3-exploration-round-down": [
  "도움말: 십의 자리 아래를 없애고, 십의 자리보다 작은 수는 남기지 않습니다."
 ],
 "5-2-u1-e3-exploration-round-nearest": [
  "도움말: 소수 첫째 자리까지 반올림할 때는 소수 둘째 자리 숫자를 확인하세요."
 ],
 "5-2-u1-e3-exploration-round-up": [
  "도움말: 천의 자리보다 작은 자리의 수가 남아 있으면, 그다음 천 단위로 올립니다.",
  "23,481에서 천의 자리 아래를 살펴보세요."
 ],
 "5-2-u1-e3-mission-1-box-count": [
  "도움말: 동화책 수를 4로 나누어 과학책 수를, 2로 나누어 위인전 수를 구해 보세요."
 ],
 "5-2-u1-e3-mission-2-perimeter": [
  "도움말: 안쪽 선분과 바깥쪽 선분의 길이를 각각 더해 전체 가로·세로와 비교해 보세요."
 ],
 "5-2-u1-e3-mission-3-cube-box-count": [
  "각 방향에 남는 공간을 확인하고, 상자를 더 넣을 수 없는 까닭을 설명하세요."
 ],
 "5-2-u1-e3-mission-4-mat-cost": [
  "도움말: 필요한 묶음 수를 구할 때 모자라지 않도록 올림하고, 묶음 수에 한 묶음의 가격을 곱하세요."
 ],
 "5-2-u1-e3-mission-5-bar-graph-length": [
  "도움말: 먼저 인구를 십만 단위로 반올림한 뒤, 십만 명의 개수에 5mm를 곱하세요."
 ],
 "5-2-u1-e3-mission-6-citrus-sales": [
  "도움말: 전체 수를 한 상자에 담는 수로 나누고, 몫과 나머지를 구분하세요."
 ],
 "5-2-u2-e1-exploration-1-explanation-synthetic": [
  "도움말: 같은 수를 여러 번 더하는 식을 곱셈으로 나타내 보세요."
 ],
 "5-2-u2-e4-example-2-synthetic": [
  "도움말: 양 끝 사이의 길이를 먼저 구하고, 8등분 중 대각선이 지나는 칸의 위치를 살펴보세요."
 ],
 "5-2-u5-t6-2": [
  "처음 위 5, 처음 오른쪽 4 → 굴린 뒤 위 6"
 ],
 "6-1-u3-e1-mission-4": [
  "기호의 자리를 따라 계산하세요"
 ],
 "6-1-u3-e4-example-4": [
  "왕복 이동을 세 구간으로 나누어 보세요."
 ],
 "6-1-u3-e4-exploration-1": [
  "주어진 관계를 식으로 나타내세요."
 ],
 "6-1-u3-e4-mission-1": [
  "점 사이의 관계를 읽으세요."
 ],
 "6-1-u3-e4-mission-2": [
  "넓이의 증가를 이용하세요."
 ],
 "6-1-u3-e4-mission-3": [
  "길의 넓이와 폭으로 둘레를 구하세요."
 ],
 "6-1-u3-e4-mission-5": [
  "왕복 이동을 세 구간으로 나누어 보세요."
 ],
 "6-1-u3-e4-mission-6": [
  "원형 길을 펼쳐 두 구간으로 생각하세요."
 ],
 "6-1-u4-e3-example-3-4": [
  "계산 순서",
  "주유한 기름 양 → 전체 기름 양 → 갈 수 있는 거리"
 ],
 "6-1-u5-e4-example-1": [
  "김씨는 약 1,100만 명입니다."
 ],
 "6-1-u5-e4-example-2": [
  "남학생은 360명, 여학생은 240명입니다."
 ],
 "6-1-u5-e4-exploration-1": [
  "찬성 중 가장 큰 이유에 해당하는 사람은 1,225명입니다."
 ],
 "6-1-u5-e4-exploration-2": [
  "교통 체증을 이유로 든 사람은 420명입니다."
 ],
 "6-1-u5-e4-mission-1": [
  "소설 책에서 바꾼 비율은 전체의 15%입니다."
 ],
 "6-1-u5-e4-mission-2": [
  "전체 학생을 100명으로 보면 여학생은 38명입니다."
 ],
 "6-1-u5-e4-mission-4": [
  "팽이를 고른 학생은 전체의 4%입니다."
 ],
 "6-1-u5-e4-mission-5": [
  "전체 학생은 80명입니다."
 ],
 "6-1-u5-e4-mission-6": [
  "여학생은 300명입니다."
 ],
 "6-1-u6-e2-example-1": [
  "가장 짧은 변으로 가능한 길이는 1cm, 2cm입니다.",
  "가장 짧은 변으로 가능한 길이: 1cm, 2cm"
 ],
 "6-1-u6-e2-example-4": [
  "다에는 나의 고리가 함께 들어 있다는 점을 이용하세요."
 ],
 "6-1-u6-e2-exploration": [
  "접은 뒤 상자의 밑면은 가로 18cm, 세로 12cm입니다.",
  "접은 뒤 밑면 18cm × 12cm",
  "종이의 가로와 세로를 먼저 구하세요."
 ],
 "6-1-u6-e2-mission-1": [
  "가장 짧은 변으로 가능한 길이는 1cm, 2cm, 3cm입니다.",
  "가장 짧은 변으로 가능한 길이: 1cm, 2cm, 3cm"
 ],
 "6-1-u6-e2-mission-3": [
  "앞면 계단과 뒤쪽 깊이를 함께 살펴보세요"
 ],
 "6-1-u6-e2-mission-4": [
  "표시된 그림의 길이를 이용하여"
 ],
 "6-1-u6-e2-mission-5": [
  "가의 끈은 세로와 높이의 합의 2배, 나의 끈은 가로와 높이의 합의 2배, 다의 세 방향 끈은 가로·세로·높이의 합의 4배입니다.",
  "세로+높이의 2배",
  "가로+높이의 2배",
  "세 변의 합의 4배"
 ],
 "6-1-u6-e2-mission-6": [
  "종이를 펼치면 삼각형의 밑변은 가장 짧은 모서리의 4배이고, 높이는 가장 짧은 모서리의 1배와 3배를 더한 길이입니다.",
  "그림의 모서리 이름과 종이가 꺾인 자리를 이용하여 삼각형 종이를 한 평면에 펼쳐 생각하세요."
 ],
 "6-1-u6-e3-mission-2": [
  "일곱 정육면체의 위치를 그림에서 확인하세요"
 ],
 "6-1-u6-e3-mission-3": [
  "먼저 부피를 옆면의 높이로 나누어 밑넓이를 구하고, 계단 모양 밑면을 높이가 다른 세 직사각형으로 나누어 보세요.",
  "전개도에 표시된 길이만 사용하여 빈칸에 알맞은 길이가 하나뿐임을 확인하세요."
 ],
 "6-2-u1-e3-mission-2": [
  "분모에 있는 분수의 합부터 계산하세요."
 ],
 "6-2-u2-e1-example-2": [
  "㉠과 ㉡을 각각 구한 뒤 비교하세요.",
  "㉠과 ㉡을 직접 구하지 않고 두 나눗셈을 비교해 보세요."
 ],
 "6-2-u2-e1-example-3": [
  "나×나의 값을 먼저 찾아보세요.",
  "가와 다의 값을 각각 구하지 않고 풀어 보세요."
 ],
 "6-2-u2-e1-example-4": [
  "소수 부분은 0 이상 1 미만입니다."
 ],
 "6-2-u2-e1-exploration-2": [
  "나누는 수를 자연수로 바꾸어 생각해 보세요."
 ],
 "6-2-u2-e1-mission-2": [
  "두 범위에 모두 들어가는 자연수를 찾으세요."
 ],
 "6-2-u2-e1-mission-3": [
  "㉠은 소수 첫째 자리까지 나타낸 수입니다."
 ],
 "6-2-u2-e1-mission-4": [
  "㉠, ㉡은 각각 1부터 9까지의 자연수입니다."
 ],
 "6-2-u2-e1-mission-5": [
  "0을 일의 자리에 놓아 0보다 큰 소수도 만들 수 있습니다."
 ],
 "6-2-u2-e1-mission-6": [
  "세 장은 각각 한 번만 씁니다."
 ],
 "6-2-u2-e2-example-2": [
  "정각의 작은 각은 120°이고, 180°까지 커졌다가 다시 작아집니다."
 ],
 "6-2-u2-e2-exploration": [
  "위쪽 직사각형의 높이는 3.6cm입니다."
 ],
 "6-2-u2-e2-mission-1": [
  "간격 수보다 소화기 수가 한 개 많다는 점을 생각해 보세요."
 ],
 "6-2-u2-e2-mission-2": [
  "처음 한 장을 붙인 뒤에는 한 장을 더 붙일 때 늘어나는 길이를 생각해 보세요."
 ],
 "6-2-u2-e2-mission-5": [
  "두 사람이 한 시간에 얼마나 가까워지는지 생각해 보세요."
 ],
 "6-2-u2-e2-mission-6": [
  "왼쪽 직사각형들의 너비는 3.7cm이고, 오른쪽 직사각형들의 너비는 2.22cm입니다."
 ],
 "6-2-u2-e3-example-2": [
  "□에는 6부터 9까지의 숫자 중 하나가 들어갑니다."
 ],
 "6-2-u2-e3-mission-2": [
  "나누어지는 수의 일의 자리에는 7를 놓습니다."
 ],
 "6-2-u2-e3-mission-3": [
  "반올림하기 전의 몫은 0.855 이상 0.865 미만입니다."
 ],
 "6-2-u3-e1-example-3": [
  "보이는 옆면의 넓이의 합은 28cm²입니다."
 ],
 "6-2-u3-e1-example-4": [
  "위 그림의 ㉠칸에는 쌓기나무 1개가 쌓여 있습니다."
 ],
 "6-2-u3-e1-mission-2": [
  "위 그림에 적힌 수는 그 칸에 쌓은 쌓기나무의 개수입니다."
 ],
 "6-2-u3-e1-mission-3": [
  "위 그림의 ㉠칸에는 쌓기나무 3개가 쌓여 있습니다.",
  "□에 알맞은 높이를 먼저 구하세요."
 ],
 "6-2-u3-e1-mission-4": [
  "아래쪽 □에 들어갈 수는 1입니다."
 ],
 "6-2-u3-e2-example-3": [
  "2층에서 어느 한 면도 보이지 않는 쌓기나무는 6개입니다."
 ],
 "6-2-u3-e2-example-4": [
  "그림에서 색을 확인할 수 없는 쌓기나무는 36개입니다."
 ],
 "6-2-u3-e3-example-2": [
  "빼내기 전 두 면에만 페인트가 칠해진 쌓기나무는 12개입니다."
 ],
 "6-2-u3-e3-example-3-1": [
  "쌓기나무는 모두 7층입니다.",
  "맨 위층을 제외한 각 층에서 빨간색이 두 면에 칠해진 쌓기나무는 2개씩입니다."
 ],
 "6-2-u3-e3-example-3-2": [
  "쌓기나무는 모두 7층입니다.",
  "맨 위층을 제외한 각 층에서 어느 면에도 색칠되지 않은 쌓기나무는 25개씩입니다."
 ],
 "6-2-u3-e3-mission-3": [
  "㉮는 3입니다."
 ],
 "6-2-u3-e3-mission-5-1": [
  "두 면에만 색칠된 쌓기나무는 8개입니다."
 ],
 "6-2-u3-e3-mission-5-2": [
  "두 면에만 색칠된 쌓기나무는 8개입니다."
 ],
 "6-2-u3-e3-mission-6-1": [
  "쌓기나무는 모두 5층으로 쌓여 있습니다."
 ],
 "6-2-u3-e3-mission-6-2": [
  "쌓기나무는 모두 5층으로 쌓여 있습니다."
 ]
};

  // 2026-11-23 문제 그림 검토 결과: 원문에 없는 설명·요약 그림은 통째로, 원문 그림 안의 답·중간 결과 이름표는 그 이름표만 지웁니다.
  // { 유형: [{ levels: [-1,0,1], svg: 그림 순번 또는 class, labels: [이름표 순번…] (없으면 그림 전체) }] }
  const DIAGRAM_RULES = {"5-1-u1-t2-11":[{"labels":[6],"levels":[-1],"svg":0},{"labels":[6],"levels":[0],"svg":0},{"labels":[6],"levels":[1],"svg":0}],"5-1-u1-t3-7":[{"labels":[1],"levels":[-1],"svg":0},{"labels":[1],"levels":[0],"svg":0},{"labels":[1],"levels":[1],"svg":0}],"5-2-u1-e3-mission-3-cube-box-count":[{"levels":[-1,0,1],"svg":"source52-cube-box-diagram"}],"5-2-u5-t2-4":[{"labels":[1,2],"levels":[-1],"svg":0},{"labels":[1,2],"levels":[0],"svg":0},{"labels":[1,2],"levels":[1],"svg":0}],"5-2-u5-t5-5":[{"levels":[-1,0,1],"svg":"stacked-dice"}],"6-1-u1-e2-example-4":[{"levels":[-1,0,1],"svg":"source61-e2-diagram"}],"6-1-u1-e2-mission-5":[{"levels":[-1,0,1],"svg":"source61-e2-diagram"}],"6-1-u1-e2-mission-6":[{"levels":[-1,0,1],"svg":"source61-e2-diagram"}],"6-1-u2-e1-example-1-1":[{"levels":[-1,0,1],"svg":"source61-prism-structure"},{"levels":[-1,0,1],"selector":".source61-prism-caption"}],"6-1-u2-e1-mission-1":[{"levels":[-1,0,1],"svg":"source61-prism-structure"},{"levels":[-1,0,1],"selector":".source61-prism-caption"}],"6-1-u2-e1-mission-2":[{"levels":[-1,0,1],"svg":"geometry-diagram"},{"levels":[-1,0,1],"selector":".source61-prism-caption"}],"6-1-u2-e2-example-2-4":[{"labels":[3,4],"levels":[-1],"svg":0},{"labels":[3,4],"levels":[0],"svg":0},{"labels":[3,4],"levels":[1],"svg":0}],"6-1-u2-e3-example-3-1":[{"levels":[-1,0,1],"svg":"source61-e3-prism-pyramid"}],"6-1-u2-e3-mission-1":[{"levels":[-1,0,1],"svg":"source61-e3-prism-pyramid"}],"6-1-u2-e3-mission-3":[{"labels":[4,5,6],"levels":[-1],"svg":0},{"labels":[4,5,6],"levels":[0],"svg":0},{"labels":[4,5,6],"levels":[1],"svg":0},{"levels":[-1,0,1],"selector":"g.source61-e3-height-question"}],"6-1-u2-e3-mission-5":[{"labels":[1,2,3],"levels":[-1],"svg":0},{"labels":[1,2,3],"levels":[0],"svg":0},{"labels":[1,2,3],"levels":[1],"svg":0},{"levels":[-1,0,1],"selector":"line[data-solid-edge=\"expanded-edge\"], line.source61-e3-interval-mark, circle.source61-e3-vertex-mark"}],"6-1-u2-t1-2":[{"levels":[-1,0,1],"svg":"angular-prism"}],"6-1-u2-t1-4":[{"levels":[-1,0,1],"svg":"angular-prism"}],"6-1-u2-t2-2":[{"levels":[-1,0,1],"svg":"angular-prism"}],"6-1-u2-t2-5":[{"levels":[-1,0,1],"svg":"angular-prism"}],"6-1-u2-t3-5":[{"levels":[-1,0,1],"svg":"angular-pyramid"}],"6-1-u3-e2-example-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-example-3":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-exploration-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-mission-2":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-mission-3":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-mission-4":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e2-mission-5":[{"levels":[-1,0,1],"svg":"source61-decimal-e2-diagram"}],"6-1-u3-e3-example-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-example-2":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-example-3":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-example-4":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-exploration-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-2":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-3":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-4":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-5":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e3-mission-6":[{"levels":[-1,0,1],"svg":"source61-decimal-e3-diagram"}],"6-1-u3-e4-example-2":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-example-3":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-example-4":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-exploration-1":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-mission-2":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-mission-5":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u3-e4-mission-6":[{"levels":[-1,0,1],"svg":"source61-decimal-e4-diagram"}],"6-1-u4-e1-example-1-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-example-1-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-mission-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-mission-5":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e1-mission-6":[{"levels":[-1,0,1],"svg":"source61-ratio-e1-diagram"}],"6-1-u4-e2-example-2-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-example-2-2":[{"labels":[9],"levels":[-1],"svg":0},{"labels":[9],"levels":[0],"svg":0},{"labels":[9],"levels":[1],"svg":0}],"6-1-u4-e2-example-2-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-example-2-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-exploration-2-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-5":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e2-mission-6":[{"levels":[-1,0,1],"svg":"source61-ratio-e2-diagram"}],"6-1-u4-e3-example-3-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-example-3-2":[{"labels":[4,5,6],"levels":[-1],"svg":0},{"labels":[4,5,6],"levels":[0],"svg":0},{"labels":[4,5,6],"levels":[1],"svg":0}],"6-1-u4-e3-example-3-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-example-3-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-exploration-3-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-mission-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-mission-3":[{"labels":[12],"levels":[-1],"svg":0},{"labels":[12],"levels":[0],"svg":0},{"labels":[12],"levels":[1],"svg":0}],"6-1-u4-e3-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e3-diagram"}],"6-1-u4-e3-mission-5":[{"levels":[-1,0,1],"replace":{"12":"1개월 이자율: 가 □%, 나 □%"},
 "svg":0}],"6-1-u4-e3-mission-6":[{"labels":[12],"levels":[-1],"svg":0},{"labels":[12],"levels":[0],"svg":0},{"labels":[12],"levels":[1],"svg":0}],"6-1-u4-e4-example-4-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-example-4-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-example-4-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-example-4-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-exploration-4-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-exploration-4-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-mission-1":[{"labels":[9],"levels":[-1],"svg":0},{"labels":[9],"levels":[0],"svg":0},{"labels":[9],"levels":[1],"svg":0}],"6-1-u4-e4-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-mission-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-mission-5":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e4-mission-6":[{"levels":[-1,0,1],"svg":"source61-ratio-e4-diagram"}],"6-1-u4-e5-example-5-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-example-5-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-example-5-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-example-5-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-exploration-5-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-mission-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-mission-5":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e5-mission-6":[{"levels":[-1,0,1],"svg":"source61-ratio-e5-diagram"}],"6-1-u4-e6-example-6-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-example-6-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-example-6-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-example-6-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-exploration-6-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-1":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-2":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-3":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-4":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-5":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u4-e6-mission-6":[{"levels":[-1,0,1],"svg":"source61-ratio-e6-diagram"}],"6-1-u5-e1-example-1":[{"labels":[6],"levels":[-1],"svg":0},{"labels":[6],"levels":[0],"svg":0},{"labels":[6],"levels":[1],"svg":0}],"6-1-u5-e1-mission-6":[{"labels":[3],"levels":[-1],"svg":0},{"labels":[3],"levels":[0],"svg":0},{"labels":[3],"levels":[1],"svg":0}],"6-1-u5-e2-example-3":[{"levels":[-1,0,1],"textPattern":"^(?:0|20|40|60|80|100|백분율\\(%\\)|\\d+%)$"},{"levels":[-1,0,1],"rewrite":"$1","textPattern":"^(장미|무궁화|봉선화|국화|백합|튤립|해바라기) \\d+%$"}],"6-1-u5-e3-example-3":[{"labels":[12],"levels":[-1],"svg":0},{"labels":[3],"levels":[-1],"svg":3},{"labels":[12],"levels":[0],"svg":0},{"labels":[3],"levels":[0],"svg":3},{"labels":[12],"levels":[1],"svg":0},{"labels":[3],"levels":[1],"svg":3}],"6-1-u5-e3-mission-6":[{"labels":[12],"levels":[-1],"svg":0},{"labels":[3],"levels":[-1],"svg":3},{"labels":[12],"levels":[0],"svg":0},{"labels":[3],"levels":[0],"svg":3},{"labels":[12],"levels":[1],"svg":0},{"labels":[3],"levels":[1],"svg":3}],"6-1-u5-e4-mission-5":[{"levels":[-1,0],"replace":{"12":"□","4":"□"},
 "svg":0}],"6-1-u5-t3":[{"labels":[1],"levels":[-1],"svg":0},{"levels":[-1],"replace":{"4":"소설책"},
 "svg":0},{"labels":[1],"levels":[0],"svg":0},{"levels":[0],"replace":{"4":"소설책"},
 "svg":0},{"labels":[1],"levels":[1],"svg":0},{"levels":[1],"replace":{"4":"소설책"},
 "svg":0}],"6-1-u6-e2-example-1":[{"levels":[-1,0,1],"svg":"source61-volume-e2-diagram"}],"6-1-u6-e2-example-2":[{"labels":[4],"levels":[-1],"svg":0}],"6-1-u6-e2-exploration":[{"labels":[4],"levels":[-1],"svg":0},{"labels":[0,1],"levels":[1],"svg":0}],"6-1-u6-e2-mission-1":[{"levels":[-1,0,1],"svg":"source61-volume-e2-diagram"}],"6-1-u6-e2-mission-5":[{"labels":[2,5,8],"levels":[-1],"svg":0}],"6-1-u6-e3-example-4":[{"labels":[1,2,3,4,5,6],"levels":[-1],"svg":0},{"labels":[1,2,3,4,5,6],"levels":[0],"svg":0},{"labels":[1,2,3,4,5,6],"levels":[1],"svg":0}],"6-1-u6-e3-exploration":[{"labels":[1,2],"levels":[-1],"svg":0},{"labels":[1,2],"levels":[0],"svg":0},{"labels":[1,2],"levels":[1],"svg":0}],"6-1-u6-e3-mission-2":[{"labels":[0,1,2],"levels":[-1],"svg":0},{"labels":[0,1,2],"levels":[0],"svg":0},{"labels":[0,1,2],"levels":[1],"svg":0}],"6-1-u6-e3-mission-3":[{"labels":[6,8],"levels":[-1],"svg":0},{"labels":[6,8],"levels":[0],"svg":0},{"labels":[6,8],"levels":[1],"svg":0}],"6-1-u6-e3-mission-4":[{"labels":[0,1],"levels":[-1],"svg":0},{"labels":[0,1],"levels":[0],"svg":0},{"labels":[0,1],"levels":[1],"svg":0}],"6-1-u6-e3-mission-5":[{"labels":[4],"levels":[-1],"svg":0},{"labels":[4],"levels":[0],"svg":0},{"labels":[4],"levels":[1],"svg":0}],"6-1-u6-e3-mission-6":[{"labels":[6,7],"levels":[-1],"svg":0},{"labels":[6,7],"levels":[0],"svg":0},{"labels":[6,7],"levels":[1],"svg":0}],"6-1-u6-e4-example-1":[{"labels":[0,5],"levels":[-1],"svg":0},{"labels":[0,5],"levels":[0],"svg":0},{"labels":[0,5],"levels":[1],"svg":0}],"6-1-u6-e4-example-2":[{"labels":[4],"levels":[-1],"svg":0},{"labels":[4],"levels":[0],"svg":0},{"labels":[4],"levels":[1],"svg":0}],"6-1-u6-e4-example-3":[{"labels":[6],"levels":[-1],"svg":0},{"labels":[6],"levels":[0],"svg":0},{"labels":[6],"levels":[1],"svg":0}],"6-1-u6-e4-example-4":[{"labels":[5],"levels":[-1],"svg":0},{"labels":[5],"levels":[0],"svg":0},{"labels":[5],"levels":[1],"svg":0}],"6-1-u6-e4-exploration-1":[{"labels":[10],"levels":[-1],"svg":0},{"labels":[10],"levels":[0],"svg":0},{"labels":[10],"levels":[1],"svg":0}],"6-1-u6-e4-mission-2":[{"labels":[0,4],"levels":[-1],"svg":0},{"labels":[0,4],"levels":[0],"svg":0},{"labels":[0,4],"levels":[1],"svg":0}],"6-1-u6-e4-mission-3":[{"labels":[6],"levels":[-1],"svg":0},{"labels":[6],"levels":[0],"svg":0},{"labels":[6],"levels":[1],"svg":0}],"6-1-u6-e4-mission-5":[{"labels":[3],"levels":[-1],"svg":0},{"labels":[3],"levels":[0],"svg":0},{"labels":[3],"levels":[1],"svg":0}],"6-2-u1-e2-mission-6":[{"levels":[-1,0,1],"textPattern":"^(?:땅과 같은 수의 나무|나무 사이 간격 \\?m)$"}],"6-2-u3-e1-mission-2":[{"levels":[-1],"textPattern":"^\\d+$"}],"6-2-u3-e1-example-4":[{"levels":[-1],"textPattern":"^㉠$"}],"6-2-u3-e1-mission-3":[{"levels":[-1],"textPattern":"^㉠$"}]};

  // 문제 문장에 자료가 모두 있는데도 남아 있던 조건 정리 상자(파생값·풀이식이 들어 있어 자동 판정을 통과하지 못한 것). 2026-11-23 문제 문장과 하나씩 대조.
  const BOARD_DROP = new Set(["6-1-u2-e4-mission-4","6-1-u3-e2-example-1","6-1-u3-e2-mission-3","6-1-u4-e5-mission-5","6-1-u2-e3-mission-5","6-1-u1-e2-example-2", "6-1-u1-e2-mission-3", "6-1-u1-e2-mission-5", "6-1-u2-e1-mission-5", "6-1-u2-e2-example-2-3", "6-1-u2-e2-mission-5", "6-1-u3-e1-example-3", "6-1-u3-e1-example-4", "6-1-u3-e1-mission-5", "6-1-u3-e3-mission-4", "6-1-u3-e4-mission-1", "6-1-u4-e1-mission-4", "6-1-u4-e2-example-2-4", "6-1-u4-e2-mission-6", "6-1-u4-e3-example-3-3", "6-1-u4-e3-mission-2", "6-1-u4-e3-mission-5", "6-1-u4-e4-example-4-1", "6-1-u4-e4-mission-1", "6-1-u4-e5-example-5-1", "6-1-u4-e5-example-5-2", "6-1-u4-e5-example-5-4", "6-1-u4-e5-mission-1", "6-1-u4-e5-mission-2", "6-1-u4-e5-mission-3", "6-1-u4-e5-mission-4", "6-1-u4-e6-exploration-6-1", "6-2-u1-e2-example-4", "6-2-u1-e2-mission-4", "6-2-u1-e2-mission-6", "6-2-u1-e3-example-2", "6-2-u1-e3-example-3", "6-2-u1-e3-mission-3", "6-2-u1-e3-mission-4", "6-2-u1-e3-mission-6", "6-2-u1-e5-example-1"]);

  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 2026-11-25: "1cm, 2cm"처럼 단위가 붙은 숫자를 쉼표로 이은 목록은 개수와 관계없이 맞춘다(변형 문항은 목록 길이가 다를 수 있다).
  const LIST_TOKEN = "\u0001";
  function sentencePattern(sentence) {
    const units = [];
    const normalized = String(sentence).replace(/\s+/g, " ").trim().replace(/\d[\d./]*([가-힣A-Za-z²³]+)(?:, ?\d[\d./]*\1)+/g, (match, unit) => { units.push(unit); return LIST_TOKEN; });
    const parts = normalized.split(/(\d[\d,./]*|\u0001)/);
    let listIndex = 0;
    return parts.map((part, index) => {
      if (index % 2 === 0) return escape(part).replace(/ /g, "\\s*");
      if (part === LIST_TOKEN) { const unit = escape(units[listIndex++]); return `(?<![\\d,./])\\d[\\d./]*${unit}(?:\\s*,\\s*\\d[\\d./]*${unit})*`; }
      return "(?<![\\d,./])\\d[\\d,./]*";
    }).join("\\s*");
  }
  const compiled = new Map();
  function patternsFor(id) {
    if (!id || !HINT_SENTENCES[id]) return [];
    if (!compiled.has(id)) compiled.set(id, HINT_SENTENCES[id].map(entry => {
      const text = typeof entry === "string" ? entry : entry.cut || entry.s;
      return new RegExp(sentencePattern(text));
    }));
    return compiled.get(id);
  }

  function visibleTextNodes(rootNode) {
    const nodes = [];
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        for (let el = node.parentElement; el && el !== rootNode; el = el.parentElement) {
          if (el.namespaceURI === "http://www.w3.org/2000/svg" || el.hidden || /^(STYLE|SCRIPT)$/.test(el.tagName)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
    return nodes;
  }

  // 여러 글자 노드(분수 span 등)에 걸친 문장도 지우도록, 글자를 이어 붙인 뒤 위치를 되짚어 지웁니다.
  const BLOCK_TAGS = /^(P|DIV|LI|UL|OL|TABLE|TR|TD|TH|SECTION|ARTICLE|FIGURE|FIGCAPTION|H[1-6]|BR|DL|DT|DD)$/;
  function blockOf(node, scope) {
    for (let el = node.parentElement; el; el = el.parentElement) if (BLOCK_TAGS.test(el.tagName)) return el;
    return scope;
  }
  function removeMatches(scope, regex) {
    let removed = 0;
    for (let guard = 0; guard < 20; guard += 1) {
      const nodes = visibleTextNodes(scope);
      let flat = "";
      let previousBlock = null;
      // 2026-11-24: 서로 다른 문단·상자(블록)의 글자 사이에 줄바꿈 경계를 넣는다. 상자 끝의 수 뒤에 바로 붙은
      // '먼저 …세요.' 문장도 문장 첫머리로 알아보도록 하기 위함이다(경계 글자는 어느 글자 조각에도 속하지 않는다).
      const spans = nodes.map(node => {
        const block = blockOf(node, scope);
        if (previousBlock && block !== previousBlock) flat += "\n";
        previousBlock = block;
        const start = flat.length; flat += node.data; return { node, start, end: flat.length };
      });
      const match = regex.exec(flat);
      if (!match || !match[0].trim()) break;
      const from = match.index, to = match.index + match[0].length;
      for (const span of spans) {
        if (span.end <= from || span.start >= to) continue;
        const a = Math.max(0, from - span.start), b = Math.min(span.node.data.length, to - span.start);
        span.node.data = span.node.data.slice(0, a) + span.node.data.slice(b);
      }
      removed += 1;
    }
    return removed;
  }

  const DROP_TAGS = "p,span,div,li,small,strong,b,em";
  function dropEmpty(scope, hadText) {
    for (const el of [...scope.querySelectorAll(DROP_TAGS)].reverse()) {
      if (el.hidden || el.querySelector("svg,img,canvas,input,table,[hidden]")) continue;
      // 2026-11-24: 정책이 글자를 지워 비게 된 요소만 지운다. 처음부터 글자가 없던 요소(그림 자료·검산 자료를 담은 data-* 요소 등)와
      // 쉼표·마침표만 든 요소(분수 사이 구분 쉼표, 소수점 등)는 내용이므로 남긴다.
      if (hadText.has(el) && !el.textContent.trim()) el.remove();
    }
  }

  function textOf(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll("[hidden],style,script").forEach(el => el.remove());
    const svgText = [...clone.querySelectorAll("svg text")].map(el => el.textContent).join(" ");
    clone.querySelectorAll("svg").forEach(el => el.remove());
    return `${clone.textContent} ${svgText}`;
  }

  function applyDiagramRules(scope, typeId, difficulty) {
    let changed = 0;
    const rules = DIAGRAM_RULES[typeId] || [];
    const svgs = [...scope.querySelectorAll("svg")].filter(svg => !svg.parentElement || !svg.parentElement.closest("svg"));
    const drop = [];
    for (const rule of rules) {
      if (rule.levels && !rule.levels.includes(difficulty)) continue;
      if (rule.selector) { drop.push(...scope.querySelectorAll(rule.selector)); continue; }
      if (rule.textPattern) {
        // 수가 문항마다 달라 위치로 정할 수 없는 이름표: 글자 모양으로 지우거나(drop) 바꿉니다(rewrite).
        const pattern = new RegExp(rule.textPattern);
        for (const svg of svgs) for (const label of svg.querySelectorAll("text")) {
          const text = label.textContent.trim();
          if (!pattern.test(text)) continue;
          if (rule.rewrite === undefined) drop.push(label);
          else { label.textContent = text.replace(pattern, rule.rewrite); changed += 1; }
        }
        continue;
      }
      if (rule.replace) {
        const svg = svgs[rule.svg];
        const texts = svg ? [...svg.querySelectorAll("text")] : [];
        for (const [index, text] of Object.entries(rule.replace)) if (texts[index]) { texts[index].textContent = text; changed += 1; }
        continue;
      }
      const targets = typeof rule.svg === "number" ? [svgs[rule.svg]] : svgs.filter(svg => svg.classList.contains(rule.svg));
      for (const svg of targets.filter(Boolean)) {
        if (!rule.labels) { drop.push(svg); continue; }
        const texts = [...svg.querySelectorAll("text")];
        for (const index of rule.labels) if (texts[index]) drop.push(texts[index]);
      }
    }
    // 범례 이름표를 지울 때는 바로 앞의 작은 색 네모(범례 칸)도 함께 지워 빈 칸이 남지 않게 합니다.
    for (const node of [...drop]) {
      const swatch = node.previousElementSibling;
      if (node.tagName && node.tagName.toLowerCase() === "text" && /legend/.test(node.getAttribute("class") || "") && swatch && swatch.tagName.toLowerCase() === "rect" && Number(swatch.getAttribute("width")) <= 14) drop.push(swatch);
    }
    for (const node of drop) if (node.parentNode) { node.remove(); changed += 1; }
    return changed;
  }

  function clean(prompt, typeId, difficulty) {
    const template = document.createElement("template");
    template.innerHTML = prompt;
    const scope = template.content;
    const hadText = new WeakSet([...scope.querySelectorAll(DROP_TAGS)].filter(el => el.textContent.trim()));
    let changed = applyDiagramRules(scope, typeId, difficulty);
    for (const el of scope.querySelectorAll("[class]")) {
      if ([...el.classList].some(name => /-hint$/.test(name))) { el.remove(); changed += 1; }
    }
    // 2026-11-24: 쉬움 난이도에 붙는 풀이 안내 문단(<p class="question-step" data-step-evidence="guided|guided-order">).
    for (const el of scope.querySelectorAll('p.question-step[data-step-evidence^="guided"]')) { el.remove(); changed += 1; }
    // 2026-11-24 사용자 결정("모두 지움"): 어려움 난이도의 확인·설명 요구 문단(data-step-evidence="independent-reasoning")도 원문에 없으므로 지운다.
    for (const el of scope.querySelectorAll('.question-step[data-step-evidence="independent-reasoning"]')) { el.remove(); changed += 1; }
    // 빈칸으로 풀이 틀을 미리 짜 주는 표(각기둥 면·모서리·꼭짓점 표 등)와 문제 수치를 되풀이한 관계 상자.
    for (const el of scope.querySelectorAll(".source61-structure-table, .source62-overlap-relation")) { el.remove(); changed += 1; }
    // '도움말:' 같은 이름표가 붙은 문장은 문장 끝(마침표)까지 지웁니다.
    changed += removeMatches(scope, new RegExp(`\\s*${LABEL.source}(?:[^.?!]|(?<=\\d)\\.(?=\\d))*[.?!]?`));
    // 문장 첫머리의 '먼저 …하세요.' 안내 문장.
    changed += removeMatches(scope, /(?:^|(?<=[.?!\n]\s*))[ \t]*먼저\s(?:[^.?!\n]|(?<=\d)\.(?=\d))*?세요\./);
    // 답을 구한 뒤 다시 확인하라는 어려움 난이도의 확인 안내.
    changed += removeMatches(scope, /(?:^|(?<=[.?!\n]\s*))[ \t]*(?:답을 구한 뒤|구한 값을 처음 조건에|구한 관계식이)(?:[^.?!\n]|(?<=\d)\.(?=\d))*?세요\./);
    for (const pattern of patternsFor(typeId)) changed += removeMatches(scope, pattern);
    // 그림(SVG) 안에 글자로 적힌 힌트·중간 결과 이름표도 지웁니다.
    const patterns = patternsFor(typeId);
    if (patterns.length) for (const label of [...scope.querySelectorAll("svg text")]) {
      const text = label.textContent.replace(/\s+/g, " ").trim();
      if (text && patterns.some(pattern => pattern.test(text))) { label.remove(); changed += 1; }
    }
    // 6학년 조건 정리 상자: 문제 문장·그림에 이미 있는 내용만 되풀이하면 지웁니다.
    for (const board of [...scope.querySelectorAll("div[class]")]) {
      if (![...board.classList].some(name => BOARD_CLASS.test(name)) || !scope.contains(board)) continue;
      const inside = textOf(board).match(TOKEN) || [];
      const parent = board.parentNode, next = board.nextSibling;
      board.remove();
      const outside = new Set(textOf(scope).match(TOKEN) || []);
      if (BOARD_DROP.has(typeId) || inside.every(token => outside.has(token))) changed += 1;
      else parent.insertBefore(board, next);
    }
    if (!changed) return prompt;
    dropEmpty(scope, hadText);
    const holder = document.createElement("div");
    holder.append(scope);
    return holder.innerHTML;
  }

  const previous = api.generate.bind(api);
  api.generate = function (type, rank, difficulty, seed, variant) {
    const question = previous(type, rank, difficulty, seed, variant);
    if (!question || typeof question.prompt !== "string") return question;
    const id = type && type.id;
    const prompt = clean(question.prompt, id, Number(difficulty) || 0);
    return prompt === question.prompt ? question : Object.assign({}, question, { prompt, problemHintPolicy: "20261123" });
  };
  api.cleanProblemHints = clean;
  Object.defineProperty(api, "__problemHintPolicy20261123", { value: true });
})(typeof window !== "undefined" ? window : globalThis);
