/**
 * 【デモ用】注文メール自動転記システム
 * 動画撮影用のデモコード
 * 資料に合わせた完全デモ仕様
 */

/**
 * スプレッドシートを開いたときに実行される関数
 * カスタムメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 注文メール転記')
    .addItem('🎬 初期データをセットアップ', 'setupInitialData')
    .addSeparator()
    .addItem('✨ 新しい注文を転記する', 'transferNewOrders')
    .addToUi();
}

/**
 * 初期データをセットアップする関数
 * 「受注一覧」シートにヘッダー行と既存の注文データ3-4件を作成
 */
function setupInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 「受注一覧」シートを取得または作成
  let sheet = ss.getSheetByName('受注一覧');
  if (!sheet) {
    sheet = ss.insertSheet('受注一覧');
  }

  // シートをクリア
  sheet.clear();

  // ヘッダー行を作成（A列から始まる完全なヘッダー）
  const headers = [
    'A列', 'B列', '注文ID', 'D列', '注文日時', 'F列', 'お客様名',
    'H列', 'I列', '商品名', 'K列', '小計', 'M列', '配送希望日'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダー行のスタイル設定
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4f46e5')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 既存の注文データ（初期データ）
  const initialData = [
    ['', '', 'ORD-12345', '', '2025/10/28 14:30', '', '山田太郎', '', '', '有機りんご 5kg', '', '4,500', '', '2025/11/01'],
    ['', '', 'ORD-12346', '', '2025/10/29 10:15', '', '佐藤花子', '', '', '無農薬にんじん 3kg', '', '2,800', '', '2025/11/02'],
    ['', '', 'ORD-12347', '', '2025/10/30 16:45', '', '鈴木一郎', '', '', '特選トマト 2kg', '', '3,200', '', '2025/11/03'],
    ['', '', 'ORD-12348', '', '2025/10/31 09:20', '', '田中美咲', '', '', 'オーガニックほうれん草 1kg', '', '1,800', '', '2025/11/04']
  ];

  // 初期データを追加
  sheet.getRange(2, 1, initialData.length, initialData[0].length).setValues(initialData);

  // 注文IDの列（C列）を強調表示
  sheet.getRange(1, 3, initialData.length + 1, 1)
    .setBackground('#fef3c7')
    .setFontWeight('bold');

  // 列幅を調整
  sheet.setColumnWidth(3, 120); // 注文ID
  sheet.setColumnWidth(5, 150); // 注文日時
  sheet.setColumnWidth(7, 100); // お客様名
  sheet.setColumnWidth(10, 200); // 商品名
  sheet.setColumnWidth(12, 80); // 小計
  sheet.setColumnWidth(14, 120); // 配送希望日

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '初期データのセットアップが完了しました',
    '完了',
    3
  );

  Logger.log('初期データのセットアップが完了しました');
}

/**
 * 新しい注文メールをスプレッドシートに転記する関数（デモ用）
 * ダミーの注文データを1件ずつリアルタイムで転記
 */
function transferNewOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('受注一覧');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('「受注一覧」シートが見つかりません。先に初期データをセットアップしてください。');
    return;
  }

  const statusCell = sheet.getRange('F12');

  // ダミーの新規注文メールデータ（資料のフォーマットに合わせる）
  const newOrders = [
    {
      orderId: 'ORD-12349',
      orderDate: '2025/11/01 11:20',
      customerName: '高橋健太',
      productName: '朝採れレタス 2kg',
      amount: '2,400',
      shippingDate: '2025/11/05'
    },
    {
      orderId: 'ORD-12350',
      orderDate: '2025/11/01 14:55',
      customerName: '伊藤美香',
      productName: '季節の野菜セット',
      amount: '5,800',
      shippingDate: '2025/11/06'
    },
    {
      orderId: 'ORD-12351',
      orderDate: '2025/11/01 17:30',
      customerName: '渡辺誠',
      productName: '有機キャベツ 1.5kg',
      amount: '1,500',
      shippingDate: '2025/11/07'
    }
  ];

  // 処理開始の通知
  statusCell.setValue('📧 Gmailから注文メールを検索中...')
    .setBackground('#4f46e5')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(12);
  SpreadsheetApp.flush();
  Utilities.sleep(2000);

  // 1件ずつ処理
  newOrders.forEach((order, index) => {
    // メール検索中の通知
    statusCell.setValue(`🔍 ${index + 1}件目のメールを検索中...`)
      .setBackground('#8b5cf6')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1100);

    // 情報抽出中の通知
    statusCell.setValue(`📋 情報抽出中\n${order.customerName}様の注文`)
      .setBackground('#ec4899')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1300);

    // C列（注文ID）の最終行を基準に追記
    const idColumn = sheet.getRange('C:C').getValues();
    let lastRowInC = 0;
    for (let i = idColumn.length - 1; i >= 0; i--) {
      if (idColumn[i][0] !== '') {
        lastRowInC = i + 1;
        break;
      }
    }

    const newRow = lastRowInC + 1;

    // 各列に値を書き込む（C, E, G, J, L, N列）
    sheet.getRange(newRow, 3).setValue(order.orderId);        // C列: 注文ID
    sheet.getRange(newRow, 5).setValue(order.orderDate);      // E列: 注文日時
    sheet.getRange(newRow, 7).setValue(order.customerName);   // G列: お客様名
    sheet.getRange(newRow, 10).setValue(order.productName);   // J列: 商品名
    sheet.getRange(newRow, 12).setValue(order.amount);        // L列: 小計
    sheet.getRange(newRow, 14).setValue(order.shippingDate);  // N列: 配送希望日

    SpreadsheetApp.flush(); // 即座に反映

    // 転記完了の通知
    statusCell.setValue(`✅ ${index + 1}/${newOrders.length}件 転記完了\n${order.orderId}`)
      .setBackground('#10b981')
      .setFontColor('#ffffff');
    SpreadsheetApp.flush();
    Utilities.sleep(1600);
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

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${newOrders.length}件の新しい注文を転記しました`,
    '転記完了',
    5
  );
}
