// スペーシングの定義（8px基準のグリッドシステム）
export const Spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  base: 16, // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  '2xl': 40, // 2.5rem
  '3xl': 48, // 3rem
  '4xl': 64, // 4rem
  '5xl': 80, // 5rem
} as const;

// ボーダーラディウスの定義
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

import { Platform } from 'react-native';

// プラットフォーム固有のシャドウスタイル
const createShadow = (webBoxShadow: string, nativeShadow: any) => {
  if (Platform.OS === 'web') {
    return { boxShadow: webBoxShadow };
  }
  return nativeShadow;
};

// シャドウの定義（より自然で美しい影）
export const Shadows = {
  none: createShadow(
    'none',
    {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    }
  ),
  sm: createShadow(
    '0 1px 2px rgba(0, 0, 0, 0.04)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    }
  ),
  base: createShadow(
    '0 2px 4px rgba(0, 0, 0, 0.08)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }
  ),
  lg: createShadow(
    '0 4px 8px rgba(0, 0, 0, 0.12)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    }
  ),
  xl: createShadow(
    '0 8px 16px rgba(0, 0, 0, 0.16)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    }
  ),
  card: createShadow(
    '0 2px 6px rgba(0, 0, 0, 0.06)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    }
  ),
  button: createShadow(
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    }
  ),
} as const;

// アイコンサイズの定義
export const IconSizes = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

// ボタンサイズの定義
export const ButtonSizes = {
  sm: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 32,
  },
  base: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },
} as const;

// 入力フィールドサイズの定義
export const InputSizes = {
  sm: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  base: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },
} as const;

// スペーシングの型定義
export type SpacingSize = keyof typeof Spacing;
export type BorderRadiusSize = keyof typeof BorderRadius;
export type ShadowSize = keyof typeof Shadows;
export type IconSize = keyof typeof IconSizes;
export type ButtonSize = keyof typeof ButtonSizes;
export type InputSize = keyof typeof InputSizes;
