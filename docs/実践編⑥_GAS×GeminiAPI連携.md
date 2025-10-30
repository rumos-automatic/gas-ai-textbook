# 実践編⑥ GAS×GeminiAPI連携

GASからGemini APIを使って、テキスト生成や画像分析を行うツールを作成します。

**注意：この章はロードマップ外の上級者向けコンテンツです。**

---

## 🎯 この実践で学ぶこと

- Gemini APIの基本
- APIキーの取得方法
- GASからGemini APIを使ってテキスト生成を行う方法
- 実用的な活用例

---

## 1. Gemini APIとは？

Gemini APIは、Googleが提供する生成AIのAPIです。ChatGPT APIと同様に、テキスト生成や画像分析などができます。

### Gemini APIの特徴

- **Googleサービスとの親和性が高い**
- **マルチモーダル対応**（テキスト、画像、音声など）
- **無料枠が大きい**（月15リクエスト/分まで無料）

---

## 2. Gemini APIキーの取得

Gemini APIを使用するには、**APIキー**が必要です。

### 取得手順

1. **[Google AI Studio](https://aistudio.google.com/)にアクセス**
2. **Googleアカウントでログイン**
3. **「Get API Key」をクリック**
4. **「Create API Key」をクリック**
5. **プロジェクトを選択または新規作成**
6. **APIキーが表示されるので、コピーして安全に保存**

⚠️ **注意：** APIキーは、絶対に他人に見せてはいけません。

---

## 3. GASからGemini APIを使ってテキスト生成

### ステップ1：APIキーをGASに保存

まず、APIキーをGASの「プロパティサービス」に保存します。

```javascript
function setGeminiApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('GEMINI_API_KEY', 'YOUR_API_KEY_HERE');
}
```

**手順：**
1. 上記のコードをGASエディタに貼り付け
2. `YOUR_API_KEY_HERE`を、実際のAPIキーに置き換え
3. 関数を実行（初回のみ）

### ステップ2：テキスト生成コードを作成

以下のコードで、Gemini APIを使ってテキストを生成できます。

```javascript
function generateTextWithGemini() {
  // APIキーを取得
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');

  // プロンプト（AIに送る指示）
  const prompt = '日本の観光名所を3つ教えてください。';

  // APIエンドポイント
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // リクエストペイロード
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          }
        ]
      }
    ]
  };

  // リクエストオプション
  const options = {
    'method': 'POST',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  // API呼び出し
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    // 生成されたテキストを取得
    const generatedText = result.candidates[0].content.parts[0].text;
    Logger.log(generatedText);

    return generatedText;
  } catch (error) {
    Logger.log('エラー: ' + error.message);
    return null;
  }
}
```

---

## 4. 実用的な活用例

### 例1：スプレッドシートのデータを基に商品説明文を自動生成

スプレッドシートの商品情報を基に、Gemini APIで商品説明文を自動生成します。

**プロンプト例（ChatGPTに送る）：**

```
Google Apps Scriptで、以下の機能を持つツールを作成してください。

【やりたいこと】
スプレッドシートの商品情報を基に、Gemini APIで商品説明文を自動生成する

【現在の手順】
1. スプレッドシートのA列に商品名、B列に特徴を入力
2. C列に、Gemini APIで生成した商品説明文を自動入力

【プロンプト例】
「以下の商品の説明文を100文字程度で作成してください。
商品名：{商品名}
特徴：{特徴}」

【その他の要望】
- Gemini APIキーは、プロパティサービスから取得する
- カスタムメニューから実行できるようにする
```

### 例2：お客様からの問い合わせ内容を自動分類

お客様からの問い合わせ内容を、Gemini APIで自動分類します。

**プロンプト例（ChatGPTに送る）：**

```
Google Apps Scriptで、以下の機能を持つツールを作成してください。

【やりたいこと】
Googleフォームで受け付けた問い合わせ内容を、Gemini APIで自動分類する

【現在の手順】
1. Googleフォームで問い合わせを受け付ける
2. 問い合わせ内容をGemini APIに送信し、カテゴリを判定
   - カテゴリ：「商品について」「配送について」「返品・交換」「その他」
3. スプレッドシートの「カテゴリ」列に自動入力

【プロンプト例】
「以下の問い合わせ内容を、『商品について』『配送について』『返品・交換』『その他』のいずれかに分類してください。分類名のみを回答してください。
問い合わせ内容：{問い合わせ内容}」

【その他の要望】
- Gemini APIキーは、プロパティサービスから取得する
- フォーム送信時に自動実行されるようにする
```

### 例3：大量のテキストデータをリサーチして要約

スプレッドシートに記録された大量のフィードバックを、Gemini APIで要約します。

**プロンプト例（ChatGPTに送る）：**

```
Google Apps Scriptで、以下の機能を持つツールを作成してください。

【やりたいこと】
スプレッドシートに記録された顧客フィードバックを、Gemini APIで要約する

【現在の手順】
1. スプレッドシートのA列に顧客フィードバックが記録されている
2. すべてのフィードバックを結合してGemini APIに送信
3. Gemini APIで要約を生成
4. 要約をスプレッドシートの「要約」シートに書き込む

【プロンプト例】
「以下の顧客フィードバックを、主要なポイントを3つ挙げて要約してください。
{フィードバック全文}」

【その他の要望】
- Gemini APIキーは、プロパティサービスから取得する
- カスタムメニューから実行できるようにする
```

---

## 5. Gemini API連携の注意点

### 🔐 APIキーの管理

APIキーは、絶対に他人に見せてはいけません。プロパティサービスを使って安全に保存しましょう。

### 💰 API利用料金

Gemini APIには、**無料枠**があります。

**無料枠：**
- **15リクエスト/分**
- **1,500リクエスト/日**

無料枠を超えると、課金される場合があるので注意が必要です。

### 📊 レスポンスの処理

Gemini APIのレスポンスは、JSON形式で返ってきます。適切に解析して、必要なデータを取り出しましょう。

---

## 6. ChatGPT APIとの違い

Gemini APIとChatGPT APIには、いくつかの違いがあります。

| 項目 | Gemini API | ChatGPT API |
|------|-----------|------------|
| **提供元** | Google | OpenAI |
| **無料枠** | 15リクエスト/分 | なし（すべて有料） |
| **Googleサービス連携** | 親和性が高い | 連携は別途必要 |
| **マルチモーダル** | 対応 | 対応（GPT-4V以降） |
| **料金** | 無料枠あり | 使用量に応じて課金 |

---

## ✅ まとめ

この実践では、以下のことを学びました：

- Gemini APIキーの取得方法
- GASからGemini APIを使ってテキスト生成を行う方法
- 実用的な活用例（商品説明文生成、問い合わせ分類、フィードバック要約）
- Gemini APIとChatGPT APIの違い

Gemini API連携により、テキスト生成や分析を自動化できます。特に、Googleサービスとの連携を考えている場合は、Gemini APIが最適です。ぜひ活用してみてください！
