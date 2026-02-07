import { useState } from 'react';
import { useDataset } from '../hooks/useDataset';
import { DatasetStats } from '../components/DatasetStats';
import { ImageCard } from '../components/ImageCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FilterCategory } from '../types';
import './DatasetPage.css';

export function DatasetPage() {
  const { metadata, isLoading, error } = useDataset();
  const [filter, setFilter] = useState<FilterCategory>('all');

  // ローディング中
  if (isLoading) {
    return (
      <div className="dataset-page">
        <LoadingSpinner message="データセットを読み込んでいます..." />
      </div>
    );
  }

  // エラー
  if (error || !metadata) {
    return (
      <div className="dataset-page">
        <div className="error-card">
          <h2>⚠️ エラーが発生しました</h2>
          <p>{error || 'データセットの読み込みに失敗しました'}</p>
          <p className="error-hint">
            データセットが正しく生成されているか確認してください。
            <br />
            <code>npm run generate-dataset</code> を実行してみてください。
          </p>
        </div>
      </div>
    );
  }

  // フィルター適用
  const filteredImages = filter === 'all'
    ? metadata.images
    : metadata.images.filter(img => img.category === filter);

  return (
    <div className="dataset-page">
      {/* ページヘッダー */}
      <div className="dataset-header">
        <h1>📊 学習データセット</h1>
        <p>このアプリの学習に使用した画像データです</p>
      </div>

      {/* 統計情報 */}
      <DatasetStats metadata={metadata} />

      {/* フィルタータブ */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全て ({metadata.totalCount})
        </button>
        <button
          className={`filter-tab ${filter === 'carbonara' ? 'active' : ''}`}
          onClick={() => setFilter('carbonara')}
        >
          🍝 カルボナーラ ({metadata.categories.carbonara})
        </button>
        <button
          className={`filter-tab ${filter === 'not-carbonara' ? 'active' : ''}`}
          onClick={() => setFilter('not-carbonara')}
        >
          ❌ その他 ({metadata.categories['not-carbonara']})
        </button>
      </div>

      {/* 画像ギャラリー */}
      <div className="image-gallery">
        {filteredImages.length > 0 ? (
          filteredImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))
        ) : (
          <div className="empty-state">
            <p>該当する画像がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
