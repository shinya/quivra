# Quivra - 早押しクイズアプリ（フロントエンド）

同じルームに接続したユーザーがリアルタイムで早押しクイズを楽しめるアプリのフロントエンドです。
バックエンドは [quivra-backend](../quivra-backend) （Go + Gin + MySQL + WebSocket）とペアで動作します。

回答は口頭で行う設計です（オフライン同席や Zoom 等の通話を併用する前提）。
出題者がルームを作って URL を共有し、回答者が早押しボタンで回答権を取り、出題者が正誤をジャッジします。

仕様の詳細は [SPEC.md](./SPEC.md)、ロードマップは [PLAN.md](./PLAN.md) を参照。

## 技術スタック

- **Vue 3** + TypeScript + Vite
- **Tailwind CSS**
- **Pinia**（状態管理）
- ネイティブ **WebSocket**（リアルタイム通信）

## 開発環境セットアップ

### 前提条件

- Node.js 18+
- バックエンド（quivra-backend）が起動していること

### 起動手順

```bash
# 1. バックエンドを起動（quivra-backend 側）
cd ../quivra-backend
docker compose up -d mysql   # MySQL はホスト側ポート 3307
DB_HOST=127.0.0.1 DB_PORT=3307 DB_USER=quivra DB_PASSWORD=password DB_NAME=quivra PORT=8090 go run .

# 2. フロントエンドを起動
npm install
npm run dev   # http://localhost:3000
```

API の接続先は `.env` で変更できます（デフォルトは `http://localhost:8090`）。

```bash
cp .env.example .env
```

### コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 型チェック + ビルド
npm run type-check # 型チェックのみ
npm test           # ユニットテスト（vitest）
npm run lint       # ESLint
```

## 画面構成

| パス | 画面 |
|---|---|
| `/login` `/signup` | ログイン / 新規登録 |
| `/` | ルーム一覧（待機中 / 参加できる / すべて） |
| `/rooms/new` | ルーム作成（出題リスト・問い読み方式・ポイント等の設定） |
| `/rooms/:id` | ルーム（待機 → 出題 → 結果発表。共有 URL はこれ） |

## ドキュメント

- [PLAN.md](./PLAN.md) — 方針・ゴール・ロードマップ
- [SPEC.md](./SPEC.md) — 確定仕様
- [TODO.md](./TODO.md) — 短期タスク
- [KNOWLEDGE.md](./KNOWLEDGE.md) — 学び・ハマりどころ
