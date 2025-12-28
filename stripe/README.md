# Stripe売上自動記録システム（Google Apps Script版）

毎日前日分のStripe支払いを自動でGoogleスプレッドシートに記録するシステムです。

## 機能

- **毎朝9時（JST）に自動実行**: 前日の支払いデータを取得
- **13項目を自動記録**: 支払日時、商品名、顧客名、メール、金額、手数料、純利益、支払ステータス、着金予定日、着金ステータス、着金金額、決済ID、Payout ID
- **重複チェック**: 同じ決済IDは記録しない
- **JPY対応**: 日本円の取引に最適化

## リンク

- **スプレッドシート**: [こちらからアクセス](https://drive.google.com/open?id=1rqkcIBlmsMLkD21i21fkyIr64578MDGkBfGUYH0Gzv0)
- **スクリプトエディタ**: [こちらからアクセス](https://script.google.com/d/1ufBFqaMok3r-X5gHkGjOb2ZDO49JNSjtts6zLuLhU7MLmJR5ymegmr4R/edit)

## セットアップ手順

### 前提条件

- Node.js（v18以上）
- npm
- clasp（`npm install -g @google/clasp`）
- claspでログイン済み（`clasp login`）

### ステップ1: 依存関係のインストール

```bash
cd stripe
npm install
```

### ステップ2: ビルド＆デプロイ

```bash
npm run push
```

### ステップ3: Stripe APIキーの設定

1. [Stripeダッシュボード](https://dashboard.stripe.com/apikeys)にアクセス
2. **「シークレットキー」** をコピー（`sk_live_...` または `sk_test_...`）
3. スクリプトエディタで **`setStripeApiKey()`** 関数を開く
4. `YOUR_STRIPE_SECRET_KEY_HERE` を実際のキーに置き換え
5. 関数を実行
6. **コードからAPIキーを削除**（セキュリティ対策）

### ステップ4: シートの初期設定

1. スクリプトエディタで **`setupSalesSheet()`** を実行
2. スプレッドシートに「売上記録」シートが作成されます

### ステップ5: トリガーの設定

1. スクリプトエディタで **`setupDailyTrigger()`** を実行
2. 毎朝9時（JST）に自動実行されるトリガーが設定されます

## 使い方

### 自動実行

毎朝9時に前日分の支払いが自動で記録されます。

### 手動実行

- **前日分を記録**: `dailyRecordSales()` を実行
- **過去7日分を記録**: `testRecordLast7Days()` を実行
- **指定日を記録**: `testRecordSpecificDate('2025-12-27')` を実行

### 設定確認

`checkConfig()` を実行すると、APIキーが設定されているか確認できます。

## スプレッドシート構成

### 売上記録シート（13列）

| 列 | 項目名 | 説明 |
|----|--------|------|
| A | 支払日時 | 支払いが行われた日時（JST） |
| B | 商品名 | 商品・サービスの説明 |
| C | 顧客名 | 顧客の名前 |
| D | メール | 顧客のメールアドレス |
| E | 金額 | 支払い金額（円） |
| F | 手数料 | Stripe手数料（円） |
| G | 純利益 | 手数料を引いた金額（円） |
| H | 支払ステータス | 成功/失敗 |
| I | 着金予定日 | 口座への着金予定日 |
| J | 着金ステータス | 着金済/保留中/処理中/未確定 |
| K | 着金金額 | 実際の着金金額（円） |
| L | 決済ID | StripeのCharge ID |
| M | Payout ID | StripeのPayout ID |

## ファイル構成

```
stripe/
├── appsscript.json    # GAS設定
├── .clasp.json        # clasp設定
├── package.json       # npm依存関係
├── tsconfig.json      # TypeScript設定
├── README.md          # このファイル
├── src/
│   ├── main.ts        # メイン処理・トリガー設定
│   ├── stripe.ts      # Stripe API呼び出し
│   ├── sheet.ts       # スプレッドシート操作
│   └── utils.ts       # ユーティリティ関数
└── dist/              # コンパイル出力
```

## 開発コマンド

```bash
# TypeScriptをコンパイル
npm run build

# コンパイル＆GASにpush
npm run push

# ファイル変更を監視
npm run watch

# スクリプトエディタを開く
npm run open
```

## 注意事項

### セキュリティ

- APIキーは必ずスクリプトプロパティに保存
- コードに直接記載しない
- `.clasp.json`と`.env`は`.gitignore`に追加済み

### 通貨

- JPY（日本円）専用に最適化
- 他の通貨の取引はスキップされます

### API制限

- レート制限時は自動で60秒待機してリトライ
- サーバーエラー時は30秒待機してリトライ

## トラブルシューティング

### データが記録されない

1. `checkConfig()` でAPIキーが設定されているか確認
2. スクリプトエディタの「実行数」でエラーログを確認
3. Stripeダッシュボードで対象期間に支払いがあるか確認

### トリガーが動作しない

1. `setupDailyTrigger()` を再実行
2. スクリプトエディタの「トリガー」で設定を確認

### 権限エラー

1. スクリプトを一度手動実行して権限を承認
2. スプレッドシートへのアクセス権限を確認

## 参考リンク

- [Stripe API ドキュメント](https://stripe.com/docs/api)
- [Google Apps Script ドキュメント](https://developers.google.com/apps-script)
- [clasp ドキュメント](https://github.com/google/clasp)

---

Generated with Claude Code
