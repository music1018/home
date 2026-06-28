import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { likes } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCloudflareEnv } from '../../utils/env';

export const prerender = false;

// ローカルメモリフォールバック用（devサーバー用）
const memoryLikes = new Map<string, number>();

export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  const env = await getCloudflareEnv(locals);
  if (!env || !env.DB) {
    // ローカル開発用メモリフォールバック
    const count = memoryLikes.get(slug) || 0;
    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const result = await db.select().from(likes).where(eq(likes.slug, slug)).get();
    return new Response(JSON.stringify({ count: result ? result.count : 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.warn('D1 query fallback to memory:', error.message);
    const count = memoryLikes.get(slug) || 0;
    return new Response(JSON.stringify({ count }), { status: 200 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { slug, increment = 1 } = body;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    const amount = Math.min(Math.max(1, Number(increment) || 1), 50);
    const env = await getCloudflareEnv(locals);

    if (!env || !env.DB) {
      const current = memoryLikes.get(slug) || 0;
      const next = current + amount;
      memoryLikes.set(slug, next);
      return new Response(JSON.stringify({ count: next }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const db = getDb(env.DB);
      const now = new Date().toISOString();

      await db.insert(likes)
        .values({ slug, count: amount, updatedAt: now })
        .onConflictDoUpdate({
          target: likes.slug,
          set: {
            count: sql`${likes.count} + ${amount}`,
            updatedAt: now,
          },
        });

      const updated = await db.select().from(likes).where(eq(likes.slug, slug)).get();
      return new Response(JSON.stringify({ count: updated?.count ?? 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (dbErr: any) {
      console.warn('D1 insert fallback to memory:', dbErr.message);
      const current = memoryLikes.get(slug) || 0;
      const next = current + amount;
      memoryLikes.set(slug, next);
      return new Response(JSON.stringify({ count: next }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
