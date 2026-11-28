// 2026-11-28: 숫자 바로 뒤 조사(을/를, 이/가, 은/는, 과/와, 으로/로)를 숫자 읽기에 맞춘다.
// 4·5학년 손글씨 대조에서 "6를", "4이 남는", "3와 7", "10로"처럼 생성기마다 조사가 어긋난 곳이 287개 유형에서 나왔다.
// 문항 생성기를 하나하나 고치는 대신, 모든 플러그인이 설치된 뒤(app.js 바로 앞) generate 결과의 글자 필드에 한 번 적용한다.
// - 숫자 읽기의 끝소리: 0(영·십·백·천·만…)·1(일)·3(삼)·6(육)·7(칠)·8(팔)은 받침이 있고, 1·7·8은 ㄹ 받침이라 '로'를 쓴다.
// - 분수는 분자를 마지막에 읽으므로(4분의 3) 분자의 끝 숫자를 본다: 글자 "3/4", 대분수 "1 3/4", 분수 표기 span 모두.
// - 조사 뒤가 띄어쓰기·문장부호·태그·끝일 때만 바꾼다("2가지", "1이다", "3이상" 같은 낱말은 건드리지 않는다).
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HSE_NUMBER_JOSA = api;
  api.install(root);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const PAIRS = { "을": "을/를", "를": "을/를", "이": "이/가", "가": "이/가", "은": "은/는", "는": "은/는", "과": "과/와", "와": "과/와", "으로": "으로/로", "로": "으로/로" };
  const hasBatchim = digit => /[013678]/.test(digit);
  const hasRieul = digit => /[178]/.test(digit);
  function particleFor(digit, particle) {
    const kind = PAIRS[particle];
    const batchim = hasBatchim(digit);
    if (kind === "을/를") return batchim ? "을" : "를";
    if (kind === "이/가") return batchim ? "이" : "가";
    if (kind === "은/는") return batchim ? "은" : "는";
    if (kind === "과/와") return batchim ? "과" : "와";
    return batchim && !hasRieul(digit) ? "으로" : "로";
  }
  const PARTICLE = "(으로|로|을|를|이|가|은|는|과|와)(?=[\\s,.;:!?)\\]}·”’\"'<]|$)";
  // ① 분수 표기 span(대분수 포함) 바로 뒤: 분자 끝 숫자로 고른다.
  const FRACTION_SPAN = new RegExp(`(<span class="math-fraction"[^>]*><span>[^<]*?(\\d)</span><span>[^<]*</span></span>(?:</span>)?)${PARTICLE}`, "g");
  // ② 글자 분수 a/b 바로 뒤: 분자 끝 숫자.
  const TEXT_FRACTION = new RegExp(`((\\d)/\\d+)${PARTICLE}`, "g");
  // ③ 그 밖의 숫자(닫는 태그가 끼어 있어도) 바로 뒤.
  const PLAIN = new RegExp(`(\\d)((?:</[a-z]+>)*)${PARTICLE}`, "g");
  function fixText(value) {
    if (typeof value !== "string" || !/\d/.test(value)) return value;
    let text = value.replace(FRACTION_SPAN, (all, head, digit, particle) => head + particleFor(digit, particle));
    text = text.replace(TEXT_FRACTION, (all, head, digit, particle) => head + particleFor(digit, particle));
    text = text.replace(PLAIN, (all, digit, tags, particle, offset, whole) => {
      const before = whole.slice(Math.max(0, offset - 60), offset);
      // 분수의 분모 자리(이미 ①·②에서 처리)나 글자 분수의 분모는 건너뛴다.
      if (/<span>[^<]*<\/span><span>\d*$/.test(before) || /\d\/\d*$/.test(before)) return all;
      // 영문 단위·기호 바로 뒤 숫자(예: A1, x2)는 읽기가 달라질 수 있어 건너뛴다.
      if (/[A-Za-z]\d*$/.test(before)) return all;
      return digit + tags + particleFor(digit, particle);
    });
    // ④ 숫자 + 이었/였(…습니다): 받침이 있으면 '이었', 없으면 '였'(예: 62였습니다, 30이었습니다).
    text = text.replace(/(\d)((?:<\/[a-z]+>)*)(이었|였)(?=[가-힣])/g, (all, digit, tags, copula, offset, whole) => {
      const before = whole.slice(Math.max(0, offset - 60), offset);
      if (/<span>[^<]*<\/span><span>\d*$/.test(before) || /\d\/\d*$/.test(before) || /[A-Za-z]\d*$/.test(before)) return all;
      return digit + tags + (hasBatchim(digit) ? "이었" : "였");
    });
    return text;
  }
  const FIELDS = ["prompt", "solution", "answer", "answerVisual", "answerHtml", "answerAssumption", "promptText", "solutionText", "solutionSummary", "explanation"];
  function fixQuestion(question) {
    if (!question || typeof question !== "object") return question;
    const changes = {};
    for (const field of FIELDS) {
      if (typeof question[field] !== "string") continue;
      const fixed = fixText(question[field]);
      if (fixed !== question[field]) changes[field] = fixed;
    }
    if (!Object.keys(changes).length) return question;
    // 얼려 둔(바꿀 수 없는) 문항 객체를 돌려주는 생성기가 있으므로 원본은 건드리지 않고 사본에 바꾼다.
    const descriptors = Object.getOwnPropertyDescriptors(question);
    for (const [field, value] of Object.entries(changes)) {
      const descriptor = descriptors[field];
      descriptors[field] = descriptor && !("get" in descriptor) ? { ...descriptor, value } : { value, writable: true, enumerable: true, configurable: true };
    }
    const copy = Object.create(Object.getPrototypeOf(question), descriptors);
    return Object.isFrozen(question) ? Object.freeze(copy) : copy;
  }
  function install(target) {
    const generators = target && target.HSE_GENERATORS;
    if (!generators || typeof generators.generate !== "function") return false;
    if (generators.__numberJosaInstalled) return true;
    const previous = generators.generate.bind(generators);
    generators.generate = (...args) => fixQuestion(previous(...args));
    Object.defineProperty(generators, "__numberJosaInstalled", { value: true });
    // 감사용: 조사 보정 전 원래 결과를 비교할 수 있게 남긴다.
    Object.defineProperty(generators, "generateBeforeNumberJosa", { value: previous });
    return true;
  }
  return Object.freeze({ fixText, fixQuestion, particleFor, install });
});
