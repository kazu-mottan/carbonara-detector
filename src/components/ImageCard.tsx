import { DatasetImage } from '../types';
import './ImageCard.css';

interface ImageCardProps {
  image: DatasetImage;
}

export function ImageCard({ image }: ImageCardProps) {
  const categoryLabel = image.category === 'carbonara' ? '🍝 カルボナーラ' : '❌ その他';
  const createdDate = new Date(image.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  return (
    <div className="image-card">
      <div className="image-card-preview">
        <img src={image.path} alt={categoryLabel} loading="lazy" />
      </div>

      <div className="image-card-info">
        <div className={`category-badge ${image.category}`}>
          {categoryLabel}
        </div>
        <div className="image-date">
          📅 {createdDate}
        </div>
      </div>
    </div>
  );
}
