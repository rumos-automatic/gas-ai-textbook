#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全HTMLファイルに検索機能を追加するスクリプト
"""

import os
import re
from pathlib import Path

def add_search_scripts(html_content, depth=0):
    """HTMLに検索機能のscript/linkタグを追加"""

    # 既に追加済みかチェック
    if 'searchGlobal.js' in html_content:
        return html_content, False

    # 相対パスを計算
    if depth == 0:
        base_path = './'
    else:
        base_path = '../' * depth

    # 追加するコード
    search_tags = f'''  <!-- グローバル検索機能 -->
  <link rel="stylesheet" href="{base_path}assets/css/search-global.css">
  <script src="{base_path}assets/js/searchGlobal.js" defer></script>
  <script src="{base_path}assets/js/highlightManager.js" defer></script>'''

    # </head>の直前に挿入
    head_close_pattern = r'(\s*</head>)'
    replacement = f'{search_tags}\n\\1'

    new_content = re.sub(head_close_pattern, replacement, html_content, count=1)

    if new_content == html_content:
        return html_content, False

    return new_content, True


def process_html_file(file_path, base_dir):
    """HTMLファイルを処理"""
    try:
        # 相対パスを生成
        relative_path = os.path.relpath(file_path, base_dir)

        # 階層の深さを計算
        depth = relative_path.count(os.sep) - (1 if relative_path.endswith('.html') else 0)
        if os.sep in relative_path:
            depth = len(Path(relative_path).parent.parts)
        else:
            depth = 0

        # HTMLファイルを読み込み
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # 検索機能を追加
        new_content, modified = add_search_scripts(html_content, depth)

        if not modified:
            return False, "既に追加済み"

        # ファイルに書き込み
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True, "追加完了"

    except Exception as e:
        return False, f"エラー: {e}"


def main():
    """メイン処理"""
    base_dir = Path(__file__).parent.parent

    print("=" * 60)
    print("全HTMLファイルに検索機能を追加します")
    print("=" * 60)
    print()

    # 対象ディレクトリ
    target_dirs = ["生成AI", "GAS", "実践編", "基本的な考え方", "上級編", "トラブルシューティング"]

    total_files = 0
    added_files = 0
    skipped_files = 0
    error_files = 0

    # 各ディレクトリを処理
    for dir_name in target_dirs:
        dir_path = base_dir / dir_name

        if not dir_path.exists():
            continue

        print(f"[{dir_name}] ディレクトリを処理中...")

        html_files = sorted(dir_path.glob("*.html"))

        for html_file in html_files:
            total_files += 1
            success, message = process_html_file(html_file, base_dir)

            if success:
                print(f"  [OK] {html_file.name}")
                added_files += 1
            elif "既に追加済み" in message:
                print(f"  [SKIP] {html_file.name} - {message}")
                skipped_files += 1
            else:
                print(f"  [ERROR] {html_file.name} - {message}")
                error_files += 1

    # index.htmlとroadmap.htmlも処理
    special_files = ["index.html", "roadmap.html"]
    for special_file in special_files:
        file_path = base_dir / special_file
        if file_path.exists():
            total_files += 1
            success, message = process_html_file(file_path, base_dir)

            if success:
                print(f"  [OK] {special_file}")
                added_files += 1
            elif "既に追加済み" in message:
                print(f"  [SKIP] {special_file} - {message}")
                skipped_files += 1
            else:
                print(f"  [ERROR] {special_file} - {message}")
                error_files += 1

    print()
    print("=" * 60)
    print("処理が完了しました！")
    print("=" * 60)
    print()
    print("統計情報:")
    print(f"  - 総ファイル数: {total_files}")
    print(f"  - 追加完了: {added_files}")
    print(f"  - スキップ: {skipped_files}")
    print(f"  - エラー: {error_files}")
    print()


if __name__ == "__main__":
    main()
