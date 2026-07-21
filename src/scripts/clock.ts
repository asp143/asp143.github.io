/**
 * ralphOS menubar clock — fills [data-os-clock] with HH:MM. SSR renders the
 * element empty (aria-hidden), so no-JS just shows nothing. 30s tick,
 * paused while the tab is hidden.
 */

function initClock(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-os-clock]');
  if (!els.length) return;

  const render = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    els.forEach((el) => {
      el.textContent = `${hh}:${mm}`;
    });
  };

  let timer: number | undefined;
  const start = () => {
    window.clearInterval(timer);
    render();
    timer = window.setInterval(render, 30_000);
  };
  const stop = () => window.clearInterval(timer);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClock, { once: true });
} else {
  initClock();
}
