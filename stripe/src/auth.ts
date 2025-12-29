/**
 * 認証API
 * Stripe決済者のメールアドレスを照合してアクセス制御
 */

const AUTH_SECRET = 'gas-course-auth-2025';
const SALES_SHEET_NAME = '売上記録';
const EMAIL_COLUMN = 4; // D列

/**
 * Web App POSTエンドポイント
 * メールアドレスを受け取り、認証結果を返す
 */
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  // CORS対応
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const requestData = JSON.parse(e.postData.contents);
    const email = requestData.email?.toLowerCase().trim();

    if (!email) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'メールアドレスを入力してください'
      }));
    }

    const isValid = checkEmailInSalesSheet(email);

    if (isValid) {
      const token = generateAuthToken(email);
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30日間有効

      log('INFO', '認証成功', { email: email });

      return output.setContent(JSON.stringify({
        success: true,
        token: token,
        expiresAt: expiresAt
      }));
    }

    log('WARN', '認証失敗: メールアドレスが見つかりません', { email: email });

    return output.setContent(JSON.stringify({
      success: false,
      message: 'このメールアドレスでの購入記録が見つかりません。\n決済時に使用したメールアドレスをご確認ください。'
    }));

  } catch (error) {
    log('ERROR', '認証処理でエラーが発生', { error: String(error) });

    return output.setContent(JSON.stringify({
      success: false,
      message: 'エラーが発生しました。しばらく経ってから再度お試しください。'
    }));
  }
}

/**
 * Web App GETエンドポイント
 * emailパラメータがある場合は認証処理を実行
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const email = e.parameter.email?.toLowerCase().trim();

    // emailパラメータがない場合はステータスを返す
    if (!email) {
      return output.setContent(JSON.stringify({
        status: 'ok',
        message: 'Auth API is running'
      }));
    }

    // メールアドレス認証処理
    const isValid = checkEmailInSalesSheet(email);

    if (isValid) {
      const token = generateAuthToken(email);
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30日間有効

      log('INFO', '認証成功', { email: email });

      return output.setContent(JSON.stringify({
        success: true,
        token: token,
        expiresAt: expiresAt
      }));
    }

    log('WARN', '認証失敗: メールアドレスが見つかりません', { email: email });

    return output.setContent(JSON.stringify({
      success: false,
      message: 'このメールアドレスでの購入記録が見つかりません。\n決済時に使用したメールアドレスをご確認ください。'
    }));

  } catch (error) {
    log('ERROR', '認証処理でエラーが発生', { error: String(error) });

    return output.setContent(JSON.stringify({
      success: false,
      message: 'エラーが発生しました。しばらく経ってから再度お試しください。'
    }));
  }
}

/**
 * 売上記録シートでメールアドレスを検索
 * @param email 検索するメールアドレス
 */
function checkEmailInSalesSheet(email: string): boolean {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_SHEET_NAME);

  if (!sheet) {
    log('ERROR', `シート「${SALES_SHEET_NAME}」が見つかりません`);
    return false;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return false;
  }

  // D列（メール）のデータを取得
  const emailData = sheet.getRange(2, EMAIL_COLUMN, lastRow - 1, 1).getValues();

  for (const row of emailData) {
    const sheetEmail = String(row[0]).toLowerCase().trim();
    if (sheetEmail === email) {
      return true;
    }
  }

  return false;
}

/**
 * 認証トークンを生成
 * @param email メールアドレス
 */
function generateAuthToken(email: string): string {
  const data = email + AUTH_SECRET + new Date().toISOString().split('T')[0];
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data);

  // バイト配列を16進数文字列に変換
  return hash.map(byte => {
    const hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * トークンを検証（オプション: サーバーサイド検証用）
 * @param email メールアドレス
 * @param token トークン
 */
function verifyAuthToken(email: string, token: string): boolean {
  // 今日と昨日のトークンを許可（日付境界対策）
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayToken = generateAuthTokenForDate(email, today);
  const yesterdayToken = generateAuthTokenForDate(email, yesterday);

  return token === todayToken || token === yesterdayToken;
}

/**
 * 指定日付のトークンを生成
 */
function generateAuthTokenForDate(email: string, date: Date): string {
  const data = email + AUTH_SECRET + date.toISOString().split('T')[0];
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data);

  return hash.map(byte => {
    const hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * 手動でメールアドレスを追加（テスト用）
 */
function addTestEmail(): void {
  const email = 'test@example.com';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_SHEET_NAME);

  if (sheet) {
    sheet.appendRow([
      new Date().toISOString(),
      'テスト商品',
      'テストユーザー',
      email,
      0, 0, 0, '成功', '', '', '', 'test_charge_id', ''
    ]);
    log('INFO', 'テストメールアドレスを追加しました', { email: email });
  }
}
