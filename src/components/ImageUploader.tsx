import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { fileToBase64, validateImageFile } from '../utils/imagePreprocessing';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageSelect: (imageData: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // ファイル検証
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'ファイルが無効です');
      return;
    }

    try {
      // Base64に変換
      const base64 = await fileToBase64(file);
      onImageSelect(base64);
    } catch (err) {
      setError('ファイルの読み込みに失敗しました');
      console.error(err);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="image-uploader">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          クリックまたはドラッグ&ドロップで画像を選択
        </p>
        <p className="upload-subtext">JPEG, PNG (最大10MB)</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}
