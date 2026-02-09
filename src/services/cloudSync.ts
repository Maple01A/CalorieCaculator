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
    if (!user || user.isGuest) {
      console.log('⚠️ ゲストモードまたは未ログインのため同期をスキップ');
      return;
    }

    try {
      console.log('🔄 クラウドからデータを同期開始...');
      
      // ローカルデータをクリア
      console.log('📝 ローカルデータをクリア中...');
      await databaseService.clearAllMealRecords();
      await databaseService.resetUserSettings();
      
      // 設定を復元
      console.log('⚙️ 設定を復元中...');
      try {
        const settings = await apiClient.getSettings(user.id);
        if (settings) {
          await databaseService.updateUserSettings({
            dailyCalorieGoal: settings.dailyCalorieGoal || settings.target_calories || 2000,
            height: settings.height,
            weight: settings.weight,
            age: settings.age,
            gender: settings.gender,
            activityLevel: settings.activityLevel || settings.activity_level,
          });
          console.log('✅ 設定を復元しました');
        }
      } catch (error) {
        console.warn('設定の復元に失敗:', error);
      }
      
      // 食事記録を復元（過去30日分）
      console.log('🍽️ 食事記録を復元中...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();

      try {
        const meals = await apiClient.getMealsByDateRange(thirtyDaysAgo, today, user.id);
        
        console.log(`📊 ${meals.length}件の食事記録を復元中...`);
        
        for (const mealData of meals) {
          const meal: Omit<MealRecord, 'id'> = {
            foodId: mealData.foodId || mealData.food_id,
            foodName: mealData.foodName || mealData.food_name,
            amount: mealData.amount,
            calories: mealData.calories,
            protein: mealData.protein || 0,
            carbs: mealData.carbs || 0,
            fat: mealData.fat || 0,
            timestamp: new Date(mealData.timestamp),
            mealType: mealData.mealType || mealData.meal_type,
          };
          
          try {
            await databaseService.addMealRecord(meal);
          } catch (error) {
            console.warn('記録の追加に失敗:', meal.foodName, error);
          }
        }
        
        console.log('✅ 食事記録を復元しました');
      } catch (error) {
        console.warn('食事記録の復元に失敗:', error);
      }

      console.log('✅ クラウド同期完了');
    } catch (error) {
      console.error('❌ クラウド同期エラー:', error);
      throw new Error('データの同期に失敗しました');
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
