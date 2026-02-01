import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ベース幅（デザインの基準となる画面幅）
const BASE_WIDTH = 375; // iPhone SE/8のサイズを基準
const BASE_HEIGHT = 667;

/**
 * 画面幅に基づいてスケーリングされた値を返す
 */
export const scale = (size: number): number => {
  return (width / BASE_WIDTH) * size;
};

/**
 * 画面高さに基づいてスケーリングされた値を返す
 */
export const verticalScale = (size: number): number => {
  return (height / BASE_HEIGHT) * size;
};

/**
 * 控えめなスケーリング（大画面での過度な拡大を防ぐ）
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * デスクトップかどうかを判定
 */
export const isDesktop = (): boolean => {
  if (Platform.OS === 'web') {
    return width >= 1024;
  }
  return false;
};

/**
 * タブレットかどうかを判定
 */
export const isTablet = (): boolean => {
  return width >= 768 && width < 1024;
};

/**
 * モバイルかどうかを判定
 */
export const isMobile = (): boolean => {
  return width < 768;
};

/**
 * レスポンシブパディング
 */
export const responsivePadding = {
  xs: isMobile() ? 8 : isTablet() ? 12 : 16,
  sm: isMobile() ? 12 : isTablet() ? 16 : 20,
  md: isMobile() ? 16 : isTablet() ? 24 : 32,
  lg: isMobile() ? 24 : isTablet() ? 32 : 48,
  xl: isMobile() ? 32 : isTablet() ? 48 : 64,
};

/**
 * レスポンシブフォントサイズ
 */
export const responsiveFontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  base: moderateScale(14),
  md: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(30),
  '4xl': moderateScale(36),
};

/**
 * グリッドカラム数を画面サイズに応じて返す
 */
export const getGridColumns = (): number => {
  if (isDesktop()) return 4;
  if (isTablet()) return 3;
  return 2;
};

/**
 * 最大コンテンツ幅を返す（デスクトップ用）
 */
export const getMaxContentWidth = (): number | string => {
  if (isDesktop()) return 1200;
  return '100%';
};

/**
 * サイドバーの幅を返す
 */
export const getSidebarWidth = (): number => {
  if (isDesktop()) return 280;
  if (isTablet()) return 240;
  return 0;
};
