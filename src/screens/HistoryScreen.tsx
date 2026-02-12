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
import { GlassCard } from '../components/GlassCard';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { DailySummary, MealRecord } from '../types';
import { calculateTotalNutrition } from '../utils/calorieCalculator';
import { useResponsive } from '../hooks/useResponsive';

const screenWidth = Dimensions.get('window').width;

interface HistoryScreenProps {
  navigation: any;
}

type PeriodType = 'week' | 'month' | 'year';

const periodConfig = {
  week: { days: 7, label: '1週間', shortLabel: '週' },
  month: { days: 30, label: '1か月', shortLabel: '月' },
  year: { days: 365, label: '1年', shortLabel: '年' },
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [showAllDays, setShowAllDays] = useState(false);
  const { isMobile, isDesktop } = useResponsive();

  const INITIAL_DISPLAY_COUNT = 5; // 最初に表示する件数

  useEffect(() => {
    loadHistory();
    setShowAllDays(false); // 期間変更時にリセット
  }, [selectedPeriod]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const summaries: DailySummary[] = [];
      const today = new Date();
      const { days } = periodConfig[selectedPeriod];
      
      // 選択された期間分のデータを取得（新しい順）
      // 年間データの場合は週単位で集計
      if (selectedPeriod === 'year') {
        // 52週分のデータを週ごとに集計
        for (let week = 51; week >= 0; week--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (week * 7) - 6);
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() - (week * 7));
          
          let weekTotalCalories = 0;
          let weekTotalProtein = 0;
          let weekTotalCarbs = 0;
          let weekTotalFat = 0;
          let weekMeals: MealRecord[] = [];
          let goalCalories = 2000;
          
          for (let d = 0; d < 7; d++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + d);
            const dateString = date.toISOString().split('T')[0];
            
            try {
              const summary = await databaseService.getDailySummary(dateString);
              weekMeals = [...weekMeals, ...summary.meals];
              goalCalories = summary.goalCalories;
            } catch (error) {
              // データなし
            }
          }
          
          const weekDateString = weekEnd.toISOString().split('T')[0];
          summaries.push({
            date: weekDateString,
            totalCalories: weekTotalCalories,
            totalProtein: weekTotalProtein,
            totalCarbs: weekTotalCarbs,
            totalFat: weekTotalFat,
            meals: weekMeals,
            goalCalories: goalCalories * 7, // 週間の目標
          });
        }
      } else {
        // 週・月は日単位
        for (let i = days - 1; i >= 0; i--) {
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
    
    if (selectedPeriod === 'year') {
      // 年間表示：月を表示
      return `${date.getMonth() + 1}月`;
    }
    
    if (selectedPeriod === 'month') {
      // 月間表示：日付を簡潔に
      return `${date.getDate()}`;
    }
    
    // 週間表示
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
    let filteredSummaries = dailySummaries;
    
    // 月間表示の場合、5日ごとにサンプリング
    if (selectedPeriod === 'month') {
      filteredSummaries = dailySummaries.filter((_, index) => index % 5 === 0 || index === dailySummaries.length - 1);
    }
    // 年間表示の場合、月ごと（4週ごと）にサンプリング
    else if (selectedPeriod === 'year') {
      filteredSummaries = dailySummaries.filter((_, index) => index % 4 === 0 || index === dailySummaries.length - 1);
    }
    
    const labels = filteredSummaries.map(s => formatDateShort(s.date));
    const data = filteredSummaries.map(s => {
      const total = calculateTotalNutrition(s.meals);
      return total.calories;
    });
    const goalData = filteredSummaries.map(s => s.goalCalories);

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

  // 統計データ（期間対応）
  const getPeriodStats = () => {
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
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#FFFFFF',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
      fill: Colors.text,
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: Colors.border,
      strokeWidth: 1,
      strokeOpacity: 0.3,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const barChartConfig = {
    ...chartConfig,
    fillShadowGradient: Colors.primary,
    fillShadowGradientFrom: Colors.primary,
    fillShadowGradientFromOpacity: 0.9,
    fillShadowGradientTo: Colors.primary,
    fillShadowGradientToOpacity: 0.6,
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

  const periodStats = getPeriodStats();

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return '今週';
      case 'month': return '今月';
      case 'year': return '今年';
    }
  };

  const getPeriodSubtitle = () => {
    switch (selectedPeriod) {
      case 'week': return '過去7日間';
      case 'month': return '過去30日間';
      case 'year': return '過去1年間';
    }
  };

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
          <ResponsiveContainer>
            {/* ヘッダー */}
            <View style={styles.header}>
              <Text style={[styles.title, isDesktop && TextStyles.h1]}>履歴</Text>
              <Text style={[styles.subtitle, isDesktop && { fontSize: 16 }]}>{getPeriodSubtitle()}の食事記録を確認しましょう</Text>
            </View>

            {/* 期間セレクター */}
            <View style={styles.periodSelector}>
              {(['week', 'month', 'year'] as PeriodType[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {periodConfig[period].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 統計カード */}
            <GlassCard style={styles.statsCard}>
          <Text style={styles.sectionTitle}>{getPeriodLabel()}の統計</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {periodStats.totalProtein}g
              </Text>
              <Text style={styles.statLabel}>タンパク質</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.secondary }]}>
                {periodStats.totalCarbs}g
              </Text>
              <Text style={styles.statLabel}>炭水化物</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {periodStats.totalFat}g
              </Text>
              <Text style={styles.statLabel}>脂質</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{periodStats.avgCalories}</Text>
              <Text style={styles.statLabel}>平均カロリー</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{periodStats.daysWithRecords}</Text>
              <Text style={styles.statLabel}>記録日数</Text>
            </View>
          </View>
            </GlassCard>

            {/* カロリー推移グラフ */}
            <GlassCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>{getPeriodLabel()}のカロリー推移</Text>
          <Text style={styles.chartSubtitle}>{getPeriodSubtitle()}の摂取カロリーと目標</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={getCalorieChartData()}
              width={Math.max(screenWidth - 80, 400)}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
              fromZero
              segments={4}
              yAxisSuffix=" kcal"
                formatYLabel={(value) => Math.round(Number(value)).toString()}
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
            </GlassCard>

            {/* 栄養素バランスグラフ */}
            <GlassCard style={styles.chartCard}>
              <Text style={styles.sectionTitle}>{getPeriodLabel()}の栄養バランス</Text>
              <Text style={styles.chartSubtitle}>三大栄養素の合計摂取量（グラム）</Text>
              
              <BarChart
                data={getNutritionChartData()}
                width={isDesktop ? screenWidth * 0.5 : screenWidth - 80}
                height={240}
                yAxisLabel=""
                yAxisSuffix="g"
                chartConfig={{
                  ...barChartConfig,
                  color: (opacity = 1, index) => {
                    const colors = [
                      `rgba(33, 150, 243, ${opacity})`,  // Blue for protein
                      `rgba(255, 152, 0, ${opacity})`,   // Orange for carbs
                      `rgba(233, 30, 99, ${opacity})`    // Pink for fat
                    ];
                    return colors[index || 0];
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '5,5',
                    stroke: Colors.border,
                    strokeWidth: 1,
                    strokeOpacity: 0.2,
                  },
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                withInnerLines={true}
                fromZero
                segments={4}
              />
            </GlassCard>

            {/* 日別詳細リスト */}
            <GlassCard style={styles.listCard}>
              <Text style={styles.sectionTitle}>日別詳細</Text>
              
              {(() => {
                const reversedSummaries = dailySummaries.slice().reverse();
                const displaySummaries = showAllDays 
                  ? reversedSummaries 
                  : reversedSummaries.slice(0, INITIAL_DISPLAY_COUNT);
                const remainingCount = reversedSummaries.length - INITIAL_DISPLAY_COUNT;
                
                return (
                  <>
                    {displaySummaries.map((summary, index) => {
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
                
                {index < displaySummaries.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
                    
                    {/* 全て表示ボタン */}
                    {!showAllDays && remainingCount > 0 && (
                      <TouchableOpacity
                        style={styles.showAllButton}
                        onPress={() => setShowAllDays(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.showAllButtonText}>
                          あと{remainingCount}件を表示
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                    
                    {/* 折りたたむボタン */}
                    {showAllDays && remainingCount > 0 && (
                      <TouchableOpacity
                        style={styles.showAllButton}
                        onPress={() => setShowAllDays(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.showAllButtonText}>
                          折りたたむ
                        </Text>
                        <Ionicons name="chevron-up" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  </>
                );
              })()}
            </GlassCard>
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.base,
  },
  
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
  },
  
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  
  periodButtonText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  
  periodButtonTextActive: {
    color: Colors.surface,
  },
  
  statsCard: {
    marginBottom: Spacing.base,
  },
  
  chartCard: {
    marginBottom: Spacing.base,
  },
  
  listCard: {
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
    paddingRight: 20,
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
  
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.lg,
  },
  
  showAllButtonText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
