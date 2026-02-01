import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Box, HStack, Heading, Text, Pressable } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

/**
 * モバイル用ヘッダー（コンパクトデザイン）
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null;
  }

  return (
    <Box style={styles.container}>
      <HStack justifyContent="space-between" alignItems="center" px={4} py={3}>
        {/* 左アクション */}
        {leftAction ? (
          <Pressable
            onPress={leftAction.onPress}
            p={2}
            borderRadius="full"
            _pressed={{ bg: 'gray.100' }}
          >
            <Ionicons name={leftAction.icon as any} size={24} color={Colors.text} />
          </Pressable>
        ) : (
          <Box w={10} />
        )}

        {/* タイトル */}
        <Box flex={1} alignItems="center">
          <Heading size="md" textAlign="center">
            {title}
          </Heading>
          {subtitle && (
            <Text color="gray.500" fontSize="xs" textAlign="center">
              {subtitle}
            </Text>
          )}
        </Box>

        {/* 右アクション */}
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            p={2}
            borderRadius="full"
            _pressed={{ bg: 'gray.100' }}
          >
            <Ionicons name={rightAction.icon as any} size={24} color={Colors.text} />
          </Pressable>
        ) : (
          <Box w={10} />
        )}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
