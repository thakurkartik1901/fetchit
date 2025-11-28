import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import { isRTL } from '@/lib';

export const ArrowLeft = ({
  color = '#CCC',
  size = 24,
  style,
  ...props
}: SvgProps & { size?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
    style={StyleSheet.flatten([
      style,
      { transform: [{ scaleX: isRTL ? -1 : 1 }] },
    ])}
  >
    <Mask
      id="mask0_109_1875"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={5}
      y={0}
      width={15}
      height={24}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5494 0.939615C19.1515 1.5254 19.1515 2.47515 18.5494 3.06093L9.36156 12.0003L18.5494 20.9396C19.1515 21.5254 19.1515 22.4751 18.5494 23.0609C17.9474 23.6467 16.9712 23.6467 16.3691 23.0609L5.00098 12.0003L16.3691 0.939615C16.9712 0.353828 17.9474 0.353828 18.5494 0.939615Z"
        fill={color}
      />
    </Mask>
    <G mask="url(#mask0_109_1875)">
      <Rect
        x={0.000976562}
        y={-0.00164795}
        width={24}
        height={24}
        fill={color}
      />
    </G>
  </Svg>
);
