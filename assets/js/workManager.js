/**
 * GAS短期講座 - ワーク課題管理ライブラリ
 * ローカルストレージを使用してワーク課題の回答を保存・管理します
 */

const WorkManager = {
  STORAGE_KEY: 'gas-course-work-answers',
  SAVE_DELAY: 500, // デバウンス時間（ミリ秒）

  /**
   * すべてのワーク課題データを取得
   */
  getAllData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  /**
   * すべてのワーク課題データを保存
   */
  saveAllData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * ワーク課題の回答を保存
   * @param {string} pageId - ページID（ファイル名）
   * @param {string} workId - ワークID（work, work1, work2など）
   * @param {object} workData - 保存するデータ
   */
  saveWorkAnswer(pageId, workId, workData) {
    const allData = this.getAllData();
    const key = `${pageId}#${workId}`;

    allData[key] = {
      ...workData,
      savedAt: new Date().toISOString()
    };

    this.saveAllData(allData);
    return true;
  },

  /**
   * ワーク課題の回答を読み込み
   * @param {string} pageId - ページID（ファイル名）
   * @param {string} workId - ワークID
   */
  loadWorkAnswer(pageId, workId) {
    const allData = this.getAllData();
    const key = `${pageId}#${workId}`;
    return allData[key] || null;
  },

  /**
   * ワーク課題の回答をクリア
   * @param {string} pageId - ページID
   * @param {string} workId - ワークID
   */
  clearWorkAnswer(pageId, workId) {
    const allData = this.getAllData();
    const key = `${pageId}#${workId}`;

    if (allData[key]) {
      delete allData[key];
      this.saveAllData(allData);
      return true;
    }
    return false;
  },

  /**
   * デバウンス関数
   */
  debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * すべてのワーク課題の回答をエクスポート
   */
  exportAllAnswers() {
    const allData = this.getAllData();
    const entries = Object.entries(allData);

    if (entries.length === 0) {
      alert('エクスポートする回答がありません。');
      return;
    }

    let exportText = '===== GAS短期講座 ワーク課題の回答 =====\n';
    exportText += `エクスポート日時: ${new Date().toLocaleString('ja-JP')}\n\n`;

    entries.forEach(([key, data]) => {
      const [pageId, workId] = key.split('#');
      exportText += `【${pageId} - ${workId}】\n`;

      if (data.type === 'items' && data.answers) {
        data.answers.forEach((answer, index) => {
          if (answer.trim()) {
            exportText += `${index + 1}. ${answer}\n`;
          }
        });
      } else if (data.type === 'textarea' && data.answer) {
        exportText += `${data.answer}\n`;
      }

      exportText += `\n`;
    });

    // ファイルダウンロード
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GAS短期講座_ワーク課題回答_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 保存成功フィードバックを表示
   * @param {HTMLElement} element - フィードバックを表示する要素
   */
  showSaveFeedback(element) {
    if (!element) return;

    element.textContent = '✓ 保存済み';
    element.classList.remove('opacity-0');
    element.classList.add('opacity-100', 'text-green-600');

    setTimeout(() => {
      element.classList.remove('opacity-100');
      element.classList.add('opacity-0');
    }, 2000);
  }
};

// グローバルにエクスポート
window.WorkManager = WorkManager;
