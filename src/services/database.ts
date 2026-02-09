import * as SQLite from 'expo-sqlite';
import { Food, MealRecord, DailySummary, UserSettings } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // データベースの初期化
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('calorie_calculator.db');
      await this.createTables();
      await this.seedInitialData();
    } catch (error) {
      console.error('データベースの初期化に失敗しました:', error);
      throw new Error('データベースの初期化に失敗しました');
    }
  }

  // テーブルの作成
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    // 食品テーブル
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        calories_per_100g REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT
      );
    `);

    // 食事記録テーブル
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_records (
        id TEXT PRIMARY KEY,
        food_id TEXT NOT NULL,
        food_name TEXT NOT NULL,
        amount REAL NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        timestamp TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        FOREIGN KEY (food_id) REFERENCES foods (id)
      );
    `);

    // ユーザー設定テーブル
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
        weight REAL,
        height REAL,
        age INTEGER,
        activity_level TEXT DEFAULT 'moderate',
        gender TEXT DEFAULT 'male',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  // 初期データの投入
  private async seedInitialData(): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    // 既存データの確認
    const existingFoods = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM foods');
    if (existingFoods && (existingFoods as any).count > 0) {
      return; // 既にデータが存在する場合はスキップ
    }

    // サンプル食品データ
    const sampleFoods: Omit<Food, 'id'>[] = [
      {
        name: '白米',
        caloriesPer100g: 168,
        protein: 2.6,
        carbs: 37.1,
        fat: 0.3,
        category: '主食',
      },
      {
        name: '鶏胸肉',
        caloriesPer100g: 165,
        protein: 31.0,
        carbs: 0,
        fat: 3.6,
        category: '肉類',
      },
      {
        name: '卵',
        caloriesPer100g: 151,
        protein: 12.3,
        carbs: 0.3,
        fat: 10.3,
        category: '卵・乳製品',
      },
      {
        name: 'ブロッコリー',
        caloriesPer100g: 33,
        protein: 4.3,
        carbs: 5.2,
        fat: 0.6,
        category: '野菜',
      },
      {
        name: 'バナナ',
        caloriesPer100g: 86,
        protein: 1.1,
        carbs: 22.5,
        fat: 0.2,
        category: '果物',
      },
      {
        name: 'サラダ油',
        caloriesPer100g: 921,
        protein: 0,
        carbs: 0,
        fat: 100,
        category: '調味料',
      },
    ];

    // 食品データの挿入
    for (const food of sampleFoods) {
      const id = `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.db.runAsync(
        `INSERT INTO foods (id, name, calories_per_100g, protein, carbs, fat, category, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, food.name, food.caloriesPer100g, food.protein, food.carbs, food.fat, food.category, food.imageUrl || null]
      );
    }

    // デフォルトユーザー設定の挿入
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO user_settings (daily_calorie_goal, weight, height, age, activity_level, gender, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2000, 70, 170, 30, 'moderate', 'male', now, now]
    );
  }

  // 食品の検索
  async searchFoods(query: string): Promise<Food[]> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const foods = await this.db.getAllAsync(
      `SELECT * FROM foods 
       WHERE name LIKE ? 
       ORDER BY name ASC`,
      [`%${query}%`]
    );

    return foods.map((food: any) => ({
      id: food.id,
      name: food.name,
      caloriesPer100g: food.calories_per_100g,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: food.category,
      imageUrl: food.image_url,
    }));
  }

  // 食品の取得（ID指定）
  async getFoodById(id: string): Promise<Food | null> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const food = await this.db.getFirstAsync(
      'SELECT * FROM foods WHERE id = ?',
      [id]
    );

    if (!food) return null;

    return {
      id: (food as any).id,
      name: (food as any).name,
      caloriesPer100g: (food as any).calories_per_100g,
      protein: (food as any).protein,
      carbs: (food as any).carbs,
      fat: (food as any).fat,
      category: (food as any).category,
      imageUrl: (food as any).image_url,
    };
  }

  // 食事記録の追加
  async addMealRecord(mealRecord: Omit<MealRecord, 'id'>): Promise<string> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const id = `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.runAsync(
      `INSERT INTO meal_records 
       (id, food_id, food_name, amount, calories, protein, carbs, fat, timestamp, meal_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        mealRecord.foodId,
        mealRecord.foodName,
        mealRecord.amount,
        mealRecord.calories,
        mealRecord.protein,
        mealRecord.carbs,
        mealRecord.fat,
        mealRecord.timestamp.toISOString(),
        mealRecord.mealType,
      ]
    );

    return id;
  }

  // 日別食事記録の取得
  async getMealRecordsByDate(date: string): Promise<MealRecord[]> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const records = await this.db.getAllAsync(
      `SELECT * FROM meal_records 
       WHERE DATE(timestamp) = ? 
       ORDER BY timestamp ASC`,
      [date]
    );

    return records.map((record: any) => ({
      id: record.id,
      foodId: record.food_id,
      foodName: record.food_name,
      amount: record.amount,
      calories: record.calories,
      protein: record.protein,
      carbs: record.carbs,
      fat: record.fat,
      timestamp: new Date(record.timestamp),
      mealType: record.meal_type,
    }));
  }

  // 日別サマリーの取得
  async getDailySummary(date: string): Promise<DailySummary> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const meals = await this.getMealRecordsByDate(date);
    const settings = await this.getUserSettings();

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    return {
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      meals,
      goalCalories: settings.dailyCalorieGoal,
    };
  }

  // ユーザー設定の取得
  async getUserSettings(): Promise<UserSettings> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const settings = await this.db.getFirstAsync(
      'SELECT * FROM user_settings ORDER BY updated_at DESC LIMIT 1'
    );

    if (!settings) {
      throw new Error('ユーザー設定が見つかりません');
    }

    return {
      dailyCalorieGoal: (settings as any).daily_calorie_goal,
      weight: (settings as any).weight,
      height: (settings as any).height,
      age: (settings as any).age,
      activityLevel: (settings as any).activity_level,
      gender: (settings as any).gender,
    };
  }

  // ユーザー設定の更新
  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const now = new Date().toISOString();
    const updateFields = [];
    const values = [];

    if (settings.dailyCalorieGoal !== undefined) {
      updateFields.push('daily_calorie_goal = ?');
      values.push(settings.dailyCalorieGoal);
    }
    if (settings.weight !== undefined) {
      updateFields.push('weight = ?');
      values.push(settings.weight);
    }
    if (settings.height !== undefined) {
      updateFields.push('height = ?');
      values.push(settings.height);
    }
    if (settings.age !== undefined) {
      updateFields.push('age = ?');
      values.push(settings.age);
    }
    if (settings.activityLevel !== undefined) {
      updateFields.push('activity_level = ?');
      values.push(settings.activityLevel);
    }
    if (settings.gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(settings.gender);
    }

    if (updateFields.length === 0) return;

    updateFields.push('updated_at = ?');
    values.push(now);

    await this.db.runAsync(
      `UPDATE user_settings SET ${updateFields.join(', ')} WHERE id = (
        SELECT id FROM user_settings ORDER BY updated_at DESC LIMIT 1
      )`,
      values
    );
  }

  // 食事記録の削除
  async deleteMealRecord(id: string): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    await this.db.runAsync('DELETE FROM meal_records WHERE id = ?', [id]);
  }

  // 食品の追加（カスタム食品）
  async addCustomFood(food: Omit<Food, 'id'>): Promise<string> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.runAsync(
      `INSERT INTO foods (id, name, calories_per_100g, protein, carbs, fat, category, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        food.name,
        food.caloriesPer100g,
        food.protein,
        food.carbs,
        food.fat,
        food.category,
        food.imageUrl || null
      ]
    );

    return id;
  }

  // 食事記録の削除
  async deleteMealRecord(id: string): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const result = await this.db.runAsync(
        'DELETE FROM meal_records WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error('食事記録の削除エラー:', error);
      throw new Error('食事記録の削除に失敗しました');
    }
  }

  // 特定の食品を使用している食事記録をすべて削除
  async deleteMealRecordsByFoodId(foodId: string): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      
      // まず該当する記録を確認
      const records = await this.db.getAllAsync(
        'SELECT * FROM meal_records WHERE food_id = ?',
        [foodId]
      );
      
      if (records.length > 0) {
        await this.db.runAsync(
          'DELETE FROM meal_records WHERE food_id = ?',
          [foodId]
        );
      }
    } catch (error) {
      console.error('食事記録の削除エラー:', error);
      throw new Error('関連する食事記録の削除に失敗しました');
    }
  }

  // 食品の削除
  async deleteFood(foodId: string): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    // カスタム食品のみ削除可能
    if (!foodId.startsWith('custom_')) {
      throw new Error('デフォルト食品は削除できません');
    }

    try {
      
      // 食品が存在するか確認
      const food = await this.db.getFirstAsync(
        'SELECT * FROM foods WHERE id = ?',
        [foodId]
      );
      
      if (!food) {
        throw new Error('食品が見つかりません');
      }
      
      const result = await this.db.runAsync(
        'DELETE FROM foods WHERE id = ?',
        [foodId]
      );

    } catch (error) {
      console.error('食品の削除エラー:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('食品の削除に失敗しました');
    }
  }

  // カテゴリ一覧の取得
  async getFoodCategories(): Promise<string[]> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    const categories = await this.db.getAllAsync(
      'SELECT DISTINCT category FROM foods ORDER BY category ASC'
    );

    return categories.map((cat: any) => cat.category);
  }

  // 全ての食事記録をクリア
  async clearAllMealRecords(): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      await this.db.runAsync('DELETE FROM meal_records');
    } catch (error) {
      console.error('食事記録のクリアエラー:', error);
      throw new Error('食事記録のクリアに失敗しました');
    }
  }

  // ユーザー設定をデフォルトにリセット
  async resetUserSettings(): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const now = new Date().toISOString();
      await this.db.runAsync('DELETE FROM user_settings');
      await this.db.runAsync(
        `INSERT INTO user_settings (daily_calorie_goal, weight, height, age, activity_level, gender, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [2000, 70, 170, 30, 'moderate', 'male', now, now]
      );
    } catch (error) {
      console.error('ユーザー設定のリセットエラー:', error);
      throw new Error('ユーザー設定のリセットに失敗しました');
    }
  }

  // データベースのクローズ
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// シングルトンインスタンス
export const databaseService = new DatabaseService();
