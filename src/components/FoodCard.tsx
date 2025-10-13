import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Food } from '../types';
import { Card } from './Card';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';

interface FoodCardProps {
  food: Food;
  onPress?: (food: Food) => void;
  showNutrition?: boolean;
  style?: any;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  showNutrition = true,
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(food);
    }
  };

  return (
    <Card
      onPress={onPress ? handlePress : undefined}
      style={[styles.card, style]}
      padding="base"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {food.name}
          </Text>
          <Text style={styles.category}>
            {food.category}
          </Text>
        </View>
        
        {showNutrition && (
          <View style={styles.nutrition}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.caloriesPer100g}
              </Text>
              <Text style={styles.nutritionLabel}>kcal</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.protein}g
              </Text>
              <Text style={styles.nutritionLabel}>タンパク質</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.carbs}g
              </Text>
              <Text style={styles.nutritionLabel}>炭水化物</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.fat}g
              </Text>
              <Text style={styles.nutritionLabel}>脂質</Text>
            </View>
          </View>
        )}
        
        {food.imageUrl && (
          <Image
            source={{ uri: food.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.base,
  },
  
  content: {
    position: 'relative',
  },
  
  header: {
    marginBottom: Spacing.sm,
    paddingRight: 80, // 画像のスペースを確保
  },
  
  name: {
    ...TextStyles.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  
  category: {
    ...TextStyles.captionBold,
    color: Colors.primary,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  
  nutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Spacing.xs,
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
    fontSize: 11,
  },
  
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 70,
    height: 70,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceVariant,
  },
});
