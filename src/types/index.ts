/**
 * 推論結果の型定義
 */
export interface PredictionResult {
  /** カルボナーラかどうか */
  isCarbonara: boolean;
  /** 確信度（0.0 - 1.0） */
  confidence: number;
  /** 各クラスの確率 */
  probabilities: {
    carbonara: number;
    notCarbonara: number;
  };
}

/**
 * アプリケーションの状態
 */
export interface AppState {
  /** TensorFlow.jsモデル */
  model: any | null;
  /** モデル読み込み中 */
  isModelLoading: boolean;
  /** モデル読み込みエラー */
  modelError: string | null;
  /** 選択された画像（Base64） */
  selectedImage: string | null;
  /** 推論結果 */
  prediction: PredictionResult | null;
  /** 推論実行中 */
  isInferencing: boolean;
}

/**
 * エラーの型
 */
export type AppError = {
  message: string;
  type: 'model_load' | 'inference' | 'camera' | 'file_upload';
};
