const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'public';

/**
 * PWAアイコンを生成するスクリプト
 * シンプルなグラデーション背景に「🍝」絵文字を配置
 */
async function generateIcons() {
  console.log('🎨 PWAアイコンを生成中...');

  const sizes = [
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' }
  ];

  for (const { size, filename } of sizes) {
    try {
      // グラデーション背景のSVGを作成（紫のグラデーション）
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="${size * 0.6}"
            fill="white"
            font-family="Arial, sans-serif"
            font-weight="bold"
          >🍝</text>
        </svg>
      `;

      const outputPath = path.join(OUTPUT_DIR, filename);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`  ✅ ${filename} を生成しました`);
    } catch (error) {
      console.error(`  ❌ ${filename} の生成に失敗:`, error.message);
    }
  }

  console.log('🎉 アイコン生成完了！');
}

generateIcons().catch(console.error);
