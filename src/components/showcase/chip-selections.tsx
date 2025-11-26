import * as React from 'react';

import { ChipSelection, Divider, View } from '@/components/ui';
import { Text } from '@/components/ui/text';

import { Title } from './title';

export const ChipSelections = () => {
  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Option 4', value: 'option4' },
    { label: 'Option 5', value: 'option5' },
    { label: 'Option 6', value: 'option6' },
    { label: 'Option 7', value: 'option7' },
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
