import { Food, MealRecord, UserSettings } from '../types';

/**
 * 食品の栄養素を指定した量で計算する
 */
export function calculateNutritionForAmount(
  food: Food,
  amountInGrams: number
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const ratio = amountInGrams / 100;
  
  return {
    calories: Math.round(food.caloriesPer100g * ratio * 10) / 10,
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  };
}

/**
 * 基礎代謝量（BMR）を計算する（ハリス・ベネディクト方程式）
 */
export function calculateBMR(settings: UserSettings): number {
  const { weight, height, age, gender } = settings;
  
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * 総消費カロリーを計算する（普通活動レベルで固定）
 */
export function calculateTDEE(settings: UserSettings): number {
  const bmr = calculateBMR(settings);
  // 普通活動レベル（moderate）の係数を使用
  const activityMultiplier = 1.55;
  
  return Math.round(bmr * activityMultiplier);
}

/**
 * 推奨カロリー摂取量を計算する
 */
export function calculateRecommendedCalories(settings: UserSettings): number {
  const tdee = calculateTDEE(settings);
  
  // 体重維持: TDEE
  // 体重減少: TDEE - 500kcal（週0.5kg減）
  // 体重増加: TDEE + 500kcal（週0.5kg増）
  
  // 現在は体重維持をデフォルトとする
  return Math.round(tdee);
}

/**
 * 食事記録の合計栄養素を計算する
 */
export function calculateTotalNutrition(meals: MealRecord[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      carbs: total.carbs + meal.carbs,
      fat: total.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * カロリー目標に対する進捗率を計算する
 */
export function calculateCalorieProgress(
  currentCalories: number,
  goalCalories: number
): {
  percentage: number;
  remaining: number;
  status: 'under' | 'on_target' | 'over';
} {
  const percentage = Math.round((currentCalories / goalCalories) * 100);
  const remaining = Math.max(0, goalCalories - currentCalories);
  
  let status: 'under' | 'on_target' | 'over';
  if (percentage < 90) {
    status = 'under';
  } else if (percentage <= 110) {
    status = 'on_target';
  } else {
    status = 'over';
  }
  
  return {
    percentage: Math.min(percentage, 200), // 最大200%まで表示
    remaining,
    status,
  };
}

/**
 * マクロ栄養素のバランスを計算する
 */
export function calculateMacroBalance(nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): {
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
} {
  // 1gあたりのカロリー
  const proteinCalories = nutrition.protein * 4;
  const carbsCalories = nutrition.carbs * 4;
  const fatCalories = nutrition.fat * 9;
  
  const totalCalories = proteinCalories + carbsCalories + fatCalories;
  
  if (totalCalories === 0) {
    return {
      proteinPercentage: 0,
      carbsPercentage: 0,
      fatPercentage: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    };
  }
  
  return {
    proteinPercentage: Math.round((proteinCalories / totalCalories) * 100),
    carbsPercentage: Math.round((carbsCalories / totalCalories) * 100),
    fatPercentage: Math.round((fatCalories / totalCalories) * 100),
    proteinGrams: nutrition.protein,
    carbsGrams: nutrition.carbs,
    fatGrams: nutrition.fat,
  };
}


