/**
 * 認証ガード
 * 未認証ユーザーをログインページにリダイレクト
 */
(function() {
  'use strict';

  const AUTH_TOKEN_KEY = 'course_auth_token';
  const AUTH_EXPIRES_KEY = 'course_auth_expires';
  const LOGIN_PAGE = '/login.html';

  // 現在のページがログインページなら何もしない
  if (window.location.pathname === LOGIN_PAGE || window.location.pathname === '/login.html') {
    return;
  }

  // トークンを取得
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiresAt = localStorage.getItem(AUTH_EXPIRES_KEY);

  // トークンがない場合
  if (!token) {
    redirectToLogin();
    return;
  }

  // 有効期限チェック
  if (expiresAt) {
    const now = Date.now();
    const expires = parseInt(expiresAt, 10);

    if (now > expires) {
      // 期限切れ - ログイン情報をクリア
      clearAuthData();
      redirectToLogin();
      return;
    }
  }

  // 認証済み - コンテンツを表示
  // console.log('Auth guard: User authenticated');

  /**
   * ログインページにリダイレクト
   */
  function redirectToLogin() {
    // 現在のURLを保存（ログイン後に戻れるように）
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/' && currentPath !== '/index.html') {
      sessionStorage.setItem('auth_redirect_url', currentPath);
    }

    window.location.href = LOGIN_PAGE;
  }

  /**
   * 認証データをクリア
   */
  function clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRES_KEY);
    localStorage.removeItem('course_auth_email');
  }
})();
