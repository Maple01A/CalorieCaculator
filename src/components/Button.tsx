import React from 'react';
import {
  Button as NBButton,
  IButtonProps,
  Text,
  HStack,
  Spinner
} from 'native-base';
import { Colors } from '../constants/colors';

interface ButtonProps extends Omit<IButtonProps, 'leftIcon'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'filled' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  flex?: number;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  fullWidth = false,
  rounded = false,
  flex,
  ...props
}) => {
  // NativeBaseのvariantに変換
  const getNBVariant = () => {
    switch (variant) {
      case 'primary': return 'solid';
      case 'secondary': return 'solid';
      case 'outline': return 'outline';
      case 'ghost': return 'ghost';
      case 'filled': return 'subtle';
      case 'text': return 'link';
      default: return 'solid';
    }
  };

  // NativeBaseのcolorSchemeに変換
  const getColorScheme = () => {
    return variant === 'secondary' ? 'secondary' : 'primary';
  };

  return (
    <NBButton
      onPress={onPress}
      variant={getNBVariant()}
      size={size}
      isDisabled={disabled}
      isLoading={loading}
      colorScheme={getColorScheme()}
      width={fullWidth ? "100%" : undefined}
      borderRadius={rounded ? "full" : undefined}
      flex={flex}
      leftIcon={leftIcon ? leftIcon : undefined}
      spinnerPlacement="start"
      isLoadingText={title}
      {...props}
    >
      {title}
    </NBButton>
  );
};
