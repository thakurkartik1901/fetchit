import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { queryClient } from './client';

export function APIProvider({ children }: { children: React.ReactNode }) {
  // useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
