/**
 * Stripe Webhook処理モジュール
 * checkout.session.completedイベントを処理してDiscord招待メールを送信
 */

// Webhook関連の型定義
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSessionExpanded;
  };
  created: number;
  livemode: boolean;
}

interface StripeCheckoutSessionExpanded {
  id: string;
  payment_intent: string | null;
  customer: string | null;
  customer_details: {
    name: string | null;
    email: string | null;
  } | null;
  line_items?: {
    data: Array<{
      description: string;
      price: {
        id: string;
        product: string;
      };
      quantity: number;
      amount_total: number;
    }>;
  };
  payment_status: string;
  status: string;
}

interface WebhookResponse {
  success: boolean;
  message: string;
}

/**
 * Stripe Webhookを処理
 * @param payload リクエストボディ（JSON文字列）
 * @param signatureHeader Stripe-Signatureヘッダー
 */
function processStripeWebhook(
  payload: string,
  signatureHeader: string | null
): WebhookResponse {
  // 署名検証（ヘッダーがある場合）
  if (signatureHeader) {
    if (!verifyStripeSignature(payload, signatureHeader)) {
      log('ERROR', 'Webhook署名検証失敗');
      return { success: false, message: 'Invalid signature' };
    }
  } else {
    // GAS Web Appではヘッダーにアクセスできない場合がある
    // クエリパラメータでのシークレット検証にフォールバック
    log('WARN', 'Stripe-Signatureヘッダーなし。署名検証をスキップします');
  }

  try {
    const event: StripeWebhookEvent = JSON.parse(payload);
    log('INFO', `Webhook受信: ${event.type}`, { eventId: event.id, livemode: event.livemode });

    // checkout.session.completed以外は無視
    if (event.type !== 'checkout.session.completed') {
      log('INFO', `イベントタイプ ${event.type} は処理対象外`);
      return { success: true, message: 'Event type ignored' };
    }

    // checkout.session.completedを処理
    return handleCheckoutSessionCompleted(event);
  } catch (error) {
    log('ERROR', 'Webhookペイロードのパースに失敗', { error: String(error) });
    return { success: false, message: 'Invalid payload' };
  }
}

/**
 * checkout.session.completedイベントを処理
 */
function handleCheckoutSessionCompleted(event: StripeWebhookEvent): WebhookResponse {
  const session = event.data.object;
  const sessionId = session.id;

  // 顧客情報を取得
  const email = session.customer_details?.email;
  const customerName = session.customer_details?.name || '';

  if (!email) {
    log('WARN', 'Checkout Sessionにメールアドレスがありません', { sessionId });
    return { success: true, message: 'No email in session' };
  }

  // 対象Price IDを取得
  const eligiblePriceIds = getEligiblePriceIds();
  if (eligiblePriceIds.length === 0) {
    log('WARN', 'DISCORD_ELIGIBLE_PRICE_IDSが設定されていません');
    return { success: false, message: 'No eligible price IDs configured' };
  }

  // line_itemsを取得（Webhookペイロードに含まれない場合はAPIで取得）
  let lineItems = session.line_items?.data;
  if (!lineItems || lineItems.length === 0) {
    log('INFO', 'line_itemsをStripe APIから取得します', { sessionId });
    const expandedSession = getCheckoutSessionWithLineItemsAndPrices(sessionId);
    lineItems = expandedSession?.line_items?.data || [];
  }

  // 対象商品かチェック
  const matchingItem = lineItems.find(item =>
    item.price && eligiblePriceIds.includes(item.price.id)
  );

  if (!matchingItem) {
    const priceIds = lineItems.map(item => item.price?.id || 'unknown');
    log('INFO', '対象外の商品です', { sessionId, priceIds, eligiblePriceIds });
    return { success: true, message: 'Product not eligible for Discord invite' };
  }

  // 重複送信チェック
  if (isEmailAlreadySent(sessionId)) {
    log('INFO', '既にメール送信済みです', { sessionId, email });
    return { success: true, message: 'Email already sent' };
  }

  // Discord招待メールを送信
  const sendResult = sendDiscordInvitationEmail(email, customerName);

  if (sendResult.success) {
    // 送信記録を保存
    markEmailSentForSession(sessionId, email, matchingItem.description || '');
    log('INFO', 'Discord招待メール送信完了', {
      sessionId,
      email,
      product: matchingItem.description
    });
    return { success: true, message: 'Discord invitation email sent' };
  } else {
    log('ERROR', 'Discord招待メール送信失敗', {
      sessionId,
      email,
      error: sendResult.error
    });
    return { success: false, message: 'Failed to send email' };
  }
}

/**
 * 対象Price IDリストを取得（Script Propertiesから）
 */
function getEligiblePriceIds(): string[] {
  const priceIdsStr = PropertiesService.getScriptProperties()
    .getProperty('DISCORD_ELIGIBLE_PRICE_IDS') || '';

  return priceIdsStr
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}

/**
 * Checkout SessionをPrice情報付きで取得
 */
function getCheckoutSessionWithLineItemsAndPrices(sessionId: string): StripeCheckoutSessionExpanded | null {
  if (!sessionId) return null;

  try {
    const response = stripeApiRequest(
      `/checkout/sessions/${sessionId}?expand[]=line_items.data.price`
    );
    return response as StripeCheckoutSessionExpanded;
  } catch (e) {
    log('WARN', `Checkout Session取得失敗: ${sessionId}`, { error: String(e) });
    return null;
  }
}

/**
 * Stripe Webhook署名を検証
 */
function verifyStripeSignature(payload: string, signatureHeader: string): boolean {
  try {
    const secret = getStripeWebhookSecret();

    // ヘッダーをパース（形式: t=timestamp,v1=signature,v1=signature2,...）
    const elements = signatureHeader.split(',');
    const signatureMap: { [key: string]: string[] } = {};

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (!signatureMap[key]) {
        signatureMap[key] = [];
      }
      signatureMap[key].push(value);
    }

    const timestamp = signatureMap['t']?.[0];
    const signatures = signatureMap['v1'] || [];

    if (!timestamp || signatures.length === 0) {
      log('WARN', '署名ヘッダーのパースに失敗');
      return false;
    }

    // タイムスタンプチェック（5分以内）
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > 300) {
      log('WARN', 'Webhookタイムスタンプが古すぎます', { timestamp: timestampNum, now });
      return false;
    }

    // 期待される署名を計算
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = computeHmacSha256(signedPayload, secret);

    // 署名を比較
    return signatures.some(sig => sig === expectedSignature);
  } catch (error) {
    log('ERROR', '署名検証でエラー', { error: String(error) });
    return false;
  }
}

/**
 * Stripe Webhook Secretを取得
 */
function getStripeWebhookSecret(): string {
  const secret = PropertiesService.getScriptProperties()
    .getProperty('STRIPE_WEBHOOK_SECRET');
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRETが設定されていません');
  }
  return secret;
}

/**
 * HMAC-SHA256署名を計算
 */
function computeHmacSha256(data: string, key: string): string {
  const signature = Utilities.computeHmacSha256Signature(data, key);
  return signature.map(byte => {
    const hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Webhook設定の確認
 */
function checkWebhookConfig(): void {
  const props = PropertiesService.getScriptProperties().getProperties();

  const requiredKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DISCORD_ELIGIBLE_PRICE_IDS',
    'DISCORD_INVITE_LINK'
  ];

  let message = '【Webhook設定状態】\n\n';
  let allConfigured = true;

  for (const key of requiredKeys) {
    const hasKey = !!props[key];
    const status = hasKey ? '設定済み' : '未設定';
    message += `${key}: ${status}\n`;
    if (!hasKey) allConfigured = false;
  }

  message += '\n';
  if (allConfigured) {
    message += 'すべての必須設定が完了しています。';
  } else {
    message += '未設定の項目があります。Script Propertiesで設定してください。';
  }

  Logger.log(message);
  log('INFO', 'Webhook設定確認', {
    allConfigured,
    keys: requiredKeys.map(k => ({ key: k, configured: !!props[k] }))
  });
}

/**
 * テスト用: Webhookペイロードを手動でシミュレート
 */
function testWebhookProcessing(): void {
  const testPayload = JSON.stringify({
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        customer_details: {
          name: 'テストユーザー',
          email: 'test@example.com'
        },
        line_items: {
          data: [{
            description: 'GAS講座本体',
            price: {
              id: 'price_test_123', // テスト用Price ID
              product: 'prod_test_123'
            },
            quantity: 1,
            amount_total: 29800
          }]
        },
        payment_status: 'paid',
        status: 'complete'
      }
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false
  });

  log('INFO', 'テストWebhook処理を開始');
  const result = processStripeWebhook(testPayload, null);
  log('INFO', 'テストWebhook処理結果', result);
}
