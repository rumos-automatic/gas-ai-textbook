/**
 * Stripe Checkout処理
 * 分割払い対応の決済フローを実装
 */

// Stripeインスタンス
let stripe = null;

/**
 * Stripeの初期化
 */
function initializeStripe() {
  if (!validateStripeConfig()) {
    showError('Stripe設定が完了していません。stripe-config.js を確認してください。');
    return false;
  }

  try {
    stripe = Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
    console.log('✅ Stripeを初期化しました');
    return true;
  } catch (error) {
    console.error('❌ Stripe初期化エラー:', error);
    showError('Stripeの初期化に失敗しました。');
    return false;
  }
}

/**
 * Checkoutセッションを作成して決済ページにリダイレクト
 */
async function redirectToCheckout() {
  // ローディング表示
  showLoading(true);

  try {
    // GAS APIでCheckout Sessionを作成（JSONP使用）
    const gasApiUrl = 'https://script.google.com/macros/s/AKfycbwrDl5Uho56cm4R9Ekmwuo2G5y8Yapry2WvEi-jpVhqVIwZLxGSZ6yFbb_-Y0xESyk2/exec';

    const params = new URLSearchParams({
      priceId: STRIPE_CONFIG.PRICE_ID,
      successUrl: STRIPE_CONFIG.SUCCESS_URL,
      cancelUrl: STRIPE_CONFIG.CANCEL_URL,
      callback: 'handleCheckoutSession'
    });

    // JSONPでリクエスト
    const data = await loadJSONP(`${gasApiUrl}?${params.toString()}`);

    if (data.error) {
      throw new Error(data.error);
    }

    // Stripe Checkoutにリダイレクト（Session IDを使用）
    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (error) {
      console.error('❌ Checkoutエラー:', error);
      showError(error.message);
    }
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
    showError('決済ページへの遷移中にエラーが発生しました。\n' + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * JSONP形式でAPIを呼び出す
 */
function loadJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'handleCheckoutSession';
    const script = document.createElement('script');

    // グローバルコールバック関数を作成
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    // エラーハンドリング
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };

    script.src = url;
    document.body.appendChild(script);
  });
}

/**
 * ローディング表示の切り替え
 */
function showLoading(isLoading) {
  const buttons = document.querySelectorAll('.checkout-button');
  buttons.forEach(button => {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>処理中...';
    } else {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-shopping-cart mr-3"></i>今すぐ申し込む';
    }
  });
}

/**
 * エラーメッセージの表示
 */
function showError(message) {
  alert('❌ エラー\n\n' + message);
}

/**
 * ページ読み込み時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
  // Stripeを初期化
  if (!initializeStripe()) {
    return;
  }

  // 申し込みボタンにイベントリスナーを設定
  const checkoutButtons = document.querySelectorAll('.checkout-button');
  checkoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      redirectToCheckout();
    });
  });

  console.log('✅ Stripe Checkout初期化完了');
});
