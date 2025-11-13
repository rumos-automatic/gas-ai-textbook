// ================================================================
// ハイライトマネージャー
// ================================================================
// URLパラメータから検索ワードを取得し、
// ページ内のマッチ箇所をハイライト表示します
// ================================================================

class HighlightManager {
  constructor() {
    this.searchKeyword = null;
    this.highlights = [];
    this.currentHighlightIndex = 0;
    this.navBarVisible = false;

    // 初期化
    this.init();
  }

  // 初期化
  init() {
    // URLパラメータから検索ワードを取得
    const urlParams = new URLSearchParams(window.location.search);
    this.searchKeyword = urlParams.get('search');

    if (this.searchKeyword) {
      // ページが完全に読み込まれてからハイライト
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.performHighlight();
        });
      } else {
        this.performHighlight();
      }
    }
  }

  // ハイライト処理を実行
  performHighlight() {
    // mainタグ内のテキストをハイライト
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      console.warn('mainタグが見つかりません');
      return;
    }

    // テキストノードを取得してハイライト
    this.highlightTextInElement(mainContent, this.searchKeyword);

    // ハイライトされた要素を収集
    this.highlights = Array.from(document.querySelectorAll('mark.search-highlight'));

    if (this.highlights.length > 0) {
      // ナビゲーションバーを表示
      this.showNavigationBar();

      // 最初のハイライトへスクロール
      this.scrollToHighlight(0);
    }
  }

  // 要素内のテキストをハイライト
  highlightTextInElement(element, keyword) {
    // テキストノードのみを対象にする
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // script、style、svg タグ内は除外
          const parentTag = node.parentElement.tagName.toLowerCase();
          if (['script', 'style', 'svg', 'noscript'].includes(parentTag)) {
            return NodeFilter.FILTER_REJECT;
          }

          // 既にmarkタグ内の場合は除外
          if (node.parentElement.tagName.toLowerCase() === 'mark') {
            return NodeFilter.FILTER_REJECT;
          }

          // テキストにキーワードが含まれるか
          if (node.textContent.toLowerCase().includes(keyword.toLowerCase())) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToReplace = [];
    let currentNode;

    // ハイライト対象のノードを収集
    while (currentNode = walker.nextNode()) {
      nodesToReplace.push(currentNode);
    }

    // ノードを置き換え
    nodesToReplace.forEach(node => {
      this.replaceTextWithHighlight(node, keyword);
    });
  }

  // テキストノードをハイライト付きで置き換え
  replaceTextWithHighlight(textNode, keyword) {
    const text = textNode.textContent;
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // キーワードの出現位置を探す
    const positions = [];
    let index = lowerText.indexOf(lowerKeyword);
    while (index !== -1) {
      positions.push(index);
      index = lowerText.indexOf(lowerKeyword, index + 1);
    }

    if (positions.length === 0) return;

    // HTMLフラグメントを作成
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    positions.forEach(pos => {
      // キーワード前のテキスト
      if (pos > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, pos))
        );
      }

      // ハイライトされたキーワード
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = text.substring(pos, pos + keyword.length);
      fragment.appendChild(mark);

      lastIndex = pos + keyword.length;
    });

    // 残りのテキスト
    if (lastIndex < text.length) {
      fragment.appendChild(
        document.createTextNode(text.substring(lastIndex))
      );
    }

    // ノードを置き換え
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // ナビゲーションバーを表示
  showNavigationBar() {
    const navBar = document.createElement('div');
    navBar.id = 'highlightNavBar';
    navBar.className = 'highlight-nav-bar';

    navBar.innerHTML = `
      <div class="highlight-nav-content">
        <span class="highlight-nav-info">
          🔍 <strong>${this.searchKeyword}</strong> を検索中
        </span>
        <span class="highlight-nav-count">
          <span id="highlightCurrentIndex">1</span> / ${this.highlights.length}
        </span>
        <div class="highlight-nav-buttons">
          <button id="highlightPrevButton" class="highlight-nav-button" aria-label="前へ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button id="highlightNextButton" class="highlight-nav-button" aria-label="次へ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button id="highlightCloseButton" class="highlight-nav-close" aria-label="閉じる">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(navBar);
    this.navBarVisible = true;

    // イベントリスナーを設定
    document.getElementById('highlightPrevButton').addEventListener('click', () => {
      this.navigateToPrevious();
    });

    document.getElementById('highlightNextButton').addEventListener('click', () => {
      this.navigateToNext();
    });

    document.getElementById('highlightCloseButton').addEventListener('click', () => {
      this.closeHighlight();
    });

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      if (!this.navBarVisible) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigateToPrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateToNext();
      }
    });
  }

  // 特定のハイライトへスクロール
  scrollToHighlight(index) {
    if (index < 0 || index >= this.highlights.length) return;

    // 前のアクティブを解除
    this.highlights.forEach(h => h.classList.remove('active'));

    // 新しいアクティブを設定
    this.currentHighlightIndex = index;
    const highlight = this.highlights[index];
    highlight.classList.add('active');

    // スクロール
    highlight.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // カウント更新
    if (this.navBarVisible) {
      document.getElementById('highlightCurrentIndex').textContent = index + 1;
    }
  }

  // 次へ
  navigateToNext() {
    const nextIndex = (this.currentHighlightIndex + 1) % this.highlights.length;
    this.scrollToHighlight(nextIndex);
  }

  // 前へ
  navigateToPrevious() {
    const prevIndex = (this.currentHighlightIndex - 1 + this.highlights.length) % this.highlights.length;
    this.scrollToHighlight(prevIndex);
  }

  // ハイライトを閉じる
  closeHighlight() {
    // ナビゲーションバーを削除
    const navBar = document.getElementById('highlightNavBar');
    if (navBar) {
      navBar.remove();
    }

    // すべてのハイライトを削除
    this.highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      const textNode = document.createTextNode(highlight.textContent);
      parent.replaceChild(textNode, highlight);

      // 隣接するテキストノードをマージ
      parent.normalize();
    });

    this.navBarVisible = false;
    this.highlights = [];

    // URLパラメータを削除
    const url = new URL(window.location);
    url.searchParams.delete('search');
    window.history.replaceState({}, '', url);
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
  new HighlightManager();
});
