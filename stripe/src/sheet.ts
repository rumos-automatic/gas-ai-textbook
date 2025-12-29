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
