import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { CalorieProgress } from '../components/CalorieProgress';
import { Card } from '../components/Card';
import { ModernCard } from '../components/ModernCard';
import { GradientCard } from '../components/GradientCard';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { DailySummary, MealRecord } from '../types';
import { calculateTotalNutrition, calculateMacroBalance } from '../utils/calorieCalculator';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await databaseService.getDailySummary(today);
      setDailySummary(summary);
    } catch (error) {
      console.error('日別サマリーの読み込みに失敗しました:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDailySummary();
    setRefreshing(false);
  };

  const handleAddMeal = (mealType: MealRecord['mealType']) => {
    navigation.navigate('AddMeal', { mealType });
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleViewSettings = () => {
    navigation.navigate('Settings');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            アプリを再起動してください
          </Text>
          <Button
            title="再試行"
            onPress={loadDailySummary}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const totalNutrition = dailySummary ? calculateTotalNutrition(dailySummary.meals) : {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  const macroBalance = calculateMacroBalance(totalNutrition);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <GradientCard variant="primary" style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Icon name="calories" size={32} color={Colors.textOnPrimary} />
                <Text style={styles.title}>カロリー計算</Text>
              </View>
              <Text style={styles.subtitle}>今日の栄養摂取を管理しましょう</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleViewSettings}
              activeOpacity={0.7}
            >
              <Icon name="settings" size={24} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </GradientCard>

        {/* カロリー進捗 */}
        <View style={styles.progressContainer}>
          <CalorieProgress
            current={totalNutrition.calories}
            goal={dailySummary?.goalCalories || 2000}
            size="lg"
          />
        </View>

        {/* マクロ栄養素バランス */}
        <ModernCard 
          style={styles.macroCard} 
          variant="elevated"
          title="マクロ栄養素バランス"
          subtitle="栄養バランスを確認しましょう"
        >
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <View style={styles.macroLabelContainer}>
                  <Icon name="protein" size={16} color={Colors.primary} />
                  <Text style={styles.macroLabel}>タンパク質</Text>
                </View>
                <Text style={styles.macroValue}>
                  {macroBalance.proteinGrams}g ({macroBalance.proteinPercentage}%)
                </Text>
              </View>
              <View style={[styles.macroBar, { backgroundColor: Colors.primarySoft }]}>
                <View
                  style={[
                    styles.macroFill,
                    { 
                      width: `${macroBalance.proteinPercentage}%`,
                      backgroundColor: Colors.primary,
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <View style={styles.macroLabelContainer}>
                  <Icon name="carbs" size={16} color={Colors.secondary} />
                  <Text style={styles.macroLabel}>炭水化物</Text>
                </View>
                <Text style={styles.macroValue}>
                  {macroBalance.carbsGrams}g ({macroBalance.carbsPercentage}%)
                </Text>
              </View>
              <View style={[styles.macroBar, { backgroundColor: Colors.secondarySoft }]}>
                <View
                  style={[
                    styles.macroFill,
                    { 
                      width: `${macroBalance.carbsPercentage}%`,
                      backgroundColor: Colors.secondary,
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <View style={styles.macroLabelContainer}>
                  <Icon name="fat" size={16} color={Colors.accent} />
                  <Text style={styles.macroLabel}>脂質</Text>
                </View>
                <Text style={styles.macroValue}>
                  {macroBalance.fatGrams}g ({macroBalance.fatPercentage}%)
                </Text>
              </View>
              <View style={[styles.macroBar, { backgroundColor: Colors.accentSoft }]}>
                <View
                  style={[
                    styles.macroFill,
                    { 
                      width: `${macroBalance.fatPercentage}%`,
                      backgroundColor: Colors.accent,
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </ModernCard>

        {/* 食事記録 */}
        <ModernCard 
          style={styles.mealsCard} 
          variant="elevated"
          title="今日の食事"
          subtitle="記録された食事を確認しましょう"
        >
          <View style={styles.mealsHeader}>
            <Button
              title="履歴を見る"
              onPress={handleViewHistory}
              variant="text"
              size="sm"
              style={styles.historyButton}
            />
          </View>
          {dailySummary?.meals.length === 0 ? (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyMealsText}>
                まだ食事記録がありません
              </Text>
              <Text style={styles.emptyMealsSubtext}>
                下のボタンから食事を追加しましょう
              </Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {dailySummary?.meals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.foodName}</Text>
                    <Text style={styles.mealAmount}>{meal.amount}g</Text>
                  </View>
                  <View style={styles.mealCaloriesContainer}>
                    <Text style={styles.mealCalories}>{Math.round(meal.calories)}</Text>
                    <Text style={styles.mealCaloriesUnit}>kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ModernCard>

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <Button
            title="朝食を追加"
            onPress={() => handleAddMeal('breakfast')}
            variant="primary"
            style={styles.actionButton}
            rounded
            icon={<Icon name="breakfast" size={20} color={Colors.textOnPrimary} />}
          />
          <Button
            title="昼食を追加"
            onPress={() => handleAddMeal('lunch')}
            variant="primary"
            style={styles.actionButton}
            rounded
            icon={<Icon name="lunch" size={20} color={Colors.textOnPrimary} />}
          />
          <Button
            title="夕食を追加"
            onPress={() => handleAddMeal('dinner')}
            variant="primary"
            style={styles.actionButton}
            rounded
            icon={<Icon name="dinner" size={20} color={Colors.textOnPrimary} />}
          />
          <Button
            title="間食を追加"
            onPress={() => handleAddMeal('snack')}
            variant="filled"
            style={styles.actionButton}
            rounded
            icon={<Icon name="snack" size={20} color={Colors.primary} />}
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.base,
  },
  
  loadingText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  headerCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  headerContent: {
    flex: 1,
    marginRight: Spacing.base,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  title: {
    ...TextStyles.h1,
    color: Colors.textOnPrimary,
    marginLeft: Spacing.sm,
    lineHeight: 40,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textOnPrimary,
    lineHeight: 22,
    opacity: 0.9,
  },
  
  settingsButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.base,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  progressContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  macroCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  macroContainer: {
    gap: Spacing.lg,
  },
  
  macroItem: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  macroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  macroBar: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceVariant,
  },
  
  macroFill: {
    height: '100%',
    borderRadius: 8,
  },
  
  macroLabel: {
    ...TextStyles.label,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  
  macroValue: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  
  mealsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  historyButton: {
    alignSelf: 'flex-end',
  },
  
  emptyMeals: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  
  emptyMealsText: {
    ...TextStyles.bodyLarge,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  emptyMealsSubtext: {
    ...TextStyles.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  mealsList: {
    gap: Spacing.sm,
  },
  
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  mealInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  mealName: {
    ...TextStyles.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  mealAmount: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  
  mealCaloriesContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  
  mealCalories: {
    ...TextStyles.h4,
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  
  mealCaloriesUnit: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginTop: -2,
    fontSize: 11,
  },
  
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  
  actionButton: {
    flex: 1,
    minWidth: '48%',
    marginBottom: Spacing.sm,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.base,
  },
  
  errorText: {
    ...TextStyles.h3,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  errorSubtext: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  
  retryButton: {
    minWidth: 120,
  },
});
