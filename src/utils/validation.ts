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
function validateRange(
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
function validateRequired(
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
function validateLength(
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
 * エラーメッセージを表示用にフォーマット
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => error.message).join('\n');
}
