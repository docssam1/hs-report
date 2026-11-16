(() => {
  const compactUnits = {
    "㎢": "km²",
    "㎡": "m²",
    "㎠": "cm²",
    "㎟": "mm²",
    "㎦": "km³",
    "㎥": "m³",
    "㎤": "cm³",
    "㎣": "mm³"
  };
  const fractionToken = "(?:\\([^()\\n]{1,80}\\)|\\{[^{}\\n]{1,80}\\}|\\d+|□|[A-Za-z가-힣])";
  const notationPattern = new RegExp(`(${fractionToken})\\s*\\/\\s*(${fractionToken})|((?:km|cm|mm|m)(?:\\^?([23])|([²³])))`, "g");
  const normalizeMathText = value => String(value).replace(/[㎢㎡㎠㎟㎦㎥㎤㎣]/g, character => compactUnits[character]);
  const unwrapFractionTerm = value => (/^[({].*[)}]$/.test(value) ? value.slice(1, -1) : value);

  function isJoinedIdentifier(text, match) {
    const previous = text[match.index - 1] || "";
    const suffix = text.slice(match.index + match[0].length);
    if (/^(?:km|cm|mm|m)\s*\/\s*(?:s|h|min)$/.test(match[0])) return true;
    if (previous === "/" || suffix.startsWith("/")) return true;
    if (/[A-Za-z0-9_]/.test(previous)) return true;
    if (!/^[A-Za-z0-9_]/.test(suffix)) return false;
    return !/^(?:km|cm|mm|m|kg|g|L)(?![A-Za-z0-9_])/.test(suffix);
  }

  function tokenize(source, depth = 0) {
    const text = normalizeMathText(source);
    const matches = [...text.matchAll(notationPattern)].filter(match => {
      if (!match[1]) return true;
      if (depth >= 3 || Number(match[2]) === 0) return false;
      return !isJoinedIdentifier(text, match);
    });
    if (!matches.length) return [{ type: "text", value: text }];

    const tokens = [];
    let cursor = 0;
    matches.forEach(match => {
      if (match.index > cursor) tokens.push({ type: "text", value: text.slice(cursor, match.index) });
      if (match[1]) {
        tokens.push({
          type: "fraction",
          numerator: tokenize(unwrapFractionTerm(match[1]), depth + 1),
          denominator: tokenize(unwrapFractionTerm(match[2]), depth + 1)
        });
      } else {
        tokens.push({
          type: "power",
          base: match[3].replace(/(?:\^?[23]|[²³])$/, ""),
          power: match[4] || (match[5] === "²" ? "2" : "3")
        });
      }
      cursor = match.index + match[0].length;
    });
    if (cursor < text.length) tokens.push({ type: "text", value: text.slice(cursor) });
    if (depth) return tokens;
    const combined = [];
    tokens.forEach(token => {
      const previous = combined[combined.length - 1];
      if (token.type === "fraction" && previous?.type === "text") {
        const whole = previous.value.match(/(\d+)\s+$/);
        if (whole) {
          previous.value = previous.value.slice(0, whole.index);
          if (!previous.value) combined.pop();
          combined.push({ type: "mixed", whole: whole[1], fraction: token });
          return;
        }
      }
      combined.push(token);
    });
    return combined;
  }

  function spokenText(tokens) {
    return tokens.map(token => {
      if (token.type === "text") return token.value;
      if (token.type === "power") return `${token.base} ${token.power === "2" ? "제곱" : "세제곱"}`;
      if (token.type === "mixed") return mixedAria(token);
      return fractionAria(token);
    }).join("").replace(/\s+/g, " ").trim();
  }

  function fractionAria(token) {
    const numerator = spokenText(token.numerator);
    const denominator = spokenText(token.denominator);
    const nested = [...token.numerator, ...token.denominator].some(part => part.type === "fraction");
    return nested ? `분자는 ${numerator}, 분모는 ${denominator}인 분수` : `${denominator}분의 ${numerator}`;
  }

  function mixedAria(token) {
    return `${token.whole}와 ${fractionAria(token.fraction)}`;
  }

  window.HSE_MATH_NOTATION = { fractionAria, mixedAria, normalizeMathText, spokenText, tokenize };
})();
