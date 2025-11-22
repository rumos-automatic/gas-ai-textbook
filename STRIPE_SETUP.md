# Stripe Checkout（分割払い対応）セットアップ手順

このガイドでは、Stripe Checkoutを使った分割払い対応の決済システムのセットアップ方法を説明します。

## 📋 前提条件

- ✅ Stripeアカウント（日本）を持っている
- ✅ テストモードで動作確認を行う
- ✅ GitHub Pagesで購入ページを公開する

## 🚀 セットアップ手順

### ステップ1: Stripeで商品と価格を作成

1. **Stripeダッシュボードにアクセス**
   - https://dashboard.stripe.com/
   - 右上のトグルで **テストモード** に切り替え

2. **商品カタログを開く**
   - 左メニュー：**「商品カタログ」** → **「商品」**
   - **「+ 商品を追加」** をクリック

3. **商品情報を入力**
   ```
   名前: 生成AI×GAS短期講座
   説明: 初心者から始める、生成AIとGoogle Apps Scriptの実践講座
   画像: （任意）講座のサムネイル画像
   ```

4. **価格設定**
   ```
   価格モデル: 標準の料金
   価格: 30000
   請求期間: 1回限り
   通貨: JPY - 日本円
   ```

5. **「商品を保存」** をクリック

6. **価格IDをコピー**
   - 作成された商品ページで、価格セクションを確認
   - **`price_...`** で始まるID（例: `price_1AbCdEfGhIjKlMnO`）をコピー
   - メモ帳などに保存しておく

### ステップ2: Stripe公開可能キーを取得

1. **APIキーページにアクセス**
   - https://dashboard.stripe.com/test/apikeys
   - または、左メニュー：**「開発者」** → **「APIキー」**

2. **公開可能キーをコピー**
   - **「公開可能キー」** セクションを探す
   - **`pk_test_...`** で始まるキーをコピー
   - ⚠️ 注意：**シークレットキー（`sk_test_...`）ではありません！**

### ステップ3: 設定ファイルに値を入力

1. **stripe-config.jsを開く**
   - ファイル：`assets/js/stripe-config.js`

2. **設定値を入力**
   ```javascript
   const STRIPE_CONFIG = {
     // ステップ2でコピーした公開可能キーを貼り付け
     PUBLISHABLE_KEY: 'pk_test_YOUR_ACTUAL_KEY_HERE',

     // ステップ1でコピーした価格IDを貼り付け
     PRICE_ID: 'price_YOUR_ACTUAL_PRICE_ID_HERE',

     // 以下はそのままでOK（GitHub Pagesのドメインに合わせて自動設定）
     SUCCESS_URL: window.location.origin + '/GAS-generative-ai-course/purchase-success.html',
     CANCEL_URL: window.location.origin + '/GAS-generative-ai-course/purchase.html',
   };
   ```

3. **保存**

### ステップ4: GitHub Pagesにデプロイ

1. **変更をコミット**
   ```bash
   git add assets/js/stripe-config.js assets/js/stripe-checkout.js purchase.html
   git commit -m "feat: Stripe Checkout（分割払い対応）を実装"
   git push origin master
   ```

2. **GitHub Pagesの自動ビルドを待つ**（通常1-2分）

### ステップ5: 動作確認

1. **購入ページにアクセス**
   - https://rumos-automatic.github.io/GAS-generative-ai-course/purchase.html

2. **「今すぐ申し込む」ボタンをクリック**
   - Stripe Checkoutページに遷移することを確認

3. **テストカード番号を入力**

   **日本の分割払いをテストするカード番号：**
   ```
   カード番号: 4000 0056 0000 0004
   有効期限: 12/34（未来の日付なら何でもOK）
   CVC: 123（任意の3桁）
   郵便番号: 100-0001（任意）
   ```

   このカード番号を入力すると、**分割払いのオプション**が表示されます！

4. **分割払いオプションを確認**
   - カード番号入力後、「Pay in installments」または「分割払い」チェックボックスが表示される
   - チェックすると、選択可能な分割回数が表示される
     - 2回払い
     - 3回払い
     - 5回払い
     - 6回払い
     - 10回払い
     - 12回払い
     - など

5. **テスト決済を完了**
   - 分割払いプランを選択
   - メールアドレスを入力
   - 「支払う」ボタンをクリック
   - `purchase-success.html` にリダイレクトされることを確認

6. **Webhookで自動記録を確認**
   - Stripeスプレッドシートを開く
   - **Payments** シートに決済情報が記録されていることを確認
   - **Customers** シートに顧客情報が記録されていることを確認

## 🧪 テストカード一覧

| カード番号 | 用途 |
|----------|------|
| `4000 0056 0000 0004` | **分割払い対応カード**（推奨） |
| `4242 4242 4242 4242` | 成功する決済（分割払いなし） |
| `4000 0000 0000 0002` | カード拒否エラー |
| `4000 0000 0000 9995` | 残高不足エラー |

## ⚠️ 重要な注意事項

### 分割払いの表示条件

分割払いオプションは、以下の条件をすべて満たす場合のみ表示されます：

1. ✅ 日本のStripeアカウント
2. ✅ 通貨がJPY（日本円）
3. ✅ 日本発行のクレジットカード（テストカード: `4000 0056 0000 0004`）
4. ✅ Visa / Mastercard / JCB（アメックスは非対応）

上記のテストカード番号を使わないと、分割払いオプションが表示されません！

### 本番環境への移行

テストモードで動作確認が完了したら、以下の手順で本番環境に切り替えます：

1. **Stripeを本番モードに切り替え**
   - ダッシュボード右上のトグルを「本番」に変更

2. **本番用の商品と価格を作成**
   - テストモードと同じ手順で商品を作成
   - 本番用の価格ID（`price_...`）をコピー

3. **本番用のAPIキーを取得**
   - 本番モードのAPIキーページで公開可能キー（`pk_live_...`）をコピー

4. **設定ファイルを更新**
   - `stripe-config.js` の値を本番用に置き換え
   - ⚠️ 必ずGitHubにpushする前に確認！

5. **実際のカードでテスト**
   - 少額（例: 100円）でテスト決済を行う
   - 決済が正常に完了することを確認
   - Webhookでスプレッドシートに記録されることを確認

## 🔒 セキュリティ上の注意

1. **公開可能キーのみ使用**
   - フロントエンド（JavaScript）では **公開可能キー（`pk_test_...` / `pk_live_...`）** のみ使用
   - **シークレットキー（`sk_test_...` / `sk_live_...`）** は絶対に使わない

2. **GitHubに公開してOK**
   - 公開可能キーはクライアント側で使用するため、GitHubに公開してもセキュリティ上問題ありません
   - ただし、シークレットキーは絶対にGitHubにpushしない

3. **Webhook署名検証**
   - すでに実装済みのWebhookシステムで署名検証が行われる
   - 不正なリクエストは自動的に拒否される

## 📊 決済データの確認

### Stripeダッシュボード

- https://dashboard.stripe.com/test/payments
- すべての決済履歴、顧客情報、分割払いプランを確認できます

### Googleスプレッドシート

- すでに作成済みのWebhookシステムで自動的に記録されます
- https://drive.google.com/open?id=1rqkcIBlmsMLkD21i21fkyIr64578MDGkBfGUYH0Gzv0

## 🆘 トラブルシューティング

### 分割払いオプションが表示されない

**原因：**
- テストカード番号が間違っている
- 通貨がJPY以外
- Stripeアカウントが日本以外

**解決方法：**
- テストカード番号 `4000 0056 0000 0004` を使用
- 価格の通貨がJPYであることを確認

### ボタンをクリックしてもCheckoutページに遷移しない

**原因：**
- `stripe-config.js` の設定が正しくない
- ブラウザのコンソールにエラーが表示されている

**解決方法：**
1. ブラウザの開発者ツールを開く（F12キー）
2. コンソールタブでエラーメッセージを確認
3. 公開可能キーと価格IDが正しく設定されているか確認

### Webhookで自動記録されない

**原因：**
- Webhook URLが正しく登録されていない
- Webhook署名シークレットが設定されていない

**解決方法：**
- `stripe/README.md` の「Webhook設定手順」を参照
- Stripeダッシュボードで正しいWebhook URLが登録されているか確認

## 📚 参考リンク

- [Stripe日本の分割払い公式ドキュメント](https://docs.stripe.com/payments/jp-installments)
- [Stripe Checkout公式ドキュメント](https://docs.stripe.com/payments/checkout)
- [Stripeテストカード一覧](https://docs.stripe.com/testing)

---

**🤖 Generated with Claude Code**
