import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const FOODS_TABLE = process.env.FOODS_TABLE || 'CalorieCalculator-Foods';
const MEALS_TABLE = process.env.MEALS_TABLE || 'CalorieCalculator-Meals';
const USERS_TABLE = process.env.USERS_TABLE || 'CalorieCalculator-Users';

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

// 食品検索
export const searchFoods = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters?.query || '';
    
    if (!query) {
      return response(400, { error: '検索クエリが必要です' });
    }

    const result = await docClient.send(new ScanCommand({
      TableName: FOODS_TABLE,
      FilterExpression: 'contains(#name, :query)',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: { ':query': query },
    }));

    return response(200, { foods: result.Items || [] });
  } catch (error) {
    console.error('Error searching foods:', error);
    return response(500, { error: '食品検索中にエラーが発生しました' });
  }
};

// 食品詳細取得
export const getFoodById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const foodId = event.pathParameters?.id;
    
    if (!foodId) {
      return response(400, { error: '食品IDが必要です' });
    }

    const result = await docClient.send(new GetCommand({
      TableName: FOODS_TABLE,
      Key: { id: foodId },
    }));

    if (!result.Item) {
      return response(404, { error: '食品が見つかりません' });
    }

    return response(200, result.Item);
  } catch (error) {
    console.error('Error getting food:', error);
    return response(500, { error: '食品取得中にエラーが発生しました' });
  }
};

// 食品追加
export const addFood = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { id, name, caloriesPer100g, protein, carbs, fat, category } = body;

    if (!id || !name || caloriesPer100g === undefined) {
      return response(400, { error: '必須フィールドが不足しています' });
    }

    const food = {
      id,
      name,
      caloriesPer100g,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      category: category || 'その他',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: FOODS_TABLE,
      Item: food,
    }));

    return response(201, { id, message: '食品を追加しました', food });
  } catch (error) {
    console.error('Error adding food:', error);
    return response(500, { error: '食品追加中にエラーが発生しました' });
  }
};

// 食事記録追加
export const addMealRecord = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, foodId, foodName, amount, calories, protein, carbs, fat, mealType, timestamp } = body;

    if (!userId || !foodId || !amount || !mealType) {
      return response(400, { error: '必須フィールドが不足しています' });
    }

    const mealId = `${userId}-${Date.now()}`;
    const mealRecord = {
      id: mealId,
      userId,
      foodId,
      foodName: foodName || '',
      amount,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealType,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: MEALS_TABLE,
      Item: mealRecord,
    }));

    return response(201, { id: mealId, message: '食事記録を追加しました' });
  } catch (error) {
    console.error('Error adding meal:', error);
    return response(500, { error: '食事記録追加中にエラーが発生しました' });
  }
};

// 日別サマリー取得
export const getDailySummary = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    const date = event.pathParameters?.date;

    if (!userId || !date) {
      return response(400, { error: 'ユーザーIDと日付が必要です' });
    }

    // その日の開始と終了のタイムスタンプ
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const result = await docClient.send(new QueryCommand({
      TableName: MEALS_TABLE,
      IndexName: 'UserIdTimestampIndex',
      KeyConditionExpression: 'userId = :userId AND #timestamp BETWEEN :start AND :end',
      ExpressionAttributeNames: { '#timestamp': 'timestamp' },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':start': startOfDay,
        ':end': endOfDay,
      },
    }));

    const meals = result.Items || [];
    
    // 栄養情報の合計を計算
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // 食事記録に栄養情報が含まれている場合はそれを使用し、
    // ない場合は食品マスタから取得
    const mealsWithFoodInfo = [];

    for (const meal of meals) {
      // すでに栄養情報が保存されている場合
      if (meal.calories !== undefined && meal.foodName) {
        totalCalories += meal.calories || 0;
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;
        
        mealsWithFoodInfo.push({
          ...meal,
        });
      } else {
        // 古いデータの場合は食品マスタから取得
        const foodResult = await docClient.send(new GetCommand({
          TableName: FOODS_TABLE,
          Key: { id: meal.foodId },
        }));

        if (foodResult.Item) {
          const food = foodResult.Item;
          const multiplier = meal.amount / 100;
          const mealCalories = Math.round(food.caloriesPer100g * multiplier);
          const mealProtein = Math.round((food.protein || 0) * multiplier * 10) / 10;
          const mealCarbs = Math.round((food.carbs || 0) * multiplier * 10) / 10;
          const mealFat = Math.round((food.fat || 0) * multiplier * 10) / 10;
          
          totalCalories += mealCalories;
          totalProtein += mealProtein;
          totalCarbs += mealCarbs;
          totalFat += mealFat;
          
          mealsWithFoodInfo.push({
            ...meal,
            foodName: food.name,
            calories: mealCalories,
            protein: mealProtein,
            carbs: mealCarbs,
            fat: mealFat,
          });
        }
      }
    }

    return response(200, {
      date,
      meals: mealsWithFoodInfo,
      summary: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        mealCount: mealsWithFoodInfo.length,
      },
    });
  } catch (error) {
    console.error('Error getting daily summary:', error);
    return response(500, { error: '日別サマリー取得中にエラーが発生しました' });
  }
};

// ユーザー設定取得
export const getUserSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return response(400, { error: 'ユーザーIDが必要です' });
    }

    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: userId },
    }));

    if (!result.Item) {
      // デフォルト設定を返す
      return response(200, {
        id: userId,
        dailyCalorieGoal: 2000,
        createdAt: new Date().toISOString(),
      });
    }

    return response(200, result.Item);
  } catch (error) {
    console.error('Error getting user settings:', error);
    return response(500, { error: 'ユーザー設定取得中にエラーが発生しました' });
  }
};

// ユーザー設定更新
export const updateUserSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body || '{}');

    if (!userId) {
      return response(400, { error: 'ユーザーIDが必要です' });
    }

    const settings = {
      id: userId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: settings,
    }));

    return response(200, { message: 'ユーザー設定を更新しました', settings });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return response(500, { error: 'ユーザー設定更新中にエラーが発生しました' });
  }
};

// OPTIONSリクエスト処理
export const options = async (): Promise<APIGatewayProxyResult> => {
  return response(200, {});
};
