# AWS無料枠でのデプロイガイド

このドキュメントでは、Calorie CalculatorをAWS無料枠を使って完全無料でデプロイする方法を説明します。

## 💰 AWS無料枠の概要

### 永続無料（アカウント作成後ずっと無料）
- **AWS Lambda**: 100万リクエスト/月
- **DynamoDB**: 25GB + 200万読み取り + 100万書き込み/月
- **Amazon Cognito**: 50,000 MAU（月間アクティブユーザー）

### 12ヶ月間無料（初年度のみ）
- **API Gateway**: 100万API呼び出し/月
- **Amazon S3**: 5GB ストレージ
- **Amazon Amplify**: ビルド時間1,000分/月 + ホスティング15GB転送/月
- **CloudWatch Logs**: 5GB ログ保存

## 📋 前提条件

1. AWSアカウント（無料）
2. Node.js 18以上
3. AWS CLI
4. Serverless Framework

## 🚀 デプロイ手順

### ステップ1: AWSアカウントの作成

1. [AWS](https://aws.amazon.com/)にアクセス
2. 「無料アカウントを作成」をクリック
3. メールアドレス、パスワード、クレジットカード情報を入力
   - **注意**: 無料枠の範囲内であれば課金されません

### ステップ2: IAMユーザーの作成

1. AWSマネジメントコンソールにログイン
2. IAM → ユーザー → ユーザーを追加
3. ユーザー名: `calorie-calculator-deploy`
4. アクセスキー - プログラムによるアクセスを選択
5. ポリシーを直接アタッチ:
   - `AdministratorAccess`（開発用）
6. アクセスキーIDとシークレットアクセスキーを保存

### ステップ3: AWS CLIの設定

```bash
# AWS CLIのインストール（Windows）
winget install Amazon.AWSCLI

# 認証情報の設定
aws configure
# AWS Access Key ID: [先ほど保存したキーID]
# AWS Secret Access Key: [先ほど保存したシークレットキー]
# Default region name: ap-northeast-1
# Default output format: json
```

### ステップ4: バックエンドのデプロイ

```bash
# backendディレクトリに移動
cd backend

# AWS用の依存パッケージをインストール
npm install --save-dev serverless serverless-offline serverless-plugin-typescript
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# serverless.ymlをコピー（すでに作成済み）
# デプロイ実行
npx serverless deploy --stage prod

# API URLが表示されるのでメモする
# 例: https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

### ステップ5: 初期データの投入

```bash
# テーブル名を環境変数に設定
$env:FOODS_TABLE="calorie-calculator-api-prod-Foods"

# データ投入スクリプトを実行
npx ts-node scripts/seed-foods.ts
```

### ステップ6: フロントエンドの設定

```bash
# プロジェクトルートに戻る
cd ..

# 環境変数ファイルを作成
echo "EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod" > .env
```

### ステップ7: フロントエンドのデプロイ（Web版）

**Option A: Amplify Hosting（推奨）**

```bash
# Amplify CLIのインストール
npm install -g @aws-amplify/cli

# Amplifyの初期化
amplify init
# ? Enter a name for the project: caloriecalculator
# ? Enter a name for the environment: prod
# ? Choose your default editor: Visual Studio Code
# ? Choose the type of app: javascript
# ? What javascript framework: react
# ? Source Directory Path: ./
# ? Distribution Directory Path: web-build
# ? Build Command: npm run build:web
# ? Start Command: npm start

# ホスティング追加
amplify add hosting
# ? Select the plugin module to execute: Hosting with Amplify Console
# ? Choose a type: Manual deployment

# Web版ビルド
npm run build:web

# デプロイ
amplify publish
```

**Option B: Vercel（より簡単）**

```bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel --prod
```

### ステップ8: モバイルアプリのビルド（オプション）

```bash
# EAS CLIのインストール
npm install -g eas-cli

# Expo アカウントでログイン
eas login

# プロジェクトの設定
eas build:configure

# Androidビルド
eas build --platform android --profile production

# iOSビルド（Macが必要）
eas build --platform ios --profile production
```

## 🔍 デプロイの確認

### バックエンドのテスト

```bash
# API Health Check
curl https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/health

# 食品検索テスト
curl "https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/foods/search?query=りんご"
```

### フロントエンドのテスト

1. ブラウザでAmplify/VercelのURLにアクセス
2. アプリが正常に表示されることを確認
3. 食品検索、カロリー記録などの機能をテスト

## 📊 コスト監視

### 予算アラートの設定

1. AWS Billing Console → Budgets
2. 「予算を作成」をクリック
3. 予算額: $1（念のため）
4. アラートメールアドレスを設定

### 使用量の確認

```bash
# Lambda関数の呼び出し回数
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=calorie-calculator-api-prod-searchFoods \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum

# DynamoDBの読み取り/書き込み
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=calorie-calculator-api-prod-Foods \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum
```

## 🛡️ セキュリティ強化（本番環境推奨）

### Cognitoで認証を追加

```bash
# Cognitoユーザープールの作成
aws cognito-idp create-user-pool \
  --pool-name calorie-calculator-users \
  --auto-verified-attributes email \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}"

# ユーザープールクライアントの作成
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxxxxxxxx \
  --client-name calorie-calculator-app
```

### API Gatewayの保護

```yaml
# serverless.ymlに追加
functions:
  searchFoods:
    handler: src/lambda/handler.searchFoods
    events:
      - http:
          path: /foods/search
          method: get
          cors: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId: !Ref ApiGatewayAuthorizer
```

## 🔧 トラブルシューティング

### デプロイエラー

```bash
# スタック削除して再デプロイ
npx serverless remove --stage prod
npx serverless deploy --stage prod
```

### Lambda関数が動かない

```bash
# ログを確認
npx serverless logs -f searchFoods --stage prod --tail
```

### DynamoDBにデータが入らない

```bash
# AWS CLIでテーブル確認
aws dynamodb scan --table-name calorie-calculator-api-prod-Foods --max-items 10
```

## 🗑️ リソースの削除

不要になった場合、すべて削除できます:

```bash
# Serverlessスタックの削除
cd backend
npx serverless remove --stage prod

# Amplifyアプリの削除
amplify delete
```

## 📚 参考リンク

- [AWS無料利用枠](https://aws.amazon.com/jp/free/)
- [Serverless Framework ドキュメント](https://www.serverless.com/framework/docs)
- [DynamoDB ベストプラクティス](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS Lambda 料金](https://aws.amazon.com/jp/lambda/pricing/)

## ✅ チェックリスト

- [ ] AWSアカウント作成完了
- [ ] IAMユーザー作成完了
- [ ] AWS CLI設定完了
- [ ] バックエンドデプロイ完了
- [ ] 初期データ投入完了
- [ ] フロントエンド設定完了
- [ ] フロントエンドデプロイ完了
- [ ] API動作確認完了
- [ ] 予算アラート設定完了

すべて完了すれば、完全無料でWebサービスが公開されます！🎉
