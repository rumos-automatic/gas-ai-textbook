// ================================================================
// グローバル検索機能
// ================================================================
// 全ページ横断検索を提供します
// ================================================================

class GlobalSearch {
  constructor() {
    this.searchIndex = null;
    this.isIndexLoaded = false;
    this.isModalOpen = false;
    this.currentResults = [];
    this.debounceTimer = null;

    // 初期化
    this.init();
  }

  // 初期化
  async init() {
    // 検索インデックスを読み込み
    await this.loadSearchIndex();

    // UIを描画
    this.renderUI();

    // イベントリスナーを設定
    this.setupEventListeners();
  }

  // 検索インデックスを読み込む
  async loadSearchIndex() {
    let indexUrl = ''; // スコープ外でも参照できるように
    try {
      // 現在のHTMLファイルの位置を特定
      const currentPath = window.location.pathname;
      const currentHref = window.location.href;

      console.log('🔍 デバッグ情報:');
      console.log('  - pathname:', currentPath);
      console.log('  - href:', currentHref);

      // HTMLファイルの階層を判定
      let basePath;

      // URLデコードしてから判定（%E7%94%9F%E6%88%90AI → 生成AI）
      const decodedHref = decodeURIComponent(currentHref);

      if (decodedHref.includes('/生成AI/') || decodedHref.includes('/GAS/') ||
          decodedHref.includes('/実践編/') || decodedHref.includes('/基本的な考え方/') ||
          decodedHref.includes('/上級編/')) {
        // サブディレクトリ内のHTMLファイル
        basePath = '../';
      } else {
        // ルートディレクトリのHTMLファイル
        basePath = './';
      }

      indexUrl = `${basePath}assets/data/search-index.json`;
      console.log('  - 試行パス:', indexUrl);

      const response = await fetch(indexUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.searchIndex = await response.json();
      this.isIndexLoaded = true;

      console.log('✅ 検索インデックス読み込み完了!');
      console.log('  - 総ページ数:', this.searchIndex.totalPages);
      console.log('  - 総セクション数:', this.searchIndex.totalSections);
    } catch (error) {
      console.error('❌ 検索インデックスの読み込みエラー:');
      console.error('  - エラー:', error.message);
      console.error('  - 現在のURL:', window.location.href);
      console.error('  - 試行したパス:', indexUrl);
      this.isIndexLoaded = false;
    }
  }

  // UIを描画
  renderUI() {
    // ナビゲーションバーに検索ボタンを追加
    const nav = document.querySelector('nav .flex.gap-4');
    console.log('🔍 ナビゲーション要素:', nav);

    if (nav) {
      const searchButton = `
        <button id="globalSearchButton" class="global-search-button" aria-label="検索" title="全ページ検索">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      `;
      nav.insertAdjacentHTML('beforeend', searchButton);
      console.log('✅ 検索ボタンを追加しました');
    } else {
      console.error('❌ ナビゲーション要素が見つかりません');
    }

    // 検索モーダルをbodyに追加
    const modalHtml = `
      <!-- 検索モーダル -->
      <div id="globalSearchModal" class="global-search-modal">
        <div class="global-search-modal-content">
          <!-- ヘッダー -->
          <div class="global-search-header">
            <div class="global-search-input-wrapper">
              <svg class="global-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                id="globalSearchInput"
                class="global-search-input"
                placeholder="キーワードを入力してください..."
                autocomplete="off"
              />
              <button id="globalSearchClear" class="global-search-clear" aria-label="クリア">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button id="globalSearchClose" class="global-search-close-button" aria-label="閉じる">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 検索結果エリア -->
          <div id="globalSearchResults" class="global-search-results">
            <div class="global-search-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>キーワードを入力して検索を開始してください</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // bodyの最後に追加
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // イベントリスナーを設定
  setupEventListeners() {
    // 検索ボタン
    const button = document.getElementById('globalSearchButton');
    if (button) {
      button.addEventListener('click', () => this.openModal());
    }

    // モーダルを閉じる
    const closeButton = document.getElementById('globalSearchClose');
    closeButton.addEventListener('click', () => this.closeModal());

    // 背景クリックで閉じる
    const modal = document.getElementById('globalSearchModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Escキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });

    // 検索入力
    const input = document.getElementById('globalSearchInput');
    input.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // クリアボタン
    const clearButton = document.getElementById('globalSearchClear');
    clearButton.addEventListener('click', () => {
      input.value = '';
      this.clearResults();
    });

    // Enterキーで検索
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(e.target.value);
      }
    });
  }

  // モーダルを開く
  openModal() {
    const modal = document.getElementById('globalSearchModal');
    modal.classList.add('active');
    this.isModalOpen = true;

    // 入力フォーカス
    setTimeout(() => {
      document.getElementById('globalSearchInput').focus();
    }, 100);
  }

  // モーダルを閉じる
  closeModal() {
    const modal = document.getElementById('globalSearchModal');
    modal.classList.remove('active');
    this.isModalOpen = false;

    // 入力をクリア
    document.getElementById('globalSearchInput').value = '';
    this.clearResults();
  }

  // 検索入力処理（デバウンス）
  handleSearchInput(keyword) {
    // デバウンス処理
    clearTimeout(this.debounceTimer);

    if (keyword.trim().length === 0) {
      this.clearResults();
      return;
    }

    // 500ms後に検索実行
    this.debounceTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 500);
  }

  // 検索を実行
  performSearch(keyword) {
    if (!this.isIndexLoaded) {
      this.showError('検索インデックスが読み込まれていません');
      return;
    }

    if (keyword.trim().length === 0) {
      this.clearResults();
      return;
    }

    // ローディング表示
    this.showLoading();

    // 検索実行（非同期処理として）
    setTimeout(() => {
      const results = this.search(keyword);
      this.displayResults(results, keyword);
    }, 100);
  }

  // 検索ロジック
  search(keyword) {
    const results = [];
    const keywordLower = keyword.toLowerCase();

    // ひらがな/カタカナ変換対応
    const keywordVariants = this.generateKeywordVariants(keywordLower);

    this.searchIndex.pages.forEach(page => {
      page.sections.forEach(section => {
        const contentLower = section.content.toLowerCase();

        // いずれかのバリアントにマッチするかチェック
        const matchCount = keywordVariants.reduce((count, variant) => {
          const matches = contentLower.match(new RegExp(variant, 'g'));
          return count + (matches ? matches.length : 0);
        }, 0);

        if (matchCount > 0) {
          // スニペットを抽出
          const snippet = this.extractSnippet(section.content, keyword);

          results.push({
            page: page.path,
            pageTitle: page.title,
            category: page.category,
            categoryIcon: page.categoryIcon,
            categoryColor: page.categoryColor,
            sectionId: section.id,
            sectionTitle: section.title,
            snippet: snippet,
            matchCount: matchCount
          });
        }
      });
    });

    // マッチ数の多い順にソート
    results.sort((a, b) => b.matchCount - a.matchCount);

    return results;
  }

  // キーワードのバリアントを生成（ひらがな/カタカナ対応）
  generateKeywordVariants(keyword) {
    const variants = [keyword];

    // ひらがな → カタカナ
    const katakana = keyword.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
    if (katakana !== keyword) {
      variants.push(katakana);
    }

    // カタカナ → ひらがな
    const hiragana = keyword.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
    if (hiragana !== keyword) {
      variants.push(hiragana);
    }

    return variants;
  }

  // スニペットを抽出
  extractSnippet(content, keyword, contextLength = 60) {
    const keywordLower = keyword.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(keywordLower);

    if (index === -1) {
      // マッチしない場合は先頭から
      return content.substring(0, contextLength * 2) + '...';
    }

    // キーワード前後のコンテキストを抽出
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + keyword.length + contextLength);

    let snippet = content.substring(start, end);

    // 前後に「...」を追加
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  // ローディング表示
  showLoading() {
    const resultsContainer = document.getElementById('globalSearchResults');
    resultsContainer.innerHTML = `
      <div class="global-search-loading">
        <div class="loading-spinner"></div>
        <p>検索中...</p>
      </div>
    `;
  }

  // エラー表示
  showError(message) {
    const resultsContainer = document.getElementById('globalSearchResults');
    resultsContainer.innerHTML = `
      <div class="global-search-error">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>${message}</p>
      </div>
    `;
  }

  // 結果をクリア
  clearResults() {
    const resultsContainer = document.getElementById('globalSearchResults');
    resultsContainer.innerHTML = `
      <div class="global-search-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>キーワードを入力して検索を開始してください</p>
      </div>
    `;
    this.currentResults = [];
  }

  // 検索結果を表示
  displayResults(results, keyword) {
    this.currentResults = results;

    const resultsContainer = document.getElementById('globalSearchResults');

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="global-search-no-results">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>「${keyword}」に一致する結果が見つかりませんでした</p>
        </div>
      `;
      return;
    }

    // 結果ヘッダー
    let html = `
      <div class="global-search-results-header">
        <p>🔍 検索結果: <strong>${results.length}件</strong> 見つかりました</p>
      </div>
      <div class="global-search-results-list">
    `;

    // 結果カードを生成
    results.forEach((result, index) => {
      // カテゴリカラーのマッピング
      const colorClass = `color-${result.categoryColor}`;

      // スニペット内のキーワードをハイライト
      const highlightedSnippet = this.highlightKeyword(result.snippet, keyword);

      html += `
        <div class="global-search-result-card ${colorClass}" data-index="${index}">
          <div class="result-card-header">
            <span class="result-category">
              <span class="category-icon">${result.categoryIcon}</span>
              <span class="category-name">${result.category}</span>
            </span>
            <span class="result-match-count">${result.matchCount}件マッチ</span>
          </div>
          <h3 class="result-page-title">${result.pageTitle}</h3>
          <p class="result-section-title">📍 ${result.sectionTitle}</p>
          <p class="result-snippet">${highlightedSnippet}</p>
        </div>
      `;
    });

    html += `</div>`;

    resultsContainer.innerHTML = html;

    // 結果カードのクリックイベント
    document.querySelectorAll('.global-search-result-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.navigateToResult(results[index], keyword);
      });
    });
  }

  // スニペット内のキーワードをハイライト
  highlightKeyword(snippet, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return snippet.replace(regex, '<mark class="highlight">$1</mark>');
  }

  // 検索結果へ遷移
  navigateToResult(result, keyword) {
    // 現在のHTMLファイルの位置を特定
    const currentHref = window.location.href;
    const decodedHref = decodeURIComponent(currentHref);

    // 現在のファイルがサブディレクトリにあるかチェック
    let basePath;
    if (decodedHref.includes('/生成AI/') || decodedHref.includes('/GAS/') ||
        decodedHref.includes('/実践編/') || decodedHref.includes('/基本的な考え方/') ||
        decodedHref.includes('/上級編/')) {
      // サブディレクトリ内のHTMLファイル
      basePath = '../';
    } else {
      // ルートディレクトリのHTMLファイル
      basePath = './';
    }

    // URLを構築（検索ワードとセクションIDをパラメータとして渡す）
    const url = `${basePath}${result.page}?search=${encodeURIComponent(keyword)}#${result.sectionId}`;

    console.log('🔗 ページ遷移:', url);

    // ページ遷移
    window.location.href = url;
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
  new GlobalSearch();
});
