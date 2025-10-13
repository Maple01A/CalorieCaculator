import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { TextStyles } from '../constants/typography';

interface ModernCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'sm' | 'base' | 'lg';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  variant = 'default',
  padding = 'base',
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    style,
  ];

  const content = (
    <>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, { pointerEvents: 'auto' }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  
  default: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  
  elevated: {
    backgroundColor: Colors.surface,
    ...Shadows.lg,
  },
  
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Shadows.sm,
  },
  
  gradient: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    ...Shadows.card,
  },
  
  smPadding: {
    padding: Spacing.sm,
  },
  
  basePadding: {
    padding: Spacing.base,
  },
  
  lgPadding: {
    padding: Spacing.lg,
  },
  
  header: {
    marginBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
});
