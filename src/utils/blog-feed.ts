export interface BlogPost {
  title: string;
  date: string;
  datetime: string;
  url: string;
}

const BLOG_FEED_TIMEOUT_MS = 2500;

export async function getBlogPosts(feedUrl: string, maxPosts: number): Promise<BlogPost[]> {
  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(BLOG_FEED_TIMEOUT_MS),
      headers: {
        accept: 'application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1'
      }
    });

    if (!response.ok) {
      throw new Error(`Feed request failed with status ${response.status}`);
    }

    const xml = await response.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

    return entries
      .slice(0, maxPosts)
      .map((entry) => {
        const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '';
        const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1]
          ?? entry.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1]
          ?? '';
        const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]
          ?? entry.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]
          ?? '';

        const dateObj = new Date(published);
        if (!title || !link || Number.isNaN(dateObj.getTime())) {
          return null;
        }

        return {
          title,
          date: `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`,
          datetime: dateObj.toISOString().split('T')[0],
          url: link
        };
      })
      .filter((post): post is BlogPost => post !== null);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Failed to fetch blog feed from ${feedUrl}: ${message}`);
    return [];
  }
}
