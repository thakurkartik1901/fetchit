import * as React from 'react';

import { View } from '../ui';
import { Badge } from '../ui/extended/badge';
import { Rate } from '../ui/icons/rate';
import { Title } from './title';

export const Badges = () => {
  return (
    <>
      <Title text="Badges" />
      <View className="flex-row flex-wrap gap-2">
        <Badge type="number" value={10} variant="primary" size="md" />
        <Badge
          type="icon"
          icon={<Rate width={14} height={14} color="white" />}
          variant="primary"
          size="md"
        />
        <Badge type="dot" variant="primary" size="md" />
      </View>
    </>
  );
};
