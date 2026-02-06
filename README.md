# 🍝 Carbonara Detector - カルボナーラ判別アプリ

TensorFlow.jsとReactを使用した、画像からカルボナーラを判別するWebアプリケーションです。約50枚の料理写真を使った転移学習により、カルボナーラかどうかを高精度で判定します。

## ✨ 特徴

- 🧠 **転移学習**: MobileNetV2ベースのディープラーニングモデル
- 📱 **スマホ対応**: レスポンシブデザインとカメラ撮影機能
- ⚡ **高速**: TensorFlow.js WASMバックエンドによる高速推論
- 🔒 **プライバシー**: 完全にブラウザ上で動作（サーバー送信なし）
- 💻 **オフライン動作**: モデル読み込み後はインターネット不要

## 🎯 デモ

1. 画像をアップロードまたはカメラで撮影
2. AIが自動で判別
3. 確信度と詳細な結果を表示

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- npm または yarn

### インストール

```bash
# リポジトリをクローン（または既にダウンロード済み）
cd Carbonara

# 依存関係をインストール
npm install

# 訓練用依存関係をインストール
cd training
npm install
cd ..
```

## 📊 モデル訓練

アプリを使用する前に、まずモデルを訓練する必要があります。

### 1. データ準備

約50枚の料理写真を準備して、以下のディレクトリに配置してください：

```
training/data/
├── carbonara/          # カルボナーラ画像（25-30枚推奨）
│   ├── carbonara_001.jpg
│   ├── carbonara_002.jpg
│   └── ...
└── not-carbonara/      # その他の料理画像（20-25枚推奨）
    ├── other_001.jpg
    ├── other_002.jpg
    └── ...
```

**画像要件:**
- 形式: JPEG, PNG
- 推奨サイズ: 500x500 ~ 1500x1500 ピクセル
- 最小サイズ: 224x224 ピクセル以上
- ファイルサイズ: 10MB以下

詳細は [training/README.md](training/README.md) を参照してください。

### 2. モデル訓練の実行

```bash
cd training
npm run train
```

訓練が完了すると、`public/models/` ディレクトリにモデルファイルが保存されます：
- `model.json`
- `group1-shard1of1.bin`

### 3. 訓練結果の確認

- 目標精度: 80%以上
- 訓練時間: 約10-20分（データ量とPCスペックに依存）

## 💻 開発サーバーの起動

```bash
# プロジェクトルートで実行
npm run dev
```

ブラウザで http://localhost:5173 にアクセス

## 📦 ビルド

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

## 🎮 使用方法

### 画像アップロード

1. 「クリックまたはドラッグ&ドロップで画像を選択」エリアをクリック
2. 画像ファイルを選択（またはドラッグ&ドロップ）
3. AIが自動で判別を実行
4. 結果が表示されます

### カメラ撮影（スマホ推奨）

1. 「📷 カメラで撮影」ボタンをタップ
2. カメラアクセスを許可
3. 料理を撮影
4. 「📸 撮影」ボタンで撮影
5. 結果が表示されます

## 🏗️ プロジェクト構造

```
Carbonara/
├── public/
│   └── models/                 # 訓練済みモデル
├── src/
│   ├── components/             # UIコンポーネント
│   │   ├── ImageUploader.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── ResultDisplay.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   └── useModelInference.ts  # 推論ロジック
│   ├── utils/
│   │   ├── modelLoader.ts        # モデル読み込み
│   │   └── imagePreprocessing.ts # 画像前処理
│   ├── types/
│   │   └── index.ts              # 型定義
│   ├── App.tsx                   # メインアプリ
│   └── main.tsx                  # エントリーポイント
├── training/
│   ├── train.js                  # モデル訓練スクリプト
│   ├── data/                     # 訓練データ
│   └── README.md                 # 訓練ガイド
├── package.json
└── README.md
```

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **機械学習**: TensorFlow.js + MobileNetV2
- **スタイリング**: CSS Modules
- **ビルドツール**: Vite

## 🐛 トラブルシューティング

### モデルが読み込めない

**症状**: 「モデルの読み込みに失敗しました」エラー

**解決策**:
- `public/models/` に `model.json` と `*.bin` ファイルがあるか確認
- モデル訓練が正常に完了しているか確認
- ブラウザのコンソールでエラー詳細を確認

### カメラが起動しない

**症状**: カメラアクセスエラー

**解決策**:
- HTTPSで配信されているか確認（ローカルは `localhost` でOK）
- ブラウザのカメラ権限設定を確認
- iOS Safari の場合: 設定 → Safari → カメラ

### 推論が遅い

**症状**: 5秒以上かかる

**解決策**:
- ブラウザコンソールで `tf.getBackend()` を実行してWASMが有効か確認
- 画像サイズを小さくしてみる
- 別のブラウザで試す（Chrome推奨）

### 精度が低い

**症状**: 誤判定が多い

**解決策**:
- より多くの高品質な画像を追加して再訓練
- データの多様性を確保（様々な角度、照明、盛り付け）
- 類似料理（他のパスタ料理）を `not-carbonara/` に追加

## 📱 対応ブラウザ

- Chrome 90+（推奨）
- Safari 14+
- Firefox 88+
- Edge 90+

モバイル:
- iOS Safari 14+
- Android Chrome 90+

## 🔧 開発

### コードのフォーマット

```bash
npm run lint
```

### 型チェック

```bash
npx tsc --noEmit
```

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- TensorFlow.js チーム
- MobileNetV2 モデル提供元
- React コミュニティ

## 🤝 貢献

プルリクエストを歓迎します！バグ報告や機能提案は Issue でお願いします。

## 📧 お問い合わせ

質問や提案がある場合は、Issue を作成してください。

---

**Made with ❤️ using TensorFlow.js & React**
