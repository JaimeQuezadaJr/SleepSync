import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface HeartRateChartProps {
  data: {
    date: string;
    rate: number;
  }[];
}

export function HeartRateChart({ data }: HeartRateChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => d.rate)
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
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 69, 58, ${opacity})`,
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