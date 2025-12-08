import { useMutation } from '@tanstack/react-query';
import { AuthOrchestrator } from '@/core/auth/application/usecases/AuthOrchestrator';
import { AuthRepositoryImpl } from '@/core/auth/infrastructure/adapters/AuthRepositoryImpl';
import { useAuthStore } from '../_stores/authStore';

const authOrchestrator = new AuthOrchestrator(new AuthRepositoryImpl());

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      await authOrchestrator.executeLogout();
    },
    onSuccess: () => {
      clearSession();
      window.location.href = '/login';
    },
  });
}
