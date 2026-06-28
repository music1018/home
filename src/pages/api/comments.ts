import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { comments } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { escapeHtml, containsNgWord, verifyTurnstileToken } from '../../utils/security';
import { getCloudflareEnv } from '../../utils/env';

export const prerender = false;

// ローカルメモリフォールバック用（devサーバー用）
const memoryComments = new Map<string, Array<{ id: string; author: string; content: string; createdAt: string }>>();

export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  const env = await getCloudflareEnv(locals);
  if (!env || !env.DB) {
    const list = memoryComments.get(slug) || [];
    return new Response(JSON.stringify({ comments: list }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const list = await db
      .select({
        id: comments.id,
        author: comments.author,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.slug, slug))
      .orderBy(desc(comments.createdAt))
      .all();

    return new Response(JSON.stringify({ comments: list }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.warn('D1 query comments fallback to memory:', error.message);
    const list = memoryComments.get(slug) || [];
    return new Response(JSON.stringify({ comments: list }), { status: 200 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { slug, author, content, turnstileToken } = body;

    if (!slug || !content) {
      return new Response(JSON.stringify({ error: 'slugと本文は必須です。' }), { status: 400 });
    }

    if (content.length > 500) {
      return new Response(JSON.stringify({ error: 'コメントは500文字以内で入力してください。' }), { status: 400 });
    }

    if (containsNgWord(content) || containsNgWord(author || '')) {
      return new Response(JSON.stringify({ error: '不適切な表現（NGワード）が含まれているため投稿できません。' }), { status: 400 });
    }

    const env = await getCloudflareEnv(locals);
    const turnstileSecret = env?.TURNSTILE_SECRET_KEY || '';
    const remoteIp = request.headers.get('cf-connecting-ip') || undefined;

    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken, turnstileSecret, remoteIp);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'スパム検証 (Turnstile) に失敗しました。' }), { status: 400 });
      }
    }

    const cleanAuthor = escapeHtml(author?.trim() || '匿名');
    const cleanContent = escapeHtml(content.trim());
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newComment = { id, author: cleanAuthor, content: cleanContent, createdAt };

    if (!env || !env.DB) {
      const list = memoryComments.get(slug) || [];
      memoryComments.set(slug, [newComment, ...list]);
      return new Response(
        JSON.stringify({ success: true, comment: newComment }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const db = getDb(env.DB);
      await db.insert(comments).values({
        id,
        slug,
        author: cleanAuthor,
        content: cleanContent,
        createdAt,
      });
    } catch (dbErr: any) {
      console.warn('D1 insert comment fallback to memory:', dbErr.message);
      const list = memoryComments.get(slug) || [];
      memoryComments.set(slug, [newComment, ...list]);
    }

    return new Response(
      JSON.stringify({ success: true, comment: newComment }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = await getCloudflareEnv(locals);
  const adminSecret = request.headers.get('x-admin-secret');
  const expectedSecret = env?.ADMIN_SECRET;

  if (!expectedSecret || adminSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: '権限がありません。' }), { status: 403 });
  }

  const { id, slug } = await request.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
  }

  if (env?.DB) {
    try {
      const db = getDb(env.DB);
      await db.delete(comments).where(eq(comments.id, id));
    } catch (e) {
      // ignore
    }
  }
  if (slug && memoryComments.has(slug)) {
    const list = memoryComments.get(slug) || [];
    memoryComments.set(slug, list.filter(c => c.id !== id));
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
