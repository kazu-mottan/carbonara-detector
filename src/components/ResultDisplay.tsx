import { PredictionResult } from '../types';
import './ResultDisplay.css';

interface ResultDisplayProps {
  prediction: PredictionResult | null;
  image: string | null;
}

export function ResultDisplay({ prediction, image }: ResultDisplayProps) {
  if (!prediction || !image) {
    return null;
  }

  const { isCarbonara, confidence, probabilities } = prediction;
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="result-display">
      <div className="result-image-container">
        <img src={image} alt="判別対象の画像" className="result-image" />
      </div>

      <div className="result-content">
        <div className={`result-badge ${isCarbonara ? 'carbonara' : 'not-carbonara'}`}>
          {isCarbonara ? '🍝 カルボナーラ' : '❌ カルボナーラではない'}
        </div>

        <div className="result-confidence">
          <h3>確信度: {confidencePercent}%</h3>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="result-details">
          <div className="detail-item">
            <span className="detail-label">カルボナーラ:</span>
            <span className="detail-value">
              {(probabilities.carbonara * 100).toFixed(1)}%
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">その他:</span>
            <span className="detail-value">
              {(probabilities.notCarbonara * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {confidence < 0.7 && (
          <div className="result-warning">
            ⚠️ 確信度が低いため、判定が不正確な可能性があります
          </div>
        )}
      </div>
    </div>
  );
}
