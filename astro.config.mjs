import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dangraciousland.pages.dev', // Replace with the actual school domain or pages.dev preview URL
  trailingSlash: 'ignore',
  output: 'server', // Keystatic requires SSR engine for the admin dashboard API routes
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    keystatic(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/keystatic') &&
        !page.includes('/api/') &&
        !page.includes('/launchpad') &&
        !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.9,
      lastmod: new Date(),
      serialize(item) {
        // Clean trailing slashes for all pages
        item.url = item.url.replace(/\/$/, '');
        return item;
      }
    }),
  ],
  vite: {
    ssr: {
      external: ['node:authtoken', 'node:fs', 'node:path', 'node:crypto'],
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          banner: `if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { onmessage: null, postMessage: () => {} };
      this.port2 = { onmessage: null, postMessage: () => {} };
    }
  };
}`,
        },
      },
    },
  },
});
