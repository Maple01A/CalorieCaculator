import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { Food } from '../types';
import { validateFoodName, validateAmount, formatValidationErrors } from '../utils/validation';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (food: Food) => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState('その他');
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      loadCategories();
      resetForm();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const cats = await databaseService.getFoodCategories();
      setCategories([...cats, 'その他']);
    } catch (error) {
      console.error('カテゴリの読み込みに失敗しました:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setCategory('その他');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 食品名のバリデーション
    const nameValidation = validateFoodName(name);
    if (!nameValidation.isValid) {
      newErrors.name = formatValidationErrors(nameValidation.errors);
    }

    // カロリーのバリデーション
    const caloriesNum = parseFloat(calories);
    const caloriesValidation = validateAmount(caloriesNum);
    if (!caloriesValidation.isValid) {
      newErrors.calories = 'カロリーは0以上の数値を入力してください';
    }

    // タンパク質のバリデーション（任意）
    if (protein.trim() !== '') {
      const proteinNum = parseFloat(protein);
      if (isNaN(proteinNum) || proteinNum < 0) {
        newErrors.protein = 'タンパク質は0以上の数値を入力してください';
      }
    }

    // 炭水化物のバリデーション（任意）
    if (carbs.trim() !== '') {
      const carbsNum = parseFloat(carbs);
      if (isNaN(carbsNum) || carbsNum < 0) {
        newErrors.carbs = '炭水化物は0以上の数値を入力してください';
      }
    }

    // 脂質のバリデーション（任意）
    if (fat.trim() !== '') {
      const fatNum = parseFloat(fat);
      if (isNaN(fatNum) || fatNum < 0) {
        newErrors.fat = '脂質は0以上の数値を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('入力エラー', '入力内容を確認してください');
      return;
    }

    try {
      setSaving(true);

      const newFood: Omit<Food, 'id'> = {
        name: name.trim(),
        caloriesPer100g: parseFloat(calories),
        protein: protein.trim() !== '' ? parseFloat(protein) : 0,
        carbs: carbs.trim() !== '' ? parseFloat(carbs) : 0,
        fat: fat.trim() !== '' ? parseFloat(fat) : 0,
        category: category,
      };

      const foodId = await databaseService.addCustomFood(newFood);

      const savedFood: Food = {
        id: foodId,
        ...newFood,
      };

      Alert.alert('成功', '食品を登録しました', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess(savedFood);
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('食品の登録に失敗しました:', error);
      Alert.alert('エラー', '食品の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>食品を登録</Text>
              <Text style={styles.subtitle}>カスタム食品を追加</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>基本情報</Text>

            <Input
              label="食品名 *"
              placeholder="例: 自家製サラダ"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.categoryLabel}>カテゴリ</Text>
              <View style={styles.categoryValue}>
                <Text style={styles.categoryText}>{category}</Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>栄養成分（100gあたり）</Text>

            <Input
              label="カロリー (kcal) *"
              placeholder="例: 150"
              value={calories}
              onChangeText={setCalories}
              keyboardType="decimal-pad"
              error={errors.calories}
            />

            <View style={styles.macroRow}>
              <Input
                label="タンパク質 (g)"
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                error={errors.protein}
                style={styles.macroInput}
              />

              <Input
                label="炭水化物 (g)"
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                error={errors.carbs}
                style={styles.macroInput}
              />

              <Input
                label="脂質 (g)"
                placeholder="0"
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                error={errors.fat}
                style={styles.macroInput}
              />
            </View>
          </Card>

          <View style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
            <Text style={styles.noteText}>
              * は必須項目です。栄養成分の詳細は任意で入力できます。
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="キャンセル"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="登録する"
            onPress={handleSave}
            variant="primary"
            loading={saving}
            style={styles.saveButton}
          />
        </View>

        {/* カテゴリ選択モーダル */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.categoryModal}>
              <Text style={styles.categoryModalTitle}>カテゴリを選択</Text>
              <ScrollView style={styles.categoryList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryItem}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat && styles.categoryItemTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                    {category === cat && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },

  closeButton: {
    padding: Spacing.xs,
  },

  title: {
    ...TextStyles.h2,
    color: Colors.text,
  },

  subtitle: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },

  scrollView: {
    flex: 1,
  },

  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
  },

  sectionTitle: {
    ...TextStyles.h4,
    color: Colors.text,
    marginBottom: Spacing.base,
  },

  categorySelector: {
    marginBottom: Spacing.base,
  },

  categoryLabel: {
    ...TextStyles.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  categoryValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  categoryText: {
    ...TextStyles.body,
    color: Colors.text,
  },

  macroRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  macroInput: {
    flex: 1,
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.infoSoft,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.infoLight,
  },

  noteText: {
    ...TextStyles.caption,
    color: Colors.text,
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  cancelButton: {
    flex: 1,
  },

  saveButton: {
    flex: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryModal: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
  },

  categoryModalTitle: {
    ...TextStyles.h3,
    color: Colors.text,
    marginBottom: Spacing.base,
  },

  categoryList: {
    maxHeight: 300,
  },

  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  categoryItemText: {
    ...TextStyles.body,
    color: Colors.text,
  },

  categoryItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});