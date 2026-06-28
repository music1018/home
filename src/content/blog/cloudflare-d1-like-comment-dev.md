---
title: 'Cloudflare D1とDrizzle ORMで作る完全無料の「いいね＆コメント」機能とトラブルシューティング'
description: 'Astro v7 + Cloudflare Workers環境でD1を用いたインタラクティブ機能の構築、XSSやTurnstileによるセキュリティ対策、プロビジョニング・デプロイエラーの完全克服ガイド。'
pubDate: '2026-06-28'
heroImage: '/assets/blog-placeholder-1.jpg'
---

個人ブログやポートフォリオに「いいね」ボタンや「コメント欄」を導入したいと考えたとき、ネックになるのが**サーバー・データベースの維持コスト**と**スパム・セキュリティリスク**です。

今回、当ブログ（Astro v7 + Cloudflare Workers）において、完全無料の範囲で低遅延かつ高セキュリティな「いいね」＆「コメント」機能を構築しました。本記事では、そのアーキテクチャ設計から、実装時のセキュリティ対策、そして実際に遭遇したCloudflare特有のデプロイエラーの解決策までを網羅して解説します。

---

## 技術スタックとアーキテクチャ

今回の機能構築にあたり、以下の技術スタックを選定しました。

| レイヤー | 採用技術 | 選定理由・特徴 |
| :--- | :--- | :--- |
| **Database** | Cloudflare D1 | サーバーレスSQLite。Cloudflare Workersと同一エッジで動作し超低遅延＆完全無料枠 |
| **ORM** | Drizzle ORM | 軽量・型安全でD1との相性が抜群 |
| **Frontend** | Astro v7 / Vanilla JS | フレームワーク非依存。Optimistic UI & デバウンス連打バッチ通信 |
| **Security** | Cloudflare Turnstile | Bot・スパム対策（ログイン不要のUXを維持） |

```
[ 読者 (Browser) ]
      │
      ├── (いいねクリック / デバウンス一括送信)
      ├── (コメント投稿 / Turnstile & XSS検証)
      ▼
[ Cloudflare Workers (Astro SSR API Route) ]
      │
      ▼ ( Worker Binding / zero API keys exposed )
[ Cloudflare D1 Database ]
```

---

## 主な機能と設計の工夫

### 1. 連打対応の「いいね」ボタン（バッチ最適化）
読者が気持ちよく「いいね」を連打できるよう、フロントエンド側で**デバウンス（Debounce）処理**を実装しました。

クリックごとにローカルのカウントを即時アップ（Optimistic UI）しつつ、無操作状態が約700ms続いたタイミングで加算数をまとめて1回のAPIリクエスト（`POST /api/likes`）として送信します。これにより、DBへの書き込みリクエスト数を大幅に削減し、D1の無料枠を効率的に利用できます。

### 2. セキュリティ重視のコメント欄
ログイン不要の手軽さを実現しつつ、以下の多重防御を施しました。

- **XSS（クロスサイトスクリプティング）対策**: 投稿された名前・本文はサーバーサイドで厳格にHTMLエスケープ処理を実施。
- **NGワード自動フィルタリング**: 誹謗中傷やスパムキーワードが含まれる投稿を自動判定して弾くロジックを搭載。
- **Turnstile検証**: Cloudflare Turnstileのトークンをバックエンドで検証し、Botによる自動連投を遮断。

---

## 開発中に遭遇したトラブルと解決策

開発およびCloudflare環境へのデプロイにおいて、いくつか特有のエラーに遭遇しました。今後同じ構成を組む方のためのナレッジとして共有します。

### ① `Astro.locals.runtime.env` の非推奨・例外エラー
**現象:**
Astro v6/v7へのアップデートに伴い、APIルート内で `locals.runtime.env` へアクセスした際に以下のエラーが発生。
```text
TypeError: Astro.locals.runtime.env has been removed in Astro v6. Use 'import { env } from "cloudflare:workers"' instead.
```
**解決策:**
`cloudflare:workers` モジュールからの安全な環境変数取得関数を作成し、ローカル開発サーバー（`npm run dev`）でも動作するようメモリフォールバック構造を導入しました。

### ② Cloudflareデプロイ時の D1 `10021` エラー
**現象:**
`npx wrangler deploy` 実行時にデプロイが拒否される。
```text
✘ [ERROR] binding DB of type d1 must have a valid `database_id` specified [code: 10021]
```
**解決策:**
`wrangler.jsonc` の `database_id` に仮の文字列（`local-db-id`）が指定されていたことが原因です。ターミナルで `npx wrangler d1 create <db-name>` を実行して発行された本番用の実UUID（`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）を設定することで解決しました。

※なお、`database_id` はパスワードや秘密鍵ではなく単なるリソース識別子（名札）のため、Gitにコミットしてもセキュリティ上全く問題ありません。

### ③ KV Namespaceの重複作成 `10014` エラー
**現象:**
デプロイ時にセッション用KVのプロビジョニングでエラーが発生。
```text
✘ [ERROR] a namespace with this account ID and title already exists [code: 10014]
```
**解決策:**
Cloudflare上に既に存在する同名KVのIDを `npx wrangler kv namespace list` で確認し、`wrangler.jsonc` 内の `kv_namespaces` ブロックへ明示的にIDをバインド指定することで、自動再作成による衝突を回避しました。

---

## まとめ

Cloudflare D1 と Drizzle ORM を組み合わせることで、**インフラ費用を1円もかけずに、安全で高速な「いいね＆コメント機能」**をブログに導入することができました。

エッジサーバー（Workers）とエッジDB（D1）の相性は非常に高く、静的サイトに少しだけ動的なインタラクティブ性を追加したいケースにおいて、最強の選択肢の一つと言えます。ブログをお持ちの方はぜひ試してみてください！
