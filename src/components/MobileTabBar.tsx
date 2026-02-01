import React from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Box, HStack, Pressable, VStack, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface TabItem {
  route: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

interface MobileTabBarProps {
  tabs: TabItem[];
  currentRoute: string;
  onNavigate: (route: string) => void;
}

/**
 * モバイル用ボトムタブバー
 */
export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  tabs,
  currentRoute,
  onNavigate,
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile || Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  return (
    <Box style={styles.container}>
      <HStack justifyContent="space-around" alignItems="center" h={16}>
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.route;
          const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

          return (
            <Pressable
              key={tab.route}
              onPress={() => onNavigate(tab.route)}
              flex={1}
              alignItems="center"
              _pressed={{ opacity: 0.6 }}
            >
              <VStack alignItems="center" space={1}>
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isActive ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  fontSize="xs"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  color={isActive ? 'primary.500' : 'gray.500'}
                >
                  {tab.label}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});
