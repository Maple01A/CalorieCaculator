import { Platform } from 'react-native';

// フォントサイズの定義
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// フォントウェイトの定義
export const FontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// 行間の定義
export const LineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// フォントファミリーの定義（モダンで読みやすいフォント）
export const FontFamilies = {
  // 日本語フォント（Android/iOSで異なる）
  japanese: Platform.select({
    ios: 'Hiragino Sans',
    android: 'Noto Sans CJK JP',
    default: 'system',
  }),
  // 英数字フォント
  english: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'system',
  }),
  // モノスペースフォント
  monospace: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
  // ヘッダー用フォント（より重厚感のあるフォント）
  heading: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'system',
  }),
  // ボディ用フォント（読みやすいフォント）
  body: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'system',
  }),
} as const;

// テキストスタイルの定義（くらしる・クックパッド風の美しいタイポグラフィ）
export const TextStyles = {
  // ヘッダー（より洗練されたスタイル）
  h1: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
    fontFamily: FontFamilies.heading,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
    fontFamily: FontFamilies.heading,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['2xl'] * LineHeights.normal,
    fontFamily: FontFamilies.heading,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.xl * LineHeights.normal,
    fontFamily: FontFamilies.heading,
  },
  
  // ボディテキスト（読みやすさを重視）
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.base * LineHeights.relaxed,
    fontFamily: FontFamilies.body,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.sm * LineHeights.relaxed,
    fontFamily: FontFamilies.body,
  },
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.lg * LineHeights.relaxed,
    fontFamily: FontFamilies.body,
  },
  
  // キャプション（控えめで読みやすい）
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.xs * LineHeights.normal,
    fontFamily: FontFamilies.body,
  },
  captionBold: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xs * LineHeights.normal,
    fontFamily: FontFamilies.body,
  },
  
  // ボタンテキスト（アクションを促すスタイル）
  button: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.base * LineHeights.normal,
    fontFamily: FontFamilies.body,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.sm * LineHeights.normal,
    fontFamily: FontFamilies.body,
    letterSpacing: 0.1,
  },
  buttonLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.lg * LineHeights.normal,
    fontFamily: FontFamilies.body,
    letterSpacing: 0.3,
  },
  
  // 特別なスタイル
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.sm * LineHeights.normal,
    fontFamily: FontFamilies.body,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xs * LineHeights.normal,
    fontFamily: FontFamilies.body,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// フォントサイズの型定義
export type FontSize = keyof typeof FontSizes;
export type FontWeight = keyof typeof FontWeights;
export type LineHeight = keyof typeof LineHeights;
export type TextStyle = keyof typeof TextStyles;
