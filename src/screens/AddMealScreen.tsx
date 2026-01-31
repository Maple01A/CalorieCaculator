import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FoodCard } from '../components/FoodCard';
import { AddFoodModal } from '../components/AddFoodModal';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food, MealRecord } from '../types';
import { calculateNutritionForAmount } from '../utils/calorieCalculator';

interface AddMealScreenProps {
  navigation: any;
  route: {
    params: {
      mealType: MealRecord['mealType'];
    };
  };
}

interface SelectedFood {
  food: Food;
  amount: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const AddMealScreen: React.FC<AddMealScreenProps> = ({ navigation, route }) => {
  const { mealType } = route.params;
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const foods = await databaseService.searchFoods('');
      setAvailableFoods(foods);
    } catch (error) {
      console.error('食品の読み込みに失敗しました:', error);
      Alert.alert('エラー', '食品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFood = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadFoods();
      return;
    }

    try {
      setLoading(true);
      const foods = await databaseService.searchFoods(query);
      setAvailableFoods(foods);
    } catch (error) {
      console.error('食品検索に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    // デフォルトで100gを追加
    const nutrition = calculateNutritionForAmount(food, 100);
    const newSelected: SelectedFood = {
      food,
      amount: 100,
      nutrition,
    };
    setSelectedFoods([...selectedFoods, newSelected]);
    setShowFoodSearch(false);
    setSearchQuery('');
  };

  const handleUpdateAmount = (index: number, amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const updated = [...selectedFoods];
    updated[index].amount = numericAmount;
    updated[index].nutrition = calculateNutritionForAmount(
      updated[index].food,
      numericAmount
    );
    setSelectedFoods(updated);
  };

  const handleRemoveFood = (index: number) => {
    const updated = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(updated);
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('エラー', '食品を追加してください');
      return;
    }

    try {
      setSaving(true);
      const timestamp = new Date();

      // 各食品を個別に記録として保存
      for (const item of selectedFoods) {
        const mealRecord: Omit<MealRecord, 'id'> = {
          foodId: item.food.id,
          foodName: item.food.name,
          amount: item.amount,
          calories: item.nutrition.calories,
          protein: item.nutrition.protein,
          carbs: item.nutrition.carbs,
          fat: item.nutrition.fat,
          timestamp,
          mealType,
        };

        await databaseService.addMealRecord(mealRecord);
      }

      // 保存成功後、自動的にホーム画面に戻る
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('食事記録の保存に失敗しました:', error);
      Alert.alert('エラー', '食事記録の保存に失敗しました');
      setSaving(false);
    }
  };

  const handleAddFoodSuccess = (food: Food) => {
    setAvailableFoods([food, ...availableFoods]);
    handleSelectFood(food);
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

  const getMealTypeIcon = (type: MealRecord['mealType']) => {
    const icons = {
      breakfast: 'sunny-outline',
      lunch: 'restaurant-outline',
      dinner: 'moon-outline',
      snack: 'cafe-outline',
    };
    return icons[type];
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <AnimatedBackground variant="primary">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons
            name={getMealTypeIcon(mealType) as any}
            size={24}
            color={Colors.primary}
          />
          <Text style={styles.title}>{getMealTypeLabel(mealType)}を追加</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 選択された食品リスト */}
        {selectedFoods.length > 0 && (
          <Card style={styles.selectedFoodsCard}>
            <Text style={styles.sectionTitle}>選択された食品</Text>

            {selectedFoods.map((item, index) => (
              <View key={index} style={styles.selectedFoodItem}>
                <View style={styles.selectedFoodHeader}>
                  <Text style={styles.selectedFoodName}>{item.food.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFood(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.amountInputContainer}>
                  <Input
                    label="量（グラム）"
                    value={item.amount.toString()}
                    onChangeText={(text) => handleUpdateAmount(index, text)}
                    keyboardType="numeric"
                    style={styles.amountInput}
                  />
                </View>

                <View style={styles.nutritionSummary}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(item.nutrition.calories)}
                    </Text>
                    <Text style={styles.nutritionLabel}>kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(item.nutrition.protein * 10) / 10}g
                    </Text>
                    <Text style={styles.nutritionLabel}>タンパク質</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(item.nutrition.carbs * 10) / 10}g
                    </Text>
                    <Text style={styles.nutritionLabel}>炭水化物</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(item.nutrition.fat * 10) / 10}g
                    </Text>
                    <Text style={styles.nutritionLabel}>脂質</Text>
                  </View>
                </View>

                {index < selectedFoods.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </Card>
        )}

        {/* 合計栄養成分 */}
        {selectedFoods.length > 0 && (
          <Card style={styles.totalCard}>
            <Text style={styles.sectionTitle}>合計栄養成分</Text>

            <View style={styles.totalGrid}>
              <View style={styles.totalItem}>
                <Ionicons name="flame" size={32} color={Colors.primary} />
                <Text style={styles.totalValue}>
                  {Math.round(totalNutrition.calories)}
                </Text>
                <Text style={styles.totalLabel}>カロリー (kcal)</Text>
              </View>

              <View style={styles.totalItem}>
                <Ionicons name="fitness" size={32} color={Colors.primary} />
                <Text style={styles.totalValue}>
                  {Math.round(totalNutrition.protein * 10) / 10}g
                </Text>
                <Text style={styles.totalLabel}>タンパク質</Text>
              </View>

              <View style={styles.totalItem}>
                <Ionicons name="leaf" size={32} color={Colors.secondary} />
                <Text style={styles.totalValue}>
                  {Math.round(totalNutrition.carbs * 10) / 10}g
                </Text>
                <Text style={styles.totalLabel}>炭水化物</Text>
              </View>

              <View style={styles.totalItem}>
                <Ionicons name="water" size={32} color={Colors.accent} />
                <Text style={styles.totalValue}>
                  {Math.round(totalNutrition.fat * 10) / 10}g
                </Text>
                <Text style={styles.totalLabel}>脂質</Text>
              </View>
            </View>
          </Card>
        )}

        {/* 食品を追加ボタン */}
        <Card style={styles.addButtonCard}>
          <Button
            title="食品を追加"
            onPress={() => setShowFoodSearch(true)}
            variant="outline"
            leftIcon={<Ionicons name="add" size={20} color={Colors.primary} />}
          />

          <Button
            title="新しい食品を登録"
            onPress={() => setShowAddFoodModal(true)}
            variant="ghost"
            style={styles.registerNewButton}
            leftIcon={<Ionicons name="create-outline" size={20} color={Colors.secondary} />}
          />
        </Card>
      </ScrollView>

      {/* 保存ボタン */}
      {selectedFoods.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={`${getMealTypeLabel(mealType)}を保存 (${Math.round(totalNutrition.calories)} kcal)`}
            onPress={handleSaveMeal}
            variant="primary"
            size="lg"
            loading={saving}
          />
        </View>
      )}

      {/* 食品検索モーダル */}
      {showFoodSearch && (
        <View style={styles.searchModal}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>食品を検索</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFoodSearch(false);
                  setSearchQuery('');
                }}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={28} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Input
                placeholder="食品名を入力"
                value={searchQuery}
                onChangeText={handleSearchFood}
                style={styles.searchInput}
                rightIcon={
                  searchQuery ? (
                    <TouchableOpacity onPress={() => handleSearchFood('')}>
                      <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  ) : undefined
                }
              />
            </View>

            <FlatList
              data={availableFoods}
              renderItem={({ item }) => (
                <FoodCard
                  food={item}
                  onPress={handleSelectFood}
                  showNutrition={true}
                />
              )}
              keyExtractor={(item) => item.id}
              style={styles.foodList}
              contentContainerStyle={styles.foodListContent}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="search-outline" size={64} color={Colors.textDisabled} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? '該当する食品が見つかりません' : '食品を検索してください'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      )}

      {/* 新規食品登録モーダル */}
      <AddFoodModal
        visible={showAddFoodModal}
        onClose={() => setShowAddFoodModal(false)}
        onSuccess={handleAddFoodSuccess}
      />
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    padding: Spacing.xs,
  },

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  title: {
    ...TextStyles.h2,
    color: Colors.text,
  },

  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  selectedFoodsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
  },

  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.text,
    marginBottom: Spacing.base,
  },

  selectedFoodItem: {
    marginBottom: Spacing.base,
  },

  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  selectedFoodName: {
    ...TextStyles.h4,
    color: Colors.text,
    flex: 1,
  },

  removeButton: {
    padding: Spacing.xs,
  },

  amountInputContainer: {
    marginBottom: Spacing.sm,
  },

  amountInput: {
    marginBottom: 0,
  },

  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
  },

  nutritionItem: {
    alignItems: 'center',
  },

  nutritionValue: {
    ...TextStyles.body,
    color: Colors.text,
    fontWeight: '600',
  },

  nutritionLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: Spacing.base,
  },

  totalCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryLight,
    borderWidth: 2,
  },

  totalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },

  totalItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },

  totalValue: {
    ...TextStyles.h3,
    color: Colors.text,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },

  totalLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  addButtonCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },

  registerNewButton: {
    marginTop: Spacing.sm,
  },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  // 検索モーダル
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  searchModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '80%',
    paddingTop: Spacing.lg,
  },

  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },

  searchModalTitle: {
    ...TextStyles.h2,
    color: Colors.text,
  },

  closeModalButton: {
    padding: Spacing.xs,
  },

  searchInputContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },

  searchInput: {
    marginBottom: 0,
  },

  foodList: {
    flex: 1,
  },

  foodListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },

  emptyText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
    textAlign: 'center',
  },
});