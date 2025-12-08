import { useAuthStore } from '@/features/auth/_stores/authStore';

export function Header() {
  const session = useAuthStore((state) => state.session);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Título */}
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <span className="text-2xl">🏛️</span>
            <span>Congreso Guatemala</span>
          </a>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Inicio
            </a>
            <a href="/partidos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Partidos
            </a>
          </nav>

          {/* Usuario */}
          <div className="flex items-center gap-3">
            {session?.user.avatarUrl && (
              <img 
                src={session.user.avatarUrl} 
                alt={session.user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-gray-700">
              {session?.user.name || 'Usuario'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
