// 食品情報の型定義
export interface Food {
  id: string;
  name: string;
  caloriesPer100g: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  imageUrl?: string;
}

// 食事記録の型定義
export interface MealRecord {
  id: string;
  foodId: string;
  foodName: string;
  amount: number; // グラム
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// 日別カロリーサマリーの型定義
export interface DailySummary {
  date: string; // YYYY-MM-DD形式
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealRecord[];
  goalCalories: number;
}

// ユーザー設定の型定義
export interface UserSettings {
  dailyCalorieGoal: number;
  weight: number;
  height: number;
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  gender: 'male' | 'female';
  isGuest?: boolean; // ゲストモードフラグ
}

// ナビゲーションの型定義
export type RootStackParamList = {
  Main: undefined;
  FoodSearch: undefined;
  FoodDetail: { food: Food };
  AddMeal: { mealType: MealRecord['mealType'] };
  Settings: undefined;
  History: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Add: undefined;
  History: undefined;
  Settings: undefined;
};

// エラーの型定義
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}
