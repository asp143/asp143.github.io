export const DESKTOP_GATE = '(min-width: 1024px) and (pointer: fine)';

export function shouldRedirectToDesktop(): boolean {
  return navigator.webdriver !== true
    && window.self === window.top
    && window.matchMedia(DESKTOP_GATE).matches;
}
