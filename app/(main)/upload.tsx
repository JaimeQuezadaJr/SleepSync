import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Banner, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../lib/auth';
import { sleepDataService } from '../../services/sleepData';
import { parseCSV } from '../../utils/csvParser';
import { useRouter } from 'expo-router';

export default function Upload() {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refreshDashboard() {
    try {
      // Check stored data
      console.log('Checking stored data...');
      await sleepDataService.checkStoredData(session?.user.id || '');
      
      // Navigate to dashboard
      router.push('/(main)/dashboard');
    } catch (e) {
      console.error('Refresh error:', e);
    }
  }

  async function handleFileSelect() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const parsedData = await parseCSV(result.assets[0].uri);
      console.log('Parsed CSV data:', parsedData);
      
      let successCount = 0;
      let errorCount = 0;

      for (const row of parsedData) {
        console.log('Uploading row:', row);
        const { data, error } = await sleepDataService.addSleepData(session?.user.id || '', row);
        console.log('Upload result:', { data, error });
        
        if (error) {
          console.error('Row upload error:', error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      setSuccess(`Successfully uploaded ${successCount} records. ${errorCount ? `Failed: ${errorCount}` : ''}`);
      
      // Force immediate data refresh
      if (successCount > 0) {
        setTimeout(() => {
          refreshDashboard();
        }, 1500);
      }
    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {error && (
        <Banner
          visible={true}
          actions={[{ label: 'Dismiss', onPress: () => setError(null) }]}
          icon="alert-circle"
        >
          {error}
        </Banner>
      )}

      {success && (
        <Banner
          visible={true}
          actions={[{ label: 'Dismiss', onPress: () => setSuccess(null) }]}
          icon="check-circle"
        >
          {success}
        </Banner>
      )}

      <Text variant="headlineMedium" style={styles.title}>Upload Sleep Data</Text>
      
      <Text variant="bodyMedium" style={styles.instructions}>
        Please upload your Oura CSV file. The file should contain daily sleep metrics including:
        {'\n\n'}
        • Sleep duration
        {'\n'}
        • Sleep stages (Deep, REM, Light)
        {'\n'}
        • Heart rate
        {'\n'}
        • Temperature deviation
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <Button 
          mode="contained" 
          onPress={handleFileSelect}
          style={styles.button}
        >
          Select CSV File
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  instructions: {
    marginBottom: 30,
    opacity: 0.7,
  },
  button: {
    marginTop: 'auto',
  },
  loader: {
    marginTop: 'auto',
    marginBottom: 16,
  },
}); 