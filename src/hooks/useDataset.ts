import { useState, useEffect } from 'react';
import { DatasetMetadata } from '../types';

interface UseDatasetReturn {
  metadata: DatasetMetadata | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * データセットのメタデータを取得するフック
 */
export function useDataset(): UseDatasetReturn {
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('📥 データセットメタデータを読み込み中...');
        const response = await fetch('/dataset-metadata.json');

        if (!response.ok) {
          throw new Error('データセットの読み込みに失敗しました');
        }

        const data: DatasetMetadata = await response.json();
        console.log(`✅ データセット読み込み完了: ${data.totalCount}枚`);

        setMetadata(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'データセットの読み込みに失敗しました';
        console.error('❌ データセット読み込みエラー:', err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  return { metadata, isLoading, error };
}
