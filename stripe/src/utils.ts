/**
 * ユーティリティ関数
 * 日付変換、ログ出力など共通機能を提供
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * UNIXタイムスタンプをJST日時文字列に変換
 * @param timestamp UNIXタイムスタンプ（秒）
 * @returns JST日時文字列（例: "2025-12-28 09:00:00"）
 */
function formatTimestampJST(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * 現在のJST日時文字列を取得
 * @returns JST日時文字列
 */
function getCurrentTimeJST(): string {
  const now = new Date();
  return Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * 前日のJST 00:00:00〜23:59:59 のUNIXタイムスタンプ範囲を取得
 * @returns {start: 前日00:00:00のUNIXタイムスタンプ, end: 前日23:59:59のUNIXタイムスタンプ}
 */
function getYesterdayDateRange(): { start: number; end: number } {
  // 現在の日付から1日引く
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return getDateRange(yesterday);
}

/**
 * 指定日のJST 00:00:00〜23:59:59 のUNIXタイムスタンプ範囲を取得
 * @param date 対象日
 * @returns {start: 00:00:00のUNIXタイムスタンプ, end: 23:59:59のUNIXタイムスタンプ}
 */
function getDateRange(date: Date): { start: number; end: number } {
  // GASのタイムゾーンを使用してJSTの日付文字列を取得
  const dateStr = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');

  // JST 00:00:00 と 23:59:59 のDateオブジェクトを作成
  const startDate = new Date(dateStr + 'T00:00:00+09:00');
  const endDate = new Date(dateStr + 'T23:59:59+09:00');

  return {
    start: Math.floor(startDate.getTime() / 1000),
    end: Math.floor(endDate.getTime() / 1000)
  };
}

/**
 * ログを出力
 * @param level ログレベル（INFO, WARN, ERROR）
 * @param message メッセージ
 * @param data 追加データ（オプション）
 */
function log(level: LogLevel, message: string, data?: object): void {
  const timestamp = getCurrentTimeJST();
  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }

  Logger.log(logMessage);

  if (level === 'ERROR') {
    console.error(logMessage);
  }
}
