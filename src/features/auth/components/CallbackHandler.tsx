import { useEffect } from 'react';
import { useAuthStore } from '../_stores/authStore';
import { AuthOrchestrator } from '@/core/auth/application/usecases/AuthOrchestrator';
import { AuthRepositoryImpl } from '@/core/auth/infrastructure/adapters/AuthRepositoryImpl';

const authOrchestrator = new AuthOrchestrator(new AuthRepositoryImpl());

export function CallbackHandler() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const session = await authOrchestrator.handleCallback();
        setSession(session);
        window.location.href = '/';
      } catch (error) {
        console.error('Error en callback:', error);
        window.location.href = '/login?error=auth_failed';
      }
    };

    handleAuth();
  }, [setSession]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  );
}
