import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { d1, r2, kvCache } from '@emdash-cms/cloudflare';
import { defineConfig } from 'astro/config';
import emdash from 'emdash/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  experimental: {
    routeRules: {
      '/': { maxAge: 600 },
      '/posts': { maxAge: 86400 },
      '/posts/[category]': { maxAge: 86400 },
      '/post/[slug]': { maxAge: 86400 },
      '/[slug]': { maxAge: 86400 },
      '/rss.xml': { maxAge: 86400 },
    },
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      objectCache: kvCache({ binding: 'CACHE' }),
    }),
  ],

  devToolbar: { enabled: false },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "styles/modules" as *;
            @use "sass:color";
        `,
          loadPaths: ['src'],
        },
      },
    },
  },
});
