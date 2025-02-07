import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function Chat() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">AI Assistant</Text>
      <Text variant="bodyMedium" style={{ marginTop: 10, opacity: 0.7 }}>
        Chat with your sleep advisor
      </Text>
    </View>
  );
} 