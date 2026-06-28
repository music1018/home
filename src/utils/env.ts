export async function getCloudflareEnv(locals: any): Promise<any> {
  // 1. Astro v6+ / Cloudflare Workers モジュールからの取得試行
  try {
    const cf = await import('cloudflare:workers');
    if (cf && cf.env) return cf.env;
  } catch (e) {
    // Vite Dev モード等で cloudflare:workers が解決できない場合
  }

  // 2. locals.runtime 経由（安全なプロパティアクセス）
  try {
    if (locals && locals.runtime) {
      // getterの例外を回避するためプロパティが存在するかチェック
      const runtime = locals.runtime;
      if ('env' in runtime && (runtime as any).env) {
        return (runtime as any).env;
      }
    }
  } catch (e) {
    // ignore
  }

  return process.env || {};
}
