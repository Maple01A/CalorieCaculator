import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveBreakpoints {
  xs: number;  // 0-639
  sm: number;  // 640-767
  md: number;  // 768-1023
  lg: number;  // 1024-1279
  xl: number;  // 1280+
}

// Tailwindに準拠したブレークポイント
export const BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;

  // デバイスタイプの判定
  const getDeviceType = (): DeviceType => {
    if (Platform.OS === 'web') {
      if (width >= BREAKPOINTS.lg) return 'desktop';
      if (width >= BREAKPOINTS.md) return 'tablet';
      return 'mobile';
    }
    // ネイティブアプリの場合
    if (width >= 768) return 'tablet';
    return 'mobile';
  };

  // ブレークポイント名の取得
  const getBreakpoint = (): BreakpointName => {
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  const deviceType = getDeviceType();
  const breakpoint = getBreakpoint();

  return {
    width,
    height,
    deviceType,
    breakpoint,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isWeb: Platform.OS === 'web',
    // ブレークポイントチェック
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    // 以上のチェック
    isSmUp: width >= BREAKPOINTS.sm,
    isMdUp: width >= BREAKPOINTS.md,
    isLgUp: width >= BREAKPOINTS.lg,
    isXlUp: width >= BREAKPOINTS.xl,
  };
};

// レスポンシブ値を返すヘルパー関数
export const responsive = <T,>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}, deviceType: DeviceType): T => {
  if (deviceType === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (deviceType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  if (deviceType === 'mobile' && values.mobile !== undefined) {
    return values.mobile;
  }
  return values.default;
};

// ブレークポイントベースのレスポンシブ値
export const responsiveBreakpoint = <T,>(
  values: Partial<Record<BreakpointName, T>> & { default: T },
  breakpoint: BreakpointName
): T => {
  return values[breakpoint] ?? values.default;
};
