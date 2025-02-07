import React from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import type { TextInputProps } from 'react-native-paper';

type AuthInputProps = Omit<TextInputProps, 'error'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
};

export function AuthInput({ 
  label,
  value,
  onChangeText,
  error,
  style,
  ...props 
}: AuthInputProps) {
  return (
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={!!error}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    width: '100%',
  },
}); 