import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { ButtonSizes, Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { TextStyles } from '../constants/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'filled' | 'text';
  size?: 'sm' | 'base' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
  rounded = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    rounded && styles.rounded,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={[buttonStyle, { pointerEvents: disabled || loading ? 'none' : 'auto' }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    ...Shadows.button,
    gap: Spacing.sm,
  },
  
  // バリアント別スタイル
  primary: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  filled: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 0,
  },
  text: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Shadows.none,
  },
  
  // サイズ別スタイル
  sm: {
    ...ButtonSizes.sm,
  },
  base: {
    ...ButtonSizes.base,
  },
  lg: {
    ...ButtonSizes.lg,
  },
  xl: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xl,
    minHeight: 56,
  },
  
  // 状態別スタイル
  disabled: {
    backgroundColor: Colors.textDisabled,
    borderColor: Colors.textDisabled,
    ...Shadows.none,
  },
  
  // 特別なスタイル
  fullWidth: {
    width: '100%',
  },
  rounded: {
    borderRadius: BorderRadius['2xl'],
  },
  
  // テキストスタイル
  text: {
    ...TextStyles.button,
    textAlign: 'center',
  },
  
  // バリアント別テキストスタイル
  primaryText: {
    color: Colors.textOnPrimary,
  },
  secondaryText: {
    color: Colors.textOnSecondary,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  filledText: {
    color: Colors.primary,
  },
  textText: {
    color: Colors.primary,
  },
  
  // サイズ別テキストスタイル
  smText: {
    ...TextStyles.buttonSmall,
  },
  baseText: {
    ...TextStyles.button,
  },
  lgText: {
    ...TextStyles.buttonLarge,
  },
  xlText: {
    ...TextStyles.buttonLarge,
    fontSize: 20,
  },
  
  // 状態別テキストスタイル
  disabledText: {
    color: Colors.textOnPrimary,
  },
});
