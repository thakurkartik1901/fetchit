import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export const Avatar = (props: SvgProps) => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none" {...props}>
    <G clipPath="url(#clip0_6_1263)">
      <Rect width={80} height={80} rx={32} fill="#EAF2FF" />
      <Path
        d="M10 65.7624C10 56.9258 17.1634 49.7624 26 49.7624H54C62.8366 49.7624 70 56.9258 70 65.7624V93.7624C70 102.599 62.8366 109.762 54 109.762H26C17.1634 109.762 10 102.599 10 93.7624V65.7624Z"
        fill="#B4DBFF"
      />
      <Circle cx={40} cy={28} r={16} fill="#B4DBFF" />
    </G>
    <Defs>
      <ClipPath id="clip0_6_1263">
        <Rect width={80} height={80} rx={32} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
