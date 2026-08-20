export const NOINDEX_PATH_PREFIXES = ['/blog/tags/'];

export function isNoindexPath(pathname) {
  return NOINDEX_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
