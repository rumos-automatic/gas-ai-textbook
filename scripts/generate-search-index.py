#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
検索インデックス生成スクリプト
全HTMLファイルからテキストコンテンツを抽出し、検索用のJSONインデックスを生成します
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime
from html.parser import HTMLParser

# カテゴリマッピング
CATEGORY_MAP = {
    "生成AI": {"icon": "🤖", "color": "indigo"},
    "GAS": {"icon": "⚙️", "color": "blue"},
    "実践編": {"icon": "🚀", "color": "purple"},
    "基本的な考え方": {"icon": "💡", "color": "yellow"},
    "上級編": {"icon": "🎓", "color": "green"},
}


class HTMLTextExtractor(HTMLParser):
    """HTMLからテキストを抽出するパーサー"""

    def __init__(self):
        super().__init__()
        self.text = []
        self.in_script = False
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style', 'svg', 'noscript']:
            if tag == 'script':
                self.in_script = True
            elif tag == 'style':
                self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
        elif tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            # 空白を正規化
            text = ' '.join(data.split())
            if text:
                self.text.append(text)

    def get_text(self):
        return ' '.join(self.text)


def extract_text_from_html(html_content):
    """HTMLからテキストを抽出"""
    parser = HTMLTextExtractor()
    parser.feed(html_content)
    return parser.get_text()


def extract_page_title(html_content):
    """ページタイトルを抽出"""
    title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE)
    if title_match:
        return extract_text_from_html(title_match.group(1))
    return ""


def extract_sections(html_content):
    """セクションを抽出"""
    sections = []

    # <section id="...">...</section> を探す
    section_pattern = r'<section[^>]+id=["\']([^"\']+)["\'][^>]*>(.*?)</section>'
    matches = re.finditer(section_pattern, html_content, re.DOTALL | re.IGNORECASE)

    for match in matches:
        section_id = match.group(1)
        section_content = match.group(2)

        # セクションタイトルを抽出（h2, h3タグ）
        title_match = re.search(r'<h[23][^>]*>(.*?)</h[23]>', section_content, re.IGNORECASE)
        if title_match:
            section_title = extract_text_from_html(title_match.group(1))
        else:
            section_title = section_id

        # セクション全体のテキストを抽出
        text_content = extract_text_from_html(section_content)

        # 空のセクションはスキップ
        if len(text_content) > 20:
            sections.append({
                "id": section_id,
                "title": section_title,
                "content": text_content
            })

    return sections


def process_html_file(file_path, base_dir):
    """HTMLファイルを処理"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # 相対パスを生成
        relative_path = os.path.relpath(file_path, base_dir).replace('\\', '/')

        # ページタイトルを抽出
        page_title = extract_page_title(html_content)

        # セクションを抽出
        sections = extract_sections(html_content)

        if not sections:
            return None

        # カテゴリを判定
        parts = relative_path.split('/')
        if len(parts) > 1:
            category = parts[0]
        else:
            category = "トップ"

        # カテゴリ情報を取得
        category_info = CATEGORY_MAP.get(category, {"icon": "📄", "color": "gray"})

        return {
            "path": relative_path,
            "title": page_title,
            "category": category,
            "categoryIcon": category_info["icon"],
            "categoryColor": category_info["color"],
            "sections": sections
        }

    except Exception as e:
        print(f"エラー: {file_path} - {e}")
        return None


def main():
    """メイン処理"""
    base_dir = Path(__file__).parent.parent
    output_file = base_dir / "assets" / "data" / "search-index.json"

    print("=" * 60)
    print("検索インデックスの生成を開始します")
    print("=" * 60)
    print()

    # 対象ディレクトリ
    target_dirs = ["生成AI", "GAS", "実践編", "基本的な考え方", "上級編"]

    pages = []
    total_sections = 0

    # 各ディレクトリを処理
    for dir_name in target_dirs:
        dir_path = base_dir / dir_name

        if not dir_path.exists():
            continue

        print(f"[{dir_name}] ディレクトリをスキャン中...")

        html_files = sorted(dir_path.glob("*.html"))

        for html_file in html_files:
            print(f"  - {html_file.name} を処理中...")

            page_data = process_html_file(html_file, base_dir)
            if page_data:
                pages.append(page_data)
                total_sections += len(page_data["sections"])

    # index.htmlとroadmap.htmlも追加
    special_files = ["index.html", "roadmap.html"]
    for special_file in special_files:
        file_path = base_dir / special_file
        if file_path.exists():
            print(f"[{special_file}] を処理中...")

            page_data = process_html_file(file_path, base_dir)
            if page_data:
                # カテゴリを上書き
                page_data["category"] = "トップ"
                page_data["categoryIcon"] = "🏠"
                page_data["categoryColor"] = "gray"
                pages.append(page_data)
                total_sections += len(page_data["sections"])

    # JSONデータを生成
    index_data = {
        "version": "1.0",
        "generatedAt": datetime.now().isoformat(),
        "totalPages": len(pages),
        "totalSections": total_sections,
        "pages": pages
    }

    # JSONファイルに保存
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    print("検索インデックスの生成が完了しました！")
    print("=" * 60)
    print()
    print("統計情報:")
    print(f"  - 総ページ数: {len(pages)}")
    print(f"  - 総セクション数: {total_sections}")
    print(f"  - 出力ファイル: {output_file}")
    print()

    file_size = output_file.stat().st_size / 1024
    print(f"ファイルサイズ: {file_size:.2f} KB")
    print()


if __name__ == "__main__":
    main()
