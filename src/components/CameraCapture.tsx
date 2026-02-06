import { useRef, useState, useEffect } from 'react';
import { canvasToBase64 } from '../utils/imagePreprocessing';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    setError(null);

    try {
      // カメラアクセス
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      console.error('カメラアクセスエラー:', err);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('カメラのアクセス許可が必要です');
        } else if (err.name === 'NotFoundError') {
          setError('カメラが見つかりません');
        } else {
          setError('カメラにアクセスできません');
        }
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Canvasサイズを動画に合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 動画フレームをCanvasに描画
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Base64に変換
      const imageData = canvasToBase64(canvas, 'image/jpeg', 0.9);
      onCapture(imageData);

      // カメラを停止
      stopCamera();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    if (isActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  useEffect(() => {
    // コンポーネントのクリーンアップ
    return () => {
      stopCamera();
    };
  }, []);

  if (!isActive) {
    return (
      <div className="camera-capture">
        <button
          className="camera-button start"
          onClick={startCamera}
          disabled={disabled}
        >
          📷 カメラで撮影
        </button>
        {error && <div className="camera-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="camera-capture active">
      <div className="camera-preview">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-controls">
        <button
          className="camera-button secondary"
          onClick={toggleFacingMode}
        >
          🔄 カメラ切替
        </button>
        <button
          className="camera-button capture"
          onClick={captureImage}
        >
          📸 撮影
        </button>
        <button
          className="camera-button cancel"
          onClick={stopCamera}
        >
          ✕ キャンセル
        </button>
      </div>
    </div>
  );
}
