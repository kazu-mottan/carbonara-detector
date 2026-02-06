import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

/**
 * TensorFlow.jsモデルを読み込む
 * WASMバックエンドを使用し、ウォームアップを実行
 */
export async function loadModel(): Promise<tf.LayersModel> {
  try {
    console.log('🔧 TensorFlow.js バックエンドを初期化中...');

    // WASMバックエンドを設定（高速化）
    await tf.setBackend('wasm');
    await tf.ready();

    console.log(`✅ バックエンド: ${tf.getBackend()}`);
    console.log('📥 モデルを読み込み中...');

    // モデル読み込み
    const model = await tf.loadLayersModel('/models/model.json');

    console.log('✅ モデル読み込み完了');
    console.log('🔥 モデルウォームアップ中...');

    // ウォームアップ（初回推論の遅延を防ぐ）
    const warmupTensor = tf.zeros([1, 224, 224, 3]);
    const warmupResult = model.predict(warmupTensor);

    // メモリクリーンアップ
    warmupTensor.dispose();
    if (Array.isArray(warmupResult)) {
      warmupResult.forEach(t => t.dispose());
    } else {
      warmupResult.dispose();
    }

    console.log('✅ ウォームアップ完了');
    console.log('🎉 モデルの準備が整いました！');

    return model;
  } catch (error) {
    console.error('❌ モデル読み込みエラー:', error);
    throw new Error(
      `モデルの読み込みに失敗しました。\n` +
      `モデルファイルが public/models/ に配置されているか確認してください。\n` +
      `詳細: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * メモリ使用量を表示（デバッグ用）
 */
export function logMemoryUsage(): void {
  const memoryInfo = tf.memory();
  console.log('📊 TensorFlow.js メモリ使用量:');
  console.log(`  テンソル数: ${memoryInfo.numTensors}`);
  console.log(`  データバッファ数: ${memoryInfo.numDataBuffers}`);
  console.log(`  使用メモリ: ${(memoryInfo.numBytes / 1024 / 1024).toFixed(2)} MB`);
}
