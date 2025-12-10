import { useAuthStore } from '@/features/auth/_stores/authStore';
import { UserDropdown } from './UserDropdown';
import { useEffect, useState } from 'react';

export function Header() {
  const session = useAuthStore((state) => state.session);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = 'font-medium transition-colors px-3 py-2 rounded';
    const activeClass = isActive(path)
      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
      : 'text-gray-700 hover:text-blue-600';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Título */}
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <span className="text-2xl">🏛️</span>
            <span>Congreso Guatemala</span>
          </a>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="/" className={getLinkClass('/')}>
              Inicio
            </a>
            <a href="/partidos" className={getLinkClass('/partidos')}>
              Partidos
            </a>
            <a href="/votaciones" className={getLinkClass('/votaciones')}>
              Votaciones
            </a>
            <a href="/iniciativas" className={getLinkClass('/iniciativas')}>
              Iniciativas
            </a>
          </nav>

          {/* Usuario */}
          {session?.user && (
            <UserDropdown
              userName={session.user.name || 'Usuario'}
              userEmail={session.user.email}
              avatarUrl={session.user.avatarUrl}
            />
          )}
        </div>
      </div>
    </header>
  );
}
