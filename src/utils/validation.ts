import { UserSettings } from '../types';

// バリデーションエラーの型定義
export interface ValidationError {
  field: string;
  message: string;
}

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 数値の範囲チェック
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (isNaN(value) || value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName}は${min}から${max}の間で入力してください`,
    };
  }
  return null;
}

/**
 * 必須フィールドのチェック
 */
export function validateRequired(
  value: any,
  fieldName: string
): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName}は必須です`,
    };
  }
  return null;
}

/**
 * 文字列の長さチェック
 */
export function validateLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationError | null {
  if (value.length < minLength || value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName}は${minLength}文字以上${maxLength}文字以下で入力してください`,
    };
  }
  return null;
}

/**
 * ユーザー設定のバリデーション
 */
export function validateUserSettings(settings: Partial<UserSettings>): ValidationResult {
  const errors: ValidationError[] = [];

  // 体重のバリデーション
  if (settings.weight !== undefined) {
    const weightError = validateRange(settings.weight, 20, 300, '体重');
    if (weightError) errors.push(weightError);
  }

  // 身長のバリデーション
  if (settings.height !== undefined) {
    const heightError = validateRange(settings.height, 100, 250, '身長');
    if (heightError) errors.push(heightError);
  }

  // 年齢のバリデーション
  if (settings.age !== undefined) {
    const ageError = validateRange(settings.age, 10, 120, '年齢');
    if (ageError) errors.push(ageError);
  }

  // カロリー目標のバリデーション
  if (settings.dailyCalorieGoal !== undefined) {
    const calorieError = validateRange(settings.dailyCalorieGoal, 800, 5000, 'カロリー目標');
    if (calorieError) errors.push(calorieError);
  }

  // 活動レベルのバリデーション
  if (settings.activityLevel !== undefined) {
    const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    if (!validActivityLevels.includes(settings.activityLevel)) {
      errors.push({
        field: 'activityLevel',
        message: '有効な活動レベルを選択してください',
      });
    }
  }

  // 性別のバリデーション
  if (settings.gender !== undefined) {
    const validGenders = ['male', 'female'];
    if (!validGenders.includes(settings.gender)) {
      errors.push({
        field: 'gender',
        message: '有効な性別を選択してください',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 食品名のバリデーション
 */
export function validateFoodName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 必須チェック
  const requiredError = validateRequired(name, '食品名');
  if (requiredError) errors.push(requiredError);

  // 長さチェック
  if (name && name.length > 0) {
    const lengthError = validateLength(name, 1, 100, '食品名');
    if (lengthError) errors.push(lengthError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 摂取量のバリデーション
 */
export function validateAmount(amount: number): ValidationResult {
  const errors: ValidationError[] = [];

  // 数値チェック
  if (isNaN(amount)) {
    errors.push({
      field: 'amount',
      message: '有効な数値を入力してください',
    });
  } else {
    // 範囲チェック
    const rangeError = validateRange(amount, 0.1, 10000, '摂取量');
    if (rangeError) errors.push(rangeError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 検索クエリのバリデーション
 */
export function validateSearchQuery(query: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 必須チェック
  const requiredError = validateRequired(query, '検索キーワード');
  if (requiredError) errors.push(requiredError);

  // 長さチェック
  if (query && query.length > 0) {
    const lengthError = validateLength(query, 1, 50, '検索キーワード');
    if (lengthError) errors.push(lengthError);
  }

  // 特殊文字チェック（基本的なサニタイズ）
  if (query && /[<>{}[\]\\|`~!@#$%^&*()+=\/]/.test(query)) {
    errors.push({
      field: 'query',
      message: '検索キーワードに使用できない文字が含まれています',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * エラーメッセージを表示用にフォーマット
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => error.message).join('\n');
}

/**
 * 特定のフィールドのエラーメッセージを取得
 */
export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
}
