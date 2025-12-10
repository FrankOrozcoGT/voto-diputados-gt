import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionGuard } from './SessionGuard';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { IniciativasListaClient } from '@/features/iniciativas/IniciativasListaClient';
import type { Iniciativa } from '@/core/iniciativas/domain/models/Iniciativa';

interface QueryClientWrapperProps {
  initialData: Iniciativa[];
}

export function QueryClientWrapper({ initialData }: QueryClientWrapperProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionGuard>
        <IniciativasListaClient initialData={initialData} />
      </SessionGuard>
    </QueryClientProvider>
  );
}
