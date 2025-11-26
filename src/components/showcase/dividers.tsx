import * as React from 'react';

import { Divider, View } from '@/components/ui';

import { Title } from './title';

export const Dividers = () => {
  return (
    <>
      <Title text="Dividers" />
      <View className="flex-col gap-4">
        <Divider />
        <Divider label="With Label" />
        <Divider label="With Label" variant="strong" />
        <Divider label="With Label" variant="muted" />
        <Divider label="With Label" variant="primary" />
        <Divider label="With Label" variant="danger" />
        <Divider label="With Label" variant="success" />
      </View>
    </>
  );
};
