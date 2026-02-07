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

/**
 * データセット内の画像情報
 */
export interface DatasetImage {
  /** 一意のID */
  id: string;
  /** ファイル名 */
  filename: string;
  /** カテゴリ */
  category: 'carbonara' | 'not-carbonara';
  /** 画像パス（publicからの相対パス） */
  path: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
}

/**
 * データセット全体のメタデータ
 */
export interface DatasetMetadata {
  /** メタデータ生成日時 */
  generatedAt: string;
  /** 合計画像数 */
  totalCount: number;
  /** カテゴリ別件数 */
  categories: {
    carbonara: number;
    'not-carbonara': number;
  };
  /** 画像一覧 */
  images: DatasetImage[];
}

/**
 * フィルターのカテゴリ
 */
export type FilterCategory = 'all' | 'carbonara' | 'not-carbonara';
