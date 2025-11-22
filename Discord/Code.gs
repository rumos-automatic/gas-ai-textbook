/**
 * Discord予約投稿ツール
 * スプレッドシートに設定した日時・内容でDiscordに自動投稿します
 */

// ======================
// 設定関連の関数
// ======================

/**
 * 【最も簡単】スプレッドシートを自動作成してセットアップ
 * この関数を実行するだけで、すべての初期設定が完了します
 */
function createSpreadsheetAndSetup() {
  Logger.log('=== Discord予約投稿用スプレッドシート作成開始 ===');

  // 新しいスプレッドシートを作成
  const spreadsheet = SpreadsheetApp.create('Discord予約投稿管理');
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName('投稿管理');

  Logger.log(`✅ スプレッドシート作成完了`);

  // ヘッダー行を設定
  const headers = [
    '投稿日付',
    '投稿時刻',
    '投稿内容',
    'Webhook URL',
    '送信者名',
    '送信者アイコンURL',
    '送信先',
    '送信者名',
    '送信済み',
    '送信日時',
    '備考'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダー行を太字にして背景色を設定
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  // 列幅を調整
  sheet.setColumnWidth(1, 120); // 投稿日付
  sheet.setColumnWidth(2, 100); // 投稿時刻
  sheet.setColumnWidth(3, 300); // 投稿内容
  sheet.setColumnWidth(4, 400); // Webhook URL
  sheet.setColumnWidth(5, 150); // 送信者名
  sheet.setColumnWidth(6, 300); // 送信者アイコンURL
  sheet.setColumnWidth(7, 150); // 送信先
  sheet.setColumnWidth(8, 150); // 送信者名
  sheet.setColumnWidth(9, 100); // 送信済み
  sheet.setColumnWidth(10, 150); // 送信日時
  sheet.setColumnWidth(11, 150); // 備考

  // サンプルデータを追加（オプション）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const sampleData = [
    [
      Utilities.formatDate(tomorrow, 'Asia/Tokyo', 'yyyy-MM-dd'),
      '09:00',
      'これはサンプル投稿です。この行を編集または削除してください。',
      'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE',
      'お知らせボット',
      '',
      '',
      '',
      '',
      '',
      'サンプル'
    ]
  ];
  sheet.getRange(2, 1, 1, sampleData[0].length).setValues(sampleData);

  Logger.log('✅ ヘッダー行とサンプルデータを設定しました');

  // スプレッドシートIDをプロパティに保存
  const spreadsheetId = spreadsheet.getId();
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);

  Logger.log(`✅ スプレッドシートIDを保存しました: ${spreadsheetId}`);

  // スプレッドシートのURLを出力
  const url = spreadsheet.getUrl();
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🎉 セットアップ完了！');
  Logger.log('========================================');
  Logger.log(`📊 スプレッドシートURL: ${url}`);
  Logger.log('');
  Logger.log('次のステップ:');
  Logger.log('1. 上記URLをブラウザで開く');
  Logger.log('2. Discord Webhook URLを取得（SETUP.md参照）');
  Logger.log('3. スプレッドシートのC列にWebhook URLを入力');
  Logger.log('4. GASエディタに戻り、createTrigger() 関数を実行');
  Logger.log('========================================');

  return spreadsheet;
}

/**
 * 【推奨】スプレッドシートIDを設定
 * 使い方：下の行のIDを実際のスプレッドシートIDに書き換えてから、この関数を実行してください
 *
 * 例：setSpreadsheetId('1ABC...XYZ');
 */
function setSpreadsheetId(spreadsheetId) {
  // ↓ここを実際のスプレッドシートIDに書き換えてください
  if (!spreadsheetId) {
    spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE';
  }

  if (spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
    Logger.log('❌ エラー: スプレッドシートIDを設定してください');
    Logger.log('使い方: この関数内の "YOUR_SPREADSHEET_ID_HERE" を実際のIDに書き換えて実行してください');
    throw new Error('スプレッドシートIDが設定されていません。関数内のIDを書き換えてください。');
  }

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId.trim());
  Logger.log(`✅ 設定完了: スプレッドシートID "${spreadsheetId.trim()}" が保存されました`);
  Logger.log('次のステップ: createTrigger() を実行してトリガーを設定してください');
}

/**
 * スプレッドシートIDを取得
 */
function getSpreadsheetId() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('スプレッドシートIDが設定されていません。setupSpreadsheetId() を実行してください。');
  }
  return spreadsheetId;
}

// ======================
// メイン処理
// ======================

/**
 * メイン関数：定期実行されるトリガー関数
 * 1分ごとまたは5分ごとにトリガー設定して使用します
 */
function checkAndPostToDiscord() {
  try {
    Logger.log('=== Discord投稿チェック開始 ===');

    // スプレッドシート取得
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheets()[0]; // 1枚目のシートを使用

    // データ取得（ヘッダー行除く）
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      Logger.log('投稿データがありません');
      return;
    }

    const now = new Date();
    Logger.log(`現在時刻: ${formatDateTime(now)}`);

    // 2行目から処理（1行目はヘッダー）
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowNumber = i + 1;

      const scheduledDate = row[0];  // A列：投稿日付
      const scheduledTime = row[1];  // B列：投稿時刻
      const message = row[2];        // C列：投稿内容
      const webhookUrl = row[3];     // D列：Webhook URL
      const username = row[4];       // E列：送信者名
      const avatarUrl = row[5];      // F列：送信者アイコンURL
      const isSent = row[8];         // I列：送信済み

      // 空行スキップ（日付、時刻、メッセージ、Webhook URLは必須）
      if (!scheduledDate || !scheduledTime || !message || !webhookUrl) {
        continue;
      }

      // 既に送信済みの場合はスキップ
      if (isSent === true || isSent === 'TRUE' || isSent === '送信済み') {
        continue;
      }

      // 日付と時刻を結合してDateオブジェクトを作成
      let scheduledDateTime;
      try {
        // 日付を文字列に変換
        let dateStr;
        if (scheduledDate instanceof Date) {
          dateStr = Utilities.formatDate(scheduledDate, 'Asia/Tokyo', 'yyyy-MM-dd');
        } else {
          dateStr = String(scheduledDate).trim();
        }

        // 時刻を文字列に変換
        let timeStr;
        if (scheduledTime instanceof Date) {
          timeStr = Utilities.formatDate(scheduledTime, 'Asia/Tokyo', 'HH:mm');
        } else {
          timeStr = String(scheduledTime).trim();
        }

        // 日付と時刻を結合（例：2025-11-21 14:00）
        const dateTimeStr = `${dateStr} ${timeStr}`;
        scheduledDateTime = new Date(dateTimeStr);
      } catch (error) {
        Logger.log(`[行${rowNumber}] 日時の変換エラー: ${error.message}`);
        continue;
      }

      // 日時が無効な場合はスキップ
      if (isNaN(scheduledDateTime.getTime())) {
        Logger.log(`[行${rowNumber}] 無効な日時形式: ${dateTimeStr}`);
        continue;
      }

      // 投稿時刻が現在時刻を過ぎているかチェック
      if (scheduledDateTime <= now) {
        Logger.log(`[行${rowNumber}] 投稿実行: ${formatDateTime(scheduledDateTime)}`);

        // Discord投稿実行
        const success = postToDiscord(webhookUrl, message, username, avatarUrl, rowNumber);

        // 送信成功時、送信済みフラグと送信日時を更新
        if (success) {
          sheet.getRange(rowNumber, 9).setValue('送信済み'); // I列：送信済み
          const formattedDate = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
          sheet.getRange(rowNumber, 10).setValue(formattedDate); // J列：送信日時
          Logger.log(`[行${rowNumber}] 送信済みフラグ更新完了`);
        }
      } else {
        Logger.log(`[行${rowNumber}] 投稿時刻未達: ${formatDateTime(scheduledDateTime)}`);
      }
    }

    Logger.log('=== Discord投稿チェック終了 ===');

  } catch (error) {
    Logger.log(`エラー発生: ${error.message}`);
    Logger.log(error.stack);
  }
}

/**
 * Discordに投稿する
 * @param {string} webhookUrl - Discord Webhook URL
 * @param {string} message - 投稿メッセージ
 * @param {string} username - 送信者名（オプション）
 * @param {string} avatarUrl - 送信者アイコンURL（オプション）
 * @param {number} rowNumber - 行番号（ログ用）
 * @return {boolean} 送信成功したかどうか
 */
function postToDiscord(webhookUrl, message, username, avatarUrl, rowNumber) {
  try {
    // Webhook URLの簡易検証
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
        !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      Logger.log(`[行${rowNumber}] 無効なWebhook URL: ${webhookUrl}`);
      return false;
    }

    // Discord Webhook APIに投稿
    const payload = {
      content: message
    };

    // 送信者名が指定されている場合は追加
    if (username && String(username).trim()) {
      payload.username = String(username).trim();
    }

    // アイコンURLが指定されている場合は追加
    if (avatarUrl && String(avatarUrl).trim()) {
      payload.avatar_url = String(avatarUrl).trim();
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(webhookUrl, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 204 || statusCode === 200) {
      Logger.log(`[行${rowNumber}] Discord投稿成功 (ステータスコード: ${statusCode})`);
      return true;
    } else {
      Logger.log(`[行${rowNumber}] Discord投稿失敗 (ステータスコード: ${statusCode})`);
      Logger.log(`レスポンス: ${response.getContentText()}`);
      return false;
    }

  } catch (error) {
    Logger.log(`[行${rowNumber}] Discord投稿エラー: ${error.message}`);
    return false;
  }
}

// ======================
// ユーティリティ関数
// ======================

/**
 * 日時を読みやすい形式でフォーマット
 * @param {Date} date - フォーマットする日時
 * @return {string} フォーマット済み日時文字列
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

// ======================
// トリガー設定用関数
// ======================

/**
 * トリガー設定：1分ごとに実行
 * 使い方：この関数を1回だけ実行してください
 */
function createTrigger() {
  // 既存のトリガーを削除
  deleteTriggers();

  // 1分ごとにcheckAndPostToDiscordを実行するトリガーを作成
  ScriptApp.newTrigger('checkAndPostToDiscord')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('✅ トリガー作成完了：1分ごとに実行されます');
  Logger.log('セットアップ完了！スプレッドシートに投稿内容を入力してください');
}

/**
 * トリガー削除：すべてのトリガーを削除
 */
function deleteTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log(`${triggers.length}個のトリガーを削除しました`);
}

// ======================
// テスト用関数
// ======================

/**
 * テスト投稿：即座にDiscordに投稿してみる
 */
function testPost() {
  const testWebhookUrl = 'YOUR_WEBHOOK_URL_HERE'; // ここにテスト用のWebhook URLを入力
  const testMessage = 'これはテスト投稿です';

  if (testWebhookUrl === 'YOUR_WEBHOOK_URL_HERE') {
    Logger.log('テスト用のWebhook URLを設定してください');
    return;
  }

  const success = postToDiscord(testWebhookUrl, testMessage, 0);

  if (success) {
    Logger.log('テスト投稿成功！');
  } else {
    Logger.log('テスト投稿失敗');
  }
}
