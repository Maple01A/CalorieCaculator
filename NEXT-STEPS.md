# 🚀 AWS移行 - 次のステップガイド

## ✅ 完了した作業

1. ✅ MySQL関連ファイルの削除
2. ✅ AWS Lambda + DynamoDB用のバックエンド作成
3. ✅ 認証機能の実装（JWT + bcrypt）
4. ✅ serverless.ymlの設定
5. ✅ DynamoDBテーブル設計（EmailIndexを含む）
6. ✅ ログイン・ゲスト機能の実装
7. ✅ ホーム画面にログイン状態表示
8. ✅ 未使用コンポーネントの削除
9. ✅ .gitignore設定の修正

## 📋 次のステップ

### ステップ1: 依存関係のインストール

```bash
cd backend
npm install
```

### ステップ2: 環境変数の設定（セキュリティ重要！）

```bash
# .envファイルを作成
cp .env.example .env

# JWT_SECRETをランダムな文字列に変更（必須！）
# 以下のコマンドで生成できます
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`.env`ファイルを編集：
```env
JWT_SECRET=<上記で生成したランダム文字列>
JWT_EXPIRES_IN=7d
AWS_REGION=ap-northeast-1
```

### ステップ3: AWS認証情報の設定

```bash
# AWS CLIがインストールされていない場合
winget install Amazon.AWSCLI

# AWS認証情報を設定
aws configure
# AWS Access Key ID: [AWSコンソールから取得]
# AWS Secret Access Key: [AWSコンソールから取得]
# Default region name: ap-northeast-1
# Default output format: json
```

### ステップ4: デプロイ（開発環境）

```bash
# 開発環境にデプロイ
npm run deploy:dev
```

デプロイ後、以下のような出力が表示されます：

```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/auth/signup
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/auth/signin
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/auth/me
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/auth/change-password
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/foods/search
  ...
```

endpoints:                                                                                                                      
  POST - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/auth/signup
  POST - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/auth/signin
  GET - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/auth/me
  POST - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/auth/change-password
  GET - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/foods/search
  GET - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/foods/{id}
  POST - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/meals
  GET - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/meals/{userId}/daily/{date}
  GET - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/users/{userId}/settings
  PUT - https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev/users/{userId}/settings


functions:
  signUp: calorie-calculator-api-dev-signUp (3.6 MB)                                                                            
  signIn: calorie-calculator-api-dev-signIn (3.6 MB)
  getCurrentUser: calorie-calculator-api-dev-getCurrentUser (3.6 MB)
  changePassword: calorie-calculator-api-dev-changePassword (3.6 MB)
  searchFoods: calorie-calculator-api-dev-searchFoods (3.6 MB)
  getFoodById: calorie-calculator-api-dev-getFoodById (3.6 MB)
  addMealRecord: calorie-calculator-api-dev-addMealRecord (3.6 MB)
  getDailySummary: calorie-calculator-api-dev-getDailySummary (3.6 MB)
  getUserSettings: calorie-calculator-api-dev-getUserSettings (3.6 MB)
  updateUserSettings: calorie-calculator-api-dev-updateUserSettings (3.6 MB)

Serverless Framework V4 is now available.                                                                                       
- Learn more in our README: https://github.com/serverless/serverless
- Run "npm i serverless -g" to update

**このAPI URLをメモしてください！**

### ステップ5: 初期データの投入

```bash
# 環境変数を設定
$env:FOODS_TABLE="calorie-calculator-api-dev-Foods"
$env:AWS_REGION="ap-northeast-1"

# データ投入
npx ts-node scripts/seed-foods.ts
```

### ステップ6: フロントエンドの環境変数設定

プロジェクトルートに`.env`ファイルを作成：

```bash
cd ..
echo "EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev" > .env
```

または手動で作成：

```env
# .env (プロジェクトルート)
EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev
```

### ステップ7: フロントエンドのAPIクライアント更新

✅ **完了しました！**

更新内容：
- ✅ `.env`ファイルに実際のAPI URLを設定
- ✅ `apiClient.ts`を環境変数から読み込むように更新
- ✅ API エンドポイントをバックエンドの実装に合わせて修正
- ✅ `/api`プレフィックスを削除（AWS Lambdaでは不要）

**API URL**: `https://lhin3a5hmb.execute-api.ap-northeast-1.amazonaws.com/dev`

利用可能なAPIエンドポイント：
- 認証: `signUp()`, `signIn()`, `getCurrentUser()`, `changePassword()`
- 食品: `searchFoods(query)`, `getFoodById(id)`
- 食事: `addMeal(meal)`, `getDailySummary(userId, date)`
- 設定: `getSettings(userId)`, `updateSettings(userId, settings)`

### ステップ8: 動作確認

✅ **ログインとゲスト機能を実装しました！**

実装内容：
- ✅ ゲストモードでアプリを試用可能
- ✅ ログイン/新規登録機能
- ✅ ゲストからアカウント作成への変換機能
- ✅ 設定画面にアカウント情報表示

```bash
# フロントエンドを起動
npm start

# または
npx expo start
```

アプリで以下をテスト：
1. **ゲストモード** - アカウント作成せずにアプリを使用
2. **新規登録（SignUp）** - メールアドレスでアカウント作成
3. **ログイン（SignIn）** - 既存アカウントでログイン
4. **ゲスト→アカウント変換** - 設定画面からアカウント作成
5. **食品検索** - 食品データベースを検索
6. **カロリー記録** - 食事を記録

## 🔐 認証機能の仕様

### 実装済み機能

✅ **ユーザー登録** (`POST /auth/signup`)
- メールアドレス + パスワード
- パスワードはbcryptでハッシュ化
- JWT トークン発行

✅ **ログイン** (`POST /auth/signin`)
- メールアドレス + パスワード
- JWT トークン発行
- 最終ログイン日時記録

✅ **現在のユーザー情報取得** (`GET /auth/me`)
- JWT トークンで認証
- ユーザープロフィール取得

✅ **パスワード変更** (`POST /auth/change-password`)
- 現在のパスワード確認
- 新しいパスワードに更新

### セキュリティ機能

- ✅ パスワードのハッシュ化（bcrypt）
- ✅ JWT トークン認証（7日間有効）
- ✅ メールアドレスの重複チェック
- ✅ パスワード強度チェック（6文字以上）
- ✅ トークンの有効期限チェック
- ✅ CORSヘッダー設定

## 📊 DynamoDB テーブル構造

### Users テーブル
- **Primary Key**: `id` (String, UUID)
- **Global Secondary Index**: `EmailIndex` (email)
- **属性**:
  - id (UUID)
  - email (String, ユニーク)
  - displayName (String)
  - passwordHash (String)
  - dailyCalorieGoal (Number)
  - createdAt (ISO8601 String)
  - updatedAt (ISO8601 String)
  - lastLoginAt (ISO8601 String)

### Foods テーブル
- **Primary Key**: `id` (String)
- **属性**:
  - id (String)
  - name (String)
  - caloriesPer100g (Number)
  - protein (Number)
  - carbs (Number)
  - fat (Number)
  - category (String)

### Meals テーブル
- **Primary Key**: `id` (String)
- **Global Secondary Index**: `UserIdTimestampIndex` (userId + timestamp)
- **属性**:
  - id (String)
  - userId (String)
  - foodId (String)
  - amount (Number)
  - mealType (String)
  - timestamp (ISO8601 String)
  - createdAt (ISO8601 String)

## 🧪 APIテスト

### cURLでテスト

```bash
# 新規登録
curl -X POST https://your-api-url/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"テストユーザー"}'

# レスポンス例
{
  "message": "ユーザー登録が完了しました",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "テストユーザー",
    "dailyCalorieGoal": 2000,
    "createdAt": "2026-01-31T..."
  }
}

# ログイン
curl -X POST https://your-api-url/dev/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# ユーザー情報取得（要認証）
curl -X GET https://your-api-url/dev/auth/me \
  -H "Authorization: Bearer <token>"

# 食品検索
curl -X GET "https://your-api-url/dev/foods/search?query=りんご"
```

## 💰 コスト試算（無料枠）

### 永続無料
- **Lambda**: 100万リクエスト/月 → ✅ 完全無料
- **DynamoDB**: 25GB + 200万読み取り + 100万書き込み/月 → ✅ 完全無料

### 12ヶ月間無料
- **API Gateway**: 100万API呼び出し/月

**月間アクティブユーザー1,000人程度まで完全無料で運用可能**

## 🔧 トラブルシューティング

### デプロイエラー

```bash
# スタック削除
npm run remove

# 再デプロイ
npm run deploy:dev
```

### Lambda関数のログ確認

```bash
# 特定の関数のログ
npx serverless logs -f signIn --stage dev --tail

# すべてのログ
npx serverless logs -f signIn --stage dev
```

### DynamoDBのデータ確認

```bash
# AWS CLIでテーブルスキャン
aws dynamodb scan --table-name calorie-calculator-api-dev-Users --max-items 10

# 特定のユーザー取得
aws dynamodb get-item --table-name calorie-calculator-api-dev-Users --key '{"id":{"S":"user-uuid-here"}}'
```

### ローカルテスト（serverless-offline）

```bash
# ローカルでAPI起動
npm run local

# http://localhost:3000 でテスト可能
```

## 📈 本番環境へのデプロイ

```bash
# JWT_SECRETを本番用に変更（必須！）
# .envファイルを編集

# 本番環境デプロイ
npm run deploy:prod

# 本番用データ投入
$env:FOODS_TABLE="calorie-calculator-api-prod-Foods"
npx ts-node scripts/seed-foods.ts
```

## 🎯 次のステップ（オプション）

### より高度なセキュリティ

1. **AWS Cognito統合** - より堅牢な認証
2. **API Gateway オーソライザー** - Lambda層での認証
3. **レート制限** - DDoS対策
4. **メール検証** - Amazon SESでメール確認

### 機能追加

1. **パスワードリセット** - メールでリセットリンク送信
2. **プロフィール編集** - ユーザー情報更新API
3. **OAuth ログイン** - Google/Apple ログイン
4. **データバックアップ** - S3への定期バックアップ

## ✅ チェックリスト

- [ ] `npm install` 完了
- [ ] `.env`ファイル作成（JWT_SECRET設定）
- [ ] AWS認証情報設定完了
- [ ] `npm run deploy:dev` 成功
- [ ] API URLをメモ
- [ ] 初期データ投入完了
- [ ] フロントエンドの`.env`設定完了
- [ ] 新規登録テスト成功
- [ ] ログインテスト成功
- [ ] 食品検索テスト成功

すべて完了したら、本番環境へデプロイ準備完了です！🎉
