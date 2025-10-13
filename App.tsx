import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { databaseService } from './src/services/database';
import { Colors } from './src/constants/colors';
import { TextStyles } from './src/constants/typography';

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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          アプリを再起動してください
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
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
