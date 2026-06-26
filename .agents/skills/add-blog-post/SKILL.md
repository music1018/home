---
name: add-blog-post
description: >
  ブログ記事の新規作成スキル。Astro Content Collections の規約に従い、
  src/content/blog/ に Markdown ファイルを追加する。フロントマター、
  ファイル命名、画像配置、スラッグ設計の手順を定義する。
  「ブログ記事を追加」「新しい記事を書いて」「ポストを作成」などの
  リクエストで発火する。
---

# ブログ記事追加スキル

このスキルは、`src/content/blog/` に新しいブログ記事を追加する際の手順とルールを定義する。

---

## 1. 前提知識

### コンテンツスキーマ

記事は Astro Content Collections で管理されている。スキーマ定義は [`src/content.config.ts`](../../src/content.config.ts):

```typescript
schema: z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
})
```

### ルーティング

- 記事ファイルのパスが `src/content/blog/<filename>.md` の場合、URL は `/blog/<filename>/` になる
- `slug` フロントマターフィールドを指定すると、そちらが優先される
- ルーティングは [`src/pages/blog/[...slug].astro`](../../src/pages/blog/[...slug].astro) で処理

### レイアウト

記事は [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro) でレンダリングされる。`.prose` クラス内に展開されるため、Markdown 内の `h2`, `h3`, `p`, `ul`, `ol`, `table` 等はグローバルスタイルが適用される。

---

## 2. ファイル命名規則

```
src/content/blog/<slug>.md
```

- **ケバブケース**（小文字、ハイフン区切り）を使う
- 日本語ファイル名は **使わない**
- 簡潔かつ内容を表す英語名にする

### 良い例

```
ai-driven-development.md
multiple-ai-agents-bottleneck.md
poi-katsu-guide.md
```

### 悪い例

```
AI駆動開発.md          # 日本語NG
MyNewPost.md           # キャメルケースNG
2026-06-27-post.md     # 日付プレフィックス不要（pubDateで管理）
```

---

## 3. フロントマターテンプレート

すべての記事は以下のフロントマターから始める:

```yaml
---
title: '記事タイトル（日本語）'
description: '記事の概要説明（日本語、1〜2文）'
pubDate: 'YYYY-MM-DD'
heroImage: '/assets/blog-placeholder-1.jpg'
---
```

### フィールド詳細

| フィールド | 必須 | 型 | 説明 |
| :--- | :--- | :--- | :--- |
| `title` | ✅ | string | 記事タイトル。日本語で書く。`<title>` タグと OGP に使用される |
| `description` | ✅ | string | 1〜2文の要約。SEO メタディスクリプションに使用される |
| `pubDate` | ✅ | date | 公開日。`YYYY-MM-DD` 形式 |
| `updatedDate` | ❌ | date | 更新日。記事を大幅に改訂した場合にのみ追加 |
| `heroImage` | ❌ | string | ヒーロー画像の絶対パス。省略可 |

### heroImage について

- 既存のプレースホルダー画像を使う場合: `/assets/blog-placeholder-{1..5}.jpg`
- 記事専用の画像を用意する場合: `public/<slug>/` ディレクトリを作成し、そこに配置
  - 例: `public/ai-driven-development/hero.webp` → heroImage: `'/ai-driven-development/hero.webp'`

---

## 4. 記事本文の書き方

### 言語

- 本文は **日本語** で書く
- コードブロック内のコメントも日本語で統一

### 見出し構造

- 本文の最初の見出しは `## h2` から始める（`# h1` は使わない ― タイトルがレイアウト側で `h1` としてレンダリングされるため）
- 見出し階層を飛ばさない: `## → ### → ####`

### Markdown 記法

```markdown
## セクション見出し（h2）

本文テキスト。

### サブセクション（h3）

- 箇条書き項目
- **太字**で強調

| ヘッダー | 説明 |
| :--- | :--- |
| セル | 内容 |

> 引用ブロック

`インラインコード`

​```javascript
// コードブロック
const example = "hello";
​```
```

### 画像の埋め込み

記事内で画像を使う場合:

1. `public/<slug>/` ディレクトリに画像を配置
2. Markdown で絶対パスを指定:

```markdown
![説明テキスト](/<slug>/image-name.webp)
```

または HTML タグでサイズ制御:

```html
<img src="/<slug>/image-name.png" alt="説明" style="width:100%;max-width:800px;margin:auto;" />
```

---

## 5. 手順チェックリスト

記事を新規作成する際は以下の順序で作業する:

```
1. ファイル作成
   → src/content/blog/<slug>.md を作成
   → verify: ファイル名がケバブケースであること

2. フロントマター記入
   → テンプレートに従い必須フィールドをすべて記入
   → verify: title, description, pubDate が存在すること

3. 本文執筆
   → h2 から始まる見出し構造で記事を書く
   → verify: h1 を使っていないこと

4. 画像配置（必要な場合）
   → public/<slug>/ に画像を配置
   → heroImage フィールドにパスを設定
   → verify: パスが正しく画像が表示されること

5. 動作確認
   → npm run dev で開発サーバーを起動
   → /blog/ 一覧に記事が表示されること
   → /blog/<slug>/ で記事が正しくレンダリングされること
   → verify: レイアウト崩れがないこと

6. コミット
   → feat: add blog post on <topic> の形式でコミット
```

---

## 6. 既存記事一覧（参考）

| ファイル名 | タイトル | pubDate |
| :--- | :--- | :--- |
| `ai-driven-development.md` | AI駆動開発ガイド | 2026-06-27 |
| `multiple-ai-agents-bottleneck.md` | 複数AIエージェント運用時のボトルネックを設計で解消 | 2026-06-27 |
| `poi-katsu-guide.md` | ポイ活のおすすめサイトと賢い稼ぎ方 | 2026-06-26 |
| `self-affiliate-roadmap.md` | 自己アフィリエイトの完全ロードマップ | 2026-06-26 |
| `side-hustle-scam-defense.md` | 副業詐欺に騙されないための3つの防衛策 | 2026-06-26 |

---

## 7. よくあるミス

| ミス | 修正方法 |
| :--- | :--- |
| `pubDate` を引用符なしの数値で書く | 文字列 `'YYYY-MM-DD'` またはそのまま `YYYY-MM-DD` で記入（どちらも `z.coerce.date()` でパースされる） |
| `heroImage` のパスに `public/` を含める | `public/` は省略。`/assets/image.jpg` のように `/` 始まりで書く |
| 見出しを `#` (h1) で始める | `##` (h2) から始める。h1 はレイアウトが出力する |
| ファイル名に日本語を使う | ケバブケースの英語名にする |
| 画像を `src/` に置く | 画像は `public/` に置く。Astro のビルドパイプライン外で直接配信される |
