import * as React from 'react';

import { Accordion, Divider, Text, View } from '@/components/ui';

import { ChipSelections } from './chip-selections';
import { Title } from './title';

export const Accordions = () => {
  return (
    <View className="flex-col gap-4">
      <Title text="Accordions" />
      <Accordion.Group allowMultiple={false}>
        <Accordion.Item title={<Text>Accordion 1</Text>}>
          <Text>Content 1</Text>
          <ChipSelections />
        </Accordion.Item>
        <Divider />
        <Accordion.Item title="Accordion 2">
          <Text>Content 2</Text>
        </Accordion.Item>
        <Divider />
        <Accordion.Item title="Accordion 3">
          <Text>Content 3</Text>
        </Accordion.Item>
        <Divider />
      </Accordion.Group>
    </View>
  );
};
