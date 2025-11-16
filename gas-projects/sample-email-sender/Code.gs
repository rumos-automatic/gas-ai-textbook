/**
 * サンプルメール送信機能
 * 受講者が自分のメールアドレスに注文確認メール（サンプル）を送信できる
 */

// 定数設定
const DAILY_LIMIT = 80; // 1日の送信上限（無料Gmail 100通/日 - 安全マージン）
const PROPERTIES_KEY_COUNT = 'emailSentCount'; // 送信カウンター
const PROPERTIES_KEY_DATE = 'lastResetDate'; // 最終リセット日

/**
 * Web AppのGETリクエストを処理（JSONP対応）
 */
function doGet(e) {
  try {
    // URLパラメータから値を取得
    const callback = e.parameter.callback;
    const email = e.parameter.email;

    let response;

    // callbackが指定されていない場合（直接アクセス）
    if (!callback) {
      response = {
        success: false,
        message: 'このエンドポイントはJSONP経由でのみアクセスできます'
      };
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // メールアドレスのバリデーション
    if (!email || !isValidEmail(email)) {
      response = {
        success: false,
        message: 'メールアドレスの形式が正しくありません'
      };
      return createJsonpResponse(callback, response);
    }

    // 送信制限チェック
    const limitCheck = checkDailyLimit();
    if (!limitCheck.allowed) {
      response = {
        success: false,
        message: limitCheck.message
      };
      return createJsonpResponse(callback, response);
    }

    // メール送信
    try {
      sendSampleEmail(email);

      // 送信カウンターを増やす
      incrementEmailCount();

      response = {
        success: true,
        message: 'サンプルメールを送信しました！Gmailを確認してください'
      };
      return createJsonpResponse(callback, response);

    } catch (error) {
      Logger.log('Error sending email: ' + error.toString());
      response = {
        success: false,
        message: 'メール送信中にエラーが発生しました: ' + error.toString()
      };
      return createJsonpResponse(callback, response);
    }

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    const callback = e.parameter.callback || 'callback';
    const response = {
      success: false,
      message: 'サーバーエラーが発生しました: ' + error.toString()
    };
    return createJsonpResponse(callback, response);
  }
}

/**
 * JSONP形式のレスポンスを作成
 */
function createJsonpResponse(callback, data) {
  const jsonpResponse = callback + '(' + JSON.stringify(data) + ')';
  return ContentService.createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * メールアドレスの形式をチェック
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 1日の送信制限をチェック
 */
function checkDailyLimit() {
  const props = PropertiesService.getScriptProperties();
  const today = new Date().toDateString();
  const lastResetDate = props.getProperty(PROPERTIES_KEY_DATE);

  // 日付が変わっていたらカウンターをリセット
  if (lastResetDate !== today) {
    props.setProperty(PROPERTIES_KEY_COUNT, '0');
    props.setProperty(PROPERTIES_KEY_DATE, today);
    return {
      allowed: true,
      message: ''
    };
  }

  // 現在の送信回数を取得
  const currentCount = parseInt(props.getProperty(PROPERTIES_KEY_COUNT) || '0');

  if (currentCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      message: '本日の送信上限に達しました。明日再度お試しください'
    };
  }

  return {
    allowed: true,
    message: ''
  };
}

/**
 * 送信カウンターを増やす
 */
function incrementEmailCount() {
  const props = PropertiesService.getScriptProperties();
  const currentCount = parseInt(props.getProperty(PROPERTIES_KEY_COUNT) || '0');
  props.setProperty(PROPERTIES_KEY_COUNT, (currentCount + 1).toString());
}

/**
 * 7つの商品パターン定義
 * 実践編①と②で使用する固定の注文データ
 */
const PRODUCT_PATTERNS = [
  {
    orderId: 'ORD-12345',
    productName: '有機りんご 5kg',
    quantity: '2箱',
    price: '5,600円',
    customerName: '山田太郎'
  },
  {
    orderId: 'ORD-12346',
    productName: 'ノートパソコン HP Pavilion 15',
    quantity: '1台',
    price: '89,800円',
    customerName: '佐藤花子'
  },
  {
    orderId: 'ORD-12347',
    productName: 'コーヒーメーカー DeLonghi',
    quantity: '1台',
    price: '24,800円',
    customerName: '鈴木一郎'
  },
  {
    orderId: 'ORD-12348',
    productName: 'ビジネス書籍セット（5冊）',
    quantity: '1セット',
    price: '12,500円',
    customerName: '田中次郎'
  },
  {
    orderId: 'ORD-12349',
    productName: 'ワイヤレスイヤホン Sony WF-1000XM5',
    quantity: '1個',
    price: '36,300円',
    customerName: '高橋三郎'
  },
  {
    orderId: 'ORD-12350',
    productName: 'オーガニックコーヒー豆 1kg',
    quantity: '3袋',
    price: '8,400円',
    customerName: '伊藤四郎'
  },
  {
    orderId: 'ORD-12351',
    productName: 'アロマディフューザー',
    quantity: '2個',
    price: '15,600円',
    customerName: '渡辺五郎'
  }
];

/**
 * ランダムな注文番号を生成
 * 形式: YYYYMMDD-XXXXX（例: 20250102-87435）
 */
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // 5桁のランダム数字を生成
  const randomPart = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

  return `${datePart}-${randomPart}`;
}

/**
 * 注文日時を生成（日本語形式）
 */
function generateOrderDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * お届け予定日を生成（3日後）
 */
function generateDeliveryDate() {
  const now = new Date();
  now.setDate(now.getDate() + 3); // 3日後

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * サンプルメールを送信（単一パターン）
 * @param {string} toEmail - 送信先メールアドレス
 * @param {number} patternIndex - 使用する商品パターンのインデックス（0-6）。未指定の場合はランダム
 */
function sendSampleEmail(toEmail, patternIndex) {
  // パターンインデックスが未指定の場合はランダムに選択
  if (patternIndex === undefined || patternIndex === null) {
    patternIndex = Math.floor(Math.random() * PRODUCT_PATTERNS.length);
  }

  // インデックスの範囲チェック
  if (patternIndex < 0 || patternIndex >= PRODUCT_PATTERNS.length) {
    throw new Error(`Invalid pattern index: ${patternIndex}. Must be 0-${PRODUCT_PATTERNS.length - 1}`);
  }

  const pattern = PRODUCT_PATTERNS[patternIndex];
  const orderDateTime = generateOrderDateTime();
  const deliveryDate = generateDeliveryDate();

  const subject = '【注文受付】ご注文ありがとうございます';

  const body = `━━━━━━━━━━━━━━━━━━━━━
  ご注文ありがとうございます
━━━━━━━━━━━━━━━━━━━━━

注文ID: ${pattern.orderId}
注文日時: ${orderDateTime}
お客様名: ${pattern.customerName}

【ご注文内容】
商品名: ${pattern.productName}
数量: ${pattern.quantity}
小計: ${pattern.price}

配送希望日: ${deliveryDate}

━━━━━━━━━━━━━━━━━━━━━
※このメールはGAS講座の練習用サンプルです
`;

  GmailApp.sendEmail(toEmail, subject, body);
  Logger.log(`Sample email sent to ${toEmail} - Order ID: ${pattern.orderId}, Product: ${pattern.productName}`);
}

/**
 * 7つすべてのサンプルメールを送信
 * @param {string} toEmail - 送信先メールアドレス
 */
function sendAllSampleEmails(toEmail) {
  Logger.log(`Sending all ${PRODUCT_PATTERNS.length} sample emails to ${toEmail}`);

  for (let i = 0; i < PRODUCT_PATTERNS.length; i++) {
    sendSampleEmail(toEmail, i);
    // Gmail APIのレート制限を避けるため、各メール間に1秒の遅延を入れる
    if (i < PRODUCT_PATTERNS.length - 1) {
      Utilities.sleep(1000);
    }
  }

  Logger.log(`Successfully sent all ${PRODUCT_PATTERNS.length} sample emails`);
}

/**
 * テスト用関数: 自分宛にランダムなサンプルメールを1通送信
 */
function testSendEmail() {
  const myEmail = Session.getActiveUser().getEmail();
  sendSampleEmail(myEmail);
  Logger.log('Test email sent to: ' + myEmail);
}

/**
 * テスト用関数: 自分宛に7つすべてのサンプルメールを送信
 */
function testSendAllEmails() {
  const myEmail = Session.getActiveUser().getEmail();
  sendAllSampleEmails(myEmail);
  Logger.log('All 7 test emails sent to: ' + myEmail);
}

/**
 * テスト用関数: 送信カウンターをリセット
 */
function resetEmailCount() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(PROPERTIES_KEY_COUNT, '0');
  props.setProperty(PROPERTIES_KEY_DATE, new Date().toDateString());
  Logger.log('Email count has been reset');
}

/**
 * テスト用関数: 現在の送信カウントを確認
 */
function checkCurrentCount() {
  const props = PropertiesService.getScriptProperties();
  const count = props.getProperty(PROPERTIES_KEY_COUNT) || '0';
  const date = props.getProperty(PROPERTIES_KEY_DATE) || 'Not set';
  Logger.log(`Current count: ${count}, Last reset date: ${date}`);
  return { count: count, date: date };
}
