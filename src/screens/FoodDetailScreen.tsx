import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { FoodCard } from '../components/FoodCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food, MealRecord } from '../types';
import { calculateNutritionForAmount } from '../utils/calorieCalculator';

interface FoodDetailScreenProps {
  navigation: any;
  route: {
    params: {
      food: Food;
    };
  };
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ navigation, route }) => {
  const { food } = route.params;
  const [amount, setAmount] = useState('100');
  const [mealType, setMealType] = useState<MealRecord['mealType']>('breakfast');
  const [calculatedNutrition, setCalculatedNutrition] = useState(
    calculateNutritionForAmount(food, 100)
  );

  const handleAmountChange = (text: string) => {
    setAmount(text);
    const numericAmount = parseFloat(text);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      const nutrition = calculateNutritionForAmount(food, numericAmount);
      setCalculatedNutrition(nutrition);
    }
  };

  const handleAddMeal = async () => {
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('エラー', '正しい量を入力してください');
      return;
    }

    try {
      const mealRecord: Omit<MealRecord, 'id'> = {
        foodId: food.id,
        foodName: food.name,
        amount: numericAmount,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        timestamp: new Date(),
        mealType,
      };

      await databaseService.addMealRecord(mealRecord);
      
      Alert.alert(
        '成功',
        '食事記録を追加しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('食事記録の追加に失敗しました:', error);
      Alert.alert('エラー', '食事記録の追加に失敗しました');
    }
  };

  const getMealTypeLabel = (type: MealRecord['mealType']) => {
    const labels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食',
    };
    return labels[type];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>食品詳細</Text>
        </View>

        {/* 食品情報カード */}
        <FoodCard
          food={food}
          showNutrition={true}
          style={styles.foodCard}
        />

        {/* 量の入力 */}
        <Card style={styles.inputCard}>
          <Text style={styles.sectionTitle}>摂取量を入力</Text>
          
          <Input
            label="量（グラム）"
            placeholder="100"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            style={styles.amountInput}
          />

          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealTypeLabel}>食事の種類</Text>
            <View style={styles.mealTypeButtons}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                <Button
                  key={type}
                  title={getMealTypeLabel(type)}
                  onPress={() => setMealType(type)}
                  variant={mealType === type ? 'primary' : 'outline'}
                  size="sm"
                  style={styles.mealTypeButton}
                />
              ))}
            </View>
          </View>
        </Card>

        {/* 計算結果 */}
        <Card style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>栄養成分（{amount}gあたり）</Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculatedNutrition.calories}
              </Text>
              <Text style={styles.nutritionLabel}>カロリー</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculatedNutrition.protein}g
              </Text>
              <Text style={styles.nutritionLabel}>タンパク質</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculatedNutrition.carbs}g
              </Text>
              <Text style={styles.nutritionLabel}>炭水化物</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculatedNutrition.fat}g
              </Text>
              <Text style={styles.nutritionLabel}>脂質</Text>
            </View>
          </View>
        </Card>

        {/* 追加ボタン */}
        <View style={styles.addButtonContainer}>
          <Button
            title="食事記録に追加"
            onPress={handleAddMeal}
            variant="primary"
            size="lg"
            style={styles.addButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h1,
    color: Colors.text,
  },
  
  foodCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  inputCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  
  amountInput: {
    marginBottom: Spacing.lg,
  },
  
  mealTypeContainer: {
    marginTop: Spacing.base,
  },
  
  mealTypeLabel: {
    ...TextStyles.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
  },
  
  nutritionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
  },
  
  nutritionValue: {
    ...TextStyles.h3,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  
  nutritionLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  addButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  addButton: {
    marginTop: Spacing.base,
  },
});
