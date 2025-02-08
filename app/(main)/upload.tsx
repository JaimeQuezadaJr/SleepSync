import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Text, ActivityIndicator, Dialog, Portal, Menu } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../lib/auth';
import { sleepDataService } from '../../services/sleepData';
import { parseCSV } from '../../utils/csvParser';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SleepData } from '../../types/database';
import { useDataRefresh } from '../../lib/DataRefreshContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Upload() {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { triggerRefresh } = useDataRefresh();
  const [dateMenuVisible, setDateMenuVisible] = useState(false);

  useEffect(() => {
    fetchSleepData();
  }, []);

  async function fetchSleepData() {
    try {
      const { data, error } = await sleepDataService.fetchUserSleepData(session?.user.id || '');
      if (error) throw error;
      setSleepData(data || []);
    } catch (e) {
      console.error('Fetch error:', e);
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
      console.log('Parsed data:', parsedData);

      // Upload all data
      for (const row of parsedData) {
        await sleepDataService.addSleepData(session?.user.id || '', row);
      }

      // Get the most recent date from the uploaded data
      const mostRecentDate = parsedData[0]?.date;

      await fetchSleepData();
      triggerRefresh();
      
      // Store the date using AsyncStorage
      await AsyncStorage.setItem('lastUploadedDate', mostRecentDate);
      
      setSuccess('Data uploaded successfully!');
      setTimeout(() => {
        router.push('/(main)/dashboard');
      }, 1500);

    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(date: string) {
    try {
      setLoading(true);
      const { error } = await sleepDataService.deleteSleepData(session?.user.id || '', date);
      if (error) throw error;
      
      await fetchSleepData();
      triggerRefresh();
      setSuccess('Data deleted successfully!');
      setTimeout(() => setSuccess(null), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setDeleteDate(null);
    }
  }

  const handleOuraWebsitePress = async () => {
    try {
      await Linking.openURL('https://cloud.ouraring.com/trends');
    } catch (error) {
      setError('Could not open Oura website');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sync</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.uploadSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cloud-upload" size={48} color="#007AFF" />
          </View>
          <Text style={styles.uploadTitle}>Import Sleep Data</Text>
          <Text style={styles.uploadDescription}>
            Upload your CSV file from Oura Ring to track your sleep patterns. Please "Select all" data from today's date.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.ouraButton} 
          onPress={handleOuraWebsitePress}
        >
          <MaterialCommunityIcons name="open-in-new" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Go to Oura Ring</Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.messageContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#FF3B30" />
            <Text style={[styles.message, styles.errorMessage]}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.messageContainer}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#34C759" />
            <Text style={[styles.message, styles.successMessage]}>{success}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing your data...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.uploadButton, { marginTop: 12 }]}
            onPress={handleFileSelect}
          >
            <Text style={styles.buttonText}>Sync</Text>
          </TouchableOpacity>
        )}
      </View>

      {sleepData.length > 0 && (
        <View style={[styles.card, styles.dataCard]}>
          <Text style={styles.uploadTitle}>Manage Data</Text>

          <View style={styles.currentDataRow}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar" size={20} color="#86868B" />
              <Text style={styles.dateText}>
                {new Date(sleepData[0].date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC'
                })}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => setDeleteDate(sleepData[0].date)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {sleepData.length > 1 && (
            <Menu
              visible={dateMenuVisible}
              onDismiss={() => setDateMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => setDateMenuVisible(true)}
                >
                  <Text style={styles.viewMoreText}>View Previous Dates</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#007AFF" />
                </TouchableOpacity>
              }
            >
              {sleepData.slice(1).map((data) => (
                <Menu.Item
                  key={data.date}
                  onPress={() => {
                    setDeleteDate(data.date);
                    setDateMenuVisible(false);
                  }}
                  title={
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemDate}>
                        {new Date(data.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </Text>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF3B30" />
                    </View>
                  }
                />
              ))}
            </Menu>
          )}
        </View>
      )}

      <Portal>
        <Dialog visible={!!deleteDate} onDismiss={() => setDeleteDate(null)}>
          <Dialog.Title>Delete Data</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete the sleep data for {deleteDate}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setDeleteDate(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteDate && handleDelete(deleteDate)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    fontFamily: 'System',
  },
  uploadDescription: {
    fontSize: 15,
    color: '#86868B',
    textAlign: 'center',
    fontFamily: 'System',
    maxWidth: '80%',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'System',
  },
  errorMessage: {
    color: '#FF3B30',
  },
  successMessage: {
    color: '#34C759',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#86868B',
    fontFamily: 'System',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  dataCard: {
    marginTop: 16,
  },
  currentDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#1D1D1F',
    fontFamily: 'System',
  },
  deleteButton: {
    padding: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewMoreText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 16,
  },
  menuItemDate: {
    fontSize: 15,
    color: '#1D1D1F',
    fontFamily: 'System',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
    padding: 8,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
    padding: 8,
  },
  ouraButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
}); 