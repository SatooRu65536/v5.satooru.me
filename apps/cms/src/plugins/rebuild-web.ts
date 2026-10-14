import { definePlugin } from 'emdash';
import type { PluginCapability, PluginContext, PluginDescriptor } from 'emdash';

// 公開状態が変わったときに GitHub Actions へ repository_dispatch を送り、公開サイト (SSG) を再ビルドさせる。
// Workers 無料プランでは sandboxed プラグインが使えないため、native プラグインとして CMS の Worker 内で動かす。

const ID = 'rebuild-web';
const VERSION = '0.1.0';
const CAPABILITIES: PluginCapability[] = ['content:read'];

export interface RebuildWebOptions {
  /** `owner/name` */
  repository: string;
  /** deploy-web.yml の `repository_dispatch.types` と一致させる */
  eventType: string;
}

export function rebuildWebPlugin(options: RebuildWebOptions): PluginDescriptor<RebuildWebOptions> {
  return {
    id: ID,
    version: VERSION,
    format: 'native',
    entrypoint: new URL(import.meta.url).pathname,
    capabilities: CAPABILITIES,
    options,
  };
}

export function createPlugin(options: RebuildWebOptions) {
  const dispatch = async (reason: string, collection: string, ctx: PluginContext) => {
    // wrangler secret put GITHUB_DISPATCH_TOKEN で設定する (Contents: write の fine-grained PAT)
    const token = process.env.GITHUB_DISPATCH_TOKEN;
    if (!token) {
      ctx.log.warn('GITHUB_DISPATCH_TOKEN が未設定のため再ビルドをスキップ', { reason, collection });
      return;
    }

    const res = await fetch(`https://api.github.com/repos/${options.repository}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'cms-satooru-me',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: options.eventType,
        client_payload: { reason, collection },
      }),
    });

    if (!res.ok) {
      ctx.log.error('repository_dispatch に失敗', { status: res.status, body: await res.text() });
      return;
    }
    ctx.log.info('公開サイトの再ビルドを依頼', { reason, collection });
  };

  return definePlugin({
    id: ID,
    version: VERSION,
    capabilities: CAPABILITIES,
    hooks: {
      // 公開済み記事の保存は下書きの更新のみで公開内容は変わらないため、afterSave では発火させない
      'content:afterPublish': async (event, ctx) => dispatch('publish', event.collection, ctx),
      'content:afterUnpublish': async (event, ctx) => dispatch('unpublish', event.collection, ctx),
      'content:afterDelete': async (event, ctx) => dispatch('delete', event.collection, ctx),
    },
  });
}
