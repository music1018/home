# エージェントルール

## コミットメッセージ規約
AIエージェントがコミットメッセージやGitコミットを生成する際は、以下のルールに厳格に従ってください：

1. **Conventional Commits** 形式を使用する。
2. プレフィックス（`feat:`, `fix:`, `docs:`, `refactor:`, `chore:` 等）は小文字の英語を使用する。
3. **コミットメッセージの説明文（サマリー）は必ず日本語で記述する**。

### 例:
- `feat: 新しいイライラ検出機能の追加`
- `fix: コメント一覧のスクロールバグを修正`
- `docs: AGENTS.mdにコミット規約を追記`
- `feat(mars): 火星ゲームのスコア保存機能を追加`

---

## インフラ・データベース（Cloudflare D1）運用規約

1. **D1 Binding と `database_id` の管理**
   - Cloudflare Workers への本番デプロイ時、`wrangler.jsonc` の `d1_databases` 内の `database_id` は Cloudflare 上にプロビジョニングされた本番用の実UUID（例: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）を指定しなければなりません。
   - ダミー文字列（例: `local-db-id`）のまま本番デプロイを実行すると、Cloudflare API エラー `10021` によりデプロイが拒否されます。

2. **D1 プロビジョニング手順**
   - 初回作成コマンド: `npx wrangler d1 create nifty-babbage-db`
   - 出力された `database_id` を `wrangler.jsonc` へ反映すること。

3. **型安全性とフォールバックの担保**
   - APIエンドポイントやコンポーネント内では、DB未初期化環境や開発サーバー環境でも例外でクラッシュしないよう、安全なオプショナルアクセスおよびメモリフォールバックを実装すること。
