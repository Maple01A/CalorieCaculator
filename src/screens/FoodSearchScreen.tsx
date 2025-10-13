import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { FoodCard } from '../components/FoodCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food } from '../types';

interface FoodSearchScreenProps {
  navigation: any;
}

export const FoodSearchScreen: React.FC<FoodSearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('エラー', '検索キーワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await databaseService.searchFoods(searchQuery.trim());
      setFoods(results);
    } catch (error) {
      console.error('食品検索に失敗しました:', error);
      Alert.alert('エラー', '食品の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: Food) => {
    navigation.navigate('FoodDetail', { food });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFoods([]);
    setHasSearched(false);
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <FoodCard
      food={item}
      onPress={handleFoodSelect}
      showNutrition={true}
    />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>検索中...</Text>
        </View>
      );
    }

    if (hasSearched && foods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>該当する食品が見つかりませんでした</Text>
          <Text style={styles.emptySubtext}>
            別のキーワードで検索してみてください
          </Text>
          <Button
            title="検索をクリア"
            onPress={handleClearSearch}
            variant="outline"
            style={styles.clearButton}
          />
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>食品を検索してください</Text>
          <Text style={styles.emptySubtext}>
            食品名やカテゴリで検索できます
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>食品検索</Text>
        <Text style={styles.subtitle}>食べた食品を検索して記録しましょう</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="食品名を入力してください（例：白米、鶏胸肉）"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          rightIcon={
            <Button
              title="検索"
              onPress={handleSearch}
              variant="primary"
              size="sm"
            />
          }
        />
      </View>

      <FlatList
        data={foods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  
  searchInput: {
    marginBottom: 0,
  },
  
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
    marginBottom: Spacing.lg,
  },
  
  clearButton: {
    minWidth: 120,
  },
});
