import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { cloudSyncService } from '../services/cloudSync';
import { databaseService } from '../services/database';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface LoginScreenProps {
  navigation: any;
  route?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const convertFromGuest = route?.params?.convertFromGuest || false;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(convertFromGuest); // ゲストからの変換時は新規登録モード
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadLastEmail();
  }, []);

  useEffect(() => {
    // ゲストからの変換時はログを出力
    if (convertFromGuest) {
      // ゲストからアカウント変換モード
    }
  }, [convertFromGuest]);

  const loadLastEmail = async () => {
    const lastEmail = await authService.getLastLoginEmail();
    if (lastEmail) {
      setEmail(lastEmail);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      
      // ログイン
      await authService.signInWithEmail(email.trim(), password);
      
      // クラウドからデータを復元
      await cloudSyncService.syncFromCloud();
      
      // 画面遷移前に少し待つ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ログイン成功後、ホーム画面に自動遷移
      navigation.navigate('Main', { 
        screen: 'Home',
        params: { refresh: Date.now() }
      });
    } catch (error: any) {
      console.error('ログインエラー:', error);
      Alert.alert('ログインエラー', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    if (password.length < 6) {
      Alert.alert('入力エラー', 'パスワードは6文字以上で設定してください');
      return;
    }

    try {
      setLoading(true);
      
      // ゲストからの変換か新規登録かで処理を分岐
      if (convertFromGuest) {
        await authService.convertGuestToUser(email.trim(), password, displayName.trim() || 'ユーザー');
        
        // ローカルデータをクラウドに同期（ゲストデータを保存）
        await cloudSyncService.syncToCloud();
        
        // ホーム画面に遷移
        navigation.navigate('Main', { screen: 'Home' });
      } else {
        await authService.signUpWithEmail(email.trim(), password, displayName.trim());
        
        // 新規登録の場合はローカルデータをクリアしてデフォルト状態にする
        await databaseService.clearAllMealRecords();
        await databaseService.resetUserSettings();
        
        // ホーム画面に遷移
        navigation.navigate('Main', { screen: 'Home' });
      }
    } catch (error: any) {
      console.error('登録エラー:', error);
      Alert.alert('登録エラー', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      setLoading(true);
      await authService.startAsGuest();
      
      // ゲストモード開始時もローカルデータを初期化
      await databaseService.clearAllMealRecords();
      await databaseService.resetUserSettings();
      
      // ホーム画面に遷移
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error: any) {
      Alert.alert('エラー', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Ionicons name="cloud-upload-outline" size={64} color="#007AFF" />
            <Text style={styles.title}>
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'データをクラウドに保存できます'
                : 'データを同期してどこからでもアクセス'}
            </Text>
          </View>

          <Card style={styles.card}>
            {isSignUp && (
              <Input
                label="表示名（任意）"
                placeholder="山田太郎"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
              />
            )}

            <Input
              label="メールアドレス"
              placeholder="example@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="パスワード"
              placeholder="6文字以上"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title={isSignUp ? 'アカウント作成' : 'ログイン'}
              onPress={isSignUp ? handleSignUp : handleLogin}
              variant="primary"
              loading={loading}
              style={styles.button}
            />
          </Card>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントをお持ちでない方'}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchLink}>
                {isSignUp ? 'ログイン' : 'アカウント作成'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  guestCard: {
    marginTop: 24,
    marginBottom: 16,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  guestDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  noteText: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
});
