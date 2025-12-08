import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LoginButton } from './LoginButton';

export function LoginButtonWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginButton />
    </QueryClientProvider>
  );
}
