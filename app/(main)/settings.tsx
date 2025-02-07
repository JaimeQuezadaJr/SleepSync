import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../lib/auth';

export default function Settings() {
  const { signOut } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>Settings</Text>
      <Button 
        mode="contained" 
        onPress={signOut}
        style={{ marginTop: 'auto' }}
      >
        Logout
      </Button>
    </View>
  );
} 