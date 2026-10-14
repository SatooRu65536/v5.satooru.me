import type { APIRoute } from 'astro';
import { getSiteSettings } from '@/lib/cms';
import { getPosts, postDate } from '@/lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site!.toString().replace(/\/$/, '');
  const settings = await getSiteSettings();
  const siteTitle = settings.title || 'My Profile';
  const siteDescription = settings.tagline || 'Design & Development';

  const posts = (await getPosts()).slice(0, 20);

  const items = posts
    .map((post) => {
      const pubDate = new Date(postDate(post)).toUTCString();

      const postUrl = `${siteUrl}/post/${post.slug}`;
      const title = escapeXml(post.data.title || 'Untitled');
      const description = escapeXml(post.data.excerpt || '');

      return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};

const XML_ESCAPE_PATTERNS = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
] as const;

function escapeXml(str: string): string {
  let result = str;
  for (const [pattern, replacement] of XML_ESCAPE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
