'use strict';
(() => {
  const config = window.GFIELD_SEMINAR_VIDEO;
  const button = document.getElementById('play');
  const link = document.getElementById('drive-link');
  if (!config || !/^[A-Za-z0-9_-]+$/.test(config.driveId || '')) {
    button.disabled = true;
    button.querySelector('.play-label').textContent = '영상을 불러오지 못했습니다. 새로고침해 주세요.';
    return;
  }
  const base = `https://drive.google.com/file/d/${config.driveId}`;
  link.href = `${base}/view`;
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `${base}/preview`;
    frame.title = '2026 생각하는 황소 초등 선발 분석 설명회 영상';
    frame.allow = 'autoplay; encrypted-media; fullscreen';
    frame.allowFullscreen = true;
    document.getElementById('player').replaceChildren(frame);
    frame.focus();
  }, { once: true });
})();
