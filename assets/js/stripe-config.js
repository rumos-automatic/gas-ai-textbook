/**
 * Stripe設定ファイル
 *
 * セットアップ手順：
 * 1. Stripeダッシュボード（テストモード）で商品と価格を作成
 * 2. 公開可能キー（pk_test_...）を PUBLISHABLE_KEY に設定
 * 3. 価格ID（price_...）を PRICE_ID に設定
 */

// ⚠️ ここに設定値を入力してください
const STRIPE_CONFIG = {
  // Stripe公開可能キー（テストモード）
  // 取得方法：https://dashboard.stripe.com/test/apikeys
  PUBLISHABLE_KEY: 'pk_test_51QQh6LFajKUpA4nIO647Xql0bbK4i1Y4iw3uARxON9GCfYIkMgLW6j50CseilIrnwyd0DxlKAJAL9gWRt9yNN2SX00NkAQe6OV',

  // 商品の価格ID
  // 取得方法：商品を作成後、価格詳細ページで price_... をコピー
  PRICE_ID: 'price_1SWChuFajKUpA4nI2vMS3CVf',

  // 成功時のリダイレクトURL
  SUCCESS_URL: window.location.origin + '/GAS-generative-ai-course/purchase-success.html',

  // キャンセル時のリダイレクトURL
  CANCEL_URL: window.location.origin + '/GAS-generative-ai-course/purchase.html',
};

/**
 * 設定の検証
 */
function validateStripeConfig() {
  if (STRIPE_CONFIG.PUBLISHABLE_KEY === 'YOUR_PUBLISHABLE_KEY_HERE') {
    console.error('❌ Stripe公開可能キーが設定されていません');
    return false;
  }

  if (STRIPE_CONFIG.PRICE_ID === 'YOUR_PRICE_ID_HERE') {
    console.error('❌ Stripe価格IDが設定されていません');
    return false;
  }

  return true;
}
