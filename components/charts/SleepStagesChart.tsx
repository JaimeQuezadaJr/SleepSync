import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// Match the exact colors from the dashboard legendDots
const COLORS = {
  deep: '#1E88E5',    // Match legendDot backgroundColor
  rem: '#7E57C2',     // Match legendDot backgroundColor
  light: '#4CAF50',   // Match legendDot backgroundColor
};

interface SleepStagesChartProps {
  data: {
    deep: number;
    rem: number;
    light: number;
  };
}

export function SleepStagesChart({ data }: SleepStagesChartProps) {
  const chartData = {
    labels: ['Deep', 'REM', 'Light'],
    datasets: [{
      data: [data.deep, data.rem, data.light]
    }],
  };

  return (
    <BarChart
      data={chartData}
      width={Dimensions.get('window').width - 60}
      height={220}
      yAxisLabel=""
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 0, index = 0) => {
          const colors = [COLORS.deep, COLORS.rem, COLORS.light];
          return colors[index] || `rgba(0, 0, 0, ${opacity})`;
        },
        labelColor: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.7,
      }}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
      showValuesOnTopOfBars
      fromZero
      yAxisSuffix="%"
    />
  );
} 