# 進捗バーとドットインジケーター確認スクリプト

$実践編Path = "C:\CLAUDE_CODE\01_RUMOS_Project\GAS短期講座 V2.0\実践編"
$トラブルPath = "C:\CLAUDE_CODE\01_RUMOS_Project\GAS短期講座 V2.0\トラブルシューティング"

$results = @()

# 実践編のファイルをチェック
Get-ChildItem -Path $実践編Path -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $hasProgressBar = $content -match "\.progress-bar"
    $hasDotIndicator = $content -match "\.dot-indicator"

    $results += [PSCustomObject]@{
        File = $_.Name
        Directory = "実践編"
        ProgressBar = $hasProgressBar
        DotIndicator = $hasDotIndicator
    }
}

# トラブルシューティングのファイルをチェック
Get-ChildItem -Path $トラブルPath -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $hasProgressBar = $content -match "\.progress-bar"
    $hasDotIndicator = $content -match "\.dot-indicator"

    $results += [PSCustomObject]@{
        File = $_.Name
        Directory = "トラブルシューティング"
        ProgressBar = $hasProgressBar
        DotIndicator = $hasDotIndicator
    }
}

# 結果を表示
Write-Host "`n=== 進捗バー・ドットインジケーター確認結果 ===`n" -ForegroundColor Cyan

# 進捗バーなし
$noProgressBar = $results | Where-Object { -not $_.ProgressBar }
Write-Host "❌ 進捗バーが欠落しているファイル: $($noProgressBar.Count)件" -ForegroundColor Red
$noProgressBar | ForEach-Object {
    Write-Host "  - $($_.Directory)\$($_.File)" -ForegroundColor Yellow
}

Write-Host ""

# ドットインジケーターなし
$noDotIndicator = $results | Where-Object { -not $_.DotIndicator }
Write-Host "❌ ドットインジケーターが欠落しているファイル: $($noDotIndicator.Count)件" -ForegroundColor Red
$noDotIndicator | ForEach-Object {
    Write-Host "  - $($_.Directory)\$($_.File)" -ForegroundColor Yellow
}

Write-Host ""

# 両方あり
$hasBoth = $results | Where-Object { $_.ProgressBar -and $_.DotIndicator }
Write-Host "✅ 両方実装済み: $($hasBoth.Count)件" -ForegroundColor Green

Write-Host ""

# 統計
Write-Host "📊 統計" -ForegroundColor Cyan
Write-Host "  総ファイル数: $($results.Count)"
Write-Host "  進捗バーあり: $(($results | Where-Object { $_.ProgressBar }).Count)"
Write-Host "  進捗バーなし: $(($results | Where-Object { -not $_.ProgressBar }).Count)"
Write-Host "  ドットインジケーターあり: $(($results | Where-Object { $_.DotIndicator }).Count)"
Write-Host "  ドットインジケーターなし: $(($results | Where-Object { -not $_.DotIndicator }).Count)"

# CSVに出力
$results | Export-Csv -Path "C:\CLAUDE_CODE\01_RUMOS_Project\GAS短期講座 V2.0\progress_dots_check.csv" -NoTypeInformation -Encoding UTF8
Write-Host "`n結果をCSVに出力しました: progress_dots_check.csv" -ForegroundColor Green
