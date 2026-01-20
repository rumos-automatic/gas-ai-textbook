/**
 * 平コン作業会スライド画像圧縮スクリプト
 *
 * 使用方法:
 *   npm install sharp
 *   node scripts/compress-hirakon-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// 設定
const INPUT_DIR = path.join(__dirname, '..', '作業会');
const OUTPUT_DIR = path.join(__dirname, '..', '特典', 'images');

// 画像マッピング
const imageMapping = [
  { input: '01_AI基礎_よくある誤解.png', output: '01-ai-basics.webp', title: 'AI基礎：よくある誤解' },
  { input: '02_ChatGPT_GPTsとProjectsの違い.png', output: '02-gpts-vs-projects.webp', title: 'ChatGPT：GPTsとProjectsの違い' },
  { input: '03_ChatGPT_GPTsとProjects間取り図.png', output: '03-chatgpt-map.webp', title: 'ChatGPT：GPTsとProjects間取り図' },
  { input: '04_ChatGPT_GPTsとProjectsの使い分け.png', output: '04-gpts-projects-usage.webp', title: 'ChatGPT：GPTsとProjectsの使い分け' },
  { input: '05_ChatGPT_プロジェクト活用例.png', output: '05-project-examples.webp', title: 'ChatGPT：プロジェクト活用例' },
  { input: '06_プロンプト_コツ.png', output: '06-prompt-tips.webp', title: 'プロンプトのコツ' },
  { input: '07_比較_関数vsGAS詳細.jpeg', output: '07-function-vs-gas.webp', title: '比較：関数vsGAS詳細' },
  { input: '08_比較_関数の限界.jpeg', output: '08-function-limits.webp', title: '比較：関数の限界' },
  { input: '09_GAS機能_できること一覧.jpeg', output: '09-gas-features.webp', title: 'GAS機能：できること一覧' },
  { input: '10_GAS機能_複数列を1列に.jpeg', output: '10-gas-columns.webp', title: 'GAS機能：複数列を1列に' },
  { input: '11_GAS機能_5000件区切り.jpeg', output: '11-gas-5000rows.webp', title: 'GAS機能：5000件区切り' },
  { input: '12_GAS基礎_トリガーとは.png', output: '12-triggers.webp', title: 'GAS基礎：トリガーとは' },
  { input: '13_GAS基礎_制限事項.png', output: '13-gas-limits.webp', title: 'GAS基礎：制限事項' },
];

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compressImage(inputFile, outputFile) {
  const inputPath = path.join(INPUT_DIR, inputFile);
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  try {
    const inputStats = fs.statSync(inputPath);
    const inputSizeKB = (inputStats.size / 1024).toFixed(1);

    await sharp(inputPath)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(1);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ ${inputFile}`);
    console.log(`   → ${outputFile}`);
    console.log(`   ${inputSizeKB} KB → ${outputSizeKB} KB (${reduction}% 削減)`);
    console.log('');

    return {
      input: inputFile,
      output: outputFile,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
    };
  } catch (error) {
    console.error(`❌ ${inputFile}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('  平コン作業会スライド画像圧縮');
  console.log('========================================\n');

  const results = [];
  let totalInputSize = 0;
  let totalOutputSize = 0;

  for (const image of imageMapping) {
    const result = await compressImage(image.input, image.output);
    if (result) {
      results.push(result);
      totalInputSize += result.inputSize;
      totalOutputSize += result.outputSize;
    }
  }

  console.log('========================================');
  console.log('  完了サマリー');
  console.log('========================================');
  console.log(`処理成功: ${results.length}/${imageMapping.length} ファイル`);
  console.log(`合計サイズ: ${(totalInputSize / 1024 / 1024).toFixed(2)} MB → ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`削減率: ${((1 - totalOutputSize / totalInputSize) * 100).toFixed(1)}%`);
  console.log(`\n出力先: ${OUTPUT_DIR}`);

  // JSONマッピングファイル出力（HTML生成用）
  const mappingPath = path.join(OUTPUT_DIR, 'image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
  console.log(`\n画像マッピング出力: ${mappingPath}`);
}

main().catch(console.error);
