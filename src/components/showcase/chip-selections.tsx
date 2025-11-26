import * as React from 'react';

import { ChipSelection, Divider, View } from '@/components/ui';
import { Text } from '@/components/ui/text';

import { Title } from './title';

export const ChipSelections = () => {
  const options = [
    { label: 'ALL EVENTS', value: 'option1' },
    { label: 'IN PERSON', value: 'option2' },
    { label: 'TECHNOLOGY', value: 'option3' },
    { label: 'ART & DESIGN', value: 'option4' },
    { label: 'FOOD & DRINK', value: 'option5' },
    { label: 'HEALTH & FITNESS', value: 'option6' },
    { label: 'MUSIC', value: 'option7' },
    { label: 'SPORTS', value: 'option8' },
    { label: 'TRAVEL', value: 'option9' },
    { label: 'OTHER', value: 'option10' },
  ];
  const [singleValue, setSingleValue] = React.useState<string | null>(null);
  const [multipleValue, setMultipleValue] = React.useState<string[]>([]);
  return (
    <View className="flex-col gap-4">
      <Title text="Chip Selections" />
      <View className="flex-col gap-4">
        <ChipSelection
          mode="single"
          size="sm"
          options={options}
          value={singleValue}
          onChange={setSingleValue}
        />
        <Divider />
        <View className="flex-col gap-4">
          <Text>Single</Text>
          <ChipSelection
            mode="multiple"
            size="sm"
            options={options}
            value={multipleValue}
            onChange={setMultipleValue}
          />
        </View>
      </View>
      <Divider />
      <View className="flex-col gap-4">
        <Text>Multiple</Text>
        <View className="flex-col gap-4">
          <ChipSelection
            mode="multiple"
            options={options}
            layout="scroll"
            value={multipleValue}
            onChange={setMultipleValue}
          />
        </View>
      </View>
    </View>
  );
};
