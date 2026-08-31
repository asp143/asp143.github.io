export function slugFromHref(href: string): string {
  try {
    const path = new URL(href).pathname;
    const match = path.match(/^\/blog\/([^/]+)\/?$/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}
