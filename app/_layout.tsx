import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';
import { DataRefreshProvider } from '../lib/DataRefreshContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataRefreshProvider>
        <SafeAreaProvider>
          <PaperProvider>
            <Stack>
              <Stack.Screen 
                name="index" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="(auth)" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="(main)" 
                options={{ headerShown: false }} 
              />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </DataRefreshProvider>
    </AuthProvider>
  );
}
