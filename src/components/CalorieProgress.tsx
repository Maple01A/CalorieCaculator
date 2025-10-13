import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';

interface CalorieProgressProps {
  current: number;
  goal: number;
  size?: 'sm' | 'base' | 'lg';
  showDetails?: boolean;
  style?: any;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({
  current,
  goal,
  size = 'base',
  showDetails = true,
  style,
}) => {
  const percentage = Math.min((current / goal) * 100, 200);
  const remaining = Math.max(0, goal - current);
  
  const getStatusColor = () => {
    if (percentage < 90) return Colors.warning;
    if (percentage <= 110) return Colors.success;
    return Colors.error;
  };

  const getStatusText = () => {
    if (percentage < 90) return '目標まで';
    if (percentage <= 110) return '目標達成';
    return '目標超過';
  };

  const getProgressColors = () => {
    if (percentage < 90) return [Colors.warning, Colors.warningLight];
    if (percentage <= 110) return [Colors.success, Colors.successLight];
    return [Colors.error, Colors.errorLight];
  };

  const progressBarHeight = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const containerHeight = size === 'sm' ? 40 : size === 'lg' ? 80 : 60;

  return (
    <View style={[styles.container, { height: containerHeight }, style]}>
      {showDetails && (
        <View style={styles.header}>
          <Text style={styles.title}>カロリー進捗</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      )}
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { height: progressBarHeight }]}>
          <View
            style={[
              styles.progressBackground,
              { height: progressBarHeight, borderRadius: progressBarHeight / 2 }
            ]}
          />
          <LinearGradient
            colors={getProgressColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                height: progressBarHeight,
                borderRadius: progressBarHeight / 2,
              },
            ]}
          />
        </View>
        
        {showDetails && (
          <View style={styles.details}>
            <Text style={styles.currentText}>
              {Math.round(current)} kcal
            </Text>
            <Text style={styles.goalText}>
              / {goal} kcal
            </Text>
            {remaining > 0 && (
              <Text style={styles.remainingText}>
                (残り {Math.round(remaining)} kcal)
              </Text>
            )}
          </View>
        )}
      </View>
      
      {showDetails && (
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: getStatusColor() }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  
  title: {
    ...TextStyles.h4,
    color: Colors.text,
  },
  
  status: {
    ...TextStyles.captionBold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.surfaceVariant,
  },
  
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  progressBar: {
    position: 'relative',
    marginBottom: Spacing.base,
  },
  
  progressBackground: {
    backgroundColor: Colors.surfaceVariant,
    width: '100%',
  },
  
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  details: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  currentText: {
    ...TextStyles.h2,
    color: Colors.text,
    fontWeight: '700',
  },
  
  goalText: {
    ...TextStyles.bodyLarge,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  remainingText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  
  percentageContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  
  percentage: {
    ...TextStyles.bodyLarge,
    fontWeight: '700',
  },
});
