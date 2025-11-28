import * as React from 'react';

import { colors, SearchInput, View } from '@/components/ui';

import { Title } from './title';

export const SearchInputs = () => {
  return (
    <>
      <Title text="Search" />
      <View className="w-full max-w-md flex-col gap-4">
        <SearchInput
          placeholder="Search"
          size="sm"
          iconColor={colors.primary[600]}
        />
        <SearchInput
          placeholder="Search"
          size="md"
          iconColor={colors.primary[600]}
        />
        <SearchInput
          placeholder="Search"
          size="lg"
          iconColor={colors.primary[600]}
        />
      </View>
    </>
  );
};
