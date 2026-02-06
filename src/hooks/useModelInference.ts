import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadImageFromBase64, preprocessImage } from '../utils/imagePreprocessing';
import { PredictionResult } from '../types';

interface UseModelInferenceProps {
  model: tf.LayersModel | null;
}

interface UseModelInferenceReturn {
  predict: (imageData: string) => Promise<PredictionResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * モデル推論を行うカスタムフック
 */
export function useModelInference({ model }: UseModelInferenceProps): UseModelInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(
    async (imageData: string): Promise<PredictionResult> => {
      if (!model) {
        throw new Error('モデルが読み込まれていません');
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 推論を開始...');

        // Base64画像をHTMLImageElementに変換
        const image = await loadImageFromBase64(imageData);
        console.log(`  画像サイズ: ${image.width}x${image.height}`);

        // 画像の前処理
        const preprocessed = preprocessImage(image, 224);
        console.log('  前処理完了');

        // バッチ次元を追加 [224, 224, 3] → [1, 224, 224, 3]
        const batchedTensor = preprocessed.expandDims(0);

        // 推論実行
        const startTime = performance.now();
        const prediction = model.predict(batchedTensor) as tf.Tensor;
        const endTime = performance.now();

        console.log(`  推論時間: ${(endTime - startTime).toFixed(2)}ms`);

        // 結果を取得
        const probabilities = await prediction.data();

        // メモリクリーンアップ
        preprocessed.dispose();
        batchedTensor.dispose();
        prediction.dispose();

        // 結果を解析
        // クラス0: not-carbonara, クラス1: carbonara
        const notCarbonaraProbability = probabilities[0];
        const carbonaraProbability = probabilities[1];

        const isCarbonara = carbonaraProbability > notCarbonaraProbability;
        const confidence = Math.max(carbonaraProbability, notCarbonaraProbability);

        console.log(`  結果: ${isCarbonara ? 'カルボナーラ' : 'カルボナーラではない'}`);
        console.log(`  確信度: ${(confidence * 100).toFixed(2)}%`);
        console.log(`  詳細: カルボナーラ=${(carbonaraProbability * 100).toFixed(2)}%, その他=${(notCarbonaraProbability * 100).toFixed(2)}%`);

        const result: PredictionResult = {
          isCarbonara,
          confidence,
          probabilities: {
            carbonara: carbonaraProbability,
            notCarbonara: notCarbonaraProbability,
          },
        };

        setIsLoading(false);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '推論中にエラーが発生しました';
        console.error('❌ 推論エラー:', err);
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    [model]
  );

  return { predict, isLoading, error };
}
