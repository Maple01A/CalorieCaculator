# レスポンシブデザインガイド

このプロジェクトでは、モバイル、タブレット、デスクトップに対応したレスポンシブデザインを実装しています。

## 概要

- **モバイル**: 画面幅 < 768px
- **タブレット**: 画面幅 768px - 1023px  
- **デスクトップ**: 画面幅 ≥ 1024px

## 主要コンポーネント

### 1. Hooks

#### `useResponsive`
デバイスタイプとブレークポイントを取得するカスタムフック。

```tsx
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, width, deviceType } = useResponsive();
  
  return (
    <View>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </View>
  );
};
```

**利用可能なプロパティ:**
- `width`, `height`: 現在の画面サイズ
- `deviceType`: 'mobile' | 'tablet' | 'desktop'
- `breakpoint`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `isMobile`, `isTablet`, `isDesktop`: デバイスタイプのブール値
- `isXs`, `isSm`, `isMd`, `isLg`, `isXl`: ブレークポイントのブール値
- `isSmUp`, `isMdUp`, `isLgUp`, `isXlUp`: 以上のチェック

### 2. レスポンシブユーティリティ

#### `src/utils/responsive.ts`

```tsx
import { scale, moderateScale, responsivePadding, getGridColumns } from '../utils/responsive';

// スケーリング
const fontSize = moderateScale(16); // 画面サイズに応じた適度なスケーリング

// レスポンシブパディング
const padding = responsivePadding.md; // モバイル: 16, タブレット: 24, デスクトップ: 32

// グリッドカラム数
const columns = getGridColumns(); // モバイル: 2, タブレット: 3, デスクトップ: 4
```

### 3. レスポンシブコンポーネント

#### `ResponsiveContainer`
デスクトップで最大幅を制限し、中央配置するコンテナ。

```tsx
import { ResponsiveContainer } from '../components/ResponsiveContainer';

<ResponsiveContainer maxWidth={1200}>
  <YourContent />
</ResponsiveContainer>
```

#### `ResponsiveGrid`
画面サイズに応じてカラム数が変わるグリッドレイアウト。

```tsx
import { ResponsiveGrid } from '../components/ResponsiveContainer';

<ResponsiveGrid 
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap={16}
>
  <Card />
  <Card />
  <Card />
</ResponsiveGrid>
```

#### `ResponsiveLayout`
サイドバー付きレイアウト（デスクトップのみ）。

```tsx
import { ResponsiveLayout } from '../components/ResponsiveContainer';

<ResponsiveLayout
  sidebar={<Sidebar />}
  sidebarPosition="left"
  sidebarWidth={280}
>
  <MainContent />
</ResponsiveLayout>
```

### 4. デバイス専用コンポーネント

#### デスクトップ専用

**DesktopNavBar**: サイドナビゲーションバー
```tsx
import { DesktopNavBar } from '../components/DesktopNavBar';

<DesktopNavBar
  currentRoute="Home"
  onNavigate={(route) => navigation.navigate(route)}
  user={currentUser}
/>
```

**DesktopHeader**: ヘッダーバー
```tsx
import { DesktopHeader } from '../components/DesktopHeader';

<DesktopHeader
  title="ホーム"
  subtitle="今日の栄養摂取を管理しましょう"
  actions={<Button />}
/>
```

#### モバイル専用

**MobileHeader**: コンパクトヘッダー
```tsx
import { MobileHeader } from '../components/MobileHeader';

<MobileHeader
  title="ホーム"
  subtitle="今日"
  leftAction={{ icon: 'menu-outline', onPress: openMenu }}
  rightAction={{ icon: 'settings-outline', onPress: openSettings }}
/>
```

**MobileTabBar**: ボトムタブバー
```tsx
import { MobileTabBar } from '../components/MobileTabBar';

const tabs = [
  { route: 'Home', label: 'ホーム', icon: 'home-outline', activeIcon: 'home' },
  { route: 'History', label: '履歴', icon: 'calendar-outline', activeIcon: 'calendar' },
];

<MobileTabBar
  tabs={tabs}
  currentRoute={currentRoute}
  onNavigate={(route) => navigation.navigate(route)}
/>
```

## 実装例

### 条件分岐レイアウト

```tsx
import { useResponsive } from '../hooks/useResponsive';

const MyScreen = () => {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <ResponsiveContainer>
      {isDesktop ? (
        // デスクトップ: 2カラムレイアウト
        <HStack space={4}>
          <Card flex={1}>左カード</Card>
          <Card flex={1}>右カード</Card>
        </HStack>
      ) : (
        // モバイル: 縦並びレイアウト
        <VStack space={4}>
          <Card>上カード</Card>
          <Card>下カード</Card>
        </VStack>
      )}
    </ResponsiveContainer>
  );
};
```

### レスポンシブフォントサイズ

```tsx
import { responsiveFontSize } from '../utils/responsive';

<Text fontSize={isDesktop ? 'xl' : 'md'}>
  タイトル
</Text>

// または直接スケーリング
<Text style={{ fontSize: responsiveFontSize.lg }}>
  タイトル
</Text>
```

### レスポンシブスペーシング

```tsx
import { responsivePadding } from '../utils/responsive';

<Box 
  px={isMobile ? 4 : isDesktop ? 8 : 6}
  py={responsivePadding.md}
>
  コンテンツ
</Box>
```

## ブレークポイント

プロジェクトでは以下のブレークポイントを使用しています（Tailwind CSS準拠）:

| ブレークポイント | 最小幅 | 用途 |
|------------------|--------|------|
| xs | 0px | 小型スマートフォン |
| sm | 640px | スマートフォン（横向き） |
| md | 768px | タブレット（縦向き） |
| lg | 1024px | タブレット（横向き）、ノートPC |
| xl | 1280px | デスクトップ、大画面 |

## ベストプラクティス

1. **モバイルファースト**: まずモバイルUIを設計し、その後デスクトップ用に拡張
2. **条件分岐**: 大きく異なるレイアウトは条件分岐で実装
3. **useResponsive**: デバイスタイプの判定には必ず`useResponsive`を使用
4. **ResponsiveContainer**: コンテンツは基本的に`ResponsiveContainer`で囲む
5. **テスト**: すべてのデバイスサイズでテストする

## テスト方法

### Webブラウザ
1. `npm run web` で開発サーバー起動
2. ブラウザの開発者ツールでデバイスエミュレーション
3. 画面幅を変更してレスポンシブ動作を確認

### エミュレーター/シミュレーター
- iOS: `npm run ios`
- Android: `npm run android`

## トラブルシューティング

### レイアウトが崩れる場合
1. `useResponsive`が正しくインポートされているか確認
2. 条件分岐のロジックを確認
3. ブラウザのコンソールでエラーを確認

### パフォーマンス問題
- `useResponsive`は各コンポーネントで1回だけ呼び出す
- 不要な再レンダリングを避けるため、`useMemo`や`useCallback`を活用

## 今後の拡張

- [ ] タブレット専用レイアウトの追加
- [ ] ランドスケープモードの最適化
- [ ] フォールディングデバイスのサポート
- [ ] アニメーション効果の追加
