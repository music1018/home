/**
 * HTML文字列をエスケープしてXSSを防止
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 簡易NGワードリストと判定
 */
const NG_WORDS = [
  '死ね', 'バカ', '殺す', 'キチガイ', 'fuck', 'shit', 'casino', 'viagra', 'crypto', 'http://', 'https://'
];

export function containsNgWord(text: string): boolean {
  const lower = text.toLowerCase();
  return NG_WORDS.some(word => lower.includes(word.toLowerCase()));
}

/**
 * Cloudflare Turnstile トークンを検証
 */
export async function verifyTurnstileToken(token: string, secretKey: string, remoteIp?: string): Promise<boolean> {
  if (!secretKey) {
    // 開発環境などでSecretKeyが未設定の場合はパスさせる等のフォールバック
    console.warn('Turnstile secret key is not set. Skipping verification.');
    return true;
  }
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data: any = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}
