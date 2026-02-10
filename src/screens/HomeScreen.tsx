import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Box,
  ScrollView,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  Pressable,
  useToast,
  Progress,
  Badge,
  Divider
} from 'native-base';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { authService } from '../services/auth';
import { apiClient } from '../services/apiClient';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { DailySummary, MealRecord } from '../types';
import { calculateTotalNutrition, calculateMacroBalance } from '../utils/calorieCalculator';
import { useResponsive } from '../hooks/useResponsive';
import { ResponsiveContainer, ResponsiveGrid } from '../components/ResponsiveContainer';

interface HomeScreenProps {
  navigation: any;
  route?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isGuest, setIsGuest] = useState(authService.isGuestMode());
  const toast = useToast();
  
  // レスポンシブフック
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const today = new Date().toISOString().split('T')[0];

  // 画面がフォーカスされた時、またはパラメータが変更された時にデータを再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadDailySummary();
    }, [route?.params?.refresh])
  );

  useEffect(() => {
    loadDailySummary();

    // 認証状態の監視
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsGuest(authService.isGuestMode());
    });

    return () => unsubscribe();
  }, []);

  const loadDailySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await databaseService.getDailySummary(today);
      setDailySummary(summary);
    } catch (error) {
      console.error('日別サマリーの読み込みに失敗:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // ログインユーザーの場合、クラウドから設定を同期
    const user = authService.getCurrentUser();
    if (user && !authService.isGuestMode()) {
      try {
        const settings = await apiClient.getSettings(user.id);
        if (settings) {
          await databaseService.updateUserSettings({
            dailyCalorieGoal: settings.dailyCalorieGoal || settings.target_calories || 2000,
            height: settings.height,
            weight: settings.weight,
            age: settings.age,
            gender: settings.gender,
            activityLevel: settings.activityLevel || settings.activity_level,
          });
        }
      } catch (error) {
        console.warn('クラウド設定の取得に失敗:', error);
      }
    }
    
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

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await databaseService.deleteMealRecord(mealId);
      await loadDailySummary();
      toast.show({
        description: '食事記録を削除しました',
        duration: 2000,
      });
    } catch (error) {
      console.error('食事記録の削除に失敗しました:', error);
      toast.show({
        description: '削除に失敗しました',
        duration: 2000,
        status: 'error',
      });
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

  const getMealTypeIcon = (type: MealRecord['mealType']) => {
    const icons = {
      breakfast: 'sunny',
      lunch: 'restaurant',
      dinner: 'moon',
      snack: 'cafe',
    };
    return icons[type];
  };

  const getMealTypeColor = (type: MealRecord['mealType']) => {
    const colors = {
      breakfast: 'orange.500',
      lunch: 'blue.500',
      dinner: 'purple.500',
      snack: 'green.500',
    };
    return colors[type];
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <Center flex={1}>
          <Spinner size="lg" color={Colors.primary} />
          <Text mt={4} color="gray.500">読み込み中...</Text>
        </Center>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <Center flex={1} p={8}>
          <Heading color="error.500" mb={2}>エラー</Heading>
          <Text color="gray.600" textAlign="center" mb={6}>
            {error}
          </Text>
          <Text color="gray.500" textAlign="center" mb={8}>
            アプリを再起動してください
          </Text>
          <Button
            title="再試行"
            onPress={loadDailySummary}
            variant="primary"
          />
        </Center>
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
  
  const getCalorieStatus = () => {
    const percentage = Math.round((totalNutrition.calories / (dailySummary?.goalCalories || 2000)) * 100);
    if (percentage < 90) return { color: "warning.500", text: "目標まで" };
    if (percentage <= 110) return { color: "success.500", text: "目標達成" };
    return { color: "error.500", text: "目標超過" };
  };

  const calorieStatus = getCalorieStatus();
  const groupedMeals = dailySummary ? groupMealsByType(dailySummary.meals) : {};
  const hasMeals = dailySummary && dailySummary.meals.length > 0;

  return (
    <AnimatedBackground variant="primary">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
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
            <HStack justifyContent="space-between" alignItems="center" mb={2} mt={2}>
              <VStack>
                <Heading size={isDesktop ? "2xl" : "xl"}>カロリー計算</Heading>
                <Text color="gray.500" fontSize={isDesktop ? "md" : "sm"}>
                  今日の栄養摂取を管理しましょう
                </Text>
              </VStack>
              <Pressable onPress={handleViewSettings} p={2} bg="gray.100" borderRadius="full">
                <Ionicons name="settings-outline" size={isDesktop ? 28 : 24} color={Colors.text} />
              </Pressable>
            </HStack>

            {/* ログイン状態カード */}
            {!currentUser && (
              <GlassCard style={{ marginBottom: 16 }}>
                <HStack space={3} alignItems="center">
                  <Box bg="primary.100" p={3} borderRadius="full">
                    <Ionicons name="person-outline" size={24} color={Colors.primary} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md">ログインしてデータを保存</Text>
                    <Text color="gray.500" fontSize="sm">複数のデバイスでデータを同期できます</Text>
                  </VStack>
                  <Pressable
                    onPress={handleLogin}
                    bg="primary.500"
                    px={4}
                    py={2}
                    borderRadius="md"
                    _pressed={{ bg: "primary.600" }}
                  >
                    <Text color="white" fontWeight="bold">ログイン</Text>
                  </Pressable>
                </HStack>
              </GlassCard>
            )}

            {/* ゲストモード表示 */}
            {currentUser && isGuest && (
              <GlassCard style={{ marginBottom: 16 }}>
                <HStack space={3} alignItems="center">
                  <Box bg="warning.100" p={3} borderRadius="full">
                    <Ionicons name="information-circle" size={24} color="orange" />
                  </Box>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md">ゲストモード</Text>
                    <Text color="gray.500" fontSize="sm">アカウント作成でデータを保存できます</Text>
                  </VStack>
                  <Pressable
                    onPress={handleLogin}
                    bg="warning.500"
                    px={4}
                    py={2}
                    borderRadius="md"
                    _pressed={{ bg: "warning.600" }}
                  >
                    <Text color="white" fontWeight="bold">作成</Text>
                  </Pressable>
                </HStack>
              </GlassCard>
            )}

            {/* ログイン済み表示 */}
            {currentUser && !isGuest && (
              <GlassCard style={{ marginBottom: 16 }}>
                <HStack space={3} alignItems="center">
                  <Box bg="success.100" p={3} borderRadius="full">
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  </Box>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md">{currentUser.displayName}</Text>
                    <Text color="gray.500" fontSize="sm">データは自動的に同期されます</Text>
                  </VStack>
                </HStack>
              </GlassCard>
            )}
            
            {/* カロリー進捗カード */}
            {isDesktop ? (
              // デスクトップ: 2カラムレイアウト
              <HStack space={4} mb={6} mt={4} alignItems="flex-start">
                <GlassCard style={{ flex: 1 }}>
                  <VStack space={4}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Heading size="md">カロリー進捗</Heading>
                      <Badge colorScheme={calorieStatus.color.split('.')[0]} fontSize="md">
                        {calorieStatus.text}
                      </Badge>
                    </HStack>
                    
                    <Progress
                      value={Math.min((totalNutrition.calories / (dailySummary?.goalCalories || 2000)) * 100, 100)}
                      size="lg"
                      colorScheme={calorieStatus.color.split('.')[0]}
                      bg="gray.200"
                    />
                    
                    <HStack justifyContent="center" alignItems="baseline">
                      <Heading size="2xl">{Math.round(totalNutrition.calories)}</Heading>
                      <Text color="gray.500" ml={2} fontSize="lg"> / {dailySummary?.goalCalories || 2000} kcal</Text>
                    </HStack>
                  </VStack>
                </GlassCard>

                {/* マクロ栄養素バランス - デスクトップ */}
                <GlassCard style={{ flex: 1 }}>
                  <VStack space={3}>
                    <Heading size="md">マクロ栄養素バランス</Heading>
                    
                    <VStack space={4}>
                      {/* タンパク質 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="primary.100" p={2} borderRadius="md">
                              <Ionicons name="fitness-outline" size={20} color={Colors.primary} />
                            </Box>
                            <Text fontWeight="medium" fontSize="md">タンパク質</Text>
                          </HStack>
                          <Text fontSize="md">{Math.round(macroBalance.proteinGrams)}g ({Math.round(macroBalance.proteinPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.proteinPercentage} 
                          size="sm"
                          colorScheme="primary"
                          bg="primary.100"
                        />
                      </VStack>
                      
                      {/* 炭水化物 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="secondary.100" p={2} borderRadius="md">
                              <Ionicons name="leaf-outline" size={20} color={Colors.secondary} />
                            </Box>
                            <Text fontWeight="medium" fontSize="md">炭水化物</Text>
                          </HStack>
                          <Text fontSize="md">{Math.round(macroBalance.carbsGrams)}g ({Math.round(macroBalance.carbsPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.carbsPercentage} 
                          size="sm"
                          colorScheme="secondary"
                          bg="secondary.100"
                        />
                      </VStack>
                      
                      {/* 脂質 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="yellow.100" p={2} borderRadius="md">
                              <Ionicons name="water-outline" size={20} color={Colors.accent} />
                            </Box>
                            <Text fontWeight="medium" fontSize="md">脂質</Text>
                          </HStack>
                          <Text fontSize="md">{Math.round(macroBalance.fatGrams)}g ({Math.round(macroBalance.fatPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.fatPercentage} 
                          size="sm"
                          colorScheme="yellow"
                          bg="yellow.100"
                        />
                      </VStack>
                    </VStack>
                  </VStack>
                </GlassCard>
              </HStack>
            ) : (
              // モバイル/タブレット: 縦並びレイアウト
              <>
                <GlassCard style={{ marginVertical: 16 }}>
                  <VStack space={4}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Heading size="md">カロリー進捗</Heading>
                      <Badge colorScheme={calorieStatus.color.split('.')[0]}>
                        {calorieStatus.text}
                      </Badge>
                    </HStack>
                    
                    <Progress
                      value={Math.min((totalNutrition.calories / (dailySummary?.goalCalories || 2000)) * 100, 100)}
                      size="lg"
                      colorScheme={calorieStatus.color.split('.')[0]}
                      bg="gray.200"
                    />
                    
                    <HStack justifyContent="center" alignItems="baseline">
                      <Heading size="lg">{Math.round(totalNutrition.calories)}</Heading>
                      <Text color="gray.500" ml={1}> / {dailySummary?.goalCalories || 2000} kcal</Text>
                    </HStack>
                  </VStack>
                </GlassCard>
              
                {/* マクロ栄養素バランス - モバイル */}
                <GlassCard style={{ marginBottom: 16 }}>
                  <VStack space={3}>
                    <Heading size="md">マクロ栄養素バランス</Heading>
                    <Text color="gray.500" mb={2}>栄養バランスを確認しましょう</Text>
                    
                    <VStack space={4}>
                      {/* タンパク質 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="primary.100" p={1} borderRadius="md">
                              <Ionicons name="fitness-outline" size={16} color={Colors.primary} />
                            </Box>
                            <Text fontWeight="medium">タンパク質</Text>
                          </HStack>
                          <Text>{Math.round(macroBalance.proteinGrams)}g ({Math.round(macroBalance.proteinPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.proteinPercentage} 
                          size="xs"
                          colorScheme="primary"
                          bg="primary.100"
                        />
                      </VStack>
                      
                      {/* 炭水化物 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="secondary.100" p={1} borderRadius="md">
                              <Ionicons name="leaf-outline" size={16} color={Colors.secondary} />
                            </Box>
                            <Text fontWeight="medium">炭水化物</Text>
                          </HStack>
                          <Text>{Math.round(macroBalance.carbsGrams)}g ({Math.round(macroBalance.carbsPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.carbsPercentage} 
                          size="xs"
                          colorScheme="secondary"
                          bg="secondary.100"
                        />
                      </VStack>
                      
                      {/* 脂質 */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <HStack alignItems="center" space={2}>
                            <Box bg="yellow.100" p={1} borderRadius="md">
                              <Ionicons name="water-outline" size={16} color={Colors.accent} />
                            </Box>
                            <Text fontWeight="medium">脂質</Text>
                          </HStack>
                          <Text>{Math.round(macroBalance.fatGrams)}g ({Math.round(macroBalance.fatPercentage)}%)</Text>
                        </HStack>
                        <Progress 
                          value={macroBalance.fatPercentage} 
                          size="xs"
                          colorScheme="yellow"
                          bg="yellow.100"
                        />
                      </VStack>
                    </VStack>
                  </VStack>
                </GlassCard>
              </>
            )}

          {/* アクションボタン */}
          {isDesktop ? (
            // デスクトップ: 4カラムグリッド
            <HStack space={3} mb={6}>
              <Button
                title="朝食を追加"
                onPress={() => handleAddMeal('breakfast')}
                variant="primary"
                flex={1}
                leftIcon={<Ionicons name="sunny-outline" size={20} color="white" />}
              />
              <Button
                title="昼食を追加"
                onPress={() => handleAddMeal('lunch')}
                variant="primary"
                flex={1}
                leftIcon={<Ionicons name="restaurant-outline" size={20} color="white" />}
              />
              <Button
                title="夕食を追加"
                onPress={() => handleAddMeal('dinner')}
                variant="primary"
                flex={1}
                leftIcon={<Ionicons name="moon-outline" size={20} color="white" />}
              />
              <Button
                title="間食を追加"
                onPress={() => handleAddMeal('snack')}
                variant="outline"
                flex={1}
                leftIcon={<Ionicons name="cafe-outline" size={20} color={Colors.primary} />}
              />
            </HStack>
          ) : (
            // モバイル/タブレット: 2x2グリッド
            <VStack space={3} mb={6}>
              <HStack space={2}>
                <Button
                  title="朝食を追加"
                  onPress={() => handleAddMeal('breakfast')}
                  variant="primary"
                  flex={1}
                  leftIcon={<Ionicons name="sunny-outline" size={20} color="white" />}
                />
                <Button
                  title="昼食を追加"
                  onPress={() => handleAddMeal('lunch')}
                  variant="primary"
                  flex={1}
                  leftIcon={<Ionicons name="restaurant-outline" size={20} color="white" />}
                />
              </HStack>
              
              <HStack space={2}>
                <Button
                  title="夕食を追加"
                  onPress={() => handleAddMeal('dinner')}
                  variant="primary"
                  flex={1}
                  leftIcon={<Ionicons name="moon-outline" size={20} color="white" />}
                />
                <Button
                  title="間食を追加"
                  onPress={() => handleAddMeal('snack')}
                  variant="outline"
                  flex={1}
                  leftIcon={<Ionicons name="cafe-outline" size={20} color={Colors.primary} />}
                />
              </HStack>
            </VStack>
          )}

          {/* 今日の食事記録 */}
          {hasMeals && (
            <GlassCard style={{ marginBottom: 16 }}>
              <VStack space={3}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading size="md">今日の食事記録</Heading>
                  <Text color="gray.500" fontSize="sm">{dailySummary.meals.length}件</Text>
                </HStack>

                <VStack space={4}>
                  {Object.entries(groupedMeals).map(([mealType, meals]) => {
                    if (meals.length === 0) return null;

                    const mealTypeKey = mealType as MealRecord['mealType'];
                    const mealTotal = meals.reduce((sum, meal) => sum + meal.calories, 0);

                    return (
                      <VStack key={mealType} space={2}>
                        <HStack alignItems="center" space={2}>
                          <Box bg={`${getMealTypeColor(mealTypeKey).split('.')[0]}.100`} p={2} borderRadius="md">
                            <Ionicons 
                              name={getMealTypeIcon(mealTypeKey) as any} 
                              size={20} 
                              color={Colors.primary} 
                            />
                          </Box>
                          <VStack flex={1}>
                            <Text fontWeight="bold" fontSize="md">{getMealTypeLabel(mealTypeKey)}</Text>
                            <Text color="gray.500" fontSize="xs">{Math.round(mealTotal)} kcal</Text>
                          </VStack>
                        </HStack>

                        <VStack space={2} ml={12}>
                          {meals.map((meal, index) => (
                            <HStack key={meal.id} justifyContent="space-between" alignItems="center">
                              <VStack flex={1}>
                                <Text fontSize="sm">{meal.foodName}</Text>
                                <HStack space={2}>
                                  <Text color="gray.500" fontSize="xs">{meal.amount}g</Text>
                                  <Text color="gray.500" fontSize="xs">•</Text>
                                  <Text color="gray.500" fontSize="xs">{Math.round(meal.calories)} kcal</Text>
                                </HStack>
                              </VStack>
                              <Pressable 
                                onPress={() => handleDeleteMeal(meal.id)}
                                p={2}
                                borderRadius="full"
                                _pressed={{ bg: 'red.100' }}
                              >
                                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                              </Pressable>
                            </HStack>
                          ))}
                        </VStack>

                        {Object.keys(groupedMeals).indexOf(mealType) < Object.keys(groupedMeals).filter(key => groupedMeals[key as keyof typeof groupedMeals].length > 0).length - 1 && (
                          <Divider my={1} />
                        )}
                      </VStack>
                    );
                  })}
                </VStack>
              </VStack>
            </GlassCard>
          )}
          </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  </AnimatedBackground>
);
};
