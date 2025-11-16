/**
 * warmup-section-04用のサンプルスプレッドシートを自動生成
 *
 * 実行方法：
 * 1. このスクリプトエディタで「createAllSamples」関数を選択（推奨）
 * 2. 実行ボタンをクリック
 * 3. ログに表示されるURLからスプレッドシートを開く
 */

/**
 * すべてのサンプルを一括作成（IMPORTRANGE用も含む）
 */
function createAllSamples() {
  // 1. メインのスプレッドシートを作成
  Logger.log('=== メインスプレッドシートを作成中 ===');
  const mainUrl = createSampleSpreadsheet();

  // 2. IMPORTRANGE用のスプレッドシートを作成
  Logger.log('=== IMPORTRANGE用スプレッドシートを作成中 ===');
  const importRangeUrl = createImportRangeSample(mainUrl);

  // 3. 完了メッセージ
  Logger.log('\n========================================');
  Logger.log('✅ すべてのサンプル作成が完了しました！');
  Logger.log('========================================');
  Logger.log('📄 メインスプレッドシート: ' + mainUrl);
  Logger.log('📄 IMPORTRANGE サンプル: ' + importRangeUrl);
  Logger.log('========================================\n');
  Logger.log('スクリーンショット撮影手順：');
  Logger.log('1. 月次売上シートでB2セルを選択 → screenshot-warmup-multi-sheet.png');
  Logger.log('2. IMPORTRANGEサンプルでA1セルを選択 → screenshot-warmup-importrange.png');
}

/**
 * メインのサンプルスプレッドシートを作成
 */
function createSampleSpreadsheet() {
  // 1. 新しいスプレッドシートを作成
  const ss = SpreadsheetApp.create('実践ウォーミングアップ04_複数シート連携サンプル');
  Logger.log('スプレッドシートを作成しました: ' + ss.getUrl());

  // 2. デフォルトのSheet1を「注文管理」にリネーム
  const orderSheet = ss.getSheets()[0];
  orderSheet.setName('注文管理');

  // 3. 注文管理シートにデータを投入
  createOrderSheet(orderSheet);

  // 4. 月次売上シートを作成
  const monthlySheet = ss.insertSheet('月次売上');
  createMonthlySheet(monthlySheet);

  // 5. 完了メッセージ
  Logger.log('サンプルデータの作成が完了しました！');
  Logger.log('スプレッドシートURL: ' + ss.getUrl());

  return ss.getUrl();
}

/**
 * 注文管理シートにサンプルデータを投入
 */
function createOrderSheet(sheet) {
  // ヘッダー行
  const headers = [
    ['注文ID', '注文日', '商品名', '数量', '単価', '顧客名', 'ステータス', '金額']
  ];

  // サンプルデータ（1月、2月、3月に分散）
  const data = [
    ['ORD-001', new Date(2025, 0, 5),  'ノートPC',     1,  120000, '田中商事', '発送済み', '=D2*E2'],
    ['ORD-002', new Date(2025, 0, 12), 'マウス',       5,   2000,  '佐藤物産', '発送済み', '=D3*E3'],
    ['ORD-003', new Date(2025, 0, 20), 'キーボード',   3,   5000,  '鈴木企画', '準備中',   '=D4*E4'],
    ['ORD-004', new Date(2025, 1, 3),  'モニター',     2,  30000,  '山田工業', '発送済み', '=D5*E5'],
    ['ORD-005', new Date(2025, 1, 15), 'ノートPC',     2, 120000,  '田中商事', '準備中',   '=D6*E6'],
    ['ORD-006', new Date(2025, 2, 8),  'マウス',      10,   2000,  '佐藤物産', '発送済み', '=D7*E7']
  ];

  // ヘッダーを設定
  sheet.getRange(1, 1, 1, 8).setValues(headers);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');

  // データを設定
  sheet.getRange(2, 1, data.length, 8).setValues(data);

  // B列（注文日）を日付フォーマット
  sheet.getRange(2, 2, data.length, 1).setNumberFormat('yyyy年mm月dd日');

  // E列（単価）とH列（金額）を通貨フォーマット
  sheet.getRange(2, 5, data.length, 1).setNumberFormat('¥#,##0');
  sheet.getRange(2, 8, data.length, 1).setNumberFormat('¥#,##0');

  // 列幅を自動調整
  sheet.autoResizeColumns(1, 8);

  Logger.log('注文管理シートにデータを投入しました');
}

/**
 * 月次売上シートにSUMIFS関数を設定
 */
function createMonthlySheet(sheet) {
  // ヘッダー行
  const headers = [
    ['月', '合計売上']
  ];

  // 月ごとの集計（SUMIFS関数を使用）
  const monthlyData = [
    ['2025年1月', '=SUMIFS(注文管理!H:H, 注文管理!B:B, ">=2025/1/1", 注文管理!B:B, "<2025/2/1")'],
    ['2025年2月', '=SUMIFS(注文管理!H:H, 注文管理!B:B, ">=2025/2/1", 注文管理!B:B, "<2025/3/1")'],
    ['2025年3月', '=SUMIFS(注文管理!H:H, 注文管理!B:B, ">=2025/3/1", 注文管理!B:B, "<2025/4/1")']
  ];

  // ヘッダーを設定
  sheet.getRange(1, 1, 1, 2).setValues(headers);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#0F9D58').setFontColor('#FFFFFF');

  // データを設定
  sheet.getRange(2, 1, monthlyData.length, 2).setValues(monthlyData);

  // B列（合計売上）を通貨フォーマット
  sheet.getRange(2, 2, monthlyData.length, 1).setNumberFormat('¥#,##0');

  // 列幅を自動調整
  sheet.autoResizeColumns(1, 2);

  Logger.log('月次売上シートにSUMIFS関数を設定しました');
}

/**
 * IMPORTRANGE用のサンプルスプレッドシートを作成
 * @param {string} sourceUrl - インポート元のスプレッドシートURL
 */
function createImportRangeSample(sourceUrl) {
  // 1. スプレッドシートIDを抽出
  const sourceId = extractSpreadsheetId(sourceUrl);

  // 2. 新しいスプレッドシートを作成
  const ss = SpreadsheetApp.create('IMPORTRANGE サンプル - データ取得先');
  Logger.log('IMPORTRANGEサンプルを作成しました: ' + ss.getUrl());

  // 3. デフォルトシートを取得
  const sheet = ss.getSheets()[0];
  sheet.setName('データ取得');

  // 4. 説明テキストを追加
  sheet.getRange('A1').setValue('IMPORTRANGEで別スプレッドシートからデータを取得');
  sheet.getRange('A1').setFontWeight('bold').setFontSize(12);

  // 5. IMPORTRANGE関数を設定
  const importRangeFormula = `=IMPORTRANGE("${sourceId}", "注文管理!A:H")`;
  sheet.getRange('A3').setFormula(importRangeFormula);

  // 6. 注意書きを追加
  sheet.getRange('A2').setValue('↓ この関数を実行すると、アクセス許可のダイアログが表示されます');
  sheet.getRange('A2').setFontColor('#FF0000').setFontSize(10);

  // 7. 列幅を調整
  sheet.setColumnWidth(1, 400);

  Logger.log('IMPORTRANGE関数を設定しました');
  Logger.log('⚠️ 初回実行時は「アクセス許可」が必要です。A3セルをクリックして許可してください。');

  return ss.getUrl();
}

/**
 * スプレッドシートURLからIDを抽出
 * @param {string} url - スプレッドシートURL
 * @return {string} スプレッドシートID
 */
function extractSpreadsheetId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
}
