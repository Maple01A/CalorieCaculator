import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE || 'CalorieCalculator-Users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// CORSヘッダー
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

// レスポンスヘルパー
const response = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// JWTトークン生成
const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// JWTトークン検証
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('無効なトークンです');
  }
};

// パスワードハッシュ化
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// パスワード検証
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// メールアドレスでユーザーを検索
const getUserByEmail = async (email: string) => {
  const result = await docClient.send(new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email },
  }));
  
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

// 新規登録
export const signUp = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password, displayName } = body;

    // バリデーション
    if (!email || !password) {
      return response(400, { error: 'メールアドレスとパスワードは必須です' });
    }

    if (password.length < 6) {
      return response(400, { error: 'パスワードは6文字以上で設定してください' });
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(400, { error: '有効なメールアドレスを入力してください' });
    }

    // 既存ユーザーチェック
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return response(409, { error: 'このメールアドレスは既に登録されています' });
    }

    // ユーザーID生成
    const userId = crypto.randomUUID();
    
    // パスワードハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const user = {
      id: userId,
      email,
      displayName: displayName || email.split('@')[0],
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dailyCalorieGoal: 2000, // デフォルト値
    };

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    }));

    // JWTトークン生成
    const token = generateToken(userId, email);

    // レスポンス（パスワードハッシュは除外）
    const { passwordHash: _, ...userWithoutPassword } = user;

    return response(201, {
      message: 'ユーザー登録が完了しました',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return response(500, { error: 'ユーザー登録中にエラーが発生しました' });
  }
};

// ログイン
export const signIn = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return response(400, { error: 'メールアドレスとパスワードを入力してください' });
    }

    // ユーザー検索
    const user = await getUserByEmail(email);
    if (!user) {
      return response(401, { error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワード検証
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return response(401, { error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // 最終ログイン日時更新
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        ...user,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));

    // JWTトークン生成
    const token = generateToken(user.id, email);

    // レスポンス（パスワードハッシュは除外）
    const { passwordHash: _, ...userWithoutPassword } = user;

    return response(200, {
      message: 'ログインしました',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return response(500, { error: 'ログイン中にエラーが発生しました' });
  }
};

// 現在のユーザー情報取得（認証必須）
export const getCurrentUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authorizationヘッダーからトークン取得
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response(401, { error: '認証トークンが必要です' });
    }

    const token = authHeader.substring(7);
    
    // トークン検証
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // ユーザー情報取得
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: userId },
    }));

    if (!result.Item) {
      return response(404, { error: 'ユーザーが見つかりません' });
    }

    // レスポンス（パスワードハッシュは除外）
    const { passwordHash: _, ...userWithoutPassword } = result.Item;

    return response(200, { user: userWithoutPassword });
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    if (error.message === '無効なトークンです' || error.name === 'JsonWebTokenError') {
      return response(401, { error: '認証トークンが無効です' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return response(401, { error: '認証トークンの有効期限が切れています' });
    }
    
    return response(500, { error: 'ユーザー情報取得中にエラーが発生しました' });
  }
};

// パスワード変更（認証必須）
export const changePassword = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 認証トークン検証
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response(401, { error: '認証トークンが必要です' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // リクエストボディ取得
    const body = JSON.parse(event.body || '{}');
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return response(400, { error: '現在のパスワードと新しいパスワードを入力してください' });
    }

    if (newPassword.length < 6) {
      return response(400, { error: '新しいパスワードは6文字以上で設定してください' });
    }

    // ユーザー情報取得
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: userId },
    }));

    if (!result.Item) {
      return response(404, { error: 'ユーザーが見つかりません' });
    }

    const user = result.Item;

    // 現在のパスワード検証
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return response(401, { error: '現在のパスワードが正しくありません' });
    }

    // 新しいパスワードをハッシュ化
    const newPasswordHash = await hashPassword(newPassword);

    // パスワード更新
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        ...user,
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString(),
      },
    }));

    return response(200, { message: 'パスワードを変更しました' });
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.message === '無効なトークンです' || error.name === 'JsonWebTokenError') {
      return response(401, { error: '認証トークンが無効です' });
    }
    
    return response(500, { error: 'パスワード変更中にエラーが発生しました' });
  }
};
