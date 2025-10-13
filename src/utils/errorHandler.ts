import { AppError } from '../types';

/**
 * アプリケーションエラーの型定義
 */
export enum ErrorCode {
  // データベースエラー
  DATABASE_INIT_FAILED = 'DATABASE_INIT_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  
  // バリデーションエラー
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // ネットワークエラー
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  
  // ファイルエラー
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  
  // 一般的なエラー
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

/**
 * エラーメッセージのマッピング
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.DATABASE_INIT_FAILED]: 'データベースの初期化に失敗しました',
  [ErrorCode.DATABASE_QUERY_FAILED]: 'データベースの操作に失敗しました',
  [ErrorCode.DATABASE_CONNECTION_FAILED]: 'データベースに接続できませんでした',
  
  [ErrorCode.VALIDATION_FAILED]: '入力内容に問題があります',
  [ErrorCode.INVALID_INPUT]: '無効な入力です',
  
  [ErrorCode.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [ErrorCode.API_ERROR]: 'APIエラーが発生しました',
  
  [ErrorCode.FILE_NOT_FOUND]: 'ファイルが見つかりません',
  [ErrorCode.FILE_READ_ERROR]: 'ファイルの読み込みに失敗しました',
  [ErrorCode.FILE_WRITE_ERROR]: 'ファイルの書き込みに失敗しました',
  
  [ErrorCode.UNKNOWN_ERROR]: '不明なエラーが発生しました',
  [ErrorCode.PERMISSION_DENIED]: '権限が不足しています',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'リソースが見つかりません',
};

/**
 * エラーを作成する
 */
export function createError(
  code: ErrorCode,
  message?: string,
  details?: any
): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code],
    details,
  };
}

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}

/**
 * エラーをログに記録する
 */
export function logError(error: Error | AppError, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextInfo = context ? ` [${context}]` : '';
  
  if ('code' in error) {
    console.error(`[${timestamp}]${contextInfo} AppError:`, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  } else {
    console.error(`[${timestamp}]${contextInfo} Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
}

/**
 * エラーをユーザーフレンドリーなメッセージに変換する
 */
export function getUserFriendlyMessage(error: Error | AppError): string {
  if ('code' in error) {
    return error.message;
  }
  
  // 一般的なエラーメッセージをユーザーフレンドリーに変換
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
  }
  
  if (message.includes('timeout')) {
    return '処理がタイムアウトしました。しばらく待ってから再試行してください。';
  }
  
  if (message.includes('permission')) {
    return '必要な権限がありません。設定を確認してください。';
  }
  
  if (message.includes('not found')) {
    return '要求されたリソースが見つかりませんでした。';
  }
  
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'アクセスが拒否されました。';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return '入力内容に問題があります。入力値を確認してください。';
  }
  
  // デフォルトメッセージ
  return '予期しないエラーが発生しました。しばらく待ってから再試行してください。';
}

/**
 * エラーの重要度を判定する
 */
export function getErrorSeverity(error: Error | AppError): 'low' | 'medium' | 'high' | 'critical' {
  if ('code' in error) {
    switch (error.code) {
      case ErrorCode.DATABASE_INIT_FAILED:
      case ErrorCode.DATABASE_CONNECTION_FAILED:
        return 'critical';
      
      case ErrorCode.DATABASE_QUERY_FAILED:
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.API_ERROR:
        return 'high';
      
      case ErrorCode.VALIDATION_FAILED:
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.FILE_READ_ERROR:
      case ErrorCode.FILE_WRITE_ERROR:
        return 'medium';
      
      case ErrorCode.RESOURCE_NOT_FOUND:
      case ErrorCode.PERMISSION_DENIED:
        return 'low';
      
      default:
        return 'medium';
    }
  }
  
  // 一般的なエラーの重要度判定
  const message = error.message.toLowerCase();
  
  if (message.includes('critical') || message.includes('fatal')) {
    return 'critical';
  }
  
  if (message.includes('error') || message.includes('failed')) {
    return 'high';
  }
  
  if (message.includes('warning') || message.includes('invalid')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * エラーが再試行可能かどうかを判定する
 */
export function isRetryableError(error: Error | AppError): boolean {
  if ('code' in error) {
    const retryableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.API_ERROR,
      ErrorCode.DATABASE_QUERY_FAILED,
      ErrorCode.FILE_READ_ERROR,
      ErrorCode.FILE_WRITE_ERROR,
    ];
    return retryableCodes.includes(error.code);
  }
  
  // 一般的なエラーの再試行可能性判定
  const message = error.message.toLowerCase();
  
  if (message.includes('timeout') || 
      message.includes('network') || 
      message.includes('connection') ||
      message.includes('temporary')) {
    return true;
  }
  
  return false;
}

/**
 * エラーの詳細情報を取得する
 */
export function getErrorDetails(error: Error | AppError): {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  timestamp: string;
} {
  return {
    code: 'code' in error ? error.code : 'UNKNOWN_ERROR',
    message: getUserFriendlyMessage(error),
    severity: getErrorSeverity(error),
    retryable: isRetryableError(error),
    timestamp: new Date().toISOString(),
  };
}
