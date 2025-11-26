import * as React from 'react';

import { Buttons } from '@/components/showcase/buttons';
import { Colors } from '@/components/showcase/colors';
import { Inputs } from '@/components/showcase/inputs';
import { Typography } from '@/components/showcase/typography';
import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';

export default function Style() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
