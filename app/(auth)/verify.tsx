import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';

export default function Verify() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Check Your Email
      </Text>
      
      <Text variant="bodyLarge" style={styles.message}>
        We've sent you a verification link. Please check your email and click the link to verify your account.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Button mode="contained" style={styles.button}>
          Return to Login
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    width: '100%',
  },
}); 