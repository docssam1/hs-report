'use strict';
(() => {
  const player = document.getElementById('player');
  const poster = document.getElementById('play').cloneNode(true);
  const status = document.getElementById('access-status');
  const slides = document.getElementById('slides-link');
  let checking;
  let config;
  function button() { return document.getElementById('play'); }
  function deny(error) {
    if (!button()) player.replaceChildren(poster.cloneNode(true));
    button().disabled = true;
    button().querySelector('.play-label').textContent = error.message;
    status.textContent = error.message;
    slides.removeAttribute('href');
    slides.setAttribute('aria-disabled', 'true');
    config = null;
  }
  async function refresh() {
    if (!window.GFIELD_SEMINAR_ACCESS?.requireApproval) {
      deny(new Error('승인 확인 도구를 불러오지 못했습니다. 새로고침해 주세요.'));
      return null;
    }
    if (checking) return checking;
    if (button()) button().disabled = true;
    checking = window.GFIELD_SEMINAR_ACCESS.requireApproval().then(user => {
      status.textContent = `${user.name} · 시청 승인 완료`;
      slides.href = '../2026/';
      slides.setAttribute('aria-disabled', 'false');
      if (button()) {
        button().disabled = false;
        button().querySelector('.play-label').textContent = '설명회 영상 재생';
      }
      return user;
    }).catch(error => { deny(error); return null; }).finally(() => { checking = null; });
    return checking;
  }
  async function loadConfig() {
    if (config) return config;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'video-config.js?v=20261108';
      script.onload = () => { script.remove(); resolve(); };
      script.onerror = () => { script.remove(); reject(new Error('영상을 불러오지 못했습니다. 다시 시도해 주세요.')); };
      document.head.appendChild(script);
    });
    config = window.GFIELD_SEMINAR_VIDEO;
    if (!/^[A-Za-z0-9_-]+$/.test(config?.driveId || '')) throw new Error('영상을 불러오지 못했습니다. 다시 시도해 주세요.');
    return config;
  }
  player.addEventListener('click', async event => {
    if (!event.target.closest('#play') || button()?.disabled) return;
    const user = await refresh();
    if (!user) return;
    button().disabled = true;
    try {
      const video = await loadConfig();
      const current = await window.GFIELD_SEMINAR_ACCESS.requireApproval();
      if (current.name !== user.name) throw new Error('로그인한 회원이 변경되었습니다. 새로고침해 주세요.');
      const frame = document.createElement('iframe');
      frame.src = `https://drive.google.com/file/d/${video.driveId}/preview`;
      frame.title = '2026 생각하는 황소 초등 선발 분석 설명회 영상';
      frame.allow = 'autoplay; encrypted-media; fullscreen';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
      frame.referrerPolicy = 'no-referrer';
      frame.allowFullscreen = true;
      player.replaceChildren(frame);
      frame.focus();
    } catch (error) { deny(error); }
  });
  slides.addEventListener('click', async event => {
    event.preventDefault();
    if (await refresh()) location.href = '../2026/';
  });
  for (const type of ['contextmenu', 'copy', 'cut', 'dragstart']) {
    document.querySelector('main').addEventListener(type, event => {
      if (!event.target.closest('input,textarea,[contenteditable="true"]')) event.preventDefault();
    });
  }
  window.addEventListener('focus', refresh);
  window.addEventListener('storage', () => { deny(new Error('로그인 상태를 확인하고 있습니다.')); refresh(); });
  refresh();
})();
