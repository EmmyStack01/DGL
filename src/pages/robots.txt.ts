import type { APIRoute } from 'astro';
export const prerender = true;
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;
  const robotsTxt = `
User-agent: *
Allow: /

# Block Keystatic Admin from indexers
Disallow: /keystatic/
Disallow: /api/

Sitemap: ${sitemapUrl}
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};