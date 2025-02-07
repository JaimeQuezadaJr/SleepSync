import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface TemperatureChartProps {
  data: {
    date: string;
    temp: number;
  }[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => d.temp)
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
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(48, 209, 88, ${opacity})`,
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