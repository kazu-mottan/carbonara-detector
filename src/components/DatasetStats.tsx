import { DatasetMetadata } from '../types';
import './DatasetStats.css';

interface DatasetStatsProps {
  metadata: DatasetMetadata;
}

export function DatasetStats({ metadata }: DatasetStatsProps) {
  const createdDate = new Date(metadata.generatedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dataset-stats">
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-value">{metadata.totalCount}</div>
        <div className="stat-label">合計画像数</div>
      </div>

      <div className="stat-card carbonara">
        <div className="stat-icon">🍝</div>
        <div className="stat-value">{metadata.categories.carbonara}</div>
        <div className="stat-label">カルボナーラ</div>
      </div>

      <div className="stat-card not-carbonara">
        <div className="stat-icon">❌</div>
        <div className="stat-value">{metadata.categories['not-carbonara']}</div>
        <div className="stat-label">その他</div>
      </div>

      <div className="stat-card date">
        <div className="stat-icon">📅</div>
        <div className="stat-value">{createdDate}</div>
        <div className="stat-label">作成日</div>
      </div>
    </div>
  );
}
