import react from '@astrojs/react';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  site: 'https://satooru.me',
  output: 'static',
  // 旧サイトと同じ末尾スラッシュなしの URL (/posts, /post/114) で配信する
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react()],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  env: {
    schema: {
      CMS_URL: envField.string({
        context: 'server',
        access: 'public',
        default: 'https://cms.satooru.me',
      }),
      CMS_API_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      // Cloudflare Access の Service Token (CMS が Access で保護されている場合に必要)
      CF_ACCESS_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      CF_ACCESS_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      API_BASE_URL: envField.string({
        context: 'server',
        access: 'public',
        default: 'https://api.satooru.me',
      }),
    },
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
