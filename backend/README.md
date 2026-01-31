# Calorie Calculator - AWS Serverless Backend

AWS無料枠を活用したサーバーレスバックエンド

## AWS無料枠の内容

### 永続無料
- **AWS Lambda**: 100万リクエスト/月
- **DynamoDB**: 25GB ストレージ、200万読み取り、100万書き込み/月
- **API Gateway**: 100万API呼び出し/月（最初の12ヶ月後は有料）

### 12ヶ月間無料
- **Amazon S3**: 5GB ストレージ
- **CloudWatch Logs**: 5GB ログ保存
- **Cognito**: 50,000 MAU（月間アクティブユーザー）

## セットアップ手順

### 1. AWS CLIのインストール

```bash
# Windowsの場合
winget install Amazon.AWSCLI

# インストール確認
aws --version
```

### 2. AWS認証情報の設定

```bash
aws configure
```

入力項目:
- AWS Access Key ID: [AWSコンソールから取得]
- AWS Secret Access Key: [AWSコンソールから取得]
- Default region name: ap-northeast-1 (東京リージョン)
- Default output format: json

### 3. 依存パッケージのインストール

```bash
cd backend
npm install
```

### 4. ローカルテスト

```bash
npm run local
```

`http://localhost:3000` でAPIをテストできます

### 5. AWSへのデプロイ

```bash
# 開発環境へデプロイ
npm run deploy:dev

# 本番環境へデプロイ
npm run deploy:prod
```

デプロイ後、以下のような出力が表示されます:

```
Service Information
service: calorie-calculator-api
stage: dev
region: ap-northeast-1
stack: calorie-calculator-api-dev
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/foods/search
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/foods/{id}
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/meals
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/meals/{userId}/daily/{date}
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/users/{userId}/settings
  PUT - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/users/{userId}/settings
```

### 6. エンドポイントをフロントエンドに設定

`.env` ファイルに追加:

```bash
EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev
```

## APIエンドポイント

### 食品検索
```
GET /foods/search?query=りんご
```

### 食品詳細取得
```
GET /foods/{foodId}
```

### 食事記録追加
```
POST /meals
Body: {
  "userId": "user123",
  "foodId": "food456",
  "amount": 150,
  "mealType": "breakfast",
  "timestamp": "2026-01-30T09:00:00Z"
}
```

### 日別サマリー取得
```
GET /meals/{userId}/daily/{date}
例: GET /meals/user123/daily/2026-01-30
```

### ユーザー設定取得
```
GET /users/{userId}/settings
```

### ユーザー設定更新
```
PUT /users/{userId}/settings
Body: {
  "dailyCalorieGoal": 2000,
  "weight": 65,
  "height": 170
}
```

## DynamoDBへの初期データ投入

```bash
# データ投入スクリプトの実行
node scripts/seed-foods.js
```

## ログの確認

```bash
# 特定の関数のログを確認
npm run logs searchFoods -- --tail

# すべてのログを確認
serverless logs -f searchFoods --stage dev
```

## コスト管理

### 無料枠の監視

1. AWS Billing Consoleで使用量を確認
2. CloudWatch Alarmsで予算アラートを設定
3. Cost Explorerで日々のコストを追跡

### 推奨設定

- DynamoDBは **PAY_PER_REQUEST** モード（無料枠に含まれる）
- Lambdaメモリサイズ: 256MB（実行時間とのバランスが良い）
- API Gatewayのキャッシュ: オフ（コスト削減）

## トラブルシューティング

### デプロイエラー

```bash
# スタックを削除して再デプロイ
npm run remove
npm run deploy:dev
```

### Lambda関数のテスト

```bash
# ローカルで関数を直接実行
serverless invoke local -f searchFoods --data '{"queryStringParameters":{"query":"apple"}}'
```

### DynamoDBのデータ確認

AWS Management Console → DynamoDB → Tables から確認

## セキュリティ

本番環境では以下を追加実装してください:

1. **AWS Cognito**で認証を追加
2. **API Gateway**でAPI Keyを設定
3. **Lambda Authorizer**でトークン検証
4. **VPC**内にLambdaを配置（必要に応じて）

## 削除方法

```bash
# すべてのリソースを削除
npm run remove
```

注意: DynamoDBのテーブルも削除されるため、必要なデータはバックアップしてください。
