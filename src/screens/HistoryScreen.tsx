import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { Card } from '../components/Card';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { DailySummary } from '../types';
import { calculateTotalNutrition } from '../utils/calorieCalculator';

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // 過去7日分のデータを取得
      const summaries: DailySummary[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        try {
          const summary = await databaseService.getDailySummary(dateString);
          summaries.push(summary);
        } catch (error) {
          // データがない日は空のサマリーを作成
          summaries.push({
            date: dateString,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: [],
            goalCalories: 2000,
          });
        }
      }
      
      setDailySummaries(summaries);
    } catch (error) {
      console.error('履歴の読み込みに失敗しました:', error);
      Alert.alert('エラー', '履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return '今日';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });
    }
  };

  const getCalorieStatus = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 90) return { status: 'under', color: Colors.warning };
    if (percentage <= 110) return { status: 'on_target', color: Colors.success };
    return { status: 'over', color: Colors.error };
  };

  const renderDayItem = ({ item }: { item: DailySummary }) => {
    const totalNutrition = calculateTotalNutrition(item.meals);
    const calorieStatus = getCalorieStatus(totalNutrition.calories, item.goalCalories);
    
    return (
      <Card style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: calorieStatus.color }]}>
            <Text style={styles.statusText}>
              {Math.round((totalNutrition.calories / item.goalCalories) * 100)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.nutritionSummary}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{Math.round(totalNutrition.calories)}</Text>
            <Text style={styles.nutritionLabel}>kcal</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{Math.round(totalNutrition.protein)}g</Text>
            <Text style={styles.nutritionLabel}>タンパク質</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{Math.round(totalNutrition.carbs)}g</Text>
            <Text style={styles.nutritionLabel}>炭水化物</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{Math.round(totalNutrition.fat)}g</Text>
            <Text style={styles.nutritionLabel}>脂質</Text>
          </View>
        </View>
        
        <View style={styles.mealsSummary}>
          <Text style={styles.mealsCount}>
            {item.meals.length}件の食事記録
          </Text>
          {item.meals.length > 0 && (
            <Text style={styles.mealsPreview}>
              {item.meals.slice(0, 3).map(meal => meal.foodName).join('、')}
              {item.meals.length > 3 && '...'}
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>履歴がありません</Text>
      <Text style={styles.emptySubtext}>
        食事記録を追加すると、ここに履歴が表示されます
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>履歴</Text>
        <Text style={styles.subtitle}>過去7日間の食事記録</Text>
      </View>

      <FlatList
        data={dailySummaries}
        renderItem={renderDayItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  dayCard: {
    marginBottom: Spacing.base,
  },
  
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  
  dayDate: {
    ...TextStyles.h3,
    color: Colors.text,
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  
  statusText: {
    ...TextStyles.caption,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  
  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  nutritionValue: {
    ...TextStyles.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  nutritionLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  mealsSummary: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  
  mealsCount: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  
  mealsPreview: {
    ...TextStyles.caption,
    color: Colors.text,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  
  emptyText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtext: {
    ...TextStyles.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
