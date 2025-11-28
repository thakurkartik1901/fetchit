import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

export const User = ({ color = '#A8C5E8', ...props }: SvgProps) => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none" {...props}>
    <Circle cx={40} cy={40} r={40} fill="#E8F1FC" />
    <Circle cx={40} cy={30} r={14} fill={color} />
    <Path
      d="M15 72C15 58.745 25.745 48 39 48H41C54.255 48 65 58.745 65 72V90H15V72Z"
      fill={color}
    />
  </Svg>
);
