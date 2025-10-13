import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'sm' | 'base' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  rounded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'base',
  variant = 'default',
  rounded = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    rounded && styles.rounded,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, { pointerEvents: 'auto' }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  
  // バリアント別スタイル
  default: {
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  elevated: {
    ...Shadows.lg,
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.none,
  },
  filled: {
    backgroundColor: Colors.surfaceVariant,
    ...Shadows.none,
    borderWidth: 0,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Shadows.sm,
  },
  
  // パディング別スタイル
  smPadding: {
    padding: Spacing.sm,
  },
  basePadding: {
    padding: Spacing.base,
  },
  lgPadding: {
    padding: Spacing.lg,
  },
  xlPadding: {
    padding: Spacing.xl,
  },
  
  // 特別なスタイル
  rounded: {
    borderRadius: BorderRadius['2xl'],
  },
});
