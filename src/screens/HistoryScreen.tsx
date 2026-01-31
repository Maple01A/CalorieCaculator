import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { Card } from '../components/Card';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { DailySummary, MealRecord } from '../types';
import { calculateTotalNutrition } from '../utils/calorieCalculator';

const screenWidth = Dimensions.get('window').width;

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const summaries: DailySummary[] = [];
      const today = new Date();
      
      // 過去7日分のデータを取得（新しい順）
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        try {
          const summary = await databaseService.getDailySummary(dateString);
          summaries.push(summary);
        } catch (error) {
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

  const toggleDateExpanded = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日 (${days[date.getDay()]})`;
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
      breakfast: 'sunny',
      lunch: 'restaurant',
      dinner: 'moon',
      snack: 'cafe',
    };
    return icons[type];
  };

  const groupMealsByType = (meals: MealRecord[]) => {
    const grouped: { [key: string]: MealRecord[] } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    meals.forEach(meal => {
      grouped[meal.mealType].push(meal);
    });

    return grouped;
  };

  // カロリーグラフのデータ
  const getCalorieChartData = () => {
    const labels = dailySummaries.map(s => formatDateShort(s.date));
    const data = dailySummaries.map(s => {
      const total = calculateTotalNutrition(s.meals);
      return total.calories;
    });
    const goalData = dailySummaries.map(s => s.goalCalories);

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => Colors.primary,
          strokeWidth: 3,
        },
        {
          data: goalData.length > 0 ? goalData : [0],
          color: (opacity = 1) => Colors.textDisabled,
          strokeWidth: 2,
          withDots: false,
        },
      ],
      legend: ['摂取カロリー', '目標'],
    };
  };

  // 栄養素バランスグラフのデータ
  const getNutritionChartData = () => {
    // 週間の合計データを使用
    const totalProtein = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.protein;
    }, 0);

    const totalCarbs = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.carbs;
    }, 0);

    const totalFat = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.fat;
    }, 0);

    return {
      labels: ['タンパク質', '炭水化物', '脂質'],
      datasets: [
        {
          data: [
            totalProtein || 0.1,
            totalCarbs || 0.1,
            totalFat || 0.1,
          ],
        },
      ],
    };
  };

  // 週間統計データ
  const getWeeklyStats = () => {
    const totalCalories = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.calories;
    }, 0);

    const totalProtein = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.protein;
    }, 0);

    const totalCarbs = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.carbs;
    }, 0);

    const totalFat = dailySummaries.reduce((sum, s) => {
      const nutrition = calculateTotalNutrition(s.meals);
      return sum + nutrition.fat;
    }, 0);

    const daysWithRecords = dailySummaries.filter(s => s.meals.length > 0).length;
    const avgCalories = daysWithRecords > 0 ? totalCalories / daysWithRecords : 0;

    return {
      avgCalories: Math.round(avgCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      daysWithRecords,
    };
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    color: (opacity = 1) => Colors.primary,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.borderLight,
      strokeWidth: 1,
    },
  };

  const barChartConfig = {
    ...chartConfig,
    fillShadowGradient: Colors.primary,
    fillShadowGradientOpacity: 1,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weeklyStats = getWeeklyStats();

  return (
    <AnimatedBackground variant="neutral">
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
          <View style={styles.header}>
            <Text style={styles.subtitle}>過去7日間の食事記録を確認しましょう</Text>
        </View>

        {/* 週間統計カード */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>今週の統計</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {weeklyStats.totalProtein}g
              </Text>
              <Text style={styles.statLabel}>タンパク質</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.secondary }]}>
                {weeklyStats.totalCarbs}g
              </Text>
              <Text style={styles.statLabel}>炭水化物</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {weeklyStats.totalFat}g
              </Text>
              <Text style={styles.statLabel}>脂質</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.avgCalories}</Text>
              <Text style={styles.statLabel}>平均カロリー</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.daysWithRecords}</Text>
              <Text style={styles.statLabel}>記録日数</Text>
            </View>
          </View>
        </Card>

        {/* カロリー推移グラフ */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>今週のカロリー推移</Text>
          <Text style={styles.chartSubtitle}>過去7日間の摂取カロリーと目標</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={getCalorieChartData()}
              width={Math.max(screenWidth - 80, 400)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={true}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero
              segments={4}
            />
          </ScrollView>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>摂取カロリー</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.textDisabled }]} />
              <Text style={styles.legendText}>目標</Text>
            </View>
          </View>
        </Card>

        {/* 栄養素バランスグラフ */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>今週の栄養バランス</Text>
          <Text style={styles.chartSubtitle}>三大栄養素の合計摂取量（グラム）</Text>
          
          <BarChart
            data={getNutritionChartData()}
            width={screenWidth - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix="g"
            chartConfig={{
              ...barChartConfig,
              color: (opacity = 1, index) => {
                const colors = [Colors.primary, Colors.secondary, Colors.accent];
                return colors[index || 0];
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        </Card>

        {/* 日別詳細リスト */}
        <Card style={styles.listCard}>
          <Text style={styles.sectionTitle}>日別詳細</Text>
          
          {dailySummaries.map((summary, index) => {
            const nutrition = calculateTotalNutrition(summary.meals);
            const percentage = Math.round((nutrition.calories / summary.goalCalories) * 100);
            const isExpanded = expandedDates.has(summary.date);
            const groupedMeals = groupMealsByType(summary.meals);
            
            return (
              <View key={summary.date}>
                <TouchableOpacity
                  style={styles.dayItem}
                  onPress={() => toggleDateExpanded(summary.date)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayHeader}>
                    <View style={styles.dayHeaderLeft}>
                      <Text style={styles.dayDate}>
                        {formatDateFull(summary.date)}
                      </Text>
                      {summary.meals.length > 0 && (
                        <Text style={styles.dayMealsCount}>
                          {summary.meals.length}件の記録
                        </Text>
                      )}
                    </View>
                    <View style={styles.dayHeaderRight}>
                      <View style={styles.dayStats}>
                        <Text style={styles.dayCalories}>
                          {Math.round(nutrition.calories)} kcal
                        </Text>
                        <Text
                          style={[
                            styles.dayPercentage,
                            {
                              color:
                                percentage < 90
                                  ? Colors.warning
                                  : percentage <= 110
                                  ? Colors.success
                                  : Colors.error,
                            },
                          ]}
                        >
                          {percentage}%
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 展開された食事詳細 */}
                {isExpanded && summary.meals.length > 0 && (
                  <View style={styles.mealDetails}>
                    {Object.entries(groupedMeals).map(([mealType, meals]) => {
                      if (meals.length === 0) return null;

                      const mealTypeKey = mealType as MealRecord['mealType'];
                      const mealTotal = meals.reduce((sum, meal) => sum + meal.calories, 0);

                      return (
                        <View key={mealType} style={styles.mealTypeSection}>
                          <View style={styles.mealTypeHeader}>
                            <View style={styles.mealTypeIconContainer}>
                              <Ionicons
                                name={getMealTypeIcon(mealTypeKey) as any}
                                size={18}
                                color={Colors.primary}
                              />
                            </View>
                            <Text style={styles.mealTypeLabel}>
                              {getMealTypeLabel(mealTypeKey)}
                            </Text>
                            <Text style={styles.mealTypeCalories}>
                              {Math.round(mealTotal)} kcal
                            </Text>
                          </View>

                          {meals.map((meal) => (
                            <View key={meal.id} style={styles.mealItem}>
                              <View style={styles.mealItemContent}>
                                <Text style={styles.mealItemName}>{meal.foodName}</Text>
                                <View style={styles.mealItemDetails}>
                                  <Text style={styles.mealItemDetail}>{meal.amount}g</Text>
                                  <Text style={styles.mealItemDetail}>•</Text>
                                  <Text style={styles.mealItemDetail}>
                                    {Math.round(meal.calories)} kcal
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                )}
                
                {index < dailySummaries.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>
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
  
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  listCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  chartSubtitle: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    marginTop: Spacing.sm,
  },
  
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
  },
  
  statValue: {
    ...TextStyles.h3,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  
  statLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  chart: {
    marginVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  legendText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  
  dayItem: {
    paddingVertical: Spacing.base,
  },
  
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dayHeaderLeft: {
    flex: 1,
  },

  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  dayDate: {
    ...TextStyles.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  dayMealsCount: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  
  dayStats: {
    alignItems: 'flex-end',
  },
  
  dayCalories: {
    ...TextStyles.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  dayPercentage: {
    ...TextStyles.caption,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.base,
  },

  // 食事詳細
  mealDetails: {
    marginTop: Spacing.sm,
    paddingLeft: Spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryLight,
  },

  mealTypeSection: {
    marginBottom: Spacing.base,
  },

  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  mealTypeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mealTypeLabel: {
    ...TextStyles.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },

  mealTypeCalories: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },

  mealItem: {
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing['4xl'],
  },

  mealItemContent: {
    flex: 1,
  },

  mealItemName: {
    ...TextStyles.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  mealItemDetails: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  mealItemDetail: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: Spacing.base,
  },
});
