import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

// シンプルなアイコンコンポーネント（絵文字ベース）
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = Colors.text,
  style,
}) => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      // 食事関連
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
      food: '🍽️',
      calories: '🔥',
      
      // 栄養素
      protein: '💪',
      carbs: '🌾',
      fat: '🥑',
      nutrition: '🥗',
      
      // アクション
      add: '➕',
      settings: '⚙️',
      history: '📊',
      chart: '📈',
      check: '✅',
      close: '❌',
      
      // その他
      home: '🏠',
      user: '👤',
      heart: '❤️',
      star: '⭐',
      fire: '🔥',
      water: '💧',
    };
    
    return icons[iconName] || '❓';
  };

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color,
        },
        style,
      ]}
    >
      {getIcon(name)}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
