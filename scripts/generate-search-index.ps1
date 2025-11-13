# ================================================================
# 検索インデックス生成スクリプト
# ================================================================
# 全HTMLファイルからテキストコンテンツを抽出し、
# 検索用のJSONインデックスを生成します
# ================================================================

# 設定
$baseDir = Split-Path -Parent $PSScriptRoot
$outputFile = Join-Path $baseDir "assets\data\search-index.json"

# カテゴリマッピング関数
function Get-CategoryIcon {
    param([string]$category)
    switch ($category) {
        "生成AI" { return "🤖" }
        "GAS" { return "⚙️" }
        "実践編" { return "🚀" }
        "基本的な考え方" { return "💡" }
        "上級編" { return "🎓" }
        default { return "📄" }
    }
}

function Get-CategoryColor {
    param([string]$category)
    switch ($category) {
        "生成AI" { return "indigo" }
        "GAS" { return "blue" }
        "実践編" { return "purple" }
        "基本的な考え方" { return "yellow" }
        "上級編" { return "green" }
        default { return "gray" }
    }
}

# HTMLからテキストを抽出する関数
function Extract-TextFromHtml {
    param (
        [string]$htmlContent
    )

    # scriptタグとstyleタグを削除
    $htmlContent = $htmlContent -replace '<script[^>]*>.*?</script>', ''
    $htmlContent = $htmlContent -replace '<style[^>]*>.*?</style>', ''

    # HTMLタグを削除
    $htmlContent = $htmlContent -replace '<[^>]+>', ' '

    # HTML エンティティのデコード
    $htmlContent = $htmlContent -replace '&nbsp;', ' '
    $htmlContent = $htmlContent -replace '&lt;', '<'
    $htmlContent = $htmlContent -replace '&gt;', '>'
    $htmlContent = $htmlContent -replace '&amp;', '&'
    $htmlContent = $htmlContent -replace '&quot;', '"'
    $htmlContent = $htmlContent -replace '&#39;', "'"

    # 連続する空白を1つに
    $htmlContent = $htmlContent -replace '\s+', ' '

    # 前後の空白を削除
    return $htmlContent.Trim()
}

# セクションを抽出する関数
function Extract-Sections {
    param (
        [string]$htmlContent
    )

    $sections = @()

    # <section id="..."> を探す
    $sectionPattern = '<section[^>]+id=["'']([^"'']+)["''][^>]*>(.*?)</section>'
    $matches = [regex]::Matches($htmlContent, $sectionPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

    foreach ($match in $matches) {
        $sectionId = $match.Groups[1].Value
        $sectionContent = $match.Groups[2].Value

        # セクションタイトルを抽出（h2, h3タグ）
        $titlePattern = '<h[23][^>]*>(.*?)</h[23]>'
        $titleMatch = [regex]::Match($sectionContent, $titlePattern)
        $sectionTitle = if ($titleMatch.Success) {
            Extract-TextFromHtml -htmlContent $titleMatch.Groups[1].Value
        } else {
            $sectionId
        }

        # セクション全体のテキストを抽出
        $textContent = Extract-TextFromHtml -htmlContent $sectionContent

        # 空のセクションはスキップ
        if ($textContent.Length -gt 20) {
            $sections += @{
                "id" = $sectionId
                "title" = $sectionTitle
                "content" = $textContent
            }
        }
    }

    return $sections
}

# ページタイトルを抽出する関数
function Extract-PageTitle {
    param (
        [string]$htmlContent
    )

    $titlePattern = '<title>(.*?)</title>'
    $match = [regex]::Match($htmlContent, $titlePattern)
    if ($match.Success) {
        return Extract-TextFromHtml -htmlContent $match.Groups[1].Value
    }
    return ""
}

# メイン処理
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "検索インデックスの生成を開始します" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pages = @()
$totalSections = 0

# 対象ディレクトリ
$targetDirs = @("生成AI", "GAS", "実践編", "基本的な考え方", "上級編")

foreach ($dir in $targetDirs) {
    $dirPath = Join-Path $baseDir $dir

    if (Test-Path $dirPath) {
        Write-Host "📁 $dir ディレクトリをスキャン中..." -ForegroundColor Yellow

        $htmlFiles = Get-ChildItem -Path $dirPath -Filter "*.html" -File

        foreach ($file in $htmlFiles) {
            Write-Host "  └─ $($file.Name) を処理中..." -ForegroundColor Gray

            # HTMLファイルを読み込み（UTF-8）
            $htmlContent = Get-Content -Path $file.FullName -Encoding UTF8 -Raw

            # ページタイトルを抽出
            $pageTitle = Extract-PageTitle -htmlContent $htmlContent

            # セクションを抽出
            $sections = Extract-Sections -htmlContent $htmlContent

            if ($sections.Count -gt 0) {
                # 相対パスを生成
                $relativePath = "$dir/$($file.Name)"

                # カテゴリ情報を取得
                $categoryIcon = Get-CategoryIcon -category $dir
                $categoryColor = Get-CategoryColor -category $dir

                $pageData = @{
                    "path" = $relativePath
                    "title" = $pageTitle
                    "category" = $dir
                    "categoryIcon" = $categoryIcon
                    "categoryColor" = $categoryColor
                    "sections" = $sections
                }

                $pages += $pageData
                $totalSections += $sections.Count
            }
        }
    }
}

# index.htmlとroadmap.htmlも追加
$specialFiles = @("index.html", "roadmap.html")
foreach ($specialFile in $specialFiles) {
    $filePath = Join-Path $baseDir $specialFile
    if (Test-Path $filePath) {
        Write-Host "📁 $specialFile を処理中..." -ForegroundColor Yellow

        $htmlContent = Get-Content -Path $filePath -Encoding UTF8 -Raw
        $pageTitle = Extract-PageTitle -htmlContent $htmlContent
        $sections = Extract-Sections -htmlContent $htmlContent

        if ($sections.Count -gt 0) {
            $pageData = @{
                "path" = $specialFile
                "title" = $pageTitle
                "category" = "トップ"
                "categoryIcon" = "🏠"
                "categoryColor" = "gray"
                "sections" = $sections
            }

            $pages += $pageData
            $totalSections += $sections.Count
        }
    }
}

# JSONデータを生成
$indexData = @{
    "version" = "1.0"
    "generatedAt" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    "totalPages" = $pages.Count
    "totalSections" = $totalSections
    "pages" = $pages
}

# JSONに変換して保存
$jsonContent = $indexData | ConvertTo-Json -Depth 10 -Compress:$false
$jsonContent | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 検索インデックスの生成が完了しました！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 統計情報:" -ForegroundColor Cyan
Write-Host "  - 総ページ数: $($pages.Count)" -ForegroundColor White
Write-Host "  - 総セクション数: $totalSections" -ForegroundColor White
Write-Host "  - 出力ファイル: $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "ファイルサイズ: $([math]::Round((Get-Item $outputFile).Length / 1KB, 2)) KB" -ForegroundColor White
Write-Host ""
