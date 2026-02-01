import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Box, HStack, Heading, Pressable, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface DesktopHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * デスクトップ用ヘッダー
 */
export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop || Platform.OS !== 'web') {
    return null;
  }

  return (
    <Box style={styles.container}>
      <HStack justifyContent="space-between" alignItems="center" px={8} py={4}>
        <Box>
          <Heading size="xl">{title}</Heading>
          {subtitle && (
            <Text color="gray.500" fontSize="md" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
});
