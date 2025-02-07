import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

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
  const width = Dimensions.get('window').width - 60;
  const height = 220;
  const padding = 40;
  const barWidth = (width - padding * 2) / 3;

  const values = [data.deep, data.rem, data.light];
  const colors = [COLORS.deep, COLORS.rem, COLORS.light];
  const maxValue = Math.max(...values, 100);

  return (
    <View>
      <Svg width={width} height={height}>
        {values.map((value, index) => {
          const barHeight = (value / maxValue) * (height - padding * 2);
          const x = padding + index * barWidth;
          const y = height - padding - barHeight;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth - 10}
                height={barHeight}
                fill={colors[index]}
              />
              <SvgText
                x={x + (barWidth - 10) / 2}
                y={y - 15}
                textAnchor="middle"
                fill="black"
                fontSize="12"
              >
                {value.toFixed(1)}%
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
} 