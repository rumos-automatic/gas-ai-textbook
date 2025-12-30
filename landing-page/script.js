// ========================================
// DOMContentLoaded: ページ読み込み時の初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // FAQアコーディオンの初期化
  initFAQAccordion();

  // ヘッダースクロール効果の初期化
  initHeaderScroll();

  // スムーススクロールの初期化
  initSmoothScroll();

  // フェードインアニメーションの初期化
  initFadeInAnimation();
});

// ========================================
// FAQアコーディオン機能
// ========================================
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // 現在の状態を取得
      const isActive = item.classList.contains('active');

      // すべてのFAQを閉じる
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      // クリックされた項目が閉じていた場合は開く
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ========================================
// ヘッダースクロール効果
// ========================================
function initHeaderScroll() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ========================================
// スムーススクロール
// ========================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // 空のハッシュ（#のみ）は無視
      if (href === '#') return;

      e.preventDefault();

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerHeight = document.getElementById('header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// フェードインアニメーション（スクロール時）
// ========================================
function initFadeInAnimation() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // ページ読み込み時にすでに表示されている要素にもアニメーションを適用
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(element => {
    // 初期状態を設定
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

    observer.observe(element);
  });
}

// ========================================
// ユーティリティ関数: 特定の要素までスクロール
// ========================================
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const headerHeight = document.getElementById('header').offsetHeight;
    const targetPosition = element.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}
