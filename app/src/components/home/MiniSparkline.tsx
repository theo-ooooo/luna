import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { Colors } from '../../theme/tokens';

interface MiniSparklineProps {
  data: number[];
  min?: number;
  max?: number;
  color?: string;
  height?: number;
}

export function MiniSparkline({
  data,
  min = 36.2,
  max = 36.8,
  color = Colors.coral,
  height = 28,
}: MiniSparklineProps) {
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ marginTop: 4 }}>
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
