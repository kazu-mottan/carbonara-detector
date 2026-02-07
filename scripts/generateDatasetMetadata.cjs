const fs = require('fs');
const path = require('path');

const DATA_DIR = 'training/data';
const OUTPUT_DIR = 'public/dataset';
const CATEGORIES = ['carbonara', 'not-carbonara'];

function generateMetadata() {
  console.log('📊 データセットメタデータを生成中...');

  const metadata = {
    generatedAt: new Date().toISOString(),
    totalCount: 0,
    categories: {
      carbonara: 0,
      'not-carbonara': 0
    },
    images: []
  };

  // 出力ディレクトリの作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 各カテゴリの画像を処理
  CATEGORIES.forEach(category => {
    const sourcePath = path.join(DATA_DIR, category);
    const destPath = path.join(OUTPUT_DIR, category);

    // ソースディレクトリが存在しない場合はスキップ
    if (!fs.existsSync(sourcePath)) {
      console.log(`  ⚠️ ${category}: ディレクトリが見つかりません`);
      return;
    }

    // ディレクトリ作成
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    // ファイル一覧取得
    const files = fs.readdirSync(sourcePath)
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    console.log(`  ${category}: ${files.length}枚`);

    files.forEach(file => {
      const srcFilePath = path.join(sourcePath, file);
      const destFilePath = path.join(destPath, file);
      const stats = fs.statSync(srcFilePath);

      // 画像をコピー
      fs.copyFileSync(srcFilePath, destFilePath);

      // メタデータに追加
      metadata.images.push({
        id: `${category}-${file.replace(/\.[^.]+$/, '')}`,
        filename: file,
        category: category,
        path: `/dataset/${category}/${file}`,
        size: stats.size,
        createdAt: stats.birthtime.toISOString()
      });
    });

    metadata.categories[category] = files.length;
    metadata.totalCount += files.length;
  });

  // メタデータをJSONに保存
  const metadataPath = path.join('public', 'dataset-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ 完了: ${metadata.totalCount}枚の画像を処理しました`);
  console.log(`   カルボナーラ: ${metadata.categories.carbonara}枚`);
  console.log(`   その他: ${metadata.categories['not-carbonara']}枚`);
}

generateMetadata();
