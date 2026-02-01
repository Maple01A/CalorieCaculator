import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { HStack, VStack, Text, Box, Avatar } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface DesktopNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  user?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  } | null;
}

const NAV_ITEMS = [
  { route: 'Home', label: 'ホーム', icon: 'home-outline' },
  { route: 'History', label: '履歴', icon: 'calendar-outline' },
  { route: 'AddMeal', label: '食事追加', icon: 'add-circle-outline' },
  { route: 'Settings', label: '設定', icon: 'settings-outline' },
];

/**
 * デスクトップ用サイドナビゲーションバー
 */
export const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
  currentRoute,
  onNavigate,
  user,
}) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop || Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <VStack space={2} flex={1} p={4}>
        {/* ロゴ/ブランド */}
        <Box mb={6} mt={2}>
          <HStack space={3} alignItems="center">
            <Box bg="primary.500" p={3} borderRadius="xl">
              <Ionicons name="nutrition-outline" size={32} color="white" />
            </Box>
            <VStack>
              <Text fontSize="xl" fontWeight="bold" color="primary.500">
                CalorieCal
              </Text>
              <Text fontSize="xs" color="gray.500">
                栄養管理アプリ
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* ナビゲーションアイテム */}
        <VStack space={2} flex={1}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <Pressable
                key={item.route}
                onPress={() => onNavigate(item.route)}
                style={({ hovered }) => [
                  styles.navItem,
                  isActive && styles.navItemActive,
                  hovered && !isActive && styles.navItemHover,
                ]}
              >
                <HStack space={3} alignItems="center">
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    fontSize="md"
                    fontWeight={isActive ? 'bold' : 'medium'}
                    color={isActive ? 'primary.500' : 'gray.600'}
                  >
                    {item.label}
                  </Text>
                </HStack>
              </Pressable>
            );
          })}
        </VStack>

        {/* ユーザー情報 */}
        {user && (
          <Box
            bg="gray.100"
            p={3}
            borderRadius="lg"
            mt={4}
          >
            <HStack space={3} alignItems="center">
              <Avatar
                size="sm"
                source={{ uri: user.photoURL || undefined }}
                bg="primary.500"
              >
                {user.displayName?.charAt(0) || 'U'}
              </Avatar>
              <VStack flex={1}>
                <Text fontSize="sm" fontWeight="bold" numberOfLines={1}>
                  {user.displayName || 'ユーザー'}
                </Text>
                <Text fontSize="xs" color="gray.500" numberOfLines={1}>
                  {user.email || ''}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  navItem: {
    padding: 12,
    borderRadius: 12,
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  navItemHover: {
    backgroundColor: '#f5f5f5',
  },
});
