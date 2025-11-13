# アイデアメモ：アクセス解析とDiscordBot自動化

**作成日**: 2025-11-02
**ステータス**: アイデア段階・調査完了

このドキュメントは、会社事業HTML資料プロジェクトにおける将来的な拡張機能のアイデアをまとめたものです。すべての機能について技術調査を完了し、実現可能性を確認済みです。

---

## 📊 1. GA4（Google Analytics 4）アクセス記録機能

### 概要
GitHub Pagesでホストされている全86ページのHTML資料に、アクセス解析機能を追加し、どの章がよく読まれているかを把握する。

### 実現可能性
**✅ 完全に可能**

### 実装方法の選択肢

#### 選択肢1: GA4のみ（推奨・採用）
- **設定の簡単さ**: ⭐⭐⭐⭐⭐（5分で完了）
- **分析機能**: ⭐⭐⭐⭐⭐（超高機能）
- **リアルタイム性**: ⭐⭐⭐⭐⭐（リアルタイム分析可能）
- **データ所有**: ⭐⭐☆☆☆（Googleが管理）
- **プライバシー**: ⭐⭐⭐☆☆（Cookie使用）

**メリット**:
- HTMLに1行タグを追加するだけで完了
- リアルタイムでアクセス状況を確認可能
- 章別、ページ別、デバイス別、流入元などの詳細分析
- 無料で利用可能

**デメリット**:
- データはGoogleが管理
- Cookie使用（プライバシーポリシー必要）

#### 選択肢2: Google Apps Script + スプレッドシート
- **設定の簡単さ**: ⭐⭐⭐☆☆（1-2時間）
- **分析機能**: ⭐⭐☆☆☆（基本的な集計のみ）
- **リアルタイム性**: ⭐☆☆☆☆（数秒遅延）
- **データ所有**: ⭐⭐⭐⭐⭐（完全に自分で所有）
- **プライバシー**: ⭐⭐⭐⭐⭐（Cookie不要）

**メリット**:
- データを完全に自分で所有
- スプレッドシートで直接確認・分析可能
- プライバシー重視

**デメリット**:
- 実装がやや複雑
- 高度な分析機能なし

#### 選択肢3: ハイブリッド（両方使用）
- GA4で詳細分析
- スプレッドシートで簡易記録
- 二重管理になるため管理コスト増

### 採用方針
**GA4のみ（選択肢1）を採用**

理由：
- 設定が簡単（5分で完了）
- 高機能な分析ツールが無料で使える
- 小規模な教育資料サイトとしてプライバシー懸念は低い
- スプレッドシートへの記録は現時点で不要

### 実装概要

#### 手順1: GA4プロパティを作成（5分）
1. https://analytics.google.com/ にアクセス
2. 測定を開始
3. プロパティ名、タイムゾーン、通貨を設定
4. データストリーム作成（ウェブサイトURL指定）
5. **測定ID（G-XXXXXXXXXX）を取得**

#### 手順2: 全86ページにトラッキングコード追加（5分）
各HTMLファイルの`<head>`内に以下を挿入：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 手順3: GitHub Pagesにデプロイ（2分）
```bash
git add .
git commit -m "feat: GA4アクセス解析を全ページに追加"
git push origin master
```

#### 確認できるデータ
- リアルタイム閲覧者数
- ページビュー（どのページが人気か）
- 章別アクセス数
- デバイス別割合（モバイル/タブレット/デスクトップ）
- 流入元（検索、SNS、直接アクセスなど）
- 滞在時間
- 離脱率

### 所要時間
**合計: 約15分**

---

## 💬 2. Discord自動メッセージ送信システム

### 概要
Discordサーバーで短期講座を運営し、スプレッドシートで管理した送信スケジュールに従って、指定した日時に自動的に励ましメッセージを送信する。

### 実現可能性
**✅ 完全に可能**

### 技術スタック
- **Discord Webhook**: メッセージ送信
- **Google Apps Script（GAS）**: 定期実行エンジン
- **Googleスプレッドシート**: 送信スケジュール管理

### システム構成

```
Googleスプレッドシート（送信スケジュール）
    ↓
Google Apps Script（1分ごとにチェック）
    ↓
Discord Webhook（メッセージ送信）
    ↓
Discordチャンネル
```

### 機能詳細

#### スプレッドシート構成

**シート1: 送信スケジュール**
| 送信日時 | Webhook名 | メッセージ | 送信状態 | 送信日時（実際） | エラー内容 |
|---------|----------|----------|---------|---------------|----------|
| 2025-11-03 09:00 | 励まし | 今日から頑張りましょう！ | | | |
| 2025-11-03 18:00 | 講座-連絡 | 本日の講座は終了しました | | | |

**シート2: Webhook設定**
| Webhook名 | Webhook URL | カスタム送信者名 | カスタムアバターURL |
|----------|------------|----------------|-------------------|
| 励まし | https://discord.com/api/webhooks/... | 励ましBot | https://example.com/avatar.png |
| 講座-連絡 | https://discord.com/api/webhooks/... | 運営チーム | https://example.com/team.png |

#### 送信元のカスタマイズ
Discord Webhookでは、メッセージごとに送信者名とアイコンを自由に変更できます。

```javascript
var payload = {
  content: "今日から頑張りましょう！",
  username: "励ましBot",  // 送信者名を変更
  avatar_url: "https://example.com/avatar.png"  // アイコンも変更
};
```

#### 複数チャンネル対応
Webhook設定シートに複数のWebhookを登録することで、メッセージごとに送信先チャンネルを切り替え可能。

### 実装手順

#### Phase 1: Discord側の設定（5分）
1. 送信したいチャンネルを右クリック → チャンネル編集
2. 連携サービス → ウェブフックを作成
3. Webhook URLをコピー
4. 複数チャンネルで繰り返し

#### Phase 2: Googleスプレッドシート作成（5分）
1. 新規スプレッドシート作成
2. 「送信スケジュール」シート作成（列：送信日時、Webhook名、メッセージ、送信状態、送信日時（実際）、エラー内容）
3. 「Webhook設定」シート作成（列：Webhook名、Webhook URL、カスタム送信者名、カスタムアバターURL）

#### Phase 3: Google Apps Script作成（10分）
1. スプレッドシート → 拡張機能 → Apps Script
2. 以下の関数を実装：
   - `setupSheets()`: シート構造の自動作成
   - `sendToDiscord()`: Discord送信ロジック
   - `setupTrigger()`: トリガー自動設定
3. タイムゾーンを`Asia/Tokyo`に設定

#### Phase 4: トリガー設定（2分）
1. `setupTrigger()`関数を実行
2. 1分ごとに`sendToDiscord()`を自動実行

#### Phase 5: 運用開始
1. 送信スケジュールシートにメッセージを追加
2. 指定時刻になったら自動送信
3. 送信状態が「送信完了」に更新される

### メリット
- ✅ 実装が簡単（約30分で完成）
- ✅ スプレッドシートで管理（非エンジニアでも運用可能）
- ✅ 複数チャンネル対応
- ✅ 送信元名・アイコンのカスタマイズ可能
- ✅ 完全無料
- ✅ 送信履歴が自動記録

### デメリット
- ❌ 一方向送信のみ（返信検知不可）
- ❌ 時間精度：数秒のズレ可能性
- ❌ メッセージの削除・編集不可

### 所要時間
**基本実装: 約30分**
**エラーハンドリング込み: 1-2時間**

---

## 🚀 3. Clasp CLIによる完全自動化

### 概要
Google Apps Script CLI（clasp）を使って、Discord自動送信システムのセットアップを完全自動化する。

### 実現可能性
**✅ 完全自動化可能**

### Claspとは
- Google Apps ScriptのCLI（Command Line Interface）
- ローカルでGASプロジェクトを作成・編集・デプロイできる
- Git/GitHubでバージョン管理可能
- CI/CD連携可能

### 完全自動化できる範囲
- ✅ Googleスプレッドシート作成
- ✅ シート構造の初期化（複数シート、列設定）
- ✅ GASコードのデプロイ
- ✅ トリガーの自動設定
- ✅ サンプルデータの投入

### セットアップ方法

#### 前提条件
- Node.js v6.0.0以上
- Google Apps Script APIを有効化

#### セットアップスクリプト（setup.sh）
```bash
#!/bin/bash

# claspインストール確認
npm install -g @google/clasp

# claspログイン
clasp login

# プロジェクトディレクトリ作成
mkdir discord-auto-sender
cd discord-auto-sender

# GASプロジェクト作成（スプレッドシート連携）
clasp create --title "Discord自動送信システム" --type sheets

# appsscript.json作成
cat > appsscript.json <<EOF
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
EOF

# Code.gs作成（詳細はメモ内の完全版コードを参照）
cat > Code.gs <<'EOF'
// setupSheets()、sendToDiscord()、setupTrigger()関数を実装
EOF

# GASにプッシュ
clasp push

# GASエディタを開く
clasp open
```

#### 実行コマンド
```bash
bash setup.sh
```

→ これだけで、スプレッドシート作成からトリガー設定まで完了！

### プロジェクト構造
```
discord-auto-sender/
├── .clasp.json           # claspの設定（自動生成）
├── appsscript.json       # GASマニフェスト
├── Code.gs               # メインコード
├── setup.sh              # セットアップスクリプト
└── README.md             # ドキュメント
```

### メリット
- ✅ 1コマンドで全自動セットアップ
- ✅ ローカルで快適に開発（好きなエディタ使用可能）
- ✅ Git/GitHubでバージョン管理
- ✅ チーム開発に最適
- ✅ CI/CD（GitHub Actions等）との連携可能

### デメリット
- ❌ 初期学習コスト（claspの使い方）
- ❌ Node.js環境が必要
- ❌ 初回の権限承認は手動

### 所要時間
**初回セットアップ: 30分**
**2回目以降: 5分**

---

## 📝 実装優先度

### 🥇 優先度：高
**GA4アクセス記録機能**
- 理由：設定が簡単（15分）、すぐに効果が出る
- 次のアクション：測定IDを取得して実装

### 🥈 優先度：中
**Discord自動メッセージ送信システム**
- 理由：短期講座運営時に有用
- 次のアクション：講座開始時期に合わせて実装

### 🥉 優先度：低
**Clasp CLIによる自動化**
- 理由：Discord送信システムを実装する場合の効率化
- 次のアクション：Discord送信システム実装時に検討

---

## 🎯 次のステップ

### GA4実装の場合
1. Google Analyticsアカウント作成（5分）
2. 測定ID取得（2分）
3. 86個のHTMLファイルにトラッキングコード追加（5分）
4. GitHub Pagesにデプロイ（2分）
5. 動作確認（1分）

### Discord送信システム実装の場合
1. Discord Webhookを取得（5分）
2. Googleスプレッドシート作成（5分）
3. Google Apps Script実装（30分）
4. トリガー設定（2分）
5. テスト実行（3分）

---

## 📚 参考資料

### GA4関連
- [Google Analytics公式サイト](https://analytics.google.com/)
- [GA4設定ガイド](https://support.google.com/analytics/answer/9304153)

### Discord Webhook関連
- [Discord Webhook公式ドキュメント](https://discord.com/developers/docs/resources/webhook)
- [Webhook実装ガイド](https://birdie0.github.io/discord-webhooks-guide/)

### Clasp CLI関連
- [clasp公式GitHub](https://github.com/google/clasp)
- [Google Apps Script API](https://developers.google.com/apps-script/api)

---

**このメモは調査段階のアイデアであり、実装は未定です。実装する場合は、プロジェクトの状況に応じて優先度を判断します。**
