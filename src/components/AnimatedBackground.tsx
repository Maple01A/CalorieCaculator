import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  variant = 'primary',
}) => {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // フローティングアニメーション
    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // 回転アニメーション
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    const anim1 = createFloatingAnimation(floatAnim1, 3000, 0);
    const anim2 = createFloatingAnimation(floatAnim2, 4000, 1000);
    const anim3 = createFloatingAnimation(floatAnim3, 3500, 500);

    Animated.parallel([anim1, anim2, anim3, rotateAnimation]).start();
  }, []);

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#FFF5F0', '#FFFFFF'];
      case 'secondary':
        return ['#F0F9F0', '#FFFFFF'];
      case 'neutral':
        return ['#F8F9FA', '#FFFFFF'];
      default:
        return ['#FFFFFF', '#FFFFFF'];
    }
  };

  const float1Y = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const float2Y = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const float3Y = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* アニメーション要素 */}
      <Animated.View
        style={[
          styles.circle1,
          {
            transform: [
              { translateY: float1Y },
              { rotate },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.circle2,
          {
            transform: [{ translateY: float2Y }],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.circle3,
          {
            transform: [{ translateY: float3Y }],
          },
        ]}
      />

      {/* コンテンツ */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: Colors.primarySoft,
    opacity: 0.3,
  },
  circle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.secondarySoft,
    opacity: 0.2,
  },
  circle3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.3,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: Colors.accentSoft,
    opacity: 0.25,
  },
});
