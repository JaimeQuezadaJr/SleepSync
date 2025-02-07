import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface SleepDurationChartProps {
  data: {
    date: string;
    duration: number;
  }[];
}

export function SleepDurationChart({ data }: SleepDurationChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => d.duration)
    }]
  };

  return (
    <LineChart
      data={chartData}
      width={Dimensions.get('window').width - 40}
      height={220}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(81, 45, 168, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
  );
} 