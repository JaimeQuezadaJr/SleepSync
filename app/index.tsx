import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        SleepSync
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Track and analyze your sleep patterns
      </Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/login" asChild>
          <Button mode="contained" style={styles.button}>
            Login
          </Button>
        </Link>
        
        <Link href="/(auth)/signup" asChild>
          <Button mode="outlined" style={styles.button}>
            Sign Up
          </Button>
        </Link>
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 48,
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
}); 