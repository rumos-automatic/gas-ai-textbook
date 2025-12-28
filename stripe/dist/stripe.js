"use strict";
/**
 * Stripe API クライアント
 * Stripe APIとの通信を担当
 */
const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const MAX_RETRIES = 3;
/**
 * Stripe APIキーをスクリプトプロパティから取得
 */
function getStripeApiKey() {
    const apiKey = PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET_KEY');
    if (!apiKey) {
        throw new Error('STRIPE_SECRET_KEYが設定されていません。setStripeApiKey()を実行してください。');
    }
    return apiKey;
}
/**
 * Stripe APIキーを設定（初回セットアップ用）
 * 使用後はコードからキーを削除してください
 */
function setStripeApiKey() {
    const apiKey = 'YOUR_STRIPE_SECRET_KEY_HERE';
    if (apiKey === 'YOUR_STRIPE_SECRET_KEY_HERE') {
        throw new Error('STRIPE_SECRET_KEYを設定してください');
    }
    PropertiesService.getScriptProperties().setProperty('STRIPE_SECRET_KEY', apiKey);
    log('INFO', 'Stripe APIキーを設定しました');
}
/**
 * Stripe APIリクエストを実行（リトライ機能付き）
 * @param endpoint APIエンドポイント
 * @param retryCount 現在のリトライ回数
 */
function stripeApiRequest(endpoint, retryCount = 0) {
    const apiKey = getStripeApiKey();
    const options = {
        method: 'get',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        muteHttpExceptions: true,
    };
    const url = endpoint.startsWith('http') ? endpoint : `${STRIPE_API_BASE}${endpoint}`;
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    // レート制限
    if (responseCode === 429) {
        if (retryCount < MAX_RETRIES) {
            log('WARN', `レート制限。60秒待機後リトライ (${retryCount + 1}/${MAX_RETRIES})`);
            Utilities.sleep(60000);
            return stripeApiRequest(endpoint, retryCount + 1);
        }
        throw new Error('レート制限エラー: 最大リトライ回数に達しました');
    }
    // サーバーエラー
    if (responseCode >= 500 && responseCode < 600) {
        if (retryCount < MAX_RETRIES) {
            log('WARN', `サーバーエラー(${responseCode})。30秒待機後リトライ (${retryCount + 1}/${MAX_RETRIES})`);
            Utilities.sleep(30000);
            return stripeApiRequest(endpoint, retryCount + 1);
        }
        throw new Error(`サーバーエラー: ${responseCode}`);
    }
    // クライアントエラー
    if (responseCode >= 400 && responseCode < 500) {
        log('ERROR', `Stripe APIエラー: ${responseCode}`, { response: responseText });
        throw new Error(`Stripe APIエラー: ${responseCode} - ${responseText}`);
    }
    return JSON.parse(responseText);
}
/**
 * Charge一覧を取得（ページネーション対応）
 * @param createdGte 作成日時の下限（UNIXタイムスタンプ）
 * @param createdLte 作成日時の上限（UNIXタイムスタンプ）
 */
function listCharges(createdGte, createdLte) {
    const allCharges = [];
    let hasMore = true;
    let startingAfter;
    while (hasMore) {
        let endpoint = `/charges?created[gte]=${createdGte}&created[lte]=${createdLte}&limit=100`;
        if (startingAfter) {
            endpoint += `&starting_after=${startingAfter}`;
        }
        const response = stripeApiRequest(endpoint);
        allCharges.push(...response.data);
        hasMore = response.has_more;
        if (hasMore && response.data.length > 0) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }
    log('INFO', `${allCharges.length}件のChargeを取得しました`);
    return allCharges;
}
/**
 * Balance Transactionを取得
 * @param balanceTransactionId Balance Transaction ID
 */
function getBalanceTransaction(balanceTransactionId) {
    if (!balanceTransactionId)
        return null;
    try {
        return stripeApiRequest(`/balance_transactions/${balanceTransactionId}`);
    }
    catch (e) {
        log('WARN', `Balance Transaction取得失敗: ${balanceTransactionId}`, { error: String(e) });
        return null;
    }
}
/**
 * Payoutを取得
 * @param payoutId Payout ID
 */
function getPayout(payoutId) {
    if (!payoutId)
        return null;
    try {
        return stripeApiRequest(`/payouts/${payoutId}`);
    }
    catch (e) {
        log('WARN', `Payout取得失敗: ${payoutId}`, { error: String(e) });
        return null;
    }
}
/**
 * Customerを取得
 * @param customerId Customer ID
 */
function getCustomer(customerId) {
    if (!customerId)
        return null;
    try {
        return stripeApiRequest(`/customers/${customerId}`);
    }
    catch (e) {
        log('WARN', `Customer取得失敗: ${customerId}`, { error: String(e) });
        return null;
    }
}
