import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadModel } from './utils/modelLoader';
import { useModelInference } from './hooks/useModelInference';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { ResultDisplay } from './components/ResultDisplay';
import { PredictionResult } from './types';
import './App.css';

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const { predict, isLoading: isInferencing } = useModelInference({ model });

  // モデルの初期化
  useEffect(() => {
    const initModel = async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);
        const loadedModel = await loadModel();
        setModel(loadedModel);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'モデルの読み込みに失敗しました';
        setModelError(message);
        console.error(error);
      } finally {
        setIsModelLoading(false);
      }
    };

    initModel();
  }, []);

  const handleImageSelect = async (imageData: string) => {
    setSelectedImage(imageData);
    setPrediction(null);

    try {
      const result = await predict(imageData);
      setPrediction(result);
    } catch (error) {
      console.error('推論エラー:', error);
      alert('画像の判別中にエラーが発生しました');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPrediction(null);
  };

  // モデル読み込み中
  if (isModelLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🍝 Carbonara Detector</h1>
          <p>カルボナーラ判別アプリ</p>
        </header>

        <main className="app-main">
          <div className="content-card">
            <LoadingSpinner message="モデルを読み込んでいます..." />
          </div>
        </main>
      </div>
    );
  }

  // モデル読み込みエラー
  if (modelError) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🍝 Carbonara Detector</h1>
          <p>カルボナーラ判別アプリ</p>
        </header>

        <main className="app-main">
          <div className="content-card error">
            <h2>⚠️ エラーが発生しました</h2>
            <p className="error-message">{modelError}</p>
            <div className="error-help">
              <p>解決方法:</p>
              <ul>
                <li>モデル訓練が完了していますか？</li>
                <li>public/models/ ディレクトリにモデルファイルがありますか？</li>
                <li>開発サーバーが正しく起動していますか？</li>
              </ul>
              <button onClick={() => window.location.reload()} className="retry-button">
                再読み込み
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // メイン画面
  return (
    <div className="app">
      <header className="app-header">
        <h1>🍝 Carbonara Detector</h1>
        <p>カルボナーラ判別アプリ</p>
      </header>

      <main className="app-main">
        {prediction ? (
          // 判別結果表示
          <>
            <ResultDisplay prediction={prediction} image={selectedImage} />
            <button onClick={handleReset} className="reset-button">
              別の画像を判別
            </button>
          </>
        ) : (
          // 画像選択UI
          <div className="content-card">
            {isInferencing ? (
              <LoadingSpinner message="判別中..." />
            ) : (
              <>
                <div className="instructions">
                  <h2>料理の画像を選択してください</h2>
                  <p>カルボナーラかどうかを判別します</p>
                </div>

                <div className="input-section">
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    disabled={isInferencing}
                  />

                  <div className="divider">または</div>

                  <CameraCapture
                    onCapture={handleImageSelect}
                    disabled={isInferencing}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by TensorFlow.js & React</p>
      </footer>
    </div>
  );
}

export default App;
