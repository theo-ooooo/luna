import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const Icons = {
  home:     'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  calendar: 'M4 5h16v15H4zM4 9h16M9 3v4M15 3v4',
  plus:     'M12 5v14M5 12h14',
  spark:    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z',
  user:     'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  arrow:    'M5 12h14M13 5l7 7-7 7',
  chev:     'M9 6l6 6-6 6',
  chevDn:   'M6 9l6 6 6-6',
  chevUp:   'M6 15l6-6 6 6',
  heart:    'M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z',
  thermo:   'M14 14V5a2 2 0 10-4 0v9a4 4 0 104 0z',
  bell:     'M6 16V11a6 6 0 0112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0',
  send:     'M3 11l18-8-7 19-3-8-8-3z',
  check:    'M5 12l5 5L20 7',
  close:    'M6 6l12 12M18 6L6 18',
  search:   'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  dots:     'M5 12h.01M12 12h.01M19 12h.01',
  edit:     'M4 20h4l11-11-4-4L4 16v4zM14 5l4 4',
  drop:     'M12 3l5 7a6 6 0 11-10 0l5-7z',
} as const;

export type IconName = keyof typeof Icons;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.8, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={Icons[name]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
