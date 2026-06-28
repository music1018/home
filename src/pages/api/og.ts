import type { APIRoute } from 'astro';
import { SITE_TITLE } from '../../consts';

export const prerender = false;

// テキストを複数行に折り返すヘルパー関数
function wrapText(text: string, maxCharsPerLine: number = 18): string[] {
	const lines: string[] = [];
	let currentLine = '';

	for (let i = 0; i < text.length; i++) {
		currentLine += text[i];
		if (currentLine.length >= maxCharsPerLine) {
			lines.push(currentLine);
			currentLine = '';
		}
	}
	if (currentLine) {
		lines.push(currentLine);
	}
	return lines.slice(0, 4); // 最大4行まで表示
}

export const GET: APIRoute = async ({ url }) => {
	const titleParam = url.searchParams.get('title') || SITE_TITLE;
	const lines = wrapText(titleParam, 16);
	const lineHeight = 70;
	const startY = 250 - ((lines.length - 1) * lineHeight) / 2;

	const textElements = lines
		.map(
			(line, index) =>
				`<text x="600" y="${startY + index * lineHeight}" font-family="sans-serif" font-size="54" font-weight="bold" fill="#EAF1F8" text-anchor="middle">${escapeXml(line)}</text>`
		)
		.join('');

	const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<!-- ダークグラデーション背景 -->
		<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="#031A38" />
			<stop offset="50%" stop-color="#0466C8" />
			<stop offset="100%" stop-color="#011627" />
		</linearGradient>
		<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stop-color="#00F2FE" />
			<stop offset="100%" stop-color="#4FACFE" />
		</linearGradient>
		<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="40" result="blur" />
			<feComposite in="SourceGraphic" in2="blur" operator="over" />
		</filter>
	</defs>

	<!-- 背景 -->
	<rect width="1200" height="630" fill="url(#bg)" />

	<!-- 装飾的な光のグロー -->
	<circle cx="200" cy="150" r="180" fill="#00F2FE" opacity="0.15" filter="url(#glow)" />
	<circle cx="1000" cy="480" r="220" fill="#4FACFE" opacity="0.12" filter="url(#glow)" />

	<!-- 内側のガラスフレーム -->
	<rect x="50" y="50" width="1100" height="530" rx="24" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2" />

	<!-- サイトブランドロゴヘッダー -->
	<g transform="translate(100, 110)">
		<rect x="0" y="0" width="10" height="32" rx="5" fill="url(#accent)" />
		<text x="24" y="24" font-family="sans-serif" font-size="24" font-weight="600" fill="#7D8597" letter-spacing="2">${escapeXml(SITE_TITLE.toUpperCase())}</text>
	</g>

	<!-- 動的タイトル文章 -->
	<g>
		${textElements}
	</g>

	<!-- フッター装飾・アクセントライン -->
	<rect x="100" y="510" width="1000" height="4" rx="2" fill="url(#accent)" opacity="0.8" />
	<text x="1100" y="490" font-family="sans-serif" font-size="18" fill="#979DAC" text-anchor="end">music1018.home</text>
</svg>
`.trim();

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
