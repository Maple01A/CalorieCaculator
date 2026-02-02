import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/database';
import { authService } from '../services/auth';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { UserSettings } from '../types';
import { calculateRecommendedCalories } from '../utils/calorieCalculator';
import { useResponsive } from '../hooks/useResponsive';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<UserSettings>({
    dailyCalorieGoal: 2000,
    weight: 70,
    height: 170,
    age: 30,
    activityLevel: 'moderate',
    gender: 'male',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isMobile, isDesktop } = useResponsive();

  const currentUser = authService.getCurrentUser();
  const isGuest = authService.isGuestMode();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await databaseService.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      Alert.alert('エラー', '設定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await databaseService.updateUserSettings(settings);
      Alert.alert(
        '成功',
        '設定を保存しました',
        [
          {
            text: 'OK',
            onPress: () => {
              // ホーム画面に戻る際、再読み込みフラグを渡す
              navigation.navigate('Home', { refresh: Date.now() });
            }
          }
        ]
      );
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      Alert.alert('エラー', '設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateGoal = () => {
    const recommended = calculateRecommendedCalories(settings);
    setSettings(prev => ({ ...prev, dailyCalorieGoal: recommended }));
  };

  const getGenderLabel = (gender: UserSettings['gender']) => {
    return gender === 'male' ? '男性' : '女性';
  };

  const handleConvertToUser = () => {
    console.log('🔄 アカウント作成ボタンが押されました');
    console.log('Navigation object:', navigation);
    
    if (!navigation) {
      console.error('Navigation is not available');
      Alert.alert('エラー', 'ページ遷移に失敗しました。アプリを再起動してください。');
      return;
    }
    
    Alert.alert(
      'アカウント作成',
      'ゲストデータをアカウントに移行します。メールアドレスとパスワードを設定してください。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'アカウント作成',
          onPress: () => {
            try {
              console.log('Loginスクリーンに遷移します');
              navigation.navigate('Login', { convertFromGuest: true });
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('エラー', 'ページ遷移に失敗しました');
            }
          },
        },
      ]
    );
  }

  const handleSignOut = async () => {
    Alert.alert(
      'ログアウト',
      isGuest ? 'ゲストモードを終了しますか？ローカルデータは保持されます。' : 'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              Alert.alert('完了', 'ログアウトしました');
            } catch (error: any) {
              Alert.alert('エラー', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AnimatedBackground variant="neutral">
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <ResponsiveContainer>
            <View style={styles.header}>
              <Text style={[styles.title, isDesktop && TextStyles.h1]}>設定</Text>
              <Text style={[styles.subtitle, isDesktop && { fontSize: 16 }]}>カロリー目標を設定しましょう</Text>
            </View>

            {/* アカウント情報 */}
            {currentUser && !isGuest && (
              <GlassCard style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <Ionicons 
                  name="person-circle-outline" 
                  size={48} 
                  color={Colors.primary} 
                />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>
                    {currentUser.displayName}
                  </Text>
                  {currentUser.email && (
                    <Text style={styles.accountEmail}>{currentUser.email}</Text>
                  )}
                </View>
              </View>

              <Button
                title="ログアウト"
                onPress={handleSignOut}
                variant="outline"
                size="sm"
                style={styles.signOutButton}
                leftIcon={<Ionicons name="log-out-outline" size={18} color={Colors.error} />}
              />
            </GlassCard>
            )}

            {/* 基本情報 */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>基本情報</Text>
          
          <View style={styles.basicInfoContainer}>
            <Input
              label="体重 (kg)"
              value={settings.weight.toString()}
              onChangeText={(text) => setSettings(prev => ({ ...prev, weight: parseFloat(text) || 0 }))}
              keyboardType="numeric"
              style={styles.basicInfoInput}
            />
            
            <Input
              label="身長 (cm)"
              value={settings.height.toString()}
              onChangeText={(text) => setSettings(prev => ({ ...prev, height: parseFloat(text) || 0 }))}
              keyboardType="numeric"
              style={styles.basicInfoInput}
            />
            
            <Input
              label="年齢 (歳)"
              value={settings.age.toString()}
              onChangeText={(text) => setSettings(prev => ({ ...prev, age: parseInt(text) || 0 }))}
              keyboardType="numeric"
              style={styles.basicInfoInput}
            />
          </View>
            </GlassCard>

            {/* 性別 */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>性別</Text>
          
          <View style={styles.genderContainer}>
            <Button
              title="男性"
              onPress={() => setSettings(prev => ({ ...prev, gender: 'male' }))}
              variant={settings.gender === 'male' ? 'primary' : 'outline'}
              style={styles.genderButton}
            />
            <Button
              title="女性"
              onPress={() => setSettings(prev => ({ ...prev, gender: 'female' }))}
              variant={settings.gender === 'female' ? 'primary' : 'outline'}
              style={styles.genderButton}
            />
          </View>
            </GlassCard>

            {/* カロリー目標 */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>カロリー目標</Text>
          
          <Input
            label="1日のカロリー目標"
            value={settings.dailyCalorieGoal.toString()}
            onChangeText={(text) => setSettings(prev => ({ ...prev, dailyCalorieGoal: parseInt(text) || 0 }))}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Button
            title="推奨値を計算"
            onPress={handleCalculateGoal}
            variant="outline"
            style={styles.calculateButton}
          />
          
              <Text style={styles.calculateNote}>
                現在の設定に基づいて推奨カロリーを計算します
              </Text>
            </GlassCard>

            {/* 保存ボタン */}
            <View style={styles.saveButtonContainer}>
              <Button
                title="設定を保存"
                onPress={handleSave}
                variant="primary"
                size="lg"
                loading={saving}
                style={styles.saveButton}
              />
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  header: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  sectionCard: {
    marginBottom: Spacing.base,
  },
  
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  
  basicInfoContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  basicInfoInput: {
    flex: 1,
  },
  
  input: {
    marginBottom: Spacing.base,
  },
  
  calculateButton: {
    marginBottom: Spacing.sm,
  },
  
  calculateNote: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  genderButton: {
    flex: 1,
  },
  
  saveButtonContainer: {
    paddingBottom: Spacing.xl,
  },
  
  saveButton: {
    marginTop: Spacing.base,
  },

  accountCard: {
    marginBottom: Spacing.base,
  },
  
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  
  accountInfo: {
    flex: 1,
  },
  
  accountName: {
    ...TextStyles.h3,
    color: Colors.text,
  },
  
  guestBadge: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  
  accountEmail: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  convertButton: {
    marginBottom: Spacing.sm,
  },
  
  signOutButton: {
    borderColor: Colors.error,
  },
});
