# AGENTS.md

## プロジェクト概要

**r** の個人ポートフォリオ＆ブログサイト。Astro v7で構築され、`@astrojs/cloudflare` 経由で **Cloudflare Workers** にデプロイされています。ビジュアルテーマは「深海ダイブ」をモチーフにしており、ダークブルーの背景、スクロール連動の深さエフェクト、および日本語タイポグラフィを採用しています。

**モノリポではありません。** パッケージマネージャーに `npm` を使用した単一の Astro プロジェクトです。

## 技術スタック

| レイヤー | 技術 |
| :--- | :--- |
| フレームワーク | Astro 7 (Cloudflare アダプター経由の SSR モード) |
| コンテンツ | Astro Content Collections (Markdown / MDX) |
| スタイリング | Vanilla CSS (`src/styles/global.css` + `.astro` ファイル内のスコープ付き `<style>`) |
| フォント | Google Fonts — しっぽり明朝, Zen 角ゴシック, IBM Plex Mono |
| ホスティング | Cloudflare Workers + Assets (`wrangler.jsonc`, ワーカー名: `home`) |
| 画像処理 | `sharp` (Cloudflare `passthrough` 画像サービスを利用) |
| 統合パッケージ | `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss` |

## ディレクトリ構造

```
├── public/                  # そのまま配信される静的アセット
│   ├── favicon.svg          # SVG ファビコン
│   ├── ai-driven-development/ # ブログ記事用画像
│   ├── mars/                # 火星開拓ゲーム (スタンドアロン HTML)
│   ├── othello/             # オセロ AI シミュレーター (スタンドアロン HTML)
│   ├── sound/               # サウンドジェネレーター ミニアプリ
│   ├── pressure/            # 圧力シミュレーター ミニアプリ
│   ├── password/            # パスワードジェネレーター ミニアプリ
│   ├── copycraft/           # AI CopyCraft ミニアプリ
│   ├── models/              # AIモデル参照ページ用アセット
│   └── assets/              # 共有静的アセット
├── src/
│   ├── assets/fonts/        # ローカルフォントファイル (Atkinson woff)
│   ├── components/          # Astro コンポーネント (BaseHead, Header, Footer など)
│   ├── content/blog/        # ブログ記事 (Markdown)
│   ├── content.config.ts    # コンテンツコレクションスキーマ (title, description, pubDate, heroImage)
│   ├── consts.ts            # サイト全体の定数 (SITE_TITLE, SITE_DESCRIPTION)
│   ├── layouts/             # BlogPost.astro レイアウト
│   ├── pages/               # ルーティングページ
│   │   ├── index.astro      # ホームページ (深海スクロール UI のポートフォリオ)
│   │   ├── about.astro      # About ページ
│   │   ├── people.astro     # People ページ
│   │   ├── ai-driven-development.astro  # AI 開発関連記事ページ
│   │   ├── blog/            # ブログ一覧＆ [slug] ルーティング
│   │   └── rss.xml.js       # RSS フィードエンドポイント
│   └── styles/global.css    # グローバル CSS (カラーキー、タイポグラフィ、リセット)
├── astro.config.mjs         # Astro 設定 (MDX, sitemap, fonts, Cloudflare アダプター)
├── wrangler.jsonc           # Cloudflare Workers 設定
├── tsconfig.json            # TypeScript (strict, astro/tsconfigs/strict を継承)
└── package.json             # npm スクリプトと依存関係
```

## コマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | Astro 開発サーバーの起動 (`localhost:4321`) |
| `npm run build` | プロダクションビルド → `./dist/` |
| `npm run preview` | ビルド + `wrangler dev` (ローカルでの Cloudflare プレビュー) |
| `npm run deploy` | ビルド + `wrangler deploy` (Cloudflare へのデプロイ) |
| `npm run generate-types` | Wrangler 経由で Cloudflare Worker の型を生成 |

`pnpm` や `yarn` などの他のパッケージマネージャーは使用しないでください。このプロジェクトでは `npm` を使用します。

## コーディング規約

### 言語とロケール
- サイトの言語は **日本語** です (`<html lang="ja">`)。
- コードコメントは既存のものが日本語であればそれに合わせ、周囲のスタイルと統一してください。

### スタイリング
- **Tailwind は使用しません。** Vanilla CSS のみを使用してください。
- グローバルなデザイントークンは `src/styles/global.css` の `:root` 下で定義されています。
- ページ固有のスタイルは `.astro` ファイル内のスコープ付き `<style>` ブロックに記述します。
- カラーパレットはダークな深海テーマ（ブルー、グレー、ダーク背景にライトテキスト）に準拠しています。
- 主要な CSS 変数: `--bg-deep`, `--ink`, `--ink-body`, `--ink-sub`, `--font-display`, `--font-body`, `--font-mono`。

### コンテンツ
- ブログ記事は `src/content/blog/` 内に `.md` または `.mdx` ファイルとして配置します。
- フロントマターのスキーマ: `title` (文字列), `description` (文字列), `pubDate` (日付), `updatedDate` (日付, 任意), `heroImage` (文字列, 任意)。
- ブログ記事用の画像は `public/` に配置し、絶対パス（例: `/ai-driven-development/hero.webp`）で参照します。

### コンポーネント
- すべてのコンポーネントは `.astro` ファイルです（現在 React / Vue / Svelte は使用していません）。
- `BaseHead.astro` は `<head>` メタタグ、OGP、ファビコンを処理します。
- `Header.astro` / `Footer.astro` はグローバルなナビゲーションシェルを提供します。

### ミニアプリ
- いくつかのスタンドアロン HTML ミニアプリが `public/` 下に存在します (mars, othello, sound, pressure, password, copycraft)。
- これらは自己完結型（HTML + インライン JS/CSS）であり、Astro のビルドパイプラインには含まれません。
- ホームページ (`index.astro`) からリンクされています。

## コミット規約

小文字の動詞プレフィックスを使用した **Conventional Commits** に従って日本語で生成してください:

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントのみの変更
refactor: 機能追加やバグ修正を伴わないコード変更
chore: 雑多なタスクやメンテナンスタスク
```

ミニアプリの場合はスコープ付きプレフィックスを使用します: `feat(mars):`, `fix(othello):` など。

## デプロイ

1. `npm run build` — Astro が `./dist/` にビルドします。
2. `wrangler deploy` — Cloudflare Workers にアップロードします。

Wrangler の設定 (`wrangler.jsonc`) は、メインエントリーとして `@astrojs/cloudflare/entrypoints/server` を使用し、静的アセットとして `./dist` を配信します。