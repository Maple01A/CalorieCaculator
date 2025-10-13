// くらしる・クックパッド風のモダンカラーパレット
export const Colors = {
  // プライマリカラー（温かみのあるオレンジ）
  primary: '#FF6B00',
  primaryLight: '#FF8A4C',
  primaryDark: '#E65100',
  primarySoft: '#FFF3E0',
  
  // セカンダリカラー（自然なグリーン）
  secondary: '#2E7D32',
  secondaryLight: '#4CAF50',
  secondaryDark: '#1B5E20',
  secondarySoft: '#E8F5E8',
  
  // アクセントカラー（鮮やかなイエロー）
  accent: '#FFB300',
  accentLight: '#FFC107',
  accentDark: '#FF8F00',
  accentSoft: '#FFF8E1',
  
  // 背景色（柔らかいニュートラル）
  background: '#FEFEFE',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  
  // テキストカラー（読みやすいコントラスト）
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  
  // ステータスカラー（直感的な色分け）
  success: '#10B981',
  successLight: '#34D399',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningSoft: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#F87171',
  errorSoft: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoSoft: '#EFF6FF',
  
  // ボーダーとディバイダー
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // シャドウ（自然な影）
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowLarge: 'rgba(0, 0, 0, 0.12)',
  shadowXLarge: 'rgba(0, 0, 0, 0.16)',
  
  // グラデーション（美しいグラデーション）
  gradientPrimary: ['#FF6B00', '#FF8A4C'],
  gradientSecondary: ['#2E7D32', '#4CAF50'],
  gradientAccent: ['#FFB300', '#FFC107'],
  gradientNeutral: ['#F8F9FA', '#FFFFFF'],
  
  // 特別な色（料理アプリらしい色）
  food: '#FF6B00',
  nutrition: '#2E7D32',
  recipe: '#8B5CF6',
  health: '#10B981',
} as const;

// テーマの型定義
export type ColorTheme = typeof Colors;
