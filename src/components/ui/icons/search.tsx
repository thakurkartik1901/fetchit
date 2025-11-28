import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import colors from '../tokens/colors';

export const Search = ({
  color = colors.neutral[400],
  ...props
}: SvgProps): React.ReactElement => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Mask
      id="mask0_136_9995"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.42701 0.333313C3.06418 0.333313 0.333344 3.03771 0.333344 6.37954C0.333344 9.72137 3.06418 12.4258 6.42701 12.4258C7.68076 12.4258 8.847 12.0497 9.81629 11.405L13.7917 15.3476C14.2206 15.773 14.9149 15.773 15.3438 15.3476C15.7743 14.9207 15.7743 14.2274 15.3438 13.8005L11.3939 9.8831C12.1032 8.89485 12.5207 7.68529 12.5207 6.37954C12.5207 3.03771 9.78985 0.333313 6.42701 0.333313ZM2.53118 6.37954C2.53118 4.24976 4.2728 2.51853 6.42701 2.51853C8.58123 2.51853 10.3228 4.24976 10.3228 6.37954C10.3228 8.50932 8.58123 10.2405 6.42701 10.2405C4.2728 10.2405 2.53118 8.50932 2.53118 6.37954Z"
        fill={color}
      />
    </Mask>
    <G mask="url(#mask0_136_9995)">
      <Rect width={24} height={24} fill={color} />
    </G>
  </Svg>
);
