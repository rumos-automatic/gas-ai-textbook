/**
 * メイン処理
 * 日次売上記録のエントリーポイントとトリガー管理
 */

/**
 * 毎日の売上記録処理（トリガーから呼び出し）
 * 前日分のStripe支払いを取得してスプレッドシートに記録
 */
function dailyRecordSales(): void {
  log('INFO', '日次売上記録処理を開始します');

  try {
    const dateRange = getYesterdayDateRange();
    log('INFO', '対象期間', {
      start: formatTimestampJST(dateRange.start),
      end: formatTimestampJST(dateRange.end)
    });

    recordSalesForDateRange(dateRange.start, dateRange.end);

    log('INFO', '日次売上記録処理が完了しました');
  } catch (e) {
    log('ERROR', '日次売上記録処理でエラーが発生しました', { error: String(e) });
    throw e;
  }
}

/**
 * 指定期間の売上を記録
 * @param startTimestamp 開始UNIXタイムスタンプ
 * @param endTimestamp 終了UNIXタイムスタンプ
 */
function recordSalesForDateRange(startTimestamp: number, endTimestamp: number): void {
  // Charge一覧を取得
  const charges = listCharges(startTimestamp, endTimestamp);

  if (charges.length === 0) {
    log('INFO', '対象期間の支払いはありませんでした');
    return;
  }

  // 既存の決済IDを取得（重複チェック用）
  const existingChargeIds = getExistingChargeIds();
  const newRecords: SalesRecord[] = [];
  let skippedCount = 0;

  for (const charge of charges) {
    // 重複チェック
    if (isDuplicate(charge.id, existingChargeIds)) {
      skippedCount++;
      continue;
    }

    // JPY以外の通貨はスキップ
    if (charge.currency.toLowerCase() !== 'jpy') {
      log('WARN', `JPY以外の通貨をスキップ: ${charge.id}`, { currency: charge.currency });
      continue;
    }

    // 売上レコードを作成
    const record = createSalesRecord(charge);
    newRecords.push(record);
  }

  // 一括追記
  if (newRecords.length > 0) {
    appendSalesRecords(newRecords);
  }

  log('INFO', '処理結果', {
    total: charges.length,
    added: newRecords.length,
    skipped: skippedCount
  });
}

/**
 * Chargeから売上レコードを作成
 * @param charge Stripeのチャージオブジェクト
 */
function createSalesRecord(charge: {
  id: string;
  amount: number;
  status: string;
  created: number;
  description: string | null;
  customer: string | null;
  balance_transaction: string | null;
  billing_details: { email: string | null; name: string | null };
}): SalesRecord {
  // Balance Transaction情報を取得
  let fee = 0;
  let netAmount = 0;
  let arrivalDate = '';
  let arrivalStatus = '未確定';
  let arrivalAmount: number | string = '';
  let payoutId = '';

  if (charge.balance_transaction) {
    const bt = getBalanceTransaction(charge.balance_transaction);
    if (bt) {
      fee = bt.fee;
      netAmount = bt.net;
      arrivalDate = formatTimestampJST(bt.available_on);

      // Payout情報を取得
      if (bt.payout) {
        payoutId = bt.payout;
        const payout = getPayout(bt.payout);
        if (payout) {
          arrivalStatus = translatePayoutStatus(payout.status);
          arrivalAmount = payout.amount;
        }
      }
    }
  }

  // Customer情報を取得
  let customerName = '';
  let email = charge.billing_details?.email || '';

  if (charge.customer) {
    const customer = getCustomer(charge.customer);
    if (customer) {
      customerName = customer.name || '';
      if (!email && customer.email) {
        email = customer.email;
      }
    }
  }

  return {
    paymentDate: formatTimestampJST(charge.created),
    productName: charge.description || '',
    customerName: customerName,
    email: email,
    amount: charge.amount,
    fee: fee,
    netAmount: netAmount,
    paymentStatus: translateChargeStatus(charge.status),
    arrivalDate: arrivalDate,
    arrivalStatus: arrivalStatus,
    arrivalAmount: arrivalAmount,
    chargeId: charge.id,
    payoutId: payoutId
  };
}

/**
 * Chargeのステータスを日本語に変換
 */
function translateChargeStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'succeeded': '成功',
    'pending': '保留中',
    'failed': '失敗'
  };
  return statusMap[status] || status;
}

/**
 * Payoutのステータスを日本語に変換
 */
function translatePayoutStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'paid': '着金済',
    'pending': '保留中',
    'in_transit': '処理中',
    'canceled': 'キャンセル',
    'failed': '失敗'
  };
  return statusMap[status] || status;
}

/**
 * 毎朝9時のトリガーを設定
 */
function setupDailyTrigger(): void {
  // 既存のトリガーを削除
  deleteDailyTrigger();

  // 新しいトリガーを作成
  ScriptApp.newTrigger('dailyRecordSales')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create();

  log('INFO', '毎朝9時（JST）のトリガーを設定しました');
}

/**
 * dailyRecordSalesのトリガーを削除
 */
function deleteDailyTrigger(): void {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'dailyRecordSales') {
      ScriptApp.deleteTrigger(trigger);
      log('INFO', '既存のトリガーを削除しました');
    }
  }
}

/**
 * テスト用：過去7日分を記録
 */
function testRecordLast7Days(): void {
  log('INFO', 'テスト: 過去7日分の売上を記録します');

  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - i);

    const dateRange = getDateRange(targetDate);
    log('INFO', `${i}日前を処理中`, {
      date: Utilities.formatDate(targetDate, 'Asia/Tokyo', 'yyyy-MM-dd')
    });

    recordSalesForDateRange(dateRange.start, dateRange.end);
  }

  log('INFO', 'テスト完了');
}

/**
 * テスト用：指定日の売上を記録
 * @param dateString 日付文字列（例: "2025-12-27"）
 */
function testRecordSpecificDate(dateString?: string): void {
  const targetDate = dateString ? new Date(dateString) : new Date();
  const dateRange = getDateRange(targetDate);

  log('INFO', 'テスト: 指定日の売上を記録します', {
    date: Utilities.formatDate(targetDate, 'Asia/Tokyo', 'yyyy-MM-dd')
  });

  recordSalesForDateRange(dateRange.start, dateRange.end);
}

/**
 * 当日分の売上を記録
 */
function recordToday(): void {
  log('INFO', '当日分の売上を記録します');

  const today = new Date();
  const dateRange = getDateRange(today);

  log('INFO', '対象期間', {
    date: Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd'),
    start: formatTimestampJST(dateRange.start),
    end: formatTimestampJST(dateRange.end)
  });

  recordSalesForDateRange(dateRange.start, dateRange.end);
}

/**
 * デバッグ: Stripe APIの接続確認と直近のChargeを取得
 */
function debugStripeConnection(): void {
  log('INFO', '=== Stripe API デバッグ開始 ===');

  try {
    // APIキー確認
    const apiKey = getStripeApiKey();
    const keyType = apiKey.startsWith('sk_test_') ? 'テストモード' : '本番モード';
    log('INFO', `APIキー: ${keyType} (${apiKey.substring(0, 12)}...)`);

    // 直近30日のChargeを取得
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

    log('INFO', '直近30日のChargeを取得中...');
    const charges = listCharges(thirtyDaysAgo, now);

    if (charges.length === 0) {
      log('WARN', 'Chargeが見つかりませんでした');
      log('INFO', 'Stripeダッシュボードで決済が完了しているか確認してください');
    } else {
      log('INFO', `${charges.length}件のChargeが見つかりました`);
      charges.forEach((charge, i) => {
        log('INFO', `Charge ${i + 1}`, {
          id: charge.id,
          amount: charge.amount,
          status: charge.status,
          created: formatTimestampJST(charge.created),
          description: charge.description
        });
      });
    }
  } catch (e) {
    log('ERROR', 'エラーが発生しました', { error: String(e) });
  }

  log('INFO', '=== デバッグ終了 ===');
}

/**
 * 設定確認
 */
function checkConfig(): void {
  const props = PropertiesService.getScriptProperties().getProperties();
  const hasApiKey = !!props.STRIPE_SECRET_KEY;

  let message = '【設定状態】\n\n';
  message += `Stripe APIキー: ${hasApiKey ? '設定済み' : '未設定'}\n\n`;

  if (!hasApiKey) {
    message += 'setStripeApiKey()を実行してAPIキーを設定してください。\n';
  }

  Logger.log(message);

  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    // スタンドアロンスクリプトの場合はUIがないのでスキップ
  }
}
