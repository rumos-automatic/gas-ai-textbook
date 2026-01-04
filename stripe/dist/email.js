"use strict";
/**
 * Discord招待メール送信モジュール
 * GmailAppを使用してDiscord招待リンクを送信
 */
/**
 * Discord招待メールを送信
 * @param recipientEmail 受信者のメールアドレス
 * @param customerName 顧客名（オプション）
 */
function sendDiscordInvitationEmail(recipientEmail, customerName) {
    try {
        const subject = getEmailSubject();
        const body = getEmailBody(customerName);
        const htmlBody = getEmailHtmlBody(customerName);
        GmailApp.sendEmail(recipientEmail, subject, body, {
            htmlBody: htmlBody,
            name: getSenderName(),
            replyTo: getReplyToEmail() || undefined
        });
        log('INFO', 'Discord招待メールを送信しました', { email: recipientEmail });
        return { success: true };
    }
    catch (error) {
        log('ERROR', 'メール送信に失敗しました', { email: recipientEmail, error: String(error) });
        return { success: false, error: String(error) };
    }
}
/**
 * メール件名を取得（Script Propertiesから、またはデフォルト）
 */
function getEmailSubject() {
    return PropertiesService.getScriptProperties()
        .getProperty('DISCORD_EMAIL_SUBJECT') ||
        '【生成AI×GAS講座】Discord招待リンクのご案内';
}
/**
 * 送信者名を取得
 */
function getSenderName() {
    return PropertiesService.getScriptProperties()
        .getProperty('EMAIL_SENDER_NAME') ||
        'GAS講座運営事務局';
}
/**
 * 返信先メールアドレスを取得
 */
function getReplyToEmail() {
    return PropertiesService.getScriptProperties()
        .getProperty('EMAIL_REPLY_TO') || '';
}
/**
 * Discord招待リンクを取得
 */
function getDiscordInviteLink() {
    const link = PropertiesService.getScriptProperties()
        .getProperty('DISCORD_INVITE_LINK');
    if (!link) {
        throw new Error('DISCORD_INVITE_LINKが設定されていません');
    }
    return link;
}
/**
 * プレーンテキスト版メール本文を取得
 */
function getEmailBody(customerName) {
    const greeting = customerName ? `${customerName} 様` : 'お客様';
    const discordLink = getDiscordInviteLink();
    return `${greeting}

この度は「生成AI×GAS短期講座」をご購入いただき、誠にありがとうございます。

講座専用のDiscordサーバーへご招待いたします。
以下のリンクからご参加ください。

Discord招待リンク:
${discordLink}

【Discordサーバーについて】
- 講座に関する質問・相談が可能です
- 受講生同士の交流の場としてもご活用ください
- 運営からのお知らせも配信いたします

ご不明な点がございましたら、このメールに返信いただくか、
Discordサーバー内でお気軽にお問い合わせください。

今後ともよろしくお願いいたします。

--------------------
GAS講座運営事務局
`;
}
/**
 * HTML版メール本文を取得
 */
function getEmailHtmlBody(customerName) {
    const greeting = customerName ? `${customerName} 様` : 'お客様';
    const discordLink = getDiscordInviteLink();
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Hiragino Sans', 'Meiryo', 'Yu Gothic', sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #5865F2, #7289da);
      color: white;
      padding: 30px 20px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #5865F2, #7289da);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #5865F2;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #5865F2;
      font-size: 16px;
    }
    .info-box ul {
      margin: 0;
      padding-left: 20px;
    }
    .info-box li {
      margin: 8px 0;
      color: #555;
    }
    .footer {
      background: #333;
      color: #ccc;
      padding: 20px;
      font-size: 13px;
      text-align: center;
      border-radius: 0 0 12px 12px;
    }
    .footer p {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Discord招待のご案内</h1>
    </div>
    <div class="content">
      <p>${greeting}</p>
      <p>この度は「<strong>生成AI×GAS短期講座</strong>」をご購入いただき、誠にありがとうございます。</p>
      <p>講座専用のDiscordサーバーへご招待いたします。<br>
      下のボタンからご参加ください。</p>

      <div class="button-container">
        <a href="${discordLink}" class="button">Discordサーバーに参加する</a>
      </div>

      <div class="info-box">
        <h3>Discordサーバーについて</h3>
        <ul>
          <li>講座に関する質問・相談が可能です</li>
          <li>受講生同士の交流の場としてもご活用ください</li>
          <li>運営からのお知らせも配信いたします</li>
        </ul>
      </div>

      <p>ご不明な点がございましたら、このメールに返信いただくか、Discordサーバー内でお気軽にお問い合わせください。</p>
      <p>今後ともよろしくお願いいたします。</p>
    </div>
    <div class="footer">
      <p>GAS講座運営事務局</p>
    </div>
  </div>
</body>
</html>
`;
}
/**
 * テスト用: Discord招待メールを送信
 * GASエディタから実行してテスト
 */
function testSendDiscordEmail() {
    const testEmail = 'YOUR_TEST_EMAIL@example.com';
    const result = sendDiscordInvitationEmail(testEmail, 'テストユーザー');
    log('INFO', 'テストメール送信結果', result);
}
/**
 * メール設定の確認
 */
function checkEmailConfig() {
    const props = PropertiesService.getScriptProperties().getProperties();
    const configStatus = {
        DISCORD_INVITE_LINK: props['DISCORD_INVITE_LINK'] ? '設定済み' : '未設定',
        DISCORD_EMAIL_SUBJECT: props['DISCORD_EMAIL_SUBJECT'] || '（デフォルト使用）',
        EMAIL_SENDER_NAME: props['EMAIL_SENDER_NAME'] || '（デフォルト使用）',
        EMAIL_REPLY_TO: props['EMAIL_REPLY_TO'] || '（未設定）'
    };
    log('INFO', 'メール設定状態', configStatus);
    Logger.log(JSON.stringify(configStatus, null, 2));
}
