/**
 * スプレッドシート操作
 * 売上データの記録と重複チェックを担当
 */

// 売上レコードの型定義
interface SalesRecord {
  paymentDate: string;      // A: 支払日時
  productName: string;      // B: 商品名
  customerName: string;     // C: 顧客名
  email: string;            // D: メール
  amount: number;           // E: 金額
  fee: number;              // F: 手数料
  netAmount: number;        // G: 純利益
  paymentStatus: string;    // H: 支払ステータス
  arrivalDate: string;      // I: 着金予定日
  arrivalStatus: string;    // J: 着金ステータス
  arrivalAmount: number | string;  // K: 着金金額
  chargeId: string;         // L: 決済ID
  payoutId: string;         // M: Payout ID
}

const SHEET_NAME = '売上記録';
const HEADERS = [
  '支払日時',
  '商品名',
  '顧客名',
  'メール',
  '金額',
  '手数料',
  '純利益',
  '支払ステータス',
  '着金予定日',
  '着金ステータス',
  '着金金額',
  '決済ID',
  'Payout ID'
];

const COLUMN_WIDTHS = [180, 250, 150, 250, 100, 100, 100, 120, 180, 120, 100, 280, 250];

/**
 * 売上記録シートを取得（存在しない場合は作成）
 */
function getSalesSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSalesSheet();
    log('INFO', `シート「${SHEET_NAME}」を作成しました`);
  }

  return sheet;
}

/**
 * シートの初期設定（ヘッダー、フォーマット）
 */
function setupSalesSheet(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // ヘッダー行を設定
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);

  // ヘッダーのスタイル設定
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // 列幅を設定
  for (let i = 0; i < COLUMN_WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, COLUMN_WIDTHS[i]);
  }

  // 1行目を固定
  sheet.setFrozenRows(1);

  // 金額列のフォーマット
  sheet.getRange('E:E').setNumberFormat('#,##0');
  sheet.getRange('F:F').setNumberFormat('#,##0');
  sheet.getRange('G:G').setNumberFormat('#,##0');
  sheet.getRange('K:K').setNumberFormat('#,##0');

  log('INFO', 'シートの初期設定を完了しました');
}

/**
 * 既存の決済IDをセットとして取得（重複チェック用）
 */
function getExistingChargeIds(): Set<string> {
  const sheet = getSalesSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return new Set<string>();
  }

  // L列（決済ID）のデータを取得
  const chargeIdColumn = 12; // L列
  const data = sheet.getRange(2, chargeIdColumn, lastRow - 1, 1).getValues();
  const chargeIds = new Set<string>();

  for (const row of data) {
    if (row[0]) {
      chargeIds.add(String(row[0]));
    }
  }

  return chargeIds;
}

/**
 * 決済IDが既に存在するかチェック
 * @param chargeId 決済ID
 * @param existingIds 既存の決済IDセット
 */
function isDuplicate(chargeId: string, existingIds: Set<string>): boolean {
  return existingIds.has(chargeId);
}

/**
 * 売上レコードをシートに追記
 * @param record 売上レコード
 */
function appendSalesRecord(record: SalesRecord): void {
  const sheet = getSalesSheet();

  const rowData = [
    record.paymentDate,
    record.productName,
    record.customerName,
    record.email,
    record.amount,
    record.fee,
    record.netAmount,
    record.paymentStatus,
    record.arrivalDate,
    record.arrivalStatus,
    record.arrivalAmount,
    record.chargeId,
    record.payoutId
  ];

  sheet.appendRow(rowData);
}

/**
 * 複数の売上レコードを一括追記（パフォーマンス最適化）
 * @param records 売上レコードの配列
 */
function appendSalesRecords(records: SalesRecord[]): void {
  if (records.length === 0) return;

  const sheet = getSalesSheet();
  const lastRow = sheet.getLastRow();

  const rowsData = records.map(record => [
    record.paymentDate,
    record.productName,
    record.customerName,
    record.email,
    record.amount,
    record.fee,
    record.netAmount,
    record.paymentStatus,
    record.arrivalDate,
    record.arrivalStatus,
    record.arrivalAmount,
    record.chargeId,
    record.payoutId
  ]);

  sheet.getRange(lastRow + 1, 1, rowsData.length, HEADERS.length).setValues(rowsData);
  log('INFO', `${records.length}件のレコードを追記しました`);
}

// ============================================
// Discord招待メール送信ログ機能
// ============================================

const EMAIL_LOG_SHEET_NAME = 'Discord招待メール送信ログ';
const EMAIL_LOG_HEADERS = ['Session ID', 'Email', '商品名', '送信日時'];

/**
 * メール送信ログシートを取得（存在しない場合は作成）
 */
function getEmailLogSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_LOG_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(EMAIL_LOG_SHEET_NAME);
    setupEmailLogSheet(sheet);
    log('INFO', `シート「${EMAIL_LOG_SHEET_NAME}」を作成しました`);
  }

  return sheet;
}

/**
 * メール送信ログシートの初期設定
 */
function setupEmailLogSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  // ヘッダー行を設定
  const headerRange = sheet.getRange(1, 1, 1, EMAIL_LOG_HEADERS.length);
  headerRange.setValues([EMAIL_LOG_HEADERS]);

  // ヘッダーのスタイル設定
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#5865F2');  // Discordカラー
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // 列幅を設定
  sheet.setColumnWidth(1, 300);  // Session ID
  sheet.setColumnWidth(2, 250);  // Email
  sheet.setColumnWidth(3, 200);  // 商品名
  sheet.setColumnWidth(4, 180);  // 送信日時

  // 1行目を固定
  sheet.setFrozenRows(1);
}

/**
 * メールが既に送信済みかチェック
 * @param sessionId Checkout Session ID
 */
function isEmailAlreadySent(sessionId: string): boolean {
  const sheet = getEmailLogSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return false;
  }

  // A列（Session ID）のデータを取得
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (const row of data) {
    if (String(row[0]) === sessionId) {
      return true;
    }
  }

  return false;
}

/**
 * メール送信記録を保存
 * @param sessionId Checkout Session ID
 * @param email 送信先メールアドレス
 * @param productName 商品名
 */
function markEmailSentForSession(sessionId: string, email: string, productName: string): void {
  const sheet = getEmailLogSheet();
  const timestamp = Utilities.formatDate(
    new Date(),
    'Asia/Tokyo',
    'yyyy-MM-dd HH:mm:ss'
  );

  sheet.appendRow([sessionId, email, productName, timestamp]);
  log('INFO', 'メール送信記録を保存しました', { sessionId, email, productName });
}

/**
 * メール送信ログを取得（直近N件）
 * @param limit 取得件数（デフォルト: 10）
 */
function getRecentEmailLogs(limit: number = 10): Array<{sessionId: string; email: string; productName: string; sentAt: string}> {
  const sheet = getEmailLogSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  const data = sheet.getRange(startRow, 1, numRows, EMAIL_LOG_HEADERS.length).getValues();

  return data.reverse().map(row => ({
    sessionId: String(row[0]),
    email: String(row[1]),
    productName: String(row[2]),
    sentAt: String(row[3])
  }));
}

/**
 * メール送信ログの件数を取得
 */
function getEmailLogCount(): number {
  const sheet = getEmailLogSheet();
  return Math.max(0, sheet.getLastRow() - 1);
}
