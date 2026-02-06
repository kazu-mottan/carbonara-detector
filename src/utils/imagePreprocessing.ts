import * as tf from '@tensorflow/tfjs';

/**
 * Base64文字列からHTMLImageElementを作成
 */
export function loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = (error) => reject(new Error(`画像の読み込みに失敗しました: ${error}`));

    img.src = base64;
  });
}

/**
 * 画像を224x224にリサイズしてテンソルに変換
 * アスペクト比を維持しながらクロップ
 */
export function preprocessImage(image: HTMLImageElement, targetSize = 224): tf.Tensor3D {
  return tf.tidy(() => {
    // HTMLImageElementからテンソルに変換
    let tensor = tf.browser.fromPixels(image);

    // 正方形にクロップ（中央部分を切り出し）
    const shortSide = Math.min(image.width, image.height);
    const startX = Math.floor((image.width - shortSide) / 2);
    const startY = Math.floor((image.height - shortSide) / 2);

    tensor = tf.slice3d(
      tensor,
      [startY, startX, 0],
      [shortSide, shortSide, 3]
    );

    // リサイズ（bilinear interpolation）
    const resized = tf.image.resizeBilinear(tensor, [targetSize, targetSize]);

    // 正規化: 0-255 → 0-1
    const normalized = resized.div(255.0);

    return normalized as tf.Tensor3D;
  });
}

/**
 * 画像ファイルをBase64に変換
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('ファイル読み込みエラー'));
      }
    };

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));

    reader.readAsDataURL(file);
  });
}

/**
 * ファイルが画像かどうか検証
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // ファイルタイプチェック
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '画像ファイルを選択してください' };
  }

  // サイズチェック（10MB以下）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズは10MB以下にしてください' };
  }

  return { valid: true };
}

/**
 * Canvasから画像データをBase64として取得
 */
export function canvasToBase64(canvas: HTMLCanvasElement, format = 'image/jpeg', quality = 0.9): string {
  return canvas.toDataURL(format, quality);
}
