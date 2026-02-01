import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { getMaxContentWidth } from '../utils/responsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: number | string;
  centered?: boolean;
  padding?: number;
  style?: ViewStyle;
}

/**
 * レスポンシブコンテナ - デスクトップで最大幅を制限し、中央配置
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth,
  centered = true,
  padding,
  style,
}) => {
  const { isDesktop, isMobile } = useResponsive();

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxWidth ?? (isDesktop ? getMaxContentWidth() : '100%'),
    marginHorizontal: centered && isDesktop ? 'auto' : 0,
    paddingHorizontal: padding ?? (isMobile ? 16 : isDesktop ? 32 : 24),
  };

  return <View style={[containerStyle, style]}>{children}</View>;
};

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  style?: ViewStyle;
}

/**
 * レスポンシブグリッド
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  style,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const columnCount = isMobile
    ? columns.mobile ?? 1
    : isTablet
    ? columns.tablet ?? 2
    : columns.desktop ?? 3;

  return (
    <View
      style={[
        styles.grid,
        {
          gap: gap,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => (
        <View
          style={[
            styles.gridItem,
            {
              width: `${100 / columnCount - 2}%`,
              marginBottom: gap,
            },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  gridItem: {
    flexGrow: 0,
    flexShrink: 0,
  },
});

interface ResponsiveLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  style?: ViewStyle;
}

/**
 * サイドバー付きレスポンシブレイアウト（デスクトップのみ）
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 280,
  style,
}) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop || !sidebar) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.layout, style]}>
      {sidebarPosition === 'left' && (
        <View style={[styles.sidebar, { width: sidebarWidth }]}>{sidebar}</View>
      )}
      <View style={styles.mainContent}>{children}</View>
      {sidebarPosition === 'right' && (
        <View style={[styles.sidebar, { width: sidebarWidth }]}>{sidebar}</View>
      )}
    </View>
  );
};

const layoutStyles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
  },
});

Object.assign(styles, layoutStyles);
