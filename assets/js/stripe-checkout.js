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
    // GAS APIでCheckout Sessionを作成
    const gasApiUrl = 'https://script.google.com/macros/s/AKfycbwQn5hLvBGnDtOKIOhbItgti_IheCRETjpH--qu2B3WkBDAFmxwQkVFRFy-33LTajnH/exec';

    const params = new URLSearchParams({
      priceId: STRIPE_CONFIG.PRICE_ID,
      successUrl: STRIPE_CONFIG.SUCCESS_URL,
      cancelUrl: STRIPE_CONFIG.CANCEL_URL
    });

    const response = await fetch(`${gasApiUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Stripe CheckoutにリダイレクトSession IDを使用）
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
