import React, { useState, useEffect } from 'react';
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
  Badge
} from 'native-base';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
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
  const toast = useToast();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
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
        <Box px={4} py={2}>
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <VStack>
              <Heading size="xl">カロリー計算</Heading>
              <Text color="gray.500">今日の栄養摂取を管理しましょう</Text>
            </VStack>
            <Pressable onPress={handleViewSettings} p={2} bg="gray.100" borderRadius="full">
              <Ionicons name="settings-outline" size={24} color={Colors.text} />
            </Pressable>
          </HStack>
          
          {/* カロリー進捗カード */}
          <Card variant="elevated" rounded my={4}>
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
          </Card>
          
          {/* マクロ栄養素バランス */}
          <Card variant="elevated" rounded mb={4}>
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
          </Card>
          
          {/* 今日の食事 */}
          <Card variant="elevated" rounded mb={4}>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md">今日の食事</Heading>
                <Button 
                  title="履歴を見る" 
                  variant="text" 
                  size="sm" 
                  onPress={handleViewHistory} 
                />
              </HStack>
              
              {(!dailySummary || dailySummary.meals.length === 0) ? (
                <Center py={10}>
                  <Text color="gray.500" fontWeight="medium" mb={2}>
                    まだ食事記録がありません
                  </Text>
                  <Text color="gray.400" textAlign="center">
                    下のボタンから食事を追加しましょう
                  </Text>
                </Center>
              ) : (
                <VStack space={2} mt={2}>
                  {dailySummary.meals.map((meal) => (
                    <HStack 
                      key={meal.id} 
                      bg="gray.50" 
                      p={3} 
                      borderRadius="lg" 
                      justifyContent="space-between"
                      borderWidth={1}
                      borderColor="gray.200"
                    >
                      <VStack>
                        <Text fontWeight="semibold">{meal.foodName}</Text>
                        <Text color="gray.500" fontSize="xs">{meal.amount}g</Text>
                      </VStack>
                      <VStack alignItems="flex-end">
                        <Text color="primary.500" fontWeight="bold">
                          {Math.round(meal.calories)}
                        </Text>
                        <Text color="gray.500" fontSize="xs">kcal</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>
          
          {/* アクションボタン */}
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
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
