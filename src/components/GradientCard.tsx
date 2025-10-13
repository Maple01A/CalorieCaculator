import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { BorderRadius, Shadows } from '../constants/spacing';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  colors,
  style,
  variant = 'primary',
}) => {
  const getGradientColors = () => {
    if (colors) return colors;
    
    switch (variant) {
      case 'primary':
        return Colors.gradientPrimary;
      case 'secondary':
        return Colors.gradientSecondary;
      case 'accent':
        return Colors.gradientAccent;
      case 'neutral':
        return Colors.gradientNeutral;
      default:
        return Colors.gradientPrimary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  gradient: {
    padding: 20,
    minHeight: 120,
  },
});
