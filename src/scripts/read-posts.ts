const STORAGE_KEY = 'blog:read';

function loadReadSlugs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getReadSlugs(): Set<string> {
  return new Set(Object.keys(loadReadSlugs()));
}

export function markPostRead(slug: string): void {
  if (!slug) return;
  try {
    const read = loadReadSlugs();
    if (read[slug]) return;
    read[slug] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
  } catch {
    /* localStorage unavailable; badge just stays visible */
  }
}
