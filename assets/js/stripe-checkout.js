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
    // Checkout Sessionを作成
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // 注意：本来はサーバー側で作成すべきですが、
      // 簡易実装のため、Stripe.jsのredirectToCheckoutを使用します
    });

    // Stripe.jsを使った簡易リダイレクト
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: STRIPE_CONFIG.PRICE_ID,
          quantity: 1,
        }
      ],
      mode: 'payment',
      successUrl: STRIPE_CONFIG.SUCCESS_URL,
      cancelUrl: STRIPE_CONFIG.CANCEL_URL,
      // 🔑 分割払いを有効化
      paymentMethodOptions: {
        card: {
          installments: {
            enabled: true,
          }
        }
      },
      // 顧客情報の収集
      customerEmail: null, // 自動でメールアドレス入力フォームが表示される
      billingAddressCollection: 'auto',
      // 日本の設定
      locale: 'ja',
    });

    if (error) {
      console.error('❌ Checkoutエラー:', error);
      showError(error.message);
    }
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
    showError('決済ページへの遷移中にエラーが発生しました。');
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
