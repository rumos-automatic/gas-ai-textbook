function importOrderEmails() {
  try {
    const SHEET_NAME = "受注一覧";
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);

    // ★ Gmail検索条件
    const query = 'subject:注文受付 -label:処理済み';
    const threads = GmailApp.search(query, 0, 50); // 最新50件

    // ★「処理済み」ラベルを取得（なければ作成）
    const doneLabel = GmailApp.getUserLabelByName("処理済み") ||
                      GmailApp.createLabel("処理済み");

    let log = [];

    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        try {
          const body = message.getPlainBody();

          // ======== 正規表現でデータ抽出 ==========
          const orderId       = extract(body, /注文ID:\s*(\d+)/);
          const orderDate     = extract(body, /注文日時:\s*([\d\/ :]+)/);
          const customerName  = extract(body, /お客様名:\s*(.+)/);
          const productName   = extract(body, /商品名:\s*(.+)/);
          const amountRaw     = extract(body, /小計:\s*([\d,]+)円/);
          const shippingDate  = extract(body, /配送希望日:\s*([\d\/]+)/);

          // 金額はカンマと円記号除去
          const amount = amountRaw ? amountRaw.replace(/,/g, "") : "";

          // ======== 注文IDが抽出できない場合はスキップ ==========
          if (!orderId) {
            log.push("注文IDが取得できずスキップ: " + message.getId());
            return;
          }

          // ======== シート重複チェック（注文ID） ==========
          const idCol = 3; // C列（注文ID）
          const idValues = sheet.getRange(2, idCol, sheet.getLastRow()).getValues().flat();

          if (idValues.includes(orderId)) {
            log.push("重複のためスキップ: 注文ID " + orderId);
            return;
          }

          // ======== シートの次の行を取得 ==========
          const lastRow = sheet.getLastRow() + 1;

          // ======== 指定列に書き込む ==========
          sheet.getRange(lastRow, 3).setValue(orderId);      // C列
          sheet.getRange(lastRow, 5).setValue(orderDate);    // E列
          sheet.getRange(lastRow, 7).setValue(customerName); // G列
          sheet.getRange(lastRow, 10).setValue(productName); // J列
          sheet.getRange(lastRow, 12).setValue(amount);      // L列
          sheet.getRange(lastRow, 14).setValue(shippingDate);// N列

          // ======== メールに「処理済み」ラベルを付与 ==========
          message.addLabel(doneLabel);

          log.push("処理完了: 注文ID " + orderId);

        } catch (e) {
          log.push("メール処理中エラー: " + e);
        }
      });
    });

    // ---- 処理ログをコンソールに出力 ----
    console.log(log.join("\n"));

  } catch (e) {
    console.error("全体エラー: " + e);
  }
}

/**
 * 正規表現マッチを簡単にするヘルパー関数
 */
function extract(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}
