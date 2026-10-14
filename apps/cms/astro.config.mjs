import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { access, d1, r2 } from '@emdash-cms/cloudflare';
import { defineConfig } from 'astro/config';
import emdash from 'emdash/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA', publicUrl: 'https://media.satooru.me' }),
      // 開発時は Access の JWT が無いため、EmDash がパスキー認証にフォールバックする
      auth: access({
        teamDomain: 'satooru.cloudflareaccess.com',
        audienceEnvVar: 'CF_ACCESS_AUDIENCE',
        // EmDash に登録済みのユーザー以外は Access を通過しても拒否する
        autoProvision: false,
      }),
    }),
  ],

  devToolbar: { enabled: false },
});
