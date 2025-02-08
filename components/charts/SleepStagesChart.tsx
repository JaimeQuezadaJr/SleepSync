import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

// Match the exact colors from the dashboard legendDots
const COLORS = {
  light: '#4CAF50',   // Light sleep (green)
  deep: '#FFB300',    // Deep sleep (yellow)
  rem: '#F44336',     // REM/Awakening (red)
};

interface SleepStagesChartProps {
  data: {
    deep: number;
    rem: number;
    light: number;
  };
}

export function SleepStagesChart({ data }: SleepStagesChartProps) {
  const width = Dimensions.get('window').width - 48; // Increased padding
  const height = 40;  // Thinner bar
  const padding = 0;  // Remove padding
  const barHeight = 8;  // Thinner bar

  const total = data.light + data.deep + data.rem;
  const lightWidth = (data.light / total) * (width - padding * 2);
  const deepWidth = (data.deep / total) * (width - padding * 2);
  const remWidth = (data.rem / total) * (width - padding * 2);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Light Sleep */}
        <Rect
          x={padding}
          y={(height - barHeight) / 2}
          width={lightWidth}
          height={barHeight}
          fill={COLORS.light}
          rx={4}
        />
        
        {/* Deep Sleep */}
        <Rect
          x={padding + lightWidth}
          y={(height - barHeight) / 2}
          width={deepWidth}
          height={barHeight}
          fill={COLORS.deep}
        />
        
        {/* REM Sleep */}
        <Rect
          x={padding + lightWidth + deepWidth}
          y={(height - barHeight) / 2}
          width={remWidth}
          height={barHeight}
          fill={COLORS.rem}
          rx={4}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 0,
  },
}); 