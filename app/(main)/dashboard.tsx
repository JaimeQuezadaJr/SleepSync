import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Banner } from 'react-native-paper';
import { SleepStagesChart } from '../../components/charts/SleepStagesChart';
import { sleepDataService } from '../../services/sleepData';
import { useAuth } from '../../lib/auth';
import { SleepData } from '../../types/database';

export default function Dashboard() {
  const { session } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    console.log('Dashboard mounted, fetching data...');
    fetchSleepData();
  }, [session?.user.id]);

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

    // Sort data by date to ensure we have the latest first
    const sortedData = [...sleepData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log('Latest date:', sortedData[0].date);
    console.log('Previous date:', sortedData[1].date);

    const latestDay = sortedData[0];
    const previousDay = sortedData[1];

    return {
      sleepChange: (latestDay.sleep_duration || 0) - (previousDay.sleep_duration || 0),
      heartRateChange: (latestDay.resting_heart_rate || 0) - (previousDay.resting_heart_rate || 0),
      deepSleepPercentage: latestDay.sleep_duration 
        ? ((latestDay.deep_sleep_duration || 0) / latestDay.sleep_duration) * 100 
        : 0,
      averageBedtime: sortedData.reduce((acc, curr) => {
        const date = curr.bedtime_start ? new Date(curr.bedtime_start) : null;
        return date ? acc + date.getHours() + (date.getMinutes() / 60) : acc;
      }, 0) / sortedData.length,
    };
  }, [sleepData]);

  const mostRecentData = sleepData[0]; // First item should be most recent

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
        <Text variant="headlineMedium" style={styles.title}>Sleep Overview</Text>
        <Text variant="titleMedium" style={styles.dateHeader}>
          {new Date(mostRecentData?.date + 'T00:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
          })}
        </Text>
      </View>

      {/* Sleep Quality Metrics Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Sleep Quality Metrics</Text>
          <View style={styles.qualityStats}>
            <View style={styles.qualityStat}>
              <Text variant="labelMedium">Deep Sleep</Text>
              <Text variant="titleLarge">
                {(mostRecentData?.deep_sleep_duration || 0).toFixed(1)}h
              </Text>
            </View>
            <View style={styles.qualityStat}>
              <Text variant="labelMedium">REM Sleep</Text>
              <Text variant="titleLarge">
                {(mostRecentData?.rem_sleep_duration || 0).toFixed(1)}h
              </Text>
            </View>
            <View style={styles.qualityStat}>
              <Text variant="labelMedium">Light Sleep</Text>
              <Text variant="titleLarge">
                {(mostRecentData?.light_sleep_duration || 0).toFixed(1)}h
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Total Sleep</Text>
            <Text variant="displaySmall">
              {(mostRecentData?.sleep_duration || 0).toFixed(1)}h
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Avg Heart Rate</Text>
            <Text variant="displaySmall">
              {averageHeartRate.toFixed(0)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Daily Insights Card */}
      {insights && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Daily Insights</Text>
            <View style={styles.insightsContainer}>
              <Text style={styles.insight}>
                Sleep: {insights.sleepChange > 0 ? '↑' : '↓'} {Math.abs(insights.sleepChange).toFixed(1)}h
              </Text>
              <Text style={styles.insight}>
                Heart Rate: {insights.heartRateChange > 0 ? '↑' : '↓'} {Math.abs(insights.heartRateChange)}
              </Text>
              <Text style={styles.insight}>
                Deep Sleep: {insights.deepSleepPercentage.toFixed(1)}%
              </Text>
              <Text style={styles.insight}>
                Avg Bedtime: {Math.floor(insights.averageBedtime)}:
                {Math.round((insights.averageBedtime % 1) * 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Sleep Stages Distribution Chart */}
      <Card style={[styles.card, styles.stagesCard]}>
        <Card.Content>
          <Text variant="titleMedium">Sleep Stages Distribution</Text>
          <SleepStagesChart 
            data={{
              deep: ((mostRecentData?.deep_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1)) * 100,
              rem: ((mostRecentData?.rem_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1)) * 100,
              light: ((mostRecentData?.light_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1)) * 100,
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1E88E5' }]} />
              <Text>Deep ({((mostRecentData?.deep_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1) * 100).toFixed(1)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7E57C2' }]} />
              <Text>REM ({((mostRecentData?.rem_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1) * 100).toFixed(1)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text>Light ({((mostRecentData?.light_sleep_duration || 0) / (mostRecentData?.sleep_duration || 1) * 100).toFixed(1)}%)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  insightsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insight: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  qualityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  qualityStat: {
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateHeader: {
    opacity: 0.7,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stagesCard: {
    marginTop: 20,
  },
}); 