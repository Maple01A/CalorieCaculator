import React from 'react';
import {
  Box,
  IBoxProps,
  Pressable
} from 'native-base';
import { Colors } from '../constants/colors';

interface CardProps extends IBoxProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: 'sm' | 'base' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  rounded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  padding = 'base',
  variant = 'default',
  rounded = false,
  ...props
}) => {
  // パディングをNativeBaseの値に変換
  const getPadding = () => {
    switch (padding) {
      case 'sm': return 3;
      case 'base': return 4;
      case 'lg': return 5;
      case 'xl': return 6;
      default: return 4;
    }
  };

  // バリアントに基づくスタイル
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return {
          bg: 'white',
          borderWidth: 1,
          borderColor: 'gray.200',
          shadow: 2
        };
      case 'elevated':
        return {
          bg: 'white',
          shadow: 3
        };
      case 'outlined':
        return {
          bg: 'white',
          borderWidth: 1,
          borderColor: 'gray.300'
        };
      case 'filled':
        return {
          bg: 'gray.100'
        };
      case 'glass':
        return {
          bg: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
          shadow: 1
        };
      default:
        return {};
    }
  };

  const cardContent = (
    <Box
      p={getPadding()}
      borderRadius={rounded ? "2xl" : "lg"}
      overflow="hidden"
      {...getVariantStyle()}
      {...props}
    >
      {children}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.7 }}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};
