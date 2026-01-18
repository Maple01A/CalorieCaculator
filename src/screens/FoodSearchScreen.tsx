import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { FoodCard } from '../components/FoodCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AddFoodModal } from '../components/AddFoodModal';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food } from '../types';

interface FoodSearchScreenProps {
  navigation: any;
}

export const FoodSearchScreen: React.FC<FoodSearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // 初回表示時にすべての食品を読み込む
  useEffect(() => {
    loadAllFoods();
  }, []);

  // デバウンス用のタイマー
  useEffect(() => {
    // 検索クエリが空の場合はすべて表示
    if (searchQuery.trim() === '') {
      loadAllFoods();
      return;
    }

    // デバウンス: 300ms待ってから検索実行
    const debounceTimer = setTimeout(() => {
      handleRealtimeSearch(searchQuery.trim());
    }, 300);

    // クリーンアップ: 次の入力時に前のタイマーをキャンセル
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadAllFoods = async () => {
    try {
      setLoading(true);
      // すべての食品を取得（検索クエリなし）
      const results = await databaseService.searchFoods('');
      setFoods(results);
    } catch (error) {
      console.error('食品一覧の読み込みに失敗しました:', error);
      Alert.alert('エラー', '食品一覧の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeSearch = async (query: string) => {
    if (!query) {
      loadAllFoods();
      return;
    }

    try {
      setLoading(true);
      const results = await databaseService.searchFoods(query);
      setFoods(results);
    } catch (error) {
      console.error('食品検索に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: Food) => {
    navigation.navigate('FoodDetail', { food });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleAddFoodSuccess = (food: Food) => {
    // 新しく追加された食品を検索結果の先頭に追加
    setFoods(prev => [food, ...prev]);
    Alert.alert('成功', '食品を登録しました。続けて摂取量を入力できます。', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '摂取量を入力',
        onPress: () => handleFoodSelect(food),
      },
    ]);
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <FoodCard
      food={item}
      onPress={handleFoodSelect}
      showNutrition={true}
    />
  );

  const renderListHeader = () => {
    if (loading) return null;
    
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {searchQuery.trim() === '' 
            ? `全${foods.length}件の食品`
            : `${foods.length}件の検索結果`
          }
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>読み込み中...</Text>
        </View>
      );
    }

    if (searchQuery.trim() !== '' && foods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={Colors.textDisabled} />
          <Text style={styles.emptyText}>該当する食品が見つかりませんでした</Text>
          <Text style={styles.emptySubtext}>
            別のキーワードで検索するか、新しい食品を登録してください
          </Text>
          <View style={styles.emptyActions}>
            <Button
              title="検索をクリア"
              onPress={handleClearSearch}
              variant="outline"
              size="sm"
              style={styles.emptyButton}
            />
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color={Colors.surface} />
              <Text style={styles.emptyAddButtonText}>食品を登録</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (foods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color={Colors.textDisabled} />
          <Text style={styles.emptyText}>登録されている食品がありません</Text>
          <Text style={styles.emptySubtext}>
            最初の食品を登録してみましょう
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color={Colors.surface} />
            <Text style={styles.registerButtonText}>食品を登録</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.subtitle}>食品のカロリーを確認しましょう</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="食品名を入力してください（例：白米、鶏胸肉）"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          rightIcon={
            searchQuery.trim() !== '' ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ) : undefined
          }
        />
        {loading && (
          <View style={styles.searchingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.searchingText}>検索中...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={foods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
      />

      {/* フローティング登録ボタン */}
      {!showAddModal && foods.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={32} color={Colors.surface} />
        </TouchableOpacity>
      )}

      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddFoodSuccess}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    flex: 1,
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

  // 改善された登録ボタン（ヘッダー）
  addButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  addButtonIcon: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  addButtonText: {
    ...TextStyles.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  
  searchInput: {
    marginBottom: 0,
  },

  clearButton: {
    padding: Spacing.xs,
  },

  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },

  searchingText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },

  listHeader: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  listHeaderText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    paddingHorizontal: Spacing.lg,
  },
  
  emptyText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  
  emptySubtext: {
    ...TextStyles.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  emptyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  emptyButton: {
    minWidth: 120,
  },

  // 改善された登録ボタン（空の状態）
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
  },

  emptyAddButtonText: {
    ...TextStyles.body,
    color: Colors.surface,
    fontWeight: '600',
  },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  registerButtonText: {
    ...TextStyles.h4,
    color: Colors.surface,
    fontWeight: '700',
  },

  // フローティング登録ボタン
  floatingButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
});
