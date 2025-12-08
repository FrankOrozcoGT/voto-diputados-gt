import { useEffect, useState } from 'react';
import { useAuthStore } from '../_stores/authStore';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const session = useAuthStore((state) => state.session);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Dar tiempo para que Zustand cargue desde localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      if (!session) {
        window.location.href = '/login';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [session]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
