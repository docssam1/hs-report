'use strict';
(() => {
  const buttons = [...document.querySelectorAll('.exam-print')];
  const status = document.getElementById('print-status');
  const loginLink = document.getElementById('login-link');
  let busy = false;
  let rosterPromise;
  function roster() {
    if (!rosterPromise) rosterPromise = fetch(new URL('../../data.js', location.href), { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('학생 명단을 불러오지 못했습니다. 새로고침해 주세요.');
        return response.text();
      }).then(source => {
        // Load the same source used by the archive, without changing its data.
        const script = document.createElement('script');
        script.textContent = source;
        document.head.appendChild(script);
        script.remove();
        return window.GFIELD_DATA;
      }).catch(error => { rosterPromise = null; throw error; });
    return rosterPromise;
  }
  async function identity() {
    const session = await window.GFIELD_AUTH?.getSession('student');
    const name = String(session?.login_name || '').trim();
    if (!name) throw new Error('자료실에 로그인하면 학생 이름으로 인쇄할 수 있습니다.');
    const verified = await window.GFIELD_EMAIL_LOGIN?.check(name);
    if (!verified?.ok) throw new Error('로그인을 다시 확인해 주세요.');
    const data = await roster();
    if (!Array.isArray(data.students) || !data.students.includes(name) || data.studentTypes?.[name] === 'withdrawn') {
      throw new Error('재원 확인이 필요합니다. 학원에 문의해 주세요.');
    }
    return { name, data };
  }
  function approved(user, round) {
    if (round === 'recall') return true;
    const access = user.data.archiveProductAccess?.[`mock-top-secret-finish-${round}`];
    return Array.isArray(access) && (access.includes('*') || access.includes(user.name));
  }
  async function refresh() {
    buttons.forEach(button => { button.disabled = true; });
    try {
      const user = await identity();
      buttons.forEach(button => { button.disabled = busy || !approved(user, button.dataset.round); });
      status.textContent = `${user.name} 학생 이름으로 워터마크가 들어갑니다. 승인된 회차만 인쇄할 수 있습니다.`;
      loginLink.hidden = true;
    } catch (error) {
      status.textContent = error.message;
      loginLink.hidden = false;
    }
  }
  function printWindow() {
    const view = window.open('', '_blank');
    if (!view) throw new Error('팝업을 허용한 뒤 다시 인쇄해 주세요.');
    view.document.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>인쇄 준비</title></head><body><p id="progress">인쇄물을 준비하고 있습니다.</p><main id="sheets"></main></body></html>');
    view.document.close();
    const style = view.document.createElement('style');
    style.textContent = `*{box-sizing:border-box}body{margin:0;background:#525659;font-family:Arial,'Malgun Gothic','Apple SD Gothic Neo',sans-serif}#progress{color:white;text-align:center;padding:16px}#print-again{display:block;margin:16px auto;padding:12px 24px;font:inherit}.sheet{position:relative;width:210mm;height:297mm;background:white;margin:16px auto;overflow:hidden;break-after:page}.sheet:last-child{break-after:auto}.sheet>img{display:block;width:100%;height:100%;object-fit:contain}.watermark{position:absolute;inset:0;overflow:hidden;pointer-events:none}.watermark span{position:absolute;left:-10%;width:120%;text-align:center;color:#000;opacity:.13;font-size:22pt;font-weight:600;white-space:nowrap;transform:rotate(-30deg)}.watermark span:nth-child(1){top:24%}.watermark span:nth-child(2){top:50%}.watermark span:nth-child(3){top:76%}@page{size:A4;margin:0}@page landscape{size:A4 landscape;margin:0}.sheet.landscape{page:landscape;width:297mm;height:210mm}@media print{body{background:white}#progress,#print-again{display:none}.sheet{margin:0}}`;
    view.document.head.appendChild(style);
    return view;
  }
  async function printPaper(button) {
    if (busy) return;
    const round = button.dataset.round;
    const kind = button.dataset.kind;
    if (!/^(?:1|2|recall)$/.test(round) || !['questions', 'solutions'].includes(kind)) return;
    let view;
    let pdf;
    let failure;
    try {
      view = printWindow();
      busy = true;
      buttons.forEach(item => { item.disabled = true; });
      const user = await identity();
      if (!approved(user, round)) throw new Error('이 회차는 아직 승인되지 않았습니다.');
      const label = kind === 'questions' ? '시험지' : '답안';
      const title = round === 'recall' ? '2026 황소 복기 문제' : `TOP SECRET 마무리 모의고사 ${round}회`;
      view.document.title = `${title} ${label} · ${user.name}`;
      if (!window.pdfjsLib) throw new Error('인쇄 도구를 불러오지 못했습니다. 새로고침해 주세요.');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../../vendor/pdfjs/3.11.174/pdf.worker.min.js', location.href).href;
      const source = round === 'recall'
        ? (kind === 'questions' ? '../2026/2026-hwangso-questions.pdf' : '2026-hwangso-answers.pdf')
        : `../../materials/top-secret-finish-${round}-${kind}.pdf`;
      const url = new URL(source, location.href).href;
      pdf = await window.pdfjsLib.getDocument({ url }).promise;
      for (let no = 1; no <= pdf.numPages; no++) {
        if (view.closed) throw new Error('인쇄 창이 닫혔습니다. 다시 인쇄해 주세요.');
        const page = await pdf.getPage(no);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const sheet = view.document.createElement('section');
        sheet.className = viewport.width > viewport.height ? 'sheet landscape' : 'sheet';
        const image = view.document.createElement('img');
        image.alt = `${label} ${no}쪽`;
        image.src = canvas.toDataURL('image/png');
        const mark = view.document.createElement('div');
        mark.className = 'watermark';
        for (let i = 0; i < 3; i++) {
          const line = view.document.createElement('span');
          line.textContent = `${user.name} · 지필드 영재교육`;
          mark.appendChild(line);
        }
        sheet.append(image, mark);
        view.document.getElementById('sheets').appendChild(sheet);
        await image.decode();
        canvas.width = canvas.height = 0;
        page.cleanup();
        view.document.getElementById('progress').textContent = `${no} / ${pdf.numPages}쪽 준비`;
      }
      view.document.getElementById('progress').textContent = '인쇄 준비가 완료되었습니다.';
      const again = view.document.createElement('button');
      again.id = 'print-again';
      again.type = 'button';
      again.textContent = '인쇄하기';
      again.onclick = () => view.print();
      view.document.body.insertBefore(again, view.document.getElementById('sheets'));
      view.document.documentElement.dataset.printReady = 'true';
      view.focus();
      view.print();
    } catch (error) {
      failure = error.message || '인쇄 준비에 실패했습니다. 다시 시도해 주세요.';
      status.textContent = error.message || '인쇄 준비에 실패했습니다. 다시 시도해 주세요.';
      if (view && !view.closed) {
        view.document.getElementById('sheets')?.replaceChildren();
        view.document.getElementById('progress').textContent = status.textContent;
      }
    } finally {
      if (pdf) await pdf.destroy();
      busy = false;
      await refresh();
      if (failure) status.textContent = failure;
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => printPaper(button)));
  window.addEventListener('focus', () => { if (!busy) refresh(); });
  refresh();
})();
