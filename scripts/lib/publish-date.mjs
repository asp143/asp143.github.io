export function isPublishablePubDate(pubDate, now = Date.now()) {
  if (pubDate == null || pubDate === '') return true;

  const publishTime = new Date(pubDate).valueOf();
  return Number.isNaN(publishTime) || publishTime <= now;
}
