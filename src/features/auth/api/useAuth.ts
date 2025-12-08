import { useMutation } from '@tanstack/react-query';
import { AuthOrchestrator } from '@/core/auth/application/usecases/AuthOrchestrator';
import { AuthRepositoryImpl } from '@/core/auth/infrastructure/adapters/AuthRepositoryImpl';

const repository = new AuthRepositoryImpl();
const orchestrator = new AuthOrchestrator(repository);

export function useLoginWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      await orchestrator.executeGoogleLogin();
    },
    onError: (error) => {
      console.error('Error en login:', error);
    },
  });
}
