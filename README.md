# r — Portfolio & Blog

**r** のポートフォリオ兼ブログサイト。  
深海をモチーフにしたダークテーマで、スクロールに連動した深度演出と日本語タイポグラフィで構成。

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [Astro 7](https://astro.build/) (SSR) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Content | Astro Content Collections (Markdown / MDX) |
| Styling | Vanilla CSS (dark deep-sea theme) |
| Fonts | Shippori Mincho · Zen Kaku Gothic New · IBM Plex Mono |

## ✨ Features

- 🌊 深海ダイブをテーマにしたスクロール連動 UI
- 📝 Markdown / MDX によるブログ機能
- 🎮 スタンドアロンのミニアプリ群（Mars, Othello, Sound, Pressure, Password, CopyCraft）
- 📊 AI モデル比較リファレンスページ
- 🗺 サイトマップ & RSS フィード自動生成
- ⚡ Cloudflare Workers でエッジ配信

## 📁 Project Structure

```
├── public/                  # 静的アセット（ミニアプリ含む）
│   ├── mars/                #   火星植民ゲーム
│   ├── othello/             #   オセロ AI シミュレータ
│   ├── sound/               #   サウンドジェネレータ
│   ├── pressure/            #   気圧シミュレータ
│   ├── password/            #   パスワードジェネレータ
│   ├── copycraft/           #   AI CopyCraft
│   └── models/              #   AI モデルリファレンス
├── src/
│   ├── components/          # Astro コンポーネント
│   ├── content/blog/        # ブログ記事 (Markdown)
│   ├── layouts/             # レイアウト (BlogPost.astro)
│   ├── pages/               # ルートページ
│   └── styles/global.css    # グローバル CSS（デザイントークン）
├── astro.config.mjs         # Astro 設定
├── wrangler.jsonc            # Cloudflare Workers 設定
└── package.json
```

## 🧞 Commands

```bash
npm install          # 依存パッケージのインストール
npm run dev          # 開発サーバー起動 (localhost:4321)
npm run build        # 本番ビルド → ./dist/
npm run preview      # ビルド + wrangler dev (ローカルプレビュー)
npm run deploy       # ビルド + wrangler deploy (Cloudflare にデプロイ)
```

> **Note:** パッケージマネージャは `npm` を使用してください。

## 🚀 Deployment

```bash
npm run deploy
```

`npm run build` で `./dist/` にビルドし、`wrangler deploy` で Cloudflare Workers にデプロイします。

## 📄 License

Private repository.
