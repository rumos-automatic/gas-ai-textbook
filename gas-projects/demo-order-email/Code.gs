/**
 * 【デモ用】注文メール自動転記システム
 * 動画撮影用のデモコード
 */

/**
 * スプレッドシートを開いたときに実行される関数
 * カスタムメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 注文メール転記')
    .addItem('🎬 デモ用：初期データをセットアップ', 'setupInitialData')
    .addSeparator()
    .addItem('✨ 新しい注文を転記する', 'transferNewOrders')
    .addSeparator()
    .addItem('📮 Gmail連携：注文メールを転記', 'transferOrderEmailsFromGmail')
    .addToUi();
}

/**
 * 初期データをセットアップする関数
 * スプレッドシートにヘッダー行と既存の注文データ3-4件を作成
 */
function setupInitialData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // シートをクリア
  sheet.clear();

  // ヘッダー行を作成
  const headers = ['受信日', '件名', '差出人', 'メールアドレス', '注文ID', '注文日時', '商品名', '数量', '金額'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダー行のスタイル設定
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4f46e5')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 既存の注文データ（初期データ）
  const initialData = [
    ['2025-11-11', '【注文完了】ご注文ありがとうございます', '山田太郎', 'yamada@example.com', '20251111-78901', '2025年11月11日 10:15', 'ノートパソコン HP Pavilion 15', '1個', '¥89,800'],
    ['2025-11-12', '【注文完了】ご注文ありがとうございます', '佐藤花子', 'sato@example.com', '20251112-23456', '2025年11月12日 14:30', 'ワイヤレスマウス Logicool MX Master 3', '1個', '¥12,800'],
    ['2025-11-13', '【注文完了】ご注文ありがとうございます', '鈴木一郎', 'suzuki@example.com', '20251113-34567', '2025年11月13日 09:45', 'USB-C ハブ 7in1', '2個', '¥7,960'],
    ['2025-11-13', '【注文完了】ご注文ありがとうございます', '田中美咲', 'tanaka@example.com', '20251113-45678', '2025年11月13日 16:20', 'モバイルバッテリー Anker 20000mAh', '1個', '¥6,980']
  ];

  // 初期データを追加
  sheet.getRange(2, 1, initialData.length, initialData[0].length).setValues(initialData);

  Logger.log('初期データのセットアップが完了しました');
}

/**
 * 新しい注文メールをスプレッドシートに転記する関数（デモ用）
 * ダミーの注文データを1件ずつリアルタイムで転記
 */
function transferNewOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const statusCell = sheet.getRange('F12');

  // ダミーの新規注文メールデータ
  const newOrders = [
    {
      date: '2025-11-14',
      subject: '【注文完了】ご注文ありがとうございます',
      from: '高橋健太',
      email: 'takahashi@example.com',
      orderId: '20251114-56789',
      orderDate: '2025年11月14日 11:20',
      product: '外付けSSD 1TB Samsung',
      quantity: '1個',
      amount: '¥15,800'
    },
    {
      date: '2025-11-14',
      subject: '【注文完了】ご注文ありがとうございます',
      from: '伊藤美香',
      email: 'ito@example.com',
      orderId: '20251114-67890',
      orderDate: '2025年11月14日 13:45',
      product: 'Webカメラ Logicool C920',
      quantity: '1個',
      amount: '¥9,800'
    },
    {
      date: '2025-11-14',
      subject: '【注文完了】ご注文ありがとうございます',
      from: '渡辺誠',
      email: 'watanabe@example.com',
      orderId: '20251114-78901',
      orderDate: '2025年11月14日 15:10',
      product: 'キーボード HHKB Professional',
      quantity: '1個',
      amount: '¥29,800'
    }
  ];

  // 処理開始の通知
  statusCell.setValue('📧 Gmailから注文メールを検索中...')
    .setBackground('#4f46e5')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(12);
  SpreadsheetApp.flush();
  Utilities.sleep(2000); // 2秒待機（1.5秒 × 1.33）

  // 1件ずつ処理
  newOrders.forEach((order, index) => {
    // メール検索中の通知
    statusCell.setValue(`🔍 ${index + 1}件目のメールを検索中...`)
      .setBackground('#8b5cf6')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1100); // 1.1秒待機（0.8秒 × 1.33）

    // 情報抽出中の通知
    statusCell.setValue(`📋 情報抽出中\n${order.from}`)
      .setBackground('#ec4899')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1300); // 1.3秒待機（1.0秒 × 1.33）

    // スプレッドシートに転記（A列の最終行を基準に追記）
    const valuesInA = sheet.getRange('A:A').getValues();
    let lastRowInA = 0;
    for (let i = valuesInA.length - 1; i >= 0; i--) {
      if (valuesInA[i][0] !== '') {
        lastRowInA = i + 1;
        break;
      }
    }

    const rowData = [
      order.date,
      order.subject,
      order.from,
      order.email,
      order.orderId,
      order.orderDate,
      order.product,
      order.quantity,
      order.amount
    ];

    sheet.getRange(lastRowInA + 1, 1, 1, rowData.length).setValues([rowData]);
    SpreadsheetApp.flush(); // 即座に反映

    // 転記完了の通知
    statusCell.setValue(`✅ ${index + 1}/${newOrders.length}件 転記完了\n${order.from}`)
      .setBackground('#10b981')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1600); // 1.6秒待機（1.2秒 × 1.33）
  });

  Logger.log(`新しい注文 ${newOrders.length} 件を転記しました`);

  // 全処理完了の通知
  statusCell.setValue(`🎉 完了！\n${newOrders.length}件転記`)
    .setBackground('#059669')
    .setFontColor('#ffffff');
  SpreadsheetApp.flush();

  // 3秒後にステータス表示をクリア
  Utilities.sleep(3000);
  statusCell.clear();
}

/**
 * 実際のGmail連携版（参考用）
 * ※デモではこちらは使用しません
 */
function transferOrderEmailsFromGmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Gmailから「注文」を含むメールを検索（過去7日間）
  const query = 'subject:注文 newer_than:7d';
  const threads = GmailApp.search(query, 0, 10);

  let newEmailCount = 0;

  threads.forEach(thread => {
    const messages = thread.getMessages();

    messages.forEach(message => {
      const messageId = message.getId();

      // 重複チェック：既に転記済みかどうか
      const lastRow = sheet.getLastRow();
      const existingIds = sheet.getRange(2, 8, lastRow - 1, 1).getValues().flat();

      if (existingIds.includes(messageId)) {
        return; // 既に転記済みの場合はスキップ
      }

      // メール情報を抽出
      const date = Utilities.formatDate(message.getDate(), 'Asia/Tokyo', 'yyyy-MM-dd');
      const subject = message.getSubject();
      const from = message.getFrom();
      const body = message.getPlainBody();

      // 簡易的な情報抽出（実際にはより高度な解析が必要）
      const emailMatch = from.match(/<(.+?)>/);
      const email = emailMatch ? emailMatch[1] : from;
      const nameMatch = from.match(/^(.+?)\s*</);
      const name = nameMatch ? nameMatch[1] : from;

      // 商品情報の抽出（簡易版）
      const productMatch = body.match(/商品[:：]\s*(.+)/);
      const product = productMatch ? productMatch[1].trim() : '';

      const quantityMatch = body.match(/数量[:：]\s*(\d+)/);
      const quantity = quantityMatch ? quantityMatch[1] : '';

      const amountMatch = body.match(/金額[:：]\s*[¥￥]?([\d,]+)/);
      const amount = amountMatch ? `¥${amountMatch[1]}` : '';

      // スプレッドシートに追加
      const rowData = [date, subject, name, email, product, quantity, amount, messageId];
      sheet.appendRow(rowData);

      newEmailCount++;
    });
  });

  Logger.log(`${newEmailCount} 件の新しいメールを転記しました`);

  if (newEmailCount > 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `${newEmailCount} 件の新しいメールを転記しました`,
      '転記完了',
      5
    );
  }
}
