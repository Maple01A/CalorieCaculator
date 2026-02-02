import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { FoodCard } from '../components/FoodCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food, MealRecord } from '../types';
import { calculateNutritionForAmount } from '../utils/calorieCalculator';
import { useResponsive } from '../hooks/useResponsive';

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
  const { isMobile, isDesktop } = useResponsive();

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

  const handleDeleteFood = async () => {
    // カスタム食品のみ削除可能
    if (!food.id.startsWith('custom_')) {
      Alert.alert('エラー', 'デフォルト食品は削除できません');
      return;
    }

    try {
      // 1. この食品を使用している食事記録を削除
      await databaseService.deleteMealRecordsByFoodId(food.id);
      
      // 2. 食品を削除
      await databaseService.deleteFood(food.id);

      // 削除後、食品検索画面に戻る
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'エラー',
        error.message || '食品の削除に失敗しました。'
      );
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
    <AnimatedBackground variant="neutral">
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <ResponsiveContainer>
            {/* ヘッダー */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, isDesktop && TextStyles.h1]}>食品詳細</Text>
              {food.id.startsWith('custom_') ? (
                <TouchableOpacity
                  onPress={handleDeleteFood}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
              ) : (
                <View style={styles.deleteButton} />
              )}
            </View>

            {/* 食品情報カード */}
            <FoodCard
              food={food}
              showNutrition={true}
              style={styles.foodCard}
            />

            {/* 入力フォーム */}
            <GlassCard style={styles.inputCard}>
              <Text style={styles.sectionTitle}>摂取量を入力</Text>
              
              <Input
                label="量（グラム）"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                style={styles.amountInput}
              />

              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealTypeLabel}>食事の種類</Text>
                <View style={styles.mealTypeButtons}>
                  <Button
                    title="朝食"
                    onPress={() => setMealType('breakfast')}
                    variant={mealType === 'breakfast' ? 'primary' : 'outline'}
                    style={styles.mealTypeButton}
                  />
                  <Button
                    title="昨食"
                    onPress={() => setMealType('lunch')}
                    variant={mealType === 'lunch' ? 'primary' : 'outline'}
                    style={styles.mealTypeButton}
                  />
                  <Button
                    title="夕食"
                    onPress={() => setMealType('dinner')}
                    variant={mealType === 'dinner' ? 'primary' : 'outline'}
                    style={styles.mealTypeButton}
                  />
                  <Button
                    title="間食"
                    onPress={() => setMealType('snack')}
                    variant={mealType === 'snack' ? 'primary' : 'outline'}
                    style={styles.mealTypeButton}
                  />
                </View>
              </View>
            </GlassCard>

            {/* 計算結果 */}
            <GlassCard style={styles.nutritionCard}>
              <Text style={styles.sectionTitle}>栄養成分（{amount}gあたり）</Text>
              
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Ionicons name="flame" size={24} color={Colors.primary} />
                  <Text style={styles.nutritionValue}>
                    {calculatedNutrition.calories}
                  </Text>
                  <Text style={styles.nutritionLabel}>カロリー</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Ionicons name="fish" size={24} color={Colors.primary} />
                  <Text style={styles.nutritionValue}>
                    {calculatedNutrition.protein}g
                  </Text>
                  <Text style={styles.nutritionLabel}>タンパク質</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Ionicons name="restaurant" size={24} color={Colors.secondary} />
                  <Text style={styles.nutritionValue}>
                    {calculatedNutrition.carbs}g
                  </Text>
                  <Text style={styles.nutritionLabel}>炭水化物</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Ionicons name="water" size={24} color={Colors.accent} />
                  <Text style={styles.nutritionValue}>
                    {calculatedNutrition.fat}g
                  </Text>
                  <Text style={styles.nutritionLabel}>脂質</Text>
                </View>
              </View>
            </GlassCard>

            {/* 追加ボタン */}
            <View style={styles.addButtonContainer}>
              <Button
                title="食事記録を追加"
                onPress={handleAddMeal}
                variant="primary"
                size="lg"
              />
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.base,
  },

  backButton: {
    padding: Spacing.xs,
    zIndex: 10,
  },

  deleteButton: {
    padding: Spacing.xs,
    zIndex: 10,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  title: {
    ...TextStyles.h2,
    color: Colors.text,
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  
  foodCard: {
    marginBottom: Spacing.base,
  },
  
  inputCard: {
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
    padding: Spacing.base,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
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
    paddingBottom: Spacing.xl,
    marginTop: Spacing.base,
  },
});
