import * as React from 'react';

import {
  Accordions,
  Badges,
  Buttons,
  ChipSelections,
  Colors,
  Dividers,
  Inputs,
  Typography,
} from '@/components/showcase';
import { SearchInputs } from '@/components/showcase/search-inputs';
import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';

export default function Style() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <SearchInputs />
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
          <Badges />
          <Dividers />
          <ChipSelections />
          <Accordions />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
