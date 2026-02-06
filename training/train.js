import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定パラメータ
const CONFIG = {
  imageSize: 224,
  batchSize: 4,
  epochs: 30,
  learningRate: 0.001,
  validationSplit: 0.2,
  dataAugmentation: true,
  modelSavePath: path.join(__dirname, '../public/models'),
  dataPath: path.join(__dirname, 'data'),
};

console.log('🍝 Carbonara Detector - モデル訓練開始\n');
console.log('設定:');
console.log(`  画像サイズ: ${CONFIG.imageSize}x${CONFIG.imageSize}`);
console.log(`  バッチサイズ: ${CONFIG.batchSize}`);
console.log(`  エポック数: ${CONFIG.epochs}`);
console.log(`  学習率: ${CONFIG.learningRate}`);
console.log(`  検証データ割合: ${CONFIG.validationSplit * 100}%\n`);

/**
 * 画像ファイルを読み込んでテンソルに変換
 */
function loadImage(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();

  let imageData;
  if (ext === '.jpg' || ext === '.jpeg') {
    imageData = jpeg.decode(buffer, { useTArray: true });
  } else if (ext === '.png') {
    imageData = PNG.sync.read(buffer);
  } else {
    throw new Error(`サポートされていない画像形式: ${ext}`);
  }

  // TensorFlow.jsテンソルに変換
  const tensor = tf.browser.fromPixels({
    data: new Uint8Array(imageData.data),
    width: imageData.width,
    height: imageData.height,
  });

  return tensor;
}

/**
 * 画像を前処理（リサイズ、正規化）
 */
function preprocessImage(tensor, targetSize) {
  return tf.tidy(() => {
    // リサイズ（bilinear interpolation）
    const resized = tf.image.resizeBilinear(tensor, [targetSize, targetSize]);

    // 正規化: 0-255 → 0-1
    const normalized = resized.div(255.0);

    return normalized;
  });
}

/**
 * データ拡張の適用
 */
function augmentImage(tensor) {
  return tf.tidy(() => {
    // バッチ次元を追加 [H, W, C] -> [1, H, W, C]
    let augmented = tensor.expandDims(0);

    // ランダム水平反転（50%の確率）
    if (Math.random() > 0.5) {
      augmented = tf.image.flipLeftRight(augmented);
    }

    // ランダム明度調整（手動実装）
    const brightnessDelta = (Math.random() - 0.5) * 0.4; // -0.2 ~ +0.2
    augmented = augmented.add(brightnessDelta);

    // ランダムコントラスト調整（手動実装）
    const contrastFactor = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
    const mean = augmented.mean();
    augmented = augmented.sub(mean).mul(contrastFactor).add(mean);

    // 値を0-1の範囲にクリップ
    augmented = tf.clipByValue(augmented, 0, 1);

    // バッチ次元を削除 [1, H, W, C] -> [H, W, C]
    return augmented.squeeze([0]);
  });
}

/**
 * ディレクトリから画像を読み込み
 */
function loadImagesFromDirectory(dirPath, label) {
  console.log(`📁 ${dirPath} から画像を読み込み中...`);

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });

  console.log(`  見つかった画像: ${imageFiles.length}枚`);

  const images = [];
  const labels = [];

  for (const file of imageFiles) {
    const imagePath = path.join(dirPath, file);
    try {
      const tensor = loadImage(imagePath);
      const processed = preprocessImage(tensor, CONFIG.imageSize);
      tensor.dispose();

      images.push(processed);
      labels.push(label);
    } catch (error) {
      console.warn(`  ⚠️  ${file} の読み込みに失敗: ${error.message}`);
    }
  }

  console.log(`  正常に読み込まれた画像: ${images.length}枚\n`);
  return { images, labels };
}

/**
 * データセットの準備
 */
async function prepareDataset() {
  console.log('📊 データセットを準備中...\n');

  // カルボナーラ画像を読み込み（ラベル: 1）
  const carbonaraPath = path.join(CONFIG.dataPath, 'carbonara');
  const carbonaraData = loadImagesFromDirectory(carbonaraPath, 1);

  // その他の画像を読み込み（ラベル: 0）
  const notCarbonaraPath = path.join(CONFIG.dataPath, 'not-carbonara');
  const notCarbonaraData = loadImagesFromDirectory(notCarbonaraPath, 0);

  // データを結合
  const allImages = [...carbonaraData.images, ...notCarbonaraData.images];
  const allLabels = [...carbonaraData.labels, ...notCarbonaraData.labels];

  console.log(`合計画像数: ${allImages.length}枚`);
  console.log(`  カルボナーラ: ${carbonaraData.images.length}枚`);
  console.log(`  その他: ${notCarbonaraData.images.length}枚\n`);

  if (allImages.length === 0) {
    throw new Error('画像が見つかりません。training/data/ 配下に画像を配置してください。');
  }

  // データをシャッフル
  const indices = Array.from({ length: allImages.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledImages = indices.map(i => allImages[i]);
  const shuffledLabels = indices.map(i => allLabels[i]);

  // 訓練データと検証データに分割
  const splitIndex = Math.floor(allImages.length * (1 - CONFIG.validationSplit));

  const trainImages = shuffledImages.slice(0, splitIndex);
  const trainLabels = shuffledLabels.slice(0, splitIndex);
  const valImages = shuffledImages.slice(splitIndex);
  const valLabels = shuffledLabels.slice(splitIndex);

  console.log(`訓練データ: ${trainImages.length}枚`);
  console.log(`検証データ: ${valImages.length}枚\n`);

  return {
    trainImages,
    trainLabels,
    valImages,
    valLabels,
  };
}

/**
 * シンプルなCNNモデルを構築
 */
async function createModel() {
  console.log('🏗️  モデルを構築中...\n');

  // シンプルなCNNモデルを作成
  const model = tf.sequential();

  // 畳み込み層1
  model.add(tf.layers.conv2d({
    inputShape: [224, 224, 3],
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  // 畳み込み層2
  model.add(tf.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  // 畳み込み層3
  model.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  // 畳み込み層4
  model.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  }));
  model.add(tf.layers.globalAveragePooling2d({}));

  // 全結合層
  model.add(tf.layers.dense({
    units: 256,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }));
  model.add(tf.layers.dropout({ rate: 0.5 }));

  model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }));
  model.add(tf.layers.dropout({ rate: 0.5 }));

  // 出力層
  model.add(tf.layers.dense({
    units: 2,
    activation: 'softmax',
  }));

  // モデルをコンパイル
  model.compile({
    optimizer: tf.train.adam(CONFIG.learningRate),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  console.log('✅ CNNモデルを作成しました');
  console.log('\n📋 モデルアーキテクチャ:');
  model.summary();
  console.log();

  return model;
}

/**
 * モデルの訓練
 */
async function trainModel(model, trainImages, trainLabels, valImages, valLabels) {
  console.log('🚀 訓練開始...\n');

  let bestValAccuracy = 0;
  let patienceCounter = 0;
  const patience = 5; // Early Stoppingの待機エポック数

  for (let epoch = 0; epoch < CONFIG.epochs; epoch++) {
    console.log(`Epoch ${epoch + 1}/${CONFIG.epochs}`);

    // バッチごとに訓練
    const numBatches = Math.ceil(trainImages.length / CONFIG.batchSize);
    let epochLoss = 0;
    let epochAcc = 0;

    for (let batch = 0; batch < numBatches; batch++) {
      const batchStart = batch * CONFIG.batchSize;
      const batchEnd = Math.min(batchStart + CONFIG.batchSize, trainImages.length);

      const batchImages = trainImages.slice(batchStart, batchEnd);
      const batchLabels = trainLabels.slice(batchStart, batchEnd);

      // データ拡張を適用
      const augmentedImages = CONFIG.dataAugmentation
        ? batchImages.map(img => augmentImage(img))
        : batchImages;

      // テンソルに変換
      const xs = tf.stack(augmentedImages);
      // One-hot encoding: [0, 1, 1] -> [[1,0], [0,1], [0,1]]
      const ys = tf.oneHot(tf.tensor1d(batchLabels, 'int32'), 2);

      // 訓練ステップ
      const result = await model.fit(xs, ys, {
        epochs: 1,
        verbose: 0,
      });

      epochLoss += result.history.loss[0];
      epochAcc += result.history.acc[0];

      // メモリクリーンアップ
      xs.dispose();
      ys.dispose();
      if (CONFIG.dataAugmentation) {
        augmentedImages.forEach(img => img.dispose());
      }

      // 進捗表示
      process.stdout.write(`\r  Batch ${batch + 1}/${numBatches} - loss: ${(epochLoss / (batch + 1)).toFixed(4)} - acc: ${(epochAcc / (batch + 1)).toFixed(4)}`);
    }

    // 検証データで評価
    const valXs = tf.stack(valImages);
    const valYs = tf.oneHot(tf.tensor1d(valLabels, 'int32'), 2);
    const valResult = await model.evaluate(valXs, valYs);
    const valLoss = await valResult[0].data();
    const valAcc = await valResult[1].data();
    valXs.dispose();
    valYs.dispose();
    valResult[0].dispose();
    valResult[1].dispose();

    console.log(` - val_loss: ${valLoss[0].toFixed(4)} - val_acc: ${valAcc[0].toFixed(4)}`);

    // Early Stopping
    if (valAcc[0] > bestValAccuracy) {
      bestValAccuracy = valAcc[0];
      patienceCounter = 0;
      console.log(`  🎉 新しいベストモデル（検証精度: ${(bestValAccuracy * 100).toFixed(2)}%）\n`);
    } else {
      patienceCounter++;
      if (patienceCounter >= patience) {
        console.log(`\n⏹️  Early Stopping: ${patience}エポック改善なし\n`);
        break;
      }
    }
  }

  console.log(`\n✅ 訓練完了！`);
  console.log(`最高検証精度: ${(bestValAccuracy * 100).toFixed(2)}%\n`);

  return model;
}

/**
 * モデルを保存
 */
async function saveModel(model) {
  console.log('💾 モデルを保存中...');

  // 保存先ディレクトリを作成
  if (!fs.existsSync(CONFIG.modelSavePath)) {
    fs.mkdirSync(CONFIG.modelSavePath, { recursive: true });
  }

  // モデル保存
  const saveUrl = `file://${CONFIG.modelSavePath}`;
  await model.save(saveUrl);

  console.log(`✅ モデルを保存しました: ${CONFIG.modelSavePath}`);
  console.log(`  - model.json`);
  console.log(`  - weights.bin\n`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    // データセット準備
    const { trainImages, trainLabels, valImages, valLabels } = await prepareDataset();

    // モデル構築
    const model = await createModel();

    // 訓練
    await trainModel(model, trainImages, trainLabels, valImages, valLabels);

    // モデル保存
    await saveModel(model);

    // メモリクリーンアップ
    trainImages.forEach(img => img.dispose());
    valImages.forEach(img => img.dispose());

    console.log('🎊 すべての処理が完了しました！\n');
    console.log('次のステップ:');
    console.log('  1. public/models/ にモデルファイルが保存されていることを確認');
    console.log('  2. npm run dev でフロントエンドを起動してテスト\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main();
