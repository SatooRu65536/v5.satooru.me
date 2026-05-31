import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { d1, r2 } from '@emdash-cms/cloudflare';
import { defineConfig } from 'astro/config';
import emdash from 'emdash/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
    }),
  ],

  optimizeDeps: {
    exclude: [
      'emdash',
      'emdash/runtime',
      'emdash/ui',
      'emdash/media/local-runtime',
      '@emdash-cms/cloudflare/db/d1',
      '@emdash-cms/cloudflare/storage/r2',
    ],
  },

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
