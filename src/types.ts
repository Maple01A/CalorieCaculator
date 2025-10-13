export interface MealRecord {
  id: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  goalCalories: number;
  meals: MealRecord[];
}