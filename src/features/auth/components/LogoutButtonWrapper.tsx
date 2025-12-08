import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LogoutButton } from './LogoutButton';

export function LogoutButtonWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <LogoutButton />
    </QueryClientProvider>
  );
}
