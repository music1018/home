---
title: 'Cloudflare D1とAstro APIのセキュリティ診断・ペネトレーションテストを実施してみた'
description: 'SQLインジェクション、Stored XSS、認可バイパス、不正パラメータ改ざんなどの疑似攻撃を行い、データベースとAPIの安全性を検証・考察した記録。'
pubDate: '2026-06-28'
heroImage: '/assets/blog-placeholder-2.jpg'
---

現代のWebアプリケーションにおいて、データベースやバックエンドAPIのセキュリティは最も重要な要素の一つです。特に個人開発やエッジ環境（Cloudflare Workers / D1）を採用したプロジェクトでは、適切なセキュリティ対策が講じられているかを定期的に検証することが不可欠です。

今回は、本ブログシステムで利用している Cloudflare D1 データベースおよび Astro API エンドポイント（`/api/comments`, `/api/likes`）に対し、実際のペネトレーションテスト（疑似攻撃検証）を実施しました。その検証手法と結果について解説します。

---

## 攻撃シナリオと検証項目

今回のセキュリティ診断では、主要なWeb脆弱性トップ10（OWASP Top 10等）をベースに、以下の4つの観点から疑似攻撃を組み立てました。

1. **SQL Injection (SQLi) 攻撃**
2. **Stored Cross-Site Scripting (XSS) 攻撃**
3. **認可バイパスおよび不正パラメータ改ざん攻撃**
4. **境界値・入力バリデーションおよびスパム検出**

---

## 1. SQL Injection (SQLi) の検証

### 攻撃手法
GETリクエストのクエリパラメータやPOSTリクエストのJSONボディ内に、SQL制御文字や構文（`' OR '1'='1` や `'; DROP TABLE comments; --`）を挿入し、データベースの不正全件取得やテーブル破壊を試みました。

```javascript
// 疑似攻撃コードの例
const payload = "' OR '1'='1";
const res = await fetch(`/api/comments?slug=${encodeURIComponent(payload)}`);
```

### 結果と対策
- **判定**: **PASS (完全防御)**
- **考察**: Drizzle ORM および Cloudflare D1 の準備済みステートメント（Prepared Statements）を使用しているため、ユーザー入力値はすべて安全にバインドされ、単なる文字リテラルとして処理されました。直接的なSQL構文の解析・実行は不可能です。

---

## 2. Stored Cross-Site Scripting (XSS) の検証

### 攻撃手法
コメント投稿API（POST `/api/comments`）に対し、HTML/JavaScriptの悪意あるペロード（`<script>alert('xss')</script>` や `<img src=x onerror=alert('xss')>`）を含む投稿を行いました。その後、GET API経由で取得したデータがブラウザ等でスクリプトとして実行される状態になっていないかを検証しました。

```javascript
// 疑似攻撃ペロードの送信
await fetch('/api/comments', {
  method: 'POST',
  body: JSON.stringify({
    slug: 'xss-test',
    author: "<script>alert('xss-author')</script>",
    content: "<img src=x onerror=alert('xss-content')>"
  })
});
```

### 結果と対策
- **判定**: **PASS (完全防御)**
- **考察**: `src/utils/security.ts` 内の `escapeHtml` 関数が機能し、`<` や `>` などの特殊文字が `&lt;script&gt;` や `&lt;img` のようにHTMLエンティティにエンコードされて保存・レスポンスされました。これにより、クラインアント側でのスクリプト自動実行を防いでいます。

---

## 3. 認可バイパス・パラメータ改ざんの検証

### 攻撃手法
1. **未認証削除の試行**: 管理者用ヘッダー（`x-admin-secret`）を付与しない、あるいは不正な秘密鍵を指定してコメント削除API（DELETE `/api/comments`）を叩き、他人のコメントを不当に削除できるか検証しました。
2. **不正数値（極端な増加・負の値）の注入**: いいね追加API（POST `/api/likes`）に対し、`increment: 999999` や `increment: -100` などの不正な数値を送信し、いいね数のカウントを破壊できるか検証しました。

### 結果と対策
- **判定**: **PASS (完全防御)**
- **考察**: 
  - DELETE APIでは秘密鍵の厳格な一致確認が行われ、認証失敗時は即座に `403 Forbidden` が返却されました。
  - いいね数の増分処理にはサーバーサイドで `Math.min(Math.max(1, Number(increment) || 1), 50)` のクランプ処理が実装されており、どれほど巨大な数値や負の値を送信しても 1〜50 の安全な範囲に丸め込まれました。

---

## 4. 入力長バリデーションとNGワード検出の検証

### 攻撃手法
500文字を超える巨大な文字列の送信や、スパム・誹謗中傷ワード（「バカ」等）を含む投稿を送信し、システム側で適切に制限・ブロックされるかをテストしました。

### 結果と対策
- **判定**: **PASS (完全防御)**
- **考察**: 文字数オーバーやNGワード検出時は即座に `400 Bad Request` が返却され、データベースへの無駄な書き込みや不適切なコンテンツの公開がブロックされました。

---

## 診断結果サマリー

自作のテストスクリプトにより実行した9項目のペネトレーションテストの結果は以下の通りです。

| 診断項目 | 攻撃手法・目的 | 判定 | レスポンスステータス / 挙動 |
| :--- | :--- | :---: | :--- |
| **SQLi (GET)** | コメント全件取得試行 (`' OR '1'='1`) | **PASS** | Status: 200 (取得件数: 0件) |
| **SQLi (POST)** | 不正SQL構文によるデータ挿入 | **PASS** | Status: 201 (文字列として保存) |
| **Stored XSS** | JavaScript/HTMLタグ注入 | **PASS** | 正常エスケープ処理済 |
| **認可バイパス (未設定)** | ヘッダーなしDELETE | **PASS** | Status: 403 Forbidden |
| **認可バイパス (不正キー)**| 不正な `x-admin-secret` DELETE | **PASS** | Status: 403 Forbidden |
| **パラメータ改ざん (上限)**| `increment: 999999` の送信 | **PASS** | 上限値 50 に丸め込み |
| **パラメータ改ざん (下限)**| `increment: -100` の送信 | **PASS** | 下限値 1 に丸め込み |
| **長文バリデーション** | 500文字超の本文送信 | **PASS** | Status: 400 Bad Request |
| **NGワード検証** | 不適切ワードの送信 | **PASS** | Status: 400 Bad Request |

---

## まとめと今後の展望

今回のペネトレーションテストを通じて、Cloudflare D1 と Astro による構成において、基本的なセキュリティ対策（ORMによるSQLi防止、エスケープによるXSS防止、サーバーサイドでの厳格な入力値クランプ・認証チェック）が極めて有効に機能していることが実証されました。

個人開発のプロダクトであっても、自動化テストスクリプトを用いた疑似攻撃検証を定期的に行うことで、安心して運用を続けることができます。今後は本番環境における Cloudflare Turnstile の運用や、IP制限・レートリミットの追加実装も検討していく予定です。
