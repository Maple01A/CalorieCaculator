import { apiClient } from './apiClient';
import { databaseService } from './database';
import { authService } from './auth';
import { MealRecord, UserSettings } from '../types';

class CloudSyncService {
  // ユーザーデータをクラウドに同期
  async syncToCloud(): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      // ローカルのデータを取得
      const settings = await databaseService.getUserSettings();
      const today = new Date().toISOString().split('T')[0];
      const dailySummary = await databaseService.getDailySummary(today);

      // 設定を同期
      await apiClient.updateSettings({
        targetCalories: settings.dailyCalorieGoal,
        height: settings.height,
        weight: settings.weight,
        age: settings.age,
        gender: settings.gender,
        activityLevel: settings.activityLevel,
      });

      // 食事記録を同期（過去30日分）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const mealsToSync = dailySummary.meals
        .filter(meal => new Date(meal.timestamp) >= thirtyDaysAgo)
        .map(meal => ({
          foodId: meal.foodId,
          foodName: meal.foodName,
          amount: meal.amount,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          mealType: meal.mealType,
          timestamp: meal.timestamp.toISOString(),
        }));

      if (mealsToSync.length > 0) {
        await apiClient.createMealsBatch(mealsToSync);
      }

      console.log('クラウド同期完了');
    } catch (error) {
      console.error('クラウド同期エラー:', error);
      throw new Error('データの同期に失敗しました');
    }
  }

  // クラウドからデータを復元
  async syncFromCloud(): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      // ローカルデータをクリアしてからクラウドデータを復元
      console.log('🔄 ローカルデータをクリア中...');
      await databaseService.clearAllMealRecords();
      await databaseService.resetUserSettings();
      
      // 設定を復元
      const settings = await apiClient.getSettings();
      if (settings) {
        await databaseService.updateUserSettings({
          dailyCalorieGoal: settings.target_calories,
          height: settings.height,
          weight: settings.weight,
          age: settings.age,
          gender: settings.gender,
          activityLevel: settings.activity_level,
        });
      }

      // 食事記録を復元（過去30日分）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();

      const meals = await apiClient.getMealsByDateRange(thirtyDaysAgo, today);

      for (const mealData of meals) {
        const meal: Omit<MealRecord, 'id'> = {
          foodId: mealData.food_id,
          foodName: mealData.food_name,
          amount: mealData.amount,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          timestamp: new Date(mealData.timestamp),
          mealType: mealData.meal_type,
        };

        // ローカルに存在しない場合のみ追加
        try {
          await databaseService.addMealRecord(meal);
        } catch (error) {
          // 既に存在する場合はスキップ
          console.log('既に存在する記録:', meal.foodName);
        }
      }

      console.log('クラウドから復元完了');
    } catch (error) {
      console.error('クラウドから復元エラー:', error);
      // エラーが発生してもローカルはクリアされているので、デフォルト状態で続行
      console.log('⚠️ クラウドからの復元に失敗しましたが、ローカルデータは初期化されました');
    }
  }

  // 自動同期（バックグラウンド）
  async autoSync(): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) {
      return; // ログインしていない場合は何もしない
    }

    try {
      await this.syncToCloud();
    } catch (error) {
      console.error('自動同期エラー:', error);
      // エラーは無視（次回再試行）
    }
  }

  // サーバー接続確認
  async checkConnection(): Promise<boolean> {
    try {
      return await apiClient.healthCheck();
    } catch (error) {
      return false;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
