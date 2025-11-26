import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Mask, Path, Rect } from 'react-native-svg';

export const PlaceholderVideo = (props: SvgProps) => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none" {...props}>
    <Rect width={120} height={120} fill="#EAF2FF" />
    <Rect x={40} y={40} width={40.0003} height={40} rx={20} fill="#B4DBFF" />
    <G clipPath="url(#clip0_258_5599)">
      <Mask
        id="mask0_258_5599"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={54}
        y={52}
        width={15}
        height={16}
      >
        <Path
          d="M67.2753 58.7083C68.2423 59.3306 68.2423 60.6694 67.2753 61.2917L57.2821 67.7225C56.1738 68.4357 54.667 67.6915 54.667 66.4308L54.667 53.5692C54.667 52.3085 56.1738 51.5643 57.2821 52.2775L67.2753 58.7083Z"
          fill="#B4DBFF"
        />
      </Mask>
      <G mask="url(#mask0_258_5599)">
        <Rect x={52} y={52} width={16.0003} height={16} fill="#EAF2FF" />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_258_5599">
        <Rect
          width={16.0003}
          height={16}
          fill="white"
          transform="translate(52 52)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
