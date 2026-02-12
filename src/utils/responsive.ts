import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * デスクトップかどうかを判定（内部用）
 */
const isDesktopScreen = (): boolean => {
  if (Platform.OS === 'web') {
    return width >= 1024;
  }
  return false;
};

/**
 * 最大コンテンツ幅を返す（デスクトップ用）
 */
export const getMaxContentWidth = (): number | string => {
  if (isDesktopScreen()) return 1200;
  return '100%';
};
