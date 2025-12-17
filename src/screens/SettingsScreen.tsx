import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { TextStyles } from '../constants/typography';
import { UserSettings } from '../types';
import { calculateRecommendedCalories } from '../utils/calorieCalculator';

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
          <Text style={styles.subtitle}>カロリー目標と個人情報を設定</Text>
        </View>

        {/* 基本情報 */}
        <Card style={styles.sectionCard}>
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
        </Card>

        {/* 性別 */}
        <Card style={styles.sectionCard}>
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
        </Card>

                {/* カロリー目標 */}
        <Card style={styles.sectionCard}>
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
        </Card>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    padding: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  
  sectionCard: {
    marginHorizontal: Spacing.lg,
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  saveButton: {
    marginTop: Spacing.base,
  },
});
