export const NOINDEX_PATH_PREFIXES = ['/blog/tags'];

export function isNoindexPath(pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}
