/**
 * サンプルメール送信機能
 * 受講者が自分のメールアドレスに注文確認メール（サンプル）を送信できる
 */

// 定数設定
const DAILY_LIMIT = 80; // 1日の送信上限（無料Gmail 100通/日 - 安全マージン）
const PROPERTIES_KEY_COUNT = 'emailSentCount'; // 送信カウンター
const PROPERTIES_KEY_DATE = 'lastResetDate'; // 最終リセット日

/**
 * Web AppのPOSTリクエストを処理
 */
function doPost(e) {
  try {
    // CORSヘッダーを含むレスポンスを返す
    const response = handleEmailRequest(e);
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'サーバーエラーが発生しました: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * メール送信リクエストを処理
 */
function handleEmailRequest(e) {
  // リクエストボディからメールアドレスを取得
  let emailAddress;
  try {
    const postData = JSON.parse(e.postData.contents);
    emailAddress = postData.email;
  } catch (error) {
    return {
      success: false,
      message: 'リクエストの形式が正しくありません'
    };
  }

  // メールアドレスのバリデーション
  if (!emailAddress || !isValidEmail(emailAddress)) {
    return {
      success: false,
      message: 'メールアドレスの形式が正しくありません'
    };
  }

  // 送信制限チェック
  const limitCheck = checkDailyLimit();
  if (!limitCheck.allowed) {
    return {
      success: false,
      message: limitCheck.message
    };
  }

  // メール送信
  try {
    sendSampleEmail(emailAddress);

    // 送信カウンターを増やす
    incrementEmailCount();

    return {
      success: true,
      message: 'サンプルメールを送信しました！Gmailを確認してください'
    };
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    return {
      success: false,
      message: 'メール送信中にエラーが発生しました: ' + error.toString()
    };
  }
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
 * サンプルメールを送信
 */
function sendSampleEmail(toEmail) {
  const orderNumber = generateOrderNumber();
  const orderDateTime = generateOrderDateTime();
  const deliveryDate = generateDeliveryDate();

  const subject = '【注文完了】ご注文ありがとうございます';

  const body = `━━━━━━━━━━━━━━━━━━━━━
  ご注文ありがとうございます
━━━━━━━━━━━━━━━━━━━━━

注文番号: ${orderNumber}
注文日時: ${orderDateTime}

【商品情報】
商品名: ノートパソコン HP Pavilion 15
数量: 1個
価格: 89,800円

お届け予定日: ${deliveryDate}
配送先: ご登録住所

━━━━━━━━━━━━━━━━━━━━━
※このメールはGAS講座の練習用サンプルです
`;

  GmailApp.sendEmail(toEmail, subject, body);
  Logger.log(`Sample email sent to ${toEmail} with order number ${orderNumber}`);
}

/**
 * テスト用関数: 自分宛にメールを送信
 */
function testSendEmail() {
  const myEmail = Session.getActiveUser().getEmail();
  sendSampleEmail(myEmail);
  Logger.log('Test email sent to: ' + myEmail);
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
