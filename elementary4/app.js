(() => {
  const curriculum = window.HSE_CURRICULUM;
  const generatorApi = window.HSE_GENERATORS;
  const mathNotation = window.HSE_MATH_NOTATION;
  const identityApi = window.HSE_IDENTITY;
  const bankAccess = window.HSE_BANK_ACCESS;
  if (!curriculum || !generatorApi || !mathNotation || !identityApi || !bankAccess) throw new Error("초등 문제은행 데이터를 불러오지 못했습니다.");

  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const hash = (value) => [...value].reduce((sum, character) => Math.imul(sum ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const typeDisplayName = type => type.label && type.label !== "핵심 유형" ? type.label : type.name;
  const difficultyBandLabel = type => curriculum.showBand === false ? "" : ({ "-1": "심화 쉬움", "0": "심화 기준", "1": "심화 어려움" })[String(type.difficultyBand)] || "심화 기준";

  function renderMathNotation(markup) {
    const template = document.createElement("template");
    template.innerHTML = String(markup ?? "");
    function appendMathTokens(target, tokens) {
      tokens.forEach(token => {
        if (token.type === "text") {
          target.append(token.value);
        } else if (token.type === "fraction") {
          const fraction = document.createElement("span");
          fraction.className = "math-fraction";
          fraction.setAttribute("role", "img");
          fraction.setAttribute("aria-label", mathNotation.fractionAria(token));
          const numerator = document.createElement("span");
          const denominator = document.createElement("span");
          appendMathTokens(numerator, token.numerator);
          appendMathTokens(denominator, token.denominator);
          fraction.append(numerator, denominator);
          target.append(fraction);
        } else if (token.type === "mixed") {
          const mixed = document.createElement("span");
          mixed.className = "math-mixed-number";
          mixed.setAttribute("role", "img");
          mixed.setAttribute("aria-label", mathNotation.mixedAria(token));
          const whole = document.createElement("span");
          whole.textContent = token.whole;
          mixed.append(whole);
          appendMathTokens(mixed, [token.fraction]);
          target.append(mixed);
        } else {
          const unit = document.createElement("span");
          unit.className = "math-unit";
          unit.setAttribute("aria-label", `${token.base} ${token.power === "2" ? "제곱" : "세제곱"}`);
          unit.append(token.base);
          const power = document.createElement("sup");
          power.textContent = token.power;
          unit.append(power);
          target.append(unit);
        }
      });
    }

    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      const parent = node.parentElement;
      if (parent?.closest("svg, script, style, code, .math-fraction, .math-unit, [data-math-raw]")) return;
      const tokens = mathNotation.tokenize(node.nodeValue);
      if (tokens.length === 1 && tokens[0].type === "text" && tokens[0].value === node.nodeValue) return;
      const fragment = document.createDocumentFragment();
      appendMathTokens(fragment, tokens);
      node.replaceWith(fragment);
    });

    template.content.querySelectorAll("svg text").forEach(text => {
      if (text.children.length) return;
      const normalized = mathNotation.normalizeMathText(text.textContent).replace(/(km|cm|mm|m)\^([23])/g, "$1$2");
      const matches = [...normalized.matchAll(/(km|cm|mm|m)([²³]|[23])(?!\d)/g)];
      if (!matches.length) return;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      matches.forEach(match => {
        fragment.append(normalized.slice(cursor, match.index), match[1]);
        const power = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        power.setAttribute("baseline-shift", "super");
        power.setAttribute("font-size", "70%");
        power.textContent = match[2] === "²" || match[2] === "2" ? "2" : "3";
        fragment.append(power);
        cursor = match.index + match[0].length;
      });
      fragment.append(normalized.slice(cursor));
      text.replaceChildren(fragment);
    });
    return template.innerHTML;
  }

  const types = curriculum.semesters.flatMap(semester => semester.units.flatMap(unit => unit.subunits.flatMap(subunit => subunit.types.map(type => ({
    ...type,
    semesterId: semester.id,
    semesterLabel: semester.label,
    grade: semester.grade,
    term: semester.term,
    unitId: unit.id,
    unitNumber: unit.number,
    unitName: unit.name,
    subunitId: subunit.id,
    subunitNumber: subunit.number,
    subunitName: subunit.name,
    generator: generatorApi.generatorKey({ ...type, semesterId: semester.id, unitId: unit.id, unitName: unit.name })
  })))));
  const typeById = new Map(types.map(type => [type.id, type]));
  function sourceQuestionType(type) {
    if (type?.sourceRelationship !== "same-source-compound-skill") return type;
    const owner = typeById.get(type.commonPublicTypeId);
    return owner && owner !== type && owner.sourceRelationship === "same-source-compound-owner"
      && owner.rawSourceItemId && owner.rawSourceItemId === type.rawSourceItemId ? owner : null;
  }
  // 같은 원문 한 문제를 나눈 유형(6-2-u3-e4-mission-3-1·3-2)은 선택 상태를 원문 유형 하나로 본다.
  function isTypeSelected(type) {
    const target = sourceQuestionType(type);
    return Boolean(target) && state.selected.has(target.id);
  }
  function selectedQuestionTypes() {
    return [...new Map([...state.selected].map(id => sourceQuestionType(typeById.get(id))).filter(Boolean).map(type => [type.id, type])).values()];
  }
  function commonQuestionType(type) {
    return type.sourceRelationship === "same-source-compound-skill"
      ? sourceQuestionType(type) : type.commonPublicTypeId && typeById.get(type.commonPublicTypeId);
  }
  let previewPopover = null;
  let previewAnchor = null;

  const state = {
    grade: 4,
    term: 1,
    level: "simwha",
    unitId: "",
    search: "",
    difficulty: 0,
    // 2026-11-25: 여러 학년·학기를 함께 고르고(extraSemesters), 여러 난이도를 섞어 낼 수 있게 한다(mixDifficulty·difficulties).
    extraSemesters: new Set(),
    mixDifficulty: false,
    difficulties: new Set([0]),
    selected: new Set(),
    collapsedUnits: new Set(),
    count: 12,
    questions: [],
    view: "problem",
    solutionViewerIndex: 0,
    generation: 0
  };
  let solutionViewerReturnFocus = null;
  let activePrintMode = null;

  function currentLevel() {
    return curriculum.levels.find(level => level.id === state.level) || curriculum.levels[0];
  }

  function currentSemester() {
    return curriculum.semesters.find(item => item.grade === state.grade && item.term === state.term);
  }

  const difficultyLabel = value => { const labels = curriculum.difficultyLabels || { "-1": "심화 쉬움", "0": "심화 기준", "1": "심화 어려움" }; return labels[String(value)] || labels["0"]; };
  function currentDifficultyLabel() {
    return difficultyLabel(state.difficulty);
  }
  function difficultyList() {
    return state.mixDifficulty ? [-1, 0, 1].filter(value => state.difficulties.has(value)) : [state.difficulty];
  }
  function worksheetDifficultyLabel() {
    const list = difficultyList();
    return list.length > 1 ? `${list.map(value => difficultyLabel(value).replace("심화 ", "")).join("·")} 섞음` : difficultyLabel(list[0]);
  }
  const semesterKey = (grade, term) => `${grade}-${term}`;
  function shownSemesters() {
    const primary = currentSemester();
    const extras = curriculum.semesters.filter(item => item !== primary && state.extraSemesters.has(semesterKey(item.grade, item.term)) && bankAccess.canAccess(item.grade, item.term));
    return [primary, ...extras].filter(Boolean).sort((left, right) => left.grade - right.grade || left.term - right.term);
  }
  function isReadyType(type) {
    return Boolean(type?.generator) && !type.reviewLocked && bankAccess.canAccess(type.grade, type.term);
  }

  function visibleTypes() {
    const search = state.search.trim().toLocaleLowerCase("ko");
    return types.filter(type => {
      const primary = type.grade === state.grade && type.term === state.term;
      if (!primary && !state.extraSemesters.has(semesterKey(type.grade, type.term))) return false;
      if (!primary && !bankAccess.canAccess(type.grade, type.term)) return false;
      if (primary && state.unitId && type.unitId !== state.unitId) return false;
      if (search && !`${typeDisplayName(type)} ${type.sourceItemLabel || ""} ${type.name} ${type.subunitName} ${type.unitName}`.toLocaleLowerCase("ko").includes(search)) return false;
      return true;
    });
  }

  function refreshSegments(containerId, key, value) {
    $(containerId).querySelectorAll("button").forEach(button => {
      const active = String(button.dataset[key]) === String(value);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderUnitOptions() {
    const semester = currentSemester();
    const units = semester?.units || [];
    if (!units.some(unit => unit.id === state.unitId)) state.unitId = "";
    $("unitFilter").innerHTML = `<option value="">전체 대단원</option>${units.map(unit => `<option value="${unit.id}" ${unit.id === state.unitId ? "selected" : ""}>${unit.number}. ${escapeHtml(unit.name)}</option>`).join("")}`;
  }

  function availableAlternative(type) {
    const alternative = type.reviewLocked && type.alternativeTypeId && typeById.get(type.alternativeTypeId);
    return alternative?.generator && !alternative.reviewLocked &&
      alternative.semesterId === type.semesterId && alternative.unitId === type.unitId ? alternative : null;
  }

  function typeTreeRow(type) {
    const ready = Boolean(type.generator) && !type.reviewLocked;
    const commonType = commonQuestionType(type);
    const linked = !ready && Boolean(commonType?.generator && !commonType.reviewLocked);
    const selected = isTypeSelected(type);
    const number = String(type.typeNumber || type.number).padStart(2, "0");
    const sourceLabel = type.creativePractice ? "창작 연습 · " : type.sourceItemLabel ? "원문 " + escapeHtml(type.sourceItemLabel) + " · " : "";
    const alternativeHint = !ready && !linked && availableAlternative(type) ? '<span class="tree-alternative-hint">유사문항 있음 · 눌러서 선택</span>' : '';
    return '<div class="tree-type ' + (selected ? "is-selected" : "") + (ready || linked ? "" : " is-pending") + (alternativeHint ? " has-alternative" : "") + '" data-preview-type-id="' + type.id + '" role="button" tabindex="0" aria-label="' + escapeHtml(typeDisplayName(type)) + (alternativeHint ? ' 유사문항 있음' : '') + ' 유형 예시 미리보기" aria-controls="typePreviewPopover" aria-expanded="false">' +
      '<input type="checkbox" data-type-id="' + type.id + '" ' + (selected ? "checked" : "") + (ready ? "" : " disabled") + '>' +
      '<span class="tree-type-number">' + number + '</span>' +
      '<span class="tree-type-copy"><strong>' + escapeHtml(typeDisplayName(type)) + '</strong><small>' + (type.rowNote ? escapeHtml(type.rowNote) + '</small></span>' : sourceLabel + type.grade + '학년 ' + type.term + '학기 · <i class="difficulty-band difficulty-band-' + type.difficultyBand + '">' + difficultyBandLabel(type) + '</i>' + (linked ? ' · 공통 유형 연결' : '') + alternativeHint + '</small></span>') +
      '<span class="tree-type-preview-action" aria-hidden="true">미리보기</span>' +
      '<span class="tree-type-state ' + (ready || linked ? "is-ready" : "") + '">' + (ready ? "생성 가능" : linked ? "공통 유형" : "검수 대기") + '</span>' +
    '</div>';
  }

  // 학기·단원·소단원 묶음 체크박스: 묶음 안 생성 가능한 유형이 모두 선택되면 체크, 일부면 중간 표시.
  function groupCheckbox(scope, id, groupTypes, label) {
    const ready = groupTypes.filter(isReadyType);
    if (!ready.length) return "";
    const count = ready.filter(isTypeSelected).length;
    return '<input type="checkbox" class="tree-group-check" data-select-scope="' + scope + '" data-select-id="' + id + '" aria-label="' + escapeHtml(label) + ' 전체 선택"' + (count === ready.length ? " checked" : "") + (count > 0 && count < ready.length ? ' data-indeterminate="true"' : "") + '>';
  }
  function renderSemesterPicker() {
    const pairs = bankAccess.allowedPairs();
    $("semesterPicker").innerHTML = curriculum.semesters.filter(item => pairs.some(pair => pair.grade === item.grade && pair.term === item.term)).map(item => {
      const key = semesterKey(item.grade, item.term);
      const primary = item.grade === state.grade && item.term === state.term;
      const active = primary || state.extraSemesters.has(key);
      return '<button type="button" class="semester-chip' + (active ? " is-active" : "") + (primary ? " is-primary" : "") + '" data-semester-key="' + key + '" aria-pressed="' + active + '"' + (primary ? ' disabled title="지금 보고 있는 학기"' : "") + '>' + item.grade + '-' + item.term + '</button>';
    }).join("");
  }
  function renderCatalog() {
    hideTypePreview(true);
    renderSemesterPicker();
    const visible = visibleTypes();
    const semesters = shownSemesters();
    const multiple = semesters.length > 1;
    const unitMarkup = unit => {
      const unitTypes = visible.filter(type => type.unitId === unit.id);
      if (!unitTypes.length) return "";
      /* 닫힌 채로 시작하는 문제은행에서도, 검색하는 동안에는 찾은 유형이 바로 보이게 펼친다 */
      const isOpen = !state.collapsedUnits.has(unit.id) || Boolean(curriculum.startCollapsed && state.search.trim());
      const readyCount = new Set(unitTypes.flatMap(type => {
        if (type.generator && !type.reviewLocked) return [(sourceQuestionType(type) || type).id];
        const commonType = commonQuestionType(type);
        return commonType?.generator && !commonType.reviewLocked ? [commonType.id] : [];
      })).size;
      return '<section class="tree-unit ' + (isOpen ? "is-open" : "") + '">' +
        '<div class="tree-unit-row">' + groupCheckbox("unit", unit.id, unitTypes, unit.name) +
        '<button class="tree-unit-toggle" type="button" data-tree-unit="' + unit.id + '" aria-expanded="' + isOpen + '">' +
          '<span class="tree-chevron" aria-hidden="true">›</span><span class="tree-unit-number">' + unit.number + '</span>' +
          '<span class="tree-unit-copy"><strong>' + escapeHtml(unit.name) + '</strong><small>' + readyCount + '개 유형 생성 가능</small></span>' +
        '</button></div>' +
        '<div class="tree-branch" ' + (isOpen ? "" : "hidden") + '>' + (unit.subunits || []).map(subunit => {
          const subunitTypes = unitTypes.filter(type => type.subunitId === subunit.id);
          if (!subunitTypes.length) return "";
          return '<section class="tree-subunit"><div class="tree-subunit-head">' + groupCheckbox("subunit", subunit.id, subunitTypes, subunit.name) + '<span>' + (curriculum.subunitCaption || '소단원') + ' ' + String(subunit.number).padStart(2, "0") + '</span><strong>' + escapeHtml(subunit.name) + '</strong></div>' + subunitTypes.map(typeTreeRow).join("") + '</section>';
        }).join("") + '</div>' +
      '</section>';
    };
    const markup = semesters.map(semester => {
      const units = (semester.units || []).map(unitMarkup).join("");
      if (!multiple) return units;
      const semesterTypes = visible.filter(type => type.grade === semester.grade && type.term === semester.term);
      if (!semesterTypes.length) return "";
      return '<section class="tree-semester" data-tree-semester="' + semester.id + '"><div class="tree-semester-head">' + groupCheckbox("semester", semester.id, semesterTypes, semester.label) + '<strong>' + escapeHtml(semester.label) + '</strong></div>' + units + '</section>';
    }).join("");
    $("typeList").innerHTML = markup;
    $("typeList").querySelectorAll("input[data-indeterminate]").forEach(input => { input.indeterminate = true; });
    $("catalogEmpty").hidden = visible.length > 0;
    renderSummary();
  }

  function ensurePreviewPopover() {
    if (previewPopover) return previewPopover;
    previewPopover = document.createElement("aside");
    previewPopover.id = "typePreviewPopover";
    previewPopover.className = "type-preview-popover";
    previewPopover.setAttribute("role", "region");
    previewPopover.setAttribute("aria-label", "선택한 유형 예시 미리보기");
    previewPopover.setAttribute("aria-live", "polite");
    previewPopover.hidden = true;
    previewPopover.addEventListener("click", event => {
      const alternativeButton = event.target.closest("button[data-select-alternative-type]");
      if (alternativeButton) {
        const alternative = typeById.get(alternativeButton.dataset.selectAlternativeType);
        const original = typeById.get(previewAnchor?.dataset.previewTypeId);
        if (original?.reviewLocked && original.alternativeTypeId === alternative?.id &&
            alternative.semesterId === original.semesterId && alternative.unitId === original.unitId &&
            alternative.generator && !alternative.reviewLocked) {
          state.selected.add(alternative.id);
          hideTypePreview(true);
          renderCatalog();
        }
        return;
      }
      const commonButton = event.target.closest("button[data-select-common-type]");
      if (commonButton) {
        const commonType = typeById.get(commonButton.dataset.selectCommonType);
        if (commonType?.generator && !commonType.reviewLocked) {
          state.selected.add(commonType.id);
          renderCatalog();
        }
        return;
      }
      if (!event.target.closest("[data-close-type-preview]")) return;
      const anchor = previewAnchor;
      hideTypePreview(true);
      anchor?.focus();
    });
    document.querySelector(".selection-metrics").insertAdjacentElement("beforebegin", previewPopover);
    return previewPopover;
  }

  function placeTypePreview(anchor, popover) {
    if (matchMedia("(max-width: 700px)").matches) {
      anchor.insertAdjacentElement("afterend", popover);
      return;
    }
    document.querySelector(".selection-metrics").insertAdjacentElement("beforebegin", popover);
  }

  function showTypePreview(typeId, anchor) {
    if (previewAnchor === anchor && previewPopover && !previewPopover.hidden) {
      hideTypePreview(true);
      return;
    }
    const type = typeById.get(typeId);
    if (!type) return;
    const popover = ensurePreviewPopover();
    if (previewAnchor) {
      previewAnchor.classList.remove("is-previewing");
      previewAnchor.setAttribute("aria-expanded", "false");
    }
    previewAnchor = anchor;
    previewAnchor.classList.add("is-previewing");
    previewAnchor.setAttribute("aria-expanded", "true");
    const sourcePage = type.sourcePrintedPage !== undefined && type.sourcePrintedPage !== null && type.sourcePrintedPage !== ""
      ? ` · 교재 ${escapeHtml(type.sourcePrintedPage)}쪽`
      : "";
    const source = type.creativePractice
      ? "창작 연습 · 원본 교재 문항이 아니며 독립 검산을 거쳤습니다"
      : type.sourceItemLabel
      ? `원문 ${escapeHtml(type.sourceItemLabel)}${sourcePage}`
      : `${type.grade}학년 ${type.term}학기 분류`;
    const sourceLine = type.sourceRelationship === "downstream-number-corrected-adaptation"
      ? `<div class="type-preview-source"><b>조건 보정 유사문항</b><small>원문 ${escapeHtml(type.sourceItemLabel)}의 풀이 구조 · 하류 방향 명시, 물살 수치 보정</small></div>`
      : `<div class="type-preview-source"><b>유형 예시</b><small>대표 문제 · ${source}</small></div>`;
    const header = title => `<header><div>${title}</div><button type="button" class="type-preview-close" data-close-type-preview aria-label="미리보기 닫기">×</button></header>`;
    const commonType = commonQuestionType(type);
    if (commonType?.generator && !commonType.reviewLocked) {
      const generated = generatorApi.generate(commonType, currentLevel().rank, state.difficulty, hash(`preview:${commonType.id}`), type.commonPublicVariant ?? (commonType.generationMode === "fixed-verified-pool" ? 0 : commonType.variant ?? 0));
      if (!generated) return;
      const compound = type.sourceRelationship === "same-source-compound-skill" && sourceQuestionType(type) === commonType;
      const commonSourceLine = `<div class="type-preview-source"><b>공통 유형 예시</b><small>${source} · ${compound ? "단면 그리기와 개수 구하기가 한 문제에 포함됩니다." : `${escapeHtml(commonType.sourceItemLabel || "공통 유형")}과 같은 풀이 방법`}</small></div>`;
      popover.innerHTML = `${header(`<span>${type.grade}학년 ${type.term}학기 · ${escapeHtml(type.unitName)}</span><strong>${escapeHtml(typeDisplayName(type))}</strong>`)}${commonSourceLine}<div class="type-preview-question">${renderMathNotation(generated.prompt)}</div><footer class="type-preview-common-action"><span>${compound ? "같은 원문의 전체 문항으로 연결됩니다." : "같은 탐구의 양초 예제와 풀이가 같습니다."}</span><button type="button" data-select-common-type="${escapeHtml(commonType.id)}">공통 유형 선택</button></footer>`;
    } else if (!type.generator || type.reviewLocked) {
      const reviewReason = type.reviewReason || "원문 구조와 정답을 더 확인해야 합니다.";
      const alternative = availableAlternative(type);
      const canOfferAlternative = Boolean(alternative);
      const alternativeAction = canOfferAlternative ? `<footer class="type-preview-common-action"><span>선택 가능: ${escapeHtml(typeDisplayName(alternative))}</span><button type="button" data-select-alternative-type="${escapeHtml(alternative.id)}">유사문항 선택</button></footer>` : "";
      const notice = canOfferAlternative ? "이 유형은 준비 중입니다. 검증된 유사문항을 선택할 수 있습니다." : `검수 대기 · ${reviewReason}`;
      popover.innerHTML = `${header(`<span>${type.grade}학년 ${type.term}학기 · ${escapeHtml(type.unitName)}</span><strong>${escapeHtml(typeDisplayName(type))}</strong>`)}${sourceLine}<footer class="${canOfferAlternative ? 'type-preview-alternative-notice' : ''}">${escapeHtml(notice)}</footer>${alternativeAction}`;
    } else {
      const generated = generatorApi.generate(type, currentLevel().rank, state.difficulty, hash(`preview:${type.id}`), type.generationMode === "fixed-verified-pool" ? 0 : type.variant ?? 0);
      if (!generated) return;
      popover.innerHTML = `${header(`<span>${type.grade}학년 ${type.term}학기 · ${escapeHtml(type.unitName)} · ${difficultyBandLabel(type)}</span><strong>${escapeHtml(typeDisplayName(type))}</strong>`)}${sourceLine}<div class="type-preview-question">${renderMathNotation(generated.prompt)}</div><footer>${escapeHtml(currentDifficultyLabel())} · 고정된 유형 예시</footer>`;
    }
    placeTypePreview(anchor, popover);
    popover.hidden = false;
    document.body.classList.add("is-type-preview-open");
  }

  function hideTypePreview() {
    if (previewPopover) previewPopover.hidden = true;
    if (previewAnchor) {
      previewAnchor.classList.remove("is-previewing");
      previewAnchor.setAttribute("aria-expanded", "false");
    }
    previewAnchor = null;
    document.body.classList.remove("is-type-preview-open");
  }

  function distinctQuestionPools(selected) {
    const pools = new Map();
    for (const type of selected.map(sourceQuestionType).filter(type => type?.generator && !type.reviewLocked)) {
      const identity = type.generationMode === "fixed-verified-pool" && type.sourceItemId
        ? JSON.stringify([type.semesterId, type.sourceItemId, type.generator])
        : JSON.stringify([type.id]);
      const existing = pools.get(identity);
      if (!existing || Number(type.verifiedVariantCount) > Number(existing.verifiedVariantCount)) pools.set(identity, type);
    }
    return [...pools.values()];
  }

  function plannedQuestionTypes(selected, requestedCount = state.count) {
    const pooled = distinctQuestionPools(selected);
    // 2026-11-25: 여러 학기·단원을 고르면 학기마다, 학기 안에서는 단원마다 돌아가며 뽑아
    // 문항 수가 유형 수보다 적어도 고른 학기·단원이 고르게 나오게 한다(단원 id는 학기마다 겹치므로 학기와 함께 묶는다).
    const roundRobin = queues => {
      const out = [];
      for (let round = 0; queues.some(queue => queue.length > round); round += 1) for (const queue of queues) if (round < queue.length) out.push(queue[round]);
      return out;
    };
    const groupBy = (list, key) => [...list.reduce((map, item) => map.set(key(item), [...(map.get(key(item)) || []), item]), new Map()).values()];
    const unitCount = new Set(pooled.map(type => `${type.semesterId}|${type.unitId}`)).size;
    // 문항 수가 고른 유형 수보다 적어 일부 단원이 빠질 때만 번갈아 뽑는다(그 밖에는 예전 순서 그대로).
    const multiUnit = unitCount > 1 && requestedCount < pooled.length;
    const ready = multiUnit
      ? roundRobin(groupBy(pooled, type => type.semesterId).map(semesterTypes => roundRobin(groupBy(semesterTypes, type => type.unitId))))
      : pooled;
    const remaining = new Map(ready.map(type => [
      type.id,
      type.generationMode === "fixed-verified-pool"
        ? Math.max(0, Number(type.verifiedVariantCount) || 0) * difficultyList().length
        : Infinity
    ]));
    const planned = [];
    while (planned.length < requestedCount) {
      let added = false;
      for (const type of ready) {
        if (planned.length >= requestedCount) break;
        const count = remaining.get(type.id);
        if (count <= 0) continue;
        planned.push(type);
        if (Number.isFinite(count)) remaining.set(type.id, count - 1);
        added = true;
      }
      if (!added) break;
    }
    if (!multiUnit) return planned;
    // 문제지에는 교육과정 순서(학년·학기·단원·고른 순서)로 놓는다.
    const rank = new Map(pooled.map((type, index) => [type.id, index]));
    const semesterRank = type => type.grade * 10 + type.term;
    return planned.map((type, index) => ({ type, index })).sort((left, right) =>
      semesterRank(left.type) - semesterRank(right.type) || (left.type.unitNumber || 0) - (right.type.unitNumber || 0) || rank.get(left.type.id) - rank.get(right.type.id) || left.index - right.index
    ).map(entry => entry.type);
  }

  function renderSummary() {
    const selected = selectedQuestionTypes();
    const plannedCount = plannedQuestionTypes(selected).length;
    $("selectedTypeCount").textContent = selected.length;
    $("selectedQuestionCount").textContent = plannedCount;
    $("selectedTypeSummary").textContent = `${selected.length}개`;
    $("selectedQuestionSummary").textContent = `${plannedCount}문항`;
    const capacityNotice = $("selectionCapacityNotice");
    const isShort = selected.length > 0 && plannedCount < state.count;
    const hasSamePool = distinctQuestionPools(selected).length < selected.filter(type => type?.generator && !type.reviewLocked).length;
    capacityNotice.hidden = !isShort && !hasSamePool;
    capacityNotice.textContent = [
      hasSamePool ? "같은 원문으로 연결된 유형은 한 번만 출제합니다." : "",
      isShort ? `요청한 ${state.count}문항 중 ${plannedCount}문항을 만들 수 있습니다. 유형을 더 선택해 주세요.` : ""
    ].filter(Boolean).join(" ");
    $("generateButton").disabled = plannedCount === 0;
    $("selectedTypeList").innerHTML = selected.length ? selected.map(type =>
      '<div><span><b>' + escapeHtml(type.subunitName) + ' · ' + escapeHtml(typeDisplayName(type)) + '</b><small>' + type.grade + '학년 ' + type.term + '학기 · ' + type.unitNumber + '단원 ' + escapeHtml(type.unitName) + ' · ' + difficultyBandLabel(type) + (type.generationMode === "fixed-verified-pool" ? ' · 검증 문항 ' + type.verifiedVariantCount + '개' : '') + '</small></span>' +
      '<button type="button" data-remove-type="' + type.id + '" aria-label="' + escapeHtml(typeDisplayName(type)) + ' 선택 해제">×</button></div>'
    ).join("") : '<p>' + escapeHtml(curriculum.emptySelection || '왼쪽 교육과정 트리에서 유형을 선택하세요.') + '</p>';
  }

  function setQuestionCount(value) {
    state.count = Math.max(1, Math.min(150, Number.isFinite(value) ? Math.trunc(value) : 12));
    $("questionCountInput").value = String(state.count);
    if ($("questionCountRange")) $("questionCountRange").value = String(state.count);
    document.querySelectorAll("[data-count]").forEach(button => {
      button.classList.toggle("is-active", Number(button.dataset.count) === state.count);
    });
    renderSummary();
  }

  function updateApprovalButtons() {
    $("gradeFilter").querySelectorAll("button[data-grade]").forEach(button => {
      button.disabled = ![1, 2].some(term => bankAccess.canAccess(Number(button.dataset.grade), term));
    });
    $("termFilter").querySelectorAll("button[data-term]").forEach(button => {
      button.disabled = !bankAccess.canAccess(state.grade, Number(button.dataset.term));
    });
  }

  function bindSegment(containerId, dataKey, stateKey, transform = value => value) {
    $(containerId).addEventListener("click", event => {
      const button = event.target.closest(`button[data-${dataKey}]`);
      if (!button || button.disabled) return;
      const nextValue = transform(button.dataset[dataKey]);
      if ((stateKey === "grade" && ![1, 2].some(term => bankAccess.canAccess(nextValue, term)))
        || (stateKey === "term" && !bankAccess.canAccess(state.grade, nextValue))) return;
      state[stateKey] = nextValue;
      if (stateKey === "grade" && !bankAccess.canAccess(state.grade, state.term)) {
        state.term = bankAccess.allowedPairs().find(pair => pair.grade === state.grade)?.term ?? state.term;
        refreshSegments("termFilter", "term", state.term);
      }
      refreshSegments(containerId, dataKey, state[stateKey]);
      if (stateKey === "grade" || stateKey === "term") {
        updateApprovalButtons();
        state.unitId = "";
        renderUnitOptions();
        renderCatalog();
      } else if (stateKey === "level") {
        renderCatalog();
      }
    });
    updateApprovalButtons();
  }

  // 인쇄 명조(print-typography.css)는 인쇄 때만 쓰인다. 문제지를 처음 만들 때 한 번 받아 두어야 바로 인쇄·PDF로 저장해도
  // 글자가 빠지거나 대체 글꼴로 찍히지 않는다(목록만 보는 사용자는 받지 않는다).
  let printFontsLoading = null;
  function preloadPrintFonts() {
    if (!printFontsLoading) {
      try {
        printFontsLoading = document.fonts?.load
          ? Promise.all(["400", "600", "700"].map(weight => document.fonts.load(`${weight} 16px "HSE Print Serif"`, "가㉠1").catch(() => [])))
          : Promise.resolve();
      } catch (error) { printFontsLoading = Promise.resolve(); }
    }
    return printFontsLoading;
  }

  function buildQuestions() {
    preloadPrintFonts();
    const selected = selectedQuestionTypes().filter(type => type?.generator && !type.reviewLocked && bankAccess.canAccess(type.grade, type.term));
    if (!selected.length) return;
    const plannedTypes = plannedQuestionTypes(selected);
    if (!plannedTypes.length) return;
    state.generation += 1;
    const level = currentLevel();
    const baseSeed = (Date.now() + state.generation * 1000003) >>> 0;
    const seenPrompts = new Set();
    const seenAnswersByType = new Map();
    const seenPoolIndicesByType = new Map();
    const seenCompoundQuestions = new Set();
    const difficulties = difficultyList();
    const occurrenceByType = new Map();
    const typeOrdinal = new Map();
    let nextQuestions;
    try { nextQuestions = plannedTypes.map((type, index) => {
      // 같은 유형이 여러 번 나오면 고른 난이도를 차례로 돌려 쓴다(유형마다 쉬움·기준·어려움이 고르게 섞이도록).
      const occurrence = occurrenceByType.get(type.id) || 0;
      occurrenceByType.set(type.id, occurrence + 1);
      if (!typeOrdinal.has(type.id)) typeOrdinal.set(type.id, typeOrdinal.size);
      const difficulty = difficulties[(typeOrdinal.get(type.id) + occurrence) % difficulties.length];
      const poolKey = `${type.id}|${difficulty}`;
      const typeAnswers = seenAnswersByType.get(type.id) || new Set();
      const typePoolIndices = seenPoolIndicesByType.get(poolKey) || new Set();
      let generated;
      let uniquePromptFallback;
      const fixedPool = type.generationMode === "fixed-verified-pool";
      const attemptLimit = fixedPool ? Math.max(32, Number(type.verifiedVariantCount) || 0) : 32;
      for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
        const seed = (baseSeed + index * 7919 + attempt * 104729 + hash(type.id)) >>> 0;
        const variant = fixedPool ? attempt : index;
        const candidate = generatorApi.generate(type, level.rank, difficulty, seed, variant);
        if (!candidate || seenPrompts.has(candidate.prompt)) continue;
        if (candidate.generationMode === "fixed-verified-pool" && typePoolIndices.has(candidate.verifiedPoolIndex)) continue;
        uniquePromptFallback ||= candidate;
        if (!typeAnswers.has(String(candidate.answer))) {
          generated = candidate;
          break;
        }
      }
      const fallbackVariant = type.generationMode === "fixed-verified-pool" ? typePoolIndices.size : index;
      generated ||= uniquePromptFallback || generatorApi.generate(type, level.rank, difficulty, (baseSeed + index * 7919 + hash(type.id)) >>> 0, fallbackVariant);
      if (!generated || typeof generated.prompt !== "string" || !generated.prompt.trim()
        || type.generationMode === "fixed-verified-pool" && generated.generationMode !== "fixed-verified-pool") {
        throw new Error(`${typeDisplayName(type)}의 검증 문항을 중복 없이 구성하지 못했습니다.`);
      }
      // 2026-11-22: 같은 유형에서 더 만들 수 있는 서로 다른 문항이 없으면 그 칸만 빼고 문제지를 만든다.
      if (seenPrompts.has(generated.prompt) || generated.generationMode === "fixed-verified-pool" && typePoolIndices.has(generated.verifiedPoolIndex)) return null;
      if (type.sourceRelationship === "same-source-compound-owner") {
        if (!generated || generated.sourceItemId !== type.sourceItemId || generated.rawSourceItemId !== type.rawSourceItemId
          || generated.generator !== type.generator || generated.generationMode !== "fixed-verified-pool" || generated.verifiedVariantId !== `${type.sourceItemId}:v${generated.verifiedPoolIndex}`
          || typeof generated.structuralFingerprint !== "string" || !generated.structuralFingerprint.trim()
          || seenCompoundQuestions.has(generated.structuralFingerprint)) throw new Error(`${typeDisplayName(type)}의 문항 연결이나 검증 식별자가 다릅니다.`);
        seenCompoundQuestions.add(generated.structuralFingerprint);
      }
      if (generated.generationMode === "fixed-verified-pool") {
        if (!Number.isInteger(generated.verifiedPoolIndex) || generated.verifiedPoolIndex < 0 || generated.verifiedPoolIndex >= type.verifiedVariantCount || typePoolIndices.has(generated.verifiedPoolIndex)) {
          throw new Error(`${typeDisplayName(type)}의 검증 문항 묶음이 중복되었습니다.`);
        }
        if (generated.verifiedVariantCount !== type.verifiedVariantCount) {
          throw new Error(`${typeDisplayName(type)}의 검증 문항 수가 분류표와 다릅니다.`);
        }
        typePoolIndices.add(generated.verifiedPoolIndex);
        seenPoolIndicesByType.set(poolKey, typePoolIndices);
      }
      seenPrompts.add(generated.prompt);
      typeAnswers.add(String(generated.answer));
      seenAnswersByType.set(type.id, typeAnswers);
      return { number: index + 1, type, level, difficulty: difficultyLabel(difficulty), difficultyValue: difficulty, ...generated };
    }); } catch (error) {
      alert(error?.message || "검증 문항을 구성하지 못했습니다. 이전 문제는 그대로 유지됩니다.");
      return;
    }
    nextQuestions = nextQuestions.filter(Boolean).map((question, index) => ({ ...question, number: index + 1 }));
    if (!nextQuestions.length) {
      alert("선택한 유형으로 서로 다른 문항을 만들지 못했습니다. 유형을 더 고르거나 문항 수를 줄여 주세요.");
      return;
    }
    state.questions = nextQuestions;
    state.requestedCount = state.count;
    state.view = "problem";
    state.solutionViewerIndex = 0;
    renderWorksheet();
    document.querySelector(".bank-layout").hidden = true;
    $("worksheet").hidden = false;
    scrollTo({ top: 0, behavior: "smooth" });
  }

  function watermark() {
    if (!$("watermarkToggle").checked) return "";
    const name = escapeHtml($("studentNameInput").value.trim() || "G-FIELD");
    return `<div class="watermark" aria-hidden="true"><span>${name} · 지필드 영재교육</span><span>${name} · 지필드 영재교육</span><span>${name} · 지필드 영재교육</span></div>`;
  }

  function chunk(values, size) {
    const result = [];
    for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
    return result;
  }

  function isCompactFractionProblem(question) {
    const prompt = String(question?.prompt || "");
    const fractions = (prompt.match(/class="math-fraction"/g) || []).length;
    const blocks = (prompt.match(/<(?:p|li|div|br)\b/gi) || []).length;
    const text = prompt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const eligibleFractionCount = fractions >= 3 || question?.type?.id === "4-2-u1-t6-2";
    return eligibleFractionCount && fractions <= 6 && blocks <= 4 && text.length <= 180
      && !/<(?:svg|table|img|canvas|style|figure)\b/i.test(prompt);
  }

  function needsWidePrint(question) {
    const prompt = String(question?.prompt || "");
    if (prompt.includes("source62-layer-cut-problem")) return true;
    if (prompt.includes('data-reference-role="source-given-worked-example"')) return true;
    const fractionCount = (prompt.match(/class="math-fraction"/g) || []).length;
    const equations = [...prompt.matchAll(/class="[^"]*equation[^"]*"[^>]*>([\s\S]*?)<\/div>/g)]
      .map(match => match[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim());
    return (fractionCount >= 3 && !isCompactFractionProblem(question)) || equations.some(equation => {
      const operatorCount = (equation.match(/[+\-×÷=<>]/g) || []).length;
      return equation.length >= 72 || operatorCount >= 5 || equation.includes("↔");
    });
  }

  function problemWeight(question) {
    // These mixed-calculation prompts fit four-up with the compact print style.
    if (["5-1-u1-t1", "5-1-u1-t1-2", "5-1-u1-t1-3", "5-1-u1-t1-4"].includes(question.type?.id)) return 1;
    // These parallel-line diagrams fit a standard four-up cell.
    if (["4-2-u4-t1-2", "4-2-u4-t1-3", "4-2-u4-t1-7", "4-2-u4-t2-6", "4-2-u4-t1-6"].includes(question.type?.id)) return 1;
    // These four fraction word problems fit the standard four-up cell.
    if (["4-2-u1-t1", "4-2-u1-t1-4", "4-2-u1-t3-10", "4-2-u1-t6"].includes(question.type?.id)) return 1;
    // These compact fraction prompts fit a half-page cell despite having three
    // or more fraction elements. Keep the wide fallback for longer equations.
    if (["5-2-u2-e1-example-4-synthetic", "5-2-u2-e4-mission-2-synthetic"].includes(question.sourceItemId)) return 1;
    // Verified page 17 fraction missions fit the standard four-up cell.
    if (/^5-2-u2-e2-mission-[1-5]-original$/.test(question.sourceItemId || "")) return 1;
    // The four short equations stack within a half-page column in print.
    if (["5-2-u2-practice-71-original", "5-2-u2-practice-71-count-similar"].includes(question.sourceItemId)) return 1; // Four short inline fractions fit the standard column.
    if (question.sourceItemId === "5-2-u2-practice-74-original") return 1; // The three short symbolic fractions fit the standard column.
    if (question.sourceItemId === "5-2-u4-e2-example-1") return 1;
    if (["4-2-u5-t1-2", "4-2-u5-t1-3", "4-2-u5-t1-6", "4-2-u5-t1-9", "4-2-u5-t1-5", "4-2-u5-t1-10", "4-2-u5-t2-2", "4-2-u5-t2-6", "4-2-u5-t2-3", "4-2-u5-t2-4", "4-2-u5-t2-7", "4-2-u5-t2-8", "4-2-u5-t1", "4-2-u5-t2-9", "4-2-u5-t2-10", "4-2-u5-t1-4", "4-2-u5-t1-7", "4-2-u5-t1-8"].includes(question.type?.id)) return 1;
    if (question.sourceItemId?.startsWith("6-2-u4-e2-")) return question.sourceItemId.endsWith("exploration") ? 3 : 1.5;
    if (question.sourceItemId?.startsWith("6-2-u4-e1-")) return question.sourceItemId.endsWith("example-4") ? 3 : 1.5;
    if (question.prompt.includes("source62-final-problem")) return 3;
    if (question.prompt.includes("source62-layer-cut-problem")) return 3;
    if (question.prompt.includes('data-reference-role="source-given-worked-example"')) return 4;
    if (question.prompt.includes("source62-t-pattern-given") && question.difficultyLevel === 0 && question.layerCue?.rows?.length > 26) return 6;
    if (question.prompt.includes("source62-stack-dotgrid")) return 1.5;
    if (question.prompt.includes("source62-exploration-given")) return question.difficultyLevel === 2 ? 3 : 1.5;
    if (question.prompt.includes("source62-three-point-given")) return question.difficultyLevel === 2 ? 3 : 1.5;
    if (question.prompt.includes("source62-t-pattern-given") || question.prompt.includes("source62-stair1-given") || question.prompt.includes("source62-border-given") || question.prompt.includes("source62-notched-given") || question.prompt.includes("source62-opposite-removal-given") || question.prompt.includes("source62-cube-addition-given") || question.prompt.includes("source62-colored-cut-given")) return 3;
    const graphCount = (question.prompt.match(/class="graph-figure"/g) || []).length;
    const hasSource61VolumeE4 = question.prompt.includes("source61-volume-e4-diagram");
    const hasSource61E2Example2 = question.prompt.includes("source61-e2ex2-diagram");
    const hasSource61E2Example4 = question.prompt.includes("source61-e2ex4-diagram");
    const hasSource61E2Mission6 = question.prompt.includes("source61-e2m6-diagram");
    const hasSource61E4Example1 = question.prompt.includes("source61-e4ex1-diagram");
    const hasSource42ParallelAngle = question.prompt.includes("source42-pa");
    const hasSource42PerpendicularParallel = question.prompt.includes("source42-pp");
    return needsWidePrint(question) || hasSource61VolumeE4 || hasSource61E2Example2 || hasSource61E2Example4 || hasSource61E2Mission6 || hasSource61E4Example1
      ? 6
      : hasSource42ParallelAngle || hasSource42PerpendicularParallel || graphCount === 1
        ? 3
        : graphCount > 1
          ? 6
          : 1;
  }

  function paginateWeightedProblems(questions) {
    const pages = [];
    let page = [];
    let weight = 0;
    questions.forEach(question => {
      const questionWeight = problemWeight(question);
      if (page.length && weight + questionWeight > 6) {
        pages.push(page);
        page = [];
        weight = 0;
      }
      page.push(question);
      weight += questionWeight;
    });
    if (page.length) pages.push(page);
    return pages;
  }

  function paginateProblems(questions) {
    if (questions.length && questions.every(question => problemWeight(question) < 3)) {
      return chunk(questions, 4).map(page => ({ questions: page, paired: true, fourUp: true }));
    }
    // A large question must not disable four-up layout for every other page.
    // Keep the existing larger-question layout, while grouping adjacent short
    // questions into their own four-up pages in the original order.
    if (questions.some(question => problemWeight(question) < 3)) {
      const runs = [];
      for (const question of questions) {
        const short = problemWeight(question) < 3;
        if (!runs.length || runs[runs.length - 1].short !== short) runs.push({ short, questions: [] });
        runs[runs.length - 1].questions.push(question);
      }
      return runs.flatMap(run => paginateProblems(run.questions));
    }
    const usesGeometryPairing = question => question.prompt.includes("source42-pa") || question.prompt.includes("source42-pp");
    if (!questions.some(usesGeometryPairing)) {
      return paginateWeightedProblems(questions).map(page => ({ questions: page, paired: false }));
    }
    const pages = [];
    let page = [];
    let height = 0;
    const flushPage = () => {
      if (!page.length) return;
      pages.push({ questions: page, paired: true });
      page = [];
      height = 0;
    };

    for (let index = 0; index < questions.length;) {
      const question = questions[index];
      if (problemWeight(question) >= 6) {
        flushPage();
        pages.push({ questions: [question], paired: false });
        index += 1;
        continue;
      }

      const row = [question];
      const next = questions[index + 1];
      if (next && problemWeight(next) < 6) row.push(next);
      const rowHeight = row.every(item => item.prompt.includes("source42-pac2m3")) ? 1.5
        : row.some(item => problemWeight(item) >= 3) ? 2 : 1;
      if (page.length && height + rowHeight > 3) flushPage();
      page.push(...row);
      height += rowHeight;
      index += row.length;
    }
    flushPage();
    return pages;
  }

  function problemPromptHtml(question) {
    const html = renderMathNotation(question.prompt);
    if (question.type?.id === "5-1-u1-t1") {
      const container = document.createElement("div");
      container.innerHTML = html;
      const equation = container.querySelector('.equation[data-mixed-kind="e1-exploration-set"]');
      for (const node of equation?.childNodes || []) {
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const tail = node.textContent.match(/(\s×\s\d+\s\+\s\d+\s=\s□)$/);
        if (!tail) continue;
        const prefix = document.createElement("span");
        prefix.className = "mixed-calculation-prefix";
        prefix.textContent = node.textContent.slice(0, -tail[1].length);
        const ending = document.createElement("span");
        ending.className = "mixed-calculation-ending";
        ending.textContent = tail[1];
        node.replaceWith(prefix, document.createElement("wbr"), ending);
        break;
      }
      return container.innerHTML;
    }
    if (!["4-2-u5-t1-4", "4-2-u5-t1-7", "4-2-u5-t1-8"].includes(question.type?.id)) return html;
    const container = document.createElement("div");
    container.innerHTML = html;
    const graphs = [...container.children].filter(element => element.classList.contains("graph-figure"));
    if (graphs.length !== 2) return html;
    for (const graph of graphs) {
      const ticks = [...graph.querySelectorAll(".chart-tick")];
      if (ticks.length > 8) ticks.forEach((tick, index) => {
        if ((index % 2 === 1 && index !== ticks.length - 1) || (ticks.length % 2 === 0 && index === ticks.length - 2)) tick.classList.add("paired-dense-hidden");
      });
    }
    const pair = document.createElement("div");
    pair.className = "question-graph-pair";
    graphs[0].before(pair);
    pair.append(...graphs);
    return container.innerHTML;
  }

  function renderProblems() {
    $("problemView").innerHTML = paginateProblems(state.questions).map(({ questions: page, paired, fourUp }, pageIndex) => `<section class="print-page${paired ? " print-page--paired" : page.length === 1 ? " print-page--single" : ""}${fourUp ? " print-page--four-up" : ""}">
      <div class="page-label">문제 ${pageIndex + 1}</div>
      <div class="question-grid">${page.map(question => `<article id="question-${question.number}" class="question-item" data-type-id="${escapeHtml(question.type.id)}"${isCompactFractionProblem(question) ? ' data-compact-fraction="true"' : ""}>
        <header><b>${question.number}</b><span>${question.type.grade}학년 ${question.type.term}학기 · ${escapeHtml(question.type.unitName)} · ${escapeHtml(typeDisplayName(question.type))}</span><em>${escapeHtml(question.difficulty)}</em></header>
        <div class="question-prompt">${problemPromptHtml(question)}</div>
        ${question.type.id === "5-2-u5-e1-exploration" ? `<div class="answer-line p48ex1-answers" aria-label="각 물음의 답"><span>①</span><span>②</span><span>③</span><span>④</span><span>⑤</span><span>⑥</span></div>` : '<div class="answer-line">답</div>'}
      </article>`).join("")}</div>${watermark()}
    </section>`).join("");
  }

  function renderSolutions() {
    const solutionPages = [];
    let solutionPage = [];
    let solutionWeight = 0;
    state.questions.forEach(question => {
      const hasVisual = Boolean(question.answerVisual) || /<svg\b|class="(?:graph-figure|diagram-pair|source41-)/.test(question.solution || "");
      const hasSource61E2Example2 = String(question.answerVisual || "").includes("source61-e2ex2-diagram");
      const hasSource61E2Example4 = String(question.answerVisual || "").includes("source61-e2ex4-diagram");
      const hasSource61E2Mission6 = String(question.answerVisual || "").includes("source61-e2m6-diagram");
      const hasSource61E4Example1 = String(question.answerVisual || "").includes("source61-e4ex1-diagram");
      const hasCompactAnswerVisual = String(question.answerVisual || "").includes('data-print-weight="compact"');
      const hasBorderTwoHeightTables = question.generator === "sourceGrade6SecondSpaceE2BorderDifference" && question.difficultyLevel === 2;
      const hasNotchedTwoStates = question.generator === "sourceGrade6SecondSpaceE2NotchedVisibility" && question.difficultyLevel === 2;
      const hasCubeAdditionClasses = question.generator === "sourceGrade6SecondSpaceE4SingleCubeAddition" || question.sourceItemId === "6-2-u3-e4-mission-4";
      const hasColoredCutPair = ["sourceGrade6SecondSpaceE4ColoredPlaneCut", "sourceGrade6SecondSpaceE4ThreePointPrismCut"].includes(question.generator);
      const ratioE2Text = question.sourceItemId?.startsWith("6-2-u4-e2-") && !question.answerKeyVisual;
      const source52RoundingMission = question.sourceItemId?.startsWith("5-2-u1-e2-mission-");
      const source52RoundingApplicationExploration = question.sourceItemId?.startsWith("5-2-u1-e3-exploration-");
      const source52DicePage54 = question.sourceItemId === "5-2-u5-e4-exploration-1" || /^5-2-u5-e4-example-4-[1-4]$/.test(question.sourceItemId || "");
      const source52DicePage55 = /^5-2-u5-e4-mission-[1-6]$/.test(question.sourceItemId || "");
      const source52PackingPractice = question.sourceItemId === "5-2-u5-check108-q8-packing-synthetic";
      const source52GridPractice = question.sourceItemId === "5-2-u5-e1-mission-1-grid-synthetic";
      const source52ArrowPractice = question.sourceItemId === "5-2-u5-check113-q43-arrow-synthetic";
      const source52TrapezoidMission = question.sourceItemId === "5-2-u3-e4-mission-6";
      const source52EquilateralExample = question.sourceItemId === "5-2-u3-e4-example-2";
      const weight = source52RoundingMission ? 2 : ratioE2Text ? question.sourceItemId.endsWith("exploration") ? 4 : 2 : source52DicePage54 || source52DicePage55 || source52ArrowPractice || source52TrapezoidMission || source52EquilateralExample || hasSource61E2Example2 || hasSource61E2Example4 || hasSource61E2Mission6 || hasSource61E4Example1 || hasBorderTwoHeightTables || hasNotchedTwoStates || hasCubeAdditionClasses ? 8 : source52PackingPractice || source52GridPractice || hasColoredCutPair ? 4 : hasCompactAnswerVisual ? 2.5 : hasVisual ? 3 : 1;
      const solutionPageLimit = source52RoundingMission ? 6 : source52RoundingApplicationExploration ? 5 : 8;
      if (solutionPage.length && (solutionPage.length >= 8 || solutionWeight + weight > solutionPageLimit)) {
        solutionPages.push(solutionPage);
        solutionPage = [];
        solutionWeight = 0;
      }
      solutionPage.push(question);
      solutionWeight += weight;
    });
    if (solutionPage.length) solutionPages.push(solutionPage);
    const twoColumnAnswers = page => page.some(question => question.answerPageLayout === "two-column")
      && page.every(question => question.answerPageLayout === "two-column" || question.prompt.includes("source62-operation-picture"));
    $("solutionView").innerHTML = solutionPages.map((page, pageIndex) => `<section class="print-page answer-page">
      <div class="page-label">정답·풀이 ${pageIndex + 1}</div>
      <div class="solution-list${twoColumnAnswers(page) ? " solution-list--two-column" : ""}">${page.map(question => `<article class="solution-item">
        <header><b>${question.number}</b><span>${escapeHtml(typeDisplayName(question.type))}</span><strong>${renderMathNotation(escapeHtml(question.answer))}</strong></header>
        ${question.answerVisual ? `<div class="solution-answer-visual" aria-label="정답 그림">${renderMathNotation(question.answerVisual)}</div>` : ""}
        <p>${renderMathNotation(question.solution)}</p>
      </article>`).join("")}</div>${watermark()}
    </section>`).join("");
  }

  function renderAnswerKey() {
    const pages = chunk(state.questions, 32);
    $("answerKeyView").innerHTML = pages.map((page, pageIndex) => `<section class="answer-key-page">
      <div class="answer-key-title">정답표 ${pageIndex + 1}</div>
      <div class="answer-key-grid">${page.map(question => `<div><b>${question.number}</b><span>${renderMathNotation(escapeHtml(question.answer))}</span></div>`).join("")}</div>
      ${page.some(question => question.answerKeyVisual && question.answerVisual) ? `<div class="answer-key-visuals">${page.filter(question => question.answerKeyVisual && question.answerVisual).map(question => `<figure><figcaption>${question.number}</figcaption>${renderMathNotation(question.answerVisual)}</figure>`).join("")}</div>` : ""}
      ${watermark()}
    </section>`).join("");
  }

  function renderSolutionViewer() {
    const question = state.questions[state.solutionViewerIndex];
    const total = state.questions.length;
    if (!question || !total) return;
    $("solutionViewerPosition").textContent = `${question.number} / ${total}`;
    $("solutionViewerPrevious").disabled = state.solutionViewerIndex === 0;
    $("solutionViewerNext").disabled = state.solutionViewerIndex === total - 1;
    $("solutionViewerJump").innerHTML = state.questions.map((item, index) => `<button type="button" data-solution-index="${index}" class="${index === state.solutionViewerIndex ? "is-active" : ""}" aria-current="${index === state.solutionViewerIndex ? "step" : "false"}"><b>${item.number}</b><span>${escapeHtml(typeDisplayName(item.type))}</span></button>`).join("");
    $("solutionViewerContent").innerHTML = `<div class="solution-viewer-question-meta"><b>${question.number}</b><span>${escapeHtml(question.type.grade)}학년 ${escapeHtml(question.type.term)}학기 · ${escapeHtml(question.type.unitName)} · ${escapeHtml(typeDisplayName(question.type))}</span><em>${escapeHtml(question.difficulty)}</em></div>
      <div class="solution-viewer-prompt">${renderMathNotation(question.prompt)}</div>
      <div class="solution-viewer-answer">정답: ${renderMathNotation(escapeHtml(question.answer))}</div>
      ${question.answerVisual ? `<div class="solution-viewer-answer-visual" aria-label="정답 그림">${renderMathNotation(question.answerVisual)}</div>` : ""}
      <div class="solution-viewer-solution">${renderMathNotation(question.solution)}</div>`;
  }

  function openSolutionViewer() {
    if (!state.questions.length) return;
    solutionViewerReturnFocus = document.activeElement;
    state.solutionViewerIndex = Math.max(0, Math.min(state.solutionViewerIndex, state.questions.length - 1));
    renderSolutionViewer();
    $("solutionViewer").hidden = false;
    document.body.classList.add("has-solution-viewer");
    $("solutionViewerClose").focus();
  }

  function closeSolutionViewer() {
    if ($("solutionViewer").hidden) return;
    $("solutionViewer").hidden = true;
    document.body.classList.remove("has-solution-viewer");
    solutionViewerReturnFocus?.focus?.();
    solutionViewerReturnFocus = null;
  }

  function changeSolutionViewer(index) {
    if (!state.questions.length) return;
    state.solutionViewerIndex = Math.max(0, Math.min(index, state.questions.length - 1));
    renderSolutionViewer();
    $("solutionViewerContent").scrollTo({ top: 0, behavior: "auto" });
  }

  function setPrintMenu(open) {
    $("printMenuList").hidden = !open;
    $("printMenuButton").setAttribute("aria-expanded", open ? "true" : "false");
  }

  function restorePrintView() {
    if (!activePrintMode) return;
    document.body.removeAttribute("data-print-mode");
    $("problemView").hidden = state.view !== "problem";
    $("solutionView").hidden = state.view !== "solution";
    $("answerKeyView").hidden = true;
    activePrintMode = null;
  }

  function applyPrintMode(mode) {
    activePrintMode = mode;
    document.body.dataset.printMode = mode;
    $("problemView").hidden = mode === "answer-key" || mode === "solution";
    $("solutionView").hidden = mode === "problem" || mode === "answer-key";
    $("answerKeyView").hidden = mode !== "answer-key";
  }

  function currentPrintMode() {
    return state.view === "solution" ? "solution" : "problem";
  }

  function canPrintWorksheet() {
    return state.questions.length > 0 && !$("worksheet").hidden;
  }

  async function printWorksheet(mode) {
    setPrintMenu(false);
    if (!state.questions.length || activePrintMode) return;
    applyPrintMode(mode);
    const requestedQuestions = state.questions;
    try {
      try { if (document.fonts?.ready) await document.fonts.ready; } catch (error) {}
      // 인쇄 명조(print-typography.css)는 인쇄할 때만 쓰여 미리 받아 두지 않으면 대체 글꼴로 찍힐 수 있다. 굵기 3개를 먼저 받는다(최대 6초).
      try { await Promise.race([preloadPrintFonts(), new Promise(resolve => setTimeout(resolve, 6000))]); } catch (error) {}
      if (mode === "problem") await rebalanceAllPrintPages();
      const images = [$("problemView"), $("solutionView"), $("answerKeyView")].filter(view => !view.hidden).flatMap(view => [...view.querySelectorAll("img")]);
      await Promise.all(images.map(image => image.decode()));
      if (images.some(image => !image.complete || !image.naturalWidth)) throw new Error("Print image is missing");
      requestAnimationFrame(() => {
        if (state.questions !== requestedQuestions || $("worksheet").hidden) { restorePrintView(); return; }
        try { window.print(); } catch (error) { restorePrintView(); alert("인쇄를 시작하지 못했습니다. 다시 시도해 주세요."); }
      });
    } catch (error) {
      restorePrintView();
      alert("그림을 불러오지 못해 인쇄를 중단했습니다. 다시 시도해 주세요.");
    }
  }

  function renderWorksheet() {
    const student = $("studentNameInput").value.trim();
    const selected = selectedQuestionTypes();
    $("worksheetStudent").textContent = student;
    $("worksheetTitle").textContent = state.view === "problem" ? "맞춤 유사문제" : "맞춤 유사문제 정답·풀이";
    $("worksheetMeta").textContent = `${curriculum.bankName || "심화 문제은행"} · ${worksheetDifficultyLabel()} · ${state.questions.length}문항 · ${selected.length}개 유형${state.requestedCount > state.questions.length ? ` · 요청한 ${state.requestedCount}문항 중 서로 다른 문항 ${state.questions.length}개` : ""}`;
    $("problemView").hidden = state.view !== "problem";
    $("solutionView").hidden = state.view !== "solution";
    $("answerKeyView").hidden = true;
    $("problemTab").classList.toggle("is-active", state.view === "problem");
    $("solutionTab").classList.toggle("is-active", state.view === "solution");
    $("problemTab").setAttribute("aria-selected", state.view === "problem" ? "true" : "false");
    $("solutionTab").setAttribute("aria-selected", state.view === "solution" ? "true" : "false");
    $("reviewStageMeta").textContent = `${state.questions.length}문항 · ${selected.length}개 유형`;
    $("reviewSelectedTypes").innerHTML = selected.map(type =>
      `<div><strong>${escapeHtml(typeDisplayName(type))}</strong><span>${type.unitNumber}단원 · ${escapeHtml(type.unitName)}</span></div>`
    ).join("");
    $("reviewQuestionList").innerHTML = state.questions.map(question =>
      `<a href="#question-${question.number}"><b>${question.number}</b><span>${escapeHtml(typeDisplayName(question.type))}</span></a>`
    ).join("");
    renderProblems();
    renderSolutions();
    renderAnswerKey();
    rebalanceAllPrintPages();
    if (!$("solutionViewer").hidden) renderSolutionViewer();
  }

  // 2026-11-22: 문항 무게 추정만으로 나눈 쪽이 A4 한 장(297mm, 위아래 여백 12mm)을 넘으면
  // 실제 높이를 재서 넘치는 마지막 문항부터 바로 다음 쪽으로 옮긴다. 순서와 문항 번호는 그대로다.
  // 인쇄용 @media print 규칙을 일반 규칙으로 펼친 CSS. 숨은 측정 프레임에서 A4 폭으로 인쇄 배치를 재현한다.
  // Chrome은 인쇄할 때 미디어 질의 폭을 쪽 폭(794px)이 아니라 약 720px로 계산한다(실측: min-width:720 참, 724 거짓).
  // 그래서 (max-width:760px) 같은 규칙이 실제 인쇄에 적용된다. 측정용 틀도 같은 조건으로 규칙을 고른다.
  const PRINT_MEDIA_WIDTH = 720;
  function printMediaMatcher() {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${PRINT_MEDIA_WIDTH}px;height:1018px;border:0;visibility:hidden;pointer-events:none`;
    document.body.appendChild(frame);
    const cache = new Map();
    return {
      matches(mediaText) {
        if (cache.has(mediaText)) return cache.get(mediaText);
        const query = mediaText.split(",").map(part => /\bprint\b/i.test(part) ? part.replace(/\bprint\b/gi, "all") : /\bscreen\b/i.test(part) ? "not all" : part).join(",");
        let result = false;
        try { result = frame.contentWindow.matchMedia(query).matches; } catch (error) { result = /\bprint\b/i.test(mediaText); }
        cache.set(mediaText, result);
        return result;
      },
      dispose() { frame.remove(); }
    };
  }

  function printLayoutCss() {
    let css = "", imports = "";
    const matcher = printMediaMatcher();
    const walk = rules => {
      for (const rule of rules) {
        // @import는 문서 맨 앞에 있어야 적용된다(본문 글꼴 Pretendard). 중간에 두면 무시되어 대체 글꼴로 재게 된다.
        if (typeof CSSImportRule !== "undefined" && rule instanceof CSSImportRule) { imports += `${rule.cssText}\n`; continue; }
        if (typeof CSSMediaRule !== "undefined" && rule instanceof CSSMediaRule) {
          if (matcher.matches(rule.media.mediaText)) walk(rule.cssRules);
        } else if (!(typeof CSSPageRule !== "undefined" && rule instanceof CSSPageRule)) {
          css += `${rule.cssText}\n`;
        }
      }
    };
    for (const sheet of document.styleSheets) {
      const media = sheet.media?.mediaText || "";
      if (media && !/\b(all|print)\b/.test(media)) continue;
      try { walk(sheet.cssRules); } catch (error) { /* 다른 출처 스타일은 건너뜀 */ }
    }
    matcher.dispose();
    return imports + css;
  }

  function createPrintProbe(view, printMode) {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    // 고정 위치라 측정 중에 인쇄가 시작돼도 쪽 수에 영향을 주지 않는다.
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;visibility:hidden;pointer-events:none";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${printLayoutCss().replace(/<\/style/gi, "<\\/style")}</style><style>html,body{margin:0;padding:0;width:210mm;background:#fff}</style></head><body></body></html>`);
    doc.close();
    doc.body.dataset.printMode = printMode;
    let host = doc.body;
    const chain = [];
    for (let node = view; node && node !== document.body; node = node.parentElement) chain.unshift(node);
    chain.forEach(node => {
      const copy = doc.createElement(node.tagName.toLowerCase());
      if (node.id) copy.id = node.id;
      if (node.className && typeof node.className === "string") copy.className = node.className;
      host.appendChild(copy);
      host = copy;
    });
    host.hidden = false;
    const ruler = doc.createElement("div");
    ruler.style.height = "297mm";
    doc.body.appendChild(ruler);
    const pageHeight = ruler.getBoundingClientRect().height;
    // 이름 붙은 @page(예: 4문항 쪽 hseFourUp은 위아래 8mm 여백)는 쓸 수 있는 높이가 A4보다 작다.
    const pageMargins = new Map();
    const collectPageRules = rules => {
      for (const rule of rules) {
        if (typeof CSSPageRule !== "undefined" && rule instanceof CSSPageRule) {
          const name = (rule.selectorText || "").trim();
          pageMargins.set(name, { top: rule.style.marginTop || pageMargins.get(name)?.top || "", bottom: rule.style.marginBottom || pageMargins.get(name)?.bottom || "" });
        } else if (rule.cssRules && !(typeof CSSImportRule !== "undefined" && rule instanceof CSSImportRule)) {
          if (typeof CSSMediaRule !== "undefined" && rule instanceof CSSMediaRule && /\bscreen\b/.test(rule.media.mediaText) && !/\bprint\b/.test(rule.media.mediaText)) continue;
          collectPageRules(rule.cssRules);
        }
      }
    };
    for (const sheet of document.styleSheets) { try { collectPageRules(sheet.cssRules); } catch (error) {} }
    const usableHeights = new Map();
    const usableHeight = name => {
      const key = name && name !== "auto" ? name : "";
      if (usableHeights.has(key)) return usableHeights.get(key);
      const margins = pageMargins.get(key) || pageMargins.get("") || {};
      const box = doc.createElement("div");
      box.style.height = `calc(297mm - ${margins.top || "0px"} - ${margins.bottom || "0px"})`;
      doc.body.appendChild(box);
      const height = box.getBoundingClientRect().height || pageHeight;
      box.remove();
      usableHeights.set(key, height);
      return height;
    };
    return {
      limit: pageHeight * 0.99,
      limitFor(page) {
        const copy = doc.importNode(page, true);
        host.appendChild(copy);
        const name = frame.contentWindow.getComputedStyle(copy).page;
        copy.remove();
        // 실측 PDF와 비교해 몇 px 차이만 두고 쓴다(0.99배는 4문항 쪽을 불필요하게 나눴다).
        return usableHeight(name) - 4;
      },
      // 실제 인쇄와 같은 글꼴로 재도록, 쪽을 한 번 그려 글꼴을 불러온 뒤(최대 4초) 잰다.
      async ready() {
        const copy = doc.importNode(view, true);
        copy.hidden = false;
        host.appendChild(copy);
        copy.getBoundingClientRect();
        try { await Promise.race([doc.fonts ? doc.fonts.ready : Promise.resolve(), new Promise(resolve => setTimeout(resolve, 4000))]); } catch (error) {}
        copy.remove();
      },
      measure(page) {
        const copy = doc.importNode(page, true);
        host.appendChild(copy);
        // 4문항 쪽처럼 높이가 고정된 쪽은 상자 높이가 늘지 않으므로 실제 내용의 끝(문항·답칸 아래)까지 잰다.
        const top = copy.getBoundingClientRect().top;
        const padBottom = parseFloat(frame.contentWindow.getComputedStyle(copy).paddingBottom) || 0;
        const contentBottom = Math.max(...[...copy.querySelectorAll(".question-item, .solution-item, .answer-line")].map(el => el.getBoundingClientRect().bottom), top);
        const height = Math.max(copy.getBoundingClientRect().height, copy.scrollHeight, contentBottom - top + padBottom);
        copy.remove();
        return height;
      },
      overflowingEquations(page) {
        const copy = doc.importNode(page, true);
        host.appendChild(copy);
        const flags = [...copy.querySelectorAll(".equation")].map(el => {
          // 실제 인쇄와 1~2px 차이가 날 수 있어, 내용 폭이 칸 안쪽 폭에 4px 이내로 붙으면 넘치는 것으로 본다.
          if (el.scrollWidth > el.clientWidth + 1) return true;
          const style = frame.contentWindow.getComputedStyle(el);
          const inner = el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
          const range = doc.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().width > inner - 4;
        });
        copy.remove();
        return flags;
      },
      dispose() { frame.remove(); }
    };
  }

  async function rebalancePrintPages(view, listSelector, itemSelector, labelPrefix, printMode) {
    if (!view || !document.body) return;
    let probe;
    try { probe = createPrintProbe(view, printMode); } catch (error) { return; }
    const renderedQuestions = state.questions;
    try { await probe.ready(); } catch (error) {}
    const overflows = page => probe.measure(page) > probe.limitFor(page);
    try {
      if (state.questions !== renderedQuestions) return;
      let pages = [...view.children].filter(child => child.classList.contains("print-page"));
      // 인쇄 폭에서 칸을 넘는 긴 식만 줄바꿈되도록 표시한다(다른 식은 한 줄 유지).
      pages.forEach(page => {
        const equations = [...page.querySelectorAll(".equation")];
        if (!equations.length) return;
        const flags = probe.overflowingEquations(page);
        // 이미 줄바꿈된 식은 다시 재면 넘치지 않으므로 표시를 지우지 않는다(다시 그리면 새 DOM이라 초기화된다).
        equations.forEach((equation, index) => { if (flags[index]) equation.classList.add("equation--wrap"); });
      });
      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const list = page.querySelector(listSelector);
        if (!list) continue;
        // 2×2 고정 칸(four-up)에서 한 칸이 반 장보다 크면 칸 높이가 같아 나눠도 넘친다. 이 쪽은 자유 높이 2열로 바꾼다.
        if (page.classList.contains("print-page--four-up") && list.querySelectorAll(`:scope > ${itemSelector}`).length > 1 && overflows(page)) page.classList.remove("print-page--four-up");
        const moved = [];
        while (list.querySelectorAll(`:scope > ${itemSelector}`).length > 1 && overflows(page)) {
          const items = list.querySelectorAll(`:scope > ${itemSelector}`);
          moved.unshift(items[items.length - 1]);
          items[items.length - 1].remove();
        }
        if (!moved.length) continue;
        const next = page.cloneNode(true);
        next.classList.remove("print-page--four-up", "print-page--oversize");
        next.querySelector(listSelector).replaceChildren(...moved);
        page.after(next);
        pages = [...view.children].filter(child => child.classList.contains("print-page"));
      }
      pages.forEach((page, index) => {
        const label = page.querySelector(".page-label");
        if (label) label.textContent = `${labelPrefix} ${index + 1}`;
        const list = page.querySelector(listSelector);
        const single = Boolean(list) && list.querySelectorAll(`:scope > ${itemSelector}`).length === 1;
        // 한 문항만 남은 쪽이 4문항 고정 칸(2×2) 때문에 넘치면 일반 쪽으로 되돌린다.
        if (single && page.classList.contains("print-page--four-up") && overflows(page)) page.classList.remove("print-page--four-up");
        // 한 문항이 2열의 반쪽 폭에 있으면 길어지므로 전체 폭으로 펼친다.
        if (single && page.classList.contains("print-page--paired") && overflows(page)) page.classList.remove("print-page--paired");
        // 그림이 커서 한 문항이 A4를 넘으면 먼저 그림을 줄여 한 장에 맞춘다.
        if (single && !page.classList.contains("print-page--fit") && overflows(page)) page.classList.add("print-page--fit");
        if (single && page.classList.contains("print-page--fit") && overflows(page)) page.classList.add("print-page--fit-tight");
        // 그래도 길면 문항 안에서 다음 장으로 이어지게 해 이름표만 남는 빈 장을 막는다.
        page.classList.toggle("print-page--oversize", single && overflows(page));
      });
    } finally {
      probe.dispose();
    }
  }

  // 정답·풀이 쪽은 인쇄에서 이어 흐르도록(break-after:auto) 되어 있어 문제 쪽만 보정한다.
  // 화면을 다시 그릴 때와 인쇄 직전에 차례로 실행해 같은 쪽을 동시에 고치지 않는다.
  let printRebalanceQueue = Promise.resolve();
  function rebalanceAllPrintPages() {
    if (window.HSE_DISABLE_PRINT_REBALANCE) return printRebalanceQueue;
    printRebalanceQueue = printRebalanceQueue
      .then(() => rebalancePrintPages($("problemView"), ".question-grid", ".question-item", "문제", "problem"))
      .catch(error => { window.HSE_PRINT_REBALANCE_ERROR = String(error && error.stack || error); });
    return printRebalanceQueue;
  }

  bindSegment("gradeFilter", "grade", "grade", Number);
  bindSegment("termFilter", "term", "term", Number);
  function refreshDifficultyButtons() {
    $("difficultyFilter").querySelectorAll("button[data-difficulty]").forEach(button => {
      const value = Number(button.dataset.difficulty);
      const active = state.mixDifficulty ? state.difficulties.has(value) : value === state.difficulty;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    $("difficultyFilter").classList.toggle("is-mixed", state.mixDifficulty);
  }
  $("difficultyFilter").addEventListener("click", event => {
    const button = event.target.closest("button[data-difficulty]");
    if (!button || button.disabled) return;
    const value = Number(button.dataset.difficulty);
    if (state.mixDifficulty) {
      // 섞기: 누를 때마다 넣고 빼되, 하나는 남긴다.
      if (state.difficulties.has(value) && state.difficulties.size > 1) state.difficulties.delete(value); else state.difficulties.add(value);
      state.difficulty = [-1, 0, 1].find(item => state.difficulties.has(item)) ?? 0;
    } else {
      state.difficulty = value;
      state.difficulties = new Set([value]);
    }
    refreshDifficultyButtons();
    renderSummary();
  });
  $("difficultyMixToggle").addEventListener("change", event => {
    state.mixDifficulty = event.target.checked;
    if (!state.mixDifficulty) state.difficulties = new Set([state.difficulty]);
    refreshDifficultyButtons();
    renderSummary();
  });
  $("semesterPicker").addEventListener("click", event => {
    const button = event.target.closest("button[data-semester-key]");
    if (!button || button.disabled) return;
    const key = button.dataset.semesterKey;
    if (state.extraSemesters.has(key)) state.extraSemesters.delete(key); else state.extraSemesters.add(key);
    renderCatalog();
  });

  $("unitFilter").addEventListener("change", event => { state.unitId = event.target.value; state.collapsedUnits.delete(state.unitId); renderCatalog(); });
  $("typeSearchInput").addEventListener("input", event => { state.search = event.target.value; renderCatalog(); });
  $("questionCountInput").addEventListener("input", event => {
    setQuestionCount(Number(event.target.value));
  });
  $("questionCountRange").addEventListener("input", event => {
    setQuestionCount(Number(event.target.value));
  });
  document.querySelector(".count-presets").addEventListener("click", event => {
    const button = event.target.closest("button[data-count]");
    if (!button) return;
    setQuestionCount(Number(button.dataset.count));
  });
  $("typeList").addEventListener("click", event => {
    const button = event.target.closest("button[data-tree-unit]");
    if (!button) return;
    const unitId = button.dataset.treeUnit;
    if (state.collapsedUnits.has(unitId)) state.collapsedUnits.delete(unitId); else state.collapsedUnits.add(unitId);
    renderCatalog();
  });
  $("typeList").addEventListener("click", event => {
    if (event.target.closest("#typePreviewPopover") || event.target.closest("input[data-type-id]")) return;
    const row = event.target.closest("[data-preview-type-id]");
    if (!row) return;
    event.preventDefault();
    showTypePreview(row.dataset.previewTypeId, row);
  });
  $("typeList").addEventListener("keydown", event => {
    if (!['Enter', ' '].includes(event.key) || event.target.matches("input[data-type-id]")) return;
    const row = event.target.closest("[data-preview-type-id]");
    if (!row) return;
    event.preventDefault();
    showTypePreview(row.dataset.previewTypeId, row);
  });
  $("typeList").addEventListener("change", event => {
    const group = event.target.closest("input[data-select-scope]");
    if (!group) return;
    const scope = group.dataset.selectScope, id = group.dataset.selectId;
    const field = { semester: "semesterId", unit: "unitId", subunit: "subunitId" }[scope];
    const members = visibleTypes().filter(type => type[field] === id && isReadyType(type));
    for (const type of members) {
      const target = sourceQuestionType(type);
      if (!target) continue;
      if (group.checked) state.selected.add(target.id); else state.selected.delete(target.id);
    }
    renderCatalog();
  });
  $("typeList").addEventListener("change", event => {
    const input = event.target.closest("input[data-type-id]");
    if (!input) return;
    const type = sourceQuestionType(typeById.get(input.dataset.typeId));
    if (!type) return;
    if (input.checked) state.selected.add(type.id); else state.selected.delete(type.id);
    renderCatalog();
  });
  $("selectedTypeList").addEventListener("click", event => {
    const button = event.target.closest("button[data-remove-type]");
    if (!button) return;
    const target = sourceQuestionType(typeById.get(button.dataset.removeType));
    for (const id of state.selected) if (sourceQuestionType(typeById.get(id))?.id === target?.id) state.selected.delete(id);
    renderCatalog();
  });
  $("generateButton").addEventListener("click", buildQuestions);
  $("mobileSettingsButton").addEventListener("click", () => {
    $("workspacePanel").scrollIntoView({ behavior: "auto", block: "start" });
  });
  $("newProblemButton").addEventListener("click", buildQuestions);
  $("backButton").addEventListener("click", () => {
    $("worksheet").hidden = true;
    document.querySelector(".bank-layout").hidden = false;
    scrollTo({ top: 0, behavior: "smooth" });
  });
  $("problemTab").addEventListener("click", () => { state.view = "problem"; renderWorksheet(); });
  $("solutionTab").addEventListener("click", () => { state.view = "solution"; renderWorksheet(); });
  $("solutionViewerButton").addEventListener("click", openSolutionViewer);
  $("solutionViewerClose").addEventListener("click", closeSolutionViewer);
  $("solutionViewer").addEventListener("click", event => {
    if (event.target.matches("[data-solution-viewer-close]")) closeSolutionViewer();
  });
  $("solutionViewerPrevious").addEventListener("click", () => changeSolutionViewer(state.solutionViewerIndex - 1));
  $("solutionViewerNext").addEventListener("click", () => changeSolutionViewer(state.solutionViewerIndex + 1));
  $("solutionViewerJump").addEventListener("click", event => {
    const button = event.target.closest("button[data-solution-index]");
    if (button) changeSolutionViewer(Number(button.dataset.solutionIndex));
  });
  $("printMenuButton").addEventListener("click", () => setPrintMenu($("printMenuList").hidden));
  $("printMenuList").addEventListener("click", event => {
    const button = event.target.closest("button[data-print-mode]");
    if (button) printWorksheet(button.dataset.printMode);
  });
  document.addEventListener("click", event => {
    if (!event.target.closest("#printMenu")) setPrintMenu(false);
  });
  // 브라우저 메뉴로 인쇄해도 화면용 배치가 아닌 A4 인쇄 배치로 나가게 한다.
  addEventListener("beforeprint", () => {
    if (!activePrintMode && canPrintWorksheet()) applyPrintMode(currentPrintMode());
  });
  addEventListener("afterprint", restorePrintView);
  $("watermarkToggle").addEventListener("change", () => { if (state.questions.length) renderWorksheet(); });
  $("studentNameInput").addEventListener("input", () => { if (state.questions.length) renderWorksheet(); });
  addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "p" && canPrintWorksheet() && $("solutionViewer").hidden) {
      event.preventDefault();
      printWorksheet(currentPrintMode());
      return;
    }
    if (!$("solutionViewer").hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSolutionViewer();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeSolutionViewer(state.solutionViewerIndex - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        changeSolutionViewer(state.solutionViewerIndex + 1);
        return;
      }
      if (event.key === "Tab") {
        const focusable = [...$("solutionViewer").querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      return;
    }
    if (event.key === "Escape") {
      setPrintMenu(false);
      hideTypePreview(true);
    }
  });

  const params = new URLSearchParams(location.search);
  const requestedDifficulty = Number(params.get("difficulty"));
  if ([-1, 0, 1].includes(requestedDifficulty)) state.difficulty = requestedDifficulty;
  const initialPair = bankAccess.firstAllowedPair();
  if (initialPair) {
    state.grade = initialPair.grade;
    state.term = initialPair.term;
    refreshSegments("gradeFilter", "grade", state.grade);
    refreshSegments("termFilter", "term", state.term);
  }
  updateApprovalButtons();
  document.addEventListener("hse-bank-access-ready", () => {
    const pair = bankAccess.firstAllowedPair();
    if (!pair) return;
    state.grade = pair.grade;
    state.term = pair.term;
    refreshSegments("gradeFilter", "grade", state.grade);
    refreshSegments("termFilter", "term", state.term);
    updateApprovalButtons();
    renderUnitOptions();
    renderCatalog();
  });
  const identity = identityApi.resolve({
    session: window.HSELEMENTARY_SESSION || window.GFIELD_SESSION,
    access: window.HSELEMENTARY_ACCESS,
    localStorage,
    sessionStorage,
    search: location.search
  });
  const studentNameInput = $("studentNameInput");
  studentNameInput.value = identity.name;
  studentNameInput.readOnly = !identity.canEditName;
  studentNameInput.setAttribute("aria-readonly", identity.canEditName ? "false" : "true");
  studentNameInput.dataset.identitySource = identity.source || "none";
  studentNameInput.dataset.nameEditPermission = identity.canEditName ? "granted" : "locked";
  studentNameInput.title = identity.canEditName ? "관리자가 학생 이름 변경을 허용했습니다." : "로그인한 이름이 자동으로 적용됩니다.";
  const reviewType = sourceQuestionType(typeById.get(params.get("type")));
  if (reviewType?.generator && !reviewType.reviewLocked && bankAccess.canAccess(reviewType.grade, reviewType.term)) {
    state.level = "simwha";
    state.grade = reviewType.grade;
    state.term = reviewType.term;
    state.unitId = reviewType.unitId;
    state.selected.add(reviewType.id);
    state.count = 3;
    $("questionCountInput").value = "3";
    refreshSegments("gradeFilter", "grade", state.grade);
    refreshSegments("termFilter", "term", state.term);
    refreshSegments("difficultyFilter", "difficulty", state.difficulty);
  }
  if (curriculum.startCollapsed) curriculum.semesters.forEach(semester => semester.units.forEach(unit => state.collapsedUnits.add(unit.id)));
  ensurePreviewPopover();
  renderUnitOptions();
  renderCatalog();
  if (reviewType?.generator && !reviewType.reviewLocked && params.get("review") === "1") buildQuestions();
})();
