import React from 'react';
import {
  FormControl,
  Input as NBInput,
  IInputProps,
  Text,
  Box
} from 'native-base';

interface InputProps extends IInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
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
  size = 'md',
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  return (
    <FormControl isInvalid={!!error} isDisabled={disabled} mb={4} {...props}>
      {label && (
        <FormControl.Label>
          <Text fontWeight="medium">{label}</Text>
        </FormControl.Label>
      )}
      
      <Box flexDirection="row" alignItems="center">
        <NBInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          isDisabled={disabled}
          size={size}
          flex={1}
          InputRightElement={rightIcon}
          {...props}
        />
      </Box>
      
      {error && (
        <FormControl.ErrorMessage>
          {error}
        </FormControl.ErrorMessage>
      )}
    </FormControl>
  );
};
