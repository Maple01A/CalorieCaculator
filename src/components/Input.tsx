import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import { InputSizes, Spacing, BorderRadius } from '../constants/spacing';
import { TextStyles } from '../constants/typography';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'base' | 'lg';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  disabled = false,
  size = 'base',
  style,
  inputStyle,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    disabled && styles.disabledInput,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={Colors.textDisabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  
  label: {
    ...TextStyles.bodySmall,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
  },
  
  // サイズ別スタイル
  sm: {
    ...InputSizes.sm,
  },
  base: {
    ...InputSizes.base,
  },
  lg: {
    ...InputSizes.lg,
  },
  
  // 状態別スタイル
  focused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.surfaceVariant,
    borderColor: Colors.textDisabled,
  },
  
  input: {
    flex: 1,
    ...TextStyles.body,
    color: Colors.text,
    padding: 0,
  },
  
  // サイズ別入力スタイル
  smInput: {
    ...TextStyles.bodySmall,
  },
  baseInput: {
    ...TextStyles.body,
  },
  lgInput: {
    ...TextStyles.body,
    fontSize: 18,
  },
  
  disabledInput: {
    color: Colors.textDisabled,
  },
  
  rightIcon: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  
  errorText: {
    ...TextStyles.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
