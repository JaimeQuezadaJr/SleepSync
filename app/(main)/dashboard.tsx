import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Banner, Menu } from 'react-native-paper';
import { SleepStagesChart } from '../../components/charts/SleepStagesChart';
import { sleepDataService } from '../../services/sleepData';
import { useAuth } from '../../lib/auth';
import { SleepData } from '../../types/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDataRefresh } from '../../lib/DataRefreshContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export default function Dashboard() {
  const { session } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateMenuVisible, setDateMenuVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();

  async function fetchSleepData() {
    try {
      setError(null);
      const { data, error } = await sleepDataService.fetchUserSleepData(session?.user.id || '');
      
      if (error) throw error;
      
      // Sort data by date in descending order (most recent first)
      const sortedData = data?.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }) || [];

      console.log('Dashboard data:', sortedData);
      setSleepData(sortedData);
    } catch (error: any) {
      setError(typeof error === 'string' ? error : error.message);
      console.error('Error fetching sleep data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Force data refresh when component mounts
  useEffect(() => {
    async function init() {
      console.log('Dashboard mounted or refresh triggered, fetching data...');
      await fetchSleepData();
      
      // Check for last uploaded date
      try {
        const lastUploadedDate = await AsyncStorage.getItem('lastUploadedDate');
        if (lastUploadedDate) {
          setSelectedDate(lastUploadedDate);
          await AsyncStorage.removeItem('lastUploadedDate'); // Clear it after use
        }
      } catch (e) {
        console.error('Error reading last uploaded date:', e);
      }
    }

    init();
  }, [session?.user.id, refreshTrigger]);

  // Add data monitoring
  useEffect(() => {
    if (sleepData.length > 0) {
      console.log('Current sleep data:', {
        dates: sleepData.map(d => d.date),
        mostRecent: sleepData[0],
      });
    }
  }, [sleepData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSleepData().finally(() => setRefreshing(false));
  }, []);

  const averageSleepDuration = sleepData.length
    ? sleepData.reduce((acc, curr) => acc + (curr.sleep_duration || 0), 0) / sleepData.length
    : 0;

  const averageHeartRate = sleepData.length
    ? sleepData.reduce((acc, curr) => acc + (curr.resting_heart_rate || 0), 0) / sleepData.length
    : 0;

  // Calculate additional insights
  const insights = React.useMemo(() => {
    if (sleepData.length < 2) return null;

    const sortedData = [...sleepData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const latestDay = sortedData[0];
    const previousDay = sortedData[1];

    return {
      sleepChange: (latestDay.sleep_duration || 0) - (previousDay.sleep_duration || 0),
      heartRateChange: (latestDay.resting_heart_rate || 0) - (previousDay.resting_heart_rate || 0),
      deepSleepChange: (latestDay.deep_sleep_duration || 0) - (previousDay.deep_sleep_duration || 0),
      remSleepChange: (latestDay.rem_sleep_duration || 0) - (previousDay.rem_sleep_duration || 0),
    };
  }, [sleepData]);

  const currentData = selectedDate 
    ? sleepData.find(data => data.date === selectedDate) 
    : sleepData[0];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setDateMenuVisible(false);
    
    // Find the data for the selected date
    const selectedDayData = sleepData.find(data => data.date === date);
    if (selectedDayData) {
      // Update mostRecentData to show the selected date's data
      const updatedData = [...sleepData];
      const index = updatedData.findIndex(data => data.date === date);
      if (index !== -1) {
        const [selected] = updatedData.splice(index, 1);
        updatedData.unshift(selected);
        setSleepData(updatedData);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sleepData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineMedium">No Sleep Data</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Upload your sleep data to see insights
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && (
        <Banner
          visible={true}
          actions={[{ label: 'Retry', onPress: fetchSleepData }]}
          icon="alert-circle"
        >
          {error}
        </Banner>
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Sleep</Text>
        <Menu
          visible={dateMenuVisible}
          onDismiss={() => setDateMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => setDateMenuVisible(true)}
            >
              <MaterialCommunityIcons name="calendar" size={18} color="#007AFF" />
              <Text style={styles.dateText}>
                {new Date((selectedDate || currentData?.date) + 'T00:00:00Z').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC'
                })}
              </Text>
            </TouchableOpacity>
          }
          style={styles.menu}
        >
          {sleepData.map((data) => (
            <Menu.Item
              key={data.date}
              onPress={() => handleDateSelect(data.date)}
              title={new Date(data.date + 'T00:00:00Z').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
              })}
              style={styles.menuItem}
            />
          ))}
        </Menu>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#007AFF" />
          <Text style={styles.statLabel}>Total Sleep</Text>
          <Text style={styles.statValue}>
            {formatDuration(currentData?.sleep_duration || 0)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="heart-outline" size={24} color="#FF2D55" />
          <Text style={styles.statLabel}>Heart Rate</Text>
          <Text style={styles.statValue}>
            {currentData?.resting_heart_rate || 0}
          </Text>
        </View>
      </View>

      {/* Daily Insights Card */}
      {insights && (
        <View style={styles.card}>
          <Text style={styles.insightTitle}>Daily Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="sleep" size={20} color="#007AFF" />
              <View>
                <Text style={styles.insightLabel}>Sleep Change</Text>
                <Text style={styles.insightValue}>
                  {insights.sleepChange > 0 ? '↑' : '↓'} {formatDuration(Math.abs(insights.sleepChange))}
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="heart" size={20} color="#FF2D55" />
              <View>
                <Text style={styles.insightLabel}>Heart Rate Change</Text>
                <Text style={styles.insightValue}>
                  {insights.heartRateChange > 0 ? '↑' : '↓'} {Math.abs(insights.heartRateChange)}
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#FFB300" />
              <View>
                <Text style={styles.insightLabel}>Deep Sleep Change</Text>
                <Text style={styles.insightValue}>
                  {insights.deepSleepChange > 0 ? '↑' : '↓'} {formatDuration(Math.abs(insights.deepSleepChange))}
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="sleep" size={20} color="#F44336" />
              <View>
                <Text style={styles.insightLabel}>REM Sleep Change</Text>
                <Text style={styles.insightValue}>
                  {insights.remSleepChange > 0 ? '↑' : '↓'} {formatDuration(Math.abs(insights.remSleepChange))}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Sleep Quality Metrics Card */}
      <View style={[styles.card, styles.stagesCard]}>
        <Text style={styles.insightTitle}>Sleep Quality Metrics</Text>
        <SleepStagesChart 
          data={{
            deep: ((currentData?.deep_sleep_duration || 0) / (currentData?.sleep_duration || 1)) * 100,
            rem: ((currentData?.rem_sleep_duration || 0) / (currentData?.sleep_duration || 1)) * 100,
            light: ((currentData?.light_sleep_duration || 0) / (currentData?.sleep_duration || 1)) * 100,
          }}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.labelRow}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.labelText}>Light</Text>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(currentData?.light_sleep_duration || 0)}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.labelRow}>
              <View style={[styles.legendDot, { backgroundColor: '#FFB300' }]} />
              <Text style={styles.labelText}>Deep</Text>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(currentData?.deep_sleep_duration || 0)}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.labelRow}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.labelText}>REM</Text>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(currentData?.rem_sleep_duration || 0)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: 'System',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    padding: 8,
    borderRadius: 18,
    gap: 6,
  },
  dateText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 15,
    color: '#86868B',
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'System',
  },
  statValue: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 4,
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    fontFamily: 'System',
  },
  insightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  insightItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightLabel: {
    fontSize: 13,
    color: '#86868B',
    fontWeight: '600',
    fontFamily: 'System',
  },
  insightValue: {
    fontSize: 17,
    color: '#1D1D1F',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'System',
  },
  stagesCard: {
    marginTop: 20,
    backgroundColor: '#ffffff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#1D1D1F',
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86868B',
    fontFamily: 'System',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  menu: {
    marginTop: 40,
  },
  menuItem: {
    minWidth: 150,
  },
}); 