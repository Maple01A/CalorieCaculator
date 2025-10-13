import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { AppNavigator } from './src/navigation/AppNavigator';
import { databaseService } from './src/services/database';
import { Colors } from './src/constants/colors';
import { TextStyles } from './src/constants/typography';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// NativeBaseのテーマをカスタムカラーに合わせる
const theme = extendTheme({
  colors: {
    primary: {
      50: Colors.primarySoft,
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: Colors.primary,
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: Colors.primaryDark
    },
    secondary: {
      50: Colors.secondarySoft,
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: Colors.secondary,
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: Colors.secondaryDark
    },
    // 他のカラーも必要に応じて追加
    error: {
      500: Colors.error
    },
    warning: {
      500: Colors.warning
    },
    success: {
      500: Colors.success
    },
    info: {
      500: Colors.info
    }
  },
  fontConfig: {
    // フォント設定（必要に応じて）
  },
  components: {
    // コンポーネント固有のスタイル（必要に応じて）
  }
});

// SafeAreaContextの設定を追加
const config = {
  dependencies: {
    // NativeBaseとreact-native-safe-area-contextの競合を解決
    "linear-gradient": require('expo-linear-gradient').LinearGradient
  }
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await databaseService.initialize();
      setIsReady(true);
    } catch (error) {
      console.error('アプリの初期化に失敗しました:', error);
      setError('アプリの初期化に失敗しました');
    }
  };

  if (error) {
    return (
      <NativeBaseProvider theme={theme} config={config}>
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>
              アプリを再起動してください
            </Text>
          </View>
        </SafeAreaProvider>
      </NativeBaseProvider>
    );
  }

  if (!isReady) {
    return (
      <NativeBaseProvider theme={theme} config={config}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        </SafeAreaProvider>
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider theme={theme} config={config}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  
  errorText: {
    ...TextStyles.h3,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  errorSubtext: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
