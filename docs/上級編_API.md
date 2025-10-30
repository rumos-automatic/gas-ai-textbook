# 上級編：APIについて

API連携の基礎知識を学び、外部サービスとGASを連携させる方法を理解しましょう。

**注意：この章はロードマップ外の上級者向けコンテンツです。**

---

## 🎯 この章で学ぶこと

- APIの基本概念
- API連携のメリット
- GASでAPI連携を行う方法
- 代表的なAPI連携の例

---

## 1. APIとは？

### 🔌 API（Application Programming Interface）の基本

API（Application Programming Interface）とは、**異なるソフトウェア同士がやり取りするための仕組み**です。

**簡単に言うと：**
APIは、**別のサービスの機能を借りて使う窓口**のようなものです。

### 🏪 レストランの例で理解する

APIをレストランに例えると、以下のようになります：

- **あなた（GAS）**：お客さん
- **API**：ウェイター
- **外部サービス（例：ChatGPT API）**：キッチン

**流れ：**
1. あなた（GAS）がウェイター（API）に注文を伝える
2. ウェイター（API）がキッチン（外部サービス）に注文を伝える
3. キッチン（外部サービス）が料理を作る
4. ウェイター（API）が料理をあなた（GAS）に届ける

このように、APIは**あなたと外部サービスの間を取り持つ役割**を果たします。

---

## 2. GASでAPI連携を行うメリット

GASでAPI連携を行うことで、以下のようなメリットがあります：

### 🌐 外部サービスの機能を活用できる

Google以外のサービス（Slack、Twitter、ChatGPT、Geminiなど）の機能を、GASから利用できるようになります。

**例：**
- SlackにGASから通知を送信
- TwitterにGASから自動投稿
- ChatGPT APIを使ってGASで文章を生成
- Gemini APIを使ってGASで画像を分析

### 🔗 複数のサービスを連携できる

複数のサービスを組み合わせることで、より高度な自動化が実現できます。

**例：**
- Googleフォーム → GAS → Slack通知
- Gmail → GAS → ChatGPT API → スプレッドシート
- スプレッドシート → GAS → Gemini API → Gmail

### 🚀 ビジネスの効率化が加速する

API連携により、これまで手動で行っていた作業を自動化できます。

**例：**
- 顧客からの問い合わせを自動分類してSlack通知
- 売上データを自動分析してレポート作成
- 在庫データを自動チェックして発注メール送信

---

## 3. GASでAPI連携を行う方法

GASでAPI連携を行う基本的な流れは、以下の通りです：

### ステップ1：APIキーを取得する

外部サービスのAPIを使用するには、**APIキー**が必要です。

APIキーとは、**あなたがそのサービスを使う権限を持っていることを証明するパスワードのようなもの**です。

**例：**
- ChatGPT API → OpenAI公式サイトでAPIキーを発行
- Gemini API → Google AI Studioでキーを発行
- Slack API → Slack App管理画面でAPIトークンを発行

### ステップ2：GASでAPI呼び出しコードを書く

GASには、`UrlFetchApp`というHTTPリクエストを送信する機能があります。これを使ってAPIを呼び出します。

**基本構文：**

```javascript
function callAPI() {
  const url = "https://api.example.com/endpoint"; // APIのエンドポイントURL
  const apiKey = "YOUR_API_KEY_HERE"; // APIキー

  const options = {
    "method": "POST", // HTTPメソッド（GET, POST, PUT, DELETEなど）
    "headers": {
      "Authorization": "Bearer " + apiKey, // 認証ヘッダー
      "Content-Type": "application/json" // データ形式
    },
    "payload": JSON.stringify({ // 送信するデータ
      "message": "Hello, API!"
    })
  };

  const response = UrlFetchApp.fetch(url, options); // API呼び出し
  const result = JSON.parse(response.getContentText()); // レスポンスを解析

  Logger.log(result); // 結果をログに出力
}
```

### ステップ3：レスポンスを処理する

APIから返ってきたデータ（レスポンス）を処理します。

**例：**
- スプレッドシートに書き込む
- Gmailでメールを送信する
- Slackに通知を送る

---

## 4. 代表的なAPI連携の例

### 例1：ChatGPT API × GAS

ChatGPT APIを使って、GASから文章を生成します。

**ユースケース：**
- メール文章の自動生成
- 商品説明文の自動作成
- お客様への返信文の自動生成

**詳細は、[実践⑤ GAS×チャットワークAPI連携](./実践編⑤_GAS×チャットワークAPI連携.md)を参照してください。**

### 例2：Gemini API × GAS

Gemini APIを使って、GASから画像分析やテキスト生成を行います。

**ユースケース：**
- 画像の内容を自動で説明
- 大量のテキストデータをリサーチして要約
- Googleサービスとの高度な連携

**詳細は、[実践⑥ GAS×GeminiAPI連携](./実践編⑥_GAS×GeminiAPI連携.md)を参照してください。**

### 例3：Slack API × GAS

Slack APIを使って、GASからSlackに通知を送信します。

**ユースケース：**
- Googleフォームの回答をSlackに通知
- スプレッドシートのデータ更新をSlackに通知
- エラー発生時にSlackに通知

---

## 5. API連携の注意点

API連携を行う際は、以下の点に注意しましょう。

### 🔐 APIキーの管理

APIキーは、**絶対に他人に見せてはいけません**。もしAPIキーが漏洩すると、不正利用される可能性があります。

**対策：**
- GASの「プロパティサービス」を使ってAPIキーを安全に保存
- GitHubなどにコードを公開する際は、APIキーを削除

**プロパティサービスの使い方：**

```javascript
function setApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('API_KEY', 'YOUR_API_KEY_HERE');
}

function getApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('API_KEY');
}
```

### 💰 API利用料金

多くのAPIには、**利用料金**がかかります。無料枠を超えると、課金される場合があるので注意が必要です。

**例：**
- ChatGPT API：リクエスト数に応じて課金
- Gemini API：リクエスト数に応じて課金（無料枠あり）

**対策：**
- 無料枠の範囲内で使用する
- 利用状況を定期的にチェックする
- テスト時は少量のデータで試す

### ⏱️ API呼び出し回数の制限

APIには、**1日あたりの呼び出し回数制限**があります。制限を超えると、APIが使えなくなる場合があります。

**対策：**
- 必要最小限の呼び出しに抑える
- キャッシュを活用して、同じデータを何度も取得しない

---

## ✅ まとめ

この章では、以下のことを学びました：

- **APIとは**：異なるソフトウェア同士がやり取りするための仕組み
- **GASでAPI連携を行うメリット**：外部サービスの機能を活用できる
- **GASでAPI連携を行う方法**：`UrlFetchApp`を使ってAPIを呼び出す
- **代表的なAPI連携の例**：ChatGPT API、Gemini API、Slack API
- **API連携の注意点**：APIキーの管理、利用料金、呼び出し回数の制限

次は、実際にAPI連携を使った実践編に進んでいきましょう。

- [実践⑤ GAS×チャットワークAPI連携](./実践編⑤_GAS×チャットワークAPI連携.md)
- [実践⑥ GAS×GeminiAPI連携](./実践編⑥_GAS×GeminiAPI連携.md)
