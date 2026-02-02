import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

const FOODS_TABLE = process.env.FOODS_TABLE || 'calorie-calculator-api-dev-Foods';

// サンプル食品データ
const sampleFoods = [
  {
    id: 'food-001',
    name: 'ごはん（白米）',
    caloriesPer100g: 168,
    protein: 2.5,
    carbs: 37.1,
    fat: 0.3,
    category: '主食',
  },
  {
    id: 'food-002',
    name: '鶏むね肉（皮なし）',
    caloriesPer100g: 108,
    protein: 22.3,
    carbs: 0,
    fat: 1.5,
    category: 'タンパク質',
  },
  {
    id: 'food-003',
    name: 'りんご',
    caloriesPer100g: 54,
    protein: 0.2,
    carbs: 14.6,
    fat: 0.1,
    category: '果物',
  },
  {
    id: 'food-004',
    name: 'ブロッコリー',
    caloriesPer100g: 33,
    protein: 4.3,
    carbs: 5.2,
    fat: 0.5,
    category: '野菜',
  },
  {
    id: 'food-005',
    name: 'サーモン（刺身）',
    caloriesPer100g: 139,
    protein: 20.1,
    carbs: 0.1,
    fat: 6.2,
    category: 'タンパク質',
  },
  {
    id: 'food-006',
    name: '卵（全卵）',
    caloriesPer100g: 151,
    protein: 12.3,
    carbs: 0.3,
    fat: 10.3,
    category: 'タンパク質',
  },
  {
    id: 'food-007',
    name: 'バナナ',
    caloriesPer100g: 86,
    protein: 1.1,
    carbs: 22.5,
    fat: 0.2,
    category: '果物',
  },
  {
    id: 'food-008',
    name: 'アーモンド',
    caloriesPer100g: 598,
    protein: 18.6,
    carbs: 19.7,
    fat: 54.2,
    category: 'ナッツ',
  },
  {
    id: 'food-009',
    name: 'ヨーグルト（無糖）',
    caloriesPer100g: 62,
    protein: 3.6,
    carbs: 4.9,
    fat: 3.0,
    category: '乳製品',
  },
  {
    id: 'food-010',
    name: 'そば（茹で）',
    caloriesPer100g: 132,
    protein: 4.8,
    carbs: 26.0,
    fat: 1.0,
    category: '主食',
  },
  {
    id: 'food-011',
    name: 'さつまいも',
    caloriesPer100g: 134,
    protein: 1.2,
    carbs: 31.9,
    fat: 0.2,
    category: '野菜',
  },
  {
    id: 'food-012',
    name: '豆腐（木綿）',
    caloriesPer100g: 72,
    protein: 6.6,
    carbs: 1.6,
    fat: 4.2,
    category: 'タンパク質',
  },
  {
    id: 'food-013',
    name: 'ほうれん草',
    caloriesPer100g: 20,
    protein: 2.2,
    carbs: 3.1,
    fat: 0.4,
    category: '野菜',
  },
  {
    id: 'food-014',
    name: '牛乳',
    caloriesPer100g: 67,
    protein: 3.3,
    carbs: 4.8,
    fat: 3.8,
    category: '乳製品',
  },
  {
    id: 'food-015',
    name: 'オートミール',
    caloriesPer100g: 380,
    protein: 13.7,
    carbs: 69.1,
    fat: 5.7,
    category: '主食',
  },
];

async function seedFoods() {
  console.log('🌱 食品データをDynamoDBに投入開始...');
  console.log(`📊 テーブル: ${FOODS_TABLE}`);
  
  try {
    // DynamoDBのBatchWriteは25件まで
    const batchSize = 25;
    for (let i = 0; i < sampleFoods.length; i += batchSize) {
      const batch = sampleFoods.slice(i, i + batchSize);
      
      const putRequests = batch.map(food => ({
        PutRequest: {
          Item: {
            ...food,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      }));

      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [FOODS_TABLE]: putRequests,
        },
      }));

      console.log(`${batch.length}件のデータを投入しました`);
    }

    console.log('データ投入完了！');
    console.log(`合計: ${sampleFoods.length}件の食品データ`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
seedFoods();
